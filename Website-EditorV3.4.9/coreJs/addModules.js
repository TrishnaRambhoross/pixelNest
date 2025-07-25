// Global variables and utilities
const TEMPLATE_BASE = "templates/";

// Layout group types
const BLOCK_GROUPS = {
  header: [
    { label: "header01", type: "header1" },
    { label: "header02", type: "header2" }
  ],
  hero: [
    { label: "Hero", type: "hero" }
  ],
  newsletter: [
    { label: "Side-by-side with details", type: "newsletter1" },
    { label: "Simple side-by-side on dark", type: "newsletter2" }
  ],
  slider: [
    { label: "basic-slider01", type: "slider1" }
  ]
};

// ✅ Helper: Check if block is a column layout
function isColumnBlock(type) {
  return /^columns[1-6]$/.test(type);
}

// Resolve block path by type
function resolveBlockPath(type) {
  const typeToPath = {
    text: "assets/text.html",
    image: "assets/image.html",
    video: "assets/video.html",
    cta: "assets/cta.html",
    hero: "hero/hero.html",
    header1: "header/header-plain-01.php",
    header2: "header/center-aligned-header-with-logo.php",
    newsletter1: "newsletter/side-by-side-detail.php",
    newsletter2: "newsletter/simple-side-by-side-dark.php",
    slider1: "slider/basic-slider.php",
  };

  if (type.startsWith("columns")) {
    let count = parseInt(type.replace("columns", ""), 10);
    count = Math.min(Math.max(count, 1), 6);
    return `${TEMPLATE_BASE}assets/columns${count}.html`;
  }

  if (typeToPath[type]) {
    return `${TEMPLATE_BASE}${typeToPath[type]}`;
  }

  return null;
}