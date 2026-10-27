---
slug: /cli-reference/transaction-commands
title: Commandes de transaction
sidebar_label: Commandes de transaction
sidebar_position: 2
---

# Commandes de transaction

Toutes les commandes de transaction suivent le modèle :

```bash
qorechaind tx <module> <command> [args] [flags]
```

:::note
Définissez `--chain-id qorechain-vladi` pour diffuser vers le mainnet en production, ou `--chain-id qorechain-diana` pour le testnet. Les deux réseaux exécutent la lignée v3.2 : version de nœud du mainnet **v3.2.4** (appliquée à la hauteur 3 742 566 le 23 octobre 2026 par la proposition de gouvernance 13 ; la v3.2.3 a été appliquée à la hauteur 3 662 051 le 20 octobre 2026 ; la proposition de gouvernance 14 appliquerait la v3.2.5 à la hauteur 3 906 833 et est en période de vote au moment de la rédaction), testnet **v3.2.6** (appliquée à la hauteur 8 970 638 le 27 octobre 2026, après la v3.2.5 à la hauteur 8 890 800 le 26 octobre et la v3.2.4 à la hauteur 8 337 253 le 19 octobre). Consultez `latest.json` sous [download.qore.host](https://download.qore.host) pour la version actuelle. Si `--chain-id` est omis, le client utilise le `chain-id` de votre configuration cliente locale.

Les commandes et drapeaux de cette page ont été vérifiés avec le binaire de la version v3.2.3, plus les ajouts de la v3.2.4. Tout ce qui n'existe qu'à partir de la v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026) est signalé comme tel. Le code source de la v3.2.6 n'ajoute aucune nouvelle commande `tx` ; il modifie l'état du testnet (jetons de test, module abstract-account activé, instanciation QoreChain Native ouverte), ce que les sections ci-dessous mentionnent là où c'est pertinent.
:::

Les drapeaux communs s'appliquent à chaque sous-commande `tx` :

| Drapeau             | Type   | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `--from`            | string | Nom ou adresse de la clé de signature                          |
| `--chain-id`        | string | Identifiant de chaîne (par défaut : depuis la config cliente)  |
| `--fees`            | string | Frais de transaction, p. ex. `40000uqor`                       |
| `--gas-prices`      | string | Prix du gas à la place de `--fees`, p. ex. `0.1uqor`           |
| `--gas`             | string | Limite de gas, ou `auto` pour l'estimer (par défaut `200000`)  |
| `--gas-adjustment`  | float  | Multiplicateur appliqué à l'estimation `auto` (par défaut `1`) |
| `--keyring-backend` | string | `os`, `file`, `kwallet`, `pass`, `test` ou `memory`            |
| `--node`            | string | Point de terminaison RPC (par défaut `tcp://localhost:26657`)  |
| `--broadcast-mode`  | string | `sync` ou `async`                                              |
| `--generate-only`   | bool   | Afficher la transaction non signée au lieu de la signer        |
| `-y`                | bool   | Ignorer l'invite de confirmation                               |

---

## Frais et gas {#fees-and-gas}

Le plancher de frais du réseau est de **0,1 uqor par unité de gas** (`query feemarket params` affiche `min_gas_price` ; les frais de base en vigueur peuvent dépasser ce plancher en cas de charge, voir `query feemarket base-fee`). Une transaction est rejetée sauf si `fee >= gas limit x gas price`, de sorte que `--fees 500uqor` ne fonctionne que pour une limite de gas de 5 000 ou moins et échoue pour toute transaction réelle.

| Transaction                                          | `--gas` suggéré | `--fees` correspondant |
| ---------------------------------------------------- | --------------- | ---------------------- |
| Transfert, délégation, vote, réclamation signés en mode hybride | `400000`        | `40000uqor`            |
| Enregistrement de clé PQC                            | `600000`        | `60000uqor`            |
| `lightnode register`                                 | `300000`        | `30000uqor`            |

Une signature hybride ajoute environ 4,7 Ko à une transaction, facturés à 10 gas par octet ; le `--gas 200000` par défaut n'est donc pas toujours suffisant : les transferts signés en mode hybride sur le mainnet ont consommé entre environ 160 000 et 240 000 gas. Définissez toujours `--gas` explicitement avec `--fees` (ou `--gas-prices`).

---

## La signature hybride est obligatoire sur le lane Cosmos {#hybrid-signing}

`hybrid_signature_mode` vaut `required` sur les deux réseaux (`qorechaind query pqc hybrid-mode`). Chaque transaction du lane Cosmos doit porter une signature ML-DSA-87 (Dilithium-5) en plus de la signature secp256k1 ; un simple `tx bank send ... -y` est rejeté (codespace `pqc`, code 20). Les seules exemptions, depuis la v3.2.3 du mainnet, sont :

