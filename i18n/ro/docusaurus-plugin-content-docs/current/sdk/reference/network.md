---
slug: /sdk/reference/network
title: Rețea și endpoint-uri
sidebar_label: Rețea și endpoint-uri
sidebar_position: 1
---

# Referință rețea și endpoint-uri

## Mainnet

| Câmp | Valoare |
| --- | --- |
| Presetare de rețea | `mainnet` |
| Chain id | `qorechain-vladi` (live din 7 iunie 2026) |
| Versiune lanț (12 noiembrie 2026) | v3.2.7 (de la înălțimea 4,164,600, 12 noiembrie 2026, propunerea de guvernanță 16; v3.2.6 a fost aplicată la înălțimea 4,020,000 pe 4 noiembrie, v3.2.5 la înălțimea 3,906,833 pe 29 octombrie, iar v3.2.4 la înălțimea 3,742,566 pe 23 octombrie). SDK 0.12.0 este clientul pentru v3.2.5 și funcționează pe v3.2.6 și v3.2.7 (formatul de semnare nu s-a schimbat); 0.10.0 a fost clientul pentru v3.2.4 |
| ID lanț EVM | `9801` |
| Token afișat | `QOR` |
| Denominare de bază | `uqor` |
| Unități de bază per QOR | `10^6` |
| Prefix bech32 cont | `qor` |
| Prefix bech32 validator | `qorvaloper` |

## Testnet

| Câmp | Valoare |
| --- | --- |
| Presetare de rețea | `testnet` |
| Chain id | `qorechain-diana` (live) |
| Versiune lanț | v3.2.8 (de la înălțimea 9,929,500, 12 noiembrie 2026, aplicată prin guvernanță; mainnet-ul nu a aplicat-o. v3.2.7 a fost aplicată la înălțimea 9,594,600 pe 6 noiembrie; v3.2.6 a fost aplicată la înălțimea 8,970,638 pe 27 octombrie; v3.2.5 a fost aplicată la înălțimea 8,890,800 pe 26 octombrie, iar v3.2.4 la înălțimea 8,337,253 pe 19 octombrie) |
| ID lanț EVM | `9800` |
| Token afișat | `QOR` |
| Denominare de bază | `uqor` |
| Unități de bază per QOR | `10^6` |
| Prefix bech32 cont | `qor` |
| Prefix bech32 validator | `qorvaloper` |

## Endpoint-uri publice {#public-endpoints}

