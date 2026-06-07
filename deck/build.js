/* Storybook — Product & Engineering Submission deck.
 * On-brand (warm cream, Fredoka/Nunito, Oyen mascot). Run: node build.js */
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const ASSETS = path.join(__dirname, "assets");
const ICONS = path.join(__dirname, "icons");
const asset = (f) => path.join(ASSETS, f);
const icon = (key, v = "white") => path.join(ICONS, `${key}_${v}.png`);

// ---- Design tokens (verbatim from apps/web/src/index.css) ----
const C = {
  bg: "FBF3E7",
  card: "FFFDF9",
  muted: "F3E9D8",
  ink: "3A2E28",
  inkSoft: "8A7A6D",
  line: "ECE0CE",
  coral: "FF7B54",
  coralDark: "F2603A",
  gold: "FFC93C",
  goldDark: "F0B523",
  peach: "FFB084",
  teal: "2EC4B6",
  blue: "4CB9E7",
  purple: "A78BFA",
  green: "7BC950",
  pink: "FF8FB1",
  success: "58CC02",
  warning: "FFB020",
  destructive: "FF4B4B",
  info: "1CB0F6",
  white: "FFFFFF",
  codeBg: "2A211C",
  codeText: "F3E3D2",
};
// Soft tints (pale fills for blobs/bands)
const T = {
  coral: "FFE3D7",
  gold: "FFEFC4",
  teal: "D9F3EF",
  blue: "DDF0FB",
  purple: "ECE6FE",
  green: "E6F4D8",
  pink: "FFE4EC",
};
const F = { display: "Fredoka", body: "Nunito", mono: "Consolas" };

// Mascot/scene aspect ratios (w/h) measured from the PNGs
const RATIO = {
  oyen_1: 0.8851, oyen_2: 0.8722, oyen_3: 0.9714,
  oyen_4: 0.8543, oyen_5: 0.8798,
  scene_chest: 0.8912, scene_nook: 0.9744,
};

const PAGEW = 13.333, PAGEH = 7.5, MX = 0.6;
const shadow = (o = {}) => ({
  type: "outer", color: o.color || "3A2E28",
  blur: o.blur ?? 9, offset: o.offset ?? 3, angle: 90, opacity: o.opacity ?? 0.1,
});

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Muhammad Rayhan Yovi";
pptx.title = "Storybook — Product & Engineering Submission";

// ---------- helpers ----------
function cols(n, gap = 0.3, x0 = MX, totalW = PAGEW - 2 * MX) {
  const w = (totalW - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (w + gap), w }));
}
function bg(slide, color = C.bg) { slide.background = { color }; }

function pill(slide, text, x, y, o = {}) {
  const fs = o.fontSize || 11;
  const h = o.h || 0.34;
  const w = o.w || 0.38 + String(text).length * (fs * 0.0086);
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: h / 2,
    fill: { color: o.fill || C.muted },
    line: o.line ? { color: o.line, width: 1 } : { type: "none" },
  });
  slide.addText(o.upper === false ? text : String(text).toUpperCase(), {
    x, y, w, h, align: "center", valign: "middle",
    fontFace: F.body, fontSize: fs, bold: true,
    color: o.color || C.ink, charSpacing: o.charSpacing ?? 0.6,
  });
  return { w, h };
}

function header(slide, kicker, title, o = {}) {
  pill(slide, kicker, MX, 0.46, { fill: o.kickerFill || C.coral, color: o.kickerColor || C.white });
  slide.addText(title, {
    x: MX - 0.02, y: 0.84, w: o.titleW || PAGEW - 2 * MX, h: 0.72,
    fontFace: F.display, fontSize: o.titleSize || 30, bold: true,
    color: C.ink, align: "left", valign: "middle",
  });
}

function footer(slide, n) {
  slide.addText(
    [
      { text: "Storybook", options: { bold: true, color: C.ink, fontFace: F.display } },
      { text: "   Product & Engineering Submission", options: { color: C.inkSoft, fontFace: F.body } },
    ],
    { x: MX, y: PAGEH - 0.46, w: 7, h: 0.3, fontSize: 9, align: "left", valign: "middle" }
  );
  slide.addText(String(n).padStart(2, "0"), {
    x: PAGEW - MX - 1, y: PAGEH - 0.46, w: 1, h: 0.3, fontSize: 9,
    align: "right", valign: "middle", color: C.inkSoft, fontFace: F.body, bold: true,
  });
}

function card(slide, x, y, w, h, o = {}) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: o.r ?? 0.16,
    fill: { color: o.fill || C.card },
    line: o.line === false ? { type: "none" } : { color: o.lineColor || C.line, width: o.lineWidth || 1 },
    shadow: o.shadow === false ? undefined : shadow(o.shadowOpts || {}),
  });
}

function iconChip(slide, key, x, y, d, fill, o = {}) {
  slide.addShape("ellipse", {
    x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" },
    shadow: o.shadow === false ? undefined : shadow({ blur: 5, offset: 2, opacity: 0.13 }),
  });
  const inset = d * (o.inset ?? 0.26);
  slide.addImage({ path: icon(key, o.variant || "white"), x: x + inset, y: y + inset, w: d - 2 * inset, h: d - 2 * inset });
}

function chunky(slide, text, x, y, w, h, o = {}) {
  const face = o.face || C.coral, edge = o.edge || C.coralDark, depth = o.depth ?? 0.085;
  const r = o.r ?? h * 0.32;
  slide.addShape("roundRect", { x, y: y + depth, w, h, rectRadius: r, fill: { color: edge }, line: { type: "none" } });
  slide.addShape("roundRect", { x, y, w, h, rectRadius: r, fill: { color: face }, line: { type: "none" } });
  slide.addText(text, {
    x, y, w, h, align: "center", valign: "middle",
    fontFace: F.display, fontSize: o.fontSize || 15, bold: true, color: o.color || C.white,
  });
}

function mascot(slide, key, o) {
  // place by height (h) or width (w); preserves aspect ratio
  let w = o.w, h = o.h;
  if (h && !w) w = h * RATIO[key];
  if (w && !h) h = w / RATIO[key];
  slide.addImage({ path: asset(key + ".png"), x: o.x, y: o.y, w, h });
  return { w, h };
}

function bullets(slide, items, o) {
  slide.addText(
    items.map((t) => ({ text: t, options: { bullet: { indent: o.indent ?? 16 }, breakLine: true } })),
    {
      x: o.x, y: o.y, w: o.w, h: o.h, fontFace: F.body, fontSize: o.fontSize || 12,
      color: o.color || C.ink, align: "left", valign: o.valign || "top",
      lineSpacingMultiple: o.lsm || 1.12, paraSpaceAfter: o.psa ?? 6,
    }
  );
}

