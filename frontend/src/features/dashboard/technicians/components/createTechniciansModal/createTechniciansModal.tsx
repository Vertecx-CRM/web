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
  const [previewImagen, setPreviewImagen] = useState<string | undefined>(
    undefined
  );
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [mostrarConfirmarContraseña, setMostrarConfirmarContraseña] =
    useState(false);
  const [errors, setErrors] = useState<TechnicianErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCircleClick = () => fileInputRef.current?.click();

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
    setPreviewImagen(undefined);
    setMostrarContraseña(false);
    setMostrarConfirmarContraseña(false);
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const handleFieldChange = (field: keyof TechnicianErrors, rawValue: string) => {
    let value = rawValue;
    const hasDigits = /\d/.test(rawValue);
    if (field === "name" || field === "lastName") value = rawValue.replace(/\d/g, "");
    if (field === "phone") value = rawValue.replace(/\D/g, "");
    if (field === "documentNumber") {
      if (tipoDocumento === "PPT" || tipoDocumento === "Pasaporte") {
        value = rawValue.replace(/[^a-zA-Z0-9]/g, "");
      } else {
        value = rawValue.replace(/\D/g, "");
      }
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
      case "name": setNombre(value); break;
      case "lastName": setApellido(value); break;
      case "password": setContraseña(value); break;
      case "confirmPassword": setConfirmarContraseña(value); break;
      case "documentNumber": setNumeroDocumento(value); break;
      case "phone": setTelefono(value); break;
      case "email": setCorreo(value); break;
    }

    const extra = { password: field === "password" ? value : contraseña, documentType: tipoDocumento };
    let fieldError = validateTechnicianField(field as any, value, technicians, extra);

    if ((field === "name" || field === "lastName") && hasDigits) {
      fieldError = field === "name"
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

  const handleFileChange = (file: File | null) => {
    setImagen(file);
    setPreviewImagen(file ? URL.createObjectURL(file) : undefined);
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

    if (Object.keys(formErrors).length > 0) {
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
            className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1 overflow-hidden relative"
            onClick={handleCircleClick}
            style={{ borderColor: Colors.table.lines }}
          >
            {previewImagen ? (
              <img src={previewImagen} alt="Técnico" className="w-full h-full object-cover rounded-full" />
            ) : imagen ? (
              <img src={imagen ? URL.createObjectURL(imagen) : ""} alt="Técnico" className="w-full h-full object-cover rounded-full" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
          </div>

          {imagen && (
            <div className="flex flex-col items-center space-y-1">
              {imagen?.name && (
                <div className="text-xs text-green-600 font-medium">{imagen.name}</div>
              )}
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
            Haga clic en el círculo para {imagen ? "cambiar" : "seleccionar"} la imagen
          </div>
        </div>

        {/* Campos */}
        {(
          ["name","lastName","password","confirmPassword","documentType","documentNumber","phone","email"] as (keyof TechnicianErrors)[]
        ).map((field) => {
          const valueMap: Record<string, string> = {
            name: nombre,
            lastName: apellido,
            password: contraseña,
            confirmPassword: confirmarContraseña,
            documentType: tipoDocumento,
            documentNumber: numeroDocumento,
            phone: telefono,
            email: correo,
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

          const placeholderMap: Record<string, string> = {
            name: "Ingrese nombre *",
            lastName: "Ingrese apellido *",
            password: "Ingrese contraseña *",
            confirmPassword: "Confirme contraseña *",
            documentNumber: "Ingrese número de documento *",
            phone: "Ingrese teléfono *",
            email: "Ingrese correo electrónico *",
          };

          const labelMap: Record<string, string> = {
            name: "Nombre",
            lastName: "Apellido",
            password: "Contraseña",
            confirmPassword: "Confirmar contraseña",
            documentType: "Tipo de Documento",
            documentNumber: "Número de Documento",
            phone: "Teléfono",
            email: "Correo electrónico",
          };

          return (
            <div key={field} className="relative">
              <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>
                {labelMap[field]} <span className="text-red-500">*</span>
              </label>

              {field === "documentType" ? (
                <select
                  value={tipoDocumento}
                  onChange={(e) => handleFieldChange("documentType", e.target.value)}
                  onBlur={() => handleFieldChange("documentType", tipoDocumento)}
                  className="w-full px-2 py-1 border rounded-md"
                  style={{ borderColor: errors.documentType ? "red" : Colors.table.lines }}
                >
                  {documentTypes.map((doc) => (
                    <option key={doc} value={doc}>{doc}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={typeMap[field]}
                  placeholder={placeholderMap[field]}
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
                  onClick={() =>
                    field === "password"
                      ? setMostrarContraseña((s) => !s)
                      : setMostrarConfirmarContraseña((s) => !s)
                  }
                  className="absolute inset-y-0 right-2 my-auto h-8 w-8 rounded-md text-gray-500 hover:bg-gray-200"
                >
                  {field === "password"
                    ? (mostrarContraseña
                      ? <img src="/icons/Eye.svg" className="h-4 w-4" />
                      : <img src="/icons/eye-off.svg" className="h-4 w-4" />)
                    : (mostrarConfirmarContraseña
                      ? <img src="/icons/Eye.svg" className="h-4 w-4" />
                      : <img src="/icons/eye-off.svg" className="h-4 w-4" />)}
                </button>
              )}

              {errors[field] && (
                <span className="text-xs text-red-500">{errors[field]}</span>
              )}
            </div>
          );
        })}

        {/* Botones */}
        <div className="col-span-2 flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={() => { resetForm(); onClose(); }}
            className="px-4 py-2 rounded-md font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors text-sm"
            style={{
              backgroundColor: Colors.buttons.tertiary,
              color: Colors.texts.quaternary,
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md font-medium text-white text-sm"
            style={{
              backgroundColor: Colors.buttons.quaternary,
              color: Colors.texts.quaternary,
            }}
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTechnicianModal;
