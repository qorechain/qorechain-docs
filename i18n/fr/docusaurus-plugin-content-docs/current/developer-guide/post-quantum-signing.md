---
slug: /developer-guide/post-quantum-signing
title: Signature post-quantique
sidebar_label: Signature post-quantique
sidebar_position: 8
---

# Signature post-quantique

`qorechain-pqc` est la bibliothèque de cryptographie post-quantique open source, **conforme uniquement aux standards**, qui sous-tend QoreChain. Elle fournit aux portefeuilles, intégrateurs et outils exactement les primitives utilisées par la chaîne — dans six langages, avec une API cohérente unique, **dont la compatibilité au niveau des octets est prouvée** par une suite partagée de vecteurs de test inter-langages.

La bibliothèque encapsule des implémentations auditées des **standards NIST définitifs**. Elle n'invente **pas** de schéma personnalisé : une variante non standard est précisément ce qui casse l'interopérabilité (une signature produite à un endroit ne se vérifierait pas à un autre). Chaque binding est validé par rapport aux mêmes vecteurs, de sorte qu'une signature ML-DSA produite dans un langage se vérifie dans tous les autres, que les secrets partagés ML-KEM concordent entre les six, et que les empreintes SHAKE-256 sont identiques.

* **Dépôt :** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licence :** Apache-2.0

## Primitives

