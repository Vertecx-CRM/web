import { ISale, ISaleCustomer } from "../types/Sales.type";

type NameSource = {
  name?: string;
  lastname?: string;
  users?: {
    name?: string;
    lastname?: string;
  };
};

const resolveNameParts = (source?: NameSource): string[] => {
  const firstName = source?.users?.name ?? source?.name;
  const lastName = source?.users?.lastname ?? source?.lastname;
  return [firstName, lastName].filter((part): part is string => Boolean(part));
};

const getCustomerId = (sale: ISale): number | null => {
  return sale.customer?.customerid ?? sale.customerid ?? null;
};

export interface SaleCustomerLabel {
  label: string;
  isMissing: boolean;
}

export const formatSaleCustomerLabel = (
  sale: ISale,
  customers?: ISaleCustomer[]
): SaleCustomerLabel => {
  if (!sale.customer) {
    return { label: "Cliente no encontrado", isMissing: true };
  }

  const saleNameParts = resolveNameParts(sale.customer);
  if (saleNameParts.length > 0) {
    return { label: saleNameParts.join(" "), isMissing: false };
  }

  const fallbackId = getCustomerId(sale);
  if (customers && fallbackId !== null) {
    const matchedCustomer = customers.find(
      (customer) => customer.customerid === fallbackId
    );
    const matchedNameParts = resolveNameParts(matchedCustomer);
    if (matchedNameParts.length > 0) {
      return { label: matchedNameParts.join(" "), isMissing: false };
    }
  }

  if (fallbackId !== null) {
    return { label: `Cliente #${fallbackId}`, isMissing: true };
  }

  return { label: "Cliente sin asignar", isMissing: true };
};
