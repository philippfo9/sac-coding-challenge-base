import React, { useState } from 'react'
import Image, { ImageProps } from 'next/future/image'
import { Box, chakra, Skeleton } from '@chakra-ui/react'

import Img from 'next/image'

export const ChakraNextImage = chakra(Image, {
  shouldForwardProp: (prop) =>
    ['height', 'width', 'quality', 'src', 'alt', 'fill'].includes(prop),
})

type ChakraNextImageProps = React.ComponentProps<typeof ChakraNextImage>

export const NextImage = ({
  css,
  ...props
}: { css?: any } & Omit<ChakraNextImageProps, 'onLoadingComplete'>) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHover, setHover] = useState(false)

  return (
    <Box position={'relative'}>
      {!isLoaded && (
        <Skeleton w='100%' minHeight={'300px'}>
          <Box
            w='100%'
            minHeight={'300px'}
            style={{ aspectRatio: '1 / 1' }}
          ></Box>
        </Skeleton>
      )}
      <ChakraNextImage
        quality={70}
        loading='lazy'
        src={props.src}
        alt={props.alt}
        {...props}
        onLoadingComplete={() => setIsLoaded(true)}
      ></ChakraNextImage>
    </Box>
  )
}
