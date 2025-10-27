"use client";

import React, { useRef, useState, useEffect } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import {
  DocumentType,
  CreateTechnicianData,
  Technician,
} from "../../types/typesTechnicians";
import {
  validateTechnicianField,
  validateTechnicianForm,
  TechnicianErrors,
} from "@/features/dashboard/technicians/validations/techniciansValidations";
import { showWarning } from "@/shared/utils/notifications";
import { Upload } from "lucide-react";

type TechnicianField =
  | "documentType"
  | "documentNumber"
  | "name"
  | "lastName"
  | "phone"
  | "email"
  | "password"
  | "confirmPassword";

interface CreateTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTechnicianData) => void;
  technicians: Technician[];
}

const documentTypes: DocumentType[] = [
  "CC",
  "CE",
  "TI",
  "Pasaporte",
  "PPT",
  "PEP",
  "Otro",
];

const CreateTechnicianModal: React.FC<CreateTechnicianModalProps> = ({
  isOpen,
  onClose,
  onSave,
  technicians,
}) => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<DocumentType>("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewImagen, setPreviewImagen] = useState<string | null>(null);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] =
    useState(false);
  const [errors, setErrors] = useState<Partial<TechnicianErrors>>({});
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNombre("");
    setApellido("");
    setContraseña("");
    setConfirmarContraseña("");
    setTipoDocumento("CC");
    setNumeroDocumento("");
    setTelefono("");
    setCorreo("");
    setImagen(null);
    setPreviewImagen(null);
    setMostrarContraseña(false);
    setMostrarConfirmarContraseña(false);
    setErrors({});
    setImageError(null);
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const handleFieldChange = (field: TechnicianField, rawValue: string) => {
    let value = rawValue;
    const hasDigits = /\d/.test(rawValue);

    if (field === "name" || field === "lastName")
      value = rawValue.replace(/\d/g, "");
    if (field === "phone") value = rawValue.replace(/\D/g, "");
    if (field === "documentNumber") {
      value =
        tipoDocumento === "PPT" || tipoDocumento === "Pasaporte"
          ? rawValue.replace(/[^a-zA-Z0-9]/g, "")
          : rawValue.replace(/\D/g, "");
    }

    if (field === "documentType") {
      const dt = rawValue as DocumentType;
      setTipoDocumento(dt);
      const numError = validateTechnicianField(
        "documentNumber",
        numeroDocumento,
        technicians,
        { password: contraseña, documentType: dt }
      );
      setErrors((prev) => ({ ...prev, documentNumber: numError }));
      const docTypeError = validateTechnicianField(
        "documentType",
        dt,
        technicians,
        { password: contraseña, documentType: dt }
      );
      setErrors((prev) => ({ ...prev, documentType: docTypeError }));
      return;
    }

    switch (field) {
      case "name":
        setNombre(value);
        break;
      case "lastName":
        setApellido(value);
        break;
      case "password":
        setContraseña(value);
        break;
      case "confirmPassword":
        setConfirmarContraseña(value);
        break;
      case "documentNumber":
        setNumeroDocumento(value);
        break;
      case "phone":
        setTelefono(value);
        break;
      case "email":
        setCorreo(value);
        break;
    }

    const extra = {
      password: field === "password" ? value : contraseña,
      documentType: tipoDocumento,
    };
    let fieldError = validateTechnicianField(field, value, technicians, extra);

    if ((field === "name" || field === "lastName") && hasDigits) {
      fieldError =
        field === "name"
          ? "El nombre no puede contener números"
          : "El apellido no puede contener números";
    }

    setErrors((prev) => ({ ...prev, [field]: fieldError }));

    if (field === "password" || field === "confirmPassword") {
      const confVal = field === "confirmPassword" ? value : confirmarContraseña;
      const confError = validateTechnicianField(
        "confirmPassword",
        confVal,
        technicians,
        { password: field === "password" ? value : contraseña }
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confError }));
    }

    if (field === "documentNumber") {
      const numError = validateTechnicianField(
        "documentNumber",
        value,
        technicians,
        { password: contraseña, documentType: tipoDocumento }
      );
      setErrors((prev) => ({ ...prev, documentNumber: numError }));
    }
  };

  const validateImage = (file: File | null) => {
    if (!file) return null;
    if (!file.type.startsWith("image/")) return "El archivo debe ser una imagen";
    if (file.size > 2 * 1024 * 1024) return "La imagen no debe superar 2MB";
    return null;
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const err = validateImage(file);
      if (err) {
        setImageError(err);
        setImagen(null);
        setPreviewImagen(null);
        return;
      }
    }
    setImageError(null);
    setImagen(file);
    setPreviewImagen(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: CreateTechnicianData = {
      name: nombre,
      lastName: apellido,
      password: contraseña,
      confirmPassword: confirmarContraseña,
      documentType: tipoDocumento,
      documentNumber: numeroDocumento,
      phone: telefono,
      email: correo,
      image: imagen ? URL.createObjectURL(imagen) : undefined,
      state: "Activo",
    };

    const formErrors = validateTechnicianForm(formData, technicians);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0 || imageError) {
      showWarning("Por favor completa los campos obligatorios correctamente");
      return;
    }

    onSave(formData);
    resetForm();
    onClose();
  };

  return (
    <Modal
      title="Crear Técnico"
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      footer={
        <div className="flex justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer transition duration-300 hover:bg-gray-200 hover:text-black hover:scale-105 px-4 py-2 rounded-lg bg-gray-300 text-black w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-technician-form"
            className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
          >
            Guardar
          </button>
        </div>
      }
    >
      <form
        id="create-technician-form"
        onSubmit={handleSubmit}
        className="flex flex-col h-full"
      >
        <div className="flex-1 grid grid-cols-2 gap-3 p-1">
          {(
            [
              "documentType",
              "documentNumber",
              "name",
              "lastName",
              "phone",
              "email",
              "password",
              "confirmPassword",
            ] as TechnicianField[]
          ).map((field) => {
            const valueMap: Record<TechnicianField, string> = {
              name: nombre ?? "",
              lastName: apellido ?? "",
              password: contraseña ?? "",
              confirmPassword: confirmarContraseña ?? "",
              documentType: tipoDocumento ?? "",
              documentNumber: numeroDocumento ?? "",
              phone: telefono ?? "",
              email: correo ?? "",
            };

            const typeMap: Record<TechnicianField, string> = {
              name: "text",
              lastName: "text",
              password: mostrarContraseña ? "text" : "password",
              confirmPassword: mostrarConfirmarContraseña ? "text" : "password",
              documentType: "select",
              documentNumber: "text",
              phone: "text",
              email: "email",
            };

            const placeholderMap: Record<TechnicianField, string> = {
              name: "Ingrese nombre",
              lastName: "Ingrese apellido",
              password: "Ingrese contraseña",
              confirmPassword: "Confirme contraseña",
              documentType: "",
              documentNumber: "Número de documento",
              phone: "Ingrese teléfono",
              email: "Correo@gmail.com",
            };

            const labelMap: Record<TechnicianField, string> = {
              documentType: "Tipo de Documento",
              documentNumber: "Número de Documento",
              name: "Nombre",
              lastName: "Apellido",
              phone: "Teléfono",
              email: "Correo electrónico",
              password: "Contraseña",
              confirmPassword: "Confirmar contraseña",
            };

            return (
              <div key={field} className="relative">
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: Colors.texts.primary }}
                >
                  {labelMap[field]}{" "}
                  {field !== "documentType" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>

                {field === "documentType" ? (
                  <select
                    value={tipoDocumento}
                    onChange={(e) =>
                      handleFieldChange("documentType", e.target.value)
                    }
                    onBlur={() =>
                      handleFieldChange("documentType", tipoDocumento)
                    }
                    className="w-full px-2 py-1 border rounded-md"
                    style={{
                      borderColor: errors.documentType
                        ? "red"
                        : Colors.table.lines,
                    }}
                  >
                    {documentTypes.map((doc) => (
                      <option key={doc} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="relative w-full">
                    <input
                      type={typeMap[field]}
                      placeholder={placeholderMap[field]}
                      value={valueMap[field]}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      onBlur={() => handleFieldChange(field, valueMap[field])}
                      className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                      style={{
                        borderColor: errors[field]
                          ? "red"
                          : Colors.table.lines,
                      }}
                    />

                    {(field === "password" ||
                      field === "confirmPassword") && (
                      <button
                        type="button"
                        onClick={() =>
                          field === "password"
                            ? setMostrarContraseña((s) => !s)
                            : setMostrarConfirmarContraseña((s) => !s)
                        }
                        className="absolute inset-y-0 right-2 my-auto flex items-center text-gray-500 hover:bg-gray-200 p-1 rounded-md"
                      >
                        {field === "password"
                          ? mostrarContraseña
                            ? (
                              <img
                                src="/icons/Eye.svg"
                                alt="Ocultar contraseña"
                                className="h-4 w-4"
                              />
                            )
                            : (
                              <img
                                src="/icons/eye-off.svg"
                                alt="Mostrar contraseña"
                                className="h-4 w-4"
                              />
                            )
                          : mostrarConfirmarContraseña
                          ? (
                            <img
                              src="/icons/Eye.svg"
                              alt="Ocultar confirmación"
                              className="h-4 w-4"
                            />
                          )
                          : (
                            <img
                              src="/icons/eye-off.svg"
                              alt="Mostrar confirmación"
                              className="h-4 w-4"
                            />
                          )}
                      </button>
                    )}
                  </div>
                )}

                {errors[field] && (
                  <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
                )}
              </div>
            );
          })}

{/* Imagen */}
<div className="col-span-2">
  <label
    className="block text-sm font-medium mb-1"
    style={{ color: Colors.texts.primary }}
  >
    Imagen
  </label>
  <div className="mt-1 flex items-center gap-2">
    <div
      onClick={() => fileInputRef.current?.click()}
      className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-600 cursor-pointer overflow-hidden"
    >
      {previewImagen ? (
        <img
          src={previewImagen}
          alt="preview"
          className="h-full w-full object-cover"
        />
      ) : (
        <Upload size={16} />
      )}
    </div>
    {imagen && (
      <button
        type="button"
        onClick={() => handleFileChange(null)}
        className="text-xs text-red-500 border border-red-300 rounded-md px-2 py-1 hover:bg-red-50 hover:text-red-700"
      >
        Eliminar
      </button>
    )}
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
    />
  </div>
  {imageError && (
    <p className="mt-1 text-xs text-red-600">{imageError}</p>
  )}
</div>

        </div>
      </form>
    </Modal>
  );
};

export default CreateTechnicianModal;
