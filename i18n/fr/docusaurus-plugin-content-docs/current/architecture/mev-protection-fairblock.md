---
slug: /architecture/mev-protection-fairblock
title: Protection MEV (FairBlock)
sidebar_label: Protection MEV (FairBlock)
sidebar_position: 10
---

# Protection MEV (FairBlock)

Le module `x/fairblock` met en œuvre la défense de QoreChain contre les attaques MEV (Maximal Extractable Value) à l'aide d'un chiffrement à seuil basé sur l'identité. Combinée à un système de priorisation des transactions à 5 voies, cette approche crée une architecture anti-MEV complète qui protège les utilisateurs contre le front-running, les attaques sandwich et d'autres formes d'extraction de valeur fondées sur le mempool.

## Le problème du MEV

Le MEV survient lorsque les proposants de blocs ou des observateurs exploitent l'**asymétrie d'information** dans le mempool de transactions. Comme les transactions en attente sont visibles avant leur inclusion, des adversaires peuvent :

* **Front-run** : Placer une transaction devant une opération rentable détectée
* **Attaque sandwich** : Placer des transactions avant et après l'opération d'une victime pour extraire de la valeur du slippage de prix
* **Back-run** : Placer une transaction immédiatement après une opportunité détectée

Ces attaques extraient de la valeur des utilisateurs ordinaires et compromettent l'équité dans la DeFi, les échanges de tokens et le minting de NFT.

## Cadre tIBE FairBlock

QoreChain traite le MEV au moyen du **chiffrement à seuil basé sur l'identité (tIBE)**, un schéma cryptographique dans lequel :

1. **Chiffrement** : Les utilisateurs chiffrent leurs transactions avant de les diffuser. Les transactions chiffrées sont **opaques** — les proposants, les validateurs et les observateurs du mempool ne peuvent pas lire le contenu des transactions.
2. **Inclusion** : Les proposants incluent les transactions chiffrées dans les blocs sans en connaître le contenu. Comme les données sont illisibles, l'asymétrie d'information est éliminée.
3. **Déchiffrement** : Une fois qu'une transaction est validée dans un bloc, un nombre seuil de validateurs fournissent des parts de déchiffrement. Une fois le seuil atteint, la transaction est déchiffrée et exécutée.

Cette approche garantit qu'aucune partie ne peut déchiffrer une transaction avant qu'elle ne soit irréversiblement validée, éliminant le vecteur d'attaque MEV à la racine.

### Structure d'une transaction chiffrée

Chaque transaction chiffrée contient :

| Champ            | Description                                       |
| ---------------- | ------------------------------------------------ |
| `encrypted_data` | Charge utile de transaction chiffrée en tIBE     |
| `sender`         | Adresse de l'expéditeur de la transaction (visible pour le routage) |
| `target_height`  | Hauteur de bloc à laquelle le déchiffrement doit avoir lieu |
| `submitted_at`   | Horodatage du chiffrement                        |

### Parts de déchiffrement

Les validateurs fournissent des parts de déchiffrement pour les transactions validées :

| Champ        | Description                                  |
| ------------ | -------------------------------------------- |
| `validator`  | Adresse du validateur contributeur           |
| `tx_id`      | ID de la transaction chiffrée                |
| `share_data` | La part de clé de déchiffrement du validateur |
| `height`     | Hauteur de bloc de la soumission de la part  |

## État d'implémentation

Dans la version actuelle du testnet, le module FairBlock est une **implémentation factice (stub)** :

* L'ante handler `FairBlockDecorator` est branché dans le pipeline de traitement des transactions mais **laisse passer** toutes les transactions sans modification.
* Lorsque `enabled` vaut `false` (la valeur par défaut), le décorateur délègue immédiatement au handler suivant de la chaîne.
* L'activation complète du tIBE est prévue pour une version future, en attente d'une cérémonie de clés des validateurs pour établir les paramètres de chiffrement à seuil.

### Configuration de FairBlock

| Paramètre            | Défaut       | Description                                       |
| -------------------- | ------------ | ------------------------------------------------- |
| `enabled`            | `false`      | Interrupteur principal du chiffrement tIBE        |
| `tibe_threshold`     | 5            | Nombre de parts de déchiffrement de validateurs requises |
| `decryption_delay`   | 3 blocs      | Blocs après l'inclusion avant le début du déchiffrement |
| `max_encrypted_size` | 65,536 bytes | Taille maximale d'une charge utile de transaction chiffrée |

