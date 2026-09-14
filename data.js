// Table data. Every line here is pre-written; nothing calls a model yet.
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
      { name: "Plato", stance: "Only the Forms are truly real.", img: "assets/portraits/plato.jpg" },
      { name: "Aristotle", stance: "Real things are the ones in front of you.", img: "assets/portraits/aristotle.jpg" },
      { name: "Heidegger", stance: "You forgot to ask what being even means.", img: "assets/portraits/heidegger.jpg" }
    ],
    opening: [
      [0, "The chair you are about to sit on is only a shadow of the true Chair."],
      [1, "Plato, it is this chair that will hold him up. No shadow ever held anyone."],
      [2, "You both talk about what the chair is. Neither of you asks what it means that it is at all."]
    ],
    turn: [1, "Newcomer. Settle this for us. Is your chair real?"],
    reply: [
      [1, "You answered like someone who has actually sat down. Good. Now tell me what would be left of the chair if the wood were gone."],
      [0, "Nothing you could touch, and yet you would still know what a chair is. Ask yourself where that knowledge lives."]
    ],
    carry: [
      [2, "Look at them. Two thousand years, and still arguing over the furniture."],
      [0, "And you would rather argue over a single word."]
    ]
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
    turn: [1, "You there. How do you know the floor will still be under your chair a minute from now?"],
    reply: [
      [1, "You trust it because it has always been there. That is not knowledge, my friend. That is custom, and custom is a very good servant."],
      [2, "Yet you could not even expect it without a mind that orders experience in time. Something in you arrives before the evidence does."]
    ],
    carry: [
      [0, "Then let us find what arrives first, and build on it."],
      [1, "He wants foundations. I would settle for breakfast."]
    ]
  },
  {
    id: "ethics",
    topic: "Ethics",
    question: "What is the right thing to do?",
    scene: "assets/tables/ethics.jpg",
    people: [
      { name: "Aristotle", stance: "Whatever a person of good character would do.", img: "assets/portraits/aristotle.jpg" },
      { name: "Kant", stance: "Your duty, whatever the consequences.", img: "assets/portraits/kant.jpg" },
      { name: "Mill", stance: "The most happiness for the most people.", img: "assets/portraits/mill.jpg" }
    ],
    opening: [
      [1, "A lie told to save a friend is still a lie. The rule does not bend because the moment is hard."],
      [2, "Then your rule hands the friend to the murderer. Count the suffering, not the syllables."],
      [0, "You both want a formula. A good person does not consult one. They see what the situation asks of them."]
    ],
    turn: [2, "You have a friend hiding in your house and a killer at the door asking where they are. What do you say?"],
    reply: [
      [2, "Notice that you weighed the outcomes before you weighed the words. Most people do, whatever they claim in a classroom."],
      [1, "And notice how quickly a good reason becomes a permission. Tomorrow the reason will be smaller."]
    ],
    carry: [
      [0, "Neither of you would recognise a wise person if one sat down at this table."],
      [2, "One just did. We are testing them."]
    ]
  },
  {
    id: "art",
    topic: "Art",
    question: "What is art for?",
    scene: "assets/tables/art.jpg",
    people: [
      { name: "Plato", stance: "A copy of a copy, and a dangerous one.", img: "assets/portraits/plato.jpg" },
      { name: "Kant", stance: "A pleasure that wants nothing from us.", img: "assets/portraits/kant.jpg" },
      { name: "Nietzsche", stance: "The thing that makes life bearable.", img: "assets/portraits/nietzsche.jpg" }
    ],
    opening: [
      [0, "A painting of a bed is a copy of a copy. The poets would be the first I send out of my city."],
      [2, "Then your city would be unbearable. Without art we would drown in the truth."],
      [1, "Beauty is neither useful nor true. It pleases us without wanting anything from us, and that is exactly its worth."]
    ],
    turn: [2, "You. When did a song last make your life worth one more day?"],
    reply: [
      [2, "There. You did not describe it, you lived it again while you wrote. That is what Plato is afraid of."],
      [0, "I am afraid of it because it works. A feeling that strong carries a lie as easily as a truth."]
    ],
    carry: [
      [1, "Can we at least agree that liking something is not the same as it being good?"],
      [2, "No."]
    ]
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
    turn: [0, "Newcomer. If no police came tomorrow, would you still lock your door?"],
    reply: [
      [0, "You would. Everyone would. That lock is my whole argument."],
      [1, "Or the lock is what a society of strangers taught you. In a village where everyone is known, doors stay open."]
    ],
    carry: [
      [2, "And who made the lock, and who was paid for making it?"],
      [0, "There he goes again."]
    ]
  },
  {
    id: "religion",
    topic: "Religion",
    question: "Can reason reach God?",
    scene: "assets/tables/religion.jpg",
    people: [
      { name: "Al-Ghazali", stance: "The philosophers' reason is not enough.", img: "assets/portraits/ghazali.jpg" },
      { name: "Hume", stance: "There is no good reason to believe in miracles.", img: "assets/portraits/hume.jpg" },
      { name: "Kierkegaard", stance: "Faith begins where reason stops.", img: "assets/portraits/kierkegaard.jpg" }
    ],
    opening: [
      [0, "I read the philosophers until I understood them better than they did. Reason walked me to a door it could not open."],
      [1, "Then perhaps there was no door. A sensible person believes only as far as the evidence goes."],
      [2, "Evidence! Faith that waits for evidence is not faith. It is bookkeeping."]
    ],
    turn: [2, "And you, stranger. Would you jump if no one could promise you the ground?"],
    reply: [
      [2, "You hesitated. Good. Anyone who does not hesitate has not understood the question."],
      [0, "Hesitation is where I began too. It lasted months, and it did not end in an argument."]
    ],
    carry: [
      [1, "It ended in a feeling, which is exactly my point."],
      [2, "A feeling is not the smallest thing a person can have."]
    ]
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
    turn: [1, "You there. Name something you believe that no evidence could ever change."],
    reply: [
      [1, "Then you have found the place where you stop doing science. Everyone has one. The honest ones know where it is."],
      [2, "Or you have found your paradigm. Without a place like that nobody could do science at all."]
    ],
    carry: [
      [0, "In my day we simply went outside and looked."],
      [1, "Looked at what? You needed a question first."]
    ]
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
    turn: [0, "You have only just sat down, so you are not tired of us yet. What keeps you going on an ordinary Tuesday?"],
    reply: [
      [0, "Small things, then. People underestimate them. Carrying on through an ordinary Tuesday is already a kind of revolt."],
      [2, "Not carrying on. Loving it. There is a difference, and it matters."]
    ],
    carry: [
      [1, "You two make it sound so energetic. Some of us simply stay, and call it clarity."],
      [0, "Staying is enough."]
    ]
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
