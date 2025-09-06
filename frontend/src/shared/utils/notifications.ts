import { toast, ToastOptions } from 'react-toastify';

// Configuración por defecto para las notificaciones
const defaultToastOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

// Función para mostrar mensajes de éxito
export const showSuccess = (message: string, options?: ToastOptions) => {
  toast.success(message, {
    ...defaultToastOptions,
    ...options,
  });
};

// Función para mostrar mensajes de error
export const showError = (message: string, options?: ToastOptions) => {
  toast.error(message, {
    ...defaultToastOptions,
    ...options,
  });
};

// Función para mostrar mensajes de advertencia
export const showWarning = (message: string, options?: ToastOptions) => {
  toast.warning(message, {
    ...defaultToastOptions,
    ...options,
  });
};

// Función para mostrar mensajes de información
export const showInfo = (message: string, options?: ToastOptions) => {
  toast.info(message, {
    ...defaultToastOptions,
    ...options,
  });
};