import * as Yup from "yup";
import { ISale } from "../types/Sales.type";

// TIPOS AUXILIARES
export interface CartItem {
  productid: number;
  productname: string;
  quantity: number;
  unitprice: number;
  productstock?: number;
}

export interface SaleErrors {
  salecode?: string;
  customerid?: string;
  saledate?: string;
  paymentmethod?: string;
  notes?: string;
  products?: string;
}

// VALIDACIÓN ITEMS (esquema Yup, por si se usa en formularios externos)
const cartItemSchema = Yup.object().shape({
  productid: Yup.number()
    .required("El producto es obligatorio")
    .positive("Producto inválido"),

  productname: Yup.string().required(),

  quantity: Yup.number()
    .required("La cantidad es obligatoria")
    .integer("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor que 0"),

  unitprice: Yup.number()
    .required("El precio unitario es obligatorio")
    .positive("El precio unitario debe ser mayor que 0"),

  productstock: Yup.number()
    .nullable()
    .notRequired()
    .test(
      "stock",
      "Cantidad supera el stock disponible",
      function (value) {
        const quantity = (this.parent as any).quantity;
        if (value === undefined || value === null) return true;
        return quantity <= value;
      }
    ),
});

// VALIDACIÓN FORMULARIO (esquema Yup)
export const saleValidationSchema = Yup.object({
  salecode: Yup.string()
    .trim()
    .required("El código de venta es obligatorio"),

  customerid: Yup.number()
    .typeError("Debe seleccionar un cliente")
    .required("Debe seleccionar un cliente")
    .positive("Cliente inválido"),

  saledate: Yup.date()
    .required("La fecha de venta es obligatoria")
    .max(new Date(), "La fecha de venta no puede ser futura"),

  paymentmethod: Yup.string()
    .required("Debe seleccionar un método de pago")
    .oneOf(
      ["Efectivo", "Transferencia", "Tarjeta"],
      "Método de pago inválido"
    ),

  notes: Yup.string()
    .max(300, "Las observaciones no pueden superar los 300 caracteres")
    .nullable(),

  cart: Yup.array()
    .of(cartItemSchema)
    .min(1, "Debe agregar al menos un producto")
    .test(
      "no-duplicates",
      "No puede agregar el mismo producto más de una vez",
      (cart) => {
        if (!cart) return true;
        const ids = cart.map((i) => i.productid);
        return new Set(ids).size === ids.length;
      }
    ),
});

// VALIDACIONES IMPERATIVAS (usadas en hooks/componentes)
export const validateSaleProducts = (
  cart: CartItem[] = []
): string | undefined => {
  if (!cart || cart.length === 0) {
    return "Debe agregar al menos un producto";
  }

  const ids = cart.map((item) => item.productid);
  if (new Set(ids).size !== ids.length) {
    return "No puede agregar el mismo producto más de una vez";
  }

  const invalidQty = cart.find(
    (item) => !Number.isInteger(item.quantity) || item.quantity <= 0
  );
  if (invalidQty) {
    return "La cantidad debe ser un número entero mayor que 0";
  }

  const invalidPrice = cart.find((item) => item.unitprice <= 0);
  if (invalidPrice) {
    return "El precio unitario debe ser mayor que 0";
  }

  const stockExceeded = cart.find(
    (item) =>
      item.productstock !== undefined &&
      item.productstock !== null &&
      item.quantity > item.productstock
  );
  if (stockExceeded) {
    return `Cantidad supera el stock disponible para ${
      stockExceeded.productname || "el producto"
    }`;
  }

  return;
};

export const validateSaleField = (
  field: keyof SaleErrors,
  value: any,
  sales: ISale[] = [],
  currentSaleId?: number
): string | undefined => {
  switch (field) {
    case "salecode": {
      const code = String(value ?? "").trim();
      if (!code) return "El código de venta es obligatorio";
      const duplicate = (sales ?? []).some(
        (s) =>
          (s.salecode ?? "").toLowerCase() === code.toLowerCase() &&
          s.saleid !== currentSaleId
      );
      if (duplicate) return "Ya existe una venta con este código";
      return;
    }

    case "customerid": {
      const hasCustomer = String(value ?? "").trim();
      if (!hasCustomer) return "Debe seleccionar un cliente";
      if (Number(hasCustomer) <= 0) return "Cliente inválido";
      return;
    }

    case "saledate": {
      if (!value) return "La fecha de venta es obligatoria";
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) return "Fecha de venta inválida";
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateValue > today) return "La fecha de venta no puede ser futura";
      return;
    }

    case "paymentmethod": {
      const method = String(value ?? "").trim();
      if (!method) return "Debe seleccionar un método de pago";
      const allowed = ["Efectivo", "Transferencia", "Tarjeta", "Cash", "Card", "Credit Card"];
      if (!allowed.includes(method)) return "Método de pago inválido";
      return;
    }

    case "notes": {
      const notes = String(value ?? "");
      if (notes.length > 300)
        return "Las observaciones no pueden superar los 300 caracteres";
      return;
    }

    case "products": {
      // Se valida con validateSaleProducts
      return;
    }

    default:
      return;
  }
};

export const validateSaleForm = (
  form: {
    salecode: string;
    customerid: string;
    saledate: string;
    notes?: string;
    paymentmethod?: string;
  },
  sales: ISale[] = [],
  cart: CartItem[] = [],
  currentSaleId?: number
): SaleErrors => {
  const errors: SaleErrors = {};

  const saleCodeError = validateSaleField(
    "salecode",
    form.salecode,
    sales,
    currentSaleId
  );
  if (saleCodeError) errors.salecode = saleCodeError;

  const customerError = validateSaleField(
    "customerid",
    form.customerid,
    sales,
    currentSaleId
  );
  if (customerError) errors.customerid = customerError;

  const dateError = validateSaleField(
    "saledate",
    form.saledate,
    sales,
    currentSaleId
  );
  if (dateError) errors.saledate = dateError;

  const paymentError = validateSaleField(
    "paymentmethod",
    form.paymentmethod,
    sales,
    currentSaleId
  );
  if (paymentError) errors.paymentmethod = paymentError;

  const notesError = validateSaleField(
    "notes",
    form.notes,
    sales,
    currentSaleId
  );
  if (notesError) errors.notes = notesError;

  const productsError = validateSaleProducts(cart);
  if (productsError) errors.products = productsError;

  return errors;
};
