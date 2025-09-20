"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import Image from "next/image";
import Colors from "@/shared/theme/colors";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function generateDailyData(year: number, month: number) {
  const today = new Date();
  const daysInMonth = getDaysInMonth(year, month);
  const currentDay = today.getMonth() + 1 === month ? today.getDate() : daysInMonth;

  const data = [];
  for (let day = 1; day <= currentDay; day++) {
    data.push({
      day,
      uv: Math.floor(Math.random() * 1000) + 200,
    });
  }
  return data;
}

interface MonthlyGraphProps {
  title: string;                
  month: string;                
  data: { month: string; total: number }[];
  onBack: () => void;
  isCurrency?: boolean; 
}

export const MonthlyGraph = ({ title, month, data, onBack, isCurrency = true }: MonthlyGraphProps) => {
  const monthIndex = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ].indexOf(month) + 1;

  const monthData = data.find((m) => m.month === month);
  const total = monthData ? monthData.total : 0;

  const dailyData = generateDailyData(2025, monthIndex);

  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* Cabecera */}
      <div className="w-full flex justify-between items-center px-4">
        <h2 className="text-lg font-bold">
          {title} {month}: {isCurrency ? `$${total}` : total}
        </h2>
        <button
          onClick={onBack}
          className="px-3 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          <Image
            src="/icons/Medium-left.svg"
            alt="Volver"
            width={20}
            height={20}
            className="filter brightness-0"
          />
        </button>
      </div>

      {/* Gráfico */}
      <ResponsiveContainer className="mt-6">
        <LineChart data={dailyData}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="uv"
            stroke={Colors.graphic.linePrimary}
            strokeWidth={3}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
