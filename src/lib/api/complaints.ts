import { api } from "./client";

export type ComplaintCategory = "safety" | "fraud" | "behavior" | "payment" | "other";

export interface SubmitComplaintInput {
  category: ComplaintCategory;
  description: string;
  targetUserId?: string;
  targetTripId?: string;
}

export async function submitComplaint(input: SubmitComplaintInput, images?: File[]): Promise<void> {
  const form = new FormData();
  form.append("category", input.category);
  form.append("description", input.description);
  if (input.targetUserId) form.append("targetUserId", input.targetUserId);
  if (input.targetTripId) form.append("targetTripId", input.targetTripId);
  images?.forEach((f) => form.append("attachments", f));
  await api.post("/complaints", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
