---
slug: /developer-tools/qore-cli
title: QoreChain CLI (qore)
sidebar_label: QoreChain CLI
sidebar_position: 24
---

# QoreChain CLI (`@qorechain/qore-cli`, komut `qore`)

`qore`, QoreChain'i terminalden okur. Kod yazmadan bir işlemi aramak, kuantum sonrası imzasının doğrulanıp doğrulanmadığını denetlemek, bir hesabı veya doğrulayıcı kümesini okumak, bir işlemi simüle etmek ya da imzasız bir transfer hazırlamak isteyen geliştiriciler, operatörler ve betikler içindir. Her komut, [QoreChain MCP sunucusunun](/developer-tools/mcp) bir aracını çalıştırır ve `--json`, aracın döndürdüğü JSON'un aynısını yazdırır; böylece bir betik ve bir yapay zeka ajanı aynı veriyi görür.

Hiçbir şey asla imzalanmaz veya yayınlanmaz ve CLI anahtar tutmaz. Sürüm **0.1.0**, 27 Ekim 2026'da yayınlandı, Apache-2.0, Node.js 20 veya üzeri.

## Yenilikler {#innovations}

- **MCP aracının çıktısıyla aynı JSON.** `qore <command> --json`, eşleşen MCP aracının döndürdüğü nesnenin aynısını, aynı alan adlarıyla yazdırır. `--json` olmadan aynı nesne okunabilir metin olarak yazdırılır. Birine karşı yazılmış bir betik ötekine karşı da çalışır.
- **Terminalden kuantum sonrası durum.** `qore pq status <txhash>`, işlemin tam olarak bir hibrit katman taşıyıp taşımadığını ve ML-DSA-87 (FIPS 204) imzasının, imzalayanın zincirde kaydettiği anahtara karşı imzalanacak bayt v1 ve v2 için doğrulanıp doğrulanmadığını bildirir. `qore pq status <address>`, kayıtlı anahtarı, türünü, sahiplik kanıtını ve EVM yetkilendirme penceresini bildirir.
- **Anahtar gerektirmeyen bir transfer hattı.** `prepare-transfer --json` imzasız bir transfer yazar ve `simulate` bu dosyayı kabul eder; böylece bir kabuk betiğinden bir transferi oluşturabilir, denetleyebilir ve fiyatlandırabilirsiniz. İmzalama adımı cüzdanınızda veya [QoreSign](/qoresign/overview) içinde kalır.
- **Kararlı çıkış kodları.** 0 başarıdır, 1 `NOT_FOUND` veya `INVALID_INPUT` gibi kararlı bir kod taşıyan bir araç hatasıdır ve 2 bir kullanım hatasıdır; böylece bir betik sonuca göre dallanabilir.

## Nasıl kullanılır {#how-to-use}

Kurmadan çalıştırın ya da bir kez kurun:

```bash
npx -y @qorechain/qore-cli chain
npm install -g @qorechain/qore-cli
qore --version
```

Komutlar salt okunurdur ve varsayılan olarak testnet kullanır:

```bash
# the latest block, and the chain info
qore block
qore chain

# is this testnet transaction hybrid-signed, and does the ML-DSA-87 layer verify?
qore pq status F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152

# an account on mainnet, as JSON
qore account qor1... --network mainnet --json

# the top bonded validators
qore validators --limit 3

# an unsigned transfer, then its simulation (nothing is signed or sent)
qore prepare-transfer --from qor1... --to qor1... --amount 1.5 --json > transfer.json
qore simulate transfer.json
qore estimate-fee --from qor1... --to qor1... --amount 1.5
```

Tutarlar `1.5` veya `1.5 QOR` (QOR, en fazla 6 ondalık) ya da `1500000uqor` biçimindedir. Adresler `qor1...` veya `0x...` olabilir.

### Komutlar {#commands}

