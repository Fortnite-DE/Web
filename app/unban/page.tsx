import type { Metadata } from "next";
import { VerificationFrame } from "@/components/verification-frame";
import { UnbanStatus } from "@/components/unban-status";
import { parseUnbanQuery } from "@/lib/unban";

export const metadata: Metadata = {
  title: "Entbannungsantrag",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function UnbanPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const values = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["user", "timestamp", "signature"]) {
    const value = values[key];
    if (value !== undefined) {
      for (const item of Array.isArray(value) ? value : [value])
        params.append(key, item);
    }
  }
  const link = parseUnbanQuery(params);
  return (
    <>
      <main id="main">
        <VerificationFrame>
          <UnbanStatus key={link?.query ?? "invalid"} link={link} />
        </VerificationFrame>
      </main>
    </>
  );
}
