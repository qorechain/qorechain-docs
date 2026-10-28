---
slug: /developer-tools/asset-kit
title: QoreChain Asset Kit
sidebar_label: Asset Kit
sidebar_position: 35
---

# QoreChain Asset Kit

QoreChain Asset Kitは、QoreChain上で現実資産を表す許可型トークンを発行・管理するための、オープンソースのツール群です。ステータスの異なる2つの部分から成ります。1つは、今日QoreChain EVM Engine上で動作するEVMコントラクト群です。規制対象資産向けの2つのオープンなトークン標準(ERC-3643とCMTAT)のアダプター、持分を制限したボールト、そしてすべての保有者に登録済みのML-DSA-87鍵を求める、QoreChain固有の制御が1つ含まれます。もう1つは、ネイティブのチェーンモジュールの**提案**です。protobufインターフェース、4つの言語のクライアント、メモリ内のモックとして公開されており、アプリケーションを提案されたルールに対して設計・テストできます。

対象は、QoreChainテストネットで規制対象トークンのプロトタイプを作りたい、発行者、名義書換代理人、ファンド管理者、コンプライアンスおよび法務のチーム、インテグレーターです。バージョン**0.1.0**、Apache-2.0([公開場所](#where-published)に記載のライセンス例外を除く)、QoreChain Associationがメンテナンスしています。1.0より前の版であり、**監査を受けていません**。

:::caution 稼働しているものと、していないもの
- **今日動作するもの(テストネットのみ):** EVMコントラクト、Foundryのデプロイスクリプト、発行者コンソール。`qorechain-diana`(EVMチェーンID 9800)上で動作します。保有者チェックは`0x0A02`の`pqcKeyStatus`プリコンパイルを読み取りますが、これはテストネットで有効であり、**メインネットでは有効ではありません**。
- **メインネット(`qorechain-vladi`、EVMチェーンID 9801):** 保有者チェックは**フェイルクローズ**です。明示的に免除されていないアドレスはすべて不適格と見なされるため、ガードで制限されたトークンは一般の保有者間で移動できません。デプロイスクリプトはチェーン9801での実行を拒否します。
- **提案であり、どこでも稼働していないもの:** ネイティブモジュール`x/asset`、`x/identity`、`x/compliance`、`x/settlement`、`x/attest`はどのQoreChainネットワークにも存在せず、これらを追加するアップグレードも予定されていません。これらのクライアントが通信できるのは、メモリ内のモックだけです。
- **リポジトリ内の法務テンプレート**は、弁護士との議論のための、レビューを受けていないドラフトです。法的助言ではありません。
:::

## 革新点 {#innovations}

- **標準自身の制御に加えた、ポスト量子の保有者チェック。** ガードは`0x0A02`の`pqcKeyStatus(address)`を読み取り、`registered`、アルゴリズムID 1(ML-DSA-87)、`possessionProven`のすべてを満たす場合にのみアドレスを受け入れます。所有証明のない登録済み鍵は他人のものである可能性があるため、有効とは見なしません。上流の標準が持つすべての制御(アイデンティティレジストリ、クレームトピック、凍結、一時停止、強制移転)は引き続き適用され、このチェックはそれらに追加されます。
- **厳格なデコードによるフェイルクローズ。** ガードは固定のガス上限でプリコンパイルを呼び出し、応答を厳格にデコードします。古い3フィールド形式の応答、不正な形式の応答、応答なしは、いずれも「鍵なし」として扱われます。プリコンパイルが有効でない場所では、免除されていないすべてのアドレスが不適格になります。
- **3つのアダプターの背後にある同じガード。** `QoreChainHybridHolderRule`は、制限コード60、61、62とともに、CMTAT v3トークンの`ruleEngine`として(またはCMTA RuleEngine内のルールとして)接続されます。`QoreChainHybridHolderModule`は、プラグアンドプレイのモジュールとしてERC-3643のモジュール式コンプライアンスに接続されます。ボールトは、ガードを含む任意の`IHolderEligibility`ポリシーを受け付けます。
- **制限付きトークンを迂回させないボールトの持分。** `QoreChainRwaVault`(ERC-4626)と`QoreChainRwaAsyncVault`(ERC-7540。リクエストは`FULFILLER_ROLE`を持つオペレーターがバッチで決済)は、持分のあらゆる移動の受け取り側を確認します。不適格な受取人に対しては、`maxDeposit`と`maxMint`がゼロを返します。償還が拒否されることはありません。
- **変更しない上流のコントラクト。** T-REX 4.1.6、ONCHAINID 2.2.1、CMTAT 3.2.0、OpenZeppelinは、コピーではなくgitサブモジュールです。
- **存在する前にテストできる提案。** `ChainClient`のすべての呼び出しは、ネットワークリクエストを一切送らずに、`ChainUpgradeRequired`(コード`CHAIN_UPGRADE_REQUIRED`とモジュール名)で失敗します。`MockChain`は提案されたルールをメモリ内で実装し、提案されたエラーコード名(例: `ERROR_CODE_ADDRESS_FROZEN`)を持つ`MockChainError`で拒否します。アプリケーションはモックに対して書き、実際のクライアントも接続したままにできるため、アップグレードがないことは、黙って失敗するのではなく、明確に報告されます。
- **バックエンドのないコンソール。** 発行者コンソールは、自身ではネットワークリクエストを一切行わないReactのページです。本番ビルドは`connect-src 'none'`のContent-Security-Policyを設定し、すべての通信は接続されたウォレットを経由します。
- **オフラインで動くテスト。** 33件のFoundryテストが、プリコンパイルのテストダブルを使い、ネットワークなしで実行されます。

## 機能 {#what-it-does}

**QoreChain EVM(テストネット)で今日動作するもの:**

- **`QoreChainHybridHolderGuard`。** アドレスに、所有証明つきの登録済みML-DSA-87鍵があるかどうかを報告します(`isHybridHolder`、`isEligible`、`requireHybridHolder`、`keyStatus`、`precompileActive`)。ボールトやエスクローなどのコントラクト向けに、オーナーが管理する免除があります(`setExempt`、理由つきのイベント`ExemptionSet`)。オーナーシップは2段階で移転します(OpenZeppelinの`Ownable2Step`)。
- **`QoreChainHybridHolderRule`。** ガードに対応づけられた、CMTAT v3の移転ルールです。制限コード60(送信者)、61(受信者)、62(支出者)を、`detectTransferRestriction`、`detectTransferRestrictionFrom`、`messageForTransferRestriction`で返します。
- **`QoreChainHybridHolderModule`。** ガードに対応づけられた、ERC-3643(T-REX v4)のモジュール式コンプライアンスのモジュールです。`moduleCheck`が送信者と受信者を確認します。コンプライアンスごとの設定はありません。
- **`QoreChainRwaVault`と`QoreChainRwaAsyncVault`。** 上に記載のとおりです。
- **`IERC7518`。** ERC-7518のパーティションのインターフェーススケッチで、実装はありません。そのERC-165 id `0x5a264a5d`はテストで確認されています。
- **デプロイスクリプト(Foundry)。** `script/DeployCmtat.s.sol`、`script/erc3643/DeployErc3643.s.sol`、`script/DeployVaults.s.sol`。共通のプリフライト(`script/QoreChainTestnet.sol`)が、プリコンパイルが応答するかどうかとデプロイヤーの鍵のステータスを報告し、チェーン9801を拒否します。
- **発行者コンソール**(`packages/issuer-console`)。任意のEIP-6963ウォレットに接続し、QoreChain Testnetを追加または切り替えます。ガードで制限されたCMTATトークン(`DeployCmtat.s.sol`と同じく、ガード、ルール、トークン)を作成し、既存のCMTATまたはERC-3643トークンを開き、エージェント操作(ミント、バーン、凍結、凍結解除、強制移転、一時停止、再開)を実行し、チェーンのイベントから作った保有者一覧と監査ログを表示します。

**提案(チェーン上にはないもの):**

- `x/asset`、`x/identity`、`x/compliance`、`x/settlement`、`x/attest`の`proto/`にあるprotobufインターフェースと、`docs/proposal.md`にあるその意味論。
- TypeScript、Python、Go、Javaのクライアント: 生成された型、`ChainClient`、`MockChain`。

**リポジトリ内のリファレンスドキュメント:**

- `docs/evm-adapters.md`: コントラクト、上流のライセンス、テストネットへのデプロイ。
- `docs/technology-standards.md`: 発行者や監査人が必要とする形でネットワークを説明するドラフト(信頼性、ガバナンス、アップグレードの権限、トランザクションの順序、可観測性、インシデント対応、鍵管理)。各事実には、Verified、Documented、Not measured、Not publishedのラベルが付いています。
- `legal/`: 議論のための3つのテンプレート([制限事項](#limits)を参照)。

## ユースケース {#use-cases}

1. **発行者がテストネットで許可型トークンのプロトタイプを作る。** 発行者は`DeployCmtat.s.sol`(または発行者コンソール)でCMTATトークンを、`DeployErc3643.s.sol`でERC-3643の完全なスイートをデプロイし、実際の発行を判断する前に、`qorechain-diana`上で凍結、一時停止、強制移転、保有者チェックを試します。
2. **ファンド管理者が、制限付き持分のボールトで申込みと償還を処理する。** 投資家は`QoreChainRwaAsyncVault`に入金をリクエストし、管理者は`fulfillDeposit`と`fulfillRedeem`でバッチ処理します。持分を受け取れるのは適格なアドレスだけですが、償還は持分を持つすべての人に開かれたままです。
3. **コンプライアンスチームが、すべての保有者にポスト量子鍵の登録を求める。** `QoreChainHybridHolderRule`(CMTAT)または`QoreChainHybridHolderModule`(ERC-3643)を追加すると、標準自身のアイデンティティとアローリストの制御に加えて、トークンのミントや移転は、所有証明つきの登録済みML-DSA-87鍵を持つアドレスに対してのみ行えるようになります。
4. **インテグレーターが、提案されたネイティブモジュールに対して構築する。** ウォレット、レジストリ、バックオフィスは、TypeScript、Python、Go、Javaの`MockChain`に対してコードを書き、そのイベントとエラーコードを検証し、`ChainClient`も接続したままにします。
5. **プロダクトチームが、DvP(引渡しと決済の同時履行)とアテステーションのフローを設計する。** 提案されている`x/settlement`(双方の確認を伴う指図、全レグ成立または不成立)と`x/attest`(有効期間と陳腐化を持つ陳述)を`MockChain`で試してユーザーフローを設計できます。ただし、どちらもチェーン上には存在しません。
6. **法務チームが、弁護士とともに書類作成を始める。** スイスの台帳型証券、リヒテンシュタインのTVTGトークン条件、EU DLTパイロット制度の委託契約のテンプレートは、構成と、記入するための技術的な対応づけのセクションを提供します。いかなる利用の前にも、当該法域の有資格の弁護士がすべてをレビューします。
7. **デューデリジェンスのレビュアーが、ネットワークの事実を読む。** `docs/technology-standards.md`は、稼働中のネットワークで確認できること、測定されていないこと、公開されていないことを、出典つきで一覧にしています。

## 仕組み {#how-it-works}

### EVM上の保有者チェック {#holder-check}

`0x0A02`のプリコンパイルは`pqcKeyStatus(address) returns (bool registered, uint8 algorithmId, bytes pubkey, bool possessionProven)`に応答します。ガードは`registered && algorithmId == 1 && possessionProven`を要求します。これによりガードはフェイルクローズになります。プリコンパイルが有効でない場所では、明示的に免除されていないすべてのアドレスが不適格です。プリコンパイル自体とそのネットワークでのステータスについては、[EVMプリコンパイル](/developer-guide/evm-precompiles)を参照してください。

```
                 CMTAT v3 token  -- ruleEngine -->  QoreChainHybridHolderRule --+
                                                                                +--> QoreChainHybridHolderGuard --> 0x0A02 pqcKeyStatus
ERC-3643 token -> ModularCompliance - module -->  QoreChainHybridHolderModule --+         (exemptions for contracts)
                                                                                |
       ERC-4626 / ERC-7540 vault shares ----------- IHolderEligibility ---------+
```

このチェックは追加的なものです。上流の標準が持つすべての制御は引き続き適用されます。ERC-3643のアイデンティティレジストリ(ONCHAINID)、クレームトピック、信頼できる発行者、凍結、部分凍結、一時停止、強制移転、リカバリー、そしてCMTATの凍結、部分凍結、一時停止、強制移転、ドキュメント、スナップショットです。

### チェックの対象範囲 {#coverage}

重要なのは受け取り側です。鍵のないアドレスへのミントや移転は拒否されます。CMTATのルールは送信者も確認し、`transferFrom`では支出者も確認します。ERC-3643のモジュールは送信者と受信者を確認します。ERC-3643は支出者をコンプライアンスモジュールに渡さないため、そこでは`transferFrom`の支出者は確認されません。バーンが拒否されることはありません(ERC-3643では、`burn`はコンプライアンスモジュールをそもそも参照しません)。そのため、適格性を失った保有者も償還を受けられます。

### ボールト {#vaults}

どちらのボールトも、持分のあらゆる移動の受け取り側を確認します。償還が拒否されることはありません。ERC-7540ボールトでは、リクエストはコントローラーごとに集約されます(リクエストid 0)。フルフィラーは、実行時のボールト自身の持分あたり資産比率で、保留中の入金を持分に変換します。外部の評価入力はありません。その後、コントローラーは`deposit`または`mint`、あるいは`redeem`または`withdraw`で請求します。ボールトのコントラクト自身が、原資産トークンを保有できる必要があります。ERC-3643のアイデンティティレジストリまたはCMTATのアローリストに登録し、ガードで免除されている必要があります(`DeployVaults.s.sol`がガードの免除を設定します)。

### QoreChainでEVMトランザクションを送信する {#native-prerequisites}

QoreChainのすべてのEVMトランザクションは、送信者が次の両方を満たす場合にのみ受け付けられます。

1. 登録済みのML-DSA-87鍵。`MsgRegisterPQCKeyV2`と所有証明で登録します。
2. 開いているEVM認可ウィンドウ。ハイブリッド署名(secp256k1とML-DSA-87)のNativeレーンのトランザクションで、`/qorechain.pqc.v1.MsgOpenEVMWindow`によって開きます。

デプロイの場合、ウィンドウの`allowed_targets`は**空**である必要があります(ターゲットを制限したウィンドウはコントラクト作成を拒否します)。`max_txs`はトランザクション数以上、`max_value`は各トランザクションの値と最大手数料の合計をカバーし、`blocks`は十分な長さ(最大17,280)で、`native_only`はfalseにします。ウィンドウを開くとアカウントのシーケンスが進み、これはEVMのnonceでもあります。先にウィンドウを開いてから、スクリプトを実行してください。呼び出しとガス見積もりにウィンドウは不要です。背景: [ポスト量子署名](/developer-guide/post-quantum-signing)と[EVM開発](/developer-guide/evm-development#evm-window)。

### 提案 {#proposal}

作成時に固定される、または緩和のみ可能な6つのフラグ(`require_auth`、`freezable`、`pausable`、`non_transferable`、`supply_cap`、`require_hybrid_signature`)。ロール(発行者、エージェント、監査人、アイデンティティエージェント、クレーム発行者、アテスター)。順序づけられた移転チェック。理由が記録される凍結、部分凍結、クローバック、強制移転。クレームを持ち、個人データはチェーン上に置かないアイデンティティ。バージョン管理されたコンプライアンスモジュール(`identity-verified`、`country-allowlist`、`country-blocklist`、`max-holders`、`max-balance`、`attestation-fresh`)のレジストリ。確認を伴う決済指図。`FRESH`、`STALE`、`MISSING`のステータスを持つアテステーション。仕様はリポジトリの`docs/proposal.md`です。文章とモックが食い違う場合は、文章が意図された動作です。これらはすべて設計であり、QoreChainのネットワークには何も存在しません。

## 使い方 {#how-to-use}

### インストール {#install}

| 部分 | インストール | 最小プラットフォーム |
|---|---|---|
| Solidityコントラクト(GitHubから) | `git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit`(タグ`v0.1.0`)、またはFoundryの依存関係として: `forge install qorechain/qorechain-asset-kit@v0.1.0` | Foundry、solc 0.8.28(T-REXとONCHAINIDのファイルは0.8.17を使用)、`evm_version = "cancun"` |
| Java | `implementation("io.github.qorechain:asset-kit:0.1.0")`(Maven `io.github.qorechain:asset-kit:0.1.0`) | Java 17 |
| Go | `go get github.com/qorechain/qorechain-asset-kit/clients/go@v0.1.0`(パッケージ`assetkit`) | Go 1.23 |
| Python | PyPIで`qorechain-asset-kit`として**近日公開**。まだ公開されていません。現時点ではクローンから: `cd clients/python && python -m pip install .`(インポートは`qorechain_asset_kit`) | Python 3.10 |
| TypeScript | npmで`@qorechain/asset-kit`として**近日公開**。まだ公開されていません。現時点ではクローンから: `pnpm install && pnpm -r build` | Node.js 22.12 |
| 発行者コンソール | クローンから: `pnpm install`、続けて`pnpm --filter @qorechain/issuer-console dev`(パッケージとしては公開されていません) | EIP-6963ウォレットを備えたブラウザ |

リポジトリのREADMEとTypeScriptクライアントのREADMEは、`@qorechain/asset-kit`がインストール済みであるかのようにインポートしています。これはnpmでのリリースまで、クローンからのみ動作します。

`forge install`を使うと、コントラクトは`lib/qorechain-asset-kit/contracts/`の下に、それ自身の依存関係は`lib/qorechain-asset-kit/contracts/lib/`の下に置かれます。ガード、CMTATのルール、ボールトをコンパイルできるリマッピングは次のとおりです。

```
qorechain-asset-kit/=lib/qorechain-asset-kit/contracts/src/
@openzeppelin/contracts/=lib/qorechain-asset-kit/contracts/lib/openzeppelin-contracts/contracts/
CMTAT/=lib/qorechain-asset-kit/contracts/lib/CMTAT/contracts/
```

### クイックスタート1: コントラクトのビルドとテスト(オフライン) {#quickstart-build}

リポジトリのREADMEからです。ネットワークもアカウントも不要です。

```bash
git clone --recurse-submodules https://github.com/qorechain/qorechain-asset-kit
cd qorechain-asset-kit/contracts
forge build && forge test
```

観測された出力は`33 tests passed, 0 failed, 0 skipped (33 total tests)`で終わります。

### クイックスタート2: テストネットに対するデプロイのドライラン {#quickstart-dry-run}

`--broadcast`を付けない場合、Foundryはテストネットの状態に対してシミュレートし、何も送信しません。ドライランでは、`--sender`にはどのアドレスでも使えます。

```bash
forge script script/DeployCmtat.s.sol --rpc-url qorechain_testnet --sender <deployer>
```

`qorechain_testnet`は`foundry.toml`で`https://evm-testnet.qore.host`として定義されています。プリフライトは、チェーンID(9800)、`pqcKeyStatus precompile: active`、デプロイヤーの鍵のステータスを出力します。鍵のないアドレスの場合は、`Broadcasting would fail: register an ML-DSA-87 key and open an EVM window first.`が追加されます。続いて、ガード、ルール、トークンが持つことになるアドレスを出力します。メインネットに対する同じコマンドは、`QoreChain mainnet: the hybrid-holder guard is testnet only`で停止します。`script/erc3643/DeployErc3643.s.sol`と`script/DeployVaults.s.sol`も同じ方法で実行できます。任意の環境変数: `CMTAT_ADMIN`、`CMTAT_NAME`、`CMTAT_SYMBOL`、`CMTAT_TOKEN_ID`、`CMTAT_TERMS_URI`、`TREX_AGENT`、`TREX_SALT`、`VAULT_ASSET`、`VAULT_GUARD`。

### テストネットでブロードキャストする前に {#before-broadcast}

1. 自分で管理するテストネットのアカウントと、少量のテストネットQORを用意します([フォーセット](/dashboard/faucet)を参照)。メインネットのニーモニックは絶対に使わず、例で使われている公開テスト用フレーズには決して入金しないでください。
2. そのML-DSA-87鍵を所有証明つきで登録します([QoreSign](/qoresign/overview)の`examples/register-and-send`の例が登録を行います)。
3. [EVMトランザクションの送信](#native-prerequisites)の設定で、`allowed_targets`を空にして、EVM認可ウィンドウを開きます。[QoreChain SDK](/sdk/overview)がメッセージを構築し(TypeScriptでは`pqc`メッセージグループの`openEvmWindow`、Pythonでは`qorsdk.msg.pqc.open_evm_window`)、ウィンドウを読み戻します(`fetchEvmWindow`、`get_evm_window`)。
4. `--broadcast`とお使いのウォレット設定でスクリプトを実行します。
5. トークンを保有する必要があるすべてのコントラクト(ボールト、エスクロー)を`guard.setExempt`で免除し、保有者をトークン自身のコンプライアンスに登録し、ミントの前に各保有者を`guard.isHybridHolder(address)`で確認します。

### クイックスタート3: 発行者コンソール(テストネット) {#quickstart-console}

```bash
pnpm install
pnpm --filter @qorechain/issuer-console dev
```

EIP-6963ウォレットを接続し、QoreChain Testnetに切り替えてから、CMTATトークンを作成するか、アドレスで既存のものを開きます。チェーン9801では、コンソールは警告を表示し、トークンの作成を無効にします。コンソールは鍵の登録もウィンドウを開くことも行いません。先に上の手順2と3を行ってください。

### クイックスタート4: MockChainで提案されたモジュールに対して構築する(Python、オフライン) {#quickstart-python}

PythonクライアントのREADMEからです。PyPIでのリリースまでは、クローンからインストールしてください([インストール](#install)を参照)。

```python
from qorechain_asset_kit import MockChain, MockChainError, asset

chain = MockChain()
chain.asset.create_asset(issuer="qor1issuer", asset_id="bond-2030", flags={"freezable": True})
chain.asset.mint(agent="qor1issuer", asset_id="bond-2030", to="qor1alice", amount="100")
chain.asset.freeze(agent="qor1issuer", asset_id="bond-2030", holder="qor1alice", frozen=True)
try:
    chain.asset.transfer(from_="qor1alice", asset_id="bond-2030", to="qor1bob", amount="1")
except MockChainError as e:
    print(e.code)  # ERROR_CODE_ADDRESS_FROZEN
```

観測された出力: `ERROR_CODE_ADDRESS_FROZEN`。同じ呼び出しを`ChainClient()`で行うと、`module == "x/asset"`、`code == "CHAIN_UPGRADE_REQUIRED"`の`ChainUpgradeRequired`が発生します。

### クイックスタート5: Goでの同じ例(モジュールプロキシ v0.1.0) {#quickstart-go}

GoクライアントのREADMEからで、`main`パッケージで包んでいます。

```go
package main

import (
	"context"
	"errors"
	"fmt"

	assetkit "github.com/qorechain/qorechain-asset-kit/clients/go"
	assetv1 "github.com/qorechain/qorechain-asset-kit/clients/go/gen/qorechain/asset/v1"
)

func main() {
	ctx := context.Background()
	chain := assetkit.NewMockChain()
	_, err := chain.Asset().CreateAsset(ctx, &assetv1.MsgCreateAsset{
		Issuer: "qor1issuer", AssetId: "bond-2030", Flags: &assetv1.RwaFlagsV0{Freezable: true},
	})
	_, err = chain.Asset().Mint(ctx, &assetv1.MsgMint{Agent: "qor1issuer", AssetId: "bond-2030", To: "qor1alice", Amount: "100"})
	fmt.Println("mock mint error:", err)

	_, err = assetkit.NewChainClient().Asset().Mint(ctx, &assetv1.MsgMint{})
	var upgrade *assetkit.ChainUpgradeRequired
	fmt.Println(errors.As(err, &upgrade), upgrade.Module)
}
```

観測された出力: `mock mint error: <nil>`に続いて`true x/asset`。JavaクライアントのREADMEには、`MockChain`、`MsgCreateAsset.newBuilder()`、`MockChainError.code()`を使った同等の例があります。

:::note
リポジトリのGoとTypeScriptのREADMEのスニペットには小さな誤りがあり、0.1.1で修正される予定です。上のGoの例は修正済みのバージョンです。
:::

## 主なAPI {#main-api}

### コントラクト {#api-contracts}

| 名前 | 内容 |
|---|---|
| `QoreChainHybridHolderGuard(initialOwner)` | `0x0A02`に対するガード: `isHybridHolder`、`isEligible`、`requireHybridHolder`(`HybridKeyRequired`でリバート)、`keyStatus`、`decodeKeyStatus`、`precompileActive`、`setExempt`、`exempt` |
| `QoreChainHybridHolderRule(guard)` | CMTATのルール: `detectTransferRestriction`、`detectTransferRestrictionFrom`、`canTransfer`、`canTransferFrom`、`messageForTransferRestriction`、`canReturnTransferRestrictionCode`。コード`CODE_FROM_NOT_HYBRID`(60)、`CODE_TO_NOT_HYBRID`(61)、`CODE_SPENDER_NOT_HYBRID`(62) |
| `QoreChainHybridHolderModule(guard)` | ERC-3643のモジュール: `moduleCheck`、`bindCompliance`、`unbindCompliance`、`isComplianceBound`、`isPlugAndPlay`、`name` |
| `QoreChainRwaVault(asset, name, symbol, eligibility)` | 持分を制限したERC-4626ボールト |
| `QoreChainRwaAsyncVault(asset, name, symbol, eligibility, admin)` | ERC-7540ボールト: `requestDeposit`、`fulfillDeposit`、`requestRedeem`、`fulfillRedeem`、`pendingDepositRequest`、`claimableDepositRequest`、`pendingRedeemRequest`、`claimableRedeemRequest`、`setOperator`、およびコントローラーを指定する`deposit`、`mint`、`redeem`、`withdraw`。`FULFILLER_ROLE`。プレビューは設計上リバートします |
| `IHolderEligibility` | `isEligible(address)`: ボールト向けに別の適格性ポリシーを接続します |
| `IERC7518` | パーティションのインターフェーススケッチ |
| `forge script script/DeployCmtat.s.sol` | ガード、ルール、CMTATトークン |
| `forge script script/erc3643/DeployErc3643.s.sol` | T-REXのインフラ、ガード、モジュール、1つのトークンスイート |
| `forge script script/DeployVaults.s.sol` | 制限付きトークンの上の両方のボールトと、ガードの免除 |

### クライアント(提案) {#api-clients}

TypeScriptとJavaの名前を示しています。Pythonはスネークケース(`create_asset`)を使い、Goはアクセサの背後でGoの表記(`chain.Asset().CreateAsset(ctx, msg)`)を使います。

| 名前 | 内容 |
|---|---|
| `ChainClient`(Goでは`NewChainClient()`) | すべての呼び出しが`ChainUpgradeRequired`で失敗します。ネットワークリクエストはありません |
| `MockChain`(Goでは`NewMockChain()`) | 提案されたルールをメモリ内で実装。拒否は`MockChainError`を投げます |
| `asset` | `createAsset`、`updateFlags`、`setRole`、`proposeIssuer`、`acceptIssuer`、`authorizeHolder`、`mint`、`burn`、`transfer`、`freeze`、`freezePartial`、`pause`、`clawback`、`forceTransfer`、`setTerms`、`retire`。クエリ`asset`、`assets`、`holder`、`holders`、`roles`、`canTransfer`、`params` |
| `identity` | `registerIdentity`、`updateCountry`、`bindAddress`、`unbindAddress`、`addClaim`、`revokeClaim`、`removeIdentity`、`setClaimIssuer`。クエリ`identity`、`identityByAddress`、`claimIssuers`、`isVerified` |
| `compliance` | `registerModule`、`setModuleStatus`、`bindModule`、`unbindModule`、`migrateBinding`。クエリ`modules`、`module`、`bindings`、`check` |
| `settlement` | `createVenue`、`createInstruction`、`affirm`、`withdrawAffirmation`、`executeInstruction`、`cancelInstruction`。クエリ`instruction`、`instructionsByParty`、`venue` |
| `attest` | `setAttester`、`submit`、`revoke`。クエリ`latest`、`history`、`attesters` |
| モックのヘルパー | `setHybridKey`、`fundBank`、`bankBalance`、`advance(blocks, seconds)`、`events(type)`、`defineModuleLogic(moduleId, fn)`(Pythonには`has_hybrid_key`、`height`、`time`もあります) |

## アクセス方法 {#how-to-access}

| | テストネット `qorechain-diana` | メインネット `qorechain-vladi` |
|---|---|---|
| EVMチェーンID | 9800 | 9801 |
| EVM RPC | `https://evm-testnet.qore.host` | `https://evm.qore.host` |
| `pqcKeyStatus`プリコンパイル `0x0A02` | 有効 | 有効ではない(`eth_call`は空のデータを返す)。有効化にはガバナンスの決定が必要だが、決定はなされていない |
| ハイブリッド保有者のガード、ルール、モジュール | 動作する | フェイルクローズ: 免除されていないすべてのアドレスが不適格のため、トークンは一般の保有者間で移動できない |
| デプロイスクリプト | ドライランとブロードキャスト | 実行を拒否 |
| 発行者コンソール | すべて利用可能 | 警告。トークンの作成は無効 |
| ネイティブモジュール(`x/asset`など) | 存在しない | 存在しない |

EVMトランザクションを送信するすべての操作の要件: 登録済みのML-DSA-87鍵(所有証明つき)と、開いているEVM認可ウィンドウを持つアカウント。どちらも、ハイブリッド署名のトランザクションでNativeレーンに設定します。読み取り(`eth_call`、ログ、ガス見積もり、ドライラン)にはどちらも不要です。`MockChain`とFoundryのテストにネットワークは一切不要です。その他のエンドポイントとフォーセット: [テストネットへの接続](/getting-started/connecting-to-testnet)と[メインネットへの接続](/getting-started/connecting-to-mainnet)。

覚えておくべきネットワークの挙動: `PREVRANDAO`は定数です(このキットのコントラクトは使用していません)。blobトランザクション(タイプ3)は拒否され、タイプ0、1、2、4は受け付けられます。EIP-7702の委任には、権限者自身のポスト量子の同意(`MsgAuthorizeEVMDelegation`)が必要です。

## 公開場所 {#where-published}

2026年10月28日にライブで確認しました(GitHubリリース、Maven Central、Goプロキシは0.1.0を配信しており、PyPIとnpmは404を返します)。

| レジストリ | パッケージ | バージョン | リンク |
|---|---|---|---|
| Maven Central | `io.github.qorechain:asset-kit` | 0.1.0 | https://central.sonatype.com/artifact/io.github.qorechain/asset-kit |
| Goモジュールプロキシ | `github.com/qorechain/qorechain-asset-kit/clients/go` | v0.1.0(タグ`clients/go/v0.1.0`) | https://pkg.go.dev/github.com/qorechain/qorechain-asset-kit/clients/go |
| PyPI | `qorechain-asset-kit` | **近日公開**(PyPIにはまだありません) | |
| npm | `@qorechain/asset-kit` | **近日公開**(未公開) | |
| GitHub(Solidityコントラクト、発行者コンソール、proto、ドキュメント、法務テンプレート) | `qorechain/qorechain-asset-kit` | リリースv0.1.0 | https://github.com/qorechain/qorechain-asset-kit/releases/tag/v0.1.0 |

リポジトリ: https://github.com/qorechain/qorechain-asset-kit。メンテナー: QoreChain Association。

**ライセンス。** コードはApache-2.0です。ただし、`contracts/script/erc3643/`と`contracts/test/erc3643/`は、ERC-3643のリファレンス実装とともにコンパイルされるため、GPL-3.0-or-laterです。`docs/`と`legal/`のドキュメントはApache-2.0です。依存関係はそれぞれのライセンスを保ち、変更せずにgitサブモジュールとして使われています。T-REXとONCHAINID(GPL-3.0)、CMTAT(MPL-2.0)、OpenZeppelin(MIT)です。デプロイされたERC-3643トークンはそのライセンスの下にあるT-REXのコードであり、デプロイされたCMTATトークンはMPL-2.0の下にあります。`NOTICE`ファイルにすべての依存関係が記載されています。

## 制限事項と既知の問題 {#limits}

- **ネイティブモジュールは存在しません。** `x/asset`、`x/identity`、`x/compliance`、`x/settlement`、`x/attest`は提案です。これらを追加するアップグレードは予定されていません。0.1.0では`ChainClient`が成功することはありません。`MockChain`は開発ツールであり、チェーンではありません。
- **保有者チェックはテストネット専用です。** メインネットではガードはフェイルクローズになります。メインネットへのデプロイでこれに依存することはできません。
- **エージェントの権限は保有者チェックを迂回します。** どちらの標準でも、エージェントによる強制移転とウォレットのリカバリーはルールやモジュールを参照しません。CMTATの`forcedTransfer`、ERC-3643の`forcedTransfer`と`recoveryAddress`は、鍵のないアドレスにトークンを置くことができます。エージェントのロールを持つ主体を制限してください。
- **ERC-3643の`transferFrom`の支出者は、モジュールでは確認されません。** ERC-3643が支出者をコンプライアンスに渡さないためです。CMTATのルールは支出者を確認します。
- **バーンと償還は、設計上、適格性を失った保有者にも開かれたままです。** これは両方のトークン標準と両方のボールトで同じです。
- **保留中のERC-7540リクエストは0.1.0ではキャンセルできません。** エージェントが非同期ボールトから資産を移動すると、`totalAssets`はゼロを返し、不足している資産を必要とする請求は、発行者が残高を戻すまで失敗します。
- **ERC-7540ボールトには外部の評価入力がありません。** 変換にはボールト自身の持分あたり残高を使います。
- **EVMにはDvP(引渡しと決済の同時履行)もアテステーションもありません。** これらは提案されている`x/settlement`と`x/attest`にのみ存在します。
- **ERC-7518はインターフェーススケッチであり**、実装ではありません。パーティションは今日、1つのアイデンティティレジストリまたはルールを共有する、クラスやトランシェごとに1つのトークンでモデル化できます。
- **CMTA RuleEngine v3**は依然としてリリース候補として公開されています。このルールはトークンの`ruleEngine`として直接動作し、両方のルールインターフェースid(`0x2497d6cb`、`0xb1a69752`)を通知します。
- **発行者コンソール**は、鍵の登録、ウィンドウの開設、ERC-3643スイートやボールトのデプロイ、CMTATのロール、部分凍結、ドキュメント、スナップショットの管理を行いません。
- **PythonとTypeScriptは、それぞれのレジストリにありません。** PyPIとnpmでのリリースまではクローンを使ってください。このページでは、それらにレジストリ経由のインストールコマンドを示していません。
- **READMEの誤り。** リポジトリのREADMEにあるGoとTypeScriptのスニペットには小さな誤りがあり、0.1.1で修正される予定です。このページのクイックスタートを使ってください。
- **法務テンプレート。** `legal/`には、議論のための3つのドラフトがあります。スイスの台帳型証券(債務法第973d条から第973i条)、TVTGに基づくリヒテンシュタインのトークン条件(「トークンコンテナ」アプローチ)、EU DLTパイロット制度(規則(EU) 2022/858)の下でのオペレーター向けの委託契約の骨子です。これらは弁護士のレビューを受けておらず、法的助言ではなく、いかなる利用の前にも、当該法域の有資格の弁護士によるレビューが必要です。これらやこのキットを使うことは、特定の発行が法的要件を満たすかどうかについて何も意味しません。QoreChain Associationは、いかなる資産についても、発行者、登録機関、カストディアン、取引の場、法律顧問として行動しません。
- **1.0より前の版。** 提案されているprotoは、どのマイナーバージョンでも変更される可能性があります。

## セキュリティに関する注意 {#security}

- **監査を受けていません。** コントラクトは独立したレビューを受けていません。レビューなしに、実際の価値を保有させるために使わないでください。
- 鍵は所有者の手元に残ります。ガードはチェーンから公開鍵のステータスを読み取るだけで、秘密鍵を扱うことはありません。デプロイヤー、オーナー、エージェントの鍵は、ML-DSA-87鍵が登録された通常のEVMアカウントです。発行者、ガードのオーナー、エージェントのロールは、それぞれ別の、よく保護されたアカウントに置いてください。
- ガードのオーナーが免除を管理します。免除は、鍵がなくてもアドレスを適格にします。設計上資産を保有するコントラクトにのみ付与し、`ExemptionSet`イベントを監視してください。
- エージェントのロールは保有者チェックを迂回できます(強制移転、リカバリー)。トークンの最も慎重に扱うべきロールとして扱ってください。
- ガードはフェイルクローズであり、プリコンパイルの応答を厳格にデコードします。所有証明のない鍵を有効と見なすことはありません。
- 発行者コンソールの本番ビルドは`connect-src 'none'`のContent-Security-Policyを設定します。ページは自身ではネットワークリクエストを行わず、すべての通信はウォレットを経由します。
- `MockChain`はメッセージの署名者フィールドを信頼します(署名はありません)。セキュリティ境界ではありません。
- CMTAT、ERC-3643のリファレンス実装、ONCHAINID、OpenZeppelinの問題は、それぞれのメンテナーにも報告してください。
- キットの脆弱性は、security@qore.networkに非公開で報告してください。

## 関連ページ {#related}

- [QoreChain SDK](/sdk/overview): ML-DSA-87鍵の登録とEVM認可ウィンドウの開設(`openEvmWindow`、`fetchEvmWindow`、`get_evm_window`)。
- [QoreSign](/qoresign/overview): 鍵の登録とウィンドウの開設を行うNativeレーンのトランザクション向けの、ハイブリッド署名。
- [ポスト量子署名](/developer-guide/post-quantum-signing)と[アカウントとPQC署名](/sdk/concepts/accounts-pqc): 鍵の登録とハイブリッド署名。
- [EVM開発](/developer-guide/evm-development#evm-window): EVM認可ウィンドウ。
- [EVMプリコンパイル](/developer-guide/evm-precompiles): `0x0A01`と`0x0A02`。テストネットでのみ有効です。
- [チェーン開発者キット](/developer-tools/chain-dev-sdk): Foundry、Hardhat、viemのテンプレートとウィンドウのヘルパー(SDK 0.11.0、近日公開)。
- [カストディキット](/developer-tools/custody-kit)と[QoreScan](/developer-tools/qorescan): カストディアン向け、および暗号の棚卸し向けの、隣接するキット。
- [開発者パッケージ](/developer-tools/overview): すべてのパッケージとそのレジストリのステータス。
- 上流の標準: ERC-3643、CMTAT、ERC-4626、ERC-7540、ERC-7518。
