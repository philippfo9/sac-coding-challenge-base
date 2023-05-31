import { trpc } from '../../../utils/trpc';

export function useGeneralPlatformSettings() {
  return trpc.useQuery(['platform.general-settings'])
}