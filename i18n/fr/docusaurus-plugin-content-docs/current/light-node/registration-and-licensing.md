---
slug: /light-node/registration-and-licensing
title: Enregistrement et licences
sidebar_label: Enregistrement & Licences
sidebar_position: 4
---

# Enregistrement et licences

Pour gagner la [part de récompense de 3 % réservée aux nœuds légers](/light-node/rewards-and-monitoring), un nœud léger doit être **enregistré on-chain** et doit continuer à prouver qu'il est actif. Cette page explique comment fonctionne l'enregistrement, comment le nœud prouve sa vivacité (liveness), et comment obtenir une licence pour un nœud via le Dashboard puis l'enregistrer on-chain.

:::note L'enregistrement au programme de récompenses n'est pas encore ouvert
Aucune licence `lightnode_operator` n'a été accordée sur l'un ou l'autre réseau et aucun nœud n'est enregistré, de sorte que la chaîne refuse aujourd'hui tout enregistrement. Faire tourner et synchroniser un nœud ne nécessite aucune licence. Voir [État du programme de récompenses](/light-node/overview#reward-program-status) pour savoir comment vérifier l'état actuel.
:::

## Enregistrement on-chain

L'enregistrement inscrit votre nœud léger sur la chaîne afin que le protocole sache qu'il existe, de quel type il est (`sx` ou `ux`) et quelle clé d'opérateur le contrôle. Une fois enregistré et actif, le nœud devient éligible à la part de récompense des nœuds légers.

### Prérequis {#requirements}

La chaîne vérifie tous les points suivants lors de l'exécution de votre transaction d'enregistrement :

1. Une licence `lightnode_operator` active sur l'adresse de l'opérateur.
2. Au moins **1 000 QOR bondés** auprès de validateurs depuis cette même adresse (votre total sur l'ensemble des validateurs). Déléguez **avant** de vous enregistrer : depuis la page de staking du Dashboard, ou avec `qorechaind tx staking delegate` (et la co-signature post-quantique, comme pour toute transaction).
3. Un solde sur le compte de l'opérateur pour payer les **frais d'enregistrement de 1 QOR** et les frais de transaction. Le démon paie des frais pour chaque heartbeat depuis ce compte (par défaut `50000uqor` par heartbeat, `[heartbeat] fees`).
4. Moins de 10 000 nœuds légers enregistrés sur l'ensemble du réseau.

### Générer les commandes d'enregistrement

L'enregistrement s'effectue depuis votre **adresse d'opérateur** : un compte `qor1…` approvisionné, créé avec `qorechaind` (ou n'importe quel portefeuille Cosmos), qui reçoit également les récompenses. La clé Dilithium-5 propre au nœud n'a pas d'adresse ; elle devient la clé post-quantique du compte. Placez l'adresse dans `config.toml` comme `operator_address`, et assurez-vous que `key_name` et `chain_id` sont définis comme décrit dans [Premier lancement](/light-node/sx-edition#first-run-onboard) (`onboard` ne les définit pas correctement à votre place). Exécutez ensuite :

```bash
lightnode-sx register
```

Avant d'afficher quoi que ce soit, la commande demande à la chaîne si `operator_address` détient une licence `lightnode_operator` active. Elle le fait parce que la chaîne refuse un enregistrement sans licence, et qu'il est inutile de vous fournir des commandes qui seront refusées. Sans licence, elle s'arrête avec :

```text
operator address qor1... has no lightnode_operator licence. Buy one at
https://dashboard.qorechain.io -> Tools -> Buy License, and enter this operator
address there; the on-chain grant follows and register works once it lands.
```

Une licence achetée sur le Dashboard est accordée on-chain lors d'une étape distincte ; `register` peut donc encore indiquer « no licence » pendant un moment après l'achat ; `lightnode-sx status` affiche la même ligne `Licence:` et passe à `active` lorsque l'octroi arrive. Un nœud déjà enregistré est signalé comme tel au lieu d'être enregistré deux fois.

Avec une licence active, la commande lit la clé du nœud depuis le keyring et affiche, avec vos valeurs déjà renseignées :

