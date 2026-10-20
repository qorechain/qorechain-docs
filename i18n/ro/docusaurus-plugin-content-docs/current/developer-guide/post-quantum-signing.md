---
slug: /developer-guide/post-quantum-signing
title: Semnare post-cuantică
sidebar_label: Semnare post-cuantică
sidebar_position: 8
---

# Semnare post-cuantică

`qorechain-pqc` este biblioteca open-source de criptografie post-cuantică, **bazată exclusiv pe standarde**, din spatele QoreChain. Aceasta oferă portofelelor, integratorilor și instrumentelor exact primitivele pe care le folosește lanțul — în șase limbaje, cu un API unic și consecvent, **cu compatibilitate la nivel de octet dovedită** printr-o suită comună de vectori de test inter-limbaje.

Biblioteca împachetează implementări auditate ale **standardelor NIST finale**. Ea **nu** inventează o schemă proprie: o variantă non-standard este exact ceea ce rupe interoperabilitatea (o semnătură produsă într-un loc nu s-ar verifica în altul). Fiecare binding este validat pe aceiași vectori, astfel încât o semnătură ML-DSA produsă într-un limbaj se verifică în toate celelalte, secretele partajate ML-KEM coincid în toate cele șase, iar digest-urile SHAKE-256 sunt identice.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licență:** Apache-2.0

## Primitive

