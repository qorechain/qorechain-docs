---
slug: /light-node/registration-and-licensing
title: Enregistrement et licences
sidebar_label: Enregistrement & Licences
sidebar_position: 4
---

# Enregistrement et licences

Pour participer à la [part de récompense de 3 % réservée aux nœuds légers](/light-node/rewards-and-monitoring), un nœud léger doit être **enregistré on-chain** et doit continuer à prouver qu'il est actif. Cette page explique ce que la chaîne exige, comment obtenir une licence, comment le nœud s'enregistre lui-même et comment il prouve sa vivacité (liveness).

:::note L'enregistrement est ouvert
L'enregistrement est ouvert sur le mainnet (`qorechain-vladi`) et sur le testnet (`qorechain-diana`). Faire tourner et synchroniser un nœud ne nécessite aucune licence. Voir [État du programme de récompenses](/light-node/overview#reward-program-status) pour savoir comment vérifier l'état actuel.
:::

## Enregistrement on-chain

L'enregistrement inscrit votre nœud léger sur la chaîne afin que le protocole sache qu'il existe, de quel type il est (`sx` ou `ux`) et quel compte opérateur le contrôle. Une fois enregistré et actif, le nœud devient éligible à la part de récompense des nœuds légers.

### Prérequis {#requirements}

La chaîne vérifie tous les points suivants lors de l'exécution de votre transaction d'enregistrement :

