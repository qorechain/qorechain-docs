---
slug: /architecture/ai-engine
title: Moteur d'IA
sidebar_label: Moteur d'IA
sidebar_position: 4
---

# Moteur d'IA

QoreChain intègre des capacités d'IA à plusieurs niveaux de la pile protocolaire via le module `x/ai`. La couche on-chain fournit une analyse heuristique déterministe adaptée aux opérations critiques pour le consensus, tandis qu'un sidecar off-chain étend ces capacités avec des modèles d'apprentissage profond destinés au conseil et à l'outillage pour développeurs.

## Architecture à trois couches

Le moteur QCAI (QoreChain AI) fonctionne sur trois couches :

| Couche                  | Portée                                                       | Exécution                | Déterministe |
| ----------------------- | ----------------------------------------------------------- | ------------------------ | ------------ |
| **Niveau consensus**    | Production de blocs, ajustement des paramètres              | On-chain (x/rlconsensus) — observation uniquement aujourd'hui | Oui          |
| **Niveau réseau**       | Routage des transactions, détection de fraude, optimisation des frais | On-chain (x/ai) | Oui          |
| **Niveau application**  | Génération de contrats, audit, analyse approfondie          | Off-chain (sidecar)      | Non          |

Le niveau consensus est documenté séparément dans le [Moteur de consensus PRISM](/architecture/prism-consensus-engine). Cette page couvre les niveaux réseau et application.

:::note Ce qui est appliqué sur les réseaux en production (vérifié le 23 octobre 2026, mainnet et testnet alors tous deux en v3.2.4 ; le testnet est depuis passé à v3.2.6 et le mainnet à v3.2.5)
Deux parties de `x/ai` agissent aujourd'hui sur les transactions, sur la voie Cosmos comme sur la voie EVM :

* Une **limite de débit par expéditeur**. La limite en vigueur est de **600 transactions par minute et par expéditeur** (`max_tx_per_minute` ; la voie EVM dispose de sa propre limite optionnelle, qui n'est pas définie, de sorte que la même valeur s'applique). La « minute » est comptée sur une fenêtre fixe de blocs, et non en temps réel, car la hauteur de bloc est la seule horloge que tous les validateurs partagent. Un expéditeur qui atteint la limite voit ses transactions suivantes refusées jusqu'à ce que les plus anciennes sortent de la fenêtre. La limite est appliquée sur la voie Cosmos depuis la v3.2.0 et sur les deux voies depuis la v3.2.2.
* Un **score d'anomalie** pour chaque transaction. L'`anomaly_action` en vigueur est `flag` : un score élevé émet un événement `ai_anomaly_check` et comptabilise la transaction comme signalée, mais ne la refuse pas. Refuser sur la base du score est un réglage de gouvernance qui n'est pas activé.

Tout le reste de cette page (le routeur, le pipeline de fraude à six couches, l'optimiseur de frais, l'optimiseur de réseau, le sidecar) décrit de l'analyse et du conseil : rien de tout cela ne change les transactions que la chaîne accepte, et le pipeline à six couches n'est pas appelé depuis le chemin des transactions. Lisez les réglages en vigueur avec `qorechaind query ai config` et les compteurs avec `qorechaind query ai stats`.
:::

## Routeur de transactions

Le routeur amélioré par l'IA sélectionne les validateurs et routes optimaux pour chaque transaction au moyen d'un scoring multi-facteurs pondéré.

### Formule d'optimisation

```
OptimalRoute = argmin_r( alpha * Latency(r) + beta * Cost(r) + gamma * Security(r)^-1 )
```

| Pondération | Symbole | Défaut | Description                                                                      |
| ----------- | ------- | ------ | -------------------------------------------------------------------------------- |
| Latence     | alpha   | 0.4    | Temps de réponse normalisé (0=meilleur, 1=pire). 0 ms correspond à 0.0, 1000 ms à 1.0. |
| Coût        | beta    | 0.3    | Pourcentage de charge actuel comme indicateur indirect du coût.                  |
| Sécurité    | gamma   | 0.3    | Inverse du score de réputation. Une réputation plus élevée donne un score plus faible (meilleur). |

Le routeur maintient un **cache de métriques** (TTL par défaut : 30 secondes) contenant des données de performance par validateur, dont la latence moyenne, le pourcentage de disponibilité, le pourcentage de charge et le score de réputation. Lorsque les métriques en cache ne sont pas disponibles, le système se rabat sur le routeur heuristique.

