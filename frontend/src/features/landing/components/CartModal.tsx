"use client";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { initialCart } from "../mock/cart.mock";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  service: boolean;
  image: string;
};

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const [cart, setCart] = useState<CartItem[]>(initialCart);

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const hasService = cart.some((item) => item.service);
  const [openProducts, setOpenProducts] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handlePurchase = () => {
    if (!address.trim()) {
      setError(
        "⚠️ Por favor ingrese una dirección de envío antes de continuar."
      );
      return;
    }
    setError("");
    window.location.href = "/payments/register";
    onClose();
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const toggleService = (id: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, service: !item.service } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Contenido */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 z-50 max-h-[95vh] overflow-y-auto scroll-smooth"
      >
        {/* Botón cerrar */}
        <button
          className="cursor-pointer absolute top-4 right-4 text-gray-700 hover:text-black"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-semibold mb-6">Tu carrito</h2>

        {/* productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{
                  boxShadow: "0px 10px 25px rgba(139, 0, 0, 0.7)",
                }}
                whileTap={{ scale: 0.97 }}
                layout
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className={`cursor-pointer bg-gray-50 rounded-xl shadow-md hover:shadow-xl p-4 
  
  ${
    openProducts.has(item.id)
      ? "flex flex-col md:flex-row gap-6 items-start md:col-span-3"
      : "flex flex-col items-center"
  }`}
                onClick={() => {
                  setOpenProducts((prev) => {
                    const newSet = new Set(prev);
                    if (newSet.has(item.id)) {
                      newSet.delete(item.id);
                    } else {
                      newSet.add(item.id);
                    }
                    return newSet;
                  });
                }}
              >
                {/* Vista simple */}
                <div className="flex flex-col items-center justify-between w-full md:w-40">
                  <p className="mt-2 font-medium text-gray-800 text-center">
                    {item.name}
                  </p>
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="object-contain mt-2"
                  />
                </div>

                {/* Vista detallada */}
                {openProducts.has(item.id) && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex-1 w-full md:w-auto mt-4 md:mt-0 flex flex-row gap-6 items-start"
                  >
                    {/* Vista detallada SOLO para el producto seleccionado */}
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
                                  className="cursor-pointer transition hover:scale-110 hover:bg-red-300/60 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, -1);
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
                                  className="cursor-pointer transition hover:scale-110 hover:bg-red-300/60 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(item.id, 1);
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
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleService(item.id);
                                }}
                              >
                                <Image
                                  src="/assets/imgs/check_box.png"
                                  alt="Servicio"
                                  width={25}
                                  height={25}
                                  className={`cursor-pointer  transition hover:scale-110 hover:bg-red-300/60 rounded ${
                                    item.service ? "opacity-100" : "opacity-30"
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              $
                              {(item.price * item.quantity).toLocaleString(
                                "es-CO"
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeItem(item.id);
                                }}
                              >
                                <Image
                                  src="/assets/imgs/Boton_medio.png"
                                  alt="Eliminar"
                                  width={28}
                                  height={28}
                                  className=" transition hover:scale-110 hover:bg-red-300/60 rounded"
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
            ))}
          </AnimatePresence>
        </div>

        {/* Datos + Total */}
        <div className="flex flex-col lg:flex-row justify-between items-start mt-8 gap-6">
          {/* Datos cliente */}
          <div className="flex flex-col gap-3 w-full lg:w-1/2 bg-gray-50 p-4 rounded-xl shadow-inner">
            <p className="text-gray-800">
              <span className="font-semibold">Nombre:</span> Samuel Córdoba
            </p>
            <p className="text-gray-800">
              <span className="font-semibold">Cédula:</span> 1033259147
            </p>
            <textarea
              placeholder="Ingrese su dirección de envío"
              className={`w-full border p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-600 transition ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          {/* Resumen de costos + Botón */}
          <div className="flex flex-col w-full lg:w-1/2 gap-5 bg-gray-50 p-5 rounded-xl shadow-md">
            {/* Resumen */}
            <div className="space-y-2 text-right text-gray-700">
              <p className="flex justify-between text-base">
                <span className="font-medium">Subtotal:</span>
                <span>${total.toLocaleString("es-CO")}</span>
              </p>
              <p className="flex justify-between text-base">
                <span className="font-medium">Envío:</span>
                <span>$20,000</span>
              </p>
              <p className="flex justify-between text-base">
                <span className="font-medium">IVA (19%):</span>
                <span>${(total * 0.19).toLocaleString("es-CO")}</span>
              </p>
              <p className="flex justify-between text-xl font-bold border-t pt-3 text-gray-900">
                <span>Total:</span>
                <span>
                  ${(total + 20000 + total * 0.19).toLocaleString("es-CO")}
                </span>
              </p>
            </div>

            {/* Botón Comprar */}
            <div className="flex flex-col items-center mt-5">
              <p className="text-lg font-medium text-gray-700 flex items-center gap-2 mb-3 text-center">
                {hasService ? (
                  <>
                    🛠️ <span>Su solicitud de servicio será enviada</span>
                  </>
                ) : (
                  <>
                    🚚 <span>Paga ahora y recibe en 3 días</span>
                  </>
                )}
              </p>

              <button
                onClick={handlePurchase}
                className="cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg text-lg font-semibold shadow-md transition"
              >
                {hasService ? "Confirmar servicio" : "Comprar"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>{" "}
    </div>
  );
}
