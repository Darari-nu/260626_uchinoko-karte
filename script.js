const STORAGE_VERSION = "1";
const STORAGE_KEYS = {
  version: "uchinoko:version",
  pets: "uchinoko:pets",
  settings: "uchinoko:settings",
};

const LABELS = {
  species: { cat: "猫", dog: "犬" },
  meal: { normal: "完食", less: "少なめ", half: "半分以下", none: "食べない" },
  poop: { normal: "通常", less: "少ない", more: "多い", diarrhea: "下痢", none: "出ていない" },
  mood: { active: "元気", normal: "普通", sleepy: "眠い", grumpy: "不機嫌", weak: "ぐったり" },
  concerns: {
    vomit: "吐いた",
    cough: "咳",
    itchy: "かゆい",
    limp: "歩き方",
    drinks_more: "水をよく飲む",
    pee_issue: "おしっこ",
    other: "その他",
  },
};

const state = {
  activePetId: null,
  selectedDate: todayKey(),
  form: {
    meal: "normal",
    poop: "normal",
    mood: "normal",
    concerns: [],
  },
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheElements();
  initializeStorage();
  bindChoiceButtons();
  bindForms();
  bindDataDeletion();
  loadInitialState();
  renderApp();
});

function cacheElements() {
  els.dailyForm = document.querySelector("#daily-form");
  els.profileForm = document.querySelector("#profile-form");
  els.todayMeta = document.querySelector("#today-meta");
  els.saveStatus = document.querySelector("#save-status");
  els.dailyMemo = document.querySelector("#daily-memo");
  els.petName = document.querySelector("#pet-name");
  els.petSpecies = document.querySelector("#pet-species");
  els.petBirthYear = document.querySelector("#pet-birth-year");
  els.baselineMeal = document.querySelector("#baseline-meal");
  els.baselinePoop = document.querySelector("#baseline-poop");
  els.baselineMood = document.querySelector("#baseline-mood");
  els.petNotes = document.querySelector("#pet-notes");
  els.calendarGrid = document.querySelector("#calendar-grid");
  els.dayDetail = document.querySelector("#day-detail");
  els.reportPreview = document.querySelector("#report-preview");
  els.deleteDataButton = document.querySelector("#delete-data-button");
}

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.version)) {
    localStorage.setItem(STORAGE_KEYS.version, STORAGE_VERSION);
  }
  if (!localStorage.getItem(STORAGE_KEYS.pets)) {
    writeJSON(STORAGE_KEYS.pets, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.settings)) {
    writeJSON(STORAGE_KEYS.settings, {
      activePetId: null,
      reportDays: 14,
      theme: "calm-clinic",
      lastOpenedDate: todayKey(),
    });
  }
}

function loadInitialState() {
  const settings = getSettings();
  const petIds = listPetIds();
  state.activePetId = settings.activePetId || petIds[0] || null;
  state.selectedDate = todayKey();
  updateSettings({ activePetId: state.activePetId, lastOpenedDate: todayKey() });
  loadRecordIntoForm();
}

function bindChoiceButtons() {
  document.querySelectorAll("[data-choice-group]").forEach((groupEl) => {
    groupEl.querySelectorAll(".choice-button").forEach((button) => {
      button.setAttribute("aria-pressed", "false");
      button.addEventListener("click", () => {
        const group = groupEl.dataset.choiceGroup;
        const value = button.dataset.value;
        if (group === "concerns") {
          toggleConcern(value);
        } else {
          state.form[group] = value;
        }
        renderChoiceState();
      });
    });
  });
}

function bindForms() {
  els.profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = els.petName.value.trim();
    if (!name) {
      setStatus("ペット名を入力してから保存してください。", "warning");
      els.petName.focus();
      return;
    }
    const pet = saveProfileFromForm();
    state.activePetId = pet.id;
    updateSettings({ activePetId: pet.id });
    loadRecordIntoForm();
    renderApp();
    setStatus(`${pet.name}のプロフィールを保存しました。`, "success");
  });

  els.dailyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const profile = getActiveProfile();
    if (!profile) {
      setStatus("先に設定でペット名を登録してください。", "warning");
      els.petName.focus();
      return;
    }
    saveDailyRecord(profile.id, todayKey(), {
      meal: state.form.meal,
      poop: state.form.poop,
      mood: state.form.mood,
      concerns: [...state.form.concerns],
      memo: els.dailyMemo.value.trim(),
    });
    state.selectedDate = todayKey();
    renderApp();
    setStatus("今日の記録を保存しました。受診で伝えやすい形で残っています。", "success");
  });
}

