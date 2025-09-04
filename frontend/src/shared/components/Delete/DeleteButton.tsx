'use client';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { DeleteButtonProps } from './type';


const MySwal = withReactContent(Swal);

export default function DeleteButton({
  itemName,
  onConfirm,
  className = "",
  disabled = false,
  customMessage,
  variant = 'contained',
  size = 'medium',
  fullWidth = false
}: DeleteButtonProps) {
  
  // Configuración de clases según las props
  const getVariantClasses = () => {
    switch(variant) {
      case 'outlined':
        return 'border border-red-600 text-red-600 hover:bg-red-50';
      case 'text':
        return 'text-red-600 hover:bg-red-50';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch(size) {
      case 'small':
        return 'px-3 py-1 text-sm';
      case 'large':
        return 'px-5 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const buttonClasses = `
    rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${widthClass}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  const handleDelete = async () => {
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
        onConfirm();
        
        // Mostrar mensaje de éxito
        MySwal.fire({
          title: '¡Eliminado!',
          text: `${itemName} ha sido eliminado correctamente.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        MySwal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el elemento. Por favor, intenta nuevamente.',
          icon: 'error'
        });
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={disabled}
      className={buttonClasses}
      type="button"
    >
      Eliminar
    </button>
  );
}