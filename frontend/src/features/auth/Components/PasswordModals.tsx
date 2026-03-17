import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { showError } from "@/shared/utils/notifications";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  closable?: boolean;
  loading?: boolean;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
  closable = true,
  loading = false,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!open || !mounted) return null;

  const node = (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={closable ? onClose : undefined}
      />
      <div
        className={`relative w-[540px] max-w-[92vw] rounded-2xl border border-white/10 bg-neutral-900 text-neutral-100 shadow-2xl ${className || ""}`}
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/50">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          </div>
        )}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-base font-semibold tracking-wide text-neutral-50">
            {title}
          </h2>
          {closable && (
            <button
              aria-label="Cerrar"
              onClick={onClose}
              className="h-8 w-8 rounded-full transition hover:bg-white/10"
            >
              X
            </button>
          )}
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
  return createPortal(node, document.body);
}

const BRAND_RED = "#B20000";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-300">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md bg-neutral-800/80 px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none ring-1 ring-white/10 focus:ring-2 ${props.className || ""}`}
      style={{ boxShadow: "none", borderColor: "transparent" }}
    />
  );
}

function PasswordInput({
  visible,
  onToggle,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="relative">
      <TextInput
        {...props}
        type={visible ? "text" : "password"}
        className={`pr-24 ${className || ""}`}
      />
      <button
        type="button"
        disabled={props.disabled}
        onClick={onToggle}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs font-medium text-neutral-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}

function Button({
  children,
  variant = "primary",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
}) {
  const base =
    "h-9 rounded-md px-4 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:opacity-60";
  const styles =
    variant === "primary"
      ? "text-white"
      : "bg-transparent text-neutral-200 hover:bg-white/10 focus-visible:ring-white/30";
  return (
    <button
      className={`${base} ${styles}`}
      style={
        variant === "primary"
          ? { background: BRAND_RED, filter: "saturate(1.05)" }
          : {}
      }
      {...rest}
    >
      {children}
    </button>
  );
}

type RecoverEmailModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: string) => Promise<void> | void;
};
export function RecoverEmailModal({
  open,
  onClose,
  onSubmit,
}: RecoverEmailModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const handle = async () => {
    setErr(null);
    if (!isValid) {
      setErr("Ingresa un correo valido");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(email);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal open={open} title="Recuperar contrasena" onClose={onClose}>
      <Field label="Ingrese su correo">
        <TextInput
          type="email"
          inputMode="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={handle} disabled={!isValid || loading}>
          {loading ? "Enviando..." : "Enviar"}
        </Button>
      </div>
    </Modal>
  );
}

type OtpModalProps = {
  open: boolean;
  email: string;
  onClose: () => void;
  onBack: () => void;
  onVerify: (code: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
  durationSec?: number;
};
export function OtpModal({
  open,
  email,
  onClose,
  onBack,
  onVerify,
  onResend,
  durationSec = 60,
}: OtpModalProps) {
  const DIGITS = 6;
  const [values, setValues] = useState<string[]>(Array(DIGITS).fill(""));
  const [err, setErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(durationSec);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) inputs.current[0]?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [open, seconds]);

  const onChange = (i: number, v: string) => {
    if (v && !/^[0-9]$/.test(v)) return;
    const next = [...values];
    next[i] = v;
    setValues(next);
    if (v && i < DIGITS - 1) inputs.current[i + 1]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[i] && i > 0)
      inputs.current[i - 1]?.focus();
  };

  const setInputRef = (idx: number) => (el: HTMLInputElement | null) => {
    inputs.current[idx] = el;
  };

  const code = useMemo(() => values.join(""), [values]);
  const done = code.length === DIGITS;

  const submit = async () => {
    setErr(null);
    if (!done) {
      setErr("Completa el codigo");
      return;
    }
    await onVerify(code);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <Modal open={open} title="Restaurar cuenta" onClose={onClose}>
      <div className="text-center">
        <p className="mb-1 text-sm font-semibold text-red-400">
          Revisa tu correo electronico
        </p>
        <p className="mb-6 text-xs text-neutral-400">
          Digita el codigo enviado a{" "}
          <span className="text-neutral-200">{email}</span>
        </p>
        <div className="mb-4 flex items-center justify-center gap-3">
          {values.map((v, i) => (
            <input
              key={i}
              ref={setInputRef(i)}
              inputMode="numeric"
              maxLength={1}
              value={v}
              onChange={(e) => onChange(i, e.target.value.trim())}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="h-10 w-10 rounded-md bg-neutral-800 text-center text-lg tracking-widest text-neutral-100 ring-1 ring-white/10 focus:outline-none focus:ring-2"
            />
          ))}
        </div>
        <p className="mb-5 text-xs text-neutral-400">
          Tiempo de caducidad {mm}:{ss} min.
        </p>
        {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!done}>
            Aceptar
          </Button>
        </div>
        <div className="mt-4 text-xs text-neutral-400">
          {seconds === 0 ? (
            <button
              className="underline transition hover:text-neutral-200"
              onClick={onResend}
            >
              Reenviar codigo
            </button>
          ) : (
            <span>Espera para reenviar</span>
          )}
        </div>
      </div>
    </Modal>
  );
}

