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

interface EditTechnicianModalProps {
  isOpen: boolean;
  technician: Technician;
  technicians: Technician[];
  onClose: () => void;
  onUpdate: (data: EditTechnicianData) => void;
}

const documentTypes: DocumentType[] = ["CC", "CE", "TI", "Pasaporte", "PPT", "PEP", "Otro"];
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
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] = useState(false);
  const [errors, setErrors] = useState<TechnicianErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCircleClick = () => fileInputRef.current?.click();

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
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, technician]);

  const handleFieldChange = (field: keyof TechnicianErrors, rawValue: string) => {
    let value = rawValue;
    const hasDigits = /\d/.test(rawValue);

    if (field === "name" || field === "lastName") value = rawValue.replace(/\d/g, "");
    if (field === "phone") value = rawValue.replace(/\D/g, "");
    if (field === "documentNumber") {
      if (documentType === "PPT" || documentType === "Pasaporte")
        value = rawValue.replace(/[^a-zA-Z0-9]/g, "");
      else value = rawValue.replace(/\D/g, "");
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
      const docTypeError = validateTechnicianField(
        "documentType",
        dt,
        technicians,
        { password, documentType: dt, excludeId: technician.id }
      );
      setErrors((prev) => ({ ...prev, documentType: docTypeError }));
      return;
    }

    switch (field) {
      case "name": setName(value); break;
      case "lastName": setLastName(value); break;
      case "password": setPassword(value); break;
      case "confirmPassword": setConfirmPassword(value); break;
      case "documentNumber": setDocumentNumber(value); break;
      case "phone": setPhone(value); break;
      case "email": setEmail(value); break;
    }

    const extra = { password: field === "password" ? value : password, documentType, excludeId: technician.id };
    let fieldError = validateTechnicianField(field as any, value, technicians, extra);

    if ((field === "name" || field === "lastName") && hasDigits) {
      fieldError = field === "name"
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

  const handleFileChange = (file: File | null) => {
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

    const formErrors = validateTechnicianForm(updatedData, technicians, technician.id);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
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
      footer={null}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 p-1">
        {/* Imagen */}
        <div className="col-span-2 flex flex-col items-center mb-3">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <div
            className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1 overflow-hidden"
            onClick={handleCircleClick}
            style={{ borderColor: Colors.table.lines }}
          >
            {previewImage ? (
              <img src={previewImage} alt="Técnico" className="w-full h-full object-cover rounded-full" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </div>
          {previewImage && (
            <div className="flex flex-col items-center space-y-1">
              <div className="text-xs text-green-600 font-medium">{imageFile?.name ?? "Imagen actual"}</div>
              <button
                type="button"
                onClick={() => handleFileChange(null)}
                className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                style={{ borderColor: Colors.states.nullable }}
              >
                Eliminar imagen
              </button>
            </div>
          )}
          <div className="text-center text-xs text-gray-500 mt-1">
            Haga clic en el círculo para {previewImage ? "cambiar" : "seleccionar"} la imagen
          </div>
        </div>

        {/* Campos */}
        {(["name","lastName","password","confirmPassword","documentType","documentNumber","phone","email"] as (keyof TechnicianErrors)[]).map((field) => {
          const valueMap: Record<string, string> = {
            name, lastName, password, confirmPassword, documentType, documentNumber, phone, email,
          };
          const typeMap: Record<string, string> = {
            name: "text",
            lastName: "text",
            password: mostrarContraseña ? "text" : "password",
            confirmPassword: mostrarConfirmarContraseña ? "text" : "password",
            documentType: "select",
            documentNumber: "text",
            phone: "text",
            email: "email",
          };
          const labelMap: Record<string, string> = {
            name: "Nombre", lastName: "Apellido", password: "Contraseña", confirmPassword: "Confirmar Contraseña",
            documentType: "Tipo de Documento", documentNumber: "Número de Documento", phone: "Teléfono", email: "Correo electrónico",
          };

          return (
            <div key={field} className="relative">
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                {labelMap[field]} <span className="text-red-500">*</span>
              </label>
              {field === "documentType" ? (
                <select
                  value={documentType}
                  onChange={(e) => handleFieldChange("documentType", e.target.value)}
                  onBlur={() => handleFieldChange("documentType", documentType)}
                  className="w-full px-2 py-1 border rounded-md"
                  style={{ borderColor: errors.documentType ? "red" : Colors.table.lines }}
                >
                  {documentTypes.map((doc) => <option key={doc} value={doc}>{doc}</option>)}
                </select>
              ) : (
                <input
                  type={typeMap[field]}
                  value={valueMap[field]}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onBlur={() => handleFieldChange(field, valueMap[field])}
                  className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
                  style={{ borderColor: errors[field] ? "red" : Colors.table.lines }}
                />
              )}
              {(field === "password" || field === "confirmPassword") && (
                <button
                  type="button"
                  onClick={() => field === "password"
                    ? setMostrarContraseña((s) => !s)
                    : setMostrarConfirmarContraseña((s) => !s)}
                  className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-md text-gray-500 hover:bg-gray-200"
                >
                  {field === "password"
                    ? mostrarContraseña
                      ? <img src="/icons/Eye.svg" className="h-4 w-4" />
                      : <img src="/icons/eye-off.svg" className="h-4 w-4" />
                    : mostrarConfirmarContraseña
                      ? <img src="/icons/Eye.svg" className="h-4 w-4" />
                      : <img src="/icons/eye-off.svg" className="h-4 w-4" />}
                </button>
              )}
              {errors[field] && <span className="text-xs text-red-500">{errors[field]}</span>}
            </div>
          );
        })}

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value as TechnicianState)}
            className="w-full px-2 py-1 border rounded-md"
            style={{ borderColor: Colors.table.lines }}
          >
            {states.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Botones */}
        <div className="col-span-2 flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors text-sm"
            style={{ backgroundColor: Colors.buttons.tertiary, color: Colors.texts.quaternary }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md font-medium text-white text-sm"
            style={{ backgroundColor: Colors.buttons.quaternary, color: Colors.texts.quaternary }}
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTechnicianModal;
