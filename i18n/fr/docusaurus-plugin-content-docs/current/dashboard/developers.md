---
slug: /dashboard/developers
title: Développeurs
sidebar_label: Développeurs
sidebar_position: 13
---

# Développeurs

La page **Développeurs** (`/developers`, section **Build** de la barre latérale, entrée **Developers**) est une page publique d'outils pour développer sur QoreChain. Aucun compte n'est nécessaire. Elle comporte sept onglets : **SDKs**, **Transaction inspector**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** et **AI agents (MCP)**. Ensemble, ils vous permettent de trouver et d'installer le bon package, de lire n'importe quelle transaction validée et de voir si sa couche post-quantique est vérifiée, de vérifier quelle clé post-quantique un compte a enregistrée et si sa fenêtre d'autorisation EVM est ouverte, de simuler à blanc une transaction signée, de vous exercer à la signature hybride avec une clé jetable, et de tester une dApp face à un faux portefeuille QoreX, le tout dans le navigateur. Elle s'adresse aux développeurs de dApps, de portefeuilles et de backends. Pour les bibliothèques elles-mêmes, voir [Packages pour développeurs](/developer-tools/overview), la [Présentation du SDK](/sdk/overview) et [Installation](/sdk/install).

## Innovations {#innovations}

- **Une passerelle en lecture seule vers la chaîne.** Les outils lisent des données publiques de la chaîne et simulent une transaction via une passerelle en lecture seule, sous les chemins de requête `cosmos/`, `cosmwasm/` et `qorechain/` ainsi que l'appel de simulation. Rien sur la page ne peut diffuser une transaction. La passerelle existe parce que les endpoints REST de la chaîne n'envoient pas d'en-têtes CORS pour les navigateurs.
- **Des clés qui ne quittent jamais le navigateur.** Les clés du signing playground et du test wallet sont générées dans votre navigateur et conservées uniquement en mémoire. Elles ne sont jamais enregistrées ni envoyées, et disparaissent au rechargement. Ces deux onglets sont réservés au testnet et refusent le mainnet.
- **La bibliothèque de signature de production, pas une démo.** Le playground utilise [QoreSign](/qoresign/overview), la même bibliothèque open source que les intégrations de production. Elle produit et vérifie des signatures hybrides : une signature secp256k1 plus une signature ML-DSA-87 sur le même message.
- **Un hub de packages généré à partir de données testées.** L'onglet **SDKs** liste 48 packages à partir d'un seul manifeste. Les versions sont lues en direct sur chaque registre (actualisées toutes les 10 minutes, avec la dernière version vérifiée et sa date affichées si un registre est injoignable), et chaque guide de démarrage a été exécuté par l'équipe SDK sur les registres publics, avec la sortie qu'elle a observée affichée à côté.
- **Un verdict reproductible.** Le **Transaction inspector** lit une transaction validée et indique si sa couche ML-DSA-87 est vérifiée par rapport à la clé que le signataire a enregistrée, avec la version des sign-bytes et la raison lorsqu'elle ne l'est pas, grâce à la fonction `inspectTransaction` de [QoreSign](/qoresign/overview) 0.1.1 ; la même vérification s'exécute donc dans votre propre code. Il est en lecture seule.
- **Des réponses de la chaîne, pas des suppositions.** **PQ key status** lit la clé ML-DSA-87 enregistrée et l'état de la fenêtre EVM sur les routes de requête propres au nœud, ce qui vous permet de voir pourquoi une transaction EVM serait refusée avant de l'envoyer.

## Comment l'utiliser {#how-to-use}

Ouvrez [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers). La page s'ouvre sur **SDKs**. Les onglets **PQ key status** et **Simulator** affichent un sélecteur **Network** (Testnet ou Mainnet) propre à la page, qui **vaut Testnet par défaut**, quel que soit le réglage de l'en-tête. Il est propre à la page volontairement : le commutateur de l'en-tête recharge la page, ce qui effacerait les clés en mémoire et le faux portefeuille.

### SDKs {#sdks}

