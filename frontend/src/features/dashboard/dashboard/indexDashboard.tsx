"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingCart,
  ClipboardList,
  Settings,
  Calendar,
  Filter,
} from "lucide-react";
import Colors from "@/shared/theme/colors";
import { YearlyGraph } from "./components/BarChar/YearlySalesGraph";
import { MonthlyGraph } from "./components/BarChar/monthlySalesGraph";
import { YearlySalesPurchasesGraph } from "./components/BarChar/YearlySalesPurchasesGraph";
import { MonthlySalesPurchasesGraph } from "./components/BarChar/MonthlySalesPurchasesGraph";
import {
  PieChartCategoryAndProducts,
  CategoryData,
} from "./components/PieChart/pieChart";
import { CustomBarChart } from "./components/BarChar/barChart";
import { dashboardApi } from "./api/dashboardApi";
import { MonthSelection } from "./components/BarChar/monthUtils";

// --- HELPERS ---
const normalizeStateKey = (v: string) =>
  v
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .toLowerCase();

const translateDashboardState = (value: string) => {
  const key = normalizeStateKey(value);
  const map: Record<string, string> = {
    cancel: "Cancelados",
    finished: "Finalizados",
    finish: "Finalizados",
    inprocess: "En Proceso",
    pendient: "Pendientes",
  };
  return map[key] || value;
};

