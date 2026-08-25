---
slug: /qorex/security-and-recovery
title: Sécurité et récupération
sidebar_label: Sécurité et récupération
sidebar_position: 5
---

# Sécurité et récupération

Tout ce qui concerne la protection et la récupération de votre portefeuille se trouve dans **Paramètres → Tableau de bord Sécurité**. L'onglet Accueil affiche également une carte **État de la sauvegarde** qui continue d'avertir tant que la récupération sociale n'est pas configurée.

## Sauvegardez maintenant — personne ne peut récupérer un portefeuille perdu à votre place {#back-up-now}

:::danger À lire avant d'alimenter votre portefeuille
QoreX est **non-custodial** : vos clés n'existent que sur votre propre appareil, et QoreChain Association n'en possède aucune copie, aucune clé maîtresse, et n'a aucun moyen de réinitialiser ou de restaurer votre portefeuille. **Il n'existe ni procédure « mot de passe oublié », ni ticket d'assistance, ni intervention du service client** — si vous perdez l'accès à vos clés sans sauvegarde en place, les fonds sont perdus, définitivement et irréversiblement. Cela vaut pour tout portefeuille non-custodial, ce n'est pas une limitation propre à QoreX, mais il est utile de le dire clairement.

**Faites au moins l'une de ces actions — juste après avoir créé votre portefeuille, pas plus tard :**

