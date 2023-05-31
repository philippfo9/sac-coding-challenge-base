import Head from 'next/head'
import { Box, Container } from '@chakra-ui/react'
import React, { FC } from 'react'
import Footer from './Footer'
import Header from './Header'

interface IMeta {
  title?: string
  previewImage?: string
  twitterTitle?: string
  description?: string
}

interface LayoutProps {
  meta?: IMeta
  children: JSX.Element | JSX.Element[]
}

const DAppLayout: FC<LayoutProps> = ({ children, meta }) => {
  const {title, previewImage, twitterTitle, description} = (meta ?? {})
  return (
    <>
      <Head>
        <title>{title ?? 'Monet'}</title>
        <meta property='og:title' content={title ?? 'Monet'} key='title' />
        <meta property='og:type' content='website' key='type' />
        <meta
          property='og:image'
          content={previewImage ?? 'https://monet.community/images/monet-image.jpg'}
        />

        <meta
          property='og:site_name'
          content={'Monet'}
        />
        <meta
          property='og:url'
          content={'https://monet.community'}
        />
        <meta
          name='description'
          content={description ?? 'Community-first platform on Solana.'}
        />
        <meta
          property='og:description'
          content={description ?? 'Community-first platform on Solana.'}
        />

        <meta property='twitter:card' content='summary_large_image' />
        <meta property='twitter:title' content={twitterTitle ?? title ?? 'Monet'} />
        <meta
          property='twitter:description'
          content={description ?? 'Community-first platform on Solana.'}
        />
        <meta
          property='twitter:image'
          content={previewImage ?? 'https://monet.community.com/images/monet-image.jpg'}
        />
        <meta
          property='twitter:image:secure'
          content={previewImage ?? 'https://monet.community.com/images/monet-image.jpg'}
        />
        <meta name='twitter:domain' content='https://monet.community' />
      </Head>
      <Container
        maxW='100vw'
        width='100%'
        px={0}
        color='#232323 !important'
        fontFamily='Inter !important'
      >
        <Header theme='solid' showNewsSubheader={true} />
        <Container maxW='1680px' px='1rem' py={['.5rem', '1rem', '1.4rem']}>
          <Box minHeight='80vh'>{children}</Box>
          <Footer />
        </Container>
      </Container>
    </>
  )
}

export default DAppLayout
