export interface ISaleDetail {
  saledetailid: number;
  saleid: number;
  productid: number;
  quantity: number;
  unitprice: number;
  linetotal: number;
}

export interface ISale {
  saleid: number;
  subtotal: number;
  taxamount: number;
  discountamount: number;
  totalamount: number;
  createddate: string;
  saledate: string;
  customerid: number;
  salecode: string;
  createdby: string;
  notes: string | null;
  paymentmethod: string;
  salestatus: string;
  salesdetail: ISaleDetail[];
}

// dto/create-sale.dto.ts
export class CreateSaleDetailDto {
  productid: number; // id producto seleccionado
  quantity: number; // cantidad
  unitprice: number; // precio unitario
  discountpercent?: number; // opcional, si usas descuentos por línea
  notes?: string;
}

export class CreateSaleDto {
  customerid: number; // cliente seleccionado en el select
  saledate: Date; // fecha de la venta
  salestatus: string; // 'Pending', 'Completed', etc.
  paymentmethod?: string; // 'Cash', 'Credit Card', etc.
  notes?: string; // observaciones
  createdby?: string; // usuario logueado (opcional)

  // Totales que ve el usuario en la tarjeta de la derecha:
  taxpercent?: number; // ej: 19, si quieres mandarlo desde el front (opcional)
  discountamount?: number; // descuento global (el de la tarjeta, no por línea)

  details: CreateSaleDetailDto[];
}
