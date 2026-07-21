
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Almrzoq Academy - Master Art with professionals",
    short_name: "Almrzoq Academy",
    description:
      "Structured online courses in drawing, painting and digital art, taught by working professional artists.",
    start_url: "/",
    display: "standalone",
    lang: "en",
    categories: ["education", "art", "lifestyle"],
    // --cream / --clay from globals.css; manifests can't reference CSS vars.
    background_color: "#fcfaf7",
    theme_color: "#9c6349",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

