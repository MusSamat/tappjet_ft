import { api } from "./client";
import type { Paginated } from "./types";

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  channel: "telegram" | "push" | "both";
  payload: Record<string, unknown>;
  delivered: boolean;
  readAt: string | null;
  createdAt: string;
}

export function getNotifications(params?: {
  cursor?: string;
  limit?: number;
  unread?: boolean;
}): Promise<Paginated<AppNotification>> {
  return api.get<Paginated<AppNotification>>("/notifications", { params }).then((r) => r.data);
}

export function markNotificationRead(id: string): Promise<void> {
  return api.patch(`/notifications/${id}/read`).then(() => undefined);
}