| Primitive | Standard | Rôle | Niveaux (par défaut en **gras**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | signatures numériques | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | encapsulation de clé | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | hachage à sortie extensible | — |

Ce sont les mêmes primitives que QoreChain exécute au niveau du protocole : signatures **ML-DSA-87 (Dilithium-5)**, encapsulation de clé **ML-KEM-1024**, et **SHAKE-256** comme hachage applicatif par défaut. Voir [Sécurité post-quantique](/architecture/post-quantum-security) pour la façon dont la chaîne les utilise.

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

> Vous ne pouvez pas rendre un standard NIST plus petit tout en restant conforme. ML-DSA-87 a des tailles de clé/signature fixes et des octets fixes — « l'optimiser » produit une variante non standard qu'aucune autre implémentation ne peut vérifier. Pour réduire l'empreinte on-chain, utilisez les leviers ci-dessous plutôt que de modifier le schéma.

## Langages et paquets

Chaque langage expose la même API, chacun s'appuyant sur une implémentation auditée différente. C'est ce qui garantit la compatibilité au niveau des octets — des backends indépendants s'accordent sur le standard.

| Langage | Paquet | Installation | Soutenu par |
| --- | --- | --- | --- |
| JavaScript / TypeScript | `@qorechain/pqc` (npm) | `npm i @qorechain/pqc` | [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) |
| Rust | `qorechain-pqc` (crates.io) | `cargo add qorechain-pqc` | `fips204` · `fips203` · `sha3` |
| Python | `qorechain-pqc` (PyPI) | `pip install qorechain-pqc` (import `qorpqc`) | [liboqs-python](https://github.com/open-quantum-safe/liboqs-python) |
| Go | `github.com/qorechain/qorechain-pqc/go` | `go get github.com/qorechain/qorechain-pqc/go` | [Cloudflare CIRCL](https://github.com/cloudflare/circl) |
| C | `c/` (bibliothèque statique + en-tête) | compilez depuis le [dépôt](https://github.com/qorechain/qorechain-pqc) | [liboqs](https://github.com/open-quantum-safe/liboqs) + OpenSSL |
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.1.0` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilité
Les bindings JavaScript, Rust, Python, Go et Java sont tous **publiés** en version **0.1.0** — installez-les directement depuis npm, crates.io, PyPI, le proxy de modules Go et Maven Central avec les commandes ci-dessus. La distribution Python s'installe sous `qorechain-pqc` mais **s'importe sous `qorpqc`**. Le paquet **Java** est sur Maven Central sous `io.github.qorechain:qorechain-pqc:0.1.0` (backend Bouncy Castle). Le binding **C** est une bibliothèque statique + un en-tête que vous compilez depuis [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## API cohérente

Chaque langage offre la même surface :

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

Des exports spécifiques à chaque niveau sont disponibles lorsque la valeur par défaut ne vous convient pas : `mldsa44/65/87` et `mlkem512/768/1024` (`mldsa` / `mlkem` sont les valeurs L5 par défaut).

Les bindings **Rust, Go, C, Python et Java** reflètent exactement ceci. Par exemple :

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

## Aides blockchain

Au-delà des primitives brutes, la bibliothèque expose deux aides dont les intégrateurs ont besoin pour interagir avec les comptes et transactions QoreChain.

### `pubkeyHash(pk, len=20)`

Une aide d'enregistrement **pay-to-pubkey-hash**. Elle produit un hachage SHAKE-256 court (20 à 32 octets) d'une clé publique. Le principe : ne stocker que le `pubkeyHash` dans l'état du compte et exiger la clé publique complète dans la transaction. L'état du compte reste minuscule quelle que soit la clé de 1 à 2,5 Ko.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

Le **cadrage des sign-bytes de l'extension hybride** compatible avec les portefeuilles de QoreChain. Cela produit exactement les octets qui doivent être signés avec ML-DSA-87 (Dilithium-5) pour former la moitié PQC d'une transaction hybride.

C'est l'élément que les portefeuilles et intégrateurs utilisent pour produire la **signature hybride requise** sur le chemin de transaction cosmos. Depuis la version actuelle de la chaîne, les signatures hybrides sont **requises par défaut** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) : chaque transaction sur le chemin cosmos doit porter une signature Dilithium-5 aux côtés de sa signature classique secp256k1. Voir [Sécurité post-quantique](/architecture/post-quantum-security) pour le modèle d'application.

La signature classique secp256k1 est calculée sur les sign bytes standard (qui **excluent** l'extension PQC), et la signature ML-DSA-87 est calculée et attachée en tant qu'extension `PQCHybridSignature`. Comme les sign bytes classiques excluent l'extension, la signature classique reste valide, qu'un vérificateur comprenne ou non la partie PQC.

Il existe trois façons de produire cette signature hybride :

* **La CLI** — `qorechaind tx pqc cosign` attache la cosignature Dilithium-5 à une transaction (après `qorechaind tx pqc gen-key`). Voir [Commandes de transaction](/cli-reference/transaction-commands).
* **Le QoreChain SDK** — `buildHybridTx` (avec `includePqcPublicKey`) fait l'équivalent en TypeScript/Python/Go/Rust. Voir [Comptes & signature PQC du SDK](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` directement** — utilisez `hybridSignBytes` pour cadrer les sign bytes et `mldsa.sign` pour produire la signature Dilithium-5, lorsque vous construisez des outils en dehors du SDK dans l'un des six langages pris en charge.

## Optimisation de l'empreinte on-chain

Les clés et signatures ML-DSA sont volumineuses selon les standards classiques. Comme les octets d'un standard sont fixes, la façon de maintenir l'empreinte on-chain réduite consiste à utiliser ces trois leviers — dont aucun ne modifie le standard :

1. **Choisissez le niveau de sécurité délibérément.** Les signatures ML-DSA-65 (L3) sont environ 28 % plus petites que les ML-DSA-87 (L5) et restent très solides ; les textes chiffrés ML-KEM-768 sont plus petits que ceux de 1024. Choisissez selon le cas d'usage.
2. **Pay-to-pubkey-hash.** Ne stockez que `pubkeyHash(pk)` (20 à 32 octets de SHAKE-256) dans l'état du compte et exigez la clé publique complète dans la transaction. L'état du compte reste minuscule quelle que soit la taille de la clé.
3. **Signatures à vérifier puis jeter.** Une signature doit figurer dans la transaction (données du bloc) mais ne devrait jamais être écrite dans l'arbre d'état persistant.

> **Pourquoi pas Falcon ?** FN-DSA (Falcon) donnerait des signatures plus petites, mais il est intentionnellement **exclu** : FN-DSA est un *brouillon* FIPS-206 (non définitif), et une bibliothèque conforme uniquement aux standards ne livre que des standards finalisés. Il pourra être réexaminé une fois FIPS-206 finalisé.

## Voir aussi

* [Sécurité post-quantique](/architecture/post-quantum-security) — comment la chaîne utilise ces primitives et applique les signatures hybrides.
* [Commandes de transaction](/cli-reference/transaction-commands) — le flux CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Comptes & signature PQC du SDK](/sdk/concepts/accounts-pqc) — clés et signature hybride depuis le QoreChain SDK.
* [Configuration du portefeuille](/getting-started/wallet-setup) — créez et gérez des comptes adossés à la PQC.
