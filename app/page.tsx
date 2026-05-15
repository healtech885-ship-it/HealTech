import type { Metadata } from "next";
import { HomepageClient } from "@/components/public/homepage-client";

export const metadata: Metadata = {
  title: "HealTech | Clinic workflow management for healthcare teams",
  description:
    "Find, compare, and activate clinic workflows faster. Explore reception, doctor, lab, pharmacy, patient portal, and admin operations with HealTech.",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HealTech",
    url: "https://healtech.example",
    description: "Clinic workflow management software for healthcare teams.",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "HealTech",
    url: "https://healtech.example",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://healtech.example/?workflow={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  },
];

export default function LandingPage() {
  return (
    <>
      <HomepageClient />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
