---
slug: /dashboard/wallet
title: Portefeuille
sidebar_label: Portefeuille
sidebar_position: 3
---

# Portefeuille

La page **Wallet** est l'endroit où vous consultez votre solde et votre historique de transactions, recevez des QOR et en envoyez. Le fonctionnement de la page dépend du réseau :

- **Mainnet — non custodial.** Le Dashboard ne détient pas les clés mainnet. Vous connectez votre propre portefeuille — **QoreX** (le portefeuille officiel de QoreChain, extension ou application), **Keplr**, ou **MetaMask** — votre solde réel et votre historique sont lus directement depuis la chaîne, et vous pouvez recevoir des fonds sur n'importe quel rail. L'envoi et le staking sur le **rail Native nécessitent QoreX** : les comptes QoreChain signent avec une signature post-quantique hybride, et QoreX est le portefeuille qui la produit, de sorte que les onglets Send et Stake du Dashboard passent par QoreX, quel que soit l'autre portefeuille que vous avez également connecté. Keplr peut tout de même être connecté pour consulter votre solde sur le rail Native (`qor1...`) et pour y recevoir des fonds. **MetaMask** se connecte sur le **rail EVM** (`0x...`) et signe lui-même les transactions EVM, mais depuis la chaîne v3.2.0, la voie EVM n'admet une transaction que depuis un compte disposant d'une clé post-quantique enregistrée **et** d'une fenêtre d'autorisation EVM ouverte. MetaMask ne peut ni enregistrer cette clé ni ouvrir de fenêtre ; QoreX le peut. Voir [Envoyer avec MetaMask](#send-metamask).
- **Testnet — custodial.** Le Dashboard gère un portefeuille de test pour vous, afin que vous puissiez essayer les transferts, les échanges et le staking sans aucune configuration. Alimentez-le depuis le [Faucet](/dashboard/faucet).

Les comptes sont protégés par une cryptographie résistante au quantique, et l'encodage Native de chaque adresse utilise le préfixe bech32 `qor` (`qor1...`).

## Un compte, trois encodages {#one-account-three-encodings}

Un compte QoreChain est une identité unique qui peut s'écrire de trois façons — une par rail d'exécution :

| Rail | Encodage | Ressemble à |
| --- | --- | --- |
| **Native QOR** | bech32 | `qor1...` |
| **EVM** | hex | `0x...` |
| **SVM** | base58 | p. ex. `5Gv7...` |

Les trois encodages pointent vers le **même compte et le même solde**. Les fonds reçus sur n'importe quel rail arrivent dans votre solde unique, et le Dashboard indexe le solde et l'historique via l'encodage `qor1` (Native), de sorte que l'activité de tous les rails s'affiche ensemble.

## Utiliser le Portefeuille sur le mainnet {#mainnet}

