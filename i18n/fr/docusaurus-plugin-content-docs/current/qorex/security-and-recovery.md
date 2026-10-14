---
slug: /qorex/security-and-recovery
title: Sécurité et récupération
sidebar_label: Sécurité et récupération
sidebar_position: 5
---

# Sécurité et récupération

Tout ce qui concerne la protection et la récupération de votre portefeuille se trouve dans **Paramètres → Sécurité**. L'onglet Accueil affiche également une carte **État de la sauvegarde** qui continue d'avertir tant que la récupération sociale n'est pas configurée. La carte ne suit que la récupération sociale : elle ne peut pas savoir si vous avez noté votre phrase de récupération, faites-le donc vous-même (voir ci-dessous).

## Sauvegardez maintenant — personne ne peut récupérer un portefeuille perdu à votre place {#back-up-now}

:::danger À lire avant d'alimenter votre portefeuille
QoreX est **non-custodial** : vos clés n'existent que sur votre propre appareil, et QoreChain Association n'en possède aucune copie, aucune clé maîtresse, et n'a aucun moyen de réinitialiser ou de restaurer votre portefeuille. **Il n'existe ni procédure « mot de passe oublié », ni ticket d'assistance, ni intervention du service client** — si vous perdez l'accès à vos clés sans sauvegarde en place, les fonds sont perdus, définitivement et irréversiblement. Cela vaut pour tout portefeuille non-custodial, ce n'est pas une limitation propre à QoreX, mais il est utile de le dire clairement.

**Faites au moins l'une de ces actions — juste après avoir créé votre portefeuille, pas plus tard :**

