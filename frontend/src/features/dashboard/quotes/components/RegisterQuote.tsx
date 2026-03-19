"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AutoGrowTextarea from "@/components/ui/AutoGrowTextarea";
import Colors from "@/shared/theme/colors";
import { api } from "@/shared/utils/apiClient";
import { showError, showSuccess } from "@/shared/utils/notifications";
import { getServicesRequestsForQuote } from "../api/quotes.api";
import { QuoteCreatePayload } from "../types/Quote.type";
import {
  getQuotedInstallationCopy,
  getTechnicalReviewStatusLabel,
  getInstallationAssessmentExplainer,
  getRequestStageLabel,
  isInstallationServiceType,
} from "@/shared/utils/requestFlow";

type ServiceRequestFromApi = {
  serviceRequestId: number;
  serviceType: string;
  description?: string | null;
  direccion?: string | null;
  requestMode?: "ASSESSMENT" | "DIRECT_INSTALLATION" | null;
  technicalReviewStatus?:
    | "NOT_APPLICABLE"
    | "PENDING_REVIEW"
    | "ASSESSMENT_REQUIRED"
    | "READY_TO_QUOTE"
    | null;
  alreadyHasMaterials?: boolean;
  purchasedMaterials?: Array<{
    productId?: number | null;
    name: string;
    quantity: number;
    unitPrice?: number | null;
  }>;
  siteChecklist?: {
    installationArea?: string | null;
    installationHeight?: string | null;
    estimatedCableMeters?: string | null;
    materialsSummary?: string | null;
  } | null;
  customer?: {
    customerid?: number;
    users?: {
      name?: string;
      lastname?: string;
      documentnumber?: string;
      email?: string;
    };
  };
  techniciansMap?: Array<{
    technicianId?: number;
    technician?: {
      technicianid?: number;
      users?: {
        name?: string;
        lastname?: string;
        email?: string;
      };
    };
  }>;
};

type ProductFromApi = {
  productid: number;
  productname: string;
  productdescription: string | null;
  productpriceofsale: number;
  productstock: number;
  isactive: boolean;
};

type QuoteDetailForm = {
  productId: number | null;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  availability: "DISPONIBLE" | "NO_DISPONIBLE" | "SOLICITAR";
  isBackorder?: boolean;
};

type QuoteFormState = {
  serviceRequestId: number | "";
  statesId: number;
  serviceType: string;
  observation: string;
  details: QuoteDetailForm[];
};

type Props = {
  onSave?: (payload: QuoteCreatePayload) => Promise<void>;
};

const EMPTY_DETAIL: QuoteDetailForm = {
  productId: null,
  name: "",
  description: "",
  quantity: 1,
  unitPrice: 0,
  subtotal: 0,
  availability: "DISPONIBLE",
  isBackorder: false,
};

