export type IPurchase = {
  id: number;
  orderNumber: string;
  invoiceNumber: string;
  supplier: string;
  registerDate: string;
  amount: number;
  status: "Aprobado" | "Anulado";
};
