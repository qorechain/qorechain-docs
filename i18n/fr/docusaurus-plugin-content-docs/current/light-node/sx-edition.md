---
slug: /light-node/sx-edition
title: Édition SX (démon serveur)
sidebar_label: Édition SX
sidebar_position: 2
---

# Édition SX — Démon serveur

L'édition **SX (Server eXperience)** est le light node headless : un démon associé à une CLI de gestion complète, conçu pour les serveurs et l'automatisation. Le binaire s'appelle `lightnode-sx`. Il s'agit de la ligne **v3.1.1** du light node (sa propre version, distincte de la version de la chaîne).

## Installation

Les binaires précompilés constituent la voie la plus simple — le client light node s'exécute nativement sur **cinq plateformes sans aucune dépendance native** : Linux (amd64, arm64), macOS (Intel, Apple Silicon) et Windows (amd64, arm64). Chaque binaire pèse environ 16 Mo — il suffit de le télécharger et de l'exécuter, sans bibliothèques séparées à installer.

Vous pouvez aussi compiler le binaire depuis les sources ou l'exécuter avec Docker.

### Compiler depuis les sources

Le light node nécessite **Go 1.26.1**. Sa cryptographie post-quantique est une implémentation pure Go (pas de CGO, pas de bibliothèque native), donc la compilation croisée pour l'une des cinq plateformes prises en charge fonctionne exactement comme pour tout autre binaire Go :

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Cela produit `build/lightnode-sx`. Exécutez-le directement, ou copiez-le dans votre `PATH`. Avant d'enregistrer le nœud, vérifiez la pile de signature post-quantique avec [`selftest`](#verify-the-pqc-stack-selftest).

### Docker

Une configuration Docker est fournie. Le service SX se construit à partir de `Dockerfile.sx` :

```bash
docker compose up lightnode-sx
```

Le conteneur SX persiste ses données dans un volume nommé monté sur `/root/.qorechain-lightnode` et lit l'adresse RPC de la chaîne depuis la variable d'environnement `QORECHAIN_RPC_ADDR`.

## Configuration

Le light node lit un fichier de configuration TOML. Par défaut, il recherche `config.toml` dans le répertoire personnel (`~/.qorechain-lightnode/config.toml`). Vous n'avez normalement pas besoin d'écrire ce fichier à la main — l'[assistant `onboard`](#first-run-onboard) le crée pour vous — mais il est utile d'en comprendre les options.

Deux options persistantes s'appliquent à chaque commande :

- `--config <path>` — pointe vers un fichier de configuration situé à un emplacement non par défaut.
- `--home <dir>` — remplace le répertoire personnel utilisé pour les données et les clés (par défaut `~/.qorechain-lightnode`).

Les options de configuration les plus pertinentes, au niveau de l'usage :

| Option | Ce qu'elle contrôle |
| --- | --- |
| `chain_id` | L'identifiant du réseau (par exemple `qorechain-diana` sur le testnet, `qorechain-vladi` sur le mainnet). |
| `rpc_addr` | Le point de terminaison RPC de la chaîne auquel le démon se connecte. Laissez vide pour fonctionner en **mode local uniquement**. |
| `primary_addr` / `witness_addrs` | Les points de terminaison RPC primaire et témoins utilisés par le light client à sauts (skipping light client). |
| `trust_period` / `max_clock_drift` | Fenêtre de confiance du light client (par exemple `168h`) et dérive d'horloge autorisée. |
| `data_dir` | L'emplacement où le nœud stocke sa base de données et ses en-têtes. |
| `keyring_backend` / `key_name` | Backend de trousseau de clés (`file` ou `os`) et nom de la clé de l'opérateur. |
| `[delegation]` | Auto-compound activé/désactivé, intervalle de compoundage, récompense minimale à réclamer, ensemble de validateurs, pondérations de répartition, rééquilibrage et réputation minimale. |
| `[telemetry]` | Activation de la télémétrie et intervalles de rafraîchissement pour les validateurs, le réseau, le pont et la tokenomics. |
| `log_level` / `log_format` | Verbosité des journaux (`debug`, `info`, `warn`, `error`) et format (`text` ou `json`). |

Les valeurs par défaut de la délégation activent l'auto-compound sur un intervalle de `1h` ainsi que le rééquilibrage tenant compte de la réputation — voir [Récompenses et surveillance](/light-node/rewards-and-monitoring) pour le détail de leur fonctionnement.

