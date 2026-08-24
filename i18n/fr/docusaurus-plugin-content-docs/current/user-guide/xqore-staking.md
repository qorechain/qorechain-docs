---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Ce guide couvre le mécanisme de staking de gouvernance xQORE, qui permet aux détenteurs de QOR de verrouiller leurs tokens pour obtenir un pouvoir de gouvernance renforcé, avec un modèle de rebase PvP qui récompense les participants sur le long terme.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (chain ID EVM **9800**). Le mainnet (**`qorechain-vladi`**, chain ID EVM **9801**) est en production depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.92** — remplacez le chain ID et les endpoints du mainnet indiqués sur la page **Connexion au Mainnet** lors d'un staking sur mainnet.
:::

---

## Vue d'ensemble

xQORE est le token de staking de gouvernance de QoreChain. Lorsque vous verrouillez du QOR, vous recevez du xQORE selon un **ratio de 1:1**. Détenir du xQORE offre un avantage significatif en matière de gouvernance : les tokens xQORE comptent avec un **poids double** dans la formule de pouvoir de vote QDRW (voir [Gouvernance](/user-guide/governance)).

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

Cela signifie que verrouiller du QOR en xQORE double effectivement son impact en gouvernance par rapport au staking classique seul.

---

## Verrouiller du QOR pour obtenir du xQORE

Verrouillez des tokens QOR pour émettre du xQORE selon un ratio de 1:1 :

```bash
qorechaind tx xqore lock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :** Verrouiller 1 000 QOR :

```bash
qorechaind tx xqore lock 1000000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

Après cette transaction, votre compte détiendra 1 000 000 000 uxqore (1 000 xQORE).

---

## Déverrouiller du xQORE

Brûlez du xQORE pour récupérer du QOR. Une **pénalité de sortie** peut s'appliquer selon la durée pendant laquelle les tokens ont été verrouillés :

```bash
qorechaind tx xqore unlock <amount>uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

**Exemple :** Déverrouiller 500 xQORE :

```bash
qorechaind tx xqore unlock 500000000uqor \
  --from mykey \
  --chain-id qorechain-diana \
  --fees 500uqor
```

---

## Barème de pénalité de sortie

Un retrait anticipé du xQORE entraîne une pénalité. Plus vous conservez vos tokens longtemps, plus la pénalité est faible :

| Durée de verrouillage | Pénalité de sortie |
| ---------------------- | ------------------- |
| Moins de 30 jours      | **50%**              |
| 30 à 90 jours          | **35%**              |
| 90 à 180 jours         | **15%**              |
| Plus de 180 jours      | **0%**               |

**Exemple :** Si vous avez verrouillé 1 000 QOR et déverrouillez après 45 jours, vous recevez 650 QOR (pénalité de 35% appliquée). Les 350 QOR restants sont redistribués aux autres détenteurs de xQORE via le mécanisme de rebase PvP.

---

## Mécanisme de rebase PvP

Les pénalités collectées lors des sorties anticipées ne sont **pas brûlées**. Elles sont au contraire redistribuées proportionnellement à tous les détenteurs de xQORE restants. Cela crée une dynamique « joueur contre joueur » où les détenteurs patients profitent de l'impatience des autres.

Fonctionnement :

1. Un utilisateur déverrouille du xQORE avant d'atteindre le seuil de 180 jours de pénalité nulle.
2. La pénalité de sortie est déduite du QOR qui lui est retourné.
3. Le montant de la pénalité est distribué proportionnellement entre toutes les positions xQORE restantes.
4. Le QOR réclamable par xQORE de chaque détenteur restant augmente.

Ce mécanisme incite à un engagement de gouvernance sur le long terme et récompense les détenteurs qui maintiennent leurs positions.

---

## Consulter votre position

Vérifiez votre position xQORE actuelle, la durée de verrouillage et la pénalité de sortie applicable :

```bash
qorechaind query xqore position <address>
```

**Exemple :**

```bash
qorechaind query xqore position qor1abc...xyz
```

**Exemple de résultat :**

```yaml
position:
  address: qor1abc...xyz
  locked_amount: "1000000000"
  xqore_balance: "1000000000"
  lock_timestamp: "2026-01-15T12:00:00Z"
  current_penalty_rate: "0.150000000000000000"
  accrued_rebase: "25000000"
```

---

## Accès JSON-RPC

Pour les applications s'intégrant à QoreChain via JSON-RPC, la position xQORE peut être consultée à l'aide de :

```
qor_getXQOREPosition
```

**Requête :**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getXQOREPosition",
  "params": ["qor1abc...xyz"],
  "id": 1
}
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "locked_amount": "1000000000",
    "xqore_balance": "1000000000",
    "lock_timestamp": "2026-01-15T12:00:00Z",
    "current_penalty_rate": "0.15",
    "accrued_rebase": "25000000"
  }
}
```

---

## Conseils

* Verrouillez du QOR en xQORE bien avant les votes de gouvernance importants pour maximiser votre pouvoir de vote.
* Le seuil de 180 jours pour une sortie sans pénalité récompense les participants patients à la gouvernance.
* Surveillez les accumulations de rebase PvP. Lorsque d'autres sortent tôt, votre position gagne en valeur.
* xQORE n'est pas transférable. Il ne peut être émis qu'en verrouillant du QOR et brûlé qu'en le déverrouillant.
* Réfléchissez attentivement à la pénalité de sortie avant de verrouiller. Les verrouillages de courte durée entraînent des pénalités importantes.
