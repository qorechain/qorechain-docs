---
slug: /dashboard/explorer
title: Explorer
sidebar_label: Explorer
sidebar_position: 2
---

# Explorer

L'**Explorer** est la fenêtre en lecture seule sur la chaîne : recherchez des blocs, des transactions, des adresses et des validateurs, et observez l'activité du réseau. Il s'adresse à toute personne qui veut vérifier un transfert, inspecter un compte, voir quelle signature a protégé une transaction ou examiner l'ensemble des validateurs. Il existe deux explorers : celui intégré au Dashboard à `dashboard.qorechain.io/explorer`, et une application publique distincte sur [explore.qore.network](https://explore.qore.network) qui ne nécessite aucun compte. Ce sont deux applications différentes et elles n'appliquent pas les mêmes règles de libellé ; cette page couvre donc les deux.

## Innovations {#innovations}

- **Un libellé de signature uniquement lorsque la chaîne l'a vérifiée.** Sur l'Explorer du Dashboard, une transaction native n'affiche la carte **PQC Verified** que si elle a réussi (code 0) **et** si la chaîne a émis un événement `pqc_hybrid_verify` avec le statut vérifié. Une transaction échouée n'obtient aucune affirmation post-quantique.
- **Les transactions EVM affichent la fenêtre qui les a autorisées.** À partir de la hauteur d'activation (testnet 5,920,000 ; mainnet 2,981,742), une transaction EVM affiche « Authorised by a PQC window », avec un lien « Window opened by » vers la transaction native signée en ML-DSA-87 qui l'a ouverte. La fenêtre affichée est la dernière ouverture de fenêtre de l'expéditeur à la hauteur de la transaction ou en dessous, qui n'a pas expiré et n'a pas été fermée depuis. Une transaction EVM n'est jamais étiquetée « PQC Verified » : elle porte une signature secp256k1 ordinaire. Voir [Fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window).
- **Aucun libellé post-quantique par bloc.** Les blocs sont signés par des clés de consensus ; la protection est donc indiquée par transaction, jamais par bloc.
- **Statut post-quantique d'un validateur issu de la chaîne.** La page d'adresse d'un validateur comporte un champ « Post-Quantum Crypto » (Enabled, Disabled ou N/A). Enabled signifie que l'opérateur a une clé ML-DSA-87 enregistrée. La preuve de possession est facultative sur la chaîne.
- **Un compte, trois rails.** Un historique `qor1...` fusionne l'activité Native, EVM et SVM, et la page d'adresse affiche le montant encore en vesting et la prochaine date de déblocage.
- **Faits du réseau et points d'accès dans un seul panneau.** ID de la chaîne, ID de chaîne EVM, jeton, décimales, préfixe d'adresse, coin type, prix minimal du gaz, et points d'accès publics copiables, avec un panneau « Add QoreChain to your wallet ».
- **L'explorer autonome repose uniquement sur les points d'accès publics.** [explore.qore.network](https://explore.qore.network) lit les points d'accès publics de la chaîne et ne nécessite aucun compte. Sa page d'adresse affiche les formes `qor1`, `0x` et SVM d'un même compte avec un contrôle de parité en direct (wei = uqor x 10^12 ; lamports = uqor x 1000), et ses routes fonctionnent comme des liens profonds de portefeuille.

## Comment l'utiliser {#how-to-use}

### Vue d'ensemble

Ouvrez **Explorer** dans la barre latérale. La vue d'ensemble affiche :

- l'état du réseau avec une pastille « Post-Quantum Secured » (un libellé au niveau du réseau ; l'affirmation par transaction se trouve sur la page de la transaction) ;
- **Latest Block**, **Block Time** et **Blocks Today** ;
- **Total Bonded**, **Bonded Ratio** et **Circulating** ;
- **Transactions**, **Real Txs**, **Active Set** et **Total Addresses** ;
- **Latest Blocks** et **Latest Transactions**, avec des boutons d'actualisation et un rafraîchissement automatique.

Cliquez sur une ligne de bloc ou de transaction pour ouvrir sa page.

### Recherche

La zone de recherche (texte indicatif « Search QoreChain (Address, Tx, Block)... ») vous dirige selon ce que vous saisissez :

- `qor...` ouvre la page d'adresse.
- `0x...` ou une chaîne de 64 caractères ouvre la page de transaction.
- Des chiffres ouvrent la page de bloc.

:::note Une adresse 0x aboutit à « Transaction Not Found »
La recherche du Dashboard traite une saisie `0x...` comme un hash de transaction. Pour rechercher une adresse EVM, cherchez plutôt sa forme `qor1...` (une adresse `0x` correspond aux mêmes 20 octets que sa forme `qor1`), ou utilisez [explore.qore.network](https://explore.qore.network), dont la page d'adresse accepte les deux.
:::

### Page de transaction

La page de transaction affiche le hash (avec copie), le statut et le type, Block Height, Interactions (From et To), Value & Fees, Memo, Gas Consumed, une ligne inter-chaînes lorsqu'il y en a une, et **Raw Data**. Elle indique aussi ce qui a protégé la transaction, et elle n'avance une affirmation que si la chaîne la confirme :

- **PQC Verified.** Une transaction de la voie native qui a réussi et dont la chaîne elle-même a vérifié la signature hybride (y compris la partie ML-DSA-87). Une transaction échouée, ou sans signature hybride vérifiée, affiche à la place une sécurité standard.
- **Authorised by a PQC window.** Une transaction EVM envoyée alors que l'expéditeur avait une [fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window) ouverte, avec le lien **Window opened by**.

### Page de bloc

Les flèches précédent et suivant permettent de parcourir la chaîne. **Core Information** contient la hauteur, le hash, le proposant, le nombre de signatures et Gas Used ; **Technical Hashes** et **Block Transactions** suivent. Les blocs ne portent aucun libellé post-quantique.

### Page d'adresse

Une adresse QoreChain est un compte unique doté de trois encodages, Native (`qor1...`), EVM (`0x...`) et SVM (base58), et la page d'adresse fusionne l'activité des trois.

- **Copy address** et **Show QR Code** (une fenêtre contextuelle ; il n'y a pas de téléchargement).
- **Total Balance** et **Available**, et une ligne pour le montant encore en vesting avec la prochaine date de déblocage.
- **Total Activity** et l'historique combiné (méthodes telles que Transfer, Faucet Claim et Cross-Chain Swap).
- Sur la page d'adresse d'un validateur (`/explorer/address/qorvaloper1...`), le champ **Post-Quantum Crypto**.

### Validateurs {#validators}

`/explorer/validators` liste les validateurs du réseau. Les cartes récapitulatives affichent **Active Validators**, **Bonded Tokens** et **Consensus Health** (un libellé d'état, pas une valeur mesurée). Le tableau comporte Rank, Validator, Voting Power, Commission, Status et PQC (la colonne PQC du tableau est atténuée pour chaque ligne ; utilisez la page d'adresse du validateur pour son statut réel). La zone de recherche indique « Search validator... ». La liste suit le réseau sélectionné dans l'en-tête. Pour déléguer, consultez [Staking et validateurs](/dashboard/staking-and-validators) ; pour une comparaison plus large avec le rendement et la connexion, consultez [Validators](/dashboard/validators).

### Faits du réseau et ajout au portefeuille

La vue d'ensemble comporte les faits de la chaîne et les points d'accès publics, chacun copiable, ainsi que le même panneau **Add QoreChain to your wallet** que la page Wallet (voir [Ajouter QoreChain à votre portefeuille](/dashboard/wallet#add-network)).

### Explorer autonome {#standalone-explorer}

[explore.qore.network](https://explore.qore.network) est une application web distincte, réservée à l'exploration. Elle s'ouvre sur le **mainnet** et comporte un sélecteur **Testnet / Mainnet** dans son en-tête. Routes :

| Route | Ce qu'elle affiche |
| --- | --- |
| `/` | Hauteur en direct, état, offre, stake bonded, derniers blocs et transactions, faits de la chaîne, points d'accès publics et liens vers les guides. |
| `/blocks`, `/block/{height}` | Liste des blocs et un bloc avec ses transactions. |
| `/txs`, `/tx/{hash}` | Liste des transactions et une transaction avec statut, frais, gas, messages et la réponse brute. |
| `/address/{qor1... or 0x...}` | La page d'identité unifiée avec les trois encodages et le contrôle de parité. `/account/*` redirige vers `/address/*`. |
| `/validators`, `/validator/{address}` | L'ensemble des validateurs avec pouvoir de vote et commission, et un validateur. |
| `/tokens`, `/token/{denom}`, `/assets` | Listes de jetons et d'actifs. |
| `/contracts`, `/nfts`, `/collections` | Contrats, NFT et collections. |

La recherche accepte une hauteur de bloc, un hash de 64 caractères hexadécimaux (avec ou sans `0x`), une adresse `qor1...` ou `0x...`, ou une adresse `qorvaloper1...`. Une recherche `qorvaloper1...` ouvre la liste des validateurs, et non la page de ce validateur. Une section **Add to wallet** propose suggestChain (Keplr, Leap, Cosmostation), EIP-3085 (MetaMask et autres portefeuilles EVM), des instructions RPC personnalisé SVM et l'appariement WalletConnect v2.

Les routes `/tx/`, `/block/` et `/address/` fonctionnent avec les liens d'explorateur de blocs EIP-3085 ; les portefeuilles qui ouvrent une URL d'explorer arrivent donc sur la bonne page.

:::caution N'utilisez pas le /api/lcd de l'explorer depuis du code
L'explorer autonome dispose d'un proxy en lecture seule à `/api/lcd/...` qui sert ses propres pages et qui répond selon le cookie de réseau du navigateur. Ce n'est pas une API publique : elle peut changer, n'est pas dimensionnée pour un usage programmatique et renvoie le réseau que nomme le cookie. Pour les scripts, services et portefeuilles, utilisez plutôt les points d'accès REST publics : `https://api.qore.host` (mainnet) et `https://api-testnet.qore.host` (testnet). Voir [Points d'accès REST et gRPC](/api-reference/rest-grpc-endpoints).
:::

:::note L'explorer autonome n'applique pas encore les règles de libellé PQC du Dashboard
Les règles de [Innovations](#innovations) (un libellé post-quantique uniquement après vérification par la chaîne, et la carte « Authorised by a PQC window » pour les transactions EVM) sont actives dans l'Explorer du Dashboard. L'explorer autonome sur explore.qore.network n'a pas été mis à jour pour elles : sa page de transaction affiche un marqueur de signature hybride qui ne distingue pas encore une transaction échouée, et il étiquette les transactions EVM avec son ancienne formulation. Considérez les libellés de l'Explorer du Dashboard comme la référence.
:::

## Comment y accéder {#how-to-access}

- **Explorer du Dashboard :** [dashboard.qorechain.io/explorer](https://dashboard.qorechain.io/explorer). Choisissez le réseau dans l'en-tête. La **vue d'ensemble** sur le mainnet exige une connexion et la [reconnaissance unique](/dashboard/overview#risk-acknowledgement) ; la vue d'ensemble sur le testnet et **toutes les pages de détail** (transaction, bloc, adresse, validateurs) sur les deux réseaux s'ouvrent sans compte.
- **Explorer autonome :** [explore.qore.network](https://explore.qore.network). Ni compte ni portefeuille. Utilisez le sélecteur de son en-tête pour le testnet.
- **Coût :** gratuit. Aucune connexion de portefeuille n'est nécessaire pour tout lire.

## Où il est publié {#where-published}

| Surface | Adresse | Réseaux | Compte |
| --- | --- | --- | --- |
| Explorer du Dashboard | `dashboard.qorechain.io/explorer` (`/explorer/tx/<hash>`, `/explorer/block/<height>`, `/explorer/address/<address>`, `/explorer/validators`) | Mainnet et testnet, sélecteur de l'en-tête | Vue d'ensemble sur le mainnet uniquement |
| Explorer autonome | `explore.qore.network` | Mainnet (par défaut) et sélecteur testnet | Aucun |
| Données de la chaîne | `api.qore.host`, `api-testnet.qore.host` (REST), `rpc.qore.host`, `rpc-testnet.qore.host` (RPC) | Mainnet et testnet | Aucun |

## Limites et problèmes connus {#limits}

- **Une adresse `0x` saisie dans la recherche du Dashboard** aboutit à « Transaction Not Found ». Utilisez la forme `qor1...`.
- **La colonne PQC** du tableau des validateurs du Dashboard est toujours atténuée. Le statut réel d'un validateur se trouve sur sa page d'adresse.
- **Non affichés :** un compteur d'utilisation de fenêtre par transaction, des preuves post-quantiques pour les blocs, et un indicateur post-quantique par validateur dans le tableau des validateurs.
- **L'explorer autonome** n'a pas encore adopté les règles de libellé du Dashboard (voir plus haut), et une recherche `qorvaloper1...` ouvre la liste des validateurs.
- **Le /api/lcd de l'explorer autonome** est destiné au site lui-même, pas aux programmes.
- **Le réseau suit l'en-tête** sur l'Explorer du Dashboard : un hash de l'autre réseau affiche « not found ».
