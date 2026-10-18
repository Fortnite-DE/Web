import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const DISCORD_URL = "https://discord.gg/fortnitede";

export function Brand() {
  return (
    <Link
      href="/"
      className="brand"
      aria-label="Fortnite Deutschland Discord – Startseite"
    >
      <Image
        src="/images/brand.svg"
        alt="Fortnite Deutschland Discord"
        width={248}
        height={36}
        priority
      />
    </Link>
  );
}

export function Header({ title }: { title?: string }) {
  return (
    <header className="hero">
      <div className="hero-art" aria-hidden="true" />
      <div className={`hero-content container ${title ? "" : "home-header"}`}>
        <Brand />
        {title ? (
          <>
            <span className="hero-divider" aria-hidden="true" />
            <h1>{title}</h1>
          </>
        ) : (
          <Link href="/leaderboard" className="header-link">
            Leaderboard
          </Link>
        )}
      </div>
    </header>
  );
}

export function ActionLink({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`join-button ${secondary ? "secondary-button" : ""}`}
    >
      <span>{children}</span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="site-footer container">
      <Link href="/">FORTNITE DE DISCORD</Link>
      <a href="https://fn-discord.de/privacy">Datenschutz</a>
    </footer>
  );
}
