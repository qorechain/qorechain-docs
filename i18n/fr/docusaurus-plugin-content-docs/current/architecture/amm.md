---
slug: /architecture/amm
title: AMM et liquidité on-chain
sidebar_label: AMM et liquidité on-chain
sidebar_position: 8
---

# AMM et liquidité on-chain

Le module `x/amm` est le teneur de marché automatisé (AMM) natif et on-chain de QoreChain. Il permet à quiconque de créer des pools de liquidité, de fournir de la liquidité et d'échanger des actifs natifs de QoreChain directement au niveau du protocole — sans carnet d'ordres off-chain ni DEX à contrat externe. C'est la couche de règlement on-chain derrière l'expérience **Trade / DEX du Dashboard**.

Les pools suivent des courbes de tarification AMM classiques :

- **`constant_product`** — la courbe `x*y=k` (paires polyvalentes).
- **`stable_swap`** — une courbe à faible slippage pour des paires étroitement arrimées, réglée par un coefficient d'amplification.

Tous les montants utilisent les unités natives de QoreChain. Le jeton de staking et de frais est **QOR**, dont le denom de base est **uqor** (1 QOR = 10^6 uqor). Les participants aux pools et les adresses utilisent le préfixe bech32 `qor`.

:::note
Les commandes ci-dessous utilisent `qorechaind`. Ajoutez les indicateurs de transaction habituels (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) pour votre environnement — par exemple `--chain-id qorechain-vladi` sur le mainnet.
:::

## Pools et parts LP

