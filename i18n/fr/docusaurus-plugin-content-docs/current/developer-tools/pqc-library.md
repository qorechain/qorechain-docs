---
slug: /developer-tools/pqc-library
title: Bibliothèque post-quantique (qorechain-pqc)
sidebar_label: Bibliothèque PQC
sidebar_position: 20
---

# Bibliothèque post-quantique (`qorechain-pqc`)

`qorechain-pqc` est la bibliothèque de cryptographie post-quantique, strictement fondée sur les standards, sur laquelle repose l'outillage QoreChain. Elle s'adresse aux développeurs de portefeuilles, de backends, d'échanges et d'outils qui ont besoin de créer ou de vérifier les clés et signatures exactes utilisées par la chaîne, sans dépendre du [SDK QoreChain](/sdk/overview) complet. Elle enveloppe des implémentations indépendantes de trois standards du NIST (ML-DSA, FIPS 204, pour les signatures ; ML-KEM, FIPS 203, pour l'encapsulation de clé ; SHAKE-256, FIPS 202, comme hachage) derrière une seule API en TypeScript/JavaScript, Python, Rust, Go, Java et C, et ajoute les utilitaires qui construisent les octets que signe une transaction hybride QoreChain. Version **0.2.3**, Apache-2.0, vérifiée sur les registres le 27 octobre 2026.

C'est une bibliothèque de primitives. Elle ne communique pas avec le réseau, ne détient pas de clés, n'enregistre pas de clés on-chain et n'envoie pas de transactions. Pour les règles de la chaîne concernant les signatures hybrides et l'enregistrement des clés, lisez [Signature post-quantique](/developer-guide/post-quantum-signing) et [Sécurité post-quantique](/architecture/post-quantum-security) ; pour un client de signature prêt à l'emploi, utilisez le [SDK](/sdk/overview) ou [QoreSign](/qoresign/overview), qui s'appuient tous deux sur ces primitives.

## Innovations {#innovations}

* **Un seul jeu de vecteurs de test, six backends indépendants.** La liaison JavaScript utilise `@noble/post-quantum`, Rust utilise les crates `fips204`, `fips203` et `sha3`, Go utilise Cloudflare CIRCL, Java utilise Bouncy Castle, et Python et C utilisent liboqs. La suite de tests de chaque liaison doit reproduire octet pour octet les mêmes fichiers du dossier `vectors/` du dépôt (ML-DSA à trois niveaux, ML-KEM à trois niveaux, SHAKE-256), de sorte qu'une signature produite dans un langage se vérifie dans les autres.
* **Signature déterministe par défaut.** `sign` utilise la variante déterministe de FIPS 204 (aléa de signature de 32 octets nuls), si bien qu'une même clé et un même message donnent une signature identique à l'octet près dans chaque liaison. Les signatures, et les hachages de transaction qui les contiennent, sont ainsi reproductibles et vérifiables par rapport aux vecteurs.
* **Signature hedged comme option explicite et interopérable.** La signature randomisée (hedged) est disponible sous la forme `{hedged: true}` en JavaScript, `hedged=True` en Python, `sign_hedged` en Rust, `SignHedged` en Go (ajouté en 0.2.3), `mldsaSignHedged` en Java et `qpqc_mldsa_sign_hedged` en C. Une signature hedged produite dans l'un des six langages se vérifie dans les six (36 combinaisons sur 36 vérifiées pour 0.2.3). La chaîne vérifie toute signature ML-DSA-87 FIPS 204 valide, elle accepte donc les deux types ; on ne peut pas les distinguer sans la clé secrète.
* **Les sign-bytes hybrides de la chaîne, construits comme la chaîne les construit.** Chaque liaison dispose de `hybridSignBytesV1`, `hybridSignBytesV2` et d'un répartiteur `hybridSignBytes(version, chainId, body, authInfo)` qui exige la version. La forme v2 est `"qorechain-pqc-hybrid-v2"`, puis le chain ID avec une longueur big-endian sur 64 bits, puis le corps de la transaction (sans l'extension PQC) et l'auth info, chacun avec une longueur big-endian sur 32 bits. Toutes les liaisons sont testées contre le fichier de réponses connues de la chaîne (`vectors/signbytes-kat-v3.1.98.json`). Un chain ID vide est refusé sur les points d'entrée contrôlés, car des octets liés à aucune chaîne ne se vérifient sur aucun réseau.
* **La version des sign-bytes du réseau décidée par une fonction pure.** Un réseau ne vérifie qu'une seule forme à la fois, et le passage à la v2 a été appliqué sous deux noms de plan (`v3.2.0` sur le mainnet à la hauteur 2 981 742, `v3.1.98` sur le testnet). `SIGN_BYTES_V2_UPGRADES` liste les deux noms et `signBytesVersionForApplied(chainId, appliedHeights)` renvoie `v1` ou `v2` à partir des hauteurs appliquées que vous lisez sur le nœud. Interroger un seul nom risquerait de mal interpréter un réseau qui a basculé sous l'autre.
* **Contrôle strict des entrées.** `verify` ne lève jamais d'erreur : une clé ou une signature de mauvaise longueur, ou toute autre entrée mal formée, renvoie `false`. `keygen(seed)`, `sign`, `encapsulate` et `decapsulate` lèvent une erreur qui nomme l'argument incorrect et sa longueur attendue.
* **JavaScript pur, aucun code natif.** Le paquet npm fonctionne dans Node et dans les navigateurs sans WebAssembly ni module complémentaire. Sur un portable Apple silicon, dans la propre mesure du dépôt (0.2.3, message de 1,5 Ko, un cœur), ML-DSA-87 signe en environ 8 ms en JavaScript et en environ 0,3 à 0,45 ms dans les cinq autres liaisons.

