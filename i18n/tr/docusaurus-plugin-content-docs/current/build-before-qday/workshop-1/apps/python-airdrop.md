---
slug: /build-before-qday/workshop-1/apps/python-airdrop
title: Python Uygulaması, Q-Day Airdrop
sidebar_label: Python, Airdrop
sidebar_position: 6
---

# Python Uygulaması: Q-Day Airdrop

**Q-Day Airdrop**, testnet QOR'unu bir adres listesinin tamamına **tek** bir işlemle gönderen küçük bir Python aracıdır; işlem klasik bir secp256k1 anahtarı ve kuantum sonrası bir ML-DSA-87 (FIPS 204) anahtarıyla imzalanır. Ardından zincirin kendi kaydından her iki imzanın da doğrulandığını kanıtlar. QoreChain testnet'inde (`qorechain-diana`, EVM chain ID 9800) çalışır.

## Ne gösterir {#what-it-shows}

- **Python'dan hibrit ML-DSA-87 + secp256k1 imzalama.**
- **Zincir üzerinde doğrulanan hibrit imzalı bir işlem**; tek bir multi-send mesajıyla birçok alıcıya aynı anda ödeme yapar.
- **Aracın sözüne değil, zincirin kendi işlem kaydına dayanan bir doğrulama raporu.**

Neden önemli: tek bir imza bütün bir airdrop'u korur ve ML-DSA-87 yarısı kuantum sonrası olduğu için gelecekteki bir kuantum bilgisayara karşı korunmuş kalır. Bkz. [Kuantum Güvenli İşlemler](/sdk/guides/quantum-safe).

## Adım adım {#run}

Aşağıdaki her şey kendi terminalinizde çalışır (macOS, Linux ya da WSL ile Windows). Yalnızca tek kullanımlık bir testnet hesabı kullanırsınız. Testnet QOR'unun değeri yoktur ve burada asla gerçek bir cüzdan kullanmazsınız.

### 1. Araçları kurun {#install}

Git'e ve Python 3.10 veya daha yenisine (`venv` ile) ihtiyacınız var. Elinizdekileri kontrol edin:

```bash
git --version
python3 --version      # must report 3.10 or later
python3 -m venv --help # prints usage if venv is available
```

