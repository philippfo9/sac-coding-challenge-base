import {
  Center,
  Text
} from '@chakra-ui/react'
import React, { FC, } from 'react'

export const FeatureDisabled: FC<{ fontSize?: string, text?: string, mt?: string }> = ({fontSize, text, mt}) => {
  return (
    <Center mt={mt || '10rem'}>
      <Text
        fontWeight='900'
        fontSize={fontSize || '2.5rem'}
      >
        {text || 'Feature disabled'}
      </Text>
    </Center>
  )
}
