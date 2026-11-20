---
slug: /build-before-qday/workshop-3
title: "Workshop 3: Şifreli uygulamalar ve cross-VM"
sidebar_label: "Workshop 3"
sidebar_position: 4
date: 2026-11-20
---

# Workshop 3: Şifreli uygulamalar ve cross-VM

Workshop 2, parayı post-kuantum bir anahtarla korudu. Workshop 3, aynı zincirle iki yeni şey yapar. Birincisi, **bir QoreChain adresine şifreli mesaj gönderirsiniz**; mesajı yalnızca o adresin sahibi okuyabilir ve şifreleme post-kuantumdur. İkincisi, **EVM** üzerindeki tek bir işlem **QoreChain Native** üzerindeki bir kontrata yazar ve iki taraf ya birlikte değişir ya da hiç değişmez.

Kriptograf olmanız gerekmez. Aşağıdaki her komut ne yaptığını ve ne görmeniz gerektiğini söyler. İki örnek uygulama herkese açıktır: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), `workshop-3` klasörü. İkisi de yalnızca QoreChain testnet'i `qorechain-diana` üzerinde çalışır. Test QOR'unun değeri yoktur.

**Ne kadar sürer:** QoreSeal için yaklaşık 30 dakika, cross-VM ödeme için 40. İki bölüm birbirinden bağımsızdır ve her birinin kendi test hesapları gerekir.

## Ne geliştiriyoruz {#what-we-built}

| Bölüm | Uygulama | Neyi gösterir |
| --- | --- | --- |
| 1 | **QoreSeal** (Node.js) | Bir `qor1...` adresine ML-KEM-1024 ile mesaj şifrelemek, mesajı açmak, bir yabancının açamadığını görmek, kurcalamanın yakalandığını görmek ve eski postayı kaybetmeden bir anahtarı döndürmek. |
| 2 | **CrossVmCheckout** (Solidity ve Rust) | Bir EVM kontratından yapılan tek bir çağrı, aynı işlemde bir Native kontrata makbuz yazar. Taraflardan biri başarısız olursa ikisi de geri alınır. |

Bunların ardındaki yenilikler:

- **Adrese şifreleme.** Her hesap, herkese açık bir telefon rehberi gibi zincirde post-kuantum bir şifreleme anahtarı yayımlayabilir. Birine yazmak için yalnızca adresini bilmeniz yeter.
- **Anahtarı hesaba bağlayan bir kart.** Hesap, küçük bir alıcı kartını iki imza anahtarıyla da imzalar; böylece kimse araya sahte bir şifreleme anahtarı sokamaz.
- **Hibrit şifreleme.** ML-KEM-1024 (NIST FIPS 203), klasik X25519 anahtarıyla birleştirilir. İkisinden biri sağlam kaldığı sürece mesaj gizli kalır.
- **Cross-VM atomikliği.** EVM ve QoreChain Native tek bir durumu ve tek bir bloğu paylaşır. Aralarındaki bir çağrı aynı işlemin parçasıdır; bu yüzden temizlenecek yarım kalmış bir durum yoktur.
- **Yönetişimin onayladığı erişim.** Köprü yalnızca yönetişimin onayladığı Native kontratları çağırır ve her onay kontratın koduna sabitlenir.

## Bu kılavuzda kullanılan kelimeler {#words}

