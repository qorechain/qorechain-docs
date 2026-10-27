---
slug: /developer-tools/qorex-integrations
title: QoreX Entegrasyonları
sidebar_label: QoreX Entegrasyonları
sidebar_position: 22
---

# QoreX Entegrasyonları (`@qorechain/qorex-*`)

QoreX entegrasyonları, [QoreX cüzdanının](/qorex/overview) bir EVM, Cosmos veya Solana ön yüzünde çalışmasını isteyen dApp geliştiricileri ve bu ön yüzleri test eden ekipler için altı küçük npm paketidir. Üçü popüler kütüphaneler için cüzdan bağlayıcılarıdır (RainbowKit, Interchain Kit, cosmos-kit), biri paylaşılan tipleri ve algılama yardımcılarını içerir ve ikisi test araçlarıdır (bir sahte cüzdan ve Playwright fikstürleri). Altısı da sürüm **0.1.0**'dır, 27 Ekim 2026'da yayımlanmıştır, Apache-2.0 lisanslıdır.

Yapmadıkları şeyler: anahtar tutmazlar ve QoreX'i bugün olduğundan fazlası haline getirmezler. Üzerlerine bir şey inşa etmeden önce [Sınırlar ve bilinen sorunlar](#limits) bölümünü okuyun: QoreX'in yayında olan mağaza sürümleri, bu paketlerin bağlanabildiği şeylerin yalnızca bir kısmını destekler ve sınırlar orada belirtilmiştir.

## Yenilikler {#innovations}

* **Yanlış cüzdanı seçemeyen keşif.** QoreX kendini EIP-6963 üzerinden `network.qore.qorex` ters-DNS adıyla duyurur ve `window.ethereum` değerini asla yazmaz. `@qorechain/qorex-types` sağlayıcıyı yalnızca bu ada göre seçer ve RainbowKit cüzdanı bağlayıcıyı duyurulan sağlayıcıya sabitler, `window.ethereum`'a asla geri dönmez.
* **Hibrit imzayı cüzdan oluşturur, sayfa post-kuantum anahtarı asla tutmaz.** QoreChain'in yerel lane'i (native lane) bir secp256k1 imzası artı bir ML-DSA-87 imzası (FIPS 204) gerektirir. Yerel sağlayıcıda (`window.qorex.native`) `signAndBroadcast` çağrısı mesajları QoreX'e verir; QoreX işlemi oluşturur, iki anahtarla imzalar ve yayınlar. Sonuç `txHash`, `code`, `height` ve `shield` alanlarıdır; `shield`, onaylanan işlem hibrit katmanı taşıdığında `shielded` olur.
* **Sürüm kontrolleri yerine yetenek kontrolleri.** Paketler cüzdanın `capabilities` listesini okur (`hasCapability`); böylece `signAndBroadcast` gibi bir özellik, bir sürüm numarasından tahmin edilmez, algılanır.
* **Reddetmeler açıktır ve kodları sabittir.** Amino imzalama tasarım gereği reddedilir, çünkü Amino JSON hibrit imzayı taşıyamaz; bağlayıcılar `QOREX_AMINO_REFUSED`, `QOREX_USE_SIGN_AND_BROADCAST` ve `QOREX_NOT_SUPPORTED_YET` gibi kodlarla `QorexIntegrationError` fırlatır ve `isQorexIntegrationError(err, code)` bunları sınar.
* **Gerçekten imzalayan bir test ikizi.** `@qorechain/qorex-wallet-mock`, QoreX'in enjekte ettiği nesnelerin aynısını enjekte eder (`window.qorex = { evm, native, svm }`), bir Solana cüzdanı kaydeder ve gerçek algoritmalarla imzalar (yerel lane'de QoreSign üzerinden hibrit ML-DSA-87, EVM'de secp256k1, Solana'da ed25519); varsayılan olarak test ağında herkese açık test anımsatıcı ifadesinden (mnemonic) türetilir. Kendini `network.qore.qorex.mock` olarak duyurur; bu yüzden QoreX'i katı biçimde seçen kod onu cüzdanla karıştıramaz.
* **İki davranış profili.** Mock'un `current` profili bugün yayında olan QoreX gibi davranır; `planned` ise QoreX ekibinin duyurduklarını ekler, böylece mock'un cüzdanın henüz yapmadığı bir şeyi yapıyormuş gibi davranmasına gerek kalmadan ileriye dönük geliştirme yapabilirsiniz.
* **Synpress v4 tarzında Playwright fikstürleri** (`qorexMockFixtures`) mock'u gezinmeden önce enjekte eder; böylece uçtan uca bir test için tarayıcı eklentisine gerek kalmaz.
* **Olaysız cüzdan güdümlü hesaplar.** QoreX henüz `accountsChanged` veya `chainChanged` yaymadığı için RainbowKit cüzdanında, sayfa odağı geri kazandığında `eth_accounts` ve `eth_chainId` değerlerini yeniden okuyan, isteğe bağlı bir `pollAccountsOnFocus` seçeneği vardır.

## Ne için kullanılır {#use-cases}

