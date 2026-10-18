import type { Metadata } from "next";
import { Verification } from "@/components/verification";
export const metadata: Metadata = {
  title: "Verifizierung fehlgeschlagen",
  robots: { index: false, follow: false },
};
export default function VerificationError() {
  return <Verification success={false} />;
}
