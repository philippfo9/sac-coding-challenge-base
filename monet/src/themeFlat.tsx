import { extendTheme } from '@chakra-ui/react'
import { createBreakpoints, mode, Styles } from '@chakra-ui/theme-tools'
import { Global } from '@emotion/react'
import React from 'react'

const fonts = { mono: `'Menlo', monospace` }

export const Fonts = () => (
  <Global
    styles={`
    html {
      font-size: 16px
    }

    @media only screen and (min-width: 600px) {
      html {
        font-size: 16px
      }
    }

    @media only screen and (min-width: 1800px) {
      html {
        font-size: 16px
      }
    }
      `}
  />
)

/*
[
  0 > px, > 480 px, > 748 px, > 992 px]
*/

const breakpoints = createBreakpoints({
  sm: '30em',
  md: '62em',
  lg: '80em',
  xl: '80em',
  tm: '1220px',
})

type GradientProps = {
  fromcolor: string
  tocolor: string
  bgcolor: string
}

const styles: Styles = {
  global: (props) => ({
    body: {
      bg: mode('white', 'backgroundBlack')(props),
    },
    p: {
      color: mode('black', '#fff')(props),
    },
  }),
}

export const themeFlatLight = extendTheme({
  initialColorMode: 'system',
  styles,
  colors: {
    black: '#232323',
    backgroundBlack: '#1f1f20',
    cardBlack: '#24272d',
    cardBlackOffset: '#181818',
    cardWhite: '#FAFAFA',
    purpleGradient: '#8D188B',
    blueGradient: '#39BBFA',
    textGrey: '#A1A1A6',
    textGreyDark: '#686868',
    offblack: '#181430',
    offwhite: '#FEFAF1',
    primary: {
      dark: '#fff',
      light: '#232323',
    },
    text: {
      dark: '#fafafa',
      light: '#232323',
    },
    heading: {
      dark: '#fff',
      light: '#232323',
    },
  },
  fonts: {
    body: 'Poppins,normal,sans-serif',
    heading: 'Montserrat',
    mono: 'Montserrat',
  },
  breakpoints,
  components: {
    Input: {
      variants: {
        primaryDark: {
          bg: '#E5E5E5',
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: '800',
        fontSize: '2xl',
      },
      sizes: {
        md: {
          fontSize: '4xl',
        },
        lg: {
          fontSize: '5xl',
        },
      },
      variants: {
        minimal: {
          fontWeight: '700',
          fontSize: '2rem',
        },
      },
    },
    Text: {
      baseStyle: {
        fontWeight: '400',
        fontSize: '1rem',
      },
      variants: {
        minimal: {
          fontWeight: '600',
          fontSize: '0.875rem',
        },
      },
    },
    Button: {
      baseStyle: {
        padding: '0 1.25rem',
        rounded: 'full',
        border: 'none',
        bg: 'transparent',
        transition: 'ease-in-out all .2s',
        fontSize: '1rem',
      },
      variants: {
        outlined: {
          paddingX: '1.4rem',
          color: 'black',
          border: '1px solid #E9E9E9',
          _hover: {
            background: '#f7f7f7',
            borderColor: '#CCC',
          },
        },
        outlinedDark: {
          paddingX: '1.4rem',
          color: 'white',
          border: '1px solid #E9E9E9',
          _hover: {
            background: '#363636',
            borderColor: '#CCC',
          },
        },
        primary: {
          bg: '#232323',
          color: '#fff',
          fontSize: '1.125rem',
          px: '1.5rem !important',
          fontWeight: '600',
          _hover: {
            boxShadow: 'rgba(0,0,0,0.18) 0 2px 4px 0',
            transform: 'scale(1.03)',
            _loading: {
              bg: '#565656',
            },
          },
          _loading: {
            bg: '#565656',
          },
          _focus: {
            bg: '#565656',
          },
          _disabled: {
            _hover: {
              bg: '#565656',
            },
          },
        },
        primaryDark: {
          bg: '#fcfcfc',
          color: '#232323',
          fontSize: '1.125rem',
          px: '1.5rem !important',
          fontWeight: '600',
          _hover: {
            boxShadow: 'rgba(0,0,0,0.18) 0 2px 4px 0',
            transform: 'scale(1.03)',
          },
        },
        primarySimple: {
          bg: '#232323',
          color: '#fff',_hover: {
            boxShadow: 'rgba(0,0,0,0.18) 0 2px 4px 0',
            transform: 'scale(1.03)',
            _loading: {
              bg: '#565656',
            },
          },
          _loading: {
            bg: '#565656',
          },
          _focus: {
            bg: '#565656',
          },
          _disabled: {
            _hover: {
              bg: '#565656',
            },
          },
        },
        primarySimpleDark: {
          bg: '#fff',
          color: '#232323',_hover: {
            boxShadow: 'rgba(0,0,0,0.18) 0 2px 4px 0',
            transform: 'scale(1.03)',
            _loading: {
              bg: '#e5e5e5',
            },
          },
          _loading: {
            bg: '#e5e5e5',
          },
          _focus: {
            bg: '#e5e5e5',
          },
          _disabled: {
            _hover: {
              bg: '#e5e5e5',
            },
          },
        },
        secondary: {
          bg: 'transparent',
          fontSize: '1.125rem',
          color: '#232323',
          _hover: {
            bg: '#f7f7f7',
          },
        },
        secondaryDark: {
          bg: 'transparent',
          color: '#fff',
          _hover: {
            bg: 'rgba(244,244,244,0.2)',
          },
          fontSize: '1.125rem',
        },
        secondaryOnGrey: {
          bg: '#515765',
          fontSize: '1.125rem',
          color: '#fff',
        },
        link: {
          border: 'none',
        },
        walletDropdown: {
          rounded: 'none',
          justifyContent: 'unset',
          my: '.25rem!important',
          w: 'full',
          _hover: {
            bg: '#f7f7f7',
          },
        },
        walletDropdownDark: {
          rounded: 'none',
          justifyContent: 'unset',
          my: '.25rem!important',
          w: 'full',
          color: '#fff',
          _hover: {
            bg: 'cardBlack',
          },
        },
        underline: {
          fontSize: '.75rem',
          textDecoration: 'underline',
          color: '#888',
          _hover: {
            color: '#232323',
          },
        },
        underlineDark: {
          fontSize: '.75rem',
          textDecoration: 'underline',
          color: '#b0b0b0',
          _hover: {
            color: '#f5f5f5',
          },
        },
      },
    },
    Link: {
      baseStyle: {
        transition: 'ease-in-out all .2s',
        display: 'inline-block',
        _hover: {
          textDecoration: 'underline',
        },
      },

      variants: {
        nav: {
          _hover: {
            textDecoration: 'none !important',
          },
        },
        mobileNav: {
          display: 'block',
          textAlign: 'center',
          py: '1rem',
          fontWeight: '500',
          _hover: {
            textDecoration: 'none !important',
            fontWeight: '700',
            bg: '#F4F4F4',
          },
        },
        mobileNavDark: {
          color: 'white',
          display: 'block',
          textAlign: 'center',
          py: '1rem',
          fontWeight: '500',
          _hover: {
            textDecoration: 'none !important',
            fontWeight: '700',
            bg: 'cardBlack',
          },
        },
      },
    },
  },
})
