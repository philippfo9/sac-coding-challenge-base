import NextDocument, { Head, Html, Main, NextScript } from 'next/document'
import { ColorModeScript } from '@chakra-ui/react'
import { themeFlatLight } from '../themeFlat'
import BodyHead from 'next/head'

export default class Document extends NextDocument {
  render() {
    return (
      <Html>
        <Head>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
            rel='stylesheet'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap'
            rel='stylesheet'
          />
          <link rel='shortcut icon' href='/favicon.png' />
          <link rel='icon' type='image/png' href='/favicon.png' />
          <link
            href='https://fonts.googleapis.com/css2?family=Playfair+Display:wght@900&display=swap'
            rel='stylesheet'
          />

          <meta
            name='viewport'
            content='width=device-width, initial-scale=1.0'
          />
        </Head>
        <body>
          <BodyHead>
            <meta property='og:title' content='Monet' />
            <meta property='og:type' content='website' />
            <meta
              property='og:image'
              content='https://monet.community/images/monet-image.jpg'
            />
            <meta property='og:image:type' content='image/jpeg' />
            <meta property='twitter:title' content='Monet' />
            <meta
              name='description'
              content='Community-first platform on Solana.'
            />
            <meta
              property='og:description'
              content='Community-first platform on Solana.'
            />
            <meta
              property='twitter:description'
              content='Community-first platform on Solana.'
            />
            <meta
              property='twitter:image'
              content='https://monet.community.com/images/monet-image.jpg'
            />
            <meta property='twitter:card' content='summary' />
            <meta name='twitter:domain' content='monet.community' />
          </BodyHead>
          {/* Make Color mode to persists when you refresh the page. */}
          <ColorModeScript
            initialColorMode={themeFlatLight.config.initialColorMode}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
