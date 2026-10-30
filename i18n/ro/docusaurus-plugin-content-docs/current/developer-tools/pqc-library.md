---
slug: /developer-tools/pqc-library
title: Biblioteca post-cuantică (qorechain-pqc)
sidebar_label: Biblioteca PQC
sidebar_position: 20
---

# Biblioteca post-cuantică (`qorechain-pqc`)

`qorechain-pqc` este biblioteca de criptografie post-cuantică, strict pe baza standardelor, pe care sunt construite uneltele QoreChain. Este destinată dezvoltatorilor de portofele, backend-uri, exchange-uri și unelte care trebuie să creeze sau să verifice exact cheile și semnăturile pe care le folosește lanțul, fără a depinde de întregul [SDK QoreChain](/sdk/overview). Învelește implementări independente ale a trei standarde NIST (ML-DSA, FIPS 204, pentru semnături; ML-KEM, FIPS 203, pentru încapsularea cheilor; SHAKE-256, FIPS 202, ca hash) în spatele unui singur API în TypeScript/JavaScript, Python, Rust, Go, Java și C, și adaugă ajutoarele care construiesc octeții pe care îi semnează o tranzacție hibridă QoreChain. Versiunea **0.2.3**, Apache-2.0, verificată în registre pe 27 octombrie 2026.

Este o bibliotecă de primitive. Nu comunică cu rețeaua, nu deține chei, nu înregistrează chei pe lanț și nu trimite tranzacții. Pentru regulile lanțului privind semnăturile hibride și înregistrarea cheilor citiți [Semnare post-cuantică](/developer-guide/post-quantum-signing) și [Securitate post-cuantică](/architecture/post-quantum-security); pentru un client de semnare gata făcut folosiți [SDK-ul](/sdk/overview) sau [QoreSign](/qoresign/overview), ambele construite pe aceste primitive.

## Inovații {#innovations}

* **Un singur set de vectori de test, șase backend-uri independente.** Binding-ul JavaScript folosește `@noble/post-quantum`, Rust folosește crate-urile `fips204`, `fips203` și `sha3`, Go folosește Cloudflare CIRCL, Java folosește Bouncy Castle, iar Python și C folosesc liboqs. Suita de teste a fiecărui binding trebuie să reproducă octet cu octet aceleași fișiere din folderul `vectors/` al repository-ului (ML-DSA la trei niveluri, ML-KEM la trei niveluri, SHAKE-256), astfel încât o semnătură făcută într-un limbaj se verifică în celelalte.
* **Semnare deterministă în mod implicit.** `sign` folosește varianta deterministă a FIPS 204 (aleatoriu de semnare format din 32 de octeți zero), deci aceeași cheie și același mesaj dau o semnătură identică octet cu octet în fiecare binding. Astfel semnăturile, și hash-urile tranzacțiilor care le conțin, sunt reproductibile și verificabile pe baza vectorilor.
* **Semnarea hedged ca opțiune explicită, care interoperează.** Semnarea randomizată (hedged) este disponibilă ca `{hedged: true}` în JavaScript, `hedged=True` în Python, `sign_hedged` în Rust, `SignHedged` în Go (adăugat în 0.2.3), `mldsaSignHedged` în Java și `qpqc_mldsa_sign_hedged` în C. O semnătură hedged făcută în oricare dintre cele șase limbaje se verifică în toate șase (36 din 36 de combinații verificate pentru 0.2.3). Lanțul verifică orice semnătură ML-DSA-87 FIPS 204 validă, deci le acceptă pe ambele tipuri; cele două nu pot fi deosebite fără cheia secretă.
* **Sign-bytes hibride ale lanțului, construite așa cum le construiește lanțul.** Fiecare binding are `hybridSignBytesV1`, `hybridSignBytesV2` și un dispecer `hybridSignBytes(version, chainId, body, authInfo)` care cere versiunea. Forma v2 este `"qorechain-pqc-hybrid-v2"`, apoi ID-ul lanțului cu o lungime big-endian pe 64 de biți, apoi corpul tranzacției (fără extensia PQC) și auth info, fiecare cu o lungime big-endian pe 32 de biți. Toate binding-urile sunt testate cu fișierul de răspunsuri cunoscute al lanțului (`vectors/signbytes-kat-v3.1.98.json`). Un ID de lanț gol este refuzat pe punctele de intrare verificate, deoarece octeții legați de niciun lanț nu se verifică pe nicio rețea.
* **Versiunea de sign-bytes a rețelei decisă de o funcție pură.** O rețea verifică exact o singură formă la un moment dat, iar trecerea la v2 a fost aplicată sub două nume de plan (`v3.2.0` pe mainnet la înălțimea 2.981.742, `v3.1.98` pe testnet). `SIGN_BYTES_V2_UPGRADES` listează ambele nume, iar `signBytesVersionForApplied(chainId, appliedHeights)` returnează `v1` sau `v2` pe baza înălțimilor aplicate pe care le citiți de la nod. Întrebarea despre un singur nume ar interpreta greșit o rețea care a trecut sub celălalt.
* **Verificarea strictă a intrărilor.** `verify` nu aruncă niciodată o eroare: o cheie sau o semnătură cu lungime greșită, ori orice altă intrare malformată, returnează `false`. `keygen(seed)`, `sign`, `encapsulate` și `decapsulate` aruncă o eroare care numește argumentul greșit și lungimea așteptată.
* **JavaScript pur, fără cod nativ.** Pachetul npm rulează în Node și în browsere fără WebAssembly sau add-on-uri. Pe un laptop Apple silicon, în măsurătoarea proprie a repository-ului (0.2.3, mesaj de 1,5 KB, un nucleu), ML-DSA-87 semnează în aproximativ 8 ms în JavaScript și în aproximativ 0,3 până la 0,45 ms în celelalte cinci binding-uri.

