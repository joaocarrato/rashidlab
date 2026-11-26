import type { MetadataRoute } from "next";
import { APP } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: APP.name,
    short_name: APP.name,
    description: `${APP.tagline}, separado por personagem.`,
    start_url: "/",
    display: "standalone",
    background_color: "#0C0507",
    theme_color: "#0C0507",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
