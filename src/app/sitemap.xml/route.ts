import { NextResponse } from "next/server";

const locales = ["ar", "en"] as const;

const routes = [
  "",
  "strategies",
  "ai-analysis",
  "pricing",
  "about",
  "contact",
  "login",
  "register",
];

function generateSitemapXml(): string {
  const urls: string[] = [];

  for (const locale of locales) {
    for (const route of routes) {
      const path = route ? `/${locale}/${route}` : `/${locale}`;
      urls.push(`
  <url>
    <loc>https://yuanbridge.com${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${route === "" ? "weekly" : "monthly"}</changefreq>
    <priority>${route === "" ? "1.0" : route === "strategies" ? "0.9" : "0.7"}</priority>
  </url>`);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join("\n")}
</urlset>`;
}

export async function GET() {
  const xml = generateSitemapXml();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
