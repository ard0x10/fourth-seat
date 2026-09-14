"""Build corpus/<philosopher>.json from the public domain copies named in philosophers/*.json.

Each source's copy says where the text comes from and which parts of it belong to the author:
  site       gutenberg, wikisource, or archive (a scan read with a transcription, see scan.py)
  keep       list of [first line, line after the last] anchors; see keep_ranges for how they match.
  pages      (Wikisource) page titles in reading order; "Title/*" stands for the pages its contents link to.
  skipPages  (Wikisource) pages to leave out of a "/*" list.
  leaves     (archive) first and last scan leaf; reference is the transcription to read the scan with.
  numbered   the transcription puts a number before each paragraph that the edition does not print.
  cuts       list of [first words, last words] pairs: text the transcription carries that the edition does not
             print (a passage translated later, an editor's note), removed from its first words to its last.
  fixes      list of [transcription, edition] pairs: words where the transcription differs from the printed
             edition, read from its page images.
  Cuts and fixes each must match exactly once; spaces in them match any whitespace.
  opens, closes  words the work itself begins and ends with, checked against the result.
Everything outside the kept ranges is dropped, then notes, page and line numbers and sidenotes are
removed and the text is cut into passages of about 200 words.

Downloads are cached in scripts/.cache, which is not part of the repository.
"""

import argparse
import datetime
import gzip
import html
import html.parser
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

import scan

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "scripts", ".cache")
OUT = os.path.join(ROOT, "corpus")
AGENT = {"User-Agent": "fourth-seat corpus builder (https://github.com/ard0x10/fourth-seat)"}

TARGET_WORDS = 200
MAX_WORDS = 320

# Text that may never reach a passage. Each is also counted in the raw download, so a zero means
# the cleaning removed it and not that the pattern cannot match.
FORBIDDEN = {
    "gutenberg": r"gutenberg",
    "transcriber": r"transcriber",
    "footnote": r"foot-?note",
    "sidenote": r"sidenote",
    "note marker": r"\[\s*\d+\s*\]|\{\s*\d+\s*\}",
    "stephanus": r"steph\.",
    "web address": r"https?://|www\.",
    "wiki": r"wikisource|wikipedia",
}


def fetch_bytes(url, name):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name)
    if not os.path.exists(path):
        with urllib.request.urlopen(urllib.request.Request(url, headers=AGENT), timeout=300) as r:
            data = r.read()
        with open(path + ".part", "wb") as f:
            f.write(data)
        os.replace(path + ".part", path)
        time.sleep(1)
    with open(path, "rb") as f:
        return f.read()


def fetch(url, name):
    return fetch_bytes(url, name).decode("utf-8", "replace")


# Gutenberg ----------------------------------------------------------------------------------------

def gutenberg(copy):
    pid = copy["id"]
    raw = fetch("https://www.gutenberg.org/cache/epub/%d/pg%d.txt" % (pid, pid), "pg%d.txt" % pid)
    raw = raw.replace("\r\n", "\n")
    start = re.search(r"^\*\*\* ?START OF[^\n]*\n", raw, re.M)
    end = re.search(r"^\*\*\* ?END OF", raw, re.M)
    if not start or not end:
        raise ValueError("gutenberg %d: license markers not found" % pid)
    return raw, raw[start.end():end.start()]


# Wikisource ---------------------------------------------------------------------------------------

def wikisource_api(params, name):
    params = dict(params, format="json", formatversion=2)
    url = "https://en.wikisource.org/w/api.php?" + urllib.parse.urlencode(params)
    return json.loads(fetch(url, name))


def cache_name(prefix, title):
    return prefix + re.sub(r"[^A-Za-z0-9]+", "_", title)[:150] + ".json"


