import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SoundDeck } from "@/components/ambient/SoundDeck";
import { AmbientBackground } from "@/components/webgl/AmbientBackground";
import { InkCursor } from "@/components/cursor/InkCursor";
import { AlmanacFrame } from "@/components/AlmanacFrame";
import { themeBootstrapScript } from "@/lib/theme";
import { DBSyncManager } from "@/components/DBSyncManager";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Planner — daily goals & learning",
  description: "A personal goal and learning planner. Discipline, made tactile.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={body.variable}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap"
        />
        {/* Sets the theme class before paint to avoid a flash of the wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className="font-sans antialiased">
        <AmbientBackground />
        {children}
        <DBSyncManager />
        <AlmanacFrame />
        <InkCursor />
        <SoundDeck />
      </body>
    </html>
  );
}
