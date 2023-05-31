import React from 'react'
import {Box, SimpleGrid, Skeleton, Stack, Text} from '@chakra-ui/react'
import {raffleType} from '../../techRaffles/types';
import {Element} from 'react-scroll';
import RaffleCardList from './RaffleCardList';

export const RaffleSection = (props: {
  title: string
  raffles?: raffleType[]
  isLoading?: boolean
}) => {
  return (
    <Element name={props.title}>
      <Box>
        <Stack
          direction={['column', 'column', 'row', 'row']}
          justify='space-between'
        >
          <Text fontSize='1.875rem' fontWeight='600'>
            {props.title}
          </Text>
        </Stack>
        {props.isLoading ? (
          <SimpleGrid mt='3rem' columns={[1, 2, 3, 4]} spacing={[6, 8]}>
            {[1,2,3,4,5,6,7].map((i) => (
              <Skeleton key={i} minWidth='300px' minHeight='400px' rounded='1.5rem'/>
            ))}
          </SimpleGrid>
          ) : 
          props.raffles && props.raffles.length > 0 ? <RaffleCardList raffles={props.raffles}/> : <Text>No {props.title.toLowerCase()} available</Text> 
        }
      </Box>
    </Element>
  )
}
