"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ONBOARDING_KEY = "tappjet_onboarding_done";

export function OnboardingGate() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      router.replace("/onboarding");
    }
  }, [router]);
  return null;
}
