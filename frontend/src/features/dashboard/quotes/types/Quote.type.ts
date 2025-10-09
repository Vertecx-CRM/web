export interface IQuote {
  id: number;
  serviceTypes: {
    mantenimiento: boolean;
    instalacion: boolean;
  };
  client: string;
  status: "Pendiente" | "Aprobada" | "Rechazada" | "Anulada";
  description: string;
  materials: { name: string; subtotal: number }[];
  total: number;
  creationDate: string;
  amount: number;
}
