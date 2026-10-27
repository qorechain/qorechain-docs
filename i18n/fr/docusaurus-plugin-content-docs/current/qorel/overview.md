---
slug: /qorel/overview
title: Présentation de QORel
sidebar_label: Présentation
sidebar_position: 1
---

# QORel

QORel est le relayeur IBC de QoreChain. Un relayeur est le programme qui transporte les paquets IBC, les preuves et les mises à jour de clients entre deux chaînes ; sans relayeur en marche, un transfert sur un canal IBC reste en attente. QORel s'adresse aux opérateurs, aux validateurs et aux équipes qui veulent assurer le relais d'un canal QoreChain, et à toute personne qui a besoin d'un relayeur capable de soumettre des transactions à QoreChain.

QoreChain exige une signature hybride post-quantique (secp256k1 plus ML-DSA-87, FIPS 204) sur chaque transaction de la voie native, et un relayeur standard ne la produit pas : QoreChain refuse donc ses transactions. QORel ajoute cette signature pour QoreChain et signe toutes les autres chaînes Cosmos SDK de la manière standard. C'est un seul binaire, `qorel`, publié sous Apache-2.0. C'est un fork de [Hermes](https://github.com/informalsystems/hermes) 1.13.3, le relayeur IBC écrit par Informal Systems (Apache-2.0) ; le mérite du moteur de relais leur revient, et QORel conserve les commandes et la configuration de Hermes pour toute chaîne qui n'a pas besoin de la signature supplémentaire.

QORel 0.1.0 est **réservé au testnet**. Il a relayé entre le testnet QoreChain `qorechain-diana` et le testnet public de Cosmos Hub (identifiant de chaîne `provider`). L'IBC sur le mainnet n'est pas encore ouvert ; la prise en charge du mainnet viendra plus tard, lorsqu'un canal y sera ouvert.

## Innovations {#innovations}

- **Un mode de signature par chaîne.** Chaque chaîne de la configuration a un paramètre `signing`. `'qorechain-hybrid'` ajoute la signature ML-DSA-87 que QoreChain vérifie. La valeur par défaut, `'standard'`, produit des transactions identiques octet pour octet à celles de Hermes, de sorte que le même processus QORel relaie QoreChain et le côté Cosmos Hub en parallèle.
- **Une couche de signature modulaire.** Le crate `qorel-signer` définit séparément une primitive post-quantique, les règles de sign bytes d'une chaîne et un signataire d'extension de transaction. Le relayeur l'appelle une fois les auth info finalisées et avant la construction du document de signature classique, et la simulation du gas passe par le même chemin. Une chaîne avec une signature supplémentaire différente a besoin d'un nouveau framer dans ce crate, pas d'une modification du relayeur. Voir [Signer depuis n'importe quel langage](/qorel/signing-from-any-language) pour le contrat.
- **Gestion des clés post-quantiques dans les commandes de clés.** `qorel keys add` dérive la clé ML-DSA-87 à partir de la même phrase mnémonique que le compte, avec la dérivation de portefeuille de QoreChain, de sorte que la clé du relayeur correspond à ce que QoreX ou le SDK dériveraient. `qorel keys register-pqc` enregistre la clé publique une fois, avec une preuve de possession. `qorel keys pqc-status` indique si la clé est opérationnelle.
- **Une vérification avant chaque envoi.** Avant chaque transaction vers une chaîne hybride, QORel confirme que la clé post-quantique est enregistrée sur la chaîne et qu'elle est identique à celle qu'il détient localement, et lit la version des sign bytes depuis la chaîne. Si quelque chose ne va pas, il n'envoie rien, de sorte qu'aucun frais n'est dépensé pour une transaction que la chaîne refuserait.
- **Prix du gas selon le marché des frais de QoreChain.** `dynamic_gas_price.backend = 'cosmos-evm-feemarket'` lit les frais de base de la chaîne (plancher de 0,1 uqor par gas) au lieu d'utiliser une estimation fixe.
- **Détection des comportements malveillants sur les chaînes ibc-go v10.** ibc-go v10 ne place plus l'en-tête dans les événements `update_client`, et Hermes 1.13 standard désactive la détection des comportements malveillants sur ces chaînes. QORel lit à la place l'en-tête dans la transaction `MsgUpdateClient`, de sorte que la détection continue de fonctionner.
- **Résilience face aux points d'accès à débit limité.** Les workers de paquets restent actifs et réessaient à chaque intervalle de purge tant qu'une tentative de relais ou de purge a échoué, par exemple après qu'un point d'accès public a brièvement répondu `429`. Ils ne s'arrêtent pour inactivité qu'après un cycle de purge réussi.
- **Fichiers de clés réservés au propriétaire.** Les fichiers de clés, y compris la graine post-quantique stockée, sont écrits avec le mode 0600.
- **Éprouvé sur un réseau réel.** Le premier canal IBC du testnet QoreChain, `transfer/channel-0` sur `qorechain-diana` vers `channel-600` sur le testnet public de Cosmos Hub, est relayé par QORel. Les transferts ont été testés dans les deux sens, ainsi que le retour d'un jeton transféré et le remboursement automatique d'un transfert expiré. Voir [Le canal de test](/user-guide/bridging-assets#ibc-test-channel).

La liste complète pour chaque version se trouve sur [Nouveautés](/qorel/whats-new).

## La connexion testnet en service {#testnet-connection}

| | `qorechain-diana` | Testnet public de Cosmos Hub (`provider`) |
|---|---|---|
| Client léger | `07-tendermint-0` | `07-tendermint-466` |
| Connexion | `connection-0` | `connection-315` |
| Canal | `transfer/channel-0` (`STATE_OPEN`, non ordonné, version `ics20-1`) | `transfer/channel-600` |

Deux traces de jeton existent sur cette connexion. L'ATOM sur le testnet QoreChain est `ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2` (trace `transfer/channel-0/uatom`). Le QOR sur le testnet du Hub est `ibc/BB4D5A9372637A885CC895F775B38B127354A31F3E20D8F6FB3997E34BF4AA4A` (trace `transfer/channel-600/uqor`). Une pull request du chain-registry qui ajoute ce chemin ([cosmos/chain-registry#8086](https://github.com/cosmos/chain-registry/pull/8086)) est ouverte et n'est pas fusionnée. Le mainnet n'a aucun canal IBC.

Ce qui a été testé : des transferts dans les deux sens (1 QOR à l'aller, 0,1 ATOM au retour, 0,4 QOR renvoyés) et le remboursement automatique d'un transfert avec un délai d'expiration d'1 seconde, relayé sous forme de message de timeout. Les 13 transactions du relayeur sur `qorechain-diana` ont réussi (code 0).

### Ce dont un relayeur tiers a besoin {#third-party}

Le testnet n'accepte que le type de client léger `07-tendermint` (`/ibc/core/client/v1/params` liste `allowed_clients = ["07-tendermint"]`) ; aucun client `08-wasm` ne peut être créé aujourd'hui. Pour ouvrir un canal vers QoreChain, un relayeur a besoin de :

- un client `07-tendermint` de chaque côté ;
- côté QoreChain, chaque transaction signée en hybride par un compte de relayeur dont la clé ML-DSA-87 est enregistrée. QORel le fait ; Hermes standard, le relayeur Go (`rly`) et ts-relayer sont rejetés ;
- un canal de transfert ICS-20 avec la version `ics20-1`.

Il n'existe pas non plus de liste d'autorisation de relayeurs pour la configuration de client IBC v2 (`/ibc/core/client/v2/config/07-tendermint-0` répond `allowed_relayers: []`). Les paquets IBC v2 utilisent des délais d'expiration absolus en secondes Unix. QORel ne relaie pas encore IBC v2.

## qorel-signer {#qorel-signer}

Le signataire est un crate séparé, `qorel-signer`, dans le dépôt QORel à `crates/qorel-signer`. Il n'est pas sur crates.io ; utilisez-le comme dépendance git. Ce qu'il garantit :

- **Co-signataire modulaire.** La signature supplémentaire d'une chaîne est ajoutée par un co-signataire, et les chaînes à signature standard n'en utilisent aucun, de sorte que leurs transactions restent inchangées.
- **Octets protobuf bruts.** Il travaille sur des octets encodés et ne dépend d'aucun type IBC ou de relayeur.
- **Une politique de corps de transaction.** Il refuse les corps que la chaîne rejetterait : une option d'extension critique existante, l'indicateur `unordered`, ou des champs inconnus.
- **Aucune supposition sur la version.** Il ne retombe jamais sur les sign bytes v1 sur les réseaux QoreChain tant que la version des sign bytes n'est pas connue.
- **Signatures auto-vérifiées.** Chaque signature est vérifiée avant d'être utilisée.
- **Secrets protégés.** Les secrets sont mis à zéro en mémoire et masqués dans la sortie `Debug`.
- **Tests octet pour octet.** Les tests reconstruisent, octet pour octet, des transactions de relais que l'ante handler de la chaîne a acceptées.

Un exemple d'utilisation figure dans `crates/qorel-signer/README.md` dans le dépôt ; voir aussi [Signer depuis n'importe quel langage](/qorel/signing-from-any-language#signer-layer). Le même point d'ancrage du signataire est proposé en amont dans Hermes sous la forme [informalsystems/hermes#4435](https://github.com/informalsystems/hermes/pull/4435) (ouverte, non fusionnée).

## Utilisation {#how-to-use}

Installez le binaire, écrivez une configuration avec une entrée par chaîne, ajoutez une clé pour chaque chaîne, enregistrez la clé post-quantique sur QoreChain, vérifiez l'état de la clé, puis démarrez le relayeur :

```bash
qorel keys add --chain qorechain-diana --key-name relayer --mnemonic-file ./relayer.mnemonic
qorel keys register-pqc --chain qorechain-diana
qorel keys pqc-status --chain qorechain-diana    # ready_to_relay must be true
qorel health-check
qorel start
```

Les pages de cette section :

| Page | Contenu |
|---|---|
| [Nouveautés](/qorel/whats-new) | Ce que la 0.1.0 ajoute par rapport à Hermes |
| [Installation](/qorel/install) | Archives, `.deb`, `.rpm`, Homebrew, conteneur, depuis les sources, et comment vérifier chacun |
| [Démarrage rapide](/qorel/quickstart) | De l'installation à un premier transfert sur le testnet |
| [Configuration](/qorel/configuration) | L'entrée de chaîne QoreChain, les clés, le gas et les vérifications de sécurité |
| [Exécuter à côté d'un validateur](/qorel/running-next-to-a-validator) | Dispositions systemd, Docker Compose et Kubernetes |
| [Surveillance](/qorel/monitoring) | Télémétrie, ce qui mérite une alerte |
| [Signer depuis n'importe quel langage](/qorel/signing-from-any-language) | Le contrat de signature hybride et les bibliothèques pour cinq langages |
| [Dépannage](/qorel/troubleshooting) | Questions et solutions |

## Accès {#how-to-access}

- **Réseau.** Testnet `qorechain-diana` uniquement (le testnet exécute la v3.2.6). Le mainnet `qorechain-vladi` n'a aucun canal IBC ouvert ; voir [Pont d'actifs](/user-guide/bridging-assets#ibc-testnet-v326) pour ce que propose chaque réseau.
- **Contrepartie.** Le testnet public de Cosmos Hub, identifiant de chaîne `provider`, via `channel-600`. Toute autre chaîne Cosmos SDK fonctionne de la même manière que l'entrée `provider` de la configuration d'exemple.
- **Points d'accès.** QORel a besoin d'un RPC de consensus, d'un WebSocket et d'un point d'accès gRPC pour chaque chaîne. Le testnet QoreChain dispose d'un RPC public (`https://rpc-testnet.qore.host`) et d'un REST public (`https://api-testnet.qore.host`), mais d'aucun point d'accès gRPC public aujourd'hui, et aucun n'est promis : un relayeur tiers pour `qorechain-diana` a donc besoin de son propre nœud testnet ([Exécuter un nœud](/developer-guide/running-a-node), [Se connecter au testnet](/getting-started/connecting-to-testnet)). Les points d'accès publics qui limitent le débit des relayeurs peuvent servir pour un court test, mais pas pour un relais continu.
- **Comptes.** Un compte de relayeur dédié sur chaque chaîne, avec un petit solde pour les frais. Les QOR de testnet proviennent du [faucet du tableau de bord](/dashboard/faucet) ; ils n'ont aucune valeur. N'utilisez jamais la clé d'opérateur d'un validateur.
- **Coût.** QORel est gratuit. Sur QoreChain, une transaction coûte le gas multiplié par le prix, avec un plancher de 0,1 uqor par gas, et la totalité des frais est prélevée sans remboursement.
- **Plateformes.** Linux x86_64 et arm64 (glibc 2.28 ou plus récent), macOS Apple Silicon et Intel, et une image de conteneur pour tout le reste. Windows n'est pas pris en charge ; utilisez le conteneur sous WSL2.

## Où c'est publié {#where-published}

| Où | Quoi | Version |
|---|---|---|
| [GitHub : qorechain/QORel](https://github.com/qorechain/QORel) | Sources, tickets, et page des versions avec archives, `.deb`, `.rpm`, `SHA256SUMS` et attestations de build | 0.1.0 |
| Homebrew | `brew install qorechain/tap/qorel` | 0.1.0 |
| `ghcr.io/qorechain/qorel` | Image de conteneur (amd64 et arm64, distroless, non root, signée avec cosign) | 0.1.0 |
| Crate `qorel-signer` | La couche de signature, dans le dépôt à `crates/qorel-signer` ; utilisez une dépendance git | Pas sur crates.io |

Licence : Apache-2.0. QORel est dérivé de Hermes, copyright Informal Systems Inc. et les auteurs de Hermes, également sous Apache-2.0 ; le fichier `NOTICE` du dépôt porte l'attribution. Voir [Installation](/qorel/install) pour les commandes et pour savoir comment vérifier un téléchargement.

Pour les autres paquets pour développeurs, voir [Paquets pour développeurs](/developer-tools/overview). Pour savoir comment l'IBC s'intègre à la chaîne, voir [Architecture du pont](/architecture/bridge-architecture#ibc-relayer).

## Limites et problèmes connus {#limits}

- **Testnet uniquement.** QORel a été exécuté sur `qorechain-diana` et sur le testnet public de Cosmos Hub. Il n'a pas relayé sur le mainnet, et aucun canal IBC du mainnet n'est ouvert.
- **IBC v1 (classique) uniquement.** Le relais IBC v2 n'est pas encore implémenté dans QORel ; c'est la prochaine phase. Le relais Ethereum (Eureka) n'a pas été commencé.
- **Version de la chaîne.** Le mode hybride suit la version des sign bytes que la chaîne indique. Les deux réseaux QoreChain vérifient aujourd'hui la forme actuelle (version 2).
- **Pas de relayeur hébergé.** Ce manuel ne propose pas de service de relayeur. Si aucun relayeur ne tourne pour un canal, un transfert reste en attente jusqu'à ce qu'il y en ait un.
- **Points d'accès publics.** Le côté QoreChain a besoin de gRPC, qui n'est pas public. Les points d'accès publics tiers pour d'autres chaînes limitent souvent le débit des relayeurs.
- **Pas un portefeuille.** QORel signe uniquement les transactions qu'il envoie en tant que relayeur. Pour la signature dans un portefeuille, voir [QoreSign](/qoresign/overview).
- **Pas de build Windows.** Utilisez le conteneur sous WSL2.
- **Statut de la version.** QORel est une version 0.x. Les commandes et paramètres identiques à ceux de Hermes conservent le comportement de Hermes ; les paramètres propres à QoreChain peuvent encore changer avant la 1.0.
