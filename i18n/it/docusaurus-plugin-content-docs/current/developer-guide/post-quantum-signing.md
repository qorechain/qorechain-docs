---
slug: /developer-guide/post-quantum-signing
title: Firma Post-Quantistica
sidebar_label: Firma Post-Quantistica
sidebar_position: 8
---

# Firma Post-Quantistica

`qorechain-pqc` è la libreria di crittografia post-quantistica open source, **basata esclusivamente su standard**, alla base di QoreChain. Fornisce a wallet, integratori e strumenti esattamente le stesse primitive utilizzate dalla chain — in sei linguaggi, con un'unica API coerente, **con compatibilità a livello di byte dimostrata** rispetto a una suite condivisa di vettori di test cross-language.

La libreria incapsula implementazioni sottoposte ad audit degli **standard NIST definitivi**. **Non** inventa uno schema personalizzato: una variante non standard è esattamente ciò che compromette l'interoperabilità (una firma prodotta in un punto non verrebbe verificata in un altro). Ogni binding è validato rispetto agli stessi vettori, quindi una firma ML-DSA prodotta in un linguaggio viene verificata in tutti gli altri, i segreti condivisi ML-KEM coincidono in tutti e sei i linguaggi e i digest SHAKE-256 sono identici.

* **Repository:** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licenza:** Apache-2.0

## Primitive

