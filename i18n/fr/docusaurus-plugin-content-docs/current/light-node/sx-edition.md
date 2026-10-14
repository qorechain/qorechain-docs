---
slug: /light-node/sx-edition
title: Édition SX (démon serveur)
sidebar_label: Édition SX
sidebar_position: 2
---

# Édition SX — Démon serveur

L'édition **SX (Server eXperience)** est le light node headless : un démon associé à une CLI de gestion complète, conçu pour les serveurs et l'automatisation. Le binaire s'appelle `lightnode-sx`. Il s'agit de la ligne **v3.1.3** du light node pour les binaires précompilés (tag source `v3.1.4` pour les builds Docker), sa propre version, distincte de la version de la chaîne.

## Installation {#install}

Les binaires précompilés constituent la voie la plus simple — le client light node s'exécute nativement sur **six plateformes sans aucune dépendance native** : Linux (amd64, arm64), macOS (Intel, Apple Silicon) et Windows (amd64, arm64) — soit 12 binaires au total pour les éditions SX et UX. Chaque binaire pèse environ 11 à 12 Mo — il suffit de le télécharger et de l'exécuter, sans bibliothèques séparées à installer.

**Vérifiez la somme de contrôle avant de l'exécuter.** Le manifeste de version à `https://download.qore.host/<net>/lightnode/latest.json` contient un `sha256` pour chaque binaire, un `checksums.url` pointant vers un fichier `SHA256SUMS` couvrant l'ensemble de la version, ainsi que le `checksums.sha256` propre à ce fichier. Vérifiez ce que vous avez téléchargé — ce n'est pas un détail secondaire, c'est ce qui distingue l'exécution du binaire réellement compilé de l'exécution de tout ce qui se trouvait à cette URL :

```bash
NET=mainnet            # or testnet
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/SHA256SUMS
grep " $F\$" SHA256SUMS | shasum -a 256 -c -    # Linux: sha256sum -c -
chmod +x $F
```

Sous Windows, comparez `certutil -hashfile lightnode-sx-<platform>.exe SHA256` avec la valeur du manifeste. Les deux réseaux servent actuellement la même version v3.1.3. Le code source est public sur `github.com/qorechain/qorechain-lightnode` (Apache 2.0).

Vous pouvez aussi compiler le binaire depuis les sources ou l'exécuter avec Docker.

### Compiler depuis les sources

Le light node nécessite **Go 1.26.1**. Sa cryptographie post-quantique est une implémentation pure Go (pas de CGO, pas de bibliothèque native), donc la compilation croisée pour l'une des six plateformes prises en charge fonctionne exactement comme pour tout autre binaire Go :

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Cela produit `build/lightnode-sx`. Exécutez-le directement, ou copiez-le dans votre `PATH`. Avant d'enregistrer le nœud, vérifiez la pile de signature post-quantique avec [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Il n'existe pas d'image préconstruite dans un registre ; vous la construisez à partir du tag source. Utilisez le tag **`v3.1.4` ou plus récent** : l'image construite depuis `v3.1.3` embarque un ancien signataire `qorechaind` que la chaîne refuse désormais, de sorte que ses heartbeats et ses réclamations de récompenses échouent. Pour mettre à jour une installation existante, reconstruisez depuis le nouveau tag (`git fetch --tags && git checkout v3.1.4 && docker compose build --no-cache lightnode-sx`) ; un simple pull ne fait rien.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.4

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring
export QORE_LIGHTNODE_QORECHAIND_PASSPHRASE='...'   # qorechaind keyring (operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: write config.toml and the node key into the data volume.
docker compose run --rm lightnode-sx onboard
# Then set chain_id, key_name, operator_address and [heartbeat] key_name in
# /root/.qorechain-lightnode/config.toml inside the volume (see "First run").

