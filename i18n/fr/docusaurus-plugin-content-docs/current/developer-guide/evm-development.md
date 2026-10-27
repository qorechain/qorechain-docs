---
slug: /developer-guide/evm-development
title: Développement EVM
sidebar_label: Développement EVM
sidebar_position: 2
---

# Développement EVM

QoreChain exécute un environnement d'exécution entièrement compatible EVM sur le QoreChain EVM Engine, ce qui vous permet de déployer des contrats intelligents Solidity et d'interagir avec eux à l'aide d'outils familiers. Le module EVM expose une interface JSON-RPC sur le **port 8545** (WebSocket sur le **8546**) qui prend en charge les flux de travail de développement Ethereum standard.

:::note
Les exemples ci-dessous ciblent le mainnet **`qorechain-vladi`** (EVM chain ID **9801**), actif depuis le 7 juin 2026, qui exécute la version de nœud **v3.2.4** au moment de la rédaction (appliquée par la proposition de gouvernance 13 à la hauteur 3,742,566 le 23 octobre 2026 ; la v3.2.3 avait été appliquée à la hauteur 3,662,051 le 20 octobre 2026 ; la proposition de gouvernance 14 du mainnet appliquerait la v3.2.5 à la hauteur 3,906,833, et ce que cette version change sera documenté une fois qu'elle aura été appliquée). Le testnet **`qorechain-diana`** exécute la **v3.2.6** (v3.2.4 depuis la hauteur 8,337,253 le 19 octobre 2026, v3.2.5 à la hauteur 8,890,800 le 26 octobre, v3.2.6 à la hauteur 8,970,638 le 27 octobre) ; utilisez-y l'EVM chain ID **9800**. Lorsque cette page décrit quelque chose qui diffère entre les réseaux (les précompilés du testnet, les tokens de test Fest), elle l'indique. Les exemples de code utilisent `http://localhost:8545` pour un nœud que vous exploitez vous-même ; le point de terminaison public du mainnet est `https://evm.qore.host` et celui du testnet est `https://evm-testnet.qore.host`.
:::

:::caution Une transaction EVM exige une clé PQC enregistrée et une fenêtre d'autorisation ouverte
Depuis la mise à niveau v3.2.0 (hauteur 2,981,742 sur le mainnet, hauteur 5,920,000 sur le testnet), la voie EVM n'admet une transaction que d'un compte qui possède **(1) une clé post-quantique ML-DSA-87 enregistrée** et **(2) une fenêtre d'autorisation EVM ouverte** disposant encore de place pour elle. Vous signez avec des outils ordinaires (MetaMask, ethers.js, Hardhat, Foundry), mais sans clé enregistrée ni fenêtre ouverte, `eth_sendRawTransaction` est refusé (codespace `pqc`, codes 26, 27 ou 28). Les lectures, `eth_call` et l'estimation du gas n'ont besoin ni de l'une ni de l'autre. Voir [Fenêtre d'autorisation EVM](#evm-window) ci-dessous et le guide pas à pas dans [Votre première transaction](/getting-started/first-transaction#evm-window).

Deux autres règles s'appliquent sur le mainnet depuis la v3.2.2 : **les transactions non protégées (antérieures à EIP-155) sont refusées**, à la fois par le mempool du nœud et lors de l'exécution des blocs ; signez donc avec un chain id (tous les portefeuilles et bibliothèques actuels le font) ; et **les comptes de module ne peuvent pas être revendiqués via l'EVM**.
:::

---

## Point de terminaison JSON-RPC

| Propriété             | Valeur                                     |
| -------------------- | ------------------------------------------ |
| URL par défaut       | `http://localhost:8545`                    |
| URL WebSocket        | `ws://localhost:8546`                      |
| Espaces de noms pris en charge | `eth_`, `web3_`, `net_`, `txpool_`          |
| Chain ID (mainnet)   | `9801` (`qorechain-vladi`)                 |
| Chain ID (testnet)   | `9800` (`qorechain-diana`)                 |
| Symbole de la devise | `QOR`                                      |

Les lectures propres à QoreChain sont servies via REST (`api.qore.host`) ; l'espace de noms JSON-RPC `qor_` décrit [ci-dessous](#custom-qor_-namespace) n'est **pas activé** sur les points de terminaison publics ni dans la configuration par défaut d'un nœud. La liste `api` par défaut d'un nœud fraîchement initialisé (v3.2.3 et ultérieures) est `eth,net,web3` ; `txpool` est à activer explicitement, car il publie les transactions en attente du nœud.

À partir de la version de nœud v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026), un nœud borne son propre serveur JSON-RPC : les corps de requête de plus de 256 KiB sont refusés (HTTP 413), pas plus de 256 requêtes ne sont servies simultanément (HTTP 503 au-delà), et un filtre `eth_getLogs` ou `eth_newFilter` comportant plus de 4 positions de topics, 1000 alternatives dans une position ou 1000 adresses est refusé. Ces limites sont des réglages locaux au nœud dans la section `[json-rpc]` de `app.toml` ; voir [Exécution d'un nœud](/developer-guide/running-a-node#exposing-endpoints-for-integration).

---

## Configuration du portefeuille (MetaMask)

Ajoutez QoreChain comme réseau personnalisé dans MetaMask :

| Champ              | Valeur mainnet            | Valeur testnet          |
| ------------------ | ------------------------- | ----------------------- |
| Nom du réseau      | QoreChain (qorechain-vladi) | QoreChain Diana       |
| URL RPC            | `https://evm.qore.host`   | `https://evm-testnet.qore.host` |
| Chain ID           | `9801`                    | `9800`                  |
| Symbole de la devise | `QOR`                   | `QOR`                   |
| URL de l'explorateur de blocs | `https://explore.qore.network` | *(facultatif)* |

L'envoi depuis MetaMask exige en plus une clé PQC enregistrée et une [fenêtre d'autorisation EVM](#evm-window) ouverte sur le compte.

---

## Hardhat

Installez Hardhat et configurez votre `hardhat.config.js` :

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  networks: {
    qorechain: {
      url: "http://localhost:8545",
      accounts: ["0xYOUR_PRIVATE_KEY_HEX"],
      chainId: 9801, // mainnet qorechain-vladi (use 9800 for qorechain-diana testnet)
    },
  },
};
```

Déployez un contrat (le compte qui déploie a besoin d'une clé PQC enregistrée et d'une [fenêtre d'autorisation](#evm-window) ouverte ; un déploiement compte pour une transaction EVM dans la fenêtre) :

```bash
npx hardhat run scripts/deploy.js --network qorechain
```

Exécutez les tests sur l'EVM de QoreChain :

```bash
npx hardhat test --network qorechain
```

---

## Foundry

Créez et déployez un contrat avec Foundry :

```bash
# Create a new project
forge init my-project && cd my-project

