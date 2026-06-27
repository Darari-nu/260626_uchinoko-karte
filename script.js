const STORAGE_KEY = "uchinoko_vet_memos";
const MAX_HISTORY = 5;

const answers = {
  startedAt: "",
  frequency: "",
  symptoms: [],
  otherSymptom: "",
  changeAfterVisit: "",
  note: "",
};

const COPY_OPTIONS = {
  startedAt: {
    today: {
      label: "今日から",
      lead: "今日から",
    },
    yesterday: {
      label: "昨日から",
      lead: "昨日ごろから",
    },
    fewDays: {
      label: "2〜3日前から",
      lead: "2〜3日前から",
    },
    weekPlus: {
      label: "1週間以上前から",
      lead: "1週間以上前から",
    },
    unknown: {
      label: "わからない",
      lead: "いつからかははっきりしませんが",
    },
  },
  frequency: {
    once: {
      label: "一度だけ",
      sentence: "気になる様子は一度だけ見られました。",
    },
    sometimes: {
      label: "ときどき",
      sentence: "気になる様子はときどき見られます。",
    },
    daily: {
      label: "毎日",
      sentence: "気になる様子は毎日見られます。",
    },
    repeated: {
      label: "何度も繰り返す",
      sentence: "同じような様子が何度も繰り返し見られます。",
    },
    gettingWorse: {
      label: "だんだん悪くなっている",
      sentence: "様子としては、だんだん悪くなっているように見えます。",
    },
  },
  symptoms: {
    appetite: {
      label: "食欲がない",
      noun: "食欲の低下",
    },
    drinksMore: {
      label: "水をよく飲む",
      noun: "飲水量の増加",
    },
    vomit: {
      label: "吐いた",
      noun: "嘔吐",
    },
    diarrhea: {
      label: "下痢",
      noun: "下痢",
    },
    constipation: {
      label: "便秘",
      noun: "便秘",
    },
    lowEnergy: {
      label: "元気がない",
      noun: "元気のなさ",
    },
    coughSneeze: {
      label: "咳・くしゃみ",
      noun: "咳やくしゃみ",
    },
    itchy: {
      label: "かゆがる",
      noun: "かゆがる様子",
    },
    limp: {
      label: "歩き方がおかしい",
      noun: "歩き方の違和感",
    },
    peeIssue: {
      label: "排尿がおかしい",
      noun: "排尿の変化",
    },
    other: {
      label: "その他",
      noun: "その他の症状",
    },
  },
  changeAfterVisit: {
    better: {
      label: "良くなった",
      sentence: "前回の受診後より、良くなっているように感じます。",
    },
    same: {
      label: "変わらない",
      sentence: "前回の受診後から、大きくは変わっていないように感じます。",
    },
    worse: {
      label: "悪くなった",
      sentence: "前回の受診後より、悪くなっているように感じます。",
    },
    newSymptom: {
      label: "別の症状が出た",
      sentence: "前回の受診後に、別の症状も出ています。",
    },
    noPrevious: {
      label: "前回受診していない / 覚えていない",
      sentence: "前回受診との比較ははっきりわかりません。",
      aliases: ["前回受診していない / 覚えていない"],
    },
  },
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  bindChoices();
  bindInputs();
  bindActions();
  renderAll();
});

function cacheElements() {
  els.form = document.querySelector("#memo-form");
  els.generatedText = document.querySelector("#generated-text");
  els.statusMessage = document.querySelector("#status-message");
  els.copyButton = document.querySelector("#copy-button");
  els.saveButton = document.querySelector("#save-button");
  els.historyList = document.querySelector("#history-list");
  els.otherSymptomField = document.querySelector("#other-symptom-field");
  els.otherSymptom = document.querySelector("#other-symptom");
  els.note = document.querySelector("#note");
  els.stepCount = document.querySelector("#step-count");
  els.stepLabel = document.querySelector("#step-label");
  els.stepDots = document.querySelectorAll(".step-dot");
}

