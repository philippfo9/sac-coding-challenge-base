import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Metaplex } from '@metaplex-foundation/js'
import {
  Keypair,
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
} from '@solana/web3.js'
import { connection } from '../config/config'
import { PROGRAM_ID as AUTHORIZATION_RULES_PROGRAM_ID } from '@metaplex-foundation/mpl-token-auth-rules'
import {
  AssetData,
  createCreateInstruction,
  CreateInstructionAccounts,
  CreateInstructionArgs,
  createMintInstruction,
  createTransferInstruction,
  Metadata,
  MintInstructionAccounts,
  MintInstructionArgs,
  TokenRecord,
  TokenStandard,
  TokenState,
  TransferInstructionAccounts,
  TransferInstructionArgs,
} from '@metaplex-foundation/mpl-token-metadata'
import { getAssociatedTokenAddress, sendAndHandleTx } from './solUtils'
import { getTokenRecordPDA, metadataAddress } from './nftUtils'
import { TOKEN_METADATA_PROGRAM_ID } from './candyMachineIntern/candyMachineConstants'
import { getMasterEdition } from './candyMachineIntern/candyMachineHelpers'

export async function transferProgrammableNft({
  amount = 1,
  ...req
}: {
  // SOL address.
  source: PublicKey
  destination: PublicKey
  mint: PublicKey
  amount?: number
  decimals?: number
}) {
  const metaplexInstance = new Metaplex(connection)
  const { mint, destination: destinationOwner } = req

  const sourcePubKey = req.source
  const sourceAta = await getAssociatedTokenAddress(mint, sourcePubKey)
  const destinationAta = await getAssociatedTokenAddress(mint, destinationOwner)

  const ownerTokenRecord = await tokenRecordAddress(mint, sourceAta)

  // we need to check whether the token is lock or listed

  const tokenRecord = await TokenRecord.fromAccountAddress(
    connection,
    ownerTokenRecord
  )

  if (tokenRecord.state == TokenState.Locked) {
    throw new Error('token account is locked')
  } else if (tokenRecord.state == TokenState.Listed) {
    throw new Error('token is listed')
  }

  // we need the metadata object to retrieve the programmable config

  const metadataPda = await metaplexInstance.nfts().pdas().metadata({ mint })
  const metadata = await Metadata.fromAccountAddress(connection, metadataPda)

  let authorizationRules: PublicKey | undefined

  if (metadata.programmableConfig) {
    authorizationRules = metadata.programmableConfig.ruleSet ?? undefined
  }

  const transferAcccounts: TransferInstructionAccounts = {
    authority: sourcePubKey,
    tokenOwner: sourcePubKey,
    token: sourceAta,
    metadata: metadataPda,
    mint,
    edition: await getMasterEdition(mint),
    destinationOwner,
    destination: destinationAta,
    payer: sourcePubKey,
    splTokenProgram: TOKEN_PROGRAM_ID,
    splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    authorizationRules,
    authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM,
    ownerTokenRecord,
    destinationTokenRecord: await tokenRecordAddress(mint, destinationAta),
  }

  const transferArgs: TransferInstructionArgs = {
    transferArgs: {
      __kind: 'V1',
      amount,
      authorizationData: null,
    },
  }

  const transferIx = createTransferInstruction(transferAcccounts, transferArgs)

  return [transferIx]
}

export const AUTHORIZATION_RULES_PROGRAM = new PublicKey(
  'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg'
)

export async function tokenRecordAddress(
  mint: PublicKey,
  token: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('token_record'),
        token.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0]
}

export async function isProgrammableNftToken(
  mintAddress: string
) {
  try {
    const metadata = await Metadata.fromAccountAddress(
      connection,
      await metadataAddress(new PublicKey(mintAddress))
    )

    console.log('fetched token standard', metadata.tokenStandard?.toString())

    return {
      metdata: metadata,
      isProgrammableNFT:
        metadata.tokenStandard == TokenStandard.ProgrammableNonFungible,
    }
  } catch (error) {
    // most likely this happens if the metadata account does not exist
    console.log(error)
    return { metadata: null, isProgrammableNFT: false }
  }
}



