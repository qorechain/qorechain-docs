---
slug: /developer-guide/evm-window-reference
title: Référence de la fenêtre d'autorisation EVM (v3.2.8)
sidebar_label: Référence de la fenêtre EVM
sidebar_position: 7
---

# Référence de la fenêtre d'autorisation EVM (v3.2.8)

Une transaction Ethereum ne porte qu'une signature secp256k1 et rien d'autre : elle ne peut donc pas porter la signature post-quantique (ML-DSA-87) que QoreChain demande à toutes les autres transactions. La **fenêtre d'autorisation EVM** comble ce vide. Le compte ouvre d'abord une fenêtre bornée avec un message QoreChain Native qui **est** signé avec sa clé post-quantique, puis la voie EVM n'admet les transactions ordinaires MetaMask, ethers.js, Hardhat ou Foundry du compte que tant que la fenêtre les couvre. Cette page est la référence complète du comportement d'une fenêtre dans la version **v3.2.8**.

:::note Où fonctionne la v3.2.8
Le testnet **`qorechain-diana`** exécute la **v3.2.8** depuis le 12 novembre 2026. Le mainnet **`qorechain-vladi`** ne l'a pas encore appliquée ; sur le mainnet, la fenêtre fonctionne comme décrit dans [Développement EVM](/developer-guide/evm-development#evm-window), sans les options et règles marquées « v3.2.8 » ci-dessous. Un nœud antérieur à la v3.2.8 refuse un message de fenêtre qui renseigne les nouvelles listes.
:::

## Pourquoi c'est important {#why}

- **Une clé classique volée ne vaut que ce qu'une fenêtre ouverte admet.** La fenêtre borne le temps (en blocs), le nombre de transactions, le QOR qui peut sortir, et éventuellement les contrats que le compte peut toucher.
- **La clé post-quantique garde la main.** Ouvrir, restreindre et fermer une fenêtre sont tous des messages Native signés en hybride. La clé classique seule ne peut jamais en ouvrir une.
- **La v3.2.8 durcit les valeurs par défaut.** Les méthodes de précompilés standard sont refusées par défaut, les signatures vérifiées par d'autres contrats ont besoin du consentement de la fenêtre, et changer la clé post-quantique ferme la fenêtre.

