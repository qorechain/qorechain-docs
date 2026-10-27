---
slug: /developer-tools/wallet-adapter
title: Cüzdan Adaptörü
sidebar_label: Cüzdan adaptörü
sidebar_position: 2
---

# Cüzdan adaptörü (`@qorechain/wallet-adapter`)

`@qorechain/wallet-adapter`, `signDirect` sunan Cosmos cüzdanlarına (Keplr, Leap, Cosmostation) QoreChain'i ekler ve zincirin gerektirdiği işlemleri oluşturur: bir native ray işlemi, hesabın klasik secp256k1 imzasının yanında bir ML-DSA-87 (FIPS 204) imzası taşımalıdır ve standart bir cüzdan ML-DSA-87 imzasını üretemez. Adaptör onu üretir, işlem gövdesine yerleştirir ve ardından değiştirilmemiş cüzdandan sıradan bir imza ister. dApp ve cüzdan geliştiricilerine, ayrıca JavaScript'te birleşik QoreChain cüzdanlarına, EVM yetkilendirme penceresi mesajlarına veya bağlı anahtar (authenticator) mesajlarına ihtiyaç duyan araç geliştiricilerine yöneliktir. Güncel sürüm 0.4.0'dır.

Tek ihtiyacınız bir dApp'in kullanıcının QoreX cüzdanından bir işlem göndermesiyse en kısa yol, bu paketteki [`qorexSignAndBroadcast`](#qorex) işlevi veya [Geliştirici paketleri](/developer-tools/overview#group-qorex) dizininde listelenen QoreX paketleridir. Bir cüzdan yazıyorsanız ve beş dilde eksiksiz bir imzalama kütüphanesi istiyorsanız önce [QoreSign](/qoresign/overview) sayfasını okuyun.

## Yenilikler {#innovations}

