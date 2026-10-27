---
slug: /user-guide/bridging-assets
title: Transfert d'actifs par pont
sidebar_label: Transfert d'actifs par pont
sidebar_position: 5
---

# Transfert d'actifs par pont

Ce guide décrit la manière dont le déplacement d'actifs entre QoreChain et d'autres réseaux blockchain est conçu pour fonctionner. La couche d'interopérabilité de QoreChain repose sur **37 configurations de chaînes** (36 chaînes externes plus Injective, atteinte via IBC) et jusqu'à **8 contreparties IBC** pour les chaînes de l'écosystème Cosmos.

:::caution Pas en service sur aucun des deux réseaux
Le module de pont est déployé sur le mainnet et le testnet, mais **aucune route de pont n'est active** : les 37 configurations de chaînes sont au statut `pending` sans contrat de pont défini, aucun validateur de pont n'est enregistré, aucune opération de pont n'a jamais été créée, et il n'existe aucun canal IBC sur le mainnet (le testnet a un unique canal de test ICS-20 vers une chaîne d'ID `provider`, aucun vers les contreparties nommées ci-dessous). Tout ce qui suit décrit la conception prévue. N'envoyez pas d'actifs en comptant sur leur transfert par pont. Voir [Architecture du Pont](/architecture/bridge-architecture) pour le tableau de statut actuel.
:::

:::note
Les commandes ci-dessous utilisent le testnet **`qorechain-diana`** (EVM chain ID **9800**, version de chaîne **v3.2.6**). Le mainnet (**`qorechain-vladi`**, EVM chain ID **9801**) exécute la version de chaîne **v3.2.4** (depuis le 23 octobre 2026). Substituez le chain ID et les points de terminaison du mainnet depuis la page **Connexion au Mainnet** une fois qu'une route est activée. Statut vérifié le 27 octobre 2026 : les 37 configurations de chaînes sont `pending` sur les deux réseaux.
:::

---

## Aperçu des connexions

QoreChain est conçu pour fournir deux protocoles de pont :

| Protocole                                 | Connexions        | Cas d'usage                                                                 |
| ---------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| **IBC** (Inter-Blockchain Communication) | jusqu'à 8 canaux (aucun ouvert)   | Interopérabilité native avec les chaînes compatibles IBC                          |
| **QCB** (QoreChain Bridge)               | 37 configurations (toutes en attente) | Transferts cross-chain avec des réseaux non-IBC via des attestations sécurisées par PQC |

Une énumération complète de chaque configuration de chaîne se trouve sur la page **Architecture du Pont**. Ce guide se concentre sur la manière dont un transfert par pont est conçu pour fonctionner.

---

## IBC

IBC fait partie de la conception (Cosmos Hub, Osmosis, Noble, Celestia, Stride, Akash, Babylon, Injective), mais **aucune de ces contreparties n'est encore connectée** : le mainnet n'a ni canal ni client IBC, et le testnet n'a qu'un unique canal de test ICS-20 vers une chaîne d'ID `provider` (vérifié le 27 octobre 2026) ; il n'y a donc rien à transférer pour ces chaînes. Cette page listera les canaux une fois qu'ils seront ouverts.

### Ajouts IBC sur le testnet (v3.2.6) {#ibc-testnet-v326}

Trois fonctionnalités IBC n'existent que sur le testnet ; le mainnet ne les a pas (sa route `/Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` répond 501) :

* **Limite de débit IBC.** La gouvernance peut fixer un quota par canal pour les transferts IBC (un pourcentage entier de l'offre par fenêtre de quelques heures). Ce n'est **pas automatique** : aucune limite n'est définie aujourd'hui, et un ensemble vide signifie illimité. Un paquet relayé est comptabilisé sur les deux canaux et un remboursement restitue le quota. Cela est distinct des disjoncteurs du pont décrits dans [Modèle de sécurité](#security-model).
* **Transfert de paquets.** Un transfert arrivant par IBC v1 peut porter un mémo de la forme `\{"forward":\{"receiver":"...","port":"transfer","channel":"channel-N"\}\}` pour être envoyé vers une autre chaîne, avec remboursement à l'expéditeur si un saut échoue. Il n'y a aucune nouvelle tentative et un saut expire par défaut au bout de 10 minutes. Un token qui se convertit en ERC-20 à l'arrivée ne peut pas être transféré.
* **Clients légers 08-wasm.** Enregistrer, migrer et supprimer un binaire de client léger wasm est réservé à l'autorité, et les types de client autorisés ne contiennent que le client standard tant que la gouvernance n'ajoute pas `08-wasm`.

Lisez les limites avec `GET /Stride-Labs/ibc-rate-limiting/ratelimit/ratelimits` sur le testnet (`\{"rate_limits":[]\}` aujourd'hui).

---

## Points de terminaison du pont QCB

Le QoreChain Bridge est conçu pour se connecter à des chaînes externes couvrant plusieurs types d'écosystèmes. Une sélection représentative des connexions prévues (chacune est `pending` aujourd'hui) :

| Chaîne     | Type de chaîne |
| --------- | ---------- |
| Ethereum  | EVM        |
| BSC       | EVM        |
| Solana    | Solana     |
| Avalanche | EVM        |
| Polygon   | EVM        |
| Arbitrum  | EVM        |
| TON       | TON        |
| Sui       | Sui Move   |
| Optimism  | EVM        |
| Base      | EVM        |
| Aptos     | Aptos      |
| Bitcoin   | Bitcoin    |
| NEAR      | NEAR       |
| Cardano   | Cardano    |
| Polkadot  | Polkadot   |
| Tezos     | Tezos      |
| Tron      | Tron       |

Aucune liste d'actifs n'est publiée : les configurations de chaînes ne comportent pas encore de registre d'actifs. Consultez la page **Architecture du Pont** pour la liste complète des configurations de chaînes.

---

## Flux de dépôt (chaîne externe vers QoreChain)

La séquence prévue pour un dépôt depuis une chaîne externe vers QoreChain :

1. **Verrouillage** — Verrouillez les jetons sur la chaîne externe en les envoyant au contrat ou à l'adresse du pont QCB.
2. **Attestation** — Les validateurs du pont observent la transaction de verrouillage et produisent des attestations signées par PQC.
3. **Seuil** — Une fois **7 sur 10** attestations de validateurs collectées, le pont finalise le dépôt.
4. **Émission** — Les jetons enveloppés (wrapped) équivalents sont émis sur QoreChain et crédités sur votre adresse `qor1...`.

Il n'existe aucune commande « démarrer un dépôt » exécutable par l'utilisateur : vous verrouillez sur la chaîne externe, et les attestations des validateurs du pont créditent votre compte. (La commande `qorechaind tx bridge deposit` de la chaîne crédite un dépôt déjà attesté et nécessite des signatures de validateurs du pont ; ce n'est pas la manière dont un utilisateur démarre un dépôt.)

---

## Flux de retrait (QoreChain vers chaîne externe)

La séquence prévue pour un retrait de QoreChain vers une chaîne externe :

1. **Brûlage** — Brûlez les jetons enveloppés (wrapped) sur QoreChain.
2. **Attestation** — Les validateurs du pont observent le brûlage et produisent des attestations signées par PQC.
3. **Seuil** — Une fois **7 sur 10** attestations collectées, le retrait est finalisé.
4. **Déverrouillage** — Les jetons d'origine sont libérés sur la chaîne externe vers l'adresse de destination spécifiée.

**Commande CLI** (bloquée aujourd'hui : aucune chaîne n'est active, la transaction serait donc refusée) :

```bash
# 1. Build the unsigned transaction
qorechaind tx bridge withdraw [destination-chain] [destination-address] [asset] [amount] \
  --from mykey \
  --chain-id qorechain-diana \
  --gas 300000 --fees 30000uqor \
  --generate-only > withdraw.json

# 2. Attach the post-quantum co-signature and broadcast
qorechaind tx pqc cosign withdraw.json --from mykey --pqc-key mypqckey --chain-id qorechain-diana
```

Chaque transaction de la voie native nécessite la co-signature post-quantique hybride et des frais d'au moins 0,1 uqor par unité de gas ; voir [Première transaction](/getting-started/first-transaction).

---

## Modèle de sécurité {#security-model}

Le QoreChain Bridge est conçu pour être sécurisé par plusieurs couches de défense :

| Mécanisme                    | Description                                                                                                                                           |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Multisig PQC 7-sur-10**     | Chaque opération de pont nécessite des attestations d'au moins 7 des 10 validateurs du pont, chacun utilisant des signatures cryptographiques post-quantiques.               |
| **Période de contestation de 24 heures** | Les transferts dépassant le seuil de gros transfert (100 000 QOR) entrent dans une fenêtre de contestation de 24 heures pendant laquelle les validateurs ou les observateurs peuvent signaler des transactions frauduleuses. |
| **Disjoncteurs**         | Conçus pour le pont QCB : des limiteurs automatisés interrompent les opérations du pont en cas de volume anormal ou de schémas suspects détectés, et les opérations reprennent après une revue manuelle. Ils s'appliquent au pont QCB, pas à IBC ; la limite de débit IBC (testnet uniquement) est fixée par la gouvernance, n'est pas automatique et n'a aucune limite définie aujourd'hui. |

---

## Interroger le statut du pont

Lisez l'état du pont :

```bash
qorechaind query bridge config
qorechaind query bridge chains
qorechaind query bridge chain ethereum
qorechaind query bridge validators
qorechaind query bridge operations
qorechaind query bridge operation [id]
```

Les mêmes données sont disponibles via REST sous `/qorechain/bridge/v1/` (voir [Architecture du Pont](/architecture/bridge-architecture#rest-api-endpoints)).

---

## Astuces

* Vérifiez toujours que le format de l'adresse de destination correspond à la chaîne cible (par ex. `0x...` pour les chaînes EVM, base58 pour Solana).
* Les transferts importants (au-delà de 100 000 QOR) sont conçus pour déclencher automatiquement la période de contestation de 24 heures.
* Les frais de pont sont brûlés via le canal de brûlage `bridge_fee` (voir [Opérations sur les jetons](/user-guide/token-operations)).
