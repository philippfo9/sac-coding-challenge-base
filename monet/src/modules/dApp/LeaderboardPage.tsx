import React, { useEffect, useState } from 'react'
import { Box, HStack, Text } from '@chakra-ui/react'
import DAppLayout from './layouts/DAppLayout'
import FilterButtons from './components/FilterButtons'
import LeaderboardCommunity from './components/LeaderboardCommunity'
import LeaderboardRafflers from './components/LeaderboardRafflers'
import LeaderboardBuyers from './components/LeaderboardBuyers'
import { useLocation } from 'react-use'
import { useRouter } from 'next/router'
import { timeframeFilterType } from '../techRaffles/types'

type leaderboardCategoryType = 'COMMUNITY' | 'CREATORS' | 'BUYERS'
const categoryLabels = [
  { label: 'Communities', value: 'COMMUNITY' },
  { label: 'Creators', value: 'CREATORS' },
  { label: 'Buyers', value: 'BUYERS' },
]
const timeframeLabels: {label: string, value: timeframeFilterType}[] = [
  { label: 'All time', value: 'ALLTIME' },
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
]

const LeaderboardPage = () => {
  const [leaderboardCategory, setLeaderboardCategory] =
    useState<leaderboardCategoryType>('COMMUNITY')
  const [timeframe, setTimeframe] = useState<timeframeFilterType>('ALLTIME')
  
  const location = useLocation()
  const router = useRouter()
  useEffect(() => {
    const query = location.hash?.split('#')[1]
    if (query && query !== leaderboardCategory) {
      setLeaderboardCategory(query as leaderboardCategoryType)
    }
  }, [location.hash, leaderboardCategory])

  return (
    <DAppLayout>
      <Box mx='1.5rem' mt='3rem'>
        <Text fontSize='2rem' fontWeight='600' mb='1rem'>
          Leaderboard
        </Text>
        <HStack justify={'space-between'}> 
          <FilterButtons
            labels={categoryLabels}
            selectedValue={leaderboardCategory}
            onChange={(value) =>
              router.push(`#${value as leaderboardCategoryType}`)
            }
          />
          <FilterButtons
            labels={timeframeLabels}
            selectedValue={timeframe}
            onChange={(value) =>
              setTimeframe(value as timeframeFilterType)
            }
          />
        </HStack>

        <Box mt='2rem'>
          <LeaderboardCommunity timeframe={timeframe} visible={leaderboardCategory === 'COMMUNITY'} />
          <LeaderboardRafflers timeframe={timeframe} visible={leaderboardCategory === 'CREATORS'} />
          <LeaderboardBuyers timeframe={timeframe} visible={leaderboardCategory === 'BUYERS'} />
        </Box>
      </Box>
    </DAppLayout>
  )
}

export default LeaderboardPage
