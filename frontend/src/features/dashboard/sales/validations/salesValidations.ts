import { ISale } from "@/features/dashboard/sales/types/Sales.type";

export interface SaleErrors {
  salecode?: string;
  customerid?: string;
  saledate?: string;
  paymentmethod?: string;
  notes?: string;
  products?: string;
}

export interface CartItem {
  productid: number;
  productname: string;
  quantity: number;
  unitprice: number;
  productstock?: number;
}

/**
 * Valida un campo individual del formulario de venta
 */
export const validateSaleField = (
  field: keyof SaleErrors,
  value: any,
  sales: ISale[] = [],
  currentId?: number
): string | undefined => {
  switch (field) {

    case "salecode":
      const code = String(value || "").trim();
      if (!code) return "El código de venta es obligatorio";

      // validar unicidad
      if (
        sales.some((s) => s.salecode.toLowerCase() === code.toLowerCase() && s.saleid !== currentId)
      ) {
        return "Ya existe una venta con este código";
      }
      return;

    case "customerid":
      if (!value) return "Debe seleccionar un cliente";
      return;

    case "saledate":
      if (!value) return "La fecha de venta es obligatoria";

      const today = new Date();
      const dateValue = new Date(value);

      if (isNaN(dateValue.getTime())) {
        return "Fecha inválida";
      }

      if (dateValue > today) {
        return "La fecha de venta no puede ser futura";
      }

      return;

    case "paymentmethod":
      if (!value) return "Debe seleccionar un método de pago";

      if (!["Efectivo", "Transferencia", "Tarjeta"].includes(value)) {
        return "Método de pago inválido";
      }
      return;

    case "notes":
      if (value && String(value).length > 300) {
        return "Las observaciones no pueden superar los 300 caracteres";
      }
      return;

    default:
      return;
  }
};

/**
 * Validación del carrito de productos
 */
export const validateSaleProducts = (cart: CartItem[]): string | undefined => {
  if (!cart || cart.length === 0) {
    return "Debe agregar al menos un producto";
  }

  for (const item of cart) {
    if (!item.productid) {
      return `El producto "${item.productname}" no es válido`;
    }
    if (item.quantity <= 0) {
      return `La cantidad del producto "${item.productname}" debe ser mayor que 0`;
    }
    if (item.productstock !== undefined && item.quantity > item.productstock) {
      return `Stock insuficiente para "${item.productname}". Disponible: ${item.productstock}`;
    }
  }

  // Validar duplicados
  const ids = cart.map((c) => c.productid);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);

  if (duplicates.length > 0) {
    return "No puede agregar el mismo producto más de una vez";
  }

  return;
};

/**
 * Valida todo el formulario de venta
 */
export const validateSaleForm = (
  data: Omit<ISale, "saleid" | "details">,
  sales: ISale[],
  cart: CartItem[],
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

  // Validaciones de campos individuales
  fields.forEach((field) => {
    const error = validateSaleField(field, (data as any)[field], sales, currentId);
    if (error) errors[field] = error;
  });

  // Validación del carrito de productos
  const productError = validateSaleProducts(cart);
  if (productError) errors.products = productError;

  return errors;
};
