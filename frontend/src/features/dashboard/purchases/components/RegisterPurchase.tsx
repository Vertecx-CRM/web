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
import { useLoader } from "@/shared/components/loader";
import { months, PurchaseFormState } from "../hooks/usePurchases";

const DEFAULT_SUPPLIER_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/1698/1698535.png";

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

type CartItem = {
  isNew: boolean;
  productid?: number;
  productname?: string;
  description?: string;
  productpriceofsupplier?: number;
  saleprice?: number;
  quantity: number;
  unitprice: number;
};

interface Props {
  onSave: () => Promise<any>;
  onClose: () => void;
  purchases: IPurchase[];
  fetchPurchases: () => Promise<void>;
  form: PurchaseFormState;
  selectedProduct: string;
  setSelectedProduct: (value: string) => void;
  quantity: number;
  setQuantity: (value: number) => void;
  cart: CartItem[];
  years: number;
  daysInMonth: number;
  total: number;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  handleAddProduct: (args: {
    isNew: boolean;
    productName: string;
    supplierPrice: number;
    selectedProduct: string;
    quantity: number;
    description: string;
    salePrice?: number;
  }) => void;
  products: any[];
  suppliers: any[];
}

export default function RegisterPurchaseForm({
  onSave,
  onClose,
  purchases,
  form,
  selectedProduct,
  fetchPurchases,
  setSelectedProduct,
  quantity,
  setQuantity,
  cart,
  total,
  handleChange,
  handleAddProduct,
  products,
  suppliers,
}: Props) {
  const [errors, setErrors] = useState<PurchaseErrors>({});
  const [isNewProduct, setIsNewProduct] = useState(false);

  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState<number | "">("");
  const [newProductSalePrice, setNewProductSalePrice] = useState<number | "">(
    ""
  );

  const [existingSalePrice, setExistingSalePrice] = useState<number | "">("");
  const [productDescription, setProductDescription] = useState("");
  const [duplicateProductError, setDuplicateProductError] = useState("");
  const [saving, setSaving] = useState(false);

  const { showLoader, hideLoader } = useLoader();

  const handleFieldValidation = (
    field: keyof Omit<IPurchase, "id">,
    value: any
  ) => {
    const error = validatePurchaseField(field, value, purchases);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      showWarning("Agrega al menos un producto al carrito.");
      return;
    }

    const validationErrors = validatePurchaseForm(
      {
        orderNumber: form.orderNumber,
        invoiceNumber: form.invoiceNumber,
        supplier: form.supplier,
        registerDate: form.registerDate,
        amount: total,
        status: "Aprobado",
        description: form.description,
      } as any,
      purchases ?? []
    );

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showError("Corrige los errores antes de guardar.");
      return;
    }

    try {
      showLoader();
      setSaving(true);

      await onSave();
      await fetchPurchases();

      showSuccess("Compra registrada con éxito.");
      onClose();
    } catch (error) {
      console.error(error);
      showError("Error al registrar la compra.");
    } finally {
      hideLoader();
      setSaving(false);
    }
  };

  const getSelectedProduct = () =>
    products.find((p) => p.productid === Number(selectedProduct));

  const handleAddProductClick = () => {
    if (!isNewProduct && !selectedProduct) {
      showWarning("Selecciona un producto.");
      return;
    }

    if (
      isNewProduct &&
      (!newProductName || !newProductPrice || newProductPrice <= 0)
    ) {
      showWarning(
        "Completa los datos del nuevo producto (nombre y precio proveedor)."
      );
      return;
    }

    let supplierPrice = 0;
    let salePrice: number | undefined;

    if (isNewProduct) {
      supplierPrice = Number(newProductPrice);
      salePrice =
        newProductSalePrice === "" ? undefined : Number(newProductSalePrice);
    } else {
      const product = getSelectedProduct();
      if (!product) return;

      supplierPrice = product.productpriceofsupplier;
      salePrice =
        existingSalePrice === "" ? undefined : Number(existingSalePrice);
    }

    // Validación rápida coherente con backend
    if (salePrice !== undefined && salePrice < supplierPrice) {
      showError(
        "El precio de venta no puede ser menor que el precio proveedor."
      );
      return;
    }

    // Validar duplicado cuando no es producto nuevo
    if (!isNewProduct) {
      const exists = cart.some(
        (item) => item.productid === Number(selectedProduct)
      );

      if (exists) {
        setDuplicateProductError("Este producto ya fue agregado.");
        return;
      }
    }

    setDuplicateProductError("");

    handleAddProduct({
      isNew: isNewProduct,
      productName: newProductName,
      supplierPrice,
      selectedProduct,
      quantity,
      description: productDescription,
      salePrice,
    });

    // Reset campos de producto
    setProductDescription("");
    if (isNewProduct) {
      setNewProductName("");
      setNewProductPrice("");
      setNewProductSalePrice("");
    } else {
      setExistingSalePrice("");
      setSelectedProduct("");
    }
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="space-y-5 p-4 sm:p-6 md:p-8 max-w-3xl mx-auto rounded"
    >
      {/* Fecha */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Fecha de Registro <span className="text-red-500">*</span>
        </label>

        <input
          type="date"
          name="registerDate"
          value={form.registerDate}
          onChange={(e) => {
            handleChange(e);
            handleFieldValidation("registerDate", e.target.value);
          }}
          required
          className={`w-full rounded-md border px-2 py-2 text-sm ${
            errors.createdAt ? "border-red-500" : "border-gray-300"
          }`}
        />

        {errors.registerDate && (
          <p className="text-xs text-red-500 mt-1">{errors.registerDate}</p>
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
          {form.supplier && (
            <div className="flex items-center gap-2 mt-2 p-2 border rounded-md bg-gray-50">
              <img
                src={
                  suppliers.find((s) => s.supplierid == form.supplier)?.image ||
                  DEFAULT_SUPPLIER_IMAGE
                }
                alt="Proveedor"
                className="w-10 h-10 rounded object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    DEFAULT_SUPPLIER_IMAGE;
                }}
              />

              <span className="text-sm font-medium text-gray-700">
                {suppliers.find((s) => s.supplierid == form.supplier)?.name}
              </span>
            </div>
          )}

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

      {/* Número de Factura */}
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

      {/* Total */}
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

      {/* Productos */}
      <div className="p-3 border rounded-lg bg-gray-50">
        <label className="block text-sm mb-2">
          Productos <span className="text-red-500">*</span>
        </label>

        {/* Toggle Seleccionar / Crear */}
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => {
              setIsNewProduct(false);
              setNewProductName("");
              setNewProductPrice("");
              setNewProductSalePrice("");
            }}
            className={`text-xs px-2 py-1 rounded cursor-pointer ${
              !isNewProduct ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Seleccionar
          </button>

          <button
            type="button"
            onClick={() => {
              setIsNewProduct(true);
              setSelectedProduct("");
              setExistingSalePrice("");
            }}
            className={`text-xs px-2 py-1 rounded cursor-pointer ${
              isNewProduct ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            Crear producto
          </button>
        </div>

        {!isNewProduct ? (
          <>
            <div className="flex flex-col sm:flex-col gap-2">
              <select
                value={selectedProduct}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedProduct(value);

                  const prod = products.find(
                    (p) => p.productid === Number(value)
                  );
                  if (prod?.productpriceofsale) {
                    setExistingSalePrice(prod.productpriceofsale);
                  } else {
                    setExistingSalePrice("");
                  }
                }}
                className="flex-1 rounded-md border px-2 py-2 text-sm"
              >
                <option value="">Selecciona un producto</option>
                {products.map((p) => (
                  <option key={p.productid} value={p.productid}>
                    {p.productname} - {formatCOP(p.productpriceofsupplier)}{" "}
                    (compra)
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

              <input
                type="number"
                placeholder="Precio de venta (opcional)"
                value={existingSalePrice}
                onChange={(e) =>
                  setExistingSalePrice(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full sm:w-40 rounded-md border px-2 py-2 text-sm"
              />
            </div>
            {duplicateProductError && (
              <p className="text-xs text-red-500 mt-1">
                {duplicateProductError}
              </p>
            )}
          </>
        ) : (
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
              onChange={(e) =>
                setNewProductPrice(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              className="w-full sm:w-40 rounded-md border px-2 py-2 text-sm"
            />

            <input
              type="number"
              placeholder="Precio de venta (opcional)"
              value={newProductSalePrice}
              onChange={(e) =>
                setNewProductSalePrice(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
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

        {/* Descripción */}
        <textarea
          placeholder="Descripción del producto"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          className="w-full rounded-md border px-2 py-2 text-sm resize-none mt-2"
          rows={2}
        />

        <button
          type="button"
          onClick={handleAddProductClick}
          style={{ backgroundColor: Colors.buttons.primary }}
          className="cursor-pointer mt-3 w-full px-3 py-2 rounded-md text-white text-sm hover:bg-opacity-90 transition hover:scale-103"
        >
          Añadir más productos +
        </button>

        {cart.length > 0 && (
          <div className="mt-4 space-y-2">
            {cart.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-2 rounded-md shadow-sm border gap-1"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-700">
                    {item.productname ||
                      products.find((p) => p.productid === item.productid)
                        ?.productname}
                  </span>

                  <span className="bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>

                <div className="flex flex-col items-end text-xs text-gray-600">
                  <span>
                    Compra: {formatCOP(item.unitprice)} · Total:{" "}
                    {formatCOP(item.unitprice * item.quantity)}
                  </span>
                  {item.saleprice !== undefined && (
                    <span>Venta: {formatCOP(item.saleprice)}</span>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label className="block text-sm mb-1 font-medium">Observaciones</label>
        <textarea
          name="description"
          value={form.description}
          onChange={(e) => {
            handleChange(e);
            handleFieldValidation("description" as any, e.target.value);
          }}
          className="w-full rounded-md border px-2 py-2 text-sm resize-none"
          rows={3}
          placeholder="Notas adicionales de la compra"
        />
      </div>

      {/* Botones */}
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
          disabled={saving}
          className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
}
