---
slug: /sdk/overview
title: Prezentare generală a SDK-ului QoreChain
sidebar_label: Prezentare generală
sidebar_position: 1
---

# SDK-ul QoreChain

SDK-ul QoreChain este kitul oficial de dezvoltare multi-limbaj pentru construirea
de aplicații descentralizate pe **QoreChain** — o rețea Layer 1 cu triplu VM
și semnături hibride ML-DSA-87 (FIPS 204).

Această documentație acoperă modul de instalare a SDK-ului, conectarea la rețea,
citirea stării on-chain, derivarea conturilor, semnarea și trimiterea
tranzacțiilor, precum și lucrul cu fiecare dintre mașinile virtuale ale
QoreChain.

## Ce este QoreChain?

QoreChain este un blockchain Layer 1 cu trei runtime-uri de contracte
inteligente de primă clasă pe un singur lanț:

- **QoreChain Native** — contracte inteligente Wasm prin Cosmos SDK (runtime-ul CosmWasm).
- **QoreChain EVM Engine** — execuție compatibilă Ethereum (Solidity, viem,
  JSON-RPC standard).
- **SVM** — un runtime compatibil Solana, cu un JSON-RPC în stil Solana.

Conturile, soldurile și token-urile sunt partajate între runtime-uri, iar lanțul
include modulul IBC pentru interoperabilitate cross-chain (niciun canal IBC nu este
deschis pe mainnet; testnet-ul are un canal `transfer` deschis către un lanț de test, verificat la 27 octombrie 2026).

