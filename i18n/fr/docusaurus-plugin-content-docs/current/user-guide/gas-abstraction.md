---
slug: /user-guide/gas-abstraction
title: Abstraction du gas
sidebar_label: Abstraction du gas
sidebar_position: 7
---

# Abstraction du gas

Cette page décrit la fonctionnalité d'abstraction du gas de QoreChain, dont la conception permet aux utilisateurs de payer les frais de transaction dans un jeton non natif accepté au lieu de QOR. **Elle n'est utilisable sur aucun des deux réseaux aujourd'hui** ; cette page explique la conception et ce que vous devez faire à la place.

:::caution Pas encore disponible
Payer les frais dans un jeton non natif ne fonctionne **pas** aujourd'hui sur le mainnet (**`qorechain-vladi`**, version de nœud **v3.2.1**) ni sur le testnet (**`qorechain-diana`**).

* Les requêtes d'abstraction du gas ne sont pas servies sur le mainnet : `qorechaind query gasabstraction accepted-tokens` affiche son texte d'aide et la route REST `/qorechain/gasabstraction/v1/config` renvoie `Not Implemented`.
* Aucun canal IBC n'est ouvert sur l'un ou l'autre réseau, donc aucun solde `ibc/USDC` ou `ibc/ATOM` ne peut exister pour payer.
* Le plancher de frais du réseau est vérifié en `uqor`, de sorte qu'un frais dans toute autre dénomination est rejeté.

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

## Aperçu

L'abstraction du gas est conçue pour supprimer l'obligation de détenir du QOR pour payer les frais de transaction. Un utilisateur qui détient un jeton alternatif accepté (par exemple un stablecoin transféré via IBC) paierait les frais dans ce jeton, et le protocole convertirait le montant des frais en son équivalent natif avant le traitement.

---

## Conception prévue

### Jetons acceptés

La configuration de genesis du module liste ces jetons et des taux de conversion définis par le protocole. Ce sont des ratios de change à des fins de frais, et non des prix du marché. Seul `uqor` peut exister sur les réseaux aujourd'hui (voir l'avis ci-dessus).

| Jeton              | Dénomination | Taux de conversion |
| ------------------ | ------------ | ------------------ |
| **QOR**            | `uqor`       | 1.0 (natif)        |
| **USDC** (via IBC) | `ibc/USDC`   | 1.0                |
| **ATOM** (via IBC) | `ibc/ATOM`   | 10.0               |

### Fonctionnement prévu

Le `GasAbstractionDecorator` de QoreChain est intégré au pipeline de traitement des transactions. Pour une transaction dont les frais sont dans une dénomination non native :

1. **Inspection des frais** — le décorateur lit la dénomination des frais.
2. **Recherche du taux** — si la dénomination figure dans la liste des jetons acceptés, le taux de conversion correspondant est recherché.
3. **Conversion** — les frais sont convertis en leur équivalent natif `uqor`.
4. **Traitement standard** — les frais convertis passent par le gestionnaire standard de déduction des frais, de sorte que le traitement des frais en aval (distribution aux validateurs, burn, trésorerie, parts des stakers et des nœuds légers) opère sur l'équivalent natif.

---

## Interrogation de la configuration

Le mainnet ne sert pas encore les requêtes d'abstraction du gas, et la méthode JSON-RPC `qor_getGasAbstractionConfig` n'est servie sur aucun point de terminaison public (voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace)). Il n'existe actuellement aucun moyen public de lire une liste de jetons acceptés en service.
