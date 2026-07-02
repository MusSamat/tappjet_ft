import type { ReactNode } from "react";
export { noindexMetadata as metadata } from "@/lib/seo/noindex";

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