- **Cüzdan sıradan bir gövdeyi imzalar.** Adaptör gövdeyi uzantı olmadan oluşturur, ML-DSA-87 katmanını sign-bytes üzerinden imzalar, onu `/qorechain.pqc.v1.PQCHybridSignature` uzantı seçeneği (algoritma kimliği 1) olarak gövdeye yerleştirir ve ancak ondan sonra bitmiş `SignDoc` üzerinde `wallet.signDirect` çağrısını yapar. Cüzdan standart bir `SIGN_MODE_DIRECT` imzası üretir ve QoreChain'e özgü hiçbir koda ihtiyaç duymaz. Sonuç, olağan `TxRaw` baytlarıdır.
- **Ağ başına sign-bytes seçici.** ML-DSA-87 anahtarı iki bayt biçiminden birini imzalar ve bir ağ, herhangi bir yükseklikte tam olarak birini doğrular. `signBytesVersion: "auto"` ile (varsayılan) imzalayıcı, düğüme önce `v3.2.0`, sonra `v3.1.98` için `GET /cosmos/upgrade/v1beta1/applied_plan/{name}` isteğini sorar; bunlardan birinin yüksekliği sıfırın üzerindeyse v2 biçimini (`qorechain-pqc-hybrid-v2` alan etiketi artı zincir kimliği) imzalar, yanıtı REST URL'si ve zincir kimliği başına 60 saniye önbelleğe alır ve soramadığında tahmin etmek yerine hata fırlatır. 27 Ekim 2026'da canlı düğümlere karşı kontrol edildi: ana ağ ve test ağı ikisi de `v2` olarak çözümlenir ve `rest` verilmeden `qorechain-vladi` için yapılan bir çağrı hata fırlatır. `refreshSignBytesVersion()` önbelleği atlar ve `isHybridSignBytesRejection()`, `pqc` kod 21 reddini tanır; böylece bir cüzdan açıkken bir ağ yükseltildiğinde çağıran taraf yeniden çözümleyip bir kez daha deneyebilir.
- **Mnemonic başına bir ML-DSA-87 anahtarı, araçlar arasında paylaşılır.** `walletFromMnemonic`, anahtarı `SHAKE-256("qorechain:pqc:v1|" + address + "|" + mnemonic)` olarak türetir ve ML-DSA-87 anahtar üretimine verir. Anahtar hesap adresine bağlıdır ve SDK'nın, `@qorechain/chain-bridge`'in, QoreX'in ve `qorechaind tx pqc recover-key` komutunun kullandığı türetimin aynısıdır; böylece hangi araç imzalarsa imzalasın bir mnemonic tek bir anahtar verir. Bkz. [Deterministik anahtar türetme ve kurtarma](/developer-guide/post-quantum-signing#key-derivation).
- **Bir hesap, üç adres biçimi, bir imza anahtarı.** `generateQoreWallet` ve `walletFromMnemonic`, aynı 20 baytlık kimliğin `qor1`, `0x` (EIP-55) ve SVM base58 biçimlerini ML-DSA-87 anahtar çiftiyle birlikte döndürür. `signClassicalEth` ve `signHybridEth`, Cosmos ray işlemlerini bu eth-native anahtarla (`eth_secp256k1`) imzalar; böylece aynı anahtar başka yerlerde EVM işlemlerini de imzalar.
- **PQC kurtarma kodları.** `generatePqcRecoveryCode`, `QRC1-` artı 24 bitlik sağlama toplamlı Crockford base32 biçiminde rastgele 256 bitlik bir sır döndürür. `pqcKeyFromRecoveryCode(code, address)`, ML-DSA-87 anahtarını ondan, adrese bağlı olarak türetir. Yanlış yazılmış bir karakter, hiçbir şeyle eşleşmeyen bir anahtarı sessizce türetmek yerine bir mesajla reddedilir ve kod bilerek bir tohum ifadesi (seed phrase) değildir.
- **İmzalayıcı olarak QoreX.** `qorexSignAndBroadcast`, protobuf ile kodlanmış mesajları (çağrı başına 1 ila 32, not en fazla 256 bayt, gas limiti 100.000 ila 5.000.000) kullanıcının QoreX cüzdanına gönderir; cüzdan bunları çözülmüş halde gösterir, yalnızca cüzdanın üretebileceği ML-DSA-87 katmanını ekler, imzalar ve yayınlar. Adaptör sınırları yerel olarak denetler ve PQC anahtar yönetimi mesajlarını (`MsgRegisterPQCKey`, `MsgRegisterPQCKeyV2`, `MsgMigratePQCKey`, `MsgRotatePQCKey`) bir authz `MsgExec` içinde herhangi bir derinlikte olsalar bile reddeder. Çözemediği bir `MsgExec` reddedilir.
- **EVM yetkilendirme penceresi için yapı taşları, asla otomatik değil.** `openEvmWindowMsg`, `closeEvmWindowMsg`, `fetchEvmWindow`, `parseEvmWindow` ve `isEvmWindowRejection`, bir EVM gönderiminden önce açık olması gereken pencereyi kapsar. Her sınır (`blocks` 1 ila 17.280, `maxTxs` 1 ila 1.000, `maxValue` sıfırın üzerinde) zorunludur ve varsayılan olmadan istemci tarafında denetlenir, pencere durum alanları BigInt'tir ve paket hiçbir zaman kendi başına bir pencere açmaz: kullanıcının açık bir yetkilendirme adımı görmesi amaçlanır.
- **Zincirle birebir özetler içeren bağlı anahtar (authenticator) mesajları.** `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `buildPhantomExecuteEvm`, `buildPhantomExecuteCosmos`, `buildMetaMaskExecuteEvm` ve `buildMetaMaskExecuteCosmos`, bir Phantom veya MetaMask anahtarının bir izin kümesi ve harcama kuralı altında bir QoreChain hesabından harcama yapmasını sağlayan mesajları oluşturur. `evmAuthSignBytesV2`, zincir v3.2.3'ten gelen özettir ve çağrının gas limitini de bağlar (sıfırdan farklı olmalıdır). Nonce, bağlı anahtarın authenticator sırasıdır, hesabın EVM nonce'u değildir. Bkz. [Authenticator'lar ve devredilmiş harcama](/sdk/guides/authenticators).
- **Güvenli anahtar rotasyonu.** `rotateFromLegacyWalletKey`, kaldırılmış cüzdan imzası türetimiyle üretilmiş bir anahtardan uzaklaşan bir `MsgRotatePQCKey` oluşturur ve yeniden türettiği anahtar kayıtlı olana eşit değilse reddeder. `rotatePqcKeyMsgFromMnemonic`, eski bir `SHAKE-256(mnemonic)` anahtarını kanonik, adrese bağlı anahtara taşır ve eski türetimi yeni anahtar olarak reddeder.

## Nasıl kullanılır {#how-to-use}

Adaptörü iki cosmjs eş bağımlılığıyla (sürüm 0.32) birlikte kurun:

```bash
npm install @qorechain/wallet-adapter @cosmjs/stargate @cosmjs/proto-signing
```

Paket, TypeScript tipleriyle birlikte sade JavaScript'ten oluşan bir ES modülüdür. Bildirim dosyasında bunun için test edilmiş bir hızlı başlangıç yoktur. Aşağıdaki kod parçaları paket tiplerinden ve kaynağından gelir; 27 Ekim 2026'da cüzdan üretimi, sign-bytes çözümleyicisi, EVM penceresi durum okuması, `openEvmWindowMsg` ve kaldırılmış işlevin hatası, yayınlanmış 0.4.0 paketine ve canlı test ağı ile ana ağ REST uç noktalarına karşı çalıştırıldı ve paketin kendi 102 testi geçer. İmzalama ve QoreX kod parçaları uçtan uca çalıştırılmadı.

### Birleşik bir cüzdan üretin {#unified-wallet}

```js
import { generateQoreWallet, walletFromMnemonic } from "@qorechain/wallet-adapter";

