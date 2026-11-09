---
slug: /getting-started/deploy-in-5-minutes
title: Déployer sur QoreChain en 5 minutes
sidebar_label: Déployer en 5 minutes
sidebar_position: 6
---

# Déployer sur QoreChain en 5 minutes

Cette page s'adresse à un développeur Solidity qui n'a jamais utilisé QoreChain. Vous gardez Foundry ou Hardhat et la même phrase de récupération que vous utilisez pour MetaMask. Une seule chose est nouvelle : une courte **fenêtre d'autorisation**. QoreChain protège chaque compte avec une clé post-quantique, une transaction Ethereum ne peut pas en porter une ; vous ouvrez donc d'abord une fenêtre bornée, et vos transactions EVM habituelles sont admises tant qu'elle est ouverte. Les étapes ci-dessous utilisent le **testnet** (`qorechain-diana`, chain ID EVM 9800), où rien ne coûte de l'argent réel.

:::note
Ce parcours a été exécuté sur le testnet : une fenêtre ouverte dans QoreX, puis un contrat créé et appelé avec Foundry `cast` à partir de la même phrase de récupération. `forge create` et Hardhat envoient le même type de transaction EVM, mais ils n'ont pas fait partie de cette exécution. Une fenêtre ouverte depuis la ligne de commande `qorechaind` est également confirmée ; voir [Alternative : la ligne de commande](#cli).
:::

## Ce dont vous avez besoin {#what-you-need}

- La phrase de récupération du compte depuis lequel vous voulez déployer. QoreX ne peut pas importer une clé privée brute. Si vous n'avez qu'une clé privée, utilisez plutôt la [ligne de commande](#cli).
- [QoreX](/qorex/overview), le wallet QoreChain (application ou extension de navigateur).
- Foundry ou Hardhat déjà installé.

## 1. Ajoutez un compte coin 60 à QoreX {#step-import}

Les comptes QoreX utilisent par défaut le coin type 118, et une fenêtre ouverte sur un compte coin 118 est inutile pour les outils EVM. Il vous faut un **compte Ethereum (coin 60)**. Dans QoreX, ouvrez **Vos comptes** et appuyez sur **Ajouter un compte Ethereum (coin 60)**. QoreX le dérive de la **propre phrase de récupération** du wallet avec le chemin Ethereum `m/44'/60'`. Son adresse `0x…` est la même que dans MetaMask ou Foundry uniquement s'ils utilisent cette même phrase (pour Foundry, chemin de dérivation `m/44'/60'/0'/0/0`, index 0). Si votre compte MetaMask provient d'une autre phrase, QoreX affiche une adresse différente, et une fenêtre ouverte là ne couvre pas la clé avec laquelle vous déployez. L'adresse `0x…` est la même clé qu'une adresse `qor1…` sur QoreChain.

Le compte a sa propre adresse : alimentez-le et sélectionnez-le dans QoreX avant les étapes suivantes. Voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard).

:::caution Ne collez jamais une phrase de production dans des outils de développement
Utilisez une phrase de récupération créée pour les tests, avec uniquement des QOR de test. Ne saisissez pas la phrase d'un compte qui détient des fonds réels dans Foundry, Hardhat ou un script.
:::

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

Utilisez la clé du **même compte coin 60 alimenté**. QoreX ne peut pas servir de signataire à Foundry : donnez donc à Foundry ou à Hardhat la clé issue de la même phrase de récupération, par exemple `--mnemonic` avec l'index 0 dans Foundry. Les paramètres réseau :

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

Avec le binaire de version `qorechaind`, vous pouvez importer une clé privée brute, enregistrer sa clé post-quantique et ouvrir la fenêtre sans QoreX. C'est la voie pour un développeur qui n'a qu'une clé privée. `gen-key` et `cosign` ne sont pas dans un build communautaire : il faut donc le binaire de version. Les règles de la fenêtre se trouvent dans la section [Fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window) de [Développement EVM](/developer-guide/evm-development). Une fenêtre ouverte de cette façon, suivie d'une transaction envoyée avec `cast`, est confirmée sur le testnet.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# import the private key as an eth_secp256k1 key: the qor1... and 0x... addresses are one account
qorechaind keys import-hex deployer <private-key-hex-without-0x> --key-type eth_secp256k1

# register a post-quantum key once per account (back up the .dilithium file)
qorechaind tx pqc gen-key deployer-mldsa
qorechaind tx pqc register-key-v2 dilithium5 <public_key_hex> hybrid --pqc-key deployer-mldsa \
  --from deployer --chain-id $QCHAIN --node $QNODE --gas auto --gas-adjustment 1.3 --gas-prices 0.2uqor

# open the window

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
