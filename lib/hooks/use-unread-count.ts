import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@/lib/api/notifications";
import { useAuth } from "@/store/auth";

export function useUnreadCount() {
  const isAuthenticated = useAuth((s) => s.status === "authenticated");

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const res = await getNotifications({ unread: true, limit: 50 });
      return res.data.length;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
