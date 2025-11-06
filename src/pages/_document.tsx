import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta
          name="description"
          content="Chesspoint.io - Monarch Knights Set: Analyze your chess games for free on any device with Stockfish!"
        />

        {/* OG (Social networks) */}
        <meta property="og:title" content="Chesspoint.io - Monarch Knights Set" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Chesspoint.io" />
        <meta property="og:url" content="https://chesspoint.io/" />
        <meta
          property="og:image"
          content="https://chesspoint.io/social-networks-1200x630.png"
        />
        <meta
          property="og:description"
          content="Chesspoint.io - Monarch Knights Set: Analyze your chess games for free on any device with Stockfish!"
        />

        {/* Twitter */}
        <meta name="twitter:title" content="Chesspoint.io - Monarch Knights Set" />
        <meta name="twitter:domain" content="chesspoint.io" />
        <meta name="twitter:url" content="https://chesspoint.io/" />
        <meta
          name="twitter:description"
          content="Chesspoint.io - Monarch Knights Set: Analyze your chess games for free on any device with Stockfish!"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://chesspoint.io/social-networks-1200x630.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
