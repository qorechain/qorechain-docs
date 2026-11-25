---
slug: /qorex/security-and-recovery
title: Sécurité et récupération
sidebar_label: Sécurité et récupération
sidebar_position: 5
---

# Sécurité et récupération

Cette page explique comment QoreX protège vos clés et comment récupérer un portefeuille : la vérification de protection sur un seul écran, la clé ML-DSA-87 et son entretien, les comptes multisignature, la récupération sociale, Legacy, la liaison d'appareils, la fenêtre d'accès EVM, ce que montrent les approbations, le verrouillage automatique, le Q-Day Scanner et où obtenir de l'aide. Elle s'adresse à tous les utilisateurs de QoreX ; la plupart des outils de récupération se trouvent dans l'application mobile, et le texte précise quand quelque chose diffère dans l'extension de navigateur ou Safari.

## Innovations {#innovations}

- **La protection de mon argent.** Un seul écran qui vérifie en direct votre sauvegarde, vos sites connectés, les autorisations que vous avez données on-chain et vos autorisations de jetons, et vous permet de les révoquer. Voir [La protection de mon argent](#protection).
- **Entretien de la clé post-quantique.** Changez la clé ML-DSA-87 à partir de votre phrase de récupération, réparez un enregistrement qui ne permet plus de signer et gérez un multisignature post-quantique. Voir [Changer la clé](#pqc-rotation), [Réparer](#pqc-repair) et [Comptes multisignature](#multisig).
- **Récupération sociale avec fragments chiffrés et kit de récupération.** Les gardiens détiennent des fragments scellés avec ML-KEM, répartis en 2 sur 3, et ont besoin de votre kit de récupération pour restaurer le portefeuille. Une récupération déclenche un délai de 48 heures et vous alerte ; vous pouvez l'annuler, et une annulation ne peut que retarder, jamais déplacer des fonds.
- **Legacy.** Un interrupteur d'homme mort superposé à vos gardiens, pour un bénéficiaire que vous choisissez.
- **Liaison d'appareil.** Un code à usage unique et un QR code, jamais sur le même écran. Le QR code seul n'est que du texte chiffré derrière une dérivation de clé gourmande en mémoire.
- **Clé ML-DSA-87 déterministe.** Dérivée de votre phrase de récupération (la première clé est `SHAKE256("qorechain:pqc:v1|" + address + "|" + mnemonic)`, et les clés changées sont dérivées de la même phrase) ; la clé ne nécessite donc aucune sauvegarde distincte. Voir [QoreSign](/qoresign/overview).
- **Accès EVM borné.** Une transaction EVM n'est admise que tant qu'une fenêtre d'accès est ouverte, limitée par le nombre de transactions, la valeur et l'expiration, et une fenêtre que vous ouvrez vous-même n'admet que les transferts de QOR sauf si vous en décidez autrement.
- **Des approbations qui refusent ce qu'elles ne peuvent pas lire.** Voir [Ce que montre la fenêtre d'approbation](#approvals).
- **Q-Day Scanner.** Un rapport d'exposition pour n'importe quelle adresse Bitcoin ou Ethereum.

## Comment l'utiliser et où le trouver {#how-to-use}

La plupart de ce qui suit se trouve dans **Réglages → Sécurité** dans l'application mobile ; **La protection de mon argent** et **Assistance** sont dans les **Réglages**. Dans les extensions de navigateur et Safari, l'écran d'accueil de la fenêtre a des boutons pour la fenêtre d'accès EVM, les Sites connectés, Afficher la phrase de récupération, Changer la clé post-quantique, les Comptes multisignature, La protection de mon argent et Assistance, ainsi que le réglage du verrouillage automatique. La récupération sociale, Legacy, la liaison d'appareils et le Q-Day Scanner sont réservés au mobile. QoreX est gratuit et ne nécessite aucun compte pour tout cela ; voir l'[aperçu](/qorex/overview#how-to-access) pour les liens des stores.

L'onglet Accueil affiche également une carte **État de la sauvegarde** qui continue d'avertir tant que la récupération sociale n'est pas configurée. La carte ne suit que la récupération sociale : elle ne peut pas savoir si vous avez noté votre phrase de récupération, faites-le donc vous-même (voir ci-dessous).

## La protection de mon argent {#protection}

Un seul écran qui répond à « mon argent est-il en sécurité, et qui peut agir en mon nom ? ». Application : **Réglages → La protection de mon argent**. Extension et Safari : **La protection de mon argent** sur l'écran d'accueil de la fenêtre. Chaque ligne est vérifiée à l'ouverture, sur cet appareil et sur le réseau ; rien n'est présumé. Quand quelque chose ne peut pas être lu, QoreX indique *"Could not be read right now. This does not mean there are none."* (lecture impossible pour le moment ; cela ne signifie pas qu'il n'y en a aucun).

| Ligne | Ce qu'elle vérifie | Ce que vous pouvez faire |
|---|---|---|
| **Sauvegarde vérifiée** et **Récupération testée** | si vous avez prouvé que vous détenez votre phrase de récupération, et quand | **Tester ma phrase de récupération** : saisissez trois mots de votre phrase. C'est un essai à blanc : ils sont comparés sur cet appareil, rien de ce que vous saisissez n'est conservé ni envoyé, et rien n'est restauré ni modifié. Des mots erronés n'enregistrent rien |
| **Gardiens (récupération sociale)** | si des gardiens sont configurés, combien, et combien sont nécessaires | configurez-les dans [Récupération sociale](#social-recovery) |
| **Applications autorisées** | les sites qui peuvent voir votre adresse et vous demander de signer (dans l'application, les sites du navigateur dApp intégré ; dans l'extension, les sites connectés) | **Révoquer** n'importe quel site |
| **Autorisations accordées sur le réseau** | les **autorisations authz** et **allocations de frais** permanentes que votre compte a données à d'autres, lues sur la chaîne, les illimitées en premier, avec les dates de fin | **Révoquer** : QoreX affiche une vérification avec les frais de réseau, puis signe le retrait avec votre signature hybride |
| **Autorisations de jetons ERC-20** | les dépenseurs autorisés à déplacer vos jetons sur **l'EVM de QoreChain** | **Révoquer**, qui envoie `approve(spender, 0)` |

**À propos des autorisations de jetons.** Dans l'application, touchez **Vérifier les autorisations de jetons** ; leur lecture utilise l'adresse Ethereum de ce portefeuille, ce qui demande votre phrase une fois. Elles sont lues par plages que le nœud accepte ; l'écran peut donc indiquer *"Token approvals checked back to block \{from\}. Older ones may exist: open this screen again to keep checking."* (autorisations vérifiées jusqu'à ce bloc ; de plus anciennes peuvent exister, rouvrez l'écran pour poursuivre). Pour révoquer, QoreX ouvre d'abord une **fenêtre EVM d'une seule transaction**, signée avec votre clé post-quantique et limitée au contrat du jeton, puis envoie la transaction EVM, signée avec votre clé classique. Seul un compte de style Ethereum (coin 60) peut envoyer sur l'EVM de QoreChain ; un compte coin 118 ne peut donc pas révoquer ici une autorisation EVM, et QoreX le dit.

**Protection post-quantique, par voie.** L'écran explique simplement quelles signatures protègent quoi :

- **QoreChain (natif) :** chaque transaction porte deux signatures, une post-quantique (ML-DSA-87) et une classique, et le réseau vérifie les deux.
- **QoreChain EVM :** les transactions EVM sont signées de façon classique, comme dans tout portefeuille EVM. Le réseau ne les admet que dans une [fenêtre](#evm-window) que vous avez ouverte avec votre signature post-quantique, dans les limites que vous avez choisies.
- **Autres réseaux (Ethereum, Solana, Cosmos) :** ils n'acceptent que les signatures classiques. QoreX ne peut pas y ajouter de protection post-quantique.

## Sauvegardez maintenant - personne ne peut récupérer un portefeuille perdu à votre place {#back-up-now}

:::danger À lire avant d'alimenter votre portefeuille
QoreX est **non-custodial** : vos clés n'existent que sur votre propre appareil, et QoreChain Association n'en possède aucune copie, aucune clé maîtresse, et n'a aucun moyen de réinitialiser ou de restaurer votre portefeuille. **Il n'existe ni procédure « mot de passe oublié », ni ticket d'assistance, ni intervention du service client** - si vous perdez l'accès à vos clés sans sauvegarde en place, les fonds sont perdus, définitivement et irréversiblement. Cela vaut pour tout portefeuille non-custodial, ce n'est pas une limitation propre à QoreX, mais il est utile de le dire clairement.

**Faites au moins l'une de ces actions - juste après avoir créé votre portefeuille, pas plus tard :**

1. **Notez votre phrase de récupération de 24 mots** et conservez-la hors ligne, dans un endroit durable (pas une capture d'écran, pas une note synchronisée dans le cloud, pas un message que vous vous envoyez). C'est la seule chose capable de restaurer votre portefeuille, sur n'importe quel appareil, à tout moment - sur mobile, affichez-la depuis **Réglages → Sécurité → Afficher la phrase de récupération** (l'application ne l'affiche **pas** pendant qu'elle crée le portefeuille : vous devez donc aller la chercher - faites-le immédiatement) ; dans l'extension, elle s'affiche une seule fois à la création du portefeuille, puis à tout moment depuis **Afficher la phrase de récupération** dans la fenêtre contextuelle. Voir [Restaurer un portefeuille existant](/qorex/getting-started#2-restore-an-existing-wallet).
2. **Configurez la [récupération sociale](#social-recovery)** avec des gardiens en qui vous avez confiance. Cela vous permet de récupérer votre portefeuille même si vous perdez la phrase, sans qu'aucun gardien pris isolément ne puisse jamais accéder à vos fonds.

Faire les deux est l'option la plus sûre - la phrase vous couvre si vous changez d'appareil ou si l'application est indisponible ; les gardiens vous couvrent si vous perdez la phrase elle-même.

**Désinstaller l'application supprime vos clés de cet appareil.** Le coffre de l'application mobile et celui de l'extension navigateur vivent chacun uniquement sur l'appareil qui les a créés. Désinstaller l'application, réinitialiser le téléphone, ou supprimer/effacer l'extension supprime cette copie - sans sauvegarde ni appareil lié, votre portefeuille ne peut être récupéré par personne, y compris QoreChain. **Retirer un portefeuille d'un téléphone ou d'un navigateur** (Réglages → Portefeuilles → *Retirer de ce téléphone*, ou *Retirer de ce navigateur* dans l'extension) supprime de la même manière la clé de ce portefeuille de l'appareil - vos fonds restent sur la chaîne, mais seule sa phrase de récupération peut le ramener.
:::

## Clé ML-DSA-87 {#pqc-key}

L'écran **Sécurité** affiche l'état on-chain en direct de votre clé ML-DSA-87 : **« S'enregistre à votre premier transfert »** → **« Enregistrée on-chain ✓ »**. L'algorithme est **ML-DSA-87** (déterministe, hybride avec secp256k1).

Les sites web ne peuvent pas demander à QoreX d'enregistrer, de migrer ou de changer votre clé ML-DSA-87. L'enregistrement se fait de lui-même avec votre premier transfert et ne vous demande rien - depuis la v3.2.3, la chaîne accepte aussi une *preuve de possession* facultative avec l'enregistrement, que les versions actuelles des stores gèrent de manière invisible. Vous pouvez aussi [changer la clé](#pqc-rotation) vous-même, ou [réparer](#pqc-repair) un enregistrement qui ne permet plus de signer. Voir [Rotation de clé](/developer-guide/post-quantum-signing#key-rotation) pour le mécanisme sous-jacent.

### Réparer une clé qui ne permet plus de signer {#pqc-repair}

Dans de rares cas, l'enregistrement de clé que le réseau détient pour votre compte est **vide, uniquement classique ou dégénéré** ; rien ne peut alors être envoyé depuis le compte. QoreX distingue les deux cas : une clé enregistrée par **un autre portefeuille** est signalée comme telle, tandis qu'un enregistrement qui **ne permet plus de signer** donne lieu à une carte de réparation sur l'écran d'**accueil** (application) ou l'accueil de la fenêtre (extension et Safari).

1. Lisez la carte : *"This account's post-quantum key on the network can no longer sign, so nothing can be sent from it. Registering the key again fixes it."* (la clé post-quantique de ce compte sur le réseau ne permet plus de signer ; l'enregistrer à nouveau règle le problème). Elle affiche les frais de réseau, **0.09 QOR**, et indique que si le compte a une fenêtre EVM, le réseau la ferme (ouvrez-en une nouvelle ensuite).
2. Touchez **Enregistrer la clé à nouveau**.
3. Touchez à nouveau (*Tap again to register (fee 0.09 QOR)*). Dans l'application, confirmez par biométrie.

La réparation n'est **jamais automatique** : deux touchers sont toujours nécessaires. Elle n'envoie que l'enregistrement de la clé, signé avec votre clé classique. Ensuite, QoreX indique *"The key is registered again. This account can send again."* (la clé est de nouveau enregistrée, le compte peut à nouveau envoyer).

### Changer la clé post-quantique {#pqc-rotation}

**Changer la clé post-quantique** remplace la clé ML-DSA-87 du compte sur le réseau par la **clé suivante dérivée de votre phrase de récupération**. Application : **Réglages → Sécurité → Changer la clé post-quantique**. Extension et Safari : le bouton **Changer la clé post-quantique** sur l'écran d'accueil de la fenêtre. Touchez, puis touchez à nouveau pour confirmer (*Tap again to rotate the key*) ; l'application demande aussi la biométrie. La transaction est signée à la fois par la clé actuelle et la nouvelle, et les frais de réseau, issus d'une simulation, sont indiqués dans le résultat.

- **Cela protège contre** la fuite d'une clé post-quantique.
- **Cela ne protège pas contre** la fuite d'une phrase de récupération. Quiconque possède votre phrase peut dériver chacune de ces clés. Dans ce cas, déplacez vos fonds vers un nouveau portefeuille avec une nouvelle phrase.
- **Les autres portefeuilles utilisant la même phrase** ne peuvent pas signer pour ce compte tant qu'ils ne prennent pas en charge les clés changées.
- **Le réseau ferme la fenêtre EVM du compte.** Ouvrez-en une nouvelle si nécessaire.
- **La restauration fonctionne toujours.** QoreX cherche, parmi les clés que votre phrase permet de dériver, celle que détient le réseau ; un portefeuille restauré signe donc avec la clé changée.

Le changement n'est jamais automatique, et les sites web ne peuvent pas le demander.

## Comptes multisignature {#multisig}

Un **compte multisignature** exige la signature de plusieurs membres. QoreX prend en charge le multisignature post-quantique sur le mainnet et le testnet, en utilisant **les mêmes fichiers que la ligne de commande QoreChain** ; chaque membre peut donc signer dans QoreX ou dans l'outil en ligne de commande. Application : **Réglages → Sécurité → Comptes multisignature**. Extension et Safari : **Comptes multisignature** sur l'écran d'accueil de la fenêtre.

**En créer ou en ajouter un**

1. **Créer un multisignature :** saisissez les adresses des membres (`qor1...`), une par ligne, le nombre de signatures requises (le seuil) et un nom facultatif, puis **Enregistrer**. Chaque membre doit avoir envoyé au moins une transaction.
2. Ou **Ajouter un multisignature existant :** collez la clé multisignature (la sortie de la commande `keys show <name> -p` de la ligne de commande, ou une clé partagée depuis QoreX). **Partager la clé multisignature** l'envoie aux autres membres.

**Vérifier son état.** L'écran du compte affiche le solde, si **l'ensemble des membres post-quantiques** est enregistré (et sa version), si le compte utilisé est un membre et, pour chaque membre, si sa clé est prête, manquante, incapable de signer désormais, enregistrée sans preuve ou impossible à vérifier. Tant que l'ensemble des membres n'est pas enregistré, le compte ne peut pas envoyer.

**Signer en deux tours**

1. **Préparer l'enregistrement** (d'abord, une seule fois) ou **Préparer un envoi**. QoreX tire le gaz d'une simulation et crée un fichier. Dans l'extension et Safari, le fichier est **téléchargé** ; dans l'application, il est **partagé sous forme de texte**. Envoyez-le aux autres membres.
2. **Tour 1.** Chaque membre post-quantique ouvre le fichier (**Ouvrir des fichiers de membres**), le vérifie et choisit **Signer comme membre post-quantique**. Dans l'application, les membres **collent** le texte reçu ; dans l'extension, ils ouvrent le fichier.
3. **Combinez** les signatures des membres.
4. **Tour 2.** On choisit les membres qui signent de façon classique (exactement le nombre du seuil, le même choix pour tous), et chacun vérifie puis choisit **Signer de façon classique**. Combinez à nouveau.
5. **Envoyer au réseau.**

Chaque étape de signature affiche d'abord ce que vous signez et demande **deux touchers** ; l'application demande aussi la biométrie. Si une transaction enregistrait un **authentificateur**, QoreX vous avertit : un authentificateur peut déplacer les fonds du multisignature sans les signatures des autres membres. Pour signer hors ligne d'autres types de transaction à partir d'un fichier, voir l'espace de travail hors ligne et multisignature dans [Mode développeur](/qorex/developer-mode).

## Récupération sociale {#social-recovery}

La récupération sociale permet à des **gardiens** de confiance de vous aider à restaurer votre portefeuille sans jamais voir votre phrase de récupération.

- Votre graine est divisée en **parts chiffrées** (scellées avec ML-KEM) : trois par défaut, dont n'importe quelles **deux** peuvent vous aider à récupérer (un schéma à seuil 2 sur 3) ; une seule ne le peut pas.
- Chaque gardien reçoit un justificatif.
- **Le kit de récupération.** La copie chiffrée de votre graine est votre **kit de récupération** (il commence par `qorexkit1:`), que vous conservez. Les gardiens seuls ne peuvent pas restaurer le portefeuille : ils ont aussi besoin de ce kit, et le kit seul est inutile sans eux. Les nouvelles configurations n'envoient au service de récupération que le nombre de gardiens et le seuil. Voir [Kit de récupération](#recovery-kit).
- Une récupération nécessite l'approbation du seuil de gardiens, puis déclenche un **verrouillage temporel de 48 heures** et vous envoie une **alerte d'annulation**, afin qu'une tentative malveillante puisse être stoppée.

**Pour la configurer :** Accueil → **Configurer la récupération** (ou Réglages → Sécurité → Récupération sociale) → **Créer les justificatifs des gardiens**. QoreX crée trois justificatifs - *Gardien 1*, *Gardien 2* et une *sauvegarde imprimable* - et **2 des 3** suffisent pour vous aider à récupérer. Remettez-en un à chaque personne ou appareil de confiance et gardez la sauvegarde imprimable en lieu sûr. Enregistrez ensuite le kit de récupération, comme décrit ci-dessous. L'avertissement d'État de la sauvegarde disparaît une fois la configuration terminée.

### Kit de récupération {#recovery-kit}

À la fin de la configuration, QoreX affiche votre **kit de récupération**. Utilisez **Copier le kit de récupération** ou **Partager ou enregistrer**, et gardez-en une copie dans un endroit que vous contrôlez et **pas seulement sur ce téléphone** (un gestionnaire de mots de passe, une note, une impression). Vous devez cocher *I saved the recovery kit somewhere off this phone* (j'ai enregistré le kit de récupération ailleurs que sur ce téléphone) pour que **Terminé** fonctionne. Pour récupérer, collez **l'ID de récupération ou le kit de récupération**.

Si vous avez configuré la récupération sociale avec une version antérieure, QoreX peut vous indiquer qu'une copie chiffrée de votre kit se trouve encore sur le service de récupération. Enregistrez le kit, puis choisissez **Supprimer la copie du relais**. Les justificatifs de vos gardiens continuent de fonctionner. Après la suppression, vous seul détenez le kit.

**Approuver la récupération de quelqu'un d'autre :** si vous êtes gardien pour quelqu'un, utilisez **Aider à récupérer** dans l'onglet Accueil pour approuver sa demande.

## Legacy Protocol {#legacy}

**Legacy Protocol** est un interrupteur d'homme mort superposé à vos gardiens : vos actifs peuvent revenir au bénéficiaire que vous avez choisi si vous devenez injoignable. Il est optionnel et se configure depuis Réglages → Sécurité.

## Lier un nouvel appareil {#link-device}

Transférez votre portefeuille vers un second téléphone ou une tablette **sans serveur et sans saisir** les 24 mots :

1. **Nouvel appareil** → intégration → **Lier depuis un autre appareil**. Il affiche un code à **10 caractères** à usage unique et ouvre l'appareil photo.
2. **Ancien appareil** → Réglages → Sécurité → **Lier un nouvel appareil** → saisissez ce code → confirmez par biométrie. Un **QR code** apparaît (votre graine scellée avec une clé dérivée du code : scrypt N=2¹⁷ → AES-256-GCM).
3. **Le nouvel appareil** scanne le QR code → il déchiffre localement → même portefeuille, mêmes adresses.

**Pourquoi une photo du QR code ne suffit pas :** le code et le QR code n'apparaissent jamais sur le même écran. Une photo du QR code seule n'est que du texte chiffré derrière une fonction de dérivation de clé gourmande en mémoire, et les deux éléments sont à usage unique et disparaissent avec les écrans. Un code erroné produit une erreur claire - il suffit de réessayer.

:::note
La liaison d'appareil est une **commodité**, pas une méthode de récupération. Votre phrase de 24 mots et la récupération sociale sont vos véritables filets de sécurité.
:::

## Fenêtre d'accès EVM {#evm-window}

À partir de la chaîne **v3.2.0**, une transaction sur la **voie EVM** - par exemple une transaction que vous signez dans MetaMask sur le réseau EVM de QoreChain - n'est admise que depuis un compte qui possède une **clé ML-DSA-87 enregistrée** *et* une **fenêtre d'autorisation ouverte** (un `MsgOpenEVMWindow` signé en hybride). La transaction EVM elle-même ne porte qu'une signature secp256k1. L'explorateur étiquette une telle transaction « Authorised by a PQC window ». Ouvrir une fenêtre est un message de la voie QoreChain Native que MetaMask ne peut pas produire ; c'est donc dans QoreX que vous l'ouvrez. Les envois de QoreX eux-mêmes utilisent la voie Native et n'ont jamais besoin d'une fenêtre.

**Qui en a besoin.** Une fenêtre est destinée aux **comptes de type Ethereum (coin 60)** - les comptes que vous ajoutez avec *Ajouter un compte Ethereum (coin 60)* pour une phrase d'abord utilisée dans MetaMask (voir [Restaurer une phrase depuis MetaMask ou le Dashboard](/qorex/getting-started#restore-dashboard)). MetaMask signe avec une clé Ethereum, qui est la clé d'un compte coin 60 ; aucune clé MetaMask ne peut envoyer depuis un compte `qor1…` ordinaire en coin 118 : une fenêtre ouverte sur un tel compte n'apporte donc rien et ne coûte que les frais.

Si vous êtes sur un compte qui ne peut pas utiliser de fenêtre, l'écran liste les étapes à suivre et propose un bouton vers **Tes comptes**.

Une fenêtre peut être ouverte de deux façons : **vous l'ouvrez vous-même** (ci-dessous), ou [QoreX en ouvre une pour une seule transaction](#per-transaction-windows) quand un site vous demande de l'approuver.

Ouvrez-la dans l'application via **Réglages → Sécurité → Fenêtre d’accès EVM**, ou avec le bouton **Fenêtre d’accès EVM** dans la fenêtre de l'extension. Choisissez d'abord **ce que la fenêtre admet** :

- **Transferts de QOR uniquement** (par défaut, recommandé) : aucun appel de contrat, aucun nouveau contrat, aucun destinataire qui soit un contrat.
- **N'importe quel contrat :** un choix distinct, avec un avertissement : *"Any contract can be called. The spending cap counts QOR only: tokens, NFTs and approvals moved by a contract are not limited by the window."* (n'importe quel contrat peut être appelé ; le plafond de dépense ne compte que les QOR, les jetons, NFT et approbations déplacés par un contrat ne sont pas limités par la fenêtre).

Si le réseau ne peut pas limiter une fenêtre aux transferts de QOR, QoreX le dit et demande s'il doit l'ouvrir pour n'importe quel contrat à la place. Rien ne s'ouvre tant que vous n'avez pas dit oui à exactement cela.

Ensuite, vous choisissez :

| Champ | Signification | Limite |
|---|---|---|
| **Durée (blocs, max 17280)** | combien de temps la fenêtre reste ouverte | jusqu'à 17 280 blocs (environ 15 heures sur le mainnet) |
| **Nombre de transactions (max 1000)** | combien de transactions EVM elle admet | jusqu'à 1 000 |
| **Plafond de dépense, QOR** | le maximum de QOR qu'elle laisse sortir | compte **tous les QOR qui quittent ce compte, plus les frais maximaux de chaque transaction** ; les jetons ne sont pas comptés |

Sur cet écran, vous ne pouvez pas désigner de contrats particuliers ; les fenêtres limitées à des contrats précis sont ouvertes par QoreX pour une seule transaction (ci-dessous). Les valeurs par défaut sont de 300 blocs (environ 16 minutes sur le mainnet), 5 transactions et 1 QOR. L'ouverture coûte des frais de réseau normaux et est signée avec la signature hybride habituelle (secp256k1 et ML-DSA-87), et une nouvelle fenêtre **remplace** toute fenêtre déjà ouverte. L'ouvrir fait aussi avancer le nonce de votre compte ; ouvrez donc la fenêtre **d'abord**, puis envoyez depuis MetaMask - une transaction préparée plus tôt sera refusée avec « nonce too low ». **Fermer la fenêtre** n'est proposé que tant qu'une fenêtre est active.

**Une fenêtre ouverte indique exactement ce qu'elle admet :** *Admits: QOR transfers only* (uniquement les transferts de QOR), *Admits: any contract (tokens are not counted against the cap)* (n'importe quel contrat, les jetons ne sont pas comptés dans le plafond) ou *Admits: only \{targets\}* (uniquement les cibles indiquées). Dans ce dernier cas, QoreX ajoute qu'**un contrat listé peut toujours agir pour le compte**, y compris en déplaçant des jetons qu'il détient ou pour lesquels il a été approuvé, et que la limite en QOR ne couvre pas cela.

L'écran affiche l'un de quatre états : *Ouverte pour \{blocks\} blocs de plus · \{txs\} transactions · \{value\} QOR restants* ; *Aucune fenêtre n'est ouverte. Les transactions MetaMask de ce compte sont refusées.* ; *Cette fenêtre a expiré ou est épuisée* ; ou *QoreX n'a pas pu lire la fenêtre depuis le réseau* - ce qui signifie que QoreX ne sait pas, et **non** que vous n'en avez pas. Si votre compte n'a pas encore de clé ML-DSA-87, enregistrez-en une d'abord (votre premier transfert QoreX le fait) ; une fenêtre ne sert à rien avant cela.

:::caution Gardez-la petite et courte
Une fenêtre permet à des transactions MetaMask ordinaires de déplacer vos QOR **avec une seule signature secp256k1**. Gardez des limites basses - un petit plafond de dépense, peu de transactions, une courte durée -, choisissez **Transferts de QOR uniquement** sauf si vous avez besoin d'un contrat, et fermez la fenêtre quand vous avez fini. Le plafond couvre tous les QOR qui quittent le compte, frais maximaux compris ; une transaction qui le dépasserait est donc refusée. Il ne couvre pas les jetons.
:::

### Fenêtres pour une seule transaction {#per-transaction-windows}

Quand un site demande à QoreX d'envoyer une transaction EVM sur QoreChain et qu'aucune fenêtre ouverte ne la couvre, l'approbation en ouvre une **pour exactement cette transaction**, signée avec votre clé hybride ML-DSA-87 :

- une transaction, à hauteur de la valeur **plus les frais maximaux**, pour une dizaine de minutes ;
- limitée aux contrats qu'elle appelle, là où le réseau le prend en charge ;
- l'approbation **nomme chaque contrat** que la fenêtre admettrait (y compris les contrats qui vous ont récemment fait signer un permit) et indique qu'**elle remplace toute fenêtre que vous avez ouverte** ;
- la limite en QOR couvre tous les QOR qui quittent le compte, frais maximaux compris, et un contrat listé peut toujours agir pour le compte (déplacer des jetons qu'il détient ou pour lesquels il a été approuvé, ou des QOR détenus par d'autres contrats) ;
- si le réseau n'accepte pas une fenêtre limitée à des contrats, QoreX **demande une seconde fois** avant d'en ouvrir une sans cette limite. Dire non n'ouvre rien et n'envoie rien.

Une signature de données typées qu'un contrat sur QoreChain vérifie (un permit) ouvre de même une courte fenêtre qui liste ce contrat. Dans l'historique des transactions, une transaction EVM indique combien elle a utilisé de la fenêtre. Voir [Intégration dApp](/qorex/dapp-integration) pour le point de vue développeur. Si vous utilisez MetaMask ou un autre portefeuille EVM avec une application qui appelle des contrats, choisissez **N'importe quel contrat** quand vous ouvrez la fenêtre vous-même. Une application qui envoie ses transactions via QoreX n'a besoin d'aucune fenêtre ouverte à l'avance. Comme la fenêtre manuelle, cela s'applique aux comptes de style Ethereum (coin 60).

(Envoyer des ETH, des BNB et d'autres actifs sur d'*autres* réseaux depuis QoreX est une autre chose - voir [Réseaux externes et jetons](/qorex/send-and-receive#external-networks-tokens).)

## Ce que montre la fenêtre d'approbation {#approvals}

Chaque signature produite par QoreX est approuvée par vous, et l'approbation liste exactement ce que vous signez. QoreX affiche :

- un titre et des champs étiquetés pour **chaque message** de la requête, y compris les messages imbriqués dans un **MsgExec** authz et les termes des octrois de permissions - et il **refuse** tout ce qu'il ne peut pas afficher (« QoreX ne peut pas lire ce message … N'approuvez que si vous faites entièrement confiance à ce site ») ;
- les **frais** (*Frais : \{amount\} · gas \{gas\}*), qui les paie et tout octroi de frais - si les frais ne peuvent pas être lus, QoreX le dit et vous indique de ne pas approuver ;
- la **limite, l'action autorisée et l'expiration** des allocations de dépense et des octrois authz, avec *ILLIMITÉ* et *JAMAIS* écrits en toutes lettres ; une expiration est affichée à la seconde près (`YYYY-MM-DD HH:MM:SS UTC`). Lisez attentivement l'action autorisée : une allocation de frais dont les messages autorisés incluent `MsgExec` (une `AllowedMsgAllowance`) couvre tout message que le bénéficiaire peut exécuter par ce biais, et un octroi authz générique couvre le type de message qu'il nomme. Un vote de gouvernance est décodé afin que vous voyiez sur quoi vous votez. Tout ce qui est illisible, illimité ou sans fin exige un **second appui** sur Approuver (*Appuyez à nouveau pour approuver*) ;
- le compte signataire (*Signé par …*) lorsque vous en avez plusieurs ;
- pour une requête comportant un très grand nombre de messages, les 50 premiers et le nombre des autres.

Pour les requêtes **EVM**, QoreX décode la transaction ou les données typées (transfert, approbation avec la mention *UNLIMITED* écrite en toutes lettres, permit et autres), et traite les appels et types inconnus comme à haut risque, avec un second toucher. Il simule là où le réseau le permet. Le nœud EVM de QoreChain peut seulement vérifier qu'un appel avec données n'échouerait pas ; l'approbation indique alors *"What it does to your tokens was not checked. Approve only if you trust this site."* (son effet sur vos jetons n'a pas été vérifié ; n'approuvez que si vous faites confiance à ce site) et demande un second toucher. Une transaction qui échouerait, ou qui ne peut pas être simulée, demande aussi un second toucher. Les requêtes natives qui appellent un contrat sont simulées avant l'approbation, et un appel que le contrat refuserait est refusé avec le motif de la chaîne. Les écrans d'approbation affichent le mémo et permettent d'ouvrir le message complet.

QoreX **refuse aussi une requête dont les octets peuvent se lire de deux façons** (depuis 1.1.7 / 0.3.7). Une requête qui répète un champ censé n'apparaître qu'une fois - par exemple des frais ou un montant en double - pourrait être affichée d'une façon et exécutée d'une autre ; QoreX ne la présente donc pas du tout à l'approbation. Pour les sites web, QoreX identifie le site demandeur par l'origine que le navigateur lui-même atteste, jamais par ce que la requête affirme d'elle-même.

Un changement de portefeuille ou de compte, ou le verrouillage du portefeuille, répond « non » aux requêtes en attente ; un site peut avoir une requête en attente, et trois peuvent attendre au total. Les noms de champs dans les fenêtres d'approbation sont affichés en anglais dans certaines versions.

### Ce qu'un site ne peut jamais demander {#never-requested}

Ces actions sont disponibles **uniquement depuis les écrans de QoreX**. QoreX les refuse à tout site web, quoi que dise le site :

- la gestion de la clé post-quantique (enregistrement, migration, changement) ;
- les authentificateurs (signataires liés) et les règles de dépense ;
- l'ouverture, la fermeture ou l'effacement d'une fenêtre d'accès EVM ;
- les messages de fenêtre et de relais de Solana sur QoreChain ;
- une autorisation (authz) qui permettrait à quelqu'un d'**accorder** d'autres autorisations ou d'**exécuter** des messages au nom de votre compte. Une telle autorisation permettrait au bénéficiaire d'agir à votre place. QoreX la refuse, qu'elle soit directe, enveloppée dans `MsgExec` à n'importe quelle profondeur ou sous forme d'autorisation générique.

## Adresses ressemblantes {#look-alike}

Les escrocs envoient de minuscules montants depuis des adresses qui commencent et se terminent comme une adresse que vous utilisez, en espérant que vous copierez la mauvaise. QoreX compare un destinataire avec les adresses que vous connaissez (contacts enregistrés, vos propres comptes et adresses que vous avez payées), sur QoreChain et les réseaux externes, et signale avant l'envoi une adresse qui ne fait que **ressembler** à l'une d'elles. Le spam probable avec un lien dans le mémo est aussi masqué de l'Historique. Voir [Contacts et favoris](/qorex/send-and-receive#contacts) et [Historique](/qorex/send-and-receive#history).

## Verrouillage automatique {#auto-lock}

QoreX se verrouille de lui-même après un moment d'inactivité. Choisissez **1, 5, 15, 30, 60 minutes ou 4 heures** sous **Verrouiller automatiquement après** ; la valeur par défaut est de **15 minutes**. Application : Réglages → Sécurité ; après l'intervalle, QoreX redemande la biométrie avant d'afficher quoi que ce soit. Extension et Safari : le réglage se trouve sur l'écran d'accueil de la fenêtre, à côté d'un bouton **Verrouiller** ; après l'intervalle, vous saisissez à nouveau votre mot de passe.

## Votre phrase de récupération et les outils d'accessibilité {#phrase-privacy}

L'écran de la phrase de récupération demande à chaque fois une nouvelle biométrie ou un nouveau code PIN de l'appareil, affiche les mots sous forme de grille numérotée en lecture seule **sans bouton de copie**, est bloqué pour les captures d'écran sur Android, et est masqué du sélecteur d'applications. Sur **Android 14 et versions ultérieures**, les mots sont en outre soustraits aux services d'accessibilité qui ne sont pas de véritables outils d'accessibilité (TalkBack et les autres vrais lecteurs d'écran peuvent toujours les lire). Sur les versions plus anciennes d'Android et sur iOS, les mots sont masqués par défaut aux lecteurs d'écran ; si vous vous appuyez sur un lecteur d'écran, appuyez sur l'avis affiché sur cet écran pour lui permettre de les lire. N'affichez la phrase que lorsque personne ne peut voir votre écran.

## dApps connectées {#connected-dapps}

Les connexions dApp sont **par origine**, et durent jusqu'à ce que vous les retiriez. Dans l'application, elles sont enregistrées **sur cet appareil, par portefeuille** (uniquement l'adresse du site) ; consultez-les et révoquez-les dans [La protection de mon argent](#protection). Dans l'extension de navigateur et Safari, ouvrez **Sites connectés** dans la fenêtre pour voir chaque site que ce portefeuille a approuvé et **Révoquer** n'importe lequel.

## Signataires liés et limites de dépense {#linked-signers}

Lier une clé externe (Phantom ou MetaMask) comme **signataire lié** avec ses propres limites de dépense n'est **pas encore disponible dans QoreX** - Réglages → Sécurité affiche la carte, avec l'action marquée *bientôt*. Rien n'est lié à votre portefeuille, sauf si vous l'avez fait vous-même en dehors de QoreX. La gestion des clés ne peut jamais être déléguée à une clé liée. Pour le modèle on-chain, voir [Authentificateurs de portefeuille lié](/developer-guide/account-abstraction#authenticators).

## Q-Day Scanner {#q-day-scanner}

Le **Q-Day Scanner** permet de saisir n'importe quelle adresse - la vôtre ou celle de quelqu'un d'autre - et d'obtenir un rapport d'exposition pour toute adresse Bitcoin ou Ethereum. Accédez-y depuis les boutons rapides de l'onglet Accueil. Pour vérifier une adresse **Bitcoin**, QoreX doit interroger blockstream.info, un service exploité par un tiers, qui voit l'adresse et votre adresse IP. Le scanner le nomme et ne lance l'analyse qu'après votre accord.

## Aide et assistance {#support}

Application : **Réglages → Assistance**. Extension et Safari : **Assistance** sur l'écran d'accueil de la fenêtre. L'écran liste les **seuls canaux officiels**, chaque adresse complète étant affichée pour que vous puissiez comparer :

- Communauté Telegram : [https://t.me/QorechainCommunity](https://t.me/QorechainCommunity)
- Discord : [https://discord.gg/qorechain](https://discord.gg/qorechain)
- Page d'aide : [https://qorechain.io/help/qorex](https://qorechain.io/help/qorex)
- E-mail : team@qorechain.io
- Signaler une vulnérabilité : [https://qorechain.io/security](https://qorechain.io/security)

:::danger L'équipe QoreX ne demande jamais votre phrase de récupération
*"QoreChain staff will NEVER ask for your recovery phrase, password or keys. Anyone who does is a scammer."* (l'équipe QoreChain ne demandera JAMAIS votre phrase de récupération, votre mot de passe ni vos clés ; quiconque le fait est un escroc). Cela vaut aussi pour l'assistance QoreX.
:::

Le même écran propose un **résumé de diagnostic** facultatif, à copier **uniquement si l'assistance le demande**. Il contient la version de l'application, le réseau et les codes d'erreur : ni phrase, ni clés, ni adresses, ni soldes.

## Modèle de sécurité, en bref

1. **Non-custodial** - les clés sont générées sur l'appareil, vivent dans des coffres protégés par le matériel (mobile) ou un coffre chiffré (extension), et n'en sortent jamais.
2. **Rien sans consentement** - chaque connexion est par origine, chaque signature est approuvée individuellement (biométrie sur mobile), et les contenus sont décodés avant la signature. Ce que QoreX ne peut pas lire est refusé, ou clairement signalé et retenu derrière un second toucher.
3. **Voie native signée en hybride.** Chaque transfert QOR natif est signé deux fois : avec une clé classique et avec ML-DSA-87 (FIPS 204). Tout élément classique (réseaux externes, EVM) est signalé, jamais silencieux.
4. **Aucune analytique, aucun rapport de plantage, aucun SDK de suivi.** Les clés, la phrase de récupération, le coffre et les approbations ne quittent jamais l'appareil. La connexion de compte optionnelle, les notifications push et la récupération sociale n'utilisent un serveur que lorsque vous les activez ; la liste complète de ce que QoreX envoie se trouve dans [Ce que QoreX envoie sur le réseau](/qorex/overview#data-and-privacy), et la [politique de confidentialité QoreChain](https://qorechain.io/privacy) la couvre.
5. **Voies de récupération** - phrase de 24 mots (toujours), récupération sociale avec gardiens + verrouillage temporel de 48h (optionnel), héritage Legacy (optionnel), liaison d'appareil (commodité).

## Limites et problèmes connus {#limits}

- La récupération sociale, Legacy, la liaison d'appareil et le Q-Day Scanner sont réservés au mobile.
- Changer la clé post-quantique protège contre la fuite d'une clé post-quantique, pas contre la fuite d'une phrase de récupération. Les autres portefeuilles utilisant la même phrase ne peuvent pas signer pour un compte dont la clé a été changée tant qu'ils ne prennent pas en charge les clés changées.
- Les signataires liés avec limites de dépense ne sont pas encore disponibles dans QoreX.
- L'écran manuel de fenêtre EVM ne propose que « Transferts de QOR uniquement » ou « N'importe quel contrat ». Le plafond en QOR d'une fenêtre ne limite jamais les jetons.
- Les autorisations de jetons ne sont vérifiées que sur l'EVM de QoreChain, et leur révocation nécessite un compte coin 60.
- La liaison d'appareil est une commodité, pas une méthode de récupération. Un portefeuille perdu, sans phrase notée et sans récupération sociale, ne peut être récupéré par personne.
- La fenêtre d'approbation affiche certains noms de champs en anglais dans certaines versions.
