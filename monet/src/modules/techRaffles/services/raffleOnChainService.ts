import { BN } from '@project-serum/anchor';
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js';
import { loadWallet, pub } from '../../../utils/solUtils';
import { raffleProgram } from '../raffleConfig';
import { getRafflePda, getRaffleTreasuryPda } from '../raffleOnChainUtils';
import { raffleType } from '../types';

const monetUser = loadWallet(process.env.MONET_WALLET!)

export async function createInitIRLRaffleInstruction(raffle: raffleType, raffleHost: PublicKey, skipExisting?: boolean) {
  const rafflePda = await getRafflePda(monetUser.publicKey, raffle.id)
  const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
  const raffleLoaded = await raffleProgram.account.raffle.fetchNullable(
    rafflePda[0]
  )

  if (raffleLoaded && !skipExisting) throw new Error('Raffle with this id already exists')

  const initRaffleInstr = raffleProgram.instruction.initRaffle(
    rafflePda[1],
    raffleTreasuryPda[1],
    raffle.id,
    pub(raffle.payoutWallet),
    new BN(raffle.ticketPrice * 10 ** raffle.ticketPriceToken.decimals),
    pub(raffle.ticketPriceToken.address),
    new BN(raffle.starts.getTime() / 1000),
    new BN(raffle.ends.getTime() / 1000),
    raffle.maxTickets ? raffle.maxTickets : 0, // 0 => unlimited tickets
    raffle.type === 'WHITELIST',
    new BN(raffle.winnerSpots!),
    Keypair.generate().publicKey, // mock nft public key
    {
      accounts: {
        raffle: rafflePda[0],
        raffleTreasury: raffleTreasuryPda[0],
        user: monetUser.publicKey,
        payer: raffleHost,
        systemProgram: SystemProgram.programId,
      },
    }
  )
  return {initRaffleInstr, rafflePda}
}

export async function createInitWLRaffleInstruction(raffle: raffleType, raffleHost: PublicKey, skipExisting?: boolean) {
  const rafflePda = await getRafflePda(monetUser.publicKey, raffle.id)
  const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
  const raffleLoaded = await raffleProgram.account.raffle.fetchNullable(
    rafflePda[0]
  )

  if (raffleLoaded && !skipExisting) throw new Error('Raffle with this id already exists')

  const initRaffleInstr = raffleProgram.instruction.initRaffle(
    rafflePda[1],
    raffleTreasuryPda[1],
    raffle.id,
    pub(raffle.payoutWallet),
    new BN(raffle.ticketPrice * 10 ** raffle.ticketPriceToken.decimals),
    pub(raffle.ticketPriceToken.address),
    new BN(raffle.starts.getTime() / 1000),
    new BN(raffle.ends.getTime() / 1000),
    raffle.maxTickets ? raffle.maxTickets : 0, // 0 => unlimited tickets
    raffle.type === 'WHITELIST',
    new BN(raffle.wlSpots!),
    Keypair.generate().publicKey, // mock nft public key
    {
      accounts: {
        raffle: rafflePda[0],
        raffleTreasury: raffleTreasuryPda[0],
        user: monetUser.publicKey,
        payer: raffleHost,
        systemProgram: SystemProgram.programId,
      },
    }
  )
  return {initRaffleInstr, rafflePda}
}


export async function createInitNFTRaffleInstruction(raffle: raffleType, raffleHost: PublicKey, nftPubKey: PublicKey, skipExisting?: boolean) {
  const rafflePda = await getRafflePda(monetUser.publicKey, raffle.id)
  const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
  const raffleLoaded = await raffleProgram.account.raffle.fetchNullable(
    rafflePda[0]
  )

  if (raffleLoaded && !skipExisting) throw new Error('Raffle with this id already exists')

  const initRaffleInstr = raffleProgram.instruction.initRaffle(
    rafflePda[1],
    raffleTreasuryPda[1],
    raffle.id,
    pub(raffle.payoutWallet),
    new BN(raffle.ticketPrice * 10 ** raffle.ticketPriceToken.decimals),
    pub(raffle.ticketPriceToken.address),
    new BN(raffle.starts.getTime() / 1000),
    new BN(raffle.ends.getTime() / 1000),
    raffle.maxTickets ? raffle.maxTickets : 0, // 0 => unlimited tickets
    raffle.type === 'WHITELIST',
    new BN(0), // leave out wl spots
    nftPubKey, // nft mint to raffle
    {
      accounts: {
        raffle: rafflePda[0],
        raffleTreasury: raffleTreasuryPda[0],
        user: monetUser.publicKey,
        payer: raffleHost,
        systemProgram: SystemProgram.programId,
      },
    }
  )

  return {initRaffleInstr, rafflePda}
}