- la **première** inscription de clé PQC d'un compte qui n'a pas encore de clé (`register-key` ou `register-key-v2`), afin qu'un nouveau compte puisse s'initialiser ;
- la réparation d'un enregistrement de compte qui ne contient aucune clé utilisable, avec `register-key-v2` ;
- `tx slashing unjail` pour un compte qui n'a aucune clé PQC enregistrée.

Un compte qui détient déjà une clé PQC doit tout signer en mode hybride, **y compris** `register-key-v2` et `migrate-key` (une tentative uniquement classique est refusée avec le code 234). Un compte sans clé ne peut pas non plus joindre de signature hybride : il n'a rien contre quoi vérifier, il s'enregistre donc d'abord.

Chaque commande de cette page, à l'exception de la première inscription (`pqc register-key` / `pqc register-key-v2` sur un compte sans clé), s'exécute donc en deux étapes : construire la transaction avec `--generate-only`, puis la signer et la diffuser avec `tx pqc cosign`. `pqc rotate-key` effectue lui-même la cosignature et la diffusion ; `pqc gen-key` et `pqc recover-key` ne font que créer un fichier de clé en local :

```bash
qorechaind tx bank send mykey qor1recipient... 1000000uqor \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json

qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

Le nom de clé `mypqc` désigne une clé créée avec `tx pqc gen-key` et enregistrée sur le compte (voir [pqc](#pqc)). Utilisez pour cela le binaire de version officiel depuis [download.qore.host](https://download.qore.host) : un binaire compilé depuis l'arborescence source publique ne peut ni créer ni appliquer une signature Dilithium (`gen-key` et `cosign` indiquent qu'ils nécessitent la compilation complète). [QoreX](/qorex/overview) et les SDK effectuent cette même signature à votre place.

---

## bank

### send

Transférer des jetons d'un compte à un autre.

```bash
qorechaind tx bank send <from_key_or_address> <to_address> <amount> [flags]
```

Exemple : `qorechaind tx bank send mykey qor1recipient... 1000000uqor --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > tx.json`, puis `tx pqc cosign` comme indiqué ci-dessus. 1 QOR = 1 000 000 uqor.

---

## staking

### create-validator

Créer un validateur à partir d'un fichier JSON (la forme à base de drapeaux a été supprimée). Le mainnet exige en outre une licence `validator_operator` active et une clé PQC enregistrée ; voir [Exploiter un validateur](/developer-guide/running-a-validator).

```bash
qorechaind tx staking create-validator validator.json \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi \
  --generate-only > tx.json
