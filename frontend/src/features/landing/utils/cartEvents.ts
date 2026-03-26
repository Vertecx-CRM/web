"use client";

export const OPEN_CART_EVENT = "vertecx:open-cart";

export function openLandingCart() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT));
}