| Primitiva | Standard | Ruolo | Livelli (default in **grassetto**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | firme digitali | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | incapsulamento di chiavi | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hash a output estendibile | — |

Sono le stesse primitive che QoreChain esegue a livello di protocollo: firme **ML-DSA-87 (Dilithium-5)**, incapsulamento di chiavi **ML-KEM-1024** e **SHAKE-256** come hash applicativo predefinito. Consulta [Sicurezza Post-Quantistica](/architecture/post-quantum-security) per come la chain le utilizza.

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

> Non è possibile rendere uno standard NIST più piccolo e rimanere comunque standard. ML-DSA-87 ha dimensioni fisse di chiave/firma e byte fissi — "ottimizzarlo" produce una variante non standard che nessun'altra implementazione può verificare. Per ridurre l'ingombro on-chain, usa le leve descritte più avanti anziché alterare lo schema.

## Linguaggi e pacchetti

Ogni linguaggio espone la stessa API, ciascuno supportato da un'implementazione diversa sottoposta ad audit. È questo che garantisce la compatibilità a livello di byte — backend indipendenti concordano sullo standard.

| Linguaggio | Pacchetto | Installazione | Basato su |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (libreria statica + header) | compila dal [repo](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilità
I binding JavaScript, Rust, Python, Go e Java sono tutti **pubblicati** alla versione **0.1.1** — installali direttamente da npm, crates.io, PyPI, dal proxy dei moduli Go e da Maven Central con i comandi riportati sopra. La distribuzione Python si installa come `qorechain-pqc` ma **si importa come `qorpqc`**. Il pacchetto **Java** è su Maven Central come `io.github.qorechain:qorechain-pqc:0.1.1` (backend Bouncy Castle). Il binding **C** è una libreria statica + header che compili da [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Firma deterministica (critica per il consenso) {#deterministic-signing}

A partire dalla versione **0.1.1**, `sign()` produce la variante ML-DSA **deterministica** (FIPS-204 §3.4, in cui la casualità di firma è costituita da 32 byte a zero) in **tutti e sei i binding** — ed è l'unica variante accettata dalla chain. Il verificatore di transazioni di QoreChain **rifiuta le firme ML-DSA hedged (randomizzate)**, quindi una firma hedged fallisce on-chain anche se è crittograficamente verificabile.

Punti chiave:

* **Non modificare il default.** La firma deterministica è critica per il consenso; ogni binding la documenta come tale.
* L'output deterministico è **identico byte per byte in tutti e sei i binding** a parità di chiave e messaggio — vincolo garantito dai vettori di test cross-language condivisi.
* La firma hedged resta disponibile come **opt-in esplicito** per ciascun binding (ad es. `{hedged: true}` in JavaScript, `sign_hedged` in Rust, `mldsaSignHedged` in Java, `sign(..., hedged=True)` in Python) per casi d'uso non legati alla chain — le firme hedged **non sono accettate dalla chain**.
* La versione 0.1.0 del binding JavaScript firmava in modalità hedged per impostazione predefinita — se hai costruito strumenti di transazione basandoti sulla 0.1.0, **aggiorna alla 0.1.1**; le transazioni firmate con il vecchio default vengono rifiutate on-chain.

## API coerente

Ogni linguaggio fornisce la stessa superficie:

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

Sono disponibili export specifici per livello quando il default non è quello che ti serve: `mldsa44/65/87` e `mlkem512/768/1024` (`mldsa` / `mlkem` sono i default L5).

I binding **Rust, Go, C, Python e Java** rispecchiano esattamente questa struttura. Ad esempio:

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

## Helper per la blockchain

Oltre alle primitive di base, la libreria espone due helper di cui gli integratori hanno bisogno per interagire con gli account e le transazioni di QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper di registrazione **pay-to-pubkey-hash**. Produce un hash SHAKE-256 breve (20–32 byte) di una chiave pubblica. Il pattern: memorizza solo il `pubkeyHash` nello stato dell'account e richiedi la chiave pubblica completa nella transazione. Lo stato dell'account rimane minuscolo indipendentemente dalla chiave da 1–2,5 KB.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

Il framing dei sign-bytes con **estensione ibrida** di QoreChain, compatibile con i wallet. Produce esattamente i byte che devono essere firmati con ML-DSA-87 (Dilithium-5) per costituire la metà PQC di una transazione ibrida.

Questo è il componente che wallet e integratori usano per produrre la **firma ibrida obbligatoria** sul percorso di transazione cosmos. A partire dalla versione corrente della chain, le firme ibride sono **obbligatorie per impostazione predefinita** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`): ogni transazione sul percorso cosmos deve includere una firma Dilithium-5 accanto alla sua firma classica secp256k1. Consulta [Sicurezza Post-Quantistica](/architecture/post-quantum-security) per il modello di enforcement.

La firma classica secp256k1 è calcolata sui sign bytes standard (che **escludono** l'estensione PQC), mentre la firma ML-DSA-87 è calcolata e allegata come estensione `PQCHybridSignature`. Poiché i sign bytes classici escludono l'estensione, la firma classica resta valida indipendentemente dal fatto che un verificatore comprenda o meno la parte PQC.

Ci sono tre modi per produrre questa firma ibrida:

* **La CLI** — `qorechaind tx pqc cosign` allega la cofirma Dilithium-5 a una transazione (dopo `qorechaind tx pqc gen-key`). Consulta [Comandi di Transazione](/cli-reference/transaction-commands).
* **L'SDK QoreChain** — `buildHybridTx` (con `includePqcPublicKey`) fa l'equivalente in TypeScript/Python/Go/Rust. Consulta [SDK Account e firma PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` direttamente** — usa `hybridSignBytes` per costruire i sign bytes e `mldsa.sign` per produrre la firma Dilithium-5, quando stai costruendo strumenti al di fuori dell'SDK in uno dei sei linguaggi supportati.

## Ottimizzare l'ingombro on-chain

Le chiavi e le firme ML-DSA sono grandi rispetto agli standard classici. Poiché i byte di uno standard sono fissi, il modo per mantenere piccolo l'ingombro on-chain è usare queste tre leve — nessuna delle quali altera lo standard:

1. **Scegli il livello di sicurezza in modo deliberato.** Le firme ML-DSA-65 (L3) sono circa il 28% più piccole di ML-DSA-87 (L5) e restano molto robuste; i ciphertext ML-KEM-768 sono più piccoli di quelli 1024. Scegli in base al caso d'uso.
2. **Pay-to-pubkey-hash.** Memorizza solo `pubkeyHash(pk)` (20–32 byte di SHAKE-256) nello stato dell'account e richiedi la chiave pubblica completa nella transazione. Lo stato dell'account resta minuscolo indipendentemente dalla dimensione della chiave.
3. **Verifica e scarta le firme.** Una firma deve risiedere nella transazione (dati del blocco) ma non dovrebbe mai essere scritta nell'albero di stato persistente.

> **Perché niente Falcon?** FN-DSA (Falcon) offrirebbe firme più piccole, ma è intenzionalmente **escluso**: FN-DSA è FIPS-206 in *bozza* (non definitivo), e una libreria basata esclusivamente su standard distribuisce solo standard finalizzati. Potrà essere riconsiderato una volta che FIPS-206 sarà finalizzato.

## Correlati

* [Sicurezza Post-Quantistica](/architecture/post-quantum-security) — come la chain usa queste primitive e applica le firme ibride.
* [Comandi di Transazione](/cli-reference/transaction-commands) — il flusso CLI `tx pqc gen-key` / `tx pqc cosign`.
* [SDK Account e firma PQC](/sdk/concepts/accounts-pqc) — chiavi e firma ibrida dall'SDK QoreChain.
* [Configurazione del Wallet](/getting-started/wallet-setup) — crea e gestisci account con supporto PQC.
