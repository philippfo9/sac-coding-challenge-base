import {Button, ButtonProps, useColorMode} from '@chakra-ui/react'
import {useWallet} from '@solana/wallet-adapter-react'
import React, {FC, MouseEventHandler, useCallback, useMemo} from 'react'
import { BiWallet } from 'react-icons/bi'
import {WalletIcon} from './WalletIcon'

export const WalletConnectButton: FC<ButtonProps> = ({
  children,
  disabled,
  onClick,
  ...props
}) => {
  const { wallet, connect, connecting, connected } = useWallet()
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'

  const handleClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      if (onClick) onClick(event)
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      if (!event.defaultPrevented) connect().catch(() => {})
    },
    [onClick, connect]
  )

  const content = useMemo(() => {
    if (children) return children
    if (connecting) return 'Connecting ...'
    if (connected) return 'Connected'
    if (wallet) return 'Connect'
    return 'Connect Wallet'
  }, [children, connecting, connected, wallet])

  return (
    <>
      <Button
        display={['none', 'none', 'inline-flex']}
        disabled={disabled || !wallet || connecting || connected}
        starticon={wallet ? <WalletIcon wallet={wallet} /> : undefined}
        onClick={handleClick}
        px='.5rem'
        variant='primaryDark'
        {...props}
      >
        {content}
      </Button>

      <Button
        display={['inline-flex', 'inline-flex', 'none']}
        variant={isDarkMode ? 'primaryDark' : 'primary'}
        px='0'
        onClick={handleClick}
        disabled={disabled || !wallet || connecting || connected}
      >
        <BiWallet />
      </Button>
    </>
  )
}
