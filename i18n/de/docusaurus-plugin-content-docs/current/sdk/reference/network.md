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
| Chain-Version (12. November 2026) | v3.2.7 (seit Höhe 4.164.600, 12. November 2026, Governance-Vorschlag 16; v3.2.6 wurde bei Höhe 4.020.000 am 4. November angewendet, v3.2.5 bei Höhe 3.906.833 am 29. Oktober und v3.2.4 bei Höhe 3.742.566 am 23. Oktober angewendet). SDK 0.12.0 ist der Client für v3.2.5 und funktioniert auf v3.2.6 und v3.2.7 (das Signaturformat hat sich nicht geändert); 0.10.0 war der Client für v3.2.4 |
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
| Chain-Version | v3.2.8 (seit Höhe 9,929,500, 12. November 2026, per Governance angewendet; das Mainnet hat es nicht angewendet. v3.2.7 wurde bei Höhe 9,594,600 am 6. November angewendet; v3.2.6 wurde bei Höhe 8,970,638 am 27. Oktober angewendet; v3.2.5 wurde bei Höhe 8,890,800 am 26. Oktober und v3.2.4 bei Höhe 8,337,253 am 19. Oktober angewendet) |
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

Ab SDK 0.12.0 verwenden die Presets `mainnet` und `testnet` standardmäßig diese REST-, Konsens-RPC- und
EVM-JSON-RPC-URLs (und den EVM-WebSocket des Testnets). Die Presets setzen **keinen**
gRPC-Endpunkt und **keinen** SVM-Endpunkt, auch wenn die oben genannten schreibgeschützten SVM-URLs existieren
(SVM-Transaktionen sind nicht offen): Code, der einen davon braucht, schlägt mit einem Fehler fehl, der
den zu übergebenden Endpunkt nennt. Die Testnet-Endpunkte sind pro IP ratenbegrenzt; betreiben oder
verwenden Sie für Produktionsverkehr Ihren eigenen Node. Vor 0.12.0 verwendete jedes Preset standardmäßig
localhost.

### Unterschiede, die nur das Testnet betreffen und für einen Client wichtig sind {#testnet-only}

Das Testnet ist ein Staging-Netzwerk und läuft dem Mainnet voraus, sodass einiges, was Sie
dort lesen können, im Mainnet nicht vorhanden ist (geprüft am 27. Oktober 2026; die vollständige Liste steht unter
[Unterschiede zwischen Testnet und Mainnet](/appendix/chain-parameters#testnet-differences)):

* **REST-Routen.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` und `GET /qorechain/crossvm/v1/params` antworten im Testnet. Das Mainnet antwortete darauf bis Chain v3.2.6 mit HTTP 501; seit es v3.2.6 angewendet hat (4. November 2026), antworteten alle diese Routen im Mainnet an diesem Tag mit HTTP 200. Die AMM-Routen unter `/qorechain/amm/v1/` (`pools`, `params`) antworten auf beiden Netzwerken.
* **Routen von Chain v3.2.7.** Am 7. November 2026 antwortete das Testnet mit HTTP 200 auf `GET /qorechain/pqc/v1/multisig/{address}` (`{"found":false,"multisig":null}` für eine Adresse ohne Multisig), `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` und `GET /qorechain/svm/v1/cluster_info`; das Mainnet antwortete auf alle mit HTTP 501, außer auf `/qorechain/stakingtier/v1/pool` (200) an diesem Tag, bevor es v3.2.7 angewendet hat. Seit das Mainnet v3.2.7 angewendet hat (12. November 2026), antworten diese Routen dort: Am 12. November 2026 antworteten `GET /qorechain/pqc/v1/multisig/{address}`, `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` und `GET /qorechain/svm/v1/cluster_info` im Mainnet mit HTTP 200 (die Multisig-Route lieferte `{"found":false,"multisig":null}` für eine Adresse ohne Multisig; `cluster_info` meldet `execution_enabled` false, da die SVM-Lane weiterhin aus ist). Die Abfrage des textuellen Sign-Dokuments ist eine POST-Route: `GET /qorechain/pqc/v1/textual_sign_doc` antwortet mit 501, und ein POST mit leerem Body antwortete im Mainnet mit 400 („tx_bytes or tx_json is required“), die Route ist also eingebunden. Die Routen `GET /qorechain/pqc/v1/evm_limits` und `GET /qorechain/svm/v1/params` (v3.2.8) antworteten im Mainnet mit 501. SDK 0.12.0 hat für keine der v3.2.7-Routen einen Builder oder typisierten Client.
* **Testtoken.** Drei Token ohne Wert existieren nur im Testnet, als Bank-Denominationen mit dem Namen `erc20:<EIP-55 contract address>` (Groß-/Kleinschreibung beachten): fUSD (6 Dezimalstellen), fETH (18) und fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` listet sie auf. Die einzige Bank-Denomination des Mainnets ist `uqor`. Siehe [Testnet-Testtoken (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Eingeschaltete Module.** Das Modul `abstractaccount` ist im Testnet aktiviert und im Mainnet aus, EVM-Precompiles sind im Testnet aktiv (drei am 27. Oktober, vier am 4. November) und keines im Mainnet, und die Instanziierung von QoreChain Native ist im Testnet offen.

## Standard-Ports (das Preset `localnet`) {#default-ports}

Das Preset `localnet` (Chain-ID `qorechain-devnet`, keine EVM-Chain-ID gesetzt) verwendet diese
localhost-Ports, für einen Node auf Ihrem eigenen Rechner. Vor SDK 0.12.0 verwendete jedes Preset sie
standardmäßig; seit 0.12.0 tut das nur noch `localnet`. Überschreiben Sie `endpoints`, um auf
einen anderen Node zu zeigen.

| Endpunkt | Port | Zweck |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | Bank-Guthaben, Kontoinformationen, Modul-Abfragen |
| gRPC | `9090` | gRPC-Abfragen |
| Consensus RPC | `26657` | Signieren/Übertragen nativer Txs, QoreChain Native-Lesevorgänge |
| EVM JSON-RPC | `8545` | `eth_*` (sowie `qor_*` / Precompiles auf Nodes, die sie aktivieren) |
| EVM JSON-RPC (WS) | `8546` | EVM-WebSocket-Subscriptions |
| SVM JSON-RPC | `8899` | Solana-kompatibles RPC |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

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

Wählen Sie `mainnet`, um es anzusprechen. Ab SDK 0.12.0 enthält das Preset bereits die öffentlichen
URLs, die Endpunkte unten sind also die Standardwerte; übergeben Sie `endpoints` nur für Ihren eigenen Node
(ein SDK vor 0.12.0 verwendet standardmäßig localhost und braucht sie):

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
