---
slug: /qorex/send-and-receive
title: Envoyer et recevoir
sidebar_label: Envoyer et recevoir
sidebar_position: 3
---

# Envoyer et recevoir

Cette page couvre l'envoi et la réception de QOR, le paiement d'un @handle, les demandes de paiement, les contacts, l'historique des transactions, la détention d'actifs sur d'autres réseaux et les compléments de l'écran d'accueil. Elle s'adresse à toute personne qui utilise l'application mobile QoreX (l'extension a les mêmes écrans Envoyer et Recevoir, voir [Extension de navigateur](/qorex/browser-extension)). Quand quelque chose diffère entre l'application, l'extension de navigateur et l'extension Safari, le texte le précise.

## Innovations {#innovations}

- **Demandes de paiement signées.** Une demande est un lien signé par la clé de votre propre compte. La personne qui la paie voit QoreX vérifier la signature, le réseau exact et tout @handle avant l'apparition de la vérification habituelle ; un montant ou un destinataire modifié se remarque donc au lieu de passer inaperçu. Voir [Demandes de paiement](#payment-requests).
- **Un statut lu sur la chaîne.** Un transfert est *en attente*, *confirmé* ou *échoué* parce que le réseau le dit, et une demande de paiement n'est marquée *payée* que lorsque la chaîne montre un paiement correspondant. Voir [Historique](#history).
- **Signalement des adresses ressemblantes.** Une adresse qui ne fait que ressembler à une adresse que vous connaissez déjà est signalée avant l'envoi. Voir [Contacts et favoris](#contacts).
- **Des avertissements sur les frais en termes simples.** QoreX vous indique quand les frais dépassent le montant envoyé, et affiche à votre premier envoi les frais uniques d'enregistrement de la clé ainsi que le total.

L'onglet Accueil (Portefeuille) est votre point de départ. Il affiche un **badge réseau** (MAINNET par défaut, ou TESTNET si vous avez activé le bascule développeur), votre **solde total** (appuyez pour masquer/afficher), et les actions principales : **Envoyer · Recevoir · Échanger · Staker** (**Échanger** n'est pas affiché sur iOS). Votre liste d'actifs affiche **QOR** (un solde unifié sur les lanes Native, EVM et SVM, envoyé sur la lane native à signature hybride) et **Tous les réseaux** (une vue unifiée sur ETH, BNB, POL, ARB, et les autres [réseaux externes](#external-networks-tokens) pris en charge par QoreX).

## Envoyer des QOR sur la lane native à signature hybride

1. Appuyez sur **Envoyer**.
2. Saisissez le destinataire sous forme d'adresse `qor1…` **ou** d'un **@handle**. Un handle est résolu et vérifié cryptographiquement (signature du registre + signature du propriétaire + épinglage à la première utilisation) ; si la clé d'un handle venait à changer silencieusement, QoreX affiche un avertissement explicite.
3. Saisissez le montant. L'aperçu affiche le destinataire, le montant, les **Frais de réseau** et l'état de la signature (si le transfert porte ou non la couche ML-DSA-87).
4. Confirmez avec une validation **biométrique**. Chaque transfert QOR natif est signé deux fois : avec une clé classique et avec ML-DSA-87 (FIPS 204). QoreX signe avec cette signature hybride obligatoire et diffuse sur la lane native. Après la diffusion, il vérifie que la transaction validée porte la couche ML-DSA-87 et vous avertit si ce n'est pas le cas.