| Primitivă | Standard | Rol | Niveluri (implicit cu **bold**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | semnături digitale | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | încapsulare de chei | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash cu ieșire extensibilă | — |

Acestea sunt aceleași primitive pe care QoreChain le rulează la nivel de protocol: semnături **ML-DSA-87 (Dilithium-5)**, încapsulare de chei **ML-KEM-1024** și **SHAKE-256** ca hash aplicativ implicit. Vezi [Securitate post-cuantică](/architecture/post-quantum-security) pentru modul în care lanțul le folosește.

### Dimensiuni (octeți)

Alege nivelul de securitate în funcție de bugetul tău de dimensiune/securitate.

| Schemă | Securitate | Cheie publică | Semnătură / Ciphertext |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> Nu poți face un standard NIST mai mic și să rămână standard. ML-DSA-87 are dimensiuni fixe de cheie/semnătură și octeți ficși — „optimizarea" lui produce o variantă non-standard pe care nicio altă implementare nu o poate verifica. Pentru a reduce amprenta on-chain, folosește pârghiile de mai jos în loc să modifici schema.

## Limbaje și pachete

Fiecare limbaj expune același API, fiecare fiind susținut de o implementare auditată diferită. Acesta este mecanismul care garantează compatibilitatea la nivel de octet — backend-uri independente cad de acord asupra standardului.

| Limbaj | Pachet | Instalare | Susținut de |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (bibliotecă statică + header) | se compilează din [repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.3` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilitate
Binding-urile JavaScript, Rust, Python, Go și Java sunt toate **publicate** la versiunea **0.2.3** (npm, crates.io, PyPI, proxy-ul de module Go ca `v0.2.3` și Maven Central; verificat la 21 octombrie 2026). Instalează-le cu comenzile de mai sus. Distribuția Python se instalează ca `qorechain-pqc`, dar **se importă ca `qorpqc`**. Pachetul **Java** este `io.github.qorechain:qorechain-pqc:0.2.3` (backend Bouncy Castle). Versiunea **0.2.0** a adăugat `hybridSignBytes` conștient de versiune (mai jos), **0.2.1** a corectat numele de upgrade care marchează trecerea la v2 pentru mainnet, iar **0.2.2** a corectat documentația și comentariile despre semnarea hedged față de cea deterministă (lanțul le acceptă pe amândouă; în binding-ul JavaScript, în cod s-a schimbat doar constanta de versiune); **0.2.3** actualizează dependențele criptografice (Bouncy Castle în Java, `@noble/post-quantum` în JavaScript), cu rezultat identic. Folosește 0.2.1 sau mai nou. Binding-ul **C** este o bibliotecă statică + header pe care le compilezi din [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Semnare deterministă (implicită) {#deterministic-signing}

Începând cu versiunea **0.1.1** (și în fiecare versiune ulterioară), `sign()` produce varianta ML-DSA **deterministă** (FIPS-204 §3.4, în care randomness-ul de semnare este format din 32 de octeți zero) în **toate cele șase binding-uri**. Lanțul acceptă orice semnătură ML-DSA-87 validă conform FIPS-204, hedged sau deterministă: verificarea este identică pentru ambele, iar un verificator nu le poate deosebi fără cheia secretă. Binding-urile semnează determinist în mod implicit pentru ca aceeași tranzacție să producă mereu aceeași semnătură și același hash de tx, și pentru ca toate binding-urile să corespundă vectorilor comuni.

Fapte cheie:

* Ieșirea deterministă este **identică octet cu octet în toate cele șase binding-uri** pentru aceeași cheie și același mesaj, fixată prin vectori de test comuni între limbaje.
* Semnarea hedged rămâne disponibilă ca **opțiune explicită** în fiecare binding (de ex. `{hedged: true}` în JavaScript, `sign_hedged` în Rust, `mldsaSignHedged` în Java, `sign(..., hedged=True)` în Python). Semnăturile hedged **sunt acceptate de lanț** ca orice semnătură FIPS-204 validă; singura diferență este că semnătura, deci și hash-ul de tx, se schimbă la fiecare semnare.
* Versiunea 0.1.0 a binding-ului JavaScript semna implicit hedged. Și acele semnături sunt valide on-chain; faceți upgrade la 0.1.1 dacă vreți semnături reproductibile care corespund vectorilor comuni.

## Înregistrarea cheii {#pqc-key-registration}

Fiecare cont își înregistrează cheia publică ML-DSA-87 **o singură dată, în mod explicit**. Nu există înregistrare automată: o cheie publică inclusă într-o tranzacție hibridă ulterioară (de exemplu opțiunea `includePqcPublicKey` a SDK-ului) este transportată în extensie, dar **nu** o înregistrează. O **primă** înregistrare este singura tranzacție pe lane-ul Cosmos care poate fi semnată clasic, astfel încât un cont nou-nouț își poate iniția prima cheie; un cont care are deja o cheie trebuie să semneze hibrid orice mesaj de cheie ulterior. Fă-o cu `qorechaind` din release (un binar compilat din sursa publică nu poate semna; vezi [Compilare din sursă](/developer-guide/building-from-source)), cu QoreX sau cu `ensurePqcRegistered` din SDK:

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

Setează `--gas` explicit: cheia publică de 2.592 de octeți poate depăși gas-ul implicit de 200.000 (înregistrările de pe mainnet au folosit aproximativ 220.000 până la 310.000; o înregistrare cu dovadă de posesie poartă încă o semnătură de 4.627 de octeți, adică aproximativ 46.000 de gas în plus), iar taxa trebuie să fie cel puțin gas × 0.1 uqor, deci `--gas 600000` necesită `--fees 60000uqor` sau mai mult. Forma veche `qorechaind tx pqc register-key <pubkey-hex> hybrid` este echivalentă pentru Dilithium-5. De acum încolo, construiește fiecare tranzacție pe lane-ul Cosmos cu `--generate-only` și semn-o cu `qorechaind tx pqc cosign`. Fișierul cheii este cheia de semnare post-cuantică a contului: oricine îl poate citi poate cosemna pentru cont împreună cu cheia clasică, așa că fă-i backup ca mnemonicului (poate fi rederivat din mnemonic, vezi mai jos).

O cheie înregistrată este totodată prima dintre cele două cerințe pentru trimiterea tranzacțiilor EVM; a doua este o [fereastră de autorizare EVM](/developer-guide/evm-development#evm-window) deschisă.

### Ce verifică lanțul la înregistrare (mainnet v3.2.3 și mai nou) {#key-integrity}

De la upgrade-ul v3.2.3 (aplicat pe mainnet la înălțimea 3.662.051, pe 20 octombrie 2026), lanțul verifică cheia în sine, nu doar că are lungimea corectă:

| Regulă | Refuz (codespace `pqc`) |
| --- | --- |
| `key_type` trebuie să fie `hybrid` sau `pqc_only`; `classical_only` nu înregistrează nicio cheie post-cuantică și ar lăsa contul în imposibilitatea de a mai semna vreodată | cod 230 |
| O cheie care nu oferă nicio protecție post-cuantică (o cheie degenerată pentru care nimeni nu are nevoie de un secret) este refuzată, la fel la înregistrare, rotație și migrare | cod 230 |
| O cheie pe care contul a folosit-o înainte nu poate fi înregistrată din nou și nici nu se poate reveni la ea printr-o rotație (contul ține minte cheile retrase) | cod 232 |
| Cheia clasică din înregistrare trebuie să fie cheia secp256k1 comprimată a semnatarului însuși (începând cu v3.2.2) | cod 45 |
| O dovadă de posesie opțională, dacă este prezentă, trebuie să se verifice | cod 231 |
| Un cont care deține deja o cheie trebuie să semneze hibrid orice mesaj de cheie ulterior (înregistrare, migrare); doar repararea unei înregistrări care nu conține nicio cheie utilizabilă poate fi clasică | cod 234 |
| Depreciarea sau dezactivarea unui algoritm nu poate lăsa lanțul fără un algoritm de semnare activ | cod 233 |

În plus, începând cu v3.2.3, niciunul dintre mesajele de cheie (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey`, `MsgMigratePQCKey`) nu poate fi trimis în numele unui cont prin `authz`; o tranzacție poate purta cel mult **o** extensie de semnătură hibridă; iar un cont care **nu** are nicio cheie înregistrată nu mai poate atașa o extensie hibridă care nu are față de ce să fie verificată (doar o înregistrare poate trece, exact ca în cazul lipsei oricărei extensii).

### Dovadă de posesie (opțională) {#proof-of-possession}

O înregistrare poate dovedi, de asemenea, că cel care o face deține secretul noii chei. Cheia semnează `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` (id-ul algoritmului este `1` pentru ML-DSA-87; cheia publică este în hex cu litere mici), iar semnătura se pune în câmpul `proof_of_possession` din `MsgRegisterPQCKeyV2`. În CLI, `register-key-v2 ... --pqc-key <name>` o construiește și o atașează. Cu SDK-ul TypeScript 0.9.0, `ensurePqcRegistered` atașează dovada singur după ce rețeaua a aplicat v3.2.3 (iar `signProofOfPossession` / `verifyProofOfPossession` construiesc și verifică una manual); `@qorechain/chain-bridge` 0.2.3 face același lucru când i se dă `cosmosRest`. `@qorechain/wallet-adapter` (0.4.0) și versiunile SDK anterioare lui 0.9.0 nu atașează una, deci o înregistrare făcută prin ele nu poartă niciuna, ceea ce lanțul acceptă în continuare. Lanțul verifică dovada **atunci când este prezentă** și refuză înregistrarea dacă aceasta nu se verifică (cod 231); o înregistrare fără dovadă este în continuare acceptată pe mainnet. Deoarece mesajul numește lanțul, algoritmul, contul și cheia, o dovadă făcută pentru unul dintre ele nu dovedește nimic pentru altul.

**Flag de posesie și validatori de punte (v3.2.4).** Înregistrarea contului raportează dacă cheia curentă a contului a fost dovedită: `possession_proven`, în `GET /qorechain/pqc/v1/account/{address}`. Este `true` când cheia a fost înregistrată cu o dovadă de posesie verificată sau a fost instalată printr-o rotație (noua cheie semnează rotația, ceea ce o dovedește); rămâne `false` pentru un cont care s-a înregistrat fără dovadă. Flagul nu schimbă nimic privind cine poate trimite sau primi. Înregistrarea unui **validator de punte** cere în plus o dovadă de posesie a cheii post-cuantice a validatorului (`proof_of_possession` în înregistrare; cheia semnează `qorechain-pqc-pop-v1|<chain-id>|1|<validator address>|<public key hex>`, cu opțiunea CLI `--pqc-key`), iar doi validatori de punte nu pot înregistra aceeași cheie. Puntea cross-chain în sine nu este în producție. Ambele modificări sunt pe testnet din 19 octombrie 2026 și pe mainnet de la înălțimea 3.742.566 (propunerea de guvernanță 13): mainnet-ul rulează v3.2.3 până la acel bloc și v3.2.4 de la acesta.

## Coduri de refuz (codespace `pqc`) {#pqc-codes}

| Cod | Semnificație |
| --- | --- |
| 20 | Semnătură hibridă necesară: tranzacția nu poartă nicio extensie PQC (doar o primă înregistrare și un unjail făcut de un cont fără cheie sunt scutite) |
| 21 | Jumătatea ML-DSA-87 nu s-a verificat, vezi [mai jos](#code-21) |
| 26, 27, 28 | Lane-ul EVM: nicio fereastră deschisă sau nicio cheie / fereastră epuizată / limite de fereastră invalide, vezi [Dezvoltare EVM](/developer-guide/evm-development#evm-window) |
| 45 | Cheia clasică dintr-o înregistrare nu este cheia secp256k1 comprimată a semnatarului însuși |
| 60, 61 | Delegare EIP-7702: niciun consimțământ post-cuantic pentru această delegare / cerere de delegare invalidă |
| 62, 63 | Un cont delegat nu are nicio fereastră care să acopere acțiunea / o tranzacție Ethereum se execută doar pe lane-ul EVM |
| 230 | Cheie slabă sau înregistrare `classical_only` |
| 231 | Dovada de posesie nu se verifică |
| 232 | Cheia a fost folosită înainte de acest cont |
| 233 | Nu ar mai rămâne niciun algoritm de semnare activ |
| 234 | Întreținerea cheii de la un cont care are cheie necesită semnătura hibridă |

## Depanarea codului `pqc` 21 (`hybrid_verify_failed`) {#code-21}

Codul 21 înseamnă că jumătatea ML-DSA-87 a unei semnături hibride nu s-a verificat cu cheia înregistrată a contului. Alegerea între semnare hedged și deterministă **nu** este niciodată cauza. Verificați, în această ordine:

1. **Versiunea sign-bytes.** Semnătura PQC acoperă fie sign-bytes v1, fie v2, iar o rețea verifică exact o formă la orice înălțime: `qorechain-diana` a trecut la v2 la upgrade-ul `v3.1.98`, `qorechain-vladi` la upgrade-ul `v3.2.0`, iar lanțurile create ulterior sunt v2 de la geneză. SDK-urile actuale aleg forma pentru fiecare rețea; un signer construit de mână trebuie să întrebe nodul ce upgrade este aplicat (vezi [Conturi și semnare PQC](/sdk/concepts/accounts-pqc)).
2. **Chain-id în sign-bytes v2.** v2 leagă chain-id-ul, deci o semnătură făcută pentru `qorechain-diana` nu se verifică pe `qorechain-vladi` și invers.
3. **Bibliotecă PQC învechită.** Build-urile de dinainte de standard (pre-FIPS-204) produc semnături pe care un verificator conform le respinge. Folosiți `qorechain-pqc` 0.1.1 sau mai nou.
4. **Cheie greșită.** Cheia publică trebuie să fie cea înregistrată pentru cont (`GET /qorechain/pqc/v1/account/{address}`). O cheie obținută cu altă derivare (de exemplu derivarea veche a bridge-ului `shake256(mnemonic)` în locul celei legate de adresă) semnează valid, dar nu se potrivește. Vezi [Rotirea cheii](#key-rotation) pentru a trece la cheia canonică.

## Derivare deterministă a cheilor și recuperare {#key-derivation}

Derivarea standard a ecosistemului leagă cheia ML-DSA-87 de cont, astfel încât aceasta este **recuperabilă exclusiv din mnemonicul contului**:

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Fiecare instrument publicat (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) derivă aceeași cheie, astfel încât un mnemonic produce o singură cheie indiferent de instrumentele folosite. Recuperează o cheie din CLI (mnemonicul pe stdin):

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

Cheia privată recuperată este scrisă ca hex necriptat (mod 0600) în `<home>/pqc/mykey.dilithium`, pentru a fi folosită cu `tx pqc cosign`.

## Rotația cheilor (același algoritm) {#key-rotation}

Începând cu versiunea de lanț **v3.1.85**, **`MsgRotatePQCKey`** rotește cheia ML-DSA-87 a unui cont **în cadrul aceluiași algoritm** — anterior, înregistrarea era o operațiune unică, iar `MigratePQCKey` traversa doar între algoritmi. Folosește-l pentru a migra o cheie derivată în mod legacy către derivarea canonică legată de adresă sau pentru a retrage o cheie compromisă.

Rotația este **semnată dublu**: atât cheia veche, cât și cea nouă semnează mesajul cu separare de domeniu `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Replay-ul este structural imposibil — odată rotită, cheia veche nu mai corespunde cheii înregistrate, deci același mesaj nu se poate reaplica. Rotația este o operațiune **exclusiv pentru cheia rădăcină** (niciodată delegabilă unui [authenticator](/developer-guide/account-abstraction#authenticators)), iar tranzacția în sine este în continuare semnată hibrid cu cheia *veche*, dovedind proprietatea curentă.

CLI într-un singur pas (mnemonicul pe stdin; recuperează cheia veche, derivă sau generează cheia nouă, semnează dublu, difuzează):

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

Rotația transportă două chei de 2.592 de octeți și trei semnături, deci necesită mult mai mult gas decât un transfer; păstrează `--gas 600000` explicit și o taxă de cel puțin 60.000 uqor. `--new-random` fără `--new-key-out` este refuzat (versiunea de nod v3.2.1 și mai nouă), astfel încât o rotație să nu te poată lăsa niciodată fără cheia nouă.

În cod, `@qorechain/wallet-adapter` (≥0.1.7) și `@qorechain/sdk` (≥0.7.0) expun același flux (sincron; returnează mesajul plus ambele perechi de chei):

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

Helperele de rotație din SDK 0.9.0 și din `@qorechain/wallet-adapter` 0.4.0 refuză derivarea legacy ca cheie **nouă** (nu este legată de cont); o cheie legacy poate fi în continuare cheia veche. După o rotație reușită, cheia nouă semnează (cod 0), iar cheia veche este respinsă (`pqc` cod 21). Începând cu v3.2.3, o rotație (ca și o migrare) refuză o cheie nouă care nu oferă nicio protecție post-cuantică (cod 230) și o cheie pe care contul a folosit-o înainte (cod 232) și nu poate fi trimisă prin `authz`.

## API consecvent

Fiecare limbaj oferă aceeași suprafață:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Pornire rapidă (JavaScript / TypeScript)

```js
import { mldsa, mlkem, shake256, pubkeyHash } from '@qorechain/pqc';

// ML-DSA-87 signatures
const { publicKey, secretKey } = mldsa.keygen();
const sig = mldsa.sign(secretKey, message);
mldsa.verify(publicKey, message, sig); // true

// ML-KEM-1024 key encapsulation
const { publicKey: ek, secretKey: dk } = mlkem.keygen();
const { cipherText, sharedSecret } = mlkem.encapsulate(ek);
mlkem.decapsulate(dk, cipherText); // === sharedSecret

// SHAKE-256 + blockchain helpers
shake256(data, 32);        // 32-byte digest
pubkeyHash(publicKey, 20); // pay-to-pubkey-hash
```

Exporturi specifice fiecărui nivel sunt disponibile acolo unde valoarea implicită nu este ceea ce vrei: `mldsa44/65/87` și `mlkem512/768/1024` (`mldsa` / `mlkem` sunt valorile implicite L5).

Binding-urile **Rust, Go, C, Python și Java** oglindesc exact acest API. De exemplu:

```rust
// Rust
use qorechain_pqc::mldsa::default as mldsa;
let (pk, sk) = mldsa::keygen()?;
let sig = mldsa::sign(&sk, msg)?;
assert!(mldsa::verify(&pk, msg, &sig));
```

```go
// Go
pk, sk, _ := pqc.MLDSA.Keygen()
sig, _ := pqc.MLDSA.Sign(sk, msg)
pqc.MLDSA.Verify(pk, msg, sig) // true
```

## Helpere pentru blockchain

Dincolo de primitivele brute, biblioteca expune două helpere de care integratorii au nevoie pentru a interacționa cu conturile și tranzacțiile QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper de înregistrare **pay-to-pubkey-hash**. Produce un hash SHAKE-256 scurt (20–32 de octeți) al unei chei publice. Modelul: stochează doar `pubkeyHash` în starea contului și cere cheia publică integrală în tranzacție. Starea contului rămâne minusculă indiferent de cheia de 1–2,5 KB.

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

Framing-ul QoreChain al **sign-bytes cu extensie hibridă**, compatibil cu portofelele. Acesta produce exact octeții care trebuie semnați cu ML-DSA-87 (Dilithium-5) pentru a forma jumătatea PQC a unei tranzacții hibride. Există două forme, iar o rețea verifică exact una la orice înălțime: **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` și **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0` este corpul tranzacției fără extensia PQC, `A` este auth info). Ambele rețele publice sunt pe **v2**. Biblioteca este pură, deci apelantul alege forma: întreabă nodul `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pentru **ambele** nume, `v3.2.0` (numele upgrade-ului de mainnet) și `v3.1.98` (numele anterior al testnet-ului), și folosește v2 dacă oricare înălțime este peste 0; `signBytesVersionForApplied` și `signBytesVersionFor(chainId, height)` implementează regula (folosește `@qorechain/pqc` 0.2.1 sau mai nou; forma cu 2 argumente din 0.1.x aruncă o eroare).

Aceasta este piesa pe care portofelele și integratorii o folosesc pentru a produce **semnătura hibridă obligatorie** pe calea de tranzacții cosmos. Începând cu versiunea curentă a lanțului, semnăturile hibride sunt **obligatorii în mod implicit** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): fiecare tranzacție pe calea cosmos trebuie să poarte o semnătură Dilithium-5 alături de semnătura sa clasică secp256k1. Vezi [Securitate post-cuantică](/architecture/post-quantum-security) pentru modelul de aplicare.

Semnătura clasică secp256k1 este calculată peste sign bytes standard (care **exclud** extensia PQC), iar semnătura ML-DSA-87 este calculată și atașată ca extensia `PQCHybridSignature`. Deoarece sign bytes clasice exclud extensia, semnătura clasică rămâne validă indiferent dacă un verificator înțelege sau nu partea PQC.

Există trei moduri de a produce această semnătură hibridă:

* **CLI-ul** — `qorechaind tx pqc cosign` atașează cosemnătura Dilithium-5 unei tranzacții și o difuzează (după `qorechaind tx pqc gen-key` și înregistrarea cheii). Face parte doar din binarul de release. Vezi [Comenzi de tranzacții](/cli-reference/transaction-commands).
* **SDK-ul QoreChain** — `buildHybridTx` / `signAndBroadcastHybrid` (transmite `rest` pentru ca forma sign-bytes să fie determinată) fac echivalentul în TypeScript, Python, Go, Rust și Java; în TypeScript, `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0) semnează hibrid fiecare tranzacție; înregistrează mai întâi cheia (vezi mai sus). Vezi [Conturi SDK și semnare PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direct** — folosește `hybridSignBytes` pentru a încadra sign bytes și `mldsa.sign` pentru a produce semnătura Dilithium-5, atunci când construiești instrumente în afara SDK-ului într-unul dintre cele șase limbaje suportate.

## Optimizarea amprentei on-chain

Cheile și semnăturile ML-DSA sunt mari după standardele clasice. Deoarece octeții unui standard sunt ficși, modul de a menține amprenta on-chain mică este să folosești aceste trei pârghii — niciuna dintre ele nu modifică standardul:

1. **Alege deliberat nivelul de securitate.** Semnăturile ML-DSA-65 (L3) sunt cu ~28% mai mici decât ML-DSA-87 (L5) și rămân foarte puternice; ciphertext-urile ML-KEM-768 sunt mai mici decât cele 1024. Alege în funcție de cazul de utilizare.
2. **Pay-to-pubkey-hash.** Stochează doar `pubkeyHash(pk)` (20–32 de octeți de SHAKE-256) în starea contului și cere cheia publică integrală în tranzacție. Starea contului rămâne minusculă indiferent de dimensiunea cheii.
3. **Semnături de tip verify-and-discard.** O semnătură trebuie să existe în tranzacție (datele blocului), dar nu ar trebui niciodată scrisă în arborele de stare persistent.

> **De ce nu Falcon?** FN-DSA (Falcon) ar oferi semnături mai mici, dar este **exclus** în mod intenționat: FN-DSA este FIPS-206 în stadiu de *draft* (nu final), iar o bibliotecă bazată exclusiv pe standarde livrează doar standarde finalizate. Poate fi reanalizat odată ce FIPS-206 este finalizat.

## Resurse conexe

* [Securitate post-cuantică](/architecture/post-quantum-security) — cum folosește lanțul aceste primitive și cum aplică semnăturile hibride.
* [Comenzi de tranzacții](/cli-reference/transaction-commands) — fluxul CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Conturi SDK și semnare PQC](/sdk/concepts/accounts-pqc) — chei și semnare hibridă din SDK-ul QoreChain.
* [Configurarea portofelului](/getting-started/wallet-setup) — creează și gestionează conturi susținute de PQC.
