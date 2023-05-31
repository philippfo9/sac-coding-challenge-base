import asyncBatch from 'async-batch'
import { program } from 'commander'
import fs from 'fs'
import {
  addUserToProject,
  createProject,
  getTicketsSoldPerProject,
} from '../src/modules/techRaffles/services/ProjectService'
import {
  addBenefitingProjectToRaffle,
  addPurchaseTokenToRaffle,
  createRaffle,
  deleteOldInCreationRaffles,
  postDiscordEndingSoonRaffleAndUpdateStatus,
  postDiscordNewRaffleAndUpdateStatus,
  raffleDrawSelect,
} from '../src/modules/techRaffles/services/RaffleService'
import {
  addProdToken,
  createToken,
  getEstimatedTokenPriceInSolOrUndefined,
  getTokenMetaFromSolscan,
} from '../src/modules/techRaffles/services/TokenService'
import {
  getMECollectionByName,
  getMENFTByMintAddress,
} from '../src/modules/techRaffles/api/magicedenApi'
import { discordClient } from '../src/discordClient'
import {
  checkTwitterPfps,
  getOrCreateUser,
} from '../src/modules/techRaffles/services/UserService'
import prisma from '../src/lib/prisma'
import {
  getBirdEyeUsdcRate,
  getBirdEyeUsdcRates,
  getCoingeckoUsdcPrices,
  getJupiterUsdcRates,
  predefinedTokens,
} from '../src/utils/sacUtils'
import { checkAllEligableUsersForAllEligableProjects } from '../src/modules/techRaffles/services/HolderService'
import {
  createInitNFTRaffleInstruction,
  createInitWLRaffleInstruction,
} from '../src/modules/techRaffles/services/raffleOnChainService'
import { getOrCreateTestToken } from '../src/utils/splUtils'
import config, { connection, puffToken, solToken } from '../src/config/config'
import {
  getNftWithMetadataNew,
  getTokenAccount,
  handleTransaction,
  loadWallet,
  pub,
} from '../src/utils/solUtils'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { raffleProgram } from '../src/modules/techRaffles/raffleConfig'
import reattempt from 'reattempt'
import { addDays, addHours, isAfter, subHours } from 'date-fns'
import {
  finalizeOpenRaffles,
  getParticipantsForDraw,
  payoutRaffleFunds,
  finishRaffle,
  updateParticipantBuyingDataAfterRaffleEnd,
} from '../src/modules/techRaffles/services/withdrawService'
import {
  createAndUploadWinnerImageS3,
  createRaffleEndingSoonImage,
  createRaffleImage,
  createVerifiedCommunityImage,
  createWinnerImage,
} from '../src/utils/twitterImages'
import { getGuildIdFromDiscordLink } from '../src/modules/techRaffles/api/discordApi'
import {
  tweetEndingSoonRaffles,
  tweetNewlyStartedRaffles,
} from '../src/utils/twitterBotAutomation'
import { raffleDefaultSelect } from '../src/modules/techRaffles/services/selects/raffle'
import {
  getRaffleOnChainDataByDBId,
  getRaffleOnChainDataRetried,
  getRaffleUser,
} from '../src/modules/techRaffles/raffleOnChainUtils'
import { getPlatformStats } from '../src/modules/techRaffles/services/StatsService'
import { uploadImageToS3 } from '../src/utils/s3'
import { postDiscordEndingSoonRaffles } from '../src/utils/discordBotAutomation'
import { getHowRareIsMintInfo } from '../src/modules/techRaffles/api/howRareIsApi'
import { getCollectionByName } from '../src/modules/techRaffles/services/CollectionService'
import { addNFTAttributesFromAPI } from '../src/modules/techRaffles/services/AttributeService'

