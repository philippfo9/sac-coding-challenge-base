import {
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Image,
  Input,
  Link,
  Spinner,
  Stack,
  Text,
  Textarea,
  useColorMode,
  VStack,
} from '@chakra-ui/react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { z, ZodFormattedError } from 'zod'
import DatePickerControl from '../../../components/Forms/DatePickerControl'
import GroupButtons from '../../../components/Forms/GroupButton'
import NFTSelector from '../../../components/Forms/NFTSelector'
import { formLabelStyle } from '../../../components/Forms/StyledInputs'
import { useTokens } from '../../techRaffles/hooks/token'
import {
  useWalletNftMetadatas,
  WalletNftV2,
} from '../../../utils/useWalletNFTs'
import { trpc } from '../../../utils/trpc'
import toast from 'react-hot-toast'
import { useWallet } from '@solana/wallet-adapter-react'
import { CommunitySelect } from './CommunitySelect/CommunitySelect'
import { projectType } from '../../techRaffles/types'
import { FeeView } from './FeeView'
import { useUser } from '../../common/auth/authHooks'
import { DiscordLinkMultiButton } from '../../admin/components/discord-link-ui/DiscordLinkMultiButton'
import { TwitterLinkMultiButton } from '../../admin/components/twitter-link-ui/TwitterLinkMultiButton'
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js'
import { preselectedTokens, tokenToShowFromStart } from '../../../config/config'
import { WalletMultiButton } from '../../../components/wallet-ui'
import { useRouter } from 'next/router'
import { NftCollection, Token } from '@prisma/client'
import {
  ITokenCustomization,
  PurchaseTokenCustomizationBox,
} from '../../../components/Forms/PurchaseTokenCustomizationBox'
import { formatFloatForDisplay } from '../../../utils/utils'
import meApigetCollectionByShortName from '../../techRaffles/api/dto/meAPIgetCollection'
import { addDays, addHours, format } from 'date-fns'
import CalloutBox from '../../../components/CalloutBox'
import { tone } from '@chakra-ui/theme-tools'
import { FormLabelWithMode } from '../../../components/Forms/FormLabelWithMode'
import { FormInputWithMode } from '../../../components/Forms/FormInputWithMode'
import { TextareaWithMode } from '../../../components/Forms/TextareaWithMode'
import { useAsyncFn } from 'react-use'

const DATE_FORMAT = 'dd/MM/yyyy, HH:mm'

const date60MinutesInFuture = addHours(new Date(), 1)

const date33DaysInFuture = addDays(new Date(), 33)

const date24HoursInFuture = addHours(new Date(), 24)

const validationSchema = z.object({
  ends: z.date().min(date60MinutesInFuture).max(date33DaysInFuture),
  ticketPrice: z.number().min(0.01),
  ticketPriceToken: z.string().min(2),
  allowedPurchaseTokens: z
    .array(
      z.object({
        symbol: z.string().min(2),
        discount: z.number().optional().nullable(), // in %, 10 = 10%
        fixedPrice: z.number().optional().nullable(),
      })
    )
    .min(1),
  maxTickets: z.number().min(0).optional().or(z.literal('')),
  description: z.string().max(1000).optional(),
})

