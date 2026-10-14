---
slug: /rollups/preset-profiles
title: Profils prédéfinis
sidebar_label: Profils prédéfinis
sidebar_position: 2
---

# Profils prédéfinis

Le RDK est livré avec des **profils prédéfinis** qui fournissent des configurations de rollup clés en main, adaptées aux catégories d'applications courantes. Un profil prédéfini regroupe un mode de règlement, un mode de séquenceur, un backend de disponibilité des données et des paramètres d'exécution, ce qui vous permet de lancer un rollup sans devoir choisir chaque option manuellement.

Un profil est passé en argument positionnel à `create-rollup` :

```bash
qorechaind tx rdk create-rollup [rollup-id] [profile] [stake-amount]
```

:::note
Les valeurs par profil ci-dessous correspondent aux valeurs par défaut des profils livrés avec **`@qorechain/rdk`**, qui reflètent la table de profils publiée du réseau. Aucun rollup n'a encore été créé sur l'un ou l'autre réseau. Interrogez les paramètres du module en direct avec `qorechaind query rdk config` (ou `RdkClient.params()` depuis le SDK, là où les routes REST du RDK sont servies — pas sur le mainnet aujourd'hui) pour obtenir la configuration faisant autorité, et validez sur le testnet **`qorechain-diana`** avant le mainnet.
:::

---

## Les profils prédéfinis

Chaque profil prédéfini regroupe un paradigme de règlement (et le système de preuve que ce règlement exige), un mode de séquenceur, un backend de disponibilité des données, un modèle de gas et une VM :

| Profil | Règlement (preuve) | Séquenceur | DA | Modèle de gas | VM | Cas d'usage prévu |
| ------- | ------------------ | --------- | -- | --------- | -- | ----------------- |
| **`defi`** | zk (SNARK) | dedicated | native | EIP-1559 | EVM | Applications DeFi et de type AMM — marchés de prêt, DEX et produits dérivés, où la finalité rapide et des frais prévisibles sont essentiels |
| **`gaming`** | based | based | native | flat | custom | État de jeu à haut débit et faible latence, et économies intra-jeu |
| **`nft`** | optimistic (fraud) | dedicated | native (Celestia DA prévu) | standard | QoreChain Native (`native`) | Frappe de NFT, places de marché et objets de collection numériques |
| **`enterprise`** | based | based | native | subsidized | EVM | Déploiements permissionnés et de consortium avec des frais pris en charge (subventionnés) |
| **`custom`** | entièrement paramétrable (par défaut : optimistic / fraud) | entièrement paramétrable | entièrement paramétrable | entièrement paramétrable | entièrement paramétrable (par défaut : EVM) | Chaque champ est défini par l'utilisateur — partez de zéro et configurez chaque option vous-même |

Quelques contraintes découlent de la [matrice règlement → preuve](/rollups/overview) : le règlement `optimistic` utilise des preuves `fraud`, `zk` utilise `snark` (ou `stark`), et `based` et `sovereign` ne comportent aucune preuve. Le règlement `based` est toujours associé au mode de séquenceur `based`. Le profil `nft` se règle aujourd'hui nativement, avec **Celestia DA prévu**.

Depuis RDK v0.4.2, l'option de VM Wasm (le runtime qui exécute les contrats CosmWasm) s'appelle **`native`** — QoreChain Native. `cosmwasm` reste un alias hérité accepté, et les deux correspondent à `cosmwasm` sur le réseau, de sorte que la chaîne, l'explorateur et le Dashboard restent inchangés.

:::note
La configuration par profil a été vérifiée par rapport à la table de profils de la chaîne à la version **v3.2.0** (le mainnet exécute la v3.2.1), où `create-rollup` applique automatiquement le préréglage du profil : **`defi` = zk + EVM, `gaming` = based + VM custom, `nft` = optimistic + QoreChain Native (Wasm), `enterprise` = based + EVM, `custom` = optimistic + EVM (valeurs par défaut)**. Le profil `custom` laisse chaque champ ouvert — les valeurs indiquées sont ses valeurs de départ par défaut.
:::

