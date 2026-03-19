"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import ClientRequestModal, {
  type CreateRequestPayload,
} from "@/features/dashboard/requests/components/ClientRequestModal";
import {
  createServiceRequest,
  type ServiceTypeApi,
  type CreateServiceRequestInput,
} from "@/features/dashboard/requests/services/servicerequests.service";
import { showError, showInfo, showSuccess } from "@/shared/utils/notifications";
import { useAuth } from "@/features/auth/authcontext";
import { useRequestStates } from "@/features/dashboard/requests/hooks/useRequestStates";

interface CardServicesProps {
  title: string;
  description: string;
  category?: string;
  image?: string;
  serviceId: number;
  clientId: number;
  clientLabel?: string;
}

function resolveServiceType(category?: string): ServiceTypeApi {
  const s = String(category || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (s.includes("instal")) return "INSTALACION";
  return "MANTENIMIENTO";
}

function getBackendMessage(err: any) {
  const msg = err?.response?.data?.message ?? err?.message ?? "";
  if (Array.isArray(msg)) return msg.filter(Boolean).join(" | ");
  return String(msg || "");
}

export default function CardServices({
  title,
  description,
  category,
  image,
  serviceId,
  clientId,
  clientLabel,
}: CardServicesProps) {
  const [open, setOpen] = useState(false);
  const { ready, isAuthenticated, user, profile } = useAuth();
  const { pendingStateId, scheduledStateId } = useRequestStates();

  const serviceType = useMemo(() => resolveServiceType(category), [category]);

  const isClientRole = useMemo(() => {
    const candidates = [
      user?.rolename,
      (user as any)?.role,
      (user as any)?.role?.name,
      profile?.rolename,
      (profile as any)?.role,
      (profile as any)?.role?.name,
    ];

    const normalized = candidates
      .map((r) =>
        String(r ?? "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean);

    return normalized.some(
      (r) => r === "cliente" || r === "client" || r.includes("cliente"),
    );
  }, [user, profile]);

  const handleOpenModal = () => {
    if (!ready) {
      showInfo("Cargando sesión...");
      return;
    }
    if (!isAuthenticated) {
      showInfo("Debes iniciar sesión para contratar este servicio.");
      return;
    }
    if (!isClientRole) {
      showInfo("Solo usuarios con rol de Cliente pueden solicitar servicios.");
      return;
    }
    setOpen(true);
  };

  const handleCloseModal = () => setOpen(false);

  const handleSave = async (data: CreateRequestPayload) => {
    if (!isClientRole) {
      showInfo("No tienes permiso para enviar solicitudes de servicio.");
      return;
    }

    const hasSchedule = Boolean(
      (data.scheduledAt && String(data.scheduledAt).trim()) ||
      (data.scheduledEndAt && String(data.scheduledEndAt).trim()),
    );

    const fromPayloadState = Number(data?.stateId);
    const resolvedPending =
      pendingStateId && Number.isFinite(pendingStateId) && pendingStateId > 0
        ? Number(pendingStateId)
        : null;
    const resolvedScheduled =
      scheduledStateId &&
      Number.isFinite(scheduledStateId) &&
      scheduledStateId > 0
        ? Number(scheduledStateId)
        : null;

    const stateIdToSend =
      (Number.isFinite(fromPayloadState) &&
        fromPayloadState > 0 &&
        fromPayloadState) ||
      (hasSchedule && resolvedScheduled) ||
      resolvedPending ||
      5;

    const payload: CreateServiceRequestInput = {
      scheduledAt: data.scheduledAt ?? null,
      scheduledEndAt: data.scheduledEndAt ?? null,
      serviceType: (data.serviceType as any) ?? serviceType,
      description: String(data.description ?? "").trim(),
      direccion: String(data.direccion ?? "").trim(),
      stateId: stateIdToSend,
      serviceId: Number(serviceId),
      clientId: Number(clientId) || 0,
      technicians: [],
      availabilityOptions: data.availabilityOptions ?? [],
    };

    try {
      await createServiceRequest(payload);
      showSuccess("Solicitud procesada. Nos pondremos en contacto pronto.");
      handleCloseModal();
    } catch (error: any) {
      showError(getBackendMessage(error) || "Error al registrar la solicitud.");
      throw error;
    }
  };

  return (
    <>
      <motion.div
        className="group relative bg-white border border-gray-100 flex flex-col h-full transition-all duration-500 hover:border-red-600/30 overflow-hidden"
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -10 }}
      >
        {/* Contenedor de Imagen */}
        <div className="relative h-64 overflow-hidden bg-gray-50">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black text-4xl italic select-none">
              SISTEMAS PC
            </div>
          )}
          {/* Overlay sutil al hacer hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Cuerpo de la Card */}
        <div className="p-6 flex flex-col flex-1 gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-[2px] bg-red-600"></span>
              {category && (
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">
                  {category}
                </span>
              )}
            </div>

            <h3 className="text-2xl font-black text-black leading-tight tracking-tighter uppercase mb-3 group-hover:text-red-600 transition-colors">
              {title}
            </h3>

            <p className="text-gray-500 text-sm font-medium leading-relaxed">
              {description}
            </p>
          </div>

          {/* Botón de Acción */}
          <div className="pt-4 border-t border-gray-50">
            <button
              onClick={handleOpenModal}
              type="button"
              className="cursor-pointer relative w-full h-12 bg-black overflow-hidden group/btn transition-transform active:scale-95"
            >
              <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 text-white font-black text-[10px] uppercase tracking-[0.2em]">
                CONTRATAR SERVICIO
              </span>
            </button>
          </div>
        </div>

        {/* Detalle Decorativo Inferior */}
        <div className="h-1 w-0 group-hover:w-full bg-red-600 transition-all duration-500"></div>
      </motion.div>

      <ClientRequestModal
        isOpen={open}
        onClose={handleCloseModal}
        onSave={handleSave}
        title="Solicitud de Servicio Técnico"
        clientId={Number(clientId) || 0}
        clientLabel={clientLabel}
        initialServiceId={serviceId}
        pendingStateId={pendingStateId ?? undefined}
        scheduledStateId={scheduledStateId ?? undefined}
      />
    </>
  );
}
