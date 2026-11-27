---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Foire aux questions

Questions générales sur QoreChain, répondues à partir de la documentation. Chaque réponse renvoie vers la page de référence pour le détail complet. Pour les questions spécifiques au SDK, consultez la [FAQ du SDK](/sdk/faq).

### Le mainnet est-il en ligne ?

Oui. Le mainnet de QoreChain (chaîne `qorechain-vladi`, EVM chain ID 9801) est en ligne depuis le 7 juin 2026 et exécute la version v3.2.8 (appliquée à la hauteur 4 273 000 le 18 novembre 2026 par la proposition de gouvernance 17 ; la v3.2.7 avait été appliquée à la hauteur 4 164 600 le 12 novembre 2026 par la proposition 16) ; le testnet, `qorechain-diana`, exécute la v3.2.9 depuis le 20 novembre 2026, après la v3.2.8 du 12 novembre (v3.2.9 à la hauteur 10 424 000 ; v3.2.8 à la hauteur 9 929 500). Voir [Réseaux](/appendix/networks) et [Se connecter au mainnet](/getting-started/connecting-to-mainnet).

### Quels sont les chain IDs et les EVM chain IDs ?

Le mainnet est la chaîne Cosmos `qorechain-vladi` avec l'EVM chain ID **9801** (hex `0x2649`) ; le testnet est `qorechain-diana` avec l'EVM chain ID **9800** (hex `0x2648`). Voir [Réseaux](/appendix/networks) pour le tableau complet.

### Comment les frais de transaction sont-ils distribués ?

Les frais collectés sont répartis à hauteur de **37 % aux validateurs, 30 % brûlés, 20 % à la trésorerie communautaire, 10 % aux stakers et 3 % aux nœuds légers**. Cette répartition s'applique à tout ce qui se trouve dans le collecteur de frais, y compris l'émission d'époque. Voir [Tokenomics](/architecture/tokenomics#fee-distribution).

### Qu'est-ce que PRISM ?

PRISM est la couche d'optimisation par apprentissage par renforcement intégrée au moteur de consensus de QoreChain. Elle observe les métriques du réseau et propose des ajustements déterministes des paramètres de consensus sous des contrôles de sécurité de type disjoncteur. Aujourd'hui, elle fonctionne en mode observation : aucune politique entraînée n'est chargée, elle ne modifie donc aucun paramètre. Voir [Moteur de consensus PRISM](/architecture/prism-consensus-engine).

### Le bridge inter-chaînes est-il en ligne ?

