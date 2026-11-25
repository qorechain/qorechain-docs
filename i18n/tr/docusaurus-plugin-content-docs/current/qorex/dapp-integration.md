---
slug: /qorex/dapp-integration
title: Bir dApp'i QoreX ile Entegre Edin
sidebar_label: dApp Entegrasyonu
sidebar_position: 8
---

# Bir dApp'i QoreX ile Entegre Edin

Bu, bir web uygulamasının QoreX cüzdanıyla çalışmasını isteyen bir geliştirici için eksiksiz rehberdir: cüzdanın nasıl algılanacağı, bağlanma, QoreChain işlemleri gönderme, mesaj imzalama, EVM ve Solana kullanımı, retleri ele alma ve QoreX'i açan bağlantılar üretme. QoreX tarayıcı eklentisini ve QoreX uygulamasının uygulama içi dApp tarayıcısını kapsar ve ikisinin nerede farklılaştığını belirtir. Kod örnekleri cüzdanın kendi koduyla karşılaştırılarak kontrol edilmiştir.

## Yenilikler {#innovations}

- **Sayfa kuantum sonrası anahtarı asla tutmaz.** `signAndBroadcast` mesajlarınızı alır; QoreX bunları çözülmüş olarak gösterir, yalnızca cüzdanın üretebileceği ML-DSA-87 katmanını ekler ve yayınlar. cosmjs, cosmos-kit ve Interchain Kit `getOfflineSigner` üzerinden değişiklik olmadan çalışır ve işlemde katman yoksa QoreX aynı katmanı ekler.
- **Sürüme göre değil, yeteneğe göre algılama.** `window.qorex.native.capabilities` bir yapının neler yaptığını listeler, böylece tek bir kod yolu her sürümde çalışır.
- **Hiçbir şey ele geçirilmez.** QoreX kendisini EIP-6963 ve Solana Wallet Standard ile duyurur, `window.keplr` değerini asla ayarlamaz ve başka bir cüzdanın `window.ethereum` değerinin üzerine asla yazmaz.
- **Kuantum sonrası yarısı olan mesaj imzalama.** `signArbitrary`, hesabın klasik anahtarıyla (ADR-36) ve ML-DSA-87 ile imzalar. Bir sunucu ikisini de `@qorechain/qoresign` ile zincirde kayıtlı anahtara karşı doğrular.
- **QoreChain üzerinde EVM, kullanıcıya açıklanmış hâlde.** `personal_sign`, `eth_signTypedData_v4` ve `eth_sendTransaction` cihazda çözülür, düğüm izin verdiği ölçüde simüle edilir ve onay, QoreChain'in EVM lane'inin ihtiyaç duyduğu işlem başına yetkilendirme penceresini açar.
- **Kör imzalama yok ve bir sitenin asla isteyemeyeceği şeylerin kısa bir listesi var.** QoreX'in gösteremediği bir mesaj reddedilir ve yalnızca cüzdana özgü mesajlar (anahtar yönetimi, harcama kuralları, pencereler, yetkiler) her siteden reddedilir.
- **Bir hizmetin üretebileceği bağlantılar.** Uygulamada bir sayfa açın, alıcının kendi anahtarıyla imzalanmış bir ödeme isteyin veya bir ajan önerisi iletin.

## QoreX'in enjekte ettikleri {#injected}

QoreX her sayfaya, üç sağlayıcısı olan tek bir nesne, `window.qorex`, ekler:

| Sağlayıcı | Nedir |
|---|---|
| `window.qorex.native` | QoreChain (Cosmos) lane'i. Keplr tarzı: `enable`, `getKey`, `signAndBroadcast`, `signDirect`, `signArbitrary`, `verifyArbitrary`, `getOfflineSigner*` ve bir `capabilities` listesi. Keplr'in birebir yerine geçmez. |
| `window.qorex.evm` | QoreChain'in EVM lane'i (ve eklentide Ethereum) için bir EIP-1193 sağlayıcısı. EIP-6963 üzerinden de duyurulur. |
| `window.qorex.svm` | Bir Solana sağlayıcısı. Eklentide Solana dApp'leri normalde QoreX'i bunun yerine Wallet Standard üzerinden bulur. |

QoreX'in yapmadıkları:

