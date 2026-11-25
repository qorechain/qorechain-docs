---
slug: /qorex/browser-extension
title: Extension navigateur QoreX
sidebar_label: Extension navigateur
sidebar_position: 2
---

# Extension navigateur QoreX

L'**extension navigateur** QoreX est le portefeuille QoreChain de bureau. C'est un **portefeuille autonome** (créez ou importez un portefeuille, détenez, envoyez et stakez des QOR, et connectez-vous à des dApps) et c'est elle qui permet à n'importe quel site web de découvrir QoreX et de transformer chaque requête en une approbation explicite et décodée. Elle s'adresse à toute personne qui utilise QoreChain depuis un navigateur de bureau, et aux développeurs qui veulent que leur application web fonctionne avec un portefeuille QoreChain.

Elle est **en ligne et publique** sur trois stores (Chrome, Firefox et Safari), qui proposent tous l'extension 0.4.4. Voir [quelle version est en ligne et où](#versions).

## Innovations {#innovations}

- **`signAndBroadcast`.** Une dApp envoie des messages ; le portefeuille montre chaque message décodé et les frais, puis ajoute la couche ML-DSA-87 que seul le portefeuille peut produire, et diffuse. Une page ne détient jamais la clé ML-DSA-87.
- **`signDirect` vérifie la couche par rapport à la clé enregistrée.** Si une dApp attache elle-même une couche ML-DSA-87, QoreX la vérifie par rapport à la clé enregistrée on-chain pour le compte avant l'ouverture de toute fenêtre d'approbation. Si la transaction ne porte aucune couche, QoreX l'ajoute. `signAndBroadcast` reste la voie la plus simple (voir [Envoyer une transaction QoreChain](#sign-and-broadcast)).
- **Une surface d'autorisations réduite.** L'extension déclare `storage`, plus (dans Chrome et Firefox) `nativeMessaging` pour l'outil facultatif Agents IA du Mode développeur. Il n'y a aucune autorisation d'hôte, et aucun code d'analyse d'audience, de rapport de plantage ou de suivi. Voir [Quelles autorisations QoreX demande](#permissions).
- **Coffre-fort scellé.** Le coffre-fort est chiffré avec AES-256-GCM sous une clé dérivée du mot de passe (Argon2id). Là où le navigateur expose WebAuthn PRF (Chrome et Edge), vous pouvez déverrouiller avec une clé d'accès à la place ; le mot de passe reste toujours une solution de repli.
- **Découverte sans prise de contrôle.** QoreX s'annonce via EIP-6963 (`rdns` `network.qore.qorex`) et le Solana Wallet Standard. Il n'écrase jamais `window.ethereum` ni `window.keplr`.
- **Approbations par origine, identifiées par le navigateur.** Le site est l'origine que le navigateur lui-même atteste, jamais ce que la requête prétend. Une requête qui répète un champ pour pouvoir être lue de deux façons est refusée.
- **Un portefeuille verrouillé demande votre mot de passe, pas de recommencer.** Une demande de signature d'un site faite alors que QoreX est verrouillé ouvre l'écran du mot de passe et nomme le site ; après le déverrouillage, la demande affiche sa propre approbation. Rien n'est signé sans le mot de passe.
- **Une vérification avant chaque transfert.** Le formulaire d'envoi mène à un écran de vérification avec le destinataire complet, les frais et les avertissements, et seulement ensuite à la signature.
- **Historique avec export CSV**, par compte, chaque transaction étant en attente, confirmée ou échouée selon ce que rapporte la chaîne.
- **Demandes de paiement, contacts, La protection de mon argent et Assistance** dans la fenêtre de l'extension. Voir [Demandes de paiement](#pay-requests), [Contacts](#contacts) et [La protection de mon argent](#protection).
- **Mode développeur avec 17 outils.** Un seul bouton **Outils développeur** les ouvre tous sur leur propre page. Voir [Mode développeur](/qorex/developer-mode).

## Comment l'utiliser {#how-to-use}

1. Installez l'extension (voir [Comment y accéder](#how-to-access)) et ouvrez le popup.
2. Choisissez **Créer un nouveau portefeuille** (un mot de passe, puis 24 mots affichés une seule fois) ou **Importer une phrase de récupération**. Voir [Créer ou restaurer un portefeuille](#wallet). Choisissez ensuite une réponse à **Que veux-tu faire en premier ?** ou passez cette étape.
3. Utilisez **Envoyer**, **Recevoir**, **Staker des QOR**, **Historique** et **Coins et tokens** dans la fenêtre de l'extension. Voir [Envoyer des QOR](#send), [Historique](#history), [Staker depuis l'extension](#stake) et [Envoyer sur les réseaux externes](#send-external).
4. Ouvrez une dApp. La première connexion affiche une approbation avec l'origine du site ; l'approbation ne révèle que votre adresse publique. Révoquez n'importe quel site sous [Sites connectés](#connected-sites).
5. En tant que développeur, détectez QoreX avec EIP-6963 et envoyez une transaction avec `signAndBroadcast`. Voir [Connecter une dApp à QoreX](#connect) et [Envoyer une transaction QoreChain depuis une dApp](#sign-and-broadcast).

## Comment y accéder {#how-to-access}

Il vous faut un navigateur de bureau, et rien d'autre : ni compte, ni inscription, ni app mobile. Des frais de réseau s'appliquent lorsque vous envoyez ou stakez (le plancher du réseau est de 0.1 uqor par gas). L'extension suit le réseau sur lequel elle est configurée ; le mainnet `qorechain-vladi` est le réseau par défaut.

### Installation {#install}

| Navigateur | Installation |
|---|---|
| **Chrome et navigateurs Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 ou ultérieur) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 ou ultérieur)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

Installez toujours depuis l'une de ces fiches.

### Quelle version est en ligne où {#versions}

Version actuelle sur chaque store :

| Boutique | Version actuelle |
|---|---|
| Chrome Web Store | 0.4.4 |
| Firefox Add-ons | 0.4.4 |
| Safari (Mac App Store, application macOS **QoreX Wallet**) | 1.8.2, intégrant l'extension 0.4.4 (le Mac App Store utilise sa propre numérotation `1.x`) |

