import * as Yup from "yup";



  // VALIDACIÓN DE ITEMS (CART)

export const saleItemValidationSchema = Yup.object({
  productid: Yup.number()
    .typeError("El producto es inválido")
    .required("Debe seleccionar un producto válido"),

  quantity: Yup.number()
    .typeError("La cantidad debe ser numérica")
    .integer("La cantidad debe ser un número entero")
    .positive("La cantidad debe ser mayor a 0")
    .required("La cantidad es obligatoria"),

  unitprice: Yup.number()
    .typeError("El precio debe ser numérico")
    .positive("El precio debe ser mayor a 0")
    .required("El precio es obligatorio"),
});



  // VALIDACIÓN DE LA VENTA

export const saleValidationSchema = Yup.object({
  salecode: Yup.string()
    .trim()
    .required("Debe ingresar el código de la venta"),

  customerid: Yup.number()
    .typeError("Debe seleccionar un cliente válido")
    .required("El cliente es obligatorio"),

  saledate: Yup.date()
    .typeError("Debe seleccionar una fecha válida")
    .max(new Date(), "La fecha no puede ser futura")
    .required("La fecha de la venta es obligatoria"),

  salestatus: Yup.mixed<"Pending" | "Completed" | "Cancelled">()
    .oneOf(["Pending", "Completed", "Cancelled"])
    .required(),

  paymentmethod: Yup.string().required("Debe seleccionar el método de pago"),

  notes: Yup.string().nullable(),

  cart: Yup.array()
    .of(saleItemValidationSchema)
    .min(1, "Debe agregar al menos un producto")
    .required("Debe agregar productos a la venta"),
});