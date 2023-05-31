import { Text, Box, VStack, Link, useColorMode } from '@chakra-ui/react'
import React, { FC } from 'react'
import NextLink from 'next/link'

export const Logo: FC<{
  href?: string
  fontSize?: string
  isDark?: boolean
}> = ({ fontSize, isDark, href }) => {
  const { colorMode } = useColorMode()

  return (
    <VStack
      display='flex'
      alignItems={'flex-start'}
      justifyContent='center'
      spacing='-0.5'
    >
      <NextLink passHref href={href ?? `/`}>
        <Link _hover={{}}>
          <Text
            fontWeight='900'
            fontSize={fontSize || '2.5rem'}
            fontStyle='normal'
            fontFamily='PlayfairBlack'
            color={isDark || colorMode === 'dark' ? '#fff' : '#232323'}
          >
            Monet
          </Text>
        </Link>
      </NextLink>

      <Text
        color={isDark || colorMode === 'dark' ? '#fff' : '#232323'}
        fontSize={['0.6rem', '0.8rem']}
      >
        by{' '}
        <Link target='blank' href={`http://stonedapecrew.com/`}>
          StonedApeCrew
        </Link>
      </Text>
    </VStack>
  )
}
