export interface DeleteButtonProps {
  itemName: string;
  onConfirm: () => void;
  className?: string;
  disabled?: boolean;
  customMessage?: string;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export interface AlertOptions {
  title: string;
  text: string;
  icon: 'warning' | 'success' | 'error';
  showCancelButton?: boolean;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  reverseButtons?: boolean;
  customClass?: {
    confirmButton?: string;
    cancelButton?: string;
  };
  timer?: number;
  showConfirmButton?: boolean;
}