import { describe, expect, spyOn, test } from "bun:test";
import { parseUnbanQuery, formatCountdown } from "../lib/unban.ts";
import { GET } from "../app/api/unban/route.ts";

describe("unban links", () => {
  test("preserves signatures and optional user IDs without interpreting their contents", () => {
    const params = new URLSearchParams({
      timestamp: "1800000000",
      signature: "test+a/b=",
      user: "269900564027015169",
    });
    const link = parseUnbanQuery(params);
    expect(link.availableAt).toBe(1800000000000);
    expect(new URLSearchParams(link.query).get("signature")).toBe("test+a/b=");
    params.delete("user");
    expect(parseUnbanQuery(params)).not.toBeNull();
  });
  test("rejects missing, repeated and invalid parameters before contacting upstream", async () => {
    const mock = spyOn(globalThis, "fetch");
    try {
      for (const query of [
        "",
        "timestamp=1",
        "timestamp=abc&signature=test",
        "timestamp=1&signature=test&user=bad",
        "timestamp=1&timestamp=2&signature=test",
        "timestamp=99999999999999999999&signature=test",
      ]) {
        expect(
          (await GET(new Request(`https://localhost/api/unban?${query}`)))
            .status,
        ).toBe(400);
      }
      expect(mock).not.toHaveBeenCalled();
    } finally {
      mock.mockRestore();
    }
  });
  test("formats countdown boundaries without negative values", () => {
    expect(formatCountdown(90061)).toBe("1 Tag 01:01:01");
    expect(formatCountdown(172800)).toBe("2 Tagen 00:00:00");
    expect(formatCountdown(60)).toBe("00:01:00");
    expect(formatCountdown(0.2)).toBe("00:00:01");
    expect(formatCountdown(-1)).toBe("00:00:00");
  });
  test("handles waiting, invalid links, redirects and server failures without caching", async () => {
    const request = () =>
      new Request(
        "https://localhost/api/unban?timestamp=1800000000&signature=test",
      );
    const mock = spyOn(globalThis, "fetch");
    try {
      for (const status of [400, 403]) {
        mock.mockResolvedValueOnce(Response.json({ status }, { status }));
        const result = await GET(request());
        expect(result.status).toBe(status);
        expect(result.headers.get("Cache-Control")).toBe("no-store");
      }
      mock.mockResolvedValueOnce(
        Response.json({
          status: 200,
          redirect: "https://docs.google.com/forms/example",
        }),
      );
      const result = await GET(request());
      expect((await result.json()).redirect).toBe(
        "https://docs.google.com/forms/example",
      );
      expect(mock.mock.calls.at(-1)[1].headers.Accept).toBe("application/json");
      expect(mock.mock.calls.at(-1)[1].cache).toBe("no-store");
      mock.mockResolvedValueOnce(
        Response.json({ status: 200, redirect: "javascript:alert(1)" }),
      );
      expect((await GET(request())).status).toBe(502);
      mock.mockRejectedValueOnce(new Error("Network failure"));
      expect((await GET(request())).status).toBe(502);
    } finally {
      mock.mockRestore();
    }
  });
});
