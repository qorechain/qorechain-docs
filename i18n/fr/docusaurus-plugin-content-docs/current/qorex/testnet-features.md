---
slug: /qorex/testnet-features
title: Fonctionnalités du testnet
sidebar_label: Fonctionnalités du testnet
sidebar_position: 10
---

# Fonctionnalités du testnet

:::caution TESTNET UNIQUEMENT
Tout ce qui figure sur cette page fonctionne **uniquement sur le testnet de QoreChain** (`qorechain-diana`). **Rien de tout cela n'est sur le mainnet.** Les jetons du testnet n'ont aucune valeur. Les écrans ci-dessous n'apparaissent pas dans QoreX tant que vous êtes sur le mainnet.
:::

QoreX a quelques fonctionnalités qui sont d'abord mises à l'épreuve sur le testnet. Elles ne s'affichent que lorsque le testnet est actif, et chaque écran le signale avec une bannière **TESTNET : jetons de test uniquement, pas de vrais QOR**.

## Innovations {#innovations}

- **Le réseau confirme avant que vous ne signiez (testnet uniquement).** Pour un transfert vers une autre chaîne, QoreX demande d'abord au réseau de confirmer le canal et sa contrepartie. S'il ne le peut pas, rien n'est envoyé.
- **L'état réel des routes (testnet uniquement).** L'écran du bridge montre ce que le réseau lui-même dit de chaque route et ne propose rien qu'il ne propose pas.
- **Transactions au format Solana sur QoreChain (testnet uniquement).** Une fenêtre SVM que vous ouvrez avec votre signature ML-DSA-87 permet à votre propre clé Solana d'agir dans des limites strictes.

## Comment accéder au testnet dans QoreX {#reach-testnet}

- **Application mobile :** ouvrez les **Réglages** et activez **Utiliser le testnet (développeurs)**. L'application bascule immédiatement vers `qorechain-diana`, sans redémarrage. La valeur par défaut est toujours le mainnet. Désactivez l'option pour y revenir.
- **Extension de navigateur :** touchez sept fois le numéro de version en bas de la fenêtre pour révéler la section **Mode développeur**, puis touchez **Passer au testnet (diana)**. Dans la même section, **Revenir au mainnet** vous y ramène.

Tant que le testnet est actif, les écrans réservés au testnet ci-dessous apparaissent dans les **Réglages** de l'application et dans la fenêtre de l'extension (**Envoyer vers une autre chaîne** et **Bridge**), et l'outil **Solana sur QoreChain** apparaît sous l'onglet Développeur ou sur la page Outils développeur. Les soldes du testnet n'affichent aucune valeur en dollars. Les dApps ne peuvent pas changer de réseau ; vous seul le pouvez.

## Obtenir des QOR de test {#get-test-qor}

Les QOR du testnet sont gratuits et n'ont aucune valeur. Obtenez-les sur le [faucet du Dashboard](/dashboard/faucet) : connectez-vous-y, copiez votre adresse testnet depuis QoreX (l'outil développeur **Espace de travail testnet** a un bouton **Copier l'adresse** et un bouton **Ouvrir le faucet du testnet**) et demandez des jetons. Voir aussi [Connexion au testnet](/getting-started/connecting-to-testnet) pour les points de terminaison publics du testnet.

## Envoyer vers une autre chaîne (IBC) {#ibc}

**TESTNET UNIQUEMENT.** Envoyez des QOR du testnet QoreChain vers les testnets de **Cosmos Hub**, **Osmosis**, **Injective**, **Akash** et **Celestia**, et rapatriez-les.

Ce que QoreX fait pour vous :

- **Il vérifie d'abord la route.** Avant que vous puissiez signer, QoreX demande au réseau de confirmer que le canal est ouvert et qu'il mène toujours à la chaîne que vous avez choisie. Si le canal est fermé, modifié ou ne peut pas être confirmé, QoreX le dit et n'envoie rien.
- **Il affiche la vérification complète.** Vous voyez l'expéditeur, le destinataire sur l'autre chaîne, les frais de réseau et les délais avant de signer.
- **Les délais.** Un transfert de test vers le testnet Cosmos Hub est arrivé en une vingtaine de secondes. QoreX vous dit de compter environ une minute. S'il n'est pas livré dans les 10 minutes, il vous revient.
- **Quelle signature.** Un transfert depuis QoreChain est signé avec votre clé hybride (ML-DSA-87 et secp256k1). Le retour est signé sur l'autre chaîne avec une clé classique, comme l'exige cette chaîne, et la vérification le précise : sur cette chaîne, ces fonds sont protégés par une clé classique uniquement.

### Envoyer depuis QoreChain {#ibc-send}

