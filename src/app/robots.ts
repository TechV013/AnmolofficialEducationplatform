import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/courses", "/about", "/community", "/faq", "/verify"],
        disallow: [
          "/dashboard",
          "/admin",
          "/instructor",
          "/classroom",
          "/api/",
          "/login",
          "/register",
          "/certificate",
          "/contact",
        ],
      },
    ],
    sitemap: "https://www.anmolofficial.com/sitemap.xml",
  };
}
