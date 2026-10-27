---
slug: /developer-tools/pqc-library
title: Libreria post-quantistica (qorechain-pqc)
sidebar_label: Libreria PQC
sidebar_position: 20
---

# Libreria post-quantistica (`qorechain-pqc`)

`qorechain-pqc` è la libreria di crittografia post-quantistica basata solo sugli standard su cui sono costruiti gli strumenti di QoreChain. È pensata per chi sviluppa wallet, backend, exchange e strumenti e ha bisogno di creare o verificare le chiavi e le firme esatte usate dalla chain, senza dipendere dall'intero [SDK QoreChain](/sdk/overview). Racchiude implementazioni indipendenti di tre standard NIST (ML-DSA, FIPS 204, per le firme; ML-KEM, FIPS 203, per l'incapsulamento delle chiavi; SHAKE-256, FIPS 202, come hash) dietro un'unica API in TypeScript/JavaScript, Python, Rust, Go, Java e C, e aggiunge gli helper che costruiscono i byte firmati da una transazione ibrida QoreChain. Versione **0.2.3**, Apache-2.0, verificata sui registry il 27 ottobre 2026.

È una libreria di primitive. Non comunica con la rete, non custodisce chiavi, non registra chiavi on-chain e non invia transazioni. Per le regole della chain su firme ibride e registrazione delle chiavi leggi [Firma Post-Quantistica](/developer-guide/post-quantum-signing) e [Sicurezza Post-Quantistica](/architecture/post-quantum-security); per un client di firma già pronto usa l'[SDK](/sdk/overview) o [QoreSign](/qoresign/overview), entrambi costruiti su queste primitive.

## Innovazioni {#innovations}

