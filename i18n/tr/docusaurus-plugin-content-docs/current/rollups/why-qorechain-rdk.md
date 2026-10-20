---
slug: /rollups/why
title: Neden QoreChain RDK
sidebar_label: Neden QoreChain RDK
sidebar_position: 2
---

# Neden QoreChain RDK

Çoğu rollup geliştirme kiti aynı temanın varyasyonlarıdır: bir temel katmana
yerleşen (settle eden) bir uygulama zinciri başlatmanıza yardımcı olurlar.
QoreChain RDK bunu da yapar ve ayrıca araç setinin değil, QoreChain'in 1.
Katmanı (Layer 1) etrafında inşa edilmiş, QoreChain'e özgü üç yetenek ekler:

- **kuantum sonrası (post-quantum)** bir yerleşim katmanı,
- **zincir üstü AI/RL** danışma temel bileşenleri (QCAI) ve
- zincirler arası VM çağrılarına sahip **üçlü-VM** çalışma zamanı.

:::caution Erken aşama: durum sütununu okuyun
Henüz hiçbir ağda rollup oluşturulmadı (20 Ekim 2026 itibarıyla kontrol edildi).
Aşağıdaki tablo bugün nelerin çalıştığını belirtir; yayınlanmış 0.5.0
istemcilerinin sınırları [RDK 0.5.0 sınırları](/rollups/deploying-a-rollup#rdk-050-limits)
bölümünde toplanmıştır. Yalnızca genel bir optimistic/zk rollup'a ihtiyacınız varsa,
herhangi bir kit işinizi görür; buradaki yetenekler RDK'nın bunun üzerine eklediği
şeylerdir ve TypeScript, Python, Go, Rust ve Java dillerinde sunulur.
:::

| Yetenek | Durum | Neye dayanır |
| --- | --- | --- |
| **Kuantum güvenli yerleşim makbuzları** | 🟡 Erken aşama | Sabitlemeler (anchor), Ana Zincirin kuantum sonrası şeması olan ML-DSA-87 ile imzalanır; henüz sabitleme yok ve 0.5.0 doğrulayıcısı zincir kontrolünü canlı ağlara karşı tamamlayamaz |
| **QCAI Rollup Copilot** | 🟡 Genel uç noktalarda henüz mevcut değil | Genel uç noktaların bugün sunmadığı zincir üstü AI/RL danışma servisleri |
| **Çoklu-VM zincirler arası VM çağrıları** | 🟡 Canlı ağlarda henüz kullanılamaz | Etkinleştirilmemiş bir zincirler arası VM precompile'ı, zincirin yerleşimiyle eşleşmeyen bir 0.5.0 kodlayıcısı ve kapalı CosmWasm yüklemesi |

---

## 1. Kuantum güvenli yerleşim makbuzları

> 🟡 **QoreChain'in kuantum sonrası temel katmanı üzerine kurulu tasarım.**
> Yerleşim sabitlemeleri, Ana Zincirin kullandığı aynı şema olan ML-DSA-87
> (Dilithium-5, FIPS-204) ile imzalanır. Erken aşama: henüz hiçbir ağda
> sabitleme yok.

Rollup oluşturucunuz bir yerleşim yığınını (settlement batch) sabitlediğinde,
sabitleme zincir üstünde kayıtlı kuantum sonrası bir anahtarla imzalanır. RDK, bu
sabitlemeyi **taşınabilir bir makbuz** olarak paketleyebilir ve bir doğrulayıcı,
rollup'ın, yığının, sabitlemenin ve oluşturucunun anahtarının zincirin elindekiyle
eşleştiğini doğrulamak için iddiayı bir QoreChain düğümünden yeniden okur.

```ts
import { createRdkClient, buildSettlementReceipt, verifySettlementReceipt } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const receipt = await buildSettlementReceipt(rdk, "my-rollup", 42);
const result = await verifySettlementReceipt(receipt, { client: rdk });
console.log(result.valid);
```

0.5.0'da `verifySettlementReceipt` zincire karşı kontrol eder ve bir `client` olmadan
`valid` demeyi reddeder; ancak zincir kontrolü canlı ağlara karşı henüz
tamamlanmaz, bu nedenle gerçek bir makbuzu geçerli olarak bildirmek yerine
güvenli biçimde başarısız olur (fail closed). Bir makbuzun neyi kanıtlayıp neyi
kanıtlamadığı ve tam sınırlar için bkz.
[Kuantum güvenli yerleşim makbuzları](/rollups/settlement-receipts).

---

## 2. QCAI Rollup Copilot

> 🟡 **Genel uç noktalarda henüz mevcut değil.**

Copilot, ağın danışma servislerini (bir ücret politikası ajanı, öneriler,
dolandırıcılık soruşturmaları) bir rollup için tek, salt okunur, sade dilde bir
görünümde toplamak üzere tasarlanmıştır. Elden geldiğince çalışır (best-effort):
bir servise erişilemezse, hata vermek yerine bir uyarıya düşer. Bu servisler bugün
genel uç noktalarda sunulmadığından, her bölüm uyarı olarak döner.

```ts
import { createRdkClient, getRollupAdvice } from "@qorechain/rdk";

const rdk = createRdkClient({ network: "testnet" });
const advice = await getRollupAdvice(rdk, "my-rollup");
console.log(advice.warnings); // services that could not be reached
```

CLI üzerinden: `qorollup advise my-rollup`. Bkz. [QCAI Copilot](/rollups/qcai-copilot).

---

## 3. Çoklu-VM zincirler arası VM çağrıları

> 🟡 **Canlı ağlarda henüz kullanılamaz** — precompile etkinleştirilmemiştir ve
> CosmWasm yüklemesi kapalıdır. Bkz. [Çoklu-VM](/rollups/multi-vm).

RDK, bir EVM (Solidity) sözleşmesinden bir **CosmWasm** sözleşmesine yapılan
çağrıyı, `0x…0901` adresindeki sabit bir precompile aracılığıyla kodlayan
yardımcılar içerir. Bu precompile ana ağda (mainnet) ya da testnet'te **etkin
değildir** (bkz. [EVM Precompile'ları: Ağ durumu](/developer-guide/evm-precompiles#network-status)):
`0x…0901` için `eth_getCode` her ikisinde de `0x` döndürür ve ona yapılan bir
sözleşme çağrısı hiçbir etki olmadan başarılı olur.

0.5.0'daki `encodeCrossVmCalldata` yardımcısı `executeCrossVMCall(string,bytes)`
için çağrı verisi (calldata) oluşturur, ancak düğüm
`executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)`
imzasını çözer; dolayısıyla çıktısı zincirin okuduğuyla eşleşmez. Çağrıyı bunun
yerine zincirin yerleşimiyle kodlayın (burada viem ile gösterilmiştir;
`targetVM` 1, desteklenen tek hedef olan CosmWasm'dır):

```ts
import { encodeFunctionData, parseAbi, toHex } from "viem";

const abi = parseAbi([
  "function executeCrossVMCall(uint8 targetVM, string targetContract, bytes payload)",
]);

const calldata = encodeFunctionData({
  abi,
  functionName: "executeCrossVMCall",
  args: [
    1,                                                          // 1 = CosmWasm
    "qor1examplecontract…",                                     // target contract
    toHex(new TextEncoder().encode(JSON.stringify({ increment: {} }))), // its execute message
  ],
});

// Send an EVM transaction:  to = 0x0000000000000000000000000000000000000901,  data = calldata
```

Veya doğrudan rollup'ınızdaki Solidity kodundan:

```solidity
address constant CROSS_VM_PRECOMPILE = 0x0000000000000000000000000000000000000901;

function callCosmWasm(string calldata contractAddr, bytes calldata msg_)
    external returns (bytes memory)
{
    bytes memory data =
        abi.encodeWithSignature("executeCrossVMCall(uint8,string,bytes)", uint8(1), contractAddr, msg_);
    (bool ok, bytes memory ret) = CROSS_VM_PRECOMPILE.call(data);
    require(ok, "cross-VM call failed");
    return ret;
}
```

Bugün tek başına `ok` hiçbir şey kanıtlamaz: precompile'ın kodu olmadığı sürece
çağrı boş veriyle başarı döndürür ve hiçbir şey yürütmez; bu nedenle etkiyi hedef
sözleşme üzerinde doğrulayın.

`npm create qorechain-rollup my-app -- --template multivm-rollup` komutuyla bir
başlangıç projesi iskeleti oluşturun. (Yalnızca EVM↔CosmWasm; SVM zincirler
arası çağrıları ayrıdır.)

---

## Beklediğiniz diğer her şey

Bu yeteneklerin ötesinde, RDK standart özellikleri de içerir: paylaşılan altın
vektörlere (golden vectors) karşı doğrulanmış beş yayımlanmış dil istemcisi, beş
hazır profil ve tam uyumluluk matrisi, yerleşim yığını ve yaşam döngüsü yönetimi,
yerel veri erişilebilirliği (data availability) depolaması (durum notuna bakın),
optimistic rollup'lar için otomatik itiraz eden bir **watchtower** ve `qorollup`
operatör CLI'si.

## Sıradaki

- [Bir Rollup Dağıtmak](/rollups/deploying-a-rollup) — dile göre kurulum ve bir
  testnet rollup'ına giden CLI yolu.
- [Kuantum güvenli yerleşim makbuzları](/rollups/settlement-receipts) ·
  [QCAI Copilot](/rollups/qcai-copilot) ·
  [Çoklu-VM](/rollups/multi-vm) ·
  [Watchtower](/rollups/watchtower) — derinlemesine incelemeler.
