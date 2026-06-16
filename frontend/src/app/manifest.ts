import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vertecx Sistemas PC",
    short_name: "Vertecx",
    description:
      "Soporte tecnico empresarial, mantenimiento, redes, servidores y soluciones tecnologicas en Colombia.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#B20000",
    lang: "es-CO",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/assets/imgs/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