function bindChoices() {
  document.querySelectorAll("[data-question]").forEach((groupEl) => {
    groupEl.querySelectorAll(".choice-button").forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        updateAnswer(groupEl.dataset.question, groupEl.dataset.type, button.dataset.value);
        renderAll();
      });
    });
  });
}

function bindInputs() {
  els.otherSymptom.addEventListener("input", () => {
    answers.otherSymptom = els.otherSymptom.value.trim();
    renderGeneratedText();
  });

  els.note.addEventListener("input", () => {
    answers.note = els.note.value.trim();
    renderGeneratedText();
  });
}

function bindActions() {
  els.copyButton.addEventListener("click", () => {
    copyText(getGeneratedText());
  });

  els.saveButton.addEventListener("click", () => {
    saveCurrentMemo();
  });
}

function updateAnswer(question, type, value) {
  const normalizedValue = normalizeAnswerValue(question, value);
  if (type === "multiple") {
    const currentValues = normalizeAnswerList(question, answers[question]);
    answers[question] = currentValues.includes(normalizedValue)
      ? currentValues.filter((item) => item !== normalizedValue)
      : [...currentValues, normalizedValue];
    if (normalizedValue === "other" && !answers[question].includes("other")) {
      answers.otherSymptom = "";
      els.otherSymptom.value = "";
    }
    return;
  }

  answers[question] = normalizeAnswerValue(question, answers[question]) === normalizedValue
    ? ""
    : normalizedValue;
}

function renderAll() {
  renderChoices();
  renderOtherSymptomField();
  renderProgress();
  renderGeneratedText();
  renderHistory();
}

function renderChoices() {
  document.querySelectorAll("[data-question]").forEach((groupEl) => {
    const question = groupEl.dataset.question;
    const type = groupEl.dataset.type;
    groupEl.querySelectorAll(".choice-button").forEach((button) => {
      const value = button.dataset.value;
      const selected = type === "multiple"
        ? normalizeAnswerList(question, answers[question]).includes(value)
        : normalizeAnswerValue(question, answers[question]) === value;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.classList.toggle("is-selected", selected);
    });
  });
}

function renderOtherSymptomField() {
  const shouldShow = normalizeAnswerList("symptoms", answers.symptoms).includes("other");
  els.otherSymptomField.hidden = !shouldShow;
  if (!shouldShow) {
    answers.otherSymptom = "";
    els.otherSymptom.value = "";
  }
}

function renderGeneratedText() {
  const text = getGeneratedText();
  clearElement(els.generatedText);
  els.generatedText.classList.toggle("is-empty", !text);
  els.generatedText.textContent = text || "選んだ内容から、獣医さんにそのまま伝えやすい文章を作ります。";
  if (text) {
    setStatus("文章をコピーまたは保存できます。", "success");
  } else {
    setStatus("未選択の項目があります。", "");
  }
}

function renderProgress() {
  const completed = getCompletedSteps();
  if (els.stepCount) {
    els.stepCount.textContent = `${completed.length}/4`;
  }
  if (els.stepLabel) {
    els.stepLabel.textContent = completed.length >= 3
      ? "このまま伝える準備ができています"
      : "情報を入力";
  }
  els.stepDots?.forEach((dot) => {
    dot.classList.toggle("is-complete", completed.includes(dot.dataset.step));
  });
}

function getCompletedSteps() {
  const completed = [];
  if (normalizeAnswerValue("startedAt", answers.startedAt)) completed.push("startedAt");
  if (normalizeAnswerList("symptoms", answers.symptoms).length > 0) completed.push("symptoms");
  if (normalizeAnswerValue("frequency", answers.frequency)) completed.push("frequency");
  if (normalizeAnswerValue("changeAfterVisit", answers.changeAfterVisit) || answers.note) {
    completed.push("changeAfterVisit");
  }
  return completed;
}