const w = await generateQoreWallet();           // random 24-word mnemonic
// const w = await walletFromMnemonic(mnemonic); // or recover one
console.log(w.cosmos); // qor1...   (bech32)
console.log(w.evm);    // 0x...     (EIP-55)
console.log(w.svm);    // base58 form of the same 20 bytes
// w.privateKey, w.pubkey, w.pqc = { publicKey (2592 bytes), secretKey }
```

`walletFromSeed(seed32)` aynı cüzdanı 32 gizli bayttan oluşturur: tohum secp256k1 özel anahtarı olur; bu yüzden güvenli bir rastgele kaynaktan ya da yalnızca kullanıcının elinde bulunan malzeme üzerinde bir anahtar türetme işlevinden gelmelidir. Onu asla bir web sitesinin cüzdandan üretmesini isteyebileceği bir imzadan türetmeyin.

### Zinciri kullanıcının cüzdanlarına kaydedin {#register-chain}

```js
import { qoreChainInfo, addQoreEvmToWallet } from "@qorechain/wallet-adapter";

// Keplr and other Cosmos wallets. chainId defaults to the testnet, so pass it for mainnet.
await window.keplr.experimentalSuggestChain(
  qoreChainInfo({ chainId: "qorechain-vladi", rpc: "https://rpc.qore.host", rest: "https://api.qore.host" }),
);
await window.keplr.enable("qorechain-vladi");

