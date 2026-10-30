---
slug: /developer-tools/pqc-library
title: Post-Quanten-Bibliothek (qorechain-pqc)
sidebar_label: PQC-Bibliothek
sidebar_position: 20
---

# Post-Quanten-Bibliothek (`qorechain-pqc`)

`qorechain-pqc` ist die reine Standards-Bibliothek für Post-Quanten-Kryptografie, auf der das QoreChain-Tooling aufbaut. Sie richtet sich an Entwickler von Wallets, Backends, Börsen und Tools, die genau die Schlüssel und Signaturen erzeugen oder prüfen müssen, die die Chain verwendet, ohne vom vollständigen [QoreChain-SDK](/sdk/overview) abhängig zu sein. Sie umhüllt unabhängige Implementierungen dreier NIST-Standards (ML-DSA, FIPS 204, für Signaturen; ML-KEM, FIPS 203, für die Schlüsselkapselung; SHAKE-256, FIPS 202, als Hash) hinter einer einzigen API in TypeScript/JavaScript, Python, Rust, Go, Java und C und ergänzt die Helfer, die die Bytes bauen, die eine hybride QoreChain-Transaktion signiert. Version **0.2.3**, Apache-2.0, am 27. Oktober 2026 gegen die Registries geprüft.

Sie ist eine Primitiven-Bibliothek. Sie spricht nicht mit dem Netzwerk, hält keine Schlüssel, registriert keine Schlüssel on-chain und sendet keine Transaktionen. Für die Chain-Regeln rund um hybride Signaturen und Schlüsselregistrierung lesen Sie [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) und [Post-Quanten-Sicherheit](/architecture/post-quantum-security); für einen fertigen Signier-Client verwenden Sie das [SDK](/sdk/overview) oder [QoreSign](/qoresign/overview), die beide auf diesen Primitiven aufbauen.

## Innovationen {#innovations}

