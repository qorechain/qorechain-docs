---
slug: /developer-tools/qorescan
title: QoreScan Community
sidebar_label: QoreScan
sidebar_position: 33
---

# QoreScan Community

QoreScan Community は、QoreChain デプロイメントの暗号技術を棚卸しし、その結果を CycloneDX 1.6 CBOM（暗号資産部品表）として書き出すコマンドラインツールです。ノードのホームディレクトリ、ネットワークのライブ状態、TLS エンドポイント、Solidity ソースを読み取り、見つかったアルゴリズム、プロトコル、証明書、鍵を、それが見つかったファイルと行、またはエンドポイントとともに記録します。

対象は、バリデーターやノードの運用者、コンプライアンス部門やリスク部門、証拠資料を準備する監査人、そして自社のコントラクトがどの署名方式に依存しているかを知りたい Solidity チームです。CBOM から、FINMA Guidance 05/2026、EU NIS 協力グループのポスト量子ロードマップ、ICT リスク管理に関する DORA RTS（第 6 条）に対応づけた Markdown レポートを作成し、アルゴリズムごとに FIPS 203、204、205 と NIST IR 8547 に対するステータスを示します。

バージョン **0.1.0**、2026年10月27日公開、Apache-2.0。メインネット（`qorechain-vladi`）とテストネット（`qorechain-diana`）を公開 REST エンドポイント経由で、または指定した任意の REST エンドポイントで読み取ります。

QoreScan は棚卸しを補助するツールです。認証でも監査でも法的意見でもなく、いかなる規制や標準への適合も証明しません。スキャンで確認できなかった事項は「To be completed」のままになります。

## 革新的な点 {#innovations}

- **標準形式の CBOM。** 各検出結果は、`cryptoProperties`（資産タイプ、プリミティブ、パラメータセット、曲線、従来型のセキュリティレベル、NIST の量子セキュリティカテゴリ、OID）と `evidence.occurrences`（ファイルと行、またはエンドポイント）を持つ CycloneDX 1.6 の `cryptographic-asset` コンポーネントです。証明書はその署名アルゴリズムと公開鍵に、プロトコルは使用するアルゴリズムに、ライブラリは提供するアルゴリズムにリンクされます。プロジェクトのテストで書き出されるすべての CBOM は公式の CycloneDX 1.6 JSON スキーマで検証され、使用されるすべての `bom-ref` が定義済みであることも確認されるため、出力は任意の CycloneDX 1.6 コンシューマーで読み込めます。
- **チェーンを理解するソース。** ファイルや TLS に加えて、QoreChain 自体も読み取ります。PQC パラメータ、PQC 関連のプロトコルスイッチ、アクティブなバリデーターセットのコンセンサス鍵タイプ、アクティブな EVM プリコンパイル、そして指定した各アカウントについて、PQC 鍵が登録されているか、そのアルゴリズム、鍵の種類（ハイブリッド、PQC のみ、従来型のみ）、公開鍵のサイズです。
- **ハイブリッド鍵交換が見える。** エンドポイントごとに 1 回の TLS ハンドシェイクを行い、バージョン、暗号スイート、鍵交換グループ（`X25519MLKEM768` などのハイブリッド ML-KEM グループを含む）、ALPN、SNI、サーバーが送信したすべての証明書を記録します。
- **秘密鍵の値は決して読み取りません。** 鍵ファイルは秘密鍵用のフィールドを持たない構造体にデコードされるため、それらのバイト列はデコードも保存もログ出力も書き出しもされません。これらの構造体に秘密データを保持できるフィールドが追加されるとテストが失敗します。別のテストでは、新しく生成した鍵を含むノードホームをスキャンし、それらの鍵のいかなるエンコーディングも出力に現れないことを確認します。
- **すべてのアルゴリズムに分類と移行ステータスが付く。** `post-quantum`、`hybrid`、`quantum-vulnerable`、`symmetric` のいずれかに分類され、定義されている場合は NIST の量子セキュリティカテゴリ、そして FIPS 203、204、205 および NIST IR 8547 のスケジュールに対するステータスが付きます。
- **再現可能な出力。** CBOM のタイムスタンプは現在時刻で、`SOURCE_DATE_EPOCH` が設定されている場合はその値になります。シリアル番号は内容から導出されるため、同じ入力を同じ時刻に処理すれば同じドキュメントになります。
- **実行するものを自分で検証するラッパー。** npm と PyPI のパッケージは、お使いのプラットフォーム用のリリースバイナリをオンデマンドでダウンロードし、その SHA-256 をパッケージに同梱されたダイジェストと比較します。ダウンロード直後も、キャッシュされたコピーの以後の実行ごとにも、一致しないバイナリは拒否されます。`npm install` 時にインストールスクリプトは実行されません。
- **バイナリにサードパーティのコードは含まれません。** `qorescan` バイナリは、スキャンに Go 標準ライブラリを使用します（JSON スキーマバリデーターはテストで使用されます）。PQCA CBOMkit プロジェクトのコードは再利用しておらず、その出力は CBOMkit ビューアーで読み込めます。

