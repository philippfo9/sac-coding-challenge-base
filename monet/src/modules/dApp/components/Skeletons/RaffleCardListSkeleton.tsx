import {
  SimpleGrid,
  Skeleton
} from '@chakra-ui/react';
import React, { useMemo } from 'react';
import RaffleCardSkeleton from './RaffleCardSkeleton';

const RaffleCardListSkeleton = (props: { count?: number }) => {
  const array = useMemo(() => {
    if (!props.count) {
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    }

    const arr = [];
    for (let i = 0; i < props.count; i++) {
      arr.push(i);
    }
    return arr;
  }, [props.count])
  return (
    <SimpleGrid mt='3rem' columns={[1, 2, 3, 4]} spacing={[6, 8]}>
      {array.map((i) => (
        <RaffleCardSkeleton key={i} />
      ))}
    </SimpleGrid>
  )
};

export default RaffleCardListSkeleton