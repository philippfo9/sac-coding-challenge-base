import Bundlr from '@bundlr-network/client'
import { Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js'
import config, { configPerEnv } from '../config/config'
import { loadWallet } from './solUtils'

export function getBundlr(payer: Keypair) {
  return new Bundlr('https://node1.bundlr.network', 'solana', payer.secretKey, {
    timeout: 60000,
    providerUrl: configPerEnv.production.rpcHost,
  })
}

export async function upload(args: { payer?: Keypair; data: Buffer }) {
  const defaultPayer = process.env.DEV_WALLET
    ? loadWallet(process.env.DEV_WALLET!)
    : undefined

  const bundlr = getBundlr(args.payer ?? defaultPayer!)

  const balance = await bundlr.getLoadedBalance()

  const size = args.data.byteLength

  const cost = await bundlr.utils.getPrice('solana', size)

  const needed = cost.minus(balance)
  if (needed.gt(0)) {
    console.log(`funding ${needed.toString()} Sol`)

    await bundlr.fund(size * 10)
  }

  const res = await bundlr.uploader.upload(args.data)

  return {
    link: `https://arweave.net/${res.data.id}`,
    identifier: res.data.id,
  }
}
