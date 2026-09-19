import { PLATFORM } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? PLATFORM.url;

/**
 * Structured data — the description of the site that search engines read
 * rather than infer.
 *
 * Without it Google has only the page's words to go on, and renders a plain
 * link. With it the site can appear as an organisation with a logo and
 * contact details, and its search box can be offered directly in the result.
 *
 * Rendered server-side in the root layout, so it is in the HTML a crawler
 * receives rather than something JavaScript adds afterwards.
 */
export function JsonLd() {
  const graph = [
    {
      "@type": "EducationalOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "UjuziPlus",
      alternateName: ["Ujuzi Plus", "UjuziLab"],
      url: siteUrl,
      logo: `${siteUrl}/final_ujuzi_logo.png`,
      description:
        "Tanzania's learning and innovation platform for STEM, IoT, robotics and coding — courses, hands-on kits, mentorship and bootcamps.",
      address: {
        "@type": "PostalAddress",
        addressCountry: "TZ",
        addressLocality: "Dar es Salaam",
      },
      areaServed: [
        { "@type": "Country", name: "Tanzania" },
        { "@type": "Place", name: "Africa" },
      ],
      knowsAbout: [
        "STEM education", "Internet of Things", "Robotics", "Arduino",
        "ESP32", "Embedded systems", "Coding", "Solar energy",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "UjuziPlus",
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en-TZ",
      // Lets Google show a search box for the site directly in the result.
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <script
      type="application/ld+json"
      // The content is built here from constants, not from user input.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }),
      }}
    />
  );
}
