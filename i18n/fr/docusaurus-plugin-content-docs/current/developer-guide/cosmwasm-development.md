---
slug: /developer-guide/cosmwasm-development
title: Développement QoreChain Native
sidebar_label: Développement QoreChain Native
sidebar_position: 3
---

# Développement QoreChain Native

QoreChain prend en charge les contrats intelligents **QoreChain Native**. QoreChain Native est le nom que QoreChain donne à son runtime **CosmWasm** : les développeurs écrivent des programmes sécurisés et isolés (sandboxed) en Rust avec les bibliothèques CosmWasm standard (`cosmwasm-std`) et les compilent vers WebAssembly. Les contrats QoreChain Native s'exécutent aux côtés des programmes EVM et SVM au sein de l'architecture triple-VM de QoreChain.

:::note
Les commandes ci-dessous utilisent le mainnet **`qorechain-vladi`** (actif depuis le 7 juin 2026), qui exécute la version de nœud **v3.2.4** depuis le 23 octobre 2026 (proposition de gouvernance 13, hauteur 3 742 566). Remplacez par `--chain-id qorechain-diana` pour le testnet, qui exécute la v3.2.6 (v3.2.4 depuis le 19 octobre 2026).
:::

:::caution Le téléversement et l'instanciation de code nécessitent une permission explicite sur le mainnet ; le testnet diffère
Au moment de la rédaction (vérifié le 27 octobre 2026), `code_upload_access` et `instantiate_default_permission` sont tous deux définis sur **`Nobody`** sur le **mainnet**, ce qui signifie que `MsgStoreCode` et `MsgInstantiateContract` ne sont pas ouverts à des comptes arbitraires, suite à un avis de sécurité de l'industrie portant sur CosmWasm, le runtime sur lequel QoreChain Native est construit. Sur le **testnet `qorechain-diana`**, les réglages diffèrent : `code_upload_access` reste `Nobody` (le code n'est stocké que par la gouvernance), mais `instantiate_default_permission` est **`Everybody`**, défini par la gouvernance du testnet le 27 octobre 2026 ; tout compte peut donc instancier un code stocké dont la propre permission l'autorise. Vérifiez d'abord les paramètres en vigueur, car c'est exactement le type de réglage que la gouvernance peut modifier (le mainnet ne contient actuellement aucun code de contrat stocké) :

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

Le disjoncteur (circuit breaker) de la chaîne désactive aussi des types de message à l'échelle du réseau (`qorechaind query circuit disabled-list`). Sur le **mainnet**, `MsgStoreCode`, `MsgInstantiateContract` et `MsgInstantiateContract2` figurent sur la liste ; relever la permission seule ne suffit donc pas tant que ces entrées ne sont pas levées. Sur le **testnet**, seul `MsgStoreCode` figure sur la liste : l'instanciation est ouverte, pas le téléversement.

**Testnet : contrats revus et stockés par la gouvernance.** Les comptes ordinaires ne pouvant pas téléverser de code sur le testnet, la gouvernance a stocké cinq contrats revus que n'importe qui peut instancier (`instantiate_permission` `Everybody`) : cw20-base (jeton), cw721-base (collection de NFT), cw4-group, cw3-fixed-multisig et un petit contrat compteur. Au moment de la rédaction, ce sont les code ids 859 à 863, dans cet ordre, listés par `GET /cosmwasm/wasm/v1/code` avec le compte de module de gouvernance comme créateur et identifiés par leur `data_hash` ; lisez les ids dans la liste en direct plutôt que de les coder en dur. Ils n'existent que sur le testnet. Le mainnet n'a aucun code stocké.

Cette restriction n'affecte pas les contrats déjà instanciés — `execute` et `query` sur un contrat existant fonctionnent normalement quel que soit ce réglage.
:::