Les revues des boutiques n'arrivent pas au même moment, donc une boutique peut servir une version plus ancienne qu'une autre ; la fiche de la boutique affiche toujours sa version actuelle. Voir aussi [Quelle version est en ligne où](/qorex/overview#versions).

L'extension 0.4.x ajoute le [verrouillage automatique](#unlock), une [vérification avant chaque transfert](#send), l'[Historique avec export CSV](#history), les [demandes de paiement](#pay-requests), les [contacts](#contacts), [La protection de mon argent](#protection), la [réparation, le changement de la clé post-quantique et la multisignature](#pqc-care), des [écrans de staking](#stake) séparés, un [écran Recevoir qui commence par la cryptomonnaie](#receive), la [signature EVM pour les dApps](#standards), des [fenêtres d'accès EVM plus sûres](#evm-window) et les [Outils développeur](#developer-tools). La liste complète par version se trouve dans [Ce qu'ajoutent les versions 1.2.5 / 0.4.4](/qorex/overview#whats-new-125) et dans les listes qui suivent.

Depuis la 0.2.6, l'extension a aussi gagné : [plusieurs portefeuilles avec un seul mot de passe](#wallets), un [compte de style Ethereum que vous ajoutez à la main](#coin60), [Réclamer et redéléguer](#stake), une liste **Retraits de staking en cours**, l'[ajout d'un jeton par contrat](#custom-tokens), [Recevoir sur n'importe quel réseau](#receive), [Sites connectés avec Révoquer](#connected-sites), la [fenêtre d'accès EVM](#evm-window), [`signAndBroadcast` pour les dApps](#sign-and-broadcast), et des écrans d'approbation qui affichent chaque message, les frais et l'expiration.

**La surface de permissions n'a pas changé depuis la 0.1.3.** Voir [Quelles permissions QoreX demande](#permissions).

:::note
Sur Safari, les approbations s'ouvrent dans un onglet du navigateur plutôt que dans une fenêtre contextuelle. L'extension est empaquetée avec l'enveloppe d'extension web Safari d'Apple à partir du même code source. L'outil **Agents IA** du Mode développeur n'est pas disponible dans Safari.
:::

## Créer ou restaurer un portefeuille {#wallet}

Ouvrez le popup et choisissez :

- **Créer un nouveau portefeuille** - choisissez un mot de passe (au moins 8 caractères) ; QoreX génère une nouvelle phrase de récupération de 24 mots sur votre appareil (entropie 256 bits), dérive votre identité QoreChain, et la scelle dans le coffre-fort sous ce mot de passe (et, en option, une clé d'accès - voir [Sécurité](#security)). Les 24 mots ne sont affichés qu'**une seule fois** - notez-les, cochez *J'ai conservé ma phrase de récupération en lieu sûr*, puis continuez. Vous pouvez les afficher de nouveau plus tard avec **Révéler la phrase de récupération** dans le popup (mot de passe requis).
- **Vérifie ta sauvegarde** - juste après que vous avez confirmé avoir enregistré la phrase, QoreX vous demande de saisir trois de ses mots, à des positions aléatoires, tels que vous les avez notés. Si l'un d'eux ne correspond pas, regardez votre papier et réessayez. Vous pouvez choisir **Vérifier plus tard** ; ensuite, **Vérifier ma sauvegarde** demande votre mot de passe et n'affiche pas la phrase, car il s'agit justement de contrôler votre copie écrite.
- **Importer une phrase de récupération** - restaure à partir d'une phrase existante. Une phrase de moins de 24 mots restaure normalement vos fonds, mais QoreX vous avertit que votre clé ML-DSA-87 n'a alors que la robustesse de la phrase ; pour une robustesse maximale, créez un nouveau portefeuille de 24 mots et déplacez-y vos fonds.

:::danger Notez la phrase avant de continuer
Le coffre-fort de l'extension n'existe que dans ce navigateur. **Supprimer l'extension, effacer ses données ou réinitialiser le navigateur supprime vos clés**, et personne - y compris QoreChain Association - ne peut les restaurer. Sans vos 24 mots notés, vos fonds sont perdus à jamais. Voir [Sauvegarder maintenant](/qorex/security-and-recovery#back-up-now).
:::

Après la création ou l'importation, QoreX demande une fois **Que veux-tu faire en premier ?**. Dans l'extension, **Je veux recevoir de l'argent** vous guide à travers la cryptomonnaie, son adresse et un lien de paiement ; **Je veux envoyer de l'argent** à travers l'approvisionnement du portefeuille, la note sur le @handle (les handles se réservent dans l'application) et votre premier paiement, avec l'explication des frais ; **Je veux garder mes cryptos en sécurité** affiche votre adresse de dépôt et la vérification de la sauvegarde. Touchez **Passer pour l'instant** pour passer ; **Que veux-tu faire ?** sur l'accueil de la fenêtre le rouvre.

L'extension détient ses propres clés ; elle ne nécessite pas l'app mobile. Les clés ne quittent jamais l'appareil.

## Déverrouillage et verrouillage automatique {#unlock}

- **Déverrouiller** - saisissez votre mot de passe et appuyez sur **Entrée** ou touchez **Déverrouiller**. Le bouton montre qu'il travaille (la dérivation de la clé du coffre est volontairement lente). **Mot de passe incorrect.** n'apparaît que pour un mauvais mot de passe ; tout autre échec est nommé. Là où le [déverrouillage par passkey](#security) est activé, vous pouvez utiliser **Déverrouiller avec une passkey**.
- **Verrouillage automatique** - sur l'accueil de la fenêtre, **Verrouiller automatiquement après** définit combien de temps QoreX reste ouvert sans utilisation : 1, 5, 15, 30, 60 ou 240 minutes (affichées en minutes ou en heures). La valeur par défaut est de 15 minutes.
- **Verrouiller** - le bouton **Verrouiller** sur l'accueil de la fenêtre verrouille immédiatement ; l'écran suivant demande votre mot de passe.
- **Un site fait une demande alors que vous êtes verrouillé** - une demande de signature d'un site (native, EVM ou Solana) ouvre QoreX sur l'écran du mot de passe, en nommant le site. Après le déverrouillage, cette fenêtre se ferme et la demande affiche sa propre approbation. Si vous fermez la fenêtre à la place, la demande est refusée et rien n'est signé.

## Plusieurs portefeuilles et comptes {#wallets}

- **Portefeuilles** (depuis la 0.3.3) - l'écran **Portefeuilles** du popup (« Portefeuilles dans ce navigateur ») liste tous les portefeuilles de ce navigateur. Chacun a sa propre phrase de récupération ; **un seul mot de passe** les déverrouille tous, et changer de portefeuille modifie celui que QoreX affiche et avec lequel il signe (rien ne bouge sur la chaîne). **Ajoutez** un portefeuille en en créant un nouveau (sa phrase est affichée une seule fois) ou en en restaurant un ; votre mot de passe est demandé une fois pour resceller le coffre-fort. Ajouter ou supprimer un portefeuille désactive le **déverrouillage par clé d'accès** - réactivez-le depuis l'écran d'accueil. Pour en supprimer un, appuyez sur *Supprimer de ce navigateur* et saisissez votre mot de passe ; le dernier portefeuille ne peut pas être supprimé depuis cet écran. La suppression efface cette clé du navigateur - seule sa phrase de récupération la ramène.
- **Comptes** (depuis la 0.2.2) - **Vos comptes** crée plusieurs comptes à partir de la même phrase et permet de basculer entre eux (jusqu'à 20 par portefeuille ; ils sont numérotés et ne peuvent pas être renommés). Restaurer la phrase que vous avez notée ramène le **Compte 1** ; ajoutez de nouveau les autres avec **Ajouter un compte**. Changer de compte déplace tout avec lui : l'envoi, le staking, la réception et votre @handle suivent le compte actif.

### Compte de type Ethereum {#coin60}

Depuis la 0.3.2, **Ajouter un compte Ethereum (coin 60)** (sur l'écran **Tes comptes**) ajoute le compte correspondant à une phrase d'abord utilisée dans MetaMask ou sur le Dashboard ; voir [Restaurer une phrase de MetaMask ou du Dashboard](/qorex/getting-started#restore-dashboard). Son adresse 0x est celle que MetaMask affiche pour les mêmes mots. Les handles ne sont pas proposés sur ce compte. À partir de l'extension 0.3.9, vous pouvez staker depuis ce compte dans l'extension.

Le portefeuille d'actifs, le Q-Day Scanner, la récupération sociale, le Legacy Protocol, la connexion au compte et la liaison d'appareils restent réservés au mobile - voir [QoreX Wallet](/qorex/overview#platform-availability).

## Votre compte, solde et @handle {#account}

L'écran d'accueil du popup affiche votre adresse `qor1…` (appuyez pour copier) et votre solde QOR en direct, afin que vous n'ayez pas besoin d'ouvrir un explorateur de blocs pour vérifier l'un ou l'autre.

### Soldes en vesting (verrouillés) {#vesting}

Si votre compte détient des QOR en vesting (par exemple une allocation TGE non encore libérée), le solde se divise en **disponible maintenant** et **encore verrouillé**, et un envoi qui dépasse le montant disponible est refusé avant d'atteindre le réseau plutôt que d'échouer sur la chaîne après avoir prélevé des frais. QoreX ne montre délibérément **pas** de « prochaine date de déblocage » ici : un calendrier de vesting peut être modifié par la gouvernance, donc une date sur la carte de solde se lirait comme une promesse que QoreX ne peut pas garantir. La répartition disponible-contre-verrouillé est ce qui reste exact.

### Réclamer un @handle

Réclamer un **@handle** unique (par exemple `@liviu`) nécessite un **compte connecté** et se fait **dans l'app mobile** ; l'extension vous y renvoie et ne réclame pas elle-même de handles. Une fois réclamé, le handle se lie à cette adresse, de sorte que l'extension le résout lorsque vous le payez et que d'autres peuvent vous payer par votre nom. Voir [@handle](/qorex/account-and-dashboard#handle) pour savoir comment les handles sont liés aux adresses (et non à un portefeuille dans son ensemble).

## Envoyer des QOR {#send}

1. Ouvrez le popup et appuyez sur **Envoyer**.
2. Saisissez le destinataire (adresse `qor1…` ou @handle), le montant et un mémo facultatif. Les [favoris](#contacts) apparaissent sur le formulaire sous forme de pastilles accessibles en un toucher.
3. **Vérifiez le transfert.** L'écran de vérification affiche le destinataire en entier (et le nom du contact, s'il s'agit d'un contact enregistré), le montant et le mémo. S'il s'agit de la première transaction du compte, il affiche aussi les frais uniques d'enregistrement de la clé ML-DSA-87 et le total.
4. Lisez tout avertissement. QoreX vous indique quand il s'agit du premier paiement vers cette adresse depuis ce portefeuille, quand l'adresse ne fait que **ressembler** à une adresse que vous avez déjà payée ou enregistrée (comparez chaque caractère ; il faut un second toucher, **Touchez à nouveau pour envoyer quand même à cette adresse**), et quand les frais de réseau dépassent le montant que vous envoyez.
5. Touchez **Confirmer et envoyer**. QoreX signe avec la signature hybride et envoie.

Disponible sur le mainnet et le testnet. Une transaction dépassant la limite de gaz par transaction du réseau est refusée avant toute signature.

## Envoyer vers un @handle {#handle-send}

Depuis la 0.1.9, vous pouvez payer un @handle enregistré directement au lieu de rechercher une adresse (les recherches étaient interrompues par un défaut dans les versions jusqu'à la 0.3.6 et fonctionnent de nouveau à partir de la 0.3.7) :

1. Ouvrez le popup et appuyez sur **Envoyer**.
2. Dans le champ destinataire, tapez `@` suivi du handle (par exemple `@liviu`) au lieu d'une adresse `qor1…`.
3. QoreX résout le handle et vous montre l'**adresse résolue** avant que vous signiez quoi que ce soit - vérifiez toujours cela par rapport à ce que vous attendez.
4. Saisissez le montant, contrôlez l'[écran de vérification](#send) et confirmez.

La résolution est vérifiée de deux façons avant que QoreX ne l'utilise : une attestation de registre vérifiée par rapport à une clé de confiance intégrée à l'extension, et la signature propre du détenteur du handle sur la réclamation. Une réponse qui échoue à l'une ou l'autre vérification est rejetée d'emblée - QoreX ne se rabat pas sur l'affichage d'une adresse non vérifiée. La première fois que vous payez un handle donné, QoreX mémorise (épingle) l'adresse vers laquelle il a résolu ; si ce handle résout plus tard vers une adresse **différente**, QoreX s'arrête et vous montre l'ancienne et la nouvelle adresse en entier afin que vous puissiez décider de continuer ou non. Cette mémoire vit **par navigateur** - payer le même handle pour la première fois depuis un navigateur ou un ordinateur différent l'affichera là aussi comme nouveau. C'est normal, pas une erreur.

## Recevoir {#receive}

Touchez **Recevoir** dans la fenêtre de l'extension. L'écran **commence par la cryptomonnaie** :

1. **Choisissez la cryptomonnaie à recevoir** - une liste consultable (**Rechercher une cryptomonnaie ou un réseau**) avec QOR en premier, puis la cryptomonnaie propre à chaque réseau et les jetons inclus, chacun avec son image et celle de son réseau. Les jetons que vous avez [ajoutés par contrat](#custom-tokens) y figurent aussi. Les images sont livrées avec le portefeuille ; rien n'est donc récupéré auprès d'un tiers pour les afficher.
2. QoreX affiche l'adresse du réseau de cette cryptomonnaie sous forme de code QR avec un bouton de copie, et un avertissement qui nomme la cryptomonnaie : n'envoyez à cette adresse que cette cryptomonnaie, sur ce réseau. Quand une même adresse fonctionne sur plusieurs réseaux (les réseaux EVM), il indique lesquels.
3. **Choisir une autre cryptomonnaie** vous ramène à la liste.

Les réseaux pris en charge sont QoreChain, Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis et Celestia. L'adresse d'un autre réseau est dérivée de votre phrase de récupération ; son affichage peut donc demander une confirmation. Pour Cosmos Hub, Osmosis et Celestia, QoreX affiche l'adresse depuis laquelle vos envois sur ces réseaux sont signés.

## Historique {#history}

Touchez **Historique** sur l'accueil de la fenêtre pour voir ce qui s'est passé sur le compte :

- **Tous les types de transaction QoreChain**, pas seulement les envois : envoyé, reçu, staké, retiré du staking, mise déplacée, récompenses réclamées, verrous de staking, fenêtre EVM et changements de clé, avec le montant et les frais. Une transaction EVM indique aussi combien elle a prélevé sur la [fenêtre d'accès EVM](#evm-window).
- **Un état lu sur la chaîne.** Un transfert envoyé depuis cet appareil que l'historique de la chaîne ne montre pas encore est listé comme **En attente : le réseau n'a pas encore confirmé**. Si le réseau ne le trouve pas, QoreX indique qu'il a peut-être échoué ; vérifiez-le donc avant de renvoyer (vous pouvez **Masquer** la ligne). Une transaction échouée est marquée, les frais restant payés.
- **Par compte** - si vous avez plusieurs comptes, choisissez le compte en haut.
- **Répéter le paiement** - remplit à nouveau le formulaire d'envoi à partir d'un paiement passé. Vous le vérifiez et le confirmez toujours.
- **Exporter en CSV** - le fichier est créé sur votre appareil, ne contient que votre historique (ni phrase, ni clés) et est rendu sûr à l'ouverture dans un tableur.

Si le réseau est injoignable, QoreX indique qu'il n'a pas pu charger l'historique ; il ne présente jamais cela comme « aucune transaction ». Pour l'instant, l'historique ne couvre que QoreChain. Il est disponible sur le mainnet et le testnet.

## Demandes de paiement {#pay-requests}

Demandez à quelqu'un un montant en QOR avec un lien qui ne peut pas être modifié sans que cela se voie.

**Demander un paiement :**

1. Ouvrez **Demandes de paiement** sur l'accueil de la fenêtre et créez une **Nouvelle demande** : le montant en QOR, une note facultative (jusqu'à 140 caractères) et, si vous en avez un, le choix d'afficher ou non votre @handle.
2. Touchez **Créer le lien**. QoreX signe la demande avec la clé de votre compte. Copiez le lien avec **Copier le lien** et envoyez-le à la personne qui doit payer.
3. **Mes demandes** les liste. **Vérifier le statut** lit la chaîne et affiche **Payée** ou **Pas encore payée** (ou que le réseau n'a pas répondu). **Réutiliser le mois prochain** crée une nouvelle demande à partir d'une ancienne.

**Payer une demande :**

1. Ouvrez **Payer une demande**, collez le lien et touchez **Ouvrir**.
2. QoreX vérifie la signature, que le signataire possède l'adresse de réception, le réseau exact et tout @handle présent dans la demande. Un lien modifié, un mauvais signataire, un réseau inconnu ou une cryptomonnaie autre que QOR sont refusés. Si la demande concerne l'autre réseau, changez de réseau vous-même ; QoreX ne le fera pas.
3. Touchez **Payer**. Vous obtenez l'[écran de vérification](#send) habituel avant que quoi que ce soit ne soit envoyé. Le paiement porte l'étiquette de la demande dans le mémo ; c'est ainsi que le QoreX du demandeur le retrouve on-chain.

Une demande signée ne nécessite ni compte ni connexion. Une demande du testnet l'indique : les QOR du testnet n'ont aucune valeur. Les formats de liens pour les développeurs se trouvent dans [Intégration dApp](/qorex/dapp-integration).

## Contacts et favoris {#contacts}

**Contacts**, sur l'accueil de la fenêtre, conserve des noms pour les adresses que vous payez, **uniquement sur cet appareil**.

- **Ajouter un contact** - un nom et au moins une adresse : QoreChain (`qor1…`), EVM (`0x…`), Solana ou Cosmos, et un @handle facultatif. Marquez-le comme **Favori** pour le voir sous forme de pastille accessible en un toucher sur le formulaire d'envoi. **Payer &#123;name&#125;** ouvre le formulaire prérempli. La suppression demande deux touchers. La liste contient jusqu'à 200 contacts.
- Les **contacts @handle** indiquent si le handle pointe vers la même adresse que lors de votre dernier paiement, et vous avertissent si son adresse a **changé**.
- **Adresses ressemblantes** - une adresse qui ne fait que ressembler à une adresse que vous connaissez déjà est signalée, les deux étant affichées pour que vous puissiez comparer chaque caractère.

Un contact n'est pas un contrôle de sécurité : chaque paiement affiche toujours l'adresse complète pour vérification.

## La protection de mon argent {#protection}

**La protection de mon argent**, sur l'accueil de la fenêtre, est un écran unique où chaque ligne est vérifiée à l'ouverture, sur votre appareil et sur le réseau. Une vérification qui ne peut pas être lue le dit ; elle ne compte jamais comme « tout va bien » ni comme « aucun ».

- **Sauvegarde vérifiée** et **Récupération testée** - la date, ou **Pas encore**. **Tester ma phrase de récupération** demande trois mots de votre phrase. Ils sont comparés sur votre appareil ; rien de ce que vous saisissez n'est conservé ni envoyé.
- **Applications autorisées** - les sites qui peuvent voir votre adresse et vous demander de signer, avec **Révoquer**.
- **Autorisations accordées sur le réseau** - les autorisations qui permettent à un autre compte d'envoyer en votre nom (authz) ou de dépenser vos QOR en frais de réseau (allocations de frais), les illimitées en premier, avec **Révoquer**. La révocation affiche ce que vous allez signer et les frais, puis vous confirmez.
- **Autorisations de jetons sur l'EVM de QoreChain** - touchez **Vérifier les autorisations de jetons** (leur lecture demande votre phrase une fois). QoreX indique jusqu'où il a vérifié dans le passé ; rouvrez l'écran pour poursuivre la vérification. **Révoquer** envoie `approve(spender, 0)` après avoir ouvert une fenêtre EVM d'une seule transaction, limitée au contrat du jeton. Seul un compte de style Ethereum (coin 60) peut révoquer ici.
- **Protection post-quantique, par voie** - en termes simples : les transactions natives QoreChain portent deux signatures (ML-DSA-87 et classique) ; les transactions EVM sont signées de façon classique et admises uniquement dans une fenêtre que vous avez ouverte avec votre signature post-quantique ; les autres réseaux n'acceptent que les signatures classiques.

Les gardiens et la récupération sociale se trouvent dans l'application mobile. Voir [Sécurité et récupération](/qorex/security-and-recovery).

## Assistance et état du réseau {#help-and-status}

- **Assistance**, sur l'accueil de la fenêtre, liste les seuls canaux officiels : la [communauté Telegram](https://t.me/QorechainCommunity), [Discord](https://discord.gg/qorechain), la [page d'aide](https://qorechain.io/help/qorex), l'e-mail à team@qorechain.io et **Signaler une vulnérabilité**. L'équipe QoreChain ne demande jamais votre phrase de récupération, votre mot de passe ni vos clés. **Afficher le résumé** donne un résumé de diagnostic facultatif (version de l'application, réseau et codes d'erreur, sans phrase, clés, adresses ni soldes), à copier uniquement si l'assistance le demande.
- **Bannière d'état du réseau** - QoreX lit l'heure du dernier bloc de la chaîne. S'il date de plus d'une minute, une bannière indique que le réseau est lent et l'ancienneté du bloc ; si le réseau est injoignable, elle indique que les soldes ne sont peut-être pas à jour. Elle n'affiche rien tant que le réseau va bien.
- **Dernières valeurs connues** - quand le réseau ne répond pas, la fenêtre affiche le dernier solde et les dernières délégations qu'elle a lus, en indiquant de quand ils datent.

## Staker depuis l'extension {#stake}

Depuis la **0.2.2**, la fenêtre de l'extension a son propre écran de staking - un portefeuille créé uniquement dans l'extension n'a pas besoin de l'application mobile pour gagner des récompenses de staking. Ouvrez **Staker des QOR** sur l'accueil de la fenêtre. Il ouvre un **menu** avec une ligne d'explication par action ; chaque action ouvre son propre écran, avec sa propre ligne d'erreur, et **Retour au staking** ramène au menu.

| Écran | Ce qu'il fait |
|---|---|
| **Staker des QOR** | Choisissez un validateur et un montant. Les validateurs actifs sont listés avec leur commission ; les validateurs **jailed** (emprisonnés) sont exclus. Pendant la saisie, QoreX vous avertit si le montant laisserait moins que les frais d'une transaction (vous ne pourriez ni retirer du staking ni réclamer tant que le compte ne détient pas à nouveau des QOR). |
| **Retirer du staking** | Lance la période de déliaison. Le délai avant que les QOR soient à votre disposition est **lu sur le réseau**, et le montant apparaît sous **Retraits de staking en cours** avec le temps restant. |
| **Déplacer la mise** | Redéléguez sans attendre de période de déliaison, en trois étapes : (1) le validateur **De** départ (ceux dont vous ne pouvez pas encore sortir sont grisés, avec la date), (2) les validateurs de destination (**Vers**), (3) **le montant**, avec **Max** et le trajet et la répartition affichés avant la signature. Un déplacement que le réseau refuserait est intercepté avant. Voir [Déplacer la mise entre validateurs](/qorex/portfolio-and-staking#move-stake). |
| **Réclamer** | Collecte les récompenses. Si les frais dépassent les récompenses, le premier toucher vous avertit. |
| **Réclamer et redéléguer** | Réinvestit les récompenses auprès des validateurs qui les ont générées en une seule transaction (jusqu'à 127 validateurs). QoreX vérifie d'abord que vos QOR **non verrouillés** peuvent payer les frais, qui sont réglés avant l'arrivée des récompenses. |
| **Verrouiller pour un bonus** | Verrouillez une partie de votre mise pour 3, 6 ou 12 mois. Voir les [verrous de staking](/qorex/portfolio-and-staking#staking-locks). |
| **Les récompenses vont à** | Envoyez les futures récompenses de staking vers **un autre compte du même portefeuille**, et vers aucune autre adresse. L'écran montre où vont les récompenses actuellement, nomme le nouveau compte en entier au premier toucher et signe au second. Votre mise ne bouge pas. |

Sous le menu, une carte **Le staking, simplement** présente les récompenses gagnées jusqu'ici, ce que coûte le staking (commission du validateur et frais de réseau) et quand arrivent les QOR retirés du staking. Si vous avez plusieurs comptes, choisissez celui qui stake dans le sélecteur de compte. Chaque action est signée avec la signature hybride obligatoire (secp256k1 et ML-DSA-87), comme un envoi, et l'écran indique quand votre première transaction enregistre aussi votre clé. Le taux annuel est lu à partir du chiffre de la chaîne elle-même. Le staking, la délégation et les récompenses se font exclusivement sur la voie **native**, jamais via un précompilé EVM - voir [Staking et délégation](/user-guide/staking-and-delegation).

### Approuver une requête de staking du Dashboard {#stake-dashboard}

Le [Dashboard](/dashboard/staking-and-validators) QoreChain compose les requêtes de staking mais ne peut pas les signer - votre clé ne quitte jamais le coffre-fort de l'extension. Lorsque vous cliquez sur **Continuer dans QoreX** sur le Dashboard, la requête s'ouvre dans l'extension pour que vous la révisiez (validateur et montant) et l'approuviez, exactement comme pour un envoi.

:::note Si une transaction s'affiche comme « rétrogradée » plutôt que réussie
Le Dashboard affiche parfois une transaction comme **rétrogradée** plutôt que comme un succès net. Cela signifie que vos fonds se sont bien déplacés, mais que la couche de signature ML-DSA-87 n'a pas été trouvée sur la chaîne pour cette transaction - ce n'est pas quelque chose que vous avez mal fait, ni quelque chose que vous pouvez corriger de votre côté. C'est un défaut de notre côté ; merci de le signaler au support afin que nous puissions enquêter. Le message reste délibérément affiché à l'écran plutôt que de s'effacer, afin que vous ayez le temps de le lire et de le signaler.
:::

### Envoyer sur des réseaux externes {#send-external}

En plus des QOR sur la voie native, l'écran **Envoyer sur des réseaux externes** de la fenêtre envoie des actifs sur d'autres réseaux, tous dérivés de la même phrase de récupération. Tous les réseaux ci-dessous permettent d'envoyer et de recevoir :

| Type | Réseaux | Jetons intégrés |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Entrées ERC-20 (USDC et USDT sur les chaînes EVM, DAI sur Ethereum) |
| SVM | Solana | Entrées SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC via IBC ; champ mémo optionnel |

1. Choisissez la cryptomonnaie ou le jeton, puis saisissez le destinataire et le montant (et, sur les réseaux Cosmos, un mémo facultatif).
2. Cochez la case de reconnaissance. En anglais, elle indique : **"External networks accept only classical signatures. Unlike your QOR, this transfer has NO ML-DSA-87 signature. I understand."** (les réseaux externes n'acceptent que des signatures classiques ; contrairement à vos QOR, ce transfert n'a aucune signature ML-DSA-87, et vous confirmez l'avoir compris). Les chaînes externes ne peuvent pas porter de signature ML-DSA-87, et QoreX ne le cache jamais.
3. Sur les réseaux EVM, le premier toucher donne un devis des **frais de réseau maximaux** (« Network fee: at most … ») ; le second envoie exactement avec ce devis. Toute modification annule le devis. Si les frais, payés dans la cryptomonnaie que vous envoyez, dépassent le montant, vous êtes averti.
4. Un destinataire qui ne fait que ressembler à une adresse que vous avez déjà payée sur ce réseau est affiché en entier et demande un toucher de plus.

## Standards de portefeuille pris en charge {#standards}

QoreX expose trois interfaces, toutes injectées sur la page en tant que `window.qorex` (`{ evm, native, svm }`) et découvertes via EIP-6963 et le Solana Wallet Standard. Dans une application web, l'[adaptateur de portefeuille](/developer-tools/wallet-adapter) enveloppe cette détection.

| Standard | Ce que c'est | Ce que cela signifie pour vous en tant que développeur |
|---|---|---|
| **EIP-1193** | L'API JavaScript du fournisseur Ethereum (`request(...)`, événements). | Outre les requêtes de compte et de réseau (`eth_requestAccounts`, `eth_accounts`, `eth_chainId`, `wallet_switchEthereumChain`), QoreX signe `personal_sign`, `eth_signTypedData_v4` et `eth_sendTransaction` sur la voie EVM de QoreChain (chain id 9801, testnet 9800) et sur Ethereum. Chaque approbation indique, après décodage sur votre appareil, ce qui est autorisé, et simule d'abord la transaction quand c'est possible. Sur QoreChain, seuls les comptes de style Ethereum (coin 60) peuvent envoyer, et une transaction nécessite une [fenêtre d'accès EVM](#evm-window). Voir [Intégration dApp](/qorex/dapp-integration). |
| **EIP-6963** | Découverte de fournisseur multi-portefeuille (événements announce / request). | QoreX s'annonce aux côtés de tous les autres portefeuilles - il **n'écrase jamais `window.ethereum`** - de sorte que l'utilisateur choisit QoreX par site sans conflit. |
| **Fournisseur natif (style Keplr)** | `window.qorex.native` : `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `getOfflineSigner` (pour cosmjs, cosmos-kit et Interchain Kit), `signArbitrary` / `verifyArbitrary`, plus une liste `capabilities`. Ce n'est **pas** un remplacement direct de Keplr : QoreX ne crée pas d'alias `window.keplr`, et la signature amino et `sendTx` ne sont pas disponibles. | La façon la plus simple d'envoyer une transaction QoreChain est **`signAndBroadcast`** (voir [Envoyer une transaction QoreChain](#sign-and-broadcast)) : QoreX affiche les messages décodés et les frais, ajoute la couche ML-DSA-87 que seul le portefeuille peut produire, et diffuse. Avec `signDirect` ou `getOfflineSigner`, QoreX vérifie la couche que votre page a attachée par rapport à la clé enregistrée du compte, ou ajoute lui-même la couche quand il n'y en a pas. Voir [Intégration dApp](/qorex/dapp-integration). |
| **Solana Wallet Standard** *(depuis la 0.1.5)* | Découverte native de portefeuille pour les dApps Solana (`wallet-standard:register-wallet` / `app-ready`). | Les dApps Solana **détectent automatiquement QoreX** - aucune intégration personnalisée nécessaire. Fonctionnalités : `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction` ; chaîne `solana:mainnet` ; transactions `legacy` et `v0`. |

:::note Atteindre directement la voie SVM
La même interface est aussi disponible sur `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). La découverte automatique via Wallet-Standard et la voie SVM pleinement implémentée sont sorties en **0.1.5** et sont en ligne à la fois sur Chrome et Firefox (voir [quelle version est en ligne où](#versions)).

Les approbations Solana affichent **une ligne par instruction**, décodée lorsque QoreX le peut : transferts de SOL (destinataire et lamports), transferts de jetons SPL, **« AUTORISER la DÉPENSE de vos jetons »** (approve), **« CÉDER le contrôle du compte »** (set authority) et fermeture d'un compte de jeton - et indiquent « instruction que QoreX ne peut pas lire » pour tout le reste, avec le programme. Une requête qui inclut une instruction approve ou set authority est titrée « veut un pouvoir sur vos jetons Solana - lisez chaque ligne ci-dessous ». Les transactions qui ne listent pas votre portefeuille comme signataire sont rejetées, `signMessage` ne signera pas des octets qui sont en réalité une transaction, et la signature est marquée **classique**. Voir [Signature hybride](#pqc).
:::

## Pièces et jetons {#custom-tokens}

L'écran **Coins et tokens** de la fenêtre permet d'ajouter un **jeton ERC-20 par son contrat** : choisissez le réseau, collez l'adresse du contrat, **Vérifier le contrat**. QoreX lit le nom et les décimales du jeton sur le contrat lui-même - et les relit en arrière-plan au moment de l'ajout, au lieu de faire confiance à la fenêtre - puis les affiche en rappelant que n'importe qui peut créer un jeton portant n'importe quel nom. Le jeton apparaît ensuite dans **Envoyer sur des réseaux externes** et dans [Recevoir](#receive). L'écran refuse les jetons inclus, les doublons, les réseaux non EVM, les adresses incorrectes, les contrats illisibles et les contrats qui empruntent le nom d'un jeton inclus.

## Sites connectés {#connected-sites}

**Sites connectés** dans le popup liste chaque site que ce portefeuille a approuvé - un site peut voir l'adresse de ce portefeuille et vous demander de signer. Appuyez sur **Révoquer** pour en retirer un. Les approbations sont conservées **par portefeuille** : un site approuvé pour un portefeuille ne peut pas lire l'adresse d'un autre portefeuille après que vous avez changé.

## Fenêtre d'accès EVM {#evm-window}

L'écran **Fenêtre d’accès EVM** de la fenêtre de l'extension ouvre et ferme la fenêtre qui permet à un compte de style Ethereum (coin 60) d'envoyer sur la voie EVM de QoreChain (v3.2.0 et ultérieure), avec les mêmes limites que dans l'application : jusqu'à 17,280 blocs et 1,000 transactions, et un plafond de dépense en QOR qui compte tous les QOR qui quittent le compte, plus les frais maximaux de chaque transaction. Les jetons ne sont pas comptés dans le plafond.

1. Choisissez la durée (en blocs), le nombre de transactions et le plafond de dépense.
2. Choisissez **Ce que la fenêtre admet** :
   - **Transferts de QOR uniquement (recommandé)**, la valeur par défaut : aucun appel de contrat, aucun nouveau contrat et aucun destinataire qui soit un contrat ;
   - **N'importe quel contrat** : n'importe quel contrat peut être appelé, et l'écran avertit que les jetons, NFT et approbations déplacés par un contrat ne sont pas limités par la fenêtre. Si le réseau ne peut pas limiter une fenêtre aux transferts de QOR, QoreX vous demande votre accord avant d'en ouvrir une pour n'importe quel contrat ; si vous refusez, rien n'est ouvert.
3. Touchez **Ouvrir la fenêtre**. La fenêtre ouverte indique exactement ce qu'elle admet. **Fermer la fenêtre** y met fin.

Une fenêtre que vous avez ouverte avec **Transferts de QOR uniquement** ne permet pas à un site d'appeler un contrat. La propre transaction d'un site peut amener QoreX, depuis son approbation, à ouvrir une fenêtre pour exactement cette transaction ; l'approbation nomme chaque contrat que la fenêtre admettrait et indique qu'elle remplace toute fenêtre ouverte.

Un compte coin 118 ne peut pas utiliser la voie EVM ; l'écran liste les trois étapes à suivre et propose un bouton vers **Tes comptes**. Seuls les écrans de votre propre portefeuille peuvent ouvrir, fermer ou effacer une fenêtre ; un site ne le peut pas. Voir [Fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window).

## Entretien de la clé post-quantique et multisignature {#pqc-care}

**Enregistrer la clé à nouveau (réparation).** Si l'enregistrement de la clé post-quantique du compte sur le réseau ne permet plus de signer (il est vide, uniquement classique ou autrement inutilisable), l'accueil de la fenêtre affiche une carte. Toucher **Enregistrer la clé à nouveau** affiche les frais de réseau ; touchez à nouveau pour enregistrer. QoreX ne le fait jamais de lui-même. Si le compte a une fenêtre EVM, le réseau la ferme ; ouvrez-en donc une nouvelle ensuite.

**Changer la clé post-quantique.** Le bouton **Changer la clé post-quantique** remplace la clé ML-DSA-87 du compte sur le réseau par la clé suivante dérivée de votre phrase de récupération. Touchez deux fois ; les frais sont indiqués dans le résultat. Le changement vous protège si seule la clé post-quantique a été exposée ; il n'aide **pas** si votre phrase de récupération a été exposée. Ensuite, les autres portefeuilles utilisant la même phrase ne peuvent plus signer pour ce compte tant qu'ils ne prennent pas en charge les clés changées, et le réseau ferme la fenêtre EVM du compte. QoreX trouve la bonne clé quand vous restaurez à partir de la phrase.

**Comptes multisignature.** **Comptes multisignature** gère les comptes qui exigent la signature de plusieurs membres, avec de la part de chaque membre une signature post-quantique en plus d'une signature classique. QoreX utilise les mêmes fichiers que la ligne de commande QoreChain ; chaque membre peut donc signer dans QoreX ou en ligne de commande.

1. **Créer un multisignature** à partir des adresses des membres (chacun doit avoir envoyé au moins une transaction), du nombre de signatures requises et d'un nom facultatif, ou **Ajouter un multisignature existant** en collant sa clé.
2. L'écran affiche le solde et l'état de la clé de chaque membre. Commencez par **Préparer l'enregistrement** de l'ensemble des membres post-quantiques ; tant qu'il n'est pas enregistré, le compte ne peut pas envoyer. Puis **Préparer un envoi**.
3. Dans l'extension, les fichiers se téléchargent et s'ouvrent. **Tour 1 :** les membres ajoutent leurs signatures post-quantiques ; combinez-les. **Tour 2 :** les membres convenus signent de façon classique. Ensuite, **Envoyer au réseau**.
4. La signature demande deux touchers, et vous vérifiez d'abord ce que vous signez. QoreX vous avertit si la transaction enregistre un authentificateur, car un authentificateur peut déplacer les fonds du multisignature sans les signatures des autres membres.

## Outils développeur {#developer-tools}

Le Mode développeur est désactivé par défaut. Pour l'activer dans l'extension, touchez sept fois le **numéro de version** en bas de la fenêtre. Une section développeur apparaît en bas de l'accueil de la fenêtre avec **Outils développeur** (le bouton `</>`), **Passer au testnet (diana)** (ou **Revenir au mainnet**) et **Désactiver le mode développeur**.

**Outils développeur** ouvre une page où les outils sont regroupés sous **Inspecter**, **Transactions**, **Contrats et rollups**, **Autres machines virtuelles** et **Signature et agents**. Il y a 17 outils, les mêmes que dans l'application ; sur le testnet, **Solana sur QoreChain** y figure aussi. Le Mode développeur ne modifie aucune règle de signature : tout ce qui signe affiche toujours ce qu'il signe et attend votre approbation. Chaque outil est décrit dans [Mode développeur](/qorex/developer-mode).

L'outil **Agents IA** permet à un assistant IA sur votre ordinateur de lire ce que vous autorisez et de **proposer** une transaction. QoreX vérifie et simule chaque proposition, et vous l'approuvez ou la rejetez dans la fenêtre d'approbation habituelle ; aucun agent ne peut signer. Dans l'extension, il nécessite sur votre ordinateur un programme compagnon qui **n'est pas encore publié**, et il n'est pas disponible dans Safari.

Sur le **testnet** uniquement, l'accueil de la fenêtre propose aussi l'envoi vers une autre chaîne via IBC et l'écran QoreChain Bridge ; ni l'un ni l'autre n'est proposé sur le mainnet. Voir [Fonctionnalités du testnet](/qorex/testnet-features).

## Langue {#language}

L'extension parle les mêmes dix langues que l'app mobile, le dashboard et le site : anglais, roumain, allemand, espagnol, français, italien, turc, arabe, japonais et coréen. Elle suit par défaut la langue de votre **navigateur** (avec repli sur l'anglais pour tout le reste) - notez qu'il s'agit d'une source différente de l'app mobile, qui suit la langue du **téléphone**, donc les deux peuvent afficher des langues différentes si votre téléphone et votre navigateur sont configurés différemment. Un sélecteur sur l'écran d'accueil du popup vous permet de remplacer la langue détectée à tout moment ; passer à l'arabe bascule immédiatement le popup en écriture de droite à gauche, pas seulement le texte.

## Sécurité et permissions {#security}

QoreX est conçu pour être vérifiable, pas seulement digne de confiance :

- **Coffre-fort** - vos clés sont scellées avec **AES-256-GCM**. Le chemin par mot de passe dérive sa clé avec **Argon2id** (RFC 9106, gourmand en mémoire : 64 MiB, t=3, p=1), de sorte qu'un blob de coffre-fort copié est lent à casser par force brute sur du matériel GPU ou ASIC. (Les blobs PBKDF2 hérités restent ouvrables et se rescellent en Argon2id au déverrouillage suivant.)
- **Déverrouillage par clé d'accès (optionnel, depuis la 0.1.5)** - lorsque votre authentificateur prend en charge l'extension **WebAuthn PRF**, QoreX peut déverrouiller le coffre-fort à partir de la sortie PRF de 32 octets de la clé d'accès au lieu d'un mot de passe saisi. Votre mot de passe reste toujours une solution de repli.

  :::note Où apparaît le déverrouillage par clé d'accès
  QoreX détecte la présence de WebAuthn et n'affiche **Activer le déverrouillage par clé d'accès** que là où le navigateur l'expose aux pages d'extension - c'est-à-dire **Chrome et Edge**. Sur **Firefox**, l'option est masquée, car Firefox n'expose pas WebAuthn aux pages d'extension. C'est le comportement attendu, pas un bug.
  :::
- **Verrouillage automatique** - QoreX se verrouille de lui-même après un moment d'inactivité (15 minutes par défaut) et dispose d'un bouton **Verrouiller**. Voir [Déverrouillage et verrouillage automatique](#unlock).
- **Manifest V3 + CSP stricte** - `script-src 'self'; object-src 'self'; base-uri 'self'`. Il n'y a **aucun chargement de code distant** après l'installation et pas de `wasm-unsafe-eval`.
- **Pas d'analytique, pas de rapport de plantage, pas de SDK de suivi, pas d'inscription** - l'extension n'a besoin d'aucun compte pour détenir, envoyer ou staker des QOR. Vos clés, votre phrase de récupération, votre coffre-fort et vos approbations ne quittent jamais le navigateur. Elle effectue bien des requêtes réseau : vers les points d'accès publics de QoreChain pour les soldes, l'historique et la diffusion (celles-ci portent votre adresse publique `qor1…`), une recherche de prix (sans adresse), les services publics de tout réseau externe que vous détenez ou consultez (votre adresse publique sur ce réseau), et le registre des @handles (le handle, ou une adresse publique). Ce n'est que si vous utilisez l'[appairage avec le Dashboard](#dashboard-bridge) qu'elle envoie une preuve signée que vous possédez l'adresse. Voir [Ce que QoreX envoie sur le réseau](/qorex/overview#data-and-privacy).

### Quelles permissions QoreX demande, et pourquoi {#permissions}

Cette section existe parce que la fiche Firefox affiche la permission **« Accéder à vos données pour tous les sites web »**, ce qui peut sembler en contradiction avec un portefeuille qui ne déclare aucune permission d'hôte. Voici la vérité exacte, sans fard, tirée du manifeste.

Le `manifest.json` de l'extension déclare :

```json
"permissions": ["storage", "nativeMessaging"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`storage`** - stocke **localement**, dans le stockage de l'extension, le coffre chiffré, vos approbations de connexion par origine ainsi que les réglages et listes de votre portefeuille (comme les contacts).
- **`nativeMessaging`** - nouveau dans la 0.4.4, utilisé uniquement par l'outil [Agents IA](#developer-tools) du Mode développeur pour communiquer avec un programme compagnon sur votre propre ordinateur (pas encore publié). QoreX n'ouvre cette connexion qu'après que vous avez activé **Autoriser les connexions d'agents IA sur cet ordinateur** dans cet outil. Le paquet **Safari** ne déclare pas cette autorisation.
- **`host_permissions: []`** - QoreX ne déclare **aucune** permission d'hôte. Elle ne demande pas la capacité de faire des requêtes réseau inter-origines vers des sites arbitraires en votre nom.
- **`web_accessible_resources`** - permet aux pages de charger le propre `inpage.js` de QoreX, le petit script qui expose le fournisseur. `use_dynamic_url` lui donne une adresse propre à chaque session, afin que les sites ne puissent pas identifier l'extension par empreinte en sondant sa présence.
- **`content_scripts` correspond à `<all_urls>`** - c'est la raison honnête pour laquelle Firefox indique *« Accéder à vos données pour tous les sites web »*. QoreX injecte un petit script fournisseur (`content.js` → `inpage.js`) dans **chaque page**. Un content script qui s'exécute sur tous les sites *peut* techniquement lire la page, et les navigateurs décrivent cette capacité avec exactement ce libellé - qu'elle provienne de `host_permissions` ou d'une correspondance de content script.

**Pourquoi le content script s'exécute partout.** Afin que **n'importe quelle** dApp puisse découvrir le portefeuille via EIP-6963 sans que vous ayez d'abord à accorder un accès site par site. C'est ainsi que fonctionnent MetaMask, Keplr, Phantom et tout autre portefeuille injecté : le fournisseur injecté doit être présent avant que les scripts de la page ne s'exécutent (`document_start`), quel que soit le site que vous visitez.

**Ce que ce script fait - et ne fait pas.** Il ne fait que relayer les messages du portefeuille (annoncer le fournisseur, transmettre les requêtes de connexion/signature au service worker, renvoyer le résultat). Il ne lit **pas** le contenu de la page au-delà de ces requêtes de portefeuille, n'envoie rien à un serveur, et ne charge pas de code distant - et il ne peut pas récupérer de données inter-origines arbitraires puisqu'il n'y a aucune permission d'hôte. Tout ceci est vérifiable : l'extension est verrouillée par CSP et n'embarque aucune analytique, et son manifeste (ci-dessus) est lisible dans le paquet installé.

## Connecter une dApp à QoreX {#connect}

Une dApp découvre QoreX via **EIP-6963** (elle émet la requête et choisit le portefeuille dont le `rdns` est `network.qore.qorex`), puis utilise le fournisseur EIP-1193 renvoyé ; pour la voie **native** de QoreChain, elle utilise `window.qorex.native`, et elle lit `capabilities` pour voir ce que cette version prend en charge. QoreX ne définit jamais `window.ethereum` ni `window.keplr`. Le guide développeur complet, avec du code, a sa propre page : [Intégrer une dApp à QoreX](/qorex/dapp-integration) (voir [Détecter QoreX](/qorex/dapp-integration#detection) et [Se connecter](/qorex/dapp-integration#connect)). Dans une application web, l'[adaptateur de portefeuille](/developer-tools/wallet-adapter) encapsule cette détection pour vous, et le [kit développeur QoreX](/developer-tools/qorex-integrations) couvre l'intégration côté application. (`@qorechain/connect` est obsolète ; ne démarrez aucun nouveau travail dessus.)

Les approbations sont **par origine** : la première connexion à un site ouvre une fenêtre d'approbation affichant l'origine, approuver ne révèle que votre adresse publique, et l'approbation d'un site n'accorde rien à un autre. Les approbations sont conservées par portefeuille, persistent jusqu'à ce que vous les révoquiez sous **Sites connectés**, et un site peut avoir une demande en attente (trois au total) ; changer de portefeuille ou verrouiller répond « non » aux demandes en attente. À partir de la 0.4.4, une demande de signature d'un site faite alors que QoreX est verrouillé ouvre l'écran du mot de passe, en nommant le site, et affiche son approbation après le déverrouillage ; fermer la fenêtre la refuse. Voir [Ce que montre la fenêtre d'approbation](/qorex/security-and-recovery#approvals).

### Pont Dashboard (v0.1.5, étendu en v0.2.2) {#dashboard-bridge}

La version 0.1.5 ajoute un pont limité à **`dashboard.qorechain.io` uniquement** : `window.qorex.native.connectProof(sessionId)` signe la preuve d'appairage *Connect with QoreX* (le backend revérifie la signature), et `executeTransfer({ to, amountUqor, memo })` approuve et diffuse un transfert QOR proposé par le Dashboard, en retournant le `txHash`. Ces méthodes sont refusées sur toute autre origine.

**La 0.2.2** ajoute `native:executeRequest`, qui accepte une requête complète proposée par le Dashboard - y compris pour le [staking](#stake-dashboard) - validée par rapport au même analyseur partagé que QoreX utilise partout ailleurs : refusée en cas d'incompatibilité de réseau, d'origine étrangère, d'adresse qui n'est pas la vôtre, de type de requête inconnu, ou de requête de staking portant un `toAddress` (les requêtes de staking n'en ont pas). Les types de requête sont send, delegate, undelegate, redelegate et claim ; une requête Connect vous permet de choisir lequel de vos comptes lier, et `listAccounts()` renvoie vos comptes (en lecture seule).

Comme une adresse `qor1…` est également valide sur le mainnet et le testnet, une requête proposée par le Dashboard indique le réseau qu'elle cible, et QoreX refuse d'agir dessus si cela ne correspond pas au réseau auquel l'extension est actuellement connectée - elle ne changera jamais de réseau au nom d'une requête.

## Envoyer une transaction QoreChain depuis une dApp : `signAndBroadcast` {#sign-and-broadcast}

Toute transaction de la voie native QoreChain provenant d'un compte doté d'une clé ML-DSA-87 enregistrée nécessite une signature hybride - secp256k1 **et** ML-DSA-87 - et seul le portefeuille détient la clé ML-DSA ; une page ne peut donc pas la construire. Une dApp envoie les messages avec `window.qorex.native.signAndBroadcast({ chainId, messages, memo?, gasLimit? })` ; QoreX affiche les messages décodés et les frais, construit la transaction pour le compte que vous avez sélectionné, ajoute la signature hybride (en enregistrant d'abord la clé ML-DSA-87 du compte s'il s'agit de sa première transaction), diffuse, et résout avec `{ txHash, code, height?, shield }`. Disponible à partir de l'extension **0.3.5**.

- La chaîne doit être le réseau actif du portefeuille (`qorechain-vladi` sur le mainnet). Une dApp ne peut pas changer de réseau ; vous seul le pouvez.
- 1 à 32 messages par appel ; les frais sont affichés avant l'approbation ; les messages réservés au portefeuille, comme la gestion de la clé ML-DSA-87, sont refusés.
- cosmjs, cosmos-kit et Interchain Kit fonctionnent via `getOfflineSigner` (à partir de la 0.4.0), où QoreX ajoute la couche ML-DSA-87 et les frais qui l'accompagnent.
- `signArbitrary` signe un message avec la clé classique du compte et ML-DSA-87 (à partir de la 0.4.0).

Les règles, le gaz, les erreurs et les exemples de code complets se trouvent dans [Intégrer une dApp à QoreX](/qorex/dapp-integration#sign-and-broadcast).

## Signature hybride {#pqc}

Chaque transfert QOR natif initié par QoreX lui-même est signé deux fois : avec une clé classique secp256k1 et avec **ML-DSA-87** (FIPS 204), en utilisant le pipeline hybride de `@qorechain/sdk`. **Il n'y a pas de bascule** : QoreChain l'exige et QoreX n'envoie jamais un transfert QOR sur la voie Native sans elle.

- **Signature native à l'initiative d'une dApp** - utilisez [`signAndBroadcast`](#sign-and-broadcast) : QoreX décode chaque message, affiche les frais et ajoute lui-même la couche ML-DSA-87. `signDirect` et les signataires cosmjs (`getOfflineSigner`) signent une transaction construite par la page ; quand elle ne porte aucune couche ML-DSA-87, QoreX en ajoute une, et une couche attachée par la page est vérifiée par rapport à la clé enregistrée du compte avant toute fenêtre d'approbation (les comptes importés de MetaMask utilisent `signAndBroadcast`). QoreX ne signe jamais à l'aveugle : une demande qu'il ne peut pas décoder est refusée, et il ne signe jamais une transaction QoreChain uniquement classique. Voir [Intégrer une dApp à QoreX](/qorex/dapp-integration#cosmjs).
- **Les signatures classiques sont toujours étiquetées** - les transferts sur des réseaux externes (ETH, BNB, Solana, …) ne peuvent pas porter de signature ML-DSA-87 ; QoreX vous fait cocher une reconnaissance explicite et les marque comme classiques plutôt que de rétrograder silencieusement.

**Ce que cela signifie pour la taille des transactions.** ML-DSA-87 est une signature volumineuse : la signature fait **4 627 octets** et la clé publique **2 592 octets** (fixé par FIPS-204). Une transaction QoreChain hybride est donc plusieurs kilo-octets plus grande qu'une transaction purement classique. Si vous construisez et diffusez des transactions vous-même, dimensionnez vos tampons et estimations de frais en conséquence ; la comptabilité de gaz de QoreChain les anticipe déjà. Voir [Signature post-quantique](/developer-guide/post-quantum-signing) (le guide du développeur) pour les primitives et l'exigence de signature déterministe.

## Où elle est publiée {#where-published}

| Boutique | Fiche | Version actuelle | Lien |
|---|---|---|---|
| Chrome Web Store | **QoreX** | 0.4.4 | [chromewebstore.google.com](https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg) |
| Firefox Add-ons | `qorex` | 0.4.4 | [addons.mozilla.org](https://addons.mozilla.org/firefox/addon/qorex/) |
| Mac App Store (Safari) | **QoreX Wallet**, application 1.8.2 | extension 0.4.4 | [apps.apple.com](https://apps.apple.com/us/app/qorex-wallet/id6794132220) |

Le code source de QoreX n'est pas public. Les fiches des stores affichent toujours la version actuelle.

## Limites et problèmes connus {#limits}

- **La signature EVM a des limites.** Le fournisseur signe `personal_sign`, `eth_signTypedData_v4` et `eth_sendTransaction` (QoreChain, et Ethereum site par site) et refuse les autres méthodes de signature. Sur QoreChain, seuls les comptes importés de MetaMask peuvent envoyer, une transaction EVM nécessite une fenêtre d'autorisation (l'approbation en ouvre une pour cette transaction), et elle ne porte qu'une signature secp256k1. Voir [Intégrer une dApp à QoreX](/qorex/dapp-integration#evm).
- **`window.qorex.native` est de style Keplr, ce n'est pas un remplacement direct de Keplr.** Il n'y a pas d'alias `window.keplr`. `signAmino` et `sendTx` sont absents : Amino est refusé avec le code `4200`. `getOfflineSigner` et `signDirect` fonctionnent, et QoreX ajoute la couche ML-DSA-87 quand la page n'en apporte aucune. `signArbitrary` et `verifyArbitrary` (signature de message) fonctionnent à partir de la 0.4.0. Une dApp ne peut pas changer de réseau, et les messages réservés au portefeuille (gestion des clés, règles de dépense, fenêtres EVM, certaines autorisations) sont refusés quel que soit le site.
- **Mobile uniquement :** portefeuille d'actifs, Q-Day Scanner, récupération sociale, Legacy, connexion, liaison d'appareils et réservation d'un @handle.
- **Pas d'écran Swap** dans l'extension.
- **Le déverrouillage par clé d'accès** n'est proposé que là où le navigateur expose WebAuthn aux pages d'extension (Chrome et Edge) ; sur Firefox il est masqué.
- **Safari** ouvre les approbations dans un onglet de navigateur plutôt que dans un popup.
- **Les réseaux externes** n'acceptent que des signatures classiques ; QoreX vous fait le reconnaître avant chaque transfert.
- **Testnet uniquement :** l'envoi vers une autre chaîne via IBC, l'écran QoreChain Bridge et Solana sur QoreChain. Voir [Fonctionnalités du testnet](/qorex/testnet-features).
- Les **agents IA** nécessitent un programme compagnon pas encore publié, et ne sont pas disponibles dans Safari.
- Pour l'instant, l'**Historique** ne couvre que QoreChain.
- Le coffre-fort de l'extension n'existe que dans ce navigateur. Supprimer l'extension, effacer ses données ou réinitialiser le navigateur supprime vos clés ; seuls vos 24 mots notés les restaurent.
