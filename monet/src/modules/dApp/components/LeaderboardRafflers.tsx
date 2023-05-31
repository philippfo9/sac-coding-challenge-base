import {
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  HStack,
  Link,
  Spinner,
  Stack,
  Text,
  textDecoration,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react'
import React, { FC, useEffect, useState } from 'react'
import { BiCoin } from 'react-icons/bi'
import { FaTwitter } from 'react-icons/fa'
import { FiUsers } from 'react-icons/fi'
import { HiOutlineTicket } from 'react-icons/hi'
import { AiOutlineNumber } from 'react-icons/ai'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  useProjectCommunityMembers,
  useProjectId,
} from '../../techRaffles/hooks/project'
import { useAllRaffleHostLeadersPaginated, useAllRaffleBuyersLeadersPaginated } from '../../techRaffles/hooks/user'
import { TLeaderboardStatsUser } from '../../techRaffles/routers/userRouter'
import { userAdminSelect } from '../../techRaffles/services/selects/user'
import { ProfilePicture } from './ProfilePicture'
import { BsFillPatchCheckFill } from 'react-icons/bs'
import NextLink from 'next/link'
import { timeframeFilterType } from '../../techRaffles/types'

interface Props {
  visible: boolean
  timeframe: timeframeFilterType
}

const LeaderboardRafflers: FC<Props> = ({ visible, timeframe }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  const { data: rafflersLeaderBoardData, isFetching } = useAllRaffleHostLeadersPaginated(0, timeframe)

  return (
    <>
      {visible && (
        <>
          <Grid
            templateColumns='repeat(9, 1fr)'
            gap={'.5rem'}
            minWidth='800px'
            rounded='10px'
            padding='1rem'
            border={isDarkMode ? '1px solid #494949' : '1px solid #EEE'}
          >
            <GridItem colSpan={[3]} pl='2rem'>
              <Text fontWeight='600'>User Name</Text>
            </GridItem>
            <GridItem colSpan={[2]}>
              <Text fontWeight='600'>Created Raffles</Text>
            </GridItem>
            <GridItem colSpan={[2]}>
              <Text fontWeight='600'>Tickets Sold</Text>
            </GridItem>
            <GridItem colSpan={[2]}>
              <Text fontWeight='600'>Volume</Text>
            </GridItem>
            {rafflersLeaderBoardData && rafflersLeaderBoardData.map((user, index) => (
              <>
                <GridItem colSpan={[3]}>
                  <HStack gap='.5rem'>
                    <Box color={isDarkMode ? 'white' : 'black'}>
                      {index + 1}.
                    </Box>
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
                          <Text
                            transition={'all .2s ease-in-out'}
                            fontWeight='600'
                            borderBottom='1px solid transparent'
                            _groupHover={{
                              borderBottomColor: isDarkMode ? 'white' : 'black',
                            }}
                            textOverflow='ellipsis'
                            whiteSpace='nowrap'
                            maxWidth='140px'
                            overflow='hidden'
                          >
                            {user.name}
                          </Text>
                          {user.isTrustedRaffler && (
                            <Tooltip label={'Trusted raffler'}>
                              <Text as='span'>
                                <BsFillPatchCheckFill
                                  color={isDarkMode ? 'white' : 'black'}
                                />
                              </Text>
                            </Tooltip>
                          )}
                        </HStack>
                      </Link>
                    </NextLink>
                  </HStack>
                </GridItem>

                <GridItem alignSelf='center' colSpan={[2]}>
                  <NextLink passHref href={`/u/${user.wallet}#raffles`}>
                    <Link _hover={{}}>
                      <Button
                        size='sm'
                        variant={isDarkMode ? 'outlinedDark' : 'outlined'}
                        leftIcon={<AiOutlineNumber />}
                      >
                        {user.rafflesCreated}
                      </Button>
                    </Link>
                  </NextLink>
                </GridItem>

                <GridItem alignSelf='center' colSpan={[2]}>
                  <Button
                    size='sm'
                    variant={isDarkMode ? 'outlinedDark' : 'outlined'}
                    leftIcon={<HiOutlineTicket />}
                  >
                    {user.ticketsSold}
                  </Button>
                </GridItem>

                <GridItem alignSelf='center' colSpan={[2]}>
                  <Button
                    size='sm'
                    variant={isDarkMode ? 'outlinedDark' : 'outlined'}
                    leftIcon={<BiCoin color={isDarkMode ? 'white' : 'black'} />}
                  >
                    {(user.totalVolume ?? 0).toFixed(2)} SOL
                  </Button>
                </GridItem>
              </>
            ))}
          </Grid>
          {isFetching && (
            <Center color={isDarkMode ? 'white' : 'black'} mt='3rem'>
              Loading top creators... <Spinner ml='1rem' color={isDarkMode ? 'white' : 'black'} size='sm'></Spinner>
            </Center>
          )}
        </>
      )}
    </>
  )
}

export default LeaderboardRafflers
