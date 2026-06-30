export const ONBOARDING_LANG_STEP = 0;
export const ONBOARDING_MAX_STEP = 6;
export const ONBOARDING_AI_STEP = 6;
export const ONBOARDING_EVENT_NAME = "unibuddy-onboarding-step-change";

export type OnboardingStep = number | "done";

/** 0 = 首页语言切换提示，1–5 = 底栏引导，6 = UniAIBuddy 卡片引导 */
let onboardingStep: OnboardingStep = ONBOARDING_LANG_STEP;

const clampStep = (step: number) =>
  Math.min(ONBOARDING_MAX_STEP, Math.max(ONBOARDING_LANG_STEP, Math.floor(step)));

export function getOnboardingStep(): OnboardingStep {
  return onboardingStep;
}

export function setOnboardingStep(step: OnboardingStep) {
  onboardingStep = step === "done" ? "done" : clampStep(step);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ONBOARDING_EVENT_NAME));
  }
}