export const formatCOP = (value: number | string) =>
  Number(value ?? 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

// --- COMPONENTES DE APOYO ---
const StatCard = ({ title, value, icon: Icon, color = "red" }: any) => (
  <div className="relative overflow-hidden bg-white rounded-xl border border-[#626262]/20 shadow-sm p-6 group hover:border-[#B20000]/50 transition-all duration-300">
    <div className="absolute -right-4 -top-4 text-[#B20000]/5 group-hover:text-[#B20000]/10 transition-colors">
      <Icon size={120} strokeWidth={1} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-[#B20000]/10 rounded-lg text-[#B20000]">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#717680]">
          {title}
        </span>
      </div>
      <p className="text-2xl font-black text-[#0D141C] truncate">{value}</p>
    </div>
  </div>
);

export const IndexDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [salesYear, setSalesYear] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [purchasesYear, setPurchasesYear] = useState([]);
  const [totalPurchases, setTotalPurchases] = useState(0);
  const [categoryProducts, setCategoryProducts] = useState<CategoryData[]>([]);
  const [ordersState, setOrdersState] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [serviceRequestsState, setServiceRequestsState] = useState([]);
  const [totalServiceRequests, setTotalServiceRequests] = useState(0);
  const [clientsYear, setClientsYear] = useState([]);
  const [totalClients, setTotalClients] = useState(0);

  const [selectedMonthSalesPurchases, setSelectedMonthSalesPurchases] =
    useState<MonthSelection | null>(null);
  const [selectedMonthClients, setSelectedMonthClients] =
    useState<MonthSelection | null>(null);

  const availableYears = useMemo(
    () => Array.from({ length: 6 }, (_, i) => selectedYear - i),
    [],
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [
          sales,
          tSales,
          purch,
          tPurch,
          cats,
          ords,
          tOrds,
          reqs,
          tReqs,
          clis,
          tClis,
        ] = await Promise.all([
          dashboardApi.getSalesByYear(selectedYear),
          dashboardApi.getTotalSales(selectedYear),
          dashboardApi.getPurchasesByYear(selectedYear),
          dashboardApi.getTotalPurchases(selectedYear),
          dashboardApi.getCategoryProducts(selectedYear),
          dashboardApi.getOrdersByState(selectedYear),
          dashboardApi.getTotalOrders(selectedYear),
          dashboardApi.getServiceRequestsByState(selectedYear),
          dashboardApi.getTotalServiceRequests(selectedYear),
          dashboardApi.getClientsByYear(selectedYear),
          dashboardApi.getTotalClients(selectedYear),
        ]);

        setSalesYear(sales);
        setTotalSales(tSales.total);
        setPurchasesYear(purch);
        setTotalPurchases(tPurch.total);
        setCategoryProducts(
          (cats as any[]).map((c) => ({
            category: c.category,
            value: Number(c.value ?? 0),
          })),
        );
        setOrdersState(
          (ords ?? []).map((o: any) => ({
            ...o,
            state: translateDashboardState(o.state),
          })),
        );
        setTotalOrders(tOrds.total);
        setServiceRequestsState(
          (reqs ?? []).map((r: any) => ({
            ...r,
            state: translateDashboardState(r.state),
          })),
        );
        setTotalServiceRequests(tReqs.total);
        setClientsYear(clis);
        setTotalClients(tClis.total);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [selectedYear]);

  return (
    <div className="min-h-screen bg-[#E8E8E8]/30 p-4 lg:p-8 space-y-8 animate-in fade-in duration-700">
      {/* HEADER & SELECTOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-sm font-black text-[#B20000] uppercase tracking-[0.3em]">
            Resumen Ejecutivo
          </h2>
          <p className="text-[#717680] text-xs mt-1 font-medium italic">
            Datos actualizados al {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white border border-[#626262]/20 p-2 rounded-xl shadow-sm">
          <Filter size={16} className="text-[#B20000] ml-2" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-transparent text-sm font-bold text-[#0D141C] focus:outline-none pr-4"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* METRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Ventas Totales"
          value={formatCOP(totalSales)}
          icon={TrendingUp}
        />
        <StatCard
          title="Compras Invertidas"
          value={formatCOP(totalPurchases)}
          icon={ShoppingCart}
        />
        <StatCard
          title="Solicitudes Servicio"
          value={totalServiceRequests}
          icon={Calendar}
        />
        <StatCard
          title="Órdenes Gestión"
          value={totalOrders}
          icon={ClipboardList}
        />
      </div>

      {/* FILA DE GRÁFICAS PRINCIPALES */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-2xl border border-[#626262]/10 shadow-sm p-6 lg:p-8 transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-8 border-b border-[#626262]/10 pb-4">
            <h3 className="text-[12px] font-black uppercase tracking-[0.25em] text-[#0D141C]">
              Balance Financiero Anual
            </h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#B20000] rounded-sm" /> Ventas
              </span>
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#0D141C] rounded-sm" /> Compras
              </span>
            </div>
          </div>
          <div className="h-[400px]">
            {!selectedMonthSalesPurchases ? (
              <YearlySalesPurchasesGraph
                salesData={salesYear}
                purchasesData={purchasesYear}
                onMonthClick={setSelectedMonthSalesPurchases}
                isCurrency={true}
              />
            ) : (
              <MonthlySalesPurchasesGraph
                month={selectedMonthSalesPurchases.label}
                monthNumber={selectedMonthSalesPurchases.value}
                salesData={salesYear}
                purchasesData={purchasesYear}
                onBack={() => setSelectedMonthSalesPurchases(null)}
                isCurrency={true}
                year={selectedYear}
              />
            )}
          </div>
        </div>
      </div>

      {/* GRID DE DISTRIBUCIÓN Y ESTADOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categorías */}
        <div className="bg-white rounded-2xl border border-[#626262]/10 p-6 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#717680] mb-6">
            Distribución por Categoría
          </h3>
          <div className="h-[300px]">
            <PieChartCategoryAndProducts data={categoryProducts} />
          </div>
        </div>

        {/* Órdenes */}
        <div className="bg-white rounded-2xl border border-[#626262]/10 p-6 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#717680] mb-6">
            Estado de Órdenes
          </h3>
          <div className="h-[300px]">
            <CustomBarChart
              data={ordersState}
              xKey="state"
              bars={[
                { dataKey: "value", color: "#B20000", radius: [4, 4, 0, 0] },
              ]}
              height={280}
            />
          </div>
        </div>

        {/* Solicitudes */}
        <div className="bg-white rounded-2xl border border-[#626262]/10 p-6 shadow-sm">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#717680] mb-6">
            Estado de Solicitudes
          </h3>
          <div className="h-[300px]">
            <CustomBarChart
              data={serviceRequestsState}
              xKey="state"
              bars={[
                { dataKey: "value", color: "#0D141C", radius: [4, 4, 0, 0] },
              ]}
              height={280}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN CLIENTES */}
      <div className="bg-white rounded-2xl p-8 text-white shadow-xl overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <Image src="/icons/logo-bg.svg" alt="" width={400} height={400} />
        </div>
        <div className="relative z-10 h-[400px]">
          {!selectedMonthClients ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black uppercase tracking-widest text-[#B20000]">
                  Nuevos  Clientes
                </h3>
                <span className="bg-white/10 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {totalClients} Registrados
                </span>
              </div>
              <YearlyGraph
                title="Clientes"
                data={clientsYear}
                onMonthClick={setSelectedMonthClients}
                isCurrency={false}
              />
            </>
          ) : (
            <MonthlyGraph
              title="Detalle Mensual"
              month={selectedMonthClients.label}
              monthNumber={selectedMonthClients.value}
              data={clientsYear}
              onBack={() => setSelectedMonthClients(null)}
              isCurrency={false}
              year={selectedYear}
            />
          )}
        </div>
      </div>
    </div>
  );
};
