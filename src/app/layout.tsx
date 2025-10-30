import type { Metadata } from "next";
import { Inter, Instrument_Serif, Lora, Newsreader, DM_Sans, Radio_Canada_Big } from "next/font/google";
import "./globals.css";
import 'material-symbols/outlined.css';
import 'material-symbols/rounded.css';
import { AmplitudeProvider } from "@/components/analytics/AmplitudeProvider";
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
});

const dmSans = DM_Sans({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ["latin"],
  variable: '--font-dm-sans',
});

const radioCanadaBig = Radio_Canada_Big({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ["latin"],
  variable: '--font-radio-canada-big',
});

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ["latin"],
  variable: '--font-instrument-serif',
});

const lora = Lora({
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  subsets: ["latin"],
  variable: '--font-lora',
});

const newsreader = Newsreader({
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  subsets: ["latin"],
  variable: '--font-newsreader',
});

export const metadata: Metadata = {
  title: "MyPlace - Personality quizzes you can play",
  description: "Play games, learn about yourself and show them off in your own digital space. Interactive personality quizzes and games to discover yourself.",
  icons: {
    icon: "/elevate/blobbert.png",
    shortcut: "/elevate/blobbert.png",
    apple: "/elevate/blobbert.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" 
        />
      </head>
      <body
        className={`${inter.variable} ${instrumentSerif.variable} ${lora.variable} ${newsreader.variable} ${dmSans.variable} ${radioCanadaBig.variable} antialiased`}
        suppressHydrationWarning
      >
        <GoogleAnalytics gaId="G-HHMB010S76" />
        <AmplitudeProvider>
          {children}
        </AmplitudeProvider>
      </body>
    </html>
  );
}
