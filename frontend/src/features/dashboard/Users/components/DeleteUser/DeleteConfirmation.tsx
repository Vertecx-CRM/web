"use client";

import { useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { User } from "../../types";


const MySwal = withReactContent(Swal);

interface DeleteConfirmationProps {
  user: User | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({
  user,
  onConfirm,
  onCancel
}: DeleteConfirmationProps) {
  useEffect(() => {
    if (user) {
      MySwal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar al usuario "${user.nombre}"? Esta acción no se puede deshacer.`,
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
      }).then((result) => {
        if (result.isConfirmed) {
          onConfirm();
          // Mostrar mensaje de éxito
          MySwal.fire({
            title: '¡Eliminado!',
            text: `${user.nombre} ha sido eliminado correctamente.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          onCancel();
        }
      });
    }
  }, [user, onConfirm, onCancel]);

  return null; // Este componente no renderiza nada visible
}