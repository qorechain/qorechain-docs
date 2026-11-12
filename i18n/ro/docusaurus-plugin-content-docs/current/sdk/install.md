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
și abonamente WebSocket). Versiunea curentă este **0.14.0**, publicată pe 12 noiembrie 2026
(verificată pe registre la 12 noiembrie 2026; Java este excepția, vezi
tabelul):

| Registru | Pachet | Versiune |
| --- | --- | --- |
| npm | `@qorechain/sdk`, `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`, `create-qorechain-dapp` | 0.14.0 (și `create-qorechain-dapp`; poartă și corecțiile de șabloane din 0.13.1) |
| PyPI | `qorechain-sdk` (import `qorsdk`) | 0.14.0 |
| crates.io | `qorechain-sdk` (import `qorechain`) | 0.14.0 |
| Proxy de module Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.14.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.14.0 (JDK 17 sau mai nou) |

Nu există 0.11.0 pentru Python, Rust, Go sau Java: pachetele npm au avut un 0.11.0 pe
29 octombrie 2026 (kitul pentru dezvoltatori de lanț, vezi mai jos), iar fiecare limbaj a trecut
împreună de la 0.10.0 la 0.12.0. 0.13.0 a urmat pe 11 noiembrie 2026, iar 0.14.0 pe 12 noiembrie 2026, în fiecare limbaj.

Alege limbajul tău mai jos.

## Note de actualizare {#upgrade}