## 用途 {#use-cases}

1. **コンプライアンス部門が監督当局向けに CBOM を作成する。** QoreChain ノードを運用するスイスの金融機関は、分散台帳技術を含む ICT システム全体の暗号方式の棚卸しを示す必要があります（FINMA Guidance 05/2026、セクション 3.2）。`qorescan scan --node-home ... --network mainnet` を実行し、CBOM と `qorescan report --framework finma` の出力をリスク分析に添付し、組織面のセクションは手作業で完成させます。
2. **バリデーターが自分のノードを監査する。** 運用者は、バリデーターがどのコンセンサス鍵タイプを使っているか、鍵ファイルが他のユーザーから読めるか、RPC や EVM JSON-RPC のリスナーが TLS なしで公開されていないか、リモートサイナーが設定されているかを確認したいと考えています。`qorescan scan --node-home ~/.qorechain` は、秘密鍵の値を開かずにこれらをすべて記録します。
3. **アカウントを信頼する前に確認する。** カストディデスクや取引所の統合チームは、財務用やホットウォレットのアドレスに ML-DSA-87 鍵が登録されているか、またそれがハイブリッドかを知りたいと考えています。`qorescan scan --network mainnet --address qor1... --address qor1...` は、各アカウントの PQC 鍵ステータスを CBOM に書き込みます。[カストディキット](/developer-tools/custody-kit)を参照してください。
4. **コントラクトを移植する Solidity チーム。** Ethereum からコントラクトを移すチームは、`ecrecover`、OpenZeppelin の `ECDSA`、P-256、RSA に依存する箇所と、QoreChain の PQC プリコンパイルをすでに呼び出している箇所の一覧を求めています。`qorescan solidity ./contracts` は、各使用箇所をファイルと行とともに一覧表示します。
5. **エンドポイントのレビュー。** プラットフォームチームは、公開 RPC、REST、ウォレット API の各エンドポイントが、最新のクライアントとハイブリッドのポスト量子鍵交換をネゴシエートするかを知りたいと考えています。`qorescan tls api.example.org:443` は、ネゴシエートされたグループ、暗号スイート、証明書チェーンを記録します。
6. **すべてのプルリクエストでの CI ゲート。** dApp のリポジトリに QoreScan GitHub Action を追加すると、変更のたびに新しい CBOM と DORA または FINMA のレポートがビルド成果物として生成され、新しい署名方式やハッシュがコードベースに入ったときにレビュアーが気づけます。
7. **ベンダーのデューデリジェンス。** 規制対象の企業は、`qorescan template questionnaire` の出力を、そのプロバイダーのエンドポイントのスキャンですでに判明している内容を事前入力したうえでサービスプロバイダーに送り、プロバイダーは未回答の項目だけに答えます。
8. **NIS ロードマップと DORA に備える EU の事業体。** 事業体は `qorescan report --framework nis` と `--framework dora` を使い、棚卸しが暗号資産管理のステップと DORA RTS 第 6 条にどこで入力として使われるかを示します。

## 仕組み {#how-it-works}

### ソース {#sources}

