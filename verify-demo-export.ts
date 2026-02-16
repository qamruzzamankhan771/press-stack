import { buildAndExportProject } from './lib/modules/finalizer';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const projectId = 'demo-project'; // From browser session
const projectDir = path.join(process.cwd(), 'projects', projectId);
const extractDir = path.join(process.cwd(), 'temp_extract_check');

async function run() {
    console.log(`=== EXPORT VERIFICATION: ${projectId} ===`);

    // 1. Run Export
    try {
        console.log('1. Running Export...');
        const zipPath = await buildAndExportProject(projectId);
        console.log(`✅ ZIP file created at: ${zipPath}`);

        // 2. Extract and Check
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        fs.mkdirSync(extractDir);

        console.log('2. Extracting ZIP...');
        execSync(`unzip -q "${zipPath}" -d "${extractDir}"`);

        console.log('3. Validating Contents...');
        const files = fs.readdirSync(extractDir);

        // Expected root files
        const requiredFiles = [
            'content.xml',
            'plugins-manifest.json',
            'acf-export.json',
            'press-stack-theme',
            'README.md'
        ];

        let allGood = true;
        requiredFiles.forEach(f => {
            if (files.includes(f)) {
                console.log(`✅ Found: ${f}`);
            } else {
                console.error(`❌ Missing: ${f}`);
                allGood = false;
            }
        });

        // Theme check
        // Theme check
        const themeDir = path.join(extractDir, 'press-stack-theme');
        if (fs.existsSync(themeDir)) {
            const themeFiles = fs.readdirSync(themeDir);
            ['style.css', 'index.php', 'functions.php'].forEach(f => {
                if (themeFiles.includes(f)) {
                    console.log(`✅ Found Theme File: ${f}`);
                } else {
                    console.error(`❌ Missing Theme File: ${f}`);
                    allGood = false;
                }
            });

            // Check if plugins.php exists
            const incDir = path.join(themeDir, 'inc');
            if (fs.existsSync(path.join(incDir, 'plugins.php'))) {
                console.log('✅ Found: inc/plugins.php');
            } else {
                console.error('❌ Missing: inc/plugins.php');
                allGood = false;
            }

            if (fs.existsSync(path.join(incDir, 'class-tgm-plugin-activation.php'))) {
                console.log('✅ Found: inc/class-tgm-plugin-activation.php');
            } else {
                console.error('❌ Missing: inc/class-tgm-plugin-activation.php');
                allGood = false;
            }

            // Check functions.php content
            const functionsContent = fs.readFileSync(path.join(themeDir, 'functions.php'), 'utf8');
            if (functionsContent.includes("require_once get_template_directory() . '/inc/plugins.php';")) {
                console.log('✅ Approved: functions.php includes plugins.php');
            } else {
                console.error('❌ Error: functions.php missing plugin usage');
                allGood = false;
            }

            // Check if page template exists
            // Based on earlier ls -R, we expect page-home-page.php
            // Wait, compiler saves to root of theme usually? Or wherever configure. Let's check root of theme.
            const pageTemplate = themeFiles.find(f => f.startsWith('page-'));
            if (pageTemplate) {
                console.log(`✅ Found Page Template: ${pageTemplate}`);
            } else {
                console.error(`❌ Missing Page Template in theme root`);
            }
        }

        if (allGood) {
            console.log('\n🌟 VERIFICATION SUCCESSFUL 🌟');
        } else {
            console.error('\n⚠️  VERIFICATION FAILED ⚠️');
            process.exit(1);
        }

    } catch (err) {
        console.error('Test Failed:', err);
        process.exit(1);
    }
}

run();
