import { redirect } from "next/navigation";

// «Мои заявки» is folded into the «Мои» hub as the `my_requests` tab so it is
// reachable on mobile (bottom-nav → «Мои»). Keep this route for the desktop
// top-nav link + notification deep-links; it forwards to the hub tab.
export default function MyRequestsPage() {
  redirect("/my/bookings?tab=my_requests");
}
