import 'react-alice-carousel/lib/alice-carousel.css'
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Image,
  Link,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import React, { FC, useEffect, useMemo } from 'react'
import { ProfilePicture } from '../ProfilePicture'
import { CommunitySelectProjectType } from './CommunitySelect'
import { trpc } from '../../../../utils/trpc'

interface Props {
  project: CommunitySelectProjectType
  onRemoveProject: (id: string) => void
  onValidChange: (valid: boolean) => void
  onLoadingChange: (loading: boolean) => void
}

export const CommunitySelectItem: FC<Props> = (props: Props) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const { project, onValidChange, onLoadingChange, onRemoveProject } = props

  const { data: verified, isLoading } = trpc.useQuery(
    ['project.is-holder-in-project', { id: project.id }],
    { enabled: !project.holderVerified }
  )

  useMemo(() => {
    console.log(`${project.communityName} verified: ${verified ?? true}`)
    onValidChange(verified ?? true)
  }, [verified, isLoading])

  useMemo(() => {
    console.log(`${project.communityName} loading: ${isLoading}`)
    onLoadingChange(isLoading)
  }, [isLoading])

  return (
    <GridItem
      maxW={['300px', '100%']}
      w='100%'
      px='1.3rem'
      py='1rem'
      backgroundColor={isDarkMode ? 'cardBlack' : '#F9F9F9'}
      borderRadius='30px'
      borderColor={
        isLoading
          ? ''
          : project.holderVerified || verified
          ? '#33691E'
          : '#BF360C'
      }
      borderWidth='3px'
      className={isLoading ? 'border-glow' : ''}
    >
      <Flex justify='space-between' align='center' gap={2}>
        <HStack align='center' justify='start'>
          <ProfilePicture
            gradientstart={project.gradientStart}
            gradientend={project.gradientEnd}
            w='40px'
            h='40px'
            imageurl={project.profilePictureUrl}
            rounded='full'
          ></ProfilePicture>
          <Text>{project.communityName}</Text>
        </HStack>
        <Link
          textDecoration='underline'
          color={isDarkMode ? 'white' : 'black'}
          onClick={() => onRemoveProject(project.id)}
        >
          Remove
        </Link>
      </Flex>
      {!isLoading && !project.holderVerified && !verified && (
        <Text mt={2} fontSize='0.9rem' color='#E64A19'>
          Holder verification failed
        </Text>
      )}
    </GridItem>
  )
}
