---
slug: /light-node/ux-edition
title: Édition UX (dashboard web)
sidebar_label: Édition UX
sidebar_position: 3
---

# Édition UX — dashboard web

L'édition **UX (User eXperience)** exécute le même démon de nœud léger que l'édition SX, mais ajoute un **dashboard web intégré** pour que vous puissiez surveiller le nœud et le réseau dans un navigateur. Le binaire est `lightnode-ux`. Comme pour l'édition SX, il suit la propre ligne de version du nœud léger, distincte de la version de la chaîne (les canaux des deux réseaux portent la 3.1.12 au 27 octobre 2026).

L'édition UX est le bon choix pour une utilisation sur ordinateur de bureau et pour les opérateurs qui préfèrent une interface visuelle à la ligne de commande.

## Installation

Les binaires précompilés s'exécutent nativement sur **six plateformes sans aucune dépendance native** — Linux (amd64, arm64), macOS (Intel, Apple Silicon) et Windows (amd64, arm64) — chacun pesant environ 13 Mo. Vérifiez la somme de contrôle du téléchargement par rapport au manifeste avant de l'exécuter — voir [Édition SX](/light-node/sx-edition#install) pour la marche à suivre.

### Compiler depuis les sources

L'édition UX nécessite **Go 1.26.1**. Sa cryptographie post-quantique est une implémentation en pur Go (pas de CGO, pas de bibliothèque native) :

```bash
go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Compilez à partir du tag de version que nomme le manifeste (`git checkout v3.1.12` aujourd'hui). Cela produit `build/lightnode-ux`.

### Docker

Le service UX se compile à partir de `Dockerfile.ux` dans le dépôt source (`github.com/qorechain/qorechain-lightnode`, le tag correspondant au manifeste de votre réseau). Le conteneur a besoin d'un `config.toml` dans son volume de données avant de pouvoir démarrer. Le binaire UX dispose des commandes de configuration, vous pouvez donc la créer directement dans le volume :

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='...'
export QORECHAIN_RPC_ADDR=https://rpc.qore.host     # testnet: https://rpc-testnet.qore.host

docker compose run --rm lightnode-ux onboard
docker compose run --rm lightnode-ux keys add-operator --recover   # to register this node
docker compose run --rm lightnode-ux register --delegate-to qorvaloper1...
```

Dans un conteneur, le dashboard doit écouter sur toutes les interfaces du conteneur ; définissez donc ceci dans cette configuration (`/root/.qorechain-lightnode/config.toml` dans le volume) et publiez le port uniquement sur la boucle locale de l'hôte. Le `docker-compose.yml` fourni publie `8420:8420`, qui est joignable depuis d'autres machines ; modifiez-le :

```toml
[dashboard]
bind_addr = "0.0.0.0:8420"
```

```yaml
# docker-compose.yml, lightnode-ux service
ports:
  - "127.0.0.1:8420:8420"
```

```bash
docker compose up -d lightnode-ux
```

Le conteneur UX conserve les données, y compris le keyring, dans un volume nommé sur `/root/.qorechain-lightnode` et lit l'adresse RPC de la chaîne depuis la variable d'environnement `QORECHAIN_RPC_ADDR`. Le nœud signe lui-même ses transactions ; un conteneur UX peut donc s'enregistrer et envoyer des heartbeats comme l'édition SX. L'image UX n'inclut pas `qorechaind`, le repli `qorechaind` n'y est donc pas disponible.

## Exécution

Démarrez le nœud UX :

```bash
build/lightnode-ux start
```

Cela lance le démon et le serveur du dashboard intégré ensemble. L'édition UX active toujours le dashboard. Au démarrage, le binaire affiche l'URL du dashboard.

L'édition UX partage sa configuration avec l'édition SX : elle lit le même `config.toml` depuis `~/.qorechain-lightnode`, utilise le même keyring et dispose des mêmes commandes (`onboard`, `keys`, `register`, `status`, `selftest` et les autres). La première configuration suit les mêmes cinq étapes, avec `lightnode-ux` à la place de `lightnode-sx` :

```bash
export QORE_LIGHTNODE_KEYRING_PASSPHRASE='choose-a-passphrase'
lightnode-ux onboard
lightnode-ux keys add-operator --recover
lightnode-ux register --delegate-to qorvaloper1...
lightnode-ux start
```

Voir [Édition SX](/light-node/sx-edition#first-run-onboard) pour le rôle de chaque commande et [Enregistrement et licences](/light-node/registration-and-licensing) pour les prérequis. Le démon de l'édition UX signe et envoie les heartbeats de la même manière que l'édition SX, sous Linux, macOS et Windows. Lorsque `register` est exécuté depuis le binaire UX, le nœud est enregistré avec le type `ux`.

## Le dashboard web sur le port 8420

Le dashboard est exposé sur le **port 8420**. C'est le port que l'image Docker `lightnode-ux` déclare (`EXPOSE 8420`) et celui auquel le binaire se lie par défaut, de sorte qu'en exécution sous Docker le dashboard est publié sur `8420` :

```
http://localhost:8420
```

:::caution Vérifiez votre mappage de port dans Compose
Certains textes ailleurs font référence au port 8080 pour le dashboard. La valeur de référence est **8420** — c'est ce que l'image expose réellement et ce à quoi le démon se lie par défaut. Si vous adaptez votre propre `docker-compose.yml` ou un reverse proxy, mappez vers **8420**, et non 8080.
:::

:::caution Protégez le dashboard
Le dashboard n'a pas de connexion. Tant que vous ne définissez pas `[dashboard] token`, quiconque peut atteindre le port 8420 peut lire votre configuration, vos délégations et vos récompenses ; aucune clé privée n'est jamais servie. Avec un token défini, chaque route `/api` et la connexion `/ws` exigent `Authorization: Bearer <token>` (le token que QoreX envoie lorsqu'il s'appaire avec le nœud) ; en `http` simple, ce token traverse le réseau en clair. Le binaire se lie désormais **par défaut à la boucle locale uniquement** (`127.0.0.1:8420`) plutôt qu'à toutes les interfaces, et affiche un avertissement au démarrage si vous l'avez configuré pour écouter plus largement — mais cet avertissement n'est pas un refus. Si vous élargissez délibérément la liaison (par exemple pour l'atteindre depuis une autre machine, ou parce que vous publiez le port depuis Docker), définissez un token et placez le dashboard derrière https (un reverse proxy ou un tunnel SSH) plutôt que de l'exposer directement. La connexion WebSocket de télémétrie vérifie également l'`Origin` du navigateur, car une liaison réseau large ne suffit pas à elle seule à empêcher une autre page ouverte dans le même navigateur de s'y connecter.
:::

## Ce que montre le dashboard

Le dashboard est organisé selon les vues suivantes :

- **Overview** — hauteur de bloc et état du nœud en un coup d'œil.
- **Validators** — l'ensemble des validateurs liés (bonded).
- **Delegation** — les délégations reflétées depuis votre compte opérateur (`operator_address`).
- **Network** — télémétrie réseau en direct et en-têtes récemment synchronisés.
- **Bridge** — télémétrie du pont inter-chaînes.
- **Tokenomics** — télémétrie de l'économie du token.
- **Settings** — la configuration effective du nœud.

À partir du nœud léger 3.1.11, le dashboard affiche une bannière lorsque le nœud trouve une version plus récente (voir [Édition SX : mise à jour](/light-node/sx-edition#updating)). Son API locale fournit les mêmes informations à `GET /api/update`.

La télémétrie se met à jour en temps réel, le démon rafraîchissant les données des validateurs, du réseau, du pont et de la tokenomics selon des intervalles indépendants (configurables sous `[telemetry]` dans `config.toml`).

### Bannière mode local uniquement

Si le nœud n'a **aucun point d'accès RPC de chaîne configuré**, le dashboard fonctionne en **mode local uniquement** et affiche une bannière bien visible expliquant l'état : la pile PQC est vérifiée, mais le nœud ne synchronise aucune chaîne, de sorte que la hauteur de bloc reste à `0`. La bannière vous invite à exécuter l'assistant d'onboarding sur l'hôte (elle mentionne `lightnode-sx` ; `lightnode-ux onboard` fait la même chose) :

```bash
lightnode-sx onboard
```

L'assistant exécute l'auto-test PQC, demande votre point d'accès de chaîne, et importe ou génère la clé de votre nœud. Une fois un point d'accès configuré, redémarrez le nœud et le dashboard commence à afficher les données de chaîne en direct.

## Pour aller plus loin

- [Enregistrement et licences](/light-node/registration-and-licensing) — enregistrer le nœud on-chain.
- [Récompenses et supervision](/light-node/rewards-and-monitoring) — comment la part de 3 % des nœuds légers est créditée et réclamée, et comment superviser la santé du nœud.
