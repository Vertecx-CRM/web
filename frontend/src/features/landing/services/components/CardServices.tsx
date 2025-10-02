"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardServicesProps {
  title: string;
  description: string;
  category?: string;
  image?: string;
}

export default function CardServices({ title, description, category, image }: CardServicesProps) {
  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer font-montserrat flex flex-col h-full"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{
        y: -5,
        boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div className="h-56 bg-gray-200 flex-shrink-0">
        {image && <img src={image} alt={title} className="w-full h-full object-cover" />}
      </div>

      <div className="p-4 flex flex-col justify-between flex-1 gap-2">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {category && (
            <span className="text-sm font-semibold text-[#B20000]">{category}</span>
          )}
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>

        <motion.button
          className="mt-4 bg-[#B20000] text-white rounded-full px-4 py-2 flex items-center justify-center gap-2"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 4px 12px rgba(178,0,0,0.3)",
          }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 250, damping: 15 }}
        >
          Contratar Servicio
        </motion.button>
      </div>
    </motion.div>
  );
}
