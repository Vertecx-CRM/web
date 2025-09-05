import React from "react";
import GraphPurchase from "./components/GraphPurchase";
import { purchasesGraphMock } from "./mock/purchasesGraph.mock";
import { Star } from "lucide-react";

const PurchasesList = () => {
  const topSuppliers = purchasesGraphMock.slice(0, 5);

  // Paleta derivada de ff7171 para cada posición
  const gradients: Record<number, string> = {
    1: "linear-gradient(135deg, #ff7171, #b91c1c)", // rojo fuerte
    2: "linear-gradient(135deg, #ff8a8a, #dc2626)", // rojo medio
    3: "linear-gradient(135deg, #ffb3b3, #f87171)", // coral
    4: "linear-gradient(135deg, #ffd6d6, #fca5a5)", // rosa claro
    5: "linear-gradient(135deg, #ffeaea, #fecaca)", // muy suave
  };

  return (
    <>
      <GraphPurchase />
      <h2 className="text-xl font-bold mb-6 text-center">
        Top 5 de proveedores
      </h2>

      {/* Grid responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {topSuppliers.map((supplier) => (
          <div
            key={supplier.top}
            className="cursor-pointer relative rounded-2xl shadow-lg p-5 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            style={{
              background: gradients[supplier.top] || gradients[5],
            }}
          >
            {/* Estrellita arriba derecha */}
            <div className="absolute top-3 right-3 text-yellow-400">
              <Star size={22} fill="currentColor" />
            </div>

            {/* Contenido */}
            <div className="text-sm font-medium opacity-90">
              Top #{supplier.top}
            </div>
            <div className="text-lg font-bold">{supplier.supplier}</div>
            <div className="mt-3 text-sm opacity-90">
              <span className="font-semibold">Total:</span> {supplier.total}
            </div>
            <div className="text-sm opacity-90">
              <span className="font-semibold">Cantidad:</span>{" "}
              {supplier.quantity}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PurchasesList;
