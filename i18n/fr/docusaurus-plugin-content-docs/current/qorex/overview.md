---
slug: /qorex/overview
title: Portefeuille QoreX
sidebar_label: Aperçu
sidebar_position: 1
---

# Portefeuille QoreX

**QoreX** est le portefeuille officiel **non-custodial** pour **QoreChain** (mainnet `qorechain-vladi`). Il s'adresse à toute personne qui veut détenir, envoyer, staker et recevoir des QOR, payer des gens par @handle, détenir des actifs sur d'autres réseaux à partir de la même phrase de récupération, et approuver ce que les sites web demandent à leur portefeuille de signer. Vos clés privées sont générées et stockées **uniquement sur votre appareil**. QoreChain Association n'a jamais accès à vos fonds, et les applications ne contiennent **aucune analytique, aucun rapport de plantage et aucun SDK de suivi**. Les clés, la phrase de récupération, le coffre et les approbations ne quittent jamais votre appareil (voir [Ce que QoreX envoie sur le réseau](#data-and-privacy)). Chaque transfert de QOR sur la voie native est signé deux fois : avec une clé classique et avec ML-DSA-87 (FIPS 204).

QoreX est une famille de quatre builds qui fonctionnent ensemble :

- **Application mobile** (Android et iOS) : le portefeuille complet, avec récupération, staking, portefeuille d'actifs, un navigateur de dApp intégré et le Q-Day Scanner. Voir [Démarrer](/qorex/getting-started) et [Navigateur de dApp](/qorex/dapp-browser).
- **Extension de navigateur** (Chrome et navigateurs Chromium, Firefox) : un portefeuille de bureau autonome, ainsi que le connecteur qui permet à tout site web de découvrir QoreX et de transformer chaque requête en une approbation explicite. Voir [Extension de navigateur](/qorex/browser-extension).
- **Extension Safari** : la même extension, empaquetée dans l'application macOS **QoreX Wallet** sur le Mac App Store.
- **Kit développeur** : six paquets npm publics pour les applications qui s'intègrent à QoreX. Voir [Pour les développeurs](#developers).

