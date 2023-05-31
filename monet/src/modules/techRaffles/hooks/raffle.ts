import { trpc } from '../../../utils/trpc'
import { useRouter } from 'next/router'
import { useProjectId } from './project'
import { useQuery } from 'react-query'
import {
  getAllParticipantRaffles,
  getAllRaffleParticipants,
  getRaffleOnChainDataByDBId,
  getRafflesOnChainByDBIds,
  getRaffleUser,
} from '../raffleOnChainUtils'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletFromRouter } from './user'
import { useUser } from '../../common/auth/authHooks'
import { PublicKey } from '@solana/web3.js'
import { useAsync } from 'react-use'
import {
  raffleOrderByType,
  raffleFilterType,
  raffleType,
  raffleProjectFilterType,
  raffleStatusType,
  OnChainRaffleType,
  raffleUserConnectionType,
  raffleMinType,
  raffleTypeWithLikeCount,
} from '../types'

export function useAllRaffles(props: {
  filter: raffleFilterType
  orderBy: raffleOrderByType
  status: raffleStatusType
  page: number
}) {
  return trpc.useQuery([
    'raffle.all',
    {
      filter: props.filter,
      orderBy: props.orderBy,
      status: props.status,
      page: props.page,
    },
  ])
}

export function useTrendingRaffles() {
  return trpc.useQuery(['raffle.trending.cache'])
}

export function useRafflesAndUserRafflesByProjectPublicId(props: {
  filter: raffleProjectFilterType
  orderBy: raffleOrderByType
  status: raffleStatusType
  page: number
}) {
  const projectId = useProjectId()!
  return trpc.useQuery([
    'raffle.all-by-project-public-id',
    {
      projectPublicId: projectId,
      filter: props.filter,
      orderBy: props.orderBy,
      status: props.status,
      page: props.page,
    },
  ])
}

export function useUserRaffles(props: {
  userWallet?: string
  raffleType: raffleUserConnectionType
  includeCancelled?: boolean
  page: number
}) {
  return trpc.useQuery(
    [
      'raffle.all-user',
      {
        userWallet: props.userWallet ?? '',
        type: props.raffleType,
        includeCancelled: props.includeCancelled ?? false,
        page: props.page,
      },
    ],
    { enabled: !!props.userWallet }
  )
}

export function useCollectionRafflesBySlug(page: number) {
  const router = useRouter()
  return trpc.useQuery(
    [
      'raffle.all-collection',
      { collectionName: router.query.collectionName as string, page: page },
    ],
    { enabled: !!router.query.collectionName }
  )
}

export function useOnChainRaffleListData(
  raffles?: (raffleMinType | null)[] | null
) {
  const allRafflesRes = useAsync(async () => {
    const existingRaffles = (raffles ?? []).filter(
      (r) => !!r?.id
    ) as raffleMinType[]
    const allRaffles = await getRafflesOnChainByDBIds(
      existingRaffles.map((r) => r.id)
    )
    const allRafflesCombined = existingRaffles.map((r) => {
      const onChainRaffle = allRaffles.find((a) => a?.id === r?.id)
      return {
        ...r,
        onChainData: onChainRaffle,
      }
    })

    return allRafflesCombined
  }, [raffles])
  return allRafflesRes
}

export function useRafflesByProjectPublicId() {
  const projectId = useProjectId()!
  return trpc.useQuery([
    'raffle.all-admin-by-project-public-id',
    { projectPublicId: projectId, includeEnded: true },
  ])
}

export function useRaffleBySlug(initialData?: raffleTypeWithLikeCount) {
  const raffleId = useRouter().query.id as string | undefined
  return trpc.useQuery(['raffle.single', { id: raffleId ?? '' }], {
    enabled: !!raffleId,
    initialData,
  })
}

export function useOnChainRaffle(raffleId?: string) {
  return useQuery(
    ['raffleOnChain', raffleId],
    async () => {
      if (!raffleId) return
      return getRaffleOnChainDataByDBId(raffleId as string)
    },
    { enabled: !!raffleId }
  )
}

export function useOnChainRaffleUserData(
  raffle?: OnChainRaffleType,
  deactivated: boolean = false
) {
  const wallet = useWallet()
  return useQuery(
    ['raffleUserOnChain', raffle?.id, wallet.publicKey, deactivated],
    async () => {
      if (!raffle || !wallet.publicKey || deactivated) return
      return getRaffleUser({ raffle: raffle.publicKey, user: wallet.publicKey })
    },
    { enabled: !!raffle && !!wallet.publicKey }
  )
}

export function useOnChainRaffleParticipants(
  raffleKey?: PublicKey,
  raffleOnChainUserRes?: any
) {
  return useQuery(
    ['useOnChainRaffleParticipants', raffleKey, raffleOnChainUserRes],
    async () => {
      if (!raffleKey) return
      const raffleUsers = await getAllRaffleParticipants(raffleKey)
      console.log('raffleUsers', raffleUsers)
      return raffleUsers
        .filter((u) => u.account.raffle.equals(raffleKey))
        .sort((a, b) =>
          a.account.authority
            .toBase58()
            .localeCompare(b.account.authority.toBase58())
        )
    }
  )
}
