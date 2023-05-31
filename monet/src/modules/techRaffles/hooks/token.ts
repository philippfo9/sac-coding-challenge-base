import {trpc} from "../../../utils/trpc";

export function useTokens() {
  return trpc.useQuery([
    'token.getAll'
  ], {retry: false, refetchInterval: 5 * 60 * 1000})
}