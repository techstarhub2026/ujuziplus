import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono, Roboto, Orbitron } from "next/font/google";
import "./globals.css";
import "@/styles/wazilab.css";
import { PLATFORM } from "@/lib/constants";

/**
 * The address the site is known by, which is not necessarily the one it is
 * being served from. NEXTAUTH_URL is the Railway host, so every canonical and
 * og:image pointed at ujuziplus-production-99b7.up.railway.app — telling
 * search engines the real content lives there, and splitting whatever ranking
 * the site earns across two domains.
 */
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? PLATFORM.url
    : "http://localhost:3000");
import { AppProviders } from "@/components/providers/AppProviders";
import { JsonLd } from "@/components/seo/JsonLd";

const roboto = Roboto({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-roboto" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});
const orbitron = Orbitron({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: {
    // A bare brand name only wins searches by someone who already knows it.
    // The default says what the site is, so it can also answer the searches
    // of people looking for what it offers.
    default: "UjuziPlus — Online STEM, IoT & Robotics Courses in Tanzania",
    template: "%s | UjuziPlus",
  },
  description:
    "Learn STEM, IoT, robotics, Arduino and coding online with UjuziPlus — Tanzania's learning and innovation platform. Courses, hands-on kits, mentors, bootcamps and certificates for students, teachers and professionals across Africa.",
  metadataBase: new URL(siteUrl),
  applicationName: PLATFORM.name,
  keywords: [
    "UjuziPlus", "Ujuzi Plus", "STEM Tanzania", "robotics Tanzania",
    "IoT courses Tanzania", "Arduino Tanzania", "online courses Tanzania",
    "coding bootcamp Tanzania", "STEM education Africa", "learning kits Tanzania",
    "TechStar Innovation Hub", "kozi mtandaoni Tanzania",
  ],
  authors: [{ name: PLATFORM.name, url: PLATFORM.url }],
  creator: PLATFORM.name,
  publisher: PLATFORM.name,
  // Without this every page competes with its own duplicates — the Railway
  // host, the www domain and the apex are three addresses for one page.
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_TZ",
    url: siteUrl,
    siteName: PLATFORM.name,
    title: "UjuziPlus — Online STEM, IoT & Robotics Courses in Tanzania",
    description:
      "Learn STEM, IoT, robotics and coding online. Courses, kits, mentors and bootcamps for learners across Tanzania and Africa.",
    images: [{ url: "/final_ujuzi_logo.png", width: 1536, height: 1024, alt: PLATFORM.name }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable} ${poppins.variable} ${jetbrains.variable} ${orbitron.variable}`}>
      <body className="font-sans" style={{ fontFamily: "var(--font-roboto), var(--font-inter), system-ui, sans-serif" }}>
        <JsonLd />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
