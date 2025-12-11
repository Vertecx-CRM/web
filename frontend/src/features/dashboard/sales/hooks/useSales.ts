"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getSales,
  createSale,
  getProductsForSale,
  getCustomersForSale,
} from "../api/sales.api";
import { ISale } from "../types/Sales.type";

import {
  validateSaleField,
  validateSaleProducts,
  validateSaleForm,
  SaleErrors,
} from "../validations/salesValidations";

export interface SaleFormState {
  salecode: string;
  customerid: string;
  saledate: string;
  notes: string;
  paymentmethod: string;
}

export function useSales() {
  const [sales, setSales] = useState<ISale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const [errors, setErrors] = useState<SaleErrors>({});

  const [form, setForm] = useState<SaleFormState>({
    salecode: "",
    customerid: "",
    saledate: "",
    notes: "",
    paymentmethod: "Efectivo",
  });

  const subtotal = useMemo(
    () => cart.reduce((acc, p) => acc + p.quantity * p.unitprice, 0),
    [cart]
  );

  const taxamount = Math.round(subtotal * 0.19);
  const totalamount = subtotal + taxamount;

  // ============================
  // FETCH SALES
  // ============================
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
    getProductsForSale().then(setProducts);
    getCustomersForSale().then(setCustomers);
    fetchSales();
    return () => abortRef.current?.abort();
  }, [fetchSales]);

  // ============================
  // HANDLE CHANGE + VALIDACIÓN
  // ============================
  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));

    const fieldError = validateSaleField(
      name as keyof SaleErrors,
      value,
      sales
    );

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  // ============================
  // HANDLE CREATE SALE
  // ============================
  const handleCreateSale = async () => {
    const formErrors = validateSaleForm(form, sales, cart);
    setErrors(formErrors);

    const hasErrors = Object.values(formErrors).some((e) => e);
    if (hasErrors) throw new Error("Errores en el formulario");

    setSaving(true);

    const dateISO = new Date(form.saledate).toISOString();

    const payload = {
      subtotal,
      taxamount,
      discountamount: 0,
      totalamount,
      saledate: dateISO,
      customerid: Number(form.customerid),
      salecode: form.salecode,
      createdby: "admin",
      notes: form.notes,
      paymentmethod: form.paymentmethod,
      salestatus: "Pending",
      details: cart.map((item) => ({
        productid: item.productid,
        quantity: item.quantity,
        unitprice: item.unitprice,
        discountpercent: 0,
        notes: "",
      })),
      taxpercent: 19,
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
    customers,
    cart,
    setCart,
    subtotal,
    taxamount,
    totalamount,
    errors,
    setErrors,
    handleChange,
    handleCreateSale,
  };
}
