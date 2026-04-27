"use client";

import { useEffect, useState } from "react";

export function useCountdown(seconds: number): { remaining: number; reset: (s?: number) => void } {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remaining]);

  return {
    remaining,
    reset: (s = seconds) => setRemaining(s),
  };
}
