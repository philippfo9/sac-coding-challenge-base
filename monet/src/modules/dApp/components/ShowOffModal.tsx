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
  useColorMode,
} from '@chakra-ui/react'
import React, {
  FC,
} from 'react'
import { createAndUploadWinnerImageS3 } from '../../../utils/twitterImages';
import { raffleType } from '../../techRaffles/types';
import { useRaffleWinnerImage } from '../../techRaffles/hooks/raffle';
import { FaTwitter } from 'react-icons/fa';

interface Props {
  raffle: raffleType,
}

export const ShowOffModal: FC<Props> = ({raffle}: Props) => {
  const {isOpen, onOpen, onClose} = useDisclosure()
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'

  const imgUrl = useRaffleWinnerImage(raffle.id)

  const getTwitterUrl = () => {
    return encodeURI(`https://twitter.com/intent/tweet?text=I just won ${raffle.name} on @MonetSAC! 🚀`).replaceAll('#', '%23')
  }

  return (
    <>
      <Button
        variant={isDarkMode ? 'primaryDark' : 'primary'}
        aria-label='show off'
        onClick={onOpen}
      >
        Show off
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent maxWidth={['96%', '96%', '64rem']}>
          <ModalHeader>Show Off</ModalHeader>
          <ModalCloseButton/>
          <ModalBody textAlign='center'>
            {imgUrl.isLoading ? (<>
              <Skeleton w='100%' h={['10rem', '12rem', '24rem']} />
              <Skeleton w='8rem' h='2rem' mt='2rem' mx='auto'/>
            </>) : ( 
            <>
              <Image 
                src={imgUrl.data}
                maxWidth='48rem'
                border='1px solid #E2E8F0'
                borderRadius='10px'
                mx='auto'
              />
              <VStack gap='.5rem'>
                <Button variant='underline' onClick={() => window.open(imgUrl.data, '_blank')}>
                  Download Image
                </Button>

                <Link 
                  href={getTwitterUrl()}
                  target='_blank' 
                  _hover={{}}
                >
                  <Button 
                    bgColor='#1d9bf0' 
                    color='#fff'
                    _hover={{
                      bgColor: '#0c7abf'
                    }}
                    leftIcon={<FaTwitter />}
                  >
                    Share on Twitter
                  </Button>
                </Link>

                {/* <Button variant={isDarkMode ? 'primaryDark' : 'primary'} fontSize='1rem'>
                  Post with Monet Twitter Bot
                </Button> */}

              </VStack>
            </>
            )}
          </ModalBody>

          <ModalFooter justifyContent='center' pt='2rem'>
            <Button variant='outlined' onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