1. **Bir wagmi ve RainbowKit dApp'i QoreX'i ekler.** `qorexWallet` değerini RainbowKit cüzdan listesine ve `QOREX_CHAINS` değerini wagmi yapılandırmasına ekleyin. QoreX'i olan kullanıcılar bağlanır ve dApp onların `0x` adresini ve zincir kimliğini (9801 veya 9800) okur. QoreX'i olmayan kullanıcılar mağaza bağlantılarını görür.
2. **Interchain Kit veya cosmos-kit üzerindeki bir Cosmos dApp'i QoreX'i ekler.** QoreX cüzdanını `ChainProvider` içine ekleyin ve QoreChain işlemlerini `qorexSignAndBroadcast` ile gönderin: QoreX işlemi oluşturur, hibrit imzayı ekler ve yayınlar, çünkü bir sayfa ML-DSA-87 anahtarını tutamaz.
3. **Keplr'ı zaten destekleyen bir dApp.** `window.qorex.native`, Keplr kalıbını izler (`enable`, `getKey`, `signDirect`); bu nedenle entegrasyon birkaç satırdır. Depo kılavuzu her farkı listeler.
4. **Eklenti olmadan cüzdan akışlarının CI testleri.** Bir QA ekibi Playwright'ı `qorexMockFixtures({ profile: "current" })` ile çalıştırır, Connect düğmesine tıklar ve sayfanın `qorex.addresses.evm` değerini gösterdiğini doğrular. `qorex.rejectNext()` reddetme yolunu test eder.
5. **Yeni QoreX özelliklerine ileriden hazırlanmak.** Aynı paketi `profile: "planned"` ile çalıştırarak duyurulan özellikleri (EVM imzalama, hesap değişikliği olayları, hibrit katmanı ekleyen `signDirect`) QoreX bunları yayınlamadan önce deneyin.
6. **Test ağında gerçek yayınları test etmek.** Kendi fonlanmış test ağı anımsatıcı ifadesiyle bir ekip, mock'un `qorechain-diana` ağına hibrit imzalı bir işlemi `signAndBroadcast` etmesini sağlar ve sonucu sayfada kontrol eder.
7. **Sürüm kontrolleri yerine özellik algılama.** Bir dApp, `hasCapability(native, "signAndBroadcast")` doğru olduğunda QoreChain'de bir Gönder düğmesi gösterir; böylece yeni QoreX sürümleri dApp'te değişiklik gerekmeden özellikleri açar.

## Nasıl çalışır {#how-it-works}