:::caution Signer avec `tx pqc cosign`
Le mainnet et le testnet exigent une signature post-quantique hybride sur chaque transaction de la voie Cosmos ; les commandes `tx` de cette page ne diffusent donc pas la transaction telles quelles. Elles construisent la transaction avec `--generate-only > tx.json` ; signez et diffusez-la ensuite avec `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` (le binaire de la release issu du [manifeste de téléchargement](/developer-guide/running-a-node#fetch-the-manifest) inclut le signataire ; un build à partir du code source public ne l'inclut pas). Le plancher de frais du réseau est de **0,1 uqor par unité de gas**, ce que traduit `--gas-prices 0.1uqor` ; la signature hybride ajoute environ 47 000 gas qu'une simulation n'inclut pas, d'où l'ajustement de `1.5`. Voir [Signature post-quantique](/developer-guide/post-quantum-signing).
:::

---

## Prérequis

| Dépendance                 | Version       | Objectif                        |
| -------------------------- | ------------- | ------------------------------- |
| **Rust**                   | Dernière stable | Compilation du contrat         |
| **wasm32-unknown-unknown** | cible         | Cible de compilation WebAssembly |
| **cargo-generate**         | Dernière      | Génération de la structure du projet |
| **cosmwasm-std**           | 1.5+          | Bibliothèque standard CosmWasm           |

Installez la cible Wasm :

```bash
rustup target add wasm32-unknown-unknown
```

---

## Cycle de vie du contrat

Les contrats QoreChain Native suivent un cycle de vie en cinq étapes : **Build** (construire), **Store** (stocker), **Instantiate** (instancier), **Execute** (exécuter) et **Query** (interroger).

1. **Build** — Compilez votre contrat en WebAssembly optimisé :

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Le fichier `.wasm` optimisé se trouvera dans le répertoire `artifacts/`.

2. **Store** — Téléversez le contrat compilé vers la chaîne :

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Une fois la transaction confirmée (signez et diffusez `tx.json` avec `tx pqc cosign` comme décrit ci-dessus), interrogez l'ID de code stocké :

   ```bash
   qorechaind query wasm list-code
   ```

3. **Instantiate** — Créez une nouvelle instance de contrat à partir d'un ID de code stocké :

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | Flag                | Description                                       |
   | ------------------- | ------------------------------------------------- |
   | `<code-id>`         | ID numérique renvoyé par la transaction de stockage |
   | `--label`           | Étiquette lisible pour cette instance               |
   | `--no-admin`        | Aucune adresse admin (le contrat est immuable)      |
   | `--admin <address>` | Définit un admin pouvant migrer le contrat          |

   Récupérez l'adresse du contrat :

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Execute** — Appelez le point d'entrée d'exécution d'un contrat pour modifier son état :

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Exécution avec des fonds joints :

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

5. **Query** — Lisez l'état du contrat sans soumettre de transaction :

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
qorechaind query wasm list-contract-by-code <code-id>

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

## Structure du contrat

Un contrat QoreChain Native typique possède trois points d'entrée :

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

Les appels inter-VM sont envoyés sous forme de transactions `MsgCrossVMCall` via le module `x/crossvm` ; consultez [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) pour le cycle de vie du message. Les contrats QoreChain Native ne disposent aujourd'hui d'aucune liaison côté contrat pour initier un appel inter-VM (il n'existe aucun message personnalisé `QoreChainMsg` que les contrats pourraient émettre) ; un contrat ne peut donc pas appeler un contrat EVM ou SVM depuis son point d'entrée `execute`. Depuis la v3.2.3, un appel vers la propre voie de l'appelant est refusé et un appel en file d'attente qui échoue ne laisse aucun effet de bord.

:::caution Les appels inter-VM sont actuellement désactivés sur le mainnet
`MsgCrossVMCall` figure sur la liste du disjoncteur (circuit breaker) du mainnet (`qorechaind query circuit disabled-list`), et la voie SVM est désactivée sur les deux réseaux ; le chemin inter-VM n'est donc pas utilisable aujourd'hui pour des transactions ordinaires.
:::

---

## Intégration des modules

Les contrats QoreChain Native peuvent interagir avec les modules du Cosmos SDK via la transmission de messages standard :

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

## Migration du contrat

Si le contrat a été instancié avec une adresse `--admin`, l'admin peut le migrer vers un nouvel ID de code :

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

Cela appelle le point d'entrée `migrate` sur le nouveau code avec l'état existant du contrat.

---

## Étapes suivantes

* [Interopérabilité inter-VM](/developer-guide/cross-vm-interoperability) — Appeler des contrats EVM et SVM depuis QoreChain Native
* [Développement SVM](/developer-guide/svm-development) — Déployer des programmes BPF sur QoreChain
* [Précompilés EVM](/developer-guide/evm-precompiles) — Référence des précompilés Solidity (aucun n'est actif sur le mainnet ; trois le sont sur le testnet)
