---
slug: /qorex/send-and-receive
title: Envoyer et recevoir
sidebar_label: Envoyer et recevoir
sidebar_position: 3
---

# Envoyer et recevoir

L'onglet Accueil (Portefeuille) est votre point de départ. Il affiche un **badge réseau** (MAINNET par défaut, ou TESTNET si vous avez activé le bascule développeur), votre **solde total** (appuyez pour masquer/afficher), et les actions principales : **Envoyer · Recevoir · Échanger · Staker**. Votre liste d'actifs affiche **QOR** (Native + post-quantique 🛡, un solde unifié sur les lanes Native/EVM/SVM) et **Tous les réseaux** (une vue unifiée sur ETH, BNB, POL, ARB, et les autres [réseaux externes](#external-networks-tokens) pris en charge par QoreX).

## Envoyer des QOR à sécurité quantique

1. Appuyez sur **Envoyer**.
2. Saisissez le destinataire sous forme d'adresse `qor1…` **ou** d'un **@handle**. Un handle est résolu et vérifié cryptographiquement (signature du registre + signature du propriétaire + épinglage à la première utilisation) ; si la clé d'un handle venait à changer silencieusement, QoreX affiche un avertissement explicite.
3. Saisissez le montant. L'aperçu affiche le destinataire, le montant, les frais et l'état du **Bouclier** — le niveau de protection post-quantique de la signature.
4. Confirmez avec une validation **biométrique**. QoreX signe le transfert avec la signature hybride post-quantique obligatoire (ML-DSA-87 + secp256k1) et le diffuse sur la lane Native.

Votre **premier** transfert enregistre aussi automatiquement votre clé post-quantique on-chain — vous pouvez le constater dans [Sécurité et récupération](/qorex/security-and-recovery#pqc-key). Aucune étape séparée n'est nécessaire.

### Envoyer à un @handle, étape par étape {#handle-send}

1. Ouvrez **Envoyer** et tapez `@` suivi du handle (par exemple `@liviu`) dans le champ destinataire au lieu d'une adresse.
2. QoreX recherche le handle et vous montre **l'adresse `qor1…` résolue** avant que vous confirmiez quoi que ce soit.
3. Vérifiez l'adresse résolue, saisissez le montant, et confirmez comme d'habitude.

QoreX n'accepte une résolution que si elle passe **les deux** vérifications qu'il effectue : une attestation du registre vérifiée par rapport à une clé de confiance épinglée dans l'application, et la propre signature du propriétaire du handle sur la revendication. Si l'une des deux vérifications échoue, une erreur est déclenchée plutôt qu'un repli vers une adresse non vérifiée. La première fois que vous payez un handle donné, QoreX mémorise l'adresse vers laquelle il a été résolu ; si l'adresse de ce handle venait un jour à changer, QoreX s'arrête avant de signer et vous montre l'ancienne et la nouvelle adresse côte à côte afin que vous puissiez décider de continuer ou non. L'extension de navigateur résout et paie les handles de la même façon — voir [Envoyer à un @handle](/qorex/browser-extension#handle-send).

### Envoi de QOR en vesting (verrouillés) {#vesting}

Si une partie de votre solde est encore en **vesting** — par exemple une allocation TGE non encore libérée — votre total est divisé en **disponible maintenant** et **encore verrouillé**. Vous ne pouvez envoyer que la portion disponible ; QoreX refuse lui-même toute tentative de dépense excessive plutôt que de laisser le réseau la rejeter après avoir prélevé des frais. La portion verrouillée devient dépensable progressivement à mesure que le calendrier de vesting la libère. Cette répartition est affichée partout où votre solde apparaît — Accueil, Envoyer, et Détail de l'actif.

## Recevoir des QOR

Appuyez sur **Recevoir** pour afficher votre adresse `qor1…` sous forme de code QR (avec l'icône QoreChain intégrée) et un bouton de copie. Partagez l'un ou l'autre avec l'expéditeur.

## Demander un paiement

Appuyez sur **Demander** (nécessite une [connexion](/qorex/account-and-dashboard#sign-in)) pour créer une demande de paiement — un montant plus un mémo optionnel — sous forme de code QR ou de lien. Quiconque la scanne voit le transfert pré-rempli.

## Réseaux et jetons externes {#external-networks-tokens}

Depuis **Tous les réseaux** (ou Envoyer-externe), vous pouvez envoyer nativement **ETH, BNB, POL, AVAX et SOL**, ainsi que de l'ETH sur **Arbitrum, Base et OP Mainnet**, et **ATOM, OSMO et TIA** sur Cosmos, ainsi que des jetons **ERC-20**, **SPL** et **IBC** — USDC et USDT sur les chaînes EVM et Solana, DAI sur Ethereum, et Noble USDC via IBC — tous dérivés de la même phrase de récupération (ETH utilise `m/44'/60'`, SOL utilise son chemin standard, et SPL utilise des comptes de jetons associés).

:::caution Les chaînes externes sont uniquement classiques
Les autres blockchains ne peuvent pas porter de signatures post-quantiques. Lorsque vous envoyez sur un réseau externe, QoreX l'indique explicitement (le transfert utilise une signature classique et le **Bouclier** affiche la rétrogradation). Vos **QOR** restent toujours sur la lane Native protégée. Les envois externes basés sur Cosmos prennent en charge un mémo optionnel.
:::

## Échanger

L'onglet **Échanger** est connecté à l'AMM on-chain de QoreChain mais reste désactivé — le bouton affiche **« Échanger — bientôt disponible avec la liquidité des pools »** — jusqu'à ce que la liquidité et le flag de fonctionnalité distant l'activent. Lorsque cela se produit, il s'active automatiquement ; **aucune mise à jour de l'application n'est nécessaire**.

:::note iOS
L'onglet Échanger n'apparaît pas du tout dans la version App Store — Apple considère un échange de jetons intégré à l'application comme un service réglementé. L'échange reste disponible (une fois activé) sur Android et dans l'extension de navigateur.
:::

## Étapes suivantes

- [Portefeuille et Staking](/qorex/portfolio-and-staking) — consultez votre allocation et gagnez des récompenses.
- [Sécurité et récupération](/qorex/security-and-recovery) — protégez et récupérez votre portefeuille.
