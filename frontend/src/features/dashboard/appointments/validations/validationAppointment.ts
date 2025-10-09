import { months } from "../mocks/mockAppointment";
import { AppointmentErrors, AppointmentEvent, AppointmentFormData, TipoCita } from "../types/typeAppointment";

export const validateAppointmentField = (
  name: string,
  value: string,
  formData?: AppointmentFormData
): string | undefined => {
  const intVal = parseInt(value);

  switch (name) {
    case "horaInicio":
      if (!value || intVal < 7 || intVal > 18) {
        return "Hora inicio debe estar entre 7 y 18";
      }
      if (formData?.horaFin) {
        const endHour = parseInt(formData.horaFin);
        if (endHour < intVal) {
          return "Hora inicio no puede ser mayor que hora fin";
        }
        if (endHour === intVal && formData.minutoFin && formData.minutoInicio) {
          const startMin = parseInt(formData.minutoInicio);
          const endMin = parseInt(formData.minutoFin);
          if (startMin >= endMin) {
            return "Los minutos de inicio deben ser menores que los de fin";
          }
        }
      }
      break;

    case "horaFin":
      if (!value || intVal < 7 || intVal > 18) {
        return "Hora fin debe estar entre 7 y 18";
      }
      if (formData?.horaInicio) {
        const startHour = parseInt(formData.horaInicio);
        if (intVal < startHour) {
          return "Hora fin debe ser mayor que hora inicio";
        }
        if (intVal === startHour && formData.minutoFin && formData.minutoInicio) {
          const startMin = parseInt(formData.minutoInicio);
          const endMin = parseInt(formData.minutoFin);
          if (endMin <= startMin) {
            return "La hora final debe ser posterior a la hora de inicio";
          }
        }
      }
      break;

    case "minutoInicio":
    case "minutoFin":
      if (!value || intVal < 0 || intVal > 59) {
        return "Minutos deben estar entre 0 y 59";
      }
      break;

    case "dia":
      if (!value || intVal < 1 || intVal > 31) {
        return "Día debe estar entre 1 y 31";
      }
      break;

    case "año":
      if (!value || intVal < 2023 || intVal > 2030) {
        return "Año debe estar entre 2023 y 2030";
      }
      break;

    case "orden":
      break;

    case "mes":
      if (!value || !months[intVal]) {
        return "Selecciona un mes válido";
      }
      break;

    case "tipoCita":
      if (!value || !["solicitud", "ejecucion", "garantia"].includes(value)) {
        return "Selecciona un tipo de cita válido";
      }
      break;

    case 'nombreCliente':
      if (!value?.trim()) return 'El nombre del cliente es obligatorio';
      if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
      break;

    case 'direccion':
      if (!value?.trim()) return 'La dirección es obligatoria';
      if (value.trim().length < 5) return 'La dirección debe tener al menos 5 caracteres';
      break;

    case 'tipoServicioSolicitud':
      if (!value) return 'El tipo de servicio es obligatorio';
      break;

    case 'tipoMantenimientoSolicitud':
      if (!value) return 'El tipo de mantenimiento es obligatorio';
      break;
  }

  return undefined;
};

export const validateAppointmentForm = (formData: AppointmentFormData | AppointmentEvent): AppointmentErrors => {
  const errors: AppointmentErrors = {};

  // Validar tipo de cita
  if (!formData.tipoCita || !["solicitud", "ejecucion", "garantia"].includes(formData.tipoCita)) {
    errors.tipoCita = 'Selecciona un tipo de cita válido';
  }

  // Validar orden solo para ejecucion y garantia
  if ((formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia") && !formData.orden) {
    errors.orden = 'Selecciona un número de orden';
  }
  // Para solicitud, la orden no es obligatoria

  if (!formData.horaInicio || parseInt(formData.horaInicio) < 0 || parseInt(formData.horaInicio) > 23) {
    errors.horaInicio = 'Hora inicio debe estar entre 0 y 23';
  }

  if (
    !formData.horaInicio ||
    parseInt(formData.horaInicio) < 7 ||
    parseInt(formData.horaInicio) > 18
  ) {
    errors.horaInicio = "Hora inicio debe estar entre 7 y 18";
  }

  if (
    !formData.horaFin ||
    parseInt(formData.horaFin) < 7 ||
    parseInt(formData.horaFin) > 18
  ) {
    errors.horaFin = "Hora fin debe estar entre 7 y 18";
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

  if (formData.dia && formData.mes && formData.año) {
    const dia = parseInt(formData.dia);
    const mes = parseInt(formData.mes);
    const año = parseInt(formData.año);

    const fecha = new Date(año, mes - 1, dia);
    if (fecha.getDay() === 0) {
      errors.dia = "No se permiten citas en domingo";
    }
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

  if (startHour < 7 || startHour > 18 || endHour < 7 || endHour > 18) {
    return "Las horas deben estar entre 7 AM y 6 PM";
  }

  if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
    return "La hora final debe ser posterior a la hora de inicio";
  }

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