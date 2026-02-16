import { compileHTML } from './lib/compiler';
import { savePageToProject } from './lib/modules/pages/pageManager';
import { syncProjectState } from './lib/modules/projects/sync';
import { getProject, createProject } from './lib/projectStore';
import fs from 'fs';
import path from 'path';

async function validate() {
    console.log('--- PHASE 2 HARD VALIDATION ---');

    const projectId = 'val-project-' + Date.now();
    createProject('Validation Project', 'basic');
    // Note: createProject returns the project, but we need to ensure it's written and reloadable.

    const html = `
        <section class="hero">
            <img src="assets/img/logo.png" alt="Logo">
            <script src="js/main.js"></script>
            <link rel="stylesheet" href="css/style.css">
            <main>
                <h1>Hello World</h1>
                <img src="assets/img/logo.png" alt="Duplicate Logo">
                <a href="https://google.com">External</a>
            </main>
        </section>
    `;

    // 1. Idempotency Test (x3)
    console.log('\n1. Idempotency Test...');
    for (let i = 1; i <= 3; i++) {
        const result = compileHTML(html, 'Test Template', 'idem-test', 'full-page');
        await savePageToProject({
            projectId: 'wp-evolved', // Using existing project for simplicity in test
            pageName: 'Idempotency Test',
            templateSlug: 'idem-test',
            templateType: 'full-page',
            phpContent: result.php,
            acfContent: result.acf,
            htmlContent: html,
            assetDependencies: result.assets
        });
        console.log(`   - Pass ${i} complete.`);
    }

    const project = getProject('wp-evolved');
    const page = project?.pages.find(p => p.slug === 'idem-test');
    console.log('   - Assets tracked:', page?.assetDependencies.length);
    console.log('   - Assets content:', JSON.stringify(page?.assetDependencies));

    // 2. Section Wrapping Check
    console.log('\n2. Section Wrapping Check...');
    const sectionResult = compileHTML('<div class="box">Content</div>', 'My Section', 'my-section', 'section');
    console.log('   - PHP Header present:', sectionResult.php.includes('Template Name:'));
    console.log('   - Main tag present:', sectionResult.php.includes('<main'));

    // 3. Slug Mutability
    console.log('\n3. Slug Mutability...');
    await savePageToProject({
        projectId: 'wp-evolved',
        pageName: 'Original Slug',
        templateSlug: 'orig-slug',
        templateType: 'full-page',
        phpContent: '<?php // hello ?>',
        acfContent: {},
        htmlContent: '<div></div>',
        assetDependencies: []
    });

    // Change slug
    await savePageToProject({
        projectId: 'wp-evolved',
        pageName: 'New Slug',
        templateSlug: 'new-slug',
        templateType: 'full-page',
        phpContent: '<?php // hello ?>',
        acfContent: {},
        htmlContent: '<div></div>',
        assetDependencies: []
    });

    const refreshed = getProject('wp-evolved');
    console.log('   - Page count after slug change:', refreshed?.pages.length);
    console.log('   - Slugs present:', refreshed?.pages.map(p => p.slug).join(', '));

    console.log('\n--- VALIDATION COMPLETE ---');
}

validate().catch(console.error);
