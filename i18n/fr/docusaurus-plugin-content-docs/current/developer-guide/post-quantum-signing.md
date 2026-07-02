---
slug: /developer-guide/post-quantum-signing
title: Signature post-quantique
sidebar_label: Signature post-quantique
sidebar_position: 8
---

# Signature post-quantique

`qorechain-pqc` est la bibliothèque de cryptographie post-quantique open source, **exclusivement fondée sur les standards**, qui sous-tend QoreChain. Elle fournit aux portefeuilles, aux intégrateurs et aux outils exactement les mêmes primitives que celles utilisées par la chaîne — dans six langages, avec une API unique et cohérente, dont la **compatibilité au niveau des octets est prouvée** grâce à une suite partagée de vecteurs de test inter-langages.

La bibliothèque encapsule des implémentations auditées des **standards NIST finaux**. Elle n'invente **pas** de schéma personnalisé : une variante non standard est précisément ce qui casse l'interopérabilité (une signature produite à un endroit ne se vérifierait pas à un autre). Chaque binding est validé contre les mêmes vecteurs, de sorte qu'une signature ML-DSA produite dans un langage se vérifie dans tous les autres, que les secrets partagés ML-KEM correspondent entre les six langages, et que les empreintes SHAKE-256 soient identiques.

* **Dépôt :** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licence :** Apache-2.0

## Primitives

