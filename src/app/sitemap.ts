import type { MetadataRoute } from "next";
import { KG_CITIES } from "@/lib/kg-cities";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappjet.kg";

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/trips`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${siteUrl}/auth/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/auth/register`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const cityPairs: MetadataRoute.Sitemap = [];
  for (const from of KG_CITIES) {
    for (const to of KG_CITIES) {
      if (from.nameRu === to.nameRu) continue;
      cityPairs.push({
        url: `${siteUrl}/trips?from=${encodeURIComponent(from.nameRu)}&to=${encodeURIComponent(to.nameRu)}`,
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }
  }

  return [...staticPages, ...cityPairs];
}