```

`validator.json` :

```json
{
  "pubkey": {"@type": "/cosmos.crypto.ed25519.PubKey", "key": "<base64 key from: qorechaind comet show-validator>"},
  "amount": "100000000000uqor",
  "moniker": "my-validator",
  "identity": "",
  "website": "",
  "security": "",
  "details": "",
  "commission-rate": "0.10",
  "commission-max-rate": "0.20",
  "commission-max-change-rate": "0.01",
  "min-self-delegation": "1"
}
```

### edit-validator

Modifier la description ou la commission d'un validateur existant.

```bash
qorechaind tx staking edit-validator --new-moniker "new-name" --website "https://example.org" --from mykey [flags]
```

Drapeaux : `--new-moniker`, `--website`, `--identity`, `--security-contact`, `--details`, `--commission-rate`, `--min-self-delegation`. Les champs omis restent inchangés.

### delegate

```bash
qorechaind tx staking delegate <validator_address> <amount> [flags]
```

### redelegate

```bash
qorechaind tx staking redelegate <src_validator> <dst_validator> <amount> [flags]
```

### unbond

```bash
qorechaind tx staking unbond <validator_address> <amount> [flags]
```

### cancel-unbond

Annuler une entrée de unbonding en cours.

```bash
qorechaind tx staking cancel-unbond <validator_address> <amount> <creation_height> [flags]
```

---

## slashing

### unjail

Remettre un validateur emprisonné (jailed) dans l'ensemble actif une fois la période de jail écoulée.

```bash
qorechaind tx slashing unjail --from mykey [flags]
```

---

## distribution

### withdraw-all-rewards

Retirer toutes les récompenses de staking en attente.

```bash
qorechaind tx distribution withdraw-all-rewards [flags]
```

### withdraw-rewards

Retirer les récompenses d'un validateur.

```bash
qorechaind tx distribution withdraw-rewards <validator_address> [flags]
```

| Drapeau        | Type | Description                                                         |
| -------------- | ---- | ------------------------------------------------------------------- |
| `--commission` | bool | Retirer également la commission (adresses d'opérateur de validateur) |

---

## gov

### submit-proposal

Soumettre une proposition de gouvernance à partir d'un fichier JSON contenant `messages`, `metadata`, `deposit`, `title`, `summary` et, en option, `expedited`. Générez un squelette avec `qorechaind tx gov draft-proposal`.

```bash
qorechaind tx gov submit-proposal <proposal_file.json> [flags]
```

### vote

```bash
qorechaind tx gov vote <proposal_id> <option> [flags]
```

Options de vote : `yes`, `no`, `abstain`, `no_with_veto`. Utilisez `tx gov weighted-vote <proposal_id> yes=0.6,no=0.4` pour répartir un vote.

### deposit

```bash
qorechaind tx gov deposit <proposal_id> <amount> [flags]
```

---

## pqc {#pqc}

### gen-key

Générer une clé Dilithium-5 (ML-DSA-87) et la stocker sous `<home>/pqc/<name>.dilithium` (mode `0600`, **non chiffrée**). Affiche la clé publique en hexadécimal.

```bash
qorechaind tx pqc gen-key <name>
```

`gen-key` et `recover-key` refusent d'écraser un fichier de clé existant portant ce nom ; `--force` le remplace et conserve l'ancien fichier sous le nom `<name>.dilithium.bak-<unix-time>`.

### register-key

Enregistrer une clé publique PQC pour votre compte (commande héritée : l'algorithme est Dilithium-5). Une première inscription est signée avec la seule clé classique ; c'est l'exemption d'initialisation. Un compte qui a déjà une clé doit la signer en mode hybride (`--generate-only`, puis `tx pqc cosign`).

```bash
qorechaind tx pqc register-key <pubkey_hex> <key_type> --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`key_type` vaut `hybrid` (recommandé) ou `pqc_only`. `classical_only` est refusé (code 230) : il n'enregistre aucune clé post-quantique, de sorte que le compte ne pourrait plus jamais signer. La clé publique de 2 592 octets rend l'enregistrement plus coûteux qu'un transfert, ce qui explique la limite de gas plus élevée.

La chaîne refuse aussi une clé qui n'offre aucune protection post-quantique (code 230) et une clé que ce compte a déjà utilisée (code 232). Elle refuse un enregistrement dont la clé classique n'est pas celle du signataire (code 45).

### register-key-v2

Enregistrer une clé avec sélection explicite de l'algorithme, et prouver éventuellement que vous détenez le secret de la clé.

```bash
qorechaind tx pqc register-key-v2 <algorithm> <pubkey_hex> <key_type> [--pqc-key <name>] \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

`algorithm` vaut `dilithium5` (ou `1`) ou `mlkem1024` (ou `2`) ; `key_type` vaut `hybrid` ou `pqc_only`.

**Preuve de possession (facultative).** Avec `--pqc-key <name>` (une clé créée par `gen-key` ou `recover-key`), la commande joint une preuve de possession : la signature de la nouvelle clé elle-même sur `qorechain-pqc-pop-v1|<chain-id>|<algorithm id>|<address>|<public key hex>`. La chaîne la vérifie lorsqu'elle est présente et refuse l'enregistrement si elle ne se vérifie pas (code 231) ; un enregistrement sans elle est toujours accepté. La preuve nomme la chaîne, l'algorithme, le compte et la clé ; elle ne prouve donc rien pour un autre compte ou un autre réseau. Elle ajoute une signature de 4 627 octets à la transaction ; conservez donc la limite de gas à `600000`. La preuve voyage dans le champ `proof_of_possession` du message. Le SDK TypeScript 0.9.0 en joint une automatiquement via `ensurePqcRegistered` une fois que le réseau a appliqué la v3.2.3 ; les versions antérieures du SDK et `@qorechain/wallet-adapter` n'en joignent pas, de sorte qu'un enregistrement effectué par leur intermédiaire ne porte aucune preuve (toujours accepté).

```bash
qorechaind tx pqc gen-key mypqc                      # prints the public key hex
qorechaind tx pqc register-key-v2 dilithium5 <pubkey_hex> hybrid --pqc-key mypqc \
  --from mykey --gas 600000 --fees 60000uqor --chain-id qorechain-vladi -y
