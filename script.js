// script.js — Academic Medic SAT Vocab

// Fallback data
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

let vocab = [];
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
    // when entering MC mode, generate a question
    buildMultipleChoiceQuestion();
  }
}

// helper: random int
function rand(max) {
  return Math.floor(Math.random() * max);
}

// FLASHCARD: display a word
function showWord(index) {
  if (!vocab.length) return;
  const item = vocab[index];

  wordEl.textContent = item.word;
  posEl.textContent = item.pos || "";
  defEl.textContent = item.definition || "";
  exEl.textContent = item.example || "—";
  metaEl.textContent = item.category
    ? `Category: ${item.category} ${item.tags ? "• " + item.tags.join(", ") : ""}`
    : "";

  // hide definition until user clicks "Show"
  defBox.classList.add("hidden");

  statusEl.textContent = `${index + 1} / ${vocab.length} words`;
}

// shuffle array in place
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// MULTIPLE CHOICE: build question
function buildMultipleChoiceQuestion() {
  if (!vocab.length) return;

  mcFeedbackEl.textContent = "";

  // 1. choose a correct word
  const correctIndex = rand(vocab.length);
  const correctItem = vocab[correctIndex];

  mcWordEl.textContent = correctItem.word;
  mcPosEl.textContent = correctItem.pos || "";
  mcMetaEl.textContent = correctItem.category
    ? `Category: ${correctItem.category}`
    : "";

  // 2. choose 3 distractors (different words)
  const distractors = [];
  // make a pool of indexes except correct
  const pool = vocab.map((_, i) => i).filter((i) => i !== correctIndex);
  shuffleArray(pool);
  for (let i = 0; i < 3 && i < pool.length; i++) {
    distractors.push(vocab[pool[i]]);
  }

  // 3. make options array
  const options = [
    {
      text: correctItem.definition,
      correct: true
    },
    ...distractors.map((item) => ({
      text: item.definition,
      correct: false
    }))
  ];

  // 4. shuffle options
  shuffleArray(options);

  // 5. render buttons
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
        // highlight correct one
        allBtns.forEach((b) => {
          if (b.textContent === correctItem.definition) {
            b.classList.add("correct");
          }
        });
      }
    });
    mcOptionsEl.appendChild(btn);
  });

  // update status (optional: track question count)
  mcStatusEl.textContent = `Question: ${Math.floor(Math.random() * 9000)}`;
}

// EVENT LISTENERS
showBtn.addEventListener("click", () => {
  defBox.classList.remove("hidden");
});

nextBtn.addEventListener("click", () => {
  if (!vocab.length) return;
  currentIndex = (currentIndex + 1) % vocab.length;
  showWord(currentIndex);
});

shuffleBtn.addEventListener("click", () => {
  if (!vocab.length) return;
  shuffleArray(vocab);
  currentIndex = 0;
  showWord(currentIndex);
});

// mode buttons
modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const mode = btn.dataset.mode;
    if (btn.disabled) return;
    setMode(mode);
  });
});

// MC next
mcNextBtn.addEventListener("click", () => {
  buildMultipleChoiceQuestion();
});

// 3. load the real JSON
fetch("sat_vocab_core.json")
  .then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  })
  .then((data) => {
    vocab = Array.isArray(data) ? data : [];
    if (!vocab.length) {
      vocab = fallbackVocab;
    }

    // sort alphabetically
    vocab.sort((a, b) => a.word.localeCompare(b.word));

    // show first word in flashcard mode
    showWord(0);

    // also prep the first MC question (in case they switch right away)
    buildMultipleChoiceQuestion();
  })
  .catch((err) => {
    console.warn("Could not load sat_vocab_core.json, using fallback.", err);
    vocab = fallbackVocab;
    showWord(0);
    buildMultipleChoiceQuestion();
  });

// default mode
setMode("flashcard");
