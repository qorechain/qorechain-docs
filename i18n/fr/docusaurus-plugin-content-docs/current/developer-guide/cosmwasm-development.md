---
slug: /developer-guide/cosmwasm-development
title: Développement CosmWasm
sidebar_label: Développement CosmWasm
sidebar_position: 3
---

# Développement CosmWasm

QoreChain prend en charge les contrats intelligents **CosmWasm**, permettant aux développeurs d'écrire des programmes sécurisés et isolés (sandbox) en Rust qui se compilent en WebAssembly. Les contrats CosmWasm s'exécutent aux côtés des programmes EVM et SVM au sein de l'architecture triple-VM de QoreChain.

:::note
Les commandes ci-dessous utilisent le mainnet **`qorechain-vladi`**, en service depuis le 7 juin 2026 et exécutant la version de chaîne **v3.1.80**. Remplacez par `--chain-id qorechain-diana` pour le testnet.
:::

---

## Prérequis

| Dépendance                 | Version       | Objectif                        |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | Dernière version stable | Compilation des contrats           |
| **wasm32-unknown-unknown** | target        | Cible de compilation WebAssembly |
| **cargo-generate**         | Dernière version        | Échafaudage de projet            |
| **cosmwasm-std**           | 1.5+          | Bibliothèque standard CosmWasm      |

Installez la cible Wasm :

```bash
rustup target add wasm32-unknown-unknown
```

---

## Cycle de vie d'un contrat

Les contrats CosmWasm suivent un cycle de vie en cinq étapes : **Compiler**, **Stocker**, **Instancier**, **Exécuter** et **Interroger**.

1. **Compiler** — Compilez votre contrat en WebAssembly optimisé :

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Le fichier `.wasm` optimisé se trouvera dans le répertoire `artifacts/`.

2. **Stocker** — Téléversez le contrat compilé sur la chaîne :

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   Une fois la transaction confirmée, interrogez l'ID de code stocké :

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instancier** — Créez une nouvelle instance de contrat à partir d'un ID de code stocké :

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   | Indicateur                | Description                                    |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | ID numérique renvoyé par la transaction de stockage |
   | `--label`           | Étiquette lisible par l'humain pour cette instance         |
   | `--no-admin`        | Aucune adresse d'admin (le contrat est immuable)       |
   | `--admin <address>` | Définit un admin pouvant migrer le contrat      |

   Récupérez l'adresse du contrat :

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Exécuter** — Appelez le point d'entrée execute d'un contrat pour modifier l'état :

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   Exécuter avec des fonds attachés :

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **Interroger** — Lisez l'état du contrat sans soumettre de transaction :

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Les réponses aux requêtes sont renvoyées au format JSON.

---

## Requêtes utiles

```bash
# List all stored code
qorechaind query wasm list-code

# List all instances of a specific code ID
qorechaind query wasm list-contracts-by-code <code-id>

# Get contract info (code ID, admin, label)
qorechaind query wasm contract <contract-addr>

# Get raw contract state by key
qorechaind query wasm contract-state raw <contract-addr> <key-hex>

# Get full contract state (all keys)
qorechaind query wasm contract-state all <contract-addr>

# Get contract history (instantiate/migrate events)
qorechaind query wasm contract-history <contract-addr>
```

---

## Structure d'un contrat

Un contrat CosmWasm typique possède trois points d'entrée :

```rust
use cosmwasm_std::{
    entry_point, Binary, Deps, DepsMut, Env, MessageInfo,
    Response, StdResult,
};

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    // Initialize contract state
    Ok(Response::new().add_attribute("method", "instantiate"))
}

#[entry_point]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> StdResult<Response> {
    // Handle state-changing operations
    Ok(Response::new().add_attribute("method", "execute"))
}

#[entry_point]
pub fn query(
    deps: Deps,
    _env: Env,
    msg: QueryMsg,
) -> StdResult<Binary> {
    // Handle read-only queries
    Ok(Binary::default())
}
```

---

## Appels inter-VM

Les contrats CosmWasm peuvent interagir avec les contrats déployés sur l'EVM et la SVM via le module `x/crossvm`. Les appels inter-VM depuis CosmWasm utilisent le chemin de message **asynchrone** :

```rust
use cosmwasm_std::{CosmosMsg, CustomMsg};

// Call an EVM contract from CosmWasm
let cross_vm_msg = CosmosMsg::Custom(QoreChainMsg::CrossVMCall {
    target_vm: "evm".to_string(),
    target_contract: "0x1234...abcd".to_string(),
    payload: hex::encode(abi_encoded_data),
    funds: vec![],
});

Ok(Response::new().add_message(cross_vm_msg))
```

Le message est soumis à une file d'attente et traité par l'EndBlocker au bloc suivant. Consultez [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour le cycle de vie complet des messages.

---

## Intégration des modules

Les contrats CosmWasm peuvent interagir avec les modules Cosmos SDK via le passage de messages standard :

```rust
// Send native tokens via the bank module
let send_msg = BankMsg::Send {
    to_address: "qor1recipient...".to_string(),
    amount: vec![Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    }],
};

// Delegate to a validator via the staking module
let delegate_msg = StakingMsg::Delegate {
    validator: "qorvaloper1...".to_string(),
    amount: Coin {
        denom: "uqor".to_string(),
        amount: Uint128::new(1_000_000),
    },
};
```

---

## Migration de contrat

Si le contrat a été instancié avec une adresse `--admin`, l'admin peut le migrer vers un nouvel ID de code :

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

Cela appelle le point d'entrée `migrate` sur le nouveau code avec l'état existant du contrat.

---

## Étapes suivantes

* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) — Appeler des contrats EVM et SVM depuis CosmWasm
* [Développement SVM](/developer-guide/svm-development) — Déployer des programmes BPF sur QoreChain
* [Précompilés EVM](/developer-guide/evm-precompiles) — Accéder aux fonctionnalités PQC et IA depuis Solidity
