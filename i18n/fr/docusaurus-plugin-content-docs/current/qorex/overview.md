---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Aperçu
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille officiel **non-custodial** pour **QoreChain**, la blockchain de couche 1 résistante au quantique (mainnet `qorechain-vladi`). Vos clés privées sont générées et stockées **uniquement sur votre appareil** — QoreChain Association n'a jamais accès à vos fonds et les applications ne contiennent **aucune analytique, aucun rapport de plantage et aucun SDK de suivi** — les clés, la phrase de récupération, le coffre et les approbations ne quittent jamais votre appareil (voir [Ce que QoreX envoie sur le réseau](#data-and-privacy)). Chaque transfert de QOR sur le lane Natif porte une **signature post-quantique hybride** (ML-DSA-87, NIST FIPS-204, associée à secp256k1), afin de protéger vos fonds contre les attaquants classiques comme quantiques.

QoreX se compose de deux parties qui fonctionnent ensemble :

- **Extension de navigateur** — le portefeuille de bureau, **disponible et publique sur Chrome, Firefox et Safari (macOS)**. C'est un portefeuille autonome (créer/importer, détenir et envoyer des QOR) ainsi que le connecteur qui permet à tout site web de découvrir QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Application mobile** (Android et iOS) — le portefeuille complet : créer/restaurer, envoyer et recevoir des QOR résistants au quantique, réseaux externes, staking, portefeuille d'actifs, récupération, et un navigateur de dApp intégré. **Sur Google Play** pour Android, et **sur l'App Store** pour iOS (voir la disponibilité ci-dessous).

:::caution Sauvegardez votre phrase de récupération dès que vous créez un portefeuille
QoreX est non-custodial : QoreChain Association ne peut ni récupérer un portefeuille perdu, ni le réinitialiser, ni le restaurer à votre place. **Désinstaller l'application, réinitialiser le téléphone ou supprimer l'extension efface vos clés de cet appareil.** Notez votre phrase de récupération de 24 mots (l'application mobile ne l'affiche pas pendant qu'elle crée le portefeuille — révélez-la depuis **Paramètres → Sécurité → Révéler la phrase de récupération** ; l'extension l'affiche une seule fois à la création) et, si vous le pouvez, mettez en place la [récupération sociale](/qorex/security-and-recovery#social-recovery). Voir [Sauvegarder maintenant](/qorex/security-and-recovery#back-up-now).
:::

## Disponibilité par plateforme {#platform-availability}

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ (l'application n'affiche pas la phrase lorsqu'elle crée le portefeuille — révélez-la depuis Paramètres → Sécurité) | ✅ (autonome ; la phrase est affichée une seule fois à la création) |
| Plusieurs portefeuilles, chacun avec sa propre phrase de récupération | ✅ (Paramètres → Portefeuilles) | ✅ (**Portefeuilles**, un seul mot de passe pour tous) |
| Plusieurs comptes à partir d'une seule phrase de récupération | ✅ (jusqu'à 20 par portefeuille) | ✅ |
| Compte de type Ethereum (coin 60), ajouté manuellement | ✅ | ✅ |
| Envoyer et recevoir des QOR (post-quantique) | ✅ | ✅ (Envoyer ; Recevoir avec QR) |
| Recevoir sur n'importe quel réseau pris en charge | ✅ | ✅ |
| Payer un @handle | ✅ | ✅ |
| Réserver un @handle | ✅ (nécessite un compte connecté) | — (l'extension vous renvoie vers l'application) |
| Staking : déléguer, annuler la délégation, déplacer un stake, réclamer, réclamer et restaker | ✅ | ✅ |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envoi depuis le popup) |
| Ajouter un token par contrat (réseaux EVM) | ✅ | ✅ |
| Fenêtre d'accès EVM | ✅ | ✅ |
| Langue de l'interface (10 langues) | ✅ (suit le téléphone) | ✅ (suit le navigateur) |
| Portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy | ✅ | — |
| Recherche, visite de première utilisation, widget d'écran d'accueil, notifications push | ✅ | — |
| Connexions dApp | ✅ (navigateur intégré, limité à la session) | ✅ (tout site web ; **Sites connectés** avec Révoquer) |
| Swap | Android uniquement, désactivé jusqu'à la liquidité des pools (non affiché sur iOS) | — |
| Connexion de compte et demandes de paiement | ✅ | — |
| Liaison multi-appareils | ✅ | — |
| Appairage avec le Dashboard | ✅ | ✅ (connexion + transferts proposés, y compris le staking) |

## Pourquoi QoreX est différent

