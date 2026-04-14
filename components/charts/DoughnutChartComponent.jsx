"use client";

import PieChartComponent from "./PieChartComponent";

export default function DoughnutChart({
  data = [],
  height = 200,
  innerRadius = 55,
  outerRadius = 85,
  showLegend = false,
  centerLabel = null,
  centerValue = null,
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <PieChartComponent
        data={data}
        height={height}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        showLegend={showLegend}
      />
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && (
            <p className="text-xl font-black text-foreground leading-tight">
              {centerValue}
            </p>
          )}
          {centerLabel && (
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
              {centerLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}