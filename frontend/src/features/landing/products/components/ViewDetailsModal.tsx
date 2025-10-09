"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart } from "react-icons/fa";
import { showSuccess } from "@/shared/utils/notifications";
import { useCart } from "../../contexts/CartContext";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  image?: string;
  price?: number;
}

interface ViewDetailsModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewDetailsModal({
  product,
  isOpen,
  onClose,
}: ViewDetailsModalProps) {
  const { addToCart, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = (product: Product) => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        name: product.title,
        price: product.price,
        image: product.image || "/assets/imgs/default-product.png",
      });
    }
    showSuccess("Producto agregado al carrito");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row font-montserrat overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen */}
            {product.image && (
              <div className="md:w-1/2 flex-shrink-0 flex justify-center items-center relative">
                <div className="w-full h-full absolute inset-0 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Información con scroll en descripción */}
            <div className="md:w-1/2 flex flex-col justify-between p-6 relative">
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
                <h2 className="text-4xl font-extrabold mb-2 break-words text-gray-900">
                  {product.title}
                </h2>
                <p className="text-[#B20000] font-semibold mb-3 break-words">
                  {product.category}
                </p>
                <p className="text-gray-700 mb-6 leading-relaxed break-words whitespace-normal text-base">
                  {product.description}
                </p>
              </div>

              {/* Pie de página con precio, cantidad y botón */}
              <div className="sticky bottom-0 bg-white pt-4 flex flex-col gap-3">
                {/* Control de cantidad con el estilo y tamaño preciso */}
                <div className="flex items-center">
                  <motion.button
                    onClick={decrease}
                    className="bg-gray-100 px-4 py-2 rounded-l-full hover:bg-gray-200 transition-colors duration-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    -
                  </motion.button>
                  <span className="bg-gray-100 px-4 py-2 font-semibold">
                    {quantity}
                  </span>
                  <motion.button
                    onClick={increase}
                    className="bg-gray-100 px-4 py-2 rounded-r-full hover:bg-gray-200 transition-colors duration-200"
                    whileTap={{ scale: 0.95 }}
                  >
                    +
                  </motion.button>
                </div>

                {/* Precio y botón de carrito */}
                <div className="flex items-center justify-between">
                  {product.price !== undefined && (
                    <p className="text-[#B20000] font-bold text-2xl">
                      ${product.price.toLocaleString("es-CO")}
                    </p>
                  )}

                  <motion.button
                    className="bg-[#B20000] text-white rounded-full px-6 py-3 flex items-center justify-center gap-3 shadow-lg hover:bg-red-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                    onClick={() => {
                      handleAddToCart(product, 0);
                      onClose();
                    }}
                  >
                    <FaShoppingCart className="text-xl" />
                    Agregar al carrito
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 shadow-md"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
