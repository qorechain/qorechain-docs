---
slug: /developer-guide/evm-window-reference
title: EVM Yetkilendirme Penceresi Başvurusu (v3.2.8)
sidebar_label: EVM Pencere Başvurusu
sidebar_position: 7
---

# EVM Yetkilendirme Penceresi Başvurusu (v3.2.8)

Bir Ethereum işlemi yalnızca bir secp256k1 imzası taşır, başka hiçbir şey taşımaz; bu yüzden QoreChain'in diğer tüm işlemlerden istediği kuantum sonrası (ML-DSA-87) imzayı taşıyamaz. **EVM yetkilendirme penceresi** bu boşluğu kapatır. Hesap önce kuantum sonrası anahtarıyla imzalanmış **olan** bir QoreChain Native mesajıyla sınırlı bir pencere açar; EVM hattı da hesabın sıradan MetaMask, ethers.js, Hardhat veya Foundry işlemlerini yalnızca pencere onları kapsadığı sürece kabul eder. Bu sayfa, bir pencerenin **v3.2.8** sürümünde nasıl davrandığının eksiksiz başvurusudur.

:::note v3.2.8 nerede çalışır
**`qorechain-diana`** test ağı, 12 Kasım 2026'dan beri **v3.2.8** çalıştırmaktadır. **`qorechain-vladi`** ana ağı bunu henüz uygulamadı; ana ağda pencere, aşağıda "v3.2.8" olarak işaretlenen seçenekler ve kurallar olmadan [EVM Geliştirme](/developer-guide/evm-development#evm-window) sayfasında anlatıldığı gibi çalışır. v3.2.8'in altındaki bir düğüm, yeni listeleri ayarlayan bir pencere mesajını reddeder.
:::

## Neden önemli {#why}

- **Çalınmış bir klasik anahtar, yalnızca açık bir pencerenin kabul ettiği kadar değerlidir.** Pencere zamanı (blok), işlem sayısını, çıkabilecek QOR miktarını ve isteğe bağlı olarak hesabın hangi sözleşmelere dokunabileceğini sınırlar.
- **Kuantum sonrası anahtar yetkili kalır.** Bir pencereyi açmak, daraltmak ve kapatmak hibrit imzalı Native mesajlardır. Klasik anahtar tek başına asla bir pencere açamaz.
- **v3.2.8 varsayılanları sıkılaştırır.** Standart precompile yöntemleri varsayılan olarak reddedilir, diğer sözleşmelerin denetlediği imzalar pencerenin onayını gerektirir ve kuantum sonrası anahtarı değiştirmek pencereyi kapatır.

