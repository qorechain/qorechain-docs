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
| **CosmWasm** | Contracte Rust/Wasm | `client.cosmwasm()` și funcțiile ajutătoare `queryContractSmart` / `execute` din `@qorechain/sdk` |
| **QoreChain EVM Engine** | Solidity / Vyper | `@qorechain/evm` (un adaptor viem) |
| **SVM** | Programe Solana | `@qorechain/svm` (un adaptor `@solana/web3.js`) |

Stratul nativ (Cosmos) gestionează transferurile bancare, staking-ul, guvernanța
și modulul `x/crossvm` care direcționează mesajele între runtime-uri.

## Suprafețe de citire

SDK-ul comunică cu un nod prin mai multe endpoint-uri:

- **Cosmos REST (LCD)** — solduri bancare, informații despre cont, interogări de modul.
- **RPC de consens** — folosit pentru semnarea/difuzarea tranzacțiilor native și
  pentru clientul de citire CosmWasm.
- **EVM JSON-RPC** — apeluri standard `eth_*` plus spațiul de nume QoreChain `qor_*`
  și precompile-urile EVM.
- **SVM JSON-RPC** — RPC compatibil cu Solana pentru runtime-ul SVM.

Spațiul de nume JSON-RPC `qor_*` expune citiri specifice QoreChain, cum ar fi
tokenomics, starea cheilor PQC, modul de semnătură hibridă, mesajele inter-VM și
statisticile de rețea. În TypeScript acestea sunt metode tipizate pe `client.qor`
(`QorClient`); aceeași suprafață există în SDK-urile Python, Go și Rust.

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
inter-VM** (`@qorechain/evm`), iar SDK-ul oferă funcții ajutătoare tipizate de
citire REST (`getCrossVmMessage`, `getPendingCrossVmMessages`, `getCrossVmParams`)
plus `client.qor.getCrossVMMessage(...)` pentru a urmări starea mesajelor. Vezi
[ghidul inter-VM](/sdk/guides/cross-vm).
