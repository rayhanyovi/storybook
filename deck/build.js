/* Storybook — Product Design & Engineering deck (v2).
 * On-brand (warm cream, Fredoka/Nunito, real Oyen art). Run: node build.js
 * Structure: Overview · Personas · Meet Oyen · Design System · Problems · Features · Technical */
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const ASSETS = path.join(__dirname, "assets");
const ICONS = path.join(__dirname, "icons");
const asset = (f) => path.join(ASSETS, f);
const icon = (key, v = "white") => path.join(ICONS, `${key}_${v}.png`);

// ---- Design tokens (verbatim from apps/web/src/index.css) ----
const C = {
  bg: "FBF3E7", card: "FFFDF9", muted: "F3E9D8", ink: "3A2E28", inkSoft: "8A7A6D", line: "ECE0CE",
  coral: "FF7B54", coralDark: "F2603A", gold: "FFC93C", goldDark: "F0B523", peach: "FFB084",
  teal: "2EC4B6", blue: "4CB9E7", purple: "A78BFA", green: "7BC950", pink: "FF8FB1",
  success: "58CC02", warning: "FFB020", destructive: "FF4B4B", info: "1CB0F6",
  white: "FFFFFF", codeBg: "2A211C", codeText: "F3E3D2",
};
const T = { coral: "FFE3D7", gold: "FFEFC4", teal: "D9F3EF", blue: "DDF0FB", purple: "ECE6FE", green: "E6F4D8", pink: "FFE4EC" };
const F = { display: "Fredoka", body: "Nunito", mono: "Consolas" };

// Real-art aspect ratios (w/h), measured from the PNGs in /assets
const RATIO = {
  n1: 0.8844, n2: 0.8722, n3: 0.97, n4: 0.8533, n5: 0.88,
  n6: 0.7294, n7: 0.8364, n8: 0.6103, n9: 0.8756, n10: 0.9123,
  n11: 1.1554, n12: 1.2619, n13: 1.2886, n14: 0.9825, n15: 1.1438,
  ntreasure: 0.972, cov_star: 1.3333, cov_count: 1.3333, cov_jungle: 1.25, cov_boat: 1.3333,
};

const PAGEW = 13.333, PAGEH = 7.5, MX = 0.6;
const shadow = (o = {}) => ({ type: "outer", color: o.color || "3A2E28", blur: o.blur ?? 9, offset: o.offset ?? 3, angle: 90, opacity: o.opacity ?? 0.1 });

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Muhammad Rayhan Yovi";
pptx.title = "Storybook — Product Design & Engineering";

// ---------- helpers ----------
function cols(n, gap = 0.3, x0 = MX, totalW = PAGEW - 2 * MX) {
  const w = (totalW - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: x0 + i * (w + gap), w }));
}
function bg(slide, color = C.bg) { slide.background = { color }; }

function pill(slide, text, x, y, o = {}) {
  const fs = o.fontSize || 11;
  const h = o.h || 0.34;
  const w = o.w || 0.38 + String(text).length * (fs * 0.0103);
  slide.addShape("roundRect", { x, y, w, h, rectRadius: h / 2, fill: { color: o.fill || C.muted }, line: o.line ? { color: o.line, width: 1 } : { type: "none" } });
  slide.addText(o.upper === false ? text : String(text).toUpperCase(), { x, y, w, h, align: "center", valign: "middle", fontFace: F.body, fontSize: fs, bold: true, color: o.color || C.ink, charSpacing: o.charSpacing ?? 0.6 });
  return { w, h };
}

// section-aware header: kicker pill colored per section
function header(slide, kicker, title, o = {}) {
  pill(slide, kicker, MX, 0.46, { fill: o.kickerFill || C.coral, color: o.kickerColor || C.white });
  slide.addText(title, { x: MX - 0.02, y: 0.84, w: o.titleW || PAGEW - 2 * MX, h: 0.72, fontFace: F.display, fontSize: o.titleSize || 30, bold: true, color: C.ink, align: "left", valign: "middle" });
}

function footer(slide, n, section) {
  slide.addText(
    [
      { text: "Storybook", options: { bold: true, color: C.ink, fontFace: F.display } },
      { text: section ? "   " + section : "   Product Design & Engineering", options: { color: C.inkSoft, fontFace: F.body } },
    ],
    { x: MX, y: PAGEH - 0.46, w: 8, h: 0.3, fontSize: 9, align: "left", valign: "middle" }
  );
  slide.addText(String(n).padStart(2, "0"), { x: PAGEW - MX - 1, y: PAGEH - 0.46, w: 1, h: 0.3, fontSize: 9, align: "right", valign: "middle", color: C.inkSoft, fontFace: F.body, bold: true });
}

function card(slide, x, y, w, h, o = {}) {
  slide.addShape("roundRect", { x, y, w, h, rectRadius: o.r ?? 0.16, fill: { color: o.fill || C.card }, line: o.line === false ? { type: "none" } : { color: o.lineColor || C.line, width: o.lineWidth || 1 }, shadow: o.shadow === false ? undefined : shadow(o.shadowOpts || {}) });
}

function iconChip(slide, key, x, y, d, fill, o = {}) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: fill }, line: { type: "none" }, shadow: o.shadow === false ? undefined : shadow({ blur: 5, offset: 2, opacity: 0.13 }) });
  const inset = d * (o.inset ?? 0.26);
  slide.addImage({ path: icon(key, o.variant || "white"), x: x + inset, y: y + inset, w: d - 2 * inset, h: d - 2 * inset });
}

function chunky(slide, text, x, y, w, h, o = {}) {
  const face = o.face || C.coral, edge = o.edge || C.coralDark, depth = o.depth ?? 0.085;
  const r = o.r ?? h * 0.32;
  slide.addShape("roundRect", { x, y: y + depth, w, h, rectRadius: r, fill: { color: edge }, line: { type: "none" } });
  slide.addShape("roundRect", { x, y, w, h, rectRadius: r, fill: { color: face }, line: { type: "none" } });
  slide.addText(text, { x, y, w, h, align: "center", valign: "middle", fontFace: F.display, fontSize: o.fontSize || 15, bold: true, color: o.color || C.white });
}

// circle-cropped avatar PNG (transparent corners)
function slideAvatar(slide, key, x, y, d) {
  slide.addImage({ path: asset(key + ".png"), x, y, w: d, h: d });
}

// bare white icon (no chip) for inside colored badges/pills
function slideTinyIcon(slide, key, x, y, d, v = "white") {
  slide.addImage({ path: icon(key, v), x, y, w: d, h: d });
}

function mascot(slide, key, o) {
  let w = o.w, h = o.h;
  if (h && !w) w = h * RATIO[key];
  if (w && !h) h = w / RATIO[key];
  slide.addImage({ path: asset(key + ".png"), x: o.x, y: o.y, w, h });
  return { w, h };
}

function iconRow(slide, x, y, w, key, fill, title, desc, o = {}) {
  const d = o.d || 0.5;
  iconChip(slide, key, x, y, d, fill, { variant: o.variant || "white", inset: o.inset });
  const tx = x + d + 0.18, tw = w - d - 0.18;
  slide.addText(
    [
      { text: title, options: { fontFace: F.display, fontSize: o.titleSize || 13.5, bold: true, color: o.titleColor || C.ink, breakLine: true } },
      { text: desc, options: { fontFace: F.body, fontSize: o.descSize || 10.8, color: o.descColor || C.inkSoft, breakLine: false } },
    ],
    { x: tx, y: y - 0.06, w: tw, h: o.rowH || d + 0.12, align: "left", valign: "middle", lineSpacingMultiple: 1.04 }
  );
}

// small color swatch with hex label (for the palette slide)
function swatch(slide, x, y, w, h, color, name, hex, o = {}) {
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.12, fill: { color }, line: o.border ? { color: C.line, width: 1 } : { type: "none" }, shadow: shadow({ opacity: 0.08, blur: 4, offset: 1 }) });
  slide.addText(
    [
      { text: name, options: { fontFace: F.display, fontSize: 10.5, bold: true, color: o.dark ? C.ink : C.white, breakLine: true } },
      { text: "#" + hex, options: { fontFace: F.mono, fontSize: 8.5, color: o.dark ? C.inkSoft : C.white } },
    ],
    { x: x + 0.12, y: y + h - 0.62, w: w - 0.2, h: 0.5, align: "left", valign: "bottom", lineSpacingMultiple: 0.98 }
  );
}

// ============================================================
// SLIDE 1 — Cover
// ============================================================
(function cover() {
  const s = pptx.addSlide(); bg(s);
  // soft accent shapes around the mascot (cream-bg-safe; mascot is transparent)
  s.addShape("ellipse", { x: 8.5, y: 1.05, w: 4.55, h: 4.55, fill: { color: T.gold }, line: { type: "none" } });
  s.addShape("ellipse", { x: 7.95, y: 4.6, w: 1.0, h: 1.0, fill: { color: T.teal }, line: { type: "none" } });
  s.addShape("ellipse", { x: 12.35, y: 1.45, w: 0.55, h: 0.55, fill: { color: T.coral }, line: { type: "none" } });
  s.addShape("ellipse", { x: 8.25, y: 1.5, w: 0.4, h: 0.4, fill: { color: T.purple }, line: { type: "none" } });
  mascot(s, "n1", { x: 9.0, y: 1.35, h: 4.95 });

  pill(s, "Product Design & Engineering", 0.92, 1.4, { fill: C.coral, color: C.white, fontSize: 11.5 });
  s.addText("Storybook", { x: 0.82, y: 1.88, w: 7.6, h: 1.5, fontFace: F.display, fontSize: 76, bold: true, color: C.ink, align: "left", valign: "middle" });
  s.addText("A paid digital library for kids — parent-first, child-safe, and built around how toddlers actually are.", { x: 0.92, y: 3.35, w: 7.1, h: 1.0, fontFace: F.body, fontSize: 17, color: C.inkSoft, align: "left", valign: "top", lineSpacingMultiple: 1.18 });
  const fp = [["Kid · Parent · Admin", C.purple], ["Subscribe + Buy-to-keep", C.teal], ["React 19 · Express 5 · Postgres", C.blue]];
  let px = 0.92;
  fp.forEach(([t, col]) => {
    const w = 0.5 + t.length * 0.092;
    s.addShape("roundRect", { x: px, y: 4.55, w, h: 0.44, rectRadius: 0.22, fill: { color: C.card }, line: { color: col, width: 1.5 } });
    s.addText(t, { x: px, y: 4.55, w, h: 0.44, align: "center", valign: "middle", fontFace: F.body, fontSize: 11, bold: true, color: C.ink });
    px += w + 0.22;
  });
  s.addText(
    [
      { text: "Muhammad Rayhan Yovi", options: { fontFace: F.display, fontSize: 18, bold: true, color: C.ink, breakLine: true } },
      { text: "Product Engineer — Technical Test", options: { fontFace: F.body, fontSize: 12, color: C.inkSoft } },
    ],
    { x: 0.92, y: 5.65, w: 7, h: 0.9, align: "left", valign: "top", lineSpacingMultiple: 1.1 }
  );
})();

