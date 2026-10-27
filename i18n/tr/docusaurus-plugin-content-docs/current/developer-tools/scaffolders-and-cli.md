---
slug: /developer-tools/scaffolders-and-cli
title: Proje İskeleleri ve qorollup CLI
sidebar_label: İskeleler ve CLI
sidebar_position: 21
---

# Proje İskeleleri ve `qorollup` CLI

Üç komut satırı aracı, bir QoreChain projesini sıfırdan tipli, derlenebilir bir başlangıç noktasına getirir. Node.js ile çalışan uygulama geliştiricileri (dApp'ler) ve rollup operatörleri içindir:

* **`create-qorechain-dapp`** (0.10.0), [QoreChain SDK](/sdk/overview) üzerine kurulu üç şablondan biriyle bir dApp iskeleti oluşturur.
* **`create-qorechain-rollup`** (0.7.0), TypeScript [Rollup Geliştirme Kiti](/rollups/overview) üzerine kurulu altı şablondan biriyle bir rollup projesi iskeleti oluşturur.
* **`qorollup`**, `@qorechain/rdk-cli` paketinin (0.7.0) komutudur; operatör komut satırıdır: ön kontroller, bir rollup oluşturma ve izleme, canlı parametreleri okuma.

Bu sayfa, 27 Ekim 2026'da npm'den kurulan yayımlanmış paketleri yansıtır. Kavramsal kılavuzlar [Rollup Dağıtımı](/rollups/deploying-a-rollup) ve [SDK CLI başvurusu](/sdk/reference/cli) sayfalarıdır.

## Yenilikler {#innovations}

* **CI için etkileşimsiz iskele oluşturma.** Her soru için bir bayrak vardır: `--template`, `--network`, `--package-manager`, `--yes` (varsayılanları kabul et) ve `--no-install`. Bir işlem hattı (pipeline) tek komutla ve terminal olmadan bir proje üretip derleyebilir.
* **Şablonlar güncel paketlere sabitlenmiştir.** dApp şablonları `@qorechain/sdk` `^0.10.0` sürümüne (EVM şablonu `@qorechain/evm` sürümüne), rollup şablonları ise `@qorechain/rdk` `^0.7.0` sürümüne bağlıdır. Önceki bir iskele aracı (0.8.0), canlı ağlar için imzalayamayan bir SDK'ya çözülen aralıklar yazıyordu; güncel sürümde bu olmaz.
* **Rollup şablonları her kullanım senaryosu için geçerli bir yapılandırma kodlar.** Her rollup şablonu, RDK'nın uyumluluk matrisinin kabul ettiği bir settlement, sequencer, veri erişilebilirliği, gaz ve VM birleşimi ayarlar ve iskele aracı, siz herhangi bir şey oluşturmadan önce canlı stake'i ve oluşturma yakımını yazdırır.
* **Neyin eksik olduğunu söyleyen bir ön kontrol komutu.** `qorollup doctor` (ve bir rollup şablonunun içinde `npm run doctor`), REST uç noktasının yanıt verdiğini, modül parametrelerinin okunabildiğini, uç noktanın istediğiniz ağ olduğunu ve bir imzacının yapılandırıldığını kontrol eder ve her kontrol için bir satır yazdırır. Bir şablonun içinde ayrıca rollup yapılandırmasını uyumluluk matrisine karşı doğrular.
* **Şablonlara bağlanmış hibrit imzalama.** Rollup şablonları, hesabın ML-DSA-87 anahtarını mnemonic'inizden türeten (veya ham özel anahtarla bir seed alan) ve ağların native lane üzerinde zorunlu kıldığı hibrit imzayı atan küçük bir `signer.ts` üzerinden bağlanır. `rollup-app` dApp şablonu da aynısını yapar ve `QORE_BROADCAST=1` ayarlamadığınız sürece bir deneme çalıştırması (dry run) olarak çalışır.
* **Deneme çalıştırmaları.** `qorollup create ... --dry-run` yapılandırmayı doğrular, stake'i ve yakımı yazdırır ve yayınlamadan `MsgCreateRollup` göndereceğini belirtir.
* **Makine tarafından okunabilir çıktı.** `qorollup ... --json` betikler için JSON yazdırır.

## Nasıl kullanılır {#how-to-use}

### Bir dApp iskeleti oluşturun {#create-dapp}

```bash
# interactive
npm create qorechain-dapp my-dapp
# non-interactive
npx create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
```

| Şablon | Ne üretir | Betikler |
| --- | --- | --- |
| `evm-solidity` | Önceden derlenmiş bir yapıtla (artifact) bir Solidity `Counter` kontratı ve onu dağıtıp `@qorechain/evm` kullanarak çağıran bir viem betiği. Dosyalar: `contracts/Counter.sol`, `contracts/Counter.artifact.ts`, `scripts/deploy.ts`, `.env`. | `deploy` |
| `fullstack-web` | `@qorechain/sdk` ile bir adresin bakiyelerini (ve bir tokenomik özetini) okuyan bir Vite, React ve TypeScript sayfası. Dosyalar: `index.html`, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, `.env`. | `dev`, `build`, `preview`, `typecheck` |
| `rollup-app` | Rollup ve sidechain veya paychain mesajları oluşturmak için SDK'nın `createRollupClient` ve `createMultilayerClient` işlevlerini kullanan bir Node betiği. Dosyalar: `src/index.ts` ve olağan yapılandırma. Varsayılan olarak deneme çalıştırması. | `start`, `typecheck` |

| Bayrak | Anlamı |
| --- | --- |
| `-t, --template <name>` | `evm-solidity`, `fullstack-web` veya `rollup-app` |
| `--network <name>` | `testnet` veya `mainnet` |
| `--package-manager <pm>` | `pnpm`, `npm` veya `yarn` |
| `-y, --yes` | soruları atla ve varsayılanları kullan |
| `--no-install` | bağımlılıkları kurma |
| `-h, --help`, `-v, --version` | yardım, sürüm |

Test edilmiş örnek (geliştirici merkezinden; 27 Ekim 2026'da boş bir dizinde, herkese açık npm kayıt defterinden `npx` ile çalıştırıldı): web şablonunun iskeletini oluşturur ve derler. Gözlenen: `Done! Created my-dapp` ve başarılı bir `vite build`. Derleme bir paket boyutu uyarısı yazdırır; zararsızdır.

```bash
npx -y create-qorechain-dapp my-dapp --template fullstack-web --network testnet --package-manager npm --yes
cd my-dapp && npm run build
```

Web uygulamasını çalıştırmadan önce üretilen `.env` dosyasını açın: `http://localhost:1317` ve `http://localhost:8545` adreslerine işaret eder; bu yüzden `VITE_QORE_REST_URL` değerini `https://api-testnet.qore.host` (ana ağ için `https://api.qore.host`) ve `VITE_QORE_EVM_RPC_URL` değerini `https://evm-testnet.qore.host` (veya `https://evm.qore.host`) olarak ayarlayın.

### Bir rollup projesi iskeleti oluşturun {#create-rollup}

```bash
npm create qorechain-rollup my-rollup
# non-interactive
npx create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
```

| Şablon | Profil | Settlement / sequencer / DA / gaz / VM | Ek dosyalar |
| --- | --- | --- | --- |
| `defi-rollup` | defi | zk-SNARK, dedicated, native, EIP-1559, EVM | bir referans prover (`src/prover.ts`) ve `circuits/` altında bir demo devresi |
| `gaming-rollup` | gaming | based, based, native, sabit gaz, özel VM | yok |
| `nft-rollup` | nft | optimistic, dedicated, QoreChain Native, bir itiraz akışıyla | `src/challenge.ts` |
| `enterprise-rollup` | enterprise | based, based, native, sübvanse edilmiş gaz, EVM | yok |
| `custom-rollup` | custom | tamamen parametrik, her alan belgelenmiş | yok |
| `multivm-rollup` | multivm | QoreChain Native kontratlarını cross-VM precompile üzerinden çağıran bir EVM rollup'ı | `contracts/CrossVmCaller.sol`, `src/crossvm-call.ts` |

Her şablon `rollup.config.ts` (yapılandırma), `src/client.ts`, `src/signer.ts`, `src/create.ts`, `src/submit-batch.ts`, `src/query-status.ts`, `src/doctor.ts`, `src/status.ts`, `.env` ve `.env.example`, bir README ve bir `.github/workflows/deploy.yml` içerir. Betikler: `create`, `submit-batch`, `query-status`, `doctor`, `status`, `typecheck`. Hazır profiller [Hazır Profiller](/rollups/preset-profiles) sayfasında açıklanmıştır.

Seçenekler dApp iskele aracıyla aynıdır; yukarıdaki altı şablon adıyla. `multivm-rollup` şablonu `--help` çıktısında listelenir ancak beş şablon listeleyen paket README'sinde yer almaz.

Test edilmiş örnek (geliştirici merkezi, 27 Ekim 2026, boş bir dizinde npm'den `npx`). Gözlenen: `Created my-rollup (defi-rollup template)` ve geçen bir `tsc --noEmit`. Aynı iskele ve `npm run typecheck` aynı gün 0.6.2 ile tekrarlandı, sonuç aynıydı.

```bash
npx -y create-qorechain-rollup my-rollup --template defi-rollup --network testnet --package-manager npm --yes
cd my-rollup && npm run typecheck
```

İskele aracının yazdırdığı sonraki adımlar: `npm install`, `.env` içindeki operatör anahtarını doldurun, `npm run doctor`, `npm run create`, `npm run query-status`. Üretilen `.env` zaten herkese açık test ağı uç noktalarını (`https://api-testnet.qore.host`, `https://rpc-testnet.qore.host`, `https://evm-testnet.qore.host`) ve boş anahtar alanlarını içerir: `QORE_MNEMONIC` veya `QORE_OPERATOR_PRIVATE_KEY_HEX` (kuantum sonrası seed için `QORE_PQC_SEED_HEX` ile birlikte). O dosyayı asla commit etmeyin.

### `qorollup` CLI {#qorollup}

```bash
npm install -g @qorechain/rdk-cli
qorollup --version          # 0.7.0
qorollup doctor --network testnet
```

Kurmadan da çalıştırabilirsiniz: `npx @qorechain/rdk-cli doctor`.

| Komut | Ne yapar |
| --- | --- |
| `doctor` | ön kontrol: uç noktalar, modül parametreleri, ağ eşleşmesi, imzacı, bakiye, yapılandırma |
| `params` | canlı modül parametrelerini yazdırır |
| `create --rollup-id <id>` | bir rollup oluşturur (`--profile`, `--stake-uqor`, `--dry-run`) |
| `status <id>`, `watch <id>` | durum ve sağlık veya canlı bir görünüm (`--interval <ms>`) |
| `advise <id>` | QCAI Copilot'tan tavsiye (bkz. [QCAI Copilot](/rollups/qcai-copilot)) |
| `suggest "<use case>"` | bir kullanım senaryosu için profil önerir |
| `receipt <id> <batch>` | bir settlement makbuzu oluşturur (`--verify`, `--out <file>`), bkz. [Settlement Makbuzları](/rollups/settlement-receipts) |
| `watchtower <id>` | optimistic rollup'lar için challenger çerçevesi, bkz. [Watchtower](/rollups/watchtower) |
| `pause`, `resume`, `stop <id>` | yaşam döngüsü geçişleri (yalnızca oluşturan) |
| `keygen` | bir operatör anahtarı üretir (mnemonic ve adres) |
| `manifest export`, `manifest import` | bir rollup manifestini dışa veya içe aktarır |
| `withdraw --file <json>` | bir çekim (withdrawal) hazırlar ve gönderir (`--dry-run`) |
| `faucet <address>` | test ağı fonu ister (`QORE_FAUCET_URL` gerekir) |

Genel bayraklar: `--network testnet|mainnet` (varsayılan testnet), `--rest`, `--rpc`, `--evm-rpc` (uç nokta geçersiz kılmaları veya `QORE_REST_URL`, `QORE_RPC_URL`, `QORE_EVM_RPC_URL`), `--mnemonic` veya `--key` (veya `QORE_MNEMONIC`, `QORE_OPERATOR_PRIVATE_KEY_HEX`), `--profile defi|gaming|nft|enterprise|custom`, `--json`, `-y, --yes`, `-h, --help`, `-v, --version`.

**`doctor`.** Bir işlem gönderen herhangi bir şeyden önce çalıştırın. 27 Ekim 2026'da 0.6.2 ile, imzacı ayarlanmadan, test ağında gözlenen çıktı (ana ağ aynısını, `qorechain-vladi` ve `https://api.qore.host` ile yazdırdı; araç uzun çizgiler yazdırır, burada kısa çizgi olarak gösterilmiştir):

```text
Preflight (testnet - qorechain-diana):
✓ REST endpoint reachable - https://api-testnet.qore.host
✓ Module parameters readable - min stake 10000 QOR, burn 1%
✓ Network matches expectation - client is testnet (qorechain-diana)
! Signer configured - no signer (Set QORE_OPERATOR_PRIVATE_KEY_HEX or QORE_MNEMONIC to create/operate.)
All checks passed.
```

`!` ile başlayan bir satır uyarıdır ve çalıştırmayı başarısız kılmaz; eksik bir imzacı yalnızca bir rollup oluşturmak veya işletmek istediğinizde sorundur. Komut, hiçbir kontrol başarısız olmazsa 0 koduyla çıkar.

**Test edilmiş örnek.** Geliştirici merkezinden: canlı modül parametrelerini anahtarsız okuyun. 0.6.1'de başarısız oldu (komut hiçbir şey yazdırmadı ve 0 ile çıktı) ve 0.6.2'de yeniden çalıştırıldı:

```bash
npx -y @qorechain/rdk-cli params --network testnet --rest https://api-testnet.qore.host
```

0.6.2 ile `npx` üzerinden, genel kurulumla ve yerel `node_modules/.bin/qorollup` bağlantısıyla (ve 0.7.0 ile yerel bağlantı üzerinden, burada `qorollup --version` 0.7.0 yazdırdı) gözlenen: modül parametreleri yazdırılır (en fazla rollup 200, minimum stake 10000 QOR, oluşturma yakımı %1, itiraz penceresi 3600 sn, en büyük veri erişilebilirliği blob'u 2.097.152 bayt, blob saklama 432.000 blok, blok başına en fazla batch 10). Ayrıca gözlenen, bir oluşturma işleminin deneme çalıştırması:

```bash
qorollup create --rollup-id my-roll --profile defi --dry-run --network testnet
# Create rollup "my-roll" (profile defi, zk/evm)
# Stake 10000 QOR - burned on creation: 100 QOR
# Dry run OK - would submit MsgCreateRollup (no broadcast).
```

## Nasıl erişilir {#how-to-access}

* **Ön koşullar.** Node.js 20 veya üzeri ve bir paket yöneticisi. İskele araçları dosya yazar ve `--no-install` vermediğiniz sürece bağımlılıkları kurar; bu yüzden npm kayıt defterine ağ erişimi gerekir. Python, Rust, Go ve Java RDK istemcileri kütüphanedir ve iskele aracı yoktur; bkz. [Rollup Dağıtımı](/rollups/deploying-a-rollup).
* **Ağlar ve uç noktalar.** Ana ağ `qorechain-vladi` (EVM zincir kimliği 9801): REST `https://api.qore.host`, RPC `https://rpc.qore.host`, EVM `https://evm.qore.host`. Test ağı `qorechain-diana` (zincir kimliği 9800): ilk etiketten sonra `-testnet` eklenmiş aynı ana makineler, örneğin `https://api-testnet.qore.host`. Veri okuma, `doctor`, `params`, `suggest` ve `--dry-run` hesap gerektirmez.
* **Hesaplar ve anahtarlar.** Bir işlem gönderen her şey, fonlanmış bir operatör hesabı ve onun mnemonic'ini veya özel anahtarını gerektirir; bunlar ortam değişkenleri veya bayraklar üzerinden verilir, asla commit edilmez. Bir rollup oluşturmak minimum stake'i gerektirir (her iki ağda 10.000 QOR, 27 Ekim 2026'da canlı okundu); bunun %1'i oluşturma sırasında yakılır. `qorollup keygen` yeni bir anahtar üretir; test ağında test fonları [Dashboard Faucet](/dashboard/faucet)'ten veya `QORE_FAUCET_URL` ayarlıyken `qorollup faucet` ile alınır.
* **Hibrit imza.** Native lane işlemleri bir secp256k1 imzası artı bir ML-DSA-87 imzası gerektirir. Şablonlar kuantum sonrası anahtarı mnemonic'inizden türetir; `qorollup` işlem komutları türetmez (aşağıdaki sınırlara bakın).
* **Maliyetler.** Araçlar ücretsizdir (Apache-2.0). Zincirde ücret tabanı gaz başına 0,1 uqor'dur; yukarıdaki rollup stake'i ve yakımı oluşturma için geçerlidir.

## Nerede yayımlandı {#where-published}

| Kayıt defteri | Paket | Sürüm | Bağlantı |
| --- | --- | --- | --- |
| npm | `create-qorechain-dapp` (komut `create-qorechain-dapp`) | 0.10.0 | https://www.npmjs.com/package/create-qorechain-dapp |
| npm | `create-qorechain-rollup` (komut `create-qorechain-rollup`) | 0.7.0 | https://www.npmjs.com/package/create-qorechain-rollup |
| npm | `@qorechain/rdk-cli` (komut `qorollup`) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk-cli |
| npm | `@qorechain/rdk` (şablonların kullandığı kütüphane) | 0.7.0 | https://www.npmjs.com/package/@qorechain/rdk |

Kaynak: https://github.com/qorechain/qorechain-sdk/tree/main/cli (dApp iskele aracı), https://github.com/qorechain/qorechain-rdk/tree/main/cli (rollup iskele aracı) ve https://github.com/qorechain/qorechain-rdk/tree/main/packages/rdk-cli (`qorollup`). RDK'nın 0.7.0 sürümü ayrıca PyPI, crates.io, Maven Central ve Go modül proxy'sindedir (27 Ekim 2026'da kontrol edildi). Hepsi Apache-2.0'dır.

## Sınırlar ve bilinen sorunlar {#limits}

* **`--network mainnet`, bir test çalıştırmasında üretilen dosyaları değiştirmedi.** 27 Ekim 2026'da `fullstack-web` ve `custom-rollup` şablonlarının iskeleti `--network mainnet` ile oluşturuldu; üretilen `.env` hâlâ localhost uç noktalarını (dApp) veya test ağı uç noktalarıyla `QORE_NETWORK=testnet` değerini (rollup) taşıyordu ve dApp'in `App.tsx` dosyası bir `testnet` istemcisi oluşturdu. Ağı ve uç noktaları `.env` içinde ve web şablonu için `src/App.tsx` içinde kendiniz ayarlayın.
* **Henüz hiçbir ağda bir rollup yok** (27 Ekim 2026'da kontrol edildi). Rollup araçlarının hiçbir işlem yolu canlı bir rollup üzerinde denenmemiştir. Her şeyi önce test ağında doğrulayın ve [RDK 0.7.0: değişiklikler ve sınırlar](/rollups/deploying-a-rollup#rdk-050-limits) bölümünü okuyun.
* **`defi-rollup` şablonu bir batch'i çözümleyemez (settle).** ZK settlement henüz iki ağda da kullanılamaz (anahtar kaydı zincir v3.2.7 için planlanmıştır) ve demo devresi her halükarda zincirin kanıt kontrolünü geçemezdi. 0.7.0'dan itibaren şablon göndermeden önce durur; böylece zincirin her zaman reddedeceği bir batch için artık ücret harcamaz. Bu değişene kadar `optimistic` settlement'lı bir şablon kullanın (bkz. [ZK, STARK ve Çekimler](/rollups/zk-stark-withdrawals)).
* **`multivm-rollup` şablonu canlı olmayan bir şeye bağlıdır.** `0x0000000000000000000000000000000000000901` adresindeki cross-VM precompile iki ağda da etkin değildir; bu yüzden bir kontrattan yapılan çağrı hiçbir şey yapmaz. Şablon bunu kontrol eder ve kontratı sessizce başarısız olmak yerine geri alacak (revert) şekilde yazılmıştır (bkz. [Multi-VM](/rollups/multi-vm)).
* **`qorollup` işlem komutları yalnızca klasik imzalar.** `create`, `pause`, `resume`, `stop` ve `withdraw`, iki ağın da native lane üzerinde reddettiği kuantum sonrası anahtar olmadan bağlanır. Okumalar, `doctor`, `params`, `receipt` ve `--dry-run` etkilenmez. İşlem göndermek için iskelesi oluşturulmuş bir proje (betikleri hibrit imzalar), `pqcKeypair` ile TypeScript RDK veya zincir CLI'si kullanın.
* **Bazı `qorollup` yardımcılarının henüz konuşacağı bir şey yok.** 27 Ekim'de test ağına karşı `advise`, ücret, ağ, sahtekârlık ve RL-ajan yüzeyleri için (düğüm 501 veya "method does not exist" yanıtladı) ve var olmayan bir rollup için "advisory unavailable" yazdırdı. `suggest`, `source: fallback` ile bir profil döndürdü; bu, asistan hizmeti yerine yerleşik varsayılan listenin kullanıldığını gösterir. Uyarıları okuyun.
* **`rollup-app` yalnızca istediğinizde yayınlar.** Varsayılan olarak deneme çalıştırması yapar; `QORE_BROADCAST=1` ile hesabın ML-DSA-87 anahtarını bir kez kaydeder ve hibrit imzalar. Örnek rollup değerleri açıklayıcıdır: gerçek profil adlarını ve stake'i [Hazır Profiller](/rollups/preset-profiles) sayfasından alın.
* **`fullstack-web`, tokenomik düğmesinde bir hata gösterir.** O panel, herkese açık uç noktaların sunmadığı bir `qor_` JSON-RPC yöntemini çağırır; bakiye sorgusu çalışır. Bunu `client.rest.getBurnStats()` gibi bir REST okumasıyla değiştirin.
* **`evm-solidity` fonlanmış bir hesaptan fazlasını gerektirir.** QoreChain'de bir EVM işlemi göndermek ayrıca kayıtlı bir ML-DSA-87 anahtarı ve native lane'den kurulan açık bir EVM yetkilendirme penceresi gerektirir (bkz. [EVM kılavuzu](/developer-guide/evm-development#evm-window)). Şablonun `deploy` betiği bu sayfa için canlı bir ağa karşı çalıştırılmadı.
* **`create-qorechain-dapp --version`, kurulu paket 0.10.0 olduğu halde `0.5.1` yazdırır** (27 Ekim 2026'da kontrol edildi). Sürümü `package.json` dosyasından veya kayıt defterinden okuyun.
* **Paket README'leri güncel değil.** `create-qorechain-dapp` README'si iki, `create-qorechain-rollup` README'si beş şablon listeler; `--help` üç ve altı gösterir. `--help` çıktısına güvenin.
* **0.6.2'den önceki sürümler npm'den çalışmaz.** `qorollup` 0.6.1 ve öncesi, npm üzerinden herhangi bir şekilde kurulduğunda hiçbir şey yazdırmadı ve 0 koduyla çıktı; `--version` `0.4.1` yazdırdı. 0.6.1'de kalmanız gerekiyorsa `node node_modules/@qorechain/rdk-cli/dist/index.js <command>` çalıştırın; aksi halde yükseltin.
* **Bağımlılık kopyaları (yalnızca 0.6.x).** `@qorechain/rdk` 0.6.2 ve öncesi `@qorechain/sdk` `^0.9.0` sürümüne bağlıdır; bu nedenle SDK 0.10.0'ı da kuran bir proje, ikinci bir iç içe SDK 0.9.x barındırıyordu. 0.7.0'dan itibaren kit `@qorechain/sdk` `^0.10.0` sürümüne bağlıdır ve tek bir kopyayı paylaşır.
