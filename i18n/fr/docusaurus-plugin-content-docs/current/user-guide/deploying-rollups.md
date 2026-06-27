---
slug: /user-guide/deploying-rollups
title: Déploiement de rollups
sidebar_label: Déploiement de rollups
sidebar_position: 6
---

# Déploiement de rollups

Ce guide explique comment déployer des rollups spécifiques à une application sur QoreChain à l'aide du Rollup Development Kit (RDK). Le RDK fournit des profils prédéfinis pour les cas d'usage courants et une personnalisation complète pour les déploiements avancés.

:::caution
Le RDK et la couche de règlement des rollups sont une capacité en évolution active. Considérez les paramètres, les profils prédéfinis et la maturité des fonctionnalités individuelles ci-dessous comme susceptibles de changer, et validez les déploiements sur **`qorechain-diana`** avant de viser le mainnet.
:::

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.77** — substituez le chain ID et les points de terminaison du mainnet depuis la page **Connexion au Mainnet** lors d'un déploiement sur le mainnet.
:::

---

## Aperçu

Le RDK de QoreChain permet aux développeurs de lancer des rollups souverains qui se règlent sur QoreChain. Chaque rollup est un environnement d'exécution indépendant avec son propre temps de bloc, sa machine virtuelle et son modèle de frais, tout en héritant des garanties de sécurité et de disponibilité des données de QoreChain.

---

## Profils prédéfinis

Le RDK est livré avec cinq profils prédéfinis, chacun réglé pour une catégorie d'application courante :

| Profil         | Règlement (preuve)  | Séquenceur | DA              | Modèle de gas | VM       | Cas d'usage prévu |
| -------------- | ------------------- | ---------- | --------------- | ------------- | -------- | ----------------- |
| **defi**       | zk (SNARK)          | dédié      | natif           | EIP-1559      | EVM      | Applications DeFi/AMM (prêt, DEX, dérivés) |
| **gaming**     | based               | based      | natif           | forfaitaire   | custom   | État de jeu à haut débit et expériences en temps réel |
| **nft**        | optimistic (fraude) | dédié      | natif (DA Celestia prévue) | standard | CosmWasm | Charges de travail de frappe et de place de marché NFT |
| **enterprise** | based               | based      | natif           | subventionné  | EVM      | Déploiements avec permissions et consortiums avec frais sponsorisés |
| **custom**     | entièrement paramétré | entièrement paramétré | entièrement paramétré | entièrement paramétré | entièrement paramétré | Définissez chaque champ vous-même |

:::note
Les valeurs par profil ci-dessus correspondent aux valeurs par défaut des profils livrés avec `@qorechain/rdk`. La configuration exacte peut évoluer à mesure que le RDK mûrit — interrogez les valeurs faisant autorité avec `qorechaind query rdk config` (ou `RdkClient.params()`), et notez que le règlement `based` est toujours associé au mode de séquenceur `based`.
:::

---

## Prérequis

Avant de déployer un rollup, assurez-vous de remplir les conditions suivantes :

| Prérequis           | Détails                                                                                 |
| ------------------- | -------------------------------------------------------------------------------------- |
| **Mise minimale**   | 10 000 QOR (10 000 000 000 uqor)                                                       |
| **Brûlage de création** | 1 % du montant misé est définitivement brûlé lors de la création du rollup          |
| **Compte**          | Un compte QoreChain approvisionné avec un solde suffisant pour la mise plus les frais de transaction |

---

## Création d'un rollup à partir d'un profil prédéfini

Déployez un rollup en utilisant l'un des profils prédéfinis :

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-defi-rollup" \
  --profile defi \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :** Déployer un rollup de jeu :

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "battle-arena" \
  --profile gaming \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Création d'un rollup personnalisé

Pour un contrôle total sur les paramètres du rollup, utilisez le profil `custom` et spécifiez chaque option :