// ============================================================
// SLIDE 2 — Agenda
// ============================================================
(function agenda() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Agenda", "What we'll cover", { kickerFill: C.ink });
  const items = [
    ["01", "Project Overview", "The product, the bet, the device", C.coral, "bulb"],
    ["02", "User Personas", "Kid mode & Parent mode", C.teal, "users"],
    ["03", "Meet Oyen", "The mascot that ties it together", C.gold, "heart"],
    ["04", "Design System", "Color, type, components, motion", C.purple, "magic"],
    ["05", "Problems & Edge Cases", "What we designed against", C.blue, "shield"],
    ["06", "Features", "What's built, and why it matters", C.green, "bookReader"],
    ["07", "Technical Details", "Architecture, access, data model", C.coralDark, "code"],
  ];
  const c = cols(2, 0.4);
  const top = 1.9, rh = 0.66, gap = 0.13;
  items.forEach((it, i) => {
    const col = i < 4 ? c[0] : c[1];
    const idx = i < 4 ? i : i - 4;
    const x = col.x, y = top + idx * (rh + gap), w = col.w;
    card(s, x, y, w, rh, { r: 0.13, shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, it[4], x + 0.16, y + 0.13, rh - 0.26, it[3], { shadow: false, inset: 0.28 });
    s.addText(it[0], { x: x + 0.86, y, w: 0.6, h: rh, fontFace: F.display, fontSize: 19, bold: true, color: it[3], valign: "middle" });
    s.addText(
      [
        { text: it[1] + "   ", options: { fontFace: F.display, fontSize: 14, bold: true, color: C.ink } },
        { text: it[2], options: { fontFace: F.body, fontSize: 10.5, color: C.inkSoft } },
      ],
      { x: x + 1.4, y, w: w - 1.5, h: rh, align: "left", valign: "middle", lineSpacingMultiple: 1.0 }
    );
  });
  // Oyen peeking bottom-right
  mascot(s, "n14", { x: 11.7, y: 5.55, h: 1.5 });
  footer(s, 2, "Agenda");
})();

// ============================================================
// SLIDE 3 — What is Storybook (Overview)
// ============================================================
(function overview() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Overview", "A library kids read, and parents pay for");
  const top = 1.78;
  // Left: what it is
  const lw = 6.7;
  card(s, MX, top, lw, 4.75);
  s.addText("Storybook is a cozy, tablet-first storybook library for toddlers and young kids. Parents discover and pay for safe, age-appropriate stories; children read them in a simple, delightful interface.", {
    x: MX + 0.34, y: top + 0.34, w: lw - 0.68, h: 1.2, fontFace: F.body, fontSize: 13.5, color: C.ink, valign: "top", lineSpacingMultiple: 1.22,
  });
  const facts = [
    ["store", C.coral, "Two ways to pay", "Subscribe to the whole live catalog, or buy a single book to own forever."],
    ["users", C.teal, "Three surfaces, one brand", "Kid (default) · Parent (behind a PIN) · Admin (separate role)."],
    ["shield", C.purple, "Safe by construction", "Kids never see checkout — the buy flow simply doesn't exist in their world."],
  ];
  let y = top + 1.62;
  facts.forEach(([ic, col, t, d]) => { iconRow(s, MX + 0.34, y, lw - 0.68, ic, col, t, d, { d: 0.56, titleSize: 14, descSize: 11 }); y += 1.0; });

  // Right: three surface mini-stack
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  const surf = [["child", C.teal, "Kid", "Browse & read"], ["key", C.coral, "Parent", "Subscribe & buy"], ["userCog", C.purple, "Admin", "Run the catalog"]];
  const sh = 1.42, sgap = 0.24;
  let sy = top;
  surf.forEach(([ic, col, t, d], i) => {
    card(s, rx, sy, rw, sh, { fill: col });
    iconChip(s, ic, rx + 0.3, sy + 0.46, 0.5, C.white, { variant: "ink", shadow: false });
    s.addText(t, { x: rx + 1.0, y: sy + 0.3, w: rw - 1.2, h: 0.5, fontFace: F.display, fontSize: 19, bold: true, color: C.white, valign: "middle" });
    s.addText(d, { x: rx + 1.0, y: sy + 0.76, w: rw - 1.2, h: 0.4, fontFace: F.body, fontSize: 11.5, color: C.white, valign: "middle" });
    if (i < 2) s.addText("▼", { x: rx + rw / 2 - 0.15, y: sy + sh - 0.04, w: 0.3, h: sgap, align: "center", valign: "middle", fontSize: 11, color: C.line });
    sy += sh + sgap;
  });
  footer(s, 3, "Overview");
})();

// ============================================================
// SLIDE 4 — The core product bet
// ============================================================
(function bet() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Overview", "The core product bet");
  const top = 1.85;
  card(s, MX, top, PAGEW - 2 * MX, 4.7, { fill: C.ink });
  pill(s, "Our bet", MX + 0.4, top + 0.4, { fill: C.coral, color: C.white });
  s.addText(
    [
      { text: "The child's delight drives ", options: { color: C.codeText } },
      { text: "engagement", options: { color: C.gold, bold: true } },
      { text: ",\nbut the parent's trust drives ", options: { color: C.codeText } },
      { text: "payment", options: { color: C.teal, bold: true } },
      { text: " and retention.", options: { color: C.codeText } },
    ],
    { x: MX + 0.42, y: top + 1.0, w: 8.4, h: 1.9, fontFace: F.display, fontSize: 30, bold: true, align: "left", valign: "middle", lineSpacingMultiple: 1.1 }
  );
  s.addText("So the product is two experiences in one brand — a joyful kid surface and a controlled parent surface — separated by a PIN gate. Win the child's engagement and the parent's trust, and the monetization follows.", {
    x: MX + 0.42, y: top + 3.05, w: 8.0, h: 1.3, fontFace: F.body, fontSize: 14, color: C.codeText, valign: "top", lineSpacingMultiple: 1.25,
  });
  // Oyen reading, right side
  s.addShape("ellipse", { x: 9.55, y: top + 0.7, w: 2.9, h: 2.9, fill: { color: "4A3B33" }, line: { type: "none" } });
  mascot(s, "n2", { x: 9.75, y: top + 0.65, h: 3.3 });
  footer(s, 4, "Overview");
})();

// ============================================================
// SLIDE 5 — Why tablet-first (the "iPad kid" insight)
// ============================================================
(function tabletFirst() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Overview", "Why tablet-first — knowing the buyer");
  const top = 1.8;
  // Left insight card
  const lw = 6.4;
  card(s, MX, top, lw, 4.7);
  iconChip(s, "bulb", MX + 0.34, top + 0.34, 0.7, C.gold);
  s.addText("The audience bet", { x: MX + 1.2, y: top + 0.34, w: lw - 1.4, h: 0.7, fontFace: F.display, fontSize: 17, bold: true, color: C.ink, valign: "middle" });
  s.addText(
    [
      { text: "A parent who pays for a digital book subscription is, almost by definition, ", options: { color: C.ink } },
      { text: "affluent enough to have bought their kid a tablet", options: { color: C.coralDark, bold: true } },
      { text: " — the “iPad kid” household.", options: { color: C.ink } },
    ],
    { x: MX + 0.36, y: top + 1.3, w: lw - 0.72, h: 1.3, fontFace: F.body, fontSize: 14.5, valign: "top", lineSpacingMultiple: 1.26 }
  );
  s.addText("So the child's primary device is a tablet — not the parent's phone. That single fact shaped the entire layout.", {
    x: MX + 0.36, y: top + 2.7, w: lw - 0.72, h: 1.0, fontFace: F.body, fontSize: 13, italic: true, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.2,
  });
  // responsive order chip
  s.addShape("roundRect", { x: MX + 0.36, y: top + 3.85, w: lw - 0.72, h: 0.55, rectRadius: 0.16, fill: { color: T.gold }, line: { type: "none" } });
  s.addText(
    [
      { text: "Responsive order:  ", options: { fontFace: F.body, fontSize: 11.5, color: C.inkSoft } },
      { text: "Tablet  ", options: { fontFace: F.display, fontSize: 13, bold: true, color: C.ink } },
      { text: ">  Mobile  ", options: { fontFace: F.display, fontSize: 12, bold: true, color: C.inkSoft } },
      { text: ">  Desktop", options: { fontFace: F.display, fontSize: 12, bold: true, color: C.inkSoft } },
    ],
    { x: MX + 0.36, y: top + 3.85, w: lw - 0.72, h: 0.55, align: "center", valign: "middle" }
  );

  // Right: design consequences
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  s.addText("What flows from it", { x: rx, y: top, w: rw, h: 0.4, fontFace: F.display, fontSize: 15, bold: true, color: C.ink });
  const cons = [
    ["bookReader", C.teal, "2–3 col grid + two-page spread", "The reader uses real tablet real-estate; spreads feel like a physical book."],
    ["hand", C.coral, "64–72px tap targets", "Oversized targets suit small fingers on a large, two-handed screen."],
    ["feather", C.purple, "Layouts tuned for landscape & portrait", "Designed for a held tablet first, then gracefully narrowed to phones."],
  ];
  let y = top + 0.5;
  cons.forEach(([ic, col, t, d]) => {
    card(s, rx, y, rw, 1.28, { shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, ic, rx + 0.24, y + 0.24, 0.56, col, { shadow: false });
    s.addText(t, { x: rx + 0.96, y: y + 0.2, w: rw - 1.2, h: 0.5, fontFace: F.display, fontSize: 13.5, bold: true, color: C.ink, valign: "middle" });
    s.addText(d, { x: rx + 0.32, y: y + 0.72, w: rw - 0.6, h: 0.5, fontFace: F.body, fontSize: 11, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.12 });
    y += 1.42;
  });
  footer(s, 5, "Overview");
})();

