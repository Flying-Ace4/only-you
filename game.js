
const screens = {
  title: document.getElementById("title-screen"),
  setup: document.getElementById("setup-screen"),
  game: document.getElementById("game-screen"),
  ending: document.getElementById("ending-screen")
};

const el = {
  continue: document.getElementById("continue-game"),
  name: document.getElementById("player-name"),
  difficulty: document.getElementById("difficulty"),
  day: document.getElementById("day-label"),
  location: document.getElementById("location-label"),
  speaker: document.getElementById("speaker"),
  text: document.getElementById("story-text"),
  choices: document.getElementById("choices"),
  portrait: document.getElementById("portrait"),
  sceneArt: document.getElementById("scene-art"),
  modal: document.getElementById("menu-modal"),
  endingTitle: document.getElementById("ending-title"),
  endingText: document.getElementById("ending-text"),
  endingClues: document.getElementById("ending-clues")
};

const heroineNames = ["Elise", "Nora", "Camille", "Violet", "Audrey", "June"];
const archetypes = ["protector", "watcher", "abandoned", "strategist"];
const friendNames = ["Marcus", "Daniel", "Theo", "Caleb"];
const locations = ["Campus Café", "Library Steps", "Rainy Bus Stop", "Student Center", "Riverside Walk", "Your Apartment Hall"];

let state = null;

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

function newState() {
  const difficulty = el.difficulty.value;
  const heroine = rand(heroineNames);
  return {
    player: el.name.value.trim() || "Alex",
    heroine,
    friend: rand(friendNames),
    archetype: rand(archetypes),
    difficulty,
    day: 1,
    sceneIndex: 0,
    affection: 34,
    trust: 28,
    suspicion: 4,
    fear: 0,
    dependence: 8,
    awareness: 0,
    morality: 58,
    flags: {},
    history: [],
    deck: buildDeck(difficulty),
    runSeed: Math.random().toString(36).slice(2)
  };
}

function buildDeck(difficulty) {
  const calm = [
    "coffee", "library", "gift", "rain", "study", "walk", "missedCall", "friendWarning",
    "photo", "doorstep", "rumor", "lateText", "borrowedBook", "quietDay"
  ];
  const uneasy = ["unknownText", "movedSeat", "vanishedPost", "wrongName", "lockedDoor"];
  const extra = difficulty === "story" ? 1 : difficulty === "uneasy" ? 4 : 2;
  return shuffle([...calm, ...shuffle(uneasy).slice(0, extra)]).slice(0, 9);
}

