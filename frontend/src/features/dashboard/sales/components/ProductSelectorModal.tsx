"use client";

import { useState } from "react";
import Modal from "@/features/dashboard/components/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onSelect: (product: any, quantity: number) => void;
  onCreate: (product: {
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
  }) => void;
}

export default function ProductSelectorModal({
  isOpen,
  onClose,
  products,
  onSelect,
  onCreate,
}: Props) {
  const [mode, setMode] = useState<"select" | "create">("select");

  // Campos para crear producto
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [image, setImage] = useState("");

  // Campos para seleccionar producto
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const reset = () => {
    setMode("select");
    setSelectedId("");
    setQuantity(1);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImage("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      title={mode === "select" ? "Seleccionar Producto" : "Crear Producto"}
      isOpen={isOpen}
      onClose={handleClose}
      widthClass="md:max-w-xl"
      footer={null}
    >
      <div className="space-y-4">
        {/* Toggle Select / Create */}
        <div className="flex gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded ${
              mode === "select" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("select")}
          >
            Seleccionar
          </button>

          <button
            className={`px-3 py-1 rounded ${
              mode === "create" ? "bg-black text-white" : "bg-gray-200"
            }`}
            onClick={() => setMode("create")}
          >
            Crear nuevo
          </button>
        </div>

        {/* ------------------------------------------------ */}
        {/* ===========   MODO SELECCIONAR PRODUCTO   ====== */}
        {/* ------------------------------------------------ */}
        {mode === "select" && (
          <div className="space-y-3">
            <label className="block text-sm">Producto</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">Selecciona un producto</option>
              {products.map((p) => (
                <option key={p.productid} value={p.productid}>
                  {p.productname} — $
                  {p.productpriceofsale.toLocaleString("es-CO")}
                </option>
              ))}
            </select>

            <label className="block text-sm">Cantidad</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-32 border rounded-lg px-3 py-2"
            />

            <button
              onClick={() => {
                if (!selectedId) return;
                const product = products.find((p) => p.productid == selectedId);
                onSelect(product, quantity);
                handleClose();
              }}
              className="w-full bg-black text-white rounded-lg py-2 mt-4"
            >
              Agregar
            </button>
          </div>
        )}

        {/* ------------------------------------------------ */}
        {/* ===========   MODO CREAR PRODUCTO   ============ */}
        {/* ------------------------------------------------ */}
        {mode === "create" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm">Nombre</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Ingrese nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm">Descripción</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Ingrese descripción"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm">Precio</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ingrese precio"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm">Stock</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Ingrese stock"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm">Imagen (URL)</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                if (!name || !price) return;

                onCreate({
                  name,
                  description,
                  price: Number(price),
                  stock: Number(stock || 0),
                  image,
                });

                handleClose();
              }}
              className="w-full bg-black text-white rounded-lg py-2 mt-4"
            >
              Crear Producto
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
