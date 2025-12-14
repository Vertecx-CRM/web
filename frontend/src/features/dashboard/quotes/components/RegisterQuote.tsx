"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Colors from "@/shared/theme/colors";
import { showError, showSuccess } from "@/shared/utils/notifications";
import { QuoteCreatePayload, QuoteDetailPayload } from "../types/Quote.type";
import { api } from "@/shared/utils/apiClient";

/* ================================
 * TIPOS
 * ================================ */
type CustomerFromApi = {
  customerid: number;
  users: {
    name: string;
    lastname: string;
    documentnumber: string;
    email: string;
  };
};

type TechnicianFromApi = {
  technicianid: number;
  users: {
    name: string;
    lastname: string;
    documentnumber: string;
    email: string;
  };
};

type ProductFromApi = {
  productid: number;
  productname: string;
  productpriceofsale: number;
  productstock: number;
  isactive: boolean;
};

/* ================================
 * ESTADO DEL FORMULARIO
 * ================================ */
interface QuoteFormState {
  serviceRequestId: number;
  customerid: number | "";
  technicianid: number | "";
  statesid: number;
  servicetype: "MANTENIMIENTO" | "INSTALACION" | "";
  observation: string;
  details: QuoteDetailPayload[];
}

interface Props {
  onSave?: (payload: QuoteCreatePayload) => Promise<void>;
}

