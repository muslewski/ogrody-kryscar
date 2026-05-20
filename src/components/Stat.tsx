"use client";

import CountUp from "./CountUp";

export function Stat({
  value,
  className,
  duration = 2,
  separator = "",
}: {
  value: string;
  className?: string;
  duration?: number;
  separator?: string;
}) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  if (!match) return <span className={className}>{value}</span>;

  const numeric = parseFloat(match[1]);
  const suffix = match[2];

  return (
    <span className={className}>
      <CountUp to={numeric} duration={duration} separator={separator} />
      {suffix}
    </span>
  );
}
