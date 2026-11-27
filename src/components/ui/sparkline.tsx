import { useMemo } from "react";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

/**
 * Mini graphique sparkline en SVG inline.
 * Aucune dépendance externe — pur SVG.
 *
 * Usage:
 *   <Sparkline data={[10, 25, 15, 30, 20, 45, 35]} />
 */
export function Sparkline({
  data,
  width = 80,
  height = 28,
  strokeColor = "oklch(0.7 0.19 45)",
  fillColor = "oklch(0.7 0.19 45 / 0.12)",
  strokeWidth = 1.5,
}: SparklineProps) {
  const path = useMemo(() => {
    if (!data || data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;

    const w = width - padding * 2;
    const h = height - padding * 2;

    const points = data.map((value, i) => {
      const x = padding + (i / (data.length - 1)) * w;
      const y = padding + h - ((value - min) / range) * h;
      return `${x},${y}`;
    });

    // Ligne brisée
    const line = points.join(" L ");

    // Aire sous la courbe (pour le remplissage)
    const firstX = padding;
    const lastX = padding + w;
    const bottomY = padding + h;

    const area = `M ${firstX},${bottomY} L ${points.join(" L ")} L ${lastX},${bottomY} Z`;

    return { line: `M ${line}`, area };
  }, [data, width, height]);

  if (!path) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden="true"
    >
      <path d={path.area} fill={fillColor} />
      <path
        d={path.line}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Petite pastille colorée indiquant la direction de la tendance.
 */
export function TrendDot({ data }: { data: number[] }) {
  if (!data || data.length < 2) return null;

  const first = data[0];
  const last = data[data.length - 1];
  const pct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : 0;

  let color: string;
  let arrow: string;

  if (pct > 5) {
    color = "text-success";
    arrow = "↑";
  } else if (pct < -5) {
    color = "text-destructive";
    arrow = "↓";
  } else {
    color = "text-muted-foreground";
    arrow = "→";
  }

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${color}`}>
      {arrow}
      {Math.abs(pct) >= 1 && `${Math.round(Math.abs(pct))}%`}
    </span>
  );
}
