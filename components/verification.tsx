import Link from "next/link";
import { ActionLink, Brand, DISCORD_URL, Footer } from "@/components/site";

export function Verification({ success }: { success: boolean }) {
  return (
    <>
      <main id="main">
        <section
          className={`verification ${success ? "verification-success" : "verification-error"}`}
          aria-labelledby="verification-heading"
        >
          <div className="verification-symbol" aria-hidden="true">
            <svg viewBox="0 0 100 100" fill="none">
              <circle
                cx="50"
                cy="50"
                r="43"
                stroke="currentColor"
                strokeWidth="8"
              />
              {success ? (
                <path
                  d="m28 50 15 15 29-30"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinejoin="round"
                />
              ) : (
                <path
                  d="m35 35 30 30m0-30L35 65"
                  stroke="currentColor"
                  strokeWidth="8"
                />
              )}
            </svg>
          </div>
          <div className="verification-elements" aria-hidden="true" />
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
            <p className="verification-description">
              {success
                ? "Alles bereit. Zurück zu deiner Community."
                : "Das hat leider nicht geklappt. Wir helfen dir weiter."}
            </p>
            <ActionLink href={success ? DISCORD_URL : "#hilfe"}>
              {success ? "ZURÜCK ZU DISCORD" : "HILFE ERHALTEN"}
            </ActionLink>
            <Link className="quiet-link" href="/">
              Zur Startseite
            </Link>
          </div>
          <div className="verification-brand">
            <Brand />
          </div>
        </section>
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
