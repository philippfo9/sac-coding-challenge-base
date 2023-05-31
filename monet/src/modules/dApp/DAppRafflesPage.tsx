import React from 'react'
import { Box } from '@chakra-ui/react'
import PopularCommunities from './components/PopularCommunities'
import { TrendingRaffles } from './components/TrendingRaffles'
import DAppLayout from './layouts/DAppLayout'
import LandingPageRaffles from './components/LandingPageRaffles';

const DAppRafflesPage = () => {

  return (
    <DAppLayout>
      <TrendingRaffles />
      <Box mt={['2rem', '4rem']}>
        <LandingPageRaffles />
      </Box>
    </DAppLayout>
  )
}

export default DAppRafflesPage
