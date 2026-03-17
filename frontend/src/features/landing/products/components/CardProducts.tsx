"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Eye,
  Package,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface CardProductProps {
  id: string;
  title: string;
  description: string;
  category?: string;
  image?: string;
  price?: number;
  stock?: number;
  onAddToCart?: () => void;
}

export default function CardProduct({
  id,
  title,
  description,
  category,
  image,
  price,
  stock = 0,
  onAddToCart,
}: CardProductProps) {
  const router = useRouter();
  const inStock = stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-2xl border border-[#626262]/10 overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
    >
      {/* Contenedor de Imagen con Overlay Técnico */}
      <div className="relative aspect-square bg-[#f9f9f9] overflow-hidden p-6">
        <div
          className="w-full h-full bg-center bg-contain bg-no-repeat transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: image ? `url(${image})` : "none" }}
        >
          {!image && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Package size={48} strokeWidth={1} />
              <span className="text-[10px] font-black uppercase tracking-widest mt-2">
                No Image
              </span>
            </div>
          )}
        </div>

        {/* Badge de Categoría Flotante */}
        {category && (
          <div className="absolute top-4 left-4">
            <span className="bg-[#0D141C] text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
              {category}
            </span>
          </div>
        )}

        {/* Status de Stock */}
        <div className="absolute bottom-4 right-4">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              inStock
                ? "bg-white border-green-200 text-green-600"
                : "bg-white border-red-200 text-red-600"
            }`}
          >
            {inStock ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
            {inStock ? `${stock} disp.` : "Agotado"}
          </div>
        </div>
      </div>

      {/* Cuerpo de la Card */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-sm font-black text-[#0D141C] uppercase tracking-wider mb-2 line-clamp-1 group-hover:text-[#B20000] transition-colors">
            {title}
          </h3>
          <p className="text-xs text-[#717680] leading-relaxed line-clamp-2 mb-4 font-medium italic">
            {description}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[#626262]/5">
          {price !== undefined && (
            <div className="flex flex-col mb-4">
              <span className="text-[10px] font-black text-[#B20000] uppercase tracking-widest opacity-60">
                Precio Unitario
              </span>
              <span className="text-xl font-black text-[#0D141C]">
                ${price.toLocaleString("es-CO")}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onAddToCart}
              disabled={!inStock}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                inStock
                  ? "bg-[#B20000] text-white hover:bg-[#8e0000] shadow-md hover:shadow-[#B20000]/20"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <ShoppingCart size={14} />
              {inStock ? "Añadir" : "Sin Stock"}
            </button>

            <button
              onClick={() => router.push(`/landing/products/${id}`)}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#0D141C] text-[#0D141C] text-[10px] font-black uppercase tracking-widest hover:bg-[#0D141C] hover:text-white transition-all"
            >
              <Eye size={14} />
              Detalles
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
