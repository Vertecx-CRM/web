"use client";

export const VERTECX_CHECKOUT_STORAGE_KEY = "vertecx_checkout";

export type WompiCheckoutFormSession = {
  saleId?: number;
  saleCode?: string;
  wompiEnv?: "sandbox" | "production";
  publicKey: string;
  currency?: string;
  amountInCents: number;
  reference: string;
  redirectUrl?: string;
  expirationTime: string;
  signature?: {
    integrity?: string;
  };
  customerData?: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    phoneNumberPrefix?: string;
    legalId?: string;
    legalIdType?: string;
  };
  shippingAddress?: {
    addressLine1?: string;
    city?: string;
    phoneNumber?: string;
    region?: string;
    country?: string;
  };
};

export type StoredWompiCheckout = {
  saleId?: number;
  saleCode?: string;
  reference?: string;
  subtotal?: number;
  deliveryFee?: number;
  serviceVisitFeeTotal?: number;
  taxAmount?: number;
  total?: number;
  returnUrl?: string;
  origin?: "landing_cart" | "dashboard_sales";
  savedAt?: string;
  wompiSession?: WompiCheckoutFormSession | null;
  [key: string]: unknown;
};

export function readStoredWompiCheckout(): StoredWompiCheckout | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(VERTECX_CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredWompiCheckout;
  } catch {
    return null;
  }
}

export function submitWompiWebCheckout(session: WompiCheckoutFormSession) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("El checkout de Wompi solo puede abrirse desde el navegador.");
  }

  const form = document.createElement("form");
  form.method = "GET";
  form.action = "https://checkout.wompi.co/p/";
  form.style.display = "none";

  const appendField = (
    name: string,
    value: string | number | undefined | null,
  ) => {
    if (value === undefined || value === null || `${value}`.trim() === "") return;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  };

  appendField("public-key", session.publicKey);
  appendField("currency", session.currency ?? "COP");
  appendField("amount-in-cents", session.amountInCents);
  appendField("reference", session.reference);
  appendField("signature:integrity", session.signature?.integrity);
  appendField("redirect-url", session.redirectUrl);
  appendField("expiration-time", session.expirationTime);

  appendField("customer-data:email", session.customerData?.email);
  appendField("customer-data:full-name", session.customerData?.fullName);
  appendField(
    "customer-data:phone-number",
    session.customerData?.phoneNumber,
  );
  appendField(
    "customer-data:phone-number-prefix",
    session.customerData?.phoneNumberPrefix,
  );
  appendField("customer-data:legal-id", session.customerData?.legalId);
  appendField(
    "customer-data:legal-id-type",
    session.customerData?.legalIdType,
  );

  appendField(
    "shipping-address:address-line-1",
    session.shippingAddress?.addressLine1,
  );
  appendField("shipping-address:city", session.shippingAddress?.city);
  appendField(
    "shipping-address:phone-number",
    session.shippingAddress?.phoneNumber,
  );
  appendField("shipping-address:region", session.shippingAddress?.region);
  appendField("shipping-address:country", session.shippingAddress?.country);

  document.body.appendChild(form);
  form.submit();
  window.setTimeout(() => {
    form.remove();
  }, 1000);
}