| Kelime | Sade anlamı |
| --- | --- |
| ML-KEM-1024 | Post-kuantum bir anahtar değişimi (NIST FIPS 203). Burada her mesaj için ortak bir gizli anahtar belirlemekte kullanılır |
| X25519 | Klasik bir anahtar değişimi. Biri kırılsa bile zarf dayansın diye ML-KEM ile birleştirilir |
| ML-DSA-87 | Post-kuantum imza (NIST FIPS 204). Her yerel işlem hem onunla hem de klasik secp256k1 anahtarıyla imzalanır |
| Alıcı kartı | Bir hesabın şifreleme anahtarlarını hesaba bağlayan, imzalı küçük bir not |
| Zarf | Mühürlenmiş mesaj; istediğiniz yolla gönderebileceğiniz bir metin dosyası olarak kaydedilir |
| Native | QoreChain Native, kontratların Rust ile yazıldığı CosmWasm lane'i |
| Köprü precompile'ı | `0x0000000000000000000000000000000000000901` adresindeki, bir EVM kontratının bir Native kontratı çağırmasını sağlayan yerleşik kontrat |
| İzin listesi | Yönetişimin köprünün erişmesi için onayladığı Native kontratlar |
| EVM penceresi | Bir hesaptan Ethereum tarzı işlemler göndermek için kısa ve sınırlı bir izin. Açmak için iki anahtarla imzalanmış bir işlem gerekir |

:::caution Yalnızca tek kullanımlık testnet hesapları
Bu workshop için üretilmiş ve değeri olmayan test QOR'u tutan anahtarlar kullanın. Gerçek para tutan bir hesabın gizli kelimelerini veya anahtarını asla bir dosyaya ya da bir komuta koymayın.
:::

## Başlamadan önce {#prerequisites}

[Başlamadan önce](/build-before-qday/prerequisites) sayfasındaki araçlara (bir terminal, Node.js ve Git) ve faucet için bir tarayıcıya ihtiyacınız var. 1. bölüm Node.js 20 veya üstünü ister. 2. bölüm ayrıca **pnpm** ve **Foundry**, isteğe bağlı olarak da Rust ister. Node.js'i kontrol edin:

```bash
node -v
```

`v20` ya da daha yüksek bir değer yazdırmalıdır. 2. bölüm için kalanını kurun:

```bash
npm install -g pnpm
```

