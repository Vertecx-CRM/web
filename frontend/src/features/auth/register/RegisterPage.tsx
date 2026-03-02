"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Nav from "@/features/landing/layout/Nav";
import { useAuth } from "@/features/auth/authcontext";
import { showError, showSuccess } from "@/shared/utils/notifications";
import { useDocumentTypes } from "@/features/dashboard/Users/hooks/useDocumentTypes";
import { useRoles } from "@/features/dashboard/Users/hooks/useRoles";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

//  catálogo offline ciudades (Colombia)
import { City } from "country-state-city";

type FormState = {
  name: string;
  lastname: string;
  typeid: string;
  documentnumber: string;
  phone: string;
  city: string;
  zipcode: string;
  email: string;
};

type FormErrors = Record<keyof FormState, string>;
type FormTouched = Record<keyof FormState, boolean>;

const emptyErrors: FormErrors = {
  name: "",
  lastname: "",
  typeid: "",
  documentnumber: "",
  phone: "",
  city: "",
  zipcode: "",
  email: "",
};

const emptyTouched: FormTouched = {
  name: false,
  lastname: false,
  typeid: false,
  documentnumber: false,
  phone: false,
  city: false,
  zipcode: false,
  email: false,
};

const sanitize = (v: unknown) => String(v ?? "").trim();

