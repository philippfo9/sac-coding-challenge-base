import {
  BlockhashWithExpiryBlockHeight,
  Commitment,
  ComputeBudgetProgram,
  Connection,
  Keypair,
  PublicKey,
  Signer,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'
import { web3 } from '@project-serum/anchor'
import * as spl from '@solana/spl-token'
import { Metadata } from '@metaplex/js'
import axios from 'axios'
import config, { connection, getBaseUrl } from '../config/config'
import { NftMetadata } from './nftmetaData.type'
import asyncBatch from 'async-batch'
import { ParsedTokenAccount } from './types'
import * as fs from 'fs'
import reattempt from 'reattempt'
import saveAs from 'file-saver'
import _ from 'lodash'
import assert from 'assert'

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

export async function getOrCreateAssociatedTokenAddressInstruction(
  mint: PublicKey,
  owner: PublicKey,
  connection: anchor.web3.Connection,
  payer?: PublicKey,
  allowOwnerOffCurve?: boolean
) {
  const address = await getAssociatedTokenAddress(mint, owner, true)

  const tokenAccount = await connection.getAccountInfo(address)

  console.log('token account exists', tokenAccount)

  let instructions: web3.TransactionInstruction[] = []
  if (!tokenAccount) {
    instructions.push(
      spl.Token.createAssociatedTokenAccountInstruction(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        mint,
        address,
        owner,
        payer ?? owner
      )
    )
  }

  return {
    address,
    instructions,
  }
}

export function increaseComputeUnitInstruction() {
  return ComputeBudgetProgram.setComputeUnitLimit({
    units: 300000,
  })
}

export async function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false
) {
  return await spl.Token.getAssociatedTokenAddress(
    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    spl.TOKEN_PROGRAM_ID,
    mint,
    owner,
    allowOwnerOffCurve
  )
}

export async function getTokenAccount(
  connection: Connection,
  mint: PublicKey,
  user: PublicKey,
  includeEmpty?: boolean
) {
  const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(
    user,
    {
      mint: mint,
    }
  )

  if (userTokenAccounts.value.length === 0) return null
  return (userTokenAccounts.value.find(
    (t) => includeEmpty || t.account.data.parsed.info.tokenAmount.uiAmount
  ) ?? userTokenAccounts.value[0]) as ParsedTokenAccount
}

export async function getTokenAccountAdressOrCreateTokenAccountInstruction({
  connection,
  mint,
  user,
  payer,
}: {
  connection: Connection
  mint: PublicKey
  user: PublicKey
  payer?: PublicKey
}) {
  const userTokenAccount = await getTokenAccount(connection, mint, user)

  if (userTokenAccount)
    return {
      address: userTokenAccount.pubkey,
      instructions: [],
    }

  return await getOrCreateAssociatedTokenAddressInstruction(
    mint,
    user,
    connection,
    payer
  )
}

export async function getNftWithMetadata({
  mint,
  _metadata,
  noProxy,
}: {
  mint: PublicKey
  _metadata?: Metadata
  noProxy?: boolean
}) {
  const chainMetadata =
    _metadata ??
    (await (async () => {
      let [pda] = await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          new anchor.web3.PublicKey(mint).toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )

      const accountInfo: any = await connection.getParsedAccountInfo(pda)

      return new Metadata(mint.toString(), accountInfo.value)
    })())

  const baseUrl = getBaseUrl()

  const metadataRes = !noProxy
    ? await axios.get(baseUrl + '/api/prox', {
        params: {
          uri: chainMetadata.data.data.uri,
        },
      })
    : await axios.get(chainMetadata.data.data.uri)

  /*  let uri = chainMetadata.data.data.uri.replace(
    'https://ipfs.io',
    'https://cloudflare-ipfs.com'
  )

  const metadataRes = await axios.get(uri) */

  return { ...chainMetadata, ...metadataRes.data } as NftMetadata
}