- `window.keplr` değerini asla ayarlamaz. Keplr arayan kod QoreX'i bulamaz; bunun yerine `window.qorex` nesnesini algılayın.
- `window.ethereum` değerinin üzerine asla yazmaz. Eklenti onu hiç ayarlamaz. Uygulamanın uygulama içi tarayıcısı `window.ethereum` değerini yalnızca başka hiçbir cüzdan ayarlamamışsa ayarlar. QoreX'i `window.ethereum` ile değil, EIP-6963 adıyla seçin.
- `signAmino` ve `sendTx` yoktur ([cosmjs](#cosmjs) bölümüne bakın).

## QoreX'i algılama {#detection}

**EVM.** EIP-6963 duyurularını dinleyin ve `rdns` değeri `network.qore.qorex` olanı seçin:

```ts
const wallets = new Map<string, EIP6963ProviderDetail>();
window.addEventListener("eip6963:announceProvider", (event) => {
  const detail = (event as CustomEvent<EIP6963ProviderDetail>).detail;
  wallets.set(detail.info.rdns, detail);
});
window.dispatchEvent(new Event("eip6963:requestProvider"));

const qorex = wallets.get("network.qore.qorex"); // undefined when QoreX is not there
```

**QoreChain native lane'i.** `window.qorex?.native` nesnesini kontrol edin ve yeteneklerini okuyun. Sürüm numarası yerine bunları kontrol edin:

```js
const native = window.qorex?.native;
const can = (name) => native?.capabilities?.includes(name) === true;
```

| Yetenek | Eklenti | Uygulama |
|---|---|---|
| `signAndBroadcast` | 0.3.5 | 1.2.1 (yöntem 1.2.0'dan itibaren mevcut) |
| `signDirectAddsPqcLayer` | 0.4.0 | 1.2.1 (davranış 1.2.0'dan itibaren) |
| `signArbitrary` | 0.4.0 | 1.2.1 (yöntem 1.2.0'dan itibaren mevcut) |
| `listAccounts`, `connectProofPicksAccount`, `executeRequest` | 0.3.x | uygulamada yok |

Uygulama 1.2.0'da yöntemler vardır ancak hiçbir yetenek bildirmez; onu da kapsamak için `typeof window.qorex?.native?.signArbitrary === "function"` kontrolüne geri dönün. `executeRequest`, yalnızca `dashboard.qorechain.io` için çalışan Dashboard köprüsüdür ([Dashboard köprüsü](/qorex/browser-extension#dashboard-bridge) bölümüne bakın); diğer sitelerin buna ihtiyacı yoktur. 1.2.5 ve 0.4.4 yapıları öncekilerle aynı yetenekleri bildirir.

**Eklenti mi uygulama mı.** Bir sayfa hangisiyle konuştuğunu soramaz ve sormasına da gerek olmamalıdır. Önemli farklar aşağıdaki tablodadır.

| | Eklenti (masaüstü) | Uygulama (uygulama içi dApp tarayıcısı) |
|---|---|---|
| QoreChain native lane'i | evet | evet |
| QoreChain üzerinde EVM imzalama | evet | evet |
| Ethereum üzerinde EVM (site başına, `0x1` için `wallet_switchEthereumChain`) | evet | hayır, yalnızca QoreChain'in etkin ağı |
| EVM olayları (`connect`, `accountsChanged`, `chainChanged`) | üçü de | yalnızca `connect`: hesap veya ağ değiştirmek için tarayıcı kapatılır |
| Solana (Wallet Standard) | evet | hayır, uygulama içi tarayıcı Solana işlemlerini imzalamaz |
| Dashboard köprüsü (`connectProof`, `executeRequest`) | evet, yalnızca `dashboard.qorechain.io` | hayır |
| Bir bağlantıdan sayfa açma | uygulanamaz | `browse` bağlantıları ([Bağlantılar](#links) bölümüne bakın) |

Her birinin kullanıcı tarafı için [Tarayıcı Eklentisi](/qorex/browser-extension) ve [dApp Tarayıcısı](/qorex/dapp-browser) sayfalarına bakın.

## Bağlanma {#connect}

Bağlanmak site başına bir onay gerektirir; bu onay yalnızca herkese açık adresi açığa çıkarır:

```js
await window.qorex.native.enable("qorechain-vladi"); // once per site; mainnet chain id
const key = await window.qorex.native.getKey("qorechain-vladi");
// key.bech32Address is the qor1... address; key.algo is "secp256k1", or "ethsecp256k1" for a coin-60 account
```

EVM:

```js
const [account] = await qorex.provider.request({ method: "eth_requestAccounts" });
```

`eth_accounts`, kullanıcı siteyi onaylayana kadar boş bir liste döndürür ve asla kendi başına bir pencere açmaz. `enable` ve `eth_requestAccounts` ise cüzdan kilitliyken onu açar ([Cüzdan kilitliyken](#locked) bölümüne bakın).

Eklenti, hesap, cüzdan veya ağ değiştiğinde `qorex_keystorechange` adlı bir pencere olayı tetikler. Onaylar cüzdan başına saklanır ve kullanıcı bir siteyi **Bağlı siteler** altından istediği zaman iptal edebilir.

## QoreChain işlemi gönderme: `signAndBroadcast` {#sign-and-broadcast}

Kayıtlı bir kuantum sonrası anahtarı olan bir hesaptan yapılan her QoreChain işlemi hibrit bir imza taşımalıdır: secp256k1 **ve** ML-DSA-87. ML-DSA anahtarını yalnızca cüzdan tutar, bu yüzden bir sayfa bu imzayı kendisi oluşturamaz. Mesajları gönderin, gerisini QoreX yapar:

1. kullanıcıya çözülmüş mesajları ve ücreti gösterir,
2. işlemi kullanıcının seçtiği hesap için oluşturur,
3. hibrit imzayı ekler (bu hesabın ilk işlemiyse önce hesabın kuantum sonrası anahtarını kaydeder),
4. yayınlar ve sonuçla birlikte çözümlenir.

```js
const provider = window.qorex.native;
if (!provider.capabilities?.includes("signAndBroadcast")) {
  throw new Error("Please update QoreX");
}
await provider.enable("qorechain-vladi");              // connect, once per site

const res = await provider.signAndBroadcast({
  chainId: "qorechain-vladi",                          // must be the wallet's active network
  messages: [
    {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(msgSend).finish(),         // protobuf bytes: Uint8Array,
    },                                                 // number[] or a base64 string
  ],
  memo: "",                                            // optional, at most 256 bytes
  gasLimit: 300000,                                    // optional: 100k to 5M, default 400k
});
// res = { txHash, code, height?, shield }
```

`shield`, işlenen işlemin hibrit katmanı taşıyıp taşımadığını söyler: taşıyorsa `shielded`, katman olmadan işlendiyse `downgraded` (bu durumu bildirin), aksi hallerde `pending` veya `classical`.

**Kurallar**

- `chainId` cüzdanın etkin ağına eşit olmalıdır: `qorechain-vladi` (mainnet) veya kullanıcı testnet'e geçtiyse `qorechain-diana`. Uyuşmazlık, her ikisini de adıyla belirten bir mesajla reddedilir. **Bir dApp ağı değiştiremez** ([Testnet](#testnet) bölümüne bakın).
- Çağrı başına 1 ila 32 mesaj. Mesaj baytları tam olarak gönderdiğiniz gibi imzalanır; cüzdan onları yeniden kodlamaz.
- En fazla 256 baytlık bir memo onay ekranında gösterilir; içindeki satır sonları ve kontrol karakterleri kodlarıyla gösterilir.
- Yalnızca cüzdana özgü mesajlar reddedilir ([Bir sitenin asla isteyemeyeceği mesajlar](#wallet-only) bölümüne bakın).
- QoreX gösteremediği bir mesajı imzalamaz. Böyle bir istek, `MsgExec` içindekiler dahil, `QoreX cannot show what <type> does, so it will not sign it` ile reddedilir. QoreX'in çözebildiği bir mesaj türü kullanın.

**Gas ve ücret**

- Ücret, `gasLimit` çarpı ağın gas fiyatıdır (QoreX ağın canlı asgari değerini izler) ve kullanıcı onaylamadan önce gösterilir.
- `gasLimit` değeriniz 100.000 ile 5.000.000 arasında tutulur; değer verilmezse 400.000 olur.
- CosmWasm veya cross-VM kodu çalıştıran bir işlem, onaydan önce simüle edilir. QoreX simüle edilen gas'ın en az 1,3 katını, en fazla 20.000.000 olacak şekilde ister; sayfanızdan gelen daha yüksek bir değer korunur. Sözleşmenin reddedeceği bir çağrı, onaydan önce zincirin nedeniyle birlikte reddedilir. Çağrı 20.000.000'dan fazlasına ihtiyaç duyuyorsa QoreX bunu söyler ve reddeder.
- Bir işlem ağın kendi işlem başına gas sınırını aşamaz; QoreX bunun üzerindeki bir işlemi herhangi bir şey imzalanmadan önce reddeder.

Kullanıcının reddi, `4001` koduyla `QoreX: signature rejected` fırlatır.

## cosmjs, cosmos-kit ve Interchain Kit {#cosmjs}

`getOfflineSigner(chainId)`, `getOfflineSignerOnlyDirect(chainId)` ve `getOfflineSignerAuto(chainId)` bir cosmjs `OfflineDirectSigner` döndürür, böylece `SigningStargateClient` değişiklik olmadan çalışır:

```js
const signer = window.qorex.native.getOfflineSigner("qorechain-vladi");
const client = await SigningStargateClient.connectWithSigner(rpc, signer, {
  gasPrice: GasPrice.fromString("0.15uqor"),
});
await client.sendTokens(from, to, [{ denom: "uqor", amount: "1000" }], "auto");
```

**Cüzdanın eklediği kuantum sonrası katman.** İşlem bir ML-DSA katmanı taşımıyorsa (bir sayfa bunu üretemez), QoreX ekler: katmanın maliyetini simüle eder, işlemdeki gas'ı ve ücreti yükseltir, gövde ile yükseltilmiş ücret bilgisi üzerinde ML-DSA-87 imzası atar ve kullanıcı onaylamadan önce son ücreti gösterir. Dolayısıyla `"auto"` ücretiniz katmanın maliyeti kadar, on binlerce gas daha yüksek olarak geri döner. Gönderdiğinizi değil, her zaman geri dönen `signed` belgesini yayınlayın. Buna güvenmeden önce `capabilities.includes("signDirectAddsPqcLayer")` kontrolü yapın.

- Hesabın kuantum sonrası anahtarı zaten kayıtlı olmalıdır; anahtar, QoreX'ten yaptığı ilk işlemle kaydedilir. Aksi halde çağrı `4100` kodu ve `pqc-key-missing` nedeniyle başarısız olur. Kullanıcının önce QoreX'ten bir işlem göndermesini sağlayın veya anahtarı kendisi kaydeden `signAndBroadcast` kullanın.
- **Amino reddedilir.** `signAmino` ve `getOfflineSignerOnlyAmino().signAmino`, `4200` kodu ve `amino-unsupported` nedeniyle reddedilir, çünkü Amino JSON hibrit imzayı taşıyamaz. Kütüphanenizi doğrudan imzalama için yapılandırın.
- MetaMask'tan içe aktarılan hesaplar (coin 60) `signAndBroadcast` üzerinden imzalar; eklenti bunlar için `signDirect`'i, dolayısıyla cosmjs imzacılarını reddeder.
- `getKey` ve `getAccounts` etkin hesabı döndürür.

Bir web uygulamasında [cüzdan bağdaştırıcısı](/developer-tools/wallet-adapter) ve [QoreX entegrasyonları](/developer-tools/qorex-integrations) paketleri (RainbowKit, Interchain Kit, cosmos-kit) bu algılamayı ve bu çağrıları sizin için sarmalar.

## `signDirect` {#sign-direct}

`signDirect`, sayfanızın oluşturduğu bir `SignDoc`'u imzalar. Gövde zaten bir ML-DSA katmanı taşıyorsa QoreX, herhangi bir pencere açılmadan önce, zincirin yaptığı gibi onu hesabın kayıtlı anahtarına karşı doğrular. Hiç katman taşımıyorsa QoreX yukarıda anlatıldığı gibi ekler. Kayıtlı anahtarla eşleşmeyen bir katman, yalnızca cüzdana özgü bir mesaj, QoreX'in gösteremediği bir mesaj veya 1.000'den fazla mesaj, herhangi bir onay açılmadan önce reddedilir. Yeni kod için `signAndBroadcast` daha basittir.

## Mesaj imzalama: `signArbitrary` ve `verifyArbitrary` {#sign-arbitrary}

```js
const message = "Log in to example.com\nNonce: 1234";
const sig = await window.qorex.native.signArbitrary("qorechain-vladi", address, message);
const ok = await window.qorex.native.verifyArbitrary("qorechain-vladi", address, message, sig);
```

İmza [QoreSign message-signing-v1](/qoresign/spec/message-signing-v1) belirtimine uyar: hesabın klasik anahtarıyla (secp256k1 veya coin-60 hesabı için eth_secp256k1) ADR-36, artı `"qorechain-msg-v1|" + chainId + "|" + data` üzerinde ML-DSA-87. Ayrıca Keplr için yazılmış kodun okuyabilmesi için Keplr'in `pub_key` ve `signature` alanlarını da taşır. Kullanıcı mesajın tamamını görür. Bir mesaj 1 ila 4096 bayt olmalı ve başka bir QoreChain imzalama alanıyla başlamamalıdır.

**Doğrulamayı asla sayfada değil, sunucunuzda yapın.** ML-DSA yarısı, istemcinin gönderdiği bir anahtara karşı değil, her zaman o adres için zincirde kayıtlı anahtara karşı kontrol edilmelidir. [`@qorechain/qoresign`](/qoresign/overview) kullanın:

```ts
import { verifyMessageWithChain } from "@qorechain/qoresign/network";

try {
  await verifyMessageWithChain({
    rest: "https://api.qore.host",     // the network's REST endpoint
    chainId: "qorechain-vladi",
    signer: address,                    // the qor1... address that signed
    data: message,                      // exactly the text you asked the user to sign
    signature: sig,                     // the object signArbitrary returned
  });
  // signed in
} catch (err) {
  // a QoreSignError with a stable code: the signature does not verify
}
```

`verifyMessageWithChain`, imzalayanın kayıtlı ML-DSA-87 anahtarını getirir ve herhangi bir şey doğrulanmazsa `QoreSignError` fırlatır. O ağda hiç işlem göndermemiş bir hesabın henüz kayıtlı anahtarı yoktur ve `KEY_NOT_REGISTERED` ile başarısız olur: kullanıcıdan önce QoreX'ten bir işlem göndermesini isteyin. İmzanın başka bir sitede yeniden kullanılamaması için mesaja tek kullanımlık bir nonce ve alan adınızı koyun ve ikisini de sunucuda kontrol edin. QoreSign rehberleri oturum açma mesajlarını daha ayrıntılı ele alır.

## EVM dApp'leri {#evm}

QoreX EIP-6963'e yanıt verir ve EIP-1193 sağlayıcısı üzerinden QoreChain'in EVM lane'inde (zincir kimliği **9801**, testnet **9800**) `personal_sign`, `eth_signTypedData_v4` ve `eth_sendTransaction` imzalar. Eklentide, site `0x1` için `wallet_switchEthereumChain` çağırdıktan sonra Ethereum'da da imzalar (site başına). Salt okunur yöntemler (`eth_call`, `eth_getBalance`, `eth_getLogs` ve diğer standart okumalar) seçili ağın düğümüne gider. Diğer her yöntem `4200` yanıtı verir; QoreX'in imza attığı bir zincir dışındaki herhangi bir şeye yapılan `wallet_switchEthereumChain` veya `wallet_addEthereumChain` ise `4902` yanıtı verir. Bir site diğer QoreChain ağına geçemez: bu, `switch the network in QoreX itself` mesajıyla `4100` yanıtı verir.

```js
const [from] = await qorex.provider.request({ method: "eth_requestAccounts" });
const hash = await qorex.provider.request({
  method: "eth_sendTransaction",
  params: [{ from, to, value: "0x0", data }],
});
```

**Onayın çözdükleri.** Her pencere neye yetki verildiğini cihazda çözülmüş olarak söyler: transferler, token harcama izinleri (sınırsız olanda UNLIMITED yazar), `setApprovalForAll`, Permit ve Permit2 imzaları ve Safe işlemleri (bir DELEGATECALL yüksek riskli olarak işaretlenir). QoreX'in çözemediği bir çağrı bilinmeyen ve yüksek riskli olarak gösterilir ve ikinci bir dokunuş gerektirir. EIP-7702 delegasyonları reddedilir.

**Simülasyon.** İmzalamadan önce pencere, işlemin kullanıcının bakiyesinde neyi değiştirdiğini gösterir.

- Düğümde `eth_simulateV1` (transfer izleme) varsa QOR ve token değişikliklerini gösterir.
- `eth_simulateV1` bulunmayan bir düğümde (bugün QoreChain'in EVM düğümlerinde durum budur) yalnızca `eth_call` kullanılabilir ve bu, çağrının revert edip etmeyeceğini söyler. Bu durumda veri taşıyan bir çağrı "what it does to your tokens was not checked" gösterir ve kullanıcının onaylamak için ikinci kez dokunması gerekir.
- Başarısız olacak veya düğümün simüle edemediği bir işlem de ikinci bir dokunuş gerektirir.
- Simülasyon, işlemi alacak olan aynı düğüme gider; başka hiçbir yere hiçbir şey gönderilmez.

Sayfayı bu ikinci dokunuş sürpriz olmayacak şekilde tasarlayın: çağrının ne yaptığını kendi arayüzünüzde de açıklayın.

**İşlem başına EVM yetkilendirme penceresi.** QoreChain'de bir EVM işlemi, yalnızca hesabın native lane'deki hibrit ML-DSA-87 imzasıyla açılmış bir yetkilendirme penceresi içinde kabul edilir. İşlemi kapsayan bir pencere yoksa aynı onay, tam olarak o işlem için bir pencere açar:

- sınırı, değer artı azami ücrettir,
- yaklaşık on dakika,
- ağın desteklediği yerde, işlemin çağırdığı sözleşmelerle sınırlıdır.

Onay, pencerenin kabul edeceği her sözleşmeyi (yakın zamanda aynı site için bir imzayı doğrulayan sözleşmeler dahil) adıyla belirtir ve kullanıcının açık olan herhangi bir penceresinin yerini aldığını söyler. Ağ bir pencereyi sözleşmelerle sınırlayamıyorsa QoreX, sınırsız bir pencere açmadan önce sözleşmeleri adlandırıp pencerenin herhangi bir sözleşmeyi kabul edeceğini söyleyerek ikinci kez sorar; "hayır" yanıtı hiçbir şey göndermez. QOR sınırı, azami ücret dahil hesaptan çıkan tüm QOR'u kapsar ve pencerenin kullanıcının çağırmasına izin verdiği bir sözleşme yine de hesap adına hareket edebilir (elinde tuttuğu veya onay verilen token'lar ya da diğer sözleşmelerin tuttuğu QOR). [EVM erişim penceresi](/qorex/security-and-recovery#evm-window) bölümüne bakın.

**Kullanıcının elle açtığı pencere.** Kullanıcının pencere ekranında açtığı bir pencere varsayılan olarak **Yalnızca QOR transferleri** içindir; herhangi bir sözleşmeye izin vermek, uyarı içeren ayrı bir seçimdir. Dolayısıyla kullanıcının daha önce açtığı bir pencere bir token veya sözleşme çağrısını kapsamaz. Bir pencerenin var olmasını bekleyen bir dApp, ya QoreX'in işlem başına pencereyi açmasına izin vermeli (en basit ve en dar yol) ya da kullanıcıya, pencereyi kendisi açıyorsa **Herhangi bir sözleşme** seçeneğini seçmesini söylemelidir.

**Bu lane'deki diğer kurallar**

- QoreChain'in EVM lane'inde yalnızca MetaMask'tan içe aktarılan hesaplar (coin type 60) gönderim yapabilir. Başka bir hesap `4100` yanıtı verir ve mesaj kullanıcıya sonraki adımları söyler.
- Staking, dağıtım, yönetişim, vesting, bank ve IBC precompile'ları reddedilir (`4200`): QoreChain'de bunlar native lane üzerinden yapılır.
- EVM lane'indeki imzalar klasiktir (secp256k1). QoreX bundan fazlasını iddia etmez.
- Seçili zincirden başka bir zincire ait typed data `-32602` ile reddedilir.

## Solana dApp'leri (eklenti) {#solana}

Eklenti, Solana mainnet'inde (`solana:mainnet`) Solana Wallet Standard'a kaydolur, böylece Solana dApp'leri onu özel kod olmadan bulur. Özellikler: legacy ve v0 işlemler için connect, disconnect, events, `solana:signMessage`, `solana:signTransaction` ve `solana:signAndSendTransaction`. `connect({ silent: true })` desteklenir.

Onay, System transferlerini, SPL Token ve Token-2022 transferlerini, onayları, yetki değişikliklerini ve hesap kapatmalarını çözer ve bir memo'nun metnini gösterir. QoreX'in çözemediği bir talimat ekranda okunamaz olarak işaretlenir ve onay ikinci bir dokunuş gerektirir. Cüzdanı imzacı olarak listelemeyen bir işlem reddedilir ve `signMessage`, aslında bir işlem olan baytları imzalamaz. İmzalar klasiktir ve öyle işaretlenir.

Uygulamanın uygulama içi tarayıcısı Solana işlemlerini imzalamaz. QoreChain'in kendisindeki Solana, cüzdanın içinde ayrı, yalnızca testnet'e özgü bir özelliktir: [Yalnızca testnet özellikleri](/qorex/testnet-features) sayfasına bakın.

## Cüzdan kilitliyken {#locked}

Eklenti 0.4.4 ve Safari 1.8.2'den itibaren, QoreX kilitliyken yapılan bir imzalama isteği (native, EVM veya Solana), siteyi adıyla belirterek cüzdanı parola ekranında açar. Kullanıcı kilidi açtıktan sonra pencere kapanır ve istek kendi onayını gösterir. Kullanıcı bunun yerine pencereyi kapatırsa istek `4001` koduyla reddedilir. Bundan önce böyle bir istek hemen "wallet is locked" ile başarısız oluyordu.

- `enable`, `getKey`, `eth_requestAccounts` ve imzalama yöntemleri cüzdanı bu şekilde uyandırır.
- Bir sayfanın yüklenirken yaptığı okumalar (`eth_accounts`, `eth_chainId`, zincir okumaları) asla pencere açmaz: `eth_accounts` yalnızca boş bir liste döndürür.
- Parola olmadan hiçbir şey imzalanmaz; kullanıcı cüzdan değiştirirse veya yeniden kilitlerse bekleyen istek "hayır" ile yanıtlanır.

`4001` kodunu bir arıza değil, normal bir sonuç olarak ele alın.

## Bir sitenin asla isteyemeyeceği mesajlar {#wallet-only}

QoreX bunları her siteden ve her yoldan (`signAndBroadcast`, `signDirect`, bir ajan önerisi) reddeder, çünkü hesap üzerinde kalıcı yetki devrederler. Kullanıcı bunları QoreX'in kendi ekranlarından yapar:

- kuantum sonrası anahtar yönetimi: anahtar kaydetme, taşıma ve rotasyonu, şifreleme anahtarı ve PQC multisig kaydı;
- authenticator'lar ve harcama kuralları: imzalama anahtarı kaydetme veya iptal etme, harcama kuralları, soyut hesap oluşturma;
- EVM penceresi açma, kapatma ve temizleme (ve delegasyon onayı);
- QoreChain üzerinde Solana penceresi açma ve kapatma ve Solana iletim mesajı;
- `MsgGrant` veya `MsgExec` için bir authz yetkisi (`MsgGrant`), çünkü böyle bir yetki, yetki verilenin hesap gibi davranmasına izin verirdi.

Ret, doğrudan, herhangi bir derinlikte `MsgExec` içinde ve bu mesajlardan birinin genel yetkisi olarak uygulanır. Hata `QoreX: <type> is managed by the wallet itself, not by a website` şeklindedir.

## Hatalar ve olaylar {#errors}

Hatalar bir EIP-1193 `code` değeri taşır:

| Kod | Anlamı |
|---|---|
| `4001` | Kullanıcı reddetti veya pencereyi kapattı (kilit açma penceresi dahil). |
| `4100` | Yetkisiz: bilinmeyen hesap, kayıtlı kuantum sonrası anahtar yok (`reason: pqc-key-missing`), EVM lane'ini deneyen bir coin-118 hesabı veya ağ değiştirme isteği. |
| `4200` | Desteklenmiyor: Amino (`reason: amino-unsupported`), QoreX'in imzalamadığı bir EVM yöntemi, bir EIP-7702 delegasyonu, yalnızca native bir precompile. |
| `4901` | Yanlış Solana zinciri. |
| `4902` | Bilinmeyen zincir. |
| `-32602` | Hatalı parametreler (örneğin başka bir zincire ait typed data). |

Olaylar:

- EVM sağlayıcısı: eklentide `connect`, `accountsChanged` ve `chainChanged`; uygulamada yalnızca `connect`.
- Native lane (eklenti): hesap, cüzdan veya ağ değiştiğinde `qorex_keystorechange` pencere olayı. cosmos-kit bunu dinler.
- Solana Wallet Standard: `change`.

## Bir hizmetin üretebileceği bağlantılar {#links}

Üç bağlantı, QoreX'i başka bir sayfadan veya uygulamadan açar.

### Uygulamada sayfa açma: `browse` {#link-browse}

```
https://link.qore.network/browse?url=<encodeURIComponent(https URL)>
qorex://browse?url=<encodeURIComponent(https URL)>
```

Telefonda bağlantı, olağan biyometrik istemden sonra sayfanızı QoreX'in dApp tarayıcısında açar. Sayfa, bir alan adı üzerinde `https://` olmalıdır. Sayfada şunlardan biri varsa QoreX bağlantıyı reddeder:

- bir port,
- bir kullanıcı adı veya parola,
- bir IP adresi,
- `localhost`,
- bir ters eğik çizgi veya boşluk,
- 2048 karakterden fazlası.

Bağlantı sayfaya hiçbir şey vermez. Sayfa yine de bağlanmayı istemek zorundadır ve her imza yine onay ekranından geçer. Telefonda cüzdan yoksa uygulama ilk kurulum ekranında kalır. QoreX yüklü değilse https biçimi, onu edinme bağlantısı içeren bir sayfa gösterir. Eklentide `browse` bağlantısı yoktur.

### Ödeme isteme: `qorex://pay` {#link-pay}

```
qorex://pay?v=1&net=qorechain-vladi&to=qor1...&amt=1500000&d=uqor&id=pr_...&tag=...&pk=...&sig=...
```

Bir ödeme isteği bağlantısı alıcıyı, temel birimlerle tutarı, para birimi kodunu (denom), bir istek kimliğini ve memo etiketini, isteğe bağlı bir not ve @handle'ı, ağı ve tüm bunların üzerinde alıcının kendi hesap anahtarıyla atılmış bir imzayı taşır. Ödeyenin QoreX'i imzayı, imzalama anahtarının alıcı adresine sahip olduğunu, tam ağı ve varsa @handle'ı kontrol eder, ardından göndermeden önce normal incelemeyi gösterir. Değiştirilmiş bir tutar veya alıcı algılanır ve istek, zincir okunarak ödendi olarak işaretlenir.

**Bağlantıyı elle değil, QoreX'in kendi istek ekranıyla** (uygulama, **Ödeme istekleri**, **Yeni istek**) üretin: imza, bir sayfanın asla tutmadığı hesap anahtarıyla atılır. Kendi oluşturduğunuz veya değiştirdiğiniz bir bağlantıyı desteklenmiyor kabul edin. Bağlantının web formu henüz mevcut değildir.

### Ajan önerisi iletme: `qorex://propose` {#link-propose}

```
qorex://propose?d=<base64url of the proposal JSON>
```

Yalnızca uygulama. Bağlantı, bir yapay zeka ajanının önerdiği bir işlemi taşır; QoreX onu doğrular, simüle eder ve normal onay penceresinde gösterir. Bir öneri asla olduğu gibi imzalanmaz ve bir bağlantı en fazla 64 KB taşıyabilir. Aşağıdaki [yapay zeka ajanı modeline](#agents) bakın.

## Yapay zeka ajanları {#agents}

Bir cüzdanla çalışan bir yapay zeka ajanı geliştiriyorsanız model şudur: ajan, kullanıcının izin verdiklerini okuyabilir ve bir işlem **önerebilir**; asla imzalamaz. QoreX her öneriyi kontrol eder ve simüle eder; kullanıcı da bir dApp isteğinin kullandığı aynı onay penceresinde onaylar veya reddeder. Yalnızca cüzdana özgü bir mesaj için yapılan öneri, herhangi bir pencere açılmadan önce reddedilir. Eklentide bir ajan QoreX'e, kullanıcının bilgisayarındaki henüz yayımlanmamış bir yardımcı program üzerinden ulaşır; uygulamada ise öneri yapıştırılır veya bir `qorex://propose` bağlantısı olarak gelir. Kullanıcının bunu nasıl açtığını ve ne gördüğünü öğrenmek için [Geliştirici modu: yapay zeka ajanları](/qorex/developer-mode#ai-agents) bölümünü okuyun.

## Testnet {#testnet}

**Bir dApp ağı değiştiremez.** Bir istekteki `chainId`, cüzdanın bulunduğu ağla eşleşmelidir; uyuşmazlık reddedilir. Bu, kullanıcıyı onu fonların aynı göründüğü ama aynı olmadığı bir ağa taşıyacak bir sayfadan korur.

Testnet'i (`qorechain-diana`, EVM zincir kimliği 9800) kullanmak için kullanıcı ağı QoreX içinde değiştirir:

- **Uygulama:** Ayarlar, ardından **Testneti kullan (geliştiriciler)**.
- **Eklenti:** Geliştirici modunu açın (açılır pencerenin altındaki sürüm numarasına yedi kez dokunun), ardından **Testnet'e geç (diana)**. **Mainnet'e geri dön** varsayılana döndürür.

Ardından her ekranda bir TESTNET bandı görünür, testnet bakiyelerinde USD değeri gösterilmez ve ağ yeniden başlatma olmadan yeniden bağlanır. Kullanıcılarınıza testnet sayfanızı açmadan önce ağı değiştirmelerini söyleyin. Yalnızca testnet'e özgü cüzdan özellikleri (IBC, QoreChain Bridge ekranı, QoreChain üzerinde Solana) [Yalnızca testnet özellikleri](/qorex/testnet-features) sayfasında anlatılır.

## Sorun giderme {#troubleshooting}

| Gördüğünüz | Nedeni ve yapılacaklar |
|---|---|
| `window.keplr` tanımsız | Tasarım gereği. `window.qorex.native` veya QoreX bağlayıcısı olan bir kütüphane kullanın. |
| `window.ethereum` QoreX değil | Tasarım gereği. Cüzdanı EIP-6963 üzerinden seçin (`rdns` `network.qore.qorex`). |
| `QoreX: chain X does not match the active network Y` | Kullanıcı diğer ağda. Ondan QoreX'te değiştirmesini isteyin; siz yapamazsınız. |
| `4100`, `pqc-key-missing` | Hesabın ağda henüz kuantum sonrası anahtarı yok. Kullanıcıdan QoreX'ten bir işlem göndermesini isteyin veya `signAndBroadcast` kullanın. |
| `4200`, `amino-unsupported` | Kütüphaneniz Amino istiyor. Doğrudan imzalamayı yapılandırın. |
| `QoreX: <type> is managed by the wallet itself, not by a website` | Yalnızca cüzdana özgü bir mesaj. Kaldırın; kullanıcı bunu QoreX'ten yapar. |
| `QoreX cannot show what <type> does, so it will not sign it` | QoreX'in çözemediği bir mesaj. Gösterebileceği bir tür kullanın. |
| `QoreX: send between 1 and 32 messages` | İsteği bölün. |
| `QoreX: the memo may be at most 256 bytes` | Memo'yu kısaltın. |
| `QoreX: a message must be 1 to 4096 bytes` | İmzalanmasını istediğiniz mesajı kısaltın. |
| `needs about N gas, more than the 20,000,000 QoreX allows` | Sözleşme çağrısı tek işlem için çok ağır. Bölün. |
| `QoreX: EVM method X not yet supported` (`4200`) | QoreX yalnızca `personal_sign`, `eth_signTypedData_v4` ve `eth_sendTransaction` imzalar. |
| `QoreX: this account uses the QoreChain (coin 118) key and cannot send on QoreChain's EVM lane` | EVM lane'inde yalnızca MetaMask'tan içe aktarılan hesaplar (coin 60) gönderim yapar. |
| `QoreX: staking, rewards, IBC and governance on QoreChain go through the native lane` | Bunlar için native lane'i çağırın; EVM precompile'ları reddedilir. |
| Bir EVM çağrısı sürekli ikinci bir dokunuş istiyor | Düğüm çağrının token'lara ne yaptığını kontrol edemiyor veya çağrı çözülemiyor. Bunu sayfanızda açıklayın. |
| Kullanıcı pencere açtığı halde bir token çağrısı başarısız oluyor | Kullanıcının elle açtığı pencere varsayılan olarak yalnızca QOR transferlerini kapsar. QoreX'in işlem başına pencereyi açmasına izin verin veya kullanıcıya herhangi bir sözleşmeyi seçmesini söyleyin. |
| Sayfa imza istedikten hemen sonra `4001` | Kullanıcı reddetti veya kilitli cüzdandaki kilit açma penceresini kapattı. Yeniden denemeyi teklif edin. |
| `eth_accounts` `[]` döndürüyor | Site henüz bağlı değil. `eth_requestAccounts` çağırın. |
| `browse` bağlantısı hiçbir şey yapmıyor | Sayfa adresi bir kuralı çiğnedi (port, IP, `localhost`, https olmaması, 2048 karakterden uzun) veya telefonda henüz cüzdan yok. |
| Sunucunuzda `KEY_NOT_REGISTERED` | İmzalayan o ağda hiç işlem göndermedi. Önce bir işlem isteyin. |

Sorun devam ederse kullanıcı [Geliştirici modundan](/qorex/developer-mode) gizlenmiş bir istek günlüğü gönderebilir, siz de sorunu yeniden üretmek için testnet'i kullanabilirsiniz.

## Nerede yayımlandı {#where-published}

| Ne | Nerede |
|---|---|
| QoreX tarayıcı eklentisi | Chrome Web Store, Firefox Add-ons ve Mac App Store (Safari). [Tarayıcı Eklentisi](/qorex/browser-extension#install) sayfasına bakın. |
| QoreX uygulaması ve dApp tarayıcısı | App Store ve Google Play. [QoreX Cüzdanı](/qorex/overview#how-to-access) sayfasına bakın. |
| Mesaj ve işlem doğrulama | `@qorechain/qoresign` (TypeScript ve diğer diller). [QoreSign](/qoresign/overview) sayfasına bakın. |
| Web uygulamaları için cüzdan algılama | [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) |
| RainbowKit, Interchain Kit ve cosmos-kit bağlayıcıları, tipler ve bir test cüzdanı | [`@qorechain/qorex-*`](/developer-tools/qorex-integrations) |
| İşlem oluşturup göndermek için temel SDK | [Geliştirici Araçları](/developer-tools/overview) |

QoreX kaynak kodu herkese açık değildir. Her mağazadaki güncel sürüm [genel bakış](/qorex/overview#versions) sayfasındadır.
