/* eslint-disable */
const assert = require("assert");

// Pure functions matching the logic implemented in the React application

function getIsMobile(innerWidth) {
  return innerWidth < 1024;
}

function getIsPortrait(isMobile, innerWidth, innerHeight) {
  return isMobile && innerHeight > innerWidth;
}

function shouldShowOverlay(isMobile, isPortrait) {
  return isMobile && isPortrait;
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

console.log("Running mobile detection tests...");
// Desktop widths
assert.strictEqual(getIsMobile(1920), false);
assert.strictEqual(getIsMobile(1024), false);
// Mobile widths
assert.strictEqual(getIsMobile(1023), true);
assert.strictEqual(getIsMobile(375), true);
console.log("Mobile detection tests passed!");

console.log("Running portrait detection tests...");
// Desktop sizes (even if height > width, isMobile should be false, so isPortrait should be false)
assert.strictEqual(getIsPortrait(getIsMobile(1200), 1200, 1600), false);

// Mobile landscape (width > height)
assert.strictEqual(getIsPortrait(getIsMobile(900), 900, 450), false);

// Mobile portrait (width < height)
assert.strictEqual(getIsPortrait(getIsMobile(375), 375, 812), true);
assert.strictEqual(getIsPortrait(getIsMobile(768), 768, 1024), true);
console.log("Portrait detection tests passed!");

console.log("Running overlay display condition tests...");
// Desktop should never show overlay
assert.strictEqual(shouldShowOverlay(false, false), false);
assert.strictEqual(shouldShowOverlay(false, true), false);

// Mobile landscape should not show overlay
assert.strictEqual(shouldShowOverlay(true, false), false);

// Mobile portrait MUST show overlay
assert.strictEqual(shouldShowOverlay(true, true), true);
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

console.log("All orientation and mobile detection tests passed successfully!");
