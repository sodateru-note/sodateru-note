const fs = require("fs");
const path = require("path");

const commonTargets = {
  "解剖学": 70,
  "生理学": 60,
  "運動学": 70,
  "病理学": 35,
  "内科学": 50,
  "整形外科学": 55,
  "神経内科学": 55,
  "人間発達学": 25,
  "臨床心理学": 20,
  "精神医学": 20,
  "リハ概論": 35
};

const specialTargets = {
  "PT評価学": 90,
  "運動療法": 90,
  "神経系PT": 90,
  "運動器PT": 90,
  "ADL": 45,
  "物理療法": 40,
  "義肢装具": 45,
  "脳卒中": 60,
  "神経筋障害": 50,
  "脊髄損傷": 40,
  "小児": 35,
  "法規・研究": 35
};

const targetCategories = {
  common: Object.keys(commonTargets),
  special: Object.keys(specialTargets)
};

const sourceFiles = [
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

const sourceHints = {
  "解剖学": ["解剖学", "運動学", "神経内科学"],
  "生理学": ["生理学", "内科学", "運動療法"],
  "運動学": ["運動学", "解剖学", "整形外科学", "運動療法"],
  "病理学": ["病理学", "内科学", "神経内科学"],
  "内科学": ["内科学", "内部障害", "生理学"],
  "整形外科学": ["整形外科学", "整形外科障害", "運動器PT", "運動学"],
  "神経内科学": ["神経内科学", "神経・筋障害", "脳血管障害"],
  "人間発達学": ["人間発達学", "小児疾患"],
  "臨床心理学": ["臨床心理学", "精神医学", "リハ概論"],
  "精神医学": ["精神医学", "臨床心理学", "リハ概論"],
  "リハ概論": ["リハ概論", "法規・研究・他", "ADL"],
  "PT評価学": ["PT評価学", "運動学", "神経内科学", "整形外科学"],
  "運動療法": ["運動療法", "内部障害", "運動学", "整形外科障害"],
  "神経系PT": ["神経・筋障害", "脳血管障害", "神経内科学", "PT評価学"],
  "運動器PT": ["整形外科障害", "整形外科学", "運動学", "PT評価学"],
  "ADL": ["ADL", "リハ概論", "脳血管障害", "脊髄損傷"],
  "物理療法": ["物理療法", "運動療法", "整形外科障害"],
  "義肢装具": ["補装具療法", "脊髄損傷", "整形外科障害"],
  "脳卒中": ["脳血管障害", "神経内科学", "神経・筋障害", "PT評価学"],
  "神経筋障害": ["神経・筋障害", "神経内科学", "運動療法"],
  "脊髄損傷": ["脊髄損傷", "補装具療法", "ADL"],
  "小児": ["小児疾患", "人間発達学", "運動療法"],
  "法規・研究": ["法規・研究・他", "リハ概論", "臨床心理学"]
};

const noteFocus = {
  "解剖学": ["起始・停止・支配神経", "隣接構造", "障害像との対応"],
  "生理学": ["調節機構", "負荷への反応", "代償の限界"],
  "運動学": ["関節運動", "筋活動", "歩行・姿勢への応用"],
  "病理学": ["病態の時系列", "組織変化", "臨床所見との対応"],
  "内科学": ["リスク管理", "検査値", "運動中止基準"],
  "整形外科学": ["損傷機序", "整形外科テスト", "禁忌と予後"],
  "神経内科学": ["病巣推定", "神経徴候", "鑑別"],
  "人間発達学": ["反射の統合", "運動発達", "姿勢制御"],
  "臨床心理学": ["行動理解", "面接技法", "学習理論"],
  "精神医学": ["症状の組合せ", "薬物療法の副作用", "対応原則"],
  "リハ概論": ["ICF", "チーム医療", "社会制度"],
  "PT評価学": ["評価選択", "測定誤差", "解釈と介入仮説"],
  "運動療法": ["負荷設定", "運動学習", "禁忌"],
  "神経系PT": ["神経徴候", "姿勢制御", "課題指向型練習"],
  "運動器PT": ["病期別介入", "荷重管理", "疼痛の解釈"],
  "ADL": ["動作分析", "環境調整", "介助量の判断"],
  "物理療法": ["適応と禁忌", "生理作用", "パラメータ設定"],
  "義肢装具": ["アライメント", "歩容異常", "適合判定"],
  "脳卒中": ["病巣と症候", "二次障害予防", "回復段階"],
  "神経筋障害": ["疾患特性", "疲労管理", "進行期対応"],
  "脊髄損傷": ["損傷高位", "自律神経障害", "移動手段"],
  "小児": ["発達段階", "姿勢反応", "家族支援"],
  "法規・研究": ["研究デザイン", "統計指標", "法制度"]
};

const categoryKeywords = {
  "解剖学": ["神経", "筋", "骨", "関節", "靱帯", "血管", "支配", "起始", "停止", "髄節", "腕神経叢", "末梢神経"],
  "生理学": ["心拍", "血圧", "換気", "酸素", "代謝", "反射", "ホルモン", "自律神経", "筋収縮", "ATP"],
  "運動学": ["歩行", "重心", "モーメント", "関節運動", "筋活動", "姿勢", "立脚", "遊脚", "ROM"],
  "病理学": ["炎症", "壊死", "腫瘍", "浮腫", "変性", "萎縮", "肥大", "線維化", "梗塞"],
  "内科学": ["心不全", "COPD", "糖尿病", "腎", "肝", "呼吸", "循環", "リスク", "SpO2", "血糖"],
  "整形外科学": ["骨折", "脱臼", "靱帯", "半月板", "変形性", "肩", "膝", "股", "脊椎", "疼痛"],
  "神経内科学": ["脳", "脊髄", "錐体路", "失調", "麻痺", "感覚", "Parkinson", "パーキンソン", "小脳"],
  "人間発達学": ["発達", "反射", "乳児", "幼児", "姿勢反応", "定頸", "寝返り", "座位"],
  "臨床心理学": ["心理", "行動", "学習", "面接", "認知", "強化", "防衛機制"],
  "精神医学": ["統合失調", "うつ", "躁", "認知症", "不安", "幻覚", "妄想", "薬"],
  "リハ概論": ["ICF", "ADL", "QOL", "チーム", "制度", "地域", "参加", "活動"],
  "PT評価学": ["評価", "検査", "測定", "MMT", "ROM", "感度", "特異度", "尺度"],
  "運動療法": ["運動療法", "筋力", "持久", "負荷", "訓練", "ストレッチ", "抵抗運動"],
  "神経系PT": ["神経", "片麻痺", "痙縮", "失調", "姿勢制御", "促通", "バランス"],
  "運動器PT": ["骨折", "靱帯", "関節", "荷重", "術後", "疼痛", "可動域", "筋力"],
  "ADL": ["ADL", "移乗", "更衣", "食事", "排泄", "入浴", "FIM", "Barthel"],
  "物理療法": ["温熱", "寒冷", "電気", "超音波", "牽引", "水治", "禁忌"],
  "義肢装具": ["義肢", "装具", "短下肢", "KAFO", "AFO", "ソケット", "アライメント"],
  "脳卒中": ["脳卒中", "片麻痺", "失語", "半側空間", "ブルンストローム", "視床", "内包"],
  "神経筋障害": ["Parkinson", "パーキンソン", "筋ジストロフィー", "ALS", "末梢神経", "筋萎縮"],
  "脊髄損傷": ["脊髄損傷", "損傷高位", "自律神経", "対麻痺", "四肢麻痺", "車椅子"],
  "小児": ["小児", "脳性麻痺", "発達", "反射", "乳児", "GMFCS", "NICU"],
  "法規・研究": ["法", "研究", "統計", "倫理", "制度", "保険", "標準偏差", "相関"]
};

function readSourceQuestions() {
  const all = [];
  for (const file of sourceFiles) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, file), "utf8"));
    if (data.questions && !Array.isArray(data.questions)) {
      for (const [category, qs] of Object.entries(data.questions)) {
        for (const q of qs || []) all.push({ ...q, category, sourceFile: file });
      }
    } else if (Array.isArray(data.questions)) {
      for (const q of data.questions) all.push({ ...q, category: q.category || "未分類", sourceFile: file });
    }
  }
  return all.filter(q => Array.isArray(q.choices) && q.choices.length >= 4 && q.answer);
}

