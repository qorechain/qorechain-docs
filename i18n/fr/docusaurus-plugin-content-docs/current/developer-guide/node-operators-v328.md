---
slug: /developer-guide/node-operators-v328
title: "Opérateurs de nœuds : liste de contrôle v3.2.8"
sidebar_label: Opérateurs de nœuds v3.2.8
sidebar_position: 11
---

# Opérateurs de nœuds : liste de contrôle v3.2.8

La version **v3.2.8** fonctionne sur le testnet `qorechain-diana` depuis le 12 novembre 2026 (hauteur 9,929,500). Le mainnet `qorechain-vladi` exécute la v3.2.7 depuis le 12 novembre 2026 (hauteur 4,164,600, proposition de gouvernance 16) et n'a pas appliqué la v3.2.8 ; rien dans cette page ne s'applique donc aujourd'hui à un nœud mainnet.

Cette page est la liste courte de ce qu'un opérateur de nœud vérifie et modifie pour la v3.2.8 : les bibliothèques partagées du paquet, les réglages du runtime des contrats, les nouvelles valeurs par défaut de `app.toml`, une nouvelle route REST et les étapes pour mettre à niveau un nœud encore en v3.2.7. Pour le guide complet du nœud, voir [Exécution d'un nœud](/developer-guide/running-a-node).

**Pourquoi c'est important.** La v3.2.8 exécute les contrats intelligents sur une nouvelle bibliothèque de runtime de contrats et facture la mémoire et le chargement du code qu'un appel de contrat utilise. Un nœud qui conserve l'ancien dossier de bibliothèques, ou qui tourne avec trop peu de mémoire pour les contrats, ne démarrera pas ou prendra du retard. Le reste de la liste est un petit travail de configuration.

## 1. Copier tout le dossier `lib/` {#lib-folder}

Le paquet de version contient `qorechaind` et un dossier `lib/` avec quatre bibliothèques partagées :

| Bibliothèque | Rôle |
| --- | --- |
| `libqorepqc.so` | Vérification des signatures post-quantiques |
| `libqoresvm.so` | Runtime SVM |
| `libwasmvm.x86_64.so` | Bibliothèque de runtime de contrats en amont |
| `libwasmvmqore_v1.x86_64.so` | Nouveau dans la v3.2.8 : la bibliothèque de runtime de contrats de QoreChain |

Copiez le **dossier entier**, pas des fichiers isolés. Une ligne `COPY lib/ ...` dans un Dockerfile ou un `cp -r lib/* ...` sur un hôte bare-metal continue de fonctionner quand une version ultérieure ajoute une bibliothèque ; une liste de fichiers nommés, non.

```bash
tar -xzf qorechaind-v3.2.8-b3-linux-amd64.tar.gz
sudo cp qorechaind /usr/local/bin/qorechaind
sudo cp -r lib/. /opt/qorechain/lib/
```

