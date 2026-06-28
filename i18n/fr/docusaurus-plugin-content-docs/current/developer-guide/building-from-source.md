---
slug: /developer-guide/building-from-source
title: Compilation depuis les sources
sidebar_label: Compilation depuis les sources
sidebar_position: 1
---

# Compilation depuis les sources

Ce guide vous accompagne dans la compilation du binaire `qorechaind` depuis les sources, couvrant à la fois la version communautaire (open-core) et la version propriétaire complète.

## Prérequis

| Dépendance         | Version minimale           | Notes                                             |
| ------------------ | ------------------------- | ------------------------------------------------- |
| **Go**             | 1.26+                     | Requis pour toutes les compilations                           |
| **CGO**            | Activé (`CGO_ENABLED=1`) | Requis pour les ponts FFI PQC et SVM              |
| **Chaîne d'outils Rust** | Dernière version stable             | Requise pour compiler `libqorepqc` et `libqoresvm` |
| **Make**           | 3.81+                     | Automatisation de la compilation                                  |
| **Git**            | 2.x                       | Récupération des sources                                   |

Vérifiez votre environnement :

```bash
go version        # go1.26.x or later
rustc --version   # stable toolchain
cargo --version
echo $CGO_ENABLED # must be 1
```

:::danger
Chaque invocation de `go build`, `go test` et `go run` **doit** avoir `CGO_ENABLED=1` défini. Les modules PQC et SVM utilisent des ponts FFI qui nécessitent cgo.
:::

## Bibliothèques natives

QoreChain dépend de deux bibliothèques natives compilées en Rust qui sont chargées au moment de l'exécution.

### libqorepqc (cryptographie post-quantique)

La bibliothèque PQC fournit la génération de clés, la signature et la vérification ML-DSA-87 (Dilithium-5) via une interface FFI compatible C.

```bash
cd rust/qorepqc
cargo build --release
```

La bibliothèque compilée est placée dans `lib/{os}_{arch}/` :

| Plateforme    | Fichier de bibliothèque       | Répertoire           |
| ----------- | ------------------ | ------------------- |
| macOS arm64 | `libqorepqc.dylib` | `lib/darwin_arm64/` |
| Linux amd64 | `libqorepqc.so`    | `lib/linux_amd64/`  |
| Linux arm64 | `libqorepqc.so`    | `lib/linux_arm64/`  |

### libqoresvm (runtime SVM)

La bibliothèque SVM fournit l'environnement d'exécution des programmes BPF pour le module x/svm.

```bash
cd rust/qoresvm
cargo build --release
```

La sortie suit la même convention `lib/{os}_{arch}/` que ci-dessus (`libqoresvm.dylib` sur macOS, `libqoresvm.so` sur Linux).

### Définition du chemin de bibliothèque

Les bibliothèques natives doivent être détectables au moment de l'exécution. Définissez la variable d'environnement appropriée pour votre plateforme :

**macOS :**

```bash
export DYLD_LIBRARY_PATH=$(pwd)/lib/darwin_arm64:$DYLD_LIBRARY_PATH
```

**Linux :**

```bash
export LD_LIBRARY_PATH=$(pwd)/lib/linux_amd64:$LD_LIBRARY_PATH
```

:::info
Astuce : Ajoutez l'export à votre profil shell (`~/.bashrc`, `~/.zshrc`) afin qu'il persiste entre les sessions.
:::

## Architecture open-core

QoreChain suit un modèle **open-core** :

* **Version communautaire** — Contient l'ensemble des interfaces de module, des commandes CLI, des définitions protobuf et des types de messages pour chaque module QoreChain (x/pqc, x/ai, x/reputation, x/qca, x/svm, x/crossvm, etc.). Les keepers des modules propriétaires utilisent des **implémentations stub** qui renvoient des valeurs par défaut sûres ou des réponses no-op. Cela permet aux outils tiers, portefeuilles et indexeurs de s'intégrer à toutes les API QoreChain sans nécessiter de code propriétaire.
* **Version complète (propriétaire)** — Active les implémentations complètes des keepers derrière le tag de compilation `proprietary`. Cela inclut la véritable logique de détection d'anomalies par IA, le réglage des paramètres de consensus PRISM, le scoring de réputation avancé et toutes les fonctionnalités de qualité production.

Les deux versions produisent le même nom de binaire `qorechaind` et exposent des commandes CLI et des points de terminaison gRPC/REST identiques. La différence réside dans le comportement à l'exécution de la logique des keepers derrière ces interfaces.

## Version communautaire

```bash
CGO_ENABLED=1 go build -o qorechaind ./cmd/qorechaind/
```

Cela compile toutes les interfaces de modules publics avec des keepers stub pour les fonctionnalités propriétaires. Le binaire résultant est pleinement fonctionnel pour :

* Exécuter un nœud validateur
* Soumettre et interroger des transactions
* Interagir avec les VM EVM, CosmWasm et SVM
* Construire des intégrations et des outils tiers
* Le développement et les tests locaux

## Version complète (propriétaire)

```bash
CGO_ENABLED=1 go build -tags proprietary -o qorechaind ./cmd/qorechaind/
```

L'indicateur `-tags proprietary` active les implémentations complètes des keepers, qui ne font pas partie de l'arborescence source publique.

## Exécution des tests

```bash
CGO_ENABLED=1 go test ./... -count=1
```

L'indicateur `-count=1` désactive la mise en cache des tests, garantissant une exécution propre à chaque fois. Les tests de paquets individuels peuvent être exécutés avec :

```bash
CGO_ENABLED=1 go test ./x/pqc/... -count=1 -v
CGO_ENABLED=1 go test ./x/ai/... -count=1 -v
CGO_ENABLED=1 go test ./x/svm/... -count=1 -v
```

Exécutez les tests des bibliothèques Rust séparément :

```bash
cd rust/qorepqc && cargo test
cd rust/qoresvm && cargo test
```

## Vérification de la compilation

Après une compilation réussie, vérifiez le binaire :

```bash
./qorechaind version
./qorechaind init test-node --chain-id qorechain-diana
```

La commande `init` devrait créer un fichier de genesis et une configuration de nœud dans `~/.qorechaind/` sans erreurs. L'exemple ci-dessus initialise contre le testnet **`qorechain-diana`** — pour le mainnet, remplacez par `--chain-id qorechain-vladi`, le réseau en service exécutant la version de chaîne **v3.1.80**.

## Compilation Docker

Pour les compilations conteneurisées, un Dockerfile est fourni à la racine du dépôt :

```bash
docker build -t qorechaind:latest .
```

L'image Docker gère automatiquement toute la compilation des bibliothèques natives et la configuration des chemins. Consultez le guide [Démarrage rapide](/getting-started/quickstart) pour exécuter un nœud avec Docker Compose.

## Dépannage

<details>

<summary>cgo: C compiler not found</summary>

Installez les outils CLI Xcode (macOS) ou `build-essential` (Linux)

</details>

<details>

<summary>cannot find -lqorepqc</summary>

Compilez d'abord les bibliothèques Rust et définissez `LD_LIBRARY_PATH` / `DYLD_LIBRARY_PATH`

</details>

<details>

<summary>undefined: sonic.*</summary>

Assurez-vous que `go.sum` est à jour : `go mod tidy`

</details>

<details>

<summary>signal: killed during build</summary>

Augmentez la mémoire disponible (fréquent dans Docker avec des limites basses)

</details>

<details>

<summary>PQC tests fail with size mismatch</summary>

Vérifiez que vous utilisez `pqcrypto v0.5.0+` (ML-DSA-87 : pubkey=2592, privkey=4896, sig=4627 octets)

</details>
