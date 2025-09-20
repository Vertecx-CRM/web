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
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  return (
    <>
      <div className="p-4 flex gap-2">

        {/* Ventas  */}
        <div className="p-2 w-[300px] h-[120px]">
          <div className="bg-[#F4F4F4] rounded-lg p-3 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/cash-stack.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow">
                <h2 className="text-lg font-medium mb-1">Ventas:</h2>
                <p className="text-2xl font-bold">$2.000.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compras */}
        <div className="p-2 w-[300px] h-[120px]">
          <div className="bg-[#F4F4F4] rounded-lg p-3 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/cart2.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow">
                <h2 className="text-lg font-medium mb-1">Compras:</h2>
                <p className="text-2xl font-bold">$2.000.000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Citas */}
        <div className="p-2 w-[300px] h-[120px]">
          <div className="bg-[#F4F4F4] rounded-lg p-3 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/calendar.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow">
                <h2 className="text-[30px] font-medium mb-1">Cita: 20</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Ordenes */}
        <div className="p-2 w-[300px] h-[120px]">
          <div className="bg-[#F4F4F4] rounded-lg p-3 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-7 flex items-center h-full">
              <Image
                src="/icons/box.svg"
                alt="Ventas"
                width={50}
                height={50}
                className="mr-4 filter brightness-0 invert"
              />
              <div className="flex-grow">
                <h2 className="text-[20px] font-medium mb-1">Ordenes: 20</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full h-full">
        {/* Ventas Grafico */}
        <div className="p-2 w-[50%] h-[60%]">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="flex justify-between items-center mb-4">
                {!selectedMonth ? (
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

              {/* Gráfico ocupa el resto del espacio */}
              <div className="flex-1">
                {!selectedMonth ? (
                  <YearlyGraph
                    title="Ventas"
                    data={TotalSalesData}
                    onMonthClick={setSelectedMonth}
                  />
                ) : (
                  <MonthlyGraph
                    title="Ventas"
                    month={selectedMonth}
                    data={TotalSalesData}
                    onBack={() => setSelectedMonth(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compras Grafico */}
        <div className="p-2 w-[50%] h-[60%]">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="flex justify-between items-center mb-4">
                {!selectedMonth ? (
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

              {/* Gráfico ocupa el resto del espacio */}
              <div className="flex-1">
                {!selectedMonth ? (
                  <YearlyGraph
                    title="Compra"
                    data={TotalShoppingData}
                    onMonthClick={setSelectedMonth}
                  />
                ) : (
                  <MonthlyGraph
                    title="Compra"
                    month={selectedMonth}
                    data={TotalShoppingData}
                    onBack={() => setSelectedMonth(null)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenedor general */}
      <div className="flex -mt-[250px] gap-4 w-full h-full">
        {/* Categoria por productos Grafico */}
        <div className="p-2 w-[35%] h-full">
          <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
            <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
              {/* Cabecera */}
              <div className="flex justify-between items-center mb-4">
                {/* Texto con ícono a la izquierda */}
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

        {/* Orden de servicios Grafico */}
        <div className="p-2 w-[40%] h-full">
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

                  {/* Contenedor de textos en columna */}
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
              <div className="flex-1 -mt-[70px]">
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

        {/* Cita Grafico */}
        <div className="p-2 w-[40%] h-full">
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

                  {/* Contenedor de textos en columna */}
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
              <div className="flex-1 -mt-[70px]">
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

      {/* Clientes Grafico */}
      <div className="p-2 w-[50%] h-[60%]">
        <div className="bg-[#F4F4F4] rounded-lg p-7 shadow-md h-full">
          <div className="bg-[#FFFFFF] rounded-lg p-7 flex flex-col h-full">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-4">
              {!selectedMonth ? (
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

            {/* Gráfico ocupa el resto del espacio */}
            <div className="flex-1">
              {!selectedMonth ? (
                <YearlyGraph
                  title="Clientes"
                  data={TotalClientsData}
                  onMonthClick={setSelectedMonth}
                />
              ) : (
                <MonthlyGraph
                  title="Clientes"
                  month={selectedMonth}
                  data={TotalClientsData}
                  onBack={() => setSelectedMonth(null)}
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