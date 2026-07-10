"use client";

import { useAuth } from "@/store/auth";
import { SearchLayout } from "./search-layout";
import { RequestsFeed } from "@/components/features/passenger-requests/requests-feed";

// Unified home `/` — one search screen for both intents. The active role picks
// the feed and the header toggle switches it in place (see feed-header):
//   passenger → trips feed · driver → passenger-requests feed.
// Each feed keeps its search header always visible and shows entry hints
// (recent/popular) until a route is set — one page, only the body swaps.
export function HomeFeed() {
  const isDriver = useAuth((s) => s.activeMode === "driver");
  return isDriver ? <RequestsFeed /> : <SearchLayout />;
}
