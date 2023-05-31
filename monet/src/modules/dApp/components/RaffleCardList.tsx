import React from 'react'
import {SimpleGrid} from '@chakra-ui/react'
import {RaffleCard} from './RaffleCard'
import {raffleMinType} from '../../techRaffles/types';
import { useOnChainRaffleListData } from '../../techRaffles/hooks/raffle';

const RaffleCardList = (props: {
  raffles?: raffleMinType[]
}) => {
  const combinedRaffleRes = useOnChainRaffleListData(props.raffles)
  return (
    <SimpleGrid mt='3rem' columns={[1, 2, 3, 4]} spacing={[6, 8]}>
      {(combinedRaffleRes.value ?? props.raffles ?? []).map((raffle) => (
        <RaffleCard key={raffle.id} raffle={raffle} />
      ))}
    </SimpleGrid>
  )
}

export default RaffleCardList
