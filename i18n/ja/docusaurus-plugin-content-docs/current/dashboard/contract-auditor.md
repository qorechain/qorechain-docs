---
slug: /dashboard/contract-auditor
title: コントラクト監査ツール
sidebar_label: コントラクト監査ツール
sidebar_position: 7
---

# コントラクト監査ツール

**コントラクト監査ツール**（サイドバーの **Build**、項目 **AI Audit**）は、貼り付けられたコントラクトのソースコードに対して、QoreChain の AI アシスタントである **QCAIA** によるセキュリティレビューを実行し、スコア、リスクレベル、推奨される修正案付きの発見事項を返します。テストやデプロイの前にコントラクトを素早く再確認したい開発者向けです。正式な監査ではなく、人によるレビューの代わりにもなりません。

## イノベーション {#innovations}

- **ブロックチェーンの自動検出。** 「Auto-detect from code」がデフォルトです。代わりに 17 のエコシステムから 1 つを選ぶこともできます。
- **0〜100 のセキュリティスコアとは別のポスト量子対応率。** セキュリティスコアには含めず、単独で報告されます。
- **UTC の毎日 1 回、無料の監査。** 各 UTC 日の最初の監査は無料です。それ以降は、テストネットでは、「Audit Cost」を表示する「Confirm Security Audit」ダイアログの後に、監査ごとにテスト QOR で支払います。メインネットでは、追加の監査は翌 UTC 日まで待つことになります。
- **レポートはデフォルトで非公開。** 所有者が公開設定を切り替えます。公開レポートに所有者の名前や IP が表示されることはありません。
- **ラベルだけでなく、修正案付きの発見事項。** 各発見事項には、重大度、場所、説明、推奨される修正案があり、完全なレポートには、推奨事項、ガスの最適化、ベストプラクティス、良い点が加わります。

## 使い方 {#how-to-use}

### 監査を実行する

1. サインインして（必須）**AI Audit** を開きます。
2. **Blockchain**（デフォルトは「Auto-detect from code」）、**Name (Optional)**、**Contract Source Code** を入力します。
3. **Run Security Audit** を選択し、「Confirm Security Audit」ダイアログで確認します。
4. **Security Report** が同じページ内にインラインで表示されます。**Export PDF** で保存できます。

**最小限の例:** ERC-20 を貼り付け、自動検出のまま **Run Security Audit**、Confirm、**Export PDF** の順に操作します。

### レポートを読む

インラインのレポートには次の内容が表示されます。

- 色分けされた **Risk Level**
- 0〜100 の **Security Score** と、ポスト量子対応率
- **Executive Summary**
- **Vulnerabilities Found (N Issues)**。重大度は Critical、High、Medium、Low、Info です。問題がない場合は「No vulnerabilities detected」と表示されます。

各発見事項には、重大度、タイトル、コード上の場所、説明、推奨される修正案が記載されます。

完全なレポートページ `/audits/<id>` には、重大度の内訳、**Recommendations**、**Gas optimizations**、**Best practices**、**Positive aspects** が加わり、所有者には公開設定のスイッチも表示されます。

### 過去の監査と共有

- 自分のレポートは **Profile > Audited** にあります。
- `/audits` の **All Security Audits** 一覧（ホームページからリンク）には、全ユーザーの最新の監査が、コントラクト名、ブロックチェーン、リスクレベル、スコア、日付とともにテーブルで表示されます。検索ボックスで名前、ブロックチェーン、リスクレベルによる絞り込みができます。行を開けるのは、レポートが公開されているか、自分のものである場合のみです。
- 自分が所有するレポートでは、上部のスイッチに「This report is private」と表示されます。これをオンにするとレポートが公開され、リンクを持つ誰でも読めるようになります（あなたの名前と IP は決して表示されません）。オフにすると再び非公開になります。

:::tip デプロイ前に監査する
デプロイ前の最後のステップとして監査を実行し、変更があるたびに再実行してください。発見事項は保証ではなく、確認すべき指針として扱い、レポートを [テストネット](/getting-started/connecting-to-testnet) での独自のテストと組み合わせてください。
:::

## アクセス方法 {#how-to-access}

- **URL:** [dashboard.qorechain.io/audit](https://dashboard.qorechain.io/audit)、またはホームページの **New Audit**。
- **アカウント:** 監査の実行にはサインインが必要です。`/audits` の一覧と `/audits/<id>` の公開レポートは、アカウントなしで開けます。
- **ネットワーク:** 両方のネットワークで動作します。1 日 1 回無料のルールは同じで、有料の追加監査はテストネットにのみあります。
- **費用:** 各 UTC 日の最初の監査は無料です。テストネットの追加分はテスト QOR がかかり、メインネットの追加分は翌日まで待ちます。

## 公開場所 {#where-published}

| 画面 | アドレス | アカウント |
| --- | --- | --- |
| 監査を実行 | `dashboard.qorechain.io/audit` | サインインが必要 |
| All Security Audits | `dashboard.qorechain.io/audits` | 不要 |
| レポート | `dashboard.qorechain.io/audits/<id>` | 公開なら不要、それ以外は所有者 |

## 制限事項と既知の問題 {#limits}

- 貼り付けたソースのみをレビューし、コンパイル、テスト、実行時の解析は行いません。発見事項は不完全だったり誤っていたりする場合があります。
- 非公開のレポートは、リンクがあっても所有者以外は開けません。

## 関連項目

- [スマートコントラクトクリエーター](/dashboard/smart-contract-creator) - QCAIA でコントラクトを生成します。
- [ポスト量子セキュリティ](/architecture/post-quantum-security) - QoreChain がアカウントと署名をどのように保護しているか。
