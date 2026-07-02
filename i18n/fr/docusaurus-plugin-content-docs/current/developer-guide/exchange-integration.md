---
slug: /developer-guide/exchange-integration
title: Guide pour exchanges et intégrateurs
sidebar_label: Intégration exchange
sidebar_position: 11
---

# Guide pour exchanges et intégrateurs

Tout ce dont un exchange, un dépositaire ou un intégrateur de paiement a besoin pour lister QOR et traiter les dépôts et les retraits : choisir une interface, détecter les dépôts en toute sécurité et signer les retraits.

:::note
Ce guide cible le mainnet **`qorechain-vladi`** (version de chaîne **v3.1.82**). Répétez d'abord le flux complet sur le testnet **`qorechain-diana`** — les endpoints des deux réseaux se trouvent dans [Réseaux](/appendix/networks#public-endpoints).
:::

## Choisir un chemin d'intégration {#choosing-a-path}

QoreChain est une chaîne unique avec **un seul solde natif QOR unifié**, exposé via trois interfaces. La **même clé privée contrôle les mêmes fonds** sous une adresse Cosmos (`qor1...`), une adresse EVM (`0x...`) et une adresse SVM (base58) — choisissez l'interface qui convient à votre stack.

| | **A) Cosmos (natif)** | **B) EVM** | **C) SVM (VM Solana)** |
|---|---|---|---|
| Adresse | `qor1...` (bech32) | `0x...` (Ethereum) | Base58 Solana (même clé) |
| Décimales (QOR natif) | **6** (`uqor`) | **18** (style wei) | **9** (lamports ; 1 uqor = 1 000 lamports) |
| Outillage | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Signature des retraits | **PQC hybride requis** (ML-DSA-87 + secp256k1) | **secp256k1 / EIP-155 standard — pas de PQC** | via tx Cosmos ou soumission sur le nœud |
| Prise en charge memo / tag | **Oui** (adresse partagée + memo) | Non (une adresse par utilisateur) | Non (une adresse par utilisateur) |
| Détection des dépôts | scanner les événements `MsgSend` | scanner les blocs via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Idéal pour | Plateformes natives Cosmos | **Plateformes disposant déjà d'une intégration EVM** | Plateformes à outillage Solana |

**Recommandation :** si vous prenez déjà en charge des chaînes EVM, le **chemin B (EVM)** est l'intégration demandant le moins d'effort — outillage Ethereum standard, et **les retraits ne nécessitent pas de signature post-quantique** (le chemin ante EVM en est exempté). Le chemin A (Cosmos) est la voie native avec des adresses de dépôt partagées basées sur le memo. Le chemin C (SVM) est lui aussi une interface QOR native complète — choisissez-le si vous préférez spécifiquement l'outillage Solana.

Les trois interfaces ne sont **pas mutuellement exclusives** — les fonds envoyés vers la forme `0x`, `qor1` ou SVM de la même clé constituent le même solde.

## Faire tourner votre nœud {#node}

Les intégrations en production doivent vérifier les dépôts contre leur **propre nœud synchronisé**, et non un endpoint tiers. Suivez [Connexion au Mainnet](/getting-started/connecting-to-mainnet) — la page couvre le bundle de binaires précompilés (avec sommes de contrôle SHA-256), le genesis, les pairs publics, le plancher de frais (`0.1uqor`) et un amorçage rapide via le snapshot de données de chaîne publié. Aucune licence n'est requise pour exploiter un nœud complet non validateur.

Comme QoreChain offre une **finalité instantanée** (pas de réorganisations), **1 confirmation est finale** ; attendre 1 à 2 blocs offre une marge opérationnelle confortable.

## Chemin A — Cosmos (natif) {#path-a-cosmos}

URL REST de base : `https://api.qore.host` (ou `http://localhost:1317` sur votre nœud).

### Surveiller les dépôts

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&pagination.limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Check-list anti-faux-dépôts {#anti-fake-deposit}

Ne créditez un dépôt **que** lorsque **toutes** les conditions suivantes sont réunies :

1. **`tx_response.code == 0`** — la transaction a réussi ; ne créditez jamais une tx en échec.
2. Le message est **`/cosmos.bank.v1beta1.MsgSend`** (ou une sortie de `MsgMultiSend`) — pas un appel de contrat ni un autre module.
3. Le **`to_address`** est égal à votre adresse de dépôt et (avec le modèle d'adresse partagée) le **`memo`** correspond à l'utilisateur.
4. Le **`denom == "uqor"`** et l'`amount` est la valeur créditée (uqor → ÷ 10⁶ pour QOR). Rejetez tout autre denom.
5. La tx figure dans un **bloc engagé** (`height` présent et ≤ la dernière hauteur engagée). La finalité est instantanée — 1 confirmation est finale ; attendez 1 à 2 blocs par marge de sécurité.
6. Recalculez le montant à partir des **événements de transfert** (`coin_received` / `coin_spent`) et recoupez-le avec le montant du message — ne faites jamais confiance à un seul champ ni au memo seul.
7. Vérifiez que le hash de la tx existe via `GET /cosmos/tx/v1beta1/txs/{hash}` sur votre **propre** nœud synchronisé.

### Retraits — signature PQC hybride {#cosmos-withdrawals}

Le mainnet impose des **signatures post-quantiques** sur les transactions cosmos (`allow_classical_fallback = false`) : chaque retrait nécessite une **signature hybride** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Les dépôts n'en ont **pas** besoin (vous ne faites qu'observer la chaîne).

La bibliothèque de signature est [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), qui tire `@qorechain/pqc` pour les primitives FIPS-204 :

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing cosmjs-types@0.9.0
# pin cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La signature est un flux en **deux étapes** (calqué sur `qorechaind tx pqc cosign`) :

**Étape 1 — une seule fois par hot wallet : enregistrer sa clé ML-DSA-87.** Cette transaction d'enregistrement unique est **signée classiquement** (exemption de bootstrap) : message `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` avec `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Dérivez la clé ML-DSA de manière déterministe afin qu'elle soit récupérable à partir de votre secret existant — p. ex. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, puis `mldsa.keygen(seed)` — et stockez la seed aux côtés de votre clé de hot wallet.

**Étape 2 — pour chaque retrait ensuite : signer le `MsgSend` en hybride.** L'adaptateur intègre la signature ML-DSA-87 dans une extension du corps de la tx *avant* le `signDirect` secp256k1 normal, de sorte que votre signataire existant reste inchangé :

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  address, pubkeySecp256k1, accountNumber, pqc });
const txBytes = await signer.signHybrid({
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress,
      amount: [{ denom: "uqor", amount: "1000000" }] })).finish() }],
  fee: { amount: [{ denom: "uqor", amount: "40000" }], gasLimit: 400000n },
  sequence });
