---
slug: /developer-guide/building-from-source
title: Compilation depuis les sources
sidebar_label: Compilation depuis les sources
sidebar_position: 1
---

# Compilation depuis les sources

Ce guide vous accompagne dans la compilation du binaire communautaire `qorechaind` depuis les sources publiques, et explique à quoi ce binaire sert et ne sert pas.

:::caution Une compilation depuis les sources ne peut pas rejoindre le mainnet ni le testnet
Le dépôt public contient les interfaces de module avec des **keepers factices (stub)** ; les implémentations de keepers critiques pour le consensus et le signataire post-quantique ne figurent pas dans l'arborescence de sources publique. Un binaire compilé à partir de celle-ci ne peut pas reproduire l'état de consensus des réseaux, et il ne peut pas créer la signature post-quantique hybride que requiert chaque transaction de la voie Cosmos. Depuis la v3.2.3, il **refuse aussi de démarrer** sur `qorechain-vladi` ou `qorechain-diana` (il les reconnaît à l'identifiant de chaîne et à l'heure de genèse ; un devnet local qui réutilise un identifiant de chaîne public avec sa propre genèse n'est pas concerné). `qorechaind start --community-unenforced-pqc` outrepasse ce refus pour des expérimentations ; le nœud ne vérifie alors aucune signature post-quantique et peut diverger du réseau sans avertissement, ne l'utilisez donc jamais pour un nœud sur lequel vous comptez. Pour exécuter un nœud ou un validateur sur le mainnet ou le testnet, installez le **binaire de release** indiqué dans le manifeste en production (`https://download.qore.host/mainnet/latest.json` ou `.../testnet/latest.json`) ; voir [Exécuter un nœud](/developer-guide/running-a-node) et [Exécuter un validateur](/developer-guide/running-a-validator).
:::

## Prérequis

| Dépendance         | Version minimale          | Remarques                                          |
| ------------------ | ------------------------- | --------------------------------------------------- |
| **Go**             | 1.26+                     | Requise pour toutes les compilations                |
| **CGO**            | Activé (`CGO_ENABLED=1`)  | Requis pour les ponts FFI PQC et SVM                 |
| **Make**           | 3.81+                     | Automatisation de la compilation                     |
| **Git**            | 2.x                       | Récupération des sources                             |

Vérifiez votre environnement :

```bash
go version        # go1.26.x or later
echo $CGO_ENABLED # must be 1
```

:::danger
Chaque invocation de `go build`, `go test` et `go run` **doit** avoir `CGO_ENABLED=1` défini. Le nœud lie des bibliothèques natives (l'environnement d'exécution QoreChain Native et, dans la compilation de release, les bibliothèques PQC et SVM) via cgo.
:::

## Bibliothèques natives

### libqorepqc et libqoresvm

Les bibliothèques post-quantique (`libqorepqc`) et SVM (`libqoresvm`) sont compilées à partir de sources Rust qui **ne font pas partie du dépôt public** (il n'existe aucun répertoire `rust/` dans `qorechain-core`). La compilation communautaire n'en a pas besoin. Les archives de release des réseaux embarquent les bibliothèques compilées (`libqorepqc.so`, `libqoresvm.so`, `libwasmvm.x86_64.so`) dans un répertoire `lib/` à côté de `qorechaind` ; placez-les dans `lib/{os}_{arch}/` ou indiquez leur emplacement au chargeur comme ci-dessous.

### Définition du chemin de la bibliothèque

Lorsque vous utilisez le binaire de release, ses bibliothèques partagées doivent être détectables au moment de l'exécution. Définissez la variable d'environnement appropriée pour votre plateforme :

**macOS :**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux :**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Astuce : ajoutez l'export à votre profil shell (`~/.bashrc`, `~/.zshrc`) pour qu'il persiste entre les sessions.
:::

## Architecture Open-Core

QoreChain suit un modèle **open-core** :

* **Compilation communautaire** — Contient l'intégralité des interfaces de module, des commandes CLI, des définitions protobuf et des types de messages pour chaque module QoreChain (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm, etc.). Les keepers des modules propriétaires utilisent des **implémentations factices (stub)** qui renvoient des valeurs par défaut sûres ou des réponses sans effet (no-op). Cela permet aux outils tiers, aux portefeuilles et aux indexeurs de s'intégrer avec toutes les API QoreChain sans nécessiter de code propriétaire.
* **Compilation complète** — Contient les implémentations complètes des keepers (la véritable logique de module critique pour le consensus et le signataire post-quantique). Elle est distribuée sous forme de binaires de release publiés sur [download.qore.host](https://download.qore.host) ; elle n'est pas compilée à partir de l'arborescence de sources publique.

Les deux compilations produisent un binaire portant le même nom `qorechaind` et exposent les mêmes commandes CLI. La différence réside dans le comportement à l'exécution de la logique des keepers derrière ces interfaces.

## Compilation communautaire

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Cela compile toutes les interfaces de module publiques avec des keepers factices pour les fonctionnalités propriétaires. Le binaire résultant est destiné à :

* Le développement et les tests en local (par exemple un devnet à nœud unique)
* L'interrogation d'un réseau (les commandes `query ...` fonctionnent face à n'importe quel nœud)
* La création d'intégrations et d'outils tiers face aux interfaces des modules

Ce n'est pas un moyen de rejoindre le mainnet ou le testnet en tant que validateur ni d'y transiger : il ne dispose d'aucun signataire post-quantique (`tx pqc gen-key` et `tx pqc cosign` renvoient une erreur) et ses keepers factices ne reproduisent pas les règles de consensus des réseaux.

## Compilation complète (binaire de release)

Les implémentations complètes des keepers, ainsi que le signataire derrière `tx pqc gen-key` et `tx pqc cosign`, ne figurent pas dans l'arborescence de sources publique ; elles ne peuvent donc pas être compilées à partir de celle-ci. Les binaires publiés sur [download.qore.host](https://download.qore.host) constituent la compilation complète ; utilisez-les pour le mainnet et le testnet.

## Exécution des tests

```bash
CGO_ENABLED=1 go test ./... -count=1
```

Le drapeau `-count=1` désactive la mise en cache des tests, garantissant une exécution propre à chaque fois. Les tests de packages individuels peuvent être exécutés avec :

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Les tests qui exercent les bibliothèques natives ou les keepers propriétaires sont compilés uniquement dans la compilation complète et ne font pas partie de la suite publique.

## Vérification de la compilation

Après une compilation réussie, vérifiez le binaire :

```bash
./qorechaind version   # may print nothing: release binaries do not report a version string
./qorechaind init test-node --chain-id qorechain-diana
```

La commande `init` doit créer un fichier genesis et une configuration de nœud dans `~/.qorechaind/` sans erreur. L'exemple ci-dessus initialise le nœud sur le testnet **`qorechain-diana`** — pour le mainnet, remplacez par `--chain-id qorechain-vladi`, le réseau en production (version du nœud **v3.2.4**).

## Compilation Docker

Un Dockerfile est fourni à la racine du dépôt :

```bash
docker build -t qorechaind:community .
```

Il compile le binaire **communautaire** (son propre commentaire indique « Public build — no PQC library »), l'image est donc destinée au développement local et à l'outillage, et non à suivre le mainnet ou le testnet. Pour exécuter un nœud de réseau dans Docker, encapsulez plutôt le binaire de release ; voir [Exécuter un nœud](/developer-guide/running-a-node#docker-compose).

## Dépannage

<details>

<summary>cgo : compilateur C introuvable</summary>

Installez les outils en ligne de commande Xcode (macOS) ou `build-essential` (Linux)

</details>

<details>

<summary>Introuvable : -lqorepqc</summary>

Vous liez une compilation qui attend les bibliothèques natives. Utilisez la compilation communautaire (elle n'en a pas besoin) ou l'archive de release, qui les embarque, et définissez `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH` sur son répertoire `lib/`

</details>

<details>

<summary>Symbole non défini : sonic.*</summary>

Assurez-vous que `go.sum` est à jour : `go mod tidy`

</details>

<details>

<summary>Signal : processus arrêté pendant la compilation</summary>

Augmentez la mémoire disponible (cas fréquent avec Docker lorsque les limites sont basses)

</details>

<details>

<summary>Les tests PQC échouent avec une incompatibilité de taille</summary>

Les tailles ML-DSA-87 sont : clé publique 2 592 octets, clé secrète 4 896 octets et signature 4 627 octets. Toute autre taille indique un algorithme différent ou une valeur tronquée.

</details>