- **Résistant au quantique par défaut** — les transferts de QOR sur le lane Natif portent toujours une signature hybride ML-DSA-87 + secp256k1. Tout ce qui est classique (chaînes externes) est clairement identifié, jamais silencieux.
- **Véritablement non-custodial** — les clés sont générées sur l'appareil et vivent dans un coffre matériel (Secure Enclave sur iOS, StrongBox sur Android) ou un coffre chiffré (extension). Elles ne quittent jamais votre appareil.
- **Aucune analytique, aucun rapport de plantage, aucun SDK de suivi** dans aucune application QoreX. Quelques extras optionnels ne contactent un serveur que lorsque vous les activez : la connexion de compte (voir [Compte et Dashboard](/qorex/account-and-dashboard)) et les notifications push, qui enregistrent votre appareil et vos adresses *publiques* afin que QoreX puisse vous prévenir lorsque des QOR arrivent. Le portefeuille ne dépend jamais ni de l'un ni de l'autre. La liste complète figure dans [Ce que QoreX envoie sur le réseau](#data-and-privacy).
- **Un solde unifié** — vos QOR représentent un solde unique réparti sur les lanes Natif, EVM et SVM ; QoreX l'affiche comme un seul chiffre.
- **Plusieurs chemins de récupération** — une phrase de récupération de 24 mots (toujours ; sur mobile, révélez-la depuis Paramètres → Sécurité), une récupération sociale optionnelle avec des gardiens et un délai de sécurité de 48 heures, un héritage Legacy optionnel, et une liaison multi-appareils pratique.

## Pour commencer

- Nouveau sur QoreX ? Commencez par [Démarrer](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR résistants au quantique.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[Extension de navigateur](/qorex/browser-extension).

## Téléchargement et disponibilité {#availability}

- **Extension de navigateur** — disponible et publique : installez-la depuis le [Chrome Web Store, Firefox Add-ons, ou le Mac App Store (Safari)](/qorex/browser-extension#install). Installez toujours depuis une fiche de store officielle.
- **Application Android** — disponible en production sur Google Play : https://play.google.com/store/apps/details?id=network.qore.qorex (Android 7.0 ou ultérieur).
- **Application iOS** — disponible sur l'**App Store** : https://apps.apple.com/us/app/qorex-wallet/id6791256626 (iOS 15.1 ou ultérieur).

## Quelle version est disponible où {#versions}

L'examen par les stores suit son propre calendrier ; chaque store sert donc sa propre version, et Google Play et le Chrome Web Store ont actuellement du retard sur les autres. Voici la version actuelle **sur chaque store** au **20 octobre 2026** :

| Store | Version actuelle | Remarque |
|---|---|---|
| Apple App Store (iOS) | 1.1.7 | publiée le 15 octobre |
| Google Play (Android) | 1.1.6 | la 1.1.7 est téléversée mais pas encore publique — la fiche publique affiche toujours la 1.1.6 |
| Chrome Web Store | 0.3.6 | sert toujours la 0.3.6 |
| Firefox Add-ons | 0.3.7 | |
| Safari (Mac App Store) | 1.7.7, intégrant l'extension 0.3.7 | le Mac App Store utilise sa propre numérotation `1.x` |

Les stores affichent toujours leur version actuelle, et un store qui sert encore une version plus ancienne rattrapera son retard automatiquement. Les fonctionnalités ci-dessous marquées **1.1.7 / 0.3.7** sont disponibles sur les stores du tableau qui portent déjà cette version (iOS, Firefox, Safari) et arrivent sur Google Play et Chrome lorsque ces fiches seront mises à jour. Rien de plus récent que la 1.1.7 / 0.3.7 n'est décrit comme disponible dans ce manuel.

Ce que les versions 1.1.7 / 0.3.7 ont changé pour vous :

- **Les approbations refusent une requête dont les octets peuvent se lire de deux façons.** Si un même champ apparaît deux fois dans une requête, un écran et la chaîne pourraient ne pas s'accorder sur ce qui est signé — par exemple des frais ou un montant affichés autrement que ceux exécutés. QoreX refuse désormais une telle requête au lieu d'en montrer une seule lecture. Voir [Ce que montre la fenêtre d'approbation](/qorex/security-and-recovery#approvals).
- **L'expiration d'une autorisation est affichée à la seconde près**, et les votes de gouvernance sont décodés et affichés sur l'écran d'approbation.
- **Les sites sont identifiés par l'origine que le navigateur lui-même atteste**, et non par ce qu'une requête affirme d'elle-même.
- **La recherche d'@handle fonctionne de nouveau dans l'extension.**
- **Réserver un @handle nécessite un compte connecté et se fait dans l'application** ; l'extension vous y renvoie.
- **Les noms imitant QoreChain sont réservés**, afin qu'un nouveau handle ne puisse pas imiter le projet ou son équipe.

Points marquants depuis 1.0.9 / 0.2.6 :

- **Plusieurs portefeuilles** sur un même téléphone ou navigateur, chacun avec sa propre phrase de récupération, avec un basculement en un geste — voir [Plusieurs portefeuilles](/qorex/getting-started#several-wallets).
- **Compte de type Ethereum (coin 60)**, ajouté manuellement, pour les phrases d'abord utilisées dans MetaMask ou sur le Dashboard — voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard).
- **Ajouter un token par contrat**, **Recevoir sur n'importe quel réseau**, **recherche** globale, une **visite** de première utilisation, un **widget d'écran d'accueil** et des **notifications push** à l'arrivée de QOR (mobile) — voir [Envoyer et recevoir](/qorex/send-and-receive).
- **Réclamer et restaker**, une vérification des frais avant la réclamation, une liste **Désengagement en cours** et des avertissements avant de staker au point de ne plus pouvoir unstaker — voir [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking).
- Des écrans d'approbation qui affichent chaque message, les frais, les limites de dépense et l'expiration, et refusent ce que QoreX ne peut pas afficher ; **`signAndBroadcast`** pour les dApps ; **Sites connectés** avec Révoquer (extension) ; la **fenêtre d'accès EVM** — voir [Sécurité et récupération](/qorex/security-and-recovery) et l'[Extension de navigateur](/qorex/browser-extension).
- Correctifs : un compte financé pouvait momentanément disparaître de « Vos comptes » (1.0.9) ; le bouton Retour matériel d'Android revient désormais d'un écran en arrière (1.1.1) ; la phrase de récupération est masquée aux services hors accessibilité sur Android 14 et versions ultérieures (1.1.6).

QoreX fonctionne sur le mainnet `qorechain-vladi`, qui exécute la chaîne **v3.2.3** (en ligne depuis le 7 juin 2026). Le format de signature, les adresses, les décimales, les mémos et les frais n'ont pas changé lors de cette mise à niveau ; aucune mise à jour de QoreX n'est donc nécessaire.

## Ce que QoreX envoie sur le réseau {#data-and-privacy}

QoreX n'a **aucune analytique, aucun rapport de plantage et aucun SDK de suivi**. Vos clés, votre phrase de récupération, le coffre et vos approbations **ne quittent jamais l'appareil**. Les applications communiquent bien avec le réseau, comme tout portefeuille doit le faire ; voici la liste complète.

**Toujours (nécessaire pour afficher les soldes et envoyer) :**

- **Les points de terminaison publics de QoreChain** (`api`, `rpc`, `evm` et `svm` sur `qore.host`, et leurs équivalents `-testnet`) pour les soldes, l'historique et la diffusion. Ces requêtes portent votre adresse `qor1…` **publique**.
- **Consultation du prix** — une requête pour le prix du QOR, qui ne porte **aucune adresse**.
- **Réseaux externes que vous détenez ou consultez** — des services RPC/REST tiers publics pour ce réseau, portant votre adresse **publique** sur ce réseau.
- **Registre des @handles** — porte le handle que vous recherchez, ou une adresse publique.

**Uniquement si vous l'activez :**

- **Notifications push** (mobile) — désactivées tant que vous ne les activez pas. Le serveur reçoit alors le jeton de votre appareil et les adresses `qor1…` publiques du portefeuille utilisé (jusqu'à 10). Un appareil dont le serveur n'a pas eu de nouvelles depuis 90 jours est oublié.
- **Récupération sociale** — le relais ne stocke **que du texte chiffré**.
- **Connexion** (e-mail, ou Apple ou Google) — nécessaire pour réserver un @handle, pour lier au Dashboard et pour utiliser les demandes de paiement.
- **Connexion au Dashboard et adresses liées** — envoie une preuve signée que vous possédez l'adresse.
- **Demandes de paiement** — envoient le handle expéditeur, le handle destinataire, le montant et une note facultative.

**Le widget d'écran d'accueil** n'envoie aucune requête propre aux serveurs de QoreChain : l'application lui transmet localement votre adresse, votre solde et l'indicateur de confidentialité, et le widget actualise le solde depuis le point de terminaison REST public de QoreChain.

Il n'y a **aucun chat IA et aucun service QCAI** dans aucune des deux applications.
