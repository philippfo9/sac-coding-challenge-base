import {
  Box,
  Flex,
  HStack,
  Image,
  Link,
  SkeletonCircle,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { truncate } from '../../../utils/stringUtils'
import { HiOutlineTicket } from 'react-icons/hi'
import React from 'react'
import { trpc } from '../../../utils/trpc'
import { ProfilePicture } from './ProfilePicture'
import NextLink from 'next/link'

export const RaffleParticipant = (props: {
  idx: number
  wallet?: string
  counter?: number
  isWinner?: boolean
}) => {
  const { wallet, counter } = props
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  const { data: user } = trpc.useQuery(
    ['user.get-by-wallet', { wallet: wallet ?? '' }],
    { enabled: !!wallet }
  )

  return (
    <HStack
      paddingX={0}
      paddingTop={props.idx === 0 ? '.8rem' : '1.75rem'}
      paddingBottom={'1.75rem'}
      borderBottom={isDarkMode ? '1px solid #494949' : '1px solid #E5E5E5'}
      justify='space-between'
    >
      <Flex>
        {user && (
          <ProfilePicture
            gradientstart={user.gradientStart}
            gradientend={user.gradientEnd}
            w='2.5rem'
            h='2.5rem'
            imageurl={user.profilePictureUrl}
            rounded='full'
          />
        )}
        {!user && <SkeletonCircle w='2.5rem' h='2.5rem' />}

        <Box ml='1.625rem'>
          <NextLink passHref href={`/u/${user?.wallet}`}>
            <Link
              fontSize='0.875rem'
              color={
                props.isWinner ? (isDarkMode ? '#fcfcfc' : '#333') : '#BDBDBD'
              }
              fontWeight={props.isWinner ? 700 : 500}
              target='_blank'
            >
              {truncate(user?.name ?? '', 20)}
            </Link>
          </NextLink>
        </Box>
      </Flex>
      {counter && (
        <HStack>
          <HiOutlineTicket />
          <Text fontWeight='700'>{counter}</Text>
        </HStack>
      )}
    </HStack>
  )
}
