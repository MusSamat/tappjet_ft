import { CardSkeletonList } from "@/components/ui/card-skeleton";

// Shown instantly on navigation while the dynamic feed renders on the server —
// the body swaps to a skeleton immediately instead of freezing on the old page.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pt-4">
      <CardSkeletonList variant="trip" count={6} />
    </div>
  );
}
