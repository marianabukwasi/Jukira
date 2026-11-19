import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/how-it-works", "/families", "/funeral-homes", "/memorial-garden", "/contact", "/privacy", "/terms"],
        disallow: ["/admin/", "/family/", "/partners/", "/contribute/", "/memorial/", "/api/"],
      },
    ],
    sitemap: "https://www.jukira.life/sitemap.xml",
  };
}
