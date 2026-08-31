---
slug: /developer-guide/svm-development
title: Développement SVM
sidebar_label: Développement SVM
sidebar_position: 4
---

# Développement SVM

QoreChain intègre un environnement d'exécution **Solana Virtual Machine (SVM)**, qui permet aux développeurs de déployer et d'exécuter des programmes SBF/BPF avec les outils Solana habituels. Le module SVM expose une interface JSON-RPC compatible Solana sur le **port 8899**, que `qorechaind start` lance automatiquement (voir [Serveur JSON-RPC](#json-rpc-server) ci-dessous).

:::note
Les commandes ci-dessous utilisent le mainnet **`qorechain-vladi`**, en service depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.95**. Remplacez par `--chain-id qorechain-diana` pour le testnet.
:::

---

:::caution La soumission de transactions SVM est actuellement désactivée
Depuis la version de chaîne v3.1.89 (22 août), à la suite d'un incident, la voie d'exécution SVM est **désactivée sur l'ensemble du réseau pour la soumission de transactions** — toute transaction envoyée à `x/svm` (déploiement de programme, exécution d'instruction, création de compte, transferts) renvoie `code 11, "SVM module is disabled"`. Cela s'applique aussi bien à votre propre nœud qu'aux points de terminaison publics. Les méthodes RPC de type lecture peuvent encore répondre, mais ne construisez ni ne répétez d'intégration SVM en conditions réelles tant que la voie n'est pas rouverte — il s'agit d'une désactivation au moment de la compilation, et non d'un paramètre d'exécution, elle ne peut donc pas être réactivée par un vote de gouvernance ; elle devrait rester désactivée jusqu'à ce qu'un audit externe la valide.
:::

## Vue d'ensemble

Le module `x/svm` fournit :

* **Le QOR natif comme actif SVM de premier ordre** — le solde unifié du compte, visible en lamports
* Le déploiement et l'exécution de programmes SBF/BPF
* La création et la gestion de comptes de données
* Un point de terminaison JSON-RPC compatible Solana
* Un mappage d'adresses bidirectionnel entre les formats d'adresse QoreChain et Solana
* La mesure du budget de calcul et une économie de stockage basée sur le loyer (rent)

---

## QOR natif sur l'interface SVM {#native-qor}

Depuis la version de chaîne **v3.1.82**, l'interface SVM est une **interface QOR native de premier ordre**, et non un solde de bac à sable séparé. Le solde unifié unique du compte — les mêmes fonds visibles en `uqor` sur l'interface Cosmos et en wei à 18 décimales sur l'EVM — apparaît côté SVM en **lamports** (9 décimales) :

```
1 uqor = 1,000 lamports    ·    1 QOR = 1,000,000,000 lamports
```

* **`getBalance` / `getAccountInfo`** renvoient le QOR natif du compte (en lamports).
* **`getSignaturesForAddress`** renvoie l'historique des transactions touchant une adresse — utilisable pour la détection de dépôts avec les outils Solana standards.
* **Les transferts du System Program déplacent du QOR natif** — une instruction de transfert de style Solana déplace les mêmes fonds qu'un `MsgSend` Cosmos ou un transfert EVM.
* **Forme de l'adresse SVM** — l'adresse SVM d'un compte correspond à ses 20 octets de compte complétés à droite jusqu'à 32 octets et encodés en base58. Les trois formes d'adresse (`qor1...`, `0x...`, base58) désignent le même compte.

Les points de terminaison publics (`https://svm.qore.host`, `https://svm-testnet.qore.host`) sont **en lecture seule** — la soumission de transactions est désactivée en périphérie. Normalement, vous feriez tourner votre propre nœud (port 8899) pour soumettre des transactions SVM, mais voir la mise en garde ci-dessus : la voie de transaction `x/svm` elle-même est actuellement désactivée sur l'ensemble du réseau, y compris sur votre propre nœud.

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

Les valeurs par défaut sont `enable = true` et `address = "127.0.0.1:8899"` : un nœud fraîchement démarré sert donc déjà l'interface JSON-RPC Solana sur le port 8899 — `@solana/web3.js` se connecte à `http://127.0.0.1:8899` sans configuration supplémentaire. `getVersion` renvoie `1.18.0-qorechain`, et `getBalance` / `getAccountInfo` renvoient les comptes SVM en direct sur la chaîne.

| Propriété     | Valeur                     |
| ------------- | ------------------------- |
| URL par défaut | `http://127.0.0.1:8899`   |
| Activé        | Oui, par défaut           |
| Démarré par   | `qorechaind start`        |
| Compatibilité | JSON-RPC Solana (sous-ensemble)  |
| `getVersion`  | `1.18.0-qorechain`        |

### Méthodes prises en charge

| Méthode                              | Description                               |
| ----------------------------------- | ----------------------------------------- |
| `getAccountInfo`                    | Récupère les données du compte et le solde en lamports |
| `getBalance`                        | Obtient le solde du compte en lamports (QOR natif) |
| `getSignaturesForAddress`           | Historique des transactions pour une adresse        |
| `getSlot`                           | Numéro de slot actuel     |
| `getMinimumBalanceForRentExemption` | Solde minimum pour une taille de données donnée     |
| `getVersion`                        | Informations de version du runtime SVM      |
| `getHealth`                         | Contrôle de santé du point de terminaison SVM         |

---

## Déployer et interagir avec des programmes

:::info
**Exécution SBF moderne.** Le moteur d'exécution SVM a été modernisé sur **solana-sbpf 0.21.1** : les programmes SBF fraîchement compilés avec la chaîne d'outils Solana actuelle (**platform-tools v1.53 / agave 4.x**) se **déploient et s'exécutent** tous deux sur QoreChain — l'exécution est entièrement prise en charge, pas seulement le déploiement. Les programmes compilés avec `cargo build-sbf --arch v0` ou `--arch v3` sont pris en charge.
:::

1. **Déployer un programme SBF** — Compilez votre programme Solana en objet partagé SBF avec la chaîne d'outils platform-tools actuelle (v1.53 / agave 4.x), puis déployez-le sur QoreChain :

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

2. **Exécuter une instruction** — Appelez un programme BPF sur la chaîne avec des données d'instruction :

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
   | `data-hex`          | Octets encodés en hexadécimal | Données d'instruction sérialisées    |

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
   | `owner-base58` | Le programme propriétaire de ce compte (base58)        |
   | `space`        | Taille du champ de données en octets                    |
   | `lamports`     | Solde initial (doit atteindre le minimum d'exemption de loyer) |

   Interrogez le solde minimum exempté de loyer pour une taille donnée :

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

## Mappage d'adresses

QoreChain maintient un **mappage d'adresses bidirectionnel** entre les adresses Bech32 natives (`qor1...`) et les adresses base58 de style Solana :

| Direction     | Exemple                                                    |
| ------------- | ---------------------------------------------------------- |
| Native vers SVM | `qor1abc...xyz` correspond à une adresse base58 déterministe     |
| SVM vers native | Les adresses de programme base58 correspondent en retour aux équivalents `qor1...` |

Ce mappage est déterministe et géré par le module `x/svm`. Les deux représentations désignent le même compte sous-jacent.

---

## Modèle de loyer (rent)

Le module SVM utilise un **modèle de stockage basé sur le loyer** pour éviter la prolifération de l'état :

| Paramètre                  | Valeur      |
| -------------------------- | ---------- |
| Lamports par octet par an | `3,480`    |
| Multiplicateur d'exemption de loyer  | `2.0`      |
| Fréquence de collecte       | Chaque epoch |

* Les comptes dont le solde est **supérieur** à `2 * (data_size * 3480 / seconds_per_year)` lamports sont **exemptés de loyer** et ne sont jamais facturés.
* Les comptes **en dessous** du seuil d'exemption de loyer sont facturés à chaque epoch. Si le solde atteint zéro, le compte est purgé.

:::info
**Bonne pratique :** financez toujours les comptes de données au-delà du minimum d'exemption de loyer pour éviter une suppression de compte inattendue.
:::

---

## Budget de calcul

Chaque exécution d'instruction est mesurée en unités de calcul :

| Paramètre                                | Valeur       |
| ---------------------------------------- | ----------- |
| Unités de calcul maximum par instruction        | `1,400,000` |
| Profondeur maximale de CPI (appel inter-programmes) | `4`         |
| Taille maximale de programme         | `10 MB`     |
| Taille maximale des données de compte    | `10 MB`     |

Les programmes qui dépassent le budget de calcul sont interrompus et la transaction est annulée.

---

## Récapitulatif des paramètres

| Paramètre                   | Valeur        |
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

Les programmes SVM peuvent communiquer avec des contrats EVM et CosmWasm via la voie de messages inter-VM **asynchrone** :

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

Les messages sont mis en file d'attente et traités par l'EndBlocker. Voir [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour plus de détails sur le cycle de vie des messages et le comportement en cas de délai dépassé.

---

## Étapes suivantes

* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) — Communication entre SVM, EVM et CosmWasm
* [Développement EVM](/developer-guide/evm-development) — Contrats intelligents Solidity sur QoreChain
* [Développement CosmWasm](/developer-guide/cosmwasm-development) — Contrats WebAssembly basés sur Rust
