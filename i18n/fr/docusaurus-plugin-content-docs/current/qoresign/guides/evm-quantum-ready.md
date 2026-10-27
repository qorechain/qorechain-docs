---
slug: /qoresign/guides/evm-quantum-ready
title: "Portefeuilles EVM : fenêtre d'autorisation"
sidebar_label: Fenêtre d'autorisation EVM
sidebar_position: 3
---

# Portefeuilles EVM : fenêtre d'autorisation

Les transactions Ethereum n'ont aucun champ où une seconde signature pourrait
circuler, et le réseau applique son paramètre PQC à l'échelle de la chaîne plutôt
que par voie. Une transaction envoyée sur la voie EVM de QoreChain est donc signée
avec secp256k1 uniquement, et QoreSign ne propose pas de signature EVM hybride
(`assertHybridLane("evm")` lève `LANE_NOT_AVAILABLE`).

À la place, le réseau n'admet une transaction EVM que si son expéditeur possède
une clé ML-DSA-87 enregistrée et une **fenêtre d'autorisation EVM** active qui la
couvre. La fenêtre est ouverte depuis la voie native par une transaction signée
de façon hybride ; la clé post-quantique autorise ainsi l'activité EVM à l'avance.
La transaction EVM elle-même est signée avec secp256k1 uniquement. Les deux réseaux
publics appliquent cette règle (fonctionnalité de protocole `evm-pqc-authorisation-window`, lisible avec
`fetchProtocolFeatures` dans le [SDK QoreChain](/sdk/overview) ou à l'adresse
`/qorechain/pqc/v1/protocol_features`).

## Étapes pour un compte EVM {#steps}

1. Enregistrez une clé ML-DSA-87 pour le compte sur la voie native
   (`buildRegisterPqKeyMessage`, voir
   [Enregistrement](/qoresign/spec/hybrid-signing-v1#registration)). Pour un
   compte `eth_secp256k1`, les mêmes 20 octets d'adresse ont une forme `qor1` ;
   utilisez-la comme `sender`.
2. Ouvrez une fenêtre avec une transaction de la voie native signée de façon
   hybride : une hauteur d'expiration, un nombre maximal de transactions EVM, une
   valeur maximale et, éventuellement, les contrats qu'elle peut appeler. Le SDK
   QoreChain propose des composeurs pour les messages de fenêtre.
3. Envoyez des transactions EVM depuis n'importe quel portefeuille EIP-1193 tant
   que la fenêtre est ouverte. En dehors d'une fenêtre, ou au-delà de ses limites,
   le réseau les refuse ; la clé secp256k1 seule ne peut donc pas déplacer de
   valeur sur la voie EVM.

Lorsque le réseau ajoutera le PQC par voie pour la voie EVM, QoreSign ajoutera un
mode EVM hybride dans une nouvelle version mineure.

## MetaMask et autres portefeuilles EIP-1193 {#eip-1193-wallets}

MetaMask et les autres portefeuilles EIP-1193 ne peuvent pas ajouter de signature
ML-DSA-87 à `eth_sendTransaction` ; pour eux, la fenêtre, ouverte depuis un
portefeuille qui détient la clé ML-DSA-87, est la voie disponible.
