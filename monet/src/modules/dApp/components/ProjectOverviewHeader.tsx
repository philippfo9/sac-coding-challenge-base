import {Box, Container, Flex, HStack, IconButton, Image, Link, Stack, Text} from '@chakra-ui/react'
import React from 'react'
import {BsFillPatchCheckFill, BsTwitter} from 'react-icons/bs'
import {FaDiscord} from 'react-icons/fa'
import {TbWorld} from 'react-icons/tb'
import {
  projectType,
} from '../../techRaffles/types'
import Header from '../layouts/Header'
import {ProfilePicture} from './ProfilePicture';
import ProjectNavigationButtons from './ProjectNavigationButtons'

export default function ProjectOverviewHeader(props: {
  project: projectType,
  selectedProjectNavigation: string,
}) {
  const project = props.project

  return (
    <>
      <Box
        height={['30rem']}
        w='100%'
        bgRepeat='no-repeat'
        bgSize='cover'
        background={`linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('${project?.bannerUrl ?? ''}')`}
        bgPos='center top'
        backgroundSize='cover!important'
        px='1rem'
        py={['.5rem', '1rem', '2rem']}
      >
        <Container maxWidth='1440px'>
          <Header theme='transparent'/>
          <Stack
            direction={['column', 'column', 'row', 'row']}
            mt={['4rem', '6.5rem']}
            justify='space-between'
            spacing={[5, 10, 0, 0]}
          >
            <HStack color='#fff' spacing={'1.25rem'}>
              <ProfilePicture
                imageurl={project.profilePictureUrl}
                gradientstart={project.gradientStart}
                gradientend={project.gradientEnd}
                w='4rem'
                h='4rem'
                borderRadius='15px'/>
              <Box>
                <Text color='#fff' fontSize={['1rem', '1.875rem']} fontWeight='600'>
                  {project.platformName}
                </Text>
                <HStack>
                  <Text color='#fff'>{project.communityName}</Text>
                  {project.verified && <BsFillPatchCheckFill color='#fff'/>}
                </HStack>
              </Box>
            </HStack>
            <Stack direction='row' spacing={[1, 0, 5]}>
              {project.twitterUserHandle &&
                <Link href={`https://twitter.com/${project.twitterUserHandle}`} target='_blank'>
                  <IconButton
                    rounded='full'
                    bg='transparent'
                    aria-label='twitter'
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.2)',
                    }}
                    icon={<BsTwitter color='white'/>}/>
                </Link>}

              {project.magicEdenSlug &&
                <Link href={`https://magiceden.io/${project.magicEdenSlug}`} target='_blank'>
                  <IconButton
                    aria-label='ME'
                    bg='transparent'
                    border='none'
                    _hover={{
                      bg: 'rgba(255, 255, 255, 0.2)',
                    }}
                    icon={<Image src='/icons/logo-me.svg'/>}/>
                </Link>}

              {project.discordInviteLink && <Link href={`${project.discordInviteLink}`} target='_blank'>
                <IconButton
                  border='none'
                  bg='transparent'
                  aria-label='discord'
                  rounded='full'
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.2)',
                  }}
                  icon={<FaDiscord color='white'/>}/>
              </Link>}

              {project.websiteUrl && <Link href={`${project.websiteUrl}`} target='_blank'>
                <IconButton
                  aria-label='share'
                  bg='transparent'
                  border='none'
                  _hover={{
                    bg: 'rgba(255, 255, 255, 0.2)',
                  }}
                  icon={<TbWorld color='white'/>}/>
              </Link>}
            </Stack>
          </Stack>
          <Flex mt={['2rem', '2rem', '5.75rem']} justify='space-between'>
            <Box bg='rgba(255, 255, 255, 0.15)' rounded='20px' p='.5rem .75rem' backdropFilter='blur(5px)'>
              <ProjectNavigationButtons 
                selectedValue={props.selectedProjectNavigation}
              />
            </Box>
          </Flex>
        </Container>
      </Box>
    </>
  )
}
