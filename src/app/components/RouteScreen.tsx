import { useState } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, Burst } from "./PhoneShell";
import { BottomNav } from "./BottomNav";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import {
  IconHeart, IconPlay, IconClock, IconPin, IconSparkle,
} from "./ComicIcons";
import { EmojiDisplay } from "./AppEmojis";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

type RouteStopPoint = { id: string; x?: number; y?: number };

const routeDefs = [
  {
    id: "freshman",
    titleKey: "route_freshman",
    durationKey: "route_rec_dur_freshman",
    stopKeys: [
      "stop_rec_north_sign",
      "stop_admin",
      "stop_library",
      "stop_rec_white_pavilion_plaza",
      "stop_rec_orient_occident",
      "stop_rec_lake_plaza",
      "stop_gym",
    ],
    stopMapPoints: [
      { id: "fb", x: 41, y: 34 }, // 北门：FB 上方
      { id: "fb" },
      { id: "cb" },
      { id: "ee", x: 56, y: 63 }, // 小白亭广场：EE 左侧
      { id: "ia", x: 62, y: 69 }, // 东西汇廊：EE 与 IA 之间
      { id: "ir", x: 58, y: 78 }, // 中心湖广场：IR/IA/BS/HS 中间
      { id: "gym" },
    ] satisfies RouteStopPoint[],
    emoji: "🌱", bg: C.pale, tagBg: C.sky,
  },
  {
    id: "parent",
    titleKey: "route_parent",
    durationKey: "route_rec_dur_parent",
    stopKeys: [
      "stop_rec_north_sign",
      "stop_teaching_complex",
      "stop_rec_orient_occident",
      "stop_rec_lake_plaza",
    ],
    stopMapPoints: [
      { id: "fb", x: 41, y: 34 }, // 北门：FB 上方
      { id: "sa" },
      { id: "ia", x: 62, y: 69 }, // 东西汇廊：EE 与 IA 之间
      { id: "ir", x: 58, y: 78 }, // 中心湖广场：IR/IA/BS/HS 中间
    ] satisfies RouteStopPoint[],
    emoji: "🏫", bg: C.cream, tagBg: C.yellow,
  },
  {
    id: "deep",
    titleKey: "route_deep",
    durationKey: "route_rec_dur_deep",
    stopKeys: [
      "stop_rec_north_sign",
      "stop_admin",
      "stop_library",
      "stop_rec_history_cb_g",
      "stop_rec_white_pavilion_plaza",
      "stop_rec_orient_occident",
      "stop_rec_lake_plaza",
      "stop_rec_ibss",
      "stop_gym",
    ],
    stopMapPoints: [
      { id: "fb", x: 41, y: 34 }, // 北门：FB 上方
      { id: "fb" },
      { id: "cb" },
      { id: "cb" },
      { id: "ee", x: 56, y: 63 }, // 小白亭广场：EE 左侧
      { id: "ia", x: 62, y: 69 }, // 东西汇廊：EE 与 IA 之间
      { id: "ir", x: 58, y: 78 }, // 中心湖广场：IR/IA/BS/HS 中间
      { id: "bs" },
      { id: "gym" },
    ] satisfies RouteStopPoint[],
    emoji: "✨", bg: C.mint + "55", tagBg: C.mint,
  },
];

