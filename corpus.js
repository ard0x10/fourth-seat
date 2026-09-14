// The table's passages. Loading starts when the newcomer sits down; a search for a philosopher whose books
// are not loaded yet comes back empty, so a reply never waits for a book.

(function () {
  var worker = null, next = 0, waiting = {};

  function finish(id, found) {
    var done = waiting[id];
    if (!done) return;
    delete waiting[id];
    done(found);
  }

  function start() {
    if (worker !== null) return worker;
    try {
      worker = new Worker("corpus-worker.js");
    } catch (e) {
      worker = false;
      return worker;
    }
    worker.onmessage = function (e) { finish(e.data.id, e.data.found); };
    worker.onerror = function () { Object.keys(waiting).forEach(function (id) { finish(id, []); }); };
    return worker;
  }

  function slug(name) { return name.toLowerCase().replace(/[^a-z]+/g, "-"); }

  function load(table) {
    var w = start();
    if (w) w.postMessage({ type: "load", slugs: table.people.map(function (p) { return slug(p.name); }) });
  }

  // Up to count passages for the words, leaving out the passage numbers in skip.
  function find(person, words, skip, count) {
    var w = start();
    if (!w || !words || !words.length) return Promise.resolve([]);
    return new Promise(function (resolve) {
      var id = ++next;
      waiting[id] = resolve;
      w.postMessage({ type: "search", id: id, slug: slug(person.name), words: words, skip: skip || [], count: count || 3 });
      setTimeout(function () { finish(id, []); }, 2000);
    });
  }

  window.Corpus = { load: load, find: find };
})();
