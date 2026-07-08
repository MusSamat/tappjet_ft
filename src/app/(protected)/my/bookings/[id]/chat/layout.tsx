export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="chat-page-wrapper flex flex-col" style={{ minHeight: "calc(100vh - 64px)" }}>
      <div className="flex-1">{children}</div>
      <div className="flex items-center justify-center gap-1.5 py-2 opacity-40">
        <span className="text-[11px] font-bold tracking-widest text-ink-400">TAPPJET</span>
        <span className="h-1 w-1 rounded-full bg-brand-400" />
        <span className="text-[11px] text-ink-400">🇰🇬</span>
      </div>
    </div>
  );
}
