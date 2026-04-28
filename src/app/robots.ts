import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tappjet.kg";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/trips", "/trips/*", "/drivers/*"],
        disallow: ["/my/*", "/profile/*", "/auth/*", "/complaint", "/notifications"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
