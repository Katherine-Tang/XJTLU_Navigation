import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, Burst } from "./PhoneShell";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import {
  IconHeart, IconPlay, IconReset, IconBack, IconPin, IconCheck, IconSparkle,
} from "./ComicIcons";
import { EmojiDisplay } from "./AppEmojis";
import { campusMapHotspots } from "../data/campusMapHotspots";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

interface BuildingDef {
  id: string;
  /** 餐饮等需要随语言切换的名称（与 `label` 二选一展示） */
  labelKey?: string;
  label: string;
  fullName: string;
  emoji: string;
  catKey: string;
  color: string;
  bg: string;
  /** 与校园地图标注一致的百分比坐标，用于直线距离与路径规划 */
  mapX: number;
  mapY: number;
}

function buildingDisplayLabel(b: BuildingDef, t: (key: string) => string) {
  return b.labelKey ? t(b.labelKey) : b.label;
}

const DEFAULT_START_ID = "cb";

// 自定义路线的地标与 `campusMapHotspots` 同步；mapX/mapY 为地图百分比坐标。
type CampusMapHotspot = (typeof campusMapHotspots)[number];

function hotspotXY(id: string): { x: number; y: number } {
  const p = campusMapHotspots.find((h) => h.id === id);
  if (!p) throw new Error(`Unknown hotspot: ${id}`);
  return { x: p.x, y: p.y };
}

/**
 * 餐饮点位坐标（与主地图标注一致）：北宏愿靠 MB、南宏愿靠 IR、西厅靠南宏愿、东厅在 IA 楼内。
 * 用于 mapDist / 最近邻路径，偏移量可按真实地图微调。
 */
const customDiningSpots = (() => {
  const mb = hotspotXY("mb");
  const ir = hotspotXY("ir");
  const ia = hotspotXY("ia");
  return [
    { id: "north_hope", labelKey: "custom_d_north_hope", fullName: "North Hope", x: mb.x - 1, y: mb.y - 1, color: "#ef5350" },
    { id: "south_hope", labelKey: "custom_d_south_hope", fullName: "South Hope", x: ir.x - 1, y: ir.y, color: "#e57373" },
    { id: "west_hall", labelKey: "custom_d_west_hall", fullName: "West Hall", x: ir.x - 3, y: ir.y, color: "#ff8a65" },
    { id: "east_hall", labelKey: "custom_d_east_hall", fullName: "East Hall", x: ia.x + 0.4, y: ia.y - 0.3, color: "#ff8a65" },
  ] as const;
})();

function emojiForPin(id: string): string {
  if (id === "gym") return "🏟️";
  if (id === "fb") return "🏛️";
  if (id === "cb") return "📍";
  if (id === "pb") return "🧪";
  if (id === "as") return "🎬";
  if (id === "ir") return "🔬";
  if (id === "db") return "🏠";
  if (id === "north_hope" || id === "south_hope" || id === "west_hall" || id === "east_hall") return "🍜";
  return "🏢";
}

const fromCampus: BuildingDef[] = campusMapHotspots.map((pin: CampusMapHotspot) => {
  const isSports = pin.id === "gym";
  return {
    id: pin.id,
    label: pin.label,
    fullName: pin.fullName,
    emoji: emojiForPin(pin.id),
    catKey: isSports ? "cat_sports" : "cat_academic",
    color: pin.color,
    bg: isSports ? C.yellow : C.ice,
    mapX: pin.x,
    mapY: pin.y,
  };
});

const fromDining: BuildingDef[] = customDiningSpots.map((pin) => ({
  id: pin.id,
  labelKey: pin.labelKey,
  label: "",
  fullName: pin.fullName,
  emoji: emojiForPin(pin.id),
  catKey: "cat_dining",
  color: pin.color,
  bg: C.cream,
  mapX: pin.x,
  mapY: pin.y,
}));

const buildingDefs: BuildingDef[] = [...fromCampus, ...fromDining];

const categoryKeys = ["cat_all", "cat_academic", "cat_sports", "cat_dining"];

/** 地图上两点直线距离（与标注坐标同单位：百分比） */
function mapDist(a: BuildingDef, b: BuildingDef) {
  return Math.hypot(a.mapX - b.mapX, a.mapY - b.mapY);
}

