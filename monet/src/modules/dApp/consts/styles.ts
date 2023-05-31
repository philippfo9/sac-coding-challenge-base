import { mode } from '@chakra-ui/theme-tools'
import { ChakraStylesConfig } from 'chakra-react-select'

export const CharkaSelectStyle: (
  colorMode: 'dark' | 'light'
) => ChakraStylesConfig = (colorMode) => {
  return {
    control: (provided, state) => ({
      ...provided,
      p: 0,
      w: '100%',
      minWidth: '8rem',
      height: '3rem!important',
      fontWeight: '600',
      roundedRight: 'full',
      border: 'none',
      bg: colorMode === 'light' ? '#F4F4F4' : 'transparent',
      borderLeft:
        colorMode === 'light' ? '1px solid #E9E9E9' : '1px solid #494949',
    }),
    input: (provided, state) => ({
      ...provided,
      fontSize: '2rem',
      //h: '4rem',
    }),
    menu: (provided, state) => ({
      ...provided,
      rounded: '1rem',
      border:
        colorMode === 'light'
          ? '1px solid #E9E9E9'
          : '1px solid rgba(255, 255, 255, 0.4)',
    }),
    menuList: (provided, state) => ({
      ...provided,
      borderRadius: '14px',
      bg: colorMode === 'light' ? '#fff' : 'cardBlack',
      border: 'none',
    }),
    option: (provided, state) => ({
      ...provided,
      bg: 'transparent',
      color: colorMode === 'light' ? '#000' : '#FFF',
      fontWeight: state.isSelected ? '600' : 'normal',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      rounded: 'full',
      border: 'none',
      bg: 'transparent',
    }),
  }
}

export const ChakraNormalSelectStyle: (
  colorMode: 'dark' | 'light'
) => ChakraStylesConfig = (colorMode) => {
  return {
    control: (provided, state) => ({
      ...provided,
      p: 0,
      w: '100%',
      minWidth: '13rem',
      height: '3rem!important',
      fontWeight: '600',
      rounded: 'full',
      border: 'none',
      bg: colorMode === 'light' ? '#F4F4F4' : 'transparent',
      borderLeft:
        colorMode === 'light' ? '1px solid #E9E9E9' : '1px solid #494949',
    }),
    input: (provided, state) => ({
      ...provided,
      fontSize: '2rem',
    }),
    menu: (provided, state) => ({
      ...provided,
      rounded: '1rem',
      border:
        colorMode === 'light'
          ? '1px solid #E9E9E9'
          : '1px solid rgba(255, 255, 255, 0.4)',
    }),
    menuList: (provided, state) => ({
      ...provided,
      borderRadius: '14px',
      bg: colorMode === 'light' ? '#fff' : 'cardBlack',
    }),
    option: (provided, state) => ({
      ...provided,
      bg: 'transparent',
      color: colorMode === 'light' ? '#000' : '#FFF',
      fontWeight: state.isSelected ? '600' : 'normal',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      rounded: 'full',
      border: 'none',
      bg: 'transparent',
    }),
  }
}

export const CharkaSelectMinStyle: (
  colorMode: 'dark' | 'light'
) => ChakraStylesConfig = (colorMode) => {
  return {
    control: (provided, state) => ({
      ...provided,
      p: 0,
      w: '100%',
      minWidth: '8.8rem',
      height: '2.4rem!important',
      bg: colorMode === 'light' ? '#F4F4F4' : '#494949',
      fontWeight: '600',
      rounded: 'full',
      border:
        colorMode === 'light'
          ? '1px solid #E9E9E9'
          : '1px solid rgba(255, 255, 255, 0.4)',
    }),
    input: (provided, state) => ({
      ...provided,
      fontSize: '1.2rem',
      //h: '4rem',
    }),
    menu: (provided, state) => ({
      ...provided,
      rounded: '1rem',
      border:
        colorMode === 'light'
          ? '1px solid #E9E9E9'
          : '1px solid rgba(255, 255, 255, 0.4)',
    }),
    menuList: (provided, state) => ({
      ...provided,
      borderRadius: '14px',
      bg: colorMode === 'light' ? '#fff' : 'cardBlack',
    }),
    option: (provided, state) => ({
      ...provided,
      bg: 'transparent',
      color: colorMode === 'light' ? '#000' : '#FFF',
      fontWeight: state.isSelected ? '600' : 'normal',
    }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      rounded: 'full',
      border: 'none',
      bg: 'transparent',
    }),
  }
}
