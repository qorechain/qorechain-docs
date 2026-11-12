---
slug: /sdk/install
title: インストール
sidebar_label: インストール
sidebar_position: 2
---

# インストール

お使いの言語向けの SDK をインストールします。TypeScript コア（`@qorechain/sdk`）、
EVM および SVM アダプター（`@qorechain/evm`、`@qorechain/svm`）、React キット
（`@qorechain/react`）、そして Python、Go、Rust、Java クライアントはすべて、
ネイティブチェーンとの完全な互換性（型付きメッセージ、クエリ、tx ライフサイクル、
ハイブリッド PQC トランザクション、WebSocket サブスクリプション）を備えて各レジストリに
**公開**されています。現在のリリースは **0.14.0** で、2026年11月12日に公開されました
（2026年11月12日に各レジストリで確認済み）:

| レジストリ | パッケージ | バージョン |
| --- | --- | --- |
| npm | `@qorechain/sdk`、`@qorechain/react`、`@qorechain/evm`、`@qorechain/svm`、`create-qorechain-dapp` | 0.14.0（`create-qorechain-dapp` も同じ。0.13.1 のテンプレート修正も含みます） |
| PyPI | `qorechain-sdk`（インポートは `qorsdk`） | 0.14.0 |
| crates.io | `qorechain-sdk`（インポートは `qorechain`） | 0.14.0 |
| Go モジュールプロキシ | `github.com/qorechain/qorechain-sdk/packages/go` | v0.14.0 |
| Maven Central | `io.github.qorechain:qorechain-sdk` | 0.14.0（JDK 17 以降） |

Python、Rust、Go、Java に 0.11.0 はありません。npm パッケージには 2026年10月29日に 0.11.0 があり
（チェーン開発者キット。下記参照）、すべての言語が 0.10.0 から 0.12.0 へ一緒に移行しました。0.13.0 は 2026年11月11日に、0.14.0 は 2026年11月12日に、すべての言語で続きました。

以下からお使いの言語を選んでください。

## アップグレードノート {#upgrade}

