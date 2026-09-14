"""The words of a printed edition, read from its scan with a clean transcription of the same translation as a guide.

The scan's OCR proves the edition but misreads letters; the transcription reads well but may come from another
edition. Both are cut into words and aligned:
  - where they agree, the transcription's spelling and punctuation are used;
  - where the OCR word is not a word at all and looks like the transcription's word, it was misread, and the
    transcription's word is used;
  - a few other kinds of difference leave only one reading and are settled by rule (see settle);
  - everywhere else the two editions may really differ, and the page image decides. Each such place is written to
    a checks file with what the scan and the transcription say, and the work stays out of the corpus until every
    one has an answer taken from the page image.
Words outside the text column (marginal analyses, page and line numbers, running heads) and notes below the text
are dropped before aligning.
"""

import difflib
import hashlib
import json
import os
import re
import statistics

LETTERS = re.compile(r"[^a-z]")
SPEAKER_SCAN = re.compile(r"^[A-Z][a-z]{1,11}\.$")
SPEAKER_REFERENCE = re.compile(r"^[A-Z]{2,}:$")
# Characters no printed word carries inside it; OCR leaves them where it lost a letter ("}^ou" for "you").
JUNK = re.compile(r"(?<=.)[^A-Za-z'’\-.,;:!?)\]\"”](?=.)")
# The binder's mark at the foot of a sheet's first page: volume and a letter pair ("VOL. III. H h").
SIGNATURE = re.compile(r"^(?:VOL\.?\s*[IVXLivxlnm]+\.?\s*)?[A-Z]\s*[a-z]?\s*\d?$")


def norm(word):
    return LETTERS.sub("", word.lower().replace("æ", "ae").replace("œ", "oe"))


def unescape(s):
    return (s.replace("&quot;", '"').replace("&apos;", "'").replace("&lt;", "<").replace("&gt;", ">")
            .replace("&amp;", "&").strip())


# Scan ---------------------------------------------------------------------------------------------

def leaves(xml):
    for leaf, obj in enumerate(re.findall(r"<OBJECT.*?</OBJECT>", xml, re.S)):
        lines = []
        for line in re.findall(r"<LINE>(.*?)</LINE>", obj, re.S):
            words = []
            for coords, word in re.findall(r'<WORD coords="([^"]+)"[^>]*>(.*?)</WORD>', line, re.S):
                l, b, r, t = map(int, coords.split(",")[:4])
                word = unescape(word)
                if word:
                    words.append({"w": word, "l": l, "r": r, "t": t, "b": b})
            if words:
                lines.append(words)
        yield leaf, lines