- **ノードホーム**（`--node-home DIR`）。`config/config.toml`、`config/app.toml`、`config/genesis.json`、`priv_validator_key.json`、`node_key.json`、およびそれらが指す証明書ファイルを読み取ります。P2P トランスポートとそのアルゴリズム、RPC と EVM JSON-RPC の TLS 証明書、TLS なしで非ループバックアドレスにあるリスナー、リモートサイナー、バリデーター鍵とノード鍵のタイプと公開鍵、鍵ファイルのパーミッション、ジェネシスの `pqc` モジュールパラメータ、ジェネシス時点のオンチェーンのアルゴリズムレジストリ、バリデーターのコンセンサス鍵タイプを記録します。
- **ネットワーク**（`--network mainnet|testnet` または `--rest URL`）。PQC 関連のプロトコルスイッチ、`pqc` パラメータ、アクティブなバリデーターセットのコンセンサス鍵タイプ、アクティブな EVM プリコンパイルを REST 経由で読み取ります。
- **アカウント**（`--address ADDR`、複数指定可）。各アカウントに登録された PQC 鍵を REST 経由で読み取ります。
- **TLS**（`--tls HOST:PORT`、複数指定可）。エンドポイントごとに 1 回のハンドシェイクを行います。
- **Solidity**（`--solidity PATH`、複数指定可）。`ecrecover`、ecrecover（`0x01`）、pqcVerify（`0x0A01`）、pqcKeyStatus（`0x0A02`）、P-256（`0x100`）の各プリコンパイルの呼び出し、`keccak256`、`sha256`、`ripemd160`、そして OpenZeppelin、Solady、`IQorePQC.sol` の署名ライブラリのインポートを、テキストベースで検出します。pqcVerify と pqcKeyStatus のプリコンパイルはテストネットのみで有効で、メインネットで有効なものはありません。[EVM プリコンパイル](/developer-guide/evm-precompiles)を参照してください。

### ネットワークの読み取り {#network-reads}

ネットワークへのリクエストはすべて HTTP GET です。読み取るルートは、ノード情報ルート、`/qorechain/pqc/v1/protocol_features`、`/qorechain/pqc/v1/params`、最新のバリデーターセットのルート、`/cosmos/evm/vm/v1/params`、`/qorechain/pqc/v1/account/{address}` です。ノードが提供していないルートは、エラーではなく CBOM 内のノートになります。

### 分類 {#classification}

ML-KEM（FIPS 203）、ML-DSA（FIPS 204）、SLH-DSA（FIPS 205）、LMS/XMSS は `post-quantum` です。従来型の鍵交換と ML-KEM を組み合わせたものは `hybrid` です。RSA、ECDSA、EdDSA、有限体および楕円曲線の Diffie-Hellman、ペアリングベースの署名は `quantum-vulnerable` で、NIST IR 8547 のスケジュールは「2030 年以降非推奨、2035 年以降使用不可」です。ブロック暗号、AEAD、ハッシュ、XOF、KDF は `symmetric` です。QoreScan は、secp256k1 や X25519 を含め、ECDSA、EdDSA、ECDH ファミリーのすべての曲線に IR 8547 のスケジュールを適用します。量子に対する露出は同じだからです。これらは棚卸しのための分類であり、NIST の承認に関する記述ではありません。

### 出力 {#output}

QoreScan は、いくつかの `qorescan:*` プロパティ（分類、NIST IR 8547 の移行、標準、ソース）を追加し、スキャンで確認した事実、ノート、免責事項のプロパティを CBOM のメタデータに記録します。証拠のパスはスキャンしたディレクトリからの相対パスです。

レポートには、フレームワークの対応表、分類ごとのサマリー、各アルゴリズム（NIST カテゴリ、FIPS 203、204、205 と NIST IR 8547 に対するステータス、証拠付き）、続いてプロトコル、証明書、鍵、ライブラリ、スキャンで確認した事実、スキャンのノート、引用したソースが含まれます。組織面の項目は「To be completed」となります。

### フレームワークとの対応 {#frameworks}

| フレームワーク | ソース | 棚卸しが入力として役立つ箇所 |
|---|---|---|
| `finma` | FINMA Guidance 05/2026 「Quantum computing」、2026年7月9日、セクション 3 | 3.2 棚卸し（CBOM）、3.3 重要データ（スキャンしたトランスポートの鍵交換、ネイティブレーンのハイブリッド署名モード）、3.4 暗号アジリティ（アルゴリズムレジストリ、移行期間、プロトコルスイッチ）、3.5 プロバイダー（証明書の発行者、質問票）。3.1 戦略は組織面の事項です。 |
| `nis` | NIS 協力グループ、「A Coordinated Implementation Roadmap for the Transition to Post-Quantum Cryptography」、Part 1、v1.1、2025年6月11日 | 暗号資産管理（CBOM）、2030 年と 2035 年のマイルストーン（quantum-vulnerable なアルゴリズムの一覧）、アジリティ。 |
| `dora` | 委員会委任規則 (EU) 2024/1774、第 6 条 | 6(2)(a) と (c) トランスポートの記録と TLS なしのリスナー、6(2)(d) 鍵の記録（タイプと公開鍵）、6(3) 各アルゴリズムの FIPS と NIST IR 8547 に対する状況、6(4) レジストリ、移行期間、スイッチ。6(1) と 6(5) は組織面の事項です。 |

