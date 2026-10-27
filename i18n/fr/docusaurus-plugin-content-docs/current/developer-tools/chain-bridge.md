---
slug: /developer-tools/chain-bridge
title: Chain Bridge et Handles
sidebar_label: Chain bridge et handles
sidebar_position: 3
---

# Chain bridge et handles

Cette page présente deux petits paquets côté serveur.

**`@qorechain/chain-bridge`** (0.2.3) est une bibliothèque Node.js pour les backends qui agissent sur QoreChain sans personne au clavier : elle envoie des QOR, enregistre la clé ML-DSA-87 d'un compte, enregistre des light nodes, déploie des contrats et, pour le détenteur de la clé d'autorité de licences de la chaîne, accorde et révoque des licences. Elle gère les deux choses qu'un backend ordinaire ne peut pas faire seul : la signature hybride ML-DSA-87 dont ont besoin les transactions de la voie native, et l'encodage protobuf exact des messages personnalisés de QoreChain. Elle s'adresse aux workers de hot wallet, aux backends de paiement et de dashboard et aux services similaires.

**`@qorechain/handles`** (0.1.0) résout un `@handle` QoreX en adresse et vérifie cryptographiquement la réponse avant de la renvoyer. Il s'adresse aux portefeuilles et aux services qui laissent une personne saisir `@alice` au lieu d'une adresse `qor1...`.

Aucun des deux paquets n'indique de dépôt source dans ses métadonnées de registre. Vous pouvez lire le code publié sur npm.

## Innovations {#innovations}

### Chain bridge {#innovations-chain-bridge}

