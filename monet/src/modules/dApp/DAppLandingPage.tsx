import React from 'react'
import { Box } from '@chakra-ui/react'
import PopularCommunities from './components/PopularCommunities'
import { TrendingRaffles } from './components/TrendingRaffles'
import DAppLayout from './layouts/DAppLayout'
import LandingPageRaffles from './components/LandingPageRaffles';

const DAppLandingPage = () => {

  return (
    <DAppLayout>
      <TrendingRaffles />
      <PopularCommunities />
      <Box mt={['5rem', '18rem']}>
        <LandingPageRaffles />
      </Box>
    </DAppLayout>
  )
}

export default DAppLandingPage
