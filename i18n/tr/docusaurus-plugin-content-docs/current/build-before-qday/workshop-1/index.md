---
slug: /build-before-qday/workshop-1
title: "Workshop 1: İlk hibrit imzalı işleminiz"
sidebar_label: "Workshop 1"
sidebar_position: 2
date: 2026-11-12
---

# Workshop 1: İlk hibrit imzalı işleminiz

Bu kılavuz sizi hiçbir şeyin kurulu olmadığı bir bilgisayardan, aynı anda iki anahtarla imzalanmış ve QoreChain testnet'i tarafından doğrulanmış tek bir işleme götürür. Her şey kendi ortamınızda, tek kullanımlık bir testnet hesabıyla çalışır.

## Ne geliştiriyoruz {#what-we-built}

Tek komutla iskeleti oluşturulan, test edilen ve QoreChain testnet'ine dağıtılan eksiksiz bir Solidity projesi; ardından **aynı anda iki anahtarla** imzalanmış ve zincir tarafından kontrol edilen bir işlem.

Gösterdikleri:

- **Hibrit imzalama.** İşlem, klasik bir secp256k1 imzası ve kuantum sonrası bir ML-DSA-87 imzası (NIST FIPS 204) taşır.
- **Zincir üzerinde doğrulanan hibrit imzalı bir işlem.** Validatörler her iki imzayı da doğrular. Kanıtı herkese açık REST uç noktasından (`PQCHybridSignature` uzantısı ve `pqc_hybrid_verify` olayı) ve explorer'da okursunuz.
- **EVM yetkilendirme penceresi.** Bir Ethereum işlemi kuantum sonrası imza taşıyamaz. Bu yüzden QoreChain'de ML-DSA-87 anahtarınızı bir kez kaydeder ve hibrit imzalı bir mesajla kısa bir pencere açarsınız; bu pencere süresince normal EVM işlemleriniz kabul edilir. Fikrin ayrıntısı için [5 Dakikada Dağıtım](/getting-started/deploy-in-5-minutes) sayfasına bakın.

Quantum Pass seviyesinin istediği tam olarak budur.

## Ön koşullar {#prerequisites}

macOS, Linux ya da Windows (WSL ile) çalışan bir bilgisayara, bir terminale ve bir web tarayıcısına ihtiyacınız var. Önce şunları kurun ve her sürümü kontrol edin:

