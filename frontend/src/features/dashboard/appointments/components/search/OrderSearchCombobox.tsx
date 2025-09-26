// components/OrderSearchCombobox.tsx
import { useRef, useEffect } from 'react';

import Colors from '@/shared/theme/colors';
import { OrderSearchComboboxProps } from '../../types/typeAppointment';
import { useClickOutside, useOrderSearch } from '../../hooks/useAppointment';

export const OrderSearchCombobox: React.FC<OrderSearchComboboxProps> = ({
  orders,
  selectedOrder,
  onOrderSelect,
  onBlur,
  error,
  touched = false,
  label = "Nro. Orden",
  validateOrder 
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    highlightedIndex,
    touched: localTouched,
    filteredOrders,
    displayValue,
    localError, 
    setIsOpen,
    handleSelectOrder,
    handleInputChange,
    handleKeyDown,
    handleBlur, 
    setHighlightedIndex,
  } = useOrderSearch({
    orders,
    selectedOrder,
    onOrderSelect,
    onOrderBlur: onBlur, 
    validateOrder,
  });

  useClickOutside(dropdownRef, () => {
    setIsOpen(false);
    handleBlur(); 
  }, isOpen);

  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll('li');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const finalError = localError || error;
  const finalTouched = touched || localTouched;
  const isError = finalError && finalTouched;

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-sm font-medium mb-2" style={{ color: Colors.texts.primary }}>
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Buscar orden por número o cliente..."
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            isError
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-[#CC0000]"
          }`}
          style={{
            borderColor: isError
              ? Colors.states.inactive
              : Colors.table.lines,
            backgroundColor: "white"
          }}
          name="orden"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {selectedOrder && (
            <button
              type="button"
              onClick={() => handleSelectOrder(null)}
              className="p-1 mr-1 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Limpiar selección"
            >
              ×
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-2 py-1 text-gray-500 hover:text-gray-700 border-l transition-colors"
            aria-label={isOpen ? "Cerrar lista" : "Abrir lista"}
          >
            {isOpen ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          <ul>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <li
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-[#CC0000] text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{order.id} - {order.cliente}</div>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500 text-center">
                No se encontraron órdenes
              </li>
            )}
          </ul>
        </div>
      )}

      {isError && (
        <p className="text-xs mt-1" style={{ color: Colors.states.inactive }}>
          {finalError}
        </p>
      )}
    </div>
  );
};