import {Box, Center, Flex, Spinner, Stack, StackDivider, Text, useColorMode} from '@chakra-ui/react'
import React from 'react'
import {useProjectCommunityMembers, useProjectId} from '../../techRaffles/hooks/project';
import MemberProfile from './MemberProfile';
import {useCollectionsByProjectId} from "../../techRaffles/hooks/collection";
import CollectionCard from "./CollectionCard";

export default function ProjectCollections() {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const projectId = useProjectId() || ''
  const {data: collections, isLoading} = useCollectionsByProjectId(projectId)

  return (
    <Box>
      <Stack direction='row' alignItems='center'>
        <Text fontSize='1.875rem' fontWeight='600'>
          Collections
        </Text>
        <Box>
          <Text ml='1rem' rounded='full' padding='.25rem .75rem' bg={isDarkMode ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.8)'}  color='white'
                fontWeight='600'>
            {collections?.length ?? <Spinner size='sm' mt='0.3rem'/>}
          </Text>
        </Box>
      </Stack>
      {isLoading && <Center mt='4rem'><Spinner/></Center>}
      {!isLoading &&
          <Flex
              flexWrap='wrap'
              justifyContent={['center', 'center', 'start']}
          >
            {collections?.map((p) => (
              <CollectionCard key={p.name} collection={p}/>
            ))}
          </Flex>
      }
      {!isLoading && (collections?.length ?? 0) < 1 &&
         <Center><Text fontWeight={600} fontSize='1.5rem' mt='12rem'>No collections available.</Text></Center>
      }
    </Box>
  );
}
