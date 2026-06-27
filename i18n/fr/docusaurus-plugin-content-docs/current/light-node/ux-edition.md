---
slug: /light-node/ux-edition
title: Édition UX (dashboard web)
sidebar_label: Édition UX
sidebar_position: 3
---

# Édition UX — dashboard web

L'édition **UX (User eXperience)** exécute le même démon de nœud léger que l'édition SX, mais ajoute un **dashboard web intégré** pour que vous puissiez surveiller le nœud et le réseau dans un navigateur. Le binaire est `lightnode-ux`. Comme l'édition SX, il s'agit de la lignée **v3.1.1** du nœud léger (sa propre version, distincte de la version de la chaîne).

L'édition UX est le bon choix pour une utilisation sur ordinateur de bureau et pour les opérateurs qui préfèrent une interface visuelle à la ligne de commande.

## Installation

### Compiler depuis les sources

L'édition UX nécessite **Go 1.26.1** et se compile avec CGO activé pour la bibliothèque native post-quantique :

```bash
CGO_ENABLED=1 go build -o build/lightnode-ux ./cmd/lightnode-ux/
```

Cela produit `build/lightnode-ux`.

### Docker

Le service UX se compile à partir de `Dockerfile.ux` :

```bash
docker compose up lightnode-ux
```

Le conteneur UX conserve les données dans un volume nommé sur `/root/.qorechain-lightnode` et lit l'adresse RPC de la chaîne depuis la variable d'environnement `QORECHAIN_RPC_ADDR`.

## Exécution

Démarrez le nœud UX :

```bash
build/lightnode-ux start
```

Cela lance le démon et le serveur du dashboard intégré ensemble. L'édition UX active toujours le dashboard. Au démarrage, le binaire affiche l'URL du dashboard.

L'édition UX partage sa configuration avec l'édition SX : elle lit le même `config.toml` depuis `~/.qorechain-lightnode` et utilise le même keyring Dilithium-5. Si vous n'avez pas encore configuré le nœud, exécutez d'abord l'assistant SX (`lightnode-sx onboard`) pour écrire la configuration et importer ou générer votre clé — voir [Édition SX](/light-node/sx-edition).

## Le dashboard web sur le port 8420

Le dashboard est exposé sur le **port 8420**. C'est le port que l'image Docker `lightnode-ux` déclare (`EXPOSE 8420`) et celui auquel le binaire se lie par défaut, de sorte qu'en exécution sous Docker le dashboard est publié sur `8420` :

```
http://localhost:8420
```

:::caution Vérifiez votre mappage de port dans Compose
Certains textes ailleurs font référence au port 8080 pour le dashboard. La valeur de référence est **8420** — c'est ce que l'image expose réellement et ce à quoi le démon se lie par défaut. Si vous adaptez votre propre `docker-compose.yml` ou un reverse proxy, mappez vers **8420**, et non 8080.
:::

## Ce que montre le dashboard

Le dashboard est organisé selon les vues suivantes :

- **Overview** — hauteur de bloc et état du nœud en un coup d'œil.
- **Validators** — l'ensemble des validateurs liés (bonded).
- **Delegation** — vos délégations actuelles et leur répartition.
- **Network** — télémétrie réseau en direct et en-têtes récemment synchronisés.
- **Bridge** — télémétrie du pont inter-chaînes.
- **Tokenomics** — télémétrie de l'économie du token.
- **Settings** — la configuration effective du nœud.

La télémétrie se met à jour en temps réel, le démon rafraîchissant les données des validateurs, du réseau, du pont et de la tokenomics selon des intervalles indépendants (configurables sous `[telemetry]` dans `config.toml`).

### Bannière mode local uniquement

Si le nœud n'a **aucun point d'accès RPC de chaîne configuré**, le dashboard fonctionne en **mode local uniquement** et affiche une bannière bien visible expliquant l'état : la pile PQC est vérifiée, mais le nœud ne synchronise aucune chaîne, de sorte que la hauteur de bloc reste à `0`. La bannière vous invite à exécuter l'assistant d'onboarding sur l'hôte :

```bash
lightnode-sx onboard
```

L'assistant exécute l'auto-test PQC, demande votre point d'accès de chaîne, et importe ou génère votre clé de validateur. Une fois un point d'accès configuré, redémarrez le nœud et le dashboard commence à afficher les données de chaîne en direct.

## Pour aller plus loin

- [Enregistrement et licences](/light-node/registration-and-licensing) — enregistrer le nœud on-chain.
- [Récompenses et supervision](/light-node/rewards-and-monitoring) — gagner la part de 3 % des nœuds légers et superviser la santé du nœud.
