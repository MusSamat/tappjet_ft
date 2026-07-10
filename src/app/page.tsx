import { HomeFeed } from "@/components/features/search/home-feed";

// The home IS the search feed now — role-aware (passenger → trips, driver →
// requests), route-first, with the intent toggle switching in place.
export const revalidate = 0;

export default function HomePage() {
  return <HomeFeed />;
}
