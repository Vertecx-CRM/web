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
  isCurrency?: boolean; 
}

// Componente Tooltip personalizado
const CustomTooltip = ({ active, payload, isCurrency }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const displayValue = isCurrency ? `$${value}` : value;
    
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{`Mes: ${payload[0].payload.month}`}</p>
        <p className="text-gray-600">{`Total: ${displayValue}`}</p>
      </div>
    );
  }
  return null;
};

export const YearlyGraph = ({ title, data, onMonthClick, isCurrency = true }: YearlyGraphProps) => {
  const maxValue = Math.max(...data.map((item) => item.total));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart

        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <XAxis dataKey="month" axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip isCurrency={isCurrency} />} />

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