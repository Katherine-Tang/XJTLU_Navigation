import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, SpeechBubble, Burst } from "./PhoneShell";
import { BottomNav } from "./BottomNav";
import { useFavorites } from "../context/FavoritesContext";
import { useCamera } from "../context/CameraContext";
import { useLanguage } from "../context/LanguageContext";
import {
  askUniAIBuddy,
  getUniAIBuddyPresetQuestions,
  type UniAIBuddyChatMessage,
} from "../services/uniaibuddy";
import { BADGE_DEFS } from "../data/stamps";
import { classrooms } from "../data/classroomData";
import { SYSTEM_SCHOOL_COMMENTS, type SchoolPerspective } from "../data/schoolComments";
import {
  IconBell, IconHeart, IconBadge, IconSparkle,
  IconChevronRight, IconPin, IconTrash, IconBack,
} from "./ComicIcons";
import { EmojiDisplay } from "./AppEmojis";
import {
  ONBOARDING_AI_STEP,
  ONBOARDING_EVENT_NAME,
  ONBOARDING_LANG_STEP,
  getOnboardingStep,
  setOnboardingStep,
} from "../onboardingState";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};
const BASE_URL = ((import.meta as any).env?.BASE_URL ?? "/") as string;

const navCardDefs = [
  { id: "pictures", labelKey: "home_nav_pictures", emoji: "🗺️", path: "/pictures",    bg: C.pale,      tagBg: C.sky,   tag: "MAPS"  },
  { id: "route",    labelKey: "home_nav_route",     emoji: "🧭", path: "/route",        bg: C.ice,       tagBg: C.royal, tag: "ROUTE" },
  { id: "mystery",  labelKey: "home_nav_mystery",   emoji: "🎲", path: "/mystery-route",bg: C.mint+"55", tagBg: C.purple,tag: "LUCKY", useRouteIconStyle: true },
  { id: "custom",   labelKey: "home_nav_custom",    emoji: "🧩", path: "/custom-route", bg: C.cream,     tagBg: C.sky,   tag: "DIY",   useRouteIconStyle: true },
];

type UserSchoolComment = {
  id: string;
  perspective: SchoolPerspective;
  text: string; // raw user input
  textLang: "zh" | "en";
  createdAt: number;
};

type UserBuildingComment = {
  id: string;
  buildingKey: string;
  perspective: SchoolPerspective;
  text: string;
  textLang: "zh" | "en";
  createdAt: number;
};

