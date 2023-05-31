import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  HStack,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  keyframes,
  Link,
  Spinner,
  Stack,
  StackDivider,
  Switch,
  Text,
  useColorMode,
  useDisclosure,
  useOutsideClick,
  VStack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { BiMenu, BiPlusCircle, BiX } from 'react-icons/bi'
import { SearchIcon } from '@chakra-ui/icons'
import { WalletMultiButton } from '../../../components/wallet-ui'
import { useWallet } from '@solana/wallet-adapter-react'
import { Logo } from '../components/Logo'
import { debounce } from 'lodash'
import { trpc } from '../../../utils/trpc'
import { projectType, raffleType } from '../../techRaffles/types'
import { ProfilePicture } from '../components/ProfilePicture'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { formatFloatForDisplay } from '../../../utils/utils'
import ThemeSwitch from '../components/ThemeSwitch'

interface IHeaderProps {
  theme: 'transparent' | 'solid'
  rounded?: 'full' | 'unset'
  showNewsSubheader?: boolean
}

const textSlide = keyframes`
  from { transform: translateX(100%); }
  to { transform: translateX(-100%); }
`

const Header: FC<IHeaderProps> = ({ theme, rounded, showNewsSubheader }) => {
  const isTransparent = theme === 'transparent'
  const { colorMode } = useColorMode()

  const { publicKey } = useWallet()
  const base58 = useMemo(() => publicKey?.toBase58(), [publicKey])

  const { isOpen, onToggle, onClose } = useDisclosure()

  const {
    isOpen: isDesktopSearchOpen,
    onOpen: onDesktopSearchOpen,
    onClose: onDesktopSearchClose,
  } = useDisclosure()
  const {
    isOpen: isMobileSearchOpen,
    onOpen: onMobileSearchOpen,
    onClose: onMobileSearchClose,
  } = useDisclosure()

  const [debouncedQuery, setDebouncedQuery] = useState('')
  const debouncedChangeHandler = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setDebouncedQuery(event.target.value)
    }, 300),
    []
  )

  const desktopSearchRef = useRef(null)
  useOutsideClick({
    ref: desktopSearchRef,
    handler: () => {
      if (isDesktopSearchOpen) {
        onDesktopSearchClose()
      }
    },
  })

  const mobileSearchRef = useRef(null)
  useOutsideClick({
    ref: mobileSearchRef,
    handler: () => {
      if (isMobileSearchOpen) {
        onMobileSearchClose()
      }
    },
  })

  const solidBackground = colorMode === 'light' ? '#FFF' : 'backgroundBlack'
  const isDarkMode = colorMode === 'dark'
  const isTransparentOrDarkMode = isTransparent || isDarkMode

  return (
    <>
      {showNewsSubheader && (
        <Stack
          maxW='100vw'
          paddingY='.4rem'
          w={'100vw'}
          backgroundColor={isDarkMode ? '#181818' : '#FAFAFA'}
          display='flex'
          justify={'center'}
          alignItems='center'
          position='relative'
          px={'.6rem'}
          overflow='hidden'
        >
          <NextLink passHref href='https://discord.gg/MT9V3uyE'>
            <Link target='_blank'>
              <Text
                maxWidth={'100vw'}
                px='.6rem'
                transform={[
                  /*'translateX(0)',*/
                  'unset',
                ]}
                animation={[
                  /*`${textSlide} 15s linear infinite`,
                `${textSlide} 15s linear infinite`,*/
                  'unset',
                ]}
                color={isDarkMode ? 'white' : '#525c5d'}
                fontWeight={550}
                fontSize={['0.75rem', '0.825rem']}
                textAlign={['center']}
              >
                Join our Raffle DAO to join a community of web3 enthusiasts and get additional benefits for supporting Monet
              </Text>
            </Link>
          </NextLink>
        </Stack>
      )}
      <Box
        display={['none', 'none', 'none', 'block']}
        position='sticky'
        zIndex={300}
        top={0}
        shadow='sm'
        left={0}
        width='100%'
        backgroundColor={
          isTransparent ? 'rgba(255, 255, 255, 0.06)' : solidBackground
        }
      >
        <Flex w='100%' px='1rem' justifyContent={'center'}>
          <Stack
            spacing={0}
            align='center'
            justify='space-between'
            zIndex='300'
            position='relative'
            rounded={rounded ?? 'unset'}
            direction='row'
            py='.5rem'
            mx='-1rem'
            width='100%'
            px='1.5rem'
            backdropFilter='blur(3px)'
          >
            <Stack alignItems='center' gap='1.875rem' direction='row'>
              <Logo href='/' fontSize='2.25rem' isDark={isTransparent} />
              <Box ref={desktopSearchRef}>
                <InputGroup>
                  <Input
                    onChange={debouncedChangeHandler}
                    onFocus={onDesktopSearchOpen}
                    w={['15rem', '18rem', '18rem']}
                    rounded='full'
                    placeholder='Search raffles, communities etc...'
                    _placeholder={{
                      color: isTransparentOrDarkMode
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(0, 0, 0, 0.4)',
                    }}
                    bg={
                      isTransparentOrDarkMode
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.6)'
                    }
                    borderColor={
                      isTransparentOrDarkMode
                        ? 'rgba(255, 255, 255, 0.3)'
                        : '#E2E8F0'
                    }
                    color={isTransparentOrDarkMode ? '#fff' : '#232323'}
                    fontSize='.85rem'
                  />
                  <InputLeftElement
                    pointerEvents='none'
                    children={<SearchIcon color='gray.300' />}
                  />
                </InputGroup>
                {isDesktopSearchOpen && debouncedQuery.length > 0 && (
                  <Box
                    position='absolute'
                    borderRadius='20px'
                    borderColor={isDarkMode ? '#494949' : '#BDBDBD'}
                    backgroundColor={isDarkMode ? 'backgroundBlack' : '#FFFFFF'}
                    borderWidth='1px'
                    zIndex={1}
                    w={['19rem', '22rem', '22rem']}
                    p='1rem'
                    mt={3}
                    overflowY='scroll'
                  >
                    <SearchResults queryString={debouncedQuery} />
                  </Box>
                )}
              </Box>
              <Stack spacing={0} direction='row' align='center' height='100%'>
                <NextLink href='/raffles' passHref>
                    <Link variant='nav'>
                      <Button
                        variant={
                          isTransparentOrDarkMode ? 'secondaryDark' : 'secondary'
                        }
                        color={isTransparentOrDarkMode ? '#eee' : ''}
                      >
                        Raffles
                      </Button>
                    </Link>
                </NextLink>
                <NextLink href='/communities' passHref>
                  <Link variant='nav'>
                    <Button
                      variant={
                        isTransparentOrDarkMode ? 'secondaryDark' : 'secondary'
                      }
                      color={isTransparentOrDarkMode ? '#eee' : ''}
                    >
                      Communities
                    </Button>
                  </Link>
                </NextLink>
                <NextLink href='/leaderboard' passHref>
                  <Link variant='nav'>
                    <Button
                      variant={
                        isTransparentOrDarkMode ? 'secondaryDark' : 'secondary'
                      }
                      color={isTransparentOrDarkMode ? '#eee' : ''}
                    >
                      Leaderboard
                    </Button>
                  </Link>
                </NextLink>

                {base58 ? (
                  <NextLink href={`/u/${base58}`} passHref>
                    <Link variant='nav'>
                      <Button
                        variant={
                          isTransparentOrDarkMode
                            ? 'secondaryDark'
                            : 'secondary'
                        }
                        color={isTransparentOrDarkMode ? '#eee' : ''}
                      >
                        Profile
                      </Button>
                    </Link>
                  </NextLink>
                ) : (
                  <></>
                )}
              </Stack>
            </Stack>

            <HStack>
              <ThemeSwitch></ThemeSwitch>
              <NextLink href='/create' passHref>
                <Link _hover={{}}>
                  <Button
                    variant={
                      isTransparentOrDarkMode ? 'secondaryDark' : 'secondary'
                    }
                    leftIcon={<BiPlusCircle />}
                  >
                    Create
                  </Button>
                </Link>
              </NextLink>
              <WalletMultiButton />
            </HStack>
          </Stack>
        </Flex>
      </Box>
      <Box
        position='sticky'
        zIndex={300}
        top={0}
        left={0}
        shadow='sm'
        width='100%'
        display={['block', 'block', 'block', 'none']}
      >
        <Flex justifyContent={'center'}>
          <Stack
            width={'100%'}
            align='center'
            justify='space-between'
            direction='row'
            zIndex='2'
            position='relative'
            py='.5rem'
            px='.6rem'
            bg={isTransparent ? 'rgba(255, 255, 255, 0.06)' : solidBackground}
          >
            <Logo href='/' fontSize='1.5rem' isDark={isTransparent} />

            <HStack spacing='.5rem'>
              <ThemeSwitch></ThemeSwitch>
              <NextLink href='/create' passHref>
                <Link _hover={{}}>
                  <Button
                    variant={
                      isTransparentOrDarkMode ? 'secondaryDark' : 'secondary'
                    }
                    leftIcon={<BiPlusCircle />}
                  >
                    Create
                  </Button>
                </Link>
              </NextLink>

              <WalletMultiButton />
              <Button
                variant={
                  isTransparentOrDarkMode ? 'secondaryDark' : 'secondary'
                }
                px='.5rem'
                onClick={() => {
                  onToggle()
                  onMobileSearchClose()
                }}
              >
                {isOpen ? <BiX /> : <BiMenu />}
              </Button>
            </HStack>
          </Stack>
        </Flex>

        {isOpen && (
          <>
            <Box
              position='absolute'
              zIndex='1'
              h='100vh'
              w='100vw'
              top='0'
              left='0'
              bg='rgba(0,0,0,0.4)'
            ></Box>
            <Stack
              mt='1rem'
              rounded='15px'
              mx='.4rem'
              bg={isDarkMode ? 'backgroundBlack' : 'white'}
              zIndex='2'
              position='relative'
              width='100%'
              spacing={0}
              overflow='hidden'
              divider={
                <StackDivider
                  borderColor={isDarkMode ? '#494949' : 'gray.200'}
                />
              }
            >
              <NextLink passHref href='/raffles'>
                <Link variant={isDarkMode ? 'mobileNavDark' : 'mobileNav'}>
                  Raffles
                </Link>
              </NextLink>
              <NextLink passHref href='/communities'>
                <Link variant={isDarkMode ? 'mobileNavDark' : 'mobileNav'}>
                  Communities
                </Link>
              </NextLink>
              <NextLink passHref href='/leaderboard'>
                <Link variant={isDarkMode ? 'mobileNavDark' : 'mobileNav'}>
                  Leaderboard
                </Link>
              </NextLink>
              {base58 ? (
                <NextLink passHref href={`/u/${base58}`}>
                  <Link variant={isDarkMode ? 'mobileNavDark' : 'mobileNav'}>
                    Profile
                  </Link>
                </NextLink>
              ) : (
                <></>
              )}
              <Box>
                <InputGroup py='0.7rem'>
                  <Input
                    onChange={debouncedChangeHandler}
                    onFocus={onMobileSearchOpen}
                    border='none'
                    placeholder='Search raffles, communities etc...'
                    _placeholder={{
                      color: isTransparentOrDarkMode
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(0, 0, 0, 0.4)',
                    }}
                    bg={'transparent'}
                    color={isTransparentOrDarkMode ? '#fff' : '#232323'}
                    _focus={{ border: 'none' }}
                  />
                  <InputLeftElement
                    top='inherit'
                    pointerEvents='none'
                    children={<SearchIcon color='gray.300' />}
                  />
                </InputGroup>
              </Box>
            </Stack>
          </>
        )}
        {isMobileSearchOpen && debouncedQuery.length > 0 && (
          <Box
            position='absolute'
            borderRadius='20px'
            borderColor={isDarkMode ? '#494949' : '#BDBDBD'}
            backgroundColor={isDarkMode ? 'backgroundBlack' : '#FFFFFF'}
            borderWidth='1px'
            zIndex={1}
            w='90%'
            p='1rem'
            mt={3}
            left='5%'
            ref={mobileSearchRef}
            overflowY='scroll'
          >
            <SearchResults queryString={debouncedQuery} />
          </Box>
        )}
      </Box>
    </>
  )
}

