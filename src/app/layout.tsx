import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Creator Tool",
  description: "AI-powered video transcription and content generation tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
