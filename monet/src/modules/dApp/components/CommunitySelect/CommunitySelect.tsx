import 'react-alice-carousel/lib/alice-carousel.css'
import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Image,
  Link,
  Progress,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { projectType } from '../../../techRaffles/types'
import { CommunitySelectItem } from './CommunitySelectItem'
import { trpc } from '../../../../utils/trpc'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { ProfilePicture } from '../ProfilePicture'

interface Props {
  onValidChange: (valid: boolean) => void
  onLoadingChange: (loading: boolean) => void
  onChange: (projects: projectType[]) => void
}

export type CommunitySelectProjectType = projectType & {
  holderVerified: boolean
}

export const CommunitySelect: FC<Props> = (props: Props) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const { data: holderProjectsData } = trpc.useQuery([
    'project.holder-projects-community-raffle-enabled',
  ])
  const { data: allProjectsData } = trpc.useQuery([
    'project.communityRaffleEnabled',
  ])
  const holderProjects = useMemo(() => {
    if (!holderProjectsData) {
      return []
    }

    return holderProjectsData.map((h) => {
      return {
        ...h,
        holderVerified: true,
      } as CommunitySelectProjectType
    })
  }, [holderProjectsData])
  const allProjects = useMemo(() => {
    if (!allProjectsData) {
      return []
    }

    return allProjectsData.map((h) => {
      return {
        ...h,
        holderVerified: false,
      } as CommunitySelectProjectType
    })
  }, [allProjectsData])

  const { onChange, onLoadingChange, onValidChange } = props

  const [selectedProjects, setSelectedProjects] = useState<
    CommunitySelectProjectType[]
  >([])
  const [searchString, setSearchString] = useState<string>('')

  const [valid, setValid] = useState(true)
  const [validChange, setValidChange] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingChange, setIsLoadingChange] = useState(true)
  const [validList, setValidList] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )
  const [isLoadingList, setIsLoadingList] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const pickerItems = useMemo(() => {
    const ps = []

    const holderProjectIds = holderProjects.map((p) => p.id)

    const uniqueAllProjects = allProjects.filter(
      (aP) => !holderProjectIds.includes(aP.id)
    )

    for (const p of [...holderProjects.slice(), ...uniqueAllProjects.slice()]) {
      let isIn = false
      for (const i of selectedProjects) {
        if (i.id === p.id) {
          isIn = true
          break
        }
      }
      if (!isIn) {
        ps.push(p)
      }
    }
    return ps
  }, [holderProjects, allProjects, selectedProjects])

  useMemo(() => {
    let isError = false
    for (const valid of validList.values()) {
      if (!valid) {
        isError = true
        break
      }
    }
    setValid(!isError)
    onValidChange(!isError)
  }, [onValidChange, validList, validChange])

  useMemo(() => {
    let isLoading = false
    for (const loading of isLoadingList.values()) {
      if (loading) {
        isLoading = true
        break
      }
    }
    setIsLoading(isLoading)
    onLoadingChange(isLoading)
  }, [onLoadingChange, isLoadingList, isLoadingChange])

  useMemo(() => {
    onChange(selectedProjects);
  }, [selectedProjects])

  const handleSelectedItemsChange = (newSelectedItems: CommunitySelectProjectType) => {
    if (newSelectedItems) {
      setSelectedProjects([...selectedProjects, newSelectedItems])
      setSearchString(' ')
      setTimeout(() => {
        setSearchString('')
      }, 1)
    }
  }

  const removeProject = useCallback(
    (projectId: string) => {
      let index = -1
      for (let i = 0; i < selectedProjects.length; i++) {
        const selectedItem = selectedProjects[i]
        if (selectedItem.id === projectId) {
          index = i
          break
        }
      }
      if (index != -1) {
        selectedProjects.splice(index, 1)
        console.log(selectedProjects)
        setSelectedProjects([...selectedProjects])
        validList.delete(projectId)
        setValidList(validList)
        setValidChange(!validChange)
        isLoadingList.delete(projectId)
        setIsLoadingList(isLoadingList)
        setIsLoadingChange(!isLoadingChange)
      }
    },
    [selectedProjects, validChange, validList, isLoadingChange, isLoadingList]
  )

  const formatResult = (project: CommunitySelectProjectType) => {
    return (
      <Flex justify='space-between' align='center' pe='1rem'>
        <HStack gap={1}>
          <ProfilePicture
            gradientstart={project.gradientStart}
            gradientend={project.gradientEnd}
            w={['30px', '40px']}
            h={['30px', '40px']}
            imageurl={project.profilePictureUrl}
            rounded='full'
          ></ProfilePicture>
          <Text ml={0} as='span' fontSize={['0.82rem', '1rem']}>{project.communityName}</Text>
        </HStack>
        <Box>
          {project.holderVerified ? (
            <Badge fontSize={['0.6rem', '0.8rem']} ml={2} colorScheme='purple'>Verified Holder</Badge>
          ) : (
            <Badge fontSize={['0.6rem', '0.8rem']} ml={2} colorScheme='gray'>Select to check</Badge>
          )}
        </Box>
      </Flex>
    )
  }

  return (
    <Box
    width='100%'
      sx={{
        'ul': {
          maxHeight: ['300px', '400px'],
          overflowY: 'auto',
        },
      }}
    >
      <Box zIndex={3} width='100%'>
        <ReactSearchAutocomplete
          resultStringKeyName='communityName'
          fuseOptions={{ keys: ['communityName'] }}
          placeholder='Search communities e.g. Stoned Ape Crew'
          items={pickerItems}
          inputSearchString={searchString}
          showItemsOnFocus={true}
          showIcon={false}
          styling={{
            
            borderRadius: '6px',
            zIndex: 4,
            color: isDarkMode ? '#fff' : '#232323',
            border: isDarkMode ? '1px solid #eee' : '1px solid #ccc',
            backgroundColor: isDarkMode ? '#2C2C2D' : '#fefefe',
            hoverBackgroundColor: isDarkMode ? '#232323' : '#D9D9D9'
          }}
          onSelect={handleSelectedItemsChange}
          formatResult={formatResult}
        />
      </Box>
      <Text mt={4} fontSize='1rem'>
        Don't see your community on the list? Encourage them to{' '}
        <Link
          textDecor='underline'
          href='https://sac-nft.notion.site/MONET-A-common-place-for-communities-starting-as-a-Digital-Auction-House-Raffle-Platform-7abd3e9f3eb64079a709ee4d70930985'
          target='_blank'
        >
          sign up
        </Link>
      </Text>
      <Text mb='.6rem' mt='2rem' fontSize='1.05rem' fontWeight={600}>
        Added Communities
      </Text>
      <Grid
        width='90%'
        templateColumns={{ sm: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        gap={6}
        w={['23rem', '30rem', '50rem']}
        mb={3}
      >
        {selectedProjects.map((p) => (
          <CommunitySelectItem
            project={p}
            key={p.id}
            onRemoveProject={(id) => removeProject(id)}
            onValidChange={(valid) => {
              setValidList(validList.set(p.id, valid))
              setValidChange(!valid)
            }}
            onLoadingChange={(loading) => {
              setIsLoadingList(isLoadingList.set(p.id, loading))
              setIsLoadingChange(!isLoadingChange)
            }}
          />
        ))}
      </Grid>
      {selectedProjects.length < 1 && (
        <Text fontSize='.9rem'>No communities selected</Text>
      )}
      {isLoading && (
        <VStack mb={3}>
          <Text fontSize='.9rem'>Holder check in progress.</Text>
          <Progress size='xs' isIndeterminate w='100%' />
        </VStack>
      )}
      {!valid && selectedProjects.length > 0 && (
        <Text color='#E64A19'>Please remove the failing communities.</Text>
      )}
    </Box>
  )
}
