#!/bin/zsh
cd "$(dirname "$0")"

echo "育てるノート: タグを問題パックへ反映します"
echo ""
echo "1. tag-admin.html で保存した questions.json を、このフォルダの questions.json に上書きしてから実行してください。"
echo "2. この処理で question-packs にタグとnoteリンクを戻し、questions.json も作り直します。"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js が見つかりません。"
  echo "VS Code のターミナルで node merge.js が動く環境で実行してください。"
  echo ""
  echo "Enterキーで閉じます。"
  read
  exit 1
fi

node sync-tags-to-packs.js
RESULT=$?

echo ""
if [ "$RESULT" -eq 0 ]; then
  echo "完了しました。これで今後 node merge.js を実行してもタグが残ります。"
else
  echo "エラーが出ました。表示された内容をCodexに送ってください。"
fi

echo ""
echo "Enterキーで閉じます。"
read
