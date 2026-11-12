---
slug: /developer-guide/svm-lane-v328
title: "SVM Şeridi: Programlar, Hesaplar ve Saklama Limitleri (v3.2.8)"
sidebar_label: SVM Şeridi (v3.2.8)
sidebar_position: 10
---

# SVM Şeridi: Programlar, Hesaplar ve Saklama Limitleri (v3.2.8)

SVM şeridi, QoreChain'in Solana uyumlu kısmıdır: derlenmiş programlar dağıtır, veri hesapları oluşturur ve programları Solana tarzı araçlarla çağırırsınız; aynı yerel QOR bakiyesi lamport cinsinden görünür. **v3.2.8** sürümü, bir yönetişim oylaması şeridi yeniden açana kadar şeridi yükseltme anında kapattı. Test ağında bu oylama (öneri 37) geçti ve şerit **açıktır**; saklaması üç yönetilen limitle sınırlanmıştır.

Bu sayfa, şerit durumunun nasıl okunacağını, programların, hesapların ve kiranın nasıl çalıştığını, bir SVM cüzdanının kuantum sonrası anahtarı nasıl kaydettiğini, saklama limitlerinin ne anlama geldiğini ve bugün hangi örneklerin çalışabileceğini açıklar.

:::note Önce test ağı ve şerit orada öneri 37'den beri açık
v3.2.8, **`qorechain-diana`** test ağında 12 Kasım 2026'dan beri çalışmaktadır. Ana ağ (`qorechain-vladi`) hâlâ v3.2.6'dadır, bir v3.2.8 tarihi yoktur ve **şerit ana ağda kapalı kalır**. Yükseltme şeridi test ağında kapattı (SVM yazmaları başarısız oldu, `MsgRegisterSVMPQCKey` reddedildi). **Yönetişim önerisi 37 geçti ve `qorechain-diana` üzerinde şeridi açtı**: `enabled: true` yaptı, diğer parametreleri olduğu gibi bıraktı ve `MsgExecuteProgram` ile VM'ler arası çağrılar üzerindeki devre kesici duraklatmasını kaldırdı. Oylamadan sonra 12 Kasım 2026'da kontrol edildiğinde `GET /qorechain/svm/v1/params` `enabled: true` gösterdi ve devre kesici listesinde yalnızca `/cosmwasm.wasm.v1.MsgStoreCode` vardı. Herkese açık SVM JSON-RPC salt okunur kalır. Her zaman önce canlı durumu okuyun (sonraki bölüm) ve varsaymayın.
:::

## Neden önemli {#why}

* Şerit kapalıyken SVM eylemleri sunan bir istemci, kullanıcılara reddedilen işlemler verir. Önce tek bir parametreyi okumak bunu önler.
* Şerit gerçek QOR tutar: bir programdaki, program türevli bir adresteki veya bir veri hesabındaki her lamport, SVM modülünün tuttuğu uqor ile desteklenir. Üç saklama limiti bu havuzu sınırlı tutar; bu yüzden gönderenin fonu olsa bile bir transfer veya yatırma reddedilebilir.
* Kira ve boyut limitleri, zincirde durum tutmanın maliyetini belirler; bu yüzden bir dağıtım bütçesine dahildirler.

## Şerit durumunu okumak {#lane-state}

Şerit durumu, SVM parametrelerinin `enabled` alanıdır. Bunu REST rotasından veya düğüm CLI'sından okuyun. Aynı yanıt bu sayfadaki diğer tüm limitleri de taşır; dolayısıyla bir dağıtımı boyutlandırmak için tek bir çağrı yeterlidir.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/params
```

`qorechain-diana` üzerinde yanıt, 12 Kasım 2026, öneri 37 geçtikten sonra (HTTP 200):

```json
{"params":{"max_program_size":"10485760","max_account_data_size":"10485760","compute_budget_max":"1400000","lamports_per_byte":"3480","rent_exemption_multi":"2.000000000000000000","enabled":true,"svm_slot_offset":"0","default_sig_scheme":0,"max_cpi":4,"max_custody_uqor":"10000000000","max_custody_hard_uqor":"1000000000000","max_account_excess_uqor":"10000000000"}}
```

Bir Linux düğümünde (paketlenmiş bir macOS ikili dosyası yoktur) aynı okuma şöyledir:

```bash
qorechaind query svm params --chain-id qorechain-diana --node https://rpc-testnet.qore.host:443
```

Node 18 veya üzeriyle TypeScript'te (bu okuma için bir SDK çağrısı gerekmez):

```ts
const REST = "https://api-testnet.qore.host";