| Primitive | Standard | Rôle | Niveaux (défaut en **gras**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | signatures numériques | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | encapsulation de clés | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | fonction de hachage à sortie extensible | — |

Ce sont les mêmes primitives que QoreChain exécute au niveau du protocole : signatures **ML-DSA-87 (Dilithium-5)**, encapsulation de clés **ML-KEM-1024**, et **SHAKE-256** comme fonction de hachage applicative par défaut. Consultez [Sécurité post-quantique](/architecture/post-quantum-security) pour voir comment la chaîne les utilise.

### Tailles (octets)

Choisissez le niveau de sécurité selon votre budget taille/sécurité.

| Schéma | Sécurité | Clé publique | Signature / Texte chiffré |
| --- | --- | --- | --- |
| ML-DSA-44 | L2 | 1312 | 2420 |
| ML-DSA-65 | L3 | 1952 | 3309 |
| **ML-DSA-87** | L5 | 2592 | 4627 |
| ML-KEM-512 | L1 | 800 | 768 |
| ML-KEM-768 | L3 | 1184 | 1088 |
| **ML-KEM-1024** | L5 | 1568 | 1568 |

> On ne peut pas rendre un standard NIST plus petit tout en restant standard. ML-DSA-87 a des tailles de clé/signature fixes et des octets fixes — « l'optimiser » produit une variante non standard qu'aucune autre implémentation ne peut vérifier. Pour réduire l'empreinte on-chain, utilisez les leviers décrits ci-dessous plutôt que de modifier le schéma.

## Langages et paquets

Chaque langage expose la même API, chacun s'appuyant sur une implémentation auditée différente. C'est ce qui garantit la compatibilité au niveau des octets — des backends indépendants s'accordent sur le standard.

| Langage | Paquet | Installation | Basé sur |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (bibliothèque statique + en-tête) | à compiler depuis le [dépôt](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.1` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilité
Les bindings JavaScript, Rust, Python, Go et Java sont tous **publiés** en version **0.1.1** — installez-les directement depuis npm, crates.io, PyPI, le proxy de modules Go et Maven Central avec les commandes ci-dessus. La distribution Python s'installe sous le nom `qorechain-pqc` mais **s'importe sous `qorpqc`**. Le paquet **Java** est disponible sur Maven Central sous `io.github.qorechain:qorechain-pqc:0.1.1` (backend Bouncy Castle). Le binding **C** est une bibliothèque statique + en-tête à compiler depuis [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Signature déterministe (critique pour le consensus) {#deterministic-signing}

Depuis la version **0.1.1**, `sign()` produit la variante ML-DSA **déterministe** (FIPS-204 §3.4, où l'aléa de signature est constitué de 32 octets à zéro) dans **les six bindings** — et c'est la seule variante que la chaîne accepte. Le vérificateur de transactions de QoreChain **rejette les signatures ML-DSA « hedged » (randomisées)** : une signature hedged échoue donc on-chain même si elle est cryptographiquement valide.

Points essentiels :

* **Ne modifiez pas le comportement par défaut.** La signature déterministe est critique pour le consensus ; chaque binding la documente comme telle.
* La sortie déterministe est **identique octet par octet dans les six bindings** pour une même clé et un même message — garanti par les vecteurs de test inter-langages partagés.
* La signature hedged reste disponible en **opt-in explicite** dans chaque binding (p. ex. `{hedged: true}` en JavaScript, `sign_hedged` en Rust, `mldsaSignHedged` en Java, `sign(..., hedged=True)` en Python) pour les cas d'usage hors chaîne — les signatures hedged ne sont **pas acceptées par la chaîne**.
* La version 0.1.0 du binding JavaScript signait en mode hedged par défaut — si vous avez construit des outils de transaction avec 0.1.0, **passez à 0.1.1** ; les transactions signées avec l'ancien comportement par défaut sont rejetées on-chain.

## API cohérente

Chaque langage fournit la même surface :

```text
keygen()                              -> (publicKey, secretKey)
sign(secretKey, message)              -> signature
verify(publicKey, message, signature) -> bool

kem.keygen()                          -> (publicKey, secretKey)
kem.encapsulate(publicKey)            -> (cipherText, sharedSecret)
kem.decapsulate(secretKey, cipherText)-> sharedSecret

shake256(data, outLen=32)             -> digest
```

### Démarrage rapide (JavaScript / TypeScript)

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

Des exports spécifiques par niveau sont disponibles lorsque le défaut ne vous convient pas : `mldsa44/65/87` et `mlkem512/768/1024` (`mldsa` / `mlkem` sont les défauts L5).

Les bindings **Rust, Go, C, Python et Java** reproduisent cela exactement. Par exemple :

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

## Utilitaires blockchain

Au-delà des primitives brutes, la bibliothèque expose deux utilitaires dont les intégrateurs ont besoin pour interagir avec les comptes et les transactions QoreChain.

### `pubkeyHash(pk, len=20)`

Un utilitaire d'enregistrement **pay-to-pubkey-hash**. Il produit un hachage SHAKE-256 court (20–32 octets) d'une clé publique. Le principe : ne stocker que le `pubkeyHash` dans l'état du compte et exiger la clé publique complète dans la transaction. L'état du compte reste minuscule quelle que soit la taille de la clé (1–2,5 Ko).

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

Le cadrage des sign-bytes de l'**extension hybride** de QoreChain, compatible avec les portefeuilles. Il produit exactement les octets qui doivent être signés avec ML-DSA-87 (Dilithium-5) pour former la moitié PQC d'une transaction hybride.

C'est la brique que les portefeuilles et les intégrateurs utilisent pour produire la **signature hybride requise** sur le chemin de transaction cosmos. Dans la version actuelle de la chaîne, les signatures hybrides sont **requises par défaut** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) : chaque transaction sur le chemin cosmos doit porter une signature Dilithium-5 en plus de sa signature classique secp256k1. Consultez [Sécurité post-quantique](/architecture/post-quantum-security) pour le modèle d'application.

La signature classique secp256k1 est calculée sur les sign bytes standard (qui **excluent** l'extension PQC), et la signature ML-DSA-87 est calculée puis attachée en tant qu'extension `PQCHybridSignature`. Comme les sign bytes classiques excluent l'extension, la signature classique reste valide qu'un vérificateur comprenne ou non la partie PQC.

Il existe trois façons de produire cette signature hybride :

* **La CLI** — `qorechaind tx pqc cosign` attache la cosignature Dilithium-5 à une transaction (après `qorechaind tx pqc gen-key`). Consultez [Commandes de transaction](/cli-reference/transaction-commands).
* **Le SDK QoreChain** — `buildHybridTx` (avec `includePqcPublicKey`) fait l'équivalent en TypeScript/Python/Go/Rust. Consultez [Comptes SDK et signature PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` directement** — utilisez `hybridSignBytes` pour cadrer les sign bytes et `mldsa.sign` pour produire la signature Dilithium-5, lorsque vous construisez des outils en dehors du SDK dans l'un des six langages pris en charge.

## Optimiser l'empreinte on-chain

Les clés et signatures ML-DSA sont volumineuses par rapport aux standards classiques. Comme les octets d'un standard sont fixes, la manière de garder une empreinte on-chain réduite consiste à utiliser ces trois leviers — dont aucun ne modifie le standard :

1. **Choisissez le niveau de sécurité de manière délibérée.** Les signatures ML-DSA-65 (L3) sont environ 28 % plus petites que ML-DSA-87 (L5) tout en restant très robustes ; les textes chiffrés ML-KEM-768 sont plus petits que ceux de 1024. Choisissez au cas par cas.
2. **Pay-to-pubkey-hash.** Ne stockez que `pubkeyHash(pk)` (20–32 octets de SHAKE-256) dans l'état du compte et exigez la clé publique complète dans la transaction. L'état du compte reste minuscule quelle que soit la taille de la clé.
3. **Vérifier puis jeter les signatures.** Une signature doit figurer dans la transaction (données de bloc) mais ne doit jamais être écrite dans l'arbre d'état persistant.

> **Pourquoi pas Falcon ?** FN-DSA (Falcon) donnerait des signatures plus petites, mais il est intentionnellement **exclu** : FN-DSA est le *brouillon* FIPS-206 (non final), et une bibliothèque exclusivement fondée sur les standards ne livre que des standards finalisés. La question pourra être réexaminée une fois FIPS-206 finalisé.

## Voir aussi

* [Sécurité post-quantique](/architecture/post-quantum-security) — comment la chaîne utilise ces primitives et applique les signatures hybrides.
* [Commandes de transaction](/cli-reference/transaction-commands) — le flux CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Comptes SDK et signature PQC](/sdk/concepts/accounts-pqc) — clés et signature hybride depuis le SDK QoreChain.
* [Configuration du portefeuille](/getting-started/wallet-setup) — créer et gérer des comptes protégés par PQC.
