import { BN } from '@project-serum/anchor'
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js'
import asyncBatch from 'async-batch'
import _ from 'lodash'
import reattempt from 'reattempt'
import { connection, puffToken } from '../../../config/config'
import prisma from '../../../lib/prisma'
import { postDiscordWinners } from '../../../utils/discordBot'
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAddressInstruction,
  getTokenAccount,
  handleTransaction,
  handleTransactionError,
  increaseComputeUnitInstruction,
  loadWallet,
} from '../../../utils/solUtils'
import { delay } from '../../../utils/utils'
import { raffleProgram } from '../raffleConfig'
import {
  getAllRaffleParticipants,
  getAllRaffleParticipantsRetried,
  getRaffleOnChainDataRetried,
} from '../raffleOnChainUtils'
import { getAllUndrawnEndedRafflesOrPossiblySoldOut } from './RaffleService'
import { raffleDefaultSelect } from './selects/raffle'
import { getOrCreateUser, userDetaultData } from './UserService'
import { endedRaffleType, OnChainRaffleType } from '../types'
import { createTransferInstruction } from '../../../utils/splUtils'
import { chunks } from '../../../utils/sacUtils'
import { getGeneralMonetSettings } from './PlatformService'

const monetUser = loadWallet(process.env.MONET_WALLET!)
export const monetPrizesUser = loadWallet(process.env.MONET_PRIZES_WALLET!)
export const monetFeeUser = loadWallet(process.env.MONET_FEE_WALLET!)

export async function finalizeOpenRaffles() {
  const platformSettings = await getGeneralMonetSettings()

  if (platformSettings?.generalDrawingHalted) {
    console.log(
      `======= General Drawing of raffles halted, skipping at ${new Date().toISOString()} ======`
    )
    return
  }

  const undrawnEndedRaffles = await getAllUndrawnEndedRafflesOrPossiblySoldOut()
  console.log('Trying to finalise', undrawnEndedRaffles.length, 'raffle(s)')
  const finalisedRaffles: any[] = []

  for (const endedRaffle of undrawnEndedRaffles) {
    if (endedRaffle.autodrawDisabled) continue
    const finishedRaffle = await finishRaffle(endedRaffle)
    finalisedRaffles.push(finishedRaffle)
  }

  console.log(
    'Finished finalising',
    finalisedRaffles.filter((f) => !!f).length,
    'raffle(s)'
  )
  console.log(
    'Could not finish',
    finalisedRaffles.filter((f) => !f).length,
    'raffle(s)'
  )
}

export async function finishRaffle(
  endedRaffle: Awaited<
    ReturnType<typeof getAllUndrawnEndedRafflesOrPossiblySoldOut>
  >[0]
) {
  try {
    if (endedRaffle.status === 'FINISHED') {
      console.log('Raffle already finished', endedRaffle.id)
      return
    }

    console.log('Starting finalisation of raffle=', endedRaffle.id)

    // 1. draw winner
    const raffleOnChainData = await getRaffleOnChainDataRetried(
      monetUser.publicKey,
      endedRaffle.id
    )

    if (endedRaffle.ends > new Date()) {
      console.log('Raffle is ending in the future, checking for sold out')
      console.log(raffleOnChainData.ticketCount, endedRaffle.maxTickets)

      if (
        endedRaffle.maxTickets &&
        raffleOnChainData.ticketCount < endedRaffle.maxTickets
      ) {
        console.log(
          'Skipping. Raffle has not ended and has not sold out, raffle=',
          endedRaffle.id
        )
        return
      }
    }

    if (raffleOnChainData.ticketCount === 0) {
      console.log(
        'Skipping. Raffle has ended and has no tickets sold, raffle=',
        endedRaffle.id
      )
      await prisma.raffle.update({
        data: {
          status: 'CANCELLED',
          noTicketsBought: true,
        },
        where: { id: endedRaffle.id },
      })
      return
    }

    const { winners: pubWinners, participants } = await getOrDrawWinners(
      endedRaffle,
      raffleOnChainData
    )
    if (!pubWinners) return

    // 2. send out NFT
    if (endedRaffle.status !== 'DRAWN') {
      const drawTx = await drawOnChainAndSendOutNft(
        endedRaffle,
        raffleOnChainData,
        pubWinners
      )

      // 3. update raffle status to drawn
      const drawnRaffle = await prisma.raffle.update({
        data: {
          drawTxHash: drawTx,
          status: 'DRAWN',
          ticketsSoldFinal: Math.floor(raffleOnChainData.ticketCount),
        },
        where: {
          id: endedRaffle.id,
        },
      })
    }

    const winners = await updateWinnersInDB(pubWinners, endedRaffle)

    // 4. post raffle winner result to discord
    await postWinnersOnDiscordAndUpdateStatus(endedRaffle, winners)

    // 5. payout funds in vault to raffle host
    console.log(
      'On-chain funds payout wallet',
      raffleOnChainData.fundsUser.toBase58()
    )
    await payoutRaffleFunds(endedRaffle, raffleOnChainData)

    // 6. update
    console.log(
      'Update participants buying data',
      raffleOnChainData.fundsUser.toBase58()
    )
    await updateParticipantBuyingDataAfterRaffleEnd(
      endedRaffle,
      raffleOnChainData
    )

    console.log('Updating status to finished, raffle=', endedRaffle.id)

    const finishedRaffle = await prisma.raffle.update({
      data: {
        status: 'FINISHED',
      },
      where: {
        id: endedRaffle.id,
      },
    })

    console.log('Raffle finished, updated status, raffle=', finishedRaffle.id)
    return finishedRaffle
    await delay(1000)
  } catch (err: any) {
    console.log('Error finalising raffle=', endedRaffle.id, err?.message)
    return
  }
}

