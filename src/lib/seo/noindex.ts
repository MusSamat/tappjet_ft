import type { Metadata } from "next";

/** Belt-and-suspenders with robots.txt: keep private/utility segments out of
 *  the index even if a crawler ignores robots.txt or hits a deep link. */
export const noindexMetadata: Metadata = {
  robots: { index: false, follow: false },
};
