const SITE_URL = "https://www.designvidya.com";

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Design Vidya",
  url: SITE_URL,
  logo: `${SITE_URL}/images/Design-Vidya-Logo.png`,
  description:
    "Online learning platform for 3D modeling, animation, rigging, VFX and video editing.",
  email: "privacy@designvidya.com",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "privacy@designvidya.com",
  },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Design Vidya",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/courses?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function StructuredData() {
  return (
    <>
      <JsonLd data={organization} />
      <JsonLd data={website} />
    </>
  );
}

/** Course rich-result markup. Rendered on each public course detail page. */
export function CourseJsonLd({
  id,
  title,
  description,
  thumbnail,
  isFree,
  price,
  rating,
  ratingCount,
}: {
  id: string;
  title: string;
  description: string;
  thumbnail?: string | null;
  isFree: boolean;
  price?: number | null;
  rating?: number;
  ratingCount?: number;
}) {
  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description,
    url: `${SITE_URL}/courses/${id}`,
    ...(thumbnail ? { image: thumbnail } : {}),
    provider: { "@type": "Organization", name: "Design Vidya", url: SITE_URL },
    offers: isFree
      ? { "@type": "Offer", price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock" }
      : {
          "@type": "Offer",
          price: String(price ?? 0),
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
    ...(rating && ratingCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(rating.toFixed(1)),
            reviewCount: ratingCount,
          },
        }
      : {}),
  };

  return <JsonLd data={course} />;
}
