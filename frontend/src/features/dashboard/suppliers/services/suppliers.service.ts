import { apiClient } from "@/shared/utils/apiClient";

export interface ISupplier {
    supplierid: number;
    name: string;
    nit: string;
    phone: string;
    email: string;
    address: string;
    stateid: number;
    contactname: string;
    image: string;
    rating: number;
    createat?: string;
    updateat?: string;
}

export const getSuppliers = async (): Promise<ISupplier[]> => {
    const response = await apiClient.get<{ data: ISupplier[] }>("/suppliers");
    return response.data;
};