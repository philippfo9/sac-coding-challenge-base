import { useQuery } from 'react-query'
import { useWallet } from '@solana/wallet-adapter-react'
import { useRecoilState } from 'recoil'
import { solanaAuthAtom } from './authAtom'
import { buildAuthTx } from './authUtils'
import toast from 'react-hot-toast'
import { solanaAuthConfig } from './authConfig'

export function useStartAuthTx() {
  const [solanaAuth, setSolanaAuth] = useRecoilState(solanaAuthAtom)
  const wallet = useWallet()

  const {refetch: startSignAuthTx} = useQuery('startAuthTx', async () => {
    if (!wallet.signTransaction || !wallet.publicKey) return null
  
    const tx = await buildAuthTx(wallet.publicKey)
    const res = await wallet.signTransaction(tx)

    const txSerialized = JSON.stringify(res.serialize())

    setSolanaAuth({
      tx: txSerialized,
      wallet: wallet.publicKey,
    })
    toast.success('Successful login')
    return true
  }, {
    enabled: false,
  })

  const {refetch: startSignAuthMsg} = useQuery('startAuthMessage', async () => {
    if (!wallet.signMessage || !wallet.publicKey) return null
  
    const res = await wallet.signMessage(
      new TextEncoder().encode(solanaAuthConfig.signingMessage(wallet.publicKey.toBase58()))
    )

    setSolanaAuth({
      signature: JSON.stringify({ signature: Array.from(res) }),
      wallet: wallet.publicKey,
    })
    toast.success('Successful login')
    return true
  }, {
    enabled: false,
  })

  return {startSignAuthTx, startSignAuthMsg}
}