export const RaffleUserCreatorForm: React.FC = () => {
  const router = useRouter()
  const { colorMode } = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const { data: tokens, isLoading: tokensLoading } = useTokens()
  const { data: user, isLoading: userIsLoading } = useUser()
  const wallet = useWallet()
  const [selectedNFT, setSelectedNFT] = useState<WalletNftV2 | undefined>(
    undefined
  )
  const [errorBySelectingNFT, setErrorBySelectingNFT] = useState<string | undefined>(
    undefined
  )

  const verifyNFTMut = trpc.useMutation('raffle.verifyNFT', {
    onError: (error) => {
      toast.error('Verifying NFT failed: ' + error.message)
      setErrorBySelectingNFT(error.message)
      setSelectedNFT(undefined)
      setCollectionOfSelectedNFT(undefined)
    }
  })

  const [collectionOfSelectedNFT, setCollectionOfSelectedNFT] = useState<
    meApigetCollectionByShortName | undefined
  >(undefined)
  const [buttonLoadingText, setButtonLoadingText] =
    useState('Creating raffle...')
  const [isCreateRaffleLoading, setCreateRaffleLoading] = useState(false)

  const [selectedProjects, setSelectedProjects] = useState<projectType[]>([])

  const [communitiesValid, setCommunitiesValid] = useState(true)
  const [communitiesLoading, setCommunitiesLoading] = useState(false)

  const [changeSelectedNFTRes, changeSelectedNFT] = useAsyncFn(async (nftToSelect?: WalletNftV2) => {
    if (!nftToSelect) {
      setSelectedNFT(undefined)
      setCollectionOfSelectedNFT(undefined)
      return
    }

    setSelectedNFT(nftToSelect)

    console.log('trying to select NFT', nftToSelect.name)

    const magicEdenNFTInfo = await verifyNFTMut.mutateAsync({
      nftMint: nftToSelect.pubkey.toBase58(),
    })

    if (magicEdenNFTInfo?.valid) {
      setSelectedNFT(nftToSelect)
      setCollectionOfSelectedNFT(magicEdenNFTInfo.meCollection)
    } else {
      setErrorBySelectingNFT(
        'NFT has not been verified on MagicEden. Please select another.'
      )
      toast.error(
        'NFT has not been verified on MagicEden. Please select another.'
      )
      setSelectedNFT(undefined)
      setCollectionOfSelectedNFT(undefined)
    }
  }, [])

  const fees = useMemo(() => {
    const list = []

    if (selectedProjects.find((h) => h.publicId === 'sac')) {
      if (!user?.discordUsername || !user?.twitterUsername) {
        list.push({
          amount: 1,
          label: 'NFT Raffle (SAC reduced fee) (unverified user)',
          fee: 2.5,
        })
      } else {
        list.push({ amount: 1, label: 'NFT Raffle (SAC reduced fee)', fee: 2 })
      }
    } else {
      if (!user?.discordUsername || !user?.twitterUsername) {
        list.push({
          amount: 1,
          label: 'NFT Raffle (unverified user)',
          fee: 4.5,
        })
      } else {
        list.push({ amount: 1, label: 'NFT Raffle', fee: 4 })
      }
    }

    if (selectedProjects.length > 3) {
      const additionalCommunities = selectedProjects.length - 3
      list.push({
        amount: additionalCommunities,
        label: 'Extra Communities',
        fee: additionalCommunities,
      })
    }

    return list
  }, [selectedProjects, user])

  const finishCreateNFTRaffleRes = trpc.useMutation('raffle.finishCreateRaffle')
  const createNFTRaffle = trpc.useMutation('raffle.createNFTRaffle', {
    onSuccess: async (res) => {
      if (!wallet.signTransaction) return

      setCreateRaffleLoading(true)
      const transaction = Transaction.from(Buffer.from((res as any).trans))

      try {
        setButtonLoadingText('Approve transaction...')
        const signedTx = await wallet.signTransaction(transaction)

        const serialTransaction = signedTx.serialize({
          verifySignatures: false,
          requireAllSignatures: false,
        })

        setButtonLoadingText('Confirming creation...')

        await finishCreateNFTRaffleRes.mutateAsync({
          sessionData: res!.sessionData,
          transaction: serialTransaction.toJSON(),
        })

        toast(`Created new raffle`, {
          duration: 5000,
          icon: '🔥',
          style: {
            fontSize: '1.2rem',
            fontWeight: 600,
          },
        })

        setTimeout(() => {
          router.push(`/r/${res!.raffleId}`)
        }, 1000)
      } catch (e: any) {
        toast.error('Failed to finish creation')
        console.log(e)
      }
      setCreateRaffleLoading(false)
    },
    onError: (e) => {
      setCreateRaffleLoading(false)
      toast.error(`Failed to create: ${e.message}`)
      console.log(e.message)
      console.log(e)
    },
  })

  //Forms
  const [formData, setFormData] = useState<z.infer<typeof validationSchema>>({
    ends: date24HoursInFuture,
    ticketPrice: 0.1,
    ticketPriceToken: 'SOL',
    allowedPurchaseTokens: preselectedTokens.map((t) => ({ symbol: t })),
    maxTickets: 100,
    description: '',
  })

  const [formErrors, setFormErrors] = useState<ZodFormattedError<
    z.infer<typeof validationSchema>
  > | null>(null)

  const ticketPriceToken = useMemo(() => {
    for (const dToken of tokens ?? []) {
      if (formData.ticketPriceToken === dToken.symbol) {
        return dToken
      }
    }
    return undefined
  }, [formData.ticketPriceToken, tokens])

  useEffect(() => {
    if (!ticketPriceToken?.onDEX && !!tokens) {
      const updatedPurchaseTokens = [
        ...formData.allowedPurchaseTokens.filter((pT) => {
          return (
            !tokens.find((t) => t.symbol === pT.symbol)?.onDEX &&
            pT.symbol !== ticketPriceToken?.symbol
          )
        }),
        { symbol: ticketPriceToken?.symbol },
      ]
      console.log({ updatedPurchaseTokens })

      updateFormValue('allowedPurchaseTokens', updatedPurchaseTokens)
    } else if (
      ticketPriceToken &&
      !formData.allowedPurchaseTokens.some(
        (purchaseToken) => purchaseToken.symbol === ticketPriceToken?.symbol
      ) &&
      ticketPriceToken?.symbol !== 'USDC'
    ) {
      console.log(
        'updating allowed purchase tokens because of ticketprice not selected'
      )

      updateFormValue('allowedPurchaseTokens', [
        ...formData.allowedPurchaseTokens,
        { symbol: ticketPriceToken.symbol },
      ])
    }
  }, [ticketPriceToken])

  const ticketPriceInSol = useMemo(() => {
    if (formData.ticketPriceToken === 'SOL') {
      return formData.ticketPrice
    } else {
      const purchaseToken = tokens?.find(
        (token) => token.symbol === formData.ticketPriceToken
      )
      const solToken = tokens?.find((token) => token.symbol === 'SOL')
      if (!purchaseToken?.lastUsdcPrice || !solToken?.lastUsdcPrice) {
        return null
      }
      const ticketPriceInSol =
        (formData.ticketPrice * purchaseToken.lastUsdcPrice) /
        solToken.lastUsdcPrice
      return ticketPriceInSol
    }
  }, [
    formData.ticketPrice,
    formData.maxTickets,
    formData.ticketPriceToken,
    tokens,
  ])

  const updateFormValue = useCallback(
    (key, value) => {
      if (value === undefined || value === null || value === 'NaN') {
        setFormData((formData) => ({ ...formData, [key]: '' }))
      } else {
        setFormData((formData) => ({ ...formData, [key]: value }))
      }
    },
    [formData]
  )

  const handleCreate = useCallback(async () => {
    console.log({ formData })

    const valid = validationSchema.safeParse(formData)
    console.log('valid', valid)

    const allowedPurchaseTokens = formData.allowedPurchaseTokens
    if (allowedPurchaseTokens.length < 1 || !ticketPriceToken?.id || !tokens) {
      return
    }

    let maxTickets = undefined
    if (typeof formData.maxTickets === 'number') {
      maxTickets = formData.maxTickets
    }

    if (
      allowedPurchaseTokens.some((purchaseToken) => {
        const token = tokens.find((t) => t.symbol === purchaseToken.symbol)
        return !token?.onDEX
      }) &&
      allowedPurchaseTokens.some((purchaseToken) => {
        const token = tokens.find((t) => t.symbol === purchaseToken.symbol)
        return token?.onDEX
      })
    ) {
      toast.error('You cant accept non-DEX listed and DEX-listed tokens at the same time')
      return
    }

    if (!ticketPriceToken.onDEX) {
      if (
        !(allowedPurchaseTokens.every((purchaseToken) => {
          const token = tokens.find((t) => t.symbol === purchaseToken.symbol)
          return !token?.onDEX
        }))
      ) {
        toast.error(
          'You can only allow DEX listed tokens like SOL if your ticket price currency is DEX listed'
        )
        return
      }
    }

    for (const purchaseToken of allowedPurchaseTokens) {
      const token = tokens.find((t) => t.symbol === purchaseToken.symbol)
      if (
        !token?.onDEX &&
        !purchaseToken.fixedPrice &&
        ticketPriceToken.onDEX
      ) {
        toast.error(
          `You need to define a fixed price for non-listed token=${token?.symbol}`
        )
        return
      }
    }

    if (valid.success) {
      createNFTRaffle.mutate({
        nftMint: selectedNFT!.pubkey.toBase58(),
        ends: formData.ends,
        description: formData.description,
        allowedPurchaseTokens: allowedPurchaseTokens.map((purchaseToken) => {
          const token = tokens.find((t) => t.symbol === purchaseToken.symbol)
          if (!token) throw new Error('token not found')

          return {
            tokenId: token.id,
            fixedPrice:
              token.id === ticketPriceToken.id
                ? formData.ticketPrice
                : purchaseToken.fixedPrice,
            discount: purchaseToken.discount,
          }
        }),
        ticketPrice: formData.ticketPrice,
        ticketPriceTokenId: ticketPriceToken.id,
        maxTickets: maxTickets,
        benefitingProjects: selectedProjects.map((p) => p.id),
      })
      setFormErrors(null)
    } else {
      setFormErrors(valid.error.format())
    }
  }, [formData, selectedNFT, selectedProjects])

  const reasonRaffleIsNotFeatured = useMemo(() => {
    if (
      !(
        (collectionOfSelectedNFT?.floorPrice ||
          collectionOfSelectedNFT?.avgPrice24hr) ??
        0 > 1
      )
    ) {
      return 'Floor Price for NFT needs to be above 1 SOL'
    }

    if (!user?.discordUsername || !user?.twitterUsername) {
      return 'Please link your Discord and Twitter account to be featured'
    }

    if (
      !formData.allowedPurchaseTokens.some((t) => {
        const token =
          tokens && tokens.find((token) => t.symbol === token.symbol)
        return !!token?.onDEX
      })
    ) {
      return 'You need to accept at lease one token that is listed on an decentralized exchange like Raydium e.g. accept Solana'
    }
  }, [collectionOfSelectedNFT, tokens, formData.allowedPurchaseTokens, user, ticketPriceToken])

  useEffect(() => {
    const valid = validationSchema.safeParse(formData)
    if (!valid.success) {
      console.log(valid.error)
      setFormErrors(valid.error.format())
    } else {
      setFormErrors(null)
    }
  }, [formData])

  const labelColor = 'rgba(0, 0, 0, 0.8)'

  if (!wallet.publicKey) {
    return (
      <VStack align='center' justify='center' mt='8rem' gap='2rem'>
        <Text align='center' fontWeight={600} fontSize='1.4rem'>
          Please connect your wallet first.
        </Text>
        <WalletMultiButton></WalletMultiButton>
      </VStack>
    )
  }

  if (userIsLoading) {
    return (
      <VStack align='center' justify='center' mt='8rem' gap='2rem'>
        <Text align='center' fontWeight={600} fontSize='1.4rem'>
          Loading user...
        </Text>
        <Spinner></Spinner>
      </VStack>
    )
  }

  return (
    <Box mt='1rem'>
      {!user?.discordId ||
        (!user?.twitterId && (
          <Stack mb='2rem'>
            <Text style={formLabelStyle}>
              Connect your Twitter and Discord Account{' '}
              <Text as='span' fontSize='.875rem' fontStyle='italic'>
                (optional)
              </Text>
            </Text>
            <Text fontSize='1rem'>
              This allows Monet to hold safer raffles for their users, will give
              you additional reach, promotion in featured category and cut the
              fee by 0.5%. Your raffles will only be featured if you have linked
              both Discord and Twitter.
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} gap={3}>
              <DiscordLinkMultiButton />
              <TwitterLinkMultiButton />
            </Stack>
          </Stack>
        ))}

      <Stack spacing={['2rem']}>
        <FormControl isInvalid={!selectedNFT} isRequired>
          <FormLabelWithMode as='legend'>
            1. Select NFT from wallet
          </FormLabelWithMode>
          <Box marginY='.8rem'>
            <CalloutBox
              emoji='💡'
              infoText={
                <>
                  For best results, ideally pick an <b>NFT that's hyped</b> and{' '}
                  <b>where an active community is behind</b> that can be engaged
                </>
              }
            ></CalloutBox>
          </Box>
          <Text fontSize='0.9rem' mb={3}>
            NFT needs to be verified on MagicEden and will be transferred to a
            vault so it will be sent out after the raffle ends
          </Text>
          <NFTSelector
            maxNfts={1}
            selectedNFT={selectedNFT}
            nftVerificationLoading={changeSelectedNFTRes.loading}
            onChange={(values) => changeSelectedNFT(values[0])}
          />
          {!selectedNFT && (
            <FormHelperText>Select a NFT you want to raffle. {errorBySelectingNFT && `(Error previously: ${errorBySelectingNFT})`}</FormHelperText>
          )}
          {selectedNFT && (
            <Flex mt='.6rem' alignItems={'center'}>
              <Image
                display='inline'
                mr='4px'
                w='16px'
                h='16px'
                src='/twitter-images/verified/verified.png'
              ></Image>{' '}
              <Text>
                <i>NFT selected:</i> {selectedNFT?.name} |
                {collectionOfSelectedNFT && (
                  <>
                    {' '}
                    <i>Floor Price:</i>{' '}
                    {formatFloatForDisplay(
                      collectionOfSelectedNFT.floorPrice / LAMPORTS_PER_SOL
                    )}{' '}
                    SOL
                  </>
                )}
              </Text>
            </Flex>
          )}
        </FormControl>
        <Text fontWeight={600}>
          The raffle starts immediately after creation.
        </Text>
        <FormControl isInvalid={!!formErrors?.ends} isRequired>
          <FormLabelWithMode as='legend'>
            2. Select End Date & time (
            {Intl.DateTimeFormat().resolvedOptions().timeZone} / Local)
          </FormLabelWithMode>
          <DatePickerControl
            minDate={date60MinutesInFuture}
            maxDate={date33DaysInFuture}
            w={['100%', '20rem']}
            date={formData.ends}
            onChange={(date) => updateFormValue('ends', date)}
            dateFormat={DATE_FORMAT}
          />
          {!!formErrors?.ends && (
            <FormHelperText>
              Select a date which is at least 60 minutes but not more than 10
              days in the future.
            </FormHelperText>
          )}
        </FormControl>
        <FormControl isInvalid={!!formErrors?.ticketPriceToken} isRequired>
          <FormLabelWithMode as='legend'>
            3. Select the Ticket Price Currency
          </FormLabelWithMode>
          {tokensLoading && <Spinner />}
          <GroupButtons
            options={
              tokens
                ?.filter((t) => tokenToShowFromStart.includes(t.symbol))
                .map((t) => t.symbol) ?? []
            }
            additionalOptions={
              tokens
                ?.filter((t) => !tokenToShowFromStart.includes(t.symbol))
                .map((t) => t.symbol) ?? []
            }
            selectedOptions={formData.ticketPriceToken}
            onChange={(value) => updateFormValue('ticketPriceToken', value)}
            p={['.35rem .5rem', '.4rem 1rem']}
            fontSize={['0.875rem']}
          />
          {!!formErrors?.ticketPriceToken && (
            <FormHelperText>Select a currency token</FormHelperText>
          )}
        </FormControl>
        <FormControl isInvalid={!!formErrors?.ticketPrice} isRequired>
          <FormLabelWithMode as='legend'>
            4. Set the price per Ticket ({formData.ticketPriceToken})
          </FormLabelWithMode>
          <FormInputWithMode
            w={['100%', '20rem']}
            type='number'
            value={formData.ticketPrice}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateFormValue('ticketPrice', parseFloat(e.target.value))
            }}
          />
          {!!formErrors?.ticketPrice && (
            <FormHelperText>Min 0.01</FormHelperText>
          )}
          {ticketPriceInSol && formData.ticketPriceToken !== 'SOL' && (
            <Text fontSize='0.8rem' mt={3}>
              ~{formatFloatForDisplay(ticketPriceInSol)} SOL per ticket
            </Text>
          )}
        </FormControl>

        <FormControl>
          <FormLabelWithMode as='legend'>
            5. Set Max Tickets{' '}
            <Text as='span' fontStyle='italic' fontSize='.75rem'>
              (leave empty for unlimited)
            </Text>
          </FormLabelWithMode>
          <FormInputWithMode
            w={['100%', '20rem']}
            type='number'
            min='6'
            value={formData.maxTickets}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              updateFormValue(
                'maxTickets',
                e.target.value.length > 0 ? parseFloat(e.target.value) : ''
              )
            }}
            isInvalid={!!formErrors?.ticketPrice}
          />
        </FormControl>
        {!!formData.maxTickets && formData.maxTickets > 0 && (
          <>
            <Text>
              <u>Total ticket value:</u>{' '}
              <b>
                {formData.maxTickets * formData.ticketPrice}{' '}
                {formData.ticketPriceToken}
              </b>
              {ticketPriceInSol &&
                formData.ticketPriceToken !== 'SOL' &&
                `(~${formatFloatForDisplay(
                  ticketPriceInSol * formData.maxTickets
                )} SOL)`}
              {ticketPriceInSol && collectionOfSelectedNFT?.floorPrice && (
                <Text as='span' color='gray.800'>
                  {' '}
                  (
                  {(
                    ((ticketPriceInSol * formData.maxTickets) /
                      (collectionOfSelectedNFT.floorPrice / LAMPORTS_PER_SOL)) *
                    100
                  ).toFixed(1)}
                  % of NFT's floor price)
                </Text>
              )}
            </Text>
          </>
        )}

        <CalloutBox
          emoji='✌️'
          infoText={
            <>
              Set the{' '}
              <b>total ticket value to 108-119% of the NFT's floor price</b> for
              the best results. If your ask is too high, lots of people refuse
              to enter.
              <br></br>Charging in the 108-119% range gives{' '}
              <b>raffle buyers great odds</b> and your raffle is{' '}
              <b>more likely to sell out.</b>
            </>
          }
        ></CalloutBox>

        <FormControl isInvalid={!!formErrors?.allowedPurchaseTokens} isRequired>
          <FormLabelWithMode as='legend'>
            6. Select allowed Purchase Currencies
          </FormLabelWithMode>
          <Text fontSize='1rem' mb={3}>
            Select tokens that you want to accept. There will be a token account
            created for every token you want to accept.
            <br />
            You'll receive the tokens after your raffle ended, they WON'T be
            auto-swapped. (You can't accept USDC.)
          </Text>
          {tokensLoading && <Spinner colorScheme={'gray'} />}
          <GroupButtons
            options={
              tokens?.filter(
                (t) =>
                  t.symbol !== 'USDC' && tokenToShowFromStart.includes(t.symbol)
              ) ?? []
            }
            additionalOptions={
              tokens?.filter(
                (t) =>
                  t.symbol !== 'USDC' &&
                  !tokenToShowFromStart.includes(t.symbol)
              ) ?? []
            }
            allowCustomization={true}
            allowCustomizationCondition={(t: Token) => !t.onDEX}
            formatOption={(option) =>
              `${option.symbol}${
                option.fixedPrice ? `: ${option.fixedPrice}` : ''
              }`
            }
            getValueStrOfOption={(option) => option.symbol}
            CustomizationBox={PurchaseTokenCustomizationBox}
            customizations={formData.allowedPurchaseTokens}
            onCustomizationChange={(newValue: ITokenCustomization) => {
              console.log('onCustomizationChange', { newValue })

              updateFormValue('allowedPurchaseTokens', [
                ...formData.allowedPurchaseTokens.filter(
                  (pT) => pT.symbol !== newValue.symbol
                ),
                newValue,
              ])
            }}
            selectedOptions={formData.allowedPurchaseTokens}
            /*disabled={!ticketPriceToken?.onDEX}*/
            onChange={(value) => {
              console.log('onChangeGroupButton', value)
              updateFormValue('allowedPurchaseTokens', value)
            }}
            isMultiChoice={true}
            p={['.35rem .5rem', '.4rem 1rem']}
            fontSize={['0.875rem']}
          />
          {!!formErrors?.allowedPurchaseTokens && (
            <FormHelperText>Select at least one purchase token</FormHelperText>
          )}
        </FormControl>
      </Stack>
      <Box mt='4rem' w={['100%', '36rem', '48rem']}>
        <Text mb='1rem' fontWeight={600} fontSize='1.25rem'>
          7. Feature your raffle on community pages{' '}
          <Text as='span' fontSize='.875rem' fontStyle='italic'>
            (optional)
          </Text>
        </Text>
        {user?.discordUsername ? (
          <>
            <CalloutBox
              emoji='🫂'
              infoText={
                <>
                  Selecting communities can give you <b>additional reach 📢</b>
                  <br></br><br></br>
                  Your raffle will be 1. featured on the raffle sites
                  of selected communities and 2. posted into the Discord of the community if
                  they have it activated.<br></br>
                  <br />
                  The selected community <b>will benefit by receiving a revenue share</b> of
                  Monet's fees 👐*
                  <br></br>
                  <Text as='span' fontSize='0.8rem'>
                    *1% of the total raffle earnings per community (.5% if
                    reduced fee is applied)
                  </Text>
                </>
              }
            ></CalloutBox>

            <Text mb='1rem' fontSize='.9rem'>
              Holder verification is done via Discord. Make sure to join the
              Discord of the community and verify yourself as a holder. We can
              only check 5 new communities every 10 mins per user because of
              Discord rate limits.
            </Text>
            <CommunitySelect
              onChange={(it) => setSelectedProjects(it)}
              onLoadingChange={(isLoading) => setCommunitiesLoading(isLoading)}
              onValidChange={(isValid) => {
                setCommunitiesValid(isValid)
              }}
            />
          </>
        ) : (
          <>
            <Text mb='1rem' fontSize='.9rem'>
              Link your Discord Account with{' '}
              <Text fontFamily='PlayfairBlack' fontWeight={900} as='span'>
                Monet
              </Text>{' '}
              and start helping your communities.
            </Text>
            <DiscordLinkMultiButton />
          </>
        )}

        {/*<Text mt='4rem' fontSize='20px' fontWeight={600}>Add Marketing Boosts</Text>
        <Text mt='1rem'>Include add ons to boost the visibility of your raffle and increase engagement.</Text>
        <Text>Each add on increases the fee by 1%.</Text>
        <Text>Be sure to sell out 🔥.</Text>*/}

        <FormControl
          mt='2.4rem'
          isInvalid={!!formErrors?.allowedPurchaseTokens}
          isRequired
        >
          <FormLabelWithMode as='legend'>
            8. Description (optional)
          </FormLabelWithMode>
          <Text fontSize='1rem' mb={3}>
            Add a description to your raffle in order to explain why certain
            NFTs should be worth more than the floor price e.g. special traits
            in the collection. Will be shown on the detail page of your raffle
          </Text>
          <TextareaWithMode
            value={formData.description}
            onChange={(e) => updateFormValue('description', e.target.value)}
            placeholder='Raffling off this grail Stoned Ape with the Banana Jacket ranked 200'
          ></TextareaWithMode>

          {!!formErrors?.description && (
            <FormHelperText>
              Description should have a maximum of 1000 characters
            </FormHelperText>
          )}
        </FormControl>

        <Text fontWeight={600} fontSize='20px' mt='3rem'>
          Fee
        </Text>
        <Text mb='1rem' fontSize='16px'>
          Receive a 50% discount on fees by holding a StonedApeCrew NFT and
          selecting it under 'Communities'.
        </Text>
        <FeeView fees={fees} />
        <Box mt='2.4rem'>
          <Text mb='.5rem' fontSize='1.2rem' fontWeight={800}>
            Summary
          </Text>
          <Text>
            <b>NFT:</b>{' '}
            {selectedNFT
              ? selectedNFT.name
              : 'No NFT selected yet or not verified on MagicEden. Please select one.'}
          </Text>
          <Text>
            <b>Ends:</b> {format(formData.ends, DATE_FORMAT)}
          </Text>
          <Text fontSize='1rem'>
            <b>Accepted tokens:</b>{' '}
            {formData.allowedPurchaseTokens
              .map(
                (pT) =>
                  `${pT.symbol}${
                    pT.fixedPrice ? ` - Fixed Price: ${pT.fixedPrice}` : ''
                  }`
              )
              .join(' | ')}
          </Text>
          <Text fontSize='1rem'>
            <b>Ticket price:</b> {formData.ticketPrice}{' '}
            {formData.ticketPriceToken}
          </Text>
          <Text fontSize='1rem'>
            <b>Max tickets:</b>{' '}
            {formData.maxTickets ? formData.maxTickets : 'Unlimited'}
          </Text>
          {!!formData.maxTickets && (
            <Text fontSize='1rem'>
              <b>Total ticket value:</b>{' '}
              {formData.maxTickets * formData.ticketPrice}{' '}
              {formData.ticketPriceToken}
              {ticketPriceInSol &&
                formData.ticketPriceToken !== 'SOL' &&
                `(~${(ticketPriceInSol * formData.maxTickets).toFixed(3)} SOL)`}
              {ticketPriceInSol && collectionOfSelectedNFT?.floorPrice && (
                <Text as='span' color='gray.800'>
                  {' '}
                  (
                  {(
                    ((ticketPriceInSol * formData.maxTickets) /
                      (collectionOfSelectedNFT.floorPrice / LAMPORTS_PER_SOL)) *
                    100
                  ).toFixed(1)}
                  % of NFT's floor price)
                </Text>
              )}
            </Text>
          )}
          {collectionOfSelectedNFT && (
            <Text>
              <b>NFT Floor Price:</b>{' '}
              {formatFloatForDisplay(
                collectionOfSelectedNFT.floorPrice / LAMPORTS_PER_SOL
              )}{' '}
              SOL | <b>AVG Price (24hr):</b>{' '}
              {formatFloatForDisplay(
                collectionOfSelectedNFT.avgPrice24hr / LAMPORTS_PER_SOL
              )}{' '}
              SOL
            </Text>
          )}
          <Text>
            <b>Raffle shown in featured category:</b>{' '}
            {reasonRaffleIsNotFeatured
              ? `Not showing up. ${reasonRaffleIsNotFeatured}`
              : `Showing up`}
          </Text>
        </Box>
      </Box>
      <Button
        mt='3rem'
        mb='3rem'
        minW='15rem'
        py='1.5rem'
        variant={isDarkMode ? 'primaryDark' : 'primary'}
        zIndex={0}
        onClick={handleCreate}
        loadingText={buttonLoadingText}
        disabled={
          !!formErrors ||
          !selectedNFT ||
          communitiesLoading ||
          !communitiesValid
        }
        isLoading={createNFTRaffle.isLoading || isCreateRaffleLoading}
      >
        Create raffle
      </Button>
      <Text fontSize='0.8rem'>
        By creating a raffle, you agree to our{' '}
        <Link
          target='_blank'
          href='https://www.notion.so/sac-nft/Monet-Terms-of-Use-87e446d1c8fb4d78a4285c30308db113'
        >
          Terms of Use
        </Link>
      </Text>
    </Box>
  )
}
