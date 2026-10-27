---
slug: /user-guide/governance
title: Gouvernance
sidebar_label: Gouvernance
sidebar_position: 3
---

# Gouvernance

Ce guide explique le fonctionnement de la gouvernance on-chain sur QoreChain : comment les votes sont décomptés, comment soumettre des propositions et comment voter.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et exécute la version **v3.2.4** depuis le 23 octobre 2026 ; le testnet exécute la **v3.2.6** (depuis le 27 octobre 2026) — remplacez le chain ID et les endpoints du mainnet indiqués sur la page **Connecting to Mainnet** lorsque vous participez à la gouvernance sur le mainnet.
:::

:::caution Signez avec `tx pqc cosign`
Le mainnet et le testnet exigent une signature post-quantique hybride sur chaque transaction de la voie Cosmos ; les commandes de cette page ne sont donc pas diffusées telles quelles. Ajoutez `--generate-only > tx.json` à une commande, puis exécutez `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`. Voir [Signature hybride](/cli-reference/transaction-commands#hybrid-signing).
:::

---

## Pouvoir de vote {#voting-power}

Les propositions sont décomptées sur le **stake bonded** : chaque QOR que vous avez délégué à un validateur bonded compte pour une unité de pouvoir de vote, sans multiplicateur. Si vous ne votez pas vous-même, votre délégation suit le vote de votre validateur ; exprimer votre propre vote l'emporte sur celui-ci pour votre stake. Une proposition est adoptée lorsque toutes les conditions suivantes sont réunies :

| Règle     | Valeur en production | Signification                                                                 |
| --------- | -------------------- | ----------------------------------------------------------------------------- |
| Quorum    | 33.4%                | Part du stake bonded qui doit voter                                           |
| Seuil     | 50%                  | Part de « yes » parmi les votes hors abstentions nécessaire pour être adoptée |
| Veto      | 33.4%                | Si « no with veto » atteint cette part, la proposition est rejetée et son dépôt est brûlé |

Ces valeurs ont été lues sur le mainnet le 27 octobre 2026. Le testnet a les mêmes dépôts, quorum et seuils, mais des périodes de vote bien plus courtes (vote de 4 heures, vote accéléré de 1 heure) ; confirmez-les avec `qorechaind query gov params`, car la gouvernance peut les modifier.

:::note QDRW est conçu mais n'est pas actif
La conception de QoreChain inclut une formule de pouvoir de vote **Quadratic Delegation-Reputation Weighted (QDRW)**, `VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)`, qui amortirait les stakes importants et pondérerait la réputation. Elle est implémentée dans le module `x/qca` mais est **désactivée** sur les deux réseaux (`qdrw_enabled` vaut `false` dans `qorechaind query qca config`) et ne fait pas partie du décompte de gouvernance ; elle n'affecte donc aucun vote aujourd'hui. xQORE n'est pas non plus en production (voir [xQORE Staking](/user-guide/xqore-staking)).
:::

---

## Soumettre une proposition

Tout détenteur de QOR peut soumettre une proposition de gouvernance. Un dépôt minimum est requis pour que la proposition entre dans la période de vote.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Exemple de fichier de proposition** (`proposal.json`). Une proposition est une liste de messages que le module de gouvernance exécute si elle est adoptée, accompagnée d'un titre, d'un résumé et d'un dépôt. Celle-ci fait passer le nombre maximal de validateurs de 100 à 150 ; `authority` est le compte de module de gouvernance (`qorechaind query auth module-account gov`) :

```json
{
  "messages": [
    {
      "@type": "/cosmos.staking.v1beta1.MsgUpdateParams",
      "authority": "qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3",
      "params": {
        "unbonding_time": "1814400s",
        "max_validators": 150,
        "max_entries": 7,
        "historical_entries": 10000,
        "bond_denom": "uqor",
        "min_commission_rate": "0.000000000000000000"
      }
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Increase maximum validator count",
  "summary": "Raise the active validator set from 100 to 150 to improve decentralization.",
  "expedited": false
}
```

`MsgUpdateParams` remplace l'ensemble complet des paramètres : copiez donc les valeurs actuelles depuis `qorechaind query staking params` et ne modifiez que le champ voulu. Une proposition textuelle (de signalement) utilise `"messages": []`. `qorechaind tx gov draft-proposal` génère un squelette.

---

## Voter sur les propositions

Une fois qu'une proposition entre dans la période de vote, tout stakeur peut voter :

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

**Options de vote :**

| Option         | Description                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `yes`          | Soutenir la proposition                                                                                                  |
| `no`           | S'opposer à la proposition                                                                                               |
| `abstain`      | Prendre acte de la proposition sans se positionner                                                                       |
| `no_with_veto` | S'opposer à la proposition et signaler qu'elle n'aurait pas dû être soumise (brûle le dépôt si le seuil est atteint)     |

**Exemple :**

```bash
qorechaind tx gov vote 1 yes \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor
```

---

## Types de propositions

Une proposition contient zéro, un ou plusieurs messages qui s'exécutent si elle est adoptée. Cas courants :

| Type                     | Description                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Text**                 | Une proposition de signalement sans message et sans exécution on-chain automatique. Utilisée pour sonder le sentiment de la communauté. |
| **Parameter change**     | Un message `MsgUpdateParams` d'un module, envoyé par le compte de module de gouvernance. Il remplace l'ensemble complet des paramètres de ce module. |
| **Software upgrade**     | Un message `MsgSoftwareUpgrade` qui planifie une mise à niveau coordonnée de la chaîne à une hauteur de bloc spécifiée. |
| **Community spend**      | Un message `MsgCommunityPoolSpend` qui envoie des fonds du pool communautaire vers une adresse de destinataire. |
| **Expedited**            | Définissez `"expedited": true` pour une période de vote plus courte, avec un dépôt et un seuil d'adoption plus élevés (voir ci-dessous). |

---

## Interroger les propositions

Lister toutes les propositions :

```bash
qorechaind query gov proposals
```

Interroger une proposition spécifique par ID :

```bash
qorechaind query gov proposal <proposal_id>
```

Vérifier le décompte actuel des votes sur une proposition :

```bash
qorechaind query gov tally <proposal_id>
```

Consulter votre propre vote sur une proposition :

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Paramètres de gouvernance

Interroger les paramètres de gouvernance actuels :

```bash
qorechaind query gov params
```

Paramètres clés :

| Paramètre             | Description                                                             | Valeur du mainnet (27 oct. 2026) |
| --------------------- | ------------------------------------------------------------------------ | ----------------------------------- |
| `min_deposit`         | Dépôt minimum requis pour qu'une proposition entre en période de vote   | 10 QOR (`10000000uqor`)             |
| `max_deposit_period`  | Fenêtre de temps pour atteindre le dépôt minimum                        | 2 jours                             |
| `voting_period`       | Durée de la période de vote une fois la proposition active              | 2 jours                             |
| `quorum`              | Participation minimale requise pour un vote valide                      | 0.334                               |
| `threshold`           | Pourcentage minimum de « yes » pour être adoptée (abstentions exclues)  | 0.5                                 |
| `veto_threshold`      | Pourcentage minimum de « no with veto » pour rejeter et brûler le dépôt | 0.334                               |
| `expedited_voting_period` / `expedited_threshold` / `expedited_min_deposit` | Période de vote, seuil d'adoption et dépôt pour les propositions expedited | 1 jour / 0.667 / 50 QOR |

---

## La gouvernance sur le mainnet jusqu'ici {#mainnet-history}

La gouvernance du mainnet a servi à des changements de paramètres, à des décisions de disjoncteur, à des mises à niveau coordonnées et, depuis octobre 2026, à la libération de montants que la chaîne avait enregistrés lors de la mise à niveau v3.2.0. Les propositions 7 à 13 ont été adoptées sur le mainnet en octobre 2026, dont la proposition 12 (une nouvelle libération, adoptée le 21 octobre) et la proposition 13 (la mise à niveau v3.2.4, appliquée à la hauteur 3 742 566 le 23 octobre) ; la proposition 14 (une mise à niveau coordonnée vers la v3.2.5 à la hauteur 3 906 833) était en période de vote au moment de la rédaction ; la liste et les résultats se trouvent dans l'[Historique des versions](/appendix/version-history#governance-timeline), et chaque proposition peut être lue en direct à `GET /cosmos/gov/v1/proposals`.

---

:::tip

* Votez avant la fin de la période de vote ; votre vote n'est compté que s'il est émis pendant que la proposition est en période de vote.
* Utilisez `no_with_veto` avec prudence. Si le seuil de veto est atteint, le dépôt de la proposition est brûlé.
* Les propositions qui n'atteignent pas le dépôt minimum durant la période de dépôt sont automatiquement supprimées.

:::