type ChangePasswordModalProps = {
  open: boolean;
  onClose: () => void;
  requireCurrent?: boolean;
  onSave: (payload: {
    newPassword: string;
    currentPassword?: string;
  }) => Promise<void> | void;
  disableDismiss?: boolean;
};
export function ChangePasswordModal({
  open,
  onClose,
  onSave,
  requireCurrent = false,
  disableDismiss = false,
}: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[a-z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  }, [pwd]);

  const passwordChecks = useMemo(
    () => [
      { label: "Minimo 8 caracteres", ok: pwd.length >= 8 },
      { label: "Una letra mayuscula", ok: /[A-Z]/.test(pwd) },
      { label: "Una letra minuscula", ok: /[a-z]/.test(pwd) },
      { label: "Un numero", ok: /[0-9]/.test(pwd) },
      { label: "Un caracter especial", ok: /[^A-Za-z0-9]/.test(pwd) },
    ],
    [pwd],
  );

  const validatePasswordChange = () => {
    if (requireCurrent && !current.trim()) {
      const message = "Debes ingresar la contrasena actual.";
      setErr(message);
      showError(message);
      return false;
    }
    if (pwd.length < 8) {
      const message = "La nueva contrasena debe tener al menos 8 caracteres.";
      setErr(message);
      showError(message);
      return false;
    }
    if (strength < 5) {
      const message =
        "La contrasena debe completar toda la barra de seguridad.";
      setErr(message);
      showError(message);
      return false;
    }
    if (pwd !== confirm) {
      const message = "Las contrasenas no coinciden.";
      setErr(message);
      showError(message);
      return false;
    }
    return true;
  };

  const canSave =
    pwd.length >= 8 &&
    pwd === confirm &&
    strength >= 5 &&
    (!requireCurrent || current.length > 0);

  const submit = async () => {
    setErr(null);
    if (!validatePasswordChange()) return;
    setLoading(true);
    try {
      await onSave({
        newPassword: pwd,
        currentPassword: requireCurrent ? current : undefined,
      });
      setCurrent("");
      setPwd("");
      setConfirm("");
    } catch (e: any) {
      setErr(e?.message || "No se pudo actualizar la contrasena");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Cambiar Contrasena"
      onClose={onClose}
      closable={!disableDismiss && !loading}
      loading={loading}
    >
      {requireCurrent && (
        <Field label="Ingrese su contrasena actual">
          <PasswordInput
            visible={showCurrent}
            onToggle={() => setShowCurrent((v) => !v)}
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder="********"
            disabled={loading}
          />
        </Field>
      )}
      <Field label="Ingrese la nueva contrasena">
        <PasswordInput
          visible={show}
          onToggle={() => setShow((v) => !v)}
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="********"
          disabled={loading}
        />
      </Field>

      <Field label="Confirmar contrasena">
        <TextInput
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="********"
          disabled={loading}
        />
      </Field>

      <div className="mb-3 flex items-center gap-2">
        <div className="h-1 flex-1 rounded bg-neutral-800">
          <div
            className="h-1 rounded"
            style={{ width: `${(strength / 5) * 100}%`, background: BRAND_RED }}
          />
        </div>
        <span className="text-xs text-neutral-400">Seguridad</span>
      </div>
      <div className="mb-4 rounded-md border border-white/10 bg-neutral-800/40 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-300">
          Para que sea segura agrega:
        </p>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {passwordChecks.map((check) => (
            <p
              key={check.label}
              className={`text-xs ${check.ok ? "text-emerald-400" : "text-neutral-400"}`}
            >
              {check.ok ? "Cumple" : "Falta"}: {check.label}
            </p>
          ))}
        </div>
      </div>

      {err && <p className="mb-3 text-sm text-red-400">{err}</p>}
      <div className="mt-6 flex items-center justify-end gap-3">
        {!disableDismiss && (
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button
          className="cursor-pointer p-3 rounded"
          onClick={submit}
          disabled={!canSave || loading}
        >
          {loading ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </Modal>
  );
}
