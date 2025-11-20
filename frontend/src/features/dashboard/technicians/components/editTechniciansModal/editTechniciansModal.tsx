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
import { Upload, X } from "lucide-react";

type TechnicianField =
  | "documentType"
  | "documentNumber"
  | "name"
  | "lastName"
  | "phone"
  | "email"
  | "types"
  | "resumePdf";

const documentTypes: DocumentType[] = ["CC", "CE", "TI", "Pasaporte", "PPT", "PEP", "Otro"];
const states: TechnicianState[] = ["Activo", "Inactivo"];
const TECH_TYPES = ["Cableado estructurado", "Electricista", "Redes"];

const removeBtnClass =
  "text-xs text-red-500 border border-red-300 rounded-md px-2 py-1 hover:bg-red-50 hover:text-red-700 flex items-center gap-1";

function fileNameFromUrl(u?: string) {
  if (!u) return "";
  try {
    const url = new URL(u);
    const last = url.pathname.split("/").filter(Boolean).pop() || "";
    return decodeURIComponent(last);
  } catch {
    const parts = u.split("?")[0].split("/").filter(Boolean);
    return decodeURIComponent(parts.pop() || "");
  }
}

interface EditTechnicianModalProps {
  isOpen: boolean;
  technician: Technician;
  technicians: Technician[];
  onClose: () => void;
  onUpdate: (data: EditTechnicianData) => void;
}