const events = {
  coffee: s => ({
    location: "Campus Café",
    speaker: s.heroine,
    text: `“You always look at the menu for a full minute and order the same thing.”\n\n${s.heroine} smiles as she places your drink in front of you. You cannot remember telling her what you liked.`,
    choices: [
      { text: "“You remembered?”", effects: { affection: 4, trust: 2 }, flag: "acceptedCare" },
      { text: "“How did you know my order?”", effects: { suspicion: 3, awareness: 2 } },
      { text: "“That’s alarmingly observant.”", effects: { affection: 1, suspicion: 1, trust: 1 } }
    ]
  }),
  library: s => ({
    location: "Library Steps",
    speaker: s.friend,
    text: `${s.friend} lowers his voice. “She was here before you got here. Just sitting there. Waiting.”\n\nAcross the courtyard, ${s.heroine} looks up at exactly the right moment.`,
    choices: [
      { text: "Wave to her.", effects: { affection: 3, dependence: 2 } },
      { text: "Ask how long she was waiting.", effects: { suspicion: 2, awareness: 2 } },
      { text: `Tell ${s.friend} he’s overthinking it.`, effects: { trust: 1, suspicion: -1 }, flag: "dismissedFriend" }
    ]
  }),
  gift: s => ({
    location: "Student Center",
    speaker: s.heroine,
    text: `${s.heroine} hands you a small wrapped box. Inside is a replacement for the pen you lost yesterday.\n\n“I noticed you kept reaching for it.”`,
    choices: [
      { text: "Thank her sincerely.", effects: { affection: 5, trust: 3, dependence: 2 }, flag: "lovedGift" },
      { text: "Ask where she found the exact same model.", effects: { suspicion: 3, awareness: 2 } },
      { text: "Refuse it politely.", effects: { affection: -3, fear: 1, awareness: 1 } }
    ]
  }),
  rain: s => ({
    location: "Rainy Bus Stop",
    speaker: s.heroine,
    text: `Rain rattles against the shelter roof. ${s.heroine} steps beneath your umbrella without asking, close enough that her shoulder warms yours.\n\n“You looked lonely from across the street.”`,
    choices: [
      { text: "Move closer so she stays dry.", effects: { affection: 4, trust: 2 } },
      { text: "Ask why she was across the street.", effects: { suspicion: 3, awareness: 3 } },
      { text: "Offer her the umbrella and walk in the rain.", effects: { affection: 2, morality: 2, dependence: -1 } }
    ]
  }),
  study: s => ({
    location: "Quiet Study Room",
    speaker: s.heroine,
    text: `You look up from your notes and find ${s.heroine} watching you rather than reading.\n\nShe does not look away. “Sorry. You make concentrating difficult.”`,
    choices: [
      { text: "Flirt back.", effects: { affection: 6, dependence: 2 } },
      { text: "Laugh and return to studying.", effects: { affection: 1, trust: 1 } },
      { text: "Ask what she actually wants.", effects: { suspicion: 2, awareness: 2, trust: -1 } }
    ]
  }),
  walk: s => ({
    location: "Riverside Walk",
    speaker: s.heroine,
    text: `${s.heroine} knows the quiet path behind the athletics building. She also knows you dislike crowds.\n\n“I thought you’d prefer this way.”`,
    choices: [
      { text: "Admit that she was right.", effects: { affection: 3, trust: 3, dependence: 2 } },
      { text: "Ask how she knew.", effects: { suspicion: 2, awareness: 2 } },
      { text: "Suggest the crowded route anyway.", effects: { affection: -1, dependence: -2 } }
    ]
  }),
  missedCall: s => ({
    location: "Your Apartment",
    speaker: s.heroine,
    text: `You wake to seven missed calls from ${s.heroine}. The eighth arrives while you are still staring at the screen.\n\nWhen you answer, she exhales. “There you are.”`,
    choices: [
      { text: "Apologize for worrying her.", effects: { affection: 3, dependence: 5, fear: -1 } },
      { text: "Tell her seven calls is too many.", effects: { affection: -2, awareness: 4, fear: 1 } },
      { text: "Ask what happened.", effects: { trust: 2, suspicion: 1 } }
    ]
  }),
  friendWarning: s => ({
    location: "Campus Courtyard",
    speaker: s.friend,
    text: `${s.friend} catches your sleeve. “I’m not saying she’s dangerous. I’m saying she asked me whether you’d ever dated anyone who looked like her.”`,
    choices: [
      { text: "Defend her.", effects: { affection: 1, suspicion: -1 }, flag: "defendedHer" },
      { text: "Ask exactly what she said.", effects: { suspicion: 4, awareness: 3 }, flag: "investigating" },
      { text: "Tell him to stay out of it.", effects: { trust: -2, dependence: 2 }, flag: "isolating" }
    ]
  }),
  photo: s => ({
    location: "Your Phone",
    speaker: "",
    text: `A photo appears in your messages from ${s.heroine}: you at the café window this morning.\n\nThe caption reads: “You looked peaceful. I didn’t want to interrupt.”`,
    choices: [
      { text: "Send a heart.", effects: { affection: 5, dependence: 4 } },
      { text: "Ask where she was standing.", effects: { suspicion: 5, awareness: 4 } },
      { text: "Do not reply.", effects: { affection: -2, fear: 2, awareness: 1 } }
    ]
  }),
  doorstep: s => ({
    location: "Your Apartment Hall",
    speaker: s.heroine,
    text: `${s.heroine} is sitting outside your door with a paper bag of food.\n\n“I knew you’d skip dinner.”\n\nYou did.`,
    choices: [
      { text: "Invite her inside.", effects: { affection: 6, trust: 4, dependence: 4 }, flag: "invitedInside" },
      { text: "Take the food but ask her to leave.", effects: { affection: -1, dependence: 1, awareness: 2 } },
      { text: "Ask how she knew you were home.", effects: { suspicion: 4, awareness: 3 } }
    ]
  }),
  rumor: s => ({
    location: "Student Center",
    speaker: s.friend,
    text: `${s.friend} tells you someone has been spreading a rumor that you and ${s.heroine} are already together.\n\nWhen you confront her, she looks genuinely surprised. Or performs surprise flawlessly.`,
    choices: [
      { text: "Believe her.", effects: { trust: 4, suspicion: -2 } },
      { text: "Tell her the rumor needs to stop.", effects: { affection: -2, awareness: 3 } },
      { text: "Ask whether she wants it to be true.", effects: { affection: 5, dependence: 3 } }
    ]
  }),
  lateText: s => ({
    location: "Your Bedroom",
    speaker: s.heroine,
    text: `12:41 a.m.\n\n${s.heroine}: “Promise me you’re home.”\n\nBefore you answer, another message appears.\n\n“I can see your light.”`,
    choices: [
      { text: "Look out the window.", effects: { suspicion: 6, awareness: 5 } },
      { text: "Tell her to go home.", effects: { affection: -3, fear: 2, awareness: 4 } },
      { text: "Ask if she wants to come up.", effects: { affection: 6, dependence: 6, suspicion: -1 } }
    ]
  }),
  borrowedBook: s => ({
    location: "Library",
    speaker: s.heroine,
    text: `${s.heroine} returns a novel you never remember lending her. Several passages are underlined.\n\nEvery marked line is about devotion.`,
    choices: [
      { text: "Ask which passage she liked best.", effects: { affection: 4, trust: 2 } },
      { text: "Say you never lent it to her.", effects: { suspicion: 4, awareness: 3 } },
      { text: "Keep the book without comment.", effects: { suspicion: 1, dependence: 1 } }
    ]
  }),
  quietDay: s => ({
    location: "A Quiet Day",
    speaker: "",
    text: `${s.heroine} does not text you all morning.\n\nBy lunch, the silence has become a presence of its own.`,
    choices: [
      { text: "Message her first.", effects: { affection: 4, dependence: 4 } },
      { text: "Enjoy the space.", effects: { dependence: -2, fear: 1 } },
      { text: `Ask ${s.friend} whether he has heard from her.`, effects: { suspicion: 2, awareness: 2 } }
    ]
  }),
  unknownText: s => ({
    location: "Unknown Number",
    speaker: "Unknown",
    text: `“You should ask ${s.heroine} where she was last Thursday.”\n\nThe number cannot receive replies.`,
    choices: [
      { text: "Confront her immediately.", effects: { suspicion: 6, awareness: 5, trust: -2 }, flag: "confronted" },
      { text: "Save the message and say nothing.", effects: { suspicion: 4, awareness: 6 }, flag: "investigating" },
      { text: "Delete it.", effects: { suspicion: -1, awareness: -1 } }
    ]
  }),
  movedSeat: s => ({
    location: "Lecture Hall",
    speaker: s.friend,
    text: `${s.friend}'s usual seat beside you is occupied by ${s.heroine}. His backpack has been moved three rows back.\n\n“He said he didn’t mind,” she says.`,
    choices: [
      { text: "Sit beside her.", effects: { affection: 4, dependence: 3 } },
      { text: "Move back beside your friend.", effects: { affection: -3, trust: 1, dependence: -2 } },
      { text: "Ask who moved the backpack.", effects: { suspicion: 3, awareness: 3 } }
    ]
  }),
  vanishedPost: s => ({
    location: "Social Feed",
    speaker: "",
    text: `A classmate posted a joke about you and ${s.heroine} last night. This morning, the post and the account are gone.`,
    choices: [
      { text: "Assume they deleted it.", effects: { suspicion: -1 } },
      { text: "Ask the classmate privately.", effects: { suspicion: 4, awareness: 4 }, flag: "investigating" },
      { text: "Ask her whether she saw it.", effects: { suspicion: 2, awareness: 2 } }
    ]
  }),
  wrongName: s => ({
    location: "Campus Café",
    speaker: s.heroine,
    text: `${s.heroine} calls your professor by his first name, then freezes.\n\nYou never told her who teaches your afternoon seminar.`,
    choices: [
      { text: "Pretend not to notice.", effects: { awareness: 1, suspicion: 2 } },
      { text: "Ask how she knows him.", effects: { awareness: 4, suspicion: 4 } },
      { text: "Make a joke of it.", effects: { affection: 1, suspicion: 1 } }
    ]
  }),
  lockedDoor: s => ({
    location: "Your Apartment Hall",
    speaker: s.heroine,
    text: `Your key sticks in the lock. ${s.heroine} reaches past you and turns it with practiced ease.\n\nFor half a second, neither of you moves.`,
    choices: [
      { text: "Ask whether she has been inside before.", effects: { suspicion: 7, awareness: 6 }, flag: "confronted" },
      { text: "Tell yourself she got lucky.", effects: { suspicion: -1 } },
      { text: "Step between her and the door.", effects: { fear: 2, awareness: 4, dependence: -2 } }
    ]
  })
};

