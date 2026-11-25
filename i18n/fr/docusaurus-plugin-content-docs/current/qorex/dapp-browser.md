---
slug: /qorex/dapp-browser
title: Navigateur de dApps
sidebar_label: Navigateur de dApps
sidebar_position: 7
---

# Navigateur de dApps (mobile)

QoreX intègre un **navigateur de dApps** dans l'application, ce qui vous permet d'utiliser les applications QoreChain sans quitter le portefeuille, chaque signature étant approuvée de manière explicite. Il s'adresse aux utilisateurs mobiles qui veulent utiliser une application web sans rien installer d'autre, et aux développeurs qui testent leur application dans le portefeuille mobile.

## Innovations {#innovations}

- **Une approbation par site, toujours révocable.** Chaque origine est approuvée séparément ; les sites connectés sont enregistrés sur cet appareil, par portefeuille, et vous pouvez en révoquer n'importe lequel dans [La protection de mon argent](/qorex/security-and-recovery#protection).
- **Signatures décodées et protégées par biométrie.** Chaque signature fait l'objet de sa propre approbation, avec la charge utile décodée ; ce que QoreX ne peut pas décoder, il le refuse.
- **`signAndBroadcast`.** Une page envoie les messages ; QoreX les affiche, ajoute la couche ML-DSA-87 que seul le portefeuille peut produire, et diffuse.
- **Signature EVM et de messages dans le navigateur.** Les dApps EVM peuvent signer des messages, des données typées et des transactions sur QoreChain, l'effet de chacun étant d'abord décodé et simulé, et toute page peut demander une signature de message qui porte aussi une moitié ML-DSA-87.
- **Ouvrir une page depuis un lien.** Un lien `browse` ouvre votre page directement dans le navigateur dApp, et la page d'accueil conserve sur l'appareil vos sites favoris et récents.
- **Découverte sans prise de contrôle.** QoreX s'annonce via EIP-6963 et n'écrase jamais le `window.ethereum` ni le `window.keplr` d'un autre portefeuille.

## Comment y accéder {#how-to-access}

