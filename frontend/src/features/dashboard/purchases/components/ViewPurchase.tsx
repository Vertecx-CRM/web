"use client";

import { IPurchase } from "../Types/Purchase.type";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

type ViewPurchaseProps = {
  purchase: IPurchase;
};

export default function ViewPurchase({ purchase }: ViewPurchaseProps) {
  const [openProducts, setOpenProducts] = useState<Set<number>>(new Set());

  const products =
    purchase.products && purchase.products.length > 0
      ? purchase.products
      : [
          {
            id: 1,
            name: "Laptop Dell XPS",
            quantity: 2,
            price: 1200,
            image: "/assets/imgs/laptop.png",
          },
          {
            id: 2,
            name: "Mouse Logitech",
            quantity: 5,
            price: 25,
            image: "/assets/imgs/laptop.png",
          },
          {
            id: 3,
            name: "Teclado Mecánico",
            quantity: 3,
            price: 75,
            image: "/assets/imgs/laptop.png",
          },
          {
            id: 4,
            name: 'Monitor LG 27"',
            quantity: 1,
            price: 300,
            image: "/assets/imgs/laptop.png",
          },
        ];

  return (
    <div className="space-y-6 overflow-y-auto max-h-[95vh] pr-2 scroll-smooth">
      {/* Info de la compra */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">N° Orden</label>
          <input
            type="text"
            value={purchase.orderNumber}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Factura</label>
          <input
            type="text"
            value={purchase.invoiceNumber}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Proveedor</label>
          <input
            type="text"
            value={purchase.supplier}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha Registro</label>
          <input
            type="text"
            value={purchase.registerDate}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Monto</label>
          <input
            type="text"
            value={purchase.amount}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">IVA</label>
          <input
            type="text"
            value={purchase.tax || "19%"}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Estado</label>
          <input
            type="text"
            value={purchase.status}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
      </div>

      {/* Lista de productos con estilo carrito */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Productos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-96 overflow-y-auto overflow-x-hidden pr-2 scroll-smooth">
          <AnimatePresence>
            {products.map((prod) => (
              <motion.div
                key={prod.id}
                whileHover={{
                  boxShadow: "0px 10px 25px rgba(139, 0, 0, 0.7)",
                }}
                whileTap={{ scale: 0.97 }}
                layout
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`cursor-pointer bg-gray-50 rounded-xl shadow-md hover:shadow-xl p-4 
                  ${
                    openProducts.has(prod.id)
                      ? "flex flex-col md:flex-row gap-6 items-start md:col-span-3"
                      : "flex flex-col items-center"
                  }`}
                onClick={() => {
                  setOpenProducts((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(prod.id)) newSet.delete(prod.id);
                    else newSet.add(prod.id);
                    return newSet;
                  });
                }}
              >
                {/* Vista simple */}
                <div className="flex flex-col items-center justify-between w-full md:w-40">
                  <p className="mt-2 font-medium text-gray-800 text-center">
                    {prod.name}
                  </p>
                  <Image
                    src={prod.image}
                    alt={prod.name}
                    width={80}
                    height={80}
                    className="object-contain mt-2"
                  />
                </div>

                {/* Vista detallada */}
                {openProducts.has(prod.id) && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex-1 w-full md:w-auto mt-4 md:mt-0 flex flex-row gap-6 items-start"
                  >
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="p-3 text-center">Precio</th>
                            <th className="p-3 text-center">Cantidad</th>
                            <th className="p-3 text-center">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-3 text-center">${prod.price}</td>
                            <td className="p-3 text-center">{prod.quantity}</td>
                            <td className="p-3 text-center">
                              $
                              {(prod.price * prod.quantity).toLocaleString(
                                "es-CO"
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
