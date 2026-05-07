const checklist = [
  {
    title: "結論から話していた",
    detail: "回答の冒頭で要点を伝え、その後に理由や補足を話せている。",
  },
  {
    title: "1分以内で答えた",
    detail: "長くなりすぎず、質問に対して簡潔に答えられている。",
  },
  {
    title: "具体的エピソードがある",
    detail: "経験、行動、結果などが伝わる具体例を入れて話せている。",
  },
  {
    title: "声が聞き取れた",
    detail: "声量、スピード、発音が適切で、内容を聞き取りやすい。",
  },
  {
    title: "目線が合っていた",
    detail: "面接官やカメラを意識し、視線が不自然に外れすぎていない。",
  },
  {
    title: "熱意が伝わった",
    detail: "志望度、前向きさ、入社後に頑張りたい姿勢が伝わっている。",
  },
];

const numerals = [
  "",
  "①",
  "②",
  "③",
  "④",
  "⑤",
  "⑥",
  "⑦",
  "⑧",
  "⑨",
  "⑩",
  "⑪",
  "⑫",
  "⑬",
  "⑭",
  "⑮",
  "⑯",
  "⑰",
  "⑱",
  "⑲",
  "⑳",
];
const state = {
  total: 3,
  current: 0,
  questions: [],
};

const setupPanel = document.querySelector("#setupPanel");
const workPanel = document.querySelector("#workPanel");
const resultPanel = document.querySelector("#resultPanel");
const setupForm = document.querySelector("#setupForm");
const questionCount = document.querySelector("#questionCount");
const decreaseBtn = document.querySelector("#decreaseBtn");
const increaseBtn = document.querySelector("#increaseBtn");
const progressText = document.querySelector("#progressText");
const questionTitle = document.querySelector("#questionTitle");
const currentScore = document.querySelector("#currentScore");
const progressFill = document.querySelector("#progressFill");
const questionList = document.querySelector("#questionList");
const checkForm = document.querySelector("#checkForm");
const checkItems = document.querySelector("#checkItems");
const memoInput = document.querySelector("#memoInput");
const resetQuestionBtn = document.querySelector("#resetQuestionBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const resultScore = document.querySelector("#resultScore");
const resultNote = document.querySelector("#resultNote");
const resultList = document.querySelector("#resultList");
const backToCheckBtn = document.querySelector("#backToCheckBtn");
const restartBtn = document.querySelector("#restartBtn");

function clampQuestionCount(value) {
  const numeric = Number.parseInt(value, 10);
  if (Number.isNaN(numeric)) return 1;
  return Math.min(99, Math.max(1, numeric));
}

function questionLabel(index) {
  const number = index + 1;
  return `質問${numerals[number] || number}`;
}

function createQuestionState() {
  return {
    checked: Array(checklist.length).fill(false),
    memo: "",
    answered: false,
  };
}

function scoreFor(question) {
  const achieved = question.checked.filter(Boolean).length;
  return Math.round((achieved / checklist.length) * 100);
}

function answeredQuestions() {
  return state.questions.filter((question) => question.answered);
}

function renderQuestionList() {
  questionList.innerHTML = "";

  state.questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `question-tab${index === state.current ? " active" : ""}`;
    button.innerHTML = `
      <span>${questionLabel(index)}</span>
      <span class="mini-score">${question.answered ? `${scoreFor(question)}%` : "未"}</span>
    `;
    button.addEventListener("click", () => {
      saveCurrentQuestion(false);
      state.current = index;
      renderWork();
    });
    questionList.append(button);
  });
}

function renderChecks() {
  const question = state.questions[state.current];
  checkItems.innerHTML = "";

  checklist.forEach((item, index) => {
    const id = `check-${state.current}-${index}`;
    const label = document.createElement("label");
    label.className = "check-item";
    label.setAttribute("for", id);
    label.innerHTML = `
      <input id="${id}" type="checkbox" ${question.checked[index] ? "checked" : ""} />
      <span>
        <strong>${item.title}</strong>
        <span>${item.detail}</span>
      </span>
    `;
    label.querySelector("input").addEventListener("change", (event) => {
      question.checked[index] = event.target.checked;
      question.answered = true;
      updateScoreDisplays();
      renderQuestionList();
    });
    checkItems.append(label);
  });

  memoInput.value = question.memo;
}

