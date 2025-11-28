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