1. **Une seule fois**, la commande qui rattache la clé du nœud au compte de l'opérateur en tant que clé post-quantique (`qorechaind tx pqc register-key-v2 dilithium5 <pubkey> hybrid --from operator …`), après avoir exporté la clé dans le répertoire de clés de `qorechaind` avec `lightnode-sx keys export`. Ignorez cette étape si le compte possède déjà une clé post-quantique (`GET /qorechain/pqc/v1/account/<address>` indique `found: true`). Si la limite de gas affichée est épuisée, relancez-la avec `--gas 600000 --fees 60000uqor`.
2. L'enregistrement lui-même : `qorechaind tx lightnode register <type> <version> --from operator --generate-only > register.json`, puis `qorechaind tx pqc cosign register.json --from operator --pqc-key <key>`. La chaîne exige la co-signature post-quantique sur chaque transaction, l'enregistrement est donc un couple génération-puis-co-signature.

La commande accepte deux options facultatives :

- `--type` — le type de nœud, `sx` ou `ux` (par défaut `sx`).
- `--version` — la version du nœud à enregistrer (par défaut, la version du binaire lui-même).

Soumettez sur le réseau que vous rejoignez (testnet `qorechain-diana` ou mainnet `qorechain-vladi`). L'enregistrement exige une licence `lightnode_operator` active accordée sur l'adresse de l'opérateur ; la chaîne le refuse dans le cas contraire.

:::note
`lightnode-sx register` **affiche** les commandes pour que vous les examiniez et les exécutiez — elle ne diffuse rien d'elle-même. Vous gardez ainsi le contrôle sur le moment et la manière dont le nœud est enregistré.
:::

## Preuves de vivacité par heartbeat

L'enregistrement seul ne suffit pas pour rester éligible. Un nœud léger enregistré doit prouver en continu qu'il est en ligne en soumettant des **preuves de vivacité par heartbeat**. Ces heartbeats sont la manière dont la chaîne distingue les nœuds actifs — éligibles à la part de récompense — des nœuds enregistrés mais hors ligne.

En pratique, cela signifie qu'un nœud enregistré et maintenu en fonctionnement (et synchronisé) conserve son éligibilité, tandis qu'un nœud qui passe hors ligne cesse de prouver sa vivacité et perd son éligibilité jusqu'à son retour. Maintenir le démon en fonctionnement et en bonne santé fait donc partie intégrante de la perception des récompenses — voir [Récompenses et supervision](/light-node/rewards-and-monitoring) pour savoir comment surveiller la santé du heartbeat et de la synchronisation.

### Pipeline de heartbeat co-signé PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain est **PQC obligatoire par défaut**, de sorte que la transaction de vivacité par heartbeat est produite via un pipeline post-quantique co-signé plutôt que par une signature purement classique. Le démon construit le heartbeat non signé, puis le co-signe avec une signature **hybride Dilithium-5 (ML-DSA-87)** avant diffusion — la même posture post-quantique que la chaîne impose à chaque transaction. Le nœud soumet un heartbeat par fenêtre `interval_blocks` (correspondant au paramètre `heartbeat_interval` de la chaîne), en se cadençant sur la hauteur de bloc pour éviter les rejets de soumission anticipée.