# Build
forge build

# Deploy
forge create --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX \
  src/MyContract.sol:MyContract

# Interact
cast call <contract-address> "myFunction()" --rpc-url http://localhost:8545
cast send <contract-address> "setValue(uint256)" 42 \
  --rpc-url http://localhost:8545 \
  --private-key 0xYOUR_PRIVATE_KEY_HEX
```

---

## Ethers.js

```javascript
import { ethers } from "ethers";

// Connect to QoreChain EVM
const provider = new ethers.JsonRpcProvider("http://localhost:8545");

// Get chain info
const network = await provider.getNetwork();
console.log("Chain ID:", network.chainId); // 9801n on mainnet (9800n on testnet)

// Read balance
const balance = await provider.getBalance("0xYourAddress");
console.log("Balance:", ethers.formatEther(balance), "QOR");

// Send transaction
const wallet = new ethers.Wallet("0xYOUR_PRIVATE_KEY_HEX", provider);
const tx = await wallet.sendTransaction({
  to: "0xRecipientAddress",
  value: ethers.parseEther("1.0"),
});
await tx.wait();
```

---

## Modèle de gas

QoreChain utilise un modèle de **frais de base dynamiques EIP-1559** pour les transactions EVM :

* Le frais de base s'ajuste à chaque bloc en fonction de l'utilisation
* Les utilisateurs peuvent définir `maxFeePerGas` et `maxPriorityFeePerGas`
* Les frais de priorité reviennent au proposeur du bloc

### Pont de dénomination

Le jeton natif QOR possède **6 décimales** (`uqor`), tandis que l'EVM attend **18 décimales**. Le module `x/precisebank` gère une conversion transparente :

| Contexte     | Dénomination | Décimales | Exemple                |
| ------------ | ------------ | -------- | ---------------------- |
| Chaîne native | `uqor`       | 6        | `1000000 uqor = 1 QOR` |
| EVM          | wei          | 18       | `1e18 wei = 1 QOR`     |

Cette conversion est transparente : lorsque vous vérifiez un solde via `eth_getBalance`, la réponse est libellée en wei à 18 décimales. Lorsque le même compte est interrogé via le module bank natif, le solde apparaît en `uqor` à 6 décimales.

---

## Paires de jetons ERC-20 {#erc20-token-pairs}

Le module `x/erc20` fournit des **paires de jetons** entre les dénominations natives Cosmos SDK et les contrats ERC-20 :

* Les jetons natifs peuvent être utilisés au sein des contrats EVM en tant qu'ERC-20
* Les jetons ERC-20 déployés sur l'EVM peuvent être convertis en dénominations natives
* La conversion est bidirectionnelle et gérée au niveau du protocole

```bash
# Register a native ERC-20 contract as a token pair (permissioned: `permissionless_registration` is false)
qorechaind tx erc20 register-erc20 <contract-addr> --from mykey

