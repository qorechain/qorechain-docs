---
slug: /user-guide/xqore-staking
title: Staking xQORE
sidebar_label: Staking xQORE
sidebar_position: 4
---

# Staking xQORE

Cette page décrit le mécanisme de staking de gouvernance xQORE tel qu'il est **conçu**, dans lequel les détenteurs de QOR verrouilleraient leurs tokens pour obtenir un pouvoir de gouvernance renforcé, selon un modèle de rebase PvP qui récompense les participants sur le long terme. **xQORE ne peut être utilisé sur aucun réseau aujourd'hui** ; rien sur cette page n'est encore réalisable.

:::warning Pas encore disponible
xQORE est activé dans la genèse mais **pas encore utilisable** sur le mainnet (`qorechain-vladi`, version du nœud **v3.2.1**) ni sur le testnet (`qorechain-diana`). Le nœud n'a aucun point d'entrée de transaction, de requête, CLI ou RPC pour lui : il n'y a donc ni `tx xqore lock` / `unlock`, ni `query xqore ...`, ni route REST xQORE, ni méthode `qor_getXQOREPosition`, aucun QOR ne peut être verrouillé, et personne ne détient de xQORE. Il est prévu pour une future version de la chaîne, qui modifiera aussi la manière dont les pénalités de sortie sont redistribuées afin que le déverrouillage reste peu coûteux quel que soit le nombre de détenteurs. La version sera indiquée ici à sa sortie.
:::

---

## Vue d'ensemble

Dans la conception, verrouiller du QOR émet du xQORE selon un **ratio de 1:1**, et le xQORE compte avec un **poids double** dans la formule de pouvoir de vote QDRW :

```
VP = sqrt(staked + 2 * xQORE) * ReputationMultiplier(r)
```

QDRW lui-même est désactivé sur les réseaux en service et les votes de gouvernance sont comptabilisés sur la seule mise en jeu (bonded) (voir [Gouvernance](/user-guide/governance#voting-power)) ; même une fois xQORE livré, il ne modifiera donc pas le pouvoir de vote tant que QDRW n'aura pas été activé par une future version.

---

## Barème de pénalité de sortie prévu

La configuration de genèse définit une pénalité de sortie qui diminue à mesure que le QOR reste verrouillé plus longtemps :

| Durée de verrouillage | Pénalité de sortie |
| ---------------------- | ------------------- |
| Moins de 30 jours      | **50%**              |
| 30 à 90 jours          | **35%**              |
| 90 à 180 jours         | **15%**              |
| Plus de 180 jours      | **0%**               |

Selon la conception, les pénalités ne sont **pas brûlées** (`penalty_burn_rate` vaut `0`) : la pénalité entière est redistribuée proportionnellement aux détenteurs de xQORE restants (le « rebase PvP »). Le mécanisme de redistribution est la partie qui changera dans la version qui intégrera xQORE.

---

## Ce qui n'est pas disponible

* **Verrouillage et déverrouillage.** Il n'existe aucune commande `tx xqore` ni aucun type de transaction pour verrouiller ou déverrouiller du QOR.
* **Positions.** Il n'existe aucune requête pour une position xQORE sur aucune interface (CLI, REST ou JSON-RPC), et `total_locked` et `total_xqore` valent tous deux zéro.
* **Bonus de vote.** Il n'y a aujourd'hui aucun bonus de vote xQORE.

Si vous souhaitez participer à la gouvernance dès maintenant, déléguez du QOR à un validateur (voir [Staking et délégation](/user-guide/staking-and-delegation)) et votez sur les propositions (voir [Gouvernance](/user-guide/governance)).