:::danger Folosește SDK 0.8.1 sau mai nou pe rețelele live
Ambele rețele publice verifică forma **v2 a sign-bytes hibride** (etichetată cu
domeniu și legată de chain id) și o resping pe cea veche cu codul `pqc` 21. Fiecare
versiune a SDK-ului dinaintea **0.8.0** semnează forma veche, iar **0.8.0** caută
comutarea sub doar unul dintre cele două nume de upgrade folosite de rețele
(mainnet a înregistrat-o ca `v3.2.0`, testnet ca `v3.1.98` și ulterior `v3.2.0`),
deci semnează forma greșită pe mainnet. Folosește **0.14.0** (sau cel puțin **0.8.1**)
în fiecare limbaj; este nevoie de **0.8.2 sau mai nou** pentru a deschide o
[fereastră de autorizare EVM](/sdk/guides/evm#evm-window). Constructorii hibrizi
primesc o opțiune `signBytesVersion` (`"auto"` | `"v1"` | `"v2"`); `"auto"`
interoghează rețeaua și are deci nevoie de endpoint-ul REST (`rest`) pe
`qorechain-vladi` / `qorechain-diana`: aruncă o eroare în loc să ghicească. Vezi
[Ce formă de sign-bytes?](/sdk/concepts/accounts-pqc#sign-bytes-versions).
Forma nu s-a schimbat în chain v3.2.3 sau v3.2.4 (v3.2.4 rulează pe testnet din 19 octombrie 2026 și pe mainnet din 23 octombrie 2026; v3.2.5 și v3.2.6 nu au schimbat nimic aici; mainnet rulează v3.2.6 din 4 noiembrie 2026): `"auto"`
se rezolvă la v2 pe ambele rețele, deoarece ambele au aplicat upgrade-ul care a comutat la ea.
:::

## Ce schimbă 0.14.0 {#whats-new-0140}

SDK 0.14.0 (12 noiembrie 2026) este o singură versiune pentru toate limbajele: TypeScript,
Python, Go, Rust și Java, împreună cu `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`
și `create-qorechain-dapp` (care poartă și corecțiile de șabloane din 0.13.1). Adaugă suport
client pentru lanțul **v3.2.8**. Regulile noi se aplică pe o rețea de îndată ce rulează v3.2.8:
testnet-ul `qorechain-diana` îl rulează din 12 noiembrie 2026; mainnet nu l-a aplicat. Pe
rețelele anterioare, câmpurile noi rămân opționale.

| Zonă | În 0.14.0 |
| --- | --- |
| Legarea unei chei | Cere o dovadă de posesie. Constructorii și semnatarii pentru ed25519, secp256k1 și EIP-191 (`personal_sign`) semnează un mesaj de legare în text simplu, care numește lanțul, contul, schema și cheia. Compozitoarele de înregistrare refuză o dovadă goală |
| Chei care mută valoare | O cheie cu `send`, `evm`, `deploy`, `svm` sau `all` cere ca prima regulă de cheltuire activată a contului să limiteze fiecare denom. Un helper construiește perechea (actualizarea regulii de cheltuire și legarea) într-o singură tranzacție semnată de proprietar și verifică regula |
| Parametri de guvernanță | Compozitoarele `MsgUpdateParams` pentru crossvm, svm și rdk cer toate câmpurile (lanțul înlocuiește parametrii integral). Helpere noi construiesc actualizarea pornind de la parametrii curenți citiți din rețea. Compozitorul svm refuză `enabled` cât timp plafonul strict de custodie este 0 |
| Interogarea cross-VM pending | Interogarea paginată returnează acum toate paginile |
| Rezultatele execuției | `MsgExecuteEVM` și `MsgExecuteCosmos` pot eșua cu `success=false` în interiorul unei tranzacții cu cod 0 (nonce-ul este consumat). Helpere noi decodează răspunsurile și motivul eșecului și aruncă o eroare la o execuție eșuată |
| Apeluri asincrone cross-VM | Primesc `async_gas_limit` și `async_max_factor` |
| Domeniul ferestrei EVM | Câmpuri noi `validators`, `staking_validators` și `ibc_receivers` |
| Gaz | Tranzacțiile EVM peste 30.000.000 (citit din `evm_limits`) și tranzacțiile Cosmos peste 50.000.000 sunt refuzate înainte de semnare. Tranzacțiile CosmWasm și cross-VM primesc cel puțin 1,3 ori gazul simulat și niciodată o valoare fixă de rezervă |
| Prețul minim al gazului | Helpere opt-in citesc prețul minim al gazului din rețea; prețul implicit al gazului este neschimbat |
| Protos | Codul generat în cele cinci limbaje urmează v3.2.8 |

Partea de portofel a aceleiași schimbări este în
[`@qorechain/wallet-adapter` 0.6.0](/developer-tools/wallet-adapter#whats-new-060).

## Ce schimbă 0.13.0 {#whats-new-0130}

SDK 0.13.0 (11 noiembrie 2026) este o singură versiune pentru toate limbajele: TypeScript,
Python, Go, Rust și Java, împreună cu `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`
și `create-qorechain-dapp`. Are o singură schimbare care rupe compatibilitatea, la helperul
de cont pe calea cu seed. Conturile derivate dintr-o mnemonică rămân neschimbate, la fel
formatul de semnare hibridă și comportamentul lanțului: o tranzacție construită cu 0.12.0
rămâne validă.

**Schimbare care rupe compatibilitatea.** Helperele pentru calea cu seed
`unifiedAccountFromSeed` (TypeScript), `unified_account_from_seed` (Python, Rust),
`unified.UnifiedAccountFromSeed` (Go) și `UnifiedAccounts.unifiedAccountFromSeed` (Java)
cer acum exact una din două intrări: un cod de recuperare `QRC1` sau un secret PQC
independent de 32 de bytes. Cheia ML-DSA-87 este derivată din acest al doilea secret.
Apelul helperului fără nicio opțiune, sau cu mai multe, ridică o eroare.

Opțiunea `legacySeedDerivation` (Python `legacy_seed_derivation=True`, Go
`LegacySeedDerivation`, Rust `SeedPqcOptions::legacy_seed_derivation()`, Java
`SeedPqcOptions.legacy()`) este opt-in. Folosiți-o doar pentru a recupera cheia PQC a unui cont
creat înainte de 0.13.0, ca să o puteți rota cu `MsgRotatePQCKey`; nu este pentru
conturi noi.

| Zonă | În 0.13.0 |
| --- | --- |
| Helperele pentru calea cu seed | Cer un cod de recuperare `QRC1` sau un secret PQC independent de 32 de bytes (exact unul); fără opțiune, sau cu mai multe, ridică o eroare. Conturile din mnemonică rămân neschimbate |
| `legacySeedDerivation` | Opt-in, doar pentru a recupera cheia PQC a unui cont creat înainte de 0.13.0, ca să poată fi rotită cu `MsgRotatePQCKey` |
| Coduri de recuperare `QRC1` | Adăugate în fiecare limbaj: `generatePqcRecoveryCode`, `isValidRecoveryCode`, `normalizeRecoveryCode`, `pqcKeyFromRecoveryCode`, `pqcRecoveryCodeFromSecret` (snake_case în Python și Rust; în Go `GeneratePQCRecoveryCode`, `IsValidRecoveryCode`, `PQCKeyFromRecoveryCode`, `PQCRecoveryCodeFromSecret`) |
| `migrateToHybrid` | Raportează `keyVerified` |
| Șabloane | `pnpm window recovery-code` afișează un cod nou. Cu `PRIVATE_KEY`, `pnpm window` citește `QORE_PQC_RECOVERY_CODE` și se oprește cu un mesaj când lipsește; cu `QORE_MNEMONIC` nimic nu se schimbă. Șabloanele Foundry și Hardhat depind de `^0.13.0` |
| Versiunea sign-bytes `"auto"` | Citește mai întâi funcționalitatea de protocol `pqc-sign-bytes-v2` de la `/qorechain/pqc/v1/protocol_features` și revine la planurile de upgrade aplicate doar dacă această citire eșuează |
| `getPqcStatus` / `get_pqc_status` | Ridică o eroare când răspunsul nodului nu are indicatorul de înregistrare, în loc să raporteze „neînregistrat" |
| Python | Interpretează strict codurile de rezultat ale tranzacțiilor și câmpurile `found` și `live` ale ferestrei EVM; `wait_for_tx` tratează un răspuns fără `tx_response` sau `txhash` ca fiind încă în așteptare |

**Opțiunile pentru calea cu seed în fiecare limbaj**. Transmiteți exact una dintre cele trei:

| Limbaj | Apel | Cod de recuperare | Secret independent de 32 de bytes | Cheie mai veche, doar recuperare |
| --- | --- | --- | --- | --- |
| TypeScript | `unifiedAccountFromSeed(seed32, opts)` | `{ recoveryCode }` (un șir `"QRC1-..."`) | `{ pqcSecret }` (un `Uint8Array` de 32 de bytes, independent de `seed32`) | `{ legacySeedDerivation: true }` |
| Python | `unified_account_from_seed(seed32, ...)` | `recovery_code=...` | `pqc_secret=...` | `legacy_seed_derivation=True` |
| Go | `unified.UnifiedAccountFromSeed(seed32, opts)` | `unified.SeedPQCOptions{RecoveryCode: ...}` | `unified.SeedPQCOptions{PQCSecret: ...}` | `unified.SeedPQCOptions{LegacySeedDerivation: true}` |
| Rust | `unified_account_from_seed(seed32, opts)` | `SeedPqcOptions::recovery_code(code)` | `SeedPqcOptions::pqc_secret(secret32)` | `SeedPqcOptions::legacy_seed_derivation()` |
| Java | `UnifiedAccounts.unifiedAccountFromSeed(seed32, opts)` | `SeedPqcOptions.withRecoveryCode(code)` | `SeedPqcOptions.withPqcSecret(secret32)` | `SeedPqcOptions.legacy()` |

Opțiunile din Python sunt doar prin cuvinte cheie. Un `pqcSecret` dă aceeași cheie ca
șirul de recuperare creat din el cu `pqcRecoveryCodeFromSecret(secret32)`. TypeScript are și
`pqcKeyFromRecoveryCode(code, qor1)`.

**Migrare (TypeScript).** Creați o dată un cod de recuperare și păstrați-l separat de
seed:

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

Un cont care și-a înregistrat cheia PQC cu 0.12 sau mai vechi încarcă cheia veche cu
`{ legacySeedDerivation: true }` și o rotește cu `rotatePqcKeyMsg`:

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

Păstrați codul de recuperare: un alt cod dă o altă cheie.

## Ce adaugă 0.12.0 {#whats-new-0120}

SDK 0.12.0 este versiunea de client pentru chain **v3.2.5**, pe care mainnet a aplicat-o
la înălțimea 3.906.833, pe 29 octombrie 2026 (testnet-ul a aplicat-o pe 26 octombrie). Mainnet-ul
rulează v3.2.6 din 4 noiembrie; testnet-ul a rulat v3.2.6 din 27 octombrie, v3.2.7 din 6 până pe 12 noiembrie și v3.2.8 din 12 noiembrie; formatul de
semnare hibridă, adresele, zecimalele și memo-urile nu s-au schimbat, deci o
tranzacție construită cu 0.10.0 rămâne validă. TypeScript, Python, Go, Rust și Java
trec toate la 0.12.0, împreună cu `@qorechain/react`, `@qorechain/evm`, `@qorechain/svm`
și `create-qorechain-dapp`. Versiunea a fost verificată în fiecare limbaj cu un
transfer bancar hibrid pe testnet și cu o cheie KEM înregistrată, citită înapoi și
ștearsă acolo, plus citiri pe mainnet.

| Zonă | În 0.12.0 |
| --- | --- |
| Endpoint-uri publice implicit | Presetările `mainnet` și `testnet` indică acum endpoint-urile publice (REST, RPC de consens și JSON-RPC EVM pe ambele, plus WebSocket EVM pe testnet) în loc de localhost. Un `createClient()` simplu vorbește deci cu testnet-ul public. Vezi [Rețea și endpoint-uri](/sdk/reference/network#public-endpoints) |
| Presetarea `localnet` | Porturile localhost pe care le foloseau toate presetările înainte de 0.12.0, chain id `qorechain-devnet`. Selectați-o cu `createClient({ network: "localnet" })` pentru a păstra vechiul comportament |
| Gaz exact pentru tranzacțiile hibride | Pe o rețea care a aplicat v3.2.5, comisionul `"auto"` al unei tranzacții native hibride este `ceil(simulated x 1.02) + 2000`, deoarece simularea taxează acum chiar verificarea post-cuantică. Un transfer bancar hibrid cere aproximativ 171.600 de gaz în loc de aproximativ 289.000, iar comisionul scade odată cu el. Rețelele mai vechi, tranzacțiile clasice și o căutare de plan eșuată păstrează regula anterioară; un multiplicator pe care îl transmiteți o înlocuiește pe oricare. `exactHybridGas` (și echivalentele sale în fiecare limbaj) și, în TypeScript, `estimateGasDetails` (raportează simularea, limita de gaz și ce regulă a stabilit-o). Java a primit calea de gaz automat |
| Registrul de chei ML-KEM-1024 | Un cont publică o cheie de încapsulare ML-KEM-1024 (algoritm 2, 1.568 octeți) pentru ca oricine să poată cripta către ea: `msg.pqc.registerKemKey` și `msg.pqc.removeKemKey` (cheia este verificată mai întâi: dimensiune, fiecare coeficient sub 3329, nu toți zero), `validateKemPublicKey` și citirea `fetchKemKey` de la `/qorechain/pqc/v1/kem/{address}` (bech32 sau `0x`). Ambele mesaje cer semnătura hibridă. Ruta răspunde pe mainnet și pe testnet. SDK-ul nu criptează: pentru payload-uri sigilate vedeți [QoreSeal](/developer-tools/qoreseal) |
| Abstract accounts | Citiri ale regulilor de cheltuire stocate ale unui cont și ale cheilor sale conectate (inclusiv cele revocate), `MsgUpdateConfig` (mesajul de guvernanță care comută modulul) și `authenticators_count` în vizualizarea contului |
| Verificări ale regulilor de cheltuire | Regulile sunt verificate așa cum le verifică chain-ul: un denom `erc20/`, `erc721/` sau `erc1155/` trebuie să indice o adresă de contract `0x`. Codurile `abstractaccount` 8 (regulă de cheltuire invalidă) și 9 (modul dezactivat) sunt denumite |
| Parametri de guvernanță | `MsgUpdateParams` cross-VM (inclusiv contractele CosmWasm pe care precompilarea bridge-ului EVM le poate apela) și `MsgUpdateParams` de rollup, fiecare verificat față de limitele chain-ului înainte de semnare. Citirea parametrilor cross-VM include `bridge_allowed_targets` |
| Constantă de upgrade și protos | `CHAIN_UPGRADE_V3_2_5`; definiții protobuf sincronizate cu chain v3.2.5 |
| Kit pentru dezvoltatori de lanț | Din 0.11.0, doar pe npm, și inclus în 0.12.0: `@qorechain/evm` exportă lanțurile viem `qorechain` (9801) și `qorechainTestnet` (9800) și helperele ferestrei de autorizare EVM (`evmWindowStatus`, `openEvmWindowMessage`, disponibile și ca `@qorechain/evm/window` fără viem). `create-qorechain-dapp` are șabloanele `foundry`, `hardhat`, `viem-wagmi` și `cosmwasm`. `@qorechain/react` are `PqcStatusBadge` (vechile nume `QuantumSafeBadge` sunt păstrate ca aliasuri depreciate) |
| Remedieri | `@qorechain/svm`, când primea endpoint-uri fără `svmRpc`, folosea localhost; acum spune că endpoint-ul nu este configurat. Generarea de cod Python îndreaptă importurile dintre protos QoreChain în interiorul pachetului |

**Schimbare de comportament de verificat la actualizare.** Dacă codul dvs. se baza pe
valoarea implicită localhost, selectați `localnet` sau transmiteți `endpoints`. Endpoint-urile
publice de testnet sunt limitate ca rată per IP, deci traficul de producție ar trebui să ruleze sau să folosească propriul
nod. Nicio presetare nu setează un endpoint gRPC sau SVM pe rețelele publice (tranzacțiile
SVM nu sunt deschise), iar mainnet nu are WebSocket EVM public: codul care are nevoie de
unul dintre ele eșuează cu o eroare ce numește endpoint-ul de transmis, în loc să revină
la localhost. În Rust, endpoint-urile opționale sunt acum `Option<String>`; în Python, Go
și Java un endpoint nesetat este `None`, un șir gol și `null`.

Nodurile nu raportează versiunea binarului lor. Pentru a detecta o funcționalitate, întrebați `isUpgradeApplied`
pentru fiecare nume de upgrade care o aduce sau citiți `.version` din
`https://download.qore.host/<net>/latest.json`.

## Ce a adăugat 0.10.0 {#whats-new-0100}

SDK 0.10.0 este versiunea de client pentru chain **v3.2.4**, pe care mainnet a aplicat-o
la înălțimea 3.742.566, pe 23 octombrie 2026 (testnet-ul a aplicat-o la înălțimea
8.337.253, pe 19 octombrie). Formatul de semnare, adresele, zecimalele, memo-urile și
comisioanele nu s-au schimbat, iar o tranzacție construită cu 0.9.0 rămâne validă.
Versiunea a fost verificată în fiecare limbaj cu tranzacții reale pe testnet. Nu avea
constructori pentru nimic introdus după v3.2.4; adăugirile v3.2.5 au venit cu
[0.12.0](#whats-new-0120). Mainnet rulează v3.2.6 din 4 noiembrie 2026 (înălțimea
4.020.000, propunerea de guvernanță 15; v3.2.5 înainte de ea, din 29 octombrie la înălțimea
3.906.833), iar 0.10.0 continuă să funcționeze acolo deoarece formatul de semnare nu s-a
schimbat. Testnet-ul a aplicat v3.2.5 și v3.2.6 pe 26 și 27 octombrie 2026, v3.2.7 pe 6 noiembrie și v3.2.8 pe 12 noiembrie (nicio versiune SDK nu are constructori pentru mesajele v3.2.7). Ce a adus 0.10.0
(totul este încă în 0.14.0):

| Zonă | În 0.10.0 |
| --- | --- |
| Niveluri de staking (`x/stakingtier`) | Compozitoare `lockDelegation` (verificările proprii ale lanțului: un termen de 3, 6 sau 12 luni și o sumă întreagă pozitivă), `unlockEarly`, `claimBonus` și `updateParams`; citiri pentru parametrii modulului, blocările unui deținător și fondul de bonusuri (`fetchStakingTierParams`, `fetchStakingLocks`, `fetchStakingTierPool`); codurile de eroare ale modulului. Ce face modulul este descris în [Staking și delegare](/user-guide/staking-and-delegation) |
| Nonce de autentificator | `fetchAuthNonce({ rest, address, pubkey })` citește secvența pe care o cheie conectată trebuie să o semneze următoarea pentru `MsgExecuteEVM` / `MsgExecuteCosmos` de la `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}`, în loc să o urmărești manual. Ambele rețele servesc ruta; modulul `abstractaccount` în sine este dezactivat pe mainnet (activat pe testnet), deci o cheltuială pe mainnet este refuzată înainte să se verifice vreun nonce |
| Comutatoare de funcționalități de protocol | `fetchProtocolFeatures` și `isProtocolFeatureEnabled` citesc, pe nume, ce reguli de consens aplică o rețea, de la `/qorechain/pqc/v1/protocol_features` (ambele rețele o servesc). O rețea sub v3.2.4 nu servește ruta; folosește `isUpgradeApplied` acolo |
| `possessionProven` | Starea PQC spune dacă cheia contului a fost înregistrată cu o dovadă de posesie |
| `ibcTimeoutTimestamp(seconds)` | Un timeout IBC absolut în unitatea pe care o primește `MsgTransfer` (nanosecunde Unix). Timeout-urile IBC sunt momente absolute; pachetele IBC v2 primesc secunde Unix absolute, iar o valoare relativă acolo este refuzată după ce comisionul a fost perceput. Niciun canal IBC nu este deschis pe mainnet (verificat la 27 octombrie 2026) |
| Constantă de upgrade și protos | `CHAIN_UPGRADE_V3_2_4`; definiții protobuf sincronizate cu chain v3.2.4 (câmpuri noi la înregistrarea validatorului de bridge, la nodul light și la interogările de rollup) |
| `ensurePqcRegistered` | Compara drept potrivire o stare fără cheie publică; acum citește cheia prin `rest` și o compară. Dacă nu are de unde să o citească, rezultatul raportează `keyVerified: false` în loc să pretindă că cheia este a apelantului |
| Refuzuri în timpul simulării comisionului | Un refuz al lanțului care sosește doar ca text (de exemplu „no bonus to claim") este acum numit pe baza descrierilor de eroare înregistrate ale lanțului, în fiecare limbaj: `decodeTxError` (TypeScript), `SimulationRefusedError` (Python), `tx.DecodeRefusalText` (Go), `tx::decode_refusal_text` (Rust), `TxError.decode` (Java) |

`@qorechain/react` și `create-qorechain-dapp` au trecut împreună cu ea la 0.10.0; ambele
sunt acum la 0.14.0.

## Ce a adăugat 0.9.0 {#whats-new-090}

SDK 0.9.0 a fost versiunea de client pentru chain **v3.2.2** și **v3.2.3** (mainnet
le-a aplicat la înălțimile 3.556.788 și 3.662.051; mainnet a rulat v3.2.4 din 23 octombrie 2026 (înălțimea 3.742.566) a rulat v3.2.5 din 29 octombrie și rulează v3.2.6 din 4 noiembrie 2026, iar testnet-ul rulează v3.2.4 sau mai nou din 19 octombrie 2026).
Formatul de semnare, adresele, zecimalele, memo-urile și comisioanele nu s-au
schimbat, deci forma v2 a sign-bytes hibride pe care o semnează 0.8.1 și versiunile
ulterioare este în continuare cea corectă. Ce este nou:

| Zonă | În 0.9.0 (și ulterior) |
| --- | --- |
| `TxClient` hibrid (TypeScript) | Transmite perechea de chei a contului: `client.connectTx(signer, { pqcKeypair })` sau `TxClient.connect({ …, pqcKeypair, rest })`. Fiecare tranzacție este atunci semnată hibrid, iar `fee: "auto"` simulează chiar tranzacția hibridă; o simplă înregistrare de cheie rămâne clasică (calea de bootstrap a lanțului). `bankSend` și clienții SDK-ului pentru rollup, multilayer și cross-VM îl folosesc. Fără o pereche de chei nu se schimbă nimic |
| Cheie PQC recuperabilă | `derivePqcCanonical(address, mnemonic)` și echivalentele sale în fiecare limbaj (vezi [Semnare hibridă](/sdk/guides/quantum-safe#canonical-derivation)) |
| `ensurePqcRegistered` | Citește mai întâi starea cheii prin REST (`rest`), refuză să înregistreze când nu poate stabili starea, aruncă `PqcKeyMismatchError` când contul deține deja o altă cheie și tratează refuzul „deja înregistrat” al lanțului ca succes. Începând cu chain v3.2.3, semnează și atașează singur **dovada de posesie**; înainte de v3.2.3 lasă câmpul necompletat |
| Ferestre EVM cu domeniu restrâns | `openEvmWindowMsg` primește `nativeOnly` și `allowedTargets` (cel mult 16, fără duplicate); `fetchEvmWindow` le citește pe ambele înapoi (vezi [ghidul EVM](/sdk/guides/evm#evm-window)) |
| Consimțământ EIP-7702 | `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`, `evmDelegationTupleNonce`, `classifyEvmDelegationRejection` |
| Integritatea cheilor | Constructorii de înregistrare refuză `classical_only`, o cheie goală și o cheie ML-DSA-87 degenerată, pe care lanțul le refuză începând cu v3.2.3. `signProofOfPossession` / `verifyProofOfPossession` sunt exportate; `migratePqcKeyHybrid` trimite `MsgMigratePQCKey` semnat hibrid, de care conturile cu cheie au nevoie începând cu v3.2.3 |
| Digest v2 pentru abstract account | `evmAuthSignBytesV2` (leagă limita de gaz a apelului) și `resolveEvmAuthDigestVersion`. Modulul `abstractaccount` este dezactivat pe mainnet (activat pe testnet), deci pe mainnet aceasta este doar pentru referință |
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
rețele și funcționează pe mainnet și pe testnet. Acestea sunt limitele pe
care 0.9.0 le-a eliminat, iar unele dintre ele costă un comision dacă nu le cunoști:

| Versiune anterioară lui 0.9.0 | Soluție ocolitoare |
| --- | --- |
| Fără constructori pentru dovada de posesie, ferestre cu domeniu restrâns sau consimțământ EIP-7702 | Folosește `qorechaind tx pqc register-key-v2 … --pqc-key <name>`, `open-evm-window --native-only` / `--allowed-targets` și `authorize-evm-delegation` / `clear-evm-delegation` (vezi [fereastra de autorizare EVM](/getting-started/first-transaction#evm-window), [delegările EIP-7702](/architecture/post-quantum-security#eip-7702)) |
| `ensurePqcRegistered` fără un `status` difuza înregistrarea neverificată și raporta succes când era înregistrată o altă cheie | O a doua înregistrare pentru un cont care deține deja o cheie este refuzată **după ce comisionul este perceput**. Citește mai întâi `GET /qorechain/pqc/v1/account/{address}` și transmite `status: { registered: found }` |
| `client.rest.getPqcAccount`, `isPqcRegistered`, `getPqcStatus` | Apelau o cale `/accounts/` la plural sau namespace-ul `qor_`, pe care endpoint-urile publice nu îl servesc (HTTP 501, `-32601`). Citește ruta REST la singular de mai sus |
| `TxClient` / `bankSend` și clienții pentru rollup, multilayer și cross-VM semnau doar clasic | Rețelele refuză asta pentru orice cont care are o cheie. Trimite prin `signAndBroadcastHybrid` |
| Tranzacțiile eșuate în interiorul blocului pierdeau codespace-ul | Citește tranzacția de la `GET /cosmos/tx/v1beta1/txs/{hash}` |
| Constanta exportată `VERSION` din 0.8.3 raporta `0.8.0` | Citește versiunea instalată din `package.json` |
| `create-qorechain-dapp` 0.8.0 fixa `@qorechain/sdk` / `@qorechain/evm` la `^0.3.0` (un caret pe o versiune 0.x rămâne în interiorul lui 0.3) | Rulează `npm i @qorechain/sdk@latest` după generare |
| `@qorechain/react` 0.8.x lăsa starea cheii înregistrate necitibilă pe endpoint-urile publice | Folosește `@qorechain/react` 0.9.0 sau mai nou |

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

Publicat pe npm la `0.14.0`. Exportă lanțurile viem `qorechain` (chain id 9801) și `qorechainTestnet` (9800) și helperele [ferestrei de autorizare EVM](/sdk/guides/evm#evm-window).

### Adaptor SVM

`@qorechain/svm` este un adaptor subțire peste
[`@solana/web3.js`](https://solana.com/docs/clients/javascript), care este o
**dependență peer**:

```bash
npm i @qorechain/svm @solana/web3.js
```

Publicat pe npm la `0.14.0`.

### Kit React

`@qorechain/react` este stratul React oficial peste `@qorechain/sdk` — un
provider, hook-uri și componentele `ConnectButton` / `PqcStatusBadge`.
`react` (>=18) este o dependență peer:

```bash
npm i @qorechain/react
```

Publicat pe npm la `0.14.0`; depinde de `@qorechain/sdk` `^0.14.0`. Vezi [ghidul kit-ului React](/sdk/guides/react).

### Generatorul de proiecte

`create-qorechain-dapp` (npm, `0.14.0`) generează un dApp gata de rulat:

```bash
npm create qorechain-dapp@latest my-dapp
```

Fișierele `package.json` generate depind de versiunea de SDK cu care este livrat
generatorul (`@qorechain/sdk` `^0.14.0`; șabloanele EVM folosesc `@qorechain/evm` `^0.14.0`). Versiunea 0.13.1 a schimbat doar șabloanele, iar 0.14.0 le conține; vezi [Generatoare de proiecte și CLI](/developer-tools/scaffolders-and-cli#template-fixes-0131). Are și șabloanele `foundry`, `hardhat`, `viem-wagmi` și `cosmwasm` pentru lucrul cu contracte.
Versiunea 0.8.0 a generatorului scria intervale `^0.3.0`, care pe o versiune 0.x
rămân în interiorul lui 0.3 și nu pot semna pentru rețelele live; dacă ai generat
cu 0.8.0, rulează `npm i @qorechain/sdk@latest`. Vezi [referința CLI](/sdk/reference/cli).

## Python

```bash
pip install qorechain-sdk
```

Necesită Python 3.10+. Pachetul livrează indicii de tip și un marker `py.typed`.

> Distribuția se instalează ca `qorechain-sdk` (publicat pe PyPI la `0.14.0`)
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

Publicat ca modul Go autonom (etichetat `packages/go/v0.14.0`). Fixează versiunea
în mod explicit: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.14.0`.

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

> Publicat pe crates.io ca `qorechain-sdk` (0.14.0); `cargo add qorechain-sdk`
> instalează cea mai recentă versiune.

## Java

Maven (`pom.xml`):

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.14.0</version>
</dependency>
```

Sau Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.14.0'
```

> Publicat pe Maven Central ca `io.github.qorechain:qorechain-sdk` (0.14.0 este versiunea curentă). Necesită JDK 17 sau mai nou. Central nu are o
> versiune 0.8.0 sau 0.8.1, așa că pe rețelele live folosește 0.8.2 sau mai nou. 0.9.1 a
> fost o versiune doar pentru Java care a mutat Bouncy Castle de la 1.80 la 1.85, fără modificări de API.

## Pachete conexe {#related-packages}

| Pachet | Scop | Versiune |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | Utilitare pentru partea de portofel: generarea portofelului (`generateQoreWallet`), semnare hibridă `eth_secp256k1` (`signHybridEth`, `QoreChainSigner`), înregistrarea rețelei în MetaMask (`addQoreEvmToWallet`), constructori de mesaje pentru authenticator și fereastra EVM (`openEvmWindowMsg` al său construiește doar forma fără restricții), digestul v2 pentru abstract account. Nu atașează o dovadă de posesie. Dependențe peer: `@cosmjs/proto-signing` și `@cosmjs/stargate` `^0.32` (SDK-ul folosește cosmjs 0.39, deci instalarea ambelor în același proiect face ca npm să raporteze un conflict de peer, `ERESOLVE`; păstrează-le în proiecte separate sau transmite `--legacy-peer-deps`) | 0.5.0 |
| `@qorechain/chain-bridge` | Worker pe partea de server pentru backend-uri: derivă cheia PQC, semnează hibrid și difuzează (`sendTokens`, `registerPqc` și altele). Transmite `cosmosRest`: cu el, o înregistrare poartă dovada de posesie după ce rețeaua a aplicat v3.2.3, iar un refuz de aspect PQC este verificat față de lanț înainte de orice reînregistrare (o cheie înregistrată diferită ridică `pqc_key_mismatch` în loc să plătești pentru o a doua înregistrare) | 0.2.3 |
| `@qorechain/pqc` | Primitive ML-DSA / ML-KEM / SHAKE-256 strict conforme standardelor și `hybridSignBytes` (vezi [Semnare post-cuantică](/developer-guide/post-quantum-signing)); disponibil și pe PyPI, crates.io, Maven Central și proxy-ul Go (Go `v0.2.3`) la aceeași versiune | 0.2.3 |
| `@qorechain/handles` | Rezolvare verificată de `@handle` (`HandleClient`): tu furnizezi cheia publică a registrului și un depozit de fixări (pin store), iar fixezi după ce utilizatorul a văzut adresa; pachetul nu fixează niciodată singur. Vezi [Chain bridge și handle-uri](/developer-tools/chain-bridge#handles) | 0.1.0 |
| `@qorechain/connect` | **Depreciat pe npm și nemaiîntreținut; nu-l folosi pentru lucruri noi. Folosește în schimb [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) (înlocuitorii pentru conectarea la QoreX sunt în [prezentarea generală a uneltelor pentru dezvoltatori](/developer-tools/overview#group-connect)).** Un singur conector pentru portofelele EVM, Cosmos și SVM, construit peste wallet adapter (intervalul său peer este `@qorechain/wallet-adapter` `^0.2.1`, care nu include 0.5.0). Nu deschide o [fereastră de autorizare EVM](/sdk/guides/evm#evm-window), deci o trimitere EVM prin el este refuzată până când contul are o cheie înregistrată și o fereastră deschisă | 0.2.1 |
| `@qorechain/rdk` | Client Rollup Development Kit (vezi [Rollup-uri](/rollups/why)). Începând cu 0.7.0 depinde de `@qorechain/sdk` `^0.10.0` și `@qorechain/evm` `^0.8.0` (verificat pe npm, 4 noiembrie 2026). Un caret pe o versiune 0.x rămâne în interiorul acelui minor, deci o aplicație pe SDK 0.13.0 primește pentru kit o a doua copie imbricată a SDK 0.10.x; țineți cele două separate (nu transmiteți un client de la o copie la cealaltă) până când o versiune a kit-ului trece la 0.13. Semnează hibrid doar când transmiți un `pqcKeypair`; citirile funcționează fără el. Publicat și ca `qorechain-rdk` pe PyPI, crates.io și Maven Central și ca modul Go (fixează `@v0.8.0`); de la 0.8.0 acei patru clienți semnează și ei hibrid (versiunile anterioare semnau doar clasic; Java necesită Java 21). Vezi [RDK 0.8.0: modificări și limite](/rollups/deploying-a-rollup#rdk-050-limits) | 0.9.0 |
| `@qorechain/rdk-cli` | CLI-ul de operator `qorollup` pentru RDK. De la 0.7.1 comenzile sale de tranzacție (`create`, `pause`, `resume`, `stop`, `withdraw`) semnează hibrid (0.7.0 și versiunile anterioare semnau doar clasic și erau refuzate de rețele); instalat de pe npm, rulează, iar `--version` afișează versiunea instalată (0.6.1 și versiunile anterioare nu afișau nimic) | 0.9.0 |
| `@qorechain/qoreseal` | QoreSeal: criptează un payload către cheile ML-KEM-1024 pe care conturile le publică în registrul KEM (SDK 0.12.0 și ulterior înregistrează și citesc cheile; QoreSeal face criptarea). Disponibil și pe PyPI (`qorechain-qoreseal`; wheel-uri pentru macOS și Linux, wheel pentru Windows în versiunea următoare), crates.io, Maven Central (`io.github.qorechain:qoreseal` și `qoreseal-android`; consumatorii Kotlin au nevoie de Kotlin 2.3 sau mai nou), proxy-ul de module Go (`github.com/qorechain/qoreseal/go`, Go `v0.1.0`) și ca pachet Swift. Vezi [QoreSeal](/developer-tools/qoreseal) | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: unelte pentru tokenuri de active din lumea reală cu permisiuni pe EVM Engine, cu clienți în TypeScript, Python, Java și Go și contracte Solidity (`forge install qorechain/qorechain-asset-kit@v0.1.0`). Apache-2.0, cu excepția scripturilor și testelor ERC-3643 (GPL-3.0-or-later). Modulele native pe care le descrie sunt o propunere, nu sunt construite. Disponibil și ca `qorechain-asset-kit` pe PyPI și `io.github.qorechain:asset-kit` pe Maven Central. Vezi [Asset Kit](/developer-tools/asset-kit) | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: semnare pentru portofel și backend, și `inspectTransaction` pentru a verifica stratul post-cuantic al unei tranzacții comise. Disponibil și pe PyPI, crates.io și Maven Central. Vezi [QoreSign](/qoresign/overview) | 0.2.0 |
| `create-qorechain-rollup` | Generator de proiecte starter pentru rollup; șabloanele sale depind de `@qorechain/rdk` `^0.9.0` și semnează hibrid când își pot rezolva cheia post-cuantică din `QORE_MNEMONIC` sau `QORE_PQC_SEED_HEX` | 0.9.0 |

## Următorul pas

Continuă la [Quickstart](/sdk/quickstart) pentru a te conecta și a citi starea de pe lanț.
