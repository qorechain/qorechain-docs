---
slug: /dashboard/developers
title: Développeurs
sidebar_label: Développeurs
sidebar_position: 13
---

# Développeurs

La page **Développeurs** (`/developers`, section **Build** de la barre latérale, entrée **Developers**) est une boîte à outils publique pour les personnes qui développent sur QoreChain. Elle comporte six onglets : **SDKs**, **PQ key status**, **Simulator**, **Signing playground**, **QoreX test wallet** et **AI agents (MCP)**. Vous pouvez vérifier quelle clé post-quantique un compte a enregistrée et si sa fenêtre d'autorisation EVM est ouverte, simuler à blanc une transaction signée, vous exercer à la signature hybride avec une clé jetable, et tester une dApp face à un faux portefeuille QoreX, le tout dans le navigateur et sans compte. Elle s'adresse aux développeurs de dApps, de portefeuilles et de backends. Pour les SDK eux-mêmes, voir [Présentation du SDK](/sdk/overview) et [Installation](/sdk/install).

## Innovations {#innovations}

- **Lire une clé PQC et une fenêtre EVM sur la chaîne, pour n'importe quelle adresse.** L'onglet PQ key status recherche la clé ML-DSA-87 qu'un compte a enregistrée et sa fenêtre d'autorisation EVM via les routes de requête propres à la chaîne, sur le mainnet ou le testnet. Il accepte les adresses `qor1...`, `0x...` et `qorvaloper1...`.
- **Une simulation à blanc qui ne diffuse rien.** Le simulateur envoie une transaction signée à la route de simulation de la chaîne et indique le gas consommé, une limite de gas suggérée, ainsi que les variations de solde et les événements que la transaction produirait. La seule route d'écriture que le Dashboard expose pour cela est la simulation.
- **Signature hybride dans le navigateur, avec une clé qui ne le quitte jamais.** Le signing playground génère dans la page une phrase jetable de 24 mots, dérive une clé secp256k1 et une clé ML-DSA-87, puis signe et vérifie des messages et des requêtes Sign In With QoreChain avec la bibliothèque [QoreSign](/qoresign/overview). La clé n'existe qu'en mémoire et disparaît au rechargement.
- **Un faux QoreX pour tester les dApps.** Le QoreX test wallet installe `window.qorex` et s'annonce via EIP-6963 comme « QoreX (mock) » dans l'onglet courant, avec une vraie signature hybride sur le testnet et une approbation ou un rejet manuel pour chaque requête.
- **Testnet uniquement par construction.** Le signing playground et le test wallet refusent le mainnet : ils ne signent que pour `qorechain-diana`. Les deux onglets en lecture seule peuvent cibler l'un ou l'autre réseau.

## Comment l'utiliser {#how-to-use}

La page s'ouvre sur l'onglet **SDKs**. Les onglets **PQ key status** et **Simulator** affichent un sélecteur **Network** propre à la page, qui **vaut Testnet par défaut**, quel que soit le réglage de l'en-tête. (Un sélecteur au niveau de la page est utilisé pour que le changement de réseau ne recharge pas la page et n'efface pas vos clés et votre faux portefeuille en mémoire.)

### PQ key status {#pq-status}

1. Ouvrez l'onglet **PQ key status** et choisissez le réseau.
2. Saisissez une **Account address** (`qor1...`, `0x...` ou `qorvaloper1...`). Une adresse `0x` correspond aux mêmes 20 octets que sa forme `qor1` ; une adresse `qorvaloper` est recherchée comme le compte propre de l'opérateur. La page vérifie le format et la somme de contrôle.
3. Sélectionnez **Check**.
4. **Registered PQC key** indique si une clé est enregistrée, son algorithme (ML-DSA-87), son type de clé, la **Proof of possession** (la chaîne la considère comme facultative) et la clé publique. Si aucune n'est enregistrée, il le dit.
5. **EVM authorisation window** affiche l'état (**Open** ou **Closed**), les **Blocks left**, les **Transactions used** (par exemple « 3 of 20 »), la **Value used**, les hauteurs d'ouverture et d'expiration, si la fenêtre est limitée aux **Native QOR transfers only**, et les cibles autorisées éventuelles. Si le compte n'en a jamais ouvert, il indique « No EVM authorisation window has been opened for this account. »