```bash
qorechaind tx rdk create-rollup \
  --rollup-id "my-rollup" \
  --profile custom \
  --settlement optimistic \
  --sequencer dedicated \
  --da-backend native \
  --vm-type evm \
  --block-time 1000 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Paramètres personnalisés :**

| Paramètre      | Options                                       | Description                              |
| -------------- | --------------------------------------------- | ---------------------------------------- |
| `--settlement` | `optimistic`, `zk`, `based`, `sovereign`      | Comment les transitions d'état sont vérifiées |
| `--sequencer`  | `dedicated`, `shared`, `based`                | Stratégie d'ordonnancement des transactions |
| `--da-backend` | `native`, `external`                          | Couche de disponibilité des données      |
| `--vm-type`    | `evm`, `cosmwasm`, `custom`                   | Environnement d'exécution                |
| `--block-time` | Entier (millisecondes)                        | Intervalle cible de production de blocs   |

---

## Soumission de lots

Les opérateurs de rollups soumettent des lots de transactions à QoreChain pour règlement :

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root <hex_encoded_state_root> \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :**

```bash
qorechaind tx rdk submit-batch \
  --rollup-id "my-rollup" \
  --state-root a1b2c3d4e5f6... \
  --tx-count 500 \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Gestion du cycle de vie d'un rollup

Les opérateurs de rollups peuvent gérer le cycle de vie de leurs déploiements :

1. **Mettre un rollup en pause** — Interrompt temporairement la production de blocs. L'état du rollup est préservé et peut être repris.

   ```bash
   qorechaind tx rdk pause-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

2. **Reprendre un rollup** — Reprend la production de blocs sur un rollup en pause :

   ```bash
   qorechaind tx rdk resume-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

3. **Arrêter un rollup (permanent)** — Arrête définitivement un rollup. Cette action est **irréversible**.

   ```bash
   qorechaind tx rdk stop-rollup \
     --rollup-id "my-rollup" \
     --from mykey \
     --chain-id qorechain-diana \
     --fees 500uqor
   ```

:::danger
L'arrêt d'un rollup est permanent. Tout l'état associé est archivé mais le rollup ne peut pas être redémarré. Les QOR misés (moins le brûlage de création) sont restitués à l'opérateur.
:::

---

## Interrogation des rollups

Obtenez les détails d'un rollup spécifique :

```bash
qorechaind query rdk rollup <rollup_id>
```

Listez tous les rollups sur QoreChain :

```bash
qorechaind query rdk rollups
```

**Exemple de sortie :**

```yaml
rollup:
  id: "my-defi-rollup"
  owner: qor1abc...xyz
  profile: defi
  settlement: zk
  vm_type: evm
  block_time: 500ms
  status: active
  total_batches: 1247
  last_state_root: "a1b2c3d4..."
```

---

## Suggestion de profil assistée par QCAI

Vous ne savez pas quel profil convient à votre cas d'usage ? Utilisez l'outil de suggestion assisté par QCAI :

```bash
qorechaind query rdk suggest-profile --use-case "defi lending protocol"
```

**Exemple de sortie :**

```yaml
suggested_profile: defi
confidence: 0.94
reasoning: "DeFi lending protocols benefit from ZK settlement for fast finality, EVM compatibility for Solidity smart contracts, and EIP-1559 fee model for predictable gas costs."
alternative_profile: enterprise
```

Cette commande analyse votre description et recommande le profil prédéfini le plus adapté accompagné d'une explication.

---

## Conseils

* Commencez par un profil prédéfini et personnalisez ensuite. Les profils prédéfinis sont optimisés pour leurs cas d'usage cibles.
* Le brûlage de création de 1 % est un coût unique appliqué à la mise minimale au moment du déploiement.
* Utilisez le règlement `based` si vous souhaitez la configuration la plus simple avec les validateurs QoreChain gérant le séquençage.
* Surveillez de près les soumissions de lots. Les interruptions dans la soumission de lots peuvent déclencher des alertes du réseau.
* La commande `suggest-profile` est un point de départ utile, mais comparez la recommandation à vos exigences spécifiques.
