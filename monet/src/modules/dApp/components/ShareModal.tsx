import 'react-alice-carousel/lib/alice-carousel.css'
import {
  useColorMode,
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
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react'
import React, {
  FC,
  useCallback,
  useMemo,
  useState
} from 'react'
import {
  FaCheck,
  FaTwitter,
  FaWhatsapp
} from 'react-icons/fa';
import {
  FiMail,
  FiShare
} from 'react-icons/fi';

interface Props {
  text?: string | null
  link?: string | null
}

export const ShareModal: FC<Props> = (props: Props) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const {link} = props;
  const {isOpen, onOpen, onClose} = useDisclosure()
  const [copied, setCopied] = useState(false)
  const copyAddress = useCallback(async () => {
    if (link) {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }, [link])

  const socialMedia = useMemo(() => {
    if (!link) {
      return [];
    }
    let text = '';
    if (props.text) {
      text += `Raffling off ${props.text}!`;
    }
    text += `\n\nCheck it out: ${link}`;
    text = encodeURIComponent(text);
    return [
      {name: 'Twitter', icon: <FaTwitter size='2rem'/>, link: `https://twitter.com/intent/tweet?text=${text}`},
      {name: 'WhatsApp', icon: <FaWhatsapp size='2rem'/>, link: `https://api.whatsapp.com/send/?text=${text}`},
      {name: 'Email', icon: <FiMail size='2rem' />, link: `mailto:?subject=Monet Raffle&body=${text}`}
    ]
  }, [link]);

  return (
    <>
      <IconButton
        aria-label='share'
        onClick={onOpen}
        icon={<FiShare/>}
        _hover={{
          bg: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f7f7f7',
        }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay/>
        <ModalContent background={isDarkMode ? '#1f2023' : '#fff'} maxWidth={['96%', '96%', '42rem']}>
          <ModalHeader>Share</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <VStack gap='2rem'>
              <HStack align='start' gap='2rem'>
                {socialMedia.map(s => 
                  <Link key={s.name} href={s.link} isExternal _hover={{}}>
                    <Button variant={isDarkMode ? 'secondaryDark' : 'secondary'} height='unset' p='.75rem 1rem' rounded='15px'>
                      <VStack>
                        {s.icon}
                        <Text>{s.name}</Text>
                      </VStack>
                    </Button>
                  </Link>
                )}
              </HStack>
              <VStack maxWidth='100%'>
                <Text textAlign={'center'} maxWidth='100%' whiteSpace={'normal'}>{link}</Text>
                <Button variant={isDarkMode ? 'primaryDark' : 'primary'} onClick={copyAddress} py='1.25rem' fontSize='.875rem'>
                  <HStack alignItems='center'>
                    {copied ? (<><FaCheck color={isDarkMode ? 'black' : 'white'} style={{marginRight: '10px'}}/> Copied</>) : (<>Copy Link</>)}
                  </HStack>
                </Button>
              </VStack>
            </VStack>
          </ModalBody>

          <ModalFooter justifyContent='center'>
            <Button variant={isDarkMode ? 'outlinedDark' : 'outlined'} mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
