---
slug: /developer-guide/governance-proposals-contracts
title: "Sözleşmeler için Yönetişim Önerileri: Native Kod Yükleme ve VM'ler Arası Erişimi Açma (Test Ağı)"
sidebar_label: Sözleşme Önerileri
sidebar_position: 12
---

# Sözleşmeler için Yönetişim Önerileri: Native Kod Yükleme ve VM'ler Arası Erişimi Açma (Test Ağı)

QoreChain test ağı `qorechain-diana` üzerinde hiç kimse bir QoreChain Native (CosmWasm) sözleşmesini sıradan bir işlemle yükleyemez; yönetişim izin verene kadar hiçbir EVM sözleşmesi de köprü üzerinden bir Native sözleşmeyi çağıramaz. İkisi de bir **yönetişim önerisinden** geçer: öneri derlenmiş kodunuzu saklar, isteğe bağlı olarak sözleşmeyi oluşturur ve onu VM'ler arası izin listesine, yüklediğiniz **tam koda sabitlenmiş** olarak ekler. Bu sayfa, bir geliştiriciye böyle bir önerinin nasıl hazırlanacağını, gönderileceğini, izleneceğini ve doğrulanacağını, ardından onaylanan sözleşmenin Solidity'den nasıl çağrılacağını gösterir.

