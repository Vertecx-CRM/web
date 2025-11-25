"use client";
import { useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getPurchases,
  createPurchase,
  cancelPurchase,
  getProductsForPurchase,
  getSuppliersForPurchase,
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

export function usePurchases() {
  const [purchases, setPurchases] = useState<IPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  /**  Catálogo de productos */
  const [products, setProducts] = useState<any[]>([]);

  /**  Catálogo de proveedores */
  const [suppliers, setSuppliers] = useState<any[]>([]);

  /**  Formulario principal */
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

        // ✅ solo proveedores activos
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
      productpriceofsupplier?: number;
      quantity: number;
      unitprice: number;
    }[]
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

  /**  Calcular total */
  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.unitprice, 0),
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

  /**  Cargar compras desde backend */
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

  /**    Agregar producto */
  const handleAddProduct = ({
    isNew,
    productName,
    supplierPrice,
    selectedProduct,
    quantity,
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
        },
      ]);
    }
  };

  /**  Registrar compra (backend) */
  const handleAddPurchase = async () => {
    if (cart.length === 0) {
      setError("⚠️ Agrega al menos un producto.");
      return;
    }

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
      })),
    };

    try {
      const res = await createPurchase(payload);
      await fetchPurchases();
      return res;
    } catch (err) {
      console.error(err);
      setError("❌ Error al registrar la compra.");
      throw err;
    }
  };

  /**  Cancelar compra */
  const handleCancelPurchase = async (id: number) => {
    try {
      await cancelPurchase(id);
      await fetchPurchases();
    } catch (error) {
      console.error("Error canceling purchase:", error);
      throw error;
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