| Endpoint | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (ID lanț 9801) | `https://evm-testnet.qore.host` (ID lanț 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (doar citire) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

Endpoint-urile EVM servesc `eth_`, `net_`, `web3_` și `txpool_`; namespace-ul
`qor_` nu este activat. Vezi și [Rețele](/appendix/networks#public-endpoints).

Începând cu SDK 0.12.0, presetările `mainnet` și `testnet` folosesc implicit aceste URL-uri REST, RPC de consens și
JSON-RPC EVM (și WebSocket-ul EVM de testnet). Presetările nu setează **niciun** endpoint
gRPC și **niciun** endpoint SVM, deși URL-urile SVM doar-citire de mai sus există
(tranzacțiile SVM nu sunt deschise): codul care are nevoie de unul dintre ele eșuează cu o eroare care
numește endpoint-ul de transmis. Endpoint-urile de testnet sunt limitate ca rată per IP; rulați sau
folosiți propriul nod pentru traficul de producție. Înainte de 0.12.0, fiecare presetare folosea implicit
localhost.

### Diferențe doar de testnet care contează pentru un client {#testnet-only}

Testnet-ul este o rețea de staging și rulează înaintea mainnet-ului, deci câteva lucruri
pe care le puteți citi acolo nu există pe mainnet (verificat la 27 octombrie 2026; lista
completă se află în
[Diferențe între testnet și mainnet](/appendix/chain-parameters#testnet-differences)):

* **Rute REST.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` și `GET /qorechain/crossvm/v1/params` răspund pe testnet. Mainnet-ul răspundea cu HTTP 501 pentru ele până la lanțul v3.2.6; de când a aplicat v3.2.6 (4 noiembrie 2026), toate acele rute au răspuns HTTP 200 pe mainnet când au fost verificate în acea zi. Rutele AMM de sub `/qorechain/amm/v1/` (`pools`, `params`) răspund pe ambele rețele.
* **Rute ale lanțului v3.2.7.** Pe 7 noiembrie 2026 testnet-ul a răspuns HTTP 200 pentru `GET /qorechain/pqc/v1/multisig/{address}` (`{"found":false,"multisig":null}` pentru o adresă fără multisig), `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` și `GET /qorechain/svm/v1/cluster_info`; mainnet-ul a răspuns HTTP 501 pentru toate, cu excepția `/qorechain/stakingtier/v1/pool` (200) în acea zi, înainte să aplice v3.2.7. De când mainnet-ul a aplicat v3.2.7 (12 noiembrie 2026), aceste rute răspund acolo: pe 12 noiembrie 2026, `GET /qorechain/pqc/v1/multisig/{address}`, `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` și `GET /qorechain/svm/v1/cluster_info` au răspuns HTTP 200 pe mainnet (ruta multisig a returnat `{"found":false,"multisig":null}` pentru o adresă fără multisig; `cluster_info` raportează `execution_enabled` false, deoarece lane-ul SVM este încă oprit). Interogarea documentului de semnare textual este o rută POST: `GET /qorechain/pqc/v1/textual_sign_doc` răspunde 501, iar un POST cu corp gol a răspuns 400 („tx_bytes or tx_json is required") pe mainnet, deci ruta este montată. Rutele `GET /qorechain/pqc/v1/evm_limits` și `GET /qorechain/svm/v1/params` (v3.2.8) au răspuns 501 pe mainnet. SDK 0.12.0 nu are builder sau client tipizat pentru niciuna dintre rutele v3.2.7.
* **Tokenuri de test.** Trei tokenuri fără valoare există doar pe testnet, ca denominații bank numite `erc20:<EIP-55 contract address>` (sensibile la majuscule): fUSD (6 zecimale), fETH (18) și fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` le listează. Singura denominație bank a mainnet-ului este `uqor`. Vezi [Tokenuri de test pe testnet (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Module pornite.** Modulul `abstractaccount` este activat pe testnet și oprit pe mainnet, precompilate EVM sunt active pe testnet (trei pe 27 octombrie, patru pe 4 noiembrie) și niciunul pe mainnet, iar instanțierea QoreChain Native este deschisă pe testnet.

## Porturi implicite (presetarea `localnet`) {#default-ports}

Presetarea `localnet` (chain id `qorechain-devnet`, fără chain id EVM setat) folosește aceste
porturi localhost, pentru un nod de pe propria ta mașină. Înainte de SDK 0.12.0, fiecare presetare le
folosea implicit; începând cu 0.12.0 doar `localnet` o face. Suprascrie `endpoints` pentru a indica
spre alt nod.

| Endpoint | Port | Scop |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | solduri bank, info cont, interogări de modul |
| gRPC | `9090` | interogări gRPC |
| Consensus RPC | `26657` | semnare/difuzare tx native, citiri QoreChain Native |
| EVM JSON-RPC | `8545` | `eth_*` (și `qor_*` / precompilate pe nodurile care le activează) |
| EVM JSON-RPC (WS) | `8546` | abonamente WebSocket EVM |
| SVM JSON-RPC | `8899` | RPC compatibil cu Solana |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

Exemplu cu endpoint-uri explicite:

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

SDK-ul expune presetări de rețea și helperi de căutare (exportați din modulul
networks), astfel încât să poți lista și rezolva rețele programatic. În
Python/Go/Rust echivalentele sunt `create_client` / `CreateClient` /
`ClientBuilder` plus modulul `networks`.

## Țintirea mainnet-ului

Selectează `mainnet` pentru a-l ținti. Începând cu SDK 0.12.0, presetarea poartă deja URL-urile
publice, deci endpoint-urile de mai jos sunt valorile implicite; transmite `endpoints` doar pentru propriul nod
(un SDK anterior lui 0.12.0 folosește implicit localhost și are nevoie de ele):

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
