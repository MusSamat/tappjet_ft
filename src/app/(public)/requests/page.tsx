import { RequestsFeed } from "@/components/features/passenger-requests/requests-feed";

// Legacy deep-link route — the unified home `/` renders this same feed in
// driver mode. Kept for shareable /requests?from&to links and notifications.
export const revalidate = 0;

export default function RequestsPage() {
  return <RequestsFeed />;
}
