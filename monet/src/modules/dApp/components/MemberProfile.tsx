import {
  Box,
  Button,
  Grid,
  GridItem,
  HStack,
  Link,
  Stack,
  Text,
  textDecoration,
  useColorMode,
} from '@chakra-ui/react'
import React, { FC } from 'react'
import { FaTwitter } from 'react-icons/fa'
import { HiOutlineTicket } from 'react-icons/hi'
import {
  memberType,
  userCommunityMemberType,
  userType,
} from '../../techRaffles/types'
import { ProfilePicture } from './ProfilePicture'
import NextLink from 'next/link'

interface Props {
  user: userCommunityMemberType
}

const MemberProfile: FC<Props> = ({ user }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  return (
    <Grid templateColumns='repeat(12, 1fr)' gap={'.5rem'}>
      <GridItem colSpan={[12, 5, 4]}>
        <NextLink passHref href={`/u/${user.wallet}`}>
          <Link
            display='flex'
            maxWidth='100%'
            _hover={
              {
                //opacity: '.8',
                //textDecoration: 'underline'
              }
            }
          >
            <HStack gap='1rem' role='group' maxWidth='100%'>
              <Box w='45px' h='45px' rounded='full' overflow='hidden'>
                <ProfilePicture
                  imageurl={user.profilePictureUrl}
                  gradientstart={user.gradientStart}
                  gradientend={user.gradientEnd}
                  w='45px'
                  h='45px'
                  minWidth='45px'
                  rounded='full'
                  _groupHover={{
                    transform: 'scale(1.1)',
                  }}
                />
              </Box>
              <Text
                transition={'all .2s ease-in-out'}
                fontWeight='600'
                borderBottom='1px solid transparent'
                _groupHover={{
                  borderBottomColor: isDarkMode ? 'white' : 'black',
                }}
                textOverflow='ellipsis'
                whiteSpace='nowrap'
                maxWidth='100%'
                overflow='hidden'
              >
                {user.name}
              </Text>
            </HStack>
          </Link>
        </NextLink>
      </GridItem>
      <GridItem alignSelf='center' colSpan={[12, 3, 3]}>
        {user.twitterUsername && (
          <NextLink
            passHref
            href={`https://twitter.com/${user.twitterUsername}`}
          >
            <Link
              target='_blank'
              transition='all .1s ease-in-out'
              _hover={{ color: '#1DA1F2' }}
            >
              <Button
                size='sm'
                variant={isDarkMode ? 'outlinedDark' : 'outlined'}
                leftIcon={<FaTwitter color={isDarkMode ? 'white' : 'black'} />}
              >
                @{user.twitterUsername}
              </Button>
            </Link>
          </NextLink>
        )}
      </GridItem>

      <GridItem alignSelf='center' colSpan={[12, 4, 4]}>
        <NextLink passHref href={`/u/${user.wallet}#raffles`}>
          <Link _hover={{}}>
            <Button
              size='sm'
              variant={isDarkMode ? 'outlinedDark' : 'outlined'}
              leftIcon={
                <HiOutlineTicket color={isDarkMode ? 'white' : 'black'} />
              }
            >
              Created Raffles: {user.rafflesCount}
            </Button>
          </Link>
        </NextLink>
      </GridItem>
    </Grid>
  )
}

export default MemberProfile
