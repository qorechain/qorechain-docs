---
slug: /developer-guide/running-a-validator
title: Exécution d'un validateur
sidebar_label: Exécution d'un validateur
sidebar_position: 9
---

# Exécution d'un validateur

Ce guide explique comment créer un validateur sur le réseau QoreChain, comprendre la conception de la classification des pools, enregistrer une clé PQC (signatures hybrides ML-DSA-87, FIPS 204), et surveiller votre nœud.

:::note
Ce guide cible le mainnet **`qorechain-vladi`** (EVM chain ID **9801**), actif depuis le 7 juin 2026, qui exécute la version de nœud **v3.2.5** (appliquée par la proposition de gouvernance 14 à la hauteur 3 906 833 le 29 octobre 2026, après la v3.2.4 à la hauteur 3 742 566 le 23 octobre 2026 et la v3.2.3 à la hauteur 3 662 051 le 20 octobre 2026). Un validateur doit exécuter le binaire v3.2.5 (le `minCompatible` du manifeste est 3.2.5) ; un nœud encore en v3.2.4 s'arrête à la hauteur 3 906 833 et a besoin du bundle v3.2.5 (voir [Exécuter un nœud : mises à niveau](/developer-guide/running-a-node#upgrades)). Le testnet **`qorechain-diana`** (EVM chain ID **9800**) exécute la v3.2.6 (appliquée le 27 octobre 2026, après la v3.2.5 le 26 octobre) et est recommandé pour répéter votre configuration avant la mise en production. Remplacez `--chain-id` par la valeur appropriée pour votre réseau cible. Les temps de bloc diffèrent : environ 3,1 s sur le mainnet (les 1 000 derniers blocs ont pris 52 minutes 21 secondes le 27 octobre 2026) et environ 1,3 s sur le testnet ; les deux varient, convertissez donc les nombres de blocs en durée pour chaque réseau.
:::