## Cum se folosește {#how-to-use}

Toate cele cinci pachete din registre expun aceleași operații: `keygen`, `keygenFromSeed` (seed de 32 de octeți), `sign`, `verify`; ML-KEM `keygen`, `encapsulate`, `decapsulate`; `shake256`; `pubkeyHash`; și ajutoarele pentru sign-bytes. ML-DSA-87 și ML-KEM-1024 sunt valorile implicite, iar variantele specifice nivelurilor (44, 65, 87 și 512, 768, 1024) sunt exportate alături de ele. ML-DSA-87 are o cheie publică de 2.592 de octeți și o semnătură de 4.627 de octeți, pe care le afișează exemplele de mai jos.

### Instalare și import {#install}

| Limbaj | Instalare | Import |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 sau mai nou) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | compilați `c/` din repository (bibliotecă statică și header) | `qorechain_pqc.h` |

### Semnați și verificați, în fiecare limbaj {#examples}

Acestea sunt quickstart-urile din hub-ul pentru dezvoltatori. Fiecare a fost rulat neschimbat pe 27 octombrie 2026 după instalarea din registrul public (Node 26, Python 3.12 cu liboqs prezent, Rust 1.95, Go 1.26, JDK 21 cu Gradle 9.6) și a afișat dimensiunea cheii publice, dimensiunea semnăturii și rezultatul verificării: `2592 4627 true` (Python afișează `True`). Niciunul nu folosește rețeaua sau o cheie alimentată, iar binding-ul C nu are quickstart.

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

Java (salvați ca `PqcQuickstart.java`):

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

