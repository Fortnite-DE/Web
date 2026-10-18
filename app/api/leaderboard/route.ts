import { GUILD_ID, parsePage, validUserId } from "@/lib/leaderboard";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const rawPage = query.get("page") ?? "1";
  const userId = query.get("userId");
  const page = Number(rawPage);
  if (
    !/^\d+$/.test(rawPage) ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    (userId !== null && !validUserId(userId))
  ) {
    return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }
  const url = new URL("https://auth.fn-discord.de/leaderboard");
  url.search = new URLSearchParams({
    guildId: GUILD_ID,
    page: String(page),
    ...(userId ? { userId } : {}),
  }).toString();
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(12000)]),
    });
    if (!response.ok) throw new Error(`Leaderboard HTTP ${response.status}`);
    const data: unknown = await response.json();
    return Response.json(parsePage(data, page), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      {
        error:
          "Die Rangliste ist gerade nicht erreichbar. Bitte versuche es erneut.",
      },
      { status: 502 },
    );
  }
}