/*
 * 1. iterate through all purchase tokens of endedRaffle
 * 2. check if funds of raffle treasury in raffleOnChainData are enough to pay out for each token by getting his balance
 * 3. if not, skip
 * 4. if yes, send out funds to raffle host and potentially create a token account, close old token accounts of vault
 * 5. check his solana balance, pay it out to the raffle host
 * 6. update raffle status to finished
 */
export async function payoutRaffleFunds(
  endedRaffle: endedRaffleType,
  raffleOnChainData: OnChainRaffleType
) {
  try {
    const raffleTreasury = raffleOnChainData.raffleTreasury
    const payoutWallet = new PublicKey(endedRaffle.payoutWallet)

    console.log(
      '5. === Paying out raffle funds of raffle=',
      endedRaffle.id,
      'to wallet=',
      endedRaffle.payoutWallet
    )

    const allPayoutTransactionHashes: string[] = []

    // payout tokens
    // 1. payout to payoutWallet and feeWallet
    // 2. payout from feeWallet to benefittingProjects
    for (const purchaseToken of endedRaffle.allowedPurchaseTokens) {
      console.log(
        `Paying out ${purchaseToken.token.symbol} funds for ${endedRaffle.id} raffle`
      )

      const instructions: TransactionInstruction[] = []
      const signers = [monetUser]

      if (purchaseToken.token.isSPL) {
        // create instructions to send out SPL tokens from raffle vault to payoutWallet

        const tokenMint = new PublicKey(purchaseToken.token.address)
        const tokenAccount = await getTokenAccount(
          connection,
          tokenMint,
          raffleTreasury
        )

        if (
          tokenAccount &&
          tokenAccount.account.data.parsed.info.tokenAmount.uiAmount > 0
        ) {
          const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount
          const totalAmount = Number(tokenAmount.amount)

          const fee = endedRaffle.feeAmount // e.g. 0.04
          const payoutPerc = 1 - fee
          const payoutAmountNum = Math.round(totalAmount * payoutPerc) // TODO: figure out fees
          const payoutAmount = new BN(payoutAmountNum)
          const feeAmountNum = Math.round(totalAmount - payoutAmountNum)
          const feeAmount = new BN(feeAmountNum)
          const feeAmountToShare =
            fee === 0.02 ? feeAmountNum * 0.5 : feeAmountNum * 0.6
          const monetShare = feeAmountNum - feeAmountToShare

          const paymentAmountFloat =
            payoutAmountNum / purchaseToken.token.decimals
          const feeAmountFloat = feeAmountNum / purchaseToken.token.decimals
          const monetFeeAmountFloat = monetShare / purchaseToken.token.decimals

          const updatedPurchaseToken = await prisma.allowedPurchaseToken.update(
            {
              where: {
                raffleId_tokenId: {
                  raffleId: endedRaffle.id,
                  tokenId: purchaseToken.token.id,
                },
              },
              data: {
                totalPayout: paymentAmountFloat,
                totalFee: feeAmountFloat,
                monetFee: monetFeeAmountFloat,
              },
            }
          )
          console.log(
            `Entered purchase token stats for token=${purchaseToken.token.symbol}, raffle=${endedRaffle.id}`
          )

          const vaultTokenAccount = tokenAccount.pubkey
          console.log('creating payout token account')

          const payoutTokenAccount =
            await getOrCreateAssociatedTokenAddressInstruction(
              tokenMint,
              payoutWallet,
              connection,
              monetUser.publicKey,
              true
            )

          console.log('created payout token account')
          const feeTokenAccount =
            await getOrCreateAssociatedTokenAddressInstruction(
              tokenMint,
              monetFeeUser.publicKey,
              connection,
              monetUser.publicKey,
              true
            )

          instructions.push(...payoutTokenAccount.instructions)
          instructions.push(...feeTokenAccount.instructions)

          console.log(
            `Sending ${payoutAmountNum / purchaseToken.token.decimals} of ${
              purchaseToken.token.symbol
            } to ${endedRaffle.payoutWallet}, fee=${feeAmount.toNumber()}`
          )

          const sendTokenInstruction =
            await raffleProgram.instruction.sendTokens(
              payoutAmount,
              feeAmount,
              {
                accounts: {
                  raffle: raffleOnChainData.publicKey,
                  raffleTreasury: raffleTreasury,
                  backendUser: monetUser.publicKey,
                  adminUser: monetUser.publicKey,
                  vaultMint: tokenMint,
                  vaultTokenAccount: vaultTokenAccount,
                  payoutTokenAccount: payoutTokenAccount.address,
                  feeTokenAccount: feeTokenAccount.address,
                  systemProgram: SystemProgram.programId,
                  tokenProgram: TOKEN_PROGRAM_ID,
                  rent: SYSVAR_RENT_PUBKEY,
                  associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                },
                signers: [monetUser],
              }
            )

          instructions.push(sendTokenInstruction)

          const feePerBenefittingProject =
            endedRaffle.benefitingProjects.length <= 3
              ? Math.floor(feeAmountToShare / 3)
              : Math.floor(
                  feeAmountToShare / endedRaffle.benefitingProjects.length
                )
          console.log({ feePerBenefittingProject })

          for (const benefitingProject of endedRaffle.benefitingProjects) {
            if (
              !benefitingProject.discordNewRafflesHook ||
              !benefitingProject.discordWinnersHook
            ) {
              console.log(
                'Skipping revenue share because no webhook is configured'
              )
              continue
            }

            try {
              const benefitingProjectWallet = new PublicKey(
                benefitingProject.fundsWallet
              )
              const benefitingProjectTokenAccount = await getTokenAccount(
                connection,
                tokenMint,
                benefitingProjectWallet
              )
              if (!benefitingProjectTokenAccount) {
                console.log(
                  'Benefitting project has no token account',
                  benefitingProject.id,
                  'for token=',
                  purchaseToken.token.symbol
                )
                continue
              }

              instructions.push(
                Token.createTransferInstruction(
                  TOKEN_PROGRAM_ID,
                  feeTokenAccount.address,
                  benefitingProjectTokenAccount.pubkey,
                  monetFeeUser.publicKey,
                  [monetFeeUser],
                  feePerBenefittingProject
                )
              )

              if (
                !signers.some(
                  (signer) =>
                    signer.publicKey.toBase58() ===
                    monetFeeUser.publicKey.toBase58()
                )
              ) {
                signers.push(monetFeeUser)
              }
            } catch (err: any) {
              console.log(
                'Error paying out funds to benefiting project=',
                benefitingProject.id,
                'raffle=',
                endedRaffle.id,
                'token=',
                purchaseToken.token.symbol,
                'err',
                err
              )
            }
          }
        } else {
          console.log(
            'Skipping payout, no token account found or token account amount is 0 for token=',
            purchaseToken.token.symbol,
            'raffle=',
            endedRaffle.id,
            'treasury=',
            raffleTreasury.toBase58()
          )
          continue
        }
      } else {
        // create instructions to send out SOL from raffle vault to payoutWallet

        const balance = await connection.getBalance(raffleTreasury)

        if (balance > 0.001 * LAMPORTS_PER_SOL) {
          const fee = endedRaffle.feeAmount // e.g. 0.04
          const payoutPerc = 1 - fee
          const payoutAmountNum = Math.round(balance * payoutPerc)
          const payoutAmount = new BN(payoutAmountNum)
          const feeAmountNum = Math.round(balance - payoutAmountNum)
          const feeAmount = new BN(feeAmountNum)
          const feeAmountToShare =
            fee === 0.02 ? feeAmountNum * 0.5 : feeAmountNum * 0.6
          const monetShare = feeAmountNum - feeAmountToShare

          const paymentAmountFloat =
            payoutAmountNum / purchaseToken.token.decimals
          const feeAmountFloat = feeAmountNum / purchaseToken.token.decimals
          const monetFeeAmountFloat = monetShare / purchaseToken.token.decimals

          const updatedPurchaseToken = await prisma.allowedPurchaseToken.update(
            {
              where: {
                raffleId_tokenId: {
                  raffleId: endedRaffle.id,
                  tokenId: purchaseToken.token.id,
                },
              },
              data: {
                totalPayout: paymentAmountFloat,
                totalFee: feeAmountFloat,
                monetFee: monetFeeAmountFloat,
              },
            }
          )
          console.log(
            `Entered purchase token stats for token=${purchaseToken.token.symbol}, raffle=${endedRaffle.id}`
          )

          console.log(
            `Creating payout transaction for ${
              payoutAmountNum / LAMPORTS_PER_SOL
            } SOL to ${endedRaffle.payoutWallet}, fee=${
              feeAmount.toNumber() / LAMPORTS_PER_SOL
            }, raffle=${endedRaffle.id}`
          )

          const payoutSolanaInstruction =
            await raffleProgram.instruction.sendSol(payoutAmount, feeAmount, {
              accounts: {
                raffle: raffleOnChainData.publicKey,
                raffleTreasury: raffleTreasury,
                backendUser: monetUser.publicKey,
                payoutUser: payoutWallet,
                feeUser: monetFeeUser.publicKey,
                adminUser: monetUser.publicKey,
                systemProgram: SystemProgram.programId,
              },
              signers: [monetUser],
            })

          instructions.push(payoutSolanaInstruction)

          const feePerBenefittingProjectAsLamports =
            endedRaffle.benefitingProjects.length <= 3
              ? Math.floor(feeAmountToShare / 3)
              : Math.floor(
                  feeAmountToShare / endedRaffle.benefitingProjects.length
                )
          console.log({
            feePerBenefittingProject: feePerBenefittingProjectAsLamports,
          })

          for (const benefitingProject of endedRaffle.benefitingProjects) {
            try {
              const benefitingProjectWallet = new PublicKey(
                benefitingProject.fundsWallet
              )

              instructions.push(
                SystemProgram.transfer({
                  fromPubkey: monetFeeUser.publicKey,
                  toPubkey: benefitingProjectWallet,
                  lamports: feePerBenefittingProjectAsLamports,
                })
              )

              if (
                !signers.some(
                  (signer) =>
                    signer.publicKey.toBase58() ===
                    monetFeeUser.publicKey.toBase58()
                )
              ) {
                signers.push(monetFeeUser)
              }
            } catch (err: any) {
              console.log(
                'Error paying out funds to benefiting project',
                benefitingProject.id,
                endedRaffle.id,
                purchaseToken.token.symbol,
                err
              )
            }
          }
        } else {
          console.log(
            'Skipping payout, no SOL found in raffle treasury=',
            raffleTreasury.toBase58(),
            'raffle=',
            endedRaffle.id
          )
          continue
        }
      }

      if (instructions.length > 16) {
        const instructionChunks = chunks(instructions, 16)

        for (const [idx, instructionChunk] of instructionChunks.entries()) {
          // send payout token tx for chunk
          const blockhash = await connection.getLatestBlockhash()
          const payoutTokenTx = new Transaction({
            feePayer: monetUser.publicKey,
            blockhash: blockhash.blockhash,
            lastValidBlockHeight: blockhash.lastValidBlockHeight,
          }).add(increaseComputeUnitInstruction(), ...instructionChunk)
          payoutTokenTx.partialSign(...signers)

          console.log(
            'Created transaction for sending out token chunk',
            purchaseToken.token.symbol,
            endedRaffle.id,
            'instructions len',
            instructions.length,
            'chunk idx',
            idx
          )

          const txHash = await reattempt.run(
            { times: 6, delay: 1500 },
            async () => {
              return connection.sendTransaction(payoutTokenTx, signers)
            }
          )

          console.log(
            'Sent transaction for sending out token chunk, now waiting for confirmation',
            purchaseToken.token.symbol,
            endedRaffle.id,
            txHash,
            'instruction chunk idx',
            idx
          )

          const txHandledHash = await handleTransaction(txHash, {
            showLogs: true,
            commitment: 'confirmed',
            blockhash,
          })

          console.log(
            'confirmed send token transaction chunk',
            endedRaffle.id,
            purchaseToken.token.symbol,
            txHandledHash,
            'instruction chunk idx',
            idx
          )

          allPayoutTransactionHashes.push(txHandledHash)
        }
      } else {
        // send payout token tx
        const blockhash = await connection.getLatestBlockhash()
        const payoutTokenTx = new Transaction({
          feePayer: monetUser.publicKey,
          blockhash: blockhash.blockhash,
          lastValidBlockHeight: blockhash.lastValidBlockHeight,
        }).add(increaseComputeUnitInstruction(), ...instructions)
        payoutTokenTx.partialSign(...signers)

        console.log(
          'Created transaction for sending out token',
          purchaseToken.token.symbol,
          endedRaffle.id,
          'instructions len',
          instructions.length
        )

        const txHash = await reattempt.run(
          { times: 6, delay: 1500 },
          async () => {
            return connection.sendTransaction(payoutTokenTx, signers)
          }
        )

        console.log(
          'Sent transaction for sending out token, now waiting for confirmation',
          purchaseToken.token.symbol,
          endedRaffle.id,
          txHash
        )

        const txHandledHash = await handleTransaction(txHash, {
          showLogs: true,
          commitment: 'confirmed',
          blockhash,
        })

        console.log(
          'confirmed send token transaction',
          endedRaffle.id,
          purchaseToken.token.symbol,
          txHandledHash
        )

        allPayoutTransactionHashes.push(txHandledHash)
      }
    }

    console.log(
      `Finished all payout transactions for raffle ${endedRaffle.id}, total payouts=${allPayoutTransactionHashes.length}`
    )

    return allPayoutTransactionHashes
  } catch (err: any) {
    console.log(
      'ERROR: Paying out funds from raffle=',
      endedRaffle.id,
      'failed',
      err
    )
    handleTransactionError(err)
    await prisma.raffle.update({
      data: {
        problem: 'PAYOUT_FAILED',
        problemDescription: err.message.substring(0, 999),
      },
      where: { id: endedRaffle.id },
    })
    console.log('Updated after ERROR', endedRaffle.id)
    throw err
  }
}

