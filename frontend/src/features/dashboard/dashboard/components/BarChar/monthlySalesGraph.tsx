"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

import Image from "next/image";
import Colors from "@/shared/theme/colors";
import { dashboardApi } from "../../api/dashboardApi";

interface MonthlyGraphProps {
  title: string;
  month: string;
  data: { month: string; total: number }[];
  onBack: () => void;
  isCurrency?: boolean;
}

export const MonthlyGraph = ({ title, month, data, onBack, isCurrency = true }: MonthlyGraphProps) => {
  const [dailyData, setDailyData] = useState<{ day: number; total: number }[]>([]);

  // Convertir "Ene" -> 1, "Feb" -> 2, ...
  const monthMap: Record<string, number> = {
    Ene: 1, Jan: 1,
    Feb: 2,
    Mar: 3,
    Abr: 4, Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Ago: 8, Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dic: 12, Dec: 12,
  };

  const monthIndex = monthMap[month] || 0;


  // Total del mes (para mostrar en el título)
  const monthData = data.find((m) => m.month === month);
  const total = monthData ? monthData.total : 0;

  // CARGAR DATOS DIARIOS DESDE BACKEND
  useEffect(() => {
    const loadDailyData = async () => {
      try {
        let apiFunction: any = null;

        if (title === "Ventas") apiFunction = dashboardApi.getDailySalesByMonth;
        if (title === "Compras") apiFunction = dashboardApi.getDailyPurchasesByMonth;
        if (title === "Clientes") apiFunction = dashboardApi.getDailyClientsByMonth;

        if (!apiFunction) return;

        const response = await apiFunction(monthIndex);
        setDailyData(response);
      } catch (error) {
        console.error("Error cargando datos diarios:", error);
      }
    };

    loadDailyData();
  }, [month, title]);

  // Formato del eje Y
  const formatYAxisTick = (value: number) => {
    return isCurrency ? `$${value}` : value.toString();
  };

  // Formato del tooltip
  const formatTooltipValue = (value: number) => {
    return isCurrency ? `$${value}` : value;
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* Header del gráfico */}
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

      {/* Gráfico diario */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyData}>
          <XAxis
            dataKey="day"
            tick={{ fill: Colors.texts.primary }}
            label={{
              value: "Días del Mes",
              position: "insideBottom",
              offset: -5,
              fill: Colors.texts.primary,
            }}
          />
          <YAxis tickFormatter={formatYAxisTick} tick={{ fill: Colors.texts.primary }} />

          <Tooltip
            formatter={(value) => [formatTooltipValue(Number(value)), "Total"]}
            labelFormatter={(label) => `Día ${label}`}
          />

          <Line
            type="monotone"
            dataKey="total"
            stroke={Colors.graphic.linePrimary}
            strokeWidth={3}
            dot
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
