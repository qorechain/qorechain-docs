---
slug: /build-before-qday/workshop-1/apps/qday-counter
title: Q-Day Counter
sidebar_label: Q-Day Counter
sidebar_position: 1
---

# Q-Day Counter

Q-Day Counter, QoreChain EVM'inin işe yarar en küçük projesidir: tek bir sayıyı saklayan bir Solidity kontratı, onu `qorechain-diana` testnet'ine dağıtan bir Hardhat projesi ve o sayıyı okuyup artıran kısa bir betik. `create-qorechain-dapp` aracının `hardhat` şablonudur; üzerine küçük bir `interact` betiği eklenmiştir.

## Ne gösterir {#shows}

- **Hibrit imzalama dağıtım yolunun bir parçasıdır.** Bir kontrat dağıtımı dahil her EVM işleminden önce hesabın kayıtlı bir ML-DSA-87 anahtarına ve açık bir EVM yetkilendirme penceresine ihtiyacı vardır. Pencere, hem secp256k1 hem ML-DSA-87 ile imzalanmış (hibrit) tek bir native lane mesajıyla açılır ve zincir her iki imzayı da doğrular.
- **Zincir üzerinde doğrulanan hibrit imzalı bir işlem.** `pnpm window open` adımı bu işlemi gönderir. Onu explorer'da bulup zincirin kendi kararını görebilirsiniz.
- **Normal EVM araçlarınız çalışmaya devam eder.** Hardhat, Ignition ve viem sıradan Ethereum işlemleri gönderir. Kuantum sonrası koruma pencerededir; bu yüzden tek başına çalınmış bir secp256k1 anahtarı hesaptan harcama yapamaz.

secp256k1'i kırabilecek kadar büyük bir kuantum bilgisayar, saldırganın klasik imzaları taklit etmesine izin verir. QoreChain hesapta ikinci, kuantum sonrası bir imza (ML-DSA-87, FIPS 204) ister. Counter, bu kural açıkken tüm geliştirici döngüsünü gösterir: anahtarı kaydet, pencere aç, dağıt, çağır, oku.

## Başlamadan önce {#prerequisites}

macOS, Linux ya da WSL veya Git Bash ile Windows üzerinde bir terminale ve şu araçlara ihtiyacınız var:

| Araç | Gereken sürüm | Kontrol komutu |
| --- | --- | --- |
| Git | yakın zamandan herhangi bir sürüm | `git --version` |
| Node.js | 20.12 veya daha yeni (22 LTS önerilir) | `node --version` |
| pnpm | 9 veya daha yeni | `pnpm --version` |

Node.js'i https://nodejs.org adresinden kurun. `pnpm --version` başarısız olursa pnpm'i `npm install -g pnpm` (ya da `corepack enable`) ile kurun ve yeniden kontrol edin.

Faucet'i kullanmak için [QoreChain dashboard](https://dashboard.qorechain.io) üzerinde ücretsiz bir hesaba da ihtiyacınız var. Bu kılavuzda asla gerçek bir cüzdan kullanmazsınız: aşağıdaki her şey tek kullanımlık bir testnet hesabı kullanır ve testnet QOR'unun değeri yoktur.

## Adım adım {#steps}

