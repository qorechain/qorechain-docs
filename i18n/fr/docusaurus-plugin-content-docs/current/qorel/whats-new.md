---
slug: /qorel/whats-new
title: Nouveautés de QORel
sidebar_label: Nouveautés
sidebar_position: 2
---

# Nouveautés de QORel

Cette page liste ce que chaque version de QORel apporte. Elle s'adresse aux opérateurs qui hésitent à passer de Hermes, ou d'une version antérieure de QORel, et elle n'énonce que ce qu'une version fait, sous forme de comportements vérifiables. QORel est basé sur Hermes 1.13.3 (Informal Systems, Apache-2.0) ; chaque changement ci-dessous s'ajoute à cette base. Tout ce qui n'est pas listé se comporte comme dans Hermes.

## 0.1.0 {#v0-1-0}

Première version. Testnet uniquement. La [page des versions](https://github.com/qorechain/QORel/releases) contient les fichiers.

### Innovations {#innovations}

- **Signature hybride post-quantique pour QoreChain.** Réglez `signing = 'qorechain-hybrid'` sur une chaîne et QORel ajoute la signature ML-DSA-87 (`/qorechain.pqc.v1.PQCHybridSignature`) comme seule option d'extension critique de chaque transaction, puis signe le corps final avec secp256k1. Le message que la clé post-quantique signe correspond aux sign bytes de version 2, que les deux réseaux QoreChain vérifient. Des `extension_options` statiques ne peuvent pas être combinées avec ce mode, et la configuration est refusée si elles le sont.
- **La signature standard est inchangée.** Avec `signing = 'standard'` (la valeur par défaut), le format de transaction est identique octet pour octet à celui de Hermes, pour Cosmos Hub, Osmosis et toute autre chaîne Cosmos SDK.
- **Le crate `qorel-signer`.** La primitive post-quantique (`PqSigner`, avec `MlDsa87Signer`), les règles de la chaîne (`SignBytesFramer`) et le signataire d'extension que le relayeur appelle (`TxExtensionSigner`) sont des interfaces séparées. La simulation du gas et le dimensionnement des lots passent par le même chemin, de sorte que les quelque 4,7 Ko supplémentaires et le gas de vérification sont toujours comptés.
- **`qorel keys add` dérive la clé post-quantique.** Sur une chaîne hybride, il dérive la clé ML-DSA-87 à partir de la même phrase mnémonique et du même compte avec la dérivation de portefeuille de QoreChain et ne stocke que sa graine de 32 octets, à côté de la clé, sous le nom `<key name>.pqc`. Rien de secret n'est affiché.
- **`qorel keys register-pqc`.** Envoie `MsgRegisterPQCKeyV2` une seule fois, avec une preuve de possession sur les réseaux en v3.2.3 ou plus récent. Il est idempotent (rien n'est envoyé si la même clé est déjà enregistrée) et refuse d'envoyer lorsque le compte a déjà une clé différente. `--no-proof` n'existe que pour les réseaux antérieurs à la v3.2.3.
- **`qorel keys pqc-status`.** Indique si la clé est enregistrée, si elle correspond à la clé locale, si la possession a été prouvée, quels sign bytes la chaîne vérifie, et `ready_to_relay`.
- **Vérification de sécurité avant envoi.** Avant chaque transaction vers une chaîne hybride, QORel vérifie que la clé est chargée, enregistrée et identique à la clé locale, et que la version des sign bytes est connue. Avec `pqc.sign_bytes = 'auto'`, il lit la version depuis les enregistrements de mise à niveau appliqués de la chaîne, la relit chaque minute, et la relit après tout refus avec le codespace `pqc` code 21. En cas d'échec, rien n'est envoyé et aucun frais n'est dépensé ; `health-check` indique la raison.
- **Prix du gas selon le marché des frais.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` lit les frais de base de QoreChain, qui ont un plancher de 0,1 uqor par gas.
- **Détection des comportements malveillants sur les chaînes ibc-go v10.** QORel lit l'en-tête dans la transaction `MsgUpdateClient` parce qu'ibc-go v10 ne l'inclut plus dans les événements `update_client`. Hermes 1.13 standard désactive la détection sur ces chaînes.
- **Les workers de paquets résistent à la limitation de débit.** Les workers restent actifs tant qu'une tentative de relais ou de purge a échoué et réessaient à chaque intervalle de purge. Dans Hermes, un worker s'arrête aussi après `clear_interval x 5` blocs sans nouvel événement IBC, même lorsque le dernier cycle de purge a échoué, de sorte qu'un paquet en attente à ce moment-là patientait jusqu'au paquet suivant sur le canal ou jusqu'à un redémarrage.
- **Fichiers de clés réservés au propriétaire.** Hermes écrivait les fichiers de clés avec l'umask par défaut. QORel écrit `<key name>.json` et `<key name>.pqc` avec le mode 0600. Les clés ajoutées par un ancien Hermes gardent leur ancien mode ; vérifiez-les avec `ls -l`.
- **Un binaire `qorel`.** Un seul binaire, `qorel`, avec le jeu de commandes de Hermes plus les commandes de clés post-quantiques. Un binaire `hermes` avec la même CLI est aussi construit à partir de l'arborescence des sources.
- **Des versions avec provenance.** Archives pour Linux et macOS, paquets `.deb` et `.rpm` avec une unité systemd durcie, une formule Homebrew, et une image de conteneur multi-architecture signée avec cosign. Les fichiers de version sont accompagnés de `SHA256SUMS` et d'attestations de build. Voir [Installation](/qorel/install).
- **Un test devnet local.** Le dépôt inclut `scripts/qorel-devnet/`, qui construit localement un nœud QoreChain et une chaîne de test ibc-go v10 et exécute un test de bout en bout ICS-20 dans les deux sens : enregistrement des clés, création du client, de la connexion et du canal, transferts dans les deux sens, retour d'un jeton transféré, un paquet expiré purgé et remboursé, et un transfert envoyé par QORel lui-même.

### Éprouvé sur le testnet {#proven-on-the-testnet}

- Le premier canal IBC du testnet QoreChain, `transfer/channel-0` sur `qorechain-diana` vers `channel-600` sur le testnet public de Cosmos Hub (identifiant de chaîne `provider`), est relayé par QORel. Les clients sont `07-tendermint-0` et `07-tendermint-466`, les connexions `connection-0` et `connection-315`.
- Les transferts ont été testés dans les deux sens (1 QOR à l'aller, 0,1 ATOM au retour, 0,4 QOR renvoyés) et le remboursement automatique d'un transfert avec un délai d'expiration d'1 seconde, par un message de timeout. Les 13 transactions du relayeur sur `qorechain-diana` ont réussi.
- La vue en lecture du canal se trouve sur [Pont d'actifs](/user-guide/bridging-assets#ibc-test-channel).

### Pas dans cette version {#not-in-this-release}

- Le relais IBC v2. Il n'est pas encore implémenté dans QORel et constitue la prochaine phase.
- Le relais Ethereum (Eureka). Non commencé.
- Le relais sur le mainnet. Aucun canal IBC du mainnet n'est encore ouvert.
- Un build Windows.
- Le crate `qorel-signer` sur crates.io. La publication est bloquée ; le crate se trouve dans le dépôt à `crates/qorel-signer`, utilisez donc une dépendance git.

## Mise à niveau {#upgrading}

Il n'existe aucune version antérieure de QORel. Pour passer de Hermes 1.13 à QORel 0.1.0 :

1. Installez `qorel` à côté de `hermes` ou à sa place ([Installation](/qorel/install)).
2. Conservez votre `config.toml`. Les chaînes sans `signing` restent en signature standard et se comportent comme avant.
3. Renommez la commande dans vos fichiers de service de `hermes` en `qorel`. Le dossier du magasin de clés (`~/.hermes/keys` par défaut) est inchangé, ce qui explique pourquoi l'image de conteneur monte ses données dans `/home/nonroot/.hermes`.
4. Vérifiez les modes des fichiers de clés avec `ls -l` ; les nouvelles clés sont en 0600, les plus anciennes gardent leur mode.

Les notes de mise à niveau de Hermes en amont, dans le fichier `UPGRADING.md` du dépôt, s'appliquent à quiconque vient d'une version de Hermes antérieure à la 1.6.
