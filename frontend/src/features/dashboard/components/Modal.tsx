"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ModalProps = {
  title?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
};

export default function Modal({
  title,
  isOpen,
  onClose,
  children,
  footer,
  widthClass = "max-w-5xl",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[1000]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            onClick={onClose}
          />
          <div className="absolute inset-0 p-4 overflow-y-auto">
            <motion.div
              className={`relative mx-auto w-full ${widthClass} w-[min(100vw-2rem,1100px)] rounded-2xl bg-white shadow-2xl`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <h2 className="text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className="cursor-pointer text-gray-500 hover:text-black"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4 max-h-[calc(100dvh-9rem)] overflow-y-auto">
                {children}
              </div>

              {footer && (
                <div className="flex justify-end gap-3 px-4 py-3 border-t">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
