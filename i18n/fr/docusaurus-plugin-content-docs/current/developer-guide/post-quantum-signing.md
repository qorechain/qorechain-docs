---
slug: /developer-guide/post-quantum-signing
title: Signature post-quantique
sidebar_label: Signature post-quantique
sidebar_position: 8
---

# Signature post-quantique

`qorechain-pqc` est la bibliothèque de cryptographie post-quantique open source, **exclusivement basée sur les standards**, qui sous-tend QoreChain. Elle fournit aux wallets, aux intégrateurs et aux outils exactement les mêmes primitives que celles utilisées par la chaîne — dans six langages, avec une API unique et cohérente, dont la **compatibilité au niveau des octets est prouvée** par une suite de vecteurs de test partagée entre tous les langages.

La bibliothèque encapsule des implémentations auditées des **standards NIST finaux**. Elle n'invente **pas** de schéma sur mesure : une variante non standard est précisément ce qui brise l'interopérabilité (une signature produite à un endroit ne se vérifierait pas à un autre). Chaque binding est validé contre les mêmes vecteurs, de sorte qu'une signature ML-DSA produite dans un langage se vérifie dans tous les autres, que les secrets partagés ML-KEM concordent dans les six langages et que les empreintes SHAKE-256 soient identiques.

* **Dépôt :** [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc)
* **Licence :** Apache-2.0

## Primitives

| Primitive | Standard | Rôle | Niveaux (défaut en **gras**) |
| --- | --- | --- | --- |
| **ML-DSA** | FIPS-204 | signatures numériques | 44 · 65 · **87** |
| **ML-KEM** | FIPS-203 | encapsulation de clés | 512 · 768 · **1024** |
| **SHAKE-256** | FIPS-202 | fonction de hachage à sortie extensible | — |

Ce sont les mêmes primitives que QoreChain exécute au niveau du protocole : signatures **ML-DSA-87 (Dilithium-5)**, encapsulation de clés **ML-KEM-1024** et **SHAKE-256** comme fonction de hachage applicative par défaut. Consultez [Sécurité post-quantique](/architecture/post-quantum-security) pour comprendre comment la chaîne les utilise.

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