# Convert native tokens to ERC-20
qorechaind tx erc20 convert-coin 1000000uqor --from mykey --gas 400000 --fees 40000uqor

# Convert ERC-20 back to native
qorechaind tx erc20 convert-erc20 <contract-addr> 1000000000000000000 --from mykey --gas 400000 --fees 40000uqor
```

Ce sont des transactions de la voie Cosmos : sur les réseaux en production, elles nécessitent aussi la cosignature post-quantique hybride (construisez avec `--generate-only`, puis `qorechaind tx pqc cosign` ; voir [Signature post-quantique](/developer-guide/post-quantum-signing)). La commande simple `convert-erc20` ci-dessus est refusée dans la version de nœud v3.2.6, car la CLI écrit un expéditeur `0x` ; voir [Convertir entre les deux formes](#fest-convert) pour la forme qui fonctionne. Les paires de jetons sont enregistrées selon une politique avec permissions (c'est la gouvernance qui les enregistre). Aucune n'existe sur le mainnet au moment de la rédaction ; le testnet dispose des tokens de test Fest dans [la section suivante](#fest-tokens).

## Tokens de test Fest et conversion ERC20 {#fest-tokens}

:::note Testnet uniquement, sans valeur
Les tokens de cette section n'existent que sur le testnet `qorechain-diana` (EVM chain ID 9800). Ce sont des tokens de test pour les builders et ils n'ont aucune valeur. Le mainnet n'a aucune paire de tokens ERC-20 (vérifié le 27 octobre 2026) ; aucune des dénominations ci-dessous n'y existe donc.
:::

Le 27 octobre 2026, la gouvernance du testnet (proposition 26) a enregistré trois contrats ERC-20 comme paires de tokens. Ils donnent aux builders un second token à associer au QOR dans un [pool AMM](/api-reference/rest-grpc-endpoints#amm-module) :

| Token | Contrat ERC-20 (EIP-55) | Décimales | Dénomination bancaire |
| ----- | ------------------------ | -------- | ---------- |
| fUSD (FestUSD) | `0x97143B771D34ddb9130b807b135Ae675A5a963CA` | 6  | `erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA` |
| fETH (FestETH) | `0x02292293c13880a26242690eb70a0e42B8E91c28` | 18 | `erc20:0x02292293c13880a26242690eb70a0e42B8E91c28` |
| fBTC (FestBTC) | `0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` | 8  | `erc20:0x4604e7E45b2ecdbfbDc157103f5B2b62cb16451A` |

* **La dénomination bancaire est `erc20:<address>` avec deux-points, et l'adresse doit être exactement en casse mixte EIP-55 comme indiqué.** Les dénominations sont sensibles à la casse : `erc20:0x97143b771d34...` (en minuscules) est une chaîne différente, et une requête pour elle répond `404`. Copiez la dénomination depuis `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata`, qui liste les trois tokens avec leur `symbol` (`fUSD`, `fETH`, `fBTC`), leur nom d'affichage `display` (`FestUSD`, `FestETH`, `FestBTC`) et leurs décimales.
* **Le faucet verse des coins bancaires.** Pour utiliser un token Fest depuis l'EVM (MetaMask, Solidity), convertissez d'abord le coin bancaire en sa forme ERC-20 avec `MsgConvertCoin` ; pour remettre un solde ERC-20 sous forme bancaire (par exemple pour l'associer dans l'AMM), utilisez `MsgConvertERC20`. Les deux sont décrits ci-dessous.
* **Les tokens existent sous deux formes.** Un solde ERC-20 se lit avec le `balanceOf` du contrat via le JSON-RPC EVM ; le solde converti est un coin bancaire, lu avec `GET /cosmos/bank/v1beta1/balances/{address}`. Seule la forme coin bancaire peut être associée dans l'AMM. La conversion déplace de la valeur entre les deux formes ; elle n'en crée pas.
* **Les montants utilisent les décimales propres au token** (6, 18 et 8 pour fUSD, fETH et fBTC), et non les 6 décimales de `uqor`.

```bash
curl -s https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs
curl -s "https://api-testnet.qore.host/cosmos/evm/erc20/v1/token_pairs/0x97143B771D34ddb9130b807b135Ae675A5a963CA"
```

### Convertir entre les deux formes {#fest-convert}

Les deux messages de conversion sont des transactions de la voie Cosmos : ils nécessitent votre clé post-quantique enregistrée et la cosignature hybride, comme toute autre transaction native (construction, puis `qorechaind tx pqc cosign` ; voir [Signature post-quantique](/developer-guide/post-quantum-signing)). Les frais doivent être d'au moins gas × 0.1 uqor.

:::note Ce qui a été exécuté
Les lectures REST de cette page (`token_pairs`, `denoms_metadata`) ont été exécutées sur le testnet le 27 octobre 2026. Les deux commandes de conversion ci-dessous n'ont **pas** été exécutées de bout en bout pour cette page : la forme de leurs messages et la règle de l'expéditeur proviennent du code source du nœud v3.2.6 et de la référence de l'équipe de la chaîne. Considérez-les comme la forme documentée et confirmez d'abord avec un petit montant.
:::

**Coin bancaire vers ERC-20 : `MsgConvertCoin`.** Le `coin` est la dénomination bancaire exacte, sensible à la casse (`erc20:<adresse EIP-55>`), le `sender` est votre adresse `qor1...` (le signataire), et le `receiver` est une adresse `0x...` qui détiendra l'ERC-20. Il consomme environ 432,000 gas ; fixez une limite de gas de 600,000.

```bash
# Write the message by hand (not run for this page)
cat > convert-coin.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertCoin",
      "coin": { "denom": "erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA", "amount": "1000000" },
      "receiver": "0xYOUR_EVM_ADDRESS",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-coin.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

