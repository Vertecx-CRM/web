"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getPurchases,
  createPurchase,
  cancelPurchase,
  getProductsForPurchase,
  getSuppliersForPurchase,
} from "../api/purchases.api";
import { IPurchase } from "../Types/Purchase.type";

export interface PurchaseFormState {
  orderNumber: string;
  invoiceNumber: string;
  supplier: string;
  registerDate: string;
  amount: number;
  status: string;
  day: string;
  month: string;
  year: string;
  description: string;
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
let CACHE: IPurchase[] | null = null;

export function usePurchases() {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [cancelLoading, setCancelLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<PurchaseFormState>({
    orderNumber: "",
    invoiceNumber: "",
    supplier: "",
    registerDate: "",
    amount: 0,
    status: "Aprobado",
    day: "",
    month: "",
    year: "",
    description: "",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsForPurchase();
        setProducts(data);
      } catch (err) {
        console.error("Error cargando productos", err);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const data = await getSuppliersForPurchase();
        const actives = data.filter((s: any) => s.stateid === 1);
        setSuppliers(actives);
      } catch (err) {
        console.error("Error cargando proveedores", err);
      }
    };

    fetchSuppliers();
  }, []);

  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<
    {
      isNew: boolean;
      productid?: number;
      productname?: string;
      description?: string;
      productpriceofsupplier?: number;
      quantity: number;
      unitprice: number;
    }[]
  >([]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 6 }, (_, i) => currentYear - i),
    []
  );

  const daysInMonth = useMemo(() => {
    if (!form.month || !form.year) return 31;
    const monthIndex = months.indexOf(form.month);
    return new Date(Number(form.year), monthIndex + 1, 0).getDate();
  }, [form.month, form.year]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitprice, 0),
    [cart]
  );

  const generateNextOrderNumber = (data: IPurchase[]) => {
    const year = new Date().getFullYear();
    const currentYearOrders = data
      .map((p) => p.numberoforder || p.orderNumber)
      .filter((n) => n?.includes(`ORD-${year}-`));

    if (currentYearOrders.length === 0) return `ORD-${year}-001`;

    const maxConsecutive = Math.max(
      ...currentYearOrders.map((o) => parseInt(o.split("-")[2]))
    );
    const nextConsecutive = (maxConsecutive + 1).toString().padStart(3, "0");
    return `ORD-${year}-${nextConsecutive}`;
  };

  const abortRef = useRef<AbortController | null>(null);

  const fetchPurchases = useCallback(async () => {
    if (CACHE) {
      setPurchases(CACHE);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await getPurchases(controller.signal);
      CACHE = data;
      setPurchases(data);

      const nextOrder = generateNextOrderNumber(data);
      setForm((prev) => ({ ...prev, orderNumber: nextOrder }));
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        console.error("Error fetching purchases:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "invoiceNumber") validateInvoiceYear(value, form.year);
    if (name === "year" && form.invoiceNumber)
      validateInvoiceYear(form.invoiceNumber, value);
  };

  const validateInvoiceYear = (invoice: string, year: string) => {
    const match = invoice.match(/^FAC-(\d{4})-\d{4}$/);
    if (match) {
      const invoiceYear = match[1];
      if (year && invoiceYear !== year) {
        setError(
          `⚠️ El año de la factura (${invoiceYear}) no coincide con la fecha seleccionada (${year}).`
        );
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  const handleAddProduct = ({
    isNew,
    productName,
    supplierPrice,
    selectedProduct,
    quantity,
    description,
  }: any) => {
    if (!isNew) {
      const product = products.find(
        (p) => p.productid === Number(selectedProduct)
      );
      if (!product) return;

      setCart((prev) => [
        ...prev,
        {
          isNew: false,
          productid: product.productid,
          quantity,
          unitprice: product.productpriceofsupplier,
          description,
        },
      ]);
    } else {
      setCart((prev) => [
        ...prev,
        {
          isNew: true,
          productname: productName,
          productpriceofsupplier: supplierPrice,
          quantity,
          unitprice: supplierPrice,
          description,
        },
      ]);
    }
  };

  const handleAddPurchase = async () => {
    if (cart.length === 0) {
      setError("⚠️ Agrega al menos un producto.");
      return;
    }

    setSaving(true);

    const day = form.day.padStart(2, "0");
    const month = (months.indexOf(form.month) + 1).toString().padStart(2, "0");
    const year = form.year;
    const created = `${year}-${month}-${day}`;

    const payload = {
      numberoforder: form.orderNumber,
      reference: form.invoiceNumber,
      supplierid: Number(form.supplier),
      stateid: 3,
      createdat: created,
      updatedat: new Date().toISOString(),
      products: cart.map((item) => ({
        productid: item.productid ?? 0,
        quantity: item.quantity,
        unitprice: item.unitprice,
        productname: item.productname,
        productpriceofsupplier: item.productpriceofsupplier,
        description: item.description || "",
      })),
    };

    try {
      const res = await createPurchase(payload);
      await fetchPurchases();
      setCart([]); // limpiar carrito
      return res;
    } catch (err) {
      console.error(err);
      setError("❌ Error al registrar la compra.");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPurchase = async (id: number) => {
    try {
      setCancelLoading(true);
      await cancelPurchase(id);
      await fetchPurchases();
    } catch (error) {
      console.error("Error canceling purchase:", error);
      throw error;
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    return () => abortRef.current?.abort();
  }, [fetchPurchases]);

  return {
    purchases,
    loading,
    saving,

    form,
    setForm,
    error,
    setError,

    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    cart,
    setCart,
    total,

    products,
    suppliers,
    years,
    daysInMonth,
    cancelLoading,

    handleChange,
    handleAddProduct,
    handleAddPurchase,
    handleCancelPurchase,
  };
}
