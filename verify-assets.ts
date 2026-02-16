import { compileHTML } from './lib/compiler';
import fs from 'fs';
import path from 'path';

const projectId = 'asset-test-project';
const themePath = path.join('projects', projectId, 'theme');
const assetsDir = path.join(themePath, 'assets');
const enqueueFile = path.join(themePath, 'inc', 'enqueue.php');

// Setup: Create dummy assets
const dummyCss = 'dummy-style.css';
const dummyJs = 'dummy-script.js';
fs.writeFileSync(dummyCss, 'body { color: red; }');
fs.writeFileSync(dummyJs, 'console.log("hello");');

async function verifyAssets() {
    console.log('=== ASSET MANAGEMENT VERIFICATION ===\n');

    // 1. Compile HTML with assets
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Asset Test</title>
            <link rel="stylesheet" href="${dummyCss}">
        </head>
        <body>
            <h1>Hello</h1>
            <script src="${dummyJs}"></script>
        </body>
        </html>
    `;

    console.log('1. Compiling Page with Assets...');
    compileHTML(html, 'Asset Test', 'asset-test', 'full-page', projectId);

    // 2. Verify Physical Copy
    console.log('\n2. Verifying Physical Copies:');
    const cssExists = fs.existsSync(path.join(assetsDir, 'css', dummyCss));
    const jsExists = fs.existsSync(path.join(assetsDir, 'js', dummyJs));
    console.log(`- CSS copied: ${cssExists ? '✅' : '❌'}`);
    console.log(`- JS copied: ${jsExists ? '✅' : '❌'}`);

    // 3. Verify Enqueue Registration
    console.log('\n3. Verifying Enqueue Registration:');
    if (fs.existsSync(enqueueFile)) {
        const content = fs.readFileSync(enqueueFile, 'utf8');
        const cssEnqueued = content.includes(`'press-stack-dummy-style'`);
        const jsEnqueued = content.includes(`'press-stack-dummy-script'`);
        console.log(`- CSS enqueued: ${cssEnqueued ? '✅' : '❌'}`);
        console.log(`- JS enqueued: ${jsEnqueued ? '✅' : '❌'}`);

        if (!cssEnqueued || !jsEnqueued) {
            console.log('DEBUG: Enqueue Content:\n', content);
        }
    } else {
        console.log('❌ enqueue.php not found!');
    }

    // 4. Verify Idempotency (Run again)
    console.log('\n4. Verifying Idempotency (Run 2)...');
    compileHTML(html, 'Asset Test', 'asset-test', 'full-page', projectId);

    const contentAfter = fs.readFileSync(enqueueFile, 'utf8');
    const cssCount = (contentAfter.match(/press-stack-dummy-style/g) || []).length;
    console.log(`- CSS enqueue count (should be 1): ${cssCount} ${cssCount === 1 ? '✅' : '❌'}`);

    console.log('\n=== VERIFICATION COMPLETE ===');

    // Cleanup
    fs.unlinkSync(dummyCss);
    fs.unlinkSync(dummyJs);
    // Optional: cleanup project dir? maybe keep for inspection
}

verifyAssets().catch(console.error);
