"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { RequestAvailabilityOption } from "@/features/dashboard/requests/utils/requestAvailability";

export type CartServiceDraft = {
  scheduledAt?: string | null;
  scheduledEndAt?: string | null;
  serviceType: string;
  description: string;
  direccion: string;
  stateId?: number;
  serviceId: number;
  availabilityOptions?: RequestAvailabilityOption[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  service: boolean;
  serviceDraft?: CartServiceDraft | null;
  image: string;
  error?: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity" | "service" | "serviceDraft" | "error">) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setServiceSelection: (id: string, selected: boolean) => void;
  saveServiceDraft: (id: string, draft: CartServiceDraft) => void;
  clearServiceDraft: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (
    item: Omit<CartItem, "quantity" | "service" | "serviceDraft" | "error">
  ) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);

      if (existing) {
        if (existing.quantity >= existing.stock) {
          return prev.map((p) =>
            p.id === item.id
              ? { ...p, error: `Stock máximo disponible: ${p.stock}` }
              : p
          );
        }

        return prev.map((p) =>
          p.id === item.id
            ? { ...p, quantity: p.quantity + 1, error: undefined }
            : p
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          service: false,
          serviceDraft: null,
          error: undefined,
        },
      ];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        const nextQty = item.quantity + delta;

        if (nextQty < 1) {
          return item;
        }

        if (nextQty > item.stock) {
          return {
            ...item,
            error: `Solo hay ${item.stock} unidades disponibles`,
          };
        }

        return {
          ...item,
          quantity: nextQty,
          error: undefined,
        };
      })
    );
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const setServiceSelection = (id: string, selected: boolean) =>
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              service: selected,
              serviceDraft: selected ? item.serviceDraft ?? null : null,
              error: undefined,
            }
          : item
      )
    );

  const saveServiceDraft = (id: string, draft: CartServiceDraft) =>
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, service: true, serviceDraft: draft, error: undefined }
          : item
      )
    );

  const clearServiceDraft = (id: string) =>
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, service: false, serviceDraft: null } : item
      )
    );

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        setServiceSelection,
        saveServiceDraft,
        clearServiceDraft,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