const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({
  isOpen,
  technician,
  technicians,
  onClose,
  onUpdate,
}) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("CC");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<TechnicianState>("Activo");

  const [types, setTypes] = useState<string[]>([]);
  const [resumePdf, setResumePdf] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string>("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Partial<TechnicianErrors>>({});
  const [imageError, setImageError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName(technician.name);
    setLastName(technician.lastName);
    setDocumentType(technician.documentType);
    setDocumentNumber(technician.documentNumber);
    setPhone(technician.phone);
    setEmail(technician.email);
    setState(technician.state ?? "Activo");

    setTypes(technician.types ?? []);

    setResumePdf(null);
    setResumeName(fileNameFromUrl(technician.resumeUrl));
    setPdfError(null);

    setImageFile(null);
    setPreviewImage(technician.image);

    setErrors({});
    setImageError(null);
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, technician]);

  const handleFieldChange = (field: TechnicianField, rawValue: any) => {
    let value = rawValue;
    const hasDigits = typeof rawValue === "string" && /\d/.test(rawValue);

    if (field === "name" || field === "lastName") value = String(rawValue).replace(/\d/g, "");
    if (field === "phone") value = String(rawValue).replace(/\D/g, "");
    if (field === "documentNumber") {
      value =
        documentType === "PPT" || documentType === "Pasaporte"
          ? String(rawValue).replace(/[^a-zA-Z0-9]/g, "")
          : String(rawValue).replace(/\D/g, "");
    }

    if (field === "documentType") {
      const dt = rawValue as DocumentType;
      setDocumentType(dt);
      const numError = validateTechnicianField(
        "documentNumber",
        documentNumber,
        technicians,
        { documentType: dt, excludeId: technician.id }
      );
      setErrors((prev) => ({ ...prev, documentNumber: numError }));
      const docTypeError = validateTechnicianField("documentType", dt, technicians, {
        documentType: dt,
        excludeId: technician.id,
      });
      setErrors((prev) => ({ ...prev, documentType: docTypeError }));
      return;
    }

    switch (field) {
      case "name":
        setName(value);
        break;
      case "lastName":
        setLastName(value);
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
      case "types":
        setTypes(value as string[]);
        break;
      case "resumePdf":
        setResumePdf(value as File | null);
        break;
    }

    const extra = { documentType, excludeId: technician.id };
    let fieldError = validateTechnicianField(field as any, value, technicians, extra);

    if ((field === "name" || field === "lastName") && hasDigits) {
      fieldError = field === "name" ? "El nombre no puede contener números" : "El apellido no puede contener números";
    }
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const handleToggleType = (option: string) => {
    setTypes((prev) => (prev.includes(option) ? prev.filter((t) => t !== option) : [...prev, option]));
    setTimeout(() => {
      const next = types.includes(option) ? types.filter((t) => t !== option) : [...types, option];
      handleFieldChange("types", next);
    }, 0);
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
        setImageFile(null);
        setPreviewImage(undefined);
        return;
      }
    }
    setImageError(null);
    setImageFile(file);
    setPreviewImage(file ? URL.createObjectURL(file) : technician.image);
  };

  const handlePdfChange = (file: File | null) => {
    if (!file) {
      setResumePdf(null);
      setResumeName(fileNameFromUrl(technician.resumeUrl));
      setPdfError(null);
      setErrors((p) => ({ ...p, resumePdf: undefined }));
      return;
    }
    if (file.type !== "application/pdf") {
      const msg = "El archivo debe ser un PDF";
      setPdfError(msg);
      setErrors((p) => ({ ...p, resumePdf: msg }));
      setResumePdf(null);
      setResumeName(fileNameFromUrl(technician.resumeUrl));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      const msg = "El PDF no debe superar 10MB";
      setPdfError(msg);
      setErrors((p) => ({ ...p, resumePdf: msg }));
      setResumePdf(null);
      setResumeName(fileNameFromUrl(technician.resumeUrl));
      return;
    }
    setPdfError(null);
    setErrors((p) => ({ ...p, resumePdf: undefined }));
    setResumePdf(file);
    setResumeName(file.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedData: EditTechnicianData = {
      id: technician.id,
      name,
      lastName,
      documentType,
      documentNumber,
      phone,
      email,
      state,
      image: imageFile || undefined,
      types,
      resumePdf: resumePdf ?? undefined,
    };

    const formErrors = validateTechnicianForm(updatedData, technicians, {
      excludeId: technician.id,
      requirePdf: false,
      hasExistingResume: Boolean(technician.resumeUrl),
    });
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0 || imageError || pdfError) {
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
      <form id="edit-technician-form" onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 grid grid-cols-2 gap-3 p-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              value={documentType}
              onChange={(e) => handleFieldChange("documentType", e.target.value)}
              className="w-full px-2 py-1 border rounded-md"
              style={{ borderColor: errors.documentType ? "red" : Colors.table.lines }}
            >
              {documentTypes.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
            {errors.documentType && <p className="mt-1 text-xs text-red-600">{errors.documentType}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Número de Documento <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => handleFieldChange("documentNumber", e.target.value)}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: errors.documentNumber ? "red" : Colors.table.lines }}
            />
            {errors.documentNumber && <p className="mt-1 text-xs text-red-600">{errors.documentNumber}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: errors.name ? "red" : Colors.table.lines }}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: errors.lastName ? "red" : Colors.table.lines }}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Teléfono <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: errors.phone ? "red" : Colors.table.lines }}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: errors.email ? "red" : Colors.table.lines }}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Estado
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as TechnicianState)}
              className="w-full px-2 py-1 border rounded-md"
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Tipos de técnico <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TECH_TYPES.map((opt) => {
                const active = types.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleToggleType(opt)}
                    className={`px-3 py-1 rounded-full border text-sm transition ${
                      active ? "bg-red-600 text-white border-red-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {errors.types && <p className="mt-1 text-xs text-red-600">{errors.types}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Hoja de vida (PDF)
            </label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="flex h-10 min-w-10 max-w-[260px] items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-700 cursor-pointer hover:bg-gray-100 px-2"
                title={resumeName || "Subir PDF"}
              >
                {resumePdf ? (
                  <span className="text-xs truncate w-full">{resumeName}</span>
                ) : resumeName ? (
                  <span className="text-xs truncate w-full">{resumeName} (actual)</span>
                ) : (
                  <Upload size={16} />
                )}
              </div>
              {resumePdf && (
                <button type="button" onClick={() => handlePdfChange(null)} className={removeBtnClass}>
                  <X size={14} /> Eliminar
                </button>
              )}
              <input
                ref={pdfInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => handlePdfChange(e.target.files?.[0] ?? null)}
              />
            </div>
            {(pdfError || errors.resumePdf) && (
              <p className="mt-1 text-xs text-red-600">{pdfError || errors.resumePdf}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
              Imagen
            </label>
            <div className="mt-1 flex items-center gap-2">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-gray-500 text-gray-600 cursor-pointer overflow-hidden"
              >
                {previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewImage} alt="preview" className="h-full w-full object-cover" />
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
            {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default EditTechnicianModal;
