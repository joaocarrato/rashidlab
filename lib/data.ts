import { createClient } from "@/lib/supabase/server";
import type { AllData, Combo, Flow, Log, Matchup, Video } from "./types";

/** Carrega tudo de uma vez: o volume de um jogador é pequeno e as telas cruzam os dados. */
export async function getAll(): Promise<AllData> {
  const sb = await createClient();
  const [logs, combos, matchups, videos, flows, focus] = await Promise.all([
    sb.from("logs").select("id,opp,result,tags,lesson,code,played_on,created_at")
      .order("played_on", { ascending: false }).order("created_at", { ascending: false }).limit(1000),
    sb.from("combos").select("id,title,sit,notation,dmg,cost,status,video,notes").order("created_at"),
    sb.from("matchups").select("char,plan,avoid,tools,notes"),
    sb.from("videos").select("id,url,title,tag,char,ts,note,seen,created_at").order("created_at", { ascending: false }),
    sb.from("flows").select("id,title,char,root").order("created_at"),
    sb.from("focus").select("text").maybeSingle(),
  ]);
  const failed = [logs, combos, matchups, videos, flows].find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);
  return {
    logs: (logs.data ?? []) as Log[],
    combos: (combos.data ?? []) as Combo[],
    matchups: (matchups.data ?? []) as Matchup[],
    videos: (videos.data ?? []) as Video[],
    flows: (flows.data ?? []) as Flow[],
    focus: (focus.data as { text: string } | null)?.text ?? "",
  };
}
