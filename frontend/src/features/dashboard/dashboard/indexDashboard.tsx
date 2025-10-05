"use client";

import React, { useState } from "react";
import Image from "next/image";
import Colors from "@/shared/theme/colors";
import {
  OrderServiceData,
  TotalClientsData,
  TotalSalesData,
  TotalShoppingData,
} from "./mocks/mocksDashboard";
import { YearlyGraph } from "./components/BarChar/YearlySalesGraph";
import { MonthlyGraph } from "./components/BarChar/monthlySalesGraph";
import { PieChartCategoryAndProducts } from "./components/PieChart/pieChart";
import { CustomBarChart } from "./components/BarChar/barChart";
import { WeeklyCalendarDashboard } from "./components/reprogramming/reprogramming";

export const IndexDashboard = () => {
  const [selectedMonthSales, setSelectedMonthSales] = useState<string | null>(null);
  const [selectedMonthShopping, setSelectedMonthShopping] = useState<string | null>(null);
  const [selectedMonthClients, setSelectedMonthClients] = useState<string | null>(null);

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden p-4">
      {/* Primera fila: tarjetas de métricas */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
        {/* Ventas */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 flex items-center h-full">
              <Image
                src="/icons/cash-stack.svg"
                alt="Ventas"
                width={40}
                height={40}
                className="mr-3 sm:mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-base sm:text-lg font-medium mb-1 break-words whitespace-normal">
                  Ventas:
                </h2>
                <p className="text-xl sm:text-2xl font-bold break-words whitespace-normal">
                  $2.000.000
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Compras */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 flex items-center h-full">
              <Image
                src="/icons/cart2.svg"
                alt="Compras"
                width={40}
                height={40}
                className="mr-3 sm:mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-base sm:text-lg font-medium mb-1">Compras:</h2>
                <p className="text-xl sm:text-2xl font-bold">$2.000.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Citas */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 flex items-center h-full">
              <Image
                src="/icons/calendar.svg"
                alt="Citas"
                width={40}
                height={40}
                className="mr-3 sm:mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-base sm:text-lg font-medium mb-1">Citas:</h2>
                <p className="text-xl sm:text-2xl font-bold">20</p>
              </div>
            </div>
          </div>
        </div>

        {/* Órdenes */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 flex items-center h-full">
              <Image
                src="/icons/box.svg"
                alt="Órdenes"
                width={40}
                height={40}
                className="mr-3 sm:mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-base sm:text-lg font-medium mb-1">Órdenes:</h2>
                <p className="text-xl sm:text-2xl font-bold">20</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila: Ventas y Compras */}
      <div className="flex flex-wrap lg:flex-nowrap w-full h-auto mt-4 gap-4">
        {/* Ventas */}
        <div className="p-2 w-full lg:w-[50%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                {!selectedMonthSales && (
                  <>
                    <h2 className="text-black text-lg sm:text-xl font-bold">Ventas: $2.000.000</h2>
                    <button className="p-2 bg-gray-100 rounded-lg shadow">
                      <Image
                        src="/icons/graphic.svg"
                        alt="Ventas"
                        width={20}
                        height={20}
                        className="filter brightness-0"
                      />
                    </button>
                  </>
                )}
              </div>
              <div className="flex-1">
                {!selectedMonthSales ? (
                  <YearlyGraph
                    title="Ventas"
                    data={TotalSalesData}
                    onMonthClick={setSelectedMonthSales}
                    isCurrency={true}
                  />
                ) : (
                  <MonthlyGraph
                    title="Ventas"
                    month={selectedMonthSales}
                    data={TotalSalesData}
                    onBack={() => setSelectedMonthSales(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compras */}
        <div className="p-2 w-full lg:w-[50%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                {!selectedMonthShopping && (
                  <>
                    <h2 className="text-black text-lg sm:text-xl font-bold">Compras: $2.000.000</h2>
                    <button className="p-2 bg-gray-100 rounded-lg shadow">
                      <Image
                        src="/icons/graphic.svg"
                        alt="Compras"
                        width={20}
                        height={20}
                        className="filter brightness-0"
                      />
                    </button>
                  </>
                )}
              </div>
              <div className="flex-1">
                {!selectedMonthShopping ? (
                  <YearlyGraph
                    title="Compra"
                    data={TotalShoppingData}
                    onMonthClick={setSelectedMonthShopping}
                    isCurrency={true}
                  />
                ) : (
                  <MonthlyGraph
                    title="Compra"
                    month={selectedMonthShopping}
                    data={TotalShoppingData}
                    onBack={() => setSelectedMonthShopping(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tercera fila: Categorías, Órdenes de servicio y Citas */}
      <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full h-auto mt-6">
        {/* Categorías */}
        <div className="p-2 w-full md:w-[35%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-6 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <button className="p-3 bg-gray-100 rounded-lg shadow">
                  <Image
                    src="/icons/whh_infographic.svg"
                    alt="Categorías"
                    width={25}
                    height={25}
                    className="filter brightness-0"
                  />
                </button>
                <h2 className="text-black text-lg sm:text-xl font-bold">
                  Productos por categoría
                </h2>
              </div>
              <div className="flex-1">
                <PieChartCategoryAndProducts />
              </div>
            </div>
          </div>
        </div>

        {/* Órdenes de servicio */}
        <div className="p-2 w-full md:w-[35%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-6 flex flex-col h-full">
              <div className="flex items-start gap-3 mb-4">
                <button className="p-4 bg-gray-100 rounded-lg shadow">
                  <Image
                    src="/icons/bi_bar-chart.svg"
                    alt="Órdenes"
                    width={35}
                    height={35}
                    className="filter brightness-0"
                  />
                </button>
                <div>
                  <h2 className="text-black text-lg sm:text-xl font-bold">Órdenes de servicio</h2>
                  <p className="text-gray-500 text-sm sm:text-base mt-1">
                    Pendientes, en proceso y completadas
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <CustomBarChart
                  data={OrderServiceData}
                  xKey="state"
                  bars={[
                    {
                      dataKey: "value",
                      color: Colors.graphic.linePrimary,
                      radius: [0, 0, 8, 8],
                    },
                    {
                      dataKey: "total",
                      color: "#f5a89eff",
                      radius: [8, 8, 0, 0],
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Citas */}
        <div className="p-2 w-full md:w-[35%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-6 flex flex-col h-full">
              <div className="flex items-start gap-3 mb-4">
                <button className="p-4 bg-gray-100 rounded-lg shadow">
                  <Image
                    src="/icons/bi_bar-chart.svg"
                    alt="Citas"
                    width={35}
                    height={35}
                    className="filter brightness-0"
                  />
                </button>
                <div>
                  <h2 className="text-black text-lg sm:text-xl font-bold">Citas</h2>
                  <p className="text-gray-500 text-sm sm:text-base mt-1">
                    Pendientes, en proceso y completadas
                  </p>
                </div>
              </div>
              <div className="flex-1">
                <CustomBarChart
                  data={OrderServiceData}
                  xKey="state"
                  bars={[
                    {
                      dataKey: "value",
                      color: Colors.graphic.linePrimary,
                      radius: [0, 0, 8, 8],
                    },
                    {
                      dataKey: "total",
                      color: "#f5a89eff",
                      radius: [8, 8, 0, 0],
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuarta fila: Clientes */}
      <div className="p-2 w-full lg:w-[100%] mt-6 mb-10">
        <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
          <div className="bg-[#FFFFFF] rounded-lg p-6 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              {!selectedMonthClients && (
                <>
                  <h2 className="text-black text-lg sm:text-xl font-bold">Clientes: 1000</h2>
                  <button className="p-2 bg-gray-100 rounded-lg shadow">
                    <Image
                      src="/icons/graphic.svg"
                      alt="Clientes"
                      width={20}
                      height={20}
                      className="filter brightness-0"
                    />
                  </button>
                </>
              )}
            </div>
            <div className="flex-1">
              {!selectedMonthClients ? (
                <YearlyGraph
                  title="Clientes"
                  data={TotalClientsData}
                  onMonthClick={setSelectedMonthClients}
                  isCurrency={false}
                />
              ) : (
                <MonthlyGraph
                  title="Clientes"
                  month={selectedMonthClients}
                  data={TotalClientsData}
                  onBack={() => setSelectedMonthClients(null)}
                  isCurrency={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      <WeeklyCalendarDashboard/>
    </div>
  );
};
