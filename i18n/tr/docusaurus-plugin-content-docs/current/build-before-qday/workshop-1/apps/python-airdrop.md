---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python Uygulaması, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python Uygulaması: Q-Day Airdrop

**Q-Day Airdrop**, testnet QOR'u bütün bir adres listesine **tek** bir işlemle gönderen küçük bir Python aracıdır. İşlem, klasik bir secp256k1 anahtarı ve kuantum sonrası bir ML-DSA-87 anahtarıyla (FIPS 204) imzalanır. Araç ardından, zincirin kendi kaydından, her iki imzanın da doğrulandığını kanıtlar. QoreChain testnet'inde (`qorechain-diana`, EVM zincir kimliği 9800) çalışır.

**Ne kadar sürer:** ilk seferde yaklaşık 20 dakika (10 dakika araç kurulumu, 5 dakika hazırlık, 5 dakika gönderme ve kontrol).

Python bilmeniz gerekmez. Aşağıdaki komutları tek tek yazar ve sonucu "Ne görmelisiniz" ile karşılaştırırsınız.

## Ne gösterir {#what-it-shows}

- Python'dan **hibrit ML-DSA-87 + secp256k1 imzalama**.
- Tek bir çoklu gönderim mesajıyla birçok alıcıya aynı anda ödeme yapan, **zincirde doğrulanan tek bir hibrit imzalı işlem**.
- Aracın sözüne değil, zincirin kendi işlem kaydına dayanan **bir doğrulama raporu**.

Neden önemli: tek bir imza bütün bir airdrop'u korur ve ML-DSA-87 yarısı kuantum sonrası olduğu için gelecekteki bir kuantum bilgisayara karşı da korunmuş kalır. [Kuantum Güvenli İşlemler](/sdk/guides/quantum-safe) sayfasına bakın.

:::warning Yalnızca testnet
Yalnızca tek kullanımlık bir testnet hesabı kullanın. Testnet QOR'unun değeri yoktur. Bu kılavuzda asla gerçek cüzdanınızı, gerçek kurtarma ifadenizi veya gerçek paranızı kullanmayın.
:::

## Göreceğiniz kelimeler {#words}

| Kelime | Anlamı |
| --- | --- |
| Testnet | QoreChain'in bir alıştırma kopyası. Üzerindeki coinler ücretsizdir ve hiçbir değeri yoktur. |
| QOR ve uqor | Aynı coinin iki adı. 1 QOR = 1.000.000 uqor. Araç sizden QOR ister. Ücretler uqor cinsinden gösterilir. |
| Memo | Bir işleme eklenen kısa bir metin, banka havalesindeki bir not gibi. |
| Adres | Herkese açık hesap numaranız. QoreChain'de `qor1` ile başlar. Paylaşmak güvenlidir. |
| Anahtar dosyası | Gizli kurtarma ifadenizi içeren bir dosya. Asla paylaşmayın. |
| Faucet | Ücretsiz testnet QOR veren bir web sitesi. |
| Hash | Bir işlemin benzersiz kimliği. İşlemi aramak için kullanırsınız. |

## Başlamadan önce {#before}

**Git** (kodu indirir) ve `venv` içeren **Python 3.10 veya daha yenisi** gerekir (`venv`, aracın kütüphaneleri için özel bir klasördür). Her kurulumdan sonra **terminali kapatıp yenisini açın**, ardından kontrol komutunu çalıştırın.

