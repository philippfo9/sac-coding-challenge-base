import { TriangleDownIcon } from '@chakra-ui/icons'
import {
  Button,
  ButtonProps,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { useWallet } from '@solana/wallet-adapter-react'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { defaultButtonStyle, defaultDarkModeButtonStyle } from './common'
import { useWalletModal } from './useWalletModal'
import { WalletConnectButton } from './WalletConnectButton'
import { WalletIcon } from './WalletIcon'
import { WalletModalButton } from './WalletModalButton'
import { FiLogOut, FiPlusCircle, FiSettings, FiUser } from 'react-icons/fi'
import { BiWallet } from 'react-icons/bi'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { solanaAuthAtom } from '../../modules/common/auth/authAtom'
import NextLink from 'next/link'

export const WalletMultiButton: FC<ButtonProps> = ({ children, ...props }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const { publicKey, wallet, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const [solanaAuth, setSolanaAuth] = useRecoilState(solanaAuthAtom)
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])
  const content = useMemo(() => {
    if (children) return children
    if (!wallet || !base58) return null
    return base58.slice(0, 4) + '..' + base58.slice(-4)
  }, [children, wallet, base58])

  const copyAddress = useCallback(async () => {
    if (base58) {
      await navigator.clipboard.writeText(base58)
      setCopied(true)
      setTimeout(() => setCopied(false), 400)
    }
  }, [base58])

  const openDropdown = useCallback(() => {
    setActive(true)
  }, [])

  const closeDropdown = useCallback(() => {
    setActive(false)
  }, [])

  const openModal = useCallback(() => {
    setVisible(true)
    closeDropdown()
  }, [closeDropdown])

  const navigateToSite = (url: string) => {
    void router.push(url)
  }

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const node = ref.current

      // Do nothing if clicking dropdown or its descendants
      if (!node || node.contains(event.target as Node)) return

      closeDropdown()
    }

    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, closeDropdown])

  if (!wallet) return <WalletModalButton>{children}</WalletModalButton>
  if (!base58)
    return <WalletConnectButton {...props}>{children}</WalletConnectButton>

  return (
    <div className='wallet-adapter-dropdown'>
      <Button
        display={['none', 'none', 'inline-flex']}
        variant={isDarkMode ? 'primaryDark' : 'primary'}
        aria-expanded={active}
        style={{ pointerEvents: active ? 'none' : 'auto', ...props.style }}
        onClick={openDropdown}
        // <WalletIcon wallet={wallet} width={20} height={20} />
        leftIcon={<FiUser />}
        rightIcon={<TriangleDownIcon />}
        css={isDarkMode ? defaultDarkModeButtonStyle : defaultButtonStyle}
        {...props}
      >
        {content}
      </Button>

      <Button
        display={['inline-flex', 'inline-flex', 'none']}
        variant={isDarkMode ? 'primaryDark' : 'primary'}
        px='0'
        aria-expanded={active}
        onClick={openDropdown}
      >
        <BiWallet />
      </Button>

      {active && (
        <Stack
          pos='absolute'
          top='100%'
          transform='translateY(10px)'
          zIndex='100'
          right='0'
          borderRadius='20px'
          py='0.75rem'
          px='0'
          border='1px solid'
          bg={isDarkMode ? 'backgroundBlack' : '#fff'}
          borderColor={isDarkMode ? '#494949' : '#BDBDBD'}
          alignItems='flex-start'
          overflow='hidden'
          ref={ref}
        >
          <Text
            display={['flex', 'flex', 'none']}
            px='1rem'
            fontWeight='500'
            pb='.75rem'
            borderBottom='1px solid'
            borderColor={isDarkMode ? '#494949' : '#BDBDBD'}
            w='100%'
          >
            <WalletIcon
              wallet={wallet}
              width={20}
              height={20}
              style={{ marginRight: '.5rem' }}
            />{' '}
            {content}
          </Text>

          <NextLink passHref href={`/u/${base58}`}>
            <Button
              variant={isDarkMode ? 'walletDropdownDark' : 'walletDropdown'}
              leftIcon={<FiUser />}
            >
              Profile
            </Button>
          </NextLink>
          <NextLink passHref href='/admin/new'>
            <Button
              variant={isDarkMode ? 'walletDropdownDark' : 'walletDropdown'}
              leftIcon={<FiPlusCircle />}
            >
              Create new Community
            </Button>
          </NextLink>

          <NextLink passHref href='/admin'>
            <Button
              variant={isDarkMode ? 'walletDropdownDark' : 'walletDropdown'}
              leftIcon={<FiSettings />}
            >
              Manage Community
            </Button>
          </NextLink>
          <Button
            variant={isDarkMode ? 'walletDropdownDark' : 'walletDropdown'}
            leftIcon={<FiLogOut />}
            onClick={() => {
              disconnect()
              setSolanaAuth(undefined)
              closeDropdown()
            }}
          >
            Log Out
          </Button>
        </Stack>
      )}
    </div>
  )
}