// ============================================================
// SLIDE 6 — Personas
// ============================================================
(function personas() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Personas", "Three people, one account", { kickerFill: C.teal });
  const top = 1.85, ch = 3.5;
  const c = cols(3, 0.34);
  const ps = [
    { av: "av_parent", col: C.coral, tint: T.coral, role: "Parent · the buyer", who: "Dina, 34", sub: "Mom of a 4-year-old", need: "Safe, age-appropriate stories. Control spending. Trust her kid can't rack up charges.", tag: "Holds the wallet" },
    { av: "av_kid", col: C.teal, tint: T.teal, role: "Child · the reader", who: "Adit, 4", sub: "Loves pictures & tapping", need: "Colorful pictures, move through a story, feel rewarded — all without help.", tag: "The engagement engine" },
    { av: "av_admin", col: C.purple, tint: T.purple, role: "Admin · the operator", who: "Catalog manager", sub: "Internal content team", need: "Add books, keep metadata correct, control availability: draft, published, archived.", tag: "Owns catalog quality" },
  ];
  ps.forEach((p, i) => {
    const x = c[i].x, w = c[i].w;
    card(s, x, top, w, ch);
    s.addShape("ellipse", { x: x + 0.3, y: top + 0.3, w: 0.84, h: 0.84, fill: { color: p.tint }, line: { type: "none" } });
    slideAvatar(s, p.av, x + 0.34, top + 0.34, 0.76);
    s.addText(p.role.toUpperCase(), { x: x + 1.28, y: top + 0.34, w: w - 1.5, h: 0.3, fontFace: F.body, fontSize: 10, bold: true, color: p.col, charSpacing: 0.8, valign: "middle" });
    s.addText(p.who, { x: x + 1.28, y: top + 0.62, w: w - 1.5, h: 0.4, fontFace: F.display, fontSize: 17, bold: true, color: C.ink, valign: "middle" });
    s.addText(p.sub, { x: x + 0.34, y: top + 1.34, w: w - 0.68, h: 0.3, fontFace: F.body, fontSize: 11, italic: true, color: C.inkSoft });
    s.addText(p.need, { x: x + 0.34, y: top + 1.74, w: w - 0.68, h: 1.1, fontFace: F.body, fontSize: 12.5, color: C.ink, valign: "top", lineSpacingMultiple: 1.16 });
    s.addShape("roundRect", { x: x + 0.34, y: top + ch - 0.66, w: w - 0.68, h: 0.42, rectRadius: 0.21, fill: { color: p.tint }, line: { type: "none" } });
    s.addText(p.tag, { x: x + 0.34, y: top + ch - 0.66, w: w - 0.68, h: 0.42, align: "center", valign: "middle", fontFace: F.body, fontSize: 11, bold: true, color: C.ink });
  });
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
  footer(s, 6, "Personas");
})();

// ============================================================
// SLIDE 7 — Kid Mode
// ============================================================
(function kidMode() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Personas", "Kid Mode — no prices, no buy, by design", { kickerFill: C.teal });
  const top = 1.85;
  // Left: Oyen in a kid-mode framing
  const lw = 4.0;
  card(s, MX, top, lw, 4.7, { fill: T.teal, line: false });
  pill(s, "Default surface", MX + 0.3, top + 0.3, { fill: C.teal, color: C.white });
  mascot(s, "n4", { x: MX + 0.9, y: top + 0.95, h: 2.7 });
  s.addText("\"Ready to read, Adit? 🐱\"", { x: MX + 0.2, y: top + 3.75, w: lw - 0.4, h: 0.5, align: "center", fontFace: F.display, fontSize: 16, bold: true, color: C.ink });
  s.addText("Big, bright, wordless. Built for a child who can't read fluently yet.", { x: MX + 0.3, y: top + 4.2, w: lw - 0.6, h: 0.45, align: "center", fontFace: F.body, fontSize: 11, italic: true, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.1 });

  // Right: characteristics
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  const feats = [
    ["bookReader", C.teal, "Big covers, 2–3 col grid", "Large icon bottom-nav, minimal words — discovery without reading."],
    ["ban", C.destructive, "No prices, no buy buttons", "Purchase UI is structurally absent — not hidden, just not rendered."],
    ["lock", C.purple, "Locked books stay gentle", "A lock + “Ask a grown-up” that softly triggers the PIN gate — never a scary block."],
    ["hand", C.coral, "Oversized tap targets (≥64px)", "Tuned to toddler motor precision; failed taps cause frustration."],
    ["feather", C.gold, "Restrained, finite motion", "Reading view is a motion-free zone; rewards play once, then stop."],
  ];
  let y = top;
  feats.forEach(([ic, col, t, d]) => {
    card(s, rx, y, rw, 0.82, { shadowOpts: { opacity: 0.08, blur: 4, offset: 2 } });
    iconChip(s, ic, rx + 0.2, y + 0.16, 0.5, col, { shadow: false });
    s.addText(
      [
        { text: t, options: { fontFace: F.display, fontSize: 13, bold: true, color: C.ink, breakLine: true } },
        { text: d, options: { fontFace: F.body, fontSize: 10.5, color: C.inkSoft } },
      ],
      { x: rx + 0.84, y: y + 0.06, w: rw - 1.05, h: 0.7, align: "left", valign: "middle", lineSpacingMultiple: 1.04 }
    );
    y += 0.94;
  });
  footer(s, 7, "Personas");
})();

// ============================================================
// SLIDE 8 — Parent Mode
// ============================================================
(function parentMode() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Personas", "Parent Mode — controlled, behind a PIN", { kickerFill: C.teal });
  const top = 1.85;
  const rw0 = 4.0;
  // Right: PIN framing with Oyen holding lock
  const rx = PAGEW - MX - rw0;
  card(s, rx, top, rw0, 4.7, { fill: T.coral, line: false });
  pill(s, "Behind a PIN", rx + 0.3, top + 0.3, { fill: C.coral, color: C.white });
  mascot(s, "n10", { x: rx + 1.0, y: top + 1.05, h: 2.2 });
  // tiny OTP boxes
  const ox = rx + rw0 / 2 - 1.0, oy = top + 3.5;
  for (let i = 0; i < 4; i++) {
    s.addShape("roundRect", { x: ox + i * 0.52, y: oy, w: 0.42, h: 0.5, rectRadius: 0.1, fill: { color: C.card }, line: { color: C.coral, width: 1.5 } });
    s.addText("•", { x: ox + i * 0.52, y: oy, w: 0.42, h: 0.5, align: "center", valign: "middle", fontFace: F.display, fontSize: 18, bold: true, color: C.coralDark });
  }
  s.addText("Entering parent mode AND every checkout require the PIN.", { x: rx + 0.3, y: oy + 0.62, w: rw0 - 0.6, h: 0.55, align: "center", fontFace: F.body, fontSize: 11, italic: true, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.12 });

  // Left: what parents do
  const lw = PAGEW - 2 * MX - rw0 - 0.4;
  const feats = [
    ["sync", C.coral, "Subscribe, renew, manage", "Subscription status & expiry; renew adds +30 days with no error."],
    ["crown", C.purple, "Buy-to-keep", "Own a book forever — it survives subscription churn."],
    ["bookReader", C.teal, "Library & account", "Owned books, included-in-subscription books, purchase history."],
    ["chartLine", C.blue, "Child progress", "See which books their child loves and returns to most."],
    ["clock", C.gold, "Screen-time limit", "Set a session cap before handing over the tablet — PIN-protected."],
  ];
  let y = top;
  feats.forEach(([ic, col, t, d]) => {
    card(s, MX, y, lw, 0.82, { shadowOpts: { opacity: 0.08, blur: 4, offset: 2 } });
    iconChip(s, ic, MX + 0.2, y + 0.16, 0.5, col, { shadow: false });
    s.addText(
      [
        { text: t, options: { fontFace: F.display, fontSize: 13, bold: true, color: C.ink, breakLine: true } },
        { text: d, options: { fontFace: F.body, fontSize: 10.5, color: C.inkSoft } },
      ],
      { x: MX + 0.84, y: y + 0.06, w: lw - 1.05, h: 0.7, align: "left", valign: "middle", lineSpacingMultiple: 1.04 }
    );
    y += 0.94;
  });
  footer(s, 8, "Personas");
})();

// ============================================================
// SLIDE 9 — Meet Oyen
// ============================================================
(function meetOyen() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Meet Oyen", "Meet Oyen", { kickerFill: C.gold, kickerColor: C.ink });
  const top = 1.8;
  // Big hero on the right with playful accents
  s.addShape("ellipse", { x: 8.7, y: top + 0.1, w: 4.2, h: 4.2, fill: { color: T.gold }, line: { type: "none" } });
  s.addShape("ellipse", { x: 8.45, y: top + 3.2, w: 0.85, h: 0.85, fill: { color: T.teal }, line: { type: "none" } });
  s.addShape("ellipse", { x: 12.35, y: top + 0.5, w: 0.5, h: 0.5, fill: { color: T.coral }, line: { type: "none" } });
  mascot(s, "n3", { x: 9.0, y: top + 0.3, h: 4.2 });

  const lw = 7.4;
  s.addText(
    [
      { text: "Oyen", options: { fontFace: F.display, fontSize: 40, bold: true, color: C.coralDark } },
      { text: "  is the brand's friendly reading companion — an orange-cream tabby cat.", options: { fontFace: F.display, fontSize: 22, bold: true, color: C.ink } },
    ],
    { x: MX, y: top + 0.1, w: lw, h: 1.4, valign: "top", lineSpacingMultiple: 1.08 }
  );
  s.addText(
    [
      { text: "The name “Oyen” is the Indonesian term of endearment for an orange tabby — warm, memorable, and instantly on-brand. ", options: { color: C.inkSoft } },
      { text: "Oyen is a presence, not the navigation", options: { color: C.ink, bold: true } },
      { text: ": warm, curious, gentle, and encouraging.", options: { color: C.inkSoft } },
    ],
    { x: MX, y: top + 1.55, w: lw, h: 1.2, fontFace: F.body, fontSize: 13.5, valign: "top", lineSpacingMultiple: 1.24 }
  );
  const traits = [["heart", C.coral, "Emotional thread"], ["feather", C.teal, "Flat vector, rounded"], ["seedling", C.green, "Signature teal scarf"]];
  let tx = MX;
  traits.forEach(([ic, col, t]) => {
    const w = 0.5 + 0.62 + t.length * 0.082;
    card(s, tx, top + 2.95, w, 0.62, { r: 0.31, shadowOpts: { opacity: 0.08, blur: 4, offset: 2 } });
    iconChip(s, ic, tx + 0.1, top + 3.05, 0.42, col, { shadow: false });
    s.addText(t, { x: tx + 0.6, y: top + 2.95, w: w - 0.66, h: 0.62, fontFace: F.display, fontSize: 12, bold: true, color: C.ink, valign: "middle" });
    tx += w + 0.2;
  });
  // quote band
  card(s, MX, top + 3.85, lw, 0.85, { fill: C.ink, shadow: false });
  s.addText("\"One friendly guide — it greets, celebrates, and softens every locked, empty, and error moment.\"", {
    x: MX + 0.34, y: top + 3.85, w: lw - 0.68, h: 0.85, fontFace: F.body, fontSize: 12.5, italic: true, color: C.codeText, valign: "middle", lineSpacingMultiple: 1.12,
  });
  footer(s, 9, "Meet Oyen");
})();