| Araç | macOS | Windows | Linux (Debian veya Ubuntu) | Kontrol |
| --- | --- | --- | --- | --- |
| Git | `brew install git` (Homebrew için https://brew.sh) | https://git-scm.com/download/win | `sudo apt install git` | `git --version` |
| Python 3.10+ | `brew install python` | https://www.python.org/downloads/ (yükleyicide "Add python.exe to PATH" seçeneğini işaretleyin) | `sudo apt install python3 python3-venv python3-pip` | `python3 --version` (Windows'ta: `python --version`) |

Windows'ta PowerShell veya Git Bash kullanın. Bu sayfada `python3` yazan yerde Windows genellikle `python` kullanır. Sanal ortamı açan satır (3. adım) dışında her şey aynıdır.

## Bir testnet cüzdanı ve ücretsiz QOR alın {#wallet}

Araç kendi tek kullanımlık anahtarını oluşturur (aşağıdaki 4. adım), bu yüzden bu kılavuz için bir cüzdan uygulamasına ihtiyacınız yok. Hesabınızı QoreX'te de görmek isterseniz:

1. **QoreX uygulaması:** Ayarlar'ı açın, ardından **Use testnet (developers)** seçeneğini açın.
2. **QoreX tarayıcı uzantısı:** kilidini açın, alttaki sürüm numarasına 7 kez dokunun, ardından **Switch to testnet (diana)** seçeneğini seçin.

Ücretsiz QOR, https://dashboard.qorechain.io/faucet adresindeki faucet'ten gelir. Oturum açarsınız, adresi yapıştırırsınız ve talep edersiniz. **Hesap başına 24 saatte 100 QOR** verir.

Yeni bir hesabın ilk işlemi, kuantum sonrası ML-DSA-87 anahtarını zincire kaydeder. Bu, yaklaşık 0,09 QOR ücretli tek seferlik bir adımdır. Araç bunu `register` komutuyla sizin için yapar.

## Adım adım {#run}

### 1. Kodu indirin {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

**Ne yapar**

- `git clone <address>`: projeyi GitHub'dan `build-before-qday` adlı yeni bir klasöre kopyalar.
- `cd <folder>`: terminalinizi Python uygulamasının klasörüne taşır. Sonraki her komut bu klasörden çalışmalıdır.

**Ne görmelisiniz:** `Cloning into 'build-before-qday'...` gibi satırlar ve ardından komut satırınız yeni klasörde.

### 2. Özel bir Python ortamı oluşturun {#venv}

```bash
python3 -m venv .venv
```

**Ne yapar:** bu aracın kütüphanelerini tutan `.venv` adlı bir klasör oluşturur; böylece kütüphaneler bilgisayarınızdaki başka hiçbir şeyle karışmaz.

| Parça | Anlamı |
| --- | --- |
| `python3` | Python programı. |
| `-m venv` | Python'un yerleşik "sanal ortam" oluşturucusunu çalıştır. |
| `.venv` | Oluşturulacak klasörün adı. |

**Ne görmelisiniz:** hiçbir şey yazdırılmaz ve yeni bir `.venv` klasörü oluşur.

### 3. Ortamı açın ve kütüphaneleri kurun {#deps}

```bash
source .venv/bin/activate
```

Windows PowerShell'de bunun yerine `.venv\Scripts\activate` kullanın (PowerShell engellerse `Set-ExecutionPolicy -Scope Process RemoteSigned` çalıştırın ve yeniden deneyin). Windows Komut İstemi'nde `.venv\Scripts\activate.bat` kullanın.

**Ne yapar:** terminalinizi özel ortamı kullanacak şekilde değiştirir.

**Ne görmelisiniz:** komut satırınızın başında `(.venv)`. Her yeni terminalde aynı komutla yeniden açın.

```bash
pip install -r requirements.txt
```

| Parça | Anlamı |
| --- | --- |
| `pip` | Python'un kütüphane yükleyicisi. |
| `install` | Kütüphaneleri indir ve kur. |
| `-r requirements.txt` | Kütüphane listesini bu dosyadan oku. Dosya bir kütüphane adlandırır, `qorechain-sdk==0.13.0` (QoreChain SDK'sı, tam sürüm 0.13.0), ve onun ihtiyaç duyduklarını. |

**Ne görmelisiniz:** `Successfully installed ... qorechain-sdk-0.13.0` ile biten indirme satırları. Yeni bir pip sürümü olduğuna dair bildirim zararsızdır.

**Ne kadar sürer:** yaklaşık 15 saniye ila 1 dakika.

Şimdi aracın başladığını kontrol edin:

```bash
python airdrop.py --help
```

**Ne görmelisiniz:** `new`, `status`, `register`, `drop` ve `verify` komutları.

### 4. Tek kullanımlık testnet hesabınızı oluşturun {#key}

```bash
python airdrop.py new
```

**Ne yapar:** yeni bir hesap oluşturur. Gizli bir kurtarma ifadesini `~/.config/qday/python.env` anahtar dosyasına yazar (ev klasörünüzde, yalnızca sizin okuyabileceğiniz şekilde) ve yalnızca herkese açık adresi yazdırır.

| Parça | Anlamı |
| --- | --- |
| `new` | Yeni bir anahtar dosyası oluştur ve adresini yazdır. |
| `new --force` | Var olan bir anahtar dosyasını değiştir. Eski anahtar kaybolur. |

**Ne görmelisiniz:** `New testnet wallet`, `qor1...` ile başlayan bir `address`, `(mode 600, mnemonic not shown)` ile anahtar dosyasının yolu ve sonraki adım için bir ipucu.

**`qor1...` adresini kopyalayın.** Kaybederseniz `python airdrop.py status` onu yeniden yazdırır. Anahtar dosyasını asla paylaşmayın, Git'e göndermeyin ve mainnet'te yeniden kullanmayın.

Anahtarı başka bir yerde tutmak için `--key-file` seçeneğini komut adından **önce** yazın:

```bash
python airdrop.py --key-file ~/my.env status
```

`--key-file <path>`, "varsayılan yerine bu anahtar dosyasını kullan" demektir. Sıra önemlidir: `--key-file`, `status`, `drop` ve diğer komutlardan önce gelir. Bunun yerine `QORE_KEY_FILE` ortam değişkenini de ayarlayabilirsiniz.

### 5. Faucet'ten testnet QOR alın {#faucet}

1. https://dashboard.qorechain.io/faucet adresini açın ve oturum açın.
2. `qor1...` adresinizi yapıştırın ve talep düğmesine basın.
3. Birkaç saniye bekleyin, ardından şunu çalıştırın:

```bash
python airdrop.py status
```

**Ne yapar:** testnet'ten bakiyenizi ve kuantum sonrası anahtarınızın kayıtlı olup olmadığını sorar.

**Ne görmelisiniz:** bakiyeniz (yaklaşık 100 QOR) ve ML-DSA-87 anahtarının henüz kayıtlı olmadığına dair bir uyarı. Adresin "is not on chain yet" olduğunu söylüyorsa faucet ödemesi henüz ulaşmamıştır: 10 saniye bekleyin ve yeniden deneyin.

### 6. Kuantum sonrası anahtarınızı kaydedin {#register}

```bash
python airdrop.py register
```

**Ne yapar:** ML-DSA-87 anahtarınızı zincire bir kez kaydeder. Yeniden çalıştırmak güvenlidir. Bu ilk işlem klasik olarak imzalanır, çünkü bir anahtar kendi kaydına birlikte imza atamaz. Yaklaşık 0,09 QOR tutar. Ondan sonraki her işlem hibrit imzalıdır.

**Ne görmelisiniz:** bir işlem hash'i ve `registered` satırı (iki kez çalıştırdıysanız `already registered`).

**Ne kadar sürer:** birkaç saniye (bir blok).

### 7. Alıcı listesini yazın {#list}

İki tek kullanımlık alıcı hesabı oluşturun. Her birinin kendi anahtar dosyası olur:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

**Ne yapar:** öncekiyle aynı `new` komutu, ancak `--key-file` her anahtarı kendi dosyasına yönlendirir, böylece hiçbir şeyin üzerine yazılmaz. (Testnet kullanan arkadaşlarınızın adreslerini de kullanabilirsiniz.)

**Ne görmelisiniz:** iki farklı `qor1...` adresi. İkisini de kopyalayın.

Şimdi bu klasörde `addresses.txt` adlı düz bir metin dosyası oluşturun, her satıra bir adres. Herhangi bir metin düzenleyici işe yarar (Windows'ta Not Defteri, macOS'ta düz metin kipinde TextEdit, Linux'ta `nano addresses.txt`):

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

İki örnek satırı gerçek adreslerinizle değiştirin. Boş satırlar, `#` yorumları, yinelenenler, gönderenin kendisi ve geçerli bir `qor1...` adresi olmayan her şey bir uyarıyla atlanır. İşlem başına en fazla 100 alıcı olabilir. Klasörde ayrıca yer tutucu satırlar içeren bir örnek olan `addresses.example.txt` de vardır.

### 8. Airdrop'u gönderin {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

| Parça | Anlamı |
| --- | --- |
| `drop` | Listedeki herkese ödeme yapan tek bir işlem gönder. |
| `addresses.txt` | Alıcıları içeren dosya. |
| `0.1` | **Her alıcı için** QOR cinsinden tutar (0,1 QOR = 100.000 uqor). İki alıcı toplamda 0,2 QOR alır. |
| `--memo "..."` | İşleme eklenen kısa bir metin. İsteğe bağlı. |
| `--yes` (veya `-y`) | İsteğe bağlı: "emin misiniz" sorusunu atla. |

Seçenek sırası: tutar ve dosya önce gelir, `--memo` ve `--yes` onlardan sonra gelir. `--key-file` farklıdır: `drop` komutundan önce yazılır.

**Ne yapar:** bir özet gösterir (alıcılar, kişi başı tutar, toplam) ve onay ister. `y` yazın ve Enter'a basın. Ardından zincire ne kadar gaz gerektiğini sorar (bir deneme çalıştırması), güvenlik payı olarak yüzde 30 ekler, iki anahtarla da imzalar, tek bir işlem gönderir ve doğrulama raporunu yazdırır.

**Ne görmelisiniz:** işlem hash'i ve yüksekliği, ardından şunları içeren bir rapor: kod 0, imzalayanın `pqc_hybrid_verify` durumu `verified`, 4.627 baytlık bir ML-DSA-87 imzası ve listenizle eşleşen bir alıcı sayısı. Hash'i kopyalayın.

**Ne kadar sürer:** yaklaşık 10 saniye.

### 9. Herhangi bir işlemi doğrulayın {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

**Ne yapar:** işlemi zincirden okur ve doğrulama raporunu tek başına yazdırır. Yalnızca sizin işleminiz için değil, her işlem hash'i için çalışır.

**Ne görmelisiniz:** 8. adımın sonundaki raporun aynısı.

## İşlemi kendiniz doğrulayın {#check}

Araca güvenmek zorunda değilsiniz. Zincire doğrudan sorun.

**1. yol, tarayıcıda.** `https://explore.qore.network/tx/<HASH>` adresini açın (`<HASH>` yerine kendi hash'inizi yazın), ardından explorer'ı **Testnet**'e geçirin. Her alıcıya ödeme yapılmış başarılı bir işlem görmelisiniz.

**2. yol, tek komut:**

```bash
curl -s https://api-testnet.qore.host/cosmos/tx/v1beta1/txs/<HASH>
```

| Parça | Anlamı |
| --- | --- |
| `curl` | Bir web adresini indiren araç. macOS'ta, Windows 10+ sürümlerinde ve çoğu Linux'ta yerleşik gelir. |
| `-s` | Sessiz: ilerleme çubuğunu gizle. |
| adres | Herkese açık testnet REST API'si. Tam işlem kaydını JSON olarak döndürür. |

Uzun çıktıda **ne görmelisiniz** (jq kurduysanız `| jq .` ekleyin, bkz. https://jqlang.github.io/jq/download/):

- `"code": 0`, işlemin başarılı olduğu anlamına gelir.
- 64 baytlık klasik imzanın yanında, **4.627 baytlık** bir `pqc_signature` (ML-DSA-87 imzası) tutan bir `PQCHybridSignature` uzantısı.
- Adresiniz için `status` değeri `verified` olan bir `pqc_hybrid_verify` olayı.

## Kanıt nasıl çalışır {#proof}

`verify`, herkese açık testnet REST uç noktasından `GET /cosmos/tx/v1beta1/txs/{hash}` çağrısını okur ve şunları kontrol eder:

- imzalayan için `status=verified` olan, `pqc_hybrid_verify` türünde bir olay;
- `/qorechain.pqc.v1.PQCHybridSignature` uzantısı 4.627 baytlık bir ML-DSA-87 imzası taşıyor;
- işlem başarılı oldu (kod 0) ve kaç alıcıya ödeme yaptı.

## Sorun giderme {#troubleshooting}

| Ne görüyorsunuz | Neden | Ne yapmalı |
| --- | --- | --- |
| `python3: command not found` veya sürüm 3.10'un altında | Python yok ya da eski. | Python 3.10 veya daha yenisini kurun, yeni bir terminal açın. Windows'ta `python` kullanın. |
| `No module named venv` veya `ensurepip is not available` | Python'un venv bölümü kurulu değil (Debian, Ubuntu). | `sudo apt install python3-venv`, ardından 2. adımı tekrarlayın. |
| `ModuleNotFoundError: No module named 'qorsdk'` | Ortam açık değil ya da kurulum atlanmış. | `source .venv/bin/activate` çalıştırın, ardından `pip install -r requirements.txt`. |
| `unrecognized arguments: --key-file` | `--key-file` komuttan sonra yazılmış. | Önce yazın: `python airdrop.py --key-file <path> status`. |
| `no key file at ... Run: python airdrop.py new` | 4. adımı atladınız ya da farklı bir `--key-file` kullanılıyor. | `python airdrop.py new` çalıştırın. |
| `... already exists (use --force to replace it)` | Bir anahtar dosyası zaten var. | Onu koruyun veya `python airdrop.py new --force` çalıştırın (eski anahtar kaybolur). |
| `... is readable by others (mode ...)` | Anahtar dosyasının izinleri fazla açık. | `chmod 600 <path>` çalıştırın. |
| `... is not on chain yet (fund it first)` | Faucet'ten QOR gelmedi. | 10 saniye bekleyin veya faucet'ten talep edin. |
| `account has no PQC key and classical fallback is disabled` | Kuantum sonrası anahtar henüz kayıtlı değil. | Önce `python airdrop.py register` çalıştırın. |
| `the ML-DSA-87 key is not registered yet` | Aynı neden, araç tarafından göndermeden önce bulundu. | `python airdrop.py register` çalıştırın. |
| `balance too low` | Toplam tutar artı ücret, sahip olduğunuzdan fazla. | Daha küçük bir tutar gönderin veya bir sonraki faucet talebini bekleyin. |
| Faucet hız sınırı diyor | Hesap başına 24 saatte bir talep. | Bekleyin veya başka bir tek kullanımlık hesap kullanın. |
| `skip line N: not a valid qor1 address` | `addresses.txt` içindeki bir satır düzgün bir adres değil. | O satırı düzeltin veya silin. Diğer satırlar yine de çalışır. |
| `no valid recipients` | Her satır atlandı. | `addresses.txt` dosyasında gerçek `qor1...` adresleri olduğunu kontrol edin. |
| `bad amount` | Tutar düz bir sayı değil. | QOR'u bir sayı olarak yazın, örneğin `0.1`. |
| `refused by the node: code ...` | Zincir işlemi reddetti. | Mesajı okuyun. Testnet meşgulse veya yükseltiliyorsa bir dakika bekleyin ve yeniden deneyin. |
| `transaction not found on the testnet` | Hash yanlış ya da blok henüz kesinleşmedi. | Hash'i kontrol edin ve birkaç saniye sonra yeniden deneyin. |
| `the testnet may be pausing for an upgrade` | Herkese açık uç noktalar IP adresi başına istekleri sınırlıyor ya da testnet yükseltiliyor. | Bir dakika bekleyin ve yeniden çalıştırın. |
| `EVM authorisation window exhausted` | Bu uygulamaya değil, EVM uygulamalarına aittir. | Bir EVM uygulamasında `pnpm window open` ile yeni bir pencere açın. |
| Pencere açıldıktan sonra `HHE10402` | Yalnızca Hardhat uygulamaları: pencere henüz etkin değildi. | Dağıtımı yeniden çalıştırın. |
| Tarayıcıda `CORS` hataları | Yalnızca bir web sayfası zinciri doğrudan çağırdığında. Bu araç çağırmaz. | Bir tarayıcı uygulamasında şablonun `/lcd` vekilini kullanın. |
| `pnpm: command not found` | pnpm kurulu değil. Burada gerekmez. | Yalnızca Hardhat kılavuzu için: `npm install -g pnpm` çalıştırın. |

## Önemli olan SDK kodu {#code}

```python
from qorsdk import (derive_native_account, derive_pqc_canonical, msg, build_hybrid_tx,
                    auto_fee, hybrid_sign_and_broadcast, wait_for_tx,
                    resolve_sign_bytes_version)

account = derive_native_account(mnemonic)                   # classical secp256k1 key
pqc = derive_pqc_canonical(account.address, mnemonic)       # ML-DSA-87 key, same mnemonic

# ONE MsgMultiSend: one input (the sender), one output per recipient.
drop = msg.bank.multi_send(
    inputs=[Input(address=sender, coins=[Coin(denom="uqor", amount=str(each * len(to)))])],
    outputs=[Output(address=a, coins=[Coin(denom="uqor", amount=str(each))]) for a in to])

build = lambda fee, v: build_hybrid_tx(account=account, pqc_keypair=pqc, messages=[drop], fee=fee,
    memo=memo, chain_id="qorechain-diana", account_number=num, sequence=seq, sign_bytes_version=v)

v = resolve_sign_bytes_version("qorechain-diana", rest_url=REST)                 # "v2" on the testnet
fee = auto_fee(REST, build({"amount": [], "gas": "0"}, v), gas_multiplier=1.3)  # simulate
res = hybrid_sign_and_broadcast(lambda v: build(fee, v), chain_id="qorechain-diana", rest_url=REST)
included = wait_for_tx(rest, res["tx_response"]["txhash"])
```

Anahtar, `ensure_pqc_registered(...)` ile bir kez kaydedilir; aynı anahtar zaten zincirdeyse hiçbir şey yapmaz. Gaz asla sabit değildir: gerçek hibrit imzalı işlem önce simüle edilir ve sınır, simüle edilen gazın 1,3 katıdır, gaz başına 0,15 uqor üzerinden fiyatlandırılır.

Hesap coin türü 118'dir (`m/44'/118'/0'/0/0`). ML-DSA-87 anahtarı aynı kurtarma ifadesinden türetilir ve `derive_pqc_canonical` ile adrese bağlanır. Kendi uygulamanızı bunun yerine seed tabanlı yardımcılar üzerine kurarsanız, SDK 0.13.0 bir kurtarma kodu veya bağımsız bir 32 baytlık PQC sırrı ister (Python'da `unified_account_from_seed(seed32, recovery_code=...)`); [SDK kurulumu](/sdk/install#whats-new-0130) sayfasına bakın. Bir kurtarma kodunu asla yazdırmayın.

## Kullanılan paketler {#packages}

| Öğe | Sürüm |
| --- | --- |
| `qorechain-sdk` (PyPI, `qorsdk` olarak içe aktarılır) | 0.13.0 (`requirements.txt` içinde `qorechain-sdk==0.13.0` olarak sabitlenmiş) |
| Python | 3.10 veya daha yeni |

Araç ayrıca `Input`, `Output` (`cosmpy.protos.cosmos.bank.v1beta1.bank_pb2` içinden) ve `Coin` (`cosmpy.protos.cosmos.base.v1beta1.coin_pb2` içinden) protobuf türlerini içe aktarır; bunlar SDK ile birlikte gelir. Tüm dillerin sürüm tablosu için [SDK kurulumu](/sdk/install) sayfasına bakın.

## Nerelere bakılır {#access}

| Ne | Nerede |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (Testnet'e geçin) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Kod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