docker compose up -d lightnode-sx
```

Gardez `QORECHAIN_RPC_ADDR` exportée sur chaque commande `docker compose` : elle remplace `rpc_addr` de la configuration, et la valeur par défaut de compose pointe vers `host.docker.internal:26657`. Le conteneur SX persiste ses données dans un volume nommé monté sur `/root/.qorechain-lightnode`.

L'image embarque également un `qorechaind` publié (v3.2.0, linux/amd64, téléchargé depuis le canal de versions au moment du build et vérifié par rapport à un digest épinglé). Le démon le pilote pour signer les heartbeats et les réclamations de récompenses, de sorte qu'un nœud en conteneur peut rester actif on-chain sans seconde installation. Si un réseau passe ensuite à une version qui refuse le signataire embarqué, faites pointer `[heartbeat] qorechaind_path` vers le `qorechaind` plus récent indiqué dans le manifeste de ce réseau (`https://download.qore.host/<net>/latest.json`). Sur un hôte arm64 (par exemple Apple Silicon), le build ne contient pas de signataire ; construisez avec `DOCKER_DEFAULT_PLATFORM=linux/amd64` si vous en avez besoin. Le signataire a besoin du wallet de l'opérateur : montez votre répertoire personnel `qorechaind` (le trousseau contenant la clé de l'opérateur, ainsi que la clé du nœud exportée sous `pqc/<key_name>.dilithium`) sur `/root/.qorechaind` ; `docker-compose.yml` monte `~/.qorechaind` par défaut, ou définissez `QORECHAIND_HOME`. Les deux phrases secrètes sont celle du trousseau du nœud et celle du trousseau `qorechaind` ; la seconde est transmise à `qorechaind` via l'entrée standard et n'apparaît jamais sur une ligne de commande. Voir [Le wallet de l'opérateur](#operator-wallet).

## Configuration

Le light node lit un fichier de configuration TOML. Par défaut, il recherche `config.toml` dans le répertoire personnel (`~/.qorechain-lightnode/config.toml`). Vous n'avez normalement pas besoin d'écrire ce fichier à la main — l'[assistant `onboard`](#first-run-onboard) le crée pour vous — mais il est utile d'en comprendre les options.

Deux options persistantes s'appliquent à chaque commande :

- `--config <path>` — pointe vers un fichier de configuration situé à un emplacement non par défaut.
- `--home <dir>` — remplace le répertoire personnel utilisé pour les données et les clés (par défaut `~/.qorechain-lightnode`).

Les options de configuration les plus pertinentes, au niveau de l'usage :

