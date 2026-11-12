---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector, `qorechain-diana` testnet'inde bir QoreChain hibrit imzasının neye benzediğini gösteren küçük bir web sayfasıdır (React ile yazılmıştır). QoreX cüzdanını bağlarsınız, QoreX'in hem secp256k1 hem ML-DSA-87 ile imzaladığı tek bir işlem gönderirsiniz ve sayfa o işlemi açıp içine bakar: klasik imza, kuantum sonrası imza ve zincirin kendi kararı. İsterseniz herhangi bir testnet işlem hash'ini de yapıştırabilirsiniz.

**Ne kadar sürer:** kurulumlar dahil yaklaşık 20 dakika. Sonrasında sayfa saniyeler içinde çalışır.

## Ne gösterir {#what-it-shows}

- **Bir web sayfasından hibrit ML-DSA-87 + secp256k1 imzalama.** Sayfa, kodlanmış bir mesajı `qorexSignAndBroadcast` ile QoreX'e verir. QoreX iki anahtarla da imzalar ve yayınlar.
- **Zincir üzerinde doğrulanan tek bir hibrit imzalı işlem.** Sayfa, işlem için zincirin `pqc_hybrid_verify` olayını okur. Bu olay, zincirin kuantum sonrası imzayı kontrol ettiğini söylemesidir.
- **Boyutlar görünür.** Klasik imza 64 bayttır. ML-DSA-87 imzası (FIPS 204) 4.627 bayttır ve işlemin `PQCHybridSignature` uzantısında taşınır.

## Adım adım {#steps}

Kendi terminalinizde ve tarayıcınızda çalışırsınız. Yalnızca tek kullanımlık bir testnet hesabı kullanırsınız. Testnet QOR'unun değeri yoktur. Burada asla gerçek bir cüzdan veya gerçek para kullanmayın.

### 1. Başlamadan önce: araçları kurun {#install}

Dört şeye ihtiyacınız var: Chromium tabanlı bir tarayıcı (Chrome, Edge veya Brave), **Git** (kodu indirir), **Node.js** (sayfanın araçlarını çalıştırır) ve **pnpm** (sayfanın kütüphanelerini kurar). Node.js 22 veya daha yenisini kullanın. Sayfa Node.js 20'den itibaren de çalışır, ancak 22 tüm workshop uygulamaları için güvenli seçimdir.

**macOS**

| Araç | Nasıl kurulur | Kontrol |
| --- | --- | --- |
| Git | `xcode-select --install` (veya `brew install git`) | `git --version` |
| Node.js 22+ | https://nodejs.org adresinden LTS yükleyicisini indirin veya `brew install node` çalıştırın | `node --version` (v22 veya daha yüksek göstermeli) |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Windows** (PowerShell kullanın)

| Araç | Nasıl kurulur | Kontrol |
| --- | --- | --- |
| Git | https://git-scm.com/download/win adresinden indirin | `git --version` |
| Node.js 22+ | https://nodejs.org adresinden LTS yükleyicisini indirin (veya `winget install OpenJS.NodeJS.LTS`) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Linux (Debian veya Ubuntu)**

| Araç | Nasıl kurulur | Kontrol |
| --- | --- | --- |
| Git | `sudo apt update && sudo apt install -y git curl` | `git --version` |
| Node.js 22+ | https://nodejs.org/en/download adresindeki adımları izleyin (Linux'u, ardından LTS sürümünü seçin) | `node --version` |
| pnpm | `npm install -g pnpm` | `pnpm --version` |

**Dikkat:** Homebrew ile kurulan Node.js, pnpm'i içermez. `pnpm: command not found` görürseniz `npm install -g pnpm` çalıştırın, ardından yeni bir terminal açın.

**Ne görmelisiniz:** her kontrol komutu bir sürüm numarası yazdırır. `node --version` çıktısı `v22` veya daha yüksek bir değerle başlar.

### 2. Başlamadan önce: testnet'te QoreX {#qorex}

QoreX, resmî QoreChain cüzdanıdır. Bu sayfa, sayfayı açtığınız tarayıcıda **QoreX tarayıcı uzantısına** ihtiyaç duyar. Uzantıyı tarayıcınızın mağazasından kurun. [QoreX Entegrasyonları](/developer-tools/qorex-integrations) ve [dApp tarayıcısı](/qorex/dapp-browser) sayfalarına bakın.

Yalnızca bu alıştırma için oluşturulmuş **yeni, tek kullanımlık bir hesap** kullanın. QoreX hesabı oluştururken bir kurtarma ifadesi gösterir. Onu kâğıda yazın, gizli tutun ve asla mainnet'te yeniden kullanmayın.