// MetaMask and other EIP-1193 wallets (18-decimal native currency on the EVM lane).
await addQoreEvmToWallet(window.ethereum, {
  evmChainId: 9801, testnet: false, rpcUrl: "https://evm.qore.host",
});
```

`qoreChainInfo`, coin tipi 118, bech32 öneki `qor`, 6 ondalıklı `uqor` denomunu ve gas başına 0,1, 0,15 ve 0,25 uqor'luk bir gas fiyat adımını kullanır; bu, gas başına 0,1 uqor ücret tabanına uyar. `addQoreEvmToWallet` için `rpcUrl` gerekir.

### Bir Cosmos cüzdanıyla hibrit işlem imzalayın {#sign-hybrid}

```js
import { QoreChainSigner, pqcKeyFromRecoveryCode } from "@qorechain/wallet-adapter";

const signer = window.keplr.getOfflineSigner("qorechain-vladi");
const [account] = await signer.getAccounts();

// The account's ML-DSA-87 keypair, from a recovery code. Use this in a wallet or tool that
// legitimately owns the key; a web page should send its messages to QoreX instead (see below).
const pqc = await pqcKeyFromRecoveryCode(userRecoveryCode, account.address);

const adapter = new QoreChainSigner({
  wallet: window.keplr,
  chainId: "qorechain-vladi",
  address: account.address,
  pubkeySecp256k1: account.pubkey,
  accountNumber,                 // from GET /cosmos/auth/v1beta1/accounts/{address}
  pqc,
  rest: "https://api.qore.host", // lets the signer pick the sign-bytes form this network verifies
});

const txRaw = await adapter.signHybrid({ messages, fee, sequence }); // TxRaw bytes, with .signBytesVersion
// broadcast txRaw yourself (RPC broadcast_tx_sync or REST /cosmos/tx/v1beta1/txs)
```

Bilmeniz gerekenler:

- Adaptör imzalar; yayını siz yaparsınız. Anahtar kayıt mesajını oluşturmaz. Hesabın ML-DSA-87 anahtarını bir kez [QoreSign](/qoresign/quickstart) (`buildRegisterPqKeyMessage`), SDK veya CLI ile kaydedin ([Anahtarınızı kaydetme](/developer-guide/post-quantum-signing#pqc-key-registration) bölümüne bakın); klasik olarak imzalanabilen işlem bu ilk işlemdir.
- Hesabın ML-DSA-87 anahtarını tutan bir web sayfası, kaçınılması gereken bir tasarımdır. Anahtarı bir cüzdan imzasından türeten `derivePqcKeyFromWallet`, 0.3.0'da kaldırıldı ve her zaman hata fırlatır. Bir dApp mesajları QoreX'e (aşağıda) göndermeli ve imzalamayı cüzdana bırakmalıdır.
- Bir yayın `pqc` kod 21 ile reddedilirse ve `"auto"` kullandıysanız `adapter.refreshSignBytesVersion()` çağırın ve bir kez daha imzalayın; açık bir `"v1"` veya `"v2"` verdiyseniz yeniden denemeyin. Bkz. [Kod 21 sorun giderme](/developer-guide/post-quantum-signing#code-21).

### QoreX üzerinden gönderin {#qorex}

```js
import {
  hasQorexSignAndBroadcast, qorexSignAndBroadcast, isQorexRejection,
} from "@qorechain/wallet-adapter";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx.js";

if (!hasQorexSignAndBroadcast()) throw new Error("Install or update QoreX");

try {
  const { txHash, code } = await qorexSignAndBroadcast({
    chainId: "qorechain-vladi",   // must equal the wallet's active network
    messages: [{
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: MsgSend.encode(MsgSend.fromPartial({ fromAddress, toAddress, amount })).finish(),
    }],
    gasLimit: 300_000,            // optional, 100,000 to 5,000,000
  });
  if (code !== 0) throw new Error(`rejected by the chain with code ${code}`);
} catch (err) {
  if (isQorexRejection(err)) return; // the user declined; not a failure
  throw err;
}
```

`value`, protobuf baytlarıdır (bir `Uint8Array`, bir sayı dizisi veya base64) ve verildiği gibi imzalanır. Bir dApp cüzdanın ağını değiştiremez. QoreX eklentisi 0.3.5 veya uygulama 1.1.5 ya da üstünü gerektirir; bir sürüm denetimi yerine `hasQorexSignAndBroadcast()` ile test edin. Tel düzeyindeki sözleşme [QoreX Tarayıcı Eklentisi](/qorex/browser-extension#sign-and-broadcast) sayfasındadır.

### Bir EVM penceresi mesajı oluşturun {#evm-window}

```js
import { openEvmWindowMsg, fetchEvmWindow } from "@qorechain/wallet-adapter";