Non. Le module de bridge est déployé, mais les 37 configurations de chaînes sont toutes en attente, aucun validateur de bridge n'est enregistré et aucun canal IBC n'existe sur le mainnet (le testnet dispose d'un unique canal de transfert ICS-20 vers une chaîne de test, ouvert pour tester l'IBC, et d'aucun vers les contreparties prévues). Il est conçu autour de 37 configurations de chaînes et jusqu'à 8 contreparties IBC ; considérez ces objectifs comme une intention de conception. Voir [Architecture du bridge](/architecture/bridge-architecture).

### Comment connecter un portefeuille ?

Utilisez le portefeuille officiel [QoreX](/qorex/overview), ou ajoutez un réseau QoreChain à un portefeuille EVM en utilisant les EVM chain IDs (9801 pour le mainnet, 9800 pour le testnet). Voir [Configuration du portefeuille](/getting-started/wallet-setup).

### Comment obtenir des jetons de testnet ?

Utilisez le faucet de testnet sur le tableau de bord. Voir [Faucet du tableau de bord](/dashboard/faucet) et [Se connecter au testnet](/getting-started/connecting-to-testnet).

### Que sont fUSD, fETH et fBTC ?

Des jetons de test réservés au testnet (FestUSD, FestETH et FestBTC, avec 6, 18 et 8 décimales), créés pour le builder fest. Ils n'ont aucune valeur, n'existent pas sur le mainnet et sont détenus sous forme de bank coins avec les dénominations sensibles à la casse `erc20:<contract address>`. Le faucet du testnet peut les envoyer avec une réclamation de QOR. Voir [Jetons de test Fest](/dashboard/faucet#fest-tokens).

### Comment exécuter un nœud, un validateur ou un nœud léger ?

Pour un nœud complet, voir [Exécuter un nœud](/developer-guide/running-a-node). Pour un validateur, voir [Exécuter un validateur](/developer-guide/running-a-validator). Pour un nœud léger, voir [Nœud léger](/light-node/overview) ; l'enregistrement au programme de récompenses des nœuds légers est ouvert et soumis à licence, et le 27 octobre 2026 un nœud léger était enregistré sur chaque réseau ([statut](/light-node/overview#reward-program-status)).

### Quel schéma de signature QoreChain utilise-t-il ?

QoreChain utilise un schéma hybride post-quantique combinant le **secp256k1 (ECDSA)** classique avec le **ML-DSA-87 (Dilithium-5)** post-quantique. Ce schéma hybride est requis par défaut sur le chemin de transaction Cosmos, le mode d'application étant contrôlé par la gouvernance. Sur la lane EVM, la signature reste secp256k1, et un compte doit en outre détenir une clé ML-DSA enregistrée et une fenêtre d'autorisation ouverte (depuis v3.2.0). Un compte n'est protégé de façon post-quantique qu'après avoir enregistré sa clé ML-DSA-87 ; cette première inscription est signée avec la seule clé classique (l'amorçage documenté), enregistrez-la donc avant que le compte ne détienne des fonds significatifs. Voir [Sécurité post-quantique](/architecture/post-quantum-security).

### Pourquoi ma transaction EVM est-elle refusée avec « no open EVM authorisation window » ?

Depuis la v3.2.0, la lane EVM n'admet une transaction que si elle provient d'un compte disposant d'une clé post-quantique enregistrée et d'une fenêtre d'autorisation ouverte. Ouvrez une fenêtre avec une transaction de la lane Cosmos portant une signature hybride ML-DSA-87 (FIPS 204), puis réessayez. Voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window).

### Combien de validateurs le mainnet compte-t-il ?

Huit validateurs bonded le 27 octobre 2026, avec environ 60,3 millions de QOR bonded (l'ensemble actif peut en contenir jusqu'à 100). Le testnet en compte quatre. Consultez l'ensemble en direct à `GET /cosmos/staking/v1beta1/validators` sur `https://api.qore.host`.

### Quel temps de bloc dois-je attendre ?

Environ 3,1 secondes sur le mainnet et environ 1,3 seconde sur le testnet (moyennes mesurées, 27 octobre 2026). Le temps de bloc est défini par la configuration des nœuds des validateurs.

### xQORE est-il disponible ?

Pas encore. Le module de comptabilité existe, mais les transactions de verrouillage et de déverrouillage ne sont pas câblées sur les réseaux en production. Voir [Tokenomics](/architecture/tokenomics#x-xqore).

### L'offre de QOR est-elle fixe ?

L'offre à la genèse était de 4 420 000 000 QOR. L'émission de staking est frappée sous un plafond cumulatif strict de 590 000 000 QOR (86 000 QOR par époque depuis la proposition de gouvernance 10, octobre 2026), et les burns retirent définitivement des tokens. Voir [Tokenomics](/architecture/tokenomics#supply-and-emission).

### Comment construire un rollup ?

Utilisez le Rollup Development Kit de QoreChain. Voir [Rollups](/rollups/overview) et la référence d'architecture [Rollup Development Kit](/architecture/rollup-development-kit).

### Comment construire une dApp ?

Utilisez le [QoreChain SDK](/sdk/overview), le SDK public pour construire des applications sur QoreChain à travers ses environnements d'exécution EVM, SVM et QoreChain Native.

### Où puis-je poser des questions ?

Le bot communautaire QCAIA répond aux questions sur Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) et Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Voir [Bot communautaire QCAIA](/qcaia/overview).

### Existe-t-il un second RPC EVM pour le testnet, exploité de façon indépendante ? {#testnet-second-evm-rpc}

Pas aujourd'hui. `https://evm-testnet.qore.host` est le seul JSON-RPC EVM public pour `qorechain-diana`, et les points d'accès publics du testnet sont exploités par l'équipe QoreChain. Les comparer entre eux vérifie des interfaces différentes, pas des opérateurs indépendants.

Pour une vérification réellement indépendante, exécutez votre propre nœud testnet avec le JSON-RPC activé et interrogez-le directement. [Connexion au testnet](/getting-started/connecting-to-testnet) fournit le binaire, le genesis, les pairs et le state-sync. Utilisez le state-sync : le sentry public ne conserve que les blocs récents.

Pour des recoupements rapides, vous pouvez utiliser le RPC de consensus `https://rpc-testnet.qore.host` (blocs, transactions par hash), le REST `https://api-testnet.qore.host` (comptes, soldes, état des modules), le WebSocket EVM `wss://evm-ws-testnet.qore.host` et l'explorateur à l'adresse [explore.qore.network](https://explore.qore.network), basculé sur Testnet.

### Que se passe-t-il si j'ouvre une nouvelle fenêtre EVM alors qu'une autre est encore active ? {#new-evm-window}

La nouvelle fenêtre remplace la fenêtre active, vous n'avez donc pas besoin de fermer l'ancienne au préalable. Un compte n'a qu'une fenêtre à la fois.

La nouvelle fenêtre démarre avec `usedTxs` et `usedValue` à zéro. Son expiration, `maxTxs` et `maxValue` proviennent uniquement du nouveau message. Rien n'est repris de l'ancienne fenêtre.

La portée est elle aussi remplacée en entier. Si le nouveau message liste des `allowed_targets`, la fenêtre n'autorise que les transactions vers ces adresses et refuse la création de contrats : terminez donc vos déploiements avant d'ouvrir une telle fenêtre. Si le nouveau message n'a pas de liste, la nouvelle fenêtre n'en a pas, même si l'ancienne en avait une. Après la diffusion, vérifiez le résultat avec la requête de la fenêtre EVM ou dans l'événement `pqc_evm_window_opened`. Voir [Référence de la fenêtre d'autorisation EVM](/developer-guide/evm-window-reference).

### Comment faire stocker mon contrat CosmWasm et l'autoriser pour les appels inter-VM sur le testnet ? {#testnet-cosmwasm-allowlist}

Sur le testnet, l'envoi de code CosmWasm passe par la gouvernance. Soumettez une proposition qui ouvre l'envoi de code, stocke votre code et referme l'envoi, sous la même forme que des propositions antérieures adoptées (par exemple la 27 et la 50). Publiez le code source, un build reproductible et le sha256 du fichier wasm pour que d'autres puissent le vérifier. Une proposition ordinaire exige un dépôt de 10 QOR et comporte un vote de 4 heures. Une proposition accélérée exige 50 QOR, comporte un vote de 1 heure et demande une part plus élevée de votes favorables.

Une fois le code stocké et votre contrat instancié, une seconde proposition l'ajoute à la liste d'autorisation inter-VM (`bridge_allowed_targets`, avec un épinglage dans `bridge_target_pins`), comme l'a fait la proposition 40. Un contrat dont l'admin n'est pas la gouvernance doit être épinglé. Cette proposition remplace tous les paramètres du module : copiez donc les valeurs actuelles depuis `https://api-testnet.qore.host/qorechain/crossvm/v1/params` et ajoutez votre entrée. Le contrat doit déjà exister au moment où la proposition s'exécute.

Publiez le numéro de la proposition dans le canal des builders du fest lorsque vous la soumettez, afin que les validateurs du testnet puissent l'examiner et voter avant la fin du vote. Les étapes complètes, avec les fichiers et les commandes exacts, se trouvent dans [Propositions de gouvernance pour les contrats](/developer-guide/governance-proposals-contracts).

## Voir aussi

* [Réseaux](/appendix/networks) — référence des chain IDs, ports et points de terminaison.
* [Qu'est-ce que QoreChain](/introduction/what-is-qorechain) — vue d'ensemble de la plateforme.
* [Bot communautaire QCAIA](/qcaia/overview) — posez vos questions sur Discord et Telegram.