export async function getNftWithOnChainMetadata(mint: PublicKey) {
  const pda = await Metadata.getPDA(mint)
  const chainMetadata = await Metadata.load(connection, pda)

  return chainMetadata
}

/* export async function getAllNftsWithMetadataByOwner(connection: Connection, owner: PublicKey) {
  const metaplex = new Metaplex(connection)
  const nftsOrMetadatas = await metaplex.nfts().findAllByOwner({owner})
  const allNfts = await Promise.all(nftsOrMetadatas.map(async metadata => {
    if (metadata.jsonLoaded) return metadata
    const nft = await metaplex.nfts().load({ metadata: metadata as any, loadJsonMetadata: true });
    return nft
  }))
  return allNfts.filter(nft => !!nft.name)
} */

export async function getNftFromMetadata(metadata: Metadata) {
  try {
    const dataRes = false
      ? await axios.get(getBaseUrl() + '/api/prox', {
          params: {
            uri: metadata.data.data.uri,
          },
        })
      : await axios.get(metadata.data.data.uri)

    if (dataRes.status !== 200) return null
    return {
      ...dataRes.data,
      ...metadata,
      pubkey: new PublicKey(metadata.data.mint),
    } as NftMetadata
  } catch (e) {
    console.error('error in fetching Meta', e)
    return null
  }
}

export async function getNftWithMetadataNew(mint: PublicKey) {
  const chainMetadata = await Metadata.load(
    connection,
    await Metadata.getPDA(mint)
  )

  const metadataRes = await axios.get(chainMetadata.data.data.uri)

  return { ...chainMetadata, ...metadataRes.data } as NftMetadata
}

export function downloadURI(uri: any, name: any) {
  try {
    saveAs(uri, name)
  } catch (err) {
    window.open(uri, '_blank')
  }
}

export function isValidPubKey(it?: string): boolean {
  try {
    return !!it && PublicKey.isOnCurve(new PublicKey(it))
  } catch {
    return false
  }
}

export function handleTransactionError(e: any) {
  console.log('Error in transaction', e, e.msg, e.code, e.logs)

  const logLineWithAnchorError: string | undefined =
    e.logs && e.logs.find((log: string) => log.includes('AnchorError'))

  console.log({ logLineWithAnchorError })

  if (logLineWithAnchorError) {
    const logLineSplitted = logLineWithAnchorError.split('Error Message: ')
    const message = logLineSplitted[logLineSplitted.length - 1]
    if (message) {
      console.log('got anchor error message: ', message)
      return message.trim()
    }
  }
}

export async function handleTransaction(
  tx: string,
  opts: {
    showLogs: boolean
    commitment: Commitment
    blockhash?: BlockhashWithExpiryBlockHeight
  } = {
    showLogs: false,
    commitment: 'confirmed',
  }
) {
  await reattempt.run({ times: 6, delay: 1100 }, async () => {
    if (opts.blockhash) {
      const res = await connection.confirmTransaction({
        signature: tx,
        ...opts.blockhash,
      })
      console.log('confirm tx, err', res.value.err?.toString())
    } else {
      const res = await connection.confirmTransaction(tx)
      console.log('confirm tx, err', res.value.err?.toString())
    }
  })

  const trans = await connection.getTransaction(tx)

  if (!trans) {
    console.log('transaction not found', tx)

    return tx
  }

  if (opts?.showLogs) {
    console.log('trans logs', trans?.meta?.logMessages)
  }

  console.log('confirmed tx', tx)

  return tx
}

