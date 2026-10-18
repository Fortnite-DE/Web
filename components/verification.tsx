import Link from "next/link";
import { ActionLink, DISCORD_URL, Footer } from "@/components/site";
import { VerificationFrame } from "@/components/verification-frame";

export function Verification({ success }: { success: boolean }) {
  return (
    <>
      <main id="main">
        <VerificationFrame success={success}>
          <div className="verification-content">
            <p className="eyebrow">FORTNITE DE DISCORD</p>
            <h1 id="verification-heading">
              {success ? (
                <>
                  ERFOLGREICH
                  <br />
                  VERIFIZIERT.
                </>
              ) : (
                <>
                  VERIFIZIERUNG
                  <br />
                  FEHLGESCHLAGEN.
                </>
              )}
            </h1>
            {!success && (
              <p className="verification-description">
                Das hat leider nicht geklappt. Wir helfen dir weiter.
              </p>
            )}
            <ActionLink href={success ? DISCORD_URL : "#hilfe"}>
              {success ? "ZURÜCK ZU DISCORD" : "HILFE ERHALTEN"}
              {!success && (
                <span className="verification-arrow" aria-hidden="true">
                  <svg
                    viewBox="0 0 66 43"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                  >
                    <path d="m3 3 19 18.5L3 40m20-37 19 18.5L23 40m20-37 19 18.5L43 40" />
                  </svg>
                </span>
              )}
            </ActionLink>
            <Link className="quiet-link" href="/">
              Zur Startseite
            </Link>
          </div>
        </VerificationFrame>
        {!success && (
          <section id="hilfe" className="help-section container">
            <p className="eyebrow">WIR HELFEN DIR WEITER</p>
            <h2>VERIFIZIERUNGSPROBLEME LÖSEN.</h2>
            <p>
              Der Verifizierungsprozess ist fehlgeschlagen. Prüfe diese Punkte
              und starte die Verifizierung anschließend erneut über Discord.
            </p>
            <div className="help-grid">
              <article>
                <span className="help-number">01</span>
                <h3>Das richtige Konto?</h3>
                <p>
                  Stelle sicher, dass du ein Epic Games Konto verknüpfst, das
                  dir gehört.
                </p>
              </article>
              <article>
                <span className="help-number">02</span>
                <h3>Falsch eingeloggt?</h3>
                <p>
                  Prüfe auf der{" "}
                  <a href="https://www.epicgames.com/account/personal">
                    Epic Games Kontoseite
                  </a>
                  , mit welchem Konto du angemeldet bist.
                </p>
              </article>
              <article>
                <span className="help-number">03</span>
                <h3>Eine Störung bei Epic?</h3>
                <p>
                  Auf der{" "}
                  <a href="https://status.epicgames.com/">
                    Epic Games Statusseite
                  </a>{" "}
                  siehst du, ob es aktuell Probleme gibt.
                </p>
              </article>
            </div>
            <div className="community-cta">
              <div>
                <h2>NOCH FRAGEN?</h2>
                <p>Unser Moderatorenteam hilft dir auf Discord weiter.</p>
              </div>
              <ActionLink href={DISCORD_URL}>ZU DISCORD</ActionLink>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