## 使い方 {#how-to-use}

### インストール {#install}

| チャネル | インストールコマンド | 最小プラットフォーム |
|---|---|---|
| リリースバイナリ | [GitHub リリース](https://github.com/qorechain/qorescan/releases/tag/v0.1.0)から `qorescan_0.1.0_<os>_<arch>`（または `.tar.gz` か `.zip`。Windows のバイナリは `.exe` で終わります）をダウンロードし、`qorescan_0.1.0_checksums.txt` と照合します | amd64 または arm64 の macOS、Linux、Windows |
| Go | `go install github.com/qorechain/qorescan/cmd/qorescan@v0.1.0` | Go 1.26 |
| npm | `npx @qorechain/qorescan scan ...` | Node.js 18 以降 |
| PyPI | `pipx run qorescan scan ...`（または `pip install qorescan`） | Python 3.9 以降 |
| Docker | リポジトリから `docker build -t qorescan .`（ビルド済みイメージは公開されていません） | Docker。イメージは distroless で、ユーザー 65532 として実行されます |
| GitHub Action | `uses: qorechain/qorescan@<commit sha>` | GitHub ホストまたはセルフホストのランナー。Action は `actions/setup-go` を使って自身のソースから QoreScan をビルドします |

両方のラッパーに共通の環境変数:

| 変数 | 効果 |
|---|---|
| `QORESCAN_CACHE_DIR` | バイナリをキャッシュする場所（デフォルト: ユーザーのキャッシュディレクトリ）。 |
| `QORESCAN_DOWNLOAD_BASE` | GitHub の代わりにミラーからダウンロードします。ダイジェストの確認は引き続き行われます。 |

### クイックスタート {#quickstart}

QoreScan は GET リクエストとエンドポイントごとに 1 回の TLS ハンドシェイクを送るだけで、何にも署名せず、鍵も不要です。以下のコマンドは、v0.1.0 のソースからビルドしたバイナリを使い、2026年10月27日に公開テストネットに対して実行したものです。

**1. テストネットの状態、1 つのアカウント、公開テストネット REST エンドポイントの TLS、Solidity ソースのフォルダーをスキャンする:**

```bash
qorescan scan --network testnet \
  --address qor178nscfyp0cq2ac5x7un4u98xrj4ayp6pt0kw08 \
  --tls api-testnet.qore.host:443 \
  --solidity ./contracts \
  --name my-deployment \
  --out cbom.json
```

終了コードは 0 でした。CBOM には、チェーン ID `qorechain-diana`、ネイティブレーンのハイブリッド署名モード `required`、アカウント（テストネットのフォーセットアカウント）のハイブリッド PQC 鍵、バリデーターセットの Ed25519 コンセンサス鍵、ハイブリッドグループ `X25519MLKEM768` を使う TLS 1.3、Solidity ソースで見つかったアルゴリズムなどが記録されました。

このページの執筆中に、ネットワークと TLS の部分だけをもう一度実行したところ、ML-DSA-87、`X25519MLKEM768`、`api-testnet.qore.host:443` の TLS 1.3 プロトコルエントリ、その証明書チェーン、バリデーターセットの Ed25519 鍵を含む、21 個のコンポーネントの CBOM が生成されました。

**2. CBOM から FINMA レポートを書き出す:**

```bash
qorescan report --framework finma --cbom cbom.json --out finma.md
```

レポートは免責事項で始まり、続いて対応表（セクション 3.1 から 3.5）、分類ごとのサマリー、アルゴリズムごとに 1 行（FIPS と NIST IR 8547 のステータスと証拠付き）が並びます。`ecrecover` を使う 1 つの Solidity ファイルをスキャンすると、コンポーネントが 1 つ（`ECDSA secp256k1`）の CycloneDX 1.6 CBOM と、同じレポートヘッダーが生成されました。未知のフレームワーク名を指定すると、終了コード 2 で終了し、`finma`、`nis`、`dora` を列挙するメッセージが表示されます。

**3. ベンダー質問票とアジリティ声明を事前入力する:**

```bash
qorescan template questionnaire --cbom cbom.json --out vendor-questionnaire.md
qorescan template agility       --cbom cbom.json --out agility-statement.md
```

**4. 自分のノードをスキャンする。** ノードホームへの読み取りアクセスがあれば十分です:

```bash
qorescan scan --node-home ~/.qorechain --network mainnet --out node-cbom.json
```

Docker では、コンテナーが変更できないよう、ノードホームを読み取り専用でマウントします:

```bash
docker run --rm -v "$HOME/.qorechain:/scan/home:ro" qorescan scan --node-home /scan/home > cbom.json
```

**5. ラッパー経由でもコマンドは同じです:**

```bash
npx @qorechain/qorescan scan --network mainnet --out cbom.json
pipx run qorescan report --framework dora --cbom cbom.json
```

**6. GitHub Actions で。** Action とその他すべての Action をコミットで固定してください:

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@<sha>
  - id: qorescan
    uses: qorechain/qorescan@<commit sha>
    with:
      solidity: contracts
      network: mainnet
      addresses: qor1...
      out: qorescan.cbom.json
      framework: finma
  - uses: actions/upload-artifact@<sha>
    with:
      name: cbom
      path: |
        ${{ steps.qorescan.outputs.cbom }}
        ${{ steps.qorescan.outputs.report }}
```

Action の入力: `node-home`、`network`、`rest`、`addresses`、`tls`、`solidity`（スペースまたは改行で区切ったリスト）、`out`（デフォルトは `qorescan.cbom.json`）、`framework`。出力: `cbom` と `report`。Action は固定したコミットの自身のソースから QoreScan をビルドするため、バイナリはダウンロードされません。

このページのために実行したもの: v0.1.0 のソースからビルドしたバイナリによる、テストネットのスキャン、Solidity のスキャン、FINMA レポート、未知のフレームワークのエラー。リリース済みのバイナリ、npm と PyPI のラッパー（パッケージの内容とレジストリのエントリの確認を除く）、Docker イメージ、GitHub Action は実行していません。

### コマンドとフラグ {#commands}

```
qorescan scan [--node-home DIR] [--network mainnet|testnet | --rest URL] [--address ADDR]...
              [--tls HOST:PORT]... [--solidity DIR]... [--out FILE]
qorescan tls HOST:PORT... [--out FILE]
qorescan solidity DIR... [--out FILE]
qorescan report --framework finma|nis|dora --cbom FILE [--out FILE]
qorescan template agility|questionnaire --cbom FILE [--out FILE]
qorescan version
```

フラグは位置引数の前に置いても後に置いても構いません。`--out -`（デフォルト）は標準出力に書き出します。`qorescan <command> -h` は、そのコマンドのフラグを表示します。

| コマンド | フラグ | 内容 |
|---|---|---|
| `scan` | `--node-home DIR` | ノードのホームディレクトリ（`config/` を含むもの）。 |
| `scan` | `--network mainnet\|testnet` | `https://api.qore.host` または `https://api-testnet.qore.host` からライブ状態を読み取ります。 |
| `scan` | `--rest URL` | 代わりに任意の REST エンドポイントを使います。たとえば自分のノード（`http://127.0.0.1:1317`）や、GET リクエストを転送するリレーです。`--network` より優先されます。 |
| `scan` | `--address ADDR` | PQC 鍵ステータスを読み取るアカウント。複数指定可。`--network` または `--rest` が必要です。 |
| `scan` | `--tls HOST:PORT` | ハンドシェイクする TLS エンドポイント。複数指定可。省略時はポート 443。 |
| `scan` | `--solidity PATH` | ディレクトリまたは `.sol` ファイル。複数指定可。 |
| `scan`, `solidity` | `--include-deps` | デフォルトでスキップされる `node_modules`、`lib`、`out`、`cache`、`artifacts`、`typechain-types` もスキャンします。 |
| `scan` | `--name NAME` | CBOM メタデータに記録する、スキャン対象のデプロイメント名。 |
| `scan` | `--timeout D` | リクエストごとのネットワークタイムアウト（デフォルト `20s`）。 |
| `tls` | `--servername NAME` | SNI サーバー名（デフォルト: ホスト）。 |
| `tls` | `--timeout D` | ハンドシェイクのタイムアウト（デフォルト `15s`）。 |
| すべてのスキャン | `--verbose` | 読み取った各ファイルと各リクエストを標準エラーに記録します。 |
| すべて | `--out FILE` | 出力ファイル。`-` で標準出力。 |
| `report` | `--framework finma\|nis\|dora` | 対応づけるフレームワーク。必須。 |
| `report`, `template` | `--cbom FILE` | 読み込む CBOM。`-` で標準入力。必須。 |
| `template` | `agility` または `questionnaire` | 書き出すテンプレート。 |

その他のコマンド: `qorescan tls` は単独の TLS スキャン、`qorescan solidity` は単独の Solidity スキャンです。`qorescan template agility` は、スキャンで確認した事実を事前入力した暗号アジリティ声明を書き出し、`qorescan template questionnaire` は、FINMA Guidance 05/2026 セクション 3 の 5 つの措置に沿った 5 問のベンダー質問票を書き出します。`qorescan report` は、他のツールが書き出した CycloneDX 1.6 CBOM も受け付けます（その場合の分類はアルゴリズム名によります）。

終了コード: `0` 成功、`1` スキャンまたは I/O エラー、`2` 使い方のエラー。

## アクセス方法 {#how-to-access}

| | メインネット | テストネット |
|---|---|---|
| チェーン ID | `qorechain-vladi` | `qorechain-diana` |
| `--network` が使用する REST | `https://api.qore.host` | `https://api-testnet.qore.host` |

- 鍵、アカウント、資金は不要です。QoreScan はトランザクションに署名も送信も行わず、指定した出力ファイル以外には何も書き込みません。
- すべてのノードがすべてのルートを提供しているわけではありません。2026年10月27日時点で、公開メインネットの REST エンドポイントは `/qorechain/pqc/v1/params` を提供しておらず、その場合スキャンはノートを記録して続行します。より詳しい情報を得るには、`--rest` を自分のノードに向けてください。
- オンチェーンのアルゴリズムレジストリは REST では公開されていません。QoreScan は、ノードホームをスキャンする際に `genesis.json` から読み取ります。
- スキャンは、読み取るノードのチェーンバージョンを反映します。プロトコルスイッチとアクティブなプリコンパイルはメインネットとテストネットで異なります。CBOM には、問い合わせたノードが報告する内容が記録されます。
- お使いのマシンから公開エンドポイントに到達できない場合は、自分で運用するノード、または GET リクエストを転送するリレーを `--rest` に指定してください。
- 依存関係: npm と PyPI のラッパーは、それぞれの言語の組み込みモジュールのみを使用します。

## セキュリティに関する注意 {#security}

- **秘密鍵の値は決して読み取りません。** `priv_validator_key.json` からは、アドレス、公開鍵、鍵タイプ名を取得します。`node_key.json` からは鍵タイプのみを取得し、ノード ID は導出しません（秘密鍵が必要になるため）。生のファイルバッファはデコード後に上書きされ、入力を引用しかねないデコードエラーは返されません。
- キーリングディレクトリ（`keyring-*`）と、`tls_key_file` および `tls.key-path` で指定された鍵ファイルは開きません。QoreScan は、それらが存在する、または設定されていることだけを記録します。証明書ファイル内のその他の PEM ブロックは、デコードせずにスキップされます。
- ネットワークへのリクエストはすべて HTTP GET です。出力ファイル以外には何も書き込まれません。
- npm と PyPI のラッパーは、実行のたびにバイナリの SHA-256 を検証し、ミラーを使用する場合も含めて、一致しない場合は拒否します。リリース 0.1.0 では、npm パッケージ内のダイジェストはリリースのチェックサムファイルと一致しています。
- Docker イメージは distroless で、非 root ユーザーとして実行されます。ノードホームは `:ro` でマウントしてください。
- 脆弱性は security@qore.network に非公開で報告してください。

## 公開場所 {#where-published}

バージョンは2026年10月27日に各レジストリから読み取ったものです。

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| GitHub release | `qorechain/qorescan` | v0.1.0（2026年10月27日公開）、amd64 と arm64 の darwin、linux、windows 用バイナリ、および `qorescan_0.1.0_checksums.txt` | https://github.com/qorechain/qorescan/releases/tag/v0.1.0 |
| npm | `@qorechain/qorescan`（コマンド `qorescan`） | 0.1.0 | https://www.npmjs.com/package/@qorechain/qorescan |
| PyPI | `qorescan`（Python 3.9 以降） | 0.1.0 | https://pypi.org/project/qorescan/ |
| Go module proxy | `github.com/qorechain/qorescan` | v0.1.0 | https://pkg.go.dev/github.com/qorechain/qorescan |

ソース: https://github.com/qorechain/qorescan（Apache-2.0、Copyright 2026 QoreChain Association）。crates.io や Maven のパッケージ、ビルド済みの Docker イメージはありません。イメージはリポジトリからビルドしてください。リポジトリには、すべてのフラグが `docs/usage.md` に、何を読み取り何を決して読み取らないかが `docs/scanned-data.md` に、フレームワークとの対応とそのソースが `docs/frameworks.md` に、制限事項が `docs/limitations.md` に記載されています。

## 制限事項と既知の問題 {#limits}

- **棚卸しの補助ツールです。** 認証も監査も法的助言も行わず、そのレポートはいかなる規制や標準への適合も証明しません。組織面の措置（戦略、ロードマップ、データ分類、責任分担）は「To be completed」のままです。
- **スコープ。** QoreScan は、指定したソースだけをスキャンします。保存データ、バックアップ、HSM、鍵管理システム、オペレーティングシステムやライブラリの設定、ウォレット、ブリッジ、オフチェーンのサービスは、`--tls` でその TLS エンドポイントを追加しない限りスキャンの対象外です。ブリッジはスキャンしません。
- **ライブ状態。** アルゴリズムレジストリは `genesis.json` から取得するため、ジェネシス時点のネットワークを反映しており、その後のガバナンスによる変更は含まれません。バリデーターのコンセンサス鍵は、最新のバリデーターセットについて読み取ります。
- **TLS。** Go のデフォルトのクライアント設定による 1 回のハンドシェイクでは、サーバーが最新のクライアントとネゴシエートする内容がわかるだけで、受け付けるすべてのバージョン、スイート、グループがわかるわけではありません。ロードバランサーの背後にあるエンドポイントは、別の接続では異なる応答をすることがあります。
- **リモートサイナー。** `priv_validator_laddr` が設定されている場合、バリデーター鍵は別の場所にあり、そのタイプはノードホームからは見えません。
- **Solidity。** 検出はテキストベースです。インポートの解決、継承の追跡、実行時のアドレスの計算は行いません。実行時に組み立てられるプリコンパイルのアドレスは検出されず、パターンに似た名前の変数が報告されることがあります。依存関係は、`--include-deps` を指定しない限りスキップされます。
- **他のツールの CBOM。** レポートは、他のツールの CBOM をアルゴリズム名のみで分類します。
- **日付。** NIST のカテゴリと IR 8547 の移行は、2026年10月時点で引用した文書から取っています。用途ごとのガイダンスが、より早い日付を定めることがあります。
- **バージョン文字列。** バージョンフラグなしでソースからビルドしたバイナリは `qorescan dev` と表示します。バージョンを記録する必要がある場合は、リリースバイナリ、またはタグ付きバージョンの Go インストールを使用してください。

## 関連ページ {#related}

- [ポスト量子署名](/developer-guide/post-quantum-signing): ネイティブレーンでのハイブリッド secp256k1 + ML-DSA-87 と、EVM 認可ウィンドウ。
- [カストディキット](/developer-tools/custody-kit): カストディアンと取引所向けの統合ガイドとリファレンスコード。
- [QoreSign](/qoresign/overview): ハイブリッド署名と検証のライブラリ。
- [ノードの運用](/developer-guide/running-a-node)と[バリデーターの運用](/developer-guide/running-a-validator): ノードホームの構成、リモートサイナー、鍵ファイル。
- [EVM プリコンパイル](/developer-guide/evm-precompiles): PQC プリコンパイル `0x0A01` と `0x0A02`。
- [ポスト量子ライブラリ（qorechain-pqc）](/developer-tools/pqc-library): 6 言語の ML-DSA-87。
- [メインネットへの接続](/getting-started/connecting-to-mainnet)と[テストネットへの接続](/getting-started/connecting-to-testnet): 公開エンドポイント。
