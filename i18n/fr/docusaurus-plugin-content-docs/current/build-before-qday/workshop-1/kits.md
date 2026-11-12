---
slug: /build-before-qday/workshop-1/kits
title: Les kits QoreChain
sidebar_label: Kits
sidebar_position: 10
---

# Les kits QoreChain

La pile de développement QoreChain compte quatorze kits. Cette page présente chacun en une ligne, avec sa version et l'endroit où il est publié, et se termine par six idées que vous pourriez construire avec eux. Douze kits sont disponibles. Deux ne sont pas livrés : le kit Asset est une proposition et le client léger PQ est une spécification.

## Innovations {#innovations}

- **La signature hybride ML-DSA-87 + secp256k1 est intégrée au SDK, aux portefeuilles et à QoreSign**, de sorte qu'une application n'a pas à implémenter elle-même la signature post-quantique.
- **Une transaction signée de façon hybride, vérifiée sur la chaîne**, sert de preuve commune à toutes les applications : voir le [Q-Day Counter](/build-before-qday/workshop-1/apps/qday-counter), le [Q-Day Guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) et le [Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector).
- **La même forme dans de nombreux langages.** Le SDK, QoreSign et la bibliothèque PQC sont livrés en plusieurs langages et vérifiés avec des vecteurs de test partagés.

## Construire des applications {#build-apps}

| Kit | Ce qu'il fait | Version et registre |
| --- | --- | --- |
| [SDK QoreChain](/sdk/overview) | Un client unique pour les voies native, EVM et SVM, avec signature hybride, enregistrement de clé PQC, assistants de fenêtre EVM, paliers de staking, tokenomics, AMM, appels cross-VM et rollups. TypeScript, Python, Rust, Java et Go. | 0.13.0 : npm, PyPI, crates.io, Maven Central, Go |
| [create-qorechain-dapp](/developer-tools/scaffolders-and-cli) | Génère un projet fonctionnel en une commande à partir de sept modèles : hardhat, foundry, viem-wagmi, fullstack-web, evm-solidity, cosmwasm et rollup-app. | 0.13.1 : npm |
| [RDK, le Rollup Development Kit](/rollups/overview) | Créer, lancer et exploiter des rollups spécifiques à une application qui se règlent sur QoreChain, avec des lots de règlement signés, des retraits et des lectures de disponibilité des données. | `@qorechain/rdk` 0.8.0, cinq langages |

```sh
npm i @qorechain/sdk @qorechain/evm
npx create-qorechain-dapp my-app -t hardhat --network testnet
```

## Portefeuilles et signature {#wallets-signing}

| Kit | Ce qu'il fait | Version et registre |
| --- | --- | --- |
| [QoreX et qorex-integrations](/developer-tools/qorex-integrations) | Le portefeuille officiel détient les deux clés, signe de façon hybride et montre ce que vous signez. Les intégrations ajoutent QoreX à RainbowKit et wagmi, cosmos-kit et Interchain Kit, avec des types, un portefeuille factice et des fixtures Playwright. Voir aussi la [présentation de QoreX](/qorex/overview). | QoreX 1.2.3 (iOS, Android), extension 0.4.2 (Chrome, Firefox), `@qorechain/qorex-rainbowkit` 0.1.0 |
| [Wallet Adapter](/developer-tools/wallet-adapter) | Ajoute QoreChain aux portefeuilles que les gens utilisent déjà (Keplr, Leap, Cosmostation, MetaMask, Phantom), y compris la signature hybride ML-DSA-87 exigée par la chaîne. | `@qorechain/wallet-adapter` 0.5.0 |
| [QoreSign](/qoresign/overview) | Signature hybride pour les portefeuilles et les backends autres que QoreX : dériver la clé ML-DSA, signer les transactions de la voie native avec les deux clés, vérifier localement les signatures hybrides, simuler avant de signer, et Sign In With QoreChain. | 0.2.0 : TypeScript, Rust, Go, Swift, Kotlin |
| [QoreChain PQC](/developer-tools/pqc-library) | Les primitives post-quantiques sur lesquelles repose le reste : ML-DSA (FIPS 204), ML-KEM (FIPS 203) et SHAKE-256, compatibles octet pour octet entre les langages et vérifiées avec des vecteurs de test partagés. | `@qorechain/pqc` 0.2.3, six langages |

```sh
npm i @qorechain/qorex-rainbowkit @qorechain/qorex-types
npm i @qorechain/wallet-adapter
npm i @qorechain/qoresign
npm i @qorechain/pqc
```

## Données et confidentialité {#data-privacy}