* **EVM lane'i.** QoreX `window.ethereum` değerini asla yazmaz. EIP-6963 üzerinden `network.qore.qorex` ters-DNS adıyla bir EIP-1193 sağlayıcısı duyurur; `qorexWallet()` ve `discoverQorexEip1193()` tam olarak bu sağlayıcıyı seçer. Aynı nesne ayrıca `window.qorex.evm` konumundadır.
* **Yerel lane.** `window.qorex.native`, Keplr kalıbında bir sağlayıcıdır (`window.keplr` için takma ad değildir). QoreChain, yerel lane işlemlerinde hibrit bir secp256k1 artı ML-DSA-87 imzası gerektirir ve ML-DSA-87 anahtarını yalnızca cüzdan tutar; bu yüzden dApp mesajları `signAndBroadcast` çağrısına gönderir. QoreX bunları gösterir, ücreti belirler, iki anahtarla imzalar, yayınlar ve `shield` değerini bildirir.
* **Solana.** QoreX, `solana:mainnet` (Solana'nın kendisi) üzerinde bir Solana Wallet Standard cüzdanı kaydeder. QoreChain'in kendi SVM lane'i işlemlere açık değildir ve Wallet Standard zincir kimliği yoktur.
* **Sürümler değil, yetenekler.** Kitler `window.qorex.native.capabilities` değerini `hasCapability` üzerinden okur. Bir QoreX sürümü `listAccounts`, `connectProofPicksAccount`, `executeRequest` ve `signAndBroadcast` yeteneklerini bildirebilir.
* **Amino tasarım gereği reddedilir**, çünkü Amino JSON hibrit ML-DSA-87 imzasını taşıyamaz. Kitler her imzalayıcı isteğini bir doğrudan imzalayıcıyla (direct signer) karşılar.
* **`signDirect` ve post-kuantum katmanı, tam olarak.** Bugün QoreX `signDirect`, SignDoc'u olduğu gibi secp256k1 anahtarıyla imzalar. QoreChain'de gövde, imzalayanın kayıtlı anahtarı için zaten geçerli bir hibrit ML-DSA-87 katmanı içermelidir; bir sayfa bunu üretemez. Bu yüzden `qorechain-vladi` ve `qorechain-diana` üzerinde kitlerin çevrimdışı imzalayıcısının `signDirect` çağrısı QoreX'e ulaşmadan `QOREX_USE_SIGN_AND_BROADCAST` fırlatır; `getAccounts` her zincirde çalışır. Diğer zincir kimliklerinde kitler `signDirect` çağrısını, bugün yalnızca iki QoreChain zincir kimliğine hizmet veren QoreX'e iletir. Gelecekteki bir QoreX sürümünün katmanı `signDirect` içinde kendisinin eklemesi ve `signDirectAddsPqcLayer` yeteneğini bildirmesi planlanmaktadır; hiçbir güncel sürüm bunu bildirmez. Kitler bunu şimdiden kontrol eder ve bildirildiğinde çevrimdışı imzalayıcı QoreChain SignDoc'larını QoreX'e iletir. QoreX bu durumda gas'i yeniden tahmin edip gas sınırını ve ücreti yükseltebilir; bu yüzden geri dönen `signed` belgesini her zaman yayınlayın.
* **`shield` durumları** (`signAndBroadcast` tarafından döndürülür): `shielded` (onaylanan işlem hibrit katmanı taşır), `pending` (yayın yapıldı, kontrol tamamlanmadı), `downgraded` (katman olmadan onaylandı; bunu bir alarm olarak değerlendirin) ve `classical` (katmanın uygulanmadığı bir lane).
* **Mock**, hesaplarını QoreX'in yaptığı gibi bir BIP-39 anımsatıcı ifadesinden (varsayılan: herkese açık test ifadesi) oluşturur: o `qor1` adresinin kanonik ML-DSA-87 anahtarıyla `m/44'/118'/0'/0/i`, EVM için `m/44'/60'/0'/0/i` ve Solana için `m/44'/501'/i'/0'`. Mock'un `signAndBroadcast` çağrısı hesabın ML-DSA-87 anahtarını REST'ten okur, eksikse `MsgRegisterPQCKeyV2` ile bir kez kaydeder, [QoreSign](/qoresign/overview) ile hibrit imzalar, yayınlar (ağ isterse diğer sign-bytes sürümüyle bir kez yeniden dener), dahil edilmeyi bekler ve `{ txHash, code, height, shield }` döndürür.

### QoreX bugün neyi destekliyor {#qorex-today}

| Yüzey | Bugün | QoreX ekibinin planladığı |
|---|---|---|
| EVM (EIP-6963 üzerinden EIP-1193, `network.qore.qorex`) | bağlanma (`eth_requestAccounts`), `eth_accounts`, `eth_chainId`, QoreX'te zaten seçili ağa `wallet_switchEthereumChain` | `accountsChanged` ve `chainChanged` olayları, her reddetmede EIP-1193 hata kodları 4200 ve 4902, `personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`, `wallet_addEthereumChain` |
| QoreChain yerel lane'i (`window.qorex.native`) | `enable`, `getKey`, `signAndBroadcast`, `listAccounts`, `experimentalSuggestChain` (QoreChain kimlikleri), `signDirect` (SignDoc hibrit katmanı zaten taşımalıdır) | ML-DSA-87 katmanını kendisi ekleyen `signDirect`, mesaj imzalama (ADR-36 artı ML-DSA-87) |
| Solana (Wallet Standard, `solana:mainnet`) | bağlanma, `signMessage`, `signTransaction` | `solana:signIn` |

EVM tarafında, imzalama ve gönderme şu an "QoreX: EVM method ... not yet supported" ile başarısız olur. QoreChain'deki işlemler için yerel lane'i kullanın. QoreChain'in EVM lane'inde bir işlem, gönderenin kayıtlı bir ML-DSA-87 anahtarı ve yerel lane'den açılmış bir EVM yetkilendirme penceresi olduğunda kabul edilir. Kullanıcı ağı QoreX içinden değiştirir; dApp bunu değiştiremez.

## Nasıl kullanılır {#how-to-use}

Aşağıdaki kod blokları geliştirici merkezindeki hızlı başlangıçlardır. Her biri `tsc` ile tip kontrolünden geçirildi ve 27 Ekim 2026'da herkese açık npm kayıt defterinden kurulduktan sonra çalıştırıldı (Node 26; tarayıcı kodu için jsdom 30 ve `react-dom/client`; fikstür için Chromium ile Playwright 1.64) ve geçti. Hiçbiri bir işlem göndermez ve fonlanmış bir anahtara ihtiyaç duymaz. Gözlenen sonuç her birinin yanında verilmiştir. Cüzdan tarafı davranışı (gerçek bir tarayıcıda gerçek bir QoreX) bu sayfa için test edilmedi.

### `@qorechain/qorex-types`: QoreX'i algılayın {#types}

```bash
npm install @qorechain/qorex-types
```

```ts
import { discoverQorexEip1193, getQorexNative, hasCapability } from "@qorechain/qorex-types";

// EVM: EIP-6963 discovery by rdns "network.qore.qorex" (QoreX never writes window.ethereum).
const evm = await discoverQorexEip1193({ timeoutMs: 500 });
console.log(evm ? "QoreX EVM provider found" : "QoreX EVM provider not announced");

// QoreChain native lane: window.qorex.native.
const native = getQorexNative();
if (native && hasCapability(native, "signAndBroadcast")) {
  const key = await native.getKey("qorechain-diana");
  console.log("native account:", key.bech32Address);
}
```

Mock altında gözlenen: `QoreX EVM provider not announced`, ardından `native account: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h`. İlk satır mock altında beklenendir, bkz. [EIP-6963 uyarısı](#limits). Paketin çalışma zamanı bağımlılığı yoktur ve QoreX simgesini `@qorechain/qorex-types/icon` üzerinden bir data URI olarak da dışa aktarır. Diğer dışa aktarımlar: sağlayıcı tipleri, `isQorexInstalled`, `qorexSignAndBroadcast` ve QoreX EVM reddetmelerini sınıflandırmak için yardımcılar.

### `@qorechain/qorex-rainbowkit`: RainbowKit ve wagmi'de QoreX {#rainbowkit}

```bash
npm install @qorechain/qorex-rainbowkit @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

```ts
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { QOREX_CHAINS, qorechain, qorechainTestnet, qorexWallet } from "@qorechain/qorex-rainbowkit";

const connectors = connectorsForWallets(
  [{ groupName: "Recommended", wallets: [qorexWallet, metaMaskWallet] }],
  { appName: "My dApp", projectId: "<walletconnect project id>" },
);

export const config = createConfig({
  chains: QOREX_CHAINS, // QoreChain mainnet (9801) and testnet (9800)
  connectors,
  transports: { [qorechain.id]: http(), [qorechainTestnet.id]: http() },
});
console.log(config.chains.map((c) => `${c.id} ${c.name}`), connectors.length, "connectors");
```

Gözlenen: `[ '9801 QoreChain', '9800 QoreChain Testnet' ] 2 connectors`. `QOREX_CHAINS`, EVM lane'i için viem zincir tanımlarını içerir (RPC `https://evm.qore.host` ve `https://evm-testnet.qore.host`, yerel para birimi 18 ondalıklı QOR, gezgin `https://explore.qore.network`). `projectId`, WalletConnect'te kendiniz oluşturduğunuz bir WalletConnect proje kimliğidir. Eş bağımlılıklar (peer dependencies): `viem` ^2, `wagmi` ^2.9, `@rainbow-me/rainbowkit` ^2.2.11. Cüzdanda yapılan hesap ve ağ değişikliklerini yakalamak için `wallets: [() => qorexWallet({ pollAccountsOnFocus: true })]` kullanın.

### `@qorechain/qorex-interchain-kit`: Cosmos dApp'leri (yeni işler için önerilir) {#interchain-kit}

```bash
npm install @qorechain/qorex-interchain-kit @interchain-kit/core @interchain-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@interchain-kit/react";
import { qorexWallet } from "@qorechain/qorex-interchain-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[qorexWallet]}>
      {children}
    </ChainProvider>
  );
}
```

Gözlenen: bileşen, QoreChain test ağı chain-registry girdisiyle jsdom'da bağlandı (`@interchain-kit/react` 0.11.1). Eş bağımlılık: `@interchain-kit/core` ^0.11. Bir QoreChain işlemini `qorexSignAndBroadcast` ile gönderin:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: msgSendBytes }],
  memo: "",
});
```

Çağrı 1 ila 32 mesajı ve en fazla 256 baytlık bir notu (memo) kabul eder ve QoreX kullanıcıdan onay ister. Kod parçası paket README'sinden alınmıştır ve bu sayfa için çalıştırılmadı.

### `@qorechain/qorex-cosmos-kit`: cosmos-kit üzerinde Cosmos dApp'leri {#cosmos-kit}

```bash
npm install @qorechain/qorex-cosmos-kit @cosmos-kit/core @cosmos-kit/react
```

```tsx
import type { ComponentProps, ReactNode } from "react";
import { ChainProvider } from "@cosmos-kit/react";
import { wallets as qorexWallets } from "@qorechain/qorex-cosmos-kit";

