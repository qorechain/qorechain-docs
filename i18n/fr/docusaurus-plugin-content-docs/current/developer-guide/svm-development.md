---
slug: /developer-guide/svm-development
title: Développement SVM
sidebar_label: Développement SVM
sidebar_position: 4
---

# Développement SVM

QoreChain inclut un environnement d'exécution **Solana Virtual Machine (SVM)**, permettant aux développeurs de déployer et d'exécuter des programmes SBF/BPF avec les outils Solana habituels. Le module SVM expose une interface JSON-RPC compatible Solana sur le **port 8899**, que `qorechaind start` lance automatiquement (voir [Serveur JSON-RPC](#json-rpc-server) ci-dessous).

:::note
Les commandes ci-dessous utilisent le mainnet **`qorechain-vladi`**, en production depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.82**. Remplacez par `--chain-id qorechain-diana` pour le testnet.
:::

---

## Vue d'ensemble

Le module `x/svm` fournit :

* **Le QOR natif comme actif SVM de premier ordre** — le solde unifié du compte, visible en lamports
* Le déploiement et l'exécution de programmes SBF/BPF
* La création et la gestion de comptes de données
* Un point de terminaison JSON-RPC compatible Solana
* Une correspondance d'adresses bidirectionnelle entre les formats d'adresses QoreChain et Solana
* La mesure du budget de calcul et une économie de stockage basée sur le rent

---

## QOR natif sur l'interface SVM {#native-qor}

Depuis la version de chaîne **v3.1.82**, l'interface SVM est une **interface QOR native de premier ordre**, et non un solde sandbox séparé. Le solde unifié unique du compte — les mêmes fonds visibles en `uqor` sur l'interface Cosmos et en wei à 18 décimales sur l'EVM — apparaît côté SVM en **lamports** (9 décimales) :

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** renvoient le QOR natif du compte (en lamports).
* **`getSignaturesForAddress`** renvoie l'historique des transactions touchant une adresse — utilisable pour la détection des dépôts avec les outils Solana standard.
* **Les transferts du System Program déplacent du QOR natif** — une instruction de transfert de style Solana déplace les mêmes fonds qu'un `MsgSend` Cosmos ou qu'un transfert EVM.
* **Forme d'adresse SVM** — l'adresse SVM d'un compte correspond à ses 20 octets de compte complétés à droite jusqu'à 32 octets puis encodés en base58. Les trois formes d'adresse (`qor1...`, `0x...`, base58) désignent le même compte.

Les points de terminaison publics (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sont **en lecture seule** — la soumission de transactions est désactivée en périphérie. Exécutez votre propre nœud (port 8899) pour soumettre des transactions SVM.

---

## Serveur JSON-RPC {#json-rpc-server}

Le serveur JSON-RPC compatible Solana est **démarré par `qorechaind start`** et est **activé par défaut**. Il se configure via une section `[svm-rpc]` dans `app.toml` :

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Les valeurs par défaut sont `enable = true` et `address = "127.0.0.1:8899"`, de sorte qu'un nœud fraîchement démarré sert déjà l'interface JSON-RPC Solana sur le port 8899 — `@solana/web3.js` se connecte à `http://127.0.0.1:8899` sans configuration supplémentaire. `getVersion` renvoie `1.18.0-qorechain`, et `getBalance` / `getAccountInfo` renvoient les comptes SVM on-chain en temps réel.

| Propriété      | Valeur                    |
| -------------- | ------------------------- |
| URL par défaut | `http://127.0.0.1:8899`   |
| Activé         | Oui, par défaut           |
| Démarré par    | `qorechaind start`        |
| Compatibilité  | JSON-RPC Solana (sous-ensemble) |
| `getVersion`   | `1.18.0-qorechain`        |

### Méthodes prises en charge

| Méthode                             | Description                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Récupérer les données du compte et le solde en lamports |
| `getBalance`                        | Obtenir le solde du compte en lamports (QOR natif) |
| `getSignaturesForAddress`           | Historique des transactions pour une adresse |
| `getSlot`                           | Numéro de slot actuel                     |
| `getMinimumBalanceForRentExemption` | Solde minimum pour une taille de données donnée |
| `getVersion`                        | Informations de version du runtime SVM    |
| `getHealth`                         | Vérification de l'état du point de terminaison SVM |

---

## Déployer des programmes et interagir avec eux

:::info
**Exécution SBF moderne.** Le moteur d'exécution SVM a été modernisé sur **solana-sbpf 0.21.1**, de sorte que les programmes SBF fraîchement compilés avec la chaîne d'outils Solana actuelle (**platform-tools v1.53 / agave 4.x**) se **déploient et s'exécutent** sur QoreChain — l'exécution est entièrement prise en charge, pas seulement le déploiement. Les programmes compilés avec `cargo build-sbf --arch v0` ou `--arch v3` sont pris en charge.
:::

1. **Déployer un programme SBF** — Compilez votre programme Solana en objet partagé SBF avec les platform-tools actuels (v1.53 / agave 4.x), puis déployez-le sur QoreChain :

   ```bash
   # Build with the current Solana toolchain (--arch v0 or --arch v3)
   cargo build-sbf --arch v3

   # Deploy the compiled program
   qorechaind tx svm deploy-program ./my_program.so \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   La réponse de la transaction inclut l'**identifiant du programme (program ID)** au format base58.

2. **Exécuter une instruction** — Appelez un programme BPF on-chain avec des données d'instruction :

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Paramètre           | Format            | Description                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Chaîne base58     | L'adresse du programme déployé |
   | `data-hex`          | Octets encodés en hexadécimal | Données d'instruction sérialisées |

3. **Créer un compte de données** — Les programmes ont souvent besoin de comptes pour stocker leur état. Créez-en un avec une taille et un propriétaire spécifiés :

   ```bash
   # Create data account
   qorechaind tx svm create-account <owner-base58> <space> <lamports> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Paramètre      | Description                                        |
   | -------------- | -------------------------------------------------- |
   | `owner-base58` | Le programme propriétaire de ce compte (base58)    |
   | `space`        | Taille du champ de données en octets               |
   | `lamports`     | Solde initial (doit atteindre le minimum d'exemption de rent) |

   Interrogez le solde minimum exempté de rent pour une taille donnée :

   ```bash
   # RPC: getMinimumBalanceForRentExemption
   curl -X POST http://localhost:8899 \
     -H "Content-Type: application/json" \
     -d '{
       "jsonrpc": "2.0",
       "id": 1,
       "method": "getMinimumBalanceForRentExemption",
       "params": [1024]
     }'
   ```

4. **Utiliser @solana/web3.js** — Le SDK JavaScript Solana fonctionne directement avec le point de terminaison SVM de QoreChain :

   ```javascript
   import { Connection, PublicKey } from "@solana/web3.js";

   const connection = new Connection("http://127.0.0.1:8899");

   // Check health
   const health = await connection.getHealth();
   console.log("SVM health:", health);

   // Get slot
   const slot = await connection.getSlot();
   console.log("Current slot:", slot);

   // Get account info
   const pubkey = new PublicKey("YourBase58ProgramId...");
   const accountInfo = await connection.getAccountInfo(pubkey);
   console.log("Account data:", accountInfo);

   // Get balance
   const balance = await connection.getBalance(pubkey);
   console.log("Balance (lamports):", balance);
   ```

---

## Correspondance d'adresses

QoreChain maintient une **correspondance d'adresses bidirectionnelle** entre les adresses Bech32 natives (`qor1...`) et les adresses base58 de style Solana :

| Direction      | Exemple                                                    |
| -------------- | ---------------------------------------------------------- |
| Natif vers SVM | `qor1abc...xyz` correspond à une adresse base58 déterministe |
| SVM vers natif | Les adresses de programme base58 correspondent à leurs équivalents `qor1...` |

La correspondance est déterministe et gérée par le module `x/svm`. Les deux représentations désignent le même compte sous-jacent.

---

## Modèle de rent

Le module SVM utilise un **modèle de stockage basé sur le rent** pour éviter le gonflement de l'état :

| Paramètre                          | Valeur       |
| ---------------------------------- | ------------ |
| Lamports par octet et par an       | `3,480`      |
| Multiplicateur d'exemption de rent | `2.0`        |
| Fréquence de collecte              | Chaque epoch |

* Les comptes dont le solde est **supérieur** à `2 * (data_size * 3480 / seconds_per_year)` en lamports sont **exemptés de rent** et ne sont jamais facturés.
* Les comptes **en dessous** du seuil d'exemption de rent se voient facturer un rent à chaque epoch. Si le solde atteint zéro, le compte est purgé.

:::info
**Bonne pratique :** approvisionnez toujours les comptes de données au-dessus du minimum d'exemption de rent pour éviter une suppression inattendue du compte.
:::

---

## Budget de calcul

Chaque exécution d'instruction est mesurée en unités de calcul :

| Paramètre                                        | Valeur      |
| ------------------------------------------------ | ----------- |
| Unités de calcul max par instruction             | `1,400,000` |
| Profondeur CPI max (invocation inter-programmes) | `4`         |
| Taille max de programme                          | `10 MB`     |
| Taille max des données de compte                 | `10 MB`     |

Les programmes qui dépassent le budget de calcul sont arrêtés et la transaction est annulée.

---

## Récapitulatif des paramètres

| Paramètre                   | Valeur       |
| --------------------------- | ------------ |
| `max_program_size`          | 10 MB        |
| `max_account_data_size`     | 10 MB        |
| `compute_budget_max`        | 1,400,000 CU |
| `max_cpi_depth`             | 4            |
| `lamports_per_byte_year`    | 3,480        |
| `rent_exemption_multiplier` | 2.0          |
| Port JSON-RPC               | 8899         |

---

## Interopérabilité cross-VM

Les programmes SVM peuvent communiquer avec les contrats EVM et CosmWasm via le chemin de messages cross-VM **asynchrone** :

```bash
# Cross-VM call example
qorechaind tx crossvm call \
  --source-vm svm \
  --target-vm evm \
  --target-contract 0x1234...abcd \
  --payload '...' \
  --from mykey \
  -y
```

Les messages sont mis en file d'attente et traités par l'EndBlocker. Consultez [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) pour plus de détails sur le cycle de vie des messages et le comportement des timeouts.

---

## Prochaines étapes

* [Interopérabilité cross-VM](/developer-guide/cross-vm-interoperability) — Communication entre SVM, EVM et CosmWasm
* [Développement EVM](/developer-guide/evm-development) — Contrats intelligents Solidity sur QoreChain
* [Développement CosmWasm](/developer-guide/cosmwasm-development) — Contrats WebAssembly en Rust
