---
slug: /developer-tools/custody-kit
title: QoreChain Custody Kit
sidebar_label: Custody Kit
sidebar_position: 32
---

# QoreChain custody kit

QoreChain custody kit este un ghid de integrare scris, un set de vectori de test și un cod de referință mic pentru custozii și bursele care dețin fondurile clienților pe QoreChain. Explică ce cere rețeaua pe fiecare traseu de execuție și arată, în cod ușor de citit, părțile unei integrări în care se greșește ușor: verificarea unei adrese, decodarea și verificarea unei tranzacții semnate înainte de a fi transmisă în rețea și decizia asupra transferurilor primite care se creditează.

Este destinat custozilor, burselor, procesatorilor de plăți și backend-urilor de portofele, precum și inginerilor și auditorilor care revizuiesc aceste integrări. Versiunea **0.1.0**, publicată la 27 octombrie 2026, Apache-2.0. Funcționează cu mainnet-ul (`qorechain-vladi`) și cu testnet-ul (`qorechain-diana`); verificările live livrate odată cu el rulează pe testnet și doar citesc.

**Citește mai întâi: kitul este cod de exemplu, nu o bibliotecă.** Clonezi repository-ul și citești, copiezi sau incluzi în proiect (vendor) folderul pentru limbajul tău. Nu există pachet npm, PyPI, crates.io sau Maven Central al kitului, în mod intenționat. Singura excepție ca formă este Go: folderul Go este un modul Go cu versiune etichetată, așa că `go get` îl poate descărca, dar rămâne cod de exemplu, fără promisiunea unui API stabil (vezi [Ce este bibliotecă și ce este cod de exemplu](#library-vs-example)). Semnarea și verificarea criptografică provin din [QoreSign](/qoresign/overview), care este o bibliotecă publicată.

## Inovații {#innovations}

- **Un singur comportament în cinci limbaje, dovedit de un singur fișier.** TypeScript, Python, Go, Rust și Java implementează aceleași patru funcții, cu aceleași rezultate și aceleași coduri de eroare. Fiecare limbaj rulează pe fișierul comun de vectori de test `vectors/custody-v1.json`, așa că o echipă care portează kitul într-un alt limbaj poate dovedi că se potrivește.
- **Coduri de eroare stabile pentru adrese.** `validateAddress` nu aruncă niciodată o excepție. Returnează cele două scrieri ale adresei în caz de succes sau unul dintre unsprezece coduri stabile (`EMPTY`, `WHITESPACE`, `BAD_HEX`, `BAD_EIP55`, `NO_CHECKSUM`, `MIXED_CASE`, `BAD_BECH32`, `BAD_CHECKSUM`, `WRONG_PREFIX`, `BAD_LENGTH`, `KIND_NOT_ALLOWED`), astfel încât un formular de retragere să poată afișa motivul exact.
- **Verificarea ambelor semnături înainte de transmitere.** `verifyTx` verifică semnătura secp256k1 peste `SignDoc`, stratul ML-DSA-87 față de o cheie pe care o pasezi și dacă cheia publică din tranzacție este cea așteptată. Returnează `{ valid, classical, signerKey, pq }` și aruncă o excepție doar pentru intrări malformate, niciodată pentru o semnătură greșită. Un al doilea proces îl poate rula pe fiecare retragere semnată, înainte să se trimită ceva.
- **Decizii de depunere cu motiv.** `extractDeposits` returnează fiecare transfer primit al unei tranzacții cu un indicator `creditable` și un `reason` (`evm_failed`, `fee_refund`, `unsupported_message` sau `null`). Prinde cazul care îi surprinde pe integratorii EVM: o execuție EVM eșuată raportează totuși codul de rezultat 0 la nivel native.
- **Un constructor de interogări care se potrivește cu nodul.** `buildDepositQuery` produce calea REST exactă, codificată procentual, pentru transferurile primite către o adresă (limită 1 până la 100, limite de înălțime, ordine crescătoare) și convertește intrarea `0x` în forma `qor1`.
- **Îndrumări scrise pe trasee.** Ghidul acoperă traseul native, traseul EVM cu ferestrele sale de autorizare și precizează că traseul SVM nu este deschis pentru tranzacții, deci nu trebuie construit pe el niciun flux de depunere sau retragere.

## Cazuri de utilizare {#use-cases}

1. **Scanner de depuneri pentru o bursă.** Păstrează un cursor de înălțime, apelează `buildDepositQuery({ address, minHeight, maxHeight })` pe propriul nod, apoi `extractDeposits(txResponse, address)` pentru a credita `MsgSend`, `MsgMultiSend` și transferurile EVM reușite în `uqor`. Execuțiile EVM eșuate, rambursările de gas și celelalte mesaje sunt excluse sau marcate pentru revizuire.
2. **Flux de retragere cu un al doilea aprobator.** După ce semnatarul produce o retragere semnată hibrid, un proces independent rulează `decodeTx` (destinatar, sumă, taxă, memo) și `verifyTx` (ambele semnături, chei așteptate) înainte ca tranzacția să fie transmisă.
3. **Preluarea adreselor.** Validează fiecare adresă de retragere furnizată de utilizator cu `validateAddress`, refuză adresele `qorvaloper` ca destinații de plată și, opțional, cere sume de control EIP-55 pentru intrările hex.
4. **Planificarea HSM.** O echipă de securitate folosește ghidul de gestionare a cheilor pentru a alege între chei ML-DSA-87 generate în HSM și derivarea canonică pe bază de mnemonic, pentru a verifica suportul PKCS #11 v3.2 pentru semnarea ML-DSA-87 pură cu context gol și pentru a proiecta rotația și copiile de rezervă.
5. **Canal de plăți EVM.** O bursă care plătește pe traseul EVM înregistrează o singură dată cheia ML-DSA-87, deschide câte o fereastră de autorizare cu domeniu limitat pentru fiecare lot printr-o singură tranzacție hibridă pe traseul native, apoi semnează tranzacții EIP-1559 obișnuite cu stiva ei secp256k1 existentă.
6. **Staking pentru clienți.** Un custode care oferă staking urmează ghidul de staking (delegare, anulare delegare, redelegare, recompense, blocări ale nivelului de staking) și decodează fiecare mesaj de staking cu `decodeTx` înainte de semnare.
7. **Portare într-un alt limbaj sau audit.** O echipă care își scrie propria implementare o rulează pe `vectors/custody-v1.json` pentru a arăta că se potrivește cu rezultatele și codurile de eroare de referință.
8. **Repetiție înainte de mainnet.** O echipă de integrare urmează repetiția pe testnet (înregistrarea cheii, trimitere hibridă, scanarea depunerilor, staking, fereastra EVM, rotația cheii) și lista de verificare a integrării.

## Cum funcționează {#how-it-works}

### Ce conține kitul {#contents}

| Parte | Ce este |
|---|---|
| `docs/` | Zece pagini de ghid: semnarea pe trasee, adrese și derivare, depuneri, retrageri, staking, erori, gestionarea cheilor, mediul de test, lista de verificare a integrării, FAQ. |
| `code/ts`, `code/python`, `code/go`, `code/rust`, `code/java` | Cod de referință cu aceleași patru funcții și o mică linie de comandă de exemplu pentru fiecare limbaj. |
| `vectors/custody-v1.json` | Vectori de test: o adresă bună și una greșită pentru fiecare cod de eroare, un `MsgDelegate` semnat hibrid, un `MsgOpenEVMWindow` semnat hibrid de la un cont eth-native, mesaje de staking și de fereastră, tranzacții malformate, interogări de depuneri și cazuri de extragere a depunerilor. Vectorii QoreSign sunt reutilizați prin referință și verificați cu SHA-256. |
| Verificări live | Verificări doar de citire pe testnet, activate cu `QORE_LIVE_TEST=1`: parametrii de staking, o interogare de depuneri pentru un transfer recent și verificarea unei tranzacții hibride confirmate. |

### Ce este bibliotecă și ce este cod de exemplu {#library-vs-example}

| Element | Tip | De unde îl obții |
|---|---|---|
| QoreSign (semnare, verificare ML-DSA-87 și secp256k1, mesajul de înregistrare a cheii) | Bibliotecă publicată | npm, PyPI, crates.io, Go, Maven Central. Vezi [QoreSign](/qoresign/overview). |
| Codul kitului în TypeScript, Python, Rust și Java | Cod de exemplu, nepublicat în niciun registru | Clonează `qorechain/qorechain-custody-kit` și copiază sau include în proiect (vendor) folderul. |
| Codul kitului în Go (pachetul `custodykit`) | Cod de exemplu. Poate fi descărcat ca modul Go la o versiune etichetată, fără promisiunea unui API stabil | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0`, sau clonează și include în proiect (vendor). |
| Paginile de ghid, vectorii și lista de verificare | Documentație și date | Repository-ul. |

Kitul nu implementează nicio schemă de semnătură. Verificarea ML-DSA-87 și secp256k1 provine din QoreSign. Codul Python conține un mic Keccak-256 folosit pentru suma de control EIP-55 și nimic altceva.

### Trasee {#lanes}

| Traseu | Ce semnează un custode | Stare |
|---|---|---|
| Native (Cosmos SDK) | `SIGN_MODE_DIRECT` secp256k1 plus un strat ML-DSA-87 (FIPS 204). Un cont cu cheie înregistrată nu are cale clasică; un cont fără cheie poate trimite clasic doar pentru a-și înregistra cheia (sau pentru unjail). | deschis |
| EVM | Tranzacții Ethereum secp256k1 obișnuite (EIP-155 și EIP-1559), admise pentru un expeditor cu o cheie ML-DSA-87 înregistrată și o fereastră de autorizare activă, deschisă de o tranzacție hibridă pe traseul native: o semnătură ML-DSA-87 per fereastră. | deschis |
| SVM | Nu se aplică | nu este deschis pentru tranzacții |

### Tranzacții hibride pe traseul native {#hybrid}

- O tranzacție hibridă este un `TxRaw` obișnuit semnat de două ori de același cont. Semnătura ML-DSA-87 circulă în corpul tranzacției ca opțiune de extensie `/qorechain.pqc.v1.PQCHybridSignature` (`algorithm_id = 1`, o semnătură de 4,627 de octeți, opțional cheia publică de 2,592 de octeți). Semnătura secp256k1 este semnătura obișnuită `SIGN_MODE_DIRECT` peste corpul final, extensia inclusă.
- Semnătura ML-DSA-87 acoperă sign-bytes care exclud extensia. Ambele rețele publice verifică sign-bytes v2 (un șir de domeniu, id-ul lanțului, apoi octeții corpului și ai auth info). Semnăturile FIPS 204 hedged și deterministe sunt ambele acceptate. Formatul normativ este [specificația de semnare hibridă QoreSign](/qoresign/spec/hybrid-signing-v1).
- Ordinea operațiilor: codifică corpul și auth info (taxa și gas-ul fixate), calculează sign-bytes v2, semnează cu ML-DSA-87, adaugă extensia, semnează `SignDoc` cu secp256k1, transmite.
- Înregistrarea cheii: `MsgRegisterPQCKeyV2` (`key_type = "hybrid"`, cu o dovadă de posesie opțională și recomandată), semnat clasic de la contul fără cheie, o dată pentru fiecare adresă hot. QoreSign construiește întregul mesaj.
- O tranzacție hibridă este cu aproximativ 4.7 KB mai mare decât una clasică și consumă mai mult gas, așa că simulează întotdeauna.

### Adrese {#addresses}

- `qor1...` și `0x...` sunt două scrieri ale acelorași 20 de octeți. Fondurile trimise la oricare ajung în același sold. `qorvaloper1...` este o adresă de operator de validator și niciodată o adresă de plată.
- Există două tipuri de conturi: `secp256k1` (coin type 118, cale `m/44'/118'/0'/0/i`) și eth-native `eth_secp256k1` (coin type 60, cale `m/44'/60'/0'/0/i`). Aceeași frază mnemonică dă două conturi diferite. Conturile eth-native permit unei singure chei să opereze atât traseul native, cât și traseul EVM.
- Cheia ML-DSA-87 poate proveni din derivarea canonică (ceea ce înregistrează portofelele QoreChain și SDK-ul, legată de adresa `qor1` și de mnemonic), dintr-o derivare ierarhică în ciornă sau dintr-o cheie aleatoare generată într-un HSM. Orice cheie validă funcționează după ce este înregistrată. Vezi [derivarea cheilor](/qoresign/guides/key-derivation).

### Depuneri {#deposits}

- QoreChain finalizează un bloc în momentul în care este confirmat. Nu există reorganizări, așa că o tranzacție dintr-un bloc confirmat este finală după un bloc. Confirmările suplimentare sunt o alegere operațională.
- Depunerile pe traseul native se găsesc cu `GET /cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...' AND tx.height>=H1 AND tx.height<=H2&order_by=ORDER_BY_ASC`. `buildDepositQuery` construiește exact această cale.
- Regulile de creditare din `extractDeposits`: o tranzacție cu `code != 0` nu a mutat nimic; un `transfer` fără `msg_index` este plata taxei; sumele sunt filtrate după denom (`uqor` implicit); ieșirile `MsgSend` și `MsgMultiSend` sunt creditabile; `MsgEthereumTx` este creditabil, cu excepția cazului în care execuția EVM a eșuat sau transferul este o rambursare de gas de la colectorul de taxe; orice altceva revine cu `reason: "unsupported_message"` pentru revizuire.

### Retrageri și gas {#withdrawals}

- Taxa = ceil(limita de gas x prețul gas-ului) în `uqor`. Prețul minim al gas-ului este 0.1 uqor, aplicat la limita de gas.
- Ia limita de gas dintr-o simulare a tranzacției complet semnate. Pe nodurile care au aplicat upgrade-ul v3.2.5 (acum testnet, mainnet după ce este aplicat) folosește `ceil(gas_used x 1.02) + 2000`, deoarece simularea include verificarea ML-DSA-87. Înainte de aceasta folosește `ceil((gas_used + 40000) x 1.4)`. Detectează care se aplică cu `GET /cosmos/upgrade/v1beta1/applied_plan/v3.2.5`, nu după dată.
- După alegerea limitei de gas, reconstruiește `AuthInfo` și semnează din nou: ambele semnături acoperă taxa.
- Secvențe: rulează o coadă de semnatar per adresă hot sau mai multe adrese hot pentru plăți în paralel.

### Ferestre de autorizare EVM {#evm-windows}

- O fereastră se deschide cu `/qorechain.pqc.v1.MsgOpenEVMWindow` (`blocks` de la 1 la 17,280, `max_txs` de la 1 la 1,000, `max_value` în `uqor` incluzând valoarea plus taxa maximă, `native_only` opțional, `allowed_targets` opțional cu până la 16 adrese) și se închide cu `MsgCloseEVMWindow`. Starea este la `GET /qorechain/pqc/v1/evm_window/{address}`.
- Deschiderea unei ferestre înlocuiește orice fereastră existentă și avansează secvența contului, care este nonce-ul său EVM: deschide fereastra, apoi citește nonce-ul.
- `eth_call` și `eth_estimateGas` nu necesită fereastră.

## Cum se utilizează {#how-to-use}

### Obține codul {#install}

Kitul este cod de referință: clonează repository-ul sau include în proiect (vendor) folderul pentru limbajul tău, în loc să instalezi un pachet.

| Limbaj | Cum îl obții | Depinde de | Platformă minimă |
|---|---|---|---|
| TypeScript | `git clone https://github.com/qorechain/qorechain-custody-kit`, apoi `cd code/ts && pnpm install && pnpm build` | `@qorechain/qoresign` 0.1.0 (npm) | Node.js 20 |
| Python | clonează, apoi `cd code/python && pip install -r requirements-dev.txt`. Pentru `verify_tx` rulează și `pip install qorechain-qoresign==0.1.1` | nimic la rulare; `qorechain-qoresign` 0.1.1 (PyPI) pentru `verify_tx` | Python 3.9 |
| Go | `go get github.com/qorechain/qorechain-custody-kit/code/go@v0.1.0` (pachetul `custodykit`), sau clonează | `github.com/qorechain/qoresign/go` v0.1.0 | Go 1.25 |
| Rust | clonează, apoi `cd code/rust && cargo build` (nu este pe crates.io) | `qorechain-qoresign` 0.1.0 (crates.io) | Rust ediția 2021 |
| Java | clonează, apoi `cd code/java && mvn test` (nu este pe Maven Central) | `io.github.qorechain:qoresign:0.1.0` (Maven Central), Gson | Java 17 |

QoreSign este publicat pentru fiecare limbaj folosit de kit, inclusiv Python. `verify_tx` din codul Python are nevoie de `qorechain-qoresign` 0.1.1 de pe PyPI (macOS și Linux). Codul TypeScript, Go, Rust și Java fixează QoreSign 0.1.0, care este încă publicat alături de 0.1.1.

### Pornire rapidă {#quickstart}

Rețea țintă: testnet (`qorechain-diana`) pentru tot ce citește lanțul. Variabila de mediu `QORE_REST` îndreaptă exemplele și verificările live către un alt endpoint REST, care în producție este propriul tău nod. Adresele de mai jos provin din fraza publică de test BIP-39 și nu trebuie să dețină niciodată fonduri.

**1. Validează o adresă (Go, offline).** Rulat la 27 octombrie 2026 dintr-un clone al etichetei `v0.1.0`:

```bash
cd code/go
go run ./cmd/custody-kit validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94
```

A afișat (cod de ieșire 0):

```json
{
  "valid": true,
  "kind": "account",
  "format": "hex",
  "checksum": "eip55",
  "bech32": "qor1npvwllfr9dqr8erajqqr6s0vxnk2ak55am9g2c",
  "hex": "0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
}
```

O adresă de validator este refuzată, cu excepția cazului în care o permiți cu `--allow-validator`:

```bash
go run ./cmd/custody-kit validate qorvaloper19rl4cm2hmr8afy4kldpxz3fka4jguq0a5ws5he
```

A afișat `"valid": false` cu `"error": "KIND_NOT_ALLOWED"` și detaliul `a validator address is not accepted here`, și a ieșit cu codul 1. Suita de teste Go (`go test ./...`) a trecut, de asemenea, pe același checkout.

**2. Decodează și verifică o tranzacție semnată înainte de transmitere.**

```bash
go run ./cmd/custody-kit decode <tx hex or base64>
go run ./cmd/custody-kit verify <tx> --chain-id qorechain-diana --account-number <n> \
  --pubkey <33-byte hex> --pq-pubkey <2592-byte hex>
```

Adaugă `--eth` pentru un cont eth-native. Citește numărul contului din `GET /cosmos/auth/v1beta1/account_info/{address}` și cheia ML-DSA-87 înregistrată din `GET /qorechain/pqc/v1/account/{address}`.

La fel în TypeScript, din linia de comandă de exemplu a kitului (`code/ts/src/cli.ts`):

```ts
import { decodeTx, fromHex, verifyTx } from "./index.js";

console.log(JSON.stringify(decodeTx(txBytes), null, 2)); // messages, memo, fee, signers, pqcLayers, txHash

const r = verifyTx({
  txBytes,
  chainId: "qorechain-diana",
  accountNumber: BigInt(accountNumber),
  classicalPublicKey: fromHex(secp256k1PubKeyHex),
  classicalKeyType: "secp256k1", // or "eth_secp256k1" for eth-native accounts
  pqPublicKey: fromHex(registeredMlDsa87KeyHex),
});
// r.valid, r.classical, r.signerKey ("match" | "absent" | "mismatch"), r.pq
```

**3. Scanează depunerile (citiri pe testnet).**

```bash
go run ./cmd/custody-kit deposits qor1... --from-height 8976000 --to-height 8976400
```

Rulat la 27 octombrie 2026 pentru adresa publică de test, pe înălțimile testnet 8976000 până la 8983000, a returnat o listă goală, ceea ce este de așteptat pentru o adresă care nu a primit niciodată nimic.

TypeScript (din `code/ts/src/cli.ts`):

```ts
import { DEFAULT_TESTNET_REST, buildDepositQuery, extractDeposits, getJson } from "./index.js";

const restUrl = process.env.QORE_REST ?? DEFAULT_TESTNET_REST;
const path = buildDepositQuery({ address, minHeight: BigInt(from), maxHeight: BigInt(to) });
const body = await getJson(restUrl, path);
const responses = (body.tx_responses ?? []) as Record<string, unknown>[];
const entries = responses.flatMap((r) => extractDeposits(r, address));
// each entry: txhash, height, msgIndex, messageType, sender, amount, denom, memo, creditable, reason
```

Go (din `code/go/cmd/custody-kit/main.go`):

```go
opts := custodykit.DepositQueryOptions{Address: addr, MinHeight: &from, MaxHeight: &to}
path, err := custodykit.BuildDepositQuery(opts)
// GET restURL + path, then for each tx_response:
r, err := custodykit.ParseTxResponse(raw)
entries, err := custodykit.ExtractDeposits(r, addr, "") // "" = uqor
```

**4. Celelalte limbaje.**

```bash
# Python (from code/python/src)
python -m qorechain_custody_kit validate qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h
python -m qorechain_custody_kit deposits <address> --from-height H --to-height H

# Rust
cargo run --example custody-kit -- validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94

# Java
mvn -q compile exec:java -Dexec.args="validate 0x9858EfFD232B4033E47d90003D41EC34EcaEda94"
```

**5. Rulează vectorii și verificările live.**

```bash
scripts/fetch-qoresign-vectors.sh            # optional: also check the QoreSign hybrid vectors
cd code/go && go test ./...                  # vectors
QORE_LIVE_TEST=1 go test -run Live ./...     # live reads against testnet
```

Fiecare limbaj are echivalentul (`pnpm test`, `pytest`, `cargo test`, `mvn test`). Verificările live nu necesită fonduri. Doar comenzile Go `validate` și `deposits` și suita de teste Go au fost rulate la scrierea acestei pagini; celelalte limbaje sunt descrise pe baza repository-ului.

### Funcții și comenzi principale {#api}

| TypeScript | Go | Python și Rust | Java | Ce face |
|---|---|---|---|---|
| `validateAddress(input, { allow, requireEip55 })` | `ValidateAddress(input, ValidateAddressOptions{Allow, RequireEIP55})` | `validate_address` | `Addresses.validateAddress` | Returnează `{ valid, kind, format, checksum, bech32, hex }` sau `{ valid: false, error }`. |
| `decodeTx(txBytes)`, `decodeMessage(typeUrl, value)` | `DecodeTx`, `DecodeMessage` | `decode_tx`, `decode_message` | `TxDecoder.decodeTx`, `decodeMessage` | Mesajele, memo, taxa, semnatarii, straturile ML-DSA-87 și hash-ul tranzacției. |
| `verifyTx({ txBytes, chainId, accountNumber, classicalPublicKey, classicalKeyType, pqPublicKey, signBytesVersion })` | `VerifyTx(VerifyTxArgs{...})` | `verify_tx` | `TxVerifier.verifyTx` | Returnează `{ valid, classical, signerKey, pq }`. Versiunea sign-bytes v1, v2 sau oricare. |
| `buildDepositQuery({ address, minHeight, maxHeight, event, page, limit, orderBy })` | `BuildDepositQuery` | `build_deposit_query` | `Deposits.buildDepositQuery` | Calea REST pentru transferurile primite. `event` este `transfer` (implicit) sau `coin_received`; `limit` de la 1 la 100, implicit 50; crescător implicit. |
| `extractDeposits(txResponse, address, { denom })` | `ExtractDeposits(resp, address, denom)` | `extract_deposits` | `Deposits.extractDeposits` | Intrări de depunere cu `creditable` și `reason`. |
| `depositEventQuery`, `percentEncode`, `getJson`, `toHex`, `fromHex` | `DepositEventQuery`, `PercentEncode`, `GetJSON`, `ToHex`, `FromHex`, `ParseTxResponse` | `deposit_event_query`, `get_json`, `from_hex` | `CustodyKit`, `Rest` | Helper-e. |

Sunt exportate, de asemenea, constantele `FEE_COLLECTOR`, `MSG_SEND`, `MSG_MULTI_SEND`, `MSG_ETHEREUM_TX`, `KNOWN_MESSAGES`, `PQC_HYBRID_TYPE_URL` și `DEFAULT_TESTNET_REST`.

Linie de comandă de exemplu în fiecare limbaj:

- `validate <address> [--allow-validator] [--require-eip55]`
- `decode <tx hex or base64>`
- `verify <tx> --chain-id ID --account-number N --pubkey HEX [--eth] [--pq-pubkey HEX]`
- `deposits <address> [--from-height H] [--to-height H] [--rest URL]`

Coduri de eroare, identice în fiecare limbaj:

- Kit: `MALFORMED_TX` (octeții nu sunt o tranzacție bine formată), `UNKNOWN_FIELD` (un câmp pe care decodorul nu îl cunoaște, pe care l-ar refuza și rețeaua), `INVALID_ARGUMENT`.
- `validateAddress`: cele unsprezece coduri enumerate la [Inovații](#innovations).

Refuzurile lanțului pe care un custode le întâlnește cel mai des, ca codespace și cod (tabelul complet se află în `docs/errors.md` al kitului):

| Codespace | Coduri |
|---|---|
| `sdk` | 3 nepotrivire de secvență, 4 neautorizat, 5 fonduri insuficiente, 11 fără gas, 12 memo prea mare, 13 taxă insuficientă, 19 deja în mempool |
| `pqc` | 20 semnătură hibridă necesară, 21 verificarea hibridă a eșuat, 7 cheie deja înregistrată, 26 fără fereastră EVM (sau fără cheie înregistrată), 27 fereastră epuizată sau în afara domeniului, 28 parametri de fereastră invalizi |
| `stakingtier` | 13 stake-ul este blocat |

Ramifică logica după codespace și cod împreună și păstrează log-ul brut.

## Cum se accesează {#how-to-access}

| | Mainnet | Testnet |
|---|---|---|
| Chain id | `qorechain-vladi` | `qorechain-diana` |
| EVM chain id | 9801 | 9800 |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Versiunea nodului | v3.2.4 (v3.2.5 încă neaplicat) | v3.2.6 (v3.2.5 aplicat) |

- Denominația este `uqor` (1 QOR = 10^6 uqor; pe traseul EVM 1 uqor = 10^12 wei). Prețul minim al gas-ului este 0.1 uqor, perioada de unbonding este de 21 de zile, iar limita memo este de 256 de caractere. Aceste valori au fost citite de pe ambele rețele la 27 octombrie 2026 și pot fi schimbate prin guvernanță, așa că în producție citește-le din lanț.
- Depunerile nu necesită chei și nici înregistrare. Trimiterea necesită o cheie ML-DSA-87 înregistrată pentru fiecare adresă hot.
- Rulează propriile noduri complete pentru producție. Endpoint-urile publice au limită de rată și sunt destinate dezvoltării. Dacă un script primește `403 Forbidden`, setează un header `User-Agent` explicit. Vezi [rularea unui nod](/developer-guide/running-a-node) și [conectarea la mainnet](/getting-started/connecting-to-mainnet).
- Testnet-ul primește fiecare versiune de nod înaintea mainnet-ului. Schimbă regulile de gas verificând upgrade-ul aplicat, nu după dată.
- Tokenurile de test de pe testnet (denom-uri bank de forma `erc20:0x...`, un token IBC) nu există pe mainnet. Creditează `uqor` pe ambele rețele.
- QOR de testnet vine din faucet-ul din dashboard-ul QoreChain și nu are valoare. Vezi [conectarea la testnet](/getting-started/connecting-to-testnet).

## Note de securitate {#security}

- Ambele chei ale unei adrese hot (secp256k1 și ML-DSA-87) semnează fiecare tranzacție de pe traseul native. Păstrează-le în același perimetru de custodie, sub același cvorum și aceeași pistă de audit.
- Fă o copie de rezervă a seed-ului ML-DSA-87 de 32 de octeți (chei software) sau folosește copia de rezervă a cheii oferită de HSM. Un cont cu cheie înregistrată nu are cale clasică, deci pierderea cheii ML-DSA-87 înseamnă că contul nu mai poate semna. Testează restaurarea pe testnet cu `verifyTx`.
- HSM-urile trebuie să suporte semnarea ML-DSA-87 pură (`CKM_ML_DSA` în PKCS #11 v3.2) peste sign-bytes cu context gol. `HashML-DSA` nu este acceptat.
- Rulează `decodeTx` și `verifyTx` pe fiecare tranzacție semnată înainte de transmitere, într-un proces care nu a construit-o.
- Rotația folosește `MsgRotatePQCKey`: ambele chei semnează, stratul propriu al tranzacției folosește cheia curentă, iar reutilizarea unei chei anterioare este refuzată. Dacă cheia secp256k1 este expusă, mută fondurile la o adresă nouă, cu ambele chei noi, și închide orice fereastră EVM deschisă.
- Ferestre EVM: folosește `native_only` sau `allowed_targets`, cele mai mici `max_value` și `blocks` care acoperă lotul și închide fereastra după lot. Tratează `MsgSetWithdrawAddress`, `MsgRotatePQCKey`, `MsgOpenEVMWindow` și `MsgAuthorizeEVMDelegation` ca operațiuni privilegiate.
- Nu credita niciodată o tranzacție EVM al cărei eveniment `ethereum_tx` raportează un eșec, chiar dacă rezultatul ei native este `code == 0`.
- Acesta este cod de referință la versiunea 0.1.0. Revizuiește-l înainte să-l folosești în producție. Raportează vulnerabilitățile în privat la security@qore.network, inclusiv erorile de documentație care ar putea duce la o creditare greșită sau la o semnare neintenționată.

## Unde este publicat {#where-published}

Verificat față de registre la 27 octombrie 2026.

| Registru | Pachet | Versiune | Link |
|---|---|---|---|
| GitHub | `qorechain/qorechain-custody-kit` (toate cele cinci limbaje, paginile de ghid, vectorii) | release `v0.1.0`, publicat la 27 octombrie 2026 | https://github.com/qorechain/qorechain-custody-kit |
| Proxy-ul de module Go | `github.com/qorechain/qorechain-custody-kit/code/go` (cod de exemplu, descărcabil) | v0.1.0 (eticheta `code/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-custody-kit/code/go |
| npm, PyPI, crates.io, Maven Central | nepublicat: kitul este cod de exemplu de copiat sau inclus în proiect (vendor) | nu se aplică | nu se aplică |

Release-ul GitHub nu are fișiere atașate; release-ul este eticheta repository-ului. Dependențele pe care se bazează kitul, toate publicate: `@qorechain/qoresign` pe npm (ultima 0.1.1, kitul fixează 0.1.0), `qorechain-qoresign` pe PyPI (0.1.1), `qorechain-qoresign` pe crates.io (ultima 0.1.1, kitul fixează 0.1.0), `github.com/qorechain/qoresign/go` (v0.1.0 și v0.1.1) și `io.github.qorechain:qoresign` pe Maven Central (0.1.0 și 0.1.1).

Licență Apache-2.0. Mentenanță: QoreChain Association.

## Limite și probleme cunoscute {#limits}

- Kitul nu deține chei, nu semnează tranzacții, nu transmite și nu oferă semnare threshold sau MPC. Semnarea este făcută de QoreSign sau de HSM-ul tău. Astăzi nu există o schemă threshold standardizată pentru ML-DSA; ghidul documentează cum se combină o cheie secp256k1 threshold cu o cheie ML-DSA-87 deținută separat.
- Nu face nicio afirmație despre procesele interne ale vreunui custode. Lista de verificare descrie doar cerințele rețelei.
- `validateAddress` acceptă adrese de 20 de octeți. Adresele mai lungi de conturi de modul și de contract sunt refuzate, așa cum trebuie pentru adresele de depunere și de plată.
- `extractDeposits` creditează automat `MsgSend`, `MsgMultiSend` și `MsgEthereumTx` reușite. Celelalte mesaje (retrageri de recompense, apeluri de contract, transferuri IBC) sunt returnate pentru revizuire, nu creditate.
- `verifyTx` verifică tranzacții cu un singur semnatar.
- Traseul SVM nu este deschis pentru tranzacții. Nu construi fluxuri de depunere sau retragere pe el.
- Codul propriu al kitului este cod de exemplu la 0.1.0. Numele și semnăturile funcțiilor se pot schimba între versiuni, iar eticheta modulului Go nu promite un API stabil.
- La scrierea acestei pagini au fost rulate doar exemplele și suita de teste Go. Verificările live și verificările de vectori din celelalte patru limbaje nu au fost rulate din nou.
- README-ul Python al repository-ului poate spune încă faptul că `verify_tx` ridică o eroare de import până când `qorechain-qoresign` 0.1.1 ajunge pe PyPI. Acea versiune este publicată, deci nota este depășită.
- Ghidul kitului citează parametri (cifre de gas, valori ale nivelului de staking) citiți la 27 octombrie 2026. În producție citește-i din lanț.

## Pagini conexe {#related}

- [QoreSign](/qoresign/overview): semnare hibridă, verificare, mesajul de înregistrare a cheii și helper-ele de gas `suggestGasLimit` și `simulateTx`.
- [QoreChain SDK](/sdk/overview): decodarea erorilor cu `decodeTxError`, compozitoarele pentru fereastra EVM și clasificatorul de refuzuri.
- [Semnare post-cuantică](/developer-guide/post-quantum-signing): semnături hibride, sign-bytes v2 și înregistrarea cheii.
- [Ghid pentru burse și integratori](/developer-guide/exchange-integration): alegerea între căile native, EVM și SVM.
- [Precompilările EVM](/developer-guide/evm-precompiles) și traseul EVM.
- [Staking și delegare](/user-guide/staking-and-delegation).
- [Rularea unui nod](/developer-guide/running-a-node) și [conectarea la mainnet](/getting-started/connecting-to-mainnet).
- [Serverul MCP QoreChain](/developer-tools/mcp): `get_pq_status` și `simulate_tx` pentru verificări rapide.
- [QoreScan](/developer-tools/qorescan): inventariază criptografia nodului, a endpoint-urilor și a conturilor tale.