const { params } = await (await fetch(`${REST}/qorechain/svm/v1/params`)).json();
if (!params.enabled) {
  throw new Error("The SVM lane is closed on this network; do not offer SVM actions");
}
console.log("compute units per instruction:", params.compute_budget_max);
```

Bu parametreler için tipli bir yardımcı (ve bir parametre önerisi için güvenli bir oluşturucu), henüz yayımlanmamış v3.2.8 SDK taslağının parçasıdır. Daha sonraki bir SDK sürümü bunu ekleyecek; o zamana kadar komut satırını veya REST rotasını kullanın.

### Küme kimliği {#cluster-info}

`cluster_info`, cüzdanlar için kümeyi tanımlar ve yürütmenin açık olup olmadığını söyler. `execution_enabled` dışında şerit durumuyla hiçbir şekilde değişmez.

```bash
curl -s https://api-testnet.qore.host/qorechain/svm/v1/cluster_info
```

12 Kasım 2026'da, öneri 37 geçtikten sonra okunan, `execution_enabled` değeri `true` olan yanıt (HTTP 200):

```json
{"chain_id":"qorechain-diana","genesis_hash":"6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zRw31gQVnF4Czj","caip2_chain_id":"solana:6Z9pa53SwiprqiAoNCqqUdj5c3C4P1zR","derivation":"base58(SHA-256(\"qorechain/svm/genesis-hash/v1\" || 0x00 || chain_id))","execution_enabled":true}
```

Düğüm CLI'sında aynı sorgu vardır: `qorechaind query svm cluster-info`. `https://svm-testnet.qore.host` adresindeki `getGenesisHash` JSON-RPC yöntemi aynı özeti döndürür. Özet zincir kimliğinden türetilir; gerçek bir Solana kümesinin genesis özeti değildir.

## Herkese açık SVM RPC'si salt okunurdur {#public-rpc}

