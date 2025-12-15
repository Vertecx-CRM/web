"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ISale } from "../types/Sales.type";
import {
  getSales,
  createSale,
  cancelSale,
  getProductsForSale,
  getCustomersForSale,
} from "../api/sales.api";
import { saleValidationSchema } from "../validations/salesValidations";

/* =======================
   TIPOS
======================= */
export interface SaleFormState {
  salecode: string;
  customerid: string;
  saledate: string; // yyyy-mm-dd
  salestatus: "Pending" | "Completed" | "Cancelled";
  notes: string;
  paymentmethod: string;
}

type CartItem = {
  productid: number;
  productname: string;
  quantity: number;
  unitprice: number;
};

/* =======================
   HOOK
======================= */
export function useSales() {
  /* ---------- STATE ---------- */
  const [sales, setSales] = useState<ISale[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
     CÁLCULOS
  ======================== */
  const subtotal = useMemo(
    () => cart.reduce((acc, p) => acc + p.quantity * p.unitprice, 0),
    [cart]
  );

  const taxamount = useMemo(() => Math.round(subtotal * 0.19), [subtotal]);

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
    } catch {
      toast.error("No se pudieron cargar las ventas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getProductsForSale().then(setProducts);
    getCustomersForSale().then(setCustomers);
    fetchSales();
    return () => abortRef.current?.abort();
  }, [fetchSales]);

  /* =======================
     HANDLERS
  ======================== */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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
     VALIDACIÓN (YUP)
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
      err.inner?.forEach((e: any) => toast.error(e.message));
      return false;
    }
  };

  /* =======================
     CREAR VENTA
  ======================== */
  const handleCreateSale = async () => {
    if (!(await validateCreate())) return;

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
      toast.error(err?.response?.data?.message || "Error al crear la venta");
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
    customers,
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
