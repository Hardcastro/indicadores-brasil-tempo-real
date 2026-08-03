import type { MetadataRoute } from "next";
import { site } from "@/site.config";

export default function sitemap(): MetadataRoute.Sitemap {
  return site.nav.map((item) => ({
    url: `${site.url}${item.href}`,
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? "hourly" : "monthly",
    priority: item.href === "/" ? 1 : 0.6,
  }));
}
