import '@rainbow-me/rainbowkit/styles.css'
import type { AppProps } from 'next/app'
import '../styles/globals.css'

import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit'
import { kaikasWallet } from '@rainbow-me/rainbowkit/wallets'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import {
  arbitrum,
  base,
  klaytn,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains'

const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    klaytn,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia] : []),
  ],
  wallets: [
    {
      groupName: 'Popular',
      wallets: [kaikasWallet],
    },
  ],
  ssr: true,
})

const client = new QueryClient()

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={client}>
        <RainbowKitProvider>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default MyApp
