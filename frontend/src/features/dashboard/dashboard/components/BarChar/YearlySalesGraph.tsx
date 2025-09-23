"use client";

import React from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import Colors from "@/shared/theme/colors";

interface YearlyGraphProps {
  title: string;               
  data: { month: string; total: number }[]; 
  onMonthClick: (month: string) => void;
}

export const YearlyGraph = ({ title, data, onMonthClick }: YearlyGraphProps) => {
  const maxValue = Math.max(...data.map((item) => item.total));

  return (
    <ResponsiveContainer>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="month" axisLine={false} tickLine={false} />
        <Tooltip />

        {/* Línea de referencia al valor máximo */}
        <ReferenceLine
          y={maxValue * 1.05}
          stroke={Colors.graphic.lineMax}
          strokeDasharray="5 5"
          strokeWidth={2}
          label={{
            value: "MAX",
            position: "right",
            fill: Colors.texts.primary,
            dx: -4,
            style: { fontSize: 12, fontWeight: "bold" },
          }}
        />

        <Bar
          dataKey="total"
          radius={[8, 8, 8, 8]}
          activeBar={<Rectangle fill={Colors.graphic.lineThird} stroke="purple" />}
          onClick={(_, index) => onMonthClick(data[index].month)}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.total === maxValue
                  ? Colors.graphic.linePrimary
                  : Colors.graphic.lineSecondary
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
