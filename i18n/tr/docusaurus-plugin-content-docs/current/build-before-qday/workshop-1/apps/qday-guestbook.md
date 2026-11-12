---
slug: /build-before-qday/workshop-1/apps/qday-guestbook
title: Q-Day Guestbook
sidebar_label: Q-Day Guestbook
sidebar_position: 2
---

# Q-Day Guestbook

Q-Day Guestbook, QoreChain EVM testnet'inde zincir üzerinde bir ziyaretçi defteridir. Herkes her adresten bir kez, en fazla 140 karakterlik bir mesajla imzalayabilir. İki parçası vardır: bir Hardhat projesiyle birlikte bir Solidity kontratı (`contracts-app/`) ve QoreX cüzdanını bağlayan, hesabın EVM penceresini gösteren ve en son imzaları canlı listeleyen bir React web sayfası (`web/`).

## Ne gösterir {#shows}

- **Hibrit imzalayan, bunu bilmeyen bir tarayıcı dApp'i.** Sayfa sıradan bir wagmi ve RainbowKit uygulamasıdır. QoreX imzanın ML-DSA-87 yarısını ekler; böylece aynı işlem hem secp256k1 hem de kuantum sonrası bir anahtarla korunur.
- **EVM penceresi arayüzde görünür.** Sayfa hesabın penceresini zincirden okur ve açık olup olmadığını, kaç blok ve işlem kaldığını gösterir.
- **Okunabilir reddedilme nedenleri.** Zincir bir yazmayı reddettiğinde `classifyEvmWindowRejection` hatayı dört nedenden birine eşler (kayıtlı anahtar yok, pencere yok, pencere tükendi, geçersiz parametreler) ve sayfa çözümü gösterir.
- **Zincir üzerinde doğrulanan hibrit imzalar.** Yazdığınız her imza, zincirin yalnızca her iki imzayı (ML-DSA-87 ve secp256k1) kontrol ettikten sonra kabul ettiği tek bir işlemdir.

## Başlamadan önce {#prerequisites}

macOS, Linux ya da WSL veya Git Bash ile Windows üzerinde bir terminale ve şu araçlara ihtiyacınız var:

| Araç | Gereken sürüm | Kontrol komutu |
| --- | --- | --- |
| Git | yakın zamandan herhangi bir sürüm | `git --version` |
| Node.js | 20.12 veya daha yeni (22 LTS önerilir) | `node --version` |
| pnpm | 9 veya daha yeni | `pnpm --version` |

Node.js'i https://nodejs.org adresinden kurun. `pnpm --version` başarısız olursa pnpm'i `npm install -g pnpm` (ya da `corepack enable`) ile kurun ve yeniden kontrol edin.

