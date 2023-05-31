import dynamic from 'next/dynamic'
import React from 'react'

const WalletConnectionProvider = dynamic(
  () => import('../components/WalletConnectionProvider'),
  {
    ssr: false,
  }
)

export const withWalletConnection = (component: React.FC) => {
  const wrapper = (props: any) => {
    return (
      <WalletConnectionProvider>{component(props)}</WalletConnectionProvider>
    )
  }

  return wrapper
}
