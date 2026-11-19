import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jukira, Digital Memorial Film & Legacy Preservation",
  description:
    "Bring together photographs and videos from family and friends, and turn them into a professionally produced film celebrating the life of someone you love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F7F3] text-[#202020] antialiased">
        {children}
      </body>
    </html>
  );
}
