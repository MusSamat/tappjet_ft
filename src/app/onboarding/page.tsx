"use client";

import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/components/features/onboarding/welcome-screen";
import { markOnboardingSeen } from "@/components/features/onboarding/onboarding-gate";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onGuest={() => {
        markOnboardingSeen();
        router.replace("/trips");
      }}
    />
  );
}