const SearchResults = (props: { queryString: string }) => {
  const { colorMode } = useColorMode()
  const [showEnded, setShowEnded] = useState(false)

  const { data: raffleSearchResults, isLoading: isRaffleLoading } =
    trpc.useQuery(
      ['raffle.search', { search: props.queryString, includeEnded: showEnded }],
      { enabled: props.queryString.length > 0 }
    )
  const { data: projectSearchResults, isLoading: isProjectLoading } =
    trpc.useQuery(['project.search', { search: props.queryString }], {
      enabled: props.queryString.length > 0,
    })
  const { data: userSearchResults, isLoading: isUserLoading } = trpc.useQuery(
    ['user.search', { search: props.queryString }],
    { enabled: props.queryString.length > 0 }
  )
  const { data: collectionSearchResults, isLoading: isCollectionLoading } =
    trpc.useQuery(['collection.search', { search: props.queryString }], {
      enabled: props.queryString.length > 0,
    })

  const nothingFound = useMemo(() => {
    return (
      (raffleSearchResults?.length ?? 0) < 1 &&
      !isRaffleLoading &&
      (projectSearchResults?.length ?? 0) < 1 &&
      !isProjectLoading &&
      (userSearchResults?.length ?? 0) < 1 &&
      !isUserLoading &&
      (collectionSearchResults?.length ?? 0) < 1 &&
      !isCollectionLoading
    )
  }, [
    raffleSearchResults,
    projectSearchResults,
    userSearchResults,
    collectionSearchResults,
    isRaffleLoading,
    isProjectLoading,
    isUserLoading,
    isCollectionLoading,
  ])

  return (
    <>
      <Flex align='center' justify='space-between'>
        <Text color='#BDBDBD' fontWeight={700} fontSize='16px' my={2}>
          Raffles
        </Text>

        <FormControl display='flex' alignItems='center' justifyContent='end'>
          <FormLabel
            htmlFor='showEnded'
            mb='0'
            fontSize='16px'
            color={colorMode === 'light' ? '#aaa' : '#ccc'}
          >
            Show ended
          </FormLabel>
          <Switch
            id='showEnded'
            isChecked={showEnded}
            onChange={() => setShowEnded(!showEnded)}
          />
        </FormControl>
      </Flex>

      <Grid templateColumns='repeat(1, 1fr)' gap={3}>
        {raffleSearchResults?.map((s) => (
          <SearchResult
            key={s.id}
            header={s.name}
            imageUrl={s.imageUrl}
            subtext={s.collection?.title}
            link={`/r/${s.id}`}
          />
        ))}
      </Grid>

      {(collectionSearchResults?.length ?? 0) > 0 && (
        <Text color='#BDBDBD' fontWeight={700} fontSize='16px' my={2}>
          Collections
        </Text>
      )}
      <Grid templateColumns='repeat(1, 1fr)' gap={3}>
        {collectionSearchResults?.map((s) => (
          <SearchResult
            key={s.name}
            header={s.title}
            imageUrl={s.image}
            subtext={`avg. price (24hrs): ${formatFloatForDisplay(
              (s.averagePrice24hr ?? 0) / LAMPORTS_PER_SOL
            )}`}
            link={`/collections/${s.name}`}
          />
        ))}
      </Grid>

      {(projectSearchResults?.length ?? 0) > 0 && (
        <Text color='#BDBDBD' fontWeight={700} fontSize='16px' my={2}>
          Projects
        </Text>
      )}
      <Grid templateColumns='repeat(1, 1fr)' gap={3}>
        {projectSearchResults?.map((s) => (
          <SearchResult
            key={s.publicId}
            header={s.platformName}
            gradientStart={s.gradientStart}
            gradientEnd={s.gradientEnd}
            imageUrl={s.profilePictureUrl}
            subtext={s.communityName}
            link={`/p/${s.publicId}`}
          />
        ))}
      </Grid>

      {(userSearchResults?.length ?? 0) > 0 && (
        <Text color='#BDBDBD' fontWeight={700} fontSize='16px' my={2}>
          Users
        </Text>
      )}
      <Grid templateColumns='repeat(1, 1fr)' gap={3}>
        {userSearchResults?.map((s) => (
          <SearchResult
            key={s.wallet}
            header={s.name}
            gradientEnd={s.gradientEnd}
            gradientStart={s.gradientStart}
            imageUrl={s.profilePictureUrl}
            subtext={s.holderInProjects
              .map((it) => it.communityName)
              .join(', ')}
            link={`/u/${s.wallet}`}
          />
        ))}
      </Grid>

      {nothingFound && <Text>The search yielded no results</Text>}

      {(isRaffleLoading ||
        isProjectLoading ||
        isUserLoading ||
        isCollectionLoading) && (
        <Center>
          <Spinner />
        </Center>
      )}
    </>
  )
}

