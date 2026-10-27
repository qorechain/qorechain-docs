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
| Chain-ID | `qorechain-vladi` (live seit 7. Juni 2026) |
| Chain-Version (27. Oktober 2026) | v3.2.4 (seit Höhe 3.742.566, 23. Oktober 2026, Governance-Vorschlag 13). Der Governance-Vorschlag 14 würde v3.2.5 bei Höhe 3.906.833 anwenden und befand sich zum Zeitpunkt der Erstellung in seinem Abstimmungszeitraum; was v3.2.5 ergänzt, wird an dem Tag dokumentiert, an dem das Mainnet es anwendet |
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
| Chain-Version (27. Oktober 2026) | v3.2.6 (seit Höhe 8,970,638, 27. Oktober 2026; v3.2.5 wurde bei Höhe 8,890,800 am 26. Oktober und v3.2.4 bei Höhe 8,337,253 am 19. Oktober angewendet) |
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

### Unterschiede, die nur das Testnet betreffen und für einen Client wichtig sind {#testnet-only}

Das Testnet ist ein Staging-Netzwerk und läuft dem Mainnet voraus, sodass einiges, was Sie
dort lesen können, im Mainnet nicht vorhanden ist (geprüft am 27. Oktober 2026; die vollständige Liste steht unter
[Unterschiede zwischen Testnet und Mainnet](/appendix/chain-parameters#testnet-differences)):

* **REST-Routen.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` und `GET /qorechain/crossvm/v1/params` antworten im Testnet; das Mainnet antwortet darauf mit HTTP 501. Die AMM-Routen unter `/qorechain/amm/v1/` (`pools`, `params`) antworten auf beiden Netzwerken.
* **Testtoken.** Drei Token ohne Wert existieren nur im Testnet, als Bank-Denominationen mit dem Namen `erc20:<EIP-55 contract address>` (Groß-/Kleinschreibung beachten): fUSD (6 Dezimalstellen), fETH (18) und fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` listet sie auf. Die einzige Bank-Denomination des Mainnets ist `uqor`. Siehe [Testnet-Testtoken (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Eingeschaltete Module.** Das Modul `abstractaccount` ist im Testnet aktiviert und im Mainnet aus, drei EVM-Precompiles sind im Testnet aktiv und keines im Mainnet, und die Instanziierung von QoreChain Native ist im Testnet offen.

## Standard-Ports

`createClient()` verwendet standardmäßig diese localhost-Ports. Überschreiben Sie
`endpoints`, um auf einen echten Node zu zeigen.

| Endpunkt | Port | Zweck |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | Bank-Guthaben, Kontoinformationen, Modul-Abfragen |
| gRPC | `9090` | gRPC-Abfragen |
| Consensus RPC | `26657` | Signieren/Übertragen nativer Txs, QoreChain Native-Lesevorgänge |
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
