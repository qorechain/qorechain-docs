---
slug: /qorex/dapp-browser
title: Navigateur de dApps
sidebar_label: Navigateur de dApps
sidebar_position: 7
---

# Navigateur de dApps (mobile)

QoreX intègre un **navigateur de dApps** dans l'application, ce qui vous permet d'utiliser les applications QoreChain sans quitter le portefeuille, chaque signature étant approuvée de manière explicite.

## Se connecter à une dApp

Ouvrez le **navigateur de dApps** depuis l'onglet Accueil et accédez à une application. QoreX injecte ses fournisseurs dans la page — un fournisseur de connexion QoreChain, un fournisseur EVM en lecture seule, et des alias `keplr` / `ethereum` courtois qui **ne détournent jamais** les autres portefeuilles réels.

- **Se connecter** ne nécessite **qu'une seule approbation par origine**. L'approbation ne révèle que votre adresse publique à ce site.
- **Chaque signature** fait l'objet de sa propre approbation protégée par biométrie, avec la charge utile **décodée** afin que vous puissiez voir exactement ce que vous signez — il n'y a **aucune signature à l'aveugle**.
- **Toutes les autorisations expirent à la fermeture du navigateur** — les connexions sont limitées à la session.

## Q-Day Scanner

Depuis les boutons d'accès rapide de l'onglet Accueil, vous pouvez également ouvrir le **Q-Day Scanner** : saisissez n'importe quelle adresse pour obtenir son rapport d'exposition quantique — quels fonds reposent sur des clés uniquement classiques et lesquels sont déjà protégés post-quantique. Voir [Sécurité et récupération](/qorex/security-and-recovery#q-day-scanner).

## Aide-mémoire des paramètres

Autres commandes utiles dans **Paramètres** :

- **Tableau de bord de sécurité** → [Sécurité et récupération](/qorex/security-and-recovery)
- **Vos adresses** et **Compte lié** → [Compte et Dashboard](/qorex/account-and-dashboard)
- **Utiliser le testnet (développeurs)** — bascule vers le testnet `qorechain-diana` (EVM chain ID 9800) ; l'application se relie en direct, sans redémarrage. La valeur par défaut est toujours le mainnet.
- **Animation du portefeuille** — active ou désactive l'arrière-plan Aurora.
- **État du réseau** — affiche « Connecté à … » avec les points de terminaison actifs.

## Notes par plateforme

- **iOS** — Face ID (une invite d'utilisation apparaît lors de la première utilisation), un coffre-fort Secure Enclave, la connexion via la feuille d'authentification du système, et une autorisation d'accès à la caméra pour la liaison d'appareils et la lecture de QR codes.
- **Android** — BiometricPrompt avec un Keystore StrongBox, des liens profonds enregistrés pour les flux `qorex://` (rappel d'authentification, connexion, tx, liaison), et une autorisation d'accès à la caméra pour la liaison d'appareils.

Pour les dApps de bureau, utilisez plutôt l'[Extension de navigateur](/qorex/browser-extension).
