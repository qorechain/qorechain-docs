---
slug: /rollups/rdk-v328
title: "Le RDK sur la v3.2.8 : ce qui change"
sidebar_label: RDK sur la v3.2.8
sidebar_position: 11
---

# Le RDK sur la v3.2.8 : ce qui change

La version v3.2.8 de QoreChain change la façon dont les rollups se règlent. Les rollups peuvent désormais placer leurs données sur la chaîne, laisser la chaîne ordonner leurs transactions (séquencement basé, ou « based »), se régler de façon optimiste avec une preuve de fraude qui ré-exécute le batch, garder leurs publications privées au sein d'un ensemble de membres, et lier des racines de retrait Groth16 de manière à accepter n'importe quelle racine de 32 octets. Le règlement STARK est suspendu jusqu'à une version ultérieure. Cette page décrit ce que fait chaque changement et comment l'utiliser. Elle s'adresse aux opérateurs de rollups et aux développeurs qui construisent sur le module `x/rdk`.

:::caution Testnet uniquement pour l'instant

La v3.2.8 s'exécute sur le testnet public `qorechain-diana` depuis le 12 novembre 2026. Le mainnet ne l'a pas encore appliquée : chaque fonctionnalité de cette page y est donc refusée tant qu'il ne l'a pas fait. Considérez les exemples comme des exemples de testnet.

:::

:::note Quels outils permettent de le faire aujourd'hui

* **Ligne de commande du nœud (`qorechaind`)** : chaque message de cette page a sa commande. C'est le binaire de nœud Linux ; il n'existe pas de binaire macOS empaqueté, donc sur un Mac, exécutez-le sur un hôte Linux ou lisez la chaîne via REST.
* **Kit RDK** : le RDK 0.9.0 prend en charge la v3.2.8. Il est publié sur tous les registres : npm (`@qorechain/rdk`, `@qorechain/rdk-cli`, `create-qorechain-rollup`), PyPI (`qorechain-rdk`), crates.io (`qorechain-rdk`), Maven (`io.github.qorechain:qorechain-rdk`) et Go (`github.com/qorechain/qorechain-rdk/packages/go` v0.9.0). Notes de version : https://github.com/qorechain/qorechain-rdk/releases/tag/v0.9.0.
* **Clients RDK Python, Go, Rust et Java** : la version 0.9.0 de chacun prend en charge la v3.2.8. L'exécution de bout en bout ci-dessous a utilisé le client TypeScript.

:::

## Ce qui change en un coup d'œil {#at-a-glance}

| Domaine | Comportement à partir de la v3.2.8 |
| --- | --- |
| Publication de données | `MsgPostRollupData` place un payload dans une transaction et conserve un engagement on-chain sous la prochaine séquence de boîte de réception (inbox) du rollup. |
| Séquencement basé | La chaîne ordonne les transactions d'un rollup selon leur inclusion. Défini à la création ou par la gouvernance avec `MsgSetRollupSequencing`. |
| Rollups optimistes | Les nouveaux rollups optimistes (`nft`, `custom`) exécutent le modèle d'exécution `qledger-v1` et doivent être basés. Une preuve de fraude ré-exécute le batch. |
| Caution du soumetteur | Les batches d'un rollup `qledger-v1` exigent une caution (`MsgBondRollupSubmitter`). Une preuve de fraude confirmée brûle la moitié et verse l'autre moitié au contestataire. |
| Dépôts | `MsgDepositToRollup` crédite un compte de 32 octets sur un rollup `qledger-v1`. |
| Rollups privés | Les rollups `defi` créés avec la confidentialité `encapsulated` n'acceptent que des enveloppes ML-KEM-1024 destinées à leurs membres (`MsgSetRollupMembers`). |
| Entrées Groth16 | Les entrées sont lues modulo le corps scalaire BLS12-381. `withdrawals_root` peut être n'importe quels 32 octets et est stocké réduit. |
| STARK | Les clés STARK et les batches STARK sont refusés jusqu'à une version ultérieure. |
| Rétention | Les engagements de données publiées sont conservés pendant `posted_data_retention_blocks`, avec des points de contrôle conservés plus longtemps sur les rollups `qledger-v1`. |

## Pourquoi c'est important {#why}

