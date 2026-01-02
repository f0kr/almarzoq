import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { ConfettiProvider } from "@/components/providers/ConfettiProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(){
  return{
    title: {
      default: 'Almrzoq Academy - Master Art from professionals',
      template: '%s | Almrzoq Academy'
    },
    description: 'A platform to master drawing with various courses and tutorials from experts.',
    keywords: '',
    metadataBase: new URL('https://www.almrzoq.academy'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'Almrzoq Academy - Master Art from professionals',
      description: 'A platform to master drawing with various courses and tutorials from experts.',
      url: 'https://www.almrzoq.academy/og-image.jpg',
      siteName: 'Almrzoq Academy',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

/* export const metadata: Metadata = {
  title: "Almrzoq Academy",
  description: "A platform to master drawing with various courses and tutorials from experts.",
    openGraph: {
    title: "Almrzoq Academy",
    description: "A platform to master drawing with various courses and tutorials from experts.",
    url: "https://almrzoq.academy",
    siteName: "Almrzoq Academy",
    images: [
      {
        url: "https://almrzoq.academy/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
}; */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    afterSignOutUrl="/"
    >
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConfettiProvider/>
        <ToasterProvider/>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
