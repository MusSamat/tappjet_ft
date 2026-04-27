"use client";

import { Send } from "lucide-react";
import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

interface Props {
  onSend: (text: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  className?: string;
}

const MAX = 2000;

export function MessageComposer({ onSend, onTyping, disabled, className }: Props) {
  const t = useTranslations("chat");
  const [text, setText] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || disabled) return;
    onSend(t);
    setText("");
    requestAnimationFrame(() => taRef.current?.focus());
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  };

  return (
    <form
      onSubmit={submit}
      className={cn(
        "flex items-end gap-2 border-t border-gray-100 bg-white p-3 pb-[calc(12px+env(safe-area-inset-bottom))]",
        className,
      )}
    >
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value.slice(0, MAX));
          onTyping?.();
        }}
        onKeyDown={handleKey}
        placeholder={t("placeholder")}
        rows={1}
        disabled={disabled}
        className="flex max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border-[1.5px] border-gray-300 bg-white px-4 py-2.5 text-body font-semibold text-gray-900 outline-none focus:border-teal-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label={t("send_aria")}
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40"
      >
        <Send className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  );
}