const createNewMip1MintTransaction = (
  payer: Keypair,
  mintKeypair: Keypair,
  ruleSet?: PublicKey
) => {
  const metaplexInstance = new Metaplex(connection)

  
  //metadata account associated with mint
  const metadataPDA = metaplexInstance
    .nfts()
    .pdas()
    .metadata({ mint: mintKeypair.publicKey })
  const masterEditionPDA = metaplexInstance
    .nfts()
    .pdas()
    .masterEdition({ mint: mintKeypair.publicKey })

  const data: AssetData = {
    name: 'ProgrammableNonFungible',
    symbol: 'PNF',
    uri: 'uri',
    sellerFeeBasisPoints: 150,
    creators: [
      {
        address: payer.publicKey,
        share: 100,
        verified: true,
      },
    ],
    primarySaleHappened: false,
    isMutable: true,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    collection: null,
    uses: null,
    collectionDetails: null,
    ruleSet: ruleSet ?? null,
  }

  const createArgs: CreateInstructionArgs = {
    createArgs: {
      __kind: 'V1',
      assetData: data,
      decimals: 0,
      printSupply: { __kind: 'Zero' },
    },
  }
  const accounts: CreateInstructionAccounts = {
    metadata: metadataPDA,
    masterEdition: masterEditionPDA,
    mint: mintKeypair.publicKey,
    authority: payer.publicKey,
    payer: payer.publicKey,
    splTokenProgram: TOKEN_PROGRAM_ID,
    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    updateAuthority: payer.publicKey,
  }

  const createIx = createCreateInstruction(accounts, createArgs)
  // this test always initializes the mint, we we need to set the
  // account to be writable and a signer
  for (let i = 0; i < createIx.keys.length; i++) {
    if (createIx.keys[i].pubkey.equals(mintKeypair.publicKey)) {
      createIx.keys[i].isSigner = true
      createIx.keys[i].isWritable = true
    }
  }

  const createNewTokenTransaction = new Transaction().add(createIx)

  return createNewTokenTransaction
}

export const createProgrammableNft = async (
  authorityAndPayer: Keypair,
  recipient: PublicKey,
  ruleSet?: PublicKey
) => {
  const metaplexInstance = new Metaplex(connection)
  const mintKeypair = Keypair.generate()
  const targetTokenAccount = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    recipient
  )
  const metadataPDA = metaplexInstance
    .nfts()
    .pdas()
    .metadata({ mint: mintKeypair.publicKey })
  const masterEditionPDA = metaplexInstance
    .nfts()
    .pdas()
    .masterEdition({ mint: mintKeypair.publicKey })

  const tx = createNewMip1MintTransaction(
    authorityAndPayer,
    mintKeypair,
    ruleSet
  )
  const mintIxAccounts: MintInstructionAccounts = {
    token: targetTokenAccount,
    tokenOwner: recipient,
    mint: mintKeypair.publicKey,
    metadata: metadataPDA,
    masterEdition: masterEditionPDA,
    payer: authorityAndPayer.publicKey,
    authority: authorityAndPayer.publicKey,
    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    splTokenProgram: TOKEN_PROGRAM_ID,
    splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    authorizationRulesProgram: AUTHORIZATION_RULES_PROGRAM_ID,
    authorizationRules: ruleSet,
    tokenRecord: getTokenRecordPDA(mintKeypair.publicKey, targetTokenAccount)
      .key,
  }
  const mintIxArgs: MintInstructionArgs = {
    mintArgs: { __kind: 'V1', amount: 1, authorizationData: null },
  }
  tx.add(createMintInstruction(mintIxAccounts, mintIxArgs))

  const blockhashData = await connection.getLatestBlockhash()
  tx.recentBlockhash = blockhashData.blockhash
  tx.feePayer = authorityAndPayer.publicKey
  tx.partialSign(authorityAndPayer, mintKeypair)

  await sendAndHandleTx(connection, tx, blockhashData, false)

  return {
    mintAddress: mintKeypair.publicKey,
    metadataAddress: metadataPDA,
    masterEditionAddress: masterEditionPDA,
    tokenAddress: targetTokenAccount,
  }
}
