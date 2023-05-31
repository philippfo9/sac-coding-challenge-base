import {Button, Flex, useColorMode} from '@chakra-ui/react'
import {FC} from 'react'

interface FilterButtonsProps {
  labels: { label: string, value: string }[]
  initValue?: string
  selectedValue: string
  onChange: (btn: string) => void
}

const FilterButtons: FC<FilterButtonsProps> = ({
  labels,
  onChange,
  selectedValue,
}) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  return (
    <Flex flexWrap='wrap' gap={[1, 1, 2]}>
      {labels.map((btn, idx) => {
        const isActive = btn.value === selectedValue
        return (
          <Button
            key={btn.value}
            variant={isDarkMode ? 'outlinedDark' : 'outlined'}
            w='fit-content'
            backgroundColor={isActive ? isDarkMode ? '#343434' : '#F4F4F4' : 'transparent'}
            borderColor={isActive ? '#ccc' : '#E9E9E9'}
            ml={idx !== 0 ? '0.2rem' : '0'}
            onClick={() => onChange(btn.value)}
          >
            {btn.label}
          </Button>
        )
      })}
    </Flex>
  )
}

export default FilterButtons
