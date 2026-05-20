"use client";

/**
 * Radial coverage map — Bydgoszcz at center, concentric km rings, every
 * city placed at its real compass bearing. Replaces the older
 * voivodeship-blob SVG (which read as vague + ugly). This reads cleanly as
 * an infographic: ring distance encodes road km, angle encodes direction.
 *
 * Themed per example via the `style` prop bag (fill / strokes / pin color /
 * label font / show rings / show compass / show legend). No tiles API.
 */

import { COVERAGE_CITIES, MAX_RADIUS_KM } from "@/lib/coverage";

export interface PolandMapStyle {
  /** Background fill for the dial */
  bg?: string;
  /** @deprecated use `bg` */
  fill?: string;
  /** Ring stroke color */
  ringColor?: string;
  /** @deprecated use `ringColor` */
  stroke?: string;
  /** Ring stroke width */
  ringWidth?: number;
  /** @deprecated use `ringWidth` */
  strokeWidth?: number;
  /** Ring stroke dash pattern */
  ringDash?: string;
  /** Ring opacity (multiplied with strokeOpacity defaults) */
  ringOpacity?: number;
  /** Color for non-HQ pins */
  pinColor?: string;
  /** Inner dot color (usually contrasting with pin) */
  pinInner?: string;
  /** Color for the HQ pin (Bydgoszcz) */
  hqColor?: string;
  /** Label text color */
  labelColor?: string;
  /** @deprecated use `labelColor` */
  pinLabelColor?: string;
  /** "N / E / S / W" compass tick color */
  compassColor?: string;
  /** Ring distance-label color (e.g. "25 km") */
  ringLabelColor?: string;
  /** Show concentric km rings (25/50/75/100) */
  showRings?: boolean;
  /** Show "N E S W" compass ticks */
  showCompass?: boolean;
  /** Show "25 km / 50 km" labels along one ring */
  showRingLabels?: boolean;
  /** Show city labels next to pins */
  showLabels?: boolean;
  /** Show road-distance suffix after each label */
  showDistance?: boolean;
  /** Font family for labels */
  labelFontFamily?: string;
  /** Font style for labels (e.g. "italic") */
  labelFontStyle?: "normal" | "italic";
  /** Pin label font size (svg user units) */
  labelFontSize?: number;
  /** Pin size for non-HQ cities */
  pinSize?: number;
  /** Pin size for HQ */
  hqSize?: number;
  /** Animate pins on mount */
  animate?: boolean;
  /** @deprecated use `showRings` */
  showRadiusRings?: boolean;
}

type Resolved = {
  bg: string;
  ringColor: string;
  ringWidth: number;
  ringDash: string;
  ringOpacity: number;
  pinColor: string;
  pinInner: string;
  hqColor: string;
  labelColor: string;
  compassColor: string;
  ringLabelColor: string;
  showRings: boolean;
  showCompass: boolean;
  showRingLabels: boolean;
  showLabels: boolean;
  showDistance: boolean;
  labelFontFamily?: string;
  labelFontStyle: "normal" | "italic";
  labelFontSize: number;
  pinSize: number;
  hqSize: number;
  animate: boolean;
};

const DEFAULTS: Resolved = {
  bg: "transparent",
  ringColor: "#1c1917",
  ringWidth: 0.5,
  ringDash: "1.5 1.5",
  ringOpacity: 0.25,
  pinColor: "#047857",
  pinInner: "#ffffff",
  hqColor: "#1c1917",
  labelColor: "#1c1917",
  compassColor: "#a8a29e",
  ringLabelColor: "#a8a29e",
  showRings: true,
  showCompass: true,
  showRingLabels: true,
  showLabels: true,
  showDistance: true,
  labelFontStyle: "normal",
  labelFontSize: 3.2,
  pinSize: 1.8,
  hqSize: 3.6,
  animate: true,
};

function resolveStyle(style: PolandMapStyle): Resolved {
  return {
    ...DEFAULTS,
    ...style,
    bg: style.bg ?? style.fill ?? DEFAULTS.bg,
    ringColor: style.ringColor ?? style.stroke ?? DEFAULTS.ringColor,
    ringWidth: style.ringWidth ?? style.strokeWidth ?? DEFAULTS.ringWidth,
    labelColor: style.labelColor ?? style.pinLabelColor ?? DEFAULTS.labelColor,
    showRings: style.showRings ?? style.showRadiusRings ?? DEFAULTS.showRings,
  };
}

const VIEWBOX = 100;
const CENTER = VIEWBOX / 2;
/** Padding so pins at MAX_RADIUS_KM don't touch the SVG edge */
const PADDING = 6;
const MAX_R_SVG = CENTER - PADDING;

function project(km: number, angleDeg: number) {
  // SVG y goes down; compass goes N=0, E=90, S=180, W=270 (clockwise from north).
  const r = (km / MAX_RADIUS_KM) * MAX_R_SVG;
  const angleRad = ((angleDeg - 90) * Math.PI) / 180; // shift so 0° points up
  return {
    x: CENTER + r * Math.cos(angleRad),
    y: CENTER + r * Math.sin(angleRad),
  };
}

