// Table data. The opening and turn lines are written in advance: a visitor who is not connected, or has no credits, hears them.
// aka: other spellings of a name that count as addressing that philosopher.
// seat: 0 left, 1 middle, 2 right (where the figures sit in the scene image).

window.SEATS = [
  { x: 29.5, y: 35 },
  { x: 51.8, y: 33 },
  { x: 70.0, y: 34 }
];

window.TABLES = [
  {
    id: "being",
    topic: "Being",
    question: "What is real?",
    scene: "assets/tables/being.jpg",
    people: [
      { name: "Plato", aka: ["Platon"], stance: "Only the Forms are truly real.", img: "assets/portraits/plato.jpg" },
      { name: "Aristotle", aka: ["Aristoteles", "Aristote"], stance: "Real things are the ones in front of you.", img: "assets/portraits/aristotle.jpg" },
      { name: "Heidegger", stance: "You forgot to ask what being even means.", img: "assets/portraits/heidegger.jpg" }
    ],
    opening: [
      [0, "The chair you are about to sit on is only a shadow of the true Chair."],
      [1, "Plato, it is this chair that will hold him up. No shadow ever held anyone."],
      [2, "You both talk about what the chair is. Neither of you asks what it means that it is at all."]
    ],
    turn: [1, "Newcomer. Settle this for us. Is your chair real?"]
  },
  {
    id: "knowledge",
    topic: "Knowledge",
    question: "What can we know?",
    scene: "assets/tables/knowledge.jpg",
    people: [
      { name: "Descartes", stance: "Only what reason makes certain.", img: "assets/portraits/descartes.jpg" },
      { name: "Hume", stance: "Only experience, and even that is habit.", img: "assets/portraits/hume.jpg" },
      { name: "Kant", stance: "Both together, within their limits.", img: "assets/portraits/kant.jpg" }
    ],
    opening: [
      [0, "I can doubt this table, this room, even my own hands. The one thing I cannot doubt is that I am doubting."],
      [1, "And from that single thought you rebuilt the whole world. I only ever find habits. The sun rose yesterday, so we expect it tomorrow."],
      [2, "You are both half right, which is the most irritating way to be wrong."]
    ],
    turn: [1, "You there. How do you know the floor will still be under your chair a minute from now?"]
  },
  {
    id: "ethics",
    topic: "Ethics",
    question: "What is the right thing to do?",
    scene: "assets/tables/ethics.jpg",
    people: [
      { name: "Aristotle", aka: ["Aristoteles", "Aristote"], stance: "Whatever a person of good character would do.", img: "assets/portraits/aristotle.jpg" },
      { name: "Kant", stance: "Your duty, whatever the consequences.", img: "assets/portraits/kant.jpg" },
      { name: "Mill", stance: "The most happiness for the most people.", img: "assets/portraits/mill.jpg" }
    ],
    opening: [
      [1, "A lie told to save a friend is still a lie. The rule does not bend because the moment is hard."],
      [2, "Then your rule hands the friend to the murderer. Count the suffering, not the syllables."],
      [0, "You both want a formula. A good person does not consult one. They see what the situation asks of them."]
    ],
    turn: [2, "You have a friend hiding in your house and a killer at the door asking where they are. What do you say?"]
  },
  {
    id: "art",
    topic: "Art",
    question: "What is art for?",
    scene: "assets/tables/art.jpg",
    people: [
      { name: "Plato", aka: ["Platon"], stance: "A copy of a copy, and a dangerous one.", img: "assets/portraits/plato.jpg" },
      { name: "Kant", stance: "A pleasure that wants nothing from us.", img: "assets/portraits/kant.jpg" },
      { name: "Nietzsche", stance: "The thing that makes life bearable.", img: "assets/portraits/nietzsche.jpg" }
    ],
    opening: [
      [0, "A painting of a bed is a copy of a copy. The poets would be the first I send out of my city."],
      [2, "Then your city would be unbearable. Without art we would drown in the truth."],
      [1, "Beauty is neither useful nor true. It pleases us without wanting anything from us, and that is exactly its worth."]
    ],
    turn: [2, "You. When did a song last make your life worth one more day?"]
  },
  {
    id: "politics",
    topic: "Politics",
    question: "Why obey the state?",
    scene: "assets/tables/politics.jpg",
    people: [
      { name: "Hobbes", stance: "Without it, everyone is at war with everyone.", img: "assets/portraits/hobbes.jpg" },
      { name: "Rousseau", stance: "Only when it expresses the general will.", img: "assets/portraits/rousseau.jpg" },
      { name: "Marx", stance: "It is a tool of the ruling class.", img: "assets/portraits/marx.jpg" }
    ],
    opening: [
      [0, "Take away the state and every person is at war with every other. Life turns short and brutal."],
      [1, "People are born free. You have only described what the chains have made of them."],
      [2, "You both talk about people in general. Tell me who owns the factory and who works in it."]
    ],
    turn: [0, "Newcomer. If no police came tomorrow, would you still lock your door?"]
  },
  {
    id: "religion",
    topic: "Religion",
    question: "Can reason reach God?",
    scene: "assets/tables/religion.jpg",
    people: [
      { name: "Al-Ghazali", aka: ["Gazali", "Gazzali"], stance: "The philosophers' reason is not enough.", img: "assets/portraits/ghazali.jpg" },
      { name: "Hume", stance: "There is no good reason to believe in miracles.", img: "assets/portraits/hume.jpg" },
      { name: "Kierkegaard", stance: "Faith begins where reason stops.", img: "assets/portraits/kierkegaard.jpg" }
    ],
    opening: [
      [0, "I read the philosophers until I understood them better than they did. Reason walked me to a door it could not open."],
      [1, "Then perhaps there was no door. A sensible person believes only as far as the evidence goes."],
      [2, "Evidence! Faith that waits for evidence is not faith. It is bookkeeping."]
    ],
    turn: [2, "And you, stranger. Would you jump if no one could promise you the ground?"]
  },
  {
    id: "science",
    topic: "Science",
    question: "What makes science science?",
    scene: "assets/tables/science.jpg",
    people: [
      { name: "Bacon", stance: "Patient observation, case by case.", img: "assets/portraits/bacon.jpg" },
      { name: "Popper", stance: "Being open to proof that it is wrong.", img: "assets/portraits/popper.jpg" },
      { name: "Kuhn", stance: "Paradigms, and the revolutions that end them.", img: "assets/portraits/kuhn.jpg" }
    ],
    opening: [
      [0, "Gather the facts patiently, one after another, and nature will show you her laws."],
      [1, "A thousand white swans prove nothing. One black swan settles it. Science is whatever could turn out to be wrong."],
      [2, "You describe science as it ought to be. Watch real scientists and you will see them ignore black swans for decades."]
    ],
    turn: [1, "You there. Name something you believe that no evidence could ever change."]
  },
  {
    id: "meaning",
    topic: "Meaning",
    question: "Why live in a world without meaning?",
    care: true,
    scene: "assets/tables/meaning.jpg",
    people: [
      { name: "Camus", stance: "By refusing to give in to it.", img: "assets/portraits/camus.jpg" },
      { name: "Cioran", stance: "No good reason, yet saying so is living.", img: "assets/portraits/cioran.jpg" },
      { name: "Nietzsche", stance: "Love your fate. Would you live it again?", img: "assets/portraits/nietzsche.jpg" }
    ],
    opening: [
      [0, "The world will not explain itself to us. The real question is what we do once we know that."],
      [1, "I have asked myself every night for decades. Somehow the asking is what kept me here."],
      [2, "Then ask it differently. If you had to live this exact life again, every hour of it, would you say yes?"]
    ],
    turn: [0, "You have only just sat down, so you are not tired of us yet. What keeps you going on an ordinary Tuesday?"]
  }
];

