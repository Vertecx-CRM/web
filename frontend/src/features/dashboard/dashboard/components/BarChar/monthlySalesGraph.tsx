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
  year?: number;
}

export const MonthlyGraph = ({ title, month, data, onBack, isCurrency = true, year }: MonthlyGraphProps) => {
  const [dailyData, setDailyData] = useState<{ day: number; total: number }[]>([]);
  const isClientsChart = title === "Clientes";

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
  const rawTotal = monthData ? monthData.total : 0;
  const displayTotal = isClientsChart ? Math.max(0, Math.round(rawTotal)) : rawTotal;

  // CARGAR DATOS DIARIOS DESDE BACKEND
  useEffect(() => {
    const loadDailyData = async () => {
      try {
        let apiFunction: any = null;

        if (title === "Ventas") apiFunction = dashboardApi.getDailySalesByMonth;
        if (title === "Compras") apiFunction = dashboardApi.getDailyPurchasesByMonth;
        if (title === "Clientes") apiFunction = dashboardApi.getDailyClientsByMonth;

        if (!apiFunction) return;

        const response = await apiFunction(monthIndex, year);
        const sanitizedResponse = isClientsChart
          ? response.map((item: { day: number; total: number }) => ({
              ...item,
              total: Math.max(0, Math.round(item.total)),
            }))
          : response;

        setDailyData(sanitizedResponse);
      } catch (error) {
        console.error("Error cargando datos diarios:", error);
      }
    };

    loadDailyData();
  }, [month, title, monthIndex, isClientsChart, year]);

  // Formato del eje Y
  const formatYAxisTick = (value: number) => {
    if (isClientsChart) return Math.max(0, Math.round(value)).toString();
    return isCurrency ? `$${value}` : value.toString();
  };

  // Formato del tooltip
  const formatTooltipValue = (value: number) => {
    const sanitizedValue = isClientsChart ? Math.max(0, Math.round(value)) : value;
    return isCurrency ? `$${sanitizedValue}` : sanitizedValue;
  };

  return (
    <div className="w-full h-full flex flex-col items-center">
      {/* Header del gráfico */}
      <div className="w-full flex justify-between items-center px-4">
        <h2 className="text-lg font-bold">
          {title} {month}: {isCurrency ? `$${displayTotal}` : displayTotal}
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
        <LineChart
          data={dailyData}
          margin={{ top: 10, right: 20, left: 32, bottom: 20 }}
        >
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
          <YAxis
            tickFormatter={formatYAxisTick}
            tick={{ fill: Colors.texts.primary }}
            tickMargin={8}
            allowDecimals={!isClientsChart}
            domain={isClientsChart ? [0, "dataMax"] : undefined}
          />

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
