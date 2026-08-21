import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { ConfettiProvider } from "@/components/providers/ConfettiProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // lets iOS/in-app browsers (Telegram) compute safe-area insets instead of
  // shifting the layout viewport, which displaced the fixed/sticky navbar
  viewportFit: "cover",
  // --cream from globals.css; meta tags can't reference CSS vars
  themeColor: "#fcfaf7",
};

const SITE_NAME = "Almrzoq Academy";
const SITE_DESCRIPTION =
  "Structured online courses in drawing, painting and digital art — taught by working professional artists. Learn at your own pace and build a portfolio you are proud of.";

export const metadata: Metadata = {
  title: {
    default: "Almrzoq Academy - Master Art with professionals",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  metadataBase: new URL("https://www.almrzoq.academy"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Almrzoq Academy - Master Art with professionals",
    description: SITE_DESCRIPTION,
    // The page URL, not the image — Next resolves opengraph-image.jpg itself.
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Almrzoq Academy - Master Art with professionals",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Site-wide identity for rich results. Rendered once in the root layout so
// every page inherits it.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE_NAME,
  alternateName: "Almrzoq Academy",
  url: "https://www.almrzoq.academy",
  logo: "https://www.almrzoq.academy/logo-full.png",
  description: SITE_DESCRIPTION,
  sameAs: [
    "https://www.instagram.com/hasanin_art",
    "https://www.facebook.com/share/1BhfVPtcWs/",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: "https://www.almrzoq.academy",
  // Courses are taught in Arabic; the site chrome is English.
  inLanguage: ["ar", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.almrzoq.academy/?title={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${geistMono.variable}  antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        <ConfettiProvider/>
        <ToasterProvider/>
        {children}
      </body>
    </html>
    </SessionProvider>
  );
}
