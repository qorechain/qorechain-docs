---
slug: /light-node/sx-edition
title: Édition SX (démon serveur)
sidebar_label: Édition SX
sidebar_position: 2
---

# Édition SX — Démon serveur

L'édition **SX (Server eXperience)** est le light node headless : un démon associé à une CLI de gestion complète, conçu pour les serveurs et l'automatisation. Le binaire s'appelle `lightnode-sx`. Les versions du light node suivent leur propre ligne, distincte de la version de la chaîne : les canaux des deux réseaux portent la **3.1.12** (27 octobre 2026). Cette page indique où une fonctionnalité nécessite la 3.1.11 ou une version ultérieure.

## Installation {#install}

Les binaires précompilés constituent la voie la plus simple. Le client light node est un unique binaire statique d'environ 13 Mo, sans bibliothèque native à installer : des builds Linux (amd64, arm64), macOS (Intel, Apple Silicon) et Windows (amd64, arm64) existent pour les deux éditions, soit 12 binaires au total par version. Le nœud signe lui-même ses transactions ; rien d'autre (en particulier, aucun `qorechaind`) n'est donc nécessaire pour enregistrer et exécuter un nœud.

**Vérifiez la somme de contrôle avant de l'exécuter.** Le manifeste de version à `https://download.qore.host/<net>/lightnode/latest.json` contient un `sha256` pour chaque binaire, un `checksums.url` pointant vers un fichier `SHA256SUMS` couvrant l'ensemble de la version, ainsi que le `checksums.sha256` propre à ce fichier. Vérifiez ce que vous avez téléchargé : c'est ce qui distingue l'exécution du binaire réellement compilé de l'exécution de tout ce qui se trouvait à cette URL. Prenez la version dans le manifeste, et prenez le binaire et son `SHA256SUMS` sous le même chemin versionné :

```bash
NET=mainnet            # or testnet
V=$(curl -fsS https://download.qore.host/$NET/lightnode/latest.json | jq -r .version)   # 3.1.12 on both networks today
F=lightnode-sx-linux-amd64   # see the artifact list in latest.json
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/$F
curl -fsSLO https://download.qore.host/$NET/lightnode/v$V/SHA256SUMS
grep " $F\$" SHA256SUMS | sha256sum -c -    # macOS: shasum -a 256 -c -
chmod +x $F
```

Utilisez le `SHA256SUMS` versionné (`.../v$V/SHA256SUMS`) avec le binaire versionné. Le `.../lightnode/SHA256SUMS` non versionné appartient au manifeste et peut avoir quelques heures de retard sur une nouvelle version ; un binaire versionné vérifié par rapport à lui peut donc échouer.

Sous Windows, comparez `certutil -hashfile lightnode-sx-<platform>.exe SHA256` avec la valeur du manifeste. Les deux manifestes acceptent la 3.1.9 et les versions ultérieures (`minCompatible: 3.1.9`). Le code source est public sur `github.com/qorechain/qorechain-lightnode` (Apache 2.0). Une version Android est jointe à la publication GitHub en tant qu'aperçu ; elle ne s'enregistre pas et ne gagne rien.

Vous pouvez aussi compiler le binaire depuis les sources ou l'exécuter avec Docker.

### Compiler depuis les sources

Le light node nécessite **Go 1.26.1**. Sa cryptographie post-quantique est une implémentation pure Go (pas de CGO, pas de bibliothèque native), donc la compilation croisée pour l'une des six plateformes prises en charge fonctionne exactement comme pour tout autre binaire Go :

```bash
go build -o build/lightnode-sx ./cmd/lightnode-sx/
```

