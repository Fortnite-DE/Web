"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/unban";

type Status = "checking" | "waiting" | "redirecting" | "invalid" | "error";

export function UnbanStatus({
  link,
}: {
  link: { query: string; availableAt: number } | null;
}) {
  const [status, setStatus] = useState<Status>(link ? "checking" : "invalid");
  const [remaining, setRemaining] = useState(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!link) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setInterval> | undefined;
    const check = async () => {
      try {
        const response = await fetch(`/api/unban?${link.query}`, {
          cache: "no-store",
          signal: AbortSignal.any([
            controller.signal,
            AbortSignal.timeout(15000),
          ]),
        });
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (response.ok && data.status === 200) {
          setStatus("redirecting");
          window.location.replace(data.redirect);
        } else if (response.status === 403 && link.availableAt > Date.now()) {
          setRemaining(Math.ceil((link.availableAt - Date.now()) / 1000));
          setStatus("waiting");
          timer = setInterval(() => {
            const seconds = Math.ceil((link.availableAt - Date.now()) / 1000);
            setRemaining(Math.max(0, seconds));
            if (seconds <= 0) {
              clearInterval(timer);
              setStatus("checking");
              void check();
            }
          }, 1000);
        } else {
          setStatus(response.status === 400 ? "invalid" : "error");
        }
      } catch {
        if (!controller.signal.aborted) setStatus("error");
      }
    };
    void check();
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [link, attempt]);

  return (
    <div className="verification-content unban-content">
      <h1
        id="verification-heading"
        className={status === "checking" ? "sr-only" : undefined}
      >
        {status === "waiting" ? (
          <>
            Antrag möglich in
            <br />
            <span className="unban-countdown" role="timer" aria-live="off">
              {formatCountdown(remaining)}
            </span>
          </>
        ) : status === "invalid" ? (
          <>
            Entbannungslink
            <br />
            ungültig.
          </>
        ) : status === "error" ? (
          <>
            Prüfung derzeit
            <br />
            nicht möglich.
          </>
        ) : status === "redirecting" ? (
          <>
            Weiter zum
            <br />
            Antrag …
          </>
        ) : (
          "Entbannungsantrag"
        )}
      </h1>
      {(status === "checking" || status === "redirecting") && (
        <span
          className="spinner unban-spinner"
          role="status"
          aria-label="Wird geladen"
        />
      )}
      {status === "error" && (
        <button
          className="join-button"
          onClick={() => {
            setStatus("checking");
            setAttempt((value) => value + 1);
          }}
        >
          <span>Erneut versuchen</span>
        </button>
      )}
    </div>
  );
}