:::caution Utilisez le binaire de release, pas une compilation depuis les sources
Un validateur doit exécuter le **`qorechaind` de release** indiqué dans le manifeste en ligne (`https://download.qore.host/mainnet/latest.json` ; voir [Exécution d'un nœud](/developer-guide/running-a-node#fetch-the-manifest)). Un binaire compilé à partir des sources publiques contient des keepers factices et n'a pas de signataire post-quantique : il ne peut ni reproduire l'état de consensus du réseau, ni créer la signature hybride dont `create-validator` et toute autre transaction de la voie Cosmos ont besoin (voir [Compilation depuis les sources](/developer-guide/building-from-source)). À partir de la v3.2.3, un binaire compilé à partir des sources publiques refuse tout simplement de démarrer sur un réseau public. Un nouveau nœud mainnet requiert la v3.2.0 ou une version ultérieure ; gardez l'horloge système synchronisée par NTP, car à partir de la v3.2.1 le nœud s'arrête lorsque son horloge dérive de plus de 60 secondes.
:::

:::note Quelles parties de cette page sont actives
La production de blocs utilise la rotation standard des validateurs pondérée par la mise, et le slashing et la gouvernance utilisent les modules Cosmos SDK standard avec les paramètres indiqués ci-dessous. La logique CPoS à trois pools (classification des pools, sélection du proposant pondérée par pool, courbe de bonding et slashing progressif) est implémentée dans le module `x/qca` et ses paramètres sont on-chain, mais elle n'est **pas encore branchée à la production de blocs, aux récompenses ni au slashing**. Les sections sur ces sujets décrivent la conception ; ne planifiez pas en vous appuyant sur l'appartenance à un pool ou sur la réputation pour modifier aujourd'hui votre part de propositions de blocs ou vos récompenses.
:::

---

## Prérequis

* Un nœud `qorechaind` de release entièrement synchronisé (voir [Connexion au mainnet](/getting-started/connecting-to-mainnet), ou [Connexion au testnet](/getting-started/connecting-to-testnet) pour répéter)
* Une **clé PQC ML-DSA-87 enregistrée** sur le compte opérateur (voir [Enregistrement de la clé PQC](#pqc-key-registration)) — `create-validator` exige la signature hybride
* Un compte approvisionné avec au moins **100 000 QOR** (100 000 000 000 uqor) pour l'auto-délégation initiale — ce minimum est appliqué on-chain et `create-validator` est rejeté en dessous de ce seuil
* Un **octroi `validator_operator`** actif sur votre adresse d'opérateur, émis via le [Validator Program](/dashboard/tools-hub#validator-application) de la page **Nodes & Validators** du Dashboard (candidater, être sélectionné, payer les frais de programme de $1,000) ; voir la note ci-dessous. Sans lui, `create-validator` échoue avec `ErrUnauthorized` quel que soit le montant de QOR auto-misé
* Une bonne connaissance du modèle de [Staking et délégation](/user-guide/staking-and-delegation)

---

## Rejoindre le réseau {#joining}

**Utilisez le state sync comme méthode par défaut pour rejoindre le réseau.** Il récupère auprès des pairs un état applicatif récent au lieu de rejouer chaque bloc depuis la genèse. Le téléchargement de snapshot n'est qu'une solution de repli : le snapshot du manifeste mainnet est toujours l'archive du 21 août 2026 (hauteur 1 966 629, environ 27 Go), qui précède plusieurs mises à niveau et doit ensuite rejouer environ deux mois de blocs, et le testnet ne publie aucun snapshot.

1. Installez le `qorechaind` de release que nomme le manifeste (voir [Exécution d'un nœud](/developer-guide/running-a-node#fetch-the-manifest)), exécutez `qorechaind init <moniker> --chain-id qorechain-vladi`, puis placez la genèse, les pairs et les seeds du manifeste comme décrit à cet endroit, et définissez `minimum-gas-prices = "0.1uqor"` dans `app.toml`.
2. Prenez le point de confiance dans le manifeste et écrivez la section `[statesync]` de `config.toml` :

```bash
curl -s https://download.qore.host/mainnet/latest.json -o latest.json
TRUST_HEIGHT=$(jq -r .stateSync.trustHeight latest.json)
TRUST_HASH=$(jq -r .stateSync.trustHash latest.json)
```

```toml
[statesync]
enable = true
rpc_servers = "https://rpc.qore.host:443,https://<a second RPC you run or trust>:26657"
trust_height = <TRUST_HEIGHT>
trust_hash = "<TRUST_HASH>"
trust_period = "168h0m0s"
```

3. Si vous le souhaitez, gardez le disque petit (voir [Matériel](#hardware)) : dans `app.toml`, définissez `pruning = "custom"` avec `pruning-keep-recent = "100000"` et `pruning-interval = "10"`, et dans `config.toml` définissez `indexer = "null"` sous `[tx_index]` (un validateur ne sert aucune recherche de transaction ; n'utilisez pas `null` sur un nœud que vous interrogez).
4. Démarrez avec `qorechaind start --minimum-gas-prices=0.1uqor` et attendez que `catching_up` passe à `false`.

:::warning Le state sync a besoin de deux serveurs RPC différents
Le state sync recoupe le point de confiance auprès de **deux** serveurs RPC. Le champ `stateSync.rpcServers` du manifeste liste `https://rpc.qore.host` **deux fois** (et le manifeste du testnet liste deux fois `https://rpc-testnet.qore.host`). Deux entrées identiques satisfont le décompte mais annulent le recoupement, car les deux réponses proviennent d'un même serveur. Ajoutez un second RPC que vous exécutez vous-même ou en lequel vous avez confiance indépendamment, et vérifiez le hash de confiance auprès d'une seconde source avant de démarrer, par exemple `curl -s "https://<second-rpc>/block?height=$TRUST_HEIGHT" | jq -r .result.block_id.hash` doit être égal à `$TRUST_HASH`. Le point de confiance du manifeste est actualisé toutes les heures ; récupérez-le donc de nouveau s'il est devenu obsolète.
:::

Gardez l'horloge système synchronisée par NTP : à partir de la v3.2.1, le nœud s'arrête lorsque son horloge dérive de plus de 60 secondes.

---

## Paramètres du réseau {#parameters}

Ces valeurs ont été lues sur l'API REST du mainnet le 27 octobre 2026 (`qorechain-vladi`, alors en v3.2.4 ; la v3.2.5 est en service depuis le 29 octobre 2026). Lisez-les en direct avant de vous y fier : `qorechaind query staking params`, `qorechaind query slashing params`, ou `GET /cosmos/staking/v1beta1/params` et `GET /cosmos/slashing/v1beta1/params`.

| Élément | Valeur |
| --- | --- |
| Taille de l'ensemble actif (`max_validators`) | 100 (8 validateurs sont bonded aujourd'hui, aucun jailed) |
| Période de unbonding | 1 814 400 s (21 jours) ; au plus 7 entrées de unbonding (`max_entries`) par délégateur |
| Taux de commission minimum (`min_commission_rate`) | 0 (vous choisissez votre propre taux, jusqu'à votre `commission-max-rate`) |
| Fenêtre de blocs signés | 10 000 blocs (`signed_blocks_window`) |
| Minimum signé par fenêtre | 0,05, donc un validateur est jailed lorsqu'il signe moins de 5 % de la fenêtre |
| Jail / slash pour indisponibilité | 600 s de jail, 1 % de la mise slashé |
| Slash pour double signature | 5 % de la mise |
| Plancher d'auto-mise pour créer un validateur | **100 000 QOR** (`100000000000uqor`), appliqué on-chain ; en dessous, `create-validator` échoue avec le code 18 |
| Octroi opérateur | Un octroi `validator_operator` actif sur l'expéditeur est requis ; sans lui, `create-validator` échoue avec `ErrUnauthorized` |
| Plancher de frais | 0,1 uqor par gas |

**Ordre des opérations.** Procédez dans cet ordre : (1) enregistrez la clé PQC du compte, (2) obtenez l'octroi `validator_operator`, (3) construisez `create-validator` avec `--generate-only` et signez-le avec `tx pqc cosign`. La clé vient en premier parce qu'un compte sans clé enregistrée ne peut envoyer que l'enregistrement lui-même (voir [Enregistrement de la clé PQC](#pqc-key-registration)), et l'octroi est vérifié au moment où `create-validator` s'exécute. Les détails figurent dans [Création d'un validateur](#validator-license-gate) et [Enregistrement de la clé PQC](#pqc-key-registration).

:::caution `min-self-delegation` n'est pas le plancher de 100 000 QOR
Les validateurs de la genèse affichent `min_self_delegation` = `1` (1 uqor) on-chain. Ce n'est **pas** le plancher : leurs transactions de genèse en étaient exemptées. Le champ `min-self-delegation` de votre `validator.json` est votre propre engagement de garder au moins ce montant auto-misé, sans rapport avec le plancher de 100 000 QOR, qui s'applique au `amount` que vous auto-déléguez lors de la création du validateur.
:::

---

## Matériel {#hardware}

Mesuré sur les validateurs mainnet en fonctionnement (27 octobre 2026) : environ 3,2 à 3,5 Go de RAM et moins de 10 % de CPU en charge normale. Un validateur tourne confortablement sur 3 à 4 vCPU, 8 à 16 Go de RAM et un stockage NVMe. La vitesse d'un seul cœur compte plus que le nombre de cœurs : la vérification des signatures ML-DSA-87 représente environ la moitié du travail de contrôle d'une transaction, et elle culmine sous charge.

| Élément | Profil de validateur suggéré |
| --- | --- |
| CPU | 4 vCPU, fréquence élevée |
| RAM | 16 Go |
| Disque | 100 Go ou plus, NVMe |
| Horloge | Synchronisée par NTP (la règle des 60 secondes ci-dessus) |
| Réseau | Seul le P2P `26656` est ouvert au monde ; RPC, REST et EVM liés à localhost |

L'utilisation du disque dépend de la façon dont vous avez rejoint le réseau. Un validateur qui a rejoint par state sync avec `pruning = "custom"` (keep-recent 100000) et `indexer = "null"` occupe environ 10 Go après deux mois. Un nœud avec le pruning par défaut qui tourne depuis la genèse occupe environ 100 à 130 Go après quatre mois. Les 500 Go ou plus suggérés pour les nœuds RPC dans [Exécution d'un nœud](/developer-guide/running-a-node#recommended-hardware) sont généreux pour un validateur.

---

## Comment le réseau est exploité {#network-organisation}

Le 27 octobre 2026, le réseau compte 8 validateurs actifs, dans plusieurs pays et chez plus d'un hébergeur. Les endpoints publics (`rpc.qore.host`, `api.qore.host`, `evm.qore.host`, `svm.qore.host`) sont servis par des nœuds dédiés non validateurs placés derrière un réseau de périphérie, jamais par des validateurs, et les adresses IP des validateurs ne sont pas publiées dans le DNS. Le pouvoir de vote suit la mise bonded : un nouveau validateur avec l'auto-mise minimale démarre avec une petite part du pouvoir et grandit à mesure que les délégations arrivent.

---

## Création d'un validateur

### Octroi opérateur : `validator_operator` {#validator-license-gate}

`create-validator` est soumis à deux contrôles indépendants, tous deux appliqués on-chain, et vous avez besoin des deux — une auto-mise importante ne suffit pas à elle seule :

1. **Auto-mise minimale de 100 000 QOR.**
2. **Un octroi `validator_operator` actif** sur le compte qui soumet la transaction.

L'octroi est émis on-chain par QoreChain Association via le **Validator Program** : candidatez sur la page **Nodes & Validators** du Dashboard ([Tools Hub](/dashboard/tools-hub#validator-application)), faites tourner un validateur sur le testnet diana pendant la période d'essai de 14 jours et, une fois sélectionné, payez les **frais de programme de $1,000** ; l'octroi est ensuite signé par lots pour l'adresse d'opérateur indiquée dans votre candidature. Vérifiez le vôtre avec `GET /qorechain/license/v1/check/{grantee}/validator_operator`. Le champ `expires_at` d'une licence est une **hauteur de bloc**, pas une date ni une durée — `0` signifie sans expiration. Si elle est absente ou expirée, `create-validator` échoue avec `ErrUnauthorized`, quel que soit le montant auto-misé ; c'est la cause la plus fréquente d'un échec inexpliqué malgré un compte bien approvisionné. Ce verrou existe précisément parce que la voie d'exécution EVM ne peut ni le voir ni l'appliquer (un seul décorateur ante à cet endroit le contournerait entièrement) — c'est l'une des raisons pour lesquelles le staking et la validation restent exclusivement sur la voie native.

Créez un fichier `validator.json` (la forme à base de flags a été supprimée dans le SDK actuel) :

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

Générez ensuite la transaction et signez-la (elle nécessite la signature hybride comme toute transaction de la voie Cosmos ; voir [Commandes de transaction](/cli-reference/transaction-commands#hybrid-signing)) :

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Le plancher de frais du réseau est de **0,1 uqor par unité de gas** ; une limite de gas de 600 000 nécessite donc au moins 60 000 uqor.

| Champ de `validator.json`      | Description                                        |
| ------------------------------ | -------------------------------------------------- |
| `amount`                       | Montant de l'auto-délégation — **minimum 100 000 QOR** (`100000000000uqor`) |
| `pubkey`                       | Clé publique de consensus du validateur (ed25519)  |
| `moniker`                      | Nom lisible pour votre validateur                  |
| `commission-rate`              | Taux de commission initial (par ex., 0.10 = 10 %)  |
| `commission-max-rate`          | Taux de commission maximum (immuable après création) |
| `commission-max-change-rate`   | Taux maximum de variation quotidienne de la commission |
| `min-self-delegation`          | Votre propre engagement de garder au moins ce montant auto-misé (en uqor). Ce n'est **pas** le plancher on-chain de 100 000 QOR, qui s'applique à `amount` |

Une fois la transaction confirmée, vérifiez votre validateur :

```bash
qorechaind query staking validator $(qorechaind keys show mykey --bech val -a)
```

---

## Classification des pools

:::note Conception, pas encore active dans la production de blocs
La classification des pools ci-dessous est la conception de `x/qca`. Ses paramètres sont on-chain (`qorechaind query qca config`), mais les proposants de blocs ne sont pas encore choisis par pool et les pools ne modifient pas encore les récompenses ni le slashing.
:::

Le module `x/qca` (Quantum Consensus Allocation) de QoreChain définit un **système de classification à trois pools**. Tous les **1 000 blocs** (environ 52 minutes avec les blocs de 3,1 s du mainnet), les validateurs sont censés être reclassés dans l'un des trois pools en fonction de leur réputation et de leur mise :

| Pool                                 | Critères                                          | Allocation de blocs |
| ------------------------------------ | ------------------------------------------------- | ---------------- |
| **RPoS** (Reputation Proof-of-Stake) | Réputation >= 70e percentile ET mise >= médiane   | 40 % des blocs   |
| **DPoS** (Delegated Proof-of-Stake)  | Délégation totale >= 10 000 QOR                   | 35 % des blocs   |
| **PoS** (Proof-of-Stake)             | Tous les autres validateurs actifs                | 25 % des blocs   |

Dans la conception, au sein de chaque pool, les proposants de blocs sont sélectionnés par sélection aléatoire pondérée proportionnelle à leur mise effective, de sorte que les validateurs à forte réputation et à forte délégation bénéficient d'une représentation équitable, tout en permettant aux plus petits validateurs de participer.

### Consulter la configuration des pools

```bash
# Pool weights and classification parameters (there is no per-validator classification query)
qorechaind query qca config
```

Via JSON-RPC :

> **Pas encore servi :** aucune version de nœud publiée ne sert l'espace de noms JSON-RPC `qor_`, cet appel renvoie donc `-32601` (method not found) sur tous les endpoints publics aujourd'hui. Voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getPoolClassification",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

---

## Courbe de bonding

:::note Conception, pas encore active
La courbe de bonding est implémentée dans `x/qca` mais n'est pas encore branchée à la distribution des récompenses ; les récompenses de staking suivent aujourd'hui le module de distribution standard. La formule ci-dessous est la conception.
:::

La récompense de staking d'un validateur est conçue pour être déterminée par une courbe de bonding qui intègre plusieurs facteurs :

```
R = beta * S * (1 + alpha * log(1 + L)) * Q(r) * P(t)
```

| Variable | Description                                                |
| -------- | ---------------------------------------------------------- |
| `R`      | Montant de la récompense                                   |
| `beta`   | Taux de récompense de base                                 |
| `S`      | Mise effective                                             |
| `alpha`  | Constante d'échelle de fidélité                            |
| `L`      | Durée de fidélité (temps de staking continu)               |
| `Q(r)`   | Facteur de qualité de réputation, plage \[0.75 - 1.25]     |
| `P(t)`   | Multiplicateur de phase du protocole (s'ajuste au fil du cycle de vie du réseau) |

**Points clés à retenir :**

* **Bonus de durée de fidélité :** la conception ajoute un terme logarithmique pour le temps de staking continu.
* **Facteur de qualité de réputation :** varie de 0.75 (mauvaise réputation) à 1.25 (excellente réputation). Les poids de la formule de réputation sont on-chain (`qorechaind query reputation params`).
* **Multiplicateur de phase du protocole :** s'ajuste à mesure que le réseau mûrit à travers différentes phases (amorçage, croissance, maturité).

---

## Slashing {#slashing}

Les pénalités de base pour infraction, consultables en direct et à jour au moment de la rédaction :

```bash
qorechaind query slashing params
```

| Paramètre | Valeur |
| --- | --- |
| Fenêtre de blocs signés | 10 000 blocs (environ 8,7 heures sur le mainnet à 3,1 s par bloc ; plus court sur le testnet) |
| Minimum signé par fenêtre | 5 % (`min_signed_per_window` = 0.05) : un validateur est jailed lorsqu'il signe **moins de 5 %** des 10 000 derniers blocs, c'est-à-dire lorsqu'il en manque plus de 95 % |
| Durée de jail pour indisponibilité | 600 secondes (10 minutes) |
| Fraction de slashing pour indisponibilité | 1 % de la mise |
| Fraction de slashing pour double signature | 5 % de la mise |

Le jail est un délai fixe de 10 minutes avec une pénalité fixe. Le unbonding dure 21 jours (1 814 400 s), l'ensemble actif contient au plus 100 validateurs (`max_validators`) et chaque délégateur peut avoir au plus 7 entrées de unbonding (`max_entries`). Le modèle progressif ci-dessous est une conception distincte qui superposerait des conséquences supplémentaires et croissantes aux infractions répétées ; il n'est pas encore branché.

## Slashing progressif

:::note Conception, pas encore active
Le slashing progressif est implémenté dans `x/qca` mais n'est pas branché au slashing : les pénalités en vigueur sont les valeurs standard de `x/slashing` du tableau ci-dessus. Les paramètres ci-dessous sont la conception (`qorechaind query qca config`).
:::

La conception du slashing progressif aggrave les pénalités pour les récidivistes tout en permettant aux validateurs de se rétablir avec le temps :

```
penalty = base_rate * escalation^effective_count * severity
```

| Paramètre                    | Valeur         |
| ---------------------------- | -------------- |
| Pénalité maximale par événement | 33 % de la mise |
| Demi-vie de décroissance     | 100 000 blocs  |
| Sévérité de l'indisponibilité | 1.0           |
| Sévérité de la double signature | 2.0         |
| Sévérité de l'attaque sur client léger | 3.0  |

1. **Chaque infraction incrémente le compteur effectif.** Chaque infraction (indisponibilité, double signature, etc.) augmente le compteur effectif du validateur, ce qui affecte les pénalités futures.

2. **La pénalité augmente de façon exponentielle.** La pénalité augmente en fonction du compteur effectif selon la formule ci-dessus, de sorte que les récidivistes s'exposent à des pénalités bien plus élevées.

3. **Le compteur effectif décroît avec le temps.** Le compteur effectif décroît avec une demi-vie de 100 000 blocs (environ 3,6 jours avec les blocs de 3,1 s du mainnet), ce qui permet aux validateurs de se rétablir après une période de bon comportement.

4. **Événements isolés et infractions répétées.** Un seul événement accidentel d'indisponibilité entraîne une pénalité mineure, tandis que des infractions répétées déclenchent des conséquences exponentiellement croissantes.

---

## Enregistrement de la clé PQC {#pqc-key-registration}

Enregistrez votre **clé publique de cryptographie post-quantique (PQC)** (ML-DSA-87) **avant** d'exécuter `create-validator`, et le plus tôt possible : le panneau [Validator Readiness](/dashboard/tools-hub#validator-application) la vérifie dès le dépôt de votre candidature. Ceci n'est **ni optionnel ni automatique** : la chaîne exige une signature PQC hybride sur chaque transaction de la voie Cosmos, `MsgCreateValidator` ne fait pas partie des types de message exemptés, et aucun compte n'enregistre sa clé automatiquement : l'enregistrement est une transaction explicite que chaque compte (opérateurs de validateur compris) doit envoyer lui-même, au préalable. Générez d'abord la clé :

```bash
qorechaind tx pqc gen-key mypqc          # prints the public key (hex); stored unencrypted under ~/.qorechaind/pqc/
```

```bash
qorechaind tx pqc register-key-v2 dilithium5 <pubkey-hex> hybrid \
  --from mykey \
  --pqc-key mypqc \
  --chain-id qorechain-vladi \
  --gas 600000 --fees 60000uqor \
  -y
```

`--pqc-key mypqc` joint une **preuve de possession** : la clé signe `qorechain-pqc-pop-v1|chainid|algo|address|hex(pubkey)` et la chaîne la vérifie, de sorte que personne ne peut enregistrer une clé publique dont il ne détient pas la moitié privée. Elle est facultative en v3.2.3 et recommandée. À partir de la v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026), l'enregistrement du compte indique aussi si une preuve a été vérifiée (`possession_proven`, dans `GET /qorechain/pqc/v1/account/{address}`).

:::note Ce que la v3.2.3 a changé pour l'enregistrement des clés
* Un compte **sans** clé enregistrée ne peut envoyer que l'enregistrement lui-même : toute autre transaction portant une extension de signature hybride est refusée. Enregistrez d'abord, puis signez tout le reste avec `tx pqc cosign`.
* Les clés `classical_only`, vides et dégénérées sont refusées à l'enregistrement.
* Une fois qu'un compte détient une clé, toute maintenance ultérieure de la clé (rotation, migration, ré-enregistrement) doit elle-même être signée en hybride, et ne peut pas être envoyée via `authz`.
* `tx pqc gen-key` n'écrase jamais un fichier de clé existant.
:::

| Paramètre      | Description                                       |
| -------------- | ------------------------------------------------- |
| `dilithium5`   | Algorithme (ML-DSA-87)                            |
| `<pubkey-hex>` | Clé publique ML-DSA-87 de 2592 octets encodée en hexadécimal |
| `hybrid`       | Type de clé (hybrid = classique + PQC)            |

(`qorechaind tx pqc register-key <pubkey-hex> hybrid` est la forme historique équivalente pour Dilithium-5.)

:::caution Définir `--gas` explicitement
La clé publique ML-DSA-87 fait 2 592 octets, et son écriture sur la chaîne peut dépasser la limite de gas par défaut de 200 000 (les enregistrements sur le mainnet ont consommé entre 220 000 et 350 000 de gas). Sans `--gas 600000` (ou plus), la transaction peut échouer avec une erreur opaque `out of gas`. Les frais doivent être au moins égaux à la limite de gas multipliée par 0,1 uqor ; `--gas 600000` nécessite donc `--fees 60000uqor` ou plus.
:::

Vérifier l'enregistrement :

```bash
qorechaind query pqc account <account-address>
```

Le fichier de clé sous `~/.qorechaind/pqc/` est la clé de signature post-quantique du compte : sauvegardez-le comme la phrase mnémonique et, dans la mesure du possible, gardez-le hors de la machine qui exécute la clé de consensus. Voir [Signature post-quantique](/developer-guide/post-quantum-signing#pqc-key-registration) pour la récupération et la rotation.

---

## Surveillance

### Métriques Prometheus

QoreChain expose des métriques Prometheus sur le port **26660** :

```
http://localhost:26660/metrics
```

Activez l'endpoint avec `prometheus = true` dans la section `[instrumentation]` de `config.toml`. Le nœud expose les métriques standard du moteur de consensus (hauteur de bloc, tours de consensus, ensemble de validateurs, pairs, mempool) ; listez ce que sert votre nœud avec `curl -s localhost:26660/metrics | grep -i -E 'height|validator|peers|mempool'`. La santé de signature par validateur se lit de la manière la plus fiable depuis la chaîne elle-même (voir Vérifications de santé ci-dessous), puisque c'est le registre propre de la chaîne qui décide du jailing.

### Consulter les paramètres de réputation

```bash
# Formula weights only (there is no per-validator score query)
qorechaind query reputation params
```

Via JSON-RPC :

> **Pas encore servi :** aucune version de nœud publiée ne sert l'espace de noms JSON-RPC `qor_`, cet appel renvoie donc `-32601` (method not found) sur tous les endpoints publics aujourd'hui. Voir [l'espace de noms `qor_`](/api-reference/json-rpc-qor_-namespace).

```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "qor_getReputationScore",
    "params": ["qorvaloper1..."],
    "id": 1
  }'
```

### Vérifications de santé

```bash
# Node status
qorechaind status | jq '.sync_info'

# Validator signing info (uptime, missed blocks)
qorechaind query slashing signing-info $(qorechaind comet show-validator)

# Check if your validator is in the active set
qorechaind query staking validators --status BOND_STATUS_BONDED | grep "my-validator"
```

---

## Bonnes pratiques opérationnelles

1. **Utilisez une architecture de nœuds sentinelles.** Exécutez votre validateur derrière des nœuds sentinelles pour le protéger des attaques DDoS. N'exposez que les nœuds sentinelles au réseau public.

2. **Mettez en place des alertes.** Configurez des alertes pour les blocs manqués, la faible disponibilité et les redémarrages inattendus. Quelques blocs manqués sont normaux ; des manques soutenus déclencheront un slashing.

3. **Maintenez une disponibilité élevée.** Une indisponibilité prolongée entraîne le jail du validateur (moins de 5 % des 10 000 derniers blocs signés) et son slashing ; voir [Slashing](#slashing).

4. **Maintenez le logiciel à jour.** Suivez les versions de QoreChain et appliquez les mises à jour rapidement. Coordonnez-vous avec la communauté des validateurs pour les mises à niveau de la chaîne.

5. **Sécurisez vos clés.** Protégez la clé de consensus du validateur (`priv_validator_key.json`) et conservez des sauvegardes hors ligne ; envisagez un signataire distant. La signature à distance (`priv_validator_laddr`) n'a pas été vérifiée avec le binaire de release `qorechaind`, et le module post-quantique ne change pas le type de clé de consensus (ed25519) ; testez donc toute configuration de signataire sur le testnet avant de vous y fier. Gardez, dans la mesure du possible, les clés du compte opérateur et son fichier de clé PQC hors de la machine qui exécute le validateur.

6. **Enregistrez d'abord une clé PQC.** Le compte opérateur a besoin d'une clé ML-DSA-87 enregistrée avant de pouvoir créer un validateur ou envoyer toute autre transaction de la voie Cosmos.

7. **Gardez l'horloge synchronisée.** Exécutez un client NTP ; à partir de la v3.2.1, le nœud s'arrête lorsque son horloge dérive de plus de 60 secondes.

---

## Référence des commandes du validateur

```bash
# Edit validator metadata
qorechaind tx staking edit-validator \
  --new-moniker "new-name" \
  --website "https://myvalidator.com" \
  --details "Description of my validator" \
  --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Unjail after downtime slashing
qorechaind tx slashing unjail --from mykey --gas 300000 --fees 30000uqor --generate-only > tx.json

# Delegate additional stake
qorechaind tx staking delegate $(qorechaind keys show mykey --bech val -a) \
  500000000uqor --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Withdraw rewards and commission
qorechaind tx distribution withdraw-rewards $(qorechaind keys show mykey --bech val -a) \
  --commission --from mykey --gas 400000 --fees 40000uqor --generate-only > tx.json

# Sign and broadcast any of the above (hybrid signature):
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Le plancher de frais du réseau est de 0,1 uqor par unité de gas. Un compte opérateur qui n'a **aucune** clé PQC enregistrée peut encore envoyer `unjail` de manière classique ; dès qu'une clé est enregistrée, chaque transaction (unjail compris) nécessite la signature hybride.

---

## Validation des réseaux connectés {#connected-networks}

:::caution Aucun réseau connecté n'est encore actif
Le module bridge est déployé sur le mainnet et le testnet, mais **aucune route de bridge n'est active** : les 37 configurations de chaîne sont en statut `pending`, aucun validateur de bridge n'est enregistré, aucune opération de bridge n'a jamais été créée et aucun canal IBC n'est ouvert sur le mainnet (le testnet a un canal de transfert, qui n'est pas une route de bridge). Le framework ci-dessous décrit la conception ; il n'y a rien à valider sur un réseau connecté aujourd'hui.
:::

La conception (depuis la version de chaîne **v3.1.80**) permet à un validateur QoreChain de contribuer également à la validation des réseaux connectés via le [bridge](/architecture/bridge-architecture). Elle est **soumise à licence et optionnelle** :

1. **Détenir la licence.** Le validateur doit détenir une licence active `validator_<chain>` (ou `qcb_bridge`) pour le réseau cible. L'orchestrateur refuse de démarrer un client externe sans elle (fail-closed).
2. **L'activation approvisionne automatiquement le client.** Lorsque la licence est activée, QoreChain approvisionne le client du réseau correspondant sur votre nœud — en téléchargeant le client épinglé, en générant sa configuration et en l'exécutant sous l'orchestration de QoreChain. Rien n'est téléchargé avant l'activation.
3. **Fournir les clés et la mise du réseau.** Les clés de validateur/mise et de signature du réseau externe sont **fournies par l'opérateur** pour chaque réseau ; QoreChain fournit le framework de pilotes et le verrou de licence appliqué, mais pas votre mise sur la chaîne externe.

Des pilotes existent pour les **37 réseaux du bridge**, classés selon la manière dont un validateur peut participer :

| Classe | Participation | Exemples |
| ----- | ------------- | -------- |
| Validateur sans permission | Miser et exécuter | Solana, Ethereum, Avalanche, Sui, Aptos, Cardano, Tezos, Algorand, Starknet |
| Plafonné / élu / admission | Miser, sous réserve d'un plafond ou d'une élection | BSC, Polygon, Polkadot, TRON, Sei, Injective, NEAR, Hedera |
| Nœud complet L2 | Exécuter un nœud complet (sans staking) | Optimism, Base, zkSync Era, Linea, Scroll, Arbitrum |
| Sans staking / liste de confiance | Observer / participer sans staking | Bitcoin, Filecoin, XRPL, Stellar |

:::note
Les épinglages de version des clients sont fournis au mieux ; vérifiez la version du client en amont pour votre réseau cible avant une activation en production.
:::

## Prochaines étapes

* [Exécution d'un nœud](/developer-guide/running-a-node) — Installer le binaire de release, state sync et paramètres du nœud
* [Développement EVM](/developer-guide/evm-development) — Déployez des smart contracts sur QoreChain
* [Signature post-quantique](/developer-guide/post-quantum-signing) — Enregistrement, récupération et rotation des clés