* **Un unico set di vettori di test, sei backend indipendenti.** Il binding JavaScript usa `@noble/post-quantum`, Rust usa i crate `fips204`, `fips203` e `sha3`, Go usa Cloudflare CIRCL, Java usa Bouncy Castle, e Python e C usano liboqs. La suite di test di ogni binding deve riprodurre byte per byte gli stessi file della cartella `vectors/` del repository (ML-DSA a tre livelli, ML-KEM a tre livelli, SHAKE-256), quindi una firma creata in un linguaggio viene verificata negli altri.
* **Firma deterministica per impostazione predefinita.** `sign` usa la variante deterministica di FIPS 204 (casualità di firma di 32 byte a zero), quindi la stessa chiave e lo stesso messaggio producono una firma identica byte per byte in ogni binding. Questo rende le firme, e gli hash di transazione che le contengono, riproducibili e verificabili rispetto ai vettori.
* **Firma hedged come scelta esplicita e interoperabile.** La firma randomizzata (hedged) è disponibile come `{hedged: true}` in JavaScript, `hedged=True` in Python, `sign_hedged` in Rust, `SignHedged` in Go (aggiunta nella 0.2.3), `mldsaSignHedged` in Java e `qpqc_mldsa_sign_hedged` in C. Una firma hedged creata in uno qualsiasi dei sei linguaggi viene verificata in tutti e sei (36 combinazioni su 36 verificate per la 0.2.3). La chain verifica qualsiasi firma ML-DSA-87 FIPS 204 valida, quindi accetta entrambi i tipi; i due non si distinguono senza la chiave segreta.
* **I sign-bytes ibridi della chain, costruiti come li costruisce la chain.** Ogni binding ha `hybridSignBytesV1`, `hybridSignBytesV2` e un dispatcher `hybridSignBytes(version, chainId, body, authInfo)` che richiede la versione. La forma v2 è `"qorechain-pqc-hybrid-v2"`, poi il chain id con una lunghezza big-endian a 64 bit, poi il corpo della transazione (senza l'estensione PQC) e l'auth info, ciascuno con una lunghezza big-endian a 32 bit. Tutti i binding sono testati rispetto al file known-answer della chain (`vectors/signbytes-kat-v3.1.98.json`). Un chain id vuoto viene rifiutato sui punti d'ingresso con controllo, perché byte legati a nessuna chain non vengono verificati su nessuna rete.
* **La versione dei sign-bytes della rete decisa da una funzione pura.** Una rete verifica una sola forma alla volta, e il passaggio a v2 è stato applicato con due nomi di piano (`v3.2.0` sulla mainnet all'altezza 2.981.742, `v3.1.98` sulla testnet). `SIGN_BYTES_V2_UPGRADES` elenca entrambi i nomi e `signBytesVersionForApplied(chainId, appliedHeights)` restituisce `v1` o `v2` a partire dalle altezze applicate che leggi dal nodo. Chiedere di un solo nome fraintenderebbe una rete passata con l'altro.
* **Controllo rigoroso degli input.** `verify` non lancia mai eccezioni: una chiave o una firma di lunghezza errata, o qualsiasi altro input malformato, restituisce `false`. `keygen(seed)`, `sign`, `encapsulate` e `decapsulate` lanciano un errore che indica l'argomento errato e la sua lunghezza attesa.
* **JavaScript puro, nessun codice nativo.** Il pacchetto npm funziona in Node e nei browser senza WebAssembly né add-on. Su un laptop Apple silicon, nella misurazione del repository stesso (0.2.3, messaggio da 1,5 KB, un core), ML-DSA-87 firma in circa 8 ms in JavaScript e in circa 0,3-0,45 ms negli altri cinque binding.

## Come usarla {#how-to-use}

Tutti e cinque i pacchetti dei registry espongono le stesse operazioni: `keygen`, `keygenFromSeed` (seed da 32 byte), `sign`, `verify`; ML-KEM `keygen`, `encapsulate`, `decapsulate`; `shake256`; `pubkeyHash`; e gli helper dei sign-bytes. ML-DSA-87 e ML-KEM-1024 sono i valori predefiniti, e le varianti per livello (44, 65, 87 e 512, 768, 1024) sono esportate accanto a essi. ML-DSA-87 ha una chiave pubblica di 2.592 byte e una firma di 4.627 byte, che gli esempi qui sotto stampano.

### Installazione e import {#install}

| Linguaggio | Installazione | Import |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 o successivo) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | compila `c/` dal repository (libreria statica e header) | `qorechain_pqc.h` |

### Firmare e verificare, in ogni linguaggio {#examples}

Questi sono i quickstart dell'hub per sviluppatori. Ognuno è stato eseguito senza modifiche il 27 ottobre 2026 dopo l'installazione dal registry pubblico (Node 26, Python 3.12 con liboqs presente, Rust 1.95, Go 1.26, JDK 21 con Gradle 9.6) e ha stampato la dimensione della chiave pubblica, la dimensione della firma e il risultato della verifica: `2592 4627 true` (Python stampa `True`). Nessuno usa la rete o una chiave con fondi, e il binding C non ha un quickstart.

TypeScript:

```ts
import { mldsa } from "@qorechain/pqc";

// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
const seed = new Uint8Array(32).fill(7);
const { publicKey, secretKey } = mldsa.keygen(seed);

const message = new TextEncoder().encode("hello QoreChain");
const signature = mldsa.sign(secretKey, message); // deterministic by default
const ok = mldsa.verify(publicKey, message, signature);
console.log(publicKey.length, signature.length, ok);
```

Python:

```python
from qorpqc import mldsa

# ML-DSA-87 key pair. The Python binding generates keys from the system RNG
# (it does not take a seed); signing is deterministic by default.
public_key, secret_key = mldsa.keygen()

message = b"hello QoreChain"
signature = mldsa.sign(secret_key, message)
ok = mldsa.verify(public_key, message, signature)
print(len(public_key), len(signature), ok)
```

Rust:

```rust
use qorechain_pqc::mldsa;

fn main() {
    // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
    let seed = [7u8; 32];
    let (pk, sk) = mldsa::default::keygen_from_seed(&seed);

    let message = b"hello QoreChain";
    let sig = mldsa::default::sign(&sk, message).expect("sign"); // deterministic
    let ok = mldsa::default::verify(&pk, message, &sig);
    println!("{} {} {}", pk.len(), sig.len(), ok);
}
```

Go:

```go
package main

import (
	"bytes"
	"fmt"

	pqc "github.com/qorechain/qorechain-pqc/go"
)

func main() {
	// ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
	pk, sk, _ := pqc.MLDSA.KeygenFromSeed(bytes.Repeat([]byte{7}, 32))

	message := []byte("hello QoreChain")
	sig, _ := pqc.MLDSA.Sign(sk, message) // deterministic
	fmt.Println(len(pk), len(sig), pqc.MLDSA.Verify(pk, message, sig))
}
```

Java (salva come `PqcQuickstart.java`):

```java
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import network.qorechain.pqc.Pqc;

public class PqcQuickstart {
    public static void main(String[] args) {
        // ML-DSA-87 key pair from a fixed 32-byte seed (example only; use a random seed in practice).
        // In the Java binding the secret key IS the 32-byte seed.
        byte[] seed = new byte[32];
        Arrays.fill(seed, (byte) 7);
        byte[][] kp = Pqc.mldsaKeygenFromSeed("ml-dsa-87", seed); // {publicKey, secretKey}

        byte[] message = "hello QoreChain".getBytes(StandardCharsets.UTF_8);
        byte[] sig = Pqc.mldsaSign("ml-dsa-87", kp[1], message); // deterministic
        boolean ok = Pqc.mldsaVerify("ml-dsa-87", kp[0], message, sig);
        System.out.println(kp[0].length + " " + sig.length + " " + ok);
    }
}
```

Il seed fisso (32 byte, ciascuno di valore 7) è solo un esempio. Per una chiave reale usa un seed casuale o la derivazione della chiave descritta in [Firma Post-Quantistica](/developer-guide/post-quantum-signing#key-derivation).

### Firma hedged {#hedged}

La firma deterministica è ciò che fa `sign`. Per scegliere la firma randomizzata, chiama la variante esplicita, per esempio `mldsa.sign(secretKey, message, { hedged: true })` in JavaScript o `mldsa.sign(secret_key, message, hedged=True)` in Python. Usala solo se vuoi una firma diversa ogni volta; la chain accetta entrambe, e il codice `pqc` 21 (`hybrid_verify_failed`) non è mai causato dalla scelta dell'una o dell'altra (vedi l'[elenco per la risoluzione dei problemi](/developer-guide/post-quantum-signing#code-21)).

### Scegliere la forma dei sign-bytes {#sign-bytes}

Chiedi al nodo quali nomi di upgrade sono applicati, poi lascia decidere alla libreria. Questa è la forma JavaScript dal README del pacchetto; gli altri binding esportano gli stessi nomi nel proprio stile.

```ts
import { SIGN_BYTES_V2_UPGRADES, signBytesVersionForApplied, hybridSignBytes } from "@qorechain/pqc";

const applied: Record<string, string> = {};
for (const name of SIGN_BYTES_V2_UPGRADES) {
  const r = await fetch(`${rest}/cosmos/upgrade/v1beta1/applied_plan/${name}`).then((x) => x.json());
  applied[name] = r.height; // "0" means not applied
}
const version = signBytesVersionForApplied(chainId, applied); // "v1" or "v2"
const signBytes = hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfoBytes);
```

`rest` è `https://api.qore.host` per la mainnet (`qorechain-vladi`) oppure `https://api-testnet.qore.host` per la testnet (`qorechain-diana`). Oggi entrambe le reti verificano v2. La maggior parte delle applicazioni non ha bisogno di farlo a mano: l'SDK e QoreSign risolvono la forma per rete.

## Come accedere {#how-to-access}

* **Per usare la libreria non servono rete, account né chiave.** Funziona offline. Una coppia di chiavi che crea è solo una chiave; per usarla su QoreChain l'account deve registrare la chiave pubblica una volta (vedi [Firma Post-Quantistica](/developer-guide/post-quantum-signing#pqc-key-registration)), e una transazione sulla lane Cosmos richiede poi la firma secp256k1 più la firma ML-DSA-87 (ibrida).
* **Reti.** Gli helper dei sign-bytes e i vettori corrispondono alla mainnet `qorechain-vladi` (v3.2.4) e alla testnet `qorechain-diana` (v3.2.6). Per gli endpoint vedi [Reti](/appendix/networks).
* **Python richiede la libreria condivisa liboqs.** `pip install qorechain-pqc` dipende da `liboqs-python`, che compila liboqs al primo import se manca; questo richiede `git`, CMake e un compilatore C sulla macchina. Negli ambienti blindati installa liboqs dal gestore di pacchetti di sistema, oppure compilala in anticipo. Il binding Python legge le chiavi dal generatore di numeri casuali di sistema e nella 0.2.3 non ha la generazione di chiavi da seed.
* **Go richiede Go 1.25 o successivo** (un requisito dalla 0.2.1, insieme a CIRCL 1.6.5 o successivo).
* **Java** è stato eseguito con JDK 21. La chiave segreta ML-DSA nel binding Java è il seed FIPS 204 da 32 byte, non la chiave espansa da 4.896 byte usata dagli altri binding; qualsiasi altro input viene rifiutato.
* **Versione fissata di Bouncy Castle in Java.** Il binding Java è costruito su Bouncy Castle 1.85 dalla 0.2.3 (le release precedenti usavano versioni più vecchie con avvisi pubblicati, nessuno nel codice ML-DSA o ML-KEM che il binding chiama). Secondo il changelog del progetto, la 1.85 è l'ultima release di Bouncy Castle che include ancora le classi `org.bouncycastle.pqc.crypto`, quindi mantieni la tua build sulla 1.85 e verifica prima di lasciare che un'altra dipendenza porti una release più recente, perché le release successive non includono più quelle classi.
* **Costo.** Gratuita e open source con licenza Apache-2.0. Firmare e verificare non costa nulla; l'uso on-chain delle firme risultanti paga la commissione consueta (minimo 0,1 uqor per gas).

## Dove è pubblicata {#where-published}

| Registry | Pacchetto | Versione | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (import `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Go module proxy | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (tag `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | solo sorgente, nessun registry di pacchetti | tag `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

Sorgente: https://github.com/qorechain/qorechain-pqc (cartelle `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). Tutti i pacchetti sono Apache-2.0. Le versioni sono state lette da ciascun registry il 27 ottobre 2026. La guida concettuale alla stessa libreria, comprese derivazione e rotazione delle chiavi, è [Firma Post-Quantistica](/developer-guide/post-quantum-signing); l'SDK che la usa è descritto in [Panoramica dell'SDK](/sdk/overview).

## Limiti e problemi noti {#limits}

* **È una libreria di primitive, non un wallet né un client.** Non registra chiavi, non costruisce transazioni, non effettua broadcast e non legge la chain. Per questo usa l'[SDK](/sdk/overview) o [QoreSign](/qoresign/overview).
* **Python e C non possono generare una chiave da un seed.** Entrambi si appoggiano a liboqs, che ricava le chiavi dal generatore di numeri casuali di sistema. I loro test sui vettori usano invece la chiave segreta espansa.
* **La chiave segreta di Java è un seed.** Il codice che sposta chiavi segrete ML-DSA tra Java e gli altri binding deve convertirle: il valore Java è il seed da 32 byte, gli altri sono la chiave espansa da 4.896 byte per ML-DSA-87.
* **Il binding Python richiede una toolchain C la prima volta** se liboqs non è già installata. Il quickstart Python è stato eseguito con liboqs già presente.
* **Il binding C non ha un pacchetto su registry né un quickstart testato.** Compilalo dal repository; richiede liboqs e OpenSSL.
* **Le dimensioni delle chiavi sono fissate dallo standard.** Una firma ML-DSA-87 è di 4.627 byte e una chiave pubblica di 2.592 byte; non esiste una forma più piccola compatibile con lo standard.
* **Release precedenti.** Usa la 0.2.1 o successiva: la 0.2.0 ha introdotto `hybridSignBytes` con riconoscimento della versione (la vecchia forma a due argomenti è ora `hybridSignBytesV1`), e la 0.2.1 ha aggiunto entrambi i nomi di piano di upgrade. La 0.2.2 e la 0.2.3 hanno modificato la documentazione e le versioni delle dipendenze, con output identico.
* **L'uso ibrido richiede comunque l'altra metà.** Una firma ibrida porta anche una firma secp256k1; questa libreria produce solo la metà ML-DSA. Account, registrazione e finestra di autorizzazione EVM sono regole della chain documentate in [Firma Post-Quantistica](/developer-guide/post-quantum-signing) e nella [guida EVM](/developer-guide/evm-development#evm-window).