```

À partir de la v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026), l'enregistrement du compte indique aussi si une preuve a été vérifiée, sous la forme `possession_proven` (voir [Points de terminaison REST / gRPC](/api-reference/rest-grpc-endpoints#pqc-module)).

### cosign

Signer une transaction non signée avec la clé PQC et la clé classique du compte, puis la diffuser.

```bash
qorechaind tx pqc cosign <unsigned_tx_file> --from <key> --pqc-key <name> --chain-id <id>
```

| Drapeau        | Description                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `--pqc-key`    | Nom de la clé créée avec `gen-key` ou `recover-key`                                               |
| `--sign-bytes` | `auto` (par défaut : demande à la chaîne quelle forme de sign-bytes s'applique), `v1` ou `v2`    |
| `--generate-only` / `--offline` | Afficher la transaction signée en JSON au lieu de la diffuser ; la soumettre plus tard avec `tx broadcast` ; `--offline` exige aussi `--account-number`, `--sequence` et `--sign-bytes v1\|v2` |
| `--dry-run`    | Simuler et afficher l'estimation de gas                                                           |

Les deux réseaux ont appliqué la mise à niveau qui a fait passer la vérification hybride aux sign-bytes v2 ; la forme v1 est refusée. Une transaction ne peut porter qu'une seule extension de signature hybride (plus d'une est refusée depuis la v3.2.3).

### migrate-key

Migrer la clé PQC de votre compte d'un algorithme vers un autre. Une migration doit être active pour votre algorithme actuel (lancée par la gouvernance) ; les deux clés signent les octets de migration, et la transaction elle-même exige votre signature hybride (`--generate-only`, puis `tx pqc cosign`). Une clé que le compte a déjà utilisée est refusée (code 232).

```bash
qorechaind tx pqc migrate-key <new_algorithm> <old_pubkey_hex> <new_pubkey_hex> <old_sig_hex> <new_sig_hex> --generate-only [flags] > m.json
qorechaind tx pqc cosign m.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### recover-key

Reconstruire la clé ML-DSA-87 du compte à partir de son mnémonique BIP-39 (lu depuis stdin) et la stocker localement. Utilise `SHAKE-256("qorechain:pqc:v1|address|mnemonic")`.

```bash
echo "<mnemonic>" | qorechaind tx pqc recover-key <name> <address> [flags]
```

| Drapeau        | Type   | Description                                                                |
| -------------- | ------ | -------------------------------------------------------------------------- |
| `--derivation` | string | `adapter` (canonique, par défaut) ou `bridge` (héritée `SHAKE-256(mnemonic)`)  |

### rotate-key

Faire pivoter la clé ML-DSA-87 du compte au sein du même algorithme. Lit le mnémonique depuis stdin, signe deux fois avec l'ancienne et la nouvelle clé, cosigne avec l'ancienne clé et diffuse.

```bash
echo "<mnemonic>" | qorechaind tx pqc rotate-key --from mykey --old-derivation bridge --new-derivation adapter \
  --gas 600000 --fees 60000uqor --chain-id qorechain-vladi
```

| Drapeau            | Type   | Description                                                                          |
| ------------------ | ------ | ------------------------------------------------------------------------------------ |
| `--old-derivation` | string | Dérivation de la clé actuellement enregistrée : `bridge` (par défaut) ou `adapter`   |
| `--new-derivation` | string | Dérivation de la nouvelle clé : `adapter` (par défaut) ou `bridge`                   |
| `--new-random`     | bool   | Pivoter vers une nouvelle clé aléatoire ; exige `--new-key-out`                      |
| `--new-key-out`    | string | Enregistrer la nouvelle clé privée sous `<home>/pqc/<name>.dilithium` avant tout envoi |
| `--sign-bytes`     | string | `auto` (par défaut), `v1` ou `v2`                                                    |

Depuis la v3.2.3, une rotation refuse une nouvelle clé qui n'offre aucune protection post-quantique (code 230) et une clé que le compte a déjà utilisée (code 232) ; le compte mémorise les clés qu'il a abandonnées par rotation, de sorte qu'une rotation ne peut pas être rejouée pour revenir à une ancienne clé.

### open-evm-window

Le lane EVM n'admet une transaction que d'un compte qui détient une clé PQC enregistrée **et** dispose d'une fenêtre d'autorisation ouverte. Une fenêtre est ouverte par un message du lane Cosmos, qui porte donc la signature PQC qu'un portefeuille Ethereum ne peut pas fournir. À l'intérieur de la fenêtre, les transactions MetaMask ordinaires fonctionnent sans changement.

