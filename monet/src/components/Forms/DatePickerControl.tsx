import { forwardRef, Button, Box, Input, useColorMode } from '@chakra-ui/react'
import { addDays, addHours } from 'date-fns'
import { useEffect, useState } from 'react'
import { useCallback } from 'react'
import { FC } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

interface DatePickerProps {
  date: Date
  w?: string[]
  h?: string[]
  onChange: (date: Date) => void
  dateFormat?: string | string[]
  isInvalid?: boolean
  color?: string
  maxDate?: Date
  minDate?: Date
}

const DatePickerControl: FC<DatePickerProps> = ({
  onChange,
  date,
  w = '17rem',
  dateFormat,
  isInvalid,
  color,
  minDate,
  maxDate,
}) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const [selectedDate, setSelectedDate] = useState(date ?? null)

  useEffect(() => {
    setSelectedDate(date)
  }, [date])

  const onChangeValue = useCallback(
    (date) => {
      console.log('triggering on change', date);
      console.log('change date val', date)

      setSelectedDate(date)
      onChange(date)
    },
    [onChange, setSelectedDate]
  )

  return (
    <Box
      w={w}
      css={
        {
          '.react-datepicker__input-container': {
            background: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#fefefe',
            border: isInvalid ? '1px solid red' : isDarkMode ? '1px solid #eee' : '1px solid #ccc',
            borderColor: isInvalid ? 'red' : isDarkMode ? '#eee' : '#ccc',
          }
        }
      }
      padding='0'
      color={isDarkMode ? 'white' : '#232323'}
    >
      <DatePicker
        showTimeInput
        maxDate={maxDate}
        minDate={minDate}
        dateFormat={dateFormat}
        selected={selectedDate}
        onChange={onChangeValue}
      />
    </Box>
  )
}

export default DatePickerControl
