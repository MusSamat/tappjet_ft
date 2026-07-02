"use client";

import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/components/features/onboarding/welcome-screen";

const ONBOARDING_KEY = "tappjet_onboarding_done";

export default function OnboardingPage() {
  const router = useRouter();

  const markDone = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      // localStorage unavailable — proceed anyway
    }
  };

  return (
    <WelcomeScreen
      onLogin={() => {
        markDone();
        router.push("/auth/login");
      }}
      onGuest={() => {
        markDone();
        router.replace("/trips");
      }}
    />
  );
}
