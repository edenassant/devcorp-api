const { add, greet } = require("./app");

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✓ ${message}`);
        passed++;
    } else {
        console.error(`✗ ${message}`);
        failed++;
    }
}

assert(add(2, 3) === 5, "add(2, 3) doit retourner 5");
assert(add(-1, 1) === 0, "add(-1, 1) doit retourner 0");
assert(
    greet("World") === "Hello, World!",
    "greet doit retourner la bonne chaîne",
);

console.log(`\nRésultats: ${passed} passés, ${failed} échoués`);
if (failed > 0) process.exit(1);