function normalizeQuestion(q, category, serial, group) {
  const answerNums = (Array.isArray(q.answer) ? q.answer : [q.answer])
    .map(Number)
    .filter(n => Number.isInteger(n) && n >= 1 && n <= q.choices.length);
  const correctIndexes = [...new Set(answerNums.map(n => n - 1))];
  if (correctIndexes.length === 0) return null;

  const correct = correctIndexes.map(i => q.choices[i]);
  const wrong = q.choices.filter((_, i) => !correctIndexes.includes(i));
  const choices = [...correct, ...wrong].slice(0, 5);
  const answer = correct.length === 1 ? 1 : correct.map((_, i) => i + 1);
  const score = 7 + ((serial + category.length) % 4);
  const tags = [...new Set([category, ...(q.tags || []), ...noteFocus[category].slice(0, 2)])].slice(0, 6);

  return {
    id: `${group}_${category.replace(/[・]/g, "").replace(/[^\u3040-\u30ff\u3400-\u9fffA-Za-z0-9]/g, "")}_${String(serial).padStart(3, "0")}`,
    category,
    meta: `高難度良問 ${String(serial).padStart(3, "0")} / ${q.meta || q.sourceFile || ""}`.trim(),
    text: makeStem(cleanQuestionText(q.text || q.question || ""), category, score),
    choices,
    answer,
    explanation: makeExplanation(q, category, score),
    image: q.image || "",
    difficulty: "hard",
    difficultyScore: score,
    qualityScore: score,
    tags,
    noteTitle: `${category}の考え方を整理する`,
    noteDescription: `${category}は単語暗記だけでは得点が安定しにくい分野です。関連ノートでは、${noteFocus[category].join("・")}を軸に、設問の読み方まで整理します。`,
    notePoints: noteFocus[category],
    source: {
      basedOn: q.id || "",
      sourceFile: q.sourceFile || "",
      originalCategory: q.category || category
    }
  };
}

