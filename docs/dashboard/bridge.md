---
slug: /dashboard/bridge
title: Bridge
sidebar_label: Bridge
sidebar_position: 5
---

# Bridge

The **Bridge** lets you move assets between QoreChain and other chains from a single screen. Every bridge operation is secured by post-quantum cryptography. For the design behind cross-chain transfers, see [Bridge Architecture](/architecture/bridge-architecture).

:::caution Qualified status
The cross-chain bridge is currently in testnet and being rolled out progressively — it is not yet a production mainnet system. Treat available routes as work in progress rather than guaranteed live connectivity, and start on testnet.
:::

Connect your wallet to use the Bridge — see [Overview & Getting Started](/dashboard/overview#connect-your-wallet).

## How to bridge an asset

1. Choose the **source** chain and token in the upper selector. The selector shows the token, its network, and your balance.
2. Choose the **destination** chain and token in the lower selector.
3. Enter the amount to transfer. The amount you will receive is shown for the destination side.
4. To send the assets to a different address than your own, turn on **Send to another** and enter the recipient.
5. Review the **fee** and the **estimated time** to settlement shown at the bottom.
6. Confirm the transfer in your wallet.

A swap control between the two selectors lets you reverse the source and destination in one tap.

## Tips

- Confirm both chains and the destination address before submitting — cross-chain transfers cannot be reversed.
- Settlement time varies by route; the estimate updates as you change chains and amounts.
- For background on how transfers are validated across chains, see [Bridging Assets](/user-guide/bridging-assets) and [Bridge Architecture](/architecture/bridge-architecture).
