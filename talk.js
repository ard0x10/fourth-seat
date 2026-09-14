// The conversation engine: who speaks, what each philosopher is told, and what reaches the screen.
// Every philosopher is a separate call with their own instructions, so one model never plays the whole table.
// A log entry is { seat, text } for a philosopher and { you: true, text } for the newcomer.

(function () {
  var MAX_WORDS = 70;
  var HISTORY = 24;
  var cache = {};

  function json(path) {
    if (!cache[path]) {
      cache[path] = fetch(path).then(function (r) {
        if (!r.ok) throw new Error("Could not load " + path + ": " + r.status);
        return r.json();
      });
      cache[path].catch(function () { delete cache[path]; });
    }
    return cache[path];
  }

  function slug(name) { return name.toLowerCase().replace(/[^a-z]+/g, "-"); }

  function record(person) { return json("philosophers/" + slug(person.name) + ".json"); }

  // Every way a name can be written in a message: the full name, its last part (Ghazali), and the table's own spellings.
  function spellings(person) {
    var parts = person.name.split(/[\s-]+/);
    return [person.name, parts[parts.length - 1]].concat(person.aka || []);
  }

  function escape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  // Seats whose names appear in the text, in the order they first appear.
  function mentioned(table, text) {
    var found = [];
    table.people.forEach(function (p, seat) {
      var at = -1;
      spellings(p).forEach(function (s) {
        var m = new RegExp("(^|[^\\p{L}])" + escape(s) + "(?![\\p{L}])", "iu").exec(text);
        if (m && (at < 0 || m.index < at)) at = m.index;
      });
      if (at >= 0) found.push({ seat: seat, at: at });
    });
    return found.sort(function (a, b) { return a.at - b.at; }).map(function (f) { return f.seat; });
  }

  function speaker(table, entry) { return entry.you ? "The newcomer" : table.people[entry.seat].name; }

  function transcript(table, log) {
    return log.slice(-HISTORY).map(function (e) { return speaker(table, e) + ": " + e.text; }).join("\n");
  }

  function list(title, lines) {
    return lines && lines.length ? title + "\n" + lines.map(function (l) { return "- " + l; }).join("\n") : "";
  }

  function instructions(table, seat, rec, rules) {
    var name = table.people[seat].name;
    var pos = (rec.positions || {})[table.id] || {};
    var rel = (rec.relations || {})[table.id] || {};
    var others = table.people.filter(function (p, i) { return i !== seat; }).map(function (p) {
      return rel[p.name] ? p.name + ": " + rel[p.name] : p.name;
    });
    return [
      "You are " + name + " (" + rec.years + "). " + rec.who,
      list("How you speak:", rec.voice),
      "Your usual length: " + rec.length + ".",
      list("What you tend to do:", rec.moves),
      list("What you never do:", rec.neverDoes),
      list("What you think:", rec.ideas),
      "The question at this table: " + table.question +
        (pos.answer ? "\nYour answer: " + pos.answer : "") +
        (pos.concedes ? "\nWhat you grant: " + pos.concedes : "") +
        (pos.refuses ? "\nWhat you refuse: " + pos.refuses : ""),
      list("Also at the table, besides a newcomer in the fourth seat:", others),
      list("Rules:", rules.map(function (r) { return r.split("{name}").join(name); }))
    ].filter(Boolean).join("\n\n");
  }

  function task(table, seat, log, kind) {
    var name = table.people[seat].name;
    var wrote = log.some(function (e) { return e.you; });
    var ask;
    if (kind === "open") {
      ask = "A newcomer is walking up to the table and has not sat down yet. Open the conversation on the table's question, speaking to the other two.";
    } else if (kind === "turn") {
      ask = "The newcomer has just sat down. Turn to them and ask one short, direct question that pulls them into the argument.";
    } else {
      ask = "Speak now. Answer " + speaker(table, log[log.length - 1]) + " directly.";
    }
    return [
      log.length ? "The conversation at the table so far:\n\n" + transcript(table, log) : "",
      ask,
      wrote ? "Speak in the language of the newcomer's last message." : "Speak English.",
      "Do not repeat a point you have already made at this table. Reply with only the words " + name + " says, with no name in front."
    ].filter(Boolean).join("\n\n");
  }

  // Quote marks decide which sentences are dropped. An apostrophe inside a word (don't, Kant's) is not a quote,
  // and neither is a closing one after a plural (the philosophers' reason).
  function quoteMarks(sentence, state) {
    var hit = false;
    for (var i = 0; i < sentence.length; i++) {
      var c = sentence[i], prev = sentence[i - 1] || " ", nxt = sentence[i + 1] || " ";
      if ("„«「『‹".indexOf(c) >= 0) { state.double = true; hit = true; }
      else if ("»」』›”".indexOf(c) >= 0) { state.double = false; hit = true; }
      else if (c === "\"" || c === "“") { state.double = !state.double; hit = true; }
      else if (c === "‘") { state.single = true; hit = true; }
      else if (c === "'" && /[\s(]/.test(prev) && /\p{L}/u.test(nxt)) { state.single = true; hit = true; }
      else if ((c === "'" || c === "’") && state.single && !/\p{L}/u.test(nxt)) { state.single = false; hit = true; }
    }
    return hit;
  }

  // What reaches the screen: no name label, no stage directions, no sentence that opens or sits inside a quote,
  // and no more than about 70 words, cut at the end of a sentence.
  function clean(text, table) {
    var s = String(text || "").trim();
    var names = table.people.map(function (p) { return escape(p.name); }).join("|");
    s = s.replace(new RegExp("^[*_\\s]*(" + names + ")[*_\\s]*:[*_\\s]*", "i"), "");
    s = s.replace(/\*[^*\n]*\*/g, " ").replace(/\[[^\]\n]*\]/g, " ").replace(/[*_]{2,}/g, "");
    // A whole reply wrapped in one pair of quotes is formatting, not a quotation.
    var wrapped = /^["“]([^"“”]*)["”]$/.exec(s);
    if (wrapped) s = wrapped[1];
    s = s.replace(/\s+/g, " ").trim();

    var sentences = s.match(/[^.!?…。！？]+(?:[.!?…。！？]+["'”’»」』)]*|$)\s*/g) || [];
    var state = { double: false, single: false }, kept = [], words = 0;
    sentences.forEach(function (sentence) {
      var inside = state.double || state.single;
      if (quoteMarks(sentence, state) || inside) return;
      var n = sentence.split(/\s+/).filter(Boolean).length;
      if (kept.length && words + n > MAX_WORDS) { words = Infinity; return; }
      if (words === Infinity) return;
      kept.push(sentence.trim()); words += n;
    });
    return kept.join(" ").trim();
  }

  // One philosopher's line. The log is copied at once, so later lines do not leak into this call.
  // A reply that is empty after cleaning is asked for once more; after that the philosopher stays silent.
  async function line(table, seat, log, kind, complete, signal) {
    var seen = log.slice();
    var loaded = await Promise.all([record(table.people[seat]), json("philosophers/common-rules.json")]);
    var messages = [
      { role: "system", content: instructions(table, seat, loaded[0], loaded[1].rules) },
      { role: "user", content: task(table, seat, seen, kind) }
    ];
    for (var attempt = 0; attempt < 2; attempt++) {
      var text = clean(await complete(messages, signal), table);
      if (text) return text;
    }
    return "";
  }

  // Who answers the newcomer: anyone named in the message, otherwise a short call picks one or two.
  async function pick(table, log, complete, signal) {
    var last = log[log.length - 1];
    var named = mentioned(table, last.text).slice(0, 2);
    if (named.length) return named;

    var people = table.people.map(function (p) { return p.name; });
    var reply = await complete([
      { role: "system", content: "You choose who speaks next at a table of philosophers. Reply with one or two names and nothing else." },
      { role: "user", content: [
        "The question at the table: " + table.question,
        "At the table:\n" + table.people.map(function (p) { return "- " + p.name + ": " + p.stance; }).join("\n"),
        "The conversation so far:\n\n" + transcript(table, log),
        "Who should answer the newcomer's last message? Put first the one it concerns most. Add a second name only if that person would clearly want to answer the first. Use only these names: " + people.join(", ") + "."
      ].join("\n\n") }
    ], signal);
    var chosen = mentioned(table, reply).slice(0, 2);
    if (chosen.length) return chosen;
    // An unreadable answer falls back to the last philosopher who spoke, who is usually the one the newcomer answered.
    for (var i = log.length - 1; i >= 0; i--) if (!log[i].you) return [log[i].seat];
    return [0];
  }

  // You carry on: the two who have been silent longest speak, the quieter one first.
  function quiet(table, log) {
    var lastSpoke = table.people.map(function (p, seat) {
      for (var i = log.length - 1; i >= 0; i--) if (!log[i].you && log[i].seat === seat) return i;
      return -1;
    });
    return [0, 1, 2].sort(function (a, b) { return lastSpoke[a] - lastSpoke[b]; }).slice(0, 2);
  }

  window.Talk = { line: line, pick: pick, quiet: quiet, clean: clean };
})();
