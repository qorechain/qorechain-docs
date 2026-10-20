---
slug: /developer-guide/cosmwasm-development
title: QoreChain Native Geliştirme
sidebar_label: QoreChain Native Geliştirme
sidebar_position: 3
---

# QoreChain Native Geliştirme

QoreChain, **QoreChain Native** akıllı sözleşmelerini destekler. QoreChain Native, QoreChain'in **CosmWasm** çalışma zamanına verdiği addır: geliştiriciler standart CosmWasm kütüphanelerine (`cosmwasm-std`) karşı güvenli, sandbox'lanmış Rust programları yazar ve bunları WebAssembly'ye derler. QoreChain Native sözleşmeleri, QoreChain'in üçlü VM mimarisi içinde EVM ve SVM programlarıyla birlikte çalışır.

:::note
Aşağıdaki komutlar, 7 Haziran 2026'dan beri yayında olan ve 3.742.566 yüksekliğine kadar **v3.2.3**, o bloktan itibaren **v3.2.4** düğüm sürümünü çalıştıran (yönetişim önerisi 13) **`qorechain-vladi`** ana ağını kullanır. 19 Ekim 2026'dan beri v3.2.4 çalıştıran test ağı için `--chain-id qorechain-diana` kullanın.
:::

:::caution Kod yükleme ve örnekleme şu anda açık izin gerektirir
Bu yazının kaleme alındığı sırada, `code_upload_access` ve `instantiate_default_permission` hem **ana ağda hem de test ağında** **`Nobody`** olarak ayarlanmıştır — yani `MsgStoreCode` ve `MsgInstantiateContract`, QoreChain Native'in üzerine inşa edildiği çalışma zamanı olan CosmWasm için sektör genelinde yayımlanan bir güvenlik uyarısının ardından varsayılan olarak keyfi hesaplara açık değildir. Aşağıdaki adımların başarılı olabilmesi için önce yönetişimin hesabınıza (veya belirli bir adres listesine) yükleme/örnekleme izni vermesi gerekir — önce canlı parametreleri kontrol edin, çünkü bu tam olarak yönetişimin değiştirebileceği türden bir ayardır (ana ağda şu anda hiç depolanmış sözleşme kodu yoktur):

```bash
qorechaind query wasm params
# or: curl -s https://api.qore.host/cosmwasm/wasm/v1/codes/params  (substitute api-testnet.qore.host for testnet)
```

`MsgStoreCode`, `MsgInstantiateContract` ve `MsgInstantiateContract2` mesaj türleri de her iki ağda zincirin devre kesicisi (circuit breaker) tarafından kapatılmıştır (`qorechaind query circuit disabled-list`); bu nedenle bu girdiler kaldırılana kadar yalnızca izni yükseltmek yeterli değildir.

Bu kısıtlama, zaten örneklenmiş sözleşmeleri etkilemez — mevcut bir sözleşmeye karşı `execute` ve `query` bu ayardan bağımsız olarak normal şekilde çalışır.
:::

