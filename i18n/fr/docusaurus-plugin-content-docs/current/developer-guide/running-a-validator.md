---
slug: /developer-guide/running-a-validator
title: Exécuter un validateur
sidebar_label: Exécuter un validateur
sidebar_position: 9
---

# Exécuter un validateur

Ce guide explique comment créer un validateur sur le réseau QoreChain, comprendre le système de classification des pools, enregistrer une clé PQC pour une sécurité résistante au quantique, et surveiller votre nœud.

:::note
Ce guide cible le mainnet **`qorechain-vladi`** (EVM chain ID **9801**), en service depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.77**. Le testnet **`qorechain-diana`** (EVM chain ID **9800**) est recommandé pour répéter votre configuration avant la mise en production. Substituez le `--chain-id` approprié pour votre réseau cible.
:::

---

## Prérequis

* Un nœud `qorechaind` entièrement synchronisé (voir [Se connecter au testnet](/getting-started/connecting-to-testnet))
* Un compte approvisionné avec au moins **1 000 QOR** (1 000 000 000 uqor) pour l'auto-délégation initiale
* Une familiarité avec le modèle [Staking et délégation](/user-guide/staking-and-delegation)

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

| Paramètre                      | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `--amount`                     | Montant de l'auto-délégation (mise minimale)       |
| `--pubkey`                     | Clé publique de consensus du validateur (ed25519)  |
| `--moniker`                    | Nom lisible de votre validateur                    |
| `--commission-rate`            | Taux de commission initial (ex. : 0.10 = 10 %)     |
| `--commission-max-rate`        | Taux de commission maximal (immuable après création) |
| `--commission-max-change-rate` | Taux de variation quotidien maximal de la commission |
| `--min-self-delegation`        | Tokens minimum que l'opérateur doit s'auto-déléguer |

Une fois la transaction confirmée, vérifiez votre validateur :

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classification des pools

QoreChain utilise un **système de classification à trois pools** géré par le module `x/qca` (Quantum Consensus Allocation). Tous les **1 000 blocs**, les validateurs sont reclassés dans l'un des trois pools en fonction de leur réputation et de leur mise :

| Pool                                 | Critères                                          | Allocation de blocs |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Réputation >= 70e centile ET mise >= médiane      | 40 % des blocs   |
| **DPoS** (Delegated Proof-of-Stake)  | Délégation totale >= 10 000 QOR                   | 35 % des blocs   |
| **PoS** (Proof-of-Stake)             | Tous les validateurs actifs restants              | 25 % des blocs   |

Au sein de chaque pool, les proposeurs de blocs sont sélectionnés par **tirage aléatoire pondéré** proportionnel à leur mise effective. La classification garantit que les validateurs à haute réputation comme ceux à forte délégation bénéficient d'une représentation équitable, tout en permettant aux plus petits validateurs de participer.

### Interroger la classification de votre pool

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

## Courbe de bonding

