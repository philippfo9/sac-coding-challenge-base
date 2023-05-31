export default interface meApigetCollectionByShortName {
  symbol: string;
  name: string;
  description: string;
  image: string;
  twitter: string;
  discord: string;
  website: string;
  isFlagged: boolean;
  flagMessage: string;
  categories: string[];
  isBadged: boolean;
  floorPrice: number;
  listedCount: number;
  avgPrice24hr: number;
  volumeAll: number;
}

