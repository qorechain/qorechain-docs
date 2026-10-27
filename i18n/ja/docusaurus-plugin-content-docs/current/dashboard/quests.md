---
slug: /dashboard/quests
title: クエスト
sidebar_label: クエスト
sidebar_position: 10
---

# クエスト

**クエスト**は、こなしながら QoreChain の使い方を学べるガイド付きのタスクです。各クエストは、ウォレットへの入金、送金、アカウントの連携など、1 つ以上のステップをまとめたもので、完了すると報酬を獲得できます。このページでは、サイドバーの **Earn** グループにあるその他のページとアーケードである**リーダーボード**、**バッジ**、**ゲーム**も扱います。これらはすべて、ネットワークを実践的に学び、進捗を積み上げたいコミュニティメンバー向けです。

## 革新的なポイント {#innovations}

- **自己申告ではなく、検証された完了。** クエストは、そのチェックに合格したときにカウントされます。Eigenstate 2 では、各クエストにチェックの種類が明示されます。**連携アカウント**、**接続済みウォレット**、**証明リンク**、**チームレビュー**、**クイズ**のいずれかです。
- **ソーシャルクエストは検証済みアカウントのみカウントされます。** X、Telegram、Discord に関するクエスト（Eigenstate 2 の連携アカウントチェックでは YouTube と GitHub も）は、**プロフィール**でアカウントを接続し、その接続が検証された後にのみカウントされます。それまでは、ページに **Go to Profile** リンクとともに *Connect Social Accounts* が表示されます。
- **前提条件が適用されます。** ロックされたクエストには、先に完了すべきものが表示されます（"Complete "..." first"）。
- **わかりやすいステータス。** Started、Pending Verification、Pending Review、Failed、Completed があるため、人によるレビュー待ちのクエストが失敗として表示されることはありません。
- **1 つのページに 2 つのシーズン。** **Eigenstate 1** と **Eigenstate 2** のタブには、それぞれ独自のクエストセットとカテゴリがあります。

## 使い方 {#how-to-use}

### クエストを閲覧する

**クエスト**（サイドバーの **Earn**）を開きます。サマリーには、利用可能なクエストの数、進行中の数、完了した数が表示されます。**カテゴリタブ**で一覧を絞り込めます。

- Eigenstate 1: Onboarding、Trading、Social、Community、Learning、Daily、Weekly。
- Eigenstate 2: Social、Exchanges、Developer、Educational、Korea/Asia、On-Chain、Other。

空のカテゴリには "No quests in this category yet." と表示されます。各クエストカードには、アイコン、タイトル、短い説明、**難易度**バッジ、目安時間、**報酬**（QOR またはイジェンバリューポイント λ）、ステータス（完了、進行中、開始済み、ロック中）が表示されます。

### Eigenstate 1 のクエストを完了する

1. クエストを開き、**Start Quest**（その後は **Continue Quest**）を選択します。
2. タスクを順に進めます。タスクには、**Go to Action**（関連するダッシュボードのページへ移動）と **Complete**（検証できるようにステップを確認）が用意されています。
3. 進捗バーで、完了したタスクを確認できます。
4. すべてのタスクが完了したら、**Check Completion** を選択してクエストを検証し、報酬を受け取ります。

デイリーとウィークリーのクエストはスケジュールに従ってリセットされます。詳細ページにリセットの周期と連続記録が表示されます。[フォーセット](/dashboard/faucet)での請求は、フォーセット関連のクエストにカウントされます。

### Eigenstate 2 のクエストを完了する

1. クエストを開き、そのチェックの種類を確認します。
2. クエストが表示するボタンを使います。どのボタンが表示されるかは、チェックの種類と現在のステータスによって異なります。**Verify**、**Submit**、**Resubmit**、**Retry verification**、**Re-check status** のいずれかです。
3. ステータスが Started、Pending Verification または Pending Review を経て、Completed（または Failed）になるのを確認します。

### リーダーボード {#leaderboard}

`/leaderboard` は、イジェンバリューポイント（λ）で人々をランキングし、上位 3 名、コミュニティの統計、検索ボックスを表示します。これはオフチェーンのランキングです。

### バッジ {#badges}

`/badges` は、12 のバッジシリーズのカタログです。**Check Badges** で進捗を再評価します。**Badge Widget** は、バッジを他の場所で表示するための iframe、BBCode、Markdown のスニペットを **Copy Code** とともに提供します。ブリッジはまだ稼働していませんが、一覧には Bridge シリーズが表示されます。

### ゲーム {#games}

`/games` は 12 のゲームを備えた **QoreChain Arcade** です。Quantum Space Miner、Quantum Runner、Chain Breaker、Token Rush、Block Defense、Node Puzzle、Quantum Stack、Hash Breaker、Qubit Bounce、Consensus Race、Quantum Maze、Wave Coder です。カードの **Play Now** を選択します。スコア（Photons、γ）はゲーム終了時に送信されます。スコアはオフチェーンで保持されます。

## アクセス方法 {#how-to-access}

- **URL:** [dashboard.qorechain.io/quests](https://dashboard.qorechain.io/quests)、`/leaderboard`、`/badges`、`/games`。
- **サインイン:** すべてで必要です。サインアウトしている場合、`/quests` はサインインにリダイレクトされます。リーダーボード、バッジ、ゲームは "Authentication Required" の画面を表示します。
- **ネットワーク:** いずれもネットワークの切り替えには連動しません。
- **ウォレット:** 必須ではありませんが、トランザクションを伴うクエストには入金済みのテストネットウォレットが必要です（[ウォレット](/dashboard/wallet#testnet)と[フォーセット](/dashboard/faucet)を参照）。ソーシャルクエストには連携済みのアカウントが必要です。
- **費用:** 無料。

## 公開場所 {#where-published}

| ページ | アドレス | アカウント |
| --- | --- | --- |
| クエスト（Eigenstate 1 と 2） | `dashboard.qorechain.io/quests` | サインイン |
| リーダーボード | `dashboard.qorechain.io/leaderboard` | サインイン |
| バッジ | `dashboard.qorechain.io/badges` | サインイン |
| ゲーム | `dashboard.qorechain.io/games` | サインイン |

## 制限と既知の問題 {#limits}

- **クエストセットは変わります。** シーズンのクエストがアクティブでない場合、そのシーズンのタブは空になったり、表示されるクエストが少なくなったりすることがあります。現在の一覧はこのページではなく、タブで確認してください。
- **ここにあるものはすべてオフチェーンです。** ポイント、ランク、バッジ、ゲームのスコアはダッシュボードが記録しており、QoreChain には記録されません。Photons はオンチェーンではありません。
- **報酬の金額**は各クエストに表示され、変更されることがあります。
- **サインイン**が必要で、ソーシャルクエストでは検証済みの連携アカウントも必要です。
- **パブリックセール**（`/public-sale`）は、既存の参加者向けの別ページです（割り当て、ベスティングのタイムライン、請求）。以前のラウンドはすべて終了しており、ここではこれ以上説明しません。
- **FAQ**（`/faq`）は短いアプリ内ヘルプページです。リファレンスはこのマニュアルです。

## 関連項目

- [概要とはじめに](/dashboard/overview) - クエストを始める前にサインインし、ウォレットを接続します。
- [フォーセット](/dashboard/faucet) - トランザクションを伴うクエストのためにテストネットウォレットに入金します。
