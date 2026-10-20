---
slug: /dashboard/smart-contract-creator
title: Créateur de smart contracts
sidebar_label: Créateur de smart contracts
sidebar_position: 6
---

# Créateur de smart contracts

Le **Créateur de smart contracts** génère des smart contracts à partir d'une description en langage courant, propulsé par **QCAI**. Décrivez ce que vous voulez, choisissez votre blockchain cible, et QCAI écrit le contrat pour vous. Il prend en charge **17 blockchains** pour l'outillage IA, vous permettant ainsi de cibler l'écosystème pour lequel vous développez.

Vous pouvez l'essayer **sans compte** : un nouveau visiteur obtient une génération gratuite et voit le contrat en entier. Un compte gratuit est nécessaire pour la suivante, ainsi que pour l'enregistrement, l'audit et le déploiement ; la page propose **Create a free account** une fois votre essai gratuit utilisé.

Connectez-vous pour enregistrer et gérer les contrats que vous générez — voir [Se connecter](/dashboard/overview#sign-in).

## Générer un contrat

1. **Partez d'un exemple, ou décrivez le vôtre.** La page s'ouvre sur « What would you like to build? ». Sous **Or start from an example:**, choisissez **Token**, **NFT collection**, **Locked vault** ou **2-of-3 multisig** — chacun remplit une description complète et sélectionne une blockchain et un modèle correspondants — ou rédigez la vôtre dans **Contract Description**. Plus vous êtes précis, meilleur sera le résultat.
2. **Choisissez la blockchain.** Utilisez **Target Blockchain**. Le langage de contrat et la catégorie correspondant à votre choix sont affichés à côté du sélecteur.
3. **Choisissez un type de contrat** (facultatif). **Contract Type** propose un modèle de départ tel qu'un contrat de jeton, de NFT ou de gouvernance ; laissez **Custom (describe in prompt)** pour vous appuyer uniquement sur votre description.
4. **Générez.** Sélectionnez **Generate Smart Contract**. Un indicateur de progression affiche l'état pendant que QCAI produit le contrat.

## Examiner le résultat

Une fois la génération terminée, le Dashboard affiche le contrat dans une vue avec coloration syntaxique, accompagné de détails tels que le nom du contrat, la blockchain, le langage, la taille du fichier et l'heure de génération. Le prompt que vous avez utilisé est affiché avec le résultat à titre de référence.

À partir de là, vous pouvez :

- **Copier** le code du contrat dans votre presse-papiers (**Copy Code**).
- **Export PDF** du contrat.
- **Télécharger** le contrat sous forme de fichier (**Download File**) au bon format pour la blockchain que vous avez choisie.
- **Modifier** le contrat (**Edit Contract**) pour l'affiner davantage.

## Déployer votre contrat {#deploy}

### Sur le mainnet (EVM) — déploiement non custodial {#deploy-mainnet}

Le déploiement sur le mainnet est non custodial : le Dashboard compile votre contrat et renvoie des données de déploiement **non signées** — il ne détient jamais vos clés et ne signe jamais en votre nom. Vous signez et diffusez le déploiement dans votre propre portefeuille, puis le Dashboard enregistre le contrat qui en résulte.

1. Ouvrez le contrat que vous souhaitez déployer (un contrat ciblant l'EVM) et sélectionnez **Deploy** sur **Mainnet**. S'il s'agit de votre première action sur le mainnet, acceptez la [reconnaissance unique des risques](/dashboard/overview#risk-acknowledgement).
2. Connectez **MetaMask** s'il n'est pas déjà connecté — voir [Présentation et premiers pas](/dashboard/overview#connect-your-wallet). Depuis la version de chaîne v3.2.0, le lane EVM exige aussi que le compte détienne une clé post-quantique enregistrée et une **fenêtre d'autorisation EVM ouverte**, qui s'ouvre depuis QoreX (voir [Envoyer avec MetaMask](/dashboard/wallet#send-metamask)) ; sans elle, la chaîne refuse le déploiement.
3. Le Dashboard compile le contrat et transmet la transaction de déploiement non signée à votre portefeuille.
4. Vérifiez la transaction dans MetaMask — réseau, gas et données — puis confirmez pour la signer et la diffuser vous-même.
5. Une fois le déploiement confirmé on-chain, le Dashboard enregistre l'adresse du contrat résultant parmi vos contrats sauvegardés.

Seuls les contrats **EVM** (Solidity) peuvent être déployés depuis le Dashboard. Les déploiements QoreChain Native et de programmes Solana ne sont pas disponibles pour le moment sur l'un ou l'autre réseau.

### Sur le testnet — en un clic {#deploy-testnet}

Sur le testnet, le portefeuille de test géré par le Dashboard signe et soumet un déploiement EVM pour vous en un seul clic, ce qui vous permet d'itérer rapidement avec les jetons du [Faucet](/dashboard/faucet) avant de passer au mainnet. Le testnet applique la même règle de lane EVM que le mainnet : un déploiement peut donc quand même être refusé si le compte n'a pas de clé post-quantique ou pas de fenêtre EVM ouverte.

## Partager et réutiliser

Chaque contrat généré possède sa propre page. Les contrats sont **privés par défaut** : vous seul pouvez ouvrir les vôtres. En tant que propriétaire, vous verrez un bouton **Public** / **Private** sur la page du contrat ; réglez-le sur **Public** pour que toute personne disposant du lien puisse ouvrir (et forker) le contrat, et de nouveau sur **Private** pour le retirer. Si vous ouvrez un contrat public qui ne vous appartient pas, vous pouvez le **forker** (fork) pour en démarrer votre propre copie et continuer à partir de là.

:::tip Toujours examiner et tester
Le code généré par QCAI est un excellent point de départ, pas un substitut à un examen. Lisez le contrat, testez-le sur le [testnet](/getting-started/connecting-to-testnet) et soumettez-le à l'[Auditeur de contrats](/dashboard/contract-auditor) avant de déployer quoi que ce soit ayant de la valeur.
:::

## Liens connexes

- [Auditeur de contrats](/dashboard/contract-auditor) — exécutez une analyse de sécurité QCAI sur un contrat.
- [Guide du développeur](/developer-guide/evm-development) — déployer des contrats sur les runtimes de QoreChain.
