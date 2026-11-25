import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { getAll } from "@/lib/data";
import { SITS, STATUS, TAGS, VTAGS, isChar } from "@/lib/constants";
import { sanitizeNode } from "@/lib/flow";
import type { FlowNode } from "@/lib/types";

export const dynamic = "force-dynamic";

const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const https = (v: unknown) => (/^https:\/\//i.test(str(v, 600)) ? str(v, 600) : "");
const arr = (v: unknown, max: number): Record<string, unknown>[] =>
  Array.isArray(v) ? (v.slice(0, max).filter((x) => x && typeof x === "object") as Record<string, unknown>[]) : [];

/** Mesmo formato do backup do artifact antigo (app: "rashid-lab", v: 1), para ir e voltar. */
export async function GET() {
  try { await requireUser(); } catch { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }
  const d = await getAll();
  const body = {
    app: "rashid-lab", v: 1, exportedAt: new Date().toISOString(),
    state: {
      logs: d.logs.map((l) => ({ opp: l.opp, result: l.result, tags: l.tags, lesson: l.lesson, code: l.code, date: l.played_on })),
      combos: d.combos,
      matchups: d.matchups,
      videos: d.videos.map((v) => ({ id: v.id, url: v.url, title: v.title, tag: v.tag, char: v.char, ts: v.ts, note: v.note, seen: v.seen })),
      flows: d.flows.map((f) => ({ title: f.title, char: f.char, root: f.root })),
      meta: [{ id: "focus", text: d.focus }],
    },
  };
  return new NextResponse(JSON.stringify(body, null, 1), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="rashid-lab-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(req: Request) {
  let sb, user;
  try { ({ sb, user } = await requireUser()); } catch { return NextResponse.json({ error: "Não autenticado" }, { status: 401 }); }

  let j: { app?: string; state?: Record<string, unknown> };
  try { j = await req.json(); } catch { return NextResponse.json({ error: "Arquivo inválido" }, { status: 400 }); }
  if (j.app !== "rashid-lab" || !j.state || typeof j.state !== "object")
    return NextResponse.json({ error: "Este arquivo não é um backup do Rashid Lab" }, { status: 400 });
  const st = j.state;

  const comboMap = new Map<string, string>();
  const videoMap = new Map<string, string>();

  const combos = arr(st.combos, 500).map((c) => {
    const id = randomUUID();
    if (typeof c.id === "string") comboMap.set(c.id, id);
    const status = Math.min(2, Math.max(0, Number(c.status) || 0));
    const dmg = c.dmg === null || c.dmg === "" || c.dmg === undefined ? null : Math.round(Number(c.dmg));
    return {
      id, user_id: user.id, title: str(c.title, 120) || "Sem nome",
      sit: SITS.includes(str(c.sit)) ? str(c.sit) : SITS[0],
      notation: str(c.notation, 600), dmg: Number.isFinite(dmg) ? dmg : null, cost: str(c.cost, 80),
      status: STATUS[status] ? status : 0, video: https(c.video), notes: str(c.notes, 1000),
    };
  });

  const videos = arr(st.videos, 1000).map((v) => {
    const id = randomUUID();
    if (typeof v.id === "string") videoMap.set(v.id, id);
    return {
      id, user_id: user.id, url: https(v.url), title: str(v.title, 160),
      tag: VTAGS.includes(str(v.tag)) ? str(v.tag) : VTAGS[0],
      char: isChar(str(v.char, 40)) ? str(v.char, 40) : "",
      ts: str(v.ts, 20), note: str(v.note, 1000), seen: Boolean(v.seen),
    };
  }).filter((v) => v.url);

  const remap = (n: FlowNode): FlowNode => {
    const [kind, old] = n.lk.split(":");
    const lk = kind === "c" && comboMap.has(old) ? "c:" + comboMap.get(old) : kind === "v" && videoMap.has(old) ? "v:" + videoMap.get(old) : "";
    return { ...n, lk, kids: n.kids.map(remap) };
  };
  const flows = arr(st.flows, 200).map((f) => ({
    user_id: user.id, title: str(f.title, 120) || "Sem nome",
    char: isChar(str(f.char, 40)) ? str(f.char, 40) : "", root: remap(sanitizeNode(f.root)),
  }));

  const logs = arr(st.logs, 5000).filter((l) => isChar(str(l.opp, 40))).map((l) => {
    const date = str(l.date, 10);
    const row: Record<string, unknown> = {
      user_id: user.id, opp: str(l.opp, 40), result: l.result === "W" ? "W" : "L",
      tags: Array.isArray(l.tags) ? l.tags.filter((t) => TAGS.includes(String(t))).slice(0, 4) : [],
      lesson: str(l.lesson, 300), code: str(l.code, 40),
    };
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) row.played_on = date;
    return row;
  });

  const matchups = arr(st.matchups, 100).filter((m) => isChar(str(m.char, 40))).map((m) => ({
    user_id: user.id, char: str(m.char, 40), plan: str(m.plan, 1500), avoid: str(m.avoid, 1500),
    tools: str(m.tools, 1500), notes: str(m.notes, 2000),
  }));

  const focusText = str(arr(st.meta, 10).find((m) => m.id === "focus")?.text, 400);

  const steps: [string, PromiseLike<{ error: { message: string } | null }>][] = [
    ["combos", sb.from("combos").insert(combos)],
    ["videos", sb.from("videos").insert(videos)],
    ["flows", sb.from("flows").insert(flows)],
    ["logs", sb.from("logs").insert(logs)],
    ["matchups", sb.from("matchups").upsert(matchups, { onConflict: "user_id,char" })],
  ];
  for (const [name, p] of steps) {
    const { error } = await p;
    if (error) return NextResponse.json({ error: `Falhou em ${name}: ${error.message}` }, { status: 500 });
  }
  if (focusText) await sb.from("focus").upsert({ user_id: user.id, text: focusText });

  return NextResponse.json({
    ok: true, counts: { partidas: logs.length, combos: combos.length, matchups: matchups.length, videos: videos.length, fluxogramas: flows.length },
  });
}
