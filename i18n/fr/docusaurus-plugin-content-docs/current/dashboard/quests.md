---
slug: /dashboard/quests
title: Quêtes
sidebar_label: Quêtes
sidebar_position: 10
---

# Quêtes

Les **quêtes** sont des tâches guidées qui vous accompagnent dans l'utilisation de QoreChain à mesure que vous les réalisez. Une quête regroupe une ou plusieurs étapes, comme approvisionner un portefeuille, effectuer un transfert ou lier un compte, et vous récompense lorsque vous la terminez. Cette page couvre aussi les autres pages du groupe **Earn** de la barre latérale ainsi que l'arcade : **Leaderboard**, **Badges** et **Games**. Toutes s'adressent aux membres de la communauté qui veulent un moyen pratique d'apprendre le réseau et de collecter une progression.

## Innovations {#innovations}

- **Une complétion vérifiée, pas déclarée.** Une quête compte lorsque sa vérification réussit. Eigenstate 2 indique le type de vérification sur chaque quête : **compte lié**, **portefeuille connecté**, **lien de preuve**, **revue par l'équipe** ou **quiz**.
- **Les quêtes sociales ne comptent que pour les comptes vérifiés.** Une quête qui implique X, Telegram ou Discord (et, pour les vérifications de compte lié d'Eigenstate 2, aussi YouTube et GitHub) ne compte qu'une fois que vous avez connecté le compte dans votre **Profile** et que la connexion est vérifiée. D'ici là, la page affiche *Connect Social Accounts* avec un lien **Go to Profile**.
- **Les prérequis sont appliqués.** Une quête verrouillée indique ce qu'il faut terminer d'abord ("Complete "..." first").
- **Des statuts clairs.** Started, Pending Verification, Pending Review, Failed et Completed : une quête qui attend une revue humaine n'est donc pas présentée comme échouée.
- **Deux saisons sur une seule page.** Les onglets **Eigenstate 1** et **Eigenstate 2** ont chacun leurs propres ensembles de quêtes et catégories.

## Comment l'utiliser {#how-to-use}

### Parcourir les quêtes

Ouvrez **Quests** (**Earn** dans la barre latérale). Un récapitulatif indique combien de quêtes sont disponibles, en cours et terminées. Des **onglets de catégorie** filtrent la liste :

- Eigenstate 1 : Onboarding, Trading, Social, Community, Learning, Daily et Weekly.
- Eigenstate 2 : Social, Exchanges, Developer, Educational, Korea/Asia, On-Chain et Other.

Une catégorie vide affiche "No quests in this category yet." Chaque carte de quête présente une icône, un titre et une courte description, un badge de **difficulté**, une durée estimée, la **récompense** (en QOR ou en points d'eigenvalue, λ) et un statut (terminée, en cours, démarrée ou verrouillée).

### Terminer une quête Eigenstate 1

1. Ouvrez une quête et sélectionnez **Start Quest** (puis **Continue Quest**).
2. Réalisez les tâches. Une tâche propose **Go to Action** (vers la page du Dashboard concernée) et **Complete** (pour confirmer une étape afin qu'elle puisse être vérifiée).
3. Une barre de progression suit les tâches terminées.
4. Une fois toutes les tâches accomplies, sélectionnez **Check Completion** pour vérifier la quête et recevoir sa récompense.

Les quêtes quotidiennes et hebdomadaires se réinitialisent selon un calendrier ; la page de détail affiche la cadence de réinitialisation et votre série. Une demande au [Faucet](/dashboard/faucet) compte pour les quêtes du faucet.

### Terminer une quête Eigenstate 2

1. Ouvrez la quête et lisez son type de vérification.
2. Utilisez le bouton que propose la quête. Celui qui apparaît dépend du type de vérification et du statut actuel : **Verify**, **Submit**, **Resubmit**, **Retry verification** ou **Re-check status**.
3. Observez le statut passer par Started, Pending Verification ou Pending Review, puis Completed (ou Failed).

### Leaderboard {#leaderboard}

`/leaderboard` classe les personnes par points d'eigenvalue (λ), avec un top trois, des statistiques de la communauté et une zone de recherche. C'est un classement hors chaîne.

### Badges {#badges}

`/badges` est un catalogue de 12 séries de badges. **Check Badges** réévalue votre progression. Un **Badge Widget** vous donne un extrait iframe, BBCode ou Markdown avec **Copy Code** pour afficher un badge ailleurs. Une série Bridge apparaît dans la liste bien que le bridge ne soit pas en service.

### Games {#games}

`/games` est l'arcade **QoreChain Arcade** avec 12 jeux : Quantum Space Miner, Quantum Runner, Chain Breaker, Token Rush, Block Defense, Node Puzzle, Quantum Stack, Hash Breaker, Qubit Bounce, Consensus Race, Quantum Maze et Wave Coder. Sélectionnez **Play Now** sur une carte ; votre score (Photons, γ) est soumis à la fin de la partie. Les scores sont conservés hors chaîne.

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests), `/leaderboard`, `/badges`, `/games`.
- **Connexion :** requise pour toutes ces pages. `/quests` redirige vers la connexion lorsque vous êtes déconnecté ; Leaderboard, Badges et Games affichent un écran "Authentication Required".
- **Réseau :** aucune de ces pages ne suit le sélecteur de réseau.
- **Portefeuille :** aucun n'est requis, mais les quêtes qui impliquent des transactions nécessitent un portefeuille de testnet approvisionné (voir [Wallet](/dashboard/wallet#testnet) et [Faucet](/dashboard/faucet)) ; les quêtes sociales nécessitent des comptes liés.
- **Coût :** gratuit.

## Où elles sont publiées {#where-published}

| Page | Adresse | Compte |
| --- | --- | --- |
| Quests (Eigenstate 1 et 2) | `dashboard.qorechain.io/quests` | Connexion |
| Leaderboard | `dashboard.qorechain.io/leaderboard` | Connexion |
| Badges | `dashboard.qorechain.io/badges` | Connexion |
| Games | `dashboard.qorechain.io/games` | Connexion |

## Limites et problèmes connus {#limits}

- **Les ensembles de quêtes changent.** L'onglet d'une saison peut être vide ou afficher moins de quêtes lorsque ses quêtes ne sont pas actives ; consultez l'onglet plutôt que de vous fier à cette page pour la liste actuelle.
- **Tout ce qui figure ici est hors chaîne :** les points, les classements, les badges et les scores de jeu sont enregistrés par le Dashboard, pas sur QoreChain. Le mot "on-chain" dans le sous-titre de l'Arcade ne décrit pas les scores.
- **Les montants de récompense** sont affichés sur chaque quête et peuvent changer.
- **La connexion** et, pour les quêtes sociales, des comptes liés vérifiés sont requis.
- **Public Sale** (`/public-sale`) est une page distincte pour les participants existants (allocation, calendrier de vesting, claim) ; toutes les rondes précédentes sont closes, et elle n'est pas décrite plus avant ici.
- **FAQ** (`/faq`) est une page d'aide intégrée à l'application dont le contenu est en retard sur ce manuel.

## Liens connexes

- [Présentation et premiers pas](/dashboard/overview) - connectez-vous et connectez votre portefeuille avant de commencer les quêtes.
- [Faucet](/dashboard/faucet) - approvisionnez un portefeuille de testnet pour les quêtes impliquant des transactions.
