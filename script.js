// script.js

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
  }
];

let vocab = [];
let currentIndex = 0;

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

// helper: random int
function rand(max) {
  return Math.floor(Math.random() * max);
}

// display a word
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

// randomize order
function shuffleVocab() {
  for (let i = vocab.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [vocab[i], vocab[j]] = [vocab[j], vocab[i]];
  }
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
  shuffleVocab();
  currentIndex = 0;
  showWord(currentIndex);
});

// 2. load the real JSON
fetch("sat_vocab_core.json")
  .then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  })
  .then((data) => {
    // data should be an array
    vocab = Array.isArray(data) ? data : [];
    if (!vocab.length) {
      // fallback if empty
      vocab = fallbackVocab;
    }
    // optional: sort alphabetically by word
    vocab.sort((a, b) => a.word.localeCompare(b.word));
    showWord(0);
  })
  .catch((err) => {
    console.warn("Could not load sat_vocab_core.json, using fallback.", err);
    vocab = fallbackVocab;
    showWord(0);
  });
