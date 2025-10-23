import { useState, useEffect } from "react";
import {
    CreateCategoryModalProps,
    CreateCategoryData,
    FormErrors,
    FormTouched
} from "../types/typeCategoryProducts";
import {
    hasNumbers,
    hasSpecialChars,
    validateField,
    validateFormWithNotification,
    isDuplicateName
} from "../validations/categoryValidations";
import { showWarning, showSuccess } from "@/shared/utils/notifications";

export const useCreateCategoryForm = ({ isOpen, onClose, onSave, categories }: CreateCategoryModalProps) => {
    const [formData, setFormData] = useState<CreateCategoryData>({
        name: "",
        description: "",
        icon: null,
    });

    const [errors, setErrors] = useState<FormErrors>({
        name: "",
        description: "",
    });

    const [touched, setTouched] = useState<FormTouched>({
        name: false,
        description: false,
    });

    // Reiniciar formulario al abrir modal
    useEffect(() => {
        if (isOpen) {
            setFormData({ name: "", description: "", icon: null });
            setErrors({ name: "", description: "" });
            setTouched({ name: false, description: false });
        }
    }, [isOpen]);

    // Validación en tiempo real para nombre
    useEffect(() => {
        if (touched.name) {
            const error = validateField("name", formData.name);
            setErrors(prev => ({ ...prev, name: error }));
            if (error) showWarning(error);
        }
    }, [formData.name, touched.name]);

    // Validación en tiempo real para descripción
    useEffect(() => {
        if (touched.description) {
            const error = validateField("description", formData.description);
            setErrors(prev => ({ ...prev, description: error }));
            if (error) showWarning(error);
        }
    }, [formData.description, touched.description]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "name" || name === "description") {
            if (hasSpecialChars(value)) return;
            if (name === "name" && hasNumbers(value)) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData(prev => ({ ...prev, icon: file }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    };

    // Subir imagen a Cloudinary
    const uploadToCloudinary = async (file: File): Promise<string | null> => {
        const CLOUD_NAME = "ditjhxzre";
        const UPLOAD_PRESET = "Vertecx";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (!response.ok) throw new Error(data.error?.message || "Error al subir a Cloudinary");

            return data.secure_url;
        } catch (error) {
            console.error("Error al subir imagen:", error);
            showWarning("No se pudo subir la imagen a Cloudinary");
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateFormWithNotification(formData, setErrors, setTouched);
        if (!isValid) return;

        if (isDuplicateName(formData.name, categories)) {
            showWarning("Ya existe una categoría con ese nombre. Por favor, elige otro.");
            return;
        }

        try {
            let iconUrl: string | null = null;

            if (formData.icon instanceof File) {
                iconUrl = await uploadToCloudinary(formData.icon);
            }

            onSave({
                name: formData.name.trim(),
                description: formData.description.trim(),
                icon: iconUrl,
            });
            setTimeout(onClose, 1000);
        } catch (error) {
            console.error("Error al procesar la imagen:", error);
            showWarning("No se pudo procesar la imagen. Intenta nuevamente.");
        }
    };

    return {
        formData,
        errors,
        touched,
        handleInputChange,
        handleIconChange,
        handleBlur,
        handleSubmit,
    };
};
