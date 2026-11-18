---
slug: /build-before-qday/workshop-2
title: "Workshop 2: Parayı post-kuantum bir anahtarla koruyun"
sidebar_label: "Workshop 2"
sidebar_position: 3
date: 2026-11-18
---

# Workshop 2: Parayı post-kuantum bir anahtarla koruyun

Workshop 1'de iki anahtarla imzalanmış tek bir işlem gönderdiniz. Workshop 2, post-kuantum anahtarı **parayı korumak** için kullanır: önce yalnızca bir post-kuantum anahtar imzaladığında ödeme yapan bir akıllı kontrat, sonra harcama limitlerini zincirin uyguladığı bir yapay zeka ajanı, ardından her işlemin nasıl korunduğunu zincire sormanın bir yolu.

Güvenlik uzmanı olmanız gerekmez. Aşağıdaki her komut ne yaptığını ve ne görmeniz gerektiğini söyler. Üç örnek uygulama herkese açıktır: [github.com/qorechain/build-before-qday](https://github.com/qorechain/build-before-qday), `workshop-2` klasörü.

**Ne kadar sürer:** kasa için yaklaşık 40 dakika, ajan için 25, zincire sorular için 10. Bölümleri istediğiniz sırayla yapabilirsiniz, ancak her bölümün kendi test hesabı gerekir.

## Ne geliştiriyoruz {#what-we-built}

| Bölüm | Uygulama | Neyi gösterir |
| --- | --- | --- |
| 1 | **QDayVault** (Solidity ve TypeScript) | Yalnızca bir ML-DSA-87 imzasıyla ödeme yapan, imzası zincirde `pqcVerify` precompile'ı tarafından kontrol edilen bir kasa. Çalınmış bir Ethereum tarzı anahtar parayı almaya yetmez. |
| 2 | **Fatura ödeyen ajan** (Node.js) | Kendi anahtarı olan bir ajan. Limitlerini zincir uygular: yalnızca gönderme, ödeme başına 1 QOR, günde 3 QOR, 24 saat. |
| 3 | **Zincire sorun** (MCP ve `qore-cli`) | Salt okunur sorular: bu işlem post-kuantum imzalandı mı ve bu hesabın anahtarının durumu nedir? |

Bunların arkasındaki yenilikler:

- **Kontrat içinde post-kuantum doğrulama.** Zincirin sabit adreslerde, ML-DSA-87 imzalarını kontrol eden ve bir hesabın kayıtlı anahtarını bildiren yerleşik kontratları (precompile'lar) vardır. Solidity kodunuz bunları diğer kontratlar gibi çağırır.
- **Zincirde yaşayan limitler.** Bir ajanın izinleri ve harcama kuralları hesabın parçasıdır; bu yüzden bir hata ya da çalınmış bir sunucu onları kaldıramaz.
- **Dürüst etiketler.** Zincir, hangi işlemlerin post-kuantum imza taşıdığını ve hangilerinin taşımadığını söyleyebilir.

## Bu kılavuzda kullanılan kelimeler {#words}

| Kelime | Sade anlamı |
| --- | --- |
| Precompile | Zincirin yerel olarak çalıştırdığı, sabit bir adresteki yerleşik kontrat. `pqcVerify` `0x0000000000000000000000000000000000000a01` adresinde, `pqcKeyStatus` ise `0x0000000000000000000000000000000000000a02` adresindedir. Adresleri küçük harfle yazın: Solidity derleyicisi karışık harfli yazımı reddeder |
| ML-DSA-87 | QoreChain'in kullandığı post-kuantum imza şeması (NIST FIPS 204) |
| EVM penceresi | Bir hesaptan Ethereum tarzı işlemler göndermek için kısa ve sınırlı bir izin. Açmak için iki anahtarla imzalanmış bir işlem gerekir; bu yüzden tek başına bir Ethereum anahtarı hiçbir zaman pencere açamaz |
| Guardian | Kasadan yapılan her çekimi post-kuantum anahtarının imzalaması gereken hesap |
| Authenticator | Hesabınıza, zincirin uyguladığı kurallarla bağlanan bir anahtar; 2. bölümdeki ajan bunu kullanır |
| Tek kullanımlık hesap | Bu alıştırma için üretilmiş ve yalnızca test QOR'u tutan bir anahtar |

:::caution Yalnızca tek kullanımlık testnet hesapları
Bu workshop için üretilmiş ve değeri olmayan test QOR'u tutan anahtarlar kullanın. Gerçek para tutan bir hesabın anahtarını veya kurtarma kodunu asla bir `.env` dosyasına ya da bir komuta koymayın.
:::

## Başlamadan önce {#prerequisites}

[Başlamadan önce](/build-before-qday/prerequisites) sayfasındaki araçlara (bir terminal, Node.js 22 veya üstü ve Git) ve bir web tarayıcısına ihtiyacınız var. Node.js'i kontrol edin:

```bash
node -v
```

`v22` ya da daha yüksek bir değer yazdırmalıdır. 1. bölüm ayrıca **pnpm** ve **Foundry** ister:

```bash
npm install -g pnpm
```

Kasanın kullandığı paket aracı pnpm'i kurar. `pnpm -v` ile kontrol edin.

Foundry, Solidity'yi derler, test eder ve dağıtır. [getfoundry.sh](https://getfoundry.sh) adresinden kurun: sayfa sisteminiz için tek bir komut verir, sonra şunu çalıştırırsınız:

```bash
foundryup
```

Foundry araçlarını indirir. `forge --version` ve `cast --version` ile kontrol edin.

Örnek kodu alın:

```bash
git clone https://github.com/qorechain/build-before-qday.git
cd build-before-qday/workshop-2
```

İlk satır örnekleri `build-before-qday` adlı bir klasöre indirir. İkinci satır, üç uygulamayı barındıran `workshop-2` klasörüne geçer.

Test QOR'u için kontrol panelindeki [faucet](/dashboard/faucet)'i kullanırsınız. Üç uygulamanın hepsi yalnızca QoreChain testnet'i `qorechain-diana` üzerinde çalışır.

## 1. Bölüm: QDayVault, sızan bir anahtardan sağ çıkan kasa {#part-1}

Kod: [workshop-2/01-qday-vault](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/01-qday-vault). Normal bir cüzdan anahtarı (MetaMask'in kullandığı secp256k1 anahtarı) bir gün kuantum bilgisayar tarafından kırılabilir. Bu kasa, bu türden çalınmış bir anahtarın yetmeyeceği şekilde tasarlanmıştır: para yalnızca **guardian** çekimi post-kuantum bir anahtarla imzaladığında çıkar ve kontrat bu imzayı kendisi, zincirde kontrol eder. İmzalı çekimi herkes gönderebilir. Önemli olan imzadır, göndereni kim olduğu değil.

```bash
cd 01-qday-vault
```

Kasa klasörüne geçer.

### Kontrat nasıl çalışır {#vault-how}

`src/QDayVault.sol` dosyasını açın. Önemli fonksiyon `withdraw`'dır:

```solidity
(bool registered,, bytes memory pubkey, bool proven) = PQC_KEYS.pqcKeyStatus(guardian);
if (!registered || pubkey.length == 0) revert GuardianKeyNotRegistered();
if (!proven) revert GuardianKeyNotProven();

uint256 n = nonce;
if (!PQC_VERIFY.pqcVerify(pubkey, mldsaSignature, withdrawalMessage(to, amount, n))) revert BadPqcSignature();

nonce = n + 1;
emit Withdrawn(to, amount, n);
(bool ok,) = to.call{value: amount}("");
if (!ok) revert TransferFailed();
```

1. **Guardian'ın anahtarını zincirden okur.** Anahtar 2.592 bayttır, bu yüzden kontrat onu saklamaz. Guardian anahtarı zincirde değiştirirse kasa onu izler.
2. **Hiç kanıtlanmamış bir anahtarı reddeder.** "Kanıtlanmış", hesabın anahtarı kaydederken bir sahiplik kanıtı imzaladığı anlamına gelir. Bu kontrol olmasa biri sahibi olmadığı bir anahtarı kaydedebilirdi.
3. **İmzayı kesin bir mesaj üzerinde doğrular.** Mesaj; sabit bir etiketi, zincir kimliğini, kasa adresini, alıcıyı, miktarı ve nonce'u bağlar. Böylece bir imza tek bir çekim için, tek bir kasada, tek bir zincirde ve yalnızca bir kez geçerlidir.
4. **Para göndermeden önce nonce'u artırır.** Aynı imza iki kez kullanılamaz ve durum dış çağrıdan önce değişir; bu da reentrancy'ye karşı korur.
5. **Transferin başarılı olduğunu kontrol eder.** Başarısız olduysa işlemin tamamı geri alınır.

### 1. Adım: testleri çalıştırın (hesap gerekmez) {#vault-tests}

```bash
pnpm install
```

`package.json` içindeki JavaScript paketlerini indirir (QoreChain SDK, viem, tsx).

```bash
pnpm forge-std
```

Foundry'nin standart kütüphanesi `forge-std`'yi `lib/` klasörüne indirir. Testler ve dağıtım betiği onu içe aktarır. Bunu bir kez yaparsınız.

```bash
forge test
```

Kontratı derler ve `test/QDayVault.t.sol` içindeki 8 testi çalıştırır. `8 passed; 0 failed` görmelisiniz. Yerel test zincirinde QoreChain precompile'ları yoktur; bu yüzden testler iki precompile adresine `vm.etch` ile küçük vekil kontratlar koyar. Mantığı kontrol ederler: iyi bir imza ödeme yapar, kötü bir imza reddedilir, bir imza yalnızca bir kez işe yarar, kanıtlanmamış bir anahtar reddedilir. Gerçek precompile'lar sonraki adımlarda çalışır.

### 2. Adım: yalnızca testnet için bir hesap oluşturun {#vault-account}

```bash
cast wallet new
```

Yeni bir adres ve özel anahtar yazdırır. Yalnızca testnet için kullanın.

macOS ve Linux'ta:

```bash
cp .env.example .env
```

Windows PowerShell'de `Copy-Item .env.example .env` kullanın. Bu, kendi ayar dosyanızı oluşturur. `.env` Git tarafından yok sayılır, bu yüzden asla commit edilmez. `.env` dosyasını açın ve `PRIVATE_KEY` değerini `cast wallet new` çıktısındaki özel anahtara ayarlayın.

```bash
pnpm window recovery-code
```

`QRC1-` ile başlayan bir kurtarma kodu yazdırır. Post-kuantum anahtarınız ondan üretilir. Onu `.env` dosyasına `QORE_PQC_RECOVERY_CODE` olarak koyun ve bir kopyasını özel anahtardan ayrı, güvenli bir yerde saklayın. Her zaman aynı kodu kullanın: farklı bir kod, farklı bir post-kuantum anahtar demektir.

### 3. Adım: hesaba fon yükleyin {#vault-fund}

```bash
pnpm window status
```

Hesabınızı iki biçimde yazdırır: `0x...` ve `qor1...`. Bunlar aynı hesaptır. `qor1...` adresini [faucet](/dashboard/faucet)'e yapıştırın.

### 4. Adım: post-kuantum anahtarınızı bir kez kaydedin {#vault-register}

```bash
pnpm window register
```

ML-DSA-87 açık anahtarınızı, ona sahip olduğunuzu gösteren bir kanıtla birlikte zincire koyar. Bunu hesap başına bir kez yaparsınız. Ardından `pnpm window status` `PQC key: registered` gösterir. Zincir post-kuantum anahtarınızı henüz bilmediği için, yalnızca klasik anahtarla kabul ettiği tek işlem budur. Kaydın gerçekte neyi bağladığı için [Post-kuantum anahtarınız hesabınıza nasıl bağlanır](/build-before-qday/key-binding) sayfasına bakın.

### 5. Adım: kapsamlı bir EVM penceresi açın {#vault-window}

```bash
pnpm window:scoped
```

İki anahtarla imzalanmış bir işlem gönderir; bu işlem **600 blokluk (yaklaşık 15 dakika), 3 işlemlik ve 2 QOR** değerinde (ücretler dahil) bir EVM penceresi açar. Bu, dağıtım ve bir çekim için yeterlidir, fazlası için değil. Pencere açıkken klasik anahtarınız sızarsa zarar bu bütçeyle sınırlı kalır; pencere bitince Ethereum tarzı şerit yeniden kapanır.

Sonraki adımdan önce **yaklaşık 10 saniye bekleyin**. Pencereyi açmak hesabınızın bir nonce'unu kullandı ve sonraki blok önce onu içermelidir.

### 6. Adım: kasayı dağıtın {#vault-deploy}

```bash
pnpm deploy:testnet
```

`script/QDayVault.s.sol` Foundry betiğini çalıştırır: kasayı 1 QOR'luk bir mevduatla dağıtır ve **sizi** guardian yapar. Çıktıda `QDayVault 0x...` satırını arayın. Foundry'nin çıktısında "ETH", QOR anlamına gelir.

```bash
pnpm vault status
```

Kasa adresini, bakiyesini (1 QOR), guardian'ı (siz) ve nonce'u (0) gösterir.

### 7. Adım: saldırı, bir simülasyon olarak {#vault-attack}

```bash
pnpm vault attack 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Klasik anahtarınıza sahip ama post-kuantum anahtarınıza sahip olmayan bir saldırganı canlandırır. Çekimi rastgele bir ML-DSA-87 anahtarıyla imzalar ve zincire ne olacağını sorar. `BLOCKED by the vault: BadPqcSignature` görmelisiniz. Yalnızca bir simülasyondur; bu yüzden maliyeti yoktur ve pencerenizi kullanmaz. Alıcı olarak herhangi bir adres işe yarar.

### 8. Adım: gerçek çekim {#vault-withdraw}

```bash
pnpm vault withdraw 0x1b6dF9880065e7758c6e82741c50cEaD80664937 0.5
```

Çekimi **sizin** ML-DSA-87 anahtarınızla imzalar (157 baytlık bir mesaj, 4.627 baytlık bir imza) ve gönderir. Kasa onu `pqcVerify` ile kontrol eder ve ödeme yapar. `WITHDRAWN tx 0x...` ve bir explorer bağlantısı görmelisiniz.

```bash
pnpm window status
```

Pencereden geriye ne kaldığını gösterir: 1 işlem, tam olarak ona verdiğiniz bütçe.

### Bir şey ters giderse {#vault-troubleshooting}

| Gördüğünüz | Anlamı | Ne yapmalı |
| --- | --- | --- |
| Dağıtımda veya çekimde `REFUSED: Missing or invalid parameters` | Canlı bir EVM penceresi yok: süresi doldu ya da tükendi | `pnpm window status`, sonra `pnpm window:scoped` çalıştırın, 10 saniye bekleyin, yeniden deneyin |
| `does not exist on chain yet` | Hesapta henüz QOR yok | Faucet'i kullanın (3. adım) |
| `PQC key: not registered` | 4. adım atlandı | `pnpm window register` çalıştırın |
| `GuardianKeyNotRegistered` | Guardian'ın zincirde ML-DSA-87 anahtarı yok | Anahtarı kaydedin (4. adım) |
| `No vault yet` | Bu klasörden hiçbir şey dağıtılmadı | 6. adımı yapın ya da `.env` içinde `VAULT_ADDRESS` ayarlayın |

### Dağıtmadan önce kontratı denetleyin {#vault-audit}

`audit/` klasörü, kontratın gerçek hatalar içeren ilk taslağını ve düzeltilmiş sürümünü barındırır. Kontrol panelindeki [Contract Auditor](/dashboard/contract-auditor) ile iki aşamalı bir akışı gösterir: taslağı denetleyin, her bulguyu bir testle düzeltin, son kontratı denetleyin ve iki raporu da saklayın. Otomatik bir denetim, mainnet öncesi bir insan denetiminin yerini tutmaz. Solidity için kuantum hazırlık derecesi "Not scored" gösterir ve bu beklenen bir durumdur: EVM'de post-kuantum kontrolü zincir, precompile aracılığıyla yapar. Klasördeki `audit/README.md` dosyasına ve precompile adresleri ile gaz için [EVM Precompiles](/developer-guide/evm-precompiles) sayfasına bakın.

## 2. Bölüm: limitlerini zincirin uyguladığı, fatura ödeyen bir ajan {#part-2}

Kod: [workshop-2/02-pq-agent](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/02-pq-agent). Bir bota özel anahtarınızı verirseniz, harcama limitleri botun kendi kodunda yaşar. Bir hata, bir prompt injection ya da çalınmış bir sunucu yeter, limitler gider. QoreChain'de limitler **zincirde** yaşar: ajan kendi anahtarını alır; bu anahtar hesabınıza, zincirin her ödemede kontrol ettiği kurallarla bağlanır.

Bir klasör geri gidin ve ajana girin:

```bash
cd ../02-pq-agent
```

### Üç anahtar, üç rol {#agent-keys}

| Anahtar | Kimde | Ne yapabilir |
| --- | --- | --- |
| **Owner** | Siz | İki anahtarla imzalanan hesabınız. Parayı tutar, ajanı bağlar ve kuralları yazar |
| **Ajan anahtarı** | Ajan | Bir ed25519 anahtarı. Yalnızca kuralların içinde kalarak owner'ın hesabından harcama isteyebilir. Para tutmaz |
| **Gaz cüzdanı** | Ajan | Ajanın isteklerini gönderen ve ücretleri ödeyen küçük, ayrı bir hesap. Owner'ın parasını asla tutmaz |

Bu örnekteki kurallar: ajan yalnızca **QOR gönderebilir**, **ödeme başına en fazla 1 QOR** ve **günde 3 QOR**, ve bağlantı **24 saat sonra sona erer**. `agent.mjs` dosyasını açıp `pay` komutuna bakın: içinde hiçbir limit kontrolü yok. Ajan sadece ödemeyi dener. Göreceğiniz her limit zincirden gelir.

### 1. Adım: kurun ve anahtarları oluşturun {#agent-keys-create}

```bash
npm install
```

`package.json` içindeki paketleri indirir: QoreChain SDK, CosmJS ve ed25519 anahtarı için `@noble/curves`.

```bash
node agent.mjs init
```

Ajanın ed25519 anahtarını ve gaz cüzdanını oluşturur ve yalnızca sizin okuyabileceğiniz `~/.config/qday/agent.env` dosyasına kaydeder. Gaz cüzdanının `qor1...` adresini yazdırır.

```bash
node agent.mjs owner-init
```

Testnet için tek kullanımlık bir owner hesabı oluşturur ve `~/.config/qday/owner.env` dosyasına kaydeder. Zaten sahip olduğunuz bir hesabı kullanmak için o dosyaya bunun yerine `QORE_MNEMONIC="..."` koyun. Anahtarlar bilgisayarınızdan asla çıkmaz, asla yazdırılmaz ve asla bir depoya konmamalıdır.

```bash
node agent.mjs whoami
```

Üç adresi yazdırır: owner, ajan anahtarı ve gaz cüzdanı.

### 2. Adım: owner'a ve gaz cüzdanına fon yükleyin {#agent-fund}

Her `qor1...` adresini [faucet](/dashboard/faucet)'e yapıştırın. Owner'ın faturalar için birkaç QOR'a, gaz cüzdanının ücretler için yaklaşık 3 QOR'a ihtiyacı vardır.

```bash
node agent.mjs balance
```

İkisinde de QOR olduğunu kontrol eder.

### 3. Adım: post-kuantum anahtarları bir kez kaydedin {#agent-register}

```bash
node agent.mjs register owner
node agent.mjs register gas
```

Her hesap, ML-DSA-87 açık anahtarını bir sahiplik kanıtıyla zincire koyar. Bundan sonra ikisi de her işlemi iki anahtarla imzalar.

### 4. Adım: ajanı limitlerle bağlayın {#agent-link}

```bash
node agent.mjs link 1 3
```

Owner, iki anahtarla imzalanmış **tek** bir işlem gönderir: bu işlem ajanın ed25519 anahtarını owner'ın hesabına bağlar (ajan anahtarı, kabul ettiğini gösteren bir kanıt imzalar; böylece kimse sahibi olmadığı bir anahtarı bağlayamaz), ona tek bir izin (`send`) verir, bir harcama kuralı yazar (ödeme başına 1 QOR, günde 3 QOR, yalnızca `uqor`) ve 24 saatlik bir son kullanma süresi koyar. Başka bir saat sayısı için üçüncü bir sayı ekleyin, en fazla 30 gün. `agent linked` ve `hybrid ML-DSA-87: verified` görmelisiniz.

```bash
node agent.mjs rules
```

Zincirin neyi uyguladığını geri okur: kural, izin, son kullanma süresi ve ajanın kaç ödeme yaptığı. Bağlamanın nasıl çalıştığı için [Authenticators](/sdk/guides/authenticators) sayfasına bakın.

### 5. Adım: ajan faturaları ödesin {#agent-run}

```bash
node agent.mjs run bills.json
```

Ajan, `bills.json` içindeki beş faturayı, toplam 8,2 QOR'u ödemeyi dener. Her biri için isteği ed25519 anahtarıyla imzalar ve gaz cüzdanı gönderir. Şunu görmelisiniz:

| Fatura | Miktar | Sonuç | Neden |
| --- | --- | --- | --- |
| Sunucu barındırma | 0,8 | PAID | |
| Alan adı yenileme | 0,5 | PAID | |
| Bilinmeyen bir göndericiden fatura | 5 | REFUSED BY THE CHAIN | Ödeme başına 1 QOR limitini aşıyor |
| API kredisi | 1 | PAID | |
| İzleme | 0,9 | REFUSED BY THE CHAIN | Günlük 3 QOR limitini aşıyor: 2,3 harcandı, 0,7 kaldı |

Reddetmeler ajanın kodundan değil, zincirden gelir. Explorer'da bir ayrıntı: reddedilen bir ödeme yine de 0 kodlu bir işlem olarak görünür. İşlemin kendisi bir bloğa kabul edildi, ama içindeki ödeme reddedildi. `agent.mjs`, ödemenin içindeki sonucu okur ve yazdırdığı da budur.

### 6. Adım: ajanı iptal edin {#agent-revoke}

```bash
node agent.mjs revoke
```

Owner'dan gelen tek bir işlem ajan anahtarını kapatır.

```bash
node agent.mjs pay qor1s90l5nnwfjznf4cdj3p4pf2p7uk32axf8800yu 0.1 "after revoke"
```

Bir ödeme daha dener. `REFUSED BY THE CHAIN: linked key is unbound or revoked` görmelisiniz. Yani bir ajan ele geçirilirse kaybedebileceğiniz en çok günlük limitidir ve tek bir işlem onu durdurur.

Demoyu yeniden çalıştırmak için `~/.config/qday/agent.env` dosyasını başka bir yere taşıyın (önce gaz cüzdanındaki QOR'u çıkardıktan sonra) ve `node agent.mjs init` komutunu yeniden çalıştırın.

Tüm komutlar: `init`, `owner-init`, `whoami`, `register owner|gas`, `link <perTxQOR> <dailyQOR> [hours]`, `rules`, `pay <to> <QOR> [memo]`, `run <bills.json>`, `revoke`, `balance`. `QORE_REST`, `QORE_RPC` (kendi düğümünüz) ve `QDAY_DIR` (anahtar dosyalarının bulunduğu yer) değerlerini ortam değişkenleriyle değiştirebilirsiniz.

## 3. Bölüm: MCP ve qore-cli ile zincire sorun {#part-3}

Kod: [workshop-2/03-mcp](https://github.com/qorechain/build-before-qday/tree/main/workshop-2/03-mcp). MCP (Model Context Protocol), kodlama asistanlarının ve diğer yapay zeka araçlarının dış araçları kullanması için standart bir yoldur. QoreChain MCP sunucusu `@qorechain/mcp`, onlara zincire **salt okunur erişim** verir: bloklar, işlemler, hesaplar, bir hesabın post-kuantum anahtarının durumu, ücret tahminleri ve simülasyonlar. 14 aracı vardır. **Asla imzalamaz, asla anahtar tutmaz ve asla yayınlamaz**: bir transfer isterseniz size imzasız bir belge verir ve onu kendi cüzdanınızda imzalarsınız.

### MCP istemcinize ekleyin {#mcp-config}

Her MCP istemcisi çalışır. Çoğu şuna benzer bir yapılandırma kullanır:

```json
{
  "mcpServers": {
    "qorechain": {
      "command": "npx",
      "args": ["-y", "@qorechain/mcp"]
    }
  }
}
```

`npx -y` sunucuyu ilk seferde indirir ve başlatır. İstemci sonra araçlarını listeler; örneğin `get_pq_status`, `get_transaction`, `get_address_info`, `read_contract`, `estimate_fee`, `simulate_tx` ve `prepare_transfer`.

### Aynı sorular terminalden {#mcp-cli}

`qore-cli`, bir yapay zeka istemcisi olmadan aynı yanıtları verir. Geliştirdiklerinizle ilgili üç soru sorun:

```bash
npx -y @qorechain/qore-cli pq status <hash of an agent payment>
```

Ajanın ödemesi post-kuantum imzalandı mı? Beklenen: `tier: pqc`, `verified: true`. Bu yerel bir işlemdir; iki anahtarla imzalanmıştır ve zincir tarafından kontrol edilmiştir.

```bash
npx -y @qorechain/qore-cli pq status <hash of the vault withdrawal>
```

Ya kasa çekimi? Beklenen: `tier: classical`, `reason: evm_lane`. Bu dürüst bir yanıttır: Ethereum tarzı işlemler post-kuantum imza taşımaz. Onları EVM penceresi ve burada, kendisi bir ML-DSA-87 imzasını kontrol eden kasa kontratı korur.

```bash
npx -y @qorechain/qore-cli pq status <your 0x or qor1 address>
```

Ya hesap? Beklenen: `registered: true`, `possession_proven: true` ve EVM penceresi ile ondan geriye kalanlar.

### Görsel bir istemci (isteğe bağlı) {#mcp-inspector}

Bir yapay zeka asistanı olmadan araçlara tıklayarak göz atmak için:

```bash
npx -y @modelcontextprotocol/inspector npx -y @qorechain/mcp
```

Sonra **Connect**, **Tools**, **List Tools** seçeneklerini seçin, `get_pq_status` aracını seçin, `target` alanına bir adres ya da hash koyun ve **Run Tool** seçeneğini seçin.

## Şimdi elinizde ne var {#done}

Yalnızca post-kuantum bir imzaya karşı ödeme yapan bir kontrat, limitlerini zincirin uyguladığı bir ajan ve herhangi bir işlemin nasıl korunduğunu kontrol edecek araçlar. Bunlardan herhangi birini gönderiminiz için temel olarak kullanın: seviyeler ve kurallar için [Build Before Q-Day](/build-before-qday/overview) sayfasına bakın.
