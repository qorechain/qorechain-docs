---
slug: /dashboard/contract-auditor
title: Contract Auditor
sidebar_label: Contract Auditor
sidebar_position: 7
---

# Contract Auditor

Le **Contract Auditor** réalise une analyse de sécurité assistée par IA d'un contrat intelligent, propulsée par **QCAI**. Soumettez un contrat et QCAI l'examine pour détecter les vulnérabilités, attribue un niveau de risque global et un score de sécurité, et explique chaque constatation avec un correctif recommandé. Comme le [Smart Contract Creator](/dashboard/smart-contract-creator), l'Auditor fonctionne sur **17 blockchains** pour l'outillage IA.

## Lancer un audit

1. Ouvrez l'**Auditor** et fournissez le contrat que vous souhaitez analyser.
2. Démarrez l'audit. QCAI examine le contrat et produit un rapport.

## Lire le rapport

Un rapport d'audit s'ouvre sur sa propre page et comprend :

- **Niveau de risque** — une évaluation globale (par exemple critique, élevé, moyen ou faible), codée par couleur pour une lecture rapide.
- **Score de sécurité** — un score global de 0 à 100.
- **Répartition par gravité** — combien de constatations relèvent de chaque gravité (critique, élevée, moyenne, faible et informative).
- **Résumé** — un bref aperçu de la posture de sécurité du contrat.

### Constatations

Chaque constatation indique sa gravité, un titre, l'emplacement dans le code auquel elle se réfère, une description du problème et un correctif recommandé. Lorsqu'un contrat ne présente aucun problème à un niveau donné, le rapport l'indique.

Le cas échéant, le rapport inclut également des sections pour les recommandations générales, les optimisations de gas, les bonnes pratiques et les aspects positifs que le contrat respecte déjà.

## Consulter les audits passés

La liste des audits affiche vos rapports précédents dans un tableau avec le nom du contrat, la blockchain, le niveau de risque, le score de sécurité et la date de création de chacun. Une zone de recherche filtre par nom de contrat ou par blockchain. Sélectionnez une ligne pour rouvrir le rapport complet, et utilisez le lien de la page du rapport pour le partager.

:::tip Auditer avant de déployer
Lancez un audit comme dernière étape avant le déploiement, et relancez-le après toute modification. Considérez les constatations comme des indications à vérifier, et non comme une garantie automatique — combinez le rapport avec vos propres tests sur le [testnet](/getting-started/connecting-to-testnet).
:::

## Voir aussi

- [Smart Contract Creator](/dashboard/smart-contract-creator) — générer des contrats avec QCAI.
- [Sécurité post-quantique](/architecture/post-quantum-security) — comment QoreChain sécurise les comptes et les signatures.
