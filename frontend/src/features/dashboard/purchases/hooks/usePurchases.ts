"use client";
import { useState, useMemo, useEffect } from "react";
import { IPurchase } from "../Types/Purchase.type";
import { v4 as uuidv4 } from "uuid";
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

// Precios + stock de productos
const products: Record<string, Product> = {
  "Cámara Hivision": { price: 500000, stock: 5 },
  "Disco Duro 1TB": { price: 250000, stock: 10 },
  "Router Mikrotik": { price: 400000, stock: 3 },
  "Switch TP-Link 24p": { price: 350000, stock: 4 },
  "Cable UTP Cat6": { price: 500, stock: 100 },
  "Laptop Dell XPS": { price: 1200, stock: 2 },
};
export const suppliers = ["Proveedor A", "Proveedor B", "Proveedor C"];

export function usePurchases(
  purchases: IPurchase[],
  onSave: (p: IPurchase) => void
) {
  const currentYear = new Date().getFullYear();

  // 🧾 Generar número de orden secuencial
  const generateNextOrderNumber = () => {
    const year = currentYear;
    const currentYearOrders = purchases
      .filter((p) => p.orderNumber.includes(`OC-${year}-`))
      .map((p) => p.orderNumber);

    if (currentYearOrders.length === 0) return `OC-${year}-001`;

    const maxConsecutive = Math.max(
      ...currentYearOrders.map((o) => parseInt(o.split("-")[2]))
    );
    const nextConsecutive = (maxConsecutive + 1).toString().padStart(3, "0");
    return `OC-${year}-${nextConsecutive}`;
  };

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
  });

  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [cart, setCart] = useState<
    { name: string; qty: number; price: number }[]
  >([]);

  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const daysInMonth = useMemo(() => {
    if (!form.month || !form.year) return 31;
    const monthIndex = months.indexOf(form.month);
    return new Date(Number(form.year), monthIndex + 1, 0).getDate();
  }, [form.month, form.year]);

  useEffect(() => {
    setForm((prev) => ({ ...prev, orderNumber: generateNextOrderNumber() }));
  }, []);

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
    setQuantity(1);
  };

  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

    const newPurchase: IPurchase = {
      id: uuidv4(), // ✅ generamos un id único
      ...form,
      registerDate,
      amount: total,
    };

    onSave(newPurchase);

    // Reset form
    setForm({
      orderNumber: generateNextOrderNumber(),
      invoiceNumber: "",
      supplier: "",
      registerDate: "",
      amount: 0,
      status: "Aprobado",
      day: "",
      month: "",
      year: "",
    });
    setCart([]);
  };

  return {
    form,
    setForm,
    error,
    selectedProduct,
    setSelectedProduct,
    quantity,
    setQuantity,
    cart,
    years,
    daysInMonth,
    total,
    handleChange,
    handleAddProduct,
    handleSubmit,
    products,
    suppliers,
  };
}
