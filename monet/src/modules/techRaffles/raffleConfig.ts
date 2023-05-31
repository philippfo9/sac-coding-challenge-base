import { AnchorProvider, Program, Provider, Wallet } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { Raffle } from '../../../../raffle-monet/target/types/raffle'
import { altBackendConnection, connection } from '../../config/config'

const provider = new AnchorProvider(connection, {} as any, {
  commitment: 'recent'
})

export const raffleIdl =
  require('../../../../raffle-monet/target/idl/raffle.json') as Raffle & {
    metadata: { address: string }
  }
export const raffleProgramId = new PublicKey(raffleIdl.metadata.address)

export const raffleProgram = new Program(
  raffleIdl,
  raffleProgramId,
  provider
)


export function getRaffleProgram(
  runAttempt?: number
) {
  const connectionToUse =
    runAttempt === 0
      ? connection
      : altBackendConnection

  console.log('using', connectionToUse.rpcEndpoint);
  

  const provider = new AnchorProvider(connectionToUse, {} as any, {
    commitment: 'recent',
  })
  const monetProgram = new Program(
    raffleIdl,
    raffleProgramId, 
    provider
  )
  return monetProgram
}