// icon row: chip on the left, bold title + description text to the right
function iconRow(slide, x, y, w, key, fill, title, desc, o = {}) {
  const d = o.d || 0.5;
  iconChip(slide, key, x, y, d, fill, { variant: o.variant || "white", inset: o.inset });
  const tx = x + d + 0.18, tw = w - d - 0.18;
  slide.addText(
    [
      { text: title, options: { fontFace: F.display, fontSize: o.titleSize || 13.5, bold: true, color: C.ink, breakLine: true } },
      { text: desc, options: { fontFace: F.body, fontSize: o.descSize || 10.8, color: C.inkSoft, breakLine: false } },
    ],
    { x: tx, y: y - 0.06, w: tw, h: o.rowH || d + 0.12, align: "left", valign: "middle", lineSpacingMultiple: 1.04 }
  );
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
(function cover() {
  const s = pptx.addSlide(); bg(s);
  // soft disc behind mascot
  s.addShape("ellipse", { x: 8.55, y: 1.15, w: 4.45, h: 4.45, fill: { color: T.gold }, line: { type: "none" } });
  s.addShape("ellipse", { x: 8.0, y: 4.55, w: 1.0, h: 1.0, fill: { color: T.teal }, line: { type: "none" } });
  s.addShape("ellipse", { x: 12.25, y: 1.5, w: 0.55, h: 0.55, fill: { color: T.coral }, line: { type: "none" } });
  mascot(s, "oyen_1", { x: 8.95, y: 1.55, h: 4.75 });

  pill(s, "Product & Engineering Submission", 0.92, 1.45, { fill: C.coral, color: C.white, fontSize: 11.5 });
  s.addText("Storybook", {
    x: 0.82, y: 1.95, w: 7.6, h: 1.5, fontFace: F.display, fontSize: 76, bold: true, color: C.ink, align: "left", valign: "middle",
  });
  s.addText("A paid digital library for kids — safe to browse, flexible to buy, and simple for a catalog team to run.", {
    x: 0.92, y: 3.42, w: 7.1, h: 1.0, fontFace: F.body, fontSize: 17, color: C.inkSoft, align: "left", valign: "top", lineSpacingMultiple: 1.18,
  });
  // feature pills row
  const fp = [
    ["Subscription + Buy-to-keep", C.teal],
    ["Kid · Parent · Admin", C.purple],
    ["React 19 · Express 5 · Postgres", C.blue],
  ];
  let px = 0.92;
  fp.forEach(([t, col]) => {
    const w = 0.5 + t.length * 0.092;
    s.addShape("roundRect", { x: px, y: 4.62, w, h: 0.44, rectRadius: 0.22, fill: { color: C.card }, line: { color: col, width: 1.5 } });
    s.addText(t, { x: px, y: 4.62, w, h: 0.44, align: "center", valign: "middle", fontFace: F.body, fontSize: 11, bold: true, color: C.ink });
    px += w + 0.22;
  });
  // author block
  s.addText(
    [
      { text: "Muhammad Rayhan Yovi", options: { fontFace: F.display, fontSize: 18, bold: true, color: C.ink, breakLine: true } },
      { text: "Product Engineer — Technical Test", options: { fontFace: F.body, fontSize: 12, color: C.inkSoft } },
    ],
    { x: 0.92, y: 5.7, w: 7, h: 0.9, align: "left", valign: "top", lineSpacingMultiple: 1.1 }
  );
})();

// ============================================================
// SLIDE 2 — Problem & Vision
// ============================================================
(function problem() {
  const s = pptx.addSlide(); bg(s);
  header(s, "The opportunity", "Why Storybook exists");
  const [L, R] = cols(2, 0.4);
  const top = 1.78, h = 4.75;

  // Problem card
  card(s, L.x, top, L.w, h);
  pill(s, "The problem", L.x + 0.3, top + 0.3, { fill: T.coral, color: C.coralDark });
  const probs = [
    ["ban", C.destructive, "Kids buy by accident", "Every tap is the same gesture to a toddler — “buy” included."],
    ["eye", C.warning, "Unsafe or low-quality content", "Parents can’t trust an open catalog with ads and adult titles."],
    ["lock", C.purple, "One rigid subscription, no ownership", "Cancel and you lose everything — even favorites read 40 times."],
    ["cog", C.blue, "No tooling for the catalog team", "Operators need to publish and archive without engineering."],
  ];
  let y = top + 0.95;
  probs.forEach(([ic, col, t, d]) => { iconRow(s, L.x + 0.32, y, L.w - 0.64, ic, col, t, d); y += 0.96; });

  // Vision card (coral-accented)
  card(s, R.x, top, R.w, h, { fill: C.ink });
  pill(s, "Our bet", R.x + 0.3, top + 0.3, { fill: C.coral, color: C.white });
  s.addText(
    [
      { text: "The child’s delight drives ", options: { color: C.codeText } },
      { text: "engagement", options: { color: C.gold, bold: true } },
      { text: ",\nbut the parent’s trust drives ", options: { color: C.codeText } },
      { text: "payment", options: { color: C.teal, bold: true } },
      { text: ".", options: { color: C.codeText } },
    ],
    { x: R.x + 0.34, y: top + 0.92, w: R.w - 0.68, h: 1.5, fontFace: F.display, fontSize: 21, bold: true, align: "left", valign: "middle", lineSpacingMultiple: 1.1 }
  );
  const vis = [
    "Two experiences in one brand — a joyful kid surface and a controlled parent surface, split by a PIN gate.",
    "Own books forever, or subscribe to the whole catalog. Two entitlements, never merged.",
    "A dedicated admin surface runs the catalog lifecycle end to end.",
  ];
  s.addText(
    vis.map((t) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: true, color: C.codeText } })),
    { x: R.x + 0.36, y: top + 2.7, w: R.w - 0.72, h: 1.8, fontFace: F.body, fontSize: 12.5, align: "left", valign: "top", lineSpacingMultiple: 1.14, paraSpaceAfter: 9 }
  );
  footer(s, 2);
})();