## Comment l'utiliser {#how-to-use}

Les cinq paquets de registre exposent les mêmes opérations : `keygen`, `keygenFromSeed` (graine de 32 octets), `sign`, `verify` ; ML-KEM `keygen`, `encapsulate`, `decapsulate` ; `shake256` ; `pubkeyHash` ; et les utilitaires de sign-bytes. ML-DSA-87 et ML-KEM-1024 sont les valeurs par défaut, et les variantes par niveau (44, 65, 87 et 512, 768, 1024) sont exportées à côté. ML-DSA-87 a une clé publique de 2 592 octets et une signature de 4 627 octets, que les exemples ci-dessous affichent.

### Installer et importer {#install}

| Langage | Installation | Import |
| --- | --- | --- |
| TypeScript / JavaScript | `npm install @qorechain/pqc` | `import { mldsa } from "@qorechain/pqc"` |
| Python (3.9 ou ultérieur) | `pip install qorechain-pqc` | `from qorpqc import mldsa` |
| Rust | `cargo add qorechain-pqc` | `use qorechain_pqc::mldsa;` |
| Go | `go get github.com/qorechain/qorechain-pqc/go` | `import pqc "github.com/qorechain/qorechain-pqc/go"` |
| Java | `implementation("io.github.qorechain:qorechain-pqc:0.2.3")` | `import network.qorechain.pqc.Pqc;` |
| C | compiler `c/` depuis le dépôt (bibliothèque statique et en-tête) | `qorechain_pqc.h` |

### Signer et vérifier, dans chaque langage {#examples}

Ce sont les quickstarts du hub développeurs. Chacun a été exécuté tel quel le 27 octobre 2026 après installation depuis le registre public (Node 26, Python 3.12 avec liboqs présent, Rust 1.95, Go 1.26, JDK 21 avec Gradle 9.6) et a affiché la taille de la clé publique, la taille de la signature et le résultat de la vérification : `2592 4627 true` (Python affiche `True`). Aucun n'utilise le réseau ni une clé alimentée, et la liaison C n'a pas de quickstart.

TypeScript :

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

Python :

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

Rust :

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

Go :

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

