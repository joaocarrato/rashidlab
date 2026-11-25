import { createClient } from "@/lib/supabase/server";
import type { AllData, Combo, Flow, Log, Matchup, Video } from "./types";

type DataKey = keyof AllData;
type SB = Awaited<ReturnType<typeof createClient>>;

function ok<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
}

async function load(sb: SB, key: DataKey): Promise<AllData[DataKey]> {
  switch (key) {
    case "logs":
      return ok(await sb.from("logs").select("id,opp,result,tags,lesson,code,played_on,created_at")
        .order("played_on", { ascending: false }).order("created_at", { ascending: false }).limit(1000)) as Log[];
    case "combos":
      return ok(await sb.from("combos").select("id,title,sit,notation,dmg,cost,status,video,notes").order("created_at")) as Combo[];
    case "matchups":
      return ok(await sb.from("matchups").select("char,plan,avoid,tools,notes")) as Matchup[];
    case "videos":
      return ok(await sb.from("videos").select("id,url,title,tag,char,ts,note,seen,created_at")
        .order("created_at", { ascending: false })) as Video[];
    case "flows":
      return ok(await sb.from("flows").select("id,title,char,root").order("created_at")) as Flow[];
    case "focus": {
      const r = await sb.from("focus").select("text").maybeSingle();
      return (r.data as { text: string } | null)?.text ?? "";
    }
  }
}

/**
 * Carrega só as tabelas que a tela usa, todas em paralelo.
 * Ex.: `await getData(["combos"])` na tela de Combos.
 */
export async function getData<K extends DataKey>(keys: readonly K[]): Promise<Pick<AllData, K>> {
  const sb = await createClient();
  const values = await Promise.all(keys.map((k) => load(sb, k)));
  return Object.fromEntries(keys.map((k, i) => [k, values[i]])) as Pick<AllData, K>;
}

const ALL = ["logs", "combos", "matchups", "videos", "flows", "focus"] as const;

/** Tudo (usado pelo backup). */
export const getAll = () => getData(ALL);
