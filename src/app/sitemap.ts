import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: "", priority: 1 },
    { path: "/we-buy", priority: 0.9 },
    { path: "/shows", priority: 0.8 },
    { path: "/contact", priority: 0.8 },
    { path: "/about", priority: 0.5 },
  ].map(({ path, priority }) => ({ url: `${site.url}${path}`, changeFrequency: "weekly", priority }));
}
