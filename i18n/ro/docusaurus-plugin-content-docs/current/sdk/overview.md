---
slug: /sdk/overview
title: Prezentare generală a SDK-ului QoreChain
sidebar_label: Prezentare generală
sidebar_position: 1
---

# SDK-ul QoreChain

SDK-ul QoreChain este kitul oficial multi-limbaj pentru dezvoltatori, destinat
construirii de aplicații descentralizate pe **QoreChain** — o rețea Layer 1
rezistentă la atacuri cuantice, cu trei mașini virtuale.

Această documentație acoperă modul de instalare a SDK-ului, conectarea la rețea,
citirea stării on-chain, derivarea conturilor, semnarea și trimiterea
tranzacțiilor, precum și lucrul cu fiecare dintre mașinile virtuale ale
QoreChain.

## Ce este QoreChain?

QoreChain este un blockchain Layer 1 cu trei runtime-uri de contracte
inteligente de primă clasă pe un singur lanț:

- **CosmWasm** — contracte inteligente Wasm prin Cosmos SDK.
- **QoreChain EVM Engine** — execuție compatibilă cu Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un runtime compatibil cu Solana, cu un JSON-RPC în stil Solana.

Conturile, soldurile și tokenurile sunt partajate între runtime-uri, iar lanțul
suportă IBC pentru interoperabilitate cross-chain.

### Rezistent la atacuri cuantice prin design

QoreChain oferă primitive de criptografie post-cuantică (PQC) bazate pe
**ML-DSA-87** (Dilithium-5, FIPS 204). Pe lângă semnarea clasică secp256k1,
lanțul suportă o postură de semnare **hibridă** în care o tranzacție poartă
*atât* o semnătură clasică, *cât și* o semnătură post-cuantică, astfel încât
rămâne validă sub verificarea clasică de astăzi, câștigând totodată protecție
post-cuantică.

SDK-ul expune astăzi generarea de chei ML-DSA-87, semnarea și verificarea, plus
componentele de bază pentru tranzacțiile hibride. Vezi
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc) pentru detalii. Fără
afirmații de marketing aici — SDK-ul expune exact primitivele pe care le
implementează lanțul.

## Ce diferențiază acest SDK

Dincolo de paritatea completă multi-chain, trei capabilități sunt **posibile
doar pe QoreChain**, deoarece sunt construite pe funcționalități de protocol pe
care nu le are niciun alt Layer 1:

- **Scoring de risc AI pre-flight** — scanează o tranzacție cu AI on-chain
  înainte de a o difuza. `simulateWithRiskScore` returnează gazul plus un verdict
  de risc/anomalie de la precompilatele EVM deterministe, astfel încât un portofel
  sau un dApp poate avertiza (sau bloca) *înainte* de semnare. Vezi
  [AI pre-flight](/sdk/guides/ai-preflight).
- **Apeluri cross-VM unificate** — un singur cont, trei VM-uri, o singură
  tranzacție. `createCrossVMClient` apelează un contract pe orice VM, iar
  `callAtomic` împachetează mai multe apeluri cross-VM într-o singură tranzacție
  atomică semnată o singură dată. Vezi
  [Apeluri cross-VM](/sdk/guides/cross-vm).
- **DX rezistent la atacuri cuantice** — fă un semnatar protejat post-cuantic
  printr-un singur apel idempotent (`ensurePqcRegistered` / `migrateToHybrid`),
  cu un badge React gata de utilizare. Vezi
  [Rezistent la atacuri cuantice](/sdk/guides/quantum-safe).

Un nou kit **`@qorechain/react`** (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) face din construirea unui dApp rezistent la atacuri cuantice
calea implicită — vezi
[ghidul kitului React](/sdk/guides/react). Pentru argumentația completă,
citește [De ce SDK-ul QoreChain](/sdk/why).

## Familia SDK

SDK-ul este livrat ca o familie de pachete, astfel încât să poți construi în
limbajul ales. Acestea partajează aceleași presetări de rețea, scheme de
derivare, calcul al denominării și suprafețe de citire.

| Pachet | Limbaj | Instalare | Stare |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publicat (npm, v0.5.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Publicat (PyPI, v0.5.0) |
| `qorechain-sdk` (modul Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publicat (Go proxy, v0.5.0) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` | Publicat (crates.io, v0.5.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.5.0` | Publicat (Maven Central, v0.5.0) |
| `@qorechain/evm` | TypeScript (adaptor EVM) | `npm i @qorechain/evm viem` | Publicat (npm, v0.5.0) |
| `@qorechain/svm` | TypeScript (adaptor SVM) | `npm i @qorechain/svm @solana/web3.js` | Publicat (npm, v0.5.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Publicat (npm, v0.5.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publicat (npm, v0.5.0) |

> Distribuția Python se instalează ca `qorechain-sdk`, dar se **importă ca
> `qorsdk`**. Toți clienții sunt publicați în registrele lor — vezi
> [Instalare](/sdk/install) pentru comenzile per limbaj.

Nucleul TypeScript (`@qorechain/sdk`) stă la baza exemplelor din această
documentație. Clienții Python, Go, Rust și Java ating **paritate completă cu
lanțul nativ** față de TypeScript: presetări de rețea, utilitare denom/adresă,
derivare de conturi HD (nativ/EVM/SVM), semnare PQC (ML-DSA-87), compozitoare
tipizate de mesaje pentru fiecare modul personalizat plus modulele Cosmos
standard, clienți de interogare tipizați, ciclul complet de viață al
tranzacției (auto-gas, decodarea erorilor, urmărirea tx, căutare bloc/tx),
tranzacții hibride post-cuantice și abonamente WebSocket. Toți acești clienți
sunt **publicați**: TypeScript pe npm (`@qorechain/sdk` 0.5.0), Python pe PyPI
(`qorechain-sdk` 0.5.0, import `qorsdk`), Go pe proxy-ul de module
(`.../packages/go` 0.5.0), Rust pe crates.io (`qorechain-sdk` 0.5.0) și Java pe
Maven Central (`io.github.qorechain:qorechain-sdk` 0.5.0). Adaptoarele de
execuție EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, ambele 0.5.0), kitul
`@qorechain/react` (0.5.0) și CLI-ul de schelărie `create-qorechain-dapp` sunt
exclusiv TypeScript și sunt, de asemenea, publicate pe npm.

Lansarea v0.4 a adăugat retrageri din rollup (`MsgExecuteWithdrawal`, calea de
ieșire L2→L1), clienți de interogare tipizați pentru modulele `multilayer`,
`rdk` și `bridge`, mesaje de administrare a bridge-ului și helperi de nivel înalt
pentru sidechain/paychain și rollup în toate cele cinci limbaje.

## Unde să mergi mai departe

- [De ce SDK-ul QoreChain](/sdk/why) — cele trei capabilități unice pentru QoreChain.
- [Instalare](/sdk/install) — instrucțiuni de instalare per limbaj.
- [Quickstart](/sdk/quickstart) — conectare, citirea unui sold, trimiterea unui transfer.
- [Concepte: Arhitectură](/sdk/concepts/architecture) — modelul cu trei VM-uri.
- [Concepte: Conturi și semnare PQC](/sdk/concepts/accounts-pqc) — chei și
  semnare post-cuantică.
- [Ghiduri](/sdk/guides/evm) — instrucțiuni per VM.
- [Referință rețea și endpoint-uri](/sdk/reference/network) — chain id, porturi, token.
- [Exemple](/sdk/examples) — fragmente de cod rulabile, gata de copiat.
- [Referință rețea și endpoint-uri](/sdk/reference/network) este disponibilă și în [Rețele](/appendix/networks).
