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
| Anzeige-Token | `QOR` |
| Basis-Denomination | `uqor` |
| Basiseinheiten pro QOR | `10^6` |
| Konto-bech32-Präfix | `qor` |
| Validator-bech32-Präfix | `qorvaloper` |

## Standard-Ports

`createClient()` verwendet standardmäßig diese localhost-Ports. Überschreiben Sie
`endpoints`, um auf einen echten Node zu zeigen.

| Endpunkt | Port | Zweck |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | Bank-Guthaben, Kontoinformationen, Modul-Abfragen |
| gRPC | `9090` | gRPC-Abfragen |
| Consensus RPC | `26657` | Signieren/Übertragen nativer Txs, CosmWasm-Lesevorgänge |
| EVM JSON-RPC | `8545` | `eth_*`, `qor_*`, Precompiles |
| EVM JSON-RPC (WS) | `8546` | EVM-WebSocket-Subscriptions |
| SVM JSON-RPC | `8899` | Solana-kompatibles RPC |

Beispiel mit expliziten Endpunkten:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://rest.testnet.example",   // REST (LCD)
    rpc: "https://rpc.testnet.example",      // consensus RPC
    evmRpc: "https://evm.testnet.example",   // EVM + qor_ JSON-RPC
    evmWs: "wss://evm.testnet.example",      // EVM WebSocket
  },
});
```

Das SDK stellt Netzwerk-Voreinstellungen und Lookup-Helfer bereit (exportiert aus dem
networks-Modul), sodass Sie Netzwerke programmgesteuert auflisten und auflösen können.
In Python/Go/Rust sind die Entsprechungen `create_client` / `CreateClient` /
`ClientBuilder` plus das `networks`-Modul.

## Auf Mainnet zielen

Beide Voreinstellungen liefern dieselben localhost-Standardwerte; wählen Sie `mainnet`
und überschreiben Sie die Endpunkte mit Ihren Node-URLs:

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://rest.mainnet.example",
    rpc: "https://rpc.mainnet.example",
    evmRpc: "https://evm.mainnet.example",
  },
});
```
