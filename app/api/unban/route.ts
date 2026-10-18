import { parseUnbanQuery } from "@/lib/unban";

const headers = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  const params = parseUnbanQuery(new URL(request.url).searchParams);
  if (!params) return Response.json({ status: 400 }, { status: 400, headers });

  try {
    const response = await fetch(
      `https://auth.fn-discord.de/unban?${params.query}`,
      {
        headers: { Accept: "application/json" },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(12000)]),
      },
    );
    const data = await response.json();
    if (response.status === 403 && data?.status === 403) {
      return Response.json({ status: 403 }, { status: 403, headers });
    }
    if (response.status === 400 && data?.status === 400) {
      return Response.json({ status: 400 }, { status: 400, headers });
    }
    if (
      response.ok &&
      data?.status === 200 &&
      typeof data.redirect === "string"
    ) {
      const target = new URL(data.redirect);
      if (
        target.protocol === "https:" &&
        !target.username &&
        !target.password
      ) {
        return Response.json(
          { status: 200, redirect: target.href },
          { headers },
        );
      }
    }
    throw new Error("Invalid unban response");
  } catch {
    return Response.json({ status: 502 }, { status: 502, headers });
  }
}
