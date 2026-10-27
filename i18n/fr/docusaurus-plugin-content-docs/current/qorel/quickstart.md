---
slug: /qorel/quickstart
title: Démarrage rapide de QORel
sidebar_label: Démarrage rapide
sidebar_position: 4
---

# Démarrage rapide

Ce guide décrit le relais entre le testnet QoreChain `qorechain-diana` et le testnet public de Cosmos Hub (identifiant de chaîne `provider`) : installer, configurer, ajouter et enregistrer les clés, vérifier l'état des clés, démarrer le relayeur et envoyer un premier transfert. Il s'adresse à quelqu'un qui n'a encore jamais fait tourner de relayeur. Tout ici concerne le testnet ; les jetons n'ont aucune valeur.

## Innovations {#innovations}

- **L'état de la clé tient en un seul champ.** `qorel keys pqc-status` se termine par `ready_to_relay`. S'il vaut `true`, la clé post-quantique est enregistrée sur la chaîne et correspond à la clé locale, et le relayeur ne refusera pas ses propres transactions pour cette raison.
- **Rien n'est envoyé quand quelque chose ne va pas.** La vérification avant envoi arrête une mauvaise transaction avant qu'elle n'atteigne la chaîne : une étape oubliée ne coûte donc aucun frais.
- **Le même parcours pour chaque chaîne.** Les étapes du côté Cosmos Hub sont celles de Hermes ; seuls l'entrée de chaîne QoreChain et l'étape d'enregistrement sont nouvelles.

## Utilisation {#how-to-use}

### 1. Installer {#step-install}

Installez `qorel` avec n'importe quelle méthode de la page [Installation](/qorel/install) et vérifiez-le :

```bash
qorel --version
```

### 2. Obtenir la configuration {#step-config}

Copiez la configuration d'exemple depuis le dépôt (`packaging/config.example.toml` ; les `.deb` et `.rpm` la placent dans `/etc/qorel/config.example.toml`) :

```bash
mkdir -p ~/.hermes
curl -o ~/.hermes/config.toml https://raw.githubusercontent.com/qorechain/QORel/main/packaging/config.example.toml
```

Ouvrez `~/.hermes/config.toml` et remplacez les valeurs fictives du nœud QoreChain (`YOUR-QORECHAIN-NODE`) par les adresses RPC, gRPC et WebSocket d'un nœud testnet que vous exploitez. QoreChain n'a pas de point d'accès gRPC public : il vous faut donc votre propre nœud ; voir [Exécuter un nœud](/developer-guide/running-a-node) et [Se connecter au testnet](/getting-started/connecting-to-testnet). Chaque paramètre est expliqué sur [Configuration](/qorel/configuration).

La configuration d'exemple comporte deux chaînes : `qorechain-diana` avec `signing = 'qorechain-hybrid'`, et `provider` avec la signature standard par défaut. Elle limite le relais à `transfer/channel-0` sur QoreChain et à `transfer/channel-600` sur le testnet du Hub.

### 3. Créer et approvisionner les comptes du relayeur {#step-accounts}

Créez un nouveau compte pour le relayeur sur chaque chaîne. Utilisez un compte dédié, jamais la clé d'opérateur d'un validateur. Enregistrez la phrase mnémonique de chaque compte dans un fichier que vous seul pouvez lire :

```bash
umask 077
nano ./diana.mnemonic       # paste the mnemonic, save
nano ./provider.mnemonic
```

La même phrase mnémonique peut servir pour les deux chaînes, ou vous pouvez en utiliser une distincte pour chacune. QORel dérive par défaut avec le coin type 118 (`m/44'/118'/0'/0/0`) ; passez `--hd-path` à `keys add` si votre compte utilise un autre chemin.

Ajoutez les clés :

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./diana.mnemonic
qorel keys add --chain provider        --key-name relayer --mnemonic-file ./provider.mnemonic
```

Sur `qorechain-diana`, `keys add` dérive aussi la clé ML-DSA-87 à partir de la même phrase mnémonique et stocke sa graine à côté de la clé sous le nom `relayer.pqc`. Supprimez les fichiers de phrases mnémoniques lorsque vous avez terminé.

Approvisionnez ensuite les comptes. Affichez les adresses avec `qorel keys list --chain <id>`. Les QOR de testnet proviennent du [faucet du tableau de bord](/dashboard/faucet) ; les jetons de test du testnet du Hub proviennent du faucet public de ce réseau. Quelques jetons suffisent pour les frais : le plancher de QoreChain est de 0,1 uqor par gas, donc une transaction avec la limite de gas par défaut de 400 000 coûte environ 40 000 uqor au prix plancher. Vérifiez avec :

```bash
qorel keys balance --chain qorechain-diana
qorel keys balance --chain provider
```

### 4. Enregistrer la clé post-quantique {#step-register}

QoreChain n'accepte une transaction signée de façon hybride que d'un compte qui a enregistré sa clé publique ML-DSA-87. L'enregistrement se fait une seule fois :

```bash
qorel keys register-pqc --chain qorechain-diana
```

Il envoie une transaction, signée avec la seule clé classique (le seul type de transaction que QoreChain accepte ainsi), avec une preuve de possession. On peut le relancer sans risque : si la même clé est déjà enregistrée, il n'envoie rien. Si le compte a déjà une autre clé post-quantique enregistrée, il refuse et n'envoie rien.

Vérifiez l'état :

```bash
qorel keys pqc-status --chain qorechain-diana
```

Le résultat est un objet JSON avec les champs `chain_id`, `account`, `local_public_key_sha256`, `registered`, `matches_local_key`, `registered_public_key_sha256`, `possession_proven`, `sign_bytes` et `ready_to_relay`. Ne continuez que lorsque `ready_to_relay` vaut `true`. Voir [Dépannage](/qorel/troubleshooting) s'il ne l'est pas.

### 5. Contrôle de santé {#step-health}

```bash
qorel health-check
```

Il vérifie la configuration et la connexion à chaque chaîne, et signale un multiplicateur de gas inférieur à 1.1 sur une entrée QoreChain comme une possible erreur de configuration (un avertissement ; le relais fonctionne quand même).

### 6. Choisir le canal {#step-channel}

Le testnet dispose déjà d'un canal de transfert : `channel-0` sur `qorechain-diana`, dont la contrepartie est `channel-600` sur `provider` ([Le canal de test](/user-guide/bridging-assets#ibc-test-channel)). Pour le relayer, passez directement à l'étape 7.

Pour créer plutôt un nouveau canal bien à vous entre les deux chaînes :

```bash
qorel create channel \
  --a-chain qorechain-diana --b-chain provider \
  --a-port transfer --b-port transfer \
  --new-client-connection
