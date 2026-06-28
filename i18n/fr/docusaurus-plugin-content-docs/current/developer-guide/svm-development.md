---
slug: /developer-guide/svm-development
title: Développement SVM
sidebar_label: Développement SVM
sidebar_position: 4
---

# Développement SVM

QoreChain inclut un environnement d'exécution **Solana Virtual Machine (SVM)**, permettant aux développeurs de déployer et d'exécuter des programmes SBF/BPF à l'aide de l'outillage Solana familier. Le module SVM expose une interface JSON-RPC compatible Solana sur le **port 8899**, que `qorechaind start` lance automatiquement (voir [Serveur JSON-RPC](#json-rpc-server) ci-dessous).

:::note
Les commandes ci-dessous utilisent le mainnet **`qorechain-vladi`**, en service depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.80**. Remplacez par `--chain-id qorechain-diana` pour le testnet.
:::

---

## Vue d'ensemble

Le module `x/svm` fournit :

* Le déploiement et l'exécution de programmes SBF/BPF
* La création et la gestion de comptes de données
* Un point de terminaison JSON-RPC compatible Solana
* Le mappage d'adresses bidirectionnel entre les formats d'adresse QoreChain et Solana
* La comptabilisation du budget de calcul et l'économie de stockage basée sur le loyer (rent)

---

## Serveur JSON-RPC {#json-rpc-server}

Le serveur JSON-RPC compatible Solana est **lancé par `qorechaind start`** et est **activé par défaut**. Il se configure via une section `[svm-rpc]` dans `app.toml` :

```toml
[svm-rpc]
# Enable the Solana-compatible JSON-RPC server
enable = true
# Address the server listens on
address = "127.0.0.1:8899"
```

Les valeurs par défaut sont `enable = true` et `address = "127.0.0.1:8899"`, de sorte qu'un nœud fraîchement démarré sert déjà l'interface JSON-RPC Solana sur le port 8899 — `@solana/web3.js` se connecte à `http://127.0.0.1:8899` sans configuration supplémentaire. `getVersion` retourne `1.18.0-qorechain`, et `getBalance` / `getAccountInfo` renvoient les comptes SVM réels présents sur la chaîne.

| Propriété     | Valeur                    |
| ------------- | ------------------------- |
| URL par défaut | `http://127.0.0.1:8899`   |
| Activé        | Oui, par défaut           |
| Lancé par     | `qorechaind start`        |
| Compatibilité | Solana JSON-RPC (sous-ensemble)  |
| `getVersion`  | `1.18.0-qorechain`        |

### Méthodes prises en charge

| Méthode                             | Description                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Récupère les données du compte et le solde en lamports |
| `getBalance`                        | Obtient le solde du compte en lamports    |
| `getSlot`                           | Numéro de slot courant                     |
| `getMinimumBalanceForRentExemption` | Solde minimum pour une taille de données donnée |
| `getVersion`                        | Informations sur la version du runtime SVM |
| `getHealth`                         | Contrôle de santé du point de terminaison SVM |

---

## Déploiement et interaction avec les programmes

:::info
**Exécution SBF moderne.** Le moteur d'exécution SVM a été modernisé sur **solana-sbpf 0.21.1**, de sorte que les programmes SBF fraîchement compilés avec la chaîne d'outils Solana actuelle (**platform-tools v1.53 / agave 4.x**) se **déploient et s'exécutent** tous deux sur QoreChain — l'exécution est entièrement prise en charge, et non limitée au déploiement. Les programmes compilés avec `cargo build-sbf --arch v0` ou `--arch v3` sont pris en charge.
:::

1. **Déployer un programme SBF** — Compilez votre programme Solana en un objet partagé SBF avec les platform-tools actuels (v1.53 / agave 4.x), puis déployez-le sur QoreChain :

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

   La réponse de la transaction inclut l'**ID du programme** au format base58.

2. **Exécuter une instruction** — Appelez un programme BPF présent sur la chaîne avec des données d'instruction :

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas auto \
     -y
   ```

   | Paramètre           | Format            | Description                    |
   | ------------------- | ----------------- | ------------------------------ |
   | `program-id-base58` | Chaîne Base58     | L'adresse du programme déployé |
   | `data-hex`          | Octets encodés en hex | Données d'instruction sérialisées |

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
   | `lamports`     | Solde initial (doit atteindre le minimum d'exemption de loyer) |

   Interrogez le solde minimum d'exemption de loyer pour une taille donnée :

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

4. **Utiliser @solana/web3.js** — Le SDK JavaScript de Solana fonctionne directement avec le point de terminaison SVM de QoreChain :

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

## Mappage d'adresses

QoreChain maintient un **mappage d'adresses bidirectionnel** entre les adresses natives Bech32 (`qor1...`) et les adresses base58 de style Solana :

| Direction     | Exemple                                                    |
| ------------- | ---------------------------------------------------------- |
| Natif vers SVM | `qor1abc...xyz` mappe vers une adresse base58 déterministe |
| SVM vers natif | Les adresses base58 des programmes remappent vers leurs équivalents `qor1...` |

Le mappage est déterministe et géré par le module `x/svm`. Les deux représentations désignent le même compte sous-jacent.

---

## Modèle de loyer

Le module SVM utilise un **modèle de stockage basé sur le loyer** pour éviter le gonflement de l'état :

| Paramètre                  | Valeur     |
| -------------------------- | ---------- |
| Lamports par octet par an | `3,480`    |
| Multiplicateur d'exemption de loyer  | `2.0`      |
| Fréquence de collecte         | Chaque epoch |

* Les comptes dont le solde est **supérieur** à `2 * (data_size * 3480 / seconds_per_year)` en lamports sont **exempts de loyer** et ne sont jamais débités.
* Les comptes dont le solde est **inférieur** au seuil d'exemption de loyer sont débités du loyer à chaque epoch. Si le solde atteint zéro, le compte est purgé.

:::info
**Bonne pratique :** Approvisionnez toujours les comptes de données au-dessus du minimum d'exemption de loyer pour éviter une suppression inattendue du compte.
:::

---

## Budget de calcul

Chaque exécution d'instruction est comptabilisée en unités de calcul :

| Paramètre                                | Valeur      |
| ---------------------------------------- | ----------- |
| Unités de calcul max par instruction        | `1,400,000` |
| Profondeur CPI (cross-program invocation) max | `4`         |
| Taille de programme max                         | `10 MB`     |
| Taille de données de compte max                    | `10 MB`     |

Les programmes qui dépassent le budget de calcul sont arrêtés et la transaction est annulée.

---

## Résumé des paramètres

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

## Interopérabilité inter-VM

Les programmes SVM peuvent communiquer avec les contrats EVM et CosmWasm via le chemin de message inter-VM **asynchrone** :

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

Les messages sont mis en file d'attente et traités par l'EndBlocker. Voir [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour les détails sur le cycle de vie des messages et le comportement de timeout.

---

## Étapes suivantes

* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) — Communication entre SVM, EVM et CosmWasm
* [Développement EVM](/developer-guide/evm-development) — Contrats intelligents Solidity sur QoreChain
* [Développement CosmWasm](/developer-guide/cosmwasm-development) — Contrats WebAssembly basés sur Rust
