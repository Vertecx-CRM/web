// hooks/useAppointments.ts
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
    Appointment,
    AppointmentFormData,
    SlotDateTime,
    Technician,
    CreateAppointmentModalProps,
    AppointmentErrors,
    FormTouched,
    EditAppointmentModalProps,
    AppointmentEvent,
    UseEditAppointmentFormProps
} from '../types/typeAppointment';
import { technicians } from '../mocks/mockAppointment';
import { showSuccess, showError, showInfo, showWarning } from '@/shared/utils/notifications';
import {
    validateAppointmentField,
    validateCompleteAppointment,
    getErrorMessages,
    validateTimeRange,
    validateAppointmentForm,
    validateTechnicians,
    hasValidationErrors
} from '../validations/validationAppointment';

export const useAppointments = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedDateTime, setSelectedDateTime] = useState<SlotDateTime>({
        horaInicio: '',
        minutoInicio: '',
        horaFin: '',
        minutoFin: '',
        dia: '',
        mes: '',
        año: ''
    });

    const handleCreateAppointment = (appointmentData: AppointmentFormData, selectedTechs: Technician[]) => {
        const startDate = new Date(
            parseInt(appointmentData.año),
            parseInt(appointmentData.mes) - 1,
            parseInt(appointmentData.dia),
            parseInt(appointmentData.horaInicio),
            parseInt(appointmentData.minutoInicio)
        );

        const endDate = new Date(
            parseInt(appointmentData.año),
            parseInt(appointmentData.mes) - 1,
            parseInt(appointmentData.dia),
            parseInt(appointmentData.horaFin),
            parseInt(appointmentData.minutoFin)
        );

        const newAppointment: Appointment = {
            id: Math.max(...appointments.map(a => a.id), 0) + 1,
            ...appointmentData,
            tecnicos: selectedTechs,
            start: startDate,
            end: endDate,
            title: `Orden: ${appointmentData.orden}`
        };

        setAppointments(prev => [...prev, newAppointment]);
        setIsCreateModalOpen(false);
        showSuccess('Cita creada exitosamente!');
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
    };

    const openCreateModal = (dateTime: SlotDateTime) => {
        setSelectedDateTime(dateTime);
        setIsCreateModalOpen(true);
    };

    return {
        appointments,
        isCreateModalOpen,
        setIsCreateModalOpen: openCreateModal,
        selectedDateTime,
        handleCreateAppointment,
        closeModals
    };
};

