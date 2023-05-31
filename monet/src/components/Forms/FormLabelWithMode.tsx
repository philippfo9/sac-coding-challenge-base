import { FormLabel, FormLabelProps, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { formLabelStyle } from './StyledInputs'

export const FormLabelWithMode: React.FC<FormLabelProps> = (props) => {
  const { colorMode } = useColorMode()
  return (
    <FormLabel
      style={formLabelStyle}
      color={
        colorMode === 'dark' ? '#efefef' : 'rgba(0, 0, 0, 0.8)'
      }
      {...props}
    >
      {props.children}
    </FormLabel>
  )
}
