---
slug: /sdk/guides/quantum-safe
title: Résistant au quantique par défaut
sidebar_label: Résistant au quantique
sidebar_position: 6
---

# Résistant au quantique par défaut

QoreChain considère la cryptographie post-quantique comme un schéma de signature de **première
classe**. Un compte enregistre une clé **ML-DSA-87 (Dilithium-5, NIST FIPS 204)** sur la chaîne,
après quoi ses transactions peuvent porter une signature **hybride** — la signature classique
secp256k1 habituelle **plus** une signature ML-DSA-87. Le gestionnaire ante de la chaîne
vérifie les deux, de sorte qu'un compte résistant au quantique reste pleinement compatible avec
la vérification classique tout en gagnant une protection contre un futur adversaire
quantique.

Le SDK regroupe tout cela en une surface minuscule et idempotente, afin qu'une dApp devienne
**résistante au quantique par défaut** : un seul appel pour être protégé par PQC. Sur les réseaux
en production, ce n'est pas facultatif pour les transactions du chemin Native : la clé doit être
enregistrée **explicitement** (il n'y a pas d'enregistrement automatique à la première
transaction), puis chaque transaction du chemin Native doit porter la signature hybride.

## Vérifier le statut {#check-status}

`isPqcRegistered` / `getPqcStatus` lisent si une adresse possède une clé PQC enregistrée.
Avec le client composé issu de `createClient`, ils lisent via REST
(`GET /qorechain/pqc/v1/account/{address}`, servi par chaque point d'accès public) ; avec un
`QorClient` nu, ils utilisent la méthode JSON-RPC `qor_getPQCKeyStatus`, que **les points
d'accès publics ne servent pas** (voir
[l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace)) ; contre
`*.qore.host`, passez donc le client composé. Les versions antérieures à la 0.9.0
utilisaient toujours la méthode `qor_` et échouaient avec l'erreur JSON-RPC `-32601` ; lisez-y
directement la route REST.

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

const registered = await isPqcRegistered(client, address); // boolean
const status = await getPqcStatus(client, address);
// { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

La route est `GET /qorechain/pqc/v1/account/{address}` (`account` au singulier). Elle
répond `{"found": true, "account": {…}}` pour une adresse enregistrée et
`{"found": false, "account": null}` dans le cas contraire ; `client.rest.getPqcAccount(address)`
renvoie ce corps, et `fetchPqcStatus({ rest, address })` le transforme en statut
ci-dessus. Une réponse illisible (une erreur HTTP, un échec de transport) lève une erreur après un
nouvel essai : elle n'est jamais interprétée comme « non enregistré ». Dans la 0.8.x, `getPqcAccount`
appelait un chemin `/accounts/` au pluriel que la chaîne ne sert pas.

