import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, Burst } from "./PhoneShell";
import { BottomNav } from "./BottomNav";
import { useFavorites } from "../context/FavoritesContext";
import { useCamera } from "../context/CameraContext";
import { useLanguage } from "../context/LanguageContext";
import { BADGE_DEFS } from "../data/stamps";
import {
  IconBadge, IconHeart, IconSparkle, IconProfile,
  IconPin, IconCheck,
} from "./ComicIcons";
import {
  ECamera, ESparkle, EmojiDisplay,
} from "./AppEmojis";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

type TabKey = "badges" | "favorites";

const typeColor: Record<string, string> = { recommended: C.sky, mystery: C.purple, custom: C.sky };

const NAME_KEY = "unibuddy_username";

export function ProfileScreen() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const { badgeCheckedCount, photos, openCamera, unlockedBadgeIds } = useCamera();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("badges");

  /* ── Editable name ── */
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(NAME_KEY) || "";
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Persist name to localStorage
  useEffect(() => {
    if (userName) localStorage.setItem(NAME_KEY, userName);
  }, [userName]);

  const displayName = userName || t("profile_name_default");

  const startEditing = () => {
    setEditValue(userName);
    setIsEditingName(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveName = () => {
    const trimmed = editValue.trim();
    setUserName(trimmed || "");
    setIsEditingName(false);
  };

  const badges = BADGE_DEFS.map((badge) => ({
    ...badge,
    checked: unlockedBadgeIds.includes(badge.id),
  }));

  const typeLabel: Record<string, string> = {
    recommended: t("type_recommended"),
    mystery: t("type_mystery"),
    custom: t("type_custom"),
  };
  const openFavoriteRoute = (fav: (typeof favorites)[number]) => {
    if (fav.guidedTour?.points?.length && fav.guidedTour.points.length >= 2) {
      navigate("/pictures", { state: { guidedTour: fav.guidedTour } });
      return;
    }
    navigate("/route");
  };

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* ── Header ── */}
      <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "8px 16px 16px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: C.sky, border: `2px solid ${C.navy}`, opacity: 0.4 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* ── Top row: label ── */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.65)" }}>UniBuddy </span>
          </div>

          {/* ── Avatar + name row ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{
                width: "60px", height: "60px", backgroundColor: C.pale,
                border: `3px solid ${C.navy}`, borderRadius: "18px",
                boxShadow: `3px 3px 0 ${C.navy}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <IconProfile size={32} active />
              </div>
              <div style={{ position: "absolute", bottom: "-4px", right: "-4px" }}>
                <Burst size={22} color={C.yellow} text="LV3" textColor={C.navy} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Editable name */}
              {isEditingName ? (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setIsEditingName(false); }}
                    maxLength={16}
                    placeholder={t("profile_name_default")}
                    style={{
                      width: "0", flex: 1,
                      fontSize: "14px", fontWeight: 800,
                      color: C.navy, backgroundColor: C.white,
                      border: `2px solid ${C.yellow}`, borderRadius: "8px",
                      padding: "4px 8px", outline: "none",
                    }}
                  />
                  <button
                    onClick={saveName}
                    style={{
                      flexShrink: 0,
                      padding: "4px 10px",
                      backgroundColor: C.yellow,
                      border: `2px solid ${C.navy}`, borderRadius: "8px",
                      fontSize: "11px", fontWeight: 900, color: C.navy,
                      cursor: "pointer",
                    }}
                  >
                    {t("profile_save")}
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    style={{
                      flexShrink: 0,
                      padding: "4px 8px",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      border: `1.5px solid rgba(255,255,255,0.35)`, borderRadius: "8px",
                      fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.8)",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                  <p style={{ fontSize: "17px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {displayName}
                  </p>
                  <button
                    onClick={startEditing}
                    style={{
                      flexShrink: 0,
                      padding: "2px 8px",
                      backgroundColor: "rgba(255,255,255,0.15)",
                      border: `1.5px solid rgba(255,255,255,0.4)`, borderRadius: "6px",
                      fontSize: "10px", fontWeight: 800, color: "rgba(255,255,255,0.85)",
                      cursor: "pointer",
                    }}
                  >
                    {t("profile_edit")}
                  </button>
                </div>
              )}
              
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "10px" }}>
            {[
              { label: t("profile_stamps"), value: `${badgeCheckedCount}`, bg: C.pale, color: C.royal },
              { label: t("profile_photos"), value: `${photos.length}`,     bg: C.ice,  color: C.royal },
              { label: t("profile_favs"),   value: `${favorites.length}`,  bg: C.mint, color: C.navy  },
            ].map((s) => (
              <div key={s.label} style={{ flex: 1, backgroundColor: s.bg, border: "none", borderRadius: "12px", boxShadow: "none", padding: "8px 0", textAlign: "center" }}>
                <p style={{ fontSize: "20px", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "10px", fontWeight: 700, color: C.navy, marginTop: "2px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: "flex", borderBottom: `2.5px solid ${C.navy}`, backgroundColor: C.cream, flexShrink: 0 }}>
        {([
          { key: "badges" as TabKey,    label: t("profile_tab_stamps"), icon: <IconBadge size={15} filled={activeTab === "badges"} /> },
          { key: "favorites" as TabKey, label: t("profile_tab_favs"),   icon: <IconHeart size={15} filled={activeTab === "favorites"} color={C.coral} /> },
        ]).map((tab, i) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, padding: "10px 0",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
              backgroundColor: activeTab === tab.key ? C.ice : C.cream,
              borderBottom: activeTab === tab.key ? `3px solid ${C.royal}` : "3px solid transparent",
              borderRight: i < 1 ? `2px solid ${C.navy}` : "none",
              fontSize: "12px", fontWeight: 800,
              color: activeTab === tab.key ? C.royal : "#4B6898",
              cursor: "pointer",
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "28px" }}>

        {/* ── BADGES TAB ── */}
        {activeTab === "badges" && (
          <>
            <ComicCard style={{ padding: "14px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("profile_progress")}</span>
                <span style={{ fontSize: "13px", fontWeight: 900, color: C.royal }}>{badgeCheckedCount} / {badges.length}</span>
              </div>
              <div style={{ width: "100%", height: "14px", backgroundColor: C.ice, border: `2px solid ${C.navy}`, borderRadius: "20px", overflow: "hidden" }}>
                <div style={{ height: "100%", backgroundColor: C.royal, width: `${(badgeCheckedCount / badges.length) * 100}%`, transition: "width 0.4s ease", borderRight: badgeCheckedCount < badges.length ? `2px solid ${C.navy}` : "none" }} />
              </div>
              <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", marginTop: "6px" }}>
                {t("profile_remaining", { n: badges.length - badgeCheckedCount })}
              </p>
            </ComicCard>

            {/* Hint: take photos to unlock badges */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: C.yellow + "55", border: `1.5px solid ${C.yellow}`, borderRadius: "12px", padding: "8px 12px", marginBottom: "12px" }}>
              <ECamera size={20} color={C.navy} />
              <p style={{ fontSize: "11px", fontWeight: 700, color: C.navy, lineHeight: 1.5 }}>
                {t("profile_photo_hint")}<br />
                <span style={{ color: C.royal }}>{t("profile_photo_hint2")}</span>
              </p>
              <button
                onClick={openCamera}
                style={{ marginLeft: "auto", padding: "4px 12px", backgroundColor: C.royal, border: `1.5px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, color: C.white, fontSize: "11px", fontWeight: 900, cursor: "pointer", flexShrink: 0 }}
              >
                {t("profile_go_photo")}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
                >
                  <div style={{
                    width: "72px", height: "72px", position: "relative",
                    border: badge.checked ? `2.5px solid ${C.royal}` : `2.5px dashed ${C.pale}`,
                    borderRadius: "16px",
                    boxShadow: badge.checked ? `3px 3px 0 ${C.royal}` : "none",
                    opacity: badge.checked ? 1 : 0.3,
                    overflow: "hidden",
                    backgroundColor: badge.checked ? C.white : "#F8FAFC",
                  }}>
                    <img
                      src={`${import.meta.env.BASE_URL}${badge.imagePath}`}
                      alt={`badge-${badge.id}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    {badge.checked && (
                      <div style={{ position: "absolute", bottom: "3px", right: "3px", width: "18px", height: "18px", borderRadius: "50%", backgroundColor: C.royal, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconCheck size={10} color="white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate("/route")}
              style={{
                width: "100%", marginTop: "16px", height: "50px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                backgroundColor: C.royal, border: `2.5px solid ${C.navy}`,
                borderRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`,
                color: C.white, fontSize: "15px", fontWeight: 900, cursor: "pointer",
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
            >
              <IconSparkle size={18} color="white" />
              {t("profile_start_route")}
            </button>
          </>
        )}

        {/* ── FAVORITES TAB ── */}
        {activeTab === "favorites" && (
          <>
            {favorites.length === 0 ? (
              <ComicCard style={{ padding: "24px", textAlign: "center", backgroundColor: C.cream }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "10px" }}>
                  <ESparkle size={40} />
                </div>
                <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy }}>{t("profile_no_favs")}</p>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#4B6898", marginTop: "4px", marginBottom: "14px" }}>{t("profile_no_favs_sub")}</p>
                <button
                  onClick={() => navigate("/route")}
                  style={{ padding: "8px 20px", backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "10px", boxShadow: `2px 2px 0 ${C.navy}`, color: C.white, fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
                >
                  {t("profile_explore")}
                </button>
              </ComicCard>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {favorites.map((fav) => (
                  <ComicCard key={fav.id} style={{ padding: "14px", backgroundColor: fav.bg || C.pale }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "50px", height: "50px", backgroundColor: C.white, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <EmojiDisplay emoji={fav.emoji} size={24} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "14px", fontWeight: 900, color: C.navy }}>{fav.title}</span>
                          <span style={{ backgroundColor: typeColor[fav.type] || C.sky, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 900, color: C.white }}>
                            {typeLabel[fav.type] || fav.type}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {fav.type === "recommended" && fav.duration && (
                            <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                              <span aria-hidden style={{ fontSize: "12px", lineHeight: 1 }}>⏱</span>
                              <span style={{ fontSize: "11px", fontWeight: 700, color: C.royal }}>{fav.duration}</span>
                            </div>
                          )}
                          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <IconPin size={12} color={C.royal} />
                            <span style={{ fontSize: "11px", fontWeight: 700, color: C.royal }}>{fav.stops.length} {t("route_stops")}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "#4B6898", marginTop: "3px" }}>
                          {fav.stops.slice(0, 3).join(" → ")}{fav.stops.length > 3 ? "…" : ""}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                        <button
                          onClick={() => openFavoriteRoute(fav)}
                          style={{ width: "32px", height: "32px", backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                          aria-label={t("route_start")}
                          title={t("route_start")}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 4L20 12L6 20V4Z" fill="white" /></svg>
                        </button>
                        <button
                          onClick={() => removeFavorite(fav.id)}
                          style={{ width: "32px", height: "32px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        >
                          <IconHeart size={16} filled color={C.coral} />
                        </button>
                      </div>
                    </div>
                  </ComicCard>
                ))}

                <button
                  onClick={() => navigate("/route")}
                  style={{ width: "100%", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "12px", boxShadow: `2px 2px 0 ${C.navy}`, color: C.navy, fontSize: "13px", fontWeight: 800, cursor: "pointer" }}
                >
                  <IconSparkle size={16} />
                  {t("profile_more")}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav activeTab="Profile" />
    </PhoneShell>
  );
}
