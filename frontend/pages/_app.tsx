import '@/styles/globals.css';
import Head from 'next/head';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Must load before the app bundle so API_BASE can read it */}
        <script src="/config.js" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