/**
 * 从固定起点出发的最近邻贪心路径（在直线距离意义下的启发式最短近似）。
 * 起点为 sel[0]，依次接当前未访问点中与上一点直线距离最近者。
 */
function generateRoute(sel: BuildingDef[]): BuildingDef[] {
  if (sel.length <= 2) return [...sel];
  const d = mapDist;
  const rem = [...sel.slice(1)]; const route = [sel[0]];
  while (rem.length) {
    const last = route[route.length - 1]; let mi = 0, md = Infinity;
    rem.forEach((b, i) => { const v = d(last, b); if (v < md) { md = v; mi = i; } });
    route.push(rem.splice(mi, 1)[0]);
  }
  return route;
}

/** 将用户所选地点排成 [起点, …其余]，再交给 generateRoute */
function selectionWithStart(selected: BuildingDef[], startId: string): BuildingDef[] {
  const start = selected.find((b) => b.id === startId) ?? selected[0];
  if (!start) return [];
  const rest = selected.filter((b) => b.id !== start.id);
  return [start, ...rest];
}

type Phase = "select" | "result";

export function CustomRouteScreen() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([DEFAULT_START_ID]));
  const [startId, setStartId] = useState(DEFAULT_START_ID);
  const [activeCatKey, setActiveCatKey] = useState("cat_all");
  const [phase, setPhase] = useState<Phase>("select");
  const [route, setRoute] = useState<BuildingDef[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedIds.size === 0) {
      setStartId(DEFAULT_START_ID);
      return;
    }
    if (!selectedIds.has(startId)) {
      const next = buildingDefs.find((b) => selectedIds.has(b.id))?.id;
      if (next) setStartId(next);
    }
  }, [selectedIds, startId]);

  const toggle = (id: string) => {
    setSelectedIds((p) => {
      const n = new Set(p);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const filtered = activeCatKey === "cat_all"
    ? buildingDefs
    : buildingDefs.filter((b) => b.catKey === activeCatKey);

  const selectedBuildings = buildingDefs.filter((b) => selectedIds.has(b.id));

  const routeId = `custom-${startId}-${[...selectedIds].sort().join("-")}`;
  const fav = isFavorite(routeId);

  const handleGenerate = () => {
    if (selectedIds.size < 2) return;
    setLoading(true);
    setTimeout(() => {
      const ordered = selectionWithStart(selectedBuildings, startId);
      setRoute(generateRoute(ordered));
      setLoading(false);
      setPhase("result");
    }, 900);
  };
  const handleReset = () => {
    setSelectedIds(new Set([DEFAULT_START_ID]));
    setStartId(DEFAULT_START_ID);
    setRoute(null);
    setPhase("select");
  };

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* Header */}
      <div style={{ backgroundColor: C.sky, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", bottom: "8px", right: "20px" }}><Burst size={44} color={C.yellow} text="DIY" textColor={C.navy} /></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <button onClick={() => navigate("/")} style={{ width: "32px", height: "32px", backgroundColor: "rgba(255,255,255,0.3)", border: `2px solid rgba(255,255,255,0.5)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBack />
            </button>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{t("custom_back")}</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", gap: "8px" }}>
            <EmojiDisplay emoji="🧩" size={26} />
            {t("custom_title")}
          </h1>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>{t("custom_subtitle")}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ paddingBottom: "28px" }}>

        {/* SELECT */}
        {phase === "select" && (
          <div style={{ padding: "14px 16px 0" }}>
            {/* selected chips */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: C.navy }}>
                  {t("custom_selected")} <span style={{ color: C.royal }}>{selectedIds.size}</span> / {t("custom_min2")}
                </span>
                {selectedIds.size >= 2 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: C.mint, border: `1.5px solid ${C.navy}`, borderRadius: "8px", padding: "1px 8px", boxShadow: `2px 2px 0 ${C.navy}` }}>
                    <IconCheck size={11} color={C.navy} />
                    <span style={{ fontSize: "10px", fontWeight: 900, color: C.navy }}>{t("custom_ready")}</span>
                  </div>
                )}
              </div>
              <p style={{ fontSize: "10px", fontWeight: 700, color: "#4B6898", marginBottom: "6px" }}>{t("custom_tap_set_start")}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "28px" }}>
                {selectedBuildings.map((b) => (
                  <button key={b.id} onClick={() => toggle(b.id)} style={{ backgroundColor: b.bg, border: `2px solid ${b.color}`, borderRadius: "20px", padding: "2px 10px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", boxShadow: `2px 2px 0 ${b.id === startId ? "#aaa" : b.color}` }}>
                    <span style={{ fontSize: "12px" }}>{b.emoji}</span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: b.color }}>{buildingDisplayLabel(b, t)}</span>
                    {b.id === startId && (
                      <span style={{ fontSize: "9px", fontWeight: 900, color: C.navy, backgroundColor: C.pale, borderRadius: "4px", padding: "0 4px" }}>{t("custom_start_pt")}</span>
                    )}
                    <span style={{ fontSize: "13px", fontWeight: 900, color: b.color, lineHeight: 1 }}>×</span>
                  </button>
                ))}
              </div>
            </div>

            {/* category filter */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "10px", scrollbarWidth: "none" }}>
              {categoryKeys.map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setActiveCatKey(catKey)}
                  style={{ flexShrink: 0, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, cursor: "pointer", backgroundColor: activeCatKey === catKey ? C.royal : C.white, color: activeCatKey === catKey ? C.white : "#4B6898", border: `2px solid ${activeCatKey === catKey ? C.navy : C.pale}`, boxShadow: activeCatKey === catKey ? `2px 2px 0 ${C.navy}` : "none" }}
                >
                  {t(catKey)}
                </button>
              ))}
            </div>

            {/* Building grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {filtered.map((b) => {
                const isSel = selectedIds.has(b.id);
                const isStart = isSel && b.id === startId;
                return (
                  <div key={b.id} style={{ position: "relative" }}>
                  <button
                    type="button"
                    onClick={() => toggle(b.id)}
                    style={{
                      width: "100%", height: "90px", position: "relative",
                      backgroundColor: isSel ? b.bg : C.white,
                      border: `2.5px solid ${isSel ? b.color : C.pale}`,
                      borderRadius: "14px",
                      boxShadow: isSel ? `3px 3px 0 ${b.color}` : `2px 2px 0 ${C.pale}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2px",
                      cursor: "pointer",
                      padding: "4px 4px 6px",
                      boxSizing: "border-box",
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "translate(1px,1px)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                  >
                    {isSel && (
                      <div style={{ position: "absolute", top: "4px", right: "4px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: b.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconCheck size={9} color="white" />
                      </div>
                    )}
                    {isStart && (
                      <div style={{ position: "absolute", top: "3px", left: "5px", backgroundColor: C.pale, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 5px", fontSize: "9px", fontWeight: 900, color: C.navy }}>{t("custom_start_pt")}</div>
                    )}
                    <span style={{ fontSize: "22px" }}>{b.emoji}</span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: isSel ? b.color : C.navy, textAlign: "center", lineHeight: 1.15 }}>{buildingDisplayLabel(b, t)}</span>
                    <span style={{ fontSize: "9px", fontWeight: 600, color: "#4B6898" }}>{t(b.catKey)}</span>
                  </button>
                  {isSel && !isStart && (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setStartId(b.id); }}
                      style={{
                        marginTop: "4px", width: "100%", height: "22px", borderRadius: "8px",
                        border: `1.5px solid ${C.navy}`, backgroundColor: C.white, color: C.navy,
                        fontSize: "9px", fontWeight: 900, cursor: "pointer", boxShadow: `1px 1px 0 ${C.pale}`,
                      }}
                    >
                      {t("custom_set_start")}
                    </button>
                  )}
                  </div>
                );
              })}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={selectedIds.size < 2 || loading}
              style={{
                width: "100%", height: "52px",
                backgroundColor: selectedIds.size >= 2 ? C.royal : "#E2E8F0",
                border: `2.5px solid ${selectedIds.size >= 2 ? C.navy : C.pale}`,
                borderRadius: "12px", boxShadow: selectedIds.size >= 2 ? `3px 3px 0 ${C.navy}` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                color: selectedIds.size >= 2 ? C.white : "#94A3B8",
                fontSize: "15px", fontWeight: 900, marginBottom: "4px",
                cursor: selectedIds.size >= 2 ? "pointer" : "not-allowed",
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: "18px", height: "18px", border: `3px solid ${C.white}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  {t("custom_planning")}
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
              ) : (
                <>
                  <IconSparkle size={18} color={selectedIds.size >= 2 ? C.yellow : "#94A3B8"} />
                  {selectedIds.size >= 2 ? `${t("custom_gen_ready")} (${selectedIds.size})` : t("custom_gen_hint")}
                </>
              )}
            </button>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && route && (
          <div style={{ padding: "14px 16px 0" }}>
            {/* Summary */}
            <div style={{ backgroundColor: C.royal, border: `2.5px solid ${C.navy}`, borderRadius: "16px", boxShadow: `5px 5px 0 ${C.navy}`, padding: "16px", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff18 1.2px, transparent 1.2px)", backgroundSize: "12px 12px" }} />
              <div style={{ position: "absolute", top: "8px", right: "12px" }}><Burst size={44} color={C.yellow} /></div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: "17px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, marginBottom: "10px" }}>{t("custom_my_route")}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    `📍 ${t("custom_n_places", { n: route.length })}`,
                    ...(fav ? ["❤️"] : []),
                  ].map((tag) => (
                    <div key={tag} style={{ backgroundColor: "rgba(255,255,255,0.2)", border: `1.5px solid rgba(255,255,255,0.4)`, borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 800, color: C.white }}>{tag}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <ComicCard style={{ padding: "14px", marginBottom: "12px" }}>
              <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy, marginBottom: "12px" }}>{t("custom_detail")}</p>
              {route.map((b, idx) => {
                const isLast = idx === route.length - 1;
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "28px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: isLast ? C.coral : C.royal, border: `2px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", flexShrink: 0 }}>
                        {isLast ? <span style={{ fontSize: "12px" }}>🏁</span> : <span style={{ fontSize: "11px", fontWeight: 900, color: C.white }}>{idx + 1}</span>}
                      </div>
                      {!isLast && <div style={{ width: "2px", flex: 1, backgroundColor: C.pale, minHeight: "24px" }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "16px" }}>{b.emoji}</span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: C.navy }}>{buildingDisplayLabel(b, t)}</span>
                        <span style={{ backgroundColor: b.bg, border: `1.5px solid ${b.color}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 800, color: b.color }}>{t(b.catKey)}</span>
                      </div>
                    </div>
                    <IconPin size={12} color={b.color} />
                  </div>
                );
              })}
            </ComicCard>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <button
                onClick={() =>
                  navigate("/", {
                    state: {
                      guidedTour: {
                        title: t("custom_my_route"),
                        points: route.map((b) => ({
                          id: b.id,
                          label: buildingDisplayLabel(b, t),
                          x: b.mapX,
                          y: b.mapY,
                        })),
                      },
                    },
                  })
                }
                style={{ flex: 1, height: "50px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: C.royal, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`, color: C.white, fontSize: "15px", fontWeight: 900, cursor: "pointer" }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
              >
                <IconPlay size={15} />
                {t("custom_start")}
              </button>
              <button
                onClick={() => route && toggleFavorite({
                  id: routeId, title: t("custom_my_route").replace("🧩 ", ""),
                  emoji: "🧩", type: "custom",
                  stops: route.map((b) => buildingDisplayLabel(b, t)),
                  bg: C.pale, tagBg: C.sky, tagLabel: t("type_custom"),
                  guidedTour: {
                    title: t("custom_my_route"),
                    points: route.map((b) => ({
                      id: b.id,
                      label: buildingDisplayLabel(b, t),
                      x: b.mapX,
                      y: b.mapY,
                    })),
                  },
                })}
                style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: fav ? "#FFF0F0" : C.white, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`, cursor: "pointer" }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
              >
                <IconHeart size={20} filled={fav} color={C.coral} />
              </button>
            </div>
            <button
              onClick={handleReset}
              style={{ width: "100%", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "12px", boxShadow: `2px 2px 0 ${C.navy}`, color: C.navy, fontSize: "14px", fontWeight: 800, cursor: "pointer" }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
            >
              <IconReset size={16} />
              {t("custom_reselect")}
            </button>
          </div>
        )}
      </div>

    </PhoneShell>
  );
}
