"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getSales, createSale } from "../api/sales.api";
import { ISale } from "../types/Sales.type";
import { getProductsForPurchase } from "@/features/dashboard/purchases/api/purchases.api";

export interface SaleFormState {
  salecode: string;
  customerid: string;
  day: string;
  month: string;
  year: string;
  notes: string;
  paymentmethod: string;
}

export const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function useSales() {
  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const [form, setForm] = useState<SaleFormState>({
    salecode: "",
    customerid: "",
    day: "",
    month: "",
    year: "",
    notes: "",
    paymentmethod: "Efectivo",
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const daysInMonth = useMemo(() => {
    if (!form.month || !form.year) return 31;
    const idx = months.indexOf(form.month);
    return new Date(Number(form.year), idx + 1, 0).getDate();
  }, [form.month, form.year]);

  const subtotal = useMemo(
    () => cart.reduce((acc, p) => acc + p.quantity * p.unitprice, 0),
    [cart]
  );

  const taxamount = Math.round(subtotal * 0.19);
  const totalamount = subtotal + taxamount;

  // FETCH SALES
  const fetchSales = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const data = await getSales(controller.signal);
      setSales(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProductsForPurchase().then(setProducts);
    fetchSales();
    return () => abortRef.current?.abort();
  }, [fetchSales]);

  // FORM CHANGE
  const handleChange = (e: any) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Crear la venta FINAL
  const handleCreateSale = async () => {
    if (cart.length === 0) throw new Error("Carrito vacío");

    setSaving(true);

    const date = `${form.year}-${(months.indexOf(form.month) + 1)
      .toString()
      .padStart(2, "0")}-${form.day.padStart(2, "0")}T05:00:00.000Z`;

    // Construcción del payload EXACTO que pide el backend
    const payload = {
      subtotal,
      taxamount,
      discountamount: 0,
      totalamount,
      saledate: date,
      customerid: Number(form.customerid),
      salecode: form.salecode,
      createdby: "admin",
      notes: form.notes,
      paymentmethod: form.paymentmethod,
      salestatus: "Pending",
      details: cart.map((item) => ({
        productid: item.productid ?? null, // null si fue creado desde front
        quantity: item.quantity,
        unitprice: item.unitprice,
        discountpercent: item.discountpercent ?? 0,
        notes: item.notes ?? "",
      })),
      taxpercent: 19,
    };

    console.log("PAYLOAD FINAL:", payload);

    const res = await createSale(payload);
    await fetchSales();
    setCart([]);
    setSaving(false);

    return res;
  };

  return {
    sales,
    loading,
    saving,
    form,
    setForm,
    products,
    cart,
    setCart,
    years,
    daysInMonth,
    subtotal,
    taxamount,
    totalamount,
    handleChange,
    handleCreateSale,
  };
}
