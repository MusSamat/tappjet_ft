import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/trips", "/trips/*", "/route/*", "/drivers/*", "/requests"],
        disallow: [
          "/my/*",
          "/profile/*",
          "/admin/*",
          "/auth/*",
          "/chat",
          "/notifications",
          "/loyalty",
          "/complaint",
          "/onboarding",
          "/dev/*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