> On ne peut pas réduire la taille d'un standard NIST tout en restant standard. ML-DSA-87 a des tailles de clé/signature fixes et des octets fixes — « l'optimiser » produit une variante non standard qu'aucune autre implémentation ne peut vérifier. Pour réduire l'empreinte on-chain, utilisez les leviers présentés plus bas plutôt que de modifier le schéma.

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
Les bindings JavaScript, Rust, Python, Go et Java sont tous **publiés** en version **0.1.1** — installez-les directement depuis npm, crates.io, PyPI, le proxy de modules Go et Maven Central avec les commandes ci-dessus. La distribution Python s'installe sous le nom `qorechain-pqc` mais **s'importe sous `qorpqc`**. Le paquet **Java** est disponible sur Maven Central sous `io.github.qorechain:qorechain-pqc:0.1.1` (backend Bouncy Castle). Le binding **C** est une bibliothèque statique + un en-tête à compiler depuis [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Signature déterministe (critique pour le consensus) {#deterministic-signing}

Depuis la version **0.1.1**, `sign()` produit la variante ML-DSA **déterministe** (FIPS-204 §3.4, où l'aléa de signature est constitué de 32 octets à zéro) dans **les six bindings** — et c'est la seule variante acceptée par la chaîne. Le vérificateur de transactions de QoreChain **rejette les signatures ML-DSA hedged (randomisées)** : une signature hedged échoue donc on-chain même si elle est cryptographiquement valide.

Points essentiels :

* **Ne changez pas le comportement par défaut.** La signature déterministe est critique pour le consensus ; chaque binding la documente comme telle.
* La sortie déterministe est **identique octet par octet dans les six bindings** pour une même clé et un même message — garanti par les vecteurs de test partagés entre langages.
* La signature hedged reste disponible en **opt-in explicite** dans chaque binding (p. ex. `{hedged: true}` en JavaScript, `sign_hedged` en Rust, `mldsaSignHedged` en Java, `sign(..., hedged=True)` en Python) pour les cas d'usage hors chaîne — les signatures hedged ne sont **pas acceptées par la chaîne**.
* La version 0.1.0 du binding JavaScript signait en mode hedged par défaut — si vous avez construit des outils de transaction avec la 0.1.0, **passez à la 0.1.1** ; les transactions signées avec l'ancien comportement par défaut sont rejetées on-chain.

## Dérivation de clé déterministe et récupération {#key-derivation}

La dérivation standard de l'écosystème lie la clé ML-DSA-87 au compte, si bien qu'elle est **récupérable à partir du seul mnémonique du compte** :

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Chaque outil publié (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) dérive cette même clé : un mnémonique produit donc une seule et même clé quel que soit l'outillage. Récupérez une clé en CLI (mnémonique sur stdin) :

```bash
qorechaind tx pqc recover-key mykey qor1youraddress...
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge
```

## Rotation de clé (même algorithme) {#key-rotation}

Depuis la version **v3.1.85** de la chaîne, **`MsgRotatePQCKey`** fait tourner la clé ML-DSA-87 d'un compte **au sein du même algorithme** — auparavant, l'enregistrement était définitif et `MigratePQCKey` ne permettait que de changer d'algorithme. Utilisez-le pour migrer une clé issue de la dérivation legacy vers la dérivation canonique liée à l'adresse, ou pour retirer une clé compromise.

La rotation est **doublement signée** : l'ancienne et la nouvelle clé signent toutes deux le message à séparation de domaine `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Le rejeu est structurellement impossible — une fois la rotation effectuée, l'ancienne clé ne correspond plus à la clé enregistrée, donc le même message ne peut pas être réappliqué. La rotation est une opération **réservée à la clé racine** (jamais délégable à un [authenticator](/developer-guide/account-abstraction#authenticators)), et la transaction elle-même reste signée en mode hybride avec l'*ancienne* clé, ce qui prouve la propriété actuelle du compte.

CLI en une seule commande (mnémonique sur stdin ; récupère l'ancienne clé, dérive ou génère la nouvelle, double-signe, diffuse) :

```bash
# migrate a legacy-derived key to the canonical derivation:
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi -o json -y

# rotate to a brand-new random key (compromise recovery):
qorechaind tx pqc rotate-key --old-derivation adapter --new-random \
  --from mykey --chain-id qorechain-vladi -o json -y
```

En code, `@qorechain/wallet-adapter` (≥0.1.7) et `@qorechain/sdk` (≥0.7.0) exposent le même flux :

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const msg = await rotatePqcKeyMsgFromMnemonic({
  mnemonic, address: "qor1youraddress...", chainId: "qorechain-vladi",
});
// Sign & broadcast with the account's normal hybrid signer (old key cosigns the envelope).
```

Après une rotation réussie, la nouvelle clé signe (code 0) et l'ancienne clé est rejetée (code `pqc` 21).

## API cohérente

Chaque langage fournit la même surface d'API :

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

Des exports spécifiques à chaque niveau sont disponibles lorsque le défaut ne convient pas : `mldsa44/65/87` et `mlkem512/768/1024` (`mldsa` / `mlkem` sont les défauts L5).

Les bindings **Rust, Go, C, Python et Java** reproduisent cette API à l'identique. Par exemple :

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

## Helpers blockchain

Au-delà des primitives brutes, la bibliothèque expose deux helpers dont les intégrateurs ont besoin pour interagir avec les comptes et les transactions QoreChain.

### `pubkeyHash(pk, len=20)`

Un helper d'enregistrement **pay-to-pubkey-hash**. Il produit un hachage SHAKE-256 court (20–32 octets) d'une clé publique. Le principe : ne stocker que le `pubkeyHash` dans l'état du compte et exiger la clé publique complète dans la transaction. L'état du compte reste minuscule malgré une clé de 1 à 2,5 Ko.

### `hybridSignBytes(bodyWithoutPqcExt, authInfo)`

Le **cadrage des sign-bytes à extension hybride** de QoreChain, compatible avec les wallets. Il produit exactement les octets qui doivent être signés avec ML-DSA-87 (Dilithium-5) pour constituer la moitié PQC d'une transaction hybride.

C'est l'élément que les wallets et les intégrateurs utilisent pour produire la **signature hybride requise** sur le chemin de transaction cosmos. Dans la version actuelle de la chaîne, les signatures hybrides sont **requises par défaut** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) : chaque transaction du chemin cosmos doit porter une signature Dilithium-5 en plus de sa signature classique secp256k1. Consultez [Sécurité post-quantique](/architecture/post-quantum-security) pour le modèle d'application de cette règle.

La signature classique secp256k1 est calculée sur les sign bytes standard (qui **excluent** l'extension PQC), et la signature ML-DSA-87 est calculée puis attachée en tant qu'extension `PQCHybridSignature`. Comme les sign bytes classiques excluent l'extension, la signature classique reste valide, que le vérificateur comprenne ou non la partie PQC.

Il existe trois façons de produire cette signature hybride :

* **La CLI** — `qorechaind tx pqc cosign` attache la cosignature Dilithium-5 à une transaction (après `qorechaind tx pqc gen-key`). Voir [Commandes de transaction](/cli-reference/transaction-commands).
* **Le SDK QoreChain** — `buildHybridTx` (avec `includePqcPublicKey`) fait l'équivalent en TypeScript/Python/Go/Rust. Voir [Comptes SDK et signature PQC](/sdk/concepts/accounts-pqc).
* **`qorechain-pqc` directement** — utilisez `hybridSignBytes` pour cadrer les sign bytes et `mldsa.sign` pour produire la signature Dilithium-5, lorsque vous construisez des outils en dehors du SDK dans l'un des six langages pris en charge.

## Optimiser l'empreinte on-chain

Les clés et signatures ML-DSA sont volumineuses au regard des standards classiques. Les octets d'un standard étant fixes, la façon de maintenir une empreinte on-chain réduite consiste à utiliser ces trois leviers — dont aucun n'altère le standard :

1. **Choisissez le niveau de sécurité de manière délibérée.** Les signatures ML-DSA-65 (L3) sont environ 28 % plus petites que celles de ML-DSA-87 (L5) tout en restant très robustes ; les textes chiffrés ML-KEM-768 sont plus petits que ceux du niveau 1024. Choisissez selon le cas d'usage.
2. **Pay-to-pubkey-hash.** Ne stockez que `pubkeyHash(pk)` (20–32 octets de SHAKE-256) dans l'état du compte et exigez la clé publique complète dans la transaction. L'état du compte reste minuscule quelle que soit la taille de la clé.
3. **Vérifier puis jeter les signatures.** Une signature doit figurer dans la transaction (données de bloc) mais ne doit jamais être écrite dans l'arbre d'état persistant.

> **Pourquoi pas Falcon ?** FN-DSA (Falcon) offrirait des signatures plus petites, mais il est délibérément **exclu** : FN-DSA correspond au *brouillon* FIPS-206 (non final), et une bibliothèque exclusivement basée sur les standards ne fournit que des standards finalisés. La question pourra être réexaminée une fois FIPS-206 finalisé.

## Voir aussi

* [Sécurité post-quantique](/architecture/post-quantum-security) — comment la chaîne utilise ces primitives et impose les signatures hybrides.
* [Commandes de transaction](/cli-reference/transaction-commands) — le flux CLI `tx pqc gen-key` / `tx pqc cosign`.
* [Comptes SDK et signature PQC](/sdk/concepts/accounts-pqc) — clés et signature hybride depuis le SDK QoreChain.
* [Configuration du wallet](/getting-started/wallet-setup) — créer et gérer des comptes protégés par PQC.
