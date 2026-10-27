---
slug: /qorex/getting-started
title: Démarrer avec QoreX
sidebar_label: Démarrer
sidebar_position: 2
---

# Démarrer avec QoreX

L'**application mobile QoreX** (iOS et Android) est le portefeuille QoreChain complet dans votre poche. Elle s'adresse à toute personne qui veut détenir et envoyer des QOR, staker, payer quelqu'un par @handle, détenir des actifs sur d'autres réseaux et disposer d'un plan de récupération qui ne dépend pas d'une entreprise. Cette page décrit l'installation de l'application ainsi que la création, la restauration ou la liaison de votre portefeuille. Pour le portefeuille de bureau, consultez l'[Extension de navigateur](/qorex/browser-extension) ; pour toute la famille, consultez la [vue d'ensemble](/qorex/overview).

## Innovations {#innovations}

- **Des clés qui ne quittent jamais l'appareil.** Les 24 mots sont générés sur le téléphone et scellés dans un coffre matériel protégé par la biométrie (Secure Enclave sur iOS, StrongBox sur Android). La signature exige toujours votre biométrie ou votre code PIN.
- **Lane native à signature hybride.** Chaque transfert QOR natif est signé deux fois : avec une clé classique et avec ML-DSA-87 (FIPS 204).
- **Clé ML-DSA-87 issue des mêmes 24 mots.** `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)` la dérive de façon déterministe, il n'y a donc pas de seconde sauvegarde. La dérivation est publiée dans [QoreSign](/qoresign/overview). La clé est enregistrée automatiquement sur la chaîne avec votre première transaction.
- **Une vérification après chaque diffusion.** Le portefeuille lit la transaction validée et vous avertit si la couche ML-DSA-87 est absente.
- **Fenêtre d'accès EVM.** QoreX ouvre, affiche et ferme la fenêtre qui permet à un compte de type Ethereum d'envoyer sur la lane EVM. Voir [Sécurité et récupération](/qorex/security-and-recovery#evm-window).
- **@handles avec épinglage.** Deux signatures lient un nom à une adresse ; la première adresse résolue est épinglée et tout changement silencieux est signalé.
- **Une récupération sans entreprise.** Récupération sociale (parts chiffrées, 2 sur 3, délai de 48 heures), Legacy (un dispositif d'homme mort sur vos garants) et liaison d'appareils. Voir [Sécurité et récupération](/qorex/security-and-recovery).
- **Q-Day Scanner.** Un rapport d'exposition pour n'importe quelle adresse Bitcoin ou Ethereum.
- **Notifications push et widget sobres.** Le push ne communique au serveur que vos adresses publiques, et la notification indique seulement « QOR received ». Le widget affiche le solde en QOR du compte utilisé.

## Comment y accéder {#how-to-access}

:::note Disponibilité mobile
- **Android** : Google Play (Android 7.0 ou version ultérieure) : https://play.google.com/store/apps/details?id=network.qore.qorex
- **iOS** : l'App Store (iOS 15.1 ou version ultérieure) : https://apps.apple.com/us/app/qorex-wallet/id6791256626
:::

Les versions actuelles sont listées sous [Quelle version est disponible où](/qorex/overview#versions). L'application est gratuite et ne nécessite aucun compte. Le mainnet `qorechain-vladi` est le réseau par défaut ; **Paramètres → Use testnet (developers)** bascule sur `qorechain-diana`. L'envoi et le staking paient les frais de réseau normaux (plancher de 0,1 uqor par gaz). L'application existe en 10 langues, dont l'arabe avec mise en page de droite à gauche, et suit la langue du téléphone.

## Comment l'utiliser {#how-to-use}

Les étapes ci-dessous couvrent la configuration d'un portefeuille. Pour l'usage au quotidien, consultez [Envoyer et recevoir](/qorex/send-and-receive), [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking), [Sécurité et récupération](/qorex/security-and-recovery) et le [navigateur de dApps](/qorex/dapp-browser).

## Avant de commencer : sécurisez votre appareil

Un portefeuille QoreX ne peut être créé ou importé que si votre appareil dispose d'un **facteur de déverrouillage fort** configuré. C'est ce qui protège vos clés dans le coffre matériel. L'un des éléments suivants suffit :

- **iOS** - Face ID ou Touch ID.
- **Android** - une donnée biométrique de classe 3 (empreinte digitale, iris ou déverrouillage facial 3D) **ou** un verrouillage d'écran de l'appareil (PIN, schéma ou mot de passe).

:::note Déverrouillage facial 2D sur Android
Le déverrouillage facial 2D par caméra (présent sur certains appareils, par exemple certains modèles Samsung) est considéré comme une donnée biométrique *faible*. Si c'est tout ce dont vous disposez, QoreX s'appuie sur le **PIN / schéma** placé derrière - et la fenêtre système le propose automatiquement, vous restez donc protégé.
:::

Si aucun facteur fort n'est enregistré, les boutons de création/importation restent désactivés et l'écran explique ce qu'il faut activer. Configurez Face ID, une empreinte digitale ou un verrouillage d'écran dans les paramètres de votre système, puis revenez dans QoreX.

## Premier lancement

L'application s'ouvre sur l'écran d'accueil de configuration **uniquement si aucun portefeuille n'existe sur l'appareil**. Une fois votre portefeuille en place, chaque lancement ultérieur vous amène directement à l'onglet Accueil (Portefeuille). Consulter les soldes ne nécessite aucune biométrie ; **signer une transaction en exige toujours une**.

Vous disposez de trois façons de démarrer :

### 1. Créer un nouveau portefeuille

1. Appuyez sur **Créer un nouveau portefeuille**.
2. QoreX génère une **phrase de récupération de 24 mots** sur votre appareil (entropie de 256 bits), la scelle directement dans le coffre matériel protégé par la biométrie, et dérive votre identité QoreChain - coin type 118, une adresse `qor1…` (vos comptes ETH et SOL proviennent de la même graine). **L'application ne vous montre pas la phrase pendant qu'elle crée le portefeuille.**
3. **Révélez la phrase et notez-la immédiatement :** ouvrez **Paramètres → Sécurité → Révéler la phrase de récupération**, confirmez avec la biométrie ou le code PIN de votre appareil, et recopiez les 24 mots sur papier, dans l'ordre. Conservez-les hors ligne. Cette phrase est le **seul** moyen de récupérer votre portefeuille si vous perdez l'appareil.
4. Configurez éventuellement la [récupération sociale](/qorex/security-and-recovery#social-recovery). Notez que la carte **État de la sauvegarde** de l'accueil ne suit que la récupération sociale - elle ne peut pas savoir si vous avez noté la phrase, et ne vous le rappellera donc pas.

:::danger Faites l'étape 3 maintenant - rien dans l'application ne vous le rappellera
Comme l'application passe directement à l'accueil après la création du portefeuille, il est facile de continuer sans jamais avoir noté la phrase. **Faites-le avant de recevoir ou d'envoyer quoi que ce soit.** Si vous perdez ou désinstallez l'application, ou perdez le téléphone, sans la phrase notée ni [récupération sociale](/qorex/security-and-recovery#social-recovery) configurée, personne - y compris QoreChain Association - ne pourra récupérer vos fonds.
:::

:::caution Votre phrase de récupération est essentielle
Toute personne détenant vos 24 mots contrôle vos fonds, et personne - y compris QoreChain Association - ne peut les récupérer à votre place. Ne saisissez jamais votre phrase sur un site web, ne la partagez pas et ne la stockez pas dans une capture d'écran ou une note dans le cloud. **Désinstaller QoreX supprime les clés stockées sur cet appareil** - sans votre phrase écrite (ou sans [récupération sociale](/qorex/security-and-recovery#social-recovery) configurée au préalable), une désinstallation entraîne une perte d'accès définitive. Faites votre sauvegarde avant d'alimenter le portefeuille, pas après.
:::

### 2. Restaurer un portefeuille existant {#2-restore-an-existing-wallet}

1. Appuyez sur **Restaurer un portefeuille existant**.
2. Choisissez **Phrase de récupération** (si vous avez noté vos 24 mots) ou **Récupération sociale** (si vous avez configuré des garants et que vous n'avez plus la phrase - voir [Récupération sociale](/qorex/security-and-recovery#social-recovery)).
3. Pour le parcours par phrase de récupération : saisissez vos 24 mots dans l'ordre. QoreX normalise la casse et les espaces superflus, vérifie la phrase et vous indique clairement si un mot ne correspond pas, plutôt que d'afficher une erreur générique.
4. QoreX dérive à nouveau les mêmes adresses - votre portefeuille est identique sur n'importe quel appareil.

:::note Les comptes supplémentaires reviennent un par un
La restauration à partir de la phrase ramène le **Compte 1**. Si vous utilisiez plusieurs comptes dans l'ancien portefeuille, appuyez sur **Ajouter un compte** (Paramètres → Vos comptes) pour récupérer les suivants - ils sont dérivés de la même phrase et réapparaissent donc aux mêmes adresses. Les comptes de type Ethereum s'ajoutent avec **Ajouter un compte Ethereum (coin 60)** ; voir [Restaurer une phrase depuis MetaMask ou le Dashboard](#restore-dashboard). Ajoutez-les dans le même ordre que celui dans lequel vous les aviez créés dans l'ancien portefeuille : les comptes sont numérotés par emplacement, et un ordre différent sur un nouvel appareil peut donner un autre compte à un emplacement donné.
:::

### 3. Lier depuis un autre appareil

Si vous avez déjà QoreX sur un autre téléphone ou une tablette, vous pouvez transférer le portefeuille **sans serveur et sans rien saisir** - voir [Lier un nouvel appareil](/qorex/security-and-recovery#link-device). Choisissez **Lier depuis un autre appareil** sur le nouvel appareil pour commencer.

## Plusieurs portefeuilles sur un même appareil {#several-wallets}

Chaque portefeuille a sa **propre phrase de récupération**. Vous pouvez en conserver plusieurs sur un même téléphone - par exemple votre portefeuille principal et un autre restauré depuis un autre service - et passer de l'un à l'autre d'une simple pression.

- **Mobile :** Paramètres → **Portefeuilles** liste les portefeuilles présents sur ce téléphone. Appuyez sur l'un d'eux pour en faire le portefeuille actif - toute l'application bascule dessus (rien ne bouge sur la chaîne). **Ajouter un portefeuille** vous permet d'en créer un nouveau, d'en restaurer un à partir de sa phrase de récupération ou d'en lier un depuis un autre appareil ; les portefeuilles que vous avez déjà restent en place. Restaurer une phrase déjà présente sur le téléphone revient simplement à basculer dessus.
- **Extension :** l'écran **Portefeuilles** de la fenêtre contextuelle fait de même, avec **un seul mot de passe** pour l'ensemble. Ajouter ou supprimer un portefeuille demande une fois votre mot de passe, pour resceller le coffre, et désactive le déverrouillage par passkey (réactivez-le depuis l'écran d'accueil).
- **Supprimer un portefeuille** (*Supprimer de ce téléphone* / *Supprimer de ce navigateur*) efface la clé de ce portefeuille de l'appareil. Vos fonds restent sur la chaîne, mais seule sa phrase de récupération peut le ramener - notez-la d'abord.

## Restaurer une phrase depuis MetaMask ou le Dashboard {#restore-dashboard}

Par défaut, QoreX dérive votre adresse `qor1…` à partir d'une phrase de récupération sur le coin type **118**. Une phrase d'abord utilisée dans MetaMask - ou dans un portefeuille créé sur le Dashboard QoreChain - conserve ses QOR à une adresse de **type Ethereum** (coin type **60**) ; la restaurer affiche donc un **Compte 1** vide. Rien n'est perdu ; ajoutez le compte de type Ethereum :

1. Mettez à jour QoreX vers la version actuelle depuis votre store.
2. **Ajoutez un portefeuille** (Paramètres → Portefeuilles → *Ajouter un portefeuille* → *Restaurer un portefeuille existant*) et saisissez la phrase. Votre portefeuille existant reste en place. Dans l'extension : **Portefeuilles** → restaurer.
3. Ouvrez Paramètres → **Vos comptes** et appuyez sur **Ajouter un compte Ethereum (coin 60)**. La première pression ajoute le compte à l'index 0 - la même adresse `0x…` que MetaMask affiche pour ces mots, et la même clé que votre adresse QoreChain `qor1…` pour ce compte. Vos QOR s'y trouvent.
4. Passez sur ce compte (il est libellé *Ethereum · coin 60*). Vous pouvez en envoyer, staker et réclamer des fonds. Le premier envoi enregistre aussi la clé ML-DSA-87 de ce compte, ce qui entraîne de faibles frais uniques.

Un compte de type Ethereum n'a pas de @handle (les handles se réclament sur un compte QoreChain `qor1…` au coin type 118), et les sites web signent avec lui via `signAndBroadcast` plutôt que `signDirect`. C'est aussi le type de compte pour lequel la [fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window) compte : MetaMask signe avec la même clé, de sorte que les transactions MetaMask peuvent déplacer ses QOR une fois une fenêtre ouverte. Chaque pression sur **Ajouter un compte Ethereum (coin 60)** ajoute l'index suivant.

## Se repérer {#find-your-way}

- **Recherche** - la loupe en haut de l'accueil recherche des écrans (« stake »), des jetons (« USDC »), des personnes (un @handle ou une adresse), des mémos et le début d'un hash de transaction ; saisir un @handle ou une adresse `qor1…` propose directement **Envoyer des QOR à …**.
- **Visite guidée** - la première fois qu'un portefeuille s'ouvre sur l'accueil, cinq courtes cartes expliquent ce que fait QoreX et où se trouvent les choses. Elle ne s'exécute qu'une fois ; rejouez-la depuis Paramètres → **Refaire la visite**.

## Facultatif : réclamer un @handle

Une fois votre portefeuille créé, vous pouvez réclamer un **@handle** unique (par exemple `@liviu`) afin que l'on puisse vous envoyer des fonds par nom plutôt qu'à une adresse `qor1…`. La réclamation nécessite un [compte connecté](/qorex/account-and-dashboard#sign-in) et se fait **dans l'application mobile** (l'extension de navigateur vous y renvoie). C'est facultatif et vous pouvez passer cette étape - votre portefeuille n'en dépend jamais. Un handle est associé à une adresse précise plutôt qu'au portefeuille dans son ensemble, ce qui compte dès que vous avez plus d'un compte - voir [Plusieurs comptes issus d'une seule phrase](/qorex/account-and-dashboard#accounts) et [@handle](/qorex/account-and-dashboard#handle).

## Langue

QoreX est disponible en dix langues - anglais, roumain, allemand, espagnol, français, italien, turc, arabe, japonais et coréen - et suit automatiquement la langue de votre téléphone, avec repli sur l'anglais pour toute autre langue. Vous pouvez modifier la langue détectée à tout moment depuis **Paramètres → Langue** ; le choix de l'arabe bascule aussi l'interface en mode droite-à-gauche.

## Étapes suivantes

- [Envoyer et recevoir](/qorex/send-and-receive) - effectuez votre premier transfert à signature hybride.
- [Sécurité et récupération](/qorex/security-and-recovery) - configurez la récupération sociale pour ne jamais rester bloqué.
- [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking) - suivez vos actifs et gagnez des récompenses de staking.

## Où il est publié {#where-published}

| Store | Fiche | Lien |
|---|---|---|
| App Store (iOS) | **QoreX** | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6791256626) |
| Google Play (Android) | `network.qore.qorex` | [play.google.com](https://play.google.com/store/apps/details?id=network.qore.qorex) |

Le code source de l'application mobile n'est pas public. Installez-la toujours depuis la fiche officielle.

## Limites et problèmes connus {#limits}

- **Le swap n'est pas disponible** : il est désactivé tant qu'il n'existe pas de liquidité dans les pools, et n'est pas affiché sur iOS.
- **Les signataires liés** (Phantom ou MetaMask comme clé liée avec des limites de dépense) ne sont pas encore disponibles dans QoreX.
- **La rotation de clé** de votre clé ML-DSA-87 n'est pas encore disponible dans QoreX.
- **L'application ne montre pas la phrase pendant qu'elle crée le portefeuille.** Révélez-la aussitôt depuis Paramètres → Sécurité. La carte État de la sauvegarde ne suit que la récupération sociale.
- **Les transferts EVM et SVM ne sont pas couverts par la signature hybride.** Une transaction EVM ne porte qu'une signature secp256k1 et nécessite une fenêtre d'accès ouverte ; les transferts sur des réseaux externes sont uniquement classiques.
- **Le push** n'existe que sur mainnet ; sur iPhone, considérez-le comme un service au mieux.
- Un portefeuille perdu, sans phrase notée et sans récupération sociale, ne peut être récupéré par personne.
