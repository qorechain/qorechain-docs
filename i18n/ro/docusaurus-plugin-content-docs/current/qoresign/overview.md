---
slug: /qoresign/overview
title: Prezentare generală QoreSign
sidebar_label: Prezentare generală
sidebar_position: 1
---

# QoreSign

QoreSign este o bibliotecă open-source pentru semnarea hibridă secp256k1 + ML-DSA-87 (FIPS 204) pe QoreChain, destinată portofelelor, burselor, custozilor și backend-urilor.

QoreSign permite unui portofel diferit de cel propriu al QoreChain să deriveze cheia ML-DSA-87 a unui cont, să semneze cu ambele chei tranzacțiile de pe lane-ul nativ, să verifice local semnăturile hibride, să semneze mesaje arbitrare, să simuleze o tranzacție înainte de semnare, să citească înapoi cum a fost protejată o tranzacție confirmată și să implementeze Sign In With QoreChain. Este un strat subțire peste bindingurile [`qorechain-pqc`](https://github.com/qorechain/qorechain-pqc) și nu adaugă primitive criptografice proprii. Este întreținut de QoreChain Association sub licența Apache-2.0.

Versiunea curentă este **0.1.1** (27 octombrie 2026). Este publicată în TypeScript, Rust, Go, Kotlin (JVM și Android), Swift și, nou în 0.1.1, Python. Sursa, exemplele și vectorii de test se găsesc în depozitul [qorechain/qoresign](https://github.com/qorechain/qoresign). Funcționează pe mainnet (`qorechain-vladi`) și pe testnet (`qorechain-diana`).

## Ce face QoreSign pe fiecare lane {#lanes}

| Lane | Ce face QoreSign astăzi |
|---|---|
| **Nativ** (Cosmos SDK) | Semnare și verificare hibridă. Rețeaua cere implicit semnătura ML-DSA-87. |
| **EVM** | Doar fereastra de autorizare: contul înregistrează o cheie ML-DSA-87 și deschide, de pe lane-ul nativ, o fereastră de autorizare limitată. Tranzacțiile Ethereum în sine nu poartă nicio semnătură ML-DSA-87. |
| **SVM** | Încă neactivat în rețea (`LANE_NOT_AVAILABLE`). |

Semnarea hibridă EVM necesită mai întâi suport PQC per lane în rețea. Vezi [Portofele EVM: fereastra de autorizare](/qoresign/guides/evm-quantum-ready).

## Ce face {#what-it-does}

Nucleul offline, identic în fiecare limbaj:

- Derivă cheia clasică pe `m/44'/118'/0'/0/0` (`deriveClassicalKey`) și cheia ML-DSA-87 canonică pe care portofelele QoreChain o înregistrează pentru un cont (`deriveCanonicalPqKey`, legată de mnemonică și de adresă). O derivare HD întărită există ca draft (`deriveHdPqKey`); `pqKeyFromSeed` reconstruiește o pereche de chei din seed-ul ei de 32 de octeți.
- Construiește și parsează adrese `qor1` pentru conturi `secp256k1` și `eth_secp256k1`.
- Semnează o tranzacție de pe lane-ul nativ cu ambele chei (`signHybrid`) sau adaugă doar stratul ML-DSA-87 la un corp construit de un dApp (`signPqLayer`). Semnăturile ML-DSA-87 sunt deterministe implicit; semnarea hedged este o opțiune, iar rețeaua le acceptă pe amândouă. secp256k1 folosește RFC 6979 cu low-S.
- Calculează sign-bytes hibrid v1 și v2 (`hybridSignBytes`) și verifică o tranzacție hibridă completă (`verifyHybridTx`) sau doar stratul ML-DSA-87 (`verifyPqLayer`).
- Construiește `MsgRegisterPQCKeyV2` cu dovadă de posesie (`buildRegisterPqKeyMessage`, `signProofOfPossession`) și refuză cheile publice degenerate.
- Semnează și verifică mesaje arbitrare (`signMessage`, `verifyMessage`) și implementează Sign In With QoreChain v1 (`createSiwqMessage`, `signSiwq`, `verifySiwq`).
- Aplică în cod regulile pe lane-uri (`decideLane`, `assertHybridLane`, `evaluateLayerState`). Erorile poartă un cod stabil, comun tuturor limbajelor (`QoreSignError`, de exemplu `INVALID_MNEMONIC`, `LANE_NOT_AVAILABLE`, `KEY_NOT_REGISTERED`).

Helperi de rețea (TypeScript `@qorechain/qoresign/network`; Go `github.com/qorechain/qoresign/go/network` le are pe toate, cu excepția celor două noi):

- `fetchPqKeyStatus`: dacă o cheie ML-DSA-87 este înregistrată pentru o adresă și care anume.
- `resolveSignBytesVersion`: ce formă de sign-bytes verifică rețeaua.
- `simulateTx` (gas consumat, limită de gas sugerată, variații de sold pe adresă), `suggestGasLimit`, `broadcastTx` și `submitWithSignBytesFallback` (o reîncercare cu cealaltă formă de sign-bytes când rețeaua o refuză pe prima).
- `assertPqLayerMatchesRegisteredKey`: verifică un strat furnizat de un dApp față de cheia de pe lanț, înainte ca portofelul să adauge semnătura clasică.
- `verifySiwqWithChain` și `verifyMessageWithChain`: verificare față de cheia înregistrată pe lanț.
- `fetchCommittedExtensionTypeUrls`: citește înapoi ce extensii a purtat o tranzacție confirmată.
- Nou în 0.1.1, doar TypeScript: `inspectTransaction` și `fetchEvmWindow`, descrise mai jos.

## Noutăți în 0.1.1 {#new-in-0-1-1}

- **Python.** Pachetul `qorechain-qoresign` (import `qoresign`) se află pe PyPI, cu wheel-uri pentru macOS și Linux. Leagă implementarea Rust și reproduce aceiași vectori de test. Este offline, ca bindingurile Swift și Kotlin: fără helperi de rețea.
- **Inspectorul de tranzacții (bibliotecă).** `inspectTransaction` citește o tranzacție confirmată și raportează cum a fost protejată. Vezi [Inspectorul de tranzacții](#inspector).
- **Cititorul ferestrei EVM.** `fetchEvmWindow` citește fereastra de autorizare EVM a unui cont.
- **Corecții de ambalare.** Arhiva binary framework Swift nu mai conține un folder resource-fork rătăcit, iar bibliotecile native macOS din pachetele Kotlin și Python nu mai înregistrează directorul de build drept nume de instalare.

## Inspectorul de tranzacții {#inspector}

`inspectTransaction({ rest, chainId, txhash, rpc? })` este o funcție doar de citire din `@qorechain/qoresign/network`. Preia o tranzacție confirmată și returnează:

- mesajele, memo-ul, codul rezultatului, înălțimea și taxa;
- semnatarul: adresă, tip de cheie, cheie publică și secvență;
- dacă semnătura clasică se verifică;
- starea stratului ML-DSA-87: prezent sau nu, câte straturi, dacă stratul se verifică față de cheia pe care semnatarul o are înregistrată acum și ce formă de sign-bytes a folosit;
- un nivel de securitate, cu aceeași clasificare ca explorerul public: `pqc` (poartă stratul ML-DSA-87), `enrollment` (înregistrează sau rotește o cheie ML-DSA-87, care se semnează intenționat cu cheia clasică), `shake` (o tranzacție de pe lane-ul nativ fără strat) sau `classical` (o tranzacție de pe lane-ul EVM).

Returnează `undefined` pentru un hash pe care rețeaua nu-l cunoaște. Transmiteți un endpoint `rpc` pentru a citi de la un nod octeții exacți confirmați; fără el, funcția folosește octeți re-codificați de gateway-ul REST. Nu trimite nimic și nu are nevoie de cont sau de cheie.

```js
import { fetchEvmWindow, fetchPqKeyStatus, inspectTransaction } from "@qorechain/qoresign/network";

const rest = "https://api-testnet.qore.host";
const address = "qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08"; // public testnet faucet account

const status = await fetchPqKeyStatus({ rest, address });
console.log("ML-DSA-87 key registered:", status.registered);

const tx = await inspectTransaction({ rest, chainId: "qorechain-diana", txhash: process.argv[2] });
console.log(tx?.tier, tx?.pqLayer, tx?.messages.map((m) => m.typeUrl));

const win = await fetchEvmWindow({ rest, address });
console.log("EVM window:", win.found, win.live);
```

Salvați-l ca `inspect.mjs` și rulați `node inspect.mjs <txhash>` cu hash-ul unei tranzacții de testnet. Rulat pe un transfer recent al faucet-ului de pe testnet, a afișat `ML-DSA-87 key registered: true`, nivelul `pqc`, `pqLayer { present: true, count: 1, algorithmId: 1, verified: true, signBytesVersion: 'v2' }`, mesajul `/cosmos.bank.v1beta1.MsgSend` și `EVM window: false false`.

`fetchEvmWindow({ rest, address })` returnează `found`, `live`, înălțimile de deschidere și de expirare, numărul maxim și cel folosit de tranzacții și de valoare, blocurile, tranzacțiile și valoarea rămase, `nativeOnly` și `allowedTargets`.

Aceasta este funcția din bibliotecă. Pagina [Developers](/dashboard/developers) din dashboard nu are încă un tab Transaction inspector.

## La ce se folosește {#use-cases}

1. **Un portofel compatibil Keplr adaugă semnarea hibridă QoreChain.** Leap, Cosmostation sau un portofel nou produce semnătura secp256k1 prin `signDirect`. Cu QoreSign, derivă cheia ML-DSA-87 a contului din aceeași mnemonică și adaugă stratul (`signPqLayer`) înainte de semnare. Vezi [ghidul pentru portofele](/qoresign/guides/keplr-compatible-wallets).
2. **O bursă sau un custode semnează retragerile pe propriile servere.** Un serviciu de portofel hot sau warm în Go sau Rust semnează transferuri de pe lane-ul nativ cu `signHybrid`, le simulează mai întâi (`simulateTx`, Go și TypeScript) ca să vadă variațiile de sold și gas-ul, și le difuzează cu `submitWithSignBytesFallback`. [Custody kit](/developer-tools/custody-kit) se construiește pe această bază.
3. **Un backend implementează Sign In With QoreChain.** Serverul emite un nonce de unică folosință, portofelul semnează un mesaj de autentificare, iar serverul apelează `verifySiwqWithChain`. Vezi [ghidul de autentificare](/qoresign/guides/sign-in).
4. **Un instrument de conformitate sau de suport verifică cum a fost protejată o tranzacție.** `inspectTransaction` raportează dacă o tranzacție confirmată a purtat un strat ML-DSA-87 verificat, ce formă de sign-bytes a folosit și nivelul ei.
5. **Un portofel afișează fereastra de autorizare a unui cont EVM.** Înainte ca un utilizator să trimită dintr-un portofel EVM, `fetchEvmWindow` arată dacă o fereastră este activă și câte tranzacții și cât din valoare au rămas.
6. **O echipă Python semnează rapoarte sau aprobări.** `qoresign.sign_message` produce o semnătură hibridă peste octeți arbitrari, pe care o poate verifica orice alt limbaj QoreSign.
7. **Un portofel mobil pe iOS sau Android.** Pachetul Swift și AAR-ul Android oferă aceeași derivare, semnare și autentificare ca pachetul TypeScript, octet cu octet.
8. **Auditorii și integratorii verifică semnăturile offline.** `verifyHybridTx`, `verifyPqLayer` și `verifyMessage` rulează fără rețea, pe baza cheilor publice.

## Cum funcționează {#how-it-works}

- **O tranzacție hibridă** este un `TxRaw` obișnuit din Cosmos SDK, semnat de două ori de același cont: o semnătură ML-DSA-87 purtată în corpul tranzacției ca opțiune de extensie `/qorechain.pqc.v1.PQCHybridSignature` (id de algoritm `1`) și o semnătură secp256k1 `SIGN_MODE_DIRECT` peste corpul final.
- **Sign-bytes v2** (verificați astăzi de ambele rețele publice) sunt `"qorechain-pqc-hybrid-v2"`, apoi id-ul lanțului, corpul fără extensia PQC și auth info, fiecare cu prefix de lungime. Semnătura ML-DSA-87 acoperă astfel taxa. Semnătura clasică acoperă corpul final, inclusiv extensia. v1 este păstrat pentru a reproduce semnături mai vechi. Vezi [Semnarea hibridă a tranzacțiilor v1](/qoresign/spec/hybrid-signing-v1).
- **Ordinea:** codificați corpul și auth info, calculați sign-bytes și semnătura ML-DSA-87, adăugați extensia, apoi semnați SignDoc cu secp256k1 și difuzați.
- **Înregistrarea:** `MsgRegisterPQCKeyV2` poartă cheia publică ML-DSA-87, cheia secp256k1 comprimată a contului și o dovadă de posesie. Tranzacția de înregistrare se semnează doar cu cheia clasică.
- **Separarea domeniilor:** fiecare semnătură ML-DSA-87 începe cu un prefix rezervat, astfel încât o semnătură de mesaj sau de autentificare nu poate fi reutilizată niciodată ca semnătură de tranzacție.
- **Ce se află pe lanț:** cheia publică ML-DSA-87 înregistrată, tranzacțiile hibride și ferestrele EVM. Cheile, semnarea și verificarea au loc pe dispozitivul sau serverul care rulează QoreSign.
- **Vectori de test comuni:** formatele de transmisie sunt versionate separat de pachete și acoperite de [vectori de test](/qoresign/vectors) pe care fiecare limbaj îi reproduce octet cu octet.

Dimensiuni (FIPS 204 și [ghidul de dimensiuni](/qoresign/guides/sizes-and-transport)): o cheie publică ML-DSA-87 are 2.592 de octeți, cheia secretă 4.896 de octeți, o semnătură 4.627 de octeți, iar seed-ul 32 de octeți. O tranzacție hibridă este cu circa 4,7 KB mai mare decât una clasică, așa că simulați înainte să semnați. O semnătură sau o cheie publică nu încape într-un singur cod QR static; semnatarii air-gapped au nevoie de QR în mai multe părți. Păstrați seed-ul de 32 de octeți, nu cheia secretă.

## Pachete {#packages}

| Limbaj | Pachet | Instalare | Platformă minimă |
|---|---|---|---|
| TypeScript | [`@qorechain/qoresign`](https://www.npmjs.com/package/@qorechain/qoresign) | `npm install @qorechain/qoresign` | Node.js 20 sau mai nou; browsere |
| Rust | [`qorechain-qoresign`](https://crates.io/crates/qorechain-qoresign) (numele bibliotecii `qoresign`) | `cargo add qorechain-qoresign` | Rust stable |
| Go | [`github.com/qorechain/qoresign/go`](https://pkg.go.dev/github.com/qorechain/qoresign/go) | `go get github.com/qorechain/qoresign/go@v0.1.1` | Go 1.25 |
| Python | [`qorechain-qoresign`](https://pypi.org/project/qorechain-qoresign/) (import `qoresign`) | `pip install qorechain-qoresign` | Python 3.9+; wheel-uri pentru macOS 11+ (arm64, x86_64) și Linux (x86_64, aarch64); încă fără wheel pentru Windows, celelalte platforme se construiesc din distribuția sursă (necesită Rust 1.95) |
| Swift | `QoreSign` din [`github.com/qorechain/qoresign`](https://github.com/qorechain/qoresign) (binary framework în release-ul GitHub) | `.package(url: "https://github.com/qorechain/qoresign", from: "0.1.1")`, produs `QoreSign` | iOS 16, macOS 13 |
| Kotlin / JVM | [`io.github.qorechain:qoresign`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) | `implementation("io.github.qorechain:qoresign:0.1.1")` | Java 17, Kotlin 2.3 sau mai nou; biblioteci native pentru macOS (arm64, x86-64), Linux (x86-64, arm64) și Windows (x86-64) |
| Android | [`io.github.qorechain:qoresign-android`](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) | `implementation("io.github.qorechain:qoresign-android:0.1.1")` | API 24, Kotlin 2.3 sau mai nou; `arm64-v8a`, `armeabi-v7a`, `x86_64`; reguli R8 keep incluse |

:::note Versiunea compilatorului Kotlin
Artefactele Kotlin și Android au nevoie în proiectul dumneavoastră de compilatorul **Kotlin 2.3 sau mai nou**. Un proiect pe Kotlin 2.1 nu se compilează împotriva lor. Ridicați versiunea Kotlin a build-ului înainte de a adăuga dependența.
:::

Toate implementările se verifică singure pe baza acelorași [vectori de test](/qoresign/vectors).

## Exemplu {#example}

```ts
import {
  addressFromPublicKey,
  deriveCanonicalPqKey,
  deriveClassicalKey,
  signHybrid,
  verifyHybridTx,
} from "@qorechain/qoresign";

const classical = deriveClassicalKey({ mnemonic });                 // m/44'/118'/0'/0/0
const address = addressFromPublicKey(classical.publicKey, "secp256k1").bech32;
const pqKey = deriveCanonicalPqKey({ mnemonic, address });         // the key QoreChain wallets register

// bodyBytes / authInfoBytes / accountNumber come from the dApp's SignDoc
const signed = signHybrid({ chainId: "qorechain-vladi", accountNumber, bodyBytes, authInfoBytes, classicalKey: classical, pqKey });

verifyHybridTx({
  txBytes: signed.txBytes,
  chainId: "qorechain-vladi",
  accountNumber,
  classicalPublicKey: classical.publicKey,
  pqPublicKey: pqKey.publicKey,
}); // { valid: true, classical: true, pq: { valid: true, signBytesVersion: "v2" } }
```

[Pornirea rapidă](/qoresign/quickstart) parcurge același flux de la cap la coadă, offline, și conține pornirile rapide pentru semnarea de mesaje în Python și Go.

## API principal {#main-api}

Numele sunt date în forma TypeScript. Go folosește aceleași nume în stilul Go (`SignHybrid`, `VerifySiwq`); Rust și Python folosesc snake_case (`sign_hybrid`); Swift și Kotlin folosesc camelCase peste nucleul Rust.

| Nume | Ce face | Unde |
|---|---|---|
| `deriveClassicalKey`, `deriveCanonicalPqKey`, `pqKeyFromSeed`, `classicalKeyFromPrivate` | chei dintr-o mnemonică, dintr-un seed sau din octeți bruți | toate |
| `deriveHdPqKey` | derivare HD întărită a cheilor ML-DSA-87 (draft, se poate schimba) | toate |
| `addressFromPublicKey`, `addressFromBytes`, `parseAddress` | adrese `qor1` | toate |
| `signHybrid`, `signPqLayer`, `hybridSignBytes` | semnare hibridă și sign-bytes v1 sau v2 | toate |
| `verifyHybridTx`, `verifyPqLayer` | verificare locală | toate |
| `buildRegisterPqKeyMessage`, `signProofOfPossession`, `verifyProofOfPossession` | înregistrarea cheii cu dovadă de posesie | toate |
| `signMessage`, `verifyMessage` | semnarea de mesaje arbitrare (ADR-36 plus ML-DSA-87) | toate |
| `createSiwqMessage`, `parseSiwqMessage`, `signSiwq`, `verifySiwq` | Sign In With QoreChain v1 | toate |
| `decideLane`, `assertHybridLane`, `evaluateLayerState` | regulile pe lane-uri; detectarea unui strat omis | toate |
| `fetchPqKeyStatus`, `resolveSignBytesVersion`, `simulateTx`, `suggestGasLimit`, `broadcastTx`, `submitWithSignBytesFallback`, `assertPqLayerMatchesRegisteredKey`, `verifySiwqWithChain`, `verifyMessageWithChain`, `fetchCommittedExtensionTypeUrls` | helperi de rețea | TypeScript, Go |
| `inspectTransaction`, `fetchEvmWindow` | citește o tranzacție confirmată; citește o fereastră EVM (0.1.1) | TypeScript |

În Go, helperii de rețea sunt metode ale unui client: `client := network.NewClient("https://api-testnet.qore.host")`, apoi `client.VerifySiwqWithChain(ctx, address, qoresign.VerifySiwqOptions{...})` sau `client.SimulateTx(...)`. Erorile Python sunt `QoreSignError` cu `code` și `detail`; câmpurile de octeți sunt `bytes`.

Referința API: într-o clonă a depozitului, rulați `pnpm -C packages/ts docs` (TypeScript), `cargo doc -p qorechain-qoresign` (Rust) sau `go doc github.com/qorechain/qoresign/go` (Go). Bindingurile Swift, Kotlin și Python oglindesc API-ul Rust; vedeți fișierele README [Swift](https://github.com/qorechain/qoresign/tree/main/swift), [Kotlin](https://github.com/qorechain/qoresign/tree/main/kotlin) și [Python](https://github.com/qorechain/qoresign/tree/main/python).

## Rețele și cerințe {#networks}

| | Mainnet | Testnet |
|---|---|---|
| Id de lanț | `qorechain-vladi` (id de lanț EVM 9801) | `qorechain-diana` (id de lanț EVM 9800) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Sign-bytes verificați | v2 | v2 |

- **Lane-ul nativ:** rețeaua cere implicit semnătura ML-DSA-87. Sunt exceptate: înregistrarea cheii ML-DSA-87 a unui cont și deblocarea (unjail) de către un cont fără cheie. Contul trebuie să-și aibă cheia înregistrată (`MsgRegisterPQCKeyV2`) înainte ca tranzacțiile hibride să se verifice; portofelele QoreChain o înregistrează la crearea contului.
- **Lane-ul EVM:** un cont cu o cheie ML-DSA-87 înregistrată deschide o fereastră de autorizare limitată (înălțime de expirare, număr maxim de tranzacții, valoare maximă, contracte permise opțional) printr-o tranzacție de pe lane-ul nativ semnată hibrid. În afara unei ferestre active, rețeaua refuză tranzacțiile EVM ale contului. Citirile și estimarea gas-ului nu au nevoie de fereastră.
- **Taxe:** denom `uqor` (6 zecimale), preț minim al gas-ului 0,1 uqor per gas.
- **Valori de înregistrare Keplr:** prefix bech32 `qor`, coin type `118`.
- **Conturi:** niciunul pentru funcțiile offline. Helperii de rețea au nevoie doar de un endpoint REST; difuzarea are nevoie de un cont alimentat, cu o cheie ML-DSA-87 înregistrată.

## Documentație {#documentation}

- [Pornire rapidă](/qoresign/quickstart): derivați chei, semnați și verificați o tranzacție hibridă în câteva minute.
- Ghiduri
  - [Adăugați semnarea hibridă într-un portofel compatibil Keplr](/qoresign/guides/keplr-compatible-wallets)
  - [Sign In With QoreChain: verificarea pe server](/qoresign/guides/sign-in)
  - [Portofele EVM: fereastra de autorizare](/qoresign/guides/evm-quantum-ready)
  - [Derivarea cheilor: chei canonice și draftul HD](/qoresign/guides/key-derivation)
  - [Dimensiuni și transport](/qoresign/guides/sizes-and-transport)
- Specificații
  - [Semnarea hibridă a tranzacțiilor v1](/qoresign/spec/hybrid-signing-v1)
  - [Sign In With QoreChain v1](/qoresign/spec/siwq-v1)
  - [Semnarea mesajelor v1](/qoresign/spec/message-signing-v1)
  - [Derivarea cheilor ML-DSA-87](/qoresign/spec/hd-derivation-draft)
- [Vectori de test](/qoresign/vectors)
- [Exemple](https://github.com/qorechain/qoresign/tree/main/examples)

## Domeniu de aplicare și limite {#scope}

- QoreSign semnează local. Nu păstrează chei în locul dumneavoastră, nu face semnare threshold sau MPC și nu semnează pe portofele hardware.
- Nu există semnătură hibridă EVM: `assertHybridLane("evm")` aruncă `LANE_NOT_AVAILABLE`. Conturile EVM folosesc în schimb fereastra de autorizare. Tranzacțiile SVM nu sunt deschise.
- Rust, Swift, Kotlin și Python nu au cod de rețea. Preluarea numerelor de cont, simularea și difuzarea rămân în aplicația dumneavoastră, sau folosiți helperii TypeScript ori Go.
- `inspectTransaction` și `fetchEvmWindow` există doar în TypeScript. `inspectTransaction` verifică stratul față de cheia pe care semnatarul o are înregistrată acum, așa că, după o rotație de cheie, o tranzacție mai veche raportează `verified: false`.
- Derivarea canonică necesită mnemonica. Portofelele fără ea (chei păstrate în hardware) generează o cheie aleatoare (`pqKeyFromSeed`) sau folosesc draftul HD și înregistrează acea cheie. Mnemonica trebuie să fie în formă canonică (litere mici, spații simple); alte scrieri sunt refuzate, nu normalizate.
- Derivarea HD (`deriveHdPqKey`) este un draft și se poate schimba.
- Python nu are încă wheel pentru Windows. Kotlin și Android au nevoie de compilatorul Kotlin 2.3 sau mai nou.
- Implementările ML-DSA-87 și secp256k1 provin din `qorechain-pqc` (construit pe `@noble/post-quantum`, `fips204` și Cloudflare CIRCL) și din `@noble/curves`, `k256` și `decred/secp256k1`.

## Note de securitate {#security}

- Cheile nu părăsesc niciodată procesul care rulează QoreSign. Nu se trimite nimic nicăieri decât dacă apelați un helper de rețea, iar aceștia trimit doar date publice: adrese, octeți de tranzacții semnate și hash-uri.
- Arătați utilizatorului mesajele și taxa din `bodyBytes` și `authInfoBytes` înainte de semnare; semnătura ML-DSA-87 acoperă taxa.
- Când un dApp furnizează un corp care poartă deja un strat PQC, verificați-l cu `assertPqLayerMatchesRegisteredKey` înainte să adăugați semnătura clasică. După difuzare, `evaluateLayerState` cu `fetchCommittedExtensionTypeUrls`, sau `inspectTransaction`, confirmă că stratul a ajuns pe lanț.
- Nu semnați niciodată octeți bruți cu cheia ML-DSA-87 în afara domeniilor rezervate.
- Nonce-urile de autentificare sunt de unică folosință. `verifySiwq` refuză o autentificare fără partea ML-DSA-87, dacă nu se transmite `requirePq: false`; acceptați autentificări doar clasice numai când serviciul dumneavoastră nu are nevoie de garanția post-cuantică.
- Păstrați seed-ul ML-DSA-87 de 32 de octeți, criptat, în loc de cheia secretă.
- Nu puneți niciodată o mnemonică de mainnet într-un script sau în istoricul shell-ului. Exemplele folosesc fraza publică de test BIP-39 (`abandon` de unsprezece ori, apoi `about`); nu o alimentați niciodată.
- Raportați vulnerabilitățile în privat la security@qore.network, nu în issue-uri publice. Corecțiile de securitate intră în cea mai recentă versiune minoră.

## Unde este publicat {#where-published}

Versiuni verificate în registre la 27 octombrie 2026.

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| npm | `@qorechain/qoresign` | 0.1.1 | [npmjs.com](https://www.npmjs.com/package/@qorechain/qoresign) |
| crates.io | `qorechain-qoresign` | 0.1.1 | [crates.io](https://crates.io/crates/qorechain-qoresign) |
| Go module proxy | `github.com/qorechain/qoresign/go` | v0.1.1 (tag `go/v0.1.1`) | [pkg.go.dev](https://pkg.go.dev/github.com/qorechain/qoresign/go) |
| Maven Central | `io.github.qorechain:qoresign` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign) |
| Maven Central | `io.github.qorechain:qoresign-android` | 0.1.1 | [central.sonatype.com](https://central.sonatype.com/artifact/io.github.qorechain/qoresign-android) |
| PyPI | `qorechain-qoresign` | 0.1.1 (wheel-uri macOS arm64 și x86_64, Linux x86_64 și aarch64, distribuție sursă) | [pypi.org](https://pypi.org/project/qorechain-qoresign/) |
| Swift Package Manager | `QoreSign` din `github.com/qorechain/qoresign` | 0.1.1 (binarul `QoreSignFFI.xcframework.zip` în release) | [Release GitHub](https://github.com/qorechain/qoresign/releases/tag/v0.1.1) |

Depozit: [github.com/qorechain/qoresign](https://github.com/qorechain/qoresign) (release-urile v0.1.0 și v0.1.1).

## Pagini conexe {#related}

- [Primitive post-cuantice (`qorechain-pqc`)](/developer-tools/pqc-library): primitivele ML-DSA-87 de sub QoreSign.
- [QoreChain SDK](/sdk/overview): compozitoare de tranzacții, mesaje pentru fereastra EVM și detectarea funcționalităților.
- [Wallet adapter](/developer-tools/wallet-adapter): alternativa de partea dApp-ului când un portofel nu poate fi modificat. dApp-ul deține cheia ML-DSA-87 și cere portofelului nemodificat `signDirect`; octeții sunt aceiași ca la QoreSign.
- [QoreSeal](/developer-tools/qoreseal): criptare către conturi; cardurile sale de destinatar sunt semnături de mesaj QoreSign.
- [Custody kit](/developer-tools/custody-kit): detectarea depunerilor și verificarea retragerilor, construite pe QoreSign.
- [Serverul QoreChain MCP](/developer-tools/mcp): instrumentul său `get_pq_status` folosește QoreSign pentru a verifica stratul hibrid.
- [Semnarea post-cuantică](/developer-guide/post-quantum-signing) și [Integrarea cu burse](/developer-guide/exchange-integration).
- [Prezentare generală a pachetelor pentru dezvoltatori](/developer-tools/overview).

## Versionare {#versioning}

QoreSign este pre-1.0: versiunile minore pot modifica API-ul, iar fiecare modificare incompatibilă este listată în [changelog](https://github.com/qorechain/qoresign/blob/main/CHANGELOG.md). Formatele de transmisie sunt versionate separat (specificațiile `v1` și `vectors/qoresign-v1.json`) și nu se schimbă în cadrul unei versiuni.

## Contribuții și securitate {#contributing}

Vedeți [CONTRIBUTING.md](https://github.com/qorechain/qoresign/blob/main/CONTRIBUTING.md). Raportați vulnerabilitățile în privat la security@qore.network, așa cum este descris în [SECURITY.md](https://github.com/qorechain/qoresign/blob/main/SECURITY.md).

## Licență {#license}

[Apache-2.0](https://github.com/qorechain/qoresign/blob/main/LICENSE). Copyright 2026 QoreChain Association.
