import {useWallet} from '@solana/wallet-adapter-react'
import {useEffect, useMemo, useState} from 'react'
import {useQuery} from 'react-query'
import {useRecoilState} from 'recoil'
import {solanaAuthAtom} from './authAtom'
import Cohere from 'cohere-js'
import {trpc} from "../../../utils/trpc";
import { useWalletSignInModal } from '../../../components/wallet-ui/useWalletSignInModal'
import { solanaAuthConfig } from './authConfig'
import { useStartAuthTx } from './startAuthHook'

export function useUser() {
  const [solanaAuth, setSolanaAuth] = useRecoilState(solanaAuthAtom)
  const {startSignAuthMsg} = useStartAuthTx()
  const {setVisible} = useWalletSignInModal()
  const wallet = useWallet()

  /* const [publicKey, setPublicKey] = useState(wallet.publicKey)
  
    useEffect(() => {
    if (!publicKey || !wallet.publicKey?.equals(publicKey))
      setPublicKey(wallet.publicKey)
  }, [wallet.publicKey, publicKey])
  */
  const publicKey = wallet.publicKey

  const { error, refetch } = useQuery(
    ['user', publicKey, solanaAuth?.tx, solanaAuth?.wallet],
    async () => {
      if (!publicKey && !solanaAuth?.tx) {
        return null
      }

      if (!wallet.signTransaction || !publicKey) return null

      console.log({solanaAuth});
      
      const isValidAuthTxExisting = solanaAuth?.tx &&
        solanaAuth.wallet.toBase58() === publicKey?.toBase58()

      const isValidSignatureExisting = solanaAuth?.signature &&
          solanaAuth.wallet.toBase58() === publicKey?.toBase58()

      if (!isValidAuthTxExisting && !isValidSignatureExisting && publicKey) {
        console.log('setting it visible');
        setVisible(true)
        if (wallet.signMessage) {
          console.log('starting auth msg immediately');
          const success = await startSignAuthMsg()
          setVisible(!success.data)
        }
      }

      if (publicKey) {
        try {
          Cohere.identify(publicKey.toBase58(), {
            displayName: publicKey.toBase58(),
          })
        } catch (e) {
          console.error(`error in cohere identify`, e)
        }
      }

      return true
    },
    {
      staleTime: 1000 * 60,
    }
  )

  const isAuthed = useMemo(() => {
    if ((!solanaAuth?.tx && !solanaAuth?.signature) || !wallet.signMessage || !publicKey || !solanaAuth.wallet.equals(publicKey)) {
      console.log('is not authed');
      return false
    }
    
    return true
  }, [publicKey, solanaAuth?.tx, solanaAuth?.signature, wallet.signMessage])

  const {
    data,
    refetch: refetchUser,
    isLoading,
    isIdle,
  } = trpc.useQuery(['user.get'], {
    enabled: wallet.connected && isAuthed,
  })

  return { data, isLoading, isIdle, error, isAuthed, refetch, refetchUser }
}

export function useIsUserMemberOfProject(publicProjectId?: string) {
  const {data: user, isLoading, isIdle} = useUser();
  const {data: isPlatformAdmin, isLoading: isPlatformAdminLoading} = useIsUserPlatformAdmin()
  const isInProject = useMemo(() => {
    for (const project of user?.projects ?? []) {
      if (project.project.publicId === publicProjectId) {
        if (project.admin) {
          return "ADMIN";
        }
        return true;
      }
    }
    if (isPlatformAdmin) {
      return true
    }
    return false;
  }, [user?.projects, publicProjectId, isPlatformAdminLoading])
  return {isMember: isInProject !== false, isAdmin: isInProject === "ADMIN", isLoading: isIdle || isLoading || isPlatformAdminLoading}
}

export function useIsUserPlatformAdmin() {
  const [solanaAuth, setSolanaAuth] = useRecoilState(solanaAuthAtom)
  return trpc.useQuery(['user.isPlatformAdmin'], {
    enabled: !!solanaAuth?.wallet,
  })
}