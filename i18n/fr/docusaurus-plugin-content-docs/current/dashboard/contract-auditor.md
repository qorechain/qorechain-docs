---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

Le **Contract Auditor** (barre latérale **Build**, entrée **AI Audit**) réalise une analyse de sécurité du code source d'un contrat collé dans la page avec **QCAIA**, l'assistant IA de QoreChain, et renvoie un score, un niveau de risque et des constatations accompagnées de correctifs recommandés. Il s'adresse aux développeurs qui veulent un second regard rapide sur un contrat avant de le tester et de le déployer. Ce n'est pas un audit formel et il ne remplace pas une revue humaine.

## Innovations {#innovations}

- **Détection automatique de la blockchain.** « Auto-detect from code » est le choix par défaut ; vous pouvez à la place choisir l'un des 17 écosystèmes.
- **Un pourcentage distinct de préparation au post-quantique** à côté du Security Score de 0 à 100, présenté séparément afin de ne pas être fondu dans le score de sécurité.
- **Un audit gratuit chaque jour UTC.** Le premier audit de chaque jour UTC est gratuit. Ensuite, sur le testnet, chaque audit est payé en QOR de test après une boîte de dialogue « Confirm Security Audit » qui affiche l'« Audit Cost » ; sur le mainnet, les audits suivants attendent le jour UTC suivant.
- **Rapports privés par défaut.** Le propriétaire change la visibilité ; un rapport public n'affiche jamais le nom ni l'IP du propriétaire.
- **Des constatations avec correctifs, pas seulement des étiquettes.** Chaque constatation comporte une gravité, un emplacement, une description et un correctif recommandé, et le rapport complet ajoute des recommandations, des optimisations de gas, des bonnes pratiques et des aspects positifs.

## Comment l'utiliser {#how-to-use}

### Lancer un audit

1. Connectez-vous (obligatoire) et ouvrez **AI Audit**.
2. Renseignez **Blockchain** (par défaut « Auto-detect from code »), **Name (Optional)** et **Contract Source Code**.
3. Sélectionnez **Run Security Audit**, puis confirmez la boîte de dialogue « Confirm Security Audit ».
4. Le **Security Report** s'affiche directement sur la même page. **Export PDF** l'enregistre.

**Exemple minimal :** collez un ERC-20, gardez la détection automatique, **Run Security Audit**, Confirm, **Export PDF**.

### Lire le rapport

Le rapport affiché sur la page montre :

- le **Risk Level**, codé par couleur ;
- le **Security Score** de 0 à 100, et le pourcentage de préparation au post-quantique ;
- un **Executive Summary** ;
- **Vulnerabilities Found (N Issues)**, avec les gravités Critical, High, Medium, Low et Info. Un résultat sans problème indique « No vulnerabilities detected ».

Chaque constatation indique sa gravité, son titre, l'emplacement dans le code, une description et un correctif recommandé.

La page du rapport complet `/audits/<id>` ajoute la répartition par gravité, les **Recommendations**, les **Gas optimizations**, les **Best practices**, les **Positive aspects** et, pour le propriétaire, l'interrupteur de visibilité.

### Audits passés et partage

- Vos propres rapports se trouvent sous **Profile > Audited**.
- La liste **All Security Audits** à l'adresse `/audits` (liée depuis la page d'accueil) affiche les derniers audits dont les propriétaires ont choisi la visibilité publique, dans un tableau avec le nom du contrat, la blockchain, le niveau de risque, le score et la date. Une zone de recherche filtre par nom, blockchain ou niveau de risque. Les rapports privés n'y apparaissent jamais ; il en va de même pour la liste des derniers audits de la page d'accueil.
- Sur un rapport qui vous appartient, un interrupteur en haut indique « This report is private ». Activez-le pour rendre le rapport public afin que toute personne disposant du lien puisse le lire (votre nom et votre IP ne sont jamais affichés), et désactivez-le pour le rendre de nouveau privé.

:::tip Auditer avant de déployer
Lancez un audit comme dernière étape avant le déploiement, et relancez-le après toute modification. Considérez les constatations comme des indications à vérifier, et non comme une garantie, et combinez le rapport avec vos propres tests sur le [testnet](/getting-started/connecting-to-testnet).
:::

## Comment y accéder {#how-to-access}

- **URL :** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit), ou **New Audit** sur la page d'accueil.
- **Compte :** la connexion est obligatoire pour lancer un audit. La liste `/audits` et les rapports publics à l'adresse `/audits/<id>` s'ouvrent sans compte.
- **Réseaux :** fonctionne sur les deux. La règle de l'audit gratuit quotidien est la même ; les audits supplémentaires payants n'existent que sur le testnet.
- **Coût :** le premier audit de chaque jour UTC est gratuit ; les audits supplémentaires du testnet coûtent des QOR de test ; ceux du mainnet attendent le jour suivant.

## Où il est publié {#where-published}

| Surface | Adresse | Compte |
| --- | --- | --- |
| Lancer un audit | `dashboard.qorechain.io/audit` | Connexion obligatoire |
| All Security Audits | `dashboard.qorechain.io/audits` | Aucun |
| Un rapport | `dashboard.qorechain.io/audits/<id>` | Aucun s'il est public ; propriétaire sinon |

## Limites et problèmes connus {#limits}

- Il n'examine que le source que vous collez, sans compilation, test ni analyse à l'exécution. Les constatations peuvent être incomplètes ou fausses.
- Un rapport privé ne peut être ouvert que par son propriétaire, même avec le lien.

## Voir aussi

- [Smart Contract Creator](/dashboard/smart-contract-creator) - générer des contrats avec QCAIA.
- [Sécurité post-quantique](/architecture/post-quantum-security) - comment QoreChain sécurise les comptes et les signatures.