:::caution `tx pqc cosign` ile imzalayın
Ana ağ ve test ağı, her Cosmos şeridi (lane) işleminde hibrit bir kuantum-sonrası imza gerektirir; bu nedenle bu sayfadaki `tx` komutları yazıldığı gibi yayınlanmaz. Bunlar işlemi `--generate-only > tx.json` ile oluşturur; ardından `qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id <chain-id>` ile imzalayıp yayınlayın (imzalayıcı, [indirme manifestosundaki](/developer-guide/running-a-node#fetch-the-manifest) sürüm ikili dosyasında bulunur; herkese açık kaynaktan derlenen sürümde yoktur). Ağ ücret tabanı **gas birimi başına 0,1 uqor**'dur ve `--gas-prices 0.1uqor` bunu ifade eder; hibrit imza, simülasyonun içermediği yaklaşık 47.000 gas ekler, bu yüzden `1.5` ayarı kullanılır. Bkz. [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing).
:::

---

## Önkoşullar

| Bağımlılık                 | Sürüm                   | Amaç                            |
| --------------------------- | ------------------------ | -------------------------------- |
| **Rust**                    | En güncel kararlı sürüm  | Sözleşme derlemesi               |
| **wasm32-unknown-unknown**  | hedef                    | WebAssembly derleme hedefi       |
| **cargo-generate**          | En güncel                | Proje iskeleti oluşturma         |
| **cosmwasm-std**            | 1.5+                     | QoreChain Native standart kütüphanesi    |

Wasm hedefini kurun:

```bash
rustup target add wasm32-unknown-unknown
```

---

## Sözleşme Yaşam Döngüsü

QoreChain Native sözleşmeleri beş aşamalı bir yaşam döngüsü izler: **Derleme (Build)**, **Depolama (Store)**, **Örnekleme (Instantiate)**, **Çalıştırma (Execute)** ve **Sorgulama (Query)**.

1. **Derleme (Build)** — Sözleşmenizi optimize edilmiş WebAssembly'ye derleyin:

   ```bash
   cd my-contract

   # Standard build
   cargo build --release --target wasm32-unknown-unknown

   # Optimized build (recommended for deployment)
   docker run --rm -v "$(pwd)":/code \
     cosmwasm/rust-optimizer:0.15.0
   ```

   Optimize edilmiş `.wasm` dosyası `artifacts/` dizininde olacaktır.

2. **Depolama (Store)** — Derlenmiş sözleşmeyi zincire yükleyin:

   ```bash
   qorechaind tx wasm store contract.wasm \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   İşlem onaylandıktan sonra (`tx.json` dosyasını yukarıda açıklandığı gibi `tx pqc cosign` ile imzalayıp yayınlayın), depolanan kod kimliğini (code ID) sorgulayın:

   ```bash
   qorechaind query wasm list-code
   ```

3. **Örnekleme (Instantiate)** — Depolanan bir kod kimliğinden yeni bir sözleşme örneği oluşturun:

   ```bash
   qorechaind tx wasm instantiate <code-id> \
     '{"count": 0, "owner": "qor1..."}' \
     --label "my-counter-contract" \
     --from mykey \
     --no-admin \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   | Bayrak               | Açıklama                                          |
   | --------------------- | -------------------------------------------------- |
   | `<code-id>`           | Depolama işleminden dönen sayısal kimlik           |
   | `--label`             | Bu örnek için insan tarafından okunabilir etiket   |
   | `--no-admin`          | Yönetici adresi yok (sözleşme değiştirilemez)      |
   | `--admin <address>`   | Sözleşmeyi geçirebilecek bir yönetici belirler     |

   Sözleşme adresini alın:

   ```bash
   qorechaind query wasm list-contract-by-code <code-id>
   ```

4. **Çalıştırma (Execute)** — Durumu değiştirmek için bir sözleşmenin execute giriş noktasını çağırın:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"increment": {}}' \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

   Fon ekleyerek çalıştırma:

   ```bash
   qorechaind tx wasm execute <contract-addr> \
     '{"deposit": {}}' \
     --amount 1000000uqor \
     --from mykey \
     --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
     --generate-only > tx.json
   ```

5. **Sorgulama (Query)** — Bir işlem göndermeden sözleşme durumunu okuyun:

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

## Sözleşme Yapısı

Tipik bir QoreChain Native sözleşmesinin üç giriş noktası vardır:

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

VM'ler arası çağrılar, `x/crossvm` modülü aracılığıyla `MsgCrossVMCall` işlemleri olarak gönderilir; mesaj yaşam döngüsü için [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) sayfasına bakın. QoreChain Native sözleşmelerinin bugün VM'ler arası çağrı başlatmak için sözleşme tarafında bir bağlaması (binding) yoktur (sözleşmelerin yayabileceği özel bir `QoreChainMsg` mesajı bulunmaz); bu nedenle bir sözleşme, kendi `execute` giriş noktasının içinden bir EVM veya SVM sözleşmesini çağıramaz. v3.2.3'ten itibaren çağıranın kendi şeridine yapılan bir çağrı reddedilir ve başarısız olan sıraya alınmış bir çağrı geride hiçbir yan etki bırakmaz.

:::caution VM'ler arası çağrılar şu anda ana ağda kapalıdır
`MsgCrossVMCall`, ana ağın devre kesici listesindedir (`qorechaind query circuit disabled-list`) ve SVM şeridi her iki ağda da devre dışıdır; dolayısıyla VM'ler arası yol bugün sıradan işlemler için kullanılamaz.
:::

---

## Modül Entegrasyonu

QoreChain Native sözleşmeleri, standart mesaj iletimi yoluyla Cosmos SDK modülleriyle etkileşime girebilir:

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

## Sözleşme Geçişi

Sözleşme bir `--admin` adresiyle örneklendiyse, yönetici onu yeni bir kod kimliğine geçirebilir:

```bash
qorechaind tx wasm migrate <contract-addr> <new-code-id> \
  '{"migrate_msg": {}}' \
  --from admin-key \
  --gas auto --gas-adjustment 1.5 --gas-prices 0.1uqor \
  --generate-only > tx.json
```

Bu, mevcut sözleşme durumuyla yeni kod üzerindeki `migrate` giriş noktasını çağırır.

---

## Sonraki Adımlar

* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability) — QoreChain Native'dan EVM ve SVM sözleşmelerini çağırın
* [SVM Geliştirme](/developer-guide/svm-development) — QoreChain üzerinde BPF programları dağıtın
* [EVM Precompile'ları](/developer-guide/evm-precompiles) — Planlanan Solidity precompile'ları için başvuru (henüz hiçbiri etkin değil)
