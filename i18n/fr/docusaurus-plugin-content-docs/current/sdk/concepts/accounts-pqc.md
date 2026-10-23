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
solde, et la clé unique est le signataire sur chaque voie (sur la voie EVM, à
l'intérieur d'une [fenêtre d'autorisation](/sdk/guides/evm#evm-window) ; la voie
de transaction SVM est actuellement désactivée sur l'ensemble du réseau, donc
SVM est en lecture seule aujourd'hui) :

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
account.publicKey;    // "0x…" hex string of the 33-byte compressed secp256k1 key
account.privateKey;   // "0x…" hex string (a secret: never log or commit it)
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
l'emplacement du mnémonique est `"seed:" + hex(seed32)`.) Depuis le SDK 0.8.3,
`derivePqcCanonical(account, mnemonic)` commence par ramener `account` à sa
forme `qor1…` en minuscules (`canonicalAccount`) : un bech32 en majuscules ou la
forme `0x` du même compte produit donc la même clé. Chaque langage dispose de la
même fonction (Python `derive_pqc_canonical`, Go
`authenticator.DerivePQCCanonical`, Rust `try_derive_pqc_canonical`, Java
`Authenticator.derivePqcCanonical` ; voir le
[tableau du guide Quantum-safe](/sdk/guides/quantum-safe#canonical-derivation)),
et le même `{ address, mnemonic }` donne la même clé dans tous (vérifié pour
TypeScript, Python, Go et Rust en octobre 2026).

### Envoyer sur la voie Native avec la clé eth

Un compte unifié signe les transactions du chemin Native avec le schéma
`eth_secp256k1` : la signature classique est une signature secp256k1 sur
**keccak256** des octets du SignDoc (et non sha256), et la clé publique du
`SignerInfo` utilise l'URL de type
`/cosmos.evm.crypto.v1.ethsecp256k1.PubKey`. Le chemin hybride
(`signHybridEth`, ou `EthNativeSigner` avec son `signMode: "hybrid"` par défaut)
attache en plus l'extension `PQCHybridSignature` ML-DSA-87, qui est obligatoire
sur les réseaux en production.

Deux choses sont nécessaires avant le premier envoi hybride. D'abord, la clé
ML-DSA-87 du compte doit être **enregistrée** (une seule fois). L'enregistrement
est l'unique transaction signée classiquement et exemptée de la règle hybride :
signez-la avec `signMode: "classical"`. La `publicKey` du compte est une chaîne
hexadécimale `0x` ; décodez-la donc en octets pour `ecdsaPubkey`. Ensuite,
passez `rest` au signeur afin qu'il puisse demander au réseau quelle
[forme d'octets de signature](#sign-bytes-versions) il vérifie (sur
`qorechain-vladi` et `qorechain-diana`, il lève une erreur au lieu de deviner).
Nécessite le SDK 0.8.1 ou ultérieur (0.9.0 pour les assistants de preuve de
possession) et `npm i @cosmjs/stargate` :

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  createClient,
  deriveUnifiedAccount,
  EthNativeSigner,
  buildRegisterPqcKeyMsg,
  signProofOfPossession,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";
const CHAIN_ID = "qorechain-vladi";

const client = createClient({ network: "mainnet", endpoints: { rest: REST, rpc: RPC } });
const transport = await StargateClient.connect(RPC);
const account = await deriveUnifiedAccount(mnemonic);

// The REST account record carries the number and sequence (the account must
// exist, that is, have received funds).
async function authInfo() {
  const { account: base } = await client.rest.get<{
    account: { account_number: string; sequence: string };
  }>(`/cosmos/auth/v1beta1/accounts/${account.cosmos}`);
  return { accountNumber: BigInt(base.account_number), sequence: BigInt(base.sequence) };
}

// 1) Register the ML-DSA-87 key once (classical-signed, exempt from the hybrid rule).
const classical = new EthNativeSigner(account, { signMode: "classical" });
await classical.signAndBroadcast(transport, {
  chainId: CHAIN_ID,
  ...(await authInfo()),
  messages: [
    buildRegisterPqcKeyMsg(account.cosmos, {
      pqcKeypair: account.pqc,
      ecdsaPubkey: Uint8Array.from(Buffer.from(account.publicKey.slice(2), "hex")),
      // Optional since v3.2.3 (SDK 0.9.0+): the new key signs a proof that its owner
      // holds the secret. Leave it out on a network that has not applied v3.2.3,
      // because an older node refuses the whole transaction when the field is set.
      proofOfPossession: signProofOfPossession({
        chainId: CHAIN_ID,
        account: account.cosmos,
        keypair: account.pqc,
      }),
    }),
  ],
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" }, // the 2,592-byte key needs about 600k gas
});

// 2) Send with the hybrid signature (the default signMode).
const signer = new EthNativeSigner(account, { rest: REST });
const res = await signer.bankSend(
  transport,
  "qor1recipient…",
  [{ denom: "uqor", amount: toBase("1.5") }],
  {
    chainId: CHAIN_ID,
    ...(await authInfo()),
    fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  },
);
console.log(res.transactionHash);
```

Pour un contrôle de plus bas niveau, `signHybridEth(params)` /
`signClassicalEth(params)` retournent les octets `TxRaw` assemblés et les
artefacts de signature, et `accountAuthInfo(baseAccount)` lit
`account_number` / `sequence` depuis un `BaseAccount` protobuf dont la clé
publique on-chain utilise l'URL de type `eth_secp256k1` (un compte au format
JSON REST doit d'abord voir ses champs convertis, comme le fait `authInfo`
ci-dessus).

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

### Phantom et autres wallets externes {#phantom}

:::danger Supprimé dans le SDK 0.8.0
Les SDK 0.6.0 à 0.7.0 fournissaient `connectPhantomUnified()` et `unifiedAccountFromPhantomSignature()` (supprimées en 0.8.0 ; Python et Rust : `unified_account_from_phantom_signature`, Go : `unified.UnifiedAccountFromPhantomSignature`, Java : `UnifiedAccounts.unifiedAccountFromPhantomSignature`), qui dérivaient la clé de dépense d'un compte à partir d'une signature Phantom sur le message fixe `QoreChain unified account derivation v1` suivi de la clé publique base58 du wallet.
Une signature ed25519 est déterministe et n'importe quel site web peut demander au wallet de signer ce même message : toute personne ayant un jour obtenu la signature peut donc reconstruire les clés secp256k1 et ML-DSA du compte. Les deux fonctions lèvent désormais une erreur.

Si vous avez créé un compte de cette façon, considérez-le dès maintenant comme compromis : créez un nouveau compte à partir d'une mnémonique, transférez-y les fonds, puis liez Phantom au nouveau compte en tant qu'authenticator (voir ci-dessous). L'ancien compte ne peut pas être réparé, car son adresse est liée à la clé exposée et une rotation de clé PQC ne remplace que la moitié post-quantique. Utilisez le SDK 0.8.2 ou ultérieur.
:::

Pour qu'une clé Phantom (ou MetaMask) dépense depuis un compte, utilisez les **voies d'authenticator** : enregistrez la clé du wallet avec `MsgRegisterAuthenticator`, puis dépensez depuis le compte PQC canonique via `MsgExecuteCosmos` / `MsgExecuteEVM` sous une permission et une `SpendingRule`. Le compte conserve ses propres clés dérivées de la mnémonique, et la clé du wallet peut être révoquée à tout moment. Voir [Authenticators et dépenses déléguées](/sdk/guides/authenticators). Notez que le module `abstractaccount` qui fournit ces voies est actuellement désactivé sur les deux réseaux (`GET /qorechain/abstractaccount/v1/config` indique `enabled: false`) : une clé de wallet ne peut donc pas encore être liée ; d'ici là, utilisez directement le nouveau compte issu de la mnémonique.

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
implémentations `PqcSigner` et `HybridSigner`, ainsi qu'un type
`SignatureMode` (`"classical" | "pqc" | "hybrid"`). Utilisez-les lorsque vous
voulez intégrer la signature PQC dans votre propre flux plutôt que d'appeler
les primitives directement.

## Signature hybride {#hybrid-signing}

Une transaction **hybride** porte à la fois une signature classique secp256k1
et une signature ML-DSA-87 : elle reste donc valide sous vérification
classique tout en gagnant une protection post-quantique. La partie
post-quantique voyage sous forme d'extension `PQCHybridSignature` sur la
transaction.

:::caution La signature hybride est obligatoire sur le chemin Native
Depuis la version **v3.2.0** de la chaîne (le mainnet et le
testnet exécutent tous deux la v3.2.4), la valeur par défaut du réseau est
`hybrid_signature_mode = required` avec `allow_classical_fallback = false`. La
signature hybride via `buildHybridTx` / `signAndBroadcastHybrid` (passez
`rest`), ou `signHybridEth` / `EthNativeSigner` pour les comptes unifiés
eth-natifs, est **obligatoire** pour les transactions du chemin Native ; les
transactions Native uniquement classiques sont rejetées on-chain. Les
transactions EVM constituent une voie distincte, mais depuis la v3.2.0 elles ne
sont admises que depuis un compte disposant d'une clé ML-DSA-87 enregistrée et
d'une [fenêtre d'autorisation](/sdk/guides/evm#evm-window) ouverte.
:::

:::caution Les transactions hybrides des SDK ≤ 0.6.0 sont rejetées
La version 0.6.1 a corrigé l'encodage de l'extension `PQCHybridSignature`
(JSON → protobuf, critique pour le consensus). Les transactions hybrides
construites avec le SDK 0.6.0 ou antérieur échouent à CheckTx avec une erreur
d'analyse de transaction — passez à la version 0.6.1+.
:::

Le constructeur de bout en bout pour un compte de coin type 118 est
`signAndBroadcastHybrid` (ou `buildHybridTx` pour construire sans diffuser). Il
a besoin du signeur classique, de la paire de clés ML-DSA-87 du compte, du
numéro de compte et de la séquence, ainsi que de `rest`.
Pour un compte de coin type 118 en TypeScript, le chemin le plus court est le
`TxClient` hybride (SDK 0.9.0) : passez la paire de clés lors de la connexion et
chaque transaction est signée en mode hybride, `fee: "auto"` simulant la
transaction hybride elle-même (l'enregistrement seul reste classique) :

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  toBase,
} from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: { rest: "https://api.qore.host", rpc: "https://rpc.qore.host", evmRpc: "https://evm.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain

const tx = await client.connectTx(signer, { pqcKeypair });            // signs every transaction hybrid
await tx.bankSend("qor1recipient…", [{ denom: "uqor", amount: toBase("1.5") }]);
```

Pour un contrôle explicite des frais, du numéro de compte et de la séquence,
utilisez `signAndBroadcastHybrid` (SDK 0.8.1 ou ultérieur, `npm i
@cosmjs/stargate`) :

```ts
import { StargateClient } from "@cosmjs/stargate";
import {
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  signAndBroadcastHybrid,
  qorechainRegistry,
  MSG_SEND_TYPE_URL,
  toBase,
} from "@qorechain/sdk";

const REST = "https://api.qore.host";
const RPC = "https://rpc.qore.host";

const account = await deriveNativeAccount(mnemonic);                  // coin type 118
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);     // the key registered on-chain
const transport = await StargateClient.connect(RPC);
const info = await transport.getSequence(account.address);            // { accountNumber, sequence }

const result = await signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,
  messages: [
    {
      typeUrl: MSG_SEND_TYPE_URL,
      value: {
        fromAddress: account.address,
        toAddress: "qor1recipient…",
        amount: [{ denom: "uqor", amount: toBase("1.5") }],
      },
    },
  ],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" }, // 0.1 uqor per gas is the floor
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: REST,        // lets the SDK pick the v1/v2 PQC sign-bytes form
  transport,
});
```

### Prérequis on-chain

Avant qu'une transaction hybride puisse être vérifiée en PQC, la clé publique
PQC du signataire doit être **enregistrée** avec `MsgRegisterPQCKeyV2` (signée
classiquement, exemptée de la règle hybride pour un compte qui n'a pas encore de
clé). Les fonctions
`ensurePqcRegistered` / `buildRegisterPqcKeyMsg` du SDK, `qorechaind tx pqc
register-key` ou un wallet QoreChain s'en chargent. `includePqcPublicKey: true`
ne fait qu'intégrer la clé dans l'extension ; cela ne l'enregistre **pas**, et
la chaîne n'enregistre pas de clé à la première utilisation. Depuis la v3.2.3, la
chaîne refuse les clés faibles, dégénérées et réutilisées, et accepte une preuve
de possession facultative (voir
[Règles d'intégrité des clés](/architecture/post-quantum-security#key-integrity)).
Dans le SDK 0.9.0, `ensurePqcRegistered` joint la preuve de lui-même une fois
que le réseau a appliqué la v3.2.3, et `signProofOfPossession` /
`verifyProofOfPossession` sont exportées pour les enregistrements construits à la
main ; les constructeurs 0.8.x enregistrent sans preuve, ce qui est autorisé.

### Quelle forme d'octets de signature ? {#sign-bytes-versions}

La moitié ML-DSA-87 d'une transaction hybride est signée sur l'une de deux
formes d'octets, et un réseau n'en vérifie qu'une seule à une hauteur donnée :

```text
v1: BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
v2: "qorechain-pqc-hybrid-v2" ‖ BE64(len chainId) ‖ chainId ‖ BE32(len B0) ‖ B0 ‖ BE32(len A) ‖ A
```

`B0` est le corps de la transaction sans l'extension PQC et `A` les octets
`AuthInfo`. `qorechain-vladi` et `qorechain-diana` vérifient tous deux la
forme **v2**. Le basculement a été enregistré sous le nom de mise à niveau
`v3.2.0` sur le mainnet et sous `v3.1.98` (puis `v3.2.0`) sur le testnet : un
client doit donc interroger
`GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pour **les deux** noms et
utiliser la forme v2 si l'une des hauteurs est supérieure à zéro. Le SDK le
fait pour vous : chaque constructeur hybride accepte `signBytesVersion`
(`"auto"` par défaut, ou `"v1"` / `"v2"`), et `"auto"` exige l'URL REST du
réseau (`rest`) sur ces deux chaînes : il lève une erreur plutôt que de
deviner. Les chemins de haut niveau re-résolvent la forme et réessaient une
fois lorsque la chaîne refuse la signature avec le code `pqc` 21. Dans les
tests unitaires, passez `signBytesVersion` explicitement afin que le test ne
dépende pas d'un nœud en ligne. Voir aussi
[Dépannage du code 21](/developer-guide/post-quantum-signing#code-21).

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