Faites pointer le chargeur vers le dossier de destination (l'entrée `LD_LIBRARY_PATH` ou `ld.so.conf.d` que vous utilisez déjà) et redémarrez. Les commandes ci-dessus sont un modèle ; utilisez les chemins de votre propre installation.

## 2. Cache mémoire des contrats : au moins 256 MiB {#memory-cache}

Le runtime des contrats garde les contrats compilés en mémoire. Dans `app.toml`, le réglage `memory_cache_size` de la section `[wasm]` doit valoir **256 MiB ou plus** :

```toml
[wasm]
memory_cache_size = 256
```

Une valeur inférieure à 256 est relevée à 256 au démarrage du nœud, et le nœud écrit un avertissement dans son journal. Prévoyez la mémoire supplémentaire sur les petites machines.

## 3. Le dossier des contrats est désormais `<home>/wasm` {#wasm-directory}

Le code de contrat compilé se trouve désormais dans `<home>/wasm`, où `<home>` est le répertoire avec lequel vous démarrez le nœud (`--home`). Un nœud dont le code de contrat est encore à l'ancien emplacement continue de l'utiliser et écrit un avertissement. Vous pouvez déplacer le dossier quand cela vous arrange ; arrêtez d'abord le nœud.

## 4. Nouvelles valeurs par défaut de `app.toml` {#app-toml-defaults}

Un nœud initialisé avec la v3.2.8 écrit ces valeurs par défaut. Les fichiers `app.toml` existants **ne sont pas réécrits** : un nœud mis à niveau garde donc ses anciennes valeurs jusqu'à ce que vous les changiez.

| Réglage | Nouvelle valeur par défaut | Ce qu'il fait |
| --- | --- | --- |
| `simulation_gas_limit` | `50000000` | Limite de gas des transactions simulées sur ce nœud. Les portefeuilles et les SDK simulent avant d'envoyer, et cette limite élevée permet de simuler de gros appels de contrat |
| Espaces de noms `api` du JSON-RPC | `eth,net,web3` | L'espace de noms `txpool` n'est pas servi par défaut, car il publie les transactions en attente du nœud. N'ajoutez `txpool` vous-même que si vous en avez besoin |

```toml
simulation_gas_limit = 50000000

[json-rpc]
api = "eth,net,web3"
```

## 5. Limite de gas des requêtes {#query-gas-limit}

Les requêtes de contrat s'exécutent sous une limite de gas locale au nœud, contrôlée par la section `[wasm]` de `app.toml`. L'équipe de la chaîne recommande de la fixer à `0` (aucune limite) sur les validateurs :

```toml
[wasm]
query_gas_limit = 0
```

Ce réglage ne change que ce que votre propre nœud répond aux requêtes de contrat ; il ne change rien à ce que doit contenir un bloc. C'est la recommandation de l'équipe de la chaîne pour les validateurs ; un nœud qui sert des requêtes publiques peut préférer une limite finie.

## 6. Nouvelle route : `GET /qorechain/svm/v1/params` {#svm-params}

La v3.2.8 ajoute une route en lecture seule pour les paramètres du module SVM. Elle est servie par les nœuds en v3.2.8 (testnet) et répond HTTP `501` sur le mainnet, où la version n'est pas appliquée.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

Réponse du testnet le 12 novembre 2026 :

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":false,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

| Champ | Signification |
| --- | --- |
| `enabled` | Indique si la voie de transactions SVM est ouverte. `false` sur le testnet depuis la mise à niveau : les écritures SVM sont donc refusées jusqu'à ce que la gouvernance la rouvre |
| `max_program_size`, `max_account_data_size` | Limites de taille en octets (10,485,760 chacune) |
| `compute_budget_max` | Plus grand budget de calcul qu'une transaction peut demander (1,400,000) |
| `lamports_per_byte`, `rent_exemption_multi` | Paramètres du prix de stockage |
| `svm_slot_offset`, `default_sig_scheme`, `max_cpi` | Décalage de numérotation des slots, schéma de signature par défaut et limite de profondeur des appels entre programmes |
| `max_custody_uqor`, `max_custody_hard_uqor`, `max_account_excess_uqor` | Limites du QOR natif qu'un compte SVM peut détenir, en uqor |

Lisez `enabled` avant d'afficher un bouton d'envoi SVM ; voir [Développement SVM](/developer-guide/svm-development). La route `GET /qorechain/svm/v1/cluster_info` est une route distincte qui renvoie l'identité du cluster.

## 7. Vérifier le manifeste {#manifest}

Le manifeste est la source de vérité pour savoir quel binaire installer :

```bash
curl -s https://download.qore.host/testnet/latest.json | jq '{version, minCompatible, upgradeType, upgradeHeight, binary: .binary.url}'
```

Le 12 novembre 2026, il répondait `version` `3.2.8`, `minCompatible` `3.2.8`, `upgradeType` `height`, `upgradeHeight` `9929500` et le binaire `qorechaind-v3.2.8-b3-linux-amd64.tar.gz`. Vérifiez que `version` est égal à `minCompatible` avant de vous fier à `binary.url`, et contrôlez l'archive avec le `sha256` du même fichier. Le manifeste du mainnet se trouve à `https://download.qore.host/mainnet/latest.json` et mentionne la v3.2.6 jusqu'à l'annonce d'une mise à niveau du mainnet.

## 8. Mettre à niveau un nœud encore en v3.2.7 {#upgrade-from-v327}

La hauteur de mise à niveau du testnet est dépassée : un nœud encore en v3.2.7 s'arrête donc à la hauteur 9,929,500 avec `UPGRADE "v3.2.8" NEEDED`. Son état est conservé et il n'a pas besoin de se resynchroniser.

1. Téléchargez l'archive indiquée dans le manifeste et vérifiez son SHA-256.
2. Arrêtez le nœud.
3. Remplacez `qorechaind` et copiez le dossier `lib/` en entier ([étape 1](#lib-folder)).
4. Vérifiez `[wasm] memory_cache_size` ([étape 2](#memory-cache)) et décidez de `simulation_gas_limit`, des espaces de noms JSON-RPC et de `query_gas_limit` ([étapes 4 et 5](#app-toml-defaults)).
5. Démarrez le nœud et surveillez le journal. Un avertissement sur le dossier des contrats ou sur le cache mémoire est normal si vous ne les avez pas modifiés.
6. Confirmez qu'il suit la chaîne :

```bash
curl -s localhost:26657/status | jq '.result.sync_info.catching_up'
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params | jq '.params.enabled'
```

Un nouveau nœud qui rejoint le testnet démarre directement avec le binaire v3.2.8 ; voir [Connexion au testnet](/getting-started/connecting-to-testnet) pour la synchronisation d'état et les pairs, et [Exécution d'un nœud](/developer-guide/running-a-node#upgrades) pour l'historique des mises à niveau.

## Limites et erreurs

| Ce que vous voyez | Signification | Que faire |
| --- | --- | --- |
| `UPGRADE "v3.2.8" NEEDED` et le nœud s'arrête à la hauteur 9,929,500 | Le nœud est encore sur le binaire v3.2.7 | Section 8 |
| Erreur au démarrage à propos d'une bibliothèque partagée manquante | `lib/` n'a pas été copié en entier, ou le chargeur ne pointe pas dessus | Section 1 |
| Avertissement indiquant que `memory_cache_size` a été relevé | La valeur configurée est inférieure à 256 MiB | Fixez 256 ou plus |
| Avertissement à propos du dossier des contrats | Le code de contrat est encore à l'ancien emplacement | Déplacez-le vers `<home>/wasm` quand cela vous arrange |
| `501` sur `/qorechain/svm/v1/params` | Le nœud n'est pas en v3.2.8 (le mainnet exécute la v3.2.7) | Normal sur le mainnet |

## Pages associées

* [Exécution d'un nœud](/developer-guide/running-a-node), dont [Runtime des contrats dans la v3.2.8](/developer-guide/running-a-node#v328-node)
* [Exécution d'un validateur](/developer-guide/running-a-validator)
* [Connexion au testnet](/getting-started/connecting-to-testnet)
* [Points de terminaison REST et gRPC](/api-reference/rest-grpc-endpoints)