Faucet için [QoreChain dashboard](https://dashboard.qorechain.io) üzerinde ücretsiz bir hesaba, tarayıcı kısmı için de QoreX cüzdanına (masaüstü tarayıcı uzantısı ya da uygulama) ihtiyacınız var. Bkz. [QoreX Entegrasyonları](/developer-tools/qorex-integrations) ve [QoreX genel bakış](/qorex/overview). Kontrat adımlarında asla gerçek bir cüzdan kullanmazsınız: tek kullanımlık bir testnet hesabı kullanırsınız. Testnet QOR'unun değeri yoktur.

## Adım adım {#steps}

### 1. Kodu alın {#step-clone}

```sh
git clone https://github.com/qorechain/build-before-qday
cd build-before-qday/workshop-1/02-qday-guestbook
```

Projede ayrı ayrı kuracağınız iki klasör vardır.

### 2. Kontratlar: kurun ve test edin {#step-contract-install}

```sh
cd contracts-app
pnpm install
pnpm test
```

`QDayGuestbook` testleri için `3 passing` görmelisiniz. Testler yerel, simüle edilmiş bir zincirde çalışır ve anahtar gerektirmez.

### 3. Kontratlar: testnet anahtar dosyasını oluşturun {#step-account}

```sh
cp .env.example .env
```

`.env` dosyası tek kullanımlık bir anahtar tutar; bu yüzden onu asla commit etmeyin ve anahtarı gerçek hiçbir yerde yeniden kullanmayın. `.env` dosyasını herhangi bir düzenleyicide açın ve iki değeri doldurun.

**a. Tek kullanımlık bir özel anahtar.** Rastgele 32 baytlık bir anahtar üretin:

```sh
node -e "console.log('0x' + require('crypto').randomBytes(32).toString('hex'))"
```

Yazdırılan `0x...` değerini `.env` dosyasına `PRIVATE_KEY=0x...` olarak kopyalayın ve tamamı sıfır olan yer tutucunun yerine koyun.

**b. Kuantum sonrası bir kurtarma kodu.** Hesabın ML-DSA-87 anahtarı ayrı bir kurtarma kodundan türetilir. Bir tane oluşturun:

```sh
pnpm window recovery-code
```

Yazdırılan `QRC1-...` satırını `.env` dosyasına `QORE_PQC_RECOVERY_CODE=QRC1-...` olarak kopyalayın. Her zaman aynı kodu kullanın: yeni bir kod hesaba farklı bir ML-DSA-87 anahtarı verir.

`QORE_MNEMONIC` değerini boş bırakın ve `QORE_NETWORK=testnet` olarak tutun. `.env` dosyanız artık şöyle görünür (yer tutucular gösterilmiştir):

```sh
PRIVATE_KEY=0x...
QORE_PQC_RECOVERY_CODE=QRC1-...
QORE_MNEMONIC=
QORE_NETWORK=testnet
```

### 4. Kontratlar: hesabı fonlayın {#step-faucet}

```sh
pnpm window status
```

İlk satır hesabınızı `0x...` ve `qor1...` biçimiyle yazdırır. `qor1...` adresini kopyalayın, sonra:

1. https://dashboard.qorechain.io/faucet adresini açın ve giriş yapın.
2. `qor1...` adresini yapıştırın ve QOR'u isteyin (24 saatte bir 100 QOR).
3. Birkaç saniye bekleyin ve `pnpm window status` komutunu yeniden çalıştırın.

### 5. Kontratlar: anahtarı kaydedin, pencereyi açın, dağıtın {#step-window}

```sh
pnpm window register        # once: registers your ML-DSA-87 key
pnpm window open            # hybrid-signed: opens a window (600 blocks, 5 transactions)
sleep 10                    # opening the window advances the account's nonce
pnpm deploy:testnet         # Hardhat Ignition, answer y when asked to confirm
```

`pnpm deploy:testnet`, dağıtılan `QDayGuestbook` adresini (`0x...`) yazdırır. Onu kopyalayın. Kayıt, zincirin klasik imzayla kabul ettiği tek mesajdır; çünkü zincirde henüz karşılaştırılacak bir anahtar yoktur. Pencereyi açmak hibrit imzalanır; yazdırdığı işlem hash'ini saklayın.

### 6. Kontratlar: komut satırından imzalayın {#step-cli}

```sh
pnpm sign "Hello from my terminal"   # writes one entry
pnpm sign --read                     # lists the latest entries
```

Her adres bir kez imzalayabilir; bu yüzden aynı hesaptan ikinci bir `pnpm sign` kontrat tarafından reddedilir.

### 7. Web sayfası: kurun ve yapılandırın {#step-web}

Aynı proje klasöründe ikinci bir terminal açın (ya da `cd ..` ile oraya dönün), sonra:

```sh
cd web
pnpm install
cp .env.example .env
```

`web/.env` dosyasını açın ve 5. adımda kopyaladığınız adresi yazın:

```sh
VITE_GUESTBOOK_ADDRESS=0x...
```

`VITE_WALLETCONNECT_PROJECT_ID` değerini boş bırakın: yalnızca `src/wagmi.ts` dosyasına WalletConnect tabanlı bir cüzdan eklerseniz gerekir.

### 8. Web sayfası: çalıştırın {#step-run}

```sh
pnpm dev
```

http://localhost:5174 adresini QoreX'in kurulu olduğu tarayıcıda açın. Sayfa zinciri EVM RPC üzerinden okur. EVM penceresini ise Vite `/lcd` vekili üzerinden REST ile okur; çünkü herkese açık REST uç noktası CORS başlıkları göndermez. En alttaki imza listesi, 6. adımda yazdığınız kaydı zaten gösterir.

### 9. QoreX'ten imzalayın {#step-sign}

1. QoreX'i kurun ve testnet'e geçirin. Geçiş için bkz. [5 Dakikada Dağıtım](/getting-started/deploy-in-5-minutes#step-testnet).
2. QoreX'te kayıtlı bir ML-DSA-87 anahtarı olan bir coin-60 (Ethereum) hesabı kullanın ve onu [faucet](/dashboard/faucet) ile fonlayın (giriş yaptıktan sonra adresini yapıştırın).
3. Sayfada **Connect QoreX** düğmesini seçin, bir mesaj yazın ve **Sign** düğmesini seçin. Açık bir pencere yoksa QoreX, onay ekranında EVM penceresini açmayı önerir.
4. QoreX'te onaylayın.

### 10. Explorer'da bulun {#step-explorer}

https://explore.qore.network adresini açın ve ağ seçiciyi **Testnet**'e getirin. 6. ya da 9. adımdaki işlem hash'ini, `pnpm window open` komutunun hash'ini ya da `QDayGuestbook` adresini aratın. Pencere işlemi, zincirin doğruladığı bir kuantum sonrası imza gösterir.

## Görmeniz gerekenler {#result}

- `contracts-app` içinde `pnpm test` çıktısı `3 passing` olur.
- `pnpm window status`, `PQC key: registered` ve kalan blokları ile işlemleri içeren `window: live` bilgisini yazdırır.
- `pnpm deploy:testnet` `QDayGuestbook` adresini (`0x...`) yazdırır.
- `pnpm sign "..."` işlem hash'ini ve `status: success in block ...` bilgisini yazdırır.
- Sayfada 1. adım `0x...` hesabınızı, `qorechain-diana EVM (9800)` zincirini, bakiyenizi ve kalan blok ile işlem sayılarıyla birlikte `live` olarak EVM penceresini gösterir.
- **Sign** düğmesini seçip QoreX'te onayladıktan sonra explorer'a giden bir işlem bağlantısı, ardından `success in block ...` görünür.
- En alttaki liste zincirdeki imza sayısını ve en yeni önce olacak şekilde son kayıtları (en fazla 20) gösterir; birkaç saniyede bir yenilenir.
- Aynı adresten ikinci bir deneme, o adresin zaten imzaladığını gösterir.

## Kod {#code}

Kontrat kayıtları bir dizide tutar ve adres başına bir imzaya izin verir:

```solidity
uint256 public constant MAX_LENGTH = 140;
Entry[] private entries;
mapping(address => bool) public hasSigned;

function sign(string calldata message) external {
    uint256 len = bytes(message).length;
    if (len == 0 || len > MAX_LENGTH) revert BadLength();
    if (hasSigned[msg.sender]) revert AlreadySigned();
    hasSigned[msg.sender] = true;
    entries.push(Entry(msg.sender, uint64(block.timestamp), message));
    emit Signed(entries.length - 1, msg.sender, message);
}

function count() external view returns (uint256) { return entries.length; }

// the newest `limit` entries, newest first
function latest(uint256 limit) external view returns (Entry[] memory out);
```

QoreX, bağlayıcı listesindeki ilk cüzdandır (`web/src/wagmi.ts`):

```ts
import { qorechain, qorechainTestnet } from "@qorechain/evm";
import { qorexWallet } from "@qorechain/qorex-rainbowkit";

wallets: [() => qorexWallet({ pollAccountsOnFocus: true }), injectedWallet],
// ...
chains: [qorechainTestnet, qorechain],
```

Sayfa pencereyi gösterir ve reddedilme nedenlerini açıklar (`web/src/App.tsx`):

```tsx
const w = await evmWindowStatus({ rest: REST, address });   // found, live, remainingBlocks, remainingTxs
const rejection = write.error ? classifyEvmWindowRejection(write.error) : undefined;
// "no-pqc-key" | "no-window" | "exhausted" | "invalid"
```

## Kullanılan paketler {#packages}

Kontratlar (`contracts-app/`):

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/sdk` | ^0.13.0 | Pencere yardımcı betiği, hibrit imzalama |
| `@qorechain/evm` | ^0.13.0 | Zincir tanımları, `evmWindowStatus`, `evmWindowCost` |
| `@cosmjs/stargate` | ^0.39.0 | Pencere mesajının yayınlanması |
| `hardhat` | ^3.21.1 | Derleme, test, Ignition ile dağıtım |
| `viem` | ^2.47.6 | Ethereum istemcisi |
| `tsx` | ^4.19.0 | TypeScript betiklerini çalıştırma |
| `typescript` | ^5.6.3 | Tip denetimi |

Web sayfası (`web/`):

| Paket | Sürüm | Ne için kullanılır |
| --- | --- | --- |
| `@qorechain/evm` | ^0.13.0 | Zincir tanımları, `evmWindowStatus`, `classifyEvmWindowRejection` |
| `@qorechain/qorex-rainbowkit` | ^0.1.0 | QoreX'i bir RainbowKit cüzdanı olarak kullanma |
| `@rainbow-me/rainbowkit` | ^2.2.11 | Bağlan düğmesi |
| `wagmi` | ^2.19.5 | Okuma ve yazma için React hook'ları |
| `viem` | ^2.53.1 | Ethereum istemcisi |
| `@tanstack/react-query` | ^5.59.0 | Pencere ve zincir okumaları için veri çekme |
| `react`, `react-dom` | ^18.3.1 | Arayüz |
| `vite` | ^5.4.0 | Geliştirme sunucusu |
| `@vitejs/plugin-react` | ^4.3.0 | Vite için React desteği |
| `typescript` | ^5.6.3 | Tip denetimi |

Kaynak: https://github.com/qorechain/build-before-qday/tree/main/workshop-1/02-qday-guestbook