// ============================================================
// SLIDE 3 — Target users
// ============================================================
(function users() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Who it’s for", "Three people, one account");
  const top = 1.85, ch = 3.5;
  const c = cols(3, 0.34);
  const personas = [
    { key: "user", col: C.coral, tint: T.coral, role: "Parent · the buyer", who: "Dina, 34", sub: "Mom of a 4-year-old", need: "Safe, age-appropriate stories. Control spending. Trust her kid can’t rack up charges.", tag: "Holds the wallet" },
    { key: "child", col: C.teal, tint: T.teal, role: "Child · the reader", who: "Adit, 4", sub: "Loves pictures & tapping", need: "Colorful pictures, move through a story, feel rewarded — all without help.", tag: "The engagement engine" },
    { key: "userCog", col: C.purple, tint: T.purple, role: "Admin · the operator", who: "Catalog manager", sub: "Internal content team", need: "Add books, keep metadata correct, control availability: draft, published, archived.", tag: "Owns catalog quality" },
  ];
  personas.forEach((p, i) => {
    const x = c[i].x, w = c[i].w;
    card(s, x, top, w, ch);
    iconChip(s, p.key, x + 0.32, top + 0.32, 0.78, p.col);
    s.addText(p.role.toUpperCase(), { x: x + 1.24, y: top + 0.34, w: w - 1.4, h: 0.3, fontFace: F.body, fontSize: 10, bold: true, color: p.col, charSpacing: 0.8, valign: "middle" });
    s.addText(p.who, { x: x + 1.24, y: top + 0.6, w: w - 1.4, h: 0.4, fontFace: F.display, fontSize: 17, bold: true, color: C.ink, valign: "middle" });
    s.addText(p.sub, { x: x + 0.34, y: top + 1.32, w: w - 0.68, h: 0.3, fontFace: F.body, fontSize: 11, italic: true, color: C.inkSoft });
    s.addText(p.need, { x: x + 0.34, y: top + 1.72, w: w - 0.68, h: 1.1, fontFace: F.body, fontSize: 12.5, color: C.ink, valign: "top", lineSpacingMultiple: 1.16 });
    s.addShape("roundRect", { x: x + 0.34, y: top + ch - 0.66, w: w - 0.68, h: 0.42, rectRadius: 0.21, fill: { color: p.tint }, line: { type: "none" } });
    s.addText(p.tag, { x: x + 0.34, y: top + ch - 0.66, w: w - 0.68, h: 0.42, align: "center", valign: "middle", fontFace: F.body, fontSize: 11, bold: true, color: C.ink });
  });
  // insight strip
  const sy = top + ch + 0.32;
  card(s, MX, sy, PAGEW - 2 * MX, 0.92, { fill: C.ink, shadowOpts: { opacity: 0.14 } });
  iconChip(s, "exchange", MX + 0.34, sy + 0.21, 0.5, C.gold, { variant: "ink" });
  s.addText(
    [
      { text: "Buyer ≠ reader.  ", options: { fontFace: F.display, fontSize: 15, bold: true, color: C.gold } },
      { text: "The account belongs to the parent; the child is a constrained view of it — and CRUD lives in a separate admin role.", options: { fontFace: F.body, fontSize: 13, color: C.codeText } },
    ],
    { x: MX + 1.0, y: sy, w: PAGEW - 2 * MX - 1.3, h: 0.92, align: "left", valign: "middle", lineSpacingMultiple: 1.05 }
  );
  footer(s, 3);
})();

// ============================================================
// SLIDE 4 — Child-development foundation
// ============================================================
(function childDev() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Product thinking", "Designed around how toddlers actually are");
  s.addText("Domain insights that separate a kids’ product from a generic app with a bright color scheme.", {
    x: MX, y: 1.5, w: 10.5, h: 0.34, fontFace: F.body, fontSize: 12.5, italic: true, color: C.inkSoft,
  });
  const top = 2.0, gap = 0.3;
  const c = cols(2, gap);
  const ch = 2.18, rowGap = 0.28;
  const items = [
    { key: "clock", col: C.coral, tint: T.coral, t: "6-page books", d: "Calibrated to a single toddler session. Sustained attention at age 2–4 is just 2–5 minutes — one short book is one complete session, with a clear finish-reward endpoint." },
    { key: "feather", col: C.teal, tint: T.teal, t: "Restrained motion", d: "The reading view is a motion-free zone; never more than 2 animated elements. Same science behind Bluey & Peppa — the pause is the content, not boredom." },
    { key: "shield", col: C.purple, tint: T.purple, t: "Purchase UI is structurally absent", d: "There is no buy button in kid mode — not hidden, not permission-checked, simply not rendered. A toddler can’t tap what doesn’t exist." },
    { key: "hand", col: C.blue, tint: T.blue, t: "64–72px tap targets", d: "Toddler motor precision ≈ an adult using their non-dominant hand in oven mitts. Oversized targets aren’t over-engineering — they’re the correct engineering." },
  ];
  items.forEach((it, i) => {
    const col = c[i % 2], row = Math.floor(i / 2);
    const x = col.x, y = top + row * (ch + rowGap), w = col.w;
    card(s, x, y, w, ch);
    iconChip(s, it.key, x + 0.34, y + 0.34, 0.74, it.col);
    s.addText(it.t, { x: x + 1.26, y: y + 0.34, w: w - 1.5, h: 0.74, fontFace: F.display, fontSize: 17, bold: true, color: C.ink, valign: "middle", lineSpacingMultiple: 1.0 });
    s.addText(it.d, { x: x + 0.36, y: y + 1.18, w: w - 0.72, h: 0.9, fontFace: F.body, fontSize: 12, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.15 });
  });
  footer(s, 4);
})();

// ============================================================
// SLIDE 5 — Three surfaces
// ============================================================
(function surfaces() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Architecture of trust", "Three surfaces, one brand");
  const top = 1.85, ch = 4.35;
  const c = cols(3, 0.34);
  const surfs = [
    { key: "child", col: C.teal, entry: "Default after login", can: ["Browse the catalog grid", "Read accessible books", "See locked items softly"], cannot: ["Buy or subscribe", "Manage or CRUD"], name: "Kid", mascot: "oyen_2" },
    { key: "key", col: C.coral, entry: "PIN gate from kid mode", can: ["Subscribe & renew", "Buy-to-keep books", "Library + account"], cannot: ["Catalog CRUD", "(that’s admin)"], name: "Parent" },
    { key: "userCog", col: C.purple, entry: "Separate admin account", can: ["Book & category CRUD", "Draft → publish → archive", "Per-page story content"], cannot: ["Kid/parent shopping", "flows"], name: "Admin" },
  ];
  surfs.forEach((sf, i) => {
    const x = c[i].x, w = c[i].w;
    card(s, x, top, w, ch);
    // colored header band (rounded top via roundRect behind, rect bottom cover)
    s.addShape("roundRect", { x, y: top, w, h: 1.16, rectRadius: 0.16, fill: { color: sf.col }, line: { type: "none" } });
    s.addShape("rectangle", { x, y: top + 0.66, w, h: 0.5, fill: { color: sf.col }, line: { type: "none" } });
    iconChip(s, sf.key, x + 0.32, top + 0.28, 0.62, C.white, { variant: sf.col === C.gold ? "ink" : "ink", shadow: false });
    s.addText(sf.name, { x: x + 1.06, y: top + 0.28, w: w - 1.2, h: 0.62, fontFace: F.display, fontSize: 21, bold: true, color: C.white, valign: "middle" });
    s.addText(sf.entry, { x: x + 0.34, y: top + 1.28, w: w - 0.68, h: 0.32, fontFace: F.body, fontSize: 10.5, italic: true, color: C.inkSoft });
    s.addText("CAN DO", { x: x + 0.34, y: top + 1.66, w: w - 0.68, h: 0.26, fontFace: F.body, fontSize: 9.5, bold: true, color: sf.col, charSpacing: 1 });
    s.addText(sf.can.map((t) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true } })), {
      x: x + 0.36, y: top + 1.94, w: w - 0.72, h: 1.25, fontFace: F.body, fontSize: 11.5, color: C.ink, valign: "top", lineSpacingMultiple: 1.08, paraSpaceAfter: 4,
    });
    s.addText("CANNOT", { x: x + 0.34, y: top + 3.24, w: w - 0.68, h: 0.26, fontFace: F.body, fontSize: 9.5, bold: true, color: C.inkSoft, charSpacing: 1 });
    s.addText(sf.cannot.map((t) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true } })), {
      x: x + 0.36, y: top + 3.5, w: w - 0.72, h: 0.8, fontFace: F.body, fontSize: 11.5, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.08, paraSpaceAfter: 3,
    });
  });
  footer(s, 5);
})();