// 4. post raffle winner result to discord of creator project and beneffiting project and update the status
export async function postWinnersOnDiscordAndUpdateStatus(
  endedRaffle: endedRaffleType,
  winners: endedRaffleType['winners']
) {
  try {
    console.log('4. === Starting to post winners on discord', endedRaffle.id)

    if (endedRaffle.hasBeenPostedToDiscord) {
      console.log('Raffle winners have been posted already')
      return
    }

    // TODO: WHICH raffles to post where?
    if (endedRaffle.creatorProject?.discordWinnersHook) {
      await postDiscordWinners(
        endedRaffle.creatorProject.discordWinnersHook,
        endedRaffle,
        winners,
        endedRaffle.creatorProject.communityName,
        endedRaffle.creatorProject.discordWinnersRoleId
      )
    }
    for (const benefitingProject of endedRaffle.benefitingProjects) {
      if (benefitingProject.discordWinnersHook) {
        await postDiscordWinners(
          benefitingProject.discordWinnersHook,
          endedRaffle,
          winners,
          benefitingProject.communityName,
          benefitingProject.discordWinnersRoleId
        )
      }
    }

    // TODO: should we update the status here?
    await prisma.raffle.update({
      data: {
        hasBeenPostedToDiscord: true,
      },
      where: {
        id: endedRaffle.id,
      },
    })
  } catch (err: any) {
    console.log('ERROR: Posting winners on discord failed', endedRaffle.id, err)
    await prisma.raffle.update({
      data: {
        problem: 'DISCORD_POST_FAILED',
        problemDescription: err.message.substring(0, 999),
      },
      where: { id: endedRaffle.id },
    })
    console.log('Updated after ERROR', endedRaffle.id)
    // no rethrow, we want to continue with paying out funds
  }
}

