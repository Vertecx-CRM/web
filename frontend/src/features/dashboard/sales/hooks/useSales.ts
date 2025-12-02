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

let CACHE: ISale [] | null = null;

export function useSales() {
  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);

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
  const years = useMemo(
    () => Array.from({ length: 6 }, (_, i) => currentYear - i),
    []
  );

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

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = () => {
    const product = products.find(
      (p) => p.productid === Number(selectedProduct)
    );
    if (!product) return;

    setCart((prev) => [
      ...prev,
      {
        productid: product.productid,
        quantity,
        unitprice: product.productpriceofsale,
        discountpercent: discount,
        notes: "",
      },
    ]);
  };

  const handleCreateSale = async () => {
    if (cart.length === 0) throw new Error("Carrito vacío");

    setSaving(true);

    const date = `${form.year}-${(months.indexOf(form.month) + 1)
      .toString()
      .padStart(2, "0")}-${form.day.padStart(2, "0")}T05:00:00.000Z`;

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
      salestatus: "Completada",
      details: cart,
    };

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

    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    discount,
    setDiscount,

    years,
    daysInMonth,
    subtotal,
    taxamount,
    totalamount,

    handleChange,
    handleAddProduct,
    handleCreateSale,
  };
}
