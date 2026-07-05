---
slug: /sdk/overview
title: Prezentare generală a SDK-ului QoreChain
sidebar_label: Prezentare generală
sidebar_position: 1
---

# SDK-ul QoreChain

SDK-ul QoreChain este kitul oficial de dezvoltare multi-limbaj pentru construirea
de aplicații descentralizate pe **QoreChain** — o rețea Layer 1 rezistentă la
atacuri cuantice, cu triplu VM.

Această documentație acoperă modul de instalare a SDK-ului, conectarea la rețea,
citirea stării on-chain, derivarea conturilor, semnarea și trimiterea
tranzacțiilor, precum și lucrul cu fiecare dintre mașinile virtuale ale
QoreChain.

## Ce este QoreChain?

QoreChain este un blockchain Layer 1 cu trei runtime-uri de contracte
inteligente de primă clasă pe un singur lanț:

- **CosmWasm** — contracte inteligente Wasm prin Cosmos SDK.
- **QoreChain EVM Engine** — execuție compatibilă Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un runtime compatibil Solana, cu un JSON-RPC în stil Solana.

Conturile, soldurile și token-urile sunt partajate între runtime-uri, iar lanțul
suportă IBC pentru interoperabilitate cross-chain.

### Rezistent la atacuri cuantice prin design

QoreChain oferă primitive de criptografie post-cuantică (PQC) bazate pe
**ML-DSA-87** (Dilithium-5, FIPS 204). Alături de semnarea clasică secp256k1,
lanțul suportă o postură de semnare **hibridă**, în care o tranzacție poartă
*atât* o semnătură clasică, cât și o semnătură post-cuantică, astfel încât
rămâne validă sub verificarea clasică de astăzi, câștigând în același timp
protecție post-cuantică.

SDK-ul expune astăzi generarea de chei, semnarea și verificarea ML-DSA-87, plus
blocurile de construcție pentru tranzacții hibride. Vezi
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc) pentru detalii. Fără
afirmații de marketing aici — SDK-ul expune exact primitivele pe care lanțul le
implementează.

## Ce diferențiază acest SDK

Dincolo de paritatea multi-chain completă, trei capabilități sunt **posibile
doar pe QoreChain**, deoarece sunt construite pe funcționalități de protocol pe
care niciun alt Layer 1 nu le are:

- **Scorare de risc AI înainte de trimitere** — scanează o tranzacție cu AI
  on-chain înainte de a o difuza. `simulateWithRiskScore` returnează gazul plus
  un verdict de risc/anomalie de la precompilări EVM deterministe, astfel încât
  un portofel sau un dApp poate avertiza (sau bloca) *înainte* de semnare. Vezi
  [AI pre-flight](/sdk/guides/ai-preflight).
- **Apeluri cross-VM unificate** — un cont, trei VM-uri, o singură tranzacție.
  `createCrossVMClient` apelează un contract pe oricare VM, iar `callAtomic`
  împachetează mai multe apeluri cross-VM într-o singură tranzacție atomică,
  semnată o singură dată. Vezi [Apeluri cross-VM](/sdk/guides/cross-vm).
- **DX rezistent la atacuri cuantice** — fă un semnatar protejat post-cuantic
  într-un singur apel idempotent (`ensurePqcRegistered` / `migrateToHybrid`),
  cu un badge React gata de utilizare. Vezi
  [Quantum-safe](/sdk/guides/quantum-safe).

Alte două capabilități la nivel de lanț au sosit în 0.6.0 și 0.7.0:

- **Conturi eth-native unificate** — o singură cheie `eth_secp256k1` este o
  singură identitate de 20 de octeți redată ca `qor1…`, `0x…` și o adresă SVM
  base58, toate partajând un singur sold. Vezi
  [Conturi unificate](/sdk/concepts/accounts-pqc#unified-accounts).
- **Benzi de autentificatori** — leagă o cheie Phantom sau MetaMask de contul
  canonic cu PQC obligatoriu și las-o să cheltuiască printr-un relayer, în
  condiții de privilegii minime, cu limite de cheltuieli și revocabile. Vezi
  [Autentificatori și cheltuire delegată](/sdk/guides/authenticators).

Un nou kit **`@qorechain/react`** (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) face din construirea unui dApp rezistent la atacuri cuantice
calea implicită — vezi [ghidul kitului React](/sdk/guides/react). Pentru
argumentația completă, citește [De ce QoreChain SDK](/sdk/why).

## Familia SDK

SDK-ul este livrat ca o familie de pachete, astfel încât să poți construi în
limbajul preferat. Acestea partajează aceleași preset-uri de rețea, scheme de
derivare, aritmetică a denominărilor și suprafețe de citire.

| Pachet | Limbaj | Instalare | Stare |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publicat (npm, v0.7.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Publicat (PyPI, v0.7.0) |
| `qorechain-sdk` (modul Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publicat (Go proxy, tag `packages/go/v0.7.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Publicat (crates.io, ultima versiune publicată; 0.7.0 din repo) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.7.0` | Publicat (Maven Central, v0.7.0) |
| `@qorechain/evm` | TypeScript (adaptor EVM) | `npm i @qorechain/evm viem` | Publicat (npm, v0.7.0) |
| `@qorechain/svm` | TypeScript (adaptor SVM) | `npm i @qorechain/svm @solana/web3.js` | Publicat (npm, v0.7.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Publicat (npm, v0.7.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publicat (npm, v0.7.0) |

> Distribuția Python se instalează ca `qorechain-sdk`, dar **se importă ca
> `qorsdk`**. Toți clienții sunt publicați în registrele lor — vezi
> [Instalare](/sdk/install) pentru comenzile specifice fiecărui limbaj.

Nucleul TypeScript (`@qorechain/sdk`) stă la baza exemplelor din această
documentație. Clienții Python, Go, Rust și Java ating **paritate completă cu
lanțul nativ** față de TypeScript: preset-uri de rețea, utilitare pentru
denominare/adrese, derivare HD a conturilor (nativ/EVM/SVM), semnare PQC
(ML-DSA-87), compozitori de mesaje tipizați pentru fiecare modul personalizat
plus modulele Cosmos standard, clienți de interogare tipizați, ciclul de viață
complet al tranzacției (auto-gas, decodarea erorilor, urmărirea tranzacțiilor,
căutare de blocuri/tranzacții), tranzacții post-cuantice hibride și abonamente
WebSocket. Toți acești clienți sunt **publicați**: TypeScript pe npm
(`@qorechain/sdk` 0.7.0), Python pe PyPI (`qorechain-sdk` 0.7.0, import
`qorsdk`), Go pe module proxy (tag `packages/go/v0.7.0`), Rust pe
crates.io (`qorechain-sdk`, ultima versiune publicată — publicarea crate-ului
0.7.0 este în așteptare, deci instalează de pe crates.io sau din repo) și Java
pe Maven Central (`io.github.qorechain:qorechain-sdk` 0.7.0). Adaptoarele de
execuție EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, ambele 0.7.0), kitul
`@qorechain/react` (0.7.0) și CLI-ul de schelet `create-qorechain-dapp`
(0.7.0) sunt exclusiv TypeScript și, de asemenea, publicate pe npm.

## Noutăți în 0.6 și 0.7

**0.6.0 — conturi eth-native unificate (lanț v3.1.83).** O singură cheie
`eth_secp256k1` este o singură identitate de 20 de octeți redată ca toate cele
trei codificări de adresă, partajând un singur sold cheltuibil pe fiecare
bandă:

```ts
import { deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
account.cosmos; // "qor1…"   (bech32, Native lane)
account.evm;    // "0x…"     (EIP-55, EVM lane)
account.svm;    // base58    (20 bytes + 12 zero bytes)
```

Semnarea pe banda nativă cu aceeași cheie se face prin `signClassicalEth` /
`signHybridEth`, iar `connectPhantomUnified` derivă un cont unificat
non-custodial dintr-o semnătură Phantom deterministă. Funcția moștenită
`deriveNativeAccount`, cu coin-type 118, rămâne neschimbată. Vezi
[Conturi unificate](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — corecție critică pentru consens.** Extensia de corp de tranzacție
`PQCHybridSignature` este acum codificată protobuf (era codificată JSON și
respinsă la CheckTx). Tranzacțiile hibride construite cu SDK ≤ 0.6.0 sunt
**respinse on-chain** — actualizează.

**0.7.0 — benzi de autentificatori (lanț v3.1.85).** O cheie legată Phantom
(ed25519) sau MetaMask (secp256k1, după adresa de 20 de octeți) poate cheltui
din contul canonic cu PQC obligatoriu printr-un relayer, în condiții de
privilegii minime, cu limite de cheltuieli și revocabile: compozitori pentru
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`, helperi cu octeți
exacți `evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`,
interogarea `permissionSchema`, coduri de eroare decodate și buildere de
portofel TypeScript (`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`,
…). Ghid complet cu exemple gata de copiat:
[Autentificatori și cheltuire delegată](/sdk/guides/authenticators).

## Unde să mergi mai departe

- [De ce QoreChain SDK](/sdk/why) — cele cinci capabilități unice pentru QoreChain.
- [Instalare](/sdk/install) — instrucțiuni de instalare pentru fiecare limbaj.
- [Pornire rapidă](/sdk/quickstart) — conectează-te, citește un sold, trimite un transfer.
- [Concepte: Arhitectură](/sdk/concepts/architecture) — modelul triplu-VM.
- [Concepte: Conturi și semnare PQC](/sdk/concepts/accounts-pqc) — chei și
  semnare post-cuantică.
- [Ghiduri](/sdk/guides/evm) — instrucțiuni pentru fiecare VM.
- [Autentificatori și cheltuire delegată](/sdk/guides/authenticators) — chei
  Phantom/MetaMask legate care cheltuiesc printr-un relayer.
- [Referință rețea și endpoint-uri](/sdk/reference/network) — id-ul lanțului, porturi, token.
- [Exemple](/sdk/examples) — fragmente rulabile, gata de copiat.
- [Referința rețea și endpoint-uri](/sdk/reference/network) apare și în [Rețele](/appendix/networks).
