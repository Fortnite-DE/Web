import type { Metadata } from "next";
import { Verification } from "@/components/verification";
export const metadata: Metadata = {
  title: "Erfolgreich verifiziert",
  robots: { index: false, follow: false },
};
export default function VerificationSuccess() {
  return <Verification success />;
}