export async function getNftMetadatasForOwnerBatched({
  connection,
  ownerAddress,
}: {
  connection: anchor.web3.Connection
  ownerAddress: anchor.web3.PublicKey
}) {
  console.log({ owner: ownerAddress.toBase58() })

  let tokenAccounts = (
    await connection.getParsedTokenAccountsByOwner(ownerAddress, {
      programId: spl.TOKEN_PROGRAM_ID,
    })
  ).value

  tokenAccounts = tokenAccounts.filter((tokenAccount) => {
    const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount

    return tokenAmount.amount == '1' && tokenAmount.decimals == '0'
  })

  const tokenAccountBatches = _.chunk(tokenAccounts, 100)

  let metadatas: (anchor.web3.ParsedAccountData | Buffer)[] = []
  await asyncBatch(
    tokenAccountBatches,
    async (tokenAccounts) => {
      const metas = await connection.getMultipleParsedAccounts(
        await Promise.all(
          tokenAccounts.map(async (tokenAccount) => {
            const pda = await Metadata.getPDA(
              new anchor.web3.PublicKey(
                tokenAccount.account.data.parsed.info.mint
              )
            )
            return pda
          })
        )
      )
      if (metas.value) metadatas.push(...(metas.value as any))
    },
    2
  )

  const allMetadatas = (
    await asyncBatch(
      metadatas,
      async (metadata, index, workerIndex) => {
        const accountInfo: any = metadata as any
        /* await connection.getParsedAccountInfo(pda) */

        try {
          const metadata = new Metadata(ownerAddress.toString(), accountInfo)
          return metadata
        } catch (e) {
          console.log('error in getting metadata', e)
          return null
        }
      },
      2
    )
  ).filter((m) => !!m) as Metadata[]

  return allMetadatas
}

export async function getNFTsForOwnerBatched({
  connection,
  ownerAddress,
}: {
  connection: anchor.web3.Connection
  ownerAddress: anchor.web3.PublicKey
}) {
  let tokenAccounts = (
    await connection.getParsedTokenAccountsByOwner(ownerAddress, {
      programId: spl.TOKEN_PROGRAM_ID,
    })
  ).value

  tokenAccounts = tokenAccounts.filter((tokenAccount) => {
    const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount

    return tokenAmount.amount == '1' && tokenAmount.decimals == '0'
  })

  const tokenAccountBatches = _.chunk(tokenAccounts, 100)

  let metadatas: (anchor.web3.ParsedAccountData | Buffer)[] = []
  await asyncBatch(
    tokenAccountBatches,
    async (tokenAccounts) => {
      const metas = await connection.getMultipleParsedAccounts(
        await Promise.all(
          tokenAccounts.map(async (tokenAccount) => {
            const pda = await Metadata.getPDA(
              new anchor.web3.PublicKey(
                tokenAccount.account.data.parsed.info.mint
              )
            )
            return pda
          })
        )
      )
      console.log(metas.value[0]?.data)
      if (metas.value) metadatas.push(...(metas.value as any))
    },
    2
  )

  const nfts = (
    await asyncBatch(
      metadatas,
      async (metadata, index, workerIndex) => {
        /*  let [pda] = await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            new anchor.web3.PublicKey(
              tokenAccount.account.data.parsed.info.mint
            ).toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        ) */

        const accountInfo: any = metadata as any
        /* await connection.getParsedAccountInfo(pda) */

        try {
          const metadata = new Metadata(ownerAddress.toString(), accountInfo)

          const dataRes = false
            ? await axios.get(getBaseUrl() + '/api/prox', {
                params: {
                  uri: metadata.data.data.uri,
                },
              })
            : await axios.get(metadata.data.data.uri)

          if (dataRes.status !== 200) return false
          return {
            ...dataRes.data,
            ...metadata,
            pubkey: new PublicKey(metadata.data.mint),
          } as NftMetadata
        } catch (e) {
          console.error('error in fetching Meta', e)
          return null
        }
      },
      2
    )
  ).filter((n) => !!n) as NftMetadata[]

  return nfts
}
/* export async function getNFTsForOwnerV2({
  connection,
  ownerAddress
}: {
  connection: anchor.web3.Connection
  ownerAddress: anchor.web3.PublicKey
}) {
  try {
    const nfts = await getAllNftsWithMetadataByOwner(connection, ownerAddress)
    
    return nfts
  } catch (e) {
    console.log('error in new method', e)
  }
} */

