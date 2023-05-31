import { Stack, Text, Link } from '@chakra-ui/react'
import React, { FC } from 'react'

interface Props {
  admin?: boolean
}

const Footer: FC<Props> = ({ admin }) => {
  return (
    <Stack
      mt='7.5rem'
      color='#fff !important'
      px='4rem'
      py='3.5rem'
      rounded={['15px', '15px', 'full']}
      bg='#232323'
      justify='space-between'
      direction={['column', 'column', 'row']}
      gap={2}
      textAlign={['center', 'center', 'left']}
    >
      <Text
        fontFamily='PlayfairBlack'
        color='#fff'
        fontWeight='900'
        fontSize='2rem'
        lineHeight='2.5rem'
      >
        Monet
      </Text>

      <Text fontSize='.75rem' lineHeight='2.5rem'>
        <Link target='_blank' href='https://www.notion.so/sac-nft/Monet-Terms-of-Use-87e446d1c8fb4d78a4285c30308db113'>
          Terms of Use
        </Link>
      </Text>
      {admin ? (
        <Text fontSize='.75rem' lineHeight='2.5rem'>
          <Link
            href='https://discord.gg/q4eSStTfMW'
            target='_blank'
            textDecor='underline'
          >
            Join our Discord Server
          </Link>
        </Text>
      ) : (
        <Text fontSize='.75rem' lineHeight='2.5rem'>
          Created by{' '}
          <Link
            href='https://www.stonedapecrew.com'
            target='_blank'
            textDecor='underline'
          >
            Stoned Ape Crew
          </Link>
        </Text>
      )}
      <Text fontSize='.75rem' lineHeight='2.5rem'>
        &copy; 2022 Stoned Ape Crew
      </Text>
    </Stack>
  )
}

export default Footer