const RINGS_KM = [25, 50, 75, 100];

export function PolandMap({
  className,
  style = {},
}: {
  className?: string;
  style?: PolandMapStyle;
}) {
  const s = resolveStyle(style);

  return (
    <svg
      viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      className={className}
      role="img"
      aria-label="Mapa zasięgu — Bydgoszcz w środku, miasta według odległości i kierunku."
    >
      {s.bg !== "transparent" && (
        <rect width={VIEWBOX} height={VIEWBOX} fill={s.bg} />
      )}

      {/* Concentric distance rings */}
      {s.showRings &&
        RINGS_KM.map((km) => {
          const r = (km / MAX_RADIUS_KM) * MAX_R_SVG;
          return (
            <circle
              key={km}
              cx={CENTER}
              cy={CENTER}
              r={r}
              fill="none"
              stroke={s.ringColor}
              strokeWidth={s.ringWidth}
              strokeOpacity={s.ringOpacity}
              strokeDasharray={s.ringDash}
            />
          );
        })}

      {/* N / E / S / W axis ticks */}
      {s.showCompass && (
        <g>
          {(
            [
              { label: "N", x: CENTER, y: PADDING / 2 + 1 },
              { label: "E", x: VIEWBOX - PADDING / 2 - 1, y: CENTER + 0.5 },
              { label: "S", x: CENTER, y: VIEWBOX - PADDING / 2 + 1 },
              { label: "W", x: PADDING / 2 + 1, y: CENTER + 0.5 },
            ] as const
          ).map((t) => (
            <text
              key={t.label}
              x={t.x}
              y={t.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={2.8}
              fontFamily={s.labelFontFamily || "inherit"}
              fontWeight="500"
              fill={s.compassColor}
              letterSpacing="0.2em"
            >
              {t.label}
            </text>
          ))}
          {/* Faint crosshair */}
          <line
            x1={CENTER}
            y1={PADDING + 2}
            x2={CENTER}
            y2={VIEWBOX - PADDING - 2}
            stroke={s.compassColor}
            strokeWidth="0.2"
            strokeOpacity="0.35"
          />
          <line
            x1={PADDING + 2}
            y1={CENTER}
            x2={VIEWBOX - PADDING - 2}
            y2={CENTER}
            stroke={s.compassColor}
            strokeWidth="0.2"
            strokeOpacity="0.35"
          />
        </g>
      )}

      {/* km-ring labels (on the east axis) */}
      {s.showRingLabels &&
        s.showRings &&
        RINGS_KM.map((km) => {
          const r = (km / MAX_RADIUS_KM) * MAX_R_SVG;
          return (
            <text
              key={km}
              x={CENTER + r + 0.8}
              y={CENTER - 1}
              fontSize={2}
              fill={s.ringLabelColor}
              fontFamily={s.labelFontFamily || "inherit"}
              opacity="0.7"
            >
              {km} km
            </text>
          );
        })}

      {/* City pins */}
      {COVERAGE_CITIES.map((city, i) => {
        const { x, y } = project(city.km, city.angle);
        const isHQ = city.km === 0;
        const r = isHQ ? s.hqSize : s.pinSize;
        const color = isHQ ? s.hqColor : s.pinColor;

        // Label positioning: nudge away from center to reduce overlap
        const labelOffset = isHQ ? 0 : r + 1.4;
        const labelAngleRad = ((city.angle - 90) * Math.PI) / 180;
        const labelX = isHQ
          ? x + r + 1
          : x + Math.cos(labelAngleRad) * labelOffset;
        const labelY = isHQ
          ? y + 0.8
          : y + Math.sin(labelAngleRad) * labelOffset + 0.8;
        const textAnchor =
          isHQ || Math.cos(labelAngleRad) > 0.2
            ? "start"
            : Math.cos(labelAngleRad) < -0.2
              ? "end"
              : "middle";

        return (
          <g
            key={city.name}
            style={
              s.animate
                ? {
                    animation: "popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both",
                    animationDelay: `${i * 0.05}s`,
                    transformOrigin: `${x}px ${y}px`,
                  }
                : undefined
            }
          >
            {isHQ && (
              <>
                <circle
                  cx={x}
                  cy={y}
                  r={r * 2.2}
                  fill={color}
                  fillOpacity="0.12"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={r * 1.4}
                  fill={color}
                  fillOpacity="0.22"
                />
              </>
            )}
            <circle cx={x} cy={y} r={r} fill={color} />
            <circle cx={x} cy={y} r={r * 0.42} fill={s.pinInner} />
            {s.showLabels && (
              <text
                x={labelX}
                y={labelY}
                fontSize={s.labelFontSize}
                fontStyle={s.labelFontStyle}
                fontFamily={s.labelFontFamily || "inherit"}
                fontWeight={isHQ ? 600 : 400}
                fill={s.labelColor}
                textAnchor={textAnchor}
                className="select-none"
              >
                {city.name}
                {s.showDistance && city.km > 0 ? ` · ${city.km} km` : ""}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
