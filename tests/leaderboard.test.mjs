import { describe, expect, spyOn, test } from "bun:test";
import {
  mergePages,
  pagesAroundPosition,
  parsePage,
  safeImage,
  validUserId,
} from "../lib/leaderboard.ts";
import { GET } from "../app/api/leaderboard/route.ts";

const player = {
  userId: "1011724476754448456",
  position: 5674,
  username: "Player",
  avatarUrl: "https://cdn.discordapp.com/avatars/example.webp",
  avatarDecorationUrl: null,
  roleColors: ["#ffffff", "invalid"],
  xp: 267,
  level: 1.9,
  levelProgress: 87.4,
  messageCount: 13,
};
const response = (page = 1) => ({
  items: [player],
  page,
  total: 6000,
  next: "https://auth.fn-discord.de/leaderboard?page=2",
  currentUser: { ...player, page: 114 },
});

describe("leaderboard API contract", () => {
  test("selects period statistics for rows and own placement without changing the level", () => {
    const weeklyPlayer = { ...player, periodXp: 50, periodMessageCount: 3 };
    const data = {
      ...response(),
      items: [weeklyPlayer],
      currentUser: { ...weeklyPlayer, page: 114 },
    };
    const weekly = parsePage(data, 1, true);
    expect(weekly.items[0].xp).toBe(50);
    expect(weekly.currentUser.messageCount).toBe(3);
    expect(weekly.currentUser.level).toBe(player.level);
    expect(weekly.items[0].levelProgress).toBe(player.levelProgress);
    expect(weekly.currentUser.levelProgress).toBe(player.levelProgress);
    expect(parsePage(data, 1).items[0].xp).toBe(player.xp);
    expect(() => parsePage(response(), 1, true)).toThrow();
    expect(() =>
      parsePage(
        { ...data, items: [{ ...weeklyPlayer, periodXp: -1 }] },
        1,
        true,
      ),
    ).toThrow();
  });
  test("forwards days only in weekly mode, preserving user ID and pagination", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockImplementation(async () =>
      Response.json({
        ...response(2),
        items: [{ ...player, periodXp: 50, periodMessageCount: 3 }],
        currentUser: null,
      }),
    );
    try {
      for (const suffix of ["", "&days=7"]) {
        const result = await GET(
          new Request(
            `https://localhost/api/leaderboard?page=2&userId=${player.userId}${suffix}`,
          ),
        );
        expect(result.status).toBe(200);
        const upstream = new URL(fetchMock.mock.calls.at(-1)[0]);
        expect(upstream.searchParams.get("days")).toBe(suffix ? "7" : null);
        expect(upstream.searchParams.get("userId")).toBe(player.userId);
        expect(upstream.searchParams.get("page")).toBe("2");
        expect((await result.json()).items[0].xp).toBe(suffix ? 50 : player.xp);
      }
    } finally {
      fetchMock.mockRestore();
    }
  });
  test("preserves Discord snowflakes and the direct lookup page", () => {
    const parsed = parsePage(response(), 1);
    expect(parsed.currentUser.userId).toBe("1011724476754448456");
    expect(parsed.currentUser.page).toBe(114);
    expect(parsed.items[0].roleColors).toEqual(["#ffffff"]);
    expect(parsed.hasNext).toBe(true);
  });
  test("accepts both upstream empty result shapes", () => {
    expect(parsePage([], 1).hasNext).toBe(false);
    expect(
      parsePage(
        { items: [], page: 2, total: 0, currentUser: null, next: null },
        2,
      ).items,
    ).toEqual([]);
  });
  test("rejects malformed or mismatched pages and player statistics", () => {
    expect(() => parsePage(response(), 2)).toThrow();
    expect(() =>
      parsePage({ ...response(), items: [{ ...player, xp: -1 }] }, 1),
    ).toThrow();
    expect(() =>
      parsePage({ ...response(), currentUser: { ...player, page: 0 } }, 1),
    ).toThrow();
    expect(() =>
      parsePage({ ...response(), items: [{ ...player, level: NaN }] }, 1),
    ).toThrow();
  });
  test("only accepts supported image origins and valid IDs", () => {
    expect(safeImage("javascript:alert(1)")).toBeNull();
    expect(safeImage("https://example.com/image.png")).toBeNull();
    expect(safeImage(player.avatarUrl)).toBe(player.avatarUrl);
    expect(validUserId(player.userId)).toBe(true);
    expect(validUserId("1e18")).toBe(false);
    expect(validUserId([player.userId])).toBe(false);
  });
  test("invalid request parameters never reach the upstream API", async () => {
    for (const query of [
      "page=0",
      "page=-1",
      "page=1.5",
      "page=Infinity",
      "userId=bad",
      "page=9007199254740992",
      "days=0",
      "days=8",
      "days=7.5",
      "days=",
    ]) {
      const result = await GET(
        new Request(`https://localhost/api/leaderboard?${query}`),
      );
      expect(result.status).toBe(400);
    }
  });
});

describe("bounded page window", () => {
  test("prepares adjacent batches around jump targets without loading intermediate pages", () => {
    expect(pagesAroundPosition(25, 6000, 12)).toEqual([1]);
    expect(pagesAroundPosition(50, 6000, 12)).toEqual([1, 2]);
    expect(pagesAroundPosition(51, 6000, 12)).toEqual([1, 2]);
    expect(pagesAroundPosition(100, 6000, 12)).toEqual([2, 3]);
    expect(pagesAroundPosition(101, 6000, 12)).toEqual([2, 3]);
    expect(pagesAroundPosition(5674, 6000, 12)).toEqual([114]);
    expect(pagesAroundPosition(1, 6000, 12)).toEqual([1]);
    expect(pagesAroundPosition(6000, 6000, 12)).toEqual([120]);
  });
  const page = (number) => parsePage(response(number), number);
  test("keeps the latest six pages on append and removes duplicates", () => {
    let pages = [];
    for (let number = 1; number <= 10; number++)
      pages = mergePages(pages, page(number), "append");
    expect(pages.map((p) => p.page)).toEqual([5, 6, 7, 8, 9, 10]);
    expect(mergePages(pages, page(10), "append")).toHaveLength(6);
  });
  test("prepends earlier pages and drops the far end", () => {
    const pages = [114, 115, 116, 117, 118, 119].map(page);
    expect(mergePages(pages, page(113), "prepend").map((p) => p.page)).toEqual([
      113, 114, 115, 116, 117, 118,
    ]);
  });
  test("a direct jump replaces the window rather than loading intervening pages", () => {
    expect(
      mergePages([page(1)], page(114), "replace").map((p) => p.page),
    ).toEqual([114]);
  });
});

describe("level progress", () => {
  test("preserves backend progress independently of the fractional level", () => {
    const parsed = parsePage(response(), 1);
    expect(parsed.items[0].levelProgress).toBe(87.4);
    expect(parsed.currentUser.levelProgress).toBe(87.4);
  });
  test("validates progress bounds for rows and own placement", () => {
    for (const levelProgress of [
      undefined,
      null,
      "43.1",
      NaN,
      Infinity,
      -1,
      101,
    ]) {
      const invalid = { ...player, levelProgress };
      expect(() => parsePage({ ...response(), items: [invalid] }, 1)).toThrow();
      expect(() =>
        parsePage({ ...response(), currentUser: { ...invalid, page: 1 } }, 1),
      ).toThrow();
    }
    for (const levelProgress of [0, 100]) {
      expect(
        parsePage({ ...response(), items: [{ ...player, levelProgress }] }, 1)
          .items[0].levelProgress,
      ).toBe(levelProgress);
    }
  });
});