// ============================================================
// SLIDE 10 — Where Oyen shows up
// ============================================================
(function oyenMoments() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Meet Oyen", "One guide for every emotional moment", { kickerFill: C.gold, kickerColor: C.ink });
  const top = 1.82, ch = 2.28, rowGap = 0.26;
  const c = cols(3, 0.3);
  const moments = [
    { img: "n1", tint: T.gold, t: "Waving", d: "Login welcome & onboarding — the first impression." },
    { img: "n9", tint: T.green, t: "Celebrating", d: "Finishing a book or unlocking — confetti, plays once." },
    { img: "n10", tint: T.coral, t: "Holding a lock", d: "Locked content — “Ask a grown-up,” never a hard block." },
    { img: "n11", tint: T.blue, t: "Puzzled", d: "404 & not-found — lost, but still cute." },
    { img: "n12", tint: T.purple, t: "Oops", d: "Generic error — a tangled ball of yarn." },
    { img: "n13", tint: T.teal, t: "Sleepy", d: "Bedtime stories & screen-time's up — “time for a nap.”" },
  ];
  moments.forEach((m, i) => {
    const col = c[i % 3], row = Math.floor(i / 3);
    const x = col.x, y = top + row * (ch + rowGap), w = col.w;
    card(s, x, y, w, ch);
    s.addShape("roundRect", { x: x + 0.2, y: y + 0.2, w: 1.7, h: ch - 0.4, rectRadius: 0.14, fill: { color: m.tint }, line: { type: "none" } });
    // fit mascot inside the tinted square
    const r = RATIO[m.img]; let iw = 1.4, ih = iw / r; if (ih > ch - 0.7) { ih = ch - 0.7; iw = ih * r; }
    mascot(s, m.img, { x: x + 0.2 + (1.7 - iw) / 2, y: y + 0.2 + (ch - 0.4 - ih) / 2, w: iw });
    const tx = x + 2.05, tw = w - 2.05 - 0.2;
    s.addText(m.t, { x: tx, y: y + 0.4, w: tw, h: 0.5, fontFace: F.display, fontSize: 16, bold: true, color: C.ink, valign: "middle" });
    s.addText(m.d, { x: tx, y: y + 0.9, w: tw, h: 1.1, fontFace: F.body, fontSize: 11, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.16 });
  });
  footer(s, 10, "Meet Oyen");
})();

// ============================================================
// SLIDE 11 — Design DNA
// ============================================================
(function designDNA() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Design System", "Design DNA", { kickerFill: C.purple });
  s.addText("The principles every screen answers to — and why each one is a child-development decision, not a style preference.", {
    x: MX, y: 1.5, w: 11, h: 0.34, fontFace: F.body, fontSize: 12.5, italic: true, color: C.inkSoft,
  });
  const top = 2.0, gap = 0.3;
  const c = cols(2, gap), ch = 1.36, rowGap = 0.22;
  const items = [
    ["heart", C.coral, "Warm, not clinical", "Cream over white, espresso over black, rounded over sharp. Even the admin panel stays friendly."],
    ["bookOpen", C.teal, "Illustration-led", "Screens lean on imagery, not text walls. Every empty state and milestone has art."],
    ["hand", C.gold, "Chunky & tactile", "Big rounded shapes and thick 3D buttons that physically press — made for small fingers."],
    ["bulb", C.blue, "Playful but legible", "Bright multicolor accents over a calm cream base; color is fun, never fights readability."],
    ["seedling", C.green, "One friendly guide", "Oyen is the emotional thread — a presence that softens hard moments, not the navigation."],
    ["feather", C.purple, "Motion restraint = safety", "Toddlers overstimulate easily. Animation is purposeful, user-initiated, and never looping."],
  ];
  items.forEach((it, i) => {
    const col = c[i % 2], row = Math.floor(i / 2);
    const x = col.x, y = top + row * (ch + rowGap), w = col.w;
    const [ic, color, t, d] = it;
    card(s, x, y, w, ch);
    iconChip(s, ic, x + 0.28, y + 0.28, 0.62, color);
    s.addText(t, { x: x + 1.06, y: y + 0.2, w: w - 1.3, h: 0.45, fontFace: F.display, fontSize: 15.5, bold: true, color: C.ink, valign: "middle" });
    s.addText(d, { x: x + 1.06, y: y + 0.64, w: w - 1.3, h: 0.62, fontFace: F.body, fontSize: 11, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.14 });
  });
  footer(s, 11, "Design System");
})();

// ============================================================
// SLIDE 12 — Color & Typography
// ============================================================
(function colorType() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Design System", "Color & type", { kickerFill: C.purple });
  const top = 1.78;
  // Neutrals row
  s.addText("NEUTRALS — THE CALM BASE", { x: MX, y: top, w: 6, h: 0.3, fontFace: F.body, fontSize: 9.5, bold: true, color: C.inkSoft, charSpacing: 1 });
  const neutrals = [["bg", "Cream", "FBF3E7", 1], ["card", "Card", "FFFDF9", 1], ["muted", "Muted", "F3E9D8", 1], ["ink", "Ink", "3A2E28", 0], ["inkSoft", "Ink soft", "8A7A6D", 0]];
  const nw = 1.6, nh = 1.1;
  neutrals.forEach((n, i) => { swatch(s, MX + i * (nw + 0.18), top + 0.34, nw, nh, C[n[0]], n[1], n[2], { dark: n[3] === 1, border: n[3] === 1 }); });

  // Brand + pops
  s.addText("BRAND + PLAYFUL POPS", { x: MX, y: top + 1.7, w: 6, h: 0.3, fontFace: F.body, fontSize: 9.5, bold: true, color: C.inkSoft, charSpacing: 1 });
  const brand = [["coral", "Coral", "FF7B54"], ["gold", "Sunny", "FFC93C"], ["teal", "Teal", "2EC4B6"], ["blue", "Blue", "4CB9E7"], ["purple", "Purple", "A78BFA"], ["green", "Green", "7BC950"], ["pink", "Pink", "FF8FB1"]];
  const bw = 1.04, bh = 1.0;
  brand.forEach((b, i) => { swatch(s, MX + i * (bw + 0.13), top + 2.04, bw, bh, C[b[0]], b[1], b[2]); });

  // Typography card
  const ty = top + 3.45;
  card(s, MX, ty, PAGEW - 2 * MX, 1.95);
  const half = (PAGEW - 2 * MX) / 2;
  s.addText("Fredoka", { x: MX + 0.4, y: ty + 0.28, w: half - 0.6, h: 0.7, fontFace: F.display, fontSize: 38, bold: true, color: C.ink });
  s.addText("Display · headings · buttons · numbers · mascot speech", { x: MX + 0.42, y: ty + 1.0, w: half - 0.6, h: 0.4, fontFace: F.body, fontSize: 11, color: C.inkSoft });
  s.addText("Rounded, geometric, playful. Kid mode bumps every size up one step.", { x: MX + 0.42, y: ty + 1.34, w: half - 0.6, h: 0.5, fontFace: F.body, fontSize: 10.5, italic: true, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.1 });
  s.addShape("line", { x: MX + half, y: ty + 0.3, w: 0, h: 1.35, line: { color: C.line, width: 1 } });
  s.addText("Nunito", { x: MX + half + 0.4, y: ty + 0.28, w: half - 0.6, h: 0.7, fontFace: F.body, fontSize: 38, bold: true, color: C.ink });
  s.addText("Body · descriptions · labels · longer reading UI", { x: MX + half + 0.42, y: ty + 1.0, w: half - 0.6, h: 0.4, fontFace: F.body, fontSize: 11, color: C.inkSoft });
  s.addText("Highly legible and friendly — carries the dense parent & admin surfaces.", { x: MX + half + 0.42, y: ty + 1.34, w: half - 0.6, h: 0.5, fontFace: F.body, fontSize: 10.5, italic: true, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.1 });
  footer(s, 12, "Design System");
})();

// ============================================================
// SLIDE 13 — Components & motion
// ============================================================
(function components() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Design System", "Chunky components, restrained motion", { kickerFill: C.purple });
  const top = 1.85;
  // Left: chunky button + badges demo
  const lw = 5.6;
  card(s, MX, top, lw, 4.7);
  s.addText("Signature interactions", { x: MX + 0.34, y: top + 0.28, w: lw - 0.68, h: 0.36, fontFace: F.display, fontSize: 14, bold: true, color: C.ink });
  // ChunkyButton rest vs pressed
  chunky(s, "Read now", MX + 0.5, top + 0.9, 2.0, 0.62, { fontSize: 15 });
  s.addText("rest", { x: MX + 0.5, y: top + 1.62, w: 2.0, h: 0.26, align: "center", fontFace: F.mono, fontSize: 9, color: C.inkSoft });
  chunky(s, "Read now", MX + 2.9, top + 0.94, 2.0, 0.6, { fontSize: 15, depth: 0.02 });
  s.addText("pressed ↓2px", { x: MX + 2.9, y: top + 1.62, w: 2.0, h: 0.26, align: "center", fontFace: F.mono, fontSize: 9, color: C.inkSoft });
  // AccessBadges
  s.addText("ACCESS BADGES — never color alone", { x: MX + 0.34, y: top + 2.0, w: lw - 0.68, h: 0.3, fontFace: F.body, fontSize: 9.5, bold: true, color: C.inkSoft, charSpacing: 0.8 });
  const badges = [["gift", "FREE", C.teal], ["check", "OWNED", C.green], ["sync", "SUB", C.blue], ["lock", "LOCKED", C.inkSoft], ["userCog", "ADMIN", C.purple]];
  let bxx = MX + 0.34;
  badges.forEach(([ic, t, col]) => {
    const w = 0.34 + 0.4 + t.length * 0.092;
    s.addShape("roundRect", { x: bxx, y: top + 2.36, w, h: 0.46, rectRadius: 0.23, fill: { color: col }, line: { type: "none" } });
    slideTinyIcon(s, ic, bxx + 0.12, top + 2.47, 0.24);
    s.addText(t, { x: bxx + 0.4, y: top + 2.36, w: w - 0.44, h: 0.46, fontFace: F.body, fontSize: 10, bold: true, color: C.white, valign: "middle" });
    bxx += w + 0.12;
  });
  s.addText("Every badge pairs an icon + label + color — accessible for kids and color-blind users alike.", { x: MX + 0.34, y: top + 3.0, w: lw - 0.68, h: 0.6, fontFace: F.body, fontSize: 10.5, italic: true, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.14 });
  s.addText("One PlaceholderImage component renders every image slot — DRY, consistent, swappable for real art.", { x: MX + 0.34, y: top + 3.7, w: lw - 0.68, h: 0.8, fontFace: F.body, fontSize: 11, color: C.ink, valign: "top", lineSpacingMultiple: 1.16 });

  // Right: motion rules (kid mode)
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  card(s, rx, top, rw, 4.7, { fill: C.ink });
  iconChip(s, "feather", rx + 0.32, top + 0.32, 0.62, C.gold, { variant: "ink", shadow: false });
  s.addText("Motion rules · kid mode", { x: rx + 1.1, y: top + 0.32, w: rw - 1.3, h: 0.62, fontFace: F.display, fontSize: 16, bold: true, color: C.white, valign: "middle" });
  const rules = [
    "Reading view is a motion-free zone — the pause is the content.",
    "Never more than 2 animated elements on screen at once.",
    "No auto-advance, no auto-play — every page turn is user-initiated.",
    "Rewards play once, then stop — no variable-reward loops.",
    "Route transitions slow to 400ms (vs 200ms) — toddlers need processing time.",
    "Always respects prefers-reduced-motion.",
  ];
  let y = top + 1.3;
  rules.forEach((r) => {
    iconChip(s, "checkPlain", rx + 0.34, y + 0.02, 0.32, C.teal, { shadow: false, inset: 0.24 });
    s.addText(r, { x: rx + 0.8, y: y - 0.05, w: rw - 1.1, h: 0.55, fontFace: F.body, fontSize: 11.5, color: C.codeText, valign: "middle", lineSpacingMultiple: 1.08 });
    y += 0.56;
  });
  footer(s, 13, "Design System");
})();

