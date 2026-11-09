---
slug: /getting-started/deploy-in-5-minutes
title: Déployer sur QoreChain en 5 minutes
sidebar_label: Déployer en 5 minutes
sidebar_position: 6
---

# Déployer sur QoreChain en 5 minutes

Cette page s'adresse à un développeur Solidity qui n'a jamais utilisé QoreChain. Vous gardez Foundry ou Hardhat et votre clé MetaMask. Une seule chose est nouvelle : une courte **fenêtre d'autorisation**. QoreChain protège chaque compte avec une clé post-quantique, une transaction Ethereum ne peut pas en porter une ; vous ouvrez donc d'abord une fenêtre bornée, et vos transactions EVM habituelles sont admises tant qu'elle est ouverte. Les étapes ci-dessous utilisent le **testnet** (`qorechain-diana`, chain ID EVM 9800), où rien ne coûte de l'argent réel.

:::note
Ce parcours a été exécuté sur le testnet : une fenêtre ouverte dans QoreX, puis un contrat créé et appelé avec Foundry `cast` à partir de la même phrase de récupération. `forge create` et Hardhat envoient le même type de transaction EVM, mais ils n'ont pas fait partie de cette exécution. Une fenêtre ouverte depuis la ligne de commande `qorechaind` est également confirmée ; voir [Alternative : la ligne de commande](#cli).
:::

## Ce dont vous avez besoin {#what-you-need}

- Un compte MetaMask depuis lequel vous voulez déployer, avec sa phrase de récupération ou sa clé privée.
- [QoreX](/qorex/overview), le wallet QoreChain (application ou extension de navigateur).
- Foundry ou Hardhat déjà installé.

## 1. Importez votre clé MetaMask dans QoreX comme compte coin 60 {#step-import}

Les comptes QoreX utilisent par défaut le coin type 118. Un compte coin 118 a une clé différente de celle de MetaMask : aucune transaction MetaMask ne peut donc en provenir, et une fenêtre ouverte sur ce compte est inutile. Dans QoreX, ouvrez **Vos comptes** et appuyez sur **Ajouter un compte Ethereum (coin 60)**. Son adresse `0x…` est celle que MetaMask affiche, et c'est la même clé qu'une adresse `qor1…` sur QoreChain. Pour le premier compte Ethereum d'une phrase, c'est aussi l'adresse que Foundry dérive de la même phrase à l'index 0. Le compte a sa propre adresse : alimentez-le et sélectionnez-le dans QoreX avant les étapes suivantes. Voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard).

## 2. Passez QoreX sur le testnet {#step-testnet}

- **Application :** Paramètres → **Use testnet (developers)**.
- **Extension de navigateur :** déverrouillez-la, appuyez sept fois sur le numéro de version en bas, puis choisissez **Switch to testnet (diana)**.

Le badge réseau sur l'accueil passe à TESTNET.

## 3. Obtenez des QOR de testnet {#step-faucet}

Demandez des QOR de testnet pour votre adresse `0x…` ou `qor1…` depuis le [Faucet du Dashboard](/dashboard/faucet). Le solde est le même sur les deux formes de l'adresse.

## 4. Ouvrez la fenêtre EVM dans QoreX {#step-window}

- **Extension et application :** la carte intitulée **MetaMask on QoreChain** (avec une marque **0x**) dans la fenêtre contextuelle principale ou sur l'accueil. Elle ouvre l'écran **Fenêtre d'accès EVM**.
- **Application :** aussi Paramètres → Sécurité → **Fenêtre d'accès EVM**.

Si ce compte n'a pas encore de clé post-quantique, QoreX l'enregistre pour vous à cette étape. L'enregistrement coûte 0,09 QOR, une seule fois par compte, et la transaction de la fenêtre paie en plus ses propres frais de réseau. Vous choisissez ensuite trois limites :

| Champ | Plage | Valeur par défaut de QoreX |
|---|---|---|
| Blocs (durée pendant laquelle la fenêtre reste ouverte) | 1 à 17,280 | 300 |
| Transactions max. | 1 à 1,000 | 5 |
| Plafond de dépense, en QOR | supérieur à 0 | 1 |

Le plafond de dépense compte la valeur de chaque transaction **plus ses frais maximaux** (limite de gas multipliée par le plafond de frais), et pas seulement ce qu'elle transfère. Un déploiement de contrat ne déplace aucun QOR mais compte tout de même ses frais maximaux : un déploiement à 3,000,000 de gas envoyé par Hardhat compte environ 0,64 QOR.

Pour une session de déploiement, les valeurs par défaut sont trop petites. Un choix raisonnable est 3,000 blocs (environ une heure sur le testnet), 20 transactions et un plafond de 10 QOR. Gardez-les aussi petites que votre session le permet, et fermez la fenêtre quand vous avez terminé.