export default function RegisterQuoteForm({ onSave }: Props) {
  /* ================================
   * STATE PRINCIPAL
   * ================================ */
  const [form, setForm] = useState<QuoteFormState>({
    serviceRequestId: 17,
    customerid: "",
    technicianid: "",
    statesid: 5,
    servicetype: "",
    observation: "",
    details: [],
  });

  /* ================================
   * CLIENTES
   * ================================ */
  const [customers, setCustomers] = useState<CustomerFromApi[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerList, setShowCustomerList] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);

  /* ================================
   * TÉCNICOS
   * ================================ */
  const [technicians, setTechnicians] = useState<TechnicianFromApi[]>([]);
  const [technicianSearch, setTechnicianSearch] = useState("");
  const [showTechnicianList, setShowTechnicianList] = useState(false);
  const technicianRef = useRef<HTMLDivElement>(null);

  /* ================================
   * PRODUCTOS
   * ================================ */
  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [isManualProduct, setIsManualProduct] = useState(false);
  const productRef = useRef<HTMLDivElement>(null);

  /* ================================
   * DETALLE ACTUAL
   * ================================ */
  const [detailForm, setDetailForm] = useState<QuoteDetailPayload>({
    productid: null,
    description: "",
    quantity: 1,
    unitprice: 0,
    subtotal: 0,
    availability: "DISPONIBLE",
  });

  /* ================================
   * EFECTOS PARA CERRAR LISTAS AL HACER CLICK AFUERA
   * ================================ */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        customerRef.current &&
        !customerRef.current.contains(event.target as Node)
      ) {
        setShowCustomerList(false);
      }
      if (
        technicianRef.current &&
        !technicianRef.current.contains(event.target as Node)
      ) {
        setShowTechnicianList(false);
      }
      if (
        productRef.current &&
        !productRef.current.contains(event.target as Node)
      ) {
        setShowProductList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================================
   * CARGA DE DATOS
   * ================================ */
  useEffect(() => {
    api.get("/customers").then((r) => setCustomers(r.data));
    api.get("/technicians").then((r) => setTechnicians(r.data));
    api.get("/products?status=all").then((r) => setProducts(r.data));
  }, []);

  /* ================================
   * FILTROS
   * ================================ */
  const filteredCustomers = useMemo(() => {
    const q = customerSearch.toLowerCase();
    return customers.filter((c) =>
      `${c.users.name} ${c.users.lastname} ${c.users.documentnumber}`
        .toLowerCase()
        .includes(q)
    );
  }, [customerSearch, customers]);

  const filteredTechnicians = useMemo(() => {
    const q = technicianSearch.toLowerCase();
    return technicians.filter((t) =>
      `${t.users.name} ${t.users.lastname} ${t.users.documentnumber}`
        .toLowerCase()
        .includes(q)
    );
  }, [technicianSearch, technicians]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.productname.toLowerCase().includes(q) ||
        p.productid.toString().includes(q)
    );
  }, [productSearch, products]);

  /* ================================
   * TOTALES
   * ================================ */
  const subtotal = useMemo(
    () => form.details.reduce((a, d) => a + d.subtotal, 0),
    [form.details]
  );
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;

  /* ================================
   * HANDLERS PARA PRODUCTOS
   * ================================ */
  const handleProductModeChange = (manual: boolean) => {
    setIsManualProduct(manual);
    setProductSearch("");
    setShowProductList(false);
    setDetailForm({
      productid: null,
      description: "",
      quantity: 1,
      unitprice: 0,
      subtotal: 0,
      availability: manual ? "SOLICITAR" : "DISPONIBLE",
    });
  };

  const handleSelectProduct = (product: ProductFromApi) => {
    setDetailForm({
      productid: product.productid,
      description: product.productname,
      quantity: 1,
      unitprice: product.productpriceofsale,
      subtotal: product.productpriceofsale,
      availability: product.productstock > 0 ? "DISPONIBLE" : "NO_DISPONIBLE",
    });
    setProductSearch(product.productname);
    setShowProductList(false);
  };

  /* ================================
   * HANDLERS PARA DETALLES
   * ================================ */
  const handleAddDetail = () => {
    if (!detailForm.description.trim()) {
      showError("La descripción es obligatoria");
      return;
    }
    if (detailForm.quantity <= 0 || detailForm.unitprice < 0) {
      showError("Cantidad y precio inválidos");
      return;
    }

    const subtotal = detailForm.quantity * detailForm.unitprice;

    // Configurar disponibilidad basada en el tipo de producto
    let availability = detailForm.availability;
    if (isManualProduct) {
      // Producto manual: stock 0, se solicita comprar
      availability = "SOLICITAR";
    } else if (detailForm.productid === null) {
      // Producto no seleccionado de la lista
      availability = "NO_DISPONIBLE";
    }

    const newDetail: QuoteDetailPayload = {
      ...detailForm,
      productid: isManualProduct ? null : detailForm.productid,
      subtotal,
      availability,
    };

    setForm((prev) => ({
      ...prev,
      details: [...prev.details, newDetail],
    }));

    // Resetear formulario de detalle
    setDetailForm({
      productid: null,
      description: "",
      quantity: 1,
      unitprice: 0,
      subtotal: 0,
      availability: isManualProduct ? "SOLICITAR" : "DISPONIBLE",
    });

    setProductSearch("");
  };

  const handleRemoveDetail = (index: number) => {
    setForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  /* ================================
   * HANDLER PARA ENVIAR FORMULARIO
   * ================================ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerid || !form.technicianid || !form.servicetype) {
      showError("Cliente, técnico y tipo de servicio son obligatorios");
      return;
    }

    if (form.details.length === 0) {
      showError("Agrega al menos un producto");
      return;
    }

    const payload: QuoteCreatePayload = {
      serviceRequestId: form.serviceRequestId,
      customerid: Number(form.customerid),
      technicianid: Number(form.technicianid),
      statesid: form.statesid,
      servicetype: form.servicetype,
      observation: form.observation,
      subtotal,
      tax,
      total,
      details: form.details.map((detail) => ({
        ...detail,
        // Asegurar que productos manuales tengan productid null
        productid: detail.productid === undefined ? null : detail.productid,
      })),
    };

    await onSave?.(payload);
    showSuccess("Cotización guardada exitosamente");
    // Resetear formulario
    setForm({
      serviceRequestId: 17,
      customerid: "",
      technicianid: "",
      statesid: 5,
      servicetype: "",
      observation: "",
      details: [],
    });
  };

  /* ================================
   * RENDER
   * ================================ */
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 text-sm">
      {/* TIPO DE SERVICIO */}
      <div>
        <label className="block mb-1 font-medium">Tipo de servicio *</label>
        <select
          value={form.servicetype}
          onChange={(e) =>
            setForm({ ...form, servicetype: e.target.value as any })
          }
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccione un tipo</option>
          <option value="MANTENIMIENTO">Mantenimiento</option>
          <option value="INSTALACION">Instalación</option>
        </select>
      </div>

      {/* CLIENTE */}
      <div ref={customerRef} className="relative">
        <label className="block mb-1 font-medium">Cliente *</label>
        <input
          type="text"
          placeholder="Buscar cliente por nombre, apellido o documento"
          value={customerSearch}
          onChange={(e) => {
            setCustomerSearch(e.target.value);
            setShowCustomerList(true);
          }}
          onFocus={() => setShowCustomerList(true)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {showCustomerList && filteredCustomers.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
            {filteredCustomers.map((c) => (
              <div
                key={c.customerid}
                onClick={() => {
                  setForm({ ...form, customerid: c.customerid });
                  setCustomerSearch(
                    `${c.users.name} ${c.users.lastname} (${c.users.documentnumber})`
                  );
                  setShowCustomerList(false);
                }}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
              >
                <div className="font-medium">
                  {c.users.name} {c.users.lastname}
                </div>
                <div className="text-xs text-gray-500">
                  Documento: {c.users.documentnumber}
                </div>
                <div className="text-xs text-gray-500">
                  Email: {c.users.email}
                </div>
              </div>
            ))}
          </div>
        )}
        {showCustomerList &&
          filteredCustomers.length === 0 &&
          customerSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg p-3">
              <div className="text-gray-500">No se encontraron clientes</div>
            </div>
          )}
      </div>

      {/* TÉCNICO */}
      <div ref={technicianRef} className="relative">
        <label className="block mb-1 font-medium">Técnico *</label>
        <input
          type="text"
          placeholder="Buscar técnico por nombre, apellido o documento"
          value={technicianSearch}
          onChange={(e) => {
            setTechnicianSearch(e.target.value);
            setShowTechnicianList(true);
          }}
          onFocus={() => setShowTechnicianList(true)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {showTechnicianList && filteredTechnicians.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
            {filteredTechnicians.map((t) => (
              <div
                key={t.technicianid}
                onClick={() => {
                  setForm({ ...form, technicianid: t.technicianid });
                  setTechnicianSearch(
                    `${t.users.name} ${t.users.lastname} (${t.users.documentnumber})`
                  );
                  setShowTechnicianList(false);
                }}
                className="cursor-pointer px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
              >
                <div className="font-medium">
                  {t.users.name} {t.users.lastname}
                </div>
                <div className="text-xs text-gray-500">
                  Documento: {t.users.documentnumber}
                </div>
                <div className="text-xs text-gray-500">
                  Email: {t.users.email}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OBSERVACIÓN */}
      <div>
        <label className="block mb-1 font-medium">Observación</label>
        <textarea
          placeholder="Observaciones adicionales sobre la cotización"
          value={form.observation}
          onChange={(e) => setForm({ ...form, observation: e.target.value })}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>

      {/* DETALLES DE PRODUCTOS */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h3 className="font-bold mb-3">Detalles de productos</h3>

        {/* SELECTOR DE MODO */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => handleProductModeChange(false)}
            className={`px-4 py-2 rounded ${
              !isManualProduct ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Producto existente
          </button>
          <button
            type="button"
            onClick={() => handleProductModeChange(true)}
            className={`px-4 py-2 rounded ${
              isManualProduct ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            Producto manual (para comprar)
          </button>
        </div>

        {/* BUSCADOR DE PRODUCTOS EXISTENTES */}
        {!isManualProduct && (
          <div ref={productRef} className="relative mb-4">
            <label className="block mb-1 font-medium">
              Buscar producto existente
            </label>
            <input
              type="text"
              placeholder="Escriba para buscar productos..."
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setShowProductList(true);
              }}
              onFocus={() => setShowProductList(true)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {showProductList && filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.map((p) => (
                  <div
                    key={p.productid}
                    onClick={() => handleSelectProduct(p)}
                    className="cursor-pointer px-3 py-2 hover:bg-gray-100 border-b last:border-b-0"
                  >
                    <div className="font-medium">{p.productname}</div>
                    <div className="flex justify-between text-sm">
                      <span>Stock: {p.productstock}</span>
                      <span className="font-medium">
                        ${p.productpriceofsale.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {p.productid} | Estado:{" "}
                      {p.isactive ? "Activo" : "Inactivo"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FORMULARIO DE DETALLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block mb-1 font-medium">Descripción *</label>
            <input
              type="text"
              placeholder="Nombre del producto"
              value={detailForm.description}
              onChange={(e) =>
                setDetailForm({ ...detailForm, description: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Cantidad *</label>
            <input
              type="number"
              min="1"
              value={detailForm.quantity}
              onChange={(e) =>
                setDetailForm({
                  ...detailForm,
                  quantity: Number(e.target.value),
                })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Precio unitario *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={detailForm.unitprice}
              onChange={(e) =>
                setDetailForm({
                  ...detailForm,
                  unitprice: Number(e.target.value),
                })
              }
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* INFORMACIÓN DEL PRODUCTO */}
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="text-sm">
            <strong>Tipo:</strong>{" "}
            {isManualProduct ? "Producto manual" : "Producto existente"}
            <br />
            <strong>Disponibilidad:</strong> {detailForm.availability}
            {detailForm.productid && (
              <>
                <br />
                <strong>ID Producto:</strong> {detailForm.productid}
              </>
            )}
            <br />
            <strong>Subtotal:</strong> $
            {(detailForm.quantity * detailForm.unitprice).toLocaleString()}
          </div>
        </div>

        {/* BOTÓN AGREGAR */}
        <button
          type="button"
          onClick={handleAddDetail}
          style={{ backgroundColor: Colors.buttons.secondary }}
          className="text-white px-4 py-2 rounded hover:opacity-90"
        >
          Agregar producto
        </button>

        {/* LISTA DE PRODUCTOS AGREGADOS */}
        {form.details.length > 0 && (
          <div className="mt-6">
            <h4 className="font-bold mb-2">
              Productos agregados ({form.details.length})
            </h4>
            <div className="border rounded overflow-hidden">
              {form.details.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{d.description}</div>
                    <div className="text-sm text-gray-600">
                      Cantidad: {d.quantity} | Precio: $
                      {d.unitprice.toLocaleString()} | Subtotal: $
                      {d.subtotal.toLocaleString()} | Tipo:{" "}
                      {d.productid === null
                        ? "Manual (para comprar)"
                        : "Existente"}{" "}
                      | Disponibilidad: {d.availability}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(i)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESUMEN FINANCIERO */}
      <div className="border p-4 rounded-lg bg-gray-50">
        <h3 className="font-bold mb-3">Resumen financiero</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between">
            <span>IVA (19%):</span>
            <span>${tax.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total:</span>
            <span>${total.toLocaleString("es-CO")}</span>
          </div>
        </div>
      </div>

      {/* BOTÓN GUARDAR */}
      <button
        type="submit"
        style={{ backgroundColor: Colors.buttons.primary }}
        className="w-full text-white px-4 py-3 rounded font-medium hover:opacity-90"
      >
        Guardar Cotización
      </button>
    </form>
  );
}
