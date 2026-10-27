---
slug: /qorel/running-next-to-a-validator
title: QORel'i bir doğrulayıcının yanında çalıştırma
sidebar_label: Doğrulayıcının yanında
sidebar_position: 6
---

# QORel'i bir doğrulayıcının yanında çalıştırma

Doğrulayıcılar çoğu zaman kendi zincirlerinin kanallarını röleler. QORel doğrulayıcı ana makinesinde, bir sidecar container olarak veya Kubernetes'te çalışabilir. Bu sayfa üç düzeni ve relayer'ı doğrulayıcının kendi anahtarlarından yalıtılmış tutan kuralları verir. Doğrulayıcı ve düğüm operatörleri içindir. Düğümün kendisini çalıştırmak için [Doğrulayıcı Çalıştırma](/developer-guide/running-a-validator) ve [Düğüm Çalıştırma](/developer-guide/running-a-node) sayfalarına bakın.

Röle bugün yalnızca testnet içindir: QORel `qorechain-diana`'ya karşı çalıştırıldı ve açık bir mainnet IBC kanalı yok.

## Yenilikler {#innovations}

- **Pakette sertleştirilmiş bir servis.** `.deb` ve `.rpm`, kendi `qorel` kullanıcısı olarak, `0077` umask, yeni ayrıcalık yok, özel bir `/tmp`, `/var/lib/qorel` dışında salt okunur bir dosya sistemi ve çekirdek dökümü olmadan çalışan bir `qorel.service` kurar.
- **İsterseniz anahtarlar yalnızca bellekte.** Kubernetes düzeni, anahtarları pod başlangıcında bir secret'tan bellek destekli bir birime yeniden oluşturur; böylece anahtar dosyaları diske hiç dokunmaz.
- **Yalnızca sahibin okuyabildiği anahtar dosyaları.** Kuantum sonrası seed dahil anahtar dosyaları 0600 kipindedir.
- **Alarm kurabileceğiniz kontroller.** `qorel keys pqc-status` `ready_to_relay` değerini bildirir ve gönderim öncesi kontrol, reddedilecek bir işlemi ücret harcanmadan önce durdurur.

## Nasıl kullanılır {#how-to-use}

### Temel kurallar {#ground-rules}

- **Özel bir relayer hesabı kullanın.** Asla doğrulayıcı operatör anahtarı ve asla konsensüs anahtarı değil. Ona, relayer'ın ücretler için ihtiyaç duyduğu kadarını yükleyin.
- **Relayer anahtarı başına bir relayer süreci.** Aynı anahtarla imzalayan iki süreç hesap sıra numaraları için çekişir.
- **Yalnızca kendi kanallarınızı röleleyin.** Bir `packet_filter` ayarlayın.
- **QORel'i yerel düğüme yöneltin.** `http://127.0.0.1:26657`, `http://127.0.0.1:9090` ve `ws://127.0.0.1:26657/websocket` kullanın ve bu portları internete kapalı tutun. Bu aynı zamanda relayer'a genel olarak bulunmayan gRPC uç noktasını da verir.
- **QoreChain'de**, relayer'ın kuantum sonrası anahtarını `qorel keys register-pqc` ile bir kez kaydedin ve başlatmadan önce `qorel keys pqc-status` komutunu kontrol edin.

### 1. Doğrulayıcı ana makinesinde systemd {#systemd}