Considérez les quatre profils de domaine comme des points de départ raisonnables et le profil **`custom`** comme l'option entièrement ouverte. Les paramètres regroupés précis peuvent changer d'une version à l'autre — interrogez `rdk config` (ci-dessous) pour obtenir les valeurs faisant autorité, puis partez du profil le plus proche et affinez.

La CLI [`create-qorechain-rollup`](/rollups/deploying-a-rollup#scaffold-a-project-with-create-qorechain-rollup) génère un projet de démarrage exécutable — un modèle par profil (`defi-rollup`, `gaming-rollup`, `nft-rollup`, `enterprise-rollup`, `custom-rollup`) — afin de passer d'un profil à du code de création/requête fonctionnel en une seule commande.

---

## Ce qu'un profil prédéfini porte on-chain {#what-a-preset-carries}

Certains détails sont faciles à présumer et méritent d'être connus avant de choisir un profil :

* **`defi` n'a pas de clé de vérification.** Les lots ZK en ont besoin d'une, et un rollup créé via `create-rollup` n'en porte pas, de sorte que le règlement ZK ne peut pas être finalisé de bout en bout aujourd'hui (voir [ZK / STARK et retraits](/rollups/zk-stark-withdrawals)).
* **`nft` et `custom`** se règlent de manière optimiste avec une caution de contestation de 1 000 QOR et une fenêtre de contestation de 100 800 blocs (les 604 800 « secondes » par défaut converties à raison de 6 secondes fixes par bloc ; environ 3,7 jours avec les blocs actuels du mainnet d'environ 3,2 s).
* **`gaming` et `enterprise`** utilisent le séquencement `based`, ce qui signifie aujourd'hui que le créateur du rollup soumet les lots.
* **Le temps de bloc et les limites de transactions** (par exemple `defi` 500 ms, `gaming` 200 ms, `nft` 2 000 ms, `enterprise` et `custom` 1 000 ms) sont stockés dans l'enregistrement on-chain. Ils décrivent la chaîne propre du rollup et ne sont pas appliqués par la chaîne hôte.

---

## Choisir un profil {#getting-a-recommendation}

La requête `suggest-profile` et l'aide `suggestProfile()` du RDK sont destinées à recommander un profil à partir d'une description en langage courant. Elles reposent sur la méthode JSON-RPC `qor_suggestRollupProfile`, que les endpoints publics ne servent pas ; ainsi, `suggestProfile()` renvoie actuellement toujours `defi` comme **valeur de repli**, et `qorechaind query rdk suggest-profile` n'affiche qu'un renvoi vers ce RPC. Choisissez plutôt un profil dans le tableau ci-dessus, et confrontez-le à vos exigences (garanties de règlement, modèle de confiance du séquenceur, besoins en disponibilité des données et VM).

---

## Inspecter la configuration d'un profil on-chain

Comme les détails des profils prédéfinis sont résolus on-chain, la manière faisant autorité de voir ce à quoi un profil se résout est d'interroger le module et le rollup créé :

```bash
# Module-level parameters that govern rollup creation and defaults
qorechaind query rdk config

# After creation, inspect the resolved configuration of a specific rollup
qorechaind query rdk rollup [rollup-id]

# List all registered rollups
qorechaind query rdk list-rollups
```

Ce schéma — interroger `config` avant de déployer, puis interroger `rollup` après — vous permet de confirmer exactement ce que le profil choisi a produit, plutôt que de vous fier à des valeurs documentées susceptibles d'évoluer.

---

## Prochaines étapes

* **[Déployer un rollup](/rollups/deploying-a-rollup)** — créez un rollup à partir d'un profil via le Dashboard ou la CLI, puis gérez son cycle de vie.
* **[Vue d'ensemble des rollups](/rollups/overview)** — les paradigmes de règlement et les modes de séquenceur qu'un profil regroupe.
* **[Rollup Development Kit](/architecture/rollup-development-kit)** — la référence bas niveau du module.
