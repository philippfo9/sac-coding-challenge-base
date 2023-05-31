import React, { FC, ReactNode, useState } from 'react'
import { WalletSignInModal } from '../../modules/dApp/components/WalletSignInModal'
import { WalletSignInModalContext } from './useWalletSignInModal'
import { WalletModal, WalletModalProps } from './WalletModal'

export interface WalletSignInModalProviderProps extends WalletModalProps {
  children: ReactNode
}

export const WalletSignInModalProvider: FC<WalletSignInModalProviderProps> = ({
  children,
  ...props
}) => {
  const [visible, setVisible] = useState(false)
  const [isLedger, setIsLedger] = useState(false)

  return (
    <WalletSignInModalContext.Provider
      value={{
        visible,
        setVisible,
        isLedger,
        setIsLedger
      }}
    >
      {children}
      {visible && <WalletSignInModal {...props} />}
    </WalletSignInModalContext.Provider>
  )
}
