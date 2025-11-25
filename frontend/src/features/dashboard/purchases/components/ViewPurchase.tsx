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

  const products = purchase.purchaseProducts ?? [];

  return (
    <div className="space-y-6 overflow-y-auto max-h-[95vh] pr-2 scroll-smooth">
      {/* Información de la compra */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">N° Orden</label>
          <input
            type="text"
            value={purchase.numberoforder}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Factura</label>
          <input
            type="text"
            value={purchase.reference}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Proveedor</label>
          <input
            type="text"
            value={purchase.supplier?.name ?? "Sin proveedor"}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Fecha Registro</label>
          <input
            type="text"
            value={new Date(purchase.createdat).toLocaleDateString()}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Monto</label>
          <input
            type="text"
            value={Number(purchase.amount).toLocaleString("es-CO", {
              style: "currency",
              currency: "COP",
            })}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Estado</label>
          <input
            type="text"
            value={
              purchase.state?.name?.toLowerCase() === "approved"
                ? "Aprobada"
                : purchase.state?.name?.toLowerCase() === "revoke"
                ? "Anulada"
                : "Desconocido"
            }
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
      </div>

      {/* Productos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Productos</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2">
          <AnimatePresence>
            {products.map((item) => {
              const product = item.product;
              const isOpen = openProducts.has(item.purchaseProductId);

              return (
                <motion.div
                  key={item.purchaseProductId}
                  whileHover={{
                    boxShadow: "0px 10px 25px rgba(139, 0, 0, 0.5)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  layout
                  transition={{ duration: 0.4 }}
                  className={`cursor-pointer bg-gray-50 rounded-xl shadow-md p-4 
                    ${
                      isOpen
                        ? "flex flex-col md:flex-row gap-6 items-start md:col-span-3"
                        : "flex flex-col items-center"
                    }`}
                  onClick={() => {
                    setOpenProducts((prev) => {
                      const newSet = new Set(prev);
                      if (newSet.has(item.purchaseProductId))
                        newSet.delete(item.purchaseProductId);
                      else newSet.add(item.purchaseProductId);
                      return newSet;
                    });
                  }}
                >
                  {/* Vista compacta */}
                  <div className="flex flex-col items-center w-full md:w-40">
                    <p className="mt-2 font-medium text-gray-800 text-center">
                      {product?.productname ?? "Producto sin nombre"}
                    </p>

                    <Image
                      src="/assets/imgs/laptop.png"
                      alt={product?.productname ?? "Producto"}
                      width={80}
                      height={80}
                      className="object-contain mt-2"
                    />
                  </div>

                  {/* Vista expandida */}
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1 w-full flex flex-row gap-6"
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
                              <td className="p-3 text-center">
                                {Number(item.unitprice).toLocaleString(
                                  "es-CO",
                                  {
                                    style: "currency",
                                    currency: "COP",
                                  }
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {item.quantity}
                              </td>
                              <td className="p-3 text-center">
                                {Number(item.subtotal).toLocaleString("es-CO", {
                                  style: "currency",
                                  currency: "COP",
                                })}
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
      </div>
    </div>
  );
}
