import {
  useColorMode,
  Box,
  Center,
  Flex,
  HStack,
  IconButton,
  Image,
  Link,
  Spinner,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import { useCollectionBySlug } from '../techRaffles/hooks/collection'
import DAppLayout from './layouts/DAppLayout'
import { NftImage } from './DAppRaffleSingle'
import { formatFloatForDisplay } from '../../utils/utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { BsFillPatchCheckFill, BsTwitter } from 'react-icons/bs'
import { FaDiscord } from 'react-icons/fa'
import { TbWorld } from 'react-icons/tb'
import { ProfilePicture } from './components/ProfilePicture'
import { raffleMinType } from '../techRaffles/types'
import { useCollectionRafflesBySlug } from '../techRaffles/hooks/raffle'
import InfiniteScroll from 'react-infinite-scroll-component'
import { LoadingMoreRaffles } from './components/LoadingMoreRaffles'
import RaffleCardList from './components/RaffleCardList'
import RaffleCardListSkeleton from './components/Skeletons/RaffleCardListSkeleton'

const DAppCollectionOverview = () => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const { data: collection, isLoading } = useCollectionBySlug()

  const [raffles, setRaffles] = useState<raffleMinType[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState<number>(0)

  const { data, isFetching } = useCollectionRafflesBySlug(page)

  useEffect(() => {
    if (data) {
      const filtered = data.filter((r) => {
        for (const raffle of raffles) {
          if (r.id === raffle.id) {
            return false
          }
        }
        return true
      })

      const newArr = [...raffles, ...filtered]
      if (hasMore && newArr.length === raffles.length) {
        setHasMore(false)
      }

      setRaffles(newArr)
    }
  }, [data])

  return (
    <DAppLayout>
      {isLoading ? (
        <Center mt='8rem'>
          <Spinner />
        </Center>
      ) : (
        <>
          <Stack
            direction={['column', 'column', 'row']}
            w='100%'
            mt='4rem'
            spacing='4rem'
          >
            <NftImage imageUrl={collection?.image ?? ''} />
            <Box>
              <HStack gap={2}>
                <Text fontSize={['1.75rem', '2rem']} fontWeight='600'>
                  {collection?.title}
                </Text>
                {collection?.verified && (
                  <BsFillPatchCheckFill
                    color={isDarkMode ? 'white' : 'black'}
                    fontSize={'1.4rem'}
                  />
                )}
              </HStack>

              {collection?.project && (
                <Flex gap='4rem' mt='0.75rem'>
                  <HStack>
                    <ProfilePicture
                      gradientstart={collection.project.gradientStart}
                      gradientend={collection.project.gradientEnd}
                      w='2.5rem'
                      h='2.5rem'
                      rounded='full'
                      imageurl={collection?.project.profilePictureUrl}
                    />

                    <VStack align='start' spacing={0}>
                      <Text
                        fontSize='0.875rem'
                        color='#BDBDBD'
                        textAlign='left'
                      >
                        Author
                      </Text>
                      <HStack>
                        <Link href={`/p/${collection.project.publicId}`}>
                          <Text fontSize='0.875rem'>
                            @{collection.project?.communityName}
                          </Text>
                        </Link>

                        {collection.project.verified && (
                          <BsFillPatchCheckFill />
                        )}
                      </HStack>
                    </VStack>
                  </HStack>
                </Flex>
              )}

              <Stack direction='row' spacing={[1, 0, 5]} mt='2rem'>
                <Link
                  href={`https://magiceden.io/marketplace/${collection?.name}`}
                  target='_blank'
                >
                  <IconButton
                    aria-label='ME'
                    bg={isDarkMode ? '#4f4f4f' : 'black'}
                    border='none'
                    _hover={{
                      bg: 'rgba(0, 0, 0, 0.6)',
                    }}
                    icon={<Image src='/icons/logo-me.svg' />}
                  />
                </Link>

                {((collection?.twitter?.length ?? 0) > 0 ||
                  (collection?.project?.twitterUserHandle?.length ?? 0) >
                    0) && (
                  <Link
                    href={
                      collection?.twitter ??
                      `${
                        collection?.project?.twitterUserHandle
                          ? `https://twitter.com/${collection?.project?.twitterUserHandle}`
                          : ''
                      }`
                    }
                    target='_blank'
                  >
                    <IconButton
                      rounded='full'
                      bg={isDarkMode ? '#4f4f4f' : 'black'}
                      aria-label='twitter'
                      _hover={{
                        bg: 'rgba(0, 0, 0, 0.6)',
                      }}
                      icon={<BsTwitter color='white' />}
                    />
                  </Link>
                )}

                {((collection?.discord?.length ?? 0) > 0 ||
                  (collection?.project?.discordInviteLink?.length ?? 0) >
                    0) && (
                  <Link
                    href={
                      collection?.discord ??
                      collection?.project?.discordInviteLink ??
                      ''
                    }
                    target='_blank'
                  >
                    <IconButton
                      border='none'
                      bg={isDarkMode ? '#4f4f4f' : 'black'}
                      aria-label='discord'
                      rounded='full'
                      _hover={{
                        bg: 'rgba(0, 0, 0, 0.6)',
                      }}
                      icon={<FaDiscord color='white' />}
                    />
                  </Link>
                )}

                {((collection?.website?.length ?? 0) > 0 ||
                  (collection?.project?.websiteUrl?.length ?? 0) > 0) && (
                  <Link
                    href={
                      collection?.website ??
                      collection?.project?.websiteUrl ??
                      ''
                    }
                    target='_blank'
                  >
                    <IconButton
                      aria-label='share'
                      bg={isDarkMode ? '#4f4f4f' : 'black'}
                      border='none'
                      _hover={{
                        bg: 'rgba(0, 0, 0, 0.6)',
                      }}
                      icon={<TbWorld color='white' />}
                    />
                  </Link>
                )}
              </Stack>
              <Stack>
                <Text fontWeight={600} mt='3rem'>
                  Collection Info
                </Text>
                <CollectionStat
                  label='Avg. Sale (24h)'
                  value={collection?.averagePrice24hr}
                />
                <CollectionStat
                  label='Floor Price'
                  value={collection?.floorPrice}
                />
              </Stack>
            </Box>
          </Stack>

          <Stack direction='row' alignItems='center' mt='5rem'>
            <Text fontSize='1.875rem' fontWeight='600'>
              All Raffles
            </Text>
            <Box>
              <Text
                ml='1rem'
                rounded='full'
                padding='.25rem .75rem'
                bg={isDarkMode ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.8)'}
                color='white'
                fontWeight='600'
              >
                {collection?._count?.usedInRaffles ?? (
                  <Spinner size='sm' mt='0.3rem' />
                )}
              </Text>
            </Box>
          </Stack>

          {raffles && raffles.length > 0 ? (
            <InfiniteScroll
              scrollThreshold={0.6}
              dataLength={raffles.length}
              next={() => setPage(page + 1)}
              hasMore={hasMore}
              loader={
                <Center mt='3rem'>
                  <LoadingMoreRaffles />
                </Center>
              }
              endMessage={
                <Center mt='3rem'>
                  {!isFetching ? <Text></Text> : <LoadingMoreRaffles />}
                </Center>
              }
            >
              <RaffleCardList raffles={raffles} />
            </InfiniteScroll>
          ) : isFetching && (raffles?.length ?? 0) < 1 ? (
            <RaffleCardListSkeleton />
          ) : (
            <Center mt='3rem'>
              <Text>No Raffles available</Text>
            </Center>
          )}
        </>
      )}
    </DAppLayout>
  )
}

const CollectionStat = ({
  label,
  value,
}: {
  label: string
  value?: number | null
}) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  return (
    <Flex
      justify='space-between'
      gap='3rem'
      border={isDarkMode ? '1px solid #494949' : '1px solid #E9E9E9'}
      borderRadius='15px'
      userSelect='none'
      px='1.5rem'
      py='.75rem'
      _hover={{
        borderColor: isDarkMode ? '#AAA' : '#232323',
        transform: 'scale(1.01)',
      }}
    >
      <Text>{label}</Text>
      <Flex alignItems={'center'} justifyContent='center'>
        <Text>{formatFloatForDisplay((value ?? 0) / LAMPORTS_PER_SOL)}</Text>
        <Image
          ml={1}
          display='inline'
          src='/icons/solanaLogoMark.svg'
          w='12px'
          h='100%'
        ></Image>
      </Flex>
    </Flex>
  )
}

export default DAppCollectionOverview
