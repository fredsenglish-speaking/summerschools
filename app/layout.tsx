import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { DICTIONARIES } from "@/lib/i18n";
import { I18nProvider } from "@/lib/i18n/client";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const NAME = "International Summer Schools in Baku";

export async function generateMetadata(): Promise<Metadata> {
  const t = DICTIONARIES[await getLocale()];
  return {
    title: { default: NAME, template: `%s · ${NAME}` },
    description: t.meta.description,
    applicationName: NAME,
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#13213a" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Jost:wght@400;500;600&display=swap&subset=cyrillic,latin-ext"
        />
      </head>
      <body>
        <I18nProvider locale={locale}>
          <Header />
          <main>{children}</main>
          <Footer />
          <WhatsAppButton />
        </I18nProvider>
      </body>
    </html>
  );
}
