import { Input, Box, Stack, Text } from '@chakra-ui/react'
import { FC } from 'react'
import { Accept, DropzoneOptions, useDropzone } from 'react-dropzone'

interface FileUploadProps {
  placeholder?: string
  accept?: Accept
  w?: string
  h?: string
  onDrop: (acceptedFiles: File[]) => void
}

const FileUploadControl: FC<FileUploadProps> = ({
  placeholder,
  accept,
  h = '7.6rem',
  w = '30rem',
  onDrop,
}) => {
  const { getRootProps, getInputProps, open } = useDropzone({
    accept,
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    onDrop,
  })

  return (
    <Box
      borderColor='gray.300'
      borderWidth='1px'
      rounded='md'
      shadow='sm'
      h={h}
      maxW={w}
      minW='15rem'
      cursor='pointer'
      _hover={{
        shadow: 'md',
      }}
      {...getRootProps()}
      onClick={() => open()}
    >
      <Box position='relative' height='100%' width='100%'>
        <Box
          position='absolute'
          top='0'
          left='0'
          height='100%'
          width='100%'
          display='flex'
          flexDirection='column'
        >
          <Stack
            height='100%'
            width='100%'
            display='flex'
            alignItems='center'
            justify='center'
            spacing='4'
          >
            <Text>{placeholder}</Text>
          </Stack>
        </Box>
        {/* <Input
          type='file'
          height='100%'
          width='100%'
          position='absolute'
          top='0'
          left='0'
          opacity='0'
          aria-hidden='true'
          accept={acceptedFileTypes}
          onChange={(e: any) => console.log("sssss",e)}
        /> */}
        <input {...getInputProps()} />
      </Box>
    </Box>
  )
}

export default FileUploadControl