| Komut | MCP aracı | Ne yapar |
|---|---|---|
| `chain`, `features` | `get_chain_info` | zincir kimlikleri, son blok, asgari gas fiyatı, imzalanacak bayt sürümü, protokol özellik anahtarları, etkin EVM precompile'ları |
| `block [height]` | `get_block` | tek bir blok, varsayılan olarak sonuncusu |
| `tx get <hash>` | `get_transaction` | yerel veya EVM karması ile bir işlem: durum, ücret, mesajlar, imzalayanlar, imza katmanı |
| `account <address>` | `get_address_info` | bakiyeler, hesap durumu, stake edilen miktar, her iki adres biçimi |
| `pq status <address\|txhash>` | `get_pq_status` | bir adres için ML-DSA-87 anahtar durumu veya bir işlem için hibrit katman denetimi |
| `validators [--status S] [--limit N]` | `get_validators` | stake'e göre doğrulayıcılar; durum `bonded` (varsayılan), `unbonding`, `unbonded` veya `all`; sınır 200'e kadar |
| `staking-tiers [--holder A]` | `get_staking_tiers` | staking katmanı parametreleri ve havuzu ile bir sahibin kilitleri (zincir v3.2.4 ve sonrası) |
| `search <query>` | `search` | bir yüksekliği, karmayı, adresi veya doğrulayıcıyı algılar ve okur |
| `read-contract --to 0x.. (--data 0x.. \| --function "f(address)" --arg V) [--returns T]` | `read_contract` | yalnızca bir EVM `eth_call`, isteğe bağlı kodlama ve çözmeyle |
| `simulate <txfile.json\|base64> [--no-pqc-placeholder]` | `simulate_tx` | kodlanmış bir işlem için gas, bakiye değişimleri ve çözülmüş bir ret nedeni |
| `estimate-fee (<txfile.json\|base64> \| --from A --to B --amount X)` | `estimate_fee` | önerilen gas sınırı ve ücret, ML-DSA-87 katmanı dahil |
| `prepare-transfer --from A --to B --amount X [--memo M] [--gas-limit N]` | `prepare_transfer` | cüzdanınızın imzalaması için imzasız bir transfer |

Genel seçenekler: `--network testnet|mainnet` (varsayılan `testnet`), `--json`, `--timeout <ms>` (üst akış zaman aşımı, varsayılan 10000), `--help` ve `--version`. Araç şemaları [MCP araç başvurusunda](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) bulunur.

### Ne çalıştırıldı {#what-was-run}

27 Ekim 2026'da `@qorechain/qore-cli` 0.1.0 ve `@qorechain/mcp` 0.1.0 npm'den boş bir projeye kuruldu ve şu salt okunur komutlar genel uç noktalara karşı çalıştırıldı:

- `qore --version` çıktısı `0.1.0` oldu ve `qore --help` yukarıdaki komutları listeledi.
- `qore chain` (testnet) zincir `qorechain-diana`, EVM zincir kimliği 9800, asgari gas fiyatı 0.1 ve imzalanacak bayt `v2` yazdırdı; `qore chain --network mainnet` ise zincir `qorechain-vladi`, EVM zincir kimliği 9801 ve imzalanacak bayt `v2` yazdırdı.
- `qore block`, `qore validators --limit 3 --json`, `qore staking-tiers --json`, `qore search 8981000`, `qore account qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08` ve `qore read-contract --to 0x...0a02 --function "x()"` verilerini döndürdü.
- `qore pq status F642F59F...2152` katman `pqc`, `has_exactly_one_pqc_layer: true` ve imzalanacak bayt `v2` ile `verified: true` yazdırdı.
- `qore prepare-transfer --from A --to A --amount 1.5 --json` imzasız bir transfer yazdı (gas sınırı 171698, ücret 17170 uqor), o dosya üzerinde `qore simulate` `ok: true` döndürdü ve `qore estimate-fee` eşleşen bir ücret döndürdü. Gönderen ve alıcı aynı adresti, bu yüzden araç bir uyarı ekledi ve hiçbir şey imzalanmadı veya gönderilmedi.
- `qore tx get zzz` `error [INVALID_INPUT]` yazdırdı ve 1 ile çıktı; `qore bogus` 2 ile çıktı.

