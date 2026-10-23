---
slug: /sdk/install
title: Instalare
sidebar_label: Instalare
sidebar_position: 2
---

# Instalare

Instalează SDK-ul pentru limbajul tău. Nucleul TypeScript (`@qorechain/sdk`),
adaptoarele EVM și SVM (`@qorechain/evm`, `@qorechain/svm`), kit-ul React
(`@qorechain/react`) și clienții Python, Go, Rust și Java sunt toate
**publicate** în registrele lor, cu paritate completă cu lanțul nativ (mesaje
tipizate, interogări, ciclul de viață al tranzacțiilor, tranzacții PQC hibride
și abonamente WebSocket). Linia curentă de versiuni este **0.9**, publicată pe
21 octombrie 2026 (verificată pe fiecare registru în acea zi):

| Registru | Pachet | Versiune |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `create-qorechain-dapp` | 0.9.0 |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.9.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.9.0 |
| Proxy de module Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.9.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.9.1 (actualizare doar pentru Java a dependenței Bouncy Castle, fără modificări de API; celelalte limbaje rămân la 0.9.0) |

Alege limbajul tău mai jos.

## Note de actualizare {#upgrade}

:::danger Folosește SDK 0.8.1 sau mai nou pe rețelele live
Ambele rețele publice verifică forma **v2 a sign-bytes hibride** (etichetată cu
domeniu și legată de chain id) și o resping pe cea veche cu codul `pqc` 21. Fiecare
versiune a SDK-ului dinaintea **0.8.0** semnează forma veche, iar **0.8.0** caută
comutarea sub doar unul dintre cele două nume de upgrade folosite de rețele
(mainnet a înregistrat-o ca `v3.2.0`, testnet ca `v3.1.98` și ulterior `v3.2.0`),
deci semnează forma greșită pe mainnet. Folosește **0.9.0** (sau cel puțin **0.8.1**)
în fiecare limbaj; este nevoie de **0.8.2 sau mai nou** pentru a deschide o
[fereastră de autorizare EVM](/sdk/guides/evm#evm-window). Constructorii hibrizi
primesc o opțiune `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
interoghează rețeaua și are deci nevoie de endpoint-ul REST (`rest`) pe
`qorechain-vladi` / `qorechain-diana`: aruncă o eroare în loc să ghicească. Vezi
[Ce formă de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
Forma nu s-a schimbat în chain v3.2.3 sau v3.2.4 (v3.2.4 rulează pe testnet din 19 octombrie 2026 și pe mainnet din 23 octombrie 2026): `"auto"`
se rezolvă la v2 pe ambele rețele.
:::

## Ce adaugă 0.9.0 {#whats-new-090}

SDK 0.9.0 este versiunea de client pentru chain **v3.2.2** și **v3.2.3** (mainnet
le-a aplicat la înălțimile 3.556.788 și 3.662.051; ambele rețele rulează acum v3.2.4: testnet-ul din 19 octombrie 2026, mainnet-ul din 23 octombrie 2026, la înălțimea 3.742.566).
Formatul de semnare, adresele, zecimalele, memo-urile și comisioanele nu s-au
schimbat, deci forma v2 a sign-bytes hibride pe care o semnează 0.8.1 și versiunile
ulterioare este în continuare cea corectă. Ce este nou:

| Zonă | În 0.9.0 |
| --- | --- |
| `TxClient` hibrid (TypeScript) | Transmite perechea de chei a contului: `client.connectTx(signer, { pqcKeypair })` sau `TxClient.connect({ …, pqcKeypair, rest })`. Fiecare tranzacție este atunci semnată hibrid, iar `fee: "auto"` simulează chiar tranzacția hibridă; o simplă înregistrare de cheie rămâne clasică (calea de bootstrap a lanțului). `bankSend` și clienții SDK-ului pentru rollup, multilayer și cross-VM îl folosesc. Fără o pereche de chei nu se schimbă nimic |
| Cheie PQC recuperabilă | `derivePqcCanonical(address, mnemonic)` și echivalentele sale în fiecare limbaj (vezi [Quantum-safe](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Citește mai întâi starea cheii prin REST (`rest`), refuză să înregistreze când nu poate stabili starea, aruncă `PqcKeyMismatchError` când contul deține deja o altă cheie și tratează refuzul „deja înregistrat” al lanțului ca succes. Începând cu chain v3.2.3, semnează și atașează singur **dovada de posesie**; înainte de v3.2.3 lasă câmpul necompletat |
| Ferestre EVM cu domeniu restrâns | `openEvmWindowMsg` primește `nativeOnly` și `allowedTargets` (cel mult 16, fără duplicate); `fetchEvmWindow` le citește pe ambele înapoi (vezi [ghidul EVM](/sdk/guides/evm#evm-window)) |
| Consimțământ EIP-7702 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Integritatea cheilor | Constructorii de înregistrare refuză `classical_only`, o cheie goală și o cheie ML-DSA-87 degenerată, pe care lanțul le refuză începând cu v3.2.3. `signProofOfPossession` / `verifyProofOfPossession` sunt exportate; `migratePqcKeyHybrid` trimite `MsgMigratePQCKey` semnat hibrid, de care conturile cu cheie au nevoie începând cu v3.2.3 |
| Digest v2 pentru abstract account | `evmAuthSignBytesV2` (leagă limita de gaz a apelului) și `resolveEvmAuthDigestVersion`. Modulul `abstractaccount` este dezactivat pe ambele rețele, deci aceasta este doar pentru referință |
| Detectarea upgrade-urilor | `isUpgradeApplied`, `requireUpgradeApplied`: câmpurile opționale noi sunt setate doar după ce `applied_plan` raportează versiunea, deoarece un nod care nu a aplicat o versiune refuză întreaga tranzacție când este setat unul dintre câmpurile noi ale acelei versiuni |
| Decodarea erorilor | Un eșec în interiorul unui bloc își păstrează codespace-ul (de exemplu `pqc` 231, nu `sdk_231`); `rate_limited` și codurile de delegare sunt decodate; `decodeTxError` citește jurnalul sau mesajul unei erori aruncate |
| Reguli de cheltuire | `validateSpendingRules` rulează în constructorii `MsgUpdateSpendingRules` și refuză o regulă care nu limitează nimic |
| Remedieri | Ruta contului PQC este cea la singular `/qorechain/pqc/v1/account/{address}` în fiecare SDK (și în `client.rest.getPqcAccount`, `isPqcRegistered` și `getPqcStatus` când li se dă clientul compus); constanta exportată `VERSION` corespunde pachetului; clienții Go și Rust creați de SDK expiră în loc să rămână blocați; șabloanele `create-qorechain-dapp` depind de versiunea cu care sunt livrate |

Derivarea PQC legacy pentru chei noi (`derivePqcLegacy`, `"bridge"`) este
depreciată: nu este legată de cont, deci un singur mnemonic ar da o singură cheie
tuturor conturilor. Helperele de rotație o refuză ca cheie **nouă**; recuperarea
sau rotirea dintr-o cheie legacy existentă funcționează în continuare.

## Versiuni anterioare lui 0.9.0 {#before-090}

Dacă ești pe 0.8.x, aceasta semnează în continuare forma pe care o verifică ambele
rețele și funcționează pe mainnet și pe testnet (ambele v3.2.4). Acestea sunt limitele pe
care 0.9.0 le elimină, iar unele dintre ele costă un comision dacă nu le cunoști:

| Versiune anterioară lui 0.9.0 | Soluție ocolitoare |
| --- | --- |
| Fără constructori pentru dovada de posesie, ferestre cu domeniu restrâns sau consimțământ EIP-7702 | Folosește `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` și `authorize-evm-delegation` / `clear-evm-delegation` (vezi [fereastra de autorizare EVM](/getting-started/first-transaction#evm-window), [delegările EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` fără un `status` difuza înregistrarea neverificată și raporta succes când era înregistrată o altă cheie | O a doua înregistrare pentru un cont care deține deja o cheie este refuzată **după ce comisionul este perceput**. Citește mai întâi `GET /qorechain/pqc/v1/account/{address}` și transmite `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Apelau o cale `/accounts/` la plural sau namespace-ul `qor_`, pe care endpoint-urile publice nu îl servesc (HTTP 501, `-32601`). Citește ruta REST la singular de mai sus |
| `TxClient` / `bankSend` și clienții pentru rollup, multilayer și cross-VM semnau doar clasic | Rețelele refuză asta pentru orice cont care are o cheie. Trimite prin `signAndBroadcastHybrid` |
| Tranzacțiile eșuate în interiorul blocului pierdeau codespace-ul | Citește tranzacția de la `GET /cosmos/tx/v1beta1/txs/{hash}` |
| Constanta exportată `VERSION` din 0.8.3 raporta `0.8.0` | Citește versiunea instalată din `package.json` |
| `create-qorechain-dapp` 0.8.0 fixa `@qorechain/sdk` / `@qorechain/evm` la `^0.3.0` (un caret pe o versiune 0.x rămâne în interiorul lui 0.3) | Rulează `npm i @qorechain/sdk@latest` după generare |
| `@qorechain/react` 0.8.x lăsa starea cheii înregistrate necitibilă pe endpoint-urile publice | Folosește `@qorechain/react` 0.9.0 |

:::caution Remedieri mai vechi
SDK **0.6.1** a remediat un bug critic pentru consens: extensia de corp de
tranzacție `/qorechain.pqc.v1.PQCHybridSignature` era serializată ca JSON în
`Any.value` și **respinsă de lanț la CheckTx**. Tranzacțiile hibride (PQC +
clasic) construite cu SDK ≤ 0.6.0 sunt respinse on-chain. **0.8.0** a eliminat
utilitarele de cont bazate pe semnătura portofelului (vezi
[Conturi și semnare PQC](/sdk/concepts/accounts-pqc#phantom)).
:::

## TypeScript

Pachetul de bază:

```bash
npm i @qorechain/sdk
```

Vizează Node.js 20+ și livrează ESM, CommonJS și definiții de tip. Exemplele de
tranzacții hibride din această documentație importă și `StargateClient` din
`@cosmjs/stargate` (`npm i @cosmjs/stargate`).

### Adaptor EVM

`@qorechain/evm` este un adaptor subțire, type-safe peste [viem](https://viem.sh).
viem este o **dependență peer** — instaleaz-o alături:

```bash
npm i @qorechain/evm viem
```

Publicat pe npm la `0.8.0`.

### Adaptor SVM

`@qorechain/svm` este un adaptor subțire peste
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), care este o
**dependență peer**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicat pe npm la `0.8.0`.

### Kit React

`@qorechain/react` este stratul React oficial peste `@qorechain/sdk` — un
provider, hook-uri și componentele `ConnectButton` / `QuantumSafeBadge`.
`react` (>=18) este o dependență peer:

```bash
npm i @qorechain/react
```

Publicat pe npm la `0.9.0`; depinde de `@qorechain/sdk` `^0.9.0`. Vezi [ghidul kit-ului React](/sdk/guides/react).

### Generatorul de proiecte

`create-qorechain-dapp` (npm, `0.9.0`) generează un dApp gata de rulat:

```bash
npm create qorechain-dapp@latest my-dapp
```

Fișierele `package.json` generate depind de versiunea de SDK cu care este livrat
generatorul (`@qorechain/sdk` `^0.9.0`; șablonul EVM folosește `@qorechain/evm` `^0.8.0`).
Versiunea 0.8.0 a generatorului scria intervale `^0.3.0`, care pe o versiune 0.x
rămân în interiorul lui 0.3 și nu pot semna pentru rețelele live; dacă ai generat
cu 0.8.0, rulează `npm i @qorechain/sdk@latest`. Vezi [referința CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Necesită Python 3.10+. Pachetul livrează indicii de tip și un marker `py.typed`.

> Distribuția se instalează ca `qorechain-sdk` (publicat pe PyPI la `0.9.0`)
> dar **se importă ca `qorsdk`**:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Necesită Go 1.23+. Importă sub-pachetele de care ai nevoie, de exemplu:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

Publicat ca modul Go autonom (etichetat `packages/go/v0.9.0`). Fixează versiunea
în mod explicit: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.9.0`.

## Rust

```bash
cargo add qorechain-sdk
```

Sau, pentru a urmări ultima versiune din repository:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Necesită Rust 1.74+. Clienții de citire sunt asincroni (Tokio). Crate-ul se
importă ca `qorechain` (`use qorechain;`).

> Publicat pe crates.io ca `qorechain-sdk` (0.9.0); `cargo add qorechain-sdk`
> instalează cea mai recentă versiune.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.9.1</version>
</dependency>
```

Sau Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.9.1'
```

> Publicat pe Maven Central ca `io.github.qorechain:qorechain-sdk` (0.9.0 și 0.9.1
> sunt ambele servite; 0.9.1 este cea mai recentă și versiunea de lansare, verificat la 21 octombrie 2026).
> 0.9.1 este o versiune doar pentru Java care mută Bouncy Castle de la 1.80 la 1.85, conform
> notelor sale de lansare; nu are modificări de API. Central nu are o versiune 0.8.0 sau 0.8.1, așa că
> pe rețelele live folosește 0.9.x (sau 0.8.2 ori mai nou).

## Pachete conexe {#related-packages}

| Pachet | Scop | Versiune |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Utilitare pentru partea de portofel: generarea portofelului (`generateQoreWallet`), semnare hibridă `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), înregistrarea rețelei în MetaMask (`addQoreEvmToWallet`), constructori de mesaje pentru authenticator și fereastra EVM (`openEvmWindowMsg` al său construiește doar forma fără restricții), digestul v2 pentru abstract account. Nu atașează o dovadă de posesie. Dependențe peer: `@cosmjs/proto-signing` și `@cosmjs/stargate` `^0.32` (SDK-ul folosește cosmjs 0.39, deci instalarea ambelor în același proiect face ca npm să raporteze un conflict de peer, `ERESOLVE`; păstrează-le în proiecte separate sau transmite `--legacy-peer-deps`) | 0.4.0 |
| `@qorechain/chain-bridge` | Worker pe partea de server pentru backend-uri: derivă cheia PQC, semnează hibrid și difuzează (`sendTokens`, `registerPqc` și altele). Transmite `cosmosRest`: cu el, o înregistrare poartă dovada de posesie după ce rețeaua a aplicat v3.2.3, iar un refuz de aspect PQC este verificat față de lanț înainte de orice reînregistrare (o cheie înregistrată diferită ridică `pqc_key_mismatch` în loc să plătești pentru o a doua înregistrare) | 0.2.3 |
| `@qorechain/pqc` | Primitive ML-DSA / ML-KEM / SHAKE-256 strict conforme standardelor și `hybridSignBytes` (vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing)); disponibil și pe PyPI, crates.io, Maven Central și proxy-ul Go (Go `v0.2.3`) la aceeași versiune | 0.2.3 |
| `@qorechain/handles` | Rezolvare verificată de `@handle` cu fixare trust-on-first-use (`HandleClient`) | 0.1.0 |
| `@qorechain/connect` | Un singur conector pentru portofelele EVM, Cosmos și SVM, construit peste wallet adapter (intervalul său peer este `@qorechain/wallet-adapter` `^0.2.1`, care nu include 0.4.0). Nu deschide o [fereastră de autorizare EVM](/sdk/guides/evm#evm-window), deci o trimitere EVM prin el este refuzată până când contul are o cheie înregistrată și o fereastră deschisă | 0.2.1 |
| `@qorechain/rdk` | Client Rollup Development Kit (vezi [Rollup-uri](/rollups/why)). Depinde de `@qorechain/sdk` `^0.9.0` și `@qorechain/evm` `^0.8.0`, deci o aplicație pe SDK 0.9.0 partajează o singură copie a SDK-ului cu el (0.5.0 aducea SDK 0.8.3 ca o copie imbricată). Semnează hibrid doar când transmiți un `pqcKeypair`; citirile funcționează fără el. Publicat și ca `qorechain-rdk` pe PyPI, crates.io și Maven Central și ca modul Go (fixează `@v0.6.0`); acei patru clienți semnează doar clasic. Vezi [RDK 0.6.0: modificări și limite](/rollups/deploying-a-rollup#rdk-050-limits) | 0.6.0 |
| `@qorechain/rdk-cli` | CLI-ul de operator `qorollup` pentru RDK. Comenzile sale de tranzacție (`create`, `pause`, `resume`, `stop`, `withdraw`) semnează doar clasic și sunt refuzate de rețele | 0.6.0 |
| `create-qorechain-rollup` | Generator de proiecte starter pentru rollup; șabloanele sale depind de `@qorechain/rdk` `^0.6.0` și semnează hibrid când își pot rezolva cheia post-cuantică din `QORE_MNEMONIC` sau `QORE_PQC_SEED_HEX` | 0.6.0 |

## Următorul pas

Continuă la [Quickstart](/sdk/quickstart) pentru a te conecta și a citi starea de pe lanț.
