const STORAGE_KEY = "uchinoko_vet_memos";
const MAX_HISTORY = 5;

const answers = {
  startedAt: "",
  startedDate: "",
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
      lead: "昨日から",
    },
    fewDays: {
      label: "2〜3日前から",
      lead: "2〜3日前から",
      aliases: ["3日くらい前から"],
    },
    week: {
      label: "1週間前から",
      lead: "1週間前から",
      aliases: ["weekPlus", "1週間以上前から", "1週間くらい前から"],
    },
    twoWeeks: {
      label: "2週間前から",
      lead: "2週間前から",
    },
    month: {
      label: "1か月前から",
      lead: "1か月前から",
    },
    longAgo: {
      label: "それ以上前から",
      lead: "それ以上前から",
    },
    unknown: {
      label: "わからない",
      lead: "いつからかははっきりしませんが",
    },
  },
  frequency: {
    always: {
      label: "常にある",
      sentence: "この気になる症状は常にあります。",
      aliases: ["repeated", "何度も繰り返す"],
    },
    fewTimesDay: {
      label: "1日に数回",
      sentence: "この気になる症状は1日に数回あります。",
    },
    dailyOnce: {
      label: "1日に1回程度",
      sentence: "この気になる症状は1日に1回程度あります。",
      aliases: ["daily", "毎日"],
    },
    sometimes: {
      label: "時々ある",
      sentence: "この気になる症状は時々あります。",
      aliases: ["ときどき"],
    },
    occasionally: {
      label: "たまにある",
      sentence: "この気になる症状はたまにあります。",
      aliases: ["once", "一度だけ"],
    },
    gettingWorse: {
      label: "だんだん悪くなっている",
      sentence: "この気になる症状は、だんだん悪くなっているように見えます。",
    },
  },
  symptoms: {
    appetite: {
      label: "食欲がない",
      noun: "食欲の低下",
    },
    eatMore: {
      label: "食べすぎる",
      noun: "食べすぎる様子",
    },
    drinksMore: {
      label: "水を飲む量が増えた",
      noun: "飲水量の増加",
      aliases: ["水をよく飲む"],
    },
    drinksLess: {
      label: "水を飲む量が減った",
      noun: "飲水量の低下",
    },
    vomit: {
      label: "吐く",
      noun: "嘔吐",
      aliases: ["吐いた"],
    },
    nausea: {
      label: "吐き気がある（えづく）",
      noun: "吐き気やえづき",
    },
    diarrhea: {
      label: "下痢",
      noun: "下痢",
    },
    constipation: {
      label: "便秘",
      noun: "便秘",
    },
    bloodyStool: {
      label: "血便",
      noun: "血便",
    },
    lowEnergy: {
      label: "元気がない",
      noun: "元気のなさ",
    },
    lethargic: {
      label: "ぐったりしている",
      noun: "ぐったりしている様子",
    },
    sleepsMore: {
      label: "よく寝る",
      noun: "よく寝る様子",
    },
    restless: {
      label: "落ち着きがない",
      noun: "落ち着きのなさ",
    },
    trembling: {
      label: "震える",
      noun: "震え",
    },
    limp: {
      label: "歩き方がおかしい",
      noun: "歩き方の違和感",
    },
    hiding: {
      label: "隠れていることが多い",
      noun: "隠れていることが多い様子",
    },
    cough: {
      label: "咳をする",
      noun: "咳",
      aliases: ["coughSneeze", "咳・くしゃみ", "くしゃみ・咳"],
    },
    sneeze: {
      label: "くしゃみ",
      noun: "くしゃみ",
    },
    eyeTear: {
      label: "目ヤニ・涙が多い",
      noun: "目やにや涙の増加",
      aliases: ["目ヤニ・涙"],
    },
    itchy: {
      label: "かゆがる",
      noun: "かゆがる様子",
      aliases: ["体をかく"],
    },
    hairLoss: {
      label: "脱毛",
      noun: "脱毛",
    },
    badBreath: {
      label: "口臭が気になる",
      noun: "口臭",
    },
    earIssue: {
      label: "耳を気にする",
      noun: "耳を気にする様子",
    },
    peeIssue: {
      label: "尿の様子が変",
      noun: "排尿の変化",
      aliases: ["排尿がおかしい"],
    },
    other: {
      label: "その他",
      noun: "その他の症状",
    },
  },
  changeAfterVisit: {
    worse: {
      label: "悪化している",
      sentence: "前回の受診後より、悪くなっているように感じます。",
      aliases: ["悪くなった"],
    },
    same: {
      label: "変わらない",
      sentence: "前回の受診後から、大きくは変わっていないように感じます。",
    },
    better: {
      label: "良くなっている",
      sentence: "前回の受診後より、良くなっているように感じます。",
      aliases: ["良くなった"],
    },
    unknown: {
      label: "わからない",
      sentence: "前回受診時との比較ははっきりわかりません。",
    },
    newSymptom: {
      label: "別の症状が出た",
      sentence: "前回の受診後に、別の症状も出ています。",
    },
    noPrevious: {
      label: "前回受診していない",
      sentence: "",
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
  els.printButton = document.querySelector("#print-button");
  els.historyList = document.querySelector("#history-list");
  els.otherSymptomField = document.querySelector("#other-symptom-field");
  els.otherSymptom = document.querySelector("#other-symptom");
  els.note = document.querySelector("#note");
  els.noteCount = document.querySelector("#note-count");
  els.startedDate = document.querySelector("#started-date");
  els.createdDate = document.querySelector("#created-date");
  els.previewStarted = document.querySelector("#preview-started");
  els.previewFrequency = document.querySelector("#preview-frequency");
  els.previewSymptoms = document.querySelector("#preview-symptoms");
  els.previewChange = document.querySelector("#preview-change");
  els.previewNote = document.querySelector("#preview-note");
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
  els.otherSymptom?.addEventListener("input", () => {
    answers.otherSymptom = els.otherSymptom.value.trim();
    renderGeneratedText();
  });

  els.note?.addEventListener("input", () => {
    answers.note = els.note.value.trim();
    renderGeneratedText();
  });

  els.startedDate?.addEventListener("input", () => {
    answers.startedDate = els.startedDate.value;
    renderProgress();
    renderGeneratedText();
  });
}

function bindActions() {
  els.copyButton?.addEventListener("click", () => {
    copyText(getGeneratedText());
  });

  els.saveButton?.addEventListener("click", () => {
    saveCurrentMemo();
  });

  els.printButton?.addEventListener("click", () => {
    window.print();
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
      if (els.otherSymptom) els.otherSymptom.value = "";
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
  if (!els.otherSymptomField) return;
  els.otherSymptomField.hidden = !shouldShow;
  if (!shouldShow) {
    answers.otherSymptom = "";
    if (els.otherSymptom) els.otherSymptom.value = "";
  }
}

function renderGeneratedText() {
  const text = getGeneratedText();
  if (els.generatedText) {
    clearElement(els.generatedText);
    els.generatedText.classList.toggle("is-empty", !text);
    els.generatedText.textContent = text || "選んだ内容から、獣医さんにそのまま伝えやすい文章を作ります。";
  }

  renderPreviewFields(text);
  renderNoteCount();

  if (text) {
    setStatus("この内容でメモを作成しました", "success");
  } else {
    setStatus("未選択の項目があります。", "");
  }
}

function renderPreviewFields() {
  setText(els.previewStarted, formatStartedPreview());
  setText(els.previewFrequency, getOption("frequency", answers.frequency)?.label || "未選択");
  setText(els.previewSymptoms, formatSymptomPreview());
  setText(els.previewChange, getOption("changeAfterVisit", answers.changeAfterVisit)?.label || "未選択");
  setText(els.previewNote, answers.note || "未入力");

  if (els.createdDate) {
    const now = new Date();
    els.createdDate.textContent = `作成日：${formatDateSlash(now)}`;
    els.createdDate.dateTime = now.toISOString();
  }
}

function renderNoteCount() {
  if (els.noteCount) {
    els.noteCount.textContent = String(answers.note.length);
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
  if (normalizeAnswerValue("startedAt", answers.startedAt) || answers.startedDate) completed.push("startedAt");
  if (normalizeAnswerList("symptoms", answers.symptoms).length > 0) completed.push("symptoms");
  if (normalizeAnswerValue("frequency", answers.frequency)) completed.push("frequency");
  if (normalizeAnswerValue("changeAfterVisit", answers.changeAfterVisit) || answers.note) {
    completed.push("changeAfterVisit");
  }
  return completed;
}

function getGeneratedText() {
  const lines = [];
  const startedLead = getStartedLead();
  const frequency = getOption("frequency", answers.frequency);
  const changeAfterVisit = getOption("changeAfterVisit", answers.changeAfterVisit);
  const symptoms = getSymptomList();

  if (startedLead && symptoms) {
    lines.push(`${startedLead}、${symptoms}が気になっています。`);
  } else if (startedLead) {
    lines.push(`${startedLead}、気になる様子があります。`);
  } else if (symptoms) {
    lines.push(`${symptoms}が気になっています。`);
  }

  if (frequency) {
    lines.push(frequency.sentence);
  }

  if (changeAfterVisit?.sentence) {
    lines.push(changeAfterVisit.sentence);
  }

  if (answers.note) {
    lines.push(formatNoteSentence(answers.note));
  }

  if (lines.length > 0) {
    lines.push("よろしくお願いいたします。");
  }

  return lines.join("\n");
}

function getStartedLead() {
  if (answers.startedDate) {
    return `${formatDateInput(answers.startedDate)}ごろから`;
  }
  return getOption("startedAt", answers.startedAt)?.lead || "";
}

function formatStartedPreview() {
  const startedAt = getOption("startedAt", answers.startedAt);
  const dateText = answers.startedDate ? formatDateInput(answers.startedDate) : "";

  if (dateText && startedAt) return `${dateText}（${startedAt.label}）`;
  if (dateText) return `${dateText}ごろから`;
  if (startedAt) return startedAt.label;
  return "未選択";
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

function formatSymptomPreview() {
  const symptoms = normalizeAnswerList("symptoms", answers.symptoms)
    .map((symptom) => {
      if (symptom === "other" && answers.otherSymptom) {
        return formatOtherSymptomNoun(answers.otherSymptom);
      }
      return getOption("symptoms", symptom)?.label || "";
    })
    .filter(Boolean);

  if (symptoms.length === 0) return "未選択";
  return symptoms.map((symptom) => `・${symptom}`).join("\n");
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
  if (!els.historyList) return;
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
    startedDate: normalizedAnswers.startedDate,
    frequency: normalizedAnswers.frequency,
    symptoms: normalizedAnswers.symptoms,
    otherSymptom: normalizedAnswers.otherSymptom,
    changeAfterVisit: normalizedAnswers.changeAfterVisit,
    note: normalizedAnswers.note,
  });
  if (els.startedDate) els.startedDate.value = answers.startedDate;
  if (els.otherSymptom) els.otherSymptom.value = answers.otherSymptom;
  if (els.note) els.note.value = answers.note;
  renderAll();
  document.querySelector("#memo-output")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    startedDate: normalizedAnswers.startedDate,
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
    startedDate: normalizeDateValue(source.startedDate || ""),
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

function normalizeDateValue(value) {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
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

function formatDateInput(value) {
  const [year, month, day] = String(value || "").split("-");
  if (!year || !month || !day) return "";
  return `${year}/${month}/${day}`;
}

function formatDateSlash(date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function clearElement(element) {
  if (!element) return;
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function setStatus(message, type) {
  if (!els.statusMessage) return;
  els.statusMessage.textContent = message;
  if (type) {
    els.statusMessage.dataset.status = type;
  } else {
    delete els.statusMessage.dataset.status;
  }
}
