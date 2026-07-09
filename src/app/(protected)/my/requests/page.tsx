import { redirect } from "next/navigation";

// «Мои заявки» are folded into the «Мои» hub's «Объявления» (posts) tab, which
// lists the user's trips AND requests. Keep this route for the desktop top-nav
// link + notification deep-links; forward to the tab that actually exists.
export default function MyRequestsPage() {
  redirect("/my/bookings?tab=posts");
}
