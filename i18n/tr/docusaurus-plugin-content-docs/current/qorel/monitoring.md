---
slug: /qorel/monitoring
title: QORel İzleme
sidebar_label: İzleme
sidebar_position: 7
---

# İzleme

Sessizce duran bir relayer paketleri beklemede bırakır, bu yüzden izlenmelidir. Bu sayfa QORel'in sunduklarını (Prometheus telemetrisi, isteğe bağlı bir REST uç noktası, günlükler ve komutlar) ve nelere alarm kurulacağını listeler. Önemsediği bir kanal için relayer çalıştıran operatörler içindir.

## Yenilikler {#innovations}

- **Betikle kontrol edilebilen bir kuantum sonrası hazır olma kontrolü.** `qorel keys pqc-status`, `ready_to_relay` alanı yalnızca anahtar zincirde kayıtlı ve yerel anahtarla eşleşiyorsa `true` olan bir JSON nesnesi yazdırır. Bu alana kurulan bir alarm, eksik veya değişmiş bir anahtarı relayer reddedilmeden önce yakalar.
- **Röleyi sessizce durdurmayan hatalar.** Başarısız bir röle veya temizleme denemesinden sonra paket çalışanları çalışmaya devam eder ve her temizleme aralığında yeniden dener; böylece kısa bir hız sınırı, takılı kalmış bir kanal olarak değil günlükte uyarılar olarak görünür.
- **Nedeni olan bir gönderim öncesi kontrol.** Gönderim öncesi kontrol bir işlemi reddettiğinde (anahtar kayıtlı değil, anahtar uyuşmazlığı, sign-bytes sürümü bilinmiyor), hiçbir şey gönderilmez ve neden günlüğe yazılır ve `qorel health-check` tarafından gösterilir.

## Nasıl kullanılır {#how-to-use}

### Telemetri {#telemetry}

Yapılandırmada etkinleştirin:

```toml
[telemetry]
enabled = true
host = '127.0.0.1'
port = 3001
```

Metrikler Prometheus biçiminde `http://127.0.0.1:3001/metrics` adresinde sunulur. Bunlar Hermes metrikleridir; Prometheus sayaçları `_total` sonekiyle gösterir. Grafiğe dökmeye değer olanlar:

| Metrik | Neden |
|---|---|
| `workers` | Türe göre çalışan işçi sayısı; düşüş, bir işçinin durduğu anlamına gelir. |
| `backlog_size`, `backlog_oldest_sequence` | Bir kanalda bekleyen paketler ve hâlâ bekleyen en eski sıra numarası. |
| `wallet_balance` | Relayer'ın her zincirdeki bakiyesi. |
| `receive_packets_confirmed`, `acknowledgment_packets_confirmed`, `timeout_packets_confirmed` | Röleyle iletilen paketler. Birikim büyürken düz bir çizgi, bir durmadır. |
| `client_updates_submitted`, `client_misbehaviours_submitted` | Hafif istemci bakımı ve kötü davranış raporları. |
| `broadcast_errors`, `simulate_errors` | Reddedilen veya simüle edilemeyen işlemler. |
| `ws_reconnect` | WebSocket yeniden bağlantıları; art arda çok sayıda olması kararsız bir uç noktaya işaret eder. |
| `tx_latency_submitted`, `tx_latency_confirmed` | İşlemlerin ne kadar sürdüğü. |

Hermes tam kümeyi [telemetri kılavuzunda](https://hermes.informal.systems/documentation/telemetry/operators.html) belgeler. Dinleyici örnek yapılandırmada `127.0.0.1` üzerindedir; Prometheus toplayıcınızı aynı ana makineye koyun veya `host` değerini bilerek değiştirin.

### Nelere alarm kurulmalı {#alerts}

| Ne | Nerede |
|---|---|
| Süreç ayakta | Telemetri uç noktası yanıt verir |
| Kanallarınızdaki bekleyen paketler ve onaylar | `qorel query packet pending --chain <id> --port transfer --channel <channel>` |
| Her zincirdeki relayer bakiyesi | `qorel keys balance --chain <id>` veya `wallet_balance` |
| Kuantum sonrası anahtar hazır | `qorel keys pqc-status`, `ready_to_relay: true` bildirir |
| İstemci tazeliği | QORel bir istemciyi güvenme süresinin üçte birinde yeniler; bir istemci bunun yaklaşık yarısı kadar süredir güncellenmediyse alarm verin |
| Hatalar | `broadcast_errors` ve `simulate_errors` artıyor |

Anahtar durumu için cron veya bir izleme ajanına uygun küçük bir kontrol:

```bash
qorel --json keys pqc-status --chain qorechain-diana | jq -e '.result.ready_to_relay == true'
```

Anahtar hazır değilse sıfırdan farklı bir kodla çıkar.

### Günlükler {#logs}

`[global]` altında `log_level = 'info'` varsayılandır. systemd paketiyle günlükler journal'a gider:

```bash
journalctl -u qorel -f
```

QORel sign-bytes sürümünü zincirden okuduğunda ve sürüm değiştiğinde `post-quantum sign bytes` ile başlayan bir günlük satırı görünür. Bir uç noktadan gelen `429` yanıtları hakkındaki uyarılar, uç noktanın hız sınırı uyguladığı anlamına gelir; QORel yeniden dener.

### REST uç noktası {#rest}

İsteğe bağlı REST sunucusu (yapılandırmada `[rest]`, örnekte 3000 numaralı port, varsayılan olarak kapalı) relayer'ın durumunu incelemeye açar. Onu `127.0.0.1` adresine bağlı bırakın.

### Elle kontroller {#by-hand}

```bash
qorel health-check
qorel keys pqc-status --chain qorechain-diana
qorel query packet pending --chain qorechain-diana --port transfer --channel channel-0
curl -s https://api-testnet.qore.host/ibc/core/channel/v1/channels
```

## Nasıl erişilir {#how-to-access}

- Telemetri ve REST relayer ana makinesine yereldir; ikisi de siz açmadıkça genel ağın dışındadır.
- `qorel` komutları relayer ile aynı yapılandırma dosyasını okur.
- QoreChain testnet'inin genel REST uç noktası (`https://api-testnet.qore.host`) kanal ve token izi durumunu gösterir; bkz. [Test Ağına Bağlanma](/getting-started/connecting-to-testnet).

## Nerede yayımlanır {#where-published}

İzleme `qorel` ikili dosyasının bir parçasıdır; ayrıca kurulacak bir şey yoktur. Kaynak ve Hermes telemetri kılavuzu: [qorechain/QORel](https://github.com/qorechain/QORel), [hermes.informal.systems](https://hermes.informal.systems).

## Sınırlar ve bilinen sorunlar {#limits}

- **Barındırılan pano yok.** QORel pano veya alarm kuralı sunmaz; bunları yukarıdaki metriklerden oluşturun.
- **Metrik adları Hermes'indir.** QORel 0.1.0'da kuantum sonrası metrik eklemez; bu durum için `keys pqc-status` kullanın.
- **Genel uç noktalarda hız sınırları normaldir.** Tek tek `429` uyarılarına değil, süregelen bir birikime alarm verin.
- **Yalnızca testnet.** Burada anlatılanların hiçbiri bir mainnet kanalına karşı çalıştırılmadı.
