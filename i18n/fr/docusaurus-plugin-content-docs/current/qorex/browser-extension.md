---
slug: /qorex/browser-extension
title: Extension navigateur QoreX
sidebar_label: Extension navigateur
sidebar_position: 2
---

# Extension navigateur QoreX

L'**extension navigateur** QoreX est le portefeuille QoreChain de bureau. C'est un **portefeuille autonome** — créez ou importez un portefeuille, détenez et envoyez des QOR, et connectez-vous à des dApps — et c'est elle qui permet à n'importe quel site web de découvrir QoreX et de transformer chaque requête en une approbation explicite et décodée.

Elle est **en ligne et publique** sur trois boutiques (Chrome, Firefox et Safari) ; Chrome a actuellement une version de retard sur les autres — voir [quelle version est en ligne où](#versions).

## Installation {#install}

| Navigateur | Installation |
|---|---|
| **Chrome et navigateurs Chromium** (Brave, Edge, Arc, Opera) | https://chromewebstore.google.com/detail/qorex/cflpnggbnnifibblifgbeobogdpfjpcg |
| **Firefox** (Firefox 140 ou ultérieur) | https://addons.mozilla.org/firefox/addon/qorex/ |
| **Safari (macOS 12 ou ultérieur)** | https://apps.apple.com/us/app/qorex-wallet/id6794132220 |

### Quelle version est en ligne où {#versions}

Version actuelle sur chaque boutique, au **23 octobre 2026** :

| Boutique | Version actuelle |
|---|---|
| Chrome Web Store | 0.3.8 |
| Firefox Add-ons | 0.3.8 |
| Safari (Mac App Store, app macOS **QoreX Wallet**) | 1.7.8, qui embarque l'extension 0.3.8 — le Mac App Store utilise sa propre numérotation `1.x` |

Les revues des boutiques n'arrivent pas au même moment, donc une boutique peut servir une version plus ancienne qu'une autre ; la fiche de la boutique affiche toujours sa version actuelle. Cette page décrit l'ensemble de fonctionnalités de la 0.3.7, que toutes les boutiques proposent désormais (la 0.3.8 est la version actuelle). Voir aussi [Quelle version est en ligne où](/qorex/overview#versions).

Depuis la 0.2.6, l'extension a gagné : [plusieurs portefeuilles avec un seul mot de passe](#wallets), un [compte de type Ethereum que vous ajoutez à la main](#coin60), [Claim & restake](#stake), une liste **Unstaking en cours**, l'[ajout d'un jeton par contrat](#custom-tokens), [Recevoir sur n'importe quel réseau](#receive), les [Sites connectés avec Révoquer](#connected-sites), la [fenêtre d'accès EVM](#evm-window), [`signAndBroadcast` pour les dApps](#sign-and-broadcast), et des écrans d'approbation qui montrent chaque message, les frais et l'expiration.

**La surface de permissions n'a pas changé depuis la 0.1.3** — voir [Quelles permissions QoreX demande](#permissions).

:::note
Sur Safari, les approbations s'ouvrent dans un onglet de navigateur plutôt que dans une fenêtre popup — l'extension est empaquetée avec le wrapper d'extension web Safari d'Apple, à partir de la même base de code.
:::

## Créer ou restaurer un portefeuille {#wallet}

Ouvrez le popup et choisissez :

- **Créer un nouveau portefeuille** — choisissez un mot de passe (au moins 8 caractères) ; QoreX génère une nouvelle phrase de récupération de 24 mots sur votre appareil (entropie 256 bits), dérive votre identité QoreChain, et la scelle dans le coffre-fort sous ce mot de passe (et, en option, une clé d'accès — voir [Sécurité](#security)). Les 24 mots ne sont affichés qu'**une seule fois** — notez-les, cochez *J'ai conservé ma phrase de récupération en lieu sûr*, puis continuez. Vous pouvez les afficher de nouveau plus tard avec **Révéler la phrase de récupération** dans le popup (mot de passe requis).
- **Importer une phrase de récupération** — restaure à partir d'une phrase existante. Une phrase de moins de 24 mots restaure normalement vos fonds, mais QoreX vous avertit que votre clé post-quantique n'a alors que la robustesse de la phrase ; pour une robustesse maximale, créez un nouveau portefeuille de 24 mots et déplacez-y vos fonds.

:::danger Notez la phrase avant de continuer
Le coffre-fort de l'extension n'existe que dans ce navigateur. **Supprimer l'extension, effacer ses données ou réinitialiser le navigateur supprime vos clés**, et personne — y compris QoreChain Association — ne peut les restaurer. Sans vos 24 mots notés, vos fonds sont perdus à jamais. Voir [Sauvegarder maintenant](/qorex/security-and-recovery#back-up-now).
:::

L'extension détient ses propres clés ; elle ne nécessite pas l'app mobile. Les clés ne quittent jamais l'appareil.

## Plusieurs portefeuilles et comptes {#wallets}

- **Portefeuilles** (depuis la 0.3.3) — l'écran **Portefeuilles** du popup (« Portefeuilles dans ce navigateur ») liste tous les portefeuilles de ce navigateur. Chacun a sa propre phrase de récupération ; **un seul mot de passe** les déverrouille tous, et changer de portefeuille modifie celui que QoreX affiche et avec lequel il signe (rien ne bouge sur la chaîne). **Ajoutez** un portefeuille en en créant un nouveau (sa phrase est affichée une seule fois) ou en en restaurant un ; votre mot de passe est demandé une fois pour resceller le coffre-fort. Ajouter ou supprimer un portefeuille désactive le **déverrouillage par clé d'accès** — réactivez-le depuis l'écran d'accueil. Pour en supprimer un, appuyez sur *Supprimer de ce navigateur* et saisissez votre mot de passe ; le dernier portefeuille ne peut pas être supprimé depuis cet écran. La suppression efface cette clé du navigateur — seule sa phrase de récupération la ramène.
- **Comptes** (depuis la 0.2.2) — **Vos comptes** crée plusieurs comptes à partir de la même phrase et permet de basculer entre eux (jusqu'à 20 par portefeuille ; ils sont numérotés et ne peuvent pas être renommés). Restaurer la phrase que vous avez notée ramène le **Compte 1** ; ajoutez de nouveau les autres avec **Ajouter un compte**. Changer de compte déplace tout avec lui : l'envoi, le staking, la réception et votre @handle suivent le compte actif.

### Compte de type Ethereum {#coin60}

Depuis la 0.3.2, **Ajouter un compte Ethereum (coin 60)** (sur l'écran **Vos comptes**) ajoute le compte d'une phrase utilisée pour la première fois dans MetaMask ou sur le Dashboard ; voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard). Son adresse 0x est celle que MetaMask affiche pour les mêmes mots. Les handles ne sont pas proposés sur ce compte.

Le Portfolio, le Q-Day Scanner, la récupération sociale, le Legacy Protocol, les demandes de paiement, la connexion au compte et la liaison d'appareils restent réservés au mobile — voir [QoreX Wallet](/qorex/overview#platform-availability).

## Votre compte, solde et @handle {#account}

L'écran d'accueil du popup affiche votre adresse `qor1…` (appuyez pour copier) et votre solde QOR en direct, afin que vous n'ayez pas besoin d'ouvrir un explorateur de blocs pour vérifier l'un ou l'autre.

### Soldes en vesting (verrouillés) {#vesting}

Si votre compte détient des QOR en vesting (par exemple une allocation TGE non encore libérée), le solde se divise en **disponible maintenant** et **encore verrouillé**, et un envoi qui dépasse le montant disponible est refusé avant d'atteindre le réseau plutôt que d'échouer sur la chaîne après avoir prélevé des frais. QoreX ne montre délibérément **pas** de « prochaine date de déblocage » ici : un calendrier de vesting peut être modifié par la gouvernance, donc une date sur la carte de solde se lirait comme une promesse que QoreX ne peut pas garantir. La répartition disponible-contre-verrouillé est ce qui reste exact.

### Réclamer un @handle

Réclamer un **@handle** unique (par exemple `@liviu`) nécessite un **compte connecté** et se fait **dans l'app mobile** ; l'extension vous y renvoie et ne réclame pas elle-même de handles. Une fois réclamé, le handle se lie à cette adresse, de sorte que l'extension le résout lorsque vous le payez et que d'autres peuvent vous payer par votre nom. Voir [@handle](/qorex/account-and-dashboard#handle) pour savoir comment les handles sont liés aux adresses (et non à un portefeuille dans son ensemble).

## Envoyer vers un @handle {#handle-send}

Depuis la 0.1.9, vous pouvez payer un @handle enregistré directement au lieu de rechercher une adresse (les recherches étaient interrompues par un défaut dans les versions jusqu'à la 0.3.6 et fonctionnent de nouveau à partir de la 0.3.7) :

1. Ouvrez le popup et appuyez sur **Envoyer**.
2. Dans le champ destinataire, tapez `@` suivi du handle (par exemple `@liviu`) au lieu d'une adresse `qor1…`.
3. QoreX résout le handle et vous montre l'**adresse résolue** avant que vous signiez quoi que ce soit — vérifiez toujours cela par rapport à ce que vous attendez.
4. Saisissez le montant et confirmez.

La résolution est vérifiée de deux façons avant que QoreX ne l'utilise : une attestation de registre vérifiée par rapport à une clé de confiance intégrée à l'extension, et la signature propre du détenteur du handle sur la réclamation. Une réponse qui échoue à l'une ou l'autre vérification est rejetée d'emblée — QoreX ne se rabat pas sur l'affichage d'une adresse non vérifiée. La première fois que vous payez un handle donné, QoreX mémorise (épingle) l'adresse vers laquelle il a résolu ; si ce handle résout plus tard vers une adresse **différente**, QoreX s'arrête et vous montre l'ancienne et la nouvelle adresse en entier afin que vous puissiez décider de continuer ou non. Cette mémoire vit **par navigateur** — payer le même handle pour la première fois depuis un navigateur ou un ordinateur différent l'affichera là aussi comme nouveau. C'est normal, pas une erreur.

## Recevoir {#receive}

Appuyez sur **Recevoir** dans le popup pour afficher votre adresse `qor1…` sous forme de code QR (avec l'icône QoreChain intégrée) accompagné d'un bouton de copie — scannez-le depuis un téléphone ou collez directement l'adresse.

**Sélecteur de réseau.** Recevoir peut aussi afficher l'adresse pour Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis et Celestia, chacune avec un avertissement « uniquement ce réseau » (QoreChain reste en premier).

## Staker depuis l'extension {#stake}

Depuis la **0.2.2**, le popup dispose de son propre écran **Stake** — un portefeuille créé uniquement dans l'extension n'a plus besoin de l'app mobile pour gagner des récompenses de staking.

1. Ouvrez le popup et allez dans **Stake**.
2. L'écran liste les validateurs actifs avec leur commission, votre total actuellement staké, et toute récompense en attente de réclamation. Les validateurs que le réseau a **jailés** (mis en prison) sont exclus de la liste — déléguer à l'un d'eux n'est jamais souhaitable.
3. Pour déléguer, choisissez un validateur et un montant, puis confirmez. QoreX signe avec la signature post-quantique hybride obligatoire, comme pour un envoi. Pendant que vous saisissez, il vous avertit si le montant laisserait moins que les frais d'une transaction (vous ne pourriez plus unstaker ni réclamer tant que le compte ne détient pas de nouveau des QOR). Avec plusieurs comptes, choisissez celui qui stake depuis le sélecteur de compte de l'écran Stake.
4. **Claim** (réclamer) collecte les récompenses ; **Claim & restake** les recompose vers les validateurs qui les ont générées en une seule transaction. QoreX vérifie d'abord que vos QOR **déverrouillés** peuvent payer les frais (ils sont payés avant l'arrivée des récompenses) et vous le signale si ce n'est pas le cas.
5. **Unstake** (annuler le staking) démarre la période de déliaison (unbonding) de 21 jours et le montant apparaît sous **Unstaking en cours** avec le temps restant — voir [Staking & Délégation](/user-guide/staking-and-delegation).
6. **Déplacer le stake** déplace le stake vers un ou plusieurs autres validateurs (redélégation) — pas d'attente de déliaison, pas de pénalité, et les récompenses continuent de s'accumuler. Voir [Déplacer le stake entre validateurs](/qorex/portfolio-and-staking#move-stake).

Le staking, la délégation et les récompenses se déroulent exclusivement sur la voie **Native**, jamais via un précompilé EVM.

### Approuver une requête de staking du Dashboard {#stake-dashboard}

Le [Dashboard](/dashboard/staking-and-validators) QoreChain compose les requêtes de staking mais ne peut pas les signer — votre clé ne quitte jamais le coffre-fort de l'extension. Lorsque vous cliquez sur **Continuer dans QoreX** sur le Dashboard, la requête s'ouvre dans l'extension pour que vous la révisiez (validateur et montant) et l'approuviez, exactement comme pour un envoi.

:::note Si une transaction s'affiche comme « rétrogradée » plutôt que réussie
Le Dashboard affiche parfois une transaction comme **rétrogradée** plutôt que comme un succès net. Cela signifie que vos fonds se sont bien déplacés, mais que la couche de signature post-quantique n'a pas été trouvée sur la chaîne pour cette transaction — ce n'est pas quelque chose que vous avez mal fait, ni quelque chose que vous pouvez corriger de votre côté. C'est un défaut de notre côté ; merci de le signaler au support afin que nous puissions enquêter. Le message reste délibérément affiché à l'écran plutôt que de s'effacer, afin que vous ayez le temps de le lire et de le signaler.
:::

### Envoyer sur des réseaux externes {#send-external}

Outre les QOR sur la voie Native, le popup peut envoyer des actifs sur des réseaux externes, tous dérivés de la même phrase de récupération (pour les réseaux EVM, il affiche les **frais réseau maximaux** — « Frais réseau : au plus … » — avant que vous confirmiez) :

| Type | Réseaux | Jetons intégrés |
|---|---|---|
| EVM | Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche C-Chain | Entrées ERC-20 (USDC et USDT sur les chaînes EVM, DAI sur Ethereum) |
| SVM | Solana | Entrées SPL (USDC, USDT) |
| Cosmos | Cosmos Hub, Osmosis, Celestia | Noble USDC via IBC ; champ mémo optionnel |

Avant qu'un transfert externe ne soit envoyé, vous devez cocher une reconnaissance explicite : **« Les réseaux externes n'acceptent que des signatures classiques — contrairement à vos QOR, ce transfert n'est PAS résistant au quantique. »** Les chaînes externes ne peuvent pas porter de signature post-quantique, et QoreX ne le cache jamais.

## Standards de portefeuille pris en charge {#standards}

QoreX expose trois interfaces, toutes injectées sur la page en tant que `window.qorex` (`{ evm, native, svm }`) et découvertes via les contrats de détection [`@qorechain/connect`](/sdk/overview).

| Standard | Ce que c'est | Ce que cela signifie pour vous en tant que développeur |
|---|---|---|
| **EIP-1193** | L'API JavaScript du fournisseur Ethereum (`request(...)`, événements). | Le fournisseur EVM de QoreX répond aux requêtes de compte et de réseau — `eth_requestAccounts`, `eth_accounts`, `eth_chainId` et `wallet_switchEthereumChain` (toute autre chaîne renvoie le code standard `4902`). Il ne signe **pas** et n'envoie **pas** encore de transactions ni de messages EVM : les autres méthodes renvoient « EVM method … not yet supported ». Utilisez MetaMask ou un autre portefeuille EVM pour les transactions de la voie EVM (qui nécessitent désormais aussi une [fenêtre d'accès EVM](#evm-window) ouverte). |
| **EIP-6963** | Découverte de fournisseur multi-portefeuille (événements announce / request). | QoreX s'annonce aux côtés de tous les autres portefeuilles — il **n'écrase jamais `window.ethereum`** — de sorte que l'utilisateur choisit QoreX par site sans conflit. |
| **Fournisseur Native (façon Keplr)** | `window.qorex.native` : `enable`, `getKey`, `signDirect` et `signAndBroadcast`, plus une liste `capabilities`. Ce n'est **pas** un remplaçant complet de Keplr — QoreX ne crée pas d'alias `window.keplr` et n'a ni `getOfflineSigner`, ni `signAmino`, ni `sendTx`. | Pour envoyer une transaction QoreChain, appelez **`signAndBroadcast`** (voir [Envoyer une transaction QoreChain](#sign-and-broadcast)) : QoreX montre les messages décodés et les frais, ajoute la signature post-quantique hybride que seul le portefeuille peut produire, puis diffuse. `signDirect` sur QoreChain est refusé à moins que la transaction ne porte déjà une couche résistante au quantique valide. |
| **Solana Wallet Standard** *(depuis la 0.1.5)* | Découverte native de portefeuille pour les dApps Solana (`wallet-standard:register-wallet` / `app-ready`). | Les dApps Solana **détectent automatiquement QoreX** — aucune intégration personnalisée nécessaire. Fonctionnalités : `standard:connect`, `standard:disconnect`, `standard:events`, `solana:signMessage`, `solana:signTransaction`, `solana:signAndSendTransaction` ; chaîne `solana:mainnet` ; transactions `legacy` et `v0`. |

:::note Atteindre directement la voie SVM
La même interface est aussi disponible sur `window.qorex.svm` (`connect` / `signAndSendTransaction` / `signMessage`). La découverte automatique via Wallet-Standard et la voie SVM pleinement implémentée sont sorties en **0.1.5** et sont en ligne à la fois sur Chrome et Firefox (voir [quelle version est en ligne où](#versions)).

Les approbations Solana affichent **une ligne par instruction**, décodée lorsque QoreX le peut : transferts de SOL (destinataire et lamports), transferts de jetons SPL, **« AUTORISER la DÉPENSE de vos jetons »** (approve), **« CÉDER le contrôle du compte »** (set authority) et fermeture d'un compte de jeton — et indiquent « instruction que QoreX ne peut pas lire » pour tout le reste, avec le programme. Une requête qui inclut une instruction approve ou set authority est titrée « veut un pouvoir sur vos jetons Solana — lisez chaque ligne ci-dessous ». Les transactions qui ne listent pas votre portefeuille comme signataire sont rejetées, `signMessage` ne signera pas des octets qui sont en réalité une transaction, et la signature est marquée **classique** — voir [Signature post-quantique](#pqc).
:::

## Pièces et jetons {#custom-tokens}

L'écran **Pièces et jetons** du popup vous permet d'ajouter un **jeton ERC-20 par son contrat** : choisissez le réseau, collez l'adresse du contrat, **Vérifier le contrat**. QoreX lit le nom et les décimales du jeton depuis le contrat lui-même — et les relit en arrière-plan lorsque vous l'ajoutez, plutôt que de se fier au popup — puis les affiche avec un rappel que n'importe qui peut créer un jeton avec n'importe quel nom. Le jeton apparaît ensuite dans **Envoyer sur des réseaux externes**. Il refuse les jetons intégrés, les doublons, les réseaux non EVM, les adresses invalides, les contrats illisibles et les contrats qui empruntent le nom d'un jeton intégré.

## Sites connectés {#connected-sites}

**Sites connectés** dans le popup liste chaque site que ce portefeuille a approuvé — un site peut voir l'adresse de ce portefeuille et vous demander de signer. Appuyez sur **Révoquer** pour en retirer un. Les approbations sont conservées **par portefeuille** : un site approuvé pour un portefeuille ne peut pas lire l'adresse d'un autre portefeuille après que vous avez changé.

## Fenêtre d'accès EVM {#evm-window}

L'écran **Fenêtre d'accès EVM** du popup ouvre et ferme la fenêtre qui permet à un compte de type Ethereum (coin 60) d'envoyer sur la voie EVM de QoreChain (v3.2.0 et ultérieures) — le même écran que dans l'app, avec les mêmes limites (jusqu'à 17,280 blocs et 1,000 transactions, et un plafond en QOR qui compte chaque montant plus ses frais maximaux). Voir [Fenêtre d'accès EVM](/qorex/security-and-recovery#evm-window).

## Langue {#language}

L'extension parle les mêmes dix langues que l'app mobile, le dashboard et le site : anglais, roumain, allemand, espagnol, français, italien, turc, arabe, japonais et coréen. Elle suit par défaut la langue de votre **navigateur** (avec repli sur l'anglais pour tout le reste) — notez qu'il s'agit d'une source différente de l'app mobile, qui suit la langue du **téléphone**, donc les deux peuvent afficher des langues différentes si votre téléphone et votre navigateur sont configurés différemment. Un sélecteur sur l'écran d'accueil du popup vous permet de remplacer la langue détectée à tout moment ; passer à l'arabe bascule immédiatement le popup en écriture de droite à gauche, pas seulement le texte.

## Sécurité et permissions {#security}

QoreX est conçu pour être vérifiable, pas seulement digne de confiance :

- **Coffre-fort** — vos clés sont scellées avec **AES-256-GCM**. Le chemin par mot de passe dérive sa clé avec **Argon2id** (RFC 9106, gourmand en mémoire : 64 Mio, t=3, p=1), de sorte qu'un blob de coffre-fort exfiltré résiste au cassage par GPU/ASIC. (Les blobs PBKDF2 hérités restent ouvrables et se rescellent en Argon2id au déverrouillage suivant.)
- **Déverrouillage par clé d'accès (optionnel, depuis la 0.1.5)** — lorsque votre authentificateur prend en charge l'extension **WebAuthn PRF**, QoreX peut déverrouiller le coffre-fort à partir de la sortie PRF de 32 octets de la clé d'accès au lieu d'un mot de passe saisi. Votre mot de passe reste toujours une solution de repli.

  :::note Où apparaît le déverrouillage par clé d'accès
  QoreX détecte la présence de WebAuthn et n'affiche **Activer le déverrouillage par clé d'accès** que là où le navigateur l'expose aux pages d'extension — c'est-à-dire **Chrome et Edge**. Sur **Firefox**, l'option est masquée, car Firefox n'expose pas WebAuthn aux pages d'extension. C'est le comportement attendu, pas un bug.
  :::
- **Manifest V3 + CSP stricte** — `script-src 'self'; object-src 'self'; base-uri 'self'`. Il n'y a **aucun chargement de code distant** après l'installation et pas de `wasm-unsafe-eval`.
- **Pas d'analytique, pas de rapport de plantage, pas de SDK de suivi, pas d'inscription** — l'extension n'a besoin d'aucun compte pour détenir, envoyer ou staker des QOR. Vos clés, votre phrase de récupération, votre coffre-fort et vos approbations ne quittent jamais le navigateur. Elle effectue bien des requêtes réseau : vers les points d'accès publics de QoreChain pour les soldes, l'historique et la diffusion (celles-ci portent votre adresse publique `qor1…`), une recherche de prix (sans adresse), les services publics de tout réseau externe que vous détenez ou consultez (votre adresse publique sur ce réseau), et le registre des @handles (le handle, ou une adresse publique). Ce n'est que si vous utilisez l'[appairage avec le Dashboard](#dashboard-bridge) qu'elle envoie une preuve signée que vous possédez l'adresse. Voir [Ce que QoreX envoie sur le réseau](/qorex/overview#data-and-privacy).

### Quelles permissions QoreX demande, et pourquoi {#permissions}

Cette section existe parce que la fiche Firefox affiche la permission **« Accéder à vos données pour tous les sites web »**, ce qui peut sembler en contradiction avec un portefeuille qui ne déclare aucune permission d'hôte. Voici la vérité exacte, sans fard, tirée du manifeste.

Le `manifest.json` de l'extension déclare :

```json
"permissions": ["storage"],
"host_permissions": [],
"content_scripts": [
  { "matches": ["<all_urls>"], "js": ["dist/content.js"], "run_at": "document_start" }
],
"web_accessible_resources": [
  { "resources": ["dist/inpage.js"], "matches": ["<all_urls>"], "use_dynamic_url": true }
]
```

- **`permissions: ["storage"]`** — la seule permission d'API. Elle stocke le coffre-fort chiffré et vos approbations de connexion par origine **localement**, dans le stockage de l'extension.
- **`host_permissions: []`** — QoreX ne déclare **aucune** permission d'hôte. Elle ne demande pas la capacité de faire des requêtes réseau inter-origines vers des sites arbitraires en votre nom.
- **`web_accessible_resources`** — permet aux pages de charger le propre `inpage.js` de QoreX, le petit script qui expose le fournisseur. `use_dynamic_url` lui donne une adresse propre à chaque session, afin que les sites ne puissent pas identifier l'extension par empreinte en sondant sa présence.
- **`content_scripts` correspond à `<all_urls>`** — c'est la raison honnête pour laquelle Firefox indique *« Accéder à vos données pour tous les sites web »*. QoreX injecte un petit script fournisseur (`content.js` → `inpage.js`) dans **chaque page**. Un content script qui s'exécute sur tous les sites *peut* techniquement lire la page, et les navigateurs décrivent cette capacité avec exactement ce libellé — qu'elle provienne de `host_permissions` ou d'une correspondance de content script.

**Pourquoi le content script s'exécute partout.** Afin que **n'importe quelle** dApp puisse découvrir le portefeuille via EIP-6963 sans que vous ayez d'abord à accorder un accès site par site. C'est ainsi que fonctionnent MetaMask, Keplr, Phantom et tout autre portefeuille injecté : le fournisseur injecté doit être présent avant que les scripts de la page ne s'exécutent (`document_start`), quel que soit le site que vous visitez.

**Ce que ce script fait — et ne fait pas.** Il ne fait que relayer les messages du portefeuille (annoncer le fournisseur, transmettre les requêtes de connexion/signature au service worker, renvoyer le résultat). Il ne lit **pas** le contenu de la page au-delà de ces requêtes de portefeuille, n'envoie rien à un serveur, et ne charge pas de code distant — et il ne peut pas récupérer de données inter-origines arbitraires puisqu'il n'y a aucune permission d'hôte. Tout ceci est vérifiable : l'extension est verrouillée par CSP, n'embarque aucune analytique, et le paquet Firefox inclut une archive source reproductible.

## Connecter une dApp à QoreX {#connect}

Une dApp découvre QoreX via **EIP-6963**. Annoncer-puis-demander, puis utiliser le fournisseur EIP-1193 retourné (qui ne répond qu'aux requêtes de compte et de réseau — voir le tableau ci-dessus) :

```ts
import type { EIP6963ProviderDetail } from "./types";

const wallets = new Map<string, EIP6963ProviderDetail>();

// 1. Collect every wallet that announces itself.
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});

// 2. Ask installed wallets to announce.
window.dispatchEvent(new Event("eip6963:requestProvider"));

// 3. Pick QoreX by its rdns and use the standard EIP-1193 provider.
const qorex = wallets.get("network.qore.qorex");
if (qorex) {
  const accounts = await qorex.provider.request({ method: "eth_requestAccounts" });
  console.log("QoreX EVM account:", accounts[0]);
}
```

Pour la voie **Native** de QoreChain, utilisez le fournisseur sur `window.qorex.native` (`enable`, `getKey`, `signAndBroadcast`, `signDirect` ; lisez `capabilities` pour voir ce que cette version prend en charge). Le package de plus haut niveau [`@qorechain/connect`](/sdk/overview) enveloppe cette détection pour vous.

Les approbations sont **par origine** : la première connexion à un site ouvre un popup d'approbation montrant l'origine, l'approbation ne révèle que votre adresse publique, et l'approbation d'un site n'accorde rien à un autre. Les approbations sont conservées par portefeuille, persistent jusqu'à ce que vous les révoquiez sous **Sites connectés**, et un site peut avoir une requête en attente (trois en tout) ; changer de portefeuille ou verrouiller répond « non » aux requêtes en attente. Voir [Ce que montre la fenêtre d'approbation](/qorex/security-and-recovery#approvals).

### Pont Dashboard (v0.1.5, étendu en v0.2.2) {#dashboard-bridge}

La version 0.1.5 ajoute un pont limité à **`dashboard.qorechain.io` uniquement** : `window.qorex.native.connectProof(sessionId)` signe la preuve d'appairage *Connect with QoreX* (le backend revérifie la signature), et `executeTransfer({ to, amountUqor, memo })` approuve et diffuse un transfert QOR proposé par le Dashboard, en retournant le `txHash`. Ces méthodes sont refusées sur toute autre origine.

**La 0.2.2** ajoute `native:executeRequest`, qui accepte une requête complète proposée par le Dashboard — y compris pour le [staking](#stake-dashboard) — validée par rapport au même analyseur partagé que QoreX utilise partout ailleurs : refusée en cas d'incompatibilité de réseau, d'origine étrangère, d'adresse qui n'est pas la vôtre, de type de requête inconnu, ou de requête de staking portant un `toAddress` (les requêtes de staking n'en ont pas). Les types de requête sont send, delegate, undelegate, redelegate et claim ; une requête Connect vous permet de choisir lequel de vos comptes lier, et `listAccounts()` renvoie vos comptes (en lecture seule).

Comme une adresse `qor1…` est également valide sur le mainnet et le testnet, une requête proposée par le Dashboard indique le réseau qu'elle cible, et QoreX refuse d'agir dessus si cela ne correspond pas au réseau auquel l'extension est actuellement connectée — elle ne changera jamais de réseau au nom d'une requête.

## Envoyer une transaction QoreChain depuis une dApp : `signAndBroadcast` {#sign-and-broadcast}

Chaque transaction QoreChain issue d'un compte disposant d'une clé post-quantique enregistrée nécessite une signature hybride — secp256k1 **et** ML-DSA-87 — et seul le portefeuille détient la clé ML-DSA, donc une page ne peut pas la construire. Envoyez les messages ; QoreX fait le reste : il montre les messages décodés et les frais, construit la transaction pour le compte sélectionné par l'utilisateur, ajoute la signature hybride (en enregistrant d'abord la clé post-quantique du compte s'il s'agit de sa première transaction), diffuse, et se résout avec le résultat. Disponible à partir de l'extension **0.3.5** et de l'app **1.1.5** (toutes les versions des boutiques aujourd'hui).

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");            // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                        // must be the wallet's active network
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],  // protobuf bytes: Uint8Array, number[] or base64
  memo: "",                                          // optional, up to 256 bytes
  gasLimit: 300000,                                  // optional
});
// → { txHash, code, height?, shield }
```

- `chainId` doit être égal au réseau actif du portefeuille (`qorechain-vladi` sur le mainnet). Une dApp ne peut pas changer de réseau ; seul l'utilisateur le peut.
- De 1 à 32 messages par appel ; les octets des messages sont signés exactement tels qu'envoyés.
- Les frais (`gasLimit` × le prix du gas du réseau) sont affichés avant l'approbation. Un rejet lève `QoreX: signature rejected`.
- La gestion des clés post-quantiques (enregistrer, migrer, faire pivoter — y compris dans un `MsgExec` authz) est refusée : le portefeuille gère lui-même la clé du compte.

## Signature post-quantique {#pqc}

Chaque transfert de QOR initié par QoreX lui-même est signé avec une **signature post-quantique hybride** — **ML-DSA-87** (Dilithium-5, NIST **FIPS-204**) aux côtés de la signature classique secp256k1 — en utilisant le pipeline hybride complet dans `@qorechain/sdk`. **Il n'y a pas de bascule** : QoreChain l'exige et QoreX n'envoie jamais un transfert QOR sur la voie Native sans elle.

- **Signature Native initiée par une dApp** — utilisez [`signAndBroadcast`](#sign-and-broadcast) : QoreX décode chaque message, montre les frais et ajoute lui-même la couche résistante au quantique. `signDirect` signe une transaction construite par la page et, sur QoreChain, est **refusé** à moins que cette transaction ne porte déjà une couche résistante au quantique valide (et refusé pour les comptes de type Ethereum, qui utilisent `signAndBroadcast`). QoreX ne signe jamais à l'aveugle : une requête qu'il ne peut pas décoder est refusée, et il ne signe jamais une transaction QoreChain uniquement classique.
- **Les signatures classiques sont toujours étiquetées** — les transferts sur des réseaux externes (ETH, BNB, Solana, …) ne peuvent pas porter de signature post-quantique ; QoreX vous fait cocher une reconnaissance explicite et les marque comme classiques plutôt que de rétrograder silencieusement.

**Ce que cela signifie pour la taille des transactions.** ML-DSA-87 est une signature volumineuse : la signature fait **4 627 octets** et la clé publique **2 592 octets** (fixé par FIPS-204). Une transaction QoreChain hybride est donc plusieurs kilo-octets plus grande qu'une transaction purement classique. Si vous construisez et diffusez des transactions vous-même, dimensionnez vos tampons et estimations de frais en conséquence ; la comptabilité de gaz de QoreChain les anticipe déjà. Voir [Signature post-quantique](/developer-guide/post-quantum-signing) pour les primitives et l'exigence de signature déterministe.
