import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/main";
import { getEverything } from "@/lib/data";
import { SITS, STATUS, TAGS, VTAGS, isChar, normChar, slug, APP } from "@/lib/constants";
import { sanitizeNode } from "@/lib/flow";
import type { FlowNode } from "@/lib/types";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const https = (v: unknown) => (/^https:\/\//i.test(str(v, 600)) ? str(v, 600) : "");
const arr = (v: unknown, max: number): Record<string, unknown>[] =>
  Array.isArray(v) ? (v.slice(0, max).filter((x) => x && typeof x === "object") as Record<string, unknown>[]) : [];
/** Personagem válido (aceita o nome antigo "Rashid (espelho)") ou "". */
const ch = (v: unknown) => {
  const c = normChar(str(v, 40));
  return isChar(c) ? c : "";
};

const APP_ID = slug(APP.name);
const LEGACY_ID = "rashid-lab";

/** v2: cada linha traz `main` (o personagem com quem você joga). */
export async function GET() {
  const { userId, main } = await getContext().catch(() => ({ userId: null, main: null }));
  if (!userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!main) return NextResponse.json({ error: "Escolha um personagem primeiro" }, { status: 400 });
  const d = await getEverything();
  const body = {
    app: APP_ID, v: 2, exportedAt: new Date().toISOString(),
    state: {
      mains: d.mains.map((m) => m.char),
      logs: d.logs.map((l) => ({ main: l.main, opp: l.opp, result: l.result, tags: l.tags, lesson: l.lesson, code: l.code, date: l.played_on })),
      combos: d.combos,
      matchups: d.matchups,
      videos: d.videos,
      flows: d.flows,
      meta: d.focus.map((f) => ({ id: "focus", main: f.main, text: f.text })),
    },
  };
  return new NextResponse(JSON.stringify(body, null, 1), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${APP_ID}-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(req: Request) {
  const ctx = await getContext().catch(() => null);
  if (!ctx?.userId) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const { sb, userId } = ctx;

  let j: { app?: string; state?: Record<string, unknown> };
  try { j = await req.json(); } catch { return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 }); }
  if ((j.app !== APP_ID && j.app !== LEGACY_ID) || !j.state || typeof j.state !== "object")
    return NextResponse.json({ error: `Este arquivo não é um backup do ${APP.name}` }, { status: 400 });
  const st = j.state;

  // Linhas sem personagem (backup antigo) entram como Rashid, que era o único personagem do Rashid Lab.
  const fallback = j.app === LEGACY_ID ? "Rashid" : ctx.main ?? "Rashid";
  const mainOf = (r: Record<string, unknown>) => ch(r.main) || fallback;
  const used = new Set<string>();
  const tagMain = (m: string) => (used.add(m), m);

  const comboMap = new Map<string, string>();
  const videoMap = new Map<string, string>();

  const combos = arr(st.combos, 2000).map((c) => {
    const id = randomUUID();
    if (typeof c.id === "string") comboMap.set(c.id, id);
    const status = Math.min(2, Math.max(0, Number(c.status) || 0));
    const dmg = c.dmg === null || c.dmg === "" || c.dmg === undefined ? null : Math.round(Number(c.dmg));
    return {
      id, user_id: userId, main: tagMain(mainOf(c)), title: str(c.title, 120) || "Sem nome",
      sit: SITS.includes(str(c.sit)) ? str(c.sit) : SITS[0],
      notation: str(c.notation, 600), dmg: Number.isFinite(dmg) ? dmg : null, cost: str(c.cost, 80),
      status: STATUS[status] ? status : 0, video: https(c.video), notes: str(c.notes, 1000),
    };
  });

  const videos = arr(st.videos, 3000).map((v) => {
    const id = randomUUID();
    if (typeof v.id === "string") videoMap.set(v.id, id);
    return {
      id, user_id: userId, main: mainOf(v), url: https(v.url), title: str(v.title, 160),
      tag: VTAGS.includes(str(v.tag)) ? str(v.tag) : VTAGS[0],
      char: ch(v.char), ts: str(v.ts, 20), note: str(v.note, 1000), seen: Boolean(v.seen),
    };
  }).filter((v) => v.url && tagMain(v.main));

  const remap = (n: FlowNode): FlowNode => {
    const [kind, old] = n.lk.split(":");
    const lk = kind === "c" && comboMap.has(old) ? "c:" + comboMap.get(old) : kind === "v" && videoMap.has(old) ? "v:" + videoMap.get(old) : "";
    return { ...n, lk, kids: n.kids.map(remap) };
  };
  const flows = arr(st.flows, 600).map((f) => ({
    user_id: userId, main: tagMain(mainOf(f)), title: str(f.title, 120) || "Sem nome",
    char: ch(f.char), root: remap(sanitizeNode(f.root)),
  }));

  const logs = arr(st.logs, 20000).filter((l) => ch(l.opp)).map((l) => {
    const date = str(l.date, 10);
    const row: Record<string, unknown> = {
      user_id: userId, main: tagMain(mainOf(l)), opp: ch(l.opp), result: l.result === "W" ? "W" : "L",
      tags: Array.isArray(l.tags) ? l.tags.filter((t) => TAGS.includes(String(t))).slice(0, 4) : [],
      lesson: str(l.lesson, 300), code: str(l.code, 40),
    };
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) row.played_on = date;
    return row;
  });

  const matchups = arr(st.matchups, 1000).filter((m) => ch(m.char)).map((m) => ({
    user_id: userId, main: tagMain(mainOf(m)), char: ch(m.char), plan: str(m.plan, 1500), avoid: str(m.avoid, 1500),
    tools: str(m.tools, 1500), notes: str(m.notes, 2000),
  }));

  const focus = arr(st.meta, 100).filter((m) => m.id === "focus" && str(m.text, 400))
    .map((m) => ({ user_id: userId, main: tagMain(mainOf(m)), text: str(m.text, 400) }));

  if (Array.isArray(st.mains)) st.mains.forEach((m) => { const c = ch(m); if (c) used.add(c); });
  const mains = [...used].map((char) => ({ user_id: userId, char }));

  const steps: [string, () => PromiseLike<{ error: { message: string } | null }>][] = [
    ["personagens", () => sb.from("mains").upsert(mains, { onConflict: "user_id,char", ignoreDuplicates: true })],
    ["combos", () => sb.from("combos").insert(combos)],
    ["videos", () => sb.from("videos").insert(videos)],
    ["flows", () => sb.from("flows").insert(flows)],
    ["logs", () => sb.from("logs").insert(logs)],
    ["matchups", () => sb.from("matchups").upsert(matchups, { onConflict: "user_id,main,char" })],
    ["foco", () => sb.from("focus").upsert(focus, { onConflict: "user_id,main" })],
  ];
  for (const [name, run] of steps) {
    const { error } = await run();
    if (error) return NextResponse.json({ error: `Falhou em ${name}: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    counts: {
      personagens: mains.length, partidas: logs.length, combos: combos.length, matchups: matchups.length,
      videos: videos.length, fluxogramas: flows.length,
    },
  });
}