program.command('testSeed').action(async () => {
  const testUser = loadWallet(process.env.TEST_USER!)
  console.log(connection.rpcEndpoint)

  console.log('TEST_USER', testUser.publicKey.toBase58())

  const ADMIN_FOR_SAC_TEST_WALLETS = [
    '8rX36RARGJoHLLv419ZpiZRTrJbyuwrZFYrofUVjMR2Y',
    'PUFFgnKKhQ23vp8uSPwdzrUhEr7WpLmjM85NB1FQgpb',
    'HJfn3dESpmLf8csRmPqkWiHZccRXUpyiviDP9Yyt4Zpo',
    '3yYgG1hWRVRwrE9UNz2MJCBjmjyNobEBDochDA19zYP6',
    testUser.publicKey.toBase58(),
  ]

  const sacProject = await createProject({
    publicId: 'sac',
    fundsWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
    platformName: 'LuckyDip',
    communityName: 'Stoned Ape Crew',
    profilePictureUrl:
      'https://storage.monet.community/next-s3-uploads/0dec8df0-fa4a-4507-b79c-5eb510b3f684/l4Lw7mwO9FDH08Fi6BET.png',
    bannerUrl: 'https://www.stonedapecrew.com/images/main-hero/hero-large.png',
    twitterUserHandle: 'stonedapecrew',
    discordInviteLink: 'https://discord.gg/stonedapecrew',
    discordGuildId: '897158531193638913',
    magicEdenSlug: 'stoned_ape_crew',
    websiteUrl: 'https://www.stonedapecrew.com/',
    verified: true,
  })

  for (const wallet of ADMIN_FOR_SAC_TEST_WALLETS) {
    const user = await getOrCreateUser(wallet)
    await addUserToProject(user.id, sacProject.id, user.id, true)
  }

  await prisma.projectHolderDiscordRoles.create({
    data: {
      projectId: sacProject.id,
      roleId: '1027214073991016448',
      name: 'SAC Holder',
    },
  })

  const project2 = await createProject({
    publicId: 'degods',
    fundsWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
    platformName: 'DeGods Raffle Platform',
    communityName: 'DeGods',
    profilePictureUrl:
      'https://storage.monet.community/next-s3-uploads/0dec8df0-fa4a-4507-b79c-5eb510b3f684/l4Lw7mwO9FDH08Fi6BET.png',
    bannerUrl: 'https://www.stonedapecrew.com/images/main-hero/hero-large.png',
    verified: true,
  })
  await createProject({
    publicId: 'fff',
    fundsWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
    platformName: 'DeGods Raffle Platform',
    communityName: 'Bananana',
  })
  await createProject({
    publicId: 'bbb',
    fundsWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
    platformName: 'DeGods Raffle Platform',
    communityName: 'Apple Gang',
  })
  await createProject({
    publicId: 'ccc',
    fundsWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
    platformName: 'DeGods Raffle Platform',
    communityName: 'Juicy Jucer',
  })
  await createProject({
    publicId: 'ddd',
    fundsWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
    platformName: 'DeGods Raffle Platform',
    communityName: 'LordGang',
  })
  await createProject({
    publicId: 'ggg',
    fundsWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
    platformName: 'DeGods Raffle Platform',
    communityName: 'CREWCREW',
  })

  const solToken = await createToken({
    name: 'SOL',
    symbol: 'SOL',
    decimals: 9,
    address: 'So11111111111111111111111111111111111111112',
    isSPL: false,
    onDEX: true,
  })
  const puffToken = await createToken({
    name: 'Puff',
    symbol: 'PUFF',
    decimals: 9,
    lastUsdcPrice: 0.01,
    address: '5NsF4C2cM6Sa7jgM4nHGepwriG5p11y1akPYki1cNayx', // puff mainnet: G9tt98aYSznRk7jWsfuz9FnTdokxS6Brohdo9hSmjTRB
    isSPL: true,
    onDEX: true,
  })

  const dustToken = await createToken({
    name: 'DUST',
    symbol: 'DUST',
    decimals: 9,
    address: 'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ',
    isSPL: true,
    onDEX: true,
  })

  const usdcToken = await createToken({
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    isSPL: true,
    onDEX: true,
  })

  const nftMetadata = await getMENFTByMintAddress(
    '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U'
  )
  const rarityAttr = (
    await getHowRareIsMintInfo(
      nftMetadata.collection,
      '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U'
    )
  )?.attributes

  const stonedApeCollection = await getCollectionByName(nftMetadata.collection)

  //Create ended raffles
  {
    const start = new Date()
    start.setDate(start.getDate() - 10)
    const end = new Date()
    end.setDate(end.getDate() - 5)
    const user = await getOrCreateUser(ADMIN_FOR_SAC_TEST_WALLETS[0])
    let raffle = await createRaffle({
      isUserRaffle: true,
      payoutWallet: user.fundsWallet ?? user.wallet,
      hostWallet: user.fundsWallet ?? user.wallet,
      creatorUserId: user.id,
      collectionId: stonedApeCollection.name,
      raffleOnChainAddress: 'TESTENDED',
      name: 'ENDED Stoned Ape Crew #80',
      status: 'SCHEDULED',
      imageUrl:
        'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
      nftMint: '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U',
      starts: start,
      ends: end,
      ticketPrice: 25,
      ticketPriceTokenId: solToken.id,
    })
    const tokenIds = [solToken.id, puffToken.id, dustToken.id]
    await addPurchaseTokenToRaffle(
      raffle.id,
      ...tokenIds.map((id) => ({ tokenId: id }))
    )
    await addBenefitingProjectToRaffle(raffle.id, sacProject.id)
    await addNFTAttributesFromAPI(raffle.id, nftMetadata.attributes, rarityAttr)
    end.setDate(end.getDate() + 10)
    raffle = await createRaffle({
      isUserRaffle: true,
      payoutWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
      hostWallet: ADMIN_FOR_SAC_TEST_WALLETS[0],
      creatorUserId: (await getOrCreateUser(ADMIN_FOR_SAC_TEST_WALLETS[0])).id,
      collectionId: stonedApeCollection.name,
      raffleOnChainAddress: 'TESTUSER',
      name: 'User Stoned Ape Crew #80',
      status: 'SCHEDULED',
      imageUrl:
        'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
      nftMint: '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U',
      starts: new Date(),
      ends: end,
      ticketPrice: 25,
      ticketPriceTokenId: solToken.id,
    })
    await addPurchaseTokenToRaffle(
      raffle.id,
      ...tokenIds.map((id) => ({ tokenId: id }))
    )
    await addBenefitingProjectToRaffle(raffle.id, sacProject.id)
    await addNFTAttributesFromAPI(raffle.id, nftMetadata.attributes, rarityAttr)
  }

  const start = new Date()
  start.setDate(start.getDate() - 1)
  const end = new Date()
  end.setDate(end.getDate() + 2)
  end.setHours(end.getHours() + 24)
  let raffle = await createRaffle({
    creatorProjectId: sacProject.id,
    payoutWallet: sacProject.fundsWallet,
    hostWallet: sacProject.fundsWallet,
    raffleOnChainAddress: 'TEST',
    name: 'Stoned Ape Crew #80',
    status: 'SCHEDULED',
    imageUrl:
      'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
    nftMint: '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U',
    starts: start,
    ends: end,
    ticketPrice: 25,
    ticketPriceTokenId: solToken.id,
    collectionId: stonedApeCollection.name,
  })
  const tokenIds = [solToken.id, puffToken.id, dustToken.id]
  await addPurchaseTokenToRaffle(
    raffle.id,
    ...tokenIds.map((id) => ({ tokenId: id }))
  )
  await addNFTAttributesFromAPI(raffle.id, nftMetadata.attributes, rarityAttr)

  end.setDate(end.getDate() + 2)
  end.setHours(end.getHours() + 12)
  for (let i = 20; i < 30; i++) {
    raffle = await createRaffle({
      creatorProjectId: sacProject.id,
      payoutWallet: sacProject.fundsWallet,
      hostWallet: sacProject.fundsWallet,
      raffleOnChainAddress: 'TEST' + i,
      name: 'Stoned Ape Crew #' + i,
      status: 'SCHEDULED',
      imageUrl:
        'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
      nftMint: '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U',
      starts: start,
      ends: end,
      ticketPrice: 25,
      ticketPriceTokenId: puffToken.id,
      collectionId: stonedApeCollection.name,
    })
    const tokenIds = [solToken.id, puffToken.id, dustToken.id]
    await addPurchaseTokenToRaffle(
      raffle.id,
      ...tokenIds.map((id) => ({ tokenId: id }))
    )
    await addNFTAttributesFromAPI(raffle.id, nftMetadata.attributes, rarityAttr)
  }
  for (let i = 200; i < 400; i++) {
    raffle = await createRaffle({
      payoutWallet: project2.fundsWallet,
      hostWallet: project2.fundsWallet,
      creatorProjectId: project2.id,
      raffleOnChainAddress: 'TEST' + i,
      name: 'Stoned Ape Crew #' + i,
      status: 'SCHEDULED',
      imageUrl:
        'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
      nftMint: '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U',
      starts: start,
      ends: end,
      maxTickets: 100,
      ticketPrice: 25,
      ticketPriceTokenId: solToken.id,
      collectionId: stonedApeCollection.name,
    })

    await addPurchaseTokenToRaffle(raffle.id, { tokenId: dustToken.id })
    await addNFTAttributesFromAPI(raffle.id, nftMetadata.attributes, rarityAttr)
  }

  end.setDate(end.getDate() + 2)
  end.setHours(end.getHours() + 12)
  raffle = await createRaffle({
    payoutWallet: sacProject.fundsWallet,
    hostWallet: sacProject.fundsWallet,
    creatorProjectId: sacProject.id,
    name: 'PEEPL Whitelist',
    status: 'SCHEDULED',
    imageUrl:
      'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
    starts: start,
    ends: end,
    ticketPrice: 25,
    ticketPriceTokenId: solToken.id,
    type: 'WHITELIST',
    wlSpots: 10,
    wlProjectDiscordLink: 'https://discord.gg',
    wlProjectTwitterLink: 'https://twitter.com/stonedapecrew',
    wlProjectWebsiteLink: 'https://stonedapecrew.com',
  })
  await addPurchaseTokenToRaffle(
    raffle.id,
    ...tokenIds.map((id) => ({ tokenId: id }))
  )
  await addNFTAttributesFromAPI(raffle.id, nftMetadata.attributes, rarityAttr)

  start.setDate(start.getDate() + 4)
  end.setDate(end.getDate() + 12)
  end.setHours(end.getHours() + 24)
  raffle = await createRaffle({
    creatorProjectId: sacProject.id,
    payoutWallet: sacProject.fundsWallet,
    hostWallet: sacProject.fundsWallet,
    raffleOnChainAddress: 'TEST3',
    name: 'Stoned Ape Crew #109',
    status: 'SCHEDULED',
    imageUrl:
      'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
    nftMint: '2EQ68mmmBw5gRYeWdMXbkTV2wsscWwy62gpDMb5YZr7U',
    starts: start,
    ends: end,
    ticketPrice: 25,
    ticketPriceTokenId: solToken.id,
    holdersOnly: true,
    collectionId: stonedApeCollection.name,
  })

  await addPurchaseTokenToRaffle(raffle.id, { tokenId: puffToken.id })
  await addNFTAttributesFromAPI(raffle.id, nftMetadata.attributes, rarityAttr)

  // create raffle and create on-chain raffle

  const backendUser = loadWallet(process.env.MONET_WALLET!)
  const prizesWallet = loadWallet(process.env.MONET_PRIZES_WALLET!)

  console.log(
    backendUser.publicKey.toBase58(),
    prizesWallet.publicKey.toBase58()
  )

  const nftMint = await getOrCreateTestToken({
    connection,
    tokenOwner: backendUser,
  })

  let nftMintTokenAccount = await nftMint.getOrCreateAssociatedAccountInfo(
    prizesWallet.publicKey
  )

  await nftMint.mintTo(
    nftMintTokenAccount.address,
    backendUser.publicKey,
    [backendUser],
    1
  )

  const nftRaffle = await createRaffle({
    creatorProjectId: sacProject.id,
    payoutWallet: sacProject.fundsWallet,
    hostWallet: testUser.publicKey.toBase58(),
    name: 'Stoned Ape Crew #109',
    status: 'SCHEDULED',
    imageUrl:
      'https://povv3ilq726sjszynqeowsczvvkbkh3547dcclu2qa7giqlingjq.arweave.net/e6tdoXD-vSTLOGwI60hZrVQVH33nxiEumoA-ZEFoaZM?ext=png',
    nftMint: nftMint.publicKey.toBase58(),
    starts: new Date(),
    ends: addDays(new Date(), 1),
    ticketPrice: 0.1,
    ticketPriceTokenId: solToken.id,
    holdersOnly: true,
    collectionId: stonedApeCollection.name,
  })

  await addPurchaseTokenToRaffle(
    nftRaffle.id,
    { tokenId: puffToken.id },
    { tokenId: solToken.id }
  )
  await addNFTAttributesFromAPI(
    nftRaffle.id,
    nftMetadata.attributes,
    rarityAttr
  )

  const { initRaffleInstr, rafflePda } = await createInitNFTRaffleInstruction(
    nftRaffle,
    testUser.publicKey,
    nftMint.publicKey
  )
  const blockhash = await connection.getLatestBlockhash()
  const transaction = new Transaction({
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
    feePayer: testUser.publicKey,
  }).add(initRaffleInstr)

  transaction.partialSign(testUser, backendUser)

  const tx = await reattempt.run({ times: 6, delay: 5000 }, async () => {
    return await connection.sendTransaction(transaction, [
      testUser,
      backendUser,
    ])
  })

  await handleTransaction(tx, { showLogs: true, commitment: 'confirmed' })

  const raffleAccount = await raffleProgram.account.raffle.fetch(rafflePda[0])
  console.log('on chain raffle', raffleAccount)

  await prisma.raffle.update({
    data: {
      raffleOnChainAddress: rafflePda[0].toBase58(),
    },
    where: {
      id: nftRaffle.id,
    },
  })

  // create wl raffle and create on-chain raffle
  const wlRaffle = await createRaffle({
    payoutWallet: sacProject.fundsWallet,
    hostWallet: testUser.publicKey.toBase58(),
    creatorProjectId: sacProject.id,
    name: 'PEEPL Whitelist',
    status: 'SCHEDULED',
    imageUrl:
      'https://pbs.twimg.com/profile_images/1576201443555610624/fpRrhKpP_400x400.jpg',
    starts: new Date(),
    ends: addDays(new Date(), 2),
    ticketPrice: 0.04,
    ticketPriceTokenId: solToken.id,
    type: 'WHITELIST',
    wlSpots: 2,
    maxTickets: 5,
    wlProjectDiscordLink: 'https://discord.gg',
    wlProjectTwitterLink: 'https://twitter.com/stonedapecrew',
    wlProjectWebsiteLink: 'https://stonedapecrew.com',
  })
  await addPurchaseTokenToRaffle(
    wlRaffle.id,
    { tokenId: puffToken.id },
    { tokenId: solToken.id }
  )

  const { initRaffleInstr: initWLRaffleInstr, rafflePda: wlRafflePda } =
    await createInitWLRaffleInstruction(wlRaffle, testUser.publicKey)
  const wlRaffleBlockhash = await connection.getLatestBlockhash()
  const wlRaffleTransaction = new Transaction({
    blockhash: wlRaffleBlockhash.blockhash,
    lastValidBlockHeight: wlRaffleBlockhash.lastValidBlockHeight,
    feePayer: testUser.publicKey,
  }).add(initWLRaffleInstr)

  transaction.partialSign(testUser, backendUser)

  const wlRaffleTx = await reattempt.run(
    { times: 6, delay: 5000 },
    async () => {
      return await connection.sendTransaction(wlRaffleTransaction, [
        testUser,
        backendUser,
      ])
    }
  )

  await handleTransaction(wlRaffleTx, {
    showLogs: true,
    commitment: 'confirmed',
  })

  const wlRaffleAccount = await raffleProgram.account.raffle.fetch(
    wlRafflePda[0]
  )
  console.log('on chain wl raffle', wlRaffleAccount)

  await prisma.raffle.update({
    data: {
      raffleOnChainAddress: wlRafflePda[0].toBase58(),
    },
    where: {
      id: wlRaffle.id,
    },
  })
})

program.parse(process.argv)
