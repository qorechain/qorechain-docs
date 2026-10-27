---
slug: /developer-tools/wallet-adapter
title: Wallet Adapter
sidebar_label: Wallet adapter
sidebar_position: 2
---

# Wallet adapter (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter` ajoute QoreChain aux portefeuilles Cosmos qui exposent `signDirect` (Keplr, Leap, Cosmostation) et construit les transactions exigées par la chaîne : une transaction de la voie native doit porter une signature ML-DSA-87 (FIPS 204) à côté de la signature secp256k1 classique du compte, et un portefeuille standard ne peut pas produire la signature ML-DSA-87. L'adaptateur la produit, la place dans le corps de la transaction, puis demande au portefeuille inchangé une signature ordinaire. Il s'adresse aux développeurs de dApps et de portefeuilles, ainsi qu'aux concepteurs d'outils qui ont besoin, en JavaScript, de portefeuilles QoreChain unifiés, de messages de fenêtre d'autorisation EVM ou de messages de clés liées (authenticators). La version actuelle est la 0.4.0.

Si vous avez seulement besoin qu'une dApp envoie une transaction depuis le portefeuille QoreX d'un utilisateur, le chemin le plus court est [`qorexSignAndBroadcast`](#qorex) dans ce paquet, ou les paquets QoreX listés dans l'index [Paquets pour développeurs](/developer-tools/overview#group-qorex). Si vous écrivez un portefeuille et voulez une bibliothèque de signature complète en cinq langages, lisez d'abord [QoreSign](/qoresign/overview).

## Innovations {#innovations}

- **Le portefeuille signe un corps ordinaire.** L'adaptateur construit le corps sans l'extension, signe la couche ML-DSA-87 sur les sign-bytes, la place dans le corps comme option d'extension `/qorechain.pqc.v1.PQCHybridSignature` (identifiant d'algorithme 1), et n'appelle `wallet.signDirect` qu'ensuite, sur le `SignDoc` terminé. Le portefeuille produit une signature `SIGN_MODE_DIRECT` standard et n'a besoin d'aucun code spécifique à QoreChain. Le résultat est les octets `TxRaw` habituels.
- **Sélecteur de sign-bytes par réseau.** La clé ML-DSA-87 signe l'une de deux formes d'octets, et un réseau n'en vérifie qu'une seule à une hauteur donnée. Avec `signBytesVersion: "auto"` (la valeur par défaut), le signataire interroge le nœud avec `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` pour `v3.2.0` puis `v3.1.98`, signe la forme v2 (étiquette de domaine `qorechain-pqc-hybrid-v2` plus le chain ID) si l'une des deux hauteurs est supérieure à zéro, met la réponse en cache 60 secondes par URL REST et chain ID, et lève une erreur au lieu de deviner lorsqu'il ne peut pas interroger. Vérifié le 27 octobre 2026 sur les nœuds en production : le mainnet et le testnet se résolvent tous deux en `v2`, et un appel pour `qorechain-vladi` sans `rest` lève une erreur. `refreshSignBytesVersion()` contourne le cache et `isHybridSignBytesRejection()` reconnaît le refus `pqc` code 21, de sorte qu'un appelant peut résoudre à nouveau et réessayer une fois lorsqu'un réseau se met à niveau alors qu'un portefeuille est ouvert.
- **Une clé ML-DSA-87 par mnémonique, partagée entre les outils.** `walletFromMnemonic` dérive la clé comme `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` fourni à la génération de clé ML-DSA-87. Elle est liée à l'adresse du compte et c'est la même dérivation que celle du SDK, de `@qorechain/chain-bridge`, de QoreX et de la commande `qorechaind tx pqc recover-key` : un mnémonique donne donc une seule clé, quel que soit l'outil qui signe. Voir [Dérivation et récupération déterministes de la clé](/developer-guide/post-quantum-signing#key-derivation).
- **Un compte, trois formes d'adresse, une clé de signature.** `generateQoreWallet` et `walletFromMnemonic` renvoient ensemble les formes `qor1`, `0x` (EIP-55) et SVM base58 de la même identité de 20 octets, avec la paire de clés ML-DSA-87. `signClassicalEth` et `signHybridEth` signent les transactions de la voie Cosmos avec cette clé eth-native (`eth_secp256k1`), de sorte que la même clé signe aussi des transactions EVM ailleurs.
- **Codes de récupération PQC.** `generatePqcRecoveryCode` renvoie un secret aléatoire de 256 bits au format `QRC1-` suivi de base32 Crockford avec une somme de contrôle de 24 bits. `pqcKeyFromRecoveryCode(code, address)` en dérive la clé ML-DSA-87, liée à l'adresse. Un caractère mal saisi est refusé avec un message, au lieu de dériver silencieusement une clé qui ne correspond à rien, et le code n'est volontairement pas une phrase de récupération.
- **QoreX comme signataire.** `qorexSignAndBroadcast` envoie des messages encodés en protobuf (1 à 32 par appel, mémo jusqu'à 256 octets, limite de gas de 100 000 à 5 000 000) au portefeuille QoreX de l'utilisateur, qui les affiche décodés, ajoute la couche ML-DSA-87 que seul le portefeuille peut produire, signe et diffuse. L'adaptateur vérifie les bornes localement et refuse les messages de gestion de clés PQC (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`), y compris à l'intérieur d'un `MsgExec` authz à n'importe quelle profondeur. Un `MsgExec` qu'il ne peut pas décoder est refusé.
- **Briques pour la fenêtre d'autorisation EVM, jamais une ouverture automatique.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow` et `isEvmWindowRejection` couvrent la fenêtre qui doit être ouverte avant un envoi EVM. Chaque borne (`blocks` de 1 à 17 280, `maxTxs` de 1 à 1 000, `maxValue` supérieur à zéro) est obligatoire et vérifiée côté client sans valeur par défaut, les champs d'état de la fenêtre sont des BigInt, et le paquet n'ouvre jamais une fenêtre de lui-même : l'utilisateur doit voir une étape d'autorisation explicite.
- **Messages de clés liées (authenticators) avec condensés exacts pour la chaîne.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm` et `buildMetaMaskExecuteCosmos` construisent les messages qui permettent à une clé Phantom ou MetaMask de dépenser depuis un compte QoreChain sous un ensemble de permissions et une règle de dépense. `evmAuthSignBytesV2` est le condensé de la chaîne v3.2.3, qui lie aussi la limite de gas de l'appel (elle doit être non nulle). Le nonce est la séquence d'authenticator de la clé liée, pas le nonce EVM du compte. Voir [Authenticators et dépenses déléguées](/sdk/guides/authenticators).
- **Rotation de clé sûre.** `rotateFromLegacyWalletKey` construit un `MsgRotatePQCKey` à partir d'une clé produite par la dérivation par signature de portefeuille, aujourd'hui retirée, et refuse sauf si la clé qu'il re-dérive est égale à celle enregistrée. `rotatePqcKeyMsgFromMnemonic` fait passer une clé héritée `SHAKE-256(mnemonic)` à la clé canonique liée à l'adresse, et refuse la dérivation héritée comme nouvelle clé.

## Comment l'utiliser {#how-to-use}

Installez l'adaptateur avec les deux pairs cosmjs (version 0.32) :

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

Le paquet est un module ES de JavaScript pur avec des typages TypeScript. Le manifeste ne contient aucun quickstart testé pour lui. Les extraits ci-dessous proviennent des typages et du code source du paquet ; le 27 octobre 2026, la génération de portefeuille, le résolveur de sign-bytes, la lecture de l'état de la fenêtre EVM, `openEvmWindowMsg` et l'erreur de la fonction retirée ont été exécutés sur le paquet 0.4.0 publié et sur les points de terminaison REST en production du testnet et du mainnet, et les 102 tests propres au paquet passent. Les extraits de signature et de QoreX n'ont pas été exécutés de bout en bout.

### Générer un portefeuille unifié {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)` construit le même portefeuille à partir de 32 octets secrets : la graine devient la clé privée secp256k1, elle doit donc provenir d'une source aléatoire sûre ou d'une fonction de dérivation de clé appliquée à un matériau que seul l'utilisateur détient. Ne la dérivez jamais d'une signature qu'un site web peut demander à un portefeuille de produire.

### Enregistrer la chaîne dans les portefeuilles de l'utilisateur {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo` utilise le coin type 118, le préfixe bech32 `qor`, le denom `uqor` avec 6 décimales et un pas de prix du gas de 0,1, 0,15 et 0,25 uqor par gas, ce qui respecte le plancher de frais de 0,1 uqor par gas. `addQoreEvmToWallet` a besoin de `rpcUrl`.

### Signer une transaction hybride avec un portefeuille Cosmos {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

À savoir :

- L'adaptateur signe ; vous diffusez. Il ne construit pas le message d'enregistrement de clé. Enregistrez une fois la clé ML-DSA-87 du compte avec [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`), le SDK ou la CLI (voir [Enregistrer votre clé](/developer-guide/post-quantum-signing#pqc-key-registration)) ; cette première transaction est celle qui peut être signée de façon classique.
- Une page web qui détient la clé ML-DSA-87 du compte est une conception à éviter. `derivePqcKeyFromWallet`, qui servait à la dériver à partir d'une signature de portefeuille, a été retirée en 0.3.0 et lève toujours une erreur. Une dApp doit envoyer ses messages à QoreX (ci-dessous) et laisser le portefeuille signer.
- Si une diffusion est refusée avec `pqc` code 21 et que vous avez utilisé `"auto"`, appelez `adapter.refreshSignBytesVersion()` et signez une nouvelle fois ; ne réessayez pas si vous avez passé explicitement `"v1"` ou `"v2"`. Voir [Dépannage du code 21](/developer-guide/post-quantum-signing#code-21).

### Envoyer via QoreX {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value` est du protobuf en octets (un `Uint8Array`, un tableau de nombres ou du base64), signé exactement tel que fourni. Une dApp ne peut pas changer le réseau du portefeuille. Il faut l'extension QoreX 0.3.5 ou l'application 1.1.5, ou une version ultérieure ; testez avec `hasQorexSignAndBroadcast()` plutôt qu'avec une vérification de version. Le contrat au niveau du protocole se trouve dans [Extension de navigateur QoreX](/qorex/browser-extension#sign-and-broadcast).

### Construire un message de fenêtre EVM {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

L'ordre compte : ouvrez la fenêtre, puis lisez le nonce EVM, puis signez la transaction EVM, car l'ouverture d'une fenêtre fait avancer la séquence du compte, qui est aussi son nonce EVM. `openEvmWindowMsg` ne construit que la forme sans périmètre de la fenêtre ; une fenêtre à périmètre limité (`native_only`, `allowed_targets`) nécessite le SDK. Contexte : [Fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window) et [Votre première transaction](/getting-started/first-transaction#evm-window).

### Autres points d'entrée

| Tâche | Fonctions |
|---|---|
| Récupérer ou faire pivoter une clé PQC | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| Signer avec la clé eth-native | `signClassicalEth` (l'enregistrement de clé classique), `signHybridEth` |
| Utilitaires de sign-bytes | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| Lier une clé externe et dépenser avec elle | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, les fonctions `buildPhantom*` et `buildMetaMask*` |

## Comment y accéder {#how-to-access}

- **Réseaux :** mainnet `qorechain-vladi` et testnet `qorechain-diana`. Passez `chainId` et l'URL `rest` correspondante ([points de terminaison](/developer-tools/overview#how-to-access)).
- **Portefeuilles :** Keplr est le portefeuille qu'utilisent le guide QoreSign et les exemples ([portefeuilles compatibles Keplr](/qoresign/guides/keplr-compatible-wallets)). Leap et Cosmostation exposent la même interface `signDirect` et le paquet est écrit pour tout portefeuille de ce type ; il n'a pas été vérifié avec eux pour cette page. MetaMask utilise la voie EVM, pas le signataire de l'adaptateur, et nécessite une fenêtre EVM ouverte pour chaque envoi ([Paquets pour développeurs](/developer-tools/overview#how-to-access)). Phantom se lie comme authenticator.
- **Compte et clé :** un compte alimenté en QOR pour les frais, et la clé ML-DSA-87 du compte enregistrée on-chain avant la première transaction hybride.
- **Prérequis :** Node.js avec modules ES, ou un bundler pour le navigateur. Dépendances pairs `@cosmjs/stargate` et `@cosmjs/proto-signing` `^0.32`. Dépendances d'exécution : `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto` et `@cosmjs/encoding` `^0.32`.
- **Coût :** le paquet est gratuit ; les transactions paient les frais du réseau à 0,1 uqor par gas ou plus. L'enregistrement d'une clé utilise une grande limite de gas car la clé publique ML-DSA-87 fait 2 592 octets.

## Où il est publié {#where-published}

| Registre | Paquet | Version | Lien |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (publiée le 20 octobre 2026) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

Source : [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (publique, tag `v0.4.0`, Apache-2.0). Il n'est pas publié sur PyPI, crates.io, Maven Central ni sur le proxy Go. Voir aussi : [Paquets pour développeurs](/developer-tools/overview), [QoreSign](/qoresign/overview), [Signature post-quantique](/developer-guide/post-quantum-signing), [Intégration pour les échanges](/developer-guide/exchange-integration).

## Limites et problèmes connus {#limits}

- **Il signe ; il ne diffuse pas, n'enregistre pas de clés et n'ouvre pas de fenêtres.** Aucune fonction n'enregistre la clé ML-DSA-87, et rien n'ouvre de fenêtre EVM à votre place.
- **Pas de preuve de possession.** Un enregistrement de clé réalisé avec un outillage qui n'utilise que ce paquet n'en porte aucune. La chaîne l'accepte tout de même, et vérifie la preuve lorsqu'il y en a une ([Preuve de possession](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` est retirée** (0.3.0) et lève toujours une erreur. Les comptes qui ont enregistré une clé avec elle doivent la faire pivoter avec `rotateFromLegacyWalletKey`.
- **Fenêtres sans périmètre uniquement.** `openEvmWindowMsg` n'a aucun champ de périmètre.
- **`qoreChainInfo` utilise le testnet par défaut.** Passez toujours `chainId` pour le mainnet.
- **Nonces d'authenticator.** Aucune requête n'expose encore la séquence d'authenticator de la clé liée, vous devez donc la suivre vous-même ; la chaîne répond `abstractaccount` code 11 lorsque la valeur est incorrecte. Le module d'authenticator est activé sur le testnet et désactivé sur le mainnet (voir la [vue d'ensemble du SDK](/sdk/overview)).
- **Pairs cosmjs 0.32.** Le SDK utilise cosmjs 0.39 ; installer les deux dans un même projet provoque une erreur `ERESOLVE` : gardez-les séparés ou passez `--legacy-peer-deps`.
- **Ne copiez pas depuis le README du paquet.** Il indique encore que le mainnet vérifie la première forme de sign-bytes et qu'un envoi MetaMask ne demande aucune étape supplémentaire. Les deux sont périmés : les deux réseaux vérifient la v2, et un envoi EVM nécessite une clé enregistrée et une fenêtre ouverte.
- **Aucun quickstart testé** n'est consigné pour ce paquet, et le chemin QoreX nécessite que le portefeuille soit installé, il ne peut donc pas s'exécuter dans un script.
