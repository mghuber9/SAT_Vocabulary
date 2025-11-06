// script.js — Academic Medic SAT Vocab (v1.3)
// features: flashcards, multiple choice, filters, units

// fallback if JSON fails
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
// current working list after filters/units
let currentList = [];
// index for flashcard mode
let currentIndex = 0;
// track if we are currently in "unit mode"
let activeUnit = null;

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

// UNITS
const unitButtons = document.querySelectorAll(".unit-btn");

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
  modeButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  if (mode === "flashcard") {
    flashcardPanel.classList.add("visible");
    multiplePanel.classList.remove("visible");
  } else if (mode === "multiple") {
    multiplePanel.classList.add("visible");
    flashcardPanel.classList.remove("visible");
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

  defBox.classList.add("hidden");

  statusEl.textContent = `${index + 1} / ${currentList.length} words${
    activeUnit ? " • Unit " + activeUnit : ""
  }`;
}

// ===== FILTER HANDLING =====
function applyFilter(filterName) {
  // if we click a filter, we are leaving unit mode
  activeUnit = null;
  unitButtons.forEach((b) => b.classList.remove("active"));

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
    currentList = [...vocab];
  }

  currentIndex = 0;
  showWord(0);
  buildMultipleChoiceQuestion();
}

// ===== UNIT HANDLING =====
// we will split vocab into 6 roughly equal chunks AFTER it is loaded
function getUnitList(unitNumber) {
  if (!vocab.length) return [];
  const total = vocab.length;
  const units = 6;
  const size = Math.ceil(total / units); // ~25 for 150

  const start = (unitNumber - 1) * size;
  const end = start + size;
  return vocab.slice(start, end);
}

// ===== MULTIPLE CHOICE =====
function buildMultipleChoiceQuestion() {
  const source =
    currentList.length >= 4
      ? currentList
      : vocab.length >= 4
      ? vocab
      : fallbackVocab;

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

  // pick distractors
  const pool = source
    .map((_, i) => i)
    .filter((i) => i !== correctIndex);
  shuffleArray(pool);

  const distractors = [];
  for (let i = 0; i < 3 && i < pool.length; i++) {
    distractors.push(source[pool[i]]);
  }

  // top up from full list if needed
  while (distractors.length < 3 && vocab.length > 3) {
    const extra = vocab[rand(vocab.length)];
    const exists =
      extra.word === correctItem.word ||
      distractors.find((d) => d.word === extra.word);
    if (!exists) distractors.push(extra);
  }

  const options = [
    { text: correctItem.definition, correct: true },
    ...distractors.map((d) => ({ text: d.definition, correct: false }))
  ];

  shuffleArray(options);

  mcOptionsEl.innerHTML = "";
  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "mc-option-btn";
    btn.textContent = opt.text;
    btn.addEventListener("click", () => {
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

  mcStatusEl.textContent = `Pool: ${source.length} words${
    activeUnit ? " • Unit " + activeUnit : ""
  }`;
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
    setMode(btn.dataset.mode);
  });
});

// filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.filter);
  });
});

// unit buttons
unitButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const unit = btn.dataset.unit;
    // clear active on all
    unitButtons.forEach((b) => b.classList.remove("active"));
    if (unit === "all") {
      // go back to whatever filter is active
      activeUnit = null;
      // also highlight current filter again
      const activeFilter = document.querySelector(".filter-btn.active");
      if (activeFilter) {
        applyFilter(activeFilter.dataset.filter);
      } else {
        applyFilter("all");
      }
      return;
    }

    // set this unit active
    btn.classList.add("active");
    activeUnit = Number(unit);
    currentList = getUnitList(activeUnit);
    currentIndex = 0;
    showWord(0);
    buildMultipleChoiceQuestion();
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
    // sort alphabetically so Units are predictable
    vocab.sort((a, b) => a.word.localeCompare(b.word));

    // default view: all
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

// ===== EMAIL SIGNUP → LeadConnector webhook =====
const emailForm = document.getElementById("email-form");
const emailInput = document.getElementById("email-input");
const emailMessage = document.getElementById("email-message");

// put your real LeadConnector webhook / form-capture URL here
const LC_WEBHOOK_URL = "https://YOUR-LEADCONNECTOR-URL-HERE";

if (emailForm) {
  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;

    try {
      await fetch(LC_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          source: "sat-vocab-site",
          tag: "sat-vocab"
        })
      });

      emailMessage.textContent = "Thanks! You’re on the list 🟢";
      emailInput.value = "";
    } catch (err) {
      console.warn("LeadConnector submit failed", err);
      emailMessage.textContent = "Hmm… couldn't submit right now. Try again later.";
    }
  });
}



// default mode
setMode("flashcard");
