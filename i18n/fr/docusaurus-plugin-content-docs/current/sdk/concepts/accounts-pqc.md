---
slug: /sdk/concepts/accounts-pqc
title: Comptes et signature PQC
sidebar_label: Comptes et PQC
sidebar_position: 2
---

# Comptes et signature PQC

Les comptes QoreChain sont dérivés d'un unique mnémonique BIP-39. Il existe deux
modèles de compte, tous deux entièrement pris en charge :

- **Dérivation HD par voie (legacy/défaut)** — le même mnémonique produit un
  compte natif (coin type 118), un compte EVM (coin type 60) et un compte SVM
  (coin type 501) via des chemins de dérivation indépendants. Trois clés, trois
  adresses.
- **Comptes unifiés eth-natifs** (SDK 0.6.0, chaîne v3.1.83) — UNE seule clé
  `eth_secp256k1` constitue UNE identité de 20 octets rendue sous les trois
  encodages d'adresse, avec un solde partagé unique. Voir
  [Comptes unifiés](#unified-accounts).

## Dérivation HD (legacy/défaut, coin type 118)

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

Le mnémonique est validé (mots **et** somme de contrôle) avant toute dérivation
de clé : une faute de frappe lève donc une erreur au lieu de produire
silencieusement un mauvais compte. Vous pouvez le valider explicitement avec
`validateMnemonic(mnemonic)`.

### Schémas de dérivation

| Type | Courbe | Chemin | Adresse |
| --- | --- | --- | --- |
| native | secp256k1 | `m/44'/118'/0'/0/{i}` | bech32 `qor` de `ripemd160(sha256(pubkey))` |
| evm | secp256k1 | `m/44'/60'/0'/0/{i}` | `0x` + `keccak256(pubkey)[-20:]`, EIP-55 |
| svm | ed25519 | `m/44'/501'/{i}'/0'` | base58 de la clé publique de 32 octets |

Passez un index de compte pour dériver des comptes supplémentaires. En
TypeScript :

```ts
const second = await deriveNativeAccount(mnemonic, { accountIndex: 1 });
```

En Python/Go/Rust, l'index est un argument positionnel
(`derive_native_account(mnemonic, 1)` / `DeriveNativeAccount(mnemonic, 1)` /
`derive_native_account(&mnemonic, 1)`).

### Note sur les vecteurs de test (known-answer)

Les schémas de dérivation sont déterministes et couverts par des tests à
réponse connue (known-answer) dans les quatre SDK : le même mnémonique produit
donc des adresses identiques en TypeScript, Python, Go et Rust. Vous pouvez
ainsi dériver dans un langage et vérifier dans un autre.

> Cette dérivation par voie (`deriveNativeAccount` au coin type 118, plus
> `deriveEvmAccount` / `deriveSvmAccount`) est le modèle **legacy/défaut** et
> reste prise en charge sans changement. Les comptes unifiés ci-dessous sont un
> modèle d'identité supplémentaire, en opt-in.

## Comptes unifiés (eth-natifs) {#unified-accounts}

Depuis le SDK **0.6.0** (chaîne v3.1.83), `deriveUnifiedAccount(mnemonic, index = 0)`
dérive UNE clé `eth_secp256k1` sur le chemin HD Ethereum `m/44'/60'/0'/0/{index}`
dont les 20 octets d'adresse (`keccak256(pubkey)[12:]`) constituent la MÊME
identité rendue de trois manières :

| Voie | Encodage |
| --- | --- |
| Native | bech32 avec le préfixe `qor` (`qor1…`) |
| EVM | `0x` + hexadécimal en casse mixte avec somme de contrôle EIP-55 |
| SVM | base58 des 20 octets complétés à droite par 12 octets nuls (32 octets) |

Un dépôt vers **n'importe laquelle** des trois adresses arrive dans **un seul**
solde, et la clé peut dépenser sur chaque voie :

```ts
import {
  deriveUnifiedAccount,
  qoreAddresses,
  addressesFrom20,
} from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);

account.cosmos;       // "qor1…"   bech32, Native lane
account.evm;          // "0x…"     EIP-55 hex, EVM lane
account.svm;          // "<base58>" 32-byte SVM address (addr20 + 12 zero bytes)
account.addressBytes; // the raw 20 bytes shared by all three
account.publicKey;    // 33-byte compressed secp256k1 public key
account.pqc;          // { publicKey, secretKey } — ML-DSA-87, derived below

// Decode any ONE encoding into all three:
const all = qoreAddresses({ evm: account.evm });
all.cosmos; // qor1…
all.svm;    // base58

// or straight from the raw 20 bytes:
const same = addressesFrom20(account.addressBytes);
```

`unifiedAccountFromSeed(seed32)` fait la même chose à partir d'une clé privée
secp256k1 brute de 32 octets.

### La dérivation de la graine PQC

La paire de clés ML-DSA-87 du compte est dérivée de façon déterministe et
**liée à l'adresse** :

```text
pqcSeed = shake256("qorechain:pqc:v1|" + cosmosAddress + "|" + mnemonic, 32)
```

Elle est donc récupérable à partir de `{ address, mnemonic }` et identique dans
tous les SDK de langage de QoreChain. (Pour `unifiedAccountFromSeed`,
l'emplacement du mnémonique est `"seed:" + hex(seed32)`.)

### Envoyer sur la voie Native avec la clé eth

Un compte unifié signe les transactions du chemin Native avec le schéma
`eth_secp256k1` : la signature classique est une signature secp256k1 sur
**keccak256** des octets du SignDoc (et non sha256), et la clé publique du
`SignerInfo` utilise l'URL de type
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Le chemin hybride
(`signHybridEth`) attache en plus l'extension `PQCHybridSignature` ML-DSA-87 —
obligatoire sur les réseaux en production :

```ts
import { EthNativeSigner, deriveUnifiedAccount } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic);
const signer = new EthNativeSigner(account); // signMode: "hybrid" by default

// `transport` is anything with broadcastTx (e.g. a connected client).
await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: "1000000" }], // 1 QOR
  { chainId: "qorechain-vladi", accountNumber, sequence, fee },
);
```

Pour un contrôle de plus bas niveau, `signHybridEth(params)` /
`signClassicalEth(params)` retournent les octets `TxRaw` assemblés et les
artefacts de signature, et `accountAuthInfo(baseAccount)` lit
`account_number` / `sequence` depuis un compte dont la clé publique on-chain
utilise l'URL de type `eth_secp256k1`. Le chemin uniquement classique est
réservé au `MsgRegisterPQCKeyV2` unique, exempté lors de l'amorçage ; utilisez
le mode hybride pour tout le reste.

:::caution Passez au SDK 0.6.1+ pour les transactions hybrides
Le SDK **0.6.1** a corrigé un bug d'encodage critique pour le consensus :
l'extension de corps de transaction `/qorechain.pqc.v1.PQCHybridSignature`
était sérialisée en JSON dans `Any.value`, et la chaîne **rejetait ces
transactions à CheckTx** (une erreur d'analyse de transaction). Elle est
désormais encodée en protobuf (la valeur de l'extension commence par `0x08`)
dans les cinq langages. Toute transaction hybride — y compris sur la voie
eth-native — construite avec un SDK ≤ 0.6.0 est rejetée on-chain : passez à la
version 0.6.1 ou ultérieure.
:::

### Phantom (P1a) : un compte unifié sans exporter de clé

`connectPhantomUnified()` (TypeScript) dérive un compte unifié canonique et
**non custodial** à partir d'une signature Phantom déterministe : l'utilisateur
signe un message fixe, séparé par domaine, avec la clé ed25519 de Phantom, et
`shake256(signature, 32)` sert de graine au compte.

```ts
import {
  connectPhantomUnified,
  unifiedAccountFromPhantomSignature,
} from "@qorechain/sdk";

// In the browser (uses window.solana):
const account = await connectPhantomUnified();

// Or, given a raw signature you already have:
const same = unifiedAccountFromPhantomSignature(signatureBytes);
```

Le compte dérivé est une clé canonique distincte de la clé ed25519 de Phantom —
Phantom ne voit jamais les secrets secp256k1/PQC dérivés. Pour permettre à la
clé Phantom elle-même de dépenser depuis le compte dans certaines limites, voir
[Authentificateurs et dépense déléguée](/sdk/guides/authenticators).

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
`ML_DSA_87_SEED_LENGTH`) vous permettent de valider les tailles de tampons.

> En dessous, les primitives PQC proviennent de [**qorechain-pqc**](/developer-guide/post-quantum-signing) — la bibliothèque open source, strictement conforme aux standards, qui encapsule des implémentations auditées de FIPS-204/203/202 derrière une API cohérente dans six langages (JavaScript/TypeScript, Rust, Go, C, Python, Java). Utilisez-la directement lorsque vous avez besoin des primitives brutes ou du cadrage `hybridSignBytes` en dehors du SDK.

### Signeurs enfichables

Pour la composition, le SDK fournit une abstraction `Signer` avec les
implémentations `PqcSigner` et `HybridSigner`, ainsi qu'une énumération
`SignatureMode`. Utilisez-les lorsque vous voulez intégrer la signature PQC
dans votre propre flux plutôt que d'appeler les primitives directement.

## Signature hybride {#hybrid-signing}

Une transaction **hybride** porte à la fois une signature classique secp256k1
et une signature ML-DSA-87 : elle reste donc valide sous vérification
classique tout en gagnant une protection post-quantique. La partie
post-quantique voyage sous forme d'extension `PQCHybridSignature` sur la
transaction.

:::caution La signature hybride est obligatoire sur le chemin Native
Depuis la version actuelle de la chaîne (**v3.1.85**), la valeur par défaut du
réseau est `hybrid_signature_mode = required` avec
`allow_classical_fallback = false`. La signature hybride via `buildHybridTx`
(avec `includePqcPublicKey`) — ou `signHybridEth` pour les comptes unifiés
eth-natifs — est **obligatoire** pour les transactions du chemin Native ; les
transactions Native uniquement classiques sont rejetées on-chain. Les
transactions EVM utilisent un chemin `eth_secp256k1` distinct et ne sont pas
concernées.
:::

:::caution Les transactions hybrides des SDK ≤ 0.6.0 sont rejetées
La version 0.6.1 a corrigé l'encodage de l'extension `PQCHybridSignature`
(JSON → protobuf, critique pour le consensus). Les transactions hybrides
construites avec le SDK 0.6.0 ou antérieur échouent à CheckTx avec une erreur
d'analyse de transaction — passez à la version 0.6.1+.
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

Avant qu'une transaction hybride puisse être vérifiée en PQC on-chain, la clé
publique PQC du signataire doit être **enregistrée** via le message
`MsgRegisterPQCKey` de la chaîne — *sauf* si vous définissez
`includePqcPublicKey: true`, qui intègre la clé dans l'extension afin que la
chaîne puisse l'auto-enregistrer à la première utilisation.

### Contrat de la transaction hybride (vue d'ensemble)

La transaction est signée classiquement sur les octets de signature standard
(qui **excluent** l'extension PQC), et la signature ML-DSA-87 est calculée puis
attachée en tant qu'extension `PQCHybridSignature`. Comme les octets de
signature classiques excluent l'extension, la signature classique reste valide
qu'un vérificateur comprenne ou non la partie PQC. Les assistants de plus bas
niveau (`encodeHybridExtension`, `attachHybridExtension`,
`buildHybridSignatureExtension`, `HYBRID_SIG_TYPE_URL`) et les constructeurs de
bout en bout (`buildHybridTx`, `signAndBroadcastHybrid`) sont exportés pour un
usage avancé.

> La soumission de transactions hybrides est le chemin obligatoire sur le
> réseau en production pour les transactions cosmos. Les primitives locales de
> signature/vérification et les assistants de construction de transactions sont
> disponibles dès aujourd'hui.

## Rotation de clé PQC

Depuis le SDK 0.7.0, un compte peut faire tourner sa clé ML-DSA-87 vers une
nouvelle clé du **même algorithme** — en migrant canoniquement une clé legacy
`shake256(mnemonic)` vers la clé liée à l'adresse
`shake256("qorechain:pqc:v1|addr|mnemonic")` — via
`rotatePqcKeyMsgFromMnemonic` (les deux clés co-signent les octets de
rotation). Voir [Rotation de clé](/sdk/guides/authenticators#key-rotation) dans
le guide Authentificateurs pour un exemple complet.

## Identifiants d'algorithmes

Le SDK exporte des identifiants d'algorithmes et des assistants pour le travail
au niveau protocole : `AlgorithmUnspecified`, `AlgorithmDilithium5`,
`AlgorithmMLKEM1024`, `algorithmName(id)` et `isSignatureAlgorithm(id)`.
