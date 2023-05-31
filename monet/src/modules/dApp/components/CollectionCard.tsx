import {
  Box,
  Flex,
  HStack,
  Image,
  Link,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { BsFillPatchCheckFill } from 'react-icons/bs'
import React, { FC } from 'react'
import { collectionMinType } from '../../techRaffles/types'
import NextLink from 'next/link'

interface CardProps {
  collection: collectionMinType
}

const CollectionCard: FC<CardProps> = (props: CardProps) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const { collection } = props
  return (
    <NextLink href={`/collections/${collection.name}`} passHref>
      <Link>
        <Flex
          mt='4rem'
          flexDirection='column'
          minWidth='320px'
          maxW={['100%', '320px']}
          minHeight='264px'
          borderRadius='20px'
          border={'1px solid'}
          borderColor={isDarkMode ? '#393e43' : 'white'}
          boxShadow={isDarkMode ? 'lg' : 'none'}
          mr='2rem'
          pb='2rem'
          textAlign='center'
          alignItems='center'
          bg={isDarkMode ? 'cardBlack' : 'white'}
        >
          <Box overflow={'hidden'} borderTopRadius='20px'>
            <Image
              draggable={false}
              objectFit='cover'
              w='100%'
              src={collection.image}
              transition={'transform .5s ease-in-out'}
              _hover={{
                transform: 'scale(1.05)',
              }}
              fallback={
                <Flex
                  w='100%'
                  h='10rem'
                  bg={isDarkMode ? '#434343' : '#EEE'}
                  objectFit='cover'
                ></Flex>
              }
            />
          </Box>
          <HStack mt='2rem'>
            <Text fontSize='0.913rem' fontWeight='500'>
              {collection.title}
            </Text>
            {collection.verified && (
              <BsFillPatchCheckFill color={isDarkMode ? 'white' : 'black'} />
            )}
          </HStack>
        </Flex>
      </Link>
    </NextLink>
  )
}

export default CollectionCard