`https://svm.qore.host` ve `https://svm-testnet.qore.host` herkese açık uç noktaları okumalara yanıt verir ve şerit açık olsun olmasın, herkese açık zincir kimliklerinde yazma yöntemlerini (`sendTransaction` ve benzerleri) reddeder. SVM işlemleri göndermek için, varsayılan olarak 8899 numaralı bağlantı noktasında Solana uyumlu JSON-RPC sunan kendi düğümünüzü çalıştırırsınız ([SVM Geliştirme](/developer-guide/svm-development#json-rpc-server) sayfasına bakın) ve şeridin kendisi o düğümün izlediği ağda açık olmalıdır. Okumalar şimdi çalışır:

```bash
# Health, version, cluster hash, slot and a rent quote (all HTTP 200 on 12 November 2026)
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getVersion","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getGenesisHash","params":[]}'
curl -s -X POST https://svm-testnet.qore.host -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"getMinimumBalanceForRentExemption","params":[1024]}'
```

`getVersion`, zincir kimliği, küme kimliği ve genesis özetiyle birlikte `solana-core` `1.18.0-qorechain` bildirdi. 1.024 bayt için kira teklifi 12 Kasım 2026'da `8017920` lamport idi. `GET /qorechain/svm/v1/account/{address}`, `.../program/{address}` ve `.../slot` REST rotaları herkese açık uç noktada **HTTP 501** (uygulanmamış) yanıtı verdi; hesapları ve programları `getAccountInfo` ve `getMultipleAccounts` JSON-RPC yöntemleriyle veya düğüm CLI'sı ile okuyun.

## Programları dağıtmak ve çağırmak {#programs}

Şerit açıldığında akış şöyledir: güncel Solana araç zinciriyle bir SBF programı derleyin, dağıtın, ihtiyaç duyduğu hesapları oluşturun, sonra çağırın. Her `tx svm` komutu bir Cosmos şeridi işlemidir; bu yüzden açık bir gaz limiti, en az gaz çarpı 0,1 uqor ücret ve hibrit kuantum sonrası ortak imza gerektirir ([Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing) sayfasına bakın).

Bunlar düğüm başvurusundaki Linux düğüm CLI komutlarıdır. **UNTESTED: şerit test ağında yalnızca öneri 37'den sonra açıldı ve bu sayfa için hiçbir program dağıtımı, yürütmesi veya hesap oluşturma çalıştırılmadı.**

```bash
# 1. Build (platform-tools v1.53, --arch v0 or --arch v3)
cargo build-sbf --arch v3

# 2. Deploy; the response carries the program id in base58
qorechaind tx svm deploy-program ./my_program.so --from mykey \
  --gas 2000000 --fees 200000uqor --chain-id qorechain-diana --generate-only > tx.json
qorechaind tx pqc cosign tx.json --from mykey --pqc-key mypqc --chain-id qorechain-diana

# 3. Create a data account owned by the program (space in bytes, lamports for rent)
qorechaind tx svm create-account <owner-base58> <space> <lamports> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json

# 4. Call the program
qorechaind tx svm execute <program-id-base58> <data-hex> --from mykey \
  --gas 400000 --fees 40000uqor --chain-id qorechain-diana --generate-only > tx.json
```

Bir düğümde, şerit durumu ne olursa olsun kullanılabilen okumalar:

```bash
qorechaind query svm account <base58-address>
qorechaind query svm program <base58-address>
qorechaind query svm params
qorechaind query svm slot
```

### @qorechain/svm 0.13.0 ile TypeScript {#typescript}

`@qorechain/svm`, `@solana/web3.js` üzerinde ince bir katmandır. Bir yükleyici sarmalayıcısı yoktur: dağıtmak için yukarıdaki düğüm CLI'sını, zaten var olan bir programa talimat oluşturup göndermek için ise paketi kullanın. Herkese açık ön ayarları bilinçli olarak bir SVM uç noktası belirlemez; bu yüzden ona kendi düğümünüzün URL'sini verin.

```ts
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createSvmClient,
  createInvokeInstruction,
  withComputeBudget,
  svmKeypairFromSecretKey,
} from "@qorechain/svm";

const client = createSvmClient({ rpcUrl: "http://127.0.0.1:8899" }); // your own node

const payer = svmKeypairFromSecretKey(secretKey64);       // 64-byte Solana-style secret key
const programId = new PublicKey("<program-id-base58>");
const dataAccount = new PublicKey("<data-account-base58>");

const tx = new Transaction().add(
  createInvokeInstruction(
    programId,
    [{ pubkey: dataAccount, isSigner: false, isWritable: true }],
    Uint8Array.from([0]),                                  // your program's instruction data
  ),
);
withComputeBudget(tx, { units: 200_000 });                 // stay under compute_budget_max

const sim = await client.simulateTransaction(tx);          // dry run first
const signature = await client.sendTransaction(tx, [payer]);
```

**UNTESTED:** bu örnek, sizin çalıştırdığınız bir düğüm gerektirir (şerit test ağında açıktır). Herkese açık uç noktaya karşı gönderim reddedilir. Salt okunur çağrılar (`client.getBalance`, `client.getAccountInfo`, `client.getSignaturesForAddress`), `createSvmClient({ rpcUrl })` herhangi bir URL kabul ettiği için `https://svm-testnet.qore.host` adresine karşı çalışır.

Python, Go, Rust ve Java: bu dillerin SVM bağdaştırıcıları aynı mesajları oluşturur; daha sonraki bir SDK sürümü v3.2.8 yardımcılarını ekleyecek. O zamana kadar yukarıdaki düğüm CLI'sını veya ham mesajı kullanın. Yöntem kümesi Solana uyumlu olduğu için herhangi bir Solana istemci kütüphanesi de kendi düğümünüzün 8899 numaralı bağlantı noktasıyla konuşabilir.

## Hesaplar ve kira {#rent}

SVM veri hesapları kullandıkları alan için öder. Sayılar yukarıdaki canlı parametrelerden gelir.

| Öğe | Kural | Canlı değer (test ağı) |
| ---- | ---- | -------------------- |
| Yıllık kira | bayt cinsinden veri boyutu çarpı `lamports_per_byte` | bayt başına 3.480 lamport |
| Kiradan muaf asgari tutar | yıllık kira çarpı `rent_exemption_multi` | çarpan 2,0 |
| Asgari tutarda veya üzerinde fonlanmış | asla kira tahsil edilmez | |
| Asgari tutarın altında fonlanmış | kira her dönemde (epoch) düşülür | |
| Bakiye sıfıra ulaşır | hesap kaldırılır | |

Lamport ve uqor arasındaki ilişki 1 uqor = 1.000 lamport şeklindedir. Tam asgari tutarı hesaplamak yerine düğüme sorun: `getMinimumBalanceForRentExemption`, 1.024 bayt için 8.017.920 lamport döndürdü (teklif hesap başlığını içerir). `create-account` en az bu kadar lamport gerektirir; aksi halde hesap kiradan muaf olmaz.

Adresler: bir hesabın SVM adresi, 20 hesap baytının 32 bayta tamamlanıp base58 ile yazılmış halidir. `qor1...`, `0x...` ve base58 biçimleri aynı hesabı adlandırır.

## SVM cüzdanları için kuantum sonrası anahtar {#pqc-key}

Zincirde kuantum sonrası bir anahtar isteyen bir SVM cüzdanı, bunu **`MsgRegisterSVMPQCKey`** ile kaydeder. Gönderen, 32 baytlık SVM adresi ve ML-DSA-87 genel anahtarını taşır. Bir Cosmos şeridi mesajıdır; bu yüzden gönderen onu diğer her Native işlem gibi hibrit imzalar. Şerit kapalıyken reddedilir ve **SVM hesabı, anahtarı kaydedilmeden önce zaten var olmalıdır** ([Test ağında denendi](#tested) altındaki reddedilme örneğine bakın).

Bunun için bir `tx svm` komutu yoktur; SDK oluşturucusunu kullanın. TypeScript'te oluşturucu `@qorechain/sdk` içindeki `msg.svm.registerSvmPqcKey` işlevidir. **Var olan bir hesap için UNTESTED: tek gönderim, hesabı olmayan bir adres içindi ve reddedildi.**

```ts
import {
  createClient,
  deriveNativeAccount,
  directSignerFromPrivateKey,
  derivePqcCanonical,
  msg,
} from "@qorechain/sdk";
import { fromBech32 } from "@cosmjs/encoding";

const client = createClient({
  network: "testnet",
  endpoints: { rest: "https://api-testnet.qore.host", rpc: "https://rpc-testnet.qore.host" },
});
const account = await deriveNativeAccount(mnemonic);
const signer = await directSignerFromPrivateKey(account.privateKey, "qor");
const pqcKeypair = derivePqcCanonical(account.address, mnemonic);
const tx = await client.connectTx(signer, { pqcKeypair });   // signs hybrid

// 20 account bytes padded with zeros to the 32-byte SVM address
const svmAddr = new Uint8Array(32);
svmAddr.set(fromBech32(account.address).data);

await tx.signAndBroadcast(
  [msg.svm.registerSvmPqcKey({ sender: account.address, svmAddr, pqcPubKey: pqcKeypair.publicKey })],
  "auto",
);
```

Python oluşturucusu `msg.svm.register_svm_pqc_key(sender=, ...)`, Go oluşturucusu ise `Svm.RegisterPQCKey(sender, svmAddr, pqcPubKey)` işlevidir.

## Saklama limitleri {#custody}

Bir programın, program türevli bir adresin veya bir veri hesabının tuttuğu her lamport, SVM modülünün saklama (custody) adı verilen tek bir havuzda tuttuğu uqor ile desteklenir. Üç yönetilen parametre onu sınırlar. Üçü de uqor cinsindendir; 1 QOR 1.000.000 uqor eder. Yönetişim bunları bir parametre önerisiyle değiştirir ve bir öneri, kümeyi bütün olarak değiştirdiği için on iki alanın hepsini göndermelidir.

| Parametre | Canlı değer | Sade anlatımla |
| --------- | ---------- | -------------- |
| `max_custody_uqor` | 10.000.000.000 (10.000 QOR) | SVM havuz bakiyesi üzerindeki üst sınır. Havuzu bunun üzerine çıkaracak bir transfer `svm custody cap exceeded` (kod 23) ile reddedilir. `0` üst sınır yok demektir. |
| `max_custody_hard_uqor` | 1.000.000.000.000 (1.000.000 QOR) | Havuzun ham bakiyesi üzerindeki mutlak tavan; kira rezervleri, ön fonlamalar ve düz bağışlar dahildir. Bakiyeyi bunun üzerinde bırakacak bir işlem reddedilir. `max_custody_uqor` değerinin altında olamaz ve şeridin açılabilmesi için sıfırdan büyük olmalıdır. |
| `max_account_excess_uqor` | 10.000.000.000 (10.000 QOR) | Tek bir veri hesabının kiradan muaf asgari tutarının üzerinde tutabileceği en fazla miktar. `0` hesap başına üst sınır yok demektir. |

Bir uygulama için bunun anlamı şudur: SVM hesaplarına park ettiğiniz değeri mütevazı tutun ve kira asgarisinin üzerinde yalnızca ihtiyacınız kadar bulundurun. Bakiyeniz için uygun olan bir yatırma, havuzun bütünü üst sınıra yakınsa yine de reddedilebilir; bu yüzden kod 23'ü geçersiz bir işlem olarak değil, "daha sonra veya daha az miktarla dene" olarak ele alın. Limitler yalnızca bir yönetişim oylamasıyla büyüyebilir, asla bir kullanıcı işlemiyle değil.

## Hesaplama bütçesi ve boyut limitleri {#limits}

| Limit | Parametre | Canlı değer (test ağı) |
| ----- | --------- | -------------------- |
| Talimat başına hesaplama birimi | `compute_budget_max` | 1.400.000 |
| Program boyutu (ELF) | `max_program_size` | 10.485.760 bayt (10 MiB) |
| Veri hesabı boyutu | `max_account_data_size` | 10.485.760 bayt (10 MiB) |
| İç içe program çağrıları | `max_cpi` | 4 |
| Varsayılan imza şeması | `default_sig_scheme` | 0 (Ed25519) |
| Slot kayması | `svm_slot_offset` | 0 (slot, blok yüksekliği artı kaymadır) |

Her çerçevenin 32 KiB yığını (stack) ve 256 KiB öbeği (heap) vardır. Yukarıdaki değerler yönetişimle değişebilir; bu yüzden onları canlı okuyun. `@qorechain/svm` 0.13.0 içinde `withComputeBudget(tx, { units })` bir hesaplama birimi limiti ister; onu `compute_budget_max` değerinde veya altında tutun.

## Test ağı SVM uç noktasının mevcut limitleri {#endpoint-limits}

Şerit açıktır, ancak herkese açık SVM JSON-RPC henüz tam bir Solana düğümü gibi davranmaz. Planınızı şu limitlere göre yapın:

- **`getLatestBlockhash`, blok özetini Solana düğümlerinin yaptığı gibi base58 olarak değil, 64 onaltılık karakter olarak döndürür** (12 Kasım 2026'da okundu: `blockhash` `e8d4...d449`, `lastValidBlockHeight` 9944659). Base58 bekleyen bir istemcinin bunu dönüştürmesi gerekir. Zincir ekibi bir değişiklik planladı.
- **Standart Solana araçlarından Solana tel biçimiyle (wire-format) `sendTransaction` herkese açık uç noktada henüz desteklenmiyor.** Programlar `MsgDeployProgram` ve `MsgExecuteProgram` Cosmos mesajlarıyla dağıtılır ve çağrılır; bunlar her Cosmos şeridi işlemi gibi hibrit imzayla imzalanır (yukarıdaki TypeScript yardımcılarına bakın). Solana araçlarıyla tam eşdeğerlik daha sonraki bir sürüm için planlanmıştır.
- **Yabancı bir anahtar, bir aktarıcı (relayer) üzerinden bir SVM eylemini yetkilendirebilir.** Ağ `svm-relayed-chain-bound` protokol özelliğini etkinleştirdiğinde yetkilendirme, zincire bağlı bir özeti (alan `qorechain-svm-auth-v3`) imzalar; `@qorechain/wallet-adapter` 0.6.0 bunu `authSignBytesV3` ile oluşturur ve `resolveSvmAuthVersion` ağın hangi biçimi istediğini okur.

## Hatalar ve reddedilmeler {#errors}

| Gördüğünüz | Anlamı | Ne yapmalı |
| ------------ | ------- | ---------- |
| `SVM module is disabled` (kod 11) | Şerit kapalı (ana ağ veya öneri 37'den önceki test ağı) | `enabled` değerini okuyun; yeniden denemeyin |
| `MsgRegisterSVMPQCKey`, `SVM account ... not found` ile reddedildi (codespace `svm`, kod 3) | SVM hesabı henüz yok | Önce hesabı oluşturun, sonra anahtarını kaydedin |
| `MsgRegisterSVMPQCKey` şerit kapalıyken reddedildi | Şerit kapalı | Şerit açıldıktan sonra kaydedin |
| `svm.qore.host` veya `svm-testnet.qore.host` üzerinde yazma yöntemi reddedildi | Herkese açık uç noktalar salt okunurdur | Kendi düğümünüzü kullanın |
| `svm custody cap exceeded` (kod 23) | Havuz üst sınırında | Daha sonra veya daha küçük bir miktarla yeniden deneyin |
| `airdrop rate limit exceeded` (kod 19) | `requestAirdrop` çok sık çağrıldı (yalnızca test ağı) | Bekleyin |
| `blockhash expired` (kod 20) | Yakın zamanlı blok özeti çok eski | Yenisini alın ve yeniden imzalayın |
| `svm simulation slots busy, retry later` (kod 24) | Simülasyonlar sınırlıdır; bir blokta asla oluşmaz | Simülasyonu yeniden deneyin |
| `/qorechain/svm/v1/account/...` üzerinde HTTP 501 | Rota herkese açık uç noktada uygulanmamış | `getAccountInfo` kullanın |

## Test ağında denendi {#tested}

12 Kasım 2026'da `qorechain-diana` üzerinde (sürüm v3.2.8), öneri 37 geçtikten sonra çalıştırıldı.

| Adım | Sonuç |
| ---- | ------ |
| `GET /cosmos/circuit/v1/disable_list` | Yalnızca `/cosmwasm.wasm.v1.MsgStoreCode` |
| `GET /qorechain/svm/v1/params` | `enabled` true; `max_program_size` 10485760, `max_account_data_size` 10485760, `compute_budget_max` 1400000, `lamports_per_byte` 3480, `rent_exemption_multi` 2, `max_cpi` 4, `max_custody_uqor` 10000000000, `max_custody_hard_uqor` 1000000000000, `max_account_excess_uqor` 10000000000 |
| Henüz var olmayan bir SVM adresi için `MsgRegisterSVMPQCKey` | Reddedildi: codespace `svm` kod 3, `SVM account ... not found: SVM account not found`. Hesabın, kuantum sonrası anahtarı kaydedilmeden önce var olması gerekir |

Çalıştırılmadı (UNTESTED): program dağıtımı, program yürütmesi ve SVM hesabı oluşturma.

## Ana ağ {#mainnet}

Ana ağ şimdilik v3.2.6'da kalır ve SVM şeridi kapalıdır; bunu ana ağda etkinleştirmek daha sonraki bir sürüm ve bir yönetişim oylaması gerektirir. Yalnızca test ağına göre plan yapın.

## Ayrıca bakın {#see-also}

* [SVM Geliştirme](/developer-guide/svm-development): şeride genel bakış, JSON-RPC sunucusu ve lamport olarak yerel QOR.
* [Solana Uyumlu JSON-RPC](/api-reference/json-rpc-solana-compatible): yöntem listesi.
* [Kuantum Sonrası İmzalama](/developer-guide/post-quantum-signing): her yerel şerit işleminin ihtiyaç duyduğu hibrit imza.
* [VM'ler Arası Birlikte Çalışabilirlik](/developer-guide/cross-vm-interoperability): SVM, EVM ve QoreChain Native arasındaki çağrılar.
* [Düğüm Operatörleri: v3.2.8 Kontrol Listesi](/developer-guide/node-operators-v328): bir düğümü yükseltmek.
