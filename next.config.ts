import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Todas as telas mostram dados da pessoa logada, então são sempre dinâmicas
  // (`export const dynamic = "force-dynamic"` em cada página). Cache Components não se aplica.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
