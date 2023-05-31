import { Box, Stack, Text } from "@chakra-ui/react"
import { Player as Lottie } from '@lottiefiles/react-lottie-player'
import { FC, useState } from "react"
import { raffleType } from '../../techRaffles/types';
import { ShowOffModal } from "./ShowOffModal"

interface Props {
  raffle: raffleType
}

export const Won: FC<Props> = ({raffle}) => {
  const [konfettiAnimationCount, setkonfettiAnimationCount] = useState(0)

  return (
    <Box pos='relative'>
      {konfettiAnimationCount < 2 && (
        <Box
          pos='absolute'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'
        >
          <Lottie
            src='https://assets1.lottiefiles.com/packages/lf20_qpph2rp5.json'
            autoplay
            keepLastFrame
            loop
            onEvent={(event) => {
              if (event === 'loop')
                setkonfettiAnimationCount(konfettiAnimationCount + 1)
            }}
          />
        </Box>
      )}

      <Stack
        justify='space-between'
        alignItems='center'
        mt='1rem'
        bg='#F1FFC8'
        borderRadius='1.875rem'
        py={['1.5rem', '1.5rem', '2.5rem', '2.5rem']}
        px={['.5rem', '2.5rem', '2.5rem', '2.5rem']}
        direction='column'
        spacing='1rem'
      >
        <Box
          textAlign='center'
          borderRadius='1.875rem'
          bgGradient='linear(to-t, #6FA912, #CAF287)'
          color='white'
          w='full'
          py='3rem'
        >
          <Text fontSize='1.75rem'>🎉</Text>
          <Text fontWeight='600' fontSize='1.75rem'>
            Congratulations!
          </Text>
          <Text align={'center'} fontWeight='500' mt='1rem' paddingX={['4%', '10%']}>
            You won. {raffle.type === 'NFT' ? 'Check your wallet.' : 'Check in with the creator project that should submit your Discord ID and wallet to the project giving out whitelist.'}
          </Text>
        </Box>
        <Box textAlign='center'>
          <ShowOffModal raffle={raffle}/>
        </Box>
      </Stack>
    </Box>
  )
}