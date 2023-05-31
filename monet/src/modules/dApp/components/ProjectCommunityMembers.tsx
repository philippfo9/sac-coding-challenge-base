import {Box, Center, Spinner, Stack, StackDivider, Text, useColorMode} from '@chakra-ui/react'
import React from 'react'
import {useProjectCommunityMembers, useProjectId} from '../../techRaffles/hooks/project';
import MemberProfile from './MemberProfile';

export default function ProjectCommunityMembers() {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const projectId = useProjectId() || ''
  const membersRes = useProjectCommunityMembers(projectId)

  return (
    <Box>
      <Stack direction='row' alignItems='center'>
        <Text fontSize='1.875rem' fontWeight='600'>
          Community Members
        </Text>
        <Box>
          <Text ml='1rem' rounded='full' padding='.25rem .75rem' bg={isDarkMode ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.8)'} color='white'
                fontWeight='600'>
            {membersRes?.data?.length ?? <Spinner size='sm' mt='0.3rem'/>}
          </Text>
        </Box>
      </Stack>
      {membersRes.isLoading && <Center mt='4rem'><Spinner color={isDarkMode ? 'white' : 'black'} /></Center>}
      {!membersRes.isLoading &&
          <Stack
              gap={['1rem', '1rem', '.5rem']}
              mt='2rem'
              divider={<StackDivider borderColor={isDarkMode ? '#464646' : '#EEE'}/>}
          >
            {membersRes.data?.map((member) =>
              <MemberProfile user={member} key={member.name}/>
            )}
          </Stack>
      }
    </Box>
  );
}
