"use client";

import { DataTable, Column } from "@/features/dashboard/components/DataTable";
import Colors from "@/shared/theme/colors";
import { Service } from "../../types/typesServices";
import DownloadXLSXButton from "../../../components/DownloadXLSXButton";
import Image from "next/image";

interface ServicesTableProps {
  services: Service[];
  onView: (service: Service) => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onCreate: () => void;
}

export const ServicesTable: React.FC<ServicesTableProps> = ({
  services,
  onView,
  onEdit,
  onDelete,
  onCreate,
}) => {
  const columns: Column<Service>[] = [
    { key: "id", header: "ID" },
    { key: "name", header: "Nombre" },
    { key: "category", header: "Categoría" },
    {
      key: "image",
      header: "Imagen",
      render: (s) => {
        const image =
          typeof s.image === "string"
            ? s.image.trim()
            : s.image instanceof File
            ? URL.createObjectURL(s.image)
            : "";

        const isBase64 =
          typeof image === "string" && image.startsWith("data:image");

        console.log(
          `-----------------------------------
            Renderizando imagen para servicio
            -----------------------------------------`,
          s,
          "URL:",
          image
        );

        if (!image) {
          return (
            <span className="text-gray-400 text-xs italic">Sin imagen</span>
          );
        }

        return (
          <Image
            src={image}
            alt={s.name}
            className="w-10 h-10 object-cover rounded-md border border-gray-200"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              e.currentTarget.insertAdjacentHTML(
                "afterend",
                `<span class="text-gray-400 text-xs italic">Sin imagen</span>`
              );
            }}
            width={100}
            height={100}
            unoptimized={isBase64}
          />
        );
      },
    },
    {
      key: "state",
      header: "Estado",
      render: (s) => (
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{
            color:
              s.state === "Activo"
                ? Colors.states.success
                : Colors.states.inactive,
          }}
        >
          {s.state}
        </span>
      ),
    },
  ];

  return (
    <DataTable<Service>
      data={services}
      columns={columns}
      pageSize={10}
      searchableKeys={["id", "name", "category", "state"]}
      onView={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      onCreate={onCreate}
      searchPlaceholder="Buscar servicios..."
      createButtonText="Crear Servicio"
      rightActions={
        <DownloadXLSXButton
          data={services as unknown as Record<string, unknown>[]}
          fileName="reporte_servicios.xlsx"
          headers={["ID", "Nombre", "Categoría", "Estado"]}
        />
      }
    />
  );
};

export default ServicesTable;
