"use client";

import Image from "next/image";
import { LeaderboardBackground } from "@/components/leaderboard-background";
import { LevelProgress } from "@/components/level-progress";
import {
  startTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  mergePages,
  type CurrentPlayer,
  type LeaderboardPage,
  type Player,
} from "@/lib/leaderboard";

type Mode = "replace" | "append" | "prepend";
type Focus = "initial" | "own" | "top";
interface RequestState {
  page: number;
  mode: Mode;
  focus?: Focus;
}
interface BoardState {
  pages: LeaderboardPage[];
  currentUser: CurrentPlayer | null;
  loading: boolean;
  error: RequestState | null;
  userMissing: boolean;
}
const numbers = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

function Avatar({ player }: { player: Player }) {
  return (
    <span className="avatar" aria-hidden="true">
      {Array.from(player.username)[0] ?? "?"}
      {player.avatarUrl && (
        <Image
          className="avatar-image"
          src={player.avatarUrl}
          alt=""
          fill
          sizes="40px"
          unoptimized
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      )}
      {player.avatarDecorationUrl && (
        <Image
          className="avatar-decoration"
          src={player.avatarDecorationUrl}
          alt=""
          fill
          sizes="48px"
          unoptimized
          onError={(event) => {
            event.currentTarget.style.visibility = "hidden";
          }}
        />
      )}
    </span>
  );
}
function Username({ player }: { player: Player }) {
  const gradient = player.roleColors.length > 1;
  return (
    <span
      title={player.username}
      className={`username ${gradient ? "username-gradient" : ""}`}
      style={
        gradient
          ? {
              backgroundImage: `linear-gradient(90deg, ${player.roleColors.join(", ")})`,
            }
          : { color: player.roleColors[0] }
      }
    >
      {player.username}
    </span>
  );
}