```

Diffusez les octets signés :

```bash
curl -s -X POST https://api.qore.host/cosmos/tx/v1beta1/txs \
  -H 'Content-Type: application/json' \
  -d '{"tx_bytes":"<base64-signed-tx>","mode":"BROADCAST_MODE_SYNC"}' | jq .tx_response.code
# 0 => accepted into the mempool
# code 8 "classical fallback not allowed" => step 1 not done yet for this account
```

Interrogez ensuite `GET /cosmos/tx/v1beta1/txs/{hash}` jusqu'à ce que la tx apparaisse dans un bloc avec `code == 0`.

Pour un HSM ou un signataire personnalisé dans un autre langage, utilisez les bibliothèques FIPS-204 autonomes [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) et assemblez la même extension. La signature ML-DSA **doit être déterministe** (FIPS-204 §3.4) — voir [Signature déterministe](/developer-guide/post-quantum-signing#deterministic-signing) ; la chaîne rejette les signatures « hedged ».

## Chemin B — EVM {#path-b-evm}

Intégration Ethereum standard contre `https://evm.qore.host` (chain ID **9801**) ou le port 8545 de votre propre nœud.

* **Décimales :** le QOR natif compte **18 décimales** sur le rail EVM (1 uqor = 10¹² wei). Se tromper ici crédite les dépôts avec une erreur d'un facteur 10¹².
* **Dépôts :** scannez les blocs avec `eth_getBlockByNumber` à la recherche de transferts natifs vers vos adresses ; confirmez avec `eth_getTransactionReceipt` (`status == 0x1`).
* **Retraits :** signature secp256k1 / EIP-155 standard — **aucun PQC requis** sur le chemin ante EVM. Toute stack de signature Ethereum fonctionne sans modification.
* **Anti-faux-dépôts :** vérifiez le statut du reçu, que la valeur déplacée est un transfert **natif** (et non un événement ERC-20 que vous n'indexez pas), et confirmez contre votre propre nœud.
* **Correspondance d'adresses :** l'adresse `0x` et l'adresse `qor1` sont deux encodages du même compte — les fonds sont partagés. Voir [Développement EVM](/developer-guide/evm-development).

## Chemin C — SVM (compatible Solana) {#path-c-svm}

Depuis la v3.1.82, l'interface SVM sert le **QOR natif** (voir [QOR natif sur l'interface SVM](/developer-guide/svm-development#native-qor)) :

* **Soldes :** `getBalance` renvoie des lamports (÷ 10⁹ pour QOR ; 1 uqor = 1 000 lamports).
* **Dépôts :** `getSignaturesForAddress` donne l'historique des transactions d'une adresse ; les transferts du System Program déplacent du QOR natif.
* Les endpoints publics (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sont **en lecture seule** ; soumettez les transactions via votre propre nœud.

## Résumé des flux {#flow-summary}

| Opération | Chemin | Signature nécessaire ? |
|---|---|---|
| **Dépôt** (utilisateur → plateforme) | Surveillez votre nœud synchronisé pour les transferts vers votre adresse (+ memo sur Cosmos) | Non — surveillance uniquement |
| **Retrait** (plateforme → utilisateur) | Construire le transfert, signer hors ligne, diffuser | Cosmos : PQC hybride · EVM : secp256k1 standard |
| **Solde / sweep** | Requête de solde REST / EVM / SVM + transfert | Signer uniquement pour le sweep |

## Voir aussi

* [Connexion au Mainnet](/getting-started/connecting-to-mainnet) — configuration du nœud, téléchargements, snapshot
* [Exploiter un nœud](/developer-guide/running-a-node) — déploiement, pruning, indexation
* [Signature post-quantique](/developer-guide/post-quantum-signing) — les bibliothèques FIPS-204 derrière les retraits hybrides
* [Réseaux](/appendix/networks) — chain IDs, endpoints, décimales par interface
