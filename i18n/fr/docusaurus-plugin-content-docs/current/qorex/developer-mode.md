---
slug: /qorex/developer-mode
title: Mode développeur
sidebar_label: Mode développeur
sidebar_position: 9
---

# Mode développeur

Le Mode développeur est un interrupteur dans les **Réglages** de QoreX. Il est **désactivé par défaut**. Tant qu'il est activé, QoreX affiche un ensemble d'outils destinés à ceux qui développent sur **QORE**CHAIN : des inspecteurs qui lisent le réseau, un espace pour simuler et décoder des transactions, des outils pour les contrats et les rollups, la signature hors ligne et un moyen de vérifier les transactions proposées par des agents IA.

Le Mode développeur ne modifie aucune règle de signature. Tout ce qui signe vous montre toujours ce qu'il signe et attend votre approbation, exactement comme avant.

## Innovations {#innovations}

- **Chaque outil commence par la lecture ou la vérification.** Les inspecteurs ne font que lire. Les outils capables de signer affichent une vérification décodée et attendent votre approbation.
- **Des chiffres exacts issus du réseau.** Les inspecteurs montrent ce que la chaîne elle-même rapporte : sa version, ses fonctionnalités, les clés enregistrées de votre compte, votre fenêtre EVM.
- **Des erreurs en termes simples.** Le décodeur d'erreurs transforme une erreur brute du réseau en une phrase et dit quoi faire ensuite.
- **Les agents IA proposent, vous décidez.** Un agent peut lire ce que vous autorisez et proposer une transaction. QoreX la vérifie et la simule, et vous l'approuvez ou la rejetez dans la fenêtre d'approbation habituelle. Aucun agent ne peut signer.

## Comment l'activer {#how-to-use}

- **Application mobile (iPhone et Android) :** ouvrez les **Réglages** et activez **Mode développeur**. Un onglet **Développeur** avec une icône de code (`</>`) apparaît dans la barre du bas. Ouvrez-le pour voir les outils. Désactiver le réglage masque à nouveau l'onglet.
- **Extension de navigateur :** dans la fenêtre de l'extension, touchez sept fois le numéro de version en bas. Une section **Mode développeur** apparaît dans la fenêtre, avec un bouton **Outils développeur**. Le bouton ouvre une page avec les mêmes groupes que l'onglet de l'application. La même section contient **Désactiver le mode développeur**.

La même section contient le sélecteur de réseau. L'application le propose sous **Utiliser le testnet (développeurs)** dans les Réglages, l'extension sous **Passer au testnet (diana)**. Voir [Fonctionnalités du testnet](/qorex/testnet-features) pour ce qui n'existe que sur le testnet.

Les outils sont les mêmes dans l'application et l'extension, sauf quand un outil indique le contraire. Ils sont regroupés comme suit.

## Inspecter {#inspect}

En lecture seule, sur le mainnet et le testnet. Rien sur ces écrans ne signe ni n'envoie.

### Inspecteur de réseau et de capacités

Montre sur quel réseau vous êtes et ce qu'il prend en charge : le chain id, la version du nœud, le dernier bloc, la dernière mise à niveau appliquée et celle éventuellement planifiée, les fonctionnalités du protocole que la chaîne rapporte (activées, préparées ou non activées), le chain id de la voie EVM, si la voie SVM exécute ou est fermée, les paramètres inter-VM et post-quantiques, et le nombre de canaux IBC et de routes de bridge que le réseau liste. Une seconde partie, **Ce portefeuille**, affiche votre version de QoreX, la version utilisée (application ou extension) ainsi que les méthodes de signature et le mode de simulation que cette version emploie.

Utilisation : ouvrez **Inspecteur de réseau et de capacités**. Touchez **Actualiser** pour relire. Utilisez **Copier** à côté d'une valeur pour la copier.

### Inspecteur de compte

Montre le compte actif : s'il s'agit d'un compte Cosmos (coin 118) ou d'un compte unifié (coin 60), son emplacement et ses index de dérivation, ses adresses sur chaque voie (native `qor1...`, EVM `0x...`, clé SVM) et ses clés publiques. Seules des informations publiques sont affichées ; rien de secret ne sort du coffre.

Utilisation : ouvrez **Inspecteur de compte**, puis touchez **Afficher les adresses et les clés publiques** (QoreX peut vous demander de déverrouiller).

