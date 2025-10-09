import * as Yup from "yup";

// Validaciones para ítems de venta
export const saleItemValidationSchema = Yup.object().shape({
  id: Yup.number().required("El identificador del ítem es obligatorio."),
  producto: Yup.string()
    .min(2, "El nombre del producto debe tener al menos 2 caracteres.")
    .max(100, "El nombre del producto no puede superar los 100 caracteres.")
    .required("El nombre del producto es obligatorio."),
  cantidad: Yup.number()
    .positive("La cantidad debe ser mayor que 0.")
    .integer("La cantidad debe ser un número entero.")
    .required("La cantidad del producto es obligatoria."),
  precioUnitario: Yup.number()
    .positive("El precio unitario debe ser mayor que 0.")
    .required("El precio unitario es obligatorio."),
  subtotal: Yup.number()
    .min(0, "El subtotal no puede ser negativo.")
    .required("El subtotal del ítem es obligatorio."),
});

// Validaciones para la venta principal
export const saleValidationSchema = Yup.object().shape({
  id: Yup.number().required("El identificador de la venta es obligatorio."),
  codigoVenta: Yup.string()
    .matches(
      /^VEN-\d{3}$/,
      "El código de venta debe tener el formato VEN-001, VEN-002, etc."
    )
    .required("El código de venta es obligatorio."),
  cliente: Yup.string()
    .min(3, "El nombre del cliente debe tener al menos 3 caracteres.")
    .max(100, "El nombre del cliente no puede superar los 100 caracteres.")
    .required("El nombre del cliente es obligatorio."),
  fecha: Yup.date()
    .max(new Date(), "La fecha de la venta no puede estar en el futuro.")
    .required("La fecha de la venta es obligatoria."),
  total: Yup.number()
    .min(0, "El total de la venta no puede ser negativo.")
    .required("El total de la venta es obligatorio."),
  estado: Yup.string()
    .oneOf(
      ["Finalizado", "Anulada", "Pendiente"],
      "El estado de la venta debe ser Finalizado, Anulada o Pendiente."
    )
    .required("El estado de la venta es obligatorio."),
  items: Yup.array()
    .of(saleItemValidationSchema)
    .min(1, "Debe existir al menos un ítem en la venta.")
    .required("La venta debe contener al menos un ítem."),
});