Les heartbeats on-chain sont activés par défaut. Le démon a besoin de : `operator_address` dans la configuration ; d'un binaire `qorechaind` **v3.2.0 ou plus récent** (dans le `PATH` ou à `[heartbeat] qorechaind_path` ; l'image Docker SX construite à partir du tag `v3.1.4` en embarque un — les signataires plus anciens sont refusés par la chaîne) ; et du répertoire personnel de `qorechaind` contenant la clé de l'opérateur et la clé du nœud exportée (`qorechaind_home`, par défaut `~/.qorechaind`). Deux phrases secrètes de keyring doivent figurer dans l'environnement : `QORE_LIGHTNODE_KEYRING_PASSPHRASE` pour le keyring du nœud et `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` pour le keyring de `qorechaind` (la seconde est transmise à `qorechaind` sur l'entrée standard, jamais placée sur une ligne de commande). `qorechaind` est publié pour **Linux amd64 uniquement** (voir l'entrée `binary` de `https://download.qore.host/mainnet/latest.json`) ; sur les hôtes macOS, Windows ou ARM, le nœud fonctionne et se synchronise mais ne peut pas signer nativement les heartbeats ; un nœud enregistré doit donc exécuter l'édition SX sur Linux amd64, ou l'image Docker sur un hôte amd64. Il se cadence sur le `last_heartbeat` de la chaîne pour ce nœud, de sorte qu'un redémarrage n'envoie pas de doublon et n'attend pas un intervalle entier. Tant que le nœud n'est pas enregistré, il n'émet pas de heartbeat ; il consigne plutôt la raison, une fois à chaque changement d'état : pas de licence (avec l'endroit où en acheter une) ou licence active mais non enregistrée (exécutez `lightnode-sx register`). `lightnode-sx status` affiche les lignes `Signer:`, `Licence:` et `Registration:` pour que la raison soit visible sans lire les journaux. Lorsque le signataire est absent, le nœud continue de fonctionner et de se synchroniser ; il ne peut simplement pas rester actif on-chain, et `status` l'indique.

## Enregistrement et licence via le Dashboard

Vous pouvez vérifier votre statut de licence et conserver les informations de votre nœud dans l'onglet **Tools → Light Node** du Dashboard QoreChain. Faire tourner un nœud et rejoindre son programme de récompenses sont deux choses distinctes, et le Dashboard les garde séparées :

1. **Obtenez le logiciel (aucune licence requise).** L'onglet fournit les liens vers les binaires du nœud léger pour le réseau sélectionné (les mêmes fichiers que `https://download.qore.host/<net>/lightnode/latest.json`, avec leurs sommes de contrôle sha256) et présente un kit de démarrage pour un nœud QoreChain complet. Un nœud léger n'a besoin que du binaire `lightnode-sx` ou `lightnode-ux` et d'un point de terminaison RPC ; suivez [Édition SX](/light-node/sx-edition).
2. **Vérifiez le statut de votre programme de récompenses.** Rejoindre la part de récompense des nœuds légers est une étape distincte, verrouillée on-chain : une licence `lightnode_operator` active accordée on-chain, au moins 1 000 QOR bondés (votre total sur l'ensemble des validateurs, lu en direct depuis le staking), et des frais d'enregistrement de 1 QOR. **L'inscription n'est pas encore ouverte** (voir [État du programme de récompenses](/light-node/overview#reward-program-status)), et acheter une licence ne l'ouvre pas par anticipation. Le temps de fonctionnement est compté à partir du bloc où votre nœud s'enregistre on-chain, pas avant.
3. **Licence.** Une licence achetée via **Buy License** est d'abord enregistrée de notre côté ; l'octroi qui la fait reconnaître on-chain est une étape distincte, et la chaîne refuse l'enregistrement tant qu'il n'est pas arrivé. L'achat nécessite l'adresse `qor1…` à laquelle la licence sera accordée, et affiche **Paid — awaiting on-chain grant** jusqu'à ce que la chaîne le confirme. `lightnode-sx status` affiche la ligne `Licence:` on-chain.
4. **Enregistrement de la demande.** Si votre compte détient une licence enregistrée comme active, l'onglet affiche également un court formulaire (adresse d'opérateur, moniker, URL du point de terminaison public et confirmation de l'engagement de stake) suivi d'un récapitulatif de ce que vous avez soumis. Cela consigne votre demande auprès du Dashboard ; cela n'envoie **pas** la transaction d'enregistrement on-chain.
5. **Enregistrez-vous on-chain.** Une fois la licence accordée et 1 000 QOR bondés depuis votre adresse d'opérateur, enregistrez-vous avec `lightnode-sx register` et les commandes `qorechaind` qu'elle affiche (voir ci-dessus).

Le Dashboard est utile pour télécharger le nœud, vérifier les prérequis de la chaîne et la santé de votre nœud, et acheter une licence. L'enregistrement on-chain proprement dit reste toujours la transaction `lightnode-sx register`.

## Pour aller plus loin

- [Récompenses et supervision](/light-node/rewards-and-monitoring) — comment la part de 3 % est créditée, réclamée et supervisée.
- [Édition SX](/light-node/sx-edition) — la commande `register` et la référence CLI complète.