Java (à enregistrer sous `PqcQuickstart.java`) :

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

La graine fixe (32 octets, chacun de valeur 7) n'est qu'un exemple. Utilisez une graine aléatoire ou la dérivation de clé décrite dans [Signature post-quantique](/developer-guide/post-quantum-signing#key-derivation) pour une vraie clé.

### Signature hedged {#hedged}

La signature déterministe est ce que fait `sign`. Pour choisir la signature randomisée, appelez la variante explicite, par exemple `mldsa.sign(secretKey, message, { hedged: true })` en JavaScript ou `mldsa.sign(secret_key, message, hedged=True)` en Python. Ne l'utilisez que si vous voulez une signature différente à chaque fois ; la chaîne accepte les deux, et le code `pqc` 21 (`hybrid_verify_failed`) n'est jamais causé par le choix de l'une plutôt que de l'autre (voir la [liste de dépannage](/developer-guide/post-quantum-signing#code-21)).

### Choisir la forme des sign-bytes {#sign-bytes}

Demandez au nœud quels noms de mise à niveau sont appliqués, puis laissez la bibliothèque décider. Voici la forme JavaScript issue du README du paquet ; les autres liaisons exportent les mêmes noms dans leur propre style.

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

`rest` vaut `https://api.qore.host` pour le mainnet (`qorechain-vladi`) ou `https://api-testnet.qore.host` pour le testnet (`qorechain-diana`). Les deux réseaux vérifient aujourd'hui la v2. La plupart des applications n'ont pas besoin de le faire à la main : le SDK et QoreSign résolvent la forme par réseau.

## Comment y accéder {#how-to-access}

* **Aucun réseau, compte ou clé n'est nécessaire pour utiliser la bibliothèque.** Elle fonctionne hors ligne. Une paire de clés qu'elle crée n'est qu'une clé ; pour l'utiliser sur QoreChain, le compte doit enregistrer la clé publique une fois (voir [Signature post-quantique](/developer-guide/post-quantum-signing#pqc-key-registration)), et une transaction de la voie Cosmos nécessite alors la signature secp256k1 plus la signature ML-DSA-87 (hybride).
* **Réseaux.** Les utilitaires de sign-bytes et les vecteurs correspondent au mainnet `qorechain-vladi` (v3.2.5) et au testnet `qorechain-diana` (v3.2.6). Voir [Réseaux](/appendix/networks) pour les points de terminaison.
* **Python a besoin de la bibliothèque partagée liboqs.** `pip install qorechain-pqc` dépend de `liboqs-python`, qui compile liboqs au premier import lorsqu'elle est absente ; cela nécessite `git`, CMake et un compilateur C sur la machine. Dans les environnements verrouillés, installez liboqs depuis le gestionnaire de paquets de votre système, ou compilez-la à l'avance. La liaison Python lit les clés depuis le générateur de nombres aléatoires du système et n'a pas de génération de clé à partir d'une graine en 0.2.3.
* **Go nécessite Go 1.25 ou ultérieur** (une exigence depuis 0.2.1, avec CIRCL 1.6.5 ou ultérieur).
* **Java** a été exécuté avec JDK 21. La clé secrète ML-DSA de la liaison Java est la graine FIPS 204 de 32 octets, et non la clé étendue de 4 896 octets qu'utilisent les autres liaisons ; toute autre entrée est refusée.
* **Version figée de Bouncy Castle en Java.** La liaison Java est construite sur Bouncy Castle 1.85 depuis 0.2.3 (les versions précédentes utilisaient des versions plus anciennes qui faisaient l'objet d'avis publiés, aucun ne concernant le code ML-DSA ou ML-KEM appelé par la liaison). D'après le journal des modifications du projet, 1.85 est la dernière version de Bouncy Castle qui fournit encore les classes `org.bouncycastle.pqc.crypto` : gardez donc votre build sur 1.85, et testez avant de laisser une autre dépendance en tirer une version plus récente, car les versions ultérieures ne fournissent plus ces classes.
* **Coût.** Gratuite et open source sous Apache-2.0. La signature et la vérification ne coûtent rien ; l'usage on-chain des signatures obtenues paie les frais habituels (plancher de 0,1 uqor par gas).

## Où elle est publiée {#where-published}

| Registre | Paquet | Version | Lien |
| --- | --- | --- | --- |
| npm | `@qorechain/pqc` | 0.2.3 | https://www.npmjs.com/package/@qorechain/pqc |
| PyPI | `qorechain-pqc` (import `qorpqc`) | 0.2.3 | https://pypi.org/project/qorechain-pqc/ |
| crates.io | `qorechain-pqc` | 0.2.3 | https://crates.io/crates/qorechain-pqc |
| Proxy de modules Go | `github.com/qorechain/qorechain-pqc/go` | v0.2.3 (tag `go/v0.2.3`) | https://pkg.go.dev/github.com/qorechain/qorechain-pqc/go |
| Maven Central | `io.github.qorechain:qorechain-pqc` | 0.2.3 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-pqc |
| C | source uniquement, pas de registre de paquets | tag `v0.2.3` | https://github.com/qorechain/qorechain-pqc |

Source : https://github.com/qorechain/qorechain-pqc (dossiers `js`, `python`, `rust`, `go`, `java`, `c`, `vectors`). Tous les paquets sont sous Apache-2.0. Les versions ont été lues sur chaque registre le 27 octobre 2026. Le guide conceptuel de la même bibliothèque, y compris la dérivation et la rotation des clés, est [Signature post-quantique](/developer-guide/post-quantum-signing) ; le SDK qui l'utilise est décrit dans la [vue d'ensemble du SDK](/sdk/overview).

## Limites et problèmes connus {#limits}

* **C'est une bibliothèque de primitives, pas un portefeuille ni un client.** Elle n'enregistre pas de clés, ne construit pas de transactions, ne diffuse pas et ne lit pas la chaîne. Utilisez pour cela le [SDK](/sdk/overview) ou [QoreSign](/qoresign/overview).
* **Python et C ne peuvent pas générer une clé à partir d'une graine.** Les deux reposent sur liboqs, qui tire les clés du générateur de nombres aléatoires du système. Leurs tests de vecteurs utilisent à la place la clé secrète étendue.
* **La clé secrète Java est une graine.** Le code qui déplace des clés secrètes ML-DSA entre Java et les autres liaisons doit convertir : la valeur Java est la graine de 32 octets, les autres sont la clé étendue de 4 896 octets pour ML-DSA-87.
* **La liaison Python a besoin d'une chaîne d'outils C la première fois** si liboqs n'est pas déjà installée. Le quickstart Python a été exécuté avec liboqs déjà présente.
* **La liaison C n'a ni paquet de registre ni quickstart testé.** Compilez-la depuis le dépôt ; elle nécessite liboqs et OpenSSL.
* **Les tailles de clé sont fixées par le standard.** Une signature ML-DSA-87 fait 4 627 octets et une clé publique 2 592 octets ; il n'existe pas de forme plus petite compatible avec le standard.
* **Anciennes versions.** Utilisez 0.2.1 ou ultérieure : 0.2.0 a introduit `hybridSignBytes` sensible à la version (l'ancienne forme à deux arguments est désormais `hybridSignBytesV1`), et 0.2.1 a ajouté les deux noms de plan de mise à niveau. 0.2.2 et 0.2.3 ont modifié la documentation et les versions de dépendances, avec une sortie identique.
* **L'usage hybride a toujours besoin de l'autre moitié.** Une signature hybride porte aussi une signature secp256k1 ; cette bibliothèque ne produit que la moitié ML-DSA. Les comptes, l'enregistrement et la fenêtre d'autorisation EVM sont des règles de la chaîne documentées dans [Signature post-quantique](/developer-guide/post-quantum-signing) et le [guide EVM](/developer-guide/evm-development#evm-window).