### 1. Kodu alın {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/01-qday-counter
```

### 2. Bağımlılıkları kurun {#step-install}

```sh
pnpm install
```

### 3. Testleri ve derlemeyi çalıştırın {#step-test}

Testler yerel, simüle edilmiş bir zincirde çalışır. Anahtara ya da ağ hesabına ihtiyaç duymaz.

```sh
pnpm test
pnpm build
```

`Counter` testleri için `2 passing` görmelisiniz.

### 4. Testnet anahtar dosyasını oluşturun {#step-account}

Ayar dosyasını şablondan oluşturun:

```sh
cp .env.example .env
```

`.env` dosyası tek kullanımlık bir anahtar tutar; bu yüzden onu asla commit etmeyin ve anahtarı gerçek hiçbir yerde yeniden kullanmayın. `.env` dosyasını herhangi bir düzenleyicide açın. İki değeri dolduracaksınız.

**a. Tek kullanımlık bir özel anahtar.** Rastgele 32 baytlık bir anahtar üretin:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Yazdırılan `0x...` değerini `.env` dosyasına `PRIVATE_KEY=0x...` olarak kopyalayın ve tamamı sıfır olan yer tutucunun yerine koyun.

**b. Kuantum sonrası bir kurtarma kodu.** Hesabın ML-DSA-87 anahtarı ayrı bir kurtarma kodundan türetilir. Bir tane oluşturun:

```sh
pnpm window recovery-code
```

Yazdırılan `QRC1-...` satırını `.env` dosyasına `QORE_PQC_RECOVERY_CODE=QRC1-...` olarak kopyalayın. Bu kodu özel anahtarla birlikte saklayın ve her zaman aynısını kullanın: yeni bir kod hesaba farklı bir ML-DSA-87 anahtarı verir.

`QORE_MNEMONIC` değerini boş bırakın ve `QORE_NETWORK=testnet` olarak tutun. `.env` dosyanız artık şöyle görünür (yer tutucular gösterilmiştir):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 5. Hesap adresinizi gösterin {#step-address}

```sh
pnpm window status
```

İlk satır hesabınızı `0x...` ve `qor1...` biçimiyle yazdırır. Bu noktada ayrıca anahtarın kayıtlı olmadığını ve pencere bulunmadığını söyler. `qor1...` adresini kopyalayın.

### 6. Faucet'ten testnet QOR'u alın {#step-faucet}

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. `qor1...` adresinizi yapıştırın ve QOR'u isteyin (24 saatte bir 100 QOR).
3. Birkaç saniye bekleyin, sonra `pnpm window status` komutunu yeniden çalıştırın. Hesap artık zincirde var.

### 7. Anahtarı kaydedin ve pencereyi açın {#step-window}

```sh
pnpm window register    # once: registers your ML-DSA-87 key
pnpm window open        # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                # opening the window advances the account's nonce
pnpm window status      # PQC key: registered, window: live
```

Kayıt, zincirin klasik imzayla kabul ettiği tek mesajdır; çünkü zincirde henüz karşılaştırılacak bir anahtar yoktur. Pencereyi açmak hibrit imzalanır. `window open` komutunun yazdırdığı işlem hash'ini saklayın; son adımda onu arayacaksınız.

### 8. Kontratı dağıtın {#step-deploy}

```sh
pnpm deploy:testnet     # Hardhat Ignition, answer y when asked to confirm
```

Komut, dağıtılan `Counter` adresini (`0x...`) yazdırır.

### 9. Okuyun ve artırın {#step-interact}

```sh
pnpm interact           # read count, increment(), read again, explorer link
pnpm interact --read    # read only
```

### 10. Explorer'da bulun {#step-explorer}

1. https://explore.qore.network adresini açın ve ağ seçiciyi **Testnet**'e getirin.
2. `pnpm window open` komutunun yazdırdığı hash'i aratın. İşlem, zincirin doğruladığı bir kuantum sonrası imza gösterir.
3. Kontrat çağrısını görmek için `pnpm interact` komutunun yazdırdığı `increment` işlem hash'ini ya da 8. adımdaki `Counter` adresini aratın.

[Hybrid Inspector](/build-before-qday/workshop-1/apps/hybrid-inspector) aynı türden kanıtı bayt bayt gösterir.

## Görmeniz gerekenler {#result}

- `pnpm test` çıktısı `2 passing` olur.
- `pnpm window status` hesabı (`0x...` ve `qor1...` biçimiyle), `PQC key: registered` ve kalan blokları, işlemleri ve değeri içeren `window: live` bilgisini yazdırır.
- `pnpm deploy:testnet` dağıtılan `Counter` adresini (`0x...`) yazdırır.
- `pnpm interact` Counter adresini, `count` değerini, `increment` işlem hash'ini, blok numarasıyla `status: success` bilgisini, yeni `count` değerini ve işleme giden bir explorer bağlantısını yazdırır.
- Explorer'da (Testnet) `window open` işlemi her iki imzayla doğrulanmış olarak işaretlenir.

Bir adım başarısız olursa önce `pnpm window status` komutunu çalıştırın: anahtarın mı yoksa pencerenin mi eksik olduğunu söyler. Pencerenin hakkı bittikten sonra bir işlemin reddedilmesi, `pnpm window open` ile yeni bir pencere açmanız gerektiği anlamına gelir.

## Kod {#code}

Kontrat (`contracts/Counter.sol`):

```solidity
contract Counter {
    uint256 public count;
    event CountChanged(uint256 newCount);

    constructor(uint256 initial) {
        count = initial;
        emit CountChanged(initial);
    }

    function increment() external {
        count += 1;
        emit CountChanged(count);
    }

    function set(uint256 value) external {
        count = value;
        emit CountChanged(value);
    }
}
```

`scripts/window.ts` dosyasının hibrit imzalı kısmı (pencere mesajı ve imzalayıcı):

```ts
import { EthNativeSigner, openEvmWindowMsg } from "@qorechain/sdk";
import { evmWindowCost } from "@qorechain/evm";

