---
slug: /user-guide/bridging-assets
title: Transfert d'actifs par pont
sidebar_label: Transfert d'actifs par pont
sidebar_position: 5
---

# Transfert d'actifs par pont

Ce guide explique comment déplacer des actifs entre QoreChain et d'autres réseaux blockchain. La couche d'interopérabilité de QoreChain comprend **37 configurations QCB (QoreChain Bridge)** (y compris un bouclage QoreChain) pour les réseaux hétérogènes, plus **8 canaux IBC** pour les chaînes de l'écosystème Cosmos.

:::caution
Le pont cross-chain est actuellement en phase de **testnet / pré-production**. La disponibilité des connexions, les actifs pris en charge et les paramètres de finalité sont susceptibles de changer et ne doivent pas être considérés comme prêts pour la production. Validez tous les transferts sur **`qorechain-diana`** avant de vous y fier.
:::

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.80** — substituez le chain ID et les points de terminaison du mainnet depuis la page **Connexion au Mainnet** là où la prise en charge du pont a été activée.
:::

---

## Aperçu des connexions

QoreChain fournit deux protocoles de pont :

| Protocole                                | Connexions         | Cas d'usage                                                              |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | 8 canaux           | Interopérabilité native avec les chaînes compatibles IBC                 |
| **QCB** (QoreChain Bridge)               | 37 configurations  | Transferts cross-chain avec des réseaux non-IBC via des attestations sécurisées par PQC |

Une énumération complète de chaque configuration QCB et canal IBC se trouve sur la page **Architecture du Pont**. Ce guide se concentre sur l'utilisation quotidienne du pont.

---

## Canaux IBC

Les chaînes compatibles IBC suivantes ont établi des canaux avec QoreChain :

| Chaîne               | Canal       | Statut |
| -------------------- | ----------- | ------ |
| Cosmos Hub           | `channel-0` | Actif  |
| Osmosis              | `channel-1` | Actif  |
| Noble                | `channel-2` | Actif  |
| Celestia             | `channel-3` | Actif  |
| Stride               | `channel-4` | Actif  |
| Akash                | `channel-5` | Actif  |
| Babylon              | `channel-6` | Actif  |
| QoreChain (bouclage) | `channel-7` | Actif  |

Les transferts IBC utilisent le module standard `ibc-transfer` :

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <recipient> <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Points de terminaison du pont QCB

Le QoreChain Bridge se connecte à des chaînes externes couvrant plusieurs types d'écosystèmes. Une sélection représentative des réseaux pris en charge :

| Chaîne    | Type de chaîne | Actifs pris en charge |
| --------- | -------------- | --------------------- |
| Ethereum  | EVM            | ETH, USDC, WBTC       |
| BSC       | EVM            | BNB, USDC             |
| Solana    | Solana         | SOL, USDC             |
| Avalanche | EVM            | AVAX, USDC            |
| Polygon   | EVM            | MATIC, USDC           |
| Arbitrum  | EVM            | ETH, ARB, USDC        |
| TON       | TON            | TON                   |
| Sui       | Sui Move       | SUI                   |
| Optimism  | EVM            | ETH, USDC, OP         |
| Base      | EVM            | ETH, USDC             |
| Aptos     | Aptos          | APT, USDC             |
| Bitcoin   | Bitcoin        | BTC                   |
| NEAR      | NEAR           | NEAR, USDC            |
| Cardano   | Cardano        | ADA                   |
| Polkadot  | Polkadot       | DOT                   |
| Tezos     | Tezos          | XTZ                   |
| Tron      | Tron           | TRX, USDT             |

Consultez la page **Architecture du Pont** pour la liste complète des configurations QCB et leur statut de déploiement actuel.

---

## Flux de dépôt (chaîne externe vers QoreChain)

Le dépôt d'actifs depuis une chaîne externe vers QoreChain suit cette séquence :

1. **Verrouillage** — Verrouillez les jetons sur la chaîne externe en les envoyant au contrat ou à l'adresse du pont QCB.
2. **Attestation** — Les validateurs du pont observent la transaction de verrouillage et produisent des attestations signées par PQC.
3. **Seuil** — Une fois **7 sur 10** attestations de validateurs collectées, le pont finalise le dépôt.
4. **Émission** — Les jetons wrappés équivalents sont émis sur QoreChain et crédités sur votre adresse `qor1...`.

**Commande CLI :**

```bash
qorechaind tx bridge deposit \
  --chain ethereum \
  --amount 1000000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Flux de retrait (QoreChain vers chaîne externe)

Le retrait d'actifs depuis QoreChain vers une chaîne externe :

1. **Brûlage** — Brûlez les jetons wrappés sur QoreChain.
2. **Attestation** — Les validateurs du pont observent le brûlage et produisent des attestations signées par PQC.
3. **Seuil** — Une fois **7 sur 10** attestations collectées, le retrait est finalisé.
4. **Déverrouillage** — Les jetons d'origine sont libérés sur la chaîne externe vers l'adresse de destination spécifiée.

**Commande CLI :**

```bash
qorechaind tx bridge withdraw \
  --chain ethereum \
  --amount 1000000 \
  --to 0xYourEthereumAddress \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Modèle de sécurité

Le QoreChain Bridge est sécurisé par plusieurs couches de défense :

| Mécanisme                       | Description                                                                                                                                           |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multisig PQC 7-sur-10**       | Chaque opération de pont nécessite des attestations d'au moins 7 des 10 validateurs du pont, chacun utilisant des signatures cryptographiques post-quantiques. |
| **Période de contestation de 24 heures** | Les retraits dépassant un seuil configurable entrent dans une fenêtre de contestation de 24 heures pendant laquelle les validateurs ou les observateurs peuvent signaler des transactions frauduleuses. |
| **Disjoncteurs**                | Des limiteurs de débit automatisés interrompent les opérations du pont si un volume anormal ou des schémas suspects sont détectés. Les opérations du pont reprennent après une revue manuelle. |

---

## Interrogation du statut du pont

Vérifiez le statut d'une opération de pont en attente :

```bash
qorechaind query bridge pending-deposits --address <your_qor_address>
```

```bash
qorechaind query bridge pending-withdrawals --address <your_qor_address>
```

Listez toutes les connexions de pont actives :

```bash
qorechaind query bridge connections
```

---

## Conseils

* Les dépôts par pont se finalisent généralement en quelques minutes une fois les 7-sur-10 attestations requises rassemblées.
* Les retraits importants déclenchent automatiquement la période de contestation de 24 heures. Anticipez pour les transferts urgents.
* Vérifiez toujours que le format de l'adresse de destination correspond à la chaîne cible (par ex. `0x...` pour les chaînes EVM, base58 pour Solana).
* Les transferts IBC sont généralement plus rapides que les transferts QCB car ils utilisent une communication native au niveau du protocole.
* Les frais de pont sont brûlés via le canal de brûlage `bridge_fee` (voir [Opérations sur les jetons](/user-guide/token-operations)).