| Araç | Sürüm | Kontrol | Kurulum |
| --- | --- | --- | --- |
| Node.js | 22 veya üstü (Hardhat 3 gerektirir) | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 9 veya üstü | `pnpm -v` | `npm install -g pnpm` (ya da `corepack enable`) |
| curl | herhangi biri | `curl --version` | macOS ve Linux'ta hazır gelir |
| jq (isteğe bağlı) | herhangi biri | `jq --version` | [jqlang.org](https://jqlang.org), yalnızca 6. adımda çıktıyı süzmek için kullanılır |

Faucet'i kullanmak için ayrıca QoreChain dashboard'unda bir hesaba ihtiyacınız var (4. adım).

Bu kılavuzda kullanılan ağ ve herkese açık uç noktalar:

| Servis | URL |
| --- | --- |
| Testnet | `qorechain-diana`, EVM chain ID 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (Testnet'e geçin) |
| Faucet | `https://dashboard.qorechain.io/faucet` (giriş gerekir) |

:::caution Yalnızca tek kullanımlık testnet anahtarları
Bu alıştırma için üretilmiş, yalnızca test QOR'u tutan anahtarlar kullanın. Gerçek para tutan bir hesabın anahtarını ya da kurtarma kodunu asla `.env` dosyasına koymayın ve `.env` dosyasını asla git'e commit etmeyin.
:::

## Adımlar {#steps}

### 1. Adım: Araçlarınızı kontrol edin {#step-1}

1. Bir terminal açın.
2. Yukarıdaki tablodaki kontrolleri çalıştırın:

```bash
node -v
pnpm -v
```

`node -v` çıktısı `v22` veya daha yüksek olmalıdır. Değilse devam etmeden önce daha yeni bir Node.js kurun.

### 2. Adım: Projenin iskeletini oluşturun ve testleri çalıştırın {#step-2}

1. Projeyi yeni bir klasörde oluşturun. `npx` komutu iskele aracını indirir, bu yüzden internet erişimi gerekir:

```bash
npx create-qorechain-dapp@latest qday-demo -t hardhat --network testnet --package-manager pnpm
```

2. Klasöre girin ve testleri çalıştırın. Testler yerel, simüle edilmiş bir zincirde çalışır ve hiçbir şey göndermez:

```bash
cd qday-demo
pnpm test
```

`Done! Created qday-demo` çıktısını, ardından testlerden `2 passing` çıktısını görmelisiniz.

3. Elde ettiklerinize bakın: `contracts/Counter.sol`, `ignition/modules/Counter.ts`, `scripts/window.ts` (yetkilendirme penceresi için yardımcı betik) ve `qorechainTestnet` ağını (chain ID 9800) içeren `hardhat.config.ts`. Şablonlar hakkında daha fazlası: [İskeleler ve CLI](/developer-tools/scaffolders-and-cli) ve [Zincir geliştirici kiti](/developer-tools/chain-dev-sdk).

### 3. Adım: Tek kullanımlık bir testnet hesabı oluşturun {#step-3}

Hesabın iki sırra ihtiyacı vardır: Ethereum tarzı bir özel anahtar ve kuantum sonrası ML-DSA-87 anahtarının türetildiği bir **kurtarma kodu** (`QRC1` ile başlar). Aşağıdaki komut ikisini de projenin zaten kurduğu kütüphanelerle üretir ve doğrudan yeni bir `.env` dosyasına yazar; böylece ekrana hiçbir şey yazdırılmaz ve hiçbir yere yapıştırılmaz. Komutu `qday-demo` klasörünün içinden çalıştırın:

```bash
node --input-type=module -e '
import { generatePrivateKey } from "viem/accounts";
import { generatePqcRecoveryCode } from "@qorechain/sdk";
import { writeFileSync } from "node:fs";
writeFileSync(".env", `PRIVATE_KEY=${generatePrivateKey()}\nQORE_PQC_RECOVERY_CODE=${generatePqcRecoveryCode()}\nQORE_NETWORK=testnet\n`);
console.log(".env written");
'
```

`.env written` yazdırır. Notlar:

- Komut, iskele aracının oluşturduğu yer tutucu `.env` dosyasının yerine geçer. Yalnızca bir kez çalıştırın. Yeni bir çalıştırma farklı bir hesap ve farklı bir kuantum sonrası anahtar üretir.
- `.env` dosyasını olduğu gibi saklayın: aynı özel anahtar ve aynı kurtarma kodu size her seferinde aynı hesabı verir. Dosyayı kaybederseniz yeni bir hesapla baştan başlayın.
- Mnemonic mi tercih edersiniz? Yukarıdaki iki satır yerine `.env` dosyasına `QORE_MNEMONIC="your twelve words"` yazın. Mnemonic ile her iki anahtar da aynı ifadeden gelir ve kurtarma koduna gerek kalmaz. Yalnızca bu alıştırma için üretilmiş bir ifade kullanın.

Şimdi projeden yeni hesabınızın adresini isteyin:

```bash
pnpm window status
```

Üç satır görmelisiniz:

```text
account:  0x...  (qor1...)
PQC key:  not registered (run: pnpm window register)
window:   none (run: pnpm window open)
```

`qor1...` adresini kopyalayın. Faucet'e vereceğiniz adres odur.

### 4. Adım: Faucet'ten testnet QOR'u alın {#step-4}

1. Tarayıcınızda [faucet](https://dashboard.qorechain.io/faucet) sayfasını açın ve giriş yapın.
2. `qor1...` adresinizi yapıştırın (dashboard adresinizi biliyorsa **Use my address** seçeneğini seçin).
3. **Request Tokens** düğmesini seçin. Kartta 100 QOR ve festival test tokenleriyle birlikte **Tokens Sent!** ifadesi ile bir **View on Explorer** bağlantısı görünür.

Faucet, hesap başına ve adres başına 24 saatte bir ödeme yapar. Tam miktarlar [Faucet](/dashboard/faucet) sayfasındadır. Terminale dönün ve hesabın artık zincirde var olduğunu kontrol edin:

```bash
pnpm window status
```

Çıktı artık "does not exist on chain yet" hatasıyla başarısız olmaz, yanıt verir.

### 5. Adım: Anahtarınızı kaydedin, pencereyi açın, dağıtın {#step-5}

1. ML-DSA-87 anahtarınızı kaydedin. Bu, hesap başına bir kerelik bir adımdır ve zincirin kayıt için istediği şekilde klasik anahtarla imzalanır:

```bash
pnpm window register
```

`registered: <HASH>` yazdırır.

2. Yetkilendirme penceresini açın. Bu işlemin kendisi **hibrit imzalıdır**:

```bash
pnpm window open
```

`opened: <HASH>` yazdırır, ardından `window: 600 blocks, 5 txs, 3750000 uqor (value plus fees)` gibi bir satır gelir. `opened:` hash'ini not edin: 6. adımda onu doğrulayacaksınız.

3. Yaklaşık 10 saniye bekleyin. Pencere hesabın nonce değerini ilerletti ve Hardhat onayları bekliyor.
4. Kontratı derleyin ve dağıtın:

```bash
pnpm build
pnpm deploy:testnet
```

"Confirm deploy to network qorechainTestnet (9800)?" sorusuna `y` yanıtını verin. `CounterModule#Counter - 0x...` çıktısını görmelisiniz.

### 6. Adım: Hibrit imzayı zincir üzerinde doğrulayın {#step-6}

5. adımdaki `opened:` işlemi her iki anahtarla da imzalandı. `<HASH>` yerine o hash'i yazın ve herkese açık REST uç noktasından okuyun:

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

Şunlara bakın:

1. `tx_response.code` değeri `0` olmalı.
2. İşlem gövdesinde, ML-DSA-87 imzasını tutan `PQCHybridSignature` uzantısı: 64 baytlık secp256k1 imzasının yanında **4.627 bayt**.
3. `tx_response.events` içinde, `status` özniteliği `verified` olan `pqc_hybrid_verify` olayı. Yalnızca o olayı yazdırmak için (`jq` gerekir):

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> \
  | jq '.tx_response.events[] | select(.type=="pqc_hybrid_verify")'
```

Ardından explorer'da görün:

1. [explore.qore.network](https://explore.qore.network) adresini açın.
2. Ağ seçiciyi **Testnet**'e getirin.
3. Hash'i aratın. İşlem sayfası imza güvenliğini kuantum güvenli, zincir üzerinde doğrulanmış ve ML-DSA-87 algoritmasıyla (FIPS 204) gösterir.

Kanıt budur: validatörler her iki imzayı da kontrol etti.

## Görmeniz gerekenler {#what-you-should-see}

| Nerede | Ne |
| --- | --- |
| 2. adımdan sonra | `Done! Created qday-demo` ve `2 passing` |
| 3. adımdan sonra | `.env written`, ardından `0x...` ve `qor1...` adreslerinizi içeren bir `account:` satırı |
| 4. adımdan sonra | Faucet'te **Tokens Sent!** ve `pnpm window status` çıktısında var olan bir hesap |
| 5. adımdan sonra | `registered: <HASH>`, `opened: <HASH>`, ardından `CounterModule#Counter - 0x...` |
| 6. adımdan sonra | REST çıktısında ve Testnet'teki explorer'da `code` 0, 4.627 baytlık bir ML-DSA-87 imzası ve `status` değeri `verified` olan `pqc_hybrid_verify` |

## Kullanılan paketler {#published}

İskeleti oluşturulan `package.json` içinde bildirilenler:

| Paket | Kayıt defteri | Sürüm |
| --- | --- | --- |
| `create-qorechain-dapp` | npm | 0.14.0 |
| `@qorechain/sdk` | npm | ^0.14.0 |
| `@qorechain/evm` | npm | ^0.14.0 |
| `@cosmjs/stargate` | npm | ^0.39.0 |
| `hardhat` | npm | ^3.21.1 |
| `viem` | npm | ^2.47.6 |
| `tsx` | npm | ^4.19.0 |
| `typescript` | npm | ^5.6.3 |

İskele aracı ayrıca oluşturulan `package.json` içinde listelenen Hardhat toolbox, Ignition ve keystore eklentilerini kurar.

## Sorun giderme {#troubleshooting}

| Gördüğünüz | Neden | Ne yapmalı |
| --- | --- | --- |
| Pencere açıldıktan hemen sonra `HHE10402` ya da "wait for confirmations" | Pencerenin açılması hesabın nonce değerini ilerletti | `pnpm deploy:testnet` komutunu yeniden çalıştırın |
| "EVM authorisation window exhausted" ya da "no window" | Pencerenin işlem ya da blok hakkı bitti ya da pencere başka bir kontrata kapsamlandı (başka bir kontrata kapsamlanmış pencere dağıtımı engeller) | Yeni bir pencere açmak için `pnpm window open` çalıştırın, yaklaşık 10 saniye bekleyin, sonra yeniden dağıtın |
| "account has no PQC key and classical fallback is disabled" | Hesap bir ML-DSA-87 anahtarı kaydetmedi | Önce `pnpm window register` çalıştırın, sonra pencereyi açın |
| "does not exist on chain yet" | Hesapta henüz QOR yok | Faucet'ten QOR alın (4. adım) |
| Faucet'te "Rate Limit Reached" ya da 30 saniye sonra bile token gelmemesi | Hesap başına ve adres başına 24 saatte bir talep hakkı vardır ve talepler sırayla işlenir | Birkaç saniye bekleyip yeniden deneyin ya da bekleme süresinin bitmesini bekleyin |
| `pnpm window` eksik bir kurtarma koduyla ilgili bir mesajla duruyor | `.env` içinde `QORE_PQC_RECOVERY_CODE` olmadan `PRIVATE_KEY` var | 3. adımı yeniden yapın ya da `QORE_MNEMONIC` kullanın |
| Hardhat başlamayı reddediyor | Node.js 22'den eski | Node.js 22 veya üstünü kurun ve `pnpm install` komutunu yeniden çalıştırın |

## Örnek uygulamalar {#example-apps}

Aynı akış, birkaç dilden ve ön yüzden. Her biri hibrit imzalar. Hepsi herkese açık [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday) deposunda, `workshop-1` klasöründedir. Şu şekilde alın:

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1
```

Her uygulama sayfası, başından sonuna kadar kendi başına eksiksiz bir kılavuzdur.

| Uygulama | Dil | Sayfa |
| --- | --- | --- |
| Q-Day Counter | TypeScript, Solidity | [qday-counter](/build-before-qday/workshop-1/apps/qday-counter) |
| Q-Day Guestbook | TypeScript, Solidity | [qday-guestbook](/build-before-qday/workshop-1/apps/qday-guestbook) |
| Hybrid Inspector | TypeScript | [hybrid-inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) |
| Q-Day Pay | Rust | [rust-qday-pay](/build-before-qday/workshop-1/apps/rust-qday-pay) |
| Q-Day Tip Jar | Java | [java-tipjar](/build-before-qday/workshop-1/apps/java-tipjar) |
| Q-Day Airdrop | Python | [python-airdrop](/build-before-qday/workshop-1/apps/python-airdrop) |

Bu uygulamaların arkasındaki kitler [Kitler](/build-before-qday/workshop-1/kits) sayfasında listelenir. QoreX cüzdanını bir tarayıcı dApp'iyle kullanmak için [QoreX](/qorex/overview) sayfasına bakın.