1. **Notez votre phrase de récupération de 24 mots** et conservez-la hors ligne, dans un endroit durable (pas une capture d'écran, pas une note synchronisée dans le cloud, pas un message que vous vous envoyez). C'est la seule chose capable de restaurer votre portefeuille, sur n'importe quel appareil, à tout moment — sur mobile, affichez-la depuis **Paramètres → Sécurité → Afficher la phrase de récupération** (l'application ne l'affiche **pas** pendant qu'elle crée le portefeuille : vous devez donc aller la chercher — faites-le immédiatement) ; dans l'extension, elle s'affiche une seule fois à la création du portefeuille, puis à tout moment depuis **Afficher la phrase de récupération** dans la fenêtre contextuelle. Voir [Restaurer un portefeuille existant](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Configurez la [récupération sociale](#social-recovery)** avec des gardiens en qui vous avez confiance. Cela vous permet de récupérer votre portefeuille même si vous perdez la phrase, sans qu'aucun gardien pris isolément ne puisse jamais accéder à vos fonds.

Faire les deux est l'option la plus sûre — la phrase vous couvre si vous changez d'appareil ou si l'application est indisponible ; les gardiens vous couvrent si vous perdez la phrase elle-même.

**Désinstaller l'application supprime vos clés de cet appareil.** Le coffre de l'application mobile et celui de l'extension navigateur vivent chacun uniquement sur l'appareil qui les a créés. Désinstaller l'application, réinitialiser le téléphone, ou supprimer/effacer l'extension supprime cette copie — sans sauvegarde ni appareil lié, votre portefeuille ne peut être récupéré par personne, y compris QoreChain. **Retirer un portefeuille d'un téléphone ou d'un navigateur** (Paramètres → Portefeuilles → *Retirer de ce téléphone*, ou *Retirer de ce navigateur* dans l'extension) supprime de la même manière la clé de ce portefeuille de l'appareil — vos fonds restent sur la chaîne, mais seule sa phrase de récupération peut le ramener.
:::

## Clé post-quantique {#pqc-key}

L'écran **Sécurité** affiche l'état on-chain en direct de votre clé post-quantique : **« S'enregistre à votre premier transfert »** → **« Enregistrée on-chain ✓ »**. L'algorithme est **ML-DSA-87** (déterministe, hybride avec secp256k1).

**Rotation de clé** — faire pivoter votre clé post-quantique (une opération on-chain `MsgRotatePQCKey`) n'est **pas encore disponible dans QoreX** ; elle arrivera avec une prochaine mise à jour de gestion des clés, exigera une nouvelle confirmation biométrique et n'est **jamais automatisée**. Les sites web ne peuvent pas demander à QoreX d'enregistrer, de migrer ou de faire pivoter votre clé post-quantique. Voir [Rotation de clé](/developer-guide/post-quantum-signing#key-rotation) pour le mécanisme sous-jacent.

## Récupération sociale {#social-recovery}

La récupération sociale permet à des **gardiens** de confiance de vous aider à restaurer votre portefeuille sans jamais voir votre phrase de récupération.

- Votre graine est divisée en **parts scellées ML-KEM** — trois par défaut, dont n'importe quelles **deux** peuvent vous aider à récupérer (un schéma à seuil 2 sur 3) ; une seule ne le peut pas.
- Chaque gardien reçoit un identifiant. La configuration n'écrit rien de lisible sur le relais — uniquement des enveloppes opaques et scellées.
- Une récupération nécessite l'approbation du seuil de gardiens, puis déclenche un **verrouillage temporel de 48 heures** et vous envoie une **alerte d'annulation**, afin qu'une tentative malveillante puisse être stoppée.

**Configuration :** Accueil → **Configurer la récupération** (ou Paramètres → Sécurité → Récupération sociale) → **Créer les identifiants de gardien**. QoreX crée trois identifiants — *Gardien 1*, *Gardien 2* et une *Sauvegarde imprimable* — et **2 sur les 3** suffisent pour vous aider à récupérer. Donnez-en un à chaque personne ou appareil de confiance et conservez la sauvegarde imprimable en lieu sûr. L'avertissement d'état de sauvegarde disparaît une fois cela fait.

**Approuver la récupération de quelqu'un d'autre :** si vous êtes gardien pour quelqu'un, utilisez **Aider à récupérer** dans l'onglet Accueil pour approuver sa demande.

## Legacy Protocol {#legacy}

**Legacy Protocol** est un dispositif d'héritage à sécurité post-quantique : un interrupteur d'homme mort superposé à vos gardiens, permettant à vos actifs de revenir aux bénéficiaires que vous avez choisis si vous devenez injoignable. Il est optionnel et se configure depuis Paramètres → Sécurité.

## Lier un nouvel appareil {#link-device}

Transférez votre portefeuille vers un second téléphone ou une tablette **sans serveur et sans saisir** les 24 mots :

1. **Nouvel appareil** → intégration → **Lier depuis un autre appareil**. Il affiche un code à **10 caractères** à usage unique et ouvre l'appareil photo.
2. **Ancien appareil** → Paramètres → Sécurité → **Lier un nouvel appareil** → saisissez ce code → confirmez par biométrie. Un **QR code** apparaît (votre graine scellée avec une clé dérivée du code : scrypt N=2¹⁷ → AES-256-GCM).
3. **Le nouvel appareil** scanne le QR code → il déchiffre localement → même portefeuille, mêmes adresses.

**Pourquoi c'est sûr :** le code et le QR code n'apparaissent jamais sur le même écran. Une photo du QR code seule n'est que du texte chiffré derrière une fonction de dérivation de clé gourmande en mémoire, et les deux éléments sont à usage unique et disparaissent avec les écrans. Un code erroné produit une erreur claire — il suffit de réessayer.

:::note
La liaison d'appareil est une **commodité**, pas une méthode de récupération. Votre phrase de 24 mots et la récupération sociale sont vos véritables filets de sécurité.
:::

## Fenêtre d'accès EVM {#evm-window}

À partir de la chaîne **v3.2.0**, une transaction sur la **voie EVM** — par exemple une transaction que vous signez dans MetaMask sur le réseau EVM de QoreChain — n'est admise que depuis un compte qui possède une **clé post-quantique enregistrée** *et* une **fenêtre d'autorisation ouverte**. Ouvrir une fenêtre est un message de la voie Native de QoreChain que MetaMask ne peut pas produire ; c'est donc dans QoreX que vous l'ouvrez. Les envois de QoreX eux-mêmes utilisent la voie Native et n'ont jamais besoin d'une fenêtre.

Ouvrez-la dans l'application via **Paramètres → Sécurité → Fenêtre d'accès EVM**, ou avec le bouton **Fenêtre d'accès EVM** dans la fenêtre contextuelle de l'extension. Vous choisissez :

| Champ | Signification | Limite |
|---|---|---|
| **Durée (blocs, max 17280)** | combien de temps la fenêtre reste ouverte | jusqu'à 17 280 blocs (environ 15 heures sur le mainnet) |
| **Nombre de transactions (max 1000)** | combien de transactions EVM elle admet | jusqu'à 1 000 |
| **Plafond de dépense, QOR — couvre chaque montant envoyé PLUS ses frais maximaux** | le maximum qu'elle laisse passer | compte la valeur **plus** les frais maximaux de chaque transaction |

Les valeurs par défaut sont 300 blocs (environ 16 minutes sur le mainnet), 5 transactions et 1 QOR. L'ouverture coûte des frais de réseau normaux et est signée avec la signature post-quantique hybride habituelle, et une nouvelle fenêtre **remplace** toute fenêtre déjà ouverte. L'ouvrir fait aussi avancer le nonce de votre compte : ouvrez donc la fenêtre **d'abord**, puis envoyez depuis MetaMask — une transaction préparée plus tôt sera refusée avec « nonce too low ». **Fermer la fenêtre** n'est proposé que tant qu'une fenêtre est active.

L'écran affiche l'un de quatre états : *Ouverte pour \{blocks\} blocs de plus · \{txs\} transactions · \{value\} QOR restants* ; *Aucune fenêtre n'est ouverte. Les transactions MetaMask de ce compte sont refusées.* ; *Cette fenêtre a expiré ou est épuisée* ; ou *QoreX n'a pas pu lire la fenêtre depuis le réseau* — ce qui signifie que QoreX ne sait pas, et **non** que vous n'en avez pas. Si votre compte n'a pas encore de clé post-quantique, enregistrez-en une d'abord (votre premier transfert QoreX le fait) ; une fenêtre ne sert à rien avant cela.

:::caution Gardez-la petite et courte
Une fenêtre permet à de simples transactions MetaMask de déplacer vos QOR **sans signature post-quantique**. Gardez des limites basses et fermez la fenêtre quand vous avez terminé.
:::

QoreX lui-même n'envoie jamais sur la voie EVM de QoreChain ; utilisez MetaMask ou un autre portefeuille EVM pour cela, dans une fenêtre ouverte. (Envoyer des ETH, BNB et d'autres actifs sur *d'autres* réseaux depuis QoreX est une tout autre chose — voir [Réseaux et jetons externes](/qorex/send-and-receive#external-networks-tokens).)

## Ce que montre la fenêtre d'approbation {#approvals}

Chaque signature produite par QoreX est approuvée par vous, et l'approbation liste exactement ce que vous signez. QoreX affiche :

- un titre et des champs étiquetés pour **chaque message** de la requête, y compris les messages imbriqués dans un **MsgExec** authz et les termes des octrois de permissions — et il **refuse** tout ce qu'il ne peut pas afficher (« QoreX ne peut pas lire ce message … N'approuvez que si vous faites entièrement confiance à ce site ») ;
- les **frais** (*Frais : \{amount\} · gas \{gas\}*), qui les paie et tout octroi de frais — si les frais ne peuvent pas être lus, QoreX le dit et vous indique de ne pas approuver ;
- la **limite, l'action autorisée et l'expiration** des allocations de dépense et des octrois authz, avec *ILLIMITÉ* et *JAMAIS* écrits en toutes lettres. Tout ce qui est illisible, illimité ou sans fin exige un **second appui** sur Approuver (*Appuyez à nouveau pour approuver*) ;
- le compte signataire (*Signé par …*) lorsque vous en avez plusieurs ;
- pour une requête comportant un très grand nombre de messages, les 50 premiers et le nombre des autres.

Un changement de portefeuille ou de compte, ou le verrouillage du portefeuille, répond « non » aux requêtes en attente ; un site peut avoir une requête en attente, et trois peuvent attendre au total. Les noms de champs dans les fenêtres d'approbation sont affichés en anglais dans certaines versions.

## Votre phrase de récupération et les outils d'accessibilité {#phrase-privacy}

L'écran de la phrase de récupération est masqué des captures d'écran et du sélecteur d'applications. Sur **Android 14 et versions ultérieures**, les mots sont en outre soustraits aux services d'accessibilité qui ne sont pas de véritables outils d'accessibilité (TalkBack et les autres vrais lecteurs d'écran peuvent toujours les lire). Sur les versions plus anciennes d'Android et sur iOS, les mots sont masqués par défaut aux lecteurs d'écran ; si vous vous appuyez sur un lecteur d'écran, appuyez sur l'avis affiché sur cet écran pour lui permettre de les lire. N'affichez la phrase que lorsque personne ne peut voir votre écran.

## dApps connectées {#connected-dapps}

Les connexions aux dApps sont **par origine**. Dans l'application, elles sont aussi **limitées à la session** : fermer le navigateur de dApps intégré révoque toutes les connexions, de sorte que rien ne reste connecté en arrière-plan (la carte **dApps connectées** dans Paramètres → Sécurité ne fait que le dire). Dans l'extension de navigateur, les connexions persistent jusqu'à ce que vous les supprimiez — ouvrez **Sites connectés** dans la fenêtre contextuelle pour voir tous les sites approuvés par ce portefeuille et **Révoquer** n'importe lequel d'entre eux.

## Signataires liés et limites de dépense {#linked-signers}

Lier une clé externe (Phantom ou MetaMask) comme **signataire lié** avec ses propres limites de dépense n'est **pas encore disponible dans QoreX** — Paramètres → Sécurité affiche la carte, avec l'action marquée *bientôt*. Rien n'est lié à votre portefeuille, sauf si vous l'avez fait vous-même en dehors de QoreX. La gestion des clés ne peut jamais être déléguée à une clé liée. Pour le modèle on-chain, voir [Authentificateurs de portefeuille lié](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

Le **Q-Day Scanner** vous permet de saisir n'importe quelle adresse — la vôtre ou celle de quelqu'un d'autre — et d'obtenir un rapport d'exposition quantique : quels fonds reposent sur des clés purement classiques et lesquels sont déjà protégés post-quantique. Accessible depuis les boutons rapides de l'onglet Accueil.

## Modèle de sécurité, en bref

1. **Non-custodial** — les clés sont générées sur l'appareil, vivent dans des coffres protégés par le matériel (mobile) ou un coffre chiffré (extension), et n'en sortent jamais.
2. **Rien sans consentement** — chaque connexion est par origine, chaque signature est approuvée individuellement (biométrie sur mobile), et les charges utiles sont toujours décodées avant signature — ce que QoreX ne sait pas décoder, il le refuse.
3. **Sécurité post-quantique par défaut** — les transferts QOR sur la voie Native portent toujours ML-DSA-87 + secp256k1 ; tout élément classique est signalé, jamais silencieux.
4. **Aucune analytique, aucun suivi, aucune publicité.** La connexion de compte optionnelle et les notifications push n'utilisent un serveur que lorsque vous les activez, et sont couvertes par la [politique de confidentialité QoreChain](https://qorechain.io/privacy).
5. **Voies de récupération** — phrase de 24 mots (toujours), récupération sociale avec gardiens + verrouillage temporel de 48h (optionnel), héritage Legacy (optionnel), liaison d'appareil (commodité).
