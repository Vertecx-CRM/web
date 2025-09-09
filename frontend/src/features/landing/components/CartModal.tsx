"use client";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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
  const [cart, setCart] = useState<CartItem[]>([
    {
      id: 1,
      name: "Victus HP SIO",
      price: 2000000,
      quantity: 1,
      service: true,
      image: "/assets/imgs/laptop.png",
    },
    {
      id: 2,
      name: "Lenovo Gaming",
      price: 4000000,
      quantity: 1,
      service: false,
      image: "/assets/imgs/laptop.png",
    },
  ]);

  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

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
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 z-50">
        {/* Botón cerrar */}
        <button
          className="cursor-pointer absolute top-4 right-4 text-gray-700 hover:text-black"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-3xl font-semibold mb-6">Tu carrito</h2>

        {/* Tabla productos */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="p-3 text-center">Producto</th>
                <th className="p-3 text-center">Precio</th>
                <th className="p-3 text-center">Cantidad</th>
                <th className="p-3 text-center">Servicio</th>
                <th className="p-3 text-center">Sub-total</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3 flex items-center gap-3 justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={60}
                      height={60}
                    />
                    {item.name}
                  </td>
                  <td className="p-3 text-center">
                    ${item.price.toLocaleString("es-CO")}
                  </td>
                  <td className="p-3 flex items-center justify-center gap-2">
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="cursor-pointer"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Image
                            src="/assets/imgs/minus.png"
                            alt="Disminuir"
                            width={25}
                            height={25}
                          />
                        </button>

                        {/* cantidad centrada */}
                        <span className="w-8 text-center">{item.quantity}</span>

                        <button
                          className="cursor-pointer"
                          onClick={() => updateQuantity(item.id, 1)}
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
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleService(item.id)}>
                      <Image
                        src="/assets/imgs/check_box.png"
                        alt="Servicio"
                        width={25}
                        height={25}
                        className={`transition ${
                          item.service ? "opacity-100" : "opacity-30"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    ${(item.price * item.quantity).toLocaleString("es-CO")}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      className="cursor-pointer"
                      onClick={() => removeItem(item.id)}
                    >
                      <Image
                        src="/assets/imgs/Boton_medio.png"
                        alt="Eliminar"
                        width={28}
                        height={28}
                        className="hover:scale-110 transition"
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Datos + Total */}
        <div className="flex justify-between items-start mt-6 gap-6">
          {/* Datos cliente */}
          <div className="flex flex-col gap-2 w-1/2">
            <p>
              <strong>Nombre:</strong> Samuel Córdoba
            </p>
            <p>
              <strong>Cédula:</strong> 1033259147
            </p>
            <textarea
              placeholder="Ingrese su dirección de envío"
              className={`w-full border p-3 rounded-md ${
                error ? "border-red-500" : ""
              }`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
          </div>

          {/* Total y botón */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-2xl font-bold">
              Total: ${total.toLocaleString("es-CO")}
            </p>
            <button
              onClick={handlePurchase}
              className="cursor-pointer bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded-md text-lg font-semibold transition"
            >
              Comprar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
