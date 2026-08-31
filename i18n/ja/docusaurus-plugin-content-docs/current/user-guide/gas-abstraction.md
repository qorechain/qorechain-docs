---
slug: /user-guide/gas-abstraction
title: ガス抽象化
sidebar_label: ガス抽象化
sidebar_position: 7
---

# ガス抽象化

このガイドでは、QoreChainのガス抽象化機能について説明します。この機能により、ユーザーはQORではなくネイティブトークン以外のトークンで取引手数料を支払うことができます。

:::note
以下のコマンドは **`qorechain-diana`** テストネット(EVMチェーンID **9800**)を使用しています。メインネット(**`qorechain-vladi`**、EVMチェーンID **9801**)は2026年6月7日からチェーンバージョン **v3.1.95** で稼働しています — メインネットで取引する際は、**Connecting to Mainnet** ページに記載のメインネットのチェーンIDとエンドポイントに置き換えてください。
:::

---

## 概要

ガス抽象化により、取引手数料を支払うためにQORトークンを保有する必要がなくなります。承認された代替トークン(IBC転送されたUSDCやATOMなど)を保有するユーザーは、それらのトークンを手数料の支払いに直接使用できます。プロトコルは処理前に手数料額を自動的にネイティブ相当額に変換します。

---

## 承認済みトークン

手数料の支払いに承認されているトークンは以下の通りです。

| トークン              | デノミネーション | 変換レート | 手数料の例          |
| ------------------ | ------------ | --------------- | -------------------- |
| **QOR**            | `uqor`       | 1.0(ネイティブ)    | `--fees 500uqor`     |
| **USDC**(IBC経由) | `ibc/USDC`   | 1.0             | `--fees 500ibc/USDC` |
| **ATOM**(IBC経由) | `ibc/ATOM`   | 10.0            | `--fees 50ibc/ATOM`  |

:::note
変換レートは市場価格ではなく、プロトコルで定義された交換比率を反映しています。ATOMのレート10.0とは、ibc/ATOM 1単位が手数料算定上uqor 10単位に相当することを意味します。
:::

---

## 仕組み

QoreChainの `GasAbstractionDecorator` は取引処理パイプラインに組み込まれています。取引にネイティブでないデノミネーションの手数料が含まれる場合、以下の処理が行われます。

1. **手数料の検査** — デコレーターが取引に指定された手数料のデノミネーションを確認します。
2. **レートの参照** — そのデノミネーションが承認済みトークン一覧に含まれている場合、プロトコルは対応する変換レートを参照します。
3. **変換** — 手数料額は変換レートを用いてネイティブなuqor相当額に変換されます。
4. **標準処理** — 変換後の手数料は標準の `DeductFee` ハンドラーに渡され、送信者のアカウントから控除されます。この変換処理は取引パイプラインの他の部分からは透過的です。下流の手数料処理(バリデーターへの分配、バーン、トレジャリーへの配分、ステーカー報酬、ライトノード報酬)はすべて、ネイティブなuqor相当額に対して行われます。

---

## 使用例

### USDCで手数料を支払う

USDCで手数料を支払うトークン送金を行います。

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 500ibc/USDC
```

USDCの変換レートは1.0のため、500 ibc/USDCは500 uqorに相当します。

### ATOMで手数料を支払う

ATOMで手数料を支払うトークン送金を行います。

```bash
qorechaind tx bank send mykey qor1recipient... 5000000uqor \
  --chain-id qorechain-diana \
  --fees 50ibc/ATOM
```

ATOMの変換レートは10.0のため、50 ibc/ATOMは500 uqorに相当します。

---

## 承認済みトークンの照会

ガス抽象化のために現在承認されているトークンの一覧と、その変換レートを取得します。

```bash
qorechaind query gasabstraction accepted-tokens
```

**出力例:**

```yaml
accepted_tokens:
- denom: uqor
  conversion_rate: "1.000000000000000000"
- denom: ibc/USDC
  conversion_rate: "1.000000000000000000"
- denom: ibc/ATOM
  conversion_rate: "10.000000000000000000"
```

---

## JSON-RPCアクセス

JSON-RPC経由で連携するアプリケーションは、ガス抽象化の設定を以下のクエリで取得できます。

```
qor_getGasAbstractionConfig
```

**リクエスト:**

```json
{
  "jsonrpc": "2.0",
  "method": "qor_getGasAbstractionConfig",
  "params": [],
  "id": 1
}
```

**レスポンス:**

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "accepted_tokens": [
      { "denom": "uqor", "conversion_rate": "1.0" },
      { "denom": "ibc/USDC", "conversion_rate": "1.0" },
      { "denom": "ibc/ATOM", "conversion_rate": "10.0" }
    ]
  }
}
```

---

:::tip

* ガス抽象化は、まだQORを保有していない他のエコシステムから移行してきたユーザーのオンボーディングに最適です。
* 変換レートはガバナンスによって設定され、パラメータ変更提案を通じて更新される場合があります。
* 複数の承認済みトークンを保有している場合、どの取引タイプの手数料にもそれらのいずれかを使用できます。
* `--fees` で指定した実際のトークンがアカウントから控除されます。変換は、手数料が最低要件を満たしているかを検証するためだけに使用されます。

:::
