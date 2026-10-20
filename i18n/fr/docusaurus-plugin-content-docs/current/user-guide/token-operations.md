---
slug: /user-guide/token-operations
title: Opérations sur les jetons
sidebar_label: Opérations sur les jetons
sidebar_position: 1
---

# Opérations sur les jetons

Ce guide couvre le jeton QOR, l'envoi et la réception de jetons, la consultation des soldes, ainsi que le modèle de répartition des frais sur QoreChain.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et exécute la version **v3.2.3** ; le testnet exécute **v3.2.4** — remplacez le chain ID et les points de terminaison du mainnet indiqués sur la page **Connecting to Mainnet** lors de transactions sur le mainnet.
:::

:::caution Signer avec `tx pqc cosign`
Le mainnet et le testnet exigent une signature post-quantique hybride sur chaque transaction de la voie Cosmos ; les commandes de cette page ne sont donc pas diffusées telles quelles. Ajoutez `--generate-only > tx.json` à une commande, puis exécutez `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Voir [Signature hybride](/cli-reference/transaction-commands#hybrid-signing). [QoreX](/qorex/overview) et le [Tableau de bord](/dashboard/overview) effectuent cette signature à votre place.
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
  --gas 400000 --fees 40000uqor
```

**Exemple :** envoyer 5 QOR (5 000 000 uqor) à une autre adresse :

```bash
qorechaind tx bank send qor1sender... qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

Vous pouvez également utiliser un nom de clé au lieu d'une adresse brute pour l'expéditeur :

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
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
| **Brûlés**      | 30%   | Retirés définitivement de la masse monétaire                                 |
| **Trésorerie**    | 20%   | Finance le développement du protocole et les subventions à l'écosystème                 |
| **Stakers**     | 10%   | Distribués proportionnellement à tous les délégants                    |
| **Nœuds légers** | 3%    | Réservés aux récompenses des nœuds légers (voir la note ci-dessous)            |

La répartition s'applique à tout ce qui entre dans le collecteur de frais, qui contient les frais de transaction et l'émission de staking frappée à chaque époque. La part des nœuds légers alimente le pool de récompenses des nœuds légers ; l'enregistrement est ouvert et soumis à licence, mais aucun nœud léger ne s'est encore enregistré, donc aucun nœud n'est payé sur ce pool aujourd'hui (voir [Nœud léger](/light-node/overview#reward-program-status)). Depuis la mise à niveau v3.2.0, la part des stakers est versée comme une récompense de staking normale (voir [Tokenomics](/architecture/tokenomics#stranded-and-reserve)).

## Canaux de destruction

Le module de destruction de QoreChain définit 12 sources de destruction. Les QOR détruits via l'une d'elles sont retirés définitivement de la circulation. Sur le mainnet, seuls les canaux des frais de gas et des transactions échouées ont enregistré des destructions jusqu'à présent ; les autres sont définis mais n'ont rien enregistré. Le testnet enregistre une treizième source, `staking_tier_penalty`, pour son module facultatif de staking à verrouillage temporel.

| Canal              | Description                                                                      |
| ------------------ | -------------------------------------------------------------------------------- |
| `gas_fee`          | 30% de tous les frais de gas sont détruits                                                   |
| `contract_create`  | Frais fixes de 100 QOR détruits à chaque création de contrat (inactif : le téléversement CosmWasm est fermé) |
| `ai_service`       | 50% des frais de service d'IA détruits (inactif : les frais de service d'IA ne sont pas en service)           |
| `bridge_fee`       | 100% des frais de pont détruits (inactif : le pont n'est pas en service)                    |
| `treasury_buyback` | Rachat et destruction périodiques depuis la trésorerie                                      |
| `failed_tx`        | 10 % du gas des transactions échouées ; appliqué par la chaîne depuis v3.2.2   |
| `xqore_penalty`    | Pénalités de sortie anticipée xQORE acheminées vers la destruction (xQORE n'est pas en service)               |
| `auto_buyback`     | Destructions automatisées au niveau du protocole (inactif)                                        |
| `tge`              | Réservé ; la destruction du TGE a eu lieu avant la genèse et ce canal n'enregistre rien  |
| `rollup_create`    | 1% du stake de création de rollup est détruit                                        |
| `milestone`        | Destructions programmées à des nombres cumulés de transactions fixes (aucune déclenchée pour l'instant)      |
| `amm`              | Réservé aux frais de protocole de l'AMM (aucun enregistré)                                   |

Le module de destruction n'a pas de requête CLI ; lisez la destruction cumulée par source via REST :

```bash
curl -s https://api.qore.host/qorechain/burn/v1/stats
```

La réponse liste `total_burned` et `burns_by_source` (en uqor). L'offre totale actuelle s'obtient avec `qorechaind query bank total-supply-of uqor`.

## Conseils

:::caution
Vérifiez toujours attentivement les adresses des destinataires avant d'envoyer des jetons. Les transactions sur QoreChain sont irréversibles.
:::

:::tip

* Utilisez l'option `--dry-run` pour simuler une transaction sans la diffuser.
* Définissez `--gas` explicitement (400 000 suffisent pour un transfert signé en mode hybride).
* Le plancher de frais est de **0,1 uqor par unité de gas**, donc une limite de gas de 400 000 exige au moins **40 000 uqor**.

:::
