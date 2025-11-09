"use client";

import React, { useRef, useState, useEffect } from "react";
import Modal from "@/features/dashboard/components/Modal";
import Colors from "@/shared/theme/colors";
import {
  Technician,
  DocumentType,
  EditTechnicianData,
  TechnicianState,
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

interface EditTechnicianModalProps {
  isOpen: boolean;
  technician: Technician;
  technicians: Technician[];
  onClose: () => void;
  onUpdate: (data: EditTechnicianData) => void;
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
const states: TechnicianState[] = ["Activo", "Inactivo"];

const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({
  isOpen,
  technician,
  technicians,
  onClose,
  onUpdate,
}) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<TechnicianState>("Activo");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    undefined
  );
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] =
    useState(false);
  const [errors, setErrors] = useState<Partial<TechnicianErrors>>({});
  const [imageError, setImageError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName(technician.name);
    setLastName(technician.lastName);
    setPassword("");
    setConfirmPassword("");
    setDocumentType(technician.documentType);
    setDocumentNumber(technician.documentNumber);
    setPhone(technician.phone);
    setEmail(technician.email);
    setState(technician.state ?? "Activo");
    setImageFile(null);
    setPreviewImage(technician.image);
    setMostrarContraseña(false);
    setMostrarConfirmarContraseña(false);
    setErrors({});
    setImageError(null);
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, technician]);

  const handleFieldChange = (field: TechnicianField, rawValue: string) => {
    let value = rawValue;
    const hasDigits = /\d/.test(rawValue);

    if (field === "name" || field === "lastName")
      value = rawValue.replace(/\d/g, "");
    if (field === "phone") value = rawValue.replace(/\D/g, "");
    if (field === "documentNumber") {
      value =
        documentType === "PPT" || documentType === "Pasaporte"
          ? rawValue.replace(/[^a-zA-Z0-9]/g, "")
          : rawValue.replace(/\D/g, "");
    }

    if (field === "documentType") {
      const dt = rawValue as DocumentType;
      setDocumentType(dt);
      const numError = validateTechnicianField(
        "documentNumber",
        documentNumber,
        technicians,
        { password, documentType: dt, excludeId: technician.id }
      );
      setErrors((prev) => ({ ...prev, documentNumber: numError }));
      return;
    }

    switch (field) {
      case "name":
        setName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      case "documentNumber":
        setDocumentNumber(value);
        break;
      case "phone":
        setPhone(value);
        break;
      case "email":
        setEmail(value);
        break;
    }

    const extra = { password, documentType, excludeId: technician.id };
    let fieldError = validateTechnicianField(field, value, technicians, extra);

    if ((field === "name" || field === "lastName") && hasDigits) {
      fieldError =
        field === "name"
          ? "El nombre no puede contener números"
          : "El apellido no puede contener números";
    }

    setErrors((prev) => ({ ...prev, [field]: fieldError }));

    if (field === "password" || field === "confirmPassword") {
      const confVal = field === "confirmPassword" ? value : confirmPassword;
      const confError = validateTechnicianField(
        "confirmPassword",
        confVal,
        technicians,
        { password: field === "password" ? value : password }
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confError }));
    }
  };

  const validateImage = (file: File | null) => {
    if (!file) return null;
    if (!file.type.startsWith("image/"))
      return "El archivo debe ser una imagen";
    if (file.size > 2 * 1024 * 1024) return "La imagen no debe superar 2MB";
    return null;
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const err = validateImage(file);
      if (err) {
        setImageError(err);
        setImageFile(null);
        setPreviewImage(undefined);
        return;
      }
    }
    setImageError(null);
    setImageFile(file);
    setPreviewImage(file ? URL.createObjectURL(file) : undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: EditTechnicianData = {
      id: technician.id,
      name,
      lastName,
      password: password || undefined,
      confirmPassword: confirmPassword || undefined,
      documentType,
      documentNumber,
      phone,
      email,
      state,
      image: imageFile ? URL.createObjectURL(imageFile) : previewImage,
    };

    const formErrors = validateTechnicianForm(
      updatedData,
      technicians,
      technician.id
    );
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0 || imageError) {
      showWarning("Por favor completa los campos obligatorios correctamente");
      return;
    }

    onUpdate(updatedData);
    resetForm();
    onClose();
  };

  return (
    <Modal
      title="Editar Técnico"
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
            form="edit-technician-form"
            className="cursor-pointer transition duration-300 hover:bg-black hover:text-white hover:scale-105 px-4 py-2 rounded-lg bg-black text-white w-full sm:w-auto"
          >
            Guardar
          </button>
        </div>
      }
    >
      <form
        id="edit-technician-form"
        onSubmit={handleSubmit}
        className="flex flex-col h-full"
      >
        <div className="flex-1 grid grid-cols-2 gap-3 p-1 overflow-y-auto max-h-[calc(100vh-250px)]">
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
              name,
              lastName,
              password,
              confirmPassword,
              documentType,
              documentNumber,
              phone,
              email,
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
                    value={documentType}
                    onChange={(e) =>
                      handleFieldChange("documentType", e.target.value)
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
                      value={valueMap[field]}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
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

          {/* Estado */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Estado <span className="text-red-500">*</span>
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as TechnicianState)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: Colors.table.lines }}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div>
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
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload size={16} />
                )}
              </div>
              {previewImage && (
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

export default EditTechnicianModal;
