import {
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'

import { TOKEN_METADATA_PROGRAM_ID } from './candyMachineIntern/candyMachineConstants'

let tmpCache: any = {}

export async function metadataAddress(mint: PublicKey): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
}

export const getTokenRecordPDA = (mint: PublicKey, tokenAccount: PublicKey) => {
  const [key, bump] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
      Buffer.from('token_record'),
      tokenAccount.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID,
  );

  return { key, bump };
};

export function createUpdateMetadataInstruction(
  metadataAccount: PublicKey,
  payer: PublicKey,
  txnData: Buffer
) {
  const keys = [
    {
      pubkey: metadataAccount,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: payer,
      isSigner: true,
      isWritable: false,
    },
  ]
  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data: txnData,
  })
}

export function signMetadataInstruction(
  metadata: PublicKey,
  creator: PublicKey
): TransactionInstruction {
  const data = Buffer.from([7])

  const keys = [
    {
      pubkey: metadata,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: creator,
      isSigner: true,
      isWritable: false,
    },
  ]
  return new TransactionInstruction({
    keys,
    programId: TOKEN_METADATA_PROGRAM_ID,
    data,
  })
}
