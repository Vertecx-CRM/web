"use client";
import { useState } from "react";
import Colors from "@/shared/theme/colors";
import { IPurchase } from "../Types/Purchase.type";
import {
  showSuccess,
  showWarning,
  showError,
} from "@/shared/utils/notifications";
import {
  validatePurchaseForm,
  validatePurchaseField,
  PurchaseErrors,
} from "../validations/purchasesValidations";
import { usePurchases } from "../hooks/usePurchases";
import { useLoader } from "@/shared/components/loader";

interface Props {
  onSave: (purchase: IPurchase) => void;
  onClose: () => void;
  purchases: IPurchase[];
}

const months = [
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

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

export default function RegisterPurchaseForm({
  onSave,
  onClose,
  purchases,
}: Props) {
  const {
    form,
    setForm,
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
    products,
    suppliers,
    handleAddPurchase, //  usamos la función del hook
  } = usePurchases();

  const [errors, setErrors] = useState<PurchaseErrors>({});
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(0);
  const { showLoader, hideLoader } = useLoader();

  /**  Valida un campo individual y actualiza el estado de errores */
  const handleFieldValidation = (
    field: keyof Omit<IPurchase, "id">,
    value: any
  ) => {
    const error = validatePurchaseField(field, value, purchases);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  /**  Al enviar el formulario */
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showWarning("⚠️ Agrega al menos un producto al carrito.");
      return;
    }

    const data = {
      numberoforder: form.orderNumber,
      invoiceNumber: form.invoiceNumber,
      reference: form.invoiceNumber,
      supplierid: Number(form.supplier),
      stateid: 1,
      amount: total,
      createdat: new Date().toISOString(),
      updatedat: new Date().toISOString(),
    };

    const dataForValidation = {
      orderNumber: form.orderNumber,
      invoiceNumber: form.invoiceNumber,
      supplier: form.supplier,
      registerDate:
        form.year && form.month && form.day
          ? `${form.year}-${form.month}-${form.day}`
          : "",
      amount: total,
      status: "Aprobado",
      description: form.description,
    };

    const validationErrors = validatePurchaseForm(
      dataForValidation as any,
      purchases ?? []
    );

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showError("Corrige los errores antes de guardar.");
      return;
    }

    try {
      showLoader();

      const savedPurchase = await handleAddPurchase();

      showSuccess("✅ Compra registrada con éxito.");

      onSave(savedPurchase as IPurchase);
      onClose();
    } catch (error) {
      console.error(error);
      showError("❌ Error al registrar la compra. Inténtalo de nuevo.");
    } finally {
      hideLoader();
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-5 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto rounded"
    >
      {/*  Fecha */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha de Registro <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <select
            name="day"
            onChange={(e) => {
              handleChange(e);
              handleFieldValidation("createdAt", form.createdAt);
            }}
            required
            className={`rounded-md border px-2 py-2 text-sm w-full ${
              errors.createdAt ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Día</option>
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            name="month"
            onChange={(e) => {
              handleChange(e);
              handleFieldValidation("createdAt", form.createdAt);
            }}
            required
            className={`rounded-md border px-2 py-2 text-sm w-full ${
              errors.createdAt ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Mes</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            name="year"
            onChange={(e) => {
              handleChange(e);
              handleFieldValidation("createdAt", form.createdAt);
            }}
            required
            className={`rounded-md border px-2 py-2 text-sm w-full ${
              errors.createdAt ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Año</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        {errors.createdAt && (
          <p className="text-xs text-red-500 mt-1">{errors.createdAt}</p>
        )}
      </div>

      {/* N° Orden y Proveedor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1 font-medium">
            N° de Orden <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="orderNumber"
            value={form.orderNumber}
            readOnly
            className={`w-full rounded-md border px-2 py-2 text-sm bg-gray-100 ${
              errors.orderNumber ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.orderNumber && (
            <p className="text-xs text-red-500">{errors.orderNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">
            Proveedor <span className="text-red-500">*</span>
          </label>
          <select
            name="supplier"
            value={form.supplier}
            onChange={(e) => {
              handleChange(e);
              handleFieldValidation("supplier", e.target.value);
            }}
            className={`w-full rounded-md border px-2 py-2 text-sm ${
              errors.supplier ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Selecciona el proveedor</option>
            {suppliers.map((s) => (
              <option key={s.supplierid} value={s.supplierid}>
                {s.name} - {s.nit}
              </option>
            ))}
          </select>

          {errors.supplier && (
            <p className="text-xs text-red-500">{errors.supplier}</p>
          )}
        </div>
      </div>

      {/*  Número de Factura */}
      <div>
        <label className="block text-sm mb-1 font-medium">
          Número de Factura <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="FAC-2025-1001"
          name="invoiceNumber"
          value={form.invoiceNumber}
          onChange={(e) => {
            handleChange(e);
            handleFieldValidation("invoiceNumber", e.target.value);
          }}
          className={`w-full rounded-md border px-2 py-2 text-sm ${
            errors.invoiceNumber ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.invoiceNumber && (
          <p className="text-xs text-red-500">{errors.invoiceNumber}</p>
        )}
      </div>

      {/*  Total */}
      <div>
        <label className="block text-sm mb-1 font-medium">
          Total <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formatCOP(total)}
          readOnly
          className={`w-full rounded-md border px-2 py-2 text-sm bg-gray-100 ${
            errors.amount ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.amount && (
          <p className="text-xs text-red-500">{errors.amount}</p>
        )}
      </div>

      {/*  Descripción */}
      <div>
        <label className="block text-sm mb-1 font-medium">Descripción</label>
        <textarea
          name="description"
          onChange={(e) => {
            handleChange(e);
            handleFieldValidation("description", e.target.value);
          }}
          rows={3}
          className={`w-full rounded-md border px-2 py-2 text-sm resize-none ${
            errors.description ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Ingrese sus observaciones"
        ></textarea>
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      {/*  Productos */}
      <div className="p-3 border rounded-lg bg-gray-50">
        <label className="block text-sm mb-2">
          Productos <span className="text-red-500">*</span>
        </label>

        {/* Toggle Seleccionar / Crear */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setIsNewProduct(false)}
            className={`text-xs px-2 py-1 rounded cursor-pointer ${
              !isNewProduct ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Seleccionar
          </button>

          <button
            type="button"
            onClick={() => setIsNewProduct(true)}
            className={`text-xs px-2 py-1 rounded cursor-pointer ${
              isNewProduct ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Crear producto
          </button>
        </div>

        {/* Modo selección */}
        {!isNewProduct ? (
          <div className="flex flex-col sm:flex-col gap-2">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="flex-1 rounded-md border px-2 py-2 text-sm"
            >
              <option value="">Selecciona un producto</option>
              {products.map((p) => (
                <option key={p.productid} value={p.productid}>
                  {p.productname} - {formatCOP(p.productpriceofsale)}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full sm:w-28 rounded-md border px-2 py-2 text-center text-sm"
            />
          </div>
        ) : (
          /* Modo crear producto */
          <div className="flex flex-col sm:flex-col gap-2">
            <input
              type="text"
              placeholder="Nombre del producto"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              className="flex-1 rounded-md border px-2 py-2 text-sm"
            />

            <input
              type="number"
              placeholder="Precio proveedor"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(Number(e.target.value))}
              className="w-full sm:w-40 rounded-md border px-2 py-2 text-sm"
            />

            <input
              type="number"
              value={quantity}
              min={1}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full sm:w-28 rounded-md border px-2 py-2 text-center text-sm"
            />
          </div>
        )}

        {/* Botón original */}
        <button
          type="button"
          onClick={() => {
            if (!isNewProduct && !selectedProduct) return;

            if (isNewProduct && (!newProductName || newProductPrice <= 0)) {
              showWarning("Completa los datos del nuevo producto.");
              return;
            }

            handleAddProduct({
              isNew: isNewProduct,
              productName: newProductName,
              supplierPrice: newProductPrice,
              selectedProduct: selectedProduct,
              quantity: quantity,
            });

            showSuccess("Producto agregado al carrito 🛒");
          }}
          style={{ backgroundColor: Colors.buttons.primary }}
          className="cursor-pointer mt-3 w-full px-3 py-2 rounded-md text-white text-sm hover:bg-opacity-90 transition hover:scale-103"
        >
          Añadir más productos +
        </button>
      </div>

      {/*  Botones */}
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className=" cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
