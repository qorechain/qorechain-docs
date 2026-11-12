---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Présentation
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** est le festival des développeurs de QoreChain, organisé en ligne sur [build.qorechain.io](https://build.qorechain.io) avec le hashtag #BuildBeforeQDay. Les participants choisissent un niveau, construisent sur le testnet QoreChain avec les kits open source, publient leur travail en public et présentent leur projet à un jury et à la communauté. En marge du festival, un atelier technique a lieu chaque semaine. Chaque atelier dispose dans cette section d'un guide complet pas à pas, de la première commande à la dernière, pour que vous puissiez tout faire à votre rythme sur votre propre ordinateur. Les applications d'exemple de chaque atelier sont réunies dans le dépôt public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovations {#innovations}

Chaque atelier de cette section s'articule autour des fonctionnalités qui distinguent QoreChain :

- **Signature hybride.** Une transaction est signée deux fois : une fois avec une clé classique secp256k1 et une fois avec une clé post-quantique ML-DSA-87. Quelqu'un qui ne vole que la clé classique ne peut pas produire la seconde signature.
- **Vérifiée sur la chaîne.** Les validateurs contrôlent les deux signatures. La transaction porte une extension `PQCHybridSignature` et la chaîne émet un événement `pqc_hybrid_verify` avec le statut `verified`. Vous pouvez lire les deux depuis le point de terminaison REST public et voir le résultat dans l'explorateur.
- **Des outils ordinaires.** Vous gardez Hardhat, Foundry ou le langage de votre choix. Les kits s'occupent pour vous de la clé post-quantique et de la fenêtre d'autorisation.

## Comment ça marche {#how-it-works}

1. **Inscrivez-vous** sur [build.qorechain.io](https://build.qorechain.io) : connectez-vous avec GitHub, choisissez votre niveau, connectez X et QoreX.
2. **Construisez** sur le testnet avec les kits, les ateliers hebdomadaires et les défis de mi-parcours. Les commits et les mises à jour apparaissent dans le fil public.
3. **Soumettez** avant la date limite un dépôt public, une vidéo de 3 minutes au maximum et l'adresse du testnet utilisée par votre projet.

La participation est gratuite : vous construisez sur le testnet, où les QOR de test viennent du [faucet](/dashboard/faucet). Les règles complètes d'éligibilité, de soumission et d'évaluation figurent sur la page Règles du site du festival. La cagnotte totale est de 20 000 $, avec des subventions de suivi en QOR à partir de janvier 2027 ; la répartition est détaillée sur le site du festival.

## Niveaux {#levels}

Vous choisissez un niveau à l'inscription et vous pouvez le modifier ensuite.

| Niveau | À qui il s'adresse |
| --- | --- |
| Quantum Pass | Vous découvrez QoreChain ou le web3. Construisez une petite application qui envoie une transaction hybride post-quantique et la relit depuis la chaîne. |
| Intermédiaire | Vous avez déjà livré une dApp. Construisez une application complète avec le SDK QoreChain et QoreX. |
| Avancé | Trois pistes : A, agents ; B, applications chiffrées avec QoreSeal ; C, applications cross-VM qui couvrent les voies EVM et Native. |
| Expert | Infrastructure de protocole : rollups avec le RDK, IBC avec QORel, custody et outillage pour développeurs. |

L'atelier 1 couvre exactement ce que demande le niveau Quantum Pass : une transaction signée de façon hybride, vérifiée sur la chaîne.

## Calendrier {#timeline}

Toutes les heures sont en UTC.

| Quand | Quoi |
| --- | --- |
| 4 novembre 2026 | Ouverture des inscriptions et du développement |
| Chaque semaine | Un atelier (4 au total) avec son guide pas à pas ici |
| 18 novembre 2026 | Début des défis de mi-parcours |
| 2 décembre 2026, 23:59 | Date limite de soumission |
| 3 au 5 décembre | Vérification des soumissions |
| 6 au 15 décembre | Évaluation et vote du Choix du public |
| 16 décembre | Lauréats et démonstration en direct |
| 17 au 22 décembre | Versement des prix |
| Janvier 2027 | Subventions de suivi |

Le calendrier est publié sur le site du festival.

## Ateliers {#workshops}

| Atelier | Sujet | Guide |
| --- | --- | --- |
| Atelier 1 | Votre première transaction signée de façon hybride | [Atelier 1](/build-before-qday/workshop-1) |

Chaque guide part d'une machine sans rien d'installé. Il liste ce qu'il faut installer, puis déroule les commandes une à une : récupérer le code, installer, créer une clé réservée au testnet, obtenir des QOR de test depuis le faucet, exécuter, et vérifier le résultat dans l'explorateur. Il se termine par les paquets utilisés et les applications d'exemple. Toutes les applications d'exemple se trouvent dans le dépôt public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Par où commencer {#where-to-start}

- Suivez l'[Atelier 1](/build-before-qday/workshop-1) sur le testnet.
- Parcourez les [applications d'exemple](/build-before-qday/workshop-1/kits) et les kits qui les sous-tendent.
- Si vous n'avez jamais déployé sur QoreChain, lisez d'abord [Déployer en 5 minutes](/getting-started/deploy-in-5-minutes).
