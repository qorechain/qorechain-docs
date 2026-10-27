---
slug: /developer-tools/chain-dev-sdk
title: Kit de développement de chaîne
sidebar_label: Kit de développement de chaîne
sidebar_position: 34
---

# Kit de développement de chaîne (modèles EVM et QoreChain Native)

Le kit de développement de chaîne est la partie du SDK QoreChain **0.11.0** qui aide les équipes Solidity et de contrats intelligents à construire sur QoreChain avec les outils qu'elles utilisent déjà. Il ajoute des définitions de chaîne viem et des helpers de fenêtre d'autorisation EVM à `@qorechain/evm`, quatre nouveaux modèles de projet à `create-qorechain-dapp` (Foundry, Hardhat 3, viem avec wagmi, et un jeton CosmWasm QoreChain Native), des démarrages rapides EVM pour cinq langages, et une référence sur les différences entre l'EVM de QoreChain et Ethereum. Il s'adresse aux équipes Solidity qui portent des contrats depuis Ethereum, aux développeurs front-end de dApps sur wagmi et RainbowKit, aux développeurs CosmWasm, et aux mainteneurs d'outils EVM qui veulent ajouter QoreChain.

:::caution À venir : le SDK 0.11.0 est taggé mais pas publié sur npm
Le SDK 0.11.0 est taggé sur GitHub (`qorechain/qorechain-sdk`, tag `v0.11.0`, 27 octobre 2026). **Sa publication sur npm est en attente**, et le 27 octobre 2026 `npm view` pour la version 0.11.0 de `@qorechain/evm`, `@qorechain/sdk`, `@qorechain/react`, `@qorechain/svm` et `create-qorechain-dapp` n'a rien trouvé. Cette page ne donne **aucune commande d'installation pour 0.11.0**. Chaque élément marqué **à partir de 0.11.0** ci-dessous ne fonctionne pas depuis npm aujourd'hui. Les éléments marqués **disponible aujourd'hui** fonctionnent : ils proviennent de `@qorechain/sdk` 0.10.0, `@qorechain/evm` 0.8.0, `create-qorechain-dapp` 0.10.0 et des SDK de langage en 0.10.0. 0.11.0 ne modifie que les paquets npm ; les SDK Python, Rust, Go et Java restent en 0.10.0.
:::

Le kit cible le mainnet (`qorechain-vladi`, EVM chain ID 9801) et le testnet (`qorechain-diana`, EVM chain ID 9800).

## Disponible aujourd'hui et à venir dans 0.11.0 {#status}

