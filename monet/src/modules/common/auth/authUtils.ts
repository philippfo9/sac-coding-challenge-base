import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import * as nacl from 'tweetnacl'
import { connection } from '../../../config/config'
import { solanaAuthConfig } from './authConfig'

const MEMO_PROGRAM_ID = new PublicKey(
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
)

export const buildAuthTx = async (user: PublicKey) => {
  const blockhash = await connection.getLatestBlockhash()
  const tx = new Transaction({ feePayer: user, ...blockhash })
  tx.add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(solanaAuthConfig.signingMessage(user.toBase58()), 'utf8'),
    })
  )
  return tx
}

export const validateAuthTx = (tx: Transaction, user: PublicKey): boolean => {
  try {
    if (tx.feePayer?.toBase58() != user.toBase58()) return false
    const inx = tx.instructions[0]
    if (!inx.programId.equals(MEMO_PROGRAM_ID)) return false
    if (inx.data.toString() != solanaAuthConfig.signingMessage(user.toBase58())) return false
    if (!tx.verifySignatures()) return false
  } catch (e) {
    return false
  }
  return true
}

export function verifySignature(address: string, signature: number[], message: string) {
  const wallet = new PublicKey(address)
  const messageEncoded = new TextEncoder().encode(message)
  const res = nacl.sign.detached.verify(
    messageEncoded,
    Uint8Array.from(signature),
    wallet.toBytes()
  )

  return res
}
