import { redirect } from "next/navigation";

interface Props {
  params: { id: string };
}

/**
 * The booking form is now an ActionModal launched from the trip detail CTA
 * (design overhaul). This route stays valid for deep links / bookmarks by
 * redirecting to the detail page with the booking modal auto-opened.
 */
export default function BookTripPage({ params }: Props) {
  redirect(`/trips/${params.id}?book=1`);
}
