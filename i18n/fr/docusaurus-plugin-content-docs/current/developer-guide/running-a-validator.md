---
slug: /developer-guide/running-a-validator
title: Exécution d'un validateur
sidebar_label: Exécution d'un validateur
sidebar_position: 9
---

# Exécution d'un validateur

Ce guide explique comment créer un validateur sur le réseau QoreChain, comprendre le système de classification des pools, enregistrer une clé PQC pour une sécurité résistante au quantique, et surveiller votre nœud.

:::note
Ce guide cible le mainnet **`qorechain-vladi`** (EVM chain ID **9801**), actif depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.92**. Le testnet **`qorechain-diana`** (EVM chain ID **9800**) est recommandé pour répéter votre configuration avant la mise en production. Remplacez `--chain-id` par la valeur appropriée pour votre réseau cible.
:::

---

## Prérequis

* Un nœud `qorechaind` entièrement synchronisé (voir [Connexion au testnet](/getting-started/connecting-to-testnet))
* Un compte approvisionné avec au moins **1,000 QOR** (1,000,000,000 uqor) pour l'auto-délégation initiale
* Une bonne connaissance du modèle de [Staking et délégation](/user-guide/staking-and-delegation)

---

## Création d'un validateur

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
| `--moniker`                    | Nom lisible pour votre validateur                  |
| `--commission-rate`            | Taux de commission initial (par ex., 0.10 = 10%)   |
| `--commission-max-rate`        | Taux de commission maximum (immuable après création) |
| `--commission-max-change-rate` | Taux maximum de variation quotidienne de la commission |
| `--min-self-delegation`        | Nombre minimum de jetons que l'opérateur doit s'auto-déléguer |

Une fois la transaction confirmée, vérifiez votre validateur :

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classification des pools

QoreChain utilise un **système de classification à trois pools** géré par le module `x/qca` (Quantum Consensus Allocation). Tous les **1,000 blocs**, les validateurs sont reclassés dans l'un des trois pools en fonction de leur réputation et de leur mise :

| Pool                                 | Critères                                          | Allocation de blocs |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Réputation >= 70e percentile ET mise >= médiane   | 40% des blocs    |
| **DPoS** (Delegated Proof-of-Stake)  | Délégation totale >= 10,000 QOR                   | 35% des blocs    |
| **PoS** (Proof-of-Stake)             | Tous les autres validateurs actifs                | 25% des blocs    |

Au sein de chaque pool, les proposants de blocs sont sélectionnés au moyen d'une **sélection aléatoire pondérée** proportionnelle à leur mise effective. Cette classification garantit que les validateurs à forte réputation et à forte délégation bénéficient d'une représentation équitable, tout en permettant aux plus petits validateurs de participer.

