---
slug: /user-guide/governance
title: Gouvernance
sidebar_label: Gouvernance
sidebar_position: 3
---

# Gouvernance

Ce guide explique le fonctionnement de la gouvernance on-chain sur QoreChain, y compris le système de vote Quadratic Delegation-Reputation Weighted (QDRW), la façon de soumettre des propositions et de voter.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.92** — remplacez le chain ID et les endpoints du mainnet indiqués sur la page **Connecting to Mainnet** lorsque vous participez à la gouvernance sur le mainnet.
:::

---

## Pouvoir de vote : formule QDRW

QoreChain utilise la formule **Quadratic Delegation-Reputation Weighted (QDRW)** pour calculer le pouvoir de vote. Ce système empêche la domination des « baleines » tout en récompensant les participants ayant acquis un score de réputation élevé et s'étant engagés dans la gouvernance via le staking xQORE.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variable                  | Description                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Pouvoir de vote effectif                                                                                                         |
| `staked`                  | Total des jetons QOR mis en stake par le votant                                                                                  |
| `xQORE`                   | Montant de jetons de gouvernance xQORE détenus (voir [xQORE Staking](/user-guide/xqore-staking))                                 |
| `r`                       | Score de réputation du votant, normalisé sur \[0, 1]                                                                             |
| `ReputationMultiplier(r)` | Fonction sigmoïde qui associe la réputation à un multiplicateur compris dans la plage \[0.5, 2.0]                                |

### Propriétés clés

* **Amortissement quadratique :** un détenteur ayant 100x le stake d'un autre votant n'obtient qu'environ 10x le pouvoir de vote, et non 100x. Cela garantit que l'influence en gouvernance évolue de façon sous-linéaire par rapport à la richesse.
* **Bonus xQORE :** les jetons xQORE comptent avec une **pondération 2x** à l'intérieur de la racine carrée, ce qui donne un avantage significatif aux participants engagés dans la gouvernance.
* **Multiplicateur de réputation :** convertit le score de réputation du votant de \[0, 1] en un multiplicateur compris dans \[0.5, 2.0] à l'aide d'une courbe sigmoïde. Les participants à haute réputation peuvent doubler leur pouvoir de vote effectif, tandis que ceux à faible réputation voient leur influence réduite de moitié.

---

## Soumettre une proposition

Tout détenteur de QOR peut soumettre une proposition de gouvernance. Un dépôt minimum est requis pour que la proposition entre dans la période de vote.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple de fichier de proposition** (`proposal.json`) :

```json
{
  "title": "Increase Maximum Validator Count",
  "description": "This proposal increases the maximum active validator set from 100 to 150 to improve decentralization.",
  "type": "parameter_change",
  "changes": [
    {
      "subspace": "staking",
      "key": "MaxValidators",
      "value": "150"
    }
  ],
  "deposit": "10000000uqor"
}
```

---

## Voter sur les propositions

Une fois qu'une proposition entre dans la période de vote, tout stakeur peut voter :

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
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
  --fees 500uqor
```

---

## Types de propositions

QoreChain prend en charge les types de propositions de gouvernance suivants :

| Type                     | Description                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Text**                 | Une proposition de signalement sans exécution on-chain automatique. Utilisée pour sonder le sentiment de la communauté. |
| **Parameter Change**     | Modifie un ou plusieurs paramètres du protocole on-chain (par ex. nombre max de validateurs, taux d'émission). |
| **Software Upgrade**     | Planifie une mise à niveau coordonnée de la chaîne à une hauteur de bloc spécifiée.                       |
| **Community Spend**      | Demande des fonds du trésor communautaire pour une adresse de destinataire spécifiée.                     |

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

| Paramètre             | Description                                                             |
| --------------------- | ------------------------------------------------------------------------ |
| `min_deposit`         | Dépôt minimum requis pour qu'une proposition entre en période de vote   |
| `max_deposit_period`  | Fenêtre de temps pour atteindre le dépôt minimum                        |
| `voting_period`       | Durée de la période de vote une fois la proposition active              |
| `quorum`              | Participation minimale requise pour un vote valide                      |
| `threshold`           | Pourcentage minimum de « yes » pour être adoptée (abstentions exclues)  |
| `veto_threshold`      | Pourcentage minimum de « no with veto » pour rejeter et brûler le dépôt |

---

:::tip

* Construisez votre réputation avant les votes de gouvernance majeurs afin de maximiser votre multiplicateur de pouvoir de vote.
* Verrouillez du QOR en xQORE pour obtenir un bonus de pondération 2x en gouvernance dans la formule QDRW.
* Utilisez `no_with_veto` avec prudence. Si le seuil de veto est atteint, le dépôt de la proposition est brûlé.
* Les propositions qui n'atteignent pas le dépôt minimum durant la période de dépôt sont automatiquement supprimées.

:::
