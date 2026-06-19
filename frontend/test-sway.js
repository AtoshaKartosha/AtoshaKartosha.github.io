/* eslint-disable */
const assert = require("assert");

// Test sway amplitude logic
function getSwayAmp(itemWidth) {
  return Math.min(1.2 * (10 / itemWidth), 2.5);
}

console.log("Running sway amplitude tests...");
assert.strictEqual(getSwayAmp(10), 1.2);
assert.ok(Math.abs(getSwayAmp(26) - 0.4615) < 0.001);
assert.strictEqual(getSwayAmp(2), 2.5); // capped at 2.5
assert.strictEqual(getSwayAmp(4), 2.5); // capped at 2.5
console.log("Sway amplitude tests passed!");

// Test sway enabled logic
function isSwayEnabled(itemId, isHovered) {
  return itemId !== "phone" && itemId !== "clock" && !isHovered;
}

console.log("Running sway enabled tests...");
assert.strictEqual(isSwayEnabled("phone", false), false);
assert.strictEqual(isSwayEnabled("clock", false), false);
assert.strictEqual(isSwayEnabled("dossier", false), true);
assert.strictEqual(isSwayEnabled("dossier", true), false);
assert.strictEqual(isSwayEnabled("suspect-1", false), true);
console.log("Sway enabled tests passed!");

// Test sway formula limits
// Formula: rot = amp * (sin(t * f1 + p1) * 0.6 + sin(t * f2 + p2) * 0.3 + sin(t * f3 + p3) * 0.1)
function getRot(t, amp, seed) {
  const f1 = 0.0008;
  const f2 = 0.0013;
  const f3 = 0.0021;
  const p1 = seed * 1.3;
  const p2 = seed * 2.7;
  const p3 = seed * 4.1;
  return amp * (Math.sin(t * f1 + p1) * 0.6 + Math.sin(t * f2 + p2) * 0.3 + Math.sin(t * f3 + p3) * 0.1);
}

console.log("Running rotation limits tests...");
const seed = 120; // arbitrary seed
const amp = getSwayAmp(10); // amp is 1.2
for (let t = 0; t < 100000; t += 100) {
  const rot = getRot(t, amp, seed);
  assert.ok(Math.abs(rot) <= amp, `Rotation ${rot} exceeded max amplitude ${amp}`);
}
console.log("Rotation limits tests passed!");
console.log("All tests passed successfully!");
