---
slug: /build-before-qday/workshop-1/apps/hybrid-inspector
title: Hybrid Inspector
sidebar_label: Hybrid Inspector
sidebar_position: 3
---

# Hybrid Inspector

Hybrid Inspector, `qorechain-diana` testnet'inde bir QoreChain hibrit imzasının neye benzediğini gösteren küçük bir React sayfasıdır. QoreX cüzdanını bağlarsınız, QoreX'in hem secp256k1 hem ML-DSA-87 ile imzaladığı tek bir işlem gönderirsiniz ve sayfa o işlemi açar: klasik imza, kuantum sonrası imza ve zincirin kendi kararı. İstediğiniz herhangi bir testnet işlem hash'ini de yapıştırabilirsiniz.

## Ne gösterir {#what-it-shows}

- **Bir web sayfasından hibrit ML-DSA-87 + secp256k1 imzalama.** Sayfa, kodlanmış bir mesajı `qorexSignAndBroadcast` ile QoreX'e verir. QoreX her iki anahtarla imzalar ve yayınlar.
- **Zincir üzerinde doğrulanan hibrit imzalı bir işlem.** Sayfa, işlem için zincirin `pqc_hybrid_verify` olayını okur. Bu olay, zincirin kuantum sonrası imzayı kontrol ettiğini söylemesidir.
- **Boyutlar görünür.** Klasik imza 64 bayttır. ML-DSA-87 imzası (FIPS 204) 4.627 bayttır ve işlemin `PQCHybridSignature` uzantısında taşınır.

## Adım adım {#steps}

### 1. Araçları kurun

Chromium tabanlı bir tarayıcıya (Chrome, Edge, Brave), Git'e, Node.js 20 veya daha yenisine ve pnpm'e ihtiyacınız var.

- Git: https://git-scm.com/downloads
- Node.js 20+: https://nodejs.org (LTS sürümü yeterlidir)
- pnpm: `npm install -g pnpm`

Sürümleri kontrol edin:

```sh
git --version
node --version     # v20.0.0 or higher
pnpm --version     # 9 or higher
```

### 2. QoreX tarayıcı uzantısını kurun

QoreX'i tarayıcınızın mağazasından kurun. Ayrıntılar için bkz. [QoreX Entegrasyonları](/developer-tools/qorex-integrations) ve [dApp tarayıcısı](/qorex/dapp-browser).

### 3. QoreX'te tek kullanımlık bir testnet hesabı oluşturun

Bu workshop gerçek cüzdanınıza asla ihtiyaç duymaz. QoreX'te yalnızca bu alıştırma için kullanılacak **yeni** bir hesap (yeni bir profil ya da yeni bir cüzdan) oluşturun ve onu `qorechain-diana` testnet'ine geçirin. Testnet geçişi için bkz. [5 Dakikada Dağıtım](/getting-started/deploy-in-5-minutes#step-testnet). QoreX hesabı oluştururken bir kurtarma ifadesi gösterir: onu kâğıda yazın, gizli tutun ve mainnet'te asla yeniden kullanmayın. Hesabın bu alıştırmanın dışında hiçbir değeri yoktur.

Hesap adresini kopyalayın (`qor1...` ile başlar).

### 4. Faucet'ten testnet QOR'u alın

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. `qor1...` adresinizi yapıştırın ve talep edin. Bir talep, hesap başına 24 saatte bir 100 QOR öder.

### 5. Kodu alın

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/03-hybrid-inspector
```

### 6. Bağımlılıkları kurun

```sh
pnpm install
```

### 7. Derlendiğini kontrol edin

```sh
pnpm build
```

Komut projenin tip denetimini yapar ve derler. `built in` ifadesi ve bir süreyle biter.

### 8. Sayfayı çalıştırın

```sh
pnpm dev
```

http://localhost:5173 adresini QoreX'in kurulu olduğu tarayıcıda açın. Bir işlemi doğrudan incelemek için adrese `?tx=<HASH>` ekleyin (`http://localhost:5173?tx=<HASH>`). 5173 numaralı port doluysa Vite onun yerine kullandığı portu yazdırır.

REST çağrıları, `https://api-testnet.qore.host` adresine Vite `/lcd` vekili üzerinden gider; çünkü herkese açık REST uç noktası CORS başlıkları göndermez. Sayfa yalnızca testnet'te çalışır ve `.env` dosyasına gerek yoktur.

### 9. Bağlanın, gönderin ve doğrulayın

1. **Connect QoreX** düğmesine tıklayın. Sayfa adresinizi (`qor1...`), testnet bakiyenizi ve bir ML-DSA-87 anahtarının kayıtlı olup olmadığını gösterir. QoreX anahtarı ilk gönderiminizde kaydeder.
2. Bir not (memo) ile küçük bir miktar QOR **gönderin**. QoreX neyi imzaladığınızı gösterir ve onay ister.
3. Sayfa işlemi otomatik olarak inceler. İstediğiniz herhangi bir 64 karakterlik testnet işlem hash'ini de yapıştırabilirsiniz.

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

`msgSendBytes`, `src/App.tsx` içinde bulunan ve bank `MsgSend` mesajını kodlayan küçük bir protobuf kodlayıcısıdır; çünkü QoreX kodlanmış mesajı alır. Sayfa bir işlemi, kodu 0 olduğunda, bir `pqc_hybrid_verify` olayının durumu `verified` olduğunda ve kuantum sonrası imza 4.627 bayt olduğunda hibrit doğrulanmış olarak işaretler.

## Görmeniz gerekenler {#result}

- Üstbilgide `qorechain-diana (testnet)` ve sürekli yükselen bir blok yüksekliği görünür.
- Bağlandıktan sonra: adresiniz, bakiyeniz ve anahtar durumunuz.
- Gönderdikten sonra: işlem hash'i ve sonuç kodu, ardından memo'yu, mesaj türünü, 64 baytlık klasik imzayı, ilk baytları onaltılık olarak gösterilen 4.627 baytlık ML-DSA-87 imzasını, `ML-DSA-87 (FIPS 204)` algoritma adını ve `pqc_hybrid_verify` kararını içeren inceleme kartı.
- Explorer'da: https://explore.qore.network adresini açın, **Testnet**'e geçirin ve işlem hash'inizi aratın.

## Kullanılan paketler {#packages}

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/qorex-types` | 0.1.0 (sabitlenmiş) | `getQorexNative`, `qorexSignAndBroadcast` |
| `@qorechain/sdk` | ^0.13.0 | Bağımlılık olarak listelenir; sayfanın kendisi düz REST çağrıları kullanır |
| `react`, `react-dom` | ^18.3.1 | Arayüz |
| `@vitejs/plugin-react` | ^4.3.0 | Vite React eklentisi |
| `vite` | ^5.4.0 | Geliştirme sunucusu ve derleme |
| `typescript` | ^5.6.3 | Tip denetimi |

## Kaynak kod {#get-the-code}

https://github.com/qorechain/build-before-qday/tree/main/workshop-1/03-hybrid-inspector