### Inspecteur PQC

Montre la clé ML-DSA-87 enregistrée sur la chaîne pour votre compte : l'algorithme, la hauteur à laquelle elle a été enregistrée, le SHA-256 de la clé publique, sa taille, si les règles de la chaîne l'acceptent toujours et sa preuve de possession. Il peut ensuite comparer cette clé avec celle de cet appareil et indiquer si elles correspondent (clé canonique, dérivation plus ancienne ou rotation numérotée). Il comporte aussi un tableau **Ce qui protège une opération** : pour un envoi natif, une transaction EVM, une transaction SVM, un envoi IBC et un envoi sur une chaîne externe, quelle signature est post-quantique et laquelle est classique.

Utilisation : ouvrez **Inspecteur PQC** pour lire la clé on-chain, puis touchez **Comparer avec la clé de cet appareil** pour lancer la comparaison. Si la chaîne refuse la clé enregistrée, l'écran indique qu'elle doit être enregistrée à nouveau.

### Inspecteur de fenêtre EVM

Montre si une fenêtre EVM est active pour votre compte, les hauteurs et heures approximatives de son ouverture et de son expiration, combien de transactions et quelle valeur sont utilisées et restantes, et ce qu'elle autorise (uniquement les transferts de QOR, ou les appels et les transferts ; les destinataires et contrats autorisés). L'ouverture et la fermeture d'une fenêtre se font sur l'écran de la fenêtre EVM, pas ici. Voir [Sécurité et récupération](/qorex/security-and-recovery#evm-window).

Utilisation : ouvrez **Inspecteur de fenêtre EVM**. S'il indique qu'une fenêtre n'a pas pu être lue (« could not be read »), cela ne veut pas dire qu'il n'y en a pas.

## Transactions {#transactions}

Mainnet et testnet, sauf indication contraire d'un outil.

### Inspecteur de transactions

Collez un hash de transaction (QoreChain, ou EVM avec `0x`) ou une demande brute : un SignDoc JSON, un TxRaw en base64, un JSON de transaction EVM ou une demande de dApp. QoreX décode chaque message, montre qui signe, qui reçoit, les fonds déplacés, les frais, le mémo et les autorisations demandées, et indique si la signature post-quantique est jointe. Pour une transaction déjà sur le réseau, il montre aussi le résultat, le gaz utilisé et les événements. Un type de message que QoreX ne sait pas lire est affiché comme inconnu avec ses octets bruts ; QoreX ne devine pas. Les demandes sont lues sur votre appareil et ne sont jamais envoyées.

Utilisation : ouvrez **Inspecteur de transactions**, collez, touchez **Inspecter**.

### Atelier de simulation

Collez des messages QoreChain en JSON ou une transaction EVM, et QoreX demande au réseau ce qu'il en ferait. Rien n'est signé ni envoyé. Vous voyez si elle réussirait, le gaz qu'elle utiliserait et les frais, les frais uniques d'enregistrement de la clé post-quantique s'ils s'appliquent, les variations d'actifs de votre compte et une liste de ce que la simulation ne peut pas montrer (par exemple l'état propre d'un contrat, ou les étapes inter-VM qui s'exécutent dans un bloc ultérieur). Les erreurs du réseau sont traduites en termes simples, avec une suggestion sur la marche à suivre, par le **Décodeur d'erreurs** intégré : collez un journal brut, un résultat JSON ou un message d'erreur et touchez **Décoder**.

Utilisation : ouvrez **Atelier de simulation**, choisissez **Messages QoreChain** ou **Transaction EVM**, collez, touchez **Simuler**.

### Frais et parrainage

Montre le prix minimal du gaz de la chaîne, ce que QoreX paie par unité de gaz, le coût des actions courantes (envoyer, staker, ouvrir une fenêtre EVM, envoi IBC), si la prochaine transaction paie aussi l'enregistrement unique de la clé, et les allocations de frais que vous avez reçues et accordées, avec un verdict pour chacune : paierait-elle, ou pourquoi est-elle refusée (expirée, épuisée, mauvais type de message). QoreX paie ses propres frais et ne désigne jamais lui-même un payeur de frais (fee granter).

Utilisation : ouvrez **Frais et parrainage** ; la lecture se fait à l'ouverture.

### Espace de travail testnet

