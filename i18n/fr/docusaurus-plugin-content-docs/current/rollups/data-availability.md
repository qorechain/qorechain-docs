---
slug: /rollups/data-availability
title: Disponibilité des données
sidebar_label: Disponibilité des données
sidebar_position: 4
---

# Disponibilité des données

La disponibilité des données (DA) est la garantie que les données de transaction qui sous-tendent l'état d'un rollup sont publiées quelque part où tout le monde peut les lire — de sorte que chacun puisse reconstruire et vérifier indépendamment l'état du rollup. Le RDK prend en charge trois backends DA.

| Backend | De quoi il s'agit |
| ------- | ---------- |
| **`native`** | Stockage de blobs on-chain au sein de QoreChain lui-même |
| **`celestia`** | Disponibilité des données via IBC vers Celestia, une couche DA modulaire dédiée |
| **`both`** | Native et Celestia ensemble, pour la redondance |

:::caution
Les backends de disponibilité des données font partie du RDK en évolution active. Considérez les notes de maturité ci-dessous comme une intention de conception et validez sur le testnet **`qorechain-diana`** avant de vous appuyer sur un backend en production.
:::

---

## DA native (stockage de blobs on-chain)

La DA native stocke les données de transaction des rollups sous forme de **blobs** directement sur QoreChain. Chaque blob est validé et adressable, de sorte que les données derrière un lot de règlement puissent être récupérées et vérifiées on-chain.

Concepts clés :

* **Blobs.** Les données de transaction des rollups sont publiées sous forme de blobs de disponibilité des données, chacun associé à un identifiant de rollup et à un index de blob.
* **Engagements.** Chaque blob porte un engagement (un hash des données du blob) afin qu'un blob puisse être vérifié par rapport à ce qui a été validé, sans avoir à faire confiance à celui qui le stocke.
* **Espaces de noms.** Les blobs peuvent porter un espace de noms spécifique au rollup, ce qui maintient les données de chaque rollup logiquement séparées au sein d'un stockage partagé.
* **Rétention et élagage.** Les blobs natifs sont conservés pendant une fenêtre bornée, puis élagués pour garder le stockage on-chain soutenable. Après l'élagage, les données brutes du blob sont supprimées tandis que les métadonnées d'engagement sont conservées, de sorte que l'engagement historique reste vérifiable même si les octets ne sont plus stockés on-chain.

La taille maximale exacte des blobs et la fenêtre de rétention sont régies par les paramètres du module en direct. Interrogez-les avant de concevoir autour d'une limite spécifique :

```bash
qorechaind query rdk config
```

La DA native est l'option la plus simple — elle garde tout à l'intérieur de QoreChain, héritant de la sécurité et de la cryptographie post-quantique de la chaîne hôte, au prix de la consommation du stockage de la chaîne hôte.

---

## DA Celestia (IBC vers Celestia)

Le backend `celestia` publie la disponibilité des données via IBC vers **Celestia**, un réseau DA modulaire dédié. Cela décharge le stockage des blobs de QoreChain vers une couche DA spécialement conçue, tout en ancrant le règlement sur QoreChain.

:::note
La DA Celestia est une intégration en cours de maturation. Dans la version actuelle, elle doit être considérée comme pas encore renforcée pour la production — validez le comportement sur le testnet, et préférez `native` ou `both` lorsque vous avez besoin d'une garantie réglée dès aujourd'hui.
:::

---

## Both (redondance)

Le backend `both` écrit à la fois sur **native et Celestia ensemble**, offrant une redondance entre un stockage on-chain et une couche DA modulaire externe. Choisissez `both` lorsque vous souhaitez la surface de disponibilité la plus large et que vous êtes prêt à payer pour stocker les données à deux endroits.

Comme le chemin Celestia est encore en cours de maturation, considérez `both` comme du native-avec-redondance-en-cours plutôt que comme une garantie que deux copies entièrement indépendantes sont réglées aujourd'hui. Confirmez le comportement actuel sur le testnet.

---

## Choisir un backend

| Si vous voulez... | Choisissez |
| -------------- | ------ |
| L'option la plus simple, entièrement on-chain, héritant de la sécurité de QoreChain | **`native`** |
| Décharger la DA vers une couche modulaire dédiée (en maturation) | **`celestia`** |
| Une surface de disponibilité maximale avec redondance (en maturation) | **`both`** |

Pour savoir comment la DA s'inscrit dans le contexte plus large du règlement, voir **[Présentation des rollups](/rollups/overview)**. Pour la référence du module de plus bas niveau, voir la page **[Rollup Development Kit](/architecture/rollup-development-kit)**.