// 3,000,000 gas at a 250 gwei fee cap, for a few deploys
const perTx = evmWindowCost({ gas: 3_000_000n, maxFeePerGas: 250_000_000_000n });
const maxValue = BigInt(process.env.QORE_WINDOW_MAX_UQOR ?? (perTx * maxTxs).toString());
const msg = openEvmWindowMsg({ sender: acc.cosmos, blocks, maxTxs, maxValue });

// broadcast(acc, "hybrid", [msg]) does this:
const signer = new EthNativeSigner(acc, { signMode: "hybrid", rest: net.rest });
const res = await signer.signAndBroadcast(transport, {
  chainId: net.chainId, accountNumber, sequence, fee: FEE, messages: [msg],
});
```

`acc`, anahtar malzemenizden türetilen birleşik hesaptır; `net` ise `QORE_NETWORK` için ağ kaydıdır (varsayılan `testnet`, chain id `qorechain-diana`). Betiğin kullandığı ücret 100000 `uqor` ve gaz limiti 800000'dir; çünkü hibrit işlemler büyüktür. Pencere boyutu `.env` içinde `QORE_WINDOW_BLOCKS` (varsayılan 600), `QORE_WINDOW_TXS` (varsayılan 5) ve `QORE_WINDOW_MAX_UQOR` ile değiştirilebilir.

## Kullanılan paketler {#packages}

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Hibrit imzalama, PQC anahtar kaydı, `openEvmWindowMsg` |
| `@qorechain/evm` | ^0.13.0 | EVM pencere yardımcıları (`evmWindowStatus`, `evmWindowCost`) |
| `@cosmjs/stargate` | ^0.39.0 | Native lane işleminin yayınlanması |
| `hardhat` | ^3.21.1 | Derleme, test, Ignition ile dağıtım |
| `viem` | ^2.47.6 | Kontratı okuma ve yazma |
| `tsx` | ^4.19.0 | TypeScript betiklerini çalıştırma |
| `typescript` | ^5.6.3 | Tip denetimi |

Aynı projenin iskeletini `npx create-qorechain-dapp my-app -t hardhat --network testnet` ile kendiniz de oluşturabilirsiniz. Bkz. [İskeleler ve CLI](/developer-tools/scaffolders-and-cli) ve [SDK'yı kurun](/sdk/install).

## Ağ ayrıntıları {#networks}

| Öğe | Değer |
| --- | --- |
| Ağ | testnet `qorechain-diana` |
| EVM chain id | 9800 |
| RPC | `https://rpc-testnet.qore.host` |
| REST | `https://api-testnet.qore.host` |
| EVM RPC | `https://evm-testnet.qore.host` |

Kaynak: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/01-qday-counter