Bir şey eksikse önce kurun; örneğin [python.org](https://www.python.org/downloads/) adresinden ya da paket yöneticinizle (macOS'ta `brew install python`, Debian veya Ubuntu'da `sudo apt install python3 python3-venv git`). Yeni bir terminal açın ve kontrolleri yeniden çalıştırın.

### 2. Kodu alın {#clone}

```bash
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/06-python-airdrop
```

### 3. Bağımlılıkları kurun {#deps}

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Bu, tek bir paketi, `qorechain-sdk==0.13.0` ve ihtiyaç duyduklarını kurar. Sanal ortamı kalan adımlar boyunca etkin tutun (her yeni terminalde `source .venv/bin/activate` komutunu yeniden çalıştırın). Aracın başladığını kontrol edin:

```bash
python airdrop.py --help
```

`new`, `status`, `register`, `drop` ve `verify` komutlarını görmelisiniz.

### 4. Tek kullanımlık testnet hesabınızı oluşturun {#key}

```bash
python airdrop.py new
```

Bu komut yeni bir kurtarma ifadesi üretir, onu yalnızca sizin okuyabileceğiniz (600 kipi) `~/.config/qday/python.env` anahtar dosyasına yazar ve yalnızca `qor1...` ile başlayan hesap adresini yazdırır. İfade asla gösterilmez. Bu dosyayı paylaşmayın, commit etmeyin ve mainnet'te yeniden kullanmayın. Anahtarı başka bir yerde tutmak için komut adından önce `--key-file /path/to/file` yazın (örneğin `python airdrop.py --key-file ~/my.env status`) ya da `QORE_KEY_FILE` ayarlayın.

Çıktıdaki `qor1...` adresini kopyalayın. Kaybederseniz `python airdrop.py status` onu yeniden yazdırır.

### 5. Faucet'ten testnet QOR'u alın {#faucet}

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. `qor1...` adresinizi yapıştırın ve token isteyin. Faucet 24 saatte 100 QOR verir.
3. Ulaştığını kontrol edin:

```bash
python airdrop.py status
```

Bakiye testnet QOR'unuzu göstermeli, kuantum sonrası anahtar ise henüz kayıtlı değil olarak görünmelidir.

### 6. Kuantum sonrası anahtarınızı kaydedin {#register}

```bash
python airdrop.py register
```

Bu komut ML-DSA-87 anahtarınızı zincire bir kez kaydeder. Yeniden çalıştırmak güvenlidir. Bir anahtar kendi kaydını birlikte imzalayamadığı için kayıt klasik olarak imzalanır. Sonraki her işlem hibrit imzalanır.

### 7. Alıcı listesini yazın {#list}

Her satırda bir testnet adresi olan bir metin dosyası oluşturun. İlk denemede, `--key-file` parametresini yeni dosyalara yönelterek birkaç tek kullanımlık adres üretin ya da testnet'i kullanan arkadaşlarınızın adreslerini kullanın:

```bash
python airdrop.py --key-file ~/.config/qday/r1.env new
python airdrop.py --key-file ~/.config/qday/r2.env new
```

Sonra yazdırılan adresleri `addresses.txt` dosyasına koyun:

```text
# One qor1 address per line. Blank lines and lines starting with # are ignored.
qor1...first-testnet-address
qor1...second-testnet-address
```

Boş satırlar, `#` yorumları, yinelenenler, gönderenin kendisi ve geçerli bir `qor1...` hesap adresi olmayan her şey uyarıyla atlanır. İşlem başına en fazla 100 alıcı olabilir. Depoda ayrıca yer tutucu satırlar içeren bir örnek olan `addresses.example.txt` dosyası vardır.

### 8. Airdrop'u gönderin {#drop}

```bash
python airdrop.py drop addresses.txt 0.1 --memo "Build Before Q-Day"
```

`0.1`, her alıcıya gönderilen QOR miktarıdır. Araç bir özet gösterir (alıcılar, kişi başı miktar, toplam) ve onay ister; soruyu atlamak için `--yes` ekleyin. Ardından gazı belirlemek için işlemi simüle eder, her iki anahtarla imzalar, tek bir işlem olarak yayınlar ve doğrulama raporunu yazdırır. Bir yayın başarısız olursa bir dakika bekleyip yeniden deneyin.

### 9. Herhangi bir işlemi doğrulayın {#verify}

```bash
python airdrop.py verify <TX_HASH>
```

`drop` komutunun yazdırdığı hash'i kullanın. Bu komut, herhangi bir işlem hash'i için doğrulama raporunu tek başına yazdırır.

## Görmeniz gerekenler {#output}

- `drop` işlem hash'ini ve yüksekliğini, ardından doğrulama raporunu yazdırır: imzalayanın `pqc_hybrid_verify` durumu `verified`, ML-DSA-87 imzası 4627 bayt, kod 0 ve alıcı sayısı listenizle eşleşir.
- Explorer'da: `https://explore.qore.network/tx/<HASH>` adresini açın ve explorer'ı **Testnet**'e geçirin. İşlem, her alıcıya ödeme yapılmış olarak başarılı görünür.

## Kanıt nasıl çalışır {#proof}

`verify`, herkese açık testnet REST uç noktasından `GET /cosmos/tx/v1beta1/txs/{hash}` isteğini okur ve şunları kontrol eder:

- imzalayan için `status=verified` ile `pqc_hybrid_verify` türünde bir olay;
- `/qorechain.pqc.v1.PQCHybridSignature` uzantısı (64 baytlık secp256k1 imzasının yanında) 4627 baytlık bir ML-DSA-87 imzası taşır;
- işlem başarılı oldu (kod 0) ve kaç alıcıya ödeme yaptı.

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

Anahtar, `ensure_pqc_registered(...)` ile bir kez kaydedilir; aynı anahtar zaten zincirdeyse bu çağrı hiçbir şey yapmaz. Gaz asla sabit değildir: gerçek hibrit imzalı işlem önce simüle edilir ve limit, simüle edilen gazın 1,3 katıdır; gaz başına 0,15 uqor ile fiyatlandırılır.

Hesap coin type 118'dir (`m/44'/118'/0'/0/0`). ML-DSA-87 anahtarı aynı kurtarma ifadesinden türetilir ve `derive_pqc_canonical` ile adrese bağlanır. Kendi uygulamanızı bunun yerine seed tabanlı yardımcılar üzerine kurarsanız SDK 0.13.0 bir kurtarma koduna ya da bağımsız 32 baytlık bir PQC sırrına ihtiyaç duyar (Python'da `unified_account_from_seed(seed32, recovery_code=...)`); bkz. [SDK kurulumu](/sdk/install#whats-new-0130). Bir kurtarma kodunu asla yazdırmayın.

## Kullanılan paketler {#packages}

| Öğe | Sürüm |
| --- | --- |
| `qorechain-sdk` (PyPI, `qorsdk` olarak içe aktarılır) | 0.13.0 (`requirements.txt` içinde `qorechain-sdk==0.13.0` olarak sabitlenmiş) |
| Python | 3.10 veya daha yeni |

Araç ayrıca `Input`, `Output` (`cosmpy.protos.cosmos.bank.v1beta1.bank_pb2` içinden) ve `Coin` (`cosmpy.protos.cosmos.base.v1beta1.coin_pb2` içinden) protobuf tiplerini içe aktarır; bunlar SDK ile birlikte gelir. Tüm dillerin sürüm tablosu için bkz. [SDK kurulumu](/sdk/install).

## Nelere nereden bakılır {#access}

| Ne | Nerede |
| --- | --- |
| REST | `https://api-testnet.qore.host` |
| RPC | `https://rpc-testnet.qore.host` |
| EVM | `https://evm-testnet.qore.host` |
| Explorer | `https://explore.qore.network` (Testnet'e geçin) |
| Faucet | https://dashboard.qorechain.io/faucet |
| Kod | https://github.com/qorechain/build-before-qday/tree/main/workshop-1/06-python-airdrop |
