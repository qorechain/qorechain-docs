---
slug: /qorel/running-next-to-a-validator
title: バリデーターと並べて QORel を運用する
sidebar_label: バリデーターと並べて運用
sidebar_position: 6
---

# バリデーターと並べて QORel を運用する

バリデーターは、自分のチェーンのチャネルをリレーすることがよくあります。QORel は、バリデーターのホスト上、サイドカーコンテナ、または Kubernetes で動作できます。このページでは 3 つの構成と、リレイヤーをバリデーター自身の鍵から切り離しておくためのルールを説明します。バリデーターとノードのオペレーター向けです。ノード自体の運用については、[バリデーターの運用](/developer-guide/running-a-validator)と[ノードの運用](/developer-guide/running-a-node)を参照してください。

現時点では、リレーはテストネット専用です。QORel は `qorechain-diana` に対して実行されており、メインネットの IBC チャネルは開かれていません。

## 特長 {#innovations}

- **パッケージに含まれる堅牢化されたサービス。** `.deb` と `.rpm` は `qorel.service` をインストールします。このサービスは専用の `qorel` ユーザーとして、umask `0077`、新しい権限の取得なし、プライベートな `/tmp`、`/var/lib/qorel` 以外は読み取り専用のファイルシステム、コアダンプなし、という設定で動作します。
- **希望すれば、鍵はメモリ内のみ。** Kubernetes の構成では、Pod の起動時にシークレットからメモリ上のボリュームに鍵を再構築するため、鍵ファイルがディスクに触れることはありません。
- **所有者のみの鍵ファイル。** ポスト量子シードを含む鍵ファイルは、モード 0600 です。
- **アラートを設定できるチェック。** `qorel keys pqc-status` は `ready_to_relay` を報告し、送信前チェックは、拒否されるトランザクションを、手数料が消費される前に止めます。

## 使い方 {#how-to-use}

### 基本ルール {#ground-rules}

- **専用のリレイヤーアカウントを使用してください。** バリデーターのオペレーター鍵やコンセンサス鍵は絶対に使わないでください。リレイヤーが手数料に必要な分だけ入金してください。
- **リレイヤー鍵ごとにリレイヤープロセスは 1 つ。** 同じ鍵で署名する 2 つのプロセスは、アカウントシーケンスを取り合います。
- **自分のチャネルだけをリレーしてください。** `packet_filter` を設定します。
- **QORel をローカルのノードに向けてください。** `http://127.0.0.1:26657`、`http://127.0.0.1:9090`、`ws://127.0.0.1:26657/websocket` を使用し、これらのポートはインターネットに対して閉じたままにします。これにより、公開されていない gRPC エンドポイントもリレイヤーが利用できるようになります。
- **QoreChain では**、`qorel keys register-pqc` でリレイヤーのポスト量子鍵を 1 回登録し、起動前に `qorel keys pqc-status` を確認してください。

### 1. バリデーターのホストでの systemd {#systemd}

1. `.deb` または `.rpm` パッケージをインストールします（[インストール](/qorel/install#packages)）。バリデーターのユーザーとは別の `qorel` システムユーザーと、堅牢化された `qorel.service` が作成されます。
2. `/etc/qorel/config.toml` を、ローカルノードのエンドポイントで編集します。
3. ユーザー `qorel` としてリレイヤー鍵を追加し、ポスト量子鍵を登録します。

   ```bash
   sudo -u qorel qorel --config /etc/qorel/config.toml keys add --chain qorechain-diana --key-name relayer --mnemonic-file <file>
   sudo -u qorel qorel --config /etc/qorel/config.toml keys register-pqc --chain qorechain-diana
   sudo -u qorel qorel --config /etc/qorel/config.toml keys pqc-status --chain qorechain-diana
   ```

4. `systemctl enable --now qorel` を実行します。
5. ブロック生成と競合しないよう、QORel の優先度をノードより低くします。

   ```ini
   # /etc/systemd/system/qorel.service.d/priority.conf
   [Service]
   Nice=10
   CPUWeight=20
   MemoryMax=1G
   ```

   その後、`systemctl daemon-reload && systemctl restart qorel` を実行します。

### 2. Docker Compose サイドカー {#compose}

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

鍵は、同じイメージを使って 1 回だけ追加します。例:

```bash
docker run --rm -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys add --chain qorechain-diana --key-name relayer --mnemonic-file /home/nonroot/.hermes/relayer.mnemonic
docker run --rm --network host -v $PWD/qorel:/home/nonroot/.hermes ghcr.io/qorechain/qorel:0.1.0 \
  keys register-pqc --chain qorechain-diana
```

その後、ニーモニックファイルを削除してください。

### 3. Kubernetes {#kubernetes}

ニーモニックはシークレットストアに保管し、起動時に鍵を再構築します。

1. init コンテナが、`medium: Memory` の `emptyDir` に対して `qorel keys add` を実行します（ポスト量子鍵は、事前に手動で 1 回登録してください）。
2. メインコンテナが、同じボリュームに対して `qorel start` を実行します。

こうすることで、鍵はメモリ内にのみ存在します。

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

設定の `key_store_folder` は `/home/nonroot/.hermes/keys` を指す必要があります（または未設定のままにします）。

### モニタリング {#monitoring}

テレメトリを有効にし、保留中のパケット、リレイヤーの残高、ポスト量子鍵の状態、クライアントの鮮度にアラートを設定します。一覧は[モニタリング](/qorel/monitoring)にあります。

## アクセス方法 {#how-to-access}

- **ネットワーク。** テストネット `qorechain-diana`。リレイヤーは、ご自身のノードのローカルポートと、もう一方のチェーンのエンドポイントに接続します。
- **アカウント。** 各チェーンに、手数料の資金を入れた専用のリレイヤーアカウント。バリデーターのオペレーター鍵は絶対に使わないでください。
- **ホスト。** 構成 1 は systemd のある Linux、構成 2 はホストネットワークの Docker、構成 3 はメモリ上の `emptyDir` を使えるクラスタ。
- **費用。** 手数料のみ。上記の例では、リレイヤーを 1 CPU と 1 GiB のメモリに制限しています。

## 公開場所 {#where-published}

パッケージ、コンテナイメージ、ソースは[インストール](/qorel/install#where-published)に一覧があります。サンプル設定は [qorechain/QORel](https://github.com/qorechain/QORel) の `packaging/config.example.toml` です。

## 制限と既知の問題 {#limits}

- **バリデーターの義務ではありません。** リレーは任意で、バリデーションとは別です。リレイヤーが停止しても、コンセンサスには影響しません。
- **鍵ごとに 1 プロセス。** 同じ鍵で 2 つ目の Pod を起動するローリングアップデートは、アカウントシーケンスを壊します。この例では `Recreate` を使っています。
- **手動での登録。** `keys register-pqc` は 1 回限りの手動の手順です。Kubernetes の init コンテナは鍵を再構築するだけです。
- **テストネットのみ。** リレーするメインネットのチャネルはまだありません。
