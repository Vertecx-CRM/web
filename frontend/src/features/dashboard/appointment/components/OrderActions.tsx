"use client";

import { useRouter } from "next/navigation";
import { routes } from "@/shared/routes";
import { actionButtonClass, dangerButtonClass } from "./actionButtonClasses";

export type OrderActionsProps = {
  orderId: number;
  canEdit?: boolean;
  canReprogram?: boolean;
  canCancel?: boolean;
};

const OrderActions = ({
  orderId,
  canEdit = false,
  canReprogram = false,
  canCancel = false,
}: OrderActionsProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2 pt-3">
      {canEdit && (
        <button
          onClick={() =>
            router.push(`${routes.dashboard.ordersServices}/edit?ordersservicesid=${orderId}`)
          }
          className={actionButtonClass}
          type="button"
        >
          Editar
        </button>
      )}
      <button
        onClick={() => router.push(`${routes.dashboard.orders}/${orderId}`)}
        className={actionButtonClass}
        type="button"
      >
        Ver detalle
      </button>
      {canReprogram && (
        <button
          onClick={() =>
            router.push(`${routes.dashboard.orders}/${orderId}?action=reprogram`)
          }
          className={actionButtonClass}
          type="button"
        >
          Reprogramar
        </button>
      )}
      {canCancel && (
        <button
          onClick={() =>
            router.push(`${routes.dashboard.orders}/${orderId}?action=cancel`)
          }
          className={dangerButtonClass}
          type="button"
        >
          Anular
        </button>
      )}
    </div>
  );
};

export default OrderActions;