| Kit | Ce qu'il fait | Version et registre |
| --- | --- | --- |
| [QoreSeal](/developer-tools/qoreseal) | Chiffrer des données vers des comptes QoreChain avec ML-KEM-1024 (hybride avec X25519 par défaut). Un compte publie sa clé sur la chaîne et n'importe qui peut chiffrer pour lui. Plusieurs destinataires, clés d'auditeur et clés de groupe tournantes. | 0.1.0 : TypeScript, Rust, Go, Swift, Kotlin, Python |
| [QoreChain MCP](/developer-tools/mcp) | Un serveur Model Context Protocol et un outil en ligne de commande qui donnent aux outils de développement compatibles un accès en lecture à QoreChain : blocs, transactions, comptes, validateurs, paliers de staking, statut des signatures hybrides, lectures de contrats et estimations de frais. Il ne signe jamais, ne détient jamais de clés et ne diffuse jamais. | `@qorechain/mcp` 0.1.0 |

```sh
npm i @qorechain/qoreseal
npx -y @qorechain/mcp
```

## Infrastructure et conformité {#infra-compliance}

| Kit | Ce qu'il fait | Version et registre |
| --- | --- | --- |
| [QORel](/qorel/overview) | Un relayeur IBC, fork de Hermes, avec une couche de signature modulaire pour pouvoir relayer les chaînes qui exigent une signature post-quantique sur chaque transaction. Les chaînes standard gardent exactement le format Hermes. | 0.1.0 : GitHub, image de conteneur, Homebrew |
| [Kit de custody](/developer-tools/custody-kit) | Pour les dépositaires : ce que chaque voie exige, validation des adresses, détection des dépôts, signature et vérification des retraits, staking, et gestion de la clé ML-DSA-87, avec des vecteurs de test et du code de référence. | 0.1.0 : TypeScript, Python, Go, Rust, Java |
| [QoreScan](/developer-tools/qorescan) | Inventorie la cryptographie d'un déploiement (configuration des nœuds, clés par type, points de terminaison TLS, sources Solidity, état de la chaîne) et exporte un CBOM CycloneDX 1.6, avec des sorties alignées sur la Guidance FINMA 05/2026, la feuille de route PQC de l'UE et DORA. Une aide à l'inventaire, pas une certification. | `@qorechain/qorescan` 0.1.0 |
| [Kit Asset](/developer-tools/asset-kit) | **Proposition, non livré dans son ensemble.** Outillage pour les actifs tokenisés réglementés : adaptateurs ERC-3643 et CMTAT avec contrôle post-quantique du détenteur, coffres ERC-4626 et ERC-7540, console d'émetteur et clients. Les contrats EVM sont disponibles ; les modules d'actifs natifs sont une proposition. | 0.1.0 |
| [Client léger PQ](/developer-tools/pq-light-client) | **Spécification, non livré.** Un client léger qui suit des points de contrôle signés avec ML-DSA-87. QoreChain ne produit pas ces points de contrôle aujourd'hui. Le dépôt contient la spécification et des vérificateurs de référence (Go, Rust, TypeScript) pour que la conception puisse être examinée. | 0.1.0 (spécification) |

```sh
brew install qorechain/tap/qorel
npx @qorechain/qorescan --help
```

## Six choses à construire {#ideas}

| Idée | Construite avec | De quoi il s'agit |
| --- | --- | --- |
| Paiement résistant au quantique | SDK, QoreX | Un bouton « payer en QOR » pour une boutique en ligne où chaque paiement est signé de façon hybride. |
| Kit de démarrage pour hackathon | create-qorechain-dapp | De zéro à un contrat déployé sur le testnet en dix minutes, une commande par étudiant. |
| Sign In With QoreChain | QoreSign | Une connexion sans mot de passe pour une application web, avec la signature hybride vérifiée sur votre serveur. |
| Enchère à plis scellés | QoreSeal | Les offres restent chiffrées jusqu'à la révélation. |
| Inventaire de préparation PQC | QoreScan | Un inventaire cryptographique et un fichier CBOM pour une équipe fintech et ses auditeurs. |
| Relayer votre propre canal | QORel | Relayer entre le testnet QoreChain et un autre testnet de chaîne Cosmos. |

## Récupérer le code {#get-the-code}

Chaque kit a sa propre page de manuel, liée ci-dessus. Les applications d'exemple de cet atelier se trouvent dans le dépôt public [qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), et chaque page d'application les parcourt de la première commande à la dernière :

```sh
git clone https://github.com/qorechain/build-before-qday
```
