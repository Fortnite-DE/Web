"use client";

const format = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export function LevelProgress({
  level,
  progress,
  focusable = true,
}: {
  level: number;
  progress: number;
  focusable?: boolean;
}) {
  const current = Math.floor(level);
  const label = `${format.format(progress)} % erreicht · Level ${current + 1}`;
  return (
    <span
      className="level-progress"
      role="progressbar"
      aria-label={`Level ${current}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-valuetext={label}
      tabIndex={focusable ? 0 : undefined}
    >
      <svg viewBox="0 0 44 44" aria-hidden="true">
        <circle className="level-track" cx="22" cy="22" r="19" />
        <circle
          className="level-fill"
          cx="22"
          cy="22"
          r="19"
          pathLength="100"
          strokeDasharray="100"
          strokeDashoffset={100 - progress}
        />
      </svg>
      <span className="level-value" aria-hidden="true">
        {current}
      </span>
      <span className="level-tooltip" aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
