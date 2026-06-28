---
slug: /sdk/concepts/accounts-pqc
title: Comptes et signature PQC
sidebar_label: Comptes et PQC
sidebar_position: 2
---

# Comptes et signature PQC

Les comptes QoreChain sont dérivés d'une unique phrase mnémonique BIP-39. La même
mnémonique produit un compte natif, un compte EVM et un compte SVM via des chemins
de dérivation indépendants.

## Dérivation HD

```ts
import {
  generateMnemonic,
  validateMnemonic,
  deriveNativeAccount,
  deriveEvmAccount,
  deriveSvmAccount,
} from "@qorechain/sdk";

const mnemonic = generateMnemonic(); // 12 words; pass 256 for 24 words

const native = await deriveNativeAccount(mnemonic);
console.log(native.address); // "qor1..."  (secp256k1, bech32)

const evm = await deriveEvmAccount(mnemonic);
console.log(evm.address); // "0x..."   (EIP-55 checksummed)

const svm = await deriveSvmAccount(mnemonic);
console.log(svm.address); // base58 ed25519 public key
```

La mnémonique est validée (les mots **et** la somme de contrôle) avant qu'aucune
clé ne soit dérivée, de sorte qu'une faute de frappe lève une erreur au lieu de
produire silencieusement un mauvais compte. Vous pouvez valider explicitement avec
`validateMnemonic(mnemonic)`.

### Schémas de dérivation

| Type | Courbe | Chemin | Adresse |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` de `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 de la clé publique de 32 octets |

Passez un index de compte pour dériver des comptes supplémentaires. En TypeScript :

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

En Python/Go/Rust, l'index est un argument positionnel
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Note sur les réponses connues

Les schémas de dérivation sont déterministes et couverts par des tests à réponse
connue (known-answer) sur les quatre SDK, de sorte que la même mnémonique produit
des adresses identiques en TypeScript, Python, Go et Rust. Cela vous permet de
dériver dans un langage et de vérifier dans un autre.

## Cryptographie post-quantique (PQC)

QoreChain prend en charge les signatures **ML-DSA-87** (Dilithium-5, FIPS 204).
Le SDK expose directement les primitives.

```ts
import {
  generatePqcKeypair,
  pqcSign,
  pqcVerify,
  ML_DSA_87_PUBLIC_KEY_LENGTH,
  ML_DSA_87_SIGNATURE_LENGTH,
} from "@qorechain/sdk";

const keypair = generatePqcKeypair();
const message = new TextEncoder().encode("hello");

const signature = pqcSign(keypair.secretKey, message);
const ok = pqcVerify(keypair.publicKey, message, signature);
```

Les constantes de longueur exportées (`ML_DSA_87_PUBLIC_KEY_LENGTH`,
`ML_DSA_87_SECRET_KEY_LENGTH`, `ML_DSA_87_SIGNATURE_LENGTH`,
`ML_DSA_87_SEED_LENGTH`) vous permettent de valider les tailles de buffer.

> Sous le capot, les primitives PQC proviennent de [**qorechain-pqc**](/developer-guide/post-quantum-signing) — la bibliothèque open source, uniquement basée sur les standards, qui encapsule des implémentations FIPS-204/203/202 auditées derrière une API unique et cohérente dans six langages (JavaScript/TypeScript, Rust, Go, C, Python, Java). Faites-y appel directement lorsque vous avez besoin des primitives brutes ou du cadrage `hybridSignBytes` en dehors du SDK.

### Signataires enfichables

Pour la composition, le SDK fournit une abstraction `Signer` ainsi que des
implémentations `PqcSigner` et `HybridSigner`, et une énumération `SignatureMode`.
Utilisez-les lorsque vous voulez intégrer la signature PQC dans votre propre flux
plutôt que d'appeler directement les primitives.

## Signature hybride

Une transaction **hybride** porte à la fois une signature classique secp256k1 et
une signature ML-DSA-87, de sorte qu'elle reste valide sous une vérification
classique tout en bénéficiant d'une protection post-quantique. La partie
post-quantique voyage sous forme d'extension `PQCHybridSignature` sur la
transaction.

:::caution La signature hybride est requise sur le chemin cosmos
À partir de la version actuelle de la chaîne (**v3.1.80**), le réseau utilise par
défaut `hybrid_signature_mode = required` avec `allow_classical_fallback = false`.
La signature hybride via `buildHybridTx` (avec `includePqcPublicKey`) est
**obligatoire** pour les transactions du chemin cosmos — les transactions cosmos
classiques uniquement sont rejetées on-chain. Les transactions EVM utilisent un
chemin `eth_secp256k1` distinct et ne sont pas affectées.
:::

```ts
import {
  buildHybridTx,
  deriveNativeAccount,
  directSignerFromPrivateKey,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// buildHybridTx assembles a tx with BOTH a classical signature and an
// ML-DSA-87 signature attached as a PQCHybridSignature extension.
// (See packages/ts and the pqc-hybrid-sign example for the full call.)
```

### Prérequis on-chain

Avant qu'une transaction hybride ne se vérifie en PQC on-chain, la clé publique
PQC du signataire doit être **enregistrée** via le `MsgRegisterPQCKey` de la
chaîne — *sauf si* vous définissez `includePqcPublicKey: true`, ce qui intègre la
clé dans l'extension afin que la chaîne puisse l'enregistrer automatiquement à la
première utilisation.

### Contrat de tx hybride (haut niveau)

La transaction est signée de manière classique sur les sign bytes standard (qui
**excluent** l'extension PQC), et la signature ML-DSA-87 est calculée et attachée
en tant qu'extension `PQCHybridSignature`. Comme les sign bytes classiques
excluent l'extension, la signature classique reste valide qu'un vérificateur
comprenne ou non la partie PQC. Les helpers de plus bas niveau
(`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) et les constructeurs de
bout en bout (`buildHybridTx`, `signAndBroadcastHybrid`) sont exportés pour un
usage avancé.

> La soumission de transactions hybrides est le chemin requis sur le réseau en
> production pour les transactions cosmos. Les primitives locales de
> signature/vérification et les helpers de construction de tx sont disponibles
> dès aujourd'hui.

## Identifiants d'algorithme

Le SDK exporte des ID d'algorithme et des helpers pour le travail au niveau du
protocole : `AlgorithmUnspecified`, `AlgorithmDilithium5`, `AlgorithmMLKEM1024`,
`algorithmName(id)` et `isSignatureAlgorithm(id)`.
