import { useState, useEffect, ChangeEvent, FormEvent, useCallback, KeyboardEvent, RefObject } from 'react';
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
    UseEditAppointmentFormProps,
    Order,
    UseOrderSearchProps
} from '../types/typeAppointment';
import { orders, technicians } from '../mocks/mockAppointment';
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
        tecnicos: [],
        orden: null,
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
                tecnicos: [],
                orden: null,
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

        let endHour = startHour + 2;
        let endMinute = startMinute;

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

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }

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
        setFormData(prev => ({ ...prev, tecnico: [] }));
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

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, formData[name as keyof AppointmentFormData] as string);
            setErrors(prev => ({ ...prev, [name]: error }));

            if (error) {
                showError(error);
            }
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
            horaInicio: finalFormData.horaInicio.padStart(2, '0'),
            minutoInicio: finalFormData.minutoInicio.padStart(2, '0'),
            horaFin: finalFormData.horaFin.padStart(2, '0'),
            minutoFin: finalFormData.minutoFin.padStart(2, '0'),
            orden: finalFormData.orden && typeof finalFormData.orden === 'object'
                ? finalFormData.orden
                : null,
            tecnicos: selectedTechnicians,
            start: startDate,
            end: endDate,
            title: finalFormData.orden
                ? `Orden: ${typeof finalFormData.orden === 'object' ? finalFormData.orden.id : finalFormData.orden}`
                : "Sin orden"
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


const buildTitle = (orden: string | Order | null | undefined): string => {
    if (orden) {
        if (typeof orden === 'string') {
            return `Orden: ${orden}`;
        }
        // Si es un objeto, usa su ID
        if (typeof orden === 'object' && orden.id) {
            return `Orden: ${orden.id}`;
        }
    }
    // En cualquier otro caso
    return "Sin orden asignada";
};