// ============================================================
// SLIDE 14 — Decisions, not defaults (thought process)
// ============================================================
(function decisions() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Problems", "Decisions, not defaults", { kickerFill: C.coral });
  s.addText("Every choice traces back to a real user truth — child development or audience economics, never aesthetics.", {
    x: MX, y: 1.5, w: 11.5, h: 0.34, fontFace: F.body, fontSize: 12.5, italic: true, color: C.inkSoft,
  });
  const top = 1.98, rh = 0.66, gap = 0.12;
  const rows = [
    ["Tablet-first", "The paying parent is an “iPad kid” household — the tablet is the child's device.", C.coral],
    ["Buyer ≠ reader, split surfaces", "The child delights, the parent pays — different needs, held in one brand.", C.teal],
    ["No buy button in kid mode", "A toddler can't tell “tap for fun” from “tap to buy” — so remove the gesture entirely.", C.purple],
    ["6-page books", "Calibrated to a toddler's 2–5 minute attention span = one complete session.", C.blue],
    ["Restrained motion", "Immature sensory processing means overstimulation, not engagement.", C.gold],
    ["64–72px tap targets", "Toddler precision ≈ an adult's non-dominant hand wearing oven mitts.", C.green],
    ["8 great books > 50 mediocre", "Toddlers re-read; curation beats catalog size.", C.coralDark],
  ];
  rows.forEach((r, i) => {
    const y = top + i * (rh + gap);
    card(s, MX, y, PAGEW - 2 * MX, rh, { r: 0.12, shadowOpts: { opacity: 0.07, blur: 4, offset: 1 } });
    s.addShape("roundRect", { x: MX, y, w: 0.14, h: rh, rectRadius: 0.06, fill: { color: r[2] }, line: { type: "none" } });
    s.addText(r[0], { x: MX + 0.36, y, w: 3.9, h: rh, fontFace: F.display, fontSize: 13.5, bold: true, color: C.ink, valign: "middle" });
    s.addShape("line", { x: MX + 4.35, y: y + 0.12, w: 0, h: rh - 0.24, line: { color: C.line, width: 1 } });
    s.addText(r[1], { x: MX + 4.6, y, w: PAGEW - 2 * MX - 4.8, h: rh, fontFace: F.body, fontSize: 11.5, color: C.inkSoft, valign: "middle", lineSpacingMultiple: 1.05 });
  });
  footer(s, 14, "Problems");
})();

// ============================================================
// SLIDE 15 — The problems we designed against
// ============================================================
(function problems() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Problems", "Designing for toddlers is a domain", { kickerFill: C.coral });
  s.addText("Five hard truths about young children that a bright color scheme alone can't solve.", {
    x: MX, y: 1.5, w: 11, h: 0.34, fontFace: F.body, fontSize: 12.5, italic: true, color: C.inkSoft,
  });
  const top = 2.0;
  const probs = [
    ["cart", C.destructive, "The accidental purchase", "A toddler can't distinguish “tapping for fun” from “tapping to buy.” Every tap is the same gesture."],
    ["feather", C.warning, "Overstimulation", "Immature sensory systems mean rapid motion causes distress, not engagement."],
    ["bookOpen", C.blue, "Pre-literacy", "Ages 2–4 can't read — text-only navigation simply doesn't work."],
    ["hand", C.purple, "Motor precision", "Toddler precision ≈ an adult's non-dominant hand in oven mitts. Small targets fail."],
    ["clock", C.teal, "Screen-time anxiety", "Parents worry about duration — control must exist without stressing the child about “time's up.”"],
  ];
  // first row: 3 cards, second row: 2 cards centered
  const c3 = cols(3, 0.3);
  const ch = 1.95;
  probs.slice(0, 3).forEach((p, i) => problemCard(s, c3[i].x, top, c3[i].w, ch, p));
  const c2w = c3[0].w, gap2 = 0.3;
  const startX = (PAGEW - 2 * c2w - gap2) / 2;
  problems2(s, startX, top + ch + 0.28, c2w, ch, probs[3]);
  problems2(s, startX + c2w + gap2, top + ch + 0.28, c2w, ch, probs[4]);
  function problemCard(slide, x, y, w, h, p) {
    card(slide, x, y, w, h);
    iconChip(slide, p[0], x + 0.3, y + 0.3, 0.66, p[1]);
    s.addText(p[2], { x: x + 1.1, y: y + 0.28, w: w - 1.3, h: 0.7, fontFace: F.display, fontSize: 15, bold: true, color: C.ink, valign: "middle", lineSpacingMultiple: 1.0 });
    s.addText(p[3], { x: x + 0.34, y: y + 1.08, w: w - 0.68, h: 0.78, fontFace: F.body, fontSize: 11.5, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.16 });
  }
  function problems2(slide, x, y, w, h, p) { problemCard(slide, x, y, w, h, p); }
  footer(s, 15, "Problems");
})();

// ============================================================
// SLIDE 16 — No buy button in a toddler's world
// ============================================================
(function accidentalPurchase() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Edge case", "No buy button in a toddler's world", { kickerFill: C.coral });
  const top = 1.95;
  // Flow: Kid mode (no buy) -> tap locked -> PIN gate -> Parent mode (buy exists)
  const steps = [
    { ic: "child", col: C.teal, t: "Kid mode", d: "No prices. No buy button. Not in the DOM." },
    { ic: "lock", col: C.purple, t: "Tap locked", d: "“Ask a grown-up” + Oyen — gentle, not scary." },
    { ic: "key", col: C.coral, t: "PIN gate", d: "The trust boundary — required every time." },
    { ic: "store", col: C.gold, t: "Parent mode", d: "Only here does a buy button exist." },
  ];
  const bw = 2.7, bh = 1.9, gapX = (PAGEW - 2 * MX - bw * 4) / 3;
  steps.forEach((st, i) => {
    const x = MX + i * (bw + gapX);
    card(s, x, top, bw, bh, { fill: st.col });
    iconChip(s, st.ic, x + bw / 2 - 0.4, top + 0.28, 0.8, C.white, { variant: "ink", shadow: false });
    s.addText(st.t, { x, y: top + 1.12, w: bw, h: 0.4, align: "center", fontFace: F.display, fontSize: 17, bold: true, color: C.white });
    s.addText(st.d, { x: x + 0.2, y: top + 1.5, w: bw - 0.4, h: 0.36, align: "center", fontFace: F.body, fontSize: 10, color: C.white, valign: "top", lineSpacingMultiple: 1.04 });
    if (i < 3) s.addText("→", { x: x + bw, y: top, w: gapX, h: bh, align: "center", valign: "middle", fontFace: F.display, fontSize: 24, bold: true, color: C.inkSoft });
  });
  // Bottom: defense in depth note
  const ny = top + bh + 0.4;
  card(s, MX, ny, PAGEW - 2 * MX, 1.65, { fill: C.ink });
  iconChip(s, "shield", MX + 0.4, ny + 0.5, 0.7, C.gold, { variant: "ink", shadow: false });
  s.addText("Structurally absent — not hidden, not permission-checked", { x: MX + 1.35, y: ny + 0.32, w: 7.6, h: 0.5, fontFace: F.display, fontSize: 18, bold: true, color: C.white, valign: "middle" });
  s.addText("Defense in depth: three surfaces + a PIN gate. No single failure mode — a missed permission check, a UI bug — can ever result in an unauthorized purchase, because there is no purchase UI in kid mode to fail.", {
    x: MX + 1.35, y: ny + 0.82, w: 8.2, h: 0.7, fontFace: F.body, fontSize: 12, color: C.codeText, valign: "top", lineSpacingMultiple: 1.18,
  });
  card(s, PAGEW - MX - 2.9, ny + 0.28, 2.7, 1.1, { fill: "4A3B33", line: false, shadow: false });
  s.addText("Apple prompts for any IAP in age-4+ apps.\nWe go further — no purchase prompt exists in kid mode at all.", {
    x: PAGEW - MX - 2.74, y: ny + 0.28, w: 2.42, h: 1.1, fontFace: F.body, fontSize: 10, italic: true, color: C.gold, valign: "middle", lineSpacingMultiple: 1.12,
  });
  footer(s, 16, "Problems");
})();

