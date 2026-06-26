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
  if (type === "multiple") {
    answers[question] = answers[question].includes(value)
      ? answers[question].filter((item) => item !== value)
      : [...answers[question], value];
    if (value === "その他" && !answers[question].includes("その他")) {
      answers.otherSymptom = "";
      els.otherSymptom.value = "";
    }
    return;
  }

  answers[question] = answers[question] === value ? "" : value;
}

function renderAll() {
  renderChoices();
  renderOtherSymptomField();
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
        ? answers[question].includes(value)
        : answers[question] === value;
      button.setAttribute("aria-pressed", selected ? "true" : "false");
      button.classList.toggle("is-selected", selected);
    });
  });
}

function renderOtherSymptomField() {
  const shouldShow = answers.symptoms.includes("その他");
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
  els.generatedText.textContent = text || "気になる項目を選ぶと、ここに獣医さんへ伝える文章が表示されます。";
  if (text) {
    setStatus("文章をコピーまたは保存できます。", "success");
  } else {
    setStatus("未選択の項目があります。", "");
  }
}

function getGeneratedText() {
  const lines = [];
  const symptoms = getSymptomList();

  if (answers.startedAt && symptoms) {
    lines.push(`${answers.startedAt}、${symptoms}が気になっています。`);
  } else if (answers.startedAt) {
    lines.push(`${answers.startedAt}気になる様子があります。`);
  } else if (symptoms) {
    lines.push(`${symptoms}が気になっています。`);
  }

  if (answers.frequency) {
    lines.push(`頻度は${answers.frequency}です。`);
  }

  if (answers.changeAfterVisit) {
    lines.push(`前回の受診後は${answers.changeAfterVisit}と感じています。`);
  }

  if (answers.note) {
    lines.push(`補足として、${answers.note}。`);
  }

  return lines.join("\n");
}

function getSymptomList() {
  const symptoms = answers.symptoms
    .filter((symptom) => symptom !== "その他");
  if (answers.symptoms.includes("その他") && answers.otherSymptom) {
    symptoms.push(answers.otherSymptom);
  } else if (answers.symptoms.includes("その他")) {
    symptoms.push("その他の症状");
  }
  return symptoms.join("、");
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
  Object.assign(answers, {
    startedAt: memo.answers?.startedAt || "",
    frequency: memo.answers?.frequency || "",
    symptoms: Array.isArray(memo.answers?.symptoms) ? memo.answers.symptoms : [],
    otherSymptom: memo.answers?.otherSymptom || "",
    changeAfterVisit: memo.answers?.changeAfterVisit || "",
    note: memo.answers?.note || "",
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
  return {
    startedAt: answers.startedAt,
    frequency: answers.frequency,
    symptoms: [...answers.symptoms],
    otherSymptom: answers.otherSymptom,
    changeAfterVisit: answers.changeAfterVisit,
    note: answers.note,
  };
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
