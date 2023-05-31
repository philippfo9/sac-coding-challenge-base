import { useWallet } from '@solana/wallet-adapter-react'
import * as anchor from '@project-serum/anchor'
import { useAsyncRetry } from 'react-use'
import config from '../config/config'
import {
  getNftFromMetadata,
  getNftMetadatasForOwnerBatched,
  getNFTsForOwner,
  getNFTsForOwnerBatched,
} from './solUtils'
import { NftMetadata } from './nftmetaData.type'
import { Metadata } from '@metaplex/js'

const rpcHost = config.rpcHost
const connection = new anchor.web3.Connection(rpcHost, { commitment: 'recent' })

const useWalletNfts = () => {
  const wallet = useWallet()

  const fetchNftsRes = useAsyncRetry(async () => {
    try {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return null
      }

      /* const nftsForOwner = await getNFTsForOwnerV2({connection, ownerAddress: wallet.publicKey})

      const filtered = (nftsForOwner ?? []).filter(nft => !!nft.name).sort((a, b) => {
        if (!a.name.includes('#')) return 1
        if (!b.name.includes('#')) return -1
        return Number(a.name.split('#')[1]) - Number(b.name.split('#')[1])
      })

      return filtered */

      const nftsForOwner = await getNFTsForOwnerBatched({
        connection,
        ownerAddress: wallet.publicKey,
      })

      console.log('nftsForOwner', nftsForOwner.length)
      const nfts = nftsForOwner
        .filter((nft) => {
          /* if (!nft.name) console.error('fucked up nft', nft) */

          return !!nft.name
        })
        .sort((a, b) => {
          if (!a.name.includes('#')) return 1
          if (!b.name.includes('#')) return -1
          return Number(a.name.split('#')[1]) - Number(b.name.split('#')[1])
        })

      console.log('nfts', nfts)

      return nfts
    } catch (e) {
      console.error('e in useWalletNfts', e)
      await Promise.reject(e)
      return []
    }
  }, [wallet])

  return {
    loading: fetchNftsRes.loading,
    nfts: fetchNftsRes.value ?? [],
    refetch: fetchNftsRes.retry,
  }
}

export const useWalletNftMetadatas = (searchKey?: string) => {
  const wallet = useWallet()

  const fetchNftsRes = useAsyncRetry(async () => {
    try {
      if (
        !wallet ||
        !wallet.publicKey ||
        !wallet.signAllTransactions ||
        !wallet.signTransaction
      ) {
        return null
      }

      /* const nftsForOwner = await getNFTsForOwnerV2({connection, ownerAddress: wallet.publicKey})

      const filtered = (nftsForOwner ?? []).filter(nft => !!nft.name).sort((a, b) => {
        if (!a.name.includes('#')) return 1
        if (!b.name.includes('#')) return -1
        return Number(a.name.split('#')[1]) - Number(b.name.split('#')[1])
      })

      return filtered */

      const metadatasForOwner = await getNftMetadatasForOwnerBatched({
        connection,
        ownerAddress: wallet.publicKey,
      })

      console.log('metadatasForOwner', metadatasForOwner.length)
      const metadatas = metadatasForOwner
        .filter((metadata) => {
          /* if (!nft.name) console.error('fucked up nft', nft) */

          return (!!metadata.data.data.name || !!metadata.data.data.symbol) &&
            searchKey
            ? metadata.data.data?.name?.includes(searchKey) || metadata.data.data?.symbol?.includes(searchKey)
            : true
        })
        .sort((a, b) => {
          if (!a.data.data.name.includes('#')) return 1
          if (!b.data.data.name.includes('#')) return -1
          // First, compare the values before the '#' character
          const aName = a.data.data.name.split('#')[0]
          const bName = b.data.data.name.split('#')[0]
          if (aName !== bName) {
            return aName.localeCompare(bName)
          }

          // If the values before the '#' are the same, compare the numbers after the '#'
          const aNum = parseInt(a.data.data.name.split('#')[1], 10)
          const bNum = parseInt(b.data.data.name.split('#')[1], 10)
          return aNum - bNum
        })

      console.log('metadatas', metadatas)

      return metadatas
    } catch (e) {
      console.error('e in useWalletNfts', e)
      await Promise.reject(e)
      return []
    }
  }, [wallet, searchKey])

  return {
    loading: fetchNftsRes.loading,
    metadatas: fetchNftsRes.value ?? [],
    refetch: fetchNftsRes.retry,
  }
}

export const useNftFromMetadata = (metadata: Metadata) => {
  const fetchNftResult = useAsyncRetry(async () => {
    return getNftFromMetadata(metadata)
  }, [metadata])
  return {
    loading: fetchNftResult.loading,
    nft: fetchNftResult.value,
    refetch: fetchNftResult.retry,
  }
}

export type WalletNftV2 = ReturnType<typeof useWalletNfts>['nfts'][0]

export type WalletNftMetadataV2 = ReturnType<
  typeof useWalletNftMetadatas
>['metadatas'][0]

export default useWalletNfts
