---
slug: /architecture/rollup-development-kit
title: Kit de développement de rollups
sidebar_label: Kit de développement de rollups
sidebar_position: 12
---

# Kit de développement de rollups

Le module `x/rdk` fournit un kit complet de développement de rollups (Rollup Development Kit, RDK) qui permet aux développeurs de déployer des rollups spécifiques à une application sur QoreChain. Il prend en charge quatre paradigmes de règlement, plusieurs modes de séquenceur, des backends de disponibilité des données enfichables et une optimisation de la configuration assistée par IA.

---

## Paradigmes de règlement

Le RDK de QoreChain prend en charge quatre modes de règlement distincts — **optimistic**, **zk**, **based** et **sovereign** — chacun avec des hypothèses de confiance, des caractéristiques de finalité et des exigences de preuve différentes.

### Règlement optimiste

Les rollups optimistes supposent que les transactions sont valides par défaut et s'appuient sur des preuves de fraude pour la résolution des litiges.

* **Système de preuve** : preuves de fraude interactives
* **Fenêtre de contestation** : 7 jours (604 800 secondes), configurable par rollup
* **Caution de contestation** : 1 000 QOR (1 000 000 000 uqor) — requise pour soumettre une contestation par preuve de fraude
* **Finalité** : différée jusqu'à l'expiration de la fenêtre de contestation sans contestation valide
* **Finalisation automatique** : l'`EndBlocker` finalise automatiquement les lots une fois la fenêtre de contestation passée sans litige

**Cycle de vie d'un lot** :

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Règlement ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

Les rollups ZK fournissent des preuves de validité cryptographiques qui garantissent l'exactitude des transitions d'état.

* **Système de preuve** : SNARK (Groth16, PLONK) ou STARK (transparent, sans configuration de confiance)
* **Finalité** : instantanée à la vérification de la preuve — aucune fenêtre de contestation requise
* **Taille de preuve maximale** : 1 Mo (1 048 576 octets)
* **Profondeur de récursion** : profondeur d'agrégation de preuves configurable (par défaut : 1)
* **Maturité** : dans la version actuelle, le règlement ZK utilise une vérification factice qui accepte toute preuve non vide. La vérification complète des preuves SNARK/STARK est une mise à niveau prévue et doit être considérée comme pas encore durcie pour la production.

**Cycle de vie d'un lot** :

```
Submitted + valid proof → Finalized (instant)
```

### Règlement based

Les rollups based délèguent le séquencement des transactions aux proposeurs L1 (QoreChain), héritant des garanties de vivacité et de résistance à la censure de la chaîne hôte.

* **Système de preuve** : aucun requis — les proposeurs L1 font foi
* **Séquenceur** : doit utiliser le mode de séquenceur `based` (imposé par la validation)
* **Finalité** : confirmation à 2 blocs sur QoreChain
* **Délai d'inclusion** : nombre de blocs configurable avant l'inclusion forcée des transactions du rollup
* **Partage des frais de priorité** : pourcentage configurable des frais de priorité versés aux proposeurs L1

**Cycle de vie d'un lot** :

```
Submitted → [2 L1 blocks] → Finalized (auto)
```

### Règlement souverain

Les rollups souverains fonctionnent avec un consensus indépendant et séquencent eux-mêmes leurs transactions. Ils ancrent leur état à QoreChain à des fins de vérifiabilité mais ne dépendent pas de la chaîne hôte pour la finalité.

* **Système de preuve** : aucun
* **Finalité** : indépendante — déterminée par le propre consensus du rollup
* **Ancrage d'état** : les racines d'état sont publiées sur QoreChain pour la transparence et la vérifiabilité, mais ne sont pas imposées
* **Finalisation automatique** : aucune — les rollups souverains gèrent leur propre finalité

---

## Compatibilité des systèmes de preuve

| Mode de règlement | Preuves de fraude |     SNARK |     STARK |     Aucune |
| --------------- | -----------: | --------: | --------: | -------: |
| **Optimistic**  |     Requises |        -- |        -- |       -- |
| **ZK**          |           -- | Prise en charge | Prise en charge |       -- |
| **Based**       |           -- |        -- |        -- | Requise |
| **Sovereign**   |           -- |        -- |        -- | Requise |

