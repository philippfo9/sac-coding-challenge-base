import { createContext, useContext } from 'react'

export interface WalletSignInModalContextState {
  visible: boolean
  setVisible: (open: boolean) => void
  isLedger: boolean
  setIsLedger: (isLedger: boolean) => void
}

const DEFAULT_CONTEXT = {
  setVisible(_open: boolean) {
    console.error(constructMissingProviderErrorMessage('call', 'setVisible'))
  },
  visible: false,
  setIsLedger(_isLedger: boolean) {
    console.error(constructMissingProviderErrorMessage('call', 'setIsLedger'))
  },
  isLedger: false,
}
Object.defineProperty(DEFAULT_CONTEXT, 'visible', {
  get() {
    console.error(constructMissingProviderErrorMessage('read', 'visible'))
    console.error(constructMissingProviderErrorMessage('read', 'isLedger'))
    return false
  },
})

function constructMissingProviderErrorMessage(
  action: string,
  valueName: string
) {
  return (
    'You have tried to ' +
    ` ${action} "${valueName}"` +
    ' on a WalletModalContext without providing one.' +
    ' Make sure to render a WalletModalProvider' +
    ' as an ancestor of the component that uses ' +
    'WalletModalContext'
  )
}

export const WalletSignInModalContext = createContext<WalletSignInModalContextState>(
  DEFAULT_CONTEXT as WalletSignInModalContextState
)

export function useWalletSignInModal(): WalletSignInModalContextState {
  return useContext(WalletSignInModalContext)
}