- **Un mnémonique, une clé ML-DSA-87 canonique.** La clé est dérivée comme `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` puis par la génération de clé ML-DSA-87, la même dérivation que celle de l'[adaptateur de portefeuille](/developer-tools/wallet-adapter), du SDK et de QoreX, de sorte que la clé peut être récupérée avec `qorechaind tx pqc recover-key`. Les comptes enregistrés par un ancien outillage avec `SHAKE-256(mnemonic)` conservent leur clé héritée : lorsqu'une signature canonique est refusée avec un échec de vérification, le bridge réessaie une fois avec la clé héritée.
- **Forme des sign-bytes lue depuis la chaîne.** Lorsque `cosmosRest` est défini, le bridge demande au nœud les plans de mise à niveau appliqués (`v3.2.0` et `v3.1.98`) et signe la forme v2 si l'un des deux est appliqué, comme décrit sur la [page de l'adaptateur de portefeuille](/developer-tools/wallet-adapter#innovations). Si la chaîne refuse avec `pqc` code 21, il résout à nouveau une fois et signe de nouveau. Sur les réseaux en production, `cosmosRest` est obligatoire ; sans lui, un appel hybride lève une erreur au lieu de deviner.
- **Enregistre la clé à la première utilisation, mais vérifie d'abord la chaîne.** Lorsqu'une transaction hybride est refusée faute de clé PQC, le bridge envoie `MsgRegisterPQCKeyV2` (une transaction classique, que la chaîne autorise pour un premier enregistrement) et réessaie. Comme ce message coûte ses frais même lorsqu'il est refusé, il lit d'abord `GET /qorechain/pqc/v1/account/{address}` : si le compte détient déjà une clé qui n'est ni la clé canonique ni la clé héritée de votre mnémonique, il lève `pqc_key_mismatch` et n'envoie rien. Avec `cosmosRest`, un enregistrement porte aussi la preuve de possession une fois que le réseau a appliqué v3.2.3 (c'est le cas du mainnet et du testnet).
- **Identifiants de fonctionnalités de licence à partir de noms simples.** `featureIdsFor({ type, chains })` associe une description de produit aux identifiants de fonctionnalités de la chaîne (`validator_operator` plus `validator_<chain>`, `lightnode_operator`, `qcb_bridge` plus `bridge_<chain>`), normalise les noms de chaîne en texte libre comme « Solana » ou « BNB Chain », et écarte une chaîne inconnue au lieu de construire un identifiant que la chaîne rejetterait. Vérifié le 27 octobre 2026 : `featureIdsFor({ type: "validator", chains: ["Solana", "Ethereum", "Foo"] })` a renvoyé `validator_operator`, `validator_solana`, `validator_ethereum` et écarté `Foo`.
- **JavaScript pur, aucun module natif.** C'est un module ES pour Node.js 18 ou ultérieur, il fonctionne donc dans des workers serverless. Outre l'entrée principale, il exporte `@qorechain/chain-bridge/proto` (les encodeurs de format filaire) et `@qorechain/chain-bridge/features` (la correspondance des fonctionnalités).

### Handles {#innovations-handles}

- **Une résolution est vérifiée deux fois avant d'être renvoyée.** L'enregistrement doit porter la signature ed25519 du registre, vérifiée avec une clé publique du registre que vous épinglez dans le client, et la propre signature secp256k1 du propriétaire sur la déclaration, dont la clé publique doit avoir pour hachage l'adresse `qor1` de l'enregistrement. Un enregistrement qui échoue à l'une ou l'autre vérification n'est jamais renvoyé.
- **Le magasin d'épingles est le vôtre.** `resolve` renvoie `pin.status` sous la forme `new`, `match` ou `CHANGED` en comparant l'enregistrement à une épingle que vous détenez, et n'épingle jamais de lui-même. Vous épinglez après que l'utilisateur a vu l'adresse et poursuivi. L'intérêt d'une épingle est de remarquer que le registre s'est mis à dire autre chose ; elle doit donc être conservée par quelqu'un d'autre que la partie vérifiée, par exemple sur l'appareil de l'utilisateur.
- **Seules les adresses signées par le propriétaire sont renvoyées pour un réseau.** `addressForNetwork(record, caip2)` renvoie l'adresse `qor1` pour les réseaux QoreChain, et l'adresse `0x` pour les chain ID 9800 et 9801 lorsque l'enregistrement est un compte unifié. Les adresses sur d'autres chaînes que le registre se contente d'attester ne sont pas renvoyées pour l'envoi.
- **Recherche inverse à usage d'affichage uniquement.** `reverse(address)` renvoie un handle à afficher dans l'historique. Son résultat ne doit jamais devenir la destination d'un envoi.
- **La déclaration et la suppression utilisent des domaines de signature distincts.** `signClaim` et `signDelete` signent des messages différents : une signature de suppression ne peut donc pas être rejouée comme déclaration.

## Comment l'utiliser {#how-to-use}

### Chain bridge {#use-chain-bridge}

```bash
npm install @qorechain/chain-bridge
```

Il tire `@qorechain/wallet-adapter` (^0.4.0), `@qorechain/pqc` (^0.2.1), cosmjs 0.32 et ethers 6. Il n'existe pas de quickstart testé pour lui ; l'extrait ci-dessous suit les typages du paquet et le [guide d'intégration pour les échanges](/developer-guide/exchange-integration#chain-bridge). Le 27 octobre 2026, le constructeur, `featureIdsFor` et la liste des méthodes ont été vérifiés sur le paquet 0.2.3 publié ; aucune transaction n'a été envoyée.

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc-testnet.qore.host",
  cosmosRest: "https://api-testnet.qore.host", // picks the sign-bytes form; required on both live networks
  chainId: "qorechain-diana",
  signerMnemonic: process.env.WORKER_MNEMONIC, // from your secrets manager, never in source code
});

// Once per account (the bridge also does it on first use if the chain reports no key).
await bridge.registerPqc({ mnemonic: process.env.WORKER_MNEMONIC });

// Amounts are in uqor (6 decimals): 1 QOR = 1000000.
const { txHash, code } = await bridge.sendTokens({ to: "qor1...", amountUqor: "1000000" });
```

Méthodes principales :

| Méthode | Ce qu'elle fait | Clé utilisée |
|---|---|---|
| `sendTokens({ to, amountUqor })` | `MsgSend` bank, signé en hybride | signataire |
| `registerPqc({ mnemonic })` | `MsgRegisterPQCKeyV2`, classique | ce compte |
| `registerLightNode({ operatorMnemonic, nodeType, version, capabilities })` | enregistrement de light node, signé en hybride | opérateur |
| `grantLicense`, `grantLicenseSet`, `revokeLicense`, `suspendLicense`, `resumeLicense` | messages du module de licences | la clé d'autorité de licences de la chaîne |
| `deployEvm({ bytecode, abi, args })` | un déploiement de type Ethereum via `eth_sendRawTransaction` | clé du déployeur |
| `deploySvm({ bytecode })` | déploiement de programme SVM | signataire |
| `createVestingAccount`, `createPeriodicVestingAccount` | création de compte de vesting | signataire |
| `featureIdsFor`, `normalizeChain` | utilitaires locaux | aucune |

Chaque appel renvoie `{ txHash, code, height, gasUsed }`, et un appel hybride indique aussi `signBytesVersion`. Le prix du gas par défaut est de 0,1 uqor par gas, ce qui est le plancher du réseau (un `sendTokens` à 300 000 gas coûte 30 000 uqor à ce prix, et les 6 000 000 de gas par défaut d'un enregistrement de clé coûtent 600 000 uqor, que vous payez une fois par compte). La voie EVM utilise 18 décimales : la `value` de `deployEvm` est en wei. Définissez `keyType: "eth_secp256k1"` dans la configuration pour signer avec la clé eth-native unifiée (une identité sous les formes `qor1`, `0x` et SVM) au lieu de la clé coin-type-118 par défaut ; cette option figure dans le code source et dans le README de l'adaptateur de portefeuille, mais pas dans les typages.

### Handles {#handles}

```bash
npm install @qorechain/handles
```

Ses seules dépendances d'exécution sont `@noble/curves`, `@noble/hashes` et `bech32`. Il n'existe pas de quickstart testé pour lui. L'extrait suit le README et les typages du paquet ; le 27 octobre 2026, `isHandleInput`, `normalizeHandle` et la liste des exports ont été vérifiés sur le paquet 0.1.0 publié, et aucun registre n'a été contacté.

```ts
import { HandleClient, type PinStore } from "@qorechain/handles";

const client = new HandleClient({ baseUrl: registryUrl, registryPubkeyHex });

// You supply the pin store, ideally on the user's device.
const pins: PinStore = { get: (handle) => load(handle), put: (pin) => save(pin) };

const { record, pin } = await client.resolve("@alice", pins);

if (pin.status === "CHANGED") {
  // Stop. Show both addresses in full and require explicit confirmation.
  // Never update the pin silently.
}

// Show record.qorAddress to the user. When they proceed (and only then):
await client.pin(record, pins, Date.now());
```

`resolve` lève une erreur lorsque le handle est inconnu, que le registre est injoignable ou que la réponse échoue à la vérification. `isHandleInput(text)` distingue un handle d'une adresse (un handle fait de 3 à 20 caractères parmi `a-z`, `0-9` et `_`, ou commence par `@` ; une chaîne `qor1...` ou `0x...` n'est jamais un handle). Autres exports : `claimSignBytes`, `signClaim`, `deleteSignBytes`, `signDelete`, `verifyResolution`, `checkPin`, `QorexError`. Pour savoir comment QoreX utilise les handles, voir [Envoyer à un @handle](/qorex/browser-extension#handle-send) et [Compte et Dashboard](/qorex/account-and-dashboard).

## Comment y accéder {#how-to-access}

- **Réseaux :** le chain bridge fonctionne sur le mainnet `qorechain-vladi` ou le testnet `qorechain-diana` avec les points de terminaison listés sur la page [Paquets pour développeurs](/developer-tools/overview#how-to-access) (le RPC EVM et le chain ID 9800 ou 9801 pour `deployEvm`).
- **Prérequis du chain bridge :** Node.js 18 ou ultérieur ; un compte alimenté dont votre worker détient le mnémonique (conservez-le dans un gestionnaire de secrets) ; et l'URL REST du réseau. La clé ML-DSA-87 est dérivée du mnémonique et enregistrée à la première utilisation : le compte doit donc détenir assez de QOR pour les frais de cet enregistrement.
- **Les appels de licences** ne réussissent que s'ils sont signés par la clé configurée dans la chaîne comme autorité de licences. Un développeur extérieur ne la détient pas ; ces méthodes sont donc destinées à l'opérateur de cette clé. Pour les licences et l'enregistrement d'un light node en tant qu'utilisateur, voir [Enregistrement et licences](/light-node/registration-and-licensing).
- **Prérequis de handles :** l'URL de base du registre et sa clé publique ed25519 (hex), un magasin d'épingles que vous implémentez, et `fetch`. Les lectures ne nécessitent aucun compte.
- **Coût :** les deux paquets sont gratuits. Les transactions du chain bridge paient les frais du réseau.

## Où il est publié {#where-published}

| Registre | Paquet | Version | Lien |
|---|---|---|---|
| npm | `@qorechain/chain-bridge` | 0.2.3 (publiée le 20 octobre 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/chain-bridge) |
| npm | `@qorechain/handles` | 0.1.0 (publiée en août 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/handles) |

Les deux sont sous Apache-2.0 et publiés uniquement sur npm (pas sur PyPI, crates.io, Maven Central ni sur le proxy Go). Aucun n'indique de dépôt source dans ses métadonnées de registre, il n'y a donc pas de page source publique à lier ; le code se trouve dans l'archive publiée. Pour lire les versions en direct, voir [Comment obtenir les versions en direct](/developer-tools/overview#live-versions).

## Limites et problèmes connus {#limits}

### Chain bridge {#limits-chain-bridge}

- **Les déploiements EVM nécessitent une fenêtre ouverte.** `deployEvm` envoie une transaction Ethereum standard. Depuis la chaîne v3.2.0, la voie EVM n'admet une transaction que d'un compte disposant d'une clé ML-DSA-87 enregistrée et d'une fenêtre d'autorisation EVM ouverte, et le bridge n'a aucune méthode pour en ouvrir une. Ouvrez la fenêtre avec un autre outillage (l'[adaptateur de portefeuille](/developer-tools/wallet-adapter#evm-window), le SDK ou QoreX) avant de l'appeler, sinon la transaction est refusée (codespace `pqc`, code 26, 27 ou 28). Cela découle des règles de la chaîne et du code source du paquet ; ce n'a pas été essayé sur un réseau en production pour cette page. Le README du paquet qualifie encore la voie EVM d'exemptée, ce qui est périmé.
- **`deploySvm`** cible la voie SVM, qui n'accepte pas encore de transactions sur aucun des deux réseaux.
- **Des méthodes de téléversement de contrats existent mais ne sont pas documentées.** Le code source contient aussi `storeWasm`, `instantiateWasm` et `deployWasm` pour les contrats QoreChain Native, qui ne figurent ni dans les typages ni dans le README. Le téléversement est réservé à la gouvernance pour les comptes ordinaires sur les réseaux en production : attendez-vous donc à un refus pour un compte ordinaire.
- **La clé est dérivée sur le serveur.** Le mnémonique reste dans votre processus. Gardez-le hors des journaux et du contrôle de version, et ne le réutilisez pas comme portefeuille personnel.
- **Un enregistrement n'est pas gratuit.** Le bridge enregistre lui-même la clé à la première utilisation ; un rail qui déplace des fonds doit s'enregistrer à l'avance et confirmer le résultat avec `GET /qorechain/pqc/v1/account/{address}` avant le premier retrait.
- **cosmjs 0.32.** Ne l'installez pas à côté du SDK (cosmjs 0.39) dans un même projet ; npm signale `ERESOLVE`.
- **Parties périmées du README.** Le README indique que le mainnet reste sur la première forme de sign-bytes ; les deux réseaux vérifient la v2 (voir [Sécurité post-quantique](/architecture/post-quantum-security)).
- **Pas de quickstart testé, pas de dépôt source public.**

### Handles {#limits-handles}

- **L'adresse du registre et sa clé publique ne sont pas publiées** dans le paquet ni dans ce manuel. QoreX et le dashboard les ont intégrées ; un intégrateur ne peut donc utiliser le paquet que si on lui fournit ces deux valeurs.
- **Les handles ne sont pas des noms on-chain.** Le registre est un service hors chaîne exploité pour QoreX ; le paquet vérifie ses réponses mais ne peut pas le rendre disponible. Si le registre est injoignable, `resolve` lève une erreur `NETWORK_UNAVAILABLE`, et `isReachable()` est une sonde rapide qu'une interface peut utiliser pour masquer les fonctions de handles.
- **Il n'épingle rien pour vous.** Si vous n'appelez jamais `pin`, chaque résolution indique `new`. L'appelant est responsable du stockage sûr des épingles.
- **Seules les adresses signées par le propriétaire sont utilisées pour l'envoi.** Les adresses sur d'autres chaînes que le registre atteste ne sont pas renvoyées par `addressForNetwork`.
- **Les appels d'écriture demandent plus que le paquet.** `claim`, `deleteHandle` et `bySub` communiquent avec les points de terminaison d'écriture du registre et nécessitent une signature du propriétaire (`signClaim`, `signDelete`) ou un jeton de compte ; ils sont destinés aux applications de portefeuille.
- **Pas de quickstart testé, pas de dépôt source public.**
