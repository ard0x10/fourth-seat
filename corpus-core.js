// Search over one philosopher's passages. Plain word matching (BM25) with a light English stemmer:
// no model and no server, and the search words come already in English from the call that picks the speakers.
// Shared by corpus-worker.js in the browser and by scripts that measure the search.

(function (root) {
  var K1 = 1.2, B = 0.75;

  var STOP = new Set(("a about above after again against all am an and any are as at be because been before being below " +
    "between both but by can could did do does doing down during each few for from further had has have having he her " +
    "here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of " +
    "off on once only or other our ours ourselves out over own same she should so some such than that the their theirs " +
    "them themselves then there these they this those through thus to too under until up upon very was we were what " +
    "when where which while who whom why will with would you your yours yourself yourselves thee thou thy thine hath " +
    "doth shall may might must let also even yet one ones").split(" "));

  // Folds the common endings so "virtues", "virtuous" and "virtue" meet; it does not need to be a real stemmer,
  // only the same on both sides.
  function stem(w) {
    if (w.length > 5) w = w.replace(/(ational|ations|ation|ities|ity|ness|ments|ment|ingly|ings|ing|edly|ies|ied|ous|ive|ize|ise|ful|less|ly|ed|es)$/, "");
    if (w.length > 3) w = w.replace(/s$/, "");
    return w;
  }

  function terms(text) {
    var out = [];
    String(text).toLowerCase().replace(/[a-z]+/g, function (w) {
      if (w.length > 2 && !STOP.has(w)) out.push(stem(w));
      return w;
    });
    return out;
  }

  function index(corpus) {
    var docs = [], df = new Map(), total = 0;
    corpus.passages.forEach(function (p) {
      var tf = new Map(), ts = terms(p.t);
      ts.forEach(function (t) { tf.set(t, (tf.get(t) || 0) + 1); });
      tf.forEach(function (_, t) { df.set(t, (df.get(t) || 0) + 1); });
      docs.push({ tf: tf, len: ts.length });
      total += ts.length;
    });
    return { corpus: corpus, docs: docs, df: df, avg: total / Math.max(1, docs.length) };
  }

  // The best passages for the words, skipping the ones already given. Each result is { i, work, text }.
  function search(ix, words, skip, count) {
    var query = Array.from(new Set(terms(words.join(" "))));
    if (!query.length) return [];
    var n = ix.docs.length, scored = [];
    var idf = query.map(function (t) {
      var d = ix.df.get(t) || 0;
      return Math.log(1 + (n - d + 0.5) / (d + 0.5));
    });
    ix.docs.forEach(function (doc, i) {
      if (skip && skip.has(i)) return;
      var s = 0;
      query.forEach(function (t, q) {
        var f = doc.tf.get(t);
        if (f) s += idf[q] * f * (K1 + 1) / (f + K1 * (1 - B + B * doc.len / ix.avg));
      });
      if (s > 0) scored.push([s, i]);
    });
    scored.sort(function (a, b) { return b[0] - a[0]; });
    return scored.slice(0, count).map(function (x) {
      var p = ix.corpus.passages[x[1]];
      return { i: x[1], work: ix.corpus.works[p.w], text: p.t };
    });
  }

  var api = { terms: terms, index: index, search: search };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CorpusCore = api;
})(this);
