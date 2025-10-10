"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/features/dashboard/components/Modal";

type TipoServicio = "Mantenimiento" | "Instalacion";
type TipoDoc = "CC" | "CE" | "NIT" | "PAS";

export type CreateRequestPayload = {
  tipos: TipoServicio[];
  servicio: string;
  descripcion: string;
  direccion: string;
  cliente: {
    status: "found" | "new";
    id?: string;
    tipoDoc: TipoDoc;
    documento: string;
    nombre?: string;
    correo?: string;
    telefono?: string;
  };
};

export type CreateRequestWithSignupProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRequestPayload) => void | Promise<void>;
  title?: string;
  servicios?: string[];
  onFindClienteByDocumento?: (
    tipo: TipoDoc,
    documento: string
  ) => Promise<{ id: string; nombre: string; correo: string; telefono: string } | null>;
  onRegisterCliente?: (data: {
    tipoDoc: TipoDoc;
    documento: string;
    nombre: string;
    correo: string;
    telefono: string;
    password: string;
  }) => Promise<{ id: string }>;
  onOpenPago?: (payload: CreateRequestPayload) => void;
};

const DEFAULT_SERVICIOS = ["Cableado", "CCTV", "Servidor", "Red WiFi", "Impresora"];
const MOCK_DB = [
  { id: "c1", tipoDoc: "CC" as const, documento: "1234567890", nombre: "SistemasPC", correo: "contacto@sistemaspc.co", telefono: "3001234567" },
];

