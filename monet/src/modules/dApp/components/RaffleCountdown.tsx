import {
  Box,
  Button,
  ButtonGroup,
  HStack,
  Skeleton,
  useColorMode,
  useInterval,
} from '@chakra-ui/react'
import React, {useCallback, useMemo, useState} from 'react'
import { CountDown, getCountDown } from '../../../utils/dateUtil'

export default (props: { variant: 'card' | 'big'; ends?: Date, showStatusChange?: (status: 'COUNTDOWN' | 'DATE') => void, raffleEnded?: () => any }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const today = new Date()
  const ends = props.ends
  const variantCard = props.variant === 'card'

  const [countDown, setCountDown] = useState<CountDown>()
  const [initialCountDownSetDone, setInitialSet] = useState<boolean>(false)

  const [show, setShow] = useState<'COUNTDOWN' | 'DATE'>('COUNTDOWN')

  const setShowStatus = (status: 'COUNTDOWN' | 'DATE') => {
    setShow(status);
    if (props.showStatusChange) {
      props.showStatusChange(status);
    }
  };

  useInterval(() => {
    if (!ends) return
    const counts = getCountDown(ends, today)
    if (countDown && !initialCountDownSetDone) {
      setInitialSet(true)
    }
    setCountDown(counts)

    if (counts.wholeSeconds < 0) {
      if (props.raffleEnded) props.raffleEnded()
    }
  }, 1000)

  const endsDateString = useMemo(() => {
    return !!ends ? `${ends.getDate() < 10 ? '0' : ''}${ends.getDate()}.${ends.getMonth() < 10 ? '0' : ''}${ends.getMonth() + 1}.${ends.getFullYear()}` : '';
  }, [ends]);

  const endsTimeString = useMemo(() => {
    return !!ends ? `${ends.getHours() < 10 ? '0' : ''}${ends.getHours()}:${ends.getMinutes() < 10 ? `0` : ''}${ends.getMinutes()}` : '';
  }, [ends]);
  
  const bgColorsDark = variantCard ? 'rgba(0, 0, 0, .5)' : ''
  const bgColorsLight = variantCard ? 'rgba(255, 255, 255, .6)' : 'rgba(255, 255, 255, 1)'

  return ends && (countDown || initialCountDownSetDone) ? show === 'COUNTDOWN' ? (
    <HStack
      w='fit-content'
      bg={colorMode === 'light' ? bgColorsLight : bgColorsDark}
      spacing='0'
      rounded='full'
      border={colorMode === 'light' ? '1px solid #ccc' : '1px solid #aaa'}
      userSelect='none'
      _hover={{cursor: 'pointer'}}
      onClick={() => setShowStatus('DATE')}
    >
      <Box
        fontSize={variantCard ? '.75rem' : '1.25rem'}
        pl='1rem'
        pr='.5rem'
        py='.5rem'
        roundedLeft='full'
        fontWeight='600'
        color={isDarkMode ? 'white' : 'black'}
      >
        {countDown?.hours}H
      </Box>
      <Box
        fontSize={variantCard ? '.75rem' : '1.25rem'}
        px='.5rem'
        py='.5rem'
        borderX={isDarkMode ? '1px solid #aaa' : '1px solid #ccc'}
        fontWeight='600'
        color={isDarkMode ? 'white' : 'black'}
      >
        {countDown?.minutes}M
      </Box>
      <Box
        fontSize={variantCard ? '.75rem' : '1.25rem'}
        pr='1rem'
        pl='.5rem'
        py='.5rem'
        roundedLeft='full'
        fontWeight='600'
        color={isDarkMode ? 'white' : 'black'}
      >
        {countDown?.seconds}S
      </Box>
    </HStack>
  ) : (
    <HStack
      w='fit-content'
      bg={colorMode === 'light' ? bgColorsLight : bgColorsDark}
      spacing='0'
      rounded='full'
      border={colorMode === 'light' ? '1px solid #ccc' : '1px solid #aaa'}
      userSelect='none'
      _hover={{cursor: 'pointer'}}
      onClick={() => setShowStatus('COUNTDOWN')}
    >
      <Box
        fontSize={variantCard ? '.75rem' : '1.25rem'}
        pl='1rem'
        pr='.5rem'
        py='.5rem'
        borderX={colorMode === 'light' ? '1px solid #ccc' : '1px solid #aaa'}
        roundedLeft='full'
        fontWeight='600'
      >
        {endsTimeString}
      </Box>
      <Box
        fontSize={variantCard ? '.75rem' : '1.25rem'}
        pr='1rem'
        pl='.5rem'
        py='.5rem'
        roundedRight='full'
        fontWeight='600'
      >
        {endsDateString}
      </Box>
    </HStack>
  ) : variantCard ? (
    <Skeleton
      top='.1rem'
      right='.1rem'
      position='absolute'
      rounded='full'
      w='140px'
      h='32px'
    />
  ) : (
    <Skeleton h='40px' rounded='full' w='200px' />
  )
}
