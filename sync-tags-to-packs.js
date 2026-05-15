const fs = require("fs");
const path = require("path");
const childProcess = require("child_process");

const root = __dirname;
const questionsPath = path.join(root, "questions.json");
const packDir = path.join(root, "question-packs");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function flattenQuestions(db) {
  const result = new Map();
  Object.entries(db.questions || {}).forEach(([category, questions]) => {
    (questions || []).forEach(question => {
      if (!question.id) return;
      result.set(question.id, { ...question, category: question.category || category });
    });
  });
  return result;
}

function syncOptionalField(target, source, field) {
  if (source[field] === undefined || source[field] === null || source[field] === "") {
    delete target[field];
    return;
  }
  target[field] = source[field];
}

if (!fs.existsSync(questionsPath)) {
  console.error("questions.json が見つかりません。先に tag-admin.html で保存した questions.json をこのフォルダに置いてください。");
  process.exit(1);
}

if (!fs.existsSync(packDir)) {
  console.error("question-packs フォルダが見つかりません。");
  process.exit(1);
}

const latestDb = readJson(questionsPath);
const latestById = flattenQuestions(latestDb);
const packFiles = fs.readdirSync(packDir)
  .filter(file => file.endsWith(".json"))
  .map(file => path.join(packDir, file))
  .sort();

let updatedQuestions = 0;

packFiles.forEach((file, fileIndex) => {
  const pack = readJson(file);

  Object.values(pack.questions || {}).forEach(questions => {
    (questions || []).forEach(question => {
      const latest = latestById.get(question.id);
      if (!latest) return;

      question.tags = Array.isArray(latest.tags) ? latest.tags : [];
      syncOptionalField(question, latest, "noteUrl");
      syncOptionalField(question, latest, "noteTitle");
      syncOptionalField(question, latest, "noteDescription");
      syncOptionalField(question, latest, "notePoints");
      syncOptionalField(question, latest, "canvaUrl");
      syncOptionalField(question, latest, "canvaTitle");
      syncOptionalField(question, latest, "canvaDescription");
      syncOptionalField(question, latest, "canvaPoints");
      updatedQuestions++;
    });
  });

  if (fileIndex === 0) {
    pack.tagLinks = latestDb.tagLinks || latestDb.noteLinks || {};
  } else {
    delete pack.tagLinks;
    delete pack.noteLinks;
  }

  writeJson(file, pack);
});

childProcess.execFileSync(process.execPath, [path.join(root, "merge.js")], {
  cwd: root,
  stdio: "inherit"
});

console.log(`タグ反映完了: ${updatedQuestions}件を question-packs に反映しました。`);