function bindDataDeletion() {
  els.deleteDataButton.addEventListener("click", () => {
    const ok = window.confirm("この端末に保存された、うちの子カルテのデータを削除します。よろしいですか？");
    if (!ok) return;
    Object.keys(localStorage)
      .filter((key) => key.startsWith("uchinoko:"))
      .forEach((key) => localStorage.removeItem(key));
    initializeStorage();
    state.activePetId = null;
    state.selectedDate = todayKey();
    state.form = { meal: "normal", poop: "normal", mood: "normal", concerns: [] };
    els.dailyMemo.value = "";
    els.profileForm.reset();
    renderApp();
    setStatus("この端末のデータを削除しました。", "success");
  });
}

function saveProfileFromForm() {
  const existing = getActiveProfile();
  const id = existing?.id || createPetId();
  const profile = {
    id,
    name: els.petName.value.trim(),
    species: els.petSpecies.value,
    birthYear: normalizeYear(els.petBirthYear.value),
    sex: "unknown",
    baseline: {
      meal: els.baselineMeal.value,
      poop: els.baselinePoop.value,
      mood: els.baselineMood.value,
    },
    notes: els.petNotes.value.trim(),
  };
  const ids = listPetIds();
  if (!ids.includes(id)) {
    writeJSON(STORAGE_KEYS.pets, [...ids, id]);
  }
  writeJSON(profileKey(id), profile);
  return profile;
}