## Nasıl erişilir {#how-to-access}

- **Ağlar.** Testnet `qorechain-diana` (varsayılan) ve `--network mainnet` ile mainnet `qorechain-vladi`.
- **Uç noktalar.** CLI genel REST, RPC ve EVM JSON-RPC uç noktalarını okur: testnet'te `https://api-testnet.qore.host`, `https://rpc-testnet.qore.host` ve `https://evm-testnet.qore.host`, mainnet'te ise `https://api.qore.host`, `https://rpc.qore.host` ve `https://evm.qore.host`.
- **Hesap ve anahtarlar.** Yok. Oturum açma, API anahtarı ve yapılandırma dosyası yoktur; barındırılan MCP uç noktasının anahtarı CLI için geçerli değildir.
- **Önkoşullar.** Node.js 20 veya üzeri ve giden HTTPS.
- **Maliyet.** Ücretsiz. Hazırladığınız transferi göndermek için ağ ücretini (taban gas başına 0,1 uqor) kendi cüzdanınızdan ödersiniz; CLI bu adımı yapmaz.

## Nerede yayınlandı {#where-published}

| Kayıt defteri | Paket | Sürüm | Kurulum | Notlar |
|---|---|---|---|---|
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | Bin `qore`. Node.js 20 veya üzeri |

Kaynak: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp), `packages/cli` klasörü (genel, Apache-2.0, 27 Ekim 2026'da kontrol edildi). CLI'ın Python veya Rust derlemesi yoktur; sunucunun kendisi ayrıca PyPI'da [`qorechain-mcp`](/developer-tools/mcp#where-published) olarak bulunur.

## Sınırlar ve bilinen sorunlar {#limits}

- **Salt okunur.** Hiçbir komut imzalamaz veya yayınlamaz. `prepare-transfer` yalnızca uqor cinsinden native lane `MsgSend` oluşturur; EVM, SVM, staking, yönetişim veya sözleşme işlemleri hazırlamaz. `simulate` ve `estimate-fee`, kodlanmış herhangi bir native lane işlemini kabul eder.
- **Faucet ve token sahibi listesi yok.** Bu iki MCP aracının CLI komutu yoktur. Testnet QOR, [Faucet](/dashboard/faucet) sayfasından alınır.
- **Testnet geçmişi budanır.** Eski bir testnet bloğu veya işlemi, mevcut en düşük yükseklikle birlikte `NOT_FOUND` döndürür; mainnet, kontrol edildiğinde 1. yükseklikten itibaren sunuluyordu.
- **Gas rakamları ağa göre farklıdır.** Testnet simülasyonu ML-DSA-87 doğrulama maliyetini zaten içerir; mainnet simülasyonu içermez, bu yüzden önerilen gas sınırı bir pay taşır.
- **Çıktı sınırları.** Blok başına en fazla 100 işlem karması, işlem başına 50 mesaj, hesap başına 100 bakiye, çağrı başına 200 doğrulayıcı. Her isteğin varsayılan 10 saniyelik bir zaman aşımı, 4 MiB'lık bir yanıt sınırı vardır ve yeniden deneme yoktur.
- **Gizli bilgiler reddedilir.** Kurtarma ifadesine veya çıplak bir özel anahtara benzeyen girdi `INVALID_INPUT` ile reddedilir. Birini komut satırına koymayın: kabuk geçmişi onu saklar.
- **EVM kuantum sonrası precompile'ları** `0x...0A01` ve `0x...0A02` yalnızca testnet'te etkindir.
- **İlk sürüm.** 0.1.0: komut adları ve seçenekler sonraki sürümlerde değişebilir. Betikler için `--json` ve çıkış kodlarını kullanın ve sürümü sabitleyin.

İlgili sayfalar: [QoreChain MCP sunucusu](/developer-tools/mcp), [Geliştirici paketlerine genel bakış](/developer-tools/overview), [SDK CLI başvurusu](/sdk/reference/cli), [Faucet](/dashboard/faucet).