// ============================================================
// SLIDE 17 — One rule, enforced everywhere (edge-case matrix)
// ============================================================
(function edges() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Edge cases", "One rule, enforced everywhere", { kickerFill: C.coral });
  const top = 1.82, ch = 4.95;
  const c = cols(4, 0.26);
  const groups = [
    { key: "exchange", col: C.coral, t: "Entitlement", cases: [["Sub expires mid-session", "Read completes; lock applies on next open"], ["Owned + subscribed", "Shows OWNED, not subscription"], ["Sub lapses", "Falls back to owned books only"]] },
    { key: "creditCard", col: C.gold, t: "Payment", cases: [["Duplicate purchase", "Idempotent — returns existing record"], ["Declined card", "Ledger logs FAILED; nothing unlocks"], ["Retry / double-charge", "Blocked by idempotencyKey"]] },
    { key: "hourglass", col: C.teal, t: "Lifecycle", cases: [["Book archived after buy", "Still readable for the owner"], ["Archived for others", "Invisible in the catalog"], ["Soft-delete", "ARCHIVED preserves ownership"]] },
    { key: "shield", col: C.purple, t: "Safety", cases: [["No buy in kid mode", "Structurally absent from the DOM"], ["PIN gate", "Before parent mode & checkout"], ["Defense in depth", "No single failure = a buy"]] },
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
      s.addText(t, { x: x + 0.62, y, w: w - 0.78, h: 0.46, fontFace: F.display, fontSize: 11.8, bold: true, color: C.ink, valign: "top", lineSpacingMultiple: 0.98 });
      s.addText(d, { x: x + 0.62, y: y + 0.48, w: w - 0.82, h: 0.66, fontFace: F.body, fontSize: 10.2, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.06 });
      y += caseH;
    });
  });
  footer(s, 17, "Problems");
})();

// ============================================================
// SLIDE 18 — The pause is the content (calm reading zone)
// ============================================================
(function readingZone() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Edge case", "The pause is the content", { kickerFill: C.coral });
  const top = 1.85;
  // Left: big quote + Oyen reading calmly
  const lw = 5.4;
  card(s, MX, top, lw, 4.7, { fill: C.ink });
  s.addText("\"The reading view is a calm zone — nothing moves in the background.\"", {
    x: MX + 0.4, y: top + 0.45, w: lw - 0.8, h: 1.5, fontFace: F.display, fontSize: 22, bold: true, color: C.white, valign: "top", lineSpacingMultiple: 1.12,
  });
  mascot(s, "n5", { x: MX + lw / 2 - 1.1, y: top + 2.0, h: 2.4 });
  s.addText("Same “still frame” principle as Bluey, Peppa Pig & Dora — the slowness is deliberate, not cheap.", {
    x: MX + 0.4, y: top + 4.0, w: lw - 0.8, h: 0.6, align: "center", fontFace: F.body, fontSize: 11, italic: true, color: C.codeText, valign: "middle", lineSpacingMultiple: 1.12,
  });

  // Right: rules
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  const rules = [
    ["feather", C.teal, "Motion-free zone", "No Oyen bobbing, no floating particles, nothing animating behind the story."],
    ["hand", C.coral, "User-initiated turns", "No auto-advance, no auto-play — the child controls the pace, always."],
    ["ban", C.purple, "Pinch-to-zoom disabled", "Toddlers pinch by accident; touch-action: pan-y keeps the page steady."],
    ["bookmark", C.gold, "Continue where they left off", "Reading progress remembers the last page reached, per book."],
  ];
  let y = top;
  rules.forEach(([ic, col, t, d]) => {
    card(s, rx, y, rw, 1.08, { shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, ic === "bookmark" ? "book" : ic, rx + 0.24, y + 0.28, 0.56, col, { shadow: false });
    s.addText(t, { x: rx + 0.98, y: y + 0.18, w: rw - 1.2, h: 0.42, fontFace: F.display, fontSize: 14, bold: true, color: C.ink, valign: "middle" });
    s.addText(d, { x: rx + 0.32, y: y + 0.6, w: rw - 0.6, h: 0.42, fontFace: F.body, fontSize: 11, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.1 });
    y += 1.2;
  });
  footer(s, 18, "Problems");
})();

// ============================================================
// SLIDE 19 — Feature map
// ============================================================
(function featureMap() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Features", "What's built, across every surface", { kickerFill: C.teal });
  const top = 1.82, gap = 0.3;
  const c = cols(2, gap), ch = 2.28, rowGap = 0.26;
  const quads = [
    { key: "user", col: C.gold, t: "Auth & onboarding", items: ["Mock login + quick-pick profile chips", "4-step onboarding: Welcome → How it works", "Set Parent PIN → Who's reading?", "Personalizes the catalog from minute one"] },
    { key: "bookReader", col: C.teal, t: "Kid surface", items: ["Catalog grid + category & age filters", "Paper-flip reader + read-aloud narration", "Confetti reward on the last page", "Locked books → gentle “Ask a grown-up”"] },
    { key: "key", col: C.coral, t: "Parent surface · PIN-gated", items: ["Subscribe, renew & manage", "Buy-to-keep individual books", "Library, account & purchase history", "Child progress + screen-time limit"] },
    { key: "slidersH", col: C.purple, t: "Admin surface", items: ["Full catalog CRUD + soft archive", "Content wizard: cover + page-by-page text", "Draft → Published → Archived lifecycle", "Category & metadata management"] },
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
  footer(s, 19, "Features");
})();

// ============================================================
// SLIDE 20 — The unlock journey (key flow)
// ============================================================
(function unlockJourney() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Features", "The unlock journey — the key flow", { kickerFill: C.teal });
  const top = 2.1;
  const steps = [
    ["bookReader", C.teal, "Browse", "Kid mode catalog"],
    ["lock", C.purple, "Tap locked", "“Ask a grown-up” + Oyen"],
    ["key", C.coral, "PIN gate", "Enter parent mode"],
    ["store", C.gold, "Subscribe / Buy", "Mock payment"],
    ["lockOpen", C.green, "Unlocked", "Open the reader"],
  ];
  const bw = 2.1, bh = 2.1, gapX = (PAGEW - 2 * MX - bw * 5) / 4;
  steps.forEach((st, i) => {
    const x = MX + i * (bw + gapX);
    card(s, x, top, bw, bh, { shadowOpts: { opacity: 0.1 } });
    iconChip(s, st[0], x + bw / 2 - 0.42, top + 0.32, 0.84, st[1]);
    s.addText(st[2], { x, y: top + 1.26, w: bw, h: 0.4, align: "center", fontFace: F.display, fontSize: 16, bold: true, color: C.ink });
    s.addText(st[3], { x: x + 0.15, y: top + 1.64, w: bw - 0.3, h: 0.36, align: "center", fontFace: F.body, fontSize: 10.5, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.04 });
    if (i < 4) s.addText("→", { x: x + bw, y: top, w: gapX, h: bh, align: "center", valign: "middle", fontFace: F.display, fontSize: 22, bold: true, color: C.coral });
  });
  // bottom note
  const ny = top + bh + 0.5;
  card(s, MX, ny, PAGEW - 2 * MX, 1.5, { fill: C.ink });
  iconChip(s, "route", MX + 0.4, ny + 0.4, 0.7, C.gold, { variant: "ink", shadow: false });
  s.addText(
    [
      { text: "One path turns a locked tap into a sale — without a child ever seeing checkout.  ", options: { fontFace: F.display, fontSize: 15, bold: true, color: C.gold } },
      { text: "The PIN gate is the hinge: it converts the child's curiosity into a parent's deliberate, trusted decision. Whether they subscribe or buy-to-keep, the book unlocks and the reader opens immediately.", options: { fontFace: F.body, fontSize: 12, color: C.codeText } },
    ],
    { x: MX + 1.35, y: ny, w: PAGEW - 2 * MX - 1.7, h: 1.5, align: "left", valign: "middle", lineSpacingMultiple: 1.16 }
  );
  footer(s, 20, "Features");
})();

// ============================================================
// SLIDE 21 — The paper-flip reader
// ============================================================
(function reader() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Features", "Reading that feels like a board book", { kickerFill: C.teal });
  const top = 1.85;
  // Left: features
  const lw = 6.6;
  const feats = [
    ["bookOpen", C.teal, "Swipe / paper-flip", "react-pageflip — single page on narrow, a two-page spread on wide tablets."],
    ["hand", C.coral, "Why swipe?", "It maps directly to how a toddler holds a physical board book — continuity, not a departure."],
    ["star", C.gold, "Finite reward", "The last page fires a confetti burst + Oyen celebrating — once, then it stops."],
    ["book", C.purple, "Continue where they left off", "Reading progress remembers the last page reached, per child, per book."],
  ];
  let y = top;
  feats.forEach(([ic, col, t, d]) => {
    card(s, MX, y, lw, 1.08, { shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, ic, MX + 0.24, y + 0.28, 0.56, col, { shadow: false });
    s.addText(t, { x: MX + 0.98, y: y + 0.18, w: lw - 1.2, h: 0.42, fontFace: F.display, fontSize: 14.5, bold: true, color: C.ink, valign: "middle" });
    s.addText(d, { x: MX + 0.32, y: y + 0.62, w: lw - 0.6, h: 0.42, fontFace: F.body, fontSize: 11, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.1 });
    y += 1.2;
  });
  // Right: reward moment with Oyen celebrating + a book cover thumb
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  card(s, rx, top, rw, 4.7, { fill: T.gold, line: false });
  pill(s, "The reward moment", rx + 0.3, top + 0.3, { fill: C.gold, color: C.ink });
  mascot(s, "n9", { x: rx + rw / 2 - 1.05, y: top + 0.95, h: 2.4 });
  s.addText("\"You finished the story!\"", { x: rx + 0.2, y: top + 3.5, w: rw - 0.4, h: 0.5, align: "center", fontFace: F.display, fontSize: 17, bold: true, color: C.coralDark });
  s.addText("A clear emotional endpoint — the child knows the session is complete.", { x: rx + 0.3, y: top + 4.0, w: rw - 0.6, h: 0.6, align: "center", fontFace: F.body, fontSize: 11, italic: true, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.12 });
  footer(s, 21, "Features");
})();

