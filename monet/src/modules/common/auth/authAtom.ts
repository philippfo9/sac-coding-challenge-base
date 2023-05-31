import { PublicKey } from '@solana/web3.js'
import { atom } from 'recoil'

export const solanaAuthAtom = atom<
  | undefined
  | {
      signature?: string
      wallet: PublicKey
      tx?: any
    }
>({
  key: 'solanaAuthWeb',
  default: undefined,
})