// Hook para el formulario de creación
export const useCreateAppointmentForm = ({
    isOpen,
    onClose,
    onSave,
    selectedDateTime
}: CreateAppointmentModalProps) => {
    const [formData, setFormData] = useState<AppointmentFormData>({
        horaInicio: selectedDateTime.horaInicio || '',
        minutoInicio: selectedDateTime.minutoInicio || '',
        horaFin: selectedDateTime.horaFin || '',
        minutoFin: selectedDateTime.minutoFin || '',
        dia: selectedDateTime.dia || '',
        mes: selectedDateTime.mes || '',
        año: selectedDateTime.año || '',
        tecnico: "",
        orden: "",
        observaciones: "",
        estado: "Pendiente",
    });

    const [selectedTechnicians, setSelectedTechnicians] = useState<Technician[]>([]);
    const [errors, setErrors] = useState<AppointmentErrors>({});
    const [technicianError, setTechnicianError] = useState<string | null>(null);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        if (isOpen) {
            setFormData({
                horaInicio: selectedDateTime.horaInicio || '',
                minutoInicio: selectedDateTime.minutoInicio || '',
                horaFin: selectedDateTime.horaFin || '',
                minutoFin: selectedDateTime.minutoFin || '',
                dia: selectedDateTime.dia || '',
                mes: selectedDateTime.mes || '',
                año: selectedDateTime.año || '',
                tecnico: "",
                orden: "",
                observaciones: "",
                estado: "Pendiente"         
            });
            setSelectedTechnicians([]);
            setErrors({});
            setTechnicianError(null);
            setTouched({});
        }
    }, [isOpen, selectedDateTime]);

    const calculateEndTime = (horaInicio: string, minutoInicio: string) => {
        if (!horaInicio || !minutoInicio) return { horaFin: '', minutoFin: '' };

        let startHour = parseInt(horaInicio);
        let startMinute = parseInt(minutoInicio);

        // Calcular hora final (duración de 2 horas)
        let endHour = startHour + 2;
        let endMinute = startMinute;

        // Ajustar si pasa de medianoche
        if (endHour >= 24) {
            endHour = endHour % 24;
        }

        return {
            horaFin: endHour.toString().padStart(2, '0'),
            minutoFin: endMinute.toString().padStart(2, '0')
        };
    };

    // Efecto para calcular automáticamente la hora final cuando cambia la hora de inicio
    useEffect(() => {
        if ((!formData.horaFin || !formData.minutoFin) &&
            formData.horaInicio && formData.minutoInicio) {

            const { horaFin, minutoFin } = calculateEndTime(
                formData.horaInicio,
                formData.minutoInicio
            );

            setFormData(prev => ({
                ...prev,
                horaFin,
                minutoFin
            }));
        }
    }, [formData.horaInicio, formData.minutoInicio]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));

        const newFormData = { ...formData, [name]: value };
        const timeRangeError = validateTimeRange(
            newFormData.horaInicio,
            newFormData.minutoInicio,
            newFormData.horaFin,
            newFormData.minutoFin
        );

        if (timeRangeError) {
            setErrors(prev => ({ ...prev, timeRange: timeRangeError }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.timeRange;
                return newErrors;
            });
        }
    };

    const handleTechnicianSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const techId = parseInt(e.target.value);
        if (techId) {
            const technician = technicians.find(tech => tech.id === techId);
            if (technician && !selectedTechnicians.find(t => t.id === techId)) {
                setSelectedTechnicians(prev => [...prev, technician]);
                setTechnicianError(null);
                showInfo(`Técnico ${technician.nombre} agregado`);
            } else {
                showWarning('Este técnico ya fue seleccionado');
            }
        }
        setFormData(prev => ({ ...prev, tecnico: "" }));
    };

    const removeTechnician = (id: number) => {
        const technician = selectedTechnicians.find(t => t.id === id);
        setSelectedTechnicians(prev => prev.filter(tech => tech.id !== id));

        const error = selectedTechnicians.length === 1 ? 'Debe seleccionar al menos un técnico' : null;
        setTechnicianError(error);

        if (technician) {
            showWarning(`Técnico ${technician.nombre} removido`);
        }
    };

    const showErrorsSequentially = (errorMessages: string[], technicianError: string | null) => {
        if (errorMessages.length > 0 || technicianError) {
            showError('Por favor, complete todos los campos obligatorios');
        }

        if (errorMessages.length > 0) {
            setTimeout(() => {
                showError(errorMessages[0]);
            }, 500);
        } else if (technicianError) {
            setTimeout(() => {
                showError(technicianError);
            }, 500);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(name, formData[name as keyof AppointmentFormData] as string);
        setErrors(prev => ({ ...prev, [name]: error }));

        if (error) {
            showError(error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let finalFormData = { ...formData };
        if (!finalFormData.horaFin || !finalFormData.minutoFin) {
            const { horaFin, minutoFin } = calculateEndTime(
                finalFormData.horaInicio,
                finalFormData.minutoInicio
            );
            finalFormData = { ...finalFormData, horaFin, minutoFin };
            setFormData(finalFormData);
        }

        const validationResult = validateCompleteAppointment(finalFormData, selectedTechnicians);
        setErrors(validationResult.errors);
        setTechnicianError(validationResult.technicianError);

        setTouched({
            horaInicio: true,
            minutoInicio: true,
            horaFin: true,
            minutoFin: true,
            dia: true,
            mes: true,
            año: true,
            orden: true
        });

        if (!validationResult.isValid) {
            const errorMessages = getErrorMessages(validationResult.errors);
            showErrorsSequentially(errorMessages, validationResult.technicianError);
            return;
        }

        const startDate = new Date(
            parseInt(finalFormData.año),
            parseInt(finalFormData.mes) - 1,
            parseInt(finalFormData.dia),
            parseInt(finalFormData.horaInicio),
            parseInt(finalFormData.minutoInicio)
        );

        const endDate = new Date(
            parseInt(finalFormData.año),
            parseInt(finalFormData.mes) - 1,
            parseInt(finalFormData.dia),
            parseInt(finalFormData.horaFin),
            parseInt(finalFormData.minutoFin)
        );

        onSave({
            id: Date.now(),
            ...finalFormData,
            tecnicos: selectedTechnicians,
            start: new Date(startDate),
            end: new Date(endDate),
            title: `Orden: ${finalFormData.orden}`
        });

        showSuccess('Cita guardada exitosamente');
        onClose();
    };

    return {
        formData,
        selectedTechnicians,
        errors,
        technicianError,
        touched,
        handleInputChange,
        handleTimeChange,
        handleTechnicianSelect,
        removeTechnician,
        handleBlur,
        handleSubmit
    };
};

export const useEditAppointmentForm = ({
    isOpen,
    onClose,
    onSave,
    appointment,
}: EditAppointmentModalProps) => {
    // Estado del formulario
    const [formData, setFormData] = useState<AppointmentEvent>({
        id: 0,
        title: "",
        start: new Date(),
        end: new Date(),
        tecnicos: [],
        horaInicio: "",
        minutoInicio: "",
        horaFin: "",
        minutoFin: "",
        dia: "",
        mes: "",
        año: "",
        orden: "",
        observaciones: "",
        motivoCancelacion: "",
        estado: "Pendiente",
        evidencia: null,
        horaCancelacion: null,
    });

    const [selectedTechnicians, setSelectedTechnicians] = useState<Technician[]>([]);
    const [errors, setErrors] = useState<AppointmentErrors>({});
    const [technicianError, setTechnicianError] = useState<string | null>(null);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [evidencia, setEvidencia] = useState<File | null>(null);
    const [estado, setEstado] = useState<"Pendiente" | "Finalizado" | "Cancelado">("Pendiente");

    // Inicializar datos si hay appointment
    useEffect(() => {
        if (appointment) {
            setFormData({
                ...appointment,
                horaInicio: appointment.horaInicio || "",
                minutoInicio: appointment.minutoInicio || "",
                horaFin: appointment.horaFin || "",
                minutoFin: appointment.minutoFin || "",
                dia: appointment.dia || "",
                mes: appointment.mes || "",
                año: appointment.año || "",
                orden: appointment.orden || "",
                observaciones: appointment.observaciones || "",
                motivoCancelacion: appointment.motivoCancelacion || "",
                estado: appointment.estado || "Pendiente",
                evidencia: appointment.evidencia || null,
                horaCancelacion: appointment.horaCancelacion || null,
            });
            setSelectedTechnicians(appointment.tecnicos || []);
            setEvidencia(appointment.evidencia || null);
            setEstado(appointment.estado || "Pendiente");
        }
    }, [appointment, isOpen]);

    // Manejo de cambios en inputs
    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Si se cambia estado a algo distinto de Cancelado, limpiar motivoCancelacion
        if (name === "estado" && value !== "Cancelado") {
            setFormData((prev) => ({ ...prev, motivoCancelacion: "", horaCancelacion: null }));
            setErrors((prev) => ({ ...prev, motivoCancelacion: undefined }));
        }
    };

    const handleTimeChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleInputChange(e);
    };

    const handleTechnicianSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const techId = parseInt(e.target.value);
        if (!selectedTechnicians.find((t) => t.id === techId)) {
            setSelectedTechnicians((prev) => [
                ...prev,
                { id: techId, nombre: e.target.selectedOptions[0].text, titulo: "" },
            ]);
        }
    };

    const removeTechnician = (id: number) => {
        setSelectedTechnicians((prev) => prev.filter((t) => t.id !== id));
    };

    const handleEvidenciaChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEvidencia(e.target.files[0]);
        }
    };

    const removeEvidencia = () => setEvidencia(null);

    const handleBlur = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const fieldError = validateAppointmentField(name, value);
        setErrors((prev) => ({ ...prev, [name]: fieldError }));
    };


    const handleEstadoChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newEstado = e.target.value as "Pendiente" | "Finalizado" | "Cancelado";
        setEstado(newEstado);

        setFormData((prev) => ({
            ...prev,
            estado: newEstado,
            horaCancelacion: newEstado === "Cancelado" ? new Date() : null,
        }));
    };

    // Submit
    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const formErrors: AppointmentErrors = validateAppointmentForm(formData);

        // Validar técnicos
        const techError = validateTechnicians(selectedTechnicians);

        // Validar rango de tiempo
        const timeRangeError = validateTimeRange(
            formData.horaInicio || "",
            formData.minutoInicio || "",
            formData.horaFin || "",
            formData.minutoFin || ""
        );
        if (timeRangeError) formErrors.timeRange = timeRangeError;

        // Validar motivoCancelacion si estado es Cancelado
        if (formData.estado === "Cancelado" && !formData.motivoCancelacion?.trim()) {
            formErrors.motivoCancelacion = "Debe indicar el motivo de la cancelación";
        }

        setErrors(formErrors);
        setTechnicianError(techError);

        const isValid = !hasValidationErrors(formErrors) && !techError && !timeRangeError;

        if (!isValid) return;

        // Construir objeto final
        const updatedAppointment: AppointmentEvent = {
            ...formData,
            tecnicos: selectedTechnicians,
            evidencia: evidencia,
            estado,
            horaCancelacion:
                estado === "Cancelado"
                    ? formData.horaCancelacion || new Date()
                    : null,
        };

        onSave(updatedAppointment);
        onClose();
    };

    return {
        formData,
        selectedTechnicians,
        evidencia,
        errors,
        technicianError,
        touched,
        handleInputChange,
        handleTimeChange,
        handleTechnicianSelect,
        removeTechnician,
        handleEvidenciaChange,
        handleBlur,
        handleSubmit,
        removeEvidencia,
        estado,
        handleEstadoChange,
    };
};