### Confiance du routage

La confiance s'échelonne selon le nombre de validateurs disposant de métriques :

| Validateurs avec métriques | Confiance |
| -------------------------- | --------- |
| >= 10                      | 0.95      |
| >= 5                       | 0.85      |
| >= 2                       | 0.75      |
| 1                          | 0.60      |

## Détection de fraude

Le détecteur de fraude met en œuvre un **pipeline de détection à six couches** qui analyse chaque transaction par rapport à l'historique récent au moyen de méthodes statistiques.

### Couches de détection

| Couche | Détecteur               | Méthode                                                                | Seuil de déclenchement                                     |
| ------ | ----------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| 1      | **Isolation Forest**    | Z-score statistique sur les caractéristiques de montant, de gas et de fréquence d'expéditeur | Score d'anomalie > 0.7                    |
| 2      | **Analyseur de séquences** | Détecte les schémas alternés envoi/réception (wash trading)        | > 3 transferts alternés entre une même paire              |
| 3      | **Détecteur Sybil**     | Suit les nouvelles adresses uniques ; signale les pics de nouveaux expéditeurs | > 30 % des transactions récentes provenant de nouvelles adresses |
| 4      | **Détecteur DDoS**      | Surveille la fréquence de transactions par expéditeur                 | > 100 transactions par minute depuis un seul expéditeur    |
| 5      | **Détecteur de flash loan** | Identifie les schémas emprunt-manipulation-remboursement au sein d'un même bloc | >= 3 transactions dans le même bloc avec une variance de montant > 10x |
| 6      | **Détecteur d'exploit** | Signale une consommation de gas anormale dans les appels de contrat   | > 5x le gas moyen pour le même type de transaction         |

### Classification des menaces

| Plage de confiance | Niveau de menace |
| ------------------ | ---------------- |
| >= 0.9             | Critique         |
| >= 0.7             | Élevé            |
| >= 0.5             | Moyen            |
| >= 0.3             | Faible           |
| &lt; 0.3           | Aucun            |

### Actions de réponse

| Niveau de menace | Confiance | Action                                                       |
| ---------------- | --------- | ------------------------------------------------------------ |
| Critique         | > 0.8     | `circuit_break` — Suspend l'exécution de contrats spécifiques |
| Critique         | &lt;= 0.8 | `rate_limit` — Réduit temporairement l'acceptation de TX provenant de la source |
| Élevé            | > 0.7     | `rate_limit`                                                 |
| Élevé            | &lt;= 0.7 | `alert` — Émet un événement pour les validateurs et opérateurs |
| Moyen            | Toute valeur | `alert`                                                   |
| Faible / Aucun   | Toute valeur | `allow`                                                   |

Lorsqu'une action autre que `allow` est déclenchée, le pipeline crée un enregistrement d'enquête de fraude avec un identifiant unique (format : `INV-{block_height}-{txhash}`, tronqué à 48 caractères). Sur les réseaux en production, le pipeline n'est pas appelé depuis le chemin des transactions (voir la note en haut de cette page) : aucun enregistrement d'enquête n'est donc produit aujourd'hui et aucun coupe-circuit de contrat n'est activé par lui.

## Optimiseur de frais

L'optimiseur de frais prédit la congestion du réseau et suggère des frais optimaux pour les temps de confirmation souhaités au moyen d'un suivi de congestion par moyenne mobile exponentielle (EMA).

### Prédiction de congestion

* **Facteur de lissage EMA (alpha)** : 0.2
* **Fenêtre d'historique** : 100 blocs
* **Analyse de tendance** : compare les 5 blocs les plus récents aux 5 blocs précédents pour détecter les tendances de congestion, puis projette vers l'avant avec un amortissement de 50 %.

### Niveaux d'urgence

| Urgence  | Multiplicateur de base | Confirmation estimée |
| -------- | ---------------------- | -------------------- |
| `fast`   | 2.0x                   | 1-2 blocs            |
| `normal` | 1.0x                   | 3-5 blocs            |
| `slow`   | 0.5x                   | 6-10 blocs           |