function applyEffects(effects = {}) {
  for (const [k, v] of Object.entries(effects)) {
    state[k] = clamp((state[k] || 0) + v, 0, 100);
  }
  if (state.archetype === "protector") state.morality = clamp(state.morality + 1, 0, 100);
  if (state.archetype === "watcher") state.awareness = clamp(state.awareness + 1, 0, 100);
  if (state.archetype === "abandoned" && effects.affection < 0) state.fear = clamp(state.fear + 2, 0, 100);
  if (state.archetype === "strategist" && state.suspicion > 30) state.awareness = clamp(state.awareness + 2, 0, 100);
}

function renderEvent() {
  if (state.sceneIndex >= state.deck.length || state.day > 7) {
    finishRun();
    return;
  }
  const key = state.deck[state.sceneIndex];
  const evt = events[key](state);

  el.day.textContent = `Day ${state.day}`;
  el.location.textContent = evt.location || rand(locations);
  el.speaker.textContent = evt.speaker || "";
  el.text.textContent = evt.text;
  el.portrait.textContent = evt.speaker === state.heroine ? state.heroine[0] : (evt.speaker ? evt.speaker[0] : "•");

  const palettes = [
    ["#513445", "#17131b"], ["#3b354f", "#16131a"], ["#4c3f37", "#17131b"], ["#30414b", "#15141a"]
  ];
  const p = palettes[(state.day + state.sceneIndex) % palettes.length];
  el.sceneArt.style.background = `radial-gradient(circle at 50% 30%, rgba(230,163,189,.25), transparent 28%), linear-gradient(145deg, ${p[0]}, ${p[1]} 68%)`;

  el.choices.innerHTML = "";
  evt.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = choice.text;
    btn.addEventListener("click", () => choose(choice, key, idx));
    el.choices.appendChild(btn);
  });
}

