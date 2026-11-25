import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Todas as telas mostram dados da pessoa logada, então são sempre dinâmicas
  // (`export const dynamic = "force-dynamic"` em cada página). Cache Components não se aplica.
  experimental: {
    // Reaproveita no navegador uma aba visitada há menos de 30 s (voltar para ela é instantâneo).
    // As Server Actions chamam revalidatePath, que limpa esse cache depois de qualquer alteração.
    staleTimes: { dynamic: 30 },
  },
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
