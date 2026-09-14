// Loads and searches the passages of the philosophers at the table away from the page, so building the index
// never stalls the scene. A philosopher whose passages are not ready yet is answered with none.

importScripts("corpus-core.js");

var indexes = {};
var listed = fetch("corpus/manifest.json")
  .then(function (r) { return r.ok ? r.json() : { names: [] }; })
  .then(function (m) { return new Set(m.names); })
  .catch(function () { return new Set(); });

function load(slug) {
  if (indexes[slug]) return;
  indexes[slug] = "loading";
  listed.then(function (names) {
    if (!names.has(slug)) { indexes[slug] = "none"; return; }
    return fetch("corpus/" + slug + ".json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (c) { indexes[slug] = CorpusCore.index(c); });
  }).catch(function () { delete indexes[slug]; });
}

onmessage = function (e) {
  var m = e.data;
  if (m.type === "load") {
    m.slugs.forEach(load);
  } else if (m.type === "search") {
    var ix = indexes[m.slug];
    var ready = ix && typeof ix === "object";
    postMessage({ id: m.id, ready: !!ready, found: ready ? CorpusCore.search(ix, m.words, new Set(m.skip), m.count) : [] });
  }
};