const hasSpecialChars = (value: string) =>
  /[@,.;:_{}\[\]^`+*~¡¿?\\'=)(/&%$#"|<>]/.test(value);

//  normalizador para comparar sin tildes / mayúsculas
const normalizeText = (s: string) =>
  sanitize(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

//  IMPORTANTE: catálogo de ciudades CO *fuera* del componente (para que validateField lo vea)
const COLOMBIA_CITY_SET: Set<string> = (() => {
  const list = City.getCitiesOfCountry("CO") ?? [];
  const set = new Set<string>();
  for (const c of list) set.add(normalizeText(c.name));
  return set;
})();

const COLOMBIA_CITY_NAMES: string[] = (() => {
  const list = City.getCitiesOfCountry("CO") ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of list.sort((a, b) => a.name.localeCompare(b.name))) {
    const key = normalizeText(c.name);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(c.name);
    }
  }
  return out;
})();

function validateField(
  field: keyof FormState,
  value: string,
  form: FormState,
): string {
  const v = sanitize(value);
  const typeIdNum = Number(form.typeid || 0);
  const isNit = typeIdNum === 4;

  switch (field) {
    case "name": {
      if (!v)
        return isNit
          ? "El nombre de la empresa es obligatorio"
          : "El nombre es obligatorio";
      if (!isNit && /[0-9]/.test(v))
        return "El nombre no puede contener números";
      if (hasSpecialChars(v))
        return "El nombre no puede contener caracteres especiales";
      return "";
    }

    case "lastname": {
      if (isNit) return "";
      if (!v) return "El apellido es obligatorio";
      if (/[0-9]/.test(v)) return "El apellido no puede contener números";
      if (hasSpecialChars(v))
        return "El apellido no puede contener caracteres especiales";
      return "";
    }

    case "typeid": {
      if (!v) return "El tipo de documento es obligatorio";
      return "";
    }

    case "documentnumber": {
      if (!v) return "El número de documento es obligatorio";
      if (!typeIdNum) return "Seleccione el tipo de documento";
      if (isNit) {
        if (!/^\d{5,12}-\d{1}$/.test(v))
          return "Formato inválido (Ej: 900123456-7)";
        return "";
      }
      if (typeIdNum === 2 && !/^\d{7}$/.test(v))
        return "PPT debe tener 7 dígitos";
      if (typeIdNum === 3 && !/^[A-Za-z]{2}\d{6}$/.test(v))
        return "Formato pasaporte inválido (Ej: AB123456)";
      if (typeIdNum === 5 && !/^\d{9}$/.test(v))
        return "CE debe tener 9 dígitos";
      if (typeIdNum === 6 && !/^\d{12}$/.test(v))
        return "Visa debe tener 12 dígitos";
      if (!/^\d+$/.test(v)) return "Solo números permitidos";
      if (v.length > 10) return "Máximo 10 caracteres";
      return "";
    }

    case "phone": {
      if (!v) return "El teléfono es obligatorio";
      if (!/^\d+$/.test(v)) return "Solo números";
      if (v.length !== 10) return "Debe tener 10 dígitos";
      return "";
    }

    //  ciudad solo Colombia
    case "city": {
      if (!v) return "La ciudad es obligatoria";
      if (/[0-9]/.test(v)) return "No puede contener números";

      const target = normalizeText(v);
      const found = COLOMBIA_CITY_SET.has(target);

      if (!found) return "La ciudad no existe en Colombia";
      return "";
    }

    case "zipcode": {
      if (!v) return "Obligatorio";
      if (!/^\d+$/.test(v)) return "Solo números";
      return "";
    }

    case "email": {
      if (!v) return "El correo es obligatorio";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Formato inválido";
      return "";
    }

    default:
      return "";
  }
}

function validateAll(form: FormState): FormErrors {
  return {
    name: validateField("name", form.name, form),
    lastname: validateField("lastname", form.lastname, form),
    typeid: validateField("typeid", form.typeid, form),
    documentnumber: validateField("documentnumber", form.documentnumber, form),
    phone: validateField("phone", form.phone, form),
    city: validateField("city", form.city, form),
    zipcode: validateField("zipcode", form.zipcode, form),
    email: validateField("email", form.email, form),
  };
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some((e) => e !== "");
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { documentTypes } = useDocumentTypes();
  const { roles } = useRoles();

  const [form, setForm] = useState<FormState>({
    name: "",
    lastname: "",
    typeid: "",
    documentnumber: "",
    phone: "",
    city: "",
    zipcode: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors);
  const [touched, setTouched] = useState<FormTouched>(emptyTouched);

  const [checking, setChecking] = useState({
    documentnumber: false,
    phone: false,
    email: false,
  });

  const latestCheckRef = useRef({
    documentnumber: "",
    phone: "",
    email: "",
  });

  const clientRole = useMemo(
    () =>
      roles.find((r: any) => String(r?.name ?? "").toLowerCase() === "cliente"),
    [roles],
  );

  const setField = (name: keyof FormState, value: string) => {
    let nextForm: FormState = { ...form, [name]: value };
    if (name === "typeid" && Number(value || 0) === 4) {
      nextForm = { ...nextForm, lastname: "" };
    }

    setForm(nextForm);

    const nextTouched = { ...touched, [name]: true };
    if (name === "typeid") nextTouched.documentnumber = true;
    setTouched(nextTouched);

    const nextErrors: FormErrors = {
      ...errors,
      [name]: validateField(name, nextForm[name], nextForm),
    };

    if (name === "typeid") {
      nextErrors.documentnumber = validateField(
        "documentnumber",
        nextForm.documentnumber,
        nextForm,
      );
      nextErrors.lastname = validateField(
        "lastname",
        nextForm.lastname,
        nextForm,
      );
    }

    setErrors(nextErrors);
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setField(e.target.name as keyof FormState, e.target.value);
  };

  const onBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const name = e.target.name as keyof FormState;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, form[name], form),
    }));
  };

  const runDuplicateCheck = async (
    field: "documentnumber" | "phone" | "email",
    value: string,
  ) => {
    const cleanValue = sanitize(value);
    if (!cleanValue) return;
    latestCheckRef.current[field] = cleanValue;
    setChecking((prev) => ({ ...prev, [field]: true }));

    try {
      const res = await api.get("/users/check", {
        params: { [field]: cleanValue },
      });
      const payload = (res.data?.data ?? res.data) as any;
      const exists = Boolean(payload?.[field]);
      if (latestCheckRef.current[field] !== cleanValue) return;

      if (exists) {
        setErrors((prev) => ({
          ...prev,
          [field]: `Ya registrado en el sistema`,
        }));
      }
    } catch {
      // silencio
    } finally {
      setChecking((prev) => ({ ...prev, [field]: false }));
    }
  };

  useEffect(() => {
    if (
      !form.documentnumber ||
      validateField("documentnumber", form.documentnumber, form)
    )
      return;
    const h = setTimeout(
      () => runDuplicateCheck("documentnumber", form.documentnumber),
      450,
    );
    return () => clearTimeout(h);
  }, [form.documentnumber, form.typeid]);

  useEffect(() => {
    if (!form.phone || validateField("phone", form.phone, form)) return;
    const h = setTimeout(() => runDuplicateCheck("phone", form.phone), 450);
    return () => clearTimeout(h);
  }, [form.phone]);

  useEffect(() => {
    if (!form.email || validateField("email", form.email, form)) return;
    const h = setTimeout(() => runDuplicateCheck("email", form.email), 450);
    return () => clearTimeout(h);
  }, [form.email]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!clientRole) return showError("Error de configuración de roles.");

    const newErrors = validateAll(form);
    setErrors(newErrors);
    setTouched(
      Object.keys(emptyTouched).reduce(
        (acc, k) => ({ ...acc, [k]: true }),
        {} as FormTouched,
      ),
    );

    if (hasErrors(newErrors))
      return showError("Revisa los campos marcados en rojo.");

    setLoading(true);
    const res = await register({
      ...form,
      name: sanitize(form.name),
      lastname: sanitize(form.lastname),
      typeid: Number(form.typeid),
      roleid: clientRole.roleid,
      stateid: 1,
      customercity: sanitize(form.city),
      customerzipcode: sanitize(form.zipcode),
    });
    setLoading(false);

    if (res.ok) {
      showSuccess("Registro exitoso. Verifica tu correo.");
      router.push("/auth/login");
    } else {
      showError(res.message || "Fallo en el registro");
    }
  };

  const isNit = Number(form.typeid || 0) === 4;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-black font-sans overflow-x-hidden">
      <Nav />

      <div className="flex flex-col lg:flex-row flex-1 px-6 lg:px-20 items-center justify-center gap-16 py-12 max-w-7xl mx-auto w-full">
        {/* Lado Izquierdo: Formulario */}
        <div className="w-full lg:w-[60%] flex flex-col">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-[2px] bg-red-600"></span>
              <span className="text-red-600 font-bold tracking-[0.3em] text-[10px] uppercase">
                Nuevo Usuario
              </span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tighter mb-4 leading-none">
              CREAR <br /> <span className="text-red-600">CUENTA.</span>
            </h2>
            <p className="text-gray-400 font-light text-sm max-w-sm">
              Únete a Sistemas PC para gestionar tus requerimientos tecnológicos
              de manera profesional.
            </p>
          </div>

          <form
            noValidate
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8"
          >
            {/* Tipo de Documento */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Documento
              </label>
              <select
                name="typeid"
                value={form.typeid}
                onChange={onChange}
                onBlur={onBlur}
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all appearance-none cursor-pointer ${
                  touched.typeid && errors.typeid
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
              >
                <option value="">Seleccionar Tipo...</option>
                {documentTypes.map((t: any) => (
                  <option key={t.typeofdocumentid} value={t.typeofdocumentid}>
                    {t.name}
                  </option>
                ))}
              </select>
              {touched.typeid && errors.typeid && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.typeid}
                </p>
              )}
            </div>

            {/* Número */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Identificación
              </label>
              <input
                name="documentnumber"
                value={form.documentnumber}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Número de identificación"
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all ${
                  touched.documentnumber && errors.documentnumber
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
              />
              {checking.documentnumber && (
                <p className="absolute -bottom-5 text-[9px] text-gray-400 animate-pulse uppercase">
                  Validando...
                </p>
              )}
              {touched.documentnumber && errors.documentnumber && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.documentnumber}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                {isNit ? "Razón Social" : "Nombres"}
              </label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={
                  isNit ? "Nombre de la empresa" : "Ingresa tus nombres"
                }
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all ${
                  touched.name && errors.name
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
              />
              {touched.name && errors.name && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Apellido */}
            <div className="relative">
              <label
                className={`text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1 ${
                  isNit ? "opacity-30" : ""
                }`}
              >
                Apellidos
              </label>
              <input
                name="lastname"
                value={form.lastname}
                onChange={onChange}
                onBlur={onBlur}
                disabled={isNit}
                placeholder={
                  isNit ? "N/A para empresas" : "Ingresa tus apellidos"
                }
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all ${
                  touched.lastname && errors.lastname
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                } ${isNit ? "opacity-30 italic" : ""}`}
              />
              {touched.lastname && errors.lastname && !isNit && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.lastname}
                </p>
              )}
            </div>

            {/* Telefono */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Contacto Telefónico
              </label>
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Ej: 3001234567"
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all ${
                  touched.phone && errors.phone
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
              />
              {checking.phone && (
                <p className="absolute -bottom-5 text-[9px] text-gray-400 animate-pulse uppercase">
                  Validando...
                </p>
              )}
              {touched.phone && errors.phone && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Dirección Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="usuario@dominio.com"
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all ${
                  touched.email && errors.email
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
              />
              {checking.email && (
                <p className="absolute -bottom-5 text-[9px] text-gray-400 animate-pulse uppercase">
                  Validando...
                </p>
              )}
              {touched.email && errors.email && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Ciudad (CO) */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Ubicación / Ciudad
              </label>
              <input
                name="city"
                value={form.city}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Ciudad de residencia"
                list="colombia-cities"
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all ${
                  touched.city && errors.city
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
              />
              {touched.city && errors.city && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.city}
                </p>
              )}
            </div>

            <datalist id="colombia-cities">
              {COLOMBIA_CITY_NAMES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>

            {/* Código Postal */}
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Código Postal
              </label>
              <input
                name="zipcode"
                value={form.zipcode}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="Zip Code"
                className={`w-full h-12 bg-transparent border-b-2 outline-none transition-all ${
                  touched.zipcode && errors.zipcode
                    ? "border-red-600"
                    : "border-gray-100 focus:border-red-600"
                }`}
              />
              {touched.zipcode && errors.zipcode && (
                <p className="absolute -bottom-5 text-[9px] font-bold text-red-600 uppercase tracking-tighter italic">
                  {errors.zipcode}
                </p>
              )}
            </div>

            {/* Botón de Envío */}
            <div className="md:col-span-2 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer group relative w-full h-14 bg-black overflow-hidden transition-all duration-500 shadow-xl"
              >
                <div
                  className={`absolute inset-0 bg-red-600 transition-transform duration-500 translate-y-full group-hover:translate-y-0 ${
                    loading ? "translate-y-0" : ""
                  }`}
                ></div>
                <span className="relative z-10 text-white font-black uppercase tracking-[0.3em] text-xs">
                  {loading ? "PROCESANDO REGISTRO..." : "CREAR CUENTA "}
                </span>
              </button>

              <p className="text-[10px] text-center text-gray-400 mt-6 font-bold uppercase tracking-widest">
                ¿YA TIENES UNA CUENTA?{" "}
                <a
                  href="/auth/login"
                  className="text-black hover:text-red-600 transition-colors underline underline-offset-4 decoration-2"
                >
                  INICIAR SESIÓN
                </a>
              </p>
            </div>
          </form>
        </div>

        {/* Lado Derecho: Branding Gráfico */}
        <div className="hidden lg:flex lg:w-[35%] justify-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[90%] border-l border-r border-gray-100 z-0"></div>
          <div className="relative z-10 grayscale hover:grayscale-0 transition-all duration-1000">
            <Image
              src="/assets/imgs/previewSinFondo.png"
              alt="Sistemas PC Registration Hero"
              width={450}
              height={450}
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 right-10 hidden md:block">
        <p className="text-[8px] font-black text-gray-300 uppercase tracking-[0.5em] rotate-90 origin-right">
          SISTEMAS PC — INFRASTRUCTURE FIRST
        </p>
      </div>
    </div>
  );
}
