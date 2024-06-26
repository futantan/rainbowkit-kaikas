This is a [RainbowKit](https://rainbowkit.com) + [wagmi](https://wagmi.sh) + [Next.js](https://nextjs.org/) project bootstrapped with [`create-rainbowkit`](/packages/create-rainbowkit).

Here are some attempts to integrate kaikas wallet with RainbowKit, testing with safari on iPhone

## [First try with kaikas provided from RainbowKit](https://github.com/futantan/rainbowkit-kaikas/commit/fd6de20e89a9f7057b557be6de5b456b545236d1)

```ts
import { kaikasWallet } from '@rainbow-me/rainbowkit/wallets'
```

[source code](https://github.com/rainbow-me/rainbowkit/blob/main/packages/rainbowkit/src/wallets/walletConnectors/kaikasWallet/kaikasWallet.ts)

Click Kaikas wallet icon on the website, it will open kaikas, but nothing happened, it will not ask the user to connect the wallet.

## [Second try, customize kaikas wallet](https://github.com/futantan/rainbowkit-kaikas/commit/f3f43f3a3c0678589254def2aab4ed3a6d99a5cf)

The url schema doesn't work, so I have changed

```ts
kaikas://walletconnect?uri=${encodeURIComponent(uri)}
```

to:

```ts
kaikas://wallet/browser?url=${encodeURI(window.location.origin)}
```

Now, it will open the website inside Kaikas wallet, but when user click the wallet icon, nothing happened.

One possible reason is that the Kaikas wallet inside iPhone doesn't implement https://eips.ethereum.org/EIPS/eip-1193

Rainbowkit is the most popular web3 wallet for mobile, but it will be great if we can integrate kaikas with RainbowKit. A PR to RainbowKit to update the `kaikasWallet.ts` will be great
