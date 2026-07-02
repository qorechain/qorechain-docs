---
slug: /developer-guide/running-a-validator
title: Exécuter un validateur
sidebar_label: Exécuter un validateur
sidebar_position: 9
---

# Exécuter un validateur

Ce guide explique comment créer un validateur sur le réseau QoreChain, comprendre le système de classification en pools, enregistrer une clé PQC pour une sécurité résistante au quantique et superviser votre nœud.

:::note
Ce guide cible le mainnet **`qorechain-vladi`** (chain ID EVM **9801**), en production depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.82**. Le testnet **`qorechain-diana`** (chain ID EVM **9800**) est recommandé pour répéter votre installation avant le passage en production. Remplacez le `--chain-id` par celui du réseau ciblé.
:::

---

## Prérequis

* Un nœud `qorechaind` entièrement synchronisé (voir [Connexion au testnet](/getting-started/connecting-to-testnet))
* Un compte approvisionné avec au moins **1 000 QOR** (1,000,000,000 uqor) pour l'auto-délégation initiale
* Une bonne connaissance du modèle de [Staking et délégation](/user-guide/staking-and-delegation)

---

## Créer un validateur

```bash
qorechaind tx staking create-validator \
  --amount 1000000000uqor \
  --pubkey $(qorechaind comet show-validator) \
  --moniker "my-validator" \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from mykey \
  --gas auto \
  --gas-adjustment 1.3 \
  -y
```

| Paramètre                      | Description                                                  |
| ------------------------------ | ------------------------------------------------------------ |
| `--amount`                     | Montant de l'auto-délégation (mise minimale)                 |
| `--pubkey`                     | Clé publique de consensus du validateur (ed25519)            |
| `--moniker`                    | Nom lisible de votre validateur                              |
| `--commission-rate`            | Taux de commission initial (p. ex. 0.10 = 10 %)              |
| `--commission-max-rate`        | Taux de commission maximal (immuable après création)         |
| `--commission-max-change-rate` | Variation quotidienne maximale du taux de commission         |
| `--min-self-delegation`        | Nombre minimal de jetons que l'opérateur doit auto-déléguer  |

Une fois la transaction confirmée, vérifiez votre validateur :

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classification en pools

QoreChain utilise un **système de classification à trois pools** géré par le module `x/qca` (Quantum Consensus Allocation). Tous les **1 000 blocs**, les validateurs sont reclassés dans l'un des trois pools en fonction de leur réputation et de leur mise :

| Pool                                 | Critères                                          | Allocation de blocs |
| ------------------------------------ | ------------------------------------------------- | ------------------- |
| **RPoS** (Reputation Proof-of-Stake) | Réputation >= 70e percentile ET mise >= médiane   | 40 % des blocs      |
| **DPoS** (Delegated Proof-of-Stake)  | Délégation totale >= 10 000 QOR                   | 35 % des blocs      |
| **PoS** (Proof-of-Stake)             | Tous les autres validateurs actifs                | 25 % des blocs      |

Au sein de chaque pool, les proposeurs de blocs sont sélectionnés par **tirage aléatoire pondéré** proportionnellement à leur mise effective. Cette classification garantit une représentation équitable aussi bien aux validateurs à forte réputation qu'à ceux à forte délégation, tout en permettant aux validateurs plus modestes de participer.

### Consulter la classification de votre pool