type Props = Pick<ComponentProps<typeof ChainProvider>, "chains" | "assetLists"> & { children: ReactNode };

// chains / assetLists: your chain-registry entries, including QoreChain.
export function Providers({ chains, assetLists, children }: Props) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={[...qorexWallets]} throwErrors={false}>
      {children}
    </ChainProvider>
  );
}
```

Gözlenen: QoreChain test ağı girdisiyle jsdom'da bağlandı (`@cosmos-kit/react` 2.24.1). **Kodun tip kontrolünden geçmesi için `throwErrors={false}` gereklidir:** `@cosmos-kit/react` 2.24, `throwErrors` değerini zorunlu bir özellik olarak tiplendirir ve paket README'sindeki örnek bunu atlar. Eş bağımlılık: `@cosmos-kit/core` ^2.18.1. Paket README'si yeni dApp'ler için Interchain Kit'i önerir. `qorexSignAndBroadcast` da dışa aktarılır.

### `@qorechain/qorex-wallet-mock`: QoreX için test ikizi {#wallet-mock}

```bash
npm install -D @qorechain/qorex-wallet-mock
```

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

// jsdom / Vitest: install a QoreX test double into window (public test phrase, testnet only).
const mock = createQorexMock({ profile: "current" });
mock.install(window);

const [account] = (await window.qorex!.evm.request({ method: "eth_requestAccounts" })) as string[];
const chainId = await window.qorex!.evm.request({ method: "eth_chainId" });
console.log(account, chainId, mock.addresses());
```

Gözlenen: `0x9858EfFD232B4033E47d90003D41EC34EcaEda94 0x2648 { native: qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h, evm: 0x9858..., svm: HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk }`. Hesaplar QoreX'in türettiği gibi türetilir (o `qor1` adresinin kanonik ML-DSA-87 anahtarıyla `m/44'/118'/0'/0/i`, EVM için `m/44'/60'/0'/0/i`, Solana için `m/44'/501'/i'/0'`). Seçenekler arasında `profile`, `mnemonic`, `accountIndex`, `chainId` (varsayılan `qorechain-diana`), `autoApprove` ve `allowMainnet` bulunur; sayfa ayrıca `approveNext()`, `rejectNext()`, `requests` ve `switchAccount(i)` içeren `window.__qorexMock` nesnesini alır. Playwright'ta `mock.initScript()` değerini `page.addInitScript` ile enjekte edin (Node 20.16 veya üstü).

### `@qorechain/qorex-synpress`: Playwright fikstürleri {#synpress}

```bash
npm install -D @qorechain/qorex-synpress @playwright/test
```

```ts
import { qorexMockFixtures } from "@qorechain/qorex-synpress";

// A Playwright test with the QoreX mock injected before navigation (no Synpress needed).
const test = qorexMockFixtures({ profile: "current" });
const { expect } = test;

test("connects", async ({ page, qorex }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(page.getByTestId("account")).toHaveText(qorex.addresses.evm);
});
```

Gözlenen: `1 passed`, Connect düğmesi `eth_requestAccounts` çağıran yerel bir sayfaya karşı (Playwright 1.64, Chromium). Fikstürleri Synpress ile birleştirmek için `@synthetixio/synpress@4.1.2` kurun ve bunları `testWithSynpress` ile sarmalayın. `qorex` fikstürü `addresses`, `approveNext()`, `rejectNext()`, `requests()`, `switchAccount(i)` ve `disconnect()` sunar. Eş bağımlılık: `@playwright/test` 1.48 veya üstü. Durum sayfada yaşar, bu yüzden her gezinme yeni bir mock ile başlar.

### QoreChain'de işlem göndermek {#send-transaction}

Aynı çağrı `@qorechain/qorex-interchain-kit`, `@qorechain/qorex-cosmos-kit` ve `@qorechain/qorex-types` paketlerinde bulunur:

