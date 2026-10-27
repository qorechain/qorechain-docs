---
slug: /sdk/concepts/architecture
title: Arhitectură și concepte
sidebar_label: Arhitectură
sidebar_position: 1
---

# Arhitectură și concepte

QoreChain este un singur lanț Layer 1 care rulează trei mașini virtuale de
contracte inteligente una lângă alta, cu conturi partajate și un token partajat.

## Modelul cu triplu VM

| VM | Contracte | Suprafața de client în SDK |
| --- | --- | --- |
| **QoreChain Native** | Contracte Rust/Wasm (runtime-ul CosmWasm) | `client.cosmwasm()` și funcțiile ajutătoare `queryContractSmart` / `execute` din `@qorechain/sdk` |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (un adaptor viem) |
| **SVM** | Programe Solana | `@qorechain/svm` (un adaptor `@solana/web3.js`) |

Stratul nativ (Cosmos) gestionează transferurile bancare, staking-ul, guvernanța
și modulul `x/crossvm` care direcționează mesajele între runtime-uri.

## Suprafețe de citire

SDK-ul comunică cu un nod prin mai multe endpoint-uri:

- **Cosmos REST (LCD)** — solduri bancare, informații despre cont, interogări de modul.
- **RPC de consens** — folosit pentru semnarea/difuzarea tranzacțiilor native și
  pentru clientul de citire QoreChain Native.
- **EVM JSON-RPC** — apeluri standard `eth_*`, `net_*`, `web3_*` și `txpool_*` pe
  endpoint-urile publice. Spațiul de nume QoreChain `qor_*` nu este servit acolo (vezi
  mai jos). Precompile-urile EVM `pqcVerify` (`0x0A01`) și `pqcKeyStatus` (`0x0A02`)
  sunt active doar pe testnet; niciunul nu este activ pe mainnet (activarea necesită o
  decizie de guvernanță, fără dată). Vezi
  [Precompile-uri EVM](/developer-guide/evm-precompiles#network-status).
- **SVM JSON-RPC** — RPC compatibil cu Solana pentru runtime-ul SVM (doar în citire
  pe endpoint-urile publice; trimiterea de tranzacții SVM este dezactivată la nivelul
  întregii rețele).

Pe nodurile care îl activează, spațiul de nume JSON-RPC `qor_*` expune citiri
specifice QoreChain, cum ar fi tokenomics, starea cheilor PQC, modul de semnătură
hibridă, mesajele inter-VM și statisticile de rețea. În TypeScript acestea sunt
metode tipizate pe `client.qor` (`QorClient`); aceeași suprafață există în SDK-urile
Python, Go și Rust. Pe endpoint-urile publice folosește în schimb rutele REST (de
exemplu `GET /qorechain/pqc/v1/account/{address}` pentru starea cheii PQC și
`GET /qorechain/burn/v1/stats` pentru statisticile de ardere).

> **Încă nedisponibil:** nicio versiune de nod lansată nu servește spațiul de nume JSON-RPC `qor_`, deci fiecare apel `qor_*` returnează `-32601` (metodă negăsită) pe fiecare endpoint public astăzi. Vezi [spațiul de nume `qor_`](/api-reference/json-rpc-qor_-namespace).

## Tokenuri și denominații

- Token de afișare: **QOR**.
- Denominație de bază: **uqor**, cu **10^6** unități de bază per QOR.

Fă întotdeauna calculele financiare în unități de bază. SDK-ul oferă conversii
exacte, astfel încât să nu pierzi niciodată precizie din cauza virgulei mobile:

```ts
import { toBase, fromBase } from "@qorechain/sdk";

toBase("1.5");        // "1500000"  (QOR -> uqor)
fromBase("1500000");  // "1.5"      (uqor -> QOR)
```

> Notă: runtime-ul EVM reprezintă QOR cu 18 zecimale (convenția EVM), ceea ce este
> distinct de baza Cosmos `uqor` de 10^6. Clientul `@qorechain/evm` folosește
> implicit 18 zecimale pentru afișare. Confirmă valoarea pentru rețeaua ta țintă.

## Adrese

Același material de cheie poate fi exprimat în trei formate de adresă:

- **native** — bech32 cu prefixul `qor` (`qor1…`), validatorii folosesc
  `qorvaloper`.
- **EVM** — `0x…`, cu sumă de control EIP-55.
- **SVM** — base58 al cheii publice ed25519.

Vezi [Conturi și semnare PQC](/sdk/concepts/accounts-pqc) pentru căile de derivare.

## Inter-VM

Modulul `x/crossvm` al QoreChain permite contractelor de pe un VM să declanșeze
acțiuni pe altul. Calea EVM→nativ rulează on-chain prin **precompile-ul de punte
inter-VM** (`@qorechain/evm`; încă inactiv pe rețelele publice), iar SDK-ul oferă funcții ajutătoare tipizate de
citire REST (`getCrossVmMessage`, `getPendingCrossVmMessages`, `getCrossVmParams`)
plus `client.qor.getCrossVmMessage(...)` pentru a urmări starea mesajelor. Pe
endpoint-urile publice, funcțiile ajutătoare REST și `client.qor` nu sunt servite;
citește mesajele cu `connectQueryClients(rpc).crossvm`. Vezi
[ghidul inter-VM](/sdk/guides/cross-vm).