export function RouteScreen() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* Header */}
      <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: C.sky, border: `2px solid ${C.navy}`, opacity: 0.5 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>UniBuddy</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", gap: "8px" }}>
            <EmojiDisplay emoji="🗺️" size={26} color={C.white} />
            {t("route_title")}
          </h1>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>{t("route_subtitle")}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "28px" }}>

        {/* Mystery Route */}
        <button
          onClick={() => navigate("/mystery-route")}
          style={{
            width: "100%", textAlign: "left", cursor: "pointer",
            backgroundColor: C.purple, border: `2.5px solid ${C.navy}`, borderRadius: "16px",
            boxShadow: `4px 4px 0 ${C.navy}`, padding: "14px", marginBottom: "10px",
            position: "relative", overflow: "hidden",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff18 1.2px, transparent 1.2px)", backgroundSize: "12px 12px" }} />
          <div style={{ position: "absolute", top: "6px", right: "8px" }}><Burst size={36} color={C.yellow} text="LUCKY" textColor={C.navy} /></div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <EmojiDisplay emoji="🎲" size={26} />
              <span style={{ fontSize: "18px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}` }}>{t("route_mystery")}</span>
            </div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{t("route_mystery_sub")}</p>
          </div>
        </button>

        {/* Custom Route */}
        <button
          onClick={() => navigate("/custom-route")}
          style={{
            width: "100%", textAlign: "left", cursor: "pointer",
            backgroundColor: C.sky, border: `2.5px solid ${C.navy}`, borderRadius: "16px",
            boxShadow: `4px 4px 0 ${C.navy}`, padding: "14px", marginBottom: "16px",
            position: "relative", overflow: "hidden",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
        >
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff18 1.2px, transparent 1.2px)", backgroundSize: "12px 12px" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <EmojiDisplay emoji="🧩" size={26} />
              <span style={{ fontSize: "18px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}` }}>{t("route_custom")}</span>
            </div>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>{t("route_custom_sub")}</p>
          </div>
        </button>

        {/* Section label */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <div style={{ width: "4px", height: "18px", backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
          <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("route_recommended")}</span>
          <IconSparkle size={16} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {routeDefs.map((routeDef) => {
            const isExpanded = expanded === routeDef.id;
            const favored = isFavorite(routeDef.id);
            const stops = routeDef.stopKeys.map((k) => t(k));
            const title = t(routeDef.titleKey);
            const durationLabel = t(routeDef.durationKey);
            const tourPoints = routeDef.stopMapPoints.map((point, idx) => ({
              id: point.id,
              label: stops[idx] ?? `${idx + 1}`,
              x: point.x,
              y: point.y,
            }));
            return (
              <div key={routeDef.id}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : routeDef.id)}
                  style={{
                    width: "100%", textAlign: "left",
                    backgroundColor: routeDef.bg,
                    border: `2.5px solid ${C.navy}`,
                    borderRadius: isExpanded ? "14px 14px 0 0" : "14px",
                    boxShadow: isExpanded ? `2px 2px 0 ${C.navy}` : `4px 4px 0 ${C.navy}`,
                    padding: "12px 14px",
                    display: "flex", alignItems: "center", gap: "12px",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ width: "44px", height: "44px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "12px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <EmojiDisplay emoji={routeDef.emoji} size={22} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy }}>{title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px" }}>
                      <IconClock size={12} color={C.royal} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: C.royal }}>{durationLabel}</span>
                      <IconPin size={12} color={C.royal} />
                      <span style={{ fontSize: "11px", fontWeight: 700, color: C.royal }}>{stops.length} {t("route_stops")}</span>
                    </div>
                  </div>
                  <div style={{
                    width: "28px", height: "28px", backgroundColor: C.navy, borderRadius: "8px",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ backgroundColor: C.white, border: `2.5px solid ${C.navy}`, borderTop: "none", borderBottomLeftRadius: "14px", borderBottomRightRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`, padding: "14px" }}>
                    {/* stops */}
                    <div style={{ backgroundColor: C.ice, border: `2px solid ${C.navy}`, borderRadius: "10px", padding: "10px 12px", marginBottom: "10px" }}>
                      {stops.map((stop, idx) => (
                        <div key={`${routeDef.id}-${idx}`} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "14px" }}>
                            <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: C.royal, border: `2px solid ${C.navy}`, marginTop: "3px", flexShrink: 0 }} />
                            {idx < stops.length - 1 && <div style={{ width: "2px", height: "18px", backgroundColor: C.navy + "40" }} />}
                          </div>
                          <p style={{ fontSize: "13px", fontWeight: 700, color: C.navy, paddingBottom: idx < stops.length - 1 ? "2px" : 0 }}>{stop}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() =>
                          navigate("/pictures", {
                            state: {
                              guidedTour: {
                                title,
                                subtitle: durationLabel,
                                points: tourPoints,
                              },
                            },
                          })
                        }
                        style={{ flex: 1, height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "10px", boxShadow: `3px 3px 0 ${C.navy}`, color: C.white, fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
                      >
                        <IconPlay size={14} />
                        {t("route_start")}
                      </button>
                      <button
                        onClick={() => toggleFavorite({
                          id: routeDef.id, title, emoji: routeDef.emoji,
                          type: "recommended", duration: durationLabel,
                          stops, bg: routeDef.bg, tagBg: routeDef.tagBg, tagLabel: t("type_recommended"),
                          guidedTour: {
                            title,
                            subtitle: durationLabel,
                            points: tourPoints,
                          },
                        })}
                        style={{
                          width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
                          backgroundColor: favored ? "#FFF0F0" : C.white,
                          border: `2px solid ${C.navy}`, borderRadius: "10px", boxShadow: `3px 3px 0 ${C.navy}`, cursor: "pointer",
                        }}
                      >
                        <IconHeart size={17} filled={favored} color={C.coral} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav activeTab="Route" />
    </PhoneShell>
  );
}
