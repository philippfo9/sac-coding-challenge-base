import React from 'react'
import { Textarea, useColorMode } from '@chakra-ui/react'

export const TextareaWithMode: typeof Textarea = (props) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'

  return (
    <Textarea
      {...props}
      color={isDarkMode ? 'white' : 'black'}
      border={isDarkMode ? '1px solid #eee' : '1px solid #ccc'}
      background={isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#fefefe'}

    ></Textarea>
  )
}
