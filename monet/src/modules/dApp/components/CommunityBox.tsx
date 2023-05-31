import { Box, HStack, Link, Text, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { raffleType } from '../../techRaffles/types'
import { ProfilePicture } from './ProfilePicture'
import NextLink from 'next/link'

export const CommunityBox: React.FC<{
  project: raffleType['benefitingProjects'][0]
}> = ({ project }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  return (
    <NextLink key={project.id} href={`/p/${project.publicId}`} passHref>
      <Link
        _hover={{ borderColor: '#232323', transform: 'scale(1.01)' }}
        border='1px solid'
        borderColor={isDarkMode ? '#494949' : '#E9E9E9'}
        borderRadius='15px'
        bg={isDarkMode ? 'cardBlackOffset' : '#fff'}
        p='.5rem'
        pr='1.5rem'
        mr='1rem'
        my='.5rem'
      >
        <HStack gap='.75rem'>
          <ProfilePicture
            imageurl={project.profilePictureUrl}
            gradientstart={project.gradientStart}
            gradientend={project.gradientEnd}
            w='60px'
            h='60px'
            rounded='full'
          />
          <Text>{project.communityName}</Text>
        </HStack>
      </Link>
    </NextLink>
  )
}
