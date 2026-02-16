import { savePageToProject } from './lib/modules/pages/pageManager';
import { syncProjectState } from './lib/modules/projects/sync';
import fs from 'fs';
import path from 'path';
import { PROJECTS_DIR } from './lib/config';

async function testPhase15() {
    const projectId = 'wp-evolved';
    console.log('--- Phase 1.5 Test Start ---');

    // 1. Test Saving
    console.log('Saving test page...');
    await savePageToProject({
        projectId,
        pageName: 'Audit Page',
        templateSlug: 'audit',
        templateType: 'full-page',
        phpContent: '<?php // Audit Template',
        acfContent: { fields: [] },
        htmlContent: '<h1>Audit</h1>',
        assetDependencies: []
    });

    const expectedPhp = path.join(PROJECTS_DIR, projectId, 'theme/templates/template-audit.php');
    if (fs.existsSync(expectedPhp)) {
        console.log('✅ PHP template saved to correct WP path.');
    } else {
        console.log('❌ PHP template missing from WP path.');
    }

    // 2. Test Sync (Healthy)
    console.log('Running sync on healthy state...');
    const report1 = await syncProjectState(projectId);
    console.log('Report 1 (Fixed):', report1.fixed);
    console.log('Pages Count:', report1.synchronizedPages);

    // 3. Test Sync (Broken - Manually delete file)
    console.log('Deleting file to break state...');
    fs.unlinkSync(expectedPhp);

    console.log('Running sync on broken state...');
    const report2 = await syncProjectState(projectId);
    console.log('Report 2 (Fixed):', report2.fixed);
    console.log('Removed references:', report2.removedDeadReferences);

    if (report2.removedDeadReferences.includes('audit')) {
        console.log('✅ syncProjectState correctly purged dead reference.');
    } else {
        console.log('❌ syncProjectState failed to detect missing file.');
    }

    console.log('--- Phase 1.5 Test End ---');
}

testPhase15().catch(console.error);
