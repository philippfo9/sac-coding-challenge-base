import { Input, InputProps, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { formInputStyle } from './StyledInputs'

export const FormInputWithMode: typeof Input = (props) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  return (
    <Input
      style={formInputStyle}
      color={isDarkMode ? '#fff' : '#232323'}
      border={isDarkMode ? '1px solid #eee' : '1px solid #ccc'}
      background={isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#fefefe'}
      {...props}
    >
      {props.children}
    </Input>
  )
}