// Hook para el formulario de editar
export const useEditAppointmentForm = ({
    onClose,
    onSave,
    appointment,
}: UseEditAppointmentFormProps) => {
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
        orden: null,
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

    const updateDateTime = useCallback(() => {
        if (
            formData.dia &&
            formData.mes &&
            formData.año &&
            formData.horaInicio &&
            formData.minutoInicio &&
            formData.horaFin &&
            formData.minutoFin
        ) {
            try {
                const newStart = new Date(
                    parseInt(formData.año),
                    parseInt(formData.mes) - 1,
                    parseInt(formData.dia),
                    parseInt(formData.horaInicio),
                    parseInt(formData.minutoInicio)
                );

                const newEnd = new Date(
                    parseInt(formData.año),
                    parseInt(formData.mes) - 1,
                    parseInt(formData.dia),
                    parseInt(formData.horaFin),
                    parseInt(formData.minutoFin)
                );

                // validación de fecha inválida
                if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime())) {
                    setErrors((prev) => ({
                        ...prev,
                        date: "La fecha seleccionada no es válida",
                    }));
                    return;
                }

                // validación de domingo
                if (newStart.getDay() === 0) {
                    setErrors((prev) => ({
                        ...prev,
                        date: "No se permiten citas en domingo",
                    }));
                    showError("No se permiten citas el domingo");
                    return;
                } else {
                    setErrors((prev) => ({
                        ...prev,
                        date: undefined,
                    }));
                }

                setFormData((prev) => ({
                    ...prev,
                    start: newStart,
                    end: newEnd,
                    title: buildTitle(prev.orden),
                }));
            } catch (error) {
                console.error("Error updating date time:", error);
            }
        }
    }, [formData.dia, formData.mes, formData.año, formData.horaInicio, formData.minutoInicio, formData.horaFin, formData.minutoFin]);


    useEffect(() => {
        updateDateTime();
    }, [updateDateTime]);

    useEffect(() => {
        if (appointment) {
            const orderId = typeof appointment.orden === 'object' && appointment.orden !== null
                ? appointment.orden.id
                : appointment.orden;

            const resolvedOrden = orderId ? orders.find((o) => o.id === orderId) || null : null;
            console.log(resolvedOrden)

            const initialFormData: AppointmentEvent = {
                ...appointment,
                horaInicio: appointment.horaInicio || "",
                minutoInicio: appointment.minutoInicio || "",
                horaFin: appointment.horaFin || "",
                minutoFin: appointment.minutoFin || "",
                dia: appointment.dia || "",
                mes: appointment.mes || "",
                año: appointment.año || "",
                orden: resolvedOrden,
                observaciones: appointment.observaciones || "",
                motivoCancelacion: appointment.motivoCancelacion || "",
                estado: appointment.estado || "Pendiente",
                evidencia: appointment.evidencia || null,
                horaCancelacion: appointment.horaCancelacion || null,
                title: buildTitle(resolvedOrden),
            };

            setFormData(initialFormData);
            setSelectedTechnicians(appointment.tecnicos || []);
            setEvidencia(appointment.evidencia || null);
            setEstado(appointment.estado || "Pendiente");

            setErrors({});
            setTechnicianError(null);
            setTouched({});
        }
    }, [appointment]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };



    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prev => ({ ...prev, [name]: value }));

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }

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


    const handleTechnicianSelect = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedId = parseInt(e.target.value);
        if (!selectedId) return;

        const selectedTech = technicians.find((tech) => tech.id === selectedId);
        if (!selectedTech) return;

        if (selectedTechnicians.some((t) => t.id === selectedId)) {
            showWarning("Este técnico ya fue seleccionado");
            return;
        }

        setSelectedTechnicians((prev) => [...prev, selectedTech]);
        setTechnicianError(null);
        showInfo(`Técnico ${selectedTech.nombre} agregado`);
    };

    const removeTechnician = (id: number) => {
        const technician = selectedTechnicians.find((t) => t.id === id);
        setSelectedTechnicians((prev) => {
            const next = prev.filter((t) => t.id !== id);
            if (next.length === 0) {
                setTechnicianError("Debe seleccionar al menos un técnico");
            } else {
                setTechnicianError(null);
            }
            return next;
        });

        if (technician) {
            showWarning(`Técnico ${technician.nombre} removido`);
        }
    };

    const handleEvidenciaChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEvidencia(e.target.files[0]);
        }
    };

    const removeEvidencia = () => setEvidencia(null);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, formData[name as keyof AppointmentFormData] as string);
            setErrors(prev => ({ ...prev, [name]: error }));

            if (error) {
                showError(error);
            }
        }
    };

    const handleEstadoChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newEstado = e.target.value as "Pendiente" | "Finalizado" | "Cancelado";
        setEstado(newEstado);

        setFormData((prev) => ({
            ...prev,
            estado: newEstado,
            motivoCancelacion: newEstado === "Cancelado" ? prev.motivoCancelacion : "",
            horaCancelacion: newEstado === "Cancelado" ? new Date() : null,
        }));

        if (newEstado === "Cancelado" && !formData.motivoCancelacion?.trim()) {
            setErrors((prev) => ({
                ...prev,
                motivoCancelacion: "Debe indicar el motivo de la cancelación",
            }));
            showError("Debe indicar el motivo de la cancelación");
        } else if (newEstado !== "Cancelado") {
            setErrors((prev) => ({ ...prev, motivoCancelacion: undefined }));
        }
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e?: FormEvent) => {
        if (e) e.preventDefault();

        const formErrors: AppointmentErrors = validateAppointmentForm(formData);
        const techError = validateTechnicians(selectedTechnicians);

        if (techError) {
            setTechnicianError(techError);
            showError(techError);
        }

        const timeRangeError = validateTimeRange(
            formData.horaInicio || "",
            formData.minutoInicio || "",
            formData.horaFin || "",
            formData.minutoFin || ""
        );

        if (timeRangeError) {
            formErrors.timeRange = timeRangeError;
            showError(timeRangeError);
        }

        if (
            formData.estado === "Cancelado" &&
            !formData.motivoCancelacion?.trim()
        ) {
            formErrors.motivoCancelacion = "Debe indicar el motivo de la cancelación";
            showError("Debe indicar el motivo de la cancelación");
        }

        setErrors(formErrors);
        const isValid =
            !hasValidationErrors(formErrors) && !techError && !timeRangeError;
        if (!isValid) return;

        let resolvedOrden = null;
        if (formData.orden) {
            if (typeof formData.orden === "object" && formData.orden !== null) {
                resolvedOrden = formData.orden;
            } else {
                const orderId = formData.orden as string | number;
                resolvedOrden = orders.find((o) => o.id === orderId) || null;
            }
        }


        const updatedAppointment: AppointmentEvent = {
            ...formData,
            tecnicos: selectedTechnicians,
            evidencia,
            estado,
            horaCancelacion: estado === "Cancelado" ? new Date() : null,
            title: buildTitle(resolvedOrden),

            // Normalizamos siempre fechas y horas
            start:
                formData.start instanceof Date
                    ? formData.start
                    : new Date(formData.start),
            end:
                formData.end instanceof Date ? formData.end : new Date(formData.end),

            horaInicio:
                formData.horaInicio?.padStart(2, "0") ||
                formData.start.getHours().toString().padStart(2, "0"),
            minutoInicio:
                formData.minutoInicio?.padStart(2, "0") ||
                formData.start.getMinutes().toString().padStart(2, "0"),

            horaFin:
                formData.horaFin?.padStart(2, "0") ||
                formData.end.getHours().toString().padStart(2, "0"),
            minutoFin:
                formData.minutoFin?.padStart(2, "0") ||
                formData.end.getMinutes().toString().padStart(2, "0"),

            orden: resolvedOrden,
        };

        onSave(updatedAppointment);
        showSuccess("Cita actualizada exitosamente");
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

// Busqueda 
export const useOrderSearch = ({
    orders,
    selectedOrder,
    onOrderSelect,
    onOrderBlur,
    validateOrder
}: UseOrderSearchProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>(); 

    // Filtrar órdenes
    const filteredOrders = orders.filter(order =>
        `${order.id} - ${order.cliente}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Valor a mostrar en el input
    const displayValue = selectedOrder
        ? `${selectedOrder.id} - ${selectedOrder.cliente}`
        : searchTerm;

    useEffect(() => {
        if (validateOrder && touched) {
            const error = validateOrder(selectedOrder);
            setLocalError(error);
        }
    }, [selectedOrder, touched, validateOrder]);

    // Manejar selección de orden
    const handleSelectOrder = (order: Order | null) => {
        onOrderSelect(order);

        if (order) {
            setSearchTerm(`${order.id} - ${order.cliente}`);
        } else {
            setSearchTerm('');
        }

        setIsOpen(false);
        setHighlightedIndex(-1);

        if (order !== null) {
            setTouched(true);
        }
    };

    // Manejar cambio en el input de búsqueda
    const handleInputChange = (value: string) => {
        setSearchTerm(value);
        setIsOpen(true);
        setHighlightedIndex(0);

        if (value === '') {
            onOrderSelect(null);
            setTouched(true);
        }
    };

    // Manejar teclado
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOrders.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOrders.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredOrders[highlightedIndex]) {
                    handleSelectOrder(filteredOrders[highlightedIndex]);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            case 'Tab':
                setIsOpen(false);
                setHighlightedIndex(-1);
                handleBlur(); 
                break;
        }
    };

    const handleBlur = () => {
        setTouched(true);
        onOrderBlur?.();

        if (validateOrder) {
            const error = validateOrder(selectedOrder);
            setLocalError(error);
        }
    };

    return {
        isOpen,
        searchTerm,
        highlightedIndex,
        touched,
        filteredOrders,
        displayValue,
        localError, 

        setIsOpen,
        setHighlightedIndex,
        handleSelectOrder,
        handleInputChange,
        handleKeyDown,
        handleBlur,
        setTouched,
    };
};

// Click
export const useClickOutside = (
    ref: RefObject<HTMLElement | null>,
    callback: () => void,
    isActive: boolean = true
) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        if (isActive) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback, isActive]);
};