import {
  AspectRatio,
  Box,
  Button,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Text,
  useColorMode,
} from '@chakra-ui/react'
import { debounce } from 'lodash'
import NextImage from 'next/future/image'
import { useWallet } from '@solana/wallet-adapter-react'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { WalletMultiButton } from '../wallet-ui'
import { defaultButtonStyle } from '../wallet-ui/common'
import { NftMetadata } from '../../utils/nftmetaData.type'
import {
  useNftFromMetadata,
  useWalletNftMetadatas,
  WalletNftMetadataV2,
  WalletNftV2,
} from '../../utils/useWalletNFTs'
import { SearchIcon } from '@chakra-ui/icons'

const DisplayNFTToSelect: FC<{
  metadata: WalletNftMetadataV2
  checked: NftMetadata[]
  onAddInput: (value: NftMetadata) => void
  onDeleteInput: (value: NftMetadata) => void
}> = ({ metadata, checked, onDeleteInput, onAddInput }) => {
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const nftRes = useNftFromMetadata(metadata)
  if (!nftRes.nft) return <></>
  const nftMetadata = nftRes.nft!
  return (
    <Box
      paddingY='4px'
      cursor='pointer'
      borderRadius='5px'
      w={'9rem'}
      h={'9rem'}
      bg={'transparent'}
      key={metadata.pubkey.toBase58()}
      onClick={() =>
        checked.some((c) => c.pubkey.equals(metadata.pubkey))
          ? onDeleteInput(nftMetadata)
          : onAddInput(nftMetadata)
      }
      border={
        checked.includes(nftRes.nft)
          ? isDarkMode
            ? '3px solid #ccc'
            : '3px solid #fff'
          : 'none'
      }
      boxShadow={
        checked.some((c) => c.pubkey.equals(metadata.pubkey))
          ? 'rgba(0, 0, 0, 0.4) 0px 2px 4px'
          : ''
      }
    >
      <Text fontSize='0.7rem'>
        {nftRes.nft.name ?? metadata.data.data.name}
      </Text>

      <AspectRatio maxWidth={'144px'} ratio={1}>
        <NextImage
          src={nftRes.nft.image}
          alt={(nftRes.nft.name ?? metadata.data.data.name) + ' NFT'}
          quality={60}
          fill={true}
          style={{
            maxHeight: '144px',
            borderRadius: '6px',
            boxShadow: 'sm',
            filter: 'brightness(90%)',
            objectFit: 'cover',
          }}
        ></NextImage>
      </AspectRatio>
    </Box>
  )
}

interface NFTSelectorProps {
  isLoading?: boolean
  nftVerificationLoading?: boolean
  values?: WalletNftMetadataV2[]
  maxNfts?: number
  selectedNFT?: NftMetadata
  onChange: (values: NftMetadata[]) => void
}