```bash
qorechaind tx pqc open-evm-window <blocks> <max-txs> <max-value> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
qorechaind tx pqc cosign w.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

| Argument    | Limite               | Signification                                                                                 |
| ----------- | -------------------- | --------------------------------------------------------------------------------------------- |
| `blocks`    | 1 à 17 280           | Durée pendant laquelle la fenêtre reste ouverte, comptée à partir du bloc qui l'ouvre         |
| `max-txs`   | 1 à 1 000            | Nombre de transactions EVM qu'elle admet                                                      |
| `max-value` | positif              | Total admis, comprenant la valeur transférée **et** les frais maximaux que chaque transaction pourrait payer ; `uqor` ou `qor`, p. ex. `1000qor` |

Ouvrir une fenêtre remplace toute fenêtre existante. Vérifiez-la avec `qorechaind query pqc evm-window <address>`.

**Fenêtres à périmètre limité (mainnet v3.2.3 et ultérieures).** La borne de valeur ne compte que le QOR natif : un transfert de token, une approbation ou tout autre appel de contrat porte une valeur nulle et n'est pas décompté. Deux drapeaux facultatifs restreignent ce que la fenêtre admet :

| Drapeau             | Effet                                                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `--native-only`     | N'admettre que les transferts simples de QOR : pas de calldata, pas de création de contrat, pas de destinataire qui porte du code, pas d'autorisation EIP-7702 |
| `--allowed-targets` | N'admettre que ces destinataires (adresses `0x` séparées par des virgules) ; la création de contrat est refusée            |

```bash
qorechaind tx pqc open-evm-window 7200 20 1000qor --native-only --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > w.json
```

Une fenêtre ouverte sans aucun de ces drapeaux admet ce qu'elle a toujours admis. Le périmètre est indiqué par la requête de fenêtre sous la forme `native_only` et `allowed_targets`.

### close-evm-window

Fermer votre fenêtre immédiatement, par exemple si vous soupçonnez que la clé classique est compromise. Cela révoque aussi un consentement de délégation EIP-7702 en attente.

```bash
qorechaind tx pqc close-evm-window --from mykey --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > c.json
qorechaind tx pqc cosign c.json --from mykey --pqc-key mypqc --chain-id qorechain-vladi
```

### authorize-evm-delegation et clear-evm-delegation

Une délégation EIP-7702 de votre compte ne prend effet qu'avec votre propre consentement post-quantique (mainnet depuis la v3.2.2). `authorize-evm-delegation` enregistre ce consentement pour une adresse de délégué ; il est à usage unique, expire après le nombre de blocs indiqué et est révoqué par `close-evm-window`. `clear-evm-delegation` supprime une délégation déjà en place. Les deux sont des messages du lane Cosmos signés en mode hybride (`--generate-only`, puis `tx pqc cosign`).

```bash
qorechaind tx pqc authorize-evm-delegation <delegate_0x_address> <blocks> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
qorechaind tx pqc clear-evm-delegation --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-vladi --generate-only > d.json
```

L'adresse zéro comme `delegate` consent à l'effacement de la délégation. Vérifiez l'état avec `qorechaind query pqc evm-delegation-consent <address>`.

Aucun des messages de clé PQC (`register-key`, `register-key-v2`, `rotate-key`, `migrate-key`) ne peut être envoyé pour le compte d'un autre via `authz` (mainnet v3.2.3 et ultérieures).

---

## lightnode

```bash
qorechaind tx lightnode register <node_type> <version> [--capabilities <csv>] --from operator \
  --gas 300000 --fees 30000uqor --chain-id qorechain-vladi --generate-only > register.json