```ts
import { qorexSignAndBroadcast } from "@qorechain/qorex-interchain-kit";

const { txHash, code, height, shield } = await qorexSignAndBroadcast({
  chainId: "qorechain-diana",
  messages: [{ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: MsgSend.encode(msg).finish() }],
  memo: "",
  gasLimit: 200000,
});
```

* `value`, protobuf ile kodlanmış mesajdır: bir `Uint8Array`, bir `number[]` veya base64.
* 1 ila 32 mesaj; en fazla 256 baytlık bir not (memo); `gasLimit` 100.000 ile 5.000.000 arasına sıkıştırılır (belirtilmezse 400.000). Ücreti QoreX belirler ve imzalamadan önce gösterir.
* `chainId`, QoreX'te seçili ağla eşleşmelidir.
* Hesabın ML-DSA-87 anahtarını yöneten mesajlar cüzdan tarafındadır ve reddedilir; `MsgExec` içinde de reddedilir. QoreX'in gösteremediği mesaj türleri reddedilir.
* Kit kullanmadan, `hasCapability(native, "signAndBroadcast")` değerini kontrol ettikten sonra `window.qorex.native.signAndBroadcast(request)` çağrısını yapın. `getKey`, `pubKey` ve `address` değerlerini `number[]` olarak döndürür; `Uint8Array.from(key.pubKey)` ile dönüştürün (kitler bunu sizin için yapar).

### Mock'un fikstürler olmadan Playwright'ta kullanımı {#mock-playwright}

```ts
import { createQorexMock } from "@qorechain/qorex-wallet-mock";

const mock = createQorexMock({ profile: "current" });
await page.addInitScript({ content: mock.initScript() });
await page.goto("http://localhost:5173");
await page.evaluate(() => window.__qorexMock!.rejectNext());
```

## Ana API {#main-api}

| Paket | Ad | Ne yapar |
|---|---|---|
| types | `discoverQorexEip1193({ timeoutMs })`, `findQorexEip1193()` | QoreX EVM sağlayıcısının eşzamansız EIP-6963 keşfi ve bunun için eşzamanlı bir yoklama |
| types | `getQorexNative()`, `isQorexInstalled()`, `hasCapability(native, capability)` | `window.qorex.native` değerini okur, QoreX'in mevcut olduğunu kontrol eder, bir yeteneği sınar |
| types | `qorexSignAndBroadcast(request, { native? })` | mesajları QoreX'e verir; QoreX yoksa `QOREX_NOT_INSTALLED`, bunu desteklemeyen eski bir QoreX'te `QOREX_NOT_SUPPORTED_YET` fırlatır |
| types | `QorexIntegrationError`, `isQorexIntegrationError(err, code)` | bu paketlerden gelen hatalar, sabit kodlarla |
| types | `isQorexUnsupportedMethodError`, `isQorexUnrecognizedChainError`, `QOREX_EVM_ERROR_CODES` | QoreX EVM reddetmelerini sınıflandırır: önce `code` değerine (4200, 4902) bakar, sonra bugünkü mesaj metnine döner |
| types | `QorexEip1193Provider`, `QorexNativeProvider`, `QorexSolanaStandardWallet`, `QorexSvmProvider`; `@qorechain/qorex-types/icon` | QoreX'in enjekte ettiklerinin tipleri; QoreX simgesi bir data URI olarak |
| rainbowkit | `qorexWallet(options?)`, `createQorexConnector`, `getQorexEip1193Provider` | RainbowKit cüzdanı (seçenek `pollAccountsOnFocus`), wagmi bağlayıcısı ve kullandığı sağlayıcı |
| rainbowkit | `qorechain`, `qorechainTestnet`, `QOREX_CHAINS` | viem zincirleri 9801 ve 9800 |
| interchain-kit | `qorexWallet`, `createQorexWallet()`, `QorexCosmosWallet` | Interchain Kit cüzdanı |
| cosmos-kit | `wallets`, `qorexExtension`, `QorexExtensionWallet`, `QorexClient` | cosmos-kit cüzdanı |
| her iki kit | `qorexSignAndBroadcast`, `QOREX_CAPABILITY_SIGN_DIRECT_ADDS_PQC_LAYER`, zincir kimliği sabitleri, hata yardımcıları | `qorex-types` üzerinden yeniden dışa aktarılır |
| wallet-mock | `createQorexMock(options)` | `{ install(window), initScript(), addresses(), ... }` döndürür |
| wallet-mock | `window.__qorexMock` | `approveNext()`, `rejectNext()`, `pendingApprovals`, `requests`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `addresses()` |
| wallet-mock | `PUBLIC_TEST_MNEMONIC` | herkese açık BIP-39 test ifadesi (asla fonlamayın) |
| synpress | `qorexMockFixtures(options)` | otomatik bir `qorex` fikstürü olan bir Playwright `test` |
| synpress | `qorex.addresses`, `approveNext()`, `rejectNext()`, `waitForApproval()`, `pendingApprovals()`, `requests()`, `clearRequests()`, `switchAccount(i)`, `switchNetwork(chainId)`, `disconnect()`, `mock` | fikstür denetimleri |
| synpress | `qorexExtensionFixtures({ extensionPath })` | gerçek eklenti için planlanan arayüz; bugün `QorexExtensionModeUnavailableError` fırlatır |

Synpress v4 ile fikstürleri `testWithSynpress(qorexMockFixtures({ profile: "planned" }))` olarak birleştirin. `autoApprove: false` iken bekleyen durumu incelemek için `await qorex.waitForApproval()` çağırın, ardından `qorex.approveNext()` çağırın. Hem bugünkü QoreX'i hem de bir sonraki sürümü kapsamak için paketi iki profilde de çalıştırın.

