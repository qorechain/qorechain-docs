---
slug: /developer-guide/post-quantum-signing
title: Firma post-quantistica
sidebar_label: Firma post-quantistica
sidebar_position: 8
---

# Firma post-quantistica

`qorechain-pqc` è la libreria di crittografia post-quantistica open source, **basata esclusivamente su standard**, che sta dietro a QoreChain. Fornisce a wallet, integratori e strumenti esattamente le primitive usate dalla chain — in sei linguaggi, con un'unica API coerente, **dimostrata byte-compatibile** rispetto a una suite condivisa di vettori di test cross-linguaggio.

La libreria incapsula implementazioni sottoposte ad audit degli **standard NIST finali**. **Non** inventa uno schema personalizzato: una variante non standard è proprio ciò che rompe l'interoperabilità (una firma prodotta in un punto non verrebbe verificata in un altro). Ogni binding è validato rispetto agli stessi vettori, così una firma ML-DSA prodotta in un linguaggio si verifica in tutti gli altri, i segreti condivisi ML-KEM corrispondono in tutti e sei, e i digest SHAKE-256 sono identici.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licenza:** Apache-2.0

## Primitive

| Primitiva | Standard | Ruolo | Livelli (predefinito in **grassetto**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | firme digitali | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | incapsulamento di chiavi | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash a output estendibile | — |

Queste sono le stesse primitive che QoreChain esegue a livello di protocollo: firme **ML-DSA-87 (Dilithium-5)**, incapsulamento di chiavi **ML-KEM-1024** e **SHAKE-256** come hash applicativo predefinito. Vedi [Post-Quantum Security](/architecture/post-quantum-security) per come la chain le utilizza.

### Dimensioni (byte)

Scegli il livello di sicurezza in base al tuo budget di dimensione/sicurezza.

| Schema | Sicurezza | Chiave pubblica | Firma / Ciphertext |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> Non puoi rendere uno standard NIST più piccolo e mantenerlo standard. ML-DSA-87 ha dimensioni fisse di chiave/firma e byte fissi — "ottimizzarlo" produce una variante non standard che nessun'altra implementazione può verificare. Per ridurre l'impronta on-chain, usa le leve descritte sotto invece di alterare lo schema.

## Linguaggi e pacchetti

Ogni linguaggio espone la stessa API, ciascuno supportato da un'implementazione diversa sottoposta ad audit. Questo è ciò che garantisce la byte-compatibilità — backend indipendenti concordano sullo standard.

| Linguaggio | Pacchetto | Installazione | Supportato da |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (libreria statica + header) | compila dal [repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilità
I binding JavaScript, Rust, Python, Go e Java sono tutti **pubblicati** alla versione **0.1.0** — installali direttamente da npm, crates.io, PyPI, il proxy dei moduli Go e Maven Central con i comandi qui sopra. La distribuzione Python si installa come `qorechain-pqc` ma **si importa come `qorpqc`**. Il pacchetto **Java** è su Maven Central come `io.github.qorechain:qorechain-pqc:0.1.0` (backend Bouncy Castle). Il binding **C** è una libreria statica + header che compili da [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## API coerente

Ogni linguaggio fornisce la stessa interfaccia:

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Avvio rapido (JavaScript / TypeScript)

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

Gli export specifici per livello sono disponibili quando il predefinito non è quello che desideri: `mldsa44/65/87` e `mlkem512/768/1024` (`mldsa` / `mlkem` sono i predefiniti L5).

I binding **Rust, Go, C, Python e Java** rispecchiano esattamente questo. Per esempio:

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

## Helper per blockchain

Oltre alle primitive grezze, la libreria espone due helper di cui gli integratori hanno bisogno per interagire con gli account e le transazioni QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper di registrazione **pay-to-pubkey-hash**. Produce un hash SHAKE-256 breve (20–32 byte) di una chiave pubblica. Il pattern: memorizzare solo il `pubkeyHash` nello stato dell'account e richiedere la chiave pubblica completa nella transazione. Lo stato dell'account rimane minuscolo indipendentemente dalla chiave da 1–2,5 KB.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

L'**inquadramento dei sign-bytes con estensione ibrida** compatibile con i wallet di QoreChain. Produce esattamente i byte che devono essere firmati con ML-DSA-87 (Dilithium-5) per formare la metà PQC di una transazione ibrida.

Questo è il pezzo che wallet e integratori usano per produrre la **firma ibrida richiesta** sul percorso di transazione cosmos. A partire dalla versione corrente della chain, le firme ibride sono **richieste per impostazione predefinita** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): ogni transazione sul percorso cosmos deve portare una firma Dilithium-5 insieme alla sua firma classica secp256k1. Vedi [Post-Quantum Security](/architecture/post-quantum-security) per il modello di enforcement.

La firma classica secp256k1 è calcolata sui sign bytes standard (che **escludono** l'estensione PQC), mentre la firma ML-DSA-87 è calcolata e allegata come estensione `PQCHybridSignature`. Poiché i sign bytes classici escludono l'estensione, la firma classica rimane valida indipendentemente dal fatto che un verificatore comprenda o meno la parte PQC.

Ci sono tre modi per produrre questa firma ibrida:

* **La CLI** — `qorechaind tx pqc cosign` allega la cofirma Dilithium-5 a una transazione (dopo `qorechaind tx pqc gen-key`). Vedi [Transaction Commands](/cli-reference/transaction-commands).
* **L'SDK QoreChain** — `buildHybridTx` (con `includePqcPublicKey`) fa l'equivalente in TypeScript/Python/Go/Rust. Vedi [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direttamente** — usa `hybridSignBytes` per inquadrare i sign bytes e `mldsa.sign` per produrre la firma Dilithium-5, quando costruisci strumenti al di fuori dell'SDK in uno dei sei linguaggi supportati.

## Ottimizzare l'impronta on-chain

Le chiavi e le firme ML-DSA sono grandi rispetto agli standard classici. Poiché i byte di uno standard sono fissi, il modo per mantenere piccola l'impronta on-chain è usare queste tre leve — nessuna delle quali altera lo standard:

1. **Scegli deliberatamente il livello di sicurezza.** Le firme ML-DSA-65 (L3) sono ~28% più piccole di ML-DSA-87 (L5) e rimangono molto robuste; i ciphertext ML-KEM-768 sono più piccoli di quelli a 1024. Scegli in base al caso d'uso.
2. **Pay-to-pubkey-hash.** Memorizza solo `pubkeyHash(pk)` (20–32 byte di SHAKE-256) nello stato dell'account e richiedi la chiave pubblica completa nella transazione. Lo stato dell'account rimane minuscolo indipendentemente dalla dimensione della chiave.
3. **Verifica-e-scarta le firme.** Una firma deve risiedere nella transazione (dati del blocco) ma non dovrebbe mai essere scritta nell'albero di stato persistente.

> **Perché niente Falcon?** FN-DSA (Falcon) darebbe firme più piccole, ma è intenzionalmente **escluso**: FN-DSA è una *bozza* FIPS-206 (non finale), e una libreria basata solo su standard distribuisce esclusivamente standard finalizzati. Potrà essere rivalutato una volta che FIPS-206 sarà finalizzato.

## Correlati

* [Post-Quantum Security](/architecture/post-quantum-security) — come la chain usa queste primitive e applica le firme ibride.
* [Transaction Commands](/cli-reference/transaction-commands) — il flusso CLI `tx pqc gen-key` / `tx pqc cosign`.
* [SDK Accounts & PQC signing](/sdk/concepts/accounts-pqc) — chiavi e firma ibrida dall'SDK QoreChain.
* [Wallet Setup](/getting-started/wallet-setup) — crea e gestisci account basati su PQC.