**ERC-20 vers coin bancaire : `MsgConvertERC20`.** Son champ `sender` doit aussi être l'adresse bech32 `qor1...` du compte. Un expéditeur `0x` est refusé avec `decoding bech32 failed`. Dans la version de nœud v3.2.6, la commande CLI `qorechaind tx erc20 convert-erc20` (l'exemple simple de [Paires de jetons ERC-20](#erc20-token-pairs)) écrit l'expéditeur sous la forme `0x` et est donc refusée pour cette raison : ne l'utilisez pas. Construisez vous-même le message avec l'adresse `qor1` comme expéditeur, de la même manière que ci-dessus :

```bash
# Workaround: write the message with a qor1 sender (not run for this page)
cat > convert-erc20.json <<'JSON'
{
  "body": {
    "messages": [{
      "@type": "/cosmos.evm.erc20.v1.MsgConvertERC20",
      "contract_address": "0x97143B771D34ddb9130b807b135Ae675A5a963CA",
      "amount": "1000000",
      "receiver": "qor1youraddr...",
      "sender": "qor1youraddr..."
    }],
    "memo": ""
  },
  "auth_info": { "signer_infos": [], "fee": { "amount": [{ "denom": "uqor", "amount": "60000" }], "gas_limit": "600000" } },
  "signatures": []
}
JSON
qorechaind tx pqc cosign convert-erc20.json --from mykey --pqc-key mypqc --chain-id qorechain-diana
```

Ici, `receiver` est le compte `qor1...` qui reçoit le coin bancaire (le module accepte la forme bech32 pour le destinataire d'une conversion vers un coin bancaire). Le montant est exprimé dans les unités de base propres au token (6, 18 ou 8 décimales). Copiez la dénomination pour `MsgConvertCoin` uniquement depuis `denoms_metadata` ; la forme en minuscules est refusée avec `token pair not found`.

---

## PQC et compatibilité EVM

Les transactions EVM sont signées avec **ECDSA classique (secp256k1)** ; MetaMask, Hardhat, Foundry, ethers.js et les autres outils standard les construisent et les signent donc sans modification. Ce qui a changé avec la **v3.2.0**, c'est l'*admission* : une transaction n'est acceptée que si son expéditeur possède une clé post-quantique enregistrée et une fenêtre d'autorisation active (section suivante). L'enregistrement d'une clé et l'ouverture d'une fenêtre sont des transactions de la voie Cosmos et exigent la signature hybride (ML-DSA-87 + secp256k1).

Pour la sécurité post-quantique au sein des contrats :

* Le **précompilé PQC Verify** (`0x0000...0A01`) vérifie les signatures ML-DSA-87 on-chain depuis Solidity. Il est **actif sur le testnet** (activé par la proposition de gouvernance 21, adoptée le 27 octobre 2026) et **non actif sur le mainnet** au moment de la rédaction. Voir [Précompilés EVM : état du réseau](/developer-guide/evm-precompiles#network-status).
* Les **messages cross-VM** de l'EVM vers QoreChain Native ou la SVM sont des transactions de la voie Cosmos et portent la signature hybride comme toutes les autres ; voir [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) pour leur disponibilité actuelle.

---

## Fenêtre d'autorisation EVM {#evm-window}

Une signature post-quantique ne peut pas voyager *avec* une transaction Ethereum (des portefeuilles comme MetaMask ne peuvent pas joindre une seconde signature) ; elle voyage donc *en amont*. Le compte ouvre une fenêtre bornée avec le message de la voie Cosmos `MsgOpenEVMWindow` ; la voie EVM n'admet ensuite que les transactions couvertes par une fenêtre active. Une clé classique volée ne peut pas, à elle seule, ouvrir une fenêtre : elle ne peut donc déplacer que ce qu'une fenêtre déjà ouverte autorise.

| Borne       | Plage              | Signification |
| ----------- | ------------------ | ------- |
| `blocks`    | 1 – 17,280         | Durée pendant laquelle la fenêtre reste ouverte, comptée en blocs à partir du bloc qui l'ouvre |
| `max-txs`   | 1 – 1,000          | Nombre de transactions EVM qu'elle admet |
| `max-value` | supérieur à 0, en `uqor` | Sortie totale qu'elle admet : valeur transférée **plus** les frais maximaux que chaque transaction pourrait payer (limite de gas × frais max par gas), convertis en `uqor` et arrondis à l'unité supérieure |

La première borne atteinte ferme la fenêtre. Les trois bornes sont obligatoires ; ouvrir une fenêtre remplace celle qui existe ; une transaction admise puis en échec consomme tout de même son emplacement et son budget de valeur ; les déploiements de contrat comptent comme n'importe quelle autre transaction. `blocks` est un nombre de blocs, pas une durée : 17,280 blocs représentent environ 15 heures sur le mainnet (environ 3,1 s par bloc) et environ 6 heures sur le testnet (environ 1,3 s par bloc le 27 octobre 2026 ; le temps de bloc du testnet varie).

**La borne de valeur ne compte que le QOR natif.** Un transfert de jeton, une approbation ou tout autre appel de contrat porte une valeur nulle ; il n'est donc pas décompté de `max-value` (seuls ses frais maximaux le sont). Pour borner aussi ces opérations, restreignez la **portée** de la fenêtre (mainnet v3.2.3 et ultérieures) :

| Option de portée (drapeau CLI) | Champ du message | Ce que la fenêtre admet |
| ----------------------- | ------------- | ---------------------- |
| `--native-only`         | `native_only` | Uniquement les transferts simples de QOR natif : pas de calldata, pas de création de contrat, pas de destinataire qui porte du code, pas d'autorisation EIP-7702 |
| `--allowed-targets 0xA,0xB` | `allowed_targets` | Uniquement les transactions dont le destinataire figure parmi les adresses de 20 octets listées ; la création de contrat est refusée |

Une fenêtre ouverte sans portée se comporte exactement comme auparavant. Une transaction hors de la portée est refusée avec le code 27 (le message indique que la fenêtre « n'admet pas cette transaction »). `GET /qorechain/pqc/v1/evm_window/{address}` et `qorechaind query pqc evm-window` renvoient `native_only` et `allowed_targets`, et l'événement `pqc_evm_window_opened` les porte lorsqu'ils sont définis.

**Étapes** (le pas-à-pas complet se trouve dans [Votre première transaction](/getting-started/first-transaction#evm-window)) :

1. Enregistrez une fois votre clé ML-DSA-87 (`tx pqc register-key-v2` ou `register-key`, avec `--gas 600000 --fees 60000uqor` ; cette transaction est exemptée de l'exigence hybride, de sorte qu'un nouveau compte puisse démarrer). Voir [Signature post-quantique](/developer-guide/post-quantum-signing#pqc-key-registration).
2. Ouvrez une fenêtre. C'est une transaction de la voie Cosmos : produisez-la non signée et cosignez-la avec votre clé ML-DSA (`max-value` accepte `uqor` ou `qor` ; `1000qor` correspond à 1 000 QOR) :

   ```bash
   qorechaind tx pqc open-evm-window 7200 20 1000qor --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi

   # the same window narrowed to plain QOR transfers (mainnet v3.2.3 and later):
   qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
     --chain-id qorechain-vladi --gas 400000 --fees 40000uqor --generate-only > w.json
   ```

3. Vérifiez ce qu'il reste : `qorechaind query pqc evm-window <address>` ou `GET /qorechain/pqc/v1/evm_window/{address}` (répond `found: false` lorsqu'il n'y en a pas).
4. Envoyez vos transactions EVM normalement. L'ouverture d'une fenêtre est une transaction de la voie Cosmos et fait avancer la séquence du compte, qui est aussi son nonce EVM ; lisez donc le nonce **après** l'ouverture de la fenêtre et signez à ce moment-là.

Fermez une fenêtre de façon anticipée avec `qorechaind tx pqc close-evm-window` (même schéma `--generate-only` et `cosign`), par exemple si vous soupçonnez que la clé classique est exposée : tout ce que la fenêtre admettait encore est refusé à partir du bloc suivant.

### Délégations EIP-7702 {#eip-7702}

Depuis la v3.2.2, une délégation EIP-7702 de votre compte (une transaction de type 4) ne prend effet qu'avec le consentement post-quantique de votre propre compte. Enregistrez d'abord le consentement avec le message de la voie Cosmos signé en hybride `MsgAuthorizeEVMDelegation` (`qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>`) ; il est à usage unique, expire après le nombre de blocs indiqué et est révoqué par `close-evm-window`. La valeur qui quitte un compte délégué est imputée à la fenêtre de **ce** compte, une transaction de type 4 en échec conserve les autorisations qu'elle a appliquées, et `qorechaind tx pqc clear-evm-delegation` supprime une délégation. Une délégation refusée répond avec les codes 60 à 63. Lisez le consentement avec `GET /qorechain/pqc/v1/evm_delegation_consent/{address}`.

| Refus (codespace `pqc`) | Signification |
| ------------------------- | ------- |
| code 26 | Aucune fenêtre ouverte pour l'expéditeur, ou l'expéditeur n'a pas de clé PQC enregistrée |
| code 27 | La fenêtre est expirée ou épuisée (le message indique quelle borne), ou la transaction est hors de la portée de la fenêtre |
| code 28 | Bornes de fenêtre invalides à l'ouverture, ou aucune clé enregistrée à ce moment |

Avec le SDK TypeScript (0.8.2 et versions ultérieures) : `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow({ rest, address })` et `classifyEvmWindowRejection(err)` (`"no-pqc-key" | "no-window" | "exhausted" | "invalid"`). Le SDK 0.9.0 ajoute à `openEvmWindowMsg` les options de portée (`nativeOnly`, `allowedTargets`) ainsi que les constructeurs de consentement EIP-7702 (`authorizeEvmDelegationMsg`, `clearEvmDelegationMsg`, `fetchEvmDelegationConsent`) ; les versions antérieures à la 0.9.0 ne construisent que la fenêtre sans portée, utilisez donc `qorechaind` pour le reste (voir le [guide EVM du SDK](/sdk/guides/evm#evm-window-scope)).

---

## Espace de noms personnalisé `qor_` {#custom-qor_-namespace}

QoreChain étend le JSON-RPC avec un espace de noms `qor_` pour les requêtes spécifiques à la chaîne :

:::warning Pas encore servi
Aucune version publiée du nœud ne sert encore l'espace de noms `qor_` : `rpc_modules` sur les points de terminaison publics ne liste que `eth`, `net`, `rpc`, `txpool` et `web3`, et chaque méthode ci-dessous renvoie `-32601` (méthode introuvable) sur le mainnet, le testnet et les nœuds auto-hébergés avec la configuration par défaut (`eth`, `net`, `web3`). Voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace) pour l'état d'avancement et les alternatives REST (par exemple `GET /qorechain/pqc/v1/account/{address}` pour l'état de la clé PQC).
:::

| Méthode                     | Description                                                       |
| --------------------------- | ------------------------------------------------------------------- |
| `qor_getPQCKeyStatus`       | Vérifie si un compte possède une clé publique PQC enregistrée     |
| `qor_getAIStats`            | Récupère les statistiques du moteur d'IA (nombre d'anomalies, distribution des risques) |
| `qor_getCrossVMMessage`     | Interroge le statut d'un message cross-VM par ID                  |
| `qor_getPoolClassification` | Obtient la classification du pool de validateurs (RPoS/DPoS/PoS)  |
| `qor_getReputationScore`    | Interroge le score de réputation d'un validateur                  |
| `qor_getAbstractAccount`    | Récupère la configuration d'un compte abstrait                    |

Exemple avec `curl` :

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPQCKeyStatus",
    "params": ["0xYourAddress"],
    "id": 1
  }'
```

---

## Étapes suivantes

* [Précompilés EVM](/developer-guide/evm-precompiles) — Référence des interfaces de précompilés QoreChain (trois actifs sur le testnet, aucun sur le mainnet)
* [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) — Appels cross-VM et leur disponibilité actuelle
* [Abstraction de compte](/developer-guide/account-abstraction) — Authentificateurs de portefeuilles liés et règles de dépense (activé sur le testnet, désactivé sur le mainnet)