def body(lines, bounds=None):
    """Words of the text column in reading order, with the first word of each indented line marked.

    bounds, when known, is the column measured from words that matched the transcription on this page."""
    long = [ln for ln in lines if len(ln) >= 8]
    if len(long) < 4:
        return []
    height = statistics.median(w["b"] - w["t"] for ln in long for w in ln)
    if bounds:
        # Edges measured from matched words are exact; a marginal word can start right where the line ends.
        return column(lines, bounds[0], bounds[1], height, slack=0.3 * height)
    # The text column is the widest stretch of the page that most lines cover; the margins beside it,
    # where the analyses and numbers sit, are covered by few lines.
    step = 10
    width = max(w["r"] for ln in lines for w in ln) // step + 1
    cover = [0] * width
    for ln in lines:
        hit = set()
        for w in ln:
            hit.update(range(w["l"] // step, w["r"] // step + 1))
        for x in hit:
            cover[x] += 1
    busy = max(cover) * 0.4
    runs, start = [], None
    for x, c in enumerate(cover + [0]):
        if c >= busy and start is None:
            start = x
        elif c < busy and start is not None:
            runs.append((start, x))
            start = None
    a, b = max(runs, key=lambda r: r[1] - r[0])
    left, right = a * step, b * step
    # Speeches and paragraphs are indented from the column's left edge.
    lefts = sorted(ln[0]["l"] for ln in long if left - height <= ln[0]["l"])
    if lefts:
        left = lefts[len(lefts) // 4]
    return column(lines, left, right, height, slack=height)


def column(lines, left, right, height, slack):
    kept = []
    for ln in lines:
        # OCR sometimes runs a line straight into the marginal note beside it, so each word is judged by its middle.
        words = [w for w in ln if left - slack <= (w["l"] + w["r"]) / 2 <= right + slack]
        if words:
            kept.append(words)
    if not kept:
        return []
    kept.sort(key=lambda ln: min(w["t"] for w in ln))
    tops = [min(w["t"] for w in ln) for ln in kept]
    spacing = statistics.median(b - a for a, b in zip(tops, tops[1:])) if len(tops) > 2 else height * 2
    # Lines fall into blocks wherever the gap widens. A lone line above the text is the running head;
    # a short block below it holds the notes.
    blocks = [[0]]
    for i in range(1, len(kept)):
        if tops[i] - tops[i - 1] > 1.6 * spacing:
            blocks.append([])
        blocks[-1].append(i)
    if len(blocks) > 1 and len(blocks[0]) == 1:
        blocks = blocks[1:]
    if len(blocks) > 1 and len(blocks[-1]) <= 6:
        blocks = blocks[:-1]
    out = []
    for number, ln in enumerate(kept[i] for block in blocks for i in block):
        indented = ln[0]["l"] > left + 0.8 * height
        for i, w in enumerate(ln):
            # A note reference is a small raised number inside the line.
            if re.fullmatch(r"\d{1,2}", w["w"]) and w["b"] - w["t"] < 0.75 * height:
                continue
            out.append(dict(w, start=(i == 0 and indented), end=(i == len(ln) - 1), line=number))
    return out


def scan_units(xml, first_leaf, last_leaf, bounds=None):
    words = []
    for leaf, lines in leaves(xml):
        if first_leaf <= leaf <= last_leaf:
            for w in body(lines, (bounds or {}).get(leaf)):
                words.append(dict(w, leaf=leaf))
    units = []
    for w in words:
        prev = units[-1] if units else None
        # A word broken across lines with a hyphen is joined again.
        if prev and prev["end"] and prev["w"].endswith("-") and re.match(r"[a-z]", w["w"]):
            head, _, rest = w["w"].partition(" ")
            prev.update(w=prev["w"][:-1] + head, end=w["end"] and not rest, boxes=prev["boxes"] + [box(w)])
            if not rest:
                continue
            w = dict(w, w=rest, start=False)
        # One OCR word can hold several ("pany me."), and dashes join words that are separate.
        for piece in filter(None, re.split(r"\s+|\u2014|--", w["w"])):
            units.append({"w": piece, "leaf": w["leaf"], "line": w["line"], "start": w["start"], "end": w["end"],
                          "boxes": [box(w)]})
    for u in units:
        u["n"] = "§" + norm(u["w"])[:3] if u["start"] and SPEAKER_SCAN.match(u["w"]) else norm(u["w"])
    return units


def box(w):
    return (w["l"], w["t"], w["r"], w["b"])


# Transcription ------------------------------------------------------------------------------------

def reference_units(text):
    units = []
    for para in re.split(r"\n\s*\n", text):
        first = True
        for word in para.split():
            for piece in filter(None, re.split(r"\u2014|--", word)):
                n = "§" + norm(piece)[:3] if first and SPEAKER_REFERENCE.match(piece) else norm(piece)
                units.append({"w": piece, "n": n, "para": first})
                first = False
    return units


# Alignment ----------------------------------------------------------------------------------------

# Letters old type and old OCR take for one another. Two words that differ only by these are the same word
# misread ("hut" for "but", "arc" for "are"); any other difference may be the edition's own.
LOOKALIKE = {("h", "b"), ("b", "h"), ("li", "h"), ("h", "li"), ("l", "i"), ("i", "l"), ("c", "e"), ("e", "c"),
             ("v", "y"), ("y", "v"), ("rn", "m"), ("m", "rn"), ("cl", "d"), ("d", "cl"), ("ii", "u"), ("u", "ii"),
             ("t", "f"), ("f", "t"), ("j", "i"), ("j", "l")}


def lookalike(a, b):
    ops = [op for op in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes() if op[0] != "equal"]
    return bool(ops) and all(op == "replace" and (a[i1:i2], b[j1:j2]) in LOOKALIKE for op, i1, i2, j1, j2 in ops)


def spelling(word):
    """British and American spellings of one word fall together ("colour", "color"; "recognise", "recognize";
    "marvellous", "marvelous"; "spectre", "specter")."""
    word = word.replace("our", "or").replace("eable", "able").replace("ise", "ize").replace("ll", "l")
    return re.sub(r"wards$", "ward", re.sub(r"([^aeiou])re$", r"\1er", word))


def settle(s, r, vocabulary):
    """Decides a place without the page when the kind of difference leaves only one reading. Returns the
    side to take and the kind of place, or (None, None) when the page image has to decide."""
    known = lambda u: vocabulary.get(u["n"], 0) >= 3 and not JUNK.search(u["w"])
    if s and len(s) == len(r) and all(
            not known(a) and difflib.SequenceMatcher(None, a["n"], b["n"]).ratio() >= 0.5 for a, b in zip(s, r)):
        return "reference", "misread"
    # The same letters cut differently: a dash read as a hyphen ("gods-that"), a word broken over a line
    # that did not join ("in- tention"), brackets for parentheses ("[i. e.").
    if s and r and "".join(u["n"] for u in s) == "".join(u["n"] for u in r):
        return "reference", "same letters"
    if s and len(s) == len(r) and all(a["n"] != b["n"] and spelling(a["n"]) == spelling(b["n"]) for a, b in zip(s, r)):
        return "scan", "spelling"
    if len(s) == len(r) == 1 and lookalike(s[0]["n"], r[0]["n"]):
        return "reference", "lookalike letters"
    # OCR passes over a lone capital I more than any other word.
    if not s and r and all(u["w"].strip(",;:.") == "I" for u in r):
        return "reference", "lost I"
    # A line OCR turned to rubble: most of its words are no words, and its letters still follow the transcription.
    if (s and r and sum(1 for u in s if not known(u)) * 2 >= len(s) and difflib.SequenceMatcher(
            None, "".join(u["n"] for u in s), "".join(u["n"] for u in r), autojunk=False).ratio() >= 0.6):
        return "reference", "rubble"
    # A speaker's name on a line OCR did not see as indented, or with a stray mark before it ("5S Phaedr.").
    if (r and len(r) == 1 and SPEAKER_REFERENCE.match(r[0]["w"]) and s
            and SPEAKER_SCAN.match(s[-1]["w"]) and norm(s[-1]["w"])[:3] == norm(r[0]["w"])[:3]
            and all(vocabulary.get(u["n"], 0) < 3 for u in s[:-1])):
        return "reference", "speakers"
    # A running head or heading one side prints and the other does not: capitals only ("MEDITATION VI.").
    if ((s and not r or r and not s) and all(u["w"].upper() == u["w"] for u in s or r)
            and any(len(u["n"]) >= 3 for u in s or r)):
        return "nothing", "headings"
    # Specks and printer's marks in the scan: nothing in them is a word ("f", "V J a J", "G g").
    if s and not r and (SIGNATURE.match(" ".join(u["w"] for u in s)) or all(
            len(u["n"]) == 1 and u["n"] not in "ai" or vocabulary.get(u["n"], 0) < 3 for u in s)):
        return "nothing", "specks"
    # A note the transcription set in parentheses inside the text; the edition prints it below the page.
    if r and not s and r[0]["w"].startswith("(") and re.search(r"\)[.,;:]*$", r[-1]["w"]) and len(r) >= 2:
        return "nothing", "notes"
    return None, None


def key(leaf, scan, reference, seen):
    base = "%d|%s|%s" % (leaf, scan, reference)
    seen[base] = seen.get(base, 0) + 1
    return hashlib.sha1(("%s|%d" % (base, seen[base])).encode()).hexdigest()[:12]


CHUNK = 3000


def opcodes(a, b):
    """difflib's opcodes for two word lists, worked out a few pages at a time: on a whole book at once difflib
    runs for hours. Each piece ends at its last long match, so the next piece starts where both sides agree."""
    if len(a) <= CHUNK * 2:
        return difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes()
    ops, i, j = [], 0, 0
    while i < len(a) or j < len(b):
        last = len(a) - i <= CHUNK * 2
        i_end = len(a) if last else i + CHUNK
        j_end = len(b) if last else min(len(b), j + int(CHUNK * 1.5))
        matcher = difflib.SequenceMatcher(None, a[i:i_end], b[j:j_end], autojunk=False)
        cut_a, cut_b = i_end - i, j_end - j
        if not last:
            solid = [m for m in matcher.get_matching_blocks() if m.size >= 12]
            if solid:
                cut_a, cut_b = solid[-1].a + solid[-1].size, solid[-1].b + solid[-1].size
                matcher = difflib.SequenceMatcher(None, a[i:i + cut_a], b[j:j + cut_b], autojunk=False)
        ops.extend((op, i + i1, i + i2, j + j1, j + j2) for op, i1, i2, j1, j2 in matcher.get_opcodes())
        i, j = i + cut_a, j + cut_b
    return ops


def align(xml, first_leaf, last_leaf, reference_text, vocabulary, checks):
    """Returns the text, the places still waiting for a look at the page, and counts of each kind of place."""
    ref = [u for u in reference_units(reference_text) if u["n"]]
    ref_n = [u["n"] for u in ref]
    scan = [u for u in scan_units(xml, first_leaf, last_leaf) if u["n"]]
    # Where marginal notes crowd the text, OCR runs them into its lines and the page alone does not show
    # where the column ends. The words that matched the transcription do show it, so the page is read again
    # inside their edges.
    lines = {}
    for op, i1, i2, _, _ in opcodes([u["n"] for u in scan], ref_n):
        if op != "equal" or i2 - i1 < 3:
            continue
        for u in scan[i1:i2]:
            l, _, r, _ = u["boxes"][0]
            span = lines.setdefault((u["leaf"], u["line"]), [l, r])
            span[0], span[1] = min(span[0], l), max(span[1], r)
    per_leaf = {}
    for (leaf, _), span in lines.items():
        per_leaf.setdefault(leaf, []).append(span)
    bounds = {}
    for leaf, spans in per_leaf.items():
        if len(spans) >= 10:
            ls, rs = sorted(s[0] for s in spans), sorted(s[1] for s in spans)
            # Full lines share both edges; indented and short lines only move the edge inward.
            bounds[leaf] = (ls[len(ls) // 5], rs[len(rs) * 4 // 5])
    scan = [u for u in scan_units(xml, first_leaf, last_leaf, bounds) if u["n"]]
    out, waiting, counts, seen = [], [], {}, {}

    def emit(units, para_from=None):
        for i, u in enumerate(units):
            para = u.get("para") if para_from is None else (para_from if i == 0 else False)
            out.append(("\n\n" if para and out else "") + u["w"])

    ops = opcodes([u["n"] for u in scan], ref_n)
    # The leaves are chosen by page, so the scan runs past the work at both ends: a title page before it,
    # the next work's heading after it.
    if ops and ops[0][0] == "delete":
        ops = ops[1:]
    if ops and ops[-1][0] == "delete":
        ops = ops[:-1]
    for op, i1, i2, j1, j2 in ops:
        s, r = scan[i1:i2], ref[j1:j2]
        if op == "equal":
            emit(r)
            counts["same"] = counts.get("same", 0) + len(r)
            continue
        settled, kind = settle(s, r, vocabulary)
        if settled:
            counts[kind] = counts.get(kind, 0) + 1
            if settled == "reference":
                emit(r)
            elif settled == "scan":
                emit(s, para_from=r[0]["para"] if r else False)
            continue
        leaf = (s[0] if s else scan[min(i1, len(scan) - 1)])["leaf"]
        scan_text = " ".join(u["w"] for u in s)
        ref_text = " ".join(u["w"] for u in r)
        k = key(leaf, scan_text, ref_text, seen)
        counts.setdefault("keys", set()).add(k)
        answer = checks.get(k, {}).get("take")
        counts["looked"] = counts.get("looked", 0) + (1 if answer is not None else 0)
        if answer is None:
            around = scan[max(0, i1 - 1):min(len(scan), i2 + 1)]
            waiting.append({"key": k, "leaf": leaf, "scan": scan_text, "reference": ref_text,
                            "boxes": [b for u in around if u["leaf"] == leaf for b in u["boxes"]],
                            "context": " ".join(u["w"] for u in scan[max(0, i1 - 6):i1]) + " [...] " +
                                       " ".join(u["w"] for u in scan[i2:i2 + 6])})
            emit(r)
        elif answer == "reference":
            emit(r)
        elif answer == "scan":
            emit(s, para_from=r[0]["para"] if r else False)
        else:
            out.append(answer)
    text = " ".join(out)
    text = re.sub(r" *\n\n *", "\n\n", text)
    return text, waiting, counts


def load_checks(path):
    if not os.path.exists(path):
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_checks(path, checks, waiting, used, first_leaf, last_leaf):
    """Adds the new places without an answer and forgets unanswered places in these leaves that the text no longer
    has. An answer read from a page is kept even when unused: a later change to the rules can bring its place back."""
    for k in [k for k, v in checks.items()
              if first_leaf <= v["leaf"] <= last_leaf and k not in used and v["take"] is None]:
        del checks[k]
    for w in waiting:
        checks.setdefault(w["key"], {"leaf": w["leaf"], "scan": w["scan"], "reference": w["reference"],
                                     "context": w["context"], "take": None})
    with open(path + ".part", "w", encoding="utf-8") as f:
        json.dump(checks, f, ensure_ascii=False, indent=1)
        f.write("\n")
    os.replace(path + ".part", path)


def sheets(image_for_leaf, waiting, out_dir, per_sheet=6):
    """Crops of every waiting place, stacked into numbered sheets to read."""
    from PIL import Image, ImageDraw
    os.makedirs(out_dir, exist_ok=True)
    crops = []
    for n, w in enumerate(waiting):
        page = image_for_leaf(w["leaf"])
        if not w["boxes"]:
            continue
        l = max(0, min(b[0] for b in w["boxes"]) - 260)
        r = min(page.width, max(b[2] for b in w["boxes"]) + 260)
        t = max(0, min(b[1] for b in w["boxes"]) - 70)
        b_ = min(page.height, max(b[3] for b in w["boxes"]) + 70)
        crop = page.crop((l, t, r, b_))
        label = Image.new("RGB", (crop.width, 40), "white")
        ImageDraw.Draw(label).text((8, 8), "#%d  leaf %d  scan: %s  |  reference: %s" % (
            n, w["leaf"], w["scan"][:60], w["reference"][:60]), fill="black")
        tile = Image.new("RGB", (crop.width, crop.height + 40), "white")
        tile.paste(label, (0, 0))
        tile.paste(crop, (0, 40))
        crops.append(tile)
    paths = []
    for s in range(0, len(crops), per_sheet):
        group = crops[s:s + per_sheet]
        width = max(c.width for c in group)
        sheet = Image.new("RGB", (width, sum(c.height for c in group)), "white")
        y = 0
        for c in group:
            sheet.paste(c, (0, y))
            y += c.height
        path = os.path.join(out_dir, "sheet-%03d.png" % (s // per_sheet))
        sheet.save(path)
        paths.append(path)
    return paths
