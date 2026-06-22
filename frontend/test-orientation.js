/* eslint-disable */
const assert = require("assert");

// Pure functions matching the logic implemented in the React application

function getIsMobile(innerWidth) {
  return innerWidth < 768;
}

function getIsTablet(innerWidth) {
  return innerWidth >= 768 && innerWidth < 1024;
}

function getIsPortrait(isMobile, isTablet, innerWidth, innerHeight) {
  return (isMobile || isTablet) && innerHeight > innerWidth;
}

function shouldShowOverlay(isMobile, isTablet, isPortrait) {
  return (isMobile || isTablet) && isPortrait;
}

function calculateCoverCoords(x, y, w, h, boardWidth, boardHeight) {
  if (boardWidth === 0 || boardHeight === 0) {
    return {
      left: `${(x / 1385.92) * 100}%`,
      top: `${(y / 773.53) * 100}%`,
      width: `${(w / 1385.92) * 100}%`,
      height: `${(h / 773.53) * 100}%`,
    };
  }
  const W_i = 1385.92;
  const H_i = 773.53;
  const R_i = W_i / H_i;
  const R_c = boardWidth / boardHeight;

  let W_scaled = 0;
  let H_scaled = 0;
  let offset_x = 0;
  let offset_y = 0;

  if (R_c > R_i) {
    W_scaled = boardWidth;
    H_scaled = boardWidth / R_i;
    offset_x = 0;
    offset_y = (boardHeight - H_scaled) / 2;
  } else {
    H_scaled = boardHeight;
    W_scaled = boardHeight * R_i;
    offset_x = (boardWidth - W_scaled) / 2;
    offset_y = 0;
  }

  const left = offset_x + (x / W_i) * W_scaled;
  const top = offset_y + (y / H_i) * H_scaled;
  const width = (w / W_i) * W_scaled;
  const height = (h / H_i) * H_scaled;

  return {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
}

console.log("Running mobile/tablet detection tests...");
// Desktop widths
assert.strictEqual(getIsMobile(1920), false);
assert.strictEqual(getIsMobile(1024), false);
assert.strictEqual(getIsTablet(1920), false);
assert.strictEqual(getIsTablet(1024), false);

// Tablet widths
assert.strictEqual(getIsMobile(900), false);
assert.strictEqual(getIsTablet(900), true);
assert.strictEqual(getIsTablet(768), true);

// Mobile widths
assert.strictEqual(getIsMobile(767), true);
assert.strictEqual(getIsMobile(375), true);
assert.strictEqual(getIsTablet(375), false);
console.log("Mobile/tablet detection tests passed!");

console.log("Running portrait detection tests...");
// Desktop sizes (even if height > width, should be false)
assert.strictEqual(getIsPortrait(getIsMobile(1200), getIsTablet(1200), 1200, 1600), false);

// Tablet landscape (width > height)
assert.strictEqual(getIsPortrait(getIsMobile(900), getIsTablet(900), 900, 700), false);

// Tablet portrait (width < height)
assert.strictEqual(getIsPortrait(getIsMobile(768), getIsTablet(768), 768, 1024), true);

// Mobile landscape (width > height)
assert.strictEqual(getIsPortrait(getIsMobile(600), getIsTablet(600), 600, 400), false);

// Mobile portrait (width < height)
assert.strictEqual(getIsPortrait(getIsMobile(375), getIsTablet(375), 375, 812), true);
console.log("Portrait detection tests passed!");

console.log("Running overlay display condition tests...");
// Desktop should never show overlay
assert.strictEqual(shouldShowOverlay(false, false, false), false);
assert.strictEqual(shouldShowOverlay(false, false, true), false);

// Tablet landscape should not show overlay
assert.strictEqual(shouldShowOverlay(false, true, false), false);

// Tablet portrait MUST show overlay
assert.strictEqual(shouldShowOverlay(false, true, true), true);

// Mobile landscape should not show overlay
assert.strictEqual(shouldShowOverlay(true, false, false), false);

// Mobile portrait MUST show overlay
assert.strictEqual(shouldShowOverlay(true, false, true), true);
console.log("Overlay display condition tests passed!");

console.log("Running cover coordinates tests...");

// Edge case: boardWidth is 0
const resZeroWidth = calculateCoverCoords(690, 640, 185, 105, 0, 768);
assert.strictEqual(resZeroWidth.left, `${(690 / 1385.92) * 100}%`);
assert.strictEqual(resZeroWidth.top, `${(640 / 773.53) * 100}%`);
assert.strictEqual(resZeroWidth.width, `${(185 / 1385.92) * 100}%`);
assert.strictEqual(resZeroWidth.height, `${(105 / 773.53) * 100}%`);

// Edge case: boardHeight is 0
const resZeroHeight = calculateCoverCoords(690, 640, 185, 105, 1024, 0);
assert.strictEqual(resZeroHeight.left, `${(690 / 1385.92) * 100}%`);
assert.strictEqual(resZeroHeight.top, `${(640 / 773.53) * 100}%`);
assert.strictEqual(resZeroHeight.width, `${(185 / 1385.92) * 100}%`);
assert.strictEqual(resZeroHeight.height, `${(105 / 773.53) * 100}%`);

// Standard Case 1: Exact scale matches baseline aspect ratio (R_c === R_i)
const exactScale = calculateCoverCoords(690, 640, 185, 105, 1385.92, 773.53);
assert.strictEqual(exactScale.left, "690px");
assert.strictEqual(exactScale.top, "640px");
assert.strictEqual(exactScale.width, "185px");
assert.strictEqual(exactScale.height, "105px");

// Standard Case 2: R_c > R_i (board is wider than baseline ratio)
const wideRes = calculateCoverCoords(690, 640, 185, 105, 2000, 800);
function checkPx(val, expected) {
  const num = parseFloat(val);
  assert.ok(Math.abs(num - expected) < 0.01, `Expected ${expected} but got ${val}`);
}
checkPx(wideRes.left, (690 / 1385.92) * 2000);
checkPx(wideRes.top, ((800 - (2000 * 773.53 / 1385.92)) / 2) + (640 / 773.53) * (2000 * 773.53 / 1385.92));
checkPx(wideRes.width, (185 / 1385.92) * 2000);
checkPx(wideRes.height, (105 / 773.53) * (2000 * 773.53 / 1385.92));

// Standard Case 3: R_c < R_i (board is taller than baseline ratio)
const tallRes = calculateCoverCoords(690, 640, 185, 105, 1000, 1000);
checkPx(tallRes.left, ((1000 - (1000 * (1385.92 / 773.53))) / 2) + (690 / 1385.92) * (1000 * (1385.92 / 773.53)));
checkPx(tallRes.top, (640 / 773.53) * 1000);
checkPx(tallRes.width, (185 / 1385.92) * (1000 * (1385.92 / 773.53)));
checkPx(tallRes.height, (105 / 773.53) * 1000);

console.log("Cover coordinates tests passed!");

// Test suspect photo padding
console.log("Running suspect photo padding verification tests...");
const fs = require("fs");
const path = require("path");

const boardSvgsContent = fs.readFileSync(path.join(__dirname, "src/components/BoardSvgs.tsx"), "utf8");
const boardPopupContent = fs.readFileSync(path.join(__dirname, "src/components/BoardPopup.tsx"), "utf8");

assert.ok(boardSvgsContent.includes("p-[2%]"), "BoardSvgs.tsx should contain reduced photo padding (p-[2%])");
assert.ok(boardPopupContent.includes("p-[2%]"), "BoardPopup.tsx should contain reduced photo padding (p-[2%])");
assert.ok(!boardPopupContent.includes("bg-[#f5f4ef] p-[5%] aspect-square"), "BoardPopup.tsx should not contain the old p-[5%] padding for suspect photo");
console.log("Suspect photo padding verification tests passed!");

// Test isZIndexRaised removal to ensure synchronous zIndex on hover
console.log("Running zIndex synchronization verification tests...");
const detectiveBoardContent = fs.readFileSync(path.join(__dirname, "src/components/DetectiveBoard.tsx"), "utf8");
assert.ok(!detectiveBoardContent.includes("isZIndexRaised"), "DetectiveBoard.tsx should not contain isZIndexRaised state/effect anymore");
console.log("zIndex synchronization verification tests passed!");
console.log("All orientation and mobile detection tests passed successfully!");

// Test presence of isTablet in useBoardStore.ts and tablet coordinates in boardItems.ts
console.log("Running codebase structural tests for tablet mode...");
const useBoardStoreContent = fs.readFileSync(path.join(__dirname, "src/stores/useBoardStore.ts"), "utf8");
assert.ok(useBoardStoreContent.includes("isTablet"), "useBoardStore.ts should contain isTablet state/setters");

const boardItemsContent = fs.readFileSync(path.join(__dirname, "src/data/boardItems.ts"), "utf8");
assert.ok(boardItemsContent.includes("tablet: {"), "boardItems.ts should define tablet coordinates");

const mobileMagnifierContent = fs.readFileSync(path.join(__dirname, "src/components/MobileMagnifier.tsx"), "utf8");
assert.ok(mobileMagnifierContent.includes("isTablet"), "MobileMagnifier.tsx should contain isTablet checks for positions");

const fluidGlassCursorContent = fs.readFileSync(path.join(__dirname, "src/components/FluidGlassCursor.tsx"), "utf8");
assert.ok(fluidGlassCursorContent.includes("isMobile || isTablet"), "FluidGlassCursor.tsx should disable itself on tablet");

assert.ok(detectiveBoardContent.includes("(isMobile || isTablet) && <MobileMagnifier"), "DetectiveBoard.tsx should render MobileMagnifier on tablet");

console.log("Codebase structural tests passed!");
