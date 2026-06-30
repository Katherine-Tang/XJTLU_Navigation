import { campusMapHotspots } from "./campusMapHotspots";

/**
 * 校园步行路网（无向边），与示意图一致：楼为节点，相邻楼之间可通行。
 * 边权在运行时按地图上的百分比坐标欧氏距离计算，近似步行远近。
 */
export const CAMPUS_WALK_EDGES: readonly [string, string][] = [
  ["ls", "fb"],
  ["fb", "cb"],
  ["cb", "sa"],
  ["cb", "sb"],
  ["cb", "sc"],
  ["cb", "sd"],
  /** S 楼群内部互通（可在 SA/SB/SC/SD 之间穿行） */
  ["sa", "sb"],
  ["sb", "sc"],
  ["sc", "sd"],
  ["sa", "pb"],
  ["sb", "ee"],
  ["sc", "ee"],
  ["sd", "ee"],
  ["pb", "ma"],
  ["pb", "ee"],
  ["ma", "mb"],
  ["mb", "eb"],
  ["mb", "ee"],
  ["eb", "ee"],
  ["ee", "ia"],
  ["ia", "gym"],
  ["ia", "ir"],
  ["ia", "hs"],
  ["ir", "as"],
  ["ir", "bs"],
  ["bs", "hs"],
  ["bs", "es"],
  ["hs", "es"],
  ["hs", "db"],
  ["es", "db"],
] as const;

function hotspotPositions(): Map<string, { x: number; y: number }> {
  const m = new Map<string, { x: number; y: number }>();
  for (const h of campusMapHotspots) {
    m.set(h.id, { x: h.x, y: h.y });
  }
  return m;
}

function buildWeightedAdj(): Map<string, { to: string; w: number }[]> {
  const pos = hotspotPositions();
  const adj = new Map<string, { to: string; w: number }[]>();
  const addEdge = (a: string, b: string) => {
    const pa = pos.get(a);
    const pb = pos.get(b);
    if (!pa || !pb) return;
    const w = Math.hypot(pa.x - pb.x, pa.y - pb.y);
    if (!adj.has(a)) adj.set(a, []);
    if (!adj.has(b)) adj.set(b, []);
    adj.get(a)!.push({ to: b, w });
    adj.get(b)!.push({ to: a, w });
  };
  for (const [u, v] of CAMPUS_WALK_EDGES) {
    addEdge(u, v);
  }
  return adj;
}

let cachedAdj: Map<string, { to: string; w: number }[]> | null = null;

export function campusWalkAdjacency(): Map<string, { to: string; w: number }[]> {
  if (!cachedAdj) cachedAdj = buildWeightedAdj();
  return cachedAdj;
}

/** Dijkstra 最短路径（非负权） */
export function dijkstraShortestPath(
  adj: Map<string, { to: string; w: number }[]>,
  start: string,
  goal: string,
): { path: string[]; cost: number } | null {
  if (start === goal) return { path: [start], cost: 0 };
  if (!adj.has(start) || !adj.has(goal)) return null;

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();

  for (const k of adj.keys()) {
    dist.set(k, Infinity);
    prev.set(k, null);
  }
  dist.set(start, 0);

  while (true) {
    let u: string | null = null;
    let best = Infinity;
    for (const [node, d] of dist) {
      if (visited.has(node) || !Number.isFinite(d)) continue;
      if (d < best) {
        best = d;
        u = node;
      }
    }
    if (u === null || !Number.isFinite(best)) break;
    if (u === goal) break;
    visited.add(u);
    for (const { to, w } of adj.get(u) ?? []) {
      const nd = best + w;
      if (nd < (dist.get(to) ?? Infinity)) {
        dist.set(to, nd);
        prev.set(to, u);
      }
    }
  }

  const goalDist = dist.get(goal);
  if (goalDist === undefined || !Number.isFinite(goalDist)) return null;

  const path: string[] = [];
  let cur: string | null = goal;
  while (cur) {
    path.push(cur);
    cur = prev.get(cur) ?? null;
  }
  path.reverse();
  return { path, cost: goalDist };
}

export function shortestCampusWalkPath(
  startId: string,
  endId: string,
): { path: string[]; cost: number } | null {
  return dijkstraShortestPath(campusWalkAdjacency(), startId, endId);
}

/** 百分比距离换算为约米数（与 `PicturesAndMapScreen` 原直线估算同一量级） */
export function campusGraphCostToApproxMeters(cost: number): number {
  return Math.max(40, Math.round(cost * 8));
}
