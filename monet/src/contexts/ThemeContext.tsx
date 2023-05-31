import { createContext, FC, useState, useCallback } from 'react'
import {themeFlatLight} from '../themeFlat'
import { ChakraProvider } from '@chakra-ui/react'

export const ThemeContext = createContext<any>(null)

export const ThemeProvider: FC = ({ children }) => {
  // We can handle dark/light mode here
  const [theme, setTheme] = useState(themeFlatLight)

  // Not used currently, but will be used if we have more themes
  const changeTheme = useCallback((themeName) => {
    if (themeName === 'flat') {
      setTheme(themeFlatLight)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, changeTheme }}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </ThemeContext.Provider>
  )
}
