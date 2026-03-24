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
  laborHours?: number | null;
  technicianCount?: number | null;
  unitPrice: number;
  subtotal: number;
  availability: "DISPONIBLE" | "NO_DISPONIBLE" | "SOLICITAR";
  isBackorder?: boolean;
};

type DetailEntryMode = "CATALOGO" | "MANUAL" | "LABOR";

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

const LABOR_SUGGESTIONS = [
  "Mano de obra de instalacion",
  "Mano de obra de mantenimiento",
  "Visita tecnica especializada",
  "Diagnostico y ajuste tecnico",
];

const formatCompactNumber = (value: number) =>
  Number(value || 0).toLocaleString("es-CO", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 2,
  });

const buildLaborDescription = (
  description: string,
  technicianCount: number,
  laborHours: number,
) =>
  `${description.trim()} (${formatCompactNumber(technicianCount)} tecnico(s) x ${formatCompactNumber(laborHours)} hora(s))`;

const parseLaborBreakdown = (description?: string | null) => {
  const match = String(description ?? "").match(
    /\(([\d.,]+)\s+tecnico\(s\)\s+x\s+([\d.,]+)\s+hora\(s\)\)$/i,
  );

  if (!match) return null;

  const technicianCount = Number(match[1].replace(",", "."));
  const laborHours = Number(match[2].replace(",", "."));
  if (!Number.isFinite(technicianCount) || !Number.isFinite(laborHours)) {
    return null;
  }

  return {
    technicianCount,
    laborHours,
    baseDescription: String(description ?? "")
      .replace(match[0], "")
      .trim(),
  };
};

const normalizeText = (value?: string | null) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const getRequestCustomerLabel = (request: ServiceRequestFromApi) =>
  request.customer?.users
    ? `${request.customer.users.name ?? ""} ${request.customer.users.lastname ?? ""}`.trim()
    : "";

const getRequestTechnicianLabel = (request: ServiceRequestFromApi) =>
  (request.techniciansMap ?? [])
    .map((entry) =>
      entry?.technician?.users
        ? `${entry.technician.users.name ?? ""} ${entry.technician.users.lastname ?? ""}`.trim()
        : ""
    )
    .filter(Boolean)
    .join(", ");

const getRequestSelectLabel = (request: ServiceRequestFromApi) => {
  const customerLabel = getRequestCustomerLabel(request) || "Cliente no disponible";
  return `#${request.serviceRequestId} · ${customerLabel} · ${getRequestStageLabel(
    request.serviceType,
    request.requestMode ?? undefined,
  )}`;
};

