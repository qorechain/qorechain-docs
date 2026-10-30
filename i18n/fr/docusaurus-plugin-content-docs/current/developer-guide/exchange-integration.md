---
slug: /developer-guide/exchange-integration
title: Guide Exchange et Intégrateurs
sidebar_label: Intégration Exchange
sidebar_position: 11
---

# Guide Exchange et Intégrateurs

Tout ce dont un exchange, un dépositaire (custodian) ou un intégrateur de paiement a besoin pour lister QOR et traiter les dépôts et retraits : choisir une interface, détecter les dépôts en toute sécurité et signer les retraits.

:::note
Ce guide cible le mainnet **`qorechain-vladi`** (en production depuis le 7 juin 2026 ; version de nœud **v3.2.5** au moment de la rédaction, appliquée à la hauteur 3,906,833 le 29 octobre 2026 par la proposition de gouvernance 14, après la v3.2.4 à la hauteur 3,742,566 le 23 octobre 2026 et la v3.2.3 à la hauteur 3,662,051 le 20 octobre 2026). Répétez d'abord le flux complet sur le testnet **`qorechain-diana`**. Il exécute la **v3.2.6** (la v3.2.5 y a été appliquée le 26 octobre 2026, la v3.2.6 le 27 octobre) et il exécute la v3.2.4 depuis le 19 octobre 2026, de sorte que les changements de la v3.2.2 à la v3.2.4 listés ci-dessous s'appliquent aux deux réseaux (les points de terminaison des deux réseaux se trouvent dans [Réseaux](/appendix/networks#public-endpoints)). Si vous exécutez votre propre nœud complet, maintenez-le sur la version recommandée par le manifeste de téléchargement et jamais en dessous de son `minCompatible` (**3.2.5** sur le mainnet, **3.2.6** sur le testnet au moment de la rédaction) : un nœud obsolète ne peut pas suivre les mises à niveau de la chaîne et s'arrête à la hauteur de la mise à niveau ; voir [Exécuter un nœud](/developer-guide/running-a-node#upgrades).

**Ce qui a changé pour les intégrateurs dans la v3.2.2 et la v3.2.3** (le format de signature, les adresses, les décimales, les memos et les frais sont tous inchangés) :

* **Les transactions Ethereum non protégées (pré-EIP-155) sont refusées** dans le mempool et lors de l'exécution des blocs (v3.2.2). Le portefeuille d'un déposant doit signer avec un chain id ; tous les portefeuilles actuels le font.
* **Les comptes de module ne peuvent pas être revendiqués via l'EVM** (v3.2.2) ; n'utilisez pas l'adresse d'un compte de module comme adresse de dépôt ou de retrait.
* **Les comptes de vesting ne peuvent être créés que pour le signataire lui-même** (v3.2.3) ; les trois messages de création de vesting figurent en outre actuellement sur la liste du circuit breaker du mainnet.
* **Les messages de clé PQC nécessitent la signature hybride dès qu'un compte possède une clé** (v3.2.3) : voir [Signature post-quantique](/developer-guide/post-quantum-signing#key-integrity). Enregistrez la clé du hot wallet une seule fois, tôt.
* **Les fenêtres EVM peuvent être restreintes** (v3.2.3) : un hot wallet qui n'envoie que du QOR simple peut ouvrir une fenêtre `native_only`, voir [Développement EVM](/developer-guide/evm-development#evm-window).

**Ce qui change pour les intégrateurs dans la v3.2.4** (sur le testnet depuis le 19 octobre 2026 et sur le mainnet depuis le 23 octobre 2026). La signature des transactions, les adresses, les décimales, les memos et les frais sont inchangés, et rien ne change dans la manière dont un dépôt est détecté ou dont un retrait est signé et diffusé :

* **Verrous de staking facultatifs (nouveau module `x/stakingtier`).** Un délégateur peut verrouiller une partie d'une délégation pour 3, 6 ou 12 mois (verrou minimum de 10 QOR, au plus 16 verrous ouverts par délégateur). Rien ne se passe pour un compte qui ne crée pas de verrou. Tant qu'un verrou est ouvert, ce montant **ne peut être ni dé-délégué ni re-délégué**, par aucune voie (une transaction simple, `authz`, un groupe ou un contrat) ; mettre fin à un verrou avant son terme brûle une pénalité prélevée sur le stake verrouillé. Un dépositaire qui met en staking les fonds de clients ne doit donc pas verrouiller la part qu'il pourrait devoir restituer. Lisez les paramètres à `GET /qorechain/stakingtier/v1/params`.
* **Une nouvelle source de burn, `staking_tier_penalty`**, apparaît dans les statistiques de burn dès que des déverrouillages anticipés ont lieu. Les tâches de rapprochement de l'offre qui énumèrent les sources de burn doivent accepter un nom de source inconnu.
* **Limites JSON-RPC locales au nœud** pour les nœuds que vous exploitez vous-même : les corps de requête de plus de 256 KiB sont refusés (HTTP 413), pas plus de 256 requêtes ne sont servies simultanément (HTTP 503 au-delà), et un filtre `eth_getLogs` ou `eth_newFilter` comportant plus de 4 positions de topics, 1000 alternatives dans une position ou 1000 adresses est refusé. Les limites sont configurables dans la section `[json-rpc]` de `app.toml` (voir [Exécuter un nœud](/developer-guide/running-a-node#exposing-endpoints-for-integration)). Un scanner de dépôts qui interroge `eth_getLogs` avec une longue liste d'adresses doit découper la liste.
* **Un enregistrement de clé répété est refusé avant d'être payé.** Un nœud exécutant la v3.2.4 rejette, au moment de la diffusion, un `MsgRegisterPQCKeyV2` qui porte exactement la clé publique que le compte a déjà enregistrée, avec l'erreur que la chaîne aurait renvoyée (code PQC 7, le compte existe déjà), et sans prélever de frais. Vérifiez `GET /qorechain/pqc/v1/account/{address}` avant d'enregistrer la clé d'un hot wallet, comme recommandé ci-dessous.
* **Indicateur de possession facultatif.** L'enregistrement du compte gagne un champ `possession_proven` qui indique si une preuve de possession a été vérifiée lors de l'enregistrement ; il ne change pas qui peut envoyer ou recevoir. Voir [Signature post-quantique](/developer-guide/post-quantum-signing#proof-of-possession).

**Testnet uniquement : autres dénominations sur `qorechain-diana` (v3.2.6).** Le testnet détient plus que `uqor` : trois jetons de test (fUSD, fETH, fBTC) enregistrés comme paires de jetons ERC-20 et exposés comme denoms bank nommés `erc20:<adresse 0x EIP-55>`, plus un jeton IBC. Ce sont des jetons de test sans valeur, et le mainnet n'en a aucun (son offre bank ne contient que `uqor`). Si vous répétez un scanner de dépôts sur le testnet, traitez le denom comme faisant partie de la clé et conservez la règle ci-dessous : créditez uniquement `uqor` et rejetez tout autre denom. Le denom `erc20:` est **sensible à la casse** (l'écriture en minuscules de l'adresse est un autre denom, inconnu), et convertir un solde ERC-20 en bank coin avec `MsgConvertERC20` exige l'expéditeur sous forme d'adresse bech32 `qor1`. Détails et les trois adresses de contrat : [Développement EVM](/developer-guide/evm-development#fest-tokens).
:::

## Choisir un chemin d'intégration {#choosing-a-path}

QoreChain est une chaîne unique avec **un solde natif QOR unifié unique** exposé via trois interfaces. La **même clé privée contrôle les mêmes fonds** sous une adresse Cosmos (`qor1...`), une adresse EVM (`0x...`) et une adresse SVM (base58) — choisissez l'interface qui convient le mieux à votre stack.

| | **A) Cosmos (natif)** | **B) EVM** | **C) SVM (Solana VM)** |
|---|---|---|---|
| Adresse | `qor1...` (bech32) | `0x...` (Ethereum) | Solana base58 (même clé) |
| Décimales (QOR natif) | **6** (`uqor`) | **18** (style wei) | **9** (lamports ; 1 uqor = 1,000 lamports) |
| Outils | Cosmos SDK / CosmJS | **Ethereum standard** (ethers/web3, MetaMask) | `@solana/web3.js` |
| Signature des retraits | **PQC hybride requise** (ML-DSA-87 + secp256k1) | **secp256k1 / EIP-155 standard, mais uniquement dans une fenêtre d'autorisation PQC ouverte** (clé ML-DSA enregistrée + fenêtre ouverte par un message Cosmos signé en mode hybride) | via tx Cosmos ou soumission sur nœud (voie actuellement désactivée) |
| Support memo / tag | **Oui** (adresse partagée + memo) | Non (une adresse par utilisateur) | Non (une adresse par utilisateur) |
| Détection des dépôts | scanner les événements `MsgSend` | scanner les blocs via `eth_getBlockByNumber` | `getBalance` / `getSignaturesForAddress` |
| Idéal pour | Plateformes natives Cosmos | **Plateformes ayant déjà une intégration EVM** | Plateformes avec outillage Solana |

**Recommandation :** utilisez le **chemin A (Cosmos)** pour les retraits ; c'est la voie native et elle offre des adresses de dépôt partagées basées sur un memo. Depuis la v3.2.0, la voie EVM (chemin B) exige elle aussi une clé ML-DSA-87 enregistrée et une **fenêtre d'autorisation EVM** ouverte et bornée, qui ne peut être ouverte qu'avec un message de la voie Cosmos signé en mode hybride ; un rail de retrait EVM nécessite donc la même stack de signature post-quantique que le chemin A **plus** la gestion des fenêtres (voir [Chemin B](#path-b-evm) et la [fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window)). Le chemin B reste adapté à la **détection des dépôts** avec l'outillage Ethereum standard. Le chemin C (SVM) est, sur le papier, une interface native QOR complète, mais **sa voie de transaction est actuellement désactivée sur l'ensemble du réseau** (voir [Chemin C](#path-c-svm)) — utilisez le chemin A, ou le chemin B pour la détection des dépôts, jusqu'à sa réouverture.

Les trois interfaces **ne s'excluent pas mutuellement** — les fonds envoyés à la forme `0x`, `qor1` ou SVM de la même clé constituent le même solde.

## Exécuter votre nœud {#node}

Les intégrations en production doivent vérifier les dépôts par rapport à leur **propre nœud synchronisé**, et non à un point de terminaison tiers. Suivez [Connexion au mainnet](/getting-started/connecting-to-mainnet) — cette page couvre le paquet binaire prêt à l'emploi (avec sommes de contrôle SHA-256), le genesis, les pairs publics, le plancher de frais (`0.1uqor`) et un démarrage rapide via l'instantané (snapshot) de données de chaîne publié. Aucune licence n'est requise pour exécuter un nœud complet non-validateur.

Comme QoreChain a une **finalité instantanée** (pas de réorganisations), **1 confirmation est définitive** ; attendre 1 à 2 blocs offre une marge opérationnelle confortable.

## Chemin A — Cosmos (natif) {#path-a-cosmos}

URL REST de base : `https://api.qore.host` (ou `http://localhost:1317` sur votre nœud).

### Surveiller les dépôts

```bash
# latest height
curl -s https://rpc.qore.host/status | jq -r .result.sync_info.latest_block_height

# all txs in a height (deposit scanning)
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs/block/{HEIGHT}" | jq '.txs'

# incoming transfers to an address
curl -s "https://api.qore.host/cosmos/tx/v1beta1/txs?query=transfer.recipient='qor1...'&limit=50" | jq '.tx_responses[].txhash'

# balance (uqor — divide by 1e6 for QOR)
curl -s "https://api.qore.host/cosmos/bank/v1beta1/balances/qor1.../by_denom?denom=uqor" | jq -r .balance.amount
```

### Liste de contrôle anti-faux-dépôt {#anti-fake-deposit}

Ne créditez un dépôt **que** lorsque **toutes** les conditions suivantes sont réunies :

1. **`tx_response.code == 0`** — la transaction a réussi ; ne créditez jamais une transaction échouée.
2. Le message est **`/cosmos.bank.v1beta1.MsgSend`** (ou une sortie `MsgMultiSend`) — pas un appel de contrat ni un autre module.
3. Le champ **`to_address`** correspond à votre adresse de dépôt, et (avec le modèle d'adresse partagée) le **`memo`** correspond à l'utilisateur.
4. Le **`denom == "uqor"`** et le `amount` est la valeur créditée (uqor → ÷ 10⁶ pour obtenir des QOR). Rejetez tout autre denom, y compris un denom `erc20:...` ou `ibc/...` (le testnet porte de tels denoms ; le mainnet n'en porte aucun aujourd'hui, mais la règle ne doit pas en dépendre).
5. La transaction se trouve dans un **bloc validé** (`height` présent et ≤ la dernière hauteur validée). La finalité est instantanée — 1 confirmation est définitive ; attendez 1 à 2 blocs pour plus de marge.
6. Recalculez le montant à partir des **événements de transfert** (`coin_received` / `coin_spent`) et recoupez-le avec le montant du message — ne faites jamais confiance à un seul champ ni au memo seul.
7. Vérifiez que le hash de la transaction existe via `GET /cosmos/tx/v1beta1/txs/{hash}` sur votre **propre** nœud synchronisé.

### Retraits — signature PQC hybride {#cosmos-withdrawals}

Le mainnet impose des **signatures post-quantiques** sur les transactions cosmos (`allow_classical_fallback = false`) : chaque retrait nécessite une **signature hybride** — ML-DSA-87 (Dilithium-5, FIPS-204) **plus** secp256k1. Les dépôts n'en ont **pas** besoin (vous ne faites que surveiller la chaîne).

La bibliothèque de signature est [**`@qorechain/wallet-adapter`**](https://github.com/qorechain/qorechain-wallet-adapter) (npm), qui intègre `@qorechain/pqc` pour les primitives FIPS-204 :

```bash
npm i @qorechain/wallet-adapter @qorechain/pqc @cosmjs/proto-signing@0.32 @cosmjs/stargate@0.32 cosmjs-types@0.9.0
# pin the cosmjs packages to 0.32 (the adapter's peer range) and cosmjs-types to 0.9.x — 0.10 breaks the subpath imports the adapter uses
```

La signature se déroule en **deux étapes** (à l'image de `qorechaind tx pqc cosign`) :

**Étape 1 — une seule fois par hot wallet : enregistrer sa clé ML-DSA-87.** Cette transaction d'enregistrement unique est **signée de façon classique** (exemption de démarrage, pour un compte qui n'a pas encore de clé ; dès qu'une clé existe, tout autre message de clé doit être signé en mode hybride) : message `/qorechain.pqc.v1.MsgRegisterPQCKeyV2` avec `{sender, public_key, algorithm_id: 1, key_type: "hybrid"}`. Dérivez la clé ML-DSA de façon déterministe afin qu'elle soit récupérable à partir de votre secret existant — par ex. `seed = SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, puis `mldsa.keygen(seed)` — et stockez le seed avec votre clé de hot wallet. L'enregistrement est explicite : rien n'enregistre la clé à votre place lorsqu'une transaction hybride apparaît pour la première fois, et une clé intégrée dans une transaction n'est pas enregistrée. La chaîne refuse les clés `classical_only` et les clés qui n'offrent aucune protection post-quantique (code 230) et vérifie une preuve de possession facultative lorsque vous en joignez une (CLI : `register-key-v2 ... --pqc-key` ; `@qorechain/sdk` 0.9.0 en joint une automatiquement via `ensurePqcRegistered` dès que le réseau a appliqué v3.2.3, et `@qorechain/wallet-adapter` 0.4.0 n'en joint pas, ce qui est accepté). Définissez explicitement le gas (la clé de 2 592 octets nécessite plus que les 200 000 par défaut ; utilisez `--gas 600000` en CLI, une limite de gas de 600 000 dans le code, et des frais d'au moins gas × 0.1 uqor, soit 60 000 uqor).

**Étape 2 — pour chaque retrait suivant : signer le `MsgSend` en mode hybride.** L'adaptateur intègre la signature ML-DSA-87 dans une extension de tx-body *avant* le `signDirect` secp256k1 normal, de sorte que votre signataire existant reste inchangé :

```js
import { QoreChainSigner } from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

// pqc = { publicKey, secretKey } from mldsa.keygen(seed)
// accountNumber + sequence from the auth query
const signer = new QoreChainSigner({ wallet, chainId: "qorechain-vladi",
  rest: "https://api.qore.host",   // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
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
# code 20 "hybrid PQC signature required" => the transaction carries no PQC extension
#   (a classical-only transaction is refused; only the key registration itself is exempt)
# code 21 => the PQC half did not verify (wrong key or sign-bytes form), see the troubleshooting link below
```

Ensuite, interrogez `GET /cosmos/tx/v1beta1/txs/{hash}` jusqu'à ce qu'elle apparaisse dans un bloc avec `code == 0`.

Pour un HSM ou un signataire personnalisé dans un autre langage, utilisez les bibliothèques FIPS-204 autonomes [**`qorechain-pqc`**](/developer-guide/post-quantum-signing) (npm, PyPI, crates.io, Maven Central, Go) et assemblez la même extension. La chaîne accepte toute signature ML-DSA-87 valide selon FIPS-204, hedged ou déterministe ; signer de manière déterministe (FIPS-204 §3.4, le défaut des bibliothèques) vous donne une signature et un hash de tx reproductibles. Voir [Signature déterministe](/developer-guide/post-quantum-signing#deterministic-signing), et [Dépannage du code 21](/developer-guide/post-quantum-signing#code-21) si une transaction hybride est rejetée.

### Alternative côté serveur : `@qorechain/chain-bridge` {#chain-bridge}

Pour un worker de hot wallet entièrement côté serveur (sans wallet de navigateur impliqué), **`@qorechain/chain-bridge`** (npm) encapsule tout le flux — dérivation de clé, signature hybride et diffusion — en un seul appel. C'est du JavaScript pur (sans addon natif), adapté aux workers serverless :

```js
import { ChainBridge } from "@qorechain/chain-bridge";

const bridge = new ChainBridge({
  cosmosRpc: "https://rpc.qore.host",       // or your own node
  cosmosRest: "https://api.qore.host",      // used to pick the network's hybrid sign-bytes form (required on mainnet and testnet)
  chainId: "qorechain-vladi",
  signerMnemonic: process.env.HOT_WALLET_MNEMONIC,  // from your secrets manager
});

// One call: derives the canonical ML-DSA-87 key, hybrid-signs the MsgSend, and broadcasts.
// Amounts are in uqor (6 decimals). Register the key beforehand with bridge.registerPqc({ mnemonic }).
const { txHash } = await bridge.sendTokens({
  to: "qor1recipient...",
  amountUqor: "1000000",   // 1 QOR
});
```

Si le compte n'a pas encore de clé enregistrée, la bibliothèque envoie elle-même la transaction explicite `MsgRegisterPQCKeyV2` et réessaie une fois ; il s'agit du comportement de la bibliothèque, et non de celui de la chaîne : un rail de hot wallet doit donc enregistrer la clé à l'avance et le confirmer (`GET /qorechain/pqc/v1/account/{address}`) avant le premier retrait. À partir de `chain-bridge` 0.2.3, avec `cosmosRest` défini, l'enregistrement porte la preuve de possession dès que le réseau a appliqué v3.2.3, et avant toute nouvelle inscription la bibliothèque lit la chaîne : si le compte détient déjà une clé qui n'est ni la clé canonique ni la clé legacy de votre mnémonique, elle lève `pqc_key_mismatch` et n'envoie rien (un enregistrement répété coûte ses frais et est refusé). `chain-bridge` (≥0.1.1) utilise la même dérivation PQC canonique liée à l'adresse que le reste de la stack — `SHAKE-256("qorechain:pqc:v1|address|mnemonic")` — de sorte que la clé est récupérable à partir du mnémonique avec `qorechaind tx pqc recover-key`. Les comptes enregistrés avec un outillage plus ancien sont gérés automatiquement (repli sur la legacy-key), et peuvent être migrés une fois vers la clé canonique avec [`MsgRotatePQCKey`](/developer-guide/post-quantum-signing#key-rotation).

## Chemin B — EVM {#path-b-evm}

Intégration Ethereum standard contre `https://evm.qore.host` (chain ID **9801**) ou le port 8545 de votre propre nœud.

* **Décimales :** le QOR natif compte **18 décimales** sur le rail EVM (1 uqor = 10¹² wei). Une erreur ici crédite les dépôts avec un facteur d'erreur de 10¹².
* **Dépôts :** scannez les blocs avec `eth_getBlockByNumber` pour repérer les transferts natifs vers vos adresses ; confirmez avec `eth_getTransactionReceipt` (`status == 0x1`). Les propres transactions EVM des déposants sont elles aussi soumises à la règle de la fenêtre : un utilisateur dont le compte n'a ni clé enregistrée ni fenêtre ouverte ne peut donc pas envoyer de dépôt depuis la voie EVM (il peut utiliser la voie Cosmos à la place), et une transaction signée sans chain id (pré-EIP-155) est purement et simplement refusée. Une fenêtre peut être restreinte (`native_only`, `allowed_targets`) : un dépôt admis est donc toujours un transfert natif ou un appel que la fenêtre autorise ; lisez néanmoins le reçu plutôt que de le supposer.
* **Retraits :** signature secp256k1 / EIP-155 standard, **mais uniquement depuis un compte disposant d'une clé ML-DSA-87 enregistrée et d'une fenêtre d'autorisation EVM ouverte** (depuis la v3.2.0 ; voir [fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window) et le pas-à-pas dans [Votre première transaction](/getting-started/first-transaction#evm-window)). Une transaction en dehors d'une fenêtre est refusée (codespace `pqc`, codes 26, 27 ou 28). La fenêtre doit être ouverte avec une transaction de la voie Cosmos signée en mode hybride ; le chemin B ne supprime donc pas le besoin de signature post-quantique. Dimensionnez `max-value` pour couvrir la valeur plus les frais maximaux (limite de gas × frais maximaux par gas) de chaque retrait que vous attendez dans la fenêtre (pour un hot wallet qui n'envoie que du QOR simple, ajoutez `--native-only` à l'ouverture), et surveillez `GET /qorechain/pqc/v1/evm_window/{address}` pour que le hot wallet ne soit jamais à sec en plein lot. L'ouverture d'une fenêtre fait avancer la séquence du compte, qui est aussi son nonce EVM : lisez donc le nonce une fois la fenêtre ouverte.
* **Anti-faux-dépôt :** vérifiez le statut du reçu, que la valeur déplacée est un transfert **natif** (et non un événement ERC-20 que vous n'indexez pas), et confirmez avec votre propre nœud.
* **Correspondance d'adresses :** l'adresse `0x` et l'adresse `qor1` sont deux encodages du même compte — les fonds sont partagés. Voir [Développement EVM](/developer-guide/evm-development).

## Chemin C — SVM (compatible Solana) {#path-c-svm}

:::caution Voie SVM actuellement désactivée
La voie d'exécution SVM est **actuellement désactivée sur l'ensemble du réseau pour la soumission de transactions**, depuis la version de chaîne v3.1.89 (22 août) — toute transaction qui lui est envoyée renvoie `code 11, "SVM module is disabled"`. Ne **mettez pas** en place de rail de dépôt/retrait sur le chemin C tant que la voie n'a pas rouvert — il s'agit d'une désactivation au moment de la compilation, et non d'un paramètre d'exécution, elle ne peut donc pas être réactivée par un vote de gouvernance ; elle devrait rester désactivée jusqu'à ce qu'un audit externe la valide. Utilisez plutôt le **chemin A (Cosmos)** ou le **chemin B (EVM)**. Les points de terminaison en lecture (par ex. `getBalance`) peuvent continuer à répondre, mais ne construisez pas de détection de dépôts ou de flux de retrait contre SVM tant que la soumission de transactions est désactivée.
:::

Depuis la v3.1.82, l'interface SVM sert du **QOR natif** (voir [QOR natif sur l'interface SVM](/developer-guide/svm-development#native-qor)) :

* **Soldes :** `getBalance` renvoie des lamports (÷ 10⁹ pour obtenir des QOR ; 1 uqor = 1,000 lamports).
* **Dépôts :** `getSignaturesForAddress` donne l'historique des transactions d'une adresse ; les transferts du System Program déplacent du QOR natif.
* Les points de terminaison publics (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sont **en lecture seule** ; soumettez les transactions via votre propre nœud.

## Résumé du flux {#flow-summary}

| Opération | Chemin | Signature nécessaire ? |
|---|---|---|
| **Dépôt** (utilisateur → plateforme) | Surveillez votre nœud synchronisé pour les transferts vers votre adresse (+ memo sur Cosmos) | Non — surveillance uniquement |
| **Retrait** (plateforme → utilisateur) | Construisez le transfert, signez hors ligne, diffusez | Cosmos : PQC hybride · EVM : secp256k1 standard dans une fenêtre autorisée par PQC |
| **Solde / sweep** | Requête de solde REST / EVM / SVM + transfert | Signature uniquement pour le sweep |

## Voir aussi

* [Connexion au mainnet](/getting-started/connecting-to-mainnet) — configuration du nœud, téléchargements, snapshot
* [Exécuter un nœud](/developer-guide/running-a-node) — déploiement, pruning, indexation
* [Signature post-quantique](/developer-guide/post-quantum-signing) — les bibliothèques FIPS-204 derrière les retraits hybrides
* [Réseaux](/appendix/networks) — chain IDs, points de terminaison, décimales par interface
