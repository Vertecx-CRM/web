"use client";

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Colors from "@/shared/theme/colors";
import { DocumentType, CreateTechnicianData } from "../../types/typesTechnicians";

interface CreateTechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTechnicianData) => void;
}

const documentTypes: DocumentType[] = [
  "Cédula de ciudadanía",
  "Cédula de extranjería",
  "Tarjeta de identidad",
  "Pasaporte",
  "Otro",
];

const CreateTechnicianModal: React.FC<CreateTechnicianModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("Cédula de ciudadanía");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCircleClick = () => fileInputRef.current?.click();

  const resetForm = () => {
    setName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
    setDocumentType("Cédula de ciudadanía");
    setDocumentNumber("");
    setPhone("");
    setEmail("");
    setImageFile(null);
    setPreviewImage(undefined);
  };

  useEffect(() => {
    if (isOpen) resetForm();
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !lastName || !password || !confirmPassword || !documentNumber || !phone || !email) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    onSave({
      name,
      lastName,
      password,
      confirmPassword,
      documentType,
      documentNumber,
      phone,
      email,
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
      status: "Activo",
    });

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
          Crear Técnico
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
                <img src={previewImage} alt="Técnico" className="w-full h-full object-cover rounded-full" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
            </div>
            <div className="text-center text-xs text-gray-500 mb-1">
              Haga clic en el círculo para {previewImage ? "cambiar" : "seleccionar"} la imagen
            </div>
            {previewImage && (
              <div className="flex flex-col items-center space-y-1">
                <div className="text-xs text-green-600 font-medium">{imageFile?.name ?? "Imagen actual"}</div>
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setPreviewImage(undefined); }}
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
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Nombre</label>
            <input
              type="text"
              placeholder="Ingrese nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Apellido</label>
            <input
              type="text"
              placeholder="Ingrese apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Contraseña</label>
            <input
              type="password"
              placeholder="Ingrese contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Confirmar Contraseña</label>
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
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Tipo de Documento</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value as DocumentType)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            >
              {documentTypes.map((doc) => <option key={doc} value={doc}>{doc}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Número de Documento</label>
            <input
              type="text"
              placeholder="Ingrese número de documento"
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Teléfono</label>
            <input
              type="text"
              placeholder="Ingrese teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: Colors.texts.primary }}>Correo electrónico</label>
            <input
              type="email"
              placeholder="Ingrese correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              style={{ borderColor: Colors.table.lines }}
            />
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
      </div>
    </div>,
    document.body
  );
};

export default CreateTechnicianModal;
