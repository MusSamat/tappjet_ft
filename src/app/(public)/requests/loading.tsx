import { CardSkeletonList } from "@/components/ui/card-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pt-4">
      <CardSkeletonList variant="request" count={6} />
    </div>
  );
}
