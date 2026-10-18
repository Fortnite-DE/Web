export function parseUnbanQuery(params: URLSearchParams) {
  const timestamp = params.get("timestamp");
  const signature = params.get("signature");
  const user = params.get("user");
  if (
    ["timestamp", "signature", "user"].some(
      (key) => params.getAll(key).length > 1,
    ) ||
    !timestamp ||
    !/^\d+$/.test(timestamp) ||
    !Number.isSafeInteger(Number(timestamp)) ||
    Number(timestamp) > 8_640_000_000_000 ||
    !signature ||
    signature.length > 1024 ||
    (user !== null && !/^[1-9]\d{0,19}$/.test(user))
  )
    return null;

  return {
    query: new URLSearchParams({
      timestamp,
      signature,
      ...(user ? { user } : {}),
    }).toString(),
    availableAt: Number(timestamp) * 1000,
  };
}

export function formatCountdown(seconds: number) {
  const remaining = Math.max(0, Math.ceil(seconds));
  const days = Math.floor(remaining / 86400);
  const clock = [
    Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  return `${days ? `${days} ${days === 1 ? "Tag" : "Tagen"} ` : ""}${clock}`;
}
