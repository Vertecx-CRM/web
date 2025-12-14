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

export type QuoteDetailPayload = {
  productid: number | null;
  description: string;
  quantity: number;
  unitprice: number;
  subtotal: number;
  availability: "DISPONIBLE" | "NO_DISPONIBLE";
};

export type QuoteCreatePayload = {
  serviceRequestId: number;
  statesid: number;
  customerid: number;
  technicianid: number;
  servicetype: string;
  observation: string;
  subtotal: number;
  tax: number;
  total: number;
  details: QuoteDetailPayload[];
};
