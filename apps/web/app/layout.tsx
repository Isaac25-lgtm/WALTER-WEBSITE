import "@fontsource/open-sans/latin-400.css";
import "@fontsource/open-sans/latin-500.css";
import "@fontsource/open-sans/latin-700.css";
import "@fontsource/open-sans/latin-800.css";
import "@fontsource/inter/latin-700.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { publicContent } from "../src/generated/public-content";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: publicContent.identity.publicName,
    template: `%s | ${publicContent.identity.publicName}`,
  },
  description: publicContent.identity.shortDescription,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
