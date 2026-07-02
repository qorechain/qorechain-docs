---
slug: /user-guide/governance
title: Gouvernance
sidebar_label: Gouvernance
sidebar_position: 3
---

# Gouvernance

Ce guide explique comment fonctionne la gouvernance on-chain sur QoreChain, y compris le système de vote Quadratic Delegation-Reputation Weighted (QDRW), comment soumettre des propositions et comment voter.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.82** — substituez le chain ID et les points de terminaison du mainnet depuis la page **Connexion au Mainnet** lors de votre participation à la gouvernance sur le mainnet.
:::

---

## Pouvoir de vote : la formule QDRW

QoreChain utilise la formule **Quadratic Delegation-Reputation Weighted (QDRW)** pour calculer le pouvoir de vote. Ce système empêche la domination des baleines tout en récompensant les participants qui ont gagné des scores de réputation élevés et qui se sont engagés dans la gouvernance via le staking de xQORE.

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

| Variable                  | Description                                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `VP`                      | Pouvoir de vote effectif                                                                                                        |
| `staked`                  | Total des jetons QOR misés par le votant                                                                                        |
| `xQORE`                   | Quantité de jetons de gouvernance xQORE détenus (voir [Staking de xQORE](/user-guide/xqore-staking))                            |
| `r`                       | Score de réputation du votant, normalisé entre \[0, 1]                                                                          |
| `ReputationMultiplier(r)` | Fonction sigmoïde associant la réputation à un multiplicateur dans la plage \[0.5, 2.0]                                         |

### Propriétés clés

* **Amortissement quadratique :** un détenteur avec 100x la mise d'un autre votant ne gagne qu'environ \~10x le pouvoir de vote, et non 100x. Cela garantit que l'influence sur la gouvernance évolue de façon sous-linéaire avec la richesse.
* **Bonus xQORE :** les jetons xQORE comptent avec un **poids de 2x** à l'intérieur de la racine carrée, conférant un avantage significatif aux participants engagés dans la gouvernance.
* **Multiplicateur de réputation :** associe le score de réputation du votant de \[0, 1] à un multiplicateur dans \[0.5, 2.0] à l'aide d'une courbe sigmoïde. Les participants à haute réputation peuvent doubler leur pouvoir de vote effectif, tandis que les participants à faible réputation voient leur influence réduite de moitié.

---

## Soumettre une proposition

Tout détenteur de QOR peut soumettre une proposition de gouvernance. Un dépôt minimal est requis pour que la proposition entre dans la période de vote.

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

## Voter sur des propositions

Une fois qu'une proposition entre dans la période de vote, tout staker peut exprimer un vote :

```bash
qorechaind tx gov vote <proposal_id> <option> \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Options de vote :**

| Option         | Description                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| `yes`          | Soutenir la proposition                                                                                  |
| `no`           | S'opposer à la proposition                                                                               |
| `abstain`      | Prendre connaissance de la proposition sans prendre position                                             |
| `no_with_veto` | S'opposer à la proposition et signaler qu'elle n'aurait pas dû être soumise (brûle le dépôt si le seuil est atteint) |

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

| Type                   | Description                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **Texte**              | Une proposition de signalement sans exécution on-chain automatique. Utilisée pour sonder le sentiment de la communauté. |
| **Changement de paramètre** | Modifie un ou plusieurs paramètres de protocole on-chain (par ex. nombre maximal de validateurs, taux d'émission). |
| **Mise à niveau logicielle** | Planifie une mise à niveau coordonnée de la chaîne à une hauteur de bloc spécifiée.       |
| **Dépense communautaire** | Demande des fonds de la trésorerie communautaire pour une adresse de destinataire spécifiée. |

---

## Interrogation des propositions

Listez toutes les propositions :

```bash
qorechaind query gov proposals
```

Interrogez une proposition spécifique par ID :

```bash
qorechaind query gov proposal <proposal_id>
```

Vérifiez le décompte actuel des votes sur une proposition :

```bash
qorechaind query gov tally <proposal_id>
```

Consultez votre propre vote sur une proposition :

```bash
qorechaind query gov vote <proposal_id> <voter_address>
```

---

## Paramètres de gouvernance

Interrogez les paramètres de gouvernance actuels :

```bash
qorechaind query gov params
```

Les paramètres clés incluent :

| Paramètre            | Description                                                      |
| -------------------- | ---------------------------------------------------------------- |
| `min_deposit`        | Dépôt minimal requis pour qu'une proposition entre en vote       |
| `max_deposit_period` | Fenêtre de temps pour atteindre le dépôt minimal                 |
| `voting_period`      | Durée de la période de vote une fois la proposition active       |
| `quorum`             | Participation minimale requise pour un vote valide               |
| `threshold`          | Pourcentage minimal de « yes » pour passer (hors abstentions)    |
| `veto_threshold`     | Pourcentage minimal de « no with veto » pour rejeter et brûler le dépôt |

---

:::tip

* Construisez votre réputation avant les votes de gouvernance majeurs pour maximiser votre multiplicateur de pouvoir de vote.
* Verrouillez des QOR en xQORE pour obtenir un bonus de poids de gouvernance de 2x à l'intérieur de la formule QDRW.
* Utilisez `no_with_veto` avec prudence. Si le seuil de veto est atteint, le dépôt de la proposition est brûlé.
* Les propositions qui n'atteignent pas le dépôt minimal dans la période de dépôt sont automatiquement supprimées.

:::
