import fs from 'fs';
import path from 'path';
import { PROJECTS_DIR } from '@/lib/config';

/**
 * Asset Registry Module
 * 
 * Responsibilities:
 * 1. Physically copy assets from source to theme/assets/
 * 2. Update inc/enqueue.php to register new scripts/styles
 * 3. Ensure idempotency (prevent duplicate copies/enqueues)
 */

export function registerAssets(projectId: string, assets: string[]) {
    if (!assets || assets.length === 0) return;

    const themePath = path.join(PROJECTS_DIR, projectId, 'theme');
    const assetsDir = path.join(themePath, 'assets');
    const enqueueFile = path.join(themePath, 'inc', 'enqueue.php');

    // Ensure assets directories exist
    ['css', 'js', 'img'].forEach(dir => {
        fs.mkdirSync(path.join(assetsDir, dir), { recursive: true });
    });

    let enqueueContent = fs.existsSync(enqueueFile) ? fs.readFileSync(enqueueFile, 'utf8') : '';
    let enqueueUpdated = false;

    assets.forEach(assetPath => {
        const fileName = path.basename(assetPath);
        const ext = path.extname(assetPath).toLowerCase();

        // 1. Physical Copy
        let targetSubDir = '';
        if (['.css'].includes(ext)) targetSubDir = 'css';
        else if (['.js'].includes(ext)) targetSubDir = 'js';
        else targetSubDir = 'img'; // Default to img for now, or root? transformAssets puts images in root of assets based on 'assets/' base, but typical WP is assets/images. 
        // Re-reading compiler.ts: wpBase = ".../assets/"; so images are in assets/. 
        // But for organization, let's put them in assets/img/ if possible, BUT compiler.ts rewrites to assets/filename. 
        // To match compiler.ts exactly:
        // images -> assets/
        // js -> assets/js/
        // css -> assets/css/
        //
        // WAIT. compiler.ts: 
        // Images: $el.attr('src', wpBase + fileName); -> projects/theme/assets/filename
        // Scripts: $el.attr('src', wpBase + 'js/' + fileName); -> projects/theme/assets/js/filename
        // Styles: $el.attr('href', wpBase + 'css/' + fileName); -> projects/theme/assets/css/filename

        let targetDir = assetsDir;
        if (targetSubDir === 'js') targetDir = path.join(assetsDir, 'js');
        if (targetSubDir === 'css') targetDir = path.join(assetsDir, 'css');
        // images go to root of assetsDir based on compiler.ts logic

        const targetPath = path.join(targetDir, fileName);

        // Copy file if it exists in source (relative to CWD) and doesn't exist in target
        // We assume assetPath is relative to CWD.
        if (fs.existsSync(assetPath)) {
            if (!fs.existsSync(targetPath)) {
                fs.copyFileSync(assetPath, targetPath);
                console.log(`[AssetRegistry] Copied ${assetPath} -> ${targetPath}`);
            }
        } else {
            console.warn(`[AssetRegistry] Source asset not found: ${assetPath}`);
        }

        // 2. Enqueue Registration (CSS/JS only)
        if (targetSubDir === 'css' || targetSubDir === 'js') {
            const handle = `press-stack-${path.parse(fileName).name}`;

            // Check for existence in enqueue.php
            if (!enqueueContent.includes(`'${handle}'`)) {
                const enqueueCode = generateEnqueueCode(handle, fileName, targetSubDir);
                // Insert before the closing function brace or at the end of the function
                // Regex to match the closing brace of the function (indented with 4 spaces)
                // followed by the closing brace of the if block
                const closingPattern = /(\n\s{4}}\n)/;

                if (closingPattern.test(enqueueContent)) {
                    enqueueContent = enqueueContent.replace(closingPattern, (match) => {
                        // match is the closing brace (indented)
                        // We want to insert BEFORE it.
                        return `${enqueueCode}${match}`;
                    });
                    enqueueUpdated = true;
                    console.log(`[AssetRegistry] Injected ${targetSubDir} handle: ${handle}`);
                } else {
                    console.warn(`[AssetRegistry] Could not find insertion point in enqueue.php for ${handle}`);
                }
            }
        }
    });

    if (enqueueUpdated) {
        fs.writeFileSync(enqueueFile, enqueueContent, 'utf8');
        console.log(`[AssetRegistry] Updated enqueue.php`);
    }
}

function generateEnqueueCode(handle: string, fileName: string, type: 'css' | 'js'): string {
    if (type === 'css') {
        return `
        // Auto-enqueued style: ${fileName}
        wp_enqueue_style(
            '${handle}',
            get_template_directory_uri() . '/assets/css/${fileName}',
            array(),
            wp_get_theme()->get('Version')
        );
`;
    } else {
        return `
        // Auto-enqueued script: ${fileName}
        wp_enqueue_script(
            '${handle}',
            get_template_directory_uri() . '/assets/js/${fileName}',
            array(),
            wp_get_theme()->get('Version'),
            true
        );
`;
    }
}