const SearchResult = (props: {
  header: string
  subtext?: string
  gradientStart?: string
  gradientEnd?: string
  imageUrl: string | null
  link: string
}) => {
  const { colorMode } = useColorMode()
  return (
    <NextLink href={props.link} passHref>
      <Link
        _hover={{
          backgroundColor: colorMode === 'light' ? '#E6E6E3' : 'cardBlack',
          cursor: 'pointer',
        }}
        p={2}
        borderRadius='10px'
      >
        <Flex align='center' justify='start' gap={3}>
          <Box>
            <ProfilePicture
              gradientstart={props.gradientStart ?? ''}
              gradientend={props.gradientEnd ?? ''}
              w='56px'
              h='56px'
              borderRadius='10px'
              imageurl={props.imageUrl}
            />
          </Box>
          <VStack align='start'>
            <Text
              fontWeight={700}
              fontSize='16px'
              lineHeight='22px'
              isTruncated={true}
              maxWidth='13rem'
            >
              {props.header}
            </Text>
            <Text
              fontWeight={500}
              fontSize='14px'
              lineHeight='17px'
              isTruncated={true}
              maxWidth='13rem'
            >
              {props.subtext ?? ''}
            </Text>
          </VStack>
        </Flex>
      </Link>
    </NextLink>
  )
}

export default Header
