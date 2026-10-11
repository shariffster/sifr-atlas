import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sifr Atlas — One ingredient. Many expressions.",
  description: "Explore food cultures through places, ingredients and recipe versions. Compare sourced recipes and ingredient-derived sketches.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
