import type { Metadata } from "next";
import { Inter, Poppins, JetBrains_Mono, Roboto, Orbitron } from "next/font/google";
import "./globals.css";
import "@/styles/wazilab.css";
import { PLATFORM } from "@/lib/constants";

const siteUrl =
  process.env.NEXTAUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
import { AppProviders } from "@/components/providers/AppProviders";

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
    default: "ujuziPlus",
    template: "%s | ujuziPlus",
  },
  description:
    "Africa's modern learning and innovation ecosystem. Courses, labs, projects, competitions, and community for STEM innovators.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: PLATFORM.name,
    title: `${PLATFORM.name} — ${PLATFORM.tagline}`,
    description: "Africa's modern learning and innovation ecosystem.",
    images: [{ url: "/final_ujuzi_logo.png", width: 1536, height: 1024, alt: PLATFORM.name }],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${roboto.variable} ${inter.variable} ${poppins.variable} ${jetbrains.variable} ${orbitron.variable}`}>
      <body className="font-sans" style={{ fontFamily: "var(--font-roboto), var(--font-inter), system-ui, sans-serif" }}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