### Kit imzalayıcısının davranışı {#kit-signer}

| Çağrı | Interchain Kit | cosmos-kit |
|---|---|---|
| `connect` veya `enable`, `getAccount`, `getKey` | QoreX `enable` ve `getKey`, baytlar `Uint8Array` olarak dönüştürülür | aynı |
| `getOfflineSigner(chainId)` | her tercih için doğrudan imzalayıcı | her tercih için doğrudan imzalayıcı, cosmos-kit'in varsayılanı `"amino"` dahil |
| QoreChain'de imzalayıcı `signDirect` | `QOREX_USE_SIGN_AND_BROADCAST` fırlatır (QoreX `signDirectAddsPqcLayer` bildirene kadar) | aynı |
| başka bir zincir kimliğinde imzalayıcı `signDirect` | QoreX `signDirect` çağrısına iletilir | aynı |
| `signAmino`, `getOfflineSignerAmino` | `QOREX_AMINO_REFUSED` fırlatır | aynı |
| `signArbitrary` (ADR-36) | `QOREX_NOT_SUPPORTED_YET` fırlatır (`verifyArbitrary` da) | `QOREX_NOT_SUPPORTED_YET` fırlatır |
| `sendTx` | `QOREX_NOT_SUPPORTED_YET` fırlatır; kendi RPC uç noktanız üzerinden yayınlayın | sağlanmaz |

### Mock cüzdan seçenekleri {#mock-options}

| Seçenek | Varsayılan | Anlamı |
|---|---|---|
| `profile` | `"current"` | `"current"` bugünkü QoreX'tir; `"planned"` duyurulan özellikleri ekler |
| `mnemonic` | herkese açık BIP-39 test ifadesi | fonladığınız her şey için kendi ifadenizi kullanın |
| `accountIndex` | `0` | her lane'de aynı indeks |
| `chainId` | `"qorechain-diana"` | mock'ta seçili ağ |
| `rest` | `https://api-testnet.qore.host` | `signAndBroadcast` ve anahtar sorguları için REST uç noktası |
| `evmRpc` | `https://evm-testnet.qore.host` | `eth_sendTransaction` tarafından kullanılır (planned profili) |
| `allowMainnet` | `false` | bu olmadan `qorechain-vladi` için imzalama reddedilir |
| `autoApprove` | `true` | `false` olduğunda onaylar `approveNext()` veya `rejectNext()` çağrısını bekler |
| `inclusionTimeoutMs`, `pollIntervalMs` | `30000`, `1500` | `signAndBroadcast` çağrısının dahil edilmeyi nasıl beklediği |

### Hata kodları {#error-codes}

Bu paketlerden (`QorexIntegrationError.code`): `QOREX_NOT_INSTALLED`, `QOREX_USE_SIGN_AND_BROADCAST`, `QOREX_AMINO_REFUSED` ve `QOREX_NOT_SUPPORTED_YET`; `qorex-synpress` paketinden: `QOREX_EXTENSION_MODE_UNAVAILABLE`. QoreX'in kendi hataları, mesajı `QoreX` ile başlayan düz `Error` nesneleridir; örneğin `QoreX: connection rejected`, `QoreX: signature rejected`, `QoreX: wallet is locked` ve `QoreX: unsupported chain <id>`. Bugün sayısal kod taşıyan tek durum bilinmeyen bir zincirdir (4902) ve bir kullanıcı reddetmesinin EIP-1193 4001 kodu yoktur; bu yüzden mesajla eşleştirin. `QoreX (mock):` ile başlayan mesajlar mock'tan gelir, asla QoreX'ten gelmez.

## Nasıl erişilir {#how-to-access}

