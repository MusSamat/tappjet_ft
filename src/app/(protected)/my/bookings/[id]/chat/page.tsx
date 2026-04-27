import type { Metadata } from "next";
import { ChatPanel } from "@/components/features/chat/chat-panel";

export const metadata: Metadata = {
  title: "Чат",
  robots: { index: false, follow: false },
};

export default function ChatPage({ params }: { params: { id: string } }) {
  return <ChatPanel bookingId={params.id} />;
}
