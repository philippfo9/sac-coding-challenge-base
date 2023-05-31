import { FC } from 'react'
import { Select } from 'chakra-react-select';
import { useColorMode } from '@chakra-ui/react';

interface OrderButtonProps {
  values: { label: string, value: string }[]
  selectedValue?: string,
  disabled?: boolean,
  onChange: (btn: string) => void,
}

const OrderSelect: FC<OrderButtonProps> = ({
                                             values,
                                             selectedValue,
                                             disabled,
                                             onChange,
                                           }) => {

  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  return (
    <Select
      isDisabled={disabled ?? false}
      className='app-charka-react-select'
      onChange={(it) => it ? onChange((it as { label: string, value: string }).value) : null}
      chakraStyles={{
        control: (provided, state) => ({
          ...provided,
          p: 0,
          w: '13rem',
          rounded: 'full',
          fontWeight: '600',
          color: isDarkMode ? 'white' : 'black'
        }),
        menu: (provided, state) => ({
          ...provided,
          borderRadius: '14px',
        }),
        menuList: (provided, state) => ({
          ...provided,
          borderRadius: '14px',
        }),
        option: (provided, state) => ({
          ...provided,
          bg: 'transparent',
          fontWeight: state.isSelected ? '600' : 'normal',
          color: isDarkMode ? 'white' : 'black',
        }),
        dropdownIndicator: (provided, state) => ({
          ...provided,
          rounded: 'full',
          border: 'none',
          bg: 'transparent',
        }),
      }}
      tagVariant='solid'
      value={values.find((v) => v.value === selectedValue)}
      options={values}
    />
  )
}

export default OrderSelect
