/* =======================
   TIPOS RELACIONADOS
======================= */

export interface ICustomer {
  customerid: number;
  name: string;
  lastname?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface IProduct {
  productid: number;
  productname: string;
  productpriceofsale: number;
  categoryid?: number;
}

/* =======================
   DETALLE DE VENTA
======================= */

export interface ISaleDetail {
  saledetailid: number;
  saleid: number;
  productid: number;
  quantity: number;
  unitprice: number;
  linetotal: number;

  // relaciones
  products?: IProduct;
}

/* =======================
   VENTA (LECTURA)
======================= */

export interface ISale {
  saleid: number;
  salecode: string;

  customerid: number;
  customer?: ICustomer;

  saledate: string;      // ISO string
  createddate: string;

  subtotal: number;
  taxamount: number;
  discountamount: number;
  totalamount: number;

  paymentmethod: string;
  salestatus: "Pending" | "Completed" | "Cancelled";

  notes?: string | null;
  createdby?: string | null;

  salesdetail: ISaleDetail[];
}

  // VENTA (CREACIÓN - FRONTEND)


export interface CreateSaleDetailPayload {
  productid: number;
  quantity: number;
  unitprice: number;
  discountpercent?: number;
  notes?: string;
}

export interface CreateSalePayload {
  customerid: number;
  saledate: string;            // ISO
  salestatus?: "Pending" | "Completed" | "Cancelled";
  paymentmethod?: string;
  notes?: string;
  createdby?: string;

  taxpercent?: number;
  discountamount?: number;

  details: CreateSaleDetailPayload[];
}
