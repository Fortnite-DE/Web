import type { Metadata } from "next";
import { Leaderboard } from "@/components/leaderboard";
import { Footer, Header } from "@/components/site";
import { validUserId } from "@/lib/leaderboard";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Die aktivsten Mitglieder der Fortnite Deutschland Discord Community. Entdecke die Level-Rangliste.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string | string[] }>;
}) {
  const { userId: rawUserId } = await searchParams;
  const userId = validUserId(rawUserId) ? rawUserId : null;
  return (
    <>
      <Header title="LEADERBOARD" />
      <main id="main" className="container">
        <Leaderboard key={userId ?? "all"} userId={userId} />
      </main>
      <Footer />
    </>
  );
}
