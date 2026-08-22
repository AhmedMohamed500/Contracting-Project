import type { MetadataRoute } from "next";
import { branding } from "@/config/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: branding.productName,
    short_name: branding.shortName,
    description: `${branding.tagline} — ${branding.taglineArabic}`,
    start_url: "/",
    display: "standalone",
    background_color: "#f7fafb",
    theme_color: "#2878a8",
    icons: [{ src: branding.logo, sizes: "1732x917", type: "image/png" }],
  };
}
