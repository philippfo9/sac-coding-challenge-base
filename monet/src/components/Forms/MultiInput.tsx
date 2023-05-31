import { Button, Box, Input, Flex, IconButton } from '@chakra-ui/react'
import { useCallback, useEffect } from 'react'
import { useState } from 'react'
import { FC } from 'react'
import { BiTrashAlt } from 'react-icons/bi'

interface MultiInputProps {
  values?: string[]
  addBtnName: string
  onChange: (values: string[]) => void
  isInvalid?: boolean
}

const MultiInput: FC<MultiInputProps> = ({
  values,
  onChange,
  addBtnName,
  isInvalid,
}) => {
  const [inputsValue, setInputsValue] = useState(values ?? [''])

  useEffect(() => {
    setInputsValue(values || [''])
  }, [values])

  const onAddInput = useCallback(() => {
    const updateValue = [...inputsValue, '']
    setInputsValue(updateValue)
  }, [inputsValue, setInputsValue])

  const onInputChange = useCallback(
    (index, value) => {
      const updateValue = [...inputsValue]
      updateValue[index] = value
      setInputsValue(updateValue)
      onChange(updateValue)
    },
    [inputsValue, setInputsValue, onChange]
  )

  const onDeleteInput = useCallback(
    (idx) => {
      const updateValue = [...inputsValue]
      updateValue.splice(idx, 1)

      setInputsValue(updateValue)
      onChange(updateValue)
    },
    [inputsValue, setInputsValue, onChange]
  )

  return (
    <Box>
      {inputsValue.map((input, idx) => {
        return (
          <Flex mt={idx !== 0 ? '0.5rem' : '0'} key={idx}>
            <Input
              w='40rem'
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange(idx, e.target.value)
              }
              value={input}
              isInvalid={isInvalid && !input}
            />
            <IconButton
              disabled={inputsValue.length === 1}
              onClick={() => onDeleteInput(idx)}
              aria-label='Delete'
              icon={<BiTrashAlt />}
              bgColor='#B12626'
              color='#fff'
              border='none'
              _hover={{}}
              ml='1rem'
            />
          </Flex>
        )
      })}
      <Button
        bgColor='#232323'
        _hover={{}}
        border='none'
        mt='1rem'
        onClick={onAddInput}
      >
        {addBtnName}
      </Button>
    </Box>
  )
}

export default MultiInput
