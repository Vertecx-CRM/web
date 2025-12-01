import { useState, useEffect, KeyboardEvent, RefObject, useRef, useMemo, useCallback } from "react";
import {
    Appointment,
    AppointmentFormData,
    SlotDateTime,
    Technician,
    CreateAppointmentModalProps,
    AppointmentErrors,
    AppointmentEvent,
    UseEditAppointmentFormProps,
    Order,
    UseOrderSearchProps,
    SolicitudOrden,
    OrdenServicio,
} from "../types/typeAppointment";
import {
    ordenesServicio,
    solicitudesOrden,
    technicians,
} from "../mocks/mockAppointment";
import {
    showSuccess,
    showError,
    showInfo,
    showWarning,
} from "@/shared/utils/notifications";
import {
    validateAppointmentField,
    validateTimeRange,
} from "../validations/validationAppointment";
import { useServiceRequests, useCreateServiceRequest, useUpdateServiceRequest } from "../../requests/hooks/useServiceRequests";
import type { ServiceRequestDTO } from "../../requests/services/servicerequests.service";
import type { CreateRequestPayload } from "../../requests/components/CreateRequestModal";
import type { EditRequestPayload } from "../../requests/components/EditRequestModal";
import { buildScheduledAt } from "../../requests/utils/schedule";
import { useAuth } from "@/features/auth/authcontext";
import { useOrderServices, type OrderServiceDTO } from "../../OrdersServices/hooks/useOrderServices";

const normalizeRoleName = (name?: string) => (name || "").toLowerCase().trim();

const toNumberId = (value: any): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
};

const mapTechniciansFromRequest = (req: ServiceRequestDTO): Technician[] => {
    const normalizeTech = (raw: any): Technician | null => {
        if (!raw) return null;
        const tech = raw?.technician ?? raw;
        const id = toNumberId(tech?.technicianid ?? tech?.technicianId ?? tech?.id);
        if (!id) return null;
        const first = tech?.users?.name ?? tech?.name ?? "";
        const last = tech?.users?.lastname ?? tech?.lastname ?? "";
        const nombre = [first, last].filter(Boolean).join(" ").trim() || `Tecnico ${id}`;
        const titulo = tech?.title ?? tech?.users?.roles?.name ?? "Tecnico";
        return { id, nombre, titulo };
    };

    const sources = [
        (req as any).technicians,
        (req as any).serviceRequestTechnicians,
        (req as any).requestTechnicians,
        (req as any).assignedTechnicians,
    ];

    const firstArray = sources.find((s) => Array.isArray(s)) as any[] | undefined;
    const mapped = (firstArray ?? [])
        .map(normalizeTech)
        .filter((t): t is Technician => Boolean(t));

    if (mapped.length > 0) return mapped;

    const fallback = normalizeTech((req as any).technician);
    if (fallback) return [fallback];

    const singleId = toNumberId((req as any).technicianId ?? (req as any).technicianid);
    if (singleId) {
        return [{ id: singleId, nombre: `Tecnico ${singleId}`, titulo: "Tecnico" }];
    }

    return [];
};

