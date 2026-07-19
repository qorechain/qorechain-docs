---
slug: /qorex/security-and-recovery
title: Sécurité et récupération
sidebar_label: Sécurité et récupération
sidebar_position: 5
---

# Sécurité et récupération

Tout ce qui concerne la protection et la récupération de votre portefeuille se trouve dans **Paramètres → tableau de bord Sécurité**. L'onglet Accueil affiche également une carte **État de la sauvegarde** qui continue de vous avertir tant que la récupération sociale n'est pas configurée.

## Clé post-quantique {#pqc-key}

Le tableau de bord Sécurité affiche l'état on-chain en direct de votre clé post-quantique : **« S'enregistre lors de votre premier transfert »** → **« Enregistrée on-chain ✓ »**. L'algorithme est **ML-DSA-87** (déterministe, hybride avec secp256k1).

**Rotation de clé** — la rotation de votre clé post-quantique (une opération on-chain `MsgRotatePQCKey`) exige une nouvelle cérémonie biométrique et n'est **jamais automatisée**. Voir [Rotation de clé](/developer-guide/post-quantum-signing#key-rotation) pour le mécanisme sous-jacent.

## Récupération sociale {#social-recovery}

La récupération sociale permet à des **gardiens** de confiance de vous aider à restaurer votre portefeuille sans jamais voir votre phrase de récupération.

- Votre graine est divisée en **parts scellées par ML-KEM** distribuées aux gardiens selon un schéma à **seuil** (t-of-n) : n'importe quels *t* de vos *n* gardiens peuvent vous aider à récupérer, mais un nombre inférieur ne le peut pas.
- Chaque gardien reçoit un justificatif. La configuration n'écrit rien de lisible sur le relais — uniquement des enveloppes opaques et scellées.
- Une récupération nécessite l'approbation du seuil de gardiens, puis exécute un **verrou temporel de 48 heures** et vous envoie une **alerte d'annulation**, afin qu'une tentative malveillante puisse être stoppée.

**Configurez-la :** tableau de bord Sécurité → Récupération sociale → choisissez vos gardiens et votre seuil. L'avertissement État de la sauvegarde disparaît une fois cette étape terminée.

**Approuver la récupération de quelqu'un d'autre :** si vous êtes gardien pour quelqu'un, utilisez **Aider à récupérer** dans l'onglet Accueil pour approuver sa demande.

## Legacy Protocol {#legacy}

Le **Legacy Protocol** est un dispositif d'héritage résistant au quantique : un dispositif de l'homme mort superposé à vos gardiens, afin que vos actifs puissent être transmis aux bénéficiaires que vous avez choisis si vous devenez injoignable. Il est optionnel et se configure depuis le tableau de bord Sécurité.

## Lier un nouvel appareil {#link-device}

Déplacez votre portefeuille vers un deuxième téléphone ou une tablette **sans serveur et sans saisie** des 24 mots :

1. **Nouvel appareil** → intégration → **Lier depuis un autre appareil**. Il affiche un **code à 10 caractères** à usage unique et ouvre la caméra.
2. **Ancien appareil** → Paramètres → Sécurité → **Lier un nouvel appareil** → saisissez ce code → confirmez par biométrie. Un **QR code** apparaît (votre graine scellée avec une clé dérivée du code : scrypt N=2¹⁷ → AES-256-GCM).
3. **Le nouvel appareil** scanne le QR → il le déchiffre localement → même portefeuille, mêmes adresses.

**Pourquoi c'est sûr :** le code et le QR n'apparaissent jamais sur le même écran. Une photo du QR seul est du texte chiffré protégé par une fonction de dérivation de clé exigeante en mémoire, et les deux artefacts sont à usage unique et disparaissent avec les écrans. Un code erroné donne une erreur claire — il suffit de réessayer.

:::note
La liaison d'appareil est une **commodité**, pas une méthode de récupération. Votre phrase de 24 mots et la récupération sociale sont vos véritables filets de sécurité.
:::

## dApps connectées {#connected-dapps}

Les connexions dApp sont **par origine** et **limitées à la session** : fermer le navigateur dApp intégré révoque chaque connexion. Vous pouvez consulter et déconnecter les connexions actives dans le tableau de bord Sécurité.

## Signataires liés et limites de dépenses {#linked-signers}

Lorsque vous liez des clés externes (Phantom / MetaMask) via le [Dashboard](/qorex/account-and-dashboard#dashboard), chacune reçoit des **permissions cadrées** et une **SpendingRule** qui est appliquée **on-chain**, pas seulement dans l'interface. La gestion des clés ne peut jamais être déléguée à une clé liée. Voir [Authentificateurs de portefeuilles liés](/developer-guide/account-abstraction#authenticators) pour le modèle on-chain. Le tableau de bord affiche toujours la vérité on-chain actuelle.

## Q-Day Scanner {#q-day-scanner}

Le **Q-Day Scanner** vous permet de saisir n'importe quelle adresse — la vôtre ou celle de quelqu'un d'autre — et d'obtenir un rapport d'exposition quantique : quels fonds reposent sur des clés purement classiques et lesquels sont déjà protégés post-quantique. Accédez-y depuis les boutons rapides de l'onglet Accueil.

## Le modèle de sécurité, en bref

1. **Non-custodial** — les clés sont générées sur l'appareil, résident dans des coffres adossés au matériel (mobile) ou dans un coffre chiffré (extension), et n'en sortent jamais.
2. **Rien sans consentement** — chaque connexion est par origine, chaque signature est approuvée individuellement (biométrie sur mobile), et les charges utiles sont toujours décodées avant la signature.
3. **Résistant au quantique par défaut** — les transferts QOR de la voie Native portent toujours ML-DSA-87 + secp256k1 ; tout ce qui est classique est étiqueté, jamais silencieux.
4. **Aucune collecte de données** — pas d'analyse, de suivi ni de publicité. La connexion optionnelle au compte est couverte par la [politique de confidentialité de QoreChain](https://qorechain.io/privacy).
5. **Voies de récupération** — phrase de 24 mots (toujours), récupération sociale avec gardiens + verrou temporel de 48h (optionnel), héritage Legacy (optionnel), liaison d'appareil (commodité).
