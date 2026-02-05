import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "SMURD UCP | User Control Panel",
  description: "SMURD User Control Panel for GTA V Roleplay",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
