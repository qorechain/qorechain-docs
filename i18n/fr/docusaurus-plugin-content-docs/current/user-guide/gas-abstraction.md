---
slug: /user-guide/gas-abstraction
title: Abstraction du gas
sidebar_label: Abstraction du gas
sidebar_position: 7
---

# Abstraction du gas

L'abstraction du gas permet à un utilisateur de payer les frais de transaction dans un jeton non natif accepté au lieu de QOR. Le code de conversion des frais fait partie de la chaîne, mais **aucun jeton non natif n'est accepté sur l'un ou l'autre réseau aujourd'hui** ; chaque frais est donc payé en QOR. Cette page explique ce qui est en service, comment fonctionne la conversion telle qu'elle est construite, et ce que vous devez faire à la place.

:::caution Pas encore utilisable : payez chaque frais en uqor
Sur le mainnet (**`qorechain-vladi`**) et sur le testnet (**`qorechain-diana`**), respectivement en version de nœud **v3.2.4** et **v3.2.6**, vérifié le 27 octobre 2026 :

* La liste des jetons acceptés en service ne contient **que `uqor`**. La conversion des frais a été activée avec la v3.2.2, mais rien d'autre n'est listé, le plafond de conversion par bloc vaut `0` (conversion désactivée) et le float de conversion ne détient aucun solde. Un frais payé dans toute autre dénomination est refusé avec une erreur « denom not accepted for fee payment », en simulation comme dans une transaction réelle.
* Aucun canal IBC n'existe sur le mainnet, et l'unique canal de test du testnet ne fait d'aucun jeton `ibc/…` un jeton de frais accepté (la liste est `uqor` uniquement) : il n'y a donc rien d'autre que `uqor` pour payer.

Payez chaque frais en `uqor`. Cette page sera mise à jour lorsqu'un jeton sera accepté sur un réseau en service.
:::

---

## Ce qui fonctionne aujourd'hui : payer les frais en uqor

Chaque transaction paie au moins **0.1 uqor par unité de gas**. Définissez ensemble la limite de gas et les frais :

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --gas 400000 --fees 40000uqor \
  --chain-id qorechain-vladi --generate-only > tx.json
```

Signez-la ensuite en mode hybride et diffusez-la avec `qorechaind tx pqc cosign`, comme décrit dans [Commandes de transaction](/cli-reference/transaction-commands#hybrid-signing). Voir [Frais et gas](/cli-reference/transaction-commands#fees-and-gas) pour les limites suggérées par type de transaction.

---

## La configuration en service {#live-configuration}

Le module sert sa configuration via REST et gRPC. Voici les valeurs sur les deux réseaux au 27 octobre 2026 :

| Champ | Valeur | Signification |
| --- | --- | --- |
| `enabled` | `true` | Interrupteur du module |
| `native_denom` | `uqor` | La dénomination dans laquelle chaque frais est finalement payé |
| `accepted_tokens` | `uqor` uniquement | Jetons pouvant payer un frais. `uqor` n'a besoin d'aucune source de prix |
| `premium_bps` | `300` | La part de la valeur d'un frais converti que le float conserve pour couvrir son risque de prix (3 %) |
| `max_tip_multiplier` | `3` | Un frais converti ne peut pas dépasser ce multiple du frais minimal pour son gas ; `0` signifierait aucune borne |
| `float_min` | `0` | Le solde natif que le float garde toujours en réserve |
| `block_conversion_cap` | `0` | Le maximum que le float verse par bloc ; `0` signifie que la conversion est désactivée |

Les versions antérieures de cette page montraient des entrées fictives `ibc/USDC` et `ibc/ATOM` avec des taux fixes. Elles ne figurent pas dans la liste en service.

Lisez-la vous-même :

```bash
qorechaind query gasabstraction config
qorechaind query gasabstraction accepted-tokens
qorechaind query gasabstraction conversion-rate uqor
qorechaind query gasabstraction float

curl -s https://api.qore.host/qorechain/gasabstraction/v1/config
curl -s "https://api.qore.host/qorechain/gasabstraction/v1/conversion_rate?denom=uqor"
curl -s https://api.qore.host/qorechain/gasabstraction/v1/float
```

`conversion_rate` renvoie `rate`, `effective_rate` (le taux moins la prime), `price_source`, et indique si le jeton est `usable` à cette hauteur, avec une `reason` lorsqu'il ne l'est pas. `float` renvoie l'adresse et les soldes du float ainsi que l'usage du bloc courant par rapport à `block_cap`. La méthode JSON-RPC `qor_getGasAbstractionConfig` n'est servie sur aucun point de terminaison public (voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace)) ; utilisez REST ou gRPC.

---

## Fonctionnement de la conversion (telle que construite) {#how-it-works}

Depuis la v3.2.2, le décorateur de frais oriente chaque transaction sur l'un de deux chemins :

* Un frais en `uqor`, ou en plus d'une dénomination, emprunte le **chemin natif**, inchangé.
* Un frais dans **exactement une** dénomination non native emprunte le **chemin de conversion**.

Sur le chemin de conversion :

1. **Accepté ?** La dénomination doit figurer dans la liste des jetons acceptés et disposer d'une source de prix, faute de quoi la transaction est refusée.
2. **Prix.** Le prix du jeton provient de l'une de deux sources : un taux statique fixé par la gouvernance qui expire à une hauteur de bloc indiquée, ou le prix moyen pondéré dans le temps du pool [AMM](/architecture/amm) qui apparie le jeton avec le QOR. Un prix de pool n'est utilisé que si le pool est actif, détient au moins la liquidité minimale configurée du côté QOR, et si son prix spot se situe dans l'écart configuré par rapport à sa moyenne.
3. **Valeur.** La valeur native du frais est le montant du jeton multiplié par le prix, moins la prime.
4. **Mêmes règles qu'un frais natif.** Les règles de frais minimal et de frais dynamique natives sont appliquées à cette valeur native ; un frais converti doit donc franchir exactement ce qu'un frais en QOR doit franchir (0.1 uqor par unité de gas comme plancher), et est borné par `max_tip_multiplier`.
5. **Règlement.** Les jetons du payeur vont au **float** du module d'abstraction du gas, et le float verse la valeur native en `uqor` au collecteur de frais. Tout ce qui se trouve en aval du collecteur de frais (burn, parts des validateurs, des stakers, de la trésorerie et des nœuds légers) ne voit donc jamais que de l'`uqor`.

La conversion est bornée de trois façons : par transaction (`max_tip_multiplier`), par bloc (`block_conversion_cap`) et par le solde que le float garde toujours en réserve (`float_min`). Chaque refus se produit aussi pendant la simulation, de sorte que l'estimation du gas échoue de la même manière que la transaction réelle.

### Faire accepter un jeton

* **La gouvernance** remplace la configuration au moyen de `MsgUpdateConfig` (autorité : le compte de module de gouvernance). C'est ainsi qu'un véritable jeton de frais `ibc/<hash>` et son pool ou son taux statique seraient ajoutés et que la conversion serait ouverte.
* **Le float** est un compte de module qui refuse les envois bancaires ordinaires. Il est alimenté avec `MsgFundFloat` (`qorechaind tx gasabstraction fund-float <amount>uqor`), par exemple par un compte ayant reçu une dépense du pool communautaire à cette fin.

Aucune proposition en ce sens n'a été faite sur le mainnet, et la liste reste limitée à `uqor` tant qu'une proposition n'a pas été adoptée.
