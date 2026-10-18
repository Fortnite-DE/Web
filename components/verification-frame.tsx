import type { ReactNode } from "react";
import { Brand } from "@/components/site";
import { VerificationNoise } from "@/components/verification-noise";

export function VerificationFrame({
  success = false,
  children,
}: {
  success?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      className={`verification ${success ? "verification-success" : "verification-error"}`}
      aria-labelledby="verification-heading"
    >
      <div className="verification-symbol" aria-hidden="true">
        <svg viewBox="0 0 100 100" fill="none">
          <circle
            cx="50"
            cy="50"
            r="43"
            stroke="currentColor"
            strokeWidth="8"
          />
          <path
            d={success ? "m28 50 15 15 29-30" : "m35 35 30 30m0-30L35 65"}
            stroke="currentColor"
            strokeWidth="8"
            strokeLinejoin={success ? "round" : undefined}
          />
        </svg>
      </div>
      <div className="verification-elements" aria-hidden="true" />
      <VerificationNoise />
      {children}
      <div className="verification-brand">
        <Brand />
      </div>
    </section>
  );
}