* **Ein Satz Testvektoren, sechs unabhängige Backends.** Die JavaScript-Bindung verwendet `@noble/post-quantum`, Rust die Crates `fips204`, `fips203` und `sha3`, Go Cloudflare CIRCL, Java Bouncy Castle, und Python und C verwenden liboqs. Die Testsuite jeder Bindung muss die gleichen Dateien im Ordner `vectors/` des Repositorys (ML-DSA auf drei Stufen, ML-KEM auf drei Stufen, SHAKE-256) Byte für Byte reproduzieren, sodass eine in einer Sprache erzeugte Signatur in den anderen verifiziert.
* **Standardmäßig deterministisches Signieren.** `sign` verwendet die deterministische Variante von FIPS 204 (Signier-Zufall aus 32 Null-Bytes), sodass derselbe Schlüssel und dieselbe Nachricht in jeder Bindung eine byte-identische Signatur ergeben. Dadurch sind Signaturen und die Transaktions-Hashes, die sie enthalten, reproduzierbar und gegen die Vektoren prüfbar.
* **Hedged Signieren als ausdrückliches Opt-in, das interoperabel ist.** Randomisiertes (hedged) Signieren gibt es als `{hedged: true}` in JavaScript, `hedged=True` in Python, `sign_hedged` in Rust, `SignHedged` in Go (hinzugefügt in 0.2.3), `mldsaSignHedged` in Java und `qpqc_mldsa_sign_hedged` in C. Eine in einer der sechs Sprachen erzeugte hedged Signatur verifiziert in allen sechs (für 0.2.3 wurden 36 von 36 Kombinationen geprüft). Die Chain verifiziert jede gültige FIPS-204-ML-DSA-87-Signatur und akzeptiert daher beide Arten; ohne den geheimen Schlüssel lassen sich beide nicht unterscheiden.
* **Die hybriden Sign-Bytes der Chain, so gebaut, wie die Chain sie baut.** Jede Bindung hat `hybridSignBytesV1`, `hybridSignBytesV2` und einen Dispatcher `hybridSignBytes(version, chainId, body, authInfo)`, der die Version verlangt. Die v2-Form ist `"qorechain-pqc-hybrid-v2"`, dann die Chain-ID mit einer 64-Bit-Big-Endian-Länge, dann der Transaktions-Body (ohne die PQC-Erweiterung) und die Auth-Info, jeweils mit einer 32-Bit-Big-Endian-Länge. Alle Bindungen sind gegen die Known-Answer-Datei der Chain getestet (`vectors/signbytes-kat-v3.1.98.json`). Eine leere Chain-ID wird an den geprüften Einstiegspunkten abgelehnt, denn an keine Chain gebundene Bytes verifizieren in keinem Netzwerk.
* **Die Sign-Bytes-Version eines Netzwerks, entschieden durch eine reine Funktion.** Ein Netzwerk verifiziert jeweils genau eine Form, und der Wechsel zu v2 wurde unter zwei Plannamen angewandt (`v3.2.0` im Mainnet bei Höhe 2.981.742, `v3.1.98` im Testnet). `SIGN_BYTES_V2_UPGRADES` listet beide Namen, und `signBytesVersionForApplied(chainId, appliedHeights)` liefert `v1` oder `v2` aus den angewandten Höhen, die Sie vom Node lesen. Nur nach einem Namen zu fragen, würde ein Netzwerk falsch deuten, das unter dem anderen gewechselt hat.
* **Strenge Eingabeprüfung.** `verify` wirft nie einen Fehler: Ein Schlüssel oder eine Signatur falscher Länge oder jede andere fehlerhafte Eingabe liefert `false`. `keygen(seed)`, `sign`, `encapsulate` und `decapsulate` werfen einen Fehler, der das fehlerhafte Argument und seine erwartete Länge nennt.
* **Reines JavaScript, kein nativer Code.** Das npm-Paket läuft in Node und in Browsern ohne WebAssembly oder Add-ons. Auf einem Apple-Silicon-Laptop signiert ML-DSA-87 in der eigenen Messung des Repositorys (0.2.3, 1,5-KB-Nachricht, ein Kern) in JavaScript in etwa 8 ms und in den anderen fünf Bindungen in etwa 0,3 bis 0,45 ms.

## Anwendung {#how-to-use}

Alle fünf Registry-Pakete stellen dieselben Operationen bereit: `keygen`, `keygenFromSeed` (32-Byte-Seed), `sign`, `verify`; ML-KEM `keygen`, `encapsulate`, `decapsulate`; `shake256`; `pubkeyHash`; und die Sign-Bytes-Helfer. ML-DSA-87 und ML-KEM-1024 sind die Standards, und die stufenspezifischen Varianten (44, 65, 87 und 512, 768, 1024) werden daneben exportiert. ML-DSA-87 hat einen 2.592 Byte großen öffentlichen Schlüssel und eine 4.627 Byte große Signatur, die die Beispiele unten ausgeben.

### Installieren und importieren {#install}

| Sprache | Installation | Import |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 oder neuer) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | `c/` aus dem Repository bauen (statische Bibliothek und Header) | `qorechain_pqc.h` |

### Signieren und verifizieren, in jeder Sprache {#examples}

Dies sind die Quickstarts aus dem Developer Hub. Jeder wurde am 27. Oktober 2026 unverändert nach der Installation aus der öffentlichen Registry ausgeführt (Node 26, Python 3.12 mit vorhandenem liboqs, Rust 1.95, Go 1.26, JDK 21 mit Gradle 9.6) und gab die Größe des öffentlichen Schlüssels, die Größe der Signatur und das Verifizierungsergebnis aus: `2592 4627 true` (Python gibt `True` aus). Keiner verwendet das Netzwerk oder einen finanzierten Schlüssel, und die C-Bindung hat keinen Quickstart.

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

Java (als `PqcQuickstart.java` speichern):

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

