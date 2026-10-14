---
slug: /sdk/reference/network
title: Netzwerk & Endpunkte
sidebar_label: Netzwerk & Endpunkte
sidebar_position: 1
---

# Netzwerk- & Endpunkt-Referenz

## Mainnet

| Feld | Wert |
| --- | --- |
| Netzwerk-Voreinstellung | `mainnet` |
| Chain-ID | `qorechain-vladi` (live) |
| EVM-Chain-ID | `9801` |
| Anzeige-Token | `QOR` |
| Basis-Denomination | `uqor` |
| Basiseinheiten pro QOR | `10^6` |
| Konto-bech32-Präfix | `qor` |
| Validator-bech32-Präfix | `qorvaloper` |

## Testnet

| Feld | Wert |
| --- | --- |
| Netzwerk-Voreinstellung | `testnet` |
| Chain-ID | `qorechain-diana` (live) |
| EVM-Chain-ID | `9800` |
| Anzeige-Token | `QOR` |
| Basis-Denomination | `uqor` |
| Basiseinheiten pro QOR | `10^6` |
| Konto-bech32-Präfix | `qor` |
| Validator-bech32-Präfix | `qorvaloper` |

## Öffentliche Endpunkte {#public-endpoints}

| Endpunkt | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (Chain-ID 9801) | `https://evm-testnet.qore.host` (Chain-ID 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (nur lesend) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

Die EVM-Endpunkte bedienen `eth_`, `net_`, `web3_` und `txpool_`; der `qor_`-Namespace
ist nicht aktiviert. Siehe auch [Netzwerke](/appendix/networks#public-endpoints).

## Standard-Ports

`createClient()` verwendet standardmäßig diese localhost-Ports. Überschreiben Sie
`endpoints`, um auf einen echten Node zu zeigen.

| Endpunkt | Port | Zweck |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | Bank-Guthaben, Kontoinformationen, Modul-Abfragen |
| gRPC | `9090` | gRPC-Abfragen |
| Consensus RPC | `26657` | Signieren/Übertragen nativer Txs, CosmWasm-Lesevorgänge |
| EVM JSON-RPC | `8545` | `eth_*` (sowie `qor_*` / Precompiles auf Nodes, die sie aktivieren) |
| EVM JSON-RPC (WS) | `8546` | EVM-WebSocket-Subscriptions |
| SVM JSON-RPC | `8899` | Solana-kompatibles RPC |

Beispiel mit expliziten Endpunkten:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

Das SDK stellt Netzwerk-Voreinstellungen und Lookup-Helfer bereit (exportiert aus dem
networks-Modul), sodass Sie Netzwerke programmgesteuert auflisten und auflösen können.
In Python/Go/Rust sind die Entsprechungen `create_client` / `CreateClient` /
`ClientBuilder` plus das `networks`-Modul.

## Auf Mainnet zielen

Beide Voreinstellungen liefern dieselben localhost-Standardwerte; wählen Sie `mainnet`
und überschreiben Sie die Endpunkte mit den öffentlichen URLs (oder Ihrem eigenen Node):

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
