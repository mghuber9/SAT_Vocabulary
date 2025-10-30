// script.js — Academic Medic SAT Vocab (v1.2)
// features: flashcards, multiple choice, filters

// 1. fallback data (in case JSON doesn't load)
const fallbackVocab = [
  {
    word: "advocate",
    pos: "v.",
    definition: "to support or speak in favor of",
    example: "She advocates equal access to education.",
    category: "academic",
    tags: ["argument", "author-purpose"]
  },
  {
    word: "sardonic",
    pos: "adj.",
    definition: "mocking or scornful",
    example: "His sardonic tone was obvious.",
    category: "tone",
    tags: ["negative", "sarcasm"]
  },
  {
    word: "mitigate",
    pos: "v.",
    definition: "to make less severe",
    example: "Masks can mitigate transmission.",
    category: "academic",
    tags: ["solution"]
  },
  {
    word: "bolster",
    pos: "v.",
    definition: "to strengthen or support",
    example: "Several studies bolster the author’s claim.",
    category: "academic",
    tags: ["evidence", "argument"]
  }
];

// master list (full 150)
let vocab = [];
// current working list after filters
let currentList = [];
// index for flashcard mode
let currentIndex = 0;

// FLASHCARD ELEMENTS
const wordEl = document.getElementById("word");
const posEl = document.getElementById("pos");
const defBox = document.getElementById("definition-box");
const defEl = document.getElementById("definition");
const exEl = document.getElementById("example");
const metaEl = document.getElementById("meta");
const statusEl = document.getElementById("status");

const showBtn = document.getElementById("show-btn");
const nextBtn = document.getElementById("next-btn");
const shuffleBtn = document.getElementById("shuffle-btn");

// MULTIPLE CHOICE ELEMENTS
const mcWordEl = document.getElementById("mc-word");
const mcPosEl = document.getElementById("mc-pos");
const mcMetaEl = document.getElementById("mc-meta");
const mcOptionsEl = document.getElementById("mc-options");
const mcFeedbackEl = document.getElementById("mc-feedback");
const mcNextBtn = document.getElementById("mc-next-btn");
const mcStatusEl = document.getElementById("mc-status");

// MODE SWITCHING
const modeButtons = document.querySelectorAll(".mode-btn");
const flashcardPanel = document.getElementById("flashcard-panel");
const multiplePanel = document.getElementById("multiple-panel");

// FILTERS
const filterButtons = document.querySelectorAll(".filter-btn");

// helper: random int
function rand(max) {
  return Math.floor(Math.random() * max);
}

// shuffle array in place
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===== MODE HANDLING =====
function setMode(mode) {
  // toggle active button
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // toggle panels
  if (mode === "flashcard") {
    flashcardPanel.classList.add("visible");
    multiplePanel.classList.remove("visible");
  } else if (mode === "multiple") {
    multiplePanel.classList.add("visible");
    flashcardPanel.classList.remove("visible");
    // build MC from current filter
    buildMultipleChoiceQuestion();
  }
}

// ===== FLASHCARD DISPLAY =====
function showWord(index) {
  if (!currentList.length) return;
  const item = currentList[index];

  wordEl.textContent = item.word;
  posEl.textContent = item.pos || "";
  defEl.textContent = item.definition || "";
  exEl.textContent = item.example || "—";
  metaEl.textContent = item.category
    ? `Category: ${item.category}${item.tags ? " • " + item.tags.join(", ") : ""}`
    : "";

  // hide definition until user clicks "Show"
  defBox.classList.add("hidden");

  statusEl.textContent = `${index + 1} / ${currentList.length} words`;
}

// ===== FILTER HANDLING =====
function applyFilter(filterName) {
  if (filterName === "all") {
    currentList = [...vocab];
  } else if (filterName === "academic") {
    currentList = vocab.filter((w) => w.category === "academic");
  } else if (filterName === "tone") {
    currentList = vocab.filter((w) => w.category === "tone");
  } else if (filterName === "random10") {
    const temp = [...vocab];
    shuffleArray(temp);
    currentList = temp.slice(0, 10);
  } else {
    // fallback
    currentList = [...vocab];
  }

  currentIndex = 0;
  showWord(0);
  // refresh MC too so both modes use same pool
  buildMultipleChoiceQuestion();
}

