import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import 'material-symbols';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "MyPlace - Personality quizzes you can play",
  description: "Play games, learn about yourself and show them off in your own digital space. Interactive personality quizzes and games to discover yourself.",
  viewport: {
    width: "device-width",
    initialScale: 1,
    interactiveWidget: "resizes-content",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
