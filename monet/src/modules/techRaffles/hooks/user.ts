import {useRouter} from 'next/router';
import {trpc} from '../../../utils/trpc';
import { TBuyerLeaderboardStatsUser, TLeaderboardStatsUser } from '../routers/userRouter';
import { timeframeFilterType } from '../types';

export function useWalletFromRouter() {
  const router = useRouter()
  return router.query.wallet as string|undefined;
}

export function useUserByWallet() {
  const wallet = useWalletFromRouter();
  return trpc.useQuery([
    'user.get-by-wallet',
    { wallet: wallet as string },
  ], {enabled: !!wallet})
}

export function useAllRaffleHostLeadersPaginated(page: number, timeframe: timeframeFilterType) {
  return trpc.useQuery([
    'user.all-leader-paginated',
    { page, timeframe }
  ]) as {data: TLeaderboardStatsUser[], isFetching: boolean}
}

export function useAllRaffleBuyersLeadersPaginated(page: number, timeframe: timeframeFilterType) {
  return trpc.useQuery([
    'user.buyer-leaderboard-paginated',
    { page, timeframe }
  ]) as {data: TBuyerLeaderboardStatsUser[], isFetching: boolean}
}