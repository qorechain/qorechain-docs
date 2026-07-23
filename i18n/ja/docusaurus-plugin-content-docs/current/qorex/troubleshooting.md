---
slug: /qorex/troubleshooting
title: QoreX トラブルシューティング
sidebar_label: トラブルシューティング
sidebar_position: 9
---

# トラブルシューティング

QoreX アプリと拡張機能に関するよくある質問と簡単な対処法です。

| 症状 | 原因 / 対処法 |
|---|---|
| オンボーディング時の **"Secure your device first"** | システム設定で Face ID / 指紋認証**または画面ロック（PIN / pattern）**を設定してから戻ってください。ウォレットは強力なロック要素のあるデバイスでのみ作成できます。Android では 2D 顔認証のみは*弱い*生体認証です。要件を満たすのはその背後にある PIN です。 |
| **サインインシートが閉じた** / "That sign-in attempt expired" | 前回の試行が中断されました。もう一度サインインをタップするだけです。 |
| Google / Dashboard サインイン後に **"Add a passkey" が表示されない** | 想定どおりです。パスキーはメールコードのアカウントにのみ紐づきます（[Account & Dashboard](/qorex/account-and-dashboard#sign-in) の注記を参照）。 |
| **"Handles coming soon"** | @handle レジストリに一時的に到達できません。ウォレットには影響ありません。レジストリが復旧すると handle は自動的に有効になります。 |
| デバイスリンク中の **"Wrong code or damaged QR"** | 10 文字のコードを再確認し（英字は紛らわしい文字を除外しています。0/O/1/I/L はありません）、再スキャンしてください。どちらの成果物も一度きりです。 |
| **カメラ画面に権限が必要と表示される** | iOS: 設定 → QoreX → カメラ。Android: アプリ情報 → 権限 → カメラ。 |
| **拡張機能: "No wallet yet"** | 拡張機能は QoreX モバイルアプリで作成したウォレットとペアリングします。まずそこで作成してください。 |
| **読み取り専用アドレスからの送金が拒否される** | そのアドレスは別のウォレットに属しています（ラベルにどれかが表示されます）。QoreX は自身の派生アカウントに対してのみ署名できます。所有するウォレットから送金してください。 |
| **Testnet バッジが表示される** | 設定 → **"Use testnet (developers)"** がオンになっています。オフにすると mainnet に戻ります。 |
| **Swap ボタンが無効になっている** | 現時点では想定どおりです。プールの流動性が利用可能になると Swap は自動的に有効になります。アプリの更新は不要です。 |

## それでも解決しない場合は？

- guardian とデバイスリンクについては [Security & Recovery](/qorex/security-and-recovery) ページをご覧ください。
- QoreChain 自体に関する質問は、[メインドキュメント](/introduction/what-is-qorechain) または [qorechain.io](https://qorechain.io) にリンクされているコミュニティチャンネルをご覧ください。
