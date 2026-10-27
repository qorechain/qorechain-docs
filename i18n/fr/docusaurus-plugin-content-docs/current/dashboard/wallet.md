---
slug: /dashboard/wallet
title: Portefeuille
sidebar_label: Portefeuille
sidebar_position: 3
---

# Portefeuille

La page **Wallet** est l'endroit où vous consultez votre solde et votre historique de transactions, recevez des QOR et (sur le mainnet) composez des envois et des actions de staking. Elle s'adresse à toute personne détenant des QOR et souhaitant voir un compte sur les trois rails au même endroit. Son fonctionnement dépend du réseau :

- **Le mainnet est non custodial.** Le Dashboard ne détient pas les clés mainnet. Vous connectez votre propre portefeuille (**QoreX**, **Keplr** ou **MetaMask**), et la page lit votre solde et votre historique réels depuis la chaîne. Les envois et le staking sur le rail Native sont composés sur la page et signés dans **QoreX**, car les comptes QoreChain signent avec une signature post-quantique hybride que produit QoreX. Keplr se connecte pour consulter et recevoir. MetaMask se connecte sur le rail EVM ; y envoyer des fonds exige une clé post-quantique enregistrée et une fenêtre d'autorisation EVM ouverte, depuis QoreX (voir [Envoyer avec MetaMask](#send-metamask)).
- **Le testnet est custodial.** Le Dashboard crée et conserve des portefeuilles de test pour votre compte, afin que vous puissiez envoyer et recevoir des QOR de test sans rien installer. Il n'y a pas d'écran de staking pour les portefeuilles testnet.

## Innovations {#innovations}

- **Un compte, trois encodages.** La page dérive les formes `qor1...`, `0x...` et base58 SVM du même compte, et lit le solde et l'historique une seule fois, via `qor1...`. Les lignes d'historique portent un badge Native, EVM ou SVM.
- **Le Dashboard ne signe jamais sur le mainnet.** Pour un envoi, une délégation, une annulation de délégation ou une réclamation, il ne transmet à QoreX que les paramètres et le réseau, jamais une transaction préparée. QoreX reconstruit la transaction, l'affiche en entier, la signe avec la signature hybride ML-DSA-87 et la diffuse. Le Dashboard n'apprend que le hash de la transaction.
- **Épinglage des @handle.** L'adresse d'un handle résolu n'est mémorisée dans ce navigateur qu'après votre confirmation. Si le handle se résout plus tard vers une autre adresse, le flux s'arrête et affiche les deux adresses en entier.
- **Vérification des frais avant le staking.** La page lit depuis la chaîne les QOR disponibles à la dépense (vesting exclu) et l'état de la clé ML-DSA-87 du compte, et garde Submit désactivé si les frais ne peuvent pas être payés.
- **L'avertissement d'adresse de test se trouve là où vous copiez.** « Test address, never send real QOR here. » apparaît à côté de l'adresse, dans My Wallets et sur Receive, car les adresses testnet et mainnet sont identiques en apparence.
- **Export de la phrase de récupération avec vérification.** Sur le testnet, révéler une phrase exige une nouvelle connexion, les 24 mots s'affichent pendant 60 secondes, et la sauvegarde n'est considérée comme confirmée qu'après avoir saisi les mots 3, 5 et 9.

## Comment l'utiliser {#how-to-use}

### Un compte, trois encodages {#one-account-three-encodings}

Un compte QoreChain est une identité unique écrite de trois façons, une par rail d'exécution :

| Rail | Encodage | Ressemble à |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | p. ex. `5Gv7...` |

Les trois encodages pointent vers le **même compte et le même solde**. Les fonds reçus sur n'importe quel rail arrivent dans un solde unique, et le Dashboard indexe le solde et l'historique via l'encodage `qor1`, de sorte que l'activité de tous les rails s'affiche ensemble.

### Utiliser le Portefeuille sur le mainnet {#mainnet}

Prérequis : être connecté, avoir l'en-tête sur **Mainnet**, avoir accepté la [reconnaissance unique](/dashboard/overview#risk-acknowledgement), et, pour envoyer ou staker, disposer de l'application ou de l'extension QoreX.