:::note Ce funcționează astăzi pe rețelele live (mainnet v3.2.4, testnet v3.2.6)
**Funcționează:** citiri pe fiecare bandă, tranzacții Native semnate hibrid,
conturi unificate, tranzacții EVM în interiorul unei
[ferestre de autorizare](/sdk/guides/evm#evm-window) și citiri SVM.
**Încă indisponibile:** precompilele EVM pe mainnet (niciuna nu este activă acolo;
testnet-ul are trei active, verificare PQC, starea cheii PQC și parametrii de consens,
iar perechea AI și puntea cross-VM sunt inactive pe ambele), spațiul de nume JSON-RPC
`qor_`, tranzacțiile SVM, apelurile cross-VM pe mainnet (`MsgCrossVMCall` este
oprit de circuit breaker), încărcarea și instanțierea QoreChain Native pentru conturile
obișnuite (pe testnet, instanțierea este deschisă, iar încărcarea nu), fluxurile de
autentificator / cont abstract pe mainnet (modul oprit acolo, activat pe testnet), xQORE
și abstractizarea gazului. Fiecare ghid repetă avertismentul acolo unde se aplică.
Verificat față de endpoint-urile live la 27 octombrie 2026.

SDK-ul publicat (0.10.0, 26 octombrie 2026) semnează în forma pe care o verifică
ambele rețele (sign-bytes hibrid v2, stabilit din starea lanțului), iar formatul
de semnare, adresele, zecimalele, memo-urile și comisioanele nu s-au schimbat în
v3.2.3 sau v3.2.4 (mainnet-ul rulează v3.2.4 din 23 octombrie 2026;
testnet-ul rulează v3.2.6, aplicată pe 27 octombrie). Poartă partea de client a regulilor post-cuantice ulterioare
(dovada de posesie la înregistrarea cheii, ferestre EVM cu domeniu restrâns,
mesaje de consimțământ EIP-7702) și a lui v3.2.4 (niveluri de staking, nonce-ul
autentificatorului, comutatoarele de funcționalități de protocol); versiunile anterioare lui 0.9.0
nu o au pe prima, vezi [Versiuni anterioare lui 0.9.0](/sdk/install#before-090)
și [Ce adaugă 0.10.0](/sdk/install#whats-new-0100).

Semnare pentru portofele și backend-uri: vezi [QoreSign](/qoresign/overview).
:::

### Semnare hibridă ML-DSA-87

QoreChain oferă primitive de criptografie post-cuantică (PQC) bazate pe
**ML-DSA-87** (Dilithium-5, FIPS 204). Alături de semnarea clasică secp256k1,
lanțul suportă o postură de semnare **hibridă**, în care o tranzacție poartă
*atât* o semnătură clasică, cât și o semnătură post-cuantică, astfel încât
rămâne validă sub verificarea clasică de astăzi, câștigând în același timp
protecție post-cuantică.

SDK-ul expune astăzi generarea de chei, semnarea și verificarea ML-DSA-87, plus
blocurile de construcție pentru tranzacții hibride. Pe rețelele live, o
tranzacție pe calea Native **trebuie** să fie semnată hibrid, iar cheia ML-DSA-87
a contului trebuie înregistrată mai întâi. Vezi
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
  un portofel sau un dApp poate avertiza (sau bloca) *înainte* de semnare.
  Precompilele AI nu sunt încă active pe mainnet sau testnet. Vezi
  [AI pre-flight](/sdk/guides/ai-preflight).
- **Apeluri cross-VM unificate** — un cont, trei VM-uri, o singură tranzacție.
  `createCrossVMClient` apelează un contract pe oricare VM, iar `callAtomic`
  împachetează mai multe apeluri cross-VM într-o singură tranzacție atomică,
  semnată o singură dată. Vezi [Apeluri cross-VM](/sdk/guides/cross-vm).
- **DX pentru semnare hibridă** — înregistrează cheia ML-DSA-87 a unui semnatar
  într-un singur apel idempotent (`ensurePqcRegistered` / `migrateToHybrid`),
  cu un badge React gata de utilizare. Vezi
  [Semnare hibridă](/sdk/guides/quantum-safe).

Alte două capabilități la nivel de lanț au sosit în 0.6.0 și 0.7.0 (a doua nu
poate fi folosită încă pe rețelele live, vezi mai jos):

- **Conturi eth-native unificate** — o singură cheie `eth_secp256k1` este o
  singură identitate de 20 de octeți redată ca `qor1…`, `0x…` și o adresă SVM
  base58, toate partajând un singur sold. Vezi
  [Conturi unificate](/sdk/concepts/accounts-pqc#unified-accounts).
- **Benzi de autentificatori** — leagă o cheie Phantom sau MetaMask de contul
  canonic cu PQC obligatoriu și las-o să cheltuiască printr-un relayer, în
  condiții de privilegii minime, cu limite de cheltuieli și revocabile. Modulul
  `abstractaccount` din spatele ei este oprit pe mainnet și activat pe testnet. Vezi
  [Autentificatori și cheltuire delegată](/sdk/guides/authenticators).

Un nou kit **`@qorechain/react`** (provider, hooks, `ConnectButton`,
`QuantumSafeBadge`) face din construirea unui dApp cu semnare hibridă ML-DSA-87
calea implicită — vezi [ghidul kitului React](/sdk/guides/react). Pentru
argumentația completă, citește [De ce QoreChain SDK](/sdk/why).

## Familia SDK

SDK-ul este livrat ca o familie de pachete, astfel încât să poți construi în
limbajul preferat. Acestea partajează aceleași preset-uri de rețea, scheme de
derivare, aritmetică a denominărilor și suprafețe de citire.

| Pachet | Limbaj | Instalare | Stare |
| --- | --- | --- | --- |
| `@qorechain/sdk` | TypeScript | `npm i @qorechain/sdk` | Publicat (npm, v0.10.0) |
| `qorechain-sdk` | Python | `pip install qorechain-sdk` (import `qorsdk`) | Publicat (PyPI, v0.10.0) |
| `qorechain-sdk` (modul Go) | Go | `go get github.com/qorechain/qorechain-sdk/packages/go/...` | Publicat (Go proxy, tag `packages/go/v0.10.0`) |
| `qorechain-sdk` | Rust | `cargo add qorechain-sdk` (import `qorechain`) | Publicat (crates.io, v0.10.0) |
| `io.github.qorechain:qorechain-sdk` | Java | `io.github.qorechain:qorechain-sdk:0.10.0` | Publicat (Maven Central, v0.10.0) |
| `@qorechain/evm` | TypeScript (adaptor EVM) | `npm i @qorechain/evm viem` | Publicat (npm, v0.8.0) |
| `@qorechain/svm` | TypeScript (adaptor SVM) | `npm i @qorechain/svm @solana/web3.js` | Publicat (npm, v0.8.0) |
| `@qorechain/react` | TypeScript (kit React) | `npm i @qorechain/react` | Publicat (npm, v0.10.0) |
| `create-qorechain-dapp` | CLI | `npm create qorechain-dapp` | Publicat (npm, v0.10.0) |

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
(`@qorechain/sdk` 0.10.0), Python pe PyPI (`qorechain-sdk` 0.10.0, import
`qorsdk`), Go pe module proxy (tag `packages/go/v0.10.0`), Rust pe crates.io
(`qorechain-sdk` 0.10.0) și Java pe Maven Central
(`io.github.qorechain:qorechain-sdk` 0.10.0). Adaptoarele de
execuție EVM/SVM (`@qorechain/evm`, `@qorechain/svm`, ambele 0.8.0), kitul
`@qorechain/react` (0.10.0) și CLI-ul de schelet `create-qorechain-dapp`
(0.10.0) sunt exclusiv TypeScript și, de asemenea, publicate pe npm. Vezi
[Instalare](/sdk/install#related-packages) pentru pachetele însoțitoare.

## Noutăți în 0.6, 0.7, 0.8, 0.9 și 0.10

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
`signHybridEth`, iar o cheie Phantom sau MetaMask se leagă de cont ca autentificator
(derivarea dintr-o semnătură Phantom a fost eliminată în 0.8.0). Funcția moștenită
`deriveNativeAccount`, cu coin-type 118, rămâne neschimbată. Vezi
[Conturi unificate](/sdk/concepts/accounts-pqc#unified-accounts).

**0.6.1 — corecție critică pentru consens.** Extensia de corp de tranzacție
`PQCHybridSignature` este acum codificată protobuf (era codificată JSON și
respinsă la CheckTx). Tranzacțiile hibride construite cu SDK ≤ 0.6.0 sunt
**respinse on-chain** — actualizează.

**0.7.0 — benzi de autentificatori (lanț v3.1.85).** Modulul `abstractaccount`
din spatele lor este oprit în prezent pe mainnet și activat pe testnet (vezi
[ghidul Autentificatori](/sdk/guides/authenticators)). O cheie legată Phantom
(ed25519) sau MetaMask (secp256k1, după adresa de 20 de octeți) poate cheltui
din contul canonic cu PQC obligatoriu printr-un relayer, în condiții de
privilegii minime, cu limite de cheltuieli și revocabile: compozitori pentru
`MsgExecuteEVM` / `MsgExecuteCosmos` / `MsgRotatePQCKey`, helperi cu octeți
exacți `evmAuthSignBytes` / `cosmosAuthSignBytes` / `rotationSignBytes`,
interogarea `permissionSchema`, coduri de eroare decodate și buildere de
portofel TypeScript (`buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm`,
…). Ghid complet cu exemple gata de copiat:
[Autentificatori și cheltuire delegată](/sdk/guides/authenticators).

**0.8.0 – 0.8.3 — sign-bytes hibrid v2 și fereastra de autorizare EVM (lanț
v3.2.0).** Jumătatea post-cuantică a unei tranzacții hibride este acum semnată în
forma pe care o verifică rețeaua țintă (v1 sau v2, `signBytesVersion: "auto" | "v1" | "v2"`).
Ambele rețele publice sunt pe v2, așa că este necesar SDK **0.8.1 sau mai nou**
pentru a tranzacționa pe mainnet (folosește versiunea curentă). **0.8.2** adaugă `openEvmWindowMsg`,
`closeEvmWindowMsg`, `fetchEvmWindow` și `classifyEvmWindowRejection` pentru
[fereastra de autorizare](/sdk/guides/evm#evm-window) a benzii EVM.
**0.8.0** a eliminat helperii de cont bazați pe semnătura portofelului (`connectPhantomUnified` și
`unifiedAccountFromPhantomSignature`, eliminate în 0.8.0), aplică verificări stricte
ale dimensiunilor ML-DSA-87 în fiecare limbaj și adaugă flag-ul `async` și datele
returnate de callee la apelurile cross-VM. **0.8.3** corectează căutarea
tranzacțiilor, cursele (race conditions) din hook-urile React, secvențierea
`migrate_to_hybrid` din Python și derivarea PQC canonică independentă de forma
adresei (`derivePqcCanonical`, `canonicalAccount`). Vezi
[Note de upgrade](/sdk/install#upgrade).

**0.9.0 — suport de client pentru chain v3.2.2 și v3.2.3.** `TxClient` din TypeScript
semnează hibrid când transmiți perechea de chei a contului
(`client.connectTx(signer, { pqcKeypair })`), astfel încât `bankSend` și clienții
SDK-ului pentru rollup, multilayer și cross-VM funcționează pe rețelele publice.
`ensurePqcRegistered` verifică mai întâi prin REST cheia înregistrată, refuză să
înregistreze o a doua cheie, diferită, și atașează singur dovada de posesie după ce
rețeaua a aplicat v3.2.3. Constructori noi acoperă ferestrele EVM cu domeniu restrâns
(`nativeOnly`, `allowedTargets`) și mesajele de consimțământ EIP-7702, iar
`derivePqcCanonical(address, mnemonic)` oferă în fiecare limbaj o cheie pe care o
poți recupera din mnemonic. Ruta contului PQC este cea la singular
`/qorechain/pqc/v1/account/{address}`, eșecurile din interiorul unui bloc își păstrează
codespace-ul, iar `create-qorechain-dapp` generează proiecte pe SDK-ul curent. Vezi
[Ce a adăugat 0.9.0](/sdk/install#whats-new-090).

**0.10.0 — suport de client pentru chain v3.2.4.** Compozitori și citiri pentru
nivelurile de staking (`lockDelegation`, `unlockEarly`, `claimBonus`,
`fetchStakingTierParams`, `fetchStakingLocks`), `fetchAuthNonce` pentru următoarea
secvență a unei chei legate, `fetchProtocolFeatures` / `isProtocolFeatureEnabled`
pentru regulile de consens pe care o rețea le aplică după nume, `possessionProven`
în starea PQC și `ibcTimeoutTimestamp`. `ensurePqcRegistered` compară acum cheia
înregistrată în loc să se bazeze pe o stare fără ea, iar o refuzare din partea
lanțului care sosește ca text în timpul simulării taxei este numită în fiecare limbaj.
Vezi [Ce adaugă 0.10.0](/sdk/install#whats-new-0100).

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
