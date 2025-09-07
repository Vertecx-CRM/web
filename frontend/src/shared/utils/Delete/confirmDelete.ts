import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { showSuccess, showError } from '../notifications';
import { ConfirmDeleteOptions } from './typeConfirmDelete';

const MySwal = withReactContent(Swal);

export const confirmDelete = async (
  options: ConfirmDeleteOptions,
  onConfirm: () => Promise<void> | void
): Promise<boolean> => {
  const {
    itemName,
    itemType = 'elemento',
    customMessage,
    successMessage,
    errorMessage
  } = options;

  const result = await MySwal.fire({
    title: '¿Estás seguro?',
    text: customMessage || `¿Deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      confirmButton: 'swal2-confirm',
      cancelButton: 'swal2-cancel'
    }
  });

  if (result.isConfirmed) {
    try {
      await onConfirm();
      
      // Mensaje de éxito
      showSuccess(
        successMessage || `${itemType} "${itemName}" ha sido eliminado correctamente.`
      );
      return true;
    } catch (error) {
      // Mensaje de error
      MySwal.fire({
        title: 'Error',
        text: errorMessage || `No se pudo eliminar el ${itemType}. Por favor, intenta nuevamente.`,
        icon: 'error'
      });
      return false;
    }
  }
  
  return false;
};

// Versión simplificada para uso rápido
export const confirmDeleteSimple = async (
  itemName: string,
  onConfirm: () => Promise<void> | void,
  itemType: string = 'elemento'
): Promise<boolean> => {
  return confirmDelete({ itemName, itemType }, onConfirm);
};