## Premier lancement : `onboard` {#first-run-onboard}

Au premier lancement, `start` s'arrêtera et vous orientera vers l'assistant d'intégration si aucun fichier de configuration n'existe encore. Lancez l'assistant :

```bash
build/lightnode-sx onboard
```

`onboard` vous guide à travers quatre étapes de configuration :

1. **Auto-test PQC** — exécute le cycle complet de test Dilithium-5 (les mêmes vérifications que [`selftest`](#verify-the-pqc-stack-selftest)). Si la pile PQC échoue, l'assistant refuse de continuer.
2. **Point de terminaison RPC de la chaîne** — collez l'URL RPC de votre QoreChain, ou laissez le champ vide pour fonctionner en **mode local uniquement**, sans connexion à la chaîne. Si vous fournissez une URL, l'assistant teste sa joignabilité en direct.
3. **Clé privée de validateur** — collez une clé privée Dilithium-5 encodée en hexadécimal, ou tapez `g` (ou `generate`) pour générer une nouvelle paire de clés sur ce nœud.
4. **Enregistrement** — écrit `config.toml` et stocke la clé dans le trousseau.

:::note Mode local uniquement
Si vous laissez le point de terminaison vide, le démon démarre en mode local uniquement : la pile PQC est pleinement exercée, mais le nœud ne synchronise aucune chaîne. Relancez `onboard` dès que votre point de terminaison de chaîne est prêt pour y connecter le nœud.
:::

`onboard` écrase toujours la configuration active. Utilisez `--config` pour écrire vers un chemin non par défaut, ou `--non-interactive` pour échouer immédiatement plutôt que d'interroger l'utilisateur (utile en CI).

## Exécution : `start`

Une fois l'intégration terminée et la configuration écrite, démarrez le démon :

```bash
build/lightnode-sx start
```

Le démon synchronise les en-têtes, suit les délégations et sert la télémétrie jusqu'à interruption. Si vous souhaitez délibérément démarrer sans fichier de configuration (mode local uniquement, sans RPC de chaîne), passez `--skip-onboarding-check`.

## Vérifier la pile PQC : `selftest` {#verify-the-pqc-stack-selftest}

Vous pouvez à tout moment confirmer que la pile post-quantique fonctionne :

```bash
lightnode-sx selftest
```

`selftest` exécute cinq vérifications sur Dilithium-5 (ML-DSA-87) et se termine en moins d'une seconde :

1. **Keygen** — génère une nouvelle paire de clés.
2. **Sign** — signe un message de test.
3. **Verify (valid sig)** — confirme que la signature se vérifie avec la clé publique correspondante.
4. **Reject tampered signature** — modifie un octet de la signature ; la vérification doit la rejeter.
5. **Reject tampered message** — modifie un octet du message ; la vérification doit la rejeter.

Si une vérification échoue, le binaire se termine avec un code non nul et affiche des informations de diagnostic. C'est le même test que celui exécuté par l'assistant d'intégration lors de sa première étape, et il est pratique pour la vérification pré-déploiement et les diagnostics de support.

## Commandes de gestion

La CLI SX inclut des commandes pour inspecter l'état du nœud et gérer les clés :

| Commande | Objectif |
| --- | --- |
| `status` | Affiche l'état du nœud et de la synchronisation du light client (ID de chaîne, dernière hauteur, état de rattrapage). |
| `keys create <name>` | Crée une nouvelle clé Dilithium-5. |
| `keys list` | Liste les clés du trousseau. |
| `keys import <name> <hex-privkey>` | Importe une clé privée encodée en hexadécimal. |
| `keys export <name>` | Exporte une clé privée en hexadécimal. |
| `register` | Affiche la commande d'enregistrement on-chain pour ce nœud — voir [Enregistrement et licences](/light-node/registration-and-licensing). |
| `validators` | Liste les validateurs bondés. |
| `delegation` | Affiche les délégations actuelles depuis la base de données locale. |
| `rewards` | Affiche les récompenses de staking en attente. |
| `network` | Affiche la télémétrie réseau (en-têtes synchronisés récents) depuis la base de données locale. |
| `version` | Affiche la version du binaire. |

Pour les détails sur le staking, les récompenses et la surveillance, voir [Récompenses et surveillance](/light-node/rewards-and-monitoring). Pour l'enregistrement on-chain, voir [Enregistrement et licences](/light-node/registration-and-licensing).
