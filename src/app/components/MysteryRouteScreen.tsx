import { useState } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, Burst } from "./PhoneShell";
import { BottomNav } from "./BottomNav";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import {
  IconPlay, IconPin, IconHeart, IconBack,
} from "./ComicIcons";
import { EmojiDisplay } from "./AppEmojis";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

const optionsDefs = [
  { id: "food", emoji: "🍱", titleKey: "mystery_opt_food_title", descKey: "mystery_opt_food_desc", bg: "#9BD1F6", border: C.navy },
  { id: "store", emoji: "🛒", titleKey: "mystery_opt_store_title", descKey: "mystery_opt_store_desc", bg: "#C7DA8E", border: C.navy },
  { id: "shuttle", emoji: "🚌", titleKey: "mystery_opt_shuttle_title", descKey: "mystery_opt_shuttle_desc", bg: "#FFD28D", border: C.navy },
  { id: "sakura", emoji: "🌸", titleKey: "mystery_opt_sakura_title", descKey: "mystery_opt_sakura_desc", bg: "#FFC0D8", border: C.navy },
  { id: "landmark", emoji: "📍", titleKey: "mystery_opt_landmark_title", descKey: "mystery_opt_landmark_desc", bg: "#D2B5F5", border: C.navy },
  { id: "study", emoji: "📘", titleKey: "mystery_opt_study_title", descKey: "mystery_opt_study_desc", bg: C.pale, border: C.navy },
];

const routeResultsDefs: Record<string, {
  id: string; titleKey: string; emoji: string; taglineKey: string;
  bg: string; stopDot: string;
  stops: { nameKey: string; note: string; mapId: string }[];
}> = {
  food: {
    id: "mystery-food", titleKey: "mystery_res_food", emoji: "🍜", taglineKey: "mystery_res_food_tag",
    bg: "#9BD1F6", stopDot: C.navy,
    stops: [
      { nameKey: "stop_food_south_north_hongyuan", note: "start", mapId: "mb" },
      { nameKey: "stop_food_tongfa", note: "mystery_note_stop_2", mapId: "ir" },
      { nameKey: "stop_food_mersey_cafe", note: "mystery_note_stop_3", mapId: "cb" },
      { nameKey: "stop_food_west_hall", note: "mystery_note_stop_4", mapId: "ir" },
      { nameKey: "stop_food_east_hall", note: "mystery_note_stop_5", mapId: "ia" },
      { nameKey: "stop_food_hungry", note: "mystery_note_stop_6", mapId: "hs" },
      { nameKey: "stop_food_fb_subway", note: "mystery_note_stop_7", mapId: "fb" },
    ],
  },
  store: {
    id: "mystery-store", titleKey: "mystery_res_store", emoji: "🥨", taglineKey: "mystery_res_store_tag",
    bg: "#C7DA8E", stopDot: C.navy,
    stops: [
      { nameKey: "stop_store_fb", note: "start", mapId: "fb" },
      { nameKey: "stop_store_library_familymart", note: "mystery_note_stop_2", mapId: "cb" },
      { nameKey: "stop_store_pb", note: "mystery_note_stop_3", mapId: "pb" },
      { nameKey: "stop_store_ir", note: "mystery_note_stop_4", mapId: "ir" },
      { nameKey: "stop_store_hs", note: "mystery_note_stop_5", mapId: "hs" },
    ],
  },
  shuttle: {
    id: "mystery-shuttle", titleKey: "mystery_res_shuttle", emoji: "🚍", taglineKey: "mystery_res_shuttle_tag",
    bg: C.yellow, stopDot: C.navy,
    stops: [
      { nameKey: "stop_shuttle_channel_1", note: "start", mapId: "cb" },
      { nameKey: "stop_shuttle_channel_2", note: "mystery_note_stop_2", mapId: "ir" },
      { nameKey: "stop_shuttle_main_road_gym", note: "mystery_note_cycle_recommended", mapId: "gym" },
    ],
  },
  sakura: {
    id: "mystery-sakura", titleKey: "mystery_res_sakura", emoji: "🌸", taglineKey: "mystery_res_sakura_tag",
    bg: "#FFC0D8", stopDot: C.navy,
    stops: [
      { nameKey: "stop_sakura_s_building", note: "start", mapId: "sa" },
      { nameKey: "stop_sakura_mb_gate", note: "mystery_note_stop_2", mapId: "mb" },
      { nameKey: "stop_sakura_es", note: "mystery_note_add_more", mapId: "es" },
    ],
  },
  landmark: {
    id: "mystery-landmark", titleKey: "mystery_res_landmark", emoji: "🏫", taglineKey: "mystery_res_landmark_tag",
    bg: "#D2B5F5", stopDot: C.navy,
    stops: [
      { nameKey: "stop_landmark_fb_lawn_statue", note: "start", mapId: "fb" },
      { nameKey: "stop_landmark_liverpool_ship", note: "mystery_note_stop_2", mapId: "cb" },
      { nameKey: "stop_landmark_small_white_pavilion", note: "mystery_note_stop_3", mapId: "sa" },
      { nameKey: "stop_landmark_channel_graffiti", note: "mystery_note_stop_4", mapId: "ir" },
      { nameKey: "stop_landmark_south_cat_statue", note: "mystery_note_stop_5", mapId: "hs" },
      { nameKey: "stop_landmark_south_lake", note: "mystery_note_stop_6", mapId: "bs" },
    ],
  },
  study: {
    id: "mystery-study", titleKey: "mystery_res_study", emoji: "📖", taglineKey: "mystery_res_study_tag",
    bg: C.pale, stopDot: C.royal,
    stops: [
      { nameKey: "stop_study_daily_cb", note: "start", mapId: "cb" },
      { nameKey: "stop_study_daily_fb", note: "mystery_note_stop_2", mapId: "fb" },
      { nameKey: "stop_study_daily_bs", note: "mystery_note_stop_3", mapId: "bs" },
      { nameKey: "stop_study_daily_zemo", note: "mystery_note_stop_4", mapId: "eb" },
      { nameKey: "stop_study_daily_mersey", note: "mystery_note_stop_5", mapId: "cb" },
      { nameKey: "stop_study_small_classrooms", note: "mystery_note_stop_6", mapId: "sa" },
      { nameKey: "stop_study_lecture_halls", note: "mystery_note_stop_7", mapId: "pb" },
      { nameKey: "stop_study_computer_rooms", note: "mystery_note_stop_8", mapId: "ee" },
      { nameKey: "stop_study_overnight_fb_cb_eb_ma_sa_bs", note: "mystery_note_overnight", mapId: "ma" },
    ],
  },
};

