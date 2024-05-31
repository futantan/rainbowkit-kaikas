import { getWalletConnectConnector } from '@rainbow-me/rainbowkit'
import {
  CreateConnector,
  DefaultWalletOptions,
  Wallet,
} from '@rainbow-me/rainbowkit/dist/wallets/Wallet'
import { createConnector } from 'wagmi'
import {
  WalletConnectParameters,
  injected,
  walletConnect,
} from 'wagmi/connectors'

export type KaikasWalletOptions = DefaultWalletOptions

export const customKaikasWallet = ({
  projectId,
  walletConnectParameters,
}: KaikasWalletOptions): Wallet => {
  const isKaikasWalletInjected = hasInjectedProvider({
    namespace: 'klaytn',
  })

  const shouldUseWalletConnect = !isKaikasWalletInjected

  const getUri = (uri: string) => {
    return `kaikas://wallet/browser?url=${encodeURI(window.location.origin)}`
  }

  return {
    id: 'kaikas',
    name: 'Kaikas Wallet',
    iconUrl:
      'https://docs.kaikas.io/~gitbook/image?url=https%3A%2F%2F1604996859-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FzvgdDSwmwvJE7FLb6FCc%252Ficon%252FzKemLV4grODY1vlxlTrU%252Fsymbol_multi_solid.png%3Falt%3Dmedia%26token%3D53643768-91b6-41cb-8a9f-52d6b1194550&width=32&dpr=2&quality=100&sign=9ce693bf7874150962358059d3e8297f7c2a0fa6111902d5475db04a12b9cc85',
    installed: isKaikasWalletInjected || undefined,
    iconBackground: '#fff',
    downloadUrls: {
      chrome:
        'https://chromewebstore.google.com/detail/kaikas/jblndlipeogpafnldhgmapagcccfchpi',
      browserExtension: 'https://app.kaikas.io',
      qrCode: 'https://app.kaikas.io',
      ios: 'https://apps.apple.com/us/app/kaikas-mobile-crypto-wallet/id1626107061',
      android: 'https://play.google.com/store/apps/details?id=io.klutch.wallet',
      mobile: 'https://app.kaikas.io',
    },
    mobile: {
      getUri: shouldUseWalletConnect
        ? getUri
        : (uri: string) =>
            `kaikas://walletconnect?uri=${encodeURIComponent(uri)}`,
    },
    qrCode: shouldUseWalletConnect
      ? {
          getUri: (uri: string) => uri,
          instructions: {
            learnMoreUrl: 'https://kaikas.io',
            steps: [
              {
                description:
                  'wallet_connectors.kaikas.qr_code.step1.description',
                step: 'install',
                title: 'wallet_connectors.kaikas.qr_code.step1.title',
              },
              {
                description:
                  'wallet_connectors.kaikas.qr_code.step2.description',
                step: 'create',
                title: 'wallet_connectors.kaikas.qr_code.step2.title',
              },
              {
                description:
                  'wallet_connectors.kaikas.qr_code.step3.description',
                step: 'refresh',
                title: 'wallet_connectors.kaikas.qr_code.step3.title',
              },
            ],
          },
        }
      : undefined,
    extension: {
      instructions: {
        learnMoreUrl: 'https://kaikas.io',
        steps: [
          {
            description: 'wallet_connectors.kaikas.extension.step1.description',
            step: 'install',
            title: 'wallet_connectors.kaikas.extension.step1.title',
          },
          {
            description: 'wallet_connectors.kaikas.extension.step2.description',
            step: 'create',
            title: 'wallet_connectors.kaikas.extension.step2.title',
          },
          {
            description: 'wallet_connectors.kaikas.extension.step3.description',
            step: 'refresh',
            title: 'wallet_connectors.kaikas.extension.step3.title',
          },
        ],
      },
    },
    createConnector: shouldUseWalletConnect
      ? getWalletConnectConnector({
          projectId,
          walletConnectParameters,
        })
      : getInjectedConnector({ namespace: 'klaytn' }),
  }
}

export function hasInjectedProvider({
  namespace,
}: {
  namespace?: string
}): boolean {
  if (namespace && typeof getWindowProviderNamespace(namespace) !== 'undefined')
    return true
  return false
}

/*
 * Gets the `window.namespace` window provider if it exists
 */
function getWindowProviderNamespace(namespace: string) {
  const providerSearch = (provider: any, namespace: string): any => {
    const [property, ...path] = namespace.split('.')
    const _provider = provider[property]
    if (_provider) {
      if (path.length === 0) return _provider
      return providerSearch(_provider, path.join('.'))
    }
  }
  if (typeof window !== 'undefined') return providerSearch(window, namespace)
}

// Creates a WalletConnect connector with the given project ID and additional options.
export function createWalletConnectConnector({
  projectId,
  walletDetails,
  walletConnectParameters,
}: any): any {
  // Create and configure the WalletConnect connector with project ID and options.
  return createConnector((config) => ({
    ...getOrCreateWalletConnectInstance({
      projectId,
      walletConnectParameters,
      // Used in `connectorsForWallets` to add another
      // walletConnect wallet into rainbowkit with modal popup option
      rkDetailsShowQrModal: walletDetails.rkDetails.showQrModal,
    })(config),
    ...walletDetails,
  }))
}

// Function to get or create a walletConnect instance
const getOrCreateWalletConnectInstance = ({
  projectId,
  walletConnectParameters,
  rkDetailsShowQrModal,
}: any): ReturnType<typeof walletConnect> => {
  let config: WalletConnectParameters = {
    ...(walletConnectParameters ? walletConnectParameters : {}),
    projectId,
    showQrModal: false, // Required. Otherwise WalletConnect modal (Web3Modal) will popup during time of connection for a wallet
  }

  // `rkDetailsShowQrModal` should always be `true`
  if (rkDetailsShowQrModal) {
    config = { ...config, showQrModal: true }
  }

  const serializedConfig = JSON.stringify(config)

  // Create a new walletConnect instance and store it
  return walletConnect(config)
}

export function getInjectedConnector({
  namespace,
}: {
  flag?: string
  namespace?: string
  target?: any
}): CreateConnector {
  const provider = getInjectedProvider({ namespace })
  return createInjectedConnector(provider)
}

/*
 * Returns an injected provider that favors the flag match, but falls back to window.ethereum
 */
function getInjectedProvider({ namespace }: { namespace?: string }) {
  const _window = typeof window !== 'undefined' ? (window as any) : undefined
  if (typeof _window === 'undefined') return
  if (namespace) {
    // prefer custom eip1193 namespaces
    const windowProvider = getWindowProviderNamespace(namespace)
    if (windowProvider) return windowProvider
  }
  const providers = _window.ethereum?.providers
  if (typeof providers !== 'undefined' && providers.length > 0)
    return providers[0]
  return _window.ethereum
}

function createInjectedConnector(provider?: any): CreateConnector {
  return (walletDetails: any) => {
    // Create the injected configuration object conditionally based on the provider.
    const injectedConfig = provider
      ? {
          target: () => ({
            id: walletDetails.rkDetails.id,
            name: walletDetails.rkDetails.name,
            provider,
          }),
        }
      : {}

    return createConnector((config) => ({
      // Spread the injectedConfig object, which may be empty or contain the target function
      ...injected(injectedConfig)(config),
      ...walletDetails,
    }))
  }
}
