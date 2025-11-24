import { useAuth } from "../authcontext";

function parsePermission(item: string) {
  const [module, privilege] = item.split(".");
  return { module, privilege };
}

export function usePermissions() {
  const { user } = useAuth();
  const perms = user?.permissions || [];

  function has(module: string, privilege: string) {
    return perms.some((p) => {
      const { module: m, privilege: pv } = parsePermission(p);
      return m.toLowerCase() === module.toLowerCase() &&
             pv.toLowerCase() === privilege.toLowerCase();
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

