import { SOCIALS, type SocialId } from "@/lib/data";
import { cn } from "@/lib/utils";

// Brand SVGs (Lucide v1.x removed branded marks for trademark reasons).
// Paths are simplified versions — they read as Instagram / Facebook /
// YouTube at small sizes and inherit `currentColor` so the parent text
// color drives the tint.
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3V2z" />
    </svg>
  );
}

function YoutubeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <path d="m9.75 15.02 5.5-3.02-5.5-3.02v6.04z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const ICON_MAP: Record<SocialId, (props: { size?: number }) => React.JSX.Element> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
};

/**
 * Shared icon-link row for footer social media. Each anchor is ≥44×44 px so
 * touch targets meet the iOS/Material minimum, includes `aria-label` (the
 * icons alone aren't readable to assistive tech), opens in a new tab with
 * `rel="noopener noreferrer"`, and inherits parent `color` for tinting.
 *
 * Style via `className` (outer wrapper) and `linkClassName` (each link).
 */
export function Socials({
  className,
  linkClassName,
  iconSize = 18,
  variant = "outline",
}: {
  className?: string;
  linkClassName?: string;
  iconSize?: number;
  /** `outline` = bordered chip, `ghost` = no chrome, `solid` = filled chip. */
  variant?: "outline" | "ghost" | "solid";
}) {
  const base =
    "inline-flex h-11 w-11 items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-current";
  const chrome =
    variant === "outline"
      ? "rounded-full border border-current/30 hover:bg-current/10"
      : variant === "solid"
        ? "rounded-full bg-current/10 hover:bg-current/20"
        : "rounded-full hover:bg-current/10";

  return (
    <ul className={cn("flex items-center gap-2", className)}>
      {SOCIALS.map((s) => {
        const Icon = ICON_MAP[s.id];
        return (
          <li key={s.id}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={cn(base, chrome, linkClassName)}
            >
              <Icon size={iconSize} />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