v3.2.8 eklerinin kısa özeti [v3.2.8'de eklenen pencere seçenekleri](/developer-guide/evm-development#evm-window-v328) bölümündedir; bu sayfa onu tam olarak tekrarlamaz ve örnekleri, alan başvurusunu ve hata tablosunu ekler. Adım adım ilk pencere için bkz. [İlk İşleminiz](/getting-started/first-transaction#evm-window).

## Açma, kapatma ve okuma {#lifecycle}

| Eylem | Mesaj | CLI | REST |
| ------ | ------- | --- | ---- |
| Açma (açık olan pencerenin yerine geçer) | `/qorechain.pqc.v1.MsgOpenEVMWindow` | `qorechaind tx pqc open-evm-window [blocks] [max-txs] [max-value]` | yok (bir işlem) |
| Hemen kapatma | `/qorechain.pqc.v1.MsgCloseEVMWindow` | `qorechaind tx pqc close-evm-window` | yok (bir işlem) |
| Okuma | yok | `qorechaind q pqc evm-window <address>` | `GET /qorechain/pqc/v1/evm_window/{address}` |

Açma ve kapatma Native hat işlemleridir ve hesabın hibrit (klasik artı ML-DSA-87) imzasını gerektirir; ayrıca hesabın pencere açabilmesi için kayıtlı bir kuantum sonrası anahtarı olmalıdır. Bir pencereyi kapatmak, bekleyen bir EIP-7702 onayını da geri çeker. Açmak **hesabın nonce değerini ilerletir** (Native sıra numarası EVM nonce değeridir); bu yüzden önce pencereyi açın, sonra EVM nonce değerini okuyun.

### CLI {#cli}

İşlemi `--generate-only` ile oluşturun, ardından kuantum sonrası imzayı `tx pqc cosign` ile ekleyin. Sürüm `qorechaind` ikili dosyasında `gen-key` ve `cosign` vardır; topluluk derlemesinde yoktur.

```bash
export QNODE=https://rpc-testnet.qore.host:443
export QCHAIN=qorechain-diana

# Open: 7,200 blocks, 20 transactions, 100 QOR cap (value plus maximum fees)
qorechaind tx pqc open-evm-window 7200 20 100qor \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json

qorechaind tx pqc cosign window.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Argüman verilmezse CLI, bir dağıtım oturumu için boyutlandırılmış varsayılanları kullanır: 3,600 blok, 10 işlem ve 25 QOR. Tek bir sözleşmeye kapsamı daraltılmış, ayrıca tek bir doğrulayıcıya delege edebilen ve tek bir IBC alıcısına gönderebilen bir pencere:

```bash
qorechaind tx pqc open-evm-window 600 5 100qor \
  --allowed-targets 0x0000000000000000000000000000000000000800 \
  --staking-validators qorvaloper1... \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 80000uqor --generate-only > window.json
```

Bir pencereyi erken kapatın, örneğin klasik anahtarın açığa çıktığını düşünüyorsanız. Pencerenin hâlâ kabul edeceği her şey bir sonraki bloktan itibaren reddedilir:

```bash
qorechaind tx pqc close-evm-window \
  --from mykey --chain-id $QCHAIN --node $QNODE \
  --gas 400000 --fees 40000uqor --generate-only > close.json

qorechaind tx pqc cosign close.json --from mykey --pqc-key mykey-mldsa \
  --chain-id $QCHAIN --node $QNODE
```

Pencereyi okuyun:

```bash
qorechaind q pqc evm-window <qor1-address> --node $QNODE
```

Görmek istediğiniz şey, `live: true` ile birlikte `remaining_blocks`, `remaining_txs` ve `remaining_value` (uqor) değerleridir. Komut başvurusu [İşlem Komutları](/cli-reference/transaction-commands#open-evm-window) sayfasındadır.

### REST {#rest}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_window/<qor1-address>
```

Penceresi olmayan bir hesap, `found: false` ile HTTP 200 yanıtı verir; bu yüzden rotayı yoklamak güvenlidir. Her sayı bir JSON dizesidir. Saklanmış bir pencere süresi dolmuş veya tükenmiş olabilir: `live`, pencerenin geçerli yükseklikte hâlâ en az bir sıfır değerli işlem daha kabul edip etmeyeceğini söyler.

### TypeScript {#typescript}

Pencere yardımcıları `@qorechain/sdk` içindedir (imzalama kurulumu için [SDK EVM kılavuzuna](/sdk/guides/evm#evm-window-scope) bakın). `openEvmWindowMsg` aşağıdaki her alanı alır, `closeEvmWindowMsg` kapatma mesajını oluşturur, `fetchEvmWindow` pencereyi okur ve `classifyEvmWindowRejection` bir reddi açıklar.

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  openEvmWindowMsg,
  closeEvmWindowMsg,
  fetchEvmWindow,
} from "@qorechain/sdk";

const REST = "https://api-testnet.qore.host";
const client = createClient({
  network: "testnet",
  endpoints: { rest: REST, rpc: "https://rpc-testnet.qore.host", evmRpc: "https://evm-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic); // already registered on chain
const tx = await client.connectTx(signer, { pqcKeypair });         // signs hybrid

// Open a window that may call one token contract and delegate to one validator.
await tx.signAndBroadcast(
  [
    openEvmWindowMsg({
      sender: account.address,
      blocks: 7200,
      maxTxs: 20,
      maxValue: "100000000",                 // uqor: value PLUS the maximum fee of each transaction
      allowedTargets: ["0x0000000000000000000000000000000000000800"],
      stakingValidators: ["qorvaloper1..."],
    }),
  ],
  "auto",
);

// Read it back (opens first, then read the nonce).
const w = await fetchEvmWindow({ rest: REST, address: account.address });
console.log(w.live, w.remainingBlocks, w.remainingTxs, w.remainingValue);

// Close it early.
await tx.signAndBroadcast([closeEvmWindowMsg(account.address)], "auto");
```

`openEvmWindowMsg`, herhangi bir şey imzalanmadan önce sınırları ve liste biçimlerini denetler; bu yüzden bir hata, reddedilmiş bir işleme mal olmak yerine yerelde başarısız olur. `MAX_EVM_WINDOW_BLOCKS` ve `MAX_EVM_WINDOW_TXS` sınırları dışa aktarır. Geri okuma (`fetchEvmWindow`) sınırları, sayaçları ve v3.2.3 kapsamını (`nativeOnly`, `allowedTargets`) döndürür; `validators` (sözleşme adresleri), `stakingValidators` (`qorvaloper1...`) ve `ibcReceivers` (`"<channel>/<receiver>"`) v3.2.8 listelerini taşıyan SDK 0.14.0'dan itibaren oluşturucu tarafından kabul edilir; geri okuma bunları döndürmez, bu yüzden onları REST üzerinden okuyun. Yukarıdaki örnek `stakingValidators` kullanır; SDK 0.14.0'a karşı çalıştırılmadı. Üç listeyi yalnızca v3.2.8 çalıştıran bir ağ için ayarlayın: bunun altındaki bir düğüm, onları ayarlayan bir pencere mesajını reddeder. Hibrit imzalı bir `connectTx` ile kuantum sonrası anahtar önceden kayıtlı olmalıdır.

### Test ağında denendi {#tested}

12 Kasım 2026'da `qorechain-diana` üzerinde (v3.2.8 sürümü), kuantum sonrası anahtarını kaydetmiş bir eth-native hesapla, SDK 0.13.0 (`openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`) ve hibrit imzalama kullanılarak çalıştırıldı. `validators`, `staking_validators` ve `ibc_receivers` pencere alanları SDK 0.13.0 oluşturucularında yoktu; SDK 0.14.0 bunları `openEvmWindowMsg` içine ekler ve bu çalıştırma onları kullanmadı (SDK 0.13.0 ile bunlar için komut satırını kullanın).

| Adım | Sonuç |
| ---- | ------ |
| Açmadan önce `GET /qorechain/pqc/v1/evm_window/{address}` | `found: false`, `live: false` |
| Açma: 300 blok, 5 işlem, 1,000,000 uqor | kod 0, 187,282 gaz kullanıldı. Geri okuma: `found: true`, `live: true`, `opened_height` 9942089, `expiry_height` 9942389, `max_txs` 5, `max_value` 1000000, `remaining_blocks` 297, `native_only: false`, `allowed_targets: []` |
| `nativeOnly: true` ile yeniden açma | kod 0, 187,803 gaz kullanıldı. Yeni pencere eskisinin yerini aldı: `native_only: true`, yeni bir `opened_height` |
| Kapatma | kod 0, 170,468 gaz kullanıldı. Geri okuma: `found: false` |

Aynı gün SDK 0.14.0 ile, `allowedTargets` (staking precompile adresi), `stakingValidators` (bir doğrulayıcı operatör adresi) ve `ibcReceivers` (bir `channel-0/...` çifti) ile açılan bir pencere kod 0 ve 195,233 gaz kullanımıyla başarılı oldu. REST geri okuması `allowed_targets` değerini listeledi ve `found: true`, `live: true` döndürdü; `validators`, `staking_validators` veya `ibc_receivers` listelerini döndürmez, bu yüzden pencereyi açtığınız değerleri saklayın.

`fetchEvmWindow` aynı alanları camel case biçiminde döndürdü (`openedHeight`, `remainingBlocks`, `nativeOnly`, `allowedTargets`). Açma ve kapatma hibrit imzalı Cosmos işlemleridir; bu yüzden bir hesabın gönderdiği ilk işlem için önce anahtarının kaydedilmesi gerekir.

### Python, Go, Rust ve Java {#other-languages}

Her SDK'nın mesaj için bir oluşturucusu ve bir REST okuması vardır. Hepsi zincirin sınırlarını yerelde denetler. v3.2.8 listelerini ayarlayan bir dil oluşturucusu, SDK 0.14.0 veya sonrasını gerektirir (Java: Maven Central'da göründüğünde 0.14.0; Maven Central 12 Kasım 2026'da hâlâ 0.13.0 gösteriyor); önceki sürümler yalnızca eski alanları oluşturur.

| Dil | Açma (her liste ile) | Kapatma | Okuma | EVM limitleri |
| -------- | ---------------------- | ----- | ---- | ---------- |
| Python | `msg.pqc.open_evm_window(sender=, blocks=, max_txs=, max_value=, native_only=, allowed_targets=, validators=, staking_validators=, ibc_receivers=)` | `msg.pqc.close_evm_window(sender=)` | `get_evm_window(rest, address)` | `fetch_evm_limits(rest)` |
| Go | `messages.NewOpenEVMWindowWithScope(sender, blocks, maxTxs, maxValue, scope)` ve bir `messages.EVMWindowScope` | `messages.NewCloseEVMWindow(sender)` | `rest.GetEVMWindowStatus(address)` | `rest.GetEVMLimits()` |
| Rust | `msg::pqc::open_evm_window_with_scope_any(sender, blocks, max_txs, max_value, &scope)` ve `EvmWindowScope` | `msg::pqc::close_evm_window_any(sender)` | `get_evm_window(&rest, address)` | henüz yardımcı yok; REST rotasını okuyun |
| Java | `EvmWindow.openWithPolicy(sender, blocks, maxTxs, maxValue, nativeOnly, allowedTargets, validators, stakingValidators, ibcReceivers)` | `EvmWindow.close(sender)` | `rest.evmWindow(address)` | `rest.evmLimits()` |

Python:

```python
from qorsdk import RestClient, get_network, get_evm_window, msg

sender = "qor1..."
open_msg = msg.pqc.open_evm_window(
    sender=sender,
    blocks=7200,
    max_txs=20,
    max_value="100000000",  # uqor, integer string
    allowed_targets=["0x0000000000000000000000000000000000000800"],
    staking_validators=["qorvaloper1..."],
)
# broadcast it through the usual hybrid path, then:
rest = RestClient(get_network("testnet").endpoints.rest)
status = get_evm_window(rest, sender)
print(status.live, status.remaining_blocks, status.remaining_txs, status.remaining_value)
close_msg = msg.pqc.close_evm_window(sender=sender)
```

Go:

```go
open, err := messages.NewOpenEVMWindowWithScope(sender, 7200, 20, "100000000",
    messages.EVMWindowScope{
        AllowedTargets:    []string{"0x0000000000000000000000000000000000000800"},
        StakingValidators: []string{"qorvaloper1..."},
    })
status, err := rest.GetEVMWindowStatus(sender)
closeMsg, err := messages.NewCloseEVMWindow(sender)
```

Rust:

```rust
use qorechain::evm_window::{get_evm_window, EvmWindowScope};
use qorechain::msg;

let scope = EvmWindowScope {
    allowed_targets: vec!["0x0000000000000000000000000000000000000800".into()],
    staking_validators: vec!["qorvaloper1...".into()],
    ..Default::default()
};
let open = msg::pqc::open_evm_window_with_scope_any("qor1...", 7200, 20, "100000000", &scope)?;
let status = get_evm_window(&rest, "qor1...").await?;
let close = msg::pqc::close_evm_window_any("qor1...");
```

Java:

```java
TypedMessage open = EvmWindow.openWithPolicy(sender, 7200, 20, "100000000",
    false,
    List.of("0x0000000000000000000000000000000000000800"), // allowedTargets
    null,                                                   // validators
    List.of("qorvaloper1..."),                              // stakingValidators
    null);                                                  // ibcReceivers
EvmWindowStatus status = rest.evmWindow(sender);
TypedMessage close = EvmWindow.close(sender);
```

SDK sizin yerinize asla bir pencere açmaz. Bir pencere harcamayı yetkilendirir; bu yüzden adım açık ve kullanıcı tarafından görülebilir kalır.

## Alanlar {#fields}

| Alan (CLI bayrağı) | Limit | Anlamı |
| ---------------- | ----- | ------- |
| `blocks` (ilk argüman) | 1 ile 17,280 arası | Pencere, açılış yüksekliği artı `blocks` değerinden sonra hiçbir şeyi kabul etmez. Bu bir süre değil, blok sayısıdır: bugünkü blok sürelerinde test ağında yaklaşık 5 saat, ana ağda yaklaşık 15 saat |
| `max_txs` (ikinci argüman) | 1 ile 1,000 arası | Kaç EVM işlemi kabul ettiği |
| `max_value` (üçüncü argüman) | pozitif | Pencerenin hesaptan çıkmasına izin verdiği toplam uqor: aktarılan değer **artı** kabul edilen her işlemin azami ücreti (gaz limiti çarpı ücret tavanı) |
| `native_only` (`--native-only`) | true veya false | Yalnızca düz QOR transferlerini kabul eder: calldata yok, sözleşme oluşturma yok, kod taşıyan alıcı yok, EIP-7702 yetkilendirmesi yok |
| `allowed_targets` (`--allowed-targets`) | en fazla 16 `0x` adresi, tekrar yok | Yalnızca bu adreslere yapılan işlemleri kabul eder; sözleşme oluşturma reddedilir |
| `validators` (`--validators`) | en fazla 16 `0x` adresi, tekrar yok | Hesabın imzası için yaptıkları denetimin hesabın kendi eylemleri için sayıldığı sözleşmeler: bir cüzdan sözleşmesinin çağırdığı bir doğrulayıcı modül veya ERC-4337 giriş noktası. v3.2.8 |
| `staking_validators` (`--staking-validators`) | en fazla 16 `qorvaloper...` adresi, tekrar yok | Hesabın pencere üzerinden delege edebileceği veya yeniden delege edebileceği doğrulayıcılar. v3.2.8 |
| `ibc_receivers` (`--ibc-receivers`) | en fazla 16 girdi, biçimi `<channel>/<receiver>`, her biri en fazla 256 karakter, boşluk veya virgül yok | Yerel bir QOR IBC transferinin gidebileceği kesin hedefler. Bayt bayt karşılaştırılır; bu yüzden `channel-0` ve küçük harfli bech32 alıcıyı transferin taşıdığı şekilde aynen yazın. v3.2.8 |

Her sınır verilmelidir: zincir, eksik bir sınırı varsayılana çevirmek yerine reddeder (CLI dağıtım oturumu varsayılanlarını kendisi doldurur). Herhangi bir sınırın tükenmesi, pratikte pencereyi sonlandırır. Bir pencere yalnızca hesabın kuantum sonrası anahtarı kullanılabilir olduğu sürece çalışır; yani boş, yalnızca klasik değil ve yönetişim tarafından devre dışı bırakılmamış olmalıdır.

### Bir pencerenin neleri saydığı {#counting}

Kabul sırasında, işlem çalışmadan önce, her EVM işlemi `max_txs` içinden birini kullanır ve kullanılan değere aktarılan değerini artı azami ücretini ekler; bunlar 18 ondalıklı EVM biriminden uqor'a çevrilir ve yukarı yuvarlanır. Kabul edilip sonra geri alınan (revert) bir işlem de payını kullanmış olur. Yürütmeden sonra, bir precompile'ın hesap adına taşıdığı yerel QOR (bir delegasyon, bir yatırma, bir IBC transferi) de pencereye yazılır; bu nedenle işlem değeri sıfır olsa bile `max_value` hesabına girer.

Sayılmayanlar: `eth_call`, `eth_estimateGas` ve simülasyonlar. Token'lar hiç fiyatlandırılmaz: bir ERC-20 transferi veya onayı sıfır değer taşır; bu yüzden onları bir kapsamla (`allowed_targets`) sınırlayın. Her ücretlendirme, `address`, `evm_address`, `window_open_height`, `used_txs`, `used_value`, `tx_value` ve `source` (kabul için `ante`, yürütme sonrası ücretlendirme için `settlement`) niteliklerini taşıyan bir `pqc_evm_window_used` olayı yayar; böylece bir cüzdan bir işlemin ne aldığını gösterebilir. Açma ve kapatma `pqc_evm_window_opened` ve `pqc_evm_window_closed` yayar.

## Bir pencere üzerinden standart precompile'lar {#precompile-allowlist}

Bir pencerenin yetkilendirdiği bir hesap için, standart bir precompile'ın (staking, distribution, ICS-20, gov, slashing, ERC-20 token precompile'ları) bir yöntemi, tabloda olmadıkça ve pencere o precompile'ı `allowed_targets` içinde listelemedikçe reddedilir. Precompile adresleri [EVM Precompile'ları](/developer-guide/evm-precompiles) sayfasındadır; staking, distribution, ICS-20 ve gov olanlar `0x...0800`, `0x...0801`, `0x...0802` ve `0x...0805`'tir.

| Precompile | Yöntem | Ne zaman kabul edilir |
| ---------- | ------ | ------------- |
| distribution | `claimRewards`, `withdrawDelegatorRewards` | ödüller hesabın kendisine ödenirse (çekim adresi hesabın kendi adresiyse) |
| distribution | `withdrawValidatorCommission` | doğrulayıcı hesabın kendisine aitse ve hesabın kendisine ödeme yapıyorsa |
| distribution | `depositValidatorRewardsPool` | doğrulayıcı `staking_validators` içindeyse ve her coin yerel QOR ise |
| staking | `delegate`, `redelegate` | hedef doğrulayıcı `staking_validators` içindeyse |
| ICS-20 | `transfer` | yerel QOR, `transfer` portu üzerinden, memo olmadan, `ibc_receivers` içindeki bir çifte |
| ERC-20 token precompile'ları | `transfer`, `transferFrom`, `approve` | yerel QOR; başka bir token yalnızca pencere o token'ın adresini listeliyorsa |

Diğer her şey, pencere ne listelerse listelesin, bir pencere üzerinden reddedilir: delegasyonu geri çekme (undelegate), bir unbonding'i iptal etme, oy verme ve diğer yönetişim eylemleri, çekim adresini değiştirme, bir doğrulayıcı oluşturma veya düzenleme, hapisten çıkarma (unjail), topluluk havuzunu fonlama. Bunları kuantum sonrası imzalı Native işlemler olarak gönderin. `ibc_receivers` olmadan ICS-20'yi listelemek hiçbir transferi kabul etmez ve `staking_validators` olmadan staking precompile'ını listelemek hiçbir delegasyonu kabul etmez.

Ne listeleyeceğinize dair örnekler:

| Hedef | Pencere |
| ---- | ------ |
| MetaMask'ten staking ödüllerini talep etme | distribution precompile'ını içeren `allowed_targets`; çekim adresini hesabın kendisi olarak bırakın |
| MetaMask'ten stake etme | staking precompile'ını içeren `allowed_targets` artı `staking_validators` |
| QOR'u köprüyle dışarı gönderme | ICS-20 precompile'ını içeren `allowed_targets` artı `channel-0/<receiver>` gibi `ibc_receivers` |
| Bir ERC-20 precompile'ı olarak tutulan bir IBC token'ını taşıma | o token'ın adresini içeren `allowed_targets` |

Bir sözleşmeyi listelemek, o sözleşmenin hesabın varlıklarıyla yapabileceği her şeye hesabın onay vermesi demektir: hesabın token'larını tutan bir kasa, yönlendirici veya token için pencere hangi token'ların nereye taşınacağını sınırlamaz.

## Sözleşme oluşturma {#contract-creation}

Bir sözleşme dağıtmak, **kapsamı daraltılmamış** bir pencere gerektirir. `native_only` veya `allowed_targets` içeren bir pencere sözleşme oluşturmayı reddeder. Bir dağıtım oturumu için düz bir pencere açın (CLI varsayılanları bunun için boyutlandırılmıştır), dağıtın, sonra kapatın. Sonraki oturumlar için, dağıttığınız sözleşmeye yapılan çağrılarla sınırlamak üzere `--allowed-targets <contract-address>` ile bir pencere açın. Hardhat ve Foundry ile dağıtım anlatımı [EVM Geliştirme](/developer-guide/evm-development) sayfasındadır.

## Permit'ler, EIP-712 emirleri ve Permit2 {#permits}

Bir EIP-2612 permit'i, bir Permit2 transferi, imzalı bir emir veya bir meta-işlem, bir sözleşme tarafından `ecrecover` precompile'ı ile denetlenir. v3.2.8'den itibaren (her iki ağda, bir ağ uyguladığında), kullanılabilir bir kuantum sonrası anahtarı olan bir hesap için bu denetim yalnızca hesabın kendi **canlı** penceresi **doğrulayan sözleşmeyi** kabul ettiği sürece başarılı olur; bu, çağrıyı ileten yönlendirici değil, token'ın veya Permit2'nin kendisidir.

1. Pencerenin kapsamı daraltılmışsa, doğrulayan sözleşmeyi `allowed_targets` içinde listeleyin (`native_only` böyle bir imzayı kabul etmez).
2. Pencereyi kullanıcı imzalamadan **önce** açın. Canlı bir pencere olmadan imza geçersiz sayılır ve sözleşme onu reddeder.
3. İmzanın kendisi pencereye asla yazılmaz, çünkü bir imza kullanıldığında herkese açık hale gelir.
4. Bir pencere içinde verilen bir permit veya onay, pencere kapandıktan sonra da kalır. Oturum bittiğinde onayları gözden geçirin ve iptal edin.

Kuantum sonrası kaydı olmayan hesaplar, kendi imzasını denetleyen delege edilmiş bir cüzdan ve kapsamı daraltılmamış bir pencerede göndericinin kendi imzası eskisi gibi kurtarılır. Sorgular ve gaz tahminleri etkilenmez.

## Anahtar değişiklikleri ve EIP-7702 onayı {#key-changes}

- **Kuantum sonrası anahtarı döndürmek, taşımak veya yeniden kaydetmek pencereyi kapatır** ve her EIP-7702 onayını siler. Sonrasında pencereyi yeniden açın. Bunu sıcak cüzdanlarda ve borsa entegrasyonlarında hesaba katın.
- Pencere, EIP-7702 onayı (`MsgAuthorizeEVMDelegation`, `MsgClearEVMDelegation`) ve soyut hesap yönetimi mesajları, hesabın **kendi üst düzey, hibrit imzalı mesajı** olmalıdır. authz (`MsgExec`) üzerinden gönderilemez veya başka bir hesaba verilemez ve bu mesaj türlerinin bir yetkisi reddedilir. Bu türden mevcut onay yetkileri yükseltmede kaldırıldı.
- Başka birinin işlemi içinde hareket eden EIP-7702 ile delege edilmiş bir hesap, kodunun hareket ettiği anda kendi canlı penceresine ihtiyaç duyar. Pencere yoksa yalnızca o çağrı başarısız olur ve çağıran sözleşme başarısızlığı görür; bu nedenle delege edilmiş bir hesaba ödeme yapmak artık ödeyenin tüm işleminin geri alınmasına yol açmaz.

Bir delegasyon için onay `qorechaind tx pqc authorize-evm-delegation <delegate_0x> <blocks>` ile kaydedilir ve `GET /qorechain/pqc/v1/evm_delegation_consent/{address}` ile okunur; bkz. [EIP-7702 delegasyonları](/developer-guide/evm-development#eip-7702).

## Yürürlükteki limitler {#limits}

```bash
curl -s https://api-testnet.qore.host/qorechain/pqc/v1/evm_limits
```

Test ağı 12 Kasım 2026'da `tx_max_gas` **30000000** ve `precompile_input_max_bytes` **16384** ile yanıt verdi:

| Limit | Değer | Anlamı |
| ----- | ----- | ------- |
| `tx_max_gas` | 30,000,000 | Bir EVM işleminin isteyebileceği en fazla gaz; bunun üzerinde işlem çalışmadan önce reddedilir. Bir Native mesajın başlattığı EVM çalıştırmaları aynı bütçeyi paylaşır |
| `precompile_input_max_bytes` | 16,384 | Korumalı durumlu bir precompile'ın kabul ettiği en büyük girdi |
| Pencere `blocks` | 17,280 | En uzun pencere |
| Pencere `max_txs` | 1,000 | Bir penceredeki en fazla işlem |
| Liste girdileri | liste başına 16 | `allowed_targets`, `validators`, `staking_validators`, `ibc_receivers` |

Yanıt ayrıca yönetişimin belirlediği değerleri içeren bir `limits` nesnesi taşır; yürürlükteki değerler olan üst düzey `tx_max_gas` ve `precompile_input_max_bytes` değerlerini okuyun. Rota v3.2.8'den itibaren sunulur; bu yüzden herkese açık ana ağ, yükseltilene kadar `501 Not Implemented` yanıtı verir.

Normal bir gaz fiyatında açılan bir pencere de azami ücreti sayar: 100 gwei ücret tavanında 30,000,000 gaz limiti, bir işlem için `max_value` hesabına 3 QOR sayar.

## Hatalar {#errors}

Redler `pqc` codespace'i ile gelir. EVM JSON-RPC üzerinden bir ret, mesajı taşıyan ve codespace içermeyen bir yayın hatası olarak gelir; bu yüzden metinle de eşleştirin (SDK sınıflandırıcıları bunu yapar).

| Kod | Mesaj | Neden | Ne yapmalı |
| ---- | ------- | ----- | ---------- |
| 26 | `no open EVM authorisation window` | Pencere yok, kayıtlı kuantum sonrası anahtar yok veya pencerenin süresi doldu | Anahtar yoksa önce kaydedin, sonra bir pencere açın |
| 27 | `EVM authorisation window exhausted` | Bir sınır tükendi veya işlem pencerenin kapsamı dışında (pencerenin listelemediği standart bir precompile veya kapsamı daraltılmış bir pencerede sözleşme oluşturma dahil) | Daha büyük sınırlarla veya ihtiyacınız olan kapsamla yeni bir pencere açın |
| 28 | `invalid EVM authorisation window` | Limitlerin dışında bir açma isteği veya o noktada kullanılabilir anahtar yok | `blocks`, `max_txs`, `max_value` ve listeleri kontrol edin; anahtarı kaydedin veya onarın |
| 62 | `delegated account has no window covering this action` | Delege edilmiş bir hesap eylemde bulundu veya gönderen, penceresinin kapsadığından fazlasını taşıdı ve kapsayan bir pencere yoktu. v3.2.8'den itibaren aynı kural yalnızca ihlal eden çağrıyı başarısız kılar | O hesap için eylemi kabul eden bir pencere açın |
| revert | `<method> is disabled: the circuit breaker has tripped ...` | Native mesajı kapatılmış standart bir precompile yöntemi | Bekleyin; pencerede değiştirilecek bir şey yok |
| revert | `<method>: account ... has no open EVM authorisation window that lists 0x...` | Pencereleri onu listelemeyen bir hesap için kod üzerinden erişilen, değer taşıyan bir precompile | Precompile'ı `allowed_targets` içine ekleyin |
| nonce | `nonce too low` | EVM işlemi pencere açılmadan önce imzalandı (açmak nonce değerini ilerletir) | Nonce değerini yeniden okuyun ve yeniden imzalayın |
| chain id | `only replay-protected (EIP-155) Ethereum transactions are accepted` | Zincir kimliği olmadan imzalanmış bir işlem | Aracın ağ yapılandırmasında zincir kimliğini ayarlayın |

TypeScript SDK'sındaki `classifyEvmWindowRejection(err)`, `"no-pqc-key"`, `"no-window"`, `"exhausted"` veya `"invalid"` döndürür; diğer SDK'ların eşdeğer bir sınıflandırıcısı vardır (Python'da `describe_evm_window_error`, Go'da `tx.ClassifyEVMWindowError`, Rust'ta `classify_evm_window_error`, Java'da `EvmWindowIssue.classify`).

## Pencerenin yönetmedikleri {#outside}

Pencere EVM hattını, yani yalnızca klasik anahtarla imzalanan işlemleri yönetir. Aşağıdakiler ona yazılmaz, çünkü her biri kendi kuantum sonrası imzasını taşır veya imzalamış bir hesap için bir modül tarafından başlatılır:

- Hesabın kendisinin imzaladığı Native hat mesajları: bank gönderimleri, staking, yönetişim ve imzalayanın kendi `0x` adresi olarak çalışan, EVM'ye yapılan bir `MsgCrossVMCall`.
- Hesabın kimlik doğrulayıcıları tarafından yetkilendirilen soyut hesap yürütmeleri.
- Modüllerin çalıştırdığı ERC-20 dönüşümleri ve IBC geri çağrıları.

Göndericinin kendisinin göndermediği EVM'ye yapılan bir cross-VM çağrısı (örneğin bir authz yetkisi altında) göndericinin penceresi altında çalışır ve hedefi kabul etmesini gerektirir. `0x0901` cross-VM köprüsü, onu listeleyen bir pencere gerektirir. Bkz. [Cross-VM Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability).

## MetaMask ve QoreX akışı {#qorex-flow}

MetaMask bir Ethereum anahtarıyla imzalar; bu, **Ethereum tarzı (coin 60) bir hesabın** anahtarıdır ve MetaMask bir Native mesaj üretemez. Böyle bir hesabın penceresini QoreX'te açar; QoreX'in kendi gönderimleri Native hattı kullanır ve hiçbir zaman pencere gerektirmez.

1. QoreX'te, MetaMask ifadeniz için coin-60 hesabını ekleyin veya geri yükleyin (bkz. [MetaMask veya Dashboard'dan bir ifadeyi geri yükleme](/qorex/getting-started#restore-dashboard)). Hesabın kayıtlı bir ML-DSA-87 anahtarı olmalıdır; ilk QoreX transferiniz bunu kaydeder.
2. **EVM erişim penceresi** kartını açın (uygulama: Ayarlar, Güvenlik, EVM erişim penceresi; uzantı: açılır pencerede **EVM erişim penceresi** düğmesi) ve kaç blok (17,280'e kadar), kaç işlem (1,000'e kadar) ve QOR cinsinden harcama tavanını seçin. Tavan her tutarı ve azami ücretini kapsar. Varsayılanlar 300 blok, 5 işlem ve 1 QOR'dur.
3. Hibrit imzalı mesajı onaylayın. Yeni bir pencere açık olanın yerine geçer ve açmak nonce değerinizi ilerletir; bu yüzden MetaMask'ten yalnızca sonrasında gönderin; daha önce hazırlanmış bir işlem "nonce too low" ile reddedilir.
4. MetaMask'ten 9800 (test ağı) veya 9801 (ana ağ) zincir kimliğine karşı gönderin. İşiniz bittiğinde, yalnızca bir pencere canlıyken sunulan **Pencereyi kapat** seçeneğini kullanın.

QoreX kartı üç sınırı ayarlar. Kapsam listeleri (`allowed_targets`, `validators`, `staking_validators`, `ibc_receivers`, `native_only`) için bir ekran sunmaz; bu yüzden kapsamı daraltılmış bir pencere `qorechaind` veya bir SDK'dan gelir. Kart ve dört durumu için bkz. [EVM erişim penceresi](/qorex/security-and-recovery#evm-window).

## İlgili sayfalar {#related}

- [EVM Geliştirme](/developer-guide/evm-development): çalışma zamanı, gaz limitleri ve [v3.2.8 pencere seçenekleri](/developer-guide/evm-development#evm-window-v328)
- [EVM Precompile'ları](/developer-guide/evm-precompiles)
- [Cross-VM Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability)
- [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing)
- [SDK EVM kılavuzu](/sdk/guides/evm#evm-window-scope)
- [İşlem Komutları](/cli-reference/transaction-commands#open-evm-window) ve [Sorgu Komutları](/cli-reference/query-commands)
- [REST ve gRPC uç noktaları](/api-reference/rest-grpc-endpoints)
- [İlk İşleminiz](/getting-started/first-transaction#evm-window)
- [QoreX: EVM erişim penceresi](/qorex/security-and-recovery#evm-window)