Avant la v3.2.8, les données d'un rollup n'avaient pas de place sur la chaîne : quiconque vérifiait un batch devait donc faire confiance à la copie du séquenceur. Publier les données et ordonner selon l'inclusion supprime cette confiance : la chaîne elle-même enregistre ce qui a été publié et dans quel ordre, et un batch doit consommer exactement cette plage. Pour les rollups optimistes, une contestation vérifie désormais l'exécution et non plus seulement une racine ; un batch erroné coûte donc sa caution à son soumetteur. Les rollups privés permettent à un groupe de partager des données sur une chaîne publique sans les publier.

## Publier des données de rollup {#posting-data}

`MsgPostRollupData` (commande `tx rdk post-data`) envoie un payload dans une transaction. Les octets restent dans la transaction, donc dans le bloc. La chaîne conserve un engagement sous la prochaine séquence de boîte de réception du rollup (à partir de 1) : le SHA-256 des données, leur taille, l'auteur de la publication et la hauteur. Elle étend aussi l'accumulateur de boîte de réception du rollup.

* **Qui peut publier** : le séquenceur du rollup (son créateur lorsqu'aucune adresse de séquenceur n'est définie). Sur un rollup basé, n'importe qui.
* **Taille** : au plus `max_posted_data_bytes` par publication (131 072 octets par défaut, plafond strict de 1 Mio) et `max_posted_data_bytes_per_block` pour l'ensemble des rollups (524 288 octets facturables par défaut).
* **Frais** : `posted_data_fee_per_byte` uqor par octet facturable (10 par défaut), et une publication est facturée pour au moins 1 Kio. Les frais vont au collecteur de frais et sont répartis comme des frais de transaction. Le gas est facturé en plus.
* **Rétention** : l'engagement est élagué après `posted_data_retention_blocks` (648 000 par défaut). Les octets restent dans l'historique des blocs.
* **Usage dans un batch** : un batch d'un rollup à DA native qui n'est pas basé peut référencer une publication conservée avec un `data_hash` égal au SHA-256 des données.

Ligne de commande (binaire de nœud Linux) :

```bash
# Post a file's raw bytes to a rollup
qorechaind tx rdk post-data my-rollup @payload.bin --from <key> --chain-id qorechain-diana

# Or post hex
qorechaind tx rdk post-data my-rollup 68656c6c6f --from <key> --chain-id qorechain-diana

# Read a commitment back (the payload itself is in the transaction at its height)
qorechaind query rdk posted-data my-rollup 1
```

