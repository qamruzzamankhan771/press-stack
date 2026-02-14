const cheerio = require('cheerio');
const { generateFields } = require('./lib/fieldGenerator');
const { optimizeSEO } = require('./lib/seoOptimizer');
const { optimizeAccessibility } = require('./lib/accessibilityOptimizer');

const hasDeepSlug = (fields, slug) => {
    if (!fields) return false;
    for (const f of fields) {
        if (f.slug === slug) return true;
        if (f.children && hasDeepSlug(f.children, slug)) return true;
    }
    return false;
};

const getFieldBySlug = (fields, slug) => {
    if (!fields) return null;
    for (const f of fields) {
        if (f.slug === slug) return f;
        if (f.children) {
            const res = getFieldBySlug(f.children, slug);
            if (res) return res;
        }
    }
    return null;
};

const tests = [
    // --- 1-25: COMPLIANCE BASELINE ---
    { name: "TEST 1: Plain List", input: "<ul><li>Alpha</li><li>Beta</li></ul>", checks: [{ cond: "Slug is items", check: (f) => hasDeepSlug(f, 'items') }] },
    { name: "TEST 2: List With Link", input: "<ul><li><a href='#'>Link</a></li></ul>", checks: [{ cond: "Link field detected", check: (f) => hasDeepSlug(f, 'item_link') }] },
    { name: "TEST 3: Nested Card", input: "<div class='card'><h3>Title</h3><ul><li>One</li></ul></div>", checks: [{ cond: "Nested loop detected", check: (f) => { const c = getFieldBySlug(f, 'card'); return c && hasDeepSlug(c.children, 'items'); } }] },
    { name: "TEST 4: Basic Card Naming", input: '<div class="card"><h3>Starter</h3></div>', checks: [{ cond: "Contextual naming card_title", check: (f) => hasDeepSlug(f, 'card_title') }] },
    { name: "TEST 5: Hero Section Naming", input: '<section class="hero"><h1>Welcome</h1></section>', checks: [{ cond: "Hero context hero_title", check: (f) => hasDeepSlug(f, 'hero_title') }] },
    { name: "TEST 6: Repeater Plural Naming", input: '<ul class="features"><li>Fast</li></ul>', checks: [{ cond: "Subfield is singular feature", check: (f) => { const r = getFieldBySlug(f, 'features'); return r && hasDeepSlug(r.children, 'feature'); } }] },
    { name: "TEST 7: Nested Plan Naming", input: '<div class="plan"><h3>Pro</h3></div>', checks: [{ cond: "Plan title detected", check: (f) => hasDeepSlug(f, 'plan_title') }] },
    { name: "TEST 8: No Class Context", input: '<div><h2>About</h2></div>', checks: [{ cond: "Fallback to title", check: (f) => hasDeepSlug(f, 'title') }] },
    { name: "TEST 9: Multiple Classes", input: '<div class="card featured"><h3>X</h3></div>', checks: [{ cond: "Uses primary class card", check: (f) => hasDeepSlug(f, 'card_title') }] },
    { name: "TEST 10: Form Mapping", input: '<form><label for="e">Email</label><input type="email" id="e" name="e"></form>', checks: [{ cond: "Email type mapped", check: (f) => hasDeepSlug(f, 'e') }] },
    { name: "TEST 11: Duplicate Collision", input: '<div class="card"><h3>A</h3></div><div class="card-alt"><h3>B</h3></div>', checks: [{ cond: "Separated slugs", check: (f) => hasDeepSlug(f, 'card') && hasDeepSlug(f, 'card_alt') }] },
    { name: "TEST 12: Pricing Component", input: '<div class="pricing"><h3>X</h3></div>', checks: [{ cond: "Detected pricing type", check: (f) => { const p = getFieldBySlug(f, 'pricing'); return p && p.componentType === 'pricing'; } }] },
    { name: "TEST 13: Deep Nesting", input: '<div>'.repeat(7) + '<p>P</p>' + '</div>'.repeat(7), checks: [{ cond: "Found deep p", check: (f) => hasDeepSlug(f, 'description') }] },
    { name: "TEST 14: Stress Simulation", input: '<div>'.repeat(10) + '<h1>S</h1>' + '</div>'.repeat(10), checks: [{ cond: "Found stress h1", check: (f) => hasDeepSlug(f, 'title') }] },
    { name: "TEST 15: Static Leakage", input: '<div class="card"><h3>Content</h3></div>', checks: [{ cond: "Content captured", check: (f) => { const t = getFieldBySlug(f, 'card_title'); return t && t.originalContent === 'Content'; } }] },
    { name: "TEST 16: Single H1 Enforcement", input: '<h1>A</h1><h1>B</h1>', checks: [{ cond: "Output contains only one H1", check: (f, out) => (out.match(/<h1/g) || []).length === 1 }, { cond: "Second H1 demoted to H2", check: (f, out) => out.includes('<h2>B</h2>') }] },
    { name: "TEST 17: Heading Normalization", input: '<h1>A</h1><h3>B</h3>', checks: [{ cond: "Fixed skipped hierarchy", check: (f, out) => out.includes('<h2>B</h2>') }] },
    { name: "TEST 18: Anchor Misuse", input: '<a href="#" class="btn">Click</a>', checks: [{ cond: "Converted to button", check: (f, out) => out.includes('<button type="button" class="btn">Click</button>') }] },
    { name: "TEST 19: Image Alt Generation", input: '<section><h2>Title</h2><img src="x.jpg"></section>', checks: [{ cond: "Alt tag generated from heading", check: (f, out) => /alt=["']Title["']/i.test(out) }] },
    { name: "TEST 20: Semantic Wrapper Safety", input: '<div class="hero"><h1>W</h1></div>', checks: [{ cond: "Upgraded to section", check: (f, out) => out.includes('<section') }] },
    { name: "TEST 21: All images have valid alt", input: '<img src="test.jpg">', checks: [{ cond: "Alt tag added with role presentation", check: (f, out) => /alt=["']["']/i.test(out) && /role=["']presentation["']/i.test(out) }] },
    { name: "TEST 22: All inputs have labels", input: '<input type="text" name="user_name">', checks: [{ cond: "aria-label added to input", check: (f, out) => /aria-label=["']user_name["']/i.test(out) }] },
    { name: "TEST 23: No clickable div remains", input: '<div onclick="doSomething()">Click Me</div>', checks: [{ cond: "Clickable div converted to button", check: (f, out) => out.includes('<button type="button"') && out.includes('onclick="doSomething()"') }] },
    { name: "TEST 24: Landmark structure valid", input: '<div>Content</div>', checks: [{ cond: "Main landmark added", check: (f, out) => out.includes('<main id="main-content">') }] },
    { name: "TEST 25: ARIA usage valid & non-redundant", input: '<main role="main"><nav role="navigation">Link</nav></main>', checks: [{ cond: "Removed redundant roles", check: (f, out) => !out.includes('role="main"') && !out.includes('role="navigation"') }] },

    // --- 26-32: STRESS DRILL SCENARIOS ---
    {
        name: "SCENARIO 1: Hero Conflict & Nested H1s",
        input: `<div class="hero"><h1>Main Title</h1><h1>Duplicate Title</h1><ul class="items"><li><h1>Item Heading</h1></li><li><h1>Item Heading 2</h1></li></ul><img src="banner.jpg"><a href="#">Click here</a></div>`,
        checks: [
            { cond: "Only one global H1", check: (f, out) => (out.match(/<h1/g) || []).length === 1 },
            { cond: "Nested H1s demoted in list", check: (f, out) => out.includes('<h2>Item Heading</h2>') },
            { cond: "Hero alt generated", check: (f, out) => /alt=["']Main Title["']/i.test(out) },
            { cond: "Anchor converted to button", check: (f, out) => out.includes('<button type="button"') }
        ]
    },
    {
        name: "SCENARIO 2: Product Card A11y",
        input: `<div class="products"><div class="card"><img src="shoe.jpg" alt=""><h3>Nike Air</h3><div class="buy-btn" onclick="buyNow()">Buy</div></div></div>`,
        checks: [
            { cond: "Converted clickable div to button", check: (f, out) => out.includes('<button type="button" class="buy-btn"') },
            { cond: "Decorative img has alt and role", check: (f, out) => /alt=["']["']/i.test(out) && /role=["']presentation["']/i.test(out) }
        ]
    },
    {
        name: "SCENARIO 3: Deep Structural Boilerplate",
        input: `<div><div><div><div><div><div><section><h2>Deep Content</h2></section></div></div></div></div></div></div>`,
        checks: [
            { cond: "Cleaned redundant wrappers", check: (f, out) => out.split('<div').length < 3 },
            { cond: "Preserved content", check: (f, out) => out.includes('Deep Content') }
        ]
    },
    {
        name: "SCENARIO 4: Form Label & Link Integrity",
        input: `<form class="contact-form"><input type="email"><input type="checkbox"><a href="#">Submit</a></form>`,
        checks: [
            { cond: "Labels added/Aria-labels", check: (f, out) => (out.match(/aria-label/g) || []).length >= 2 },
            { cond: "Anchor in form is button", check: (f, out) => out.includes('<button type="button"') }
        ]
    },
    {
        name: "SCENARIO 5: Semantic Baseline",
        input: `<section><h1>Blog Post Title</h1><p>Article body content here.</p></section>`,
        checks: [
            { cond: "Wraps in main landmark", check: (f, out) => out.includes('<main') }
        ]
    },
    {
        name: "SCENARIO 6: Broken ARIA Conflict",
        input: `<button aria-hidden="true">Submit</button><div role="button">Click Me</div>`,
        checks: [
            { cond: "Fixed hidden interactive", check: (f, out) => !out.includes('aria-hidden="true"') },
            { cond: "Assigned role button or converted div", check: (f, out) => out.includes('<button') }
        ]
    },
    {
        name: "SCENARIO 7: Landmark Nesting Violation",
        input: `<main><main><h1>Title</h1></main></main>`,
        checks: [
            { cond: "Deduplicated main", check: (f, out) => (out.match(/<main/g) || []).length === 1 }
        ]
    }
];

async function runOptimizationQA() {
    let allPassed = true;
    let failCount = 0;

    console.log("=================================================");
    console.log("🚀 FINAL STRESS DRILL & QA Baseline (v3.1.0)");
    console.log("=================================================");

    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        try {
            const seoResult = optimizeSEO(test.input);
            const accResult = optimizeAccessibility(seoResult.html);
            const optimizedHtml = accResult.html;

            const $ = cheerio.load(optimizedHtml);
            const fields = generateFields($);

            let testPassed = true;
            test.checks.forEach(c => {
                if (!c.check(fields, optimizedHtml)) {
                    testPassed = false;
                }
            });

            if (!testPassed) {
                console.log(`\n❌ TEST CASE ${i + 1} FAILED: ${test.name}`);
                allPassed = false;
                failCount++;
                test.checks.forEach(c => {
                    if (!c.check(fields, optimizedHtml)) {
                        console.log(`  ❌ [FAIL] ${c.cond}`);
                    }
                });
                console.log("Optimized HTML:", optimizedHtml);
            } else {
                console.log(`✅ TEST CASE ${i + 1} PASSED`);
            }
        } catch (err) {
            console.error(`💥 CRASH (Test ${i + 1}):`, err.message);
            allPassed = false;
            failCount++;
        }
    }

    console.log("\n=================================================");
    console.log("📊 FINAL PRODUCTION STABILIZATION REPORT");
    console.log("=================================================");
    console.log(`Engine Version: 3.1.0-production-stress`);
    console.log(`Tests Executed: ${tests.length}`);
    console.log(`Pass Count:     ${tests.length - failCount}`);
    console.log(`Fail Count:     ${failCount}`);
    const statusText = allPassed ? "100% PASS - STABILIZED FOR PRODUCTION" : "STABILIZATION REQUIRED";
    console.log(`Final Status:   ${statusText}`);

    if (allPassed) {
        process.exit(0);
    } else {
        process.exit(1);
    }
}

runOptimizationQA();
