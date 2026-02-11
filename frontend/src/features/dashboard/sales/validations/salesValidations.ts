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


   //VALIDACIÓN ITEMS
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


  // VALIDACIÓN FORMULARIO
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

export interface SaleErrors {
  salecode?: string;
  customerid?: string;
  saledate?: string;
  notes?: string;
  paymentmethod?: string;
  products?: string;
}

export type SaleFormData = {
  salecode: string;
  customerid: string;
  saledate: string;
  notes: string;
  paymentmethod: string;
};

export const validateSaleField = (
  field: keyof SaleErrors,
  value: any,
  sales: ISale[] = [],
  currentId?: number
): string | undefined => {
  switch (field) {
    case "salecode": {
      const code = String(value ?? "").trim();
      if (!code) return "El cÃ³digo de venta es obligatorio";
      if (
        (sales ?? []).some(
          (s) =>
            String(s.salecode ?? "").trim().toLowerCase() ===
              code.toLowerCase() && s.saleid !== currentId
        )
      ) {
        return "Ya existe una venta con este cÃ³digo";
      }
      return;
    }

    case "customerid":
      if (!value) return "Debe seleccionar un cliente";
      if (Number(value) <= 0 || Number.isNaN(Number(value)))
        return "Cliente invÃ¡lido";
      return;

    case "saledate":
      if (!value) return "La fecha de venta es obligatoria";
      if (new Date(value) > new Date())
        return "La fecha de venta no puede ser futura";
      return;

    case "paymentmethod":
      if (!value) return "Debe seleccionar un mÃ©todo de pago";
      return;

    case "notes":
      if (value && String(value).length > 300)
        return "Las observaciones no pueden superar los 300 caracteres";
      return;

    default:
      return;
  }
};

export const validateSaleProducts = (cart: CartItem[] = []): string | undefined => {
  if (!cart || cart.length === 0) return "Debe agregar al menos un producto";

  const ids = cart.map((i) => i.productid);
  if (new Set(ids).size !== ids.length)
    return "No puede agregar el mismo producto mÃ¡s de una vez";

  for (const item of cart) {
    if (!item.productid) return "El producto es obligatorio";
    if (!item.quantity || item.quantity <= 0)
      return "La cantidad debe ser mayor que 0";
    if (!item.unitprice || item.unitprice <= 0)
      return "El precio unitario debe ser mayor que 0";
    if (
      item.productstock !== undefined &&
      item.productstock !== null &&
      item.quantity > item.productstock
    ) {
      return "Cantidad supera el stock disponible";
    }
  }

  return;
};

export const validateSaleForm = (
  data: SaleFormData,
  sales: ISale[] = [],
  cart: CartItem[] = [],
  currentId?: number
): SaleErrors => {
  const errors: SaleErrors = {};

  const fields: (keyof SaleErrors)[] = [
    "salecode",
    "customerid",
    "saledate",
    "paymentmethod",
    "notes",
  ];

  fields.forEach((field) => {
    const error = validateSaleField(
      field,
      (data as any)[field],
      sales ?? [],
      currentId
    );
    if (error) errors[field] = error;
  });

  const productsError = validateSaleProducts(cart);
  if (productsError) errors.products = productsError;

  return errors;
};
