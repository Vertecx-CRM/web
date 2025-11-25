export interface ISupplier {
  name: any;
  supplierid: number;
  contactname: string;
  servicetype: string;
  nit: string;
  address: string;
  rating: number;
}

export interface IState {
  stateid: number;
  name: string;
}

export interface IPurchase {
  purchaseorderid: number;
  numberoforder: string;
  reference: string;
  supplier: ISupplier;
  state: IState;
  amount: number;
  createdat: string;
  updatedat: string;
}