1. `.deb` veya `.rpm` paketini kurun ([Kurulum](/qorel/install#packages)). Doğrulayıcının kullanıcısından ayrı bir `qorel` sistem kullanıcısı ve sertleştirilmiş bir `qorel.service` oluşturur.
2. `/etc/qorel/config.toml` dosyasını yerel düğüm uç noktalarıyla düzenleyin.
3. Relayer anahtarını `qorel` kullanıcısı olarak ekleyin ve kuantum sonrası anahtarı kaydedin:

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. `systemctl enable --now qorel` komutunu çalıştırın.
5. QORel'e düğümden daha düşük öncelik verin; böylece blok üretimiyle asla yarışmaz:

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   Ardından `systemctl daemon-reload && systemctl restart qorel`.

### 2. Docker Compose sidecar {#compose}

```yaml
services:
  qorel:
    image: ghcr.io/qorechain/qorel:0.1.0
    command: ["--config", "/home/nonroot/.hermes/config.toml", "start"]
    network_mode: host          # reach the node on 127.0.0.1
    restart: unless-stopped
    volumes:
      - ./qorel:/home/nonroot/.hermes   # config.toml + keys/ (owner uid 65532, mode 0700)
    deploy:
      resources:
        limits: { cpus: "1.0", memory: 1g }
```

Anahtarları aynı imajla bir kez ekleyin, örneğin:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

Sonrasında mnemonic dosyasını silin.

### 3. Kubernetes {#kubernetes}

Mnemonic'i secret deponuzda tutun ve anahtarları başlangıçta yeniden oluşturun:

1. Bir init container, `medium: Memory` olan bir `emptyDir` içine `qorel keys add` çalıştırır (kuantum sonrası anahtarı önceden, elle bir kez kaydedin).
2. Ana container aynı birim üzerinde `qorel start` çalıştırır.

Böylece anahtarlar yalnızca bellekte bulunur.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: qorel }
spec:
  replicas: 1                      # never more than one per key
  strategy: { type: Recreate }
  selector: { matchLabels: { app: qorel } }
  template:
    metadata: { labels: { app: qorel } }
    spec:
      securityContext: { runAsNonRoot: true, runAsUser: 65532, fsGroup: 65532 }
      volumes:
        - name: home
          emptyDir: { medium: Memory }
        - name: config
          configMap: { name: qorel-config }
        - name: mnemonic
          secret: { secretName: qorel-relayer-mnemonic }   # key: mnemonic
      initContainers:
        - name: keys
          image: ghcr.io/qorechain/qorel:0.1.0
          args: ["--config", "/config/config.toml", "keys", "add", "--chain", "qorechain-diana",
                 "--key-name", "relayer", "--mnemonic-file", "/secret/mnemonic", "--overwrite"]
          volumeMounts:
            - { name: home, mountPath: /home/nonroot/.hermes }
            - { name: config, mountPath: /config }
            - { name: mnemonic, mountPath: /secret, readOnly: true }
        # repeat the init container for each chain in the config
      containers:
        - name: qorel
          image: ghcr.io/qorechain/qorel:0.1.0
          args: ["--config", "/config/config.toml", "start"]
          ports: [{ containerPort: 3001, name: telemetry }]
          resources: { limits: { cpu: "1", memory: 1Gi } }
          volumeMounts:
            - { name: home, mountPath: /home/nonroot/.hermes }
            - { name: config, mountPath: /config }
```

Yapılandırmadaki `key_store_folder`, `/home/nonroot/.hermes/keys` konumunu göstermelidir (veya ayarlanmadan bırakılmalıdır).

### İzleme {#monitoring}

Telemetriyi etkinleştirin ve bekleyen paketlere, relayer bakiyelerine, kuantum sonrası anahtar durumuna ve istemci tazeliğine alarm kurun. Liste [İzleme](/qorel/monitoring) sayfasındadır.

## Nasıl erişilir {#how-to-access}

- **Ağ.** Testnet `qorechain-diana`. Relayer kendi düğümünüzün yerel portlarına ve diğer zincirin uç noktalarına bağlanır.
- **Hesaplar.** Her zincirde ücretler için fonlanmış özel bir relayer hesabı; asla doğrulayıcı operatör anahtarı değil.
- **Ana makine.** 1. düzen için systemd'li Linux; 2. düzen için ana makine ağıyla Docker; 3. düzen için bellek destekli `emptyDir` içeren bir küme.
- **Maliyet.** Yalnızca ücretler. Yukarıdaki örnekler relayer'ı 1 CPU ve 1 GiB bellekle sınırlar.

## Nerede yayımlanır {#where-published}

Paketler, container imajı ve kaynak [Kurulum](/qorel/install#where-published) sayfasında listelenir. Örnek yapılandırma, [qorechain/QORel](https://github.com/qorechain/QORel) içindeki `packaging/config.example.toml` dosyasıdır.

## Sınırlar ve bilinen sorunlar {#limits}

- **Bir doğrulayıcı görevi değildir.** Röle isteğe bağlıdır ve doğrulamadan ayrıdır; durmuş bir relayer konsensüsü etkilemez.
- **Anahtar başına tek süreç.** Aynı anahtarla ikinci bir pod başlatan yuvarlanan güncellemeler hesap sıra numarasını bozar; örnek `Recreate` kullanır.
- **Elle kayıt.** `keys register-pqc` tek seferlik elle yapılan bir adımdır; Kubernetes init container'ı yalnızca anahtarları yeniden oluşturur.
- **Yalnızca testnet.** Henüz röle yapılacak bir mainnet kanalı yok.
