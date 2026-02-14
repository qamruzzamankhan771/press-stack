const cheerio = require('cheerio');
const { generateFields } = require('../lib/fieldGenerator');
const { compileHTML } = require('../lib/compiler');

const hasDeepSlug = (fields, slug) => {
    if (!fields) return false;
    for (const f of fields) {
        if (f.slug === slug) return true;
        if (f.children && hasDeepSlug(f.children, slug)) return true;
    }
    return false;
};

const tests = [
    // --- COMPLIANCE BASELINE (1-25) ---
    { name: "TEST 1: Plain List", input: "<ul><li>Alpha</li><li>Beta</li></ul>", checks: [{ cond: "Slug is items", check: (r) => hasDeepSlug(r.model, 'items') }] },
    { name: "TEST 16: Single H1 Enforcement", input: '<h1>A</h1><h1>B</h1>', checks: [{ cond: "Output contains only one H1", check: (r) => (r.optimizedHtml.match(/<h1/g) || []).length === 1 }] },
    { name: "TEST 18: Anchor Misuse", input: '<a href="#" class="btn">Click</a>', checks: [{ cond: "Converted to button", check: (r) => r.optimizedHtml.includes('<button type="button"') }] },
    { name: "TEST 24: Landmark structure valid", input: '<div>Content</div>', checks: [{ cond: "Main landmark added", check: (r) => r.optimizedHtml.includes('<main id="main-content">') }] },

    // --- STRESS DRILL SCENARIOS (26-32) ---
    {
        name: "SCENARIO 1: Hero Conflict & Nested H1s",
        input: `<div class="hero"><h1>Main Title</h1><h1>Duplicate Title</h1><ul class="items"><li><h1>Item Heading</h1></li><li><h1>Item Heading 2</h1></li></ul><img src="banner.jpg"><a href="#">Click here</a></div>`,
        checks: [
            { cond: "Only one global H1", check: (r) => (r.optimizedHtml.match(/<h1/g) || []).length === 1 },
            { cond: "Nested H1s demoted in list", check: (r) => r.optimizedHtml.includes('<h2>Item Heading</h2>') },
            { cond: "Hero upgraded to section", check: (r) => r.optimizedHtml.includes('<section class="hero"') }
        ]
    },
    {
        name: "SCENARIO 3: Deep Structural Boilerplate",
        input: `<div><div><div><div><div><div><section><h2>Deep Content</h2></section></div></div></div></div></div></div>`,
        checks: [
            { cond: "Cleaned redundant wrappers", check: (r) => r.optimizedHtml.split('<div').length < 3 }
        ]
    },
    {
        name: "SCENARIO 6: Broken ARIA Conflict",
        input: `<button aria-hidden="true">Submit</button><div role="button">Click Me</div>`,
        checks: [
            { cond: "Fixed hidden interactive", check: (r) => !r.optimizedHtml.includes('aria-hidden="true"') }
        ]
    },
    {
        name: "SCENARIO 7: Landmark Nesting Violation",
        input: `<main><main><h1>Title</h1></main></main>`,
        checks: [
            { cond: "Deduplicated main", check: (r) => (r.optimizedHtml.match(/<main/g) || []).length === 1 }
        ]
    }
];

async function runIntegrationTest() {
    let allPassed = true;
    let failCount = 0;

    console.log("=================================================");
    console.log("🚀 UNIFIED PIPELINE INTEGRATION TEST (v3.2.0)");
    console.log("=================================================");

    for (let test of tests) {
        console.log(`\n▶️ INTEGRATION: ${test.name}`);
        try {
            const result = compileHTML(test.input);

            let testPassed = true;
            test.checks.forEach(c => {
                if (c.check(result)) {
                    console.log(`  ✅ [PASS] ${c.cond}`);
                } else {
                    console.log(`  ❌ [FAIL] ${c.cond}`);
                    testPassed = false;
                }
            });

            if (!testPassed) {
                allPassed = false;
                failCount++;
                console.log("\n--- FAILURE DIAGNOSTICS ---");
                console.log("Input HTML:", test.input);
                console.log("Optimized HTML:", result.optimizedHtml);
            }
        } catch (err) {
            console.error(`  💥 COMPILER THREW ERROR:`, err.message);
            allPassed = false;
            failCount++;
        }
    }

    console.log("\n=================================================");
    console.log("📊 INTEGRATION STALIZATION REPORT");
    console.log("=================================================");
    console.log(`Tests Run: ${tests.length}`);
    console.log(`Pass Count: ${tests.length - failCount}`);
    console.log(`Fail Count: ${failCount}`);

    if (allPassed) {
        console.log("✅ PIPELINE CERTIFIED: Structural Integrity Enforced.");
        process.exit(0);
    } else {
        console.log("❌ PIPELINE COMPROMISED: Structural Bypass Detected.");
        process.exit(1);
    }
}

runIntegrationTest();
