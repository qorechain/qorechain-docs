---
slug: /qorex/send-and-receive
title: Envoyer et recevoir
sidebar_label: Envoyer et recevoir
sidebar_position: 3
---

# Envoyer et recevoir

L'onglet Accueil (Portefeuille) est votre point de départ. Il affiche un **badge réseau** (MAINNET par défaut, ou TESTNET si vous avez activé le bascule développeur), votre **solde total** (appuyez pour masquer/afficher), et les actions principales : **Envoyer · Recevoir · Échanger · Staker** (**Échanger** n'est pas affiché sur iOS). Votre liste d'actifs affiche **QOR** (Native + post-quantique 🛡, un solde unifié sur les lanes Native/EVM/SVM) et **Tous les réseaux** (une vue unifiée sur ETH, BNB, POL, ARB, et les autres [réseaux externes](#external-networks-tokens) pris en charge par QoreX).

## Envoyer des QOR à sécurité quantique

1. Appuyez sur **Envoyer**.
2. Saisissez le destinataire sous forme d'adresse `qor1…` **ou** d'un **@handle**. Un handle est résolu et vérifié cryptographiquement (signature du registre + signature du propriétaire + épinglage à la première utilisation) ; si la clé d'un handle venait à changer silencieusement, QoreX affiche un avertissement explicite.
3. Saisissez le montant. L'aperçu affiche le destinataire, le montant, les **Frais de réseau** et l'état du **Bouclier** — le niveau de protection post-quantique de la signature.
4. Confirmez avec une validation **biométrique**. QoreX signe le transfert avec la signature hybride post-quantique obligatoire (ML-DSA-87 + secp256k1) et le diffuse sur la lane Native.

Sur le premier écran, la zone de saisie rapide (**Ask QoreX**) vous permet de saisir une demande simple telle que « send 50 QOR to @maria » et remplit le formulaire à votre place. C'est un simple lecteur de texte qui s'exécute **entièrement sur votre appareil** — rien de ce que vous y saisissez n'est envoyé nulle part, et ce n'est pas un assistant d'IA (QoreX n'en a aucun). Vous vérifiez toujours tout et confirmez avec la biométrie comme d'habitude ; s'il ne peut pas lire ce que vous avez saisi, il vous le dit et vous remplissez le formulaire à la main. Les destinataires récents apparaissent sous forme de puces.

