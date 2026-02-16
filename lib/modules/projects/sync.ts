import fs from 'fs';
import path from 'path';
import { PROJECTS_DIR } from '@/lib/config';
import { getProject, updateProject, ProjectState } from '@/lib/projectStore';

export interface IntegrityReport {
    projectId: string;
    synchronizedPages: number;
    removedDeadReferences: string[];
    missingFiles: string[];
    fixed: boolean;
}

export const syncProjectState = async (projectId: string): Promise<IntegrityReport> => {
    const project = getProject(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

    const themePath = path.join(PROJECTS_DIR, projectId, 'theme');
    const sectionsPath = path.join(themePath, 'template-parts/sections');

    const report: IntegrityReport = {
        projectId,
        synchronizedPages: 0,
        removedDeadReferences: [],
        missingFiles: [],
        fixed: false
    };

    // 1. Scan actual files on disk
    const pageFiles = fs.existsSync(themePath) ? fs.readdirSync(themePath).filter(f => f.startsWith('page-') && f.endsWith('.php')) : [];
    const sectionFiles = fs.existsSync(sectionsPath) ? fs.readdirSync(sectionsPath).filter(f => f.endsWith('.php')) : [];

    // 2. Cross-reference with Project State
    const validPages: any[] = [];

    project.pages.forEach(page => {
        const absolutePath = path.join(themePath, page.template);
        if (fs.existsSync(absolutePath)) {
            validPages.push(page);
            report.synchronizedPages++;
        } else {
            report.removedDeadReferences.push(page.slug);
        }
    });

    // 3. Find "Untracked" files (Recover)
    // Pages
    pageFiles.forEach(file => {
        const isTracked = project.pages.some(p => p.template === file);
        if (!isTracked) {
            const slug = file.replace('page-', '').replace('.php', '');
            validPages.push({
                id: slug,
                name: `Recovered: ${slug}`,
                slug: slug,
                templateType: 'full-page',
                template: file,
                assetDependencies: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            report.synchronizedPages++;
        }
    });

    // Sections
    sectionFiles.forEach(file => {
        const relativePath = `template-parts/sections/${file}`;
        const isTracked = project.pages.some(p => p.template === relativePath);
        if (!isTracked) {
            const slug = file.replace('.php', '');
            validPages.push({
                id: slug,
                name: `Recovered Section: ${slug}`,
                slug: slug,
                templateType: 'section',
                template: relativePath,
                assetDependencies: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            report.synchronizedPages++;
        }
    });

    // 4. Update project if changes occurred
    if (report.removedDeadReferences.length > 0 || validPages.length !== project.pages.length) {
        project.pages = validPages;
        updateProject(project);
        report.fixed = true;
    }

    return report;
};
