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
**résistante au quantique par défaut** : un seul appel pour être protégé par PQC.

## Vérifier le statut

`isPqcRegistered` / `getPqcStatus` lisent si une adresse possède une clé PQC enregistrée
via la méthode JSON-RPC `qor_getPQCKeyStatus`. Ils acceptent soit un
`QorClient`, soit le client composé issu de `createClient` :

```ts
import { createClient, isPqcRegistered, getPqcStatus } from "@qorechain/sdk";

const client = createClient({ network: "mainnet", endpoints: { /* … */ } });

const safe = await isPqcRegistered(client, "qor1…");
const status = await getPqcStatus(client, "qor1…");
// status: { registered: boolean; algorithmId?: number; pubkey?: string | Uint8Array }
```

Le même statut est aussi lisible côté EVM via le précompilé
`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey)`
à `0x0000000000000000000000000000000000000A02` (exposé sous le nom
`pqcKeyStatus` dans `@qorechain/evm`). Les assistants ci-dessus privilégient la méthode JSON-RPC,
qui n'a besoin d'aucun pair viem.

## Enregistrer en un seul appel

`ensurePqcRegistered` rend un compte résistant au quantique. C'est **idempotent** : passez une
source de statut et il ignore l'enregistrement lorsque la clé est déjà enregistrée,
de sorte qu'il est sûr de l'appeler à chaque démarrage de l'application.

```ts
import { generatePqcKeypair, ensurePqcRegistered } from "@qorechain/sdk";

const tx = await client.connectTx(signer);
const pqcKeypair = generatePqcKeypair(); // or derive deterministically from the wallet

const res = await ensurePqcRegistered(tx, {
  pqcKeypair,
  statusSource: client, // makes the call idempotent (skips if already registered)
});
// res: { alreadyRegistered: boolean; txHash?: string }
```

En coulisses, il construit et diffuse `MsgRegisterPQCKey` avec la clé publique Dilithium
du signataire (issue de `pqcKeypair`) et, optionnellement, la clé publique ECDSA
du compte.

## Signer en hybride

`migrateToHybrid` garantit l'enregistrement et renvoie un chemin d'envoi hybride avec la
paire de clés pré-liée aux constructeurs `buildHybridTx` / `signAndBroadcastHybrid`
existants :

```ts
import { migrateToHybrid } from "@qorechain/sdk";

const hybrid = await migrateToHybrid(tx, { pqcKeypair, statusSource: client });

await hybrid.signAndBroadcastHybrid({
  registry,
  signer,          // classical secp256k1 direct signer
  messages,
  fee,
  chainId,
  accountNumber,
  sequence,
  transport,       // a connected broadcast transport (e.g. StargateClient)
});
```

## Faire pivoter une clé

Si vous devez faire pivoter la clé PQC (mise à niveau d'algorithme ou clé compromise), utilisez
`migratePqcKey`, qui diffuse `MsgMigratePQCKey` en prouvant la possession à la fois de la
clé ancienne et de la nouvelle :

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
**Résistant au quantique** dès que le compte connecté possède une clé PQC enregistrée.
