import {
  clusterApiUrl,
  Connection,
  PublicKey
} from '@solana/web3.js'

console.log('DATABASE_URL', process.env.DATABASE_URL)

export const MONET_USER_PUBKEY = new PublicKey('monw5YS9itMBzCZ871G3ZsZXqUoD3RBpJC4HsjQUX9d')
export const MONET_NON_DEX_FEE_WALLET_PUBKEY = new PublicKey('moDXL7CzX53ByKTvRK3eTU1oDw5aQaXaYjjfnRTEy6V')

export const configPerEnv = {
  dev: {
    host: 'http://localhost:3000',
    solanaEnv: 'testnet',
    apiHost: 'http://localhost:4000',
    rpcHost: false
      ? 'https://testnet.genesysgo.net/'
      : clusterApiUrl('testnet'),
    altBackendRpcHost: true ? clusterApiUrl('devnet') : clusterApiUrl('devnet'),
    puffToken: '5NsF4C2cM6Sa7jgM4nHGepwriG5p11y1akPYki1cNayx', // devnet: 8crBEjMoyGmUA4jsus4oNbzmS9skroExSVzhroidjaA6
    //usdcToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    solToken: 'So11111111111111111111111111111111111111112',
    candyMachineId: 'SgE3PvVMVEJYMyS5YxmL64gu8wKcByseAqbKhobcSfp',
    meApi: 'https://api-mainnet.magiceden.dev/v2/',
  },
  production: {
    host: 'https://monet.community',
    solanaEnv: 'mainnet-beta',
    apiHost: 'https://sac-discord-bot-5ptq.onrender.com',
    rpcHost: false
    ? 'https://late-falling-firefly.solana-mainnet.quiknode.pro/af633d865ccdb6d10731731fff53fb9e257e94dd/'
    : 'https://nd-875-154-106.p2pify.com/9628fbd634defb2cd8a659ae9ef3d4a9',
    altBackendRpcHost:
      'https://small-proud-crater.solana-mainnet.quiknode.pro/459a0984ed8c81e455b6a8ab24bf6e1c1c6ac6c5/',
    puffToken: 'G9tt98aYSznRk7jWsfuz9FnTdokxS6Brohdo9hSmjTRB',
    //usdcToken: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    solToken: 'So11111111111111111111111111111111111111112',
    candyMachineId: '7RCBr3ZQ8yhY4jHpFFo3Kmh7MnaCPi1bFuUgXUB9WURf',
    meApi: 'https://api-mainnet.magiceden.dev/v2/'
  },
}

export const ENV =
  (process.env.NEXT_PUBLIC_ENV as 'production' | undefined) ?? 'dev'
const config = configPerEnv[ENV]

export default config

export const GA_TRACKING_ID = 'G-8BQZKXLYCK'

const rpcHost = config.rpcHost

const wsEndpoint = 
ENV === 'production' && rpcHost.includes('p2pify.com/')
  ? 'wss://ws-nd-476-617-067.p2pify.com/f16f2e016246ca6f4fdc5522fb9478a4'
  : undefined;

export const connection = new Connection(rpcHost, {
  commitment: 'confirmed',
  httpHeaders: {
    referer: 'https://www.monet.community',
  },
  wsEndpoint
})


export const altBackendConnection = new Connection(config.altBackendRpcHost, {
  commitment: 'confirmed',
  httpHeaders: {
    referer: 'https://sol-incinerator.com/',
  },
})

//export const usdcToken = new PublicKey(config.usdcToken)
export const puffToken = new PublicKey(config.puffToken)
export const solToken = new PublicKey(config.solToken)

export const jwtKey = process.env.JWT_SECRET!

export function getBaseUrl() {
  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // // reference for render.com
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`
  }

  const host = typeof window !== "undefined" ? window?.location?.hostname : 'localhost'
  const protocol = typeof window !== "undefined" ? window?.location?.protocol : 'http:'
  const port = typeof window !== "undefined" ? window?.location?.port : process.env.PORT ?? 3000

  // assume localhost
  return `${protocol}//${host}${port ? ':' + port : ''}`
}

export const tokenToShowFromStart = ['SOL', 'USDC', 'DUST', 'PUFF', 'FORGE', 'JELLY', 'BONK']
export const preselectedTokens = ['SOL', 'DUST', 'PUFF', 'JELLY', 'BONK']

export function getRedirectBaseUrl() {
  if (process.env.BASE_REDIRECT_URL) {
    return process.env.BASE_REDIRECT_URL
  }

  return getBaseUrl()
}