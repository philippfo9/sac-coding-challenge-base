import { EditIcon } from '@chakra-ui/icons'
import { Button, Box, Flex, HStack, Text, Stack, Input, useColorMode } from '@chakra-ui/react'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'

interface GroupButtonsProps {
  options: (string | object)[]
  additionalOptions?: (string | object)[]
  formatOption?: (x: any) => string
  getValueStrOfOption?: (x: any) => string
  initValue?: string | object | string[] | object[]
  selectedOptions: string | object | string[] | object[]
  onChange: (btn: string | string[] | object | object[]) => void
  onCustomizationChange?: (...x: any[]) => void
  allowCustomization?: boolean
  allowCustomizationCondition?: (...x: any[]) => boolean
  customizations?: any[]
  CustomizationBox?: React.FC<{
    customizations: any
    onSave: (...x: any[]) => void
  }>
  disabled?: boolean
  txtColor?: string
  fontSize?: string[]
  p?: string[]
  isMultiChoice?: boolean
}

const GroupButtons: FC<GroupButtonsProps> = ({
  options,
  additionalOptions,
  formatOption,
  getValueStrOfOption,
  onChange,
  customizations,
  onCustomizationChange,
  selectedOptions,
  disabled,
  allowCustomization,
  allowCustomizationCondition,
  CustomizationBox,
  txtColor,
  p,
  fontSize,
  isMultiChoice = false,
}) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'

  const activeColor= isDarkMode ? 'black' : 'white'
  const activeBorderColor= 'none'
  const activeBgColor = isDarkMode ? 'white' : 'black';
  const inActiveColor= isDarkMode ? '#BBB' : '#AAA'
  const bgColor= isDarkMode ? 'rgba(238, 239, 238, 0.1);' : 'rgba(238, 239, 238, 0.1);'

  if (options.length && typeof options[0] !== 'string' && (!formatOption || !getValueStrOfOption)) {
    console.log('Object options need a format option');
  }
  const getValueStringOrPlain = (option: object | string) => getValueStrOfOption ? getValueStrOfOption(option) : option as string
  const [valuesToCustomize, setValuesToCustomize] = useState<(string | object)[]>([])
  const [value, setValue] = useState(
    isMultiChoice ? (selectedOptions as (string | object)[] ?? []).map(option => getValueStringOrPlain(option)) : selectedOptions as string ?? ''
  )
  const [customizedValues, setCustomizedValues] = useState<object[]>([])
  
  useEffect(() => {
    console.log({ selectedOptionsGroupButtons: selectedOptions })

    setValue(isMultiChoice ? (selectedOptions as (string | object)[] ?? []).map(option => getValueStringOrPlain(option)) : selectedOptions as string ?? '')
  }, [selectedOptions])

  const [showMore, setShowMore] = useState(false)

  const changeCustomization = (newValue: object) => {
    console.log('saving customization', [
      ...customizedValues.filter(value => getValueStringOrPlain(value) !== getValueStringOrPlain(newValue)),
      newValue
    ]);
    
    setCustomizedValues(
      [
        ...customizedValues.filter(value => getValueStringOrPlain(value) !== getValueStringOrPlain(newValue)),
        newValue
      ]
    )
    setValuesToCustomize(
      valuesToCustomize.filter((v) => v !== getValueStringOrPlain(newValue))
    )
    onCustomizationChange && onCustomizationChange(newValue)
  }

  const onChangeValue = useCallback(
    (_value: (string)) => {
      console.log('on change val', {_value});
      
      if (isMultiChoice) {
        const values = value as (string)[]
        const optionForValue = [...options, ...(additionalOptions ?? [])].find(o => getValueStringOrPlain(o) === _value)
        if (values.includes(_value)) {
          const updated = values.filter((e) => e !== _value)
          setValue(updated)
          console.log({updated, options});

          const outerUpdate = getValueStrOfOption ? updated.map(v => {
            const optionValue = [...options, ...(additionalOptions ?? [])].find(o => getValueStrOfOption(o) === v)
            if (!optionValue) return
            if (typeof optionValue === 'string') return optionValue
            const customizedValue = customizedValues.find(c => getValueStringOrPlain(optionValue) === getValueStringOrPlain(c))
            return {
              ...optionValue,
              ...customizedValue
            }
          }) : updated

          console.log({outerUpdate});
          
          
          onChange(outerUpdate)
        } else {
          const updated = [...values, _value]
          setValue(updated)

          console.log({customizedValues});
          
          const outerUpdate = getValueStrOfOption ? updated.map(v => {
            const optionValue = [...options, ...(additionalOptions ?? [])].find(o => getValueStrOfOption(o) === v)
            if (!optionValue) return
            if (typeof optionValue === 'string') return optionValue
            const customizedValue = customizedValues.find(c => getValueStringOrPlain(optionValue) === getValueStringOrPlain(c))
            return {
              ...optionValue,
              ...customizedValue
            }
          }) : updated

          if (allowCustomizationCondition && allowCustomizationCondition(optionForValue)) {
            setValuesToCustomize([...valuesToCustomize, _value])
          }

          console.log({outerUpdate});

          onChange(outerUpdate)
        }
      } else {
        setValue(_value)
        onChange(_value)
      }
    },
    [value, customizedValues, options, additionalOptions]
  )
  return (
    <Box>
      {options.map((option, idx) => {
        const valueStrOfOption = getValueStringOrPlain(option)
        const selectedOption = isMultiChoice ? (selectedOptions as (string|object)[]).find((selectedOpt: any) => getValueStringOrPlain(selectedOpt) === valueStrOfOption) : undefined
        const formattedOption = formatOption ? formatOption(option) : option as string
        const formattedSelectedOption = !!selectedOption && formatOption ? formatOption(selectedOption) : formattedOption
        const isActive = isMultiChoice ? (selectedOptions as (string|object)[]).filter((v) => getValueStringOrPlain(v) === valueStrOfOption).length > 0 : option === selectedOptions as string|object

        return (
          <Box
            key={valueStrOfOption}
            height='100%'
            display='inline-block'
            mr='0.8rem'
            mb='0.8rem'
            backgroundColor={
              allowCustomization && valuesToCustomize.includes(valueStrOfOption)
                ? isDarkMode ? 'cardBlack' : '#fafafa'
                : 'unset'
            }
            padding={
              allowCustomization && valuesToCustomize.includes(valueStrOfOption)
                ? '1rem'
                : 'unset'
            }
            borderRadius='12px'
          >
            <Button
              key={valueStrOfOption}
              minW={p ? 'unset' : '8rem'}
              bg='transparent'
              fontSize={fontSize ? fontSize : 'unset'}
              p={p}
              mr='0.2rem'
              color={
                txtColor ? txtColor : isActive ? activeColor : inActiveColor
              }
              border='1px solid'
              borderColor={isActive ? activeBorderColor : inActiveColor}
              backgroundColor={isActive ? activeBgColor : bgColor}
              borderRadius='5px'
              _hover={{}}
              onClick={() => !disabled && onChangeValue(valueStrOfOption)}
              disabled={disabled}
              mt={['.5rem', 0, 0, 0]}
            >
              {formattedSelectedOption}
            </Button>
            {allowCustomization && (!allowCustomizationCondition || allowCustomizationCondition(option)) && (
              <Button
                onClick={() => {
                  if (valuesToCustomize.includes(valueStrOfOption)) {
                    setValuesToCustomize(
                      valuesToCustomize.filter((v) => v !== valueStrOfOption)
                    )
                  } else {
                    setValuesToCustomize([...valuesToCustomize, valueStrOfOption])
                  }
                }}
                paddingInline={'2px'}
                color={activeColor}
                variant='ghost'
                textDecor={'underline'}
              >
                {valuesToCustomize.includes(valueStrOfOption) ? 'Close' : 'Edit'}
              </Button>
            )}
            {allowCustomization &&
              onCustomizationChange &&
              valuesToCustomize.includes(valueStrOfOption) &&
              !!CustomizationBox && (
                <CustomizationBox
                  onSave={(data) => changeCustomization(data)}
                  customizations={customizations}
                >
                  {formattedOption}
                </CustomizationBox>
              )}
          </Box>
        )
      })}
      {!showMore && additionalOptions && additionalOptions.length > 0 && (
        <Button
          mt={['0.5rem', '0']}
          ml={['0', '0.5rem']}
          variant={isDarkMode ? 'secondaryDark' : 'secondary'}
          onClick={() => setShowMore(true)}
        >
          Show more
        </Button>
      )}
      {showMore &&
        additionalOptions?.map((option, idx) => {
          const valueStrOfOption = getValueStringOrPlain(option)
          const selectedOption = isMultiChoice ? (selectedOptions as (string|object)[]).find((selectedOption: any) => getValueStringOrPlain(selectedOption) === valueStrOfOption) : undefined
          const formattedOption = formatOption ? formatOption(option) : option as string
          const formattedSelectedOption = !!selectedOption && formatOption ? formatOption(selectedOption) : formattedOption
          const isActive = isMultiChoice ? (selectedOptions as (string|object)[]).filter((v) => getValueStringOrPlain(v) === valueStrOfOption).length > 0 : option === selectedOptions as string|object
          
          return (
            <Box
              key={valueStrOfOption}
              height='100%'
              display='inline-block'
              mr='0.8rem'
              mb='0.8rem'
              backgroundColor={
                allowCustomization && valuesToCustomize.includes(valueStrOfOption)
                  ? isDarkMode ? 'cardBlack' : '#fafafa'
                  : 'unset'
              }
              padding={
                allowCustomization && valuesToCustomize.includes(valueStrOfOption)
                  ? '1rem'
                  : 'unset'
              }
              borderRadius='12px'
            >
              <Button
                key={valueStrOfOption}
                minW={p ? 'unset' : '8rem'}
                bg='transparent'
                fontSize={fontSize ? fontSize : 'unset'}
                p={p}
                color={
                  txtColor ? txtColor : isActive ? activeColor : inActiveColor
                }
                border='1px solid'
                mr='0.2rem'
                borderColor={isActive ? activeBorderColor : inActiveColor}
                backgroundColor={isActive ? activeBgColor : bgColor}
                borderRadius='5px' 
                _hover={{}}
                disabled={disabled}
                onClick={() => !disabled && onChangeValue(valueStrOfOption)}
                mt={['.5rem', 0, 0, 0]}
              >
                {formattedSelectedOption}
              </Button>

              {allowCustomization && (!allowCustomizationCondition || allowCustomizationCondition(option)) && (
                <Button
                  onClick={() => {
                    if (valuesToCustomize.includes(valueStrOfOption)) {
                      setValuesToCustomize(
                        valuesToCustomize.filter((v) => v !== valueStrOfOption)
                      )
                    } else {
                      setValuesToCustomize([...valuesToCustomize, valueStrOfOption])
                    }
                  }}
                  paddingInline={'2px'}
                  color={isDarkMode ? '#fff' : '#232323'}
                  variant='ghost'
                  textDecor={'underline'}
                >
                  {valuesToCustomize.includes(valueStrOfOption) ? 'Close' : 'Edit'}
                </Button>
              )}
              {allowCustomization &&
                onCustomizationChange &&
                valuesToCustomize.includes(valueStrOfOption) &&
                !!CustomizationBox && (
                  <CustomizationBox
                    onSave={(data) => changeCustomization(data)}
                    customizations={customizations}
                  >
                    {formattedOption}
                  </CustomizationBox>
                )}
            </Box>
          )
        })}
    </Box>
  )
}

export default GroupButtons
