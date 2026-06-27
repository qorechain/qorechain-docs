---
slug: /light-node/sx-edition
title: Édition SX (démon serveur)
sidebar_label: Édition SX
sidebar_position: 2
---

# Édition SX — démon serveur

L'édition **SX (Server eXperience)** est le nœud léger sans interface : un démon plus une CLI de gestion complète, conçue pour les serveurs et l'automatisation. Le binaire est `lightnode-sx`. Il s'agit de la lignée **v3.1.1** du nœud léger (sa propre version, distincte de la version de la chaîne).

## Installation

Vous pouvez compiler le binaire depuis les sources ou l'exécuter avec Docker.

### Compiler depuis les sources

Le nœud léger nécessite **Go 1.26.1** et se compile avec CGO activé, car la cryptographie post-quantique utilise une bibliothèque native (`libqorepqc`).

```bash
CGO_ENABLED=1 go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Cela produit `build/lightnode-sx`. Exécutez-le directement, ou copiez-le dans votre `PATH`.

### Docker

Une configuration Docker est fournie. Le service SX se compile à partir de `Dockerfile.sx` :

```bash
docker compose up lightnode-sx
```

Le conteneur SX conserve ses données dans un volume nommé monté sur `/root/.qorechain-lightnode` et lit l'adresse RPC de la chaîne depuis la variable d'environnement `QORECHAIN_RPC_ADDR`.

## Configuration

Le nœud léger lit un fichier de configuration TOML. Par défaut, il recherche `config.toml` dans le répertoire personnel (`~/.qorechain-lightnode/config.toml`). Vous n'écrivez normalement pas ce fichier à la main — l'[assistant `onboard`](#first-run-onboard) le crée pour vous — mais il est utile d'en comprendre les options.

Deux options persistantes s'appliquent à chaque commande :

- `--config <path>` — pointer vers un fichier de configuration situé à un emplacement non par défaut.
- `--home <dir>` — remplacer le répertoire personnel utilisé pour les données et les clés (par défaut `~/.qorechain-lightnode`).

Les options de configuration les plus pertinentes, du point de vue de l'utilisation :

| Option | Ce qu'elle contrôle |
| --- | --- |
| `chain_id` | L'identifiant du réseau (par exemple `qorechain-diana` sur testnet, `qorechain-vladi` sur mainnet). |
| `rpc_addr` | Le point d'accès RPC de la chaîne auquel le démon se connecte. Laissez vide pour fonctionner en **mode local uniquement**. |
| `primary_addr` / `witness_addrs` | Les points d'accès RPC primaire et témoins utilisés par le client léger à saut (skipping light client). |
| `trust_period` / `max_clock_drift` | La fenêtre de confiance du client léger (par exemple `168h`) et la dérive d'horloge autorisée. |
| `data_dir` | Où le nœud stocke sa base de données et ses en-têtes. |
| `keyring_backend` / `key_name` | Le backend de keyring (`file` ou `os`) et le nom de la clé d'opérateur. |
| `[delegation]` | Auto-capitalisation on/off, intervalle de capitalisation, récompense minimale à percevoir, ensemble de validateurs, poids de répartition, rééquilibrage et réputation minimale. |
| `[telemetry]` | Si la télémétrie est activée et les intervalles de rafraîchissement pour les validateurs, le réseau, le pont et la tokenomics. |
| `log_level` / `log_format` | La verbosité des logs (`debug`, `info`, `warn`, `error`) et le format (`text` ou `json`). |

Les valeurs par défaut de la délégation activent l'auto-capitalisation avec un intervalle de `1h` et le rééquilibrage tenant compte de la réputation — voir [Récompenses et supervision](/light-node/rewards-and-monitoring) pour savoir ce que cela fait.

## Premier démarrage : `onboard` {#first-run-onboard}

Au premier lancement, `start` s'arrêtera et vous orientera vers l'assistant d'onboarding s'il n'existe pas encore de fichier de configuration. Exécutez l'assistant :

```bash
build/lightnode-sx onboard
```

`onboard` vous guide à travers la configuration en quatre étapes :

1. **Auto-test PQC** — exécute l'aller-retour complet Dilithium-5 (les mêmes vérifications que [`selftest`](#verify-the-pqc-stack-selftest)). Si la pile PQC échoue, l'assistant refuse de continuer.
2. **Point d'accès RPC de la chaîne** — collez votre URL RPC QoreChain, ou laissez-la vide pour fonctionner en **mode local uniquement** tant qu'aucune connexion à la chaîne n'est nécessaire. Si vous fournissez une URL, l'assistant teste son accessibilité en direct.
3. **Clé privée du validateur** — collez une clé privée Dilithium-5 encodée en hexadécimal, ou tapez `g` (ou `generate`) pour générer une nouvelle paire de clés sur ce nœud.
4. **Sauvegarde** — écrit `config.toml` et stocke la clé dans le keyring.

:::note Mode local uniquement
Si vous laissez le point d'accès vide, le démon démarre en mode local uniquement : la pile PQC est entièrement exercée, mais le nœud ne synchronise aucune chaîne. Relancez `onboard` une fois votre point d'accès de chaîne prêt pour y pointer le nœud.
:::

`onboard` écrase toujours la configuration active. Utilisez `--config` pour écrire vers un chemin non par défaut, ou `--non-interactive` pour échouer immédiatement au lieu d'afficher des invites (utile en CI).

## Exécution : `start`

Une fois que l'onboarding a écrit une configuration, démarrez le démon :

```bash
build/lightnode-sx start
```

Le démon synchronise les en-têtes, suit les délégations et sert la télémétrie jusqu'à interruption. Si vous souhaitez intentionnellement démarrer sans fichier de configuration (local uniquement, sans RPC de chaîne), passez `--skip-onboarding-check`.

## Vérifier la pile PQC : `selftest` {#verify-the-pqc-stack-selftest}

À tout moment, vous pouvez confirmer que la pile post-quantique est fonctionnelle :

```bash
lightnode-sx selftest
```

`selftest` exécute cinq vérifications sur Dilithium-5 (ML-DSA-87) et se termine en moins d'une seconde :

1. **Keygen** — générer une nouvelle paire de clés.
2. **Signature** — signer un message de test.
3. **Vérification (signature valide)** — confirmer que la signature se vérifie avec la clé publique correspondante.
4. **Rejet d'une signature altérée** — inverser un octet de la signature ; la vérification doit la rejeter.
5. **Rejet d'un message altéré** — inverser un octet du message ; la vérification doit le rejeter.

Si une vérification échoue, le binaire se termine avec un code non nul accompagné d'une sortie de diagnostic. C'est le même test que l'assistant d'onboarding exécute en première étape, et il est pratique pour la vérification avant déploiement et les diagnostics de support.

## Commandes de gestion

La CLI SX inclut des commandes pour inspecter l'état du nœud et gérer les clés :

| Commande | Objet |
| --- | --- |
| `status` | Afficher l'état de synchronisation du nœud et du client léger (ID de chaîne, dernière hauteur, état de rattrapage). |
| `keys create <name>` | Créer une nouvelle clé Dilithium-5. |
| `keys list` | Lister les clés du keyring. |
| `keys import <name> <hex-privkey>` | Importer une clé privée encodée en hexadécimal. |
| `keys export <name>` | Exporter une clé privée en hexadécimal. |
| `register` | Afficher la commande d'enregistrement on-chain pour ce nœud — voir [Enregistrement et licences](/light-node/registration-and-licensing). |
| `validators` | Lister les validateurs liés (bonded). |
| `delegation` | Afficher les délégations actuelles depuis la base de données locale. |
| `rewards` | Afficher les récompenses de staking en attente. |
| `network` | Afficher la télémétrie réseau (en-têtes récemment synchronisés) depuis la base de données locale. |
| `version` | Afficher la version du binaire. |

Pour les détails sur le staking, les récompenses et la supervision, voir [Récompenses et supervision](/light-node/rewards-and-monitoring). Pour s'enregistrer on-chain, voir [Enregistrement et licences](/light-node/registration-and-licensing).
