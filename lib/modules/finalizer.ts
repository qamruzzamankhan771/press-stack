import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { PROJECTS_DIR } from '@/lib/config';
import { generateWXR } from './wxrGenerator';
import { ensureThemeShell } from './theme/themeShellGenerator';
import { getProject } from '@/lib/projectStore';
import { SUPPORTED_PLUGINS } from './plugins/pluginRegistry';
import { generatePluginActivation } from './pluginActivationGenerator';

/**
 * Builds and Exports the project as a downloadable ZIP.
 * 
 * Process:
 * 1. Creates a temp build directory.
 * 2. Copies theme assets and files.
 * 3. Validates/Generates required WP files (style.css, index.php).
 * 4. Generates WXR content import.
 * 5. Zips the result.
 * 6. Cleans up.
 */
export async function buildAndExportProject(projectId: string): Promise<string> {
    const project = getProject(projectId);
    if (!project) {
        throw new Error(`Project ${projectId} not found`);
    }

    const projectPath = path.join(PROJECTS_DIR, projectId);
    const themePath = path.join(projectPath, 'theme');

    // Temp Build Paths
    const buildId = `build-${Date.now()}`;
    const buildDir = path.join(projectPath, buildId);
    const themeBuildDir = path.join(buildDir, 'press-stack-theme');
    const zipPath = path.join(projectPath, 'press-stack-theme.zip');

    try {
        // 1. Setup Build Directory
        fs.mkdirSync(themeBuildDir, { recursive: true });

        // 2. Assembly: Copy Theme Files
        if (fs.existsSync(themePath)) {
            fs.cpSync(themePath, themeBuildDir, { recursive: true });
        } else {
            // Ensure minimal shell if theme dir doesn't exist (edge case)
            ensureThemeShell(projectId);
            fs.cpSync(themePath, themeBuildDir, { recursive: true });
        }

        // 3. Validation & Generation
        validateAndFixThemeFiles(themeBuildDir);
        generateExtras(projectId, buildDir, project);

        // 4. Create ZIP
        await createZip(buildDir, zipPath);

        return zipPath;
    } catch (error) {
        console.error('Export failed:', error);
        throw error;
    } finally {
        // 5. Cleanup
        if (fs.existsSync(buildDir)) {
            fs.rmSync(buildDir, { recursive: true, force: true });
        }
    }
}

function validateAndFixThemeFiles(themeDir: string) {
    // Check style.css
    const styleCss = path.join(themeDir, 'style.css');
    if (!fs.existsSync(styleCss)) {
        fs.writeFileSync(styleCss, `/*
Theme Name: Press Stack Theme
Author: Press Stack
Version: 1.0.0
*/`, 'utf8');
    }

    // Check index.php
    const indexPhp = path.join(themeDir, 'index.php');
    if (!fs.existsSync(indexPhp)) {
        fs.writeFileSync(indexPhp, `<?php
// Silence is golden.
`, 'utf8');
    }
}