function choose(choice, key, idx) {
  applyEffects(choice.effects);
  if (choice.flag) state.flags[choice.flag] = true;
  state.history.push({ day: state.day, event: key, choice: idx });
  state.sceneIndex += 1;
  state.day += 1;
  autoSave();
  renderEvent();
}

function finishRun() {
  const s = state;
  let title, text;

  if (s.suspicion >= 40 && s.awareness >= 35 && s.trust < 30) {
    title = "The Door Between You";
    text = `You leave with enough truth to know that something was wrong, but not enough to know whether ${s.heroine} would have hurt you. Her final message is only four words: “You never really asked.”`;
  } else if (s.affection >= 62 && s.dependence >= 38 && s.suspicion < 28) {
    title = "A World Made Smaller";
    text = `By the end of the week, ${s.heroine} has become the first person you call and the last person you speak to. It feels warm. It feels safe. You do not notice how quiet everyone else has become.`;
  } else if (s.affection >= 58 && s.trust >= 46 && s.morality >= 55) {
    title = "Carefully, Honestly";
    text = `${s.heroine} tells you one truth she was afraid to say aloud. You answer with a boundary, not a rejection. For once, neither of you mistakes fear for love.`;
  } else if (s.suspicion >= 30 && s.affection >= 48) {
    title = "Beautiful Doubt";
    text = `You kiss ${s.heroine} with one question still lodged beneath your ribs. She kisses you back as though she already knows what it is.`;
  } else if (s.fear >= 20 || s.affection < 28) {
    title = "The Last Message";
    text = `You stop answering. ${s.heroine} stops asking. Three nights later, a single message appears: “I hope the silence is what you wanted.”`;
  } else {
    title = "Not Yet";
    text = `The week ends without a confession, an accusation, or an answer. ${s.heroine} smiles when she sees you Monday morning. “I was wondering when you’d come back.”`;
  }

  const lies = Math.max(1, Math.floor((s.awareness + s.suspicion + (s.archetype === "strategist" ? 18 : 0)) / 22));
  const clueCount = Math.min(19, 3 + Math.floor(s.awareness / 6));
  el.endingTitle.textContent = title;
  el.endingText.textContent = text;
  el.endingClues.innerHTML = `
    <strong>Run Fragment</strong><br>
    You noticed ${clueCount} possible clues.<br>
    ${s.heroine} concealed at least ${lies} thing${lies === 1 ? "" : "s"}.<br>
    One person may have misunderstood what they saw.
  `;
  localStorage.removeItem("onlyYouSave");
  showScreen("ending");
}

function autoSave() {
  localStorage.setItem("onlyYouSave", JSON.stringify(state));
  el.continue.classList.remove("hidden");
}
function loadSave() {
  const raw = localStorage.getItem("onlyYouSave");
  if (!raw) return;
  state = JSON.parse(raw);
  showScreen("game");
  renderEvent();
}
function startNew() {
  state = newState();
  showScreen("game");
  renderEvent();
  autoSave();
}

document.getElementById("new-game").onclick = () => showScreen("setup");
document.getElementById("continue-game").onclick = loadSave;
document.getElementById("start-game").onclick = startNew;
document.getElementById("back-title").onclick = () => showScreen("title");
document.getElementById("menu-button").onclick = () => el.modal.classList.remove("hidden");
document.getElementById("close-menu").onclick = () => el.modal.classList.add("hidden");
document.getElementById("save-button").onclick = () => { autoSave(); el.modal.classList.add("hidden"); };
document.getElementById("restart-button").onclick = () => {
  localStorage.removeItem("onlyYouSave");
  el.modal.classList.add("hidden");
  showScreen("setup");
};
document.getElementById("play-again").onclick = () => showScreen("setup");
document.getElementById("ending-title-button").onclick = () => showScreen("title");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
}

if (localStorage.getItem("onlyYouSave")) el.continue.classList.remove("hidden");