Des outils pour développer sur le testnet, qui ne touchent jamais le mainnet :

- **Comptes réservés au testnet.** Un compte créé à partir de votre phrase de récupération, que QoreX ne laisse jamais signer sur le mainnet et qu'il masque quand le mainnet est actif. Touchez **Créer un compte réservé au testnet**.
- **Faucet.** Copiez votre adresse testnet et touchez **Ouvrir le faucet du testnet**. Le faucet se trouve sur le Dashboard et il faut s'y connecter pour l'utiliser. Voir [Fonctionnalités du testnet](/qorex/testnet-features#get-test-qor).
- **Réinitialiser les connexions.** **Réinitialiser toutes les connexions** déconnecte tous les sites, refuse toutes les demandes encore en attente et oublie les contrats que des sites vous ont récemment fait signer. Touchez deux fois pour confirmer.

Disponibilité : l'écran s'ouvre sur les deux réseaux ; les comptes réservés au testnet et le faucet concernent le testnet.

### Journal des requêtes

Liste ce que les sites ont demandé, ce que vous avez décidé et ce que le réseau a répondu. Il est conservé uniquement sur votre appareil, et seulement tant que le Mode développeur est activé, avec au plus 500 entrées et 7 jours. Il n'enregistre jamais votre phrase de récupération, vos clés ni vos mots de passe, ni ce qui a été signé (uniquement son type et un hash). Vous pouvez le conserver après la fermeture du navigateur, l'effacer, ou **Exporter un fichier de débogage** à joindre à un rapport de bug ; le fichier est contrôlé à la recherche de phrases et de clés avant d'être écrit.

Utilisation : ouvrez **Journal des requêtes**. Activez d'abord le Mode développeur, sinon rien n'est enregistré.

## Contrats et rollups {#contracts}

### Interaction avec les contrats

Appelez des contrats EVM, CosmWasm (QoreChain natif) et SVM avec votre propre compte. Les lectures sont gratuites ; tout ce qui modifie l'état passe par la même approbation qu'une demande de dApp, qui la simule et ajoute la signature post-quantique.

Utilisation :

1. Ouvrez **Interaction avec les contrats** et choisissez le **Type de contrat**.
2. EVM : saisissez l'adresse du contrat et chargez son **ABI (JSON)**. Chaque fonction devient un formulaire typé, marqué lecture, écriture ou payable. QoreX refuse une valeur pour une fonction qui ne peut pas recevoir de QOR.
3. CosmWasm : saisissez l'adresse du contrat, chargez éventuellement un schéma issu de `cosmwasm-schema`, écrivez le **Message (JSON)** et, si nécessaire, les fonds (écrits sous la forme `1000uqor`). Utilisez **Requête** pour lire, ou **Vérifier l'exécution** pour voir exactement ce qui sera signé.
4. SVM (testnet uniquement) : saisissez l'identifiant du programme et chargez une **IDL Anchor (JSON)**. QoreX signe la transaction Solana avec votre propre clé Solana et la relaie avec votre compte QoreChain.
5. Touchez **Simuler** pour voir ce que, selon le réseau, l'appel ferait, puis **Vérifier et signer** (ou **Continuer vers l'approbation**) et approuvez dans la fenêtre d'approbation.

Vous pouvez enregistrer des contrats par réseau, les exporter dans un fichier et les réimporter. Un panneau **Infos du contrat** montre le code id, le créateur, le libellé et l'admin d'un contrat CosmWasm.

### Approbation de déploiement

Approuvez un déploiement préparé par votre outil en ligne de commande, votre IDE ou votre agent. QoreX calcule lui-même le hash du code, décode les arguments du constructeur et vérifie qui peut mettre à niveau le contrat avant toute signature. Il refuse si le hash annoncé par l'outil ne correspond pas aux octets. Il avertit en cas de modèles de proxy évolutif, d'un admin ou d'une autorité de mise à niveau qui n'est pas votre compte, et d'un contrat sans admin qui ne pourra jamais être migré. Il gère les déploiements de contrats EVM et les contrats CosmWasm instanciés à partir d'un code déjà stocké. QoreX ne téléverse pas de code CosmWasm, et le déploiement de programmes SVM n'est pas pris en charge dans cette version. Les téléversements de code sur un réseau qui les fait passer par la gouvernance ne peuvent pas être signés depuis un portefeuille.