**Ce que fait l'onglet.** Il liste chaque bibliothèque QoreChain, regroupée par produit. Le manifeste contient 48 packages en TypeScript, Python, Go, Rust, Java, Kotlin et Swift. 46 sont stables, 1 est obsolète, et 1 n'est pas encore sur son registre et est signalé **Not published yet** (QoreSeal pour npm). Les produits, dans l'ordre d'affichage, sont : QoreChain SDK (le cœur, les hooks React, EVM, SVM, le starter de dApp et les portages Python, Rust, Go et Java), QoreSign (y compris QoreSign pour Python), QoreSeal (chiffrement vers des comptes avec ML-KEM-1024, testnet ; voir [QoreSeal](/developer-tools/qoreseal), en Rust, Go, Python, Swift, Kotlin et Android), RDK (le kit de développement de rollups, son outil en ligne de commande, le starter de rollup et les portages Python, Rust, Go et Java), la bibliothèque PQC, l'adaptateur de portefeuille, le chain bridge, Handles, les intégrations QoreX, et MCP et la CLI `qore`.

**Fonctionnement.** Chaque produit est une carte. Si le produit existe en plusieurs langages, un sélecteur de langage (pastilles) change le package affiché. Chaque package présente :

- une pastille de statut (**Stable**, **Not published yet** ou **Deprecated**) ;
- la **dernière version**, lue en direct sur son registre (npm, PyPI, crates.io, le proxy Go, Maven Central ou les releases GitHub) et actualisée toutes les 10 minutes. Si un registre est injoignable, la dernière version vérifiée est affichée avec sa date et une note indiquant que les versions en direct n'ont pas pu être lues ;
- le **Registry**, la **Source** (dépôt) et la **License** (Apache-2.0), ainsi que les prérequis d'exécution ;
- la commande **Install** et la ligne **Import**, chacune avec un bouton de copie, plus les dépendances peer, les exports de sous-chemins, les transports et un endpoint hébergé lorsque le package en a (Maven affiche un bloc `pom.xml`) ;
- le **Quickstart** : une pastille indiquant **Tested** avec la date, **Failed in testing** ou **Not tested**, le nom du fichier, le code avec un bouton de copie, l'**Observed output** et **How it was tested**. Un guide de démarrage en échec est masqué derrière **Show the quickstart**, avec un avertissement invitant à lire d'abord les problèmes connus ;
- les **Known issues** et des notes, mot pour mot de l'équipe SDK.

Un package non publié affiche « This package is not on its registry yet, so there is no install command. » et aucune ligne d'installation. Le package obsolète (`@qorechain/connect`) est replié en bas sous **Deprecated packages**, avec ses remplaçants (les packages `@qorechain/qorex-*`).

**Étapes.**

1. Saisissez du texte dans la zone de filtre (« Filter by name or language ») pour réduire la liste ; **Clear filter** la réinitialise. Lorsque plusieurs produits correspondent, une ligne **Jump to** renvoie vers chacun.
2. Choisissez le produit, puis la pastille de langage.
3. Vérifiez la ligne de version (« latest on npm », ou « checked » avec une date), puis copiez la commande **Install**.
4. Copiez la ligne **Import**, puis le guide de démarrage dans le fichier indiqué sous **File name**, et exécutez-le.
5. Ouvrez **Network endpoints** pour copier les identifiants de chaîne et les endpoints publics du testnet et du mainnet. La note en dessous explique les conventions des guides de démarrage : les exemples ne font que lire, et signent avec la phrase de test publique ; n'alimentez donc jamais un compte qui en est dérivé.

**Exemple minimal.** Saisissez `python` dans le filtre, ouvrez **QoreChain SDK**, choisissez la pastille **Python**, copiez la commande d'installation depuis **Install**, puis copiez le guide de démarrage et exécutez-le.

**Réseau.** Liste statique plus lectures en direct sur les registres ; aucun choix de réseau ne s'applique.

### Transaction inspector {#inspector}

**Ce que fait l'onglet.** Il lit une transaction validée à partir de son hash et explique qui l'a signée, ce qu'elle a coûté, si sa couche post-quantique est vérifiée et dans quel niveau de sécurité elle se place. Il est en lecture seule : rien n'est signé ni envoyé.

