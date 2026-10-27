---
slug: /architecture/rollup-development-kit
title: Kit de développement de rollups
sidebar_label: Kit de développement de rollups
sidebar_position: 12
---

# Kit de développement de rollups

Le module `x/rdk` fournit un kit complet de développement de rollups (Rollup Development Kit, RDK) qui permet aux développeurs de déployer des rollups spécifiques à une application sur QoreChain. Il prend en charge quatre paradigmes de règlement, plusieurs modes de séquenceur, des backends de disponibilité des données enfichables et une optimisation de la configuration assistée par IA.

:::caution Capacité à un stade précoce
Le module est déployé sur le mainnet (version de chaîne **v3.2.4** depuis le 23 octobre 2026) et sur le testnet (**v3.2.6** depuis le 27 octobre 2026), mais **aucun rollup n'a encore été créé sur l'un ou l'autre réseau** (vérifié le 27 octobre 2026 : `GET /qorechain/rdk/v1/rollups` renvoie une liste vide sur les deux). Plusieurs capacités décrites ci-dessous ne sont pas utilisables de bout en bout aujourd'hui ; le statut est indiqué là où chacune est décrite. Pour le guide pratique destiné aux développeurs, voir [Présentation des rollups](/rollups/overview).
:::

---

## Paradigmes de règlement

Le RDK de QoreChain prend en charge quatre modes de règlement distincts — **optimistic**, **zk**, **based** et **sovereign** — chacun avec des hypothèses de confiance, des caractéristiques de finalité et des exigences de preuve différentes.

### Règlement optimiste {#optimistic-settlement}

Les rollups optimistes supposent que les transactions sont valides par défaut et s'appuient sur des preuves de fraude pour la résolution des litiges.

