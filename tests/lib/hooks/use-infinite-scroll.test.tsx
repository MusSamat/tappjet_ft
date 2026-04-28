import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, act } from "@testing-library/react";
import { useInfiniteScroll } from "@/lib/hooks/use-infinite-scroll";

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

let ioCallback: IOCallback | null = null;
const mockDisconnect = vi.fn();
const mockObserve = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  ioCallback = null;
  vi.stubGlobal("IntersectionObserver", vi.fn((cb: IOCallback) => {
    ioCallback = cb;
    return { observe: mockObserve, disconnect: mockDisconnect };
  }));
});

function trigger(isIntersecting: boolean) {
  act(() => {
    ioCallback?.([{ isIntersecting } as IntersectionObserverEntry]);
  });
}

function SentinelHost({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const sentinel = useInfiniteScroll({ hasNextPage, isFetchingNextPage, fetchNextPage });
  return <div ref={sentinel} data-testid="sentinel" />;
}

describe("useInfiniteScroll", () => {
  it("creates IntersectionObserver when hasNextPage=true", () => {
    const fetchNextPage = vi.fn();
    render(<SentinelHost hasNextPage={true} isFetchingNextPage={false} fetchNextPage={fetchNextPage} />);
    expect(IntersectionObserver).toHaveBeenCalledOnce();
  });

  it("does not create IntersectionObserver when hasNextPage=false", () => {
    const fetchNextPage = vi.fn();
    render(<SentinelHost hasNextPage={false} isFetchingNextPage={false} fetchNextPage={fetchNextPage} />);
    expect(IntersectionObserver).not.toHaveBeenCalled();
  });

  it("calls fetchNextPage when sentinel intersects and not fetching", () => {
    const fetchNextPage = vi.fn();
    render(<SentinelHost hasNextPage={true} isFetchingNextPage={false} fetchNextPage={fetchNextPage} />);
    trigger(true);
    expect(fetchNextPage).toHaveBeenCalledOnce();
  });

  it("does not call fetchNextPage when isFetchingNextPage=true", () => {
    const fetchNextPage = vi.fn();
    render(<SentinelHost hasNextPage={true} isFetchingNextPage={true} fetchNextPage={fetchNextPage} />);
    trigger(true);
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not call fetchNextPage when not intersecting", () => {
    const fetchNextPage = vi.fn();
    render(<SentinelHost hasNextPage={true} isFetchingNextPage={false} fetchNextPage={fetchNextPage} />);
    trigger(false);
    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("disconnects observer on unmount", () => {
    const fetchNextPage = vi.fn();
    const { unmount } = render(
      <SentinelHost hasNextPage={true} isFetchingNextPage={false} fetchNextPage={fetchNextPage} />,
    );
    unmount();
    expect(mockDisconnect).toHaveBeenCalledOnce();
  });

  it("observes the sentinel DOM element", () => {
    const fetchNextPage = vi.fn();
    render(<SentinelHost hasNextPage={true} isFetchingNextPage={false} fetchNextPage={fetchNextPage} />);
    expect(mockObserve).toHaveBeenCalledOnce();
    expect(mockObserve.mock.calls[0][0]).toBeInstanceOf(HTMLDivElement);
  });
});