| Option | Ce qu'elle contrôle |
| --- | --- |
| `chain_id` | L'identifiant du réseau (par exemple `qorechain-diana` sur le testnet, `qorechain-vladi` sur le mainnet). À définir vous-même après `onboard`, qui laisse `qorechain-diana` ; le signataire l'utilise. |
| `rpc_addr` | Le point de terminaison RPC de la chaîne auquel le démon se connecte. Laissez vide pour fonctionner en **mode local uniquement**. |
| `primary_addr` / `witness_addrs` | Le point de terminaison RPC primaire, et les points de terminaison témoins par rapport auxquels son en-tête rapporté est corroboré — voir [Pourquoi exécuter un light node](/light-node/overview#why-run-a-light-node). Au moins un témoin distinct et joignable est ce qui fait passer la valeur `assurance` (journalisée au niveau debug) de `trusted-single-source` à `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Acceptées par souci de compatibilité mais actuellement inutilisées. La confiance dans les en-têtes provient de la corroboration primaire/témoins décrite ci-dessus. |
| `data_dir` | L'emplacement où le nœud stocke sa base de données et ses en-têtes. |
| `keyring_backend` / `key_name` | Backend de trousseau de clés (`file`, `os`, ou `test` pour les devnets locaux uniquement) et nom de la clé post-quantique du nœud. Le backend `file` exige `QORE_LIGHTNODE_KEYRING_PASSPHRASE` dans l'environnement. |
| `operator_address` | Le compte auquel appartient ce nœud (`qor1...`) ; validé au chargement. Requis pour `register`, `status` et les heartbeats. Voir [Le wallet de l'opérateur](#operator-wallet). |
| `api_addr` | Le point de terminaison REST. Dérivé de `rpc_addr` lorsqu'il est vide (le port 26657 devient 1317 ; les hôtes `rpc.` deviennent `api.`), il n'est donc nécessaire que pour les points de terminaison qui ne suivent aucune de ces deux conventions. |
| `[heartbeat]` | Activé par défaut. `qorechaind_path` (vide signifie `qorechaind` dans le `PATH` ; l'image Docker l'embarque), `qorechaind_home` (vide signifie `~/.qorechaind`), `key_name` (la clé de compte `qorechaind` ; par défaut, le `key_name` de premier niveau), `interval_blocks` (à aligner sur le `heartbeat_interval` de la chaîne, 1000), `check_interval` (par défaut `60s`), `fees` (par défaut `50000uqor`) et `gas` (par défaut `300000`). |
| `[delegation]` | `auto_claim` (désactivé par défaut : réclame les récompenses de light node accumulées vers le wallet de l'opérateur via le signataire ; le nœud ne re-délègue jamais depuis le serveur), l'intervalle de vérification, la récompense minimale à réclamer, `rebalance_enabled` et `min_reputation` (alertes de réputation uniquement — le nœud ne déplace jamais de stake). `validators` et `split_weights` sont acceptés mais actuellement sans effet. |
| `[telemetry]` | Activation de la télémétrie et intervalles de rafraîchissement pour les validateurs, le réseau, le pont et la tokenomics. |
| `log_level` / `log_format` | Verbosité des journaux (`debug`, `info`, `warn`, `error`) et format (`text` ou `json`). |

### Variables d'environnement {#environment-variables}

| Variable | Utilisée pour |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Phrase secrète du trousseau du nœud (`keyring_backend = "file"`). Obligatoire ; le nœud refuse une phrase vide. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Phrase secrète du trousseau `qorechaind` contenant la clé de l'opérateur ; transmise à `qorechaind` via l'entrée standard, jamais sur une ligne de commande. |
| `QORECHAIN_RPC_ADDR` | Remplace `rpc_addr` (et `primary_addr` lorsqu'il était égal à `rpc_addr`). Définie par `docker-compose.yml`. |

:::note Les points de terminaison témoins sont validés au démarrage
Un témoin situé sur le même hôte que le primaire est refusé — un point de terminaison compromis se contenterait de confirmer sa propre version, ce qui ne corrobore rien. Un témoin en `http://` en clair sur un hôte distant est également refusé, car un attaquant capable de réécrire cette connexion peut répondre à la place de tous les témoins à la fois ; un `http://` en boucle locale (loopback) est autorisé. Pointez les témoins vers des points de terminaison RPC en lesquels vous avez des raisons indépendantes de faire confiance.
:::

Les valeurs par défaut de la délégation activent les alertes de rééquilibrage tenant compte de la réputation et laissent `auto_claim` désactivé — voir [Récompenses et surveillance](/light-node/rewards-and-monitoring) pour le détail de leur fonctionnement.

## Premier lancement : `onboard` {#first-run-onboard}

Au premier lancement, `start` s'arrêtera et vous orientera vers l'assistant d'intégration si aucun fichier de configuration n'existe encore. Lancez l'assistant :

```bash
build/lightnode-sx onboard
```

`onboard` vous guide à travers quatre étapes de configuration :

1. **Auto-test PQC** — exécute le cycle complet de test Dilithium-5 (les mêmes vérifications que [`selftest`](#verify-the-pqc-stack-selftest)). Si la pile PQC échoue, l'assistant refuse de continuer.
2. **Point de terminaison RPC de la chaîne** — collez l'URL RPC de votre QoreChain, ou laissez le champ vide pour fonctionner en **mode local uniquement**, sans connexion à la chaîne. Si vous fournissez une URL, l'assistant teste sa joignabilité en direct.
3. **Clé du nœud** — l'assistant l'appelle « clé privée de validateur », mais il s'agit de la propre clé Dilithium-5 du light node, et non d'une clé de validateur. Collez une clé privée Dilithium-5 encodée en hexadécimal, ou tapez `g` (ou `generate`) pour générer une nouvelle paire de clés sur ce nœud.
4. **Enregistrement** — écrit `config.toml` et stocke la clé dans le trousseau sous le nom `validator` (ou `validator-<hex>` si ce nom est déjà pris). Le trousseau de type fichier exige que `QORE_LIGHTNODE_KEYRING_PASSPHRASE` soit défini dans l'environnement, pour cette étape comme pour chaque commande ultérieure qui l'ouvre.

:::note Mode local uniquement
Si vous laissez le point de terminaison vide, le démon démarre en mode local uniquement : la pile PQC est pleinement exercée, mais le nœud ne synchronise aucune chaîne. Relancez `onboard` dès que votre point de terminaison de chaîne est prêt pour y connecter le nœud.
:::

`onboard` écrase toujours la configuration active. Utilisez `--config` pour écrire vers un chemin non par défaut, ou `--non-interactive` pour échouer immédiatement plutôt que d'interroger l'utilisateur (utile en CI).

:::caution Terminez la configuration après l'onboarding
`onboard` ne sait pas à quel réseau vous vous joignez ni quel compte est le vôtre. Avant d'exécuter `register` ou de compter sur les heartbeats, modifiez `config.toml` :

```toml
chain_id         = "qorechain-vladi"   # mainnet; testnet is "qorechain-diana". onboard leaves "qorechain-diana".
key_name         = "validator"         # the key onboard created; see `lightnode-sx keys list`
operator_address = "qor1..."           # your funded operator account

[heartbeat]
key_name = "operator"                  # the qorechaind key that holds operator_address
```

`key_name` au niveau supérieur est la clé post-quantique du nœud (son fichier est `pqc/<key_name>.dilithium` dans le répertoire personnel de `qorechaind`) ; `[heartbeat] key_name` est la clé de compte `qorechaind` qui paie les frais. Si vous laissez `key_name = "operator"` alors que la clé s'appelle `validator`, `register` s'arrête avec `node key "operator" not found`.
:::

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

## Le wallet de l'opérateur {#operator-wallet}

La clé Dilithium-5 du nœud n'est **pas** un wallet. Sur QoreChain, une clé post-quantique est rattachée à un compte ; elle n'en crée pas. C'est pourquoi `keys list` n'affiche aucune adresse pour elle. Votre **adresse d'opérateur** est un compte `qor1…` ordinaire et approvisionné, créé avec `qorechaind`, depuis lequel le nœud est enregistré et qui reçoit les récompenses de light node. La clé du nœud devient la clé post-quantique de ce compte.

À configurer une seule fois :

```bash
# 1. Create and fund the operator account (any Cosmos wallet works; qorechaind shown)
qorechaind keys add operator
qorechaind keys show operator -a          # -> qor1..., fund it with a little QOR for fees

# 2. Tell the node which account it belongs to
#    config.toml:  operator_address = "qor1..."

# 3. Let the node print the two chain commands (attach the key, register the node)
lightnode-sx register
```

`register` affiche, renseignées avec vos valeurs, la commande `qorechaind tx pqc register-key-v2 dilithium5 … hybrid` qui rattache la clé du nœud au compte (une seule fois), ainsi que la paire de commandes `tx lightnode register … --generate-only` et `tx pqc cosign` qui enregistre le nœud. La chaîne exige la co-signature post-quantique sur chaque transaction, c'est pourquoi l'enregistrement se fait en deux commandes et non en une. L'enregistrement exige aussi une licence `lightnode_operator` active sur l'adresse de l'opérateur ; sans elle, la chaîne refuse la transaction. L'enregistrement n'est pas encore ouvert : voir [État du programme de récompenses](/light-node/overview#reward-program-status).

## Commandes de gestion

La CLI SX inclut des commandes pour inspecter l'état du nœud et gérer les clés :

| Commande | Objectif |
| --- | --- |
| `onboard` | Assistant interactif de premier lancement. |
| `start` | Exécute le démon. |
| `selftest` | Exécute l'auto-test PQC. |
| `status` | Affiche l'état du nœud et de la synchronisation du light client (ID de chaîne, dernière hauteur, état de rattrapage) ainsi que les lignes `Signer`, `Operator`, `Licence` et `Registration`. |
| `keys create <name>` | Crée une nouvelle clé de nœud Dilithium-5 et affiche sa clé publique. |
| `keys list` | Liste les clés du trousseau (nom, type, adresse le cas échéant, clé publique). |
| `keys show <name>` | Affiche le type d'une clé et sa clé publique complète. |
| `keys import <name> <hex-privkey>` | Importe une clé privée encodée en hexadécimal. |
| `keys export <name>` | Exporte une clé privée en hexadécimal (le même format que celui que `qorechaind` lit dans `~/.qorechaind/pqc/`). |
| `register` | Affiche les commandes de la chaîne qui rattachent la clé du nœud à votre compte d'opérateur et enregistrent le nœud — voir [Enregistrement et licences](/light-node/registration-and-licensing). |
| `validators` | Liste les validateurs bondés. |
| `delegation` | Affiche les délégations actuelles depuis la base de données locale (voir la limitation connue dans [Récompenses et surveillance](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `rewards` | Affiche les récompenses de staking en attente (même limitation). |
| `network` | Affiche la télémétrie réseau (en-têtes synchronisés récents) depuis la base de données locale. |
| `version` | Affiche la version du binaire. |

Pour les détails sur le staking, les récompenses et la surveillance, voir [Récompenses et surveillance](/light-node/rewards-and-monitoring). Pour l'enregistrement on-chain, voir [Enregistrement et licences](/light-node/registration-and-licensing).
