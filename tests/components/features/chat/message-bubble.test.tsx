import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "@/components/features/chat/message-bubble";
import type { ChatMessage } from "@/lib/api/chat";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));
vi.mock("next/image", () => ({ default: ({ src, alt }: any) => <img src={src} alt={alt} /> }));

const baseMsg: ChatMessage & { pending?: boolean; failed?: boolean } = {
  id: "m1",
  bookingId: "b1",
  senderId: "u1",
  text: "Hello",
  isRead: false,
  createdAt: "2024-06-15T10:05:00.000Z",
};

describe("MessageBubble", () => {
  it("renders message text", () => {
    render(<MessageBubble message={baseMsg} isMine={false} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("isMine=true: wrapper has justify-end class", () => {
    const { container } = render(<MessageBubble message={baseMsg} isMine={true} />);
    expect(container.firstChild).toHaveClass("justify-end");
  });

  it("isMine=false: wrapper has justify-start class", () => {
    const { container } = render(<MessageBubble message={baseMsg} isMine={false} senderName="Алексей" />);
    expect(container.firstChild).toHaveClass("justify-start");
  });

  it("isMine=false: renders DriverAvatar with aria-label matching senderName", () => {
    render(<MessageBubble message={baseMsg} isMine={false} senderName="Алексей" />);
    expect(screen.getByLabelText("Алексей")).toBeInTheDocument();
  });

  it("shows formatted time HH:MM from createdAt", () => {
    render(<MessageBubble message={baseMsg} isMine={true} />);
    // The bubble formats in the viewer's LOCAL zone (getHours), so compute the
    // expected string the same way — timezone-independent assertion.
    const d = new Date(baseMsg.createdAt!);
    const expected = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("pending=true shows Clock icon with aria-label sending", () => {
    const msg = { ...baseMsg, pending: true };
    render(<MessageBubble message={msg} isMine={true} />);
    expect(screen.getByLabelText("sending")).toBeInTheDocument();
  });

  it("failed=true shows ! indicator with aria-label failed", () => {
    const msg = { ...baseMsg, failed: true };
    render(<MessageBubble message={msg} isMine={true} />);
    expect(screen.getByLabelText("failed")).toBeInTheDocument();
  });

  it("isRead=true shows CheckCheck icon with aria-label read", () => {
    const msg = { ...baseMsg, isRead: true };
    render(<MessageBubble message={msg} isMine={true} />);
    expect(screen.getByLabelText("read")).toBeInTheDocument();
  });

  it("isRead=false (not pending, not failed) shows Check icon with aria-label delivered", () => {
    const msg = { ...baseMsg, isRead: false };
    render(<MessageBubble message={msg} isMine={true} />);
    expect(screen.getByLabelText("delivered")).toBeInTheDocument();
  });
});