La fenêtre est ouverte depuis la voie native avec la clé ML-DSA-87 du compte, et elle se ferme lorsque sa limite de blocs ou de transactions est atteinte ; voir [Fenêtre d'autorisation EVM](/developer-guide/evm-development#evm-window). Cet onglet répond à la question fréquente « pourquoi ma transaction EVM a-t-elle été refusée ? » sans ligne de commande.

### Simulator {#simulator}

1. Ouvrez l'onglet **Simulator** et choisissez le réseau.
2. Collez un **Signed TxRaw** (base64 ou hex) dans la zone. La page vous indique la taille décodée et le nombre de signatures, et avertit s'il n'y en a aucune (la chaîne refusera très probablement de simuler une transaction non signée).
3. Sélectionnez **Simulate**. Le résultat affiche le **Gas used**, le **Suggested gas limit**, les **Balance changes** (adresse, dénomination, variation) et les **Events**.
4. Si la chaîne refuse, la page affiche son code, son codespace et son journal.

Rien n'est diffusé. Il faut des octets de transaction signée : construisez et signez d'abord avec un SDK ou `qorechaind` (voir [Signature post-quantique](/developer-guide/post-quantum-signing)). L'entrée est limitée à environ 180 Ko.

### Signing playground (testnet uniquement) {#signing-playground}

1. Ouvrez l'onglet **Signing playground**. Il avertit : « Throwaway testnet key: never use it for real funds. »
2. Sélectionnez **Generate throwaway key**. La page affiche l'adresse, la taille de la clé publique secp256k1 et les tailles des clés ML-DSA-87. Sélectionnez **New key** pour en obtenir une autre.
3. **Message :** saisissez du texte et sélectionnez **Sign**. Le texte est signé avec les deux clés pour la chaîne `qorechain-diana` ; la signature apparaît sous forme de JSON.
4. **Verify :** collez une signature et l'adresse du signataire, puis sélectionnez **Verify**. Il indique « Valid signature » ou « Invalid signature ». Comme une clé jetable n'est pas enregistrée on-chain, la vérification se fait par rapport à l'adresse du signataire et à la clé publique ML-DSA-87 de cette session.
5. **Sign In With QoreChain :** sélectionnez **Build message** pour créer un message de connexion pour ce site avec un nonce aléatoire, puis signez-le et vérifiez-le comme le ferait un serveur. Les champs analysés sont affichés. Voir la [spécification SIWQ](/qoresign/spec/siwq-v1) et le [guide de connexion](/qoresign/guides/sign-in).

La clé est générée dans le navigateur, jamais enregistrée ni envoyée, et ne peut pas être récupérée. Voir [QoreSign](/qoresign/overview) et [Signature hybride v1](/qoresign/spec/hybrid-signing-v1) pour les formats.

### QoreX test wallet (testnet uniquement) {#test-wallet}

1. Ouvrez l'onglet **QoreX test wallet** et lisez l'avertissement : chaque démarrage génère en mémoire une clé jetable de testnet ; n'y envoyez jamais de vrais fonds.
2. Sélectionnez **Start test wallet**. Il utilise le package publié `@qorechain/qorex-wallet-mock`, installe le faux portefeuille dans **cet onglet** (en remplaçant une vraie extension QoreX présente dans cet onglet jusqu'au rechargement) et liste les **Addresses** qu'il détient : QoreChain Native, EVM et SVM.
3. Connectez-vous depuis une dApp exécutée dans le même onglet, ou appelez `window.qorex` depuis la console du navigateur.
4. Chaque requête attend votre décision sous **Waiting for approval** : sélectionnez **Approve** ou **Reject**. La liste **Requests** consigne chacune avec son état d'approbation et son résultat.
5. Sélectionnez **Stop (reloads the page)** pour retirer le faux portefeuille.

Il ne signe que pour le testnet, jamais pour le mainnet. Utilisez-le pour essayer un flux de connexion de dApp avant de pointer la dApp vers un vrai QoreX.

### SDKs et agents IA (MCP)

- **SDKs :** l'onglet affiche actuellement un court guide de démarrage statique et un tableau de packages. **Il est obsolète** (il décrit encore la version 0.1.0 et indique que les packages ne sont pas sur les registres, ce qui n'est plus vrai). Utilisez [Installation du SDK](/sdk/install) pour les packages et versions actuels. Un onglet SDKs reconstruit, généré à partir de la liste testée des packages, avec les commandes d'installation, des guides de démarrage et les versions en direct des registres, est **à venir et pas encore disponible**.
- **AI agents (MCP) :** l'onglet interroge le registre npm pour le serveur MCP de QoreChain et, tant que le package n'est pas publié, indique **« The QoreChain MCP server is not published yet. »** Il n'y a pas encore de commande d'installation. Lorsque le package sera publié, l'onglet affichera la configuration client pour l'exécuter en local via stdio ou en auto-hébergé via Streamable HTTP.
- **Transaction inspector :** un outil pour décoder et expliquer n'importe quelle transaction est **à venir et pas encore disponible**.

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/developers](https://dashboard.qorechain.io/developers), ou **Developers** dans le groupe **Build** de la barre latérale (et dans le menu mobile).
- **Connexion :** aucune. La page est ouverte à tous.
- **Réseau :** PQ key status et Simulator : mainnet ou testnet, via le sélecteur de l'onglet (testnet par défaut). Signing playground et QoreX test wallet : testnet uniquement.
- **Portefeuille :** aucun. Les outils génèrent leurs propres clés jetables.
- **Coût :** gratuit. Rien n'est envoyé à la chaîne en dehors des requêtes de lecture et des appels de simulation.
- **Confidentialité :** les clés jetables n'existent que dans la mémoire de la page. Ne collez jamais une vraie phrase de récupération dans un outil.

## Où c'est publié {#where-published}

| Surface | Adresse | Réseaux |
| --- | --- | --- |
| Page Développeurs | `dashboard.qorechain.io/developers` | Outils de lecture sur mainnet et testnet ; outils de signature sur testnet uniquement |
| Bibliothèque de signature | npm `@qorechain/qoresign` 0.1.0, source `github.com/qorechain/qoresign`, voir [QoreSign](/qoresign/overview) | n/a |
| Package du faux portefeuille | npm `@qorechain/qorex-wallet-mock` 0.1.0, source `github.com/qorechain/qorex-integrations` | Testnet |
| Serveur MCP | `@qorechain/mcp` : pas encore publié | n/a |

Les versions ont été vérifiées sur le registre npm le 27 octobre 2026.

## Limites et problèmes connus {#limits}

- **Pas encore disponibles :** l'onglet SDKs reconstruit et le transaction inspector. Le serveur MCP n'est pas publié, il n'y a donc rien à installer.
- **L'onglet SDKs actuel est obsolète ;** utilisez plutôt les [pages SDK](/sdk/overview).
- **Le simulateur a besoin d'une transaction signée.** Il ne peut pas signer à votre place et ne diffuse rien.
- **Le playground et le faux portefeuille sont réservés au testnet** et utilisent des clés jetables qui disparaissent au rechargement. Ils ne peuvent ni détenir ni déplacer de vrais fonds.
- **Une vraie extension QoreX dans le même onglet est remplacée** par le faux portefeuille jusqu'au rechargement de la page.
- **Les lectures passent par un proxy en lecture seule.** Les endpoints REST de la chaîne n'envoient pas d'en-têtes CORS pour les navigateurs ; le Dashboard relaie donc les requêtes en lecture seule sous les chemins `cosmos/`, `cosmwasm/` et `qorechain/` ainsi que l'appel de simulation. Depuis votre propre code, appelez directement les endpoints publics : `api.qore.host` et `api-testnet.qore.host`.
