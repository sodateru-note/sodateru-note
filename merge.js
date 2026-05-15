const fs = require("fs");
const path = require("path");

const packDir = path.join(__dirname, "question-packs");
const legacyFiles = [
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
  questions: {},
  tagLinks: {}
};

function addCategory(group, category) {
  if (!category) return;
  if (!merged.categories[group].includes(category)) merged.categories[group].push(category);
  if (!merged.questions[category]) merged.questions[category] = [];
}

function mergeData(data, fallbackGroup = "common") {
  for (const group of ["common", "special"]) {
    for (const category of data.categories?.[group] || []) addCategory(group, category);
  }

  if (data.tagLinks || data.noteLinks) {
    Object.assign(merged.tagLinks, data.tagLinks || data.noteLinks);
  }

  if (data.questions && !Array.isArray(data.questions)) {
    for (const [category, questions] of Object.entries(data.questions)) {
      const group = merged.categories.special.includes(category) ? "special" : fallbackGroup;
      addCategory(group, category);
      merged.questions[category].push(...(questions || []));
    }
  }

  if (Array.isArray(data.questions)) {
    for (const q of data.questions) {
      const category = q.category || "未分類";
      addCategory(fallbackGroup, category);
      merged.questions[category].push({
        id: q.id,
        meta: q.meta || "",
        text: q.text || q.question || "",
        choices: q.choices || [],
        answer: q.answer,
        explanation: q.explanation || "",
        image: q.image || "",
        difficulty: q.difficulty || "standard",
        difficultyScore: q.difficultyScore,
        qualityScore: q.qualityScore,
        tags: q.tags || [],
        noteTitle: q.noteTitle || q.canvaTitle || "",
        noteDescription: q.noteDescription || q.canvaDescription || "",
        notePoints: q.notePoints || q.canvaPoints || []
      });
    }
  }
}

let files = [];
if (fs.existsSync(packDir)) {
  files = fs.readdirSync(packDir)
    .filter(file => file.endsWith(".json"))
    .map(file => path.join(packDir, file))
    .sort();
}

if (files.length === 0) {
  files = legacyFiles
    .map(file => path.join(__dirname, file))
    .filter(file => fs.existsSync(file));
}

for (const file of files) {
  mergeData(JSON.parse(fs.readFileSync(file, "utf8")));
}

fs.writeFileSync(
  path.join(__dirname, "questions.json"),
  JSON.stringify(merged, null, 2),
  "utf8"
);

const total = Object.values(merged.questions).reduce((sum, qs) => sum + qs.length, 0);
console.log(`questions.json 作成完了: ${total}問 / ${files.length}ファイル`);
