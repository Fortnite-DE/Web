export const GUILD_ID = "398567824471097345";
export const PAGE_SIZE = 50;
export const MAX_PAGES = 6;

export interface Player {
  userId: string;
  position: number;
  username: string;
  avatarUrl: string | null;
  avatarDecorationUrl: string | null;
  roleColors: string[];
  xp: number;
  level: number;
  levelProgress: number;
  messageCount: number;
}

export interface CurrentPlayer extends Player {
  page: number;
  bannerUrl?: string | null;
}

export interface LeaderboardPage {
  items: Player[];
  page: number;
  total: number;
  currentUser: CurrentPlayer | null;
  hasNext: boolean;
}

export function validUserId(value: unknown): value is string {
  return typeof value === "string" && /^[1-9]\d{0,19}$/.test(value);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function safeImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "cdn.discordapp.com"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function parsePlayer(value: unknown, period: boolean): Player {
  if (
    !record(value) ||
    !validUserId(value.userId) ||
    typeof value.username !== "string" ||
    !Number.isInteger(value.position) ||
    typeof value.position !== "number" ||
    value.position < 1 ||
    typeof value.levelProgress !== "number" ||
    !Number.isFinite(value.levelProgress) ||
    value.levelProgress < 0 ||
    value.levelProgress > 100 ||
    ![
      period ? value.periodXp : value.xp,
      value.level,
      period ? value.periodMessageCount : value.messageCount,
    ].every((n) => typeof n === "number" && Number.isFinite(n) && n >= 0)
  )
    throw new Error("Ungültige Ranglistendaten.");
  return {
    userId: value.userId,
    username: value.username,
    position: value.position,
    avatarUrl: safeImage(value.avatarUrl),
    avatarDecorationUrl: safeImage(value.avatarDecorationUrl),
    roleColors: Array.isArray(value.roleColors)
      ? value.roleColors
          .filter(
            (color): color is string =>
              typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color),
          )
          .slice(0, 3)
      : [],
    xp: (period ? value.periodXp : value.xp) as number,
    level: value.level as number,
    levelProgress: value.levelProgress,
    messageCount: (period
      ? value.periodMessageCount
      : value.messageCount) as number,
  };
}

export function parsePage(
  value: unknown,
  page: number,
  period = false,
): LeaderboardPage {
  if (Array.isArray(value) && value.length === 0) {
    return { items: [], page, total: 0, currentUser: null, hasNext: false };
  }
  if (
    !record(value) ||
    value.page !== page ||
    !Array.isArray(value.items) ||
    value.items.length > PAGE_SIZE ||
    !Number.isInteger(value.total) ||
    typeof value.total !== "number" ||
    value.total < 0 ||
    !(value.next === null || typeof value.next === "string")
  ) {
    throw new Error("Ungültige Ranglistendaten.");
  }
  let currentUser: CurrentPlayer | null = null;
  if (value.currentUser != null) {
    if (
      !record(value.currentUser) ||
      !Number.isInteger(value.currentUser.page) ||
      typeof value.currentUser.page !== "number" ||
      value.currentUser.page < 1
    ) {
      throw new Error("Ungültige Nutzerplatzierung.");
    }
    currentUser = {
      ...parsePlayer(value.currentUser, period),
      page: value.currentUser.page,
      bannerUrl: safeImage(value.currentUser.bannerUrl),
    };
  }
  return {
    items: value.items.map((item) => parsePlayer(item, period)),
    page,
    total: value.total,
    currentUser,
    hasNext: value.items.length > 0 && value.next !== null,
  };
}

export function mergePages(
  pages: LeaderboardPage[],
  incoming: LeaderboardPage,
  mode: "replace" | "append" | "prepend",
) {
  if (mode === "replace") return [incoming];
  const result = [
    ...pages.filter((p) => p.page !== incoming.page),
    incoming,
  ].sort((a, b) => a.page - b.page);
  return mode === "prepend"
    ? result.slice(0, MAX_PAGES)
    : result.slice(-MAX_PAGES);
}
