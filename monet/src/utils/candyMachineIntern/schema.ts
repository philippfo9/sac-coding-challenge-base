import { BinaryReader, BinaryWriter, deserializeUnchecked } from 'borsh'
import base58 from 'bs58'
import { PublicKey } from '@solana/web3.js'
type StringPublicKey = string

import { BN } from '@project-serum/anchor'
import {
  Collection,
  DataV2,
  Uses,
} from '@metaplex-foundation/mpl-token-metadata'

export enum MetadataKey {
  Uninitialized = 0,
  MetadataV1 = 4,
  EditionV1 = 1,
  MasterEditionV1 = 2,
  MasterEditionV2 = 6,
  EditionMarker = 7,
}
export class Creator {
  address: StringPublicKey
  verified: number
  share: number

  constructor(args: {
    address: StringPublicKey
    verified: number
    share: number
  }) {
    this.address = args.address
    this.verified = args.verified
    this.share = args.share
  }
}

export class Data {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  creators: Creator[] | null
  constructor(args: {
    name: string
    symbol: string
    uri: string
    sellerFeeBasisPoints: number
    creators: Creator[] | null
  }) {
    this.name = args.name
    this.symbol = args.symbol
    this.uri = args.uri
    this.sellerFeeBasisPoints = args.sellerFeeBasisPoints
    this.creators = args.creators
  }
}

export class CreateMetadataArgs {
  instruction: number = 0
  data: Data
  isMutable: boolean

  constructor(args: { data: Data; isMutable: boolean }) {
    this.data = args.data
    this.isMutable = args.isMutable
  }
}

export class UpdateMetadataArgs {
  instruction: number = 1
  data: Data | null
  // Not used by this app, just required for instruction
  updateAuthority: StringPublicKey | null
  primarySaleHappened: boolean | null
  constructor(args: {
    data?: Data
    updateAuthority?: string
    primarySaleHappened: boolean | null
  }) {
    this.data = args.data ? args.data : null
    this.updateAuthority = args.updateAuthority ? args.updateAuthority : null
    this.primarySaleHappened = args.primarySaleHappened
  }
}

export class CreateMasterEditionArgs {
  instruction: number = 10
  maxSupply: BN | null
  constructor(args: { maxSupply: BN | null }) {
    this.maxSupply = args.maxSupply
  }
}

export class Metadata {
  key: MetadataKey
  updateAuthority: StringPublicKey
  mint: StringPublicKey
  data: Data
  primarySaleHappened: boolean
  isMutable: boolean
  editionNonce: number | null

  // set lazy
  masterEdition?: StringPublicKey
  edition?: StringPublicKey

  constructor(args: {
    updateAuthority: StringPublicKey
    mint: StringPublicKey
    data: Data
    primarySaleHappened: boolean
    isMutable: boolean
    editionNonce: number | null
  }) {
    this.key = MetadataKey.MetadataV1
    this.updateAuthority = args.updateAuthority
    this.mint = args.mint
    this.data = args.data
    this.primarySaleHappened = args.primarySaleHappened
    this.isMutable = args.isMutable
    this.editionNonce = args.editionNonce ?? null
  }
}

// eslint-disable-next-line no-control-regex
const METADATA_REPLACE = new RegExp('\u0000', 'g')

export const extendBorsh = () => {
  ;(BinaryReader.prototype as any).readPubkey = function () {
    const reader = this as unknown as BinaryReader
    const array = reader.readFixedArray(32)
    return new PublicKey(array)
  }
  ;(BinaryWriter.prototype as any).writePubkey = function (value: PublicKey) {
    const writer = this as unknown as BinaryWriter
    writer.writeFixedArray(value.toBuffer())
  }
  ;(BinaryReader.prototype as any).readPubkeyAsString = function () {
    const reader = this as unknown as BinaryReader
    const array = reader.readFixedArray(32)
    return base58.encode(array) as StringPublicKey
  }
  ;(BinaryWriter.prototype as any).writePubkeyAsString = function (
    value: StringPublicKey
  ) {
    const writer = this as unknown as BinaryWriter
    writer.writeFixedArray(base58.decode(value))
  }
}

extendBorsh()
