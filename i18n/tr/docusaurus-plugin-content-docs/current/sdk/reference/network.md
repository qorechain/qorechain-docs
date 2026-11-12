---
slug: /sdk/reference/network
title: Ağ ve Uç Noktalar
sidebar_label: Ağ ve Uç Noktalar
sidebar_position: 1
---

# Ağ ve uç nokta referansı

## Mainnet

| Alan | Değer |
| --- | --- |
| Ağ ön ayarı | `mainnet` |
| Chain id | `qorechain-vladi` (7 Haziran 2026'dan beri yayında) |
| Zincir sürümü (4 Kasım 2026) | v3.2.6 (4.020.000 yüksekliğinden beri, 4 Kasım 2026, yönetişim önerisi 15; v3.2.5, 29 Ekim'de 3.906.833 yüksekliğinde ve v3.2.4 23 Ekim'de 3.742.566 yüksekliğinde uygulanmıştı). SDK 0.12.0 v3.2.5 için istemcidir ve v3.2.6 üzerinde çalışır (imzalama biçimi değişmedi); 0.10.0, v3.2.4 için istemciydi |
| EVM zincir kimliği | `9801` |
| Görünen token | `QOR` |
| Temel denominasyon | `uqor` |
| QOR başına temel birim | `10^6` |
| Hesap bech32 öneki | `qor` |
| Doğrulayıcı bech32 öneki | `qorvaloper` |

## Testnet

| Alan | Değer |
| --- | --- |
| Ağ ön ayarı | `testnet` |
| Chain id | `qorechain-diana` (yayında) |
| Zincir sürümü | v3.2.8 (9.929.500 yüksekliğinden beri, 12 Kasım 2026, yönetişimle uygulandı; mainnet'te yoktur ve onun için bir tarih yoktur. v3.2.7 6 Kasım'da 9.594.600 yüksekliğinde uygulandı; v3.2.6 27 Ekim'de 8.970.638 yüksekliğinde, v3.2.5 26 Ekim'de 8.890.800 yüksekliğinde ve v3.2.4 19 Ekim'de 8.337.253 yüksekliğinde uygulandı) |
| EVM zincir kimliği | `9800` |
| Görünen token | `QOR` |
| Temel denominasyon | `uqor` |
| QOR başına temel birim | `10^6` |
| Hesap bech32 öneki | `qor` |
| Doğrulayıcı bech32 öneki | `qorvaloper` |

## Genel uç noktalar {#public-endpoints}

| Uç nokta | Mainnet (`qorechain-vladi`) | Testnet (`qorechain-diana`) |
| --- | --- | --- |
| Cosmos REST (LCD) | `https://api.qore.host` | `https://api-testnet.qore.host` |
| Consensus RPC | `https://rpc.qore.host` | `https://rpc-testnet.qore.host` |
| EVM JSON-RPC (`eth_*`) | `https://evm.qore.host` (zincir kimliği 9801) | `https://evm-testnet.qore.host` (zincir kimliği 9800) |
| EVM WebSocket | — | `wss://evm-ws-testnet.qore.host` |
| SVM JSON-RPC (salt okunur) | `https://svm.qore.host` | `https://svm-testnet.qore.host` |

EVM uç noktaları `eth_`, `net_`, `web3_` ve `txpool_` sunar; `qor_` ad alanı
etkin değildir. Ayrıca bkz. [Ağlar](/appendix/networks#public-endpoints).

SDK 0.12.0'dan itibaren `mainnet` ve `testnet` hazır ayarları varsayılan olarak bu REST, consensus RPC ve
EVM JSON-RPC URL'lerini (ve testnet EVM WebSocket'ini) kullanır. Hazır ayarlar, yukarıdaki salt okunur SVM URL'leri mevcut olsa da
**hiçbir** gRPC uç noktası ve **hiçbir** SVM uç noktası belirlemez
(SVM işlemleri açık değildir): bunlardan birine ihtiyaç duyan kod, geçirilecek uç noktayı
adlandıran bir hatayla başarısız olur. Testnet uç noktaları IP başına hız sınırlıdır; üretim trafiği için kendi
düğümünüzü çalıştırın veya kullanın. 0.12.0 öncesinde her hazır ayar varsayılan olarak
localhost kullanıyordu.

### Bir istemci için önemli olan yalnızca-testnet farkları {#testnet-only}

Testnet bir hazırlık (staging) ağıdır ve mainnet'in önünde çalışır; bu nedenle orada okuyabileceğiniz birkaç şey mainnet'te yoktur (27 Ekim 2026'da kontrol edildi; tam liste [Testnet ve mainnet arasındaki farklar](/appendix/chain-parameters#testnet-differences) sayfasındadır):

* **REST rotaları.** `GET /qorechain/rlconsensus/v1/{agent,params,observation,reward,policy,applied_params,last_action}`, `GET /qorechain/pqc/v1/params` ve `GET /qorechain/crossvm/v1/params` testnet'te yanıt verir. Mainnet bunlara zincir v3.2.6'ya kadar HTTP 501 yanıtı verdi; v3.2.6'yı uyguladığından beri (4 Kasım 2026) o gün kontrol edildiğinde bu rotaların hepsi mainnet'te HTTP 200 yanıtı verdi. `/qorechain/amm/v1/` altındaki AMM rotaları (`pools`, `params`) her iki ağda da yanıt verir.
* **Test tokenleri.** Değeri olmayan üç token yalnızca testnet'te vardır; `erc20:<EIP-55 contract address>` adlı (büyük/küçük harfe duyarlı) bank birimleri olarak: fUSD (6 ondalık), fETH (18) ve fBTC (8). `GET https://api-testnet.qore.host/cosmos/bank/v1beta1/denoms_metadata` bunları listeler. Mainnet'in tek bank birimi `uqor`'dur. Bkz. [Testnet test tokenleri (Fest)](/api-reference/rest-grpc-endpoints#fest-tokens).
* **Zincir v3.2.7 rotaları.** 7 Kasım 2026'da testnet, `GET /qorechain/pqc/v1/multisig/{address}` (çoklu imzası olmayan bir adres için `{"found":false,"multisig":null}`), `GET /qorechain/stakingtier/v1/apr`, `GET /qorechain/stakingtier/v1/apr/{delegator}`, `GET /qorechain/stakingtier/v1/pool` ve `GET /qorechain/svm/v1/cluster_info` için HTTP 200 yanıtı verdi; mainnet, `/qorechain/stakingtier/v1/pool` (200) dışındaki hepsi için HTTP 501 yanıtı verdi. `GET /qorechain/pqc/v1/textual_sign_doc` her iki herkese açık uç noktada da 501 yanıtı verdi, bu yüzden kullanılabilir olarak belgelenmemiştir. SDK 0.12.0'da bunların hiçbiri için bir oluşturucu veya tipli istemci yoktur.
* **Açık modüller.** `abstractaccount` modülü testnet'te etkin, mainnet'te kapalıdır; testnet'te EVM precompile'ları etkindir (27 Ekim'de üç, 4 Kasım'da dört), mainnet'te hiçbiri değildir ve QoreChain Native instantiate testnet'te açıktır.

## Varsayılan portlar (`localnet` hazır ayarı) {#default-ports}

`localnet` hazır ayarı (zincir kimliği `qorechain-devnet`, EVM zincir kimliği ayarlanmamış) bu
localhost portlarını kullanır; kendi makinenizdeki bir düğüm içindir. SDK 0.12.0 öncesinde her hazır ayar
varsayılan olarak bunları kullanıyordu; 0.12.0'dan beri yalnızca `localnet` kullanır. Başka bir düğüme
işaret etmek için `endpoints` parametresini geçersiz kılın.

| Uç nokta | Port | Amaç |
| --- | --- | --- |
| Cosmos REST (LCD) | `1317` | bank bakiyeleri, hesap bilgisi, modül sorguları |
| gRPC | `9090` | gRPC sorguları |
| Consensus RPC | `26657` | yerel tx'leri imzalama/yayınlama, QoreChain Native okumaları |
| EVM JSON-RPC | `8545` | `eth_*` (ve bunları etkinleştiren düğümlerde `qor_*` / precompile'lar) |
| EVM JSON-RPC (WS) | `8546` | EVM WebSocket abonelikleri |
| SVM JSON-RPC | `8899` | Solana uyumlu RPC |

```ts
const local = createClient({ network: "localnet" }); // a node on this machine
```

Açık uç noktalarla örnek:

```ts
import { createClient } from "@qorechain/sdk";

const client = createClient({
  endpoints: {
    rest: "https://api-testnet.qore.host",        // REST (LCD)
    rpc: "https://rpc-testnet.qore.host",         // consensus RPC
    evmRpc: "https://evm-testnet.qore.host",      // EVM JSON-RPC (eth_*)
    evmWs: "wss://evm-ws-testnet.qore.host",      // EVM WebSocket
  },
});
```

SDK, ağ ön ayarlarını ve arama yardımcılarını (networks modülünden dışa
aktarılır) sunar, böylece ağları programatik olarak listeleyebilir ve
çözümleyebilirsiniz. Python/Go/Rust'ta eşdeğerleri `create_client` /
`CreateClient` / `ClientBuilder` ile birlikte `networks` modülüdür.

## Mainnet'i hedefleme

Hedeflemek için `mainnet`'i seçin. SDK 0.12.0'dan itibaren hazır ayar genel
URL'leri zaten taşır; bu yüzden aşağıdaki uç noktalar varsayılanlardır; `endpoints` parametresini yalnızca kendi düğümünüz için geçirin
(0.12.0 öncesi bir SDK varsayılan olarak localhost kullanır ve bunlara ihtiyaç duyar):

```ts
const main = createClient({
  network: "mainnet",       // chain id qorechain-vladi
  endpoints: {
    rest: "https://api.qore.host",
    rpc: "https://rpc.qore.host",
    evmRpc: "https://evm.qore.host",
  },
});
```
