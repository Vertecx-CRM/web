import { useAuth } from "../authcontext";

const MODULE_ALIASES: Record<string, string> = {
  purchases: "purcharse",
  purcharse: "purcharse",
  compras: "purcharse",
  purchasesmanagement: "purcharse",
  purchase: "purcharse",
  ordenesdecompra: "purchaseorders",
  purchaseorders: "purchaseorders",

  categories: "categoryproducts",
  categoryproducts: "categoryproducts",
  products: "products",
  suppliers: "suppliers",

  servicesrequests: "servicesrequest",
  servicesrequest: "servicesrequest",

  orderservices: "orderservices",
  ordersservices: "orderservices",
  ordersservice: "orderservices",
  orderservicesmanagement: "orderservices",
  ordersservicesmanagement: "orderservices",

  services: "services",
  technicians: "technicians",
  quotes: "quotes",

  costumers: "customers",
  customers: "customers",
  clients: "customers",
  users: "users",
  roles: "roles",

  sales: "sales",
  sale: "sales",
  ventas: "sales",
  venta: "sales",
  dashboard: "dashboard",
};

const PRIVILEGE_ALIASES: Record<string, string> = {
  create: "create",
  crear: "create",

  read: "read",
  ver: "read",
  leer: "read",

  update: "update",
  actualizar: "update",
  editar: "update",

  delete: "delete",
  eliminar: "delete",
  borrar: "delete",
};

function normalizeModule(name: string) {
  const key = (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
  return MODULE_ALIASES[key] ?? key;
}

function normalizePrivilege(name: string) {
  const key = (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return PRIVILEGE_ALIASES[key] ?? key;
}

function parsePermission(item: string) {
  const sep = item.includes(".") ? "." : item.includes("-") ? "-" : ".";
  const [module, privilege] = item.split(sep);
  return {
    module: normalizeModule(module),
    privilege: normalizePrivilege(privilege),
  };
}

export function usePermissions() {
  const { user } = useAuth();
  const perms = (user as any)?.permissions || [];

  function has(module: string, privilege: string) {
    const targetModule = normalizeModule(module);
    const targetPrivilege = normalizePrivilege(privilege);

    return perms.some((p: string) => {
      const { module: m, privilege: pv } = parsePermission(p || "");
      return m === targetModule && pv === targetPrivilege;
    });
  }

  function canView(module: string) {
    return has(module, "read");
  }

  function canCreate(module: string) {
    return has(module, "create");
  }

  function canUpdate(module: string) {
    return has(module, "update");
  }

  function canDelete(module: string) {
    return has(module, "delete");
  }

  return { has, canView, canCreate, canUpdate, canDelete };
}
