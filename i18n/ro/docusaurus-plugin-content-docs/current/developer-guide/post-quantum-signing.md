---
slug: /developer-guide/post-quantum-signing
title: Semnare post-cuantică
sidebar_label: Semnare post-cuantică
sidebar_position: 8
---

# Semnare post-cuantică

`qorechain-pqc` este biblioteca de criptografie post-cuantică **doar pe bază de standarde**, open-source, din spatele QoreChain. Le oferă portofelelor, integratorilor și instrumentelor exact primitivele pe care le folosește lanțul — în șase limbaje, cu un singur API consecvent, **dovedit a fi compatibil la nivel de octet** față de o suită comună de vectori de test inter-lingvistici.

Biblioteca încapsulează implementări auditate ale **standardelor NIST finale**. Ea **nu** inventează o schemă personalizată: o variantă non-standard este exact ceea ce distruge interoperabilitatea (o semnătură produsă într-un loc nu s-ar verifica în altul). Fiecare legătură (binding) este validată față de aceiași vectori, astfel încât o semnătură ML-DSA produsă într-un limbaj se verifică în oricare altul, secretele partajate ML-KEM se potrivesc în toate cele șase, iar digesturile SHAKE-256 sunt identice.

* **Depozit:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licență:** Apache-2.0

## Primitive

