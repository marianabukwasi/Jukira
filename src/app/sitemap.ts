import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.jukira.life";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1.0 },
    { url: `${base}/memorial-garden`, lastModified: now, priority: 0.9 },
    { url: `${base}/how-it-works`, lastModified: now, priority: 0.8 },
    { url: `${base}/families`, lastModified: now, priority: 0.8 },
    { url: `${base}/funeral-homes`, lastModified: now, priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, priority: 0.5 },
    { url: `${base}/privacy`, lastModified: now, priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, priority: 0.3 },
  ];
}