function getGeneratedText() {
  const lines = [];
  const startedAt = getOption("startedAt", answers.startedAt);
  const frequency = getOption("frequency", answers.frequency);
  const changeAfterVisit = getOption("changeAfterVisit", answers.changeAfterVisit);
  const symptoms = getSymptomList();

  if (startedAt && symptoms) {
    lines.push(`${startedAt.lead}、${symptoms}が気になっています。`);
  } else if (startedAt) {
    lines.push(`${startedAt.lead}、気になる様子があります。`);
  } else if (symptoms) {
    lines.push(`${symptoms}が気になっています。`);
  }

  if (frequency) {
    lines.push(frequency.sentence);
  }

  if (changeAfterVisit) {
    lines.push(changeAfterVisit.sentence);
  }

  if (answers.note) {
    lines.push(formatNoteSentence(answers.note));
  }

  return lines.join("\n");
}

function getSymptomList() {
  const symptoms = normalizeAnswerList("symptoms", answers.symptoms)
    .map((symptom) => {
      if (symptom === "other" && answers.otherSymptom) {
        return formatOtherSymptomNoun(answers.otherSymptom);
      }
      return getOption("symptoms", symptom)?.noun || "";
    })
    .filter(Boolean);
  return joinJapaneseList(symptoms);
}

async function copyText(text) {
  if (!text) {
    setStatus("コピーする文章がまだありません。", "warning");
    return;
  }

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    setStatus("文章をコピーしました。", "success");
  } catch (error) {
    fallbackCopy(text);
    setStatus("文章をコピーしました。", "success");
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function saveCurrentMemo() {
  const generatedText = getGeneratedText();
  if (!generatedText) {
    setStatus("保存する文章がまだありません。", "warning");
    return;
  }

  const memo = {
    id: createId(),
    savedAt: new Date().toISOString(),
    isVisit: false,
    answers: cloneAnswers(),
    generatedText,
  };
  const memos = [memo, ...readMemos()].slice(0, MAX_HISTORY);
  writeMemos(memos);
  setStatus("メモを保存しました。", "success");
  renderHistory();
}

function renderHistory() {
  clearElement(els.historyList);
  const memos = readMemos();
  if (memos.length === 0) {
    appendEmpty(els.historyList, "保存したメモはまだありません。");
    return;
  }

  memos.forEach((memo) => {
    const item = document.createElement("article");
    item.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const date = document.createElement("span");
    date.textContent = formatSavedAt(memo.savedAt);
    const visitMark = document.createElement("span");
    visitMark.className = "visit-mark";
    visitMark.textContent = memo.isVisit ? "受診日" : "通常メモ";
    meta.append(date, visitMark);

    const visitLabel = document.createElement("label");
    visitLabel.className = "visit-toggle";
    const visitInput = document.createElement("input");
    visitInput.type = "checkbox";
    visitInput.checked = Boolean(memo.isVisit);
    visitInput.addEventListener("change", () => {
      updateVisitFlag(memo.id, visitInput.checked);
    });
    const visitText = document.createElement("span");
    visitText.textContent = "受診日";
    visitLabel.append(visitInput, visitText);
    meta.append(visitLabel);

    const excerpt = document.createElement("p");
    excerpt.className = "history-excerpt";
    excerpt.textContent = createExcerpt(memo.generatedText);

    const actions = document.createElement("div");
    actions.className = "history-actions";
    actions.append(
      createHistoryButton("開く", "secondary", () => openMemo(memo)),
      createHistoryButton("コピー", "secondary", () => copyText(memo.generatedText)),
      createHistoryButton("削除", "danger", () => deleteMemo(memo.id)),
    );

    item.append(meta, excerpt, actions);
    els.historyList.append(item);
  });
}

function createHistoryButton(label, style, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `button small ${style}`;
  button.textContent = label;
  button.addEventListener("click", onClick);
  return button;
}

function openMemo(memo) {
  const normalizedAnswers = normalizeAnswers(memo.answers);
  Object.assign(answers, {
    startedAt: normalizedAnswers.startedAt,
    frequency: normalizedAnswers.frequency,
    symptoms: normalizedAnswers.symptoms,
    otherSymptom: normalizedAnswers.otherSymptom,
    changeAfterVisit: normalizedAnswers.changeAfterVisit,
    note: normalizedAnswers.note,
  });
  els.otherSymptom.value = answers.otherSymptom;
  els.note.value = answers.note;
  renderAll();
  document.querySelector("#memo-output").scrollIntoView({ behavior: "smooth", block: "start" });
  setStatus("保存済みメモを開きました。", "success");
}

function updateVisitFlag(id, isVisit) {
  const memos = readMemos().map((memo) => (
    memo.id === id ? { ...memo, isVisit } : memo
  ));
  writeMemos(memos);
  renderHistory();
}

function deleteMemo(id) {
  const memos = readMemos().filter((memo) => memo.id !== id);
  writeMemos(memos);
  setStatus("メモを削除しました。", "success");
  renderHistory();
}

function readMemos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch (error) {
    console.warn(`Failed to parse localStorage key: ${STORAGE_KEY}`, error);
    return [];
  }
}

