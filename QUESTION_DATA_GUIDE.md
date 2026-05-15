# 育てるノート 問題データ構成

## 基本方針

- `index.html` は `questions.json` だけを読み込みます。
- 問題の編集・追加は `question-packs/` 配下の JSON に分けて保存します。
- `node merge.js` を実行すると、`question-packs/*.json` が結合されて `questions.json` が再作成されます。
- `questions.json` を空にしても、`question-packs/` が残っていれば再生成できます。

## 今回の構成

- `question-packs/common-hard.json`: 共通問題 495問
- `question-packs/special-hard.json`: 専門問題 710問
- 合計 1205問

各問題には以下を入れています。

- `difficulty: "hard"`
- `difficultyScore: 7〜10`
- `qualityScore: 7〜10`
- `noteTitle`
- `noteDescription`
- `notePoints`
- `source`

## 更新手順

1. `question-packs/` の JSON を編集する
2. サイトフォルダで `node merge.js` を実行する
3. `questions.json` の件数を確認する
4. GitHub にコミットする

## tag-admin.html でタグを編集するとき

1. `tag-admin.html` を開く
2. `questions.json` を読み込む
3. タグやnoteリンクを編集する
4. `タグ付き questions.json 保存` を押す
5. ダウンロードされた `questions.json` を、サイトフォルダ直下の `questions.json` に上書きする
6. `sync-tags.command` をダブルクリックする

`sync-tags.command` は、タグ付き `questions.json` の内容を `question-packs/` に戻してから `questions.json` を再生成します。これを実行しておけば、あとで `node merge.js` を実行してもタグが消えません。

## 問題を増やすとき

次回以降は `question-packs/common-hard-02.json` のようにファイルを追加するだけで大丈夫です。`merge.js` は `question-packs/` 内の JSON を自動で読み込みます。
