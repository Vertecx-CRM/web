"use client";

import React from "react";
import jsPDF from "jspdf";
// @ts-ignore
import domtoimage from "dom-to-image-more";
import Image from "next/image";

interface DownloadCalendarPDFProps {
  targetId?: string; // id del calendario (default: "calendar")
}

const DownloadCalendarPDF: React.FC<DownloadCalendarPDFProps> = ({ targetId = "calendar-pdf" }) => {
  const handleDownload = async () => {
    const node = document.getElementById(targetId);
    if (!node) {
      console.error("No se encontró el calendario con id:", targetId);
      return;
    }

    try {
      // Generar imagen en alta resolución
      const dataUrl = await domtoimage.toPng(node, {
        width: node.scrollWidth,
        height: node.scrollHeight,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          background: "white",
        },
      });

      const pdf = new jsPDF("landscape", "pt", "a4"); // horizontal A4
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Escalar imagen proporcionalmente
      const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const imgX = (pdfWidth - imgProps.width * ratio) / 2; // centrar horizontal
      let imgY = 20;

      pdf.addImage(dataUrl, "PNG", imgX, imgY, imgProps.width * ratio, imgProps.height * ratio);

      pdf.save("calendario.pdf");
    } catch (error) {
      console.error("Error al exportar el calendario:", error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
    >
      <Image
        src="/icons/download.svg" 
        alt="Descargar"
        width={20}
        height={20}
      />
      <span>Descargar PDF</span>
    </button>
  );
};

export default DownloadCalendarPDF;
