import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from './wallet-ui'
import React, { FC, useMemo } from 'react'
import config from '../config/config'
import {
  BackpackWalletAdapter,
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { WalletSignInModalProvider } from './wallet-ui/WalletSignInModalProvider'

export const WalletConnectionProvider: FC = ({ children }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const rpcUrl = config.rpcHost

  const endpoint = useMemo(() => rpcUrl, [])

  const network = config.solanaEnv as any

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter({}),
      new SolflareWalletAdapter({ network }),
      new BackpackWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <WalletSignInModalProvider>
            {children}
          </WalletSignInModalProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default WalletConnectionProvider