QoreX'i testnet'e geçirin:

- **Tarayıcı uzantısı:** kilidini açın, alttaki sürüm numarasına 7 kez dokunun, ardından **Switch to testnet (diana)** seçeneğini seçin.
- **QoreX uygulaması:** Ayarlar'ı açın ve **Use testnet (developers)** seçeneğini açın. (Sayfa masaüstü tarayıcıda çalıştığı için bu kılavuzda uzantıyı kullanırsınız.)

Testnet geçişi hakkında daha fazla bilgi için [5 Dakikada Dağıtım](/getting-started/deploy-in-5-minutes#step-testnet) sayfasına bakın. Hesap adresinizi kopyalayın (`qor1...` ile başlar).

Bu sayfa için bir Ethereum hesabına (coin 60) ihtiyacınız yoktur, çünkü sayfa bir QoreChain Native ödemesi gönderir.

### 3. Faucet'ten testnet QOR alın {#faucet}

Faucet, bir adrese ücretsiz testnet QOR gönderen bir web sitesidir.

1. https://dashboard.qorechain.io/faucet adresini açın ve oturum açın.
2. `qor1...` adresinizi yapıştırın ve talep edin. Faucet **hesap başına 24 saatte 100 QOR** verir.

**Tutarlar:** okuduğunuz birim **QOR**'dur. Zincir, en küçük birim olan **uqor** ile sayar. 1 QOR = 1.000.000 uqor. Sayfa sizden QOR ister ve sizin için dönüştürür.

**Bilmekte fayda var:** yeni bir hesabın ilk işlemi, kuantum sonrası ML-DSA-87 anahtarını zincire kaydeder. Bu, yaklaşık 0,09 QOR'luk tek seferlik bir ücrettir. QoreX bunu ilk gönderiminizde sizin için yapar.

### 4. Kodu alın {#get-code}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

| Parça | Anlamı |
| --- | --- |
| `git clone <address>` | Örnek uygulamaların tam bir kopyasını GitHub'dan `build-before-qday` adlı yeni bir klasöre indirir. |
| `cd <folder>` | Terminalinizi Hybrid Inspector klasörüne taşır. Sonraki tüm komutlar buradan çalışır. |

**Ne görmelisiniz:** `Cloning into 'build-before-qday'...`. Kontrol için `ls` çalıştırın: `package.json`, `src`, `index.html` ve `vite.config.ts` görürsünüz.

### 5. Kütüphaneleri kurun {#install-libs}

```sh
pnpm install
```

**Ne yapar:** `pnpm`, sayfanın ihtiyaç duyduğu kütüphaneleri (`package.json` içinde listelenir) `node_modules` adlı bir klasöre indirir. Proje başına bir kez çalıştırırsınız.

| Parça | Anlamı |
| --- | --- |
| `pnpm` | Kütüphaneleri kuran araç. |
| `install` | `package.json` dosyasını oku ve listelenen her şeyi `pnpm-lock.yaml` içindeki sürümlerle kur. |

**Ne kadar sürer:** bir dakikadan az.

**Ne görmelisiniz:** bir ilerleme çubuğu, ardından `Done in` ve bir süre.

### 6. Derlendiğini kontrol edin {#build}

```sh
pnpm build
```

**Ne yapar:** `package.json` içindeki `build` adlı betiği çalıştırır. Bu betik `tsc --noEmit && vite build` komutudur.

| Parça | Anlamı |
| --- | --- |
| `pnpm build` | Projenin `build` betiğini çalıştır. |
| `tsc --noEmit` | TypeScript denetleyicisi. Koddaki hataları arar ve hiçbir dosya yazmaz. |
| `vite build` | Vite, sayfayı `dist` klasöründe küçük bir web sitesi olarak paketler. |

**Ne görmelisiniz:** `transforming...`, ardından `dist/index.html` gibi satırlar ve son olarak bir süreyle `built in` (bir saniyenin çok altında).

### 7. Sayfayı çalıştırın {#run}

```sh
pnpm dev
```

**Ne yapar:** `dev` betiğini çalıştırır; bu betik, sayfayı tarayıcıda kullanabilmeniz için kendi bilgisayarınızda küçük bir web sunucusu başlatır. Çalışırken bu terminali açık bırakın. Durdurmak için Ctrl+C'ye basın.

**Ne görmelisiniz:**

```text
  VITE v5.4.21  ready in 111 ms

  ➜  Local:   http://localhost:5173/
```

http://localhost:5173 adresini QoreX'in kurulu olduğu tarayıcıda açın. 5173 portu doluysa Vite başka bir port yazdırır. Yazdırdığı adresi kullanın.

Bir işlemi doğrudan incelemek için adrese `?tx=<HASH>` ekleyin: `http://localhost:5173?tx=<HASH>`.

**Sayfa neden `/lcd` çağırır:** herkese açık testnet REST servisi CORS başlıkları göndermez, bu yüzden bir tarayıcı sayfası onu doğrudan çağıramaz. Geliştirme sunucusu, `/lcd` üzerinden gelen her çağrıyı `https://api-testnet.qore.host` adresine iletir. Sayfa yalnızca testnet'te çalışır ve bir `.env` dosyası gerekmez.

### 8. Bağlanın, gönderin ve doğrulayın {#connect-send}

1. **Bağlanın.** **Connect QoreX** düğmesine tıklayın. QoreX sayfaya izin vermenizi ister. Onaylayın. Sayfa adresinizi (`qor1...`), testnet bakiyenizi ve bir ML-DSA-87 anahtarının kayıtlı olup olmadığını gösterir. İlk gönderiminize kadar "not registered yet" der.
2. **Gönderim formunu doldurun.**

| Alan | Anlamı |
| --- | --- |
| To | Alıcı adresi (`qor1...`). Varsayılan olarak kendi adresinizle doldurulur, bu da sorun değildir. |
| Amount (QOR) | QOR cinsinden gönderilecek tutar. `1`, 1 QOR = 1.000.000 uqor demektir. |
| Memo | İşleme eklenen ve zincirde saklanan kısa bir metin. Herkes okuyabilir, bu yüzden özel hiçbir şey yazmayın. |

3. **Gönderin.** **Sign with QoreX and send** düğmesine tıklayın. QoreX neyi imzaladığınızı gösterir ve onay ister. Onaylayın. Bloğu bekleyin (birkaç saniye).
4. **İnceleyin.** Sayfa işlemi otomatik olarak inceler. Ayrıca sayfanın 3. adımına herhangi bir 64 karakterlik testnet işlem hash'i yapıştırıp **Inspect** düğmesine tıklayabilirsiniz.

**Ne görmelisiniz:** `QoreX: code 0, shield ..., tx <hash>` satırı, ardından aşağıdaki "Ne görmelisiniz" bölümünde anlatılan inceleme kartı. İşlem hash'ini kopyalayın.

### 9. Sayfa olmadan ikinci bir yolla doğrulayın {#verify-curl}

Zincire doğrudan sorabilirsiniz. Yalnızca `curl` gerekir; macOS ve çoğu Linux sistemi bunu içerir. Windows PowerShell'de `curl.exe` kullanın. `jq` aracı isteğe bağlıdır ve yanıtı okumayı kolaylaştırır (macOS'ta `brew install jq`, Linux'ta `sudo apt install -y jq`, Windows'ta `winget install jqlang.jq`).

