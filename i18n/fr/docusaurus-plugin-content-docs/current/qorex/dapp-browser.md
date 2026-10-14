---
slug: /qorex/dapp-browser
title: Navigateur de dApps
sidebar_label: Navigateur de dApps
sidebar_position: 7
---

# Navigateur de dApps (mobile)

QoreX intègre un **navigateur de dApps** dans l'application, ce qui vous permet d'utiliser les applications QoreChain sans quitter le portefeuille, chaque signature étant approuvée de manière explicite.

## Se connecter à une dApp

Ouvrez le **navigateur de dApps** depuis l'onglet Accueil et accédez à une application. Saisissez ou collez l'adresse de la dApp dans la zone **Enter a dApp URL** (seules les adresses `https://` se connectent). QoreX injecte ses fournisseurs dans la page sous `window.qorex` — un fournisseur QoreChain Native (y compris `signAndBroadcast`), un fournisseur EVM en lecture seule (requêtes de compte et de chaîne uniquement) et un fournisseur Solana — et s'annonce aussi via EIP-6963. Il ne définit `window.ethereum` que si aucun autre portefeuille ne l'a fait, et n'écrase jamais un autre portefeuille. Il n'existe pas d'alias `window.keplr`.

- **Se connecter** ne nécessite **qu'une seule approbation par origine**. L'approbation ne révèle que votre adresse publique à ce site.
- **Chaque signature** fait l'objet de sa propre approbation protégée par biométrie, avec la charge utile **décodée** afin que vous puissiez voir exactement ce que vous signez — il n'y a **aucune signature à l'aveugle**.
- **Toutes les autorisations expirent à la fermeture du navigateur** — les connexions sont limitées à la session.
- **Les transactions natives passent par `signAndBroadcast` :** QoreX affiche chaque message, les frais et le compte signataire, ajoute la couche résistante aux ordinateurs quantiques et diffuse. Le fournisseur EVM ne répond ici qu'aux requêtes de compte et de chaîne ; il ne signe ni n'envoie de transactions EVM. Voir [Ce que montre la fenêtre d'approbation](/qorex/security-and-recovery#approvals).

## Q-Day Scanner

Depuis les boutons d'accès rapide de l'onglet Accueil, vous pouvez également ouvrir le **Q-Day Scanner** : saisissez n'importe quelle adresse pour obtenir son rapport d'exposition quantique — quels fonds reposent sur des clés uniquement classiques et lesquels sont déjà protégés post-quantique. Voir [Sécurité et récupération](/qorex/security-and-recovery#q-day-scanner).

## Aide-mémoire des paramètres

Autres commandes utiles dans **Paramètres** :

- **Sécurité** → [Sécurité et récupération](/qorex/security-and-recovery)
- **Langue** — suit celle du téléphone par défaut ; 10 langues
- **Refaire la visite guidée** — cinq courtes cartes sur ce que fait QoreX et où se trouvent les choses
- **Coins et réseaux** — tout ce que le portefeuille peut détenir et envoyer aujourd'hui
- **Portefeuilles** — plusieurs phrases de récupération sur ce téléphone — voir [Plusieurs portefeuilles](/qorex/getting-started#several-wallets)
- **Vos comptes** et **Vos adresses** → [Compte et Dashboard](/qorex/account-and-dashboard)
- **Réservez votre @handle** et **Compte lié** → [Compte et Dashboard](/qorex/account-and-dashboard)
- **Utiliser le testnet (développeurs)** — bascule vers le testnet `qorechain-diana` (EVM chain ID 9800) ; l'application se relie en direct, sans redémarrage. La valeur par défaut est toujours le mainnet. Les soldes du testnet n'affichent aucune valeur en USD.
- **Animation du portefeuille** — active ou désactive l'arrière-plan Aurora.
- **Supprimer le compte** → [Supprimer votre compte](/qorex/account-and-dashboard#delete-account)
- **Connecté à** — affiche le réseau actif et son chain ID.

## Notes par plateforme

- **iOS** (iOS 15.1 ou ultérieur) — Face ID (une invite d'utilisation apparaît lors de la première utilisation), un coffre-fort Secure Enclave, la connexion via la feuille d'authentification du système, et une autorisation d'accès à la caméra pour la liaison d'appareils et la lecture de QR codes.
- **Android** (Android 7.0 ou ultérieur) — BiometricPrompt avec un Keystore StrongBox, des liens profonds enregistrés pour les flux `qorex://` (rappel d'authentification, connexion, tx, liaison), et une autorisation d'accès à la caméra pour la liaison d'appareils.

Pour les dApps de bureau, utilisez plutôt l'[Extension de navigateur](/qorex/browser-extension).
