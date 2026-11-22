---
slug: /developer-guide/svm-development
title: Développement SVM
sidebar_label: Développement SVM
sidebar_position: 4
---

# Développement SVM

QoreChain intègre un environnement d'exécution **Solana Virtual Machine (SVM)**, qui permet aux développeurs de déployer et d'exécuter des programmes SBF/BPF avec les outils Solana habituels. Le module SVM expose une interface JSON-RPC compatible Solana sur le **port 8899**, que `qorechaind start` lance automatiquement (voir [Serveur JSON-RPC](#json-rpc-server) ci-dessous).

:::note
Les commandes ci-dessous utilisent le mainnet **`qorechain-vladi`** (en service depuis le 7 juin 2026), qui exécute la version de nœud **v3.2.8** depuis le 18 novembre 2026 (proposition de gouvernance 17, hauteur 4,273,000 ; la v3.2.7 depuis le 12 novembre 2026 ; la v3.2.6 depuis le 4 novembre 2026 ; la v3.2.5 depuis le 29 octobre 2026, la v3.2.4 depuis le 23 octobre 2026). Remplacez par `--chain-id qorechain-diana` pour le testnet, qui exécute la v3.2.9 (depuis le 20 novembre 2026 ; la v3.2.8 depuis le 12 novembre, la v3.2.4 depuis le 19 octobre 2026). **Les transactions SVM sont ouvertes sur le testnet** (proposition de gouvernance 37) et **désactivées sur le mainnet** : les commandes `tx svm` de cette page ne peuvent donc aboutir que sur le testnet ; pour le parcours complet sur le testnet, voir [SVM sur le testnet (v3.2.9)](/developer-guide/svm-testnet-v329).
:::

---

:::note État de la voie SVM (vérifié le 22 novembre 2026)
Sur le testnet **`qorechain-diana`**, la voie SVM est **ouverte** depuis la proposition de gouvernance 37 (12 novembre 2026), et la version v3.2.9 ajoute les transactions filaires Solana et les fenêtres SVM : voir [SVM sur le testnet](/developer-guide/svm-testnet-v329). Sur le mainnet **`qorechain-vladi`**, la voie est **désactivée** : toute transaction `x/svm` y renvoie `code 11, "SVM module is disabled"`. Lisez `GET /qorechain/svm/v1/params` et vérifiez `enabled` avant de développer.
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

**Version v3.2.8 (testnet depuis le 12 novembre 2026, mainnet depuis le 18 novembre 2026).** La mise à niveau ferme la voie SVM sur `qorechain-diana` : les écritures SVM échouent, `MsgRegisterSVMPQCKey` est refusé, et le JSON-RPC SVM refuse les méthodes d'écriture sur les identifiants de chaîne publics, jusqu'à ce qu'un vote de gouvernance la rouvre (le testnet dispose d'un interrupteur gouverné). Sur le mainnet, la voie reste désactivée (lu le 19 novembre 2026 : `enabled` à `false`). Les clients doivent lire l'état de la voie dans les paramètres du module SVM (`enabled`) avant de proposer des actions SVM.

Les points de terminaison publics (`https://svm.qore.host`, `https://svm-testnet.qore.host`) servent les lectures. Le 22 novembre 2026, la passerelle publique du testnet ne relayait pas `sendTransaction` (elle répondait qu'aucune clé de relayeur n'est définie) : pour soumettre des transactions SVM sur le testnet, vous envoyez vous-même la transaction porteuse ou vous exécutez votre propre nœud (port 8899). Voir [SVM sur le testnet](/developer-guide/svm-testnet-v329#relay). Sur le mainnet, la voie est désactivée.

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
| `getGenesisHash`                    | Genesis hash du cluster (depuis la v3.2.7 : testnet dès le 6 novembre 2026, mainnet dès le 12 novembre 2026 ; base58) |

**Identité du cluster (v3.2.7).** Les wallets qui suivent le Wallet Standard ont besoin d'une identité de cluster stable. À partir de la version v3.2.7 (testnet depuis le 6 novembre 2026, mainnet depuis le 12 novembre 2026), le nœud sert le genesis hash du cluster et son identifiant de chaîne Wallet Standard. Sur le testnet, le 7 novembre 2026, `GET /qorechain/svm/v1/cluster_info` a répondu avec `chain_id` `qorechain-diana`, un `genesis_hash`, un `caip2_chain_id` (`solana:` suivi des 32 premiers caractères du genesis hash) et `execution_enabled` `false`, et `getGenesisHash` sur `https://svm-testnet.qore.host` a renvoyé le même genesis hash. Le hash est dérivé du chain id, et non d'un véritable cluster Solana. **L'exécution SVM reste désactivée sur les deux réseaux** ; cela ne fait qu'identifier le cluster. Le 12 novembre 2026, la même route sur le mainnet a répondu `200` avec `chain_id` `qorechain-vladi`, son propre genesis hash et `execution_enabled` `false`.

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
     --gas 2000000 --fees 200000uqor \
     --generate-only > tx.json
   ```

   Sur un réseau où la voie est activée, chaque commande `tx svm` est une transaction de la voie Cosmos : signez et diffusez `tx.json` avec `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>`, et définissez une limite de gas explicite avec des frais d'au moins gas × 0,1 uqor. La réponse de la transaction inclut l'**ID du programme** au format base58.

2. **Exécuter une instruction** — Appelez un programme BPF sur la chaîne avec des données d'instruction :

   ```bash
   # Execute instruction
   qorechaind tx svm execute <program-id-base58> <data-hex> \
     --from mykey \
     --gas 400000 --fees 40000uqor \
     --generate-only > tx.json
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
     --gas 400000 --fees 40000uqor \
     --generate-only > tx.json
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

Les programmes SVM sont conçus pour communiquer avec des contrats EVM et QoreChain Native via le message `MsgCrossVMCall` du module `x/crossvm` (la chaîne détermine elle-même la voie source). Les appels inter-VM sont suspendus sur le mainnet et la voie SVM y est désactivée : il n'existe donc aucun chemin inter-VM SVM sur le mainnet. Sur le testnet, la voie SVM est ouverte et les règles de la v3.2.9 se trouvent dans [SVM sur le testnet](/developer-guide/svm-testnet-v329). Voir [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour connaître l'état actuel, le cycle de vie des messages et le comportement en cas de délai dépassé.

---

## Étapes suivantes

* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) — Communication entre SVM, EVM et QoreChain Native
* [Développement EVM](/developer-guide/evm-development) — Contrats intelligents Solidity sur QoreChain
* [Développement QoreChain Native](/developer-guide/cosmwasm-development) — Contrats WebAssembly basés sur Rust