// ===== MULTIPLE CHOICE =====
function buildMultipleChoiceQuestion() {
  // use current filter pool if big enough, else full vocab
  const source = currentList.length >= 4 ? currentList : vocab;
  if (!source.length) return;

  mcFeedbackEl.textContent = "";

  // pick correct
  const correctIndex = rand(source.length);
  const correctItem = source[correctIndex];

  mcWordEl.textContent = correctItem.word;
  mcPosEl.textContent = correctItem.pos || "";
  mcMetaEl.textContent = correctItem.category
    ? `Category: ${correctItem.category}`
    : "";

  // pick distractors from same pool
  const pool = source
    .map((_, i) => i)
    .filter((i) => i !== correctIndex);
  shuffleArray(pool);

  const distractors = [];
  for (let i = 0; i < 3 && i < pool.length; i++) {
    distractors.push(source[pool[i]]);
  }

  // if still not enough distractors (because we filtered to a tiny list),
  // top up from full vocab
  while (distractors.length < 3 && vocab.length > 3) {
    const extra = vocab[rand(vocab.length)];
    const alreadyUsed =
      extra.word === correctItem.word ||
      distractors.find((d) => d.word === extra.word);
    if (!alreadyUsed) distractors.push(extra);
  }

  const options = [
    { text: correctItem.definition, correct: true },
    ...distractors.map((d) => ({
      text: d.definition,
      correct: false
    }))
  ];

  shuffleArray(options);

  mcOptionsEl.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "mc-option-btn";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
      // lock all
      const allBtns = mcOptionsEl.querySelectorAll("button");
      allBtns.forEach((b) => (b.disabled = true));

      if (opt.correct) {
        btn.classList.add("correct");
        mcFeedbackEl.textContent = "✅ Correct!";
      } else {
        btn.classList.add("incorrect");
        mcFeedbackEl.textContent = `❌ Not quite. The correct definition is: "${correctItem.definition}"`;
        allBtns.forEach((b) => {
          if (b.textContent === correctItem.definition) {
            b.classList.add("correct");
          }
        });
      }
    });
    mcOptionsEl.appendChild(btn);
  });

  mcStatusEl.textContent = `Pool: ${source.length} words`;
}

// ===== EVENT LISTENERS =====

// flashcard buttons
showBtn.addEventListener("click", () => {
  defBox.classList.remove("hidden");
});

nextBtn.addEventListener("click", () => {
  if (!currentList.length) return;
  currentIndex = (currentIndex + 1) % currentList.length;
  showWord(currentIndex);
});

shuffleBtn.addEventListener("click", () => {
  if (!currentList.length) return;
  shuffleArray(currentList);
  currentIndex = 0;
  showWord(currentIndex);
});

// mode buttons
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    const mode = btn.dataset.mode;
    setMode(mode);
  });
});

// filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    applyFilter(filter);
  });
});

// MC next
mcNextBtn.addEventListener("click", () => {
  buildMultipleChoiceQuestion();
});

// ===== LOAD DATA =====
fetch("sat_vocab_core.json")
  .then((res) => {
    if (!res.ok) throw new Error("Network error");
    return res.json();
  })
  .then((data) => {
    vocab = Array.isArray(data) ? data : [];
    if (!vocab.length) {
      vocab = fallbackVocab;
    }
    // sort alphabetically
    vocab.sort((a, b) => a.word.localeCompare(b.word));

    // default filter = all
    currentList = [...vocab];
    showWord(0);
    buildMultipleChoiceQuestion();
  })
  .catch((err) => {
    console.warn("Could not load sat_vocab_core.json, using fallback.", err);
    vocab = fallbackVocab;
    currentList = [...fallbackVocab];
    showWord(0);
    buildMultipleChoiceQuestion();
  });

// default mode
setMode("flashcard");
