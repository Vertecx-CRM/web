interface IRoutes {
  landing: {
    home: string;
    products: string;
    services: string;
    about: string;
    contact: string;
  };
  auth: {
    login: string;
    register: string;
  };
  dashboard: {
    main: string;
    users: string;
    products: string;
    productsCategories: string;
    roles: string;
    services: string;
    technicians: string;
    appointments: string;
    purchases: string;
    suppliers: string;
    sales: string;
    clients: string;
    ordersServices: string;
    quotes: string;
    settings: string;
    profile: string;
  };
}
export const routes: IRoutes = {
  landing: {
    home: "/home",
    products: "/products",
    services: "/services",
    about: "/about",
    contact: "/contact",
  },
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  dashboard: {
    main: "/dashboard",
    users: "/dashboard/users",
    products: "/dashboard/products",
    productsCategories: "/dashboard/products/categories",
    roles: "/dashboard/roles",
    services: "/dashboard/services",
    technicians: "/dashboard/technicians",
    appointments: "/dashboard/appointments",
    purchases: "/dashboard/purchases",
    suppliers: "/dashboard/suppliers",
    sales: "/dashboard/sales",
    clients: "/dashboard/clients",
    ordersServices: "/dashboard/orders-services",
    quotes: "/dashboard/quotes",
    settings: "/dashboard/settings",
    profile: "/dashboard/profile",
  },
};
