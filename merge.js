const fs = require("fs");

const files = [
  "pt52.json",
  "pt53.json",
  "pt54.json",
  "pt55.json",
  "pt56.json",
  "pt57.json",
  "pt58.json",
  "pdfbase.json",
  "additional.json"
];

const merged = {
  categories: {
    common: [],
    special: []
  },
  questions: {}
};

for (const file of files) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (data.categories) {
    merged.categories.common = [
      ...new Set([...merged.categories.common, ...(data.categories.common || [])])
    ];
    merged.categories.special = [
      ...new Set([...merged.categories.special, ...(data.categories.special || [])])
    ];
  }

  // パターン1：questions がカテゴリ別の形
  if (data.questions && !Array.isArray(data.questions)) {
    for (const category in data.questions) {
      if (!merged.questions[category]) merged.questions[category] = [];
      merged.questions[category].push(...data.questions[category]);
    }
  }

  // パターン2：questions が配列の形（pt53など）
  if (Array.isArray(data.questions)) {
    for (const q of data.questions) {
      const category = q.category || "未分類";
      if (!merged.questions[category]) merged.questions[category] = [];

      merged.questions[category].push({
        id: q.id,
        meta: q.meta || "",
        text: q.text || q.question || "",
        choices: q.choices || [],
        answer: q.answer,
        explanation: q.explanation || "",
        image: q.image || "",
        difficulty: q.difficulty || "standard",
        tags: q.tags || []
      });
    }
  }
}

fs.writeFileSync(
  "questions.json",
  JSON.stringify(merged, null, 2),
  "utf8"
);

console.log("questions.json 作成完了！");