```

`--new-client-connection` crée aussi les deux clients légers et la connexion. Cela envoie plusieurs transactions sur chaque chaîne. La commande affiche les identifiants du nouveau canal ; placez-les dans le `packet_filter` des deux entrées de chaîne.

### 7. Démarrer le relayeur {#step-start}

```bash
qorel start
```

Laissez-le tourner (utilisez le service systemd ou un conteneur pour un relayeur de longue durée ; voir [Exécuter à côté d'un validateur](/qorel/running-next-to-a-validator)). QORel relaie les paquets, rafraîchit les clients légers et surveille les comportements malveillants.

### 8. Envoyer un premier transfert {#step-transfer}

Dans un second terminal, envoyez 1000 uqor de QoreChain vers le testnet du Hub. QORel signe et envoie lui-même cette transaction, avec la même signature hybride :

```bash
qorel tx ft-transfer \
  --src-chain qorechain-diana --dst-chain provider \
  --src-port transfer --src-channel channel-0 \
  --amount 1000 --denom uqor \
  --timeout-seconds 600 \
  --receiver <a cosmos address on the Hub testnet>
```

Sans `--receiver`, les jetons vont à l'adresse du relayeur lui-même sur la chaîne de destination. Suivez ensuite le paquet :

```bash
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
```

Le paquet reste listé jusqu'à ce que le relayeur en marche le livre et que l'accusé de réception revienne. Sur QoreChain, vous pouvez aussi lire le canal et les traces de jetons via REST :

```bash
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
curl -s https://api-testnet.qore.host/ibc/apps/transfer/v1/denoms
```

Un transfert qui n'est pas livré avant son expiration est remboursé à l'expéditeur sur la chaîne source par le relayeur. La valeur `--timeout-seconds` ci-dessus lui laisse dix minutes.

## Accès {#how-to-access}

- **Réseau.** Testnet `qorechain-diana` et testnet public de Cosmos Hub uniquement.
- **Ce qu'il vous faut.** QORel, un nœud testnet QoreChain que vous exploitez (RPC, gRPC et WebSocket), des points d'accès joignables pour le testnet du Hub, un compte de relayeur approvisionné sur chaque chaîne, et la phrase mnémonique de chacun dans un fichier.
- **Coûts.** Des frais en jetons de test uniquement : sur QoreChain, le gas multiplié par un prix avec un plancher de 0,1 uqor par gas, sans remboursement du gas inutilisé.
- **Utilisateurs de conteneurs.** Exécutez chaque commande ci-dessus sous la forme `docker run --rm -v $HOME/.qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 <command>`, avec les fichiers de phrases mnémoniques dans le répertoire monté, et `start` comme conteneur de longue durée ([Installation](/qorel/install#container)).

## Où c'est publié {#where-published}

Le binaire et la configuration d'exemple proviennent du [dépôt QORel](https://github.com/qorechain/QORel) (`packaging/config.example.toml`) ; voir [Installation](/qorel/install) pour chaque canal et [Présentation de QORel](/qorel/overview#where-published) pour les versions.

## Limites et problèmes connus {#limits}

- **Testnet uniquement.** L'IBC du mainnet n'est pas ouvert ; ne dirigez pas ce parcours vers le mainnet.
- **Il vous faut votre propre nœud QoreChain.** Il n'existe pas de point d'accès gRPC public.
- **Un nouveau canal coûte des frais sur les deux chaînes** et ajoute un client et une connexion. Privilégiez le relais de `channel-0` sauf si vous avez besoin du vôtre.
- **Les points d'accès publics côté Hub peuvent limiter le débit.** QORel continue de réessayer, mais pour un relais continu utilisez vos propres nœuds.
- **En attente jusqu'au relais.** Si aucun relayeur ne tourne pour le canal, un transfert reste en attente jusqu'à ce qu'un relayeur démarre ou que le paquet expire.

Suite : [Configuration](/qorel/configuration), [Surveillance](/qorel/monitoring), [Dépannage](/qorel/troubleshooting).