const MONTO = 100000;
const formatCOP = (n: number) =>
  n.toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export default function CreateRequestWithSignupModal({
  isOpen,
  onClose,
  onSave,
  title = "Nueva solicitud de servicio",
  servicios = DEFAULT_SERVICIOS,
  onFindClienteByDocumento,
  onRegisterCliente,
  onOpenPago,
}: CreateRequestWithSignupProps) {
  const router = useRouter();

  const [tipos, setTipos] = useState<TipoServicio[]>([]);
  const [servicio, setServicio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");

  const [tipoDoc, setTipoDoc] = useState<TipoDoc>("CC");
  const [documento, setDocumento] = useState("");
  const [clienteStatus, setClienteStatus] = useState<"unknown" | "checking" | "found" | "new">("unknown");
  const [clienteId, setClienteId] = useState<string | undefined>(undefined);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [acepta, setAcepta] = useState(false);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<Record<string, string | null>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCheckedRef = useRef<string>("");

  const finder =
    onFindClienteByDocumento ??
    (async (t: TipoDoc, d: string) => {
      const hit = MOCK_DB.find((c) => c.tipoDoc === t && c.documento === d);
      return hit ? { id: hit.id, nombre: hit.nombre, correo: hit.correo, telefono: hit.telefono } : null;
    });

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setClienteStatus("unknown");
    setClienteId(undefined);
    setNombre("");
    setCorreo("");
    setTelefono("");
    setPwd("");
    setPwd2("");
    setAcepta(false);

    const key = `${tipoDoc}:${documento.trim()}`;
    if (documento.trim().length < 4) return;

    debounceRef.current = setTimeout(async () => {
      if (lastCheckedRef.current === key) return;
      setClienteStatus("checking");
      const res = await finder(tipoDoc, documento.trim());
      if (res) {
        setClienteStatus("found");
        setClienteId(res.id);
        setNombre(res.nombre);
        setCorreo(res.correo);
        setTelefono(res.telefono);
      } else {
        setClienteStatus("new");
        setClienteId(undefined);
        setNombre("");
        setCorreo("");
        setTelefono("");
      }
      lastCheckedRef.current = key;
    }, 450);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tipoDoc, documento]);

  function toggleTipo(t: TipoServicio) {
    setTipos((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function validate() {
    const e: Record<string, string | null> = {};
    e.documento = documento.trim().length >= 4 ? null : "Documento inválido.";
    if (clienteStatus === "found") {
      e.tipos = tipos.length ? null : "Selecciona al menos un tipo.";
      e.servicio = servicio ? null : "Selecciona un servicio.";
      e.descripcion = descripcion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
      e.direccion = direccion.trim().length >= 3 ? null : "Mínimo 3 caracteres.";
    }
    if (clienteStatus === "unknown" || clienteStatus === "checking") e.cliente = "Espera a que se valide el documento.";
    if (clienteStatus === "new") {
      e.nombre = nombre.trim().length >= 3 ? null : "Nombre requerido.";
      e.correo = /^\S+@\S+\.\S+$/.test(correo) ? null : "Correo inválido.";
      e.telefono = /^[0-9\-+()\s]{7,20}$/.test(telefono) ? null : "Teléfono inválido.";
      e.pwd = pwd.length >= 6 ? null : "Mínimo 6 caracteres.";
      e.pwd2 = pwd2 === pwd ? null : "Las contraseñas no coinciden.";
      e.acepta = acepta ? null : "Debes aceptar los términos.";
    }
    setErr(e);
    return Object.values(e).every((x) => !x);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (clienteStatus === "new") {
      try {
        setSaving(true);
        const registrar =
          onRegisterCliente ??
          (async () => {
            const id = `c${Math.random().toString(36).slice(2, 8)}`;
            return { id };
          });
        const res = await registrar({
          tipoDoc,
          documento: documento.trim(),
          nombre: nombre.trim(),
          correo: correo.trim(),
          telefono: telefono.trim(),
          password: pwd,
        });
        setClienteId(res.id);
        setClienteStatus("found");
        setErr({});
        setSaving(false);
        return;
      } catch {
        setSaving(false);
        return;
      }
    }

    const payload: CreateRequestPayload = {
      tipos,
      servicio,
      descripcion: descripcion.trim(),
      direccion: direccion.trim(),
      cliente: { status: "found", id: clienteId, tipoDoc, documento: documento.trim() },
    };

    try {
      sessionStorage.setItem("checkout_payload", JSON.stringify(payload));
      sessionStorage.setItem("checkout_amount", String(MONTO));
    } catch {}
    const openPago = onOpenPago ?? (() => router.push(`/payments/register?amount=${MONTO}`));
    openPago(payload);
  }

  function resetAll() {
    setTipos([]);
    setServicio("");
    setDescripcion("");
    setDireccion("");
    setTipoDoc("CC");
    setDocumento("");
    setClienteStatus("unknown");
    setClienteId(undefined);
    setNombre("");
    setCorreo("");
    setTelefono("");
    setPwd("");
    setPwd2("");
    setAcepta(false);
    setErr({});
    lastCheckedRef.current = "";
  }

  const isSignup = clienteStatus === "new";
  const primaryLabel = isSignup ? "Registrar y continuar" : `Pagar ${formatCOP(MONTO)}`;

  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={() => {
        resetAll();
        onClose();
      }}
      footer={
        <>
          <button
            type="button"
            onClick={() => {
              resetAll();
              onClose();
            }}
            className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-request-signup-form"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {saving ? (isSignup ? "Registrando..." : "Redirigiendo…") : primaryLabel}
          </button>
        </>
      }
    >
      <form id="create-request-signup-form" onSubmit={handleSubmit} className="grid gap-6">
        <div className="space-y-2">
          <div className="text-sm text-gray-800">Identificación del cliente</div>
          <div className="grid grid-cols-[110px,1fr] gap-2">
            <select
              value={tipoDoc}
              onChange={(e) => setTipoDoc(e.target.value as TipoDoc)}
              className="h-10 rounded-md border border-gray-300 bg-gray-100 px-2 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
            >
              <option value="CC">CC</option>
              <option value="CE">CE</option>
              <option value="NIT">NIT</option>
              <option value="PAS">PAS</option>
            </select>
            <div className="flex flex-col gap-1">
              <input
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Número de documento"
                className="h-10 rounded-md border border-gray-300 bg-gray-100 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
              />
              {clienteStatus !== "unknown" && <InlineStatus status={clienteStatus} />}
            </div>
          </div>
          {"cliente" in err && err.cliente && <p className="text-xs text-red-600">{err.cliente}</p>}
          {err.documento && <p className="text-xs text-red-600">{err.documento}</p>}
        </div>

        {isSignup ? (
          <div className="grid gap-4">
            <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">Regístrate primero para crear tu solicitud.</div>
            <fieldset className="grid gap-3 rounded-md border p-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nombre completo</label>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre y apellidos"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {err.nombre && <p className="mt-1 text-xs text-red-600">{err.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Correo</label>
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="correo@dominio.com"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {err.correo && <p className="mt-1 text-xs text-red-600">{err.correo}</p>}
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Teléfono</label>
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="300 000 0000"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                />
                {err.telefono && <p className="mt-1 text-xs text-red-600">{err.telefono}</p>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                  />
                  {err.pwd && <p className="mt-1 text-xs text-red-600">{err.pwd}</p>}
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={pwd2}
                    onChange={(e) => setPwd2(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                  />
                  {err.pwd2 && <p className="mt-1 text-xs text-red-600">{err.pwd2}</p>}
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Acepto términos y condiciones
              </label>
              {err.acepta && <p className="mt-1 text-xs text-red-600">{err.acepta}</p>}
            </fieldset>
          </div>
        ) : (
          <div className="grid gap-6">
            <div>
              <div className="text-sm text-gray-800">Tipo de servicio</div>
              <div className="mt-2 flex items-center gap-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={tipos.includes("Mantenimiento")}
                    onChange={() => toggleTipo("Mantenimiento")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Mantenimiento
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="checkbox"
                    checked={tipos.includes("Instalacion")}
                    onChange={() => toggleTipo("Instalacion")}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  Instalacion
                </label>
              </div>
              {err.tipos && <p className="mt-1 text-xs text-red-600">{err.tipos}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Servicio</label>
              <div className="relative">
                <select
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-gray-100 h-10 px-3 pr-8 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
                >
                  <option value="">Selecciona el servicio</option>
                  {DEFAULT_SERVICIOS.concat(servicios).filter((v, i, a) => a.indexOf(v) === i).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">▾</span>
              </div>
              {err.servicio && <p className="mt-1 text-xs text-red-600">{err.servicio}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ingrese sus observaciones"
                rows={3}
                className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
              />
              {err.descripcion && <p className="mt-1 text-xs text-red-600">{err.descripcion}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Dirección</label>
              <input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ingrese su dirección"
                className="w-full rounded-md border border-gray-300 bg-gray-100 h-10 px-3 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-[#CC0000]/40"
              />
              {err.direccion && <p className="mt-1 text-xs text-red-600">{err.direccion}</p>}
            </div>

            <div className="rounded-md border p-3 text-sm bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Monto a pagar</span>
                <span className="font-semibold">{formatCOP(MONTO)}</span>
              </div>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

function InlineStatus({ status }: { status: "unknown" | "checking" | "found" | "new" }) {
  if (status === "unknown") return null;
  if (status === "checking") return <span className="text-[11px] text-gray-600">Validando…</span>;
  if (status === "found")
    return <span className="inline-flex w-fit items-center rounded-full bg-green-100 px-2 py-[2px] text-[11px] font-semibold text-green-800">Registrado</span>;
  return (
    <span className="inline-flex w-fit items-center rounded-full bg-amber-100 px-2 py-[2px] text-[11px] font-semibold text-amber-800">
      Documento no registrado
    </span>
  );
}
