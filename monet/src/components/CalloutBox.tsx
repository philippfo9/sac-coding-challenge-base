import { HStack, Text, useColorMode } from '@chakra-ui/react'
import { FC } from 'react'

type CalloutBoxProps = {
  emoji: string
  infoText: string | React.ReactElement
}

const CalloutBox: FC<CalloutBoxProps> = ({ emoji, infoText }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  return (
    <HStack
      marginY='.6rem'
      maxWidth='900px'
      bg={isDarkMode ? '#313133' : '#f1f1f1'}
      borderRadius={'4px'}
      paddingX='.8rem'
      paddingY='1rem'
      spacing={4}
    >
      <Text color={isDarkMode ? 'white' : 'black'} fontSize='1.4rem'>{emoji}</Text>
      <Text color={isDarkMode ? 'white' : 'black'} fontSize='1rem'>
        {infoText}
      </Text>
    </HStack>
  )
}

export default CalloutBox
