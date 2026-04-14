"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
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

export default function AreaChartComponent({
  data = [],
  areas = [{ dataKey: "value", color: "#0F69B0", name: "Value" }],
  height = 260,
  xKey = "month",
  formatter,
  prefix = "",
  suffix = "",
  showLegend = false,
  showGrid = true,
  yTickFormatter,
  className = "",
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const tickColor = isDark ? "rgba(255,255,255,0.35)" : "#94a3b8";
  const gridColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(15,105,176,0.06)";

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <defs>
            {areas.map((area) => (
              <linearGradient
                key={area.dataKey}
                id={`areaGrad_${area.dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={area.color} stopOpacity={isDark ? 0.25 : 0.2} />
                <stop offset="100%" stopColor={area.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
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
          {areas.map((area) => (
            <Area
              key={area.dataKey}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stroke={area.color}
              strokeWidth={2.5}
              fill={`url(#areaGrad_${area.dataKey})`}
              dot={{ fill: area.color, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: area.color, strokeWidth: 2, stroke: "white" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}