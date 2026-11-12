---
slug: /build-before-qday/overview
title: Build Before Q-Day
sidebar_label: Vue d'ensemble
sidebar_position: 1
---

# Build Before Q-Day

**Build Before Q-Day** est le festival de développeurs de QoreChain, organisé en ligne sur [build.qorechain.io](https://build.qorechain.io) avec le hashtag #BuildBeforeQDay. Les participants choisissent un niveau, construisent sur le testnet de QoreChain avec les kits open source, publient leur travail en public et présentent leur projet à un jury et à la communauté. En parallèle du festival, il y a un atelier technique par semaine. Chaque atelier a un guide complet pas à pas dans cette section, de la première commande à la dernière, pour que vous puissiez tout faire à votre rythme sur votre propre ordinateur, même si vous débutez en développement. Les applications d'exemple sont réunies dans le dépôt public [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday).

## Innovations {#innovations}

Chaque atelier de cette section repose sur les fonctions qui distinguent QoreChain :

- **Signature hybride.** Une transaction est signée deux fois : une fois avec une clé classique secp256k1 et une fois avec une clé post-quantique ML-DSA-87. Quelqu'un qui ne vole que la clé classique ne peut pas produire la seconde signature.
- **Vérifiée sur la chaîne.** Les validateurs contrôlent les deux signatures. La transaction porte une extension `PQCHybridSignature` et la chaîne émet un événement `pqc_hybrid_verify` avec le statut `verified`. Vous pouvez lire les deux sur le point de terminaison REST public et voir le résultat dans l'explorateur.
- **Des outils ordinaires.** Vous gardez Hardhat, Foundry ou le langage de votre choix. Les kits s'occupent pour vous de la clé post-quantique et de la fenêtre d'autorisation.

## Comment ça marche {#how-it-works}

1. **Inscrivez-vous** sur [build.qorechain.io](https://build.qorechain.io) : connectez-vous avec GitHub, choisissez votre niveau, connectez X et QoreX.
2. **Construisez** sur le testnet avec les kits, les ateliers hebdomadaires et les défis de mi-parcours. Les commits et les mises à jour apparaissent dans le fil public.
3. **Soumettez** avant la date limite un dépôt public, une vidéo de 3 minutes maximum et l'adresse testnet que votre projet utilise.

La participation est gratuite : vous construisez sur le testnet, où le QOR de test vient du [faucet](/dashboard/faucet). Les règles complètes d'éligibilité, de soumission et de jugement se trouvent sur la page Règles du site du festival. La cagnotte totale est de 20 000 $, avec des subventions de suite en QOR à partir de janvier 2027 ; la répartition est sur le site du festival.

## Niveaux {#levels}

Vous choisissez un niveau à l'inscription, et vous pouvez le changer plus tard.

| Niveau | À qui il s'adresse |
| --- | --- |
| Quantum Pass | Vous débutez avec QoreChain ou le web3. Construisez une petite application qui envoie une transaction hybride post-quantique et la relit depuis la chaîne. |
| Intermédiaire | Vous avez déjà publié une dApp. Construisez une application complète avec le SDK QoreChain et QoreX. |
| Avancé | Trois pistes : A, agents ; B, applications chiffrées avec QoreSeal ; C, applications cross-VM qui couvrent les voies EVM et native. |
| Expert | Infrastructure de protocole : rollups avec le RDK, IBC avec QORel, conservation et outils pour développeurs. |

L'atelier 1 couvre exactement ce que demande le niveau Quantum Pass : une transaction signée de façon hybride, vérifiée sur la chaîne.

## Calendrier {#timeline}

Toutes les heures sont en UTC.

| Quand | Quoi |
| --- | --- |
| 4 novembre 2026 | Ouverture des inscriptions et de la construction |
| Chaque semaine | Un atelier (4 au total) avec son guide pas à pas ici |
| 18 novembre 2026 | Début des défis de mi-parcours |
| 2 décembre 2026, 23:59 | Date limite de soumission |
| Du 3 au 5 décembre | Vérification des soumissions |
| Du 6 au 15 décembre | Jugement et vote du choix du public |
| 16 décembre | Gagnants et émission de démonstration en direct |
| Du 17 au 22 décembre | Versement des prix |
| Janvier 2027 | Subventions de suite |

Le calendrier est sur le site du festival.

## À qui cela s'adresse {#who}

Vous n'avez pas besoin de connaître la blockchain ni la cryptographie post-quantique. Si vous savez ouvrir un terminal et coller une commande, vous pouvez suivre tous les guides d'ici. Chaque guide explique en mots simples ce que fait chaque commande et ce que signifie chacune de ses parties, puis montre ce que vous devez voir à l'écran. Quand un guide dit qu'une commande peut prendre un moment, attendez qu'elle se termine avant de lancer la suivante.

## Choisir un tutoriel {#choose}

Faites d'abord le **guide de l'atelier 1**. C'est le parcours complet, d'un ordinateur vide à une transaction signée avec deux clés et vérifiée sur la chaîne. Ensuite, choisissez n'importe quelle application ci-dessous. Elles montrent la même idée dans différents langages et outils.

Les durées concernent les étapes qui suivent l'installation des outils. Installer les outils la première fois ajoute environ 20 à 40 minutes : voir [Avant de commencer](/build-before-qday/prerequisites).

| Tutoriel | Niveau | Langage | Durée | Ce que vous aurez à la fin |
| --- | --- | --- | --- | --- |
| [Guide de l'atelier 1](/build-before-qday/workshop-1) | Débutant | TypeScript, Solidity | 30 minutes | Un projet que vous avez généré, testé et déployé sur le testnet, et une transaction signée de façon hybride et vérifiée sur la chaîne. |
| [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter) | Débutant | TypeScript, Solidity | 25 minutes | Un contrat compteur sur le testnet que vous incrémentez avec un flux signé de façon hybride. |
| [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) | Intermédiaire | TypeScript, Solidity, React | 45 minutes | Votre propre livre d'or sur la chaîne, avec une page web où vous signez depuis le portefeuille QoreX. |
| [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) | Débutant | TypeScript, React | 25 minutes | Une page web qui envoie du QOR depuis QoreX et affiche les deux signatures et le verdict de la chaîne. |
| [Rust, qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) | Intermédiaire | Rust | 25 minutes | Une application en ligne de commande qui paie avec une signature hybride et la vérifie sur la chaîne. |
| [Java, Tip Jar](/build-before-qday/workshop-1/apps/java-tipjar) | Intermédiaire | Java 21 | 25 minutes | Un backend qui envoie des pourboires et n'accepte que les paiements signés de façon post-quantique. |
| [Python, Airdrop](/build-before-qday/workshop-1/apps/python-airdrop) | Débutant | Python | 20 minutes | Une transaction qui paie de nombreuses adresses, signée avec les deux clés et vérifiée sur la chaîne. |

Ce que signifient les niveaux ici :

- **Débutant :** quelques commandes à coller dans l'ordre. Aucun code à écrire.
- **Intermédiaire :** la même chose, avec un second outil comme une page web, une extension de portefeuille ou une chaîne d'outils de langage que vous n'avez peut-être jamais utilisée.

Chaque tutoriel suit la même structure : **Avant de commencer**, des étapes numérotées (chaque commande avec ce qu'elle fait et ce que signifie chacune de ses parties), **Ce que vous devez voir**, comment **vérifier** la transaction sur la chaîne, et un tableau de **Dépannage**.

## Avant de commencer {#before-you-start}

Lisez une fois [Avant de commencer : les outils et un portefeuille testnet](/build-before-qday/prerequisites). Cette page couvre :

- L'installation de Node.js, pnpm, Git, Rust, Java, Maven, Python et jq sur macOS, Windows et Linux, avec une commande de vérification pour chacun.
- La configuration du portefeuille QoreX sur le testnet.
- L'obtention de QOR de test auprès du faucet (100 QOR toutes les 24 heures par compte).
- QOR et uqor : 1 QOR vaut 1 000 000 uqor.
- Comment protéger une clé testnet jetable. Utilisez uniquement des comptes de test, jamais un portefeuille avec de vrais fonds.

## Par où commencer {#where-to-start}

1. Lisez [Avant de commencer](/build-before-qday/prerequisites) et installez les outils de votre premier tutoriel.
2. Suivez le [guide de l'atelier 1](/build-before-qday/workshop-1) sur le testnet.
3. Essayez l'une des applications d'exemple du tableau ci-dessus.
4. Si vous n'avez jamais déployé sur QoreChain, [Déployer en 5 minutes](/getting-started/deploy-in-5-minutes) explique l'idée en détail. Les kits derrière les applications se trouvent sur la page [Kits](/build-before-qday/workshop-1/kits).

## Le code {#code}

Toutes les applications d'exemple sont dans un seul dépôt public, dossier `workshop-1` : [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday). Chaque tutoriel vous indique quel dossier ouvrir. Récupérez le code une fois avec :

```bash
git clone https://github.com/qorechain/build-before-qday
```

| Partie | Ce qu'elle fait |
| --- | --- |
| `git clone` | Télécharge une copie complète d'un dépôt de code sur votre ordinateur. |
| `https://github.com/qorechain/build-before-qday` | L'adresse du dépôt à copier. |

**Ce que vous devez voir :** un nouveau dossier nommé `build-before-qday` dans le dossier où vous avez lancé la commande.