Utilisation : ouvrez **Approbation de déploiement**, collez le JSON de demande de déploiement issu de votre outil (touchez **Afficher le format** pour le voir), touchez **Vérifier**, lisez la vérification, puis **Approuver et signer**.

### Profils de rollup et d'appchain

Ajoutez un rollup ou une appchain construits avec le QoreChain RDK. QoreX interroge son nœud en direct avant de conserver le profil et montre chaque contrôle : chain id REST et RPC, préfixe d'adresse, chain id EVM et le rollup sur QoreChain. Un profil peut s'adosser (règlement) au mainnet ou au testnet. Tant qu'un profil est actif, chaque écran de vérification demande quel réseau signe, et la signature pour un nœud qui ne confirme pas son chain id est refusée.

Utilisation : ouvrez **Profils de rollup et d’appchain**, touchez **Ajouter un profil**, renseignez le nom, le chain id et les points de terminaison, puis **Vérifier et ajouter**. Utilisez **Activer** ou **Ne plus utiliser** pour changer, et **Vérifier à nouveau** à tout moment.

## Autres machines virtuelles {#other-vms}

### Solana sur QoreChain (testnet uniquement)

La voie SVM sur le **testnet** QoreChain : les fenêtres SVM et le relais d'une transaction Solana signée. Cet outil n'est affiché que lorsque le testnet est actif ; sur le mainnet, la voie SVM n'est pas ouverte et rien ici ne peut être utilisé. Les détails et les étapes se trouvent dans [Fonctionnalités du testnet](/qorex/testnet-features#solana-on-qorechain).

### Appel inter-VM

Composez un appel depuis votre compte vers un contrat sur une autre voie d'exécution de QoreChain même (EVM, CosmWasm ou SVM). Rien ne quitte QoreChain : ce n'est pas un bridge vers une autre chaîne. Le formulaire demande la voie cible, le contrat ou le programme, la charge utile et, pour CosmWasm uniquement, les QOR à joindre.

Vous choisissez **Quand il s'exécute**, et QoreX le dit clairement :

- **Maintenant, dans cette transaction (atomique) :** tout se produit, ou rien.
- **En file pour un bloc ultérieur (non atomique) :** il s'exécute dans un bloc ultérieur. S'il échoue ou expire, ce que cette transaction a fait reste acquis.

Utilisation : ouvrez **Appel inter-VM**, remplissez le formulaire, touchez **Simuler** pour voir les étapes et les frais, puis **Signer et envoyer**. QoreX ne signe que les appels qu'il a simulés. Si les appels inter-VM sont désactivés sur le réseau, l'écran le dit et ne propose rien à signer. Sur le mainnet aujourd'hui, les appels inter-VM sont fermés ; attendez-vous donc à ce message.

### Suivre un appel inter-VM

Collez le hash d'une transaction (QoreChain, ou `0x` pour l'EVM) et QoreX lit ses segments inter-VM. Un segment en file apparaît comme en attente, exécuté, échoué ou expiré. Les segments d'une transaction EVM se sont exécutés dans la transaction elle-même et sont lus dans son résultat. Les enregistrements en file terminés sont élagués par le réseau au bout d'un moment, et l'outil de suivi le signale quand l'enregistrement a disparu.

Utilisation : ouvrez **Suivre un appel inter-VM**, collez le hash, touchez **Suivre**.

## Signature et agents {#signing-and-agents}

### Autorisations et sessions

Liste tout ce que votre compte a autorisé d'autres adresses à faire, avec les limites que la chaîne elle-même impose, et vous permet de révoquer chaque élément : **Autorisations**, **Allocations de frais**, **Clés liées** et **Fenêtres d’accès**. Chacun montre ce qu'il peut faire, sa limite et sa date d'expiration (ou le fait qu'il n'expire jamais). **Révoquer** envoie la transaction de révocation ; **Fermer la fenêtre** ferme une fenêtre EVM.

Vous pouvez aussi donner à une application ou à une autre adresse une session limitée avec **Nouvelle session** : appeler uniquement les contrats listés, envoyer jusqu'à un montant fixé, staker avec des validateurs choisis, ou voter et réclamer les récompenses, pendant un nombre de jours, en payant éventuellement ses frais jusqu'à une limite. Un **Aperçu** dit exactement ce que le bénéficiaire pourra faire, et liste à part ce que la chaîne n'impose pas, à propos de quoi QoreX vous interrogera à chaque fois.