Bu sayfa canlı test ağında **22 Kasım 2026** tarihinde kontrol edildi (zincir `qorechain-diana`, zincir v3.2.9 20 Kasım'dan beri). Zincir üzerindeki örnekler gerçek önerilerdir: 40 (`qday-receipts` sözleşmesi, kod 865), 23, 27 ve 34 (saklanan kod), 19 ve 20 (örnek oluşturma kuralları), 32 (izin listesi). `qorechaind` komut satırları mevcut CLI başvurusundan ve zincirdeki öneri JSON'undan yazıldı; ikili dosyanın kendisi bu sayfa için çalıştırılmadı, bu yüzden bir bayrak farklıysa makinenizde bir kez `qorechaind tx gov submit-proposal --help` çalıştırın.

:::note Yalnızca test ağı
Bu adımlar test ağını anlatır. Ana ağda açık VM'ler arası köprü yoktur ve orada da kod yükleme yalnızca yönetişimledir. Test QOR'un değeri yoktur; yalnızca test hesapları kullanın.
:::

## Neden yönetişimden geçer {#why}

* **Yükleme hesaplara kapalıdır.** `code_upload_access` değeri `Nobody` ve `MsgStoreCode` devre kesici listesindedir. Bir yönetişim önerisi kesiciyi açar, kodu yönetişim hesabı olarak saklar ve aynı öneri içinde yeniden kapatır; böylece kapı oylar arasında hiçbir zaman açık kalmaz.
* **Örnek oluşturma açıktır.** `instantiate_default_permission` değeri öneri 19'dan beri `Everybody` olduğundan, yönetişim kodunuzu sakladıktan sonra, saklanan kod daha sıkı bir izin taşımıyorsa herkes (siz dahil) ondan sözleşme oluşturabilir.
* **Köprü yalnızca onaylı sözleşmelere ulaşır.** `0x0901` köprüsü yalnızca `bridge_allowed_targets` içindeki hedefleri çağırabilir. Her hedef bir kod kimliğine ve kod geçmişinin uzunluğuna sabitlenir; böylece sözleşme farklı bir koda taşınıp onayını koruyamaz.
* **Atomiktir.** Bir önerinin mesajları birlikte çalışır. Biri başarısız olursa (örneğin zincirin reddettiği bir kod), hiçbiri uygulanmaz ve kesici açık bırakılmaz.

## Neye ihtiyacınız var {#needs}

| Öğe | Nasıl edinilir |
| --- | --- |
| `qorechaind` ikili dosyası (Linux) | [download.qore.host](https://download.qore.host) adresindeki sürüm. Herkese açık kaynak ağacından üretilen bir ikili dosya, zincirin istediği hibrit imzayı atamaz. |
| Kayıtlı bir kuantum sonrası anahtarı olan bir test ağı hesabı | Bkz. [Hibrit imzalama](/cli-reference/transaction-commands#hybrid-signing). |
| Depozito ve ücretler için test QOR | Test ağı musluğu. Normal bir öneri 10 QOR, hızlandırılmış bir öneri 50 QOR ister (aşağıdaki tablo). |
| Sözleşmeyi herkesle aynı şekilde derlemek için Docker | [Docker](https://docs.docker.com/get-docker/). |

## Adım 1: sözleşmeyi derleyin ve sağlama toplamını not edin {#build}

Herkes kaynağınızı yeniden derleyip aynı baytları elde edebilsin diye CosmWasm optimizer ile derleyin. Workshop 3 sözleşmesi Apple Silicon üzerinde arm64 imajıyla derlendi (x86 makine düz `optimizer` imajını kullanır; ikisi farklı sağlama toplamı verir, bu yüzden hangisini kullandığınızı öneri özetinde belirtin):

```bash
cd my-contract
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Sözleşme başına bir satır görmelisiniz: 64 karakterlik onaltılık bir sağlama toplamı ve dosya adı, örneğin `6ebfc32f...5c43c  qday_receipts.wasm`. Bu sağlama toplamı **açılmış wasm dosyasının SHA-256 değeridir** ve zincirin kodunuz için gösterdiği `data_hash` budur. Kopyalayın; oylayanlar kontrol edebilsin diye öneri özetine girer.

Depozito harcamadan önce kodu [Gaz ve yükleme limitleri](/developer-guide/cosmwasm-development#gas-and-limits) bölümündeki limitlere göre kontrol edin: en fazla 4.096 fonksiyon, derlenmiş en fazla 32 MiB, kayan nokta komutu yok.

## Adım 2: kodu öneri için kodlayın {#encode}

Öneri, wasm'ı JSON içinde base64 olarak taşır. Önce sıkıştırın (zincir gzip kabul eder; öneri 40 bunu kullandı: kodu `H4sI` ile başlar):

```bash
gzip -9 -c artifacts/my_contract.wasm | base64 | tr -d '\n' > code.b64
wc -c code.b64
```

Bayt cinsinden bir boyut görmelisiniz. `qday-receipts` kodu, gzip'in base64'ü olarak yaklaşık 99.000 karakterdir. Bir komuta yapıştırmak için çok uzun olduğundan onu bir dosyada tutun.

## Adım 3: öneriyi yazın {#write}

Öneri; `messages`, `metadata`, `deposit`, `title`, `summary` ve `expedited` alanlarına sahip bir JSON dosyasıdır. Aşağıdaki her mesajın `authority` ve `sender` değeri **yönetişim modülü hesabıdır**. Bu sayfadan kopyalamak yerine onu okuyun:

```bash
curl -s https://api-testnet.qore.host/cosmos/auth/v1beta1/module_accounts/gov
```

`"name":"gov"` olan hesabı görmelisiniz; `address` değeri `qor1` ile başlar. Aşağıda ona `<GOV_ADDRESS>` deyin. 22 Kasım 2026'da değeri `qor10d07y265gmmuvt4z0w9aw880jnsr700jwfyxr3` idi.

### Öneri A: kodu saklayın ve sözleşmeyi oluşturun {#proposal-a}

Bu, öneri 40'ın izin listesi mesajı olmayan biçimidir. Sıra önemlidir: kesiciyi açın, saklayın, kesiciyi kapatın, sonra örnek oluşturun.

```json
{
  "messages": [
    {
      "@type": "/cosmos.circuit.v1.MsgResetCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgStoreCode",
      "sender": "<GOV_ADDRESS>",
      "wasm_byte_code": "<CONTENTS OF code.b64>",
      "instantiate_permission": { "permission": "Everybody", "addresses": [] }
    },
    {
      "@type": "/cosmos.circuit.v1.MsgTripCircuitBreaker",
      "authority": "<GOV_ADDRESS>",
      "msg_type_urls": ["/cosmwasm.wasm.v1.MsgStoreCode"]
    },
    {
      "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract2",
      "sender": "<GOV_ADDRESS>",
      "admin": "",
      "code_id": "<NEXT_CODE_ID>",
      "label": "my-contract-v1",
      "msg": {},
      "funds": [],
      "salt": "<BASE64_SALT>",
      "fix_msg": false
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: store my-contract and create one instance",
  "summary": "Stores my-contract, built with cosmwasm/optimizer-arm64:0.16.1 from <SOURCE URL>, sha256 <YOUR CHECKSUM>. No funds, no admin. The MsgStoreCode breaker is reset and tripped again inside this proposal; code upload by accounts stays closed.",
  "expedited": false
}
```

Yer tutucuların nasıl doldurulacağı:

| Yer tutucu | Nasıl edinilir |
| --- | --- |
| `<NEXT_CODE_ID>` | Son kod kimliği artı bir. Sonuncuyu `curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code?pagination.reverse=true&pagination.limit=1"` ile okuyun. 22 Kasım 2026'da sonuncusu 865 idi, dolayısıyla sıradaki 866 idi. Başkasının önerisi önce kod saklarsa sizinki daha sonraki bir kimlik alır ve örnek oluşturma mesajı başarısız olur; bu da önerinin tamamını geri alır (beklemekten başka bir şey kaybedilmez). |
| `<BASE64_SALT>` | Base64 ile kodlanmış herhangi bir kısa metin: `printf 'my-contract-v1' \| base64`. Sözleşme adresini önceden tahmin edilebilir kılar. Öneri 40 `qday-receipts-w3` tuzunu kullandı. |
| `msg` | Sözleşmenizin `instantiate` işlevinin beklediği JSON. Alanı olmayan bir sözleşme için `{}`. |
| `admin` | Boş dize yönetici yok demektir, yani kimse sözleşmeyi taşıyamaz. Köprünün çağıracağı bir sözleşme için bunu tercih edin ([Sabitlemeler](#pins) bölümüne bakın). |
| `instantiate_permission` | `Everybody`, veya kimlerin örnek oluşturabileceğini kısıtlamak için `{ "permission": "AnyOfAddresses", "addresses": ["qor1..."] }` (öneri 34 bir test sözleşmesi için bunu yaptı). |

Öneri içinde örnek oluşturmak zorunda değilsiniz. Yalnızca kodu saklamak için son mesajı çıkarın ve örneği sonra sıradan bir işlemle oluşturun (`tx wasm instantiate`, bkz. [Sözleşme yaşam döngüsü](/developer-guide/cosmwasm-development)). Öneri 23 ve 27 kodu bu şekilde sakladı.

### Öneri B: sözleşmeyi VM'ler arası izin listesine koyun {#proposal-b}

Öneri A geçtikten sonra sözleşme adresini bulun ve canlı VM'ler arası parametreleri okuyun:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID>/contracts"
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>/history"
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params
```

`qor1...` sözleşme adresinizi, **tek** girişli bir geçmişi (`INIT`, kod kimliğiniz) ve parametre kümesini görmelisiniz. VM'ler arası modül için `MsgUpdateParams` **tüm parametre kümesinin yerine geçer**; bu yüzden canlı yanıttan her alanı kopyalayın ve yalnızca iki şeyi değiştirin: hedefinizi `bridge_allowed_targets` listesine ve sabitlemesini `bridge_target_pins` listesine ekleyin.

```json
{
  "messages": [
    {
      "@type": "/qorechain.crossvm.v1.MsgUpdateParams",
      "authority": "<GOV_ADDRESS>",
      "max_message_size": "65536",
      "max_queue_size": 1000,
      "queue_timeout_blocks": "100",
      "enabled": true,
      "bridge_allowed_targets": [
        "<ALL EXISTING ENTRIES, UNCHANGED>",
        "cosmwasm:<CONTRACT_ADDRESS>"
      ],
      "bridge_target_pins": [
        "<ALL EXISTING PINS, UNCHANGED>",
        { "target": "cosmwasm:<CONTRACT_ADDRESS>", "code_id": "<CODE_ID>", "history_len": "1" }
      ],
      "max_pending_per_sender": 100,
      "max_cosmos_tx_gas": "50000000",
      "record_retention_blocks": "100000",
      "max_block_wasm_gas": "3000000",
      "max_tx_wasm_share_bps": 5000,
      "max_block_level_wasm_gas": "10000000",
      "queue_wasm_reserve_bps": 2500,
      "wasm_congestion_max_factor": 20,
      "wasm_congestion_target_bps": 5000,
      "max_block_upload_bps": 5000,
      "max_queue_timeouts_per_block": 100
    }
  ],
  "metadata": "",
  "deposit": "10000000uqor",
  "title": "Testnet: allow the bridge to call my-contract",
  "summary": "Adds cosmwasm:<CONTRACT_ADDRESS> (code <CODE_ID>, no admin) to the bridge allowlist with a pin to that code. The existing targets, their pins and every other cross-VM parameter are unchanged.",
  "expedited": false
}
```

Yukarıdaki sayılar 22 Kasım 2026'da okunan değerlerdir; bunları değil, canlı okuduğunuz değerleri kullanın. Öneri 40, canlı yanıtın da gösterdiği bir alan olan `wasm_congestion_factor_micro` alanını dışarıda bıraktı; canlı yanıtı ve öneri 40'ın şablonunu izleyin ve oylamadan sonra sonucu [VM'ler arası başvuru](/developer-guide/cross-vm-reference#params) sayfasındaki tabloyla karşılaştırın.

### Sabitlemeler: `code_id` ve `history_len` ne anlama gelir {#pins}

| Alan | Anlamı |
| --- | --- |
| `target` | `cosmwasm:` ve ardından sözleşme adresi; `bridge_allowed_targets` içindeki gibi aynen yazılır. |
| `code_id` | Köprünün sözleşmeyi çağırabilmesi için sözleşmenin çalıştırması gereken kod. |
| `history_len` | Sabitlediğiniz anda sözleşmenin kod geçmişinde kaç giriş olduğu. Yeni bir örnekte 1'dir. Bir kez taşınmış bir sözleşmede 2'dir (test ağı izin listesinde böyle bir sözleşme var). Sonraki her taşıma uzunluğu değiştirir; böylece sabitleme artık eşleşmez ve köprü çağrıyı reddeder. |

Yönetişimden başka bir yöneticisi olan, izin listesindeki bir sözleşme sabitlenmelidir, çünkü o yönetici onu taşıyabilir. En basit güvenli tasarım, öneri 40'ın yaptığıdır: yönetici yok ve bir sabitleme.

### İkisini tek öneride yapmak {#one-proposal}

Öneri 40 hepsini tek öneride yaptı: kodu sakladı, bir tuzla örnek oluşturdu ve o tuzun ürettiği adresi sabitledi. Bu, sıradaki kod kimliğini ve gelecekteki sözleşme adresini önceden bilmeyi gerektirir, bu yüzden hata yapmak kolaydır. İki öneri bir oy ve birkaç saat daha fazlaya mal olur; adresi zaten türetmediyseniz onları tercih edin.

## Adım 4: depozito, oylama süresi ve eşikler {#params}

Göndermeden önce canlı kuralları okuyun:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/params/voting
```

| Kural | Normal öneri | Hızlandırılmış öneri (`"expedited": true`) |
| --- | --- | --- |
| Asgari depozito | 10 QOR (`10000000uqor`) | 50 QOR (`50000000uqor`) |
| Depozito süresi (asgariye ulaşmak için) | 172.800 sn (2 gün) | 172.800 sn (2 gün) |
| Oylama süresi | 14.400 sn (4 saat) | 3.600 sn (1 saat) |
| Yeter sayı | Bağlı stake'in %33,4'ü | Bağlı stake'in %33,4'ü |
| Evet eşiği | Kullanılan oyların %50'si | Kullanılan oyların %66,7'si |
| Veto eşiği | %33,4 | %33,4 |
| Asgari ilk depozito | yok | yok |

22 Kasım 2026'da okundu. Aynı yanıttan ayrıca: eşiğin üzerindeki bir "vetolu hayır" oyu depozitoyu yakar (`burn_vote_veto` değeri `true`), yeter sayıyı karşılamayan bir öneri depozitoyu yakmaz ve sayımı başarısız olan hızlandırılmış bir öneri, kullanılmış oylarla birlikte normal öneri olarak devam eder. Test ağı ekibinin sözleşmeler için bugüne dek gönderdiği her öneri hızlandırılmıştı; bir geliştirici önerisi normalde normal kalmalıdır (10 QOR depozito ve dört saatlik oylama etrafında plan yapmak daha kolaydır).

## Adım 5: gönderin {#submit}

Cosmos şeridindeki her işlem hibrit imza taşımalıdır; bu yüzden işlemi önce oluşturur, sonra kuantum sonrası anahtarınızla imzalarsınız. Öneri büyüktür (kod içindedir), bu yüzden gazda pay bırakın: ücret tabanı gaz birimi başına 0,1 uqor'dur ve işlemin her baytı 10 gaza mal olur.

```bash
qorechaind tx gov submit-proposal proposal-a.json \
  --from mykey --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas <GAS> --fees <FEES>uqor \
  --generate-only > submit.json

qorechaind tx pqc cosign submit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

`--gas` ve `--fees` değerlerini bir deneme çalıştırmasıyla belirleyin: önce `tx pqc cosign` komutunu `--dry-run` ile çalıştırın (gaz tahmini yazdırır, hiçbir şey göndermez), sonra tahmini artı %30 değerini `<GAS>`, en az `<GAS>` çarpı 0,1 uqor tutarını `<FEES>` olarak kullanın. Basit bir transfer yaklaşık 300.000 ile 400.000 gaz tutar; bir deploy veya kod taşıyan bir öneri çok daha fazlasına ihtiyaç duyar.

Test ağında ölçüldü: yaklaşık 99 KB sıkıştırılmış kod içeren (102,6 KB JSON) bir öneri 14.961.429 gaz kullandı. Öneri JSON'unun bayt başına yaklaşık 150 gaz hesaplayın; 100 KB'lık bir öneri için en az `--gas 20000000 --fees 2000000uqor` kullanın. Bir oy yaklaşık 153.400 gaz kullandı: `--gas 300000 --fees 30000uqor` kullanın. Kod oylama bittiğinde saklanır ve öneriyi sunana ek maliyeti yoktur.

`--generate-only` imzasız işlemi yazar. `tx pqc cosign` her iki imzayı da ekler ve işlemi yayınlar; arka plan için bkz. [Hibrit imzalama](/cli-reference/transaction-commands#hybrid-signing) ve [gov komutları](/cli-reference/transaction-commands#submit-proposal). Bir işlem özeti ve kod 0 görmelisiniz. Gaz yetersiz hatası görürseniz `--gas` ve buna uygun `--fees` değerini artırın (ücret en az gaz çarpı 0,1 uqor olmalıdır).

Öneri kimliğinizi bulun; bu aynı zamanda işlem olaylarındaki sayıdır:

```bash
curl -s "https://api-testnet.qore.host/cosmos/gov/v1/proposals?pagination.reverse=true&pagination.limit=1"
```

Başlığınızı ve `PROPOSAL_STATUS_VOTING_PERIOD` durumunu görmelisiniz (eklediğiniz depozito asgariye ulaştı). Daha küçük bir depozitoyla durum `PROPOSAL_STATUS_DEPOSIT_PERIOD` olur; herkes bunu tamamlayabilir:

```bash
qorechaind tx gov deposit <PROPOSAL_ID> 5000000uqor --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > deposit.json
qorechaind tx pqc cosign deposit.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

## Adım 6: oy verin {#vote}

Her stake sahibi, elindeki stake ile oy verebilir. Tek bir geliştirici cüzdanı %33,4 yeter sayıya ulaşamaz; bu yüzden test ağı doğrulayıcılarına ve delegatörlerine önerinizi bildirin (okudukları şey öneri özetidir) ve oy vermelerini isteyin. Oy, diğerleri gibi hibrit imzalı bir işlemdir:

```bash
qorechaind tx gov vote <PROPOSAL_ID> yes --from mykey \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443 \
  --gas 400000 --fees 40000uqor --generate-only > vote.json
qorechaind tx pqc cosign vote.json --from mykey --pqc-key mypqc \
  --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Seçenekler `yes`, `no`, `abstain` ve `no_with_veto` değerleridir (bkz. [Yönetişim](/user-guide/governance)). Sayımı ve saati izleyin:

```bash
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>/tally
curl -s https://api-testnet.qore.host/cosmos/gov/v1/proposals/<PROPOSAL_ID>
```

Oylama bittiğinde durum `PROPOSAL_STATUS_PASSED` (mesajlar çalıştı), `PROPOSAL_STATUS_REJECTED` veya `PROPOSAL_STATUS_FAILED` olur. **Failed**, oylamanın geçtiği ama bir mesajın çalışamadığı anlamına gelir; bu durumda hiçbir mesaj uygulanmaz ve `failed_reason` nedenini söyler. Örneğin öneri 40, gönderilmesinden bir saat sonra `PASSED` gösterdi.

## Adım 7: kodu zincir üzerinde doğrulayın {#verify}

Zincirin tuttuğu kodu, derlediğiniz sağlama toplamıyla karşılaştırın. Zincir `data_hash` değerini büyük harflerle bildirir; `sha256sum` küçük harflerle yazdırır.

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.code_info.data_hash'
sha256sum artifacts/my_contract.wasm
```

Her iki satırda aynı 64 karakteri görmelisiniz. Daha güçlü bir kontrol olarak zincirin fiilen tuttuğu baytların özetini alın:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/code/<CODE_ID> | jq -r '.data' | base64 -d | sha256sum
```

Bu, kod 865 için `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` yazdırdı; Workshop 3 kaynağının optimizer derlemesiyle aynı sağlama toplamı. Sonra sözleşmeyi ve öneri B'den sonra izin listesini kontrol edin:

```bash
curl -s https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/<CONTRACT_ADDRESS>
curl -s https://api-testnet.qore.host/qorechain/crossvm/v1/params | jq '{bridge_allowed_targets, bridge_target_pins}'
```

İlk yanıtta `code_id` değerinin sizin olduğunu ve `admin` alanının boş olduğunu, ikincisinde ise `cosmwasm:qor1...` hedefinizi ve sabitlemesini (`code_id`, `history_len` değeri `"1"`) görmelisiniz. 22 Kasım 2026'da listede dört hedef vardı; dördüncüsü `qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8` adresindeki `qday-receipts` idi ve kod 865'e sabitlenmişti.

## Adım 8: bir EVM sözleşmesinden çağırın {#call}

EVM, köprüyü `0x0000000000000000000000000000000000000901` adresinde `executeCrossVMCall(uint8,string,bytes)` ile çağırır: hedef VM `1` (Native), sözleşme adresiniz bir dize olarak ve JSON mesajı bayt olarak. Native taraf, çağıran EVM sözleşmesinin kendi `qor1...` hesabını gönderen olarak görür ve iki taraftan birindeki geri alma ikisini de geri alır.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CallMyContract {
    address constant CROSSVM = 0x0000000000000000000000000000000000000901;

    function record(string calldata contractAddr, bytes calldata executeMsg) external {
        (bool ok, ) = CROSSVM.call(
            abi.encodeWithSignature(
                "executeCrossVMCall(uint8,string,bytes)", 1, contractAddr, executeMsg
            )
        );
        require(ok, "cross-VM call failed");
    }
}
```

İki koşul geçerlidir ve ikisi de [VM'ler arası başvuru](/developer-guide/cross-vm-reference#evm-to-wasm) sayfasında açıklanır: hedef izin listesinde olmalıdır (ve hâlâ sabitlenmiş kodunu çalıştırmalıdır) ve işlemi gönderen hesabın, `allowed_targets` listesinde `0x...0901` bulunan açık bir [EVM yetkilendirme penceresine](/developer-guide/evm-window-reference) ihtiyacı vardır. Bir Solidity mağazası ve `qday-receipts` sözleşmesiyle eksiksiz, test edilmiş bir örnek için [Workshop 3](/build-before-qday/workshop-3#part-2) sayfasını izleyin.

## Sorun giderme {#troubleshooting}

| Gördüğünüz | Olası neden ve çözüm |
| --- | --- |
| `tx wasm store` başarısız olur veya hiç gerçekleşmez | Beklenen durum. Hesaplar test ağında yükleme yapamaz; devre kesici ve `code_upload_access` ikisi de engeller. Öneri kullanın. |
| Öneri durumu `PROPOSAL_STATUS_FAILED` | Oylama geçti ama bir mesaj başarısız oldu, bu yüzden hiçbir şey uygulanmadı. `GET /cosmos/gov/v1/proposals/<id>` içindeki `failed_reason` alanını okuyun. Örnek oluşturma mesajındaki yanlış `code_id` yaygın nedendir. |
| `PROPOSAL_STATUS_REJECTED` | Yeterli evet oyu yok veya yeter sayı yok. Daha net bir özetle yeniden gönderin veya doğrulayıcılardan oy vermelerini isteyin. |
| Durum `PROPOSAL_STATUS_DEPOSIT_PERIOD` olarak kalır | Toplam depozito asgarinin altında (normalde 10 QOR, hızlandırılmışta 50 QOR). 2 gün içinde `tx gov deposit` ile daha fazla ekleyin. |
| Gönderim `pqc` alanında kod 20 ile başarısız olur | İşlem hibrit imza taşımadı. `--generate-only` ve `tx pqc cosign` kullanın. |
| Gönderim gaz yetersiz hatasıyla başarısız olur | Öneri büyük. `--gas` değerini artırın ve ücreti en az gaz çarpı 0,1 uqor tutun. |
| Sağlama toplamı `data_hash` ile farklı | Farklı bir makine türünde veya optimizer sürümünde derlediniz. Öneri özetinde belirtilen imajla yeniden derleyin (arm64 ve x86 imajları farklı baytlar verir). |
| EVM çağrısı `cross-VM bridge call refused: target ... is not allowlisted` ile geri alınır | Sözleşme `bridge_allowed_targets` içinde değil veya sabitlendiğinden beri kodu değişti. Canlı parametreleri sabitlemenizle karşılaştırın. |
| EVM çağrısı köprüye ulaşmadan reddedilir | `0x0901` adresini listeleyen açık bir EVM penceresi yok. Önce bir tane açın. |
| `MsgCrossVMCall` reddedilir | Çağrı devre kesici listesinde duraklatılmış olabilir. `GET /cosmos/circuit/v1/disable_list` okuyun. |
| Öneri B başarısız olur | Parametre kümesi eksikti veya bir sabitleme yanlış. Canlı yanıttaki her alanın bulunduğunu ve `history_len` değerinin geçmiş girişi sayısına eşit olduğunu kontrol edin. |

## İlgili sayfalar {#related}

* Oylama, depozitolar ve öneri türleri için [Yönetişim](/user-guide/governance).
* Sözleşme yaşam döngüsü ve sorgular için [QoreChain Native Geliştirme](/developer-guide/cosmwasm-development).
* Tam `gov` ve `pqc cosign` bayrakları için [İşlem komutları](/cli-reference/transaction-commands#submit-proposal).
* Parametreler, kuyruk ve çağrı örnekleri için [VM'ler arası başvuru](/developer-guide/cross-vm-reference).
* Çalışan bir VM'ler arası örnek için [Workshop 3](/build-before-qday/workshop-3).
