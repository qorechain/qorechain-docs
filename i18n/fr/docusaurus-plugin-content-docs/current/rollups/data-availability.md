---
slug: /rollups/data-availability
title: Disponibilité des données
sidebar_label: Disponibilité des données
sidebar_position: 4
---

# Disponibilité des données

La disponibilité des données (DA) est la garantie que les données de transaction qui sous-tendent l'état d'un rollup sont publiées quelque part où tout le monde peut les lire — de sorte que chacun puisse reconstruire et vérifier indépendamment l'état du rollup. Le RDK définit trois backends DA ; aujourd'hui, seul `native` est implémenté.

| Backend | De quoi il s'agit | Statut |
| ------- | ---------- | ------ |
| **`native`** | Stockage de blobs on-chain au sein de QoreChain lui-même | Implémenté dans le module ; pas encore de moyen public de publier un blob (voir ci-dessous) |
| **`celestia`** | Disponibilité des données via IBC vers Celestia, une couche DA modulaire dédiée | Non implémenté |
| **`both`** | Native et Celestia ensemble, pour la redondance | Se comporte exactement comme `native` aujourd'hui |

:::caution Capacité à un stade précoce
Aucun rollup n'a encore été créé sur l'un ou l'autre réseau (vérifié le 27 octobre 2026), et les backends DA ne sont que partiellement implémentés. Le statut de chaque backend est indiqué ci-dessous ; validez sur le testnet **`qorechain-diana`** avant de vous appuyer sur l'un d'entre eux.
:::

---

## DA native (stockage de blobs on-chain)

La DA native est le stockage de blobs on-chain à l'intérieur de `x/rdk` : chaque blob est identifié par l'ID du rollup et l'index du blob, porte un **engagement SHAKE-256** de ses octets, et est élagué après la fenêtre de rétention tandis que son engagement est conservé.

:::caution Pas encore de moyen public de publier un blob
Le module définit le stockage, la rétention et l'élagage des blobs, mais il n'existe **aucun message de transaction pour publier un blob** dans les versions actuelles (mainnet v3.2.4 et testnet v3.2.6 ; les messages du module sont vérifiés dans le code source de la chaîne). La chaîne n'accepte un `data_hash` non vide sur un rollup `native` ou `both` que si un blob correspondant est stocké on-chain, et rien ne permet d'en stocker un. Un lot de règlement sur un tel rollup **doit donc laisser `data_hash` vide** : un lot qui nomme un hash de données est refusé comme données indisponibles, après le paiement des frais de transaction.

Le RDK applique cette règle à partir de la **0.6.1** (et la 0.6.2 et la 0.7.0 aussi) : `SubmitBatchInput.dataHash` est facultatif (omis signifie vide), les six modèles de départ le laissent vide, `dataHashError` (`data_hash_error`, `DataHashError`, `Rules.dataHashError`) expose la règle dans les cinq langages, et `RdkTxClient.submitBatch` refuse un tel lot avant la diffusion lorsqu'il peut lire le rollup (un client hybride avec un point de terminaison REST). Les versions antérieures des modèles mettaient un hash de données sur leurs lots, que la chaîne refusait.
:::

Concepts clés :

* **Blobs.** Un blob est associé à un identifiant de rollup et à un index de blob.
* **Engagements.** Chaque blob porte un engagement SHAKE-256 de 32 octets de ses données, de sorte qu'un blob puisse être vérifié par rapport à ce qui a été validé, sans avoir à faire confiance à celui qui le stocke. (L'assistant TypeScript `buildDaBlob()` calculait un hash SHA-256 dans la 0.6.2 et les versions antérieures, de sorte que son `dataHash` ne correspondait pas à l'engagement de la chaîne ; à partir de la 0.7.0, son engagement est le SHAKE-256 de la chaîne. Comme aucune transaction ne publie de blob, vous ne devriez toujours pas envoyer de hash de données dans un lot sur un rollup `native` ou `both`.)
* **Espaces de noms.** Les blobs peuvent porter un espace de noms spécifique au rollup, ce qui maintient les données de chaque rollup logiquement séparées au sein d'un stockage partagé.
* **Rétention et élagage.** Les blobs natifs sont conservés pendant `blob_retention_blocks` (432 000 blocs — environ 16 jours avec le temps de bloc actuel du mainnet d'environ 3,1 s ; ce chiffre évolue avec le temps de bloc), puis élagués pour garder le stockage on-chain soutenable. Après l'élagage, les données brutes du blob sont supprimées tandis que les métadonnées d'engagement sont conservées, de sorte que l'engagement historique reste vérifiable même si les octets ne sont plus stockés on-chain.

La taille maximale des blobs et la fenêtre de rétention sont régies par les paramètres du module en direct. Interrogez-les avant de concevoir autour d'une limite spécifique :

```bash
qorechaind query rdk config
```

Les métadonnées d'un blob (pas ses octets) sont lisibles via REST à l'adresse `/qorechain/rdk/v1/blob/{rollup_id}/{blob_index}`, que les deux réseaux servent ; elles incluent `expires_at_height`.

---

## DA Celestia (IBC vers Celestia)

La DA Celestia **n'est pas implémentée**. Un rollup dont le backend DA est `celestia` ne peut pas publier de données (le module renvoie une erreur). La conception prévue publie la disponibilité des données via IBC vers **Celestia**, un réseau DA modulaire dédié, tout en ancrant le règlement sur QoreChain ; aucun canal IBC n'est ouvert sur le mainnet, et l'unique canal ouvert sur le testnet (vérifié le 27 octobre 2026) est un canal de transfert de tokens (`ics20-1`), et non un canal de disponibilité des données (voir [Architecture du pont](/architecture/bridge-architecture)). Utilisez `native`.

---

## Both (redondance)

Le backend `both` est destiné à écrire à la fois sur **native et Celestia ensemble**. Aujourd'hui, `both` se comporte exactement comme `native` : seule la copie native est stockée, et la moitié Celestia est ignorée avec un avertissement consigné dans les journaux. Ne le considérez pas comme deux copies indépendantes.

---

## Choisir un backend

| Si vous voulez... | Choisissez |
| -------------- | ------ |
| L'option la plus simple, entièrement on-chain, héritant de la sécurité de QoreChain | **`native`** |
| Décharger la DA vers une couche modulaire dédiée | **`celestia`** — non implémenté |
| Une redondance entre deux stockages | **`both`** — identique à `native` aujourd'hui |

Pour savoir comment la DA s'inscrit dans le contexte plus large du règlement, voir **[Présentation des rollups](/rollups/overview)**. Pour la référence du module de plus bas niveau, voir la page **[Rollup Development Kit](/architecture/rollup-development-kit)**.