Le navigateur de dApps fait partie de l'application mobile : installez-la depuis l'App Store (iOS 15.1 ou ultérieur) ou Google Play (Android 7.0 ou ultérieur) ; les liens se trouvent dans la [vue d'ensemble](/qorex/overview#how-to-access). Aucun compte n'est nécessaire. Pour les dApps de bureau, utilisez l'[Extension de navigateur](/qorex/browser-extension).

## Se connecter à une dApp {#how-to-use}

Ouvrez le **navigateur dApp** depuis l'onglet Accueil et rendez-vous sur une application. Saisissez ou collez l'adresse de la dApp dans la zone **Saisis l'URL d'une dApp** (seules les adresses `https://` se connectent). QoreX injecte ses fournisseurs dans la page sous la forme `window.qorex` - un fournisseur natif QoreChain (avec `signAndBroadcast`, `signDirect` et la signature de message), un fournisseur EVM et un objet fournisseur Solana - et s'annonce aussi via EIP-6963. Il ne définit `window.ethereum` que si aucun autre portefeuille ne l'a fait, et n'écrase jamais un autre portefeuille. Il n'y a pas d'alias `window.keplr`. Développeurs : voir [Intégrer une dApp à QoreX](/qorex/dapp-integration).

### Sites favoris et récents {#favourites}

La page d'accueil du navigateur liste vos **Favoris** et vos sites **Récents** (les 8 derniers). Touchez l'étoile dans la barre d'adresse pour garder la page ouverte comme favori (touchez-la à nouveau pour la retirer), et utilisez le bouton d'accueil pour revenir à la liste. **Effacer** vide la liste des récents. Une page que vous avez ouverte depuis un [lien browse](#browse-links) compte comme une visite. Les deux listes restent sur ce téléphone, enregistrées sans la requête ni le fragment de la page.

### Ouvrir une page depuis un lien {#browse-links}

Un lien sur le web peut ouvrir une page dans le navigateur dApp : `https://link.qore.network/browse?url=<encoded https address>` ou `qorex://browse?url=<encoded https address>`. QoreX affiche d'abord la demande biométrique qui ouvre le navigateur dApp. Il refuse une adresse qui n'est pas en `https://` sur un nom de domaine, ou qui comporte un port, un nom d'utilisateur, une adresse IP ou `localhost`. Le lien ne donne rien à la page : elle doit toujours demander à se connecter, et chaque signature passe toujours par la feuille d'approbation. Sans portefeuille sur le téléphone, l'application reste sur l'écran de bienvenue. Voir [Liens qu'un service peut générer](/qorex/dapp-integration#links).

- **Se connecter** ne nécessite **qu'une seule approbation par origine**. L'approbation ne révèle que votre adresse publique à ce site.
- **Chaque signature** fait l'objet de sa propre approbation protégée par biométrie, avec la charge utile **décodée** afin que vous puissiez voir exactement ce que vous signez - il n'y a **aucune signature à l'aveugle**.
- **Les connexions durent jusqu'à ce que vous les révoquiez.** À partir de la 1.2.5, l'adresse du site est enregistrée sur cet appareil, par portefeuille. Consultez et révoquez les sites connectés dans [La protection de mon argent](/qorex/security-and-recovery#protection). Une connexion ne signe jamais rien par elle-même : chaque signature nécessite toujours sa propre approbation.
- **Les transactions natives passent par `signAndBroadcast` :** QoreX affiche chaque message, les frais et le compte signataire, ajoute la couche ML-DSA-87 et diffuse. Voir [Ce que montre la fenêtre d'approbation](/qorex/security-and-recovery#approvals).
- **Les dApps EVM** peuvent demander `personal_sign`, des données typées et des transactions sur QoreChain. L'approbation les décode et montre l'effet de la transaction sur votre solde là où le réseau le permet. Sur la voie EVM de QoreChain, l'approbation ouvre aussi la courte fenêtre d'autorisation dont la transaction a besoin et nomme chaque contrat qu'elle admet ; voir [Fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window). Seuls les comptes importés de MetaMask peuvent envoyer sur cette voie.
- **Signature de message :** une page peut vous demander de signer un message ; vous le voyez d'abord en entier.
- **Réseau :** une page ne peut pas changer de réseau. Changez-le dans QoreX même (voir les réglages ci-dessous) ; la page doit être sur le même réseau que le portefeuille.

## Q-Day Scanner

Depuis les boutons d'accès rapide de l'onglet Accueil, vous pouvez également ouvrir le **Q-Day Scanner** : saisissez n'importe quelle adresse Bitcoin ou Ethereum pour obtenir un rapport d'exposition. Voir [Sécurité et récupération](/qorex/security-and-recovery#q-day-scanner).

## Aide-mémoire des paramètres

Autres commandes utiles dans **Réglages** :

- **Sécurité** → [Sécurité et récupération](/qorex/security-and-recovery)
- **Langue** - suit celle du téléphone par défaut ; 10 langues
- **Refaire la visite guidée** - cinq courtes cartes sur ce que fait QoreX et où se trouvent les choses
- **Coins et réseaux** - tout ce que le portefeuille peut détenir et envoyer aujourd'hui
- **Portefeuilles** - plusieurs phrases de récupération sur ce téléphone - voir [Plusieurs portefeuilles](/qorex/getting-started#several-wallets)
- **Tes comptes** et **Vos adresses** → [Compte et Dashboard](/qorex/account-and-dashboard)
- **Réservez votre @handle** et **Compte lié** → [Compte et Dashboard](/qorex/account-and-dashboard)
- **Utiliser le testnet (développeurs)** - bascule vers le testnet `qorechain-diana` (EVM chain ID 9800) ; l'application se relie en direct, sans redémarrage. La valeur par défaut est toujours le mainnet. Les soldes du testnet n'affichent aucune valeur en USD.
- **Mode développeur** - désactivé par défaut ; ajoute un onglet Développeur avec des outils pour ceux qui développent sur QoreChain. Voir [Mode développeur](/qorex/developer-mode).
- **Animation du portefeuille** - active ou désactive l'arrière-plan Aurora.
- **Supprimer le compte** → [Supprimer votre compte](/qorex/account-and-dashboard#delete-account)
- **Connecté à** - affiche le réseau actif et son chain ID.

## Notes par plateforme

- **iOS** (iOS 15.1 ou ultérieur) - Face ID (une invite d'utilisation apparaît lors de la première utilisation), un coffre-fort Secure Enclave, la connexion via la feuille d'authentification du système, et une autorisation d'accès à la caméra pour la liaison d'appareils et la lecture de QR codes.
- **Android** (Android 7.0 ou ultérieur) - BiometricPrompt avec un Keystore StrongBox, des liens profonds enregistrés pour les flux `qorex://` (rappel d'authentification, connexion, tx, liaison), et une autorisation d'accès à la caméra pour la liaison d'appareils.

Pour les dApps de bureau, utilisez plutôt l'[Extension de navigateur](/qorex/browser-extension).

## Où il est publié {#where-published}

Le navigateur de dApps est livré dans l'application mobile QoreX (App Store et Google Play) ; voir [Où il est publié](/qorex/overview#where-published) pour les fiches et les versions actuelles. Ce n'est pas un téléchargement séparé.

## Limites et problèmes connus {#limits}

- Seules les adresses `https://` se connectent.
- Le navigateur intégré ne signe que sur le réseau actif de QoreChain et n'émet que l'événement EVM `connect` : il est fermé pour changer de compte ou de réseau. Il ne signe pas les transactions Solana et n'a pas de réseau Ethereum.
- `window.qorex.native` est de style Keplr, ce n'est pas un remplacement direct de Keplr, et il n'y a pas d'alias `window.keplr`. La signature Amino est refusée.
- Le Q-Day Scanner, la récupération sociale et Legacy sont dans l'application, pas dans l'extension.