Sur le premier écran, la zone de saisie rapide (**Demande à QoreX**) vous permet de taper une demande simple comme « send 50 QOR to @maria » et remplit le formulaire pour vous. C'est un simple lecteur de texte qui s'exécute **entièrement sur votre appareil** - rien de ce que vous y tapez n'est envoyé où que ce soit, et ce n'est pas un assistant IA (QoreX n'en a pas). Vous vérifiez toujours tout et confirmez par biométrie comme d'habitude ; s'il ne parvient pas à lire ce que vous avez tapé, il le dit et vous remplissez le formulaire à la main. Vos contacts favoris et vos destinataires récents apparaissent sous forme de pastilles accessibles en un toucher (voir [Contacts et favoris](#contacts)).

QoreChain n'enregistre pas votre clé ML-DSA-87 de lui-même. QoreX le fait pour vous dans le cadre de votre **premier** transfert (de petits frais de réseau uniques), et vous pouvez en voir l'état dans [Sécurité et récupération](/qorex/security-and-recovery#pqc-key). Aucune étape séparée n'est nécessaire dans QoreX.

**La vérification d'un premier envoi affiche le coût d'emblée.** En plus du montant et des **Frais de réseau**, la vérification liste *l'enregistrement unique de la clé ML-DSA-87* avec ses frais, puis le **total des frais** (**Total fees**), pour éviter toute surprise après confirmation. Les envois suivants depuis le même compte n'affichent que les frais de réseau.

**Des frais supérieurs au montant.** Si les frais de réseau dépassent le montant que vous envoyez, la vérification le signale (*"The network fee ... is larger than the amount you are sending ..."*, les frais de réseau sont supérieurs au montant envoyé) à titre de mise en garde. Cela ne bloque jamais l'envoi. QoreX l'affiche pour les envois natifs de QOR et pour la cryptomonnaie propre d'un réseau externe quand les frais sont chiffrés dans cette cryptomonnaie. La réclamation des récompenses de staking fait l'objet du même contrôle, voir [Portefeuille d'actifs et staking](/qorex/portfolio-and-staking#claim).

### Envoyer à un @handle, étape par étape {#handle-send}

1. Ouvrez **Envoyer** et tapez `@` suivi du handle (par exemple `@liviu`) dans le champ destinataire au lieu d'une adresse.
2. QoreX recherche le handle et vous montre **l'adresse `qor1…` résolue** avant que vous confirmiez quoi que ce soit. (Réclamer votre propre handle nécessite un compte connecté et se fait dans l'application - voir [@handle](/qorex/account-and-dashboard#handle).)
3. Vérifiez l'adresse résolue, saisissez le montant, et confirmez comme d'habitude.

QoreX n'accepte une résolution que si elle passe **les deux** vérifications qu'il effectue : une attestation du registre vérifiée par rapport à une clé de confiance épinglée dans l'application, et la propre signature du propriétaire du handle sur la revendication. Si l'une des deux vérifications échoue, une erreur est déclenchée plutôt qu'un repli vers une adresse non vérifiée. La première fois que vous payez un handle donné, QoreX mémorise l'adresse vers laquelle il a été résolu ; si l'adresse de ce handle venait un jour à changer, QoreX s'arrête avant de signer et vous montre l'ancienne et la nouvelle adresse côte à côte afin que vous puissiez décider de continuer ou non. Cette mémoire est **propre à chaque appareil** - payer le même handle pour la première fois depuis un autre téléphone ou une installation neuve le fera apparaître comme nouveau là aussi, ce qui est normal et non une erreur. L'extension de navigateur résout et paie les handles de la même façon (sa mémoire est **propre à chaque navigateur**, donc un autre navigateur ou ordinateur le verra comme nouveau) - voir [Envoyer à un @handle](/qorex/browser-extension#handle-send).

### Envoi de QOR en vesting (verrouillés) {#vesting}

Si une partie de votre solde est encore en **vesting** - par exemple une allocation TGE non encore libérée - votre total est divisé en **disponible maintenant** et **encore verrouillé**. Vous ne pouvez envoyer que la portion disponible ; QoreX refuse lui-même toute tentative de dépense excessive plutôt que de laisser le réseau la rejeter après avoir prélevé des frais. La portion verrouillée devient dépensable progressivement à mesure que le calendrier de vesting la libère. Cette répartition est affichée partout où votre solde apparaît - Accueil, Envoyer, et Détail de l'actif.

## Recevoir {#receive}

Touchez **Recevoir**. L'écran commence par la cryptomonnaie : une **liste consultable** (*Choisissez la cryptomonnaie à recevoir*, zone de recherche *Rechercher une cryptomonnaie ou un réseau*) avec **QOR en premier**, puis la cryptomonnaie propre à chaque réseau pris en charge et les jetons inclus, chacun avec son image et celle de son réseau. Si rien ne correspond à votre recherche, la liste indique *No coin matches your search.* (aucune cryptomonnaie ne correspond). Les images sont livrées avec QoreX ; rien n'est donc récupéré auprès d'un tiers pour dessiner la liste.

- **QOR** affiche votre adresse `qor1...` (et votre @handle, si vous en avez un) sous forme de code QR avec l'icône QoreChain, avec **Copier** et **Partager**. Tout ce qui y est envoyé arrive sur la voie native, où chaque transfert porte une signature classique et une signature ML-DSA-87.
- **Toute autre cryptomonnaie ou tout autre jeton** affiche l'adresse propre à ce réseau et l'avertissement *"Send only \{coin\} or tokens on \{network\} to this address. Coins sent from another network can be lost."* (n'envoyez à cette adresse que cette cryptomonnaie ou des jetons de ce réseau ; les fonds envoyés depuis un autre réseau peuvent être perdus). L'avertissement nomme la cryptomonnaie choisie. Utilisez **Choisir une autre cryptomonnaie** pour revenir à la liste.
- **Réseaux couverts :** Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis et Celestia. Tous les réseaux EVM partagent une seule adresse `0x...`. Vos adresses EVM et Solana sont dérivées de votre phrase de récupération ; QoreX demande donc une confirmation biométrique (**Afficher l'adresse**) avant de les montrer. Les autres réseaux ne peuvent pas porter de signatures ML-DSA-87. Voir [Réseaux externes](#external-networks-tokens).
- **Les jetons personnalisés figurent aussi dans la liste.** Un jeton que vous avez ajouté par adresse de contrat (ou, sur Solana, par adresse de mint) est proposé dans Recevoir avec l'adresse de son réseau, comme un jeton inclus. Voir [Coins et tokens](#coins-and-tokens).
- **Adresses Cosmos Hub, Osmosis et Celestia.** L'adresse affichée est celle avec laquelle vos envois depuis ce réseau sont signés (votre clé coin 118). Des versions antérieures pouvaient afficher une adresse différente pour un compte coin 60 ou suivre le compte actif ; c'est corrigé, et l'envoi vérifie à nouveau l'adresse avant de signer.

L'extension et l'extension Safari proposent la même liste de cryptomonnaies dans **Recevoir**.

## Coins et tokens {#coins-and-tokens}

Un coin sans ligne n'a pas d'adresse pour le recevoir. Pour voir un coin ou un token dans **Portefeuille d'actifs** *avant* d'en détenir, ouvrez Portefeuille d'actifs → **+ Coin ou token** et activez-le (dans l'extension : **Coins et tokens**). Un coin épinglé à zéro ouvre **Recevoir** sur son réseau lorsqu'on appuie dessus. Réglages → **Coins et réseaux** liste tout ce que le portefeuille peut détenir aujourd'hui.

**Ajouter un token par contrat** (réseaux EVM uniquement) :

1. Portefeuille d'actifs → **+ Coin ou token** → **Ajouter un token par contrat** (extension : **Coins et tokens** → *Ajouter un token par contrat*).
2. Choisissez le **Réseau**, collez l'**Adresse du contrat (0x…)** et appuyez sur **Vérifier le contrat**.
3. QoreX lit le symbole et les décimales depuis le contrat lui-même et affiche *« Le contrat indique : \{symbol\} · \{decimals\} décimales »*. N'importe qui peut créer un token et lui donner n'importe quel nom - QoreX ne s'en porte pas garant, assurez-vous donc qu'il s'agit bien du contrat que vous visiez.
4. Appuyez sur **Ajouter \{symbol\}**. Il est marqué *Ajouté par vous* et peut être envoyé comme les tokens intégrés. Supprimez-le à tout moment.

Une fois ajouté, le jeton apparaît aussi dans [Recevoir](#receive).

QoreX refuse un token déjà intégré, un token que vous avez déjà ajouté, un réseau non EVM, une adresse invalide, un contrat qui ne répond pas comme un token, et un contrat qui reprend le nom d'un token que QoreX fournit déjà sur ce réseau (probable copie).

## Demandes de paiement {#payment-requests}

Demandez à quelqu'un un montant en QOR avec un lien signé que vous partagez ou copiez. Cela fonctionne dans l'application, l'extension et l'extension Safari, sur le mainnet et le testnet, et **ne** nécessite **pas** de connexion à QoreX.

**Créer une demande**

1. Ouvrez **Demandes de paiement** (application : Réglages ; extension : un bouton sur l'écran d'accueil).
2. Touchez **Nouvelle demande**, saisissez le **Montant (QOR)** et une **Note** facultative (140 caractères au maximum). Si vous avez un @handle, vous pouvez cocher *Show my @handle on the request* (afficher mon @handle sur la demande).
3. Touchez **Créer le lien**. QoreX signe la demande avec la clé de votre propre compte et affiche *"Your request is ready. Anyone can pay it, in QoreX or in another wallet."* (votre demande est prête ; tout le monde peut la payer, dans QoreX ou dans un autre portefeuille).
4. **Partager le lien** ou **Copier le lien**.

Le lien est signé avec la clé de votre compte ; un montant ou une adresse modifiés sont donc détectés. La clé doit appartenir à l'adresse de réception : personne d'autre ne peut re-signer en votre nom un lien altéré. La signature est uniquement un contrôle d'intégrité du lien ; le paiement lui-même est signé normalement par le payeur, avec la signature hybride sur la voie native. Le format du lien est `qorex://pay?v=1&...` et il désigne le réseau exact (mainnet ou testnet).

Le bouton **Demander** sur l'accueil de l'application sollicite un utilisateur QoreX précis par son @handle (il nécessite la [connexion](/qorex/account-and-dashboard#sign-in) et votre propre @handle). Une fois créée, cette demande peut aussi être partagée sous forme de lien signé.

**Payer une demande**

1. Ouvrez le lien sur un téléphone équipé de QoreX, ou allez dans **Payer une demande** et utilisez **Colle un lien de paiement** (dans l'extension aussi), puis **Ouvrir**.
2. QoreX vérifie la signature, le réseau et tout @handle *avant* de montrer quoi que ce soit à payer. Il affiche ensuite le destinataire, le montant, la note et l'étiquette du mémo, puis la vérification habituelle suit. Vous confirmez comme pour tout envoi.
3. Les messages que vous pouvez voir : *"Signature checked: the request is unchanged since it was signed."* (signature vérifiée : la demande n'a pas changé depuis sa signature), ou un refus tel que *"This link was changed after it was signed. Do not pay it."* (ce lien a été modifié après sa signature ; ne le payez pas), *"This link was not signed by the owner of the receiving address. Do not pay it."* (ce lien n'a pas été signé par le propriétaire de l'adresse de réception) ou *"This request is for \{network\}. Switch the network in QoreX to pay it."* (cette demande concerne un autre réseau ; changez de réseau dans QoreX pour la payer).
4. Si le lien porte un @handle, QoreX le compare au registre des handles : vérifié, premier paiement vers lui, *il pointe désormais vers une adresse différente d'avant* (vérifiez auprès de la personne avant de payer), ou il ne pointe pas vers cette adresse (ne payez pas à moins d'en être sûr). Un avertissement sur un handle demande une seconde confirmation.

Pour l'instant, QoreX ne paie les demandes qu'en QOR. Une demande du testnet indique *"Testnet request. Testnet QOR has no value."* (demande du testnet ; les QOR du testnet n'ont aucune valeur).

**Suivre et réutiliser**

**Mes demandes** liste les demandes que vous avez créées. Chacune affiche **Payée** ou **Pas encore payée**, d'après la chaîne : QoreX recherche un paiement correspondant (l'étiquette du mémo sur le transfert), et la demande n'est marquée comme payée que lorsque la chaîne le montre. Si le réseau ne répond pas, il indique *Status unknown* (statut inconnu), jamais une supposition. **Vérifier le statut** interroge à nouveau. **Réutiliser le mois prochain** crée une nouvelle demande avec les mêmes détails et un nouvel identifiant. Avec un @handle, vous voyez aussi **Demandes qui me sont adressées** et **Demandes envoyées par @handle**.

## Contacts et favoris {#contacts}

Les **Contacts** (application : Réglages ; extension : un bouton sur l'écran d'accueil) sont des noms pour les adresses que vous payez. Ils sont conservés **uniquement sur cet appareil**. Un contact comporte un nom, au plus une adresse par réseau (QoreChain, EVM, Solana, Cosmos) et un @handle facultatif ; la liste contient jusqu'à 200 entrées.

- **Favoris.** Cochez *Favourite (shown on the send screen)* (favori, affiché sur l'écran d'envoi) et le contact apparaît sous forme de pastille accessible en un toucher au-dessus du champ destinataire. Une pastille ne fait que remplir le formulaire : vous vérifiez et confirmez toujours.
- **Répéter le paiement.** Sur un paiement passé (application : son écran de détail ; extension : la ligne de l'historique), **Répéter le paiement** remplit à nouveau le formulaire d'envoi avec le même destinataire, le même montant et le même mémo. Vous vérifiez et confirmez toujours avant que quoi que ce soit ne soit envoyé.
- **Signalement des adresses ressemblantes.** Un contact n'est pas un contrôle de sécurité, et QoreX le dit. Quand une adresse que vous allez payer ne fait que *ressembler* à une adresse que vous connaissez déjà (mêmes premiers et derniers caractères, une ruse des escrocs qui glissent des adresses ressemblantes dans votre historique), la vérification avertit *"Careful: this address only LOOKS LIKE one you already know"* (attention : cette adresse ne fait que ressembler à une adresse que vous connaissez) et affiche l'adresse connue pour la comparer caractère par caractère. Il faut un second toucher (extension) ou une reconnaissance du risque (application). Le contrôle compare avec vos contacts enregistrés, les comptes que vous possédez et les adresses que vous avez payées.
- **Un contact enregistré est nommé dans la vérification** (*Saved contact: \{name\}*). Un @handle enregistré indique aussi si son adresse est la même que lors de votre dernier paiement, nouvelle, ou **modifiée**.

## Historique {#history}

L'Historique montre toutes les transactions QoreChain d'un compte, pas seulement les envois : reçu, staké, retiré du staking, mise déplacée, récompenses réclamées, verrous, bonus, fenêtres EVM, adresse des récompenses et enregistrement de la clé ML-DSA-87, avec le montant, les frais et les transactions échouées marquées *Failed (the fee was still paid)* (échouée, les frais ont tout de même été payés). Le badge hybride n'apparaît que sur une transaction que la chaîne elle-même a vérifiée. Les réseaux externes ne figurent pas encore dans l'Historique.

- **Où.** Application : **Activité**, avec un sélecteur de compte, et un lien **Historique** sur chaque compte dans **Tes comptes**. Extension : **Historique** sur l'écran d'accueil, avec un sélecteur de compte.
- **En attente, confirmée, échouée.** Un transfert que vous venez d'envoyer affiche **En attente : le réseau n'a pas encore confirmé** jusqu'à ce que la chaîne le connaisse. Une transaction que la chaîne n'a pas vue après quelques minutes indique *Not found on the network: it may have failed. Check the transaction before sending again.* (introuvable sur le réseau : elle a peut-être échoué ; vérifiez-la avant de renvoyer). Elle n'est jamais présentée comme envoyée sur une supposition. **Masquer** retire une telle ligne.
- **Par compte.** Chaque compte du portefeuille a son propre Historique.
- **Exporter en CSV.** **Exporter en CSV** écrit l'historique du compte dans un fichier **sur cet appareil**. Il ne contient que votre historique : ni phrase, ni clés. Les colonnes sont fixes et en anglais, et toute cellule qu'un tableur pourrait lire comme une formule (une adresse ou un mémo commençant par `=`, `+`, `-` ou `@`) est préfixée pour s'ouvrir comme du texte.
- **Le spam est masqué.** Les transferts entrants de moins de 0.1 QOR dont le mémo contient un lien ou un domaine sont masqués de l'Activité et des notifications, avec une ligne telle que *"\{n\} likely spam transfers hidden"* (nombre de transferts probablement indésirables masqués) et **Les afficher**. Les transferts de valeur nulle sont masqués. Un mémo contenant un lien porte un avertissement dans le détail de la transaction : QoreChain et QoreX ne vous demandent jamais de visiter un lien envoyé avec un transfert.
- **Nœuds élagués.** Si un nœud ne conserve plus les anciens blocs, QoreX demande une page plus petite jusqu'à ce que le nœud réponde, et le signale quand le réseau est injoignable. Il n'affiche plus de liste vide dans ce cas.

La **page QOR** (touchez QOR sur l'accueil) liste toutes les transactions du compte, entrantes et sortantes, avec **Afficher plus** en bas.

## Réseaux et jetons externes {#external-networks-tokens}

L'envoi est activé pour tous les réseaux que QoreX liste : Ethereum, BNB Smart Chain, Polygon, Arbitrum One, Base, OP Mainnet, Avalanche C-Chain, Solana, Cosmos Hub, Osmosis et Celestia, avec leurs jetons. BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche et Celestia fonctionnent à nouveau après avoir été un temps limités à la réception. Les envois natifs sur Arbitrum utilisent l'estimation de gaz propre au réseau.

Depuis **Tous les réseaux** (ou Envoyer-externe), vous pouvez envoyer nativement **ETH, BNB, POL, AVAX et SOL**, ainsi que de l'ETH sur **Arbitrum, Base et OP Mainnet**, et **ATOM, OSMO et TIA** sur Cosmos, ainsi que des jetons **ERC-20**, **SPL** et **IBC** - USDC et USDT sur les chaînes EVM et Solana, DAI sur Ethereum, et Noble USDC via IBC - tous dérivés de la même phrase de récupération (ETH utilise `m/44'/60'`, SOL utilise son chemin standard, et SPL utilise des comptes de jetons associés).

:::caution Les chaînes externes sont uniquement classiques
Les autres blockchains ne peuvent pas porter de signatures ML-DSA-87. Lorsque vous envoyez sur un réseau externe, QoreX l'indique explicitement (le transfert utilise une signature classique et la ligne de signature la marque comme classique). Vos **QOR** restent sur la lane native à signature hybride. Les envois externes basés sur Cosmos prennent en charge un mémo optionnel. Pour les réseaux EVM, QoreX affiche aussi les **frais de réseau maximaux** avant que vous confirmiez - « Frais de réseau : au plus \{fee\}. Vérifiez-les avant de confirmer. » - et signe avec exactement ce chiffre.
:::

## Échanger

L'onglet **Échanger** est connecté à l'AMM on-chain de QoreChain mais reste désactivé - le bouton affiche **« Échanger - bientôt disponible avec la liquidité des pools »** - jusqu'à ce que la liquidité et le flag de fonctionnalité distant l'activent. Lorsque cela se produit, il s'active automatiquement ; **aucune mise à jour de l'application n'est nécessaire**.

:::note iOS
L'onglet Échanger n'apparaît pas du tout dans la version App Store - Apple considère un échange de jetons intégré à l'application comme un service réglementé. L'échange reste disponible (une fois activé) uniquement sur Android. L'extension de navigateur n'a pas d'écran Échanger.
:::

## Extras de l'écran d'accueil {#home-extras}

- **Widget d'écran d'accueil** (Android et iPhone) - ajoutez **QoreX** depuis le sélecteur de widgets de votre téléphone. Il affiche votre solde QOR pour le compte utilisé, affiche des points au lieu du montant lorsque le mode confidentialité est activé, s'actualise tout seul environ toutes les 30 minutes, et ouvre l'application lorsqu'on appuie dessus. Le widget n'envoie aucune requête de lui-même aux serveurs de QoreChain : l'application lui transmet sur l'appareil votre adresse, votre solde et votre réglage de confidentialité, et le widget lit le solde depuis le point d'accès REST public de QoreChain (qui ne voit que votre adresse publique). Quiconque peut voir votre écran d'accueil peut voir le widget ; activez donc le mode confidentialité (appuyez sur votre solde) si cela compte pour vous.
- **Notifications push** (mobile, mainnet) - la cloche sur Accueil → **Notifications** comporte un interrupteur **Notifications push** : *« Recevez une notification lorsque des QOR arrivent, même application fermée. Notre serveur ne surveille que vos adresses publiques ; Apple et Google ne voient ni montant ni adresse. »* Le texte de la notification est simplement « QOR reçus ». Le push est **désactivé tant que vous ne l'activez pas**. Lorsqu'il est activé, le serveur conserve le jeton de votre appareil et les adresses publiques `qor1…` du portefeuille utilisé (jusqu'à 10) ; désactiver l'interrupteur retire votre appareil du serveur, et un appareil dont le serveur n'a pas eu de nouvelles depuis 90 jours est oublié. Voir [Ce que QoreX envoie sur le réseau](/qorex/overview#data-and-privacy). Si les notifications sont désactivées pour QoreX dans les réglages de votre téléphone, activez-les d'abord là-bas. La livraison a été testée de bout en bout sur Android ; sur iPhone, considérez-la comme faite au mieux et continuez de consulter la liste **Notifications** dans l'application.
- **Recherche et visite** - voir [Se repérer](/qorex/getting-started#find-your-way).

## Étapes suivantes

- [Portefeuille d'actifs et Staking](/qorex/portfolio-and-staking) - consultez votre allocation et gagnez des récompenses.
- [Sécurité et récupération](/qorex/security-and-recovery) - protégez et récupérez votre portefeuille.

## Limites et problèmes connus {#limits}

- Les transferts sur réseaux externes (EVM, Solana, Cosmos) sont uniquement classiques. Les transferts SVM et EVM ne sont pas couverts par la signature hybride.
- Le swap n'est pas disponible : il est désactivé tant qu'il n'existe pas de liquidité dans les pools et n'est pas affiché sur iOS.
- Réclamer un @handle nécessite un compte connecté et se fait dans l'application mobile. Les comptes de type Ethereum (coin 60) n'ont pas de handle. Si le service de handles est indisponible, vous pouvez toujours payer par adresse `qor1…`.
- Les demandes de paiement se paient uniquement en QOR. Les demandes par @handle (pour voir les demandes envoyées à un handle) nécessitent un @handle réservé.
- Pour l'instant, l'historique ne couvre que QoreChain ; les autres réseaux suivront.
- Les notifications push n'existent que sur mainnet, et au mieux sur iPhone.
- Les QOR en vesting ne peuvent pas payer de frais ; seule la portion disponible peut être envoyée.
