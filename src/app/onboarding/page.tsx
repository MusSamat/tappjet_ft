"use client";

import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/components/features/onboarding/welcome-screen";
import { markOnboardingSeen } from "@/components/features/onboarding/onboarding-gate";
import { useAuth } from "@/store/auth";

export default function OnboardingPage() {
  const router = useRouter();
  const setActiveMode = useAuth((s) => s.setActiveMode);

  return (
    <WelcomeScreen
      onContinue={(mode) => {
        // Persist the first-selected role, then enter the app in it.
        setActiveMode(mode);
        markOnboardingSeen();
        router.replace("/trips");
      }}
    />
  );
}
