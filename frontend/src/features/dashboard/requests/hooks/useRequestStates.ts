import { useQuery } from "@tanstack/react-query";
import { listStates  } from "../services/servicerequests.service";

export function useRequestStates() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["request-states"],
    queryFn: listStates,
    staleTime: 5 * 60 * 1000,
  });
  const stateOptions = (data ?? []).map(s => ({ id: String(s.stateid), label: s.name }));
  return { data, isLoading, error, stateOptions };
}
