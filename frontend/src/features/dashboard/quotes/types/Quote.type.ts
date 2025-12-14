export type QuoteTableRow = {
  id: number;
  client: string;
  technician: string;
  status: string;
  creationDate: string;
  amount: number;
  raw: any; // quote completo para ver detalle
};


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