Compilez à partir du tag de version que nomme le manifeste (`git checkout v3.1.12` aujourd'hui). Cela produit `build/lightnode-sx`. Exécutez-le directement, ou copiez-le dans votre `PATH`. Avant d'enregistrer le nœud, vérifiez la pile de signature post-quantique avec [`selftest`](#verify-the-pqc-stack-selftest).

### Docker {#docker}

Il n'existe pas d'image préconstruite à récupérer dans un registre : les packages de conteneur publiés ne sont pas encore publics, vous construisez donc l'image à partir du tag source. Utilisez le tag que nomme le manifeste (**`v3.1.12`** aujourd'hui). Pour mettre à jour une installation existante, reconstruisez depuis le nouveau tag (`git fetch --tags && git checkout v<new-version> && docker compose build --no-cache lightnode-sx`) ; un simple `docker compose up` ou `restart` réutilise l'ancienne image. Les clés, la configuration et le volume de données sont conservés.

```bash
git clone https://github.com/qorechain/qorechain-lightnode
cd qorechain-lightnode
git checkout v3.1.12      # the version your network's manifest names

export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'      # node keyring (node key + operator key)
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

# Once: the same setup as outside Docker, written into the data volume.
docker compose run --rm lightnode-sx onboard
docker compose run --rm lightnode-sx keys add-operator --recover
docker compose run --rm lightnode-sx register --delegate-to qorvaloper1...

docker compose up -d lightnode-sx
docker compose run --rm lightnode-sx status
```

Gardez `QORECHAIN_RPC_ADDR` exportée sur chaque commande `docker compose` : elle remplace `rpc_addr` de la configuration. Depuis la 3.1.10, le fichier compose la fixe par défaut au RPC mainnet `https://rpc.qore.host` ; un nœud testnet doit donc exporter `https://rpc-testnet.qore.host`, faute de quoi il suivra le mainnet. Le conteneur SX persiste ses données, y compris le trousseau, dans un volume nommé monté sur `/root/.qorechain-lightnode`.

Le nœud signe nativement à l'intérieur du conteneur ; rien d'autre n'est donc nécessaire. L'image SX embarque toujours un `qorechaind` publié (v3.2.0, linux/amd64 uniquement, vérifié par rapport à un digest épinglé) pour le [repli `qorechaind`](/light-node/registration-and-licensing#pqc-cosigned-heartbeat-pipeline) : `docker-compose.yml` monte `~/.qorechaind` (ou `QORECHAIND_HOME`) sur `/root/.qorechaind` et transmet `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` pour ce chemin. Un nœud dont la clé de l'opérateur se trouve dans son propre trousseau n'utilise ni l'un ni l'autre.

## Mise à jour {#updating}

- **Light node 3.1.11 et versions ultérieures, hors Docker.** Toutes les 6 heures, le nœud lit `https://download.qore.host/<net>/lightnode/latest.json` pour son propre réseau (mainnet pour `qorechain-vladi`, testnet pour `qorechain-diana`, rien pour les autres chaînes). Le manifeste n'est qu'une indication. Le nœud n'installe une version que si toutes ces conditions sont réunies :
  1. `v<version>/SHA256SUMS.sig` est une signature Ed25519 valide, produite par la clé de publication intégrée au binaire, portant sur le réseau, la version et le contenu de `SHA256SUMS` ;
  2. le binaire, récupéré depuis le chemin versionné propre au canal (les URL du manifeste ne sont pas suivies), correspond à sa somme de contrôle signée ;
  3. le nouveau binaire s'exécute et indique exactement `v<version>`.

  Il conserve ensuite le binaire précédent sous le nom `<name>.old` et redémarre sur place : le même processus sous Linux et macOS (un service systemd reste donc actif), tandis que sous Windows le nouveau binaire démarre et l'ancien se termine (configurez le service pour qu'il redémarre à la sortie).
- **Paramètres.** `[update] mode = "auto"` (par défaut, y compris pour une configuration sans cette section) annonce et installe ; `"notify"` annonce seulement ; `"off"` ne vérifie pas. À la main : `lightnode-sx update --check`, puis `lightnode-sx update`, puis redémarrez le nœud.
- **Voir une annonce.** Le nœud journalise une version plus récente et la sert sur l'API du tableau de bord local à `GET /api/update` (champs `network`, `mode`, `current`, `latest`, `min_compatible`, `notes`, `update_available`, `mandatory`, `can_install`, `blocked`, `last_check`, `last_error`) ; le tableau de bord UX affiche une bannière.
- **Conteneur ou dossier non inscriptible.** Le nœud se contente d'annoncer : mettez à jour l'image ou le fichier vous-même.
- **Light node 3.1.10 et versions antérieures** ne se mettent pas à jour seuls. Installez la 3.1.12 à la main une fois : téléchargez le binaire versionné depuis le chemin du manifeste (voir [Installation](#install)), vérifiez-le, remplacez le fichier et redémarrez. Ensuite, le nœud suit son canal.
- **Docker.** Docker ne modifie jamais l'image. Reconstruisez depuis le nouveau tag source (voir [Docker](#docker)) et recréez le conteneur.

## Configuration {#configure}

Le light node lit un fichier de configuration TOML. Par défaut, il recherche `config.toml` dans le répertoire personnel (`~/.qorechain-lightnode/config.toml`). Vous n'avez normalement pas besoin d'écrire ce fichier à la main — l'[assistant `onboard`](#first-run-onboard) le crée pour vous — mais il est utile d'en comprendre les options.

Deux options persistantes s'appliquent à chaque commande :

- `--config <path>` — pointe vers un fichier de configuration situé à un emplacement non par défaut.
- `--home <dir>` — remplace le répertoire personnel utilisé pour les données et les clés (par défaut `~/.qorechain-lightnode`).

Les options de configuration les plus pertinentes, au niveau de l'usage :

| Option | Ce qu'elle contrôle |
| --- | --- |
| `chain_id` | L'identifiant du réseau (`qorechain-vladi` sur le mainnet, `qorechain-diana` sur le testnet). `onboard` le lit depuis le point de terminaison RPC ; si le point de terminaison n'a pas pu être joint pendant `onboard`, la valeur par défaut `qorechain-diana` est conservée et vous devez le définir vous-même. Les transactions sont signées pour cette chaîne. |
| `rpc_addr` | Le point de terminaison RPC de la chaîne auquel le démon se connecte. Laissez vide pour fonctionner en **mode local uniquement**. |
| `primary_addr` / `witness_addrs` | Le point de terminaison RPC primaire, et les points de terminaison témoins par rapport auxquels son en-tête rapporté est corroboré — voir [Pourquoi exécuter un light node](/light-node/overview#why-run-a-light-node). Au moins un témoin distinct et joignable est ce qui fait passer la valeur `assurance` (journalisée au niveau debug) de `trusted-single-source` à `corroborated-across-sources`. |
| `trust_period` / `max_clock_drift` | Acceptées par souci de compatibilité mais actuellement inutilisées. La confiance dans les en-têtes provient de la corroboration primaire/témoins décrite ci-dessus. |
| `data_dir` | L'emplacement où le nœud stocke sa base de données et ses en-têtes. |
| `keyring_backend` / `key_name` | Backend de trousseau de clés (`file`, `os`, ou `test` pour les devnets locaux uniquement) et nom de la clé post-quantique avec laquelle le nœud signe. `onboard` règle `key_name` sur la clé qu'il crée (`validator`) ; `keys add-operator` le change en `operator-pqc` lorsqu'il dérive ou récupère la clé à partir des mots du compte. Le backend `file` exige `QORE_LIGHTNODE_KEYRING_PASSPHRASE` dans l'environnement. |
| `operator_address` | Le compte auquel appartient ce nœud (`qor1...`) ; validé au chargement. `keys add-operator` le renseigne. Requis pour `register`, `status` et les heartbeats. Voir [Le wallet de l'opérateur](#operator-wallet). |
| `api_addr` | Le point de terminaison REST. Dérivé de `rpc_addr` lorsqu'il est vide (le port 26657 devient 1317 ; les hôtes `rpc.` deviennent `api.`), il n'est donc nécessaire que pour les points de terminaison qui ne suivent aucune de ces deux conventions. |
| `[heartbeat]` | Activé par défaut (`enabled`). `interval_blocks` (à aligner sur le `heartbeat_interval` de la chaîne, 1000), `check_interval` (par défaut `60s`) et `gas` (par défaut `300000` ; avec la signature native, les frais sont de 0.25 uqor par unité de gas, soit 75,000 uqor). Utilisés uniquement par le repli `qorechaind` : `fees` (par défaut `50000uqor`), `qorechaind_path` (vide signifie `qorechaind` dans le `PATH`), `qorechaind_home` (vide signifie `~/.qorechaind`), `keyring_backend` et `key_name` (la clé `qorechaind` qui détient le compte opérateur ; par défaut, le `key_name` de premier niveau). |
| `[delegation]` | `auto_claim` (désactivé par défaut : réclame les récompenses de light node accumulées vers le compte opérateur via le signataire ; le nœud ne re-délègue jamais depuis le serveur), l'intervalle de vérification, la récompense minimale à réclamer, `rebalance_enabled` (activé par défaut) et `min_reputation` (alertes uniquement ; le nœud ne déplace jamais de stake). À partir de la 3.1.11, `rebalance_enabled` active des alertes pour un validateur délégué qui est jailed ou absent de l'ensemble actif, et pour un stake bondé inférieur à `min_delegated_stake` (1,000 QOR) ; `min_reputation` (par défaut `0.5`) s'applique là où le réseau sert des scores de réputation par validateur, ce qui est le cas du testnet aujourd'hui. `validators` et `split_weights` sont acceptés mais actuellement sans effet. |
| `[update]` | `mode` : `auto` (par défaut, y compris lorsque la section est absente), `notify` (annonce seulement) ou `off`. Light node 3.1.11 et versions ultérieures. Voir [Mise à jour](#updating). |
| `[telemetry]` | Activation de la télémétrie et intervalles de rafraîchissement pour les validateurs, le réseau, le pont et la tokenomics. |
| `[dashboard]` | L'API du tableau de bord local. L'édition UX la sert toujours ; l'édition SX uniquement avec `enabled = true`. `bind_addr` (par défaut `127.0.0.1:8420`) et `token` (lorsqu'il est défini, chaque route `/api` et `/ws` exigent `Authorization: Bearer <token>`). Voir [Édition UX](/light-node/ux-edition). |
| `log_level` / `log_format` | Verbosité des journaux (`debug`, `info`, `warn`, `error`) et format (`text` ou `json`). Clés de premier niveau : placez-les avant la première `[table]`. |

### Variables d'environnement {#environment-variables}

| Variable | Utilisée pour |
| --- | --- |
| `QORE_LIGHTNODE_KEYRING_PASSPHRASE` | Phrase secrète du trousseau du nœud (`keyring_backend = "file"`), qui contient la clé post-quantique du nœud et la clé du compte opérateur. Obligatoire pour chaque commande qui ouvre le trousseau et pour `start` ; le nœud refuse une phrase vide. |
| `QORE_LIGHTNODE_QORECHAIND_PASSPHRASE` | Uniquement pour le repli `qorechaind` : phrase secrète du trousseau `qorechaind` contenant la clé de l'opérateur ; transmise à `qorechaind` via l'entrée standard, jamais sur une ligne de commande. |
| `QORECHAIN_RPC_ADDR` | Remplace `rpc_addr` (et `primary_addr` lorsqu'il était égal à `rpc_addr`). Définie par `docker-compose.yml`. |

:::note Les points de terminaison témoins sont validés au démarrage
Un témoin situé sur le même hôte que le primaire est refusé — un point de terminaison compromis se contenterait de confirmer sa propre version, ce qui ne corrobore rien. Un témoin en `http://` en clair sur un hôte distant est également refusé, car un attaquant capable de réécrire cette connexion peut répondre à la place de tous les témoins à la fois ; un `http://` en boucle locale (loopback) est autorisé. Pointez les témoins vers des points de terminaison RPC en lesquels vous avez des raisons indépendantes de faire confiance.
:::

Les valeurs par défaut de la délégation activent les alertes de stake et laissent `auto_claim` désactivé ; voir [Récompenses et surveillance](/light-node/rewards-and-monitoring) pour le détail de leur fonctionnement.

## Premier lancement : `onboard` {#first-run-onboard}

Au premier lancement, `start` s'arrêtera et vous orientera vers l'assistant d'intégration si aucun fichier de configuration n'existe encore. Définissez d'abord la phrase secrète du trousseau — `onboard` refuse de démarrer sans elle, afin de ne jamais générer une clé qu'il ne pourrait pas stocker — puis lancez l'assistant :

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-sx onboard
```

`onboard` vous guide à travers quatre étapes de configuration :

1. **Auto-test PQC** — exécute le cycle complet de test Dilithium-5 (les mêmes vérifications que [`selftest`](#verify-the-pqc-stack-selftest)). Si la pile PQC échoue, l'assistant refuse de continuer.
2. **Point de terminaison RPC de la chaîne** — collez l'URL RPC de votre QoreChain (mainnet `https://rpc.qore.host`, testnet `https://rpc-testnet.qore.host`), ou laissez le champ vide pour fonctionner en **mode local uniquement**. Si vous fournissez une URL, l'assistant la teste en direct et y lit l'ID de chaîne.
3. **Clé du nœud** — l'assistant l'appelle « clé privée de validateur », mais il s'agit de la propre clé Dilithium-5 du light node, et non d'une clé de validateur. Collez une clé privée Dilithium-5 encodée en hexadécimal, ou tapez `g` (ou `generate`) pour générer une nouvelle paire de clés sur ce nœud.
4. **Enregistrement** — écrit `config.toml` (avec le point de terminaison et l'ID de chaîne) et stocke la clé dans le trousseau sous le nom `validator` (ou `validator-<hex>` si ce nom est déjà pris), en y réglant `key_name`.

:::note Mode local uniquement
Si vous laissez le point de terminaison vide, le démon démarre en mode local uniquement : la pile PQC est pleinement exercée, mais le nœud ne synchronise aucune chaîne. Relancez `onboard` dès que votre point de terminaison de chaîne est prêt pour y connecter le nœud.
:::

`onboard` écrase toujours la configuration active. Utilisez `--config` pour écrire vers un chemin non par défaut, ou `--non-interactive` pour échouer immédiatement plutôt que d'interroger l'utilisateur (utile en CI).

:::caution Étape suivante : le compte opérateur
`onboard` ne sait pas quel compte est le vôtre. Avant d'exécuter `register`, ajoutez le compte opérateur avec [`keys add-operator`](#operator-wallet). Il renseigne `operator_address` pour vous. Si le point de terminaison n'a pas pu être joint pendant `onboard`, vérifiez également que `chain_id` dans `config.toml` vaut `qorechain-vladi` (mainnet) ou `qorechain-diana` (testnet).
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
5. **Reject tampered message** — modifie un octet du message ; la vérification doit le rejeter.

Si une vérification échoue, le binaire se termine avec un code non nul et affiche des informations de diagnostic. C'est le même test que celui exécuté par l'assistant d'intégration lors de sa première étape, et il est pratique pour la vérification pré-déploiement et les diagnostics de support.

## Le wallet de l'opérateur {#operator-wallet}

La clé Dilithium-5 du nœud n'est **pas** un wallet. Sur QoreChain, une clé post-quantique est rattachée à un compte ; elle n'en crée pas. C'est pourquoi `keys list` n'affiche aucune adresse pour elle. Votre **adresse d'opérateur** est un compte `qor1…` ordinaire qui détient la licence et le stake, paie les frais et reçoit les récompenses de light node. Il doit s'agir d'un compte dont vous détenez les mots de récupération (vos propres mots, Keplr ou `qorechaind`) ; un compte dédié est préférable. Un wallet custodial du Dashboard ne peut pas faire tourner un nœud, sauf si vous exportez sa seed. Voir [Le compte opérateur](/light-node/registration-and-licensing#operator-account).

Stockez la clé du compte opérateur dans le trousseau du nœud :

```bash
# The account the licence is for: type its recovery words, then Enter
lightnode-sx keys add-operator --recover

# Or create a new account; its 24 words are shown once
lightnode-sx keys add-operator
```

`keys add-operator` :

- dérive la clé du compte à partir des mots exactement comme le font `qorechaind` et Keplr (`m/44'/118'/0'/0/0`), la stocke dans le trousseau sous le nom `operator` et écrit le compte dans `operator_address` de `config.toml`. Si `operator_address` est déjà défini sur un autre compte, il refuse ;
- choisit la clé post-quantique avec laquelle le nœud signe, la stocke sous le nom `operator-pqc` et y règle `key_name`. Si le compte possède déjà une clé post-quantique — généralement enregistrée par un wallet à partir des mêmes mots — cette clé est reconstruite à partir des mots (les dérivations du wallet-adapter et du Dashboard, les mêmes que `qorechaind tx pqc recover-key`). Si le compte n'en a pas, une clé est dérivée des mots, de sorte que les mots restaurent aussi la clé du nœud. Si la clé enregistrée du compte est déjà la clé actuelle du nœud, cette clé est conservée. Si la clé du compte ne peut pas être reproduite à partir des mots, la commande refuse et recommande un compte dédié ;
- sans `--recover`, crée un nouveau compte et affiche ses 24 mots une seule fois. Notez-les ; ils constituent l'unique sauvegarde. Approvisionnez le compte et achetez la licence pour son adresse avant de vous enregistrer.

La phrase secrète du trousseau (`QORE_LIGHTNODE_KEYRING_PASSPHRASE`) protège cette clé ainsi que la clé du nœud. Enregistrez ensuite le nœud :

```bash
lightnode-sx register --delegate-to qorvaloper1...
```

`register` vérifie la licence, rattache la clé post-quantique sauf si le compte la possède déjà, délègue le stake manquant uniquement si vous désignez un validateur avec `--delegate-to`, et enregistre le nœud ; chaque étape est confirmée dans un bloc avant la suivante. Voir [Enregistrement et licences](/light-node/registration-and-licensing) pour les détails et pour la solution de repli `register --print` destinée aux opérateurs qui conservent la clé du compte dans un trousseau `qorechaind`.

## Commandes de gestion

La CLI SX inclut des commandes pour inspecter l'état du nœud et gérer les clés. Depuis la version 3.1.7, le binaire UX (`lightnode-ux`) dispose des mêmes commandes.

| Commande | Objectif |
| --- | --- |
| `onboard` | Assistant interactif de premier lancement. |
| `start` | Exécute le démon. |
| `selftest` | Exécute l'auto-test PQC. |
| `status` | Affiche l'état du nœud et de la synchronisation du light client (ID de chaîne, dernière hauteur, état de rattrapage) ainsi que les lignes `Signer` (natif ou `qorechaind`), `Operator`, `Licence` et `Registration`. |
| `keys create <name>` | Crée une nouvelle clé de nœud Dilithium-5 et affiche sa clé publique. |
| `keys list` | Liste les clés du trousseau (nom, type, adresse le cas échéant, clé publique). |
| `keys show <name>` | Affiche le type d'une clé et sa clé publique complète. |
| `keys import <name> <hex-privkey>` | Importe une clé privée encodée en hexadécimal. |
| `keys export <name> [--out <file>]` | Exporte une clé privée en hexadécimal. `--out` écrit le fichier que lit `qorechaind --pqc-key` (sans saut de ligne final, mode 0600). |
| `keys add-operator [--recover]` | Stocke la clé du compte opérateur (nouvelle, ou récupérée à partir de ses mots sur l'entrée standard) et choisit la clé post-quantique ; renseigne `operator_address`. Voir [Le wallet de l'opérateur](#operator-wallet). |
| `register [--delegate-to <qorvaloper>] [--print]` | Enregistre le nœud on-chain : clé post-quantique, stake manquant, enregistrement, chacun confirmé dans un bloc. `--print` affiche à la place les commandes `qorechaind` — voir [Enregistrement et licences](/light-node/registration-and-licensing). |
| `validators` | Liste les validateurs bondés. |
| `delegation` | Affiche les délégations du compte opérateur, telles que reflétées dans la base de données locale par le démon en cours d'exécution. |
| `rewards` | Affiche les récompenses de staking en attente du compte opérateur (pas les récompenses de light node ; voir [Récompenses et surveillance](/light-node/rewards-and-monitoring#how-rewards-work)). |
| `network` | Affiche la télémétrie réseau (en-têtes synchronisés récents) depuis la base de données locale. |
| `update [--check]` | Light node 3.1.11 et versions ultérieures. `--check` indique si une version plus récente existe ; sans lui, vérifie, installe et conserve le binaire précédent sous le nom `<name>.old`. Redémarrez ensuite le nœud. Voir [Mise à jour](#updating). |
| `version` | Affiche la version du binaire. |

Pour les détails sur le staking, les récompenses et la surveillance, voir [Récompenses et surveillance](/light-node/rewards-and-monitoring). Pour l'enregistrement on-chain, voir [Enregistrement et licences](/light-node/registration-and-licensing).
