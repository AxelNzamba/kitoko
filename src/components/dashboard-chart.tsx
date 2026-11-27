import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface DashboardChartPoint {
  jour: string;
  ca: number;
  caYoY: number;
}

/**
 * Graphique d'évolution du CA (30 derniers jours).
 * Composant isolé pour permettre le code-splitting de recharts (~100 KB gzippé)
 * hors du bundle initial de la route dashboard.
 */
export function DashboardChart({
  data,
  showYoY,
}: {
  data: DashboardChartPoint[];
  showYoY: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.7 0.19 45)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="oklch(0.7 0.19 45)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 255)" vertical={false} />
        <XAxis
          dataKey="jour"
          stroke="oklch(0.5 0.03 257)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis stroke="oklch(0.5 0.03 257)" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "oklch(0.2 0.04 265)",
            border: "none",
            borderRadius: 6,
            color: "white",
            fontSize: 12,
          }}
          labelFormatter={(l) => `Jour ${l}`}
          formatter={(v, name) => {
            if (name === "ca") return [`${v}k FC`, "CA N"];
            return [`${v}k FC`, "CA N-1"];
          }}
        />
        {showYoY && (
          <Area
            type="monotone"
            dataKey="caYoY"
            stroke="oklch(0.5 0.03 257 / 0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
            dot={false}
            activeDot={{ r: 3, fill: "oklch(0.5 0.03 257)" }}
          />
        )}
        <Area
          type="monotone"
          dataKey="ca"
          stroke="oklch(0.7 0.19 45)"
          strokeWidth={2}
          fill="url(#caGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "oklch(0.7 0.19 45)" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