export default function RegisterQuoteForm({ onSave }: Props) {
  const [form, setForm] = useState<QuoteFormState>({
    serviceRequestId: "",
    statesId: 5,
    serviceType: "",
    observation: "",
    details: [],
  });
  const [serviceRequests, setServiceRequests] = useState<
    ServiceRequestFromApi[]
  >([]);
  const [selectedServiceRequest, setSelectedServiceRequest] =
    useState<ServiceRequestFromApi | null>(null);
  const [requestSearch, setRequestSearch] = useState("");
  const [showRequestList, setShowRequestList] = useState(false);
  const [requestActiveIndex, setRequestActiveIndex] = useState(0);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  const [products, setProducts] = useState<ProductFromApi[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [showProductList, setShowProductList] = useState(false);
  const [detailEntryMode, setDetailEntryMode] =
    useState<DetailEntryMode>("CATALOGO");
  const [pendingBackorderProduct, setPendingBackorderProduct] =
    useState<ProductFromApi | null>(null);
  const [saving, setSaving] = useState(false);
  const [detailForm, setDetailForm] = useState<QuoteDetailForm>(EMPTY_DETAIL);
  const productRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<HTMLDivElement>(null);
  const requestInputRef = useRef<HTMLInputElement>(null);

  const getDefaultDetailForMode = (mode: DetailEntryMode): QuoteDetailForm => {
    if (mode === "MANUAL") {
      return {
        ...EMPTY_DETAIL,
        availability: "SOLICITAR",
      };
    }

    if (mode === "LABOR") {
      return {
        ...EMPTY_DETAIL,
        name: "Mano de obra",
        description: "Servicio de mano de obra tecnica",
        quantity: 1,
        laborHours: 1,
        technicianCount: 1,
        unitPrice: 0,
        subtotal: 0,
        availability: "DISPONIBLE",
      };
    }

    return {
      ...EMPTY_DETAIL,
      availability: "DISPONIBLE",
    };
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        requestRef.current &&
        !requestRef.current.contains(event.target as Node)
      ) {
        setShowRequestList(false);
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
        setProducts(
          Array.isArray(productsResponse.data) ? productsResponse.data : [],
        );
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

  const filteredServiceRequests = useMemo(() => {
    const query = normalizeText(requestSearch);
    const list = [...serviceRequests].sort(
      (a, b) => Number(b.serviceRequestId) - Number(a.serviceRequestId),
    );

    if (!query) return list.slice(0, 12);

    const scored = list
      .map((request) => {
        const idText = String(request.serviceRequestId);
        const customer = normalizeText(getRequestCustomerLabel(request));
        const technician = normalizeText(getRequestTechnicianLabel(request));
        const document = normalizeText(
          request.customer?.users?.documentnumber ?? "",
        );
        const email = normalizeText(request.customer?.users?.email ?? "");
        const address = normalizeText(request.direccion ?? "");
        const description = normalizeText(request.description ?? "");
        const stage = normalizeText(
          getRequestStageLabel(
            request.serviceType,
            request.requestMode ?? undefined,
          ),
        );
        const haystack = [customer, technician, document, email, address, description, stage]
          .filter(Boolean)
          .join(" ");

        let score = 0;
        if (idText === query) score += 10;
        else if (idText.startsWith(query)) score += 7;
        else if (idText.includes(query)) score += 5;
        if (customer.startsWith(query)) score += 5;
        else if (customer.includes(query)) score += 3;
        if (document.startsWith(query)) score += 5;
        if (email.includes(query)) score += 2;
        if (technician.includes(query)) score += 2;
        if (address.includes(query)) score += 2;
        if (description.includes(query)) score += 1;
        if (stage.includes(query)) score += 1;
        if (!score && haystack.includes(query)) score += 1;

        return { request, score };
      })
      .filter((item) => item.score > 0)
      .sort(
        (a, b) =>
          b.score - a.score ||
          Number(b.request.serviceRequestId) - Number(a.request.serviceRequestId),
      );

    return scored.slice(0, 12).map((item) => item.request);
  }, [requestSearch, serviceRequests]);

  const subtotal = useMemo(
    () =>
      form.details.reduce(
        (acc, detail) => acc + Number(detail.subtotal || 0),
        0,
      ),
    [form.details],
  );
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + tax;

  const handleServiceRequestChange = (serviceRequestId: number) => {
    const selected =
      serviceRequests.find(
        (request) => request.serviceRequestId === serviceRequestId,
      ) ?? null;
    setSelectedServiceRequest(selected);
    setRequestSearch("");
    setShowRequestList(false);
    setRequestActiveIndex(0);
    setForm((prev) => ({
      ...prev,
      serviceRequestId: selected?.serviceRequestId ?? "",
      serviceType: selected?.serviceType ?? "",
    }));
  };

  const handleProductModeChange = (manual: boolean) => {
    const nextMode: DetailEntryMode = manual ? "MANUAL" : "CATALOGO";
    setDetailEntryMode(nextMode);
    setPendingBackorderProduct(null);
    setProductSearch("");
    setShowProductList(false);
    setDetailForm(getDefaultDetailForMode(nextMode));
  };

  const handleLaborMode = () => {
    setDetailEntryMode("LABOR");
    setPendingBackorderProduct(null);
    setProductSearch("");
    setShowProductList(false);
    setDetailForm(getDefaultDetailForMode("LABOR"));
  };

  const applyProductSelection = (
    product: ProductFromApi,
    isBackorder: boolean,
  ) => {
    const unitPrice = Number(product.productpriceofsale ?? 0);
    setDetailForm({
      productId: product.productid,
      name: product.productname,
      description: product.productdescription ?? product.productname,
      quantity: 1,
      laborHours: null,
      technicianCount: null,
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
      showError("La descripción es obligatoria");
      return;
    }

    const laborHours = Math.max(
      0.5,
      Number(detailForm.laborHours ?? detailForm.quantity) || 0.5,
    );
    const technicianCount = Math.max(
      1,
      Number(detailForm.technicianCount ?? 1) || 1,
    );
    const billedQuantity = isLaborMode
      ? Number((laborHours * technicianCount).toFixed(2))
      : detailForm.quantity;

    if (billedQuantity <= 0 || detailForm.unitPrice < 0) {
      showError("Cantidad o precio inválidos");
      return;
    }

    const normalizedSubtotal = billedQuantity * detailForm.unitPrice;
    const normalizedDescription = isLaborMode
      ? buildLaborDescription(
          detailForm.description,
          technicianCount,
          laborHours,
        )
      : detailForm.description.trim();

    const nextDetail: QuoteDetailForm = {
      ...detailForm,
      description: normalizedDescription,
      quantity: billedQuantity,
      laborHours: isLaborMode ? laborHours : null,
      technicianCount: isLaborMode ? technicianCount : null,
      subtotal: normalizedSubtotal,
      availability: isLaborMode
        ? "DISPONIBLE"
        : isManualProduct
          ? "SOLICITAR"
          : detailForm.productId
            ? detailForm.availability
            : "NO_DISPONIBLE",
    };

    setForm((prev) => {
      const nextDetails = [...prev.details];
      const normalizedDescriptionKey = normalizedDescription.toLowerCase();

      const existingIndex = nextDetails.findIndex((detail) => {
        if (nextDetail.productId) {
          return detail.productId === nextDetail.productId;
        }
        return (
          detail.productId === null &&
          detail.description.trim().toLowerCase() === normalizedDescriptionKey
        );
      });

      if (existingIndex >= 0) {
        const current = nextDetails[existingIndex];
        const quantity = Number(
          (current.quantity + nextDetail.quantity).toFixed(2),
        );
        nextDetails[existingIndex] = {
          ...current,
          quantity,
          unitPrice: nextDetail.unitPrice,
          subtotal: quantity * nextDetail.unitPrice,
          isBackorder: Boolean(current.isBackorder || nextDetail.isBackorder),
          laborHours:
            (current.laborHours ?? 0) + (nextDetail.laborHours ?? 0) || null,
          technicianCount:
            current.technicianCount ?? nextDetail.technicianCount ?? null,
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
      ...getDefaultDetailForMode(detailEntryMode),
      unitPrice: isLaborMode ? detailForm.unitPrice : 0,
    });
    setProductSearch("");
  };

  const isManualProduct = detailEntryMode === "MANUAL";
  const isLaborMode = detailEntryMode === "LABOR";
  const laborHoursInput = Math.max(
    0.5,
    Number(detailForm.laborHours ?? detailForm.quantity) || 0.5,
  );
  const technicianCountInput = Math.max(
    1,
    Number(detailForm.technicianCount ?? 1) || 1,
  );
  const currentLineSubtotal = isLaborMode
    ? laborHoursInput * technicianCountInput * detailForm.unitPrice
    : detailForm.quantity * detailForm.unitPrice;

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

      const minimumQuantity = current.productId ? 1 : 0.5;
      let quantity = Math.max(
        minimumQuantity,
        Number(quantityRaw) || minimumQuantity,
      );
      const product = products.find(
        (item) => item.productid === current.productId,
      );
      if (product && current.productId && !current.isBackorder) {
        quantity = Math.min(
          quantity,
          Math.max(1, Number(product.productstock || 1)),
        );
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
    const step = current.productId ? 1 : 0.5;
    updateDetailQuantity(index, current.quantity + delta * step);
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
      showError("Agrega al menos un concepto a la cotización");
      return;
    }

    const clientId = Number(selectedServiceRequest.customer?.customerid ?? 0);
    if (!clientId) {
      showError("La solicitud seleccionada no tiene un cliente válido");
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
      showSuccess("Cotización guardada exitosamente");
      setForm({
        serviceRequestId: "",
        statesId: 5,
        serviceType: "",
        observation: "",
        details: [],
      });
      setSelectedServiceRequest(null);
      setRequestSearch("");
      setShowRequestList(false);
      setDetailForm(EMPTY_DETAIL);
      setProductSearch("");
      setDetailEntryMode("CATALOGO");
      setPendingBackorderProduct(null);
    } catch (error) {
      console.error(error);
      showError("Error al guardar la cotización");
    } finally {
      setSaving(false);
    }
  };

  if (isLoadingRequests) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-gray-500 font-medium uppercase tracking-widest text-sm animate-pulse">
          Sincronizando datos...
        </div>
      </div>
    );
  }

  const customerLabel = selectedServiceRequest?.customer?.users
    ? `${selectedServiceRequest.customer.users.name ?? ""} ${selectedServiceRequest.customer.users.lastname ?? ""}`.trim()
    : "";

  const technicianLabel = selectedServiceRequest?.techniciansMap?.[0]
    ?.technician?.users
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-sm"
    >
      {/* Sección: Selección de Solicitud */}
      <div>
        <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
          Asesoría / Solicitud Base <span className="text-red-600">*</span>
        </label>
        <div ref={requestRef} className="relative">
          <input
            ref={requestInputRef}
            value={requestSearch}
            onChange={(event) => {
              setRequestSearch(event.target.value);
              setShowRequestList(true);
              setRequestActiveIndex(0);
            }}
            onFocus={() => setShowRequestList(true)}
            onKeyDown={(event) => {
              if (!showRequestList) return;

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setRequestActiveIndex((index) =>
                  Math.min(
                    index + 1,
                    Math.max(0, filteredServiceRequests.length - 1),
                  ),
                );
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setRequestActiveIndex((index) => Math.max(index - 1, 0));
                return;
              }

              if (
                event.key === "Enter" &&
                filteredServiceRequests[requestActiveIndex]
              ) {
                event.preventDefault();
                handleServiceRequestChange(
                  filteredServiceRequests[requestActiveIndex].serviceRequestId,
                );
                return;
              }

              if (event.key === "Escape") {
                setShowRequestList(false);
              }
            }}
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
            placeholder="Busca por ID, cliente, documento, direccion, servicio o tecnico"
            disabled={saving}
          />

          {showRequestList && !saving && (
            <div className="absolute z-20 mt-2 max-h-96 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">
              {filteredServiceRequests.length ? (
                filteredServiceRequests.map((request, index) => {
                  const customer = getRequestCustomerLabel(request);
                  const technician = getRequestTechnicianLabel(request);
                  const stageLabel = getRequestStageLabel(
                    request.serviceType,
                    request.requestMode ?? undefined,
                  );
                  const active = index === requestActiveIndex;
                  const selected =
                    Number(form.serviceRequestId || 0) === request.serviceRequestId;

                  return (
                    <button
                      key={request.serviceRequestId}
                      type="button"
                      onClick={() =>
                        handleServiceRequestChange(request.serviceRequestId)
                      }
                      className={[
                        "w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0",
                        active || selected
                          ? "bg-gray-900 text-white"
                          : "bg-white text-gray-900 hover:bg-gray-50",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-semibold">
                          SRV-{String(request.serviceRequestId).padStart(6, "0")}
                        </div>
                        <span
                          className={[
                            "rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide",
                            active || selected
                              ? "bg-white/15 text-white"
                              : "bg-gray-100 text-gray-600",
                          ].join(" ")}
                        >
                          {stageLabel}
                        </span>
                      </div>

                      <div
                        className={[
                          "mt-2 text-sm font-medium",
                          active || selected ? "text-white" : "text-gray-800",
                        ].join(" ")}
                      >
                        {customer || "Cliente no disponible"}
                      </div>

                      <div
                        className={[
                          "mt-1 grid gap-1 text-xs md:grid-cols-2",
                          active || selected ? "text-white/80" : "text-gray-500",
                        ].join(" ")}
                      >
                        <span>
                          Doc: {request.customer?.users?.documentnumber ?? "N/A"}
                        </span>
                        <span>
                          Tecnico: {technician || "Sin tecnico asignado"}
                        </span>
                        <span className="md:col-span-2">
                          Direccion: {request.direccion || "Sin direccion"}
                        </span>
                        <span className="md:col-span-2">
                          Descripcion: {request.description || "Sin descripcion"}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-4 text-sm text-gray-500">
                  No encontramos solicitudes con ese criterio.
                </div>
              )}
            </div>
          )}
        </div>

        {selectedServiceRequest && (
          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Solicitud seleccionada
                </p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {getRequestSelectLabel(selectedServiceRequest)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Direccion: {selectedServiceRequest.direccion || "Sin direccion"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedServiceRequest(null);
                  setForm((prev) => ({
                    ...prev,
                    serviceRequestId: "",
                    serviceType: "",
                  }));
                  setRequestSearch("");
                  setShowRequestList(false);
                  requestInputRef.current?.focus();
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                disabled={saving}
              >
                Cambiar solicitud
              </button>
            </div>
          </div>
        )}

        <input type="hidden" value={form.serviceRequestId} required readOnly />
        <p className="mt-2 text-xs font-medium text-gray-500 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          Solo solicitudes con técnico asignado y sin cotización activa.
        </p>
        <p className="mt-1 text-[11px] text-gray-400">
          Puedes buscar por ID, nombre o documento del cliente, direccion,
          descripcion, tipo o tecnico asignado.
        </p>
      </div>

      {/* Sección: Panel de Información Técnica */}
      {selectedServiceRequest && (
        <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/50 p-6 shadow-inner">
          <h3 className="font-extrabold text-gray-900 uppercase tracking-wider text-xs border-b border-gray-200 pb-2">
            Detalles Técnicos de la Solicitud
          </h3>

          {isInstallationAssessment && (
            <div className="rounded-md border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
              <strong className="uppercase text-xs tracking-wide">
                [{selectedRequestStageLabel}]:
              </strong>{" "}
              {selectedServiceRequest?.requestMode === "DIRECT_INSTALLATION"
                ? getQuotedInstallationCopy(selectedServiceRequest?.requestMode)
                : getInstallationAssessmentExplainer()}
            </div>
          )}

          {selectedServiceRequest?.requestMode === "DIRECT_INSTALLATION" && (
            <div className="rounded-md border-l-4 border-sky-500 bg-sky-50 p-4 text-sm text-sky-900 shadow-sm">
              <strong className="uppercase text-xs tracking-wide">
                Revisión Técnica:
              </strong>{" "}
              {selectedReviewStatus}
              <div className="mt-1 border-t border-sky-200 pt-2 text-xs">
                {getQuotedInstallationCopy(selectedServiceRequest?.requestMode)}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Datos del Cliente
              </div>
              <div className="font-bold text-gray-800 text-base">
                {customerLabel || "No disponible"}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                DOC:{" "}
                {selectedServiceRequest.customer?.users?.documentnumber ??
                  "N/A"}
              </div>
              <div className="text-xs text-gray-500">
                MAIL: {selectedServiceRequest.customer?.users?.email ?? "N/A"}
              </div>
            </div>

            <div className="space-y-1 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Asignación Operativa
              </div>
              <div className="font-bold text-gray-800 text-base">
                {technicianLabel || "Sin técnico asignado"}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                <span className="font-mono">UBICACIÓN:</span>{" "}
                {selectedServiceRequest.direccion ?? "N/A"}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {isInstallationAssessment
                ? "Bitácora de Asesoría"
                : "Descripción del Requerimiento"}
            </div>
            <p className="rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-700 leading-relaxed italic">
              "
              {selectedServiceRequest.description ??
                "Sin descripción registrada"}
              "
            </p>
          </div>

          {selectedServiceRequest?.requestMode === "DIRECT_INSTALLATION" && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
              <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b pb-2">
                  Checklist de Infraestructura
                </div>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Zona:</span>{" "}
                    <span className="text-right">
                      {selectedServiceRequest.siteChecklist?.installationArea ||
                        "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Altura de trabajo:</span>{" "}
                    <span className="text-right">
                      {selectedServiceRequest.siteChecklist
                        ?.installationHeight || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Cableado estimado:</span>{" "}
                    <span className="text-right">
                      {selectedServiceRequest.siteChecklist
                        ?.estimatedCableMeters || "-"}
                    </span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-dashed">
                    <span className="font-medium block mb-1">
                      Materiales en sitio:
                    </span>
                    <span className="text-xs text-gray-600 block">
                      {selectedServiceRequest.siteChecklist?.materialsSummary ||
                        "Ninguno reportado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b pb-2">
                  Inventario Previo (Propiedad del Cliente)
                </div>
                {selectedServiceRequest.purchasedMaterials?.length ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedServiceRequest.purchasedMaterials.map(
                      (item, index) => (
                        <div
                          key={`${item.productId ?? item.name}-${index}`}
                          className="rounded flex justify-between items-center border border-gray-100 bg-gray-50 px-3 py-2"
                        >
                          <div>
                            <p className="font-bold text-gray-800 text-xs">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase">
                              Cant: {item.quantity}
                            </p>
                          </div>
                          {item.unitPrice != null && (
                            <span className="text-xs font-mono font-bold text-gray-700">
                              ${item.unitPrice.toLocaleString("es-CO")}
                            </span>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-4 text-center">
                    Sin materiales vinculados previos.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sección: Campos Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
            Clasificación de Servicio
          </label>
          <input
            type="text"
            value={selectedRequestStageLabel}
            readOnly
            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500 font-medium cursor-not-allowed"
          />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
            Notas Internas
          </label>
          <AutoGrowTextarea
            value={form.observation}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, observation: event.target.value }))
            }
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
            placeholder="Anotaciones técnicas de la cotización..."
            disabled={saving}
          />
        </div>
      </div>

      {/* Sección: Constructor de Cotización */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="bg-gray-900 px-6 py-4">
          <h3 className="font-extrabold text-white uppercase tracking-wider text-sm">
            Constructor de Cotizacion
          </h3>
          <p className="mt-1 text-xs text-gray-300">
            Puedes cotizar productos, conceptos manuales o solo mano de obra por horas.
          </p>
        </div>

        <div className="p-6">
          <div className="mb-6 flex gap-3 p-1 bg-gray-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => handleProductModeChange(false)}
              className={`rounded-md px-6 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                !isManualProduct
                  ? "bg-gray-900 text-white shadow"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              disabled={saving}
            >
              Catálogo
            </button>
            <button
              type="button"
              onClick={() => handleProductModeChange(true)}
              className={`rounded-md px-6 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                isManualProduct
                  ? "bg-gray-900 text-white shadow"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              disabled={saving}
            >
              Entrada Manual
            </button>
            <button
              type="button"
              onClick={handleLaborMode}
              className={`rounded-md px-6 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                isLaborMode
                  ? "bg-gray-900 text-white shadow"
                  : "text-gray-500 hover:text-gray-900"
              }`}
              disabled={saving}
            >
              Mano de Obra
            </button>
          </div>

          {!isManualProduct && !isLaborMode && (
            <div
              ref={productRef}
              className="relative mb-6 border-b border-gray-100 pb-6"
            >
              <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                Buscador de Inventario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Código o nombre del producto..."
                  value={productSearch}
                  onChange={(event) => {
                    setProductSearch(event.target.value);
                    setShowProductList(true);
                  }}
                  onFocus={() => setShowProductList(true)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors"
                  disabled={saving}
                />
              </div>

              {showProductList && filteredProducts.length > 0 && (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-xl">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.productid}
                      onClick={() => handleSelectProduct(product)}
                      className="cursor-pointer border-b border-gray-100 px-4 py-3 hover:bg-gray-50 transition-colors last:border-b-0"
                    >
                      <div className="font-bold text-gray-800 text-sm">
                        {product.productname}
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 mt-1 flex justify-between">
                        <span>
                          SKU: {product.productid} | STOCK:{" "}
                          <span
                            className={
                              product.productstock > 0
                                ? "text-green-600 font-bold"
                                : "text-red-500 font-bold"
                            }
                          >
                            {product.productstock}
                          </span>
                        </span>
                        <span className="font-bold text-gray-700">
                          $
                          {Number(
                            product.productpriceofsale ?? 0,
                          ).toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pendingBackorderProduct && (
                <div className="mt-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 shadow-sm">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide">
                        Stock Agotado
                      </h3>
                      <p className="mt-1 text-xs text-yellow-700">
                        {pendingBackorderProduct.productname} se agregará como
                        pedido en <strong>Backorder</strong>.
                      </p>
                      <div className="mt-3 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setPendingBackorderProduct(null)}
                          className="text-xs font-bold uppercase text-yellow-800 hover:text-yellow-900"
                          disabled={saving}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            applyProductSelection(pendingBackorderProduct, true)
                          }
                          className="rounded bg-yellow-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white hover:bg-yellow-700 transition-colors"
                          disabled={saving}
                        >
                          Confirmar Backorder
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {isLaborMode && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
                Cotizacion de mano de obra
              </p>
              <p className="mt-1 text-sm text-amber-900">
                Usa horas por tecnico, cantidad estimada de tecnicos y tarifa
                por hora para cotizar solo labor tecnica, sin necesidad de
                agregar productos.
              </p>
              <p className="mt-2 text-xs text-amber-800">
                El total se calcula como: horas por tecnico x tecnicos
                estimados x tarifa por hora.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {LABOR_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      setDetailForm((prev) => ({
                        ...prev,
                        name: suggestion,
                        description: suggestion,
                      }))
                    }
                    className="rounded-full border border-amber-300 bg-white px-3 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                    disabled={saving}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-5 items-start">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                {isLaborMode ? "Concepto de mano de obra" : "Item / Producto"} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={detailForm.name}
                onChange={(event) =>
                  setDetailForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                readOnly={!isManualProduct && !isLaborMode}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 transition-colors"
                disabled={saving}
                placeholder={isLaborMode ? "Ej. Mano de obra de instalacion CCTV" : "Nombre descriptivo"}
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                {isLaborMode ? "Horas por tecnico" : "Cant."} <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                min={isLaborMode ? "0.5" : "1"}
                step={isLaborMode ? "0.5" : "1"}
                value={isLaborMode ? laborHoursInput : detailForm.quantity}
                onChange={(event) =>
                  setDetailForm((prev) => {
                    const nextValue = Math.max(
                      isLaborMode ? 0.5 : 1,
                      Number(event.target.value) || (isLaborMode ? 0.5 : 1),
                    );
                    return isLaborMode
                      ? {
                          ...prev,
                          laborHours: nextValue,
                          quantity: nextValue,
                        }
                      : {
                          ...prev,
                          quantity: nextValue,
                        };
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 text-center font-mono transition-colors"
                disabled={saving}
              />
            </div>

            {isLaborMode && (
              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Tecnicos estimados <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={technicianCountInput}
                  onChange={(event) =>
                    setDetailForm((prev) => ({
                      ...prev,
                      technicianCount: Math.max(
                        1,
                        Math.round(Number(event.target.value) || 1),
                      ),
                    }))
                  }
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 text-center font-mono transition-colors"
                  disabled={saving}
                />
              </div>
            )}

            <div>
              <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                {isLaborMode ? "Tarifa por hora" : "P. Unitario"} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 font-mono">
                  $
                </span>
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
                  readOnly={!isManualProduct && !isLaborMode}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 font-mono transition-colors"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="mb-2 block text-xs font-bold text-gray-700 uppercase tracking-wide">
                {isLaborMode
                  ? "Alcance del servicio (Visible en Cotización)"
                  : "Especificaciones (Visible en Cotización)"}
              </label>
              <AutoGrowTextarea
                value={detailForm.description}
                onChange={(event) =>
                  setDetailForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                readOnly={!isManualProduct && !isLaborMode}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm transition-colors"
                placeholder={
                  isLaborMode
                    ? "Describe alcance, actividades, condiciones y tiempo estimado del trabajo..."
                    : "Detalles técnicos o condiciones del producto..."
                }
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
            <div className="text-sm flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                Estado:{" "}
                <span className="text-gray-900">{detailForm.availability}</span>{" "}
                {detailForm.productId && `| SKU: ${detailForm.productId}`}
              </span>
              <span className="text-lg font-bold text-gray-900 font-mono">
                {isLaborMode ? "Subtotal Mano de Obra: $" : "Subtotal Línea: $"}
                {currentLineSubtotal.toLocaleString("es-CO")}
              </span>
              {isLaborMode && (
                <span className="text-xs text-amber-700">
                  {formatCompactNumber(technicianCountInput)} tecnico(s) x{" "}
                  {formatCompactNumber(laborHoursInput)} hora(s) ={" "}
                  {formatCompactNumber(
                    laborHoursInput * technicianCountInput,
                  )}{" "}
                  hora(s)-tecnico facturables
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddDetail}
              style={{ backgroundColor: Colors.buttons.secondary }}
              className="w-full sm:w-auto rounded-lg px-8 py-3 text-xs font-black uppercase tracking-widest text-white hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2"
              disabled={saving}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              Añadir Línea
            </button>
          </div>
        </div>
      </div>

      {/* Sección: Lista de Productos Agregados */}
      {form.details.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-extrabold text-gray-900 uppercase tracking-wider text-sm border-b-2 border-gray-900 pb-2 inline-block">
            Líneas de Cotización ({form.details.length})
          </h4>

          <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {form.details.map((detail, index) => {
              const laborBreakdown = parseLaborBreakdown(detail.description);

              return (
                <div
                  key={`${detail.productId ?? "manual"}-${index}`}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm truncate">
                      {detail.name ||
                        laborBreakdown?.baseDescription ||
                        detail.description}
                    </span>
                    {detail.availability !== "DISPONIBLE" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-100 text-yellow-800 tracking-wider">
                        {detail.availability}
                      </span>
                    )}
                    {laborBreakdown && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        Mano de obra
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate">
                    {laborBreakdown
                      ? `${formatCompactNumber(
                          laborBreakdown.technicianCount,
                        )} tecnico(s) x ${formatCompactNumber(
                          laborBreakdown.laborHours,
                        )} hora(s) = ${formatCompactNumber(
                          detail.quantity,
                        )} hora(s)-tecnico`
                      : detail.description !== detail.name
                        ? detail.description
                        : ""}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                  {/* Controles de Cantidad */}
                  <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => changeDetailQuantityBy(index, -1)}
                      className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center font-bold"
                      disabled={saving || Boolean(laborBreakdown)}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={detail.productId ? 1 : 0.5}
                      step={detail.productId ? 1 : 0.5}
                      value={detail.quantity}
                      onChange={(event) =>
                        updateDetailQuantity(index, Number(event.target.value))
                      }
                      className="h-8 w-12 text-center text-sm font-bold font-mono text-gray-800 border-x border-gray-300 focus:outline-none"
                      disabled={saving || Boolean(laborBreakdown)}
                    />
                    <button
                      type="button"
                      onClick={() => changeDetailQuantityBy(index, 1)}
                      className="h-8 w-8 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors flex items-center justify-center font-bold"
                      disabled={saving || Boolean(laborBreakdown)}
                    >
                      +
                    </button>
                  </div>

                  {/* Precios y Acción */}
                  <div className="flex flex-col items-end min-w-[100px]">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                      Total Línea
                    </span>
                    <span className="font-bold text-gray-900 font-mono text-sm">
                      ${detail.subtotal.toLocaleString("es-CO")}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDetail(index)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Eliminar línea"
                    disabled={saving}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      ></path>
                    </svg>
                  </button>
                </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sección: Totalizador Fijo (Diseño Corporativo) */}
      <div className="mt-4 flex flex-col md:flex-row gap-6 items-end justify-between border-t-4 border-gray-900 pt-6">
        <div className="w-full md:w-1/2 space-y-2 text-sm font-mono text-gray-600">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="uppercase tracking-widest font-bold text-xs">
              Subtotal Base:
            </span>
            <span>${subtotal.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="uppercase tracking-widest font-bold text-xs">
              Impuesto (19%):
            </span>
            <span>${tax.toLocaleString("es-CO")}</span>
          </div>
          <div className="flex justify-between pt-2 text-xl font-black text-gray-900">
            <span className="uppercase tracking-widest text-sm self-center">
              Gran Total:
            </span>
            <span className="text-red-700">
              ${total.toLocaleString("es-CO")}
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <button
            type="submit"
            style={{ backgroundColor: Colors.buttons.primary }}
            className="w-full md:w-auto shadow-lg shadow-red-900/20 rounded-lg px-12 py-4 text-sm font-black uppercase tracking-[0.15em] text-white hover:-translate-y-0.5 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={saving}
          >
            {saving ? "Procesando..." : "Emitir Cotización"}
          </button>
        </div>
      </div>
    </form>
  );
}