| Élément | Statut | Où |
|---|---|---|
| Lecture avec ethers v6, web3.py, go-ethereum, alloy ou web3j sur les endpoints publics | **Disponible aujourd'hui** (aucun paquet QoreChain nécessaire) | [Démarrage rapide 1](#quickstart-ethers) |
| `createEvmClient`, helpers ERC-20, ERC-721 et ERC-1155, liaisons `precompiles`, `PRECOMPILE_ADDRESSES` | **Disponible aujourd'hui** dans `@qorechain/evm` 0.8.0 | [Démarrage rapide 2](#quickstart-evm-080) |
| Ouverture et lecture d'une fenêtre d'autorisation EVM depuis TypeScript, avec `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount` | **Disponible aujourd'hui** dans `@qorechain/sdk` 0.10.0 | [Démarrage rapide 5](#quickstart-open-window) |
| Les mêmes constructeurs de fenêtre en Python, Go, Rust et Java | **Disponible aujourd'hui** dans les SDK 0.10.0 | [API principale](#main-api) |
| Helpers de consentement EIP-7702 `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection` | **Disponible aujourd'hui** dans `@qorechain/sdk` 0.10.0 | [API principale](#main-api) |
| Le générateur de projet avec les modèles `evm-solidity`, `fullstack-web`, `rollup-app` | **Disponible aujourd'hui** dans `create-qorechain-dapp` 0.10.0 | [Démarrage rapide 6](#quickstart-scaffold-live) |
| Définitions de chaîne viem `qorechain` et `qorechainTestnet`, `QORECHAIN_CHAINS`, `QORECHAIN_REST_ENDPOINTS` | **À partir de 0.11.0** (à venir) | [Démarrage rapide 3](#quickstart-viem) |
| `evmWindowStatus`, `openEvmWindowMessage`, `evmWindowCost`, `classifyEvmWindowRejection`, convertisseurs d'adresses, constantes de fenêtre, sous-chemin `@qorechain/evm/window` | **À partir de 0.11.0** (à venir) | [Démarrage rapide 4](#quickstart-window-helpers) |
| Modèles `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` et le helper `pnpm window` | **À partir de 0.11.0** (à venir) | [Modèles](#templates) |
| `PqcStatusBadge` dans `@qorechain/react` | **À partir de 0.11.0** (à venir) | [API principale](#main-api) |

## Innovations {#innovations}

- **L'envoi est autorisé volontairement, avec une fenêtre bornée.** Une transaction EVM n'est admise que depuis un compte qui possède une clé ML-DSA-87 enregistrée et une fenêtre d'autorisation EVM ouverte. La fenêtre est ouverte par un message de la voie native signé en hybride (secp256k1 plus ML-DSA-87), de sorte que la clé secp256k1 que détient une bibliothèque EVM ne peut jamais autoriser une dépense à elle seule. La transaction Ethereum elle-même reste une transaction Ethereum normale.
- **Une fenêtre dimensionnée par des bornes, pas par la confiance.** Une fenêtre limite le nombre de blocs (1 à 17 280), le nombre de transactions EVM (1 à 1 000) et un total en uqor qui couvre la valeur plus les frais maximaux de chaque transaction admise. `nativeOnly` la limite aux simples transferts de QOR et `allowedTargets` (16 adresses au plus) limite les destinataires et refuse la création de contrat.
- **Un compte, deux encodages.** Pour un compte eth-native, les adresses `0x` et `qor1...` sont les mêmes 20 octets et affichent le même solde, de sorte qu'une seule clé fonctionne sur l'EVM et sur la voie native. QOR a 18 décimales sur l'EVM et 6 sur la voie native (`uqor`) ; 1 uqor vaut 10^12 wei.
- **Des helpers qui nomment le refus.** `classifyEvmWindowRejection` transforme une transaction refusée en l'une de quatre raisons, `no-pqc-key`, `no-window`, `exhausted` ou `invalid`, à partir d'une erreur viem ou ethers, d'un résultat de livraison de la voie native ou d'une chaîne de caractères.
- **Dimensionnement de la fenêtre en uqor.** `evmWindowCost` et `weiToUqorCeil` dimensionnent une fenêtre à partir de la valeur, du gaz et du plafond de frais, en arrondissant les wei à l'uqor supérieur, de sorte que le total couvre le pire cas.
- **Aucune ouverture automatique.** Le kit n'a volontairement aucun helper qui ouvre une fenêtre avant un envoi. La fenêtre existe pour que la dépense soit autorisée volontairement.
- **Simulation gratuite.** `eth_call` et `eth_estimateGas` fonctionnent pour n'importe quel compte, sans fenêtre ni clé enregistrée.
- **Des modèles qui câblent la fenêtre.** Les modèles Foundry et Hardhat incluent `pnpm window status|register|open`, qui dérive la clé ML-DSA-87 du même secret que la clé EVM, l'enregistre une fois et diffuse le message d'ouverture signé en hybride.
- **Une surface de compatibilité documentée.** Une page de référence (lue sur les endpoints publics le 27 octobre 2026) liste ce qui diffère d'Ethereum : types de transaction, forks, finalité, champs de frais, espaces de noms JSON-RPC et précompilations. Elle est résumée [ci-dessous](#evm-differences).

## Ce que contient le kit {#contents}

### `@qorechain/evm` {#evm-package}

**À partir de 0.11.0** (nouveau) :

- `qorechain` (9801) et `qorechainTestnet` (9800) : objets de chaîne viem avec les endpoints publics, la devise native QOR avec 18 décimales, et l'explorateur `https://explore.qore.network`. `QORECHAIN_CHAINS` liste les deux (mainnet, puis testnet) pour wagmi et RainbowKit. `QORECHAIN_REST_ENDPOINTS` associe chaque EVM chain ID à son endpoint REST de la voie native.
- `evmWindowStatus({ rest, address })` lit la fenêtre d'un compte via REST (`/qorechain/pqc/v1/evm_window/{address}`), accepte une adresse `qor1...` ou `0x`, et répond `{ found: false }` au lieu d'échouer lorsqu'il n'y en a pas. `parseEvmWindow` analyse la réponse brute.
- `openEvmWindowMessage(params)` vérifie les bornes et compose le `MsgOpenEVMWindow` de la voie native sous la forme d'un simple objet `{ typeUrl, value }`, prêt à être signé avec `@qorechain/sdk`. `checkOpenEvmWindowParams` exécute les vérifications seules.
- `evmWindowCost`, `weiToUqorCeil`, `classifyEvmWindowRejection`, `isEvmWindowRejection`, `toQorAddress`, `toEvmAddress`, et les constantes `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS` (17 280), `MAX_EVM_WINDOW_TXS` (1 000) et `MAX_EVM_WINDOW_TARGETS` (16).
- Les helpers de fenêtre sont aussi publiés sans viem au sous-chemin `@qorechain/evm/window`.

**Disponible aujourd'hui** (0.8.0 et suivantes) : `createEvmClient`, `evmAccountFromPrivateKey`, `writeContract`, les helpers `erc20`, les helpers ERC-721 et ERC-1155, les liaisons `precompiles` et `PRECOMPILE_ADDRESSES`. Voir le [guide EVM](/sdk/guides/evm).

### Modèles {#templates}

`create-qorechain-dapp` a trois modèles disponibles aujourd'hui (`evm-solidity`, `fullstack-web`, `rollup-app` ; voir [Générateurs de projet et CLI](/developer-tools/scaffolders-and-cli)). **À partir de 0.11.0** il en a sept. Les quatre nouveaux :

| Modèle | Ce que vous obtenez |
|---|---|
| `foundry` | Un projet Foundry : contrat `Counter`, tests, script de déploiement, endpoints RPC nommés `qorechain` et `qorechain_testnet`, et `pnpm window status\|register\|open`. |
| `hardhat` | Un projet Hardhat 3 et viem : contrat `Counter`, tests sur le réseau simulé, un module de déploiement Ignition, réseaux `qorechain` et `qorechainTestnet`, et `pnpm window status\|register\|open`. |
| `viem-wagmi` | Une dApp Vite, React, wagmi et RainbowKit avec le portefeuille QoreX (`@qorechain/qorex-rainbowkit`) et les définitions de chaîne de `@qorechain/evm`. Elle affiche le dernier bloc, le solde de QOR et la fenêtre EVM du compte. |
| `cosmwasm` | Un jeton CW20 QoreChain Native (CosmWasm) basé sur `cw20-base` de cw-plus, une build optimisée dans Docker, un script de proposition de téléversement par gouvernance, et des scripts d'instanciation et de requête sur le testnet. |

Les modèles épinglent `@qorechain/evm` et `@qorechain/sdk` à `^0.11.0`, ils ne s'installent donc pas depuis npm tant que 0.11.0 n'est pas publié.

### Guides dans le dépôt du SDK {#guides}

Le dépôt (`docs/docs/guides/`, tag `v0.11.0`) contient `evm-quickstarts.md` (lectures pour viem, ethers v6, web3.py, go-ethereum, alloy et web3j, plus une section « Before you send »), `evm-differences.md` (« QoreChain EVM compared with Ethereum »), `evm.md` et `cosmwasm.md`. Le même contenu sur ce site : [guide EVM](/sdk/guides/evm), [Développement EVM](/developer-guide/evm-development) et [Développement QoreChain Native](/developer-guide/cosmwasm-development).

Également dans le tag : des fichiers de contribution pour d'autres outils (définitions de chaîne viem, entrées de chaîne Sourcify et une extension Scaffold-ETH 2) sous `contrib/` et `templates/scaffold-eth-extension/`. Ce sont des fichiers préparés dans le dépôt, non fusionnés en amont.

## Cas d'usage {#use-cases}

1. **Une équipe Solidity qui porte depuis Ethereum.** Générez le modèle `foundry` (à partir de 0.11.0), copiez-y les contrats, exécutez `forge test` en local, exécutez `pnpm window register` une fois et `pnpm window open` avant chaque lot de déploiements. Les [différences](#evm-differences) listent ce qu'il faut changer : pas de transactions blob, PREVRANDAO est une constante, pas de traçage `debug_*` sur les endpoints publics.
2. **Un projet Hardhat 3 qui passe sur le testnet.** Générez le modèle `hardhat` (à partir de 0.11.0), gardez vos modules Ignition et déployez avec `pnpm deploy:testnet` après avoir ouvert une fenêtre.
3. **Un front-end de dApp sur wagmi.** Importez `QORECHAIN_CHAINS` dans la configuration wagmi et RainbowKit (à partir de 0.11.0), affichez la fenêtre de l'utilisateur avec `evmWindowStatus`, et expliquez un envoi refusé avec `classifyEvmWindowRejection`.
4. **Un service backend dans un autre langage.** Un service Python, Go, Rust ou Java lit les soldes et appelle des contrats avec web3.py, go-ethereum, alloy ou web3j comme sur Ethereum, **aujourd'hui**. Pour envoyer, il construit `MsgOpenEVMWindow` avec le SDK QoreChain 0.10.0 de ce langage, qui est disponible.
5. **Un développeur CosmWasm.** Générez le modèle `cosmwasm` (à partir de 0.11.0), testez le CW20 avec `cargo test`, construisez le Wasm optimisé, soumettez une proposition de gouvernance pour stocker le code, et instanciez-le sur le testnet une fois la proposition adoptée.
6. **Une intégration de portefeuille ou de conservation.** Une intégration qui détient des clés pour des utilisateurs doit savoir que la clé secp256k1 seule ne peut pas dépenser sur la voie EVM. Elle ouvre des fenêtres étroites (`nativeOnly` ou `allowedTargets`) signées avec la clé ML-DSA-87 du compte, **aujourd'hui** avec `openEvmWindowMsg` de `@qorechain/sdk` 0.10.0.
7. **Les mainteneurs d'outils EVM.** Les mainteneurs de viem, Sourcify ou Scaffold-ETH 2 peuvent lire les fichiers de contribution préparés pour ajouter les chain IDs 9800 et 9801.

## Comment ça fonctionne {#how-it-works}

- **La règle d'autorisation.** La chaîne admet une transaction EVM depuis un compte qui possède une clé ML-DSA-87 enregistrée et une fenêtre active, et la refuse sinon. La règle est la fonctionnalité de protocole `evm-pqc-authorisation-window`, activée sur les deux réseaux ; lisez-la à `/qorechain/pqc/v1/protocol_features`. Voir [Fenêtre d'autorisation EVM](/sdk/guides/evm#evm-window) et [le guide de la première transaction](/getting-started/first-transaction#evm-window).
- **Ouverture et fermeture.** `MsgOpenEVMWindow` (`/qorechain.pqc.v1.MsgOpenEVMWindow`) ouvre une fenêtre, signée en hybride ; ouvrir une fenêtre remplace toute fenêtre antérieure. `MsgCloseEVMWindow` la ferme.
- **Ce que borne une fenêtre.** Les blocs (un nombre de blocs, pas une durée), les transactions EVM, et un total en uqor qui couvre la valeur plus les frais maximaux (limite de gaz fois plafond de frais) de chaque transaction admise. `nativeOnly` et `allowedTargets` la restreignent davantage (voir [Restreindre une fenêtre](/sdk/guides/evm#evm-window-scope)).
- **Nonce.** La séquence native et le nonce EVM sont le même compteur. Ouvrir une fenêtre l'incrémente : ouvrez donc la fenêtre, puis lisez le nonce, puis signez la transaction EVM.
- **Le helper des modèles.** Dans `foundry` et `hardhat`, `pnpm window` dérive le compte de `PRIVATE_KEY` (ou `QORE_MNEMONIC`), dérive sa clé ML-DSA-87 du même secret, enregistre la clé une fois (`register`) et diffuse `MsgOpenEVMWindow` signé en hybride (`open`). Par défaut, il dimensionne une fenêtre de 600 blocs et 5 transactions pour des transactions allant jusqu'à 3 000 000 de gaz avec un plafond de frais de 250 gwei.
- **CosmWasm sur QoreChain Native.** Le téléversement de code passe par la gouvernance sur les deux réseaux (`code_upload_access` vaut `Nobody`) : le code est stocké par une proposition de gouvernance qui porte `MsgStoreCode` avec le module de gouvernance comme expéditeur. L'instanciation est ouverte à tous sur le testnet et fermée sur le mainnet (`instantiate_default_permission` vaut `Everybody` sur le testnet et `Nobody` sur le mainnet, lu le 27 octobre 2026). Lisez les deux à `/cosmwasm/wasm/v1/codes/params` ; listez les codes stockés à `/cosmwasm/wasm/v1/code`. Le mainnet n'avait aucun code stocké le 27 octobre 2026.

## L'EVM de QoreChain comparé à Ethereum {#evm-differences}

Lu sur les endpoints publics le 27 octobre 2026 (guide du SDK `evm-differences.md`). L'état du réseau (frais, temps de bloc, précompilations actives) est daté ; lisez-le en direct avant de vous y fier.

- **Envoi.** Chaque transaction EVM nécessite une clé ML-DSA-87 enregistrée et une fenêtre ouverte pour son expéditeur, sans exception par compte. Les déploiements, les transferts et les appels de contrat sont tous couverts. Un compte avec une clé enregistrée n'a pas non plus de chemin de signature classique sur la voie native : chaque transaction native qu'il signe est hybride.
- **Simulation.** `eth_call` et `eth_estimateGas` n'ont pas besoin de fenêtre.
- **Types de transaction.** Les types 0 (legacy), 1 (liste d'accès), 2 (EIP-1559) et 4 (EIP-7702) sont acceptés. **Les transactions blob EIP-4844 (type 3) sont refusées.** Les opcodes de Cancun fonctionnent, mais `blobGasUsed` et `excessBlobGas` valent toujours 0, `eth_blobBaseFee` n'existe pas et la précompilation d'évaluation de point (`0x0a`) renvoie une erreur.
- **Forks.** Jusqu'à London dès la genèse ; Shanghai, Cancun et Prague sont actifs ; Osaka n'est pas actif.
- **PREVRANDAO (EIP-4399) est une constante** (`0xff...ff`) et le `mixHash` de l'en-tête est nul. Ne l'utilisez jamais comme source d'aléa.
- **EIP-7702** est accepté avec une règle QoreChain : chaque autorité dont la délégation prendrait effet nécessite une clé PQC enregistrée et un consentement à usage unique enregistré avec `MsgAuthorizeEVMDelegation` (8 autorisations au plus par transaction, pas d'autorité en double). La fenêtre du sponsor ne compte pas comme consentement des autorités. `MsgClearEVMDelegation` supprime une délégation. Voir [Consentement EIP-7702](/sdk/guides/evm#evm-delegation-consent).
- **Finalité.** Les blocs sont finaux dès leur validation : `latest`, `safe` et `finalized` renvoient le même bloc, sans réorganisation ni oncles.
- **Frais (les deux réseaux, 27 octobre 2026).** `eth_gasPrice` 112,5 gwei ; frais de base 100 gwei (le plancher de la chaîne de 0,1 uqor par gaz) ; `eth_maxPriorityFeePerGas` 12,5 gwei ; `gasLimit` d'en-tête 4 294 967 295. Les outils qui fixent le plafond de frais à environ deux fois les frais de base (Foundry le fait) engagent jusqu'à environ 200 gwei par gaz sur la fenêtre tout en payant environ 112,5 gwei.
- **Espaces de noms JSON-RPC.** `eth`, `net`, `web3` et `txpool`. Toutes les méthodes `debug_*`, `personal_*`, `admin_*` et `miner_*` sont indisponibles (`-32601`), de même que `trace_*`, `eth_coinbase`, `eth_mining`, `eth_hashrate`, `eth_getWork`, `eth_submitWork`, `eth_blobBaseFee`, `eth_simulateV1`, `eth_callMany`, `eth_signTransaction`, `eth_pendingTransactions` et `eth_config`. Les outils qui ont besoin de traces ne fonctionnent pas avec les endpoints publics.
- **Comportements différents.** `eth_getProof` fonctionne mais renvoie les preuves IAVL de la chaîne, pas des preuves Merkle-Patricia. `eth_getLogs` couvre au plus 10 000 blocs par requête. `eth_subscribe` fonctionne uniquement via WebSocket. `eth_accounts`, `eth_sign` et `eth_sendTransaction` sont refusés parce que le nœud ne détient aucun compte : signez en local et utilisez `eth_sendRawTransaction`. `txpool_content` est refusé sur les endpoints publics ; `txpool_status` fonctionne. `web3_clientVersion` n'est pas un moyen fiable de détecter le nœud.
- **Soldes.** `eth_getBalance` renvoie le solde bancaire en uqor multiplié par 10^12 plus tout reste inférieur à l'uqor.
- **Précompilations.** Les précompilations standard d'Ethereum répondent comme d'habitude. `pqcVerify` (`0x0A01`) et `pqcKeyStatus` (`0x0A02`) sont **actives uniquement sur le testnet** ; aucune n'est active sur le mainnet, et en activer une nécessiterait une décision de gouvernance, sans date. Le testnet liste aussi `0x0C01` (`rlConsensusParams`). Un appel à une précompilation inactive renvoie des données vides au lieu de revert ; lisez donc `active_static_precompiles` à `/cosmos/evm/vm/v1/params` avant de vous fier à l'une d'elles. Voir [Précompilations EVM](/developer-guide/evm-precompiles#network-status).
- **Outillage.** QoreChain n'est pas encore dans `viem/chains` : importez les chaînes depuis `@qorechain/evm` (à partir de 0.11.0). Sourcify ne liste pas encore les chain IDs 9800 ou 9801. La voie SVM n'est pas ouverte.

## Comment l'utiliser {#how-to-use}

Tous les extraits qui lisent utilisent le testnet public (`qorechain-diana`, EVM chain ID 9800), n'ont besoin d'aucune clé et n'envoient rien. L'ERC-20 de test `0x9C2F20329750c16B215bDc50455d320De2a7Ba1c` est un jeton de testnet (symbole `WQOR`, 18 décimales) ; remplacez-le, ainsi que l'adresse, par les vôtres.

### Installer par langage {#install}

| Langage ou outil | Installation | Statut | Plateforme minimale |
|---|---|---|---|
| TypeScript, lectures EVM et helpers ERC | `npm install @qorechain/evm viem` (résout vers 0.8.0, qui n'a ni définitions de chaîne ni helpers de fenêtre) | Disponible aujourd'hui | Node.js 20 ou plus récent ; peer `viem ^2` |
| TypeScript, signature du message de fenêtre | `npm install @qorechain/sdk` (0.10.0 contient `openEvmWindowMsg`, `fetchEvmWindow`, `EthNativeSigner`, `deriveUnifiedAccount`) | Disponible aujourd'hui | Node.js 20 ou plus récent |
| TypeScript, définitions de chaîne viem et helpers de fenêtre | pas encore | **À venir (0.11.0)** | Node.js 20 ou plus récent |
| Générateur de projet, modèles `evm-solidity`, `fullstack-web`, `rollup-app` | `npx create-qorechain-dapp my-app --template <name>` | Disponible aujourd'hui (0.10.0) | Node.js 20 ou plus récent |
| Générateur de projet, modèles `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` | pas encore | **À venir (0.11.0)** | Foundry et Node.js 20 ; Node.js 22 pour Hardhat 3 ; Rust et Docker pour `cosmwasm` |
| Python (lectures EVM) | `pip install "web3>=7,<8"` ; message de fenêtre depuis `qorechain-sdk` 0.10.0 | Disponible aujourd'hui | Python 3.10 ou plus récent |
| Go (lectures EVM) | `go get github.com/ethereum/go-ethereum@latest` ; message de fenêtre depuis le SDK Go de QoreChain v0.10.0 | Disponible aujourd'hui | Chaîne d'outils Go |
| Rust (lectures EVM) | `alloy = { version = "1", features = ["provider-http", "contract", "sol-types"] }` ; message de fenêtre depuis la crate `qorechain-sdk` 0.10.0 | Disponible aujourd'hui | Rust stable |
| Java (lectures EVM) | `org.web3j:core:5.0.0` ; message de fenêtre depuis `io.github.qorechain:qorechain-sdk:0.10.0` | Disponible aujourd'hui | JDK 21 (le SDK Java de QoreChain est construit avec une chaîne d'outils JDK 21) |

### Démarrage rapide 1 : lire avec ethers v6 (disponible aujourd'hui) {#quickstart-ethers}

Aucun paquet QoreChain n'est nécessaire. Exécuté le 27 octobre 2026 sur le testnet, il a affiché `chain id: 9800n`, un solde, et `token: WQOR 18n`.

```ts
import { Contract, JsonRpcProvider, formatEther } from "ethers";

const provider = new JsonRpcProvider("https://evm-testnet.qore.host", 9800, { staticNetwork: true });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet
const erc20 = new Contract(
  TOKEN,
  ["function symbol() view returns (string)", "function decimals() view returns (uint8)"],
  provider,
);

const { chainId } = await provider.getNetwork();
const balance = await provider.getBalance(ADDRESS);
const symbol: string = await erc20.symbol();
const decimals: bigint = await erc20.decimals();

console.log("chain id:", chainId); // 9800n
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

La même lecture en web3.py, go-ethereum, alloy et web3j se trouve dans le guide du SDK `evm-quickstarts.md` (indiquée comme testée avec web3.py 7.16, go-ethereum 1.17.10, alloy 1.8 et web3j 5.0.0 sur JDK 21 ; cette page n'a pas ré-exécuté ces tests).

### Démarrage rapide 2 : lire avec `@qorechain/evm` 0.8.0 publié (disponible aujourd'hui) {#quickstart-evm-080}

Démarrage rapide testé du hub développeur. Il se connecte, détecte automatiquement l'EVM chain ID et affiche le solde de QOR du compte faucet du testnet public.

```ts
import { createEvmClient } from "@qorechain/evm";
import { formatEther } from "viem";

// Public testnet EVM JSON-RPC (EVM chain ID 9800, auto-detected).
const client = await createEvmClient({ rpcUrl: "https://evm-testnet.qore.host" });

// A public testnet address (the testnet faucet account, EVM form).
const address = "0xf1e70c24817e00aee286f7275e14e61cabd20741";
const wei = await client.publicClient.getBalance({ address });
console.log(await client.getChainId(), address, formatEther(wei), "QOR");
```

### Démarrage rapide 3 : lire avec la définition de chaîne viem (à partir de 0.11.0, à venir) {#quickstart-viem}

Cela ne s'exécute pas depuis npm aujourd'hui, car 0.8.0 n'a pas `qorechainTestnet`. Exécuté le 27 octobre 2026 avec la définition de chaîne 0.11.0 chargée depuis le code source du dépôt (pas depuis npm), il a affiché `chain id: 9800` et le jeton `WQOR`.

```ts
import { createPublicClient, erc20Abi, formatEther, http } from "viem";
import { qorechainTestnet } from "@qorechain/evm";

const client = createPublicClient({ chain: qorechainTestnet, transport: http() });

const ADDRESS = "0x000000000000000000000000000000000000dEaD"; // any 0x address
const TOKEN = "0x9C2F20329750c16B215bDc50455d320De2a7Ba1c"; // a test ERC-20 on the testnet

const chainId = await client.getChainId();
const balance = await client.getBalance({ address: ADDRESS });
const symbol = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "symbol" });
const decimals = await client.readContract({ address: TOKEN, abi: erc20Abi, functionName: "decimals" });

console.log("chain id:", chainId); // 9800
console.log("balance:", formatEther(balance), "QOR");
console.log("token:", symbol, decimals);
```

### Démarrage rapide 4 : vérifier une fenêtre et composer le message d'ouverture (à partir de 0.11.0, à venir) {#quickstart-window-helpers}

Tiré du README de `@qorechain/evm` au tag v0.11.0. Il lit, puis construit un objet message ; il ne signe ni n'envoie. Pour un compte sans fenêtre, `evmWindowStatus` renvoie `found: false, live: false` (vérifié sur les deux réseaux le 27 octobre 2026).

```ts
import { evmWindowStatus, openEvmWindowMessage, evmWindowCost } from "@qorechain/evm";

const w = await evmWindowStatus({ rest: "https://api-testnet.qore.host", address: "0x..." });
// w.live, w.remainingTxs, w.remainingValue (uqor), w.remainingBlocks

const msg = openEvmWindowMessage({
  sender: "qor1...", // the same account; toQorAddress("0x...") converts
  blocks: 600,
  maxTxs: 5,
  maxValue: evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 112_500_000_000n }) * 5n,
});
// Sign `msg` hybrid on the native lane, then read the nonce (opening advances it).
```

### Démarrage rapide 5 : ouvrir une fenêtre depuis TypeScript (disponible aujourd'hui, SDK 0.10.0 et suivants) {#quickstart-open-window}

Tiré du guide du SDK `evm-quickstarts.md`, « Before you send ». Ceci **envoie une transaction de la voie native** : exécutez-le uniquement avec votre propre compte de test approvisionné, jamais avec une phrase partagée ou publique.

```ts
import { StargateClient } from "@cosmjs/stargate";
import { EthNativeSigner, deriveUnifiedAccount, openEvmWindowMsg } from "@qorechain/sdk";

const account = await deriveUnifiedAccount(mnemonic); // account.evm = 0x..., account.cosmos = qor1...
const signer = new EthNativeSigner(account, { rest: "https://api-testnet.qore.host" });
const transport = await StargateClient.connect("https://rpc-testnet.qore.host");

await signer.signAndBroadcast(transport, {
  chainId: "qorechain-diana",
  accountNumber, // from /cosmos/auth/v1beta1/accounts/{qor1...}
  sequence,
  fee: { amount: [{ denom: "uqor", amount: "100000" }], gas: "800000" },
  messages: [openEvmWindowMsg({ sender: account.cosmos, blocks: 600, maxTxs: 5, maxValue: "3750000" })],
});
// Now read the nonce and send with viem, ethers, Foundry or Hardhat.
```

Cet extrait n'a pas été ré-exécuté pour cette page. `maxValue: "3750000"` correspond à 5 transactions de 3 000 000 de gaz avec un plafond de frais de 250 gwei.

### Démarrage rapide 6 : générer un projet avec le générateur disponible {#quickstart-scaffold-live}

Testé le 27 octobre 2026 dans un répertoire vide avec `npx` depuis le registre npm public (0.10.0, modèle `fullstack-web`) : il a généré le projet et la build a réussi.

```sh
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

### Les nouveaux modèles (à partir de 0.11.0, à venir) {#new-templates-usage}

Une fois 0.11.0 publié, le générateur de projet accepte les quatre nouveaux noms de modèle (voir le tableau des options ci-dessous). Un projet `foundry` se construit et se teste alors en local avec `forge build` et `forge test` (sans réseau), et `pnpm window status` lit le compte, sa clé PQC et sa fenêtre. `pnpm window register` et `pnpm window open` diffusent des transactions de la voie native depuis votre propre compte approvisionné, et `forge script ... --broadcast` déploie. Ne mettez jamais une vraie clé dans `.env.example`, ne commitez jamais `.env`, et n'approvisionnez jamais la phrase de test BIP-39 publique (`abandon` répété 11 fois, puis `about`).

## API principale {#main-api}

### `@qorechain/evm` (à partir de 0.11.0) {#api-evm}

| Nom | Ce qu'il fait |
|---|---|
| `qorechain`, `qorechainTestnet` | Objets de chaîne viem pour 9801 et 9800 avec endpoints publics et explorateur. |
| `QORECHAIN_CHAINS` | Les deux chaînes (mainnet, puis testnet), pour wagmi ou RainbowKit. |
| `QORECHAIN_REST_ENDPOINTS` | EVM chain ID vers URL REST de la voie native. |
| `evmWindowStatus` | Lit une fenêtre via REST : `{ found, live, remainingBlocks, remainingTxs, remainingValue, nativeOnly, allowedTargets, ... }`. |
| `parseEvmWindow` | Analyse la réponse REST. |
| `openEvmWindowMessage` | Vérifie les bornes et construit `MsgOpenEVMWindow` sous la forme `{ typeUrl, value }`. |
| `checkOpenEvmWindowParams` | Les vérifications de bornes seules. |
| `evmWindowCost`, `weiToUqorCeil` | Dimensionnement de la fenêtre en uqor. |
| `classifyEvmWindowRejection`, `isEvmWindowRejection` | Expliquent un refus : `no-pqc-key`, `no-window`, `exhausted`, `invalid`. |
| `toQorAddress`, `toEvmAddress` | Convertissent entre `0x` et `qor1...` pour le même compte. |
| `OPEN_EVM_WINDOW_TYPE_URL`, `CLOSE_EVM_WINDOW_TYPE_URL`, `MAX_EVM_WINDOW_BLOCKS`, `MAX_EVM_WINDOW_TXS`, `MAX_EVM_WINDOW_TARGETS` | Constantes. |
| `@qorechain/evm/window` | Les helpers de fenêtre sans la dépendance viem. |

`@qorechain/evm` ne signe ni ne diffuse de transactions de la voie native ; utilisez `@qorechain/sdk` ou les SDK de langage pour cela.

### Construire et lire une fenêtre dans chaque SDK (disponible aujourd'hui, 0.10.0) {#api-window}

| Langage | Ouvrir une fenêtre | Lire une fenêtre |
|---|---|---|
| TypeScript | `openEvmWindowMsg` (`@qorechain/sdk`) ; `openEvmWindowMessage` (`@qorechain/evm`, à partir de 0.11.0) | `fetchEvmWindow` ; `evmWindowStatus` (à partir de 0.11.0) |
| Python | `qorsdk.msg.pqc.open_evm_window` | `qorsdk.evm_window.get_evm_window` |
| Go | `messages.NewOpenEVMWindow` (`NewOpenEVMWindowScoped` pour `nativeOnly` ou `allowedTargets`) | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Rust | `qorechain::msg::pqc::open_evm_window` | REST `/qorechain/pqc/v1/evm_window/{address}` |
| Java | `io.github.qorechain.evm.EvmWindow.open` | `EvmWindow.restPath` |

Consentement EIP-7702 (TypeScript, `@qorechain/sdk` 0.10.0) : `authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `classifyEvmDelegationRejection`.

`@qorechain/react` 0.11.0 ajoute `PqcStatusBadge` (libellés par défaut « PQC key registered » et « No PQC key »).

### Options de `create-qorechain-dapp` {#api-scaffolder}

| Option | Ce qu'elle fait |
|---|---|
| `-t, --template <name>` | `evm-solidity`, `fullstack-web`, `rollup-app` (disponibles aujourd'hui) ; `foundry`, `hardhat`, `viem-wagmi`, `cosmwasm` (à partir de 0.11.0). |
| `--network <name>` | Préréglage `testnet` ou `mainnet`. |
| `--package-manager <pm>` | `pnpm`, `npm` ou `yarn`. |
| `-y, --yes` | Ignore les invites et utilise les valeurs par défaut. |
| `--no-install` | N'installe pas les dépendances. |
| `-h, --help` / `-v, --version` | Aide et version. |

### Scripts des modèles (à partir de 0.11.0) {#api-template-scripts}

| Modèle | Script | Ce qu'il fait |
|---|---|---|
| `foundry`, `hardhat` | `pnpm window status` | Affiche le compte, si sa clé ML-DSA-87 est enregistrée (et si c'est cette clé), et sa fenêtre. |
| `foundry`, `hardhat` | `pnpm window register` | Enregistre la clé ML-DSA-87 du compte, une fois par compte. |
| `foundry`, `hardhat` | `pnpm window open` | Ouvre une fenêtre (par défaut 600 blocs, 5 transactions). |
| `foundry` | `pnpm deploy:testnet` | `forge script script/Counter.s.sol --rpc-url qorechain_testnet --broadcast`. |
| `hardhat` | `pnpm build`, `pnpm test`, `pnpm deploy:testnet` | Build Hardhat, tests, déploiement Ignition vers `qorechainTestnet`. |
| `viem-wagmi` | `pnpm dev`, `pnpm build` | Serveur de développement sur `http://localhost:5173` ; build de production. |
| `cosmwasm` | `pnpm build:wasm`, `pnpm propose-store`, `pnpm instantiate`, `pnpm query` | Build optimisée, proposition de téléversement par gouvernance, instanciation (testnet), requêtes REST. |

Variables d'environnement des modèles (dans `.env`, jamais commité) : `PRIVATE_KEY`, `QORE_MNEMONIC`, `QORE_NETWORK` (`testnet` ou `mainnet`), `QORE_WINDOW_BLOCKS`, `QORE_WINDOW_TXS`, `QORE_WINDOW_MAX_UQOR`, `COUNTER_INITIAL` ; `QORE_CODE_ID` et `QORE_I_KNOW_THIS_IS_MAINNET=yes` pour les scripts CosmWasm (le script de proposition refuse le mainnet sans cette variable) ; `VITE_WALLETCONNECT_PROJECT_ID` pour un portefeuille WalletConnect dans `viem-wagmi`.

## Comment y accéder {#how-to-access}

| | Testnet | Mainnet |
|---|---|---|
| Chain ID natif | `qorechain-diana` | `qorechain-vladi` |
| EVM chain ID (`eth_chainId`) | 9800 (`0x2648`) | 9801 (`0x2649`) |
| JSON-RPC EVM | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| WebSocket EVM | `wss://evm-ws-testnet.qore.host` | non publié |
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| RPC de consensus | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| Explorateur | `https://explore.qore.network` | `https://explore.qore.network` |

- **Les lectures** n'ont besoin de rien : ni compte, ni clé, ni fenêtre.
- **L'envoi sur la voie EVM** nécessite un compte approvisionné, sa clé ML-DSA-87 enregistrée on-chain (une fois) et une fenêtre ouverte. L'enregistrement de la clé et la fenêtre sont des transactions de la voie native.
- **Coût.** Le plancher de frais est de 0,1 uqor par gaz sur les deux réseaux. La lecture est gratuite. Les QOR de testnet viennent du [Faucet](/dashboard/faucet).
- **CosmWasm.** Pas de téléversement de code sans gouvernance sur aucun des deux réseaux ; pas d'instanciation sur le mainnet sans gouvernance. Le mainnet n'avait aucun code stocké le 27 octobre 2026.
- **Versions de Node et des outils.** Voir le tableau d'installation ci-dessus.

## Où il est publié {#where-published}

Versions lues en direct sur chaque registre le 27 octobre 2026. Le tag GitHub `v0.11.0` existe (27 octobre 2026), et il n'y a pas encore d'objet release GitHub pour lui (la dernière release est v0.10.0).

| Registre | Paquet | Version disponible aujourd'hui | Statut de 0.11.0 | Lien |
|---|---|---|---|---|
| npm | `@qorechain/evm` | 0.8.0 | **en attente, non publié** | https://www.npmjs.com/package/@qorechain/evm |
| npm | `@qorechain/sdk` | 0.10.0 | **en attente, non publié** | https://www.npmjs.com/package/@qorechain/sdk |
| npm | `@qorechain/react` | 0.10.0 | **en attente, non publié** | https://www.npmjs.com/package/@qorechain/react |
| npm | `@qorechain/svm` | 0.8.0 | **en attente, non publié** | https://www.npmjs.com/package/@qorechain/svm |
| npm | `create-qorechain-dapp` | 0.10.0 (modèles `evm-solidity`, `fullstack-web`, `rollup-app`) | **en attente, non publié** | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `@qorechain/qorex-rainbowkit` (utilisé par `viem-wagmi`) | 0.1.0 | ne fait pas partie de 0.11.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| PyPI | `qorechain-sdk` | 0.10.0 | ne fait pas partie de 0.11.0 | https://pypi.org/project/qorechain-sdk/ |
| crates.io | `qorechain-sdk` | 0.10.0 | ne fait pas partie de 0.11.0 | https://crates.io/crates/qorechain-sdk |
| Proxy Go | `github.com/qorechain/qorechain-sdk/packages/go` | v0.10.0 | ne fait pas partie de 0.11.0 | https://pkg.go.dev/github.com/qorechain/qorechain-sdk/packages/go |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.10.0 | ne fait pas partie de 0.11.0 | https://central.sonatype.com/artifact/io.github.qorechain/qorechain-sdk |

Source : [github.com/qorechain/qorechain-sdk](https://github.com/qorechain/qorechain-sdk), tag `v0.11.0` ; chemins `packages/evm`, `cli/`, `templates/`, `docs/docs/guides/`, `contrib/`. Apache-2.0, maintenu par la QoreChain Association.

## Limites et problèmes connus {#limits}

- **0.11.0 n'est pas encore sur npm.** Tout ce qui est marqué « à partir de 0.11.0 » (les définitions de chaîne viem, les helpers de fenêtre, `@qorechain/evm/window`, les quatre nouveaux modèles, `PqcStatusBadge`) ne peut pas être installé depuis un registre aujourd'hui. Les nouveaux modèles dépendent de paquets `^0.11.0`, de sorte que même un projet généré depuis le dépôt ne s'installera pas depuis npm avant la publication. Cette page changera lorsque npm servira 0.11.0.
- **0.11.0 ne modifie que les paquets npm.** Python, Rust, Go et Java restent en 0.10.0, qui contient déjà les constructeurs de fenêtre listés ci-dessus.
- **`@qorechain/evm` lit la fenêtre et compose le message ; il ne signe ni ne diffuse** de transactions de la voie native.
- **Aucun helper n'ouvre automatiquement une fenêtre avant un envoi**, par conception.
- **Le portefeuille QoreX dans le modèle `viem-wagmi`** répond à `eth_chainId`, `eth_accounts`, `eth_requestAccounts` et `wallet_switchEthereumChain` ; ses méthodes de signature EVM ne sont pas encore disponibles. Utilisez-le pour vous connecter et lire, et signez avec un portefeuille EIP-1193 injecté.
- **Le helper `pnpm window` des modèles dérive la clé ML-DSA-87 du même secret que la clé EVM.** Si la clé du compte a été enregistrée par un autre portefeuille, ouvrez la fenêtre depuis ce portefeuille.
- **Non disponibles sur les endpoints publics :** les transactions blob, le traçage, et les espaces de noms `debug`, `personal`, `admin` et `miner`.
- **Le téléversement CosmWasm passe par la gouvernance sur les deux réseaux** ; le modèle `cosmwasm` ne peut pas stocker du code par lui-même.
- **Les contributions à d'autres outils** (viem, Sourcify, Scaffold-ETH 2) sont des fichiers préparés dans le dépôt, non fusionnés en amont.
- **Précompilations EVM sur le mainnet :** aucune n'est active. `pqcVerify` (`0x0A01`) et `pqcKeyStatus` (`0x0A02`) sont actives uniquement sur le testnet.
- **L'état du réseau est daté.** Les chiffres de frais et de temps de bloc ont été lus le 27 octobre 2026.

## Notes de sécurité {#security}

- La conception par fenêtre signifie que la clé secp256k1 détenue par une bibliothèque EVM ne peut jamais autoriser une dépense à elle seule : ouvrir une fenêtre nécessite une signature hybride avec la clé ML-DSA-87 du compte. Gardez les fenêtres petites (`blocks`, `maxTxs`, `maxValue`) et utilisez `nativeOnly` ou `allowedTargets` chaque fois que vous le pouvez.
- `maxValue` inclut les frais maximaux de chaque transaction ; dimensionnez-le avec `evmWindowCost` plutôt qu'à partir de la seule valeur.
- Les modèles lisent les clés depuis `.env`, qui est ignoré par git ; `.env.example` contient des valeurs fictives. Les utilisateurs de Hardhat peuvent stocker la clé chiffrée avec `npx hardhat keystore set PRIVATE_KEY`.
- N'approvisionnez jamais la phrase de test BIP-39 publique (`abandon` répété 11 fois, puis `about`).
- Pour une proposition CosmWasm sur le mainnet, publiez le code source et une build reproductible (l'optimiseur affiche la somme de contrôle) afin que les votants puissent vérifier le binaire.
- Signalez les vulnérabilités en privé à security@qore.network.

## Pages associées {#related}

- [Aperçu des paquets développeur](/developer-tools/overview) et [Générateurs de projet et CLI](/developer-tools/scaffolders-and-cli) (le `create-qorechain-dapp` 0.10.0 disponible)
- [Aperçu du SDK](/sdk/overview), [Installation du SDK](/sdk/install) et le [guide EVM](/sdk/guides/evm) (fenêtre, fenêtres restreintes, consentement EIP-7702, précompilations)
- [Développement EVM](/developer-guide/evm-development) et [Précompilations EVM](/developer-guide/evm-precompiles#network-status)
- [Développement QoreChain Native](/developer-guide/cosmwasm-development) (CosmWasm et propositions de gouvernance)
- [Intégrations QoreX](/developer-tools/qorex-integrations) (`@qorechain/qorex-rainbowkit`)
- [QoreSign](/qoresign/overview) (signature hybride sur la voie native)
- [QoreScan](/developer-tools/qorescan) (inventaire de l'utilisation d'`ecrecover` et des précompilations PQC dans les sources Solidity)