2. bölümün kullandığı paket aracı pnpm'i kurar. `pnpm -v` ile kontrol edin. Foundry, Solidity'yi derler, test eder ve dağıtır: [getfoundry.sh](https://getfoundry.sh) adresinden kurun, sonra `foundryup` çalıştırın. `forge --version` ve `cast --version` ile kontrol edin.

Örnek kodu alın:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-3
```

İlk satır örnekleri `build-before-qday` adlı bir klasöre indirir. İkinci satır, iki uygulamayı barındıran `workshop-3` klasörüne geçer.

Test QOR'u için kontrol panelindeki [faucet](/dashboard/faucet)'i kullanırsınız.

## 1. Bölüm: QoreSeal, bir adrese şifreleme {#part-1}

Kod: [workshop-3/01-qoreseal](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/01-qoreseal). Paketler: `@qorechain/qoreseal` ve `@qorechain/qoresign`.

Birine özel bir mesaj göndermek istiyorsunuz ve elinizde yalnızca adresi var. Bu uygulama nasıl yapılacağını gösterir:

1. Alice anahtarlarını zincire kaydeder.
2. Herkes Alice'in şifreleme anahtarını adresinden bulur.
3. Alice'e bir mesaj mühürlenir. Alice onu açar. **Eve açamaz.**
4. Zarfın tek bir bitini değiştirin ve **artık açılmaz**.
5. Hem Alice'e **hem de** Bob'a mühürlenmiş tek bir mesaj: her biri kendi anahtarıyla açar.
6. Alice anahtarını **döndürür**: eski kart reddedilir, yeni mesajlar yeni anahtarı kullanır ve eski mesajlar hâlâ açılır.

Şifreleme bilgisayarınızda gerçekleşir. Zincir mesajı asla görmez, yalnızca açık anahtarı görür.

```bash
cd 01-qoreseal
```

QoreSeal klasörüne geçer.

### 1. Adım: kurun {#seal-install}

```bash
npm install
```

`package-lock.json` içindeki paket sürümlerini birebir indirir: QoreSeal, QoreSign (hibrit imzalayıcı) ve işlemi oluşturan birkaç cosmjs yardımcısı.

```bash
node seal.mjs help
```

Tüm komutları listeler.

### 2. Adım: üç testnet hesabı oluşturun {#seal-accounts}

```bash
node seal.mjs init alice
node seal.mjs init bob
node seal.mjs init eve
```

Her komut yeni bir hesap oluşturur ve gizli kelimelerini yalnızca sizin okuyabileceğiniz `~/.config/qday-w3/<name>.json` dosyasına kaydeder. Gizli hiçbir şey yazdırılmaz. Dosyaları başka bir yerde tutmak için `QDAY_DIR` ayarlayın. Her komut hesabın `qor1...` adresini yazdırır.

### 3. Adım: Alice'e fon yükleyin {#seal-fund-alice}

Alice'in `qor1...` adresini [faucet](/dashboard/faucet)'e yapıştırın, sonra kontrol edin:

```bash
node seal.mjs whoami
```

Her hesabı gösterir: adres, bakiye ve anahtarlarının zincirde olup olmadığı. Şimdilik yanıt `no` olur.

### 4. Adım: Alice anahtarlarını kaydeder {#seal-register}

```bash
node seal.mjs register alice
```

İki işlem:

1. **ML-DSA-87 imza anahtarı**, Alice'in ona sahip olduğunu gösteren bir kanıtla. Zincir henüz post-kuantum anahtarını bilmediği için yalnızca klasik anahtarla imzalanmış olarak kabul ettiği tek işlem budur.
2. **ML-KEM-1024 şifreleme anahtarı** (1.568 bayt), iki anahtarla imzalanmış. Bundan sonra herkes onu zincirden okuyabilir.

Sonra Alice'in **alıcı kartını** imzalar ve `cards/alice.json` olarak kaydeder. Gerçek bir uygulamada kartı adresin yanında yayımlarsınız; örneğin bir profil sayfasında, bir kontratta ya da bir API'nin arkasında.

### 5. Adım: Bob ve Eve ile QOR paylaşın ve Bob'u kaydedin {#seal-bob}

```bash
node seal.mjs fund alice bob 3
node seal.mjs fund alice eve 3
```

Alice'ten Bob'a ve Eve'e 3 test QOR gönderir. Kayıttan sonraki her işlem gibi **iki** anahtarla imzalanır ve zincir ikisini de kontrol eder. Alice'in önce kaydolmasının nedeni budur: zincirde ML-DSA-87 anahtarı olmayan bir hesap yalnızca bir tane kaydedebilir ve ondan gelen başka her işlem reddedilir.

```bash
node seal.mjs register bob
```

Bob, 9. adımda gerekir; orada tek bir mesaj iki kişiye gider. Eve kayıtsız kalır: Alice'in postasını okumaya çalışacak yabancıdır.

### 6. Adım: bir gönderici gibi Alice'i sorgulayın {#seal-lookup}

```bash
node seal.mjs lookup alice
```

Herkese açık REST API'den `GET /qorechain/pqc/v1/kem/<address>` okur: algoritma (`ML-KEM-1024`), 1.568 baytlık açık anahtar ve kaydedildiği blok. Sonra kartı bu anahtara ve Alice'in zincirdeki ML-DSA-87 anahtarına karşı kontrol eder. `card valid` görmelisiniz. Bunu herhangi bir adres için yapabilirsiniz: `node seal.mjs lookup qor1...`.

### 7. Adım: Alice'e bir mesaj mühürleyin ve açın {#seal-send}

```bash
node seal.mjs send alice "Payroll for March: 12,400 QOR to the team"
```

Alice'in anahtarını zincirden okur, kartını kontrol eder ve mesajı mühürler. 41 karakterlik bir mesaj, çoğu post-kuantum anahtar malzemesi olmak üzere yaklaşık 1.760 bayt olur. Zarf `inbox/` içine kaydedilir.

```bash
node seal.mjs open alice
```

`OPENED by alice with encryption key #0` ve mesajı gösterir.

```bash
node seal.mjs open eve
```

`CANNOT OPEN: eve holds none of the keys this envelope was sealed to` gösterir. Eve'in elinde dosya var ama Alice'in anahtarı yok.

### 8. Adım: kurcalayın {#seal-tamper}

```bash
node seal.mjs tamper alice
```

Zarfın tek bir bitini çevirir ve açmayı dener. `DECRYPTION_FAILED` ile birlikte `REFUSED` görmelisiniz. Zarf doğrulanmıştır; bu yüzden her değişiklik yakalanır ve kimse mühürlenmiş bir mesajı düzenleyemez.

### 9. Adım: tek mesaj, iki alıcı {#seal-multi}

```bash
node seal.mjs send alice,bob "Board memo: Q4 budget"
node seal.mjs open bob
node seal.mjs open alice
```

Her iki adrese mühürlenmiş tek bir zarf. Her biri onu kendi anahtarıyla açar. Eve hâlâ açamaz.

### 10. Adım: Alice'in anahtarını döndürün {#seal-rotate}

```bash
node seal.mjs rotate alice
```

Alice'in **sonraki** şifreleme anahtarını (1 numaralı) aynı gizli kelimelerden türetir ve zincire kaydeder; orada eskisinin **yerini alır**. Sonra **eski** kartı zincire karşı kontrol eder ve `refused: the card names a different ML-KEM-1024 key than the registered one` görmelisiniz. Kartı kontrol eden göndericiler artık eski anahtara mühürleyemez. Yeni bir kart imzalanır.

```bash
node seal.mjs open alice inbox/$(ls inbox | head -1)
```

Dönüşten önce mühürlenmiş **ilk** zarfı açar: `OPENED by alice with encryption key #0 (an older key)`. Eski anahtar hiç saklanmadı. Gizli kelimelerden yeniden türetilir; bu yüzden anahtarı döndürmek sizi eski postadan asla kilitlemez.

```bash
node seal.mjs inspect
```

Bir zarfın içinde ne olduğunu gizli anahtar olmadan gösterir: sürüm, amaç, alıcılar ve boyutlar.

### Kod nasıl çalışır {#seal-code}

Her şey `seal.mjs` içindedir. Önemli QoreSeal çağrıları:

| Çağrı | Ne yapar |
| --- | --- |
| `deriveSealKeys({ mnemonic, index })` | `index` numaralı anahtarın şifreleme anahtarları, gizli kelimelerden türetilir |
| `buildRegisterKemKeyMessage({ sender, mlkemPublicKey })` | Anahtarı zincire koyan `MsgRegisterKEMKey` mesajı |
| `signRecipientCard({ chainId, address, keys, classicalKey, pqKey })` | Hesabın iki imza anahtarıyla imzalanmış kart |
| `verifyRecipientCard({ card, chainId, address, mlkemPublicKey, pqPublicKey })` | Kart zincirdeki anahtarlarla eşleşmezse hata fırlatır |
| `sealToAddresses({ rest, chainId, purpose, recipients, plaintext })` | Her anahtarı zincirden okur, her kartı kontrol eder, mühürler |
| `open({ chainId, purpose, envelope, keys })` | Zarfı açar ya da hata fırlatır |
| `envelopeToText` ve `envelopeFromText` | Zarf bir metin dosyası olarak ve geri |

`purpose` (burada `qday-note`) mühürlenen şeyin parçasıdır: bir uygulama için yapılmış bir zarf, başka bir uygulamadan gelmiş gibi açılamaz.

### Bir şey ters giderse (QoreSeal) {#seal-trouble}

| Gördüğünüz | Ne yapmalı |
| --- | --- |
| `does not exist on chain yet: fund ... first` | Hesapta QOR yok: faucet'i veya `fund` komutunu kullanın |
| `no ML-KEM key registered for this address` | Önce o hesap için `register` çalıştırın |
| `hybrid mode needs the recipient card` | `cards/<name>.json` dosyası eksik: `register <name>` çalıştırın, kartı yeniden yazar |
| `no envelope yet` | Önce `send` çalıştırın |
| `account has no PQC key and classical fallback is disabled` | O hesap henüz kaydolmadı: ondan `fund` yapmadan önce `register <name>` çalıştırın |
| Bir işlemde `refused: ...` | Mesajı okuyun: genellikle QOR yetersizdir ya da herkese açık testnet API'si sizi hız sınırına takmıştır. Birkaç saniye bekleyin |

`~/.config/qday-w3/` içindeki dosyalar gizli kelimeler tutar. Onları asla commit etmeyin ya da paylaşmayın ve mainnet'te asla yeniden kullanmayın. `cards/` ve `inbox/` klasörleri yereldir ve `.gitignore` içinde listelenir.

## 2. Bölüm: CrossVmCheckout, iki VM'yi kapsayan tek işlem {#part-2}

Kod: [workshop-3/02-cross-vm](https://github.com/qorechain/build-before-qday/tree/main/workshop-3/02-cross-vm). Diller: EVM tarafı için Solidity ve TypeScript, Native tarafı için Rust.

QoreChain aynı zincirde birden fazla sanal makine çalıştırır: **EVM** (Solidity, MetaMask tarzı) ve **QoreChain Native** (Rust ile CosmWasm kontratları). Tek bir durumu ve tek bir bloğu paylaşırlar. Bu uygulama küçük bir dükkândır:

- **`CrossVmCheckout`** (Solidity, EVM) siparişleri sayar.
- **`qday-receipts`** (Rust, Native) bir makbuz defteri tutar.
- `checkout("coffee for the team")` çağrısı ikisini de **aynı işlemde** yapar: sipariş sayısı EVM tarafında artar ve Native tarafında bir makbuz yazılır.

Mesele **atomikliktir**: iki taraf birlikte değişir ya da hiçbiri değişmez.

| Komut | Ne olur | Sonuç |
| --- | --- | --- |
| `checkout` | EVM'de sipariş +1, Native'de makbuz +1 | İkisi de değişir |
| `undo` | Native makbuz yazılır, **sonra** EVM tarafı geri alınır | Hiçbiri değişmez: makbuz da geri alınır |
| `native-fails` | Sipariş sayılır, **sonra** Native kontrat reddeder | Hiçbiri değişmez: sipariş de geri alınır |
| `outside` | Köprüden yönetişimin onaylamadığı bir Native kontratı çağırmasını isteyin | Zincir tarafından reddedilir |

Mainnet'te cross-VM çağrıları şimdilik duraklatılmıştır; bu yüzden bu bölüm yalnızca testnet'te çalışır.

### Köprü ve izin listesi {#bridge}

EVM, `0x0000000000000000000000000000000000000901` adresindeki köprü precompile'ı aracılığıyla Native'e ulaşır. Şunu çağırırsınız:

```solidity
executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)
```

| Argüman | Anlamı |
| --- | --- |
| `targetVM` | Native için `1` |
| `targetContract` | Native kontratın `qor1...` adresi |
| `payload` | Native kontratın JSON mesajı |

Köprü yalnızca **yönetişimin** onayladığı Native kontratlara ulaşır. Liste herkese açıktır, crossvm parametrelerindedir (`GET https://api-testnet.qore.host/qorechain/crossvm/v1/params`) ve her girdi kontratın koduna sabitlenir; bu yüzden onaylı bir kontrat sonradan farklı bir kodla değiştirilemez.

Çağıracağınız Native kontrat `qday-receipts`, testnet izin listesindedir (yönetişim önerisi 40, kod kimliği 865):

```text
qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8
```

Yöneticisi yoktur; bu yüzden kimse onu değiştiremez. **Her geliştirici onu Cross-VM parkuru için kendi kontratlarından çağırabilir.** Native tarafında çağrıyı yapan, cüzdanınız değil EVM kontratınızın kendi `qor1...` hesabıdır; böylece her makbuz hangi kontratın yazdığını gösterir.

### EVM kontratı nasıl çalışır {#xvm-how}

`evm/src/CrossVmCheckout.sol` dosyasını açın:

```solidity
function checkout(string calldata note, bool failAfter) external returns (bytes memory reply) {
    _checkNote(bytes(note));
    orders += 1;
    reply = _callNative(bytes(string.concat('{"record":{"note":"', note, '"}}')));
    if (failAfter) revert EvmSideFailed();
    emit Ordered(orders, msg.sender, note, reply);
}

function _callNative(bytes memory payload) private returns (bytes memory) {
    (bool ok, bytes memory ret) =
        BRIDGE.call(abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", NATIVE, receipts, payload));
    if (!ok) revert BridgeCallFailed(ret);
    if (ret.length == 0) revert BridgeNotActive();
    if (ret.length >= 64 && uint256(bytes32(ret)) == 32) return abi.decode(ret, (bytes));
    return ret;
}
```

1. **Notu kontrol edin.** Bir JSON dizesinin içine girer; bu yüzden `"` ve `\` içermeyen, 1 ile 140 arasında yazdırılabilir karakter olmalıdır. Aksi halde hazırlanmış bir not, Native kontratın aldığı mesajı değiştirebilir.
2. **Siparişi sayın.** Normal bir EVM durum değişikliği.
3. **Köprüyü çağırın.** Native kontrat tam orada, bu işlemin içinde çalışır.
4. **Köprü çağrısı başarısız olduysa geri alın.** Bir Native hatası EVM geri alımına dönüşür ve işlemin tamamı geri alınır.
5. **Yanıt yoksa köprü yoktur.** Precompile'ın etkin olmadığı bir zincirde, o adrese yapılan çağrı boş veriyle "başarılı" olur. Bunu asla başarı değil, hata sayın.
6. **Yanıtı çözün.** Köprü, Native yanıtını ABI kodlu `bytes` olarak döndürür. Kod ham baytları da kabul eder.
7. **`failAfter`**, Native çağrı başarılı olduktan sonra geri alır. Native tarafında yazılan makbuzun da geri alındığını gösterir.

Normal bir `call` kullanın, `staticcall` ya da view fonksiyonu değil: köprü statik çağrıları reddeder, çünkü Native taraf durum yazabilir.

Aşağıdaki tüm komutlar, aksi söylenmedikçe `evm` klasöründe çalışır:

```bash
cd ../02-cross-vm/evm
```

Hâlâ `01-qoreseal` içindeyseniz, bu sizi cross-VM uygulamasının EVM klasörüne taşır.

### 1. Adım: testleri çalıştırın (hesap gerekmez) {#xvm-tests}

```bash
pnpm install
pnpm forge-std
forge test
```

`pnpm install` JavaScript paketlerini indirir. `pnpm forge-std` Foundry'nin standart kütüphanesini bir kez `lib/` içine indirir. `forge test`, `test/CrossVmCheckout.t.sol` içindeki 5 testi çalıştırır. `5 passed; 0 failed` görmelisiniz.

Foundry'nin yerel EVM'sinde QoreChain köprüsü yoktur; bu yüzden testler `vm.etch` ile `0x...0901` adresine küçük bir sahte köprü koyar. Gönderilen tam JSON mesajını, `failAfter`'ın her şeyi geri aldığını, bir Native hatasının EVM tarafını geri aldığını, bir notun JSON enjekte edemediğini ve etkin olmayan bir köprünün hata olduğunu kontrol ederler. Gerçek köprü sonraki adımlarda çalışır.

### 2. Adım: post-kuantum anahtarı olan bir hesap {#xvm-account}

Workshop 2'yi yaptıysanız `.env` dosyanızı oradan kopyalayın (aynı hesap, anahtar zaten kayıtlı) ve `.env.example` içindeki `RECEIPTS_CONTRACT` satırını ekleyin. Yapmadıysanız:

```bash
cast wallet new
cp .env.example .env
```

`cast wallet new` tek kullanımlık bir hesap oluşturur. Özel anahtarını `.env` içine `PRIVATE_KEY` olarak koyun. **Yalnızca testnet.**

```bash
pnpm window recovery-code
```

Bir `QRC1-...` kodu yazdırır. Onu `.env` içine `QORE_PQC_RECOVERY_CODE` olarak koyun ve bir kopyasını özel anahtardan ayrı saklayın. ML-DSA-87 anahtarınız ondan türetilir.

```bash
pnpm window status
```

`qor1...` adresinizi gösterir. Onu [faucet](/dashboard/faucet)'e yapıştırın, sonra:

```bash
pnpm window register
```

ML-DSA-87 anahtarınızı hesap başına bir kez zincire koyar. `pnpm window status` artık `PQC key: registered` gösterir.

### 3. Adım: kapsamlı bir EVM penceresi açın {#xvm-window}

```bash
pnpm window:scoped
```

Değer ve ücretler dahil **1.200 blokluk (yaklaşık 28 dakika), 6 işlemlik ve 3 QOR** bir pencere açar. Bu, dağıtım ve üç demo işlemi için yeterlidir, fazlası için değil. Cüzdanınız **kendi kontratınızı** çağırır, kontrat da köprüyü kendi kimliğiyle çağırır; bu yüzden pencerenin yalnızca kontratınıza yapılan çağrıya izin vermesi yeter.

Pencere işleminin bir blokta olması için sonraki adımdan önce **yaklaşık 10 saniye bekleyin**.

### 4. Adım: dükkânı dağıtın {#xvm-deploy}

```bash
pnpm deploy:testnet
```

`RECEIPTS_CONTRACT` adresine işaret eden `CrossVmCheckout` kontratını dağıtır. `CrossVmCheckout 0x...` satırını arayın. Foundry'nin çıktısında "ETH" QOR demektir.

```bash
pnpm xvm status
```

İki tarafı da gösterir: EVM kontratınızdaki `orders` ve `qday-receipts` üzerindeki makbuz sayısı, son üç makbuzla birlikte. Diğer geliştiriciler aynı makbuz defterine yazar; bu yüzden sayısı büyük ihtimalle sıfır değildir. Önemli olan sayının nasıl **değiştiğidir**.

### 5. Adım: zincirin onaylamadığı bir kontrat {#xvm-outside}

```bash
pnpm xvm outside
```

İzin listesinde **olmayan** gerçek bir Native kontrata doğrudan bir köprü çağrısı simüle eder. `REFUSED by the bridge: ... is not allowlisted` görmelisiniz. Bu ücretsizdir ve hiçbir pencere işlemi kullanmaz.

### 6. Adım: tek işlem, iki VM {#xvm-checkout}

```bash
pnpm xvm checkout "coffee for the team"
```

`before`, işlemi (`SUCCESS`) ve `after` değerini görürsünüz: orders +1 **ve** receipts +1, ayrıca notunuzu taşıyan yeni makbuz; `from` alanında kontratınızın `qor1...` adresi. Sonra `both sides changed, in the same transaction`.

### 7. Adım: EVM tarafı Native çağrıdan sonra başarısız olur {#xvm-undo}

```bash
pnpm xvm undo "this receipt must disappear"
```

Native makbuz yazılır, sonra EVM tarafı geri alır. İşlem `REVERTED` olarak bloğa girer ve `before` ile `after` aynıdır: `nothing changed on either side`. Native tarafında yazılan makbuz da yok olur.

### 8. Adım: Native taraf reddeder {#xvm-native-fails}

```bash
pnpm xvm native-fails
```

Sipariş EVM tarafında sayılır, sonra `qday-receipts` `{"fail":{}}` ile reddeder. İşlem `REVERTED` olur ve sayılar aynıdır: EVM siparişi de geri alınır.

Her işlemin bir explorer bağlantısı vardır. Ağ seçicisi **Testnet**'teyken [Dashboard explorer](/dashboard/explorer)'da açın.

### Bir şey ters giderse (cross-VM) {#xvm-trouble}

| Gördüğünüz | Anlamı | Ne yapmalı |
| --- | --- | --- |
| Dağıtımda veya bir işlemde `Missing or invalid parameters` | Canlı bir EVM penceresi yok | `pnpm window status`, sonra `pnpm window:scoped`, 10 saniye bekleyin, yeniden deneyin |
| `No shop yet` | Bu klasörden hiçbir şey dağıtılmadı | 4. adım ya da `.env` içinde `SHOP_ADDRESS` ayarlayın |
| `not allowlisted` ile `BridgeCallFailed` | Hedef yönetişim tarafından onaylanmamış | Yukarıdaki adres olan `qday-receipts` kullanın |
| `BridgeNotActive` | Köprü precompile'ı o ağda etkin değil | Testnet'i kullanın |
| `BadNote` | Not boş, çok uzun ya da `"` veya `\` içeriyor | 140 karaktere kadar düz metin kullanın |

### Native taraf {#native-side}

`native/` klasörü `qday-receipts` kontratının (CosmWasm 2, Rust) tam kaynağını barındırır:

| Mesaj | Ne yapar |
| --- | --- |
| `{"record":{"note":"..."}}` | Bir makbuz ekler: kimlik, gönderici, not, blok yüksekliği |
| `{"fail":{}}` | Atomikliği göstermek için her zaman reddeder |
| `{"count":{}}` (sorgu) | Kaç makbuz var |
| `{"receipt":{"id":1}}` (sorgu) | Bir makbuz |
| `{"latest":{"limit":3}}` (sorgu) | En yeni makbuzlar, en yenisi ilk, en fazla 20 |

Testlerini çalıştırın (Rust gerekir):

```bash
cd ../native
cargo test
```

3 testin geçtiğini görmelisiniz. Testnet'e Native kontrat yüklemek yönetişimden geçer; bu yüzden bunu dağıtmanız gerekmez: zaten canlıdır.

Zincirdeki kodun bu kaynak olduğunu kontrol etmek için onu CosmWasm optimizer ile derleyin ve sağlama toplamlarını karşılaştırın. Zincirdeki kod, arm64 imajıyla bir Apple Silicon Mac'te derlendi; bu yüzden aynısını kullanın: x86 imajı farklı bir sağlama toplamı üretir.

```bash
docker run --rm -v "$(pwd)":/code \
  --mount type=volume,source="$(basename "$(pwd)")_cache",target=/target \
  --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry \
  cosmwasm/optimizer-arm64:0.16.1
cat artifacts/checksums.txt
```

Sağlama toplamı `6ebfc32fb9a9c8a412fdb071fb2c317b780ba05f637b8a4d274001c95fb5c43c` olmalıdır; zincirin 865 numaralı kod için gösterdiği `data_hash` ile aynıdır:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/code/865" | head -c 400
```

Makbuz defterini her yerden, hesap gerekmeden okuyun:

```bash
curl -s "https://api-testnet.qore.host/cosmwasm/wasm/v1/contract/qor1xjayq5ev55tkzpml9klxwyshr7gdrha0nurha9jhm0f0gdckksgs3gltw8/smart/$(printf '{"latest":{"limit":3}}' | base64)"
```

### Dosyalar {#files}

```text
evm/src/CrossVmCheckout.sol         the shop: counts orders, writes receipts through the bridge
evm/test/CrossVmCheckout.t.sol      Foundry tests, with a fake bridge
evm/script/CrossVmCheckout.s.sol    deploy script (reads RECEIPTS_CONTRACT and PRIVATE_KEY)
evm/scripts/window.ts               pnpm window: status, register, open, recovery-code
evm/scripts/xvm.ts                  pnpm xvm: status, checkout, undo, native-fails, outside
evm/.env.example                    the settings to copy into .env
native/src/lib.rs                   qday-receipts, the Native contract
```

## Daha fazla bilgi {#learn-more}

- Festival, Encrypted Apps ve Cross-VM parkurları ve ödüller: [build.qorechain.io](https://build.qorechain.io).
- npm üzerinde QoreSeal: [@qorechain/qoreseal](https://www.npmjs.com/package/@qorechain/qoreseal).
- [EVM precompile'ları](/developer-guide/evm-precompiles) ve [cross-VM referansı](/developer-guide/cross-vm-reference).
- EVM penceresi ve kasa için [Workshop 2](/build-before-qday/workshop-2).