### Consulter votre classification de pool

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
| `S`      | Mise effective                                              |
| `alpha`  | Constante d'échelle de fidélité                             |
| `L`      | Durée de fidélité (temps de staking continu)                |
| `Q(r)`   | Facteur de qualité de réputation, plage \[0.75 - 1.25]      |
| `P(t)`   | Multiplicateur de phase du protocole (s'ajuste au fil du cycle de vie du réseau) |

**Points clés à retenir :**

* **Bonus de durée de fidélité :** Les validateurs qui misent en continu reçoivent des récompenses croissantes grâce au terme logarithmique de fidélité. Cela encourage l'engagement à long terme.
* **Facteur de qualité de réputation :** Varie de 0.75 (mauvaise réputation) à 1.25 (excellente réputation). La réputation est calculée à partir du temps de disponibilité, des propositions réussies, de la participation communautaire et de la qualité de validation des transactions.
* **Multiplicateur de phase du protocole :** S'ajuste à mesure que le réseau mûrit à travers différentes phases (amorçage, croissance, maturité).

---

## Slashing progressif

QoreChain utilise un modèle de **slashing progressif** qui aggrave les pénalités pour les récidivistes tout en permettant aux validateurs de se rétablir avec le temps :

```
penalty = base_rate * escalation^effective_count * severity
```

| Paramètre                    | Valeur         |
| ----------------------------- | -------------- |
| Pénalité maximale par événement | 33% de la mise |
| Demi-vie de décroissance      | 100,000 blocs  |
| Sévérité de l'indisponibilité | 1.0            |
| Sévérité du double-signing    | 2.0            |
| Sévérité de l'attaque sur client léger | 3.0    |

1. **Chaque infraction incrémente le compteur effectif.** Chaque infraction (indisponibilité, double signature, etc.) augmente le compteur effectif du validateur, ce qui affecte les pénalités futures.

2. **La pénalité augmente de façon exponentielle.** La pénalité augmente en fonction du compteur effectif selon la formule ci-dessus, de sorte que les récidivistes s'exposent à des pénalités bien plus élevées.

3. **Le compteur effectif décroît avec le temps.** Le compteur effectif décroît avec une demi-vie de 100,000 blocs (\~7 jours à 6 s par bloc), ce qui permet aux validateurs de se rétablir après une période de bon comportement.

4. **Événements isolés et infractions répétées.** Un seul événement accidentel d'indisponibilité entraîne une pénalité mineure, tandis que des infractions répétées déclenchent des conséquences exponentiellement croissantes.

---

## Enregistrement de la clé PQC {#pqc-key-registration}

Les validateurs peuvent facultativement enregistrer une **clé publique post-quantique (PQC)** en utilisant l'algorithme ML-DSA-87. Cela fournit une sécurité résistante au quantique pour l'identité du validateur et peut être utilisé pour la signature hybride.

```bash
qorechaind tx pqc register-key <pubkey-hex> hybrid \
  --from mykey \
  --gas auto \
  -y
```

| Paramètre      | Description                                       |
| -------------- | ------------------------------------------------- |
| `<pubkey-hex>` | Clé publique ML-DSA-87 de 2592 octets encodée en hexadécimal |
| `hybrid`       | Mode d'enregistrement (hybrid = classique + PQC)  |

Vérifier l'enregistrement :

```bash
qorechaind query pqc key <account-address>
```

:::tip
**Recommandation :** L'enregistrement d'une clé PQC est facultatif mais fortement recommandé pour les validateurs opérant sur le mainnet. Il offre une défense anticipée contre les menaces liées à l'informatique quantique.
:::

---

## Surveillance

### Métriques Prometheus

QoreChain expose des métriques Prometheus sur le port **26660** :

```
http://localhost:26660/metrics
```

Principales métriques à surveiller :

| Métrique                        | Description                                     |
| -------------------------------- | ----------------------------------------------- |
| `qorechain_missed_blocks_total`  | Nombre total de blocs manqués par votre validateur |
| `qorechain_validator_uptime`     | Pourcentage de disponibilité sur les N derniers blocs |
| `qorechain_reputation_score`     | Score de réputation actuel                      |
| `qorechain_pool_classification`  | Attribution de pool actuelle (0=PoS, 1=DPoS, 2=RPoS) |
| `qorechain_consecutive_signed`   | Blocs consécutifs signés                        |
| `consensus_height`               | Hauteur de bloc actuelle                        |
| `consensus_rounds`               | Tours de consensus pour la hauteur actuelle     |

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

1. **Utilisez une architecture de nœuds sentinelles.** Exécutez votre validateur derrière des nœuds sentinelles pour le protéger des attaques DDoS. N'exposez que les nœuds sentinelles au réseau public.

2. **Mettez en place des alertes.** Configurez des alertes pour les blocs manqués, la faible disponibilité et les redémarrages inattendus. Quelques blocs manqués sont normaux ; des manques soutenus déclencheront un slashing.

3. **Maintenez une disponibilité élevée.** Le système de réputation récompense une disponibilité constante. Une indisponibilité prolongée dégrade votre facteur de qualité de réputation, réduisant les récompenses.

4. **Maintenez le logiciel à jour.** Suivez les versions de QoreChain et appliquez les mises à jour rapidement. Coordonnez-vous avec la communauté des validateurs pour les mises à niveau de la chaîne.

5. **Sécurisez vos clés.** Utilisez un module de sécurité matériel (HSM) ou un signataire distant pour la clé de consensus du validateur. Ne stockez jamais les clés sur la même machine que le nœud.

6. **Enregistrez une clé PQC.** Préparez votre validateur pour l'avenir contre les menaces quantiques en enregistrant une clé ML-DSA-87.

7. **Surveillez votre pool.** Suivez votre classification de pool toutes les 1,000 blocs. Améliorer votre réputation peut vous faire passer de PoS à RPoS, augmentant considérablement les opportunités de proposition de blocs.

---

## Référence des commandes du validateur

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

## Validation des réseaux connectés {#connected-networks}

Depuis la version de chaîne **v3.1.80**, un validateur QoreChain peut également contribuer à la validation des réseaux connectés via le [bridge](/architecture/bridge-architecture). Ceci est **soumis à licence et optionnel** :

1. **Détenir la licence.** Le validateur doit détenir une licence active `validator_<chain>` (ou `qcb_bridge`) pour le réseau cible. L'orchestrateur refuse de démarrer un client externe sans elle (fail-closed).
2. **L'activation approvisionne automatiquement le client.** Lorsque la licence est activée, QoreChain approvisionne le client du réseau correspondant sur votre nœud — en téléchargeant le client épinglé, en générant sa configuration et en l'exécutant sous l'orchestration de QoreChain. Rien n'est téléchargé avant l'activation.
3. **Fournir les clés et la mise du réseau.** Les clés de validateur/mise et de signature du réseau externe sont **fournies par l'opérateur** pour chaque réseau ; QoreChain fournit le framework de pilotes et le verrou de licence appliqué, mais pas votre mise sur la chaîne externe.

Des pilotes existent pour les **37 réseaux du bridge**, classés selon la manière dont un validateur peut participer :

| Classe | Participation | Exemples |
| ----- | ------------- | -------- |
| Validateur sans permission | Miser et exécuter | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Plafonné / élu / admission | Miser, sous réserve d'un plafond ou d'une élection | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Nœud complet L2 | Exécuter un nœud complet (sans staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Sans staking / liste de confiance | Observer / participer sans staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Les épinglages de version des clients sont fournis au mieux ; vérifiez la version du client en amont pour votre réseau cible avant une activation en production.
:::

## Prochaines étapes

* [Compilation depuis les sources](/developer-guide/building-from-source) — Compilez le binaire `qorechaind`
* [Développement EVM](/developer-guide/evm-development) — Déployez des smart contracts sur QoreChain
* [Abstraction de compte](/developer-guide/account-abstraction) — Comptes programmables pour vos opérations de validateur
