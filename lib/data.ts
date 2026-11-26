import { requireMain } from "@/lib/main";
import type { AllData, Combo, Flow, Log, Matchup, Video } from "./types";

type DataKey = keyof AllData;
type SB = Awaited<ReturnType<typeof requireMain>>["sb"];

function ok<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

async function load(sb: SB, key: DataKey, main: string): Promise<AllData[DataKey]> {
  switch (key) {
    case "logs":
      return ok(await sb.from("logs").select("id,opp,result,tags,lesson,code,played_on,created_at").eq("main", main)
        .order("played_on", { ascending: false }).order("created_at", { ascending: false }).limit(1000)) as Log[];
    case "combos":
      return ok(await sb.from("combos").select("id,title,sit,notation,dmg,cost,status,video,notes").eq("main", main)
        .order("created_at")) as Combo[];
    case "matchups":
      return ok(await sb.from("matchups").select("char,plan,avoid,tools,notes").eq("main", main)) as Matchup[];
    case "videos":
      return ok(await sb.from("videos").select("id,url,title,tag,char,ts,note,seen,created_at").eq("main", main)
        .order("created_at", { ascending: false })) as Video[];
    case "flows":
      return ok(await sb.from("flows").select("id,title,char,root").eq("main", main).order("created_at")) as Flow[];
    case "focus": {
      const r = await sb.from("focus").select("text").eq("main", main).maybeSingle();
      return (r.data as { text: string } | null)?.text ?? "";
    }
  }
}

/**
 * Carrega só as tabelas que a tela usa, do personagem ativo, todas em paralelo.
 * Ex.: `await getData(["combos"])` na tela de Combos.
 */
export async function getData<K extends DataKey>(keys: readonly K[]): Promise<Pick<AllData, K> & { main: string }> {
  const { sb, main } = await requireMain();
  const values = await Promise.all(keys.map((k) => load(sb, k, main)));
  return { main, ...(Object.fromEntries(keys.map((k, i) => [k, values[i]])) as Pick<AllData, K>) };
}

/** Tudo, de todos os personagens (usado pelo backup). */
export async function getEverything() {
  const { sb } = await requireMain();
  const [mains, logs, combos, matchups, videos, flows, focus] = await Promise.all([
    sb.from("mains").select("char").order("created_at"),
    sb.from("logs").select("main,opp,result,tags,lesson,code,played_on").order("played_on"),
    sb.from("combos").select("id,main,title,sit,notation,dmg,cost,status,video,notes").order("created_at"),
    sb.from("matchups").select("main,char,plan,avoid,tools,notes"),
    sb.from("videos").select("id,main,url,title,tag,char,ts,note,seen").order("created_at"),
    sb.from("flows").select("main,title,char,root").order("created_at"),
    sb.from("focus").select("main,text"),
  ]);
  return {
    mains: ok(mains) as { char: string }[],
    logs: ok(logs) as (Omit<Log, "id" | "created_at"> & { main: string })[],
    combos: ok(combos) as (Combo & { main: string })[],
    matchups: ok(matchups) as (Matchup & { main: string })[],
    videos: ok(videos) as (Omit<Video, "created_at"> & { main: string })[],
    flows: ok(flows) as (Omit<Flow, "id"> & { main: string })[],
    focus: ok(focus) as { main: string; text: string }[],
  };
}