| Primitivă | Standard | Rol | Niveluri (implicit cu **aldine**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | semnături digitale | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | încapsulare de chei | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash cu ieșire extensibilă | — |

Acestea sunt aceleași primitive pe care QoreChain le rulează la nivel de protocol: semnături **ML-DSA-87 (Dilithium-5)**, încapsulare de chei **ML-KEM-1024** și **SHAKE-256** ca hash implicit al aplicației. Vedeți [Securitate post-cuantică](/architecture/post-quantum-security) pentru modul în care lanțul le folosește.

### Dimensiuni (octeți)

Alegeți nivelul de securitate în funcție de bugetul dvs. de dimensiune/securitate.

| Schemă | Securitate | Cheie publică | Semnătură / Text cifrat |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> Nu puteți micșora un standard NIST și să rămână în continuare standard. ML-DSA-87 are dimensiuni fixe de cheie/semnătură și octeți ficși — „optimizarea" lui produce o variantă non-standard pe care nicio altă implementare nu o poate verifica. Pentru a reduce amprenta on-chain, folosiți pârghiile de mai jos în loc să modificați schema.

## Limbaje și pachete

Fiecare limbaj expune același API, fiecare susținut de o implementare auditată diferită. Acesta este lucrul care garantează compatibilitatea la nivel de octet — backend-uri independente sunt de acord asupra standardului.

| Limbaj | Pachet | Instalare | Susținut de |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (bibliotecă statică + antet) | construire din [depozit](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilitate
Legăturile JavaScript, Rust, Python, Go și Java sunt toate **publicate** la versiunea **0.1.0** — instalați-le direct din npm, crates.io, PyPI, proxy-ul modulelor Go și Maven Central cu comenzile de mai sus. Distribuția Python se instalează ca `qorechain-pqc`, dar **se importă ca `qorpqc`**. Pachetul **Java** este pe Maven Central ca `io.github.qorechain:qorechain-pqc:0.1.0` (backend Bouncy Castle). Legătura **C** este o bibliotecă statică + antet pe care le construiți din [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

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

### Start rapid (JavaScript / TypeScript)

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

Exporturile specifice nivelului sunt disponibile atunci când implicitul nu este ceea ce doriți: `mldsa44/65/87` și `mlkem512/768/1024` (`mldsa` / `mlkem` sunt valorile implicite L5).

Legăturile **Rust, Go, C, Python și Java** reflectă acest lucru exact. De exemplu:

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

## Asistenți pentru blockchain

Dincolo de primitivele brute, biblioteca expune doi asistenți de care integratorii au nevoie pentru a interacționa cu conturile și tranzacțiile QoreChain.

### `pubkeyHash(pk, len=20)`

Un asistent de înregistrare **pay-to-pubkey-hash**. Produce un hash SHAKE-256 scurt (20–32 octeți) al unei chei publice. Modelul: stocați doar `pubkeyHash` în starea contului și cereți cheia publică completă în tranzacție. Starea contului rămâne minusculă indiferent de cheia de 1–2.5 KB.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

**Încadrarea de octeți pentru semnare cu extensie hibridă** compatibilă cu portofelele QoreChain. Aceasta produce exact octeții care trebuie semnați cu ML-DSA-87 (Dilithium-5) pentru a forma jumătatea PQC a unei tranzacții hibride.

Aceasta este piesa pe care portofelele și integratorii o folosesc pentru a produce **semnătura hibridă necesară** pe calea de tranzacție cosmos. Începând cu versiunea curentă a lanțului, semnăturile hibride sunt **necesare în mod implicit** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): fiecare tranzacție pe calea cosmos trebuie să poarte o semnătură Dilithium-5 alături de semnătura sa clasică secp256k1. Vedeți [Securitate post-cuantică](/architecture/post-quantum-security) pentru modelul de aplicare.

Semnătura clasică secp256k1 este calculată asupra octeților de semnare standard (care **exclud** extensia PQC), iar semnătura ML-DSA-87 este calculată și atașată ca extensia `PQCHybridSignature`. Deoarece octeții de semnare clasici exclud extensia, semnătura clasică rămâne validă indiferent dacă un verificator înțelege sau nu partea PQC.

Există trei moduri de a produce această semnătură hibridă:

* **CLI** — `qorechaind tx pqc cosign` atașează cosemnătura Dilithium-5 la o tranzacție (după `qorechaind tx pqc gen-key`). Vedeți [Comenzi pentru tranzacții](/cli-reference/transaction-commands).
* **QoreChain SDK** — `buildHybridTx` (cu `includePqcPublicKey`) face echivalentul în TypeScript/Python/Go/Rust. Vedeți [Conturi SDK și semnare PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direct** — folosiți `hybridSignBytes` pentru a încadra octeții de semnare și `mldsa.sign` pentru a produce semnătura Dilithium-5, atunci când construiți instrumente în afara SDK-ului în unul dintre cele șase limbaje acceptate.

## Optimizarea amprentei on-chain

Cheile și semnăturile ML-DSA sunt mari după standardele clasice. Deoarece octeții unui standard sunt ficși, modalitatea de a menține mică amprenta on-chain este să folosiți aceste trei pârghii — niciuna dintre ele nu modifică standardul:

1. **Alegeți nivelul de securitate în mod deliberat.** Semnăturile ML-DSA-65 (L3) sunt cu ~28% mai mici decât ML-DSA-87 (L5) și rămân foarte puternice; textele cifrate ML-KEM-768 sunt mai mici decât 1024. Alegeți per caz de utilizare.
2. **Pay-to-pubkey-hash.** Stocați doar `pubkeyHash(pk)` (20–32 octeți de SHAKE-256) în starea contului și cereți cheia publică completă în tranzacție. Starea contului rămâne minusculă indiferent de dimensiunea cheii.
3. **Verifică-și-elimină semnăturile.** O semnătură trebuie să existe în tranzacție (datele blocului), dar nu ar trebui niciodată scrisă în arborele de stare persistent.

> **De ce niciun Falcon?** FN-DSA (Falcon) ar oferi semnături mai mici, dar este exclus intenționat: FN-DSA este FIPS-206 *draft* (nu final), iar o bibliotecă doar pe bază de standarde livrează numai standarde finalizate. Poate fi reevaluat odată ce FIPS-206 este finalizat.

## Înrudite

* [Securitate post-cuantică](/architecture/post-quantum-security) — cum folosește lanțul aceste primitive și aplică semnăturile hibride.
* [Comenzi pentru tranzacții](/cli-reference/transaction-commands) — fluxul CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Conturi SDK și semnare PQC](/sdk/concepts/accounts-pqc) — chei și semnare hibridă din QoreChain SDK.
* [Configurarea portofelului](/getting-started/wallet-setup) — creați și gestionați conturi susținute de PQC.
