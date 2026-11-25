export type Result = "W" | "L";

export interface Log {
  id: string;
  opp: string;
  result: Result;
  tags: string[];
  lesson: string;
  code: string;
  played_on: string;
  created_at: string;
}

export interface Combo {
  id: string;
  title: string;
  sit: string;
  notation: string;
  dmg: number | null;
  cost: string;
  status: number;
  video: string;
  notes: string;
}

export interface Matchup {
  char: string;
  plan: string;
  avoid: string;
  tools: string;
  notes: string;
}

export interface Video {
  id: string;
  url: string;
  title: string;
  tag: string;
  char: string;
  ts: string;
  note: string;
  seen: boolean;
  created_at: string;
}

export type NodeType = "s" | "d" | "a";

export interface FlowNode {
  id: string;
  t: string;
  type: NodeType;
  lk: string;
  kids: FlowNode[];
}

export interface Flow {
  id: string;
  title: string;
  char: string;
  root: FlowNode;
}

export interface AllData {
  logs: Log[];
  combos: Combo[];
  matchups: Matchup[];
  videos: Video[];
  flows: Flow[];
  focus: string;
}
