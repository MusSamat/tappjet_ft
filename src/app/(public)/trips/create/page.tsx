import { CreateScreen } from "@/components/features/create/create-screen";

interface Props {
  searchParams: { from?: string; to?: string };
}

export default function CreateTripPage({ searchParams }: Props) {
  return <CreateScreen initialFrom={searchParams.from} initialTo={searchParams.to} />;
}
