import { api } from "./client";

export interface LoyaltyStatus {
  tier: string;
  points: number;
  nextTier: string | null;
  pointsToNextTier: number | null;
}

export interface LoyaltyTransaction {
  id: string;
  points: number;
  source: string;
  tripId: string | null;
  note: string | null;
  createdAt: string;
}

export async function getLoyaltyStatus(): Promise<LoyaltyStatus> {
  const { data } = await api.get<LoyaltyStatus>("/loyalty/status");
  return data;
}

export async function getLoyaltyTransactions(
  cursor?: string,
  limit = 20,
): Promise<{ data: LoyaltyTransaction[]; nextCursor: string | null }> {
  const { data } = await api.get<{ data: LoyaltyTransaction[]; nextCursor: string | null }>(
    "/loyalty/transactions",
    { params: { cursor, limit } },
  );
  return data;
}