qorechaind tx pqc cosign register.json --from operator --pqc-key <name> --chain-id qorechain-vladi
```

`node_type` vaut `sx` ou `ux`. L'enregistrement exige une licence `lightnode_operator` active accordée par l'autorité de licences du réseau ; voir [Light Node](/light-node/overview) pour l'état actuel du programme. Autres commandes : `tx lightnode heartbeat`, `tx lightnode claim-rewards`, `tx lightnode deregister`.

Depuis la v3.2.3, la récompense qu'un nœud peut accumuler est bornée **par mois** (`max_reward_per_month_per_node` dans `GET /qorechain/lightnode/v1/reward_pool`, 2 000 QOR par 30 jours), au prorata du temps de bloc et de la disponibilité ; la borne ne dépend donc plus de la vitesse de production des blocs. Une borne est un plafond, et non un montant promis. À partir de la v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026), la borne d'un nœud commence à sa propre inscription plutôt qu'au règlement précédent.

---

## bridge

Le bridge n'est pas en production : sur les deux réseaux, chaque chaîne configurée est au statut `pending` et aucun validateur de bridge n'est enregistré (`query bridge chains`, `query bridge validators`).

### withdraw

```bash
qorechaind tx bridge withdraw <destination_chain> <destination_address> <asset> <amount> [flags]
```

### deposit

Créditer des actifs transférés depuis une chaîne source. Porte des signatures de validateurs (`--validator-sigs`, `--pqc-commitment`) ; c'est un message d'opérateur de bridge, et non la manière dont un utilisateur final initie un dépôt.

```bash
qorechaind tx bridge deposit <source_chain> <source_tx_hash> <asset> <amount> [flags]
```

### register-validator / attest

Messages de validateur de bridge. `register-validator <pqc_pubkey_hex> <supported_chains_csv>` enregistre un validateur pour la tâche d'attestation et `attest <chain> <event_type> <operation_id> <tx_hash> <amount> <asset> [--pqc-signature <hex>] [--proof <hex>]` soumet une attestation. Aucun validateur de bridge n'est enregistré sur l'un ou l'autre réseau. À partir de la v3.2.4 (mainnet depuis le 23 octobre 2026, testnet depuis le 19 octobre 2026), l'enregistrement d'un validateur de bridge exige aussi une preuve de possession et une clé qu'aucun autre validateur de bridge n'utilise.

### update-chain-config / set-verifier-bootstrap / update-circuit-breaker-limits

Administratif (licence `bridge_admin` ou `qcb_bridge` ; les limites du disjoncteur peuvent aussi être fixées par la gouvernance).

```bash
qorechaind tx bridge update-chain-config <chain_id> [--status active|paused|pending] [--verifier <kind>] [--contract <addr>] [--confirmations <n>] [--architecture <a>] [--lock-event-sig <hex>] [flags]
qorechaind tx bridge set-verifier-bootstrap <kind> <chain_id> [flags]
qorechaind tx bridge update-circuit-breaker-limits <chain_id> <max_single_transfer> <daily_limit> [flags]
```

Les limites sont en unités de base et `0` signifie illimité. Seule une route dont le statut est exactement `active` déplace de la valeur.

---

## ibc-transfer

```bash
qorechaind tx ibc-transfer transfer transfer <channel> <receiver> <amount> [flags]
```

Le premier `transfer` est la sous-commande et le second est le port source. Aucun canal IBC n'est ouvert sur le mainnet au moment de la rédaction ; le testnet a un canal de transfert ouvert (`channel-0`), vérifié le 27 octobre 2026 avec `query ibc channel channels`.

---

## amm

Messages AMM natifs. Aucun pool n'existe sur l'un ou l'autre réseau au moment de la rédaction ; ces commandes n'ont donc encore rien sur quoi agir.

```bash
qorechaind tx amm create-pool <pool_type> <deposit_a> <deposit_b> [flags]     # pool_type: constant_product | stable_swap; deposits as coins, e.g. 1000000uqor
qorechaind tx amm add-liquidity <pool_id> <amount_a> <amount_b> <min_lp_out> [flags]
qorechaind tx amm remove-liquidity <pool_id> <lp_amount> <min_a> <min_b> [flags]
qorechaind tx amm swap-exact-in <pool_id> <token_in> <denom_out> <min_out> [flags]
qorechaind tx amm swap-exact-out <pool_id> <denom_in> <token_out> <max_in> [flags]
```

Depuis la v3.2.2, un swap doit nommer les deux dénominations du pool, `max_swap_impact_bps` est appliqué et les frais de protocole sont acheminés via le module burn.

Sur le testnet, un pool peut associer `uqor` à l'un des trois jetons de test Fest (sans valeur ; testnet uniquement). Le dépôt et les montants de swap utilisent la dénomination bank `erc20:<adresse 0x EIP-55>`, sensible à la casse, par exemple `qorechaind tx amm create-pool constant_product 1000000000uqor 2000000000erc20:0x97143B771D34ddb9130b807b135Ae675A5a963CA --from mykey --generate-only > tx.json` (puis `tx pqc cosign`). Un jeton détenu côté EVM doit d'abord être converti en coin bank avec `MsgConvertERC20`, dont l'expéditeur est une adresse `qor1` ; la commande CLI `qorechaind tx erc20 convert-erc20` de la version de nœud v3.2.6 écrit l'expéditeur comme une adresse `0x` et la chaîne la refuse (`decoding bech32 failed`) : construisez donc ce message avec l'expéditeur `qor1` à la place. Détails : [Jetons de test Fest du testnet](/developer-guide/evm-development#fest-tokens). La création d'un pool coûte les frais de création de pool en plus des dépôts (`pool_creation_fee` dans `query amm params`).

---

## gasabstraction

```bash
qorechaind tx gasabstraction fund-float <amount> [flags]
```

Transfère des tokens natifs (par exemple `1000000uqor`) dans le float de conversion des frais, la réserve de QOR que le module utilise pour payer les validateurs lorsqu'un frais est payé dans un autre token accepté. La gouvernance décide quels tokens sont acceptés. Sur les deux réseaux, la configuration n'accepte que l'`uqor` natif, de sorte qu'aucune conversion n'a lieu ; vérifiez-le avec `qorechaind query gasabstraction accepted-tokens`.

---

## crossvm

```bash
qorechaind tx crossvm call <evm|cosmwasm|svm> <target_contract> --payload <hex> [--funds <coins>] [--async] [flags]
```

`call` est désactivée sur le mainnet par le disjoncteur (voir [ci-dessous](#disabled-messages)) et ne fonctionne sur le testnet que lorsque le lane cible est disponible. Un appel mis en file d'attente (`--async`) qui échoue ne laisse aucun effet de bord, seulement son enregistrement `Failed` (depuis la v3.2.3), et un appel dont le lane source dérivé est égal à son lane cible est refusé. Voir [Interopérabilité Cross-VM](/developer-guide/cross-vm-interoperability).

---

## stakingtier (v3.2.4) {#stakingtier}

:::note Disponible à partir de la v3.2.4
Le module de paliers de staking est arrivé avec la version **v3.2.4** : il s'exécute sur le testnet `qorechain-diana` depuis le 19 octobre 2026 et sur le mainnet depuis le 23 octobre 2026 (hauteur 3 742 566, proposition de gouvernance 13). Un nœud encore sur une version plus ancienne n'a pas le module et ces commandes sont refusées ; vérifiez d'abord `GET /qorechain/stakingtier/v1/params` sur le nœud que vous ciblez.
:::

Délégations facultatives verrouillées dans le temps : un délégateur peut verrouiller une partie d'une délégation existante pendant 3, 6 ou 12 mois (le verrou minimal est de 10 QOR), puis réclamer plus tard le bonus que le module crédite en échange. Un verrou est un enregistrement posé sur la délégation : les fonds délégués restent auprès du validateur.

```bash
qorechaind tx stakingtier lock <validator_address> <amount_uqor> <months> [flags]    # months: 3, 6 or 12
qorechaind tx stakingtier unlock-early <lock_id> [flags]
qorechaind tx stakingtier claim [flags]
```

Le verrou est appliqué par le serveur de messages de staking ; il couvre donc aussi le retrait de délégation via `authz`, un groupe ou un contrat. Mettre fin à un verrou de manière anticipée fait perdre son bonus non versé et brûle une pénalité ; le montant minimal de verrouillage et les autres paramètres figurent dans `GET /qorechain/stakingtier/v1/params`. Comme toute transaction du lane Cosmos, celles-ci exigent la cosignature hybride (`--generate-only`, puis `tx pqc cosign`) et une limite de gas généreuse (par exemple `--gas 900000 --fees 90000uqor`).

---

## rdk

```bash
qorechaind tx rdk create-rollup <rollup_id> <profile> <stake_amount> [--vm evm|cosmwasm|svm|custom] [flags]
qorechaind tx rdk submit-batch <rollup_id> <batch_index> <state_root_hex> [--prev-state-root <hex>] [--tx-count <n>] [--data-hash <hex>] [--withdrawals-root <hex>] [--validator-set-hash <hex>] [--anchor-signature <hex>] [flags]
qorechaind tx rdk challenge-batch <rollup_id> <batch_index> --proof <hex> [flags]
qorechaind tx rdk pause-rollup <rollup_id> <reason> [flags]
qorechaind tx rdk resume-rollup <rollup_id> [flags]
qorechaind tx rdk stop-rollup <rollup_id> [flags]
qorechaind tx rdk execute-withdrawal <rollup_id> <batch_index> <withdrawal_index> <recipient> <denom> <amount> --proof <hex,hex,...> [flags]
```

`profile` vaut `defi`, `gaming`, `nft`, `enterprise` ou `custom` ; `stake_amount` est exprimé en uqor (le minimum actuel figure dans `query rdk config`). Le préréglage du profil fournit le règlement, le séquenceur, la DA et le modèle de gas ; seule la VM peut être remplacée en ligne de commande. Il n'existe aucune commande `finalize-batch`.

Sur un rollup dont la disponibilité des données est `native` (ou `both`), laissez `--data-hash` vide : aucune transaction ne publie de blob de disponibilité des données, et la chaîne refuse un lot qui déclare un hash de données pour un tel rollup (c'est le comportement de la version de nœud v3.2.4, la version du mainnet au moment de la rédaction). Pour un rollup optimiste, le client `@qorechain/rdk` (0.6.2) fixe la racine d'état d'un lot à la racine de transition canonique de la chaîne (`batchTransitionRoot` dans le RDK) ; voir [Rollups](/rollups/overview).

`--anchor-signature` est la signature ML-DSA du créateur du rollup sur les **octets de signature d'ancrage v2** ; avec elle, le lot est aussi ancré dans le module multilayer. Affichez les octets exacts à signer avec `qorechaind query rdk anchor-sign-bytes <layer_id> <batch_index> <state_root_hex> --tx-count <n> --validator-set-hash <hex>` ; les valeurs doivent correspondre aux drapeaux de `submit-batch`. Depuis la v3.2.3, le module tient un **registre d'entiercement par rollup** : un retrait n'est payé que sur ce que le registre de ce rollup contient, et il est vérifié pour la dénomination, un montant positif, la profondeur de la preuve et la taille des nœuds frères ; l'arrêt d'un rollup ne rembourse que ce qui reste dans son registre, et un rollup arrêté ne paie plus aucun retrait. Au moment de la rédaction, aucun rollup n'existe sur l'un ou l'autre réseau.

---

## multilayer

```bash
qorechaind tx multilayer register-sidechain <layer_id> <description> [--block-time-ms 2000] [--domains defi] [--max-tx 1000] [--min-validators 1] [--settlement-interval 100] [--vm-types evm] [flags]
qorechaind tx multilayer register-paychain <layer_id> <description> [--max-tx 5000] [--settlement-interval 50] [--base-fee-multiplier 0.01] [flags]
qorechaind tx multilayer anchor-state <layer_id> <layer_height> <state_root_hex> <pqc_agg_sig_hex> [flags]
qorechaind tx multilayer route-transaction <payload_hex> [--preferred-layer <id>] [--max-latency-ms 10000] [--max-fee 1000000] [flags]
qorechaind tx multilayer challenge-anchor <layer_id> <anchor_height> <fraud_proof_hex> <reason> [flags]
qorechaind tx multilayer update-layer-status <layer_id> <new_status> <reason> [flags]
```

`new_status` vaut `proposed`, `active`, `suspended` ou `decommissioned`. `update-layer-status` est désactivée sur le mainnet par le disjoncteur (voir ci-dessous).

---

## Messages désactivés ou indisponibles aujourd'hui {#disabled-messages}

Certaines commandes existent dans le binaire mais ne peuvent pas aboutir sur les réseaux en production :

| Commande                                                  | Raison                                                                                         |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `tx wasm store`, `tx wasm instantiate`, `instantiate2`    | Mainnet : l'autorisation de téléversement et d'instanciation est `Nobody` et les trois types de message figurent sur la liste du disjoncteur. Testnet : le téléversement est `Nobody` et `MsgStoreCode` figure sur la liste (la gouvernance enregistre le code), tandis que l'instanciation est ouverte (`Everybody`) et hors de la liste |
| `tx crossvm call`                                         | Désactivée sur le mainnet par le disjoncteur ; activée sur le testnet                          |
| `tx vesting create-vesting-account`, `create-periodic-vesting-account`, `create-permanent-locked-account` | Sur la liste du disjoncteur du mainnet ; depuis la v3.2.3, un compte de vesting ne peut de toute façon être créé que pour le signataire lui-même |
| PQC `MsgDeprecateAlgorithm` / `MsgDisableAlgorithm`        | Messages de proposition de gouvernance (pas de commande CLI), sur la liste du disjoncteur du mainnet ; depuis la v3.2.3, la gouvernance ne peut pas non plus retirer le dernier algorithme de signature actif |
| `tx svm deploy-program`, `execute`, `create-account`      | Le lane de transactions SVM est désactivé sur l'ensemble du réseau                             |
| `tx abstractaccount create`, `register-authenticator`, `execute-cosmos`, `execute-evm` | Mainnet : le module abstract-account est désactivé (`query abstractaccount config` affiche `enabled: false`). Testnet : activé par la gouvernance (`enabled: true`, vérifié le 27 octobre 2026) |
| `tx rlconsensus *`, `tx amm pause-pool`/`resume-pool`      | Messages réservés à l'autorité de gouvernance ; figurent aussi sur la liste du disjoncteur du mainnet |
| `tx license *`                                            | Réservé à l'autorité (les licences sont accordées par l'autorité de licences du réseau ; depuis la v3.2.3, la gouvernance peut remplacer cette autorité avec `MsgUpdateAuthority`) |

La liste en vigueur s'obtient avec `qorechaind query circuit disabled-list`.
