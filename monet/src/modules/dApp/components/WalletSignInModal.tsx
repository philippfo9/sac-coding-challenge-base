import 'react-alice-carousel/lib/alice-carousel.css'
import {
  Button,
  HStack,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Image,
  Text,
  useDisclosure,
  VStack,
  Skeleton,
  Box,
  FormControl,
  FormLabel,
  Switch,
  Flex,
  useColorMode
} from '@chakra-ui/react'
import React, {
  FC, useState,
} from 'react'
import { Logo } from './Logo';
import { Player as Lottie } from '@lottiefiles/react-lottie-player';
import { useStartAuthTx } from '../../common/auth/startAuthHook';
import { useWalletSignInModal } from '../../../components/wallet-ui/useWalletSignInModal';

export const WalletSignInModal: FC<{
className?: string
  container?: string}> = ({className, container}) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const {isLedger, visible, setVisible} = useWalletSignInModal()
  const [isLedgerForm, setIsLedgerForm] = useState(isLedger ?? false)
  const {startSignAuthMsg, startSignAuthTx} = useStartAuthTx()

  return (
    <>
      <Modal isOpen onClose={() => setVisible(false)}>
        <ModalOverlay/>
        <ModalContent background={isDarkMode ? '#1f2023' : '#fcfcfc'} maxWidth={['96%', '96%', '30rem']}>
          <ModalHeader textAlign='center'></ModalHeader>
          <ModalBody textAlign='center'>
            <VStack gap='1.4rem'>
              <Logo isDark={isDarkMode} />
              <Text fontWeight={500}>Sign {isLedgerForm ? 'a transaction' : 'a message'} to prove ownership of the wallet and login{isLedger ? ', no funds will be transferred.' : '.'}</Text>
              <Flex alignItems='center' justifyContent='center'>
                <FormControl display='flex' alignItems='center'>
                  <FormLabel color='textGreyDark' htmlFor='is-ledger' mb='0'>
                    Is Ledger?
                  </FormLabel>
                  <Switch isChecked={isLedgerForm} onChange={(e) => setIsLedgerForm(!isLedgerForm)} id='is-ledger' />
                </FormControl>
              </Flex>
              
              <Button variant={isDarkMode ? 'primaryDark' : 'primary'} onClick={async () => {
                const res = isLedgerForm ? startSignAuthTx() : startSignAuthMsg()
                const success = await res
                console.log(success.data);
                
                setVisible(!success.data)
              }}>
                {isLedgerForm ? 'Sign transaction' : 'Sign message'}
              </Button>

              <Lottie src='https://lottie.host/853e008d-ce9c-4f43-b640-7cf772f64fb0/S0OnDgiIaX.json' autoplay keepLastFrame 
                style={{height: '7rem'}}
              />
            </VStack>
          </ModalBody>
          <ModalFooter/>
        </ModalContent>
      </Modal>
    </>
  )
}
