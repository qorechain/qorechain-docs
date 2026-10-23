---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Foire aux questions

Questions générales sur QoreChain, répondues à partir de la documentation. Chaque réponse renvoie vers la page de référence pour le détail complet. Pour les questions spécifiques au SDK, consultez la [FAQ du SDK](/sdk/faq).

### Le mainnet est-il en ligne ?

Oui. Le mainnet de QoreChain (chaîne `qorechain-vladi`, EVM chain ID 9801) est en ligne depuis le 7 juin 2026 et exécute la version v3.2.4 (appliquée à la hauteur 3 742 566 le 23 octobre 2026 par la proposition de gouvernance 13) ; le testnet, `qorechain-diana`, exécute la v3.2.4 depuis le 19 octobre 2026. Voir [Réseaux](/appendix/networks) et [Se connecter au mainnet](/getting-started/connecting-to-mainnet).

### Quels sont les chain IDs et les EVM chain IDs ?

Le mainnet est la chaîne Cosmos `qorechain-vladi` avec l'EVM chain ID **9801** (hex `0x2649`) ; le testnet est `qorechain-diana` avec l'EVM chain ID **9800** (hex `0x2648`). Voir [Réseaux](/appendix/networks) pour le tableau complet.

### Comment les frais de transaction sont-ils distribués ?

Les frais collectés sont répartis à hauteur de **37 % aux validateurs, 30 % brûlés, 20 % à la trésorerie communautaire, 10 % aux stakers et 3 % aux nœuds légers**. Cette répartition s'applique à tout ce qui se trouve dans le collecteur de frais, y compris l'émission d'époque. Voir [Tokenomics](/architecture/tokenomics#fee-distribution).

### Qu'est-ce que PRISM ?

PRISM est la couche d'optimisation par apprentissage par renforcement intégrée au moteur de consensus de QoreChain. Elle observe les métriques du réseau et propose des ajustements déterministes des paramètres de consensus sous des contrôles de sécurité de type disjoncteur. Aujourd'hui, elle fonctionne en mode observation : aucune politique entraînée n'est chargée, elle ne modifie donc aucun paramètre. Voir [Moteur de consensus PRISM](/architecture/prism-consensus-engine).

### Le bridge inter-chaînes est-il en ligne ?

Non. Le module de bridge est déployé, mais les 37 configurations de chaînes sont toutes en attente, aucun validateur de bridge n'est enregistré et aucun canal IBC n'existe sur l'un ou l'autre réseau. Il est conçu autour de 37 configurations de chaînes et jusqu'à 8 contreparties IBC ; considérez ces objectifs comme une intention de conception. Voir [Architecture du bridge](/architecture/bridge-architecture).

### Comment connecter un portefeuille ?

Utilisez le portefeuille officiel [QoreX](/qorex/overview), ou ajoutez un réseau QoreChain à un portefeuille EVM en utilisant les EVM chain IDs (9801 pour le mainnet, 9800 pour le testnet). Voir [Configuration du portefeuille](/getting-started/wallet-setup).

### Comment obtenir des jetons de testnet ?

Utilisez le faucet de testnet sur le tableau de bord. Voir [Faucet du tableau de bord](/dashboard/faucet) et [Se connecter au testnet](/getting-started/connecting-to-testnet).

### Comment exécuter un nœud, un validateur ou un nœud léger ?

Pour un nœud complet, voir [Exécuter un nœud](/developer-guide/running-a-node). Pour un validateur, voir [Exécuter un validateur](/developer-guide/running-a-validator). Pour un nœud léger, voir [Nœud léger](/light-node/overview) ; l'enregistrement au programme de récompenses des nœuds légers est ouvert et soumis à licence ([statut](/light-node/overview#reward-program-status)).

### Quel schéma de signature QoreChain utilise-t-il ?

QoreChain utilise un schéma hybride post-quantique combinant le **secp256k1 (ECDSA)** classique avec le **ML-DSA-87 (Dilithium-5)** post-quantique. Ce schéma hybride est requis par défaut sur le chemin de transaction Cosmos, le mode d'application étant contrôlé par la gouvernance. Sur la lane EVM, la signature reste secp256k1, et un compte doit en outre détenir une clé ML-DSA enregistrée et une fenêtre d'autorisation ouverte (depuis v3.2.0). Voir [Sécurité post-quantique](/architecture/post-quantum-security).

### Pourquoi ma transaction EVM est-elle refusée avec « no open EVM authorisation window » ?

Depuis la v3.2.0, la lane EVM n'admet une transaction que si elle provient d'un compte disposant d'une clé post-quantique enregistrée et d'une fenêtre d'autorisation ouverte. Ouvrez une fenêtre avec une transaction de la lane Cosmos signée en post-quantique, puis réessayez. Voir [Fenêtre d'autorisation EVM](/getting-started/first-transaction#evm-window).

### Combien de validateurs le mainnet compte-t-il ?

Huit validateurs bonded le 23 octobre 2026, avec environ 55,6 millions de QOR bonded (l'ensemble actif peut en contenir jusqu'à 100). Le testnet en compte trois. Consultez l'ensemble en direct à `GET /cosmos/staking/v1beta1/validators` sur `https://api.qore.host`.

### Quel temps de bloc dois-je attendre ?

Environ 3,2 secondes sur le mainnet et environ 1 seconde sur le testnet (moyennes mesurées, octobre 2026). Le temps de bloc est défini par la configuration des nœuds des validateurs.

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

## Voir aussi

* [Réseaux](/appendix/networks) — référence des chain IDs, ports et points de terminaison.
* [Qu'est-ce que QoreChain](/introduction/what-is-qorechain) — vue d'ensemble de la plateforme.
* [Bot communautaire QCAIA](/qcaia/overview) — posez vos questions sur Discord et Telegram.
