import * as anchor from '@project-serum/anchor'
import {
  airdrop,
  generateUserWithSol,
  getAnchorContext,
  getRafflePda,
  getRaffleUserPda,
  getOrCreateTestToken,
  handleTransaction,
  loadKeypairFromPath,
  loadWallet,
  drawLots,
  getAssociatedTokenAddress,
  getRaffleTreasuryPda,
  getTokenAccount,
} from './utils'
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js'
import * as spl from '@solana/spl-token'
import _ from 'lodash'
import * as d from 'date-fns'
import { BN } from '@project-serum/anchor'


const { adminUser, connection, program } = getAnchorContext({
  keypairPath: `${process.env.HOME}/.config/solana/sac-treasury.json`,
  url: process.env.ANCHOR_PROVIDER_URL,
})

const backendSigner = loadKeypairFromPath(
  `${process.env.HOME}/.config/solana/monw5YS9itMBzCZ871G3ZsZXqUoD3RBpJC4HsjQUX9d.json`
)

const user = loadKeypairFromPath(
  `${process.env.HOME}/.config/solana/puff.json`
)

describe('raffle', () => {
  // Configure the client to use the local cluster.

  it('prepare', async () => {
    // await airdrop(connection, adminUser.publicKey, 1)
  })

  it('check program', async () => {
    console.log(connection.rpcEndpoint);
    console.log(program.programId);
    console.log({
      adminUser: adminUser.publicKey.toBase58(),
      backendSigner: backendSigner.publicKey.toBase58(),
      user: user.publicKey.toBase58(),
    });
  })

  let payToken: spl.Token
  let raffleIdForBuy: string
  let nftMint: spl.Token

  it('init nft raffle', async () => {
    const raffle = Keypair.generate()

    payToken = await getOrCreateTestToken({
      connection,
      tokenOwner: adminUser,
    })

    console.log('payToken', payToken.publicKey.toBase58())

    let payTokenAccount = await payToken.getOrCreateAssociatedAccountInfo(
      adminUser.publicKey
    )
    /*   await payToken.mintTo(
      payTokenAccount,
      adminUser.publicKey,
      [adminUser],
      100
    ) */

    nftMint = await getOrCreateTestToken({
      connection,
      tokenOwner: adminUser,
    })

    const prize = {
      mint: nftMint.publicKey,
    }

    const raffleId = Keypair.generate().publicKey.toBase58().slice(0,20)
    raffleIdForBuy = raffleId
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleId)
    const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
    const starts = new Date()
    const ends = d.addDays(starts, 1)

    const disableSol = false
    const isHoldersOnly = false
    const isWhitelistRaffle = true
    const ticketPriceInSol = true

    const payTokens = [payToken.publicKey]

    console.log('adminUser', adminUser.publicKey.toBase58())

    const tx = await program.rpc.initRaffle(
      rafflePda[1],
      raffleTreasuryPda[1],
      raffleId,
      user.publicKey,
      new anchor.BN(100),
      new PublicKey('So11111111111111111111111111111111111111112'),
      new BN(starts.getTime() / 1000),
      new BN(ends.getTime() / 1000),
      10, // max tickets
      isWhitelistRaffle,
      0,
      prize.mint,
      {
        accounts: {
          raffle: rafflePda[0],
          raffleTreasury: raffleTreasuryPda[0],
          user: adminUser.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    )
    await handleTransaction(tx, connection, { showLogs: true })

    let raffleAccount = await program.account.raffle.fetch(rafflePda[0])

    console.log('raffleAccount 1', {
      ...raffleAccount,
      tickets: undefined,
      tx
    })

    nftMint = await getOrCreateTestToken({
      connection,
      tokenOwner: adminUser,
    })

    const prize2 = {
      mint: nftMint.publicKey,
    }

    let nftMintTokenAccount = await nftMint.getOrCreateAssociatedAccountInfo(
      adminUser.publicKey
    )

    await nftMint.mintTo(nftMintTokenAccount.address, adminUser.publicKey, [adminUser], 1)

    await program.rpc.initRaffle(
      rafflePda[1],
      raffleTreasuryPda[1],
      raffleId,
      user.publicKey,
      new anchor.BN(42),
      new PublicKey('So11111111111111111111111111111111111111112'),
      raffleAccount.starts,
      raffleAccount.ends,
      10, // max tickets
      isWhitelistRaffle,
      0,
      prize2.mint,
      {
        accounts: {
          raffle: rafflePda[0],
          raffleTreasury: raffleTreasuryPda[0],
          user: adminUser.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    )
    await handleTransaction(tx, connection, { showLogs: true })

    raffleAccount = await program.account.raffle.fetch(rafflePda[0])

    console.log('raffleAccount 2', {
      ...raffleAccount,
      tickets: undefined,
      tx
    })
  })


  it('init wl raffle', async () => {
    const raffle = Keypair.generate()

    console.log('payToken', payToken.publicKey.toBase58())

    /*   await payToken.mintTo(
      payTokenAccount,
      adminUser.publicKey,
      [adminUser],
      100
    ) */

    const raffleId = Keypair.generate().publicKey.toBase58().slice(0,20)
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleId)
    const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])

    const starts = new Date()
    const ends = d.addDays(starts, 1)

    const disableSol = false
    const isHoldersOnly = false
    const isWhitelistRaffle = false
    const ticketPriceInSol = true

    const payTokens = [payToken.publicKey]

    console.log('adminUser', adminUser.publicKey.toBase58())

    const tx = await program.rpc.initRaffle(
      rafflePda[1],
      raffleTreasuryPda[1],
      raffleId,
      user.publicKey,
      new anchor.BN(100),
      new PublicKey('So11111111111111111111111111111111111111112'),
      new BN(starts.getTime() / 1000),
      new BN(ends.getTime() / 1000),
      10, // max tickets
      isWhitelistRaffle,
      3,
      Keypair.generate().publicKey,
      {
        accounts: {
          raffle: rafflePda[0],
          raffleTreasury: raffleTreasuryPda[0],
          user: adminUser.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    )
    await handleTransaction(tx, connection, { showLogs: true })

    let raffleAccount = await program.account.raffle.fetch(rafflePda[0])

    console.log('raffleAccount', {
      ...raffleAccount,
      tickets: undefined,
    })

    await program.rpc.initRaffle(
      rafflePda[1],
      raffleTreasuryPda[1],
      raffleId,
      user.publicKey,
      new anchor.BN(42),
      new PublicKey('So11111111111111111111111111111111111111112'),
      raffleAccount.starts,
      raffleAccount.ends,
      10, // max tickets
      isWhitelistRaffle,
      3,
      Keypair.generate().publicKey,
      {
        accounts: {
          raffle: rafflePda[0],
          raffleTreasury: raffleTreasuryPda[0],
          user: adminUser.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    )
    await handleTransaction(tx, connection, { showLogs: true })

    raffleAccount = await program.account.raffle.fetch(rafflePda[0])

    console.log('raffleAccount', {
      ...raffleAccount, 
      tickets: undefined,
    })
  })

  it('buy ticket', async () => {
    console.log('before buy ticket');
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleIdForBuy)
    const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
    const raffleUserPda = await getRaffleUserPda(
      rafflePda[0],
      user.publicKey
    )

    // const userOwnedPayToken = await getOrCreateTestToken({
    //   connection,
    //   tokenOwner: user,
    //   mint: payToken.publicKey,
    // })

    // let userTokenAccount =
    //   await userOwnedPayToken.getOrCreateAssociatedAccountInfo(user.publicKey)

    // await userOwnedPayToken.mintTo(
    //   userTokenAccount.address,
    //   adminUser.publicKey,
    //   [adminUser],
    //   100
    // )

    let userTokenAccount = await payToken.getOrCreateAssociatedAccountInfo(user.publicKey)
    
    await payToken.mintTo(
      userTokenAccount.address,
      adminUser.publicKey,
      [adminUser], 
      1000
    )

    console.log('vault token starting to create');
  
    const vaultTokenAcccountPda = await spl.Token.getAssociatedTokenAddress(spl.ASSOCIATED_TOKEN_PROGRAM_ID, spl.TOKEN_PROGRAM_ID, payToken.publicKey, raffleTreasuryPda[0], true)

    console.log('vault token created', vaultTokenAcccountPda.toBase58());
    

    let tx = await program.rpc.buyTicketWithToken(
      raffleUserPda[1],
      2,
      new anchor.BN(300), // 300 lamports
      {
        accounts: {
          user: user.publicKey,
          raffle: rafflePda[0],
          raffleTreasury: raffleTreasuryPda[0],
          raffleUser: raffleUserPda[0],
          vaultMint: payToken.publicKey,
          vaultTokenAccount: vaultTokenAcccountPda,
          userTokenAccount: userTokenAccount.address,
          backendUser: backendSigner.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: spl.TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        },
        signers: [user, backendSigner],
        
      }
    )


    await handleTransaction(tx, connection, { showLogs: true })

    const raffle = await program.account.raffle.fetch(rafflePda[0])
    let raffleUser = await program.account.raffleUser.fetch(raffleUserPda[0])
    console.log('raffleUser', raffleUser)
    console.log('raffle', raffle, tx)
  })

  it('buy ticket with sol', async () => {
    console.log('before buy ticket with sol');
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleIdForBuy)
    const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
    const raffleUserPda = await getRaffleUserPda(
      rafflePda[0],
      user.publicKey
    )

    let tx = await program.rpc.buyTicketWithSol(
      raffleUserPda[1],
      2,
      new anchor.BN(0.03 * LAMPORTS_PER_SOL), // 300 lamports
      {
        accounts: {
          user: user.publicKey,
          raffle: rafflePda[0],
          raffleTreasury: raffleTreasuryPda[0],
          raffleUser: raffleUserPda[0],
          backendUser: backendSigner.publicKey,
          systemProgram: SystemProgram.programId
        },
        signers: [user, backendSigner],
        
      }
    )

    await handleTransaction(tx, connection, { showLogs: true })

    const raffle = await program.account.raffle.fetch(rafflePda[0])
    let raffleUser = await program.account.raffleUser.fetch(raffleUserPda[0])
    console.log('raffleUser', raffleUser)
    console.log('raffle', raffle, tx)
    
  })

  it('limit entries', async () => {
    console.log('before buy ticket with sol');
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleIdForBuy)
    const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
    const raffleUserPda = await getRaffleUserPda(
      rafflePda[0],
      user.publicKey
    )
    
    try {
      let tx = await program.rpc.buyTicketWithSol(
        raffleUserPda[1],
        20,
        new anchor.BN(0.01 * LAMPORTS_PER_SOL), // 300 lamports
        {
          accounts: {
            user: user.publicKey,
            raffle: rafflePda[0],
            raffleTreasury: raffleTreasuryPda[0],
            raffleUser: raffleUserPda[0],
            backendUser: backendSigner.publicKey,
            systemProgram: SystemProgram.programId
          },
          signers: [user, backendSigner],
          
        }
      )
  
      await handleTransaction(tx, connection, { showLogs: true })

      const raffle = await program.account.raffle.fetch(rafflePda[0])
      let raffleUser = await program.account.raffleUser.fetch(raffleUserPda[0])
      console.log('raffleUser', raffleUser)
      console.log('raffle', raffle, tx)
    } catch (err: any) {
      console.log('buying ticket with too many entries should throw errors');
      
      console.log('err', err)
      console.log(err.error.errorMessage);
      
    }

    

  })

  it('draw', async () => {
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleIdForBuy)
    const raffle = await program.account.raffle.fetch(rafflePda[0])


    console.log({
      nftMint: nftMint.publicKey.toBase58(),
      raffleMint: raffle.nftMint.toBase58()
    });
    
    const prizesTokenAccount = await nftMint.getOrCreateAssociatedAccountInfo(adminUser.publicKey)
    const winnerTokenAccount = await nftMint.getOrCreateAssociatedAccountInfo(user.publicKey)

    console.log('drawinggg');

    let tx = await program.rpc.draw([user.publicKey], false, {
      accounts: {
        user: adminUser.publicKey,
        raffle: rafflePda[0],
        backendUser: backendSigner.publicKey,
        mint: nftMint.publicKey,
        priceWalletSigner: adminUser.publicKey,
        pricesTokenAccount: prizesTokenAccount.address,
        receiverTokenAccount: winnerTokenAccount.address,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      signers: [adminUser, backendSigner],
    })

    await handleTransaction(tx, connection, { showLogs: true })

    console.log('successfully drawn winner', tx);
    const tokenAccountBalance = await connection.getTokenAccountBalance(winnerTokenAccount.address, 'recent')
    console.log('mint token account balance', tokenAccountBalance.value.uiAmount);
  })


  it('withdraw raffle funds', async () => {
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleIdForBuy)
    const raffleTreasuryPda = await getRaffleTreasuryPda(rafflePda[0])
    const raffle = await program.account.raffle.fetch(rafflePda[0])
    
    const vaultTokenAccount = await getTokenAccount({connection, mint: payToken.publicKey, user: raffleTreasuryPda[0]})
    const vaultTokenAcccountPda = await spl.Token.getAssociatedTokenAddress(spl.ASSOCIATED_TOKEN_PROGRAM_ID, spl.TOKEN_PROGRAM_ID, payToken.publicKey, raffleTreasuryPda[0], true)
    let userTokenAccount = await payToken.getOrCreateAssociatedAccountInfo(user.publicKey)
    let adminUserTokenAccount = await payToken.getOrCreateAssociatedAccountInfo(adminUser.publicKey)

    console.log('addresses', {
      vaultTokenAcccount: vaultTokenAccount!.pubkey.toBase58(),
      vaultTokenAcccountPda: vaultTokenAcccountPda.toBase58(),
      userTokenAccount: userTokenAccount.address.toBase58(),
      adminUserTokenAccount: adminUserTokenAccount.address.toBase58(),
    });

    const tokenAmount = vaultTokenAccount?.account.data.parsed.info.tokenAmount
    console.log('amount', tokenAmount);
    
    const payoutAmountNum = Math.round(Number(tokenAmount.amount) * 0.95)
    const payoutAmount = new BN(payoutAmountNum)
    const feeAmount = new BN(tokenAmount.amount).sub(payoutAmount)

    console.log({payoutAmount: payoutAmount.toNumber(), feeAmount: feeAmount.toNumber()});

    const sendTokenTx = await program.rpc.sendTokens(payoutAmount, feeAmount, {
      accounts: {
        raffle: rafflePda[0],
        raffleTreasury: raffleTreasuryPda[0],
        backendUser: backendSigner.publicKey,
        adminUser: adminUser.publicKey,
        vaultMint: payToken.publicKey,
        vaultTokenAccount: vaultTokenAccount!.pubkey,
        payoutTokenAccount: userTokenAccount.address,
        feeTokenAccount: adminUserTokenAccount.address,
        systemProgram: SystemProgram.programId,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,     
      },
      signers: [backendSigner, adminUser],
    })

    await handleTransaction(sendTokenTx, connection, { showLogs: true })

    console.log('sent token confirmed', sendTokenTx);


    const sendSolTx = await program.rpc.sendSol(new BN(0.05 * LAMPORTS_PER_SOL), new BN(0.01 * LAMPORTS_PER_SOL), {
      accounts: {
        raffle: rafflePda[0],
        raffleTreasury: raffleTreasuryPda[0],
        backendUser: backendSigner.publicKey,
        payoutUser: user.publicKey,
        feeUser: adminUser.publicKey,
        adminUser: adminUser.publicKey,
        systemProgram: SystemProgram.programId,    
      },
      signers: [backendSigner, adminUser],
    })

    await handleTransaction(sendSolTx, connection, { showLogs: true })


    console.log('sent sol confirmed', sendSolTx);
  })

  it('draw wl raffle', async () => {
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleIdForBuy)
    const raffle = await program.account.raffle.fetch(rafflePda[0])


    console.log({
      nftMint: nftMint.publicKey.toBase58(),
      raffleMint: raffle.nftMint.toBase58()
    });

    const prizesTokenAccount = await spl.Token.getAssociatedTokenAddress(
      spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      spl.TOKEN_PROGRAM_ID,
      nftMint.publicKey,
      adminUser.publicKey
    )

    const winnerTokenAccount = await spl.Token.getAssociatedTokenAddress(
      spl.ASSOCIATED_TOKEN_PROGRAM_ID,
      spl.TOKEN_PROGRAM_ID,
      nftMint.publicKey,
      adminUser.publicKey
    )

    console.log('drawinggg');

    let tx = await program.rpc.draw([user.publicKey, Keypair.generate().publicKey, Keypair.generate().publicKey], true, {
      accounts: {
        user: adminUser.publicKey,
        raffle: rafflePda[0],
        backendUser: backendSigner.publicKey,
        mint: nftMint.publicKey,
        priceWalletSigner: adminUser.publicKey,
        pricesTokenAccount: prizesTokenAccount,
        receiverTokenAccount: winnerTokenAccount,
        tokenProgram: spl.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      },
      signers: [adminUser, backendSigner],
    })

    await handleTransaction(tx, connection, { showLogs: true })

    console.log('successfully drawn winner', tx);
    
    const updatedRaffle = await program.account.raffle.fetch(rafflePda[0])
    console.log('updated raffle', updatedRaffle);
  })

  it.skip('raffle', async () => {
    const raffleId = 'First Raffle'
    const rafflePda = await getRafflePda(adminUser.publicKey, raffleId)

    let raffle = await program.account.raffle.fetch(rafflePda[0])

    const drawLotsRes = await drawLots({adminUser, id: raffleId, program, connection})
    console.log(drawLotsRes.raffleAccount, drawLotsRes.winnersWithDiscordId);
  })
})
