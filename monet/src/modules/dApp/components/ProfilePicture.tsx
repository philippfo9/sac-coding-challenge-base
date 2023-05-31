import 'react-alice-carousel/lib/alice-carousel.css'
import { Box, Image } from '@chakra-ui/react'
import React, { ComponentProps, FC } from 'react'

interface Props {
  imageurl?: string | null
  gradientstart: string
  gradientend: string
}

export const ProfilePicture: FC<ComponentProps<typeof Image> & Props> = (
  props: Props
) => {
  const { imageurl, gradientstart, gradientend } = props

  return (
    <>
      {imageurl && (
        <Image
          src={imageurl ?? 'Unknown'}
          transition='all .2s ease-in-out'
          fallback={
            <Box
              m='0 auto'
              bg={`linear-gradient(180deg, ${gradientstart} 0%, ${gradientend} 100%)`}
              transition='all .2s ease-in-out'
              {...props}
            ></Box>
          }
          {...props}
        />
      )}

      {!imageurl && (
        <Box
          m='0 auto'
          bg={`linear-gradient(180deg, ${gradientstart} 0%, ${gradientend} 100%)`}
          transition='all .2s ease-in-out'
          {...props}
        ></Box>
      )}
    </>
  )
}
