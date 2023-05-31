import { atom } from 'recoil'

export const authSignatureAtom = atom<string | undefined>({
  key: 'authSignature', // unique ID (with respect to other atoms/selectors)
  default: undefined, // default value (aka initial value)
})