function updateScoreDisplays() {
  const question = state.questions[state.current];
  currentScore.textContent = `${scoreFor(question)}%`;
  progressText.textContent = `${state.current + 1} / ${state.total}`;
  progressFill.style.width = `${((state.current + 1) / state.total) * 100}%`;
  prevBtn.disabled = state.current === 0;
  nextBtn.disabled = state.current === state.total - 1;
}

function renderWork() {
  questionTitle.textContent = questionLabel(state.current);
  renderQuestionList();
  renderChecks();
  updateScoreDisplays();
}

function saveCurrentQuestion(markAnswered = true) {
  const question = state.questions[state.current];
  question.memo = memoInput.value;
  if (markAnswered) question.answered = true;
}

function showPanel(panel) {
  [setupPanel, workPanel, resultPanel].forEach((element) => element.classList.add("hidden"));
  panel.classList.remove("hidden");
}

function start() {
  state.total = clampQuestionCount(questionCount.value);
  questionCount.value = state.total;
  state.current = 0;
  state.questions = Array.from({ length: state.total }, createQuestionState);
  showPanel(workPanel);
  renderWork();
}

function renderResult() {
  saveCurrentQuestion(true);
  const targets = answeredQuestions();
  const average =
    targets.length === 0
      ? 0
      : Math.round(targets.reduce((sum, question) => sum + scoreFor(question), 0) / targets.length);

  resultScore.textContent = `${average}%`;
  resultNote.textContent = `${targets.length}問分のチェック項目達成率を平均しました。`;
  resultList.innerHTML = "";

  targets.forEach((question, index) => {
    const score = scoreFor(question);
    const row = document.createElement("div");
    row.className = "result-row";
    row.innerHTML = `
      <strong>${questionLabel(state.questions.indexOf(question))}</strong>
      <div class="row-bar" aria-hidden="true"><span style="width: ${score}%"></span></div>
      <span class="row-score">${score}%</span>
    `;
    resultList.append(row);
  });

  if (targets.length === 0) {
    const row = document.createElement("p");
    row.className = "result-note";
    row.textContent = "まだチェック済みの質問がありません。";
    resultList.append(row);
  }

  showPanel(resultPanel);
}

decreaseBtn.addEventListener("click", () => {
  questionCount.value = clampQuestionCount(questionCount.value) - 1;
  questionCount.value = clampQuestionCount(questionCount.value);
});

increaseBtn.addEventListener("click", () => {
  questionCount.value = clampQuestionCount(questionCount.value) + 1;
  questionCount.value = clampQuestionCount(questionCount.value);
});

questionCount.addEventListener("input", () => {
  questionCount.value = clampQuestionCount(questionCount.value);
});

setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  start();
});

memoInput.addEventListener("input", () => {
  state.questions[state.current].memo = memoInput.value;
});

resetQuestionBtn.addEventListener("click", () => {
  state.questions[state.current] = createQuestionState();
  renderWork();
});

prevBtn.addEventListener("click", () => {
  if (state.current === 0) return;
  saveCurrentQuestion();
  state.current -= 1;
  renderWork();
});

nextBtn.addEventListener("click", () => {
  if (state.current === state.total - 1) return;
  saveCurrentQuestion();
  state.current += 1;
  renderWork();
});

checkForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderResult();
});

backToCheckBtn.addEventListener("click", () => {
  showPanel(workPanel);
  renderWork();
});

restartBtn.addEventListener("click", () => {
  state.total = 3;
  state.current = 0;
  state.questions = [];
  questionCount.value = 3;
  showPanel(setupPanel);
});