1. Ouvrez **Wallet**. Si aucun portefeuille n'est encore connecté, une carte « Connect your wallet » affiche la carte **QoreX wallet** avec **Connect with QoreX**, puis en dessous, sous « or connect another wallet », **Connect Keplr** et **Connect MetaMask**.
2. Connectez un portefeuille (étapes ci-dessous). Phantom ne peut pas être connecté ici ; voir [Signataires liés](#linked-signers).
3. La page charge votre solde et votre historique réels depuis la chaîne.

Une fois connectée, la page comporte six onglets : **Wallet**, **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** et **Connect Wallets**.

- **Wallet :** une rangée **Viewing** de puces de portefeuille (seulement si plus d'un portefeuille est rattaché), **Total Balance**, **Receive**, et **Assets & Activity** avec les 10 dernières transactions.
- **Send from QoreX, Stake / Delegate, Rewards :** ces onglets passent par QoreX même si Keplr ou MetaMask est également connecté. Les étapes de staking se trouvent sur [Staking et validateurs](/dashboard/staking-and-validators).
- **Details :** vos adresses Native, EVM et SVM, et **Linked addresses** (renommer, définir par défaut, contrôlable dans QoreX ou en simple observation).
- **Connect Wallets :** les portefeuilles connectés (cliquez sur l'un pour le consulter, sur X pour le détacher), les comptes QoreX non liés avec **Link this account**, **+ QoreX**, **+ Keplr**, **+ MetaMask**, et le panneau [Ajouter QoreChain à votre portefeuille](#add-network).

Si votre portefeuille n'a pas encore QoreChain configuré, ajoutez-le d'abord, voir [Ajouter QoreChain à votre portefeuille](#add-network).

#### Se connecter avec QoreX, extension de navigateur {#connect-qorex-extension}

1. Sur la page Wallet, repérez la carte **QoreX wallet** et sélectionnez **Connect with QoreX**.
2. Comme l'extension QoreX est détectée, le Dashboard vous demande comment vous souhaitez vous connecter. Sélectionnez **Browser extension**.
3. L'extension ouvre une fenêtre d'approbation indiquant `dashboard.qorechain.io` comme site demandeur.
4. Approuvez. Cela signe une preuve ponctuelle que vous possédez votre adresse `qor1...` ; aucun fonds ne bouge et aucune autre permission n'est accordée.
5. La fenêtre se ferme et le Dashboard affiche **Connected: qor1...**. Le choix est mémorisé, donc la prochaine connexion sur ce navigateur le réutilise sans redemander. Un lien **Use a different method** n'apparaît que pendant qu'un appairage est en attente.

Vous pouvez lier plus d'une adresse QoreX au même compte Dashboard (par exemple une depuis une extension Firefox et une depuis Chrome, ou un téléphone et un ordinateur portable). Sélectionnez **Add another wallet** pour répéter le processus ; chaque adresse liée peut recevoir une étiquette et l'une d'elles est marquée par défaut pour l'envoi, le tout depuis l'onglet **Connect Wallets**.

**Changer de portefeuille depuis l'onglet Wallet.** Dès que plus d'un portefeuille est rattaché, la rangée de puces **Viewing** vous permet de changer le portefeuille dont vous consultez le solde et l'historique sans quitter l'onglet. La rangée est masquée lorsqu'un seul portefeuille est rattaché.

**Comptes de votre extension QoreX qui ne sont pas encore liés.** Une même phrase de récupération peut dériver plusieurs comptes, et en créer un dans QoreX n'en informe pas le Dashboard. Lorsque l'extension peut lister ses comptes, les onglets **Wallet**, **Details** et **Connect Wallets** affichent une carte du type « 2 accounts in your QoreX extension are not linked here », avec le solde de chaque compte (et la part qui est stakée et ne peut pas être envoyée). Sélectionnez **Link this account** pour l'appairer ; la liaison n'accorde aucun contrôle sur vos clés. Si votre version de QoreX ne peut pas choisir quel compte prouver, seul le compte actif peut être lié depuis ici.

#### Se connecter avec QoreX, application mobile {#connect-qorex-app}

1. Sur la page Wallet, sélectionnez **Connect with QoreX** sur la carte **QoreX wallet**.
2. Si le sélecteur apparaît, choisissez **QoreX app** (si aucune extension n'est détectée, le Dashboard passe directement à ce flux).
3. Le Dashboard affiche un code QR et **Open QoreX**, et interroge en arrière-plan (« Waiting for approval in QoreX... »).
4. Sur votre téléphone, scannez le code QR dans QoreX, ou appuyez sur **Open QoreX** si vous naviguez depuis ce même téléphone (cela ouvre l'application via son lien `qorex://connect`).
5. QoreX affiche la demande d'appairage avec l'origine du Dashboard. Approuvez avec Face ID, Touch ID ou PIN.
6. En quelques secondes, le Dashboard affiche **Connected: qor1...**.

#### Se connecter avec Keplr {#connect-keplr}

Keplr se connecte pour consulter votre solde et votre historique sur le rail Native et pour recevoir. L'envoi et le staking passent par QoreX.

1. Sur la page Wallet, sélectionnez **Connect Keplr**.
2. Si QoreChain n'est pas configuré dans Keplr, le Dashboard déclenche l'invite `suggestChain` de Keplr. Vérifiez l'ID de chaîne et les points de terminaison, puis sélectionnez **Approve**.
3. Choisissez le compte et approuvez la connexion.
4. Le Dashboard lit votre adresse `qor1...` et charge votre solde et votre historique.

Phantom ne peut pas être connecté comme portefeuille sur la page Wallet du mainnet. Les adresses Phantom liées auparavant apparaissent toujours dans **Connected wallets** ; pour lier une clé Phantom comme signataire, voir [Signataires liés (Phantom)](#linked-signers).

#### Se connecter avec MetaMask {#connect-metamask}

1. Sur la page Wallet, sélectionnez **Connect MetaMask**.
2. Si le réseau EVM de QoreChain n'est pas encore ajouté, MetaMask affiche son invite **Add network** (EIP-3085) avec l'ID de chaîne, l'URL RPC et le symbole pré-remplis. Sélectionnez **Approve**, puis **Switch network**.
3. Sélectionnez le compte et **Connect**.
4. Le Dashboard lit votre adresse `0x...` et charge votre solde et votre historique.

### Envoyer sur le mainnet {#send-mainnet}

Chaque envoi est composé sur le Dashboard mais finalisé dans votre propre portefeuille. Sur le **rail Native**, ce portefeuille est toujours **QoreX**. Sur le **rail EVM**, MetaMask signe, à condition que le compte possède déjà une clé post-quantique et une fenêtre EVM ouverte (voir [Envoyer avec MetaMask](#send-metamask)).

:::caution Fonds réels, transferts irréversibles
Les transactions mainnet sont irréversibles. Vérifiez toujours deux fois l'adresse du destinataire avant d'approuver.
:::

:::note Soldes en vesting
Si une partie de votre solde est encore en vesting, elle compte dans ce que vous pouvez déléguer, mais elle ne peut pas payer de frais de transaction. Il vous faut pour cela des QOR séparément disponibles à la dépense, y compris pour enregistrer une clé post-quantique. Un portefeuille alimenté uniquement par son montant en vesting peut déléguer mais ne peut pas envoyer.
:::

#### Envoyer avec QoreX, pas à pas

1. Dans la carte **Send from QoreX**, choisissez éventuellement **Send from** (si vous avez lié plusieurs portefeuilles QoreX), puis saisissez le destinataire (une adresse `qor1...` ou un `@handle`), le **Amount (QOR)** et un **Memo** facultatif.
2. Sélectionnez **Continue in QoreX**.
3. Approuvez, au choix :
   - **Extension de navigateur :** sélectionnez **Approve in browser extension**. La fenêtre de l'extension affiche le transfert entièrement décodé (destinataire et montant). Approuvez avec le déverrouillage propre à votre extension. L'extension signe avec la signature post-quantique hybride et diffuse directement sur la chaîne.
   - **Application mobile :** scannez le code QR avec QoreX, ou sélectionnez **Open in QoreX** (une requête `qorex://tx`) sur le même téléphone. QoreX décode la requête, affiche le destinataire et le montant, et vous approuvez avec votre biométrie. QoreX signe et diffuse.
4. La page affiche « Transfer confirmed » avec le hash de transaction (ouvrez-le dans l'[Explorer](/dashboard/explorer)), puis **New transfer**. Dans le cas de l'application, le Dashboard interroge le résultat.

**Exemple minimal :** Connect with QoreX (application, scannez le code QR), puis Send from QoreX avec un destinataire `qor1...` et un montant de 1, sélectionnez **Continue in QoreX** et approuvez dans QoreX.

#### Envoyer vers un @handle

Le champ destinataire accepte aussi un `@handle`. Ce qui se passe ensuite dépend du fait que vous ayez déjà payé ce handle depuis ce navigateur ou non :

- **Première fois :** l'adresse résolue est affichée en entier avec « First time sending to @handle from this browser. Check the address before you continue: », et vous devez la confirmer avant qu'elle soit utilisée. L'adresse n'est épinglée qu'après confirmation.
- **Même adresse qu'auparavant :** elle passe avec une confirmation légère.
- **Une adresse différente d'auparavant :** le flux s'arrête. L'ancienne et la nouvelle adresse sont toutes deux affichées en entier, avec un avertissement explicite indiquant que l'adresse a changé, et un bouton de style secondaire pour continuer quand même.

L'épinglage n'existe que dans votre navigateur, de sorte qu'un autre ordinateur ou un navigateur réinitialisé affiche à nouveau « première fois ». Les handles comptent 3 à 20 caractères (`a-z`, `0-9`, `_`) et appartiennent à une seule adresse. Si la recherche de handle est temporairement indisponible, le champ l'indique et vous pouvez toujours envoyer vers une adresse `qor1...`.

#### Envoyer avec MetaMask {#send-metamask}

:::caution Depuis la chaîne v3.2.0, MetaMask seul ne peut plus envoyer sur le mainnet
La voie EVM n'admet une transaction que depuis un compte qui détient une clé post-quantique enregistrée et dispose d'une **fenêtre d'autorisation EVM ouverte** : une permission bornée dans le temps, en nombre et en valeur, ouverte avec un message portant une signature hybride ML-DSA-87 (FIPS 204). MetaMask ne peut pas produire ce message. Sans fenêtre, la chaîne refuse la transaction (erreurs typiques : pas de fenêtre, fenêtre épuisée, pas de clé post-quantique).
:::

1. Dans **QoreX**, enregistrez la clé post-quantique du compte s'il n'en a pas (votre premier transfert QoreX depuis ce compte s'en charge), puis ouvrez une fenêtre d'autorisation EVM, voir [Fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window). Cela concerne le **compte de type Ethereum (coin 60)** qui partage la clé de MetaMask : ajoutez-le dans QoreX avec **Add an Ethereum account (coin 60)** en utilisant la même phrase de récupération ([comment faire](/qorex/getting-started#restore-dashboard)). Aucune clé MetaMask ne peut envoyer depuis un compte `qor1...` ordinaire en coin 118.
2. Une fenêtre est bornée en blocs (17,280 au maximum, soit environ 15 heures sur le mainnet), en nombre de transactions (1,000 au maximum) et par un plafond de dépense en QOR qui compte chaque montant **plus** ses frais maximaux. Gardez les limites petites : tant qu'une fenêtre est ouverte, les transactions MetaMask déplacent des QOR sans signature post-quantique. Ouvrir une nouvelle fenêtre remplace la précédente et fait avancer le nonce du compte ; ouvrez-la donc **avant** d'envoyer depuis MetaMask (une transaction préparée plus tôt échoue avec « nonce too low »). Depuis v3.2.3, la chaîne prend aussi en charge des fenêtres plus étroites et à périmètre limité ; QoreX ne propose pas encore d'écran pour elles.
3. Ouvrez MetaMask et vérifiez qu'il est réglé sur le réseau EVM de QoreChain.
4. Sélectionnez **Send** dans MetaMask, saisissez l'adresse `0x...` du destinataire et le montant, vérifiez les frais de gas, puis confirmez.
5. De retour sur le Dashboard, la transaction apparaît dans votre historique dès qu'elle est on-chain (actualisez si nécessaire).

Chaque transaction consomme une partie de la fenêtre ; lorsque sa limite de durée, de nombre de transactions ou de valeur est atteinte, ouvrez-en une nouvelle dans QoreX, et fermez la fenêtre lorsque vous avez terminé.

### Recevoir {#receive-mainnet}

1. Sélectionnez **Receive**.
2. Choisissez un rail avec le sélecteur : **Native QOR**, **EVM** ou **SVM**.
3. La fenêtre affiche votre adresse dans cet encodage avec un code QR et un bouton de copie.
4. Sur le rail Native uniquement, **Payment Request Options** (montant, mémo) construit un lien `qorechain:` que vous pouvez copier.

Quel que soit le rail utilisé par l'expéditeur, les fonds arrivent sur le même compte.

### Lire votre historique de transactions {#history}

Sur le mainnet, la liste **Assets & Activity** affiche les **10 dernières** transactions. Chaque ligne comporte :

- un **badge de rail** (Native, EVM ou SVM) ;
- **Sent** ou **Received** pour les transferts ordinaires, et un libellé descriptif pour les autres activités (par exemple *PQC key registration* ou une action de contrat) ;
- le montant, l'heure, un statut **Confirmed** ou **Failed**, et un hash que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer). Pour une activité plus ancienne, ouvrez votre adresse dans l'Explorer.

### Utiliser le Portefeuille sur le testnet {#testnet}

Sur le testnet (`qorechain-diana`), le Dashboard gère des portefeuilles de test pour vous. Le testnet n'a ni connexion QoreX ni écran de staking.

**Première visite :** créez un portefeuille, ou importez une phrase de 24 mots.

**Carte principale :** l'étiquette du portefeuille, l'adresse avec un bouton de copie, **Total Balance**, **Send**, **Receive** et **My Wallets**, un indicateur de dernière mise à jour avec actualisation, et **Assets & Activity** avec un onglet **Transaction history** et un onglet **Tokens**.

L'onglet **Tokens** ne liste que les jetons émis via des déploiements du Dashboard. Les jetons de test du fest provenant du [Faucet](/dashboard/faucet#fest-tokens) n'y apparaissent jamais ; vérifiez-les avec une requête de solde bank ou dans l'[Explorer](/dashboard/explorer).

:::caution Les adresses testnet ressemblent exactement aux adresses mainnet
Le testnet et le mainnet utilisent le même format `qor1...`, de sorte qu'une adresse testnet peut être collée dans un formulaire de retrait ou un autre portefeuille sans aucun avertissement, et les QOR réels qui lui sont envoyés arrivent sur le **mainnet**, à cette adresse, où cette page testnet ne peut pas les afficher. N'envoyez jamais de QOR réels à une adresse testnet. Le Dashboard répète cet avertissement à côté de l'adresse sur la page Wallet, dans **My Wallets** et sur **Receive**. Si vous avez déjà envoyé de vrais QOR à une adresse testnet, contactez le support et n'essayez pas de les déplacer vous-même.
:::

#### Envoyer des QOR (testnet)

1. Sélectionnez **Send**.
2. Choisissez un **Asset** (QOR, ou un jeton émis via le Dashboard).
3. Saisissez la **Recipient Address** (les contacts enregistrés et les adresses récentes sont suggérés pendant la saisie) et le **Amount** (ou **MAX**), ainsi qu'un **Memo** facultatif.
4. Sélectionnez **Review Transaction**, vérifiez les détails et les frais estimés, puis **Confirm & Send**.
5. Vous recevez une confirmation avec le hash, et « Save this address? » est proposé afin que le destinataire soit conservé comme contact.

**Exemple minimal :** passez sur Testnet, créez un portefeuille, réclamez des fonds depuis le [Faucet](/dashboard/faucet), puis envoyez 1 QOR à une autre adresse.

#### Recevoir des QOR (testnet)

1. Sélectionnez **Receive**.
2. Partagez l'adresse ou le code QR, ou copiez l'adresse.
3. Remplissez éventuellement **Payment Request Options** (montant, mémo) pour générer un lien de paiement ; utilisez **Copy Link** ou **Save Image**.

#### Gérer vos portefeuilles de test

**My Wallets** ouvre votre liste d'adresses : basculez entre les portefeuilles, créez-en, importez-en ou supprimez-en un. Le portefeuille actif est celui utilisé pour les actions signées sur le testnet dans tout le Dashboard.

#### Sauvegarder ou exporter la phrase de récupération d'un portefeuille de test {#reveal-recovery-phrase}

Sur le testnet, le Dashboard gère vos portefeuilles, mais vous pouvez exporter la phrase de récupération de 24 mots d'un portefeuille pour l'importer dans un portefeuille en auto-conservation tel que QoreX.

1. Sur la page **Wallet** du testnet, repérez la carte **Recovery phrase**. Elle liste vos portefeuilles gérés par le Dashboard avec leur solde **mainnet** (les portefeuilles alimentés en premier), afin que vous puissiez choisir celui qui détient vos jetons.
2. Sélectionnez **Reveal**, lisez l'avertissement (« Reveal the phrase for ...? ») et sélectionnez **Continue**.
3. Reconnectez-vous lorsque cela vous est demandé (une nouvelle vérification du mot de passe est requise ; le Dashboard ne voit jamais votre mot de passe). Vous revenez automatiquement au portefeuille.
4. Les 24 mots s'affichent pendant 60 secondes, avec un bouton **Copy phrase**. Notez-les et conservez-les hors ligne. Le compte à rebours se met en pause pendant que vous cochez la case de confirmation ou saisissez les champs de vérification.
5. Cochez **I have written down my recovery phrase and stored it somewhere safe**, saisissez les mots **3**, **5** et **9** (marqués *Required*), puis sélectionnez **Confirm backup**. Vous voyez « Recovery phrase saved ».
6. Si vous quittez avec **Hide without confirming** (ou que le minuteur expire), la carte affiche « Backup not confirmed » et propose **Reveal again and confirm**.

Toute personne disposant de ces 24 mots contrôle le portefeuille. QoreChain ne peut jamais les récupérer ni les réinitialiser pour vous, et le support ne vous les demandera jamais.

### Ajouter QoreChain à votre portefeuille {#add-network}

Le panneau **Add QoreChain to your wallet** (sur le mainnet, il se trouve dans l'onglet **Connect Wallets** et sous les boutons de connexion tant qu'aucun portefeuille n'est connecté ; sur le testnet, en bas de la page) comporte quatre cartes :

| Carte | Ce qu'elle vous apporte | Boutons |
| --- | --- | --- |
| **Native (Cosmos) wallets** | Les points de terminaison RPC et REST ainsi que l'ID de chaîne, chacun avec un bouton de copie. | **Add to Keplr**, **Add to Cosmostation** (le libellé suit le portefeuille détecté) |
| **EVM wallets** | Les paramètres réseau EIP-3085. | **Add to EVM wallet** (ou **Add to MetaMask / Rabby**, selon les portefeuilles détectés) |
| **SVM wallets** | L'URL RPC SVM pour les réglages de RPC personnalisé. | **Copy SVM RPC URL** |
| **Mobile wallets (WalletConnect)** | Un appairage WalletConnect v2. | **Create pairing QR** |

1. Repérez le panneau et choisissez la carte qui correspond au rail de votre portefeuille.
2. Sélectionnez le bouton d'ajout, ou copiez les points de terminaison et l'ID de chaîne dans le formulaire d'ajout de réseau de votre portefeuille.
3. Approuvez le nouveau réseau dans votre portefeuille.

Les points de terminaison publics sont `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) et `svm.qore.host` (RPC SVM), avec des variantes `*-testnet` (par exemple `rpc-testnet.qore.host`). IDs de chaîne : mainnet `qorechain-vladi` (ID de chaîne EVM `9801`), testnet `qorechain-diana` (ID de chaîne EVM `9800`).

### Signataires liés (Phantom) {#linked-signers}

La carte **SVM wallets** vous permet aussi de lier une clé Phantom à votre compte en tant que **signataire lié** : un authentificateur révocable et limité dans le temps (30 jours), et non un portefeuille principal distinct. Sélectionnez **Connect Phantom**, puis **Register authenticator**. L'enregistrement doit être signé par **Keplr** (le Dashboard exige que Keplr soit connecté pour cela), et Phantom ne devient jamais sa propre identité.

:::caution La disponibilité de l'enregistrement diffère selon le réseau
Les fonctionnalités de compte intelligent et de portefeuilles liés de la chaîne sont activées sur le testnet et désactivées sur le mainnet (`GET /qorechain/abstractaccount/v1/config` renvoie `enabled: true` sur le testnet et `enabled: false` sur le mainnet, vérifié le 27 octobre 2026). Sur le mainnet, la chaîne refuse les nouveaux enregistrements de signataires liés ; considérez la carte comme un aperçu à cet endroit.
:::

:::caution Un signataire lié est une véritable autorité sur le compte
La permission que vous accordez détermine sur quelle voie la clé peut agir, et non quelle quantité elle peut déplacer, et un enregistrement reste valide 30 jours. Ne liez qu'une clé en laquelle vous avez autant confiance qu'en le compte lui-même, et révoquez-la lorsque vous n'en avez plus besoin.
:::

Pour le modèle de permissions et de limites de dépenses, voir [Signataires liés et limites de dépenses](/qorex/security-and-recovery#linked-signers) dans la documentation QoreX.

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/wallet](https://dashboard.qorechain.io/wallet). Une connexion est requise : si vous êtes déconnecté, la page redirige vers la connexion.
- **Réseau :** le commutateur de l'en-tête détermine la vue obtenue (mainnet non custodial, testnet custodial). Sur le mainnet, acceptez d'abord la reconnaissance unique.
- **Portefeuilles :** aucun n'est nécessaire sur le testnet. Sur le mainnet, utilisez QoreX (application ou extension) pour envoyer et staker ; Keplr ou MetaMask pour consulter et recevoir.
- **Coûts :** aucun de la part du Dashboard. Les transactions on-chain paient les frais réseau (plancher de 0.1 uqor par gas).
- **Fonds :** des QOR testnet depuis le [Faucet](/dashboard/faucet). Les QOR mainnet doivent déjà se trouver sur votre compte.

## Où c'est publié {#where-published}

| Surface | Adresse | Réseaux | Notes |
| --- | --- | --- | --- |
| Page Wallet | `dashboard.qorechain.io/wallet` | Mainnet (non custodial) et testnet (custodial) | Connexion requise |
| Connexion et envoi QoreX | Application et extension QoreX (voir [QoreX](/qorex/overview)) | Mainnet uniquement | Les flux QoreX du Dashboard sont fixés sur le mainnet |
| Panneau d'ajout de réseau | Sur la page Wallet | Les deux | Aussi sur l'aperçu de l'[Explorer](/dashboard/explorer) |

## Limites et problèmes connus {#limits}

- **Le testnet n'a ni interface de staking ni connexion QoreX.** Le staking et l'onglet Rewards sont réservés au mainnet.
- **L'historique mainnet se limite aux 10 dernières transactions.** Ouvrez l'adresse dans l'Explorer pour en voir davantage.
- **Keplr et MetaMask :** Keplr peut consulter et recevoir ; MetaMask peut consulter et recevoir, et envoie depuis MetaMask une fois une fenêtre EVM ouverte. Aucun des deux n'envoie ni ne stake sur le rail Native depuis le Dashboard.
- **Phantom** ne peut pas être connecté ; les adresses Phantom liées auparavant restent listées.
- **L'enregistrement de signataires liés** fonctionne sur le testnet et est désactivé sur le mainnet ; il exige que Keplr signe.
- **Pas sur le Dashboard :** la redélégation (faites-la dans QoreX), un écran de staking à verrouillage temporel, et une liste de jetons sur le mainnet.
- **L'onglet Tokens sur le testnet** ne montre que les jetons émis par le Dashboard, pas les jetons du fest.

## Pages associées

- [Opérations sur les jetons](/user-guide/token-operations) - les concepts derrière les transferts de QOR et les dénominations.
- [Staking et validateurs](/dashboard/staking-and-validators) - déléguez, retirez et réclamez depuis la page Wallet.
- [Trade](/dashboard/trade) - l'écran d'échange de jetons de test.