export async function getNFTsForOwner({
  connection,
  ownerAddress,
}: {
  connection: anchor.web3.Connection
  ownerAddress: anchor.web3.PublicKey
}) {
  let tokenAccounts = (
    await connection.getParsedTokenAccountsByOwner(ownerAddress, {
      programId: spl.TOKEN_PROGRAM_ID,
    })
  ).value

  tokenAccounts = tokenAccounts.filter((tokenAccount) => {
    const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount

    console.log(
      'tokenaccount',
      tokenAccount.account.data,
      tokenAccount.account.data.parsed
    )

    return tokenAmount.amount == '1' && tokenAmount.decimals == '0'
  })

  return (
    await asyncBatch(
      tokenAccounts,
      async (tokenAccount, index, workerIndex) => {
        return await getNftWithMetadataNew(
          new anchor.web3.PublicKey(tokenAccount.account.data.parsed.info.mint)
        )
      },
      3
    )
  ).filter((n) => !!n)
}

export async function getMetadata(nft: PublicKey) {
  return await Metadata.load(connection, await Metadata.getPDA(nft))
}

export function pub(pubkey: string) {
  return new PublicKey(pubkey)
}

export function getSolAdressFromText(tweet: string) {
  const adresses = tweet.match(/(\b[a-zA-Z0-9]{32,44}\b)/g)
  return adresses && adresses?.length > 0 ? adresses[0] : null
}

export function loadWallet(data: string) {
  return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(data)))
}

export function loadWalletFromFile(path: string) {
  if (!fs.existsSync(path)) throw new Error(`file ${path} does not exist`)
  return loadWallet(fs.readFileSync(path, 'utf-8'))
}

export async function sendTransaction(args: {
  instructions: TransactionInstruction[]
  signers: Signer[]
  feePayer?: PublicKey
  log?: boolean
}) {
  const blockHash = await getLatestBlockhash()
  const transaction = new Transaction({
    recentBlockhash: blockHash.blockhash,
    feePayer: args.feePayer,
  }).add(...args.instructions)

  await transaction.sign(...args.signers)

  const tx = await connection.sendRawTransaction(
    transaction.serialize({ verifySignatures: false })
  )
  if (args.log) console.log(`sent transaction ${tx}`)

  return tx
}

export async function getLatestBlockhash() {
  // return connection.getRecentBlockhash()
  return await ((connection as any).getLatestBlockhashAndContext
    ? connection.getLatestBlockhash()
    : connection.getRecentBlockhash())
}

export async function sendAndConfirmTransaction(args: {
  instructions: TransactionInstruction[]
  signers: Signer[]
  feePayer?: PublicKey
  commitment?: Commitment
  log?: boolean
}) {
  const { commitment = 'confirmed', log = false } = args
  const tx = await sendTransaction(args)

  await reattempt.run({ times: 3 }, async () => {
    await connection.confirmTransaction(tx, commitment)
  })

  if (log) console.log(`confirmed transaction ${tx}`)

  return tx
}

export function getSolscanTxLink(tx: string) {
  return `https://solscan.io/tx/${tx}?cluster=${config.solanaEnv}`
}

export const sendAndHandleTx = async (
  conn: Connection,
  tx: Transaction | VersionedTransaction,
  blockhashData: Awaited<ReturnType<Connection['getLatestBlockhash']>>,
  printTxId: boolean
) => {
  const serializedTx = tx.serialize()

  const sig = await reattempt.run({ times: 3, delay: 1500 }, async () => {
    return conn.sendRawTransaction(serializedTx, {
      skipPreflight: true,
    })
  })

  const confirmedSig = await handleTransaction(sig, {
    blockhash: blockhashData,
    commitment: 'recent',
    showLogs: printTxId,
  })

  const res = await conn.confirmTransaction(
    {
      signature: sig,
      blockhash: blockhashData.blockhash,
      lastValidBlockHeight: blockhashData.lastValidBlockHeight,
    },
    'processed'
  )

  return {confirmedSig, res}
}