Les frais finaux intègrent un **multiplicateur de congestion** (1.0x à 0 % de congestion, jusqu'à 5.0x à 100 % de congestion) et une **prime de tendance** lorsque la congestion prédite dépasse la congestion actuelle. Le plancher de frais propre à l'estimateur est une constante héritée de 500 uqor ; il n'est pas exposé sur les réseaux en production, et les frais qu'une transaction doit réellement payer sont fixés par le plancher du réseau de 0.1 uqor par unité de gas (voir [Première transaction](/getting-started/first-transaction#send-qor)).

## Optimiseur de réseau

L'optimiseur de réseau surveille en continu les métriques de performance et génère des recommandations de paramètres de gouvernance au moyen d'une fonction de récompense multi-objectifs.

### Fonction de récompense

```
R(s, a, s') = alpha * DeltaPerformance + beta * DeltaLatency + gamma * DeltaEnergy - delta * StabilityPenalty
```

| Pondération | Valeur | Objectif                          |
| ----------- | ------ | --------------------------------- |
| alpha       | 0.35   | Amélioration des performances     |
| beta        | 0.30   | Réduction de la latence           |
| gamma       | 0.15   | Économies d'énergie/de ressources |
| delta       | 0.20   | Préservation de la stabilité      |

### Types de recommandations

L'optimiseur génère des recommandations pour :

* **Limite de gas par bloc** : augmenter lorsque l'utilisation > 80 %, diminuer lorsque &lt; 20 %
* **Taux de commission minimal** : abaisser lorsque le nombre de validateurs est inférieur à 5
* **Nombre maximal de validateurs** : augmenter lorsque les temps de bloc sont sains et que >= 10 validateurs sont actifs
* **Temps de bloc cible** : alerter lorsque le temps de bloc moyen dépasse 8 secondes

Chaque recommandation comprend la valeur actuelle, la valeur suggérée, l'impact attendu, le score de confiance et le raisonnement.

## Sidecar IA

Le Sidecar QCAI étend l'IA on-chain avec des modèles d'apprentissage profond off-chain adossés au Backend QCAI. Le sidecar est optionnel et non critique pour le consensus ; il est joint via une interface gRPC interne.

### Capacités

| Capacité                | Description                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Génération de contrats** | Génère des contrats intelligents à partir de spécifications en langage naturel sur 17 plateformes |
| **Audit de contrats**   | Analyse de sécurité approfondie du code des contrats intelligents                   |
| **Analyse de fraude approfondie** | Enquête de fraude étendue à l'aide de modèles entraînés (complète les heuristiques on-chain) |
| **Conseil réseau**      | Recommandations avancées d'optimisation des paramètres                              |

### Modèles

| Nom du modèle | Cas d'usage                                              |
| ------------- | ------------------------------------------------------- |
| QCAI Fast     | Réponses à faible latence pour l'estimation des frais et le routage |
| QCAI Balanced | Analyse approfondie pour l'audit et les enquêtes de fraude |

Le sidecar fonctionne comme un service off-chain indépendant afin que les charges d'apprentissage profond ne bloquent ni n'influencent jamais l'exécution critique pour le consensus.

## Précompilés EVM

Deux contrats précompilés exposent les capacités d'IA on-chain aux contrats intelligents EVM :

| Précompilé       | Adresse  | Description                                                           |
| ---------------- | -------- | --------------------------------------------------------------------- |
| `aiRiskScore`    | `0x0B01` | Renvoie un score de risque (0-100) pour une adresse ou un hash de transaction donné |
| `aiAnomalyCheck` | `0x0B02` | Renvoie un indicateur booléen d'anomalie et un score de confiance pour une transaction |

:::warning Pas encore actif
Ces deux précompilés ne sont **pas actifs** sur le mainnet (`qorechain-vladi`) ni sur le testnet (`qorechain-diana`), vérifié le 27 octobre 2026 ; un appel renvoie des données vides. (Trois autres précompilés QoreChain, la paire PQC et les paramètres PRISM, sont actifs uniquement sur le testnet.) Ils ne seront activés qu'une fois dotés d'un chemin de scoring en lecture seule et en virgule fixe. Voir [Précompilés EVM : état du réseau](/developer-guide/evm-precompiles#network-status).
:::

**Important** : les précompilés EVM utilisent **uniquement le moteur heuristique déterministe**. Ils n'appellent jamais le sidecar, garantissant que toute exécution EVM reste entièrement déterministe et reproductible. Depuis la v3.2.3, le précompilé de vérification d'anomalie analyse une transaction sans écrire d'état ; les autres durcissements des précompilés de cette version (le pont CrossVM qui refuse `STATICCALL`, décompte son appel imbriqué sur le gas du cadre appelant et n'atteint que des cibles QoreChain Native figurant sur une liste d'autorisation) s'appliquent une fois le précompilé CrossVM activé. Au 27 octobre 2026, la liste `active_static_precompiles` est vide sur le mainnet ; sur le testnet, elle contient trois entrées (PQC Verify `0x…0A01`, PQC Key Status `0x…0A02` et PRISM Consensus Params `0x…0C01`), dont aucune n'est un précompilé d'IA.

## Attestation TEE

Le module IA définit des interfaces pour l'attestation **Trusted Execution Environment**, permettant à l'avenir une exécution vérifiable de modèles d'IA à l'intérieur d'enclaves matérielles sécurisées.

### Plateformes prises en charge

| Plateforme  | Identifiant | Description                                            |
| ----------- | ----------- | ------------------------------------------------------ |
| Intel SGX   | `sgx`       | Software Guard Extensions                              |
| Intel TDX   | `tdx`       | Trust Domain Extensions                                |
| AMD SEV-SNP | `sev-snp`   | Secure Encrypted Virtualization - Secure Nested Paging |
| ARM CCA     | `arm-cca`   | Confidential Compute Architecture                      |

### Flux d'attestation

1. **Charger les poids du modèle** — Le sidecar charge les poids du modèle d'IA dans une enclave TEE.
2. **Exécuter l'inférence dans l'enclave** — L'inférence s'exécute dans la mémoire protégée de l'enclave.
3. **Produire un rapport d'attestation** — L'enclave produit un rapport d'attestation liant le hash du modèle, le hash de l'entrée et le hash de la sortie.
4. **Vérifier l'attestation on-chain** — Les validateurs vérifient l'attestation on-chain avant d'accepter les résultats d'inférence.

L'attestation TEE est actuellement au stade de spécification d'interface. Sa mise en œuvre est prévue pour une version future.

## Apprentissage fédéré

Le module IA définit des interfaces pour la coordination de l'**apprentissage fédéré on-chain**, où les nœuds validateurs entraînent des modèles locaux et soumettent des mises à jour de gradient qui sont agrégées en un modèle global sans partager les données d'entraînement brutes.

### Méthodes d'agrégation

| Méthode    | Description                                                             |
| ---------- | ----------------------------------------------------------------------- |
| `fedavg`   | Federated Averaging — moyenne pondérée des gradients par nombre d'échantillons |
| `fedprox`  | Federated Proximal — ajoute un terme proximal pour gérer des données hétérogènes |
| `scaffold` | SCAFFOLD — utilise des variables de contrôle pour corriger la dérive client |

### Cycle de vie d'un tour

```
Pending --> Training --> Aggregating --> Complete
                                    \-> Failed (timeout or insufficient participants)
```

Chaque tour est configuré avec un nombre minimal/maximal de participants, un délai d'expiration, un taux d'apprentissage, une norme d'écrêtage de gradient et un multiplicateur de bruit de confidentialité différentielle optionnel. Toutes les soumissions de gradient sont signées avec des signatures PQC (Dilithium-5).

L'apprentissage fédéré est actuellement au stade de spécification d'interface. Sa mise en œuvre est prévue pour une version future.

## Requêtes

`qorechaind query ai config` et `qorechaind query ai stats` (gRPC) sont les requêtes du module. Le module n'a aucune route REST aujourd'hui : les routes `/ai/v1/...` d'estimation de frais, d'enquêtes de fraude, de recommandations réseau et de coupe-circuits ne sont servies ni sur le mainnet ni sur le testnet.

## Voir aussi

* [Moteur de consensus PRISM](/architecture/prism-consensus-engine) — la couche d'IA conçue pour l'optimisation du consensus (observation uniquement aujourd'hui).
* [Créateur de contrats intelligents](/dashboard/smart-contract-creator) — génération de contrats assistée par l'IA dans le Dashboard.
* [Auditeur de contrats](/dashboard/contract-auditor) — revue de sécurité de contrats assistée par l'IA.