**Fonctionnement.** La page demande la transaction à la passerelle en lecture seule du Dashboard, sur le réseau que vous choisissez, et exécute dessus la fonction `inspectTransaction` de [QoreSign](/qoresign/overview) 0.1.1 (voir le [guide de démarrage QoreSign](/qoresign/quickstart) pour exécuter la même vérification en code). La couche post-quantique est vérifiée par rapport à la clé ML-DSA-87 que le signataire a enregistrée **maintenant** : une rotation de clé ultérieure peut donc faire apparaître une transaction plus ancienne comme non vérifiée.

**Étapes.**

1. Ouvrez l'onglet **Transaction inspector** (il se trouve juste après **SDKs**) et choisissez **Testnet** ou **Mainnet** avec le sélecteur.
2. Collez le **Transaction hash** : 64 caractères hexadécimaux, avec ou sans `0x`. Un hash mal formé est rejeté avant toute requête.
3. Sélectionnez **Inspect**.
4. Lisez le résultat :
   - **Overview :** **Status** (**Success**, ou **Failed** avec le codespace et le code), **Height**, **Chain id**, **Memo**, **Fee** avec la **Gas limit** (et le payeur ou le bénéficiaire des frais lorsqu'il est défini), et **Open in explorer**. L'explorateur suit le réseau choisi dans l'en-tête ; une note vous invite donc à le changer lorsque la transaction se trouve sur l'autre réseau.
   - **Signer :** **Address**, **Key type**, **Sequence**, **Public key** et **Classical signature valid**. Les transactions de la voie EVM ne portent ici aucune information de signataire, et l'onglet l'indique.
   - **Post-quantum layer :** **Present**, **Count**, **Algorithm** (ML-DSA-87), **Verified** (oui ou non), **Sign-bytes version** et, lorsqu'elle n'est pas vérifiée, la **Reason**.
   - **Security tier**, avec ces définitions :

     | Niveau | Signification |
     | --- | --- |
     | **PQC** | Porte la couche ML-DSA-87 : une signature hybride. |
     | **Enrollment** | Enregistre ou gère la clé ML-DSA-87 du compte, et est signée par conception avec la clé classique. |
     | **SHAKE** | Une transaction de la voie native sans la couche ML-DSA-87. |
     | **Classical** | Une transaction de la voie EVM, signée avec secp256k1 uniquement. |

   - **Messages :** l'URL de type de chaque message et sa valeur brute (**Show raw value (base64)**), ainsi que le **Raw JSON**.
5. Un hash inconnu affiche « No transaction with this hash was found on ... » avec une invitation à vérifier le hash ou à changer de réseau. Les nœuds du testnet élaguent l'ancien historique : une ancienne transaction du testnet peut donc avoir disparu.

**Exemple minimal.** Choisissez **Testnet** et collez `124E5B2B5B5A8AE7CBA254224CBA07F5014BD1B0014C164A8208E5D7EC0C664E` : le niveau affiche **PQC** et la couche post-quantique affiche **Verified** (vérifié le 27 octobre 2026 ; si cette transaction a été élaguée depuis, utilisez le hash d'un transfert récent du testnet).

**Réseau.** Mainnet ou testnet, via le sélecteur de l'onglet (testnet par défaut).

### PQ key status {#pq-status}

**Ce que fait l'onglet.** Il affiche la clé ML-DSA-87 qu'un compte a enregistrée on-chain et l'état de sa fenêtre d'autorisation EVM, sur le mainnet ou le testnet.

**Fonctionnement.** La page analyse votre saisie, la convertit en compte `qor1...` et pose deux requêtes au nœud : la clé PQC enregistrée (via [QoreSign](/qoresign/overview)) et la fenêtre EVM du compte (`GET /qorechain/pqc/v1/evm_window/{address}`). Une adresse `0x...` correspond aux mêmes 20 octets que sa forme `qor1...`, et une adresse `qorvaloper1...` est recherchée comme le compte propre de l'opérateur. Les résultats appartiennent à un seul réseau : changer le sélecteur les efface.

**Étapes.**

1. Ouvrez l'onglet **PQ key status** et choisissez le réseau.
2. Saisissez une **Account address** (`qor1...`, `0x...` ou `qorvaloper1...`). La page vérifie le format et la somme de contrôle, et signale une faute de frappe.
3. Sélectionnez **Check**.
4. Lisez **Registered PQC key** : si une clé est enregistrée, l'**Algorithm** (ML-DSA-87), le **Key type** (hybrid), la **Proof of possession** (avec la note indiquant que la chaîne la considère comme facultative) et la **Public key** (2592 octets, tronquée, avec un bouton de copie). Un compte sans clé affiche « This account has no PQC key registered on this network. »
5. Lisez **EVM authorisation window** : **State** (**Open** ou **Closed**), **Blocks left**, **Transactions used** (du type « 3 of 20 »), **Value used**, **Opened / expiry height**, et si la fenêtre est limitée aux **Native QOR transfers only**, avec les cibles autorisées éventuelles. Un compte qui n'en a jamais ouvert affiche « No EVM authorisation window has been opened for this account. »

La fenêtre est ouverte depuis la voie native avec la clé ML-DSA-87 du compte, et elle se ferme lorsque sa limite de blocs ou de transactions est atteinte ; voir [Fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window).

**Exemple minimal.** Choisissez Testnet, collez la forme `0x...` d'une adresse que vous utilisez avec MetaMask, sélectionnez **Check** : si la fenêtre est **Closed** ou absente, une transaction EVM de ce compte serait refusée.

### Simulator {#simulator}

**Ce que fait l'onglet.** Il simule à blanc une transaction signée sur la chaîne et indique ce qu'elle coûterait et changerait. Rien n'est diffusé.

**Fonctionnement.** La page décode votre saisie (base64 ou hex, jusqu'à environ 180 Ko), compte ses signatures et l'envoie à la route de simulation du nœud. L'appel de simulation est la seule route d'écriture que la passerelle autorise.

**Étapes.**

1. Ouvrez **Simulator** et choisissez le réseau.
2. Collez la transaction signée (un `TxRaw`, en base64 ou hex) dans **Signed TxRaw**. La page indique la taille décodée et le nombre de signatures, et avertit s'il n'y en a aucune (la chaîne refusera très probablement de simuler une transaction non signée).
3. Sélectionnez **Simulate**.
4. Lisez **Gas used**, le **Suggested gas limit**, les **Balance changes** (adresse, dénomination, variation) et les **Events** dans la liste repliable.
5. Si la chaîne refuse, la page affiche son **Code**, son **Codespace** et son **Log** sous « The chain refused the simulation ».

Il faut d'abord des octets signés : construisez et signez avec un SDK ou `qorechaind` (voir [Signature post-quantique](/developer-guide/post-quantum-signing)). **Exemple minimal :** signez un petit transfert avec le SDK sur le testnet, collez le `TxRaw` en base64, sélectionnez **Simulate**, et vérifiez la limite de gas suggérée avant de diffuser.

### Signing playground (testnet uniquement) {#signing-playground}

**Ce que fait l'onglet.** Il vous permet de générer une clé hybride jetable, puis de signer et de vérifier des messages et des requêtes Sign In With QoreChain dans le navigateur.

**Fonctionnement.** Une phrase de 24 mots est générée dans la page et conservée uniquement en mémoire. [QoreSign](/qoresign/overview) en dérive une clé secp256k1 et une clé ML-DSA-87. Les signatures couvrent le même message avec les deux clés, pour la chaîne `qorechain-diana`. Comme une clé jetable n'est pas enregistrée on-chain, la vérification utilise la clé publique ML-DSA-87 de cette session.

**Étapes.**

1. Ouvrez **Signing playground**. Il avertit : « Throwaway testnet key: never use it for real funds. »
2. Sélectionnez **Generate throwaway key**. La page affiche l'adresse `qor1...`, la clé publique secp256k1 (33 octets) et la clé ML-DSA-87 (clé publique de 2592 octets, clé secrète de 4896 octets). **New key** la remplace.
3. **Message :** saisissez du texte et sélectionnez **Sign** ; le résultat est une signature hybride sous forme de JSON. Sélectionnez **Verify** : la page affiche « Valid signature », ou « Invalid signature » avec le code d'erreur.
4. **Sign In With QoreChain :** sélectionnez **Build message** (un message de connexion pour ce site avec le domaine, l'adresse, l'identifiant de chaîne, un nonce aléatoire et les heures d'émission et d'expiration), puis **Sign**, puis **Verify**. Verify le contrôle comme le ferait un serveur et liste les champs analysés. Voir la [spécification SIWQ](/qoresign/spec/siwq-v1) et le [guide de connexion](/qoresign/guides/sign-in).

**Exemple minimal.** **Generate throwaway key**, saisissez `hello`, **Sign**, **Verify** : la page affiche « Valid signature ».

**Réseau.** Testnet uniquement ; la clé ne peut pas servir sur le mainnet et est perdue au rechargement.

### QoreX test wallet (testnet uniquement) {#test-wallet}

**Ce que fait l'onglet.** Il installe un faux portefeuille QoreX dans l'onglet courant afin que vous puissiez essayer les flux de connexion et de signature d'une dApp sans vrai portefeuille.

**Fonctionnement.** **Start test wallet** crée un portefeuille de test avec une clé jetable (le package publié `@qorechain/qorex-wallet-mock`) et l'annonce aux dApps de la page sous le nom « QoreX (mock) », via la découverte standard des portefeuilles de navigateur (EIP-6963) ; il expose aussi `window.qorex`. Rien n'est approuvé automatiquement. Il ne diffuse pas de transactions. Si une vraie extension QoreX est présente dans l'onglet, le faux portefeuille la remplace jusqu'au rechargement.

**Étapes.**

1. Ouvrez **QoreX test wallet** et lisez l'avertissement : chaque démarrage génère en mémoire une clé jetable de testnet ; n'y envoyez jamais de vrais fonds.
2. Sélectionnez **Start test wallet**. La carte **Addresses** liste les adresses QoreChain Native, EVM et SVM.
3. Connectez-vous depuis une dApp exécutée dans cet onglet, ou appelez `window.qorex` depuis la console du navigateur.
4. Chaque requête apparaît sous **Waiting for approval** ; sélectionnez **Approve** ou **Reject**. La liste **Requests** consigne chaque requête avec son état d'approbation et son résultat.
5. Sélectionnez **Stop (reloads the page)** pour retirer le faux portefeuille.

**Exemple minimal.** Démarrez le test wallet, ouvrez une dApp dans le même onglet, choisissez « QoreX (mock) » dans sa boîte de dialogue de connexion et **Approve** la connexion.

**Réseau.** Testnet uniquement.

### AI agents (MCP) {#mcp}

**Ce que fait l'onglet.** Il affiche le statut du serveur MCP de QoreChain (un serveur Model Context Protocol qui permet à un client MCP de lire les données de la chaîne QoreChain et d'utiliser les outils pour développeurs) et la manière de le configurer dans un client MCP.

**Fonctionnement.** À l'ouverture de l'onglet, la page interroge le registre de packages en direct et affiche le statut (**Published**) avec la version actuelle (`@qorechain/mcp`, 0.1.0 au moment de la rédaction, également disponible sur PyPI sous le nom `qorechain-mcp`). Elle affiche ensuite la configuration pour un client MCP, sous forme de blocs copiables :

- **Local (stdio), l'option principale.** Ajoutez `{ "mcpServers": { "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] } } }` à la configuration des serveurs de votre client MCP. Aucune clé n'est nécessaire.
- **Auto-hébergé (Streamable HTTP).** Lancez `qorechain-mcp serve --port 8787` et pointez le client vers `http://localhost:8787/mcp`.
- **Point de terminaison hébergé.** `https://mcp.qorechain.io/mcp` sert le testnet par défaut. Chaque requête exige une clé d'API, envoyée dans un en-tête `Authorization: Bearer <key>`. Demandez-en une depuis votre tableau de bord (voir le déroulement ci-dessous). Pour la plupart des usages, la configuration locale n'a besoin d'aucune clé.

**Clé d'API pour le point de terminaison hébergé.** Connectez-vous, puis, dans la section **API key** de l'onglet :

1. Renseignez le nom ou l'organisation, un contact, l'usage prévu et le volume attendu, puis appuyez sur **Request API key**. Le statut indique « waiting for approval ».
2. L'équipe QoreChain approuve ou rejette la demande. Un rejet affiche sa note, et vous pouvez refaire une demande.
3. Après approbation, appuyez sur **Generate key**. La clé n'est affichée qu'une seule fois, avec un bouton de copie et un extrait de configuration prêt à l'emploi, et devient active en une à deux minutes. QoreChain ne conserve aucune copie de la clé, seulement une empreinte (un hash) : une clé perdue ne peut donc pas être réaffichée, il faut la révoquer et en demander une nouvelle.
4. **Revoke key** est disponible à tout moment et prend effet en environ une minute.

Limites : une seule clé active par compte, 10 requêtes par seconde (rafale de 20) et 100 000 requêtes par jour.

**Étapes.** Ouvrez l'onglet, copiez la configuration locale dans votre client MCP, redémarrez-le, puis demandez-lui de lire un bloc ou un compte. Pour le détail des outils et des options, voir [Serveur MCP QoreChain](/developer-tools/mcp). **Exemple minimal :** collez le bloc stdio dans votre client, redémarrez-le et demandez-lui le dernier bloc.

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), ou **Developers** dans le groupe **Build** de la barre latérale (et dans le menu mobile).
- **Connexion :** aucune pour la page et ses outils. La demande d'une clé d'API pour le point de terminaison MCP hébergé exige une connexion.
- **Réseau :** **Transaction inspector**, **PQ key status** et **Simulator** fonctionnent sur le mainnet ou le testnet via le sélecteur de l'onglet (testnet par défaut). **Signing playground** et **QoreX test wallet** sont réservés au testnet. **SDKs** et **AI agents (MCP)** ne dépendent d'aucun réseau.
- **Portefeuille :** aucun. Les outils génèrent leurs propres clés jetables.
- **Coût :** gratuit. Rien n'est envoyé à la chaîne en dehors des requêtes de lecture et des appels de simulation.
- **Confidentialité :** les clés jetables n'existent que dans la mémoire de la page. Ne collez jamais une vraie phrase de récupération dans un outil.

## Où c'est publié {#where-published}

| Surface | Adresse | Réseaux |
| --- | --- | --- |
| Page Développeurs | `dashboard.qorechain.io/developers` | Outils de lecture sur mainnet et testnet ; outils de signature sur testnet uniquement |
| Bibliothèque de signature | npm `@qorechain/qoresign` (la 0.1.1 ajoute `inspectTransaction`), PyPI QoreSign pour Python, source `github.com/qorechain/qoresign`, voir [QoreSign](/qoresign/overview) | n/a |
| Package du faux portefeuille | npm `@qorechain/qorex-wallet-mock`, source `github.com/qorechain/qorex-integrations` | Testnet |
| Index des packages | [Packages pour développeurs](/developer-tools/overview) | n/a |
| Serveur MCP | npm `@qorechain/mcp` 0.1.0 et `@qorechain/qore-cli` 0.1.0, PyPI `qorechain-mcp` 0.1.0 ; guide : [Serveur MCP QoreChain](/developer-tools/mcp) | Testnet par défaut |

Les versions des packages évoluent ; consultez les versions actuelles dans l'onglet **SDKs** ou sur les registres.

## Limites et problèmes connus {#limits}

- **L'inspecteur juge par rapport à la clé enregistrée maintenant.** Après une rotation de clé, une transaction plus ancienne peut apparaître comme non vérifiée. Il ne lit que des transactions validées.
- **Le point de terminaison MCP hébergé exige une clé d'API.** Demandez-en une depuis votre tableau de bord (une clé active par compte, 10 requêtes par seconde, 100 000 par jour) ; la configuration locale n'en demande aucune. Utilisez la configuration locale pour la plupart des tâches.
- **Deux guides de démarrage sont marqués « Not tested » :** QoreSign pour Android et QoreSeal pour Android (le même code a été exécuté sur l'artefact JVM, pas sur un appareil). Les autres guides de démarrage testés ont été exécutés et ont réussi.
- **Le simulateur a besoin d'octets signés.** Il ne peut pas signer à votre place et ne diffuse jamais rien.
- **Le playground et le faux portefeuille sont réservés au testnet,** utilisent des clés jetables qui disparaissent au rechargement, et ne peuvent ni détenir ni déplacer de vrais fonds.
- **Une vraie extension QoreX dans le même onglet est remplacée** par le faux portefeuille jusqu'au rechargement.
- **Les lectures passent par la passerelle du Dashboard.** Depuis votre propre code, appelez directement les endpoints publics : `api.qore.host` et `api-testnet.qore.host`.