* **Gerçek kullanım için bir QoreX cüzdanı.** Bağlayıcılar, kullanıcının kurduğu QoreX tarayıcı eklentisi veya uygulamasıyla konuşur; kurulumlar ve mağaza sürümleri için [QoreX Tarayıcı Eklentisi](/qorex/browser-extension) sayfasına bakın. Test paketleri cüzdana ihtiyaç duymaz.
* **Ağlar.** Ana ağ `qorechain-vladi` (EVM zincir kimliği 9801) ve test ağı `qorechain-diana` (EVM zincir kimliği 9800). QoreX yalnızca bu iki QoreChain zincir kimliğine hizmet verir ve diğerlerini "QoreX: unsupported chain" ile reddeder. Mock varsayılan olarak test ağını kullanır ve `allowMainnet: true` vermediğiniz sürece ana ağ için imzalamayı reddeder.
* **Anahtarlar ve fonlar.** Paketler hiçbir anahtar tutmaz. Mock, `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h` adresini türeten herkese açık BIP-39 test ifadesini kullanır (`abandon` 11 kez tekrarlanır, ardından `about`); onu asla fonlamayın. Yayın yapan bir test için mock'a kendi test ağı anımsatıcı ifadenizi verin.
* **Diğer hesaplar.** WalletConnect'li RainbowKit, WalletConnect'ten alınan bir WalletConnect proje kimliği gerektirir.
* **Ön koşullar.** Node.js (mock'un tek dosyalık betiği 20.16 veya üstünü gerektirir), üç bağlayıcı için bir React uygulaması ve her hızlı başlangıcın altında listelenen eş paketler. TypeScript kullanıcıları tipleri `@qorechain/qorex-types` paketinden alır.
* **Maliyetler.** Paketler ücretsizdir. QoreX üzerinden gönderilen bir işlem olağan ücreti öder (taban gas başına 0,1 uqor; QoreX kendi işlemlerini gas başına 0,15 uqor ile fiyatlar).

### Ağlar {#networks}

| | Ana ağ | Test ağı |
|---|---|---|
| Yerel zincir kimliği | `qorechain-vladi` | `qorechain-diana` |
| EVM zincir kimliği | 9801 (`0x2649`) | 9800 (`0x2648`) |
| REST | `https://api.qore.host` | `https://api-testnet.qore.host` |
| RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC | `https://evm.qore.host` | `https://evm-testnet.qore.host` |
| Gezgin | `https://explore.qore.network` | aynı, test ağı seçili olarak |

Bech32 öneki `qor` (doğrulayıcılar için `qorvaloper`), coin türü 118, yerel lane'de 6 ondalıklı `uqor` ve EVM'de 18 ondalıklı QOR birimi. Kullanıcılar gerçek kullanım için QoreX eklentisine (0.3.x) ihtiyaç duyar; testler yalnızca mock'a ihtiyaç duyar. Mock'tan gerçek yayınlar için hesabın [Musluk](/dashboard/faucet) üzerinden test ağı QOR'una ihtiyacı vardır (oturum açma gerekir); kendi anımsatıcı ifadenizi kullanın, asla herkese açık test ifadesini değil.

## Güvenlik notları {#security}

* dApp, ML-DSA-87 anahtarını asla tutmaz: QoreX, QoreChain işlemlerini cüzdanın içinde `signAndBroadcast` ile imzalar.
* QoreX, hesabın ML-DSA-87 anahtarını yöneten mesajlar için sayfa isteklerini reddeder.
* `qorexWallet()` asla `window.ethereum`'a geri dönmez; böylece enjekte edilmiş başka bir cüzdan QoreX sanılmaz. Mock, bir test ikizinin cüzdanla karıştırılmaması için farklı bir ters-DNS adı kullanır.
* `connectProof`, `executeTransfer` ve `executeRequest` yöntemleri QoreChain paneli için vardır ve diğer tüm kaynaklarda (origin) reddedilir.
* `shield` sonucunu izleyin. `downgraded`, işlemin hibrit katman olmadan onaylandığı anlamına gelir; bunu bir alarm olarak değerlendirin.
* Mock'un varsayılan anımsatıcı ifadesi herkese açıktır ve mock, `allowMainnet: true` verilmedikçe ana ağ imzalamasını reddeder. Herkese açık test ifadesini asla fonlamayın; canlı testler için ayrı bir test ağı anımsatıcı ifadesi kullanın.
* Güvenlik açıklarını özel olarak security@qore.network adresine bildirin.

## Nerede yayımlanır {#where-published}

| Kayıt defteri | Paket | Sürüm | Bağlantı |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Kaynak: https://github.com/qorechain/qorex-integrations (herkese açık, `v0.1.0` sürümü 27 Ekim 2026'da yayımlandı, `packages/` altındaki klasörler). Ayrıca kılavuzlar (QoreX'i MetaMask, Keplr veya Phantom'un yanına eklemek; uçtan uca test; hatalar ve zincir kimlikleri), testnet üzerinde her QoreX yüzeyini deneyen bir demo dApp, örnekler (`examples/wagmi-rainbowkit`, `examples/playwright-e2e`) ve chain-registry girdi dosyaları içerir. Lisans Apache-2.0; bakımcı QoreChain Association. Sürümler 27 Ekim 2026'da npm kayıt defterinden okunmuştur. Bunlar, npm'de kullanımdan kaldırılmış (deprecated) olan `@qorechain/connect` paketinin yerini alır: QoreX'i algılamak için `qorex-types`, EVM dApp'leri için `qorex-rainbowkit`, Cosmos dApp'leri için `qorex-interchain-kit` (veya `qorex-cosmos-kit`) ve kendi cüzdanınızda ya da arka ucunuzda hibrit imzalama için [QoreSign](/qoresign/overview) kullanın.

## Sınırlar ve bilinen sorunlar {#limits}

**Bugünkü QoreX sürümlerinin desteklediği.** Yayında olan mağaza sürümleri (QoreX mobil uygulaması 1.1.8; tarayıcı eklentisi 0.3.8 ve Firefox'ta 0.3.9), cüzdan tarafından eklenen bir ML-DSA katmanıyla `getOfflineSigner` desteğine henüz sahip değildir ve `signArbitrary` desteklemez. cosmos-kit ve Interchain Kit üzerinden, `getOfflineSigner` ile imzalama yalnızca sayfanın kendisi post-kuantum katmanı eklerse çalışır; sayfa anahtarı tutmadığı için bunu normalde yapamaz. Bugün yerel lane işlemi göndermenin desteklenen yolu, `qorexSignAndBroadcast` tarafından sarmalanan `window.qorex.native.signAndBroadcast` çağrısıdır. Bağlayıcıları, bugünkü mağaza sürümleriyle, her paket README'sinin belirttiğinin ötesinde tam bir cosmos-kit veya Interchain Kit cüzdanı olarak okumayın. Bağlayıcılar, ileride bir QoreX sürümünün katmanı `signDirect` içine ekleyebilmesi (bir `signDirectAddsPqcLayer` yeteneği aracılığıyla bildirilir) ve sizin kodunuzda değişiklik gerekmemesi için yazılmıştır.

**QoreX'in bugün yanıtladıkları** (paket README'lerinden):

* **EVM:** QoreX'te seçili ağ için `eth_chainId`, `eth_accounts`, `eth_requestAccounts` ve `wallet_switchEthereumChain` (bilinmeyen bir zincir 4902 koduyla reddedilir). İmzalama yöntemleri (`personal_sign`, `eth_signTypedData_v4`, `eth_sendTransaction`) ve `wallet_addEthereumChain` henüz desteklenmez ve "QoreX: EVM method ... not yet supported" ile reddedilir. Henüz `accountsChanged` veya `chainChanged` olayları yok. QoreX ekibi tarafından yayında değil, planlanan olarak listelenenler: olaylar, her reddetmede hata kodları, ardından imzalama ve işlem yöntemleri.
* **Genel olarak EVM işlemleri.** QoreChain'de bir EVM işlemi yalnızca kayıtlı bir ML-DSA-87 anahtarına ve açık bir EVM yetkilendirme penceresine sahip bir hesaptan kabul edilir; ikisi de yerel lane'den kurulur (bkz. [EVM Geliştirme](/developer-guide/evm-development#evm-window)). Mock'un planlanan `eth_sendTransaction` yöntemi bu pencereyi açmaz.
* **Yerel:** yalnızca `qorechain-vladi` ve `qorechain-diana` için `enable`, `getKey`, `signDirect`, `signAndBroadcast`, `listAccounts` ve `experimentalSuggestChain`. QoreChain'de `signDirect`, hibrit katmanın zaten mevcut olmasını gerektirir ve bir sayfa bunu oluşturamaz; bu yüzden `signAndBroadcast` kullanın. `signArbitrary`, Amino imzalama ve `sendTx` mevcut değildir; bağlayıcılarda `signArbitrary` `QOREX_NOT_SUPPORTED_YET` fırlatır ve Amino `QOREX_AMINO_REFUSED` fırlatır.
* **Solana:** `solana:mainnet` üzerinde Wallet Standard; connect, disconnect, olaylar, `signAndSendTransaction`, `signTransaction` ve `signMessage` ile; `solana:signIn` yok. Zincirin SVM lane'i henüz işlem kabul etmez, dolayısıyla buradaki Solana desteği yalnızca cüzdan tarafıdır.

**Hızlı başlangıçlar test edilirken bulunan uyarılar:**

* **cosmos-kit `throwErrors` gerektirir.** README örneği, `@cosmos-kit/react` 2.24'ün tiplerinde gerektirdiği `throwErrors` değerini atlar, bu yüzden yazıldığı haliyle tip kontrolünden geçmez. `throwErrors={false}` (veya kendi değerinizi) verin.
* **Katı TypeScript ve mock.** `window.qorex.evm.request(...)` `unknown` döndürür, bu yüzden sonucunu yapısöküme uğratan README satırı katı TypeScript altında başarısız olur. Sonucu dönüştürün, örneğin `eth_requestAccounts` için `as string[]`.
* **Mock'un kendi EIP-6963 kimliği vardır.** `network.qore.qorex` değil, `network.qore.qorex.mock` duyurur. QoreX'i katı biçimde `network.qore.qorex` ile seçen keşif kodu (`qorex-types` içindeki `discoverQorexEip1193` dahil) bu nedenle mock altında, tasarım gereği, hiçbir EVM sağlayıcısı bulamaz; `window.qorex.evm` ve yerel sağlayıcı ise mevcuttur. Kodunuz sağlayıcıyı keşif yoluyla seçiyorsa, testlerde mock rdns değerini (`QOREX_MOCK_RDNS` olarak dışa aktarılır) kabul etmesini sağlayın.
* **RainbowKit Node'u canlı tutar.** Node'da RainbowKit yapılandırmasını oluşturmak WalletConnect zamanlayıcılarını başlatır ve işlem bundan sonra kendiliğinden çıkmaz. Bir sayfada bu beklenendir. Bir betikte veya testte, ihtiyacınız olanı okuduktan sonra açıkça çıkın (örneğin `process.exit(0)`).
* **Synpress eklenti modu henüz çalışmaz.** `qorexExtensionFixtures`, gerçek eklentiyi sürmenin planlanan yoludur ve bugün `QorexExtensionModeUnavailableError` fırlatır; çünkü QoreX onay pencerelerinde henüz yayımlanmamış kararlı test seçicilerine ihtiyaç duyar. Mock modunu kullanın.

**Mock ile cüzdan arasındaki farklar:** kilit ekranı veya onay penceresi yok (onaylar `approveNext`, `rejectNext` veya `autoApprove` ile yapılır); `signDirect` düz bir secp256k1 anahtar türü bildirir; Solana `signAndSendTransaction` reddedilir; "QoreX (mock):" ile başlayan mesajlar mock'un kendisine aittir. Mock'tan gelen test sonuçları, sayfanızın tanımlanan arayüze karşı nasıl davrandığını gösterir; gerçek bir QoreX sürümünün aynı şekilde davrandığını göstermez.

**Diğer:** altı paketin hepsi ilk sürümdür (0.1.0), bu yüzden arayüzlerinin QoreX büyüdükçe genişlemesini bekleyin. Hiçbir test edilmiş hızlı başlangıç, `qorexSignAndBroadcast` değerini canlı bir ağa veya gerçek bir cüzdana karşı kapsamaz.

## İlgili sayfalar {#related}

* [QoreX cüzdanı](/qorex/overview) ve [QoreX Tarayıcı Eklentisi](/qorex/browser-extension): bu paketlerin konuştuğu cüzdan.
* [QoreSign](/qoresign/overview): mock'un kullandığı hibrit imzalayıcı.
* [QoreChain SDK](/sdk/overview): `signAndBroadcast` için `MsgSend` gibi mesajların kodlanması.
* [EVM Geliştirme](/developer-guide/evm-development#evm-window): ML-DSA-87 anahtar kaydı ve EVM yetkilendirme pencereleri.
* [Musluk](/dashboard/faucet): test ağı QOR'u.
* [QoreChain MCP sunucusu](/developer-tools/mcp): bir yayının sonucunu `get_pq_status` ile okuyun.
* [Geliştirici paketlerine genel bakış](/developer-tools/overview).
