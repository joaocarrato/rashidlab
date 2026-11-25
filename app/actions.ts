"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { SITS, TAGS, VTAGS, isChar } from "@/lib/constants";
import { SEED_COMBOS, SEED_FLOWS, N, cloneN, sanitizeNode } from "@/lib/flow";
import type { FlowNode } from "@/lib/types";

type Data = Record<string, unknown>;

const s = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const httpsUrl = (v: unknown) => {
  const x = s(v, 600);
  return /^https:\/\//i.test(x) ? x : "";
};
const isDate = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const touch = () => revalidatePath("/", "layout");
function ok(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/* ---------- partidas ---------- */
export async function saveLog(id: string | null, d: Data) {
  const { sb } = await requireUser();
  const opp = s(d.opp, 40);
  if (!isChar(opp)) throw new Error("Oponente inválido");
  const row: Data = {
    opp,
    result: d.result === "W" ? "W" : "L",
    tags: Array.isArray(d.tags) ? d.tags.filter((t) => TAGS.includes(String(t))).slice(0, 4) : [],
    lesson: s(d.lesson, 300),
    code: s(d.code, 40),
  };
  if (isDate(d.date)) row.played_on = d.date;
  const { error } = id ? await sb.from("logs").update(row).eq("id", id) : await sb.from("logs").insert(row);
  ok(error);
  touch();
}
export async function deleteLog(id: string) {
  const { sb } = await requireUser();
  ok((await sb.from("logs").delete().eq("id", id)).error);
  touch();
}

/* ---------- combos ---------- */
export async function saveCombo(id: string | null, d: Data) {
  const { sb } = await requireUser();
  const title = s(d.title, 120);
  if (!title) throw new Error("Dê um nome ao combo");
  const dmg = d.dmg === null || d.dmg === "" || d.dmg === undefined ? null : Math.round(Number(d.dmg));
  const row = {
    title,
    sit: SITS.includes(s(d.sit)) ? s(d.sit) : SITS[0],
    notation: s(d.notation, 600),
    dmg: Number.isFinite(dmg) ? dmg : null,
    cost: s(d.cost, 80),
    status: Math.min(2, Math.max(0, Number(d.status) || 0)),
    video: httpsUrl(d.video),
    notes: s(d.notes, 1000),
  };
  const { error } = id ? await sb.from("combos").update(row).eq("id", id) : await sb.from("combos").insert(row);
  ok(error);
  touch();
}
export async function cycleCombo(id: string, status: number) {
  const { sb } = await requireUser();
  ok((await sb.from("combos").update({ status: (status + 1) % 3 }).eq("id", id)).error);
  touch();
}
export async function deleteCombo(id: string) {
  const { sb } = await requireUser();
  ok((await sb.from("combos").delete().eq("id", id)).error);
  touch();
}
export async function seedCombos() {
  const { sb } = await requireUser();
  const { count } = await sb.from("combos").select("id", { count: "exact", head: true });
  if (count) return;
  ok((await sb.from("combos").insert(SEED_COMBOS.map(([title, sit]) => ({ title, sit })))).error);
  touch();
}

/* ---------- matchups ---------- */
export async function saveMatchup(char: string, d: Data) {
  const { sb, user } = await requireUser();
  if (!isChar(char)) throw new Error("Personagem inválido");
  const row = {
    user_id: user.id, char,
    plan: s(d.plan, 1500), avoid: s(d.avoid, 1500), tools: s(d.tools, 1500), notes: s(d.notes, 2000),
    updated_at: new Date().toISOString(),
  };
  ok((await sb.from("matchups").upsert(row, { onConflict: "user_id,char" })).error);
  touch();
}

/* ---------- vídeos ---------- */
export async function saveVideo(id: string | null, d: Data) {
  const { sb } = await requireUser();
  const url = httpsUrl(d.url);
  if (!url) throw new Error("Use um link que comece com https://");
  const char = s(d.char, 40);
  const row = {
    url,
    title: s(d.title, 160),
    tag: VTAGS.includes(s(d.tag)) ? s(d.tag) : VTAGS[0],
    char: isChar(char) ? char : "",
    ts: s(d.ts, 20),
    note: s(d.note, 1000),
  };
  const { error } = id ? await sb.from("videos").update(row).eq("id", id) : await sb.from("videos").insert(row);
  ok(error);
  touch();
}
export async function toggleSeen(id: string, seen: boolean) {
  const { sb } = await requireUser();
  ok((await sb.from("videos").update({ seen }).eq("id", id)).error);
  touch();
}
export async function deleteVideo(id: string) {
  const { sb } = await requireUser();
  ok((await sb.from("videos").delete().eq("id", id)).error);
  touch();
}

/* ---------- fluxogramas ---------- */
export async function saveFlow(id: string, d: { title: string; char: string; root: FlowNode }) {
  const { sb } = await requireUser();
  const row = {
    title: s(d.title, 120) || "Sem nome",
    char: isChar(s(d.char, 40)) ? s(d.char, 40) : "",
    root: sanitizeNode(d.root),
    updated_at: new Date().toISOString(),
  };
  ok((await sb.from("flows").update(row).eq("id", id)).error);
  touch();
}
export async function createFlow() {
  const { sb } = await requireUser();
  const { data, error } = await sb
    .from("flows").insert({ title: "Novo fluxograma", root: N("Situação inicial", "s") }).select("id").single();
  ok(error);
  touch();
  redirect(`/fluxo?id=${data!.id}`);
}
export async function duplicateFlow(id: string) {
  const { sb } = await requireUser();
  const { data: f, error } = await sb.from("flows").select("title,char,root").eq("id", id).single();
  ok(error);
  const { data, error: e2 } = await sb
    .from("flows")
    .insert({ title: `${f!.title} (cópia)`, char: f!.char, root: cloneN(sanitizeNode(f!.root)) })
    .select("id").single();
  ok(e2);
  touch();
  redirect(`/fluxo?id=${data!.id}`);
}
export async function deleteFlow(id: string) {
  const { sb } = await requireUser();
  ok((await sb.from("flows").delete().eq("id", id)).error);
  touch();
  redirect("/fluxo");
}
export async function seedFlows() {
  const { sb } = await requireUser();
  const { count } = await sb.from("flows").select("id", { count: "exact", head: true });
  if (count) return;
  ok((await sb.from("flows").insert(SEED_FLOWS())).error);
  touch();
}
/** Cria um fluxograma para o matchup a partir do plano geral (ou de um esqueleto). */
export async function createMatchupFlow(char: string) {
  const { sb } = await requireUser();
  if (!isChar(char)) throw new Error("Personagem inválido");
  const { data: base } = await sb.from("flows").select("root,title,char").order("created_at");
  const general = (base ?? []).find((f) => !f.char && String(f.title).startsWith("Neutro")) ?? (base ?? []).find((f) => !f.char);
  const root = general
    ? cloneN(sanitizeNode(general.root))
    : N("Neutro", "s", [N("Oponente faz X?", "d", [N("Minha resposta: [preencher]", "a")])]);
  ok((await sb.from("flows").insert({ title: `Plano vs ${char}`, char, root })).error);
  touch();
}

/* ---------- foco ---------- */
export async function saveFocus(text: string) {
  const { sb, user } = await requireUser();
  ok((await sb.from("focus").upsert({ user_id: user.id, text: s(text, 400), updated_at: new Date().toISOString() })).error);
  touch();
}
