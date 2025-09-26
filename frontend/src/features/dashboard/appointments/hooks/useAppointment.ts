import { useState, useEffect, ChangeEvent, FormEvent, useCallback, KeyboardEvent, RefObject, useRef } from 'react';
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
    UseOrderSearchProps,
    TipoCita,
    SolicitudOrden,
    OrdenServicio
} from '../types/typeAppointment';
import { ordenesServicio, solicitudesOrden, technicians } from '../mocks/mockAppointment';
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

        // Crear el título basado en el tipo de cita y los datos
        let title = "";
        if (appointmentData.tipoCita === "solicitud") {
            const cliente = appointmentData.nombreCliente || "Nuevo cliente";
            const servicio = appointmentData.tipoServicioSolicitud === "mantenimiento"
                ? `Mantenimiento ${appointmentData.tipoMantenimientoSolicitud}`
                : "Instalación";
            title = `[SOLICITUD] ${cliente} - ${servicio}`;
        } else {
            title = `[${appointmentData.tipoCita.toUpperCase()}] ${appointmentData.orden?.cliente || 'Cliente'} - ${appointmentData.orden?.tipoServicio || 'Servicio'}`;
        }

        const newAppointment: Appointment = {
            id: Math.max(...appointments.map(a => a.id), 0) + 1,
            ...appointmentData,
            tecnicos: selectedTechs,
            start: startDate,
            end: endDate,
            title: title
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

// Hook para el formulario de creación actualizado
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
        tipoCita: "solicitud",
        nombreCliente: "",
        direccion: "",
        tipoServicioSolicitud: undefined,
        tipoMantenimientoSolicitud: undefined,
        servicio: "",
        descripcion: ""
    });

    const [selectedTechnicians, setSelectedTechnicians] = useState<Technician[]>([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudOrden | null>(null);
    const [selectedOrdenServicio, setSelectedOrdenServicio] = useState<OrdenServicio | null>(null);
    const [errors, setErrors] = useState<AppointmentErrors>({});
    const [technicianError, setTechnicianError] = useState<string | null>(null);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [comprobantePago, setComprobantePago] = useState<File | null>(null);
    const [resetComboboxTrigger, setResetComboboxTrigger] = useState(0);

    // Resetear formulario cuando se abre el modal
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
                estado: "Pendiente",
                tipoCita: "solicitud",
                nombreCliente: "",
                direccion: "",
                tipoServicioSolicitud: undefined,
                tipoMantenimientoSolicitud: undefined,
                servicio: "",
                descripcion: "",
                comprobantePago: null
            });
            setSelectedTechnicians([]);
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
            setErrors({});
            setTechnicianError(null);
            setTouched({});
            setComprobantePago(null);
            setResetComboboxTrigger(prev => prev + 1);
        }
    }, [isOpen, selectedDateTime]);

    // Efecto para calcular hora final automáticamente
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

    // Efecto para resetear tipoMantenimientoSolicitud cuando cambia tipoServicioSolicitud
    useEffect(() => {
        if (formData.tipoServicioSolicitud !== "mantenimiento") {
            setFormData(prev => ({
                ...prev,
                tipoMantenimientoSolicitud: undefined
            }));
        }
    }, [formData.tipoServicioSolicitud]);

    // Efecto para manejar cambios en el tipo de cita
    useEffect(() => {
        // Limpiar selecciones cuando cambia el tipo de cita
        setSelectedSolicitud(null);
        setSelectedOrdenServicio(null);
        setFormData(prev => ({
            ...prev,
            orden: null,
            nombreCliente: "",
            direccion: "",
            tipoServicioSolicitud: undefined,
            tipoMantenimientoSolicitud: undefined,
            servicio: "",
            descripcion: ""
        }));
    }, [formData.tipoCita]);

    // Efecto para cargar datos de solicitud seleccionada
    useEffect(() => {
        if (selectedSolicitud && formData.tipoCita === "solicitud") {
            setFormData(prev => ({
                ...prev,
                nombreCliente: selectedSolicitud.cliente,
                direccion: selectedSolicitud.direccion,
                tipoServicioSolicitud: selectedSolicitud.tipoServicio,
                tipoMantenimientoSolicitud: selectedSolicitud.tipoMantenimiento,
                servicio: selectedSolicitud.servicio,
                descripcion: selectedSolicitud.descripcion || "",
                orden: {
                    id: selectedSolicitud.id,
                    tipoServicio: selectedSolicitud.tipoServicio,
                    tipoMantenimiento: selectedSolicitud.tipoMantenimiento,
                    monto: selectedSolicitud.monto,
                    cliente: selectedSolicitud.cliente,
                    lugar: selectedSolicitud.direccion
                }
            }));
        }
    }, [selectedSolicitud, formData.tipoCita]);

    // Efecto para cargar datos de orden de servicio seleccionada
    useEffect(() => {
        if (selectedOrdenServicio && (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia")) {
            setFormData(prev => ({
                ...prev,
                nombreCliente: selectedOrdenServicio.cliente,
                direccion: selectedOrdenServicio.direccion,
                tipoServicioSolicitud: selectedOrdenServicio.tipoServicio,
                tipoMantenimientoSolicitud: selectedOrdenServicio.tipoMantenimiento,
                servicio: selectedOrdenServicio.servicio,
                descripcion: selectedOrdenServicio.descripcion || "",
                orden: {
                    id: selectedOrdenServicio.id,
                    tipoServicio: selectedOrdenServicio.tipoServicio,
                    tipoMantenimiento: selectedOrdenServicio.tipoMantenimiento,
                    monto: selectedOrdenServicio.monto,
                    cliente: selectedOrdenServicio.cliente,
                    lugar: selectedOrdenServicio.direccion
                }
            }));
        }
    }, [selectedOrdenServicio, formData.tipoCita]);

    // Agrega esta función para manejar el comprobante de pago
    const handleComprobantePagoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setComprobantePago(e.target.files[0]);
        }
    };

    const removeComprobantePago = () => setComprobantePago(null);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Si es tipo de cita, limpiar selecciones
        if (name === "tipoCita") {
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
        }

        // Si es tipo de servicio y no es mantenimiento, limpiar tipo de mantenimiento
        if (name === "tipoServicioSolicitud" && value !== "mantenimiento") {
            setFormData(prev => ({
                ...prev,
                [name]: value as "mantenimiento" | "instalacion",
                tipoMantenimientoSolicitud: undefined
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
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

    const handleSolicitudSelect = (solicitud: SolicitudOrden | null) => {
        setSelectedSolicitud(solicitud);
        setSelectedOrdenServicio(null);
    };

    const handleOrdenServicioSelect = (orden: OrdenServicio | null) => {
        setSelectedOrdenServicio(orden);
        setSelectedSolicitud(null);
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

    const validateForm = (): boolean => {
        const newErrors: AppointmentErrors = {};

        // Validaciones básicas de fecha y hora
        if (!formData.horaInicio) newErrors.horaInicio = "Hora de inicio es requerida";
        if (!formData.minutoInicio) newErrors.minutoInicio = "Minuto de inicio es requerido";
        if (!formData.dia) newErrors.dia = "Día es requerido";
        if (!formData.mes) newErrors.mes = "Mes es requerido";
        if (!formData.año) newErrors.año = "Año es requerido";
        if (!formData.tipoCita) newErrors.tipoCita = "Tipo de cita es requerido";

        // Validación de técnicos
        const techError = selectedTechnicians.length === 0 ? 'Debe seleccionar al menos un técnico' : null;
        setTechnicianError(techError);

        // Validaciones específicas por tipo de cita
        if (formData.tipoCita === "solicitud") {
            if (!selectedSolicitud && !formData.nombreCliente?.trim()) {
                newErrors.nombreCliente = "Seleccione una solicitud o ingrese el nombre del cliente";
            }
            if (!selectedSolicitud && !formData.direccion?.trim()) {
                newErrors.direccion = "La dirección es requerida";
            }
            if (!selectedSolicitud && !formData.tipoServicioSolicitud) {
                newErrors.tipoServicioSolicitud = "El tipo de servicio es requerido";
            }
            if (!selectedSolicitud && formData.tipoServicioSolicitud === "mantenimiento" && !formData.tipoMantenimientoSolicitud) {
                newErrors.tipoMantenimientoSolicitud = "El tipo de mantenimiento es requerido";
            }
        } else if (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia") {
            if (!selectedOrdenServicio) {
                newErrors.orden = "Debe seleccionar una orden de servicio";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && !techError;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar domingo
        if (formData.dia && formData.mes && formData.año) {
            const fecha = new Date(
                parseInt(formData.año),
                parseInt(formData.mes) - 1,
                parseInt(formData.dia)
            );

            if (fecha.getDay() === 0) {
                setErrors(prev => ({ ...prev, dia: "No se permiten citas en domingo" }));
                showError("No se permiten citas en domingo");
                return;
            }
        }

        if (!validateForm()) {
            showError('Por favor, complete todos los campos obligatorios');
            return;
        }

        // Crear orden automática si es solicitud sin selección
        let ordenParaGuardar = formData.orden;

        if (formData.tipoCita === "solicitud" && !selectedSolicitud) {
            ordenParaGuardar = {
                id: `SOL-${Date.now()}`,
                tipoServicio: formData.tipoServicioSolicitud!,
                tipoMantenimiento: formData.tipoMantenimientoSolicitud,
                monto: 100000,
                cliente: formData.nombreCliente!,
                lugar: formData.direccion!
            };
        } else if ((formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia") && selectedOrdenServicio) {
            ordenParaGuardar = {
                id: selectedOrdenServicio.id,
                tipoServicio: selectedOrdenServicio.tipoServicio,
                tipoMantenimiento: selectedOrdenServicio.tipoMantenimiento,
                monto: selectedOrdenServicio.monto,
                cliente: selectedOrdenServicio.cliente,
                lugar: selectedOrdenServicio.direccion
            };
        }

        // Crear título
        let title = "";
        if (formData.tipoCita === "solicitud") {
            const cliente = formData.nombreCliente || "Nuevo cliente";
            const servicio = formData.tipoServicioSolicitud === "mantenimiento"
                ? `Mantenimiento ${formData.tipoMantenimientoSolicitud}`
                : "Instalación";
            title = `[SOLICITUD] ${cliente} - ${servicio}`;
        } else {
            title = `[${formData.tipoCita.toUpperCase()}] ${ordenParaGuardar?.cliente || 'Cliente'} - ${ordenParaGuardar?.tipoServicio || 'Servicio'}`;
        }

        const startDate = new Date(
            parseInt(formData.año),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaInicio),
            parseInt(formData.minutoInicio)
        );

        const endDate = new Date(
            parseInt(formData.año),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaFin),
            parseInt(formData.minutoFin)
        );

        onSave({
            id: Date.now(),
            ...formData,
            horaInicio: formData.horaInicio.padStart(2, '0'),
            minutoInicio: formData.minutoInicio.padStart(2, '0'),
            horaFin: formData.horaFin.padStart(2, '0'),
            minutoFin: formData.minutoFin.padStart(2, '0'),
            orden: ordenParaGuardar,
            tecnicos: selectedTechnicians,
            start: startDate,
            end: endDate,
            title: title,
            comprobantePago: comprobantePago,
        });

        showSuccess('Cita creada exitosamente');
        onClose();
    };

    return {
        formData,
        selectedTechnicians,
        selectedSolicitud,
        selectedOrdenServicio,
        errors,
        comprobantePago,
        technicianError,
        touched,
        resetComboboxTrigger,
        removeComprobantePago,
        handleInputChange,
        handleComprobantePagoChange,
        handleTimeChange,
        handleTechnicianSelect,
        removeTechnician,
        handleSolicitudSelect,
        handleOrdenServicioSelect,
        handleBlur,
        handleSubmit
    };
};

// Hook para el formulario de editar actualizado
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
        tipoCita: "solicitud",
        nombreCliente: "",
        direccion: "",
        tipoServicioSolicitud: undefined,
        tipoMantenimientoSolicitud: undefined,
        servicio: "",
        descripcion: ""
    });

    const [selectedTechnicians, setSelectedTechnicians] = useState<Technician[]>([]);
    const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudOrden | null>(null);
    const [selectedOrdenServicio, setSelectedOrdenServicio] = useState<OrdenServicio | null>(null);
    const [comprobantePago, setComprobantePago] = useState<File | string | null>(null);
    const [errors, setErrors] = useState<AppointmentErrors>({});
    const [technicianError, setTechnicianError] = useState<string | null>(null);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [evidencia, setEvidencia] = useState<File | string | null>(null);
    const [estado, setEstado] = useState<"Pendiente" | "Finalizado" | "Cancelado">("Pendiente");

    // Efecto para inicializar los datos cuando llega el appointment
    useEffect(() => {
        if (appointment) {
            let initialSolicitud: SolicitudOrden | null = null;
            let initialOrdenServicio: OrdenServicio | null = null;

            if (appointment.orden) {
                const orderId = typeof appointment.orden === 'object'
                    ? appointment.orden.id
                    : appointment.orden;

                if (appointment.tipoCita === "solicitud") {
                    initialSolicitud = solicitudesOrden.find(s => s.id === orderId) || null;
                }

                if (appointment.tipoCita === "ejecucion" || appointment.tipoCita === "garantia") {
                    initialOrdenServicio = ordenesServicio.find(o => o.id === orderId) || null;
                }
            }

            setFormData(prev => ({
                ...prev,
                ...appointment,
                orden: initialSolicitud
                    ? {
                        id: initialSolicitud.id,
                        tipoServicio: initialSolicitud.tipoServicio,
                        tipoMantenimiento: initialSolicitud.tipoMantenimiento,
                        monto: initialSolicitud.monto,
                        cliente: initialSolicitud.cliente,
                        lugar: initialSolicitud.direccion
                    }
                    : initialOrdenServicio
                        ? {
                            id: initialOrdenServicio.id,
                            tipoServicio: initialOrdenServicio.tipoServicio,
                            tipoMantenimiento: initialOrdenServicio.tipoMantenimiento,
                            monto: initialOrdenServicio.monto,
                            cliente: initialOrdenServicio.cliente,
                            lugar: initialOrdenServicio.direccion
                        }
                        : null,
            }));

            setSelectedSolicitud(initialSolicitud);
            setSelectedOrdenServicio(initialOrdenServicio);
            setSelectedTechnicians(appointment.tecnicos || []);
            setEvidencia(appointment.evidencia || null);
            setComprobantePago(appointment.comprobantePago || null);
            setEstado(appointment.estado || "Pendiente");
            setErrors({});
            setTechnicianError(null);
            setTouched({});
        }
    }, [appointment, solicitudesOrden, ordenesServicio]);


    // Efecto para calcular hora final automáticamente
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

    // 4 Efecto para resetear tipoMantenimientoSolicitud cuando cambia tipoServicioSolicitud
    useEffect(() => {
        if (formData.tipoServicioSolicitud !== "mantenimiento") {
            setFormData(prev => ({
                ...prev,
                tipoMantenimientoSolicitud: undefined
            }));
        }
    }, [formData.tipoServicioSolicitud]);

    const prevTipoCita = useRef(formData.tipoCita);

    // 5
    useEffect(() => {
        if (prevTipoCita.current !== formData.tipoCita) {
            // solo limpiar si el usuario realmente cambió el tipo de cita
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
            setFormData(prev => ({
                ...prev,
                orden: null,
                nombreCliente: "",
                direccion: "",
                tipoServicioSolicitud: undefined,
                tipoMantenimientoSolicitud: undefined,
                servicio: "",
                descripcion: ""
            }));
        }
        prevTipoCita.current = formData.tipoCita;
    }, [formData.tipoCita]);

    // 6 Efecto para cargar datos de solicitud seleccionada
    useEffect(() => {
        if (selectedSolicitud && formData.tipoCita === "solicitud") {
            setFormData(prev => ({
                ...prev,
                nombreCliente: selectedSolicitud.cliente,
                direccion: selectedSolicitud.direccion,
                tipoServicioSolicitud: selectedSolicitud.tipoServicio,
                tipoMantenimientoSolicitud: selectedSolicitud.tipoMantenimiento,
                servicio: selectedSolicitud.servicio,
                descripcion: selectedSolicitud.descripcion || "",
                orden: {
                    id: selectedSolicitud.id,
                    tipoServicio: selectedSolicitud.tipoServicio,
                    tipoMantenimiento: selectedSolicitud.tipoMantenimiento,
                    monto: selectedSolicitud.monto,
                    cliente: selectedSolicitud.cliente,
                    lugar: selectedSolicitud.direccion
                }
            }));
        }
    }, [selectedSolicitud, formData.tipoCita]);

    // 7 Efecto para cargar datos de orden de servicio seleccionada
    useEffect(() => {
        if (selectedOrdenServicio && (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia")) {
            setFormData(prev => ({
                ...prev,
                nombreCliente: selectedOrdenServicio.cliente,
                direccion: selectedOrdenServicio.direccion,
                tipoServicioSolicitud: selectedOrdenServicio.tipoServicio,
                tipoMantenimientoSolicitud: selectedOrdenServicio.tipoMantenimiento,
                servicio: selectedOrdenServicio.servicio,
                descripcion: selectedOrdenServicio.descripcion || "",
                orden: {
                    id: selectedOrdenServicio.id,
                    tipoServicio: selectedOrdenServicio.tipoServicio,
                    tipoMantenimiento: selectedOrdenServicio.tipoMantenimiento,
                    monto: selectedOrdenServicio.monto,
                    cliente: selectedOrdenServicio.cliente,
                    lugar: selectedOrdenServicio.direccion
                }
            }));
        }
    }, [selectedOrdenServicio, formData.tipoCita]);

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Si es tipo de cita, limpiar selecciones
        if (name === "tipoCita") {
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
        }

        // Si es tipo de servicio y no es mantenimiento, limpiar tipo de mantenimiento
        if (name === "tipoServicioSolicitud" && value !== "mantenimiento") {
            setFormData(prev => ({
                ...prev,
                [name]: value as "mantenimiento" | "instalacion",
                tipoMantenimientoSolicitud: undefined
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        if (name !== 'orden') {
            setTouched(prev => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
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

    const handleSolicitudSelect = (solicitud: SolicitudOrden | null) => {
        setSelectedSolicitud(solicitud);
        setSelectedOrdenServicio(null);
    };

    const handleOrdenServicioSelect = (orden: OrdenServicio | null) => {
        setSelectedOrdenServicio(orden);
        setSelectedSolicitud(null);
    };

    const handleEvidenciaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEvidencia(e.target.files[0]);
        }
    };

    const removeEvidencia = () => setEvidencia(null);

    const handleComprobantePagoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setComprobantePago(e.target.files[0]);
        }
    };

    const removeComprobantePago = () => setComprobantePago(null);

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(name, formData[name as keyof AppointmentFormData] as string);
        setErrors(prev => ({ ...prev, [name]: error }));

        if (error) {
            showError(error);
        }
    };

    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

    const validateForm = (): boolean => {
        const newErrors: AppointmentErrors = {};

        // Validaciones básicas de fecha y hora
        if (!formData.horaInicio) newErrors.horaInicio = "Hora de inicio es requerida";
        if (!formData.minutoInicio) newErrors.minutoInicio = "Minuto de inicio es requerido";
        if (!formData.dia) newErrors.dia = "Día es requerido";
        if (!formData.mes) newErrors.mes = "Mes es requerido";
        if (!formData.año) newErrors.año = "Año es requerido";
        if (!formData.tipoCita) newErrors.tipoCita = "Tipo de cita es requerido";

        // Validación de técnicos
        const techError = selectedTechnicians.length === 0 ? 'Debe seleccionar al menos un técnico' : null;
        setTechnicianError(techError);

        // Validaciones específicas por tipo de cita
        if (formData.tipoCita === "solicitud") {
            if (!selectedSolicitud && !formData.nombreCliente?.trim()) {
                newErrors.nombreCliente = "Seleccione una solicitud o ingrese el nombre del cliente";
            }
            if (!selectedSolicitud && !formData.direccion?.trim()) {
                newErrors.direccion = "La dirección es requerida";
            }
            if (!selectedSolicitud && !formData.tipoServicioSolicitud) {
                newErrors.tipoServicioSolicitud = "El tipo de servicio es requerido";
            }
            if (!selectedSolicitud && formData.tipoServicioSolicitud === "mantenimiento" && !formData.tipoMantenimientoSolicitud) {
                newErrors.tipoMantenimientoSolicitud = "El tipo de mantenimiento es requerido";
            }
        } else if (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia") {
            if (!selectedOrdenServicio) {
                newErrors.orden = "Debe seleccionar una orden de servicio";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && !techError;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Validar domingo
        if (formData.dia && formData.mes && formData.año) {
            const fecha = new Date(
                parseInt(formData.año),
                parseInt(formData.mes) - 1,
                parseInt(formData.dia)
            );

            if (fecha.getDay() === 0) {
                setErrors(prev => ({ ...prev, dia: "No se permiten citas en domingo" }));
                showError("No se permiten citas en domingo");
                return;
            }
        }

        if (!validateForm()) {
            showError('Por favor, complete todos los campos obligatorios');
            return;
        }

        // Crear orden automática si es solicitud sin selección
        let ordenParaGuardar = formData.orden;

        if (formData.tipoCita === "solicitud" && !selectedSolicitud) {
            ordenParaGuardar = {
                id: `SOL-${Date.now()}`,
                tipoServicio: formData.tipoServicioSolicitud!,
                tipoMantenimiento: formData.tipoMantenimientoSolicitud,
                monto: 100000,
                cliente: formData.nombreCliente!,
                lugar: formData.direccion!
            };
        } else if ((formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia") && selectedOrdenServicio) {
            ordenParaGuardar = {
                id: selectedOrdenServicio.id,
                tipoServicio: selectedOrdenServicio.tipoServicio,
                tipoMantenimiento: selectedOrdenServicio.tipoMantenimiento,
                monto: selectedOrdenServicio.monto,
                cliente: selectedOrdenServicio.cliente,
                lugar: selectedOrdenServicio.direccion
            };
        }

        // Crear título
        let title = "";
        if (formData.tipoCita === "solicitud") {
            const cliente = formData.nombreCliente || "Nuevo cliente";
            const servicio = formData.tipoServicioSolicitud === "mantenimiento"
                ? `Mantenimiento ${formData.tipoMantenimientoSolicitud}`
                : "Instalación";
            title = `[SOLICITUD] ${cliente} - ${servicio}`;
        } else {
            title = `[${formData.tipoCita.toUpperCase()}] ${ordenParaGuardar?.cliente || 'Cliente'} - ${ordenParaGuardar?.tipoServicio || 'Servicio'}`;
        }

        const startDate = new Date(
            parseInt(formData.año),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaInicio),
            parseInt(formData.minutoInicio)
        );

        const endDate = new Date(
            parseInt(formData.año),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaFin),
            parseInt(formData.minutoFin)
        );

        const updatedAppointment: AppointmentEvent = {
            ...formData,
            id: appointment?.id || Date.now(),
            horaInicio: formData.horaInicio.padStart(2, '0'),
            minutoInicio: formData.minutoInicio.padStart(2, '0'),
            horaFin: formData.horaFin.padStart(2, '0'),
            minutoFin: formData.minutoFin.padStart(2, '0'),
            orden: ordenParaGuardar,
            tecnicos: selectedTechnicians,
            evidencia: evidencia instanceof File ? evidencia : appointment?.evidencia || evidencia,
            comprobantePago: comprobantePago instanceof File ? comprobantePago : appointment?.comprobantePago || comprobantePago,
            estado: estado,
            horaCancelacion: estado === "Cancelado" ? new Date() : formData.horaCancelacion,
            start: startDate,
            end: endDate,
            title: title
        };

        onSave(updatedAppointment);
        showSuccess('Cita actualizada exitosamente');
        onClose();
    };

    return {
        formData,
        selectedTechnicians,
        selectedSolicitud,
        selectedOrdenServicio,
        evidencia,
        comprobantePago,
        errors,
        technicianError,
        touched,
        estado,
        handleInputChange,
        handleTimeChange,
        handleTechnicianSelect,
        removeTechnician,
        handleComprobantePagoChange,
        handleSolicitudSelect,
        handleOrdenServicioSelect,
        handleEvidenciaChange,
        handleBlur,
        handleEstadoChange,
        handleSubmit,
        removeEvidencia,
        removeComprobantePago
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