// ============================================================
// SLIDE 6 — Core feature set
// ============================================================
(function features() {
  const s = pptx.addSlide(); bg(s);
  header(s, "What’s built", "Feature set across every surface");
  const top = 1.82, gap = 0.3;
  const c = cols(2, gap), ch = 2.28, rowGap = 0.26;
  const quads = [
    { key: "bookReader", col: C.teal, t: "Kid surface", items: ["Discover page + filtered catalog grid", "Age filter chips (2–4, 4–6, 6–8, 8+)", "Paper-flip reader, immersive full-screen", "Locked books → gentle “Ask a grown-up”"] },
    { key: "key", col: C.coral, t: "Parent surface · PIN-gated", items: ["Kid ↔ Parent toggle via 4-digit PIN", "Subscription status, expiry & renew", "Buy-to-keep individual books", "Owned library survives cancellation"] },
    { key: "creditCard", col: C.gold, t: "Checkout · mock Stripe-style", items: ["Pre-filled demo card, test-mode badge", "“Simulate declined card” failure path", "Confetti + toast on success", "Handles purchase & subscription types"] },
    { key: "slidersH", col: C.purple, t: "Admin surface", items: ["Full catalog CRUD + soft archive", "Slide-based content editor (cover → pages)", "Per-page text with character counter", "Draft → Published → Archived lifecycle"] },
  ];
  quads.forEach((q, i) => {
    const col = c[i % 2], row = Math.floor(i / 2);
    const x = col.x, y = top + row * (ch + rowGap), w = col.w;
    card(s, x, y, w, ch);
    iconChip(s, q.key, x + 0.32, y + 0.3, 0.6, q.col);
    s.addText(q.t, { x: x + 1.06, y: y + 0.3, w: w - 1.2, h: 0.6, fontFace: F.display, fontSize: 16, bold: true, color: C.ink, valign: "middle" });
    s.addText(q.items.map((t) => ({ text: t, options: { bullet: { indent: 15 }, breakLine: true } })), {
      x: x + 0.36, y: y + 1.02, w: w - 0.72, h: 1.16, fontFace: F.body, fontSize: 11.8, color: C.ink, valign: "top", lineSpacingMultiple: 1.08, paraSpaceAfter: 4,
    });
  });
  footer(s, 6);
})();

// ============================================================
// SLIDE 7 — Access control engine
// ============================================================
(function access() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Access control", "One function, strict priority");
  const top = 1.85;
  // Left: priority ladder
  const lw = 5.1;
  const rungs = [
    { ic: "userCog", col: C.purple, t: "ADMIN", d: "Always full access — before any DB check" },
    { ic: "gift", col: C.green, t: "FREE", d: "priceCents === 0 → always readable" },
    { ic: "check", col: C.teal, t: "OWNED", d: "Has a Purchase record for this book" },
    { ic: "sync", col: C.blue, t: "SUBSCRIPTION", d: "Active, non-expired subscription" },
    { ic: "lock", col: C.inkSoft, t: "LOCKED", d: "None of the above" },
  ];
  let y = top;
  const rh = 0.72, rgap = 0.12;
  rungs.forEach((r, i) => {
    card(s, MX, y, lw, rh, { r: 0.13, shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, r.ic, MX + 0.16, y + 0.14, rh - 0.28, r.col, { shadow: false, inset: 0.28 });
    s.addText(r.t, { x: MX + 0.9, y: y + 0.06, w: 2.0, h: rh - 0.12, fontFace: F.display, fontSize: 15, bold: true, color: C.ink, valign: "middle" });
    s.addText(r.d, { x: MX + 2.55, y: y + 0.06, w: lw - 2.65, h: rh - 0.12, fontFace: F.body, fontSize: 10.3, color: C.inkSoft, valign: "middle", lineSpacingMultiple: 1.0 });
    if (i < rungs.length - 1) s.addText("▼", { x: MX + 0.42, y: y + rh - 0.05, w: 0.4, h: rgap + 0.08, align: "center", valign: "middle", fontSize: 8, color: C.line });
    y += rh + rgap;
  });

  // Right: real code card
  const rx = MX + lw + 0.45, rw = PAGEW - MX - rx;
  card(s, rx, top, rw, 3.62, { fill: C.codeBg, line: false, shadowOpts: { opacity: 0.16 } });
  s.addText("access.service.ts", { x: rx + 0.3, y: top + 0.22, w: rw - 0.6, h: 0.3, fontFace: F.mono, fontSize: 11, bold: true, color: C.inkSoft });
  const code = [
    [["export async function ", C.pink], ["resolveAccess", C.gold], ["(user, book) {", C.codeText]],
    [["  if (user.role === ", C.codeText], ["'ADMIN'", C.green], [")  return ", C.codeText], ["ADMIN", C.purple], [";", C.codeText]],
    [["  if (book.priceCents === ", C.codeText], ["0", C.teal], [")  return ", C.codeText], ["FREE", C.green], [";", C.codeText]],
    [["  if (await ownsBook(...))     return ", C.codeText], ["OWNED", C.teal], [";", C.codeText]],
    [["  if (await hasActiveSub(...)) return ", C.codeText], ["SUBSCRIPTION", C.blue], [";", C.codeText]],
    [["  return ", C.codeText], ["LOCKED", C.inkSoft], [";", C.codeText]],
    [["}", C.codeText]],
  ];
  s.addText(
    code.map((line, li) => {
      const runs = line.map(([t, col]) => ({ text: t, options: { color: col } }));
      runs[runs.length - 1].options.breakLine = true;
      return runs;
    }).flat(),
    { x: rx + 0.3, y: top + 0.62, w: rw - 0.6, h: 2.9, fontFace: F.mono, fontSize: 12.5, valign: "top", lineSpacingMultiple: 1.32 }
  );

  // Oyen holding the lock, tucked under the code card
  mascot(s, "oyen_5", { x: rx, y: top + 3.75, h: 1.25 });
  // verified-by-test note, to the right of the mascot
  const vx = rx + 1.25, vw = PAGEW - MX - vx, vy = top + 3.78;
  card(s, vx, vy, vw, 1.15, { fill: T.green, line: false, shadow: false });
  iconChip(s, "check", vx + 0.22, vy + 0.33, 0.5, C.success, { shadow: false });
  s.addText(
    [
      { text: "Verified by unit test.  ", options: { fontFace: F.display, fontSize: 12.5, bold: true, color: C.ink } },
      { text: "OWNED short-circuits before SUBSCRIPTION — the subscription query never runs when a book is owned. 8 cases, all passing.", options: { fontFace: F.body, fontSize: 11, color: C.ink } },
    ],
    { x: vx + 0.86, y: vy, w: vw - 1.05, h: 1.15, align: "left", valign: "middle", lineSpacingMultiple: 1.06 }
  );

  // frontend note under the ladder (left column)
  card(s, MX, top + 4.3, lw, 0.62, { fill: C.muted, line: false, shadow: false });
  iconChip(s, "shield", MX + 0.18, top + 4.41, 0.4, C.teal, { shadow: false });
  s.addText("Frontend mirrors it in two layers — route guards + a component-level PIN gate.", {
    x: MX + 0.74, y: top + 4.3, w: lw - 0.92, h: 0.62, fontFace: F.body, fontSize: 11, italic: true, color: C.ink, valign: "middle", lineSpacingMultiple: 1.05,
  });
  footer(s, 7);
})();