export function Leaderboard({ userId }: { userId: string | null }) {
  const [days, setDays] = useState<7 | null>(null);
  const [state, setState] = useState<BoardState>({
    pages: [],
    currentUser: null,
    loading: true,
    error: null,
    userMissing: false,
  });
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [autoLoadPaused, setAutoLoadPaused] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollPaused = useRef(false);
  const busy = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const table = useRef<HTMLTableElement>(null);
  const more = useRef<HTMLButtonElement>(null);
  const earlier = useRef<HTMLDivElement>(null);
  const ranking = useRef<HTMLElement>(null);
  const pending = useRef<{
    focus?: Focus;
    anchor?: { id: string; top: number };
  } | null>(null);
  const resumeAfterScroll = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      scrollPaused.current = false;
      setAutoLoadPaused(false);
    }, 200);
  }, []);
  const pauseAutoLoad = useCallback(() => {
    scrollPaused.current = true;
    setAutoLoadPaused(true);
  }, []);

  const load = useCallback(
    async (request: RequestState) => {
      if (busy.current) return;
      busy.current = true;
      if (request.focus === "own" || request.focus === "top") pauseAutoLoad();
      const abort = new AbortController();
      controller.current = abort;
      setState((previous) => ({ ...previous, loading: true, error: null }));
      async function fetchPage(page: number): Promise<LeaderboardPage> {
        const query = new URLSearchParams({
          page: String(page),
          ...(userId ? { userId } : {}),
          ...(days ? { days: String(days) } : {}),
        });
        const response = await fetch(`/api/leaderboard?${query}`, {
          signal: AbortSignal.any([abort.signal, AbortSignal.timeout(15000)]),
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Rangliste nicht erreichbar.");
        return response.json() as Promise<LeaderboardPage>;
      }
      try {
        const data = await fetchPage(request.page);
        if (request.focus) await document.fonts.ready;
        if (abort.signal.aborted) return;
        const anchor =
          request.mode === "replace"
            ? undefined
            : Array.from(
                table.current?.querySelectorAll<HTMLTableRowElement>(
                  "[data-player]",
                ) ?? [],
              ).find((row) => row.getBoundingClientRect().bottom > 0);
        pending.current = {
          focus: request.focus,
          ...(anchor
            ? {
                anchor: {
                  id: anchor.id,
                  top: anchor.getBoundingClientRect().top,
                },
              }
            : {}),
        };
        setState((previous) => ({
          pages: mergePages(previous.pages, data, request.mode),
          currentUser:
            data.currentUser?.userId === userId ? data.currentUser : null,
          loading: false,
          error: null,
          userMissing: Boolean(userId && !data.currentUser),
        }));
      } catch {
        if (!abort.signal.aborted)
          setState((previous) => ({
            ...previous,
            loading: false,
            error: request,
          }));
      } finally {
        if (controller.current === abort) busy.current = false;
      }
    },
    [userId, days, pauseAutoLoad],
  );

  useEffect(() => {
    startTransition(() => {
      void load({ page: 1, mode: "replace", focus: "initial" });
    });
    return () => {
      controller.current?.abort();
      busy.current = false;
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [load]);

  useLayoutEffect(() => {
    const rows =
      table.current?.querySelectorAll<HTMLTableRowElement>("[data-player]");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!rows) return;
    const observer = new IntersectionObserver(
      (entries) => {
        let index = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const row = entry.target as HTMLTableRowElement;
          row.style.setProperty("--delay", `${Math.min(index++, 7) * 35}ms`);
          row.classList.remove("reveal-pending");
          row.classList.add("reveal");
          row.dataset.revealed = "true";
          observer.unobserve(row);
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px 100px 0px" },
    );
    for (const row of rows) {
      if (row.dataset.revealed) continue;
      if (motion.matches || row.id === `player-${userId}`) {
        row.dataset.revealed = "true";
      } else {
        row.classList.add("reveal-pending");
        observer.observe(row);
      }
    }
    const revealAll = () => {
      if (!motion.matches) return;
      rows.forEach((row) => {
        row.classList.remove("reveal-pending", "reveal");
        row.dataset.revealed = "true";
      });
      observer.disconnect();
    };
    motion.addEventListener("change", revealAll);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", revealAll);
    };
  }, [state.pages, userId]);

  useLayoutEffect(() => {
    const target = pending.current;
    if (!target) return;
    pending.current = null;
    if (target.anchor) {
      const row = document.getElementById(target.anchor.id);
      if (row)
        window.scrollBy({
          top: row.getBoundingClientRect().top - target.anchor.top,
          behavior: "instant",
        });
    }
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "instant"
      : "smooth";
    if (target.focus === "own" && userId) {
      const row = document.getElementById(`player-${userId}`);
      row?.focus({ preventScroll: true });
      row?.scrollIntoView({ block: "center", behavior });
    } else if (target.focus === "top") {
      window.scrollTo({ top: 0, behavior });
    }
    if (target.focus === "own" || target.focus === "top") resumeAfterScroll();
  }, [state.pages, userId, resumeAfterScroll]);

  const last = state.pages.at(-1);
  const first = state.pages[0];
  useEffect(() => {
    if (state.loading || state.error || autoLoadPaused) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollPaused.current) return;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (entry.target === earlier.current && first && first.page > 1) {
            void load({ page: first.page - 1, mode: "prepend" });
            break;
          }
          if (entry.target === more.current && last?.hasNext) {
            void load({ page: last.page + 1, mode: "append" });
            break;
          }
        }
      },
      { rootMargin: "300px 0px 350px 0px" },
    );
    if (first && first.page > 1 && earlier.current)
      observer.observe(earlier.current);
    if (last?.hasNext && more.current) observer.observe(more.current);
    return () => observer.disconnect();
  }, [first, last, state.loading, state.error, autoLoadPaused, load]);

  useEffect(() => {
    let frame = 0;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const art = document.querySelector<HTMLElement>(".hero-art");
    const update = () => {
      frame = 0;
      setShowBackToTop(
        window.scrollY > (ranking.current?.offsetTop ?? 0) + 300,
      );
      const progress = motion.matches ? 0 : Math.min(window.scrollY / 148, 1);
      art?.style.setProperty("--glow-x", `${progress * 18}px`);
      art?.style.setProperty("--glow-y", `${progress * 28}px`);
      art?.style.setProperty("--glow-opacity", String(1 - progress * 0.2));
      document.body.style.setProperty(
        "--background-y",
        `${motion.matches ? 0 : Math.min(window.scrollY * 0.025, 28)}px`,
      );
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      if (scrollPaused.current) resumeAfterScroll();
    };
    frame = requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    motion.addEventListener("change", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      motion.removeEventListener("change", onScroll);
      document.body.style.removeProperty("--background-y");
    };
  }, [resumeAfterScroll, first?.page]);

  const jumpToUser = () => {
    if (!state.currentUser || busy.current) return;
    const row = document.getElementById(`player-${state.currentUser.userId}`);
    if (row) {
      pauseAutoLoad();
      row.focus({ preventScroll: true });
      row.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      resumeAfterScroll();
    } else
      void load({
        page: state.currentUser.page,
        mode: "replace",
        focus: "own",
      });
  };
  const backToTop = () => {
    if (first?.page !== 1) {
      void load({ page: 1, mode: "replace", focus: "top" });
      return;
    }
    pauseAutoLoad();
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    resumeAfterScroll();
  };
  const players = state.pages.flatMap((page) => page.items);
  const switchDays = (nextDays: 7 | null) => {
    if (nextDays === days) return;
    controller.current?.abort();
    busy.current = false;
    pending.current = null;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    scrollPaused.current = false;
    setAutoLoadPaused(false);
    setState({
      pages: [],
      currentUser: null,
      loading: true,
      error: null,
      userMissing: false,
    });
    setDays(nextDays);
  };
  const background =
    state.currentUser?.bannerUrl ?? state.currentUser?.avatarUrl;
  return (
    <>
      <LeaderboardBackground src={background} loading={state.loading} />
      <div className="mode-bar">
        <div
          className={`tabs ${days ? "weekly" : ""}`}
          role="tablist"
          aria-label="Leaderboard auswählen"
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            event.preventDefault();
            const nextDays =
              event.key === "Home"
                ? null
                : event.key === "End"
                  ? 7
                  : days
                    ? null
                    : 7;
            switchDays(nextDays);
            document
              .getElementById(nextDays ? "weekly-tab" : "level-tab")
              ?.focus();
          }}
        >
          <button
            className={`tab ${days === null ? "active" : ""}`}
            id="level-tab"
            role="tab"
            aria-selected={days === null}
            aria-controls="level-panel"
            tabIndex={days === null ? 0 : -1}
            onClick={() => switchDays(null)}
          >
            <span className="tab-label">GESAMT</span>
          </button>
          <button
            className={`tab ${days === 7 ? "active" : ""}`}
            id="weekly-tab"
            role="tab"
            aria-selected={days === 7}
            aria-controls="level-panel"
            tabIndex={days === 7 ? 0 : -1}
            onClick={() => switchDays(7)}
          >
            <span className="tab-label">LETZTE 7 TAGE</span>
          </button>
        </div>
      </div>
      <section
        id="level-panel"
        role="tabpanel"
        aria-labelledby={days ? "weekly-tab" : "level-tab"}
      >
        {state.currentUser && (
          <section className="personal-ranking" aria-label="Deine Platzierung">
            <span className="section-kicker">
              DEINE PLATZIERUNG · ZUM PLATZ SPRINGEN
            </span>
            <button
              className="personal-card"
              onClick={jumpToUser}
              disabled={state.loading}
            >
              <span className="personal-identity">
                <span className="rank-number">
                  #{numbers.format(state.currentUser.position)}
                </span>
                <span className="member">
                  <Avatar player={state.currentUser} />
                  <Username player={state.currentUser} />
                  <span className="you-badge">DU</span>
                </span>
              </span>
              <span className="personal-stat personal-level">
                <span className="personal-label">LEVEL</span>
                <LevelProgress
                  level={state.currentUser.level}
                  focusable={false}
                />
              </span>
              <span className="personal-stat personal-xp">
                <span className="personal-label">XP</span>
                <span>{numbers.format(state.currentUser.xp)}</span>
              </span>
              <span className="personal-stat personal-messages">
                <span className="personal-label">NACHRICHTEN</span>
                <span>{numbers.format(state.currentUser.messageCount)}</span>
              </span>
            </button>
          </section>
        )}
        {state.userMissing && (
          <p className="notice" role="status">
            {days
              ? "Für diese Nutzer-ID gibt es in den letzten 7 Tagen keine Platzierung."
              : "Für diese Nutzer-ID gibt es noch keine Platzierung."}{" "}
            Hier siehst du die aktuelle Rangliste.
          </p>
        )}
        <section
          className="ranking"
          ref={ranking}
          aria-label={days ? "Rangliste der letzten 7 Tage" : "Level-Rangliste"}
          aria-busy={state.loading}
        >
          {first && first.page > 1 && (
            <div ref={earlier} className="load-sentinel" aria-hidden="true" />
          )}
          {(!state.error || players.length > 0) && (
            <div className="table-wrap">
              <table ref={table}>
                <caption className="sr-only">
                  Level-Rangliste der Fortnite Deutschland Discord Community
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="rank-cell">
                      RANG
                    </th>
                    <th scope="col">MITGLIED</th>
                    <th scope="col" className="number-cell">
                      LEVEL
                    </th>
                    <th scope="col" className="number-cell">
                      XP
                    </th>
                    <th scope="col" className="number-cell messages-cell">
                      NACHRICHTEN
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr
                      key={player.userId}
                      id={`player-${player.userId}`}
                      data-player
                      data-rank={
                        player.position <= 3 ? player.position : undefined
                      }
                      className={`player-row ${player.position <= 3 ? "top-rank" : ""} ${player.userId === userId ? "own-row" : ""}`}
                      tabIndex={player.userId === userId ? -1 : undefined}
                    >
                      <td
                        className={`rank-cell rank-number ${player.position >= 1000 ? "rank-long" : ""}`}
                      >
                        <span className="rank-label">
                          <span className="rank-hash">#</span>
                          {player.position}
                        </span>
                      </td>
                      <td>
                        <div className="member">
                          <Avatar player={player} />
                          <Username player={player} />
                          {player.userId === userId && (
                            <span className="you-badge">DU</span>
                          )}
                        </div>
                      </td>
                      <td className="number-cell level-number">
                        <LevelProgress level={player.level} />
                      </td>
                      <td className="number-cell">
                        {numbers.format(player.xp)}
                      </td>
                      <td className="number-cell messages-cell">
                        {numbers.format(player.messageCount)}
                      </td>
                    </tr>
                  ))}
                  {!first &&
                    state.loading &&
                    Array.from({ length: 8 }, (_, index) => (
                      <tr
                        className="skeleton-row"
                        key={index}
                        aria-hidden="true"
                      >
                        {Array.from({ length: 5 }, (_, column) => (
                          <td
                            className={column === 4 ? "messages-cell" : ""}
                            key={column}
                          >
                            <span className="skeleton" />
                          </td>
                        ))}
                      </tr>
                    ))}
                  {first && players.length === 0 && (
                    <tr className="empty-state">
                      <td colSpan={5}>
                        Hier gibt es noch keine Platzierungen.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="load-state" role="status" aria-live="polite">
            {state.error ? (
              <div className="error-state">
                <h2>Kurze Pause für die Rangliste.</h2>
                <p>Die Platzierungen konnten nicht geladen werden.</p>
                <button
                  className="retry-button"
                  onClick={() => state.error && void load(state.error)}
                >
                  Erneut versuchen
                </button>
              </div>
            ) : state.loading ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Platzierungen werden geladen …
              </>
            ) : last?.hasNext ? (
              <button
                ref={more}
                className="load-button load-more"
                onClick={() =>
                  void load({ page: last.page + 1, mode: "append" })
                }
              >
                Weitere Plätze laden
              </button>
            ) : first ? (
              <p>Alle Platzierungen geladen.</p>
            ) : null}
          </div>
        </section>
      </section>
      {first && (
        <button
          className={`back-to-top ${showBackToTop ? "is-visible" : ""}`}
          aria-hidden={!showBackToTop}
          tabIndex={showBackToTop ? 0 : -1}
          aria-label="Zur Spitze der Rangliste"
          disabled={state.loading}
          onClick={backToTop}
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 19V5m-7 7 7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}