:::caution Sauvegardez votre phrase de récupération dès que vous créez un portefeuille
QoreX est non-custodial : QoreChain Association ne peut ni récupérer un portefeuille perdu, ni le réinitialiser, ni le restaurer à votre place. **Désinstaller l'application, réinitialiser le téléphone ou supprimer l'extension efface vos clés de cet appareil.** Notez votre phrase de récupération de 24 mots (l'application mobile ne l'affiche pas pendant qu'elle crée le portefeuille, révélez-la donc depuis **Réglages → Sécurité → Afficher la phrase de récupération** ; l'extension l'affiche une seule fois à la création) et, si vous le pouvez, mettez en place la [récupération sociale](/qorex/security-and-recovery#social-recovery). Voir [Sauvegarder maintenant](/qorex/security-and-recovery#back-up-now).
:::

## Innovations {#innovations}

- **Voie native à signature hybride.** Chaque transfert de QOR sur la voie native est signé deux fois : avec une clé classique secp256k1 et avec ML-DSA-87 (FIPS 204). La chaîne vérifie les deux. Tout ce qui se passe sur un réseau externe est uniquement classique, et QoreX l'indique avant que vous ne confirmiez.
- **Une phrase de récupération, une clé ML-DSA-87, aucune seconde sauvegarde.** La clé ML-DSA-87 est dérivée de façon déterministe à partir des mêmes 24 mots : `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. La dérivation est publiée dans [QoreSign](/qoresign/overview) : tout portefeuille compatible dérive donc la même clé.
- **Enregistrée automatiquement, puis vérifiée.** La clé ML-DSA-87 est enregistrée on-chain avec votre première transaction (avec une preuve de possession à partir de la chaîne v3.2.3). Après chaque diffusion, le portefeuille vérifie que la transaction validée porte bien la couche ML-DSA-87, et vous avertit si ce n'est pas le cas.
- **Des approbations qui refusent ce qu'elles ne savent pas lire.** Chaque message, les frais, les limites de dépense et l'expiration sont décodés avant que vous ne signiez. Une requête que QoreX ne peut pas décoder, ou dont les octets peuvent se lire de deux façons, est refusée.
- **`signAndBroadcast` pour les dApps.** Un site web envoie les messages ; le portefeuille les affiche décodés, ajoute la couche ML-DSA-87 que seul le portefeuille peut produire, et diffuse. Une page ne peut pas produire cette couche.
- **Fenêtres d'accès EVM, plus sûres par défaut.** Au-dessus de la chaîne v3.2.0, une transaction EVM n'est admise que tant que le compte a une fenêtre ouverte : un `MsgOpenEVMWindow` signé de façon hybride, borné par le nombre de transactions, la valeur et l'expiration. QoreX l'ouvre, l'affiche et la ferme. Une fenêtre que vous ouvrez vous-même est limitée aux **Transferts de QOR uniquement** sauf si vous choisissez **N'importe quel contrat**, qui s'accompagne de son propre avertissement ; une fenêtre ouverte indique exactement ce qu'elle admet ; et une approbation qui ouvre une fenêtre pour un site nomme chaque contrat que la fenêtre autorise et signale quand elle remplace celle qui est ouverte. Voir [Sécurité et récupération](/qorex/security-and-recovery#evm-window).
- **Handles avec épinglage.** Un @handle est lié à une adresse `qor1…` par une attestation ed25519 du registre et par la propre signature secp256k1 du propriétaire. QoreX épingle l'adresse qu'il a résolue en premier et signale tout changement silencieux.
- **Une récupération qui ne dépend d'aucune entreprise.** La récupération sociale découpe la graine en parts chiffrées scellées avec ML-KEM (2 gardiens sur 3), avec un délai de sécurité de 48 heures qui vous alerte ; Legacy est un interrupteur d'homme mort sur vos gardiens ; la liaison d'appareils déplace un portefeuille avec un code à usage unique et un QR inutilisable seul. Voir [Sécurité et récupération](/qorex/security-and-recovery).
- **Un premier lancement avec un objectif.** Après la courte visite, QoreX demande **Que veux-tu faire en premier ?** (recevoir de l'argent, envoyer de l'argent ou garder mes cryptos en sécurité) et vous guide jusqu'au bout, avec pour finir une courte vérification de la sauvegarde. Voir [Premier lancement](/qorex/getting-started#first-run).
- **Demandes de paiement avec liens signés.** Demandez un montant et QoreX crée un lien signé par la clé de votre propre compte, de sorte qu'un destinataire ou un montant modifié est détecté. Le QoreX du payeur vérifie la signature, le réseau et tout @handle, puis affiche la vérification habituelle. Une demande n'est marquée comme payée que lorsque la chaîne montre le paiement. Voir [Envoyer et recevoir](/qorex/send-and-receive).
- **Contacts et favoris.** Des noms pour les adresses que vous payez, conservés uniquement sur l'appareil. Les favoris sont des pastilles accessibles en un toucher sur le formulaire d'envoi, **Répéter le paiement** remplit à nouveau le formulaire (vous le vérifiez toujours), et une adresse qui ne fait que ressembler à une adresse enregistrée est signalée.
- **La protection de mon argent.** Un seul écran qui vérifie, en direct, si votre sauvegarde a été vérifiée, si votre récupération a été testée, vos gardiens (application), les sites et applications connectés à vous, les autorisations que votre compte a accordées sur le réseau et les approbations ERC-20 sur l'EVM de QoreChain (chacun avec Révoquer), et quelles signatures sont post-quantiques sur quelle voie. Voir [Sécurité et récupération](/qorex/security-and-recovery).
- **Un historique clair.** Chaque transaction apparaît comme en attente, confirmée ou échouée, d'après la chaîne, compte par compte, avec un export en CSV sans risque à l'ouverture dans un tableur.
- **Une bannière d'état du réseau.** Si les blocs cessent d'arriver, QoreX le signale, à partir des heures de bloc de la chaîne elle-même. Il n'affiche rien tant que le réseau va bien.
- **Entretien de la clé post-quantique.** Si l'enregistrement de la clé post-quantique d'un compte ne permet plus de signer, QoreX propose de l'enregistrer à nouveau (jamais automatiquement, en deux touchers). Vous pouvez aussi changer la clé ML-DSA-87 à partir de votre phrase de récupération, et créer un compte **multisignature** post-quantique, le cosigner et envoyer depuis ce compte.
- **Mode développeur.** Un interrupteur (désactivé par défaut) qui ajoute 17 outils : des inspecteurs, un simulateur de transactions, la vérification de contrats et de déploiements, des profils de rollup, la signature hors ligne et multisignature, et un espace où des agents IA proposent des transactions que vous approuvez. Rien n'y modifie une règle de signature. Voir [Mode développeur](/qorex/developer-mode).
- **Fonctionnalités réseau réservées au testnet.** L'envoi vers une autre chaîne via IBC, un écran QoreChain Bridge et Solana sur QoreChain n'existent que sur le testnet. Voir [Fonctionnalités du testnet](/qorex/testnet-features).
- **Une empreinte réduite.** L'extension ne demande au navigateur qu'une seule permission d'API, `storage`, et n'embarque aucun code d'analytique ni de suivi. Le push ne communique au serveur que vos adresses publiques, et la notification dit seulement « QOR received ».

## Comment l'utiliser {#how-to-use}

1. Installez QoreX depuis une fiche de store officielle (voir [Comment y accéder](#how-to-access)).
2. Créez un portefeuille ou restaurez-en un : [Démarrer](/qorex/getting-started) pour l'application mobile, [Extension de navigateur](/qorex/browser-extension#wallet) pour l'extension.
3. Notez les 24 mots, puis choisissez **Que veux-tu faire en premier ?** (recevoir, envoyer ou garder mes cryptos en sécurité) et suivez le parcours : [Premier lancement](/qorex/getting-started#first-run). Ensuite, envoyez et recevez des QOR : [Envoyer et recevoir](/qorex/send-and-receive).
4. Stakez : [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking). Mettez en place votre filet de sécurité : [Sécurité et récupération](/qorex/security-and-recovery).
5. Pour utiliser un site web avec QoreX, ouvrez-le dans l'extension (ordinateur) ou dans le [Navigateur de dApp](/qorex/dapp-browser) de l'application. Chaque connexion et chaque signature est une approbation que vous donnez.

## Comment y accéder {#how-to-access}

- **Réseaux :** mainnet `qorechain-vladi` (par défaut) et testnet `qorechain-diana`. Sur mobile, le testnet se trouve dans **Réglages → Utiliser le testnet (développeurs)**. Dans l'extension, activez d'abord le Mode développeur (touchez sept fois le numéro de version en bas de la fenêtre), puis choisissez **Passer au testnet (diana)**. Une bannière jaune **TESTNET** s'affiche sur chaque écran tant que vous êtes sur le testnet.
- **Compte nécessaire :** aucun. La connexion (e-mail, Apple ou Google) est facultative et n'est nécessaire que pour réserver un @handle, lier au Dashboard et utiliser dans l'application les demandes de paiement liées au compte. Les liens de paiement signés n'exigent aucun compte.
- **Prérequis :** sur mobile, un déverrouillage de l'appareil (Face ID ou Touch ID sur iOS ; une biométrie de classe 3 ou un code PIN de verrouillage d'écran sur Android), faute de quoi les boutons de création et d'import restent désactivés. Dans l'extension, un mot de passe.
- **Coût :** QoreX est gratuit. L'envoi, le staking et l'ouverture d'une fenêtre EVM paient les frais normaux du réseau (le plancher du réseau est de 0,1 uqor par gas).
- **Installez toujours depuis une fiche officielle :**

| Build | Où | Minimum |
|---|---|---|
| Application iOS | [App Store, QoreX](https://apps.apple.com/us/app/qorex-wallet/id6791256626) | iOS 15.1 |
| Application Android | [Google Play](https://play.google.com/store/apps/details?id=network.qore.qorex) | Android 7.0 |
| Chrome, Brave, Edge, Arc, Opera | [Chrome Web Store](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) | un navigateur Chromium |
| Firefox | [Firefox Add-ons](https://addons.mozilla.org/firefox/addon/qorex/) | Firefox 140 |
| Safari | [Mac App Store, QoreX Wallet](https://apps.apple.com/us/app/qorex-wallet/id6794132220) | macOS 12 |

## Où il est publié {#where-published}

| Build | Fiche et nom du paquet | Version actuelle | Lien |
|---|---|---|---|
| Application iOS | App Store, **QoreX** (id 6791256626) | 1.2.5 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Application Android | Google Play, `network.qore.qorex` | 1.2.5 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Extension Chrome | Chrome Web Store, **QoreX** | 0.4.4 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Extension Firefox | Firefox Add-ons, `qorex` | 0.4.4 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Extension Safari | Mac App Store, **QoreX Wallet** (id 6794132220) | app 1.8.2, extension 0.4.4 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Kit développeur | six paquets npm, voir [Pour les développeurs](#developers) | 0.1.0 | [Intégrations QoreX](/developer-tools/qorex-integrations) |

L'examen par les stores suit son propre calendrier ; un store peut donc servir une version plus ancienne qu'un autre ; voir [Quelle version est disponible où](#versions). Le code source de QoreX n'est pas public.

## Limites et problèmes connus {#limits}

- **Aucune promesse au-delà de ce qui est signé.** La signature hybride couvre les transactions de la voie native. Les transactions EVM ne portent qu'une signature secp256k1 et ne sont admises que tant qu'une fenêtre d'accès EVM est ouverte (seuls les comptes ajoutés avec **Ajouter un compte Ethereum (coin 60)** peuvent envoyer sur cette voie). Les transferts SVM et ceux des réseaux externes sont uniquement classiques.
- **Mobile uniquement :** portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy, connexion, réservation d'un @handle et liaison d'appareils.
- **Le swap n'est pas disponible.** Il reste désactivé tant qu'il n'y a pas de liquidité dans les pools et n'est pas affiché sur iOS.
- **Les signataires liés** (Phantom ou MetaMask comme clé liée avec des limites de dépense) ne sont pas encore disponibles dans QoreX.
- **Testnet uniquement :** l'envoi vers une autre chaîne via IBC, l'écran QoreChain Bridge et Solana sur QoreChain. Aucun d'eux n'est proposé sur le mainnet. Voir [Fonctionnalités du testnet](/qorex/testnet-features).
- Les **agents IA** (Mode développeur) ne peuvent pas signer : ils peuvent seulement proposer une transaction que vous approuvez. Dans l'extension, ils nécessitent sur votre ordinateur un programme compagnon qui n'est pas encore publié, et ils ne sont pas disponibles dans Safari. Dans l'application, vous collez une proposition ou ouvrez un lien de proposition. Voir [Mode développeur](/qorex/developer-mode).
- **Si le service de handles est indisponible,** le portefeuille revient aux adresses simples ; tout le reste continue de fonctionner.
- Un portefeuille perdu, sans phrase notée et sans récupération sociale, ne peut être récupéré par personne.

## Disponibilité par plateforme {#platform-availability}

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ (l'application n'affiche pas la phrase lorsqu'elle crée le portefeuille - révélez-la depuis Réglages → Sécurité) | ✅ (autonome ; la phrase est affichée une seule fois à la création, suivie d'une courte vérification de la sauvegarde) |
| Premier lancement : **Que veux-tu faire en premier ?** | ✅ (après la visite ; à rouvrir depuis les Réglages) | ✅ (après la création ou l'importation ; à rouvrir depuis la fenêtre de l'extension) |
| Vérification de la sauvegarde (un quiz sur trois mots de votre phrase) | ✅ | ✅ |
| Plusieurs portefeuilles, chacun avec sa propre phrase de récupération | ✅ (Réglages → Portefeuilles) | ✅ (**Portefeuilles**, un seul mot de passe pour tous) |
| Plusieurs comptes à partir d'une seule phrase de récupération | ✅ (jusqu'à 20 par portefeuille) | ✅ |
| Compte de type Ethereum (coin 60), ajouté manuellement | ✅ | ✅ |
| Envoyer et recevoir des QOR (voie native à signature hybride) | ✅ | ✅ (Envoyer avec une étape de vérification ; Recevoir commence par la cryptomonnaie) |
| Recevoir sur n'importe quel réseau pris en charge | ✅ | ✅ |
| Payer un @handle | ✅ | ✅ |
| Réserver un @handle | ✅ (nécessite un compte connecté) | - (l'extension vous renvoie vers l'application) |
| Demandes de paiement avec liens signés, et paiement d'une demande | ✅ | ✅ |
| Contacts, favoris et **Répéter le paiement** | ✅ | ✅ |
| Historique par compte (en attente, confirmée, échouée) et export CSV | ✅ (Activité) | ✅ (**Historique**) |
| **La protection de mon argent** | ✅ | ✅ |
| **Assistance** (canaux officiels) | ✅ | ✅ |
| Bannière d'état du réseau | ✅ | ✅ |
| Verrouillage automatique (15 minutes par défaut) | ✅ (redemande votre biométrie ou votre code) | ✅ (redemande votre mot de passe) |
| Staking : déléguer, retirer du staking, déplacer la mise, réclamer, réclamer et redéléguer, verrous, choisir la destination des récompenses | ✅ | ✅ (un écran pour chacun) |
| Réparation et changement de la clé post-quantique | ✅ | ✅ |
| Comptes multisignature post-quantiques | ✅ | ✅ |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envoi depuis le popup) |
| Ajouter un token par contrat (réseaux EVM) | ✅ | ✅ |
| Fenêtre d'accès EVM | ✅ | ✅ |
| Langue de l'interface (10 langues) | ✅ (suit le téléphone) | ✅ (suit le navigateur) |
| Portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy | ✅ | - |
| Recherche, visite de première utilisation, widget d'écran d'accueil, notifications push | ✅ | - |
| Connexions dApp | ✅ (navigateur intégré, révocable site par site, sites favoris et récents) | ✅ (tout site web ; **Sites connectés** avec Révoquer) |
| Mode développeur (17 outils) | ✅ (un onglet **Développeur** dans la barre du bas) | ✅ (un seul bouton **Outils développeur**) |
| Agents IA proposant des transactions (Mode développeur) | ✅ (coller une proposition ou ouvrir un lien de proposition) | programme compagnon nécessaire (pas encore publié) ; pas dans Safari |
| Envoi vers une autre chaîne (IBC), écran QoreChain Bridge, Solana sur QoreChain | testnet uniquement | testnet uniquement |
| Swap | Android uniquement, désactivé jusqu'à la liquidité des pools (non affiché sur iOS) | - |
| Connexion à un compte | ✅ | - |
| Liaison multi-appareils | ✅ | - |
| Appairage avec le Dashboard | ✅ | ✅ (connexion + transferts proposés, y compris le staking) |

## Pour commencer

- Nouveau sur QoreX ? Commencez par [Démarrer](/qorex/getting-started) pour créer ou restaurer votre portefeuille.
- Apprenez ensuite à [Envoyer et recevoir](/qorex/send-and-receive) des QOR sur la voie native à signature hybride.
- Mettez en place votre filet de sécurité dans [Sécurité et récupération](/qorex/security-and-recovery).
- Sur ordinateur, installez l'[Extension de navigateur](/qorex/browser-extension).

## Téléchargement et disponibilité {#availability}

Installez depuis les fiches officielles de [Comment y accéder](#how-to-access). L'application Android nécessite Android 7.0 ou ultérieur, l'application iOS iOS 15.1 ou ultérieur, l'extension Firefox Firefox 140 ou ultérieur et l'extension Safari macOS 12 ou ultérieur.

## Quelle version est disponible où {#versions}

L'examen par les stores suit son propre calendrier ; un store peut donc servir pendant un temps une version plus ancienne qu'un autre. Voici la version actuelle **sur chaque store** :

| Store | Version actuelle | Remarque |
|---|---|---|
| Apple App Store (iOS) | 1.2.5 | |
| Google Play (Android) | 1.2.5 | |
| Chrome Web Store | 0.4.4 | |
| Firefox Add-ons | 0.4.4 | |
| Safari (Mac App Store) | 1.8.2, intégrant l'extension 0.4.4 | le Mac App Store utilise sa propre numérotation `1.x` |

Les stores affichent toujours leur version actuelle, et un store qui sert encore une version plus ancienne rattrapera son retard automatiquement. Les versions qu'un store n'a pas encore publiées ne sont pas décrites comme disponibles dans ce manuel.

### Ce qu'ajoutent les versions 1.2.5 / 0.4.4 {#whats-new-125}

Pour l'usage quotidien (application et extension, mainnet et testnet sauf mention contraire) :

- **Un premier lancement avec un objectif.** Après la visite, **Que veux-tu faire en premier ?** vous guide pour recevoir, envoyer ou garder vos cryptos en sécurité, avec une courte vérification de la sauvegarde. Vous pouvez le passer et le rouvrir. Voir [Premier lancement](/qorex/getting-started#first-run).
- **Demandes de paiement avec liens signés**, et paiement d'une demande à partir d'un lien. Une demande est marquée comme payée lorsque la chaîne le montre.
- **Contacts et favoris**, avec **Répéter le paiement** et un avertissement pour les adresses ressemblantes.
- **Un historique plus clair** : en attente, confirmée ou échouée, par compte, avec un export CSV.
- **La protection de mon argent** : sauvegarde, test de récupération, gardiens (application), sites connectés, autorisations et approbations de jetons avec Révoquer, et une explication simple des signatures qui sont post-quantiques sur chaque voie.
- **Des fenêtres d'accès EVM plus sûres.** Une fenêtre que vous ouvrez vous-même est par défaut limitée aux **Transferts de QOR uniquement** ; autoriser n'importe quel contrat est un choix distinct, avec un avertissement. Les approbations nomment chaque contrat qu'une fenêtre autorise et signalent quand une nouvelle fenêtre remplace celle qui est ouverte. Quand un nœud ne peut pas vérifier ce qu'un appel fait à vos jetons, QoreX le dit et demande un second toucher.
- **De l'aide dans l'application** (**Assistance**) : uniquement les canaux officiels, avec le rappel que l'équipe QoreX ne demande jamais votre phrase.
- **Une bannière d'état du réseau** quand les blocs cessent d'arriver, et la **période de staking** (le délai avant que les QOR retirés du staking soient à votre disposition) est lue sur le réseau au lieu d'être un nombre fixe.
- **Extension : une demande de signature d'un site alors que QoreX est verrouillé** ouvre l'écran du mot de passe et nomme le site ; après le déverrouillage, la demande affiche sa propre approbation.
- **Application : sites favoris et récents** sur la page d'accueil du navigateur dApp.
- **Entretien de la clé post-quantique** : **Enregistrer la clé à nouveau** pour un enregistrement de clé qui ne permet plus de signer (jamais automatique, en deux touchers), **Changer la clé post-quantique** à partir de votre phrase de récupération, et des comptes multisignature complets (créer, cosigner par fichier ou par collage, envoyer).
- **Recevoir** propose aussi les jetons que vous avez ajoutés par contrat, avec l'adresse de leur réseau.
- **Recevoir** pour Cosmos Hub, Osmosis et Celestia affiche l'adresse depuis laquelle vos envois sur ces réseaux sont signés.
- **Mode développeur** avec 17 outils. Voir [Mode développeur](/qorex/developer-mode).
- **Testnet uniquement :** envoi vers une autre chaîne via IBC, un écran QoreChain Bridge et Solana sur QoreChain. Voir [Fonctionnalités du testnet](/qorex/testnet-features).
- **Pour les sites :** QoreX refuse désormais, de la part de tout site, une autorisation permanente (une autorisation authz portant sur `MsgGrant` ou `MsgExec`) qui permettrait à quelqu'un d'autre d'agir au nom de votre compte. Voir [Intégration dApp](/qorex/dapp-integration).

Ce que les versions 1.2.4 / 0.4.3 ont changé pour vous :

- **Déverrouillage de l'extension.** La touche Entrée déverrouille, le bouton montre qu'il travaille, **Mot de passe incorrect.** n'apparaît que pour un mauvais mot de passe, et tout autre échec est nommé.
- **Les appels de contrat reçoivent assez de gaz.** La transaction CosmWasm ou inter-VM d'un site est simulée avant l'approbation, et un appel que le contrat refuserait est refusé avant que vous ne le voyiez.
- **Les prix du gaz suivent le réseau**, et une transaction dépassant la limite de gaz par transaction du réseau est refusée avant toute signature.
- **Les approbations Solana** marquent comme illisible une instruction que QoreX ne sait pas décoder et demandent un second toucher ; un mémo affiche son texte.
- **Une clé post-quantique qui ne permet plus de signer est désignée comme telle**, au lieu de « registered by another wallet » (enregistrée par un autre portefeuille).
- **Un site ne peut plus fermer votre fenêtre EVM ni effacer son consentement** ; vous faites les deux depuis les écrans de QoreX.
- **Le rendement du staking** est lu à partir du chiffre de la chaîne elle-même, et **l'utilisation de la fenêtre EVM** apparaît dans l'Historique.
- **Firefox :** github.com se charge normalement avec QoreX installé.

Ce que les versions 1.2.3 / 0.4.2 ont changé pour vous :

- **Recevoir commence par la cryptomonnaie.** Une liste consultable avec QOR en premier, puis la cryptomonnaie propre à chaque réseau et les jetons inclus, chacun avec son image. En choisir une affiche l'adresse et le code QR pour ce réseau, avec un avertissement qui nomme la cryptomonnaie.
- **Les comptes qui ne peuvent pas utiliser de fenêtre EVM sont informés de la marche à suivre**, avec un bouton vers **Tes comptes**.
- **Les écrans de staking et de fenêtre EVM indiquent quand votre première transaction enregistre aussi votre clé.**

Ce que les versions 1.2.2 / 0.4.1 ont changé pour vous :

- La page QOR liste toutes les transactions du compte, entrantes et sortantes, avec **Afficher plus**.
- **L'envoi fonctionne sur BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche et Celestia** (et leurs jetons), comme sur Ethereum, Solana, Cosmos Hub et Osmosis.
- Les écrans d'approbation lisent les règles de dépense et les données d'appel EVM, et proposent le message complet. Les messages qui gèrent les clés ou les droits d'un compte ne peuvent être signés que depuis les écrans de QoreX.
- La vérification d'un premier envoi affiche les frais uniques d'enregistrement de la clé et le total.

Ce que la version 1.2.1 (application) a changé pour vous : un lien peut ouvrir une page dans le navigateur dApp (après l'habituelle demande biométrique), les feuilles d'approbation affichent le mémo d'une transaction, et l'application déclare aux sites ses capacités de signature. Les liens commençant par `qorex://` fournis par le Dashboard fonctionnent à nouveau.

Ce que les versions 1.2.0 / 0.4.0 ont changé pour vous :

- **Verrouillage automatique** (1, 5, 15, 30, 60 ou 240 minutes ; 15 par défaut) et un bouton **Verrouiller** dans l'extension.
- **Une vérification avant chaque transfert** dans l'extension, et un avertissement quand une adresse ne fait que ressembler à une adresse que vous avez déjà payée.
- **Historique par compte** avec tous les types de transaction QoreChain.
- **Les écrans de staking** de l'extension sont séparés (Staker des QOR, Retirer du staking, Déplacer la mise, Réclamer, Réclamer et redéléguer, Verrouiller pour un bonus, Les récompenses vont à), **Déplacer la mise** se fait en trois étapes et intercepte les déplacements que le réseau refuserait, et vous pouvez **choisir la destination des récompenses de staking** (un autre compte du même portefeuille).
- **Les dApps EVM signent via QoreX** (`personal_sign`, données typées et transactions), avec le risque décodé de chaque demande et une simulation avant la signature.
- **Les dernières valeurs connues** sont affichées, et désignées comme telles, quand le réseau ne répond pas.
- Un avertissement quand les frais dépassent la valeur que vous déplacez.

Ce qu'ajoutaient les versions 1.1.9 / 0.3.9 (inclus dans toutes les versions actuelles) :

- **Verrouillages de staking.** Verrouillez une partie de votre stake pour 3, 6 ou 12 mois. Le bonus affiché est le bonus que le verrouillage rapporte aujourd'hui, sous le plafond du réseau. Un déverrouillage anticipé passe par une seconde confirmation qui indique le coût, et **Unstake** et **Move stake** sont limités à la partie déverrouillée. Le barème des paliers est libellé « jusqu'à », avec le chiffre actuel à côté. Voir [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking#staking-locks).
- **Mémos de transfert IBC en langage clair** dans les approbations.
- **Staking depuis des comptes importés de MetaMask (coin 60)** dans l'extension.

Ce que les versions 1.1.8 / 0.3.8 ont changé pour vous :

- **MetaMask sur QoreChain, dès la première page.** Ouvrez, vérifiez et fermez la fenêtre d'accès EVM dont MetaMask a besoin, et voyez ce qu'il en reste.
- **Des vérifications de signature renforcées.** QoreX vérifie la signature ML-DSA-87 d'une application par rapport à la clé enregistrée de votre compte, et indique clairement si cette clé a été enregistrée par un autre portefeuille.
- **Correctifs de problèmes de sécurité signalés.**

Ce que les versions 1.1.7 / 0.3.7 ont changé pour vous (incluses dans la 1.1.8 / 0.3.8) :

- **Les approbations refusent une requête dont les octets peuvent se lire de deux façons.** Si un même champ apparaît deux fois dans une requête, un écran et la chaîne pourraient ne pas s'accorder sur ce qui est signé - par exemple des frais ou un montant affichés autrement que ceux exécutés. QoreX refuse désormais une telle requête au lieu d'en montrer une seule lecture. Voir [Ce que montre la fenêtre d'approbation](/qorex/security-and-recovery#approvals).
- **L'expiration d'une autorisation est affichée à la seconde près**, et les votes de gouvernance sont décodés et affichés sur l'écran d'approbation.
- **Les sites sont identifiés par l'origine que le navigateur lui-même atteste**, et non par ce qu'une requête affirme d'elle-même.
- **La recherche d'@handle fonctionne de nouveau dans l'extension.**
- **Réserver un @handle nécessite un compte connecté et se fait dans l'application** ; l'extension vous y renvoie.
- **Les noms imitant QoreChain sont réservés**, afin qu'un nouveau handle ne puisse pas imiter le projet ou son équipe.

Points marquants depuis 1.0.9 / 0.2.6 :

- **Plusieurs portefeuilles** sur un même téléphone ou navigateur, chacun avec sa propre phrase de récupération, avec un basculement en un geste - voir [Plusieurs portefeuilles](/qorex/getting-started#several-wallets).
- **Compte de type Ethereum (coin 60)**, ajouté manuellement, pour les phrases d'abord utilisées dans MetaMask ou sur le Dashboard - voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard).
- **Ajouter un token par contrat**, **Recevoir sur n'importe quel réseau**, **recherche** globale, une **visite** de première utilisation, un **widget d'écran d'accueil** et des **notifications push** à l'arrivée de QOR (mobile) - voir [Envoyer et recevoir](/qorex/send-and-receive).
- **Réclamer et restaker**, une vérification des frais avant la réclamation, une liste **Désengagement en cours** et des avertissements avant de staker au point de ne plus pouvoir unstaker - voir [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking).
- Des écrans d'approbation qui affichent chaque message, les frais, les limites de dépense et l'expiration, et refusent ce que QoreX ne peut pas afficher ; **`signAndBroadcast`** pour les dApps ; **Sites connectés** avec Révoquer (extension) ; la **fenêtre d'accès EVM** - voir [Sécurité et récupération](/qorex/security-and-recovery) et l'[Extension de navigateur](/qorex/browser-extension).
- Correctifs : un compte financé pouvait momentanément disparaître de « Vos comptes » (1.0.9) ; le bouton Retour matériel d'Android revient désormais d'un écran en arrière (1.1.1) ; la phrase de récupération est masquée aux services hors accessibilité sur Android 14 et versions ultérieures (1.1.6).

QoreX fonctionne sur le mainnet `qorechain-vladi` (en ligne depuis le 7 juin 2026), qui exécute la chaîne **v3.2.8** depuis le 18 novembre 2026 (v3.2.7 depuis le 12 novembre 2026, v3.2.6 depuis le 4 novembre 2026, v3.2.5 depuis le 29 octobre 2026, v3.2.4 depuis le 23 octobre 2026). Le format de signature, les adresses, les décimales et les mémos ne changent pas lors de ces mises à niveau. QoreX 1.2.4 / 0.4.3 a ajouté la prise en charge des règles de la v3.2.8 (portée de la fenêtre EVM, limites de gaz et prix du gaz du réseau) ; gardez donc QoreX à jour.

## Pour les développeurs {#developers}

Pour connecter un site web à QoreX (découverte du portefeuille, fournisseur, signature, liens et erreurs), commencez par [Intégration dApp](/qorex/dapp-integration) ; les outils intégrés au portefeuille pour les développeurs sont décrits dans [Mode développeur](/qorex/developer-mode). Pour vous intégrer à QoreX depuis votre propre application, vous pouvez aussi utiliser le kit développeur QoreX : six paquets npm, publiés en 0.1.0. Leurs commandes d'installation, exemples et limites se trouvent sur [Intégrations QoreX](/developer-tools/qorex-integrations). Pour la découverte de portefeuilles et la signature dans une application web, voir aussi l'[adaptateur de portefeuille](/developer-tools/wallet-adapter) et, pour le fournisseur de navigateur que QoreX injecte, l'[Extension de navigateur](/qorex/browser-extension#standards).

## Ce que QoreX envoie sur le réseau {#data-and-privacy}

QoreX n'a **aucune analytique, aucun rapport de plantage et aucun SDK de suivi**. Vos clés, votre phrase de récupération, le coffre et vos approbations **ne quittent jamais l'appareil**. Les applications communiquent bien avec le réseau, comme tout portefeuille doit le faire ; voici la liste complète.

**Toujours (nécessaire pour afficher les soldes et envoyer) :**

- **Les points de terminaison publics de QoreChain** (`api`, `rpc`, `evm` et `svm` sur `qore.host`, et leurs équivalents `-testnet`) pour les soldes, l'historique et la diffusion. Ces requêtes portent votre adresse `qor1…` **publique**.
- **Consultation du prix** - une requête pour le prix du QOR, qui ne porte **aucune adresse**.
- **Réseaux externes que vous détenez ou consultez** - des services RPC/REST tiers publics pour ce réseau, portant votre adresse **publique** sur ce réseau.
- **Registre des @handles** - porte le handle que vous recherchez, ou une adresse publique.

**Uniquement si vous l'activez :**

- **Notifications push** (mobile) - désactivées tant que vous ne les activez pas. Le serveur reçoit alors le jeton de votre appareil et les adresses `qor1…` publiques du portefeuille utilisé (jusqu'à 10). Un appareil dont le serveur n'a pas eu de nouvelles depuis 90 jours est oublié.
- **Récupération sociale** - le relais ne stocke **que du texte chiffré**.
- **Connexion** (e-mail, ou Apple ou Google) - nécessaire pour réserver un @handle, pour lier au Dashboard et pour utiliser dans l'application les demandes de paiement liées au compte.
- **Connexion au Dashboard et adresses liées** - envoie une preuve signée que vous possédez l'adresse.
- **Demandes de paiement liées au compte** (vers un @handle, dans l'application) - envoient le handle expéditeur, le handle destinataire, le montant et une note facultative. Un **lien de paiement signé** est créé et signé sur votre appareil ; le fait qu'il ait été payé est lu sur les points de terminaison publics de QoreChain.
- **Q-Day Scanner sur une adresse Bitcoin** - interroge un service exploité par un tiers, qui voit cette adresse et votre adresse IP. QoreX le nomme et ne lance l'analyse qu'après votre accord.

**Le widget d'écran d'accueil** n'envoie aucune requête propre aux serveurs de QoreChain : l'application lui transmet localement votre adresse, votre solde et l'indicateur de confidentialité, et le widget actualise le solde depuis le point de terminaison REST public de QoreChain.

**Conservés uniquement sur l'appareil :** les contacts, les sites dApp favoris et récents de votre application (enregistrés sans la requête ni le fragment de l'adresse), l'export d'historique que vous réalisez, ainsi que le test de récupération et la vérification de la sauvegarde (les mots que vous saisissez ne sont ni conservés ni envoyés). La bannière d'**état du réseau** lit le dernier bloc sur les points de terminaison publics de QoreChain, et non sur un service d'état distinct.

Il n'y a **aucun chat IA et aucun service QCAI** dans aucune des deux applications. L'outil **Agents IA** du Mode développeur permet à un assistant IA que vous exécutez vous-même de proposer des transactions à QoreX ; QoreX n'y intègre aucun service d'IA propre, et rien n'est signé sans votre approbation.
