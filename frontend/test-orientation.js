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

console.log("All orientation and mobile detection tests passed successfully!");