// ============================================================
// SLIDE 8 — Edge cases (THE highlight)
// ============================================================
(function edges() {
  const s = pptx.addSlide(); bg(s);
  header(s, "The hard part", "Edge cases we actually solved");
  const top = 1.82, ch = 4.95;
  const c = cols(4, 0.26);
  const groups = [
    { key: "exchange", col: C.coral, t: "Entitlement", cases: [["Sub expires mid-session", "Read completes; lock applies on next open"], ["Owned + subscribed", "Shows OWNED, not subscription"], ["Sub lapses", "Falls back to owned books only"]] },
    { key: "creditCard", col: C.gold, t: "Payment", cases: [["Duplicate purchase", "Idempotent — returns existing record"], ["Declined card", "Ledger logs FAILED; nothing unlocks"], ["Retry / double-charge", "Blocked by idempotencyKey"]] },
    { key: "hourglass", col: C.teal, t: "Lifecycle", cases: [["Book archived after buy", "Still readable for the owner"], ["Archived for everyone else", "Invisible in catalog"], ["Soft-delete", "ARCHIVED preserves ownership history"]] },
    { key: "shield", col: C.purple, t: "Safety", cases: [["No buy button in kid mode", "Structurally absent from the DOM"], ["PIN gate", "Before parent mode & every checkout"], ["Defense in depth", "No single failure = unwanted buy"]] },
  ];
  groups.forEach((g, i) => {
    const x = c[i].x, w = c[i].w;
    card(s, x, top, w, ch);
    s.addShape("roundRect", { x, y: top, w, h: 0.96, rectRadius: 0.16, fill: { color: g.col }, line: { type: "none" } });
    s.addShape("rectangle", { x, y: top + 0.5, w, h: 0.46, fill: { color: g.col }, line: { type: "none" } });
    iconChip(s, g.key, x + 0.22, top + 0.22, 0.52, C.white, { variant: "ink", shadow: false });
    s.addText(g.t, { x: x + 0.82, y: top + 0.22, w: w - 0.9, h: 0.52, fontFace: F.display, fontSize: 15, bold: true, color: C.white, valign: "middle" });
    let y = top + 1.18;
    const caseH = 1.22;
    g.cases.forEach(([t, d]) => {
      iconChip(s, "checkPlain", x + 0.22, y + 0.04, 0.32, g.col, { shadow: false, inset: 0.24 });
      s.addText(t, { x: x + 0.62, y: y, w: w - 0.78, h: 0.46, fontFace: F.display, fontSize: 11.8, bold: true, color: C.ink, valign: "top", lineSpacingMultiple: 0.98 });
      s.addText(d, { x: x + 0.62, y: y + 0.48, w: w - 0.82, h: 0.66, fontFace: F.body, fontSize: 10.2, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.06 });
      y += caseH;
    });
  });
  footer(s, 8);
})();

// ============================================================
// SLIDE 9 — System architecture
// ============================================================
(function arch() {
  const s = pptx.addSlide(); bg(s);
  header(s, "System design", "A pnpm monorepo with shared contracts");
  const top = 2.0;
  // three boxes: web  <->  api  <-  shared
  const boxW = 3.5, boxH = 2.4, gapX = 1.15;
  const x1 = MX + 0.3, x2 = x1 + boxW + gapX, midY = top + 0.2;

  function stackBox(x, y, w, h, key, col, title, lines) {
    card(s, x, y, w, h, { shadowOpts: { opacity: 0.12 } });
    s.addShape("roundRect", { x, y, w, h: 0.92, rectRadius: 0.16, fill: { color: col }, line: { type: "none" } });
    s.addShape("rectangle", { x, y: y + 0.46, w, h: 0.46, fill: { color: col }, line: { type: "none" } });
    iconChip(s, key, x + 0.26, y + 0.22, 0.5, C.white, { variant: "ink", shadow: false });
    s.addText(title, { x: x + 0.86, y: y + 0.22, w: w - 1, h: 0.5, fontFace: F.display, fontSize: 16, bold: true, color: C.white, valign: "middle" });
    s.addText(lines.map((t) => ({ text: t, options: { bullet: { indent: 13 }, breakLine: true } })), {
      x: x + 0.34, y: y + 1.06, w: w - 0.68, h: h - 1.2, fontFace: F.body, fontSize: 12, color: C.ink, valign: "top", lineSpacingMultiple: 1.12, paraSpaceAfter: 4,
    });
  }
  stackBox(x1, midY, boxW, boxH, "react", C.teal, "apps/web", ["React 19 + Vite 8", "TanStack Query v5", "Tailwind v4 · shadcn/ui", "Framer Motion"]);
  stackBox(x2, midY, boxW, boxH, "server", C.coral, "apps/api", ["Express 5 + TypeScript", "Prisma 5 → PostgreSQL", "JWT + bcrypt · Zod", "Vitest"]);
  // shared box below, centered under the gap
  const sx = (x1 + x2 + boxW) / 2 - boxW / 2, sy = midY + boxH + 0.55;
  stackBox(sx, sy, boxW, 1.55, "cube", C.purple, "packages/shared", ["TypeScript DTOs & contracts", "BookWithAccess · AccessResult · UserDTO"]);

  // arrows: web <-> api (double), api/web <- shared
  s.addText("◀ HTTP / JSON ▶", { x: x1 + boxW, y: midY + 0.55, w: gapX, h: 0.4, align: "center", valign: "middle", fontFace: F.body, fontSize: 9.5, bold: true, color: C.inkSoft });
  s.addShape("line", { x: x1 + boxW, y: midY + boxH / 2, w: gapX, h: 0, line: { color: C.inkSoft, width: 1.75, endArrowType: "triangle", beginArrowType: "triangle" } });
  // shared up-arrows
  s.addShape("line", { x: sx + boxW * 0.3, y: sy, w: 0, h: -0.55, line: { color: C.purple, width: 1.75, endArrowType: "triangle" } });
  s.addShape("line", { x: sx + boxW * 0.7, y: sy, w: 0, h: -0.55, line: { color: C.purple, width: 1.75, endArrowType: "triangle" } });
  s.addText("imported by\nweb + api", { x: sx + boxW + 0.2, y: sy + 0.35, w: 2.5, h: 0.8, fontFace: F.body, fontSize: 10.5, italic: true, color: C.inkSoft, valign: "middle", lineSpacingMultiple: 1.05 });

  // right rail: API surface stat
  const rx = x2 + boxW + 0.7, rw = PAGEW - MX - rx;
  if (rw > 1.8) {
    card(s, rx, midY, rw, boxH + 0.55 + 1.55, { fill: C.ink });
    s.addText("16", { x: rx, y: midY + 0.3, w: rw, h: 1.0, align: "center", fontFace: F.display, fontSize: 54, bold: true, color: C.gold });
    s.addText("REST endpoints", { x: rx, y: midY + 1.25, w: rw, h: 0.3, align: "center", fontFace: F.body, fontSize: 11, bold: true, color: C.codeText });
    s.addText(
      ["Auth · books · content", "payments · library", "categories", "Role-gated, Zod-validated"].map((t) => ({ text: t, options: { breakLine: true, align: "center" } })),
      { x: rx + 0.15, y: midY + 1.9, w: rw - 0.3, h: 2.0, fontFace: F.body, fontSize: 11, color: C.codeText, valign: "top", lineSpacingMultiple: 1.3, align: "center" }
    );
  }
  footer(s, 9);
})();

