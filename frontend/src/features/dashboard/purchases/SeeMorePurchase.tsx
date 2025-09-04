"use client";

import { IPurchase } from "./Types/Purchase.type";

type SeeMorePurchaseProps = {
  purchase: IPurchase;
};

export default function SeeMorePurchase({ purchase }: SeeMorePurchaseProps) {
  const products =
    purchase.products && purchase.products.length > 0
      ? purchase.products
      : [
          { id: 1, name: "Laptop Dell XPS", quantity: 2, price: 1200 },
          { id: 2, name: "Mouse Logitech", quantity: 5, price: 25 },
          { id: 3, name: "Teclado Mecánico", quantity: 3, price: 75 },
          { id: 4, name: 'Monitor LG 27"', quantity: 1, price: 300 },
        ]
          .sort(() => 0.5 - Math.random()) // mezcla random
          .slice(0, Math.floor(Math.random() * 3) + 1); // toma entre 1 y 3

  return (
    <div className="space-y-6">
      {/* === Datos principales === */}
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
          <label className="block text-sm font-medium">Estado</label>
          <input
            type="text"
            value={purchase.status}
            disabled
            className="w-full border p-2 rounded-lg bg-gray-100"
          />
        </div>
      </div>

      {/* === Productos asociados === */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Productos</h3>
        <div className="space-y-3">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="grid grid-cols-3 gap-3 border rounded-lg p-3 bg-gray-50"
            >
              <div>
                <label className="block text-sm font-medium">Producto</label>
                <input
                  type="text"
                  value={prod.name}
                  disabled
                  className="w-full border p-2 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Cantidad</label>
                <input
                  type="text"
                  value={prod.quantity}
                  disabled
                  className="w-full border p-2 rounded-lg bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Precio</label>
                <input
                  type="text"
                  value={`$${prod.price}`}
                  disabled
                  className="w-full border p-2 rounded-lg bg-gray-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
