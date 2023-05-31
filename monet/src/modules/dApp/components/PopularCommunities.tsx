import React from 'react'
import {Box, Button, Flex, Text, Link} from '@chakra-ui/react'
import {BsArrowRight} from 'react-icons/bs'
import {useFeaturedProjects} from '../../techRaffles/hooks/project';
import {useEffectOnce} from 'react-use';
import CommunityCardListSkeleton from "./Skeletons/CommunityCardListSkeleton";
import CommunityCard from "./CommunityCard";
import NextLink from 'next/link'

const PopularCommunities = () => {
  const {data: projects, isLoading: isLoading} = useFeaturedProjects();

  useEffectOnce(() => {
    const slider = window?.document?.querySelector('.slidable') as HTMLElement
    let mouseDown = false
    let startX: number, scrollLeft: number

    const startDragging = (e: MouseEvent) => {
      mouseDown = true
      startX = e.pageX - slider.offsetLeft
      scrollLeft = slider.scrollLeft
    }
    const stopDragging = () => {
      mouseDown = false
    }

    slider.addEventListener('mousemove', (e: MouseEvent) => {
      e.preventDefault()
      if (!mouseDown) {
        return
      }
      const x = e.pageX - slider.offsetLeft
      const scroll = x - startX
      slider.scrollLeft = scrollLeft - scroll
    })

    slider.addEventListener('mousedown', startDragging, false);
    slider.addEventListener('mouseup', stopDragging, false);
    slider.addEventListener('mouseleave', stopDragging, false);
  });

  return (
    <Box mt={['6.75rem', '6.75rem', '6.75rem']} textAlign='center'>
      <Flex justifyContent='space-between' direction={['column', 'row', 'row']}>
        <Text
          fontSize='1.875rem'
          lineHeight='2.25rem'
          fontWeight='600'
          textAlign='left'
        >
          Popular Communities 🔥
        </Text>
        <Box textAlign='left'>
          <NextLink href='/communities' passHref>
            <Link _hover={{}}>
              <Button 
                bg='transparent'
                color='#7B7B7B'
                _hover={{
                  color: '#232323'
                }}
                rightIcon={<BsArrowRight size={20} />}
                >
                  View More
              </Button>
            </Link>
          </NextLink>
          
        </Box>
      </Flex>
      <Box textAlign='center' position='relative'>
        <Box zIndex='1'>
          <Flex
            overflowX='scroll'
            className='slidable'
          >
            {isLoading ? (
              <CommunityCardListSkeleton count={10}/>
            ) : (
              projects?.map((p, i) => (
                <CommunityCard index={i} mlXs={i === 0 ? '0' : '6px'} key={p.id} data-value={p.id} project={p} />
              ))
            )}
          </Flex>
        </Box>
        <Text
          display={['none', 'none', 'block', 'block']}
          position='absolute'
          top='20rem'
          left='50%'
          transform='translateX(-50%)'
          fontWeight='800'
          bgClip='text'
          bgGradient='linear-gradient(180deg, rgba(255, 255, 255, 0) 18%, #CBCBCB 100%)'
          fontSize={['2.635rem', '6.635rem', '7.635rem', '9.635rem']}
          lineHeight='13.188rem'
          zIndex={-1}
        >
          Communities
        </Text>
      </Box>
    </Box>
  )
}

export default PopularCommunities
