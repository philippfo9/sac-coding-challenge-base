export interface Attribute {
  trait_type: string;
  value: string;
}

export interface File {
  uri: string;
  type: string;
}

export interface Creator {
  address: string;
  share: number;
}

export interface Properties {
  files: File[];
  category: string;
  creators: Creator[];
}

export type meAPIgetToken = {
  mintAddress?: string;
  owner: string;
  supply: number;
  collection: string;
  name: string;
  updateAuthority: string;
  primarySaleHappened: boolean;
  sellerFeeBasisPoints: number;
  image: string;
  animationUrl?: string;
  attributes: Attribute[];
  properties: Properties;
}