import {
  Box,
  Flex,
  HStack,
  Image,
  Link,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { BsFillPatchCheckFill } from 'react-icons/bs'
import React, { FC } from 'react'
import { projectType } from '../../techRaffles/types'
import { ProfilePicture } from './ProfilePicture'
import NextLink from 'next/link'

interface CardProps {
  project: projectType
  adminLink?: boolean
  index?: number
  mlXs?: string
}

const CommunityCard: FC<CardProps> = (props: CardProps) => {
  const { project, adminLink } = props
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  return (
    <NextLink
      passHref
      href={adminLink ? `/admin/${project.publicId}` : `/p/${project.publicId}`}
    >
      <Link>
        <Flex
          mt='4rem'
          flexDirection='column'
          minWidth='320px'
          maxW={['100%', '320px']}
          minHeight='264px'
          borderRadius='20px'
          border={isDarkMode ? '1px solid #393e43' : '1px solid #E9E9E9'}
          ml={[props.mlXs ?? '0', props.index === 0 ? '0' : '2rem']}
          textAlign='center'
          alignItems='center'
          bg={isDarkMode ? 'cardBlack' : 'white'}
          boxShadow={isDarkMode ? 'lg' : 'none'}
        >
          <Box
            position={'relative'}
            overflow={'hidden'}
            w='100%'
            h='100%'
            borderTopRadius='20px'
          >
            <Image
              draggable={false}
              objectFit='cover'
              w='100%'
              h='10rem'
              src={project.bannerUrl ?? project.profilePictureUrl ?? ''}
              transition={'transform .5s ease-in-out'}
              _hover={{
                transform: 'scale(1.05)',
              }}
              fallback={
                <Flex w='100%' h='10rem' bg='#EEE' objectFit='cover'></Flex>
              }
            />
            <Box
              left={0}
              top={0}
              position='absolute'
              w='100%'
              h='100%'
              zIndex={0}
              opacity={0.2}
              backgroundColor='#000'
            ></Box>
          </Box>
          {!!project.bannerUrl && (
            <Box
              zIndex={5}
              borderRadius={'15px'}
              marginTop={'-38px'}
              marginLeft={'-200px'}
              bgColor={isDarkMode ? 'cardBlack' : '#fff'}
              w='76px'
              h='76px'
              position='relative'
              p={'5px'}
            >
              <ProfilePicture
                gradientstart={project.gradientStart}
                gradientend={project.gradientEnd}
                imageurl={project.profilePictureUrl}
                w='66px'
                h='66px'
                borderRadius='15px'
                background={'#fff'}
              />
            </Box>
          )}
          <HStack mt={/*'1.7rem' ??*/ !!project.bannerUrl ? '12px' : '50px'}>
            <Text fontSize='0.913rem' fontWeight='500'>
              {project.communityName}
            </Text>
            {project.verified && (
              <BsFillPatchCheckFill color={isDarkMode ? '#eee' : 'black'} />
            )}
          </HStack>
        </Flex>
      </Link>
    </NextLink>
  )
}

export default CommunityCard
