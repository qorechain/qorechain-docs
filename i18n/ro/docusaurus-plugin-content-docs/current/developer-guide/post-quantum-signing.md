---
slug: /developer-guide/post-quantum-signing
title: Semnare post-cuantică
sidebar_label: Semnare post-cuantică
sidebar_position: 8
---

# Semnare post-cuantică

`qorechain-pqc` este biblioteca open-source de criptografie post-cuantică, **exclusiv pe bază de standarde**, din spatele QoreChain. Ea oferă portofelelor, integratorilor și instrumentelor exact primitivele pe care le folosește lanțul — în șase limbaje, cu un API unic și consecvent, **dovedit compatibil la nivel de octeți** printr-o suită comună de vectori de test inter-limbaje.

Biblioteca încapsulează implementări auditate ale **standardelor NIST finale**. Ea **nu** inventează o schemă proprie: o variantă non-standard este exact ceea ce distruge interoperabilitatea (o semnătură produsă într-un loc nu s-ar verifica în altul). Fiecare binding este validat pe aceiași vectori, astfel încât o semnătură ML-DSA produsă într-un limbaj se verifică în toate celelalte, secretele partajate ML-KEM coincid în toate cele șase, iar digest-urile SHAKE-256 sunt identice.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licență:** Apache-2.0

## Primitive