Le même statut est aussi lisible côté EVM via le précompilé
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
à `0x0000000000000000000000000000000000000A02` (exposé sous le nom
`pqcKeyStatus` dans `@qorechain/evm`) une fois ce précompilé actif ; il n'est pas
encore actif sur le mainnet ni sur le testnet (voir
[État du réseau](/developer-guide/evm-precompiles#network-status)).

## Enregistrer en un seul appel {#register-in-one-call}

`ensurePqcRegistered` rend un compte résistant au quantique. Il construit et diffuse
`MsgRegisterPQCKeyV2` avec la clé publique ML-DSA-87 du signataire. Il est **idempotent** :
il lit d'abord le statut du compte (via REST lorsque vous passez `rest`), ignore
l'enregistrement lorsque le compte détient déjà la clé de cette paire de clés, et peut donc
être appelé sans risque à chaque démarrage de l'application. Lorsque le compte détient une clé
*différente*, il lève `PqcKeyMismatchError` et n'envoie rien, car chaque transaction hybride
signée avec votre paire de clés serait refusée. Il n'enregistre jamais à l'aveugle : si le
statut ne peut pas être lu, il lève une erreur (ne passez `force: true` que pour un compte dont
vous savez qu'il n'a aucune clé).

L'enregistrement est signé en classique et exempté de l'exigence hybride, de sorte qu'un nouveau
compte peut amorcer sa première clé ; depuis la v3.2.3, cette exemption ne couvre qu'un compte
sans clé (un compte qui en détient déjà une doit signer en hybride un enregistrement ou une
migration, et la chaîne refuse les clés faibles, dégénérées ou réutilisées). Une fois que le
réseau a appliqué la v3.2.3, l'assistant signe la **preuve de possession** facultative avec la
nouvelle clé et la joint (il lit l'identifiant de chaîne depuis `chainId` ou depuis le nœud, et
omet le champ sur un réseau qui n'a pas appliqué la v3.2.3, car un ancien nœud le refuse). Il
signe via un signataire CosmJS, c'est-à-dire un compte de coin type 118
(`deriveNativeAccount`) ; pour un compte eth-native unifié, signez l'enregistrement avec
`EthNativeSigner` et `signMode: "classical"` (voir
[Comptes et signature PQC](/sdk/concepts/accounts-pqc#hybrid-signing)). La clé de 2 592
octets nécessite une limite de gas d'environ 600 000 ; le prix minimum du gas du réseau est de 0,1 uqor
par unité de gas.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  ensurePqcRegistered,
} from "@qorechain/sdk";

const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");

// The address-bound key, recoverable from { address, mnemonic } (0.8.3+; see below).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// With the keypair the client signs every transaction hybrid; the registration
// itself stays classical (the chain's bootstrap path).
const tx = await client.connectTx(signer, { pqcKeypair });

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  rest: client.network.endpoints.rest,
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }

await tx.bankSend("qor1…", [{ denom: "uqor", amount: "1000000" }]); // hybrid-signed
```

### Une clé que vous pouvez récupérer {#canonical-derivation}

`derivePqcCanonical(address, mnemonic)` dérive la clé ML-DSA-87 du compte à partir de son
adresse et de son mnémonique : un appareil perdu est donc récupérable, et chaque langage et
chaque wallet dérive la même clé (un mnémonique, une clé par compte). Elle ramène d'abord
l'adresse à sa forme `qor1…` en minuscules, de sorte que la forme `0x` d'un compte unifié
donne la même clé. Les équivalents :

| Langage | Fonction | Publié |
| --- | --- | --- |
| TypeScript | `derivePqcCanonical(address, mnemonic)` (`@qorechain/sdk`) | 0.9.0 |
| Python | `derive_pqc_canonical(address, mnemonic)` (`qorsdk`) | 0.9.0 |
| Go | `authenticator.DerivePQCCanonical(address, mnemonic)` | v0.9.0 |
| Rust | `authenticator::try_derive_pqc_canonical(address, mnemonic)` (renvoie un `Result`) | 0.9.0 |
| Java | `Authenticator.derivePqcCanonical(address, mnemonic)` | 0.9.0 |

La dérivation héritée (`derivePqcLegacy`, `"bridge"`) n'est pas liée au compte et
est dépréciée pour les nouvelles clés ; les assistants de rotation la refusent comme nouvelle
clé (voir [Faire pivoter une clé](#rotate-a-key)).

Enregistrement en Python (0.9.0 ; la lecture du statut passe par REST et l'appel lève
`PqcKeyMismatchError` pour une clé enregistrée différente au lieu de payer un second
enregistrement) :

```python
import httpx
from qorsdk import derive_native_account, derive_pqc_canonical, ensure_pqc_registered, fetch_pqc_status

REST = "https://api.qore.host"
native = derive_native_account(mnemonic, 0)
pqc_keypair = derive_pqc_canonical(native.address, mnemonic)

print(fetch_pqc_status(REST, native.address))  # {'registered': False} for a new account

acct = httpx.get(f"{REST}/cosmos/auth/v1beta1/accounts/{native.address}").json()["account"]
result = ensure_pqc_registered(
    account=native,
    pqc_keypair=pqc_keypair,
    chain_id="qorechain-vladi",
    account_number=int(acct["account_number"]),
    sequence=int(acct.get("sequence", 0)),
    rest_url=REST,
    fee={"amount": [{"denom": "uqor", "amount": "60000"}], "gas": "600000"},
)
```

Les assistants Go (`pqcdx.Signer.RestURL`), Rust (`pqc_dx` `rest_url`) et Java
(`signer.restUrl`) lisent le statut depuis la même route REST et joignent la
preuve de possession de la même façon.

Les autres SDK signent en hybride via leurs constructeurs de transactions hybrides
(`build_hybrid_tx` en Python et Rust, `tx.BuildHybridMessages` en Go,
`PqcDx.HybridSendPath` en Java) ; seul le `TxClient` TypeScript signe en hybride pour vous.

:::warning Laissez-le toujours vérifier d'abord
La chaîne refuse un second enregistrement de la même clé **après avoir prélevé les
frais**. `ensurePqcRegistered` lit donc d'abord le statut, via REST
(`/qorechain/pqc/v1/account/{address}`), et refuse d'enregistrer lorsqu'il ne peut
pas trancher. Passez `rest` (ou `statusSource` pour un nœud qui expose `qor_*`, ou un
`status` pré-lu) ; `force: true` ignore la vérification. Dans la 0.8.x, l'assistant n'avait
aucun repli REST et diffusait l'enregistrement sans vérification, sauf si vous passiez
vous-même `status`.
:::

## Signer en hybride

Avec un `pqcKeypair` sur le client, `tx.bankSend(...)` et
`tx.signAndBroadcast([messages], "auto")` signent en hybride (le chemin `fee: "auto"`
simule la transaction hybride et ajoute le gas de la vérification post-quantique).
La signature hybride est calculée sur la forme de sign-bytes que le réseau vérifie (voir
[Quelle forme de sign-bytes ?](/sdk/concepts/accounts-pqc#sign-bytes-versions)) ; le client
interroge le réseau via son point d'accès REST.

`migrateToHybrid` garantit l'enregistrement et renvoie un chemin d'envoi hybride avec la
paire de clés pré-liée aux constructeurs de plus bas niveau `buildHybridTx` /
`signAndBroadcastHybrid`, lorsque vous gérez vous-même les frais, le numéro de compte et la
séquence. Passez `rest` afin que le SDK puisse déterminer la forme de sign-bytes :

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  rest: "https://api.qore.host",
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await hybrid.signAndBroadcastHybrid({
  registry: qorechainRegistry(),
  signer,          // classical secp256k1 direct signer
  messages,
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gas: "400000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

La chaîne accepte toute signature ML-DSA-87 FIPS-204 valide, qu'elle soit hedged ou
déterministe. Le SDK signe de façon déterministe par défaut (depuis la 0.5.1), de sorte
qu'une transaction a toujours la même signature et le même hash de tx. Si une tx hybride échoue
avec le code `pqc` 21 (`hybrid_verify_failed`), la cause est la version des sign-bytes, le
chain-id, une bibliothèque PQC obsolète ou une clé non enregistrée ou différente, jamais la
signature hedged : voir [Dépannage du code 21](/developer-guide/post-quantum-signing#code-21).

## Faire pivoter une clé {#rotate-a-key}

Pour remplacer la clé ML-DSA-87 d'un compte par une autre clé du **même** algorithme
(par exemple faire passer une clé héritée `shake256(mnemonic)` à la clé canonique liée à
l'adresse, ou retirer une clé compromise), construisez un `MsgRotatePQCKey` avec
`rotatePqcKeyMsgFromMnemonic` ; les deux clés le signent conjointement. Voir
[Rotation de clé](/sdk/guides/authenticators#key-rotation) pour l'exemple complet.

`migratePqcKeyHybrid` diffuse l'ancien `MsgMigratePQCKey`, qui fait passer un compte
d'un **algorithme** à un autre, avec la signature hybride que la chaîne exige, à partir de
la v3.2.3, d'un compte qui possède une clé. `pqcKeypair` est la clé **actuellement** enregistrée
(celle dont on se sépare), et l'appelant fournit les deux signatures de propriété
(`oldSignature` par l'ancienne clé, `newSignature` par la nouvelle). La
`migratePqcKey` classique est dépréciée : un nœud v3.2.3 refuse une migration classique
depuis un compte qui possède une clé.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migratePqcKeyHybrid, qorechainRegistry } from "@qorechain/sdk";

const transport = await StargateClient.connect("https://rpc.qore.host");
const info = await transport.getSequence(account.address);

await migratePqcKeyHybrid({
  sender: account.address,
  registry: qorechainRegistry(),
  signer,
  pqcKeypair,   // the currently registered key
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
  chainId: "qorechain-vladi",
  accountNumber: info.accountNumber,
  sequence: info.sequence,
  rest: "https://api.qore.host",
  transport,
});
```

## Dans l'interface utilisateur

Le kit [`@qorechain/react`](/sdk/guides/react) expose tout cela dans React : le
hook `usePqcStatus` et le composant `<QuantumSafeBadge/>` affichent un indicateur
**Résistant au quantique** dès que le compte connecté possède une clé PQC enregistrée. Les deux lisent le
statut via `getPqcStatus` avec le client composé ; à partir de `@qorechain/react`
0.9.0, ils le lisent donc via REST et fonctionnent contre les points d'accès publics ; la 0.8.x
ne pouvait pas y confirmer une clé.
