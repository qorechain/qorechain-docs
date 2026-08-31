---
slug: /user-guide/token-operations
title: Opérations sur les jetons
sidebar_label: Opérations sur les jetons
sidebar_position: 1
---

# Opérations sur les jetons

Ce guide couvre le jeton QOR, l'envoi et la réception de jetons, la consultation des soldes, ainsi que le modèle de répartition des frais sur QoreChain.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.95** — remplacez le chain ID et les points de terminaison du mainnet indiqués sur la page **Connecting to Mainnet** lors de transactions sur le mainnet.
:::

## Informations sur le jeton

| Propriété                 | Valeur                         |
| ------------------------ | ----------------------------- |
| **Dénomination d'affichage** | QOR                           |
| **Dénomination de base**    | uqor                          |
| **Conversion**           | 1 QOR = 1 000 000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Préfixe Bech32**        | `qor` (ex. : `qor1abc...xyz`) |

Tous les montants on-chain sont exprimés en **uqor**. Lors de la soumission de transactions, indiquez toujours les montants en uqor.

## Envoyer des jetons

Pour transférer des jetons QOR d'un compte à un autre :

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :** envoyer 5 QOR (5 000 000 uqor) à une autre adresse :

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Vous pouvez également utiliser un nom de clé au lieu d'une adresse brute pour l'expéditeur :

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

## Consulter les soldes

Vérifiez le solde de n'importe quel compte :

```bash
qorechaind query bank balances <address>
```

**Exemple :**

```bash
qorechaind query bank balances qor1abc...xyz
```

**Exemple de sortie :**

```yaml
balances:
- amount: "15000000"
  denom: uqor
pagination:
  next_key: null
  total: "0"
```

Cela indique que le compte détient 15 QOR (15 000 000 uqor).

## Structure des frais

Les frais de transaction sur QoreChain sont répartis entre cinq destinations afin d'aligner les incitations du réseau :

| Destination     | Part | Objectif                                                         |
| --------------- | ----- | --------------------------------------------------------------- |
| **Validateurs**  | 37%   | Récompense les producteurs de blocs et sécurise le réseau                 |
| **Brûlés**      | 30%   | Retirés définitivement de la masse monétaire, créant une pression déflationniste |
| **Trésorerie**    | 20%   | Finance le développement du protocole et les subventions à l'écosystème                 |
| **Stakers**     | 10%   | Distribués proportionnellement à tous les délégants                    |
| **Nœuds légers** | 3%    | Récompense les opérateurs de nœuds légers qui servent les données du réseau            |

## Canaux de destruction

QoreChain met en œuvre un mécanisme de destruction multi-canal. Les jetons QOR sont retirés définitivement de la circulation via 10 canaux distincts :

| Canal              | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `tx_fee`             | La portion de 30% brûlée sur chaque frais de transaction                       |
| `governance_penalty` | Brûlé lorsque les propositions de gouvernance n'atteignent pas le quorum ou sont rejetées |
| `slashing_burn`      | Portion brûlée des stakes de validateurs sanctionnés                          |
| `bridge_fee`         | Frais brûlés sur les transferts via le pont inter-chaînes                |
| `spam_deterrent`     | Destruction supplémentaire appliquée aux transactions signalées comme spam                |
| `epoch_excess`       | Émissions excédentaires au-delà de la cible, brûlées aux limites d'époque           |
| `manual_burn`        | Destructions de jetons initiées par la communauté via proposition de gouvernance             |
| `contract_callback`  | Frais brûlés sur les exécutions de rappel (callback) de contrats intelligents                   |
| `cross_vm_fee`       | Brûlé lors de l'exécution d'appels inter-VM (ex. : EVM vers CosmWasm)        |
| `rollup_create`      | 1% du stake minimum brûlé lors du déploiement d'un nouveau rollup          |

Vous pouvez consulter le montant total brûlé sur l'ensemble des canaux :

```bash
qorechaind query bank total --denom uqor
```

## Conseils

:::caution
Vérifiez toujours attentivement les adresses des destinataires avant d'envoyer des jetons. Les transactions sur QoreChain sont irréversibles.
:::

:::tip

* Utilisez l'option `--dry-run` pour simuler une transaction sans la diffuser.
* Utilisez `--gas auto` pour laisser le nœud estimer le gas requis pour votre transaction.
* Les frais minimums pour un transfert standard sont de **500 uqor**.

:::
