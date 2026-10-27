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

## Nasıl erişilir {#how-to-access}

* **Gerçek kullanım için bir QoreX cüzdanı.** Bağlayıcılar, kullanıcının kurduğu QoreX tarayıcı eklentisi veya uygulamasıyla konuşur; kurulumlar ve mağaza sürümleri için [QoreX Tarayıcı Eklentisi](/qorex/browser-extension) sayfasına bakın. Test paketleri cüzdana ihtiyaç duymaz.
* **Ağlar.** Ana ağ `qorechain-vladi` (EVM zincir kimliği 9801) ve test ağı `qorechain-diana` (EVM zincir kimliği 9800). QoreX yalnızca bu iki QoreChain zincir kimliğine hizmet verir ve diğerlerini "QoreX: unsupported chain" ile reddeder. Mock varsayılan olarak test ağını kullanır ve `allowMainnet: true` vermediğiniz sürece ana ağ için imzalamayı reddeder.
* **Anahtarlar ve fonlar.** Paketler hiçbir anahtar tutmaz. Mock, `qor19rl4cm2hmr8afy4kldpxz3fka4jguq0agt672h` adresini türeten herkese açık BIP-39 test ifadesini kullanır (`abandon` 11 kez tekrarlanır, ardından `about`); onu asla fonlamayın. Yayın yapan bir test için mock'a kendi test ağı anımsatıcı ifadenizi verin.
* **Diğer hesaplar.** WalletConnect'li RainbowKit, WalletConnect'ten alınan bir WalletConnect proje kimliği gerektirir.
* **Ön koşullar.** Node.js (mock'un tek dosyalık betiği 20.16 veya üstünü gerektirir), üç bağlayıcı için bir React uygulaması ve her hızlı başlangıcın altında listelenen eş paketler. TypeScript kullanıcıları tipleri `@qorechain/qorex-types` paketinden alır.
* **Maliyetler.** Paketler ücretsizdir. QoreX üzerinden gönderilen bir işlem olağan ücreti öder (taban gas başına 0,1 uqor).

## Nerede yayımlanır {#where-published}

| Kayıt defteri | Paket | Sürüm | Bağlantı |
| --- | --- | --- | --- |
| npm | `@qorechain/qorex-types` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-types |
| npm | `@qorechain/qorex-rainbowkit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-rainbowkit |
| npm | `@qorechain/qorex-interchain-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-interchain-kit |
| npm | `@qorechain/qorex-cosmos-kit` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-cosmos-kit |
| npm | `@qorechain/qorex-wallet-mock` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-wallet-mock |
| npm | `@qorechain/qorex-synpress` | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorex-synpress |

Kaynak: https://github.com/qorechain/qorex-integrations (etiket `v0.1.0`, `packages/` altındaki klasörler; ayrıca bir demo dApp, örnekler ve chain-registry girdi dosyaları içerir). Sürümler 27 Ekim 2026'da npm kayıt defterinden okunmuştur. Bunlar, npm'de kullanımdan kaldırılmış (deprecated) olan `@qorechain/connect` paketinin yerini alır: QoreX'i algılamak için `qorex-types`, EVM dApp'leri için `qorex-rainbowkit`, Cosmos dApp'leri için `qorex-interchain-kit` (veya `qorex-cosmos-kit`) ve kendi cüzdanınızda ya da arka ucunuzda hibrit imzalama için [QoreSign](/qoresign/overview) kullanın.

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
