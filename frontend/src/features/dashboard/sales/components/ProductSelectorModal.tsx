"use client";

import { useState, useMemo } from "react";
import Modal from "@/features/dashboard/components/Modal";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  products: any[];
  onSelect: (product: any, quantity: number) => void;
}

export default function ProductSelectorModal({
  isOpen,
  onClose,
  products,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [error, setError] = useState(""); // ← Mensaje de error (stock)

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.productname.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, products]);

  const reset = () => {
    setQuery("");
    setSelectedId("");
    setQuantity(1);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleAdd = () => {
    setError("");

    if (!selectedId) return;

    const product = products.find((p) => p.productid == selectedId);
    if (!product) return;

    // VALIDACIÓN DE STOCK
    if (quantity > product.productstock) {
      setError(
        `No puedes vender ${quantity} unidades. Solo hay ${product.productstock} en stock.`
      );
      return;
    }

    onSelect(product, quantity);
    handleClose();
  };

  return (
    <Modal
      title="Seleccionar Producto"
      isOpen={isOpen}
      onClose={handleClose}
      widthClass="md:max-w-xl"
      footer={null}
    >
      <div className="space-y-4">
        {/* BUSCADOR */}
        <div>
          <label className="block text-sm mb-1">Buscar producto</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Escribe para buscar..."
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        {/* LISTA FILTRADA */}
        <div className="border rounded-lg max-h-48 overflow-auto bg-white">
          {filteredProducts.length === 0 && (
            <p className="p-3 text-gray-500 text-sm">
              No se encontraron productos.
            </p>
          )}

          {filteredProducts.map((p) => (
            <div
              key={p.productid}
              onClick={() => {
                setSelectedId(p.productid);
                setError("");
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                selectedId == p.productid ? "bg-gray-300" : ""
              }`}
            >
              <div className="font-medium">{p.productname}</div>
              <div className="text-xs text-gray-600">
                ${p.productpriceofsale.toLocaleString("es-CO")} — Stock:{" "}
                {p.productstock}
              </div>
            </div>
          ))}
        </div>

        {/* CANTIDAD */}
        <label className="block text-sm">Cantidad</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => {
            setQuantity(Number(e.target.value));
            setError("");
          }}
          className="w-32 border rounded-lg px-3 py-2"
        />

        {/* ERROR DE STOCK */}
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        {/* BOTÓN AGREGAR */}
        <button
          onClick={handleAdd}
          className="w-full bg-black text-white rounded-lg py-2 mt-4"
        >
          Agregar
        </button>
      </div>
    </Modal>
  );
}
