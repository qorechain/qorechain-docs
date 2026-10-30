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
QoreX est non-custodial : QoreChain Association ne peut ni récupérer un portefeuille perdu, ni le réinitialiser, ni le restaurer à votre place. **Désinstaller l'application, réinitialiser le téléphone ou supprimer l'extension efface vos clés de cet appareil.** Notez votre phrase de récupération de 24 mots (l'application mobile ne l'affiche pas pendant qu'elle crée le portefeuille, révélez-la donc depuis **Paramètres → Sécurité → Révéler la phrase de récupération** ; l'extension l'affiche une seule fois à la création) et, si vous le pouvez, mettez en place la [récupération sociale](/qorex/security-and-recovery#social-recovery). Voir [Sauvegarder maintenant](/qorex/security-and-recovery#back-up-now).
:::

## Innovations {#innovations}

- **Voie native à signature hybride.** Chaque transfert de QOR sur la voie native est signé deux fois : avec une clé classique secp256k1 et avec ML-DSA-87 (FIPS 204). La chaîne vérifie les deux. Tout ce qui se passe sur un réseau externe est uniquement classique, et QoreX l'indique avant que vous ne confirmiez.
- **Une phrase de récupération, une clé ML-DSA-87, aucune seconde sauvegarde.** La clé ML-DSA-87 est dérivée de façon déterministe à partir des mêmes 24 mots : `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`. La dérivation est publiée dans [QoreSign](/qoresign/overview) : tout portefeuille compatible dérive donc la même clé.
- **Enregistrée automatiquement, puis vérifiée.** La clé ML-DSA-87 est enregistrée on-chain avec votre première transaction (avec une preuve de possession à partir de la chaîne v3.2.3). Après chaque diffusion, le portefeuille vérifie que la transaction validée porte bien la couche ML-DSA-87, et vous avertit si ce n'est pas le cas.
- **Des approbations qui refusent ce qu'elles ne savent pas lire.** Chaque message, les frais, les limites de dépense et l'expiration sont décodés avant que vous ne signiez. Une requête que QoreX ne peut pas décoder, ou dont les octets peuvent se lire de deux façons, est refusée.
- **`signAndBroadcast` pour les dApps.** Un site web envoie les messages ; le portefeuille les affiche décodés, ajoute la couche ML-DSA-87 que seul le portefeuille peut produire, et diffuse. Une page ne peut pas produire cette couche.
- **Fenêtres d'accès EVM.** Au-dessus de la chaîne v3.2.0, une transaction EVM n'est admise que tant que le compte a une fenêtre ouverte : un `MsgOpenEVMWindow` signé de façon hybride, borné par le nombre de transactions, la valeur et l'expiration. QoreX l'ouvre, l'affiche et la ferme.
- **Handles avec épinglage.** Un @handle est lié à une adresse `qor1…` par une attestation ed25519 du registre et par la propre signature secp256k1 du propriétaire. QoreX épingle l'adresse qu'il a résolue en premier et signale tout changement silencieux.
- **Une récupération qui ne dépend d'aucune entreprise.** La récupération sociale découpe la graine en parts chiffrées scellées avec ML-KEM (2 gardiens sur 3), avec un délai de sécurité de 48 heures qui vous alerte ; Legacy est un interrupteur d'homme mort sur vos gardiens ; la liaison d'appareils déplace un portefeuille avec un code à usage unique et un QR inutilisable seul. Voir [Sécurité et récupération](/qorex/security-and-recovery).
- **Une empreinte réduite.** L'extension ne demande au navigateur qu'une seule permission d'API, `storage`, et n'embarque aucun code d'analytique ni de suivi. Le push ne communique au serveur que vos adresses publiques, et la notification dit seulement « QOR received ».

## Comment l'utiliser {#how-to-use}

1. Installez QoreX depuis une fiche de store officielle (voir [Comment y accéder](#how-to-access)).
2. Créez un portefeuille ou restaurez-en un : [Démarrer](/qorex/getting-started) pour l'application mobile, [Extension de navigateur](/qorex/browser-extension#wallet) pour l'extension.
3. Notez les 24 mots, puis envoyez et recevez des QOR : [Envoyer et recevoir](/qorex/send-and-receive).
4. Stakez : [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking). Mettez en place votre filet de sécurité : [Sécurité et récupération](/qorex/security-and-recovery).
5. Pour utiliser un site web avec QoreX, ouvrez-le dans l'extension (ordinateur) ou dans le [Navigateur de dApp](/qorex/dapp-browser) de l'application. Chaque connexion et chaque signature est une approbation que vous donnez.

## Comment y accéder {#how-to-access}

- **Réseaux :** mainnet `qorechain-vladi` (par défaut) et testnet `qorechain-diana`. Sur mobile, le testnet se trouve dans **Paramètres → Utiliser le testnet (développeurs)**.
- **Compte nécessaire :** aucun. La connexion (e-mail, Apple ou Google) est facultative et n'est nécessaire que pour réserver un @handle, lier au Dashboard et utiliser les demandes de paiement.
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

| Build | Fiche et nom du paquet | Version actuelle (27 oct. 2026) | Lien |
|---|---|---|---|
| Application iOS | App Store, **QoreX** (id 6791256626) | 1.1.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Application Android | Google Play, `network.qore.qorex` | 1.1.9 | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |
| Extension Chrome | Chrome Web Store, **QoreX** | 0.3.8 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Extension Firefox | Firefox Add-ons, `qorex` | 0.3.9 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Extension Safari | Mac App Store, **QoreX Wallet** (id 6794132220) | app 1.7.8, extension 0.3.8 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |
| Kit développeur | six paquets npm, voir [Pour les développeurs](#developers) | 0.1.0 | [Intégrations QoreX](/developer-tools/qorex-integrations) |

L'examen par les stores suit son propre calendrier ; un store peut donc servir une version plus ancienne qu'un autre ; voir [Quelle version est disponible où](#versions). Le code source de QoreX n'est pas public.

## Limites et problèmes connus {#limits}

- **Aucune promesse au-delà de ce qui est signé.** La signature hybride couvre les transactions de la voie native. Les transactions EVM ne portent qu'une signature secp256k1 et ne sont admises que tant qu'une fenêtre d'accès EVM est ouverte. Les transferts SVM et ceux des réseaux externes sont uniquement classiques.
- **Le fournisseur EVM de l'extension ne répond qu'aux requêtes de compte et de réseau.** Il ne signe pas encore de transactions ni de messages EVM. La signature de message (`signArbitrary`) n'est pas livrée.
- **Mobile uniquement :** portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy, demandes de paiement, connexion et liaison d'appareils.
- **Le swap n'est pas disponible.** Il reste désactivé tant qu'il n'y a pas de liquidité dans les pools et n'est pas affiché sur iOS.
- **Les signataires liés** (Phantom ou MetaMask comme clé liée avec des limites de dépense) ne sont pas encore disponibles dans QoreX.
- **La rotation de clé** de votre clé ML-DSA-87 n'est pas encore disponible dans QoreX.
- **Si le service de handles est indisponible,** le portefeuille revient aux adresses simples ; tout le reste continue de fonctionner.
- Un portefeuille perdu, sans phrase notée et sans récupération sociale, ne peut être récupéré par personne.

## Disponibilité par plateforme {#platform-availability}

| Fonctionnalité | Application mobile (Android et iOS) | Extension de navigateur |
|---|---|---|
| Créer / importer un portefeuille | ✅ (l'application n'affiche pas la phrase lorsqu'elle crée le portefeuille - révélez-la depuis Paramètres → Sécurité) | ✅ (autonome ; la phrase est affichée une seule fois à la création) |
| Plusieurs portefeuilles, chacun avec sa propre phrase de récupération | ✅ (Paramètres → Portefeuilles) | ✅ (**Portefeuilles**, un seul mot de passe pour tous) |
| Plusieurs comptes à partir d'une seule phrase de récupération | ✅ (jusqu'à 20 par portefeuille) | ✅ |
| Compte de type Ethereum (coin 60), ajouté manuellement | ✅ | ✅ |
| Envoyer et recevoir des QOR (voie native à signature hybride) | ✅ | ✅ (Envoyer ; Recevoir avec QR) |
| Recevoir sur n'importe quel réseau pris en charge | ✅ | ✅ |
| Payer un @handle | ✅ | ✅ |
| Réserver un @handle | ✅ (nécessite un compte connecté) | - (l'extension vous renvoie vers l'application) |
| Staking : déléguer, annuler la délégation, déplacer un stake, réclamer, réclamer et restaker | ✅ | ✅ |
| Réseaux externes (Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis, Celestia + tokens) | ✅ | ✅ (envoi depuis le popup) |
| Ajouter un token par contrat (réseaux EVM) | ✅ | ✅ |
| Fenêtre d'accès EVM | ✅ | ✅ |
| Langue de l'interface (10 langues) | ✅ (suit le téléphone) | ✅ (suit le navigateur) |
| Portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy | ✅ | - |
| Recherche, visite de première utilisation, widget d'écran d'accueil, notifications push | ✅ | - |
| Connexions dApp | ✅ (navigateur intégré, limité à la session) | ✅ (tout site web ; **Sites connectés** avec Révoquer) |
| Swap | Android uniquement, désactivé jusqu'à la liquidité des pools (non affiché sur iOS) | - |
| Connexion de compte et demandes de paiement | ✅ | - |
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

L'examen par les stores suit son propre calendrier ; un store peut donc servir pendant un temps une version plus ancienne qu'un autre. Voici la version actuelle **sur chaque store** au **27 octobre 2026** :

| Store | Version actuelle | Remarque |
|---|---|---|
| Apple App Store (iOS) | 1.1.8 | publiée le 21 octobre |
| Google Play (Android) | 1.1.9 | |
| Chrome Web Store | 0.3.8 | |
| Firefox Add-ons | 0.3.9 | |
| Safari (Mac App Store) | 1.7.8, intégrant l'extension 0.3.8 | le Mac App Store utilise sa propre numérotation `1.x` |

Les stores affichent toujours leur version actuelle, et un store qui sert encore une version plus ancienne rattrapera son retard automatiquement. Les versions qu'un store n'a pas encore publiées ne sont pas décrites comme disponibles dans ce manuel.

Ce qu'ajoutent les versions 1.1.9 / 0.3.9 (Android 1.1.9 et extension Firefox 0.3.9 aujourd'hui ; iOS, Chrome et Safari les reçoivent dès que leurs stores servent ces versions) :

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

QoreX fonctionne sur le mainnet `qorechain-vladi` (en ligne depuis le 7 juin 2026), qui exécute la chaîne **v3.2.5** depuis le 29 octobre 2026 (v3.2.4 à partir du 23 octobre 2026). Le format de signature, les adresses, les décimales, les mémos et les frais ne changent pas lors de ces mises à niveau ; aucune mise à jour de QoreX n'est donc nécessaire pour elles.

## Pour les développeurs {#developers}

Pour vous intégrer à QoreX depuis votre propre application, utilisez le kit développeur QoreX : six paquets npm, publiés en 0.1.0. Leurs commandes d'installation, exemples et limites se trouvent sur [Intégrations QoreX](/developer-tools/qorex-integrations). Pour la découverte de portefeuilles et la signature dans une application web, voir aussi l'[adaptateur de portefeuille](/developer-tools/wallet-adapter) et, pour le fournisseur de navigateur que QoreX injecte, l'[Extension de navigateur](/qorex/browser-extension#standards).

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
- **Connexion** (e-mail, ou Apple ou Google) - nécessaire pour réserver un @handle, pour lier au Dashboard et pour utiliser les demandes de paiement.
- **Connexion au Dashboard et adresses liées** - envoie une preuve signée que vous possédez l'adresse.
- **Demandes de paiement** - envoient le handle expéditeur, le handle destinataire, le montant et une note facultative.

**Le widget d'écran d'accueil** n'envoie aucune requête propre aux serveurs de QoreChain : l'application lui transmet localement votre adresse, votre solde et l'indicateur de confidentialité, et le widget actualise le solde depuis le point de terminaison REST public de QoreChain.

Il n'y a **aucun chat IA et aucun service QCAI** dans aucune des deux applications.
