import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      // dev — backend serves all static files (avatars, car photos, docs)
      { protocol: "http", hostname: "localhost", port: "3000", pathname: "/**" },
      // prod
      { protocol: "https", hostname: "api.popytchik.kg", pathname: "/**" },
      { protocol: "https", hostname: "files.popytchik.kg", pathname: "/**" },
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
    ],
  },
};

export default withNextIntl(nextConfig);
