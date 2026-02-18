import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Praxis OS",
  description: "Praxismanagementsystem für Physiotherapie-Praxen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
