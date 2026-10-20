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
| Java | `io.github.qorechain:qorechain-pqc` (Maven Central) | `io.github.qorechain:qorechain-pqc:0.2.3` | [Bouncy Castle](https://www.bouncycastle.org/) |

:::info Disponibilité
Les bindings JavaScript, Rust, Python, Go et Java sont tous **publiés** en version **0.2.3** (npm, crates.io, PyPI, le proxy de modules Go sous `v0.2.3`, et Maven Central ; vérifié le 21 octobre 2026). Installez-les avec les commandes ci-dessus. La distribution Python s'installe sous le nom `qorechain-pqc` mais **s'importe sous `qorpqc`**. Le paquet **Java** est `io.github.qorechain:qorechain-pqc:0.2.3` (backend Bouncy Castle). La version **0.2.0** a ajouté `hybridSignBytes` sensible à la version (voir ci-dessous), la **0.2.1** a corrigé le nom de mise à niveau qui marque le passage à v2 pour le mainnet, et la **0.2.2** a corrigé la documentation et les commentaires sur la signature hedged par rapport à la signature déterministe (la chaîne accepte les deux ; dans le binding JavaScript, seule la constante de version a changé dans le code) ; la **0.2.3** met à jour les dépendances cryptographiques (Bouncy Castle en Java, `@noble/post-quantum` en JavaScript) avec une sortie identique. Utilisez la 0.2.1 ou une version ultérieure. Le binding **C** est une bibliothèque statique + un en-tête à compiler depuis [`github.com/qorechain/qorechain-pqc`](https://github.com/qorechain/qorechain-pqc).
:::

## Signature déterministe (par défaut) {#deterministic-signing}

Depuis la version **0.1.1** (et dans toutes les versions ultérieures), `sign()` produit la variante ML-DSA **déterministe** (FIPS-204 §3.4, où l'aléa de signature est constitué de 32 octets à zéro) dans **les six bindings**. La chaîne accepte toute signature ML-DSA-87 valide selon FIPS-204, hedged ou déterministe : la vérification est identique pour les deux, et un vérificateur ne peut pas les distinguer sans la clé secrète. Les bindings signent de manière déterministe par défaut pour que la même transaction produise toujours la même signature et le même hash de tx, et pour que chaque binding corresponde aux vecteurs partagés.

Points clés :

* La sortie déterministe est **identique octet pour octet dans les six bindings** pour la même clé et le même message, verrouillée par des vecteurs de test partagés entre langages.
* La signature hedged reste disponible en **opt-in explicite** dans chaque binding (par ex. `{hedged: true}` en JavaScript, `sign_hedged` en Rust, `mldsaSignHedged` en Java, `sign(..., hedged=True)` en Python). Les signatures hedged sont **acceptées par la chaîne** comme toute signature FIPS-204 valide ; la seule différence est que la signature, et donc le hash de tx, change à chaque signature.
* La version 0.1.0 du binding JavaScript signait en hedged par défaut. Ces signatures sont elles aussi valides on-chain ; passez à la 0.1.1 si vous voulez des signatures reproductibles conformes aux vecteurs partagés.

## Enregistrer votre clé {#pqc-key-registration}

Chaque compte enregistre sa clé publique ML-DSA-87 **une seule fois, explicitement**. Il n'existe pas d'enregistrement automatique : une clé publique intégrée à une transaction hybride ultérieure (par exemple l'option `includePqcPublicKey` du SDK) est transportée dans l'extension mais ne l'enregistre **pas**. Un **premier** enregistrement est la seule transaction du lane Cosmos qui peut être signée de façon classique, afin qu'un tout nouveau compte puisse amorcer sa première clé ; un compte qui possède déjà une clé doit signer en mode hybride chaque message de clé ultérieur. Faites-le avec le `qorechaind` de la release (un binaire compilé depuis les sources publiques ne peut pas signer ; voir [Compilation depuis les sources](/developer-guide/building-from-source)), avec QoreX, ou avec `ensurePqcRegistered` du SDK :

```bash
# 1. Create a key. It is stored unencrypted under ~/.qorechaind/pqc/mypqc.dilithium (mode 0600) and the public key hex is printed.
qorechaind tx pqc gen-key mypqc

# 2. Register the public key on your account (classical-signed, because the account has no key yet).
#    --pqc-key mypqc also attaches the optional proof of possession (see below).
qorechaind tx pqc register-key-v2 dilithium5 <printed-pubkey-hex> hybrid --pqc-key mypqc \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -y

# 3. Verify.
qorechaind query pqc account <address>
```

Définissez `--gas` explicitement : la clé publique de 2 592 octets peut dépasser les 200 000 de gas par défaut (les enregistrements sur le mainnet ont consommé environ 220 000 à 310 000 ; un enregistrement avec preuve de possession transporte une signature supplémentaire de 4 627 octets, soit environ 46 000 de gas de plus), et les frais doivent être d'au moins gas × 0,1 uqor, si bien que `--gas 600000` exige `--fees 60000uqor` ou plus. L'ancienne forme `qorechaind tx pqc register-key <pubkey-hex> hybrid` est équivalente pour Dilithium-5. Ensuite, construisez chaque transaction du lane Cosmos avec `--generate-only` et signez-la avec `qorechaind tx pqc cosign`. Le fichier de clé est la clé de signature post-quantique du compte : quiconque peut le lire peut cosigner pour le compte avec la clé classique, sauvegardez-le donc comme le mnémonique (il peut être redérivé à partir du mnémonique, voir ci-dessous).

Une clé enregistrée est aussi la première de deux conditions pour envoyer des transactions EVM ; la seconde est une [fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window) ouverte.

### Ce que la chaîne vérifie à l'enregistrement (mainnet v3.2.3 et ultérieures) {#key-integrity}

Depuis la mise à niveau v3.2.3 (appliquée sur le mainnet à la hauteur 3,662,051 le 20 octobre 2026), la chaîne vérifie la clé elle-même, et pas seulement qu'elle a la bonne longueur :

| Règle | Refus (codespace `pqc`) |
| --- | --- |
| `key_type` doit être `hybrid` ou `pqc_only` ; `classical_only` n'enregistre aucune clé post-quantique et laisserait le compte incapable de signer à nouveau | code 230 |
| Une clé qui n'offre aucune protection post-quantique (une clé dégénérée pour laquelle personne n'a besoin d'un secret) est refusée, aussi bien à l'enregistrement qu'à la rotation et à la migration | code 230 |
| Une clé que le compte a déjà utilisée ne peut être ni enregistrée de nouveau ni rétablie par rotation (le compte se souvient des clés retirées) | code 232 |
| La clé classique de l'enregistrement doit être la propre clé secp256k1 compressée du signataire (depuis la v3.2.2) | code 45 |
| Une preuve de possession facultative, si elle est présente, doit se vérifier | code 231 |
| Un compte qui détient déjà une clé doit signer en mode hybride tout autre message de clé (enregistrement, migration) ; seule la réparation d'un enregistrement ne contenant aucune clé utilisable peut être classique | code 234 |
| Déprécier ou désactiver un algorithme ne peut pas laisser la chaîne sans algorithme de signature actif | code 233 |

En outre, depuis la v3.2.3, aucun des messages de clé (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgRotatePQCKey`, `MsgMigratePQCKey`) ne peut être envoyé pour le compte d'un autre via `authz` ; une transaction ne peut porter qu'**une seule** extension de signature hybride ; et un compte qui n'a **aucune** clé enregistrée ne peut plus joindre une extension hybride qui n'a rien contre quoi se vérifier (seul un enregistrement peut passer, exactement comme sans aucune extension).

### Preuve de possession (facultative) {#proof-of-possession}

Un enregistrement peut aussi prouver que son auteur détient le secret de la nouvelle clé. La clé signe `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>` (l'identifiant d'algorithme est `1` pour ML-DSA-87 ; la clé publique est en hexadécimal minuscule) et la signature est placée dans le champ `proof_of_possession` de `MsgRegisterPQCKeyV2`. Avec la CLI, `register-key-v2 ... --pqc-key <name>` la construit et la joint. Avec le SDK TypeScript 0.9.0, `ensurePqcRegistered` joint la preuve automatiquement dès que le réseau a appliqué v3.2.3 (et `signProofOfPossession` / `verifyProofOfPossession` permettent d'en construire et d'en vérifier une à la main) ; `@qorechain/chain-bridge` 0.2.3 fait de même lorsqu'on lui fournit `cosmosRest`. `@qorechain/wallet-adapter` (0.4.0) et les versions du SDK antérieures à 0.9.0 n'en joignent pas ; un enregistrement effectué avec eux n'en porte donc aucune, ce que la chaîne accepte toujours. La chaîne vérifie la preuve **lorsqu'elle est présente** et refuse l'enregistrement si elle ne se vérifie pas (code 231) ; un enregistrement sans preuve est toujours accepté sur le mainnet. Comme le message nomme la chaîne, l'algorithme, le compte et la clé, une preuve établie pour l'un d'eux ne prouve rien pour un autre.

**Indicateur de possession et validateurs de bridge (v3.2.4).** L'enregistrement du compte indique si la clé actuelle du compte a été prouvée : `possession_proven`, dans `GET /qorechain/pqc/v1/account/{address}`. Il vaut `true` lorsque la clé a été enregistrée avec une preuve de possession vérifiée, ou installée par une rotation (la nouvelle clé signe la rotation, ce qui la prouve) ; il reste `false` pour un compte enregistré sans preuve. L'indicateur ne change rien à qui peut envoyer ou recevoir. L'enregistrement d'un **validateur de bridge** exige en outre une preuve de possession de la clé post-quantique du validateur (`proof_of_possession` dans l'enregistrement ; la clé signe `qorechain-pqc-pop-v1|<chain-id>|1|<validator address>|<public key hex>`, avec l'option CLI `--pqc-key`), et deux validateurs de bridge ne peuvent pas enregistrer la même clé. Le bridge cross-chain lui-même n'est pas en production. Ces deux changements sont sur le testnet depuis le 19 octobre 2026 et sur le mainnet à partir de la hauteur 3,742,566 (proposition de gouvernance 13) : le mainnet exécute la v3.2.3 jusqu'à ce bloc et la v3.2.4 à partir de celui-ci.

## Codes de refus (codespace `pqc`) {#pqc-codes}

| Code | Signification |
| --- | --- |
| 20 | Signature hybride requise : la transaction ne porte aucune extension PQC (seuls un premier enregistrement et un unjail par un compte sans clé en sont exemptés) |
| 21 | La moitié ML-DSA-87 ne s'est pas vérifiée, voir [ci-dessous](#code-21) |
| 26, 27, 28 | Lane EVM : pas de fenêtre ouverte ou pas de clé / fenêtre épuisée / bornes de fenêtre invalides, voir [Développement EVM](/developer-guide/evm-development#evm-window) |
| 45 | La clé classique d'un enregistrement n'est pas la propre clé secp256k1 compressée du signataire |
| 60, 61 | Délégation EIP-7702 : aucun consentement post-quantique pour cette délégation / demande de délégation invalide |
| 62, 63 | Un compte délégué n'a aucune fenêtre couvrant l'action / une transaction Ethereum ne s'exécute que sur le lane EVM |
| 230 | Clé faible ou enregistrement `classical_only` |
| 231 | La preuve de possession ne se vérifie pas |
| 232 | La clé a déjà été utilisée par ce compte |
| 233 | Aucun algorithme de signature actif ne subsisterait |
| 234 | La maintenance de clé depuis un compte disposant d'une clé exige la signature hybride |

## Dépannage du code `pqc` 21 (`hybrid_verify_failed`) {#code-21}

Le code 21 signifie que la moitié ML-DSA-87 d'une signature hybride n'a pas été vérifiée avec la clé enregistrée du compte. Le choix entre signature hedged et déterministe n'en est **jamais** la cause. Vérifiez, dans cet ordre :

1. **Version des sign-bytes.** La signature PQC couvre les sign-bytes v1 ou v2, et un réseau vérifie exactement une forme à chaque hauteur : `qorechain-diana` est passé en v2 lors de sa mise à niveau `v3.1.98`, `qorechain-vladi` lors de sa mise à niveau `v3.2.0`, et les chaînes créées ensuite sont en v2 dès la genèse. Les SDK actuels choisissent la forme par réseau ; un signataire fait maison doit demander au nœud quelle mise à niveau est appliquée (voir [Comptes et signature PQC](/sdk/concepts/accounts-pqc)).
2. **Chain-id dans les sign-bytes v2.** v2 lie le chain-id : une signature faite pour `qorechain-diana` ne se vérifie pas sur `qorechain-vladi`, et inversement.
3. **Bibliothèque PQC obsolète.** Les builds antérieurs au standard (pré-FIPS-204) produisent des signatures qu'un vérificateur conforme rejette. Utilisez `qorechain-pqc` 0.1.1 ou ultérieur.
4. **Mauvaise clé.** La clé publique doit être celle enregistrée pour le compte (`GET /qorechain/pqc/v1/account/{address}`). Une clé issue d'une autre dérivation (par exemple l'ancienne dérivation du bridge `shake256(mnemonic)` au lieu de celle liée à l'adresse) signe de manière valide mais ne correspond pas. Voir [Rotation de clé](#key-rotation) pour passer à la clé canonique.

## Dérivation de clé déterministe et récupération {#key-derivation}

La dérivation standard de l'écosystème lie la clé ML-DSA-87 au compte, si bien qu'elle est **récupérable à partir du seul mnémonique du compte** :

```
seed = SHAKE-256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic)
(publicKey, secretKey) = mldsa.keygen(seed)
```

Chaque outil publié (`@qorechain/wallet-adapter`, `@qorechain/sdk`, `@qorechain/chain-bridge` ≥0.1.1) dérive cette même clé : un mnémonique produit donc une seule et même clé quel que soit l'outillage. Récupérez une clé en CLI (mnémonique sur stdin) :

```bash
# the mnemonic is read from stdin; keep it out of shell history by redirecting from a file you delete afterwards
qorechaind tx pqc recover-key mykey qor1youraddress... < mnemonic.txt
# legacy tooling derivation (shake256(mnemonic) only, unbound to the address):
qorechaind tx pqc recover-key mykey qor1youraddress... --derivation bridge < mnemonic.txt
```

La clé privée récupérée est écrite en hexadécimal non chiffré (mode 0600) dans `<home>/pqc/mykey.dilithium` pour être utilisée avec `tx pqc cosign`.

## Rotation de clé (même algorithme) {#key-rotation}

Depuis la version **v3.1.85** de la chaîne, **`MsgRotatePQCKey`** fait tourner la clé ML-DSA-87 d'un compte **au sein du même algorithme** — auparavant, l'enregistrement était définitif et `MigratePQCKey` ne permettait que de changer d'algorithme. Utilisez-le pour migrer une clé issue de la dérivation legacy vers la dérivation canonique liée à l'adresse, ou pour retirer une clé compromise.

La rotation est **doublement signée** : l'ancienne et la nouvelle clé signent toutes deux le message à séparation de domaine `"qorechain-pqc-rotate-v1|chainId|algorithm|account|oldPubHex|newPubHex"`. Le rejeu est structurellement impossible — une fois la rotation effectuée, l'ancienne clé ne correspond plus à la clé enregistrée, donc le même message ne peut pas être réappliqué. La rotation est une opération **réservée à la clé racine** (jamais délégable à un [authenticator](/developer-guide/account-abstraction#authenticators)), et la transaction elle-même reste signée en mode hybride avec l'*ancienne* clé, ce qui prouve la propriété actuelle du compte.

CLI en une seule commande (mnémonique sur stdin ; récupère l'ancienne clé, dérive ou génère la nouvelle, double-signe, diffuse) :

```bash
# migrate a legacy-derived key to the canonical derivation (mnemonic on stdin):
qorechaind tx pqc rotate-key --old-derivation bridge --new-derivation adapter \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt

# rotate to a brand-new random key (compromise recovery); --new-key-out is required and is written before anything is sent:
qorechaind tx pqc rotate-key --old-derivation adapter --new-random --new-key-out mykey-new \
  --from mykey --chain-id qorechain-vladi --gas 600000 --fees 60000uqor -o json -y < mnemonic.txt
```

La rotation transporte deux clés de 2 592 octets et trois signatures, elle exige donc bien plus de gas qu'un transfert ; conservez le `--gas 600000` explicite et des frais d'au moins 60 000 uqor. `--new-random` sans `--new-key-out` est refusé (version de nœud v3.2.1 et ultérieures) afin qu'une rotation ne puisse jamais vous laisser sans la nouvelle clé.

En code, `@qorechain/wallet-adapter` (≥0.1.7) et `@qorechain/sdk` (≥0.7.0) exposent le même flux (synchrone ; il renvoie le message ainsi que les deux paires de clés) :

```js
import { rotatePqcKeyMsgFromMnemonic } from "@qorechain/wallet-adapter";

// Builds the dual-signed MsgRotatePQCKey migrating shake256(mnemonic) -> canonical:
const { msg, oldKeypair, newKeypair } = rotatePqcKeyMsgFromMnemonic({
  account: "qor1youraddress...", mnemonic, chainId: "qorechain-vladi",
});
// Sign & broadcast `msg` with the account's normal hybrid signer, using `oldKeypair` for the envelope's PQC signature.
```

Les helpers de rotation du SDK 0.9.0 et de `@qorechain/wallet-adapter` 0.4.0 refusent la dérivation legacy comme **nouvelle** clé (elle n'est pas liée au compte) ; une clé legacy peut toujours être l'ancienne clé. Après une rotation réussie, la nouvelle clé signe (code 0) et l'ancienne clé est rejetée (code `pqc` 21). Depuis la v3.2.3, une rotation (comme une migration) refuse une nouvelle clé qui n'offre aucune protection post-quantique (code 230) ainsi qu'une clé que le compte a déjà utilisée (code 232), et elle ne peut pas être envoyée via `authz`.

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

### `hybridSignBytes(version, chainId, bodyWithoutPqcExt, authInfo)`

Le **cadrage des sign-bytes à extension hybride** de QoreChain, compatible avec les wallets. Il produit exactement les octets qui doivent être signés avec ML-DSA-87 (Dilithium-5) pour constituer la moitié PQC d'une transaction hybride. Deux formes existent et un réseau en vérifie exactement une à chaque hauteur : **v1** = `BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` et **v2** = `"qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A` (`B0` est le corps de la transaction sans l'extension PQC, `A` l'auth info). Les deux réseaux publics sont en **v2**. La bibliothèque est pure, c'est donc à l'appelant de choisir la forme : interrogez le nœud avec `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pour **les deux** noms `v3.2.0` (le nom de mise à niveau du mainnet) et `v3.1.98` (l'ancien nom du testnet) et utilisez v2 si l'une des hauteurs est supérieure à 0 ; `signBytesVersionForApplied` et `signBytesVersionFor(chainId, height)` implémentent cette règle (utilisez `@qorechain/pqc` 0.2.1 ou ultérieur ; la forme à 2 arguments des versions 0.1.x lève une erreur).

C'est l'élément que les wallets et les intégrateurs utilisent pour produire la **signature hybride requise** sur le chemin de transaction cosmos. Dans la version actuelle de la chaîne, les signatures hybrides sont **requises par défaut** (`hybrid_signature_mode = required`, `allow_classical_fallback = false`) : chaque transaction du chemin cosmos doit porter une signature Dilithium-5 en plus de sa signature classique secp256k1. Consultez [Sécurité post-quantique](/architecture/post-quantum-security) pour le modèle d'application de cette règle.

La signature classique secp256k1 est calculée sur les sign bytes standard (qui **excluent** l'extension PQC), et la signature ML-DSA-87 est calculée puis attachée en tant qu'extension `PQCHybridSignature`. Comme les sign bytes classiques excluent l'extension, la signature classique reste valide, que le vérificateur comprenne ou non la partie PQC.

Il existe trois façons de produire cette signature hybride :

* **La CLI** — `qorechaind tx pqc cosign` attache la cosignature Dilithium-5 à une transaction et la diffuse (après `qorechaind tx pqc gen-key` et l'enregistrement de la clé). Elle ne fait partie que du binaire de release. Voir [Commandes de transaction](/cli-reference/transaction-commands).
* **Le SDK QoreChain** — `buildHybridTx` / `signAndBroadcastHybrid` (passez `rest` pour que la forme des sign-bytes soit résolue) font l'équivalent en TypeScript, Python, Go, Rust et Java ; en TypeScript, `client.connectTx(signer, { pqcKeypair })` (SDK 0.9.0) signe chaque transaction en mode hybride. Enregistrez d'abord votre clé (voir plus haut). Voir [Comptes SDK et signature PQC](/sdk/concepts/accounts-pqc).
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
