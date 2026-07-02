import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, type StatusBadgeStatus } from "@/components/ui/status-badge";
import ru from "@/messages/ru.json";

vi.mock("next-intl", async () => {
  const messages = (await import("@/messages/ru.json")).default as unknown as Record<
    string,
    Record<string, string>
  >;
  return {
    useTranslations: (ns: string) => (key: string) => messages[ns]?.[key] ?? `${ns}.${key}`,
  };
});

const status = ru.status as Record<string, string>;

describe("StatusBadge — i18n labels", () => {
  it("renders the ru label for every known status", () => {
    const all: StatusBadgeStatus[] = [
      "active",
      "open",
      "accepted",
      "pending",
      "viewed",
      "rejected",
      "cancelled",
      "cancelled_by_passenger",
      "cancelled_by_driver",
      "cancelled_late",
      "no_show",
      "completed",
      "expired",
      "closed",
    ];
    for (const s of all) {
      const { unmount } = render(<StatusBadge status={s} />);
      expect(screen.getByText(status[s]!)).toBeInTheDocument();
      unmount();
    }
  });

  it("label prop overrides the i18n label", () => {
    render(<StatusBadge status="pending" label="Custom" />);
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.queryByText(status.pending!)).not.toBeInTheDocument();
  });

  it("unknown status renders the raw status string", () => {
    render(<StatusBadge status="weird_status" />);
    expect(screen.getByText("weird_status")).toBeInTheDocument();
  });
});

describe("StatusBadge — status → style mapping", () => {
  const cases: Array<[StatusBadgeStatus, string]> = [
    ["active", "bg-brand-600"],
    ["open", "bg-brand-600"],
    ["accepted", "bg-brand-50"],
    ["pending", "bg-accent-100"],
    ["viewed", "bg-accent-100"],
    ["rejected", "bg-danger-50"],
    ["cancelled", "bg-danger-50"],
    ["cancelled_by_passenger", "bg-danger-50"],
    ["cancelled_by_driver", "bg-danger-50"],
    ["cancelled_late", "bg-danger-50"],
    ["no_show", "bg-danger-50"],
    ["completed", "bg-ink-100"],
    ["expired", "bg-ink-100"],
    ["closed", "bg-ink-100"],
  ];

  it.each(cases)("%s uses %s", (s, cls) => {
    const { container } = render(<StatusBadge status={s} />);
    expect(container.firstChild).toHaveClass(cls);
  });

  it("active/open are solid brand (white text)", () => {
    const { container } = render(<StatusBadge status="active" />);
    expect(container.firstChild).toHaveClass("text-white");
  });

  it("unknown status falls back to ink style", () => {
    const { container } = render(<StatusBadge status="weird_status" />);
    expect(container.firstChild).toHaveClass("bg-ink-100");
  });

  it("merges custom className", () => {
    const { container } = render(<StatusBadge status="pending" className="extra" />);
    expect(container.firstChild).toHaveClass("extra");
  });
});
