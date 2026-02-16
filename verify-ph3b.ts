import { compileHTML } from './lib/compiler';
import fs from 'fs';
import path from 'path';

console.log('=== PHASE 3B VALIDATION TEST ===\n');

// Test 1: Full-Page Template (Should Generate Shell)
console.log('TEST 1: Full-Page Template (Should Generate Shell)');
const result1 = compileHTML(
    '<main><p>Test Content</p></main>',
    'Test Page',
    'page-test',
    'full-page',
    'wp-evolved'
);
console.log('✅ Compilation complete\n');

// Verify files exist
const themePath = path.join(process.cwd(), 'projects/wp-evolved/theme');
const functionsPath = path.join(themePath, 'functions.php');
const incPath = path.join(themePath, 'inc');

console.log('VERIFICATION:');
console.log(`- functions.php exists: ${fs.existsSync(functionsPath)}`);
console.log(`- inc/ directory exists: ${fs.existsSync(incPath)}`);

if (fs.existsSync(incPath)) {
    const incFiles = fs.readdirSync(incPath);
    console.log(`- inc/ files: ${incFiles.join(', ')}`);
}

// Test 2: Section (Should NOT Generate Shell)
console.log('\n\nTEST 2: Section Template (Should NOT Generate Shell)');
const beforeCount = fs.existsSync(incPath) ? fs.readdirSync(incPath).length : 0;

const result2 = compileHTML(
    '<div><p>Section Content</p></div>',
    'Test Section',
    'test-section',
    'section',
    'wp-evolved'
);

const afterCount = fs.existsSync(incPath) ? fs.readdirSync(incPath).length : 0;
console.log(`✅ Section compilation complete`);
console.log(`- File count before: ${beforeCount}`);
console.log(`- File count after: ${afterCount}`);
console.log(`- Shell generation triggered: ${afterCount > beforeCount ? '❌ FAIL' : '✅ PASS'}`);

// Test 3: Idempotency (Run again, should not overwrite)
console.log('\n\nTEST 3: Idempotency Check');
if (fs.existsSync(functionsPath)) {
    const originalContent = fs.readFileSync(functionsPath, 'utf8');

    // Run compilation again
    compileHTML(
        '<main><p>Another Page</p></main>',
        'Another Page',
        'page-another',
        'full-page',
        'wp-evolved'
    );

    const newContent = fs.readFileSync(functionsPath, 'utf8');
    console.log(`- Content unchanged: ${originalContent === newContent ? '✅ PASS' : '❌ FAIL'}`);
}

console.log('\n=== VALIDATION COMPLETE ===');
