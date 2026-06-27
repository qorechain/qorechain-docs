---
slug: /dashboard/smart-contract-creator
title: Créateur de smart contracts
sidebar_label: Créateur de smart contracts
sidebar_position: 6
---

# Créateur de smart contracts

Le **Créateur de smart contracts** génère des smart contracts à partir d'une description en langage courant, propulsé par **QCAI**. Décrivez ce que vous voulez, choisissez votre blockchain cible, et QCAI écrit le contrat pour vous. Il prend en charge **17 blockchains** pour l'outillage IA, vous permettant ainsi de cibler l'écosystème pour lequel vous développez.

Connecter votre portefeuille vous permet d'enregistrer et de gérer les contrats que vous générez — voir [Présentation et premiers pas](/dashboard/overview#connect-your-wallet).

## Générer un contrat

1. **Décrivez votre contrat.** Dans le champ de saisie (prompt), écrivez ce que le contrat doit faire — par exemple, un jeton à offre fixe, une collection NFT ou un calendrier d'acquisition (vesting). Plus vous êtes précis, meilleur sera le résultat.
2. **Choisissez la blockchain.** Sélectionnez votre cible parmi les blockchains prises en charge. Le langage de contrat et la catégorie correspondant à votre choix sont affichés à côté du sélecteur.
3. **Choisissez un type de contrat** (facultatif). Choisissez un modèle de départ tel qu'un jeton, un NFT ou un contrat de gouvernance pour guider la génération.
4. **Générez.** Sélectionnez **Generate**. Un indicateur de progression affiche l'état pendant que QCAI produit le contrat.

## Examiner le résultat

Une fois la génération terminée, le Dashboard affiche le contrat dans une vue avec coloration syntaxique, accompagné de détails tels que le nom du contrat, la blockchain, le langage, la taille du fichier et l'heure de génération. Le prompt que vous avez utilisé est affiché avec le résultat à titre de référence.

À partir de là, vous pouvez :

- **Copier** le code du contrat dans votre presse-papiers.
- **Télécharger** le contrat sous forme de fichier au bon format pour la blockchain que vous avez choisie.
- **Modifier** le contrat pour l'affiner davantage.

## Partager et réutiliser

Chaque contrat généré possède sa propre page que vous pouvez ouvrir ou partager. Si vous ouvrez un contrat qui ne vous appartient pas, vous pouvez le **forker** (fork) pour en démarrer votre propre copie et continuer à partir de là.

:::tip Toujours examiner et tester
Le code généré par QCAI est un excellent point de départ, pas un substitut à un examen. Lisez le contrat, testez-le sur le [testnet](/getting-started/connecting-to-testnet) et soumettez-le à l'[Auditeur de contrats](/dashboard/contract-auditor) avant de déployer quoi que ce soit ayant de la valeur.
:::

## Liens connexes

- [Auditeur de contrats](/dashboard/contract-auditor) — exécutez une analyse de sécurité QCAI sur un contrat.
- [Guide du développeur](/developer-guide/evm-development) — déployer des contrats sur les runtimes de QoreChain.