window.CARE = {
  text: "This table talks about life, death and despair. If you are going through something heavy right now, you don't have to face it alone.",
  help: "Find someone to talk to",
  helpNote: "In the real site this opens a list of helplines by country.",
  go: "Take my seat"
};

window.CONNECT = {
  title: "They want to answer you.",
  body: "Give them a voice: connect a free OpenRouter account.",
  button: "Connect OpenRouter",
  why: "Why?",
  whyText: "The philosophers need something to think with. A free OpenRouter account lends them that. The connection stays between your browser and OpenRouter. This site has no server and sees nothing you write."
};

// Preset models in Settings. The first is free; an account without credits uses it automatically.
// reasoning: effort level to request from models that support it.
window.MODELS = [
  { id: "google/gemma-4-31b-it:free", name: "Gemma 4 31B", note: "Free", free: true },
  { id: "x-ai/grok-4.6", name: "Grok 4.6", note: "Paid", reasoning: "low" }
];
window.DEFAULT_MODEL = "x-ai/grok-4.6";

window.SETTINGS = {
  title: "Settings",
  model: "Model",
  custom: "Custom",
  customNote: "Any model on OpenRouter",
  search: "Search models...",
  none: "Nothing found.",
  loading: "Loading models...",
  loadFailed: "Couldn't load the model list.",
  freeLine: "Using the free model. Add credits to use Grok 4.6.",
  account: "Account",
  connected: "Connected to OpenRouter",
  disconnect: "Disconnect",
  notConnected: "Not connected",
  connect: "Connect OpenRouter",
  connecting: "Connecting...",
  forgotten: "Forgotten on this device. To revoke the key itself, ",
  revoke: "delete it in OpenRouter",
  done: "Done"
};

window.OPENROUTER = {
  api: "https://openrouter.ai/api/v1",
  auth: "https://openrouter.ai/auth",
  keysPage: "https://openrouter.ai/settings/keys",
  title: "Fourth Seat"
};

// How long a line stays on screen: scales with its length, clamped at both ends.
window.readTime = function (text) {
  return Math.min(6500, Math.max(2200, text.length * 52));
};

window.reducedMotion = function () {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Portrait avatar. A philosopher without a portrait shows their initial.
window.avatar = function (person) {
  var el = document.createElement("div");
  el.className = "av";
  if (person && person.img) {
    el.style.backgroundImage = "url(" + person.img + ")";
  } else {
    el.classList.add("mono");
    el.textContent = person ? person.name.charAt(0) : "";
  }
  return el;
};
