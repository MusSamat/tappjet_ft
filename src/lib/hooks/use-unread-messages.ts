import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { getChatSummaries } from "@/lib/api/chat";
import { useAuth } from "@/store/auth";

/**
 * Total unread chat messages across accepted-booking chats.
 * Shares the ["chat","summaries"] cache with QuickActions (same source,
 * socket invalidation there keeps this badge live too).
 */
export function useUnreadMessages() {
  const isAuthenticated = useAuth((s) => s.status === "authenticated");

  return useQuery({
    queryKey: ["chat", "summaries"],
    queryFn: getChatSummaries,
    enabled: isAuthenticated,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    refetchInterval: 60_000,
    select: (chats) =>
      chats
        .filter((c) => c.bookingStatus === "accepted")
        .reduce((sum, c) => sum + c.unreadCount, 0),
  });
}