// ============================================================
// SLIDE 22 — Read aloud (Bacakan)
// ============================================================
(function readAloud() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Features", "Read it aloud — the app voices the story", { kickerFill: C.teal });
  const top = 1.85;
  // Left: feature rows
  const lw = 6.6;
  const feats = [
    ["hand", C.coral, "Tap to be read to", "A child who can't read yet taps the page — the story is spoken aloud at a calm pace."],
    ["robot", C.teal, "Voice built in", "In the demo the browser's speech synthesis narrates; production swaps in recorded voice-over."],
    ["bookOpen", C.gold, "Admin writes the script", "Read-aloud speaks the exact page text admins type in the content wizard — one source of truth."],
    ["feather", C.purple, "Calm, not loud", "Optional and child-initiated — it fits the motion-free reading zone instead of fighting it."],
  ];
  let y = top;
  feats.forEach(([ic, col, t, d]) => {
    card(s, MX, y, lw, 1.08, { shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, ic, MX + 0.24, y + 0.28, 0.56, col, { shadow: false });
    s.addText(t, { x: MX + 0.98, y: y + 0.18, w: lw - 1.2, h: 0.42, fontFace: F.display, fontSize: 14.5, bold: true, color: C.ink, valign: "middle" });
    s.addText(d, { x: MX + 0.32, y: y + 0.62, w: lw - 0.6, h: 0.42, fontFace: F.body, fontSize: 11, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.1 });
    y += 1.2;
  });
  // Right: the pipeline — admin text -> spoken aloud
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  card(s, rx, top, rw, 4.7, { fill: T.teal, line: false });
  pill(s, "One source of truth", rx + 0.3, top + 0.3, { fill: C.teal, color: C.white });
  const aw = rw - 0.7, ax = rx + 0.35;
  // card A: admin-authored text
  card(s, ax, top + 0.95, aw, 1.25, { fill: C.card, shadowOpts: { opacity: 0.08 } });
  iconChip(s, "bookOpen", ax + 0.22, top + 1.2, 0.5, C.gold, { shadow: false });
  s.addText("Admin types the page text", { x: ax + 0.84, y: top + 1.14, w: aw - 1.0, h: 0.4, fontFace: F.display, fontSize: 12.5, bold: true, color: C.ink, valign: "middle" });
  s.addText("“Once upon a time, a little star…”", { x: ax + 0.3, y: top + 1.6, w: aw - 0.6, h: 0.5, fontFace: F.mono, fontSize: 11, italic: true, color: C.inkSoft, valign: "middle" });
  // arrow down
  s.addText("▼", { x: rx + rw / 2 - 0.2, y: top + 2.24, w: 0.4, h: 0.3, align: "center", valign: "middle", fontSize: 12, color: C.teal });
  // card B: spoken aloud
  card(s, ax, top + 2.58, aw, 1.25, { fill: C.ink });
  iconChip(s, "robot", ax + 0.22, top + 2.83, 0.5, C.gold, { shadow: false });
  s.addText("The app reads it aloud", { x: ax + 0.84, y: top + 2.77, w: aw - 1.0, h: 0.4, fontFace: F.display, fontSize: 12.5, bold: true, color: C.white, valign: "middle" });
  s.addText("Spoken to the child, page by page.", { x: ax + 0.3, y: top + 3.23, w: aw - 0.6, h: 0.5, fontFace: F.body, fontSize: 10.5, color: C.codeText, valign: "middle" });
  // caption
  s.addText("The voice never reads anything an admin didn't write.", { x: rx + 0.3, y: top + 4.0, w: rw - 0.6, h: 0.55, align: "center", fontFace: F.body, fontSize: 10.5, italic: true, color: C.ink, valign: "middle", lineSpacingMultiple: 1.08 });
  footer(s, 22, "Features");
})();

// ============================================================
// SLIDE 23 — Monetization: two ways to pay
// ============================================================
(function monetization() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Features", "Two ways to pay — never merged", { kickerFill: C.teal });
  const top = 1.9, ch = 3.4;
  const c = cols(3, 0.34);
  const tiers = [
    { key: "gift", col: C.green, tint: T.green, name: "Free", price: "Rp 0", tagline: "A taste of the product", pts: ["Open to any logged-in user", "Always accessible", "Acquisition / discovery hook"] },
    { key: "infinity", col: C.coral, tint: T.coral, name: "Subscription", price: "Rp 49.000 / mo", tagline: "The whole library", pts: ["Unlimited access while active", "Includes books added later", "Renews +30 days, no error"], feat: true },
    { key: "crown", col: C.purple, tint: T.purple, name: "Buy-to-keep", price: "Per book", tagline: "Own it forever", pts: ["Permanent ownership", "Survives subscription churn", "Buy even while subscribed"] },
  ];
  tiers.forEach((t, i) => {
    const x = c[i].x, w = c[i].w;
    const y = t.feat ? top - 0.12 : top;
    const h = t.feat ? ch + 0.24 : ch;
    card(s, x, y, w, h, { fill: t.feat ? C.ink : C.card, shadowOpts: { opacity: t.feat ? 0.18 : 0.1 } });
    if (t.feat) { pill(s, "Most complete", x + w / 2 - 0.85, y + 0.22, { fill: C.gold, color: C.ink, fontSize: 9.5, w: 1.7 }); }
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
  // bottom note + treasure art
  const ny = top + ch + 0.5;
  card(s, MX, ny, PAGEW - 2 * MX, 0.9, { fill: T.gold, line: false, shadow: false });
  mascot(s, "ntreasure", { x: MX + 0.35, y: ny - 0.5, h: 1.6 });
  s.addText(
    [
      { text: "Ownership and subscription are independent entitlements.  ", options: { fontFace: F.display, fontSize: 13.5, bold: true, color: C.ink } },
      { text: "Tracked separately, never merged — so a cancelled subscriber still keeps every book they bought.", options: { fontFace: F.body, fontSize: 12, color: C.ink } },
    ],
    { x: MX + 2.05, y: ny, w: PAGEW - 2 * MX - 2.35, h: 0.9, align: "left", valign: "middle", lineSpacingMultiple: 1.06 }
  );
  footer(s, 23, "Features");
})();

// ============================================================
// SLIDE 24 — Know your child's favorite book
// ============================================================
(function favoriteBook() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Features", "Know your child's favorite book", { kickerFill: C.teal });
  const top = 1.85;
  // Left: the "favorite this month" card
  const lw = 4.9;
  card(s, MX, top, lw, 4.7, { fill: C.ink });
  pill(s, "Most re-read this month", MX + 0.35, top + 0.32, { fill: C.gold, color: C.ink, fontSize: 9.5 });
  // cover thumbnail
  const cw = 2.0, chh = cw / RATIO.cov_star;
  s.addShape("roundRect", { x: MX + lw / 2 - cw / 2 - 0.08, y: top + 1.0, w: cw + 0.16, h: chh + 0.16, rectRadius: 0.14, fill: { color: C.codeBg }, line: { type: "none" }, shadow: shadow({ opacity: 0.3 }) });
  s.addImage({ path: asset("cov_star.png"), x: MX + lw / 2 - cw / 2, y: top + 1.08, w: cw, h: chh });
  s.addText("Goodnight, Little Star", { x: MX + 0.3, y: top + 1.18 + chh, w: lw - 0.6, h: 0.4, align: "center", fontFace: F.display, fontSize: 16, bold: true, color: C.white });
  // re-read counter
  s.addText(
    [
      { text: "12×", options: { fontFace: F.display, fontSize: 30, bold: true, color: C.gold } },
      { text: "  opened this month", options: { fontFace: F.body, fontSize: 12, color: C.codeText } },
    ],
    { x: MX + 0.3, y: top + 1.62 + chh, w: lw - 0.6, h: 0.5, align: "center", valign: "middle" }
  );
  s.addText("More than twice any other book.", { x: MX + 0.3, y: top + 2.12 + chh, w: lw - 0.6, h: 0.4, align: "center", fontFace: F.body, fontSize: 11, italic: true, color: C.inkSoft });

  // Right: the reframe + rationale
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  s.addText("Not a dashboard. A window into your child's world.", {
    x: rx, y: top, w: rw, h: 0.78, fontFace: F.display, fontSize: 19, bold: true, color: C.ink, valign: "top", lineSpacingMultiple: 1.06,
  });
  const rows = [
    ["sync", C.teal, "Favorite = most repeated, not most recent", "A toddler's favorite is the one they ask for again and again — so we count re-reads, not last-opened."],
    ["eye", C.coral, "Tells you what they love", "Themes, characters, bedtime vs. adventure — the pattern says what's resonating right now."],
    ["handHeart", C.purple, "A conversation starter", "“You really love the star story, huh?” — a small prompt to connect over what they're reading."],
    ["feather", C.gold, "Quiet by design", "Surfaced gently inside parent mode — no charts, no streaks, no pressure on the child."],
  ];
  let y = top + 0.95;
  rows.forEach(([ic, col, t, d]) => {
    card(s, rx, y, rw, 0.86, { shadowOpts: { opacity: 0.08, blur: 5, offset: 2 } });
    iconChip(s, ic, rx + 0.22, y + 0.18, 0.5, col, { shadow: false });
    s.addText(
      [
        { text: t, options: { fontFace: F.display, fontSize: 12.5, bold: true, color: C.ink, breakLine: true } },
        { text: d, options: { fontFace: F.body, fontSize: 10.4, color: C.inkSoft } },
      ],
      { x: rx + 0.86, y: y + 0.06, w: rw - 1.05, h: 0.74, align: "left", valign: "middle", lineSpacingMultiple: 1.05 }
    );
    y += 0.96;
  });
  footer(s, 24, "Features");
})();

// ============================================================
// SLIDE 25 — Screen-time limit
// ============================================================
(function screenTime() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Features", "A screen-time limit the child accepts", { kickerFill: C.teal });
  const top = 1.85;
  // Left column: how the PARENT sets it
  const lw = 5.5;
  card(s, MX, top, lw, 4.7);
  s.addText("The parent sets the cap", { x: MX + 0.4, y: top + 0.28, w: lw - 0.8, h: 0.4, fontFace: F.display, fontSize: 16, bold: true, color: C.ink });
  const steps = [
    ["key", C.coral, "Behind the PIN gate", "The limit lives in parent mode — a child can't change or remove it."],
    ["clock", C.teal, "Pick a duration", "15 · 30 · 60 minutes, chosen as the tablet is handed over."],
    ["child", C.purple, "Hand it over", "Kid mode starts the clock silently in the background."],
  ];
  let y = top + 0.86;
  steps.forEach(([ic, col, t, d]) => {
    card(s, MX + 0.3, y, lw - 0.6, 1.1, { fill: C.bg, shadow: false, lineColor: C.line });
    iconChip(s, ic, MX + 0.5, y + 0.3, 0.5, col, { shadow: false });
    s.addText(t, { x: MX + 1.12, y: y + 0.18, w: lw - 1.5, h: 0.4, fontFace: F.display, fontSize: 13.5, bold: true, color: C.ink, valign: "middle" });
    s.addText(d, { x: MX + 0.5, y: y + 0.6, w: lw - 0.9, h: 0.42, fontFace: F.body, fontSize: 10.6, color: C.inkSoft, valign: "top", lineSpacingMultiple: 1.06 });
    y += 1.22;
  });

  // Right column: how it ENDS for the child — gentle
  const rx = MX + lw + 0.4, rw = PAGEW - MX - rx;
  card(s, rx, top, rw, 4.7, { fill: C.ink });
  pill(s, "When time's up", rx + 0.35, top + 0.3, { fill: C.gold, color: C.ink });
  mascot(s, "n13", { x: rx + rw / 2 - 1.45, y: top + 0.95, h: 2.1 });
  s.addText("\"Oyen's getting sleepy… let's rest now.\"", {
    x: rx + 0.35, y: top + 3.1, w: rw - 0.7, h: 0.7, align: "center", fontFace: F.display, fontSize: 17, bold: true, color: C.white, valign: "middle", lineSpacingMultiple: 1.08,
  });
  const gentle = [
    "No countdown numbers in front of the child",
    "Finish the current page first — never cut mid-story",
    "Oyen winds down; the session just ends softly",
  ];
  s.addText(gentle.map((t) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true } })), {
    x: rx + 0.6, y: top + 3.85, w: rw - 1.1, h: 0.85, fontFace: F.body, fontSize: 11, color: C.codeText, valign: "top", lineSpacingMultiple: 1.12, paraSpaceAfter: 3,
  });
  footer(s, 25, "Features");
})();