Der feste Seed (32 Bytes, jeweils mit dem Wert 7) ist nur ein Beispiel. Verwenden Sie für einen echten Schlüssel einen zufälligen Seed oder die in [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#key-derivation) beschriebene Schlüsselableitung.

### Hedged Signieren {#hedged}

Deterministisches Signieren ist das, was `sign` tut. Um sich für randomisiertes Signieren zu entscheiden, rufen Sie die ausdrückliche Variante auf, zum Beispiel `mldsa.sign(secretKey, message, { hedged: true })` in JavaScript oder `mldsa.sign(secret_key, message, hedged=True)` in Python. Verwenden Sie sie nur, wenn Sie jedes Mal eine andere Signatur wollen; die Chain akzeptiert beide, und `pqc`-Code 21 (`hybrid_verify_failed`) wird nie dadurch verursacht, dass man die eine statt der anderen wählt (siehe die [Fehlerbehebungsliste](/developer-guide/post-quantum-signing#code-21)).

### Die Sign-Bytes-Form wählen {#sign-bytes}

Fragen Sie den Node, welche Upgrade-Namen angewandt sind, und lassen Sie dann die Bibliothek entscheiden. Dies ist die JavaScript-Form aus der README des Pakets; die anderen Bindungen exportieren dieselben Namen in ihrem eigenen Stil.

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

`rest` ist `https://api.qore.host` für das Mainnet (`qorechain-vladi`) oder `https://api-testnet.qore.host` für das Testnet (`qorechain-diana`). Beide Netzwerke verifizieren heute v2. Die meisten Anwendungen müssen das nicht von Hand tun: Das SDK und QoreSign lösen die Form pro Netzwerk auf.

## Zugang {#how-to-access}

* **Zur Nutzung der Bibliothek werden weder Netzwerk noch Konto noch Schlüssel benötigt.** Sie läuft offline. Ein von ihr erzeugtes Schlüsselpaar ist nur ein Schlüssel; um ihn auf QoreChain zu verwenden, muss das Konto den öffentlichen Schlüssel einmal registrieren (siehe [Post-Quanten-Signierung](/developer-guide/post-quantum-signing#pqc-key-registration)), und eine Transaktion auf der Cosmos-Lane braucht dann die secp256k1-Signatur plus die ML-DSA-87-Signatur (hybrid).
* **Netzwerke.** Die Sign-Bytes-Helfer und die Vektoren passen zum Mainnet `qorechain-vladi` (v3.2.5) und zum Testnet `qorechain-diana` (v3.2.6). Endpunkte siehe [Netzwerke](/appendix/networks).
* **Python benötigt die gemeinsam genutzte Bibliothek liboqs.** `pip install qorechain-pqc` hängt von `liboqs-python` ab, das liboqs beim ersten Import baut, wenn sie fehlt; dafür sind `git`, CMake und ein C-Compiler auf dem Rechner nötig. Installieren Sie liboqs in abgeschotteten Umgebungen aus Ihrem System-Paketmanager oder bauen Sie sie vorab. Die Python-Bindung liest Schlüssel aus dem Zufallszahlengenerator des Systems und hat in 0.2.3 keine Schlüsselerzeugung aus einem Seed.
* **Go benötigt Go 1.25 oder neuer** (eine Anforderung seit 0.2.1, zusammen mit CIRCL 1.6.5 oder neuer).
* **Java** wurde mit JDK 21 ausgeführt. Der ML-DSA-Geheimschlüssel in der Java-Bindung ist der 32-Byte-FIPS-204-Seed, nicht der 4.896 Byte große expandierte Schlüssel, den die anderen Bindungen verwenden; jede andere Eingabe wird abgelehnt.
* **Bouncy-Castle-Pin in Java.** Die Java-Bindung baut seit 0.2.3 auf Bouncy Castle 1.85 (frühere Releases verwendeten ältere Versionen mit veröffentlichten Sicherheitshinweisen, keiner davon im ML-DSA- oder ML-KEM-Code, den die Bindung aufruft). Laut Changelog des Projekts ist 1.85 das neueste Bouncy-Castle-Release, das die Klassen `org.bouncycastle.pqc.crypto` noch ausliefert. Halten Sie Ihren Build daher auf 1.85 und testen Sie, bevor Sie eine andere Abhängigkeit ein neueres Release nachziehen lassen, denn spätere Releases liefern diese Klassen nicht mehr aus.
* **Kosten.** Kostenlos und Open Source unter Apache-2.0. Signieren und Verifizieren kosten nichts; die On-Chain-Nutzung der entstandenen Signaturen zahlt die übliche Gebühr (Untergrenze 0,1 uqor pro Gas).

## Wo es veröffentlicht ist {#where-published}

| Registry | Paket | Version | Link |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (Import `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Go-Modul-Proxy | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (Tag `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | nur Quellcode, keine Paket-Registry | Tag `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

Quellcode: https://github.com/qorechain/qorechain-pqc (Ordner `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). Alle Pakete stehen unter Apache-2.0. Die Versionen wurden am 27. Oktober 2026 aus jeder Registry gelesen. Der konzeptionelle Leitfaden zur selben Bibliothek, einschließlich Schlüsselableitung und Rotation, ist [Post-Quanten-Signierung](/developer-guide/post-quantum-signing); das SDK, das sie verwendet, wird in der [SDK-Übersicht](/sdk/overview) beschrieben.

## Einschränkungen und bekannte Probleme {#limits}

* **Sie ist eine Primitiven-Bibliothek, keine Wallet und kein Client.** Sie registriert keine Schlüssel, baut keine Transaktionen, sendet nicht und liest die Chain nicht. Verwenden Sie dafür das [SDK](/sdk/overview) oder [QoreSign](/qoresign/overview).
* **Python und C können keinen Schlüssel aus einem Seed erzeugen.** Beide basieren auf liboqs, das Schlüssel aus dem Zufallszahlengenerator des Systems zieht. Ihre Vektortests verwenden stattdessen den expandierten Geheimschlüssel.
* **Der Java-Geheimschlüssel ist ein Seed.** Code, der ML-DSA-Geheimschlüssel zwischen Java und den anderen Bindungen bewegt, muss konvertieren: Der Java-Wert ist der 32-Byte-Seed, die anderen sind für ML-DSA-87 der 4.896 Byte große expandierte Schlüssel.
* **Die Python-Bindung braucht beim ersten Mal eine C-Toolchain,** wenn liboqs nicht bereits installiert ist. Der Python-Quickstart wurde mit bereits vorhandenem liboqs ausgeführt.
* **Die C-Bindung hat kein Registry-Paket und keinen getesteten Quickstart.** Bauen Sie sie aus dem Repository; sie benötigt liboqs und OpenSSL.
* **Schlüsselgrößen legt der Standard fest.** Eine ML-DSA-87-Signatur hat 4.627 Bytes und ein öffentlicher Schlüssel 2.592 Bytes; es gibt keine kleinere standardkompatible Form.
* **Ältere Releases.** Verwenden Sie 0.2.1 oder neuer: 0.2.0 führte das versionsbewusste `hybridSignBytes` ein (die alte Form mit zwei Argumenten heißt nun `hybridSignBytesV1`), und 0.2.1 ergänzte beide Upgrade-Plannamen. 0.2.2 und 0.2.3 änderten Dokumentation und Abhängigkeitsversionen, bei identischer Ausgabe.
* **Hybride Nutzung braucht weiterhin die andere Hälfte.** Eine hybride Signatur trägt zusätzlich eine secp256k1-Signatur; diese Bibliothek erzeugt nur die ML-DSA-Hälfte. Konten, Registrierung und das EVM-Autorisierungsfenster sind Chain-Regeln, die in [Post-Quanten-Signierung](/developer-guide/post-quantum-signing) und im [EVM-Leitfaden](/developer-guide/evm-development#evm-window) dokumentiert sind.
