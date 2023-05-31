import 'react-alice-carousel/lib/alice-carousel.css'
import {
  Box,
  Button,
  HStack,
  Link,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import React from 'react'
import AliceCarousel from 'react-alice-carousel'
import * as Scroll from 'react-scroll'
import {
  useTrendingRaffles,
  useOnChainRaffleListData,
} from '../../techRaffles/hooks/raffle'
import { RaffleCard } from './RaffleCard'
import { trpc } from '../../../utils/trpc'
import { useRouter } from 'next/router'
import RaffleCardSkeleton from './Skeletons/RaffleCardSkeleton'
import NextLink from 'next/link'

const scroller = Scroll.scroller

export const TrendingRaffles = () => {
  const { data: raffles } = useTrendingRaffles()
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const combinedRaffleRes = useOnChainRaffleListData(raffles)

  const router = useRouter()
  const { data: randomRaffle } = trpc.useQuery(['raffle.explore'])

  /**
   * Explore
   **/

  const explore = () => {
    scroller.scrollTo('Public Raffles', {
      duration: 500,
      smooth: true,
      offset: -20,
    })
  }

  return (
    <Stack
      direction={['column']}
      justify='space-between'
      borderRadius='4.125rem'
      alignItems='center'
      mt='0rem'
      padding={['0.8rem', '1.2rem']}
      background={
        isDarkMode
          ? 'radial-gradient(circle at top left, #232323, #181818)'
          : 'cardWhite'
      }
      border='2px solid'
      borderColor={isDarkMode ? '#494949' : '#E9E9E9'}
      boxShadow={isDarkMode ? 'xl' : 'none'}
    >
      <Box paddingBottom={2} display='flex' justifyContent={'flex-start'}>
        <Box
          fontSize={['.75rem', '1rem']}
          textAlign='center'
          w='12.5rem'
          p='7px'
          bg={isDarkMode ? '#494949' : ' #E5E5E5'}
          color={isDarkMode ? 'white' : 'black'}
          rounded='full'
        >
          Discover Trending ⚡
        </Box>
      </Box>

      <Box
        w={['100%']}
        userSelect='none'
        sx={{ '.alice-carousel__dots': { marginTop: '10px' } }}
      >
        {(combinedRaffleRes.value ?? raffles ?? []).length < 1 && (
          <RaffleCardSkeleton />
        )}

        <AliceCarousel
          responsive={{
            0: { items: 1 },
            780: { items: 2 },
            1200: { items: 3 },
            1640: { items: 4 },
          }}
          items={(combinedRaffleRes.value ?? raffles ?? []).map((raffle) => {
            return raffle ? (
              <Box width='100%' display='flex' justifyContent={'center'}>
                <RaffleCard
                  key={raffle.id}
                  w={['20rem', '20rem', '22rem']}
                  data-value='1'
                  raffle={raffle}
                />
              </Box>
            ) : (
              ''
            )
          })}
          mouseTracking
          touchTracking
          autoPlay
          infinite
          disableButtonsControls
          autoPlayInterval={4000}
          renderDotsItem={(e) => {
            if (e.isActive)
              return (
                <Box
                  _hover={{ cursor: 'pointer' }}
                  height='3px'
                  w={['2.5rem', '2.7rem']}
                  bg={isDarkMode ? '#E9E9E9' : '#232323'}
                  marginRight={'0.33rem'}
                  borderRadius='5px'
                ></Box>
              )
            return (
              <Box
                _hover={{ cursor: 'pointer' }}
                height='3px'
                w={['2.5rem', '2.7rem']}
                bg={isDarkMode ? '#787878' : '#E9E9E9'}
                marginRight={'0.33rem'}
                borderRadius='5px'
              ></Box>
            )
          }}
        ></AliceCarousel>
      </Box>
      <Box>
        <Text fontSize={['.875rem', '1rem']} color={isDarkMode ? '#E5E5E5' : '#565656'}>
        powered by StonedApeCrew in partnership with JellyCo and trusted by 230+ communities on Solana
        </Text>
      </Box>
    </Stack>
  )
}
