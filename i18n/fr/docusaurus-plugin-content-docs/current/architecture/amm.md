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
Les commandes ci-dessous utilisent `qorechaind`. Ajoutez les indicateurs de transaction habituels (`--from`, `--chain-id`, `--gas`, `--fees`, `--node`) pour votre environnement — par exemple `--chain-id qorechain-vladi --gas 400000 --fees 40000uqor` sur le mainnet (le plancher de frais du réseau est de 0,1 uqor par unité de gas). Chaque commande `tx amm` est une transaction de la voie Cosmos : elle nécessite donc la signature post-quantique hybride — ajoutez `--generate-only > tx.json`, puis exécutez `qorechaind tx pqc cosign tx.json --from <key> --pqc-key <name> --chain-id <id>` (voir [Première transaction](/getting-started/first-transaction#send-qor)).
:::

:::caution Aucun pool n'existe encore
Le module AMM est en production sur le mainnet (v3.2.4) et le testnet (v3.2.6), mais **aucun pool n'a encore été créé** (vérifié le 27 octobre 2026 : `GET /qorechain/amm/v1/pools` renvoie une liste vide sur les deux), et les denoms des exemples ci-dessous (`uusdc`, `uusdt`) sont illustratifs : aucun actif de ce type n'existe aujourd'hui sur les réseaux. Tant qu'aucun pool n'existe, toute commande de swap ou d'ajout de liquidité échoue avec une erreur de pool introuvable.
:::

## Paramètres du module {#parameters}

Lisez les valeurs en vigueur avec `qorechaind query amm params` ou `GET /qorechain/amm/v1/params`. Le mainnet et le testnet renvoient actuellement les mêmes valeurs :

| Paramètre | Valeur | Signification |
| --- | --- | --- |
| `enabled` | `true` | Interrupteur du module |
| `swap_fee_bps` | `30` | Frais de swap, 0,30 % du montant d'entrée |
| `protocol_fee_bps` | `10` | La part des frais de swap qui quitte le pool comme part du protocole (0,10 % de l'entrée). Le reste demeure dans le pool pour les fournisseurs de liquidité |
| `pool_creation_fee` | `100000000` | 100 QOR (en uqor), prélevés en plus des dépôts initiaux et brûlés à la création d'un pool |
| `min_liquidity` | `1000` | Le plus petit des deux dépôts initiaux d'un nouveau pool doit atteindre au moins ce nombre d'unités de base |
| `max_pools_per_creator` | `50` | Pools qu'un compte peut créer |
| `max_swap_impact_bps` | `500` | Impact de prix maximal d'un swap (5 %) ; voir [Règles de swap](#swap-rules) |
| `lp_token_decimals` | `6` | Décimales d'affichage des parts LP d'un pool (purement cosmétique : les parts LP sont des entrées de registre, pas des jetons) |

## Règles de swap appliquées depuis v3.2.2 {#swap-rules}

Les correctifs d'intégrité de l'AMM ci-dessous ont été appliqués au mainnet avec v3.2.2 (hauteur 3 556 788, 16 octobre 2026) et affinés dans v3.2.3 (hauteur 3 662 051, 20 octobre 2026). Ils s'appliquent à chaque swap, quelle que soit la voie par laquelle il arrive.

* **Les deux dénominations sont liées au pool.** Un swap doit nommer les deux denoms du pool visé. Les pools stable-swap sont tarifés avec la courbe stable-swap dans les deux sens (exact-in et exact-out).
* **Frais de protocole.** La part de protocole des frais de swap quitte le pool. Lorsqu'elle est payée en QOR, elle va au collecteur de frais et est répartie avec les autres frais du bloc (voir [Tokenomics](/architecture/tokenomics)), la part brûlée étant enregistrée sous la source de combustion `amm` ; dans toute autre dénomination, elle va au pool communautaire. Les frais de création de pool sont brûlés et enregistrés sous la même source `amm`.
* **Plafond d'impact de prix.** `max_swap_impact_bps` est appliqué : un swap dont l'impact de prix par rapport au prix du pool dépasse 5 % est refusé. Un swap qui ne fixe aucune borne de slippage (`min-out` à 0 en exact-in, ou un `max-in` qui couvre toute la réserve d'entrée en exact-out) est en outre mesuré par rapport au prix du pool au début du bloc et est refusé si des échanges antérieurs dans le même bloc l'ont déplacé au-delà du plafond. Fixez un véritable `min-out` / `max-in` sur chaque swap.
* **Travail de fin de bloc borné (v3.2.3).** À la fin de chaque bloc, le module rafraîchit le prix moyen pondéré courant d'au plus 100 pools, à tour de rôle. Tant qu'il y a 100 pools ou moins, chaque pool est rafraîchi à chaque bloc ; au-delà, la moyenne d'un pool est mise à jour une fois par tour de `ceil(pools / 100)` blocs. Cette moyenne est informative (elle est renvoyée par les requêtes `pool`) et ne modifie pas la tarification des swaps.

## Pools et parts LP

Un pool détient les réserves de deux denoms (`token_a`, `token_b`, stockés dans l'ordre trié) et enregistre des **parts LP** qui représentent une créance proportionnelle sur ces réserves. Chaque pool a un `id` numérique, un `type` et un `status` (`active` ou `paused`). Lorsque vous ajoutez de la liquidité, votre solde de parts LP dans ce pool augmente ; lorsque vous retirez de la liquidité, il diminue et vous recevez votre part des réserves.

:::note Les parts LP ne sont pas des jetons
Les parts LP sont des entrées du registre propre au module AMM, tenues par pool et par compte (la clé interne est `amm-lp/<pool id>`). Ce **ne sont ni des coins bank ni des jetons ERC-20, elles n'apparaissent pas dans votre solde bank, et elles ne peuvent être ni transférées, ni envoyées à un autre compte, ni échangées**. Lisez votre part avec la requête `lp-balance` ou la route `/lp/{address}` ci-dessous.
:::

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

`add-liquidity` dépose les deux côtés dans un pool et crédite votre solde de parts LP. Le dernier argument correspond au montant minimal de parts LP que vous accepterez — votre protection contre le décalage du ratio du pool avant que votre transaction ne soit confirmée.

```bash
qorechaind tx amm add-liquidity 1 500000000uqor 500000000uusdc 100000 \
  --from qor1youraddr... --chain-id qorechain-vladi
```

### Retirer de la liquidité

`remove-liquidity` débite des parts LP de votre solde et retire des réserves. Les deux arguments `min` fixent le montant minimal de chaque côté que vous accepterez de récupérer.

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

`pool` renvoie les réserves du pool, l'offre LP, le type, le statut et un prix moyen pondéré courant. `lp-balance` renvoie le `balance` de parts LP qu'un compte détient pour ce pool.

### Routes REST {#rest-routes}

Les mêmes lectures sont servies en REST sur le mainnet (`https://api.qore.host`) **et** sur le testnet (`https://api-testnet.qore.host`) ; elles ont été vérifiées sur les deux le 27 octobre 2026 :

| Route | Renvoie |
| --- | --- |
| `GET /qorechain/amm/v1/params` | Paramètres du module |
| `GET /qorechain/amm/v1/pools` | Tous les pools (une liste vide tant qu'aucun n'existe) |
| `GET /qorechain/amm/v1/pools/{pool_id}` | Un pool (`404` s'il est inconnu) |
| `GET /qorechain/amm/v1/pools/{pool_id}/lp/{address}` | Le solde LP d'une adresse dans le pool (`{address}` est une adresse bech32 `qor1...`) |
| `GET /qorechain/amm/v1/pool_by_denoms?denom_a=&denom_b=` | Le pool d'une paire de denoms (`404` s'il n'y en a pas) |
| `GET /qorechain/amm/v1/quote/exact_in?pool_id=&denom_in=&amount_in=` | Sortie et frais pour une entrée exacte |
| `GET /qorechain/amm/v1/quote/exact_out?pool_id=&denom_out=&amount_out=` | Entrée et frais pour une sortie exacte |

Un devis sur un pool qui n'existe pas renvoie une erreur de pool introuvable.

### Jetons Fest du testnet {#fest-tokens}

La gouvernance du testnet a enregistré trois contrats ERC-20 de test, **fUSD** (6 décimales), **fETH** (18) et **fBTC** (8), afin qu'ils existent comme coins bank avec les dénominations sensibles à la casse `erc20:<adresse du contrat EIP-55>` (listées sur la page [Faucet](/dashboard/faucet#fest-tokens)). Les détenteurs obtiennent le coin bank avec `MsgConvertERC20` (l'expéditeur doit être une adresse bech32 `qor1...`) et peuvent créer un pool contre `uqor` avec la commande habituelle `create-pool` et les 100 QOR de frais de création. Ce sont des jetons de test réservés au testnet, sans aucune valeur, et aucun pool pour eux n'existe encore (vérifié le 27 octobre 2026). Le mainnet n'a pas de tels jetons.

## Mettre en pause et reprendre un pool

Les pools peuvent être mis en pause et repris par l'autorité de gouvernance. Sur le mainnet, ces deux messages sont actuellement désactivés par le disjoncteur ; sur le testnet, ils ne le sont pas. Un pool en pause rejette les swaps et les modifications de liquidité jusqu'à sa reprise — utile pour la réponse aux incidents ou la maintenance coordonnée.


## Récapitulatif des commandes

**Transactions** (`qorechaind tx amm …`) :

| Commande | Objectif |
| --- | --- |
| `create-pool` | Créer un pool `constant_product` ou `stable_swap` |
| `add-liquidity` | Déposer des réserves et créditer des parts LP |
| `remove-liquidity` | Débiter des parts LP et retirer des réserves |
| `swap-exact-in` | Échanger un montant d'entrée fixe |
| `swap-exact-out` | Échanger vers un montant de sortie fixe |
| `pause-pool` | Mettre un pool en pause (autorité de gouvernance ; désactivé sur le mainnet) |
| `resume-pool` | Reprendre un pool en pause (autorité de gouvernance ; désactivé sur le mainnet) |

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
- Pour amener d'abord des actifs sur QoreChain, voir [Faire transiter des actifs](/user-guide/bridging-assets) (le pont n'est pas encore en production).
- Les pools peuvent aussi servir de source de prix pour les frais dans [l'abstraction du gaz](/user-guide/gas-abstraction) ; aucun token n'est accepté pour les frais aujourd'hui.
