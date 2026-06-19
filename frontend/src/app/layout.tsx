import type { Metadata } from "next";
import { Playfair_Display, Outfit, Special_Elite } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin", "cyrillic"],
  variable: "--font-outfit",
});

const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin", "cyrillic"],
  variable: "--font-special-elite",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
});

const hsLunaObscura = localFont({
  src: "./fonts/HSLunaObscura.woff2",
  variable: "--font-hs-luna",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://detective-tabletop.ru"),
  title: "Detective Table Top — Вечер настольных игр",
  description: "Нуар-вечер настольных игр в Санкт-Петербурге. Vokzal 1853, начало в 16:00.",
  openGraph: {
    title: "Detective Table Top",
    description: "Нуар-вечер настольных игр в Санкт-Петербурге",
    type: "website",
    locale: "ru_RU",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${outfit.variable} ${specialElite.variable} ${playfairDisplay.variable} ${hsLunaObscura.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#e8dcc8] overflow-hidden">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Event",
              "name": "Detective Table Top — Вечер настольных игр",
              "startDate": "2026-06-11T16:00:00+03:00",
              "endDate": "2026-06-11T22:00:00+03:00",
              "eventStatus": "https://schema.org/EventScheduled",
              "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
              "location": {
                "@type": "Place",
                "name": "Vokzal 1853",
                "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "набережная Обводного канала, 118С",
                  "addressLocality": "Санкт-Петербург",
                  "addressCountry": "RU"
                }
              },
              "image": ["/images/og-image.png"],
              "description": "Нуар-вечер настольных игр в Санкт-Петербурге. Vokzal 1853, начало в 16:00. Интерактивные детективные игры, опытные мастера-инструкторы.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "RUB",
                "availability": "https://schema.org/InStock"
              }
            })
          }}
        />
        {children}
      </body>
    </html>
  );
}
