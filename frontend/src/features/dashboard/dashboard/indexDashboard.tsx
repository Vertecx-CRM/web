"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Colors from "@/shared/theme/colors";
import { YearlyGraph } from "./components/BarChar/YearlySalesGraph";
import { MonthlyGraph } from "./components/BarChar/monthlySalesGraph";
import { PieChartCategoryAndProducts } from "./components/PieChart/pieChart";
import { CustomBarChart } from "./components/BarChar/barChart";
import { dashboardApi } from "./api/dashboardApi";

function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export const IndexDashboard = () => {
  // ESTADOS
  const [salesYear, setSalesYear] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  const [purchasesYear, setPurchasesYear] = useState([]);
  const [totalPurchases, setTotalPurchases] = useState(0);

  const [categoryProducts, setCategoryProducts] = useState([]);

  const [ordersState, setOrdersState] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);

  const [serviceRequestsState, setServiceRequestsState] = useState([]);
  const [totalServiceRequests, setTotalServiceRequests] = useState(0);

  const [clientsYear, setClientsYear] = useState([]);
  const [totalClients, setTotalClients] = useState(0);

  const [selectedMonthSales, setSelectedMonthSales] = useState<string | null>(null);
  const [selectedMonthShopping, setSelectedMonthShopping] = useState<string | null>(null);
  const [selectedMonthClients, setSelectedMonthClients] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // CARGAR TODA LA DATA DEL DASHBOARD
  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // VENTAS
        setSalesYear(await dashboardApi.getSalesByYear());
        setTotalSales((await dashboardApi.getTotalSales()).total);

        // COMPRAS
        setPurchasesYear(await dashboardApi.getPurchasesByYear());
        setTotalPurchases((await dashboardApi.getTotalPurchases()).total);

        // PRODUCTOS POR CATEGORÍA
        setCategoryProducts(await dashboardApi.getCategoryProducts());

        // ÓRDENES
        setOrdersState(await dashboardApi.getOrdersByState());
        setTotalOrders((await dashboardApi.getTotalOrders()).total);

        // SOLICITUDES
        setServiceRequestsState(await dashboardApi.getServiceRequestsByState());
        setTotalServiceRequests((await dashboardApi.getTotalServiceRequests()).total);

        // CLIENTES
        setClientsYear(await dashboardApi.getClientsByYear());
        setTotalClients((await dashboardApi.getTotalClients()).total);

      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-screen overflow-y-auto overflow-x-hidden p-4">
      {loading && <Loader />}

      {/* PRIMERA FILA: MÉTRICAS PRINCIPALES */}
      <div className="flex flex-wrap gap-4 justify-center md:justify-start">

        {/* Ventas */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 min-h-10">
                <h2 className="text-sm sm:text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis leading-tight">Ventas</h2>
                <Image src="/icons/cash-stack.svg" alt="Ventas" width={32} height={32} className="w-8 h-8 object-contain filter brightness-0 invert" />
              </div>
              <p className="text-lg sm:text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-tight">${totalSales}</p>
            </div>
          </div>
        </div>

        {/* Compras */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 min-h-10">
                <h2 className="text-sm sm:text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis leading-tight">Compras</h2>
                <Image src="/icons/cart2.svg" alt="Compras" width={32} height={32} className="w-8 h-8 object-contain filter brightness-0 invert" />
              </div>
              <p className="text-lg sm:text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-tight">${totalPurchases}</p>
            </div>
          </div>
        </div>

        {/* Solicitudes de servicio */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 min-h-10">
                <h2 className="text-sm sm:text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis leading-tight">Solicitud de servicio</h2>
                <Image src="/icons/calendar.svg" alt="SolicitudServicio" width={32} height={32} className="w-8 h-8 object-contain filter brightness-0 invert" />
              </div>
              <p className="text-lg sm:text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-tight">{totalServiceRequests}</p>
            </div>
          </div>
        </div>

        {/* Órdenes */}
        <div className="p-3 w-full sm:w-[calc(50%-1rem)] md:w-[calc(25%-1rem)]">
          <div className="bg-[#F4F4F4] rounded-lg p-5 shadow-md h-full">
            <div className="bg-[#B20000] text-white rounded-lg p-4 sm:p-6 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between gap-3 min-h-10">
                <h2 className="text-sm sm:text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis leading-tight">Órdenes de servicio</h2>
                <Image src="/icons/box.svg" alt="Órdenes" width={32} height={32} className="w-8 h-8 object-contain filter brightness-0 invert" />
              </div>
              <p className="text-lg sm:text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-tight">{totalOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SEGUNDA FILA: GRÁFICA DE VENTAS & COMPRAS */}
      <div className="flex flex-wrap lg:flex-nowrap w-full h-auto mt-4 gap-4">

        {/* Ventas */}
        <div className="p-2 w-full lg:w-[50%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-white rounded-lg p-6 flex flex-col h-full">
              {!selectedMonthSales ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Ventas: ${totalSales}</h2>
                  <YearlyGraph
                    title="Ventas"
                    data={salesYear}
                    onMonthClick={setSelectedMonthSales}
                    isCurrency={true}
                  />
                </>
              ) : (
                <MonthlyGraph
                  title="Ventas"
                  month={selectedMonthSales}
                  data={salesYear}
                  onBack={() => setSelectedMonthSales(null)}
                  isCurrency={true}
                />
              )}
            </div>
          </div>
        </div>

        {/* Compras */}
        <div className="p-2 w-full lg:w-[50%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-white rounded-lg p-6 flex flex-col h-full">
              {!selectedMonthShopping ? (
                <>
                  <h2 className="text-xl font-bold mb-4">Compras: ${totalPurchases}</h2>
                  <YearlyGraph
                    title="Compras"
                    data={purchasesYear}
                    onMonthClick={setSelectedMonthShopping}
                    isCurrency={true}
                  />
                </>
              ) : (
                <MonthlyGraph
                  title="Compras"
                  month={selectedMonthShopping}
                  data={purchasesYear}
                  onBack={() => setSelectedMonthShopping(null)}
                  isCurrency={true}
                />
              )}
            </div>
          </div>
        </div>

      </div>

      {/* TERCERA FILA: CATEGORÍAS, ÓRDENES Y SOLICITUDES */}
      <div className="flex flex-wrap lg:flex-nowrap gap-4 w-full h-auto mt-6">

        {/* Categorías */}
        <div className="p-2 w-full md:w-[35%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-white rounded-lg p-6 flex flex-col h-full">
              <h2 className="text-xl font-bold mb-4">Productos por categoría</h2>
              <div className="h-[320px]">
                <PieChartCategoryAndProducts data={categoryProducts} />
              </div>
            </div>
          </div>
        </div>

        {/* Órdenes */}
        <div className="p-2 w-full md:w-[35%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-white rounded-lg p-6 flex flex-col h-full">
              <h2 className="text-xl font-bold mb-4">Órdenes de servicio</h2>
              <div className="h-[320px]">
                <CustomBarChart
                  data={ordersState}
                  xKey="state"
                  bars={[
                    {
                      dataKey: "value",
                      color: Colors.graphic.linePrimary,
                      radius: [0, 0, 8, 8],
                    },
                  ]}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Solicitudes */}
        <div className="p-2 w-full md:w-[35%]">
          <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
            <div className="bg-white rounded-lg p-6 flex flex-col h-full">
              <h2 className="text-xl font-bold mb-4">Solicitud de servicio</h2>
              <div className="h-[320px]">
                <CustomBarChart
                  data={serviceRequestsState}
                  xKey="state"
                  bars={[
                    {
                      dataKey: "value",
                      color: Colors.graphic.linePrimary,
                      radius: [0, 0, 8, 8],
                    },
                  ]}
                  height={300}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CUARTA FILA: CLIENTES */}
      <div className="p-2 w-full mt-6 mb-10">
        <div className="bg-[#F4F4F4] rounded-lg p-6 shadow-md h-full">
          <div className="bg-white rounded-lg p-6 flex flex-col h-full">
            {!selectedMonthClients ? (
              <>
                <h2 className="text-xl font-bold mb-4">Clientes: {totalClients}</h2>
                <YearlyGraph
                  title="Clientes"
                  data={clientsYear}
                  onMonthClick={setSelectedMonthClients}
                  isCurrency={false}
                />
              </>
            ) : (
              <MonthlyGraph
                title="Clientes"
                month={selectedMonthClients}
                data={clientsYear}
                onBack={() => setSelectedMonthClients(null)}
                isCurrency={false}
              />
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