Lire un engagement via REST (vérifié sur le testnet, voir [Routes vérifiées](#checked-routes)) :

```bash
curl -s https://api-testnet.qore.host/qorechain/rdk/v1/posted_data/<rollup-id>/1
```

La réponse contient `data_hash`, `size`, `poster`, `height`, `inbox_acc` et `expires_at_height`. Une séquence qui n'a jamais été publiée, ou qui a été élaguée, renvoie HTTP 404.

## Séquencement basé {#based-sequencing}

Un rollup basé est ordonné par l'inclusion sur QoreChain. Chaque publication reçoit la prochaine séquence de boîte de réception, et chaque batch consomme la boîte de réception dans l'ordre.

* Créez un rollup basé avec `--sequencing based`, ou faites passer un rollup existant en mode basé avec le `MsgSetRollupSequencing` de gouvernance.
* Chaque batch définit `inbox_end` (la séquence de la dernière publication qu'il consomme) et porte l'engagement de plage de la boîte de réception sous la forme de `data_hash`. Demandez-le à la chaîne avec `query rdk inbox` (elle renvoie `range_data_hash`).
* Un rollup basé n'est suspendu, repris et arrêté que par la gouvernance.

La personne autorisée à soumettre des batches sur un rollup basé dépend du rollup :

| Rollup | Qui soumet les batches |
| --- | --- |
| zk avec une clé Groth16 (`defi`) | N'importe quel compte. La preuve lie les racines, la plage de la boîte de réception et la racine des retraits. |
| règlement basé (`gaming`, `enterprise`) | Uniquement le séquenceur du rollup. |
| optimiste avec `qledger-v1` (`nft`, `custom`) | N'importe quel compte détenant une caution de soumetteur. |

Les rollups optimistes sans `qledger-v1` et les rollups STARK ne peuvent pas être basés dans cette version.

```bash
# Create a based defi rollup (a Groth16 key is registered separately with set-verification-key)
qorechaind tx rdk create-rollup my-defi-rollup defi 10000000000 --sequencing based --from <key> --chain-id qorechain-diana

# Inbox head, consumed position and the range hash for a batch ending at the head
qorechaind query rdk inbox my-defi-rollup

# Range hash for a batch that ends earlier
qorechaind query rdk inbox my-defi-rollup --inbox-end 12
```

L'accumulateur et l'engagement de plage, pour les prouveurs qui veulent les calculer sans faire confiance à un nœud :

```
acc_n = SHA-256("qorechain/rdk/inbox/v1" | lp(chain_id) | lp(rollup_id) | acc_(n-1)
                | be64(n) | be64(height) | lp(poster) | SHA-256(data))
range = SHA-256("qorechain/rdk/inbox-range/v1" | lp(chain_id) | lp(rollup_id)
                | be64(from) | be64(to) | acc_from | acc_to)
```

`acc_0` vaut 32 octets à zéro et `lp` est un préfixe de longueur de 4 octets en big-endian.

## Rollups optimistes avec qledger-v1 {#qledger-v1}

À partir de la v3.2.8, un nouveau rollup optimiste ne peut pas être créé sans machine virtuelle d'exécution. Les préréglages `nft` et `custom` exigent `--execution-vm qledger-v1` avec `--sequencing based`. Les rollups optimistes créés avant la v3.2.8 ne changent pas.

`qledger-v1` est un registre de comptes en uqor (un arbre de Merkle creux avec SHA-256) avec des transferts et des retraits signés. Les clés de compte sont uniquement ML-DSA-44. Ses entrées sont sa boîte de réception :

* **Publications d'utilisateurs** : une transaction chacune, au plus 6 Kio.
* **Dépôts** : `MsgDepositToRollup` crédite un identifiant de compte de 32 octets. La chaîne ajoute elle-même le dépôt à la boîte de réception.

```bash
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based --from <key> --chain-id qorechain-diana

# Deposit 1,000,000 uqor (1 QOR) for a 32-byte L2 account id
qorechaind tx rdk deposit my-nft-rollup <64-hex-chars> 1000000 --from <key> --chain-id qorechain-diana
```

### Caution du soumetteur et batches en attente {#submitter-bond}

N'importe quel compte peut soumettre des batches dès qu'il détient sur ce rollup une caution de soumetteur d'au moins `min_submitter_bond` (1 000 QOR par défaut, soit 1 000 000 000 uqor).

```bash
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 --from <key> --chain-id qorechain-diana
qorechaind query rdk submitter-bond my-nft-rollup <submitter-address>
qorechaind tx rdk unbond-submitter my-nft-rollup --from <key> --chain-id qorechain-diana
```

La requête de caution renvoie `amount`, `last_submit_time`, `unbond_after` et `pending`. `pending` est le nombre de batches de ce soumetteur qui attendent encore la finalité : il augmente à chaque batch soumis et diminue quand l'un est finalisé ou rejeté. Un soumetteur peut avoir moins de 1 024 batches en attente. Une caution peut être récupérée avec `unbond-submitter` une fenêtre de contestation complète après le dernier batch du détenteur.

### Règles des batches {#batch-rules}

Soit `consumed` la position de la boîte de réception à partir de laquelle le prochain batch commence et `head` la dernière publication (les deux dans `query rdk inbox`). Un batch avec `inbox_end = end` est admis lorsque toutes ces conditions sont réunies :

1. Le soumetteur détient au moins `min_submitter_bond` et a moins de 1 024 batches en attente.
2. `consumed < end <= head`. Un batch consomme au moins une entrée.
3. `end - consumed <= 64`. Au plus 64 entrées de boîte de réception par batch.
4. La chaîne peut encore produire l'accumulateur à `end` : `end` est la tête, ou l'engagement de la publication `end` est conservé (`query rdk inbox <rollup> --inbox-end <end>` renvoie un `range_data_hash`).
5. Un batch de moins de 64 entrées qui s'arrête avant la tête s'arrête soit juste avant une publication faite dans les 20 derniers blocs, soit à un point de contrôle (`end` est un multiple de 64) dont la publication suivante n'est plus conservée.
6. `data_hash` est l'engagement de plage de la boîte de réception de `consumed` à `end`, le premier batch part de la racine de registre vide, et `state_root` fait 32 octets.

Un client peut choisir `end` ainsi :

```
want = min(head, consumed + 64)
if want == head or retained(want):
    end = want                          # to the head, or a full batch of 64
else:
    end = (consumed // 64 + 1) * 64     # the next checkpoint, which is retained
```

Soumettre avec la ligne de commande :

```bash
qorechaind tx rdk submit-batch my-nft-rollup 0 <state-root-hex> \
  --prev-state-root <hex> --tx-count 4 --inbox-end 4 \
  --data-hash <range_data_hash from query rdk inbox> \
  --withdrawals-root <hex> --from <key> --chain-id qorechain-diana
```

### Preuves de fraude {#fraud-proofs}

Pendant la fenêtre de contestation, n'importe qui peut envoyer `MsgChallengeBatch` avec une preuve de fraude `qledger-v1` : les entrées du batch et un témoin de Merkle des comptes qu'elles touchent. La chaîne ré-exécute le batch.

* Si la racine d'état ou la racine des retraits est fausse, le batch est rejeté, de même que tout batch construit dessus. La boîte de réception est restaurée à son état antérieur.
* L'intégralité de la caution du soumetteur est confisquée. **La moitié est brûlée et l'autre moitié est versée au contestataire.** La moitié brûlée est enregistrée dans le module de burn sous la source `rollup_slash`. Un soumetteur qui conteste son propre batch erroné perd quand même la moitié de sa caution.
* Une preuve qui ne montre pas un batch erroné échoue avec l'erreur 51 et ne change rien.

```bash
qorechaind tx rdk challenge-batch my-nft-rollup 1 --proof <hex-fraud-proof> --from <key> --chain-id qorechain-diana
```

Le RDK 0.9.0 contient les assistants `qledger-v1` qui construisent les octets de la preuve.

Les batches non contestés se finalisent d'eux-mêmes à la fin de la fenêtre de contestation. Les retraits ne sont payés qu'à partir de batches finalisés, depuis le réservoir de dépôts du rollup, jamais depuis le séquestre du créateur. Un rollup ne peut pas être arrêté tant que le réservoir contient des dépôts (erreur 54).

### Rétention et périodes d'inactivité {#retention}

* Un engagement de publication est conservé pendant `posted_data_retention_blocks`, puis, tant qu'aucun batch finalisé ne le couvre, pendant jusqu'à 4 périodes de rétention supplémentaires.
* Ensuite il est élagué, sauf un point de contrôle : chaque publication dont la séquence est un multiple de 64 conserve son engagement jusqu'à ce qu'un batch finalisé le couvre, ou jusqu'à l'arrêt du rollup.
* Un rollup arrêté ne conserve aucun engagement au-delà de sa période de rétention.
* `posted_data_retention_blocks` doit être au moins égal à la plus longue fenêtre de contestation en vigueur, comptée à raison d'un bloc par seconde (`default_challenge_window` et la fenêtre de chaque rollup non arrêté). Une mise à jour de paramètre qui le laisse plus court, ou qui relève une fenêtre au-dessus de lui, est refusée avec `invalid params`. La borne supérieure est 25 920 000.
* Lors de la mise à niveau v3.2.8, une valeur stockée inférieure à cette fenêtre est relevée à celle-ci. Les paramètres par défaut sont laissés tels quels.
* **Valeurs du testnet** : `default_challenge_window` est de 3 600 secondes (la valeur par défaut du cœur et du style mainnet est de 604 800 secondes, soit 7 jours). Les données publiées sont conservées 648 000 blocs, et les blobs et les batches finalisés 432 000 blocs.

Après une longue période d'inactivité, avec plus de 64 publications non consommées et leurs engagements élagués, un soumetteur rattrape son retard dans l'ordre : un batch jusqu'au prochain multiple de 64 si `consumed` n'en est pas un, puis des batches complets de 64 de point de contrôle en point de contrôle, puis un dernier batch jusqu'à la tête (ou jusqu'à n'importe quelle position conservée selon la règle 5). En fonctionnement normal, rien ne change : faites des batches de jusqu'à 64 entrées, jusqu'à la tête ou juste avant une publication récente.

## Rollups privés {#private-rollups}

Un rollup `defi` (Groth16) créé avec la confidentialité `encapsulated` n'accepte que des publications qui sont des enveloppes ML-KEM-1024 destinées à ses membres.

Une enveloppe chiffre les données une seule fois avec AES-256-GCM sous une clé neuve, et encapsule cette clé pour la clé ML-KEM-1024 de chaque membre issue du registre KEM de la chaîne. Un engagement de clé garantit que tous les membres ouvrent le même contenu. La chaîne vérifie que l'enveloppe est bien formée et que chaque entrée désigne la clé actuelle du membre. Elle ne déchiffre jamais.

* Le créateur définit les membres avec `MsgSetRollupMembers` : au plus 32, chacun avec une clé ML-KEM-1024 enregistrée. Chaque changement ouvre une nouvelle époque d'adhésion.
* Les publications, l'auteur de la publication, le moment, les tailles, les membres, les racines et les retraits (destinataire et montant) restent publics. Seul le contenu des publications est privé.

```bash
qorechaind tx rdk create-rollup my-private-rollup defi 10000000000 --privacy encapsulated \
  --verification-key-file vk.json --from <key> --chain-id qorechain-diana

qorechaind tx rdk set-members my-private-rollup <addr1>,<addr2> --from <key> --chain-id qorechain-diana

# Encrypt to the members and post, in one step
qorechaind tx rdk post-private-data my-private-rollup @message.bin --from <key> --chain-id qorechain-diana

# A member opens a post offline
qorechaind tx rdk decrypt-private-data my-private-rollup @envelope.hex
```

## Entrées Groth16 et racine des retraits {#groth16}

Un batch Groth16 sur BLS12-381 (le profil `defi`, SNARK) est vérifié par rapport à des entrées publiques, chacune étant une valeur de 32 octets lue comme un entier big-endian et réduite modulo l'ordre du corps scalaire :

```
r = 0x73eda753299d7d483339d80809a1d80553bda402fffe5bfeffffffff00000001
input_i = int.from_bytes(value_i, "big") mod r
values  = prev_state_root, state_root, data_hash, withdrawals_root
```

Un batch soumis avant que les retraits ne soient liés n'a que les trois premières entrées. Le témoin du prouveur doit prendre les mêmes valeurs réduites.

Le fait qu'une valeur doive déjà être inférieure à `r` dépend de qui la définit :

| Valeur | Qui la définit | Doit être inférieure à r |
| --- | --- | --- |
| `state_root` | le prouveur | oui |
| `prev_state_root` | la chaîne (le dernier `state_root` réglé), sauf sur le premier batch d'un rollup | premier batch uniquement |
| `data_hash` | la chaîne lorsqu'il est lié (la plage de boîte de réception d'un rollup basé, un engagement de données publiées), sinon le prouveur | uniquement lorsqu'il n'est pas lié |
| `withdrawals_root` | la chaîne (la racine de l'arbre des retraits que `MsgExecuteWithdrawal` reconstruit) | non |

Ce que cela signifie pour un client :

* Soumettez la racine des retraits telle que l'arbre la donne. Ce peut être n'importe quels 32 octets.
* La chaîne stocke `withdrawals_root mod r` sous forme de 32 octets big-endian. La requête de batch montre cette valeur stockée, avec `withdrawals_root_reduced` à true. Environ 55 pour cent des racines d'arbre sont supérieures ou égales à `r`, de sorte que la valeur stockée diffère souvent des octets soumis.
* `MsgExecuteWithdrawal` ne change pas pour le client : envoyez les champs de la feuille et les hashes frères. La chaîne reconstruit la racine et accepte le retrait lorsque `rebuilt_root mod r == stored_root mod r`.
* Deux soumissions du même batch dont les racines diffèrent d'un multiple de `r` sont le même batch. La première se règle, la seconde est refusée comme batch déjà existant, et chaque retrait de l'arbre est payé par rapport à la racine stockée.
* Après le règlement, comparez la racine stockée à `tree_root mod r`, et non à `tree_root`.

Les batches optimistes, `qledger-v1` et Groth16 antérieurs à la règle de réduction stockent et comparent les 32 octets exacts. Pour l'encodage de l'arbre et des feuilles, voir [ZK / STARK et retraits](/rollups/zk-stark-withdrawals).

## Le règlement STARK est suspendu {#stark}

Le seul énoncé STARK que le vérificateur prend en charge prouve une élévation au carré itérée entre deux valeurs de 64 bits. Cela ne contraint ni les retraits ni les données d'un rollup. À partir de la v3.2.8, une clé STARK ne peut pas être définie et les batches d'un rollup STARK sont refusés (erreur 52). La gouvernance peut faire passer un tel rollup à une clé Groth16. Le règlement STARK reviendra dans une version ultérieure avec un véritable énoncé de rollup.

## Nouveaux messages {#messages}

| Message | Commande | Qui l'envoie |
| --- | --- | --- |
| `MsgPostRollupData` | `tx rdk post-data` | Le séquenceur, ou n'importe qui sur un rollup basé |
| `MsgSetRollupSequencing` | proposition de gouvernance | La gouvernance |
| `MsgDepositToRollup` | `tx rdk deposit` | N'importe qui, pour un rollup `qledger-v1` |
| `MsgBondRollupSubmitter` | `tx rdk bond-submitter` | Un soumetteur de batches |
| `MsgUnbondRollupSubmitter` | `tx rdk unbond-submitter` | Un soumetteur de batches |
| `MsgSetRollupMembers` | `tx rdk set-members` | Le créateur d'un rollup privé |
| `MsgSubmitBatch` champ `inbox_end` | `tx rdk submit-batch --inbox-end` | Le soumetteur d'un batch de rollup basé |

`create-rollup` accepte aussi `--sequencing`, `--execution-vm` et `--privacy`. La matrice de compatibilité est désormais la suivante : l'optimiste avec preuves de fraude exige `qledger-v1` et le séquencement basé, et le règlement ZK signifie SNARK.

## Déroulement complet : créer, cautionner, déposer, publier, batcher, contester, finaliser, retirer {#worked-flow}

:::note Exécuté sur le testnet par l'équipe RDK, le 12 novembre 2026
L'équipe RDK a exécuté ce déroulement de bout en bout sur le testnet `qorechain-diana` le 12 novembre 2026, de 06 h 22 à 07 h 27 UTC. Il a été piloté entièrement via le RDK 0.9.0 (TypeScript) avec les frais `auto` du RDK à 0,15 uqor par gas. Chaque étape a renvoyé le code 0. Il n'a pas été exécuté par l'auteur de cette page.
:::

| Étape | Message | Gas utilisé / gas demandé |
| --- | --- | --- |
| 0 | Enregistrer d'abord la clé post-quantique du nouveau compte, dans sa propre transaction (`MsgRegisterPQCKeyV2` avec preuve de possession). Les clients RDK le font automatiquement ; sans cela, la première vraie transaction est refusée avec le code pqc 8 | 348 917 / 600 000 |
| 1 | `MsgCreateRollup` : profil `nft`, machine virtuelle d'exécution `qledger-v1`, séquencement `based`, mise de 10 000 QOR (1 % brûlé) | 301 260 / 349 199 |
| 2 | `MsgBondRollupSubmitter`, 1 000 QOR | 178 059 / 263 425 |
| 3 | `MsgDepositToRollup` deux fois (3 QOR et 1 QOR ; le minimum est de 1 QOR) | environ 240 000 / 350 000 chacune |
| 4 | `MsgPostRollupData` deux fois (un transfert qledger signé et un retrait qledger signé), plus les frais de données publiées (10 uqor par octet facturable, au moins 1 Kio facturé) | environ 328 500 / 474 000 chacune |
| 5 | `planQledgerBatch`, puis `MsgSubmitBatch` pour 4 entrées de boîte de réception (`inbox_end` 4, `data_hash` la plage de la boîte de réception). Statut du batch `submitted`, caution `pending` 1 | 712 379 / 1 011 431 |
| 6 | Test de fraude : une publication de plus, puis un batch avec une racine d'état volontairement fausse (233 990 / 341 742), puis `MsgChallengeBatch` avec la preuve de fraude construite par le RDK (4 136 octets) | 450 186 / 644 417 |
| 7 | Le batch 0 s'est finalisé de lui-même après la fenêtre de contestation du testnet de 3 600 secondes | aucune transaction |
| 8 | `MsgExecuteWithdrawal` de 0,3 QOR avec la preuve de Merkle qledger du RDK | 192 768 / 284 220 |

Résultats à retenir :

* **Étape 6** : le batch erroné a été rejeté, la caution du soumetteur a été confisquée (moitié brûlée, moitié versée au contestataire), la boîte de réception a été restaurée, et le bon batch précédent n'a pas été touché.
* **Étape 8** : le réservoir de dépôts du rollup est passé de 4,0 à 3,7 QOR, et le solde du destinataire a augmenté de 0,3 QOR moins les frais.

La ligne de commande a un équivalent pour chaque étape. Ces commandes individuelles n'ont pas été exécutées pour cette page et suivent les définitions de la CLI de nœud :

```bash
CHAIN="--chain-id qorechain-diana --from <key>"

# 1. Create an optimistic, based qledger-v1 rollup (needs the creation stake)
qorechaind tx rdk create-rollup my-nft-rollup nft 10000000000 \
  --execution-vm qledger-v1 --sequencing based $CHAIN

# 2. Bond the submitter (at least min_submitter_bond)
qorechaind tx rdk bond-submitter my-nft-rollup 1000000000 $CHAIN

# 3. Deposit funds for an L2 account
qorechaind tx rdk deposit my-nft-rollup <64-hex-account-id> 1000000 $CHAIN

# 4. Post a signed L2 transaction (one transaction, at most 6 KiB)
qorechaind tx rdk post-data my-nft-rollup @signed-l2-tx.bin $CHAIN

# 5. Read the range hash, execute the entries off chain, then submit the batch
qorechaind query rdk inbox my-nft-rollup
qorechaind tx rdk submit-batch my-nft-rollup 0 <new-state-root> --tx-count <n> \
  --inbox-end <end> --data-hash <range_data_hash> --withdrawals-root <root> $CHAIN

# 6. A challenger who finds a wrong root sends a fraud proof inside the window
qorechaind tx rdk challenge-batch my-nft-rollup 0 --proof <hex-fraud-proof> $CHAIN

# 7. An unchallenged batch finalizes by itself when the challenge window ends
qorechaind query rdk batch my-nft-rollup --index 0   # status finalized

# 8. Withdraw from the finalized batch (anyone may submit the proof)
qorechaind tx rdk execute-withdrawal my-nft-rollup 0 <withdrawal-index> <recipient> uqor <amount> \
  --proof <sibling-hex>,<sibling-hex> $CHAIN
```

La fenêtre de contestation d'un rollup se trouve dans son `challenge_window_sec`. Sur le testnet, `default_challenge_window` est volontairement de 3 600 secondes, afin que les rollups puissent être mis à l'épreuve en moins d'une heure ; la valeur par défaut du cœur et du style mainnet est de 604 800 secondes (7 jours). Les étapes 5 à 8 exigent des racines et des preuves calculées à partir du registre ; le RDK 0.9.0 contient les assistants `qledger-v1` qui le font.

## Lire la chaîne avec le kit TypeScript publié {#typescript}

Ces lectures utilisent des noms de `@qorechain/rdk`, qui prend en charge la v3.2.8 à partir de la 0.9.0. Vous pouvez aussi lire directement les nouveaux champs avec `curl`, comme indiqué ci-dessous.

```ts
import { RestClient } from "@qorechain/rdk";

const rest = new RestClient("https://api-testnet.qore.host");

const params = await rest.getParams();
const rollup = await rest.getRollup("my-nft-rollup");
const latest = await rest.getLatestBatch("my-nft-rollup");
console.log(params, rollup, latest);
```

Cet extrait n'a pas été exécuté pour cette page.

## Routes vérifiées {#checked-routes}

Ces routes en lecture seule ont été demandées au testnet public le 12 novembre 2026.

| Route | Statut |
| --- | --- |
| `GET /qorechain/rdk/v1/params` | 200 |
| `GET /qorechain/rdk/v1/rollups` | 200 |
| `GET /qorechain/rdk/v1/rollup/<id>` | 200 |
| `GET /qorechain/rdk/v1/inbox/<id>` et `?inbox_end=N` | 200 |
| `GET /qorechain/rdk/v1/posted_data/<id>/<sequence>` | 200, ou 404 pour une séquence jamais publiée ou élaguée |
| `GET /qorechain/rdk/v1/submitter_bond/<id>/<address>` | 200 |
| `GET /qorechain/rdk/v1/batches/<id>`, `latest_batch/<id>`, `batch/<id>/<index>` | 200 |
| toute route pour un rollup inconnu | 404 |

```bash
BASE=https://api-testnet.qore.host/qorechain/rdk/v1
curl -s $BASE/params
curl -s $BASE/inbox/<rollup-id>
curl -s $BASE/submitter_bond/<rollup-id>/<address>
curl -s $BASE/latest_batch/<rollup-id>
```

Les paramètres du module incluent désormais `max_posted_data_bytes`, `max_posted_data_bytes_per_block`, `posted_data_fee_per_byte`, `posted_data_retention_blocks`, `min_submitter_bond` et `finalized_batch_retention_blocks`. La vue du batch ajoute `inbox_start`, `inbox_end` et `withdrawals_root_reduced`, et la vue du rollup ajoute `sequencing`, `execution_vm`, `privacy`, `members`, `members_epoch` et `deposit_pool`. La réponse de la boîte de réception contient `head_sequence`, `consumed_sequence` et `range_data_hash`, qui est vide lorsque l'engagement à la fin demandée n'est pas disponible.

## Limites et erreurs {#limits}

| Limite ou erreur | Valeur ou signification |
| --- | --- |
| Taille d'une publication | `max_posted_data_bytes`, 131 072 octets par défaut, plafond de 1 Mio |
| Octets publiés par bloc | `max_posted_data_bytes_per_block`, 524 288 octets facturables par défaut |
| Frais de publication | 10 uqor par octet facturable par défaut, au moins 1 Kio facturé |
| Rétention des données publiées | 648 000 blocs par défaut, au plus 25 920 000, jamais inférieure à la plus longue fenêtre de contestation en secondes |
| Publication `qledger-v1` | Une transaction, au plus 6 Kio |
| Taille d'un batch | De 1 à 64 entrées de boîte de réception |
| Batches en attente par soumetteur | moins de 1 024 |
| Membres d'un rollup privé | au plus 32, chacun avec une clé ML-KEM-1024 enregistrée |
| Batches réglés par bloc, par rollup | `max_batches_per_block`, 10 par défaut (erreur 40) |
| Erreur 41, 44, 47 | La fonctionnalité n'est pas activée à cette hauteur (le réseau n'a pas appliqué la v3.2.8) |
| Erreur 42, 43 | Publication trop grande, ou limite de publications du bloc atteinte |
| Erreur 45 | Le séquencement basé n'est pas disponible pour ce rollup |
| Erreur 46 | Le batch ne correspond pas à la boîte de réception du rollup (mauvais `inbox_end` ou `data_hash`) |
| Erreur 48 | Mode d'exécution ou de confidentialité invalide |
| Erreur 49 | Caution de soumetteur requise |
| Erreur 50 | La caution du soumetteur est encore verrouillée |
| Erreur 51 | La preuve de fraude ne montre pas que le batch est invalide |
| Erreur 52 | Le règlement STARK est suspendu |
| Erreur 53 | La publication n'est pas une enveloppe valide pour les membres du rollup |
| Erreur 54 | Le rollup détient encore des dépôts d'utilisateurs, il ne peut donc pas être arrêté |

## Pages liées {#related}

* [Aperçu des Rollups](/rollups/overview)
* [Profils prédéfinis](/rollups/preset-profiles)
* [Déployer un Rollup](/rollups/deploying-a-rollup)
* [Disponibilité des données](/rollups/data-availability)
* [ZK / STARK et retraits](/rollups/zk-stark-withdrawals)
* [Tour de guet](/rollups/watchtower)
