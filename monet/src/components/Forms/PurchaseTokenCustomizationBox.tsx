import { Box, Button, FormControl, FormLabel, Input, InputGroup, InputLeftAddon, Text, useColorMode } from '@chakra-ui/react'
import React, {useCallback, useEffect, useState} from 'react'
import { z, ZodFormattedError } from 'zod'
import { FormInputWithMode } from './FormInputWithMode'
import { FormLabelWithMode } from './FormLabelWithMode'

export interface ITokenCustomization {
  symbol: string
  discount?: number
  fixedPrice?: number
}

interface CustomizationBoxProps {
  customizations: ITokenCustomization[]
  onSave: (value: ITokenCustomization) => void
}

const customizationValidationSchema = z.object({
  symbol: z.string(),
  discount: z.number().optional(),
  fixedPrice: z.number().optional(),
})

export const PurchaseTokenCustomizationBox: React.FC<CustomizationBoxProps> = ({
  children,
  customizations,
  onSave
}) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const labelColor = isDarkMode ? '#E1E1E1' : 'rgba(0, 0, 0, 0.8)'
  const selected = customizations.find((c) => c.symbol === children)
  const [formData, setFormData] = useState<
    z.infer<typeof customizationValidationSchema>
  >({
    symbol: (children as string) ?? '',
    discount: selected?.discount,
    fixedPrice: selected?.fixedPrice,
  })
  const updateFormValue = useCallback((key, value) => {
    if (value === undefined || value === null || value === 'NaN') {
      setFormData((formData) => ({ ...formData, [key]: '' }))
    } else {
      setFormData((formData) => ({ ...formData, [key]: value }))
    }
  }, [])

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    z.infer<typeof customizationValidationSchema>
  > | null>(null)

  useEffect(() => {
    const valid = customizationValidationSchema.safeParse(formData)
    if (!valid.success) {
      setFormErrors(valid.error.format())
    } else {
      setFormErrors(null)
    }
  }, [formData])

  return (
    <Box paddingY='2rem'>
      <Text fontSize='1.2rem' fontWeight={600} mb='1rem'>
        Customize settings for purchase token: {children}
      </Text>
      <FormControl
        mt='1rem'
        color={labelColor}
        as='legend'
      >
        <FormLabelWithMode>Price for people to pay for a ticket in this token</FormLabelWithMode>
        <InputGroup w='17rem'>
          <InputLeftAddon children={children}></InputLeftAddon>
          <FormInputWithMode
            maxW='100%'
            type='number'
            placeholder={'0'}
            value={formData.fixedPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateFormValue(
                'fixedPrice',
                e.target.value.length > 0 ? parseFloat(e.target.value) : ''
              )
            }}
            isInvalid={!!formErrors?.fixedPrice}
          ></FormInputWithMode>
        </InputGroup>
      </FormControl>
      {/*<FormControl mt='1rem' color={labelColor} as='legend'>
        <FormLabelWithMode>Token Discount</FormLabelWithMode>
        <InputGroup w='17rem'>
          <InputLeftAddon children='%'></InputLeftAddon>
          <FormInputWithMode
            maxW={'100%'}
            type='number'
            placeholder={'0'}
            value={formData.discount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateFormValue(
                'discount',
                e.target.value.length > 0 ? parseFloat(e.target.value) : ''
              )
            }}
            isInvalid={!!formErrors?.discount}
          ></FormInputWithMode>
        </InputGroup>
          </FormControl>*/}
      <Button
        w='15rem'
        variant={isDarkMode ? 'primaryDark' : 'primary'}
        border='none'
        fontSize='0.95rem'
        mt='1rem'
        onClick={() => onSave(formData)}
      >
        Save settings for token
      </Button>
    </Box>
  )
}
