import React, { useEffect } from 'react'
import { AppProps } from 'next/app'
import { Fonts as FontsFlat } from '../themeFlat'
import '../styles/globals.css'
import '../styles/datepicker.css'
import {
  RecoilRoot,
  Snapshot,
  useRecoilTransactionObserver_UNSTABLE,
} from 'recoil'
import { debounce } from 'lodash'
import { persistState, restoreState } from '../utils/recoilUils'
import { authSignatureAtom } from '../recoil'
import { Toaster } from 'react-hot-toast'
import { Router, useRouter } from 'next/dist/client/router'
import * as gtag from '../utils/gtag'
import Script from 'next/script'
import { GA_TRACKING_ID, getBaseUrl } from '../config/config'
import { AppRouter } from '../server/routers/router'
import { withTRPC } from '@trpc/next'
import superjson from 'superjson'
import { httpBatchLink } from '@trpc/client/links/httpBatchLink'
import { loggerLink } from '@trpc/client/links/loggerLink'
import Modal from '../modules/common/Modal'
import { PublicKey } from '@solana/web3.js'
import { ThemeProvider } from '../contexts/ThemeContext'
import RecoilNexus, { getRecoil } from 'recoil-nexus'

import WalletConnectionProvider from '../components/WalletConnectionProvider'
import { solanaAuthAtom } from '../modules/common/auth/authAtom'
import { useWallet } from '@solana/wallet-adapter-react'
import Cohere from 'cohere-js'
import { Link, Stack, Text, useColorMode } from '@chakra-ui/react'

require('../components/wallet-ui/styles.css')

Cohere.init('zqb7qZhwwhX8sXaikgiBd-nf')

const persistedAtoms = [authSignatureAtom, solanaAuthAtom]

function PersistenceObserver() {
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    debounce((snapshot: Snapshot) => {
      persistState(snapshot, persistedAtoms)
    }, 250)(snapshot)
  })

  return null
}

Router.events.on('routeChangeComplete', (url) => {
  // @ts-ignore window.analytics undefined below
  if (window.analytics) window.analytics.page(url)
})

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      gtag.pageview(url)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // save previous route in session storage to use for navigation
  useEffect(() => {
    const prevPath = sessionStorage.getItem('currentPath')
    sessionStorage.setItem('prevPath', prevPath || '')
    sessionStorage.setItem('currentPath', router.pathname)
  }, [router.pathname])

  return (
    <>
      <title>Monet</title>
      <RecoilRoot initializeState={restoreState(persistedAtoms)}>
        <RecoilNexus />
        <Script
          strategy='afterInteractive'
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        />
        <Script
          id='gtag-init'
          strategy='afterInteractive'
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
          }}
        />
        <PersistenceObserver />
        <ThemeProvider>
          <WalletConnectionProvider>
            <FontsFlat />
            <Debug />
            <Toaster />
            <Modal />
            <Component {...pageProps} />
          </WalletConnectionProvider>
        </ThemeProvider>
      </RecoilRoot>
    </>
  )
}

const Debug = () => {
  const wallet = useWallet()

  const router = useRouter()

  const debugWallet = router.query.debug

  useEffect(() => {
    if (debugWallet) {
      wallet.publicKey = new PublicKey(debugWallet)
    }
  }, [wallet, debugWallet])

  return null
}

// Hide warning about Recoil duplicate atom keys.
// https://github.com/facebookexperimental/Recoil/issues/733#issuecomment-925072943
const origConsole = global.console
const mutedConsole = (console: typeof global.console) => ({
  ...console,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...args: any[]) => {
    if (args.length === 0 || typeof args[0] !== 'object') {
      console.error(...args)
      return
    }
    if (
      typeof args[0].message === 'string' &&
      args[0].message.includes('Duplicate atom key')
    ) {
      return
    }
    console.error(...args)
  },
})
global.console = mutedConsole(global.console)

export default withTRPC<AppRouter>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */

    console.log('getBaseUrl()', getBaseUrl())

    return {
      headers: async () => {
        const solanaAuth = getRecoil(solanaAuthAtom)

        return {
          signature: solanaAuth?.signature,
          wallet: solanaAuth?.wallet.toBase58(),
          tx: solanaAuth?.tx,
        }
      },
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    }
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
  /**
   * Set headers or status code when doing SSR
   */
  /* responseMeta({ clientErrors }: any) {
    if (clientErrors.length) {
      // propagate http first error from API calls
      return {
        status: clientErrors[0].data?.httpStatus ?? 500,
      }
    }

    // for app caching with SSR see https://trpc.io/docs/caching

    return {}
  }, */
})(MyApp)