1. Basculez l'en-tête du Dashboard sur **Mainnet**.
2. Si vous y êtes invité, acceptez la [reconnaissance des risques unique](/dashboard/overview#risk-acknowledgement) — le mainnet déplace des fonds réels, le Dashboard est non custodial, et les transactions sont irréversibles.
3. Sur l'écran de connexion, choisissez un portefeuille — **Connect with QoreX** (recommandé, le portefeuille officiel de QoreChain — requis pour l'envoi et le staking sur le rail Native), **Connect Keplr** (pour consulter/recevoir sur le rail Native), ou **Connect MetaMask** (pour vous connecter et recevoir sur le rail EVM ; l'envoi nécessite une fenêtre EVM ouverte, voir [Envoyer avec MetaMask](#send-metamask)). Les étapes détaillées pour chacun se trouvent ci-dessous. Phantom ne peut pas être connecté comme portefeuille ici ; voir la note sous [Se connecter avec Keplr](#connect-keplr).
4. La page charge votre solde réel et votre historique de transactions depuis la chaîne.

Une fois connectée, la page Wallet organise tout en six onglets : **Wallet** (solde et résumé du compte), **Send from QoreX**, **Stake / Delegate**, **Rewards**, **Details** (vos adresses `qor1...` / `0x...` / SVM), et **Connect Wallets** (tous les portefeuilles que vous avez rattachés, et l'endroit où en connecter d'autres). Les onglets Send, Stake et Rewards passent par QoreX — c'est vrai même si vous avez également Keplr ou MetaMask connectés, car les transactions sur le rail Native nécessitent la signature post-quantique hybride que produit QoreX.

Si votre portefeuille n'a pas encore QoreChain configuré, ajoutez-le d'abord — voir [Ajouter QoreChain à votre portefeuille](#add-network).

### Se connecter avec QoreX — extension de navigateur {#connect-qorex-extension}

1. Sur la page Wallet, repérez la carte **QoreX wallet** et sélectionnez **Connect with QoreX**.
2. Comme l'extension QoreX est détectée dans ce navigateur, le Dashboard vous demande comment vous souhaitez vous connecter. Sélectionnez **Browser extension**.
3. L'extension QoreX ouvre sa propre fenêtre contextuelle d'approbation, indiquant `dashboard.qorechain.io` comme site demandant la connexion.
4. Vérifiez la demande dans la fenêtre contextuelle et approuvez-la — cela signe une preuve ponctuelle que vous possédez votre adresse `qor1...` ; aucun fonds ne bouge et aucune autre permission n'est accordée.
5. La fenêtre contextuelle se ferme et le Dashboard affiche **Connected: qor1...** sur la carte QoreX, votre adresse débloquant le reste de la page Wallet. Le choix extension/application est mémorisé, donc la prochaine fois que vous sélectionnez **Connect with QoreX** sur ce navigateur, il se reconnecte de la même façon sans redemander — utilisez **Use a different method** sur la carte de connexion si vous souhaitez un jour changer.

Vous pouvez lier plus d'une adresse QoreX au même compte Dashboard — par exemple une depuis une extension Firefox et une depuis Chrome, ou un téléphone et un ordinateur portable. Sélectionnez **Add another wallet** pour répéter le processus avec une deuxième adresse ; chaque adresse liée peut recevoir sa propre étiquette, et l'une d'elles est marquée par défaut pour l'envoi, le tout depuis l'onglet **Connect Wallets**.

**Changer de portefeuille depuis l'onglet Wallet.** Dès que plus d'un portefeuille est rattaché — QoreX et MetaMask, ou deux adresses QoreX —, une rangée de puces de portefeuille introduite par **Viewing** apparaît en haut de l'onglet **Wallet** lui-même, une par portefeuille rattaché, avec celle du portefeuille actif marquée. Cliquez sur une puce pour changer le portefeuille dont vous consultez le solde et l'historique, sans quitter l'onglet ni aller sur **Connect Wallets**. La rangée est masquée lorsqu'un seul portefeuille est rattaché, puisqu'un sélecteur n'aurait alors rien à faire.

**Comptes de votre extension QoreX qui ne sont pas encore liés.** Une même phrase de récupération peut dériver plusieurs comptes, et en créer un dans QoreX n'en informe pas le Dashboard — la liaison est une étape distincte et signée. Lorsque l'extension QoreX peut lister ses comptes, les onglets **Wallet**, **Details** et **Connect Wallets** affichent une carte du type « 2 accounts in your QoreX extension are not linked here », avec le solde de chaque compte (et la part qui est stakée et ne peut donc pas être envoyée). Sélectionnez **Link this account** pour l'appairer ; la liaison permet au Dashboard d'afficher son solde et son historique et n'accorde aucun contrôle sur vos clés. Si votre version de QoreX ne peut pas choisir quel compte prouver, seul le compte actif peut être lié depuis ici — la carte vous indique de basculer d'abord sur ce compte dans QoreX.

Dans l'onglet **Details**, **Linked addresses** liste chaque adresse rattachée à votre compte avec son portefeuille d'origine ; vous pouvez renommer une adresse, en marquer une comme celle par défaut pour l'envoi, et voir si elle est contrôlable dans QoreX ou en simple observation (cadenas).

### Se connecter avec QoreX — application mobile {#connect-qorex-app}

1. Sur la page Wallet, repérez la carte **QoreX wallet** et sélectionnez **Connect with QoreX**.
2. Si le sélecteur d'extension apparaît, choisissez **QoreX app** (si aucune extension n'est détectée dans ce navigateur, le Dashboard passe directement à ce flux).
3. Le Dashboard affiche un code QR et un lien **Open QoreX**.
4. Sur votre téléphone, ouvrez l'application QoreX et scannez le code QR avec elle — ou, si vous naviguez depuis ce même téléphone, appuyez sur **Open QoreX** pour lancer l'application directement via son lien `qorex://connect`.
5. QoreX affiche la demande d'appairage avec l'origine du Dashboard. Vérifiez-la et approuvez-la avec votre confirmation biométrique (Face ID / Touch ID / PIN).
6. Le Dashboard interroge en arrière-plan pour obtenir l'approbation ; en quelques secondes, il affiche **Connected: qor1...** sur la carte QoreX, et votre adresse débloque le reste de la page Wallet.

### Se connecter avec Keplr {#connect-keplr}

Keplr se connecte pour consulter votre solde, votre historique et votre adresse de réception sur le rail Native. L'envoi et le staking sur le rail Native passent par QoreX (voir ci-dessous) — les comptes QoreChain signent avec une signature post-quantique hybride, ce qui explique pourquoi les onglets Send et Stake du Dashboard passent par QoreX plutôt que par le portefeuille que vous connectez ici.

1. Sur la page Wallet, sélectionnez **Connect Keplr**.
2. Si QoreChain n'est pas encore configuré dans Keplr, le Dashboard déclenche l'invite `suggestChain` de Keplr — vérifiez les détails du réseau (ID de chaîne, points de terminaison RPC/REST) dans la fenêtre contextuelle de Keplr et sélectionnez **Approve** pour l'ajouter.
3. Keplr vous demande ensuite de sélectionner le compte à connecter et d'approuver la connexion — sélectionnez **Approve**.
4. Le Dashboard lit votre adresse `qor1...` et charge votre solde et votre historique.

Phantom ne peut pas être connecté comme portefeuille sur la page Wallet du mainnet. Les adresses Phantom liées auparavant apparaissent toujours dans **Connected wallets** ; pour lier une clé Phantom comme signataire, voir [Signataires liés (Phantom)](#linked-signers).

### Se connecter avec MetaMask {#connect-metamask}

1. Sur la page Wallet, sélectionnez **Connect MetaMask**.
2. Si le réseau EVM de QoreChain n'est pas encore ajouté, MetaMask affiche son invite **Add network** (EIP-3085) avec l'ID de chaîne, l'URL RPC et le symbole de la devise pré-remplis — vérifiez-la et sélectionnez **Approve**, puis **Switch network**.
3. MetaMask vous demande quel compte connecter — sélectionnez le compte et confirmez **Connect**.
4. Le Dashboard lit votre adresse `0x...` et charge votre solde et votre historique.

### Envoyer sur le mainnet {#send-mainnet}

Comme le Dashboard ne détient jamais vos clés mainnet, chaque envoi est composé sur le Dashboard mais finalisé dans votre propre portefeuille. Sur le **rail Native**, ce portefeuille est toujours **QoreX** — les onglets Send et Stake passent par lui, quel que soit l'autre portefeuille que vous avez également connecté, car les comptes QoreChain signent avec une signature post-quantique hybride. Sur le **rail EVM**, MetaMask signe la transaction, à condition que le compte possède déjà une clé post-quantique et une fenêtre EVM ouverte (voir [Envoyer avec MetaMask](#send-metamask)).

:::caution Fonds réels, transferts irréversibles
Les transactions mainnet sont irréversibles. Vérifiez toujours deux fois l'adresse du destinataire avant d'approuver.
:::

:::note Soldes en vesting
Si une partie de votre solde est encore en vesting, elle compte dans ce que vous pouvez déléguer pour le staking, mais elle ne peut pas payer de frais de transaction — il vous faut pour cela des QOR séparément disponibles à la dépense, y compris pour enregistrer une clé PQC. Un portefeuille alimenté uniquement par son montant en vesting peut déléguer mais ne peut pas envoyer.
:::

#### Envoyer avec QoreX — extension de navigateur

1. Sur la page Wallet, dans la carte **Send from QoreX**, saisissez le destinataire (une adresse `qor1...` ou un `@handle`), le montant en QOR, et un mémo facultatif. Si vous avez lié plusieurs portefeuilles QoreX, choisissez celui qui paie dans **Send from**.
2. Sélectionnez **Continue in QoreX**.
3. Le Dashboard affiche un bouton **Approve in browser extension** — sélectionnez-le.
4. L'extension QoreX ouvre sa fenêtre contextuelle d'approbation avec le transfert entièrement décodé — destinataire et montant. Vérifiez-le et approuvez-le en utilisant la sécurité propre à votre extension (déverrouillage biométrique ou par mot de passe).
5. L'extension signe le transfert avec une signature PQC hybride et le diffuse directement sur la chaîne — le Dashboard n'apprend jamais que le hash de transaction qui en résulte.
6. La page Wallet affiche **Transfer confirmed** avec le hash de transaction, que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

#### Envoyer avec QoreX — application mobile

1. Sur la page Wallet, dans la carte **Send from QoreX**, saisissez le destinataire (une adresse `qor1...` ou un `@handle`), le montant en QOR, et un mémo facultatif. Si vous avez lié plusieurs portefeuilles QoreX, choisissez celui qui paie dans **Send from**.
2. Sélectionnez **Continue in QoreX**.
3. Le Dashboard affiche un code QR et un lien **Open in QoreX** portant une requête `qorex://tx`.
4. Scannez le code QR avec l'application QoreX, ou appuyez sur **Open in QoreX** si vous êtes sur le même téléphone.
5. QoreX décode la requête et affiche le destinataire et le montant en entier. Vérifiez-les et approuvez avec votre confirmation biométrique.
6. QoreX signe le transfert avec une signature PQC hybride et le diffuse.
7. Le Dashboard interroge le résultat et affiche **Transfer confirmed** avec le hash de transaction dès qu'elle est confirmée on-chain, que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

#### Envoyer vers un @handle

Le champ destinataire de la carte **Send from QoreX** accepte aussi un `@handle` à la place d'une adresse `qor1...`. Ce qui se passe ensuite dépend du fait que vous ayez déjà payé ce handle depuis ce navigateur ou non :

- **Première fois** : l'adresse résolue est affichée en entier avec « First time sending to @handle from this browser. Check the address before you continue: », et vous devez sélectionner **This address is right — continue** avant qu'elle puisse être utilisée — l'adresse n'est mémorisée (épinglée) qu'après confirmation, pas au moment où elle est résolue.
- **Même adresse qu'auparavant** : elle passe avec une confirmation légère — pas besoin de la ressaisir.
- **Une adresse différente d'auparavant** : le flux s'arrête net. L'ancienne et la nouvelle adresse sont toutes deux affichées en entier — jamais tronquées, car la troncature masque précisément les caractères du milieu qu'un attaquant chercherait à rendre similaires — avec un avertissement explicite indiquant que l'adresse a changé, et un bouton **I trust this change — continue** volontairement stylisé en secondaire pour continuer quand même.

Cet épinglage est stocké uniquement dans votre propre navigateur, pas sur un serveur, de sorte qu'un autre ordinateur ou un navigateur réinitialisé affiche à nouveau « première fois » — c'est intentionnel. Les handles comptent 3 à 20 caractères (`a-z`, `0-9`, `_`) et appartiennent à une adresse précise, de sorte qu'une personne possédant plusieurs adresses peut utiliser un handle différent sur chacune. Si la recherche de handle est temporairement indisponible, le champ l'indique et vous pouvez toujours envoyer vers une adresse `qor1...`.

#### Envoyer avec MetaMask {#send-metamask}

:::caution Depuis la chaîne v3.2.0, MetaMask seul ne peut plus envoyer sur le mainnet
La voie EVM n'admet une transaction que depuis un compte qui détient une clé post-quantique enregistrée et dispose d'une **fenêtre d'autorisation EVM ouverte** : une permission bornée dans le temps, en nombre et en valeur, que le compte ouvre avec un message signé de façon post-quantique. MetaMask ne peut pas produire ce message. Si vous envoyez sans fenêtre, la chaîne refuse la transaction (erreurs typiques : pas de fenêtre, fenêtre épuisée, pas de clé post-quantique).
:::

1. Dans **QoreX** (le portefeuille propre du compte), enregistrez la clé post-quantique du compte s'il n'en a pas, puis ouvrez une fenêtre d'autorisation EVM — voir [Fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window). Cela concerne le **compte de type Ethereum (coin 60)** qui partage la clé de MetaMask — ajoutez-le dans QoreX avec **Add an Ethereum account (coin 60)** en utilisant la même phrase de récupération ([comment faire](/qorex/getting-started#restore-dashboard)) ; aucune clé MetaMask ne peut envoyer depuis un compte `qor1…` ordinaire en coin 118. Une fenêtre est bornée en blocs (17,280 au maximum, soit environ 15 heures sur le mainnet), en nombre de transactions (1,000 au maximum) et par un plafond de dépense en QOR qui compte chaque montant **plus** ses frais maximaux. Choisissez des limites qui vous conviennent et gardez-les petites : tant qu'une fenêtre est ouverte, les transactions MetaMask déplacent des QOR sans signature post-quantique. Ouvrir une nouvelle fenêtre remplace la précédente et fait avancer le nonce du compte ; ouvrez-la donc **avant** d'envoyer depuis MetaMask (une transaction préparée plus tôt échoue avec « nonce too low »). Depuis v3.2.3, la chaîne prend aussi en charge des fenêtres plus étroites et à périmètre limité ; QoreX ne propose pas encore d'écran pour elles.
2. Ouvrez MetaMask et vérifiez qu'il est réglé sur le réseau EVM de QoreChain.
3. Sélectionnez **Send** dans MetaMask, saisissez l'adresse `0x...` du destinataire et le montant, vérifiez les frais de gas, puis confirmez.
4. De retour sur la page Wallet du Dashboard, la transaction apparaît dans votre historique dès qu'elle est on-chain (actualisez si elle n'est pas encore apparue).

Chaque transaction consomme une partie de la fenêtre ; lorsque sa limite de durée, de nombre de transactions ou de valeur est atteinte, ouvrez-en une nouvelle dans QoreX. Fermez la fenêtre depuis QoreX lorsque vous avez terminé.

### Recevoir sur un rail spécifique {#receive-mainnet}

1. Sélectionnez **Receive**.
2. Dans la fenêtre de réception, choisissez un rail avec le sélecteur : **Native QOR**, **EVM**, ou **SVM**.
3. La fenêtre affiche votre adresse dans l'encodage de ce rail (`qor1...`, `0x...`, ou base58) avec un code QR et un bouton de copie.
4. Copiez l'adresse, ou laissez l'expéditeur scanner le code QR.

Quel que soit le rail utilisé par l'expéditeur, les fonds arrivent sur le même compte — un compte, trois encodages, un solde.

### Lire votre historique de transactions {#history}

Sur le mainnet, chaque ligne de votre historique affiche :

- Un **badge de rail** — Native, EVM ou SVM — indiquant quel rail la transaction a utilisé.
- **Sent** ou **Received** pour les transferts ordinaires, et un libellé de type descriptif pour les autres activités (par exemple *PQC key registration* ou une action de contrat).
- Le montant, l'heure et un statut **Confirmed** / **Failed**, avec le hash de transaction que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

## Utiliser le Portefeuille sur le testnet {#testnet}

Sur le testnet (`qorechain-diana`), le Dashboard gère un portefeuille de test pour vous, afin que vous puissiez tester les flux de bout en bout sans rien connecter.

### Ce que la page affiche

- L'étiquette de votre portefeuille et l'adresse active, sous forme abrégée, avec un bouton de copie en un clic.
- Votre **solde total** en QOR.
- Un panneau de sécurité indiquant le chiffrement résistant au quantique et le réseau connecté.
- Un indicateur de dernière mise à jour avec une commande d'actualisation.
- Une section **Assets & Activity** avec un onglet **Transaction history** et un onglet **Tokens**.

Utilisez la commande d'actualisation à tout moment pour récupérer votre solde actuel et votre dernière activité depuis la chaîne.

:::caution Les adresses testnet ressemblent exactement aux adresses mainnet
Le testnet et le mainnet utilisent le même format `qor1...`, de sorte qu'une adresse testnet peut être collée dans un retrait d'exchange ou un autre portefeuille sans aucun avertissement — et les QOR réels qui lui sont envoyés arrivent sur le **mainnet**, à cette adresse, où cette page testnet ne peut pas les afficher. N'envoyez jamais de QOR réels à une adresse testnet. Le Dashboard répète cet avertissement à côté de l'adresse sur la page Wallet, dans la liste **My Wallets** et sur l'écran **Receive**. Pour des QOR réels, passez sur Mainnet et utilisez l'adresse qui y est affichée ; si vous avez déjà envoyé de vrais QOR à une adresse testnet, contactez le support — n'essayez pas de les déplacer vous-même.
:::

### Envoyer des QOR (testnet)

1. Sélectionnez **Send**.
2. Saisissez l'adresse du destinataire — **Recipient Address** (`qor1...`).
3. Saisissez le montant — **Amount** (ou **MAX**) — et un mémo — **Memo** — facultatif.
4. Sélectionnez **Review Transaction**, vérifiez les détails et les frais réseau estimés, puis sélectionnez **Confirm & Send**.

Pendant que vous saisissez un destinataire, les contacts enregistrés et les adresses récentes vous sont suggérés pour vous aider à éviter les erreurs. Une fois le transfert soumis, vous recevez une confirmation avec le hash de transaction, que vous pouvez ouvrir dans l'[Explorer](/dashboard/explorer).

### Recevoir des QOR (testnet)

1. Sélectionnez **Receive**.
2. Partagez votre adresse ou son code QR avec l'expéditeur, ou copiez l'adresse en un clic.
3. Saisissez éventuellement un montant demandé et un mémo pour générer un lien de paiement et un code QR téléchargeable.

### Gérer vos portefeuilles de test

Sélectionnez **My Wallets** pour ouvrir votre liste d'adresses. De là, vous pouvez basculer entre les portefeuilles, créer un nouveau portefeuille, importer un portefeuille existant ou supprimer un portefeuille dont vous n'avez plus besoin. Le portefeuille actif est celui utilisé pour les envois, les échanges, le staking et les autres actions signées dans tout le Dashboard sur le testnet.

### Sauvegarder ou exporter la phrase de récupération d'un portefeuille de test {#reveal-recovery-phrase}

Sur le testnet, le Dashboard gère vos portefeuilles pour vous, mais vous pouvez exporter la phrase de récupération de 24 mots d'un portefeuille pour l'importer dans un portefeuille en auto-conservation tel que QoreX.

1. Sur la page **Wallet** du testnet, repérez la carte **Recovery phrase**. Elle liste chacun de vos portefeuilles gérés par le Dashboard avec son solde **mainnet** (les portefeuilles alimentés en premier), afin que vous puissiez choisir celui qui détient réellement vos jetons.
2. Sélectionnez **Reveal** à côté du portefeuille, lisez l'avertissement (« Reveal the phrase for …? »), puis sélectionnez **Continue**.
3. Vous êtes redirigé pour vous reconnecter sur la page de connexion du compte (une nouvelle vérification du mot de passe est requise ; le Dashboard ne voit jamais votre mot de passe) et vous revenez automatiquement au portefeuille.
4. Les 24 mots s'affichent pendant 60 secondes. Notez-les et conservez-les hors ligne. Le compte à rebours se met en pause pendant que vous cochez la case de confirmation ou saisissez les champs de vérification.
5. Cochez **I have written down my recovery phrase and stored it somewhere safe**, saisissez les mots **3**, **5** et **9** de votre copie écrite (marqués *Required*), puis sélectionnez **Confirm backup**. Vous voyez « Recovery phrase saved ».
6. Si vous quittez avec **Hide without confirming** (ou que le minuteur expire), la carte affiche « Backup not confirmed » — rien n'enregistre que vous avez noté la phrase — et propose **Reveal again and confirm**.

Toute personne disposant de ces 24 mots contrôle le portefeuille. QoreChain ne peut jamais les récupérer ni les réinitialiser pour vous, et le support ne vous les demandera jamais.

## Ajouter QoreChain à votre portefeuille {#add-network}

Le panneau **Add QoreChain to your wallet** de la page Wallet (sur le mainnet, il se trouve dans l'onglet **Connect Wallets**, et sous les boutons de connexion tant qu'aucun portefeuille n'est connecté ; sur le testnet, il est en bas de la page) affiche quatre cartes côte à côte — une par méthode de connexion — pour que vous puissiez ajouter QoreChain à votre propre portefeuille en un clic :

| Carte | Ce qu'elle vous apporte |
| --- | --- |
| **Native (Cosmos) wallets** | Les points de terminaison RPC et REST ainsi que l'ID de chaîne, chacun avec un bouton de copie — pour Keplr et les autres portefeuilles du rail Native. |
| **EVM wallets** | Des paramètres réseau EIP-3085 prêts à l'emploi — un clic ajoute QoreChain à MetaMask et aux autres portefeuilles EVM. |
| **SVM wallets** | L'URL RPC SVM pour les portefeuilles et outils compatibles SVM. |
| **Mobile wallets (WalletConnect)** | Un QR d'appairage WalletConnect v2 pour les versions mobiles des portefeuilles compatibles. |

Pour ajouter QoreChain :

1. Ouvrez la page **Wallet** et repérez **Add QoreChain to your wallet**.
2. Choisissez la carte qui correspond au rail de votre portefeuille.
3. Sélectionnez le bouton d'ajout (**Add to Keplr** / **Add to Cosmostation**, **Add to MetaMask** ou votre autre portefeuille EVM, ou l'appairage WalletConnect), ou copiez les points de terminaison et l'ID de chaîne dans le formulaire d'ajout de réseau de votre portefeuille (la carte SVM fournit l'URL RPC SVM à coller dans un réglage de RPC personnalisé).
4. Approuvez le nouveau réseau dans votre portefeuille.

Les points de terminaison publics sont `rpc.qore.host` (RPC Native), `api.qore.host` (REST), `evm.qore.host` (JSON-RPC EVM) et `svm.qore.host` (RPC SVM), avec des variantes `*-testnet` (par exemple `rpc-testnet.qore.host`) pour le testnet. IDs de chaîne : mainnet `qorechain-vladi` (ID de chaîne EVM `9801`), testnet `qorechain-diana` (ID de chaîne EVM `9800`).

### Signataires liés (Phantom) {#linked-signers}

La carte **SVM wallets** vous permet aussi de lier une clé Phantom à votre compte en tant que **signataire lié** — un authentificateur révocable et limité dans le temps (30 jours), et non une connexion de portefeuille principal distincte comme QoreX, Keplr ou MetaMask. Sélectionnez **Connect Phantom**, puis **Register authenticator** ; votre portefeuille existant signe l'enregistrement, et Phantom ne devient jamais sa propre identité.

:::caution L'enregistrement de signataires liés est actuellement désactivé sur la chaîne
Les fonctionnalités de compte intelligent et de portefeuilles liés de la chaîne sont implémentées mais désactivées sur le mainnet et activées sur le testnet (`abstractaccount.enabled` vaut `false` sur le mainnet ; vérifiez `GET /qorechain/abstractaccount/v1/config`), et la chaîne du mainnet refuse les nouveaux enregistrements de signataires liés tant qu'il en est ainsi. Sur le mainnet, considérez la carte comme un aperçu pour l'instant et ne vous attendez pas à ce qu'un enregistrement aboutisse.
:::

:::caution Un signataire lié est une véritable autorité sur le compte
Lorsque la fonctionnalité est activée, la permission que vous accordez détermine sur quelle voie la clé peut agir, et non quelle quantité elle peut déplacer, et un enregistrement reste valide 30 jours. Ne liez qu'une clé Phantom en laquelle vous avez autant confiance qu'en le compte lui-même, et révoquez-la lorsque vous n'en avez plus besoin.
:::

Pour le modèle de permissions et de limites de dépenses on-chain, voir [Signataires liés et limites de dépenses](/qorex/security-and-recovery#linked-signers) dans la documentation QoreX.

## Pages associées

- [Opérations sur les jetons](/user-guide/token-operations) — les concepts derrière les transferts de QOR et les dénominations.
- [Trade](/dashboard/trade) — échangez des jetons (actuellement des jetons de test).