// ============================================================
// SLIDE 10 — Data model
// ============================================================
(function dataModel() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Data model", "Entities, and the decisions behind them");
  const top = 1.85;
  // Left: entity map
  const lw = 6.5;
  card(s, MX, top, lw, 4.7, { fill: C.card });
  const entities = [
    { n: "User", x: 0.55, y: 0.5, col: C.coral, f: "role · onboarding" },
    { n: "Book", x: 3.7, y: 0.5, col: C.teal, f: "status · priceCents" },
    { n: "Subscription", x: 0.55, y: 1.85, col: C.blue, f: "ACTIVE · expiresAt" },
    { n: "Purchase", x: 3.7, y: 1.85, col: C.purple, f: "@@unique userId+bookId" },
    { n: "Payment", x: 0.55, y: 3.2, col: C.gold, f: "idempotencyKey" },
    { n: "BookPage", x: 3.7, y: 3.2, col: C.green, f: "@@unique bookId+index" },
  ];
  const ew = 2.7, eh = 1.0;
  entities.forEach((e) => {
    const ex = MX + e.x, ey = top + e.y;
    s.addShape("roundRect", { x: ex, y: ey, w: ew, h: eh, rectRadius: 0.12, fill: { color: C.bg }, line: { color: e.col, width: 2 }, shadow: shadow({ opacity: 0.08, blur: 4, offset: 1 }) });
    s.addShape("roundRect", { x: ex, y: ey, w: 0.16, h: eh, rectRadius: 0.06, fill: { color: e.col }, line: { type: "none" } });
    s.addText(e.n, { x: ex + 0.28, y: ey + 0.12, w: ew - 0.4, h: 0.4, fontFace: F.display, fontSize: 14.5, bold: true, color: C.ink });
    s.addText(e.f, { x: ex + 0.28, y: ey + 0.52, w: ew - 0.4, h: 0.36, fontFace: F.mono, fontSize: 9.5, color: C.inkSoft });
  });
  // relationship hints
  s.addText("1:N", { x: MX + 3.25, y: top + 0.5, w: 0.45, h: 1.0, align: "center", valign: "middle", fontFace: F.body, fontSize: 9, bold: true, color: C.inkSoft });

  // Right: design decisions
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  s.addText("Design decisions", { x: rx, y: top, w: rw, h: 0.4, fontFace: F.display, fontSize: 15, bold: true, color: C.ink });
  const decs = [
    ["tag", C.coral, "pricePaidCents snapshot", "Purchase records the price paid — independent of later price changes."],
    ["fingerprint", C.gold, "idempotencyKey on Payment", "A retried request can never double-charge."],
    ["clock", C.blue, "expiresAt > NOW() server-side", "The server never trusts client-held subscription state."],
    ["hourglass", C.green, "ARCHIVED soft-delete", "Books are archived, never destroyed — ownership history survives."],
  ];
  let y = top + 0.5;
  decs.forEach(([ic, col, t, d]) => {
    card(s, rx, y, rw, 0.96, { shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, ic, rx + 0.22, y + 0.23, 0.5, col, { shadow: false });
    s.addText(
      [
        { text: t, options: { fontFace: F.display, fontSize: 12.5, bold: true, color: C.ink, breakLine: true } },
        { text: d, options: { fontFace: F.body, fontSize: 10.5, color: C.inkSoft } },
      ],
      { x: rx + 0.88, y: y + 0.08, w: rw - 1.05, h: 0.8, align: "left", valign: "middle", lineSpacingMultiple: 1.04 }
    );
    y += 1.06;
  });
  footer(s, 10);
})();

// ============================================================
// SLIDE 11 — Monetization
// ============================================================
(function monetization() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Monetization", "Two ways to pay — never merged");
  const top = 1.9, ch = 3.55;
  const c = cols(3, 0.34);
  const tiers = [
    { key: "gift", col: C.green, tint: T.green, name: "Free", price: "Rp 0", tagline: "Taste of product", pts: ["Open to any logged-in user", "Always accessible", "Acquisition / discovery hook"] },
    { key: "infinity", col: C.coral, tint: T.coral, name: "Subscription", price: "Rp 49.000 / mo", tagline: "The whole library", pts: ["Unlimited access while active", "Includes books added later", "Renews +30 days, no error"], feat: true },
    { key: "crown", col: C.purple, tint: T.purple, name: "Buy-to-keep", price: "Per book", tagline: "Own it forever", pts: ["Permanent ownership", "Survives subscription churn", "Buy even while subscribed"] },
  ];
  tiers.forEach((t, i) => {
    const x = c[i].x, w = c[i].w;
    const y = t.feat ? top - 0.12 : top;
    const h = t.feat ? ch + 0.24 : ch;
    card(s, x, y, w, h, { fill: t.feat ? C.ink : C.card, shadowOpts: { opacity: t.feat ? 0.18 : 0.1 } });
    if (t.feat) { const bp = pill(s, "Most complete", x + w / 2 - 0.85, y + 0.22, { fill: C.gold, color: C.ink, fontSize: 9.5, w: 1.7 }); }
    iconChip(s, t.key, x + w / 2 - 0.42, y + (t.feat ? 0.74 : 0.34), 0.84, t.col);
    const txtCol = t.feat ? C.white : C.ink;
    const subCol = t.feat ? C.codeText : C.inkSoft;
    s.addText(t.name, { x, y: y + (t.feat ? 1.74 : 1.34), w, h: 0.4, align: "center", fontFace: F.display, fontSize: 20, bold: true, color: txtCol });
    s.addText(t.price, { x, y: y + (t.feat ? 2.14 : 1.74), w, h: 0.34, align: "center", fontFace: F.display, fontSize: 13, bold: true, color: t.col === C.green ? C.green : (t.feat ? C.gold : t.col) });
    s.addText(t.tagline, { x, y: y + (t.feat ? 2.46 : 2.06), w, h: 0.3, align: "center", fontFace: F.body, fontSize: 11, italic: true, color: subCol });
    s.addText(t.pts.map((p) => ({ text: p, options: { bullet: { indent: 14 }, breakLine: true } })), {
      x: x + 0.5, y: y + (t.feat ? 2.86 : 2.46), w: w - 0.9, h: 0.95, fontFace: F.body, fontSize: 11, color: t.feat ? C.codeText : C.ink, valign: "top", lineSpacingMultiple: 1.1, paraSpaceAfter: 3,
    });
  });
  // bottom note + chest scene
  const ny = top + ch + 0.35;
  card(s, MX, ny, PAGEW - 2 * MX, 0.84, { fill: T.gold, line: false, shadow: false });
  mascot(s, "scene_chest", { x: MX + 0.3, y: ny - 0.42, h: 1.5 });
  s.addText(
    [
      { text: "Ownership and subscription are independent entitlements.  ", options: { fontFace: F.display, fontSize: 13.5, bold: true, color: C.ink } },
      { text: "Tracked separately, never merged — so a cancelled subscriber still keeps every book they bought.", options: { fontFace: F.body, fontSize: 12, color: C.ink } },
    ],
    { x: MX + 1.9, y: ny, w: PAGEW - 2 * MX - 2.2, h: 0.84, align: "left", valign: "middle", lineSpacingMultiple: 1.06 }
  );
  footer(s, 11);
})();