:::danger 稼働中のネットワークでは SDK 0.8.1 以降を使用してください
両方の公開ネットワークは **v2 ハイブリッド sign-bytes** 形式（ドメインタグ付きで
chain id にバインド）を検証し、古い形式は `pqc` コード 21 で拒否します。
**0.8.0** より前のすべての SDK リリースは古い形式で署名します。また **0.8.0** は、ネットワークが使用した
2 つのアップグレード名のうち一方だけでこの切り替えを探します（メインネットでは
`v3.2.0`、テストネットでは `v3.1.98`、その後 `v3.2.0` として記録されています）。そのため
メインネットでは誤った形式で署名します。すべての言語で **0.14.0**（少なくとも **0.8.1**）を使用してください。
[EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)を開くには **0.8.2 以降**が必要です。
ハイブリッドビルダーは `signBytesVersion` オプション（`"auto"` | `"v1"` | `"v2"`）を受け取ります。`"auto"` は
ネットワークに問い合わせるため、`qorechain-vladi` / `qorechain-diana` では
REST エンドポイント（`rest`）が必要です。推測せずに例外を投げます。
[どの sign-bytes 形式か?](/sdk/concepts/accounts-pqc#sign-bytes-versions)を参照してください。
チェーン v3.2.3 でも v3.2.4（v3.2.4 はテストネットでは 2026年10月19日から、メインネットでは 2026年10月23日から稼働。v3.2.5 と v3.2.6 ではここは変わっておらず、メインネットでは 2026年11月12日から v3.2.7 が稼働）でも形式は変わっていません。`"auto"` は
どちらのネットワークでも v2 に解決されます。どちらもその形式に切り替えるアップグレードを適用済みだからです。
:::

## 0.14.0 の変更点 {#whats-new-0140}

SDK 0.14.0（2026年11月12日）は、すべての言語向けの 1 つのリリースです。TypeScript、Python、
Go、Rust、Java に加えて、`@qorechain/react`、`@qorechain/evm`、`@qorechain/svm`、
`create-qorechain-dapp`（0.13.1 のテンプレート修正も含みます）が対象です。チェーン **v3.2.8** の
クライアントサポートを追加します。新しいルールは、ネットワークが v3.2.8 を実行した時点から適用されます。
テストネット `qorechain-diana` は 2026年11月12日から実行しており、メインネットはまだ適用していません。
それより前のネットワークでは、新しいフィールドは任意のままです。

| 領域 | 0.14.0 での内容 |
| --- | --- |
| 鍵のリンク | 所有証明が必要です。ed25519、secp256k1、EIP-191（`personal_sign`）向けのビルダーと署名関数が、チェーン、アカウント、スキーム、鍵を明記した平文のリンクメッセージに署名します。register コンポーザーは空の証明を拒否します |
| 価値を動かす鍵 | `send`、`evm`、`deploy`、`svm`、`all` のいずれかを持つ鍵では、アカウントで最初に有効な支出ルールがすべてのデノミネーションを制限している必要があります。ヘルパーが、支出ルールの更新とリンクを、オーナーが署名する 1 つのトランザクションの組として構築し、ルールを検査します |
| ガバナンスパラメーター | crossvm、svm、rdk の `MsgUpdateParams` コンポーザーにはすべてのフィールドが必要です（チェーンはパラメーターを丸ごと置き換えます）。ネットワークから読み取った現在のパラメーターから更新を構築する新しいヘルパーがあります。svm のコンポーザーは、ハードなカストディ上限が 0 の間は `enabled` を拒否します |
| クロス VM の保留中クエリ | ページング付きクエリが、すべてのページを返すようになりました |
| 実行結果 | `MsgExecuteEVM` と `MsgExecuteCosmos` は、コード 0 のトランザクション内で `success=false` として失敗することがあります（ナンスは消費されます）。新しいヘルパーがレスポンスと失敗の理由をデコードし、実行が失敗した場合に例外を発生させます |
| クロス VM の非同期呼び出し | `async_gas_limit` と `async_max_factor` を受け取ります |
| EVM ウィンドウのスコープ | 新しいフィールド `validators`、`staking_validators`、`ibc_receivers` |
| ガス | 30,000,000 を超える EVM トランザクション（`evm_limits` から読み取り）と 50,000,000 を超える Cosmos トランザクションは、署名前に拒否されます。CosmWasm とクロス VM のトランザクションには、シミュレーションしたガスの少なくとも 1.3 倍が与えられ、固定のフォールバックは使われません |
| 最低ガス価格 | オプトインのヘルパーがネットワークの最低ガス価格を読み取ります。デフォルトのガス価格は変わりません |
| Protos | 5 つの言語すべての生成コードが v3.2.8 に従います |

同じ変更のウォレット側は
[`@qorechain/wallet-adapter` 0.6.0](/developer-tools/wallet-adapter#whats-new-060) にあります。

## 0.13.0 の変更点 {#whats-new-0130}

SDK 0.13.0（2026年11月11日）は、すべての言語向けの 1 つのリリースです。TypeScript、Python、
Go、Rust、Java に加えて、`@qorechain/react`、`@qorechain/evm`、`@qorechain/svm`、
`create-qorechain-dapp` が対象です。破壊的変更は 1 つで、シードパスのアカウントヘルパーです。
ニーモニックから導出したアカウント、ハイブリッド署名の形式、チェーンの動作は変わらず、
0.12.0 で作ったトランザクションも引き続き有効です。

**破壊的変更。** シードパスのヘルパー `unifiedAccountFromSeed`（TypeScript）、
`unified_account_from_seed`（Python、Rust）、`unified.UnifiedAccountFromSeed`（Go）、
`UnifiedAccounts.unifiedAccountFromSeed`（Java）には、次の 2 つのうちちょうど 1 つが必要になりました。
`QRC1` のリカバリーコード、または独立した 32 バイトの PQC シークレットです。ML-DSA-87 鍵は
その 2 つ目のシークレットから導出されます。オプションなしで、または 2 つ以上を渡して呼び出すと、
エラーになります。

オプション `legacySeedDerivation`（Python は `legacy_seed_derivation=True`、Go は
`LegacySeedDerivation`、Rust は `SeedPqcOptions::legacy_seed_derivation()`、Java は
`SeedPqcOptions.legacy()`）は明示的に選ぶものです。0.13.0 より前に作られたアカウントの PQC 鍵を
復元して `MsgRotatePQCKey` でローテーションする場合にのみ使ってください。新しいアカウント向けではありません。

| 領域 | 0.13.0 での内容 |
| --- | --- |
| シードパスのヘルパー | `QRC1` のリカバリーコードまたは独立した 32 バイトの PQC シークレット（ちょうど 1 つ）が必要です。オプションなし、または 2 つ以上ではエラーになります。ニーモニックのアカウントは変わりません |
| `legacySeedDerivation` | 明示的に選ぶオプションで、0.13.0 より前に作られたアカウントの PQC 鍵を復元し、`MsgRotatePQCKey` でローテーションする場合にのみ使います |
| `QRC1` リカバリーコード | すべての言語に追加されました: `generatePqcRecoveryCode`、`isValidRecoveryCode`、`normalizeRecoveryCode`、`pqcKeyFromRecoveryCode`、`pqcRecoveryCodeFromSecret`（Python と Rust ではスネークケース。Go では `GeneratePQCRecoveryCode`、`IsValidRecoveryCode`、`PQCKeyFromRecoveryCode`、`PQCRecoveryCodeFromSecret`） |
| `migrateToHybrid` | `keyVerified` を報告します |
| テンプレート | `pnpm window recovery-code` が新しいコードを表示します。`PRIVATE_KEY` を使う場合、`pnpm window` は `QORE_PQC_RECOVERY_CODE` を読み、ない場合はメッセージを表示して停止します。`QORE_MNEMONIC` の場合は変わりません。Foundry と Hardhat のテンプレートは `^0.13.0` に依存します |
| sign-bytes バージョン `"auto"` | まず `/qorechain/pqc/v1/protocol_features` から `pqc-sign-bytes-v2` のプロトコル機能を読み、その読み取りが失敗した場合にのみ、適用済みのアップグレードプランにフォールバックします |
| `getPqcStatus` / `get_pqc_status` | ノードの応答に登録フラグがない場合、「未登録」と報告する代わりにエラーを発生させます |
| Python | トランザクション結果コードと EVM ウィンドウの `found` および `live` フィールドを厳密に解析します。`wait_for_tx` は `tx_response` または `txhash` のない応答を、まだ保留中として扱います |

**言語ごとのシードパスのオプション**。次の 3 つのうち、ちょうど 1 つを渡してください:

| 言語 | 呼び出し | リカバリーコード | 独立した 32 バイトのシークレット | 古い鍵（復元専用） |
| --- | --- | --- | --- | --- |
| TypeScript | `unifiedAccountFromSeed(seed32, opts)` | `{ recoveryCode }`（`"QRC1-..."` 形式の文字列） | `{ pqcSecret }`（32 バイトの `Uint8Array`。`seed32` とは独立） | `{ legacySeedDerivation: true }` |
| Python | `unified_account_from_seed(seed32, ...)` | `recovery_code=...` | `pqc_secret=...` | `legacy_seed_derivation=True` |
| Go | `unified.UnifiedAccountFromSeed(seed32, opts)` | `unified.SeedPQCOptions{RecoveryCode: ...}` | `unified.SeedPQCOptions{PQCSecret: ...}` | `unified.SeedPQCOptions{LegacySeedDerivation: true}` |
| Rust | `unified_account_from_seed(seed32, opts)` | `SeedPqcOptions::recovery_code(code)` | `SeedPqcOptions::pqc_secret(secret32)` | `SeedPqcOptions::legacy_seed_derivation()` |
| Java | `UnifiedAccounts.unifiedAccountFromSeed(seed32, opts)` | `SeedPqcOptions.withRecoveryCode(code)` | `SeedPqcOptions.withPqcSecret(secret32)` | `SeedPqcOptions.legacy()` |

Python のオプションはキーワード専用です。`pqcSecret` は、そこから `pqcRecoveryCodeFromSecret(secret32)` で作ったリカバリーコードと同じ鍵になります。TypeScript には `pqcKeyFromRecoveryCode(code, qor1)` もあります。

**移行（TypeScript）。** リカバリーコードを一度だけ作成し、シードとは別に保管してください:

```ts
import { generatePqcRecoveryCode, unifiedAccountFromSeed } from "@qorechain/sdk";

const recoveryCode = generatePqcRecoveryCode(); // once; store it apart from the seed
const account = unifiedAccountFromSeed(seed32, { recoveryCode });
```

0.12 以前で PQC 鍵を登録したアカウントは、`{ legacySeedDerivation: true }` で古い鍵を読み込み、
`rotatePqcKeyMsg` でローテーションします:

```ts
const old = unifiedAccountFromSeed(seed32, { legacySeedDerivation: true });
// rotate it with rotatePqcKeyMsg, then use { recoveryCode } from then on
```

リカバリーコードは必ず保管してください。別のコードを使うと別の鍵になります。

## 0.12.0 の新機能 {#whats-new-0120}

SDK 0.12.0 は、チェーン **v3.2.5** に対応するクライアントリリースです。メインネットは
2026年10月29日に高さ 3,906,833 で適用しました（テストネットは 10月26日に適用）。メインネットは
11月4日から v3.2.6 を、11月12日から v3.2.7 を実行しています。テストネットは 10月27日から v3.2.6 を、11月6日から 12日まで v3.2.7 を、11月12日から v3.2.8 を実行しています。
ハイブリッド署名形式、アドレス、小数桁数、メモは変わっておらず、0.10.0 で構築した
トランザクションは引き続き有効です。TypeScript、Python、Go、Rust、Java はすべて 0.12.0 に移行し、
`@qorechain/react`、`@qorechain/evm`、`@qorechain/svm`、`create-qorechain-dapp` も同様です。
このリリースは、すべての言語で、テストネット上のハイブリッド bank 送信と、そこで登録、読み戻し、
削除した KEM 鍵、およびメインネットでの読み取りを使って確認されました。

| 領域 | 0.12.0 での内容 |
| --- | --- |
| 既定で公開エンドポイント | `mainnet` と `testnet` のプリセットは、localhost ではなく公開エンドポイント（両方で REST、コンセンサス RPC、EVM JSON-RPC、テストネットではさらに EVM WebSocket）を指すようになりました。そのため、引数なしの `createClient()` は公開テストネットと通信します。[ネットワークとエンドポイント](/sdk/reference/network#public-endpoints)を参照 |
| `localnet` プリセット | 0.12.0 より前にすべてのプリセットが使っていた localhost のポートで、チェーン ID は `qorechain-devnet` です。従来の動作を維持するには `createClient({ network: "localnet" })` で選択します |
| ハイブリッドトランザクションの厳密なガス | v3.2.5 を適用したネットワークでは、ハイブリッドのネイティブトランザクションの `"auto"` 手数料は `ceil(simulated x 1.02) + 2000` になります。シミュレーションがポスト量子検証自体を課金するようになったためです。ハイブリッドの bank 送信は約 289,000 ではなく約 171,600 のガスを要求し、手数料もそれに合わせて下がります。古いネットワーク、古典トランザクション、プラン参照の失敗では従来のルールが維持されます。渡した倍率はどちらのルールも置き換えます。`exactHybridGas`（および各言語での同等のもの）と、TypeScript では `estimateGasDetails`（シミュレーション、ガスリミット、どのルールが設定したかを報告します）。Java には自動ガスの経路が加わりました |
| ML-KEM-1024 鍵レジストリ | アカウントは ML-KEM-1024 カプセル化鍵（アルゴリズム 2、1,568 バイト）を 1 つ公開でき、誰でもそれに宛てて暗号化できます。`msg.pqc.registerKemKey` と `msg.pqc.removeKemKey`（鍵は最初に検証されます。サイズ、すべての係数が 3329 未満、すべてゼロではないこと）、`validateKemPublicKey`、そして `/qorechain/pqc/v1/kem/{address}`（bech32 または `0x`）の読み取り `fetchKemKey` です。どちらのメッセージもハイブリッド署名が必要です。このルートはメインネットとテストネットで応答します。SDK は暗号化を行いません。封印されたペイロードについては [QoreSeal](/developer-tools/qoreseal) を参照 |
| アブストラクトアカウント | アカウントが保存している支出ルールとリンク済みキー（取り消されたものを含む）の読み取り、`MsgUpdateConfig`（モジュールを切り替えるガバナンスメッセージ）、そしてアカウントビューの `authenticators_count` |
| 支出ルールの検証 | ルールはチェーンと同じ方法で検証されます。`erc20/`、`erc721/`、`erc1155/` の denom は `0x` で始まるコントラクトアドレスを指定する必要があります。`abstractaccount` のコード 8（無効な支出ルール）と 9（モジュール無効）には名前が付いています |
| ガバナンスパラメータ | クロス VM の `MsgUpdateParams`（EVM ブリッジのプリコンパイルが呼び出せる CosmWasm コントラクトを含む）とロールアップの `MsgUpdateParams` で、それぞれ署名前にチェーンの上限に照らして検証されます。クロス VM パラメータの読み取りには `bridge_allowed_targets` が含まれます |
| アップグレード定数とプロト | `CHAIN_UPGRADE_V3_2_5`。protobuf 定義はチェーン v3.2.5 と同期されました |
| チェーン開発者キット | npm のみの 0.11.0 から 0.12.0 に含まれます。`@qorechain/evm` は viem のチェーン `qorechain`（9801）と `qorechainTestnet`（9800）、および EVM 認可ウィンドウのヘルパー（`evmWindowStatus`、`openEvmWindowMessage`。viem なしの `@qorechain/evm/window` としても提供）をエクスポートします。`create-qorechain-dapp` には `foundry`、`hardhat`、`viem-wagmi`、`cosmwasm` のテンプレートがあります。`@qorechain/react` には `PqcStatusBadge` があります（従来の `QuantumSafeBadge` の名前は非推奨のエイリアスとして残されています） |
| 修正 | `svmRpc` のないエンドポイントを渡された `@qorechain/svm` は localhost を使っていましたが、現在はエンドポイントが設定されていないと報告します。Python のコード生成は、QoreChain の proto 間のインポートをパッケージ内に向けます |

**アップグレード時に確認すべき動作の変更。** コードが localhost の既定に依存していた場合は、
`localnet` を選択するか、`endpoints` を渡してください。公開テストネットのエンドポイントは IP ごとに
レート制限されているため、本番のトラフィックは自前のノードを運用または利用してください。
公開ネットワークでは、どのプリセットも gRPC や SVM のエンドポイントを設定しておらず
（SVM トランザクションは開放されていません）、メインネットには公開の EVM WebSocket もありません。
これらのいずれかを必要とするコードは、localhost にフォールバックする代わりに、渡すべきエンドポイントの名前を示す
エラーで失敗します。Rust では、任意のエンドポイントは `Option<String>` になりました。Python、Go、
Java では、未設定のエンドポイントはそれぞれ `None`、空文字列、`null` です。

ノードはバイナリのバージョンを報告しません。機能を検出するには、それをもたらすすべてのアップグレード名について
`isUpgradeApplied` を呼び出すか、`https://download.qore.host/<net>/latest.json` から `.version` を読み取ってください。

## 0.10.0 で追加された内容 {#whats-new-0100}

SDK 0.10.0 は、チェーン **v3.2.4** に対応するクライアントリリースです。メインネットは
2026年10月23日に高さ 3,742,566 で適用しました（テストネットは 10月19日に高さ 8,337,253 で適用）。
署名形式、アドレス、小数桁数、メモ、手数料は変わっておらず、0.9.0 で構築したトランザクションは
引き続き有効です。このリリースは、テストネット上の実際のトランザクションを使って、すべての言語で
確認されました。v3.2.4 より後に導入されたものに対するビルダーはありませんでした。v3.2.5 の追加分は
[0.12.0](#whats-new-0120) で加わりました。メインネットは 2026年11月12日から v3.2.7 を実行しており（高さ
4,164,600、ガバナンス提案 16。v3.2.6 は 11月4日に高さ 4,020,000 から。その前は v3.2.5 で、10月29日に高さ 3,906,833 から）、署名形式が
変わっていないため 0.10.0 はそこでも引き続き動作します。テストネットは v3.2.5 と v3.2.6 を
2026年10月26日と27日に、v3.2.7 を 11月6日に、v3.2.8 を 11月12日に適用しました（v3.2.7 のメッセージのビルダーを持つ SDK リリースはなく、これらのメッセージは 2026年11月12日からメインネットにあります）。0.10.0 がもたらしたもの（そのすべてが 0.14.0 にも含まれています）:

| 領域 | 0.10.0 での内容 |
| --- | --- |
| ステーキングティア（`x/stakingtier`） | コンポーザー `lockDelegation`（チェーン自身のチェック: 期間は 3、6、または 12 か月で、正の整数の金額）、`unlockEarly`、`claimBonus`、`updateParams`。モジュールパラメータ、保有者のロック、ボーナスプールの読み取り（`fetchStakingTierParams`、`fetchStakingLocks`、`fetchStakingTierPool`）。モジュールのエラーコード。モジュールの動作は[ステーキングと委任](/user-guide/staking-and-delegation)に記載されています |
| オーセンティケーターのノンス | `fetchAuthNonce({ rest, address, pubkey })` は、リンクされた鍵が `MsgExecuteEVM` / `MsgExecuteCosmos` で次に署名しなければならないシーケンスを、手作業で追跡する代わりに `/qorechain/abstractaccount/v1/auth_nonce/{address}/{pubkey_hex}` から読み取ります。両ネットワークがこのルートを提供しています。`abstractaccount` モジュール自体はメインネットでは無効（テストネットでは有効）なため、メインネットでは、ノンスが確認される前に支出は拒否されます |
| プロトコル機能スイッチ | `fetchProtocolFeatures` と `isProtocolFeatureEnabled` は、ネットワークがどのコンセンサスルールを適用しているかを、名前で `/qorechain/pqc/v1/protocol_features` から読み取ります（両ネットワークが提供）。v3.2.4 より前のネットワークはこのルートを提供しません。そこでは `isUpgradeApplied` を使用してください |
| `possessionProven` | PQC ステータスは、アカウントの鍵が所有証明付きで登録されたかどうかを示します |
| `ibcTimeoutTimestamp(seconds)` | `MsgTransfer` が受け取る単位（Unix ナノ秒）での絶対 IBC タイムアウトです。IBC のタイムアウトは絶対時刻です。IBC v2 パケットは絶対 Unix 秒を受け取り、そこに相対値を渡すと、手数料が課された後に拒否されます。メインネットで開いている IBC チャネルはありません（2026年10月27日に確認） |
| アップグレード定数とプロト | `CHAIN_UPGRADE_V3_2_4`。protobuf 定義はチェーン v3.2.4 と同期されました（ブリッジバリデータ登録、ライトノード、ロールアップのクエリに新しいフィールド） |
| `ensurePqcRegistered` | 以前は公開鍵のないステータスを一致として比較していました。現在は `rest` 経由で鍵を読み取って比較します。読み取る元がない場合、結果は鍵が呼び出し元のものだと主張する代わりに `keyVerified: false` を報告します |
| 手数料シミュレーション中の拒否 | テキストとしてのみ届くチェーンの拒否（たとえば「no bonus to claim」）は、すべての言語で、チェーンに登録されたエラー説明から名前が付けられるようになりました: `decodeTxError`（TypeScript）、`SimulationRefusedError`（Python）、`tx.DecodeRefusalText`（Go）、`tx::decode_refusal_text`（Rust）、`TxError.decode`（Java） |

`@qorechain/react` と `create-qorechain-dapp` も、これに合わせて 0.10.0 になりました。現在は
両方とも 0.14.0 です。

## 0.9.0 で追加された内容 {#whats-new-090}

SDK 0.9.0 は、チェーン **v3.2.2** および **v3.2.3** に対応するクライアントリリースでした（メインネットは
それぞれ高さ 3,556,788 と 3,662,051 で適用済み。メインネットは 2026年10月23日（高さ 3,742,566）から v3.2.4 を実行し、10月29日から v3.2.5 を、2026年11月4日から v3.2.6 を実行し、2026年11月12日から v3.2.7 を実行しており、テストネットは 2026年10月19日から v3.2.4 以降を実行しています）。
署名形式、アドレス、小数桁数、メモ、手数料は変わっていないため、
0.8.1 以降が署名する v2 ハイブリッド sign-bytes 形式が引き続き正しいものです。
新しい点は次のとおりです。

| 領域 | 0.9.0（およびそれ以降）での内容 |
| --- | --- |
| ハイブリッド `TxClient`（TypeScript） | アカウントの鍵ペアを渡します: `client.connectTx(signer, { pqcKeypair })` または `TxClient.connect({ …, pqcKeypair, rest })`。すると、すべてのトランザクションがハイブリッドで署名され、`fee: "auto"` はハイブリッドトランザクションそのものをシミュレートします。単独の鍵登録は古典署名のままです（チェーンのブートストラップ経路）。`bankSend` と、SDK のロールアップ、マルチレイヤー、クロス VM の各クライアントがこれを使用します。鍵ペアを渡さない場合は何も変わりません |
| 復元可能な PQC 鍵 | `derivePqcCanonical(address, mnemonic)` と、各言語でのその相当機能（[ハイブリッド署名](/sdk/guides/quantum-safe#canonical-derivation)を参照） |
| `ensurePqcRegistered` | まず REST（`rest`）で鍵の状態を読み取り、判断できない場合は登録を拒否し、アカウントがすでに別の鍵を保持している場合は `PqcKeyMismatchError` を投げ、チェーンの「すでに登録済み」という拒否を成功として扱います。チェーン v3.2.3 以降は、**所有証明**に自分で署名して添付します。v3.2.3 より前はフィールドを付けません |
| スコープ付き EVM ウィンドウ | `openEvmWindowMsg` は `nativeOnly` と `allowedTargets`（最大 16 件、重複不可）を受け取り、`fetchEvmWindow` は両方を読み戻します（[EVM ガイド](/sdk/guides/evm#evm-window)を参照） |
| EIP-7702 の同意 | `authorizeEvmDelegationMsg`、`clearEvmDelegationMsg`、`fetchEvmDelegationConsent`、`evmDelegationTupleNonce`、`classifyEvmDelegationRejection` |
| 鍵の完全性 | 登録ビルダーは、`classical_only`、空の鍵、縮退した ML-DSA-87 鍵を拒否します。これらは v3.2.3 以降チェーンも拒否します。`signProofOfPossession` / `verifyProofOfPossession` がエクスポートされ、`migratePqcKeyHybrid` は、v3.2.3 以降に鍵を持つアカウントが必要とするハイブリッド署名付きの `MsgMigratePQCKey` を送信します |
| アブストラクトアカウントのダイジェスト v2 | `evmAuthSignBytesV2`（呼び出しのガスリミットを束縛）と `resolveEvmAuthDigestVersion`。`abstractaccount` モジュールはメインネットでは無効化されており（テストネットでは有効）、メインネットではこれは参照用です |
| アップグレードの検出 | `isUpgradeApplied`、`requireUpgradeApplied`: 新しい任意フィールドは、`applied_plan` がそのリリースを報告した後にのみ設定されます。リリースを適用していないノードは、そのリリースの新しいフィールドが設定されたトランザクション全体を拒否するためです |
| エラーのデコード | ブロック内での失敗はそのコードスペースを保持します（たとえば `sdk_231` ではなく `pqc` 231）。`rate_limited` と委任コードがデコードされ、`decodeTxError` は投げられたエラーのログまたはメッセージを読み取ります |
| 支出ルール | `validateSpendingRules` が `MsgUpdateSpendingRules` ビルダー内で実行され、何も制限しないルールを拒否します |
| 修正 | PQC アカウントのルートは、すべての SDK で単数形の `/qorechain/pqc/v1/account/{address}` です（合成クライアントを渡した場合の `client.rest.getPqcAccount`、`isPqcRegistered`、`getPqcStatus` も同様）。エクスポートされる `VERSION` がパッケージと一致します。SDK が作成する Go と Rust のクライアントは、ハングせずにタイムアウトします。`create-qorechain-dapp` のテンプレートは、同梱されているリリースに依存します |

新しい鍵に対するレガシーな PQC 導出（`derivePqcLegacy`、`"bridge"`）は
非推奨です。アカウントに束縛されていないため、1 つのニーモニックがすべての
アカウントに同じ 1 つの鍵を与えてしまいます。ローテーションヘルパーは、これを**新しい**鍵として使うことを拒否します。既存のレガシー鍵の復元や、
そこからのローテーションは引き続き可能です。

## 0.9.0 より前のバージョン {#before-090}

0.8.x を使用している場合でも、両ネットワークが検証する形式で署名し、
メインネットとテストネットで動作します。以下は 0.9.0 で解消された制限で、
知らないと手数料がかかるものもあります。

| 0.9.0 より前のリリース | 回避策 |
| --- | --- |
| 所有証明、スコープ付きウィンドウ、EIP-7702 同意のビルダーがない | `qorechaind tx pqc register-key-v2 … --pqc-key <name>`、`open-evm-window --native-only` / `--allowed-targets`、`authorize-evm-delegation` / `clear-evm-delegation` を使用します（[EVM 認可ウィンドウ](/getting-started/first-transaction#evm-window)、[EIP-7702 委任](/architecture/post-quantum-security#eip-7702)を参照） |
| `status` なしの `ensurePqcRegistered` は、確認せずに登録をブロードキャストし、別の鍵が登録されていても成功と報告していた | すでに鍵を持つアカウントへの 2 回目の登録は、**手数料が徴収された後に**拒否されます。まず `GET /qorechain/pqc/v1/account/{address}` を読み取り、`status: { registered: found }` を渡してください |
| `client.rest.getPqcAccount`、`isPqcRegistered`、`getPqcStatus` | 複数形の `/accounts/` パスまたは `qor_` 名前空間を呼び出していましたが、公開エンドポイントはこれらを提供していません（HTTP 501、`-32601`）。上記の単数形の REST ルートを読み取ってください |
| `TxClient` / `bankSend` と、ロールアップ、マルチレイヤー、クロス VM の各クライアントは、古典署名のみで署名していた | ネットワークは、鍵を持つアカウントに対してこれを拒否します。`signAndBroadcastHybrid` を通じて送信してください |
| ブロック内で失敗したトランザクションがコードスペースを失っていた | `GET /cosmos/tx/v1beta1/txs/{hash}` からトランザクションを読み取ってください |
| 0.8.3 のエクスポートされた `VERSION` 定数が `0.8.0` を報告していた | インストール済みのバージョンは `package.json` から読み取ってください |
| `create-qorechain-dapp` 0.8.0 は `@qorechain/sdk` / `@qorechain/evm` を `^0.3.0` に固定していた（0.x バージョンに対するキャレットは 0.3 の範囲内にとどまります） | スキャフォールド後に `npm i @qorechain/sdk@latest` を実行してください |
| `@qorechain/react` 0.8.x は、公開エンドポイントで登録済み鍵の状態を読み取れないままだった | `@qorechain/react` 0.9.0 以降を使用してください |

:::caution 過去の修正
SDK **0.6.1** はコンセンサスに致命的なバグを修正しました。
`/qorechain.pqc.v1.PQCHybridSignature` tx-body 拡張が `Any.value` に
JSON シリアライズされており、**チェーンが CheckTx で拒否**していました。SDK ≤ 0.6.0 で構築した
ハイブリッド（PQC + 古典）トランザクションはオンチェーンで拒否されます。**0.8.0** では
ウォレット署名によるアカウントヘルパーが削除されました（
[アカウントと PQC 署名](/sdk/concepts/accounts-pqc#phantom)を参照）。
:::

## TypeScript

コアパッケージ:

```bash
npm i @qorechain/sdk
```

Node.js 20+ を対象とし、ESM、CommonJS、型定義を同梱しています。このドキュメントの
ハイブリッドトランザクションのサンプルは、`@cosmjs/stargate` から
`StargateClient` もインポートします（`npm i @cosmjs/stargate`）。

### EVM アダプター

`@qorechain/evm` は [viem](https://viem.sh) の上に構築された、薄くて型安全なアダプターです。
viem は**ピア依存**です。一緒にインストールしてください:

```bash
npm i @qorechain/evm viem
```

npm には `0.14.0` で公開されています。viem のチェーン `qorechain`（チェーン ID 9801）と `qorechainTestnet`（9800）、および [EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)のヘルパーをエクスポートします。

### SVM アダプター

`@qorechain/svm` は
[`@solana/web3.js`](https://solana.com/docs/clients/javascript)（これは
**ピア依存**です）の上に構築された薄いアダプターです:

```bash
npm i @qorechain/svm @solana/web3.js
```

npm には `0.14.0` で公開されています。

### React キット

`@qorechain/react` は `@qorechain/sdk` の上に構築された公式の React レイヤーで、
プロバイダー、フック、`ConnectButton` / `PqcStatusBadge` コンポーネントを提供します。
`react`（>=18）はピア依存です:

```bash
npm i @qorechain/react
```

npm には `0.14.0` で公開されており、`@qorechain/sdk` `^0.14.0` に依存します。[React キットガイド](/sdk/guides/react)を参照してください。

### スキャフォルダー

`create-qorechain-dapp`（npm、`0.14.0`）はすぐに実行できる dApp を生成します:

```bash
npm create qorechain-dapp@latest my-dapp
```

生成される `package.json` ファイルは、スキャフォルダーが同梱している SDK リリースに依存します
（`@qorechain/sdk` `^0.14.0`。EVM テンプレートは `@qorechain/evm` `^0.14.0` を使用します）。バージョン 0.13.1 で変わったのはテンプレートだけで、0.14.0 にはその修正が含まれています。[スキャフォルダーと CLI](/developer-tools/scaffolders-and-cli#template-fixes-0131) を参照してください。コントラクト作業向けの `foundry`、`hardhat`、`viem-wagmi`、`cosmwasm` テンプレートもあります。
スキャフォルダーのバージョン 0.8.0 は `^0.3.0` の範囲を書き込んでいましたが、0.x バージョンではこれは
0.3 の範囲内にとどまり、稼働中のネットワーク向けに署名できません。0.8.0 でスキャフォールドした場合は、
`npm i @qorechain/sdk@latest` を実行してください。[CLI リファレンス](/sdk/reference/cli)を参照してください。

## Python

```bash
pip install qorechain-sdk
```

Python 3.10+ が必要です。パッケージには型ヒントと `py.typed` マーカーが含まれています。

> ディストリビューションは `qorechain-sdk` としてインストールされます（PyPI に `0.14.0` で公開）
> が、**インポートは `qorsdk`** で行います:
>
> ```python
> import qorsdk
> ```

## Go

```bash
go get github.com/qorechain/qorechain-sdk/packages/go/...
```

Go 1.23+ が必要です。必要なサブパッケージをインポートします。例:

```go
import (
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/client"
    "github.com/qorechain/qorechain-sdk/packages/go/qorechain/accounts"
)
```

自己完結型の Go モジュールとして公開されています（タグ `packages/go/v0.14.0`）。バージョンを
明示的に固定してください: `go get github.com/qorechain/qorechain-sdk/packages/go@v0.14.0`。

## Rust

```bash
cargo add qorechain-sdk
```

または、リポジトリの先頭を追跡するには:

```toml
[dependencies]
qorechain-sdk = { git = "https://github.com/qorechain/qorechain-sdk" }
tokio = { version = "1", features = ["macros", "rt-multi-thread"] }
```

Rust 1.74+ が必要です。読み取りクライアントは非同期（Tokio）です。クレートは
`qorechain` としてインポートされます（`use qorechain;`）。

> crates.io には `qorechain-sdk`（0.14.0）として公開されています。`cargo add qorechain-sdk` は
> 最新リリースをインストールします。

## Java

Maven（`pom.xml`）:

```xml
<dependency>
  <groupId>io.github.qorechain</groupId>
  <artifactId>qorechain-sdk</artifactId>
  <version>0.14.0</version>
</dependency>
```

または Gradle:

```groovy
implementation 'io.github.qorechain:qorechain-sdk:0.14.0'
```

> Maven Central に `io.github.qorechain:qorechain-sdk` として公開されています（0.14.0 が現行バージョンです）。JDK 17 以降が必要です。
> Central には 0.8.0 および 0.8.1 のビルドがないため、稼働中のネットワークでは
> 0.8.2 以降を使用してください。0.9.1 は Java 専用のリリースで、API の変更なしに
> Bouncy Castle を 1.80 から 1.85 に更新したものでした。

## 関連パッケージ {#related-packages}

| パッケージ | 用途 | バージョン |
| --- | --- | --- |
| `@qorechain/wallet-adapter` | ウォレット側のヘルパー: ウォレット生成（`generateQoreWallet`）、`eth_secp256k1` ハイブリッド署名（`signHybridEth`、`QoreChainSigner`）、MetaMask へのネットワーク登録（`addQoreEvmToWallet`）、authenticator および EVM ウィンドウのメッセージビルダー（その `openEvmWindowMsg` が構築するのはスコープなしの形式のみ）、v2 のアブストラクトアカウントダイジェスト。所有証明は添付しません。ピア依存: `@cosmjs/proto-signing` と `@cosmjs/stargate` `^0.32`（SDK は cosmjs 0.39 を使用するため、同じプロジェクトに両方をインストールすると npm がピアの競合 `ERESOLVE` を報告します。別々のプロジェクトに分けるか、`--legacy-peer-deps` を渡してください） | 0.5.0 |
| `@qorechain/chain-bridge` | バックエンド向けのサーバー側ワーカー: PQC 鍵を導出し、ハイブリッド署名してブロードキャストします（`sendTokens`、`registerPqc` など）。`cosmosRest` を渡してください。渡すと、ネットワークが v3.2.3 を適用した後は登録に所有証明が付き、PQC に見える拒否は再登録の前にチェーンと照合されます（異なる鍵が登録済みの場合は、2 回目の登録に手数料を払う代わりに `pqc_key_mismatch` が発生します） | 0.2.3 |
| `@qorechain/pqc` | 標準のみに準拠した ML-DSA / ML-KEM / SHAKE-256 プリミティブと `hybridSignBytes`（[ポスト量子署名](/developer-guide/post-quantum-signing)を参照）。PyPI、crates.io、Maven Central、Go プロキシ（Go は `v0.2.3`）にも同じバージョンで公開されています | 0.2.3 |
| `@qorechain/handles` | 検証済みの `@handle` 解決（`HandleClient`）: レジストリの公開鍵とピンストアはあなたが用意し、ユーザーがアドレスを確認した後にあなたがピン留めします。パッケージが自分でピン留めすることはありません。[チェーンブリッジとハンドル](/developer-tools/chain-bridge#handles)を参照 | 0.1.0 |
| `@qorechain/connect` | **npm で非推奨となり、メンテナンスも終了しています。新規の作業では使用しないでください。代わりに [`@qorechain/wallet-adapter`](/developer-tools/wallet-adapter) を使用してください (QoreX 接続の代替手段は[開発者ツールの概要](/developer-tools/overview#group-connect)にあります)。** EVM、Cosmos、SVM のウォレットに対応する単一のコネクター。ウォレットアダプター上に構築されています（そのピア範囲は `@qorechain/wallet-adapter` `^0.2.1` で、0.5.0 は含まれません）。[EVM 認可ウィンドウ](/sdk/guides/evm#evm-window)は開かないため、アカウントが登録済みの鍵と開いているウィンドウを持つまで、これを通じた EVM 送信は拒否されます | 0.2.1 |
| `@qorechain/rdk` | Rollup Development Kit クライアント（[ロールアップ](/rollups/why)を参照）。0.7.0 以降は `@qorechain/sdk` `^0.10.0` と `@qorechain/evm` `^0.8.0` に依存します（2026年11月4日に npm で確認）。0.x バージョンに対するキャレットはそのマイナーバージョンの範囲内にとどまるため、SDK 0.13.0 を使うアプリには、キット用に 2 つ目のネストされた SDK 0.10.x のコピーが入ります。キットのリリースが 0.13 に移行するまで、両者は分けて扱ってください（一方のコピーのクライアントをもう一方に渡さないでください）。`pqcKeypair` を渡した場合にのみハイブリッド署名を行い、読み取りはそれなしでも動作します。PyPI、crates.io、Maven Central では `qorechain-rdk` として、また Go モジュールとしても公開されています（`@v0.8.0` を固定してください）。0.8.0 からそれら 4 つのクライアントもハイブリッド署名を行います（以前のバージョンは古典署名のみで署名。Java には Java 21 が必要です）。[RDK 0.8.0：変更点と制限](/rollups/deploying-a-rollup#rdk-050-limits)を参照 | 0.9.0 |
| `@qorechain/rdk-cli` | RDK 用の `qorollup` オペレーター CLI。0.7.1 以降、そのトランザクションコマンド（`create`、`pause`、`resume`、`stop`、`withdraw`）はハイブリッド署名を行います（0.7.0 以前は古典署名のみで署名し、ネットワークに拒否されていました）。npm からインストールすると動作し、`--version` はインストールされているバージョンを表示します（0.6.1 以前は何も表示しませんでした） | 0.9.0 |
| `@qorechain/qoreseal` | QoreSeal: アカウントが KEM レジストリに公開した ML-KEM-1024 鍵に宛てて、ペイロードを暗号化します（SDK 0.12.0 以降は鍵の登録と読み取りを行い、暗号化は QoreSeal が行います）。PyPI（`qorechain-qoreseal`。macOS と Linux のホイール、Windows のホイールは次のバージョン）、crates.io、Maven Central（`io.github.qorechain:qoreseal` と `qoreseal-android`。Kotlin から使う場合は Kotlin 2.3 以降が必要）、Go モジュールプロキシ（`github.com/qorechain/qoreseal/go`、Go `v0.1.0`）、および Swift パッケージとしても公開されています。[QoreSeal](/developer-tools/qoreseal)を参照 | 0.1.0 |
| `@qorechain/asset-kit` | Asset Kit: EVM Engine 上の許可型の実世界資産トークン向けのツール群で、TypeScript、Python、Java、Go のクライアントと Solidity コントラクトを備えます（`forge install qorechain/qorechain-asset-kit@v0.1.0`）。Apache-2.0。ただし ERC-3643 のスクリプトとテストは GPL-3.0-or-later です。記載されているネイティブモジュールは提案であり、実装されていません。PyPI では `qorechain-asset-kit`、Maven Central では `io.github.qorechain:asset-kit` としても公開されています。[Asset Kit](/developer-tools/asset-kit)を参照 | 0.1.0 |
| `@qorechain/qoresign` | QoreSign: ウォレットとバックエンドの署名、およびコミット済みトランザクションのポスト量子レイヤーを確認する `inspectTransaction`。PyPI、crates.io、Maven Central でも公開されています。[QoreSign](/qoresign/overview)を参照 | 0.2.0 |
| `create-qorechain-rollup` | ロールアップのスターター・スキャフォルダー。そのテンプレートは `@qorechain/rdk` `^0.9.0` に依存し、`QORE_MNEMONIC` または `QORE_PQC_SEED_HEX` からポスト量子鍵を解決できる場合はハイブリッド署名を行います | 0.9.0 |

## 次のステップ

[クイックスタート](/sdk/quickstart)に進んで、接続とオンチェーン状態の読み取りを行いましょう。
