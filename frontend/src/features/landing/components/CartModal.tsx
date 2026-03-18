"use client";

import { X, ChevronUp, ChevronDown, WalletCards } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { City } from "country-state-city";

import ClientCreateRequestModal, {
  type CreateRequestPayload,
} from "@/features/dashboard/requests/components/ClientRequestModal";
import {
  createServiceRequest,
  deleteServiceRequest,
} from "@/features/dashboard/requests/services/servicerequests.service";
import {
  createSaleFromAuth,
  createWompiCheckoutSession,
} from "@/features/dashboard/sales/api/sales.api";
import {
  useCart,
  type CartItem,
  type CartServiceDraft,
} from "../contexts/CartContext";
import { showError, showInfo, showSuccess } from "@/shared/utils/notifications";

function getUserFromToken(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);

    const now = Math.floor(Date.now() / 1000);
    if (!payload.userid || payload.exp < now) return null;

    return {
      userid: payload.userid,
      email: payload.email,
      name: payload.name,
      roleid: payload.roleid,
      rolename: payload.rolename,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

type SessionUser = {
  userid: number;
  email: string;
  name: string;
  roleid: number;
  rolename: string;
  exp: number;
};

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CartAddress = {
  city: string;
  zone: string;
  streetType: string;
  streetNumber: string;
  secondaryNumber: string;
  complement: string;
};

const DELIVERY_FEE = 20000;
const SERVICE_VISIT_FEE = 50000;
const TAX_PERCENT = 19;
const CART_ADDRESS_STORAGE_PREFIX = "vertecx_cart_address";
const EMPTY_ADDRESS: CartAddress = {
  city: "",
  zone: "",
  streetType: "",
  streetNumber: "",
  secondaryNumber: "",
  complement: "",
};

type SaleDetailPayload = {
  productid: number;
  quantity: number;
  unitprice: number;
  discountpercent: number;
  servicerequestid?: number;
};

type SaleFromAuthPayload = {
  saledate: string;
  salecode: string;
  subtotal: number;
  taxpercent: number;
  taxamount: number;
  discountamount: number;
  shippingamount: number;
  totalamount: number;
  paymentmethod: string;
  salestatus: string;
  notes: string;
  details: SaleDetailPayload[];
};

const STREET_TYPES = [
  { value: "Calle", label: "Calle" },
  { value: "Carrera", label: "Carrera" },
  { value: "Avenida", label: "Avenida" },
  { value: "Avenida Calle", label: "Av. Calle" },
  { value: "Avenida Carrera", label: "Av. Carrera" },
  { value: "Transversal", label: "Transversal" },
  { value: "Diagonal", label: "Diagonal" },
  { value: "Circular", label: "Circular" },
];

type PlaceSuggestion = {
  placeId?: string | null;
  label: string;
  fullText?: string;
  secondaryText?: string;
};

const normalizeText = (value: string) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const COLOMBIA_CITY_NAMES: string[] = (() => {
  const list = City.getCitiesOfCountry("CO") ?? [];
  const seen = new Set<string>();
  const out: string[] = [];

  for (const city of list.sort((a, b) => a.name.localeCompare(b.name))) {
    const key = normalizeText(city.name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(city.name);
  }

  return out;
})();

const COLOMBIA_CITY_SET = new Set(COLOMBIA_CITY_NAMES.map(normalizeText));

function getServiceRequestNumericId(row: any): number | null {
  const id = Number(row?.serviceRequestId ?? row?.servicerequestid ?? row?.id);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function buildSalePayload({
  cart,
  serviceRequestIds,
  deliveryAddress,
  deliveryFee,
  serviceVisitFeeTotal,
}: {
  cart: CartItem[];
  serviceRequestIds: Map<string, number>;
  deliveryAddress: string;
  deliveryFee: number;
  serviceVisitFeeTotal: number;
}): SaleFromAuthPayload {
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  const taxpercent = TAX_PERCENT;
  const taxamount = Math.round((subtotal * taxpercent) / 100);
  const shippingamount = deliveryFee + serviceVisitFeeTotal;
  const serviceRequestsCount = Array.from(serviceRequestIds.values()).length;

  return {
    saledate: new Date().toISOString(),
    salecode: `VEN-${Date.now()}`,
    subtotal,
    taxpercent,
    taxamount,
    discountamount: 0,
    shippingamount,
    totalamount: subtotal + taxamount + shippingamount,
    paymentmethod: "Transfer",
    salestatus: "Pending",
    notes: `Venta creada desde carrito. Direccion de entrega: ${deliveryAddress}. Envio: $${deliveryFee.toLocaleString(
      "es-CO",
    )}. Visitas tecnicas: ${serviceRequestsCount} por $${serviceVisitFeeTotal.toLocaleString(
      "es-CO",
    )}.`,
    details: cart.map((item) => {
      const serviceRequestId = serviceRequestIds.get(String(item.id));

      return {
        productid: Number(item.id),
        quantity: item.quantity,
        unitprice: item.price,
        discountpercent: 0,
        ...(serviceRequestId ? { servicerequestid: serviceRequestId } : {}),
      };
    }),
  };
}

function submitWompiWebCheckout(session: Record<string, any>) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("El checkout de Wompi solo puede abrirse desde el navegador.");
  }

  const form = document.createElement("form");
  form.method = "GET";
  form.action = "https://checkout.wompi.co/p/";
  form.style.display = "none";

  const appendField = (name: string, value: string | number | undefined | null) => {
    if (value === undefined || value === null || `${value}`.trim() === "") return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  };

  appendField("public-key", session.publicKey);
  appendField("currency", session.currency);
  appendField("amount-in-cents", session.amountInCents);
  appendField("reference", session.reference);
  appendField("signature:integrity", session.signature?.integrity);
  appendField("redirect-url", session.redirectUrl);
  appendField("expiration-time", session.expirationTime);
  appendField("customer-data:email", session.customerData?.email);

  document.body.appendChild(form);
  form.submit();
  window.setTimeout(() => {
    form.remove();
  }, 1000);
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const [openProducts, setOpenProducts] = useState<Set<string>>(new Set());
  const [addressError, setAddressError] = useState("");
  const [openServiceModal, setOpenServiceModal] = useState(false);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(
    null,
  );
  const [authUser, setAuthUser] = useState<SessionUser | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const [address, setAddress] = useState<CartAddress>(EMPTY_ADDRESS);
  const [zoneSuggestions, setZoneSuggestions] = useState<PlaceSuggestion[]>([]);
  const [zoneSuggestionsLoading, setZoneSuggestionsLoading] = useState(false);
  const [placesProviderReady, setPlacesProviderReady] = useState(true);

  const updateAddressField = (field: keyof typeof address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    if (addressError) setAddressError("");
  };

  const {
    cart,
    updateQuantity,
    removeFromCart,
    setServiceSelection,
    saveServiceDraft,
    clearServiceDraft,
    clearCart,
  } = useCart();

  const getAddressStorageKey = (userId: number) =>
    `${CART_ADDRESS_STORAGE_PREFIX}:${userId}`;

  const hydrateSavedAddress = (raw: string | null): CartAddress | null => {
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as Partial<CartAddress>;
      return {
        city: String(parsed.city ?? ""),
        zone: String(parsed.zone ?? ""),
        streetType: String(parsed.streetType ?? ""),
        streetNumber: String(parsed.streetNumber ?? ""),
        secondaryNumber: String(parsed.secondaryNumber ?? ""),
        complement: String(parsed.complement ?? ""),
      };
    } catch {
      return null;
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setAuthUser(getUserFromToken());
    setOpenProducts(new Set(cart.map((item) => String(item.id))));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !authUser?.userid || typeof window === "undefined") return;

    const savedAddress = hydrateSavedAddress(
      window.localStorage.getItem(getAddressStorageKey(authUser.userid)),
    );

    if (savedAddress) {
      setAddress(savedAddress);
    }
  }, [isOpen, authUser?.userid]);

  useEffect(() => {
    if (isOpen) return;
    resetServiceModal();
  }, [isOpen]);

  useEffect(() => {
    if (!authUser?.userid || typeof window === "undefined") return;

    const storageKey = getAddressStorageKey(authUser.userid);
    const hasData = Object.values(address).some((value) =>
      String(value ?? "").trim(),
    );

    if (!hasData) {
      window.localStorage.removeItem(storageKey);
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(address));
  }, [authUser?.userid, address]);

  useEffect(() => {
    setOpenProducts((prev) => {
      const currentIds = Array.from(prev);
      const newIds = cart.map((item) => String(item.id));

      return new Set([
        ...currentIds.filter((id) => newIds.includes(id)),
        ...newIds.filter((id) => !currentIds.includes(id)),
      ]);
    });
  }, [cart]);

  const selectedCartItem = useMemo(
    () =>
      selectedCartItemId
        ? (cart.find((item) => String(item.id) === selectedCartItemId) ?? null)
        : null,
    [cart, selectedCartItemId],
  );

  useEffect(() => {
    const query = String(address.zone || "").trim();
    const city = String(address.city || "").trim();

    if (query.length < 2) {
      setZoneSuggestions([]);
      setZoneSuggestionsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setZoneSuggestionsLoading(true);
        const params = new URLSearchParams({ query });
        if (city) params.set("city", city);

        const response = await fetch(
          `/api/places/autocomplete?${params.toString()}`,
          {
            method: "GET",
            signal: controller.signal,
            cache: "no-store",
          },
        );

        const payload = (await response.json()) as {
          suggestions?: PlaceSuggestion[];
          providerReady?: boolean;
        };

        setZoneSuggestions(
          Array.isArray(payload?.suggestions) ? payload.suggestions : [],
        );
        setPlacesProviderReady(payload?.providerReady !== false);
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setZoneSuggestions([]);
      } finally {
        setZoneSuggestionsLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [address.zone, address.city]);

  if (!isOpen) return null;

  const selectedServiceItems = cart.filter((item) => item.service);
  const configuredServiceItems = selectedServiceItems.filter(
    (item) => item.serviceDraft,
  );
  const pendingServiceItems = selectedServiceItems.filter(
    (item) => !item.serviceDraft,
  );
  const hasSelectedService = selectedServiceItems.length > 0;
  const productsSubtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const serviceVisitFeeTotal = selectedServiceItems.length * SERVICE_VISIT_FEE;
  const taxAmount = Math.round((productsSubtotal * TAX_PERCENT) / 100);
  const checkoutTotal =
    productsSubtotal + DELIVERY_FEE + taxAmount + serviceVisitFeeTotal;

  const validateAddress = (): string | null => {
    if (!address.city.trim()) return "Seleccione una ciudad";
    if (!COLOMBIA_CITY_SET.has(normalizeText(address.city))) {
      return "Selecciona una ciudad valida de Colombia";
    }
    if (address.zone.trim().length < 3)
      return "Ingresa un barrio o zona valida";
    if (!address.streetType) return "Seleccione el tipo de via";
    if (!address.streetNumber.trim()) return "Ingrese el numero de la via";
    if (!address.secondaryNumber.trim()) return "Ingrese el numero secundario";
    return null;
  };

  const fullAddress = [
    [address.streetType, address.streetNumber].filter(Boolean).join(" ").trim(),
    address.secondaryNumber ? `#${address.secondaryNumber}` : "",
    [address.zone, address.city].filter(Boolean).join(", ").trim(),
    address.complement ? `(${address.complement})` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const mapQuery = encodeURIComponent(
    fullAddress || [address.zone, address.city, "Colombia"].filter(Boolean).join(", ")
  );
  const mapEmbedUrl = `https://www.google.com/maps?q=${mapQuery}&z=16&output=embed`;
  const mapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

  const hasAddressDraft = Object.values(address).some((value) =>
    String(value || "").trim(),
  );

  function resetServiceModal() {
    setOpenServiceModal(false);
    setSelectedCartItemId(null);
  }

  const handleOpenServiceModal = (item: CartItem) => {
    if (!authUser) {
      showError("Debes iniciar sesion para solicitar un servicio.");
      return;
    }

    if (!item.service) {
      setServiceSelection(String(item.id), true);
    }

    setAddressError("");
    setSelectedCartItemId(String(item.id));
    setOpenServiceModal(true);

    if (!fullAddress) {
      showInfo(
        "Puedes terminar la direccion del servicio dentro del formulario.",
      );
    }
  };

  const handleRemoveService = (itemId: string) => {
    clearServiceDraft(itemId);
    if (selectedCartItemId === itemId) resetServiceModal();
    showInfo("El servicio fue retirado del producto.");
  };

  const handlePurchase = async () => {
    if (isPurchasing) return;

    const validationError = validateAddress();
    if (validationError) {
      setAddressError(validationError);
      return;
    }

    if (!cart.length) {
      showInfo("Tu carrito esta vacio.");
      return;
    }

    if (!authUser) {
      showError("Usuario no autenticado.");
      return;
    }

    const missingServiceConfig = cart.filter(
      (item) => item.service && !item.serviceDraft,
    );
    if (missingServiceConfig.length) {
      showError(
        `Configura el servicio para: ${missingServiceConfig
          .map((item) => item.name)
          .join(", ")}.`,
      );
      return;
    }

    const createdRequestIds = new Map<string, number>();
    const createdRequestOrder: number[] = [];
    let createdSaleId: number | null = null;

    try {
      setIsPurchasing(true);

      for (const item of configuredServiceItems) {
        const draft = item.serviceDraft as CartServiceDraft;
        const createdRequest = await createServiceRequest({
          scheduledAt: draft.scheduledAt ?? null,
          scheduledEndAt: draft.scheduledEndAt ?? null,
          serviceType: draft.serviceType as any,
          description: [draft.description, `Producto asociado: ${item.name}`]
            .filter(Boolean)
            .join(" | "),
          direccion: String(draft.direccion || fullAddress).trim(),
          stateId: Number(draft.stateId ?? 5),
          serviceId: Number(draft.serviceId),
        });

        const requestId = getServiceRequestNumericId(createdRequest);
        if (!requestId) {
          throw new Error(
            `No se pudo obtener el ID de la solicitud para "${item.name}".`,
          );
        }

        createdRequestIds.set(String(item.id), requestId);
        createdRequestOrder.push(requestId);
      }

      const salePayload = buildSalePayload({
        cart,
        serviceRequestIds: createdRequestIds,
        deliveryAddress: fullAddress,
        deliveryFee: DELIVERY_FEE,
        serviceVisitFeeTotal,
      });

      const createdSale = await createSaleFromAuth(salePayload);
      createdSaleId = Number(createdSale?.saleid ?? createdSale?.saleId ?? 0);
      if (!Number.isFinite(createdSaleId) || createdSaleId <= 0) {
        throw new Error("La venta fue creada, pero no se pudo obtener su identificador.");
      }

      const redirectUrl = `${window.location.origin}/payments/register?saleId=${createdSaleId}`;
      const wompiSession = await createWompiCheckoutSession(createdSaleId, {
        redirectUrl,
      });

      if (!wompiSession?.publicKey || !wompiSession?.reference) {
        throw new Error("No se pudo inicializar el checkout de Wompi.");
      }

      localStorage.setItem(
        "vertecx_checkout",
        JSON.stringify({
          saleId: createdSaleId,
          saleCode: wompiSession.saleCode,
          reference: wompiSession.reference,
          cart,
          address,
          subtotal: productsSubtotal,
          serviceVisitFeeTotal,
          deliveryFee: DELIVERY_FEE,
          taxAmount,
          total: checkoutTotal,
          hasService: configuredServiceItems.length > 0,
          serviceRequestIds: Object.fromEntries(createdRequestIds),
          savedAt: new Date().toISOString(),
        }),
      );

      showSuccess("Te estamos redirigiendo al checkout seguro de Wompi.");
      clearCart();
      onClose();
      submitWompiWebCheckout(wompiSession);
    } catch (err) {
      if (!createdSaleId && createdRequestOrder.length) {
        await Promise.allSettled(
          createdRequestOrder.map((id) => deleteServiceRequest(id)),
        );
      }

      const message =
        err instanceof Error && err.message
          ? err.message
          : "No se pudo completar la compra.";

      if (createdSaleId) {
        showInfo(
          `La venta ${createdSaleId} quedo pendiente. Puedes intentar el pago nuevamente desde soporte o ventas.`,
        );
      }
      showError(message);
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-50 max-h-[96vh] w-full max-w-7xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl scroll-smooth xl:p-8"
      >
        <button
          className="absolute right-4 top-4 cursor-pointer text-gray-700 hover:text-black"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="mb-6 text-3xl font-semibold">Tu carrito</h2>

        <div className="grid max-h-96 grid-cols-1 gap-6 overflow-y-auto pr-2 sm:grid-cols-2 md:grid-cols-3">
          <AnimatePresence>
            {cart.map((item) => {
              const isExpanded = openProducts.has(String(item.id));
              const isServiceConfigured = !!(item.service && item.serviceDraft);
              const isServicePending = !!(item.service && !item.serviceDraft);

              return (
                <motion.div
                  key={item.id}
                  whileHover={{
                    boxShadow: "0px 10px 25px rgba(139, 0, 0, 0.7)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  layout
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={`relative cursor-pointer rounded-xl bg-gray-50 p-4 shadow-md hover:shadow-xl ${
                    isExpanded
                      ? "flex flex-col items-start gap-6 md:col-span-3 md:flex-row"
                      : "flex flex-col items-center"
                  }`}
                >
                  <div className="absolute left-2 top-2 z-10">
                    <button
                      className="cursor-pointer rounded p-1 transition-colors hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenProducts((prev) => {
                          const next = new Set(prev);
                          if (next.has(String(item.id)))
                            next.delete(String(item.id));
                          else next.add(String(item.id));
                          return next;
                        });
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <div
                    className="flex w-full flex-col items-center justify-between md:w-40"
                    onClick={() => {
                      setOpenProducts((prev) => {
                        const next = new Set(prev);
                        if (next.has(String(item.id)))
                          next.delete(String(item.id));
                        else next.add(String(item.id));
                        return next;
                      });
                    }}
                  >
                    <p className="mt-2 text-center font-medium text-gray-800">
                      {item.name}
                    </p>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="mt-2 object-contain"
                    />
                    <span
                      className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${
                        isServiceConfigured
                          ? "bg-green-100 text-green-800"
                          : isServicePending
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isServiceConfigured
                        ? "Servicio configurado"
                        : isServicePending
                          ? "Servicio pendiente"
                          : "Sin servicio"}
                    </span>
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="mt-4 flex w-full flex-row items-start gap-6 md:mt-0 md:w-auto"
                    >
                      <div className="flex-1 overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-3 text-center">Precio</th>
                              <th className="p-3 text-center">Cantidad</th>
                              <th className="p-3 text-center">Servicio</th>
                              <th className="p-3 text-center">Sub-total</th>
                              <th className="p-3 text-center">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="p-3 text-center">
                                ${item.price.toLocaleString("es-CO")}
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    className="cursor-pointer rounded transition hover:scale-110 hover:bg-red-300/60"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(String(item.id), -1);
                                    }}
                                  >
                                    <Image
                                      src="/assets/imgs/minus.png"
                                      alt="Disminuir"
                                      width={25}
                                      height={25}
                                    />
                                  </button>

                                  <motion.span
                                    key={item.quantity}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 300,
                                      damping: 20,
                                    }}
                                  >
                                    {item.quantity}
                                  </motion.span>

                                  <button
                                    disabled={item.quantity >= item.stock}
                                    className={`cursor-pointer rounded transition ${
                                      item.quantity >= item.stock
                                        ? "cursor-not-allowed opacity-40"
                                        : "hover:scale-110 hover:bg-red-300/60"
                                    }`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateQuantity(String(item.id), 1);
                                    }}
                                  >
                                    <Image
                                      src="/assets/imgs/add.png"
                                      alt="Aumentar"
                                      width={25}
                                      height={25}
                                      className="rotate-180"
                                    />
                                  </button>

                                  <div className="mt-1 text-xs text-gray-600">
                                    Stock disponible: {item.stock}
                                  </div>

                                  {item.error && (
                                    <div className="mt-1 text-xs font-medium text-red-600">
                                      {item.error}
                                    </div>
                                  )}
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                      isServiceConfigured
                                        ? "bg-green-100 text-green-800"
                                        : isServicePending
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {isServiceConfigured
                                      ? "Configurado"
                                      : isServicePending
                                        ? "Pendiente"
                                      : "No incluido"}
                                  </span>

                                  {item.service && (
                                    <span className="text-[11px] font-medium text-gray-500">
                                      Visita tecnica: ${SERVICE_VISIT_FEE.toLocaleString("es-CO")}
                                    </span>
                                  )}

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenServiceModal(item);
                                    }}
                                    className={`cursor-pointer rounded px-3 py-1 text-sm font-medium transition ${
                                      isServiceConfigured
                                        ? "bg-black text-white hover:bg-neutral-800"
                                        : isServicePending
                                          ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                    }`}
                                  >
                                    {isServiceConfigured
                                      ? "Cambiar servicio"
                                      : isServicePending
                                        ? "Configurar servicio"
                                        : "Incluir servicio"}
                                  </button>

                                  {item.service && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveService(String(item.id));
                                      }}
                                      className="cursor-pointer rounded px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-50"
                                    >
                                      Quitar
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td className="p-3 text-center">
                                $
                                {(item.price * item.quantity).toLocaleString(
                                  "es-CO",
                                )}
                              </td>

                              <td className="p-3 text-center">
                                <button
                                  className="cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      selectedCartItemId === String(item.id)
                                    ) {
                                      resetServiceModal();
                                    }
                                    removeFromCart(String(item.id));
                                  }}
                                >
                                  <Image
                                    src="/assets/imgs/Boton_medio.png"
                                    alt="Eliminar"
                                    width={28}
                                    height={28}
                                    className="rounded transition hover:scale-110 hover:bg-red-300/60"
                                  />
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="flex w-full flex-col gap-4 rounded-2xl bg-gray-50 p-5 shadow-inner xl:p-6">
            <p className="text-gray-800">
              <span className="font-semibold">Nombre:</span>{" "}
              {authUser?.name || "Cliente autenticado"}
            </p>
            <p className="text-gray-800">
              <span className="font-semibold">Correo:</span>{" "}
              {authUser?.email || "No disponible"}
            </p>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-800">
                  Direccion de envio
                </h4>
                <p className="text-sm text-gray-500">
                  Completa una direccion clara para la entrega y para el
                  servicio si lo agregas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Ciudad
                  </label>
                  <input
                    value={address.city}
                    onChange={(e) => updateAddressField("city", e.target.value)}
                    list="cart-colombia-cities"
                    placeholder="Ej. Medellin"
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Barrio o zona
                  </label>
                  <input
                    value={address.zone}
                    onChange={(e) => updateAddressField("zone", e.target.value)}
                    list="cart-zone-suggestions"
                    placeholder={
                      address.city.trim()
                        ? `Ej. barrio o zona de ${address.city}`
                        : "Escribe barrio o zona"
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <datalist id="cart-colombia-cities">
                {COLOMBIA_CITY_NAMES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>

              <datalist id="cart-zone-suggestions">
                {zoneSuggestions.map((zone) => (
                  <option
                    key={`${zone.placeId ?? zone.label}-${zone.label}`}
                    value={zone.label}
                  />
                ))}
              </datalist>

              {address.zone.trim().length >= 2 && zoneSuggestionsLoading && (
                <p className="text-xs text-gray-500">
                  Buscando sugerencias de barrio o zona...
                </p>
              )}

              {!placesProviderReady && (
                <p className="text-xs text-amber-700">
                  El autocompletado de barrios no esta configurado todavia. Puedes escribirlo manualmente.
                </p>
              )}

              {!!zoneSuggestions.length && (
                <div className="flex flex-wrap gap-2">
                  {zoneSuggestions.slice(0, 6).map((zone) => (
                    <button
                      key={`${zone.placeId ?? zone.label}-chip`}
                      type="button"
                      onClick={() => updateAddressField("zone", zone.label)}
                      className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-red-300 hover:text-red-700"
                      title={zone.secondaryText || zone.fullText || zone.label}
                    >
                      {zone.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[1.1fr_1fr]">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Tipo de via
                  </label>
                  <select
                    value={address.streetType}
                    onChange={(e) =>
                      updateAddressField("streetType", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  >
                    <option value="">Selecciona el tipo</option>
                    {STREET_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Numero principal
                  </label>
                  <input
                    placeholder="Ej. 10B"
                    value={address.streetNumber}
                    onChange={(e) =>
                      updateAddressField("streetNumber", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Numero secundario
                  </label>
                  <input
                    placeholder="Ej. 23-18"
                    value={address.secondaryNumber}
                    onChange={(e) =>
                      updateAddressField("secondaryNumber", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Complemento
                  </label>
                  <input
                    placeholder="Apto, Casa, Torre, Oficina..."
                    value={address.complement}
                    onChange={(e) =>
                      updateAddressField("complement", e.target.value)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              {hasAddressDraft && (
                <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-red-700">
                    Vista previa
                  </p>
                  <p className="mt-1 text-sm text-gray-700">
                    {fullAddress || "Sigue completando la direccion"}
                  </p>
                </div>
              )}

              {addressError && (
                <p className="text-sm font-medium text-red-600">
                  {addressError}
                </p>
              )}
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Mapa
                      </p>
                      <p className="text-sm text-gray-700">
                        Revisa la ubicacion aproximada de la entrega.
                      </p>
                    </div>
                    <a
                      href={mapOpenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Abrir Maps
                    </a>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <iframe
                      title="Mapa de direccion"
                      src={mapEmbedUrl}
                      className="h-[320px] w-full bg-gray-100 md:h-[380px]"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Consejo
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    Si el mapa no cae exacto, agrega el complemento y un barrio claro para facilitar la entrega y la visita tecnica.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-5 rounded-2xl bg-gray-50 p-5 shadow-md xl:sticky xl:top-4">
            <div className="space-y-2 text-right text-gray-700">
              <p className="flex justify-between text-base">
                <span className="font-medium">Subtotal:</span>
                <span>${productsSubtotal.toLocaleString("es-CO")}</span>
              </p>
              <p className="flex justify-between text-base">
                <span className="font-medium">Envio:</span>
                <span>${DELIVERY_FEE.toLocaleString("es-CO")}</span>
              </p>
              <p className="flex justify-between text-base">
                <span className="font-medium">
                  Visita tecnica ({selectedServiceItems.length}):
                </span>
                <span>${serviceVisitFeeTotal.toLocaleString("es-CO")}</span>
              </p>
              <p className="flex justify-between text-base">
                <span className="font-medium">IVA ({TAX_PERCENT}%):</span>
                <span>${taxAmount.toLocaleString("es-CO")}</span>
              </p>
              <p className="flex justify-between border-t pt-3 text-xl font-bold text-gray-900">
                <span>Total:</span>
                <span>${checkoutTotal.toLocaleString("es-CO")}</span>
              </p>
            </div>

            <div className="mt-5 flex flex-col items-center">
              <p className="mb-3 flex items-center gap-2 text-center text-lg font-medium text-gray-700">
                {hasSelectedService ? (
                  <>
                    <span>
                      Servicios seleccionados: {configuredServiceItems.length}{" "}
                      configurado(s)
                      {pendingServiceItems.length
                        ? `, ${pendingServiceItems.length} pendiente(s)`
                        : "."}
                    </span>
                  </>
                ) : (
                  <>
                    <span>Paga ahora con Wompi y recibe en 3 dias.</span>
                  </>
                )}
              </p>

              <div className="mb-4 w-full rounded-2xl border border-red-100 bg-white p-4 text-left shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-red-50 p-2 text-red-700">
                    <WalletCards className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-gray-800">
                      Pago online con Wompi
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600">
                      Desde el checkout podras pagar con Nequi, PSE o Bancolombia, segun los metodos activos en tu cuenta de Wompi.
                    </p>
                    {hasSelectedService && (
                      <p className="text-xs font-medium text-red-700">
                        Cada solicitud con servicio suma ${SERVICE_VISIT_FEE.toLocaleString("es-CO")} por visita tecnica previa.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {pendingServiceItems.length > 0 && (
                <p className="mb-3 text-center text-sm font-medium text-amber-700">
                  Completa la configuracion del servicio antes de comprar.
                </p>
              )}

              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className={`cursor-pointer rounded-lg px-8 py-3 text-lg font-semibold text-white shadow-md transition ${
                  isPurchasing
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                }`}
              >
                {isPurchasing
                  ? "Preparando checkout..."
                  : hasSelectedService
                    ? "Comprar y pagar visita"
                    : "Comprar y pagar"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {authUser && (
        <ClientCreateRequestModal
          isOpen={openServiceModal}
          onClose={resetServiceModal}
          onSave={async (payload: CreateRequestPayload) => {
            if (!selectedCartItemId) {
              showError("No se pudo identificar el producto del servicio.");
              return;
            }

            const draft: CartServiceDraft = {
              scheduledAt: payload.scheduledAt ?? null,
              scheduledEndAt: payload.scheduledEndAt ?? null,
              serviceType: payload.serviceType,
              description: String(payload.description ?? "").trim(),
              direccion: String(payload.direccion ?? fullAddress).trim(),
              stateId: Number(payload.stateId ?? 5),
              serviceId: Number(payload.serviceId),
            };

            saveServiceDraft(selectedCartItemId, draft);
            showSuccess(
              "Servicio agregado al producto. Ya puedes finalizar la compra.",
            );
            resetServiceModal();
          }}
          title={
            selectedCartItem
              ? `Servicio para ${selectedCartItem.name}`
              : "Solicitar servicio"
          }
          clientId={authUser.userid}
          clientLabel={authUser.name}
          initialServiceId={selectedCartItem?.serviceDraft?.serviceId ?? null}
          initialDireccion={
            selectedCartItem?.serviceDraft?.direccion ?? fullAddress
          }
        />
      )}
    </div>
  );
}