// ============================================================
// SLIDE 26 — System architecture
// ============================================================
(function arch() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Technical", "A pnpm monorepo with shared contracts", { kickerFill: C.blue });
  const top = 2.0;
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
  stackBox(x1, midY, boxW, boxH, "react", C.teal, "apps/web", ["React 19 + Vite", "TanStack Query v5", "Tailwind v4 · shadcn/ui", "Framer Motion"]);
  stackBox(x2, midY, boxW, boxH, "server", C.coral, "apps/api", ["Express 5 + TypeScript", "Prisma → PostgreSQL", "JWT + bcrypt · Zod", "Vitest"]);
  const sW = 4.0;
  const sx = (x1 + x2 + boxW) / 2 - sW / 2, sy = midY + boxH + 0.55;
  stackBox(sx, sy, sW, 1.7, "cube", C.purple, "packages/shared", ["TypeScript DTOs & contracts", "BookWithAccess · AccessResult · UserDTO"]);
  s.addText("HTTP / JSON", { x: x1 + boxW, y: midY + 0.55, w: gapX, h: 0.4, align: "center", valign: "middle", fontFace: F.body, fontSize: 9.5, bold: true, color: C.inkSoft });
  s.addShape("line", { x: x1 + boxW, y: midY + boxH / 2, w: gapX, h: 0, line: { color: C.inkSoft, width: 1.75, endArrowType: "triangle", beginArrowType: "triangle" } });
  s.addShape("line", { x: sx + sW * 0.3, y: sy, w: 0, h: -0.55, line: { color: C.purple, width: 1.75, endArrowType: "triangle" } });
  s.addShape("line", { x: sx + sW * 0.7, y: sy, w: 0, h: -0.55, line: { color: C.purple, width: 1.75, endArrowType: "triangle" } });
  s.addText("imported by\nweb + api", { x: sx + sW + 0.2, y: sy + 0.35, w: 2.2, h: 0.8, fontFace: F.body, fontSize: 10.5, italic: true, color: C.inkSoft, valign: "middle", lineSpacingMultiple: 1.05 });
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
  footer(s, 26, "Technical");
})();

// ============================================================
// SLIDE 27 — Access control engine
// ============================================================
(function access() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Technical", "One function, strict priority", { kickerFill: C.blue });
  const top = 1.85;
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
    code.map((line) => {
      const runs = line.map(([t, col]) => ({ text: t, options: { color: col } }));
      runs[runs.length - 1].options.breakLine = true;
      return runs;
    }).flat(),
    { x: rx + 0.3, y: top + 0.62, w: rw - 0.6, h: 2.9, fontFace: F.mono, fontSize: 12.5, valign: "top", lineSpacingMultiple: 1.32 }
  );
  // Oyen with the lock, tucked under the code card
  mascot(s, "n10", { x: rx, y: top + 3.78, h: 1.2 });
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
  card(s, MX, top + 4.3, lw, 0.62, { fill: C.muted, line: false, shadow: false });
  iconChip(s, "shield", MX + 0.18, top + 4.41, 0.4, C.teal, { shadow: false });
  s.addText("Frontend mirrors it in two layers — route guards + a component-level PIN gate.", {
    x: MX + 0.74, y: top + 4.3, w: lw - 0.92, h: 0.62, fontFace: F.body, fontSize: 11, italic: true, color: C.ink, valign: "middle", lineSpacingMultiple: 1.05,
  });
  footer(s, 27, "Technical");
})();

// ============================================================
// SLIDE 28 — Data model
// ============================================================
(function dataModel() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Technical", "Entities, and the decisions behind them", { kickerFill: C.blue });
  const top = 1.85;
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
  s.addText("1:N", { x: MX + 3.25, y: top + 0.5, w: 0.45, h: 1.0, align: "center", valign: "middle", fontFace: F.body, fontSize: 9, bold: true, color: C.inkSoft });
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
  footer(s, 28, "Technical");
})();

// ============================================================
// SLIDE 29 — Trade-offs
// ============================================================
(function tradeoffs() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Technical", "What I cut — and why it's the right cut", { kickerFill: C.blue });
  const top = 1.82, gap = 0.3;
  const c = cols(2, gap), ch = 0.92, rowGap = 0.16;
  const items = [
    ["lock", C.coral, "Mocked payments", "Real Midtrans/Stripe", "Proves access & commerce flows without provider onboarding."],
    ["fingerprint", C.purple, "Client-side PIN (demo)", "Hashed server PIN", "Scoped for the demo; production moves it server-side."],
    ["sync", C.blue, "DB check per API call", "Cache sub in JWT claims", "Accuracy over speed — sub status can change any moment."],
    ["robot", C.teal, "Browser TTS voice", "Recorded human VO", "Read-aloud ships now via speech synthesis; studio narration + word-highlighting later."],
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
  footer(s, 29, "Technical");
})();

// ============================================================
// SLIDE 30 — Demo vs Real (honest shortcuts)
// ============================================================
(function demoVsReal() {
  const s = pptx.addSlide(); bg(s);
  header(s, "Technical", "Honest about what's a demo shortcut", { kickerFill: C.blue });
  const top = 1.95;
  const c = cols(2, 0.4);
  // two column headers
  const heads = [
    { col: C.gold, ic: "flask", t: "In this demo", sub: "Built to prove the product" },
    { col: C.teal, ic: "rocket", t: "In production", sub: "What ships for real" },
  ];
  heads.forEach((hd, i) => {
    const x = c[i].x, w = c[i].w;
    s.addShape("roundRect", { x, y: top, w, h: 0.76, rectRadius: 0.14, fill: { color: i === 0 ? C.muted : C.ink }, line: { type: "none" } });
    iconChip(s, hd.ic, x + 0.22, top + 0.13, 0.5, hd.col, { variant: i === 0 ? "ink" : "white", shadow: false });
    s.addText(
      [
        { text: hd.t + "   ", options: { fontFace: F.display, fontSize: 15, bold: true, color: i === 0 ? C.ink : C.white } },
        { text: hd.sub, options: { fontFace: F.body, fontSize: 10, italic: true, color: i === 0 ? C.inkSoft : C.codeText } },
      ],
      { x: x + 0.84, y: top, w: w - 1.0, h: 0.76, align: "left", valign: "middle" }
    );
  });
  const pairs = [
    ["Mocked payment — instant success", "Real gateway, webhooks, retries & refunds"],
    ["PIN checked on the client", "Hashed PIN verified server-side"],
    ["Seeded catalog of 6 books", "Full publishing pipeline + real illustrations"],
    ["Read-aloud via browser TTS", "Studio-recorded narration + word highlighting"],
    ["Single child per account", "Multi-child profiles with separate progress"],
    ["Screen-time limit, local only", "OS-level Screen Time / Family Link hooks"],
  ];
  const rh = 0.54, rgap = 0.12;
  let y = top + 0.94;
  pairs.forEach((p, i) => {
    [0, 1].forEach((ci) => {
      const x = c[ci].x, w = c[ci].w;
      card(s, x, y, w, rh, { fill: ci === 0 ? C.card : T.teal, line: ci === 1 ? false : true, lineColor: C.line, shadowOpts: { opacity: 0.06, blur: 4, offset: 1 } });
      iconChip(s, ci === 0 ? "napkin" : "check", x + 0.2, y + 0.13, 0.36, ci === 0 ? C.inkSoft : C.teal, { shadow: false, inset: 0.24 });
      s.addText(p[ci], { x: x + 0.68, y, w: w - 0.85, h: rh, fontFace: F.body, fontSize: 11, color: C.ink, valign: "middle", lineSpacingMultiple: 1.0 });
    });
    // arrow between columns
    s.addText("→", { x: c[0].x + c[0].w, y, w: 0.4, h: rh, align: "center", valign: "middle", fontFace: F.display, fontSize: 16, bold: true, color: C.coral });
    y += rh + rgap;
  });
  footer(s, 30, "Technical");
})();

// ============================================================
// SLIDE 31 — Closing
// ============================================================
(function closing() {
  const s = pptx.addSlide(); bg(s, C.ink);
  // soft gold disc behind Oyen
  s.addShape("ellipse", { x: PAGEW / 2 - 1.7, y: 0.9, w: 3.4, h: 3.4, fill: { color: C.coral }, line: { type: "none" }, shadow: shadow({ opacity: 0.25, blur: 16, offset: 5 }) });
  mascot(s, "n9", { x: PAGEW / 2 - 1.35, y: 1.0, h: 3.2 });
  s.addText("Storybook", { x: 0, y: 4.35, w: PAGEW, h: 0.9, align: "center", fontFace: F.display, fontSize: 46, bold: true, color: C.white });
  s.addText("A paid digital library where a child can roam freely — and a parent stays in control.", {
    x: PAGEW / 2 - 4.5, y: 5.25, w: 9, h: 0.7, align: "center", fontFace: F.body, fontSize: 14, italic: true, color: C.codeText, lineSpacingMultiple: 1.1,
  });
  // wordmark line
  s.addShape("line", { x: PAGEW / 2 - 1.5, y: 6.05, w: 3.0, h: 0, line: { color: C.gold, width: 2 } });
  s.addText("Thank you", { x: 0, y: 6.2, w: PAGEW, h: 0.5, align: "center", fontFace: F.display, fontSize: 18, bold: true, color: C.gold });
  s.addText("Muhammad Rayhan Yovi  ·  Product Design & Engineering", {
    x: 0, y: 6.7, w: PAGEW, h: 0.35, align: "center", fontFace: F.body, fontSize: 11, color: C.inkSoft,
  });
})();
// ============================================================

const OUT = path.join(__dirname, "Storybook.pptx");
pptx.writeFile({ fileName: OUT }).then(() => console.log("Wrote " + OUT)).catch((e) => { console.error(e); process.exit(1); });