La vérification STARK et la vérification complète des preuves ZK sont encore en cours de maturation ; voir la note de maturité sur le [règlement ZK](#zk-zero-knowledge-settlement) ci-dessus.

---

## Profils prédéfinis

Le RDK est livré avec **cinq profils prédéfinis** qui fournissent des configurations de rollup clés en main optimisées pour des cas d'usage courants. Chaque profil regroupe un paradigme de règlement, un mode de séquenceur, un backend de disponibilité des données, un modèle de gas et une VM adaptés à son domaine cible :

| Profil          | Règlement (preuve)       | Séquenceur | DA              | Modèle de gas    | VM      | Cas d'usage cible |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Applications de trading, de prêt et de type AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | État de jeu et économies en jeu à haut débit et faible latence |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA prévu) | standard | CosmWasm | Frappe de NFT, places de marché et objets de collection numériques |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Déploiements permissionnés et de consortium avec frais sponsorisés |
| **`custom`**     | entièrement paramétrable      | entièrement paramétrable | entièrement paramétrable | entièrement paramétrable | entièrement paramétrable | Chaque champ est défini par l'utilisateur |

Le profil `custom` laisse chaque champ à votre discrétion. Les valeurs exactes regroupées dans chaque profil prédéfini peuvent évoluer à mesure que le RDK mûrit ; interrogez la configuration en direct avec `qorechaind query rdk config` (ou `RdkClient.params()` depuis `@qorechain/rdk`) pour les paramètres par profil faisant autorité, et notez que le règlement `based` est toujours associé au mode de séquenceur `based`.

---

## Modes de séquenceur

Le séquenceur détermine qui ordonne les transactions au sein d'un bloc de rollup.

### Séquenceur dédié

Un seul opérateur séquence toutes les transactions du rollup.

* **Opérateur** : adresse unique désignée
* **Latence** : la plus faible possible — ordonnancement par une seule partie
* **Confiance** : nécessite de faire confiance à l'opérateur du séquenceur pour la vivacité et l'équité de l'ordonnancement

### Séquenceur partagé

Un ensemble de séquenceurs ordonne collectivement les transactions.

* **Taille minimale de l'ensemble** : configurable (par défaut : 1)
* **Latence** : légèrement supérieure en raison de la coordination multipartite
* **Confiance** : répartie sur l'ensemble des séquenceurs

### Séquenceur based

Les proposeurs L1 de QoreChain séquencent les transactions du rollup.

* **Délai d'inclusion** : nombre de blocs configurable avant l'inclusion forcée (par défaut : 10)
* **Partage des frais de priorité** : pourcentage configurable des frais de priorité versés aux proposeurs L1
* **Confiance** : hérite de la sécurité de l'ensemble des validateurs de QoreChain et de la résistance à la censure
* **Exigence** : le mode de règlement based nécessite le séquenceur based (imposé à la validation)

---

## Backends de disponibilité des données

### DA native

Stockage de blobs en KV-store on-chain au sein de QoreChain elle-même.

| Paramètre            | Valeur                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Taille de blob maximale**    | 2 Mo (2 097 152 octets)                                                                              |
| **Période de rétention** | 432 000 blocs (\~30 jours avec des blocs de 6 secondes)                                                       |
| **Élagage automatique**     | Les blobs expirés sont élagués dans l'`EndBlocker` — les données sont supprimées mais les métadonnées d'engagement sont conservées  |
| **Engagement**       | Hachage SHA-256 des données du blob                                                                           |

### Celestia DA

Disponibilité des données basée sur IBC utilisant la couche DA dédiée de Celestia.

* **Statut** : factice dans la version actuelle — renvoie une erreur si sélectionnée comme unique backend
* **Prise en charge des namespaces** : les namespaces spécifiques au rollup sont pris en charge dans le schéma de blob
* **Prévu** : intégration IBC complète avec la soumission et la vérification de blobs de Celestia

### Les deux (redondant)

Stocke les blobs simultanément sur les backends Native et Celestia.

* Dans la version actuelle, seul le blob natif est réellement stocké ; un avertissement est journalisé pour le composant Celestia.

---

## Cycle de vie d'un rollup

```
Pending → Active → Paused → Active → Stopped
                      ↑                  |
                      └──────────────────┘
                      (can resume from paused,
                       stopped is permanent)
```

| État       | Description                                                  |
| ----------- | ------------------------------------------------------------ |
| **Pending** | Rollup enregistré mais pas encore activé                      |
| **Active**  | Le rollup est en service et traite des lots                        |
| **Paused**  | Temporairement suspendu par le créateur (peut reprendre)                   |
| **Stopped** | Définitivement mis hors service — caution de stake retournée au créateur  |

À la création, le statut du rollup est défini sur `Active` immédiatement après la réussite de la mise sous séquestre du stake et de l'enregistrement de la couche.

---

## Cycle de vie d'un lot

Les lots de règlement suivent la progression d'état des racines d'état du rollup :

```
Submitted → Finalized                              (happy path)
Submitted → Challenged → Rejected                  (fraud detected)
```

| État          | Description                                       |
| -------------- | ------------------------------------------------- |
| **Submitted**  | Lot publié sur QoreChain, en attente de finalisation  |
| **Challenged** | Contestation par preuve de fraude soumise (optimistic uniquement) |
| **Finalized**  | Lot accepté comme canonique                       |
| **Rejected**   | Lot invalidé par une contestation réussie         |

### Règles de finalisation automatique

| Mode de règlement | Déclencheur de finalisation                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | Expiration de la fenêtre de contestation (\~7 jours) sans contestation valide |
| **ZK**          | Instantanée à la soumission d'une preuve valide                           |
| **Based**       | 2 blocs L1 après la soumission                                |
| **Sovereign**   | Aucune — gérée par le propre consensus du rollup                |

La finalisation automatique est exécutée dans l'`EndBlocker` pour les rollups optimistic et based. Les lots ZK sont finalisés en ligne pendant la soumission du lot.

---

## Paramètres du module

| Paramètre                   |                          Défaut | Description                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 | Nombre maximal de rollups pouvant être enregistrés |
| `min_stake_for_rollup`      | 10 000 000 000 uqor (10 000 QOR) | Stake minimal requis pour créer un rollup        |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Fraction du stake de création brûlée via `x/burn`   |
| `default_challenge_window`  |         604 800 secondes (7 jours) | Fenêtre de contestation optimistic par défaut              |
| `max_da_blob_size`          |           2 097 152 octets (2 Mo) | Taille maximale de blob de disponibilité des données              |
| `blob_retention_blocks`     |              432 000 (\~30 jours) | Blocs avant l'élagage des blobs DA                |
| `max_batches_per_block`     |                               10 | Nombre maximal de lots de règlement traités par bloc   |

---

## Intégration multicouche

Le module RDK s'intègre à `x/multilayer` pour la gestion d'état inter-couches :

### Enregistrement de couche

Lorsqu'un rollup est créé, il est automatiquement enregistré en tant que couche sidechain via `RegisterSidechain`. L'enregistrement comprend :

* L'ID de couche (correspond à l'ID du rollup)
* Le temps de bloc cible et le nombre maximal de transactions par bloc
* Les types de VM et domaines pris en charge
* L'intervalle de règlement

L'enregistrement est **non fatal** : si l'enregistrement `x/multilayer` échoue, le rollup est tout de même créé et un avertissement est journalisé.

### Ancrage d'état

Chaque lot de règlement soumis au RDK est ancré à `x/multilayer` via `AnchorState`. Cela enregistre :

* L'ID de couche et la hauteur de couche (index du lot)
* La racine d'état
* Le nombre de transactions

L'ancrage est **non fatal** : les échecs sont journalisés mais n'empêchent pas le traitement des lots.

---

## Intégration du burn

À la création d'un rollup, **1 % du montant du stake** est brûlé via le module `x/burn` à travers le canal de burn `rollup_create`. Par exemple, créer un rollup avec le stake minimal de 10 000 QOR brûle 100 QOR de manière permanente. Les 9 900 QOR restants sont conservés sous séquestre et restitués lorsque le rollup est arrêté.