class WikiText(html.parser.HTMLParser):
    """Rendered Wikisource page to plain text. Headers, navigation, page numbers and notes are skipped."""

    SKIP_CLASSES = ("wst-header", "ws-noexport", "pagenum", "ws-pagenum", "reference", "references", "reflist",
                    "mw-editsection", "noprint", "wst-footer", "licenseContainer", "mw-references-wrap",
                    "sisitem", "wst-rule", "wst-sidenote")
    BLOCKS = {"p", "div", "br", "h1", "h2", "h3", "h4", "h5", "h6", "li", "tr", "dd", "dt", "blockquote", "center"}
    VOID = {"br", "img", "hr", "meta", "link", "input", "wbr", "col", "area", "base", "source"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts = []
        self.stack = []
        self.skipping = 0
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = (attrs.get("class") or "").split()
        skip = (any(c in self.SKIP_CLASSES or c.startswith("wst-header") for c in classes)
                or attrs.get("id") in ("headertemplate", "footertemplate")
                or tag in ("style", "script", "sup") and ("reference" in classes or tag != "sup"))
        if tag in self.BLOCKS:
            self.parts.append("\n\n" if tag != "br" else "\n")
        if tag in self.VOID:
            return
        self.stack.append((tag, skip))
        if skip:
            self.skipping += 1
        if tag == "a" and not self.skipping and (attrs.get("href") or "").startswith("/wiki/"):
            self.links.append(urllib.parse.unquote(attrs["href"][6:].split("#")[0]).replace("_", " "))

    def handle_endtag(self, tag):
        # <br/> arrives here too; popping for a tag that was never pushed would end a skipped block early.
        if tag in self.VOID or all(t != tag for t, _ in self.stack):
            return
        while self.stack:
            t, skip = self.stack.pop()
            if skip:
                self.skipping -= 1
            if t == tag:
                break
        if tag in self.BLOCKS:
            self.parts.append("\n\n")

    def handle_data(self, data):
        if not self.skipping:
            self.parts.append(data)

    def text(self):
        s = "".join(self.parts).replace("\u00a0", " ")
        s = re.sub(r"[ \t]+", " ", s)
        s = re.sub(r" *\n *", "\n", s)
        return re.sub(r"\n{3,}", "\n\n", s).strip()


def wikisource_page(title):
    d = wikisource_api({"action": "parse", "page": title, "prop": "text", "redirects": 1}, cache_name("ws_", title))
    if "error" in d:
        raise ValueError("wikisource %s: %s" % (title, d["error"]["info"]))
    parser = WikiText()
    parser.feed(d["parse"]["text"])
    own = d["parse"]["title"] + "/"
    subpages = []
    for link in parser.links:
        if link.startswith(own) and link not in subpages:
            subpages.append(link)
    return d["parse"]["text"], parser.text(), subpages


def wikisource(copy):
    """Pages in the order given. "Title/*" stands for the subpages that page's own table of contents links to."""
    skip = set(copy.get("skipPages", []))
    titles = []
    for title in copy["pages"]:
        if title.endswith("/*"):
            titles.extend(wikisource_page(title[:-2])[2])
        else:
            titles.append(title)
    raw, chunks = [], []
    for title in titles:
        if title in skip:
            continue
        rendered, text, _ = wikisource_page(title)
        raw.append(rendered)
        chunks.append(text)
    unused = skip - set(titles)
    if unused:
        raise ValueError("skipPages not in the page list: %s" % sorted(unused))
    return "\n".join(raw), "\n\n".join(chunks)


# Marxists Internet Archive ------------------------------------------------------------------------

def marxists(copy):
    """Chapter pages in the order given, body paragraphs only: the notes section and note markers are left out.
    Used only as a transcription to read a scan with, never as a copy of its own."""
    raw, chunks = [], []
    for url in copy["pages"]:
        page = fetch(url, "mx_" + re.sub(r"[^A-Za-z0-9]+", "_", url.split("/works/")[-1]))
        raw.append(page)
        notes = re.search(r"<h[34][^>]*>\s*(Footnotes|Notes)", page, re.I)
        page = page[:notes.start()] if notes else page
        page = re.sub(r'<sup class="enote">.*?</sup>', "", page, flags=re.S)
        page = re.sub(r'<p class="(toc|index|title|information|info|footer)".*?</p>', "", page, flags=re.S)
        for block in re.findall(r"<(?:p|h3|h4|blockquote)[^>]*>(.*?)</(?:p|h3|h4|blockquote)>", page, re.S):
            text = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", block))).strip()
            if text:
                chunks.append(text)
    return "\n".join(raw), "\n\n".join(chunks)


# Cleaning -----------------------------------------------------------------------------------------

def keep_ranges(body, keep, label):
    if not keep:
        return body
    lines = body.split("\n")
    stripped = [l.strip() for l in lines]
    out, at = [], 0

    def find(anchor, start):
        # "A >> B" finds B after A, which skips a heading that also appears in a table of contents.
        # An anchor ending in "..." matches the start of a line; any other anchor matches the whole line.
        for step in anchor.split(" >> "):
            prefix = step.endswith("...")
            step = step[:-3] if prefix else step
            hit = next((i for i in range(start, len(lines))
                        if (stripped[i].startswith(step) if prefix else stripped[i] == step)), None)
            if hit is None:
                raise ValueError("%s: anchor not found after line %d: %r" % (label, start, step))
            start = hit + 1
        return hit

    for first, after in keep:
        a = find(first, at)
        b = find(after, a + 1) if after is not None else len(lines)
        out.append("\n".join(lines[a:b]))
        at = b
    return "\n\n".join(out)


def bracket_blocks(text, opener):
    """Remove [Opener ...] blocks, which can span lines and contain nested brackets."""
    out, i = [], 0
    pattern = re.compile(r"\[" + opener, re.I)
    while True:
        m = pattern.search(text, i)
        if not m:
            out.append(text[i:])
            break
        out.append(text[i:m.start()])
        depth, j = 0, m.start()
        while j < len(text):
            if text[j] == "[":
                depth += 1
            elif text[j] == "]":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        # A transliterated Greek word can carry a stray bracket, and then the count runs on through the book.
        # Real notes are short, so a block that long ends instead at the first bracket closing a line.
        if j - m.start() > 3000:
            eol = re.compile(r"\][ \t]*(?=\n|$)").search(text, m.start())
            j = eol.start() if eol else m.end()
        i = j + 1
    return "".join(out)


def clean(text):
    text = bracket_blocks(text, r"\s*sidenote")
    text = bracket_blocks(text, r"\s*footnote")
    text = bracket_blocks(text, r"\s*illustration")
    text = bracket_blocks(text, r"\s*pg\s*\d")
    text = re.sub(r"\*Ed\. Steph\. \d+[a-e]?\*|\*\d+[A-E]?\*", " ", text)
    text = re.sub(r"=?Steph\.=?\s*\d+[a-e]?", " ", text)
    text = re.sub(r"\[(?:Bekker )?\d{3,4}[ab]\]|\bEd\. (?=[a-z])", "", text)
    # Where a transcriber could not set Greek letters, a placeholder stands in for the word.
    text = re.sub(r" ?\(Greek\)", "", text)
    # Structure tags some Gutenberg files leave in the text ({BOOK_1|CHAPTER_2 ^paragraph).
    text = re.sub(r"\{[A-Z0-9_|]+ \^[a-z]+\}?", "", text)
    # A paragraph that is one bracketed remark is the editor speaking ([This essay was not finished]).
    text = re.sub(r"(^|\n\s*\n)\s*\[[^\[\]]*\]\s*(?=\n\s*\n|$)", r"\1", text)
    text = re.sub(r"\[\s*\d+\s*\]|\{\s*\d+\s*\}|\[[a-z]\]", "", text)
    # Line numbers set in the margin: a run of spaces and a number at the end of a line.
    text = re.sub(r"[ \t]{3,}\d{1,4}[ \t]*$", "", text, flags=re.M)
    text = re.sub(r"(?<!\w)[_=](?=\S)|(?<=\S)[_=](?!\w)", "", text)
    return text


def paragraphs(text):
    out = []
    for block in re.split(r"\n\s*\n", text):
        p = re.sub(r"\s+", " ", block).strip()
        if not p:
            continue
        # Headings, tables of contents and lone numbers carry nothing a philosopher would say.
        words = p.split()
        if len(words) < 4 and not re.search(r"[.!?]$", p):
            continue
        # Navigation rows such as 1 - 2 - 3 are mostly numbers and dashes.
        if sum(1 for w in words if re.search(r"[A-Za-z]", w)) * 2 < len(words):
            continue
        out.append(p)
    return out


def sentences(p):
    return re.findall(r"[^.!?]+(?:[.!?]+[\"'’”)]*|$)\s*", p)


def passages(paras):
    out, current, n = [], [], 0

    def flush():
        nonlocal current, n
        if current:
            out.append(" ".join(current))
        current, n = [], 0

    for p in paras:
        w = len(p.split())
        if w > MAX_WORDS:
            flush()
            for s in sentences(p):
                sw = len(s.split())
                if n and n + sw > TARGET_WORDS:
                    flush()
                current.append(s.strip())
                n += sw
            flush()
            continue
        if n and n + w > MAX_WORDS:
            flush()
        current.append(p)
        n += w
        if n >= TARGET_WORDS:
            flush()
    flush()
    return out


# Rights -------------------------------------------------------------------------------------------

def rights(source, year):
    """The rule from the records: printed at least 96 years ago, every translator dead at least 81 years."""
    problems = []
    if source.get("published") is None or source["published"] > year - 96:
        problems.append("published %s, needs %d or earlier" % (source.get("published"), year - 96))
    for t in source.get("translators", []):
        if t.get("died") is None or t["died"] > year - 81:
            problems.append("%s died %s, needs %d or earlier" % (t["name"], t.get("died"), year - 81))
    return problems


# Build --------------------------------------------------------------------------------------------

def slug(name):
    return re.sub(r"[^a-z]+", "-", name.lower())


def edition_fixes(body, copy, label):
    # A fix can join two paragraphs the transcription split, so spaces stand for any whitespace.
    words = lambda s: r"\s+".join(map(re.escape, s.split()))

    def once(pattern, new, what):
        hits = len(pattern.findall(body))
        if hits != 1:
            raise ValueError("%s: %s found %d times, needs exactly once" % (label, what, hits))
        return pattern.sub(lambda m: new, body)

    if copy.get("numbered"):
        body = re.sub(r"^([ \t]*)\d{1,3}\.[ \t]+", r"\1", body, flags=re.M)
    for first, last in copy.get("cuts", []):
        body = once(re.compile(r"[ \t]*" + words(first) + r".*?" + words(last), re.S), "", "cut %r ... %r" % (first, last))
    for old, new in copy.get("fixes", []):
        body = once(re.compile(words(old)), new, "fix %r" % old)
    return body


def transcription(copy, label):
    if copy["site"] == "gutenberg":
        raw, body = gutenberg(copy)
    elif copy["site"] == "wikisource":
        raw, body = wikisource(copy)
    elif copy["site"] == "marxists":
        raw, body = marxists(copy)
    else:
        raise ValueError("%s: unknown site %s" % (label, copy["site"]))
    return raw, keep_ranges(edition_fixes(body, copy, label), copy.get("keep"), label)


def archive(copy, label, vocabulary, report, sheets_wanted):
    """A scan on the Internet Archive, read with a transcription of the same translation (see scan.py).
    Until every place has an answer from the page image the work is left out of the corpus and reported as waiting."""
    ident = copy["id"]
    xml = fetch("https://archive.org/download/%s/%s_djvu.xml" % (ident, ident), "ia_%s_djvu.xml" % ident)
    _, reference = transcription(copy["reference"], label + " (reference)")
    checks_path = os.path.join(ROOT, "scripts", "scan-checks", ident + ".json")
    checks = scan.load_checks(checks_path)
    text, waiting, counts = scan.align(xml, copy["leaves"][0], copy["leaves"][1], clean(reference), vocabulary, checks)
    used = counts.pop("keys", set())
    print("%-60s scan: %s" % (label, counts))
    first, last = copy["leaves"]
    stale = [k for k, v in checks.items() if first <= v["leaf"] <= last and k not in used and v["take"] is None]
    if waiting or stale:
        os.makedirs(os.path.dirname(checks_path), exist_ok=True)
        scan.save_checks(checks_path, checks, waiting, used, first, last)
    if not waiting:
        return xml, text
    report.append((label, "waiting: %d places need a look at the page image, listed in %s" % (
        len(waiting), os.path.relpath(checks_path, ROOT))))
    if sheets_wanted:
        def image(leaf):
            data = fetch_bytes("https://archive.org/download/%s/page/n%d.jpg" % (ident, leaf), "ia_%s_n%d.jpg" % (ident, leaf))
            return Image.open(io.BytesIO(data)).convert("RGB")
        from PIL import Image
        out = os.path.join(CACHE, "sheets", ident)
        paths = scan.sheets(image, waiting, out)
        report.append((label, "%d sheets in %s" % (len(paths), out)))
    return xml, None


def vocabulary_of(records):
    """Every word of the transcriptions, so a misread word can be told from a real one."""
    counts = {}
    for record in records:
        for source in record.get("sources", []):
            copy = source.get("copy") or {}
            copy = copy.get("reference", copy)
            if copy.get("site") in ("gutenberg", "wikisource"):
                _, body = transcription(copy, source["title"])
                for word in body.split():
                    n = scan.norm(word)
                    counts[n] = counts.get(n, 0) + 1
    return counts


def build(record, year, report, failures, vocabulary=None, sheets_wanted=False):
    works, out = [], []
    for source in record.get("sources", []):
        label = "%s / %s" % (record["name"], source["title"])
        copy = source.get("copy")
        if not copy:
            report.append((label, "skipped: no copy"))
            continue
        problems = rights(source, year)
        if problems:
            report.append((label, "skipped: " + "; ".join(problems)))
            continue
        if copy["site"] == "archive":
            raw, body = archive(copy, label, vocabulary, report, sheets_wanted)
            if body is None:
                continue
        else:
            raw, body = transcription(copy, label)
        text = clean(body)
        chunks = passages(paragraphs(text))
        joined = "\n".join(chunks)
        # The work's own first and last words. A wrong anchor leaves an introduction in front or an index
        # behind, and a runaway note swallows the rest of the book, so both ends are checked.
        for key, window in (("opens", joined[:700]), ("closes", joined[-400:])):
            if key not in copy:
                failures.append("%s: no %s, the text reads %r" % (label, key, window))
            elif copy[key] not in window:
                failures.append("%s: %s %r not found in %r" % (label, key, copy[key], window))
        leaks = {k: (len(re.findall(p, raw, re.I)), len(re.findall(p, joined, re.I))) for k, p in FORBIDDEN.items()}
        bad = {k: v[1] for k, v in leaks.items() if v[1]}
        if bad:
            failures.append("%s: left in passages: %s" % (label, bad))
        works.append(source["title"])
        out.extend({"w": len(works) - 1, "t": c} for c in chunks)
        report.append((label, "%d passages, %d words, removed %s" % (
            len(chunks), len(joined.split()), {k: v[0] for k, v in leaks.items() if v[0]})))
    return {"name": record["name"], "works": works, "passages": out}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="build one philosopher, by file name")
    ap.add_argument("--year", type=int, default=datetime.date.today().year)
    ap.add_argument("--dump", action="store_true", help="also write the kept text to scripts/.cache for reading")
    ap.add_argument("--sheets", action="store_true", help="crop the page images of places waiting for a look")
    args = ap.parse_args()

    os.makedirs(OUT, exist_ok=True)
    report, failures = [], []
    names = sorted(f[:-5] for f in os.listdir(os.path.join(ROOT, "philosophers")) if f.endswith(".json") and f != "common-rules.json")
    records = {}
    for name in names:
        with open(os.path.join(ROOT, "philosophers", name + ".json"), encoding="utf-8") as f:
            records[name] = json.load(f)
    vocabulary = None
    for name in names:
        if args.only and name != args.only:
            continue
        record = records[name]
        if vocabulary is None and any((s.get("copy") or {}).get("site") == "archive" for s in record.get("sources", [])):
            vocabulary = vocabulary_of(records.values())
        corpus = build(record, args.year, report, failures, vocabulary, args.sheets)
        path = os.path.join(OUT, slug(record["name"]) + ".json")
        if not corpus["passages"]:
            if os.path.exists(path):
                os.remove(path)
            continue
        data = json.dumps(corpus, ensure_ascii=False, separators=(",", ":"))
        with open(path + ".part", "w", encoding="utf-8") as f:
            f.write(data)
        os.replace(path + ".part", path)
        if args.dump:
            with open(os.path.join(CACHE, "dump-" + slug(record["name"]) + ".txt"), "w", encoding="utf-8") as f:
                f.write("\n\n".join(p["t"] for p in corpus["passages"]))
        report.append((record["name"], "wrote %s, %d kB, %d kB gzip" % (
            os.path.relpath(path, ROOT), len(data.encode()) // 1024, len(gzip.compress(data.encode())) // 1024)))
    # Which philosophers have passages, so the page asks only for files that exist.
    names = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith(".json") and f != "manifest.json")
    with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump({"names": names}, f)
    for label, line in report:
        print("%-60s %s" % (label, line))
    for line in failures:
        print("FAIL " + line)
    print("%d sources checked, %d failures" % (sum(1 for _, l in report if "passages" in l), len(failures)))
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