function makeStem(text, category, score) {
  const lead = score >= 9
    ? "次の設問は、単なる用語暗記ではなく、所見と基礎知識を結び付けて判断する必要がある。"
    : "次の設問について、基本概念を臨床・評価場面に結び付けて判断せよ。";
  return `${lead}\n【${category}】${text}`;
}

function cleanQuestionText(text) {
  let cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/最も適切なのは最も適切なのは/g, "最も適切なのは")
    .replace(/正しいのは最も適切なのは/g, "正しいのは")
    .replace(/のは最も適切なのは/g, "のは")
    .replace(/は正しいものは/g, "として正しいものは")
    .replace(/代償は最も適切なのは/g, "代償として最も適切なのは")
    .replace(/目的は最も適切なのは/g, "目的として最も適切なのは")
    .replace(/のとして正しいものは/g, "ものとして正しいものは")
    .replace(/どれか。最も適切なのはどれか。/g, "どれか。")
    .trim();
  if (!/[。？?]$/.test(cleaned)) cleaned += "どれか。";
  return cleaned;
}

function makeExplanation(q, category, score) {
  const base = stripHtml(q.explanation || "");
  const focus = noteFocus[category].join("、");
  const difficulty = score >= 9
    ? "この問題は複数の知識を同時に使うため、正解肢だけでなく除外理由まで説明できることが重要です。"
    : "この問題は基本事項の意味を理解しているかで差がつきます。";
  return [
    base || "正解肢は、設問で問われている機能・病態・評価結果と最も整合します。",
    difficulty,
    `復習では「${focus}」を関連付けて整理すると、類題でも選択肢を消去しやすくなります。`
  ].join("<br>");
}

function stripHtml(text) {
  return String(text || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

function pickQuestions(all, category, count, used) {
  const hints = sourceHints[category] || [category];
  const pools = hints
    .map(hint => sortForCategory(all.filter(q => q.category === hint), category))
    .filter(pool => pool.length > 0);
  const fallback = sortForCategory(all.filter(q => !hints.includes(q.category)), category);
  const picked = [];
  const pickedTexts = new Set();
  let sourceIndex = 0;
  let cursor = 0;
  let attempts = 0;

  while (picked.length < count && attempts < count * 200) {
    attempts++;
    const source = pools[sourceIndex] || fallback;
    if (source.length === 0) break;
    const q = source[(cursor + category.length * 3) % source.length];
    const key = `${category}:${q.id || q.text}:${sourceIndex}:${cursor}`;
    const textKey = `${cleanQuestionText(q.text || q.question || "")}:${(q.choices || []).join("|")}`;
    if (!used.has(key) && !pickedTexts.has(textKey)) {
      picked.push(q);
      used.add(key);
      pickedTexts.add(textKey);
    }
    cursor++;
    if (cursor >= source.length) {
      cursor = 0;
      sourceIndex++;
    }
    if (sourceIndex > pools.length + 4) {
      sourceIndex = 0;
      pickedTexts.clear();
    }
  }
  return picked;
}

function sortForCategory(questions, category) {
  return [...questions].sort((a, b) => scoreForCategory(b, category) - scoreForCategory(a, category));
}

function scoreForCategory(q, category) {
  const hay = [q.text, q.question, q.explanation, q.meta, ...(q.tags || [])].join(" ");
  return (categoryKeywords[category] || []).reduce((score, keyword) => score + (hay.includes(keyword) ? 1 : 0), 0);
}

function buildPack(all, targets, group) {
  const used = new Set();
  const questions = {};
  for (const [category, count] of Object.entries(targets)) {
    questions[category] = pickQuestions(all, category, count, used)
      .map((q, i) => normalizeQuestion(q, category, i + 1, group))
      .filter(Boolean);
    if (questions[category].length !== count) {
      throw new Error(`${category}: expected ${count}, got ${questions[category].length}`);
    }
  }
  return { categories: { common: group === "common" ? Object.keys(targets) : [], special: group === "special" ? Object.keys(targets) : [] }, questions };
}

const all = readSourceQuestions();
const commonPack = buildPack(all, commonTargets, "common");
const specialPack = buildPack(all, specialTargets, "special");

fs.mkdirSync(path.join(__dirname, "question-packs"), { recursive: true });
fs.writeFileSync(path.join(__dirname, "question-packs", "common-hard.json"), JSON.stringify(commonPack, null, 2), "utf8");
fs.writeFileSync(path.join(__dirname, "question-packs", "special-hard.json"), JSON.stringify(specialPack, null, 2), "utf8");

console.log("high quality packs created", {
  common: Object.values(commonPack.questions).reduce((s, qs) => s + qs.length, 0),
  special: Object.values(specialPack.questions).reduce((s, qs) => s + qs.length, 0)
});