Un pool détient les réserves de deux denoms (`token_a`, `token_b`, stockés dans l'ordre trié) et émet des **jetons LP** qui représentent une créance proportionnelle sur ces réserves. Chaque pool a un `id` numérique, un `type`, un `status` (`active` ou `paused`), et son propre denom LP. Lorsque vous ajoutez de la liquidité, vous recevez des jetons LP ; lorsque vous retirez de la liquidité, vous les brûlez pour récupérer votre part des réserves.

### Créer un pool

`create-pool` prend un type de pool et les deux dépôts initiaux (sous forme de coins). Pour une paire stable, définissez le coefficient d'amplification avec `--amp`.

```bash
# Constant-product pool seeded with QOR and a bridged USD asset
qorechaind tx amm create-pool constant_product 1000000000uqor 1000000000uusdc \
  --from qor1youraddr... --chain-id qorechain-vladi

# Stable-swap pool with an amplification coefficient
qorechaind tx amm create-pool stable_swap 1000000000uusdc 1000000000uusdt \
  --amp 200 --from qor1youraddr... --chain-id qorechain-vladi
```

### Ajouter de la liquidité

`add-liquidity` dépose les deux côtés dans un pool et émet des jetons LP. Le dernier argument correspond au montant LP minimal que vous accepterez — votre protection contre le décalage du ratio du pool avant que votre transaction ne soit confirmée.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Retirer de la liquidité

`remove-liquidity` brûle des jetons LP et retire des réserves. Les deux arguments `min` fixent le montant minimal de chaque côté que vous accepterez de récupérer.

```bash
qorechaind tx amm remove-liquidity 1 100000 490000000 490000000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

## Swaps

L'AMM prend en charge les deux directions de swap standard.

### Exact-in

`swap-exact-in` dépense un montant d'entrée fixe et renvoie le montant de sortie que la courbe produit, sous réserve d'un plancher de sortie minimal (protection contre le slippage).

```bash
# Spend exactly 1,000,000 uqor for uusdc, refusing anything below 990,000 uusdc out
qorechaind tx amm swap-exact-in 1 1000000uqor uusdc 990000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Exact-out

`swap-exact-out` demande un montant de sortie fixe et dépense autant d'entrée que nécessaire, sous réserve d'un plafond d'entrée maximal.

```bash
# Receive exactly 1,000,000 uusdc, spending at most 1,010,000 uqor
qorechaind tx amm swap-exact-out 1 uqor 1000000uusdc 1010000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

L'argument final `min-out` / `max-in` de chaque swap est la garde anti-slippage : fixez-le à partir d'un devis frais (ci-dessous) majoré de votre tolérance, et la transaction est annulée si le prix exécuté venait à le dépasser.

## Devis (aperçu de prix)

Les devis sont en lecture seule — ils prévisualisent un swap sans le soumettre, afin qu'un client puisse afficher une sortie attendue et des frais avant que l'utilisateur ne signe. Ils constituent le support naturel du champ de prix d'une interface Trade.

```bash
# Preview the output of spending 1,000,000 uqor into pool 1
qorechaind query amm quote-exact-in 1 uqor 1000000
# -> returns amount_out and fee

# Preview the input needed to receive 1,000,000 uusdc from pool 1
qorechaind query amm quote-exact-out 1 uusdc 1000000
# -> returns amount_in and fee
```

Le `fee` renvoyé correspond aux frais de swap que l'AMM applique à la transaction. Les niveaux de frais et de slippage dépendent du pool/des paramètres ; utilisez les points de terminaison de devis pour voir leur effet concret sur une transaction donnée plutôt que de les calculer à la main.

## Inspecter les pools et les soldes

Toutes ces requêtes sont en lecture seule et peuvent être exécutées par quiconque.

```bash
# Module parameters
qorechaind query amm params

# A single pool by ID
qorechaind query amm pool 1

# Every pool
qorechaind query amm pools

# Resolve a pool from its denom pair (order-independent)
qorechaind query amm pool-by-denoms uqor uusdc

# An account's LP balance in a pool
qorechaind query amm lp-balance 1 qor1youraddr...
```

`pool` renvoie les réserves du pool, l'offre LP, le type, le statut et un prix moyen pondéré courant. `lp-balance` renvoie le `balance` de jetons LP qu'un compte détient pour ce pool.

## Mettre en pause et reprendre un pool

Les pools peuvent être mis en pause et repris par l'autorité du pool (l'adresse passée via `--from`). Un pool en pause rejette les swaps et les modifications de liquidité jusqu'à sa reprise — utile pour la réponse aux incidents ou la maintenance coordonnée.

```bash
# Pause pool 1 with a human-readable reason
qorechaind tx amm pause-pool 1 "scheduled maintenance" \
  --from qor1authority... --chain-id qorechain-vladi

# Resume pool 1
qorechaind tx amm resume-pool 1 \
  --from qor1authority... --chain-id qorechain-vladi
```

## Récapitulatif des commandes

**Transactions** (`qorechaind tx amm …`) :

| Commande | Objectif |
| --- | --- |
| `create-pool` | Créer un pool `constant_product` ou `stable_swap` |
| `add-liquidity` | Déposer des réserves et émettre des jetons LP |
| `remove-liquidity` | Brûler des jetons LP et retirer des réserves |
| `swap-exact-in` | Échanger un montant d'entrée fixe |
| `swap-exact-out` | Échanger vers un montant de sortie fixe |
| `pause-pool` | Mettre un pool en pause (autorité) |
| `resume-pool` | Reprendre un pool en pause (autorité) |

**Requêtes** (`qorechaind query amm …`) :

| Commande | Objectif |
| --- | --- |
| `params` | Afficher les paramètres du module |
| `pool` | Afficher un pool par son ID |
| `pools` | Lister tous les pools |
| `pool-by-denoms` | Résoudre un pool à partir de sa paire de denoms |
| `lp-balance` | Le solde LP d'un compte dans un pool |
| `quote-exact-in` | Prévisualiser la sortie pour un swap à entrée fixe |
| `quote-exact-out` | Prévisualiser l'entrée pour un swap à sortie fixe |

## Voir aussi

- Le **Trade / DEX du Dashboard** expose ces pools, devis et swaps dans une interface graphique pour les utilisateurs au quotidien.
- Pour comprendre comment l'offre de QOR, les frais et la valeur circulent à travers la chaîne, voir [Tokenomics](/architecture/tokenomics).
- Essayez les swaps vous-même dans l'interface [Trade / DEX](/dashboard/trade).
- Pour amener d'abord des actifs sur QoreChain, voir [Faire transiter des actifs](/user-guide/bridging-assets).
