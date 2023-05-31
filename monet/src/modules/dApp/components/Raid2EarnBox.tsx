import { DeleteIcon } from '@chakra-ui/icons'
import {
  useColorMode,
  Box,
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js'
import { Select } from 'chakra-react-select'
import React, { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { useAsyncFn } from 'react-use'
import { z } from 'zod'
import { FormInputWithMode } from '../../../components/Forms/FormInputWithMode'
import { FormLabelWithMode } from '../../../components/Forms/FormLabelWithMode'
import { connection } from '../../../config/config'
import { handleTransaction } from '../../../utils/solUtils'
import { trpc } from '../../../utils/trpc'
import {
  UseOnChainRaffleType,
  UseOnChainUserRaffleType,
} from '../../techRaffles/hooks/hookTypes'
import { raffleType } from '../../techRaffles/types'
import { ChakraNormalSelectStyle } from '../consts/styles'

const raid2EarnValidationSchema = z.object({
  tweetId: z.string().min(3),
  requirements: z.array(
    z.object({
      key: z.string(),
      value: z.union([z.string(), z.number()]).optional(),
    })
  ),
})

const raid2EarnRequirementOptions = [
  {
    key: 'FOLLOW',
    label: 'Follow',
    description:
      'User is required to follow the account of the registered tweet.',
    requiresInput: false,
  },
  {
    key: 'LIKE',
    label: 'Like',
    description: 'User is required to like the tweet.',
    requiresInput: false,
  },
  {
    key: 'RETWEET',
    label: 'Retweet',
    description: 'User is required to retweet the tweet.',
    requiresInput: false,
  },
  {
    key: 'QUOTE_RETWEET',
    label: 'Quote Retweet',
    description: 'User is required to quote retweet the tweet.',
    requiresInput: false,
  },
  {
    key: 'COMMENT',
    label: 'Comment',
    description: 'User is required to comment on the tweet',
    requiresInput: true,
    inputPlaceholder:
      'Input words the comment should include separated by commas, leave blank for any.',
    input: 'text',
  },
  {
    key: 'FOLLOWER_COUNT',
    label: 'Minimum follower count',
    description: 'The minimum number of followers the user should have',
    requiresInput: true,
    inputPlaceholder: 'Must be a number greater than 0 if specified.',
    input: 'number',
  } /*, {
  key: 'CHAR_COUNT',
  label: 'Minimum character count of comment',
  description: 'The minimum number of characters the comment should have.',
  requiresInput: true,
  inputPlaceholder: 'Should only be specified if "COMMENT" is added as a requirement. Must be a number greater than 0 if specified.',
  requires: ['COMMENT']
}*/,
]

type Raid2EarnBoxPropos = {
  raffle: raffleType
}

export const Raid2EarnBox: React.FC<Raid2EarnBoxPropos> = ({ raffle }) => {
  const {colorMode} = useColorMode()
  const isDarkMode = colorMode === 'dark'
  const wallet = useWallet()
  const [raidButtonLoadingText, setRaidButtonLoadingText] =
    useState('Submitting...')

  const [raidFormData, setRaidFormData] = useState<
    z.infer<typeof raid2EarnValidationSchema>
  >({
    tweetId: '',
    requirements: [
      {
        key: 'RETWEET',
        value: '',
      },
      {
        key: 'LIKE',
        value: '',
      },
      {
        key: 'COMMENT',
        value: '',
      },
    ],
  })
  const updateRaid2EarnFormValue = useCallback((key, value) => {
    console.log('new val', value)

    setRaidFormData((formData) => ({ ...formData, [key]: value }))
  }, [])

  const submitRaid2EarnMut = trpc.useMutation('raffle.submitRaid2Earn')

  const validateTweetIdMut = trpc.useMutation('raffle.validateTweetId')

  const [submitRaidTxRes, submitRaidTx] = useAsyncFn(async () => {
    if (
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !wallet.signAllTransactions
    ) {
      toast.error('Please connect a wallet')
      return
    }

    const blockhash = await connection.getLatestBlockhash()
    const transaction = new Transaction({
      feePayer: wallet.publicKey,
      ...blockhash,
    }).add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: new PublicKey('2QLy1z8sz3ZsqpLXRPamGhbgey1dE5z5ztHkEAvpjY5e'),
        lamports: 1.1 * LAMPORTS_PER_SOL,
      })
    )

    setRaidButtonLoadingText('Approve in wallet...')
    const signed = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize())

    setRaidButtonLoadingText('Confirming on-chain...')
    await handleTransaction(signature, {
      blockhash: {
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
      },
      commitment: 'confirmed',
      showLogs: true,
    })

    return signature
  }, [raidFormData])

  const [submitRaidRes, submitRaid] = useAsyncFn(async () => {
    try {
      setRaidButtonLoadingText('Submitting...')
      const requirements = raidFormData.requirements

      const validateTweetRes = await validateTweetIdMut.mutateAsync({
        tweetId: raidFormData.tweetId,
      })

      console.log({ validateTweetRes })

      if (!validateTweetRes.success) {
        toast.error(validateTweetRes.error)
        return
      }

      const txSignature = await submitRaidTx()
      if (!txSignature) return

      const raid2EarnSubmissionResponse = await submitRaid2EarnMut.mutateAsync({
        requirements,
        tweetId: raidFormData.tweetId,
        paymentTxSignature: txSignature,
        raffleId: raffle.id,
      })

      if (raid2EarnSubmissionResponse.error) {
        toast.error(raid2EarnSubmissionResponse.error)
      } else {
        toast.success(raid2EarnSubmissionResponse.message)
      }
    } catch (err) {
      console.log('err thrown submitting raid', err)
    }
  }, [wallet, raffle.id, raidFormData])

  return (
    <>
      <Box
        marginBottom='1rem'
        bg={isDarkMode ? 'cardBlack' : '#F9F9F9'}
        borderRadius='1.875rem'
        paddingY='1.5rem'
        paddingX='2.5rem'
        mt='1rem'
      >
        <Text marginBottom='1rem' textAlign={'center'} textDecor='underline'>
          <i>Push your raffle. Use raid2earn to boost your Twitter reach.</i>
        </Text>

        <Text marginY='2rem' fontSize='1rem'>
          We integrated Raven by Blocksmith Labs into our page, so you can
          directly start boosting your raffle tweet via Raid2Earn for more
          reach. We've also linked Tombraid by Alpha Pharaohs below, so you can
          choose between two systems.
        </Text>

        <FormControl isRequired>
          <FormLabelWithMode as='legend'>
            Tweet ID
          </FormLabelWithMode>
          <FormInputWithMode
            value={raidFormData.tweetId}
            onChange={(e) =>
              updateRaid2EarnFormValue('tweetId', e.target.value)
            }
            placeholder='e.g. 1536750317634732033'
            w={['17rem', '25rem', '40rem']}
          />
          <FormHelperText>
            When clicking on the tweet, there will be an ID within the URL. Copy
            that ID into this field.
          </FormHelperText>
        </FormControl>
        <Text mt='1.6rem' fontSize='1rem' fontWeight={600}>
          Requirements
        </Text>
        <Text mt='.8rem' fontSize='.9rem'>
          Add requirements the users need to fulfill to be applicable for
          rewards.
        </Text>
        {raidFormData.requirements.map((requirementSelected, i) => {
          const requirementOption = raid2EarnRequirementOptions.find(
            (option) => option.key === requirementSelected.key
          )
          if (!requirementOption) return

          return (
            <Stack
              paddingY='1.4rem'
              borderTop={i !== 0 ? '1px solid #ddd' : 'none'}
            >
              <HStack justify={'space-between'}>
                <HStack>
                  <Select
                    className='app-charka-react-select'
                    chakraStyles={ChakraNormalSelectStyle(colorMode)}
                    onChange={(newVal: any) => {
                      const newRequirements = raidFormData.requirements.map(
                        (req) => {
                          if (req.key === requirementSelected.key) {
                            return {
                              key: newVal.value,
                              value: '',
                            }
                          }
                          return req
                        }
                      )
                      console.log({ newRequirements })

                      updateRaid2EarnFormValue('requirements', newRequirements)
                    }}
                    value={{
                      label: requirementOption.label,
                      value: requirementOption.key,
                    }}
                    options={raid2EarnRequirementOptions
                      .filter(
                        (option) =>
                          !raidFormData.requirements.some(
                            (req) => req.key === option.key
                          ) || requirementSelected.key === option.key
                      )
                      .map((option) => ({
                        label: option.label,
                        value: option.key,
                      }))}
                  />
                  <Stack>
                    <Text paddingX={2} textAlign='left' align='left'>
                      {requirementOption.description}
                    </Text>
                  </Stack>
                </HStack>
                <DeleteIcon
                  _hover={{
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    updateRaid2EarnFormValue(
                      'requirements',
                      raidFormData.requirements.filter(
                        (req) => req.key !== requirementSelected.key
                      )
                    )
                  }}
                ></DeleteIcon>
              </HStack>
              {requirementOption.input && (
                <HStack paddingX='1rem'>
                  {requirementOption.input === 'text' && (
                    <FormInputWithMode
                      onChange={(newVal: any) => {
                        const newRequirements = raidFormData.requirements.map(
                          (req) => {
                            if (req.key === requirementSelected.key) {
                              return {
                                key: req.key,
                                value: newVal.target.value,
                              }
                            }
                            return req
                          }
                        )
                        updateRaid2EarnFormValue(
                          'requirements',
                          newRequirements
                        )
                      }}
                      value={requirementSelected.value}
                      placeholder={requirementOption.inputPlaceholder}
                    ></FormInputWithMode>
                  )}
                  {requirementOption.input === 'number' && (
                    <FormInputWithMode
                      value={requirementSelected.value}
                      onChange={(newVal: any) => {
                        const newRequirements = raidFormData.requirements.map(
                          (req) => {
                            if (req.key === requirementSelected.key) {
                              return {
                                key: req.key,
                                value: newVal.target.value,
                              }
                            }
                            return req
                          }
                        )
                        updateRaid2EarnFormValue(
                          'requirements',
                          newRequirements
                        )
                      }}
                      type='number'
                      placeholder={requirementOption.inputPlaceholder}
                    ></FormInputWithMode>
                  )}
                </HStack>
              )}
            </Stack>
          )
        })}
        <Button
          onClick={() => {
            const filteredOptions = raid2EarnRequirementOptions.filter(
              (option) =>
                !raidFormData.requirements.some((req) => req.key === option.key)
            )

            if (filteredOptions.length === 0) {
              toast.error('All requirements already in use')
              return
            }

            updateRaid2EarnFormValue('requirements', [
              ...raidFormData.requirements,
              {
                key: filteredOptions[0].key,
              },
            ])
          }}
        >
          Add requirement
        </Button>
        <Flex w='100%' alignItems={'center'} justifyContent='center'>
          <Button
            variant={isDarkMode ? 'primaryDark' : 'primary'}
            w='full'
            maxWidth='300px'
            mt='2rem'
            height={['3.2rem', '3.2rem']}
            fontSize={['0.9rem', '1rem']}
            onClick={() => {
              submitRaid()
            }}
            isLoading={submitRaidRes.loading}
            loadingText={raidButtonLoadingText}
          >
            Submit raid using Raven for 1.1 SOL
          </Button>
        </Flex>
        <Text textAlign={'center'} marginTop={'.6rem'}>
          <i>using Raven by Blocksmith Labs</i>
        </Text>

        <Stack borderTop='1px solid #ddd' marginTop='2rem'>
          <Text>
            or use{' '}
            <Link href='https://sac.tombraid.app' target='_blank'>
              Tombraid
            </Link>
          </Text>
        </Stack>
      </Box>
    </>
  )
}