function writeMemos(memos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memos.slice(0, MAX_HISTORY)));
}

function cloneAnswers() {
  const normalizedAnswers = normalizeAnswers(answers);
  return {
    startedAt: normalizedAnswers.startedAt,
    frequency: normalizedAnswers.frequency,
    symptoms: [...normalizedAnswers.symptoms],
    otherSymptom: normalizedAnswers.otherSymptom,
    changeAfterVisit: normalizedAnswers.changeAfterVisit,
    note: normalizedAnswers.note,
  };
}

function normalizeAnswers(source = {}) {
  return {
    startedAt: normalizeAnswerValue("startedAt", source.startedAt || ""),
    frequency: normalizeAnswerValue("frequency", source.frequency || ""),
    symptoms: normalizeAnswerList("symptoms", source.symptoms),
    otherSymptom: String(source.otherSymptom || "").trim(),
    changeAfterVisit: normalizeAnswerValue("changeAfterVisit", source.changeAfterVisit || ""),
    note: String(source.note || "").trim(),
  };
}

function normalizeAnswerList(question, values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((value) => normalizeAnswerValue(question, value))
    .filter(Boolean);
}

function normalizeAnswerValue(question, value) {
  const options = COPY_OPTIONS[question];
  if (!options || !value) return value || "";
  if (options[value]) return value;

  const found = Object.entries(options).find(([, option]) => (
    option.label === value || option.aliases?.includes(value)
  ));
  return found ? found[0] : "";
}

function getOption(question, value) {
  const key = normalizeAnswerValue(question, value);
  return key ? COPY_OPTIONS[question]?.[key] : null;
}

function joinJapaneseList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]}と${items[1]}`;
  return items.join("、");
}

function formatNoteSentence(note) {
  const cleanNote = String(note || "").trim().replace(/[。.\s]+$/g, "");
  return cleanNote ? `補足として、${cleanNote}。` : "";
}

function formatOtherSymptomNoun(value) {
  const cleanValue = String(value || "").trim().replace(/[。.\s]+$/g, "");
  if (!cleanValue) return "";
  if (/(様子|症状|状態|変化|痛み|出血|血便|咳|くしゃみ|嘔吐|下痢|便秘)$/.test(cleanValue)) {
    return cleanValue;
  }
  if (/(する|いる|ある|ない|出る|飲む|歩く|鳴く|震える|残す|痛がる|かゆがる)$/.test(cleanValue)) {
    return `${cleanValue}様子`;
  }
  return cleanValue;
}

function createId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `memo_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function formatSavedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "保存日不明";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function createExcerpt(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= 72) return normalized;
  return `${normalized.slice(0, 72)}...`;
}

function appendEmpty(parent, message) {
  const p = document.createElement("p");
  p.className = "empty-state";
  p.textContent = message;
  parent.append(p);
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function setStatus(message, type) {
  els.statusMessage.textContent = message;
  if (type) {
    els.statusMessage.dataset.status = type;
  } else {
    delete els.statusMessage.dataset.status;
  }
}