1. **Notez votre phrase de récupération de 24 mots** et conservez-la hors ligne, dans un endroit durable (pas une capture d'écran, pas une note synchronisée dans le cloud, pas un message que vous vous envoyez). C'est la seule chose capable de restaurer votre portefeuille, sur n'importe quel appareil, à tout moment — sur mobile, la restauration directe à partir de la phrase nécessite la version **1.0.4 ou ultérieure** (les versions antérieures ne proposent que le parcours par gardien ; voir [Restaurer un portefeuille existant](/qorex/getting-started#2-restore-an-existing-wallet)). L'extension restaure toujours directement à partir de la phrase, à toutes les versions.
2. **Configurez la [récupération sociale](#social-recovery)** avec des gardiens en qui vous avez confiance. Cela vous permet de récupérer votre portefeuille même si vous perdez la phrase, sans qu'aucun gardien pris isolément ne puisse jamais accéder à vos fonds.

Faire les deux est l'option la plus sûre — la phrase vous couvre si vous changez d'appareil ou si l'application est indisponible ; les gardiens vous couvrent si vous perdez la phrase elle-même.

**Désinstaller l'application supprime vos clés de cet appareil.** Le coffre de l'application mobile et celui de l'extension navigateur vivent chacun uniquement sur l'appareil qui les a créés. Désinstaller l'application, réinitialiser le téléphone, ou supprimer/effacer l'extension supprime cette copie — sans sauvegarde ni appareil lié, votre portefeuille ne peut être récupéré par personne, y compris QoreChain.
:::

## Clé post-quantique {#pqc-key}

Le tableau de bord Sécurité affiche l'état on-chain en direct de votre clé post-quantique : **« S'enregistre à votre premier transfert »** → **« Enregistrée on-chain ✓ »**. L'algorithme est **ML-DSA-87** (déterministe, hybride avec secp256k1).

**Rotation de clé** — faire pivoter votre clé post-quantique (une opération on-chain `MsgRotatePQCKey`) nécessite une nouvelle cérémonie biométrique et n'est **jamais automatisée**. Voir [Rotation de clé](/developer-guide/post-quantum-signing#key-rotation) pour le mécanisme sous-jacent.

## Récupération sociale {#social-recovery}

La récupération sociale permet à des **gardiens** de confiance de vous aider à restaurer votre portefeuille sans jamais voir votre phrase de récupération.

- Votre graine est divisée en **parts scellées ML-KEM** distribuées aux gardiens selon un schéma à **seuil** (t-parmi-n) : *t* de vos *n* gardiens suffisent pour vous aider à récupérer, mais un nombre inférieur ne le peut pas.
- Chaque gardien reçoit un identifiant. La configuration n'écrit rien de lisible sur le relais — uniquement des enveloppes opaques et scellées.
- Une récupération nécessite l'approbation du seuil de gardiens, puis déclenche un **verrouillage temporel de 48 heures** et vous envoie une **alerte d'annulation**, afin qu'une tentative malveillante puisse être stoppée.

**Configuration :** Tableau de bord Sécurité → Récupération sociale → choisissez vos gardiens et le seuil. L'avertissement d'état de sauvegarde disparaît une fois cela fait.

**Approuver la récupération de quelqu'un d'autre :** si vous êtes gardien pour quelqu'un, utilisez **Aider à récupérer** dans l'onglet Accueil pour approuver sa demande.

## Legacy Protocol {#legacy}

**Legacy Protocol** est un dispositif d'héritage à sécurité post-quantique : un interrupteur d'homme mort superposé à vos gardiens, permettant à vos actifs de revenir aux bénéficiaires que vous avez choisis si vous devenez injoignable. Il est optionnel et se configure depuis le tableau de bord Sécurité.

## Lier un nouvel appareil {#link-device}

Transférez votre portefeuille vers un second téléphone ou une tablette **sans serveur et sans saisir** les 24 mots :

1. **Nouvel appareil** → intégration → **Lier depuis un autre appareil**. Il affiche un code à **10 caractères** à usage unique et ouvre l'appareil photo.
2. **Ancien appareil** → Paramètres → Sécurité → **Lier un nouvel appareil** → saisissez ce code → confirmez par biométrie. Un **QR code** apparaît (votre graine scellée avec une clé dérivée du code : scrypt N=2¹⁷ → AES-256-GCM).
3. **Le nouvel appareil** scanne le QR code → il déchiffre localement → même portefeuille, mêmes adresses.

**Pourquoi c'est sûr :** le code et le QR code n'apparaissent jamais sur le même écran. Une photo du QR code seule n'est que du texte chiffré derrière une fonction de dérivation de clé gourmande en mémoire, et les deux éléments sont à usage unique et disparaissent avec les écrans. Un code erroné produit une erreur claire — il suffit de réessayer.

:::note
La liaison d'appareil est une **commodité**, pas une méthode de récupération. Votre phrase de 24 mots et la récupération sociale sont vos véritables filets de sécurité.
:::

## dApps connectées {#connected-dapps}

Les connexions aux dApps sont **par origine** et **limitées à la session** : fermer le navigateur de dApps intégré révoque toutes les connexions. Vous pouvez consulter et déconnecter les connexions actives dans le tableau de bord Sécurité.

## Signataires liés et limites de dépense {#linked-signers}

Lorsque vous liez des clés externes (Phantom / MetaMask) via le [Dashboard](/qorex/account-and-dashboard#dashboard), chacune reçoit des **permissions circonscrites** et une **SpendingRule** appliquée **on-chain**, pas seulement dans l'interface. La gestion des clés ne peut jamais être déléguée à une clé liée. Voir [Authentificateurs de portefeuille lié](/developer-guide/account-abstraction#authenticators) pour le modèle on-chain. Le dashboard affiche toujours la vérité on-chain actuelle.

## Q-Day Scanner {#q-day-scanner}

Le **Q-Day Scanner** vous permet de saisir n'importe quelle adresse — la vôtre ou celle de quelqu'un d'autre — et d'obtenir un rapport d'exposition quantique : quels fonds reposent sur des clés purement classiques et lesquels sont déjà protégés post-quantique. Accessible depuis les boutons rapides de l'onglet Accueil.

## Modèle de sécurité, en bref

1. **Non-custodial** — les clés sont générées sur l'appareil, vivent dans des coffres protégés par le matériel (mobile) ou un coffre chiffré (extension), et n'en sortent jamais.
2. **Rien sans consentement** — chaque connexion est par origine, chaque signature est approuvée individuellement (biométrie sur mobile), et les charges utiles sont toujours décodées avant signature.
3. **Sécurité post-quantique par défaut** — les transferts QOR sur le lane natif portent toujours ML-DSA-87 + secp256k1 ; tout élément classique est signalé, jamais silencieux.
4. **Aucune collecte de données** — pas d'analytique, de suivi ni de publicité. La connexion de compte optionnelle est couverte par la [politique de confidentialité QoreChain](https://qorechain.io/privacy).
5. **Voies de récupération** — phrase de 24 mots (toujours), récupération sociale avec gardiens + verrouillage temporel de 48h (optionnel), héritage Legacy (optionnel), liaison d'appareil (commodité).