1. Activez le testnet (voir [ci-dessus](#reach-testnet)), ouvrez les **Réglages** (extension : la fenêtre) et touchez **Envoyer vers une autre chaîne**.
2. Choisissez la **Chaîne de destination** et l'**Actif** (QOR, ou des jetons arrivés via IBC).
3. Saisissez le **Montant**. Le champ du destinataire (**Receiver**) est prérempli avec votre propre adresse sur cette chaîne ; vous pouvez la modifier. QoreX vérifie qu'il s'agit d'une adresse valide pour cette chaîne.
4. Touchez **Vérifier**, contrôlez les détails sous **Vérifiez avant de signer**, puis **Signer et envoyer**.

### Rapatrier des jetons {#ibc-back}

1. Dans **Envoyer vers une autre chaîne**, ouvrez **Ramener sur QoreChain** et touchez **Show my balances** (afficher mes soldes) sur la chaîne que vous avez utilisée.
2. Choisissez **Ce qu'il faut ramener**. Le compte sur cette chaîne a besoin d'un peu de la cryptomonnaie propre à cette chaîne pour payer les frais ; QoreX vous dit s'il en manque.
3. Vérifiez, puis **Signer et ramener**. Les fonds sont livrés à votre propre adresse QoreChain.

### Suivre un transfert {#ibc-track}

**Vos transferts** liste chaque transfert et le suit : en attente du réseau, en cours d'acheminement, livré ou revenu vers vous (avec le motif, ou parce que le délai a expiré). Touchez **Actualiser** pour relire. Si l'état n'est pas encore connu, QoreX indique que la livraison n'est pas confirmée au lieu de deviner.

## Écran Bridge {#bridge}

**TESTNET UNIQUEMENT.** L'écran **Bridge** lit sur le réseau les routes de QoreChain Bridge et montre l'état réel de chacune : pas encore ouverte, en pause, fermée pour l'instant, ouverte, ouverte aux retraits ou ouverte aux dépôts. Une route n'est proposée que lorsque le réseau lui-même indique qu'elle est ouverte.

**Toutes les routes sont fermées sur le testnet aujourd'hui, donc rien n'est proposé.** L'écran est prêt pour l'ouverture des routes. Rien ici n'est une route, un actif ou un montant que vous pouvez utiliser maintenant, et rien n'est sur le mainnet.

## Solana sur QoreChain {#solana-on-qorechain}

**TESTNET UNIQUEMENT.** La voie SVM exécute des transactions au format Solana sur QoreChain. C'est un outil du Mode développeur, affiché uniquement quand le testnet est actif. Sur le mainnet, la voie SVM n'est pas ouverte et rien ici ne peut être utilisé.

Ce que fait l'outil :

- **Il montre la voie.** Si la voie SVM fonctionne sur le réseau, et son cluster.
- **Il montre votre fenêtre SVM.** Une fenêtre permet à des transactions signées par votre clé Solana de dépenser depuis votre compte sans signature ML-DSA-87, dans certaines limites. QoreX montre si une fenêtre est ouverte, combien de blocs, de transactions et de QOR il reste, quelle clé Solana est liée et quels programmes elle admet.
- **Il ouvre et ferme une fenêtre.** Ouvrez une fenêtre en choisissant les programmes qu'elle admet (il est recommandé de les lister ; **N'importe quel programme** comporte un avertissement), le nombre de blocs pendant lesquels elle reste ouverte (au plus 17,280), le nombre de transactions (au plus 1,000) et le maximum de QOR qu'elle peut dépenser. La clé Solana à l'index 0 de votre phrase de récupération est celle qui est liée. Ouvrir une fenêtre remplace celle que vous avez. L'avertissement à l'écran s'applique : gardez-la petite et courte, et fermez-la quand vous avez fini avec **Fermer la fenêtre**.
- **Il relaie une transaction Solana signée.** Collez les octets bruts (base64 ou base58) issus d'un outil développeur et touchez **La lire**. QoreX montre les programmes et les signataires qui ont signé, et ne relaie que les transactions entièrement signées. Votre compte QoreChain signe l'enveloppe avec ML-DSA-87 et paie ses frais ; il n'acquiert aucun pouvoir sur la transaction Solana.

Utilisation : activez le testnet et le Mode développeur, ouvrez **Solana sur QoreChain** depuis l'onglet Développeur (ou la page Outils développeur de l'extension), puis utilisez les sections ci-dessus. Les appels de contrat vers des programmes SVM depuis le [Mode développeur](/qorex/developer-mode#contracts) fonctionnent aussi uniquement sur le testnet.

Pour le côté chaîne de la voie SVM, voir [SVM sur le testnet](/developer-guide/svm-testnet-v329) et [la voie SVM](/developer-guide/svm-lane-v328).

## Ce qui n'est pas sur le mainnet {#not-on-mainnet}

- L'envoi vers d'autres chaînes via IBC depuis QoreX.
- L'écran QoreChain Bridge et ses routes.
- Solana sur QoreChain, y compris les fenêtres SVM et le relais.

QoreX n'affiche ces écrans que sur le testnet et l'indique sur chacun d'eux.
