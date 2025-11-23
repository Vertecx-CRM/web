const API_URL = "http://localhost:3001/dashboard";

export const dashboardApi = {
    // Ventas
    getSalesByYear: async () => {
        const res = await fetch(`${API_URL}/sales/year`);
        return res.json();
    },

    getTotalSales: async () => {
        const res = await fetch(`${API_URL}/sales/total`);
        return res.json();
    },

    getDailySalesByMonth: async (month: number) => {
        const res = await fetch(`${API_URL}/sales/month/${month}`);
        return res.json();
    },

    // Compras
    getPurchasesByYear: async () => {
        const res = await fetch(`${API_URL}/purchases/year`);
        return res.json();
    },

    getTotalPurchases: async () => {
        const res = await fetch(`${API_URL}/purchases/total`);
        return res.json();
    },

    getDailyPurchasesByMonth: async (month: number) => {
        const res = await fetch(`${API_URL}/purchases/month/${month}`);
        return res.json();
    },

    // Categorías
    getCategoryProducts: async () => {
        const res = await fetch(`${API_URL}/categories/products`);
        return res.json();
    },

    // Órdenes de servicio
    getOrdersByState: async () => {
        const res = await fetch(`${API_URL}/orders/state`);
        return res.json();
    },

    getTotalOrders: async () => {
        const res = await fetch(`${API_URL}/orders/total`);
        return res.json();
    },

    // Solicitudes de servicio
    getServiceRequestsByState: async () => {
        const res = await fetch(`${API_URL}/service-requests/state`);
        return res.json();
    },

    getTotalServiceRequests: async () => {
        const res = await fetch(`${API_URL}/service-requests/total`);
        return res.json();
    },

    // Clientes
    getClientsByYear: async () => {
        const res = await fetch(`${API_URL}/clients/year`);
        return res.json();
    },

    getTotalClients: async () => {
        const res = await fetch(`${API_URL}/clients/total`);
        return res.json();
    },

    getDailyClientsByMonth: async (month: number) => {
        const res = await fetch(`${API_URL}/clients/month/${month}`);
        return res.json();
    },
};
