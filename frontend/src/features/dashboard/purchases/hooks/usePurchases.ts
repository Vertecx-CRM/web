"use client";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getPurchases,
  createPurchase,
  cancelPurchase,
} from "../api/purchases.api";
import { IPurchase } from "../Types/Purchase.type";

/** Productos base */
interface Product {
  price: number;
  stock: number;
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

export const suppliers = ["Proveedor A", "Proveedor B", "Proveedor C"];

export function usePurchases() {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  /** 📦 Catálogo de productos */
  const [products] = useState<Record<string, Product>>({
    "Cámara Hivision": { price: 500000, stock: 5 },
    "Disco Duro 1TB": { price: 250000, stock: 10 },
    "Router Mikrotik": { price: 400000, stock: 3 },
    "Switch TP-Link 24p": { price: 350000, stock: 4 },
    "Cable UTP Cat6": { price: 500, stock: 100 },
    "Laptop Dell XPS": { price: 1200, stock: 2 },
  });

  /** 🧾 Formulario principal */
  const [form, setForm] = useState({
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

  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<
    { name: string; qty: number; price: number }[]
  >([]);

  /** 📅 Generar años (últimos 6) */
  const currentYear = new Date().getFullYear();
  const years = useMemo(
    () => Array.from({ length: 6 }, (_, i) => currentYear - i),
    []
  );

  /** 📅 Calcular días según mes y año seleccionados */
  const daysInMonth = useMemo(() => {
    if (!form.month || !form.year) return 31;
    const monthIndex = months.indexOf(form.month);
    return new Date(Number(form.year), monthIndex + 1, 0).getDate();
  }, [form.month, form.year]);

  /** 🧮 Calcular total */
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty * item.price, 0),
    [cart]
  );

  /** 🧠 Generar número de orden basado en backend */
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

  /** 🔄 Cargar compras desde backend */
  const fetchPurchases = async () => {
    try {
      const data = await getPurchases();
      setPurchases(data);

      const nextOrder = generateNextOrderNumber(data);
      setForm((prev) => ({ ...prev, orderNumber: nextOrder }));
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  /** ⚙️ Cambio de campos del formulario */
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

  /** 🧾 Validar coincidencia de año en factura */
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

  /** 🛒 Agregar producto */
  const handleAddProduct = () => {
    if (!selectedProduct || quantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((p) => p.name === selectedProduct);
      if (existing) {
        return prev.map((p) =>
          p.name === selectedProduct ? { ...p, qty: p.qty + quantity } : p
        );
      }
      return [
        ...prev,
        {
          name: selectedProduct,
          qty: quantity,
          price: products[selectedProduct].price,
        },
      ];
    });

    setSelectedProduct("");
    setQuantity(1);
  };

  /** ✅ Registrar compra (backend) */
  const handleAddPurchase = async () => {
    if (error) return;
    if (cart.length === 0) {
      setError("⚠️ Agrega al menos un producto al carrito.");
      return;
    }

    const day = form.day?.toString().padStart(2, "0");
    const monthIndex = months.indexOf(form.month) + 1;
    const month = monthIndex.toString().padStart(2, "0");
    const year = form.year;
    const registerDate = `${year}-${month}-${day}`;

    const newPurchase: Partial<IPurchase> = {
      numberoforder: form.orderNumber,
      reference: form.invoiceNumber,
      supplierid: Number(form.supplier),
      amount: total,
      createdat: registerDate,
      updatedat: new Date().toISOString(),
      stateid: 1, // Aprobado
    };

    try {
      await createPurchase(newPurchase);
      await fetchPurchases();
    } catch (error) {
      console.error("Error creating purchase:", error);
      setError("❌ No se pudo registrar la compra.");
    }
  };

  /** 🚫 Cancelar compra */
  const handleCancelPurchase = async (id: number) => {
    try {
      await cancelPurchase(id);
      await fetchPurchases();
    } catch (error) {
      console.error("Error canceling purchase:", error);
    }
  };

  /** Cargar compras al inicio */
  useEffect(() => {
    fetchPurchases();
  }, []);

  return {
    // Backend
    purchases,
    loading,

    // Formulario
    form,
    setForm,
    error,
    setError,

    // Carrito
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    cart,
    setCart,
    total,

    // Auxiliares
    products,
    suppliers,
    years,
    daysInMonth,

    // Acciones
    handleChange,
    handleAddProduct,
    handleAddPurchase,
    handleCancelPurchase,
  };
}