// 2. draw on chain and send out nft in drawing call
export async function drawOnChainAndSendOutNft(
  endedRaffle: endedRaffleType,
  raffleOnChainData: OnChainRaffleType,
  winners: PublicKey[]
) {
  try {
    console.log('2. === Starting on-chain draw and send out', endedRaffle.id)

    if (winners.length !== 1 && endedRaffle.type === 'NFT') {
      console.log(
        'WARNING: NFT raffle has 0 winners or more than 1 winner',
        endedRaffle.id
      )
      throw new Error('NFT raffle has 0 winners or more than 1 winner')
    }

    const instructions: TransactionInstruction[] = []
    const pubWinners = winners
    const pubWinner = pubWinners[0]

    const getTokenAccountsForNFT = async () => {
      if (endedRaffle.type === 'NFT') {
        const prizesNftTokenAccount = await getAssociatedTokenAddress(
          raffleOnChainData.nftMint,
          monetPrizesUser.publicKey,
          true
        )

        /*

      skip creation because it's done in transfer
      
      await getOrCreateAssociatedTokenAddressInstruction(
            raffleOnChainData.nftMint,
            monetPrizesUser.publicKey,
            connection,
            monetPrizesUser.publicKey,
            true
          ) */

        const receiverNftTokenAccount = await getAssociatedTokenAddress(
          raffleOnChainData.nftMint,
          pubWinner,
          true
        )

        /* 
        
        skip creation because it's done in transfer
        
          await getOrCreateAssociatedTokenAddressInstruction(
            raffleOnChainData.nftMint,
            pubWinner,
            connection,
            monetPrizesUser.publicKey,
            true
          )
        instructions.push(increaseComputeUnitInstruction())
        instructions.push(...prizesNftTokenAccount.instructions)
        instructions.push(...receiverNftTokenAccount.instructions) */
        return {
          prizesNftTokenAccount,
          receiverNftTokenAccount,
        }
      } else {
        const prizesNftTokenAccount = await getAssociatedTokenAddress(
          puffToken,
          new PublicKey('PUFFgnKKhQ23vp8uSPwdzrUhEr7WpLmjM85NB1FQgpb')
        )
        const receiverNftTokenAccount = await getAssociatedTokenAddress(
          puffToken,
          new PublicKey('GpUCXJD33rBH4ENZTfuV4jiQW89TCAC9SGnq3gGurnST')
        )
        return {
          prizesNftTokenAccount,
          receiverNftTokenAccount,
        }
      }
    }

    const { prizesNftTokenAccount, receiverNftTokenAccount } =
      await getTokenAccountsForNFT()

    const placeholderTokenAccount1 = await getAssociatedTokenAddress(
      puffToken,
      new PublicKey('PUFFgnKKhQ23vp8uSPwdzrUhEr7WpLmjM85NB1FQgpb')
    )
    const placeholderTokenAccount2 = await getAssociatedTokenAddress(
      puffToken,
      new PublicKey('GpUCXJD33rBH4ENZTfuV4jiQW89TCAC9SGnq3gGurnST')
    )

    // change draw and send out, to 1. draw 2. claim + pay royalties
    const drawAndSendOutInstr = await raffleProgram.instruction.draw(
      pubWinners,
      endedRaffle.type === 'WHITELIST' || endedRaffle.type === 'IRL',
      {
        accounts: {
          user: monetUser.publicKey,
          raffle: raffleOnChainData.publicKey,
          backendUser: monetUser.publicKey,
          mint:
            endedRaffle.type === 'NFT' ? raffleOnChainData.nftMint : puffToken,
          priceWalletSigner: monetPrizesUser.publicKey,
          pricesTokenAccount: placeholderTokenAccount1,
          receiverTokenAccount: placeholderTokenAccount2,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        },
        signers: [monetUser, monetPrizesUser],
      }
    )
    instructions.push(drawAndSendOutInstr)

    // adding manual transfer tx
    const transferInstructions =
      endedRaffle.type === 'NFT'
        ? await createTransferInstruction({
            mint: raffleOnChainData.nftMint,
            from: monetPrizesUser.publicKey,
            to: pubWinner,
            amount: 1,
          })
        : []

    instructions.push(...transferInstructions)

    if (endedRaffle.type === 'NFT') {
      const closePrizesTokenAccountInstr = Token.createCloseAccountInstruction(
        TOKEN_PROGRAM_ID,
        prizesNftTokenAccount,
        monetPrizesUser.publicKey,
        monetPrizesUser.publicKey,
        [monetPrizesUser]
      )
      instructions.push(closePrizesTokenAccountInstr)
    }

    const blockhash = await connection.getLatestBlockhash()

    const drawAndSendOutTransaction = new Transaction({
      feePayer: monetUser.publicKey,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(...instructions)
    drawAndSendOutTransaction.partialSign(monetUser, monetPrizesUser)

    console.log(
      'Created transaction for on-chain draw and send out',
      endedRaffle.id,
      'instr len',
      instructions.length
    )

    const txHash = await reattempt.run({ times: 6, delay: 1500 }, async () => {
      return connection.sendTransaction(drawAndSendOutTransaction, [
        monetUser,
        monetPrizesUser,
      ])
    })

    console.log(
      'Sent transaction of draw, now waiting for confirmation for raffle=',
      endedRaffle.id,
      'tx hash',
      txHash
    )

    const txHandledHash = await handleTransaction(txHash, {
      showLogs: true,
      commitment: 'confirmed',
      blockhash,
    })

    console.log(
      'Confirmed transaction of draw for raffle=',
      endedRaffle.id,
      'tx hash',
      txHandledHash
    )

    return txHandledHash
  } catch (err: any) {
    console.log(
      'ERROR: On-chain draw for raffle failed at sending out NFT',
      endedRaffle.id,
      err
    )
    handleTransactionError(err)
    await prisma.raffle.update({
      data: {
        problem: 'NFT_TRANSFER_FAILED',
        problemDescription: err.message.substring(0, 999),
      },
      where: { id: endedRaffle.id },
    })
    console.log('Updated after ERROR', endedRaffle.id)
    throw err
  }
}

// 1. get or draw winners
export async function getOrDrawWinners(
  endedRaffle: endedRaffleType,
  raffleOnChainData: OnChainRaffleType
) {
  try {
    console.log('1. === Fetching or drawing winners')

    if (endedRaffle.winners.length > 0) {
      console.log('raffle already has winners', endedRaffle.id)
      return {
        winners: endedRaffle.winners.map((w) => new PublicKey(w.wallet)),
      }
    }

    // draw and update
    const { winners, participants, winningTickets } = await drawWinners(
      endedRaffle,
      raffleOnChainData
    )

    return { winners, participants }
  } catch (err: any) {
    console.log(
      'ERROR: Raffling of NFT for raffle failed at drawingWinners',
      endedRaffle.id,
      err
    )
    await prisma.raffle.update({
      data: {
        problem: 'DRAWING_FAILED',
        problemDescription: err.message.substring(0, 999),
      },
      where: { id: endedRaffle.id },
    })
    console.log('Updated after ERROR', endedRaffle.id)
    throw err
  }
}

export async function updateWinnersInDB(
  winners: PublicKey[],
  endedRaffle: endedRaffleType
) {
  // update winners in DB
  const updatedRaffle = await prisma.raffle.update({
    select: raffleDefaultSelect,
    data: {
      winners: {
        connectOrCreate: winners.map((winner) => ({
          create: userDetaultData(winner.toBase58()),
          where: {
            wallet: winner.toBase58(),
          },
        })),
      },
    },
    where: {
      id: endedRaffle.id,
    },
  })
  console.log(
    `found ${winners.length} winners for raffle=${endedRaffle.id}, ${endedRaffle.raffleOnChainAddress}, ${endedRaffle.type}`
  )
  return updatedRaffle.winners
}

export async function getParticipantsForDraw(
  raffle: endedRaffleType,
  raffleOnChainData: OnChainRaffleType
) {
  const raffleUsers = await getAllRaffleParticipantsRetried(
    raffleOnChainData.publicKey
  )
  const sortedRaffleUsers = raffleUsers
    .filter((u) => u.account.raffle.equals(raffleOnChainData.publicKey))
    .sort((a, b) =>
      a.account.authority
        .toBase58()
        .localeCompare(b.account.authority.toBase58())
    )

  const allWallets = sortedRaffleUsers.map((raffleUser) =>
    raffleUser.account.authority.toBase58()
  )
  const usersForWallets = await prisma.user.findMany({
    where: { wallet: { in: allWallets } },
  })

  const sortedRaffleUsersWithDBUsers = sortedRaffleUsers.map((raffleUser) => {
    const wallet = raffleUser.account.authority.toBase58()
    const user = usersForWallets.find((u) => u.wallet === wallet)
    return {
      raffleUser,
      user,
    }
  })

  const participantsForDraw = raffle.onlyPickFromVerified
    ? sortedRaffleUsersWithDBUsers.filter((raffleUser) => {
        return (
          !!raffleUser.user?.discordUsername ||
          !!raffleUser.user?.twitterUsername
        )
      })
    : sortedRaffleUsersWithDBUsers

  return {participantsForDraw, pcps: sortedRaffleUsersWithDBUsers}
}

export async function drawWinners(
  raffle: endedRaffleType,
  raffleOnChainData: OnChainRaffleType
) {
  const {participantsForDraw, pcps} = await getParticipantsForDraw(raffle, raffleOnChainData)

  const winningTickets: number[] = []
  const winners: PublicKey[] = []

  let includesUserAlready = (newWinner: PublicKey) => {
    return winners.some((winner) => winner.equals(newWinner))
  }

  const sortedUserEntries = []
  let startIndex = 1
  for (const user of participantsForDraw) {
    sortedUserEntries.push({
      raffleUserStruct: user.raffleUser,
      user: user.user,
      ticketStart: startIndex, // 1 , 8, 13
      ticketEnd: startIndex + user.raffleUser.account.counter - 1, // 7, 12, ...
    }) // User 1 has tickets 1-7, User 2 has tickets 8-12, ...
    startIndex += user.raffleUser.account.counter // 8, 13, ...
  }

  const prizesLength = raffle.type === 'WHITELIST' ? raffle.wlSpots! : raffle.type === 'IRL' ? raffle.winnerSpots! : 1
  const numberOfWinnersToPick =
    prizesLength > participantsForDraw.length ? participantsForDraw.length : prizesLength

  for (let i = 0; i < numberOfWinnersToPick; i++) {
    let ticket = -1
    let selectedUserEntry = undefined
    while (ticket == -1 || winningTickets.includes(ticket)) {
      let count = 0
      ticket = _.random(1, raffleOnChainData.ticketCount)
      selectedUserEntry = sortedUserEntries.find(
        (userEntry) =>
          userEntry.ticketStart <= ticket && userEntry.ticketEnd >= ticket
      )
      while (
        (!selectedUserEntry ||
          includesUserAlready(
            selectedUserEntry.raffleUserStruct.account.authority
          )) &&
        count < 100
      ) {
        ticket = _.random(1, raffleOnChainData.ticketCount)
        selectedUserEntry = sortedUserEntries.find(
          (userEntry) =>
            userEntry.ticketStart <= ticket && userEntry.ticketEnd >= ticket
        )
        count++
      }
    }
    if (selectedUserEntry) {
      winners.push(selectedUserEntry.raffleUserStruct.account.authority)
      winningTickets.push(ticket)
    }
  }

  return {
    winners,
    winningTickets,
    participants: pcps,
  }
}

export async function updateParticipantBuyingDataAfterRaffleEnd(
  endedRaffle: endedRaffleType,
  raffleOnChainData: OnChainRaffleType,
  participantsList?: Awaited<ReturnType<typeof getParticipantsForDraw>>
) {
  if (!endedRaffle.estimateTicketPriceInSol) {
    console.log('No ticket price in SOL')
    return
  }

  const notOnDEX = endedRaffle.allowedPurchaseTokens.find((t) => !t.token.onDEX)
  if (!!notOnDEX) {
    console.log(
      'One token is not on DEX, skipping raffle data',
      notOnDEX.token.symbol
    )
    return
  }

  const {pcps: participants} =
    participantsList && participantsList.participantsForDraw.length > 0
      ? participantsList
      : await getParticipantsForDraw(endedRaffle, raffleOnChainData)

  console.log(
    `Found ${participants.length} on-chain participants for raffle=${endedRaffle.id}`
  )

  const allDBParticipants = await asyncBatch(
    participants,
    async (participant) =>
      reattempt.run({ times: 3 }, async () => {
        const ticketsBought = participant.raffleUser.account.counter
        const volumeInSol =
          (endedRaffle.estimateTicketPriceInSol ?? 0) * ticketsBought

        const user = participant.user
          ? participant.user
          : await getOrCreateUser(
              participant.raffleUser.account.authority.toBase58()
            )

        console.log(
          `Update participant=${user.name}, wallet=${user.wallet} with count=${ticketsBought} volume=${volumeInSol}, raffle=${endedRaffle.id}`
        )

        const participantDBEntity = await prisma.participant.upsert({
          create: {
            raffleId: endedRaffle.id,
            userId: user.id,
            volumeInSol,
            ticketsBought,
          },
          update: {
            volumeInSol,
            ticketsBought,
          },
          where: {
            userId_raffleId: {
              raffleId: endedRaffle.id,
              userId: user.id,
            },
          },
        })
        return participantDBEntity
      }),
    4
  )

  console.log(
    `Created ${allDBParticipants.length} participants in database for raffle=${endedRaffle.id} (compared to ${participants.length} on-chain participants)`
  )
  return allDBParticipants
}
