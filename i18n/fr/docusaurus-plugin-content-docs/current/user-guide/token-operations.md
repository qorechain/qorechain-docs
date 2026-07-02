---
slug: /user-guide/token-operations
title: Opérations sur les jetons
sidebar_label: Opérations sur les jetons
sidebar_position: 1
---

# Opérations sur les jetons

Ce guide couvre le jeton QOR, la manière d'envoyer et de recevoir des jetons, d'interroger les soldes et de comprendre le modèle de distribution des frais sur QoreChain.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.82** — remplacez le chain ID et les endpoints du mainnet indiqués sur la page **Connecting to Mainnet** lorsque vous effectuez des transactions sur le mainnet.
:::

## Informations sur le jeton

| Propriété                 | Valeur                         |
| ------------------------ | ----------------------------- |
| **Dénomination d'affichage** | QOR                           |
| **Dénomination de base**    | uqor                          |
| **Conversion**           | 1 QOR = 1 000 000 uqor (10^6) |
| **Chain ID**             | `qorechain-vladi` (mainnet) / `qorechain-diana` (testnet) |
| **Préfixe Bech32**        | `qor` (par ex., `qor1abc...xyz`) |

Tous les montants on-chain sont libellés en **uqor**. Lors de la soumission de transactions, spécifiez toujours les montants en uqor.

## Envoi de jetons

Pour transférer des jetons QOR d'un compte à un autre :

```bash
qorechaind tx bank send <from_address> <to_address> <amount>uqor \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :** Envoyer 5 QOR (5 000 000 uqor) à une autre adresse :

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

## Consultation des soldes

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
| **Validateurs**  | 37 %   | Récompense les producteurs de blocs et sécurise le réseau                 |
| **Brûlés**      | 30 %   | Retirés définitivement de l'offre, créant une pression déflationniste |
| **Trésorerie**    | 20 %   | Finance le développement du protocole et les subventions à l'écosystème                |
| **Stakers**     | 10 %   | Distribués proportionnellement à tous les délégateurs                    |
| **Light Nodes** | 3 %    | Récompense les opérateurs de light-nodes qui servent les données du réseau            |

## Canaux de burn

QoreChain met en œuvre un mécanisme de burn multi-canal. Les jetons QOR sont définitivement retirés de la circulation via 10 canaux distincts :

| Canal              | Description                                                         |
| -------------------- | ------------------------------------------------------------------- |
| `tx_fee`             | La part de burn de 30 % de chaque frais de transaction                       |
| `governance_penalty` | Brûlés lorsque les propositions de gouvernance n'atteignent pas le quorum ou sont opposées par un veto |
| `slashing_burn`      | Part brûlée des stakes de validateurs slashés                         |
| `bridge_fee`         | Frais brûlés sur les transferts par bridge cross-chain                          |
| `spam_deterrent`     | Burn supplémentaire appliqué aux transactions signalées comme spam                |
| `epoch_excess`       | Émissions excédentaires au-delà de la cible, brûlées aux limites d'epoch           |
| `manual_burn`        | Burns de jetons initiés par la communauté via une proposition de gouvernance               |
| `contract_callback`  | Frais brûlés sur les exécutions de callback de smart contracts                   |
| `cross_vm_fee`       | Brûlés lors de l'exécution d'appels cross-VM (par ex., EVM vers CosmWasm)        |
| `rollup_create`      | 1 % du stake minimum brûlé lors du déploiement d'un nouveau rollup          |

Vous pouvez interroger le montant total brûlé sur l'ensemble des canaux :

```bash
qorechaind query bank total --denom uqor
```

## Astuces

:::caution
Vérifiez toujours soigneusement les adresses des destinataires avant d'envoyer des jetons. Les transactions sur QoreChain sont irréversibles.
:::

:::tip

* Utilisez le drapeau `--dry-run` pour simuler une transaction sans la diffuser.
* Utilisez `--gas auto` pour laisser le nœud estimer le gas requis pour votre transaction.
* Les frais minimums pour un transfert standard sont de **500 uqor**.

:::