La version courte des ajouts de la v3.2.8 se trouve dans [Options de fenêtre ajoutées dans la v3.2.8](/developer-guide/evm-development#evm-window-v328) ; cette page ne la répète pas en entier et ajoute les exemples, la référence des champs et le tableau des erreurs. Pour la première fenêtre pas à pas, voir [Votre première transaction](/getting-started/first-transaction#evm-window).

## Ouvrir, fermer et lire {#lifecycle}

| Action | Message | CLI | REST |
| ------ | ------- | --- | ---- |
| Ouvrir (remplace toute fenêtre ouverte) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | aucune (une transaction) |
| Fermer immédiatement | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | aucune (une transaction) |
| Lire | aucun | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

L'ouverture et la fermeture sont des transactions de la voie Native et exigent la signature hybride du compte (classique plus ML-DSA-87) ; le compte doit déjà détenir une clé post-quantique enregistrée pour ouvrir une fenêtre. Fermer une fenêtre retire aussi un consentement EIP-7702 en attente. L'ouverture **fait avancer le nonce du compte** (la séquence Native est le nonce EVM) : ouvrez donc d'abord la fenêtre et lisez le nonce EVM ensuite.

### CLI {#cli}

Construisez la transaction avec `--generate-only`, puis ajoutez la signature post-quantique avec `tx pqc cosign`. Le binaire de version `qorechaind` possède `gen-key` et `cosign` ; un build communautaire ne les a pas.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Sans arguments, le CLI utilise des valeurs par défaut dimensionnées pour une session de déploiement : 3,600 blocs, 10 transactions et 25 QOR. Une fenêtre limitée à un seul contrat de token (remplacez l'adresse par la vôtre) :

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x1111111111111111111111111111111111111111 \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

Fermez une fenêtre plus tôt, par exemple si vous pensez que la clé classique est exposée. Ce que la fenêtre admettait encore est refusé dès le bloc suivant :

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Lisez la fenêtre :

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

`live: true` accompagné de `remaining_blocks`, `remaining_txs` et `remaining_value` (uqor) est ce que vous voulez voir. La référence des commandes se trouve dans [Commandes de transaction](/cli-reference/transaction-commands#open-evm-window).

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

Un compte sans fenêtre répond HTTP 200 avec `found: false` : la route peut donc être interrogée en toute sécurité. Chaque nombre est une chaîne JSON. Une fenêtre stockée peut être expirée ou épuisée : `live` indique si elle admet encore au moins une transaction de valeur nulle à la hauteur courante.

### TypeScript {#typescript}

Les assistants de fenêtre se trouvent dans `@qorechain/sdk` (voir le [guide EVM du SDK](/sdk/guides/evm#evm-window-scope) pour la configuration de signature). `openEvmWindowMsg` accepte tous les champs ci-dessous, `closeEvmWindowMsg` construit le message de fermeture, `fetchEvmWindow` lit la fenêtre, et `classifyEvmWindowRejection` explique un refus.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract (replace the address with your own).
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x1111111111111111111111111111111111111111"], // your token contract
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg` vérifie les bornes et les formats de listes avant toute signature : une erreur échoue donc localement au lieu de coûter une transaction refusée. `MAX_EVM_WINDOW_BLOCKS` et `MAX_EVM_WINDOW_TXS` exportent les bornes. La relecture (`fetchEvmWindow`) renvoie les bornes, les compteurs et le périmètre v3.2.3 (`nativeOnly`, `allowedTargets`) ; `validators` (adresses de contrats), `stakingValidators` (`qorvaloper1...`) et `ibcReceivers` (`"<channel>/<receiver>"`) sont acceptés par le constructeur à partir du SDK 0.14.0, qui porte les listes v3.2.8 ; la relecture ne les renvoie pas, lisez-les donc via REST. L'exemple ci-dessus utilise `stakingValidators` ; il n'a pas été exécuté avec le SDK 0.14.0. Ne renseignez les trois listes que pour un réseau qui exécute la v3.2.8 : un nœud antérieur refuse un message de fenêtre qui les renseigne. Avec un `connectTx` à signature hybride, la clé post-quantique doit déjà être enregistrée.

### Testé sur le testnet {#tested}

Exécuté sur `qorechain-diana` le 12 novembre 2026 (version v3.2.8) avec un compte eth-native qui avait enregistré sa clé post-quantique, avec le SDK 0.13.0 (`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`) et la signature hybride. Les champs de fenêtre `validators`, `staking_validators` et `ibc_receivers` n'étaient pas dans les constructeurs du SDK 0.13.0 ; le SDK 0.14.0 les ajoute à `openEvmWindowMsg`, et cette exécution ne les a pas utilisés (utilisez la ligne de commande pour eux avec le SDK 0.13.0).

| Étape | Résultat |
| ---- | ------ |
| `GET /qorechain/pqc/v1/evm_window/{address}` avant l'ouverture | `found: false`, `live: false` |
| Ouverture : 300 blocs, 5 transactions, 1,000,000 uqor | code 0, 187,282 de gas utilisé. Relecture : `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| Nouvelle ouverture avec `nativeOnly: true` | code 0, 187,803 de gas utilisé. La nouvelle fenêtre a remplacé l'ancienne : `native_only: true`, un nouveau `opened_height` |
| Fermeture | code 0, 170,468 de gas utilisé. Relecture : `found: false` |

Avec le SDK 0.14.0, le même jour, une fenêtre ouverte avec `allowedTargets` (une adresse cible autorisée), `stakingValidators` (une adresse d'opérateur de validateur) et `ibcReceivers` (une paire `channel-0/...`) a réussi avec le code 0 et 195,233 de gas utilisé. La relecture REST a listé `allowed_targets` et renvoyé `found: true`, `live: true` ; elle ne renvoie pas les listes `validators`, `staking_validators` ni `ibc_receivers` : conservez donc les valeurs avec lesquelles vous avez ouvert la fenêtre.

`fetchEvmWindow` a renvoyé les mêmes champs en camel case (`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`). L'ouverture et la fermeture sont des transactions Cosmos signées en hybride : la première qu'un compte envoie exige donc que sa clé soit d'abord enregistrée.

### Python, Go, Rust et Java {#other-languages}

Chaque SDK a un constructeur pour le message et une lecture REST. Tous vérifient localement les bornes de la chaîne. Un constructeur de langage qui renseigne les listes v3.2.8 a besoin du SDK 0.14.0 ou ultérieur (Java : la 0.14.0 sur Maven Central) ; les versions antérieures ne construisent que les anciens champs.

| Langage | Ouvrir (avec toutes les listes) | Fermer | Lire | Limites EVM |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` avec un `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` avec `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | pas encore d'assistant ; lisez la route REST |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python :

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x1111111111111111111111111111111111111111"],  # your token contract
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go :

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets: []string{"0x1111111111111111111111111111111111111111"}, // your token contract
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust :

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x1111111111111111111111111111111111111111".into()], // your token contract
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java :

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x1111111111111111111111111111111111111111"), // allowedTargets: your token contract
    null,                                                   // validators
    null,                                                   // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

Le SDK n'ouvre jamais une fenêtre à votre place. Une fenêtre autorise des dépenses : l'étape reste donc explicite et visible pour l'utilisateur.

## Champs {#fields}

| Champ (option CLI) | Limite | Signification |
| ---------------- | ----- | ------- |
| `blocks` (premier argument) | 1 à 17,280 | La fenêtre n'admet plus rien après la hauteur d'ouverture plus `blocks`. C'est un nombre de blocs, pas une durée : environ 5 heures sur le testnet et environ 15 heures sur le mainnet avec les temps de bloc actuels |
| `max_txs` (deuxième argument) | 1 à 1,000 | Combien de transactions EVM elle admet |
| `max_value` (troisième argument) | positif | Total d'uqor que la fenêtre laisse sortir du compte : la valeur transférée **plus** les frais maximum (limite de gas fois plafond de frais) de chaque transaction admise |
| `native_only` (`--native-only`) | true ou false | N'admettre que les transferts de QOR simples : pas de calldata, pas de création de contrat, pas de destinataire qui porte du code, pas d'autorisation EIP-7702 |
| `allowed_targets` (`--allowed-targets`) | au plus 16 adresses `0x`, sans doublons | N'admettre que les transactions vers ces adresses ; la création de contrat est refusée |
| `validators` (`--validators`) | au plus 16 adresses `0x`, sans doublons | Contrats dont la vérification de la signature du compte compte pour les propres actions du compte : un module de validation qu'un contrat de portefeuille appelle, ou le point d'entrée ERC-4337. v3.2.8 |
| `staking_validators` (`--staking-validators`) | au plus 16 adresses `qorvaloper...`, sans doublons | Validateurs auxquels le compte peut déléguer ou redéléguer via la fenêtre. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | au plus 16 entrées `<channel>/<receiver>`, au plus 256 caractères chacune, sans espaces ni virgules | Destinations exactes vers lesquelles un transfert IBC de QOR natif peut aller. Comparées octet par octet : écrivez donc `channel-0` et le destinataire bech32 en minuscules exactement comme le transfert les porte. v3.2.8 |

Chaque borne doit être renseignée : la chaîne refuse une borne manquante plutôt que de lui donner une valeur par défaut (le CLI remplit lui-même les valeurs par défaut de la session de déploiement). Toute borne épuisée met fin à la fenêtre en pratique. Une fenêtre ne fonctionne que tant que la clé post-quantique du compte est utilisable, c'est-à-dire ni vide, ni classique seulement, ni désactivée par la gouvernance.

### Ce qu'une fenêtre compte {#counting}

À l'admission, avant l'exécution de la transaction, chaque transaction EVM utilise une des `max_txs` et ajoute à la valeur utilisée sa valeur transférée plus ses frais maximum, convertis de l'unité EVM à 18 décimales en uqor et arrondis au supérieur. Une transaction admise puis annulée (revert) a quand même utilisé sa part. Après l'exécution, le QOR natif qu'un précompilé a déplacé pour le compte (une délégation, un dépôt, un transfert IBC) est aussi imputé à la fenêtre : il compte donc contre `max_value` bien que la valeur de la transaction fût nulle.

Non comptés : `eth_call`, `eth_estimateGas` et les simulations. Les tokens ne sont pas tarifés du tout : un transfert ou une approbation ERC-20 porte une valeur nulle ; bornez-les donc avec un périmètre (`allowed_targets`). Chaque imputation émet un événement `pqc_evm_window_used` avec les attributs `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value` et `source` (`ante` pour l'admission, `settlement` pour l'imputation après exécution), afin qu'un portefeuille puisse montrer ce qu'une transaction a pris. L'ouverture et la fermeture émettent `pqc_evm_window_opened` et `pqc_evm_window_closed`.

## Précompilés standard via une fenêtre {#precompile-allowlist}

Pour un compte qu'une fenêtre autorise, une méthode d'un précompilé standard (staking, distribution, ICS-20, gov, slashing, les précompilés de tokens ERC-20) est refusée à moins qu'elle figure dans le tableau et que la fenêtre liste ce précompilé dans `allowed_targets`. Les adresses des précompilés sont dans [Précompilés EVM](/developer-guide/evm-precompiles) ; ceux du staking, de la distribution, d'ICS-20 et de gov sont `0x...0800`, `0x...0801`, `0x...0802` et `0x...0805`.

| Précompilé | Méthode | Admise quand |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | les récompenses sont versées au compte lui-même (son adresse de retrait est la sienne) |
| distribution | `withdrawValidatorCommission` | le validateur est celui du compte et verse au compte lui-même |
| distribution | `depositValidatorRewardsPool` | le validateur est dans `staking_validators` et chaque pièce est du QOR natif |
| staking | `delegate`, `redelegate` | le validateur de destination est dans `staking_validators` |
| ICS-20 | `transfer` | QOR natif, via le port `transfer`, sans mémo, vers une paire de `ibc_receivers` |
| Précompilés de tokens ERC-20 | `transfer`, `transferFrom`, `approve` | QOR natif ; un autre token seulement quand la fenêtre liste l'adresse de ce token |

Pour le staking et pour la réclamation des récompenses, utilisez les messages Cosmos natifs (QoreX, ou les commandes staking et distribution de qorechaind) ; les champs de fenêtre ci-dessus décrivent ce que la chaîne accepte, mais staker depuis MetaMask n'est pas une voie prise en charge.

Tout le reste est refusé via une fenêtre, quoi qu'elle liste : retirer une délégation (undelegate), annuler un unbonding, voter et les autres actions de gouvernance, changer l'adresse de retrait, créer ou modifier un validateur, sortir de prison (unjail), alimenter le pool communautaire. Envoyez-les comme des transactions Native signées en post-quantique. Lister ICS-20 sans `ibc_receivers` n'admet aucun transfert, et lister le précompilé de staking sans `staking_validators` n'admet aucune délégation.

Exemples de ce qu'il faut lister :

| Objectif | Fenêtre |
| ---- | ------ |
| Staker, réclamer des récompenses, retirer une délégation, voter | Utilisez les messages Cosmos natifs (QoreX Stake et Claim, ou les commandes qorechaind tx staking / distribution) ; n'utilisez pas la fenêtre EVM pour cela |
| Envoyer du QOR vers l'extérieur par le pont | `allowed_targets` avec le précompilé ICS-20, plus `ibc_receivers` comme `channel-0/<receiver>` |
| Déplacer un token IBC détenu comme précompilé ERC-20 | `allowed_targets` avec l'adresse de ce token |

Lister un contrat vaut consentement du compte à ce que ce contrat peut faire de ses actifs : pour un vault, un routeur ou un token qui détient les tokens du compte, la fenêtre ne borne ni quels tokens bougent ni où ils vont.

## Création de contrat {#contract-creation}

Déployer un contrat exige une fenêtre **sans périmètre**. Une fenêtre avec `native_only` ou avec `allowed_targets` refuse la création de contrat. Pour une session de déploiement, ouvrez une fenêtre simple (les valeurs par défaut du CLI sont dimensionnées pour cela), déployez, puis fermez-la. Pour les sessions suivantes, ouvrez une fenêtre avec `--allowed-targets <contract-address>` pour la limiter aux appels du contrat que vous avez déployé. Le pas à pas de déploiement avec Hardhat et Foundry se trouve dans [Développement EVM](/developer-guide/evm-development).

## Permits, ordres EIP-712 et Permit2 {#permits}

Un permit EIP-2612, un transfert Permit2, un ordre signé ou une méta-transaction est vérifié par un contrat avec le précompilé `ecrecover`. À partir de la v3.2.8 (sur les deux réseaux, dès qu'un réseau l'applique), pour un compte qui détient une clé post-quantique utilisable, cette vérification ne réussit que tant que la fenêtre **active** du compte elle-même admet le **contrat vérificateur**, c'est-à-dire le token ou Permit2 lui-même et non le routeur qui relaie l'appel.

1. Si la fenêtre a un périmètre, listez le contrat vérificateur dans `allowed_targets` (`native_only` n'admet aucune signature de ce type).
2. Ouvrez la fenêtre **avant** que l'utilisateur signe. Sans fenêtre active, la signature est considérée comme invalide et le contrat la refuse.
3. La signature elle-même n'est jamais imputée à la fenêtre, car une signature est publique une fois utilisée.
4. Un permit ou une approbation accordé dans une fenêtre subsiste après la fermeture de la fenêtre. Passez en revue et révoquez les approbations à la fin de la session.

Les comptes sans enregistrement post-quantique, un portefeuille délégué qui vérifie sa propre signature, et la signature de l'expéditeur lui-même dans une fenêtre sans périmètre se récupèrent comme avant. Les requêtes et les estimations de gas ne sont pas affectées.

## Changements de clé et consentement EIP-7702 {#key-changes}

- **Faire pivoter, migrer ou réenregistrer la clé post-quantique ferme la fenêtre** et supprime tout consentement EIP-7702. Ouvrez de nouveau la fenêtre ensuite. Prévoyez-le dans les portefeuilles chauds et les intégrations d'échanges.
- La fenêtre, le consentement EIP-7702 (`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`) et les messages de gestion de compte abstrait doivent être le **propre message de premier niveau du compte, signé en hybride**. Ils ne peuvent pas être envoyés via authz (`MsgExec`) ni accordés à un autre compte, et un octroi de ces types de messages est refusé. Les octrois de consentement existants de ce type ont été supprimés lors de la mise à niveau.
- Un compte délégué EIP-7702 qui agit dans la transaction de quelqu'un d'autre a besoin de sa propre fenêtre active au moment où son code agit. Sans elle, seul cet appel échoue, et le contrat appelant voit l'échec : un paiement vers un compte délégué ne fait donc plus annuler toute la transaction du payeur.

Le consentement pour une délégation s'enregistre avec `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` et se lit avec `GET /qorechain/pqc/v1/evm_delegation_consent/{address}` ; voir [Délégations EIP-7702](/developer-guide/evm-development#eip-7702).

## Limites en vigueur {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

Le testnet a répondu le 12 novembre 2026 avec `tx_max_gas` **30000000** et `precompile_input_max_bytes` **16384** :

| Limite | Valeur | Signification |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | Le plus de gas qu'une transaction EVM peut demander ; au-delà, la transaction est refusée avant de s'exécuter. Les exécutions EVM lancées par un même message Native partagent ce même budget |
| `precompile_input_max_bytes` | 16,384 | La plus grande entrée qu'un précompilé avec état protégé accepte |
| `blocks` de la fenêtre | 17,280 | Fenêtre la plus longue |
| `max_txs` de la fenêtre | 1,000 | Maximum de transactions dans une fenêtre |
| Entrées de liste | 16 par liste | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

La réponse contient aussi un objet `limits` avec les valeurs fixées par la gouvernance ; lisez `tx_max_gas` et `precompile_input_max_bytes` de premier niveau, qui sont les valeurs en vigueur. La route est servie à partir de la v3.2.8 : le mainnet public répond donc `501 Not Implemented` jusqu'à sa mise à niveau.

Une fenêtre ouverte à un prix de gas normal compte quand même les frais maximum : une limite de gas de 30,000,000 avec un plafond de frais de 100 gwei compte 3 QOR contre `max_value` pour une transaction.

## Erreurs {#errors}

Les refus reviennent avec le codespace `pqc`. Via le JSON-RPC EVM, un refus arrive comme une erreur de diffusion qui porte le message mais pas de codespace : comparez donc aussi sur le texte (les classificateurs des SDK le font).

| Code | Message | Cause | Que faire |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | Pas de fenêtre, pas de clé post-quantique enregistrée, ou la fenêtre a expiré | Enregistrez d'abord une clé s'il n'y en a pas, puis ouvrez une fenêtre |
| 27 | `EVM authorisation window exhausted` | Une borne est épuisée, ou la transaction est hors du périmètre de la fenêtre (y compris un précompilé standard que la fenêtre ne liste pas, ou une création de contrat sous une fenêtre à périmètre) | Ouvrez une nouvelle fenêtre avec des bornes plus grandes ou le périmètre nécessaire |
| 28 | `invalid EVM authorisation window` | Une demande d'ouverture hors des limites, ou aucune clé utilisable à ce moment | Vérifiez `blocks`, `max_txs`, `max_value` et les listes ; enregistrez ou réparez la clé |
| 62 | `delegated account has no window covering this action` | Un compte délégué a agi, ou l'expéditeur a déplacé plus que sa fenêtre ne couvre, sans fenêtre couvrante. À partir de la v3.2.8, la même règle ne fait échouer que l'appel fautif | Ouvrez pour ce compte une fenêtre qui admet l'action |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | Une méthode de précompilé standard dont le message Native est désactivé | Attendez ; rien à changer dans la fenêtre |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | Un précompilé qui déplace de la valeur, atteint par du code, pour un compte dont la fenêtre ne le liste pas | Ajoutez le précompilé à `allowed_targets` |
| nonce | `nonce too low` | La transaction EVM a été signée avant l'ouverture de la fenêtre (l'ouverture fait avancer le nonce) | Relisez le nonce et signez de nouveau |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | Une transaction signée sans chain id | Définissez le chain id dans la configuration réseau de l'outil |

`classifyEvmWindowRejection(err)` dans le SDK TypeScript renvoie `"no-pqc-key"`, `"no-window"`, `"exhausted"` ou `"invalid"` ; les autres SDK ont un classificateur équivalent (`describe_evm_window_error` en Python, `tx.ClassifyEVMWindowError` en Go, `classify_evm_window_error` en Rust, `EvmWindowIssue.classify` en Java).

## Ce que la fenêtre ne régit pas {#outside}

La fenêtre régit la voie EVM, c'est-à-dire les transactions signées avec la seule clé classique. Ce qui suit ne lui est pas imputé, car chaque élément porte sa propre signature post-quantique ou est lancé par un module pour un compte qui a signé :

- Les messages de la voie Native que le compte signe lui-même : envois bancaires, staking, gouvernance, et un `MsgCrossVMCall` vers l'EVM, qui s'exécute sous sa propre adresse `0x` de signataire.
- Les exécutions de compte abstrait autorisées par les authentificateurs du compte.
- Les conversions ERC-20 et les callbacks IBC exécutés par des modules.

Un appel cross-VM vers l'EVM que l'expéditeur n'a pas envoyé lui-même (par exemple sous un octroi authz) s'exécute sous la fenêtre de l'expéditeur et exige qu'elle admette la cible. Le pont cross-VM `0x0901` exige une fenêtre qui le liste. Voir [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability).

## Flux MetaMask et QoreX {#qorex-flow}

MetaMask signe avec une clé Ethereum, qui est la clé d'un **compte de style Ethereum (coin 60)**, et MetaMask ne peut pas produire de message Native. QoreX est l'endroit où un tel compte ouvre sa fenêtre ; les envois propres de QoreX utilisent la voie Native et n'en ont jamais besoin.

1. Dans QoreX, ajoutez ou restaurez le compte coin-60 de votre phrase MetaMask (voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard)). Le compte a besoin d'une clé ML-DSA-87 enregistrée ; votre premier transfert QoreX l'enregistre.
2. Ouvrez la carte **Fenêtre d'accès EVM** (application : Réglages, Sécurité, Fenêtre d'accès EVM ; extension : le bouton **Fenêtre d'accès EVM** dans la popup) et choisissez combien de blocs (jusqu'à 17,280), combien de transactions (jusqu'à 1,000) et le plafond de dépense en QOR. Le plafond couvre chaque montant plus ses frais maximum. Les valeurs par défaut sont 300 blocs, 5 transactions et 1 QOR.
3. Approuvez le message signé en hybride. Une nouvelle fenêtre remplace toute fenêtre ouverte, et l'ouverture fait avancer votre nonce : n'envoyez donc depuis MetaMask qu'après ; une transaction préparée plus tôt est refusée avec « nonce too low ».
4. Envoyez depuis MetaMask avec le chain id 9800 (testnet) ou 9801 (mainnet). Quand vous avez terminé, utilisez **Fermer la fenêtre**, proposé uniquement tant qu'une fenêtre est active.

La carte QoreX fixe les trois bornes. Elle ne propose pas d'écran pour les listes de périmètre (`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`) : une fenêtre à périmètre vient donc de `qorechaind` ou d'un SDK. Voir [Fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window) pour la carte et ses quatre états.

## Pages associées {#related}

- [Développement EVM](/developer-guide/evm-development) : le runtime, les limites de gas et les [options de fenêtre v3.2.8](/developer-guide/evm-development#evm-window-v328)
- [Précompilés EVM](/developer-guide/evm-precompiles)
- [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability)
- [Signature post-quantique](/developer-guide/post-quantum-signing)
- [Guide EVM du SDK](/sdk/guides/evm#evm-window-scope)
- [Commandes de transaction](/cli-reference/transaction-commands#open-evm-window) et [Commandes de requête](/cli-reference/query-commands)
- [Points de terminaison REST et gRPC](/api-reference/rest-grpc-endpoints)
- [Votre première transaction](/getting-started/first-transaction#evm-window)
- [QoreX : fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window)
