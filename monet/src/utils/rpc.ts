import { createTRPCClient } from '@trpc/client'
import config, { getBaseUrl } from '../config/config'
import { AppRouter } from '../server/routers/router'
import fetch from 'node-fetch'
import superjson from 'superjson'
import { solanaAuthAtom } from '../modules/common/auth/authAtom'
import { getRecoil } from 'recoil-nexus'

const rpc = createTRPCClient<AppRouter>({
  url: getBaseUrl() + '/api/trpc',
  fetch: fetch as any,
  transformer: superjson,
  headers: () => {
    
    const solanaAuth = getRecoil(solanaAuthAtom)

    return {
      signature: solanaAuth?.signature,
      wallet: solanaAuth?.wallet.toBase58(),
      tx: solanaAuth?.tx,
    }
  },
  /* links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    }),
  ] */
})

export default rpc