QoreChain n'enregistre pas votre clé post-quantique de lui-même — QoreX le fait pour vous dans le cadre de votre **premier** transfert (de petits frais de réseau uniques), et vous pouvez en voir l'état dans [Sécurité et récupération](/qorex/security-and-recovery#pqc-key). Aucune étape séparée n'est nécessaire dans QoreX.

### Envoyer à un @handle, étape par étape {#handle-send}

1. Ouvrez **Envoyer** et tapez `@` suivi du handle (par exemple `@liviu`) dans le champ destinataire au lieu d'une adresse.
2. QoreX recherche le handle et vous montre **l'adresse `qor1…` résolue** avant que vous confirmiez quoi que ce soit. (Réclamer votre propre handle nécessite un compte connecté et se fait dans l'application — voir [@handle](/qorex/account-and-dashboard#handle).)
3. Vérifiez l'adresse résolue, saisissez le montant, et confirmez comme d'habitude.

QoreX n'accepte une résolution que si elle passe **les deux** vérifications qu'il effectue : une attestation du registre vérifiée par rapport à une clé de confiance épinglée dans l'application, et la propre signature du propriétaire du handle sur la revendication. Si l'une des deux vérifications échoue, une erreur est déclenchée plutôt qu'un repli vers une adresse non vérifiée. La première fois que vous payez un handle donné, QoreX mémorise l'adresse vers laquelle il a été résolu ; si l'adresse de ce handle venait un jour à changer, QoreX s'arrête avant de signer et vous montre l'ancienne et la nouvelle adresse côte à côte afin que vous puissiez décider de continuer ou non. Cette mémoire est **propre à chaque appareil** — payer le même handle pour la première fois depuis un autre téléphone ou une installation neuve le fera apparaître comme nouveau là aussi, ce qui est normal et non une erreur. L'extension de navigateur résout et paie les handles de la même façon (sa mémoire est **propre à chaque navigateur**, donc un autre navigateur ou ordinateur le verra comme nouveau) — voir [Envoyer à un @handle](/qorex/browser-extension#handle-send).

### Envoi de QOR en vesting (verrouillés) {#vesting}

Si une partie de votre solde est encore en **vesting** — par exemple une allocation TGE non encore libérée — votre total est divisé en **disponible maintenant** et **encore verrouillé**. Vous ne pouvez envoyer que la portion disponible ; QoreX refuse lui-même toute tentative de dépense excessive plutôt que de laisser le réseau la rejeter après avoir prélevé des frais. La portion verrouillée devient dépensable progressivement à mesure que le calendrier de vesting la libère. Cette répartition est affichée partout où votre solde apparaît — Accueil, Envoyer, et Détail de l'actif.

## Recevoir {#receive}

Appuyez sur **Recevoir**. QoreChain est sélectionné en premier — votre adresse `qor1…` (et votre @handle, si vous en avez un) sous forme de code QR avec l'icône QoreChain, ainsi que **Copier** et **Partager**. Tout ce qui y est envoyé arrive avec une protection à sécurité quantique.

Pour recevoir sur un autre réseau, utilisez le sélecteur **Réseau** en haut : Ethereum, BNB Chain, Polygon, Arbitrum, Base, OP Mainnet, Avalanche, Solana, Cosmos Hub, Osmosis et Celestia affichent chacun **leur propre adresse** et l'avertissement *« Envoyez uniquement des \{coin\} ou des tokens sur \{network\} à cette adresse. Les coins envoyés depuis un autre réseau peuvent être perdus. »* Tous les réseaux EVM partagent une seule adresse `0x…`. Vos adresses EVM et Solana sont dérivées de votre phrase de récupération ; QoreX demande donc une confirmation biométrique (**Afficher l'adresse**) avant de les afficher. Les autres réseaux ne peuvent pas porter de signatures post-quantiques — voir [Réseaux externes](#external-networks-tokens).

Dans l'extension de navigateur, **Recevoir** propose le même sélecteur de réseau.

## Coins et tokens {#coins-and-tokens}

Un coin sans ligne n'a pas d'adresse pour le recevoir. Pour voir un coin ou un token dans **Portefeuille d'actifs** *avant* d'en détenir, ouvrez Portefeuille d'actifs → **+ Coin ou token** et activez-le (dans l'extension : **Coins et tokens**). Un coin épinglé à zéro ouvre **Recevoir** sur son réseau lorsqu'on appuie dessus. Paramètres → **Coins et réseaux** liste tout ce que le portefeuille peut détenir aujourd'hui.

**Ajouter un token par contrat** (réseaux EVM uniquement) :

1. Portefeuille d'actifs → **+ Coin ou token** → **Ajouter un token par contrat** (extension : **Coins et tokens** → *Ajouter un token par contrat*).
2. Choisissez le **Réseau**, collez l'**Adresse du contrat (0x…)** et appuyez sur **Vérifier le contrat**.
3. QoreX lit le symbole et les décimales depuis le contrat lui-même et affiche *« Le contrat indique : \{symbol\} · \{decimals\} décimales »*. N'importe qui peut créer un token et lui donner n'importe quel nom — QoreX ne s'en porte pas garant, assurez-vous donc qu'il s'agit bien du contrat que vous visiez.
4. Appuyez sur **Ajouter \{symbol\}**. Il est marqué *Ajouté par vous* et peut être envoyé comme les tokens intégrés. Supprimez-le à tout moment.

QoreX refuse un token déjà intégré, un token que vous avez déjà ajouté, un réseau non EVM, une adresse invalide, un contrat qui ne répond pas comme un token, et un contrat qui reprend le nom d'un token que QoreX fournit déjà sur ce réseau (probable copie).

## Demander un paiement

Appuyez sur **Demander** (nécessite une [connexion](/qorex/account-and-dashboard#sign-in)) pour créer une demande de paiement — un montant plus un mémo optionnel — sous forme de code QR ou de lien. Quiconque la scanne voit le transfert pré-rempli.

## Réseaux et jetons externes {#external-networks-tokens}

Depuis **Tous les réseaux** (ou Envoyer-externe), vous pouvez envoyer nativement **ETH, BNB, POL, AVAX et SOL**, ainsi que de l'ETH sur **Arbitrum, Base et OP Mainnet**, et **ATOM, OSMO et TIA** sur Cosmos, ainsi que des jetons **ERC-20**, **SPL** et **IBC** — USDC et USDT sur les chaînes EVM et Solana, DAI sur Ethereum, et Noble USDC via IBC — tous dérivés de la même phrase de récupération (ETH utilise `m/44'/60'`, SOL utilise son chemin standard, et SPL utilise des comptes de jetons associés).

:::caution Les chaînes externes sont uniquement classiques
Les autres blockchains ne peuvent pas porter de signatures post-quantiques. Lorsque vous envoyez sur un réseau externe, QoreX l'indique explicitement (le transfert utilise une signature classique et le **Bouclier** affiche la rétrogradation). Vos **QOR** restent toujours sur la lane Native protégée. Les envois externes basés sur Cosmos prennent en charge un mémo optionnel. Pour les réseaux EVM, QoreX affiche aussi les **frais de réseau maximaux** avant que vous confirmiez — « Frais de réseau : au plus \{fee\}. Vérifiez-les avant de confirmer. » — et signe avec exactement ce chiffre.
:::

## Échanger

L'onglet **Échanger** est connecté à l'AMM on-chain de QoreChain mais reste désactivé — le bouton affiche **« Échanger — bientôt disponible avec la liquidité des pools »** — jusqu'à ce que la liquidité et le flag de fonctionnalité distant l'activent. Lorsque cela se produit, il s'active automatiquement ; **aucune mise à jour de l'application n'est nécessaire**.

:::note iOS
L'onglet Échanger n'apparaît pas du tout dans la version App Store — Apple considère un échange de jetons intégré à l'application comme un service réglementé. L'échange reste disponible (une fois activé) uniquement sur Android. L'extension de navigateur n'a pas d'écran Échanger.
:::

## Extras de l'écran d'accueil {#home-extras}

- **Widget d'écran d'accueil** (Android et iPhone) — ajoutez **QoreX** depuis le sélecteur de widgets de votre téléphone. Il affiche votre solde QOR pour le compte utilisé, affiche des points au lieu du montant lorsque le mode confidentialité est activé, s'actualise tout seul environ toutes les 30 minutes, et ouvre l'application lorsqu'on appuie dessus. Le widget n'envoie aucune requête de lui-même aux serveurs de QoreChain : l'application lui transmet sur l'appareil votre adresse, votre solde et votre réglage de confidentialité, et le widget lit le solde depuis le point d'accès REST public de QoreChain (qui ne voit que votre adresse publique). Quiconque peut voir votre écran d'accueil peut voir le widget ; activez donc le mode confidentialité (appuyez sur votre solde) si cela compte pour vous.
- **Notifications push** (mobile, mainnet) — la cloche sur Accueil → **Notifications** comporte un interrupteur **Notifications push** : *« Recevez une notification lorsque des QOR arrivent, même application fermée. Notre serveur ne surveille que vos adresses publiques ; Apple et Google ne voient ni montant ni adresse. »* Le texte de la notification est simplement « QOR reçus ». Le push est **désactivé tant que vous ne l'activez pas**. Lorsqu'il est activé, le serveur conserve le jeton de votre appareil et les adresses publiques `qor1…` du portefeuille utilisé (jusqu'à 10) ; désactiver l'interrupteur retire votre appareil du serveur, et un appareil dont le serveur n'a pas eu de nouvelles depuis 90 jours est oublié. Voir [Ce que QoreX envoie sur le réseau](/qorex/overview#data-and-privacy). Si les notifications sont désactivées pour QoreX dans les réglages de votre téléphone, activez-les d'abord là-bas. La livraison a été testée de bout en bout sur Android ; sur iPhone, considérez-la comme faite au mieux et continuez de consulter la liste **Notifications** dans l'application.
- **Recherche et visite** — voir [Se repérer](/qorex/getting-started#find-your-way).

## Étapes suivantes

- [Portefeuille d'actifs et Staking](/qorex/portfolio-and-staking) — consultez votre allocation et gagnez des récompenses.
- [Sécurité et récupération](/qorex/security-and-recovery) — protégez et récupérez votre portefeuille.