* **Système de preuve** : preuves de fraude interactives
* **Fenêtre de contestation** : 604 800 secondes (par défaut, 7 jours). **Avant la v3.2.4 :** la chaîne la convertit en blocs à raison fixe de 6 secondes par bloc, soit **100 800 blocs** ; le temps réel écoulé dépend donc du temps de bloc effectif (environ 3,7 jours avec les blocs actuels du mainnet d'environ 3,1 s) ; planifiez en blocs, pas en jours. **À partir de la v3.2.4 :** pour un lot soumis à partir de la hauteur de la mise à niveau, la fenêtre est mesurée en secondes de temps de bloc (7 jours pleins). Un lot soumis plus tôt conserve la règle du nombre de blocs. Le testnet a appliqué la v3.2.4 à la hauteur 8 337 253 (19 octobre 2026) ; le mainnet l'a appliquée à la hauteur 3 742 566 (23 octobre 2026, proposition de gouvernance 13). La valeur par défaut configurée du testnet est plus courte, 3 600 secondes (1 heure) : un rollup du testnet se finalise donc plus vite que les 7 jours décrits ici.
* **Caution de contestation** : 1 000 QOR (1 000 000 000 uqor) — requise pour soumettre une contestation par preuve de fraude (profils `nft` et `custom` ; les profils `defi`, `gaming` et `enterprise` ne définissent aucune caution car ils n'ont pas de fenêtre de contestation)
* **Finalité** : différée jusqu'à l'expiration de la fenêtre de contestation sans contestation valide
* **Finalisation automatique** : l'`EndBlocker` finalise automatiquement les lots une fois la fenêtre de contestation passée sans litige. Un lot contesté n'est jamais finalisé automatiquement : il doit d'abord être résolu, par le créateur du rollup sur le mainnet (v3.2.4) et par n'importe quel compte sur le testnet (v3.2.5 et suivantes ; le mainnet suivra lorsque la proposition de gouvernance 14 appliquera la v3.2.5) (voir [Déployer un rollup](/rollups/deploying-a-rollup#challenge-a-batch-optimistic-rollups)).

**Cycle de vie d'un lot** :

```
Submitted → [challenge window expires] → Finalized
Submitted → [fraud proof submitted] → Challenged → Rejected
```

### Règlement ZK (Zero-Knowledge) {#zk-zero-knowledge-settlement}

Les rollups ZK fournissent des preuves de validité cryptographiques qui garantissent l'exactitude des transitions d'état.

* **Système de preuve** : SNARK (Groth16 sur BLS12-381) ou STARK (transparent, sans configuration de confiance)
* **Finalité** : instantanée à la vérification de la preuve — aucune fenêtre de contestation requise
* **Taille de preuve maximale** : 1 Mo (1 048 576 octets)
* **Profondeur de récursion** : profondeur d'agrégation de preuves configurable (par défaut : 1)
* **Maturité** : les lots SNARK sont vérifiés on-chain (Groth16 sur BLS12-381) par rapport à une clé de vérification stockée avec le rollup. **Le règlement ZK ne peut pas encore être utilisé sur l'un ou l'autre réseau :** la chaîne n'offre aucun moyen d'enregistrer une clé de vérification pour un rollup, de sorte que chaque lot ZK est refusé une fois ses frais payés. L'enregistrement des clés est prévu pour la version de chaîne v3.2.7. La vérification STARK est expérimentale : elle est optionnelle et vérifie un circuit de démonstration, et non la propre transition d'état de votre rollup. Considérez le règlement ZK comme non prêt pour la production.

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

La vérification STARK est expérimentale et le règlement ZK n'est pas prêt pour la production ; voir la note de maturité sur le [règlement ZK](#zk-zero-knowledge-settlement) ci-dessus.

---

## Profils prédéfinis

Le RDK est livré avec **cinq profils prédéfinis** qui fournissent des configurations de rollup clés en main optimisées pour des cas d'usage courants. Chaque profil regroupe un paradigme de règlement, un mode de séquenceur, un backend de disponibilité des données, un modèle de gas et une VM adaptés à son domaine cible :

| Profil          | Règlement (preuve)       | Séquenceur | DA              | Modèle de gas    | VM      | Cas d'usage cible |
| ---------------- | ------------------------ | --------- | --------------- | ------------ | ------- | --------------- |
| **`defi`**       | zk (SNARK)               | dedicated | native          | EIP-1559     | EVM     | Applications de trading, de prêt et de type AMM |
| **`gaming`**     | based                    | based     | native          | flat         | custom  | État de jeu et économies en jeu à haut débit et faible latence |
| **`nft`**        | optimistic (fraud)       | dedicated | native (Celestia DA prévu) | standard | QoreChain Native | Frappe de NFT, places de marché et objets de collection numériques |
| **`enterprise`** | based                    | based     | native          | subsidized   | EVM     | Déploiements permissionnés et de consortium avec frais sponsorisés |
| **`custom`**     | entièrement paramétrable      | entièrement paramétrable | entièrement paramétrable | entièrement paramétrable | entièrement paramétrable | Chaque champ est défini par l'utilisateur |

Le profil `custom` laisse chaque champ à votre discrétion. Les valeurs exactes regroupées dans chaque profil prédéfini peuvent évoluer à mesure que le RDK mûrit ; interrogez la configuration en direct avec `qorechaind query rdk config` (ou `RdkClient.params()` depuis `@qorechain/rdk`) pour les paramètres par profil faisant autorité, et notez que le règlement `based` est toujours associé au mode de séquenceur `based`.

---

## Modes de séquenceur

Le séquenceur détermine qui ordonne les transactions au sein d'un bloc de rollup.

:::note Ce qui est imposé aujourd'hui
On-chain, un lot ne peut être soumis que par l'adresse de séquenceur configurée du rollup ou, lorsqu'aucune n'est définie (c'est le cas de tous les profils prédéfinis), par son créateur. Les modes `shared` et `based` sont enregistrés dans la configuration du rollup, mais QoreChain n'admet pas encore de liste de séquenceurs partagés ni de proposeurs L1 comme soumetteurs de lots ; ces modes décrivent la conception prévue.
:::

### Séquenceur dédié

Un seul opérateur séquence toutes les transactions du rollup.

* **Opérateur** : adresse unique désignée
* **Latence** : la plus faible possible — ordonnancement par une seule partie
* **Confiance** : nécessite de faire confiance à l'opérateur du séquenceur pour la vivacité et l'équité de l'ordonnancement

### Séquenceur partagé

Un ensemble de séquenceurs ordonne collectivement les transactions.

* **Statut** : une simple étiquette aujourd'hui — la liste n'est pas encore admise on-chain (voir la note ci-dessus)
* **Taille minimale de l'ensemble** : configurable (par défaut : 1)
* **Latence** : légèrement supérieure en raison de la coordination multipartite
* **Confiance** : répartie sur l'ensemble des séquenceurs

### Séquenceur based

Les proposeurs L1 de QoreChain séquencent les transactions du rollup.

* **Statut** : une simple étiquette aujourd'hui — les proposeurs L1 ne sont pas encore admis comme soumetteurs de lots (voir la note ci-dessus)
* **Délai d'inclusion** : nombre de blocs configurable avant l'inclusion forcée (par défaut : 10)
* **Partage des frais de priorité** : pourcentage configurable des frais de priorité versés aux proposeurs L1
* **Confiance** : hérite de la sécurité de l'ensemble des validateurs de QoreChain et de la résistance à la censure
* **Exigence** : le mode de règlement based nécessite le séquenceur based (imposé à la validation)

---

## Backends de disponibilité des données

### DA native

Stockage de blobs en KV-store on-chain au sein de QoreChain elle-même.

:::caution Pas encore de moyen public de publier un blob
Le module définit le stockage, la rétention et l'élagage des blobs, mais il n'existe aucun message de transaction pour publier un blob dans les versions actuelles. Un lot qui nomme un hachage de données sur un rollup `native` ou `both` est refusé, car aucun blob correspondant ne peut être stocké. Voir [Disponibilité des données](/rollups/data-availability). Sur la DA native, un lot doit donc laisser `data_hash` vide ; le client RDK (0.7.0) le fait, et la chaîne refuse un lot qui en revendique un.
:::

| Paramètre            | Valeur                                                                                               |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| **Taille de blob maximale**    | 2 Mo (2 097 152 octets)                                                                              |
| **Période de rétention** | 432 000 blocs (environ 16 jours avec les blocs actuels du mainnet d'environ 3,1 s ; ce chiffre évolue avec le temps de bloc) |
| **Élagage automatique**     | Les blobs expirés sont élagués dans l'`EndBlocker` — les données sont supprimées mais les métadonnées d'engagement sont conservées  |
| **Engagement**       | Hachage SHAKE-256 (32 octets) des données du blob                                                   |

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
| **Stopped** | Définitivement mis hors service — ce qui reste du séquestre du créateur lui est restitué (voir [Registre de séquestre](#escrow-ledger)) |

À la création, le statut du rollup est défini sur `Active` immédiatement après la réussite de la mise sous séquestre du stake et du brûlage de création (l'enregistrement de la couche est tenté mais n'est pas bloquant). Seul le créateur peut mettre en pause, reprendre ou arrêter un rollup (imposé depuis la version de chaîne v3.2.0).

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

Comportement de RDK 0.6.1 et ultérieur (la 0.7.0 est la version actuelle) : pour un rollup optimistic, le client construit un lot dont la racine d'état est la racine de transition canonique de la chaîne (`batchTransitionRoot` dans le RDK), et non une valeur libre de votre choix.

### Règles de finalisation automatique

| Mode de règlement | Déclencheur de finalisation                                        |
| --------------- | ----------------------------------------------------------- |
| **Optimistic**  | 100 800 blocs après la soumission (fenêtre par défaut) sans contestation ; pour les lots soumis depuis la v3.2.4 (testnet à partir de la hauteur 8 337 253 ; mainnet à partir de la hauteur 3 742 566, 23 octobre 2026), 604 800 secondes de temps de bloc |
| **ZK**          | Instantanée à la soumission d'une preuve valide                           |
| **Based**       | 2 blocs L1 après la soumission                                |
| **Sovereign**   | Aucune — gérée par le propre consensus du rollup                |

La finalisation automatique est exécutée dans l'`EndBlocker` pour les rollups optimistic et based. Les lots ZK sont finalisés en ligne pendant la soumission du lot.

---

## Paramètres du module

| Paramètre                   |                          Défaut | Description                                      |
| --------------------------- | -------------------------------: | ------------------------------------------------ |
| `max_rollups`               |                              100 (testnet : 200) | Nombre maximal de rollups pouvant être enregistrés |
| `min_stake_for_rollup`      | 10 000 000 000 uqor (10 000 QOR) | Stake minimal requis pour créer un rollup        |
| `rollup_creation_burn_rate` |                        0.01 (1%) | Fraction du stake de création brûlée via `x/burn`   |
| `default_challenge_window`  | 604 800 s (testnet : 3 600 s) | Fenêtre de contestation optimistic par défaut ; avant la v3.2.4, la chaîne la convertissait en 100 800 blocs |
| `max_da_blob_size`          |           2 097 152 octets (2 Mo) | Taille maximale de blob de disponibilité des données              |
| `blob_retention_blocks`     |                   432 000 blocs | Blocs avant l'élagage des blobs DA                |
| `max_batches_per_block`     |                               10 | Nombre maximal de lots de règlement traités par bloc   |

---

## Intégration multicouche

Le module RDK s'intègre à `x/multilayer` pour la gestion d'état inter-couches :

### Enregistrement de couche {#layer-registration}

Lorsqu'un rollup est créé, le module enregistre une couche pour celui-ci via `RegisterSidechain` ; ainsi, on-chain, le type de couche est **`sidechain`**, elle démarre au statut `proposed`, elle compte dans la limite de sidechains de multilayer (`max_sidechains`, par défaut **10**) et elle verrouille le `min_sidechain_stake` du créateur (1 000 QOR). L'enregistrement comprend :

* L'ID de couche (correspond à l'ID du rollup)
* Le temps de bloc cible et le nombre maximal de transactions par bloc
* Les types de VM et domaines pris en charge
* L'intervalle de règlement

L'enregistrement est **non fatal** : s'il échoue (solde insuffisant ou limite atteinte), le rollup est tout de même créé, mais il n'a pas de couche et ne peut pas être ancré. Un ancrage de règlement n'exige pas que la couche soit `active` : la couche qu'un rollup RDK enregistre reste `proposed` et reste ancrable par son créateur (voir [Soumission d'une ancre](/architecture/multilayer-architecture#anchor-submission)).

### Ancrage d'état {#state-anchoring}

Un lot de règlement peut être ancré à `x/multilayer`, qui enregistre l'ID de couche, la hauteur de couche (l'index du lot), la racine d'état, le hachage de l'ensemble de validateurs et le nombre de transactions sous une signature post-quantique du créateur du rollup.

* **Depuis la v3.2.2 (actif sur le mainnet et le testnet) :** `MsgSubmitBatch` possède deux champs optionnels. `anchor_signature` est la signature ML-DSA-87 du créateur sur les **octets de signature d'ancre v2** du lot (voir [Lecture des ancres](/architecture/multilayer-architecture#reading-anchors)) ; lorsqu'elle est présente, le lot est ancré dans `x/multilayer` dans la **même transaction**, et une ancre refusée refuse le lot. `validator_set_hash` est l'engagement de l'ensemble de validateurs du rollup, porté dans l'ancre et couvert par la signature. En CLI : `qorechaind query rdk anchor-sign-bytes <layer-id> <batch-index> <state-root-hex> --chain-id <id> --tx-count <n>` affiche les octets à signer (`<layer-id>` est l'ID de couche du rollup, qui est égal à l'ID du rollup pour les rollups créés via le RDK), et `tx rdk submit-batch ... --anchor-signature <hex> --validator-set-hash <hex>` les soumet.
* **Sans la signature**, le lot est réglé sans ancrage, exactement comme avant. Un client qui n'envoie pas ce champ produit des lots non ancrés ; vérifiez donc que l'outil que vous utilisez le prend en charge : le `@qorechain/rdk` 0.6.0 en TypeScript signe l'ancre lorsque son client signe en hybride et est le créateur du rollup (sinon il soumet sans ancre), tandis que les clients Python, Go, Rust et Java ne construisent pas ce champ. Aucun rollup, aucune couche ni aucune ancre n'existe encore sur l'un ou l'autre réseau ; aucune ancre n'a donc été écrite et ce chemin n'a pas été testé en conditions réelles.

Voir [Reçus de règlement](/rollups/settlement-receipts) pour ce qu'un ancrage prouve et ne prouve pas.

---

## Registre de séquestre et retraits {#escrow-ledger}

Le séquestre de tous les rollups se trouve dans un seul solde de module mutualisé. Depuis la **v3.2.3** (hauteur mainnet 3 662 051, 20 octobre 2026), un **registre de séquestre** par rollup est l'unique compte de ce que chaque rollup détient dans ce pool :

* `create-rollup` crédite le registre du séquestre que le rollup conserve réellement : le stake moins le brûlage de création de 1 %.
* Un retrait (`tx rdk execute-withdrawal`) et une récompense de preuve de fraude sont payés à partir du registre et y sont débités. Un retrait supérieur à ce que le rollup détient encore est refusé avec une erreur de séquestre insuffisant.
* `stop-rollup` ne rembourse que ce qui reste dans le registre et le remet à zéro. Un rollup arrêté ne paie plus aucun retrait.
* La `RollupView` en lecture seule renvoyée par les requêtes de rollup porte `escrow_balance` : les uqor encore détenus pour ce rollup.

Avant la v3.2.3, le registre était crédité de zéro, de sorte que chaque retrait échouait en mode fermé ; `execute-withdrawal` ne peut donc réussir sur le mainnet qu'à partir de la v3.2.3. Les vérifications qu'un client doit effectuer avant de payer des frais : le denom doit être exactement `uqor`, le montant doit être positif, la preuve de Merkle compte au plus 64 niveaux et chaque nœud frère fait exactement 32 octets, et l'émetteur comme le destinataire doivent être des adresses `qor1…` valides. Un retrait nécessite aussi un lot finalisé qui a engagé un `withdrawals_root`, et chaque feuille de retrait ne peut être payée qu'une seule fois.

## Lecture de l'état du RDK {#reading-state}

Les requêtes du RDK sont servies en REST sur le mainnet et le testnet sous `/qorechain/rdk/v1/` :

| Route | Renvoie |
| --- | --- |
| `/params` | Paramètres du module (le tableau ci-dessus) |
| `/rollups` et `/rollup/{rollup_id}` | Enregistrements de rollup, y compris `escrow_balance` |
| `/batches/{rollup_id}` | Lots, paginés (`start_index`, `limit` par défaut 50, au plus 100, `next_index`) |
| `/batch/{rollup_id}/{batch_index}` et `/latest_batch/{rollup_id}` | Un lot, ou le plus récent |
| `/blob/{rollup_id}/{blob_index}` | Métadonnées du blob, y compris `expires_at_height` (les octets du blob ne sont pas renvoyés) |

`qorechaind query rdk config` affiche les paramètres du module (la route est `/params` ; il n'existe pas de route `/config`). Les identifiants de rollup et de couche doivent respecter la grammaire décrite dans [Identifiants de couche et de rollup](/architecture/multilayer-architecture#id-grammar), imposée depuis la v3.2.2.

---

## Intégration du burn

À la création d'un rollup, **1 % du montant du stake** est brûlé via le module `x/burn` à travers le canal de burn `rollup_create`. Par exemple, créer un rollup avec le stake minimal de 10 000 QOR brûle 100 QOR de manière permanente. Les 9 900 QOR restants sont conservés sous séquestre et, lorsque le rollup est arrêté, ce qu'il en reste est restitué au créateur (les retraits et les récompenses de preuve de fraude payés à partir du séquestre réduisent le remboursement). Le brûlage à la création est imposé depuis la version de chaîne v3.2.0 ; les versions antérieures ne l'appliquaient pas.
