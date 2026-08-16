import type { Metadata, Viewport } from "next";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import "./globals.css";

const SITE_DESCRIPTION =
  "Movie Night randomly picks a movie for you and shows you where you can watch it — free options first. Stop scrolling. Start watching.";

export const metadata: Metadata = {
  metadataBase: new URL("https://movie-night.example"),
  title: {
    default: "Movie Night — Stop Scrolling. Start Watching.",
    template: "%s · Movie Night",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Movie Night",
  keywords: [
    "movie picker",
    "what to watch",
    "random movie",
    "free movies",
    "streaming availability",
    "movie night",
  ],
  authors: [{ name: "Movie Night" }],
  openGraph: {
    type: "website",
    siteName: "Movie Night",
    title: "Movie Night — Stop Scrolling. Start Watching.",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Movie Night — Stop Scrolling. Start Watching.",
    description: SITE_DESCRIPTION,
  },
  // Favicon + Apple touch icon come from app/icon.png and app/apple-icon.png;
  // Android home-screen icons come from app/manifest.ts. Next wires all three.
  appleWebApp: {
    capable: true,
    title: "Movie Night",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#080711",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
