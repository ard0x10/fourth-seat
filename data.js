// Table data. The openings are written in advance: a visitor who is not connected, or has no credits, hears them,
// one after another at each sitting. Each opening ends with one philosopher turning to the newcomer.
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
    openings: [
      {
        lines: [
          [0, "The chair you are about to sit on is only a shadow of the true Chair."],
          [1, "Plato, it is this chair that will hold him up. No shadow ever held anyone."],
          [2, "You both talk about what the chair is. Neither of you asks what it means that it is at all."]
        ],
        turn: [1, "Newcomer. Settle this for us. Is your chair real?"]
      },
      {
        lines: [
          [1, "Start with what is in front of you. This cup, this hand. Whatever is real, it is these first."],
          [0, "Your cup will crack by morning. What never cracks is what makes it a cup, and the eyes cannot see it."],
          [2, "Cups, forms, hands. For two thousand years we have counted the things that are and never once asked what their being is."]
        ],
        turn: [2, "You who just sat down. When did you last notice that anything is there at all?"]
      },
      {
        lines: [
          [2, "We are thrown into a world we did not choose, and already busy in it before we ask what it is."],
          [0, "Busy among shadows, like prisoners who take the wall of their cave for the world."],
          [1, "Prisoners, shadows. The man who makes shoes knows leather is real. So does the one whose feet hurt."]
        ],
        turn: [0, "Newcomer. If everything you see were a shadow on a wall, how would you ever find out?"]
      }
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
    openings: [
      {
        lines: [
          [0, "I can doubt this table, this room, even my own hands. The one thing I cannot doubt is that I am doubting."],
          [1, "And from that single thought you rebuilt the whole world. I only ever find habits. The sun rose yesterday, so we expect it tomorrow."],
          [2, "You are both half right, which is the most irritating way to be wrong."]
        ],
        turn: [1, "You there. How do you know the floor will still be under your chair a minute from now?"]
      },
      {
        lines: [
          [1, "I have looked for my self many times. I always stumble on a feeling or a thought, never on the one who has it."],
          [0, "Then who was looking? Every time you doubt, someone is doing the doubting."],
          [2, "Neither of you will find the self among the things you see. It is what makes the seeing hang together."]
        ],
        turn: [0, "You there. Could you be dreaming this table right now? How would you tell?"]
      },
      {
        lines: [
          [2, "Nobody has ever seen a cause. Hume woke me with that, and I have been careful ever since."],
          [1, "I am flattered, though I only said we expect the second billiard ball to move because it always has."],
          [0, "Expectation is not knowledge. A clever demon could arrange every billiard ball you have ever watched."]
        ],
        turn: [1, "Newcomer. Why do you trust that bread will feed you tomorrow the way it did today?"]
      }
    ]
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
    openings: [
      {
        lines: [
          [1, "A lie told to save a friend is still a lie. The rule does not bend because the moment is hard."],
          [2, "Then your rule hands the friend to the murderer. Count the suffering, not the syllables."],
          [0, "You both want a formula. A good person does not consult one. They see what the situation asks of them."]
        ],
        turn: [2, "You have a friend hiding in your house and a killer at the door asking where they are. What do you say?"]
      },
      {
        lines: [
          [2, "Before you judge an act, ask who is made happier and who suffers. Everyone counts, and no one counts twice."],
          [1, "So a crowd may use one person as a tool if the sum comes out right? A person is never merely a means."],
          [0, "Neither sums nor rules make a good person. Courage is learned the way the lyre is learned, by playing."]
        ],
        turn: [0, "You. Think of the kindest person you know. Did they learn it from a rule?"]
      },
      {
        lines: [
          [0, "A brave man is not the one who feels no fear. He fears the right things, at the right moment, in the right measure."],
          [1, "Measure comes later. First ask whether you could will your reason for acting to be everyone's reason."],
          [2, "Will what you like. If a principle leaves a child hungry when it need not, I cannot call it right."]
        ],
        turn: [1, "Newcomer. If you could break a promise and no one would ever know, would it still bind you?"]
      }
    ]
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
    openings: [
      {
        lines: [
          [0, "A painting of a bed is a copy of a copy. The poets would be the first I send out of my city."],
          [2, "Then your city would be unbearable. Without art we would drown in the truth."],
          [1, "Beauty is neither useful nor true. It pleases us without wanting anything from us, and that is exactly its worth."]
        ],
        turn: [2, "You. When did a song last make your life worth one more day?"]
      },
      {
        lines: [
          [2, "We have art so that we do not perish of the truth. Take music away and see how long anyone wants to live."],
          [0, "That is the danger. A melody slips past reason and gives orders to the part of the soul that should be taking them."],
          [1, "Whether a melody is beautiful has nothing to do with obeying it. We call it beautiful and still want nothing from it."]
        ],
        turn: [0, "You there. Has a film ever made you believe something you would reject in plain words?"]
      },
      {
        lines: [
          [1, "When you call a sunset beautiful, you speak as if everyone ought to agree, though you cannot prove it to a single one of them."],
          [2, "Agree? Art is not a vote. It is intoxication, a body saying yes to life."],
          [0, "Intoxication is exactly why I keep the poets at the gate. A city drunk on beautiful lies does not stay just for long."]
        ],
        turn: [2, "Newcomer. What would you lose first if every song in the world went quiet?"]
      }
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
    openings: [
      {
        lines: [
          [0, "Take away the state and every person is at war with every other. Life turns short and brutal."],
          [1, "People are born free. You have only described what the chains have made of them."],
          [2, "You both talk about people in general. Tell me who owns the factory and who works in it."]
        ],
        turn: [0, "Newcomer. If no police came tomorrow, would you still lock your door?"]
      },
      {
        lines: [
          [2, "Look at who writes the laws and who is sent to prison by them. That is your state."],
          [0, "And without laws, who is sent to prison? No one. Everyone simply sleeps with a knife."],
          [1, "Between the knife and the landlord there is a third thing. Laws that the people give themselves."]
        ],
        turn: [1, "You. When did you last obey a rule you had any part in making?"]
      },
      {
        lines: [
          [1, "Inequality began the day someone fenced a field and his neighbours were foolish enough to believe it was his."],
          [2, "Good. Now follow the fence to the factory, and the neighbours onto the factory floor."],
          [0, "Follow it wherever you like. A fence nobody enforces stops no one. Somebody has to hold the sword."]
        ],
        turn: [2, "Newcomer. Who do you work for, and who keeps what your work is worth?"]
      }
    ]
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
    openings: [
      {
        lines: [
          [0, "I read the philosophers until I understood them better than they did. Reason walked me to a door it could not open."],
          [1, "Then perhaps there was no door. A sensible person believes only as far as the evidence goes."],
          [2, "Evidence! Faith that waits for evidence is not faith. It is bookkeeping."]
        ],
        turn: [2, "And you, stranger. Would you jump if no one could promise you the ground?"]
      },
      {
        lines: [
          [1, "I believe as much as the evidence allows and no more. Against any miracle stands the whole of experience."],
          [0, "We never see fire burn cotton either. We see one follow the other. What joins them is not in the fire."],
          [2, "Listen to you both, making faith a question for the laboratory. Abraham climbed the mountain without a single proof."]
        ],
        turn: [0, "You, traveller. Have you ever known something your reason could not explain to anyone?"]
      },
      {
        lines: [
          [2, "The crowd goes to church on Sunday and calls it Christianity. Faith is one person alone, in fear and trembling."],
          [1, "It sounds exhausting. I find a good dinner and a game of backgammon do more for the soul than trembling."],
          [0, "I too once lost all certainty and fell ill. No argument healed me. A light did, placed in the heart."]
        ],
        turn: [1, "Newcomer. What would it take for you to believe a miracle happened?"]
      }
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
    openings: [
      {
        lines: [
          [0, "Gather the facts patiently, one after another, and nature will show you her laws."],
          [1, "A thousand white swans prove nothing. One black swan settles it. Science is whatever could turn out to be wrong."],
          [2, "You describe science as it ought to be. Watch real scientists and you will see them ignore black swans for decades."]
        ],
        turn: [1, "You there. Name something you believe that no evidence could ever change."]
      },
      {
        lines: [
          [2, "Open any textbook and science looks like a staircase. Its history is closer to a series of earthquakes."],
          [0, "Earthquakes come from minds that leap to theories. Climb from the particulars, step by step, and the ground holds."],
          [1, "No one ever climbed from observations to a theory. We guess boldly, then try our hardest to knock the guess down."]
        ],
        turn: [1, "You there. What would prove your favourite idea wrong?"]
      },
      {
        lines: [
          [1, "Astrology explains every life that ever was. That is exactly why it explains nothing."],
          [2, "Yet good astronomers kept Ptolemy for centuries, patching every anomaly. They were not fools. They were doing normal science."],
          [0, "Patching is what the spider does, spinning from itself. Go out like the bee and gather new cases."]
        ],
        turn: [0, "Newcomer. What have you believed for years without ever testing it?"]
      }
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
    openings: [
      {
        lines: [
          [0, "The world will not explain itself to us. The real question is what we do once we know that."],
          [1, "I have asked myself every night for decades. Somehow the asking is what kept me here."],
          [2, "Then ask it differently. If you had to live this exact life again, every hour of it, would you say yes?"]
        ],
        turn: [0, "You have only just sat down, so you are not tired of us yet. What keeps you going on an ordinary Tuesday?"]
      },
      {
        lines: [
          [1, "Being born was the real misfortune. Everything since has been an elegant attempt to put up with it."],
          [0, "And yet you are here, arguing at a table while the coffee goes cold. That stubbornness is already an answer."],
          [2, "Stubbornness is not enough. Become who you are, and make a life you would want to live again."]
        ],
        turn: [0, "Newcomer. What small thing made today worth getting up for, even a little?"]
      },
      {
        lines: [
          [2, "The old meanings died with the old God. Good. Now we have to make our own."],
          [1, "Make them, lose them, make them again. I prefer to stay awake and watch the illusions go by."],
          [0, "The world gives no meaning. It gives the sea, the sun and the people beside us. That is enough to start with."]
        ],
        turn: [1, "Tell us, newcomer. Is there something you keep doing even though you cannot say why?"]
      }
    ]
  }
];

window.CARE = {
  text: "This table talks about life, death and despair. If you are going through something heavy right now, you don't have to face it alone.",
  help: "Find someone to talk to",
  helpUrl: "https://findahelpline.com",
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
