interface IRoutes {
  path: string;
  landing: {
    home: string;
    products: string;
    services: string;
    about: string;
    contact: string;
    cart: string;
    trajectory: string;
  };
  auth: {
    access: string; 
    login: string;
    register: string;
  };
  dashboard: {
    newClient: any;
    newService: any;
    main: string;
    users: string;
    products: string;
    productsCategories: string;
    roles: string;
    services: string;
    technicians: string;
    appointments: string;
    purchases: string;
    purchasesGraph: string;
    purchasesOrders: string;
    suppliers: string;
    sales: string;
    clients: string;
    requestsServices: string;
    ordersServices: string;
    quotes: string;
    settings: string;
    profile: string;
  };
  notFound: string;
}
export const routes: IRoutes = {
  path: "/",
  landing: {
    home: "/home",
    products: "/landing/products",
    services: "/landing/services",
    about: "/landing/about",
    contact: "/landing/contact",
    cart: "/cart",
    trajectory: "/landing/trajectory",
  },
  auth: {
    access: "/auth/access",
    login: "/auth/login",
    register: "/auth/register",
  },
  dashboard: {
    main: "/dashboard",
    users: "/dashboard/access/users",
    products: "/dashboard/products",
    productsCategories: "/dashboard/products/categories",
    roles: "/dashboard/roles",
    services: "/dashboard/services",
    technicians: "/dashboard/technicians",
    appointments: "/dashboard/appointments",
    purchases: "/dashboard/purchases",
    purchasesGraph: "/dashboard/purchases/graph",
    purchasesOrders: "/dashboard/purchases/orders",
    suppliers: "/dashboard/suppliers",
    sales: "/dashboard/sales",
    clients: "/dashboard/clients",
    requestsServices: "/dashboard/requests",
    ordersServices: "/dashboard/orders-services",
    quotes: "/dashboard/quotes",
    settings: "/dashboard/settings",
    profile: "/dashboard/profile",
    newClient: undefined,
    newService: undefined
  },
  notFound: "/404",
};