La récompense de staking d'un validateur est déterminée par une courbe de bonding qui intègre plusieurs facteurs :

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                |
| -------- | ---------------------------------------------------------- |
| `R`      | Montant de la récompense                                   |
| `beta`   | Taux de récompense de base                                 |
| `S`      | Mise effective                                             |
| `alpha`  | Constante de mise à l'échelle de la fidélité              |
| `L`      | Durée de fidélité (temps de staking continu)              |
| `Q(r)`   | Facteur de qualité de réputation, plage \[0.75 - 1.25]    |
| `P(t)`   | Multiplicateur de phase du protocole (s'ajuste sur le cycle de vie du réseau) |

**Points clés :**

* **Bonus de durée de fidélité :** Les validateurs qui font du staking en continu reçoivent des récompenses croissantes via le terme logarithmique de fidélité. Cela incite à l'engagement à long terme.
* **Facteur de qualité de réputation :** Varie de 0,75 (faible réputation) à 1,25 (excellente réputation). La réputation est calculée à partir de la disponibilité, des propositions réussies, de la participation communautaire et de la qualité de validation des transactions.
* **Multiplicateur de phase du protocole :** S'ajuste à mesure que le réseau mûrit à travers différentes phases (amorçage, croissance, maturité).

---

## Slashing progressif

QoreChain utilise un modèle de **slashing progressif** qui aggrave les pénalités pour les récidivistes tout en permettant aux validateurs de se rétablir au fil du temps :

```
penalty = base_rate * escalation^effective_count * severity
```

| Paramètre                    | Valeur         |
| ---------------------------- | -------------- |
| Pénalité maximale par événement | 33 % de la mise |
| Demi-vie de décroissance     | 100 000 blocs  |
| Sévérité d'indisponibilité   | 1.0            |
| Sévérité de double-signature | 2.0            |
| Sévérité d'attaque de client léger | 3.0      |

1. **Chaque infraction incrémente le compteur effectif.** Toute infraction (indisponibilité, double-signature, etc.) augmente le compteur effectif du validateur, ce qui affecte les pénalités futures.

2. **La pénalité augmente exponentiellement.** La pénalité augmente en fonction du compteur effectif selon la formule ci-dessus, de sorte que les récidivistes font face à des pénalités bien plus élevées.

3. **Le compteur effectif décroît dans le temps.** Le compteur effectif décroît avec une demi-vie de 100 000 blocs (\~7 jours à des blocs de 6 s), permettant aux validateurs de se rétablir après une période de bon comportement.

4. **Événements uniques vs infractions répétées.** Un seul événement d'indisponibilité accidentelle entraîne une pénalité mineure, tandis que des infractions répétées déclenchent des conséquences croissant exponentiellement.

---

## Enregistrement d'une clé PQC

Les validateurs peuvent éventuellement enregistrer une **clé publique de cryptographie post-quantique (PQC)** en utilisant l'algorithme ML-DSA-87. Cela fournit une sécurité résistante au quantique pour l'identité du validateur et peut être utilisé pour la signature hybride.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Paramètre      | Description                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | Clé publique ML-DSA-87 de 2592 octets en encodage hex |
| `hybrid`       | Mode d'enregistrement (hybride = classique + PQC) |

Vérifiez l'enregistrement :

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Recommandation :** L'enregistrement d'une clé PQC est facultatif mais fortement recommandé pour les validateurs opérant sur le mainnet. Il offre une défense tournée vers l'avenir contre les menaces de l'informatique quantique.
:::

---

## Surveillance

### Métriques Prometheus

QoreChain expose des métriques Prometheus sur le port **26660** :

```
http://localhost:26660/metrics
```

Métriques clés à surveiller :

| Métrique                        | Description                                     |
| ------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total` | Total des blocs manqués par votre validateur    |
| `qorechain_validator_uptime`    | Pourcentage de disponibilité sur les N derniers blocs |
| `qorechain_reputation_score`    | Score de réputation actuel                      |
| `qorechain_pool_classification` | Affectation de pool actuelle (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`  | Blocs consécutifs signés                        |
| `consensus_height`              | Hauteur de bloc actuelle                        |
| `consensus_rounds`              | Tours de consensus pour la hauteur actuelle     |

### Interroger le score de réputation

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

### Vérifications de santé

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

1. **Utilisez une architecture de nœuds sentinelles.** Faites fonctionner votre validateur derrière des nœuds sentinelles pour le protéger des attaques DDoS. N'exposez que les nœuds sentinelles au réseau public.

2. **Mettez en place des alertes.** Configurez des alertes pour les blocs manqués, la faible disponibilité et les redémarrages inattendus. Quelques blocs manqués sont normaux ; des manquements soutenus déclencheront un slashing.

3. **Maintenez une disponibilité élevée.** Le système de réputation récompense une disponibilité constante. Une indisponibilité prolongée dégrade votre facteur de qualité de réputation, réduisant les récompenses.

4. **Gardez le logiciel à jour.** Suivez les versions de QoreChain et appliquez les mises à jour rapidement. Coordonnez-vous avec la communauté des validateurs pour les mises à niveau de la chaîne.

5. **Sécurisez vos clés.** Utilisez un module de sécurité matériel (HSM) ou un signataire distant pour la clé de consensus du validateur. Ne stockez jamais les clés sur la même machine que le nœud.

6. **Enregistrez une clé PQC.** Pérennisez votre validateur contre les menaces quantiques en enregistrant une clé ML-DSA-87.

7. **Surveillez votre pool.** Suivez la classification de votre pool tous les 1 000 blocs. Améliorer votre réputation peut vous faire passer de PoS à RPoS, augmentant considérablement les opportunités de proposition de blocs.

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

## Étapes suivantes

* [Compiler depuis les sources](/developer-guide/building-from-source) — Compilez le binaire `qorechaind`
* [Développement EVM](/developer-guide/evm-development) — Déployez des contrats intelligents sur QoreChain
* [Abstraction de compte](/developer-guide/account-abstraction) — Comptes programmables pour vos opérations de validateur
