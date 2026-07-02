---
slug: /user-guide/gas-abstraction
title: Abstraction du gas
sidebar_label: Abstraction du gas
sidebar_position: 7
---

# Abstraction du gas

Ce guide couvre la fonctionnalité d'abstraction du gas de QoreChain, qui permet aux utilisateurs de payer les frais de transaction dans des jetons non natifs au lieu de QOR.

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) est en service depuis le 7 juin 2026 et exécute la version de chaîne **v3.1.82** — substituez le chain ID et les points de terminaison du mainnet depuis la page **Connexion au Mainnet** lors de transactions sur le mainnet.
:::

---

## Aperçu

L'abstraction du gas supprime l'obligation de détenir des jetons QOR pour payer les frais de transaction. Les utilisateurs qui détiennent des jetons alternatifs acceptés (tels que l'USDC ou l'ATOM transférés via IBC) peuvent utiliser ces jetons directement comme paiement de frais. Le protocole convertit automatiquement le montant des frais en son équivalent natif avant le traitement.

---

## Jetons acceptés

Les jetons suivants sont acceptés pour le paiement des frais :

| Jeton              | Dénomination | Taux de conversion | Exemple de frais     |
| ------------------ | ------------ | ------------------ | -------------------- |
| **QOR**            | `uqor`       | 1.0 (natif)        | `--fees 500uqor`     |
| **USDC** (via IBC) | `ibc/USDC`   | 1.0                | `--fees 500ibc/USDC` |
| **ATOM** (via IBC) | `ibc/ATOM`   | 10.0               | `--fees 50ibc/ATOM`  |

:::note
Les taux de conversion reflètent le ratio de change défini par le protocole, et non les prix du marché. Un taux de 10.0 pour ATOM signifie qu'1 unité d'ibc/ATOM équivaut à 10 unités d'uqor à des fins de frais.
:::

---

## Fonctionnement

Le `GasAbstractionDecorator` de QoreChain est intégré au pipeline de traitement des transactions. Lorsqu'une transaction inclut des frais dans une dénomination non native, voici ce qui se passe :

1. **Inspection des frais** — Le décorateur vérifie la dénomination des frais spécifiée dans la transaction.
2. **Recherche du taux** — Si la dénomination figure dans la liste des jetons acceptés, le protocole recherche le taux de conversion correspondant.
3. **Conversion** — Le montant des frais est converti en son équivalent natif uqor à l'aide du taux de conversion.
4. **Traitement standard** — Les frais convertis sont transmis au gestionnaire standard `DeductFee` pour déduction du compte de l'expéditeur. La conversion est transparente pour le reste du pipeline de transaction. Tout le traitement des frais en aval (distribution aux validateurs, brûlage, allocation à la trésorerie, récompenses des stakers et récompenses des nœuds légers) opère sur l'équivalent natif uqor.

---

## Exemples d'utilisation

### Payer les frais en USDC

Envoyez un transfert de jetons avec des frais payés en USDC :

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

Comme l'USDC a un taux de conversion de 1.0, 500 ibc/USDC équivaut à 500 uqor.

### Payer les frais en ATOM

Envoyez un transfert de jetons avec des frais payés en ATOM :

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

Comme l'ATOM a un taux de conversion de 10.0, 50 ibc/ATOM équivaut à 500 uqor.

---

## Interrogation des jetons acceptés

Récupérez la liste des jetons actuellement acceptés pour l'abstraction du gas, ainsi que leurs taux de conversion :

```bash
qorechaind query gasabstraction accepted-tokens
```

**Exemple de sortie :**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## Accès JSON-RPC

Pour les applications intégrées via JSON-RPC, interrogez la configuration de l'abstraction du gas :

```
qor_getGasAbstractionConfig
```

**Requête :**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**Réponse :**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* L'abstraction du gas est idéale pour les utilisateurs arrivant d'autres écosystèmes qui ne détiennent pas encore de QOR.
* Les taux de conversion sont définis par la gouvernance et peuvent être mis à jour via des propositions de changement de paramètres.
* Si vous détenez plusieurs jetons acceptés, n'importe lequel d'entre eux peut être utilisé pour les frais sur n'importe quel type de transaction.
* Le jeton effectivement spécifié dans `--fees` est déduit de votre compte. La conversion sert uniquement à valider que les frais respectent l'exigence minimale.

:::
