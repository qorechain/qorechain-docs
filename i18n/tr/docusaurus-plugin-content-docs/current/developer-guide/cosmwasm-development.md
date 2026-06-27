---
slug: /developer-guide/cosmwasm-development
title: CosmWasm Geliştirme
sidebar_label: CosmWasm Geliştirme
sidebar_position: 3
---

# CosmWasm Geliştirme

QoreChain, **CosmWasm** akıllı sözleşmelerini destekler ve geliştiricilerin WebAssembly'ye derlenen güvenli, korumalı programları Rust ile yazmasına olanak tanır. CosmWasm sözleşmeleri, QoreChain üçlü VM mimarisi içinde EVM ve SVM programlarıyla birlikte çalışır.

:::note
Aşağıdaki komutlar, 7 Haziran 2026'dan beri **v3.1.77** zincir sürümünü çalıştırarak yayında olan **`qorechain-vladi`** ana ağını kullanır. Test ağı için `--chain-id qorechain-diana` ifadesini yerine koyun.
:::

---

## Önkoşullar

| Bağımlılık                 | Sürüm         | Amaç                           |
| -------------------------- | ------------- | ------------------------------ |
| **Rust**                   | En son kararlı sürüm | Sözleşme derlemesi      |
| **wasm32-unknown-unknown** | hedef         | WebAssembly derleme hedefi     |
| **cargo-generate**         | En son        | Proje iskeleti oluşturma       |
| **cosmwasm-std**           | 1.5+          | CosmWasm standart kütüphanesi  |

Wasm hedefini yükleyin:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Sözleşme Yaşam Döngüsü

CosmWasm sözleşmeleri beş adımlı bir yaşam döngüsü izler: **Derleme**, **Depolama**, **Örnekleme**, **Yürütme** ve **Sorgulama**.

1. **Derleme** — Sözleşmenizi optimize edilmiş WebAssembly'ye derleyin:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Optimize edilmiş `.wasm` dosyası `artifacts/` dizininde olacaktır.

2. **Depolama** — Derlenmiş sözleşmeyi zincire yükleyin:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto \
     --gas-adjustment 1.3 \
     -y
   ```

   İşlem onaylandıktan sonra, depolanan kod ID'sini sorgulayın:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Örnekleme** — Depolanan bir kod ID'sinden yeni bir sözleşme örneği oluşturun:

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

   | Bayrak              | Açıklama                                       |
   | ------------------- | ---------------------------------------------- |
   | `<code-id>`         | Depolama işleminden döndürülen sayısal ID      |
   | `--label`           | Bu örnek için insan tarafından okunabilir etiket |
   | `--no-admin`        | Yönetici adresi yok (sözleşme değişmezdir)     |
   | `--admin <address>` | Sözleşmeyi taşıyabilecek bir yönetici ayarla   |

   Sözleşme adresini alın:

   ```bash
   qorechaind query wasm list-contracts-by-code <code-id>
   ```

4. **Yürütme** — Durumu değiştirmek için bir sözleşmenin yürütme giriş noktasını çağırın:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto \
     -y
   ```

   Fon ekli olarak yürütün:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     -y
   ```

5. **Sorgulama** — Bir işlem göndermeden sözleşme durumunu okuyun:

   ```bash
   qorechaind query wasm contract-state smart <contract-addr> \
     '{"get_count": {}}'
   ```

   Sorgu yanıtları JSON olarak döndürülür.

---

## Yararlı Sorgular

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

## Sözleşme Yapısı

Tipik bir CosmWasm sözleşmesinin üç giriş noktası vardır:

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

## VM'ler Arası Çağrılar

CosmWasm sözleşmeleri, `x/crossvm` modülü aracılığıyla EVM ve SVM üzerinde dağıtılan sözleşmelerle etkileşime girebilir. CosmWasm'dan VM'ler arası çağrılar **asenkron** mesaj yolunu kullanır:

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

Mesaj bir kuyruğa gönderilir ve sonraki blokta EndBlocker tarafından işlenir. Eksiksiz mesaj yaşam döngüsü için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) bölümüne bakın.

---

## Modül Entegrasyonu

CosmWasm sözleşmeleri, standart mesaj iletimi aracılığıyla Cosmos SDK modülleriyle etkileşime girebilir:

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

## Sözleşme Taşıma

Sözleşme bir `--admin` adresiyle örneklendirildiyse, yönetici onu yeni bir kod ID'sine taşıyabilir:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  -y
```

Bu, yeni koddaki `migrate` giriş noktasını mevcut sözleşme durumuyla çağırır.

---

## Sonraki Adımlar

* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) — CosmWasm'dan EVM ve SVM sözleşmelerini çağırın
* [SVM Geliştirme](/developer-guide/svm-development) — QoreChain üzerinde BPF programları dağıtın
* [EVM Önderlenmiş İşlevleri](/developer-guide/evm-precompiles) — Solidity'den PQC ve AI özelliklerine erişin