// ============================================================
// SLIDE 12 — Roadmap
// ============================================================
(function roadmap() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Where it goes", "Now · Next · Later");
  const top = 1.9, ch = 4.35;
  const c = cols(3, 0.34);
  const phases = [
    { tag: "Now", sub: "MVP — shipped", col: C.success, tint: T.green, key: "check", items: ["Three surfaces + PIN gate", "Two monetization models", "Buy-to-keep + renew", "Paper-flip reader + reward", "4-step onboarding", "Admin CRUD", "Access engine + 8 tests"] },
    { tag: "Next", sub: "Post-MVP", col: C.coral, tint: T.coral, key: "rocket", items: ["Real illustrated art + audio", "Word highlighting (pre-readers)", "Multi-child profiles + history", "Search · ID/EN localization", "Analytics dashboard", "Subscription tiers"] },
    { tag: "Later", sub: "Scale & trust", col: C.purple, tint: T.purple, key: "compass", items: ["Real payments + webhooks", "Grace periods + refunds", "COPPA / GDPR-K compliance", "Screen Time / Family Link", "Offline downloads · gifting", "Teacher / classroom mode"] },
  ];
  phases.forEach((p, i) => {
    const x = c[i].x, w = c[i].w;
    card(s, x, top, w, ch);
    s.addShape("roundRect", { x, y: top, w, h: 1.04, rectRadius: 0.16, fill: { color: p.col }, line: { type: "none" } });
    s.addShape("rectangle", { x, y: top + 0.54, w, h: 0.5, fill: { color: p.col }, line: { type: "none" } });
    iconChip(s, p.key, x + 0.3, top + 0.26, 0.54, C.white, { variant: "ink", shadow: false });
    s.addText(p.tag, { x: x + 0.98, y: top + 0.2, w: w - 1.1, h: 0.4, fontFace: F.display, fontSize: 20, bold: true, color: C.white, valign: "middle" });
    s.addText(p.sub.toUpperCase(), { x: x + 0.98, y: top + 0.62, w: w - 1.1, h: 0.3, fontFace: F.body, fontSize: 9, bold: true, color: C.white, charSpacing: 1 });
    s.addText(p.items.map((t) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true } })), {
      x: x + 0.36, y: top + 1.24, w: w - 0.72, h: ch - 1.4, fontFace: F.body, fontSize: 11.8, color: C.ink, valign: "top", lineSpacingMultiple: 1.12, paraSpaceAfter: 5,
    });
  });
  footer(s, 12);
})();

// ============================================================
// SLIDE 13 — Success metrics
// ============================================================
(function metrics() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Measuring success", "Metrics tied to real events");
  const top = 1.9;
  // Left: funnel chart card
  const lw = 5.3, lh = 4.5;
  card(s, MX, top, lw, lh);
  s.addText("Month-3 plan", { x: MX + 0.35, y: top + 0.26, w: lw - 0.7, h: 0.34, fontFace: F.display, fontSize: 14, bold: true, color: C.ink });
  s.addText("Acquisition → activation → revenue", { x: MX + 0.35, y: top + 0.62, w: lw - 0.7, h: 0.3, fontFace: F.body, fontSize: 10.5, italic: true, color: C.inkSoft });
  s.addChart(
    pptx.ChartType.bar,
    [{ name: "Plan", labels: ["Registered", "Activated", "Paying"], values: [500, 300, 50] }],
    {
      x: MX + 0.25, y: top + 1.0, w: lw - 0.5, h: lh - 1.3,
      barDir: "col", chartColors: [C.coral], showLegend: false, showValue: true,
      dataLabelColor: C.ink, dataLabelFontFace: F.display, dataLabelFontSize: 13, dataLabelFontBold: true, dataLabelPosition: "outEnd",
      catAxisLabelColor: C.ink, catAxisLabelFontFace: F.body, catAxisLabelFontSize: 11, catAxisLabelFontBold: true,
      valAxisHidden: true, valGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false,
      barGapWidthPct: 55, chartColorsOpacity: [100],
    }
  );
  // Right: metric cards
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  const ms = [
    ["bolt", C.coral, "Activation", "New accounts that open ≥1 book in week 1 · read-content events ÷ new users"],
    ["exchange", C.teal, "Free → paid conversion", "First successful payment ÷ users"],
    ["chartBar", C.gold, "Monetization mix", "Revenue grouped by payment type (sub vs one-time)"],
    ["sync", C.blue, "Retention / churn", "Subscription renewals vs lapses"],
    ["heart", C.purple, "ARPU / LTV", "Revenue ÷ active users; cohort projection"],
  ];
  const mh = 0.8, mgap = 0.12;
  let y = top;
  ms.forEach(([ic, col, t, d]) => {
    card(s, rx, y, rw, mh, { shadowOpts: { opacity: 0.08, blur: 4, offset: 2 } });
    iconChip(s, ic, rx + 0.18, y + 0.15, 0.5, col, { shadow: false });
    s.addText(
      [
        { text: t + "   ", options: { fontFace: F.display, fontSize: 12.5, bold: true, color: C.ink } },
        { text: d, options: { fontFace: F.body, fontSize: 10, color: C.inkSoft } },
      ],
      { x: rx + 0.82, y: y + 0.04, w: rw - 1.0, h: mh - 0.08, align: "left", valign: "middle", lineSpacingMultiple: 1.02 }
    );
    y += mh + mgap;
  });
  footer(s, 13);
})();

// ============================================================
// SLIDE 14 — Trade-offs
// ============================================================
(function tradeoffs() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Trade-offs", "What we cut — and why it’s the right cut");
  const top = 1.82, gap = 0.3;
  const c = cols(2, gap), ch = 0.92, rowGap = 0.16;
  const items = [
    ["lock", C.coral, "Mocked payments", "Real Midtrans/Stripe", "Proves access & commerce flows without provider onboarding."],
    ["fingerprint", C.purple, "Client-side PIN (demo)", "Hashed server PIN", "Scoped for the demo; production moves it server-side."],
    ["sync", C.blue, "DB check per API call", "Cache sub in JWT claims", "Accuracy over speed — sub status can change any moment."],
    ["feather", C.teal, "Audio narration cut", "Ship with narration", "Placeholder-first proves the model before content cost."],
    ["users", C.gold, "Single-child assumption", "Multi-child profiles", "Valid for a first cohort; child-switching adds real UX cost."],
    ["bolt", C.green, "Filter, not search", "Full search", "Category + age covers discovery at 8-book scale."],
  ];
  items.forEach((it, i) => {
    const col = c[i % 2], row = Math.floor(i / 2);
    const x = col.x, y = top + row * (ch + rowGap), w = col.w;
    const [ic, color, chosen, alt, why] = it;
    card(s, x, y, w, ch, { shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, ic, x + 0.22, y + 0.21, 0.5, color, { shadow: false });
    s.addText(
      [
        { text: chosen, options: { fontFace: F.display, fontSize: 13, bold: true, color: C.ink } },
        { text: "   ✕ " + alt, options: { fontFace: F.body, fontSize: 9.5, color: C.inkSoft } },
        { text: "\n" + why, options: { fontFace: F.body, fontSize: 10.6, color: C.inkSoft } },
      ],
      { x: x + 0.86, y: y + 0.08, w: w - 1.05, h: ch - 0.16, align: "left", valign: "middle", lineSpacingMultiple: 1.06 }
    );
  });
  footer(s, 14);
})();

