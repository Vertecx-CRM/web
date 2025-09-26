"use client";

import React, { useState } from 'react'
import Image from 'next/image'
import Colors from "@/shared/theme/colors";
import { OrderServiceData, TotalClientsData, TotalSalesData, TotalShoppingData } from './mocks/mocksDashboard';
import { YearlyGraph } from './components/BarChar/YearlySalesGraph';
import { MonthlyGraph } from './components/BarChar/monthlySalesGraph';
import { PieChartCategoryAndProducts } from './components/PieChart/pieChart';
import { CustomBarChart } from './components/BarChar/barChart';

export const IndexDashboard = () => {
  const [selectedMonthSales, setSelectedMonthSales] = useState<string | null>(null);
  const [selectedMonthShopping, setSelectedMonthShopping] = useState<string | null>(null);
  const [selectedMonthClients, setSelectedMonthClients] = useState<string | null>(null);

  return (
    <>
      {/* Primera fila: Contenedor principal para las tarjetas de métricas */}
      <div className="p-4 flex flex-wrap gap-4 justify-center md:justify-start">

        {/* Ventas */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/cash-stack.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-lg font-medium mb-1 break-words whitespace-normal">Ventas:</h2>
                <p className="text-2xl font-bold break-words whitespace-normal">$2.000.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compras */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/cart2.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-lg font-medium mb-1">Compras:</h2>
                <p className="text-2xl font-bold">$2.000.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Citas */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/calendar.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-[30px] font-medium mb-1">Cita: 20</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Ordenes */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/box.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow min-w-0 overflow-hidden">
                <h2 className="text-[20px] font-medium mb-1">Ordenes: 20</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda fila: Contenedor para los gráficos de Ventas y Compras */}
      <div className="flex flex-wrap lg:flex-nowrap w-full h-full">
        {/* Gráfico de Ventas */}
        <div className="p-2 w-full lg:w-[50%] h-[60%]">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="flex justify-between items-center mb-4">
                {!selectedMonthSales  ? (
                  <>
                    <h2 className="text-black text-xl font-bold">Ventas: $2.000.000</h2>
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
                ) : (
                  <></>
                )}
              </div>
              {/* Gráfico */}
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

        {/* Gráfico de Compras */}
        <div className="p-2 w-full lg:w-[50%] h-[60%]">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="flex justify-between items-center mb-4">
                {!selectedMonthShopping  ? (
                  <>
                    <h2 className="text-black text-xl font-bold">Compra: $2.000.000</h2>
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
                ) : (
                  <></>
                )}
              </div>
              {/* Gráfico */}
              <div className="flex-1">
                {!selectedMonthShopping  ? (
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

      {/* Tercera fila: Contenedor para los gráficos de Categorías, Ordenes de servicio y Citas */}
      <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full h-full lg:-mt-[20%]">
        {/* Gráfico de Categoría por productos */}
        <div className="p-2 w-full md:w-[35%] h-full">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <button className="p-3 bg-gray-100 rounded-lg shadow">
                    <Image
                      src="/icons/whh_infographic.svg"
                      alt="Categorías"
                      width={25}
                      height={25}
                      className="filter brightness-0"
                    />
                  </button>
                  <h2 className="text-black text-xl font-bold">
                    Cantidad de productos por categoría
                  </h2>
                </div>
              </div>
              {/* Gráfico */}
              <div className="flex-1">
                <PieChartCategoryAndProducts />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Orden de servicios */}
        <div className="p-2 w-full md:w-[35%] h-full">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="mb-4">
                <div className="flex items-start gap-2">
                  <button className="p-4 bg-gray-100 rounded-lg shadow">
                    <Image
                      src="/icons/bi_bar-chart.svg"
                      alt="Categorías"
                      width={35}
                      height={35}
                      className="filter brightness-0"
                    />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-black text-xl font-bold">
                      Ordenes de servicio
                    </h2>
                    <p className="text-gray-500 text-base mt-1">
                      Comparación de ordenes en pendientes, en proceso y completadas
                    </p>
                  </div>
                </div>
              </div>
              {/* Gráfico */}
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

        {/* Gráfico de Citas */}
        <div className="p-2 w-full md:w-[35%] h-full">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="mb-4">
                <div className="flex items-start gap-2">
                  <button className="p-4 bg-gray-100 rounded-lg shadow">
                    <Image
                      src="/icons/bi_bar-chart.svg"
                      alt="Categorías"
                      width={35}
                      height={35}
                      className="filter brightness-0"
                    />
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-black text-3xl font-bold">
                      Citas
                    </h2>
                    <p className="text-gray-500 text-base mt-1">
                      Comparación de citas en pendientes, en proceso y completadas
                    </p>
                  </div>
                </div>
              </div>
              {/* Gráfico */}
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

      {/* Cuarta fila: Contenedor para el gráfico de Clientes */}
      <div className="p-2 w-full lg:w-[50%] h-[60%]">
        <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
          <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-4">
              {!selectedMonthClients  ? (
                <>
                  <h2 className="text-black text-xl font-bold">Clientes: 1000</h2>
                  <button className="p-2 bg-gray-100 rounded-lg shadow">
                    <Image
                      src="/icons/graphic.svg"
                      alt="Clients"
                      width={20}
                      height={20}
                      className="filter brightness-0"
                    />
                  </button>
                </>
              ) : (
                <></>
              )}
            </div>
            {/* Gráfico */}
            <div className="flex-1">
              {!selectedMonthClients  ? (
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
    </>
  )
}