export function HomeScreen() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const { badgeCheckedCount, unlockedBadgeIds } = useCamera();
  const { lang, toggle, t } = useLanguage();
  const checkedCount = badgeCheckedCount;

  const badgePreview = BADGE_DEFS.slice(0, 6).map((badge) => ({
    ...badge,
    checked: unlockedBadgeIds.includes(badge.id),
  }));

  const typeLabel: Record<string, string> = {
    recommended: t("type_recommended"),
    mystery: t("type_mystery"),
    custom: t("type_custom"),
  };
  const typeColor: Record<string, string> = { recommended: C.sky, mystery: C.purple, custom: C.sky };
  const openFavoriteRoute = (fav: (typeof favorites)[number]) => {
    if (fav.guidedTour?.points?.length && fav.guidedTour.points.length >= 2) {
      navigate("/pictures", { state: { guidedTour: fav.guidedTour } });
      return;
    }
    navigate("/route");
  };

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<typeof classrooms[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizeBuildingName = (text: string) => text.replace(/科技楼/g, "理科楼");
  const getLocale = (room: typeof classrooms[0]) => room[lang];

  const filtered = query.trim().length > 0
    ? classrooms.filter(
        (c) =>
          c.room.toLowerCase().includes(query.toLowerCase()) ||
          normalizeBuildingName(getLocale(c).building).toLowerCase().includes(query.toLowerCase())
      )
    : classrooms.slice(0, 6);

  useEffect(() => {
    if (showSearch && !selectedRoom) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showSearch, selectedRoom]);

  const openSearch = () => { setShowSearch(true); setQuery(""); setSelectedRoom(null); };
  const closeSearch = () => { setShowSearch(false); setQuery(""); setSelectedRoom(null); };
  const restartTutorial = () => {
    setShowAiBuddy(false);
    setOnboardingStep(ONBOARDING_LANG_STEP);
  };

  const USER_COMMENTS_KEY = "unibuddy_school_comments_v1";
  const BUILDING_COMMENTS_KEY = "unibuddy_building_comments_v1";
  const [activePerspective, setActivePerspective] = useState<SchoolPerspective>("freshman");
  const [userComments, setUserComments] = useState<UserSchoolComment[]>([]);
  const [draftText, setDraftText] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);
  const [buildingActivePerspective, setBuildingActivePerspective] = useState<SchoolPerspective>("freshman");
  const [buildingComments, setBuildingComments] = useState<UserBuildingComment[]>([]);
  const [buildingDraftText, setBuildingDraftText] = useState("");
  const [buildingCommentError, setBuildingCommentError] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiMessages, setAiMessages] = useState<UniAIBuddyChatMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiBuddy, setShowAiBuddy] = useState(false);
  const [showAiGuide, setShowAiGuide] = useState(false);
  const [showLangGuide, setShowLangGuide] = useState(false);
  const [aiGuideRect, setAiGuideRect] = useState<DOMRect | null>(null);
  const [langGuideRect, setLangGuideRect] = useState<DOMRect | null>(null);
  const aiGuideCardRef = useRef<HTMLDivElement | null>(null);
  const langToggleRef = useRef<HTMLButtonElement | null>(null);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);
  const aiMessagesScrollRef = useRef<HTMLDivElement | null>(null);
  const aiPresetQuestions = useMemo(() => getUniAIBuddyPresetQuestions(lang, 23), [lang]);

  const handleAskUniAIBuddy = async (presetQuestion?: string) => {
    const q = (presetQuestion ?? aiQuestion).trim();
    if (!q || aiLoading) return;
    const nextHistory: UniAIBuddyChatMessage[] = [...aiMessages, { role: "user", content: q }];
    setAiMessages(nextHistory);
    setAiQuestion("");
    setAiLoading(true);
    try {
      const answer = await askUniAIBuddy(q, lang, nextHistory);
      setAiMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!showAiBuddy) return;
    const timer = window.setTimeout(() => aiInputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [showAiBuddy]);

  useEffect(() => {
    if (!showAiBuddy) return;
    const container = aiMessagesScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [aiMessages, aiLoading, showAiBuddy]);

  useEffect(() => {
    const syncOnboardingUi = () => {
      const step = getOnboardingStep();
      setShowAiGuide(step === ONBOARDING_AI_STEP);
      setShowLangGuide(step === ONBOARDING_LANG_STEP);
    };

    syncOnboardingUi();
    window.addEventListener("storage", syncOnboardingUi);
    window.addEventListener(ONBOARDING_EVENT_NAME, syncOnboardingUi);
    return () => {
      window.removeEventListener("storage", syncOnboardingUi);
      window.removeEventListener(ONBOARDING_EVENT_NAME, syncOnboardingUi);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(BUILDING_COMMENTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      const safe = parsed
        .filter(
          (c: any) =>
            c &&
            typeof c.id === "string" &&
            typeof c.buildingKey === "string" &&
            (c.perspective === "freshman" || c.perspective === "visitor") &&
            typeof c.text === "string",
        )
        .map((c: any) => ({
          id: c.id as string,
          buildingKey: c.buildingKey as string,
          perspective: c.perspective as SchoolPerspective,
          text: c.text as string,
          textLang: (c.textLang === "en" ? "en" : "zh") as "zh" | "en",
          createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now(),
        })) as UserBuildingComment[];

      setBuildingComments(safe);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    const updateGuideRect = () => {
      if (!showAiGuide) {
        setAiGuideRect(null);
        return;
      }
      setAiGuideRect(aiGuideCardRef.current?.getBoundingClientRect() ?? null);
    };

    updateGuideRect();
    if (!showAiGuide) return;

    const scrollContainer = aiGuideCardRef.current?.closest(".overflow-y-auto");
    window.addEventListener("resize", updateGuideRect);
    window.addEventListener("scroll", updateGuideRect, true);
    scrollContainer?.addEventListener("scroll", updateGuideRect);

    return () => {
      window.removeEventListener("resize", updateGuideRect);
      window.removeEventListener("scroll", updateGuideRect, true);
      scrollContainer?.removeEventListener("scroll", updateGuideRect);
    };
  }, [showAiGuide]);

  useEffect(() => {
    const updateLangRect = () => {
      if (!showLangGuide) {
        setLangGuideRect(null);
        return;
      }
      setLangGuideRect(langToggleRef.current?.getBoundingClientRect() ?? null);
    };

    updateLangRect();
    if (!showLangGuide) return;

    window.addEventListener("resize", updateLangRect);
    window.addEventListener("scroll", updateLangRect, true);

    return () => {
      window.removeEventListener("resize", updateLangRect);
      window.removeEventListener("scroll", updateLangRect, true);
    };
  }, [showLangGuide]);

  const langGuideBubbleStyle = useMemo(() => {
    if (!langGuideRect || typeof window === "undefined") return null;
    const phoneShellRect = langToggleRef.current
      ?.closest('[data-phone-shell="true"]')
      ?.getBoundingClientRect();
    const bounds = phoneShellRect ?? {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const width = Math.min(300, Math.max(248, bounds.width - 28));
    const margin = 12;
    const toggleCenterX = langGuideRect.left + langGuideRect.width / 2;
    let left = toggleCenterX - width / 2;
    left = Math.min(bounds.right - width - margin, Math.max(bounds.left + margin, left));
    const top = langGuideRect.bottom + 12;
    const pointerX = toggleCenterX - left - 9;
    return { width, left, top, pointerX: Math.min(width - 22, Math.max(10, pointerX)) };
  }, [langGuideRect]);

  const finishLangGuide = () => {
    setLangGuideRect(null);
    setOnboardingStep(1);
  };

  const handleChooseLanguage = (target: "zh" | "en") => {
    if (lang !== target) {
      toggle();
    }
    finishLangGuide();
  };

  const closeAiGuide = () => {
    setShowAiGuide(false);
    setAiGuideRect(null);
    setOnboardingStep("done");
  };
  const aiGuideBubbleStyle = useMemo(() => {
    if (!aiGuideRect || typeof window === "undefined") return null;
    const phoneShellRect = aiGuideCardRef.current
      ?.closest('[data-phone-shell="true"]')
      ?.getBoundingClientRect();
    const bounds = phoneShellRect ?? {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const width = Math.min(300, Math.max(230, bounds.width - 24));
    const margin = 12;
    const estimatedHeight = 136;
    const centerX = aiGuideRect.left + aiGuideRect.width / 2;
    const left = Math.min(
      bounds.right - width - margin,
      Math.max(bounds.left + margin, centerX - width / 2),
    );
    const topCandidate = aiGuideRect.top - estimatedHeight - 10;
    const top = topCandidate > bounds.top + margin
      ? topCandidate
      : Math.min(bounds.bottom - estimatedHeight - margin, aiGuideRect.bottom + 10);
    return { width, left, top };
  }, [aiGuideRect]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_COMMENTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      // Lightweight validation (best-effort for older/invalid data)
      const safe = parsed
        .filter((c: any) => c && typeof c.id === "string" && (c.perspective === "freshman" || c.perspective === "visitor") && typeof c.text === "string")
        .map((c: any) => ({
          id: c.id as string,
          perspective: c.perspective as SchoolPerspective,
          text: c.text as string,
          textLang: (c.textLang === "en" ? "en" : "zh") as "zh" | "en",
          createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now(),
        })) as UserSchoolComment[];

      setUserComments(safe);
    } catch {
      // ignore storage errors
    }
  }, []);

  const formatCommentTime = (ts: number) => {
    try {
      const d = new Date(ts);
      return lang === "zh" ? d.toLocaleString("zh-CN") : d.toLocaleString("en-US");
    } catch {
      return "";
    }
  };

  const handlePostComment = () => {
    const text = draftText.trim();
    if (!text) {
      setCommentError(lang === "zh" ? "评论内容不能为空" : "Comment cannot be empty.");
      return;
    }

    const nextItem: UserSchoolComment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      perspective: activePerspective,
      text,
      textLang: lang,
      createdAt: Date.now(),
    };

    setUserComments((prev) => {
      const next = [nextItem, ...prev];
      try {
        localStorage.setItem(USER_COMMENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setDraftText("");
    setCommentError("");
  };

  const handleDeleteComment = (commentId: string) => {
    setUserComments((prev) => {
      const next = prev.filter((c) => c.id !== commentId);
      try {
        localStorage.setItem(USER_COMMENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const getBuildingKeyFromRoom = (room: string) => {
    const match = room.match(/^[A-Za-z]+/);
    return (match?.[0] ?? room).toUpperCase();
  };

  const handlePostBuildingComment = () => {
    if (!selectedRoom) return;
    const text = buildingDraftText.trim();
    if (!text) {
      setBuildingCommentError(lang === "zh" ? "评论内容不能为空" : "Comment cannot be empty.");
      return;
    }

    const nextItem: UserBuildingComment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      buildingKey: getBuildingKeyFromRoom(selectedRoom.room),
      perspective: buildingActivePerspective,
      text,
      textLang: lang,
      createdAt: Date.now(),
    };

    setBuildingComments((prev) => {
      const next = [nextItem, ...prev];
      try {
        localStorage.setItem(BUILDING_COMMENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setBuildingDraftText("");
    setBuildingCommentError("");
  };

  const handleDeleteBuildingComment = (commentId: string) => {
    setBuildingComments((prev) => {
      const next = prev.filter((c) => c.id !== commentId);
      try {
        localStorage.setItem(BUILDING_COMMENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    setBuildingDraftText("");
    setBuildingCommentError("");
    setBuildingActivePerspective("freshman");
  }, [selectedRoom?.id]);

  const userCommentsForFreshman = userComments.filter((c) => c.perspective === "freshman");
  const userCommentsForVisitor = userComments.filter((c) => c.perspective === "visitor");

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* ── Header ── */}
      <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: C.sky, border: `2px solid ${C.navy}`, opacity: 0.5 }} />
        <div style={{ position: "absolute", bottom: "-20px", left: "60px", width: "70px", height: "70px", borderRadius: "50%", backgroundColor: C.pale, border: `2px solid ${C.navy}`, opacity: 0.4 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <SpeechBubble style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: C.navy }}>{t("home_welcome")} 👋</span>
              </SpeechBubble>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, marginTop: "14px" }}>
                UniBuddy
              </h1>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
              {/* Language toggle pill */}
              <button
                ref={langToggleRef}
                type="button"
                onClick={toggle}
                style={{
                  display: "flex", alignItems: "center",
                  backgroundColor: C.navy, border: `2px solid ${C.pale}`,
                  borderRadius: "20px", overflow: "hidden",
                  boxShadow: `2px 2px 0 rgba(255,255,255,0.15)`,
                  cursor: "pointer", padding: 0,
                  flexShrink: 0,
                }}
              >
                {(["zh", "en"] as const).map((l) => (
                  <span
                    key={l}
                    style={{
                      padding: "4px 11px",
                      fontSize: "11px",
                      fontWeight: 900,
                      color: lang === l ? C.navy : "rgba(255,255,255,0.5)",
                      backgroundColor: lang === l ? C.yellow : "transparent",
                      transition: "background 0.2s",
                      pointerEvents: "none",
                    }}
                  >
                    {l === "zh" ? "中文" : "EN"}
                  </span>
                ))}
              </button>
              <button
                type="button"
                onClick={restartTutorial}
                style={{
                  height: "26px",
                  padding: "0 10px",
                  borderRadius: "10px",
                  backgroundColor: C.white,
                  border: `2px solid ${C.navy}`,
                  boxShadow: `2px 2px 0 ${C.navy}`,
                  color: C.navy,
                  fontSize: "10px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("home_tutorial_btn")}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Body ── */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "28px" }}>

        <ComicCard style={{ padding: "14px", backgroundColor: C.cream, marginBottom: "18px", border: "none", boxShadow: "none" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ fontSize: "26px", flexShrink: 0 }}>🏫</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy, marginBottom: "4px" }}>{t("home_about_title")}</p>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#4B6898", lineHeight: "1.6" }}>
                  {t("home_about_text")}
                </p>
              </div>
            </div>
          </ComicCard>

        <SectionLabel color={C.purple} text="UniAIBuddy" icon={<IconSparkle size={18} />} />

        <div ref={aiGuideCardRef}>
          <ComicCard style={{ padding: "14px", backgroundColor: "#EFE8FF", marginBottom: "18px", border: "none", boxShadow: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                <span style={{ fontSize: "24px", lineHeight: 1 }}>🤖</span>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 900, color: C.navy, marginBottom: "3px" }}>
                    {lang === "zh" ? "点击打开 UniAIBuddy 对话" : "Open UniAIBuddy chat"}
                  </p>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", lineHeight: 1.45 }}>
                    {lang === "zh"
                      ? "可以询问本系统相关问题。"
                      : "You can ask questions related to this system."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiBuddy(true)}
                style={{
                  height: "36px",
                  minWidth: "84px",
                  padding: "0 12px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  backgroundColor: C.royal,
                  border: `2px solid ${C.navy}`,
                  boxShadow: `2px 2px 0 ${C.navy}`,
                  color: C.white,
                  fontSize: "12px",
                  fontWeight: 900,
                  flexShrink: 0,
                }}
              >
                {lang === "zh" ? "打开" : "Open"}
              </button>
            </div>
          </ComicCard>
        </div>

        <SectionLabel color={C.yellow} text={t("home_nav")} icon={<IconSparkle size={18} />} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          {navCardDefs.map((card) => (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              style={{ backgroundColor: card.bg, border: `2.5px solid ${C.navy}`, borderRadius: "16px", boxShadow: `4px 4px 0 ${C.navy}`, padding: "14px 12px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: "6px", minHeight: "108px", position: "relative", overflow: "hidden" }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
            >
              {card.useRouteIconStyle ? (
                <>
                  {card.id === "mystery" && (
                    <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                      <Burst size={34} color={C.yellow} text="LUCKY" textColor={C.navy} />
                    </div>
                  )}
                  <div style={{ marginTop: "22px" }}>
                    <EmojiDisplay emoji={card.emoji} size={32} />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ display: "inline-block", backgroundColor: card.tagBg, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "1px 7px", fontSize: "10px", fontWeight: 900, color: C.white, letterSpacing: "0.5px", alignSelf: "flex-start" }}>
                    {card.tag}
                  </div>
                  <div style={{ marginTop: "2px" }}>
                    <EmojiDisplay emoji={card.emoji} size={32} />
                  </div>
                </>
              )}
              <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t(card.labelKey)}</span>
            </button>
          ))}
        </div>

        <SectionLabel
          color={C.yellow}
          text={lang === "zh" ? "学校评论（全校视角）" : "School Comments (All Campus)"}
          icon={<IconBell size={18} />}
        />
        <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", margin: "-4px 2px 10px" }}>
          {t("home_school_comments_intro")}
        </p>

        <ComicCard style={{ padding: "14px", backgroundColor: "#F1EEFF", marginBottom: "18px", border: "none", boxShadow: "none" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ fontSize: "22px", lineHeight: 1, marginTop: "2px" }}>💬</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 900, color: C.navy, marginBottom: "3px" }}>
                  {lang === "zh" ? "新生视角 / 外来访客视角" : "Freshman / Visitor Perspectives"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCommentsExpanded((prev) => !prev)}
              style={{
                flexShrink: 0,
                minWidth: "74px",
                height: "32px",
                padding: "0 10px",
                borderRadius: "10px",
                backgroundColor: C.ice,
                border: `2px solid ${C.navy}`,
                boxShadow: `2px 2px 0 ${C.navy}`,
                color: C.navy,
                fontSize: "11px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {isCommentsExpanded
                ? (lang === "zh" ? "收起" : "Collapse")
                : (lang === "zh" ? "展开" : "Expand")}
            </button>
          </div>

          {isCommentsExpanded && (
            <>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setActivePerspective("freshman")}
                  style={{
                    flex: 1,
                    height: "36px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: activePerspective === "freshman" ? C.royal : C.white,
                    color: activePerspective === "freshman" ? C.white : "#4B6898",
                    border: `2px solid ${C.navy}`,
                    boxShadow: activePerspective === "freshman" ? `3px 3px 0 ${C.navy}` : `2px 2px 0 ${C.pale}`,
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  🌱 {lang === "zh" ? "新生视角" : "Freshman"}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePerspective("visitor")}
                  style={{
                    flex: 1,
                    height: "36px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: activePerspective === "visitor" ? C.royal : C.white,
                    color: activePerspective === "visitor" ? C.white : "#4B6898",
                    border: `2px solid ${C.navy}`,
                    boxShadow: activePerspective === "visitor" ? `3px 3px 0 ${C.navy}` : `2px 2px 0 ${C.pale}`,
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  🌍 {lang === "zh" ? "外来访客视角" : "Visitor"}
                </button>
              </div>

              <div style={{ backgroundColor: "#F8FCFF", border: `1.5px solid ${C.pale}`, borderRadius: "14px", padding: "10px", marginBottom: "12px" }}>
                <textarea
                  value={draftText}
                  onChange={(e) => {
                    setDraftText(e.target.value);
                    if (commentError) setCommentError("");
                  }}
                  rows={3}
                  placeholder={lang === "zh" ? "写下你的看法（按上方视角发布）" : "Write your thoughts (post under the selected perspective)"}
                  style={{
                    width: "100%",
                    backgroundColor: C.white,
                    border: `2.5px solid ${C.navy}`,
                    borderRadius: "12px",
                    padding: "10px 10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.navy,
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", gap: "10px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898", margin: 0 }}>
                    {lang === "zh" ? "发布后会展示在该视角下" : "Your comment will appear under this perspective"}
                  </p>
                  <button
                    type="button"
                    onClick={handlePostComment}
                    style={{
                      height: "34px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      backgroundColor: C.royal,
                      border: `2px solid ${C.navy}`,
                      boxShadow: `2px 2px 0 ${C.navy}`,
                      color: C.white,
                      fontSize: "12px",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lang === "zh" ? "发布" : "Post"}
                  </button>
                </div>
                {commentError && (
                  <p style={{ marginTop: "8px", marginBottom: 0, fontSize: "11px", fontWeight: 800, color: C.coral }}>
                    {commentError}
                  </p>
                )}
              </div>

              <div style={{ borderTop: `2px solid ${C.pale}`, paddingTop: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(["freshman", "visitor"] as const).map((p) => {
                    const systemList = SYSTEM_SCHOOL_COMMENTS[p];
                    const allUserList = p === "freshman" ? userCommentsForFreshman : userCommentsForVisitor;
                    const userList = allUserList.filter((c) => c.textLang === lang);
                    const titleZh = p === "freshman" ? "新生视角" : "外来访客视角";
                    const titleEn = p === "freshman" ? "Freshman" : "Visitor";
                    return (
                      <div
                        key={p}
                        style={{
                          backgroundColor: "#F8FCFF",
                          border: `1.5px solid ${C.pale}`,
                          borderRadius: "14px",
                          padding: "10px",
                        }}
                      >
                        <p style={{ fontSize: "12px", fontWeight: 900, color: C.navy, marginBottom: "8px" }}>
                          {p === "freshman" ? "🌱" : "🌍"} {lang === "zh" ? titleZh : titleEn}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto", paddingRight: "4px" }}>
                          {systemList.map((c, idx) => (
                            <div
                              key={`sys-${p}-${idx}`}
                              style={{ backgroundColor: C.ice, border: `1.5px solid ${C.pale}`, borderRadius: "12px", padding: "10px" }}
                            >
                              <p style={{ fontSize: "12px", fontWeight: 900, color: C.navy, marginBottom: 0 }}>
                                {lang === "zh" ? c.zh : c.en}
                              </p>
                            </div>
                          ))}

                          <p style={{ fontSize: "11px", fontWeight: 900, color: "#4B6898", marginTop: "2px", marginBottom: "-2px" }}>
                            {lang === "zh" ? `你的评论（${userList.length}）` : `Your notes (${userList.length})`}
                          </p>

                          {userList.length === 0 ? (
                            <div style={{ backgroundColor: C.cream, border: `1.5px dashed ${C.pale}`, borderRadius: "12px", padding: "10px" }}>
                              <p style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898", marginBottom: 0 }}>
                                {lang === "zh" ? "当前语言下还没有评论，快来补充吧！" : "No comments in this language yet—be the first to add one."}
                              </p>
                            </div>
                          ) : (
                            userList.map((c) => (
                              <div key={c.id} style={{ backgroundColor: "#FFF0F0", border: `1.5px solid ${C.coral}`, borderRadius: "12px", padding: "10px" }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <p style={{ fontSize: "12px", fontWeight: 900, color: C.navy, marginBottom: "4px", wordBreak: "break-word" }}>
                                      {c.text}
                                    </p>
                                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", marginBottom: 0 }}>
                                      {formatCommentTime(c.createdAt)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(c.id)}
                                    aria-label={lang === "zh" ? "删除评论" : "Delete comment"}
                                    title={lang === "zh" ? "删除评论" : "Delete comment"}
                                    style={{
                                      width: "28px",
                                      height: "28px",
                                      flexShrink: 0,
                                      backgroundColor: C.white,
                                      border: `1.5px solid ${C.navy}`,
                                      borderRadius: "8px",
                                      boxShadow: `1.5px 1.5px 0 ${C.navy}`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <IconTrash size={13} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </ComicCard>

        <SectionLabel color={C.sky} text={t("home_stamp_section")} icon={<IconBadge size={18} filled />} />

        <ComicCard style={{ padding: "14px", marginBottom: "6px", border: "none", boxShadow: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("home_stamp_label")}</span>
            <span style={{ fontSize: "13px", fontWeight: 900, color: C.royal }}>{checkedCount} / {BADGE_DEFS.length}</span>
          </div>
          <div style={{ width: "100%", height: "12px", backgroundColor: C.ice, border: `2px solid ${C.navy}`, borderRadius: "20px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ height: "100%", backgroundColor: C.royal, width: `${(checkedCount / BADGE_DEFS.length) * 100}%`, borderRight: checkedCount < BADGE_DEFS.length ? `2px solid ${C.navy}` : "none" }} />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
            {badgePreview.map((badge) => (
              <div key={badge.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <div style={{ width: "38px", height: "38px", border: badge.checked ? `2px solid ${C.royal}` : `2px dashed ${C.pale}`, borderRadius: "10px", boxShadow: badge.checked ? `2px 2px 0 ${C.royal}` : "none", overflow: "hidden", opacity: badge.checked ? 1 : 0.3, backgroundColor: C.white }}>
                  <img
                    src={`${BASE_URL}${badge.imagePath}`}
                    alt={`badge-preview-${badge.id}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/profile")}
            style={{ width: "100%", marginTop: "12px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: C.ice, border: `2px solid ${C.navy}`, borderRadius: "10px", boxShadow: `2px 2px 0 ${C.navy}`, fontSize: "12px", fontWeight: 800, color: C.navy, cursor: "pointer" }}
          >
            {t("home_stamp_view")} <IconChevronRight size={14} />
          </button>
        </ComicCard>

        <div style={{ marginTop: "18px" }}>
          <SectionLabel color={C.coral} text={t("home_favs")} icon={<IconHeart size={18} filled color={C.coral} />} />
          {favorites.length === 0 ? (
            <ComicCard style={{ padding: "20px", textAlign: "center", backgroundColor: C.cream, border: "none", boxShadow: "none" }}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>💫</span>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#4B6898" }}>{t("home_no_favs")}</p>
              <p style={{ fontSize: "12px", fontWeight: 500, color: "#94A3B8", marginTop: "4px" }}>{t("home_no_favs_sub")}</p>
              <button onClick={() => navigate("/route")} style={{ marginTop: "12px", padding: "6px 18px", backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "10px", boxShadow: `2px 2px 0 ${C.navy}`, color: C.white, fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>
                {t("home_explore")}
              </button>
            </ComicCard>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {favorites.map((fav) => (
                <ComicCard key={fav.id} style={{ padding: "14px", backgroundColor: fav.bg || C.pale, border: "none", boxShadow: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "48px", height: "48px", backgroundColor: C.white, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                      {fav.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: 900, color: C.navy }}>{fav.title}</span>
                        <span style={{ backgroundColor: typeColor[fav.type] || C.sky, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 900, color: C.white }}>
                          {typeLabel[fav.type] || fav.type}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => openFavoriteRoute(fav)} style={{ width: "32px", height: "32px", backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 4L20 12L6 20V4Z" fill="white" /></svg>
                      </button>
                      <button onClick={() => removeFavorite(fav.id)} style={{ width: "32px", height: "32px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </div>
                </ComicCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab="Home" />

      {/* ── Search Overlay ── */}
      {showSearch && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, backgroundColor: C.ice, display: "flex", flexDirection: "column" }}>

          {selectedRoom ? (
            /* ── Navigation Detail View ── */
            <>
              {/* Nav header */}
              <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "10px 16px 20px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: C.sky, opacity: 0.3 }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", position: "relative", zIndex: 1 }}>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    style={{ width: "34px", height: "34px", backgroundColor: "rgba(255,255,255,0.2)", border: `2px solid rgba(255,255,255,0.4)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    <IconBack size={18} color="white" />
                  </button>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t("home_classroom_nav")}</p>
                    <p style={{ fontSize: "20px", fontWeight: 900, color: C.white, textShadow: `1px 1px 0 ${C.navy}` }}>
                      {selectedRoom.room}
                    </p>
                  </div>
                </div>
                <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "6px" }}>
                  <span style={{ backgroundColor: C.pale, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 800, color: C.navy }}>
                    {normalizeBuildingName(getLocale(selectedRoom).building)}
                  </span>
                  <span style={{ backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 800, color: C.navy }}>
                    {t("home_floor", { n: selectedRoom.floor })}
                  </span>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "24px" }}>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "4px", height: "18px", backgroundColor: C.royal, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("home_walk")}</span>
                </div>

                <ComicCard style={{ padding: "14px", marginBottom: "14px", backgroundColor: C.cream, border: "none", boxShadow: "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {getLocale(selectedRoom).steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            backgroundColor: i === 0 ? C.mint : i === getLocale(selectedRoom).steps.length - 1 ? C.royal : C.pale,
                            border: `2px solid ${C.navy}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: 900,
                            color: i === getLocale(selectedRoom).steps.length - 1 ? C.white : C.navy,
                          }}>
                            {i === 0 ? "📍" : i === getLocale(selectedRoom).steps.length - 1 ? "🏛️" : `${i}`}
                          </div>
                          {i < getLocale(selectedRoom).steps.length - 1 && (
                            <div style={{ width: "2px", height: "24px", backgroundColor: C.pale, margin: "3px 0" }} />
                          )}
                        </div>
                        <div style={{ paddingTop: "4px", paddingBottom: i < getLocale(selectedRoom).steps.length - 1 ? "8px" : "0" }}>
                          <p style={{ fontSize: "13px", fontWeight: i === 0 || i === getLocale(selectedRoom).steps.length - 1 ? 800 : 600, color: C.navy }}>
                            {step.replace(/^[^\s]+\s/, "")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ComicCard>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "4px", height: "18px", backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("home_floor_nav")}</span>
                </div>

                <ComicCard style={{ padding: "14px", marginBottom: "12px", backgroundColor: selectedRoom.access === "elevator" ? C.pale : selectedRoom.access === "stairs" ? "#E8D5FF" : C.mint + "55", border: "none", boxShadow: "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "46px", height: "46px", flexShrink: 0,
                      backgroundColor: C.white, border: `2.5px solid ${C.navy}`,
                      borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                    }}>
                      {selectedRoom.access === "elevator" ? "🛗" : selectedRoom.access === "stairs" ? "🪜" : "🚶"}
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898" }}>
                        {selectedRoom.access === "elevator" ? t("home_elev") : selectedRoom.access === "stairs" ? t("home_stairs") : t("home_no_elev")}
                      </p>
                      <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{getLocale(selectedRoom).accessDetail}</p>
                    </div>
                  </div>
                </ComicCard>

                <ComicCard style={{ padding: "14px", backgroundColor: C.ice, border: "none", boxShadow: "none" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "22px", flexShrink: 0 }}>📌</span>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#4B6898", marginBottom: "4px" }}>{t("home_arrive")}</p>
                      <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy, lineHeight: 1.5 }}>{getLocale(selectedRoom).floorGuide}</p>
                    </div>
                  </div>
                </ComicCard>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", marginBottom: "10px" }}>
                  <div style={{ width: "4px", height: "18px", backgroundColor: C.purple, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>
                    {lang === "zh" ? "🏛️ 楼宇评论" : "🏛️ Building Comments"}
                  </span>
                </div>

                <ComicCard style={{ padding: "12px", backgroundColor: "#F1EEFF", border: "none", boxShadow: "none" }}>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898", marginBottom: "10px" }}>
                    {lang === "zh"
                      ? `当前楼宇：${normalizeBuildingName(getLocale(selectedRoom).building)}`
                      : `Building: ${normalizeBuildingName(getLocale(selectedRoom).building)}`}
                  </p>

                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setBuildingActivePerspective("freshman")}
                      style={{
                        flex: 1,
                        height: "34px",
                        borderRadius: "11px",
                        cursor: "pointer",
                        backgroundColor: buildingActivePerspective === "freshman" ? C.royal : C.white,
                        color: buildingActivePerspective === "freshman" ? C.white : "#4B6898",
                        border: `2px solid ${C.navy}`,
                        boxShadow: buildingActivePerspective === "freshman" ? `2px 2px 0 ${C.navy}` : `1.5px 1.5px 0 ${C.pale}`,
                        fontSize: "12px",
                        fontWeight: 900,
                      }}
                    >
                      🌱 {lang === "zh" ? "新生视角" : "Freshman"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBuildingActivePerspective("visitor")}
                      style={{
                        flex: 1,
                        height: "34px",
                        borderRadius: "11px",
                        cursor: "pointer",
                        backgroundColor: buildingActivePerspective === "visitor" ? C.royal : C.white,
                        color: buildingActivePerspective === "visitor" ? C.white : "#4B6898",
                        border: `2px solid ${C.navy}`,
                        boxShadow: buildingActivePerspective === "visitor" ? `2px 2px 0 ${C.navy}` : `1.5px 1.5px 0 ${C.pale}`,
                        fontSize: "12px",
                        fontWeight: 900,
                      }}
                    >
                      🌍 {lang === "zh" ? "外来访客视角" : "Visitor"}
                    </button>
                  </div>

                  <textarea
                    value={buildingDraftText}
                    onChange={(e) => {
                      setBuildingDraftText(e.target.value);
                      if (buildingCommentError) setBuildingCommentError("");
                    }}
                    rows={3}
                    placeholder={lang === "zh" ? "写下你对这栋楼的感受或建议" : "Share your thoughts or tips for this building"}
                    style={{
                      width: "100%",
                      backgroundColor: C.white,
                      border: `2px solid ${C.navy}`,
                      borderRadius: "10px",
                      padding: "8px 10px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: C.navy,
                      outline: "none",
                      resize: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", marginTop: "8px", marginBottom: "8px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", margin: 0 }}>
                      {lang === "zh" ? "评论仅展示在当前楼宇中" : "Comments are scoped to this building only"}
                    </p>
                    <button
                      type="button"
                      onClick={handlePostBuildingComment}
                      style={{
                        height: "32px",
                        padding: "0 12px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        backgroundColor: C.royal,
                        border: `2px solid ${C.navy}`,
                        boxShadow: `2px 2px 0 ${C.navy}`,
                        color: C.white,
                        fontSize: "12px",
                        fontWeight: 900,
                      }}
                    >
                      {lang === "zh" ? "发布" : "Post"}
                    </button>
                  </div>

                  {buildingCommentError && (
                    <p style={{ marginTop: "4px", marginBottom: "8px", fontSize: "11px", fontWeight: 800, color: C.coral }}>
                      {buildingCommentError}
                    </p>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "220px", overflowY: "auto", paddingRight: "4px" }}>
                    {buildingComments
                      .filter((c) => c.buildingKey === getBuildingKeyFromRoom(selectedRoom.room))
                      .filter((c) => c.textLang === lang)
                      .filter((c) => c.perspective === buildingActivePerspective)
                      .map((c) => (
                        <div key={c.id} style={{ backgroundColor: C.white, border: `1.5px solid ${C.pale}`, borderRadius: "10px", padding: "8px 9px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <p style={{ fontSize: "12px", fontWeight: 800, color: C.navy, marginBottom: "4px", wordBreak: "break-word" }}>
                                {c.text}
                              </p>
                              <p style={{ fontSize: "10px", fontWeight: 700, color: "#4B6898", marginBottom: 0 }}>
                                {formatCommentTime(c.createdAt)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteBuildingComment(c.id)}
                              aria-label={lang === "zh" ? "删除评论" : "Delete comment"}
                              title={lang === "zh" ? "删除评论" : "Delete comment"}
                              style={{
                                width: "26px",
                                height: "26px",
                                flexShrink: 0,
                                backgroundColor: C.white,
                                border: `1.5px solid ${C.navy}`,
                                borderRadius: "8px",
                                boxShadow: `1.5px 1.5px 0 ${C.navy}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                            >
                              <IconTrash size={12} />
                            </button>
                          </div>
                        </div>
                      ))}

                    {buildingComments
                      .filter((c) => c.buildingKey === getBuildingKeyFromRoom(selectedRoom.room))
                      .filter((c) => c.textLang === lang)
                      .filter((c) => c.perspective === buildingActivePerspective).length === 0 && (
                      <div style={{ backgroundColor: C.cream, border: `1.5px dashed ${C.pale}`, borderRadius: "10px", padding: "9px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898", marginBottom: 0 }}>
                          {lang === "zh"
                            ? "这个视角下还没有评论，欢迎成为第一个留言的人！"
                            : "No comments in this perspective yet. Be the first to leave one."}
                        </p>
                      </div>
                    )}
                  </div>
                </ComicCard>

                <button
                  onClick={closeSearch}
                  style={{ width: "100%", marginTop: "16px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: C.royal, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`, color: C.white, fontSize: "15px", fontWeight: 900, cursor: "pointer" }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                >
                  {t("home_start_nav")}
                </button>
              </div>
            </>
          ) : (
            /* ── Search Panel ── */
            <>
              {/* Search header */}
              <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "10px 16px 16px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <button
                    onClick={closeSearch}
                    style={{ width: "34px", height: "34px", backgroundColor: "rgba(255,255,255,0.2)", border: `2px solid rgba(255,255,255,0.4)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    <IconBack size={18} color="white" />
                  </button>
                  <p style={{ fontSize: "18px", fontWeight: 900, color: C.white, textShadow: `1px 1px 0 ${C.navy}` }}>{t("home_search_title")}</p>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B6898" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" />
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={normalizeBuildingName(t("home_search_ph"))}
                    style={{
                      width: "100%", height: "44px",
                      backgroundColor: C.white, border: `2.5px solid ${C.navy}`,
                      borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
                      paddingLeft: "36px", paddingRight: "12px",
                      fontSize: "13px", fontWeight: 600, color: C.navy,
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#94A3B8" }}
                    >✕</button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-3" style={{ paddingBottom: "20px" }}>
                {query.trim() === "" && (
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px" }}>
                    {t("home_search_hint")}
                  </p>
                )}
                {filtered.length === 0 ? (
                  <ComicCard style={{ padding: "24px", textAlign: "center", backgroundColor: C.cream, border: "none", boxShadow: "none" }}>
                    <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>🔍</span>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy }}>{t("home_not_found")}</p>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#4B6898", marginTop: "4px" }}>{t("home_not_found_sub")}</p>
                  </ComicCard>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filtered.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          backgroundColor: C.white, border: `2.5px solid ${C.navy}`,
                          borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
                          padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%",
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                        onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                      >
                        <div style={{ width: "44px", height: "44px", backgroundColor: C.pale, border: `2px solid ${C.navy}`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                          🏛️
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                            <span style={{ fontSize: "15px", fontWeight: 900, color: C.navy }}>{room.room}</span>
                            <span style={{ backgroundColor: C.sky, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 900, color: C.white }}>{t("home_floor", { n: room.floor })}</span>
                          </div>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "#4B6898" }}>{normalizeBuildingName(getLocale(room).building)}</p>
                        </div>
                        <IconChevronRight size={16} color={C.navy} />
                      </button>
                    ))}
                    {query.trim() === "" && (
                      <p style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#94A3B8", marginTop: "4px" }}>
                        {t("home_more_rooms")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {showAiBuddy && (
        <div style={{ position: "absolute", inset: 0, zIndex: 60, backgroundColor: "rgba(14, 27, 77, 0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "14px" }}>
          <div style={{ width: "100%", height: "min(78vh, 620px)", maxWidth: "420px", backgroundColor: C.white, border: `2.5px solid ${C.navy}`, borderRadius: "16px", boxShadow: `5px 5px 0 ${C.navy}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ backgroundColor: C.purple, borderBottom: `2px solid ${C.navy}`, padding: "10px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 900, color: C.white }}>🤖 UniAIBuddy</p>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>
                  {lang === "zh" ? "你好，我是 UniAIBuddy" : "Hi, I am UniAIBuddy"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAiBuddy(false)}
                style={{ width: "32px", height: "32px", borderRadius: "10px", border: `2px solid rgba(255,255,255,0.5)`, backgroundColor: "rgba(255,255,255,0.18)", color: C.white, fontSize: "16px", fontWeight: 900, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div
              ref={aiMessagesScrollRef}
              style={{ flex: 1, overflowY: "auto", backgroundColor: "#F7FAFF", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {aiMessages.length === 0 && (
                <div style={{ backgroundColor: C.white, border: `1.5px solid ${C.pale}`, borderRadius: "10px", padding: "8px 10px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", lineHeight: 1.5 }}>
                    {lang === "zh" ? "你可以问我：怎么开始定位？怎么用盲盒路线？" : "Try asking: how to start live location? how to use mystery route?"}
                  </p>
                </div>
              )}
              {aiMessages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  style={{
                    alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "90%",
                    backgroundColor: msg.role === "user" ? C.ice : C.white,
                    border: `1.5px solid ${C.pale}`,
                    borderRadius: "10px",
                    padding: "8px 10px",
                  }}
                >
                  <p style={{ fontSize: "10px", fontWeight: 900, color: "#4B6898", marginBottom: "4px" }}>
                    {msg.role === "user" ? (lang === "zh" ? "你" : "You") : "UniAIBuddy"}
                  </p>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#355087", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </p>
                </div>
              ))}
              {aiLoading && (
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898" }}>
                  {lang === "zh" ? "UniAIBuddy 正在思考..." : "UniAIBuddy is thinking..."}
                </p>
              )}
            </div>

            <div style={{ borderTop: `2px solid ${C.pale}`, padding: "10px", backgroundColor: C.white }}>
              {aiPresetQuestions.length > 0 && (
                <div style={{ marginBottom: "10px" }}>
                  <p style={{ fontSize: "10px", fontWeight: 800, color: "#4B6898", margin: "0 0 6px 2px" }}>
                    {lang === "zh" ? "高频问题推荐 · 左滑查看更多" : "Suggested questions · swipe sideways for more"}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      overflowX: "auto",
                      paddingBottom: "4px",
                      WebkitOverflowScrolling: "touch",
                      scrollbarWidth: "thin",
                      margin: "0 -2px",
                      paddingLeft: "2px",
                      paddingRight: "2px",
                    }}
                  >
                    {aiPresetQuestions.map((question) => (
                      <button
                        key={question}
                        type="button"
                        disabled={aiLoading}
                        onClick={() => void handleAskUniAIBuddy(question)}
                        style={{
                          flex: "0 0 auto",
                          maxWidth: "min(240px, 78vw)",
                          border: `1.5px solid ${C.sky}`,
                          borderRadius: "12px",
                          padding: "6px 10px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: aiLoading ? "#6E7FA8" : C.royal,
                          backgroundColor: aiLoading ? "#E7EEF9" : "#EEF5FF",
                          cursor: aiLoading ? "not-allowed" : "pointer",
                          lineHeight: 1.35,
                          textAlign: "left",
                          whiteSpace: "normal",
                        }}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px" }}>
                <textarea
                  ref={aiInputRef}
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  rows={1}
                  placeholder={lang === "zh" ? "输入问题，Ctrl/Cmd + Enter 发送" : "Type your question, Ctrl/Cmd + Enter to send"}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      void handleAskUniAIBuddy();
                    }
                  }}
                  style={{
                    flex: 1,
                    minHeight: "34px",
                    maxHeight: "74px",
                    backgroundColor: C.white,
                    border: `2px solid ${C.navy}`,
                    borderRadius: "10px",
                    padding: "7px 10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: C.navy,
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => void handleAskUniAIBuddy()}
                  disabled={!aiQuestion.trim() || aiLoading}
                  style={{
                    height: "34px",
                    minWidth: "84px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    cursor: !aiQuestion.trim() || aiLoading ? "not-allowed" : "pointer",
                    backgroundColor: !aiQuestion.trim() || aiLoading ? "#B7C7E9" : C.royal,
                    border: `2px solid ${C.navy}`,
                    boxShadow: !aiQuestion.trim() || aiLoading ? "none" : `2px 2px 0 ${C.navy}`,
                    color: C.white,
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  {aiLoading ? (lang === "zh" ? "回答中..." : "Thinking...") : (lang === "zh" ? "发送" : "Send")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLangGuide && langGuideRect && langGuideBubbleStyle && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 65, backgroundColor: "rgba(2, 6, 23, 0.42)" }}
            aria-hidden
          />
          <div
            style={{
              position: "fixed",
              zIndex: 66,
              top: langGuideRect.top - 8,
              left: langGuideRect.left - 8,
              width: langGuideRect.width + 16,
              height: langGuideRect.height + 16,
              borderRadius: "20px",
              border: "3px solid #FFE066",
              boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.28)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 67,
              width: langGuideBubbleStyle.width,
              left: langGuideBubbleStyle.left,
              top: langGuideBubbleStyle.top,
              backgroundColor: C.white,
              border: `2px solid ${C.navy}`,
              borderRadius: "20px",
              boxShadow: `6px 8px 0 rgba(14, 27, 77, 0.22), 4px 4px 0 ${C.navy}`,
              padding: "16px 16px 14px",
            }}
            role="dialog"
            aria-labelledby="lang-onboard-title"
          >
            <div
              style={{
                position: "absolute",
                top: -9,
                left: langGuideBubbleStyle.pointerX,
                width: 0,
                height: 0,
                borderLeft: "9px solid transparent",
                borderRight: "9px solid transparent",
                borderBottom: `9px solid ${C.white}`,
              }}
            />

            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
              <span style={{ fontSize: "26px", lineHeight: 1, flexShrink: 0 }} aria-hidden>🌐</span>
              <p id="lang-onboard-title" style={{ fontSize: "15px", fontWeight: 900, color: C.navy, margin: 0, lineHeight: 1.35 }}>
                {t("home_lang_onboard_title")}
              </p>
            </div>
            <p style={{ fontSize: "12px", fontWeight: 800, color: C.navy, margin: "0 0 6px", lineHeight: 1.45 }}>
              {t("home_lang_onboard_body")}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => handleChooseLanguage("zh")}
                style={{
                  flex: 1,
                  height: "46px",
                  borderRadius: "14px",
                  border: `2px solid ${C.navy}`,
                  backgroundColor: C.white,
                  color: C.navy,
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("home_lang_onboard_switch_zh")}
              </button>
              <button
                type="button"
                onClick={() => handleChooseLanguage("en")}
                style={{
                  flex: 1,
                  height: "46px",
                  borderRadius: "14px",
                  border: `2px solid ${C.navy}`,
                  backgroundColor: C.royal,
                  color: C.white,
                  fontSize: "13px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: `3px 4px 0 ${C.navy}`,
                }}
              >
                {t("home_lang_onboard_keep_en")}
              </button>
            </div>
          </div>
        </>
      )}

      {showAiGuide && aiGuideRect && aiGuideBubbleStyle && !showAiBuddy && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 57, backgroundColor: "rgba(2, 6, 23, 0.42)" }}
            onClick={closeAiGuide}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 58,
              top: aiGuideRect.top - 8,
              left: aiGuideRect.left - 8,
              width: aiGuideRect.width + 16,
              height: aiGuideRect.height + 16,
              borderRadius: "20px",
              border: "3px solid #FFE066",
              boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.28)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "fixed",
              zIndex: 59,
              width: aiGuideBubbleStyle.width,
              left: aiGuideBubbleStyle.left,
              top: aiGuideBubbleStyle.top,
              backgroundColor: C.white,
              border: `2px solid ${C.navy}`,
              borderRadius: "18px",
              boxShadow: `4px 4px 0 ${C.navy}`,
              padding: "12px 12px 10px",
            }}
          >
            <p style={{ fontSize: "12px", fontWeight: 900, color: C.royal, marginBottom: "6px" }}>
              {t("nav_guide_step", { current: ONBOARDING_AI_STEP, total: ONBOARDING_AI_STEP })}
            </p>
            <p style={{ fontSize: "14px", fontWeight: 900, color: C.navy, marginBottom: "4px" }}>
              {t("home_ai_guide_title")}
            </p>
            <p style={{ fontSize: "13px", fontWeight: 700, color: "#4B6898", lineHeight: 1.45, marginBottom: "10px" }}>
              {t("home_ai_guide_desc")}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={closeAiGuide}
                style={{
                  height: "34px",
                  padding: "0 12px",
                  borderRadius: "11px",
                  border: `2px solid ${C.navy}`,
                  backgroundColor: C.white,
                  color: C.navy,
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                {t("home_ai_guide_skip")}
              </button>
              <button
                type="button"
                onClick={closeAiGuide}
                style={{
                  height: "34px",
                  padding: "0 12px",
                  borderRadius: "11px",
                  border: `2px solid ${C.navy}`,
                  backgroundColor: C.royal,
                  color: C.white,
                  fontSize: "12px",
                  fontWeight: 900,
                  cursor: "pointer",
                  boxShadow: `2px 2px 0 ${C.navy}`,
                }}
              >
                {t("home_ai_guide_confirm")}
              </button>
            </div>
          </div>
        </>
      )}
    </PhoneShell>
  );
}

function SectionLabel({ color, text, icon }: { color: string; text: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
      <div style={{ width: "4px", height: "18px", backgroundColor: color, border: "none", borderRadius: "2px" }} />
      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0E1B4D" }}>{text}</span>
      {icon}
    </div>
  );
}

export default HomeScreen;
