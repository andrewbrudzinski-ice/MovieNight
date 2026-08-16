import type { MetadataRoute } from "next";

/**
 * PWA manifest — lets Android/Chrome "Add to Home Screen" use the branded
 * icons and open Movie Night as a standalone app. (iOS uses apple-icon.png +
 * the appleWebApp metadata in layout.tsx instead.)
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Movie Night",
    short_name: "Movie Night",
    description:
      "Movie Night picks a movie for you and shows you where to watch it — free options first.",
    start_url: "/",
    display: "standalone",
    background_color: "#080711",
    theme_color: "#080711",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