### Espace de travail hors ligne et multisignature {#multisig}

Préparez n'importe quelle transaction sous forme de fichier au format de la ligne de commande de la chaîne, vérifiez chaque signature d'un fichier multisignature, ou signez sur un appareil et diffusez depuis un autre.

- **Signature hors ligne :** préparez une transaction sur un appareil en ligne (partez d'un modèle comme envoi, délégation ou appel de contrat, ou collez les messages), apportez le fichier ou le code QR au QoreX qui détient la clé, vérifiez-la, **Signer**, puis **Envoyer au réseau** depuis l'un ou l'autre appareil.
- **Vérifier les signatures :** ouvrez la transaction et les éventuels fichiers de signature. Pour chaque membre du multisignature, QoreX montre s'il a une clé post-quantique enregistrée et si le tour 1 (post-quantique) et le tour 2 (classique) sont valides, périmés, invalides ou manquants, et quel tour manque encore.

La vérification affiche toujours le mémo et chaque cryptomonnaie de frais, et QoreX ne signe que les octets que vous avez vérifiés. Il refuse des frais dans une cryptomonnaie autre que QOR, des frais bien supérieurs au prix élevé du gaz du réseau et des frais payés ou accordés par un autre compte. Si le fichier change après votre vérification, vous devez le rouvrir et le vérifier à nouveau. QoreX ne diffusera pas une transaction sans sa signature ML-DSA-87.

## Agents IA {#ai-agents}

Les agents IA (votre propre assistant IA, ou un outil que vous exécutez) peuvent lire les comptes que vous choisissez et **proposer** une transaction. Ils ne peuvent pas signer. Le modèle est le suivant :

1. Vous décidez quels comptes un agent peut voir et pour lesquels il peut proposer. Vous pouvez suspendre ou révoquer un agent à tout moment, et la liste **Activité** montre ce qu'il a fait.
2. QoreX vérifie chaque proposition et la simule sur le réseau. Une proposition que QoreX ne peut pas lire, ou dont le réseau dit qu'elle échouerait, ne vous est pas montrée.
3. Vous voyez la proposition dans la fenêtre d'approbation habituelle, marquée comme proposée par un agent IA et non par un site web, et vous l'approuvez ou la rejetez. Rien n'est signé tant que vous n'avez pas approuvé.

QoreX ne signe jamais les types de demandes qu'aucune partie extérieure ne peut faire, quel qu'en soit l'auteur. Une limite de propositions par heure empêche tout déluge, et une seule proposition est en attente à la fois.

Comment l'utiliser :

- **Application mobile :** activez le Mode développeur, ouvrez **Agents IA**, puis collez le JSON de proposition de votre agent et touchez **Vérifier la proposition**, ou ouvrez un lien `qorex://propose`. QoreX ne peut pas vérifier qui a écrit une proposition collée ou un lien, et le dit. Vérifiez-la, puis approuvez ou rejetez.
- **Extension de navigateur (Chrome, Edge, Brave, Firefox) :** un agent se connecte via un programme compagnon sur votre ordinateur qui utilise le Model Context Protocol. Ce programme n'est pas encore publié ; la partie extension ne peut donc pas encore être utilisée par le public. Quand il le sera, vous activerez **Autoriser les connexions d'agents IA sur cet ordinateur**, appairerez l'agent avec un code à usage unique qui expire au bout de 5 minutes et choisirez ses comptes.
- **Safari :** non disponible. Safari ne peut pas connecter QoreX à des programmes sur votre ordinateur.

## Limites {#limits}

- Le Mode développeur s'adresse à ceux qui développent. Si vous ne faites qu'envoyer, recevoir et staker, vous n'en avez pas besoin.
- Un outil qui dépend du réseau (les inspecteurs, le simulateur, les outils de suivi) indique qu'il n'a pas pu lire (« could not read ») quand le réseau est injoignable. Cela ne veut pas dire qu'il n'y a rien.
- Les outils SVM et le compositeur inter-VM dépendent de ce que le réseau autorise. Sur le mainnet aujourd'hui, la SVM et les appels inter-VM sont fermés.
- Dans l'extension de navigateur, il faut toucher le numéro de version pour révéler l'interrupteur ; dans l'application, il se trouve dans les Réglages.