```sh
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH> | jq '.tx_response.code, .tx.body.extension_options[0]["@type"], (.tx.body.extension_options[0].pqc_signature | length)'
```

| Parça | Anlamı |
| --- | --- |
| `curl -s <address>` | Yanıtı testnet REST servisinden indirir. `-s` ilerleme çubuğunu gizler. |
| `<HASH>` | 8. adımdaki işlem hash'iniz. |
| `\| jq '...'` | Üç değeri seçip çıkarır. `jq` yoksa bu kısmı bırakın ve tam metni okuyun. |

**Ne görmelisiniz:**

- `code` değeri `0`: işlem başarılı oldu.
- Bir `pqc_signature` içeren `PQCHybridSignature` uzantısı (tür `/qorechain.pqc.v1.PQCHybridSignature`). Base64 metni 6.172 karakter uzunluğundadır; bu, 4.627 bayt ML-DSA-87 imzası demektir.
- `tx_response.events` içinde, `status` özniteliği `verified` olan `pqc_hybrid_verify` türünde bir olay.

**Explorer'da:** https://explore.qore.network adresini açın, **Testnet**'e geçin ve işlem hash'inizi arayın.

## Sorun giderme {#troubleshooting}

| Ne görüyorsunuz | Neden | Ne yapmalı |
| --- | --- | --- |
| `pnpm: command not found` | pnpm kurulu değil. Homebrew'deki Node.js onu içermez. | `npm install -g pnpm` çalıştırın, ardından yeni bir terminal açın. |
| `node --version` v18 veya daha düşük gösteriyor | Node.js çok eski. | Node.js 22 veya daha yenisini kurun (1. adım). |
| Sayfa `QoreX was not found in this page. Install the QoreX extension, switch it to testnet, and reload.` diyor | Uzantı yok, kilitli ya da tarayıcı Chromium tabanlı değil. | Chrome, Edge veya Brave'de QoreX'i kurun ve kilidini açın. Testnet'e geçin, ardından sayfayı yeniden yükleyin. |
| Faucet hız sınırına takıldığınızı söylüyor | Hesap başına 24 saatte bir talep. | 24 saat bekleyin veya ikinci bir tek kullanımlık hesap kullanın. |
| `account has no PQC key and classical fallback is disabled` | Kuantum sonrası anahtar henüz kayıtlı değil. | QoreX'ten bir kez gönderim yapın (anahtarı ilk gönderimde kaydeder, yaklaşık 0,09 QOR). Önce faucet'ten QOR aldığınızdan emin olun. |
| `EVM authorisation window exhausted` | Bu sayfaya değil, Hardhat uygulamasına aittir. | O uygulamada `pnpm window open` ile yeni bir pencere açın. |
| Pencere açıldıktan sonra `HHE10402` | Hardhat uygulamasına aittir. Pencerenin etkinleşmesi birkaç saniye alır. | Dağıtımı yeniden çalıştırın. |
| Tarayıcı konsolunda CORS hatası | Sayfa REST servisini doğrudan çağırdı. | Geliştirme sunucusunun `/lcd` vekilini kullanın (`pnpm dev`) ve sayfayı `http://localhost:5173` adresinde açın. `dist/index.html` dosyasını dosya olarak açmayın. |
| `Enter an amount in QOR, for example 1.` | Tutar boş, sıfır veya sayı değil. | `1` gibi bir sayı yazın. |
| `A transaction hash is 64 hex characters.` | Yapıştırılan hash yanlış veya eksik. | 64 karakterin tamamını yapıştırın. |
| `Transaction not found on qorechain-diana` | Hash başka bir ağdan ya da blok henüz kesinleşmedi. | 10 saniye bekleyin ve yeniden deneyin. QoreX'in testnet'te olduğunu kontrol edin. |
| 5173 portu zaten kullanımda | Başka bir program kullanıyor. | Vite bir sonraki portu seçer ve yazdırır. O adresi açın. |