const status = await fetchEvmWindow({ rest: "https://api.qore.host", address: qor1 });
if (!status.live) {
  const msg = openEvmWindowMsg({
    sender: qor1,
    blocks: 300,        // 1 to 17280
    maxTxs: 3,          // 1 to 1000
    maxValue: "250000", // uqor: value plus the maximum fee of each admitted transaction
  });
  // sign it with signHybrid (or signHybridEth) and broadcast: it is an ordinary Cosmos-lane message
}
```

Sıra önemlidir: önce pencereyi açın, sonra EVM nonce'unu okuyun, sonra EVM işlemini imzalayın; çünkü bir pencere açmak hesabın sırasını, yani aynı zamanda EVM nonce'unu ilerletir. `openEvmWindowMsg` yalnızca pencerenin kapsamsız biçimini oluşturur; kapsamlı bir pencere (`native_only`, `allowed_targets`) SDK'yı gerektirir. Arka plan: [EVM yetkilendirme penceresi](/sdk/guides/evm#evm-window) ve [İlk İşleminiz](/getting-started/first-transaction#evm-window).

### Diğer giriş noktaları

| Görev | İşlevler |
|---|---|
| Bir PQC anahtarını kurtarma veya rotasyona sokma | `generatePqcRecoveryCode`, `pqcKeyFromRecoveryCode`, `isValidRecoveryCode`, `rotatePqcKeyMsgFromMnemonic`, `rotateFromLegacyWalletKey`, `rotatePqcKeyMsg` |
| eth-native anahtarla imzalama | `signClassicalEth` (klasik anahtar kaydı), `signHybridEth` |
| Sign-bytes yardımcıları | `hybridSignBytes(version, chainId, body, authInfo)`, `resolveSignBytesVersion`, `signBytesVersionFor`, `SIGN_BYTES_V2_UPGRADES` |
| Harici bir anahtarla bağlama ve harcama | `registerAuthenticatorMsg`, `registerEthAuthenticatorMsg`, `revokeAuthenticatorMsg`, `buildPhantom*` ve `buildMetaMask*` işlevleri |

## Nasıl erişilir {#how-to-access}

- **Ağlar:** ana ağ `qorechain-vladi` ve test ağı `qorechain-diana`. `chainId` ve eşleşen `rest` URL'sini verin ([uç noktalar](/developer-tools/overview#how-to-access)).
- **Cüzdanlar:** QoreSign kılavuzunun ve örneklerin kullandığı cüzdan Keplr'dir ([Keplr uyumlu cüzdanlar](/qoresign/guides/keplr-compatible-wallets)). Leap ve Cosmostation aynı `signDirect` arayüzünü sunar ve paket böyle herhangi bir cüzdan için yazılmıştır; bu sayfa için onlara karşı denetlenmedi. MetaMask, adaptörün imzalayıcısını değil EVM rayını kullanır ve her gönderim için açık bir EVM penceresi gerektirir ([Geliştirici paketleri](/developer-tools/overview#how-to-access)). Phantom bir authenticator olarak bağlanır.
- **Hesap ve anahtar:** ücret için QOR ile fonlanmış bir hesap ve ilk hibrit işlemden önce zincirde kayıtlı olan hesabın ML-DSA-87 anahtarı.
- **Ön koşullar:** ES modüllü Node.js veya tarayıcı için bir paketleyici. Eş bağımlılıklar `@cosmjs/stargate` ve `@cosmjs/proto-signing` `^0.32`. Çalışma zamanı bağımlılıkları: `@qorechain/pqc` `^0.2.1`, `cosmjs-types` `^0.9.0`, `@cosmjs/crypto` ve `@cosmjs/encoding` `^0.32`.
- **Maliyet:** paket ücretsizdir; işlemler ağ ücretini gas başına 0,1 uqor veya daha fazla olarak öder. ML-DSA-87 açık anahtarı 2.592 bayt olduğundan bir anahtar kaydı yüksek bir gas limiti kullanır.

## Nerede yayımlanır {#where-published}

| Kayıt defteri | Paket | Sürüm | Bağlantı |
|---|---|---|---|
| npm | `@qorechain/wallet-adapter` | 0.4.0 (20 Ekim 2026'da yayımlandı) | [npmjs.com](https://www.npmjs.com/package/@qorechain/wallet-adapter) |

Kaynak: [github.com/qorechain/qorechain-wallet-adapter](https://github.com/qorechain/qorechain-wallet-adapter) (herkese açık, etiket `v0.4.0`, Apache-2.0). PyPI, crates.io, Maven Central veya Go proxy'sinde yayımlanmamıştır. İlgili: [Geliştirici paketleri](/developer-tools/overview), [QoreSign](/qoresign/overview), [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing), [Borsa entegrasyonu](/developer-guide/exchange-integration).

## Sınırlar ve bilinen sorunlar {#limits}

- **İmzalar; yayınlamaz, anahtar kaydetmez ve pencere açmaz.** ML-DSA-87 anahtarını kaydeden bir işlev yoktur ve sizin için bir EVM penceresi açan hiçbir şey yoktur.
- **Sahiplik kanıtı yok.** Yalnızca bu paketi kullanan araçlarla yapılan bir anahtar kaydı kanıt taşımaz. Zincir yine de kabul eder ve bir kanıt mevcut olduğunda onu doğrular ([Sahiplik kanıtı](/developer-guide/post-quantum-signing#proof-of-possession)).
- **`derivePqcKeyFromWallet` kaldırılmıştır** (0.3.0) ve her zaman hata fırlatır. Onunla anahtar kaydeden hesaplar, anahtarlarını `rotateFromLegacyWalletKey` ile rotasyona sokmalıdır.
- **Yalnızca kapsamsız pencereler.** `openEvmWindowMsg` kapsam alanlarına sahip değildir.
- **`qoreChainInfo` varsayılan olarak test ağını kullanır.** Ana ağ için her zaman `chainId` verin.
- **Authenticator nonce'ları.** Henüz hiçbir sorgu bağlı anahtarın authenticator sırasını sunmaz; bu yüzden onu sizin izlemeniz gerekir. Değer yanlış olduğunda zincir `abstractaccount` kod 11 ile yanıt verir. Authenticator modülü test ağında etkindir ve ana ağda kapalıdır ([SDK genel bakış](/sdk/overview) sayfasına bakın).
- **cosmjs 0.32 eş bağımlılıkları.** SDK cosmjs 0.39 kullanır; ikisini tek projede kurmak `ERESOLVE` hatası verir, bu yüzden onları ayrı tutun veya `--legacy-peer-deps` verin.
- **Paketin README'sinden kopyalamayın.** README hâlâ ana ağın ilk sign-bytes biçimini doğruladığını ve bir MetaMask gönderiminin ek adım gerektirmediğini söylüyor. İkisi de güncel değil: her iki ağ da v2'yi doğrular ve bir EVM gönderimi için kayıtlı bir anahtar ve açık bir pencere gerekir.
- **Bu paket için kayıtlı test edilmiş bir hızlı başlangıç yoktur** ve QoreX yolu cüzdanın kurulu olmasını gerektirir; bu yüzden bir betikte çalıştırılamaz.