## Priorisation des transactions à 5 voies

QoreChain met en œuvre une architecture de mempool à 5 voies qui catégorise les transactions par type et attribue à chaque voie un niveau de priorité et une allocation d'espace de bloc.

### Configuration des voies

| Voie        |      Priorité | Espace de bloc | Type de transaction                              |
| ----------- | ------------: | -------------: | ------------------------------------------------ |
| **PQC**     | 100 (la plus haute) |        15 % | Transactions avec signatures hybrides post-quantiques |
| **MEV**     |            90 |           20 % | Transactions chiffrées tIBE FairBlock            |
| **AI**      |            80 |           15 % | Transactions scorées par IA et optimisées en frais |
| **Default** |            50 |           40 % | Transactions standard                            |
| **Free**    |   10 (la plus basse) |        10 % | Transactions à gas abstrait et sponsorisées      |

### Description des voies

**Voie PQC** (Priorité 100, 15 % de l'espace de bloc)\
Les transactions signées avec des signatures cryptographiques hybrides post-quantiques reçoivent la priorité la plus élevée. Cela incite à l'adoption de la signature de transactions résistante au quantique et garantit que les opérations protégées par PQC ne sont jamais évincées en période de congestion.

**Voie MEV** (Priorité 90, 20 % de l'espace de bloc)\
Les transactions chiffrées tIBE reçoivent la deuxième priorité la plus élevée et la plus grande allocation réservée. Cela garantit que les utilisateurs qui optent pour la protection MEV se voient garantir un espace de bloc, encourageant l'adoption généralisée du schéma de chiffrement.

**Voie AI** (Priorité 80, 15 % de l'espace de bloc)\
Les transactions qui ont été scorées ou optimisées par le système IA de détection d'anomalies reçoivent une priorité accrue. Cela inclut les transactions signalées comme opérations légitimes à forte valeur ou celles avec des structures de frais optimisées par IA.

**Voie Default** (Priorité 50, 40 % de l'espace de bloc)\
Transactions standard sans aucune classification particulière. Cette voie reçoit la plus grande allocation absolue d'espace de bloc pour gérer le trafic réseau normal.

**Voie Free** (Priorité 10, 10 % de l'espace de bloc)\
Transactions à gas abstrait et sponsorisées. Cette voie permet des expériences utilisateur sans frais où un tiers (application, protocole ou relayer) sponsorise le coût en gas. La faible priorité et l'espace de bloc limité préviennent les abus tout en prenant en charge les cas d'usage d'abstraction de gas.

### État d'implémentation

La configuration des voies est **purement déclarative (data-only)** dans la version actuelle du testnet. Les définitions de voies (priorité, allocation d'espace de bloc) sont enregistrées à l'initialisation de l'application, mais le réordonnancement effectif du mempool via `PrepareProposal` et `ProcessProposal` est un jalon futur. Actuellement, toutes les transactions sont traitées dans l'ordre standard quelle que soit leur affectation de voie.

## Effet anti-MEV combiné

1. **Couche 1 : Chiffrement (tIBE)** — Les transactions sont chiffrées avant d'entrer dans le mempool. Les proposants ne peuvent pas en lire le contenu, il n'y a donc aucune information à extraire.
2. **Couche 2 : Priorisation (voies)** — Les transactions chiffrées de la voie MEV bénéficient de 20 % d'espace de bloc réservé. La priorité 90 garantit l'inclusion même en cas de congestion.
3. **Couche 3 : Déchiffrement à seuil** — Ce n'est qu'après la validation du bloc que les validateurs révèlent les parts de déchiffrement. L'exigence de seuil empêche tout validateur isolé de procéder à un déchiffrement anticipé.

Résultat : l'asymétrie d'information est éliminée à chaque étape du cycle de vie de la transaction, de la diffusion à l'exécution.

Cette approche est strictement supérieure au déchiffrement temporisé ou aux schémas commit-reveal à partie unique, car l'exigence de seuil répartit la confiance sur l'ensemble des validateurs.
