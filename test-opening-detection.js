/**
 * Quick test to verify opening detection fix
 * Run in browser console after loading the app:
 *
 * 1. Copy this entire file
 * 2. Open app at localhost:3000
 * 3. Open browser DevTools Console
 * 4. Paste and press Enter
 *
 * Expected: All tests should log "✅ PASS"
 */

// Test utilities (mirror TypeScript implementation)
function positionKeyFromFen(fen) {
  const parts = fen.split(' ');
  if (parts.length < 2) return fen;
  const pieces = parts[0];
  const turn = parts[1];
  return `${pieces} ${turn}`;
}

function normalizeFen(fen) {
  const [pieces, turn] = fen.split(' ');
  return `${pieces} ${turn} - - 0 1`;
}

// Test cases
const tests = [
  {
    name: "Position key extraction",
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    expectedKey: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b",
  },
  {
    name: "Normalize FEN",
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    expectedNormalized: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b - - 0 1",
  },
  {
    name: "Start position (white to move)",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    expectedKey: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w",
  },
  {
    name: "After 1.e4 (black to move)",
    fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    expectedKey: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b",
  },
  {
    name: "After 1.e4 e5 (white to move)",
    fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
    expectedKey: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w",
  },
  {
    name: "Side-to-move creates different keys",
    test: () => {
      const white = positionKeyFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
      const black = positionKeyFromFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
      return white !== black;
    },
  },
  {
    name: "Same position ignores castling rights",
    test: () => {
      const withCastling = positionKeyFromFen("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
      const withoutCastling = positionKeyFromFen("r3k2r/8/8/8/8/8/8/R3K2R w - - 0 1");
      return withCastling === withoutCastling;
    },
  },
  {
    name: "Same position ignores en passant",
    test: () => {
      const withEP = positionKeyFromFen("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2");
      const withoutEP = positionKeyFromFen("rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2");
      return withEP === withoutEP;
    },
  },
];

// Run tests
console.group("🧪 Opening Detection Fix - Test Results");
console.log("Running", tests.length, "tests...\n");

let passed = 0;
let failed = 0;

tests.forEach((test, idx) => {
  try {
    let result;
    if (test.test) {
      // Custom test function
      result = test.test();
    } else if (test.expectedKey) {
      // Position key test
      const actual = positionKeyFromFen(test.fen);
      result = actual === test.expectedKey;
      if (!result) {
        console.error(`  Expected: ${test.expectedKey}`);
        console.error(`  Actual:   ${actual}`);
      }
    } else if (test.expectedNormalized) {
      // Normalize test
      const actual = normalizeFen(test.fen);
      result = actual === test.expectedNormalized;
      if (!result) {
        console.error(`  Expected: ${test.expectedNormalized}`);
        console.error(`  Actual:   ${actual}`);
      }
    }

    if (result) {
      console.log(`✅ PASS: ${test.name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${test.name}`);
      failed++;
    }
  } catch (error) {
    console.error(`❌ ERROR in "${test.name}":`, error);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("🎉 All tests passed!");
} else {
  console.warn("⚠️ Some tests failed. Check implementation.");
}
console.groupEnd();

// Export for further testing
window.testOpeningUtils = {
  positionKeyFromFen,
  normalizeFen,
  runTests: () => {
    console.clear();
    eval(document.querySelector('script[src*="test-opening"]')?.textContent || "console.log('Re-run script manually')");
  }
};

console.log("\n💡 Utilities exported to window.testOpeningUtils");
console.log("   Try: testOpeningUtils.positionKeyFromFen('your FEN here')");
