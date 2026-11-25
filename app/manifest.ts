import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rashid Lab",
    short_name: "Rashid Lab",
    description: "Caderno de treino de Rashid no Street Fighter 6.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1514",
    theme_color: "#0e1514",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
