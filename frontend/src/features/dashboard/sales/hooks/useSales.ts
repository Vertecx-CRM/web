"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { ISale } from "../types/Sales.type";
import { getProductsForPurchase } from "@/features/dashboard/purchases/api/purchases.api";
import { toast } from "react-toastify";
import { getSales, createSale, cancelSale } from "../api/sales.api";
import { saleValidationSchema } from "../validations/SalesValidations";

/* =======================
   TIPOS
======================= */
export interface SaleFormState {
  salecode: string;
  customerid: string;
  saledate: string; // yyyy-mm-dd (input date)
  salestatus: "Pending" | "Completed" | "Cancelled";
  notes: string;
  paymentmethod: string;
}

/* =======================
   HOOK
======================= */
export function useSales() {
  /* ---------- STATE ---------- */
  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<
    {
      productid: number;
      productname: string;
      quantity: number;
      unitprice: number;
    }[]
  >([]);

  const abortRef = useRef<AbortController | null>(null);

  const [form, setForm] = useState<SaleFormState>({
    salecode: "",
    customerid: "",
    saledate: "",
    salestatus: "Pending",
    notes: "",
    paymentmethod: "Efectivo",
  });

  /* =======================
     CÁLCULOS (FUENTE ÚNICA)
  ======================== */
  const subtotal = useMemo(
    () => cart.reduce((acc, p) => acc + p.quantity * p.unitprice, 0),
    [cart]
  );

  const taxamount = useMemo(
    () => Math.round(subtotal * 0.19),
    [subtotal]
  );

  const totalamount = useMemo(
    () => subtotal + taxamount,
    [subtotal, taxamount]
  );

  /* =======================
     FETCH SALES
  ======================== */
  const fetchSales = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const data = await getSales(controller.signal);
      setSales(data);
    } catch (err) {
      toast.error("No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProductsForPurchase().then(setProducts);
    fetchSales();
    return () => abortRef.current?.abort();
  }, [fetchSales]);

  /* =======================
     HANDLERS
  ======================== */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      salecode: "",
      customerid: "",
      saledate: "",
      salestatus: "Pending",
      notes: "",
      paymentmethod: "Efectivo",
    });
    setCart([]);
  };

  /* =======================
     VALIDACIÓN CON YUP
  ======================== */
  const validateCreate = async () => {
    try {
      await saleValidationSchema.validate(
        {
          ...form,
          customerid: Number(form.customerid),
          cart,
        },
        { abortEarly: false }
      );
      return true;
    } catch (err: any) {
      if (err.inner?.length) {
        err.inner.forEach((e: any) => toast.error(e.message));
      } else {
        toast.error(err.message);
      }
      return false;
    }
  };

  /* =======================
     CREAR VENTA
  ======================== */
  const handleCreateSale = async () => {
    if (!(await validateCreate())) return;

    // Regla de negocio: no permitir productos sin ID real
    if (cart.some((item) => !item.productid)) {
      toast.error("Todos los productos deben existir en el sistema");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        salecode: form.salecode.trim(),
        customerid: Number(form.customerid),
        saledate: form.saledate,
        salestatus: form.salestatus,
        paymentmethod: form.paymentmethod,
        notes: form.notes || null,

        taxpercent: 19,
        discountamount: 0,

        details: cart.map((item) => ({
          productid: item.productid,
          quantity: item.quantity,
          unitprice: item.unitprice,
          discountpercent: 0,
        })),
      };

      await createSale(payload);
      toast.success("Venta creada correctamente");

      resetForm();
      await fetchSales();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Error al crear la venta"
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================
     ANULAR VENTA
  ======================== */
  const handleCancelSale = async (saleid: number, observation: string) => {
    try {
      await cancelSale(saleid, { observation });
      toast.success("Venta anulada correctamente");
      await fetchSales();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "No se pudo anular la venta"
      );
    }
  };

  /* =======================
     RETURN
  ======================== */
  return {
    // data
    sales,
    products,
    cart,

    // state
    loading,
    saving,
    form,

    // computed
    subtotal,
    taxamount,
    totalamount,

    // setters
    setForm,
    setCart,

    // actions
    handleChange,
    handleCreateSale,
    handleCancelSale,
    fetchSales,
  };
}

export type UseSalesReturn = ReturnType<typeof useSales>;