Seed-ul fix (32 de octeți, fiecare cu valoarea 7) este doar un exemplu. Pentru o cheie reală folosiți un seed aleator sau derivarea cheii descrisă în [Semnare post-cuantică](/developer-guide/post-quantum-signing#key-derivation).

### Semnarea hedged {#hedged}

Semnarea deterministă este ceea ce face `sign`. Pentru a opta pentru semnarea randomizată, apelați varianta explicită, de exemplu `mldsa.sign(secretKey, message, { hedged: true })` în JavaScript sau `mldsa.sign(secret_key, message, hedged=True)` în Python. Folosiți-o doar dacă doriți o semnătură diferită de fiecare dată; lanțul le acceptă pe ambele, iar `pqc` cod 21 (`hybrid_verify_failed`) nu este niciodată cauzat de alegerea uneia în locul celeilalte (vedeți [lista de depanare](/developer-guide/post-quantum-signing#code-21)).

### Alegerea formei sign-bytes {#sign-bytes}

Întrebați nodul ce nume de actualizare sunt aplicate, apoi lăsați biblioteca să decidă. Aceasta este forma JavaScript din README-ul pachetului; celelalte binding-uri exportă aceleași nume în stilul lor.

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

`rest` este `https://api.qore.host` pentru mainnet (`qorechain-vladi`) sau `https://api-testnet.qore.host` pentru testnet (`qorechain-diana`). Astăzi ambele rețele verifică v2. Majoritatea aplicațiilor nu trebuie să facă asta manual: SDK-ul și QoreSign rezolvă forma per rețea.

## Cum se accesează {#how-to-access}

* **Nu este nevoie de rețea, cont sau cheie pentru a folosi biblioteca.** Rulează offline. O pereche de chei creată de ea este doar o cheie; pentru a o folosi pe QoreChain, contul trebuie să înregistreze o singură dată cheia publică (vedeți [Semnare post-cuantică](/developer-guide/post-quantum-signing#pqc-key-registration)), iar o tranzacție pe lane-ul Cosmos are apoi nevoie de semnătura secp256k1 plus semnătura ML-DSA-87 (hibrid).
* **Rețele.** Ajutoarele pentru sign-bytes și vectorii corespund mainnet `qorechain-vladi` (v3.2.5) și testnet `qorechain-diana` (v3.2.6). Vedeți [Rețele](/appendix/networks) pentru endpoint-uri.
* **Python are nevoie de biblioteca partajată liboqs.** `pip install qorechain-pqc` depinde de `liboqs-python`, care compilează liboqs la primul import când lipsește; asta cere `git`, CMake și un compilator C pe mașină. În medii restricționate, instalați liboqs din managerul de pachete al sistemului sau compilați-l în avans. Binding-ul Python citește cheile din generatorul de numere aleatorii al sistemului și nu are generare de chei din seed în 0.2.3.
* **Go cere Go 1.25 sau mai nou** (o cerință din 0.2.1, împreună cu CIRCL 1.6.5 sau mai nou).
* **Java** a fost rulat cu JDK 21. Cheia secretă ML-DSA din binding-ul Java este seed-ul FIPS 204 de 32 de octeți, nu cheia expandată de 4.896 de octeți pe care o folosesc celelalte binding-uri; orice altă intrare este refuzată.
* **Pin-ul Bouncy Castle în Java.** Binding-ul Java este construit pe Bouncy Castle 1.85 începând cu 0.2.3 (versiunile anterioare foloseau versiuni mai vechi cu avertismente publicate, niciunul în codul ML-DSA sau ML-KEM pe care îl apelează binding-ul). Conform changelog-ului proiectului, 1.85 este ultima versiune Bouncy Castle care mai include clasele `org.bouncycastle.pqc.crypto`, deci păstrați build-ul pe 1.85 și testați înainte de a lăsa o altă dependență să aducă o versiune mai nouă, deoarece versiunile ulterioare nu mai includ acele clase.
* **Cost.** Gratuit și open source sub Apache-2.0. Semnarea și verificarea nu costă nimic; utilizarea pe lanț a semnăturilor rezultate plătește comisionul obișnuit (prag minim 0,1 uqor per gaz).

## Unde este publicat {#where-published}

| Registru | Pachet | Versiune | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (import `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Go module proxy | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (tag `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | doar sursă, fără registru de pachete | tag `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

Sursa: https://github.com/qorechain/qorechain-pqc (folderele `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). Toate pachetele sunt Apache-2.0. Versiunile au fost citite din fiecare registru pe 27 octombrie 2026. Ghidul conceptual pentru aceeași bibliotecă, inclusiv derivarea și rotirea cheilor, este [Semnare post-cuantică](/developer-guide/post-quantum-signing); SDK-ul care o folosește este descris în [Prezentarea generală a SDK-ului](/sdk/overview).

## Limite și probleme cunoscute {#limits}

* **Este o bibliotecă de primitive, nu un portofel sau un client.** Nu înregistrează chei, nu construiește tranzacții, nu transmite și nu citește lanțul. Pentru asta folosiți [SDK-ul](/sdk/overview) sau [QoreSign](/qoresign/overview).
* **Python și C nu pot genera o cheie dintr-un seed.** Ambele se bazează pe liboqs, care extrage cheile din generatorul de numere aleatorii al sistemului. Testele lor cu vectori folosesc în schimb cheia secretă expandată.
* **Cheia secretă Java este un seed.** Codul care mută chei secrete ML-DSA între Java și celelalte binding-uri trebuie să convertească: valoarea Java este seed-ul de 32 de octeți, celelalte sunt cheia expandată de 4.896 de octeți pentru ML-DSA-87.
* **Binding-ul Python are nevoie de un toolchain C prima dată** dacă liboqs nu este deja instalat. Quickstart-ul Python a fost rulat cu liboqs deja prezent.
* **Binding-ul C nu are pachet în registru și nici quickstart testat.** Compilați-l din repository; are nevoie de liboqs și OpenSSL.
* **Dimensiunile cheilor sunt fixate de standard.** O semnătură ML-DSA-87 are 4.627 de octeți și o cheie publică 2.592 de octeți; nu există o formă mai mică compatibilă cu standardul.
* **Versiuni mai vechi.** Folosiți 0.2.1 sau mai nou: 0.2.0 a introdus `hybridSignBytes` conștient de versiune (vechea formă cu două argumente este acum `hybridSignBytesV1`), iar 0.2.1 a adăugat ambele nume de plan de actualizare. 0.2.2 și 0.2.3 au schimbat documentația și versiunile dependențelor, cu rezultat identic.
* **Utilizarea hibridă are încă nevoie de cealaltă jumătate.** O semnătură hibridă poartă și o semnătură secp256k1; această bibliotecă produce doar jumătatea ML-DSA. Conturile, înregistrarea și fereastra de autorizare EVM sunt reguli ale lanțului documentate în [Semnare post-cuantică](/developer-guide/post-quantum-signing) și în [ghidul EVM](/developer-guide/evm-development#evm-window).
