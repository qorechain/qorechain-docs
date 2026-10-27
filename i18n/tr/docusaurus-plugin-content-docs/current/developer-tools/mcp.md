---
slug: /developer-tools/mcp
title: QoreChain MCP Sunucusu
sidebar_label: MCP Sunucusu
sidebar_position: 23
---

# QoreChain MCP sunucusu (`@qorechain/mcp`)

QoreChain MCP sunucusu, yapay zeka ajanlarına ve geliştirici araçlarına [Model Context Protocol](https://modelcontextprotocol.io) üzerinden QoreChain'e okuma erişimi sağlar: bloklar, işlemler, hesaplar, doğrulayıcılar, staking katmanları, hibrit secp256k1 artı ML-DSA-87 (FIPS 204) imzasının durumu, EVM sözleşme okumaları, simülasyon ve ücret tahminleri ve hesap sahibinin kendi cüzdanında imzaladığı imzasız transferler. MCP destekli bir istemciyi veya ajanı QoreChain'e bağlayan geliştiriciler ve zincire kararlı çıktıyla, betiklenebilir, salt okunur bir görünüm isteyen ekipler içindir.

Sunucu asla imzalamaz, asla anahtar tutmaz ve asla bir işlemi yayınlamaz. Makinenizde stdio üzerinden ya da sizin veya QoreChain'in barındırdığı bir Streamable HTTP sunucusu olarak çalışır. Sürüm **0.1.0**, 27 Ekim 2026'da yayınlandı, Apache-2.0. Komut satırı ikizi [`qore`](/developer-tools/qore-cli), aynı araçları bir terminalden çalıştırır.

## Yenilikler {#innovations}

- **Yalnızca bir etiket değil, hibrit imza denetimi.** `get_pq_status` bir işlem karmasını alır, gövdenin tam olarak bir `/qorechain.pqc.v1.PQCHybridSignature` katmanı taşıdığını doğrular ve bu ML-DSA-87 katmanını, imzalayanın zincirde kaydettiği anahtara karşı, imzalanacak bayt biçimleri v1 ve v2'yi deneyerek [QoreSign](/qoresign/overview) ile yerel olarak doğrular. Yanıt, işlem türünden yapılan bir tahmin değil, nedeniyle birlikte `verified: true` veya `false` olur.
- **Gerçek ücreti taşıyan imzasız transferler.** `prepare_transfer`, göndericinin hesap numarasını, sıra numarasını ve açık anahtarını okur, transferi doğru boyutta bir yer tutucu ML-DSA-87 katmanıyla simüle eder; böylece gas, cüzdanın imzalarken eklediği katmanı da içerir ve SignDoc'u, okunabilir bir özeti ve denetimleri döndürür. Eksik olan tek şey sahibin imzasıdır.
- **Çözülmüş ret nedenleriyle simülasyon.** `simulate_tx` ve `estimate_fee`, kullanılan gas'i, önerilen bir gas sınırını, adres başına bakiye değişimini ve ağ işlemi reddedecekse ham bir hata dizesi yerine çözülmüş bir ret nedenini döndürür.
- **Sunucu ve CLI için tek şema.** Her `qore` komutu bir MCP aracını çalıştırır ve `qore --json`, aracın döndürdüğü JSON'un aynısını yazdırır. Python paketi aynı araç adlarını, girdi ve çıktı şemalarını ve hata kodlarını sunar; ikisi de aynı kaydedilmiş zincir yanıtlarına karşı test edilir.
- **Gizli bilgiler, makineden hiçbir şey çıkmadan önce reddedilir.** Kurtarma ifadesine benzeyen girdi (12 veya daha fazla ardışık BIP-39 sözcüğü) ya da çıplak bir 32 baytlık özel anahtar, herhangi bir istek yapılmadan önce `INVALID_INPUT` ile reddedilir ve hata, kullanıcıya o gizli bilgiyi ifşa olmuş saymasını söyler.
- **Alan alan oluşturulan yanıtlar.** Her çıktı, zincirin yanıtındaki adlandırılmış alanlardan derlenir. Üst akış hata gövdeleri ve yığın izleri istemciye asla ulaşmaz; hatalar yedi kararlı hata koduna eşlenir.

## Nasıl kullanılır {#how-to-use}

npm paketi için Node.js 20 veya üzeri, Python paketi için Python 3.10 veya üzeri gerekir.

### npx ile yerel olarak çalıştırın {#run-npx}

Sunucunun başladığını denetleyin, ardından MCP istemcinize ekleyin. Yerel sunucuları başlatan çoğu istemci, bir `mcpServers` nesnesi içeren bir JSON dosyasını okur (dosya adı ve HTTP sunucuları için anahtar adları istemciye göre değişir; istemcinizin belgelerine bakın):

```bash
npx -y @qorechain/mcp --version
```

```json
{
  "mcpServers": {
    "qorechain": { "command": "npx", "args": ["-y", "@qorechain/mcp"] }
  }
}
```

İstemciyi yeniden başlatın. 14 aracı listeler. Sunucu, istemciyle stdio üzerinden konuşur. Ardından, örneğin şunları sorun:

- "QoreChain mainnet üzerindeki son blok nedir?" (`get_block`)
- "F642F59F2A2FEDA2B3A61A3CF49F8B5F792D65985027997004FEBB22A6F42152 testnet işlemi geçerli bir ML-DSA-87 katmanı taşıyor mu?" (`get_pq_status`)
- "Adresimden qor1... adresine 1,5 QOR'luk bir testnet transferi hazırla ve ücreti tahmin et." (`prepare_transfer`, `estimate_fee`)

### pip veya uvx ile yerel olarak çalıştırın {#run-pip}

```bash
pip install qorechain-mcp
qorechain-mcp --network testnet      # stdio
# or, without installing:
uvx qorechain-mcp
```

```json
{ "mcpServers": { "qorechain": { "command": "uvx", "args": ["qorechain-mcp"] } } }
```

Python paketi yalnızca stdio sunar. Streamable HTTP, API anahtarları ve hız sınırları için npm paketini kullanın (aşağıda). Paketin ayrıca bir kitaplık giriş noktası da vardır: `run_tool`.

### HTTP sunucusu olarak çalıştırın {#run-http}

```bash
npx -y @qorechain/mcp serve --port 8787
# listening on http://127.0.0.1:8787/mcp
```

HTTP aktarımı durumsuzdur ve JSON ile yanıt verir: MCP istekleri için `POST /mcp`, `{"status":"ok"}` için `GET /healthz`. Seçenekler:

| Seçenek | Varsayılan | Anlamı |
|---|---|---|
| `--port` | 8787 | TCP portu |
| `--host` | 127.0.0.1 | bağlanma adresi; `0.0.0.0` her arayüzü dinler |
| `--api-keys-file` | yok | kabul edilen anahtarların SHA-256 karmalarını içeren dosya; ayarlandığında istekler `Authorization: Bearer <key>` gerektirir |
| `--rate-limit` | 60 | API anahtarı başına ve istemci IP'si başına dakikadaki istek sayısı; `0` kapatır |
| `--allowed-origin` | yok | uç noktayı çağırmasına izin verilen tarayıcı kaynağı (tekrarlanabilir); diğer kaynaklar HTTP 403 alır |
| `--trust-proxy` | kapalı | istemci IP'sini `X-Forwarded-For` başlığından al; yalnızca denetlediğiniz bir proxy'nin arkasında |
| `--network` | testnet | ağ belirtmeyen çağrılar için ağ |

Kendi uç noktanızı korumak için bir anahtar üretin, yalnızca karmasını saklayın ve anahtarı istemciye verin:

```bash
openssl rand -hex 32 > my.key
npx -y @qorechain/mcp hash-key < my.key >> api-keys.txt
npx -y @qorechain/mcp serve --api-keys-file api-keys.txt
```

`api-keys.txt` dosyasında satır başına bir adet 64 onaltılık karma bulunur (isteğe bağlı bir `sha256:` öneki kabul edilir, `#` bir yorum başlatır). Eksik veya bilinmeyen bir anahtar, `UNAUTHORIZED` ile başlayan bir hata iletisiyle HTTP 401 alır; hız sınırı aşılırsa sunucu `Retry-After` ile HTTP 429 yanıtı verir. Makinenizin dışından erişilebilen her sunucunun önüne TLS koyun.

Paket ayrıca kendi çalışma zamanınıza gömmek için `createServer`, `createHttpHandler` ve `startNodeServer` dışa aktarır. Tüm ayrıntılar: kaynak depodaki [kendi sunucunuzu barındırma](https://github.com/qorechain/qorechain-mcp/blob/main/docs/self-hosting.md) belgesi.

### Yapılandırma {#configuration}

| Ayar | Nasıl | Etki |
|---|---|---|
| Çağrı başına ağ | herhangi bir araçtaki `network` argümanı: `testnet` veya `mainnet` | O çağrı için zinciri seçer |
| Varsayılan ağ | sunucu komutunda `--network testnet` veya `--network mainnet` | Bir çağrı ağ belirtmediğinde kullanılan ağ. Varsayılan `testnet` |
| HTTP portu, ana makine, anahtarlar, sınırlar | yukarıdaki `serve` seçenekleri | Yalnızca HTTP modu |
| Üst akış zaman aşımı | istek başına 10 saniyeye sabit, 4 MiB yanıt sınırı, yeniden deneme yok | Yavaş uç noktalar `UPSTREAM_UNAVAILABLE` verir |

Mainnet `qorechain-vladi` (EVM zincir kimliği 9801), testnet ise `qorechain-diana`'dır (EVM zincir kimliği 9800). Mainnet için hazırlanan bir transfer ek bir uyarı taşır. Ağ için ortam değişkeni yoktur: komut satırı bayrağı veya çağrı başına argüman kullanılır. Bir istemci için mainnet'i varsayılan yapmak için:

```json
{ "command": "npx", "args": ["-y", "@qorechain/mcp", "--network", "mainnet"] }
```

### Araçlar {#tools}

14 aracın tamamı salt okunurdur ve isteğe bağlı bir `network` alır. Girdileri ve çıktıları sunucunun kendi şemalarından üretilir; [araç başvurusu](https://github.com/qorechain/qorechain-mcp/blob/main/docs/tools.md) her alanı listeler.

| Araç | Ne döndürür |
|---|---|
| `get_chain_info` | zincir kimlikleri, son blok, asgari gas fiyatı, imzalanacak bayt sürümü, protokol özellik anahtarları, planlanmışsa bekleyen bir yükseltme, etkin EVM precompile'ları |
| `get_block` | tek bir blok (veya sonuncusu): karma, zaman, öneren, işlem sayısı ve en fazla 100 işlem karması |
| `get_transaction` | yerel karma veya EVM karması (`0x` öneki) ile bir işlem: durum, ücret, not, gas, en fazla 50 mesaj, imzalayanlar ve imza katmanı (`pqc`, `enrollment`, `shake` veya `classical`) |
| `get_address_info` | her iki adres biçimi (`qor1...` ve `0x...`), hesap durumu, en fazla 100 bakiye, stake edilen miktar, bir ML-DSA-87 anahtarının kayıtlı olup olmadığı, bayt kodunun dağıtılıp dağıtılmadığı |
| `get_pq_status` | bir adres için: kayıtlı anahtar, algoritma, sahiplik kanıtı, EVM yetkilendirme penceresi. Bir işlem için: tam olarak bir hibrit katmanı olup olmadığı ve doğrulanıp doğrulanmadığı |
| `get_validators` | stake'e göre doğrulayıcılar (varsayılan bonded, en fazla 50, sınır 200'e kadar): durum, jailed bayrağı, stake, oy gücü payı, komisyon |
| `get_staking_tiers` | staking katmanı modülü: kilit koşulları ve bonuslar, erken kilit açma cezası, bonus havuzu ve isteğe bağlı olarak bir sahibin kilitleri. Zincir v3.2.4 ve sonrası |
| `search` | tek bir dizeden bir blok yüksekliğini, işlem karmasını, adresi veya doğrulayıcıyı algılar, okur ve aynı veriyi döndüren aracı belirtir |
| `read_contract` | yalnızca bir EVM `eth_call`; bir fonksiyon imzasının isteğe bağlı ABI kodlaması ve sonucun çözülmesiyle |
| `estimate_fee` | simüle edilen gas, önerilen gas sınırı ve ücret (gas sınırı çarpı asgari gas fiyatı), ML-DSA-87 katmanı dahil |
| `simulate_tx` | kodlanmış bir işlem için kullanılan gas, önerilen gas sınırı, adres başına bakiye değişimi ve çözülmüş bir ret nedeni |
| `prepare_transfer` | uqor cinsinden imzasız bir `MsgSend`: SignDoc, okunabilir özet, denetimler ve uyarılar |
| `get_token_holders` | her zaman `NOT_AVAILABLE_ON_CHAIN`: sahipleri listelemek, genel uç noktaların sağlamadığı bir indeksleyici gerektirir |
| `request_faucet` | her zaman `NOT_AVAILABLE_ON_CHAIN`: testnet QOR, dashboard üzerindeki [Faucet](/dashboard/faucet) sayfasından alınır |

Hatalar, `isError: true` taşıyan araç sonuçlarıdır ve gövdeleri `{"error": {"code", "message", "details?"}}` biçiminde bir JSON'dur. Kodlar `NOT_FOUND`, `INVALID_INPUT`, `UPSTREAM_UNAVAILABLE`, `NOT_AVAILABLE_ON_CHAIN`, `RATE_LIMITED`, `UNAUTHORIZED` ve `INTERNAL_ERROR`'dır.

### Ne çalıştırıldı {#what-was-run}

27 Ekim 2026'da yayınlanan paketler kayıt defterlerinden kuruldu ve genel testnet ile mainnet uç noktalarına karşı çalıştırıldı:

- `qorechain-mcp --version` çıktısı `0.1.0` oldu; stdio üzerinden `initialize` sunucu adı `qorechain-mcp` değerini, `tools/list` ise yukarıdaki 14 araç adını döndürdü; `pip install qorechain-mcp==0.1.0` kuruldu ve `--version` çıktısı `0.1.0` oldu.
- `qorechain-mcp serve --port 18787`, `GET /healthz` isteğine `{"status":"ok"}` ile ve `POST /mcp` üzerinden `get_chain_info` için bir `tools/call` isteğine yanıt verdi.
- `get_chain_info`, testnet'te zincir `qorechain-diana`, EVM zincir kimliği 9800, asgari gas fiyatı 0,1 uqor ve imzalanacak bayt `v2` değerini; mainnet'te ise zincir `qorechain-vladi`, EVM zincir kimliği 9801 ve imzalanacak bayt `v2` değerini döndürdü.
- Yukarıdaki testnet işlemi üzerinde `get_pq_status`, katman `pqc`, tam olarak bir hibrit katman ve imzalanacak bayt `v2` ile `verified: true` döndürdü.
- Testnet'te 1,5 QOR için `prepare_transfer`, gas sınırı 171698 ve ücreti 17170 uqor (0,01717 QOR) olan bir SignDoc döndürdü; imzasız işlemi üzerinde `simulate_tx` ise ücret göndericiden düşülerek `ok: true` döndürdü. Hiçbir şey imzalanmadı veya gönderilmedi.

## Nasıl erişilir {#how-to-access}

- **Yerel (birincil seçenek).** `npx -y @qorechain/mcp` veya `uvx qorechain-mcp` ile stdio. Hesap veya API anahtarı gerekmez. Genel QoreChain uç noktalarını okur, bu yüzden giden HTTPS gerekir.
- **Kendi HTTP sunucunuz.** Yukarıdaki gibi `qorechain-mcp serve`, yapılandırdığınız API anahtarları ve hız sınırlarıyla.
- **Barındırılan uç nokta.** `https://mcp.qorechain.io/mcp`, Streamable HTTP aktarımını sunar. Bir çağrı `"network": "mainnet"` belirtmedikçe testnet kullanır. Her istek, `Authorization: Bearer <key>` olarak gönderilen bir API anahtarı gerektirir; anahtarlar talep üzerine verilir. Anahtar olmadan uç nokta HTTP 401 (`UNAUTHORIZED`) yanıtı verir; 27 Ekim 2026'daki yanıt buydu. Barındırılan uç nokta hız sınırlarını anahtar başına uygular. Çoğu kullanım için yerel kurulum anahtar gerektirmez ve daha basit seçimdir.

Anahtar gerektiren bir sunucu için HTTP istemci yapılandırması (tam anahtar adları istemciye göre değişir):

```json
{
  "mcpServers": {
    "qorechain": {
      "type": "http",
      "url": "https://mcp.qorechain.io/mcp",
      "headers": { "Authorization": "Bearer ${QORECHAIN_MCP_KEY}" }
    }
  }
}
```

Bir istemci yapılandırmasına asla kurtarma ifadesi veya özel anahtar koymayın: hiçbir QoreChain aracı buna ihtiyaç duymaz.

Sunucu şu genel uç noktalardan okur:

| | Testnet | Mainnet |
|---|---|---|
| REST | `https://api-testnet.qore.host` | `https://api.qore.host` |
| Konsensüs RPC | `https://rpc-testnet.qore.host` | `https://rpc.qore.host` |
| EVM JSON-RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |

Maliyet: sunucu ücretsizdir. Okumalar hiçbir şeye mal olmaz. `prepare_transfer` ile oluşturulan bir işlemi yayınlarsanız ağ ücreti uygulanır (ücret tabanı gas başına 0,1 uqor'dur).

## Nerede yayınlandı {#where-published}

| Kayıt defteri | Paket | Sürüm | Çalıştırma | Notlar |
|---|---|---|---|---|
| npm | [`@qorechain/mcp`](https://www.npmjs.com/package/@qorechain/mcp) | 0.1.0 | `npx -y @qorechain/mcp` | Bin `qorechain-mcp`. stdio ve Streamable HTTP. Node.js 20 veya üzeri |
| PyPI | [`qorechain-mcp`](https://pypi.org/project/qorechain-mcp/) | 0.1.0 | `pip install qorechain-mcp` veya `uvx qorechain-mcp` | Yalnızca stdio. Python 3.10 veya üzeri |
| npm | [`@qorechain/qore-cli`](https://www.npmjs.com/package/@qorechain/qore-cli) | 0.1.0 | `npm install -g @qorechain/qore-cli` | `qore` komutu. Bkz. [QoreChain CLI](/developer-tools/qore-cli) |

Kaynak: [github.com/qorechain/qorechain-mcp](https://github.com/qorechain/qorechain-mcp) (genel, Apache-2.0, 27 Ekim 2026'da kontrol edildi). Depo; sunucuyu, CLI'ı, Python paketini, araç başvurusunu, kendi sunucunuzu barındırma notlarını, örnek istemci yapılandırmalarını ve üç ajan beceri dosyasını içerir. Yayınlanmış bir kapsayıcı imajı yoktur; `npx` veya `pip` kullanın.

## Sınırlar ve bilinen sorunlar {#limits}

- **Salt okunur.** İmzalama kod yolu, anahtar depolama ve yayınlama yoktur. `prepare_transfer` imzasız bir belge döndürür. Bir transferi tamamlamak için onu [QoreSign](/qoresign/overview) veya QoreX cüzdanı ile imzalayın ve kendiniz yayınlayın; ardından sonucu `get_transaction` ile okuyun. `read_contract` yalnızca `eth_call` kullanır ve durumu değiştiremez.
- **Tek bir işlem türü hazırlanır.** `prepare_transfer`, uqor cinsinden native lane `MsgSend` oluşturur. EVM, SVM, staking, yönetişim veya sözleşme işlemleri oluşturmaz. `estimate_fee` ve `simulate_tx`, kodlanmış herhangi bir native lane işlemini kabul eder.
- **Gas rakamları ağa göre farklıdır.** Testnet (v3.2.6) simülasyonu ML-DSA-87 doğrulama maliyetini zaten içerir, bu yüzden gas kesindir. Mainnet (v3.2.4) simülasyonu içermez, bu yüzden önerilen gas sınırı bir pay taşır (`exact_gas_simulation` mainnet'te false'tur).
- **Testnet geçmişi budanır.** Eski bir testnet bloğu `NOT_FOUND` döndürür ve hata, mevcut en düşük yüksekliği belirtir (kontrol edildiğinde testnet'te 8.790.799; mainnet 1. yükseklikten itibaren sunuluyordu). `get_pq_status`, bir katmanı şu anda kayıtlı olan anahtara karşı denetler; bu yüzden bir anahtar rotasyonundan sonra eski işlemler artık eşleşmez.
- **EVM kuantum sonrası precompile'lar.** `0x...0A01` (ML-DSA-87 doğrulama) ve `0x...0A02` (anahtar durumu) yalnızca testnet'te etkindir; mainnet'te onlara yapılan bir çağrı boş veri döndürür.
- **Sınırlar.** Her üst akış isteğinin 10 saniyelik bir zaman aşımı ve 4 MiB'lık bir yanıt sınırı vardır, yeniden deneme yoktur. Bloklar en fazla 100 işlem karması, işlemler en fazla 50 mesaj, hesaplar en fazla 100 bakiye listeler. HTTP istek gövdeleri 512 KiB ile sınırlıdır. Bir not en fazla 256 karakterdir ve herkese açık ve kalıcıdır, bu yüzden içine asla bir gizli bilgi koymayın. Kendi barındırdığınız bir sunucunun hız sınırı örnek başınadır ve bellekte tutulur; bir yük dengeleyicinin arkasında her örnek kendi başına sayar.
- **Kullanılamayan:** `get_token_holders` (genel uç noktalarda indeksleyici yok) ve `request_faucet` (oturum açmayı gerektiren dashboard faucet'ini kullanın). Barındırılan uç nokta bir API anahtarı gerektirir ve anahtarlar talep üzerine verilir; yerel kurulum gerektirmez.
- **Mainnet açıkça belirtilir.** Çağrılar, `"network": "mainnet"` belirtmedikçe veya sunucu `--network mainnet` ile başlatılmadıkça testnet'e gider.
- **Kapsayıcı imajı yayınlanmamıştır.** Sunucuyu `npx` veya `pip` ile çalıştırın.
- **Sürüm.** 0.1.0 ilk sürümdür; araç adları ve şemalar sonraki sürümlerde değişebilir ve depodaki üretilmiş `spec/tools.json`, kurduğunuz sürüm için başvuru kaynağıdır.

İlgili sayfalar: [Geliştirici paketlerine genel bakış](/developer-tools/overview), [QoreChain CLI](/developer-tools/qore-cli), [QoreSign](/qoresign/overview), [dashboard'daki Geliştiriciler sayfası](/dashboard/developers#mcp).
