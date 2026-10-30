---
slug: /rollups/zk-stark-withdrawals
title: ZK / STARK et retraits
sidebar_label: ZK / STARK et retraits
sidebar_position: 5
---

# ZK / STARK et retraits

Cette page couvre deux sujets connexes : les **systèmes de preuve ZK** (`snark` et `stark`) utilisés par les rollups réglés en ZK, et le **flux de retrait L2 → L1** qui ramène des fonds d'un rollup vers QoreChain une fois qu'un lot est finalisé.

:::caution Capacité à un stade précoce
Aucun rollup n'a encore été créé sur l'un ou l'autre réseau (vérifié le 27 octobre 2026), donc ni la vérification des preuves ni le flux de retrait décrits ici n'ont été exercés sur un rollup en production. Les retraits ne peuvent aboutir sur le mainnet qu'à partir de la v3.2.3 (hauteur 3,662,051, 20 octobre 2026), lorsque le registre d'escrow par rollup est entré en service (voir [D'où viennent les fonds](#where-the-funds-come-from)) ; auparavant, chaque retrait échouait. **Le règlement ZK ne peut être utilisé sur aucun des deux réseaux pour l'instant** (le profil `defi` et chaque rollup `zk`) : la chaîne n'a aucun moyen d'enregistrer une clé de vérification, de sorte que chaque lot ZK est refusé une fois ses frais payés, et l'enregistrement des clés est prévu pour la chaîne v3.2.7. La vérification STARK est expérimentale. Validez sur le testnet **`qorechain-diana`** et ne présumez pas de garanties durcies pour la production sur le mainnet.
:::

---

## Systèmes de preuve ZK

Un rollup réglé en ZK (mode de règlement `zk`) attache une preuve de validité à chaque lot de règlement, prouvant que la transition d'état est correcte sans réexécuter les transactions du rollup. Le règlement ZK prend en charge deux systèmes de preuve :

| Système de preuve | Caractéristiques |
| ------------ | --------------- |
| **`snark`** | Preuves succinctes (Groth16 sur BLS12-381), vérifiées on-chain par rapport à la clé de vérification du rollup |
| **`stark`** | Preuves transparentes, sans configuration de confiance — expérimental ; opt-in et lié à un circuit de démonstration |

Le mode de règlement `zk` requiert l'un de `snark` ou `stark` ; l'appariement est imposé on-chain lors de la création du rollup. À l'inverse, le règlement `optimistic` utilise le système de preuve `fraud`, et les règlements `based` et `sovereign` utilisent `none`. Consultez la **[Vue d'ensemble des rollups](/rollups/overview)** pour la matrice de compatibilité complète.

### Finalité

Contrairement aux rollups optimistes — qui attendent la fin d'une fenêtre de contestation par preuve de fraude — un lot ZK peut être finalisé sur **vérification d'une preuve valide**, sans fenêtre de litige. C'est le compromis fondamental du règlement ZK : une finalité plus forte et plus rapide en échange du coût et de la complexité de la génération des preuves.

### Maturité

**Le règlement ZK ne peut être utilisé sur aucun des deux réseaux pour l'instant.** Les lots SNARK sont destinés à être vérifiés on-chain (Groth16 sur BLS12-381, avec trois entrées publiques : la racine d'état précédente, la nouvelle racine d'état et le hachage des données) par rapport à une clé de vérification stockée avec le rollup. La chaîne n'a aucun moyen d'enregistrer cette clé : un rollup créé avec le règlement `zk`, y compris chaque rollup issu du profil `defi` ou du modèle `defi-rollup`, n'en a donc pas, et chaque lot ZK qu'il soumet est refusé une fois ses frais payés. L'enregistrement des clés est prévu pour la chaîne v3.2.7 ; d'ici là, ne créez pas de rollup ZK et n'en financez pas. Lorsqu'il sera disponible, le circuit de démonstration du modèle `defi` (un multiplicateur `snarkjs`) ne pourra toujours pas être vérifié, car il n'a pas les entrées publiques que contrôle la chaîne ; vous aurez besoin de votre propre circuit. À partir du RDK 0.7.0, le modèle `defi-rollup` s'arrête avant d'envoyer un lot, de sorte qu'il ne dépense plus de frais pour un lot que la chaîne refuse toujours. La vérification STARK est expérimentale : elle est opt-in et vérifie un circuit de démonstration, et non la transition d'état propre à votre rollup. Pour un règlement utilisable dès aujourd'hui, choisissez `optimistic` (les profils `nft` et `custom`).

---

## Comment les lots transportent les retraits

Lorsqu'un rollup règle un lot, ce lot peut aussi valider les messages inter-couches sortants du rollup — ses **retraits L2 → L1**. Conceptuellement :

* Un lot finalisé peut transporter un engagement (commitment) sur son ensemble de retraits (une racine de Merkle sur les messages de retrait du lot).
* Chaque retrait individuel est une feuille sous cette racine, identifiée par son index de lot et un index de retrait.
* Une fois le lot finalisé, n'importe quelle partie peut prouver qu'une feuille de retrait spécifique est incluse sous la racine engagée, et déclencher le paiement.

C'est pourquoi les retraits dépendent du règlement : un retrait ne peut être exécuté que sur un lot **finalisé**, car c'est la finalisation qui rend canonique la racine des retraits engagée.

Pour savoir comment les lots sont soumis et finalisés — y compris `submit-batch` et le chemin de litige `challenge-batch` pour les rollups optimistes — consultez **[Déployer un rollup](/rollups/deploying-a-rollup)**.

---

## Exécuter un retrait : `execute-withdrawal`

La commande `execute-withdrawal` finalise un retrait L2 → L1 sur la racine des retraits d'un lot finalisé. Elle prouve qu'une feuille de retrait est engagée dans cette racine et paie le destinataire depuis l'escrow du module rdk. L'action est **sans permission** — quiconque peut soumettre une preuve valide. Comme toute transaction de la voie native, elle nécessite la co-signature post-quantique hybride : construisez-la donc avec `--generate-only` et co-signez-la (voir [Déployer un rollup](/rollups/deploying-a-rollup)). Les retraits n'ont pas encore été exercés sur un rollup en production ; considérez ce flux comme non testé. Vérifiez ces points avant de payer des frais, car la chaîne refuse sinon la transaction : la dénomination doit être exactement `uqor`, le montant doit être positif, la preuve comporte au plus 64 niveaux et chaque frère fait exactement 32 octets, l'émetteur et le destinataire sont des adresses `qor1…` valides, le lot est finalisé et a engagé une `withdrawals_root`, le rollup n'est pas arrêté, et cette feuille de retrait n'a pas déjà été payée. Le `@qorechain/rdk` TypeScript (0.6.0 et ultérieures) exécute pour vous le premier groupe de ces contrôles (`withdrawalErrors` : adresses, dénomination, montant, profondeur de la preuve et longueur des frères), et `executeWithdrawal` lève une erreur avant de diffuser si l'un d'eux échoue ; à partir de la 0.7.0, `qorollup withdraw --file withdrawal.json [--dry-run]` construit aussi la preuve à partir des retraits du lot et refuse avant de payer des frais lorsque le résultat n'est pas la `withdrawals_root` on-chain du lot ; les conditions relatives au lot, au rollup et au registre dépendent de l'état de la chaîne, que ce contrôle ne lit pas.

```bash
qorechaind tx rdk execute-withdrawal \
  [rollup-id] [batch-index] [withdrawal-index] [recipient] [denom] [amount] \
  --proof <sibling-hash-1>,<sibling-hash-2>,... \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 400000 --fees 40000uqor \
  --generate-only > withdrawal.json
qorechaind tx pqc cosign withdrawal.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

**Arguments positionnels :**

| Argument | Description |
| -------- | ----------- |
| `rollup-id` | Le rollup auquel appartient le retrait |
| `batch-index` | Le lot finalisé dont la racine des retraits engage ce retrait |
| `withdrawal-index` | L'index de la feuille de retrait au sein de ce lot |
| `recipient` | L'adresse à laquelle payer |
| `denom` | La dénomination à payer |
| `amount` | Le montant à payer |

**Drapeau :**

| Drapeau | Description |
| ---- | ----------- |
| `--proof` | Hachages frères (siblings) de Merkle hexadécimaux séparés par des virgules, ordonnés de la feuille à la racine, qui prouvent que la feuille de retrait est engagée dans la racine des retraits du lot |

La valeur `--proof` est la preuve d'inclusion : les hachages frères le long du chemin allant de la feuille de retrait jusqu'à la racine des retraits engagée du lot. Le module recalcule la racine à partir de la feuille et des frères fournis, et la compare à la racine engagée du lot finalisé avant de payer.

### Encodage des feuilles et des nœuds {#leaf-and-node-encoding}

* **Feuille (première forme, pour les lots antérieurs à la v3.2.5 de la chaîne)** = SHAKE-256 (32 octets) de `rollup_id`, un octet `0x00`, l'index de retrait (8 octets, big-endian), la chaîne `recipient`, `0x00`, la chaîne `denom`, `0x00`, et le `amount` (8 octets, big-endian).
* **Feuille (seconde forme, à partir de la v3.2.5 de la chaîne sur les deux réseaux)** : pour les lots issus de la v3.2.5 de la chaîne, la feuille désigne aussi l'identifiant de chaîne. Le RDK construit les deux formes (`withdrawalLeafV1`, `withdrawalLeafV2`).
* **Parent** = SHAKE-256 de `left || right`. À chaque niveau, le bit correspondant de l'index de retrait détermine le côté : `0` signifie que la feuille (ou le hachage courant) est le nœud gauche, de sorte que la position de la feuille dans l'arbre est son index de retrait.
* Chaque hachage frère doit faire exactement 32 octets.
* **Racine des retraits (à partir de la v3.2.5 de la chaîne, sur les deux réseaux) :** la `withdrawals_root` d'un lot est soit vide, soit d'exactement 32 octets ; avant la v3.2.5, cette règle de longueur n'était pas appliquée.

Ne construisez pas cet arbre à la main. `withdrawalsTree` dans `@qorechain/rdk` 0.7.0 (et ses équivalents Python, Go, Rust et Java) construit la racine des retraits d'un lot et chaque preuve exactement comme le fait la chaîne, et a été vérifié face au vérificateur même de la chaîne ; `assembleWithdrawalProof` construit par défaut l'arbre de la chaîne, et les utilitaires Merkle génériques utilisent désormais SHAKE-256 par défaut.

:::caution Versions antérieures à la 0.7.0
Dans `@qorechain/rdk` 0.6.2 et antérieur, les utilitaires génériques `binaryMerkleRoot` / `binaryMerkleProof` (et leurs équivalents Python, Go, Rust et Java) utilisaient par défaut SHA-256 avec duplication des nœuds impairs et re-hachaient chaque feuille, alors que la chaîne utilise SHAKE-256 et construit ses feuilles à partir du retrait ; une preuve construite avec ces valeurs par défaut ne se vérifiait donc jamais on-chain. Passez à la 0.7.0, ou remplacez la fonction de hachage et l'encodage des feuilles par les règles ci-dessus, faute de quoi la preuve ne sera pas vérifiée on-chain.
:::

### D'où viennent les fonds {#where-the-funds-come-from}

Un retrait est payé depuis le **stake placé sous escrow par le rollup lui-même** (le stake moins la destruction de 1 % à la création). L'escrow de tous les rollups se trouve dans un solde de module unique et mutualisé, et depuis la **v3.2.3**, un **registre d'escrow** par rollup tient la comptabilité de ce que détient chaque rollup : `create-rollup` le crédite de l'escrow que le rollup conserve, un retrait ou une récompense de preuve de fraude est payé à partir de ce registre et y est débité, et un retrait supérieur à ce que le rollup détient encore est refusé avec une erreur d'escrow insuffisant. `stop-rollup` ne rembourse que ce qui reste et remet le registre à zéro, et un rollup arrêté ne paie plus aucun retrait. Un retrait prouvé pour un rollup ne peut donc pas être payé sur le stake d'un autre rollup. Les requêtes de rollup portent `escrow_balance` (les uqor encore détenus pour ce rollup). Le module ne comporte aucun message de dépôt L1 → L2 ; il ne s'agit donc pas d'un pont de fonds d'utilisateurs.

---

## Flux de retrait de bout en bout

*Le chemin L2 vers L1 : un lot de règlement engage une racine de retraits, le lot est finalisé, puis une preuve d'inclusion sans permission libère les fonds sous escrow sur QoreChain.*

```mermaid
flowchart LR
    A["Rollup (L2)<br/>outbound L2 to L1 messages"] --> B["submit-batch<br/>commits withdrawals root<br/>(Merkle root over withdrawals)"]
    B --> C{"Finalize batch"}
    C -- "zk: valid proof verification" --> D["Withdrawals root canonical"]
    C -- "optimistic: after challenge window" --> D
    D --> E["execute-withdrawal<br/>--proof (Merkle siblings, leaf to root)"]
    E --> F{"Recompute root,<br/>match finalized root?"}
    F -- "yes" --> G["Release funds from<br/>rdk module escrow to recipient"]
    F -- "no" --> H["Reject"]
```

1. **Régler un lot.** L'opérateur du rollup soumet un lot de règlement avec `submit-batch`. Le lot peut engager une racine de retraits sur ses messages sortants L2 → L1.
2. **Finaliser.** Le lot est finalisé selon le mode de règlement du rollup — sur vérification d'une preuve valide pour `zk`, ou après la fenêtre de contestation pour `optimistic` (durant laquelle `challenge-batch` peut le contester). Depuis la v3.2.5 de la chaîne (testnet à partir du 26 octobre 2026, mainnet à partir du 29 octobre 2026), les lots sont en outre finalisés strictement dans l'ordre des index : un lot attend donc tout lot antérieur encore à l'état `submitted` ou `challenged`. La fenêtre optimiste est par défaut de 100,800 blocs pour un lot soumis avant la mise à niveau v3.2.4 ; à partir de la v3.2.4, elle se mesure en secondes de temps de bloc pour les lots soumis à partir de la hauteur de mise à niveau (testnet depuis la hauteur 8,337,253 le 19 octobre 2026, mainnet depuis la hauteur 3,742,566 le 23 octobre 2026).
3. **Prouver et exécuter.** Une fois finalisé, n'importe qui soumet `execute-withdrawal` avec la preuve d'inclusion de Merkle (`--proof`) pour la feuille de retrait spécifique. Le module vérifie l'inclusion par rapport à la racine des retraits du lot finalisé et paie le destinataire depuis l'escrow.

Comme l'étape 3 est sans permission et basée sur une preuve, un retrait ne dépend pas de la coopération de l'opérateur du rollup une fois que le lot qui le transporte est finalisé.

---

## Connexe

* **[Vue d'ensemble des rollups](/rollups/overview)** — paradigmes de règlement et matrice de compatibilité des systèmes de preuve.
* **[Déployer un rollup](/rollups/deploying-a-rollup)** — commandes opérateur `submit-batch` et `challenge-batch`.
* **[Kit de développement de rollups](/architecture/rollup-development-kit)** — la référence du module de plus bas niveau.