```bash
qorechaind query qca pool-classification $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC :

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Courbe de liaison (bonding curve)

La récompense de staking d'un validateur est déterminée par une courbe de liaison intégrant plusieurs facteurs :

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                                    |
| -------- | ------------------------------------------------------------------------------ |
| `R`      | Montant de la récompense                                                        |
| `beta`   | Taux de récompense de base                                                      |
| `S`      | Mise effective                                                                  |
| `alpha`  | Constante d'échelle de fidélité                                                 |
| `L`      | Durée de fidélité (temps de staking continu)                                    |
| `Q(r)`   | Facteur de qualité de réputation, plage \[0.75 - 1.25]                          |
| `P(t)`   | Multiplicateur de phase du protocole (ajusté au fil du cycle de vie du réseau)  |

**Points clés :**

* **Bonus de durée de fidélité :** les validateurs qui stakent en continu reçoivent des récompenses croissantes grâce au terme logarithmique de fidélité. Cela encourage l'engagement à long terme.
* **Facteur de qualité de réputation :** varie de 0.75 (réputation faible) à 1.25 (réputation excellente). La réputation est calculée à partir de la disponibilité, des propositions réussies, de la participation communautaire et de la qualité de validation des transactions.
* **Multiplicateur de phase du protocole :** s'ajuste à mesure que le réseau évolue au fil de ses phases (amorçage, croissance, maturité).

---

## Slashing progressif

QoreChain utilise un modèle de **slashing progressif** qui alourdit les pénalités pour les récidivistes tout en permettant aux validateurs de se rétablir avec le temps :

```
penalty = base_rate * escalation^effective_count * severity
```

| Paramètre                               | Valeur           |
| --------------------------------------- | ---------------- |
| Pénalité maximale par événement         | 33 % de la mise  |
| Demi-vie de décroissance                | 100,000 blocs    |
| Sévérité pour indisponibilité           | 1.0              |
| Sévérité pour double signature          | 2.0              |
| Sévérité pour attaque de client léger   | 3.0              |

1. **Chaque infraction incrémente le compteur effectif.** Chaque infraction (indisponibilité, double signature, etc.) augmente le compteur effectif du validateur, ce qui influe sur les pénalités futures.

2. **La pénalité augmente de façon exponentielle.** La pénalité s'aggrave selon le compteur effectif d'après la formule ci-dessus, de sorte que les récidivistes subissent des pénalités bien plus lourdes.

3. **Le compteur effectif décroît avec le temps.** Le compteur effectif décroît avec une demi-vie de 100,000 blocs (\~7 jours avec des blocs de 6 s), ce qui permet aux validateurs de se rétablir après une période de bon comportement.

4. **Événements isolés vs infractions répétées.** Un événement d'indisponibilité accidentel isolé n'entraîne qu'une pénalité mineure, tandis que des infractions répétées déclenchent des conséquences qui augmentent de manière exponentielle.

---

## Enregistrement d'une clé PQC

Les validateurs peuvent facultativement enregistrer une **clé publique de cryptographie post-quantique (PQC)** basée sur l'algorithme ML-DSA-87. Elle apporte une sécurité résistante au quantique pour l'identité du validateur et peut servir à la signature hybride.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Paramètre      | Description                                                    |
| -------------- | -------------------------------------------------------------- |
| `<pubkey-hex>` | Clé publique ML-DSA-87 de 2592 octets encodée en hexadécimal   |
| `hybrid`       | Mode d'enregistrement (hybrid = classique + PQC à la fois)     |

Vérifiez l'enregistrement :

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Recommandation :** l'enregistrement d'une clé PQC est facultatif mais fortement recommandé pour les validateurs opérant sur le mainnet. Il constitue une défense d'avenir contre les menaces liées à l'informatique quantique.
:::

---

## Supervision

### Métriques Prometheus

QoreChain expose des métriques Prometheus sur le port **26660** :

```
http://localhost:26660/metrics
```

Métriques clés à surveiller :

| Métrique                        | Description                                              |
| ------------------------------- | -------------------------------------------------------- |
| `qorechain_missed_blocks_total` | Total des blocs manqués par votre validateur             |
| `qorechain_validator_uptime`    | Pourcentage de disponibilité sur les N derniers blocs    |
| `qorechain_reputation_score`    | Score de réputation actuel                               |
| `qorechain_pool_classification` | Affectation de pool actuelle (0=PoS, 1=DPoS, 2=RPoS)     |
| `qorechain_consecutive_signed`  | Blocs signés consécutivement                             |
| `consensus_height`              | Hauteur de bloc actuelle                                 |
| `consensus_rounds`              | Tours de consensus pour la hauteur actuelle              |

### Consulter le score de réputation

```bash
qorechaind query reputation score $(qorechaind keys show mykey --bech val -a)
```

Via JSON-RPC :

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Contrôles de santé

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status bonded | grep "my-validator"
```

