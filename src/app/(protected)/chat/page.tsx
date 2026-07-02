import type { Metadata } from "next";
import { ChatHub } from "@/components/features/chat/chat-hub";

export const metadata: Metadata = {
  title: "Чаты",
  robots: { index: false, follow: false },
};

export default function ChatHubPage() {
  return <ChatHub />;
}
