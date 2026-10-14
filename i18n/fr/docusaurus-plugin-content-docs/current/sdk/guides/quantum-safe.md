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

`isPqcRegistered` / `getPqcStatus` lisent si une adresse possède une clé PQC enregistrée
via la méthode JSON-RPC `qor_getPQCKeyStatus`. Ils acceptent soit un
`QorClient`, soit le client composé issu de `createClient`. **Les points d'accès publics
ne servent pas l'espace de noms `qor_`** (voir
[l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace)) ; contre
`*.qore.host`, ces assistants échouent donc avec l'erreur JSON-RPC `-32601`. Lisez le statut
plutôt via REST :

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  network: "mainnet",
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});

async function isPqcRegistered(address: string): Promise<boolean> {
  const res = await client.rest.get<{ found: boolean }>(
    `/qorechain/pqc/v1/account/${address}`,
  );
  return res.found;
}
```

La route est `GET /qorechain/pqc/v1/account/{address}` (`account` au singulier). Elle
répond `{"found": true, "account": {…}}` pour une adresse enregistrée et
`{"found": false, "account": null}` dans le cas contraire. N'utilisez pas `client.rest.getPqcAccount`
pour cela : il appelle le chemin `/accounts/` au pluriel, que la chaîne ne sert pas.

`isPqcRegistered(client, address)` et `getPqcStatus(client, address)` (avec l'option
`statusSource`) restent les bons appels contre un nœud qui sert l'espace de noms `qor` ;
leur résultat est
`{ registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }`.

Le même statut est aussi lisible côté EVM via le précompilé
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
à `0x0000000000000000000000000000000000000A02` (exposé sous le nom
`pqcKeyStatus` dans `@qorechain/evm`) une fois ce précompilé actif ; il n'est pas
encore actif sur le mainnet ni sur le testnet (voir
[État du réseau](/developer-guide/evm-precompiles#network-status)). La prochaine
version corrective du SDK se rabat sur la route REST ci-dessus lorsqu'on lui donne un client qui expose
`.rest` (comme le client composé), et lève une erreur au lieu de signaler « non
enregistré » lorsque le statut ne peut pas être lu.

## Enregistrer en un seul appel

`ensurePqcRegistered` rend un compte résistant au quantique. Il construit et diffuse
`MsgRegisterPQCKeyV2` avec la clé publique ML-DSA-87 du signataire et la clé publique
ECDSA du compte. Il est **idempotent** lorsque vous lui donnez un `status` pré-lu (ou une
`statusSource`) : il ignore l'enregistrement lorsque la clé est déjà enregistrée, de
sorte qu'il est sûr de l'appeler à chaque démarrage de l'application.

L'enregistrement est signé en classique et exempté de l'exigence hybride, de sorte qu'un nouveau
compte peut amorcer sa première clé. Il signe via un signataire CosmJS, c'est-à-dire un
compte de coin type 118 (`deriveNativeAccount`) ; pour un compte eth-native unifié, signez
l'enregistrement avec `EthNativeSigner` et `signMode: "classical"` (voir
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
const tx = await client.connectTx(signer);

// The address-bound key, recoverable from { address, mnemonic } (SDK 0.8.3+).
// Never register a throwaway key from generatePqcKeypair() unless you store it.
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);

// Read the status over REST: the default status source needs the `qor_` namespace.
const { found } = await client.rest.get<{ found: boolean }>(
  `/qorechain/pqc/v1/account/${account.address}`,
);

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
  fee: { amount: [{ denom: "uqor", amount: "60000" }], gas: "600000" },
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

## Signer en hybride

`migrateToHybrid` garantit l'enregistrement et renvoie un chemin d'envoi hybride avec la
paire de clés pré-liée aux constructeurs `buildHybridTx` / `signAndBroadcastHybrid`
existants. Passez `rest` afin que le SDK puisse déterminer quelle forme de sign-bytes hybride
le réseau vérifie (voir
[Quelle forme de sign-bytes ?](/sdk/concepts/accounts-pqc#sign-bytes-versions)) :

```ts
import { StargateClient } from "@cosmjs/stargate";
import { migrateToHybrid, qorechainRegistry } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, {
  pqcKeypair,
  ecdsaPubkey: account.publicKey,
  status: { registered: found },
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

## Faire pivoter une clé

Pour remplacer la clé ML-DSA-87 d'un compte par une autre clé du **même** algorithme
(par exemple faire passer une clé héritée `shake256(mnemonic)` à la clé canonique liée à
l'adresse, ou retirer une clé compromise), construisez un `MsgRotatePQCKey` avec
`rotatePqcKeyMsgFromMnemonic` ; les deux clés le signent conjointement. Voir
[Rotation de clé](/sdk/guides/authenticators#key-rotation) pour l'exemple complet.

`migratePqcKey` diffuse l'ancien `MsgMigratePQCKey`, qui fait passer un compte
d'un **algorithme** à un autre et exige que l'appelant fournisse les deux signatures :

```ts
import { migratePqcKey } from "@qorechain/sdk";

await migratePqcKey(tx, {
  oldPublicKey,
  newPublicKey,
  oldSignature, // by the old key
  newSignature, // by the new key
});
```

## Dans l'interface utilisateur

Le kit [`@qorechain/react`](/sdk/guides/react) expose tout cela dans React : le
hook `usePqcStatus` et le composant `<QuantumSafeBadge/>` affichent un indicateur
**Résistant au quantique** dès que le compte connecté possède une clé PQC enregistrée. Les deux lisent le
statut via `getPqcStatus` ; contre les points d'accès publics (sans espace de noms
`qor_`), ils ne peuvent donc pas confirmer une clé aujourd'hui ; voir les limites des réseaux en production
sur la page React.
