  import { useState } from "react";
  import { ChevronDownIcon } from "../icons/ChevronDownIcon";
  import { ActionButton } from "../DataTable";

  export function ActionButtonsComponent({
    row,
    onView,
    onEdit,
    onDelete,
    onCancel,
    onCheck,
    renderExtraActions,
    compact = false,
    actionGuard,
  }: {
    row: any;
    onView?: (row: any) => void;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onCancel?: (row: any) => void;
    onCheck?: (row: any) => void;
    renderExtraActions?: (row: any) => React.ReactNode;
    compact?: boolean;
    actionGuard?: (
      row: any,
    ) => {
      disableEdit?: boolean;
      disableDelete?: boolean;
      editTitle?: string;
      deleteTitle?: string;
    };
  }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const guard = actionGuard?.(row) ?? {};
    const editDisabled = guard.disableEdit ?? false;
    const deleteDisabled = guard.disableDelete ?? false;
    const editTitle = guard.editTitle ?? "Editar";
    const deleteTitle = guard.deleteTitle ?? "Eliminar";

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
                  disabled={editDisabled}
                  title={editDisabled ? editTitle : "Editar"}
                  onClick={() => {
                    if (editDisabled) return;
                    onEdit(row);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs ${
                    editDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-gray-50"
                  }`}
                >
                  Editar
                </button>
              )}

              {onDelete && (
                <button
                  disabled={deleteDisabled}
                  title={deleteDisabled ? deleteTitle : "Eliminar"}
                  onClick={() => {
                    if (deleteDisabled) return;
                    onDelete(row);
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs ${
                    deleteDisabled
                      ? "opacity-40 cursor-not-allowed text-gray-400"
                      : "hover:bg-gray-50 text-red-600"
                  }`}
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-center gap-2 text-gray-600 flex justify-center">
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
            title={editDisabled ? editTitle : "Editar"}
            onClick={() => onEdit(row)}
            disabled={editDisabled}
          />
        )}

        {onDelete && (
          <ActionButton
            icon="/icons/delete.svg"
            title={deleteDisabled ? deleteTitle : "Eliminar"}
            onClick={() => onDelete(row)}
            disabled={deleteDisabled}
          />
        )}

        {onCancel && (
          <ActionButton
            icon="/icons/X.svg"
            title="Anular"
            onClick={() => onCancel(row)}
          />
        )}

        {onCheck && (
          <ActionButton
            icon="/assets/imgs/check-circle.png"
            title="Marcar"
            onClick={() => onCheck(row)}
          />
        )}

        {renderExtraActions && renderExtraActions(row)}
      </div>
    );
  }
