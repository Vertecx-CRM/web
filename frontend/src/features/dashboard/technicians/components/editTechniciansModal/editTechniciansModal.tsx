// src/features/dashboard/technicians/components/editTechniciansModal/editTechniciansModal.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import {
  Technician,
  DocumentType,
  EditTechnicianData,
  TechnicianState,
} from "../../types/typesTechnicians";

interface EditTechnicianModalProps {
  isOpen: boolean;
  technician: Technician;
  onClose: () => void;
  onUpdate: (data: EditTechnicianData) => void;
}

const documentTypes: DocumentType[] = ["CC", "CE", "TI", "Pasaporte", "PPT", "PEP", "Otro"];

const states: TechnicianState[] = ["Activo", "Inactivo"];

const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({
  isOpen,
  technician,
  onClose,
  onUpdate,
}) => {
  const [name, setName] = useState(technician.name);
  const [lastName, setLastName] = useState(technician.lastName);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>(
    technician.documentType
  );
  const [documentNumber, setDocumentNumber] = useState(
    technician.documentNumber
  );
  const [phone, setPhone] = useState(technician.phone);
  const [email, setEmail] = useState(technician.email);
  const [state, setState] = useState<TechnicianState>(
    technician.state ?? "Activo"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(
    technician.image
  );

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
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen, technician]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastName || !documentNumber || !phone || !email) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }
    if (password && password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    const updatedData: EditTechnicianData = {
      id: technician.id,
      name,
      lastName,
      documentType,
      documentNumber,
      phone,
      email,
      state,
      password: password || undefined,
      confirmPassword: confirmPassword || undefined,
      image: imageFile ? URL.createObjectURL(imageFile) : previewImage,
    };

    onUpdate(updatedData);
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4 sm:p-0">
      <div className="bg-white p-3 rounded-lg shadow-lg w-full max-w-2xl relative z-50 mx-auto">
        <button onClick={onClose} className="absolute top-2 right-2 z-10">
          <img src="/icons/X.svg" alt="Cerrar" className="w-5 h-5" />
        </button>

        <div className="text-black font-semibold text-2xl text-center mb-3">
          Editar Técnico
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3 p-1">
          {/* Imagen */}
          <div className="col-span-2 flex flex-col items-center mb-3">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);
                if (file) setPreviewImage(URL.createObjectURL(file));
              }}
            />
            <div
              className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer mb-1"
              onClick={handleCircleClick}
              style={{ borderColor: Colors.table.lines }}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Técnico"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              )}
            </div>
            <div className="text-center text-xs text-gray-500 mb-1">
              Haga clic en el círculo para{" "}
              {previewImage ? "cambiar" : "seleccionar"} la imagen
            </div>
            {previewImage && (
              <div className="flex flex-col items-center space-y-1">
                <div className="text-xs text-green-600 font-medium">
                  {imageFile?.name ?? "Imagen actual"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreviewImage(undefined);
                  }}
                  className="text-red-500 text-xs hover:text-red-700 px-2 py-1 border border-red-200 rounded-md"
                  style={{ borderColor: Colors.states.nullable }}
                >
                  Eliminar imagen
                </button>
              </div>
            )}
          </div>

          {/* Campos */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Apellido
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingrese nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Confirmar Contraseña
            </label>
            <input
              type="password"
              placeholder="Confirme contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Tipo de Documento
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            >
              {documentTypes.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Número de Documento
            </label>
            <input
              type="text"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Teléfono
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>

          {/* Nuevo campo: Estado */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: Colors.texts.primary }}
            >
              Estado
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value as TechnicianState)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            >
              {states.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="col-span-2 flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
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
      </div>
    </div>,
    document.body
  );
};

export default EditTechnicianModal;
