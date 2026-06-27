---
slug: /rollups/preset-profiles
title: Profils préréglés
sidebar_label: Profils préréglés
sidebar_position: 2
---

# Profils préréglés

Le RDK fournit des **profils préréglés** qui proposent des configurations de rollup clés en main, ajustées pour les catégories d'applications courantes. Un préréglage regroupe un mode de règlement, un mode de séquenceur, un backend de disponibilité des données et des paramètres d'exécution, afin que vous puissiez lancer un rollup sans choisir manuellement chaque option.

Un profil est passé positionnellement à `create-rollup` :

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Les valeurs par préréglage ci-dessous correspondent aux valeurs par défaut des profils livrés avec **`@qorechain/rdk`**, qui reflètent la table des profils publiée par le réseau. Elles peuvent encore évoluer à mesure que le RDK mûrit — interrogez les paramètres de module en direct avec `qorechaind query rdk config` (ou `RdkClient.params()` depuis le SDK) pour la configuration faisant autorité, et validez sur le testnet **`qorechain-diana`** avant le mainnet.
:::

---

## Les profils préréglés

Chaque préréglage regroupe un paradigme de règlement (et le système de preuve que ce règlement exige), un mode de séquenceur, un backend de disponibilité des données, un modèle de gas et une VM :

| Profil | Règlement (preuve) | Séquenceur | DA | Modèle de gas | VM | Cas d'usage visé |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | Applications de type DeFi et AMM — marchés de prêt, DEX et dérivés, où la finalité rapide et des frais prévisibles comptent |
| **`gaming`** | based | based | native | flat | custom | État de jeu et économies en jeu à haut débit et faible latence |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA prévu) | standard | CosmWasm | Frappe de NFT, places de marché et objets de collection numériques |
| **`enterprise`** | based | based | native | subsidized | EVM | Déploiements à permissions et de consortium avec frais sponsorisés (subventionnés) |
| **`custom`** | entièrement paramétré (par défaut : optimistic / fraud) | entièrement paramétré | entièrement paramétré | entièrement paramétré | entièrement paramétré (par défaut : EVM) | Chaque champ est défini par l'utilisateur — partez de zéro et définissez chaque option vous-même |

Quelques contraintes découlent de la [matrice règlement → preuve](/rollups/overview) : le règlement `optimistic` utilise des preuves `fraud`, `zk` utilise `snark` (ou `stark`), et `based` et `sovereign` n'embarquent aucune preuve. Le règlement `based` se couple toujours avec le mode de séquenceur `based`. Le préréglage `nft` se règle nativement aujourd'hui avec **Celestia DA prévu**.

:::note
La configuration par préréglage a été vérifiée en direct sur la version de chaîne **v3.1.74**, où `create-rollup` applique automatiquement le préréglage du profil : **`defi` = zk + EVM, `gaming` = based + VM custom, `nft` = optimistic + CosmWasm, `enterprise` = based + EVM, `custom` = optimistic + EVM (par défaut)**. Le préréglage `custom` laisse chaque champ ouvert — les valeurs affichées sont ses valeurs par défaut de départ.
:::

Considérez les quatre préréglages de domaine comme des points de départ raisonnables et le profil **`custom`** comme l'option entièrement ouverte. Les paramètres précis regroupés peuvent changer d'une version à l'autre — interrogez `rdk config` (ci-dessous) pour les valeurs faisant autorité, puis partez du préréglage le plus proche et affinez.

La CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) génère un projet de démarrage exécutable — un modèle par profil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — afin que vous puissiez passer d'un profil à du code de création/requête fonctionnel en une seule commande.

---

## Obtenir une recommandation : `suggest-profile`

Si vous ne savez pas quel préréglage convient, la requête `suggest-profile` prend une description en langage clair de votre cas d'usage et renvoie un profil recommandé.

```bash
qorechaind query rdk suggest-profile [use-case]
```

**Exemple :**

```bash
qorechaind query rdk suggest-profile "a lending protocol with predictable fees"
```

La suggestion est un point de départ utile — examinez la recommandation au regard de vos exigences spécifiques (garanties de règlement, modèle de confiance du séquenceur, besoins de disponibilité des données et VM) avant de vous engager sur une configuration.

---

## Inspecter la configuration des préréglages on-chain

Comme les spécificités des préréglages sont résolues on-chain, la façon faisant autorité de voir ce à quoi un profil se résout est d'interroger le module et le rollup créé :

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Ce schéma — interroger `config` avant de déployer, puis interroger `rollup` après — vous permet de confirmer exactement ce que votre préréglage choisi a produit, plutôt que de vous fier à des valeurs documentées susceptibles d'évoluer.

---

## Étapes suivantes

* **[Déployer un Rollup](/rollups/deploying-a-rollup)** — créez un rollup à partir d'un préréglage via le Dashboard ou la CLI, puis gérez son cycle de vie.
* **[Présentation des Rollups](/rollups/overview)** — les paradigmes de règlement et les modes de séquenceur qu'un préréglage regroupe.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — la référence de module de plus bas niveau.