---

## Bonnes pratiques opérationnelles

1. **Utilisez une architecture de nœuds sentinelles.** Exécutez votre validateur derrière des nœuds sentinelles pour le protéger des attaques DDoS. N'exposez que les nœuds sentinelles au réseau public.

2. **Mettez en place des alertes.** Configurez des alertes pour les blocs manqués, la faible disponibilité et les redémarrages inattendus. Quelques blocs manqués sont normaux ; des manquements prolongés déclencheront un slashing.

3. **Maintenez une disponibilité élevée.** Le système de réputation récompense une disponibilité constante. Une indisponibilité prolongée dégrade votre facteur de qualité de réputation et réduit vos récompenses.

4. **Gardez le logiciel à jour.** Suivez les versions de QoreChain et appliquez les mises à jour rapidement. Coordonnez-vous avec la communauté des validateurs pour les mises à niveau de la chaîne.

5. **Sécurisez vos clés.** Utilisez un module matériel de sécurité (HSM) ou un signataire distant pour la clé de consensus du validateur. Ne stockez jamais les clés sur la même machine que le nœud.

6. **Enregistrez une clé PQC.** Préparez votre validateur aux menaces quantiques en enregistrant une clé ML-DSA-87.

7. **Surveillez votre pool.** Suivez votre classification de pool tous les 1 000 blocs. Améliorer votre réputation peut vous faire passer de PoS à RPoS, augmentant considérablement vos opportunités de proposition de blocs.

---

## Référence des commandes de validateur

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey -y

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey -y

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey -y

# Withdraw rewards
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey -y
```

---

## Valider les réseaux connectés {#connected-networks}

Depuis la version de chaîne **v3.1.80**, un validateur QoreChain peut aussi contribuer à la validation des réseaux connectés via le [bridge](/architecture/bridge-architecture). Cette fonctionnalité est **soumise à licence et à activation volontaire (opt-in)** :

1. **Détenir la licence.** Le validateur doit détenir une licence `validator_<chain>` (ou `qcb_bridge`) active pour le réseau cible. L'orchestrateur refuse de démarrer un client externe sans elle (fermeture en cas d'échec, fail-closed).
2. **L'activation provisionne automatiquement le client.** Lorsque la licence est activée, QoreChain provisionne sur votre nœud le client du réseau correspondant — téléchargement du client épinglé, génération de sa configuration et exécution sous l'orchestration de QoreChain. Rien n'est téléchargé avant l'activation.
3. **Fournir les clés et la mise du réseau.** La mise de validateur et les clés de signature du réseau externe sont **fournies par l'opérateur** pour chaque réseau ; QoreChain fournit le cadre de pilotes et la barrière de licence appliquée, pas votre mise sur la chaîne externe.

Des pilotes existent pour l'ensemble des **37 réseaux du bridge**, classés selon le mode de participation possible d'un validateur :

| Classe | Participation | Exemples |
| ----- | ------------- | -------- |
| Validateur sans permission | Staker et exécuter | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Plafonné / élu / sur admission | Staker, sous réserve d'un plafond ou d'une élection | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Nœud complet L2 | Exécuter un nœud complet (sans staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Sans staking / liste de confiance | Observer / participer sans staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Les versions épinglées des clients sont fournies au mieux ; vérifiez la version amont du client de votre réseau cible avant toute activation en production.
:::

## Étapes suivantes

* [Compilation depuis les sources](/developer-guide/building-from-source) — Compiler le binaire `qorechaind`
* [Développement EVM](/developer-guide/evm-development) — Déployer des contrats intelligents sur QoreChain
* [Abstraction de compte](/developer-guide/account-abstraction) — Comptes programmables pour vos opérations de validateur
