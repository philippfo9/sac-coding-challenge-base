import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  Container,
  HStack,
  Link,
  Skeleton,
  SkeletonCircle,
  Stack,
  Text,
} from '@chakra-ui/react'
import React, {useEffect, useMemo, useState} from 'react'
import { useProjectBySlug } from '../techRaffles/hooks/project'
import ProjectOverviewHeader from './components/ProjectOverviewHeader'
import ProjectOverviewRaffles from './components/ProjectOverviewRaffles'
import Footer from './layouts/Footer'
import Header from './layouts/Header'
import { projectNavigationType } from '../techRaffles/types';
import ProjectCommunityMembers from './components/ProjectCommunityMembers'
import {useLocation} from "react-use";
import ProjectCollections from "./components/ProjectCollections";

const DAppCommunityOverview = () => {
  const projectRes = useProjectBySlug()

  const [selectedNavigation, setSelectedNavigation] = useState<projectNavigationType>('RAFFLES')

  const isLoading = useMemo(
    () => projectRes.isLoading,
    [projectRes.isLoading]
  )

  const location = useLocation();
  useEffect(() => {
    const query = location.hash?.split('#')[1];
    if (query && query !== selectedNavigation) {
      setSelectedNavigation(query as projectNavigationType);
    }
  }, [location.hash, selectedNavigation])

  return (
    <Box
      minHeight='100vh'
      color='#232323 !important'
      fontFamily='Inter !important'
    >
      {isLoading && <ProjectOverviewHeaderSkeleton />}
      {!isLoading && projectRes?.data && (
        <ProjectOverviewHeader
          project={projectRes!.data!}
          selectedProjectNavigation={selectedNavigation}
        />
      )}

      <Container
        maxW='1440px'
        width='100%'
        p={['0.75rem', '1.75rem', '2.75rem', '2.75rem']}
        paddingY='2rem'
      >
        <Box minHeight='80vh'>
          {
            !isLoading && !projectRes.data?.verified && (
              <Alert colorScheme={'yellow'} status='warning' rounded='10px'>
                <AlertIcon/>
                <AlertTitle>Heads up:</AlertTitle>
                <AlertDescription>
                  This community is unverified.{' '}
                  <Link href='https://sac-nft.notion.site/MONET-Unverified-Community-9e54516c2d274c6d85e236331865ac15' target='_blank'>
                    Learn more about what that means.
                  </Link> 
                </AlertDescription>
              </Alert>
            )
          }

          {selectedNavigation === 'RAFFLES' && <ProjectOverviewRaffles />}

          {selectedNavigation === 'MEMBERS' &&  <ProjectCommunityMembers/>}

          {selectedNavigation === 'COLLECTIONS' &&  <ProjectCollections/>}
        </Box>
        <Footer />
      </Container>
    </Box>
  )
}

export default DAppCommunityOverview

const ProjectOverviewHeaderSkeleton = () => (
  <Box
    height={['30rem']}
    w='100%'
    bgRepeat='no-repeat'
    bgSize='cover'
    background={`linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('')`}
    bgPos='center top'
    backgroundSize='cover!important'
    px='1rem'
    py={['.5rem', '1rem', '2rem']}
  >
    <Container maxWidth='1440px'>
      <Header theme='transparent' />
      <Stack
        direction={['column', 'column', 'row', 'row']}
        mt={['4rem', '6.5rem']}
        justify='space-between'
        spacing={[5, 10, 0, 0]}
      >
        <HStack color='#fff' spacing={'1.25rem'}>
          <SkeletonCircle w='4rem' h='4rem' />
          <Skeleton w='10rem' h='40px' />
        </HStack>
        <Stack direction='row' spacing={[5, 5, 7]}>
          <SkeletonCircle h='25px' w='25px' />
          <SkeletonCircle h='25px' w='25px' />
          <SkeletonCircle h='25px' w='25px' />
          <SkeletonCircle h='25px' w='25px' />
        </Stack>
      </Stack>
      <Stack direction={['column', 'row']} mt={['2rem', '2rem', '5.75rem']} gap='1rem'>
        <Skeleton w='16rem' h='2.8rem' rounded='20px' />
      </Stack>
    </Container>
  </Box>
)