export default function RegisterQuoteForm({ onSave }: Props) {
  const [form, setForm] = useState<QuoteFormState>({
    serviceRequestId: "",
    statesId: 5,
    serviceType: "",
    observation: "",
    details: [],
  });
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestFromApi[]>([]);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<ServiceRequestFromApi | null>(null);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [isManualProduct, setIsManualProduct] = useState(false);
  const [pendingBackorderProduct, setPendingBackorderProduct] = useState<ProductFromApi | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailForm, setDetailForm] = useState<QuoteDetailForm>(EMPTY_DETAIL);
  const productRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productRef.current && !productRef.current.contains(event.target as Node)) {
        setShowProductList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [requests, productsResponse] = await Promise.all([
          getServicesRequestsForQuote(),
          api.get("/products?status=all"),
        ]);

        if (cancelled) return;
        setServiceRequests(Array.isArray(requests) ? requests : []);
        setProducts(Array.isArray(productsResponse.data) ? productsResponse.data : []);
      } catch (error) {
        console.error(error);
        showError("Error al cargar los datos iniciales");
      } finally {
        if (!cancelled) setIsLoadingRequests(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = productSearch.toLowerCase().trim();
    return products.filter((product) => {
      if (!query) return true;
      return (
        product.productname.toLowerCase().includes(query) ||
        String(product.productid).includes(query)
      );
    });
  }, [productSearch, products]);

  const subtotal = useMemo(
    () => form.details.reduce((acc, detail) => acc + Number(detail.subtotal || 0), 0),
    [form.details]
  );
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;

  const handleServiceRequestChange = (serviceRequestId: number) => {
    const selected = serviceRequests.find((request) => request.serviceRequestId === serviceRequestId) ?? null;
    setSelectedServiceRequest(selected);
    setForm((prev) => ({
      ...prev,
      serviceRequestId: selected?.serviceRequestId ?? "",
      serviceType: selected?.serviceType ?? "",
    }));
  };

  const handleProductModeChange = (manual: boolean) => {
    setIsManualProduct(manual);
    setPendingBackorderProduct(null);
    setProductSearch("");
    setShowProductList(false);
    setDetailForm({
      ...EMPTY_DETAIL,
      availability: manual ? "SOLICITAR" : "DISPONIBLE",
    });
  };

  const applyProductSelection = (product: ProductFromApi, isBackorder: boolean) => {
    const unitPrice = Number(product.productpriceofsale ?? 0);
    setDetailForm({
      productId: product.productid,
      name: product.productname,
      description: product.productdescription ?? product.productname,
      quantity: 1,
      unitPrice,
      subtotal: unitPrice,
      availability: isBackorder ? "SOLICITAR" : "DISPONIBLE",
      isBackorder,
    });
    setProductSearch(product.productname);
    setShowProductList(false);
    setPendingBackorderProduct(null);
  };

  const handleSelectProduct = (product: ProductFromApi) => {
    if (Number(product.productstock ?? 0) === 0) {
      setPendingBackorderProduct(product);
      setShowProductList(false);
      return;
    }
    applyProductSelection(product, false);
  };

  const handleAddDetail = () => {
    if (!detailForm.description.trim()) {
      showError("La descripcion es obligatoria");
      return;
    }

    if (detailForm.quantity <= 0 || detailForm.unitPrice < 0) {
      showError("Cantidad o precio invalidos");
      return;
    }

    const normalizedSubtotal = detailForm.quantity * detailForm.unitPrice;
    const nextDetail: QuoteDetailForm = {
      ...detailForm,
      subtotal: normalizedSubtotal,
      availability: isManualProduct
        ? "SOLICITAR"
        : detailForm.productId
          ? detailForm.availability
          : "NO_DISPONIBLE",
    };

    setForm((prev) => {
      const nextDetails = [...prev.details];
      const normalizedDescription = detailForm.description.trim().toLowerCase();

      const existingIndex = nextDetails.findIndex((detail) => {
        if (nextDetail.productId) {
          return detail.productId === nextDetail.productId;
        }
        return (
          detail.productId === null &&
          detail.description.trim().toLowerCase() === normalizedDescription
        );
      });

      if (existingIndex >= 0) {
        const current = nextDetails[existingIndex];
        const quantity = current.quantity + nextDetail.quantity;
        nextDetails[existingIndex] = {
          ...current,
          quantity,
          unitPrice: nextDetail.unitPrice,
          subtotal: quantity * nextDetail.unitPrice,
          isBackorder: Boolean(current.isBackorder || nextDetail.isBackorder),
        };
      } else {
        nextDetails.push(nextDetail);
      }

      return {
        ...prev,
        details: nextDetails,
      };
    });

    setDetailForm({
      ...EMPTY_DETAIL,
      availability: isManualProduct ? "SOLICITAR" : "DISPONIBLE",
    });
    setProductSearch("");
  };

  const handleRemoveDetail = (index: number) => {
    setForm((prev) => ({
      ...prev,
      details: prev.details.filter((_, currentIndex) => currentIndex !== index),
    }));
  };

  const updateDetailQuantity = (index: number, quantityRaw: number) => {
    setForm((prev) => {
      const nextDetails = [...prev.details];
      const current = nextDetails[index];
      if (!current) return prev;

      let quantity = Math.max(1, Number(quantityRaw) || 1);
      const product = products.find((item) => item.productid === current.productId);
      if (product && current.productId && !current.isBackorder) {
        quantity = Math.min(quantity, Math.max(1, Number(product.productstock || 1)));
      }

      nextDetails[index] = {
        ...current,
        quantity,
        subtotal: quantity * current.unitPrice,
      };

      return { ...prev, details: nextDetails };
    });
  };

  const changeDetailQuantityBy = (index: number, delta: number) => {
    const current = form.details[index];
    if (!current) return;
    updateDetailQuantity(index, current.quantity + delta);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.serviceRequestId || !selectedServiceRequest) {
      showError("Debes seleccionar una solicitud de servicio");
      return;
    }

    if (!form.serviceType.trim()) {
      showError("No se pudo resolver el tipo de servicio de la solicitud");
      return;
    }

    if (!form.details.length) {
      showError("Agrega al menos un producto a la cotizacion");
      return;
    }

    const clientId = Number(selectedServiceRequest.customer?.customerid ?? 0);
    if (!clientId) {
      showError("La solicitud seleccionada no tiene un cliente valido");
      return;
    }

    const payload: QuoteCreatePayload = {
      serviceRequestId: Number(form.serviceRequestId),
      statesId: form.statesId,
      clientId,
      serviceType: form.serviceType,
      observation: form.observation.trim() || undefined,
      details: form.details.map((detail) => ({
        productId: detail.productId ?? null,
        description: detail.description.trim(),
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
        subtotal: detail.subtotal,
        availability: detail.availability,
      })),
    };

    try {
      setSaving(true);
      await onSave?.(payload);
      showSuccess("Cotizacion guardada exitosamente");
      setForm({
        serviceRequestId: "",
        statesId: 5,
        serviceType: "",
        observation: "",
        details: [],
      });
      setSelectedServiceRequest(null);
      setDetailForm(EMPTY_DETAIL);
      setProductSearch("");
      setIsManualProduct(false);
      setPendingBackorderProduct(null);
    } catch (error) {
      console.error(error);
      showError("Error al guardar la cotizacion");
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingRequests) {
    return (
      <div className="flex items-center justify-center p-10">
        <div className="text-gray-500">Cargando datos...</div>
      </div>
    );
  }

  const customerLabel = selectedServiceRequest?.customer?.users
    ? `${selectedServiceRequest.customer.users.name ?? ""} ${selectedServiceRequest.customer.users.lastname ?? ""}`.trim()
    : "";

  const technicianLabel =
    selectedServiceRequest?.techniciansMap?.[0]?.technician?.users
      ? `${selectedServiceRequest.techniciansMap[0].technician.users.name ?? ""} ${selectedServiceRequest.techniciansMap[0].technician.users.lastname ?? ""}`.trim()
      : "";
  const selectedRequestStageLabel = getRequestStageLabel(
    selectedServiceRequest?.serviceType ?? "",
    selectedServiceRequest?.requestMode ?? undefined,
  );
  const selectedReviewStatus = getTechnicalReviewStatusLabel(
    selectedServiceRequest?.technicalReviewStatus ?? undefined,
  );
  const isInstallationAssessment = isInstallationServiceType(
    selectedServiceRequest?.serviceType ?? "",
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5 text-sm">
      <div>
        <label className="mb-1 block font-medium">Asesoria / solicitud base *</label>
        <select
          value={form.serviceRequestId}
          onChange={(event) => handleServiceRequestChange(Number(event.target.value))}
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={saving}
        >
          <option value="">Seleccione una solicitud</option>
          {serviceRequests.map((request) => {
            const label = request.customer?.users
              ? `${request.customer.users.name ?? ""} ${request.customer.users.lastname ?? ""}`.trim()
              : "Cliente no disponible";

            return (
              <option key={request.serviceRequestId} value={request.serviceRequestId}>
                #{request.serviceRequestId} - {label} -{" "}
                {getRequestStageLabel(
                  request.serviceType,
                  request.requestMode ?? undefined,
                )}
              </option>
            );
          })}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Solo aparecen solicitudes con tecnico asignado y sin una cotizacion activa.
        </p>
      </div>

      {selectedServiceRequest && (
        <div className="space-y-3 rounded-lg border bg-gray-50 p-4">
          <h3 className="font-bold text-gray-700">Informacion de la solicitud base</h3>
          {isInstallationAssessment && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <strong>{selectedRequestStageLabel}:</strong>{" "}
              {selectedServiceRequest?.requestMode === "DIRECT_INSTALLATION"
                ? getQuotedInstallationCopy(selectedServiceRequest?.requestMode)
                : getInstallationAssessmentExplainer()}
            </div>
          )}
          {selectedServiceRequest?.requestMode === "DIRECT_INSTALLATION" && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
              <strong>Revision tecnica:</strong> {selectedReviewStatus}
              <br />
              {getQuotedInstallationCopy(selectedServiceRequest?.requestMode)}
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Cliente</div>
              <div className="font-medium">{customerLabel || "Cliente no disponible"}</div>
              <div className="text-sm text-gray-600">
                Documento: {selectedServiceRequest.customer?.users?.documentnumber ?? "N/A"}
              </div>
              <div className="text-sm text-gray-600">
                Email: {selectedServiceRequest.customer?.users?.email ?? "N/A"}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-gray-500">Tecnico asignado</div>
              <div className="font-medium">{technicianLabel || "Sin tecnico asignado"}</div>
              <div className="text-sm text-gray-600">
                Direccion: {selectedServiceRequest.direccion ?? "N/A"}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs text-gray-500">
              {isInstallationAssessment
                ? "Descripcion de la asesoria tecnica"
                : "Descripcion de la solicitud"}
            </div>
            <p className="rounded bg-white p-3 text-sm text-gray-700">
              {selectedServiceRequest.description ?? "Sin descripcion"}
            </p>
          </div>
          {selectedServiceRequest?.requestMode === "DIRECT_INSTALLATION" && (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="rounded bg-white p-3 text-sm text-gray-700">
                <div className="mb-1 text-xs text-gray-500">Checklist del sitio</div>
                <p>
                  Zona: {selectedServiceRequest.siteChecklist?.installationArea || "-"}
                </p>
                <p>
                  Altura: {selectedServiceRequest.siteChecklist?.installationHeight || "-"}
                </p>
                <p>
                  Cable estimado: {selectedServiceRequest.siteChecklist?.estimatedCableMeters || "-"}
                </p>
                <p className="mt-2">
                  Materiales reportados: {selectedServiceRequest.siteChecklist?.materialsSummary || "-"}
                </p>
              </div>

              <div className="rounded bg-white p-3 text-sm text-gray-700">
                <div className="mb-1 text-xs text-gray-500">
                  Materiales ya comprados por el cliente
                </div>
                {selectedServiceRequest.purchasedMaterials?.length ? (
                  <div className="space-y-2">
                    {selectedServiceRequest.purchasedMaterials.map((item, index) => (
                      <div
                        key={`${item.productId ?? item.name}-${index}`}
                        className="rounded border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {item.quantity}
                          {item.unitPrice != null
                            ? ` - $${item.unitPrice.toLocaleString("es-CO")}`
                            : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No hay materiales vinculados. Si faltan insumos, agregalos en la cotizacion.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="mb-1 block font-medium">Tipo de servicio *</label>
        <input
          type="text"
          value={selectedRequestStageLabel}
          readOnly
          className="w-full rounded border bg-gray-100 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Observacion</label>
        <textarea
          value={form.observation}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, observation: event.target.value }))
          }
          className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Observaciones adicionales sobre la cotizacion"
          disabled={saving}
        />
      </div>

      <div className="rounded-lg border bg-gray-50 p-4">
        <h3 className="mb-3 font-bold">Detalles de productos</h3>

        <div className="mb-4 flex gap-2">
          <button
            type="button"
            onClick={() => handleProductModeChange(false)}
            className={`rounded px-4 py-2 ${!isManualProduct ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            disabled={saving}
          >
            Producto existente
          </button>
          <button
            type="button"
            onClick={() => handleProductModeChange(true)}
            className={`rounded px-4 py-2 ${isManualProduct ? "bg-blue-500 text-white" : "bg-gray-200"}`}
            disabled={saving}
          >
            Producto manual
          </button>
        </div>

        {!isManualProduct && (
          <div ref={productRef} className="relative mb-4">
            <label className="mb-1 block font-medium">Buscar producto existente</label>
            <input
              type="text"
              placeholder="Escribe para buscar productos..."
              value={productSearch}
              onChange={(event) => {
                setProductSearch(event.target.value);
                setShowProductList(true);
              }}
              onFocus={() => setShowProductList(true)}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />

            {showProductList && filteredProducts.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-white shadow-lg">
                {filteredProducts.map((product) => (
                  <div
                    key={product.productid}
                    onClick={() => handleSelectProduct(product)}
                    className="cursor-pointer border-b px-3 py-2 hover:bg-gray-100 last:border-b-0"
                  >
                    <div className="font-medium">{product.productname}</div>
                    <div className="text-xs text-gray-500">
                      ID: {product.productid} - Stock: {product.productstock} - $
                      {Number(product.productpriceofsale ?? 0).toLocaleString("es-CO")}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingBackorderProduct && (
              <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-gray-800">
                <p className="font-medium">
                  Este producto no tiene stock disponible. Deseas agregarlo como bajo pedido?
                </p>
                <p className="text-xs text-gray-600">{pendingBackorderProduct.productname}</p>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPendingBackorderProduct(null)}
                    className="rounded border border-yellow-400 bg-white px-3 py-1 text-yellow-700 hover:bg-yellow-100"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => applyProductSelection(pendingBackorderProduct, true)}
                    className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    disabled={saving}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1 block font-medium">Nombre *</label>
            <input
              type="text"
              value={detailForm.name}
              onChange={(event) =>
                setDetailForm((prev) => ({ ...prev, name: event.target.value }))
              }
              readOnly={!isManualProduct}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block font-medium">Descripcion *</label>
            <AutoGrowTextarea
              value={detailForm.description}
              onChange={(event) =>
                setDetailForm((prev) => ({ ...prev, description: event.target.value }))
              }
              readOnly={!isManualProduct}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripcion del producto"
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Cantidad *</label>
            <input
              type="number"
              min="1"
              value={detailForm.quantity}
              onChange={(event) =>
                setDetailForm((prev) => ({
                  ...prev,
                  quantity: Math.max(1, Number(event.target.value) || 1),
                }))
              }
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>

          <div>
            <label className="mb-1 block font-medium">Precio unitario *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={detailForm.unitPrice}
              onChange={(event) =>
                setDetailForm((prev) => ({
                  ...prev,
                  unitPrice: Math.max(0, Number(event.target.value) || 0),
                }))
              }
              readOnly={!isManualProduct}
              className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={saving}
            />
          </div>
        </div>

        <div className="mb-4 rounded bg-blue-50 p-3 text-sm">
          <strong>Disponibilidad:</strong> {detailForm.availability}
          {detailForm.productId ? (
            <>
              <br />
              <strong>ID Producto:</strong> {detailForm.productId}
            </>
          ) : null}
          <br />
          <strong>Subtotal:</strong> $
          {(detailForm.quantity * detailForm.unitPrice).toLocaleString("es-CO")}
        </div>

        <button
          type="button"
          onClick={handleAddDetail}
          style={{ backgroundColor: Colors.buttons.secondary }}
          className="rounded px-4 py-2 text-white hover:opacity-90"
          disabled={saving}
        >
          Agregar producto
        </button>

        {form.details.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-bold">Productos agregados ({form.details.length})</h4>
            {form.details.map((detail, index) => (
              <div key={`${detail.productId ?? "manual"}-${index}`} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="font-medium text-gray-800">{detail.name || detail.description}</div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(index)}
                    className="cursor-pointer text-sm text-red-500 hover:text-red-700"
                    disabled={saving}
                  >
                    Eliminar
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <span>Cantidad:</span>
                    <button
                      type="button"
                      onClick={() => changeDetailQuantityBy(index, -1)}
                      className="h-8 w-8 rounded border bg-white hover:bg-gray-50"
                      disabled={saving}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={detail.quantity}
                      onChange={(event) =>
                        updateDetailQuantity(index, Number(event.target.value))
                      }
                      className="w-16 rounded border px-2 py-1 text-center"
                      disabled={saving}
                    />
                    <button
                      type="button"
                      onClick={() => changeDetailQuantityBy(index, 1)}
                      className="h-8 w-8 rounded border bg-white hover:bg-gray-50"
                      disabled={saving}
                    >
                      +
                    </button>
                  </div>

                  <div>Precio unitario: ${detail.unitPrice.toLocaleString("es-CO")}</div>
                  <div>Subtotal: ${detail.subtotal.toLocaleString("es-CO")}</div>
                  <div>Disponibilidad: {detail.availability}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-lg border bg-gray-50 p-4">
          <h3 className="mb-3 font-bold">Resumen financiero</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between">
              <span>IVA (19%):</span>
              <span>${tax.toLocaleString("es-CO")}</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>Total:</span>
              <span>${total.toLocaleString("es-CO")}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        style={{ backgroundColor: Colors.buttons.primary }}
        className="w-full cursor-pointer rounded px-4 py-3 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={saving}
      >
        {saving ? "Guardando..." : "Guardar Cotizacion"}
      </button>
    </form>
  );
}
