import { compileHTML } from './lib/compiler';
import fs from 'fs';
import path from 'path';

async function verifyPhase3A() {
    console.log('--- PHASE 3A VERIFICATION ---');

    const projectId = 'wp-evolved'; // Target project
    const html = `
        <!DOCTYPE html>
        <html>
        <head><title>Test</title></head>
        <body>
            <header class="site-header">
                <nav>Global Nav</nav>
            </header>
            <main>
                <h1>Page Content</h1>
                <p>Welcome to Phase 3A.</p>
            </main>
            <footer class="site-footer">
                <p>Global Footer</p>
            </footer>
        </body>
        </html>
    `;

    console.log('1. Compiling Full Page with Extraction...');
    const result = compileHTML(html, 'Phase 3A Test', 'phase-3a-test', 'full-page', projectId);

    console.log('\n2. Checking Extraction Result:');
    console.log('   - Header Extracted:', result.headerExtracted);
    console.log('   - Footer Extracted:', result.footerExtracted);

    console.log('\n3. Checking PHP Output for WP Loop and Layout Calls:');
    const hasHeaderCall = result.php.includes('get_header();');
    const hasFooterCall = result.php.includes('get_footer();');
    const hasLoop = result.php.includes('while (have_posts()) : the_post();');

    console.log('   - get_header():', hasHeaderCall ? 'YES' : 'NO');
    console.log('   - get_footer():', hasFooterCall ? 'YES' : 'NO');
    console.log('   - WP Loop:', hasLoop ? 'YES' : 'NO');

    // 4. Verify Files on Disk
    const themePath = path.join('projects', projectId, 'theme');
    const headerPath = path.join(themePath, 'header.php');
    const footerPath = path.join(themePath, 'footer.php');

    console.log('\n4. Verifying Files on Disk:');
    console.log('   - header.php exists:', fs.existsSync(headerPath));
    console.log('   - footer.php exists:', fs.existsSync(footerPath));

    if (fs.existsSync(headerPath)) {
        const headerContent = fs.readFileSync(headerPath, 'utf8');
        console.log('   - header.php includes wp_head():', headerContent.includes('wp_head()'));
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

verifyPhase3A().catch(console.error);
