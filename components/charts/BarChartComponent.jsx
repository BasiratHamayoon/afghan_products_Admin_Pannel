"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useTheme } from "next-themes";

function CustomTooltip({ active, payload, label, formatter, prefix, suffix }) {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-xl text-sm bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
        <p className="text-[11px] font-bold text-muted-foreground mb-2 uppercase tracking-wide">
          {label}
        </p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color || p.fill }} />
            <span className="text-xs font-semibold text-foreground">
              {p.name}:{" "}
              <span className="font-black">
                {prefix}{formatter ? formatter(p.value) : p.value}{suffix}
              </span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function BarChartComponent({
  data = [],
  bars = [{ dataKey: "value", color: "#0F69B0", name: "Value" }],
  height = 260,
  xKey = "month",
  formatter,
  prefix = "",
  suffix = "",
  showLegend = false,
  showGrid = true,
  barSize = 18,
  yTickFormatter,
  barGap = 6,
  className = "",
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickColor = isDark ? "rgba(255,255,255,0.35)" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(15,105,176,0.06)";

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          barGap={barGap}
          margin={{ top: 5, right: 5, bottom: 0, left: -10 }}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridColor}
              vertical={false}
            />
          )}
          <XAxis
            dataKey={xKey}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: tickColor, fontWeight: 600 }}
            tickFormatter={yTickFormatter || ((v) => v)}
          />
          <Tooltip
            content={
              <CustomTooltip
                formatter={formatter}
                prefix={prefix}
                suffix={suffix}
              />
            }
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: "11px", fontWeight: 600, paddingTop: "12px" }}
            />
          )}
          {bars.map((bar) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              name={bar.name || bar.dataKey}
              fill={bar.color}
              radius={[6, 6, 0, 0]}
              barSize={barSize}
              fillOpacity={bar.opacity || 1}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}