---
slug: /light-node/overview
title: Vue d'ensemble du nœud léger
sidebar_label: Vue d'ensemble
sidebar_position: 1
---

# Vue d'ensemble du nœud léger

Le **nœud léger QoreChain** est un client léger qui suit le réseau QoreChain sans exécuter un validateur complet ni un nœud d'archive. Au lieu de rejouer chaque transaction, il vérifie cryptographiquement les en-têtes de blocs, suit les délégations et les récompenses, et diffuse en direct la télémétrie du réseau — le tout à partir d'un petit binaire autonome.

Exécuter un nœud léger vous permet de participer à l'économie du réseau et d'observer son état sans le stockage, la bande passante et le coût opérationnel d'un nœud complet.

## Sa propre ligne de version

Le nœud léger est livré sur sa **propre ligne de version — actuellement v3.1.1** — qui est **distincte de la version de publication de la chaîne** (la chaîne suit une piste `v3.x` distincte). La ligne v3.1.1 du nœud léger est alignée sur `qorechain-core` : elle ajoute une suite de régression de cryptographie post-quantique (PQC) (génération de clés, signature, vérification et détection de falsification) qui protège le comportement de vérification de signature du cœur et l'exécute en intégration continue.

Lorsque vous lisez la documentation ou les notes de version, considérez la version du nœud léger (v3.1.1) et la version de la chaîne comme deux numéros distincts qui se trouvent partager une série majeure.

## Pourquoi exécuter un nœud léger

- **Gagnez une part des récompenses de blocs.** Les nœuds légers actifs et enregistrés sont éligibles à la **part de récompense de 3 % des nœuds légers** décrite ci-dessous.
- **Vérifiez la chaîne par vous-même.** Le nœud effectue la vérification des en-têtes avec un client léger à saut, vous obtenez donc une assurance cryptographique de l'état de la chaîne sans faire confiance à une API distante.
- **Déléguez et auto-composez.** Gérez la mise déléguée sur plusieurs validateurs, répartie par poids, et composez automatiquement les récompenses.
- **Surveillez le réseau en direct.** La télémétrie en temps réel couvre les validateurs, le consensus, le pont et la tokenomics.
- **Post-quantique dès le premier jour.** Les clés et les signatures utilisent Dilithium-5 (ML-DSA-87).

## Deux éditions : SX et UX

Le nœud léger est proposé en deux éditions construites à partir de la même base de code. Choisissez celle qui correspond à la manière dont vous souhaitez exploiter le nœud.

| Édition | Binaire | Conçu pour | Interface |
| --- | --- | --- | --- |
| **SX — Server eXperience** | `lightnode-sx` | Déploiements serveur sans interface | CLI complète (commandes daemon + gestion) |
| **UX — User eXperience** | `lightnode-ux` | Usage bureau et opérateur | Tableau de bord web intégré |

- L'**édition SX** est un daemon sans interface doté d'une CLI de gestion complète. C'est le bon choix pour les serveurs, l'automatisation et les opérateurs qui vivent en ligne de commande. Voir [Édition SX](/light-node/sx-edition).
- L'**édition UX** exécute le même daemon mais ajoute un tableau de bord web intégré pour que vous puissiez surveiller la télémétrie, les délégations et les récompenses dans un navigateur. Voir [Édition UX](/light-node/ux-edition).

Les deux éditions lisent le même `config.toml`, stockent les données dans le même répertoire personnel (`~/.qorechain-lightnode` par défaut) et utilisent le même trousseau de clés Dilithium-5.

## La part de récompense de 3 % des nœuds légers

La distribution des frais de QoreChain alloue une **part fixe de 3 % aux nœuds légers** pour la fourniture de données réseau. Elle est appliquée on-chain dans le cadre de la répartition des récompenses du protocole et constitue le même canal documenté dans l'économie du projet — voir [Tokenomics](/architecture/tokenomics) pour la répartition complète 37 % / 30 % / 20 % / 10 % / 3 % (validateurs, brûlés, trésorerie, stakers, nœuds légers).

Pour être éligible à cette part, un nœud léger doit être **enregistré on-chain et prouver activement sa vivacité** via des preuves de battement de cœur (heartbeat). L'enregistrement et la licence sont traités dans [Enregistrement et licence](/light-node/registration-and-licensing) ; la manière dont la part est gagnée, composée et surveillée est traitée dans [Récompenses et surveillance](/light-node/rewards-and-monitoring).

## Fonctionnalités principales en un coup d'œil

- **Client léger à saut** — vérifie les en-têtes sans télécharger les blocs complets, se synchronisant rapidement même depuis un démarrage à froid.
- **Staking délégué** — misez sur plusieurs validateurs avec des poids de répartition configurables.
- **Récompenses à auto-composition** — réclamez et re-déléguez les récompenses selon un intervalle configurable.
- **Rééquilibrage tenant compte de la réputation** — déplacez automatiquement la délégation vers les validateurs à plus haute réputation.
- **Télémétrie en temps réel** — validateurs, consensus, pont et tokenomics, rafraîchis selon des intervalles indépendants.
- **Enregistrement on-chain** — avec des preuves de vivacité par battement de cœur qui maintiennent le nœud éligible aux récompenses.
- **Cryptographie post-quantique** — clés et signatures Dilithium-5 (ML-DSA-87) partout.
- **Mode local uniquement** — exercez la pile PQC complète et exécutez le nœud de manière autonome avant de le pointer vers une chaîne en service.

Le nœud léger est publié sous la licence **Apache 2.0**.

## Où aller ensuite

- [Édition SX](/light-node/sx-edition) — installez, configurez et exécutez le daemon serveur.
- [Édition UX](/light-node/ux-edition) — exécutez l'édition à tableau de bord web.
- [Enregistrement et licence](/light-node/registration-and-licensing) — enregistrez-vous on-chain et obtenez une licence.
- [Récompenses et surveillance](/light-node/rewards-and-monitoring) — gagnez la part de 3 % et maintenez le nœud en bonne santé.
- [Édition SX](/light-node/sx-edition) et [Édition UX](/light-node/ux-edition) sont les deux façons d'exécuter un nœud léger.
- [Tokenomics](/architecture/tokenomics) — comment la part de récompense des nœuds légers s'inscrit dans l'économie plus large.
