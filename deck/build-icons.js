// Rasterize react-icons (Font Awesome) to PNG in the product's palette.
// Output: deck/icons/<key>_<variant>.png
const fs = require("fs");
const path = require("path");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const FA = require("react-icons/fa");
const sharp = require("sharp");

const OUT = path.join(__dirname, "icons");
fs.mkdirSync(OUT, { recursive: true });

// key -> Font Awesome component name
const ICONS = {
  book: "FaBook",
  bookOpen: "FaBookOpen",
  bookReader: "FaBookReader",
  user: "FaUser",
  child: "FaChild",
  baby: "FaBaby",
  shield: "FaShieldAlt",
  userShield: "FaUserShield",
  userCog: "FaUserCog",
  users: "FaUsers",
  cog: "FaCog",
  slidersH: "FaSlidersH",
  lock: "FaLock",
  lockOpen: "FaLockOpen",
  key: "FaKey",
  creditCard: "FaCreditCard",
  gift: "FaGift",
  sync: "FaSyncAlt",
  chartLine: "FaChartLine",
  chartBar: "FaChartBar",
  bullseye: "FaBullseye",
  react: "FaReact",
  server: "FaServer",
  cube: "FaCube",
  cubes: "FaCubes",
  database: "FaDatabase",
  rocket: "FaRocket",
  balance: "FaBalanceScale",
  robot: "FaRobot",
  check: "FaCheckCircle",
  checkPlain: "FaCheck",
  link: "FaLink",
  warning: "FaExclamationTriangle",
  hand: "FaHandPointer",
  heart: "FaHeart",
  handHeart: "FaHandHoldingHeart",
  bulb: "FaLightbulb",
  arrow: "FaArrowRight",
  cart: "FaShoppingCart",
  ban: "FaBan",
  clock: "FaClock",
  mobile: "FaMobileAlt",
  eye: "FaEye",
  store: "FaStore",
  layers: "FaLayerGroup",
  code: "FaCode",
  bolt: "FaBolt",
  star: "FaStar",
  crown: "FaCrown",
  infinity: "FaInfinity",
  seedling: "FaSeedling",
  compass: "FaCompass",
  feather: "FaFeatherAlt",
  receipt: "FaReceipt",
  fingerprint: "FaFingerprint",
  hourglass: "FaHourglassHalf",
  exchange: "FaExchangeAlt",
  unlink: "FaUnlink",
  calendar: "FaCalendarAlt",
  flask: "FaFlask",
  magic: "FaMagic",
  puzzle: "FaPuzzlePiece",
  route: "FaRoute",
  tag: "FaTag",
  wallet: "FaWallet",
  napkin: "FaStream",
};

const VARIANTS = {
  white: "FFFFFF",
  ink: "3A2E28",
  coral: "FF7B54",
  teal: "2EC4B6",
};

const SIZE = 512;

async function render(faName, hex, outPath) {
  const Icon = FA[faName];
  if (!Icon) throw new Error("Missing icon: " + faName);
  let svg = renderToStaticMarkup(React.createElement(Icon, { size: SIZE }));
  svg = svg.replace(/currentColor/g, "#" + hex);
  await sharp(Buffer.from(svg)).png().toFile(outPath);
}

(async () => {
  let n = 0;
  for (const [key, faName] of Object.entries(ICONS)) {
    for (const [vName, hex] of Object.entries(VARIANTS)) {
      await render(faName, hex, path.join(OUT, `${key}_${vName}.png`));
      n++;
    }
  }
  console.log(`Rendered ${n} icon PNGs to ${OUT}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