type Phase = "question" | "revealing" | "result";

export function MysteryRouteScreen() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("question");

  const handleSelect = (id: string) => {
    setSelected(id);
    setPhase("revealing");
    setTimeout(() => setPhase("result"), 1800);
  };
  const resultDef = selected ? routeResultsDefs[selected] : null;
  const selOpt = optionsDefs.find((o) => o.id === selected);
  const fav = resultDef ? isFavorite(resultDef.id) : false;

  const stopNote = (note: string) => note === "start" ? t("nav_start_pt") : t(note);

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* Header */}
      <div style={{ backgroundColor: C.purple, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: C.sky, border: `2px solid ${C.navy}`, opacity: 0.4 }} />
        <div style={{ position: "absolute", bottom: "10px", right: "16px" }}><Burst size={48} color={C.yellow} text="LUCKY" textColor={C.navy} /></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <button onClick={() => navigate("/route")} style={{ width: "32px", height: "32px", backgroundColor: "rgba(255,255,255,0.2)", border: `2px solid rgba(255,255,255,0.4)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBack />
            </button>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t("mystery_back")}</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", gap: "8px" }}>
            <EmojiDisplay emoji="🎲" size={26} />
            {t("mystery_title")}
          </h1>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>{t("mystery_subtitle")}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "28px" }}>

        {/* QUESTION */}
        {phase === "question" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "16px" }}>
              <div style={{ display: "inline-block", backgroundColor: C.yellow, border: "none", borderRadius: "12px", padding: "8px 16px", boxShadow: "none" }}>
                <p style={{ fontSize: "16px", fontWeight: 900, color: C.navy }}>{t("mystery_q")}</p>
              </div>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#4B6898", marginTop: "8px" }}>{t("mystery_q_sub")}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {optionsDefs.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  style={{
                    backgroundColor: opt.bg, border: `2.5px solid ${opt.border}`, borderRadius: "16px",
                    boxShadow: `4px 4px 0 ${opt.border}`, padding: "16px 12px",
                    textAlign: "left", cursor: "pointer",
                    display: "flex", flexDirection: "column", gap: "6px", minHeight: "120px",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                >
                  <span style={{ fontSize: "34px" }}>{opt.emoji}</span>
                  <p style={{ fontSize: "14px", fontWeight: 900, color: C.navy }}>{t(opt.titleKey)}</p>
                  <p style={{ fontSize: "11px", fontWeight: 600, color: "#4B6898", lineHeight: 1.4 }}>{t(opt.descKey)}</p>
                </button>
              ))}
            </div>
          </>
        )}

        {/* REVEALING */}
        {phase === "revealing" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "480px", gap: "20px" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ position: "absolute", width: "120px", height: "120px", border: `4px dashed ${C.pale}`, borderRadius: "50%", animation: "spin 1.6s linear infinite" }} />
              <div style={{ position: "absolute", width: "90px", height: "90px", border: `4px dashed ${C.yellow}`, borderRadius: "50%", animation: "spin 1s linear infinite reverse" }} />
              <div style={{ width: "68px", height: "68px", backgroundColor: C.purple, border: `3px solid ${C.navy}`, borderRadius: "50%", boxShadow: `4px 4px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px" }}>🎲</div>
            </div>
            <ComicCard style={{ padding: "12px 20px", textAlign: "center" }}>
              <p style={{ fontSize: "17px", fontWeight: 900, color: C.navy }}>{t("mystery_generating")}</p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#4B6898", marginTop: "4px" }}>{t("mystery_analyzing")}</p>
            </ComicCard>
            <div style={{ display: "flex", gap: "8px" }}>
              {[C.royal, C.purple, C.yellow].map((c, i) => (
                <div key={i} style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: c, border: `2px solid ${C.navy}`, animation: `bounce 0.6s ease-in-out ${i * 0.15}s infinite alternate` }} />
              ))}
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-8px); } }`}</style>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && resultDef && selOpt && (
          <>
            <div style={{
              backgroundColor: resultDef.bg, border: "none", borderRadius: "16px",
              boxShadow: "none", padding: "18px", marginBottom: "12px",
              textAlign: "center", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: "8px", right: "12px" }}><Burst size={40} color={C.yellow} /></div>
              <span style={{ fontSize: "46px" }}>{resultDef.emoji}</span>
              <p style={{ fontSize: "20px", fontWeight: 900, color: C.navy, marginTop: "6px" }}>{t(resultDef.titleKey)}</p>
              <p style={{ fontSize: "12px", fontWeight: 600, color: "#4B6898", marginTop: "4px", marginBottom: "10px" }}>{t(resultDef.taglineKey)}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: C.white, border: "none", borderRadius: "20px", padding: "3px 12px", boxShadow: "none" }}>
                <span style={{ fontSize: "14px" }}>{selOpt.emoji}</span>
                <span style={{ fontSize: "12px", fontWeight: 800, color: C.navy }}>{t(selOpt.titleKey)}</span>
              </div>
            </div>

            {/* Stops */}
            <ComicCard style={{ padding: "14px", marginBottom: "12px" }}>
              <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy, marginBottom: "12px" }}>📍 {t("mystery_detail")}</p>
              {resultDef.stops.map((stop, idx) => (
                <div key={stop.nameKey} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "22px" }}>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: resultDef.stopDot, border: `2px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", flexShrink: 0 }}>
                      <span style={{ fontSize: "10px", fontWeight: 900, color: C.white }}>{idx + 1}</span>
                    </div>
                    {idx < resultDef.stops.length - 1 && <div style={{ width: "2px", height: "24px", backgroundColor: C.navy + "30" }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: "6px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 700, color: C.navy }}>{t(stop.nameKey)}</p>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#4B6898" }}>{stopNote(stop.note)}</p>
                  </div>
                  <IconPin size={13} color={resultDef.stopDot} />
                </div>
              ))}
            </ComicCard>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() =>
                  navigate("/pictures", {
                    state: {
                      guidedTour: {
                        title: t(resultDef.titleKey),
                        subtitle: t(resultDef.taglineKey),
                        points: resultDef.stops.map((stop) => ({
                          id: stop.mapId,
                          label: t(stop.nameKey),
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
                {t("mystery_start")}
              </button>
              <button
                onClick={() => resultDef && toggleFavorite({
                  id: resultDef.id, title: t(resultDef.titleKey), emoji: resultDef.emoji,
                  type: "mystery", stops: resultDef.stops.map((s) => t(s.nameKey)),
                  bg: resultDef.bg, tagBg: C.purple, tagLabel: t("type_mystery"),
                  guidedTour: {
                    title: t(resultDef.titleKey),
                    subtitle: t(resultDef.taglineKey),
                    points: resultDef.stops.map((stop) => ({
                      id: stop.mapId,
                      label: t(stop.nameKey),
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
          </>
        )}
      </div>

      <BottomNav activeTab="Route" />
    </PhoneShell>
  );
}
