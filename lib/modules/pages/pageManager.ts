import fs from 'fs';
import path from 'path';
import { getProject, updateProject } from '@/lib/projectStore';
import { PROJECTS_DIR } from '@/lib/config';

export interface SavePageParams {
    projectId: string;
    pageName: string;
    templateSlug: string;
    templateType: 'full-page' | 'section';
    phpContent: string;
    acfContent: any;
    htmlContent: string;
    assetDependencies: string[];
}

export const savePageToProject = async (params: SavePageParams) => {
    const { projectId, pageName, templateSlug, templateType, phpContent, acfContent, htmlContent, assetDependencies } = params;

    const project = getProject(projectId);
    if (!project) throw new Error('Project not found');

    const themePath = path.join(PROJECTS_DIR, projectId, 'theme');
    const assetsPath = path.join(themePath, 'assets');
    const acfPath = path.join(themePath, 'inc/acf-json');
    const sourcePath = path.join(themePath, 'inc/source-html');

    // 1. Determine File Path & Name based on templateType
    let phpFileName: string;
    let relativeTemplatePath: string;
    let absolutePhpPath: string;

    const slug = templateSlug.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (templateType === 'full-page') {
        phpFileName = `page-${slug}.php`;
        relativeTemplatePath = phpFileName;
        absolutePhpPath = path.join(themePath, phpFileName);
    } else {
        phpFileName = `${slug}.php`;
        const sectionsDir = path.join(themePath, 'template-parts/sections');
        if (!fs.existsSync(sectionsDir)) fs.mkdirSync(sectionsDir, { recursive: true });
        relativeTemplatePath = `template-parts/sections/${phpFileName}`;
        absolutePhpPath = path.join(themePath, relativeTemplatePath);
    }

    // 2. Save PHP Template
    fs.writeFileSync(absolutePhpPath, phpContent);

    // 3. Save ACF JSON
    const acfFileName = `acf-${slug}.json`;
    if (!fs.existsSync(acfPath)) fs.mkdirSync(acfPath, { recursive: true });
    fs.writeFileSync(path.join(acfPath, acfFileName), JSON.stringify(acfContent, null, 2));

    // 4. Save Source HTML
    const htmlFileName = `source-${slug}.html`;
    if (!fs.existsSync(sourcePath)) fs.mkdirSync(sourcePath, { recursive: true });
    fs.writeFileSync(path.join(sourcePath, htmlFileName), htmlContent);

    // 5. Copy Assets (if provided and exist locally)
    if (assetDependencies && assetDependencies.length > 0) {
        if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath, { recursive: true });

        assetDependencies.forEach(asset => {
            // Note: In this environment, we assume assets are relative to the project root or accessible via local path
            // For now, we mirror the filename to the assets folder
            const fileName = asset.split('/').pop();
            if (fileName) {
                const targetPath = path.join(assetsPath, fileName);
                // Placeholder: In a real environment, we'd copy from the source location
                // If the file doesn't exist, we skip for now to avoid crashes
                if (!fs.existsSync(targetPath)) {
                    // fs.copyFileSync(asset, targetPath); // Disabled until source path mapping is refined
                }
            }
        });
    }

    // 6. Update Project State
    const existingPageIndex = project.pages.findIndex((p: any) => p.slug === slug);
    const pageEntry = {
        id: slug,
        name: pageName,
        slug: slug,
        templateType: templateType,
        template: relativeTemplatePath,
        assetDependencies: assetDependencies || [],
        createdAt: existingPageIndex >= 0 ? project.pages[existingPageIndex].createdAt : Date.now(),
        updatedAt: Date.now()
    };

    if (existingPageIndex >= 0) {
        project.pages[existingPageIndex] = pageEntry;
    } else {
        project.pages.push(pageEntry);
    }

    updateProject(project);

    return {
        success: true,
        fileName: phpFileName,
        path: relativeTemplatePath
    };
};
