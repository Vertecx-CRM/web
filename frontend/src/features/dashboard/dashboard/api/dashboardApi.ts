const DEFAULT_API_URL =
  "https://vertecx-back-c5abeza7bwcrg2hh.canadacentral-01.azurewebsites.net/";

const apiBaseUrl = () => {
  const raw = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).trim();
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.endsWith("/") ? withProtocol : `${withProtocol}/`;
};

const apiUrl = (path: string) =>
  new URL(path.replace(/^\//, ""), apiBaseUrl()).toString();

const buildUrl = (path: string, year?: number) => {
  if (!year) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}year=${year}`;
};

export const dashboardApi = {
  // Ventas
  getSalesByYear: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/sales/year"), year));
    return res.json();
  },

  getTotalSales: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/sales/total"), year));
    return res.json();
  },

  getDailySalesByMonth: async (month: number, year?: number) => {
    const res = await fetch(buildUrl(apiUrl(`/dashboard/sales/month/${month}`), year));
    return res.json();
  },

  // Compras
  getPurchasesByYear: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/purchases/year"), year));
    return res.json();
  },

  getTotalPurchases: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/purchases/total"), year));
    return res.json();
  },

  getDailyPurchasesByMonth: async (month: number, year?: number) => {
    const res = await fetch(buildUrl(apiUrl(`/dashboard/purchases/month/${month}`), year));
    return res.json();
  },

  // Categorías
  getCategoryProducts: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/categories/products"), year));
    return res.json();
  },

  // Órdenes de servicio
  getOrdersByState: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/orders/state"), year));
    return res.json();
  },

  getTotalOrders: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/orders/total"), year));
    return res.json();
  },

  // Solicitudes de servicio
  getServiceRequestsByState: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/service-requests/state"), year));
    return res.json();
  },

  getTotalServiceRequests: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/service-requests/total"), year));
    return res.json();
  },

  // Clientes
  getClientsByYear: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/clients/year"), year));
    return res.json();
  },

  getTotalClients: async (year?: number) => {
    const res = await fetch(buildUrl(apiUrl("/dashboard/clients/total"), year));
    return res.json();
  },

  getDailyClientsByMonth: async (month: number, year?: number) => {
    const res = await fetch(buildUrl(apiUrl(`/dashboard/clients/month/${month}`), year));
    console.log(res);
    
    return res.json();
  },
};