// ============================================================
// SLIDE 15 — How AI tools were used
// ============================================================
(function aiUsage() {
  const s = pptx.addSlide(); bg(s);
  header(s, "AI usage", "A pair programmer, not autopilot");
  const top = 1.85;
  const lw = 6.7;
  // Left: workflow
  s.addText("Where AI helped", { x: MX, y: top, w: lw, h: 0.4, fontFace: F.display, fontSize: 15, bold: true, color: C.ink });
  const flow = [
    ["compass", C.coral, "Architecture validation", "Designed the data model & API by hand, then used AI to stress-test edge cases (idempotency, sub expiry)."],
    ["puzzle", C.teal, "Component scaffolding", "Generated shadcn boilerplate (ChunkyButton, ParentGate OTP), then iterated on states & a11y."],
    ["shield", C.purple, "Edge-case enumeration", "Prompted for every access edge case, then validated the resolveAccess priority against them."],
    ["magic", C.gold, "UI polish iterations", "Described intent in natural language; refined spacing, tokens, and responsive layout."],
    ["flask", C.blue, "Test generation", "Drafted the Vitest cases; reviewed each, and added the OWNED-before-SUBSCRIPTION test by hand."],
  ];
  let y = top + 0.5;
  flow.forEach(([ic, col, t, d]) => {
    iconRow(s, MX, y, lw, ic, col, t, d, { d: 0.56, titleSize: 13.5, descSize: 11, rowH: 0.92 });
    y += 0.94;
  });

  // Right: human override card
  const rx = MX + lw + 0.45, rw = PAGEW - MX - rx;
  card(s, rx, top, rw, 4.7, { fill: C.ink });
  iconChip(s, "balance", rx + 0.32, top + 0.32, 0.72, C.gold, { variant: "ink", shadow: false });
  s.addText("Where human judgment\noverrode AI", { x: rx + 1.2, y: top + 0.3, w: rw - 1.4, h: 0.8, fontFace: F.display, fontSize: 16, bold: true, color: C.white, valign: "middle", lineSpacingMultiple: 0.98 });
  const ovr = [
    ["Moved the subscription check server-side", "AI suggested caching it in JWT claims for speed — accuracy won."],
    ["Kept pricePaidCents on Purchase", "AI initially stored only bookId; price-at-purchase must persist."],
    ["Chose soft-delete (ARCHIVED)", "Physical delete would have destroyed ownership history."],
  ];
  let oy = top + 1.4;
  ovr.forEach(([t, d]) => {
    iconChip(s, "checkPlain", rx + 0.34, oy + 0.04, 0.34, C.teal, { shadow: false, inset: 0.24 });
    s.addText(
      [
        { text: t, options: { fontFace: F.display, fontSize: 12.5, bold: true, color: C.gold, breakLine: true } },
        { text: d, options: { fontFace: F.body, fontSize: 11, color: C.codeText } },
      ],
      { x: rx + 0.82, y: oy - 0.04, w: rw - 1.05, h: 1.0, align: "left", valign: "top", lineSpacingMultiple: 1.08 }
    );
    oy += 1.08;
  });
  footer(s, 15);
})();

// ============================================================
// SLIDE 16 — Summary & deliverables
// ============================================================
(function summary() {
  const s = pptx.addSlide(); bg(s);
  // soft disc + celebrating mascot, top-right (kept clear of the deliverables card)
  s.addShape("ellipse", { x: 10.2, y: 2.0, w: 3.0, h: 3.0, fill: { color: T.teal }, line: { type: "none" } });
  mascot(s, "oyen_3", { x: 10.25, y: 1.9, h: 3.05 });

  pill(s, "In summary", MX, 0.7, { fill: C.coral, color: C.white, fontSize: 12 });
  s.addText("Built with no shortcuts on the hard parts", {
    x: MX - 0.02, y: 1.12, w: 9.5, h: 0.7, fontFace: F.display, fontSize: 28, bold: true, color: C.ink, valign: "middle",
  });

  const highlights = [
    ["exchange", C.coral, "Dual entitlement, clean", "Subscription + buy-to-keep coexist; ownership survives churn & archival."],
    ["lock", C.teal, "Access engine, tested", "One resolveAccess() with strict priority — 8 passing unit cases."],
    ["shield", C.purple, "Kid mode is genuinely safe", "Purchase UI is structurally absent; PIN gate throughout."],
    ["cube", C.gold, "Shared type safety", "One packages/shared — zero DTO duplication, strict TS everywhere."],
  ];
  let y = 2.05;
  highlights.forEach(([ic, col, t, d]) => {
    iconRow(s, MX, y, 8.7, ic, col, t, d, { d: 0.58, titleSize: 14, descSize: 11.2, rowH: 0.92 });
    y += 0.92;
  });

  // deliverables card (full-width bottom)
  const dy = 5.92;
  card(s, MX, dy, PAGEW - 2 * MX, 1.05, { fill: C.ink, shadowOpts: { opacity: 0.14 } });
  const dcols = cols(3, 0.3, MX + 0.3, PAGEW - 2 * MX - 0.6);
  const delivs = [
    ["user", "Demo accounts", "parent@demo.com · admin@demo.com · pw: password"],
    ["key", "Parent PIN", "1234  (shown on the login screen for reviewers)"],
    ["link", "Deploy targets", "Render (API) + Vercel (web) — URLs to be added"],
  ];
  delivs.forEach((d, i) => {
    const x = dcols[i].x, w = dcols[i].w;
    iconChip(s, d[0], x, dy + 0.28, 0.5, C.coral, { shadow: false });
    s.addText(
      [
        { text: d[1], options: { fontFace: F.display, fontSize: 12, bold: true, color: C.gold, breakLine: true } },
        { text: d[2], options: { fontFace: F.body, fontSize: 9.8, color: C.codeText } },
      ],
      { x: x + 0.64, y: dy + 0.18, w: w - 0.7, h: 0.72, align: "left", valign: "middle", lineSpacingMultiple: 1.04 }
    );
  });
  s.addText("16", { x: PAGEW - MX - 1, y: PAGEH - 0.46, w: 1, h: 0.3, fontSize: 9, align: "right", valign: "middle", color: C.inkSoft, fontFace: F.body, bold: true });
})();

const OUT = path.join(__dirname, "Storybook.pptx");
pptx.writeFile({ fileName: OUT }).then(() => console.log("Wrote " + OUT)).catch((e) => { console.error(e); process.exit(1); });
