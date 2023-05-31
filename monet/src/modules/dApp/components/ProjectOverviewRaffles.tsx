import {
  Box,
  Center,
  FormLabel,
  HStack,
  Spinner,
  Stack,
  Switch,
  Text
} from '@chakra-ui/react'
import React, {
  useEffect,
  useState
} from 'react'
import {
  raffleFilterType, raffleMinType,
  raffleOrderByType,
  raffleProjectFilterType,
  raffleStatusType,
  raffleType
} from '../../techRaffles/types'
import { useRafflesAndUserRafflesByProjectPublicId } from '../../techRaffles/hooks/raffle';
import { Element } from 'react-scroll';
import FilterButtons from './FilterButtons';
import RaffleCardList from './RaffleCardList';
import OrderSelect from './OrderSelect';
import InfiniteScroll from 'react-infinite-scroll-component';
import RaffleCardListSkeleton from './Skeletons/RaffleCardListSkeleton';
import {LoadingMoreRaffles} from "./LoadingMoreRaffles";


const orderByLabels: { label: string, value: raffleOrderByType }[] = [{label: 'Ending Soon', value: 'ENDING_SOON'}, {
  label: 'Recently added',
  value: 'RECENTLY_ADDED'
}, {label: 'floor price (24h) desc.', value: 'FLOOR'}, {label: 'avg. price (24h) desc.', value: 'AVG24'}];

const filterScopeLabels: { label: string, value: raffleProjectFilterType }[] = [
  {label: 'All', value: 'ALL'},
  {label: 'NFTs', value: 'NFT'}, 
  {label: 'Whitelist', value: 'WL'},
  {label: 'IRL', value: 'IRL'},
  {label: 'Project Raffles', value: 'PROJECT'},
  {label: 'Community Raffles', value: 'USER'},
  {label: 'Collection Raffles', value: 'COLLECTION'},
]

const statusLabels: { label: string, value: raffleStatusType }[] = [{label: 'Featured Raffles', value: 'FEATURED'}, {
  label: 'All Raffles',
  value: 'ALL'
}, {label: 'Ended Raffles', value: 'ENDED'}];

export default function ProjectOverviewRaffles(props: {}) {
  const [status, setStatus] = useState<raffleStatusType>('FEATURED');
  const [orderBy, setOrderBy] = useState<raffleOrderByType>('ENDING_SOON');
  const [filterBy, setFilterBy] = useState<raffleProjectFilterType>('ALL')
  const [page, setPage] = useState<number>(0)
  const [raffles, setRaffles] = useState<raffleMinType[]>([])
  const [hasMore, setHasMore] = useState(true);

  let title = 'All Raffles';
  useEffect(() => {
    title = filterBy === 'PROJECT' ? 'Project Raffles' : filterBy === 'USER' ? 'Community Raffles' : 'All Raffles'
  }, [filterBy])

  const {data: rafflesData, isFetching} = useRafflesAndUserRafflesByProjectPublicId({
    orderBy: orderBy,
    filter: filterBy,
    status: status,
    page: page
  })

  useEffect(() => {
    if (rafflesData) {
      const filtered = rafflesData.filter(r => {
        for (const raffle of raffles) {
          if (r.id === raffle.id) {
            return false;
          }
        }
        return true;
      })

      const newArr = [...raffles, ...filtered];
      if (hasMore && newArr.length === raffles.length) {
        setHasMore(false);
      }

      setRaffles(newArr);
    }
  }, [rafflesData])

  useEffect(() => {
    setRaffles([]);
    setPage(0);
    setHasMore(true);
  }, [orderBy, filterBy, status])

  return (
    <Element name={title}>
      <Box>
        <Text fontSize='1.875rem' fontWeight='600'>
          {title}
        </Text>
        <Stack
          mt={3}
          direction={['column', 'column', 'row', 'row']}
          justify='space-between'
        >
          <FilterButtons
            selectedValue={status}
            onChange={(it) => setStatus(it as raffleStatusType)}
            labels={statusLabels}
          ></FilterButtons>

          <Stack
            justify={'space-between'}
            direction={['column', 'column', 'row', 'row']}
            gap={[4, 0]}
          >
            <HStack>
              <Text fontSize='1rem' ml={[2, 2, 0]} width='2.5rem'>
                Filter
              </Text>

              <OrderSelect 
                values={filterScopeLabels}
                onChange={(it) => setFilterBy(it as raffleProjectFilterType)}
                selectedValue={filterBy}
              />
            </HStack>

            <HStack>
              <Text fontSize='1rem' ml={[2, 2, 0]} width='2.5rem'>
                Sort
              </Text>
              <OrderSelect values={orderByLabels} onChange={(it) => setOrderBy(it as raffleOrderByType)}
                         selectedValue={orderBy} disabled={status === 'ENDED'}/>
            </HStack>
          </Stack>

        </Stack>
        {raffles && raffles.length > 0 ? (
          <InfiniteScroll
            scrollThreshold={0.75}
            dataLength={raffles.length}
            next={() => setPage(page + 1)}
            hasMore={hasMore}
            loader={<Center mt='3rem'><LoadingMoreRaffles /></Center>}
            endMessage={<Center mt='3rem'>{!isFetching ? <Text></Text> : <LoadingMoreRaffles />}</Center>}
          >
            <RaffleCardList raffles={raffles}/>
          </InfiniteScroll>
        ) : isFetching && (raffles?.length ?? 0) < 1 ? (
          <RaffleCardListSkeleton/>
        ) : (
          <Center mt='3rem'><Text>No {title.toLocaleLowerCase()} available</Text></Center>
        )}
      </Box>
    </Element>
  );
}