function generateExtras(projectId: string, buildDir: string, project: any) {
    // Generate WXR content.xml using Project Pages
    // Map project pages to WXR format
    const wxrPages = project.pages.map((p: any) => ({
        title: p.name,
        slug: p.slug,
        template: p.template
    }));

    // Add a default Home if none exists
    if (wxrPages.length === 0) {
        wxrPages.push({ title: 'Home', slug: 'home', template: 'page-home.php' });
    }

    const wxrContent = generateWXR(wxrPages);
    fs.writeFileSync(path.join(buildDir, 'content.xml'), wxrContent);

    // Generate Plugins Manifest from Project Plugins
    const requiredPlugins = project.plugins.map((pluginId: string) => {
        const p = SUPPORTED_PLUGINS.find(sp => sp.id === pluginId);
        return p ? { name: p.name, slug: p.id, url: 'https://wordpress.org/plugins/' + p.id } : null;
    }).filter(Boolean);

    // Always ensure ACF is required if not selected (logic check, or just add it)
    if (!requiredPlugins.find((p: any) => p.name.includes('Advanced Custom Fields'))) {
        requiredPlugins.push({ name: 'Advanced Custom Fields PRO', url: 'https://www.advancedcustomfields.com/' });
    }

    const plugins = {
        required: requiredPlugins,
        recommended: [
            { name: 'Classic Editor', slug: 'classic-editor' }
        ]
    };
    fs.writeFileSync(path.join(buildDir, 'plugins-manifest.json'), JSON.stringify(plugins, null, 2));

    // NEW: Generate inc/plugins.php for Admin Notices & TGMPA
    const themeIncDir = path.join(buildDir, 'press-stack-theme', 'inc');
    if (!fs.existsSync(themeIncDir)) {
        fs.mkdirSync(themeIncDir, { recursive: true });
    }

    // Copy TGMPA class
    const tgmSource = path.join(process.cwd(), 'lib/resources/class-tgm-plugin-activation.php');
    if (fs.existsSync(tgmSource)) {
        fs.copyFileSync(tgmSource, path.join(themeIncDir, 'class-tgm-plugin-activation.php'));
    } else {
        console.warn('TGMPA class not found at', tgmSource);
        // Fallback: The generator will still reference it, so this will cause a fatal error if missing.
        // We should probably fail loud or handle this.
    }

    const pluginsPhpContent = generatePluginActivation(project.plugins);
    fs.writeFileSync(path.join(themeIncDir, 'plugins.php'), pluginsPhpContent);

    // Update functions.php to include plugins.php
    const functionsPhpPath = path.join(buildDir, 'press-stack-theme', 'functions.php');
    if (fs.existsSync(functionsPhpPath)) {
        let functionsContent = fs.readFileSync(functionsPhpPath, 'utf8');
        if (!functionsContent.includes("require_once get_template_directory() . '/inc/plugins.php';")) {
            functionsContent += "\n\n// Plugin Dependencies\nrequire_once get_template_directory() . '/inc/plugins.php';";
            fs.writeFileSync(functionsPhpPath, functionsContent);
        }
    }

    // Generate ACF Export
    // Aggregate all JSON files from theme/inc/acf-json into one file
    const themeAcfDir = path.join(PROJECTS_DIR, projectId, 'theme', 'inc', 'acf-json');
    if (fs.existsSync(themeAcfDir)) {
        const acfFiles = fs.readdirSync(themeAcfDir).filter(f => f.endsWith('.json'));
        const acfGroups: any[] = [];

        acfFiles.forEach(file => {
            try {
                const content = fs.readFileSync(path.join(themeAcfDir, file), 'utf8');
                const json = JSON.parse(content);
                if (Array.isArray(json)) {
                    acfGroups.push(...json);
                } else {
                    acfGroups.push(json);
                }
            } catch (e) {
                console.warn(`[Finalizer] Failed to parse ACF JSON: ${file}`);
            }
        });

        if (acfGroups.length > 0) {
            fs.writeFileSync(path.join(buildDir, 'acf-export.json'), JSON.stringify(acfGroups, null, 2));
        }
    }

    // Generate README.md with Instructions
    const readmeContent = `# Press Stack Theme Export

Thank you for building with Press Stack!

## Installation Instructions

1. **Theme Installation**
   - Unzip this package.
   - Upload the \`press-stack-theme\` folder to your WordPress site's \`wp-content/themes/\` directory.
   - Alternatively, ZIP the \`press-stack-theme\` folder and upload it via **Appearance > Themes > Add New**.
   - Activate the "Press Stack Theme".

2. **Plugin Activation**
   - Upon activation, you will see a notice in the WordPress Dashboard prompting you to install required plugins.
   - **One-Click Install**: Click "Begin installing plugins" in the notice to automatically download and activate all required plugins (ACF Pro, Rank Math, etc.) from the WordPress repository.

3. **Content Import (Optional)**
   - To import your pages:
   - Go to **Tools > Import > WordPress**.
   - Install the importer if needed.
   - Upload the \`content.xml\` file found in this folder.

4. **ACF Field Groups (Important)**
   - To restore your field definitions:
   - Go to **ACF > Tools > Import**.
   - Upload the \`acf-export.json\` file.
   - This ensures all your custom fields are correctly configured.

## Support
For issues with the theme, please refer to the Press Stack documentation.
`;
    fs.writeFileSync(path.join(buildDir, 'README.md'), readmeContent);
}

function createZip(sourceDir: string, outPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(output);
        archive.directory(sourceDir, false);
        archive.finalize();
    });
}
