import Image from "next/image";
import { ActionLink, DISCORD_URL, Footer, Header } from "@/components/site";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main" className="home-main">
        <div className="home-art" aria-hidden="true">
          <Image
            src="/images/fortnite.webp"
            alt=""
            fill
            priority
            sizes="(max-width: 800px) 100vw, 60vw"
          />
        </div>
        <section className="home-content container">
          <div className="home-copy">
            <p className="eyebrow">DEINE COMMUNITY. DEIN SQUAD.</p>
            <h1>
              FORTNITE
              <br />
              <span>DEUTSCHLAND</span>
              <br />
              DISCORD.
            </h1>
            <p className="home-description">
              Die nächste Runde beginnt hier. Finde Mitspieler, teile deine
              besten Momente und werde Teil unserer Community.
            </p>
            <div className="home-actions">
              <ActionLink href={DISCORD_URL}>DISCORD BEITRETEN</ActionLink>
              <ActionLink href="/leaderboard" secondary>
                LEADERBOARD
              </ActionLink>
            </div>
            <div className="community-note">
              <span className="live-dot" /> Zusammen ins nächste Match.
            </div>
          </div>
        </section>
        <LinkStrip />
      </main>
      <Footer />
    </>
  );
}

function LinkStrip() {
  return (
    <div className="home-strip container">
      <span>FINDE DEIN SQUAD.</span>
      <span>STEIG IM LEVEL AUF.</span>
      <span>WERDE TEIL DAVON.</span>
    </div>
  );
}