function saveDailyRecord(petId, date, input) {
  const existing = getDailyRecord(petId, date);
  const now = new Date().toISOString();
  const record = {
    date,
    meal: input.meal || "normal",
    poop: input.poop || "normal",
    mood: input.mood || "normal",
    concerns: Array.isArray(input.concerns) ? input.concerns : [],
    memo: input.memo || "",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  writeJSON(recordKey(petId, date), record);
  return record;
}

function getDailyRecord(petId, date) {
  if (!petId) return null;
  return readJSON(recordKey(petId, date), null);
}

function getActiveProfile() {
  if (!state.activePetId) return null;
  return readJSON(profileKey(state.activePetId), null);
}

function listPetIds() {
  return readJSON(STORAGE_KEYS.pets, []);
}

function getSettings() {
  return readJSON(STORAGE_KEYS.settings, {
    activePetId: null,
    reportDays: 14,
    theme: "calm-clinic",
    lastOpenedDate: todayKey(),
  });
}

function updateSettings(patch) {
  const next = { ...getSettings(), ...patch };
  writeJSON(STORAGE_KEYS.settings, next);
  return next;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.warn(`Failed to parse localStorage key: ${key}`, error);
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function profileKey(id) {
  return `uchinoko:pets/${id}/profile`;
}

function recordKey(id, date) {
  return `uchinoko:pets/${id}/records/${date}`;
}

function createPetId() {
  if (window.crypto?.randomUUID) {
    return `pet_${window.crypto.randomUUID().slice(0, 8)}`;
  }
  return `pet_${Date.now().toString(36)}`;
}

function normalizeYear(value) {
  const year = Number.parseInt(value, 10);
  if (!Number.isFinite(year)) return "";
  return String(year).slice(0, 4);
}

function todayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function toggleConcern(value) {
  if (state.form.concerns.includes(value)) {
    state.form.concerns = state.form.concerns.filter((item) => item !== value);
  } else {
    state.form.concerns = [...state.form.concerns, value];
  }
}

function loadRecordIntoForm() {
  const record = getDailyRecord(state.activePetId, todayKey());
  state.form = {
    meal: record?.meal || "normal",
    poop: record?.poop || "normal",
    mood: record?.mood || "normal",
    concerns: record?.concerns || [],
  };
  els.dailyMemo.value = record?.memo || "";
}

function renderApp() {
  renderProfileForm();
  renderTodayMeta();
  renderChoiceState();
  renderCalendar();
  renderBasicReport();
}

function renderProfileForm() {
  const profile = getActiveProfile();
  if (!profile) return;
  els.petName.value = profile.name || "";
  els.petSpecies.value = profile.species || "cat";
  els.petBirthYear.value = profile.birthYear || "";
  els.baselineMeal.value = profile.baseline?.meal || "normal";
  els.baselinePoop.value = profile.baseline?.poop || "normal";
  els.baselineMood.value = profile.baseline?.mood || "normal";
  els.petNotes.value = profile.notes || "";
}

function renderTodayMeta() {
  const profile = getActiveProfile();
  if (!profile) {
    els.todayMeta.textContent = "設定でペット名を登録すると、今日の記録を保存できます。";
    return;
  }
  els.todayMeta.textContent = `${profile.name}（${LABELS.species[profile.species] || "ペット"}） / ${formatDateLabel(todayKey())}`;
}

function renderChoiceState() {
  document.querySelectorAll("[data-choice-group]").forEach((groupEl) => {
    const group = groupEl.dataset.choiceGroup;
    groupEl.querySelectorAll(".choice-button").forEach((button) => {
      const value = button.dataset.value;
      const pressed = group === "concerns"
        ? state.form.concerns.includes(value)
        : state.form[group] === value;
      button.setAttribute("aria-pressed", pressed ? "true" : "false");
      button.classList.toggle("is-selected", pressed);
    });
  });
}

function renderCalendar() {
  clearElement(els.calendarGrid);
  const profile = getActiveProfile();
  if (!profile) {
    appendEmpty(els.calendarGrid, "ペット登録後、直近14日の記録状態がここに表示されます。");
    renderDayDetail(null);
    return;
  }
  const flaggedRecords = getFlaggedRecords(profile.id, 14, profile.baseline);
  flaggedRecords.forEach(({ dateKey, record, flags }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `calendar-day ${getDayStatusClass(record, flags)}`;
    button.dataset.date = dateKey;
    button.setAttribute("aria-label", `${formatDateLabel(dateKey)} ${getStatusText(record, flags)}`);
    button.addEventListener("click", () => {
      state.selectedDate = dateKey;
      renderCalendar();
      renderDayDetail(record, flags);
    });
    const date = document.createElement("span");
    date.className = "calendar-date";
    date.textContent = formatDateLabel(dateKey);
    const status = document.createElement("span");
    status.className = "calendar-status";
    status.textContent = getStatusText(record, flags);
    button.append(date, status);
    if (dateKey === state.selectedDate) {
      button.setAttribute("aria-current", "date");
    }
    els.calendarGrid.append(button);
  });
  const selected = flaggedRecords.find((item) => item.dateKey === state.selectedDate);
  renderDayDetail(selected?.record || null, selected?.flags || { level: "none", reasons: [] });
}

function renderDayDetail(record, flags = { level: "none", reasons: [] }) {
  clearElement(els.dayDetail);
  const heading = document.createElement("h3");
  heading.textContent = "日別詳細";
  els.dayDetail.append(heading);
  if (!record) {
    appendMuted(els.dayDetail, "選択した日の記録はまだありません。未入力日は異常扱いしません。");
    return;
  }
  const list = document.createElement("dl");
  list.className = "detail-list";
  appendDefinition(list, "日付", formatDateLabel(record.date));
  appendDefinition(list, "食事", LABELS.meal[record.meal]);
  appendDefinition(list, "排便", LABELS.poop[record.poop]);
  appendDefinition(list, "気分", LABELS.mood[record.mood]);
  appendDefinition(list, "気になること", formatConcerns(record.concerns));
  appendDefinition(list, "メモ", record.memo || "なし");
  els.dayDetail.append(list);
  if (flags.reasons.length > 0) {
    const flagBox = document.createElement("div");
    flagBox.className = `flag-box ${flags.level === "alert" ? "is-alert" : "is-caution"}`;
    const label = document.createElement("strong");
    label.textContent = flags.level === "alert" ? "いつもと違う" : "注意";
    const reasonList = document.createElement("ul");
    flags.reasons.forEach((reason) => {
      const item = document.createElement("li");
      item.textContent = reason;
      reasonList.append(item);
    });
    flagBox.append(label, reasonList);
    els.dayDetail.append(flagBox);
  }
}

function renderBasicReport() {
  clearElement(els.reportPreview);
  const profile = getActiveProfile();
  if (!profile) {
    appendEmpty(els.reportPreview, "ペット登録と日次記録を保存すると、2週間サマリーが表示されます。");
    return;
  }
  const records = recentDateKeys(14)
    .map((dateKey) => getDailyRecord(profile.id, dateKey))
    .filter(Boolean);
  if (records.length === 0) {
    appendEmpty(els.reportPreview, `${profile.name}の記録はまだありません。今日の記録から始められます。`);
    return;
  }
  const summary = document.createElement("div");
  summary.className = "summary-list";
  appendStat(summary, "記録済み", `${records.length}日`);
  appendStat(summary, "食事が少なめ以下", `${records.filter((record) => record.meal !== "normal").length}日`);
  appendStat(summary, "気になることあり", `${records.filter((record) => record.concerns.length > 0).length}日`);
  els.reportPreview.append(summary);
}

function recentDateKeys(days) {
  const keys = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(start);
    date.setDate(start.getDate() - index);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    keys.push(`${year}-${month}-${day}`);
  }
  return keys;
}

function getFlaggedRecords(petId, days, baseline) {
  const keys = recentDateKeys(days);
  const items = keys.map((dateKey) => ({
    dateKey,
    record: getDailyRecord(petId, dateKey),
    flags: { level: "none", reasons: [] },
  }));
  items.forEach((item, index) => {
    if (!item.record) return;
    const previousRecords = items
      .slice(0, index)
      .map((previous) => previous.record)
      .filter(Boolean);
    item.flags = detectRecordFlags(item.record, previousRecords, baseline);
  });
  return items;
}

function detectRecordFlags(record, previousRecords, baseline = {}) {
  const reasons = [];
  const cautions = [];
  const allRecords = [...previousRecords, record];
  const previous = previousRecords.at(-1);
  const lastTwo = allRecords.slice(-2);
  const lastThree = allRecords.slice(-3);

  if (record.meal === "half" || record.meal === "none") {
    reasons.push(`食事が「${LABELS.meal[record.meal]}」です`);
  }
  if (lastTwo.length === 2 && lastTwo.every((item) => item.meal === "less")) {
    reasons.push("食事が2日連続で少なめです");
  }
  if (baseline.meal && baseline.meal !== record.meal && record.meal === "less" && previous?.meal !== "less") {
    cautions.push("普段の食事量より少なめです");
  }

  if (record.poop === "diarrhea" || record.poop === "none") {
    reasons.push(`排便が「${LABELS.poop[record.poop]}」です`);
  }
  const poopShiftCount = lastThree.filter((item) => item.poop === "less" || item.poop === "more").length;
  if (lastThree.length >= 2 && poopShiftCount >= 2) {
    cautions.push("排便の少ない/多い日が直近3回中2回以上あります");
  }

  if (record.mood === "weak") {
    reasons.push("気分が「ぐったり」です");
  }
  if (lastTwo.length === 2 && lastTwo.every((item) => item.mood === "sleepy" || item.mood === "grumpy")) {
    cautions.push("眠い/不機嫌が2日連続しています");
  }

  const alertConcerns = ["vomit", "cough", "limp", "pee_issue"];
  record.concerns
    .filter((value) => alertConcerns.includes(value))
    .forEach((value) => reasons.push(`気になることに「${LABELS.concerns[value]}」があります`));
  const drinksMoreCount = allRecords.filter((item) => item.concerns.includes("drinks_more")).length;
  if (record.concerns.includes("drinks_more") && drinksMoreCount >= 2) {
    reasons.push("水をよく飲む記録が2日以上あります");
  }

  if (/(血|痛|震え|呼吸|ぐったり)/.test(record.memo || "")) {
    cautions.push("メモに受診時確認したい言葉があります");
  }

  if (reasons.length > 0) {
    return { level: "alert", reasons: [...reasons, ...cautions] };
  }
  if (cautions.length > 0) {
    return { level: "caution", reasons: cautions };
  }
  return { level: "normal", reasons: [] };
}

function getDayStatusClass(record, flags) {
  if (!record) return "is-empty";
  if (flags.level === "alert") return "has-alert";
  if (flags.level === "caution") return "has-caution";
  return "has-record";
}

function getStatusText(record, flags) {
  if (!record) return "記録なし";
  if (flags.level === "alert") return "いつもと違う";
  if (flags.level === "caution") return "注意";
  return "記録済み";
}

function formatConcerns(values) {
  if (!values || values.length === 0) return "なし";
  return values.map((value) => LABELS.concerns[value] || value).join("、");
}

function appendDefinition(list, termText, detailText) {
  const term = document.createElement("dt");
  term.textContent = termText;
  const detail = document.createElement("dd");
  detail.textContent = detailText;
  list.append(term, detail);
}

function appendStat(parent, labelText, valueText) {
  const item = document.createElement("div");
  item.className = "summary-item";
  const label = document.createElement("span");
  label.textContent = labelText;
  const value = document.createElement("strong");
  value.textContent = valueText;
  item.append(label, value);
  parent.append(item);
}

function appendEmpty(parent, message) {
  const p = document.createElement("p");
  p.className = "empty-state";
  p.textContent = message;
  parent.append(p);
}

function appendMuted(parent, message) {
  const p = document.createElement("p");
  p.className = "muted";
  p.textContent = message;
  parent.append(p);
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function setStatus(message, type) {
  els.saveStatus.textContent = message;
  els.saveStatus.dataset.status = type;
}
