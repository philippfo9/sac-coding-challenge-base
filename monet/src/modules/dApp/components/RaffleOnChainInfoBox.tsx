import { Box, Link, Text, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { UseOnChainRaffleType } from '../../techRaffles/hooks/hookTypes'
import { raffleType } from '../../techRaffles/types'

type OnChainInfoProps = {
  onChainRaffleRes: UseOnChainRaffleType
  raffle: raffleType
}

export const RaffleOnChainInfoBox: React.FC<OnChainInfoProps> = ({
  raffle,
  onChainRaffleRes,
}) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  return (
    <Box
      marginBottom='1rem'
      bg={isDarkMode ? 'cardBlack' : '#F9F9F9'}
      borderRadius='1.875rem'
      paddingY='1.5rem'
      paddingX='2.5rem'
    >
      <Text marginBottom='1rem' textAlign={'center'} textDecor='underline'>
        <i>Raffle info and stats</i>
      </Text>
      <Text>
        <b>Raffle On-Chain Address:</b>{' '}
        <u>
          <Link
            textOverflow={'ellipsis'}
            w='100%'
            overflow='hidden'
            whiteSpace={'nowrap'}
            href={`https://solscan.io/account/${raffle.raffleOnChainAddress}`}
            target='_blank'
          >
            {raffle.raffleOnChainAddress}
          </Link>
        </u>
      </Text>
      <Text>
        <b>Raffle Treasury (proceeds):</b>{' '}
        <u>
          <Link
            textOverflow={'ellipsis'}
            w='100%'
            overflow='hidden'
            whiteSpace={'nowrap'}
            href={`https://solscan.io/account/${onChainRaffleRes.data?.raffleTreasury.toBase58()}`}
            target='_blank'
          >
            {onChainRaffleRes.data?.raffleTreasury.toBase58()}
          </Link>
        </u>
      </Text>
    </Box>
  )
}
