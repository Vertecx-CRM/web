// components/charts/CustomBarChart.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

interface BarConfig {
  dataKey: string;
  color: string;
  radius?: [number, number, number, number];
}

interface CustomBarChartProps {
  data: any[];
  xKey: string;
  bars: BarConfig[];
  width?: number;
  height?: number;
}

export const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  xKey,
  bars,
  width = 600,
  height = 300,
}) => {
  return (
    <ResponsiveContainer>
      <BarChart
        width={width}
        height={height}
        data={data}
        margin={{
          top: 20,
          right: 1,
          left: 1,
          bottom: 5,
        }}
        barGap={0}
        barCategoryGap={8}
      >
        <CartesianGrid stroke="transparent" strokeDasharray="9 9" />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fontWeight: "bold" }}
        />
        <YAxis hide={true} />

        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            radius={bar.radius || [0, 0, 0, 0]}
            stackId="a"
            fill={bar.color}
            barSize={25}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
