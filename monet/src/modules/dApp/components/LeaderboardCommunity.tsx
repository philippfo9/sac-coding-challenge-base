import {
  Box,
  Button,
  Center,
  Grid,
  GridItem,
  HStack,
  Link,
  Stack,
  Text,
  textDecoration,
  Image,
  Spinner,
  useColorMode,
} from '@chakra-ui/react'
import React, { FC, useState, useEffect } from 'react'
import { BiCoin } from 'react-icons/bi'
import { FaTwitter } from 'react-icons/fa'
import { FiUsers } from 'react-icons/fi'
import { HiOutlineTicket } from 'react-icons/hi'
import InfiniteScroll from 'react-infinite-scroll-component'
import {
  useAllProjectsLeaderPaginated,
  useProjectCommunityMembers,
  useProjectId,
} from '../../techRaffles/hooks/project'
import { TLeaderboardStatsProject } from '../../techRaffles/routers/projectRouter'
import { ProfilePicture } from './ProfilePicture'
import NextLink from 'next/link'
import { timeframeFilterType } from '../../techRaffles/types'

interface Props {
  visible: boolean
  timeframe: timeframeFilterType
}

const LeaderboardCommunity: FC<Props> = ({ visible, timeframe }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  const { data, isFetching } = useAllProjectsLeaderPaginated(0, timeframe)

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
            color={isDarkMode ? 'white' : 'black'}
          >
            <GridItem colSpan={[3]} pl='2rem'>
              <Text fontWeight='600'>Community Name</Text>
            </GridItem>
            <GridItem colSpan={[2]}>
              <Text fontWeight='600'>Community Members</Text>
            </GridItem>
            <GridItem colSpan={[2]}>
              <Text fontWeight='600'>Created Raffles</Text>
            </GridItem>
            <GridItem colSpan={[2]}>
              <Text fontWeight='600'>Volume</Text>
            </GridItem>
            {data &&
              data.map((project, index) => (
                <>
                  <GridItem colSpan={[3]}>
                    <HStack gap='.5rem'>
                      <Box color={isDarkMode ? 'white' : 'black'}>
                        {index + 1}.
                      </Box>
                      <NextLink passHref href={`/p/${project.publicId}`}>
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
                            <Image
                              src={project.profilePictureUrl || ''}
                              w='45px'
                              h='45px'
                              rounded='full'
                            />
                            <Text
                              transition={'all .2s ease-in-out'}
                              fontWeight='600'
                              borderBottom='1px solid transparent'
                              _groupHover={{
                                borderBottomColor: isDarkMode
                                  ? 'white'
                                  : 'black',
                              }}
                              textOverflow='ellipsis'
                              whiteSpace='nowrap'
                              maxWidth='100%'
                              overflow='hidden'
                            >
                              {project.communityName}
                            </Text>
                          </HStack>
                        </Link>
                      </NextLink>
                    </HStack>
                  </GridItem>

                  <GridItem alignSelf='center' colSpan={[2]}>
                    <NextLink passHref href={`/p/${project.publicId}#MEMBERS`}>
                      <Link _hover={{}}>
                        <Button
                          size='sm'
                          variant={isDarkMode ? 'outlinedDark' : 'outlined'}
                          leftIcon={<FiUsers />}
                        >
                          {project.holders}
                        </Button>
                      </Link>
                    </NextLink>
                  </GridItem>

                  <GridItem alignSelf='center' colSpan={[2]}>
                    <NextLink passHref href={`/p/${project.publicId}#RAFFLES`}>
                      <Link _hover={{}}>
                        <Button
                          size='sm'
                          variant={isDarkMode ? 'outlinedDark' : 'outlined'}
                          leftIcon={
                            <HiOutlineTicket
                              color={isDarkMode ? 'white' : 'black'}
                            />
                          }
                        >
                          {(project.createdRaffles ?? 0) +
                            (project.benefitingRaffles ?? 0)}
                        </Button>
                      </Link>
                    </NextLink>
                  </GridItem>

                  <GridItem alignSelf='center' colSpan={[2]}>
                    <Button
                      size='sm'
                      variant={isDarkMode ? 'outlinedDark' : 'outlined'}
                      leftIcon={
                        <BiCoin color={isDarkMode ? 'white' : 'black'} />
                      }
                      _hover={{}}
                    >
                      {(project.totalVolume ?? 0).toFixed(2)} SOL
                    </Button>
                  </GridItem>
                </>
              ))}
          </Grid>

          {isFetching && (
            <Center color={isDarkMode ? 'white' : 'black'} mt='3rem'>
              Loading top communities... <Spinner ml='1rem' color={isDarkMode ? 'white' : 'black'} size='sm'></Spinner>
            </Center>
          )}
        </>
      )}
    </>
  )
}

export default LeaderboardCommunity
