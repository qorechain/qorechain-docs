---
slug: /appendix/faq
title: FAQ
sidebar_label: FAQ
sidebar_position: 5
---

# Foire aux questions

Questions générales sur QoreChain, répondues à partir de la documentation. Chaque réponse renvoie vers la page de référence pour le détail complet. Pour les questions spécifiques au SDK, consultez la [FAQ du SDK](/sdk/faq).

### Le mainnet est-il en ligne ?

Oui. Le mainnet de QoreChain (chaîne `qorechain-vladi`, EVM chain ID 9801) est en ligne depuis le 7 juin 2026. Voir [Réseaux](/appendix/networks) et [Se connecter au mainnet](/getting-started/connecting-to-mainnet).

### Quels sont les chain IDs et les EVM chain IDs ?

Le mainnet est la chaîne Cosmos `qorechain-vladi` avec l'EVM chain ID **9801** (hex `0x2649`) ; le testnet est `qorechain-diana` avec l'EVM chain ID **9800** (hex `0x2648`). Voir [Réseaux](/appendix/networks) pour le tableau complet.

### Comment les frais de transaction sont-ils distribués ?

Les frais collectés sont répartis à hauteur de **37 % aux validateurs, 30 % brûlés, 20 % à la trésorerie communautaire, 10 % aux stakers et 3 % aux nœuds légers**. Voir [Tokenomics](/architecture/tokenomics).

### Qu'est-ce que PRISM ?

PRISM est la couche d'optimisation par apprentissage par renforcement intégrée au moteur de consensus de QoreChain. Elle observe les métriques du réseau et propose des ajustements déterministes des paramètres de consensus sous des contrôles de sécurité de type disjoncteur. Voir [Moteur de consensus PRISM](/architecture/prism-consensus-engine).

### Le bridge inter-chaînes est-il en ligne ?

Le bridge inter-chaînes est actuellement en testnet et en attente — il ne s'agit pas encore d'un système en production. Il est conçu autour de 37 configurations de chaînes QCB et 8 canaux IBC ; considérez ces objectifs comme une intention de conception plutôt que comme des garanties en mainnet. Voir [Architecture du bridge](/architecture/bridge-architecture).

### Comment connecter un portefeuille ?

Configurez un portefeuille et ajoutez un réseau QoreChain en utilisant les EVM chain IDs (9801 pour le mainnet, 9800 pour le testnet). Voir [Configuration du portefeuille](/getting-started/wallet-setup).

### Comment obtenir des jetons de testnet ?

Utilisez le faucet de testnet sur le tableau de bord. Voir [Faucet du tableau de bord](/dashboard/faucet) et [Se connecter au testnet](/getting-started/connecting-to-testnet).

### Comment exécuter un nœud, un validateur ou un nœud léger ?

Pour un nœud complet, voir [Exécuter un nœud](/developer-guide/running-a-node). Pour un validateur, voir [Exécuter un validateur](/developer-guide/running-a-validator). Pour un nœud léger, voir [Nœud léger](/light-node/overview).

### Quel schéma de signature QoreChain utilise-t-il ?

QoreChain utilise un schéma hybride post-quantique combinant le **secp256k1 (ECDSA)** classique avec le **ML-DSA-87 (Dilithium-5)** post-quantique. Ce schéma hybride est requis par défaut sur le chemin de transaction Cosmos, le mode d'application étant contrôlé par la gouvernance. Voir [Sécurité post-quantique](/architecture/post-quantum-security).

### Comment construire un rollup ?

Utilisez le Rollup Development Kit de QoreChain. Voir [Rollups](/rollups/overview) et la référence d'architecture [Rollup Development Kit](/architecture/rollup-development-kit).

### Comment construire une dApp ?

Utilisez le [QoreChain SDK](/sdk/overview), le SDK public pour construire des applications sur QoreChain à travers ses environnements d'exécution EVM, SVM et CosmWasm.

### Où puis-je poser des questions ?

Le bot communautaire QCAIA répond aux questions sur Discord ([discord.gg/qorechain](https://discord.gg/qorechain)) et Telegram ([t.me/QoreChainCommunity](https://t.me/QoreChainCommunity)). Voir [Bot communautaire QCAIA](/qcaia/overview).

## Voir aussi

* [Réseaux](/appendix/networks) — référence des chain IDs, ports et points de terminaison.
* [Qu'est-ce que QoreChain](/introduction/what-is-qorechain) — vue d'ensemble de la plateforme.
* [Bot communautaire QCAIA](/qcaia/overview) — posez vos questions sur Discord et Telegram.