| Primitivă | Standard | Rol | Niveluri (implicit în **bold**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | semnături digitale | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | încapsulare de chei | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash cu ieșire extensibilă | — |

Acestea sunt aceleași primitive pe care QoreChain le rulează la nivel de protocol: semnături **ML-DSA-87 (Dilithium-5)**, încapsulare de chei **ML-KEM-1024** și **SHAKE-256** ca hash implicit al aplicației. Vezi [Securitate post-cuantică](/architecture/post-quantum-security) pentru modul în care lanțul le utilizează.

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

> Nu poți face un standard NIST mai mic și să rămână totuși standard. ML-DSA-87 are dimensiuni fixe pentru chei/semnături și octeți ficși — „optimizarea" lui produce o variantă non-standard pe care nicio altă implementare nu o poate verifica. Pentru a micșora amprenta on-chain, folosește pârghiile de mai jos, nu modifica schema.

## Limbaje și pachete

Fiecare limbaj expune același API, fiecare fiind susținut de o implementare auditată diferită. Aceasta este garanția compatibilității la nivel de octeți — backend-uri independente sunt de acord asupra standardului.

| Limbaj | Pachet | Instalare | Susținut de |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (bibliotecă statică + header) | compilează din [repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilitate
Binding-urile JavaScript, Rust, Python, Go și Java sunt toate **publicate** la versiunea **0.1.1** — instalează-le direct din npm, crates.io, PyPI, proxy-ul de module Go și Maven Central cu comenzile de mai sus. Distribuția Python se instalează ca `qorechain-pqc`, dar **se importă ca `qorpqc`**. Pachetul **Java** este pe Maven Central ca `io.github.qorechain:qorechain-pqc:0.1.1` (backend Bouncy Castle). Binding-ul **C** este o bibliotecă statică + header pe care le compilezi din [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Semnare deterministă (critică pentru consens) {#deterministic-signing}

Începând cu versiunea **0.1.1**, `sign()` produce varianta ML-DSA **deterministă** (FIPS-204 §3.4, în care randomness-ul de semnare este format din 32 de octeți zero) în **toate cele șase binding-uri** — și aceasta este singura variantă pe care lanțul o acceptă. Verificatorul de tranzacții al QoreChain **respinge semnăturile ML-DSA hedged (randomizate)**, așa că o semnătură hedged eșuează on-chain chiar dacă se verifică din punct de vedere criptografic.

Fapte esențiale:

* **Nu schimba valoarea implicită.** Semnarea deterministă este critică pentru consens; fiecare binding o documentează ca atare.
* Ieșirea deterministă este **identică la nivel de octeți în toate cele șase binding-uri** pentru aceeași cheie și același mesaj — garantată prin vectori de test partajați între limbaje.
* Semnarea hedged rămâne disponibilă ca **opt-in explicit** per binding (de ex. `{hedged: true}` în JavaScript, `sign_hedged` în Rust, `mldsaSignHedged` în Java, `sign(..., hedged=True)` în Python) pentru cazuri de utilizare din afara lanțului — semnăturile hedged **nu sunt acceptate de lanț**.
* Versiunea 0.1.0 a binding-ului JavaScript semna hedged în mod implicit — dacă ai construit instrumente de tranzacții pe 0.1.0, **actualizează la 0.1.1**; tranzacțiile semnate cu vechea valoare implicită sunt respinse on-chain.

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

Sunt disponibile exporturi specifice fiecărui nivel, acolo unde valoarea implicită nu este ceea ce îți dorești: `mldsa44/65/87` și `mlkem512/768/1024` (`mldsa` / `mlkem` sunt valorile implicite L5).

Binding-urile **Rust, Go, C, Python și Java** reflectă exact acest model. De exemplu:

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

## Helperi blockchain

Dincolo de primitivele brute, biblioteca expune doi helperi de care integratorii au nevoie pentru a interacționa cu conturile și tranzacțiile QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper de înregistrare **pay-to-pubkey-hash**. Produce un hash SHAKE-256 scurt (20–32 de octeți) al unei chei publice. Modelul: stochează doar `pubkeyHash` în starea contului și cere cheia publică integrală în tranzacție. Starea contului rămâne minusculă indiferent de cheia de 1–2,5 KB.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

Framing-ul QoreChain compatibil cu portofelele pentru **sign-bytes cu extensie hibridă**. Acesta produce exact octeții care trebuie semnați cu ML-DSA-87 (Dilithium-5) pentru a forma jumătatea PQC a unei tranzacții hibride.

Aceasta este piesa pe care portofelele și integratorii o folosesc pentru a produce **semnătura hibridă obligatorie** pe calea de tranzacții cosmos. Începând cu versiunea curentă a lanțului, semnăturile hibride sunt **obligatorii în mod implicit** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): fiecare tranzacție pe calea cosmos trebuie să poarte o semnătură Dilithium-5 alături de semnătura sa clasică secp256k1. Vezi [Securitate post-cuantică](/architecture/post-quantum-security) pentru modelul de aplicare.

Semnătura clasică secp256k1 este calculată peste sign bytes standard (care **exclud** extensia PQC), iar semnătura ML-DSA-87 este calculată și atașată ca extensia `PQCHybridSignature`. Deoarece sign bytes clasici exclud extensia, semnătura clasică rămâne validă indiferent dacă un verificator înțelege sau nu partea PQC.

Există trei moduri de a produce această semnătură hibridă:

* **CLI-ul** — `qorechaind tx pqc cosign` atașează cosemnătura Dilithium-5 la o tranzacție (după `qorechaind tx pqc gen-key`). Vezi [Comenzi de tranzacții](/cli-reference/transaction-commands).
* **SDK-ul QoreChain** — `buildHybridTx` (cu `includePqcPublicKey`) face echivalentul în TypeScript/Python/Go/Rust. Vezi [Conturi SDK și semnare PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direct** — folosește `hybridSignBytes` pentru a construi sign bytes și `mldsa.sign` pentru a produce semnătura Dilithium-5, atunci când construiești instrumente în afara SDK-ului într-unul dintre cele șase limbaje suportate.

## Optimizarea amprentei on-chain

Cheile și semnăturile ML-DSA sunt mari după standardele clasice. Deoarece octeții unui standard sunt ficși, modul de a păstra amprenta on-chain mică este să folosești aceste trei pârghii — niciuna dintre ele nu modifică standardul:

1. **Alege nivelul de securitate în mod deliberat.** Semnăturile ML-DSA-65 (L3) sunt cu ~28% mai mici decât ML-DSA-87 (L5) și rămân foarte puternice; ciphertext-urile ML-KEM-768 sunt mai mici decât cele 1024. Alege în funcție de cazul de utilizare.
2. **Pay-to-pubkey-hash.** Stochează doar `pubkeyHash(pk)` (20–32 de octeți de SHAKE-256) în starea contului și cere cheia publică integrală în tranzacție. Starea contului rămâne minusculă indiferent de dimensiunea cheii.
3. **Verifică-și-elimină semnăturile.** O semnătură trebuie să existe în tranzacție (datele blocului), dar nu ar trebui niciodată scrisă în arborele de stare persistent.

> **De ce nu Falcon?** FN-DSA (Falcon) ar oferi semnături mai mici, dar este **exclus** în mod intenționat: FN-DSA este FIPS-206 *draft* (nu final), iar o bibliotecă exclusiv pe bază de standarde livrează doar standarde finalizate. Poate fi reconsiderat odată ce FIPS-206 este finalizat.

## Resurse conexe

* [Securitate post-cuantică](/architecture/post-quantum-security) — cum folosește lanțul aceste primitive și cum impune semnăturile hibride.
* [Comenzi de tranzacții](/cli-reference/transaction-commands) — fluxul CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Conturi SDK și semnare PQC](/sdk/concepts/accounts-pqc) — chei și semnare hibridă din SDK-ul QoreChain.
* [Configurarea portofelului](/getting-started/wallet-setup) — creează și gestionează conturi susținute de PQC.
