import { useState } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { ActionButton } from "../DataTable";

export function ActionButtonsComponent({
  row,
  onView,
  onEdit,
  onDelete,
  onCancel,
  renderExtraActions,
  compact = false,
}: {
  row: any;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onCancel?: (row: any) => void;
  renderExtraActions?: (row: any) => React.ReactNode;
  compact?: boolean;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-md"
        >
          Acciones
          <ChevronDownIcon className="h-3 w-3" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-20 min-w-32">
            {onView && (
              <button
                onClick={() => {
                  onView(row);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
              >
                Ver
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(row);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(row);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-red-600"
              >
                Eliminar
              </button>
            )}
            {onCancel && (
              <button
                onClick={() => {
                  onCancel(row);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50"
              >
                Anular
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center gap-2 text-gray-600 ">
      {onView && (
        <ActionButton
          icon="/icons/Eye.svg"
          title="Ver"
          onClick={() => onView(row)}
        />
      )}
      {onEdit && (
        <ActionButton
          icon="/icons/Edit.svg"
          title="Editar"
          onClick={() => onEdit(row)}
        />
      )}
      {onDelete && (
        <ActionButton
          icon="/icons/delete.svg"
          title="Eliminar"
          onClick={() => onDelete(row)}
        />
      )}
      {onCancel && (
        <ActionButton
          icon="/icons/X.svg"
          title="Anular"
          onClick={() => onCancel(row)}
        />
      )}
      {renderExtraActions && renderExtraActions(row)}
    </div>
  );
}
