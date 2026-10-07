import type { Metadata } from "next";

// The page itself is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "About Us",
  description:
    "Almrzoq Academy teaches the foundations of fine art. Meet the team behind the academy and learn how we help students build real drawing and painting skills.",
  alternates: { canonical: "/about-us" },
  openGraph: {
    title: "About Us | Almrzoq Academy",
    description:
      "Almrzoq Academy teaches the foundations of fine art. Meet the team behind the academy.",
    url: "/about-us",
    type: "website",
  },
};

export default function AboutUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
