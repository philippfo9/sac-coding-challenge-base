export interface howRareIsApiCollectionResponse {
  api_version: string
  result: Result
}

export interface Result {
  api_code: number
  api_response: string
  data: Data
}

export interface Data {
  collection: string
  ranking_url: string
  official_rarity: number
  twitter: string
  discord: string
  website: string
  description: string
  logo: string
  items: Item[]
}

export interface Item {
  id: number
  mint: string
  link: string
  name: string
  description: string
  image: string
  attributes: HowRareAttribute[]
  rank: number
  rank_algo: string
  all_ranks: AllRanks
}

export interface HowRareAttribute {
  name: string
  value: string
  rarity: string
}

export interface AllRanks {
  "howrare.is": number
  trait_normalized: number
  statistical_rarity: number
}
