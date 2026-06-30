import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lightning Tips — Instant Bitcoin tipping widget",
  description:
    "An embeddable Lightning tip jar with sub-second confirmations and a live tip feed. Real sats, verifiable on-chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
