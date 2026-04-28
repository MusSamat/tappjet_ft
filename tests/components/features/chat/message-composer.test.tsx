import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MessageComposer } from "@/components/features/chat/message-composer";

vi.mock("next-intl", () => ({ useTranslations: () => (k: string) => k }));

describe("MessageComposer", () => {
  it("renders a textarea", () => {
    render(<MessageComposer onSend={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("send button is disabled when textarea is empty", () => {
    render(<MessageComposer onSend={vi.fn()} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("send button is enabled after typing text", async () => {
    const user = userEvent.setup();
    render(<MessageComposer onSend={vi.fn()} />);
    await user.type(screen.getByRole("textbox"), "Hi");
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("clicking send button calls onSend with trimmed text", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);
    await user.type(screen.getByRole("textbox"), "  Hello  ");
    await user.click(screen.getByRole("button"));
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("pressing Enter submits and calls onSend", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);
    const ta = screen.getByRole("textbox");
    await user.type(ta, "Hello{Enter}");
    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("pressing Shift+Enter does NOT submit", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);
    const ta = screen.getByRole("textbox");
    await user.type(ta, "Hello");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(onSend).not.toHaveBeenCalled();
  });

  it("after send, textarea is cleared", async () => {
    const user = userEvent.setup();
    render(<MessageComposer onSend={vi.fn()} />);
    const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
    await user.type(ta, "Hello");
    await user.click(screen.getByRole("button"));
    expect(ta.value).toBe("");
  });

  it("onTyping is called when textarea value changes", async () => {
    const user = userEvent.setup();
    const onTyping = vi.fn();
    render(<MessageComposer onSend={vi.fn()} onTyping={onTyping} />);
    await user.type(screen.getByRole("textbox"), "H");
    expect(onTyping).toHaveBeenCalled();
  });

  it("disabled=true disables the textarea and send button", () => {
    render(<MessageComposer onSend={vi.fn()} disabled={true} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onSend with whitespace-only text", async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<MessageComposer onSend={onSend} />);
    const ta = screen.getByRole("textbox");
    await user.type(ta, "   ");
    expect(screen.getByRole("button")).toBeDisabled();
    fireEvent.submit(ta.closest("form")!);
    expect(onSend).not.toHaveBeenCalled();
  });
});
