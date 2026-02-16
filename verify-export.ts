import { buildAndExportProject } from './lib/modules/finalizer';
import fs from 'fs';
import path from 'path';
import { ensureThemeShell } from './lib/modules/theme/themeShellGenerator';

const projectId = 'export-test-project';
const projectDir = path.join('projects', projectId);

// Setup: Ensure project and theme shell exist
if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir, { recursive: true });
}
ensureThemeShell(projectId);

// Setup: Add dummy ACF JSON
const acfDir = path.join(projectDir, 'theme', 'inc', 'acf-json');
if (!fs.existsSync(acfDir)) fs.mkdirSync(acfDir, { recursive: true });
fs.writeFileSync(path.join(acfDir, 'group_test.json'), JSON.stringify({
    key: 'group_test',
    title: 'Test Group',
    fields: []
}));

async function verifyExport() {
    console.log('=== EXPORT VERIFICATION ===\n');

    console.log('1. Running Export...');
    const zipPath = await buildAndExportProject(projectId);
    console.log(`Exported to: ${zipPath}`);

    // 2. Verify ZIP Existence
    if (fs.existsSync(zipPath)) {
        console.log('✅ ZIP file created.');
    } else {
        console.error('❌ ZIP file missing.');
        process.exit(1);
    }

    // 3. Verify Cleanup (no build- folders)
    const files = fs.readdirSync(projectDir);
    const buildFolders = files.filter(f => f.startsWith('build-'));
    if (buildFolders.length === 0) {
        console.log('✅ Build directory cleaned up.');
    } else {
        console.error('❌ Build directory NOT cleaned up:', buildFolders);
    }

    // 4. Verify Idempotency (Run again)
    console.log('\n2. Running Export Again (Idempotency)...');
    const zipPath2 = await buildAndExportProject(projectId);
    if (fs.existsSync(zipPath2)) {
        console.log('✅ Second export successful.');
    }

    console.log('\n=== VERIFICATION COMPLETE ===');

    // Cleanup ZIPs
    // fs.unlinkSync(zipPath);
    // fs.unlinkSync(zipPath2); // zipPath2 is same as zipPath usually, or overwritten
}

verifyExport().catch(console.error);
