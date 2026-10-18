import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "./globals.css";

const display = localFont({
  src: "../public/fonts/poppins-900-italic.woff2",
  weight: "900",
  style: "italic",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fn-discord.de"),
  icons: { icon: "/favicon.png" },
  title: {
    default: "Fortnite Deutschland Discord",
    template: "%s – Fortnite DE Discord",
  },
  description:
    "Deine deutschsprachige Fortnite Community. Finde dein Squad und werde Teil von Fortnite Deutschland Discord.",
};
export const viewport: Viewport = {
  themeColor: "#1a1d2b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={display.variable}>
      <body>
        <a className="skip-link" href="#main">
          Zum Inhalt
        </a>
        {children}
      </body>
    </html>
  );
}
