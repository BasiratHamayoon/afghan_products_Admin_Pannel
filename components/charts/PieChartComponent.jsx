"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="px-4 py-3 rounded-xl text-sm bg-white dark:bg-[#0f1420] border border-gray-100 dark:border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: payload[0].payload.color }} />
          <span className="text-xs font-bold text-foreground">{payload[0].name}</span>
        </div>
        <p className="text-xs font-black text-foreground mt-1 ml-4">
          {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
}

export default function PieChartComponent({
  data = [],
  height = 200,
  innerRadius = 0,
  outerRadius = 80,
  showLegend = false,
  showLabels = false,
  className = "",
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            strokeWidth={3}
            stroke="transparent"
            label={
              showLabels
                ? ({ name, value }) => `${name}: ${value}%`
                : false
            }
          >
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.color || `hsl(${index * 45}, 70%, 50%)`}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: "11px", fontWeight: 600 }}
              formatter={(value) => (
                <span className="text-xs font-semibold text-foreground">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}