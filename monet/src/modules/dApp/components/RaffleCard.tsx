import {
  AspectRatio,
  Badge,
  Box,
  Flex,
  HStack,
  Image,
  Link,
  Skeleton,
  Spinner,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from '@chakra-ui/react'
import * as d from 'date-fns'
import React, { useMemo, useState } from 'react'
import { BsFillPatchCheckFill } from 'react-icons/bs'
import { HiOutlineTicket } from 'react-icons/hi'
import { Player as Lottie } from '@lottiefiles/react-lottie-player'
import { OnChainRaffleType, raffleMinType } from '../../techRaffles/types'
import RaffleCountdown from './RaffleCountdown'
import { ProfilePicture } from './ProfilePicture'
import { SaveRaffleButton } from './SaveRaffleButton'
import { useWallet } from '@solana/wallet-adapter-react'
import { formatFloatForDisplay } from '../../../utils/utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { compareTokensForSort } from '../../../utils/tokenSortUtil'
import { hasRaffleEnded } from '../../techRaffles/raffleUtils'
import NextLink from 'next/link'
import { ChakraNextImage, NextImage } from './NextImage'

type cardType = {
  w?: string | string[]
  h?: string
  imgH?: string
  raffle: raffleMinType & { onChainData?: OnChainRaffleType | null }
}

export const RaffleCard: (props: cardType) => JSX.Element = (
  props: cardType
) => {
  const { colorMode } = useColorMode()
  const { w = '100%', h = 'unset', imgH = 'unset', raffle } = props
  const name = raffle.name
  const isRegularRaffler = (raffle.creatorUser?._count.createdRaffles ?? 0) > 4
  const flaggedLabel = raffle.creatorUser?.hasBeenFlagged
    ? 'Flagged Raffler'
    : raffle.creatorProject && !raffle.creatorProject.verified
    ? 'Unverified Project'
    : undefined
  const verified = !!flaggedLabel
    ? false
    : raffle.creatorProject?.verified ??
      (raffle.creatorUser?.isTrustedRaffler || isRegularRaffler) ??
      false
  const isTrusted =
    raffle.creatorProject?.verified ?? raffle.creatorUser?.isTrustedRaffler
  const verifiedLabel = verified
    ? raffle.creatorProject?.verified
      ? 'Verified Project'
      : raffle.creatorUser?.isTrustedRaffler
      ? 'Trusted Raffler'
      : isRegularRaffler
      ? 'Regular Raffler'
      : undefined
    : undefined
  const image = raffle.imageUrl
  const isNFTRaffle = raffle.type === 'NFT'
  const isWhitelistRaffle = raffle.type === 'WHITELIST'
  const isIRLRaffle = raffle.type === 'IRL'
  const owner = useMemo(() => {
    return (
      raffle.creatorProject?.communityName ??
      raffle.creatorUser!.name ??
      `${raffle.creatorUser!.wallet.slice(
        0,
        4
      )}...${raffle.creatorUser!.wallet.slice(-4)}`
    )
  }, [raffle])
  const price = raffle.ticketPrice
  const priceToken = raffle.ticketPriceToken?.symbol
  const maxTickets = raffle.maxTickets
  const [imageIsHover, setImageIsHover] = useState(false)
  const wallet = useWallet()

  const [possiblyEnded, setPossiblyEnded] = useState(false)
  const hasEnded = useMemo(() => {
    return hasRaffleEnded(raffle)
  }, [raffle?.ends, possiblyEnded])

  const allowedPurchaseTokens = useMemo(() => {
    if (!raffle.allowedPurchaseTokens) return []
    return raffle.allowedPurchaseTokens.sort((a, b) =>
      compareTokensForSort(a.token, b.token)
    )
  }, [raffle.allowedPurchaseTokens])

  const userWon = useMemo(() => {
    return (
      !!wallet.publicKey &&
      raffle.onChainData?.winners.some((winner) =>
        winner.equals(wallet.publicKey!)
      )
    )
  }, [wallet, raffle])

  const timeEl = useMemo(() => {
    const today = new Date()

    if (hasEnded) {
      return (
        <Box
          // bg='rgba(255, 255, 255, 0.8)'
          bg='rgba(0, 0, 0, 0.8)'
          color='#fff'
          position='absolute'
          top='.6rem'
          right='.6rem'
          borderRadius='1rem'
          py='0.5rem'
          px='1rem'
          fontWeight='600'
          fontSize='0.75rem'
        >
          Ended
        </Box>
      )
    }

    if (raffle.status === 'SCHEDULED' || raffle.status === 'IN_CREATION') {
      if (!d.isAfter(today, raffle.starts) || raffle.status === 'IN_CREATION') {
        return (
          <Box
            bg='rgba(255, 255, 255, 0.8)'
            position='absolute'
            top='.6rem'
            right='.6rem'
            borderRadius='1rem'
            py='0.5rem'
            px='1rem'
            fontWeight='600'
            fontSize='0.75rem'
          >
            Upcoming
          </Box>
        )
      } else if (d.isBefore(today, raffle.ends)) {
        return (
          <Box w='fit-content' pos='absolute' top='.6rem' right='.6rem'>
            <RaffleCountdown
              variant='card'
              ends={raffle.ends}
              raffleEnded={() => {
                setPossiblyEnded(true)
              }}
            />
          </Box>
        )
      }
    }
  }, [raffle, hasEnded])

  const boxBorder =
    colorMode === 'light'
      ? '1px solid #E9E9E9'
      : '1px solid rgba(255, 255, 255, 0.4)'

  return (
    <Box
      w={w}
      h={h}
      bg={colorMode === 'light' ? '#FFFFFF' : 'cardBlack'}
      color={colorMode === 'light' ? 'black' : '#FFF'}
      border={
        userWon
          ? '4px solid #FFBA15'
          : colorMode === 'light'
          ? '1px solid #E9E9E9'
          : '1px solid #393e43'
      }
      borderRadius='1.5rem'
      paddingY='1rem'
      boxShadow={colorMode === 'light' ? 'unset' : 'lg'}
    >
      <Flex justify='space-between' pt='0.5rem' px='1rem'>
        <HStack spacing='5px'>
          <NextLink
            passHref
            href={
              raffle.isUserRaffle
                ? `/u/${raffle.creatorUser!.wallet}`
                : `/p/${raffle.creatorProject!.publicId}`
            }
          >
            <Link fontSize='.875rem'>
              <Flex align='center' gap={2}>
                <ProfilePicture
                  imageurl={
                    raffle.isUserRaffle
                      ? raffle.creatorUser?.profilePictureUrl
                      : raffle.creatorProject?.profilePictureUrl
                  }
                  gradientstart={
                    raffle.isUserRaffle
                      ? raffle.creatorUser!.gradientStart
                      : raffle.creatorProject!.gradientStart
                  }
                  gradientend={
                    raffle.isUserRaffle
                      ? raffle.creatorUser!.gradientEnd
                      : raffle.creatorProject!.gradientEnd
                  }
                  w='1.75rem'
                  h='1.75rem'
                  rounded='full'
                />

                <Text isTruncated maxW='7rem'>
                  {owner}
                </Text>
              </Flex>
            </Link>
          </NextLink>
          {verifiedLabel && (
            <Tooltip label={verifiedLabel}>
              <Text as='span'>
                <BsFillPatchCheckFill color={isTrusted ? 'green' : 'gray'} />
              </Text>
            </Tooltip>
          )}
        </HStack>
        <Box border={boxBorder} borderRadius='1.5rem'>
          {isNFTRaffle && (
            <HStack
              pl='.75rem'
              py='.5rem'
              pr='.75rem'
              maxHeight={'36px'}
              overflow='hidden'
            >
              <HiOutlineTicket />
              <Text fontWeight='500' fontSize='0.85rem'>
                Raffle
              </Text>
            </HStack>
          )}

          {isWhitelistRaffle && (
            <HStack pl='.75rem' py='.5rem' pr='.75rem'>
              <HiOutlineTicket />
              <Text fontWeight='500' fontSize='0.85rem'>
                WL
              </Text>
            </HStack>
          )}

          {isIRLRaffle && (
            <HStack pl='.75rem' py='.5rem' pr='.75rem'>
              <HiOutlineTicket />
              <Text fontWeight='500' fontSize='0.85rem'>
                IRL
              </Text>
            </HStack>
          )}
        </Box>
      </Flex>
      <Flex px='1rem' pb='1rem'>
        {flaggedLabel && (
          <Badge mt='1' variant='subtle' colorScheme='yellow'>
            {flaggedLabel}
          </Badge>
        )}
      </Flex>
      <Box
        position='relative'
        onMouseEnter={() => setImageIsHover(true)}
        onMouseLeave={() => setImageIsHover(false)}
      >
        <NextLink passHref href={`/r/${raffle.id}`}>
          <Link w='100%'>
            <Box overflow={'hidden'}>
              <AspectRatio ratio={1}>
                <NextImage
                  w={'100%'}
                  fill
                  sizes="(max-width: 768px) 95vw,
                         (max-width: 992px) 48vw,
                         (max-width: 1280px) 33vw
                          25vw"
                  h={imgH}
                  src={image}
                  alt={raffle.name}
                  objectFit='cover'
                  transition={'transform .5s ease-in-out'}
                  _hover={{
                    transform: 'scale(1.05)',
                  }}
                ></NextImage>
              </AspectRatio>
            </Box>
          </Link>
        </NextLink>
        {timeEl}

        {raffle.collection && raffle.collection.floorPrice && (
          <Box position='absolute' left='.4rem' bottom='10px'>
            <Badge
              textTransform={'none'}
              backgroundColor={'black'}
              color='white'
              size={'sm'}
              px='6px'
              py='2px'
              mr='6px'
              fontSize='.625rem'
              borderRadius={'full'}
            >
              FP:{' '}
              {formatFloatForDisplay(
                raffle.collection.floorPrice / LAMPORTS_PER_SOL
              )}
              &#9678;
              {raffle.collection.averagePrice24hr && (
                <>
                  {' '}
                  | AVG:{' '}
                  {formatFloatForDisplay(
                    raffle.collection.averagePrice24hr / LAMPORTS_PER_SOL
                  )}
                  &#9678;
                </>
              )}
            </Badge>
          </Box>
        )}

        {raffle.onChainData &&
          raffle.estimateTicketPriceInSol &&
          allowedPurchaseTokens.some(
            (token) => token.token.symbol === 'SOL'
          ) && (
            <Box position='absolute' right='.4rem' bottom='10px'>
              <Badge
                textTransform={'none'}
                backgroundColor={'black'}
                color='white'
                size={'sm'}
                px='6px'
                py='2px'
                borderRadius={'full'}
                fontSize='.625rem'
              >
                Vol:{' '}
                {formatFloatForDisplay(
                  raffle.estimateTicketPriceInSol *
                    raffle.onChainData.ticketCount
                )}
                &#9678;
                {raffle.maxTickets && (
                  <>
                    {' '}
                    | TTV:{' '}
                    {formatFloatForDisplay(
                      raffle.estimateTicketPriceInSol * raffle.maxTickets
                    )}
                    &#9678;
                  </>
                )}
              </Badge>
            </Box>
          )}

        {imageIsHover && (
          <NextLink passHref href={`/r/${raffle.id}`}>
            <Link
              padding='0.5rem 1.25rem'
              rounded='full'
              border='none'
              position='absolute'
              left='50%'
              transform='translateX(-50%)'
              bottom='2rem'
              bg='#232323'
              color='#fff'
              fontSize='1rem'
              fontWeight='500'
              borderColor='#232323'
              _hover={{
                bg: '#000',
                border: '#000',
              }}
            >
              View Raffle
            </Link>
          </NextLink>
        )}
      </Box>

      {raffle.type === 'NFT' && !!raffle.collection?.name && (
        <NextLink passHref href={`/collections/${raffle.collection?.name}`}>
          <Link pt='.6rem' px='1rem'>
            <Flex alignItems={'center'}>
              <Image
                display='inline'
                mr='4px'
                w='16px'
                h='16px'
                src='/twitter-images/verified/verified.png'
              ></Image>
              <Text opacity={0.8} fontSize={'0.875rem'}>
                {raffle.collection?.title}
              </Text>
            </Flex>
          </Link>
        </NextLink>
      )}
      <Flex justify='space-between' px='1rem' alignItems='baseline' mb='.4rem'>
        <NextLink passHref href={`/r/${raffle.id}`}>
          <Link
            display='block'
            height='100%'
            marginY={wallet.publicKey ? '0' : '12px'}
          >
            <Text fontSize='1rem'>{name}</Text>
          </Link>
        </NextLink>
        <SaveRaffleButton raffleId={raffle.id} />
      </Flex>

      <Flex mt='.5rem' px='1rem' justify='space-between'>
        {userWon ? (
          <Box>
            <Text fontSize='1.5rem' fontWeight='700'>
              You won! 🎉
            </Text>
          </Box>
        ) : raffle.onChainData?.ticketCount &&
          maxTickets &&
          raffle.onChainData.ticketCount >= maxTickets ? (
          <Box>
            <Text fontWeight='700' fontSize='1.2rem' color='#f13a3a'>
              Sold out 🔥
            </Text>
            <Text fontWeight='400' fontSize='0.75rem' color='#BDBDBD'>
              {raffle.onChainData.ticketCount} Tickets sold
            </Text>
          </Box>
        ) : (
          <Box>
            <Text fontWeight='700' fontSize='1.2rem'>
              {raffle.onChainData?.ticketCount ?? (
                <Spinner size='sm' mt='0.3rem' />
              )}{' '}
              {maxTickets && <span>/ {maxTickets}</span>}
            </Text>

            <Text
              fontWeight='400'
              fontSize='0.75rem'
              color='#BDBDBD'
              textAlign='left'
            >
              Tickets sold
            </Text>
          </Box>
        )}
        <Box>
          <Text fontWeight='700' fontSize='1.2rem'>
            {price} {priceToken}
          </Text>
          <Text
            fontWeight='400'
            fontSize='0.75rem'
            color='#BDBDBD'
            textAlign='right'
          >
            Ticket Price
          </Text>
        </Box>
      </Flex>
      {allowedPurchaseTokens && (
        <Flex justify='space-between' px='1rem' pt='1rem' alignItems='baseline'>
          <Box>
            <Box mb='0rem'>
              {allowedPurchaseTokens.slice(0, 4).map((token) => (
                <Text
                  key={token.token.symbol}
                  as='span'
                  fontSize='.85rem'
                  rounded='full'
                  mr='.5rem'
                  fontWeight={600}
                >
                  {token.token.symbol}
                </Text>
              ))}
              {allowedPurchaseTokens.length > 4 && (
                <Text
                  as='span'
                  fontSize='.75rem'
                  rounded='full'
                  fontWeight={400}
                  color='#BDBDBD'
                >
                  and more
                </Text>
              )}
            </Box>
            <Text
              fontWeight='400'
              fontSize='0.75rem'
              color='#BDBDBD'
              textAlign='left'
            >
              Accepted
            </Text>
          </Box>
        </Flex>
      )}
    </Box>
  )
}