## Kod {#code}

Bağlanma ve gönderme:

```ts
import { getQorexNative, qorexSignAndBroadcast } from "@qorechain/qorex-types";

const native = getQorexNative();
await native.enable("qorechain-diana");
const key = await native.getKey("qorechain-diana");      // key.bech32Address

const r = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes(from, to, uqor) }],
  memo,
});                                                       // r.txHash, r.code, r.shield
```

Kanıtı zincirden okuma:

```ts
const res = await fetch(`/lcd/cosmos/tx/v1beta1/txs/${hash}`).then((r) => r.json());
const tx = res.tx;
const ext = [...(tx.body.extension_options ?? []), ...(tx.body.non_critical_extension_options ?? [])];
const hyb = ext.find((x) => String(x["@type"]).includes("PQCHybridSignature"));
const verify = (res.tx_response.events ?? []).filter((e) => e.type === "pqc_hybrid_verify");
// classical signature: atob(tx.signatures[0]).length  -> 64
// ML-DSA-87 signature: atob(hyb.pqc_signature).length -> 4627
```

`msgSendBytes`, `src/App.tsx` içindeki bank `MsgSend` mesajı için küçük bir protobuf kodlayıcısıdır; çünkü QoreX kodlanmış mesajı alır. Sayfa, kodu 0 olan, `pqc_hybrid_verify` olayının durumu `verified` olan ve kuantum sonrası imzası 4.627 bayt olan bir işlemi hibrit doğrulanmış olarak işaretler.

## Ne görmelisiniz {#result}

- Üst bilgide `qorechain-diana (testnet)` ve sürekli yükselen bir blok yüksekliği görünür.
- Bağlandıktan sonra: adresiniz, bakiyeniz ve anahtar durumu.
- Gönderdikten sonra: işlem hash'i ve sonuç kodu, ardından memo, mesaj türü, 64 baytlık klasik imza, ilk baytları onaltılık olarak gösterilen 4.627 baytlık ML-DSA-87 imzası, `ML-DSA-87 (FIPS 204)` algoritma adı ve `pqc_hybrid_verify` kararı içeren inceleme kartı.
- Explorer'da: https://explore.qore.network adresini açın, **Testnet**'e geçin ve işlem hash'inizi arayın.

## Kullanılan paketler {#packages}

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (sabitlenmiş) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Bağımlılık olarak listelenir; sayfanın kendisi düz REST çağrıları kullanır |
| `react`, `react-dom` | ^18.3.1 | Arayüz |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React eklentisi |
| `vite` | ^5.4.0 | Geliştirme sunucusu ve derleme |
| `typescript` | ^5.6.3 | Tür denetimi |

## Kaynak kod {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
