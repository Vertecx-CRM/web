import { months } from "../mocks/mockAppointment";
import { AppointmentErrors, AppointmentEvent, AppointmentFormData } from "../types/typeAppointment";

export const validateAppointmentField = (name: string, value: string): string => {
  switch (name) {
    case 'horaInicio':
    case 'horaFin':
      if (!value || parseInt(value) < 0 || parseInt(value) > 23) {
        return 'Hora debe estar entre 0 y 23';
      }
      break;
    case 'minutoInicio':
    case 'minutoFin':
      if (!value || parseInt(value) < 0 || parseInt(value) > 59) {
        return 'Minutos deben estar entre 0 y 59';
      }
      break;
    case 'dia':
      if (!value || parseInt(value) < 1 || parseInt(value) > 31) {
        return 'Día debe estar entre 1 y 31';
      }
      break;
    case 'año':
      if (!value || parseInt(value) < 2023 || parseInt(value) > 2030) {
        return 'Año debe estar entre 2023 y 2030';
      }
      break;
    case 'orden':
      if (!value) {
        return 'Selecciona un número de orden';
      }
      break;
    case 'mes':
      if (!value || !months[parseInt(value)]) {
        return 'Selecciona un mes válido';
      }
      break;
  }
  return '';
};

export const validateAppointmentForm = (formData: AppointmentFormData | AppointmentEvent): AppointmentErrors => {
  const errors: AppointmentErrors = {};

  if (!formData.horaInicio || parseInt(formData.horaInicio) < 0 || parseInt(formData.horaInicio) > 23) {
    errors.horaInicio = 'Hora inicio debe estar entre 0 y 23';
  }

  if (!formData.minutoInicio || parseInt(formData.minutoInicio) < 0 || parseInt(formData.minutoInicio) > 59) {
    errors.minutoInicio = 'Minutos inicio deben estar entre 0 y 59';
  }

  if (!formData.horaFin || parseInt(formData.horaFin) < 0 || parseInt(formData.horaFin) > 23) {
    errors.horaFin = 'Hora fin debe estar entre 0 y 23';
  }

  if (!formData.minutoFin || parseInt(formData.minutoFin) < 0 || parseInt(formData.minutoFin) > 59) {
    errors.minutoFin = 'Minutos fin deben estar entre 0 y 59';
  }

  if (!formData.dia || parseInt(formData.dia) < 1 || parseInt(formData.dia) > 31) {
    errors.dia = 'Día debe estar entre 1 y 31';
  }

  if (!formData.mes || !months[parseInt(formData.mes)]) {
    errors.mes = 'Selecciona un mes válido';
  }

  if (!formData.año || parseInt(formData.año) < 2023 || parseInt(formData.año) > 2030) {
    errors.año = 'Año debe estar entre 2023 y 2030';
  }

  if (!formData.orden) {
    errors.orden = 'Selecciona un número de orden';
  }

  return errors;
};

export const hasValidationErrors = (errors: AppointmentErrors): boolean => {
  return Object.keys(errors).length > 0;
};

// función para validar técnicos
export const validateTechnicians = (technicians: any[]): string | null => {
  if (technicians.length === 0) {
    return 'Debe seleccionar al menos un técnico';
  }
  return null;
};

// función para obtener mensajes de error
export const getErrorMessages = (errors: AppointmentErrors): string[] => {
  return Object.values(errors).filter(msg => msg) as string[];
};

// función para validar el rango de tiempo
export const validateTimeRange = (
  horaInicio: string, 
  minutoInicio: string, 
  horaFin: string, 
  minutoFin: string
): string | null => {
  const startHour = parseInt(horaInicio);
  const startMinute = parseInt(minutoInicio);
  const endHour = parseInt(horaFin);
  const endMinute = parseInt(minutoFin);

  // Validar que la hora de inicio sea antes que la hora de fin
  if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
    return "La hora final debe ser posterior a la hora de inicio";
  }

  return null;
};

// Función para validar formulario completo (reemplaza la duplicada)
export const validateCompleteAppointment = (
  formData: AppointmentFormData, 
  selectedTechnicians: any[]
): { isValid: boolean; errors: AppointmentErrors; technicianError: string | null } => {
  const errors = validateAppointmentForm(formData);
  const technicianError = validateTechnicians(selectedTechnicians);
  
  // Validar rango de tiempo
  const timeRangeError = validateTimeRange(
    formData.horaInicio,
    formData.minutoInicio,
    formData.horaFin,
    formData.minutoFin
  );
  if (timeRangeError) {
    errors.timeRange = timeRangeError;
  }

  if (formData.estado === "Cancelado" && (!formData.motivoCancelacion || formData.motivoCancelacion.trim() === "")) {
    errors.motivoCancelacion = "Debes indicar el motivo de la cancelación";
  }

  const isValid = !hasValidationErrors(errors) && !technicianError && !timeRangeError;
  
  return { isValid, errors, technicianError };
};