export const useAppointments = () => {
    const { user, profile } = useAuth();
    const { data: requestData = [], isLoading: isLoadingRequests } = useServiceRequests();
    const { data: orderData = [], updateOrderService, isLoading: isLoadingOrders } = useOrderServices();
    const createRequest = useCreateServiceRequest();
    const updateRequest = useUpdateServiceRequest();
    const roleName = normalizeRoleName(profile?.roles?.name || user?.rolename);
    const isAdmin = roleName === "admin" || Number(user?.roleid) === 1 || Number((profile as any)?.roleid ?? (profile as any)?.roles?.roleid) === 1;
    const technicianId = toNumberId((profile as any)?.technicians?.[0]?.technicianid ?? (user as any)?.technicianid ?? (user as any)?.technicianId);
    const customerId = toNumberId((profile as any)?.customers?.[0]?.customerid ?? (user as any)?.customerid ?? (user as any)?.customerId ?? user?.userid);

    const normalizeServiceType = useCallback((value?: string): "mantenimiento" | "instalacion" => {
        const lower = String(value || "").toLowerCase();
        return lower.includes("instal") ? "instalacion" : "mantenimiento";
    }, []);

    const mapEstado = useCallback((stateName?: string) => {
        const lower = String(stateName || "").toLowerCase();
        if (lower.includes("cancel")) return "Cancelado";
        if (lower.includes("final")) return "Finalizado";
        if (lower.includes("proceso")) return "En-proceso";
        if (lower.includes("cerr")) return "Cerrado";
        return "Pendiente";
    }, []);

    const mapTechniciansFromOrder = useCallback((order: OrderServiceDTO): Technician[] => {
        const technicians = Array.isArray(order.technicians) ? order.technicians : [];

        return technicians
            .map((tech) => {
                if (!tech?.technicianid) return null;
                const first = tech.users?.name ?? "";
                const last = tech.users?.lastname ?? "";
                const nombre = [first, last].filter(Boolean).join(" ").trim() || `Tecnico ${tech.technicianid}`;
                return {
                    id: tech.technicianid,
                    nombre,
                    titulo: "Tecnico",
                };
            })
            .filter((t): t is Technician => Boolean(t));
    }, []);

    const orderToEvent = useCallback((order: OrderServiceDTO): AppointmentEvent => {
        const start = buildOrderDateTime(order.fechainicio, order.horainicio);
        const end = buildOrderDateTime(order.fechafin, order.horafin);

        const clientNameParts = [
            order.client?.users?.name ?? "",
            order.client?.users?.lastname ?? "",
        ].filter(Boolean);

        const clientName = clientNameParts.length
            ? clientNameParts.join(" ")
            : order.client
                ? `Cliente ${order.client.customerid ?? order.client.userid ?? order.ordersservicesid}`
                : "Cliente";

        const materiales = (order.products ?? []).map((item) => ({
            id: item.product?.productid ?? item.ordersservicesproductsid,
            nombre: item.product?.productname ?? "Material",
            cantidad: item.cantidad,
        }));

        const assignedTechnicians = mapTechniciansFromOrder(order);
        const estado = mapEstado(order.state?.name ?? "");
        const tipoServicio = "mantenimiento";
        const servicioLabel = order.description?.trim() || "Orden de servicio";

        return {
            id: order.ordersservicesid,
            title: `[ORDEN] ${clientName} - ${servicioLabel}`,
            start,
            end,
            tecnicos: assignedTechnicians,
            horaInicio: start.getHours().toString().padStart(2, "0"),
            minutoInicio: start.getMinutes().toString().padStart(2, "0"),
            horaFin: end.getHours().toString().padStart(2, "0"),
            minutoFin: end.getMinutes().toString().padStart(2, "0"),
            dia: start.getDate().toString(),
            mes: (start.getMonth() + 1).toString(),
            ano: start.getFullYear().toString(),
            observaciones: order.description ?? "",
            estado,
            tipoCita: "ejecucion",
            nombreCliente: clientName,
            direccion: order.client?.customercity ?? "",
            tipoServicioSolicitud: tipoServicio,
            servicio: servicioLabel,
            descripcion: order.description ?? "",
            materiales,
            clientId: order.client?.customerid,
            stateId: order.state?.stateid,
            scheduledAt: start.toISOString(),
            orden: {
                id: String(order.ordersservicesid),
                tipoServicio,
                tipoMantenimiento: undefined,
                monto: order.total ?? 0,
                cliente: clientName,
                lugar: order.client?.customercity ?? "",
                materiales,
            },
            serviceOrderId: order.ordersservicesid,
        };
    }, [mapEstado, mapTechniciansFromOrder]);

    const slotToDate = (slot?: SlotDateTime | null) => {
        if (!slot) return null;
        const year = parseInt(((slot as any).ano ?? (slot as any)["ano"] ?? "0") as string);
        const month = parseInt(slot.mes || "0");
        const day = parseInt(slot.dia || "0");
        const hour = parseInt(slot.horaInicio || "0");
        const minute = parseInt(slot.minutoInicio || "0");
        if ([year, month, day].some((n) => Number.isNaN(n) || n === 0)) return null;
        return new Date(year, month - 1, day, hour, minute, 0, 0);
    };

    const getDateParts = (date: Date) => {
    const pad = (v: number) => String(v).padStart(2, "0");
    return {
        date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
        time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    };
};

const pad2 = (value: number) => String(value).padStart(2, "0");

const buildOrderDateTime = (dateValue?: string | Date | null, timeValue?: string | null) => {
    const base = dateValue ? new Date(dateValue) : new Date();
    const [hours, minutes, seconds] = (timeValue ?? "")
        .split(":")
        .map((part) => Number(part));

    if (Number.isFinite(hours)) {
        const normalizedMinutes = Number.isFinite(minutes) ? minutes : 0;
        const normalizedSeconds = Number.isFinite(seconds) ? seconds : 0;
        base.setHours(hours, normalizedMinutes, normalizedSeconds, 0);
    }

    return base;
};

const formatOrderDate = (date: Date) => date.toISOString().split("T")[0];
const formatOrderTime = (date: Date) => `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;

    const requestToEvent = useCallback((req: ServiceRequestDTO): AppointmentEvent => {
        const start = req.scheduledAt ? new Date(req.scheduledAt) : req.createdAt ? new Date(req.createdAt) : new Date();
        const end = new Date(start.getTime() + 60 * 60 * 1000);
        const serviceName = req.service?.name ?? req.serviceType ?? "Servicio";
        const clientName =
            [req.customer?.users?.name ?? req.customer?.name ?? "", req.customer?.users?.lastname ?? req.customer?.lastname ?? ""]
                .filter(Boolean)
                .join(" ") || "Cliente";
        const tipoServicio = normalizeServiceType(req.serviceType);
        const clientId = toNumberId(req.clientId ?? (req.customer as any)?.customerid ?? (req.customer as any)?.id);
        const tecnicosAsignados = mapTechniciansFromRequest(req);

        return {
            id: Number(req.serviceRequestId),
            requestId: Number(req.serviceRequestId),
            serviceId: req.serviceId,
            clientId,
            stateId: req.stateId,
            scheduledAt: req.scheduledAt ?? null,
            start,
            end,
            title: `Solicitud #${req.serviceRequestId} - ${clientName}`,
            tecnicos: tecnicosAsignados,
            horaInicio: start.getHours().toString().padStart(2, "0"),
            minutoInicio: start.getMinutes().toString().padStart(2, "0"),
            horaFin: end.getHours().toString().padStart(2, "0"),
            minutoFin: end.getMinutes().toString().padStart(2, "0"),
            dia: start.getDate().toString(),
            mes: (start.getMonth() + 1).toString(),
            ano: start.getFullYear().toString(),
            observaciones: req.description ?? "",
            estado: mapEstado(req.state?.name ?? ""),
            tipoCita: "solicitud",
            nombreCliente: clientName,
            direccion: req.customer?.customercity ?? "",
            tipoServicioSolicitud: tipoServicio,
            servicio: serviceName,
            descripcion: req.description ?? "",
            orden: {
                id: String(req.serviceRequestId),
                tipoServicio: tipoServicio,
                tipoMantenimiento: undefined,
                monto: req.service?.price ?? 0,
                cliente: clientName,
                lugar: req.customer?.customercity ?? "",
            },
        };
    }, [mapEstado, normalizeServiceType]);

    const mappedEvents = useMemo(() => {
        const list = Array.isArray(requestData) ? requestData : [];
        return list.map(requestToEvent);
    }, [requestData, requestToEvent]);

    const orderEvents = useMemo(() => {
        const list = Array.isArray(orderData) ? orderData : [];
        return list.map(orderToEvent);
    }, [orderData, orderToEvent]);

    const events = useMemo(() => {
        const combined = [...mappedEvents, ...orderEvents];

        if (isAdmin) return combined;

        if (roleName === "cliente") {
            if (!customerId) return [];
            return combined.filter((ev) => toNumberId(ev.clientId ?? (ev as any)?.clienteId) === customerId);
        }

        if (roleName === "tecnico") {
            if (!technicianId) return [];
            return combined.filter((ev) => {
                const ids = (ev.tecnicos || []).map((t) => t.id).filter((id) => Number.isFinite(id));
                if (ids.includes(technicianId)) return true;
                const fallbackTechId = toNumberId((ev as any)?.technicianId ?? (ev as any)?.technicianid);
                return fallbackTechId === technicianId;
            });
        }

        return combined;
    }, [mappedEvents, orderEvents, isAdmin, roleName, customerId, technicianId]);

    const handleCreateAppointment = async (
        payload: CreateRequestPayload,
        slot?: SlotDateTime | null
    ) => {
        const slotDate = slotToDate(slot);
        const fallbackDate = slotDate ?? new Date();
        const parts = getDateParts(fallbackDate);

        const scheduledAt = buildScheduledAt(
            payload.programada ?? parts.date,
            payload.horaProgramada ?? parts.time,
            fallbackDate
        );

        await createRequest.mutateAsync({
            scheduledAt: scheduledAt ?? undefined,
            serviceType: payload.tipos?.[0] ? payload.tipos[0].toUpperCase() : "MANTENIMIENTO",
            description: payload.descripcion?.trim() ?? "",
            stateId: 1,
            serviceId: parseInt(payload.servicio),
            clientId: parseInt(payload.cliente),
        });
        showSuccess("Solicitud creada y agendada");
    };

    const handleUpdateRequest = async (
        id: number,
        payload: EditRequestPayload,
        currentAppointment?: AppointmentEvent | null
    ) => {
        const fallbackDate = currentAppointment?.start ? new Date(currentAppointment.start) : new Date();
        const parts = getDateParts(fallbackDate);
        const scheduledAt = buildScheduledAt(
            payload.programada ?? parts.date,
            payload.horaProgramada ?? parts.time,
            fallbackDate
        );

        await updateRequest.mutateAsync({
            id,
            payload: {
                scheduledAt: scheduledAt ?? undefined,
                serviceType: payload.tipos?.[0] ? payload.tipos[0].toUpperCase() : undefined,
                description: payload.descripcion?.trim(),
                stateId: payload.estado ? parseInt(payload.estado) : undefined,
                serviceId: payload.servicio ? parseInt(payload.servicio) : undefined,
                clientId: payload.cliente ? parseInt(payload.cliente) : undefined,
            }
        });
        showSuccess("Solicitud actualizada");
    };

    const handleUpdateAppointment = async (updated: AppointmentEvent) => {
        const startDate = updated.start instanceof Date ? updated.start : new Date(updated.start);
        const endDate = updated.end instanceof Date ? updated.end : new Date(updated.end);

        if (updated.serviceOrderId) {
            await updateOrderService.mutateAsync({
                id: updated.serviceOrderId,
                payload: {
                    fechainicio: formatOrderDate(startDate),
                    fechafin: formatOrderDate(endDate),
                    horainicio: formatOrderTime(startDate),
                    horafin: formatOrderTime(endDate),
                },
            });
            showSuccess("Orden actualizada");
            return;
        }

        await updateRequest.mutateAsync({
            id: Number(updated.requestId ?? updated.id),
            payload: { scheduledAt: startDate.toISOString() },
        });
    };

    const handleReprogramAppointment = async (
        appointment: AppointmentEvent,
        newDate: { start: Date; end: Date }
    ) => {
        if (appointment.serviceOrderId) {
            await updateOrderService.mutateAsync({
                id: appointment.serviceOrderId,
                payload: {
                    fechainicio: formatOrderDate(newDate.start),
                    fechafin: formatOrderDate(newDate.end),
                    horainicio: formatOrderTime(newDate.start),
                    horafin: formatOrderTime(newDate.end),
                },
            });
            showSuccess("Orden reprogramada");
            return;
        }

        await updateRequest.mutateAsync({
            id: Number(appointment.requestId ?? appointment.id),
            payload: { scheduledAt: newDate.start.toISOString() },
        });
        showSuccess("Solicitud reprogramada");
    };

    const handleCancelAppointment = async (appointment: AppointmentEvent, _reason?: string) => {
        if (appointment.serviceOrderId) {
            showWarning("La cancelación de órdenes se realiza desde el módulo de órdenes.");
            return;
        }

        await updateRequest.mutateAsync({
            id: Number(appointment.requestId ?? appointment.id),
            payload: { stateId: 4 }
        });
        showInfo("Solicitud cancelada");
    };

    const isLoading = isLoadingRequests || isLoadingOrders;

    return {
        events,
        isLoading,
        isCreateModalOpen: false,
        openCreateModal: () => { },
        selectedDateTime: { horaInicio: "", minutoInicio: "", horaFin: "", minutoFin: "", dia: "", mes: "", ano: "" },
        handleCreateAppointment,
        closeModals: () => { },
        handleReprogramAppointment,
        handleCancelAppointment,
        handleUpdateAppointment,
        handleUpdateRequest
    };
};
// Hook para el formulario de creacin actualizado
export const useCreateAppointmentForm = ({
    isOpen,
    onClose,
    onSave,
    selectedDateTime,
}: CreateAppointmentModalProps) => {
    const [formData, setFormData] = useState<AppointmentFormData>({
        horaInicio: selectedDateTime.horaInicio || "",
        minutoInicio: selectedDateTime.minutoInicio || "",
        horaFin: selectedDateTime.horaFin || "",
        minutoFin: selectedDateTime.minutoFin || "",
        dia: selectedDateTime.dia || "",
        mes: selectedDateTime.mes || "",
        ano: selectedDateTime.ano || "",
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
    });

    const [selectedTechnicians, setSelectedTechnicians] = useState<Technician[]>(
        []
    );

    const [selectedSolicitud, setSelectedSolicitud] =
        useState<SolicitudOrden | null>(null);
    const [selectedOrdenServicio, setSelectedOrdenServicio] =
        useState<OrdenServicio | null>(null);
    const [errors, setErrors] = useState<AppointmentErrors>({});
    const [technicianError, setTechnicianError] = useState<string | null>(null);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [comprobantePago, setComprobantePago] = useState<File | null>(null);
    const [resetComboboxTrigger, setResetComboboxTrigger] = useState(0);

    //EFECT 1 Resetear formulario cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            setFormData({
                horaInicio: selectedDateTime.horaInicio || "",
                minutoInicio: selectedDateTime.minutoInicio || "",
                horaFin: selectedDateTime.horaFin || "",
                minutoFin: selectedDateTime.minutoFin || "",
                dia: selectedDateTime.dia || "",
                mes: selectedDateTime.mes || "",
                ano: selectedDateTime.ano || "",
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
                comprobantePago: null,
            });
            setSelectedTechnicians([]);
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
            setErrors({});
            setTechnicianError(null);
            setTouched({});
            setComprobantePago(null);
            setResetComboboxTrigger((prev) => prev + 1);
        }
    }, [isOpen, selectedDateTime]);

    //EFECT 2 Efecto para calcular hora final automticamente
    useEffect(() => {
        if (
            (!formData.horaFin || !formData.minutoFin) &&
            formData.horaInicio &&
            formData.minutoInicio
        ) {
            const { horaFin, minutoFin } = calculateEndTime(
                formData.horaInicio,
                formData.minutoInicio
            );

            setFormData((prev) => ({
                ...prev,
                horaFin,
                minutoFin,
            }));
        }
    }, [formData.horaInicio, formData.minutoInicio]);

    //EFECT 3 Efecto para resetear tipoMantenimientoSolicitud cuando cambia tipoServicioSolicitud
    useEffect(() => {
        if (formData.tipoServicioSolicitud !== "mantenimiento") {
            setFormData((prev) => ({
                ...prev,
                tipoMantenimientoSolicitud: undefined,
            }));
        }
    }, [formData.tipoServicioSolicitud]);

    //EFECT 4 Efecto para manejar cambios en el tipo de cita
    useEffect(() => {
        // Limpiar selecciones cuando cambia el tipo de cita
        setSelectedSolicitud(null);
        setSelectedOrdenServicio(null);
        setFormData((prev) => ({
            ...prev,
            orden: null,
            nombreCliente: "",
            direccion: "",
            tipoServicioSolicitud: undefined,
            tipoMantenimientoSolicitud: undefined,
            servicio: "",
            descripcion: "",
        }));
    }, [formData.tipoCita]);

    //EFECT 5 Efecto para cargar datos de solicitud seleccionada
    useEffect(() => {
        if (selectedSolicitud && formData.tipoCita === "solicitud") {
            setFormData((prev) => ({
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
                    lugar: selectedSolicitud.direccion,
                },
            }));
        }
    }, [selectedSolicitud, formData.tipoCita]);

    //EFECT 6 Efecto para cargar datos de orden de servicio seleccionada
    useEffect(() => {
        if (
            selectedOrdenServicio &&
            (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia")
        ) {
            setFormData((prev) => ({
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
                    lugar: selectedOrdenServicio.direccion,
                    materiales: selectedOrdenServicio.materiales
                },
            }));
        }
    }, [selectedOrdenServicio, formData.tipoCita]);

    // Agrega esta funcin para manejar el comprobante de pago
    const handleComprobantePagoChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files && e.target.files[0]) {
            setComprobantePago(e.target.files[0]);
        }
    };

    const removeComprobantePago = () => setComprobantePago(null);

    const calculateEndTime = (horaInicio: string, minutoInicio: string) => {
        if (!horaInicio || !minutoInicio) return { horaFin: "", minutoFin: "" };

        let startHour = parseInt(horaInicio);
        let startMinute = parseInt(minutoInicio);

        let endHour = startHour + 2;
        let endMinute = startMinute;

        if (endHour >= 24) {
            endHour = endHour % 24;
        }

        return {
            horaFin: endHour.toString().padStart(2, "0"),
            minutoFin: endMinute.toString().padStart(2, "0"),
        };
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        // Si es tipo de cita, limpiar selecciones
        if (name === "tipoCita") {
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
        }

        // Si es tipo de servicio y no es mantenimiento, limpiar tipo de mantenimiento
        if (name === "tipoServicioSolicitud" && value !== "mantenimiento") {
            setFormData((prev) => ({
                ...prev,
                [name]: value as "mantenimiento" | "instalacion",
                tipoMantenimientoSolicitud: undefined,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (name !== "orden") {
            setTouched((prev) => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));

        const newFormData = { ...formData, [name]: value };
        const timeRangeError = validateTimeRange(
            newFormData.horaInicio,
            newFormData.minutoInicio,
            newFormData.horaFin,
            newFormData.minutoFin
        );

        if (timeRangeError) {
            setErrors((prev) => ({ ...prev, timeRange: timeRangeError }));
        } else {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.timeRange;
                return newErrors;
            });
        }
    };

    const handleTechnicianSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const techId = parseInt(e.target.value);
        if (techId) {
            const technician = technicians.find((tech) => tech.id === techId);
            if (technician && !selectedTechnicians.find((t) => t.id === techId)) {
                setSelectedTechnicians((prev) => [...prev, technician]);
                setTechnicianError(null);
                showInfo(`Tcnico ${technician.nombre} agregado`);
            } else {
                showWarning("Este tcnico ya fue seleccionado");
            }
        }
    };

    const removeTechnician = (id: number) => {
        const technician = selectedTechnicians.find((t) => t.id === id);
        setSelectedTechnicians((prev) => prev.filter((tech) => tech.id !== id));

        const error =
            selectedTechnicians.length === 1
                ? "Debe seleccionar al menos un tcnico"
                : null;
        setTechnicianError(error);

        if (technician) {
            showWarning(`Tcnico ${technician.nombre} removido`);
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

    const handleBlur = (
        e: React.FocusEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(
            name,
            formData[name as keyof AppointmentFormData] as string
        );
        setErrors((prev) => ({ ...prev, [name]: error }));

        if (error) {
            showError(error);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: AppointmentErrors = {};

        // Validaciones bsicas de fecha y hora
        if (!formData.horaInicio)
            newErrors.horaInicio = "Hora de inicio es requerida";
        if (!formData.minutoInicio)
            newErrors.minutoInicio = "Minuto de inicio es requerido";
        if (!formData.dia) newErrors.dia = "Da es requerido";
        if (!formData.mes) newErrors.mes = "Mes es requerido";
        if (!formData.ano) newErrors.ano = "Ano es requerido";
        if (!formData.tipoCita) newErrors.tipoCita = "Tipo de cita es requerido";

        // Validacin de tcnicos
        const techError =
            selectedTechnicians.length === 0
                ? "Debe seleccionar al menos un tcnico"
                : null;
        setTechnicianError(techError);

        // Validaciones especficas por tipo de cita
        if (formData.tipoCita === "solicitud") {
            if (!selectedSolicitud && !formData.nombreCliente?.trim()) {
                newErrors.nombreCliente =
                    "Seleccione una solicitud o ingrese el nombre del cliente";
            }
            if (!selectedSolicitud && !formData.direccion?.trim()) {
                newErrors.direccion = "La direccin es requerida";
            }
            if (!selectedSolicitud && !formData.tipoServicioSolicitud) {
                newErrors.tipoServicioSolicitud = "El tipo de servicio es requerido";
            }
            if (
                !selectedSolicitud &&
                formData.tipoServicioSolicitud === "mantenimiento" &&
                !formData.tipoMantenimientoSolicitud
            ) {
                newErrors.tipoMantenimientoSolicitud =
                    "El tipo de mantenimiento es requerido";
            }
        } else if (
            formData.tipoCita === "ejecucion" ||
            formData.tipoCita === "garantia"
        ) {
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
        if (formData.dia && formData.mes && formData.ano) {
            const fecha = new Date(
                parseInt(formData.ano),
                parseInt(formData.mes) - 1,
                parseInt(formData.dia)
            );

            if (fecha.getDay() === 0) {
                setErrors((prev) => ({
                    ...prev,
                    dia: "No se permiten citas en domingo",
                }));
                showError("No se permiten citas en domingo");
                return;
            }
        }

        if (!validateForm()) {
            showError("Por favor, complete todos los campos obligatorios");
            return;
        }

        // Crear orden automtica si es solicitud sin seleccin
        let ordenParaGuardar = formData.orden;

        if (formData.tipoCita === "solicitud" && !selectedSolicitud) {
            ordenParaGuardar = {
                id: `SOL-${Date.now()}`,
                tipoServicio: formData.tipoServicioSolicitud!,
                tipoMantenimiento: formData.tipoMantenimientoSolicitud,
                monto: 100000,
                cliente: formData.nombreCliente!,
                lugar: formData.direccion!,
            };
        } else if (
            (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia") &&
            selectedOrdenServicio
        ) {
            ordenParaGuardar = {
                id: selectedOrdenServicio.id,
                tipoServicio: selectedOrdenServicio.tipoServicio,
                tipoMantenimiento: selectedOrdenServicio.tipoMantenimiento,
                monto: selectedOrdenServicio.monto,
                cliente: selectedOrdenServicio.cliente,
                lugar: selectedOrdenServicio.direccion,
                materiales: selectedOrdenServicio.materiales || []
            };
        }

        // Crear ttulo
        let title = "";
        if (formData.tipoCita === "solicitud") {
            const cliente = formData.nombreCliente || "Nuevo cliente";
            const servicio =
                formData.tipoServicioSolicitud === "mantenimiento"
                    ? `Mantenimiento ${formData.tipoMantenimientoSolicitud}`
                    : "Instalacin";
            title = `[SOLICITUD] ${cliente} - ${servicio}`;
        } else {
            title = `[${formData.tipoCita.toUpperCase()}] ${ordenParaGuardar?.cliente || "Cliente"
                } - ${ordenParaGuardar?.tipoServicio || "Servicio"}`;
        }

        const startDate = new Date(
            parseInt(formData.ano),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaInicio),
            parseInt(formData.minutoInicio)
        );

        const endDate = new Date(
            parseInt(formData.ano),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaFin),
            parseInt(formData.minutoFin)
        );

        onSave({
            id: Date.now(),
            ...formData,
            horaInicio: formData.horaInicio.padStart(2, "0"),
            minutoInicio: formData.minutoInicio.padStart(2, "0"),
            horaFin: formData.horaFin.padStart(2, "0"),
            minutoFin: formData.minutoFin.padStart(2, "0"),
            orden: ordenParaGuardar,
            tecnicos: selectedTechnicians,
            start: startDate,
            end: endDate,
            title: title,
            comprobantePago: comprobantePago,
        });
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
        handleSubmit,
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
        ano: "",
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
        descripcion: "",
    });

    const [selectedTechnicians, setSelectedTechnicians] = useState<Technician[]>(
        []
    );
    const [selectedSolicitud, setSelectedSolicitud] =
        useState<SolicitudOrden | null>(null);
    const [selectedOrdenServicio, setSelectedOrdenServicio] =
        useState<OrdenServicio | null>(null);
    const [comprobantePago, setComprobantePago] = useState<File | string | null>(
        null
    );
    const [errors, setErrors] = useState<AppointmentErrors>({});
    const [technicianError, setTechnicianError] = useState<string | null>(null);
    const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
    const [evidencia, setEvidencia] = useState<File | string | null>(null);
    const [estado, setEstado] = useState<
        "Pendiente" | "Finalizado" | "Cancelado" | "En-proceso" | "Cerrado" | "Reprogramada"
    >("Pendiente");

    const prevTipoCita = useRef<string | undefined>(undefined);

    useEffect(() => {
        if (appointment && appointment.id) {
            console.log("=== INICIALIZANDO EDITAR CITA - EFECT 7 ===");

            let initialSolicitud: SolicitudOrden | null = null;
            let initialOrdenServicio: OrdenServicio | null = null;

            if (appointment.orden && appointment.orden.id) {
                const orderId = appointment.orden.id.toString();

                if (appointment.tipoCita === "solicitud") {
                    initialSolicitud =
                        solicitudesOrden.find((s) => s.id.toString() === orderId) || null;
                } else if (
                    appointment.tipoCita === "ejecucion" ||
                    appointment.tipoCita === "garantia"
                ) {
                    initialOrdenServicio =
                        ordenesServicio.find((o) => o.id.toString() === orderId) || null;
                }
            }

            setFormData({
                ...appointment,

                horaInicio: appointment.horaInicio || "",
                minutoInicio: appointment.minutoInicio || "",
                horaFin: appointment.horaFin || "",
                minutoFin: appointment.minutoFin || "",
                dia: appointment.dia || "",
                mes: appointment.mes || "",
                ano: appointment.ano || "",

                orden: appointment.orden || null,
            });

            setSelectedSolicitud(initialSolicitud);
            setSelectedOrdenServicio(initialOrdenServicio);

            setSelectedTechnicians(appointment.tecnicos || []);
            setEvidencia(appointment.evidencia || null);
            setComprobantePago(appointment.comprobantePago || null);
            setEstado(appointment.estado || "Pendiente");
            setErrors({});
            setTechnicianError(null);
            setTouched({});

            if (appointment.tipoCita) {
                prevTipoCita.current = appointment.tipoCita;
            }
        }
    }, [appointment, solicitudesOrden, ordenesServicio]);

    useEffect(() => {
        if (
            (!formData.horaFin || !formData.minutoFin) &&
            formData.horaInicio &&
            formData.minutoInicio
        ) {
            const { horaFin, minutoFin } = calculateEndTime(
                formData.horaInicio,
                formData.minutoInicio
            );

            setFormData((prev) => ({
                ...prev,
                horaFin,
                minutoFin,
            }));
        }
    }, [formData.horaInicio, formData.minutoInicio]);

    useEffect(() => {
        if (formData.tipoServicioSolicitud !== "mantenimiento") {
            setFormData((prev) => ({
                ...prev,
                tipoMantenimientoSolicitud: undefined,
            }));
        }
    }, [formData.tipoServicioSolicitud]);

    useEffect(() => {
        if (prevTipoCita.current !== formData.tipoCita) {
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
            setFormData((prev) => ({
                ...prev,
                orden: null,
                nombreCliente: "",
                direccion: "",
                tipoServicioSolicitud: undefined,
                tipoMantenimientoSolicitud: undefined,
                servicio: "",
                descripcion: "",
            }));
        }
        // Actualizar la referencia para el prximo cambio
        prevTipoCita.current = formData.tipoCita;
    }, [formData.tipoCita]);
    // EFECT 11: Efecto para cargar datos de solicitud seleccionada (SIN CAMBIOS)
    useEffect(() => {
        if (selectedSolicitud && formData.tipoCita === "solicitud") {
            setFormData((prev) => ({
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
                    lugar: selectedSolicitud.direccion,
                },
            }));
        }
    }, [selectedSolicitud, formData.tipoCita]);

    // EFECT 12: Efecto para cargar datos de orden de servicio seleccionada (SIN CAMBIOS)
    useEffect(() => {
        if (
            selectedOrdenServicio &&
            (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia")
        ) {
            setFormData((prev) => ({
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
                    lugar: selectedOrdenServicio.direccion,
                },
            }));
        }
    }, [selectedOrdenServicio, formData.tipoCita]);
    const calculateEndTime = (horaInicio: string, minutoInicio: string) => {
        if (!horaInicio || !minutoInicio) return { horaFin: "", minutoFin: "" };

        let startHour = parseInt(horaInicio);
        let startMinute = parseInt(minutoInicio);

        let endHour = startHour + 2;
        let endMinute = startMinute;

        if (endHour >= 24) {
            endHour = endHour % 24;
        }

        return {
            horaFin: endHour.toString().padStart(2, "0"),
            minutoFin: endMinute.toString().padStart(2, "0"),
        };
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        // Si es tipo de cita, limpiar selecciones
        if (name === "tipoCita") {
            setSelectedSolicitud(null);
            setSelectedOrdenServicio(null);
        }

        // Si es tipo de servicio y no es mantenimiento, limpiar tipo de mantenimiento
        if (name === "tipoServicioSolicitud" && value !== "mantenimiento") {
            setFormData((prev) => ({
                ...prev,
                [name]: value as "mantenimiento" | "instalacion",
                tipoMantenimientoSolicitud: undefined,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        if (name !== "orden") {
            setTouched((prev) => ({ ...prev, [name]: true }));
            const error = validateAppointmentField(name, value);
            setErrors((prev) => ({ ...prev, [name]: error }));
        }
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));

        const newFormData = { ...formData, [name]: value };
        const timeRangeError = validateTimeRange(
            newFormData.horaInicio,
            newFormData.minutoInicio,
            newFormData.horaFin,
            newFormData.minutoFin
        );

        if (timeRangeError) {
            setErrors((prev) => ({ ...prev, timeRange: timeRangeError }));
        } else {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.timeRange;
                return newErrors;
            });
        }
    };

    const handleTechnicianSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const techId = parseInt(e.target.value);
        if (techId) {
            const technician = technicians.find((tech) => tech.id === techId);
            if (technician && !selectedTechnicians.find((t) => t.id === techId)) {
                setSelectedTechnicians((prev) => [...prev, technician]);
                setTechnicianError(null);
                showInfo(`Tcnico ${technician.nombre} agregado`);
            } else {
                showWarning("Este tcnico ya fue seleccionado");
            }
        }
    };

    const removeTechnician = (id: number) => {
        const technician = selectedTechnicians.find((t) => t.id === id);
        setSelectedTechnicians((prev) => prev.filter((tech) => tech.id !== id));

        const error =
            selectedTechnicians.length === 1
                ? "Debe seleccionar al menos un tcnico"
                : null;
        setTechnicianError(error);

        if (technician) {
            showWarning(`Tcnico ${technician.nombre} removido`);
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

    const handleComprobantePagoChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (e.target.files && e.target.files[0]) {
            setComprobantePago(e.target.files[0]);
        }
    };

    const removeComprobantePago = () => setComprobantePago(null);

    const handleBlur = (
        e: React.FocusEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));

        const error = validateAppointmentField(
            name,
            formData[name as keyof AppointmentFormData] as string
        );
        setErrors((prev) => ({ ...prev, [name]: error }));

        if (error) {
            showError(error);
        }
    };

    const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newEstado = e.target.value as
            | "Pendiente"
            | "Finalizado"
            | "Cancelado";
        setEstado(newEstado);

        setFormData((prev) => ({
            ...prev,
            estado: newEstado,
            motivoCancelacion:
                newEstado === "Cancelado" ? prev.motivoCancelacion : "",
            horaCancelacion: newEstado === "Cancelado" ? new Date() : null,
        }));

        if (newEstado === "Cancelado" && !formData.motivoCancelacion?.trim()) {
            setErrors((prev) => ({
                ...prev,
                motivoCancelacion: "Debe indicar el motivo de la cancelacin",
            }));
            showError("Debe indicar el motivo de la cancelacin");
        } else if (newEstado !== "Cancelado") {
            setErrors((prev) => ({ ...prev, motivoCancelacion: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: AppointmentErrors = {};

        // Validaciones bsicas de fecha y hora
        if (!formData.horaInicio)
            newErrors.horaInicio = "Hora de inicio es requerida";
        if (!formData.minutoInicio)
            newErrors.minutoInicio = "Minuto de inicio es requerido";
        if (!formData.dia) newErrors.dia = "Da es requerido";
        if (!formData.mes) newErrors.mes = "Mes es requerido";
        if (!formData.ano) newErrors.ano = "Ano es requerido";
        if (!formData.tipoCita) newErrors.tipoCita = "Tipo de cita es requerido";

        // Validacin de tcnicos
        const techError =
            selectedTechnicians.length === 0
                ? "Debe seleccionar al menos un tcnico"
                : null;
        setTechnicianError(techError);

        // Validaciones especficas por tipo de cita
        if (formData.tipoCita === "solicitud") {
            if (!selectedSolicitud && !formData.nombreCliente?.trim()) {
                newErrors.nombreCliente =
                    "Seleccione una solicitud o ingrese el nombre del cliente";
            }
            if (!selectedSolicitud && !formData.direccion?.trim()) {
                newErrors.direccion = "La direccin es requerida";
            }
            if (!selectedSolicitud && !formData.tipoServicioSolicitud) {
                newErrors.tipoServicioSolicitud = "El tipo de servicio es requerido";
            }
            if (
                !selectedSolicitud &&
                formData.tipoServicioSolicitud === "mantenimiento" &&
                !formData.tipoMantenimientoSolicitud
            ) {
                newErrors.tipoMantenimientoSolicitud =
                    "El tipo de mantenimiento es requerido";
            }
        } else if (
            formData.tipoCita === "ejecucion" ||
            formData.tipoCita === "garantia"
        ) {
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
        if (formData.dia && formData.mes && formData.ano) {
            const fecha = new Date(
                parseInt(formData.ano),
                parseInt(formData.mes) - 1,
                parseInt(formData.dia)
            );

            if (fecha.getDay() === 0) {
                setErrors((prev) => ({
                    ...prev,
                    dia: "No se permiten citas en domingo",
                }));
                showError("No se permiten citas en domingo");
                return;
            }
        }

        if (!validateForm()) {
            showError("Por favor, complete todos los campos obligatorios");
            return;
        }

        // Crear orden automtica si es solicitud sin seleccin
        let ordenParaGuardar = formData.orden;

        if (formData.tipoCita === "solicitud" && !selectedSolicitud) {
            ordenParaGuardar = {
                id: `SOL-${Date.now()}`,
                tipoServicio: formData.tipoServicioSolicitud!,
                tipoMantenimiento: formData.tipoMantenimientoSolicitud,
                monto: 100000,
                cliente: formData.nombreCliente!,
                lugar: formData.direccion!,
            };
        } else if (
            (formData.tipoCita === "ejecucion" || formData.tipoCita === "garantia") &&
            selectedOrdenServicio
        ) {
            ordenParaGuardar = {
                id: selectedOrdenServicio.id,
                tipoServicio: selectedOrdenServicio.tipoServicio,
                tipoMantenimiento: selectedOrdenServicio.tipoMantenimiento,
                monto: selectedOrdenServicio.monto,
                cliente: selectedOrdenServicio.cliente,
                lugar: selectedOrdenServicio.direccion,
            };
        }

        // Crear ttulo
        let title = "";
        if (formData.tipoCita === "solicitud") {
            const cliente = formData.nombreCliente || "Nuevo cliente";
            const servicio =
                formData.tipoServicioSolicitud === "mantenimiento"
                    ? `Mantenimiento ${formData.tipoMantenimientoSolicitud}`
                    : "Instalacin";
            title = `[SOLICITUD] ${cliente} - ${servicio}`;
        } else {
            title = `[${formData.tipoCita.toUpperCase()}] ${ordenParaGuardar?.cliente || "Cliente"
                } - ${ordenParaGuardar?.tipoServicio || "Servicio"}`;
        }

        const startDate = new Date(
            parseInt(formData.ano),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaInicio),
            parseInt(formData.minutoInicio)
        );

        const endDate = new Date(
            parseInt(formData.ano),
            parseInt(formData.mes) - 1,
            parseInt(formData.dia),
            parseInt(formData.horaFin),
            parseInt(formData.minutoFin)
        );

        const updatedAppointment: AppointmentEvent = {
            ...formData,
            id: appointment?.id || Date.now(),
            horaInicio: formData.horaInicio.padStart(2, "0"),
            minutoInicio: formData.minutoInicio.padStart(2, "0"),
            horaFin: formData.horaFin.padStart(2, "0"),
            minutoFin: formData.minutoFin.padStart(2, "0"),
            orden: ordenParaGuardar,
            tecnicos: selectedTechnicians,
            evidencia:
                evidencia instanceof File
                    ? evidencia
                    : appointment?.evidencia || evidencia,
            comprobantePago:
                comprobantePago instanceof File
                    ? comprobantePago
                    : appointment?.comprobantePago || comprobantePago,
            estado: estado,
            horaCancelacion:
                estado === "Cancelado" ? new Date() : formData.horaCancelacion,
            start: startDate,
            end: endDate,
            title: title,
        };

        onSave(updatedAppointment);
        showSuccess("Cita actualizada exitosamente");
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
        removeComprobantePago,
    };
};

// Busqueda
export const useOrderSearch = ({
    orders,
    selectedOrder,
    onOrderSelect,
    onOrderBlur,
    validateOrder,
}: UseOrderSearchProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [touched, setTouched] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>();

    // Filtrar rdenes
    const filteredOrders = orders.filter((order) =>
        `${order.id} - ${order.cliente}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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

    // Manejar seleccin de orden
    const handleSelectOrder = (order: Order | null) => {
        onOrderSelect(order);

        if (order) {
            setSearchTerm(`${order.id} - ${order.cliente}`);
        } else {
            setSearchTerm("");
        }

        setIsOpen(false);
        setHighlightedIndex(-1);

        if (order !== null) {
            setTouched(true);
        }
    };

    // Manejar cambio en el input de bsqueda
    const handleInputChange = (value: string) => {
        setSearchTerm(value);
        setIsOpen(true);
        setHighlightedIndex(0);

        if (value === "") {
            onOrderSelect(null);
            setTouched(true);
        }
    };

    // Manejar teclado
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOrders.length - 1 ? prev + 1 : 0
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOrders.length - 1
                );
                break;
            case "Enter":
                e.preventDefault();
                if (filteredOrders[highlightedIndex]) {
                    handleSelectOrder(filteredOrders[highlightedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
            case "Tab":
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
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, callback, isActive]);
};















