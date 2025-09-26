// genericSearchCombobox.tsx
import React, { useState, useRef, useEffect } from 'react';
import { SolicitudOrden, OrdenServicio, Material } from '../../types/typeAppointment';

// Tipos más específicos para cada caso
interface BaseSearchableItem {
  id: string;
  cliente: string;
  servicio: string;
}

interface SolicitudSearchableItem extends BaseSearchableItem {
  tipoServicio: "mantenimiento" | "instalacion";
  tipoMantenimiento?: "preventivo" | "correctivo";
  direccion: string;
  monto: number;
  descripcion?: string;
}

interface OrdenServicioSearchableItem extends SolicitudSearchableItem {
  materiales: Material[];
}

// Props específicas para cada tipo
interface BaseSearchComboboxProps {
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  label?: string;
  resetTrigger?: number;
  placeholder?: string;
}

interface SolicitudSearchComboboxProps extends BaseSearchComboboxProps {
  solicitudes: SolicitudOrden[];
  selectedItem: SolicitudOrden | null;
  onItemSelect: (item: SolicitudOrden | null) => void;
}

interface OrdenServicioSearchComboboxProps extends BaseSearchComboboxProps {
  ordenesServicio: OrdenServicio[];
  selectedItem: OrdenServicio | null;
  onItemSelect: (item: OrdenServicio | null) => void;
}

// Componente genérico con unión de tipos
type SearchableItem = SolicitudOrden | OrdenServicio;

interface GenericSearchComboboxProps {
  items: SearchableItem[];
  selectedItem: SearchableItem | null;
  onItemSelect: (item: SearchableItem | null) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  label?: string;
  resetTrigger?: number;
  placeholder?: string;
  searchType: 'solicitud' | 'orden-servicio';
}

export const GenericSearchCombobox: React.FC<GenericSearchComboboxProps> = ({
  items,
  selectedItem,
  onItemSelect,
  onBlur,
  error,
  touched,
  label,
  resetTrigger,
  placeholder,
  searchType
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Labels por defecto según el tipo de búsqueda
  const defaultLabels = {
    'solicitud': {
      label: 'Buscar Solicitud de Orden',
      placeholder: 'Buscar por ID, cliente o servicio...'
    },
    'orden-servicio': {
      label: 'Buscar Orden de Servicio',
      placeholder: 'Buscar por ID, cliente, servicio o dirección...'
    }
  };

  const currentConfig = defaultLabels[searchType];

  // Efecto para reset cuando cambia resetTrigger
  useEffect(() => {
    if (resetTrigger) {
      setQuery("");
      setIsOpen(false);
    }
  }, [resetTrigger]);

  // Efecto para cargar el item seleccionado
  useEffect(() => {
      if (selectedItem) {
          setQuery(`${selectedItem.id} - ${selectedItem.cliente}`);
    } else {
      setQuery('');
    }
  }, [selectedItem]);

  // Función de filtrado genérica
  const filteredItems = query === '' 
    ? items 
    : items.filter(item =>
        item.cliente.toLowerCase().includes(query.toLowerCase()) ||
        item.id.toLowerCase().includes(query.toLowerCase()) ||
        item.servicio.toLowerCase().includes(query.toLowerCase()) ||
        (searchType === 'orden-servicio' && 
         'direccion' in item && 
         item.direccion.toLowerCase().includes(query.toLowerCase()))
      );

  // Función para renderizar la información adicional según el tipo
  const renderAdditionalInfo = (item: SearchableItem) => {
    if (searchType === 'orden-servicio' && 'materiales' in item) {
      const orden = item as OrdenServicio;
      return (
        <>
          <div className="text-sm text-gray-400">{orden.direccion}</div>
          {orden.materiales && orden.materiales.length > 0 && (
            <div className="text-xs text-gray-400 mt-1">
              Materiales: {orden.materiales.map(m => m.nombre).join(', ')}
            </div>
          )}
        </>
      );
    }
    
    // Para solicitudes, no mostramos información adicional
    return null;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2">
        {label || currentConfig.label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onItemSelect(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 200);
            onBlur?.();
          }}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            error && touched
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          placeholder={placeholder || currentConfig.placeholder}
        />

        {isOpen && filteredItems.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onMouseDown={() => {
                  onItemSelect(item);
                  setQuery(`${item.id} - ${item.cliente}`);
                  setIsOpen(false);
                }}
              >
                <div className="font-medium">{item.id}</div>
                <div className="text-sm text-gray-600">{item.cliente}</div>
                <div className="text-sm text-gray-500">{item.servicio}</div>
                {renderAdditionalInfo(item)}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && touched && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

// Componentes específicos con tipos correctos usando type assertion
export const SolicitudSearchCombobox: React.FC<SolicitudSearchComboboxProps> = (props) => {
  // Convertimos la función específica a la firma genérica
  const handleItemSelect = (item: SearchableItem | null) => {
    props.onItemSelect(item as SolicitudOrden | null);
  };

  return (
    <GenericSearchCombobox
      items={props.solicitudes}
      selectedItem={props.selectedItem}
      onItemSelect={handleItemSelect}
      onBlur={props.onBlur}
      error={props.error}
      touched={props.touched}
      label={props.label}
      resetTrigger={props.resetTrigger}
      placeholder={props.placeholder}
      searchType="solicitud"
    />
  );
};

export const OrdenServicioSearchCombobox: React.FC<OrdenServicioSearchComboboxProps> = (props) => {
  // Convertimos la función específica a la firma genérica
  const handleItemSelect = (item: SearchableItem | null) => {
    props.onItemSelect(item as OrdenServicio | null);
  };

  return (
    <GenericSearchCombobox
      items={props.ordenesServicio}
      selectedItem={props.selectedItem}
      onItemSelect={handleItemSelect}
      onBlur={props.onBlur}
      error={props.error}
      touched={props.touched}
      label={props.label}
      resetTrigger={props.resetTrigger}
      placeholder={props.placeholder}
      searchType="orden-servicio"
    />
  );
};