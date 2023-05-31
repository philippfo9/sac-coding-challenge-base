import {useRouter} from "next/router";
import {trpc} from "../../../utils/trpc";
import {useIsUserMemberOfProject} from "../../common/auth/authHooks";
import { TLeaderboardStatsProject } from "../routers/projectRouter";
import { timeframeFilterType } from '../types';
import {useWalletFromRouter} from './user';

export function useProjectBySlug() {
  const router = useRouter()
  return trpc.useQuery([
    'project.single',
    { id: router.query.projectId as string },
  ])
}

export function useProjectId() {
  const router = useRouter()
  return router.query.projectId as string|undefined;
}

export function useFeaturedProjects() {
  return trpc.useQuery([
    'project.featured.cache',
  ])
}

export function useAllPaginated(page: number) {
  return trpc.useQuery([
    'project.all-paginated',
    { page }
  ])
}

export function useAllProjectsLeaderPaginated(page: number, timeframe: timeframeFilterType) {
  console.log(timeframe);
  
  return trpc.useQuery([
    'project.all-leader-paginated',
    { page, timeframe }
  ]) as {data: TLeaderboardStatsProject[], isFetching: boolean}
}

export function useProjectsWhereUserIsHolderFromRouter() {
  const wallet = useWalletFromRouter();
  return useProjectsWhereUserIsHolder(wallet);
}

export function useProjectsWhereUserIsHolder(wallet?: string|null) {
  return trpc.useQuery([
    'project.all-user-holder',
    {wallet: wallet ?? ''}
  ], {enabled: !!wallet})
}