:::caution Ouvrez d'abord la fenêtre
L'ouverture d'une fenêtre fait avancer le nonce du compte. Ouvrez-la **avant** de déployer : une transaction signée plus tôt est refusée avec « nonce too low ».
:::

## 5. Déployez avec Foundry ou Hardhat {#step-deploy}

Utilisez la **même clé alimentée** que le compte coin 60 ; QoreX ne peut pas servir de signataire à Foundry, donnez donc à Foundry ou à Hardhat la clé privée (ou la phrase avec `--mnemonic`). Les paramètres réseau :

| Paramètre | Valeur |
|---|---|
| URL RPC | `https://evm-testnet.qore.host` |
| Chain ID | `9800` |
| Devise | QOR, 18 décimales |

**Foundry**

```bash
export ETH_RPC_URL=https://evm-testnet.qore.host

forge create src/Counter.sol:Counter --private-key $DEPLOYER_KEY --broadcast
cast send <contract> "increment()" --private-key $DEPLOYER_KEY
cast call <contract> "number()(uint256)"
```

**Hardhat**

```js
// hardhat.config.js
module.exports = {
  solidity: "0.8.24",
  networks: {
    diana: {
      url: "https://evm-testnet.qore.host",
      chainId: 9800,
      accounts: [process.env.DEPLOYER_KEY],
    },
  },
};
```

```bash
DEPLOYER_KEY=0x... npx hardhat run scripts/deploy.js --network diana
```

Chaque transaction que vous envoyez (déploiement ou appel) utilise l'une des transactions de la fenêtre. Les lectures (`cast call`, fonctions view, estimation du gas) n'ont pas besoin de fenêtre et n'en consomment aucune.

## Vérifier la fenêtre et gérer l'expiration {#check-and-expiry}

Une fenêtre **expire** : lorsque ses blocs, ses transactions ou son plafond de dépense sont épuisés, la voie EVM refuse votre transaction suivante avec `no open EVM authorisation window` ou `EVM authorisation window exhausted`. Ouvrez-en une nouvelle dans QoreX ; une nouvelle fenêtre remplace l'ancienne.

Pour voir son état, utilisez l'onglet **PQ key status** de [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers) (voir [Développeurs](/dashboard/developers)), ou la route REST :

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

`live: true` avec `remaining_blocks`, `remaining_txs` et `remaining_value` (en `uqor`) signifie qu'elle est ouverte.

## Alternative : la ligne de commande {#cli}

Avec le binaire de version `qorechaind`, vous pouvez effectuer les étapes 1 et 4 ainsi que l'enregistrement de la clé post-quantique sans QoreX. Les commandes complètes (import de clé, `tx pqc register-key-v2`, `tx pqc open-evm-window`, `tx pqc cosign`) se trouvent dans [Développement EVM](/developer-guide/evm-development) et dans la section [Fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window). Une fenêtre ouverte de cette façon, suivie d'une transaction envoyée avec `cast`, est confirmée sur le testnet.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

qorechaind tx pqc open-evm-window 3000 20 10qor --from deployer \
  --chain-id $QCHAIN --node $QNODE --gas 400000 --fees 80000uqor --generate-only > window.json
qorechaind tx pqc cosign window.json --from deployer --pqc-key deployer-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Ne restreignez pas une fenêtre de déploiement avec `--native-only` ou `--allowed-targets` : les deux refusent la création de contrat. Ils sont destinés aux sessions ultérieures, une fois le contrat créé.

## Ce qui est différent sur le testnet {#diana-notes}

- **CosmWasm** n'accepte sur le testnet que des codes approuvés par la gouvernance : vous ne pouvez donc pas y téléverser votre propre contrat. Solidity est la voie ouverte.
- **SVM** n'est pas disponible.
- Le mainnet fonctionne de la même façon avec le chain ID 9801 et `https://evm.qore.host`, mais commencez par le testnet.

## Erreurs courantes {#errors}

| Message | Cause | Solution |
|---|---|---|
| `account ... has no registered post-quantum key` | le compte n'a pas de clé ML-DSA-87 | ouvrez une fenêtre dans QoreX, qui l'enregistre, ou enregistrez-la depuis la ligne de commande |
| `no open EVM authorisation window` | aucune fenêtre, ou elle a expiré | ouvrez une fenêtre |
| `EVM authorisation window exhausted` | transactions ou plafond de dépense épuisés | ouvrez une nouvelle fenêtre avec des limites plus grandes |
| `nonce too low` | la fenêtre a été ouverte après votre signature | ouvrez d'abord la fenêtre, puis envoyez |
| `only replay-protected (EIP-155) Ethereum transactions are accepted` | une transaction signée sans chain ID | définissez `chainId` dans votre configuration réseau |

Suite : [Développement EVM](/developer-guide/evm-development), [Sécurité et récupération de QoreX](/qorex/security-and-recovery#evm-window), [Développeurs](/dashboard/developers).
