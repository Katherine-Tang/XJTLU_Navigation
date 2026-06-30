import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  IconHome,
  IconMap,
  IconCamera,
  IconRoute,
  IconProfile,
} from "./ComicIcons";
import { useCamera } from "../context/CameraContext";
import { useLanguage } from "../context/LanguageContext";
import {
  ONBOARDING_AI_STEP,
  ONBOARDING_EVENT_NAME,
  ONBOARDING_LANG_STEP,
  getOnboardingStep,
  setOnboardingStep,
} from "../onboardingState";

type TabName = "Home" | "Map" | "Route" | "Profile" | "Camera";
const NAV_GUIDE_MAX_STEP = 5;

interface BottomNavProps {
  activeTab: TabName;
}

export function BottomNav({ activeTab }: BottomNavProps) {
  const navigate = useNavigate();
  const { openCamera } = useCamera();
  const { t } = useLanguage();
  const navRootRef = useRef<HTMLDivElement | null>(null);
  const navButtonRefs = useRef<Partial<Record<TabName, HTMLButtonElement | null>>>({});
  const [showGuide, setShowGuide] = useState(false);
  const [guideStepIndex, setGuideStepIndex] = useState(0);
  const [guideTargetRect, setGuideTargetRect] = useState<DOMRect | null>(null);

  const navItems: {
    id: TabName;
    label: string;
    path?: string;
    icon: (active: boolean) => React.ReactNode;
    action?: () => void;
  }[] = [
    {
      id: "Home",
      label: t("nav_home"),
      path: "/home",
      icon: (a) => <IconHome size={26} active={a} />,
    },
    {
      id: "Map",
      label: t("nav_map"),
      path: "/pictures",
      icon: (a) => <IconMap size={26} active={a} />,
    },
    {
      id: "Camera",
      label: t("nav_camera"),
      icon: () => <IconCamera size={26} />,
      action: openCamera,
    },
    {
      id: "Route",
      label: t("nav_route"),
      path: "/route",
      icon: (a) => <IconRoute size={26} active={a} />,
    },
    {
      id: "Profile",
      label: t("nav_profile"),
      path: "/profile",
      icon: (a) => <IconProfile size={26} active={a} />,
    },
  ];
  const guideSteps = useMemo(
    () => [
      { id: "Home" as TabName, description: t("nav_guide_home_desc") },
      { id: "Map" as TabName, description: t("nav_guide_map_desc") },
      { id: "Camera" as TabName, description: t("nav_guide_camera_desc") },
      { id: "Route" as TabName, description: t("nav_guide_route_desc") },
      { id: "Profile" as TabName, description: t("nav_guide_profile_desc") },
    ],
    [t],
  );
  const currentGuideStep = showGuide ? guideSteps[guideStepIndex] : null;
  const currentGuideLabel = currentGuideStep
    ? navItems.find((item) => item.id === currentGuideStep.id)?.label ?? currentGuideStep.id
    : "";

  const completeGuide = useCallback(() => {
    setShowGuide(false);
    setGuideStepIndex(0);
    setGuideTargetRect(null);
    setOnboardingStep("done");
  }, []);

  const updateGuideTarget = useCallback(() => {
    if (!showGuide || !currentGuideStep) {
      setGuideTargetRect(null);
      return;
    }
    const target = navButtonRefs.current[currentGuideStep.id];
    setGuideTargetRect(target ? target.getBoundingClientRect() : null);
  }, [currentGuideStep, showGuide]);

  useEffect(() => {
    const syncNavGuide = () => {
      const currentStep = getOnboardingStep();
      if (currentStep === "done" || currentStep >= ONBOARDING_AI_STEP) {
        setShowGuide(false);
        return;
      }
      if (currentStep === ONBOARDING_LANG_STEP) {
        setShowGuide(false);
        return;
      }
      if (typeof currentStep === "number") {
        setGuideStepIndex(Math.min(NAV_GUIDE_MAX_STEP - 1, Math.max(0, currentStep - 1)));
        setShowGuide(true);
      }
    };

    syncNavGuide();
    window.addEventListener("storage", syncNavGuide);
    window.addEventListener(ONBOARDING_EVENT_NAME, syncNavGuide);
    return () => {
      window.removeEventListener("storage", syncNavGuide);
      window.removeEventListener(ONBOARDING_EVENT_NAME, syncNavGuide);
    };
  }, []);

  useEffect(() => {
    updateGuideTarget();
    if (!showGuide) {
      return;
    }
    window.addEventListener("resize", updateGuideTarget);
    window.addEventListener("scroll", updateGuideTarget, true);
    return () => {
      window.removeEventListener("resize", updateGuideTarget);
      window.removeEventListener("scroll", updateGuideTarget, true);
    };
  }, [showGuide, guideStepIndex, updateGuideTarget]);

  const handleSkipGuide = useCallback(() => {
    completeGuide();
  }, [completeGuide]);

  const handleConfirmGuide = useCallback(() => {
    if (guideStepIndex >= guideSteps.length - 1) {
      setShowGuide(false);
      setGuideStepIndex(0);
      setGuideTargetRect(null);
      setOnboardingStep(ONBOARDING_AI_STEP);
      return;
    }
    setGuideStepIndex((prev) => {
      const next = prev + 1;
      setOnboardingStep(next + 1);
      return next;
    });
  }, [guideStepIndex, guideSteps.length]);

  const guideBubbleStyle = useMemo(() => {
    if (!guideTargetRect || typeof window === "undefined") {
      return null;
    }
    const phoneShellRect = navRootRef.current
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

    const width = Math.min(280, Math.max(220, bounds.width - 24));
    const margin = 12;
    const estimatedHeight = 158;
    const centerX = guideTargetRect.left + guideTargetRect.width / 2;
    const left = Math.min(
      bounds.right - width - margin,
      Math.max(bounds.left + margin, centerX - width / 2),
    );
    const topCandidate = guideTargetRect.top - estimatedHeight - 10;
    const top = topCandidate > bounds.top + margin
      ? topCandidate
      : Math.min(bounds.bottom - estimatedHeight - margin, guideTargetRect.bottom + 10);
    return { left, top, width };
  }, [guideTargetRect]);

  return (
    <div
      ref={navRootRef}
      className="relative z-20 w-full shrink-0"
      style={{
        backgroundColor: "#FFFBF0",
        borderTop: "2.5px solid #0E1B4D",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex justify-around items-center pt-2 px-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isCamera = item.id === "Camera";

          const handleClick = () => {
            if (item.action) {
              item.action();
            } else if (item.path) {
              navigate(item.path);
            }
          };

          if (isCamera) {
            return (
              <button
                key={item.id}
                onClick={handleClick}
                ref={(element) => {
                  navButtonRefs.current[item.id] = element;
                }}
                className="flex flex-col items-center gap-1"
                style={{ marginTop: "-26px" }}
              >
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: "58px",
                    height: "58px",
                    backgroundColor: "#2350D8",
                    border: "2.5px solid #0E1B4D",
                    boxShadow: "3px 3px 0px #0E1B4D",
                  }}
                >
                  {item.icon(true)}
                </div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#2350D8",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={handleClick}
              ref={(element) => {
                navButtonRefs.current[item.id] = element;
              }}
              className="flex flex-col items-center gap-1"
              style={{ minWidth: "52px" }}
            >
              <div
                className="flex items-center justify-center rounded-xl transition-all"
                style={{
                  width: "44px",
                  height: "36px",
                  backgroundColor: isActive
                    ? "#2350D8"
                    : "transparent",
                  border: isActive
                    ? "2px solid #0E1B4D"
                    : "2px solid transparent",
                  boxShadow: isActive
                    ? "2px 2px 0px #0E1B4D"
                    : "none",
                }}
              >
                {item.icon(isActive)}
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 800,
                  color: isActive ? "#2350D8" : "#4B6898",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      {showGuide && currentGuideStep && guideTargetRect && guideBubbleStyle && (
        <>
          <div className="fixed inset-0 z-[55] bg-slate-950/45" onClick={handleSkipGuide} />
          <div
            className="pointer-events-none fixed z-[60] rounded-2xl border-[3px]"
            style={{
              top: guideTargetRect.top - 8,
              left: guideTargetRect.left - 8,
              width: guideTargetRect.width + 16,
              height: guideTargetRect.height + 16,
              borderColor: "#FFE066",
              boxShadow: "0 0 0 9999px rgba(2, 6, 23, 0.35)",
            }}
          />
          <div
            className="fixed z-[70] rounded-2xl border-[2px] bg-white p-3 shadow-[4px_4px_0px_#0E1B4D]"
            style={{
              top: guideBubbleStyle.top,
              left: guideBubbleStyle.left,
              width: guideBubbleStyle.width,
              borderColor: "#0E1B4D",
            }}
          >
            <p className="text-[11px] font-extrabold text-[#2350D8]">
              {t("nav_guide_step", {
                current: guideStepIndex + 1,
                total: ONBOARDING_AI_STEP,
              })}
            </p>
            <p className="mt-1 text-[14px] font-black text-[#0E1B4D]">{currentGuideLabel}</p>
            <p className="mt-1 text-[12px] font-bold leading-[1.35] text-[#4B6898]">
              {currentGuideStep.description}
            </p>
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={handleSkipGuide}
                className="rounded-xl border-[2px] px-3 py-1 text-[12px] font-black"
                style={{ borderColor: "#0E1B4D", color: "#0E1B4D" }}
              >
                {t("nav_guide_skip")}
              </button>
              <button
                onClick={handleConfirmGuide}
                className="rounded-xl border-[2px] px-3 py-1 text-[12px] font-black text-white"
                style={{
                  backgroundColor: "#2350D8",
                  borderColor: "#0E1B4D",
                  boxShadow: "2px 2px 0px #0E1B4D",
                }}
              >
                {guideStepIndex === guideSteps.length - 1
                  ? t("nav_guide_done")
                  : t("nav_guide_confirm")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