const NFTSelector: FC<NFTSelectorProps> = ({
  maxNfts,
  onChange,
  selectedNFT,
  nftVerificationLoading
}) => {
  const [searchKey, setSearchKey] = useState<string | undefined>()
  const { metadatas, loading: metadatasLoading } = useWalletNftMetadatas()

  useEffect(() => {
    console.log('found metadatas', metadatas.length, metadatas)
  }, [metadatas])

  console.log({ selectedNFT })

  const metadatasForSelection = useMemo(() => {
    return metadatas.filter((m) => {
      return !searchKey
        ? true
        : m.data.data.name?.includes(searchKey) ||
            m.data.data.symbol?.includes(searchKey)
    })
  }, [metadatas, searchKey])

  // const [checked, setChecked] = useState<NftMetadata[]>([])
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const { connected } = useWallet()

  const onAddInput = useCallback(
    (value: WalletNftV2) => {
      onChange([value])
    },
    [onChange]
  )

  const onDeleteInput = useCallback(
    (value: NftMetadata) => {
      onChange([])
    },
    [onChange]
  )

  /*
  
  old one with multiple inputs
  
  const onAddInput = useCallback(
    (value: WalletNftV2) => {
      if (maxNfts && maxNfts != 1 && checked.length >= maxNfts) return

      if (maxNfts === 1) {
        checked.splice(0, checked.length)
      }

      checked.push(value)
      setChecked([...checked])
      onChange(checked)
    },
    [checked]
  )

  const onDeleteInput = useCallback(
    (value: NftMetadata) => {
      for (let i = 0; i < checked.length; i++) {
        if (checked[i].pubkey.toBase58() === value.pubkey.toBase58()) {
          checked.splice(i, 1)
          setChecked([...checked])
          onChange(checked)
          break
        }
      }
    },
    [checked, onChange]
  )*/

  const debouncedChangeHandler = useCallback(
    debounce((event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchKey(event.target.value)
    }, 300),
    []
  )

  if (!connected) {
    return <WalletMultiButton></WalletMultiButton>
  }

  return (
    <Box
      maxW={['100%', '100%', '90%']}
      maxH={['30rem', '34rem']}
      bg='rgba(238, 238, 238, 0.1)'
      border={isDarkMode ? '1px solid #5a5a5a' : '1px solid #CBCBCB'}
      borderRadius='5px'
      overflowY='scroll'
      padding='20px'
      paddingBottom='50px'
    >
      <Box>
        <InputGroup py='0.7rem'>
          <Input
            onChange={debouncedChangeHandler}
            border='1px solid #5a5a5a'
            placeholder='Search NFTs by name or symbol...'
            _placeholder={{
              color: isDarkMode
                ? 'rgba(255, 255, 255, 0.8)'
                : 'rgba(0, 0, 0, 0.4)',
            }}
            isInvalid={false}
            maxWidth='30rem'
            bg={'transparent'}
            color={isDarkMode ? '#fff' : '#232323'}
          />
          <InputLeftElement
            top='inherit'
            pointerEvents='none'
            children={<SearchIcon color='gray.300' />}
          />
        </InputGroup>
      </Box>
      {nftVerificationLoading && (
        <Box>
          <Text paddingY='1rem'>
            Verifying selected NFT ... <Spinner></Spinner>
          </Text>
        </Box>
      )}
      <SimpleGrid gap={'2rem'} columns={{ base: 1, sm: 2, md: 4, lg: 6 }}>
        {metadatasLoading && (
          <Box>
            <Text>Loading NFTs from wallet...</Text>
            <Spinner
              color={isDarkMode ? 'white' : 'black'}
              mt={3}
              size={'md'}
            ></Spinner>{' '}
          </Box>
        )}
        {!!selectedNFT && (
          <Box
            cursor='pointer'
            borderRadius='5px'
            w={'9rem'}
            bg={isDarkMode ? '#5a5a5a' : '#fff'}
            key={selectedNFT.data.mint}
            onClick={() => onDeleteInput(selectedNFT)}
            border={isDarkMode ? '3px solid #5a5a5a' : '3px solid #fff'}
            boxShadow={'rgba(0, 0, 0, 0.4) 0px 2px 4px'}
            overflow='hidden'
          >
            <Text fontSize={'0.7rem'}>{selectedNFT.name}</Text>
            <AspectRatio maxWidth={'150px'} ratio={1} overflow='hidden'>
              <NextImage
                alt={selectedNFT.name + ' NFT'}
                src={selectedNFT.image}
                fill={true}
                style={{
                  maxHeight: '144px',
                  borderRadius: '6px',
                  boxShadow: 'sm',
                  filter: 'brightness(90%)',
                  objectFit: 'cover',
                }}
              ></NextImage>
            </AspectRatio>
          </Box>
        )}
        {!selectedNFT &&
          metadatasForSelection.map((input: WalletNftMetadataV2) => {
            return (
              <DisplayNFTToSelect
                key={input.data.mint}
                metadata={input}
                checked={[]}
                onAddInput={onAddInput}
                onDeleteInput={onDeleteInput}
              ></DisplayNFTToSelect>
            )
          })}
      </SimpleGrid>
    </Box>
  )
}

export default NFTSelector
