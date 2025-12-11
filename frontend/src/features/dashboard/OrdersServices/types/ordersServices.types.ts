export type OrdersServiceHistoryEntryType = "SYSTEM" | "TECH";

export type OS_ProductCategory = {
  id: number;
  name: string;
  description?: string | null;
  status?: boolean | null;
  icon?: string | null;
};

export type OS_Product = {
  productid: number;
  createddate?: string | null;
  updatedat?: string | null;
  categoryid?: number | null;
  isactive?: boolean | null;
  productpriceofsale?: number | null;
  productpriceofsupplier?: number | null;
  productstock?: number | null;
  productname: string;
  productdescription?: string | null;
  productcode?: string | null;
  purchaseorderid?: number | null;
  suppliercategory?: string | null;
  image?: string | null;
  category?: OS_ProductCategory | null;
};

export type OS_OrderProduct = {
  ordersservicesproductsid: number;
  cantidad: number;
  subtotal: number;
  product: OS_Product;
};

export type OS_User = {
  userid: number;
  name?: string | null;
  lastname?: string | null;
  documentnumber?: string | null;
  phone?: string | null;
  email?: string | null;
  image?: string | null;
  roleid?: number | null;
  stateid?: number | null;
  typeid?: number | null;
};

export type OS_Technician = {
  technicianid: number;
  userid: number;
  CV?: string | null;
  users?: OS_User | null;
};

export type OS_Customer = {
  customerid: number;
  userid: number;
  customercity?: string | null;
  customerzipcode?: string | null;
  users?: OS_User | null;
};

export type OS_State = {
  stateid: number;
  name: string;
  description?: string | null;
};

export type OrdersServiceHistoryItem = {
  ordersserviceshistoryid: number;
  entrytype: OrdersServiceHistoryEntryType;
  title: string;
  note?: string | null;
  technician?: OS_Technician | null;
  actoruserid?: number | null;
  createdat: string;
};

export type OrderServiceDTO = {
  ordersservicesid: number;
  description?: string | null;
  total?: number | null;
  viaticos?: number | null;
  files?: string[];
  fechainicio?: string | null;
  fechafin?: string | null;
  horainicio?: string | null;
  horafin?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
  products?: OS_OrderProduct[];
  technicians?: OS_Technician[];
  client?: OS_Customer | null;
  state?: OS_State | null;
  history?: OrdersServiceHistoryItem[];
};

export type AddProductToOrderDto = {
  productid: number;
  cantidad: number;
};

export type AssignTechniciansDto = {
  technicians: number[];
};

export type AddOrderFileDto = {
  url: string;
};

export type RemoveFileDto = {
  url: string;
};

export type ReprogramOrderDto = {
  fechainicio: string;
  fechafin: string;
  horainicio: string;
  horafin: string;
  reason?: string;
};

export type FinishOrderDto = {
  fechafin: string;
  horafin: string;
  stateid?: number;
};

export type CreateOrderProductDto = {
  productid: number;
  cantidad: number;
};

export type CreateOrderServiceLineDto = {
  serviceid: number;
  cantidad: number;
  unitprice?: number;
  precio?: number;
};

export type CreateOrdersServiceDto = {
  description: string;
  clientid: number;
  stateid: number;
  fechainicio: string;
  fechafin: string;
  horainicio: string;
  horafin: string;
  technicians: number[];
  products: CreateOrderProductDto[];
  services: CreateOrderServiceLineDto[];
  files?: string[];
  viaticos: number;
};

export type AddWorklogDto = {
  technicianid: number;
  note: string;
  title?: string;
};