1. Une licence `lightnode_operator` active sur l'adresse de l'opérateur.
2. Au moins **1 000 QOR délégués** depuis cette même adresse à des validateurs **bondés** (votre total sur l'ensemble des validateurs ; les délégations à des validateurs emprisonnés (jailed) ou non bondés ne comptent pas).
3. Un solde sur le compte de l'opérateur pour payer les **frais d'enregistrement de 1 QOR** et les frais de transaction. Le nœud paie également des frais pour chaque heartbeat depuis ce compte : avec la signature native, les frais sont de 0,25 uqor par unité de gas, soit 75 000 uqor (0,075 QOR) avec la valeur par défaut `[heartbeat] gas` de 300 000.
4. Moins de 10 000 nœuds légers enregistrés sur l'ensemble du réseau.

Après l'enregistrement, le nœud doit envoyer un heartbeat tous les **1 000 blocs** (avec une tolérance de 100 blocs) et maintenir une **disponibilité d'au moins 80 %** pour être rémunéré. Lisez les valeurs en direct avec `GET https://api.qore.host/qorechain/lightnode/v1/params` (testnet : `https://api-testnet.qore.host`).

### Le compte opérateur {#operator-account}

L'enregistrement s'effectue depuis votre **adresse d'opérateur** : un compte `qor1…` ordinaire qui détient la licence et le stake, paie les frais et reçoit les récompenses. Le nœud doit pouvoir signer pour lui ; il doit donc s'agir d'un compte **dont vous détenez les mots de récupération** : des mots que vous avez notés vous-même, un compte Keplr ou une clé `qorechaind` (chemin de dérivation `m/44'/118'/0'/0/0`). Un compte dédié, utilisé uniquement pour le nœud, est le meilleur choix.

Un portefeuille custodial sur le Dashboard (dont le Dashboard conserve la seed pour vous) ne peut pas faire tourner un nœud, sauf si vous exportez d'abord sa seed.

La clé Dilithium-5 du nœud n'a pas d'adresse propre : sur QoreChain, une clé post-quantique est rattachée à un compte, elle n'en crée pas. Le nœud rattache sa clé au compte opérateur en tant que clé post-quantique de ce compte, sauf si le compte en possède déjà une (voir [Comptes qui possèdent déjà une clé post-quantique](#accounts-with-a-pqc-key)).

## Obtenir une licence

### Mainnet : achat sur le Dashboard

Les licences s'achètent sur le Dashboard QoreChain dans **Tools → Light Node**. Une licence coûte **50 $**, payés en USDT sur ERC-20, BEP-20 ou TRC-20 ; le paiement est vérifié sur sa chaîne. Vous devez saisir l'adresse `qor1…` à laquelle la licence est destinée **avant** de payer ; utilisez l'adresse d'opérateur décrite ci-dessus.

L'octroi est une étape on-chain distincte, signée à la main et envoyée par lots. Tant que la chaîne ne l'a pas confirmé, l'onglet affiche **Paid, awaiting on-chain grant**, et le nœud continue d'indiquer que l'adresse n'a pas de licence. `lightnode-sx status` affiche une ligne `Licence:` qui passe à `active` lorsque l'octroi arrive. Vous pouvez aussi le vérifier directement :

```bash
curl -s https://api.qore.host/qorechain/license/v1/check/<operator-address>/lightnode_operator
```

### Testnet : sur demande

Rien n'est vendu sur le testnet. Les licences testnet sont accordées sur demande par l'autorité de licence du testnet.

## Enregistrer le nœud

Les étapes ci-dessous constituent le flux de configuration propre au nœud. Elles sont identiques pour les deux éditions : `lightnode-ux` dispose des mêmes commandes que `lightnode-sx` et utilise le même répertoire personnel (`~/.qorechain-lightnode`). Voir [Édition SX](/light-node/sx-edition#first-run-onboard) pour le détail de chaque commande.

```bash
# 1. Keys are stored encrypted. Keep this set for every command below and for start.
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'

# 2. Self-test, RPC endpoint (mainnet: https://rpc.qore.host), node key
lightnode-sx onboard

# 3. The operator account: the one the licence is for. --recover reads its
#    recovery words from standard input.
lightnode-sx keys add-operator --recover

# 4. Post-quantum key, missing stake (only if you name a validator), registration
lightnode-sx register --delegate-to qorvaloper1...

# 5. Run the node; it sends heartbeats on its own
lightnode-sx start
lightnode-sx status
```

La phrase secrète protège les deux clés du keyring du nœud : la clé post-quantique du nœud et la clé du compte opérateur.

### Ce que fait `register`

`register` lit `operator_address` et les clés depuis le keyring, puis :

1. **Vérifie la licence.** Il demande à la chaîne si `operator_address` détient une licence `lightnode_operator` active. Sans licence, il s'arrête et indique où en obtenir une. (Dans la version 3.1.9, ce message mentionne encore l'ancien onglet « Buy License » du Dashboard ; les licences s'achètent dans **Tools → Light Node**.) Une licence expirée ou suspendue est signalée comme telle. Un nœud déjà enregistré est signalé comme tel, et rien n'est envoyé.
2. **Rattache la clé post-quantique**, sauf si le compte en possède déjà une. Un compte sans clé post-quantique ne peut envoyer que ce seul message, signé de manière classique (sans l'extension hybride) ; le nœud l'envoie ainsi et y inclut une preuve de possession de la clé lorsque la chaîne la prend en charge.
3. **Délègue le stake manquant**, uniquement si vous désignez un validateur avec `--delegate-to qorvaloper1...`. Sans `--delegate-to`, si le compte est sous le minimum, il s'arrête et indique le montant manquant.
4. **Enregistre le nœud** avec les frais de 1 QOR.

Chaque étape est signée par le nœud lui-même et confirmée dans un bloc avant l'envoi de la suivante. Chaque transaction postérieure à l'enregistrement de la clé porte la signature hybride ML-DSA-87 + secp256k1 exigée par la chaîne.

La commande accepte les options suivantes :

- `--delegate-to` — le validateur `qorvaloper1…` auquel déléguer le stake manquant.
- `--type` — le type de nœud, `sx` ou `ux` (par défaut, l'édition du binaire).
- `--version` — la version du nœud à enregistrer (par défaut, la version du binaire lui-même).
- `--print` — affiche les commandes `qorechaind` équivalentes au lieu de signer (voir ci-dessous).

Le compte doit déjà exister on-chain (il doit avoir reçu des fonds) avant que `register` puisse signer pour lui.

### Comptes qui possèdent déjà une clé post-quantique {#accounts-with-a-pqc-key}

Un compte configuré dans un portefeuille possède souvent déjà une clé post-quantique, dérivée des mêmes mots de récupération. Selon les règles de la chaîne v3.2.3, la chaîne n'accepte que la clé enregistrée sur le compte, et elle refuse les clés de type `classical_only` ou une clé vide.

Depuis la version 3.1.9, `keys add-operator --recover` gère ce cas : lorsque le compte possède déjà une clé post-quantique, il reconstruit cette clé à partir des mots, avec la même dérivation que le wallet-adapter et le Dashboard (la même que `qorechaind tx pqc recover-key`), et le nœud signe avec elle. Lorsque le compte n'a pas de clé, le nœud en dérive une à partir des mots, de sorte que les mots restaurent aussi la clé du nœud. Si le compte possède une clé post-quantique que les mots ne permettent pas de reproduire (un portefeuille qui génère et conserve sa propre clé), la commande refuse et recommande un compte opérateur dédié.

### Solution de repli : clé de l'opérateur dans un keyring `qorechaind`

Si vous conservez la clé du compte opérateur dans un keyring `qorechaind` et ne souhaitez pas la stocker dans le nœud, ignorez l'étape 3 et exécutez :

```bash
lightnode-sx register --print
```

La commande effectue les mêmes vérifications de licence et d'enregistrement et affiche, avec vos valeurs renseignées, les commandes `qorechaind` de chaque étape : l'export de la clé du nœud dans le répertoire de clés de `qorechaind` (`keys export <name> --out ~/.qorechaind/pqc/<name>.dilithium`), `tx pqc register-key-v2 … hybrid`, un `tx staking delegate` lorsque le stake est insuffisant, et `tx lightnode register` sous la forme d'un couple génération-puis-`tx pqc cosign`. Sur ce chemin, le démon utilise aussi `qorechaind` pour les heartbeats ; voir [paramètres `[heartbeat]`](/light-node/sx-edition#configure).

## Preuves de vivacité par heartbeat

L'enregistrement seul ne suffit pas pour rester éligible. Un nœud léger enregistré doit prouver en continu qu'il est en ligne en soumettant des **preuves de vivacité par heartbeat**. Ces heartbeats sont la manière dont la chaîne distingue les nœuds actifs — éligibles à la part de récompense — des nœuds enregistrés mais hors ligne.

En pratique, cela signifie qu'un nœud enregistré et maintenu en fonctionnement (et synchronisé) conserve son éligibilité, tandis qu'un nœud qui passe hors ligne cesse de prouver sa vivacité et perd son éligibilité jusqu'à son retour. Maintenir le démon en fonctionnement et en bonne santé fait donc partie intégrante de la perception des récompenses — voir [Récompenses et supervision](/light-node/rewards-and-monitoring) pour savoir comment surveiller la santé du heartbeat et de la synchronisation.

### Pipeline de heartbeat co-signé PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain est **PQC obligatoire par défaut**, de sorte que chaque heartbeat porte une **signature hybride** : ML-DSA-87 (Dilithium-5) avec la clé post-quantique du compte, et secp256k1 avec la clé du compte opérateur. Le nœud construit et signe lui-même la transaction sous Linux, macOS et Windows ; `qorechaind` n'est pas nécessaire. Il lit sur le réseau la version de sign-bytes à utiliser.

Les heartbeats on-chain sont activés par défaut. Le démon en envoie un lorsque 1 000 blocs (`[heartbeat] interval_blocks`, correspondant au `heartbeat_interval` de la chaîne) se sont écoulés depuis le `last_heartbeat` enregistré par la chaîne pour le nœud, en vérifiant toutes les 60 secondes, de sorte qu'un redémarrage n'envoie pas de doublon et n'attend pas un intervalle entier. Chaque heartbeat n'est signalé qu'une fois inclus dans un bloc.

Le démon choisit son signataire au démarrage :

- **Natif** — le keyring contient la clé de l'opérateur (issue de `keys add-operator`) et elle correspond à `operator_address`. C'est le cas normal.
- **Repli `qorechaind`** — sinon, si un binaire `qorechaind` se trouve dans le `PATH` ou à `[heartbeat] qorechaind_path`. Il utilise la clé de l'opérateur du keyring `qorechaind` (`[heartbeat] key_name`, répertoire personnel `qorechaind_home`, par défaut `~/.qorechaind`) et la clé du nœud exportée sous `pqc/<key_name>.dilithium`. La phrase secrète du keyring `qorechaind` se place dans `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` ; elle est transmise à `qorechaind` sur l'entrée standard, jamais placée sur une ligne de commande.

Tant que le nœud n'est pas enregistré, il n'envoie pas de heartbeat ; il consigne plutôt la raison, une fois à chaque changement d'état : pas de licence, ou licence active mais non enregistrée (exécutez `register`). `lightnode-sx status` affiche les lignes `Signer:`, `Licence:` et `Registration:` pour que la raison soit visible sans lire les journaux. Lorsqu'il n'y a pas de signataire, le nœud continue de fonctionner et de se synchroniser, mais il ne peut pas rester actif on-chain, et `status` l'indique.

## L'onglet Light Node du Dashboard

L'onglet **Tools → Light Node** du Dashboard QoreChain réunit les étapes :

1. **Téléchargements.** Il fournit les liens vers les binaires du nœud léger pour le réseau sélectionné (les mêmes fichiers que `https://download.qore.host/<net>/lightnode/latest.json`, avec leurs sommes de contrôle sha256).
2. **Étapes de configuration.** Il affiche les cinq étapes ci-dessus, adaptées à la version du manifeste de publication, et indique si l'enregistrement est ouvert, d'après le champ `registration` du manifeste.
3. **Achat de licence** (mainnet uniquement). Il demande l'adresse de la licence avant le paiement et affiche **Paid, awaiting on-chain grant** jusqu'à ce que la chaîne confirme l'octroi. Il vous avertit si l'adresse saisie est votre propre portefeuille custodial du Dashboard, et il signale, à titre d'information, si l'adresse possède déjà une clé post-quantique.
4. **Statut.** Un panneau de statut affiche l'état du nœud tel qu'il est lu sur la chaîne.

L'enregistrement lui-même est toujours la transaction envoyée par `lightnode-sx register` (ou `lightnode-ux register`). Le Dashboard n'enregistre pas de nœuds ; son ancien formulaire d'enregistrement, qui ne faisait que stocker une fiche, a été supprimé.

## Pour aller plus loin

- [Récompenses et supervision](/light-node/rewards-and-monitoring) — comment la part de 3 % est créditée, réclamée et supervisée.
- [Édition SX](/light-node/sx-edition) — la commande `register` et la référence CLI complète.
