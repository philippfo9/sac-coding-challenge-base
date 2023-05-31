import {
  Badge,
  Button,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Image,
  Stack,
  Text,
  Flex,
  Box,
  HStack,
} from '@chakra-ui/react'
import React, { FC } from 'react'

interface Props {
  onClose: VoidFunction
  isOpen: boolean
}

export const DAppMonetWalletConnectModal: FC<Props> = (props) => {
  return (
    <Modal
      onClose={props.onClose}
      isOpen={props.isOpen}
      motionPreset='slideInBottom'
    >
      <ModalOverlay backdropBlur='blur(5px)' bg='rgba(0, 0, 0, 0.7)' />
      <ModalContent background='#fff' color='#232323' borderRadius='.5rem'>
        <ModalHeader
          fontFamily='PlayfairBlack'
          fontSize='2.25rem'
          fontWeight='900'
          textAlign='center'
        >
          Monet
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody fontFamily='Inter !important'>
          <Text textAlign='center' fontWeight='600' fontSize='1.5rem'>
            Select Wallet
          </Text>
          <Stack direction='column'>
            <Link
              mt='2.375rem'
              rounded='full'
              bg='#fff'
              p='.75rem 2rem'
              border='1px solid #E9E9E9'
            >
              <HStack justify='space-between'>
                <Text fontSize='1.25rem' fontWeight='600'>
                  Phantom
                </Text>
                <HStack>
                  <Badge rounded='full' color='#16B826' bg='#E1FFEB'>
                    Recommend
                  </Badge>
                  <Image src='/icons/logo-phantom.png' />
                </HStack>
              </HStack>
            </Link>
            <Link
              rounded='full'
              p='.75rem 2rem'
              bg='#fff'
              border='1px solid #E9E9E9'
            >
              <HStack justify='space-between'>
                <Text fontSize='1.25rem' fontWeight='600'>
                  Solfare
                </Text>
                <Image src='/icons/logo-solfare.png' />
              </HStack>
            </Link>
            <Link
              rounded='full'
              p='.75rem 2rem'
              bg='#fff'
              border='1px solid #E9E9E9'
            >
              <HStack justify='space-between'>
                <Text fontSize='1.25rem' fontWeight='600'>
                  Slope
                </Text>
                <Image src='/icons/logo-slope.png' />
              </HStack>
            </Link>
          </Stack>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  )
}
