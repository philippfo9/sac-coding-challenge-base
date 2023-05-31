import {Button, ButtonProps, useColorMode} from '@chakra-ui/react'
import React, {FC, MouseEvent, useCallback} from 'react'
import { BiWallet } from 'react-icons/bi'
import {useWalletModal} from './useWalletModal'

export const WalletModalButton: FC<ButtonProps> = ({
  children = 'Connect Wallet',
  onClick,
}) => {
  const { visible, setVisible } = useWalletModal()
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (onClick) onClick(event)
      if (!event.defaultPrevented) setVisible(!visible)
    },
    [onClick, visible]
  )

  return (
    <>
      <Button 
        display={['none', 'none', 'inline-flex']}
        onClick={handleClick} 
        variant={isDarkMode ? 'primaryDark' : 'primary'}
      >
        {children}
      </Button>

      <Button
        display={['inline-flex', 'inline-flex', 'none']}
        variant={isDarkMode ? 'primaryDark' : 'primary'}
        onClick={handleClick} 
        px='0'
      >
        <BiWallet />
      </Button>
    </>
  )
}
