---
slug: /light-node/registration-and-licensing
title: Enregistrement et licences
sidebar_label: Enregistrement et licences
sidebar_position: 4
---

# Enregistrement et licences

Pour gagner la [part de récompense de 3 % réservée aux nœuds légers](/light-node/rewards-and-monitoring), un nœud léger doit être **enregistré on-chain** et doit continuer à prouver qu'il est actif. Cette page explique comment fonctionne l'enregistrement, comment le nœud prouve sa vivacité (liveness), et comment enregistrer un nœud et obtenir une licence via le Dashboard.

## Enregistrement on-chain

L'enregistrement inscrit votre nœud léger sur la chaîne afin que le protocole sache qu'il existe, de quel type il est (`sx` ou `ux`) et quelle clé d'opérateur le contrôle. Une fois enregistré et actif, le nœud devient éligible à la part de récompense des nœuds légers.

### Générer la commande d'enregistrement

L'édition SX peut afficher la commande exacte à exécuter sur la chaîne pour enregistrer ce nœud. Exécutez :

```bash
lightnode-sx register
```

Cette commande lit votre clé d'opérateur depuis le keyring et affiche une transaction `qorechaind` prête à l'emploi, accompagnée de votre adresse d'opérateur, du type de nœud et de la version. La commande accepte deux options facultatives :

- `--type` — le type de nœud, `sx` ou `ux` (par défaut `sx`).
- `--version` — la version du nœud à enregistrer (par défaut, la version du binaire lui-même).

La commande affichée enregistre le nœud sous le module `x/lightnode` on-chain. Soumettez-la avec un compte d'opérateur approvisionné sur le réseau que vous rejoignez (testnet `qorechain-diana` ou mainnet `qorechain-vladi`).

:::note
`lightnode-sx register` **affiche** la transaction d'enregistrement pour que vous l'examiniez et la soumettiez — elle ne la diffuse pas d'elle-même. Vous gardez ainsi le contrôle sur le moment et la manière dont le nœud est enregistré.
:::

## Preuves de vivacité par heartbeat

L'enregistrement seul ne suffit pas pour rester éligible. Un nœud léger enregistré doit prouver en continu qu'il est en ligne en soumettant des **preuves de vivacité par heartbeat**. Ces heartbeats sont la manière dont la chaîne distingue les nœuds actifs — éligibles à la part de récompense — des nœuds enregistrés mais hors ligne.

En pratique, cela signifie qu'un nœud enregistré et maintenu en fonctionnement (et synchronisé) conserve son éligibilité, tandis qu'un nœud qui passe hors ligne cesse de prouver sa vivacité et perd son éligibilité jusqu'à son retour. Maintenir le démon en fonctionnement et en bonne santé fait donc partie intégrante de la perception des récompenses — voir [Récompenses et supervision](/light-node/rewards-and-monitoring) pour savoir comment surveiller la santé du heartbeat et de la synchronisation.

### Pipeline de heartbeat co-signé PQC {#pqc-cosigned-heartbeat-pipeline}

QoreChain est **PQC par défaut (obligatoire)**, de sorte que la transaction de vivacité par heartbeat est produite via un pipeline post-quantique co-signé plutôt que par une signature purement classique. Le démon construit le heartbeat non signé, puis le co-signe avec une signature **hybride Dilithium-5 (ML-DSA-87)** avant diffusion — la même posture post-quantique que la chaîne impose à chaque transaction. Le nœud soumet un heartbeat par fenêtre `interval_blocks` (correspondant au paramètre `heartbeat_interval` de la chaîne), en se cadençant sur la hauteur de bloc pour éviter les rejets de soumission anticipée.

Les heartbeats on-chain sont en opt-in dans le démon : activez la section `[heartbeat]` dans la configuration du nœud (`enabled = true`) et pointez `qorechaind_path` vers un binaire `qorechaind`, qui exécute le flux génération-puis-co-signature. Lorsque ceci n'est pas configuré, le nœud fonctionne sans soumettre de heartbeats on-chain et l'opérateur peut soumettre la vivacité manuellement à l'aide des commandes de chaîne affichées.

## Enregistrement et licences via le Dashboard

Vous pouvez également enregistrer un nœud et obtenir une licence via le Dashboard QoreChain, qui propose un parcours guidé au lieu de construire les commandes de chaîne à la main.

- Enregistrez votre nœud depuis **Tools → Node Registration**.
- Obtenez ou renouvelez une licence depuis **Tools → Buy License**.

Le parcours du Dashboard vous guide pour associer votre clé d'opérateur, choisir le type de nœud et le réseau, et finaliser l'enregistrement on-chain. Utilisez-le si vous préférez une interface graphique à la CLI, ou pour gérer les licences en même temps que l'enregistrement au même endroit.

## Pour aller plus loin

- [Récompenses et supervision](/light-node/rewards-and-monitoring) — comment la part de 3 % est gagnée, capitalisée et supervisée.
- [Édition SX](/light-node/sx-edition) — la commande `register` et la référence CLI complète.
